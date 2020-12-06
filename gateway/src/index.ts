import fetch from 'node-fetch';
import eurekaClient from './eureka';
import timeout from './utils/timeout';

const EXPRESS_SERVER_ID: string = 'express-service';
const FLASK_SERVER_ID: string = 'flask-service';

(async () => {
	await eurekaClient.start();
	await timeout(500);

	/** flask server (python) */
	const flaskServer = await eurekaClient.getInstancesByAppId(FLASK_SERVER_ID)[0];
	const FLASK_SERVICE_HOST = flaskServer.hostName;
	const FLASK_SERVICE_PORT = flaskServer.port['$'];

	console.log('FLASK SERVICE HOST::', FLASK_SERVICE_PORT);
	console.log('FLASK SERVICE POST::', FLASK_SERVICE_HOST);

	const flaskResponse = await fetch(`http://${FLASK_SERVICE_HOST}:${FLASK_SERVICE_PORT}`);
	const flaskResponseBody = await flaskResponse.json();
	console.log('response::', flaskResponseBody);

	/** express server (typescript) */
	const expressServer = await eurekaClient.getInstancesByAppId(EXPRESS_SERVER_ID)[0];
	const EXPRESS_SERVICE_HOST = expressServer.hostName;
	const EXPRESS_SERVICE_PORT = expressServer.port['$'];

	console.log('EXPRESS SERVICE HOST::', EXPRESS_SERVICE_HOST);
	console.log('EXPRESS SERVICE POST::', EXPRESS_SERVICE_PORT);

	const expressResponse = await fetch(`http://${EXPRESS_SERVICE_HOST}:${EXPRESS_SERVICE_PORT}`);
	const expressResponseBody = await expressResponse.json();
	console.log('response::', expressResponseBody);
})();
