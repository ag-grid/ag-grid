// Type definitions for ag-grid-community v19.1.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../widgets/component";
import { Column } from "../../entities/column";
import { DropTarget } from "../../dragAndDrop/dragAndDropService";
export declare class HeaderWrapperComp extends Component {
    private static TEMPLATE;
    private gridOptionsWrapper;
    private dragAndDropService;
    private columnController;
    private horizontalResizeService;
    private context;
    private menuFactory;
    private gridApi;
    private columnApi;
    private sortController;
    private eventService;
    private componentRecipes;
    private columnHoverService;
    private beans;
    private eResize;
    private cbSelectAll;
    private column;
    private dragSourceDropTarget;
    private pinned;
    private resizeStartWidth;
    private resizeWithShiftKey;
    constructor(column: Column, dragSourceDropTarget: DropTarget, pinned: string);
    getColumn(): Column;
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
    private setupTooltip;
    private setupMovingCss;
    private addAttributes;
    private setupWidth;
    private setupMenuClass;
    private onMenuVisible;
    private onColumnWidthChanged;
    private normaliseResizeAmount;
}
//# sourceMappingURL=headerWrapperComp.d.ts.map