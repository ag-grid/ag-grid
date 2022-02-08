import { Component, DropTarget, Column, AgEvent } from "@ag-grid-community/core";
export interface ColumnRemoveEvent extends AgEvent {
}
export declare class DropZoneColumnComp extends Component {
    private column;
    private dragSourceDropTarget;
    private ghost;
    private valueColumn;
    private horizontal;
    static EVENT_COLUMN_REMOVE: string;
    private static TEMPLATE;
    private readonly dragAndDropService;
    private readonly columnModel;
    private readonly popupService;
    private readonly aggFuncService;
    private readonly columnApi;
    private readonly gridApi;
    private eText;
    private eDragHandle;
    private eButton;
    private displayName;
    private popupShowing;
    constructor(column: Column, dragSourceDropTarget: DropTarget, ghost: boolean, valueColumn: boolean, horizontal: boolean);
    init(): void;
    private setupTooltip;
    private addDragSource;
    private createDragItem;
    private setupComponents;
    private setupRemove;
    private getColumnAndAggFuncName;
    private setTextValue;
    private onShowAggFuncSelection;
    private createAggSelect;
    private addElementClasses;
}
