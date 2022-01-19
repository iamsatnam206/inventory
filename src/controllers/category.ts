import { Route, Tags, Post, Get, Controller, Body, Query } from "tsoa";
import { Response } from '../models/interfaces';
import CategoryModel from '../models/cateory';

interface category {
    name: string,
}

@Tags('Category')
@Route("category")
export default class PartyController extends Controller {

    @Post("/save")
    public async save(@Body() request: category): Promise<Response> {
        try {
            const saveResponse = await CategoryModel.create(request);
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
    public async getAll(): Promise<Response> {
        try {
            const getAllResponse = await CategoryModel.find();
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
            
            const getResponse = await CategoryModel.findOne({_id: id});
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