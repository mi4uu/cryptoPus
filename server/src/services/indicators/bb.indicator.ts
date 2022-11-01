import { GetIndicatorParams } from "../indicator.service";
import * as ta from "technicalindicators";
import { PlotType } from "@client/helpers/types";
import { isBearish, isBullish } from "../patterns.service";

export const getBB = async ({
  klines,
  options,
  priceType,
}: GetIndicatorParams) => {
  const results = klines.map((k, i) => {
    const p = 10;
    if (i < p) return 0;
    const _ = [...klines].splice(i - p, p);
    const bull = isBullish(_, p);
    const bear = isBearish(_, p);
    if (bull) return 1;
    if (bear) return -1;
    return 0;
  });
  const x = klines.map((kline) => kline.timestamp);

  return [
    {
      x,
      y: results,
      type: "bar" as PlotType,
    },
  ];
};
