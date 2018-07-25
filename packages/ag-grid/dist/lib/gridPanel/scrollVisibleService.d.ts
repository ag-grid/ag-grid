// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export interface SetScrollsVisibleParams {
    bodyHorizontalScrollShowing: boolean;
    leftVerticalScrollShowing: boolean;
    rightVerticalScrollShowing: boolean;
}
export declare class ScrollVisibleService {
    private eventService;
    private columnController;
    private columnApi;
    private gridApi;
    private gridOptionsWrapper;
    private bodyHorizontalScrollShowing;
    private leftVerticalScrollShowing;
    private rightVerticalScrollShowing;
    setScrollsVisible(params: SetScrollsVisibleParams): void;
    isBodyHorizontalScrollShowing(): boolean;
    isLeftVerticalScrollShowing(): boolean;
    isRightVerticalScrollShowing(): boolean;
}
