// Type definitions for @ag-grid-community/core v30.2.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AbstractFakeScrollComp } from "./abstractFakeScrollComp";
export declare class FakeVScrollComp extends AbstractFakeScrollComp {
    private static TEMPLATE;
    constructor();
    protected postConstruct(): void;
    protected setScrollVisible(): void;
    private onRowContainerHeightChanged;
    getScrollPosition(): number;
    setScrollPosition(value: number): void;
}
