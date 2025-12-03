import type {
    AgEvent,
    AgEventTypeParams,
    AgGridCommon,
    Component,
    DragSourceType,
    GridOptionsService,
    GridOptionsWithDefaults,
    _BeanCollection,
} from 'ag-grid-community';

import { AgVirtualListDragFeature } from '../agStack/agVirtualListDragFeature';

export class VirtualListDragFeature<
    TParentComponent extends Component<any>,
    TChildComponent extends Component<any>,
    TDragValue,
    TDragStartEvent extends AgEvent,
    TDragEndEvent extends AgEvent,
> extends AgVirtualListDragFeature<
    _BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    DragSourceType,
    TParentComponent,
    TChildComponent,
    TDragValue,
    TDragStartEvent,
    TDragEndEvent
> {}
