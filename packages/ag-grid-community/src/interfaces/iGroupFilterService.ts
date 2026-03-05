import type { AgColumn } from '../entities/agColumn';
import type { ColumnEventType } from '../events';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IGroupFilterService {
    isGroupFilter(column: AgColumn): boolean;

    isFilterAllowed(column: AgColumn): boolean;

    isFilterActive(column: AgColumn): boolean;

    updateFilterFlags(source: ColumnEventType, additionalEventAttributes?: any): void;
}
