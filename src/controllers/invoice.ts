import fs from "fs";
import { Route, Tags, Get, Controller, Query } from "tsoa";
import path from 'path'
import handlebar from 'handlebars'
// @ts-ignore
import html2Pdf from 'html-pdf-node';
import { Response } from "express";
import { findOne } from "../helpers/db";
import notes from "../models/notes";
import saleInvoice from "../models/saleInvoice";
import proformaInvoice from "../models/proformaInvoice";
import party from "../models/party";
import moment from "moment";
import { Types } from 'mongoose'

interface category {
    name: string,
    id?: string
}

@Tags('InvoicePDF')
@Route("invoicePdf")
export default class InvoiceController extends Controller {
    res: Response;
    constructor(res: Response) {
        super();
        this.res = res;
    } 
    @Get("/get")
    public async get(@Query() invoiceId: string, @Query() type: string): Promise<any> {
        try {
            let invoiceData = null;
            if(type === 'DELIVERY') {
                invoiceData = await findOne(notes, {_id: invoiceId})

            } else if(type === 'SALE') {
                invoiceData = await findOne(saleInvoice, {_id: invoiceId})


            } else if(type === 'PROFORMA') {
                invoiceData = await findOne(proformaInvoice, {_id: invoiceId})
            }
            if(!invoiceData) {
                throw new Error('Invalid invoice')
            }
            invoiceData.billedFrom = invoiceData.billedFrom || invoiceData.fromParty;
            invoiceData.billedTo = invoiceData.billedTo || invoiceData.toParty;
            invoiceData.products = invoiceData.products || invoiceData.items || []
            const fromParty = await findOne(party, {_id: invoiceData.billedFrom})
            const toParty = await findOne(party, {_id: invoiceData.billedTo})
            let products = [];
            if(type === 'DELIVERY' || type === 'SALE') {
                products = await notes.aggregate([
                    {
                        $match: {
                            _id: new Types.ObjectId(invoiceData)
                        }
                    }, 
                    {
                        $lookup: {
                        from: 'products',
                        localField: 'products.productId',
                        foreignField: '_id',
                        as: 'products.productData'
                        }
                    },
                ])

            } else if(type === 'PROFORMA') {
                products = await proformaInvoice.aggregate([
                    {
                        $match: {
                            _id: new Types.ObjectId(invoiceData)
                        }
                    }, 
                    {
                        $lookup: {
                        from: 'items',
                        localField: 'items.productId',
                        foreignField: '_id',
                        as: 'items.productData'
                        }
                    },
                    {
                        $addFields: {
                            products: '$items'
                        }
                    }
                ])
            }

            console.log(products);

            const invoiceFile = await fs.promises.readFile(path.join(__dirname, '../templates', 'invoice.html'))
            // console.log('read', invoiceFile)
            const template = handlebar.compile(invoiceFile.toString());
            const data = {
                invoiceTitle: type,
                billedFromName: fromParty.name,
                billedFromAddress: fromParty.address,
                billedFromCity: fromParty.state,
                billedFromGST: fromParty.gstNumber,
                gstNo: 'Sample no',
                invoiceDate: moment(new Date).format('DD-MMM-YY'),
                dispatchedThrough: invoiceData.dispatchThrough || '',
                billedToName: toParty.name,
                billedToAddress: toParty.address,
                billedToContact: toParty.phone,
                tableData: [
                    {
                        sNo: 1, description: 'description here', hsn: 'hsn number', quantity: 23, rateWithTax: 'tax', rate: 34, per: 34, disc: 90, amount: 890, total: 45, totalNumer: 67, totalAmount: 8900, totalAmountWords: 'Sample here', companyPan: 'PAN number'
                    }
                ]
            }
            const result = template(data)
            const pdfBuffer = await html2Pdf.generatePdf({ content: result }, { format: 'A4' })
            await fs.promises.writeFile(path.join(__dirname, '../templates', 'sample.pdf'), pdfBuffer)
            this.res.sendFile(path.join(__dirname, '../templates', 'sample.pdf'))
        }
        catch (err: any) {
            this.res.send({
                data: null,
                error: err.message ? err.message : err,
                message: '',
                status: 400
            })
        }
    }
}