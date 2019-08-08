const api = require('./common/api');

/**
 * 查看资产详情
 */
async function assetInfo(options) {
  options.ledger = options.ledger || 'validated'
  let info = await api.getAssetInfo(options)
  return info
}

async function getAllToken(options) {
  options.marker = options.marker || '0',
  options.limit = options.limit || 10
  options.ledger = options.ledger || 'validated'
  let info = await api.getAllToken(options)
  return info
}

module.exports = {
  assetInfo,
  getAllToken
}