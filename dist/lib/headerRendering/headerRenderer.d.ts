// Type definitions for ag-grid v5.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
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
    private destroy();
    private onGridColumnsChanged();
    refreshHeader(): void;
    private setHeight();
    setPinnedColContainerWidth(): void;
}
