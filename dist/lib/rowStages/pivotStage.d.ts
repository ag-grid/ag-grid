// ag-grid-enterprise v13.2.0
import { IRowNodeStage, StageExecuteParams, ColDef } from "ag-grid/main";
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
    private executePivotOff();
    private executePivotOn(rootNode);
    private setUniqueValues(newValues);
    private bucketUpRowNodes(rootNode);
    private bucketRowNode(rowNode, uniqueValues);
    private bucketChildren(children, pivotColumns, pivotIndex, uniqueValues);
    getPivotColumnDefs(): ColDef[];
}
