import type { AgColumn } from '../entities/agColumn';
import type { GridOptions } from '../entities/gridOptions';
import type { ColumnEventType } from '../events';
import type { PropertyChangedEvent, PropertyValueChangedEvent } from '../gridOptionsService';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IAutoColService {
    columns: AgColumn[];

    createColumns(source: ColumnEventType): boolean;

    updateColumns(event: PropertyChangedEvent | PropertyValueChangedEvent<keyof GridOptions>): void;
}
