import 'express-async-errors';
declare const app: import("express-serve-static-core").Express;
declare const startServer: () => Promise<import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>>;
export default app;
export { startServer };
//# sourceMappingURL=server.d.ts.map