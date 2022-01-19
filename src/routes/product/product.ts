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
        company } = req.body;
    const controller = new ProductController();
    const respsone = await controller.save({itemName,
        itemCategory,
        description,
        hsnCode,
        taxSlab,
        company});
    return res.send(respsone)
});

Route.get('/getAll', async (req: Request, res: Response) => {
    const controller = new ProductController();
    const respsone = await controller.getAll();
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
