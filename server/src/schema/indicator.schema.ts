import { z } from "zod";
import { Indicators, PriceType } from "shared/enums";
import { klineSelector } from "@server/schema/kline.schema";

export const IndicatorSelector = klineSelector.extend({
  priceType: z.nativeEnum(PriceType),
  indicator: z.nativeEnum(Indicators),
});
export const MacdSelector = klineSelector.extend({
  priceType: z.nativeEnum(PriceType),
  //  indicator: z.nativeEnum(PriceType)
});
