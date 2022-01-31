import express, { Request, Response } from 'express'
import OrderRequestController from '../../controllers/OrderRequest';
import { OtherAuth } from '../../middlewares/auth';
const Route = express.Router();

Route.post('/save', OtherAuth, async (req: Request, res: Response) => {
    const body = req.body;
    const { items } = body;
    const controller = new OrderRequestController(req);
    const respsone = await controller.save(items);
    return res.send(respsone)
});
Route.get('/getAll', OtherAuth, async (req: Request, res: Response) => {
    const query = req.query;
    const {pageNumber, pageSize} = query;
    const controller = new OrderRequestController(req);
    const respsone = await controller.getAll(pageNumber ? +pageNumber: 1, pageSize ? +pageSize : 20);
    return res.send(respsone)
});
Route.get('/get', OtherAuth, async (req: Request, res: Response) => {
    const query = req.query.id;
    const controller = new OrderRequestController(req);
    if(query) {
        const respsone = await controller.get(query.toString());
        return res.send(respsone)
    }
});
// Route.get('/get', (req: Request, res: Response) => {
//     const controller = new PartyController();
//     const respsone = controller.login();
//     return res.send(respsone)
// });

module.exports = Route;
