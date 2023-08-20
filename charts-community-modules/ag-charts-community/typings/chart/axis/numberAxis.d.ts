import { LinearScale } from '../../scale/linearScale';
import type { LogScale } from '../../scale/logScale';
import type { ModuleContext } from '../../module-support';
import { AxisTick } from './axisTick';
import { CartesianAxis } from './cartesianAxis';
declare class NumberAxisTick extends AxisTick<LinearScale | LogScale, number> {
    maxSpacing: number;
}
export declare class NumberAxis extends CartesianAxis<LinearScale | LogScale, number> {
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