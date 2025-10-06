import mongoose from 'mongoose';
import { IDatabaseService } from '../core/ports/services/database-service.js';

export class DatabaseService implements IDatabaseService {
    private readonly mongoUri: string;

    constructor(mongoUri: string) {
        this.mongoUri = mongoUri;
    }

    public async connect(): Promise<void> {
        try {
            await mongoose.connect(this.mongoUri, {
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                bufferCommands: false
            });
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Could not connect to MongoDB:', error);
            throw error; // Re-throw to be handled by the caller
        }
    }

    public async disconnect(): Promise<void> {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}