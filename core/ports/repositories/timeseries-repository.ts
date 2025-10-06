import { ITimeSeries, IDataPoint } from "../../entities/index.js";

export interface ITimeSeriesRepository {
    createTimeSeries(payload: Omit<ITimeSeries, 'id' | 'data_points'>): Promise<ITimeSeries>;
    getAllTimeSeries(filter: any): Promise<ITimeSeries[]>;
    getTimeSeriesById(id: string): Promise<ITimeSeries | null>;
    deleteTimeSeries(id: string): Promise<{ deletedCount: number }>;
    addDataPoint(timeSeriesId: string, dataPoint: IDataPoint): Promise<ITimeSeries | null>;
    updateDataPoint(timeSeriesId: string, dataPointId: string, updatedData: Partial<IDataPoint>): Promise<IDataPoint | null>;
    deleteDataPoint(timeSeriesId: string, dataPointId: string): Promise<boolean>;
}
