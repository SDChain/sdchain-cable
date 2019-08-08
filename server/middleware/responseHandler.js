"use strict";

const util = require('util');
const validator = require('validator');

module.exports = function () {
    return async function (ctx, next) {
        const method = ctx.method;
        const path = ctx.path;
        ctx.responseError = (err, code = gErrorCode.REQUEST_ERROR) => {
            ctx.body = { success: false, errorType :err.type,message:err.message ? err.message : err.toString()};
            return false;
        }

        ctx.responseData = (data) => {
            data.success=true
            let errStatus;
            if(data.result&&data.result.resultType){
                switch(data.result.resultType){
                    case 'terQUEUED':
                        break;
                    case 'tesSUCCESS':
                        break;
                    default:
                        data.success = false
                        ctx.status = global.gStatusCode.INTERNAL_SERVER_ERROR;
                        errStatus = {
                            hash:data.result.hash,
                            state: 'pending'
                        }
                        if(data.result.resultType.substring(0,3)==='tec'){
                        }else{
                            errStatus.state = 'failed'
                        }
                        gLog.error(data.result.resultType+'|'+data.result.hash);
                        break;
                }
            }
            if(data.success){
                const _data = data.result&&typeof data.result!=='string'?data.result:data
                _data.success = data.success
                ctx.body = _data;
            }else{
                if(ctx.path.indexOf(gConfig.apiV1)==1){
                    ctx.body = { success: false, error_type :data.result.resultType,message:data.result.resultMessage, error :data.result.resultType};
                }else{
                    ctx.body = { success: false, errorType :data.result.resultType,message:data.result.resultMessage};
                }
                if(errStatus){
                    ctx.body.hash = errStatus.hash;
                    ctx.body.state = errStatus.state;
                }
            }
        }
        
        try {
            await next();
        } catch (err) {
            console.log(err)
            if(err.type){
                gLog.error(err.message);
                if(validator.isJSON(err.message)){
                    const errJ =JSON.parse(err.message)
                    if(errJ.error){
                        err.type = errJ.error
                        err.message = errJ.error_message
                    }
                }
            }else{
                gLog.error(err.stack);
            }
           
            ctx.status = global.gStatusCode.BAD_REQUEST;
            if(ctx.path.indexOf(gConfig.apiV1)==1){
                ctx.body = { success: false, error_type :err.type?err.type:'invalid_request',message:err.message ? err.message : err.toString(),error:err.type?err.type:'unknowError'};
            }else{
                ctx.body = { success: false, errorType :err.type?err.type:'unknowError',message:err.message ? err.message : err.toString()};
            }
        }
        const status = ctx.status;
        const time = new Date().getTime() - ctx.startTime;
        const message = util.format('res: %s - %s   --%s %s ms', method, path,status,time);

        gLog.info(message);
    };
};
