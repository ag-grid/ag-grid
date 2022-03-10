import { AgCartesianChartOptions, AgCartesianAxisOptions, AgCartesianSeriesOptions, AgBarSeriesOptions, AgLineSeriesOptions, AgCartesianSeriesTooltipRendererParams } from "ag-charts-community"
import * as agCharts from "ag-charts-community"

const tooltipRenderer = (params: AgCartesianSeriesTooltipRendererParams) => {
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

const ADULTS: AgLineSeriesOptions = {
  type: "line",
  xKey: "year",
  yKey: "adults",
  yName: "All Adults",
  strokeWidth: 3,
  marker: {
      enabled: false,
  },
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
  { ...MEN, type: 'column' },
  { ...WOMEN, type: 'column' },
  { ...ADULTS, type: 'line' },
  { ...PORTIONS, type: 'line' },
];

const COLUMN_AND_AREA: AgCartesianSeriesOptions[] = [
  { ...ADULTS, type: 'area' },
  { ...PORTIONS, type: 'area' },
  { ...MEN, type: 'column' },
  { ...WOMEN, type: 'column' },
];

const LINE_AND_AREA: AgCartesianSeriesOptions[] = [
  { ...ADULTS, type: 'area' },
  { ...PORTIONS, type: 'area' },
  {
      type: "line", // change type to line
      xKey: "year",
      yKey: "men",
      yName: "Men",
      strokeWidth: 3,
      marker: {
          enabled: false,
      },
  },
  {
      type: 'line', // change type to line
      xKey: "year",
      yKey: "women",
      yName: "Women",
      strokeWidth: 3,
      marker: {
          enabled: false,
      },
  },
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
    text: "Fruit & Vegetables",
    fontSize: 18,
  },
  subtitle: {
    text: `Adults who eat five or more portions of fruit and vegetables per day (UK)`,
  },
  series: COLUMN_AND_LINE,
  axes: [
    {
      type: "category",
      position: "bottom",
    },
    {
      // primary y axis
      type: "number",
      position: "left",
      keys: ["women", "men", "children", "adults"],
      title: {
          enabled: true,
          text: "% Adults Who Eat 5 or more Fruit & Veg",
      }
    },
    {
      // secondary y axis
      type: "number",
      position: "right",
      keys: ["portions"],
      title: {
          enabled: true,
          text: "% Portion of 5 A Day",
      }
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

var chart = agCharts.AgChart.create(options);

function columnLine() {
  console.log("Column & Line", COLUMN_AND_LINE);
  options.series = COLUMN_AND_LINE;
  agCharts.AgChart.update(chart, options);
}

function columnArea() {
  console.log("Column & Area", COLUMN_AND_AREA);
  options.series = COLUMN_AND_AREA;
  agCharts.AgChart.update(chart, options);
}

function lineArea() {
  console.log("Line & Area", LINE_AND_AREA);
  options.series = LINE_AND_AREA;
  agCharts.AgChart.update(chart, options);
}
