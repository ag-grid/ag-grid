import { _getOwn } from 'ag-stack';

const FLOATING_FILTER_TYPES: { [filter: string]: string } = {
    agSetColumnFilter: 'agSetColumnFloatingFilter',
    agMultiColumnFilter: 'agMultiColumnFloatingFilter',
    agGroupColumnFilter: 'agGroupColumnFloatingFilter',
    agNumberColumnFilter: 'agNumberColumnFloatingFilter',
    agBigIntColumnFilter: 'agBigIntColumnFloatingFilter',
    agDateColumnFilter: 'agDateColumnFloatingFilter',
    agTextColumnFilter: 'agTextColumnFloatingFilter',
};

/**
 * The floating filter of the provided filter a resolved filter's `key` names.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _getDefaultFloatingFilterType = (key: string | undefined): string | undefined =>
    key === undefined ? undefined : _getOwn(FLOATING_FILTER_TYPES, key);

const GRID_FLOATING_FILTER_NAMES = new Set<unknown>([
    ...Object.values(FLOATING_FILTER_TYPES),
    'agReadOnlyFloatingFilter',
]);

/** Whether a `floatingFilterComponent` is the author's rather than one of the grid's floating filters. */
export const _isAuthorFloatingFilter = (floatingFilterComponent: unknown): boolean =>
    !!floatingFilterComponent &&
    floatingFilterComponent !== true &&
    !GRID_FLOATING_FILTER_NAMES.has(floatingFilterComponent);
