import type { Column } from '@ag-grid-community/core';

export interface FilterTypeService<P, M, C> {
    readonly type: 'simple' | 'set';

    getParams(filterConfig: C, model?: M | null): P;

    updateParams(oldParams: P | undefined, newParams: P, filterConfig: C): P;

    getFilterConfig(column: Column): C;

    getModel(params: P): M | null;

    hasModelChanged(oldParams: P, newParams: P): boolean;

    getSummary(model: M | null): string;
}
