const express = require('express');
const fetch = require('node-fetch');
const EurekaClient = require('./eureka');
require('./camunda');
const dotenv = require('dotenv');

dotenv.config();

const PORT = Number(process.env.PORT);
if (PORT == undefined) throw new EnvError('PORT');

const CAMUNDA_HOST = 'http://localhost:8080/engine-rest/process-definition/key/order-approval/start';

const app = express();
app.use(express.json());

app.post('/purchase', async (req, res) => {
	const { orderId, price, email, shippingPrice } = req.body;

	const body = {
		variables: {
			orderId: { value: orderId, type: 'string' },
			customer: { value: email, type: 'string' },
			price: { value: price, type: 'long' },
			shippingPrice: { value: shippingPrice, type: 'long' },
		},
	};

	const options = {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	};

	const response = await fetch(CAMUNDA_HOST, options);
	const json = await response.json();
	console.log('JSON::', json);

	res.json({ message: `Order ${orderId} received and is being processed.` });
});

app.listen(PORT, async () => {
	try {
		await EurekaClient.start();
	} catch (error) {
		console.log(error.message);
		process.exit();
	}
});

// app.listen(PORT, () => console.log(`BPMN Service running at http://localhost:${PORT}`));
