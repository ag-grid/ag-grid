// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridPanel } from "./gridPanel";
export declare class NavigationService {
    private mouseEventService;
    private paginationProxy;
    private focusedCellController;
    private animationFrameService;
    private rangeController;
    private columnController;
    private gridOptionsWrapper;
    private scrollWidth;
    private gridPanel;
    private timeLastPageEventProcessed;
    private init;
    registerGridComp(gridPanel: GridPanel): void;
    handlePageScrollingKey(event: KeyboardEvent): boolean;
    private isTimeSinceLastPageEventToRecent;
    private setTimeLastPageEventProcessed;
    private onPageDown;
    private onPageUp;
    private navigateTo;
    private onCtrlUpOrDown;
    private onCtrlLeftOrRight;
    private onHomeOrEndKey;
}
