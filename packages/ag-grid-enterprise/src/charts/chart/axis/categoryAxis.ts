import { BandScale } from "../../scale/bandScale";
import { Axis } from "../../axis";
import { AxisOptions, applyAxisOptions } from "./axisOptions";

export class CategoryAxis extends Axis<string> {
    constructor(options: AxisOptions = {}) {
        const scale = new BandScale<string>();
        scale.paddingInner = 0.2;
        scale.paddingOuter = 0.3;

        super(scale);

        applyAxisOptions(this, options);
    }
}
