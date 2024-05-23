import type { AgEvent, VirtualList, VirtualListDragItem } from '@ag-grid-community/core';
import { BeanStub, DragSourceType, VirtualListDragFeature } from '@ag-grid-community/core';

import type { AdvancedFilterBuilderComp } from './advancedFilterBuilderComp';
import type { AdvancedFilterBuilderItemComp } from './advancedFilterBuilderItemComp';
import type { AdvancedFilterBuilderItem } from './iAdvancedFilterBuilder';

export interface AdvancedFilterBuilderDragStartedEvent extends AgEvent {
    item: AdvancedFilterBuilderItem;
}

export class AdvancedFilterBuilderDragFeature extends BeanStub {
    public static readonly EVENT_DRAG_STARTED = 'advancedFilterBuilderDragStarted';
    public static readonly EVENT_DRAG_ENDED = 'advancedFilterBuilderDragEnded';

    constructor(
        private readonly comp: AdvancedFilterBuilderComp,
        private readonly virtualList: VirtualList
    ) {
        super();
    }

    public postConstruct(): void {
        this.createManagedBean(
            new VirtualListDragFeature<
                AdvancedFilterBuilderComp,
                AdvancedFilterBuilderItemComp,
                AdvancedFilterBuilderItem,
                AdvancedFilterBuilderDragStartedEvent
            >(this.comp, this.virtualList, {
                dragSourceType: DragSourceType.AdvancedFilterBuilder,
                listItemDragStartEvent: AdvancedFilterBuilderDragFeature.EVENT_DRAG_STARTED,
                listItemDragEndEvent: AdvancedFilterBuilderDragFeature.EVENT_DRAG_ENDED,
                eventSource: this,
                getCurrentDragValue: (listItemDragStartEvent: AdvancedFilterBuilderDragStartedEvent) =>
                    this.getCurrentDragValue(listItemDragStartEvent),
                isMoveBlocked: () => false,
                getNumRows: (comp: AdvancedFilterBuilderComp) => comp.getNumItems(),
                moveItem: (
                    currentDragValue: AdvancedFilterBuilderItem | null,
                    lastHoveredListItem: VirtualListDragItem<AdvancedFilterBuilderItemComp> | null
                ) => this.moveItem(currentDragValue, lastHoveredListItem),
            })
        );
    }

    private getCurrentDragValue(
        listItemDragStartEvent: AdvancedFilterBuilderDragStartedEvent
    ): AdvancedFilterBuilderItem {
        return listItemDragStartEvent.item;
    }

    private moveItem(
        currentDragValue: AdvancedFilterBuilderItem | null,
        lastHoveredListItem: VirtualListDragItem<AdvancedFilterBuilderItemComp> | null
    ): void {
        this.comp.moveItem(currentDragValue, lastHoveredListItem);
    }
}
