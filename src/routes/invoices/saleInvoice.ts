import express, { Request, Response } from 'express'
import SaleController from '../../controllers/saleInvoice';
import { OtherAuth } from '../../middlewares/auth';
const Route = express.Router();

Route.post('/sale/save', async (req: Request, res: Response) => {
    const body = req.body;
    const { billedFrom,
        billedTo,
        shippingAddress,
        invoiceDate,
        dispatchThrough,
        products,
        id } = body;
    const controller = new SaleController(req);
    const respsone = await controller.save({
        billedFrom,
        billedTo,
        shippingAddress,
        invoiceDate,
        dispatchThrough,
        products,
        id
    });
    return res.send(respsone)
});
Route.get('/sale/getAll', async (req: Request, res: Response) => {
    const query = req.query;
    const { pageNumber, pageSize, status } = query;
    const controller = new SaleController(req);
    const respsone = await controller.getAll(pageNumber ? +pageNumber : 1, pageSize ? +pageSize : 20, status as string);
    return res.send(respsone)
});
Route.get('/sale/get', async (req: Request, res: Response) => {
    const query = req.query.id;
    const controller = new SaleController(req);
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

Route.post('/sale/serialNumberEntry', async (req: Request, res: Response) => {
    const body = req.body;
    const { saleInvoiceId,
        productId,
        serialNumber } = body;
    const controller = new SaleController(req);
    const respsone = await controller.serialNumberEntry({
        saleInvoiceId,
        productId,
        serialNumber
    });
    return res.send(respsone)
});
Route.post('/sale/confirmInvoice', async (req: Request, res: Response) => {
    const body = req.body;
    const { saleInvoiceId } = body;
    const controller = new SaleController(req);
    const respsone = await controller.confirmInvoice({
        saleInvoiceId
    });
    return res.send(respsone)
});
Route.post('/sale/approveInvoice', async (req: Request, res: Response) => {
    const body = req.body;
    const { saleInvoiceId } = body;
    const controller = new SaleController(req);
    const respsone = await controller.approveInvoice({
        saleInvoiceId
    });
    return res.send(respsone)
});

module.exports = Route;
