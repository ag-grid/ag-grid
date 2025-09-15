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
import { _isStopPropagationForAgGrid, _stopPropagationForAgGrid } from 'ag-grid-community';

import type { VirtualListParams } from '../agStack/agVirtualList';
import { AgVirtualList } from '../agStack/agVirtualList';

const STOP_PROPAGATION_CALLBACKS = {
    isStopPropagation: _isStopPropagationForAgGrid,
    stopPropagation: _stopPropagationForAgGrid,
};

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
        super(STOP_PROPAGATION_CALLBACKS, params);
    }
}
