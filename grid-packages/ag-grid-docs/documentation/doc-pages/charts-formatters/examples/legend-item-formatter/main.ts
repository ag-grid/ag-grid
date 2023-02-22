import { AgChart, AgChartOptions, AgChartLegendLabelFormatterParams } from "ag-charts-community"

function formatter({ value }: AgChartLegendLabelFormatterParams) {
  switch (value) {
    case 'car':
      value += ' 🚗';
      break;
    case 'motorbike':
      value += ' 🏍';
      break;
    case 'bicycle':
      value += ' 🚴‍♀️';
      break;
    case 'train':
      value += ' 🚄';
      break;
    case 'bus':
      value += ' 🚌';
      break;
  }

  return value[0].toUpperCase() + value.substring(1);
}

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  title: {
    text: "Modes of transport to the office",
  },
  data: [
    {
      type: "car",
      count: 150,
    },
    {
      type: "motorbike",
      count: 12,
    },
    {
      type: "bicycle",
      count: 36,
    },
    {
      type: "train",
      count: 87,
    },
    {
      type: "bus",
      count: 23,
    },
  ],
  series: [
    {
      type: "pie",
      angleKey: "count",
      calloutLabelKey: "type",
    },
  ],
  legend: {
    enabled: true,
    item: { label: { formatter } },
  },
}

AgChart.create(options)
