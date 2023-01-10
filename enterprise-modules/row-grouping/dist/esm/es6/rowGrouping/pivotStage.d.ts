import { BeanStub, ColDef, IRowNodeStage, StageExecuteParams } from "@ag-grid-community/core";
export declare class PivotStage extends BeanStub implements IRowNodeStage {
    private valueService;
    private columnModel;
    private pivotColDefService;
    private uniqueValues;
    private pivotColumnDefs;
    private aggregationColumnsHashLastTime;
    private aggregationFuncsHashLastTime;
    private groupColumnsHashLastTime;
    execute(params: StageExecuteParams): void;
    private executePivotOff;
    private executePivotOn;
    private setUniqueValues;
    private bucketUpRowNodes;
    private bucketRowNode;
    private bucketChildren;
    getPivotColumnDefs(): ColDef[];
}
