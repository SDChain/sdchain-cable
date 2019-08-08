const ChainAPI = require('sdchain-api-core');
const tools = require('./tools')
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const api = new ChainAPI({ url: global.gConfig.coredUrl, trace: true ,timeout:global.gConfig.rpcTimeOut});

async function index() {
    while (true) {
        if (!api.isConnected()) {
            try {
                await api.connect();
                console.log("connect to ws success");
            } catch (error) {
                console.log("disconnect to ws success");
            }
        }
       await tools.sleep(10000);
    }
}
index()
module.exports = api;