import { MiniAreaChart } from "./miniAreaChart";
import { MiniColumnChart } from "./miniColumnChart";
import { MiniLineChart } from "./miniLineChart";

export interface AgSparklineOptions {
    type: string;
    data: any[];
    width: number;
    height: number;
}

export abstract class AgSparkline {
    static create(options: AgSparklineOptions): MiniLineChart | MiniAreaChart | MiniColumnChart {
        const {type, data, width, height} = options;

        const sparkline = createSparkline(type);

        sparkline.data = data;
        sparkline.width = width;
        sparkline.height = height;

        //TODO: don't want to test this feature yet
        sparkline.tooltip.enabled = false;

        return sparkline;
    }
}

const createSparkline = (type: string): MiniLineChart | MiniAreaChart | MiniColumnChart => {
    switch (type) {
        case 'line':
            return new MiniLineChart();
        case 'column':
            return new MiniColumnChart();
        case 'area':
            return new MiniAreaChart();
        default:
            return new MiniLineChart();
    }
}