import { Route, Tags, Post, Get, Controller, Body, Query, Security } from "tsoa";
import { Response } from '../models/interfaces';
import SaleInvoice from '../models/saleInvoice';
import { getAll, getById, upsert } from "../helpers/db";
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
interface saleInvoiceSerial {
    saleInvoiceId: string,
    productId: string,
    serialNumber: string
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
    @Post("/serialNumberEntry")
    public async serialNumberEntry(@Body() request: saleInvoiceSerial): Promise<Response> {
        try {
            const { saleInvoiceId,
                productId,
                serialNumber } = request;
                if(serialNumber.length < 5) {
                    throw new Error('Serial number should be atleast 5 chars long')
                }
            const theOne = await getById(SaleInvoice, saleInvoiceId);
            if(!theOne) {
                throw new Error('Invoice doesn\'t exists')
            }
            const products = theOne.products;
            const oneProduct = products.find((val: {_id: string}) => val._id === productId);
            if(!oneProduct) {
                throw new Error('No Such Product');
            }
            oneProduct.serialNumber = serialNumber;
            // save now
            const saveResponse = await upsert(SaleInvoice, theOne, saleInvoiceId);
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

    @Post("/confirmInvoice")
    public async confirmInvoice(@Body() request: {saleInvoiceId: string}): Promise<Response> {
        try {
            const { saleInvoiceId } = request;
            const theOne = await getById(SaleInvoice, saleInvoiceId);
            if(!theOne) {
                throw new Error('Invoice doesn\'t exists')
            }
            const products = theOne.products;
            const isEmpty = products.some((val: {_id: string, serialNumber: string}) => val.serialNumber === '');
            if(isEmpty) {
                throw new Error('Missing serial numbers on some products');
            }
            theOne.status = 'CONFIRM'
            // save now
            const saveResponse = await upsert(SaleInvoice, theOne, saleInvoiceId);
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
    @Post("/approveInvoice")
    public async approveInvoice(@Body() request: {saleInvoiceId: string}): Promise<Response> {
        try {
            const { saleInvoiceId } = request;
            const theOne = await getById(SaleInvoice, saleInvoiceId);
            if(!theOne) {
                throw new Error('Invoice doesn\'t exists')
            }
            if(theOne.status !== 'CONFIRM') {
                throw new Error('Order not confirmed');
            }
            // save now
            const saveResponse = await upsert(SaleInvoice, {...theOne, status: 'APPROVED'}, saleInvoiceId);
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
}