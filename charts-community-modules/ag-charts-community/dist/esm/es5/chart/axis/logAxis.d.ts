import { NumberAxis } from './numberAxis';
import { ModuleContext } from '../../util/module';
export declare class LogAxis extends NumberAxis {
    static className: string;
    static type: "log";
    normaliseDataDomain(d: number[]): number[];
    min: number;
    max: number;
    set base(value: number);
    get base(): number;
    constructor(moduleCtx: ModuleContext);
}
