import { Router } from 'restify-router';
import hypermedia from '../utils/hypermedia';
import fetch from 'node-fetch'
const router = new Router();

const URL: string = `localhost/5050/product`

const product: any = {
  _id: "5fddc4476d39fd0051e3f332",
  name: "product G",
  price: 84,
  warehouses: [
    {
      amount: 3,
      name: "Main Warehouse v2",
      warehouse_id: "5fddc4266d39fd0051e3f331"
    }
  ],
  weight: 32
}

router.get({ name: 'product', path: '/:id' }, async (req, res) => {
  const response = await fetch(URL + `?id=${product._id}`, { method: 'GET' })
  const json = await response.json()
});