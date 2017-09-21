// ag-grid-enterprise v13.2.0
import { IRowNodeStage, StageExecuteParams } from "ag-grid/main";
export declare class AggregationStage implements IRowNodeStage {
    private gridOptionsWrapper;
    private columnController;
    private valueService;
    private pivotStage;
    private aggFuncService;
    execute(params: StageExecuteParams): any;
    private recursivelyCreateAggData(rowNode, changedPath, measureColumns, pivotColumns);
    private aggregateRowNode(rowNode, changedPath, measureColumns, pivotColumns);
    private aggregateRowNodeUsingValuesAndPivot(rowNode);
    private aggregateRowNodeUsingValuesOnly(rowNode, changedPath, valueColumns);
    private getValuesPivotNonLeaf(rowNode, colId);
    private getValuesFromMappedSet(mappedSet, keys, valueColumn);
    private getValuesNormal(rowNode, valueColumns);
    private aggregateValues(values, aggFuncOrString);
}
