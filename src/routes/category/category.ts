import express, { Request, Response } from 'express'
import CategoryController from '../../controllers/category';
const Route = express.Router();

Route.post('/save', async (req: Request, res: Response) => {
    const body = req.body;
    const { name } = body;
    const controller = new CategoryController();
    const respsone = await controller.save({name});
    return res.send(respsone)
});
Route.get('/getAll', async (req: Request, res: Response) => {
    const controller = new CategoryController();
    const respsone = await controller.getAll();
    return res.send(respsone)
});
Route.get('/get', async (req: Request, res: Response) => {
    const query = req.query.id;
    const controller = new CategoryController();
    if(query) {
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
