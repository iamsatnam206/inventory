import { Route, Tags, Post, Get, Controller, Body, Query, Security } from "tsoa";
import { Response } from '../models/interfaces';
import InvoiceModel from '../models/proformaInvoice';
import { getAll, upsert } from "../helpers/db";
import { getOtp } from '../helpers/utility'
import { Request } from "express";

interface invoiceRequest {
    billedFrom: string,
    billedTo: string,
    items: {
        productId: string,
        quantity: number,
        rate: number,
        discount: number
    }[]
    id: string
}

@Tags('ProformaInvoice')
@Route("proformaInvoice")
export default class PartyController extends Controller {
    request: Request;

    constructor(request: Request) {
        super()
        this.request = request
    }

    // @Security('Bearer')
    @Post("/save")
    public async save(@Body() request: invoiceRequest): Promise<Response> {
        try {
            const { billedFrom, items, billedTo, id } = request;
            // generate order number
            const orderNo = getOtp(100000, 10000);
            const saveResponse = await upsert(InvoiceModel, { billedFrom, items, billedTo, ...(id ? {orderNo} : null) }, id);
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
            const getAllResponse = await getAll(InvoiceModel, {}, pageNumber, pageSize);
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
            const getResponse = await InvoiceModel.findOne({ _id: id });
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