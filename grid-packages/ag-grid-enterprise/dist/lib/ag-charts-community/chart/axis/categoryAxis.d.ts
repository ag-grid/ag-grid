import type { ModuleContext } from '../../module/moduleContext';
import { BandScale } from '../../scale/bandScale';
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
    normaliseDataDomain(d: (string | object)[]): {
        domain: (string | object)[];
        clipped: boolean;
    };
    protected calculateDomain(): void;
}
