// Type definitions for ag-grid v5.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
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
    destroy(): void;
    private removeAndDestroyChildComponents(idsToDestroy);
    private init();
    private onDisplayedColumnsChanged();
    private onVirtualColumnsChanged();
    private createHeaderElement(columnGroupChild);
}
