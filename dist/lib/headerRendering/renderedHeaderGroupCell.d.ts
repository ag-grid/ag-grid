// Type definitions for ag-grid v7.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ColumnGroup } from "../entities/columnGroup";
import { Column } from "../entities/column";
import { DropTarget } from "../dragAndDrop/dragAndDropService";
import { Component } from "../widgets/component";
export declare class RenderedHeaderGroupCell extends Component {
    private filterManager;
    private gridOptionsWrapper;
    private dragService;
    private columnController;
    private dragAndDropService;
    private eHeaderCellResize;
    private columnGroup;
    private dragSourceDropTarget;
    private groupWidthStart;
    private childrenWidthStarts;
    private eRoot;
    private displayName;
    private pinned;
    constructor(columnGroup: ColumnGroup, eRoot: HTMLElement, dragSourceDropTarget: DropTarget, pinned: string);
    init(): void;
    private setupLabel();
    private addClasses();
    private setupResize();
    private isSuppressMoving();
    private setupMove();
    getAllColumnsInThisGroup(): Column[];
    private setWidth();
    private onWidthChanged();
    private addGroupExpandIcon(eGroupCellLabel);
    onDragStart(): void;
    private normaliseDragChange(dragChange);
    onDragging(dragChange: any, finished: boolean): void;
}
