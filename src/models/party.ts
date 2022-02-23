import { Schema, model } from 'mongoose';
import { OTHER } from '../constants/roles';

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
        userName: { type: String, trim: true, required: true, unique: true },
        password: { type: String, required: true, trim: true},
        state: {type: String, required: true, trim: true},
        openingBalance: {type: Number, default: 0, required: true},
        roleId: {type: Number, default: OTHER.id, required: true},
        roleName: {type: String, default: OTHER.name, required: true},
        token: {type: String, required: false, default: ''},
        isRetailer: {type: Boolean, default: true, required: true}
    },
    { versionKey: false, timestamps: true }
);
export default model("party", party);