import { AgEvent, BeanStub, DragSourceType, PostConstruct, VirtualList, VirtualListDragFeature, VirtualListDragItem } from "@ag-grid-community/core";
import { AdvancedFilterBuilderComp } from "./advancedFilterBuilderComp";
import { AdvancedFilterBuilderItemComp } from "./advancedFilterBuilderItemComp";
import { AdvancedFilterBuilderItem } from "./iAdvancedFilterBuilder";

export interface AdvancedFilterBuilderDragStartedEvent extends AgEvent {
    item: AdvancedFilterBuilderItem;
}

export class AdvancedFilterBuilderDragFeature extends BeanStub {
    public static readonly DRAG_STARTED_EVENT = 'advancedFilterBuilderDragStarted';
    public static readonly DRAG_ENDED_EVENT = 'advancedFilterBuilderDragEnded';

    constructor(
        private readonly comp: AdvancedFilterBuilderComp,
        private readonly virtualList: VirtualList
    ) { super(); }

    @PostConstruct
    private postConstruct(): void {
        this.createManagedBean(new VirtualListDragFeature<
            AdvancedFilterBuilderComp,
            AdvancedFilterBuilderItemComp,
            AdvancedFilterBuilderItem,
            AdvancedFilterBuilderDragStartedEvent
        >(
            this.comp,
            this.virtualList,
            {
                dragSourceType: DragSourceType.AdvancedFilterBuilder,
                listItemDragStartEvent: AdvancedFilterBuilderDragFeature.DRAG_STARTED_EVENT,
                listItemDragEndEvent: AdvancedFilterBuilderDragFeature.DRAG_ENDED_EVENT,
                eventSource: this,
                getCurrentDragValue: (listItemDragStartEvent: AdvancedFilterBuilderDragStartedEvent) => this.getCurrentDragValue(listItemDragStartEvent),
                isMoveBlocked: () => false,
                getNumRows: (comp: AdvancedFilterBuilderComp) => comp.getNumItems(),
                moveItem: (
                    currentDragValue: AdvancedFilterBuilderItem | null,
                    lastHoveredListItem: VirtualListDragItem<AdvancedFilterBuilderItemComp> | null
                ) => this.moveItem(currentDragValue, lastHoveredListItem)
            }
        ));
    }

    private getCurrentDragValue(listItemDragStartEvent: AdvancedFilterBuilderDragStartedEvent): AdvancedFilterBuilderItem {
        return listItemDragStartEvent.item;
    }

    private moveItem(currentDragValue: AdvancedFilterBuilderItem | null, lastHoveredListItem: VirtualListDragItem<AdvancedFilterBuilderItemComp> | null): void {
        this.comp.moveItem(currentDragValue, lastHoveredListItem);
    }
}