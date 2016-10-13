// ag-grid-enterprise v6.2.1
import { IRowNodeStage, RowNode } from "ag-grid/main";
export declare class AggregationStage implements IRowNodeStage {
    private gridOptionsWrapper;
    private columnController;
    private valueService;
    private pivotStage;
    private aggFuncService;
    execute(rootNode: RowNode): any;
    private recursivelyCreateAggData(rowNode, measureColumns, pivotColumns);
    private aggregateRowNode(rowNode, measureColumns, pivotColumns);
    private aggregateRowNodeUsingValuesAndPivot(rowNode);
    private aggregateRowNodeUsingValuesOnly(rowNode, valueColumns);
    private putInValueForGroupNode(result, rowNode);
    private getValuesPivotNonLeaf(rowNode, colId);
    private getValuesFromMappedSet(mappedSet, keys, valueColumn);
    private getValuesNormal(rowNode, valueColumns);
    private aggregateValues(values, aggFuncOrString);
}
