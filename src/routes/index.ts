import express from 'express';
import CategoryController from '../controllers/category';
import PartyController from '../controllers/party';
import ProductController from '../controllers/product';

const Route = express.Router();

const partyRoute = require('./party');
const cateoryRoute = require('./category');
const productRoute = require('./product');


for (const property in partyRoute) {
  Route.use('/party', partyRoute[property]);
}
for (const property in cateoryRoute) {
  Route.use('/category', cateoryRoute[property]);
}
for (const property in productRoute) {
  Route.use('/product', productRoute[property]);
}

// Route.get("/", async (req, res) => {
//   const controller = new PingController();
//   const response = await controller.getMessage();
//   return res.send(response);
// });

export default Route;