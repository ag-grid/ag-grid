import { Axis } from "../../axis";
import { TimeScale } from "../../scale/timeScale";
export declare class TimeAxis extends Axis<TimeScale> {
    constructor();
    private _nice;
    nice: boolean;
    domain: Date[];
}
