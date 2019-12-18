import { IRowNodeStage, StageExecuteParams, IAggFunc } from "@ag-grid-community/core";
export declare class AggregationStage implements IRowNodeStage {
    private gridOptionsWrapper;
    private columnController;
    private valueService;
    private pivotStage;
    private aggFuncService;
    execute(params: StageExecuteParams): any;
    private createAggDetails;
    private recursivelyCreateAggData;
    private aggregateRowNode;
    private aggregateRowNodeUsingValuesAndPivot;
    private aggregateRowNodeUsingValuesOnly;
    private getValuesPivotNonLeaf;
    private getValuesFromMappedSet;
    private getValuesNormal;
    aggregateValues(values: any[], aggFuncOrString: string | IAggFunc): any;
}
