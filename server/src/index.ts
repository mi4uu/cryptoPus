import express, { Application } from 'express';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import {appRouter} from './app';
import { createContext } from './context';
import { requiresAuth } from 'express-openid-connect';
import {auth} from 'express-openid-connect'
import * as dotenv from 'dotenv';
dotenv.config();

const app: Application = express();


app.use(express.json());
app.use(cors());
const port = process.env.PORT ?? 8080
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
app.use(
    '/',
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext,
    }),
);



app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT} `);
});