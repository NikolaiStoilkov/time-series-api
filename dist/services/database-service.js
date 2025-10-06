import mongoose from 'mongoose';
export class DatabaseService {
    mongoUri;
    constructor(mongoUri) {
        this.mongoUri = mongoUri;
    }
    async connect() {
        try {
            await mongoose.connect(this.mongoUri, {
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                bufferCommands: false
            });
            console.log('Connected to MongoDB');
        }
        catch (error) {
            console.error('Could not connect to MongoDB:', error);
            throw error; // Re-throw to be handled by the caller
        }
    }
    async disconnect() {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}
//# sourceMappingURL=database-service.js.map