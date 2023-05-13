// Type definitions for @ag-grid-community/core v29.3.5
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
export declare class CenterWidthFeature extends BeanStub {
    private readonly callback;
    private readonly addSpacer;
    private columnModel;
    private scrollVisibleService;
    constructor(callback: (width: number) => void, addSpacer?: boolean);
    private postConstruct;
    private setWidth;
}
