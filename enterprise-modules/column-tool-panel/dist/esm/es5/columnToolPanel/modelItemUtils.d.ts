import { ColumnModelItem } from "./columnModelItem";
import { ColumnModel, ColumnEventType, IAggFuncService, Column } from "@ag-grid-community/core";
export declare class ModelItemUtils {
    aggFuncService: IAggFuncService;
    columnModel: ColumnModel;
    private gridOptionsWrapper;
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
