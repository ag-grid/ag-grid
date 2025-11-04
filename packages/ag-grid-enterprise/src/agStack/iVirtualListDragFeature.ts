import type {
    AgEvent,
    _AgBeanStub,
    _AgCoreBeanCollection,
    _BaseEvents,
    _BaseProperties,
    _IPropertiesService,
} from 'ag-grid-community';

export interface VirtualListDragItem<R> {
    rowIndex: number;
    position: 'top' | 'bottom';
    component: R;
}

export interface AgVirtualListDragParams<
    TBeanCollection extends _AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends _BaseProperties,
    TGlobalEvents extends _BaseEvents,
    TCommon,
    TPropertiesService extends _IPropertiesService<TProperties, TCommon>,
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
        parent: _AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>,
        listItemDragStart: (event: TDragStartEvent) => void,
        listItemDragEnd: (event: TDragEndEvent) => void
    ) => void;
}
