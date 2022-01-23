import express, { Request, Response, NextFunction } from 'express'
import PartyController from '../../controllers/party';
import { OtherAuth } from '../../middlewares/auth';
const Route = express.Router();

Route.post('/save', async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const { name,
        address,
        gstNumber,
        phone,
        pinCode,
        contactPerson,
        userName,
        password, state, openingBalance, id } = body;
    const controller = new PartyController();
    if (id) {
        await OtherAuth(req, res, () => {
        })
        if (req.body.user._id !== id) {
            return res.send({
                data: null,
                error: 'Unauthorized',
                message: '',
                status: 400
            })
        }

    }
    const respsone = await controller.save({
        name,
        address,
        gstNumber,
        phone,
        pinCode,
        contactPerson, openingBalance,
        state,
        userName,
        password,
        id
    });
    return res.send(respsone)
});
Route.post('/login', async (req: Request, res: Response) => {
    const body = req.body;
    const {
        userName,
        password, token } = body;
    const controller = new PartyController();
    const respsone = await controller.login({
        userName,
        password, token
    });
    return res.send(respsone)
});

Route.get('/getAll', OtherAuth, async (req: Request, res: Response) => {
    const { pageNumber, pageSize } = req.query;
    const controller = new PartyController();
    const respsone = await controller.getAll(pageNumber ? +pageNumber : 1, pageSize ? +pageSize : 20);
    return res.send(respsone)
});
Route.get('/get', OtherAuth, async (req: Request, res: Response) => {
    const query = req.query.id;
    const controller = new PartyController();
    if (query) {
        const respsone = await controller.get(query.toString());
        return res.send(respsone)
    }
});

module.exports = Route;
