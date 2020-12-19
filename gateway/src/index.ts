import server from './server';
import * as restify from 'restify';

import approvalRoute from './routes/order'
import * as dotenv from 'dotenv';
import EnvError from './errors/EnvError';

dotenv.config()

const PORT: number | undefined = Number(process.env.PORT);
if (PORT == undefined) throw new EnvError('PORT');

approvalRoute.applyRoutes(server, '/order');

server.use(restify.plugins.bodyParser({
    requestBodyOnGet: true
}));

server.listen(PORT, () => console.log(`listening @ http://localhost:${PORT}`));