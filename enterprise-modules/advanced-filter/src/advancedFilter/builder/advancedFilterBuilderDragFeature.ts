import type { AgEvent } from '@ag-grid-community/core';
import { BeanStub, DragSourceType } from '@ag-grid-community/core';
import { type VirtualList, VirtualListDragFeature, type VirtualListDragItem } from '@ag-grid-enterprise/core';

import type { AdvancedFilterBuilderComp } from './advancedFilterBuilderComp';
import type { AdvancedFilterBuilderItemComp } from './advancedFilterBuilderItemComp';
import type { AdvancedFilterBuilderItem } from './iAdvancedFilterBuilder';

export interface AdvancedFilterBuilderDragStartedEvent extends AgEvent<'advancedFilterBuilderDragStarted'> {
    item: AdvancedFilterBuilderItem;
}

export type AdvancedFilterBuilderDragFeatureEvent =
    | 'advancedFilterBuilderDragStarted'
    | 'advancedFilterBuilderDragEnded';
export class AdvancedFilterBuilderDragFeature extends BeanStub<AdvancedFilterBuilderDragFeatureEvent> {
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
                listItemDragStartEvent: 'advancedFilterBuilderDragStarted',
                listItemDragEndEvent: 'advancedFilterBuilderDragEnded',
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
