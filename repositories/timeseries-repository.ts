import { ITimeSeries, IDataPoint, TimeSeriesModel } from "../core/entities/index.js";
import { ITimeSeriesRepository } from "../core/ports/repositories/timeseries-repository.js";
import { IDatabaseService } from "../core/ports/services/database-service.js";
import { parseISODate } from "../helper/parse-iso-date.js";

export class TimeSeriesRepository implements ITimeSeriesRepository {
    private databaseService: IDatabaseService;

    constructor(databaseService: IDatabaseService) {
        this.databaseService = databaseService;
    }

    public async createTimeSeries(payload: Omit<ITimeSeries, 'id' | 'data_points'>): Promise<ITimeSeries> {
        const newTimeSeries = new TimeSeriesModel(payload);
        await newTimeSeries.save();
        return newTimeSeries;
    }

    public async getAllTimeSeries(filter: any): Promise<ITimeSeries[]> {
        return await TimeSeriesModel.find(filter);
    }

    public async getTimeSeriesById(id: string): Promise<ITimeSeries | null> {
        return await TimeSeriesModel.findOne({ id });
    }

    public async deleteTimeSeries(id: string): Promise<{ deletedCount: number }> {
        return await TimeSeriesModel.deleteOne({ id });
    }

    public async addDataPoint(timeSeriesId: string, dataPoint: IDataPoint): Promise<ITimeSeries | null> {
        const timeSeries = await TimeSeriesModel.findOne({ id: timeSeriesId });
        if (!timeSeries) {
            return null;
        }

        const newDataPoint = { ...dataPoint, timestamp: parseISODate(dataPoint.timestamp as any) };

        if (newDataPoint.timestamp === null) {
            throw new Error('Invalid timestamp format. Please use ISO 8601.');
        }

        timeSeries.data_points.push(newDataPoint as IDataPoint);
        await timeSeries.save();
        return timeSeries;
    }

    public async updateDataPoint(timeSeriesId: string, dataPointId: string, updatedData: Partial<IDataPoint>): Promise<IDataPoint | null> {
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
            const parsedTimestamp = parseISODate(updatedData.timestamp as any);
            if (parsedTimestamp === null) {
                throw new Error('Invalid timestamp format for update. Please use ISO 8601.');
            }
            dataPoint.timestamp = parsedTimestamp;
        }

        await timeSeries.save();
        return dataPoint;
    }

    public async deleteDataPoint(timeSeriesId: string, dataPointId: string): Promise<boolean> {
        const timeSeries = await TimeSeriesModel.findOne({ id: timeSeriesId });
        if (!timeSeries) {
            return false;
        }

        timeSeries.data_points.pull(dataPointId);
        await timeSeries.save();
        return true;
    }
}
