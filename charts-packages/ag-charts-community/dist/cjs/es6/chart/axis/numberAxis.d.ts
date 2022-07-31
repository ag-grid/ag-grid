import { ChartAxis } from '../chartAxis';
export declare function clamper(domain: number[]): (x: number) => number;
export declare class NumberAxis extends ChartAxis {
    static className: string;
    static type: "number" | "log";
    constructor();
    protected _nice: boolean;
    set nice(value: boolean);
    get nice(): boolean;
    private setDomain;
    set domain(domain: number[]);
    get domain(): number[];
    protected _min: number;
    set min(value: number);
    get min(): number;
    protected _max: number;
    set max(value: number);
    get max(): number;
    formatDatum(datum: number): string;
    protected updateDomain(domain: any[], isYAxis: boolean, primaryTickCount?: number): number | undefined;
}
