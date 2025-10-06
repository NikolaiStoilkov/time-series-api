import { IDatabaseService } from "../services/database-service.js";
import { ITimeSeriesRepository } from "./timeseries-repository.js";
export * from './timeseries-repository.js';
export interface RepositoryHost {
    getTimeseriesRepository: (databaseService: IDatabaseService) => ITimeSeriesRepository;
}
//# sourceMappingURL=repository-host.d.ts.map