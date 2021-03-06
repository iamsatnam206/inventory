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
    }[],
    shippingAddress: string,
    totalAmount: number,
    id?: string
}

@Tags('Invoice/Proforma')
@Route("invoice/proforma")
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
            const { billedFrom, items, billedTo, id, shippingAddress, totalAmount } = request;
            // generate order number
            const orderNo = await getOtp(100000, 10000);
            const saveResponse = await upsert(InvoiceModel, { userId: '61e7d337f9c3b4cfad6ce42d', billedFrom, shippingAddress, totalAmount, items, billedTo, ...(!id ? { orderNo } : null) }, id);
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
            // const getAllResponse = await getAll(InvoiceModel, {}, pageNumber, pageSize);
            const getAllResponse = await InvoiceModel.aggregate([
                // {
                //     $match: { ...(status ? { status } : null), ...(isBlacked !== undefined ? {isBlacked} : null) }
                // },
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
                                    from: 'products',
                                    localField: 'items.productId',
                                    foreignField: '_id',
                                    as: 'items.productSchema'
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
                                $addFields: {
                                    billedFrom: { $arrayElemAt: ["$billedFrom", 0] },
                                    billedTo: { $arrayElemAt: ["$billedTo", 0] },
                                }
                            },
                            {
                                $project: { 'product': 0 }
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