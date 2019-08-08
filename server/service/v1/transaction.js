const api = require('../common/api');
const utils = require('../common/utils');
const MAX_TRYS = 15;
const Error = api.error();
const validate = api.validate()

async function getFee() {
    const res = await api.getFee();
    return res
};

async function submit(txBlob,options) {
    options.validated=options.validated === 'true'?true:false
    options.unsign = false

    let res= {}
    try {
        res=await api.submit(txBlob, options);
    } catch (err) {
        res.resultType = 'tec'+err.name
        res.resultMessage = err.message
    }
    
    if (res.hash) {
        let result = {
            id:res.id,
            hash: res.hash,
            resultType: res.resultType || '',
            resultMessage: res.resultMessage || '',
            ledger: 0,
            state: 'pending'
        };
        if (options.validated) {
            result = await checkValidated(result);
        }
        return {
            result: result
        };
    }
    return {
        result:res
    }
};

async function sign(txJson, secret,coreSign) {
    const res = await api.sign(txJson, secret,coreSign);
    return {
        result: res
    }
};

async function getTransaction(hash,options) {
    const res = await api.getTransaction(hash,options);
    return {
        transaction:res
    }
};

async function checkValidated(info) {
    if (!info.hash) {
        return info;
    }
    let i = 0;
    while (i < MAX_TRYS) {
        const res = await api.getTransaction(info.hash);
        if (res.validated) {
            info.state = res.state;
            info.ledger = res.ledger;
            info.resultType = res.result;
            break;
        }
        await sleep(2000);
        i++
    }
    return info;
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    })
}

async function prepareAndSign(txJson,secret,coreSign){
    const res = {
        tx_json:txJson
    }
    if(secret){
        const resSign= await api.sign(txJson,secret,coreSign);
        res.hash = resSign.hash||resSign.txJson.hash;
        res.tx_blob = resSign.signedTransaction||resSign.txBlob;
    }
    
    return res
}

async function submitTransaction(txJson,secret,options) {
    options.validated=options.validated === 'true'?true:false
    let _txJson = txJson;
    let resSign;
    if(!options.unsign){
        resSign= await api.sign(txJson,secret);
        _txJson = resSign.signedTransaction
    }
    let res= {}
    try {
        res=await api.submit(_txJson, options);
    } catch (err) {
        if(resSign){
            res.hash = resSign.hash;
            res.resultType = 'tec'+err.name
            res.resultMessage = err.message
        }else{
            throw new Error[err.name](err.message)
        }
    }
    
    if (res.hash) {
        let result = {
            id: res.id,
            hash: res.hash,
            resultType: res.resultType || '',
            resultMessage: res.resultMessage || '',
            ledger: 0,
            state: 'pending'
        };
        if (options.submit!=='false'&&options.validated) {
            result = await checkValidated(result);
        }
        return {
            result: result
        };
    }
    return {
        result:res
    }
};

async function submitPayment(address,options) {
    validate.field(options,'payment')
    options.unsign= utils.toBoolean(options.unsign)
    options.payment.unsign =  options.unsign
    options.payment.submit =  utils.toBoolean(options.submit)
    options.payment.destination = options.payment.destination_account;

    if(options.payment.memos&&Array.isArray(options.payment.memos)){
        const memos = options.payment.memos;
        for(let i in memos){
            memos[i]={
                memoType:memos[i].memo_type?memos[i].memo_type:memos[i].MemoType,
                memoData:memos[i].memo_data?memos[i].memo_data:memos[i].MemoData
            }
        }
    }
    const resPre = await api.preparePayment(address,options.payment);
    if(options.submit==='false'){
        return await prepareAndSign(JSON.parse(resPre.txJson),options.secret,options.unsign)
    }
    const res= await submitTransaction(resPre.txJson,options.secret,options);

    return res
};


