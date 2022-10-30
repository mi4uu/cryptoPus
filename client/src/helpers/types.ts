import {
  BoxPlotData,
  CandlestickData,
  OhclData,
  PlotData,
  PlotType,
  ViolinData,
} from "plotly.js";

type PlotlyData =
  | Partial<PlotData>
  | Partial<BoxPlotData>
  | Partial<ViolinData>
  | Partial<OhclData>
  | Partial<CandlestickData>;
export type { PlotType, PlotlyData };
