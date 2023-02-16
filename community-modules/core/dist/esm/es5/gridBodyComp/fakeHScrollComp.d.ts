// Type definitions for @ag-grid-community/core v29.1.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AbstractFakeScrollComp } from "./abstractFakeScrollComp";
export declare class FakeHScrollComp extends AbstractFakeScrollComp {
    private static TEMPLATE;
    private eLeftSpacer;
    private eRightSpacer;
    private columnModel;
    private pinnedRowModel;
    private enableRtl;
    constructor();
    protected postConstruct(): void;
    protected initialiseInvisibleScrollbar(): void;
    private onPinnedRowDataChanged;
    private refreshCompBottom;
    protected onScrollVisibilityChanged(): void;
    private setFakeHScrollSpacerWidths;
    protected setScrollVisible(): void;
}
