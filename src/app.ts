import express, { Express } from 'express';
import { MyServer } from "./setUpServer";
import databaseConnection from "./setupDatabase";
import { config } from "./config";

class Application {
    public initialize(): void {
        this.loadConfig();  // loading config file before starting any other process. ( like db connection / server start);
        databaseConnection();
        const app: Express = express();
        const server: MyServer = new MyServer(app);
        server.start();
    }

    private loadConfig(): void {
        config.validateConfig();
    }
}

const application: Application = new Application();
application.initialize();