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
