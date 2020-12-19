import * as dotenv from 'dotenv';
import { Eureka, EurekaClient } from 'eureka-js-client';
import EnvError from './errors/EnvError';
dotenv.config();

const APPLICATION_HOST: string | undefined = process.env.HOST;
const APPLICATION_PORT: number | undefined = Number(process.env.PORT);
const APPLICATION_NAME: string | undefined = process.env.NAME;
const EUREKA_HOST: string | undefined = process.env.EUREKA_HOST;
const EUREKA_PORT: number | undefined = Number(process.env.EUREKA_PORT);

if (APPLICATION_HOST == undefined) throw new EnvError('HOST');
if (APPLICATION_PORT == undefined) throw new EnvError('PORT');
if (APPLICATION_NAME == undefined) throw new EnvError('NAME');
if (EUREKA_HOST == undefined) throw new EnvError('EUREKA_HOST');
if (EUREKA_PORT == undefined) throw new EnvError('EUREKA_PORT');

const client: Eureka = new Eureka({
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

client.start();

export default client;

export async function serviceURL(serverId: string): Promise<string> {
	const expressServer: any = await client.getInstancesByAppId(serverId)[0];
	const EXPRESS_SERVICE_HOST = expressServer.hostName;
	const EXPRESS_SERVICE_PORT = expressServer.port['$'];
	return `http://${EXPRESS_SERVICE_HOST}:${EXPRESS_SERVICE_PORT}`;
}
