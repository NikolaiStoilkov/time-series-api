import mongoose from "mongoose";
import { IDataPoint } from "./data-point.js";
interface ITimeSeries extends Document {
    id: string;
    name: string;
    description?: string;
    frequency: string;
    units: string;
    tags?: string[];
    data_points: IDataPoint[];
}
declare const TimeSeriesSchema: mongoose.Schema<ITimeSeries, mongoose.Model<ITimeSeries, any, any, any, mongoose.Document<unknown, any, ITimeSeries, any, {}> & ITimeSeries & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ITimeSeries, mongoose.Document<unknown, {}, mongoose.FlatRecord<ITimeSeries>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<ITimeSeries> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
declare const TimeSeriesModel: mongoose.Model<ITimeSeries, {}, {}, {}, mongoose.Document<unknown, {}, ITimeSeries, {}, {}> & ITimeSeries & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export { TimeSeriesModel, TimeSeriesSchema, type ITimeSeries };
//# sourceMappingURL=time-series.d.ts.map