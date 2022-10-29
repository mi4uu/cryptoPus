import { z } from "zod";
import { PriceType } from "@server/enums";
import { klineSelector } from "@server/schema/kline.schema";

export const IndicatorSelector = klineSelector.extend({
  priceType: z.nativeEnum(PriceType),
  //  indicator: z.nativeEnum(PriceType)
});
