// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ColGroupDef } from "../../entities/colDef";
import { Component } from "../../widgets/component";
import { ColumnGroup } from "../../entities/columnGroup";
import { DragItem, DropTarget } from "../../dragAndDrop/dragAndDropService";
export declare class HeaderGroupWrapperComp extends Component {
    private static TEMPLATE;
    private gridOptionsWrapper;
    private columnController;
    private horizontalResizeService;
    private dragAndDropService;
    private userComponentFactory;
    private gridApi;
    private columnApi;
    private beans;
    private readonly columnGroup;
    private readonly dragSourceDropTarget;
    private readonly pinned;
    private eHeaderCellResize;
    private resizeCols;
    private resizeStartWidth;
    private resizeRatios;
    private resizeTakeFromCols;
    private resizeTakeFromStartWidth;
    private resizeTakeFromRatios;
    private childColumnsDestroyFuncs;
    constructor(columnGroup: ColumnGroup, dragSourceDropTarget: DropTarget, pinned: string);
    private postConstruct;
    private setupMovingCss;
    getColumn(): ColumnGroup;
    getComponentHolder(): ColGroupDef;
    getTooltipText(): string | undefined;
    private setupTooltip;
    private onColumnMovingChanged;
    private addAttributes;
    private appendHeaderGroupComp;
    private afterHeaderCompCreated;
    private addClasses;
    private setupMove;
    getDragItemForGroup(): DragItem;
    private isSuppressMoving;
    private setupWidth;
    private onDisplayedChildrenChanged;
    private addListenersToChildrenColumns;
    private destroyListenersOnChildrenColumns;
    private onWidthChanged;
    private setupResize;
    onResizeStart(shiftKey: boolean): void;
    onResizing(finished: boolean, resizeAmount: any): void;
    private normaliseDragChange;
}
