import { Route, Tags, Post, Path, Controller, Body, Get, Query, Delete } from "tsoa";
import { deleteById, findOne, getAll, upsert } from "../helpers/db";
import { Response } from '../models/interfaces';
import ProductModel from '../models/products';
import proformaInvoice from "../models/proformaInvoice";
import purchaseInvoice from "../models/purchaseInvoice";
import saleInvoice from "../models/saleInvoice";
import notesModel from "../models/notes";
import products from "../models/products";

interface product {
    itemName: string,
    itemCategory: string,
    description: string,
    hsnCode: number,
    taxSlab: number,
    company: string,
    hsnCodeDescription: string,
    units: string,
    openingQuantity: number,
    id?: string
}

@Tags('Product')
@Route("product")
export default class PartyController extends Controller {

    @Post("/save")
    public async save(@Body() request: product): Promise<Response> {
        try {
            const saveResponse = await upsert(ProductModel, request, request.id);
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
    @Get("/getAll")
    public async getAll(@Query() filter = '', @Query('pageNumber') pageNumber: number = 1, @Query() pageSize: number = 20, @Query() itemCategory: string = ''): Promise<Response> {
        try {
            const getAllResponse = await getAll(ProductModel, {
                ...(filter ? { $text: { $search: filter, $caseSensitive: false } } : null),
                ...(itemCategory ? { itemCategory } : null)
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
    public async get(@Query() id: string): Promise<Response> {
        try {
            console.log('id here', id);

            const getResponse = await ProductModel.findOne({ _id: id });
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

    @Delete("/delete")
    public async delete(@Query() id: string): Promise<Response> {
        try {
            const saleInvoiceExistence = await findOne(saleInvoice, {products: {$elemMatch: {productId: id}}});
            const purchaseInvoiceExistence = await findOne(purchaseInvoice, {products: {$elemMatch: {productId: id}}});
            const proformaInvoiceExistence = await findOne(proformaInvoice, {items: {$elemMatch: {productId: id}}});
            const notesExistence = await findOne(notesModel, {products: {$elemMatch: {productId: id}}});
            if(saleInvoiceExistence || purchaseInvoiceExistence || proformaInvoiceExistence || notesExistence) {
                throw new Error('Product cannot be deleted as it\'s enteries exists!')
            }
            const deleted = await deleteById(products, id);
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