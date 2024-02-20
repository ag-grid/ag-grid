import type { ModuleContext } from '../../module/moduleContext';
import { NumberAxis } from './numberAxis';
export declare class LogAxis extends NumberAxis {
    static className: string;
    static type: "log";
    normaliseDataDomain(d: number[]): {
        domain: number[];
        clipped: boolean;
    };
    min: number;
    max: number;
    set base(value: number);
    get base(): number;
    constructor(moduleCtx: ModuleContext);
}
