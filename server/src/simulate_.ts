import * as dotenv from "dotenv";
import day from "dayjs";
import { KlineInterval, MainClient } from "binance";
import { prisma } from "./utils/prisma";
import { PairEnumType } from "@prisma/client";
import { indicators } from "tulind";
import { Decimal } from "@prisma/client/runtime";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

import fs from "fs";
dotenv.config();
day.extend(duration);
day.extend(relativeTime);
const now = day();
const buyForUsd = new Decimal(10);
const calculateBuyAmount = (price: Decimal, payed: Decimal) => {
  const one = new Decimal(1);
  return one.div(price).mul(payed);
};

const percent = (a: Decimal, b: Decimal) => a.minus(b).div(a).mul(100);
const watch = async (symbol: PairEnumType, sellOnHighBand: boolean, minMacd:number) => {
  let startDate = day(process.env.START_DATE).add(2, "d");

  console.log(
    `----------------------------------- start for ${symbol} -----------------------------------`
  );
  const diff: Decimal[] = [];
  let trades: {
    price: Decimal;
    sellFor: Decimal;
    when: string;
    amount: Decimal;
    timestamp: string;
    macd?: number;
    timeToSell?: string;
  }[] = [];
  let done: typeof trades = [];
  let wantToBuy = false;
  let sold = 0;
  let earn = new Decimal(0.0);

  let counter = 0;
  while (startDate < now) {
    startDate = startDate.add(1, "m");
    //  console.log(startDate.format('YYYY-MM-DD HH:mm'))
    const price = (
      await prisma.kline.findMany({
        where: {
          pair: symbol,
          period_id: "1m",
          timestamp: {
            lte: startDate.toDate(),
          },
        },
        orderBy: [{ timestamp: "desc" }],
        take: 1,
        select: {
          close: true,
        },
      })
    )[0].close;
    // const strData = (
    //   await prisma.kline.findMany({
    //     where: {
    //       pair: symbol,
    //       period_id: "5m",
    //       timestamp: {
    //         lte: startDate.toDate(),
    //       },
    //     },
    //     orderBy: [{ timestamp: "desc" }],
    //     take: 3,
    //     select: {
    //       close: true,
    //     },
    //   })
    // );
    // const str = percent(strData[2].close,strData[0].close)
    const str = new Decimal(0);
    const close = (
      await prisma.kline.findMany({
        where: {
          pair: symbol,
          period_id: "1h",
          timestamp: {
            lte: startDate.toDate(),
          },
        },
        orderBy: [{ timestamp: "desc" }],
        take: 30,
        select: {
          close: true,
        },
      })
    )
      .map((kline) => kline.close.toNumber())
      .reverse();
    const macdClose = (
      await prisma.kline.findMany({
        where: {
          pair: symbol,
          period_id: "15m",
          timestamp: {
            lte: startDate.toDate(),
          },
        },
        orderBy: [{ timestamp: "desc" }],
        take: 30,
        select: {
          close: true,
        },
      })
    )
      .map((kline) => kline.close.toNumber())
      .reverse();
   //  console.log({price, close})

    counter += 1;

    // if(close.length<20) continue
    const bb = await indicators.bbands.indicator([close], [20, 2]);
    const bands = {
      lower: new Decimal(bb[0].splice(-1)[0]),
      middle: new Decimal(bb[1].splice(-1)[0]),
      high: new Decimal(bb[2].splice(-1)[0]),
    };
    const macd_ = await indicators.macd.indicator([macdClose], [12, 26, 9]);
    const macd = macd_[2].slice(-1);
    const targetBand =
      sellOnHighBand && macd.length > 0 && macd[0] >= 50
        ? bands.high
        : bands.middle;
    // if(bands.lower !== lastLow){
    //     lastLow=bands.lower
    //     console.log(startDate.format('YYYY-MM-DD HH:mm'),JSON.stringify(bands))
    // }
    //  console.log(JSON.stringify(bands))
    if (price.lessThan(bands.lower)) {
      wantToBuy = true;
    }
    const when = startDate.format("YYYY-MM-DD");
    if (counter % 10000 === 0) {
      console.log(
        `[${symbol}][${startDate.format("YYYY-MM-DD HH:mm")}]`,
        "to sell :",
        trades.length,
        " sold ",
        sold,
        " price: ", price.toNumber(),
        " trades from today: ",  trades.filter((t) => t.when === when).length,
        " - ",when
      );
    }

    if (
      price > bands.lower &&
      wantToBuy &&
      trades.filter((t) => t.when === when).length === 0
    ) {
      const sellDiff = percent(targetBand, price);

      if (sellDiff.lessThan(0.3) ) {
    //    console.log(`[${symbol}][${startDate.format("YYYY-MM-DD HH:mm")}]`,'not buying - diff is ', sellDiff)
        wantToBuy = false;
        continue;
      }
      if ( !macd[0] || macd[0] <=minMacd) {
  //      console.log(`[${symbol}][${startDate.format("YYYY-MM-DD HH:mm")}]`,'not buying - macd is  ', macd[0])

        wantToBuy = false;
        continue;
      }
      console.log(
        `[${symbol}][${startDate.format("YYYY-MM-DD HH:mm")}]`,
        "to sell :",
        trades.length,
        " sold ",
        sold
      );
      console.log(
        `[${symbol}][${startDate.format("YYYY-MM-DD HH:mm")}]`, `BUY for ${price} - target low: ${sellDiff.toFixed(1)}% str: ${str
          .toNumber()
          .toFixed(2)}%  macd - ${macd[0]}`
      );
      trades.push({
        price,
        sellFor: targetBand,
        when,
        amount: calculateBuyAmount(price, buyForUsd),
        timestamp: startDate.toISOString(),
        macd: macd.length > 0 ? macd[0] : undefined,
      });
      wantToBuy = false;
    }
    // trade
    for (const trade of trades) {
      if (trade.sellFor < price) {
        console.log(
          `[${symbol}][${startDate.format("YYYY-MM-DD HH:mm")}]`,
          "to sell :",
          trades.length - 1,
          " sold ",
          sold
        );

        const percDiff = percent(price, trade.price);
        diff.push(percDiff);
        if (!percDiff) {
          console.log(percDiff);
        }
        sold += 1;
        earn = earn.plus(price.minus(trade.price).mul(trade.amount));
        const _trade = trades.filter((t) => t === trade)[0];
        const timeToSell = day
          .duration(day(_trade.timestamp).diff(startDate))
          .humanize();
        done.push({ ..._trade, timeToSell });
        trades = trades.filter((t) => t !== trade);
        console.log("SELL - ", percDiff.toFixed(1), "%", " ", timeToSell);
      }
    }
  }
  if(sold===0) {
    console.log('no trades was made ;(')
    return false
  }
  const price = (
    await prisma.kline.findMany({
      where: {
        pair: symbol,
        period_id: "5m",
      },
      orderBy: [{ timestamp: "desc" }],
      take: 1,
      select: {
        close: true,
      },
    })
  )[0].close;
  const loss =
    trades.length > 0
      ? buyForUsd
          .mul(trades.length)
          .minus(Decimal.sum(...trades.map((t) => t.amount.mul(price))))
      : new Decimal(0);
  console.log(
    JSON.stringify(
      {
        sold,
        earn: earn,
        loss,
        trades_left: trades.length,
        avgDiff: diff
          .reduce((a, b) => a.plus(b), new Decimal(0))
          .div(diff.length),
        diffMax: Decimal.max(...diff),
        diffMin: Decimal.min(...diff),
        trades,
        done,
      },
      null,
      4
    )
  );
  const content = JSON.stringify(
    {
      symbol,
      sold,
      earn: earn,
      loss,
      trades_left: trades.length,
      avgDiff: diff
        .reduce((a, b) => a.plus(b), new Decimal(0))
        .div(diff.length),
      diffMax: Decimal.max(...diff),
      diffMin: Decimal.min(...diff),
      trades,
      done,
    },
    null,
    4
  );
  fs.writeFile(`../../results/${symbol}.json`, content, (err) => {
    if (err) {
      console.error(err);
    }
    // file written successfully
  });
  return {symbol,sold,
    earn: earn,
    loss,};
  process.exit(0);
};
const runAll = async () => {
  //await watch("BTCUSDT", true);
 // await watch("ETHUSDT", true, 9);
 const result=[]
 for(const symbol in PairEnumType){
  result.push(await watch(symbol as PairEnumType, true, 0))
 }
 //const result = await Promise.all(Object.values(PairEnumType).map(async symbol=> await watch(symbol as PairEnumType, true, 0)))
console.log("================================")
console.log(JSON.stringify(result,null,2))
  process.exit(0);
};

runAll();
