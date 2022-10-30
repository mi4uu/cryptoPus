import "./App.css";
import { trpc, trpcClient } from "@client/query/trpc";
import { Grid, LoadingOverlay, Select, Button } from "@mantine/core";
import { useEffect, useState } from "react";
import { DateRangePicker, DateRangePickerValue } from "@mantine/dates";
import dayjs from "dayjs";
import {
  Indicators,
  IndicatorType,
  PairEnumType,
  Period,
  PriceType,
} from "@server/enums";
import { KlinesPlot } from "./plot/klines.plot";
import { useAtom } from "jotai";
import { selectedDateRange, selectedPair, selectedPeriod } from "./query/store";
export interface IndicatorProps {
  setIndicatorResults: (
    key: string,
    value: {
      type: IndicatorType;
      results: any;
    }
  ) => void;
  indicatorKey: string;
}
export const Indicator = (props: IndicatorProps) => {
  const [pair] = useAtom(selectedPair);
  const [parentPeriod] = useAtom(selectedPeriod);

  const [period, setPeriod] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<Indicators | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: periods, isLoading: isLoadingPeriods } =
    trpc.getPeriods.useQuery({});
  const [dateRange] = useAtom(selectedDateRange);
  const [dateFrom, dateTo] = dateRange;

  useEffect(() => {
    console.log({ parentPeriod, indicator, periods, pair });
    if (period && indicator && periods && pair && dateFrom && dateTo) {
      const periodCount = Number(period.slice(0, period.length - 1));
      const periodUnit = period.slice(-1);
      trpcClient.getMacd
        .query({
          dateFrom: dayjs(dateFrom)
            .subtract(periodCount * 50, periodUnit as "m" | "h" | "d")
            .toISOString(),
          dateTo: dateTo.toISOString(),
          pair: pair,
          period: period,
          priceType: PriceType.close,
        })
        .then((macd) => {
          if (macd?.indicator?.length) {
            props.setIndicatorResults(props.indicatorKey, {
              type: macd.type,
              results: macd.indicator,
            });
          }
        });
    }
  });

  return (
    <>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />

      <Grid>
        <Grid.Col span={2}>
          <Select
            label="Select indicator"
            placeholder="indicator"
            data={Object.values(Indicators).map((pair) => ({
              value: pair,
              label: pair,
            }))}
            onChange={(value: Indicators) => setIndicator(value)}
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <Select
            label="Select period"
            placeholder="period"
            data={Object.values(periods ? periods : {}).map((period) => ({
              value: period.value,
              label: period.value,
            }))}
            onChange={(value) => setPeriod(value)}
          />
        </Grid.Col>
      </Grid>
    </>
  );
};
