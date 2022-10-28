import { router,t } from "../trpc";
import { z } from 'zod';
import { getIndicatorForKlines } from "../services/getindicator.service";
import { IndicatorSelector } from "../schema/indicator.schema";

export const indicatorRouter = router({
    getMacd: t.procedure
    .input(IndicatorSelector)
    .query(({ input, ctx }) => {
        return getIndicatorForKlines(input)
    },
});