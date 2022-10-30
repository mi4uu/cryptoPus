import { indicators } from "tulind";
import { Indicators, IndicatorType, PriceType } from "@server/enums";
import { KlineSelectorType } from "@server/schema/kline.schema";

export interface GetIndicatorParams {
  prices: number[];
  options?: number[];
}
export interface GetIndicatorForKlinesParamsBase {
  indicator: Indicators;
  options?: number[];
  priceType?: PriceType;
}
export type GetIndicatorForKlinesParams = GetIndicatorForKlinesParamsBase &
  KlineSelectorType;

export const getMacd = async ({ prices, options }: GetIndicatorParams) => {
  const results = await indicators.macd.indicator(
    [prices],
    options ? options : [12, 26, 9]
  );
  const histogram = results[2];
  return {
    indicator: histogram,
    type: IndicatorType.bar,
  };
};
