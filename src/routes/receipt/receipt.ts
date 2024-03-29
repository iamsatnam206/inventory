import express, { Request, Response } from 'express'
import ReceiptController from '../../controllers/receipt';
const Route = express.Router();

Route.post('/save', async (req: Request, res: Response) => {
    const body = req.body;
    const { receiptDate,
        fromParty,
        toParty,
        amount,
        refNo,
        isPayment,
        id } = body;
    const controller = new ReceiptController(req);
    const respsone = await controller.save({
        receiptDate,
        fromParty,
        toParty,
        amount,
        refNo,
        isPayment,
        id});
    return res.send(respsone)
});

Route.get('/getAll', async (req: Request, res: Response) => {
    const {pageNumber, pageSize} = req.query;
    const controller = new ReceiptController(req);
    const respsone = await controller.getAll(pageNumber ? +pageNumber: 1, pageSize ? +pageSize : 20);
    return res.send(respsone)
});
Route.get('/get', async (req: Request, res: Response) => {
    const query = req.query.id;
    const controller = new ReceiptController(req);
    if(query) {
        const respsone = await controller.get(query.toString());
        return res.send(respsone)
    }
});

Route.patch('/cancelReceipt', async (req: Request, res: Response) => {
    const body = req.body;
    const { id, cancel } = body;
    const controller = new ReceiptController(req);
    const respsone = await controller.cancelReceipt({
        id, cancel
    });
    return res.send(respsone)
});

Route.delete('/delete', async (req: Request, res: Response) => {
    const query = req.query.id;
    const controller = new ReceiptController(req);
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
