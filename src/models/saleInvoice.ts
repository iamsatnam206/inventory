import { Schema, model } from 'mongoose';

const orderItemSchema = new Schema({
    productId: {type: Schema.Types.ObjectId, required: true},
    quantity: {type: Number, default: 0, required: true},
    rate: {type: Number, required: true},
    discount: {type: Number, required: true, min: 0},
    serialNumber: {type: String, default: ''},
    taxableAmount: {type: Number, default: 0}
})

const name = new Schema(
    {
        billedFrom: { type: Schema.Types.ObjectId, required: true },
        billedTo: { type: Schema.Types.ObjectId, required: true },
        shippingAddress: {type: String, required: true},
        totalAmount: {type: Number, default: 0},
        // invoiceNo: {type: String, required: true},
        invoiceDate: {type: Date, required: true},
        dispatchThrough: {type: String, required: true},
        products: {type: [orderItemSchema], default: [], required: true},
        status: {type: String, enum: ['PENDING', 'APPROVED', 'CONFIRM'], default: 'PENDING'}
    },
    { versionKey: false, timestamps: true }
);
export default model("saleinvoices", name);