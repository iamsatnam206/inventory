import express, { Request, Response } from 'express'
import AmountController from '../../controllers/amount';
const Route = express.Router();

Route.get('/getAll', async (req: Request, res: Response) => {
    const {pageNumber, pageSize, startDate, endDate, } = req.query;
    const controller = new AmountController(req);
    const respsone = await controller.getAll(startDate as string, endDate as string, pageNumber ? +pageNumber: 1, pageSize ? +pageSize : 20);
    return res.send(respsone)
});

module.exports = Route;
