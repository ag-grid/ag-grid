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
    private pivotRowTotalsLastTime;
    private pivotColumnGroupTotalsLastTime;
    private suppressExpandablePivotGroupsLastTime;
    private removePivotHeaderRowWhenSingleValueColumnLastTime;
    private lastTimeFailed;
    private maxUniqueValues;
    private static EXCEEDED_MAX_UNIQUE_VALUES;
    execute(params: StageExecuteParams): void;
    private executePivotOff;
    private executePivotOn;
    private setUniqueValues;
    private currentUniqueCount;
    private bucketUpRowNodes;
    private bucketRowNode;
    private bucketChildren;
    getPivotColumnDefs(): ColDef[];
}
