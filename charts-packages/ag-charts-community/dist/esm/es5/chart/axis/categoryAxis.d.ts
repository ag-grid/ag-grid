import { BandScale } from "../../scale/bandScale";
import { ChartAxis } from "../chartAxis";
export declare class CategoryAxis extends ChartAxis<BandScale<string>> {
    static className: string;
    static type: "category";
    constructor();
    set paddingInner(value: number);
    get paddingInner(): number;
    set paddingOuter(value: number);
    get paddingOuter(): number;
    set domain(values: string[]);
    get domain(): string[];
}
