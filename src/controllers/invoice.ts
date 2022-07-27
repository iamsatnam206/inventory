import fs from "fs";
import { Route, Tags, Get, Controller, Query } from "tsoa";
import path from 'path'
import handlebar from 'handlebars'
// @ts-ignore
import html2Pdf from 'html-pdf-node';
import { Response } from "express";
import { findOne, upsert } from "../helpers/db";
import notes from "../models/notes";
import saleInvoice from "../models/saleInvoice";
import proformaInvoice from "../models/proformaInvoice";
import party from "../models/party";
import moment from "moment";
import { Types } from 'mongoose'
// @ts-ignore
import { numberToWords } from 'amount-to-words'
import partyInvoices from "../models/partyInvoices";

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
            if (type === 'DELIVERY') {
                invoiceData = await findOne(notes, { _id: invoiceId })

            } else if (type === 'SALE') {
                invoiceData = await findOne(saleInvoice, { _id: invoiceId })


            } else if (type === 'PROFORMA') {
                invoiceData = await findOne(proformaInvoice, { _id: invoiceId })
            }
            if (!invoiceData) {
                throw new Error('Invalid invoice')
            }
            invoiceData.billedFrom = invoiceData.billedFrom || invoiceData.fromParty;
            invoiceData.billedTo = invoiceData.billedTo || invoiceData.toParty;
            invoiceData.products = invoiceData.products || invoiceData.items || []
            const fromParty = await findOne(party, { _id: invoiceData.billedFrom })
            const toParty = await findOne(party, { _id: invoiceData.billedTo })
            let products = [];
            const totalCount = await partyInvoices.count({fromParty: invoiceData.billedFrom})
            const invoiceNo = fromParty.name.split(' ').reduce((prev: string, current: string) => {
                return prev.substr(0, 1) + current.substr(0, 1)       
            }, '') + '-' + (totalCount + 1)
            if (type === 'DELIVERY') {
                products = await notes.aggregate([
                    {
                        $match: { _id: new Types.ObjectId(invoiceId) }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'products.productId',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $addFields: {
                            'products.productData': { $first: '$product' }
                        }
                    },
                    {
                        $project: { 'product': 0 }
                    },
                ])

            }
            else if (type === 'SALE') {
                products = await saleInvoice.aggregate([
                    {
                        $match: { _id: new Types.ObjectId(invoiceId) }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'products.productId',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $addFields: {
                            'products.productData': { $first: '$product' }
                        }
                    },
                    {
                        $project: { 'product': 0 }
                    },
                ])

            }
            else if (type === 'PROFORMA') {
                products = await proformaInvoice.aggregate([
                    {
                        $match: { _id: new Types.ObjectId(invoiceId) }
                    },
                    {
                        $addFields: {
                            products: '$items'
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'products.productId',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $addFields: {
                            'products.productData': { $first: '$product' }
                        }
                    },
                    {
                        $project: { 'product': 0 }
                    },
                ])
            }
            console.log(JSON.stringify(products))

            const product = products[0].products;
            let actualProducts = Array.from(new Set(product.map((val: any) => { return val.productId.toString() })))
            .map(vals => { return product.find((val2: any) => { return val2.productId.equals(vals) }) })
            const invoiceFile = await fs.promises.readFile(path.join(__dirname, '../templates', 'invoice.html'))
            const template = handlebar.compile(invoiceFile.toString());
            console.log(actualProducts)
            if(type === 'DELIVERY') {
                actualProducts = actualProducts.map(val => {
                    return {...val, rate: val.prices, discount: 0}
                })
            }
            let totalAmountCache = 0
            const data: any = {
                invoiceTitle: type,
                billedFromName: fromParty.name,
                billedFromAddress: fromParty.address,
                billedFromCity: fromParty.state,
                billedFromGST: fromParty.gstNumber,
                billedFromState: fromParty.state,
                billedToState: toParty.state,
                deliveryNoteDate: invoiceData.receiptDate ? moment(invoiceData.receiptDate).format('DD-MMM-YY') : '',
                invoiceNo: invoiceNo,
                invoiceDate: moment(new Date).format('DD-MMM-YY'),
                dispatchedThrough: invoiceData.dispatchThrough || '',
                billedToName: toParty.name,
                billedToAddress: toParty.address,
                billedToContact: toParty.phone,
                tableData:
                    actualProducts.map((val, index) => {
                        const amountBeforeDic = val.quantity * (val.rate + val.taxableAmount)
                        const amount = amountBeforeDic - (amountBeforeDic * val.discount / 100)
                        totalAmountCache += amount;
                        return {
                            sNo: index + 1, csgst: (amount * 14) / 100, igst: (amount * 28) / 100, description: val.productData.description, hsn: val.productData.hsnCode, quantity: val.quantity, rateWithTax: val.rate + val.taxableAmount, rate: val.rate, per: 10, disc: val.discount, amount
                        }
                    }),
                totalNumber: actualProducts.reduce((pre, next) => {
                    return pre.quantity ? pre.quantity : 0 + next.quantity
                }, 0),
                companyPan: fromParty.companyPan,
                bankName: fromParty.bankName,
                account: fromParty.accountNumber,
                brank: fromParty.branch
            }
            let taxApplied = 0;
            if (fromParty.state.toLowerCase() === toParty.state.toLowerCase()) {
                data.tableData.push({
                    sNo: '', description: 'CGST', hsn: '', quantity: '', rateWithTax: '', rate: '', per: '', disc: '', amount: (14 * totalAmountCache / 100)
                })
                data.tableData.push({
                    sNo: '', description: 'SGST', hsn: '', quantity: '', rateWithTax: '', rate: '', per: '', disc: '', amount: (14 * totalAmountCache / 100)
                })
                taxApplied += 2 * (14 * totalAmountCache / 100)
                data.centralTax = (14 * totalAmountCache / 100)
                data.stateTax = (14 * totalAmountCache / 100)
            } else {
                data.tableData.push({
                    sNo: '', description: 'IGST', hsn: '', quantity: '', rateWithTax: '', rate: '', per: '', disc: '', amount: (28 * totalAmountCache / 100)
                })
                taxApplied += (28 * totalAmountCache / 100)
                data.iTax = (28 * totalAmountCache / 100)
            }
            data.totalAmount = Math.round(totalAmountCache + taxApplied)
            data.totalAmountWords = numberToWords(Math.round(totalAmountCache + taxApplied))
            data.taxableValue = totalAmountCache;
            data.totalTax = (28 * totalAmountCache / 100)
            data.tableData.push({
                sNo: '', description: 'roundOff', hsn: '', quantity: '', rateWithTax: '', rate: '', per: '', disc: '', amount: (Math.round(totalAmountCache + taxApplied) - (totalAmountCache + taxApplied)).toFixed(2)
            })
            data.taxSlab = data.tableData.filter((val: any) => {return val.sNo})
            const result = template(data)
            console.log(data.tableData)

            const pdfBuffer = await html2Pdf.generatePdf({ content: result }, { format: 'A4' })
            await fs.promises.writeFile(path.join(__dirname, '../templates', 'sample.pdf'), pdfBuffer)
            await upsert(partyInvoices, {fromParty: invoiceData.billedFrom, invoiceNo})
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