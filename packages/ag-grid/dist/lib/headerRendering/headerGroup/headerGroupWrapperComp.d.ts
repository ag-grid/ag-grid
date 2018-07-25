// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../widgets/component";
import { ColumnGroup } from "../../entities/columnGroup";
import { DragItem, DropTarget } from "../../dragAndDrop/dragAndDropService";
export declare class HeaderGroupWrapperComp extends Component {
    private static TEMPLATE;
    private gridOptionsWrapper;
    private columnController;
    private horizontalResizeService;
    private dragAndDropService;
    private context;
    private componentRecipes;
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
    private postConstruct();
    private setupMovingCss();
    private setupTooltip();
    private onColumnMovingChanged();
    private addAttributes();
    private appendHeaderGroupComp(displayName);
    private afterHeaderCompCreated(displayName, headerGroupComp);
    private addClasses();
    private setupMove(eHeaderGroup, displayName);
    getDragItemForGroup(): DragItem;
    private isSuppressMoving();
    private setupWidth();
    private onDisplayedChildrenChanged();
    private addListenersToChildrenColumns();
    private destroyListenersOnChildrenColumns();
    private onWidthChanged();
    private setupResize();
    onResizeStart(shiftKey: boolean): void;
    onResizing(finished: boolean, resizeAmount: any): void;
    private normaliseDragChange(dragChange);
}
