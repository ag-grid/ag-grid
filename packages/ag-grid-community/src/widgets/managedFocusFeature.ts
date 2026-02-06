import type { ManagedFocusCallbacks, StopPropagationCallbacks } from '../agStack/focus/agManagedFocusFeature';
import { AgManagedFocusFeature } from '../agStack/focus/agManagedFocusFeature';
import type { BeanCollection } from '../context/context';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { AgGridCommon } from '../interfaces/iCommon';
import { _isStopPropagationForAgGrid, _stopPropagationForAgGrid } from '../utils/gridEvent';

export const STOP_PROPAGATION_CALLBACKS: StopPropagationCallbacks = {
    isStopPropagation: _isStopPropagationForAgGrid,
    stopPropagation: _stopPropagationForAgGrid,
};

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
