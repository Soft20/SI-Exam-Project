const amqp = require('amqplib/channel_api');

const RMQ_HOST = 'amqp://localhost';
const RMQ_EXCHANGE = 'order_exchange';
const RMQ_EXCHANGE_TYPE = 'direct';

// Routing key to route for a specific user (mail)
const routingKey = process.argv[2] || 'dora@mail.com';

// logs the received content
function callback(msg) {
	if (!msg.content) throw Error('No message content.');
	const content = Buffer.from(msg.content).toString();
	console.log(content);
	// console.log(msg.fields.routingKey);
}

console.log(`Starting <CONSUMER> with routing key: <${routingKey}>...`);

(async () => {
	const connection = await amqp.connect(RMQ_HOST);
	const channel = await connection.createChannel();

	channel.assertExchange(RMQ_EXCHANGE, RMQ_EXCHANGE_TYPE, { durable: true }); // https://www.rabbitmq.com/queues.html#durability
	const { queue } = await channel.assertQueue('', { exclusive: true });

	console.log('Listening on', queue);
	channel.bindQueue(queue, RMQ_EXCHANGE, routingKey);

	channel.consume(queue, callback, { noAck: true });
})();
