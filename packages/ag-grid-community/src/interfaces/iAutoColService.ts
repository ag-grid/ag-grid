import type { AgColumn } from '../entities/agColumn';
import type { GridOptions } from '../entities/gridOptions';
import type { ColumnEventType } from '../events';
import type { PropertyChangedEvent, PropertyValueChangedEvent } from '../gridOptionsService';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 *  Narrow contract for the auto-group column service. `refreshCols` regenerates the cols against
 *  current row-group state; ColumnModel reads `columns` directly to emit them into `colsList`. */
export interface IAutoColService {
    /** Generated auto-group columns. Flat-array — empty when no auto-cols are active. */
    columns: AgColumn[];

    /** Sync internal cols against current row-group state. */
    refreshCols(source: ColumnEventType): void;

    updateColumns(event: PropertyChangedEvent | PropertyValueChangedEvent<keyof GridOptions>): void;

    /** Returns the auto-cols array, or null when empty. */
    getColumns(): AgColumn[] | null;
}
