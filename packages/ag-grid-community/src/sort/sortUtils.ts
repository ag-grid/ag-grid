import type { AgColumn } from '../entities/agColumn';
import type { SortModelItem } from '../interfaces/iSortModelItem';
import type { SortService } from './sortService';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getSortModel(sortSvc: SortService | undefined): SortModelItem[] {
    const opts = sortSvc?.getSortOptions();
    if (!opts) {
        return [];
    }
    const len = opts.length;
    const model: SortModelItem[] = new Array(len);
    for (let i = 0; i < len; ++i) {
        const o = opts[i];
        model[i] = { sort: o.sort, type: o.type, colId: (o.column as AgColumn).colId };
    }
    return model;
}
