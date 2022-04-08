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
        company: { type: String, trim: true, required: true },
        hsnCodeDescription: {type: String, trim: true, required: true},
        units: {type: String, required: true, default: ''},
        openingQuantity: {type: Number, default: 0, required: true}
    },
    { versionKey: false, timestamps: true }
);
party.index({
    itemName: 'text'
})
export default model("products", party);