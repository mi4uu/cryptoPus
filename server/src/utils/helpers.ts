import { Period } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";
import dayjs, { ManipulateType } from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import pino from "pino";
dayjs.extend(duration);
dayjs.extend(relativeTime);

export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

export const percent = (
  a: Decimal | string | number,
  b: Decimal | string | number
) => new Decimal(a).minus(b).div(a).mul(100);

export const humanizePeriod = (
  date0: Date | string | dayjs.Dayjs,
  date1: Date | string | dayjs.Dayjs
) => dayjs.duration(dayjs(date0).diff(date1)).humanize();

export const splitPeriod = (period: Period | string) => {
  let _period: string;
  if (typeof period === "string") _period = period;
  else _period = period.value;
  const periodCount = Number(_period.slice(0, _period.length - 1));
  const periodUnit = _period.slice(-1) as ManipulateType;
  return {
    periodCount,
    periodUnit,
  };
};
