import type { Bean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IColumnHeaderEditService extends Bean {
    /** Open the header-name editor for the given column. */
    showHeaderNameEditor(column: AgColumn): void;
}
