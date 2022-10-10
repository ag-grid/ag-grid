import { AgChartOptions } from 'ag-charts-community';
import * as agCharts from 'ag-charts-community';
import { getData } from './data';

const options: AgChartOptions = {
    container: document.getElementById('myChart'),
    data: getData(),
    series: [
        {
            type: 'pie',
            angleKey: 'value',
            calloutLabelKey: 'label',
            sectorLabelKey: 'value',
            sectorLabel: {
                color: 'white',
                fontWeight: 'bold',
            },
        },
    ],
};

agCharts.AgChart.create(options);
