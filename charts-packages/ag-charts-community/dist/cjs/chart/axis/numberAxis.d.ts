import { ChartAxis } from "../chartAxis";
export declare class NumberAxis extends ChartAxis {
    static className: string;
    static type: string;
    constructor();
    protected _nice: boolean;
    set nice(value: boolean);
    get nice(): boolean;
    set domain(value: number[]);
    get domain(): number[];
    protected _min: number;
    set min(value: number);
    get min(): number;
    protected _max: number;
    set max(value: number);
    get max(): number;
}
