import { Route, Tags, Post, Get, Controller, Body, Query, Patch, Delete } from "tsoa";
import { Response } from '../models/interfaces';
import InvoiceModel from '../models/proformaInvoice';
import { deleteById, getAll, upsert } from "../helpers/db";
import { getOtp } from '../helpers/utility'
import { Request } from "express";
import { Types } from "mongoose";

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
                    $sort: {createdAt: -1}
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
                            // {
                            //     $lookup: {
                            //         from: 'products',
                            //         localField: 'items.productId',
                            //         foreignField: '_id',
                            //         as: 'item'
                            //     }
                            // },
                            {
                                $unwind: "$items"
                            },
                            {
                                $lookup: {
                                    from: 'products',
                                    localField: 'items.productId',
                                    foreignField: '_id',
                                    as: 'item'
                                }
                            },
                            {
                                $group: {
                                    _id: "$_id",
                                    orderNo: {$first: "$orderNo"},
                                    billedFrom: {$first: "$billedFrom"},
                                    billedTo: {$first: "$billedTo"},
                                    shippingAddress:{$first: "$shippingAddress"},
                                    totalAmount: {$first: "$totalAmount"},
                                    userId: {$first: "$userId"},
                                    approved: {$first: "$approved"},
                                    status: {$first: "$status"},
                                    createdAt: {$first: "$createdAt"},
                                    items: {
                                        $push: {
                                            productDetails: {$first: "$item"},
                                            discount: "$items.discount",
                                            rate: "$items.rate",
                                            quantity: "$items.quantity",
                                            productId: "$items.productId"
                                        }
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: 'parties',
                                    localField: 'billedFrom',
                                    foreignField: '_id',
                                    as: 'billedFrom'
                                }
                            },
                            // {
                            //     $lookup: {
                            //         from: 'products',
                            //         let: { id: "$items.productId", rate: "$items.rate", quantity: "$items.quantity", discount: "$items.discount" },
                            //         as: 'item',
                            //         pipeline: [
                            //             {
                            //                 $match: {
                            //                     $expr: {

                            //                         $and: [
                            //                             // { $eq: ['$$id', "$_id"] },
                            //                         ]
                            //                     }
                            //                 }
                            //             },
                            //             // {
                            //             //     $addFields: {
                            //             //         rate: {$first: "$$rate"},
                            //             //         productId: {$first: "$$id"},
                            //             //         quantity: {$first: "$$quantity"},
                            //             //         discount: {$first: "$$discount"}
                            //             //     }
                            //             // }
                            //         ]
                            //     }
                            // },


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
            // const getResponse = await InvoiceModel.findOne({ _id: id });
            const [getResponse] = await InvoiceModel.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(id)
                    }
                },
                {
                    $unwind: "$items"
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'items.productId',
                        foreignField: '_id',
                        as: 'item'
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        orderNo: {$first: "$orderNo"},
                        billedFrom: {$first: "$billedFrom"},
                        billedTo: {$first: "$billedTo"},
                        shippingAddress:{$first: "$shippingAddress"},
                        totalAmount: {$first: "$totalAmount"},
                        userId: {$first: "$userId"},
                        approved: {$first: "$approved"},
                        status: {$first: "$status"},
                        createdAt: {$first: "$createdAt"},
                        items: {
                            $push: {
                                productDetails: {$first: "$item"},
                                discount: "$items.discount",
                                rate: "$items.rate",
                                quantity: "$items.quantity",
                                productId: "$items.productId"
                            }
                        }
                    }
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
                    $addFields: {
                        billedFrom: { $arrayElemAt: ["$billedFrom", 0] },
                        billedTo: { $arrayElemAt: ["$billedTo", 0] },
                    }
                },

            ]).exec()
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

    @Patch("/cancelProformaInvoice")
    public async cancelProformaInvoice(@Body() request: { id: string, cancel: boolean }): Promise<Response> {
        try {
            const { id, cancel } = request;
            const updated = await upsert(InvoiceModel, { status: cancel ? 'CANCELLED' : 'ACTIVE' }, id)

            return {
                data: updated,
                error: '',
                message: 'Success',
                status: 200
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

    @Delete("/delete")
    public async delete(@Query() id: string): Promise<Response> {
        try {
            const deleted = await deleteById(InvoiceModel, id);
            return {
                data: deleted,
                error: '',
                message: 'Successfully deleted!',
                status: 200
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