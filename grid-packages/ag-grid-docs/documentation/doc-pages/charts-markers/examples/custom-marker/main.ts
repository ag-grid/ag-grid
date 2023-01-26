import { AgChart, AgChartOptions, Marker } from 'ag-charts-community';
import { getData } from "./data";

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  title: {
    text: 'Fuel Spending (2019)',
  },
  data: getData(),
  series: [
    {
      xKey: 'quarter',
      yKey: 'electric',
      title: 'Electric',
      marker: {
        shape: heartFactory(),
        size: 16,
      },
    },
  ],
  legend: {
    position: 'bottom',
  },
}

AgChart.create(options)

function heartFactory() {
  class Heart extends Marker {
    rad(degree: number) {
      return degree / 180 * Math.PI;
    }

    updatePath() {
      const { x, path, size, rad } = this;
      const r = size / 4;
      const y = this.y + r / 2;

      path.clear();
      path.arc(x - r, y - r, r, rad(130), rad(330));
      path.arc(x + r, y - r, r, rad(220), rad(50));
      path.lineTo(x, y + r);
      path.closePath();
    }
  }
  return Heart;
}

