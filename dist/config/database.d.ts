declare class Database {
    private static instance;
    private isConnected;
    private constructor();
    static getInstance(): Database;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getConnectionStatus(): boolean;
    healthCheck(): Promise<boolean>;
    dropDatabase(): Promise<void>;
}
export declare const database: Database;
export declare const connectToDatabase: () => Promise<void>;
export declare const disconnectFromDatabase: () => Promise<void>;
export declare const isDatabaseHealthy: () => Promise<boolean>;
export default database;
//# sourceMappingURL=database.d.ts.map