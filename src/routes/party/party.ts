import express, { Request, Response } from 'express'
import PartyController from '../../controllers/party';
const Route = express.Router();

Route.post('/save', async (req: Request, res: Response) => {
    const body = req.body;
    const { name,
        address,
        gstNumber,
        phone,
        pinCode,
        contactPerson,
        userName,
        password } = req.body;
    const controller = new PartyController();
    const respsone = await controller.save({name,
        address,
        gstNumber,
        phone,
        pinCode,
        contactPerson,
        userName,
        password});
    return res.send(respsone)
});
Route.post('/login', (req: Request, res: Response) => {
    const controller = new PartyController();
    const respsone = controller.login();
    return res.send(respsone)
});

Route.get('/getAll', async (req: Request, res: Response) => {
    const controller = new PartyController();
    const respsone = await controller.getAll();
    return res.send(respsone)
});
Route.get('/get', async (req: Request, res: Response) => {
    const query = req.query.id;
    const controller = new PartyController();
    if(query) {
        const respsone = await controller.get(query.toString());
        return res.send(respsone)
    }
});

module.exports = Route;
