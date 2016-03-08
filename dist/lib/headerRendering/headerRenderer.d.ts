// Type definitions for ag-grid v4.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Column } from "../entities/column";
export declare class HeaderRenderer {
    private gridOptionsWrapper;
    private columnController;
    private gridPanel;
    private context;
    private eventService;
    private pinnedLeftContainer;
    private pinnedRightContainer;
    private centerContainer;
    private eHeaderViewport;
    private eRoot;
    private eHeaderOverlay;
    private init();
    refreshHeader(): void;
    setPinnedColContainerWidth(): void;
    onIndividualColumnResized(column: Column): void;
}
