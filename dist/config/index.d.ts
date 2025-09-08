import { AppConfig } from '../types';
export declare const config: AppConfig;
export declare const securityConfig: {
    bcryptRounds: number;
    cookieSecret: string;
    adminEmail: string;
    adminPassword: string;
};
export declare const apiDocsConfig: {
    enabled: boolean;
    path: string;
    title: string;
    version: string;
    description: string;
};
export declare const databaseConfig: {
    uri: string;
    testUri: string;
    options: any;
};
export default config;
//# sourceMappingURL=index.d.ts.map