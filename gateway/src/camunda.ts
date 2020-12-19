import fetch from 'node-fetch';
const amqp = require('amqplib/channel_api');

import { serviceURL } from './eureka';

const RMQ_HOST = 'amqp://localhost';
const RMQ_EXCHANGE = 'order_exchange';
const RMQ_EXCHANGE_TYPE = 'direct';

const PRODUCT_SERVICE: string = 'product-service';

const approvedRoutingKey = 'approved-order';
const declinedRoutingKey = 'declined-order';

async function processCallback(msg, method, status) {
	if (!msg.content) throw Error('No message content.');
	const orderId = Buffer.from(msg.content).toString();
	const PRODUCT_SERVICE_URL = await serviceURL(PRODUCT_SERVICE);
	await fetch(`${PRODUCT_SERVICE_URL}/order?id=${orderId}`, { method });
	console.log(`Order with id ${orderId} has been ${status}.`);
}

async function approvedCallback(msg) {
	return await processCallback(msg, 'PUT', 'approved');
}

async function declinedCallback(msg) {
	return await processCallback(msg, 'DELETE', 'declined');
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
