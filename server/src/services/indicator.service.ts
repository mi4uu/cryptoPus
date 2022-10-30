import { indicators } from "tulind";
import { Indicators, IndicatorType, PriceType } from "@server/enums";
import { KlineSelectorType } from "@server/schema/kline.schema";
import { PlotType } from "@client/helpers/types";
import { Kline } from "@prisma/client";
import { logger } from "@server/utils/helpers";
export interface GetIndicatorParams {
  klines: Kline[];
  options?: number[];
  priceType?: PriceType;
}
export interface GetIndicatorForKlinesParamsBase {
  indicator: Indicators;
  options?: number[];
  priceType?: PriceType;
}
export type GetIndicatorForKlinesParams = GetIndicatorForKlinesParamsBase &
  KlineSelectorType;

export const getMacd = async ({
  klines,
  options,
  priceType,
}: GetIndicatorParams) => {
  const prices = klines.map((kline) =>
    kline[priceType ? priceType : "close"].toNumber()
  );
  const x = klines.map((kline) => kline.timestamp);
  const results = await indicators.macd.indicator(
    [prices],
    options ? options : [12, 26, 9]
  );
  const histogram = results[2];
  logger.info({
    xlen: x.length,
    histogram: histogram.length,
  });
  return [
    {
      x,
      y: histogram,
      type: "bar" as PlotType,
    },
  ];
};
