import type { AgBeanStubEvent } from 'ag-stack';
import { AgBeanStub } from 'ag-stack';

import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { BeanCollection } from './context';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface BeanStub<TEventType extends string = AgBeanStubEvent> extends AgBeanStub<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    TEventType
> {}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const BeanStub = AgBeanStub as unknown as abstract new <
    TEventType extends string = AgBeanStubEvent,
>() => BeanStub<TEventType>;
