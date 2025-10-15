import { _STOP_PROPAGATION_CALLBACKS } from 'ag-grid-community';
import type {
    AgComponentSelectorType,
    AgEventTypeParams,
    AgGridCommon,
    BeanCollection,
    Component,
    ComponentEvent,
    GridOptionsService,
    GridOptionsWithDefaults,
} from 'ag-grid-community';

import type { VirtualListParams } from '../agStack/agVirtualList';
import { AgVirtualList } from '../agStack/agVirtualList';

export class VirtualList<
    C extends Component<any> = Component<any>,
    V = any,
    TEventType extends string = ComponentEvent,
> extends AgVirtualList<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType,
    C,
    V,
    TEventType
> {
    constructor(params?: VirtualListParams<C>) {
        super(_STOP_PROPAGATION_CALLBACKS, params);
    }
}
