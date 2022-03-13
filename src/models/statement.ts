import { Schema, model } from 'mongoose';

const name = new Schema(
    {
        quantityAdded: { type: Number, default: 0 },
        quantitySubtracted: { type: Number, default: 0 },
        fromParty: {type: Schema.Types.ObjectId, required: true},
        toParty: {type: Schema.Types.ObjectId, required: true},
        productId: {type: Schema.Types.ObjectId, required: true},
        invoiceNumber: {type: String, minlength: 5, required: true},
    },
    { versionKey: false, timestamps: true }
);
export default model("statements", name); 