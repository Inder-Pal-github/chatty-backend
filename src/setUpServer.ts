import { Application, json, urlencoded, Response, Request, NextFunction } from 'express'
import http from 'http'
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import compression from 'compression';
import 'express-async-errors';
import { config } from "./config";
import applicationRoutes from "./routes";
import { CustomError, IErrorResponse } from './shared/globals/helpers/error-handler';
import Logger from "bunyan";

const SERVER_PORT = 8080;
const log: Logger = config.createLogger("server")

export class MyServer {

    private app: Application;
    constructor(app: Application) {
        this.app = app;
    }

    public start(): void {
        this.securityMiddlware(this.app);
        this.standardMiddlware(this.app);
        this.routesMiddlware(this.app);
        this.globalErrorHandler(this.app);
        this.startServer(this.app);
    }

    private securityMiddlware(app: Application): void {
        app.use(cookieSession({
            name: "session",
            keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: config.NODE_ENV !== "development",
        }))
        app.use(hpp());
        app.use(helmet());
        app.use(cors({
            origin: config.CLIENT_URL,
            credentials: true,  // This important to set it to true otherwise cookies might not work.
            optionsSuccessStatus: 200,
            methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"]
        }))
    }
    // Basic middleware for the application
    private standardMiddlware(app: Application): void {
        app.use(compression());
        app.use(json({ limit: "50mb" }));
        app.use(urlencoded({ extended: true, limit: "50mb" }));
    }

    // Routes
    private routesMiddlware(app: Application): void {
        applicationRoutes(app);
    }
    // Global error handler.
    private globalErrorHandler(app: Application): void {
        app.all("*", (req: Request, res: Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` })
        })

        app.use((error: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
            log.error(error);
            if (error instanceof CustomError) {
                return res.status(error.statusCode).json(error.serializeErrors())
            }
            next();
        })
    }

    private async startServer(app: Application): Promise<void> {
        try {
            const httpServer: http.Server = new http.Server(app);
            this.startHttpServer(httpServer);
        } catch (error: any) {
            log.error(error);
        }
    }

    private createSocketIO(httpServer: http.Server): void { }

    private startHttpServer(httpServer: http.Server): void {
        log.info(`Server started with process ${process.pid}`);
        httpServer.listen(SERVER_PORT, () => {
            log.info(`Starting server on port ${SERVER_PORT}`);
        })
    }
}