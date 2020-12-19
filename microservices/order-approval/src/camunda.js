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
	await publishMessage(JSON.stringify({ orderId }), 'approved-order');
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

/*
const amqp = require('amqplib/channel_api');

const RMQ_HOST = 'amqp://localhost';
const RMQ_EXCHANGE = 'order_exchange';
const RMQ_EXCHANGE_TYPE = 'direct';

const approvedRoutingKey = 'approved-order';
const declinedRoutingKey = 'declined-order';

function approvedCallback(msg) {
	if (!msg.content) throw Error('No message content.');
	const content = Buffer.from(msg.content).toString();
	// handle approved endpoint
}

function declinedCallback(msg) {
	if (!msg.content) throw Error('No message content.');
	const content = Buffer.from(msg.content).toString();
	// handle declined endpoint
}

(async () => {
	const connection = await amqp.connect(RMQ_HOST);

	const approvedChannel = await connection.createChannel();
	approvedChannel.assertExchange(RMQ_EXCHANGE, RMQ_EXCHANGE_TYPE, { durable: true }); // https://www.rabbitmq.com/queues.html#durability
	const { queue: approvedQueue } = await approvedChannel.assertQueue('', { exclusive: true });
	approvedChannel.bindQueue(approvedQueue, RMQ_EXCHANGE, approvedRoutingKey);
	approvedChannel.consume(approvedQueue, approvedCallback, { noAck: true });

	const declinedChannel = await connection.createChannel();
	declinedChannel.assertExchange(RMQ_EXCHANGE, RMQ_EXCHANGE_TYPE, { durable: true }); // https://www.rabbitmq.com/queues.html#durability
	const { queue: declinedQueue } = await declinedChannel.assertQueue('', { exclusive: true });
	declinedChannel.bindQueue(declinedQueue, RMQ_EXCHANGE, declinedRoutingKey);
	declinedChannel.consume(declinedQueue, declinedCallback, { noAck: true });
})();
*/
