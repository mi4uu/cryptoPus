import { indicators } from "tulind";
import { Indicators, IndicatorType, PriceType } from "@server/enums";
import { KlineSelectorType } from "@server/schema/kline.schema";
import { PlotType } from "@client/helpers/types";
import { Kline } from "@prisma/client";
import { logger } from "@server/utils/helpers";
import * as ta from "technicalindicators";
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

const defaultMACDOptions = {
  fastPeriod: 12,
  slowPeriod: 26,
  signalPeriod: 9,
  SimpleMAOscillator: false,
  SimpleMASignal: false,
};

export const getMacd = async ({
  klines,
  options,
  priceType,
}: GetIndicatorParams) => {
  const prices = klines.map((kline) =>
    kline[priceType ? priceType : "close"].toNumber()
  );
  const results = ta.MACD.calculate({
    ...defaultMACDOptions,
    values: prices,
    ...options,
  });
  const x = klines.map((kline) => kline.timestamp);
  const _histogram = results.map((r) => r.histogram);
  const histogram = [
    ...Array(x.length - _histogram.length).fill(undefined),
    ..._histogram,
  ];

  return [
    {
      x,
      y: histogram,
      type: "bar" as PlotType,
    },
  ];
};

const defaultRsiOptions = { period: 14 };
export const getRsi = async ({
  klines,
  options,
  priceType,
}: GetIndicatorParams) => {
  const prices = klines.map((kline) =>
    kline[priceType ? priceType : "close"].toNumber()
  );
  const results = ta.RSI.calculate({
    ...defaultRsiOptions,
    values: prices,
    ...options,
  });
  const x = klines.map((kline) => kline.timestamp);
  const rsi = [...Array(x.length - results.length).fill(undefined), ...results];

  return [
    {
      x,
      y: [...rsi],
      type: "scattergl" as PlotType,
      mode: "lines+markers",
      color: "y",
      marker: {
        color: [...rsi],
        cmin: 30,
        cmax: 70,
        colorscale: [
          [0, "green"],
          [0.3, "lightblue"],
          [0.7, "lightblue"],
          [1, "red"],
        ],
      },
      line: {
        width: 3,
        color: "lightblue",
      },
    },
  ];
};
