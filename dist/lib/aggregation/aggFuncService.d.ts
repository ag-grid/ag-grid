// ag-grid-enterprise v16.0.1
import { IAggFuncService, IAggFunc, GridOptionsWrapper, Column } from "ag-grid/main";
export declare class AggFuncService implements IAggFuncService {
    private static AGG_SUM;
    private static AGG_FIRST;
    private static AGG_LAST;
    private static AGG_MIN;
    private static AGG_MAX;
    private static AGG_COUNT;
    private static AGG_AVG;
    gridOptionsWrapper: GridOptionsWrapper;
    private aggFuncsMap;
    private initialised;
    private init();
    private initialiseWithDefaultAggregations();
    getDefaultAggFunc(column: Column): string;
    addAggFuncs(aggFuncs: {
        [key: string]: IAggFunc;
    }): void;
    addAggFunc(key: string, aggFunc: IAggFunc): void;
    getAggFunc(name: string): IAggFunc;
    getFuncNames(column: Column): string[];
    clear(): void;
}
