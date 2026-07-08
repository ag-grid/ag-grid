import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { ErrorId, ErrorMap, GetErrorParams } from './errorMessages/errorText';
import { _deprecatedG, _errorG, _warnG } from './logging';

/**
 * Grid-scoped façade over the free logging functions. Because a bean intrinsically knows its own grid,
 * routing a diagnostic through `this.beans.log` attributes it to the emitting grid whether it is logged
 * synchronously or from a deferred/async callback — no active-grid scope to establish. Console output is
 * identical to the free `_warn`/`_error`/`_deprecated`; only the captured diagnostic gains attribution.
 */
export class LogService extends BeanStub implements NamedBean {
    beanName = 'log' as const;

    private gridId: string;

    public wireBeans(beans: BeanCollection): void {
        this.gridId = beans.context.getId();
    }

    public warn<
        TId extends ErrorId,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        TShowMessageAtCallLocation = ErrorMap[TId],
    >(...args: GetErrorParams<TId> extends undefined ? [id: TId] : [id: TId, params: GetErrorParams<TId>]): void {
        _warnG(this.gridId, args[0], args[1] as any);
    }

    public deprecated<
        TId extends ErrorId,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        TShowMessageAtCallLocation = ErrorMap[TId],
    >(...args: GetErrorParams<TId> extends undefined ? [id: TId] : [id: TId, params: GetErrorParams<TId>]): void {
        _deprecatedG(this.gridId, args[0], args[1] as any);
    }

    public error<
        TId extends ErrorId,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        TShowMessageAtCallLocation = ErrorMap[TId],
    >(...args: GetErrorParams<TId> extends undefined ? [id: TId] : [id: TId, params: GetErrorParams<TId>]): void {
        _errorG(this.gridId, args[0], args[1] as any);
    }
}
