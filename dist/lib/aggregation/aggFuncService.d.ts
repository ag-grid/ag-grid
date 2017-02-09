// ag-grid-enterprise v8.0.0
import { IAggFuncService, IAggFunc, GridOptionsWrapper } from "ag-grid/main";
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
    getDefaultAggFunc(): string;
    addAggFuncs(aggFuncs: {
        [key: string]: IAggFunc;
    }): void;
    addAggFunc(key: string, aggFunc: IAggFunc): void;
    getAggFunc(name: string): IAggFunc;
    getFuncNames(): string[];
    clear(): void;
}
