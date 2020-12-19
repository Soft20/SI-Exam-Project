// import * as dotenv from 'dotenv';
// import { Eureka } from 'eureka-js-client';
const dotenv = require('dotenv')
const { Eureka } = require('eureka-js-client')
const EnvError = require('./errors/EnvError');
dotenv.config();

const APPLICATION_HOST = process.env.HOST;
const APPLICATION_PORT = Number(process.env.PORT);
const APPLICATION_NAME = process.env.NAME;
const EUREKA_HOST = process.env.EUREKA_HOST;
const EUREKA_PORT = Number(process.env.EUREKA_PORT);

if (APPLICATION_HOST == undefined) throw new EnvError('HOST');
if (APPLICATION_PORT == undefined) throw new EnvError('PORT');
if (APPLICATION_NAME == undefined) throw new EnvError('NAME');
if (EUREKA_HOST == undefined) throw new EnvError('EUREKA_HOST');
if (EUREKA_PORT == undefined) throw new EnvError('EUREKA_PORT');

const client = new Eureka({
	instance: {
		app: APPLICATION_NAME,
		hostName: APPLICATION_HOST,
		ipAddr: APPLICATION_HOST,
		port: { $: APPLICATION_PORT, '@enabled': true },
		vipAddress: 'www.express-server.com',
		dataCenterInfo: { '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo', name: 'MyOwn' },
	},
	eureka: { host: EUREKA_HOST, port: EUREKA_PORT, servicePath: '/eureka/apps/' },
});

module.exports = client;