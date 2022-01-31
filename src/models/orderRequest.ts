import { Schema, model } from 'mongoose';

const orderItemSchema = new Schema({
    productId: {type: Schema.Types.ObjectId, required: true},
    quantity: {type: Number, default: 0, required: true}
})
const name = new Schema(
    {
        items: { type: [orderItemSchema], required: true },
        partyId: {type: Schema.Types.ObjectId, required: true}
    },
    { versionKey: false, timestamps: true }
);
export default model("orderRequest", name);