import type { AgBeanStubEvent } from '../agStack/agBeanStub';
import { AgBeanStub } from '../agStack/agBeanStub';
import type { GridOptions } from '../entities/gridOptions';
import type { AgEventListener, AgEventTypeParams, AllEventsWithoutGridCommon } from '../events';
import type { GRID_OPTION_DEFAULTS } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { BeanCollection } from './context';

export abstract class BeanStub<TEventType extends string = AgBeanStubEvent> extends AgBeanStub<
    BeanCollection,
    AgEventListener<any, any, any>,
    TEventType,
    AgEventTypeParams,
    AllEventsWithoutGridCommon,
    GridOptions,
    typeof GRID_OPTION_DEFAULTS,
    GridOptionsService
> {}
