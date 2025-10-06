import { TimeSeriesModel } from "../core/entities/index.js";
import { parseISODate } from "../helper/parse-iso-date.js";
export class TimeSeriesRepository {
    databaseService; // This will not be directly used here for now, but shows the dependency
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async createTimeSeries(payload) {
        const newTimeSeries = new TimeSeriesModel(payload);
        await newTimeSeries.save();
        return newTimeSeries;
    }
    async getAllTimeSeries(filter) {
        return await TimeSeriesModel.find(filter);
    }
    async getTimeSeriesById(id) {
        return await TimeSeriesModel.findOne({ id });
    }
    async deleteTimeSeries(id) {
        return await TimeSeriesModel.deleteOne({ id });
    }
    async addDataPoint(timeSeriesId, dataPoint) {
        const timeSeries = await TimeSeriesModel.findOne({ id: timeSeriesId });
        if (!timeSeries) {
            return null;
        }
        const newDataPoint = { ...dataPoint, timestamp: parseISODate(dataPoint.timestamp) };
        if (newDataPoint.timestamp === null) {
            throw new Error('Invalid timestamp format. Please use ISO 8601.');
        }
        timeSeries.data_points.push(newDataPoint);
        await timeSeries.save();
        return timeSeries;
    }
    async updateDataPoint(timeSeriesId, dataPointId, updatedData) {
        const timeSeries = await TimeSeriesModel.findOne({ id: timeSeriesId });
        if (!timeSeries) {
            return null;
        }
        const dataPoint = timeSeries.data_points.id(dataPointId);
        if (!dataPoint) {
            return null;
        }
        Object.assign(dataPoint, updatedData);
        if (updatedData.timestamp) {
            const parsedTimestamp = parseISODate(updatedData.timestamp);
            if (parsedTimestamp === null) {
                throw new Error('Invalid timestamp format for update. Please use ISO 8601.');
            }
            dataPoint.timestamp = parsedTimestamp;
        }
        await timeSeries.save();
        return dataPoint;
    }
    async deleteDataPoint(timeSeriesId, dataPointId) {
        const timeSeries = await TimeSeriesModel.findOne({ id: timeSeriesId });
        if (!timeSeries) {
            return false;
        }
        timeSeries.data_points.pull(dataPointId);
        await timeSeries.save();
        return true;
    }
}
//# sourceMappingURL=timeseries-repository.js.map