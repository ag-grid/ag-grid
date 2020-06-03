import { BeanStub, ColDef, IRowNodeStage, StageExecuteParams } from "@ag-grid-community/core";
export declare class PivotStage extends BeanStub implements IRowNodeStage {
    private valueService;
    private columnController;
    private pivotColDefService;
    private uniqueValues;
    private pivotColumnGroupDefs;
    private pivotColumnDefs;
    private aggregationColumnsHashLastTime;
    private aggregationFuncsHashLastTime;
    execute(params: StageExecuteParams): void;
    private executePivotOff;
    private executePivotOn;
    private setUniqueValues;
    private bucketUpRowNodes;
    private bucketRowNode;
    private bucketChildren;
    getPivotColumnDefs(): ColDef[];
}
