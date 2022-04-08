import express, { Request, Response } from 'express'
import ProductController from '../../controllers/product';
const Route = express.Router();

Route.post('/save', async (req: Request, res: Response) => {
    const body = req.body;
    const { itemName,
        itemCategory,
        description,
        hsnCode,
        taxSlab,
        company, hsnCodeDescription, units, openingQuantity, id } = body;
    const controller = new ProductController();
    const respsone = await controller.save({itemName,
        itemCategory,
        description,
        hsnCode,
        taxSlab,
        company, hsnCodeDescription, units, openingQuantity, id});
    return res.send(respsone)
});

Route.get('/getAll', async (req: Request, res: Response) => {
    const {pageNumber, pageSize, itemCategory, filter} = req.query;
    const controller = new ProductController();
    const respsone = await controller.getAll(filter as string, pageNumber ? +pageNumber: 1, pageSize ? +pageSize : 20, itemCategory as string);
    return res.send(respsone)
});
Route.get('/get', async (req: Request, res: Response) => {
    const query = req.query.id;
    const controller = new ProductController();
    if(query) {
        const respsone = await controller.get(query.toString());
        return res.send(respsone)
    }
});

module.exports = Route;
