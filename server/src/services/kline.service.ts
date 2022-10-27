import { PairEnumType} from "@prisma/client";
import dayjs, { Dayjs } from "dayjs";
import customConfig from "../config/default";
import { prisma } from "../utils/prisma";
import {match,P} from 'ts-pattern'
type DateType = string | Date | Dayjs;
export interface GetKlinesBaseParams {
  pair: PairEnumType;
  period: string;
  dateFrom: DateType;
  dateTo?: DateType;
  limit?: number;
}
export interface GetKlinesDateToParams extends Omit<GetKlinesBaseParams, 'dateTo'> {
  dateTo: DateType;
}
export interface GetKlinesLimitParams extends Omit<GetKlinesBaseParams, 'limit'> {
  limit: number;
}
export type GetKlinesParams = GetKlinesDateToParams | GetKlinesLimitParams;

export const getKlines = async ({
  pair,
  period,
  dateFrom,
  dateTo,
  limit,
}: GetKlinesBaseParams) => {
  if (!dateTo && !limit) throw new Error("dateTo or limit must be provided");
  if (dateTo && limit) throw new Error("dateTo or limit must be provided, not both");

  const gte = dayjs(dateFrom).toISOString();
  let lte =""
  if(dateTo)
      lte=dayjs(dateTo).toISOString()
  if(limit) {
      const unit = period.slice(-1) as "m" | "h" | "d";
      const interval = Number(period.slice(0, -1));
      lte=dayjs(dateFrom).add(limit*interval, unit).toISOString()
  }
  const results = await prisma.kline.findMany({
    where: {
      pair,
      period_id: period,
      timestamp: {
        gte,
        lte,
      },
    },
  });

//   let ltez = match([dateTo, limit] as const)
//   .with([P.union(P.instanceOf(Dayjs), P.instanceOf(Date), P.string ), undefined], ()=>dayjs(dateTo).toISOString())
//   .with([undefined, P.number], ()=>{
//           const unit = period.slice(-1) as "m" | "h" | "d";
//           const interval = Number(period.slice(0, -1));
//           return dayjs(dateFrom).add(limit*interval, unit).toISOString()
//       })
//       .with([P._,P.number],()=>limit*1)
//       .exhaustive()
  return results
};

