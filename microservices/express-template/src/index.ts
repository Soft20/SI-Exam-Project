import express from 'express';
import EurekaClient from './eureka';
import EnvError from './errors/EnvError';
import dotenv from 'dotenv';
dotenv.config();

const PORT: number | undefined = Number(process.env.PORT);
if (PORT == undefined) throw new EnvError('PORT');

const app = express();

app.get('', (req, res) => {
	res.json({ message: 'Hi Eureka from Express (TypeScript)' });
});

app.listen(PORT, async () => {
	try {
		await EurekaClient.start();
	} catch (error) {
		console.log(error.message);
		process.exit();
	}
});
