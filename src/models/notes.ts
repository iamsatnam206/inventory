import { Schema, model } from 'mongoose';

const orderItemSchema = new Schema({
    productId: {type: Schema.Types.ObjectId, required: true},
    quantity: {type: Number, default: 0, required: true},
    prices: {type: Number, required: true},
    taxableAmount: {type: Number, default: 0}
})
const name = new Schema(
    {
        fromParty: { type: Schema.Types.ObjectId, required: true },
        toParty: { type: Schema.Types.ObjectId, required: true },
        receiptDate: {type: Date, required: true},
        products: {type: [orderItemSchema], default: [], required: true},
        shippingAddress: {type: String, default:''},
        totalAmount: {type: Number, default: 0},
        isDeliveryNote: {type: Boolean, default: false}
    },
    { versionKey: false, timestamps: true }
);
export default model("notes", name);