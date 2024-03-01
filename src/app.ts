import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import adminRoutes from './routes/admin';
import userRoutes from './routes/user';

import dataSource  from "./db/dataSourceLocal"

const app = express();
app.use(cors());
app.use(bodyParser.json());

dataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err:Error) => {
        console.error("Error during Data Source initialization:", err)
    })
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

export default app;
