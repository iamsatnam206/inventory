import express from 'express';
import CategoryController from '../controllers/category';
import PartyController from '../controllers/party';
import ProductController from '../controllers/product';

import OrderRequestController from '../controllers/OrderRequest';
import ProformaController from '../controllers/proformaInvoices';
import SaleController from '../controllers/saleInvoice';
import PurchaseController from '../controllers/purchaseInvoice';
import ReceiptController from '../controllers/receipt';
import NotesController from '../controllers/notes';
import StatementController from '../controllers/statements';





const Route = express.Router();

const partyRoute = require('./party');
const statementRoute = require('./statements');
const cateoryRoute = require('./category');
const productRoute = require('./product');
const orderRequestRoute = require('./orderRequest');
const invoiceRoute = require('./invoices');
const notesRoute = require('./notes');
const receiptRoute = require('./receipt');

for (const property in notesRoute) {
  Route.use('/notes', notesRoute[property]);
}
for (const property in statementRoute) {
  Route.use('/statements', statementRoute[property]);
}
for (const property in receiptRoute) {
  Route.use('/receipt', receiptRoute[property]);
}


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