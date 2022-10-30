import {
  selectedPeriod,
  selectedPair,
  selectedDateRange,
} from "@client/query/store";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import Plotly from "plotly.js-dist-min";
import { useEffect, useRef, useState } from "react";
if (typeof (window as any).global === "undefined") {
  (window as any).global = window;
}
export interface PlotProps {
  data: any;
}
let ypos = 0;
const WrapPlot = ({ children }) => {
  return (
    <div style={{ position: "relative", width: 800, height: 1240 }}>
      {" "}
      {children}
    </div>
  );
};
export const Plot = (props: PlotProps) => {
  const targetDiv = useRef<any>(null);
  const [period] = useAtom(selectedPeriod);
  const [pair] = useAtom(selectedPair);
  const [dateRange, setDateRange] = useAtom(selectedDateRange);
  const data = {
    ...props.data,
    config: {
      displayModeBar: false,
    },
  };
  const [dateFrom, dateTo] = dateRange;
  useEffect(() => {
    if (targetDiv.current && !targetDiv.current.data) {
      Plotly.newPlot(targetDiv.current, data);
      targetDiv.current.on("plotly_relayout", (event) => {
        if ("xaxis.range[0]" in event && "xaxis.range[1]" in event) {
          ypos = window.scrollY;
          setDateRange([
            dayjs(event["xaxis.range[0]"]).toDate(),
            dayjs(event["xaxis.range[1]"]).toDate(),
          ]);
        }

        setTimeout(() => window.scrollTo(0, ypos), 10);
        setTimeout(() => window.scrollTo(0, ypos), 50);
        setTimeout(() => window.scrollTo(0, ypos), 100);
        setTimeout(() => window.scrollTo(0, ypos), 300);
      });
    }
  });

  return (
    <div
      style={{ position: "absolute", top: 0, left: 0 }}
      ref={targetDiv}
    ></div>
  );
};
