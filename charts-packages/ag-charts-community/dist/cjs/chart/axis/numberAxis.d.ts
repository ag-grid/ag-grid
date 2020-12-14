import { ChartAxis } from "../chartAxis";
export declare class NumberAxis extends ChartAxis {
    static className: string;
    static type: string;
    constructor();
    protected _nice: boolean;
    nice: boolean;
    domain: number[];
    protected _min: number;
    min: number;
    protected _max: number;
    max: number;
}
