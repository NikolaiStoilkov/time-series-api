import { Schema } from "mongoose";

interface IDataPoint {
    timestamp: Date; // Stored as Date in MongoDB for efficient querying
    value: number;
}

const DataPointSchema = new Schema<IDataPoint>({
    timestamp: { type: Date, required: true },
    value: { type: Number, required: true }
});

export { DataPointSchema, type IDataPoint };



