import { Router } from 'restify-router';
import { hypermedia } from '../utils/hypermedia';
const router = new Router();

const order: object = {
    orderId: "sdf093",
    mail: "a@mail.com",
    price: 3000
}

router.get({ name: 'approval', path: '/approval' }, (req, res) => {
    
});