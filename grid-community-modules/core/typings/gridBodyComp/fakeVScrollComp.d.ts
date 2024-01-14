import { AbstractFakeScrollComp } from "./abstractFakeScrollComp";
export declare class FakeVScrollComp extends AbstractFakeScrollComp {
    private static TEMPLATE;
    constructor();
    protected postConstruct(): void;
    protected setScrollVisible(): void;
    private onRowContainerHeightChanged;
    getScrollPosition(): number;
    setScrollPosition(value: number, force?: boolean): void;
}
