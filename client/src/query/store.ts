import { DateRangePickerValue } from "@mantine/dates";
import { PairEnumType } from "@server/enums";
import dayjs from "dayjs";
import { atom, useAtom } from "jotai";
export const selectedPair = atom<PairEnumType | null>(null);
export const selectedPeriod = atom<string | null>(null);
export const selectedDateRange = atom<DateRangePickerValue>([
  dayjs().subtract(10, "d").toDate(),
  dayjs().toDate(),
]);
