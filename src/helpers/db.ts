import { Model } from 'mongoose'

export const getById = async (model: Model<any>, id: string) => {
    const data = await model.findById(id);
    return data;
}

export const getAll = async (model: Model<any>, query: any, pageNumber: number = 1, pageSize: number = 20) => {
    const items = await model.find(query).skip((pageNumber - 1) * pageSize).limit(pageSize)
    const totalItems = await model.find().count();
    return {items, pageNumber, pageSize, totalItems};
}

// insert or update
export const upsert = async(model: Model<any>, data: any, id?: string) => {
    let dataRes = null;
    if(id) {
        // update
        delete data.id;
        dataRes = await model.findByIdAndUpdate(id, {...data}, {new: true})
    } else {
        dataRes = await model.create(data);
    }
    return dataRes;
}