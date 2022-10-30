import {
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
import Plot from "react-plotly.js";

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
    width: 1240,
    height: 600,
    title: "",
    autosize: true,
    hovermode: "x",
    dragmode: "pan",
    //@ts-ignore
    spikedistance: -1,
    yaxis: { domain: [0, 0.8] },
    yaxis2: { domain: [0.81, 1] },
    scrollZoom: false,
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
      />
    </>
  );
};
