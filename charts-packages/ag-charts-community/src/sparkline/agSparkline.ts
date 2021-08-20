import { MiniAreaChart } from "./miniAreaChart";
import { MiniColumnChart } from "./miniColumnChart";
import { MiniLineChart } from "./miniLineChart";

export abstract class AgSparkline {
    static create(type: string, data: number[]): MiniLineChart | MiniAreaChart | MiniColumnChart {
        const component = getChartComponent(type);
        const sparkline = new component()

        sparkline.data = data;
        sparkline.width = 100;
        sparkline.height = 50;

        return sparkline;
    }
}

function getChartComponent(type: string = 'line'): new () => MiniLineChart | MiniAreaChart | MiniColumnChart {
    switch (type) {
        case 'line': 
            return MiniLineChart;
        case 'column':
            return MiniColumnChart;
        case 'area':
            return MiniAreaChart;
    }
    return MiniLineChart;
}