import express from 'express';
import PingController from '../controllers/ping';
import PartyController from '../controllers/party';

const Route = express.Router();

const partyRoute = require('./party');
const pingRoute = require('./ping');

for (const property in partyRoute) {
  Route.use('/party', partyRoute[property]);
}

for (const property in pingRoute) {
  Route.use('/ping', pingRoute[property]);
}

// Route.get("/", async (req, res) => {
//   const controller = new PingController();
//   const response = await controller.getMessage();
//   return res.send(response);
// });

export default Route;