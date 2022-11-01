import * as dotenv from "dotenv";
import dayjs from "dayjs";
import cliProgress from "cli-progress";
import { getPrismaClient } from "../utils/prisma";
import { PairEnumType } from "@prisma/client";
import { indicators } from "tulind";
import { Decimal } from "@prisma/client/runtime";
import fs from "fs";
import { saveChart } from "./createSimulationGraph";
import { humanizePeriod, logger, percent } from "../utils/helpers";
import Queue from "bull";
import path from "path";
const prisma = getPrismaClient();
dotenv.config();
const queue = new Queue("trading");

const runAll = async () => {
  const worker = queue.process(9, path.join(__dirname, "./simulateWorker.ts"));
  queue.on("completed", function (job, result) {
    logger.info(result);
  });

  const result = [];
  for (const symbol in PairEnumType) {
    // await queue.add({symbol, sellOnHighBand:false, minMacd: 0})
  }
  //const result = await Promise.all(Object.values(PairEnumType).map(async symbol=> await watch(symbol as PairEnumType, true, 0)))
  logger.info("================================");
  //logger.info(JSON.stringify(result, null, 2));
  // process.exit(0);
};

runAll();
