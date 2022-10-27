import { router,t } from "../trpc";
import { z } from 'zod';
import { getMacd } from "../services/indicator.service";

export const indicatorRouter = router({
    getMacd: t.procedure
    .input(z.object({
        prices: z.number().array(),
        options:z.number().array().length(3).optional()
      }))
    .query(({ input, ctx }) => getMacd(input)),
});