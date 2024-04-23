import { BeanStub, IRowNodeStage, RowNode, Column, StageExecuteParams, IAggFunc } from "ag-grid-community";
export declare class AggregationStage extends BeanStub implements IRowNodeStage {
    private columnModel;
    private valueService;
    private aggFuncService;
    execute(params: StageExecuteParams): any;
    private createAggDetails;
    private isSuppressAggFilteredOnly;
    private recursivelyCreateAggData;
    private aggregateRowNode;
    private aggregateRowNodeUsingValuesAndPivot;
    private aggregateRowNodeUsingValuesOnly;
    private getValuesPivotNonLeaf;
    private getValuesFromMappedSet;
    private getValuesNormal;
    aggregateValues(values: any[], aggFuncOrString: string | IAggFunc, column?: Column, rowNode?: RowNode, pivotResultColumn?: Column): any;
}
