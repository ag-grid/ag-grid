import type { GridApi } from '../api/gridApi';
import type { BeanCollection } from '../context/context';

type LegacyFilterModeWarningId = 343 | 344 | 345 | 346 | 347;

type LegacyFilterMethodName =
    'getModel' | 'setModel' | 'isFilterActive' | 'doesFilterPass' | 'applyModel' | 'getModelFromUi';

/**
 * The legacy filter methods the grid calls on a filter instance.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export type LegacyFilterMethods<TFilter> = Pick<TFilter, Extract<keyof TFilter, LegacyFilterMethodName>>;

interface FilterWithGridMethods<TFilter> {
    /** Set by a filter whose public legacy methods report calls from the application. */
    gridMethods?: LegacyFilterMethods<TFilter>;
}

/**
 * Warns that a legacy filter feature is in use while `enableFilterHandlers` is unset.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _warnLegacyFilterMode(beans: BeanCollection, id: LegacyFilterModeWarningId): void {
    if (!beans.gos.exists('enableFilterHandlers')) {
        beans.log.warn(id);
    }
}

/**
 * Reports a `filterModified` listener the grid cannot see itself, such as a framework output.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _reportFilterModifiedListened(api: GridApi): void {
    api.dispatchEvent({ type: 'filterModifiedListened' });
}

/**
 * The object the grid calls a filter's legacy methods on, so a filter can tell the grid's calls apart from the
 * application's.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _legacyFilterMethods<TFilter extends object>(filter: TFilter): LegacyFilterMethods<TFilter> {
    return (filter as FilterWithGridMethods<TFilter>).gridMethods ?? filter;
}
