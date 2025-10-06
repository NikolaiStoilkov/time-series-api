

export interface IDatabaseService {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    // You might add methods here to get specific models if needed,
    // but generally, repositories will handle model access.
}