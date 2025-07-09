import type { GridOptions } from '../../entities/gridOptions';
import type { AgEventType } from '../../eventTypes';
import type { AgEventListener, AgEventTypeParams, AllEventsWithoutGridCommon } from '../../events';
import type { GRID_OPTION_DEFAULTS } from '../../gridOptionsDefault';
import type { BooleanProps, GridOptionsService, PropertyChangedSource } from '../../gridOptionsService';
import type { Bean } from '../bean';
import type { BeanCollection, BeanName, Context } from '../context';
import type { AgBeanStubEvent } from './agBeanStub';
import { AgBeanStub } from './agBeanStub';

export abstract class GridBeanStub<TEventType extends string = AgBeanStubEvent> extends AgBeanStub<
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
    keyof typeof GRID_OPTION_DEFAULTS,
    BooleanProps,
    PropertyChangedSource,
    'gridPropertyChanged',
    GridOptionsService
> {
    protected override propertiesChangedEventType = 'gridPropertyChanged' as const;
}
