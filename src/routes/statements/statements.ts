import express, { Request, Response } from 'express'
import ReceiptController from '../../controllers/statements';
const Route = express.Router();

Route.get('/getAll', async (req: Request, res: Response) => {
    const {pageNumber, pageSize, productId, startDate, endDate, } = req.query;
    const controller = new ReceiptController(req);
    const respsone = await controller.getAll(productId as string, startDate as string, endDate as string, pageNumber ? +pageNumber: 1, pageSize ? +pageSize : 20);
    return res.send(respsone)
});

module.exports = Route;
