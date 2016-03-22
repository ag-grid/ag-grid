// ag-grid-enterprise v4.0.7
import { IRowNodeStage } from "ag-grid/main";
import { RowNode } from "ag-grid/main";
export declare class AggregationStage implements IRowNodeStage {
    private gridOptionsWrapper;
    private columnController;
    private valueService;
    execute(rowsToAgg: RowNode[]): RowNode[];
    private recursivelyClearAggData(nodes);
    private recursivelyCreateAggData(nodes, groupAggFunction, level);
    private defaultGroupAggFunctionFactory(valueColumns);
}
