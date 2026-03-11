import type { AgBeanStubEvent } from '../agStack/core/agBeanStub';
import { AgBeanStub } from '../agStack/core/agBeanStub';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { BeanCollection } from './context';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export abstract class BeanStub<TEventType extends string = AgBeanStubEvent> extends AgBeanStub<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    TEventType
> {}
