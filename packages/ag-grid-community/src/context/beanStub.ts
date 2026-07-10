import type { AgBeanStubEvent } from 'ag-stack';
import { AgBeanStub } from 'ag-stack';

import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { ErrorId, LogArgs } from '../validation/errorMessages/errorText';
import type { BeanCollection } from './context';

/**
 * Base class for all grid beans. Beyond the ag-stack `AgBeanStub` machinery, it exposes typed
 * `warn`/`error`/`deprecated` helpers that route through the grid-scoped `log` bean, so a bean reports
 * a diagnostic with `this.warn(id)` and it is attributed to the emitting grid by construction.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export abstract class BeanStub<TEventType extends string = AgBeanStubEvent> extends AgBeanStub<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    TEventType
> {
    public warn<TId extends ErrorId>(...args: LogArgs<TId>): void {
        this.beans.log.warn<TId>(...args);
    }

    public error<TId extends ErrorId>(...args: LogArgs<TId>): void {
        this.beans.log.error<TId>(...args);
    }

    public deprecated<TId extends ErrorId>(...args: LogArgs<TId>): void {
        this.beans.log.deprecated<TId>(...args);
    }
}
