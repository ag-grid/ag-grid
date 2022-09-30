import { TimeScale } from '../../scale/timeScale';
import { ChartAxis } from '../chartAxis';
export declare class TimeAxis extends ChartAxis<TimeScale> {
    static className: string;
    static type: "time";
    private datumFormat;
    private datumFormatter;
    constructor();
    nice: boolean;
    set domain(domain: Date[]);
    get domain(): Date[];
    min?: Date;
    max?: Date;
    private setDomain;
    protected onLabelFormatChange(format?: string): void;
    formatDatum(datum: Date): string;
    protected updateDomain(domain: any[], _isYAxis: boolean, primaryTickCount?: number): number;
}
