import { Indicators, PriceType } from "shared/enums";
import { KlineSelectorType } from "@server/schema/kline.schema";
import { PlotType } from "@client/helpers/types";
import { Kline } from "@prisma/client";
import { logger } from "@server/utils/helpers";
import { getAdl } from "./indicators/adl.indicator";
import { getRsi } from "./indicators/rsi.indicator";
import { getMacd } from "./indicators/macd.indicator";
import { z } from "zod";
import { getBB } from "./indicators/bb.indicator";
export interface GetIndicatorParams {
  klines: Kline[];
  options?: { [key: string]: number | boolean };
  priceType?: PriceType;
}
export interface GetIndicatorForKlinesParamsBase {
  indicator: Indicators;
  options?: { [key: string]: number | boolean };
  priceType?: PriceType;
}
export type GetIndicatorForKlinesParams = GetIndicatorForKlinesParamsBase &
  KlineSelectorType;

// [validator, default]
export const indicatorOptions = {
  [Indicators.macd]: {
    long: [z.number().int(), 26],
    short: [z.number().int(), 12],
    period: [z.number().int(), 9],
  },
  [Indicators.adl]: {},
  [Indicators.rsi]: {
    period: [z.number().int(), 14],
    priceType: [PriceType, PriceType.close],
  },
};

export { getAdl, getMacd, getRsi, getBB };
