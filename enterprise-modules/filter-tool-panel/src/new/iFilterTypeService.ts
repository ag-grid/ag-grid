import type { AgColumn } from '@ag-grid-community/core';

export interface FilterTypeService<P, M, C> {
    getParams(filterConfig: C, model?: M | null): P;

    updateParams(oldParams: P | undefined, newParams: P, filterConfig: C): P;

    getFilterConfig(column: AgColumn): C;

    getModel(params: P): M | null;

    getSummary(model: M | null): string;
}
