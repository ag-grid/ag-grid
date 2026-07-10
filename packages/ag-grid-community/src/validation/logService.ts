import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { ErrorId, LogArgs } from './errorMessages/errorText';
import { _deprecatedForGrid, _errorForGrid, _warnForGrid } from './logging';

/**
 * Grid-scoped façade over the free logging functions. Because a bean intrinsically knows its own grid,
 * routing a diagnostic through `this.beans.log` attributes it to the emitting grid whether it is logged
 * synchronously or from a deferred/async callback — no active-grid scope to establish. Console output is
 * identical to the free `_warnWithoutAttribution`/`_errorWithoutAttribution`; only the captured
 * diagnostic gains attribution.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export class LogService extends BeanStub implements NamedBean {
    beanName = 'log' as const;

    private gridId: string;

    public wireBeans(beans: BeanCollection): void {
        this.gridId = beans.context.getId();
    }

    public override warn<TId extends ErrorId>(...args: LogArgs<TId>): void {
        _warnForGrid(this.gridId, args[0], args[1] as any);
    }

    public override deprecated<TId extends ErrorId>(...args: LogArgs<TId>): void {
        _deprecatedForGrid(this.gridId, args[0], args[1] as any);
    }

    public override error<TId extends ErrorId>(...args: LogArgs<TId>): void {
        _errorForGrid(this.gridId, args[0], args[1] as any);
    }
}
