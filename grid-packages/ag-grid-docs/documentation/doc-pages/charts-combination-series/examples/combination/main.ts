import { getData } from "./data";

import { AgCartesianChartOptions, AgCartesianAxisOptions, AgCartesianSeriesOptions, AgBarSeriesOptions, AgLineSeriesOptions, AgCartesianSeriesTooltipRendererParams, AgChart } from "ag-charts-community"

function tooltipRenderer(params: AgCartesianSeriesTooltipRendererParams) {
  const { yValue, xValue } = params;
  return {
    content: `${xValue}: ${yValue}%`
  };
};

const WOMEN: AgBarSeriesOptions = {
  type: "column",
  xKey: "year",
  yKey: "women",
  yName: "Women",
  grouped: true,
  strokeWidth: 0,
  tooltip: {
    renderer: tooltipRenderer
  },
};

const MEN: AgBarSeriesOptions = {
  type: "column",
  xKey: "year",
  yKey: "men",
  yName: "Men",
  grouped: true,
  strokeWidth: 0,
  tooltip: {
    renderer: tooltipRenderer
  },
};

const PORTIONS: AgLineSeriesOptions = {
  type: "line",
  xKey: "year",
  yKey: "portions",
  yName: "Portions",
  strokeWidth: 3,
  marker: {
      enabled: false,
  },
  tooltip: {
    renderer: tooltipRenderer
  },
};

const COLUMN_AND_LINE: AgCartesianSeriesOptions[] = [
  { ...WOMEN, type: 'column' },
  { ...MEN, type: 'column' },
  { ...PORTIONS, type: 'line' },
];

const AREA_AND_COLUMN: AgCartesianSeriesOptions[] = [
  { ...PORTIONS, type: 'area' },
  { ...WOMEN, type: 'column' },
  { ...MEN, type: 'column' },
];

const options: AgCartesianChartOptions = {
  container: document.querySelector("#myChart") as HTMLElement,
  autoSize: true,
  data: getData(),
  theme: {
    palette: {
      fills: ["#7cecb3", "#7cb5ec", "#ecb37c", "#ec7cb5", "#7c7dec"],
      strokes: ["#7cecb3", "#7cb5ec", "#ecb37c", "#ec7cb5", "#7c7dec"]
    },
  },
  title: {
    text: "Fruit & Vegetable Consumption",
    fontSize: 15,
  },
  series: COLUMN_AND_LINE,
  axes: [
    {
      type: "category",
      position: "bottom",
      gridStyle: [{
        stroke: undefined
      }],
    },
    {
      // primary y axis
      type: "number",
      position: "left",
      keys: ["women", "men", "children", "adults"],
      title: {
          text: "Adults Who Eat 5 A Day (%)",
      },
    },
    {
      // secondary y axis
      type: "number",
      position: "right",
      keys: ["portions"],
      title: {
          text: "Portions Consumed (Per Day)",
      },
    }
  ] as AgCartesianAxisOptions[],
  legend: {
    position: "bottom",
    item: {
      marker: {
        strokeWidth: 0,
      },
    },
  },
};

var chart = AgChart.create(options);

function columnLine() {
  console.log("Column & Line", COLUMN_AND_LINE);
  options.series = COLUMN_AND_LINE;
  AgChart.update(chart, options);
}

function areaColumn() {
  console.log("Column & Area", AREA_AND_COLUMN);
  options.series = AREA_AND_COLUMN;
  AgChart.update(chart, options);
}