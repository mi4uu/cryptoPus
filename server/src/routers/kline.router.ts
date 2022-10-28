import { router,t } from "../trpc";
import { getKlines } from "../services/kline.service";
import { klineSelector } from "../schema/kline.schema";

export const klineRouter = router({
    getKlines: t.procedure
    .input(klineSelector)
    .query(({ input, ctx }) => getKlines(input)),
});