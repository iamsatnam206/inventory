import { Route, Tags, Post, Get, Controller, Body, Query, Patch, Delete } from "tsoa";
import { Response } from '../models/interfaces';
import NoteModel from '../models/notes';
import { deleteById, getAll, upsert } from "../helpers/db";
import ProductsModel from '../models/products';
import { Request } from "express";
import StatementController from "./statements";
import { Types } from "mongoose";

interface INotes {
    fromParty: string,
    toParty: string,
    receiptDate: string,
    products: {
        productId: string,
        quantity: number,
        prices: number,
    }[],
    shippingAddress: string,
    isDeliveryNote: boolean,
    totalAmount: number,
    id?: string
}

@Tags('Notes')
@Route("notes")
export default class PartyController extends Controller {
    request: Request;

    constructor(request: Request) {
        super()
        this.request = request
    }

    // @Security('Bearer')
    @Post("/save")
    public async save(@Body() request: INotes): Promise<Response> {
        try {
            const { fromParty,
                toParty,
                receiptDate,
                products,
                shippingAddress,
                isDeliveryNote,
                totalAmount,
                id } = request;
            const saveResponse = await upsert(NoteModel, {
                fromParty,
                toParty,
                receiptDate,
                products,
                shippingAddress,
                isDeliveryNote,
                totalAmount,
            }, id);

            // make effect in products
            const productEffect = await ProductsModel.bulkWrite([
                ...products.map((val: { productId: string, quantity: number }) => {
                    return {
                        updateOne: {
                            filter: { _id: val.productId },
                            update: { $inc: { openingQuantity: isDeliveryNote ? -val.quantity : val.quantity } }
                        }
                    }
                })
            ])
            // update the statement
            const controller = new StatementController(this.request);
            await controller.save(products.map((val: { productId: string, quantity: number }) => {
                return {
                    quantityAdded: isDeliveryNote ? 0 : val.quantity, quantitySubtracted: !isDeliveryNote ? 0 : val.quantity, productId: val.productId, fromParty: saveResponse.fromParty, toParty: saveResponse.toParty
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
            // const getAllResponse = await getAll(NoteModel, {}, pageNumber, pageSize);
            const [getAllResponse] = await NoteModel.aggregate([
                {
                    $sort: { createdAt: -1 }
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
                                    fromParty: { $first: "$fromParty" },
                                    toParty: { $first: "$toParty" },
                                    receiptDate: { $first: "$receiptDate" },
                                    shippingAddress: { $first: "$shippingAddress" },
                                    totalAmount: { $first: "$totalAmount" },
                                    isDeliveryNote: { $first: "$isDeliveryNote" },
                                    status: { $first: "$status" },
                                    createdAt: { $first: "$createdAt" },
                                    products: {
                                        $push: {
                                            productDetails: { $first: "$item" },
                                            prices: "$products.prices",
                                            quantity: "$products.quantity",
                                            taxableAmount: "$products.taxableAmount",
                                            _id: "$products._id"
                                        }
                                    }
                                }
                            },


                            {
                                $lookup: {
                                    from: 'parties',
                                    localField: 'fromParty',
                                    foreignField: '_id',
                                    as: 'fromParty'
                                }
                            },
                            {
                                $lookup: {
                                    from: 'parties',
                                    localField: 'toParty',
                                    foreignField: '_id',
                                    as: 'toParty'
                                }
                            },
                            {
                                $addFields: {
                                    fromParty: { $arrayElemAt: ["$fromParty", 0] },
                                    toParty: { $arrayElemAt: ["$toParty", 0] },
                                }
                            },

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
            // const getResponse = await NoteModel.findOne({ _id: id });
            const [getResponse] = await NoteModel.aggregate([
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
                        fromParty: { $first: "$fromParty" },
                        toParty: { $first: "$toParty" },
                        receiptDate: { $first: "$receiptDate" },
                        shippingAddress: { $first: "$shippingAddress" },
                        totalAmount: { $first: "$totalAmount" },
                        isDeliveryNote: { $first: "$isDeliveryNote" },
                        status: { $first: "$status" },
                        createdAt: { $first: "$createdAt" },
                        products: {
                            $push: {
                                productDetails: { $first: "$item" },
                                prices: "$products.prices",
                                quantity: "$products.quantity",
                                taxableAmount: "$products.taxableAmount",
                                _id: "$products._id"
                            }
                        }
                    }
                },


                {
                    $lookup: {
                        from: 'parties',
                        localField: 'fromParty',
                        foreignField: '_id',
                        as: 'fromParty'
                    }
                },
                {
                    $lookup: {
                        from: 'parties',
                        localField: 'toParty',
                        foreignField: '_id',
                        as: 'toParty'
                    }
                },
                {
                    $addFields: {
                        fromParty: { $arrayElemAt: ["$fromParty", 0] },
                        toParty: { $arrayElemAt: ["$toParty", 0] },
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

    @Patch("/cancelNote")
    public async cancelNote(@Body() request: { id: string, cancel: boolean }): Promise<Response> {
        try {
            const { id, cancel } = request;
            const updated = await upsert(NoteModel, { status: cancel ? 'CANCELLED' : 'ACTIVE' }, id)

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
            const deleted = await deleteById(NoteModel, id);
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