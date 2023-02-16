import { NumberAxis } from './numberAxis';
export declare class LogAxis extends NumberAxis {
    static className: string;
    static type: "log";
    normaliseDataDomain(d: number[]): number[];
    min: number;
    max: number;
    set base(value: number);
    get base(): number;
    constructor();
}
