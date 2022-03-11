import { BandScale } from "../../scale/bandScale";
import { ChartAxis } from "../chartAxis";
export class CategoryAxis extends ChartAxis {
    constructor() {
        super(new BandScale());
        this.scale.paddingInner = 0.2;
        this.scale.paddingOuter = 0.3;
    }
    set paddingInner(value) {
        this.scale.paddingInner = value;
    }
    get paddingInner() {
        return this.scale.paddingInner;
    }
    set paddingOuter(value) {
        this.scale.paddingOuter = value;
    }
    get paddingOuter() {
        return this.scale.paddingOuter;
    }
    set domain(values) {
        // Prevent duplicate categories.
        this.scale.domain = values
            .filter((s, i, arr) => arr.indexOf(s) === i);
    }
    get domain() {
        return this.scale.domain.slice();
    }
}
CategoryAxis.className = 'CategoryAxis';
CategoryAxis.type = 'category';
//# sourceMappingURL=categoryAxis.js.map