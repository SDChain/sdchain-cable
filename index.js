'use strict';
const config = require('./config/config');
const configC = require('./global/globalConfig');
const Server = require('./server');
process.env.UV_THREADPOOL_SIZE = 64;
const server = new Server(config);
server.start();
