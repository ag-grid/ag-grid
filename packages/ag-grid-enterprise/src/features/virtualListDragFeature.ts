import type {
    AgEvent,
    AgEventTypeParams,
    AgGridCommon,
    BeanCollection,
    Component,
    DragSourceType,
    GridOptionsService,
    GridOptionsWithDefaults,
} from 'ag-grid-community';

import { AgVirtualListDragFeature } from '../agStack/agVirtualListDragFeature';

export class VirtualListDragFeature<
    TParentComponent extends Component<any>,
    TChildComponent extends Component<any>,
    TDragValue,
    TDragStartEvent extends AgEvent,
    TDragEndEvent extends AgEvent,
> extends AgVirtualListDragFeature<
    BeanCollection,
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
