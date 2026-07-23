import type { Bean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { MenuItemDef } from './menuItem';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IColumnHeaderEditService extends Bean {
    /** The "Edit Column Name" menu item for the column or group, or `null` when it is not editable. */
    getEditColumnNameMenuItem(target: AgColumn | AgProvidedColumnGroup): MenuItemDef | null;
    /** Open the header-name editor for the given column or column group. */
    showHeaderNameEditor(target: AgColumn | AgProvidedColumnGroup): void;
    /** Whether the column's header is currently being edited and should be highlighted. */
    isHighlightedColumn(column: AgColumn): boolean;
    /** Whether the provided column group's header is currently being edited and should be highlighted. */
    isHighlightedGroup(columnGroup: AgProvidedColumnGroup): boolean;
}
