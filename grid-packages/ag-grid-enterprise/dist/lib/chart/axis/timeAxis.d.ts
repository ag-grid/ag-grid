import { TimeScale } from '../../scale/timeScale';
import { ChartAxis } from '../chartAxis';
export declare class TimeAxis extends ChartAxis<TimeScale> {
    static className: string;
    static type: "time";
    private datumFormat;
    private datumFormatter;
    constructor();
    min?: Date | number;
    max?: Date | number;
    normaliseDataDomain(d: Date[]): Date[];
    protected onLabelFormatChange(ticks: any[], format?: string): void;
    formatDatum(datum: Date): string;
}
