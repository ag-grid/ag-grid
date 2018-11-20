// ag-grid-enterprise v19.1.3
import { IRowNodeStage, StageExecuteParams } from "ag-grid-community";
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
    private aggregateValues;
}
//# sourceMappingURL=aggregationStage.d.ts.map