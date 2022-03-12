import { Route, Tags, Post, Get, Controller, Body, Query, Security } from "tsoa";
import { Response } from '../models/interfaces';
import SaleInvoice from '../models/saleInvoice';
import { getAll, upsert } from "../helpers/db";
import { Request } from "express";

interface saleInvoice {
    billedFrom: string,
    billedTo: string,
    shippingAddress: string,
    invoiceDate: string,
    dispatchThrough: string,
    products: {
        productId: string,
        quantity: number,
        rate: number,
        discount: number
    }
    id?: string
}

@Tags('Invoice/Sale')
@Route("invoice/sale")
export default class PartyController extends Controller {
    request: Request;

    constructor(request: Request) {
        super()
        this.request = request
    }

    // @Security('Bearer')
    @Post("/save")
    public async save(@Body() request: saleInvoice): Promise<Response> {
        try {
            const { billedFrom,
                billedTo,
                shippingAddress,
                invoiceDate,
                dispatchThrough,
                products,
                id } = request;
            const saveResponse = await upsert(SaleInvoice, {
                billedFrom,
                billedTo,
                shippingAddress,
                invoiceDate,
                dispatchThrough,
                products
            }, id);
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

    // @Security('Bearer')
    @Get("/getAll")
    public async getAll(@Query('pageNumber') pageNumber: number = 1, @Query() pageSize: number = 20): Promise<Response> {
        try {
            const getAllResponse = await getAll(SaleInvoice, {}, pageNumber, pageSize);
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

    // @Security('Bearer')
    @Get("/get")
    public async get(@Query() id: string): Promise<Response> {
        try {
            const getResponse = await SaleInvoice.findOne({ _id: id });
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