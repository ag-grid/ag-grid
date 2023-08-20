import { Component, DropTarget, Column, AgEvent } from "@ag-grid-community/core";
import { TDropZone } from "./baseDropZonePanel";
export interface ColumnRemoveEvent extends AgEvent {
}
export declare class DropZoneColumnComp extends Component {
    private column;
    private dragSourceDropTarget;
    private ghost;
    private dropZonePurpose;
    private horizontal;
    static EVENT_COLUMN_REMOVE: string;
    private static TEMPLATE;
    private readonly dragAndDropService;
    private readonly columnModel;
    private readonly popupService;
    private readonly aggFuncService;
    private readonly sortController;
    private eText;
    private eDragHandle;
    private eButton;
    private eSortIndicator;
    private displayName;
    private popupShowing;
    constructor(column: Column, dragSourceDropTarget: DropTarget, ghost: boolean, dropZonePurpose: TDropZone, horizontal: boolean);
    init(): void;
    private setupAria;
    private setupTooltip;
    setupSort(): void;
    private addDragSource;
    private createDragItem;
    private setupComponents;
    private setupRemove;
    private getColumnAndAggFuncName;
    private setTextValue;
    private onShowAggFuncSelection;
    private createAggSelect;
    private addElementClasses;
    private isAggregationZone;
    private isGroupingZone;
}
