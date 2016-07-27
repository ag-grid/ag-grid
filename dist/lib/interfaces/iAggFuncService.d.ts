// Type definitions for ag-grid v5.0.6
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { IAggFunc } from "../entities/colDef";
export interface IAggFuncService {
    addAggFuncs(aggFuncs: {
        [key: string]: IAggFunc;
    }): void;
    addAggFunc(key: string, aggFunc: IAggFunc): void;
    clear(): void;
    getDefaultAggFunc(): string;
}
