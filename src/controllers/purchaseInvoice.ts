import { Route, Tags, Post, Get, Controller, Body, Query, Security } from "tsoa";
import { Response } from '../models/interfaces';
import PurchaseInvoice from '../models/purchaseInvoice';
import ProductsModel from '../models/products';


import { getAll, upsert } from "../helpers/db";
import { Request } from "express";
import StatementController from "./statements";

interface IPurchaseInvoice {
    billedFrom: string,
    billedTo: string,
    invoiceDate: string,
    products: {
        productId: string,
        quantity: number,
        amountWithoutTax: number
    }[],
    id?: string
}

@Tags('Invoice/Purchase')
@Route("invoice/purchase")
export default class PartyController extends Controller {
    request: Request;

    constructor(request: Request) {
        super()
        this.request = request
    }

    // @Security('Bearer')
    @Post("/save")
    public async save(@Body() request: IPurchaseInvoice): Promise<Response> {
        try {
            const {
                billedFrom,
                billedTo,
                invoiceDate,
                products,
                id } = request;
            const saveResponse = await upsert(PurchaseInvoice, {
                billedFrom,
                billedTo,
                invoiceDate,
                products
            }, id);
            // make effect in products
            const productEffect = await ProductsModel.bulkWrite([
                products.map((val: { productId: string, quantity: number }) => {
                    return {
                        updateOne: {
                            filter: { _id: val.productId },
                            update: { $inc: { openingQuantity: val.quantity } }
                        }
                    }
                })
            ])

            // update the statement
            const controller = new StatementController(this.request);
            controller.save(products.map((val: { productId: string, quantity: number }) => {
                return {
                    quantityAdded: val.quantity, quantitySubtracted: 0, productId: val.productId, partyId: saveResponse.billedTo
                }
            }))
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
            const getAllResponse = await getAll(PurchaseInvoice, {}, pageNumber, pageSize);
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
            const getResponse = await PurchaseInvoice.findOne({ _id: id });
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