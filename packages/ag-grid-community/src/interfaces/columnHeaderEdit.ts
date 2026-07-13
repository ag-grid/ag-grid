import type { Bean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';
import type { ColKey } from '../entities/colDef';
import type { ColumnEventType } from '../events';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IColumnHeaderEditService extends Bean {
    /** Set (or clear, with `null`) the edited header name for a column. */
    setColumnHeaderName(key: ColKey, headerName: string | null, source?: ColumnEventType): void;
    /** Open the header-name editor for the given column. */
    showHeaderNameEditor(column: AgColumn): void;
}
