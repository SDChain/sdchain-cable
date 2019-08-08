const path = require('path');
const winston = require('winston');
const tools = require('./tools');

tools.mkdir(path.join(gConfig.logger.common.dirname, gConfig.logger.common.filename));
module.exports = new (winston.Logger)({
    transports: [
        new (winston.transports.File)(gConfig.logger.common),
        new winston.transports.Console({ level: gConfig.logger.common.level }),
    ]
});