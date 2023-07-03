import { BandScale } from '../../scale/bandScale';
import { ChartAxis } from '../chartAxis';
import { ModuleContext } from '../../util/module';
export declare class CategoryAxis extends ChartAxis<BandScale<string | object>> {
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
