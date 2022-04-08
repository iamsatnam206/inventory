import { Route, Tags, Post, Get, Controller, Body, Query, Delete } from "tsoa";
import { Response } from '../models/interfaces';
import CategoryModel from '../models/cateory';
import ProductModel from '../models/products';

import { getAll, upsert } from "../helpers/db";

interface category {
    name: string,
    id?: string
}

@Tags('Category')
@Route("category")
export default class PartyController extends Controller {

    @Post("/save")
    public async save(@Body() request: category): Promise<Response> {
        try {
            const saveResponse = await upsert(CategoryModel, request, request.id);
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
    public async getAll(@Query() filter = '', @Query('pageNumber') pageNumber: number = 1, @Query() pageSize: number = 20): Promise<Response> {
        try {
            const getAllResponse = await getAll(CategoryModel, {
                ...(filter ? { $text: { $search: filter, $caseSensitive: false } } : null)
            }, pageNumber, pageSize);
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


    @Delete("/delete")
    public async delete(@Query() id: string): Promise<Response> {
        try {
            const getResponse = await ProductModel.findOne({itemCategory: id});
            if(!getResponse) {
                const delResp = await CategoryModel.deleteOne({_id: id});
                return {
                    data: delResp,
                    error: '',
                    message: 'Success',
                    status: 200
                }
            } else {
                throw new Error('Product exists!')
            }
        }
        catch (err: any) {
            return {
                data: null,
                error: err.message ? err.message : err,
                message: '',
                status: 400
            }
        }
    }
}