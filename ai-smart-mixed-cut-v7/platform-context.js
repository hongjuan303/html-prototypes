// Shared, read-only context for the local prototype. No real account or wallet is connected.
export const MIXED_CUT_STORAGE_KEY = 'mixed-cut-v7-demo';

export const platformAccount = Object.freeze({
  id: 'wanxiang-demo-account',
  name: '陈剪辑',
  team: '内容创作团队',
  simulated: true,
});

const DEFAULT_BALANCE = 10000;
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isAmount = value => typeof value === 'number' && Number.isFinite(value);

function availableStorage(storage) {
  if (storage !== undefined) return storage;
  try { return globalThis.localStorage; } catch { return null; }
}

/** Return a detached usage snapshot without migrating, updating, or creating storage. */
export function readPlatformUsage(storage) {
  let state = null;
  try {
    const raw = availableStorage(storage)?.getItem(MIXED_CUT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (isRecord(parsed)) state = parsed;
  } catch { /* Storage restrictions or malformed demo data use the empty snapshot. */ }

  const balance = isAmount(state?.balance) && state.balance >= 0 ? state.balance : DEFAULT_BALANCE;
  const ledger = (Array.isArray(state?.ledger) ? state.ledger : [])
    .filter(entry => isRecord(entry) && isAmount(entry.points))
    .map(entry => {
      const record = { points: entry.points };
      for (const key of ['id', 'batch', 'type', 'at']) {
        if (typeof entry[key] === 'string') record[key] = entry[key];
      }
      if (isAmount(entry.settled) && entry.settled >= 0) record.settled = entry.settled;
      return record;
    });
  const frozen = (Array.isArray(state?.batches) ? state.batches : []).reduce((sum, batch) => {
    const amount = batch?.cost?.frozen;
    if (!isAmount(amount) || amount < 0 || !Number.isFinite(sum + amount)) return sum;
    return sum + amount;
  }, 0);

  const settled = (Array.isArray(state?.batches) ? state.batches : []).reduce((sum, batch) => sum + (isAmount(batch?.cost?.production) ? batch.cost.production : 0), 0) + ledger.filter(l => l.type === '新增剧集分析').reduce((sum,l) => sum - l.points, 0);
  return { balance, ledger, frozen, settled, simulated: true };
}

/** Subscribe to another tab's changes and refresh on focus; call the returned function to stop. */
export function subscribePlatformUsage(listener, { eventTarget = globalThis.window, storage } = {}) {
  if (typeof listener !== 'function') throw new TypeError('A usage listener is required');
  if (!eventTarget?.addEventListener || !eventTarget?.removeEventListener) return () => {};

  const refresh = () => listener(readPlatformUsage(storage));
  const onStorage = event => {
    // A null key represents localStorage.clear(), which also removes the demo record.
    if (event.key !== MIXED_CUT_STORAGE_KEY && event.key !== null) return;
    const source = availableStorage(storage);
    if (event.storageArea && source && event.storageArea !== source) return;
    refresh();
  };
  eventTarget.addEventListener('storage', onStorage);
  eventTarget.addEventListener('focus', refresh);

  let subscribed = true;
  return () => {
    if (!subscribed) return;
    subscribed = false;
    eventTarget.removeEventListener('storage', onStorage);
    eventTarget.removeEventListener('focus', refresh);
  };
}
