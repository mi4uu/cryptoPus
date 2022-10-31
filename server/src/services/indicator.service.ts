import { indicators } from "tulind";
import { Indicators, IndicatorType, PriceType } from "@server/enums";
import { KlineSelectorType } from "@server/schema/kline.schema";
import { PlotType } from "@client/helpers/types";
import { Kline } from "@prisma/client";
import { logger } from "@server/utils/helpers";
import * as ta from "technicalindicators";
import { getAdl } from "./indicators/adl.indicator";
import { getRsi } from "./indicators/rsi.indicator";
import { getMacd } from "./indicators/macd.indicator";
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

export { getAdl, getMacd, getRsi };
