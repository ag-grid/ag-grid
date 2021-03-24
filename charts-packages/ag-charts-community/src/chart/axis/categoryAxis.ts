import { BandScale } from "../../scale/bandScale";
import { ChartAxis } from "../chartAxis";
export class CategoryAxis extends ChartAxis<BandScale<string>> {
    static className = 'CategoryAxis';
    static type = 'category';

    constructor() {
        super();

        const scale = new BandScale<string>();
        scale.paddingInner = 0.2;
        scale.paddingOuter = 0.3;
        this.scale = scale;
    }

    set paddingInner(value: number) {
        this.scale.paddingInner = value;
    }
    get paddingInner(): number {
        return this.scale.paddingInner;
    }

    set paddingOuter(value: number) {
        this.scale.paddingOuter = value;
    }
    get paddingOuter(): number {
        return this.scale.paddingOuter;
    }
}
