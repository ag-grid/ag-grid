import { AgChart, AgChartOptions } from 'ag-charts-community';
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
            yKey: 'petrol',
            title: 'Petrol',
            marker: {
                shape: 'square',
                size: 10,
            },
        },
        {
            xKey: 'quarter',
            yKey: 'diesel',
            title: 'Diesel',
            stroke: 'black',
            marker: {
                size: 15,
                fill: 'gray',
                stroke: 'black',
            },
        },
        {
            xKey: 'quarter',
            yKey: 'electric',
            title: 'Electric',
            stroke: '#8bc24a',
            marker: {
                shape: 'cross',
                size: 20,
                fill: '#8bc24a',
                stroke: '#658d36',
            },
        },
    ],
}

AgChart.create(options)
