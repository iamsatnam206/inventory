import { Route, Tags, Post, Get, Controller, Body, Query, Security } from "tsoa";
import { Response } from '../models/interfaces';
import { getAll, getById } from "../helpers/db";
import { Request } from "express";
import party from "../models/party";
import { getOtp, validateMongooseDate } from "../helpers/utility";
import { Types } from "mongoose";
import accounts from "../models/accounts";


@Tags('Accounts')
@Route("accounts")
export default class AmountController extends Controller {
    request: Request;

    constructor(request: Request) {
        super()
        this.request = request
    }
    @Get("/getAll")
    public async getAll(@Query() startDate: string, @Query() endDate: string, @Query('pageNumber') pageNumber: number = 1, @Query() pageSize: number = 20): Promise<Response> {
        try {
            // Y-M-D
            // check date validation
            if (!validateMongooseDate(startDate) || !validateMongooseDate(endDate)) {
                throw new Error('Date should be in format YYYY-MM-DD')
            }
            // const getAllRespsonse = await getAll(statement, {
            //     createdAt: {
            //         $gte: new Date(startDate),
            //         $lte: new Date(endDate)
            //     },
            //     ...(productId ? { productId } : null),
            // }, pageNumber, pageSize)

            const [getAllResponse] = await accounts.aggregate([
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        },
                    }
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
                                    as: 'billedFromDetails'
                                }
                            },
                            {
                                $lookup: {
                                    from: 'parties',
                                    localField: 'billedTo',
                                    foreignField: '_id',
                                    as: 'billedToDetails'
                                }
                            },
                            {
                                $addFields: {
                                    billedFromDetails: { $arrayElemAt: ["$billedFromDetails", 0] },
                                    billedToDetails: { $arrayElemAt: ["$billedToDetails", 0] },
                                    // productDetails: { $arrayElemAt: ["$productDetails", 0] },
                                }
                            },
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



}