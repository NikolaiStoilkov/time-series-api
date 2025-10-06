import { Schema } from "mongoose";
const DataPointSchema = new Schema({
    timestamp: { type: Date, required: true },
    value: { type: Number, required: true }
}, { _id: false });
export { DataPointSchema };
//# sourceMappingURL=data-point.js.map