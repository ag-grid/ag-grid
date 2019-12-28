import { ChartAxis } from "../chartAxis";
export declare class TimeAxis extends ChartAxis {
    constructor();
    private _nice;
    nice: boolean;
    domain: Date[];
}
