import express from "express";
import configViewEngine from "./config/viewEngine";
import initWebRoutes from "./routes/web";
import initApiRoutes from './routes/api';
import configCors from './config/cors';
import errorMiddleware from './middleware/errorMiddleware';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
require('dotenv').config();

const app = express();

//configCors
configCors(app);

//config view engine
configViewEngine(app);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

// parse application/json
app.use(bodyParser.json({ limit: '100mb' }));

//cookie parse
app.use(cookieParser());

//init api routes
initApiRoutes(app);
//init web routes
initWebRoutes(app);

//Error handling middleware
app.use(errorMiddleware);

export default app;
