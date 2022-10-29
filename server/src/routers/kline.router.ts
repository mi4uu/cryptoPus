import { router, t } from "@server/trpc";
import { getKlines } from "../services/kline.service";
import { klineSelector } from "../schema/kline.schema";
import { PairEnumType } from "@server/enums";
import { z } from "zod";

export const klineRouter = router({
  getPairs: t.procedure
    .input(z.object({}))
    .query(({ input, ctx }) => Object.values(PairEnumType)),
  getKlines: t.procedure
    .input(klineSelector)
    .query(({ input, ctx }) => getKlines(input)),
});
