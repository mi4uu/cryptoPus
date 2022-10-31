import { GetIndicatorParams } from "../indicator.service";
import * as ta from "technicalindicators";
import { PlotType } from "@client/helpers/types";

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
