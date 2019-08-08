const api = require('./common/api');
const utils = require('./common/utils');
const _ =require('lodash')

async function getOrderBook(base, counter, options){
    options.isV1 = true
    options.ledger = options.ledger || 'validated'
    async function getAsks() {
        const _options = _.clone(options);
        _options.isAsk = true;
        const res = await api.getOrderBook(utils.parseCurrencyQuery(base), utils.parseCurrencyQuery(counter), _options)
        return {asks:res};
    }
    async function getBids() {
        const _options = _.clone(options);
        _options.isAsk = false;
        const res = await api.getOrderBook(utils.parseCurrencyQuery(counter), utils.parseCurrencyQuery(base), _options)
        return {bids:res};
    }
    const askAndBids = []
    if(options.type!="sell"){
        askAndBids.push(getBids());
    }
    if(options.type!="buy"){
        askAndBids.push(getAsks())
    }
    const askAndBidsRes= await Promise.all(askAndBids);
    const orderBook = {
        order_book:base+'/'+counter,
        bids:[],
        asks:[]
    }
    for(let i in askAndBidsRes){
        if(Array.isArray(askAndBidsRes[i].asks)&&askAndBidsRes[i].asks.length>0){
            orderBook.asks=askAndBidsRes[i].asks
        }
        if(Array.isArray(askAndBidsRes[i].bids)&&askAndBidsRes[i].bids.length>0){
            orderBook.bids=askAndBidsRes[i].bids
        }
    }

    return orderBook
}

module.exports = {
    getOrderBook
}