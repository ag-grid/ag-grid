import { TimeScale } from '../../scale/timeScale';
import { ChartAxis } from '../chartAxis';
import { ModuleContext } from '../../util/module';
import { BaseAxisTick } from '../../axis';
declare class TimeAxisTick extends BaseAxisTick<TimeScale, number | Date> {
    maxSpacing: number;
}
export declare class TimeAxis extends ChartAxis<TimeScale, number | Date> {
    static className: string;
    static type: "time";
    private datumFormat;
    private datumFormatter;
    constructor(moduleCtx: ModuleContext);
    min?: Date | number;
    max?: Date | number;
    normaliseDataDomain(d: Date[]): Date[];
    protected createTick(): TimeAxisTick;
    protected onLabelFormatChange(ticks: any[], format?: string): void;
    formatDatum(datum: Date): string;
    calculatePadding(_min: number, _max: number): number;
}
export {};
//# sourceMappingURL=timeAxis.d.ts.map