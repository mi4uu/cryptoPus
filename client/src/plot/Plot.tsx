import { trpc } from "@client/query/trpc";
import { Grid, LoadingOverlay, Select, Button } from "@mantine/core";
import { useState } from "react";
import { DateRangePicker } from "@mantine/dates";
import { Indicators, PriceType } from "shared/enums";

import { KlinesPlot } from "./KlinesPlot";
import { Indicator, IndicatorGraph } from "./Indicator";
import _ from "lodash";
import {
  selectedDateRange,
  selectedPair,
  selectedPeriod,
} from "../query/store";
import { useAtom } from "jotai";
import { splitPeriod } from "../helpers/helpers";
import { PairEnumType } from "@server/utils/prisma";
export interface IndicatorsResultsValue {
  period: string;
  priceType: PriceType;
  indicator: Indicators;
}
export const Plot = () => {
  const { data: periods, isLoading: isLoadingPeriods } =
    trpc.getPeriods.useQuery({});

  const [period, setPeriod] = useAtom(selectedPeriod);
  const [pair, setPair] = useAtom(selectedPair);
  const [value, setValue] = useAtom(selectedDateRange);
  const [indicators, setIndicators] = useState<
    { key: string; indicator: JSX.Element }[]
  >([]);
  const [indicatorsResults, setIndicatorsResults] = useState<{
    [key: string]: IndicatorsResultsValue;
  }>({});
  const [dateFrom, dateTo] = value;
  const setIndicatorResult = (key: string, value: IndicatorsResultsValue) => {
    setIndicatorsResults({ ...indicatorsResults, ...{ [key]: value } });
  };

  const isLoading = isLoadingPeriods;
  return (
    <>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />

      <Grid>
        <Grid.Col span={2}>
          <Select
            label="Select pair"
            placeholder="pair"
            data={Object.values(PairEnumType).map((pair) => ({
              value: pair,
              label: pair,
            }))}
            value={pair}
            onChange={(value) => setPair(value as PairEnumType)}
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
            value={period}
            onChange={(value) => setPeriod(value)}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          {" "}
          <DateRangePicker
            label="Date range"
            placeholder="Pick dates range"
            value={value}
            onChange={setValue}
          />
        </Grid.Col>
      </Grid>
      {indicators.map((indicator) => (
        <Grid key={indicator.key}>
          <Grid.Col span={10}>{indicator.indicator}</Grid.Col>
          <Grid.Col span={1} style={{ alignSelf: "flex-end" }}>
            <Button
              onClick={() =>
                setIndicators(indicators.filter((i) => i.key !== indicator.key))
              }
            >
              -
            </Button>
          </Grid.Col>
        </Grid>
      ))}
      <Button
        style={{ marginTop: 15, marginBottom: 15 }}
        onClick={() => {
          const key = _.uniqueId();
          return setIndicators([
            ...indicators,
            {
              key,
              indicator: (
                <Indicator
                  setIndicatorResults={setIndicatorResult}
                  indicatorKey={key}
                />
              ),
            },
          ]);
        }}
      >
        Add indicator
      </Button>
      <KlinesPlot />
      {Object.entries(indicatorsResults).map(([key, indicatorsResults]) => {
        if (
          !dateFrom ||
          !dateTo ||
          !pair ||
          !indicatorsResults.indicator ||
          !indicatorsResults.period ||
          !indicatorsResults.priceType
        )
          return (
            <div key={key} className="indicatorWrap">
              placeholder
            </div>
          );
        const { periodCount, periodUnit } = splitPeriod(
          indicatorsResults.period
        );
        return (
          <div className="indicatorWrap" key={key}>
            <IndicatorGraph
              dateFrom={dateFrom}
              dateTo={dateTo}
              pair={pair}
              indicator={indicatorsResults.indicator}
              period={indicatorsResults.period}
              priceType={indicatorsResults.priceType}
              periodCount={periodCount}
              periodUnit={periodUnit}
            />
          </div>
        );
      })}
    </>
  );
};
