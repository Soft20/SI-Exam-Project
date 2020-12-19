const { Client, logger } = require('camunda-external-task-client-js');
const publishMessage = require('./messageHandler');

const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger, asyncResponseTimeout: 10000 };
const client = new Client(config);

client.subscribe('order-accepted', async function ({ task, taskService }) {
	const price = task.variables.get('price');
	const customer = task.variables.get('customer');
	const orderId = task.variables.get('orderId');

	console.log(`Order ${orderId} was approved with the price of ${price} DKK. sent to ${customer}`);
	await taskService.complete(task);

	await publishMessage(`Order ${orderId} was approved with the price of ${price} DKK.`, customer);
	await publishMessage(orderId, 'approved-order');
});

client.subscribe('order-declined', async function ({ task, taskService }) {
	const price = task.variables.get('price');
	const customer = task.variables.get('customer');
	const orderId = task.variables.get('orderId');

	console.log(`Order ${orderId} was declined with the price of ${price} DKK. sent to ${customer}`);
	await taskService.complete(task);

	await publishMessage(`Order ${orderId} was declined with the price of ${price} DKK.`, customer);
	await publishMessage(orderId, 'declined-order');
});
