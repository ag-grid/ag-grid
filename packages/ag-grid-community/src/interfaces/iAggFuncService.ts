import type { AgColumn } from '../entities/agColumn';
import type { IAggFunc } from '../entities/colDef';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IAggFuncService {
    addAggFuncs(aggFuncs: { [key: string]: IAggFunc }): void;
    clear(): void;
    getDefaultAggFunc(column: AgColumn): string | null;
    getFuncNames(column: AgColumn): string[];
    getDefaultFuncLabel(fctName: string): string;
    getAggFunc(name: string): IAggFunc;
}
