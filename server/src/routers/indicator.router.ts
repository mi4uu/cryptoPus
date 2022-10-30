import { router, t } from "@server/trpc";
import { getIndicatorForKlines } from "@server/services/getindicator.service";
import {
  IndicatorSelector,
  MacdSelector,
} from "@server/schema/indicator.schema";
import { Indicators, IndicatorType } from "@server/enums";
import { z } from "zod";

export const indicatorRouter = router({
  getMacd: t.procedure.input(MacdSelector).query(({ input, ctx }) => {
    return getIndicatorForKlines({ ...input, indicator: Indicators.macd });
  }),
  getIndicator: t.procedure.input(IndicatorSelector).query(({ input, ctx }) => {
    return getIndicatorForKlines(input);
  }),
});
