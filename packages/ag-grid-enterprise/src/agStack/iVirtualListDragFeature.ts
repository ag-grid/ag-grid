import type { AgBeanStub, AgCoreBeanCollection, BaseEvents, BaseProperties, IPropertiesService } from 'ag-stack';

import type { AgEvent, VerticalSection } from 'ag-grid-community';

export interface VirtualListDragItem<R> {
    rowIndex: number;
    position: VerticalSection;
    component: R;
}

export interface AgVirtualListDragParams<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TDragSourceType extends number,
    TParentComponent,
    TChildComponent,
    TDragValue,
    TDragStartEvent extends AgEvent,
    TDragEndEvent extends AgEvent,
> {
    dragSourceType: TDragSourceType;
    getCurrentDragValue: (listItemDragStartEvent: TDragStartEvent) => TDragValue;
    isMoveBlocked: (currentDragValue: TDragValue | null) => boolean;
    getNumRows: (comp: TParentComponent) => number;
    moveItem: (
        currentDragValue: TDragValue | null,
        lastHoveredListItem: VirtualListDragItem<TChildComponent> | null
    ) => void;
    addListeners: (
        parent: AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>,
        listItemDragStart: (event: TDragStartEvent) => void,
        listItemDragEnd: (event: TDragEndEvent) => void
    ) => void;
}
