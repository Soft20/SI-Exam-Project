import server from './server';
import * as restify from 'restify';
import * as dotenv from 'dotenv';
import EnvError from './errors/EnvError';
import './camunda';

// routes
import orderRoute from './routes/order';
import productRoute from './routes/product';
import warehouseRoute from './routes/warehouse';

dotenv.config();

const PORT: number | undefined = Number(process.env.PORT);
if (PORT == undefined) throw new EnvError('PORT');

productRoute.applyRoutes(server, '/product');
orderRoute.applyRoutes(server, '/order');
warehouseRoute.applyRoutes(server, '/warehouse');

server.use(
	restify.plugins.bodyParser({
		requestBodyOnGet: true,
	})
);

server.use(restify.plugins.queryParser());

server.listen(PORT, () => console.log(`listening @ http://localhost:${PORT}`));
