// Type definitions for ag-grid v7.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ColumnGroup } from "../entities/columnGroup";
import { Column } from "../entities/column";
import { IRenderedHeaderElement } from "./iRenderedHeaderElement";
import { DropTarget } from "../dragAndDrop/dragAndDropService";
export declare class RenderedHeaderGroupCell implements IRenderedHeaderElement {
    private filterManager;
    private gridOptionsWrapper;
    private dragService;
    private columnController;
    private dragAndDropService;
    private eHeaderGroupCell;
    private eHeaderCellResize;
    private columnGroup;
    private dragSourceDropTarget;
    private groupWidthStart;
    private childrenWidthStarts;
    private destroyFunctions;
    private eRoot;
    private displayName;
    private pinned;
    constructor(columnGroup: ColumnGroup, eRoot: HTMLElement, dragSourceDropTarget: DropTarget, pinned: string);
    getGui(): HTMLElement;
    onIndividualColumnResized(column: Column): void;
    init(): void;
    private setupLabel();
    private addClasses();
    private setupResize();
    private isSuppressMoving();
    private setupMove();
    getAllColumnsInThisGroup(): Column[];
    private setWidth();
    destroy(): void;
    private addGroupExpandIcon(eGroupCellLabel);
    onDragStart(): void;
    private normaliseDragChange(dragChange);
    onDragging(dragChange: any, finished: boolean): void;
}
