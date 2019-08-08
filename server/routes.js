'use strict';
const Router = require('koa-router');
const Offline = require('./service/offline');
const Server = require('./service/server');
const Account = require('./service/account');
const Ledger = require('./service/ledger');
const Transaction = require('./service/transaction');
const OrderBook = require('./service/orderBook');
const SmartContract = require('./service/smartContract')

class Routes {
    constructor(config = {}) {
        this._prefix = config.prefix;
    }

    router() {
        const options = {};
        if (this._prefix) {
            options.prefix = this._prefix;
        }
        const router = new Router(options);

        router.get('/wallet/new', async (ctx, next) => {
            const info =  Offline.generateAddress(ctx.query.secret);
            ctx.responseData(info);
        });

        router.get('/server/connect', async (ctx, next) => {
            const info = await Server.getConnect();
            ctx.responseData(info);
        });

        router.get('/server', async (ctx, next) => {
            const info = await Server.getServerInfo();
            ctx.responseData(info);
        });

        router.get('/ledger', async (ctx, next) => {
            const info = await Ledger.getLedger(ctx.query);
            ctx.responseData(info);
        });

        router.get('/ledger/:ledger', async (ctx, next) => {
            ctx.query.ledger = ctx.params.ledger
            const info = await Ledger.getLedger(ctx.query);
            ctx.responseData(info);
        });

        router.get('/accounts/balances/:account', async (ctx, next) => {
            const info = await Account.balances(ctx.params.account,ctx.query);
            ctx.responseData(info);
        });
        router.get('/accounts/settings/:account', async (ctx, next) => {
            const info = await Account.getSettings(ctx.params.account,ctx.query);
            ctx.responseData(info);
        });

        router.get('/accounts/trustlines/:account', async (ctx, next) => {
            const info = await Account.getTrustlines(ctx.params.account,ctx.query);
            ctx.responseData(info);
        });

        router.get('/accounts/orders/:account', async (ctx, next) => {
            const info = await Account.getOrders(ctx.params.account,ctx.query);
            ctx.responseData(info);
        });

        router.get('/accounts/transactions/:account', async (ctx, next) => {
            const info = await Account.getTransactions(ctx.params.account,ctx.query);
            ctx.responseData(info);
        });

        router.post('/accounts/payments/:account', async (ctx, next) => {
            const info = await Transaction.submitPayment(ctx.params.account,Object.assign({},ctx.query,ctx.request.body));
            ctx.responseData(info);
        });

        router.post('/accounts/orders/:account', async (ctx, next) => {
            const info = await Transaction.submitOrder(ctx.params.account,Object.assign({},ctx.query,ctx.request.body));
            ctx.responseData(info);
        });

        router.delete('/accounts/orders/:account', async (ctx, next) => {
            const info = await Transaction.submitOrderCancellation(ctx.params.account,Object.assign({},ctx.query,ctx.request.body));
            ctx.responseData(info);
        });

        router.post('/accounts/trustlines/:account', async (ctx, next) => {
            const info = await Transaction.submitTrustline(ctx.params.account,Object.assign({},ctx.query,ctx.request.body));
            ctx.responseData(info);
        });

        router.post('/accounts/settings/:account', async (ctx, next) => {
            const info = await Transaction.submitSettings(ctx.params.account,Object.assign({},ctx.query,ctx.request.body));
            ctx.responseData(info);
        });


        router.get('/orderBook/:base/:counter', async (ctx, next) => {
            const info = await OrderBook.getOrderBook(ctx.params.base,ctx.params.counter,ctx.query);
            ctx.responseData(info);
        });

        router.get('/transaction/fee', async (ctx, next) => {
            const info = await Transaction.getFee();
            ctx.responseData(info);
        });

        router.get('/transaction/:hash', async (ctx, next) => {
            const info = await Transaction.getTransaction(ctx.params.hash);
            ctx.responseData(info);
        });

        router.post('/transaction/submit', async (ctx, next) => {
            const info = await Transaction.submit(ctx.request.body.txBlob);
            ctx.responseData(info);
        });
        
        router.post('/transaction/sign', async (ctx, next) => {
            const info = Offline.sign(ctx.request.body.txJson,ctx.request.body.secret);
            ctx.responseData(info);
        });

        router.post('/smartContract/submit/:account', async (ctx, next) => {
            const info = await SmartContract.submit(ctx.params.account,Object.assign({},ctx.query,ctx.request.body));
            ctx.responseData(info);
        });

        router.post('/smartContract/run/:hash', async (ctx, next) => {
            const info = await SmartContract.run(ctx.params.hash,Object.assign({},ctx.query,ctx.request.body));
            ctx.responseData(info);
        });

        router.get('/test/:account', async (ctx, next) => {
            ctx.body = {params:ctx.params,query:ctx.query};
        });
        router.get('/accounts/payments/:account/paths/:destination_account/:destination_amount_string', async (ctx, next) => {
            ctx.body = ctx.params;
        });

        return router;
    }
}

module.exports = Routes;