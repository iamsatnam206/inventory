import express, { Request, Response } from 'express'
import PartyController from '../../controllers/party';
const Route = express.Router();

Route.post('/save', (req: Request, res: Response) => {
    const controller = new PartyController();
    const respsone = controller.save({phoneNumber: 0, username: ''});
    return res.send(respsone)
});
Route.post('/login', (req: Request, res: Response) => {
    const controller = new PartyController();
    const respsone = controller.login();
    return res.send(respsone)
});

module.exports = Route;
