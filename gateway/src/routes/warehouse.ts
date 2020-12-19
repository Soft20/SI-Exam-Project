import { Router } from 'restify-router';
import { serviceURL } from '../eureka';
import fetch, { Response } from 'node-fetch';
import handleError from '../utils/handleError';
import hypermedia from '../utils/hypermedia';

import ServiceError from '../errors/ServiceError';

const router = new Router();

const PRODUCT_SERVICE: string = 'product-service';

router.get({ name: 'getWarehouse', path: '' }, async (req, res) => {
	const id: string = req.query?.id;

	try {
		const PRODUCT_SERVICE_URL = await serviceURL(PRODUCT_SERVICE);
		const warehouseResponse = await fetch(`${PRODUCT_SERVICE_URL}/warehouse?id=${id}`);
		const warehouse = await warehouseResponse.json();

		if (warehouseResponse.ok) {
			const products = warehouse.products.map((product) => {
				product.product = hypermedia('getProduct', {}, { id: product.id });
				delete product.id;
				return product;
			});

			const response = {
				location: warehouse.location,
				name: warehouse.name,
				remote: warehouse.remote,
				products,
			};

			res.send(response);
		} else {
			throw new ServiceError(warehouse.message, warehouseResponse.status);
		}
	} catch (e) {
		handleError(e, res);
	}
});

export default router;
