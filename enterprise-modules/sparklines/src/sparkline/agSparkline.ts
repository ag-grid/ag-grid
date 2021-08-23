import { MiniAreaChart } from "./miniAreaChart";
import { HighlightStyle } from "./miniChart";
import { MiniColumnChart } from "./miniColumnChart";
import { MiniLineChart } from "./miniLineChart";

export type AgSparklineOptions = AgLineSparklineOptions | AgAreaSparklineOptions | AgColumnSparklineOptions;

export interface AgBaseSparklineOptions {
    data?: number[];
    width?: number;
    height?: number;
    title?: string;
    padding?: string;
    axis?: {
        stroke?: string;
        strokeWidth?: number;
    };
    hihglightStyle: HighlightStyle;
}

export interface AgLineSparklineOptions extends AgBaseSparklineOptions {
    type?: 'line';
    line?: {
        fill?: string;

    }
}
export interface AgAreaSparklineOptions extends AgBaseSparklineOptions {
    type?: 'area';
}
export interface AgColumnSparklineOptions extends AgBaseSparklineOptions {
    type?: 'column';
    fill?: string;
}

export type AgSparklineType<T> =
    T extends AgLineSparklineOptions ? MiniLineChart :
        T extends AgAreaSparklineOptions ? MiniAreaChart :
            T extends AgColumnSparklineOptions ? MiniColumnChart :
                never;

export abstract class AgSparkline {
    static create<T extends AgSparklineOptions>(options: T): MiniLineChart | MiniColumnChart | MiniAreaChart  {

        const {type, data, width, height} = options;

        const sparkline = createSparkline(options.type || 'line');

        sparkline.data = data;
        // sparkline.width = width;
        // sparkline.height = height;

        //TODO: don't want to test this feature yet
        sparkline.tooltip.enabled = false;

        return sparkline;
    }
}

const createSparkline = (type: string) => {
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