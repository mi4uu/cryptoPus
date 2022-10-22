import * as dotenv from "dotenv";
import day from "dayjs";
import { KlineInterval, MainClient } from "binance";
import { prisma } from "./utils/prisma";
import { PairEnumType } from "@prisma/client";

dotenv.config();
const now = day();
console.log(process.env.START_DATE);
const startDate = day(process.env.START_DATE);
const binance = new MainClient({});
const results = 500;
const dateFormat = "YYYY-MM-DD HH:mm";
const run = async () => {
  const periods = await prisma.period.findMany({});
  console.log('removing klines')
  await prisma.kline.deleteMany({ where: {} });
  console.log('done')
  for (const pair in PairEnumType) {
    for (const period of periods) {
      const unit = period.value.slice(-1) as "m" | "d";
      const interval = Number(period.value.slice(0, -1));
      let startDate = day(process.env.START_DATE);
      let endDate = startDate.add(interval * results, unit);
      while (startDate < now) {
        console.log(
          `get for ${pair} [${period.value}] from ${startDate.format(
            dateFormat
          )} to ${endDate.format(dateFormat)}`
        );
        const klines = await binance.getKlines({
          symbol: pair,
          interval: period.value as KlineInterval,
        });
        console.log(klines.length);
        await Promise.all(
          klines.map((k: any) =>
            prisma.kline.create({
              data: {
                timestamp: day.unix(k[0]/1000).toISOString(),
                period_id: period.value,
                pair: pair as PairEnumType,
                open: k[1],
                high:k[2],
                low:k[3],
                close:k[4],
                volume:k[5]
              },
            })
          )
        );
        console.log('inserted');
        startDate = endDate;
        endDate = startDate.add(interval * results, unit);
      }
    }
  }
  process.exit(0)
  //xsconsole.log(klines)
};
run();
