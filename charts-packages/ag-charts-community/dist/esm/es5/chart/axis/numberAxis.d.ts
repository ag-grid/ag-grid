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
    min: number;
    max: number;
    formatDatum(datum: number): string;
    protected updateDomain(domain: any[], isYAxis: boolean, primaryTickCount?: number): number | undefined;
}
