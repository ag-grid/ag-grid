// ag-grid-enterprise v11.0.0
import { IRowNodeStage, StageExecuteParams } from "ag-grid/main";
export declare class AggregationStage implements IRowNodeStage {
    private gridOptionsWrapper;
    private columnController;
    private valueService;
    private groupValueService;
    private pivotStage;
    private aggFuncService;
    execute(params: StageExecuteParams): any;
    private recursivelyCreateAggData(rowNode, measureColumns, pivotColumns);
    private aggregateRowNode(rowNode, measureColumns, pivotColumns);
    private aggregateRowNodeUsingValuesAndPivot(rowNode);
    private aggregateRowNodeUsingValuesOnly(rowNode, valueColumns);
    private getValuesPivotNonLeaf(rowNode, colId);
    private getValuesFromMappedSet(mappedSet, keys, valueColumn);
    private getValuesNormal(rowNode, valueColumns);
    private aggregateValues(values, aggFuncOrString);
}
