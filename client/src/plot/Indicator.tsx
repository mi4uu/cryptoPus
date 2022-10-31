import { trpc } from "@client/query/trpc";
import { Grid, LoadingOverlay, Select } from "@mantine/core";
import { useEffect, useState } from "react";
import dayjs, { ManipulateType } from "dayjs";
import { Indicators, PairEnumType, PriceType } from "@server/enums";
import { useAtom } from "jotai";
import {
  hover,
  selectedDateRange,
  selectedPair,
  selectedPeriod,
} from "../query/store";
import Plot from "react-plotly.js";
import { defaultLayout } from "../helpers/helpers";
import { IndicatorsResultsValue } from "./Graph";
export interface IndicatorProps {
  setIndicatorResults: (key: string, value: IndicatorsResultsValue) => void;
  indicatorKey: string;
}
export interface IndicatorGraphProps {
  dateFrom: Date;
  dateTo: Date;
  pair: PairEnumType;
  period: string;
  indicator: Indicators;
  priceType: PriceType;
  periodUnit: ManipulateType;
  periodCount: number;
}
const layout: Partial<Plotly.Layout> = {
  ...defaultLayout,
  height: 200,
  title: "",
  xaxis: {
    showspikes: true,
    spikemode: "across",
    autorange: true,
    rangeslider: { visible: false },
  },
};
export const IndicatorGraph = ({
  indicator,
  pair,
  period,
  dateFrom,
  dateTo,
  priceType,
  periodUnit,
  periodCount,
}: IndicatorGraphProps) => {
  const { data, isLoading } = trpc.getIndicator.useQuery({
    indicator,
    pair,
    period,
    dateFrom,
    dateTo,
    priceType,
  });
  const [hoverPosition, setHover] = useAtom(hover);
  const [_, setDateRange] = useAtom(selectedDateRange);

  if (!data) return <div style={{ height: 200, width: 1240 }}>placeholder</div>;

  return (
    <Plot
      data={data}
      layout={layout}
      onRelayout={(event) => {
        if ("xaxis.range[0]" in event && "xaxis.range[1]" in event) {
          setDateRange([
            dayjs(event["xaxis.range[0]"]).toDate(),
            dayjs(event["xaxis.range[1]"]).toDate(),
          ]);
        }
      }}
      config={{
        displayModeBar: false,
      }}
      onHover={(event) => {
        if (event.xvals[0]) {
          setHover(event.xvals[0] as number);
        }
      }}
    />
  );
};
export const Indicator = (props: IndicatorProps) => {
  const [pair] = useAtom(selectedPair);
  const [parentPeriod] = useAtom(selectedPeriod);

  const [period, setPeriod] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<Indicators | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [priceType, setPriceType] = useState<PriceType | null>(null);
  const { data: periods, isLoading: isLoadingPeriods } =
    trpc.getPeriods.useQuery({});
  const [dateRange] = useAtom(selectedDateRange);
  const [dateFrom, dateTo] = dateRange;
  useEffect(() => {
    if (
      period &&
      indicator &&
      periods &&
      pair &&
      dateFrom &&
      dateTo &&
      priceType
    ) {
      props.setIndicatorResults(props.indicatorKey, {
        period,
        priceType,
        indicator,
      });
    }
  });
  // useEffect(() => {
  //   if (period && indicator && periods && pair && dateFrom && dateTo) {
  //     const periodCount = Number(period.slice(0, period.length - 1));
  //     const periodUnit = period.slice(-1);
  //     trpcClient.getMacd
  //       .query({
  //         dateFrom: dayjs(dateFrom)
  //           .subtract(periodCount * 50, periodUnit as "m" | "h" | "d")
  //           .toISOString(),
  //         dateTo: dateTo.toISOString(),
  //         pair: pair,
  //         period: period,
  //         priceType: PriceType.close,
  //       })
  //       .then((macd) => {
  //         if (macd?.indicator?.length) {
  //           props.setIndicatorResults(props.indicatorKey, {
  //             type: macd.type,
  //             results: macd.indicator,
  //           });
  //         }
  //       });
  //   }
  // });

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
        <Grid.Col span={2}>
          <Select
            label="Select price"
            placeholder="price"
            data={Object.values(PriceType).map((pricetype) => ({
              value: pricetype,
              label: pricetype,
            }))}
            onChange={(value: PriceType) => setPriceType(value)}
          />
        </Grid.Col>
      </Grid>

      {/* {period &&
        indicator &&
        periods &&
        pair &&
        dateFrom &&
        dateTo &&
        priceType ? (
          <IndicatorGraph
            periodCount={splitPeriod(period).periodCount}
            periodUnit={splitPeriod(period).periodUnit}
            priceType={priceType}
            period={period}
            indicator={indicator}
            pair={pair}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        ):<div style={{height:200, width:1240 }}>no data</div>} */}
    </>
  );
};
