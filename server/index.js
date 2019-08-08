'use strict';
const Koa = require('koa');
const Routes = require('./routes');
const Routes1 = require('./routes1');
const koaStatic = require('koa-static');
const koaBodyparser = require('koa-bodyparser')
const koaJson = require('koa-json')
const requestHandler = require('./middleware/requestHandler.js')
const responseHandler = require('./middleware/responseHandler.js')

class Server {
    constructor(config = {}) {
        this._port = config.port;
        this._staticDir = config.staticDir;
        this._apiVersion = config.apiVersion;
        this._apiV1 = config.apiV1;
    }

    start() {
        const app = new Koa();
        this.app = app;
        const router = new Routes({ prefix: '/' + this._apiVersion }).router();
        const router1 = new Routes1({ prefix: '/' + this._apiV1 }).router();
        app.on('error', err => {
            console.error('server error', err)
        });

        app
            .use(koaStatic(this._staticDir))
            .use(koaBodyparser())
            .use(koaJson())
            .use(requestHandler())
            .use(responseHandler())
            .use(router1.routes())
            .use(router.routes())
            .use(router.allowedMethods());

        app.listen(this._port);
        console.log('The server is listening on ' + this._port);
    }
}

module.exports = Server;