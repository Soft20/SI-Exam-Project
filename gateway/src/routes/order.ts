import { Router } from 'restify-router';
import { serviceURL } from '../eureka'
import fetch, { Response } from 'node-fetch';
import handleError from "../utils/handleError"
import hypermedia from "../utils/hypermedia"

const router = new Router();

const ORDER_APPROVAL_SERVER_ID: string = 'order-approval'
const SHIPPING_SERVICE_SERVER_ID: string = 'shipping-service'

router.get({ name: "getOrder", path: '/:id' }, async (req, res) => {
    try {

    } catch (e) {
        handleError(e, res)
    }
})

router.post({ name: 'createOrder', path: '' }, async (req, res) => {
    try {
        const { product_id, amount, email } = req.body
        console.log("product_id", product_id)
        console.log("amount", amount)
        console.log("email", email)

        // TODO get item weight
        const weight: number = amount * 42 //the meaning of life

        // shipping calc
        let URL: string = await serviceURL(SHIPPING_SERVICE_SERVER_ID)

        let response: Response = await fetch(`${URL}?weights=${weight}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        let shippingPrices: string = await response.json()
        let shippingWeight: number = weight >= 50 ? weight : 50

        let shippingPrice: number = shippingPrices[String(shippingWeight)];

        console.log(`The order will have a shipping price of ${shippingPrice}`);

        // TODO make order with product ids, shipping_price and amount?
        const order: any = {
            _id: "5fddd0bdcbd05f2e463b552d",
            amount: 1,
            confirmed: false,
            email: "dora@mail.com",
            price: 84,
            shipping_price: shippingPrice,
            product_id: "5fd4f2a8b6375cb8482e6ad0",
            weight: 150
        }

        // Send order to approval through the Camunda order-approval service.
        URL = await serviceURL(ORDER_APPROVAL_SERVER_ID)

        const totalPrice: number = order.price + order.shipping_price

        const body: any = {
            orderId: order._id,
            price: totalPrice,
            mail: order.email,
        }

        response = await fetch(`${URL}/purchase`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        })
        console.log(`Camunda responded with ${response.status}`);

        const result: any = {
            ...order,
            link: hypermedia("getOrder", { "id": order._id })
        }

        res.send(result)
    } catch (e) {
        handleError(e, res)
    }

});

router.del({ name: "delete order", path: '' }, async (req, res) => {
    try {

    } catch (e) {
        handleError(e, res)
    }
})

export default router;