import { AgTabGuardComp } from '../agStack/focus/agTabGuardComp';
import type { AgTabGuardParams } from '../agStack/focus/agTabGuardFeature';
import type { BeanCollection } from '../context/context';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { AgComponentSelectorType, ComponentEvent } from './component';
import { STOP_PROPAGATION_CALLBACKS } from './managedFocusFeature';

export class TabGuardComp<TLocalEvent extends string = ComponentEvent> extends AgTabGuardComp<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType,
    TLocalEvent
> {
    protected override initialiseTabGuard(params: AgTabGuardParams) {
        super.initialiseTabGuard(params, STOP_PROPAGATION_CALLBACKS);
    }
}
