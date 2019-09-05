// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../widgets/component";
import { Column } from "../../entities/column";
import { DropTarget } from "../../dragAndDrop/dragAndDropService";
import { ColDef } from "../../entities/colDef";
export declare class HeaderWrapperComp extends Component {
    private static TEMPLATE;
    private gridOptionsWrapper;
    private dragAndDropService;
    private columnController;
    private horizontalResizeService;
    private menuFactory;
    private gridApi;
    private columnApi;
    private sortController;
    private eventService;
    private userComponentFactory;
    private columnHoverService;
    private beans;
    private eResize;
    private cbSelectAll;
    private readonly column;
    private readonly dragSourceDropTarget;
    private readonly pinned;
    private resizeStartWidth;
    private resizeWithShiftKey;
    constructor(column: Column, dragSourceDropTarget: DropTarget, pinned: string);
    getColumn(): Column;
    getComponentHolder(): ColDef;
    init(): void;
    private addColumnHoverListener;
    private onColumnHover;
    private setupSortableClass;
    private onFilterChanged;
    private appendHeaderComp;
    private afterHeaderCompCreated;
    private onColumnMovingChanged;
    private setupMove;
    private createDragItem;
    private setupResize;
    onResizing(finished: boolean, resizeAmount: number): void;
    onResizeStart(shiftKey: boolean): void;
    getTooltipText(): string | undefined;
    private setupTooltip;
    private setupMovingCss;
    private addAttributes;
    private setupWidth;
    private setupMenuClass;
    private onMenuVisible;
    private onColumnWidthChanged;
    private normaliseResizeAmount;
}
