const config = require('../config/config');
global.gConfig = config;

const log = require('../server/service/common/log');
global.gLog = log;

const statusCode = require('../server/service/common/statusCode');
global.gStatusCode = statusCode;

