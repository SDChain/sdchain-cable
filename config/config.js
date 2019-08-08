const configTime = new Date().getTime()
const config = {
    port: 3000,
    cors: {
        allow: true,
        options: {
            origin: function (ctx) {
                return '*';
            },
            credentials: true
        }
    },
    staticDir: './public',
    apiVersion: 'v2',
    apiV1: 'v1',
    isUnsign: false,
    coredUrl: 'https://rpcurl',
    rpcTimeOut: 60,
    token: 12345,
    logger: {
        common: {
            level: 'debug',
            maxFiles: 100,
            maxsize: 1000 * 1000 * 10,
            json: false,
            dirname: process.cwd() + '/logs',
            filename: 'rest_' + configTime + '.log',
            timestamp: function () {
                var nowDate = new Date();
                var result = nowDate.toLocaleDateString() + " " + nowDate.toLocaleTimeString();
                return result;
            },
            formatter: function (options) {
                return options.timestamp() + ' [' + options.level.toUpperCase() + ']: ' + options.message;
            }
        }
    }
}
module.exports = config;