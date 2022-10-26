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
import { saveChart } from "./createSimulationGraph";
dotenv.config();
day.extend(duration);
day.extend(relativeTime);
const now = day();
const buyForUsd = new Decimal(10);
const calculateBuyAmount = (price: Decimal, payed: Decimal) => {
  const one = new Decimal(1);
  return one.div(price).mul(payed);
};
const start = day(process.env.START_DATE).add(2, "d");
const timeToFinish = now.diff(start);
const percent = (a: Decimal, b: Decimal) => a.minus(b).div(a).mul(100);
let lastProgress = 0;
const watch = async (
  symbol: PairEnumType,
  sellOnHighBand: boolean,
  minMacd: number
) => {
  let startDate = day(process.env.START_DATE).add(2, "d");

  console.log(
    `----------------------------------- start for ${symbol} -----------------------------------`
  );

  const diff: Decimal[] = [];
  interface trade {
    price: Decimal;
    sellFor: Decimal;
    when: string;
    amount: Decimal;
    timestamp: string;
    macd?: number;
    timeToSell?: string;
    buyTime:string,
    soldTime?:string
    soldFor?:Decimal
  }
  let trades: trade[] = [];
  let done: trade[] = [];
  let doneWithLoss: trade[] = [];
  let wantToBuy = false;
  let sold = 0;
  let earn = new Decimal(0.0);

  let counter = 0;
  let close: number[] = [];
  let macdClose: number[] = [];
  let lastHour = startDate.format("HH");
  const data1h = (
    await prisma.kline.findMany({
      where: {
        pair: symbol,
        period_id: "1h",

      },
      orderBy: [{ timestamp: "asc" }],
      select: {
        close: true,
        timestamp:true
      },
    })
  )
  while (startDate < now) {
    const progressLeft = now.diff(startDate);
    const progress = parseInt(
      (((timeToFinish - progressLeft) / progressLeft) * 100).toFixed(0),
      10
    );
    if (progress > lastProgress) {
      lastProgress = progress;
      //  console.log(`${progress.toFixed(1)}%`)
    }
    startDate = startDate.add(1, "m");
    const currentHour = startDate.format("HH")

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
    const close = data1h.filter(p=>day(p.timestamp).isBefore(startDate)).map(p=>p.close.toNumber())

    //console.log(close.length)
    // if (macdClose.length === 0 || counter % (4 * 60) === 0)
    //   macdClose = (
    //     await prisma.kline.findMany({
    //       where: {
    //         pair: symbol,
    //         period_id: "4h",
    //         timestamp: {
    //           lte: startDate.toDate(),
    //         },
    //       },
    //       orderBy: [{ timestamp: "desc" }],
    //       take: 30,
    //       select: {
    //         close: true,
    //       },
    //     })
    //   )
    //     .map((kline) => kline.close.toNumber())
    //     .reverse();
    //  console.log({price, close})

    counter += 1;

    // if(close.length<20) continue
    const bb = await indicators.bbands.indicator([close], [20, 1.5]);
    const bands = {
      lower: new Decimal(bb[0].splice(-1)[0]),
      middle: new Decimal(bb[1].splice(-1)[0]),
      high: new Decimal(bb[2].splice(-1)[0]),
    };
    const macd_ = await indicators.macd.indicator([close], [12, 26, 9]);
    const macd2 = macd_[2][macd_[2].length - 1];
    const macd1 = macd_[2][macd_[2].length - 2];
    const macd0 = macd_[2][macd_[2].length - 3];
    if(lastHour!==currentHour ){
      //data1h.splice(0,1)
      lastHour=currentHour
      console.log(macd_[2])
    }
    const targetBand = bands.middle;
    // if(bands.lower !== lastLow){
    //     lastLow=bands.lower
    //     console.log(startDate.format('YYYY-MM-DD HH:mm'),JSON.stringify(bands))
    // }
    //  console.log(JSON.stringify(bands))
    const when = startDate.format("YYYY-MM-DD");
    const sellDiff = percent(bands.middle, bands.lower);
//const targetPrice = price.plus(price.mul(sellDiff.div(100)));
const targetPrice= bands.high
    if (
      macd0 < macd1 &&
      macd1 < macd2 &&
      macd2 > minMacd &&
      (macd1<0 || macd0<0) &&
      trades.filter((t) => t.when === when).length === 0 &&
     // targetPrice.lessThan(bands.middle) &&
      percent(bands.high, price).greaterThan(2)
    ) {
      wantToBuy = true;
    }

    if (counter % 10000 === 0) {
      console.log(
        `[${symbol}][${startDate.format("YYYY-MM-DD HH:mm")}]`,
        "to sell :",
        trades.length,
        " sold ",
        sold,
        " price: ",
        price.toNumber(),
        " trades from today: ",
        trades.filter((t) => t.when === when).length,
        " - ",
        when,
        " - macd: ",
        [macd0, macd1, macd2]
      );
    }

    if (wantToBuy) {
      if (sellDiff.lessThan(0.3)) {
        //    console.log(`[${symbol}][${startDate.format("YYYY-MM-DD HH:mm")}]`,'not buying - diff is ', sellDiff)
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
        `[${symbol}][${startDate.format("YYYY-MM-DD HH:mm")}]`,
        `BUY for ${price} - target low: ${sellDiff.toFixed(1)}
      macd - ${macd2}`
      );
      trades.push({
        price,
        sellFor:targetPrice,
        when,
        amount: calculateBuyAmount(price, buyForUsd),
        timestamp: startDate.toISOString(),
        macd: macd2 ? macd2 : undefined,
        buyTime: startDate.toISOString()
      });
      wantToBuy = false;
    }
    // trade
    for (const trade of trades) {
      if (trade.sellFor < price || (trade.price>price && macd2<0)) {
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
        if(percDiff.lessThanOrEqualTo(0))
          doneWithLoss.push({ ..._trade, timeToSell, soldTime:startDate.toISOString() , soldFor:price});
        else
          done.push({ ..._trade, timeToSell, soldTime:startDate.toISOString(), soldFor:price });
        trades = trades.filter((t) => t !== trade);
        console.log("SELL - ", percDiff.toFixed(1), "", " ", timeToSell);
        console.log("--- EARN:", earn.toNumber())
      }
    }
  }
  if (sold === 0) {
    console.log("no trades was made ;(");
    return { symbol, err: "no trades was made ;(" };
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
        //   done,
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
      doneWithLoss
    },
    null,
    4
  );

  fs.writeFile(`../../results/${symbol}_ss1h.json`, content, (err) => {
    if (err) {
      console.error(err);
    }
    // file written successfully
  });
  const mapToTrades = (deals:trade[])=>deals.filter(d=>!!d.buyTime && !!d.soldTime && !!d.sellFor).map(d=>({
    dateBuy:d.buyTime!,
    dateSell:d.soldTime!,
    buyFor:d.price.toNumber(),
    target:d.sellFor.toNumber(),
    soldFor:d.soldFor!.toNumber(),
    macd:d.macd

  }))
  await saveChart(symbol, '1h', mapToTrades(done),  mapToTrades(doneWithLoss))
  return { symbol, sold, earn: earn, loss };
  process.exit(0);
};
const runAll = async () => {
  //await watch("BTCUSDT", true);
  // await watch("ETHUSDT", true, 9);
  const result = [];
  for (const symbol in PairEnumType) {
    result.push(await watch(symbol as PairEnumType, true, 0));
  }
  //const result = await Promise.all(Object.values(PairEnumType).map(async symbol=> await watch(symbol as PairEnumType, true, 0)))
  console.log("================================");
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
};

runAll();
