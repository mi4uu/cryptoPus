import { GetIndicatorParams } from "../indicator.service";
import * as ta from "technicalindicators";
import { PlotType } from "@client/helpers/types";

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
