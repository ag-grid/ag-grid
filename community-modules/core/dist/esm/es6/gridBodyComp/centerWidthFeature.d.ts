// Type definitions for @ag-grid-community/core v29.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
export declare class CenterWidthFeature extends BeanStub {
    private columnModel;
    private callback;
    constructor(callback: (width: number) => void);
    private postConstruct;
    private setWidth;
}
