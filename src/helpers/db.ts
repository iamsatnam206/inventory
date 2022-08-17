import { Model } from 'mongoose'

export const getById = async (model: Model<any>, id: string) => {
    const data = await model.findById(id);
    return data;
}

export const findOne = async (model: Model<any>, query: any) => {
    const data = await model.findOne(query);
    return data;
}

export const getAll = async (model: Model<any>, query: any, pageNumber: number = 1, pageSize: number = 20) => {
    const items = await model.find(query).skip((pageNumber - 1) * pageSize).limit(pageSize).sort({createdAt: -1})
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

export const deleteById = async(model: Model<any>, id: string) => {
    const deleteResp = await model.deleteOne({_id: id})
    
    return deleteResp.deletedCount > 0 ? true : false
}
export const deleteMany = async(model: Model<any>, query: object) => {
    const deleteResp = await model.deleteMany(query)
    return deleteResp.deletedCount
}