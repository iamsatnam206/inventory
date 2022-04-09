import { Route, Tags, Post, Get, Controller, Body, Query, Security } from "tsoa";
import { Response } from '../models/interfaces';
import SaleInvoice from '../models/saleInvoice';
import ProductsModel from '../models/products';

import { getAll, getById, upsert } from "../helpers/db";
import { Request } from "express";
import StatementController from "./statements";

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
    }[],
    totalAmount: number,
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
                totalAmount,
                id } = request;
            const saveResponse = await upsert(SaleInvoice, {
                billedFrom,
                billedTo,
                shippingAddress,
                invoiceDate,
                dispatchThrough,
                products,
                totalAmount
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
    public async getAll(@Query('pageNumber') pageNumber: number = 1, @Query() pageSize: number = 20, @Query() status: string = ''): Promise<Response> {
        try {
            if (status && (status !== 'PENDING' && status !== 'APPROVED' && status !== 'CONFIRM')) {
                throw new Error('Status is incorrect!');
            }
            // const getAllResponse = await getAll(SaleInvoice, {
            //     ...(status ? { status } : null)
            // }, pageNumber, pageSize);
            const getAllResponse = await SaleInvoice.aggregate([
                {
                    $match: { ...(status ? { status } : null) }
                },
                {
                    $facet: {
                        totalCount: [
                            { $count: 'totalItems' }
                        ],
                        items: [
                            {
                                $skip: (pageNumber - 1) * pageSize
                            },
                            {
                                $limit: pageSize
                            },
                            {
                                $lookup: {
                                    from: 'parties',
                                    localField: 'billedFrom',
                                    foreignField: '_id',
                                    as: 'billedFrom'
                                }
                            },
                            {
                                $lookup: {
                                    from: 'parties',
                                    localField: 'billedTo',
                                    foreignField: '_id',
                                    as: 'billedTo'
                                }
                            },
                            {
                                $lookup: {
                                    from: 'products',
                                    localField: 'products.productId',
                                    foreignField: '_id',
                                    as: 'product'
                                }
                            },
                            {
                                $addFields: {
                                    billedFrom: { $arrayElemAt: ["$billedFrom", 0] },
                                    billedTo: { $arrayElemAt: ["$billedTo", 0] },
                                    'products.productData': {$first: '$product'}
                                }
                            },
                            {
                                $project: {'product': 0}
                            }
                            // {
                            //     $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$brandDoc", 0] }, "$$ROOT"] } }
                            // },

                        ]
                    },
                },
                {
                    $replaceWith: {
                        totalItems: {
                            $sum: "$totalCount.totalItems"
                        }, items: "$items"
                    }
                },
                {
                    $addFields: {
                        pageNumber: pageNumber,
                        pageSize: pageSize
                    }
                },

            ]).exec()
            return {
                data: getAllResponse[0],
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
            if (serialNumber.length < 5) {
                throw new Error('Serial number should be atleast 5 chars long')
            }
            const theOne = await getById(SaleInvoice, saleInvoiceId);
            if (!theOne) {
                throw new Error('Invoice doesn\'t exists')
            }
            const products = theOne.products; 
            console.log(products);
            
            const oneProduct = products.find((val: { productId: any }) => val.productId.equals(productId));
            if (!oneProduct) {
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
    public async confirmInvoice(@Body() request: { saleInvoiceId: string }): Promise<Response> {
        try {
            const { saleInvoiceId } = request;
            const theOne = await getById(SaleInvoice, saleInvoiceId);
            if (!theOne) {
                throw new Error('Invoice doesn\'t exists')
            }
            const products = theOne.products;
            const isEmpty = products.some((val: { _id: string, serialNumber: string }) => val.serialNumber === '');
            if (isEmpty) {
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
    public async approveInvoice(@Body() request: { saleInvoiceId: string }): Promise<Response> {
        try {
            const { saleInvoiceId } = request;
            const theOne = await getById(SaleInvoice, saleInvoiceId);
            if (!theOne) {
                throw new Error('Invoice doesn\'t exists')
            }
            if (theOne.status !== 'CONFIRM') {
                throw new Error('Order not confirmed');
            }
            // save now
            const saveResponse = await upsert(SaleInvoice, { ...theOne, status: 'APPROVED' }, saleInvoiceId);
            const products = theOne.products;

            // make effect in products
            const productEffect = await ProductsModel.bulkWrite([
                ...products.map((val: { productId: string, quantity: number }) => {
                    return {
                        updateOne: {
                            filter: { _id: val.productId },
                            update: { $inc: { openingQuantity: -val.quantity } }
                        }
                    }
                })
            ])
            // update the statement
            const controller = new StatementController(this.request);
            controller.save(products.map((val: { productId: string, quantity: number }) => {
                return {
                    quantityAdded: 0, quantitySubtracted: val.quantity, productId: val.productId, fromParty: theOne.billedFrom, toParty: theOne.billedTo
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
}