async function submitOrder(address,options) {
    validate.field(options,'order')
    options.unsign= utils.toBoolean(options.unsign)
    options.order.unsign = options.unsign
    options.order.taker_pays.issuer = options.order.taker_pays.counterparty;
    options.order.taker_gets.issuer = options.order.taker_gets.counterparty;
    options.order.isV1 = true;
    const resPre = await api.prepareOrder(address,options.order);
    if(options.submit==='false'){
        return await prepareAndSign(JSON.parse(resPre.txJson),options.secret,options.unsign)
    }
    const res = await submitTransaction(resPre.txJson,options.secret,options);
    if (res.result && res.result.resultType === 'tesSUCCESS') {
        const result = {
            order: {
                account: address,
                taker_gets: options.order.taker_gets,
                taker_pays: options.order.taker_pays,
                type: options.order.type
            },
            hash: res.result.hash,
            ledger: res.result.ledger,
            state: res.result.state
        };
        return result;
    }
    return res
};

async function submitOrderCancellation(address,options) {
    options.unsign= utils.toBoolean(options.unsign)
    options.order={
        unsign:options.unsign,
        offerSequence:options.offerSequence
    }
    const resPre = await api.prepareOrderCancellation(address,options.order);
    if(options.submit==='false'){
        return await prepareAndSign(JSON.parse(resPre.txJson),options.secret,options.unsign)
    }
    const res= await submitTransaction(resPre.txJson,options.secret,options);
    return res
};

async function submitTrustline(address,options) {
    validate.field(options,'trustline')
    options.unsign= utils.toBoolean(options.unsign);
    options.trustline.unsign = options.unsign;
    options.trustline.limitAmount = {
        currency: options.trustline.currency,
        issuer: options.trustline.counterparty,
        value: options.trustline.limit
    };
    options.trustline.spread = options.trustline['account_allows_'+api.base().constants.BaseChain.toLowerCase()+'ing']
    const resPre = await api.prepareTrustline(address,options.trustline);
    if(options.submit==='false'){
        return await prepareAndSign(JSON.parse(resPre.txJson),options.secret,options.unsign)
    }
    const res= await submitTransaction(resPre.txJson,options.secret,options);
    return res
};

async function submitSettings(address,options) {
    validate.field(options,'settings')
    options.unsign= utils.toBoolean(options.unsign)
    options.settings.unsign = options.unsign
    if(options.settings.memos&&Array.isArray(options.settings.memos)){
        const memos = options.settings.memos;
        for(let i in memos){
            memos[i]={
                memoType:memos[i].memo_type?memos[i].memo_type:memos[i].MemoType,
                memoData:memos[i].memo_data?memos[i].memo_data:memos[i].MemoData
            }
        }
    }
    const resPre = await api.prepareSetting(address,options.settings);
    if(options.submit==='false'){
        return await prepareAndSign(JSON.parse(resPre.txJson),options.secret,options.unsign)
    }
    const res= await submitTransaction(resPre.txJson,options.secret,options);
    return res
};

async function submitMultiPayment(address,options){
    validate.field(options,'payments')
    options.unsign= utils.toBoolean(options.unsign)
    options.payments.unsign = options.unsign
    const resPre = await api.prepareMultiPayment(address,options.payments);
    if(options.submit==='false'){
        return await prepareAndSign(JSON.parse(resPre.txJson),options.secret,options.unsign)
    }
    const res= await submitTransaction(resPre.txJson,options.secret,options);
    return res
}

async function submitAssetCreate(address,options){
    validate.field(options,'asset')
    options.unsign= utils.toBoolean(options.unsign)
    options.asset.unsign = options.unsign
    const resPre = await api.prepareAssetCreate(address,options.asset);
    if(options.submit==='false'){
        return {
            txJson:JSON.parse(resPre.txJson)
        }
    }
    const res= await submitTransaction(resPre.txJson,options.secret,options);
    return res
}

