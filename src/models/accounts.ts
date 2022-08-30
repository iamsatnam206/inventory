import { Schema, model } from 'mongoose';

const name = new Schema(
    {
        billedFrom: { type: Schema.Types.ObjectId, required: true },
        billedTo: { type: Schema.Types.ObjectId, required: true },
        type: {type: String, enum: ['SALE', 'PURCHASE', 'RECEIPT'], required: true},
        amount: {type: Number, required: true}
        // saleId: {type: Schema.Types.ObjectId, required: true},
        // productId: {type: Schema.Types.ObjectId, required: true},
    },
    { versionKey: false, timestamps: true }
);
export default model("accounts", name); 