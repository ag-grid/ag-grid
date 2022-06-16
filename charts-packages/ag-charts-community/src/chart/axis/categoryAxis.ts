import { BandScale } from "../../scale/bandScale";
import { ChartAxis } from "../chartAxis";
export class CategoryAxis extends ChartAxis<BandScale<string | object>> {
    static className = 'CategoryAxis';
    static type = 'category' as const;

    constructor() {
        super(new BandScale<string>());

        this.scale.paddingInner = 0.2;
        this.scale.paddingOuter = 0.3;
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

    set domain(values: (string | object)[]) {
        // Prevent duplicate categories.
        const valuesSet = new Set<string | {}>(values);
        this.scale.domain = new Array(...valuesSet.values());
    }

    get domain(): (string | object)[] {
        return this.scale.domain.slice();
    }
}
