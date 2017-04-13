// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Component } from "../../widgets/component";
import { Column } from "../../entities/column";
import { DropTarget } from "../../dragAndDrop/dragAndDropService";
export declare class HeaderWrapperComp extends Component {
    private static TEMPLATE;
    private gridOptionsWrapper;
    private dragAndDropService;
    private columnController;
    private horizontalDragService;
    private context;
    private menuFactory;
    private gridApi;
    private columnApi;
    private sortController;
    private eventService;
    private componentProvider;
    private columnHoverService;
    private eResize;
    private cbSelectAll;
    private column;
    private eRoot;
    private dragSourceDropTarget;
    private pinned;
    private startWidth;
    constructor(column: Column, eRoot: HTMLElement, dragSourceDropTarget: DropTarget, pinned: string);
    getColumn(): Column;
    init(): void;
    private addColumnHoverListener();
    private onColumnHover();
    private setupSortableClass(enableSorting);
    private onFilterChanged();
    private appendHeaderComp(displayName, enableSorting, enableMenu);
    private onColumnMovingChanged();
    private setupMove(eHeaderCellLabel, displayName);
    private setupResize();
    onDragging(dragChange: number, finished: boolean): void;
    onDragStart(): void;
    private setupTooltip();
    private setupMovingCss();
    private addAttributes();
    private setupWidth();
    private onColumnWidthChanged();
    private normaliseDragChange(dragChange);
}
