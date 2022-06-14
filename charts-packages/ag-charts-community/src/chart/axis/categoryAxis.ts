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
        const valuesDict: Record<string, string> = {};
        for (const value of values) {
            // NOTE: keys are forces to strings, so we can't use them for cases where the domain is
            // object-based - which is itself counter to the typings here!
            valuesDict[value] = value;
        }
        this.scale.domain = Object.values(valuesDict);
    }
    get domain(): string[] {
        return this.scale.domain.slice();
    }
}
