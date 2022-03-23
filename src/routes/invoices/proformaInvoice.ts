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
// Route.get('/get', (req: Request, res: Response) => {
//     const controller = new PartyController();
//     const respsone = controller.login();
//     return res.send(respsone)
// });

module.exports = Route;
