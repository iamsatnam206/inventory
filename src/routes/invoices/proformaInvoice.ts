import express, { Request, Response } from 'express'
import InvoiceController from '../../controllers/proformaInvoices';
import { OtherAuth } from '../../middlewares/auth';
const Route = express.Router();

Route.post('/proforma/save', async (req: Request, res: Response) => {
    const body = req.body;
    const { billedFrom,
        billedTo,
        items,
        shippingAddress, 
        totalAmount,
        id } = body;
    const controller = new InvoiceController(req);
    const respsone = await controller.save({
        billedFrom,
        billedTo,
        items,
        shippingAddress, 
        totalAmount,
        id
    });
    return res.send(respsone)
});
Route.get('/proforma/getAll', async (req: Request, res: Response) => {
    const query = req.query;
    const { pageNumber, pageSize } = query;
    const controller = new InvoiceController(req);
    const respsone = await controller.getAll(pageNumber ? +pageNumber : 1, pageSize ? +pageSize : 20);
    return res.send(respsone)
});
Route.get('/proforma/get', async (req: Request, res: Response) => {
    const query = req.query.id;
    const controller = new InvoiceController(req);
    if (query) {
        const respsone = await controller.get(query.toString());
        return res.send(respsone)
    }
});

Route.patch('/proforma/cancelProformaInvoice', async (req: Request, res: Response) => {
    const body = req.body;
    const { id, cancel } = body;
    const controller = new InvoiceController(req);
    const respsone = await controller.cancelProformaInvoice({
        id, cancel
    });
    return res.send(respsone)
});

Route.delete('/proforma/delete', async (req: Request, res: Response) => {
    const query = req.query.id;
    const controller = new InvoiceController(req);
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
