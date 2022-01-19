import { Route, Tags, Post, Get, Controller, Body, Query } from "tsoa";
import { Response } from '../models/interfaces';
import PartyModel from '../models/party';
import _ from 'lodash';
const { genHash } = require('../helpers/utility')

interface party {
    name: string,
    address: number,
    gstNumber: string,
    phone: number,
    pinCode: number,
    contactPerson: string,
    userName: string,
    password: string
}

@Tags('Party')
@Route("party")
export default class PartyController extends Controller {

    @Post("/save")
    public async save(@Body() request: party): Promise<Response> {
        try {
            const hashedPassword = await genHash(request.password);
            console.log(hashedPassword);
            
            const saveResponse = await PartyModel.create({...request, password: hashedPassword});
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

    @Post("/login")
    public async login(): Promise<Response> {
        return {
            data: '',
            error: '',
            message: '',
            status: 200
        }
    }
    @Get("/getAll")
    public async getAll(): Promise<Response> {
        try {
            const getAllResponse = await PartyModel.find();
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
    @Get("/get")
    public async get(@Query() id: string): Promise<Response> {
        try {
            console.log('id here', id);
            
            const getResponse = await PartyModel.findOne({_id: id});
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