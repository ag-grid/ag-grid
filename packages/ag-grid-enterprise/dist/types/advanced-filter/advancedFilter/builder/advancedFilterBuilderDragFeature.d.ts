import { AgEvent, BeanStub, VirtualList } from "ag-grid-community";
import { AdvancedFilterBuilderComp } from "./advancedFilterBuilderComp";
import { AdvancedFilterBuilderItem } from "./iAdvancedFilterBuilder";
export interface AdvancedFilterBuilderDragStartedEvent extends AgEvent {
    item: AdvancedFilterBuilderItem;
}
export declare class AdvancedFilterBuilderDragFeature extends BeanStub {
    private readonly comp;
    private readonly virtualList;
    static readonly EVENT_DRAG_STARTED = "advancedFilterBuilderDragStarted";
    static readonly EVENT_DRAG_ENDED = "advancedFilterBuilderDragEnded";
    constructor(comp: AdvancedFilterBuilderComp, virtualList: VirtualList);
    private postConstruct;
    private getCurrentDragValue;
    private moveItem;
}
