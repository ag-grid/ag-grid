// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Component } from "../widgets/component";
import { DropTarget } from "../dragAndDrop/dragAndDropService";
export declare class HeaderRowComp extends Component {
    private gridOptionsWrapper;
    private columnController;
    private context;
    private eventService;
    private dept;
    private pinned;
    private headerElements;
    private eRoot;
    private dropTarget;
    private showingGroups;
    constructor(dept: number, showingGroups: boolean, pinned: string, eRoot: HTMLElement, dropTarget: DropTarget);
    forEachHeaderElement(callback: (comp: Component) => void): void;
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
}
