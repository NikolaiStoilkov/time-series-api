import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

import { DataPointSchema, IDataPoint } from "./data-point.js";

interface ITimeSeries extends Document {
    id: string; // UUID for external API use
    name: string;
    description?: string;
    frequency: string;
    units: string;
    tags?: string[];
    data_points: IDataPoint[];
}

const TimeSeriesSchema = new Schema<ITimeSeries>({
    id: { type: String, required: true, unique: true, default: () => uuidv4() },
    name: { type: String, required: true },
    description: String,
    frequency: { type: String, required: true },
    units: { type: String, required: true },
    tags: [String],
    data_points: [DataPointSchema]
});

const TimeSeriesModel = mongoose.model<ITimeSeries>('TimeSeries', TimeSeriesSchema);

export { TimeSeriesModel, TimeSeriesSchema, type ITimeSeries };