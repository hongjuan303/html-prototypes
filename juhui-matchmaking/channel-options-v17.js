// Shared business channel dictionary. Aggregate names are explicit values,
// not wildcard permissions or shortcuts that select other channels.
export const channels=Object.freeze([
 '国内全渠道','字节系（红果和抖音）','拼多多','美团','爱奇艺','优酷视频','腾讯视频','芒果TV','支付宝','咪咕','搜狐','UC浏览器','小米','淘宝','微博','快手','全民K歌（全民短剧）','微信视频号','版权代售','海外全渠道','海外非独全渠道','海外YouTube','海外Tiktok端原生','海外自有产品','QQ浏览器','京东','七猫','河马APP'
]);
export const isCurrentChannel=value=>channels.includes(value);
export const legacyChannels=values=>[...new Set((values||[]).filter(value=>!isCurrentChannel(value)))];
