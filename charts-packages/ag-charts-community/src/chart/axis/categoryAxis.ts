import { BandScale } from "../../scale/bandScale";
import { ChartAxis } from "../chartAxis";
export class CategoryAxis extends ChartAxis<BandScale<string>> {
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

    set domain(values: string[]) {
        // Prevent duplicate categories.
        this.scale.domain = values
            .filter((s, i, arr) => arr.indexOf(s) === i)
    }
    get domain(): string[] {
        return this.scale.domain.slice();
    }
}
