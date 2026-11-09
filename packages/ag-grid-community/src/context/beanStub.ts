import type { AgBeanStubEvent } from 'ag-stack';
import { AgAbstractBean, _throttleToFrame } from 'ag-stack';

import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { ErrorId, LogArgs } from '../validation/errorMessages/errorText';
import type { BeanCollection } from './context';

/**
 * Base class for all grid beans. Beyond the ag-stack `AgAbstractBean` machinery, it exposes typed
 * `warn`/`error`/`deprecated` helpers that route through the grid-scoped `log` bean, so a bean reports
 * a diagnostic with `this.warn(id)` and it is attributed to the emitting grid by construction.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export abstract class BeanStub<TEventType extends string = AgBeanStubEvent> extends AgAbstractBean<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
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

    /** Wraps `callback` so calls within one animation frame run it once, and never after destroy. */
    protected throttleToFrame(callback: () => void): () => void {
        return _throttleToFrame(this, () => this.beans, callback);
    }
}
