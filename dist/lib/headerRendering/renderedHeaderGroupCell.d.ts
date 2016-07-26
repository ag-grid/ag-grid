// Type definitions for ag-grid v5.0.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
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
    constructor(columnGroup: ColumnGroup, eRoot: HTMLElement, dragSourceDropTarget: DropTarget);
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
    onDragging(dragChange: any, finished: boolean): void;
}
