/* Drama library projection. Only registerDrama writes to state.dramas;
 * listDramas/findDrama are pure reads and never touch the wallet or catalogs.
 */
import {assetKey, clone} from './engine.js?v=20260916-publish1';
import {resolveSource} from './sources.js?v=20260916-publish1';
import {getOutputSync, outputVersion} from './sync-model.js?v=20260916-publish1';

const array = value => Array.isArray(value) ? value : [];
const stamp = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : '';
const latest = (...values) => values.map(stamp).filter(Boolean).sort((a, b) => Date.parse(b) - Date.parse(a))[0] || '';
const records = state => Array.isArray(state?.dramas) ? state.dramas : Object.values(state?.dramas || {});

/** File versions and analysis languages belong to a drama, not its identity. */
export function dramaKey(config = {}) {
  const source = config?.source || {kind: 'sample'};
  if (source.kind === 'green') return JSON.stringify(['green', source.market || 'unknown', source.collectionId || 'unknown']);
  if (source.kind === 'manual') return JSON.stringify(['manual', source.assetId || 'legacy-manual']);
  if (!source.kind || source.kind === 'sample') return JSON.stringify(['sample', source.assetId || 'default']);
  return JSON.stringify([source.kind, source.assetId || source.collectionId || 'unknown']);
}

function sourceFor(config) {
  const configured = config?.source || {};
  const resolved = resolveSource(config);
  const source = {...(resolved || {}), ...configured};
  source.title = configured.title || resolved?.title || config?.title || '未命名剧目';
  source.totalEpisodes = Math.max(0, Number(source.totalEpisodes) || 0);
  source.availableEpisodes = [...new Set(array(source.availableEpisodes).filter(id => Number.isInteger(id) && id > 0 && (!source.totalEpisodes || id <= source.totalEpisodes)))];
  return source;
}

/** Persist a selected drama. touch:false migrates without faking new activity. */
export function registerDrama(state, config, {touch = true} = {}) {
  if (!state || !config || typeof config !== 'object') return null;
  const id = dramaKey(config);
  const previous = records(state).find(item => item?.config && dramaKey(item.config) === id);
  const now = new Date().toISOString();
  const entry = {
    id,
    title: sourceFor(config).title,
    config: clone(config),
    createdAt: stamp(previous?.createdAt) || now,
    updatedAt: touch ? now : stamp(previous?.updatedAt) || stamp(previous?.createdAt) || now,
  };
  // Normalize legacy array records without dropping other saved dramas.
  const library = Object.fromEntries(records(state).filter(item => item?.config).map(item => [dramaKey(item.config), clone(item)]));
  library[id] = entry;
  state.dramas = library;
  return clone(entry);
}

/**
 * Only selected/saved dramas and real task records enter this projection.
 * runningCount/failedCount count tasks; other counts refer to current outputs.
 * The returned configs, sources, and batches are detached copies.
 */
export function listDramas(state = {}) {
  const library = new Map();
  const allBatches = array(state.batches).filter(batch => batch?.config);
  const ensure = (config, metadata = {}, replaceConfig = false) => {
    const id = dramaKey(config);
    let entry = library.get(id);
    if (!entry) {
      entry = {id, config, title: sourceFor(config).title, updatedAt: '', batches: []};
      library.set(id, entry);
    }
    if (replaceConfig) {
      entry.config = config;
      entry.title = sourceFor(config).title;
    }
    entry.updatedAt = latest(entry.updatedAt, metadata.updatedAt, metadata.createdAt, metadata.created);
    return entry;
  };
  // Old tasks seed a library for existing users. Newer task settings win only
  // when there is no explicitly saved/current selection for the same drama.
  const oldestFirst = [...allBatches].sort((a, b) => (Date.parse(a.createdAt || a.created) || 0) - (Date.parse(b.createdAt || b.created) || 0));
  for (const batch of oldestFirst) ensure(batch.config, batch, true);
  for (const saved of records(state)) if (saved?.config) ensure(saved.config, saved, true);
  if (state.config) ensure(state.config, {}, true);
  for (const batch of allBatches) {
    const entry = library.get(dramaKey(batch.config));
    entry.batches.push(batch);
    for (const output of array(batch.outputs)) {
      entry.updatedAt = latest(entry.updatedAt, output.updatedAt, output.confirmedAt, ...array(output.revisions).map(revision => revision.at));
    }
    for (const job of array(state.syncJobs)) if (job?.batchId === batch.id) entry.updatedAt = latest(entry.updatedAt, job.createdAt, job.updatedAt);
  }
  const result = [...library.values()].map(entry => {
    const source = sourceFor(entry.config);
    const cache = state.assets?.[assetKey(entry.config)];
    const available = new Set(source.availableEpisodes);
    const analyzed = new Set(array(cache?.episodes).filter(id => available.has(id)));
    let generatedCount = 0, reviewCount = 0, confirmedCount = 0, syncedCount = 0;
    for (const batch of entry.batches) for (const output of array(batch.outputs)) {
      const generated = ['ready', 'issue'].includes(output.status);
      const confirmed = output.status === 'ready' && output.confirmed === true && output.confirmedVersion === outputVersion(output);
      if (generated) generatedCount++;
      if (generated && !confirmed) reviewCount++;
      if (confirmed) confirmedCount++;
      if (getOutputSync(batch.id, output, state.syncJobs)?.status === 'success') syncedCount++;
    }
    return {
      id: entry.id, title: entry.title, config: entry.config, source,
      updatedAt: latest(entry.updatedAt, cache?.updatedAt),
      totalEpisodes: source.totalEpisodes, availableCount: available.size, analyzedCount: analyzed.size,
      batches: entry.batches, generatedCount, reviewCount, confirmedCount, syncedCount,
      runningCount: entry.batches.filter(batch => batch.status === 'running' || array(batch.outputs).some(output => output.status === 'pending')).length,
      failedCount: entry.batches.filter(batch => batch.status === 'failed' || array(batch.outputs).some(output => output.status === 'failed')).length,
    };
  }).sort((a, b) => (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0) || a.id.localeCompare(b.id));
  return clone(result);
}

export function findDrama(state, id) {
  return listDramas(state).find(drama => drama.id === id) || null;
}
