import { Schema, model } from 'mongoose';

const party = new Schema(
    {
        itemName: { type: String, trim: true, required: true },
        itemCategory: { type: Schema.Types.ObjectId, required: true },
        description: {
            type: String,
            trim: true,
            required: true
        },
        hsnCode: { type: Number, trim: true, required: true },
        taxSlab: { type: String, required: true },
        company: { type: Schema.Types.ObjectId, trim: true, required: true },
    },
    { versionKey: false, timestamps: true }
);
export default model("products", party);