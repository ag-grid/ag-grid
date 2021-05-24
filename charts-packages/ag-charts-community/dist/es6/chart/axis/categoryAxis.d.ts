import { BandScale } from "../../scale/bandScale";
import { ChartAxis } from "../chartAxis";
export declare class CategoryAxis extends ChartAxis<BandScale<string>> {
    static className: string;
    static type: string;
    constructor();
    paddingInner: number;
    paddingOuter: number;
}
