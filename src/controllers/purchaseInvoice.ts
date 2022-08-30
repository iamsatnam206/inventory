import { Route, Tags, Post, Get, Controller, Body, Query, Patch, Delete } from "tsoa";
import { Response } from '../models/interfaces';
import PurchaseInvoice from '../models/purchaseInvoice';
import ProductsModel from '../models/products';


import { deleteById, getAll, upsert } from "../helpers/db";
import { Request } from "express";
import StatementController from "./statements";
import { Types } from "mongoose";
import accounts from "../models/accounts";

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
            const productEffect = await ProductsModel.bulkWrite(
                products.map((val: { productId: string, quantity: number }) => {
                    return {
                        updateOne: {
                            filter: { _id: val.productId },
                            update: { $inc: { openingQuantity: val.quantity } }
                        }
                    }
                })
            )

            // update the statement
            const controller = new StatementController(this.request);
            await controller.save(products.map((val: { productId: string, quantity: number }) => {
                return {
                    quantityAdded: val.quantity, quantitySubtracted: 0, productId: val.productId, fromParty: saveResponse.billedFrom, toParty: saveResponse.billedTo
                }
            }))

            if(!id) {
                await upsert(accounts, {billedFrom, billedTo, type: 'PURCHASE', amount: products.reduce((prev, next) => {
                    return prev + next.amountWithoutTax * next.quantity
                }, 0)})
            }
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
            // const getAllResponse = await getAll(PurchaseInvoice, {}, pageNumber, pageSize);
            const [getAllResponse] = await PurchaseInvoice.aggregate([
                {
                    $sort: {createdAt: -1}
                },
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
                                $unwind: "$products"
                            },
                            {
                                $lookup: {
                                    from: 'products',
                                    localField: 'products.productId',
                                    foreignField: '_id',
                                    as: 'item'
                                }
                            },
                            {
                                $group: {
                                    _id: "$_id",
                                    billedFrom: {$first: "$billedFrom"},
                                    billedTo: {$first: "$billedTo"},
                                    invoiceDate: {$first: "$invoiceDate"},
                                    createdAt: {$first: "$createdAt"},
                                    products: {
                                        $push: {
                                            productDetails: {$first: "$item"},
                                            amountWithoutTax: "$products.amountWithoutTax",
                                            quantity: "$products.quantity",
                                            productId: "$products.productId",
                                            _id: "$products._id"
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
            // const getResponse = await PurchaseInvoice.findOne({ _id: id });
            const [getResponse] = await PurchaseInvoice.aggregate([
                {
                    $match: { _id: new Types.ObjectId(id) }
                },
                {
                    $unwind: "$products"
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'products.productId',
                        foreignField: '_id',
                        as: 'item'
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        billedFrom: {$first: "$billedFrom"},
                        billedTo: {$first: "$billedTo"},
                        invoiceDate: {$first: "$invoiceDate"},
                        createdAt: {$first: "$createdAt"},
                        products: {
                            $push: {
                                productDetails: {$first: "$item"},
                                amountWithoutTax: "$products.amountWithoutTax",
                                quantity: "$products.quantity",
                                productId: "$products.productId",
                                _id: "$products._id"
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

    @Patch("/cancelPurchaseInvoice")
    public async cancelPurchaseInvoice(@Body() request: { id: string, cancel: boolean }): Promise<Response> {
        try {
            const { id, cancel} = request;
            const updated = await upsert(PurchaseInvoice, {status: cancel ? 'CANCELLED' : 'ACTIVE'}, id)
            
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
            const deleted = await deleteById(PurchaseInvoice, id);
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