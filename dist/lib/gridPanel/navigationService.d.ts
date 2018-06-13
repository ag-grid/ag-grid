// Type definitions for ag-grid v18.0.1
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
    private init();
    registerGridComp(gridPanel: GridPanel): void;
    handlePageScrollingKey(event: KeyboardEvent): boolean;
    private onPageDown(gridCell);
    private onPageUp(gridCell);
    private navigateTo(scrollIndex, scrollType, scrollColumn, focusIndex, focusColumn);
    private onCtrlUpOrDown(key, gridCell);
    private onCtrlLeftOrRight(key, gridCell);
    private onHomeOrEndKey(key);
}
