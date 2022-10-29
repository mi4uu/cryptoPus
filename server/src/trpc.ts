import { z } from "zod";
import { Context } from "@server/context";
import { isAuthed } from "./middlewares/auth.middleware";
import { initTRPC } from "@trpc/server";
import { indicatorRouter } from "./routers/indicator.router";
import { klineRouter } from "./routers/kline.router";

//const t = initTRPC.create();
export const t = initTRPC.context<Context>().create();
//export const t = initTRPC.create();

export const protectedProcedure = t.procedure.use(isAuthed);

export const middleware = t.middleware;
export const router = t.router;
export const publicProcedure = t.procedure;
