import express, { Request, Response } from 'express'
import InvoiceController from '../../controllers/invoice';
const Route = express.Router();

Route.get('/get', async (req: Request, res: Response) => {
    const {type, invoiceId} = req.query;
    const controller = new InvoiceController(res);
    const respsone = await controller.get(invoiceId as string, type as string);
});

module.exports = Route;