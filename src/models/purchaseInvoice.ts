import { Schema, model } from 'mongoose';

const productSchema = new Schema({
    productId: {type: Schema.Types.ObjectId, required: true},
    quantity: {type: Number, default: 0},
    amountWithoutTax: {type: Number, default: 0}
})
const name = new Schema(
    {
        billedFrom: { type: Schema.Types.ObjectId, required: true },
        billedTo: { type: Schema.Types.ObjectId, required: true },
        invoiceDate: {type: Date, required: true},
        products: {type: [productSchema], default: [], required: true},
        status: {type: String, enum: ['ACTIVE', 'CANCELLED'], default: 'ACTIVE'}
    },
    { versionKey: false, timestamps: true }
);
export default model("purchaseinvoices", name);