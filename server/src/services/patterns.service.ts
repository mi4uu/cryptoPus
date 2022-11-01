import { Kline } from "@prisma/client";
import * as ta from "technicalindicators";
const getKlines = (klines: Kline[], count: number) => {
  const klinesRequired = 1;
  const _klines = [...klines].splice(-1 * klinesRequired);
  const open = klines.map((kline) => kline.open.toNumber());
  const close = klines.map((kline) => kline.close.toNumber());
  const high = klines.map((kline) => kline.high.toNumber());
  const low = klines.map((kline) => kline.low.toNumber());
  const result = { open, close, high, low };
  return result;
};

const patterns = {
  "Abandoned Baby": (klines: Kline[]) => {
    const result = ta.abandonedbaby(getKlines(klines, 3));
    return result;
  },
  "Bearish Engulfing Pattern": (klines: Kline[]) => {
    const result = ta.bearishengulfingpattern(getKlines(klines, 2));
    return result;
  },
  "Bullish Engulfiing Pattern": (klines: Kline[]) => {
    const result = ta.bullishengulfingpattern(getKlines(klines, 2));
    return result;
  },
  "Dark Cloud Cover": (klines: Kline[]) => {
    const result = ta.darkcloudcover(getKlines(klines, 2));
    return result;
  },
  "Downside Tasuki Gap": (klines: Kline[]) => {
    const result = ta.downsidetasukigap(getKlines(klines, 3));
    return result;
  },
  Doji: (klines: Kline[]) => {
    const result = ta.doji(getKlines(klines, 1));
    return result;
  },
  "DragonFly Doji": (klines: Kline[]) => {
    const result = ta.dragonflydoji(getKlines(klines, 1));
    return result;
  },
  "GraveStone Doji": (klines: Kline[]) => {
    const result = ta.gravestonedoji(getKlines(klines, 1));
    return result;
  },
  BullishHarami: (klines: Kline[]) => {
    const result = ta.bullishharami(getKlines(klines, 2));
    return result;
  },
  "Bearish Harami Cross": (klines: Kline[]) => {
    const result = ta.bearishharamicross(getKlines(klines, 2));
    return result;
  },
  "Bullish Harami Cross": (klines: Kline[]) => {
    const result = ta.bullishharamicross(getKlines(klines, 2));
    return result;
  },
  "Bullish Marubozu": (klines: Kline[]) => {
    const result = ta.bullishmarubozu(getKlines(klines, 1));
    return result;
  },
  "Bearish Marubozu": (klines: Kline[]) => {
    const result = ta.bearishmarubozu(getKlines(klines, 1));
    return result;
  },
  "Evening Doji Star": (klines: Kline[]) => {
    const result = ta.eveningdojistar(getKlines(klines, 3));
    return result;
  },
  "Evening Star": (klines: Kline[]) => {
    const result = ta.eveningstar(getKlines(klines, 3));
    return result;
  },
  "Bearish Harami": (klines: Kline[]) => {
    const result = ta.bearishharami(getKlines(klines, 2));
    return result;
  },
  "Piercing Line": (klines: Kline[]) => {
    const result = ta.piercingline(getKlines(klines, 2));
    return result;
  },
  "Bullish Spinning Top": (klines: Kline[]) => {
    const result = ta.bullishspinningtop(getKlines(klines, 1));
    return result;
  },
  "Bearish Spinning Top": (klines: Kline[]) => {
    const result = ta.bearishspinningtop(getKlines(klines, 1));
    return result;
  },
  "Morning Doji Star": (klines: Kline[]) => {
    const result = ta.morningdojistar(getKlines(klines, 3));
    return result;
  },
  "Morning Star": (klines: Kline[]) => {
    const result = ta.morningstar(getKlines(klines, 3));
    return result;
  },
  "Three Black Crows": (klines: Kline[]) => {
    const result = ta.threeblackcrows(getKlines(klines, 3));
    return result;
  },
  "Three White Soldiers": (klines: Kline[]) => {
    const result = ta.threewhitesoldiers(getKlines(klines, 3));
    return result;
  },
  "Bullish Hammer": (klines: Kline[]) => {
    const result = ta.bullishhammerstick(getKlines(klines, 1));
    return result;
  },
  "Bearish Hammer": (klines: Kline[]) => {
    const result = ta.bearishhammerstick(getKlines(klines, 1));
    return result;
  },
  "Bullish Inverted Hammer": (klines: Kline[]) => {
    const result = ta.bullishinvertedhammerstick(getKlines(klines, 1));
    return result;
  },
  "Bearish Inverted Hammer": (klines: Kline[]) => {
    const result = ta.bearishinvertedhammerstick(getKlines(klines, 1));
    return result;
  },
  "Hammer Pattern": (klines: Kline[]) => {
    const result = ta.hammerpattern(getKlines(klines, 5));
    return result;
  },
  "Hammer Pattern (Unconfirmed)": (klines: Kline[]) => {
    const result = ta.hammerpatternunconfirmed(getKlines(klines, 5));
    return result;
  },
  "Hanging Man": (klines: Kline[]) => {
    const result = ta.hangingman(getKlines(klines, 5));
    return result;
  },
  "Hanging Man (Unconfirmed)": (klines: Kline[]) => {
    const result = ta.hangingmanunconfirmed(getKlines(klines, 5));
    return result;
  },
  "Shooting Star": (klines: Kline[]) => {
    const result = ta.shootingstar(getKlines(klines, 5));
    return result;
  },
  "Shooting Star (Unconfirmed)": (klines: Kline[]) => {
    const result = ta.shootingstarunconfirmed(getKlines(klines, 5));
    return result;
  },
  "Tweezer Top": (klines: Kline[]) => {
    const result = ta.tweezertop(getKlines(klines, 5));
    return result;
  },
  "Tweezer Bottom": (klines: Kline[]) => {
    const result = ta.tweezerbottom(getKlines(klines, 5));
    return result;
  },
};
export const isBullish = (klines: Kline[], count: number) =>
  ta.bullish(getKlines(klines, count));
export const isBearish = (klines: Kline[], count: number) =>
  ta.bearish(getKlines(klines, count));
