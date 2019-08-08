"use strict";
const util = require('util');

module.exports = function () {
    return async function (ctx, next) {
        ctx.startTime = new Date().getTime();
        const method = ctx.method;
        const path = ctx.path;
        let requestParams = '';
        if (ctx.request.query) { 
            if(ctx.request.query.unsign===undefined){
                ctx.request.query.unsign=gConfig.isUnsign;
            }
            requestParams = JSON.stringify(ctx.request.query);
        }
        let requestBody = '';
        if (ctx.request.body) { 
            requestBody = JSON.stringify(ctx.request.body);
        }

        await next();
    }
};
