import type { AgBeanStubEvent } from '../agStack/agBeanStub';
import { AgBeanStub } from '../agStack/agBeanStub';
import type { AgEventListener, AgEventTypeParams, AllEventsWithoutGridCommon } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { BeanCollection } from './context';

export abstract class BeanStub<TEventType extends string = AgBeanStubEvent> extends AgBeanStub<
    BeanCollection,
    AgEventListener<any, any, any>,
    TEventType,
    AgEventTypeParams,
    AllEventsWithoutGridCommon,
    GridOptionsWithDefaults,
    GridOptionsService
> {}
