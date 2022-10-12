import { NUMBER, Validate } from '../../util/validation';
import { BandScale } from '../../scale/bandScale';
import { ChartAxis } from '../chartAxis';
export class CategoryAxis extends ChartAxis<BandScale<string | object>> {
    static className = 'CategoryAxis';
    static type = 'category' as const;

    private _paddingOverrideEnabled = false;

    constructor() {
        super(new BandScale<string>());

        this.includeInvisibleDomains = true;
    }

    @Validate(NUMBER(0, 1))
    groupPaddingInner: number = 0.1;

    set paddingInner(value: number) {
        this._paddingOverrideEnabled = true;
        this.scale.paddingInner = value;
    }
    get paddingInner(): number {
        this._paddingOverrideEnabled = true;
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

    calculateDomain() {
        if (!this._paddingOverrideEnabled) {
            const { boundSeries } = this;

            if (boundSeries.some((s) => ['bar', 'column'].includes(s.type))) {
                this.scale.paddingInner = 0.2;
                this.scale.paddingOuter = 0.3;
            } else {
                this.scale.paddingInner = 1;
                this.scale.paddingOuter = 0;
            }
        }

        return super.calculateDomain();
    }
}
