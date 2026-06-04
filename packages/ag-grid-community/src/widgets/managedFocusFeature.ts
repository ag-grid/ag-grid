import type { ManagedFocusCallbacks, StopPropagationCallbacks } from 'ag-stack';
import { AgManagedFocusFeature } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { AgGridCommon } from '../interfaces/iCommon';
import { _isStopPropagationForAgGrid, _stopPropagationForAgGrid } from '../utils/gridEvent';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const STOP_PROPAGATION_CALLBACKS: StopPropagationCallbacks = {
    isStopPropagation: _isStopPropagationForAgGrid,
    stopPropagation: _stopPropagationForAgGrid,
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class ManagedFocusFeature extends AgManagedFocusFeature<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService
> {
    constructor(eFocusable: HTMLElement, callbacks?: ManagedFocusCallbacks) {
        super(eFocusable, STOP_PROPAGATION_CALLBACKS, callbacks);
    }
}
