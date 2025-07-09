import type { GridOptions } from '../entities/gridOptions';
import type { AgEventType } from '../eventTypes';
import type { AgEventListener, AgEventTypeParams, AllEventsWithoutGridCommon } from '../events';
import type { GRID_OPTION_DEFAULTS } from '../gridOptionsDefault';
import type { BooleanProps, GridOptionsService, PropertyChangedSource } from '../gridOptionsService';
import type { Bean } from './bean';
import type { BeanCollection, BeanName, Context } from './context';
import type { AgBeanStubEvent } from './newContext/agBeanStub';
import { AgBeanStub } from './newContext/agBeanStub';

export abstract class BeanStub<TEventType extends string = AgBeanStubEvent> extends AgBeanStub<
    BeanName,
    BeanCollection,
    Bean,
    Context,
    AgEventListener<any, any, any>,
    TEventType,
    AgEventType,
    AgEventTypeParams,
    AllEventsWithoutGridCommon,
    GridOptions,
    typeof GRID_OPTION_DEFAULTS,
    BooleanProps,
    PropertyChangedSource,
    'gridPropertyChanged',
    GridOptionsService
> {
    protected override propertiesChangedEventType = 'gridPropertyChanged' as const;
}
