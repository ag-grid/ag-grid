import { ColumnModelItem } from "./columnModelItem";
import { ColumnController, ColumnEventType, IAggFuncService, Column } from "@ag-grid-community/core";
export declare class ModelItemUtils {
    aggFuncService: IAggFuncService;
    columnController: ColumnController;
    private gridOptionsWrapper;
    private columnApi;
    private gridApi;
    private eventService;
    selectAllChildren(colTree: ColumnModelItem[], selectAllChecked: boolean, eventType: ColumnEventType): void;
    setColumn(col: Column, selectAllChecked: boolean, eventType: ColumnEventType): void;
    setAllColumns(cols: Column[], selectAllChecked: boolean, eventType: ColumnEventType): void;
    private extractAllLeafColumns;
    private setAllVisible;
    private setAllPivot;
    private setAllPivotPassive;
    private setAllPivotActive;
}
