import { BeanStub } from "../context/beanStub";
import { RowGroupOpenedEvent } from "../events";
export declare class RowNodeEventThrottle extends BeanStub {
    private animationFrameService;
    private rowModel;
    private clientSideRowModel;
    private events;
    private dispatchExpandedDebounced;
    private postConstruct;
    dispatchExpanded(event: RowGroupOpenedEvent, forceSync?: boolean): void;
}
