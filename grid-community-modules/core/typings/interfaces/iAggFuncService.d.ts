import { IAggFunc } from "../entities/colDef";
import { Column } from "../entities/column";
export interface IAggFuncService {
    addAggFuncs(aggFuncs: {
        [key: string]: IAggFunc;
    }): void;
    clear(): void;
    getDefaultAggFunc(column: Column): string | null;
    getFuncNames(column: Column): string[];
    getDefaultFuncLabel(fctName: string): string;
}
