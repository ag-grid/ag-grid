import { BandScale } from "../../scale/bandScale";
import { Axis } from "../../axis";

export class CategoryAxis extends Axis<BandScale<string>> {
    constructor() {
        const scale = new BandScale<string>();
        scale.paddingInner = 0.2;
        scale.paddingOuter = 0.3;

        super(scale);
    }
}
