import { Route, Tags, Post, Path, Controller, Body, Get, Query } from "tsoa";
import { getAll, upsert } from "../helpers/db";
import { Response } from '../models/interfaces';
import ProductModel from '../models/products';

interface product {
    itemName: string,
    itemCategory: string,
    description: string,
    hsnCode: number,
    taxSlab: number,
    company: string,
    hsnCodeDescription: string, 
    units: number, 
    openingQuantity: number,
    id?: string
}

@Tags('Product')
@Route("product")
export default class PartyController extends Controller {

    @Post("/save")
    public async save(@Body() request: product): Promise<Response> {
        try {
            const saveResponse = await upsert(ProductModel, request, request.id);
            return {
                data: saveResponse,
                error: '',
                message: 'Success',
                status: 200
            }
        }
        catch (err: any) {
            console.log(err);
            
            return {
                data: null,
                error: err.message ? err.message : err,
                message: '',
                status: 400
            }
        }
    }
    @Get("/getAll")
    public async getAll(@Query('pageNumber') pageNumber: number = 1, @Query() pageSize: number = 20): Promise<Response> {
        try {
            const getAllResponse = await getAll(ProductModel, {}, pageNumber, pageSize);
            return {
                data: getAllResponse,
                error: '',
                message: 'Success',
                status: 200
            }
        }
        catch (err: any) {
            console.log(err);
            
            return {
                data: null,
                error: err.message ? err.message : err,
                message: '',
                status: 400
            }
        }
    }
    @Get("/get")
    public async get(@Query() id: string): Promise<Response> {
        try {
            console.log('id here', id);
            
            const getResponse = await ProductModel.findOne({_id: id});
            return {
                data: getResponse,
                error: '',
                message: 'Success',
                status: 200
            }
        }
        catch (err: any) {
            console.log(err);
            
            return {
                data: null,
                error: err.message ? err.message : err,
                message: '',
                status: 400
            }
        }
    }

}