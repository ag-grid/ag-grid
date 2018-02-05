// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../widgets/component";
import { ColumnGroup } from "../../entities/columnGroup";
import { DragItem, DropTarget } from "../../dragAndDrop/dragAndDropService";
export declare class HeaderGroupWrapperComp extends Component {
    private static TEMPLATE;
    private gridOptionsWrapper;
    private columnController;
    private dragService;
    private dragAndDropService;
    private context;
    private componentRecipes;
    private gridApi;
    private columnApi;
    private beans;
    private columnGroup;
    private dragSourceDropTarget;
    private pinned;
    private eRoot;
    private eHeaderCellResize;
    private groupWidthStart;
    private childrenWidthStarts;
    private childColumnsDestroyFuncs;
    constructor(columnGroup: ColumnGroup, eRoot: HTMLElement, dragSourceDropTarget: DropTarget, pinned: string);
    private postConstruct();
    private setupMovingCss();
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
    onDragStart(): void;
    onDragging(dragChange: any, finished: boolean): void;
    private normaliseDragChange(dragChange);
}
