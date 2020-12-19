import { Router } from 'restify-router';
import { serviceURL } from '../eureka';
import fetch, { Response } from 'node-fetch';
import handleError from '../utils/handleError';
import hypermedia from '../utils/hypermedia';

import ServiceError from '../errors/ServiceError';

const router = new Router();

const ORDER_APPROVAL: string = 'order-approval';
const PRODUCT_SERVICE: string = 'product-service';
const SHIPPING_SERVICE: string = 'shipping-service';

const CURRENCY_URL = 'https://api.exchangeratesapi.io';
const BASE_CURRENCY = 'DKK';

router.get({ name: 'getOrder', path: '' }, async (req, res) => {
	const id: string = req.query?.id;

	try {
		const PRODUCT_SERVICE_URL = await serviceURL(PRODUCT_SERVICE);
		const orderResponse = await fetch(`${PRODUCT_SERVICE_URL}/order?id=${id}`);
		const order = await orderResponse.json();

		if (orderResponse.ok) {
			const response = {
				self: hypermedia('getOrder', {}, { id: order._id }),
				product: hypermedia('getProduct', {}, { id: order.product_id }),
				warehouse: hypermedia('getWarehouse', {}, { id: order.warehouse_id }),
				amount: order.amount,
				confirmed: order.confirmed,
				email: order.email,
				price: order.price,
				shippingPrice: order.shipping_price,
				weight: order.weight,
			};

			res.send(response);
		} else {
			throw new ServiceError(order.message, orderResponse.status);
		}
	} catch (e) {
		handleError(e, res);
	}
});

router.post({ name: 'createOrder', path: '' }, async (req, res) => {
	try {
		const { product_id, amount, email } = req.body;

		if (!product_id || !amount || !email) {
			throw new ServiceError("Please define all fields in body: 'product_id', 'amount' and 'email'", 400);
		}

		const { currency } = req.query;
		if (currency) {
			res.setHeader('conversionCurrency', currency);
		}

		res.setHeader('baseCurrency', BASE_CURRENCY);

		// ---------------PRODUCT SERVICE (GET PRODUCT WEIGHT & PRICE)-----------------------
		const PRODUCT_SERVICE_URL = await serviceURL(PRODUCT_SERVICE);
		let productResponse = await fetch(`${PRODUCT_SERVICE_URL}/product?id=${product_id}`);

		let product = await productResponse.json();

		if (productResponse.status > 300) {
			throw new ServiceError(product.message, productResponse.status);
		}

		let { weight, price } = product;
		const total_weight: number = amount * weight;

		// ---------------SHIPPING SERVICE-----------------------
		const SHIPPING_SERVICE_URL: string = await serviceURL(SHIPPING_SERVICE);
		let response: Response = await fetch(`${SHIPPING_SERVICE_URL}?weights=${total_weight}`);

		if (response.status > 300) {
			let body = await response.json();
			throw new ServiceError(body.message, response.status);
		}

		let shippingPrices: string = await response.json();

		let shippingWeight: number = total_weight >= 50 ? total_weight : 50;
		let shippingPrice: number = shippingPrices[String(shippingWeight)];
		const totalPrice: number = amount * price + shippingPrice;

		// ---------------PRODUCT SERVICE (PLACE ORDER)-----------------------
		const orderBody: any = { email, product_id, amount, shipping_price: shippingPrice };

		const orderResponse = await fetch(`${PRODUCT_SERVICE_URL}/order`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(orderBody),
		});

		if (orderResponse.status > 300) {
			let body = await orderResponse.json();
			throw new ServiceError(body.message, orderResponse.status);
		}

		const order = await orderResponse.json();

		// ---------------ORDER APPROVAL SERVICE-----------------------
		const ORDER_APPROVAL_URL = await serviceURL(ORDER_APPROVAL);

		const approvalResponse = await fetch(`${ORDER_APPROVAL_URL}/purchase`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ orderId: order._id, email, price: totalPrice, shippingPrice }),
		});

		if (approvalResponse.status > 300) {
			let body = await approvalResponse.json();
			throw new ServiceError(body.message, approvalResponse.status);
		}

		// ---------------OPTIONAL CURRENCY CONVERSION-----------------------
		const convertedTotalPrice = await convertCurrency(totalPrice, BASE_CURRENCY, currency);

		// ---------------RESULT-----------------------
		const result: any = {
			...order,
			totalPrice,
			convertedTotalPrice,
			baseCurrency: BASE_CURRENCY,
			conversionCurrency: currency,
			link: hypermedia('getOrder', {}, { id: order._id }),
		};

		res.send(result);
	} catch (e) {
		handleError(e, res);
	}
});

router.del({ name: 'deleteOrder', path: '' }, async (req, res) => {
	const id: string = req.query?.id;

	try {
		const PRODUCT_SERVICE_URL = await serviceURL(PRODUCT_SERVICE);
		const orderResponse = await fetch(`${PRODUCT_SERVICE_URL}/order?id=${id}`, { method: 'DELETE' });
		const response = await orderResponse.json();

		if (orderResponse.ok) {
			res.send(response);
		} else {
			throw new ServiceError(response.message, orderResponse.status);
		}
	} catch (e) {
		handleError(e, res);
	}
});

async function convertCurrency(amount, from, to): Promise<number> {
	if (!to || from === to) return amount;

	const currencyResponse = await fetch(`${CURRENCY_URL}/latest?base=${from}`);

	const currencyRates = await currencyResponse.json();

	const rate = currencyRates.rates[to];

	return rate * amount;
}

export default router;
