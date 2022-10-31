import { LinearScale } from '../../scale/linearScale';
import { LogScale } from '../../scale/logScale';
import { ChartAxis } from '../chartAxis';
export declare class NumberAxis extends ChartAxis<LinearScale | LogScale, number> {
    static className: string;
    static type: "number" | "log";
    constructor(scale?: LinearScale | LogScale);
    normaliseDataDomain(d: number[]): number[];
    min: number;
    max: number;
    formatDatum(datum: number): string;
    updateSecondaryAxisTicks(primaryTickCount: number | undefined): any[];
}
