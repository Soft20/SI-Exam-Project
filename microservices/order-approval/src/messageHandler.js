const amqp = require('amqplib/channel_api');

const RMQ_HOST = 'amqp://localhost';
const RMQ_EXCHANGE = 'order_exchange';
const RMQ_EXCHANGE_TYPE = 'direct';

async function publishMessage(message, mailRoutingKey) {
	const connection = await amqp.connect(RMQ_HOST);
	const channel = await connection.createChannel();

	channel.assertExchange(RMQ_EXCHANGE, RMQ_EXCHANGE_TYPE, { durable: true }); // https://www.rabbitmq.com/queues.html#durability
	channel.publish(RMQ_EXCHANGE, mailRoutingKey, Buffer.from(message));
	console.log(`Emitted:: ${message} -> ${mailRoutingKey}`);
}

module.exports = publishMessage;
