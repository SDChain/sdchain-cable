const api = require('./common/api');

async function getServerInfo(options) {
    const res = await api.getServerInfo();


    let _res = {}
    if(options.isV1){
        const serverV1 = {
            complete_ledgers:res.completeLedgers,
            server_state:res.serverState,
            reserve_base:res.validatedLedger.reserveBase,
            reserve_inc:res.validatedLedger.reserveInc,
        }
        _res[api.base().constants.BaseChain.toLowerCase()+'d_server_status']=serverV1

    }else{
        const server = {
            completeLedgers:res.completeLedgers,
            state:res.serverState,
            baseFee:res.validatedLedger.baseFee,
            reserveBase:res.validatedLedger.reserveBase,
            reserveInc:res.validatedLedger.reserveInc,
        }
        _res.server = server
    }
    return _res
};

async function getConnect() {
    return {
        connect:await api.isConnected()
    };
};

module.exports={
    getServerInfo,
    getConnect
}