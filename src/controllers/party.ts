import { Route, Tags, Post, Get, Controller, Body, Query, Security } from "tsoa";
import { Response } from '../models/interfaces';
import PartyModel from '../models/party';
import _ from 'lodash';
import { signToken, verifyToken } from "../helpers/jwt";
import { findOne, getAll, upsert } from "../helpers/db";
const { genHash, verifyHash } = require('../helpers/utility')

interface partySave {
    name: string,
    address: string,
    gstNumber: string,
    phone: number,
    pinCode: number,
    contactPerson: string,
    userName: string,
    password: string,
    state: string,
    openingBalance: number,
    isRetailer: boolean,
    companyPan: string, bankName: string, accountNumber: string, branch: string,
    id?: string
}
interface partyLogin {
    userName: string,
    password: string,
    token: string
}

@Tags('Party')
@Route("party")
export default class PartyController extends Controller {
    @Post("/save")
    @Security('Bearer')
    public async save(@Body() request: partySave): Promise<Response> {
        try {
            const cloned: Partial<partySave> = { ...request };
            if (request.id) {
                delete cloned.password;
                delete cloned.userName;

            } else {
                const hashedPassword = await genHash(request.password);
                cloned.password = hashedPassword
                const theOne = await findOne(PartyModel, {gstNumber: request.gstNumber.trim()})
                if(theOne) {
                    throw new Error('Gst number should ne unique')
                }
                const theOnePhone = await findOne(PartyModel, {phone: request.phone})
                if(theOnePhone) {
                    throw new Error('Phone number should ne unique')
                }
            }
            const saveResponse = await upsert(PartyModel, cloned, request.id);
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
    public async login(@Body() partyLogin: partyLogin): Promise<Response> {
        // check for username
        try {
            const theOne = await PartyModel.findOne({ userName: partyLogin.userName });
            if (theOne) {
                const verified = verifyHash(partyLogin.password, theOne.password)
                if (verified) {
                    // sign the token
                    theOne.token = await signToken(theOne._id, theOne.roleId);
                    return {
                        data: theOne,
                        error: '',
                        message: 'Successful',
                        status: 200
                    }
                } else {
                    throw new Error('Password is incorrect!')
                }
            } else {
                throw new Error('User doesn\'t exists')
            }
        }
        catch (err: any) {
            return {
                data: '',
                error: err.message ? err.message : err,
                message: '',
                status: 400
            }
        }

    }
    @Get("/getAll")
    @Security('Bearer')
    public async getAll(@Query() filter = '', @Query('pageNumber') pageNumber: number = 1, @Query() pageSize: number = 20): Promise<Response> {
        try {
            const getAllResponse = await getAll(PartyModel, {
                ...(filter ? { $text: { $search: filter, $caseSensitive: false } } : null)
            }, pageNumber, pageSize);

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
    @Security('Bearer')
    public async get(@Query() id: string): Promise<Response> {
        try {
            console.log('id here', id);

            const getResponse = await PartyModel.findOne({ _id: id });
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