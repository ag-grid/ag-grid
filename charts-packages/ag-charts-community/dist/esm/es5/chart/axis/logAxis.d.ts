import { NumberAxis } from './numberAxis';
export declare class LogAxis extends NumberAxis {
    static className: string;
    static type: "log";
    set base(value: number);
    get base(): number;
    constructor();
}
