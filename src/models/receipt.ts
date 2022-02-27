import { Schema, model } from 'mongoose';

const orderItemSchema = new Schema({
    productId: {type: Schema.Types.ObjectId, required: true},
    quantity: {type: Number, default: 0, required: true},
    prices: {type: Number, required: true},
})
const name = new Schema(
    {
        receiptDate: {type: Date, required: true},
        fromParty: { type: Schema.Types.ObjectId, required: true },
        toParty: { type: Schema.Types.ObjectId, required: true },
        amount: {type: Number, default: 0, required: true},
        refNo: {type: String, default: ''},
        isPayment: {type: Boolean, default: false, required: true}
    },
    { versionKey: false, timestamps: true }
);
export default model("paymentReceipts", name);