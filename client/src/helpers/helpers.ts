import { Period } from "@server/enums";
import { ManipulateType } from "dayjs";

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
export const defaultLayout = {
  width: 1240,
  margin: {
    l: 30,
    r: 0,
    b: 30,
    t: 0,
    pad: 0,
  },
  autosize: true,
  hovermode: "x" as "x",
  dragmode: "pan" as "pan",
  //@ts-ignore
  spikedistance: -1,
  scrollZoom: false,
};
