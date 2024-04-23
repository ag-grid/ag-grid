import { ColumnModelItem } from "./columnModelItem";
import { ColumnModel, ColumnEventType, IAggFuncService, Column, IAggFunc } from "ag-grid-community";
export declare class ModelItemUtils {
    aggFuncService: IAggFuncService;
    columnModel: ColumnModel;
    private gos;
    private eventService;
    selectAllChildren(colTree: ColumnModelItem[], selectAllChecked: boolean, eventType: ColumnEventType): void;
    setColumn(col: Column, selectAllChecked: boolean, eventType: ColumnEventType): void;
    setAllColumns(cols: Column[], selectAllChecked: boolean, eventType: ColumnEventType): void;
    private extractAllLeafColumns;
    private setAllVisible;
    private setAllPivot;
    private setAllPivotPassive;
    private setAllPivotActive;
    updateColumns(params: {
        columns: Column[];
        visibleState?: {
            [key: string]: boolean;
        };
        pivotState?: {
            [key: string]: {
                pivot?: boolean;
                rowGroup?: boolean;
                aggFunc?: string | IAggFunc | null;
            };
        };
        eventType: ColumnEventType;
    }): void;
    createPivotState(column: Column): {
        pivot?: boolean;
        rowGroup?: boolean;
        aggFunc?: string | IAggFunc | null;
    };
}
