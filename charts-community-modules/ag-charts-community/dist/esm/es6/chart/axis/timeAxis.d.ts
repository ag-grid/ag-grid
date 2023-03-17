import { TimeScale } from '../../scale/timeScale';
import { ChartAxis } from '../chartAxis';
import { ModuleContext } from '../../util/module';
export declare class TimeAxis extends ChartAxis<TimeScale, number | Date> {
    static className: string;
    static type: "time";
    private datumFormat;
    private datumFormatter;
    constructor(moduleCtx: ModuleContext);
    min?: Date | number;
    max?: Date | number;
    normaliseDataDomain(d: Date[]): Date[];
    protected onLabelFormatChange(ticks: any[], format?: string): void;
    formatDatum(datum: Date): string;
}
