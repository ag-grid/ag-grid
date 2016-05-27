// ag-grid-enterprise v4.2.4
import { IRowNodeStage, RowNode } from "ag-grid/main";
export declare class AggregationStage implements IRowNodeStage {
    private gridOptionsWrapper;
    private columnController;
    private valueService;
    private pivotService;
    private aggFunctionService;
    execute(rootNode: RowNode): any;
    private recursivelyCreateAggData(rowNode, valueColumns, pivotColumns);
    private aggregateRowNode(rowNode, valueColumns, pivotColumns);
    private aggregateRowNodeUsingValuesAndPivot(rowNode);
    private aggregateRowNodeUsingValuesOnly(rowNode, valueColumns);
    private getValuesPivotNonLeaf(rowNode, colId);
    private getValuesFromMappedSet(mappedSet, keys, valueColumn);
    private getValuesNormal(rowNode, valueColumn);
    private aggregateValues(values, aggFuncOrString);
}
