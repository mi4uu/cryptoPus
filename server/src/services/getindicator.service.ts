import { Kline } from "@prisma/client";
import { PriceType } from "@server/enums";
import {
  GetIndicatorParams,
  GetIndicatorForKlinesParams,
} from "@server/services/indicator.service";
import { getKlines } from "@server/services/kline.service";
const indicators = require("@server/services/indicator.service");

export const getIndicatorForKlines = async (
  params: GetIndicatorForKlinesParams
) => {
  const klines = await getKlines(params);
  const _priceType: PriceType = params.priceType
    ? params.priceType
    : PriceType.close;
  const prices = klines.map((kline) => kline[_priceType].toNumber());
  const indicatorSelector = `get${params.indicator}`;
  if (indicatorSelector in indicators) {
    const indicator: (params: GetIndicatorParams) => Promise<number[]> =
      indicators[indicatorSelector];
    return await indicator({ prices, options: params.options });
  }
};
