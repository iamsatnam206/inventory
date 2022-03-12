import { Route, Tags, Post, Get, Controller, Body, Query, Security } from "tsoa";
import { Response } from '../models/interfaces';
import NoteModel from '../models/notes';
import { getAll, upsert } from "../helpers/db";
import { Request } from "express";

interface INotes {
    fromParty: string,
    toParty: string,
    receiptDate: string,
    products: {
        productId: string,
        quantity: number,
        prices: number,
    }[],
    isDeliveryNote: boolean,
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
                isDeliveryNote,
                id } = request;
            const saveResponse = await upsert(NoteModel, {
                fromParty,
                toParty,
                receiptDate,
                products,
                isDeliveryNote,
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
            const getAllResponse = await getAll(NoteModel, {}, pageNumber, pageSize);
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
            const getResponse = await NoteModel.findOne({ _id: id });
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