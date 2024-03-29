import express, { Request, Response } from 'express'
import NotesController from '../../controllers/notes';
import { OtherAuth } from '../../middlewares/auth';
const Route = express.Router();

Route.post('/save', async (req: Request, res: Response) => {
    const body = req.body;
    const {
        fromParty,
        toParty,
        receiptDate,
        products,
        isDeliveryNote,
        totalAmount,
        shippingAddress,
        id
    } = body;
    const controller = new NotesController(req);
    const respsone = await controller.save({
        fromParty,
        toParty,
        receiptDate,
        totalAmount,
        shippingAddress,
        products,
        isDeliveryNote,
        id
    });
    return res.send(respsone)
});
Route.get('/getAll', async (req: Request, res: Response) => {
    const query = req.query;
    const { pageNumber, pageSize } = query;
    const controller = new NotesController(req);
    const respsone = await controller.getAll(pageNumber ? +pageNumber : 1, pageSize ? +pageSize : 20);
    return res.send(respsone)
});
Route.get('/get', async (req: Request, res: Response) => {
    const query = req.query.id;
    const controller = new NotesController(req);
    if (query) {
        const respsone = await controller.get(query.toString());
        return res.send(respsone)
    }
});
Route.patch('/cancelNote', async (req: Request, res: Response) => {
    const body = req.body;
    const { id, cancel } = body;
    const controller = new NotesController(req);
    const respsone = await controller.cancelNote({
        id, cancel
    });
    return res.send(respsone)
});

Route.delete('/delete', async (req: Request, res: Response) => {
    const query = req.query.id;
    const controller = new NotesController(req);
    if (query) {
        const respsone = await controller.delete(query.toString());
        return res.send(respsone)
    } else {
        res.send({
            data: null,
            error: 'Please enter a valid id',
            message: '',
            status: 400
        })
    }
});

module.exports = Route;
