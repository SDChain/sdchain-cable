const api = require('./common/api');
const utils = require('./common/utils');
const transaction = require('./transaction');


async function submit(address,options) {
    if(options.smartContract){
        options.settings={
            memos:[{
                memoType: 'SmartContract',
                memoData: options.smartContract
            }]
        }
    }

    const res = await transaction.submitSettings(address,options);
    return res
};

async function run(hash,options) {
    const res = await api.smartContract(hash,options);
    return res
};

module.exports = {
    submit,
    run
}