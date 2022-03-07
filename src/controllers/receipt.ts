import { Route, Tags, Post, Get, Controller, Body, Query, Security } from "tsoa";
import { Response } from '../models/interfaces';
import ReceiptModel from '../models/receipt';
import { getAll, upsert } from "../helpers/db";
import { Request } from "express";

interface IReceipt {
    receiptDate: string,
    fromParty: string,
    toParty: string,
    amount: number,
    refNo: string,
    isPayment: boolean,
    id?: string
}

@Tags('Receipt')
@Route("receipt")
export default class PartyController extends Controller {
    request: Request;

    constructor(request: Request) {
        super()
        this.request = request
    }

    // @Security('Bearer')
    @Post("/save")
    public async save(@Body() request: IReceipt): Promise<Response> {
        try {
            const {
                receiptDate,
                fromParty,
                toParty,
                amount,
                refNo,
                isPayment,
                id } = request;
            const saveResponse = await upsert(ReceiptModel, {
                receiptDate,
                fromParty,
                toParty,
                amount,
                refNo,
                isPayment,
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
            const getAllResponse = await getAll(ReceiptModel, {}, pageNumber, pageSize);
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
            const getResponse = await ReceiptModel.findOne({ _id: id });
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