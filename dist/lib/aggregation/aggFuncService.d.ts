// ag-grid-enterprise v5.0.0-alpha.2
import { IAggFuncService, IAggFunc, GridOptionsWrapper } from "ag-grid/main";
export declare class AggFuncService implements IAggFuncService {
    gridOptionsWrapper: GridOptionsWrapper;
    private aggFuncsMap;
    private initialised;
    private init();
    private initialiseWithDefaultAggregations();
    addAggFuncs(aggFuncs: {
        [key: string]: IAggFunc;
    }): void;
    addAggFunc(key: string, aggFunc: IAggFunc): void;
    getAggFunc(name: string): IAggFunc;
    getFuncNames(): string[];
    clear(): void;
}
