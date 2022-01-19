import { Schema, model } from 'mongoose';

const party = new Schema(
    {
        name: { type: String, trim: true, required: true },
        address: { type: String, trim: true, required: true },
        gstNumber: {
            type: String,
            trim: true,
            required: true
        },
        phone: { type: Number, trim: true, required: true },
        pinCode: { type: Number, required: true },
        contactPerson: { type: String, trim: true, required: true },
        userName: { type: String, trim: true, required: true },
        password: { type: String, required: true, trim: true},
    },
    { versionKey: false, timestamps: true }
);
module.exports = model("party", party);