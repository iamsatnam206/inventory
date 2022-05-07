import { Schema, model } from 'mongoose';
import { OTHER } from '../constants/roles';

const party = new Schema(
    {
        name: { type: String, trim: true, required: true },
        address: { type: String, trim: true, required: true },
        gstNumber: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        phone: { type: Number, trim: true, required: true, unique: true },
        pinCode: { type: Number, required: true },
        contactPerson: { type: String, trim: true, required: true },
        userName: { type: String, trim: true, required: true, unique: true },
        password: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        openingBalance: { type: Number, default: 0, required: true },
        roleId: { type: Number, default: OTHER.id, required: true },
        roleName: { type: String, default: OTHER.name, required: true },
        token: { type: String, required: false, default: '' },
        isRetailer: { type: Boolean, default: true, required: true },



        // extras
        companyPan: { type: String, required: false },
        bankName: { type: String, required: false, },
        accountNumber: { type: String, required: false },
        branch: { type: String, required: false },
    },
    { versionKey: false, timestamps: true }
);
party.index({
    name: 'text'
})
export default model("party", party);