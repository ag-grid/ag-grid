// ag-grid-enterprise v21.2.2
import { ColDef, IRowNodeStage, StageExecuteParams } from "ag-grid-community";
export declare class PivotStage implements IRowNodeStage {
    private rowModel;
    private valueService;
    private columnController;
    private eventService;
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
