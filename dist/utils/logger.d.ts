import winston from 'winston';
declare const logger: winston.Logger;
export declare const stream: {
    write: (message: string) => void;
};
export declare const logError: (error: Error, context?: any) => void;
export declare const logInfo: (message: string, metadata?: any) => void;
export declare const logWarn: (message: string, metadata?: any) => void;
export declare const logDebug: (message: string, metadata?: any) => void;
export declare const logRequest: (req: any, res: any, responseTime?: number) => void;
export declare const logDatabaseOperation: (operation: string, collection: string, duration?: number, error?: Error) => void;
export declare const logAuth: (action: string, userId?: string, email?: string, success?: boolean, error?: string) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map