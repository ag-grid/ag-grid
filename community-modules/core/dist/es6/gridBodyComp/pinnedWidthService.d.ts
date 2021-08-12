// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
export declare class PinnedWidthService extends BeanStub {
    private columnModel;
    private leftWidth;
    private rightWidth;
    private postConstruct;
    private checkContainerWidths;
    getPinnedRightWidth(): number;
    getPinnedLeftWidth(): number;
}
