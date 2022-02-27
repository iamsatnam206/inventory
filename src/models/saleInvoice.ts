import { Schema, model } from 'mongoose';

const name = new Schema(
    {
        billedFrom: { type: Schema.Types.ObjectId, required: true },
        billedTo: { type: Schema.Types.ObjectId, required: true },
        shippingAddress: {type: String, required: true},
        // invoiceNo: {type: String, required: true},
        invoiceDate: {type: Date, required: true},
        dispatchThrough: {type: String, required: true},
        products: {type: [Schema.Types.ObjectId], default: [], required: true}
    },
    { versionKey: false, timestamps: true }
);
export default model("saleinvoices", name);