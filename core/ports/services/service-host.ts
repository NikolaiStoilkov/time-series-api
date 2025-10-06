import { IDatabaseService } from "./database-service.js";

export * from './database-service.js';

export interface ServiceHost {
    getDatabaseService: (mongoUri: string) => IDatabaseService;
}