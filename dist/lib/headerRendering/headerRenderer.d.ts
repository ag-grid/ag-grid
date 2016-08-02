// Type definitions for ag-grid v5.0.7
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { IRenderedHeaderElement } from "./iRenderedHeaderElement";
export declare class HeaderRenderer {
    private gridOptionsWrapper;
    private columnController;
    private gridPanel;
    private context;
    private eventService;
    private pinnedLeftContainer;
    private pinnedRightContainer;
    private centerContainer;
    private childContainers;
    private eHeaderViewport;
    private eRoot;
    private eHeaderOverlay;
    private init();
    forEachHeaderElement(callback: (renderedHeaderElement: IRenderedHeaderElement) => void): void;
    private destroy();
    private onGridColumnsChanged();
    refreshHeader(): void;
    private setHeight();
    setPinnedColContainerWidth(): void;
}
