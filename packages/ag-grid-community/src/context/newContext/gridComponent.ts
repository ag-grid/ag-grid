import type { GridOptions } from '../../entities/gridOptions';
import type { AgEventType } from '../../eventTypes';
import type { AgEventListener, AgEventTypeParams, AllEventsWithoutGridCommon } from '../../events';
import type { GRID_OPTION_DEFAULTS } from '../../gridOptionsDefault';
import type { BooleanProps, GridOptionsService, PropertyChangedSource } from '../../gridOptionsService';
import type { AgComponentSelector } from '../../widgets/component';
import type { Bean } from '../bean';
import type { BeanCollection, BeanName, Context } from '../context';
import type { AgComponentEvent } from './agComponent';
import { AgComponent } from './agComponent';

export abstract class GridComponent<TLocalEvent extends string = AgComponentEvent> extends AgComponent<
    GridComponent<any>,
    BeanName,
    BeanCollection,
    Bean,
    Context,
    AgEventListener<any, any, any>,
    TLocalEvent,
    AgEventType,
    AgEventTypeParams,
    AllEventsWithoutGridCommon,
    GridOptions,
    typeof GRID_OPTION_DEFAULTS,
    BooleanProps,
    PropertyChangedSource,
    'gridPropertyChanged',
    GridOptionsService,
    AgComponentSelector
> {
    protected override propertiesChangedEventType = 'gridPropertyChanged' as const;
}
