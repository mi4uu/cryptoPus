import { defaultLayout } from "@client/helpers/helpers";
import {
  hover,
  selectedDateRange,
  selectedPair,
  selectedPeriod,
} from "@client/query/store";
import { trpc } from "@client/query/trpc";
import { LoadingOverlay } from "@mantine/core";
import { DateRangePickerValue } from "@mantine/dates";
import { PairEnumType, PriceType } from "@server/enums";
import { IconX } from "@tabler/icons";
import dayjs from "dayjs";
import { SetStateAction, useAtom } from "jotai";
import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import * as myPlotly from "plotly.js-dist-min";

export const KlinesPlot = () => {
  const [period] = useAtom(selectedPeriod);
  const [pair] = useAtom(selectedPair);
  const [dateRange, setDateRange] = useAtom(selectedDateRange);
  const [dateFrom, dateTo] = dateRange;
  if (!dateFrom || !dateTo || !pair || !period)
    return (
      <div
        style={{
          width: 1240,
          height: 600,
        }}
      >
        <IconX />
      </div>
    );
  return (
    <div
      style={{
        width: 1240,
        height: 600,
      }}
    >
      <KlinesPlotInternal
        dateFrom={dateFrom}
        dateTo={dateTo}
        pair={pair}
        period={period}
        setDateRange={setDateRange}
      />
    </div>
  );
};
interface KlinesPlotInternalProps {
  dateFrom: Date;
  dateTo: Date;
  pair: PairEnumType;
  period: string;
  setDateRange: (update: SetStateAction<DateRangePickerValue>) => void;
}
const KlinesPlotInternal = ({
  dateFrom,
  dateTo,
  pair,
  period,
  setDateRange,
}: KlinesPlotInternalProps) => {
  const [hoverPosition, setHover] = useAtom(hover);

  useEffect(() => {
    const containers = document.getElementsByClassName("js-plotly-plot");

    for (const container of containers) {
      if (hoverPosition) {
        //@ts-ignore
        myPlotly.Fx.hover(container, { xval: hoverPosition }, ["xy"]);
      }
    }
  }, [hoverPosition]);
  const { data, isLoading } = trpc.getKlines.useQuery({
    dateFrom,
    dateTo,
    pair,
    period,
  });

  if (!data) return null;
  const x = data.map((k) => k.timestamp);
  const close = data.map((k) => Number(k.close));
  const open = data.map((k) => Number(k.open));
  const low = data.map((k) => Number(k.low));
  const high = data.map((k) => Number(k.high));
  const volume = data.map((k) => Number(k.volume));

  const plotData: Plotly.Data[] = [
    {
      x,
      close,
      high,
      low,
      open,
      // cutomise colors
      increasing: { line: { color: "blue" } },
      decreasing: { line: { color: "black" } },
      type: "candlestick",
      xaxis: "x",
      yaxis: "y",
      name: "CANDLES",
    },
    {
      x,
      y: volume,
      type: "bar",
      xaxis: "x",
      yaxis: "y2",
      name: "VOLUME",
    },
  ];

  const layout: Partial<Plotly.Layout> = {
    ...defaultLayout,
    height: 600,
    title: "",

    yaxis: { domain: [0, 0.8] },
    yaxis2: { domain: [0.81, 1] },
    xaxis: {
      showspikes: true,
      spikemode: "across",
      autorange: true,
      rangeslider: { visible: false },
    },
  };

  return (
    <>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      {/* <Plot
        data={{data:plotData, layout}}
      /> */}

      <Plot
        debug={true}
        data={plotData}
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
    </>
  );
};
