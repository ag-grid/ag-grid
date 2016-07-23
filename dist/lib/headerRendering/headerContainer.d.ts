// Type definitions for ag-grid v5.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { IRenderedHeaderElement } from "./iRenderedHeaderElement";
export declare class HeaderContainer {
    private gridOptionsWrapper;
    private context;
    private $scope;
    private dragAndDropService;
    private columnController;
    private gridPanel;
    private eventService;
    private eContainer;
    private eViewport;
    private eRoot;
    private headerRowComps;
    private pinned;
    private dropTarget;
    constructor(eContainer: HTMLElement, eViewport: HTMLElement, eRoot: HTMLElement, pinned: string);
    setWidth(width: number): void;
    forEachHeaderElement(callback: (renderedHeaderElement: IRenderedHeaderElement) => void): void;
    private init();
    destroy(): void;
    private onGridColumnsChanged();
    refresh(): void;
    private setupDragAndDrop();
    private removeHeaderRowComps();
    private createHeaderRowComps();
}
