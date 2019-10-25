import { Axis } from "../../axis";
import { LinearScale } from "../../scale/linearScale";
export declare class NumberAxis extends Axis<LinearScale> {
    constructor();
    private _nice;
    nice: boolean;
    domain: number[];
}
