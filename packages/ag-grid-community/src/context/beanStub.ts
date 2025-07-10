import type { AgBeanStubEvent } from '../agStack/agBeanStub';
import { AgBeanStub } from '../agStack/agBeanStub';
import type { AgEventTypeParams, AllEventsWithoutGridCommon } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { BeanCollection } from './context';

export abstract class BeanStub<TEventType extends string = AgBeanStubEvent> extends AgBeanStub<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AllEventsWithoutGridCommon,
    GridOptionsService,
    TEventType
> {}
