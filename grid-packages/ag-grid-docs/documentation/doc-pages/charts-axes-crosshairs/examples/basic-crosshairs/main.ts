import { AgEnterpriseCharts } from 'ag-charts-enterprise'

const options : any = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: [
    {
      year: '1990',
      population: 5315511894,
    },
    {
      year: '2000',
      population: 6132455985,
    },
    {
      year: '2010',
      population: 6939761510,
    },
    {
      year: '2020',
      population: 7756873419,
    },
    {
      year: '2030',
      population: 8488000705,
    },
    {
      year: '2040',
      population: 9161630268,
    },
    {
      year: '2050',
      population: 9740512435,
    },
    {
      year: '2060',
      population: 10209735907,
    },
    {
      year: '2070',
      population: 10160971681,
    },
    {
      year: '2080',
      population: 10418078555,
    },
    {
      year: '2090',
      population: 10569727589,
    },
    {
      year: '2100',
      population: 10616678375,
    },
  ],
  series: [
    {
      yKey: 'population',
      xKey: 'year',
    },
  ],
  axes: [
    {
      type: 'number',
      position: 'left',
      crosshair: {
        enabled: true
      },
    },
    {
      type: 'category',
      position: 'bottom',
      crosshair: {
        enabled: true
      },
    },
  ],
};

AgEnterpriseCharts.create(options);