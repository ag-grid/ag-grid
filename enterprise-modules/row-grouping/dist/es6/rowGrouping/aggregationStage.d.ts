import { BeanStub, IRowNodeStage, RowNode, Column, StageExecuteParams, IAggFunc } from "@ag-grid-community/core";
export declare class AggregationStage extends BeanStub implements IRowNodeStage {
    private gridOptionsWrapper;
    private columnController;
    private valueService;
    private pivotStage;
    private aggFuncService;
    private gridApi;
    private columnApi;
    execute(params: StageExecuteParams): any;
    private createAggDetails;
    private recursivelyCreateAggData;
    private aggregateRowNode;
    private aggregateRowNodeUsingValuesAndPivot;
    private aggregateRowNodeUsingValuesOnly;
    private getValuesPivotNonLeaf;
    private getValuesFromMappedSet;
    private getValuesNormal;
    aggregateValues(values: any[], aggFuncOrString: string | IAggFunc, column?: Column, rowNode?: RowNode): any;
}
