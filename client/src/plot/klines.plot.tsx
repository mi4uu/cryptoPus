import { trpc } from "@client/query/trpc";
import { LoadingOverlay } from "@mantine/core";
import { DateRangePickerValue } from "@mantine/dates";
import { PairEnumType, PriceType } from "@server/enums";
import dayjs from "dayjs";
import Plot from "react-plotly.js";

const getBases = (macd: number[], open: number[], close: number[]) => {
  const firstBase = Math.min(
    ...[...[...open].splice(0, 5), ...[...close].splice(0, 5)]
  );
  const baseLine: number[] = Array(5).fill(firstBase);
  let baseLineValue = firstBase;
  for (let i = 5; i < open.length; i++) {
    if ((macd[i] > 0 && macd[i - 1] < 0) || (macd[i] < 0 && macd[i - 1] > 0))
      baseLineValue = Math.min(
        ...[...[...open].splice(i - 5, 5), ...[...close].splice(i - 5, 5)]
      );
    baseLine.push(baseLineValue);
  }
  return baseLine;
};

interface KlinesPlotProps {
  dateFrom: Date;
  dateTo: Date;
  pair: PairEnumType;
  period: string;
  setDateRange: React.Dispatch<React.SetStateAction<DateRangePickerValue>>;
}
export const KlinesPlot = (props: KlinesPlotProps) => {
  const { data, isLoading } = trpc.getKlines.useQuery({
    dateFrom: props.dateFrom.toISOString(),
    dateTo: props.dateTo.toISOString(),
    pair: props.pair,
    period: props.period,
  });
  const macd = trpc.getMacd.useQuery({
    dateFrom: props.dateFrom.toISOString(),
    dateTo: props.dateTo.toISOString(),
    pair: props.pair,
    period: props.period,
    priceType: PriceType.close,
  });
  console.log(macd?.data);

  if (!data) return null;
  const x = data.map((k) => k.timestamp);
  const close = data.map((k) => Number(k.close));
  const open = data.map((k) => Number(k.open));
  const low = data.map((k) => Number(k.low));
  const high = data.map((k) => Number(k.high));
  const volume = data.map((k) => Number(k.volume));
  const macdData = [
    ...Array(x.length - (macd.data?.length ?? 0)).fill(0),
    ...(macd.data ?? []),
  ];
  console.log({ macdData, x });

  const bases: Plotly.Data = {
    x,
    y: getBases([...macdData], open, close),
    type: "scatter",
    xaxis: "x",
    yaxis: "y",
    name: "base",
  };
  const macdPlot: Plotly.Data = {
    x,
    y: macdData,
    type: "bar",
    xaxis: "x",
    yaxis: "y3",
    name: "MACD",
  };

  console.log({
    macdLen: macdData.length,
    x: x.length,
  });

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
  if (macd.data) plotData.push(macdPlot);

  const layout: Partial<Plotly.Layout> = {
    width: 1240,
    height: 800,
    title: "",
    autosize: true,
    hovermode: "x",
    dragmode: "pan",
    //@ts-ignore
    spikedistance: -1,
    yaxis: { domain: [0, 0.8] },
    yaxis2: { domain: [0.81, 0.89] },
    yaxis3: { domain: [0.9, 1], autorange: true },
    xaxis: {
      showspikes: true,
      spikemode: "across",
      autorange: true,
      rangeslider: { visible: false },
    },
  };
  return (
    <div>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />

      <Plot
        data={plotData}
        layout={layout}
        onRelayout={(event) => {
          if ("xaxis.range[0]" in event && "xaxis.range[1]" in event) {
            props.setDateRange([
              dayjs(event["xaxis.range[0]"]).toDate(),
              dayjs(event["xaxis.range[1]"]).toDate(),
            ]);
          }
          //  console.log(event)
        }}
      />
    </div>
  );
};
