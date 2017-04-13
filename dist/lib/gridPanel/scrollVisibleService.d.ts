// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
export interface SetScrollsVisibleParams {
    vBody: boolean;
    hBody: boolean;
    vPinnedLeft: boolean;
    vPinnedRight: boolean;
}
export declare class ScrollVisibleService {
    private eventService;
    private columnController;
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
