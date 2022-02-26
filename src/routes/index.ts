import express from 'express';
import CategoryController from '../controllers/category';
import PartyController from '../controllers/party';
import ProductController from '../controllers/product';

import OrderRequestController from '../controllers/OrderRequest';
import InvoiceController from '../controllers/invoices';



const Route = express.Router();

const partyRoute = require('./party');
const cateoryRoute = require('./category');
const productRoute = require('./product');
const orderRequestRoute = require('./orderRequest');
const invoiceRoute = require('./invoices');


for (const property in partyRoute) {
  Route.use('/party', partyRoute[property]);
}
for (const property in invoiceRoute) {
  Route.use('/invoice', invoiceRoute[property]);
}
for (const property in cateoryRoute) {
  Route.use('/category', cateoryRoute[property]);
}
for (const property in productRoute) {
  Route.use('/product', productRoute[property]);
}
for (const property in orderRequestRoute) {
  Route.use('/orderRequest', orderRequestRoute[property]);
}

// Route.get("/", async (req, res) => {
//   const controller = new PingController();
//   const response = await controller.getMessage();
//   return res.send(response);
// });

export default Route;