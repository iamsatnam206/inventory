import { Route, Tags, Post, Get, Controller, Body, Query, Patch, Delete } from "tsoa";
import { Response } from '../models/interfaces';
import SaleInvoice from '../models/saleInvoice';
import ProductsModel from '../models/products';

import { deleteById, getAll, getById, upsert } from "../helpers/db";
import { Request } from "express";
import StatementController from "./statements";
import { Types } from "mongoose";
import { getOtp } from "../helpers/utility";
import accounts from "../models/accounts";
// import saleInvoice from "../models/saleInvoice";

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
    isBlacked?: boolean,
    id?: string
}
interface saleInvoiceSerial {
    saleInvoiceId: string,
    itemId: string,
    serialNumber: string
}

@Tags('Invoice/Sale')
@Route("invoice/sale")
export default class SaleController extends Controller {
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
                isBlacked,
                id } = request;
            const invoiceNo = await getOtp(100000, 10000);
            const mappedProducts = products.map(val => {
                const newArr = [];
                for (let i = 0; i < val.quantity; i++) {
                    newArr.push({ ...val })
                }
                return newArr
            });
            // @ts-ignore
            const actualProducts = [].concat.apply([], mappedProducts)
            const saveResponse = await upsert(SaleInvoice, {
                invoiceNo,
                billedFrom,
                billedTo,
                shippingAddress,
                invoiceDate,
                dispatchThrough,
                products: actualProducts,
                totalAmount,
                isBlacked
            }, id);
            if (!id) {
                await upsert(accounts, { billedFrom, billedTo, type: 'SALE', amount: totalAmount })
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
    public async getAll(@Query('pageNumber') pageNumber: number = 1, @Query() pageSize: number = 20, @Query() status: string = '', @Query() isBlacked: any = undefined): Promise<Response> {
        try {
            if (status && (status !== 'PENDING' && status !== 'APPROVED' && status !== 'CONFIRM')) {
                throw new Error('Status is incorrect!');
            }
            // const getAllResponse = await getAll(SaleInvoice, {
            //     ...(status ? { status } : null)
            // }, pageNumber, pageSize);
            const getAllResponse = await SaleInvoice.aggregate([
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $match: { ...(status ? { status } : null), ...(isBlacked !== undefined ? { isBlacked } : null) }
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
                                    billedFrom: { $first: "$billedFrom" },
                                    billedTo: { $first: "$billedTo" },
                                    shippingAddress: { $first: "$shippingAddress" },
                                    totalAmount: { $first: "$totalAmount" },
                                    invoiceNo: { $first: "$invoiceNo" },
                                    invoiceDate: { $first: "$invoiceDate" },
                                    dispatchThrough: { $first: "$dispatchThrough" },
                                    createdAt: { $first: "$createdAt" },
                                    isBlacked: { $first: "$isBlacked" },
                                    status: { $first: "$status" },
                                    updatedAt: { $first: "$updatedAt" },
                                    products: {
                                        $push: {
                                            productDetails: { $first: "$item" },
                                            discount: "$products.discount",
                                            rate: "$products.rate",
                                            quantity: "$products.quantity",
                                            productId: "$products.productId",
                                            serialNumber: "$products.serialNumber",
                                            taxableAmount: "$products.taxableAmount",
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
                            // {
                            //     $lookup: {
                            //         from: 'products',
                            //         localField: 'products.productId',
                            //         foreignField: '_id',
                            //         as: 'product'
                            //     }
                            // },
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
            // const getResponse = await SaleInvoice.findOne({ _id: id });
            const getAllResponse = await SaleInvoice.aggregate([
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
                        billedFrom: { $first: "$billedFrom" },
                        billedTo: { $first: "$billedTo" },
                        shippingAddress: { $first: "$shippingAddress" },
                        totalAmount: { $first: "$totalAmount" },
                        invoiceNo: { $first: "$invoiceNo" },
                        invoiceDate: { $first: "$invoiceDate" },
                        dispatchThrough: { $first: "$dispatchThrough" },
                        createdAt: { $first: "$createdAt" },
                        isBlacked: { $first: "$isBlacked" },
                        status: { $first: "$status" },
                        updatedAt: { $first: "$updatedAt" },
                        products: {
                            $push: {
                                productDetails: { $first: "$item" },
                                discount: "$products.discount",
                                rate: "$products.rate",
                                quantity: "$products.quantity",
                                productId: "$products.productId",
                                serialNumber: "$products.serialNumber",
                                taxableAmount: "$products.taxableAmount",
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
    @Post("/serialNumberEntry")
    public async serialNumberEntry(@Body() request: saleInvoiceSerial): Promise<Response> {
        try {
            const { saleInvoiceId,
                itemId,
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

            const oneProduct = products.find((val: { _id: any }) => val._id.equals(itemId));
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
            const saveResponse = await upsert(SaleInvoice, { status: 'APPROVED' }, saleInvoiceId);
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
            const res = await controller.save(products.map((val: { productId: string, quantity: number }) => {
                return {
                    quantityAdded: 0, quantitySubtracted: val.quantity, productId: val.productId, fromParty: theOne.billedFrom, toParty: theOne.billedTo
                }
            }))
            console.log(res);

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

    @Post("/updateSerialNumber")
    public async updateSerialNumber(@Body() request: { oldSerialNumber: string, newSerialNumber: string }): Promise<Response> {
        try {
            const { oldSerialNumber, newSerialNumber } = request;
            const theOne = await getAll(SaleInvoice, { products: { $elemMatch: { serialNumber: oldSerialNumber.trim() } } });
            if (theOne.items.length === 0) {
                throw new Error('No such entry found')
            }
            const [replaceable] = theOne.items;
            const updated = await SaleInvoice.updateOne({
                _id: replaceable._id, "products.serialNumber": oldSerialNumber
            }, {
                $set: { "products.$.serialNumber": newSerialNumber }
            }, { lean: true, new: true })

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


    @Patch("/cancelSaleInvoice")
    public async cancelSaleInvoice(@Body() request: { id: string, cancel: boolean }): Promise<Response> {
        try {
            const { id, cancel } = request;
            const updated = await upsert(SaleInvoice, { status: cancel ? 'CANCELLED' : 'ACTIVE' }, id)

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
            const deleted = await deleteById(SaleInvoice, id);
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