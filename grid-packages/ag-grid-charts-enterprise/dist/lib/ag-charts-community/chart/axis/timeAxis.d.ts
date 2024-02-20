import type { ModuleContext } from '../../module/moduleContext';
import { TimeScale } from '../../scale/timeScale';
import { AxisTick } from './axisTick';
import { CartesianAxis } from './cartesianAxis';
declare class TimeAxisTick extends AxisTick<TimeScale, number | Date> {
    maxSpacing: number;
}
export declare class TimeAxis extends CartesianAxis<TimeScale, number | Date> {
    static className: string;
    static type: "time";
    private datumFormat;
    private datumFormatter;
    constructor(moduleCtx: ModuleContext);
    min?: Date | number;
    max?: Date | number;
    normaliseDataDomain(d: Date[]): {
        domain: Date[];
        clipped: boolean;
    };
    protected createTick(): TimeAxisTick;
    protected onLabelFormatChange(ticks: any[], format?: string): void;
    formatDatum(datum: Date): string;
    calculatePadding(_min: number, _max: number, reverse: boolean): [number, number];
}
export {};
