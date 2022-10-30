import { trpc } from "@client/query/trpc";
import { LoadingOverlay } from "@mantine/core";
import { DateRangePickerValue } from "@mantine/dates";
import { PairEnumType, PriceType } from "@server/enums";
import dayjs from "dayjs";
import Plot from "react-plotly.js";

interface KlinesPlotProps {
  dateFrom: Date;
  dateTo: Date;
  pair: PairEnumType;
  period: string;
  setDateRange: React.Dispatch<React.SetStateAction<DateRangePickerValue>>;
  indicatorsResults: any;
}
export const KlinesPlot = (props: KlinesPlotProps) => {
  const { data, isLoading } = trpc.getKlines.useQuery({
    dateFrom: props.dateFrom.toISOString(),
    dateTo: props.dateTo.toISOString(),
    pair: props.pair,
    period: props.period,
  });
  const periodCount = Number(props.period.slice(0, props.period.length - 1));
  const periodUnit = props.period.slice(-1);

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
  let yaxies = 2;
  for (const indicator of Object.values(props.indicatorsResults)) {
    yaxies += 1;
    const indicatorPlot: Plotly.Data = {
      x,
      y: (indicator as any).results.splice(x.length * -1),
      type: (indicator as any).type,
      xaxis: "x",
      yaxis: `y${yaxies}`,
      name: "MACD",
    };
    plotData.push(indicatorPlot);
  }
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
