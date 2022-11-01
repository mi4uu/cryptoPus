import { Indicators, PriceType } from "./enums";
import z from "zod";

export const zodNumericStringInt = z.preprocess((val) => {
  if (typeof val === "string") return parseInt(val, 10);
  return val;
}, z.number().int());
export const indicatorOptions: Record<
  Indicators,
  Record<
    string,
    {
      type: "int" | typeof PriceType;
      validator?: z.ZodNumber | z.ZodEffects<any, any, any>;
      default: number | PriceType;
    }
  >
> = {
  [Indicators.macd]: {
    long: { type: "int", validator: zodNumericStringInt, default: 26 },
    short: { type: "int", validator: zodNumericStringInt, default: 12 },
    period: { type: "int", validator: zodNumericStringInt, default: 9 },
  },
  [Indicators.adl]: {},
  [Indicators.rsi]: {
    period: { type: "int", validator: zodNumericStringInt, default: 14 },
    priceType: { type: PriceType, default: PriceType.close },
  },
  [Indicators.bb]: {},
};
