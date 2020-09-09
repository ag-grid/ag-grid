import { BandScale } from "../../scale/bandScale";
import { ChartAxis } from "../chartAxis";
export declare class CategoryAxis extends ChartAxis {
    static className: string;
    static type: string;
    constructor();
    readonly scale: BandScale<string>;
    paddingInner: number;
    paddingOuter: number;
}
