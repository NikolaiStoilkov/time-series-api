import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { DataPointSchema } from "./data-point.js";
const TimeSeriesSchema = new Schema({
    id: { type: String, required: true, unique: true, default: () => uuidv4() },
    name: { type: String, required: true },
    description: String,
    frequency: { type: String, required: true },
    units: { type: String, required: true },
    tags: [String],
    data_points: [DataPointSchema]
});
const TimeSeriesModel = mongoose.model('TimeSeries', TimeSeriesSchema);
export { TimeSeriesModel, TimeSeriesSchema };
//# sourceMappingURL=time-series.js.map