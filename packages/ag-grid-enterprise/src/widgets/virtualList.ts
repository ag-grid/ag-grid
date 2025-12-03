import { _STOP_PROPAGATION_CALLBACKS } from 'ag-grid-community';
import type {
    AgEventTypeParams,
    AgGridCommon,
    Component,
    GridOptionsService,
    GridOptionsWithDefaults,
    _AgComponentSelectorType,
    _BeanCollection,
    _ComponentEvent,
} from 'ag-grid-community';

import type { VirtualListParams } from '../agStack/agVirtualList';
import { AgVirtualList } from '../agStack/agVirtualList';

export class VirtualList<
    C extends Component<any> = Component<any>,
    V = any,
    TEventType extends string = _ComponentEvent,
> extends AgVirtualList<
    _BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    _AgComponentSelectorType,
    C,
    V,
    TEventType
> {
    constructor(params?: VirtualListParams<C>) {
        super(_STOP_PROPAGATION_CALLBACKS, params);
    }
}
