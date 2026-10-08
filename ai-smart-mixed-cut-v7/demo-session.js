// Local demo coordination only; production tasks continue on the platform backend.
const EDITOR_LOCK = 'mixed-cut-v7-editor';
const HANDOFF_CHANNEL = EDITOR_LOCK + '-handoff';
const noop = () => {};
let sequence = 0;

/** Dependency injection keeps the handoff protocol testable without browser state. */
export function createEditingSessionManager(dependencies = {}) {
  const locks = 'locks' in dependencies ? dependencies.locks : globalThis.navigator?.locks;
  const eventTarget = dependencies.eventTarget ?? globalThis.window;
  const repeat = dependencies.setInterval ?? globalThis.setInterval;
  const stopRepeat = dependencies.clearInterval ?? globalThis.clearInterval;
  const makeChannel = 'createChannel' in dependencies ? dependencies.createChannel :
    (typeof globalThis.BroadcastChannel === 'function' ? name => new BroadcastChannel(name) : null);

  async function claimEditingSession({ onWaiting } = {}) {
    if (typeof locks?.request !== 'function') {
      return { writable: true, release: noop, setYieldHandler: noop, concurrencyProtected: false, reason: 'locks-unavailable' };
    }

    const requestId = globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + '-' + (++sequence) + '-' + Math.random().toString(36).slice(2);
    const controller = new AbortController();
    let channel = null, timer = null, active = false, waiting = false, closed = false;
    let yieldHandler = null, pendingRequest = false, checkingYield = false, handedOff = false;
    let finishHeld = noop, finishResult, resultFinished = false;
    const result = new Promise(resolve => { finishResult = resolve; });
    const complete = value => {
      if (resultFinished) return;
      resultFinished = true;
      finishResult(value);
    };
    const stopBroadcasting = () => {
      if (timer !== null) stopRepeat(timer);
      timer = null;
    };
    const cleanup = () => {
      stopBroadcasting();
      channel?.close();
      channel = null;
      eventTarget?.removeEventListener?.('pagehide', onPageHide);
    };
    const unavailable = reason => {
      closed = true;
      waiting = false;
      cleanup();
      complete({ writable: false, release: noop, setYieldHandler: noop, concurrencyProtected: true, reason });
    };
    function onPageHide() {
      closed = true;
      waiting = false;
      controller.abort();
      cleanup();
      if (!active) unavailable('page-closed');
      // Do not release a granted lock here: only document destruction or explicit
      // release may end ownership. A hidden or cached page must not retain a writer.
    }
    async function tryYield() {
      if (!active || closed || handedOff || checkingYield || !pendingRequest || !yieldHandler) return;
      checkingYield = true;
      try {
        // Discard late broadcasts from requesters which have already left the queue.
        if (typeof locks.query === 'function') {
          const snapshot = await locks.query();
          if (!snapshot.pending?.some(lock => lock.name === EDITOR_LOCK)) {
            pendingRequest = false;
            return;
          }
        }
        if (!active || closed || handedOff) return;
        // The application must synchronously disable old editing and start navigation
        // before returning true. Never release here: the old document still owns JS.
        handedOff = (await yieldHandler()) === true;
      } catch {
        // Keep ownership if readiness or navigation cannot be established safely.
      } finally {
        checkingYield = false;
      }
    }
    try {
      channel = typeof makeChannel === 'function' ? makeChannel(HANDOFF_CHANNEL) : null;
      if (channel) channel.onmessage = event => {
        if (event.data?.type !== 'request-yield' || event.data.requestId === requestId) return;
        if (!active || closed) return;
        pendingRequest = true;
        void tryYield();
      };
    } catch { channel = null; }
    eventTarget?.addEventListener?.('pagehide', onPageHide, { once: true });

    async function holdLock(lock) {
      if (!lock || closed) return;
      active = true;
      waiting = false;
      stopBroadcasting();
      const held = new Promise(resolve => { finishHeld = resolve; });
      complete({
        writable: true,
        concurrencyProtected: true,
        setYieldHandler(handler) {
          yieldHandler = typeof handler === 'function' ? handler : null;
          void tryYield();
        },
        release() {
          if (!active) return;
          active = false;
          closed = true;
          cleanup();
          finishHeld();
        },
      });
      await held;
    }
    const requestTransfer = () => {
      if (!waiting || closed) return;
      try { channel?.postMessage({ type: 'request-yield', requestId }); } catch { /* Queue still works without messaging. */ }
    };

    // An initial non-blocking attempt avoids a waiting flash for the first editor.
    let decideInitial;
    const initial = new Promise(resolve => { decideInitial = resolve; });
    try {
      Promise.resolve(locks.request(EDITOR_LOCK, { mode: 'exclusive', ifAvailable: true }, lock => {
        decideInitial(Boolean(lock));
        return holdLock(lock);
      })).catch(() => { decideInitial(false); unavailable(closed ? 'page-closed' : 'lock-request-failed'); });
    } catch { decideInitial(false); unavailable('lock-request-failed'); }
    const acquired = await initial;
    if (acquired || closed) return result;

    waiting = true;
    try { onWaiting?.({ canRequestTransfer: Boolean(channel) }); } catch { /* A status callback does not change ownership. */ }
    try {
      // The browser queue decides ownership for multiple requesting pages. No steal.
      Promise.resolve(locks.request(EDITOR_LOCK, { mode: 'exclusive', signal: controller.signal }, holdLock))
        .catch(() => unavailable(closed ? 'page-closed' : 'lock-request-failed'));
      requestTransfer();
      if (waiting && channel) timer = repeat(requestTransfer, 1000);
    } catch { unavailable('lock-request-failed'); }
    return result;
  }

  return { claimEditingSession };
}

export async function claimEditingSession(options = {}) {
  return createEditingSessionManager().claimEditingSession(options);
}
