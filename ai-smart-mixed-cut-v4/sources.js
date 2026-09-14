/* Fictional source catalogs for interaction review. No Green Console API is called. */

export const MARKETS = Object.freeze([
  Object.freeze({id: 'domestic', label: '国内短剧', sourceLabel: '国内绿台合集列表'}),
  Object.freeze({id: 'overseas', label: '海外短剧', sourceLabel: '海外绿台合集列表'}),
]);

const sequence = count => Array.from({length: count}, (_, index) => index + 1);
const collection = value => Object.freeze({...value, availableEpisodes: Object.freeze(value.availableEpisodes), simulated: true});

// IDs are only unique within a market, just as independent source systems may use the same ID.
export const COLLECTIONS = Object.freeze([
  collection({id: 'collection-001', market: 'domestic', title: '重逢时，她已是王牌（虚构示例）', description: '国内合集示例 · 都市逆袭 · 全部剧集可用', totalEpisodes: 30, availableEpisodes: sequence(30)}),
  collection({id: 'collection-002', market: 'domestic', title: '她的第二次选择（虚构示例）', description: '国内合集示例 · 职场成长 · 第 31–40 集尚未准备', totalEpisodes: 40, availableEpisodes: sequence(30)}),
  collection({id: 'collection-003', market: 'domestic', title: '签约前的秘密（虚构示例）', description: '国内合集示例 · 悬念剧情 · 第 4 集暂不可用', totalEpisodes: 8, availableEpisodes: [1, 2, 3, 5, 6, 7, 8]}),
  collection({id: 'collection-001', market: 'overseas', title: '归来后的新身份（虚构示例）', description: '海外合集示例 · 身份反转 · 全部剧集可用', totalEpisodes: 30, availableEpisodes: sequence(30)}),
  collection({id: 'collection-002', market: 'overseas', title: '最后一页合约（虚构示例）', description: '海外合集示例 · 都市悬念 · 第 31–40 集尚未准备', totalEpisodes: 40, availableEpisodes: sequence(30)}),
  collection({id: 'collection-003', market: 'overseas', title: '再次相遇之前（虚构示例）', description: '海外合集示例 · 片源准备中 · 暂无可用剧集', totalEpisodes: 18, availableEpisodes: []}),
]);

const SAMPLE_SOURCE = Object.freeze({
  kind: 'sample', market: null, collectionId: null, title: '重逢时，她已是王牌',
  description: '现代都市 · 女性成长 · 身份反转', totalEpisodes: 30,
  availableEpisodes: Object.freeze(sequence(30)), simulated: true,
});

function copySource(source) {
  return {...source, availableEpisodes: [...source.availableEpisodes]};
}

export function getCollection(market, id) {
  return COLLECTIONS.find(item => item.market === market && item.id === id) || null;
}

export function listCollections(market, query = '') {
  const keyword = String(query).trim().toLocaleLowerCase();
  return COLLECTIONS.filter(item => item.market === market && (!keyword || `${item.title} ${item.description} ${item.id}`.toLocaleLowerCase().includes(keyword)));
}

export function resolveSource(config = {}) {
  const source = config?.source;
  // Stored tasks created before collection selection keep their original sample source.
  if (source == null || source.kind === 'sample') return copySource(SAMPLE_SOURCE);
  if (source.kind !== 'green' || !MARKETS.some(item => item.id === source.market)) return null;
  const item = getCollection(source.market, source.collectionId);
  if (!item) return null;
  return copySource({
    kind: 'green', market: item.market, collectionId: item.id,
    title: item.title, description: item.description, totalEpisodes: item.totalEpisodes,
    availableEpisodes: item.availableEpisodes, simulated: true,
  });
}
