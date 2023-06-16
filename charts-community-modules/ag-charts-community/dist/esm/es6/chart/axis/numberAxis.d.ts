import { LinearScale } from '../../scale/linearScale';
import { LogScale } from '../../scale/logScale';
import { ChartAxis } from '../chartAxis';
import { ModuleContext } from '../../module-support';
import { BaseAxisTick } from '../../axis';
declare class NumberAxisTick extends BaseAxisTick<LinearScale | LogScale, number> {
    maxSpacing: number;
}
export declare class NumberAxis extends ChartAxis<LinearScale | LogScale, number> {
    static className: string;
    static type: "number" | "log";
    constructor(moduleCtx: ModuleContext, scale?: LogScale | LinearScale);
    normaliseDataDomain(d: number[]): number[];
    min: number;
    max: number;
    formatDatum(datum: number): string;
    protected createTick(): NumberAxisTick;
    updateSecondaryAxisTicks(primaryTickCount: number | undefined): any[];
}
export {};
//# sourceMappingURL=numberAxis.d.ts.map