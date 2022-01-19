import { Schema, model } from 'mongoose';

const name = new Schema(
    {
        name: { type: String, trim: true, required: true },
    },
    { versionKey: false, timestamps: true }
);
export default model("category", name);