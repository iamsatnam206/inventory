import { Route, Tags, Post, Get, Controller, Body, Query, Security } from "tsoa";
import { Response } from '../models/interfaces';
import OrderRequestModel from '../models/orderRequest';
import { getAll, upsert } from "../helpers/db";
import { Request } from "express";
import { OTHER } from "../constants/roles";

interface orderRequest {
    items: {
        productId: string,
        quantity: number,
    }[]
    id: string
}

@Tags('OrderRequest')
@Route("orderRequest")
export default class PartyController extends Controller {
    request: Request;

    constructor(request: Request) {
        super()
        this.request = request
    }
    /**
    * Requires superadmin or other auth token
    */
    @Security('Bearer')
    @Post("/save")
    public async save(@Body() request: orderRequest): Promise<Response> {
        try {
            const saveResponse = await upsert(OrderRequestModel, {items: request, partyId: this.request.body.user.id}, request.id);
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

    /**
    * Requires superadmin or other auth token
    */
    @Security('Bearer')
    @Get("/getAll")
    public async getAll(@Query('pageNumber') pageNumber: number = 1, @Query() pageSize: number = 20): Promise<Response> {
        try {
            const getAllResponse = await getAll(OrderRequestModel, (this.request.body.user.id === OTHER.id ? {partyId: this.request.body.user.id}: {}), pageNumber, pageSize);
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

    /**
    * Requires superadmin or other auth token
    */
    @Security('Bearer')
    @Get("/get")
    public async get(@Query() id: string): Promise<Response> {
        try {
            const getResponse = await OrderRequestModel.findOne({_id: id});
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