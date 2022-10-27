import express, { Application } from 'express';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import {appRouter, t} from './trpc';
import { createContext } from './context';
import { requiresAuth } from 'express-openid-connect';
import {auth} from 'express-openid-connect'


const Queue = require('bull');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');

import * as dotenv from 'dotenv';
import { klineRouter } from './routers/kline.router';
import { indicatorRouter } from './routers/indicator.router';

// get config from .env
dotenv.config();
const port = process.env.PORT ?? 8080


// init express
const app: Application = express();
app.use(express.json());
app.use(cors());



// init auth
const config:{
  authRequired: false,
  auth0Logout: true,
  baseURL?:string
}= {
  authRequired: false,
  auth0Logout: true,
};
if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
  config.baseURL = `http://localhost:${port}`;
}

app.use(auth(config));


// init bull admin
const queue = new Queue('trading');
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: [new BullAdapter(queue)],
    serverAdapter: serverAdapter,
  });


app.use('/admin/queues', serverAdapter.getRouter());


// setup routers
app.use(
    '/',
    trpcExpress.createExpressMiddleware({
        router: t.mergeRouters(appRouter, klineRouter, indicatorRouter),
        createContext,
    }),
);


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT} `);
});