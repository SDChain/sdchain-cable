const api = require('./common/api');

async function getLedger(options){
    const res = await api.getLedger(options)
    return {
        ledger: res
    }
    
}
module.exports = {
    getLedger:getLedger
}