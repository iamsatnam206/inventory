import { Schema, model } from 'mongoose';

const party = new Schema(
    {
        invoiceNo: { type: String, trim: true, required: true },
        fromParty: { type: Schema.Types.ObjectId, required: true }
    },
    { versionKey: false, timestamps: true }
);
export default model("partyinvoices", party);