import {
  AgCartesianChartOptions,
  AgEnterpriseCharts,
  AgCrosshairLabelRendererParams
} from "ag-charts-enterprise"
import { getData } from "./data"

const crosshairLabelRenderer = (arrowPosition: 'top' | 'right') => {
  const classList =
    arrowPosition === 'top'
      ? 'secondary-axes-crosshair-label crosshair-label-arrow-top'
      : 'secondary-axes-crosshair-label crosshair-label-arrow-right';
  return ({ value, fractionDigits }: AgCrosshairLabelRendererParams) => {
    return `<div class='${classList}'>
            <div>${value.toFixed(fractionDigits)}</div>
         </div>`;
  };
};

const data = getData();
const buildSeries = () => {
  return Object.entries(data[0])
    .filter(([key]) => key !== 'All fuels' && key !== 'year')
    .map(([key]) => ({
      yKey: key,
      xKey: 'year',
    }));
};

const options: AgCartesianChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data,
  series: buildSeries(),
  axes: [
    {
      type: 'number',
      position: 'left',
      title: {
        text: 'Kilotonnes of Oil Equivalent',
      },
      crosshair: {
        snap: false,
        label: {
          renderer: crosshairLabelRenderer('right'),
        },
      },
    },
    {
      type: 'number',
      position: 'bottom',
      keys: ['year'],
      crosshair: {
        snap: false,
        label: {
          renderer: crosshairLabelRenderer('top'),
        },
      },
    },
  ],
}

AgEnterpriseCharts.create(options)
