// Type definitions for @ag-grid-community/core v29.3.5
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../../context/beanStub";
export declare class SetPinnedRightWidthFeature extends BeanStub {
    private pinnedWidthService;
    private element;
    constructor(element: HTMLElement);
    private postConstruct;
    private onPinnedRightWidthChanged;
    getWidth(): number;
}
