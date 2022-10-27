import { router,t } from "../trpc";
import { z } from 'zod';
import { getKlines } from "../services/kline.service";
import { PairEnumType } from "@prisma/client";

export const klineRouter = router({
    getKlines: t.procedure
    .input(z.object({
        pair: z.nativeEnum(PairEnumType),
        period:z.string(),
        dateFrom:z.string(),
        dateTo:z.string().optional(),
        limit:z.number().optional(),
      }))
    .query(({ input, ctx }) => getKlines(input)),
});