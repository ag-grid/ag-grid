import { BandScale } from '../../scale/bandScale';
import type { ModuleContext } from '../../util/moduleContext';
import { CartesianAxis } from './cartesianAxis';
export declare class CategoryAxis extends CartesianAxis<BandScale<string | object>> {
    static className: string;
    static type: "category";
    private _paddingOverrideEnabled;
    constructor(moduleCtx: ModuleContext);
    groupPaddingInner: number;
    set paddingInner(value: number);
    get paddingInner(): number;
    set paddingOuter(value: number);
    get paddingOuter(): number;
    normaliseDataDomain(d: (string | object)[]): (string | object)[];
    protected calculateDomain(): void;
}
//# sourceMappingURL=categoryAxis.d.ts.map