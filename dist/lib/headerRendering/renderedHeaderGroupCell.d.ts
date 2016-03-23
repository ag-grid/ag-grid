// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { ColumnGroup } from "../entities/columnGroup";
import { Column } from "../entities/column";
import { IRenderedHeaderElement } from "./iRenderedHeaderElement";
export declare class RenderedHeaderGroupCell implements IRenderedHeaderElement {
    private filterManager;
    private gridOptionsWrapper;
    private $compile;
    private dragService;
    private columnController;
    private eHeaderGroupCell;
    private eHeaderCellResize;
    private columnGroup;
    private groupWidthStart;
    private childrenWidthStarts;
    private parentScope;
    private destroyFunctions;
    private eRoot;
    constructor(columnGroup: ColumnGroup, eRoot: HTMLElement, parentScope: any);
    refreshFilterIcon(): void;
    refreshSortIcon(): void;
    getGui(): HTMLElement;
    onIndividualColumnResized(column: Column): void;
    init(): void;
    private setWidthOfGroupHeaderCell();
    destroy(): void;
    private addGroupExpandIcon(eGroupCellLabel);
    onDragStart(): void;
    onDragging(dragChange: any, finished: boolean): void;
}
