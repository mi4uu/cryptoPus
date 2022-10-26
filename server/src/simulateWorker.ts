import * as dotenv from "dotenv";
import dayjs from "dayjs";
import cliProgress from 'cli-progress'
import { prisma } from "./utils/prisma";
import { PairEnumType } from "@prisma/client";
import { indicators } from "tulind";
import { Decimal } from "@prisma/client/runtime";
import fs from "fs";
import { saveChart } from "./createSimulationGraph";
import { humanizePeriod, logger, percent } from "./utils/helpers";
import { toInteger } from "lodash";
dotenv.config();

const buyForUsd = new Decimal(10);
const calculateBuyAmount = (price: Decimal, payed: Decimal) => {
  const one = new Decimal(1);
  return one.div(price).mul(payed);
};

let lastProgress = 0;

const watch = async (
 job:any, _done:(_:any,param:any)=>void
) => {
  const { symbol,
    sellOnHighBand,
    minMacd}: {
      symbol: PairEnumType,
      sellOnHighBand: boolean,
      minMacd: number
    } = job.data
  let startDate = dayjs(process.env.START_DATE).add(2, "d");

  job.log(
    `----------------------------------- start for ${symbol} -----------------------------------`
  );
  console.log(`start for ${symbol}`)

  const diff: Decimal[] = [];
  interface trade {
    price: Decimal;
    sellFor: Decimal;
    when: string;
    amount: Decimal;
    timestamp: string;
    macd?: number;
    timeToSell?: string;
    buyTime: string;
    soldTime?: string;
    soldFor?: Decimal;
  }
  let trades: trade[] = [];
  let done: trade[] = [];
  let doneWithLoss: trade[] = [];
  let wantToBuy = false;
  let sold = 0;
  let earn = new Decimal(0.0);
  let progress = 0
  let progressPercent = 0
  let lastProgressPercent =0
  let counter = 0;
  let lastHour = startDate.format("HH");

  job.log("* collecting data")
  const now = dayjs()

  // COLLECTING DATA

  const bar0 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

  // COLLECTING DATA FOR PRICE STEP

  const data1m = await prisma.kline.findMany({
    where: {
      pair: symbol,
      period_id: "1m",
    },
    orderBy: [{ timestamp: "asc" }],
    select: {
      close: true,
      timestamp: true,
    },
  });
  const dataLength = data1m.length;
  const progressTarget = dataLength*2

  const updateProgress = ()=>{
    progress+=1
    progressPercent = toInteger(percent(progressTarget,progressTarget-progress).toNumber())
    if(lastProgressPercent!==progressPercent){
      lastProgressPercent=progressPercent
      job.progress(progressPercent)
    }
  }
  const _1hDataSeriesForHourSelectorFormat = "YYYYMMDDHH";
  const _1hDataSeriesForHour: {
    [selector: string]: number[];
  } = {};



  // COLLECTING DATA 1h DATA
  for (const { close: _, timestamp } of data1m) {
    const selector = dayjs(timestamp).format(_1hDataSeriesForHourSelectorFormat)
    counter += 1;
    updateProgress()

    if(selector in _1hDataSeriesForHour) continue

    startDate = dayjs(timestamp).subtract(3, "d");
    const results = (
      await prisma.kline.findMany({
        where: {
          pair: symbol,
          period_id: "1h",
          timestamp: {
            lte: timestamp,
            gte: startDate.toDate(),
          },
        },
        orderBy: [{ timestamp: "asc" }],
        select: {
          close: true,
        },
      })
    ).map((v) => v.close.toNumber());

    _1hDataSeriesForHour[selector] = results

  }



  job.log(`finish collecting data, it took ${humanizePeriod(now, dayjs())}`);



  // TRADING SIMULATION
  counter = 0;

  for (const { close: price, timestamp } of data1m) {


    // UPDATE PROGRESS
    counter+=1
    updateProgress()


    startDate = dayjs(timestamp);
    const currentHour = startDate.format("HH");
    const close =
      _1hDataSeriesForHour[
        startDate.format(_1hDataSeriesForHourSelectorFormat)
      ];
    const bb = await indicators.bbands.indicator([close], [20, 1.1]);

    // SKIP IF NO BBANDS
    if(bb[0].length<3 ) continue
    const bands = {
      lower: new Decimal(bb[0].splice(-1)[0]),
      middle: new Decimal(bb[1].splice(-1)[0]),
      high: new Decimal(bb[2].splice(-1)[0]),
    };


    const macd_ = await indicators.macd.indicator([close], [12, 26, 9]);

    // SKIP IF NO MACD
    if(!macd_ || macd_.length<3 || macd_[2].length<3) continue

    const macd2 = macd_[2][macd_[2].length - 1];
    const macd1 = macd_[2][macd_[2].length - 2];
    const macd0 = macd_[2][macd_[2].length - 3];

    const targetBand = bands.middle;

    const when = startDate.format("YYYY-MM-DD");
    const sellDiff = percent(bands.middle, bands.lower);
    //const targetPrice = price.plus(price.mul(sellDiff.div(100)));
    const targetPrice = bands.high;
    if (
      macd0 < macd1 &&
      macd1 < macd2 &&
      macd2 > minMacd &&
      (macd1 < 0 || macd0 < 0) &&
      trades.filter((t) => t.when === when).length === 0 &&
      // targetPrice.lessThan(bands.middle) &&
      percent(bands.high, price).greaterThan(2)
    ) {
      wantToBuy = true;
    }



    if (wantToBuy) {
      if (sellDiff.lessThan(0.3)) {
        //    job.log(`[${symbol}][${startDate.format("YYYY-MM-DD HH:mm")}]`,'not buying - diff is ', sellDiff)
        wantToBuy = false;
        continue;
      }
      job.log(JSON.stringify({
        action:"BUY",
        time: startDate.format("YYYY-MM-DD HH:mm"),
        symbol,
        target:sellDiff.toFixed(1),
        "to sell":trades.length,
        sold: sold,
        "current price": price.toNumber(),
        "trades from today":trades.filter((t) => t.when === when).length,
        macd: [macd0, macd1, macd2]

      },null,4))


      trades.push({
        price,
        sellFor: targetPrice,
        when,
        amount: calculateBuyAmount(price, buyForUsd),
        timestamp: startDate.toISOString(),
        macd: macd2 ? macd2 : undefined,
        buyTime: startDate.toISOString(),
      });
      wantToBuy = false;
    }
    // trade
    for (const trade of trades) {
      if (trade.sellFor < price || (trade.price > price && macd2 < 0)) {

        const percDiff = percent(price, trade.price);
        diff.push(percDiff);

        sold += 1;
        earn = earn.plus(price.minus(trade.price).mul(trade.amount));
        const _trade = trades.filter((t) => t === trade)[0];
        const timeToSell = humanizePeriod(_trade.timestamp, startDate)

        if (percDiff.lessThanOrEqualTo(0))
          doneWithLoss.push({
            ..._trade,
            timeToSell,
            soldTime: startDate.toISOString(),
            soldFor: price,
          });
        else
          done.push({
            ..._trade,
            timeToSell,
            soldTime: startDate.toISOString(),
            soldFor: price,
          });
        trades = trades.filter((t) => t !== trade);

        job.log(JSON.stringify({
          action:"SELL",
          time: startDate.format("YYYY-MM-DD HH:mm"),
          symbol,
          earned:earn.toNumber(),
          "trade diff":percDiff.toFixed(1),
          target:sellDiff.toFixed(1),
          timeToSell,
          "to sell":trades.length,
          sold: sold,
          "current price": price.toNumber(),
          "trades from today":trades.filter((t) => t.when === when).length,
          macd: [macd0, macd1, macd2]

        },null,4))
      }
    }
  } // TRADING FINISHED

  if (sold === 0) {
    job.log("no trades was made ;(");
    _done(null,{ symbol, err: "no trades was made ;(" })
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
  job.log(
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
      doneWithLoss,
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
  const mapToTrades = (deals: trade[]) =>
    deals
      .filter((d) => !!d.buyTime && !!d.soldTime && !!d.sellFor)
      .map((d) => ({
        dateBuy: d.buyTime!,
        dateSell: d.soldTime!,
        buyFor: d.price.toNumber(),
        target: d.sellFor.toNumber(),
        soldFor: d.soldFor!.toNumber(),
        macd: d.macd,
      }));
  await saveChart(symbol, "1h", mapToTrades(done), mapToTrades(doneWithLoss));
  _done(null,{ symbol, sold, earn: earn, loss })
  return { symbol, sold, earn: earn, loss };
};
export default watch