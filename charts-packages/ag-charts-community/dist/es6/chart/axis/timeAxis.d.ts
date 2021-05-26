import { TimeScale } from "../../scale/timeScale";
import { ChartAxis } from "../chartAxis";
export declare class TimeAxis extends ChartAxis<TimeScale> {
    static className: string;
    static type: string;
    private datumFormat;
    private datumFormatter;
    constructor();
    private _nice;
    nice: boolean;
    domain: Date[];
    protected onLabelFormatChange(format?: string): void;
    formatDatum(datum: Date): string;
}
