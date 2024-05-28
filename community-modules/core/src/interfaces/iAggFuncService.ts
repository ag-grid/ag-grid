import type { IAggFunc } from '../entities/colDef';
import type { InternalColumn } from '../entities/column';

export interface IAggFuncService {
    addAggFuncs(aggFuncs: { [key: string]: IAggFunc }): void;
    clear(): void;
    getDefaultAggFunc(column: InternalColumn): string | null;
    getFuncNames(column: InternalColumn): string[];
    getDefaultFuncLabel(fctName: string): string;
}
