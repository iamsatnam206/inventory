import { Schema, model } from 'mongoose';

const name = new Schema(
    {
        name: { type: String, trim: true, required: true },
    },
    { versionKey: false, timestamps: true }
);
name.index({
    name: 'text'
})
export default model("category", name);