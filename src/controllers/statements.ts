import { Route, Tags, Post, Get, Controller, Body, Query, Security } from "tsoa";
import { Response } from '../models/interfaces';
import { getAll, getById } from "../helpers/db";
import { Request } from "express";
import statement from "../models/statement";
import party from "../models/party";
import { getOtp, validateMongooseDate } from "../helpers/utility";


@Tags('Statements')
@Route("statements")
export default class StatementController extends Controller {
    request: Request;

    constructor(request: Request) {
        super()
        this.request = request
    }
    @Get("/getAll")
    public async getAll(@Query() productId: string, @Query() startDate: string, @Query() endDate: string, @Query('pageNumber') pageNumber: number = 1, @Query() pageSize: number = 20): Promise<Response> {
        try {
            // Y-M-D
            // check date validation
            if(!validateMongooseDate(startDate) || !validateMongooseDate(endDate)) {
                throw new Error('Date should be in format YYYY-MM-DD')
            }
            const getAllRespsonse = await getAll(statement, {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                },
                ...(productId ? {productId} : null),
            }, pageNumber, pageSize)

            return {
                data: getAllRespsonse,
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

    @Post("/save")
    public async save(@Body() request: {quantityAdded: number, quantitySubtracted: number, productId: string, fromParty: string, toParty: string}[]): Promise<Response> {
        try {
            // get the party
            const partyDoc = await getById(party, request[0].fromParty);
            if(!partyDoc) {
                throw new Error("Party doesn\'t exists");
            }
            const invoiceNumber = partyDoc.name.slice(0, 3) + getOtp(100000, 10000);
            const saveResponse = await statement.bulkWrite([
                request.map(val => {
                    return {
                        insertOne: {
                            ...val, invoiceNumber: invoiceNumber
                        }
                    }
                })
            ])
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