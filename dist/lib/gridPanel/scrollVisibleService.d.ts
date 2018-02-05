// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export interface SetScrollsVisibleParams {
    vBody: boolean;
    hBody: boolean;
    vPinnedLeft: boolean;
    vPinnedRight: boolean;
}
export declare class ScrollVisibleService {
    private eventService;
    private columnController;
    private columnApi;
    private gridApi;
    private vBody;
    private hBody;
    private vPinnedLeft;
    private vPinnedRight;
    setScrollsVisible(params: SetScrollsVisibleParams): void;
    isVBodyShowing(): boolean;
    isHBodyShowing(): boolean;
    isVPinnedLeftShowing(): boolean;
    isVPinnedRightShowing(): boolean;
    getPinnedLeftWidth(): number;
    getPinnedLeftWithScrollWidth(): number;
    getPinnedRightWidth(): number;
    getPinnedRightWithScrollWidth(): number;
}
