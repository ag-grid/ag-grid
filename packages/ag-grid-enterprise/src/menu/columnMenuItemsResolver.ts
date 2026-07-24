import type {
    AgColumn,
    AgProvidedColumnGroup,
    ColumnMenuItemsSource,
    DefaultColumnMenuItem,
    DefaultMenuItem,
    GetColumnMenuItemsParams,
    GridOptionsService,
    MenuItemDef,
} from 'ag-grid-community';
import { _addGridCommonParams } from 'ag-grid-community';

type ColumnMenuDefaultItems = DefaultColumnMenuItem[];
type ColumnMenuItems = (DefaultColumnMenuItem | MenuItemDef)[];

/**
 * Resolves the final menu item list for a column-scoped menu on any surface (column menu,
 * Columns Tool Panel, Column Chooser), applying user customisation with this precedence:
 * `columnMenuItems` (col/group) -> `getColumnMenuItems` (grid) -> [`source: 'columnMenu'` only]
 * legacy `mainMenuItems` (col/group) -> `getMainMenuItems` (grid) -> `defaultItems`.
 */
export function _resolveColumnMenuItems(
    gos: GridOptionsService,
    column: AgColumn | null,
    columnGroup: AgProvidedColumnGroup | null,
    source: ColumnMenuItemsSource,
    defaultItems: ColumnMenuDefaultItems
): ColumnMenuItems {
    const colOrGroupDef = column?.colDef ?? columnGroup?.getColGroupDef();

    const columnMenuItems = colOrGroupDef?.columnMenuItems;
    if (Array.isArray(columnMenuItems)) {
        return columnMenuItems;
    }
    if (typeof columnMenuItems === 'function') {
        return columnMenuItems(
            _addGridCommonParams<GetColumnMenuItemsParams>(gos, { column, columnGroup, defaultItems, source })
        );
    }

    const gridFunc = gos.getCallback('getColumnMenuItems');
    if (gridFunc) {
        return gridFunc({ column, columnGroup, defaultItems, source });
    }

    // Legacy fallback preserved for the column menu only, so pre-existing header customisation keeps working.
    // For the column menu the caller always supplies string tokens, matching the legacy `DefaultMenuItem[]` param.
    if (source === 'columnMenu') {
        const legacyDefaultItems = defaultItems as DefaultMenuItem[];
        const mainMenuItems = colOrGroupDef?.mainMenuItems;
        if (Array.isArray(mainMenuItems)) {
            return mainMenuItems;
        }
        if (typeof mainMenuItems === 'function') {
            return mainMenuItems(_addGridCommonParams(gos, { column, columnGroup, defaultItems: legacyDefaultItems }));
        }
        const legacyGridFunc = gos.getCallback('getMainMenuItems');
        if (legacyGridFunc) {
            return legacyGridFunc({ column, columnGroup, defaultItems: legacyDefaultItems });
        }
    }

    return defaultItems;
}
