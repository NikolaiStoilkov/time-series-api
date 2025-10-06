import { Schema } from "mongoose";
interface IDataPoint {
    timestamp: Date;
    value: number;
}
declare const DataPointSchema: Schema<IDataPoint, import("mongoose").Model<IDataPoint, any, any, any, import("mongoose").Document<unknown, any, IDataPoint, any, {}> & IDataPoint & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IDataPoint, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<IDataPoint>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<IDataPoint> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export { DataPointSchema, type IDataPoint };
//# sourceMappingURL=data-point.d.ts.map