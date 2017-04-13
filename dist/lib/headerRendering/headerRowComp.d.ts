// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Component } from "../widgets/component";
import { DropTarget } from "../dragAndDrop/dragAndDropService";
import { IComponent } from "../interfaces/iComponent";
export declare enum HeaderRowType {
    COLUMN_GROUP = 0,
    COLUMN = 1,
    FLOATING_FILTER = 2,
}
export declare class HeaderRowComp extends Component {
    private gridOptionsWrapper;
    private columnController;
    private context;
    private eventService;
    private filterManager;
    private componentProvider;
    private dept;
    private pinned;
    private headerElements;
    private eRoot;
    private dropTarget;
    private type;
    constructor(dept: number, type: HeaderRowType, pinned: string, eRoot: HTMLElement, dropTarget: DropTarget);
    forEachHeaderElement(callback: (comp: IComponent<any>) => void): void;
    destroy(): void;
    private removeAndDestroyChildComponents(idsToDestroy);
    private onRowHeightChanged();
    private init();
    private onColumnResized();
    private setWidth();
    private onGridColumnsChanged();
    private removeAndDestroyAllChildComponents();
    private onDisplayedColumnsChanged();
    private onVirtualColumnsChanged();
    private isUsingOldHeaderRenderer(column);
    private createHeaderElement(columnGroupChild);
    private createFloatingFilterWrapper(column);
    private createFloatingFilterParams<M, F>(column);
}
