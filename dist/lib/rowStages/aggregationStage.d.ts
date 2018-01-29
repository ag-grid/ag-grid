// ag-grid-enterprise v16.0.1
import { IRowNodeStage, StageExecuteParams } from "ag-grid/main";
export declare class AggregationStage implements IRowNodeStage {
    private gridOptionsWrapper;
    private columnController;
    private valueService;
    private pivotStage;
    private aggFuncService;
    execute(params: StageExecuteParams): any;
    private createAggDetails(params);
    private recursivelyCreateAggData(rowNode, aggDetails);
    private aggregateRowNode(rowNode, aggDetails);
    private aggregateRowNodeUsingValuesAndPivot(rowNode);
    private aggregateRowNodeUsingValuesOnly(rowNode, aggDetails);
    private getValuesPivotNonLeaf(rowNode, colId);
    private getValuesFromMappedSet(mappedSet, keys, valueColumn);
    private getValuesNormal(rowNode, valueColumns);
    private aggregateValues(values, aggFuncOrString);
}
