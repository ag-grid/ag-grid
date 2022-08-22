// Type definitions for @ag-grid-community/core v28.1.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
import { RowGroupOpenedEvent } from "../events";
export declare class RowNodeEventThrottle extends BeanStub {
    private animationFrameService;
    private rowModel;
    private clientSideRowModel;
    private events;
    private dispatchExpandedDebounced;
    private postConstruct;
    dispatchExpanded(event: RowGroupOpenedEvent): void;
}
