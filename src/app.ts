import express, { Express } from 'express';
import { MyServer } from '@root/setUpServer';
import databaseConnection from '@root/setupDatabase';
import { config } from '@root/config';

class Application {
  public initialize(): void {
    this.loadConfig(); // loading config file before starting any other process. ( like db connection / server start);
    databaseConnection();
    const app: Express = express();
    const server: MyServer = new MyServer(app);
    server.start();
  }

  private loadConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }
}

const application: Application = new Application();
application.initialize();
