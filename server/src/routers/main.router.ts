import { t } from "@server/trpc";
import { indicatorRouter } from "./indicator.router";
import { klineRouter } from "./kline.router";
// export const appRouter = router({
//     profile: t.procedure
//     .input(z.string().nullish())
//     .query(({ input, ctx }) => ctx.user),
// });
export const appRouter = t.mergeRouters(klineRouter, indicatorRouter);
// only export *type signature* of router!
// to avoid accidentally importing your API
// into client-side code
export type AppRouter = typeof appRouter;
