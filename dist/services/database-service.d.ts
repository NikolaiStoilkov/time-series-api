import { IDatabaseService } from '../core/ports/services/database-service.js';
export declare class DatabaseService implements IDatabaseService {
    private readonly mongoUri;
    constructor(mongoUri: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=database-service.d.ts.map