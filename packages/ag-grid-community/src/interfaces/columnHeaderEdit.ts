import type { Bean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';
import type { MenuItemDef } from './menuItem';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IColumnHeaderEditService extends Bean {
    /** The "Edit Column Name" menu item for the column, or `null` when the column is not editable. */
    getEditColumnNameMenuItem(column: AgColumn): MenuItemDef | null;
    /** Open the header-name editor for the given column. */
    showHeaderNameEditor(column: AgColumn): void;
}
