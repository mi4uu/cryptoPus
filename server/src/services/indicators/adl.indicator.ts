import { GetIndicatorParams } from "../indicator.service";
import * as ta from "technicalindicators";
import { PlotType } from "@client/helpers/types";

const defaultRsiOptions = {};
export const getAdl = async ({
  klines,
  options,
  priceType,
}: GetIndicatorParams) => {
  const volume = klines.map((kline) => kline.volume.toNumber());
  const close = klines.map((kline) => kline.close.toNumber());
  const high = klines.map((kline) => kline.high.toNumber());
  const low = klines.map((kline) => kline.low.toNumber());
  const results = ta.ADL.calculate({
    volume,
    close,
    high,
    low,
  });
  const x = klines.map((kline) => kline.timestamp);
  const y = [...Array(x.length - results.length).fill(undefined), ...results];

  return [
    {
      x,
      y,
      type: "scattergl" as PlotType,
      mode: "lines",
      color: "y",

      line: {
        width: 3,
      },
    },
  ];
};
