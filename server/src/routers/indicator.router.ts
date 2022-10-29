import { router, t } from "@server/trpc";
import { getIndicatorForKlines } from "@server/services/getindicator.service";
import { IndicatorSelector } from "@server/schema/indicator.schema";
import { Indicators } from "@server/enums";

export const indicatorRouter = router({
  getMacd: t.procedure.input(IndicatorSelector).query(({ input, ctx }) => {
    console.log({ input });
    return getIndicatorForKlines({ ...input, indicator: Indicators.macd });
  }),
});