async function submitTokenCreate(address,options){
    validate.field(options,'token')
    options.unsign= utils.toBoolean(options.unsign)
    options.token.unsign = options.unsign
    const resPre = await api.prepareTokenCreate(address,options.token);
    if(options.submit==='false'){
        return {
            txJson:JSON.parse(resPre.txJson)
        }
    }
    const res= await submitTransaction(resPre.txJson,options.secret,options);
    return res
}
async function submitTokenDestroy(address,options){
    options.unsign= utils.toBoolean(options.unsign)
    const params = {
        unsign:options.unsign,
        tokenId:options.id
    }
    const resPre = await api.prepareTokenDestroy(address,params);
    if(options.submit==='false'){
        return {
            txJson:JSON.parse(resPre.txJson)
        }
    }
    const res= await submitTransaction(resPre.txJson,options.secret,options);
    return res
}
async function submitTokenRevoke(address,options){
    options.unsign= utils.toBoolean(options.unsign)
    const params = {
        unsign:options.unsign,
        tokenId:options.id
    }
    const resPre = await api.prepareTokenRevoke(address,params);
    if(options.submit==='false'){
        return {
            txJson:JSON.parse(resPre.txJson)
        }
    }
    const res= await submitTransaction(resPre.txJson,options.secret,options);
    return res
}
async function submitTokenApprove(address,options){
    validate.field(options,'approve')
    options.unsign= utils.toBoolean(options.unsign)
    options.approve.unsign = options.unsign
    const resPre = await api.prepareTokenApprove(address,options.approve);
    if(options.submit==='false'){
        return {
            txJson:JSON.parse(resPre.txJson)
        }
    }
    const res= await submitTransaction(resPre.txJson,options.secret,options);
    return res
}
async function submitTokenApproveCancel(address,options){
    validate.field(options,'approve')
    options.unsign= utils.toBoolean(options.unsign)
    options.approve.unsign = options.unsign
    const resPre = await api.prepareTokenApproveCancel(address,options.approve);
    if(options.submit==='false'){
        return {
            txJson:JSON.parse(resPre.txJson)
        }
    }
    const res= await submitTransaction(resPre.txJson,options.secret,options);
    return res
}
async function submitAssetApprove(address,options){
    validate.field(options,'approve')
    options.unsign= utils.toBoolean(options.unsign)
    options.approve.unsign = options.unsign
    const resPre = await api.prepareAssetApprove(address,options.approve);
    if(options.submit==='false'){
        return {
            txJson:JSON.parse(resPre.txJson)
        }
    }
    const res= await submitTransaction(resPre.txJson,options.secret,options);
    return res
}
async function submitAssetApproveCancel(address,options){
    validate.field(options,'approve')
    options.unsign= utils.toBoolean(options.unsign)
    options.approve.unsign = options.unsign
    const resPre = await api.prepareAssetApproveCancel(address,options.approve);
    if(options.submit==='false'){
        return {
            txJson:JSON.parse(resPre.txJson)
        }
    }
    const res= await submitTransaction(resPre.txJson,options.secret,options);
    return res
}
async function submitAssetDestroy(address,options){
    options.unsign= utils.toBoolean(options.unsign)
    const params = {
        unsign:options.unsign,
        assetId:options.id
    }
    const resPre = await api.prepareAssetDestroy(address,params);
    if(options.submit==='false'){
        return {
            txJson:JSON.parse(resPre.txJson)
        }
    }
    const res= await submitTransaction(resPre.txJson,options.secret,options);
    return res
}
async function submitTokenSet(address,options){
    validate.field(options,'token')
    options.unsign= utils.toBoolean(options.unsign)
    options.token.unsign = options.unsign
    const resPre = await api.prepareTokenSet(address,options.token);
    if(options.submit==='false'){
        return {
            txJson:JSON.parse(resPre.txJson)
        }
    }
    const res= await submitTransaction(resPre.txJson,options.secret,options);
    return res
}


/**
 * token转移
 * @param {*} account 
 * @param {*} options 
 */
async function submitTokenTransfer(account, options) {
  validate.field(options,'transfer')
  options.unsign = utils.toBoolean(options.unsign)
  options.transfer.unsign = options.unsign
  const resPre = await api.prepareTokenTransfer(account, options.transfer);
  if (options.submit === 'false') {
    return {
      txJson: JSON.parse(resPre.txJson)
    }
  }
  const res = await submitTransaction(resPre.txJson, options.secret, options);
  return res
}

module.exports = {
    getFee,
    sign,
    submit,
    submitPayment,
    submitOrder,
    submitOrderCancellation,
    submitSettings,
    submitTrustline,
    getTransaction,
    submitMultiPayment,
    submitAssetCreate,
    submitTokenCreate,
    submitTokenDestroy,
    submitTokenRevoke,
    submitTokenApprove,
    submitTokenApproveCancel,
    submitAssetApprove,
    submitAssetApproveCancel,
    submitAssetDestroy,
    submitTokenSet,
    submitTokenTransfer

}