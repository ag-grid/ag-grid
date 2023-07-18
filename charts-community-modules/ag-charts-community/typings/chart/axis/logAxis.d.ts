import { NumberAxis } from './numberAxis';
import type { ModuleContext } from '../../util/moduleContext';
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
//# sourceMappingURL=logAxis.d.ts.map