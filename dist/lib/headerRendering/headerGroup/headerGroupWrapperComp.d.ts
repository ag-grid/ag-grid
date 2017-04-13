// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Component } from "../../widgets/component";
import { Column } from "../../entities/column";
import { ColumnGroup } from "../../entities/columnGroup";
import { DropTarget } from "../../dragAndDrop/dragAndDropService";
export declare class HeaderGroupWrapperComp extends Component {
    private static TEMPLATE;
    private gridOptionsWrapper;
    private columnController;
    private dragService;
    private dragAndDropService;
    private context;
    private componentProvider;
    private gridApi;
    private columnApi;
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
    private addAttributes();
    private appendHeaderGroupComp(displayName);
    private addClasses();
    private setupMove(eHeaderGroup, displayName);
    getAllColumnsInThisGroup(): Column[];
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
