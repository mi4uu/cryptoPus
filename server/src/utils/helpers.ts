import { Decimal } from "@prisma/client/runtime";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import pino from 'pino'
dayjs.extend(duration);
dayjs.extend(relativeTime);

export const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    })

export const percent = (a: Decimal|string|number, b: Decimal|string|number) =>( new Decimal(a)).minus(b).div(a).mul(100);

export const humanizePeriod = (date0:Date|string|dayjs.Dayjs,date1:Date|string|dayjs.Dayjs)=>dayjs.duration(dayjs(date0).diff(date1)).humanize();

