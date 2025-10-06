import { IDatabaseService, ServiceHost } from "../core/ports/services/service-host.js";
import { DatabaseService } from "./database-service.js";

export const serviceHost: ServiceHost = {
    getDatabaseService: (mongoUri: string): IDatabaseService => {
        return new DatabaseService(mongoUri);
    }
}