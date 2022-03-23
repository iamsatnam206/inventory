import { Schema, model } from 'mongoose';

const orderItemSchema = new Schema({
    productId: {type: Schema.Types.ObjectId, required: true},
    quantity: {type: Number, default: 0, required: true},
    rate: {type: Number, required: true},
    discount: {type: Number, required: true, min: 0},
    taxableAmount: {type: Number, default: 0}
})
const name = new Schema(
    {
        billedFrom: { type: Schema.Types.ObjectId, required: true },
        billedTo: { type: Schema.Types.ObjectId, required: true },
        orderNo: {type: String, required: true},
        userId: { type: Schema.Types.ObjectId, required: true },
        items: { type: [orderItemSchema], required: true },
        approved: {type: Boolean, default: false, required: true},
        shippingAddress: {type: String, required: true},
        totalAmount: {type: Number, default: 0},
    },
    { versionKey: false, timestamps: true }
);
export default model("proformainvoices", name);