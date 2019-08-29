// ag-grid-enterprise v21.2.0
import { Axis } from "../../axis";
import { LinearScale } from "../../scale/linearScale";
export declare class NumberAxis extends Axis<LinearScale<number>> {
    constructor();
    private _nice;
    nice: boolean;
    domain: number[];
}
