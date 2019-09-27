// ag-grid-enterprise v21.2.2
import { Column, GridOptionsWrapper, IAggFunc, IAggFuncService } from "ag-grid-community";
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
    private init;
    private initialiseWithDefaultAggregations;
    getDefaultAggFunc(column: Column): string | null;
    addAggFuncs(aggFuncs: {
        [key: string]: IAggFunc;
    } | undefined): void;
    addAggFunc(key: string, aggFunc: IAggFunc): void;
    getAggFunc(name: string): IAggFunc;
    getFuncNames(column: Column): string[];
    clear(): void;
}
