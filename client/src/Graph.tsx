import "./App.css";
import { trpc } from "@client/query/trpc";
import { Grid, LoadingOverlay, Select, Button } from "@mantine/core";
import { useState } from "react";
import { DateRangePicker, DateRangePickerValue } from "@mantine/dates";
import Plot from "react-plotly.js";
import dayjs from "dayjs";
import { PairEnumType } from "@server/enums";
import { KlinesPlot } from "./plot/klines.plot";
import { Menu } from "./Menu";
export const Graph = () => {
  const { data, isLoading } = trpc.getPairs.useQuery({});
  const [pair, setPair] = useState<PairEnumType | null>(null);
  const [value, setValue] = useState<DateRangePickerValue>([
    dayjs().subtract(10, "d").toDate(),
    dayjs().toDate(),
  ]);
  return (
    <>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />

      <Grid>
        <Grid.Col span={2}>
          <Select
            label="Select pair"
            placeholder="pair"
            data={Object.values(data ? data : {}).map((pair) => ({
              value: pair,
              label: pair,
            }))}
            onChange={(value) => setPair(value as PairEnumType)}
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
        <Grid.Col span={4}></Grid.Col>
      </Grid>
      {pair && value[0] && value[1] && (
        <KlinesPlot
          pair={pair}
          dateFrom={value[0]}
          dateTo={value[1]}
          period={"1h"}
          setDateRange={setValue}
        />
      )}
    </>
  );
};
