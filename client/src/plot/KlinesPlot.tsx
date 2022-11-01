import { defaultLayout } from "@client/helpers/helpers";
import {
  hover,
  selectedDateRange,
  selectedPair,
  selectedPeriod,
} from "@client/query/store";
import { trpc } from "@client/query/trpc";
import { Button, LoadingOverlay } from "@mantine/core";
import { DateRangePickerValue } from "@mantine/dates";
import { IconArrowsMove, IconRulerMeasure, IconX } from "@tabler/icons";
import dayjs from "dayjs";
import { SetStateAction, useAtom } from "jotai";
import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
//@ts-ignore
import Plotly from "plotly.js/dist/plotly";

import * as myPlotly from "plotly.js-dist-min";
import { PairEnumType } from "@server/utils/prisma";

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
  const [dragmode, setDragmode] = useState<"pan" | "select">("pan");
  const [percentDiff, setPercentDiff] = useState<number | null>(null);

  useEffect(() => {
    const containers = document.getElementsByClassName("js-plotly-plot");

    for (const container of containers) {
      if (hoverPosition) {
        //@ts-ignore
        Plotly.Fx.hover(container, { xval: hoverPosition }, ["xy"]);
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
  ];
  const volumePlotData: Plotly.Data[] = [
    {
      x,
      y: volume,
      type: "bar",
      name: "VOLUME",
    },
  ];
  const layout: Partial<Plotly.Layout> = {
    ...defaultLayout,
    height: 400,
    title: "",

    xaxis: {
      showspikes: true,
      spikemode: "across",
      autorange: true,
      rangeslider: { visible: false },
    },
    dragmode,
  };

  return (
    <>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      {/* <Plot
        data={{data:plotData, layout}}
      /> */}
      <Button
        onClick={() => {
          setDragmode("pan");
        }}
      >
        {" "}
        <IconArrowsMove size={18} />{" "}
      </Button>
      <Button
        onClick={() => {
          setDragmode("select");
        }}
      >
        <IconRulerMeasure size={18} />
        &nbsp;&nbsp;{percentDiff ? `${percentDiff.toFixed(2)} %` : null}
      </Button>
      <Plot
        data={volumePlotData}
        layout={{ ...layout, height: 100, dragmode: "pan" as "pan" }}
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
      <Plot
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
        onSelecting={(event) => {
          const range = event.range?.y;
          if (!range) return false;
          const start = range[0] > range[1] ? range[1] : range[0];
          const end = range[0] > range[1] ? range[0] : range[1];
          const diff = end - start;
          const percentage = (diff / end) * 100;
          setPercentDiff(percentage);
          console.log(percentage.toFixed(2));
        }}
      />
    </>
  );
};
