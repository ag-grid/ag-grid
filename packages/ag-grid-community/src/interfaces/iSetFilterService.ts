import type { AgColumn } from '../entities/agColumn';
import type { SetFilterModel } from './iSetFilter';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ISetFilterService {
    getFloatingFilterTooltip(filter: unknown, model: SetFilterModel | null): string | undefined;
    /** Every column when `colId` is omitted. */
    clearPreservedValues(colId: string | string[] | undefined, onlyUnselected: boolean): void;
    /** Every column when `column` is omitted. */
    createPreservingFilters(column?: AgColumn): void;
}
