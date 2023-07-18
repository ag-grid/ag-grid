import { NUMBER, Validate } from '../../util/validation';
import { BandScale } from '../../scale/bandScale';
import type { ModuleContext } from '../../util/moduleContext';
import { CartesianAxis } from './cartesianAxis';

export class CategoryAxis extends CartesianAxis<BandScale<string | object>> {
    static className = 'CategoryAxis';
    static type = 'category' as const;

    private _paddingOverrideEnabled = false;

    constructor(moduleCtx: ModuleContext) {
        super(moduleCtx, new BandScale<string>());

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

    normaliseDataDomain(d: (string | object)[]): (string | object)[] {
        // Prevent duplicate categories.
        const valuesSet: Record<string, (typeof d)[number]> = {};
        for (const next of d) {
            valuesSet[String(next)] ??= next;
        }
        return Object.values(valuesSet);
    }

    protected calculateDomain() {
        if (!this._paddingOverrideEnabled) {
            const { boundSeries } = this;
            const paddings = boundSeries.map((s) => s.getBandScalePadding?.()).filter((p) => p != null);
            if (paddings.length > 0) {
                this.scale.paddingInner = Math.min(...paddings.map((p) => p!.inner));
                this.scale.paddingOuter = Math.max(...paddings.map((p) => p!.outer));
            }
        }

        return super.calculateDomain();
    }
}
