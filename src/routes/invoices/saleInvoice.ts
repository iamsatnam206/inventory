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
        isBlacked,
        dispatchThrough,
        products,
        totalAmount,
        id } = body;
    const controller = new SaleController(req);
    const respsone = await controller.save({
        isBlacked,
        billedFrom,
        billedTo,
        shippingAddress,
        invoiceDate,
        dispatchThrough,
        products,
        totalAmount,
        id
    });
    return res.send(respsone)
});
Route.get('/sale/getAll', async (req: Request, res: Response) => {
    const query = req.query;
    const { pageNumber, pageSize, status, isBlacked } = query;
    const controller = new SaleController(req);
    const respsone = await controller.getAll(pageNumber ? +pageNumber : 1, pageSize ? +pageSize : 20, status as string, isBlacked ? (isBlacked === 'true' ? true : false) : undefined);
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
        itemId,
        serialNumber } = body;
    const controller = new SaleController(req);
    const respsone = await controller.serialNumberEntry({
        saleInvoiceId,
        itemId,
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

Route.patch('/sale/updateSerialNumber', async (req: Request, res: Response) => {
    const body = req.body;
    const { oldSerialNumber, newSerialNumber } = body;
    const controller = new SaleController(req);
    const respsone = await controller.updateSerialNumber({
        oldSerialNumber, newSerialNumber
    });
    return res.send(respsone)
});

module.exports = Route;
