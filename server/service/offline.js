const api = require('./common/api')

function generateAddress (secret) {
    return api.generateAddress(secret)
}

module.exports = {
  generateAddress: generateAddress,
  sign: api.sign
}
