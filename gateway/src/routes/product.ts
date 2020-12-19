import { Router } from 'restify-router';
import { serviceURL } from '../eureka';
import fetch, { Response } from 'node-fetch';
import handleError from '../utils/handleError';
import hypermedia from '../utils/hypermedia';

import ServiceError from '../errors/ServiceError';

const router = new Router();

const PRODUCT_SERVICE: string = 'product-service';

router.get({ name: 'getProduct', path: '' }, async (req, res) => {
	const id: string = req.query?.id;

	try {
		const PRODUCT_SERVICE_URL = await serviceURL(PRODUCT_SERVICE);
		const productResponse = await fetch(`${PRODUCT_SERVICE_URL}/product?id=${id}`);
		const product = await productResponse.json();

		if (productResponse.ok) {
			const warehouses = product.warehouses.map((warehouse) => {
				warehouse.warehouse = hypermedia('getWarehouse', {}, { id: warehouse.warehouse_id });
				delete warehouse.warehouse_id;
				return warehouse;
			});

			const response = {
				self: hypermedia('getProduct', {}, { id: product._id }),
				name: product.name,
				price: product.price,
				weight: product.weight,
				warehouses,
			};

			res.send(response);
		} else {
			throw new ServiceError(product.message, productResponse.status);
		}
	} catch (e) {
		handleError(e, res);
	}
});

export default router;
