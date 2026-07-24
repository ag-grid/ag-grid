import type {
    AgColumn,
    AgProvidedColumnGroup,
    DefaultColumnMenuItem,
    DefaultMenuItem,
    MenuItemDef,
    NamedBean,
} from 'ag-grid-community';
import {
    BeanStub,
    _getAvailableSortTypes,
    _getDisplaySortForColumn,
    _getGrandTotalRow,
    _isClientSideRowModel,
    _isLegacyMenuEnabled,
} from 'ag-grid-community';

import { isRowGroupColLocked } from '../rowGrouping/rowGroupingUtils';
import { MenuList } from '../widgets/menuList';
import { _resolveColumnMenuItems } from './columnMenuItemsResolver';
import type { MenuItemMapper } from './menuItemMapper';
import { MENU_ITEM_SEPARATOR, _normaliseSeparators } from './menuSeparators';

export class ColumnMenuFactory extends BeanStub implements NamedBean {
    beanName = 'colMenuFactory' as const;

    public createMenu(
        parent: { createManagedBean(bean: MenuList): MenuList },
        menuItems: (DefaultColumnMenuItem | MenuItemDef)[],
        column: AgColumn | undefined,
        sourceElement: () => HTMLElement,
        columnGroup?: AgProvidedColumnGroup
    ): MenuList {
        const menuList = parent.createManagedBean(
            new MenuList(0, {
                column: column ?? null,
                node: null,
                value: null,
            })
        );

        const menuItemsMapped = (this.beans.menuItemMapper as MenuItemMapper).mapWithStockItems(
            menuItems,
            column ?? null,
            null,
            undefined,
            sourceElement,
            'columnMenu',
            columnGroup ?? null
        );

        menuList.addMenuItems(menuItemsMapped);

        return menuList;
    }

    public getMenuItems(
        column: AgColumn | null = null,
        columnGroup: AgProvidedColumnGroup | null = null
    ): (DefaultColumnMenuItem | MenuItemDef)[] {
        const defaultItems = this.getDefaultMenuOptions(column, columnGroup);
        // Copy so normalising never mutates a user-provided columnMenuItems/mainMenuItems array in place.
        const result = [..._resolveColumnMenuItems(this.gos, column, columnGroup, 'columnMenu', defaultItems)];

        // normalise separators after item removal so we don't leave duplicates,
        // or separators stranded at the start or end of the menu.
        _normaliseSeparators(result, MENU_ITEM_SEPARATOR);

        return result;
    }

    private getDefaultMenuOptions(
        column: AgColumn | null,
        columnGroup: AgProvidedColumnGroup | null = null
    ): DefaultMenuItem[] {
        const result: DefaultMenuItem[] = [];

        const { beans, gos } = this;
        const {
            colChooserFactory,
            rowGroupColsSvc,
            colModel,
            expansionSvc,
            sortSvc,
            menuSvc,
            pinnedCols,
            aggFuncSvc,
            colAutosize,
        } = beans;
        const isLegacyMenuEnabled = _isLegacyMenuEnabled(gos);

        const addColumnItems = () => {
            if (!isLegacyMenuEnabled && colChooserFactory) {
                result.push('columnChooser');
            }
            result.push('resetColumns');
        };

        if (!column) {
            if (beans.colHeaderEditSvc && columnGroup?.colGroupDef?.headerNameEditable) {
                result.push('editColumnName');
                result.push(MENU_ITEM_SEPARATOR);
            }
            addColumnItems();
            return result;
        }

        const { colDef } = column;
        const allowPinning = pinnedCols && !colDef.lockPinned;

        const rowGroupCount = rowGroupColsSvc?.columns.length ?? 0;
        const doingGrouping = rowGroupCount > 0;
        const grandTotalRow = _getGrandTotalRow(gos);
        const treeData = gos.get('treeData');

        const isPrimary = column.primary;

        // 1. secondary columns can always have aggValue, as it means it's a pivot value column
        // 2. otherwise, only allow aggValue if it's a value column and we're grouping or have a grand total row
        const allowValueAgg =
            !isPrimary || (aggFuncSvc && column.isAllowValue() && (doingGrouping || grandTotalRow || treeData));

        if (sortSvc && !isLegacyMenuEnabled && column.isSortable()) {
            const { isAbsoluteSort, isDefaultSort, isAscending, isDescending, direction } = _getDisplaySortForColumn(
                column,
                beans
            );
            const allowedSortTypes = _getAvailableSortTypes(gos, column);

            if (allowedSortTypes.has('default')) {
                if (!(isAscending && isDefaultSort)) {
                    result.push('sortAscending');
                }
                if (!(isDescending && isDefaultSort)) {
                    result.push('sortDescending');
                }
            }
            if (allowedSortTypes.has('absolute')) {
                if (!(isAscending && isAbsoluteSort)) {
                    result.push('sortAbsoluteAscending');
                }
                if (!(isDescending && isAbsoluteSort)) {
                    result.push('sortAbsoluteDescending');
                }
            }
            if (direction) {
                result.push('sortUnSort');
            }
            result.push(MENU_ITEM_SEPARATOR);
        }

        if (menuSvc?.isFilterMenuItemEnabled(column)) {
            result.push('columnFilter');
            result.push(MENU_ITEM_SEPARATOR);
        }

        if (allowPinning) {
            result.push('pinSubMenu');
        }

        if (allowValueAgg) {
            result.push('valueAggSubMenu');
        }

        // Shown on value/numeric columns (numeric ones promote on demand) and any column opted in via config.
        if (beans.showValuesAsSvc?.isMenuEligible(column)) {
            result.push('showValuesAsSubMenu');
        }

        if (beans.calculatedColsSvc?.isEnabled() === true && isPrimary) {
            result.push(MENU_ITEM_SEPARATOR);
            if (!colModel.pivotMode) {
                result.push('calculatedColumn');
            }
            if (column?.isCalculatedCol) {
                result.push('editCalculatedColumn');
                result.push('removeCalculatedColumn');
            }
            result.push(MENU_ITEM_SEPARATOR);
        }

        if (beans.colHeaderEditSvc && colDef.headerNameEditable) {
            result.push(MENU_ITEM_SEPARATOR);
            result.push('editColumnName');
            result.push(MENU_ITEM_SEPARATOR);
        }

        if (allowPinning || allowValueAgg) {
            result.push(MENU_ITEM_SEPARATOR);
        }

        if (colAutosize) {
            if (!colDef.suppressAutoSize) {
                result.push('autoSizeThis');
            }
            result.push('autoSizeAll');
            result.push(MENU_ITEM_SEPARATOR);
        }

        if (rowGroupColsSvc && gos.isModuleRegistered('SharedRowGrouping')) {
            const numItems = result.length;
            const showRowGroup = colDef.showRowGroup;
            if (showRowGroup) {
                result.push('rowUnGroup');
            } else if (column.isAllowRowGroup() && isPrimary) {
                if (column.isRowGroupActive()) {
                    const groupLocked = isRowGroupColLocked(column, beans);
                    if (!groupLocked) {
                        result.push('rowUnGroup');
                    }
                } else {
                    result.push('rowGroup');
                }
            }
            if (result.length > numItems) {
                // only add separator if added group items
                result.push(MENU_ITEM_SEPARATOR);
            }
        }

        addColumnItems();

        // only add grouping expand/collapse if grouping in the InMemoryRowModel or ssrmExpandAllAffectsAllRows flag is set
        // if pivoting, we only have expandable groups if grouping by 2 or more columns
        // as the lowest level group is not expandable while pivoting.
        // if not pivoting, then any active row group can be expanded.
        if (
            expansionSvc &&
            (_isClientSideRowModel(gos) || gos.get('ssrmExpandAllAffectsAllRows')) &&
            (treeData || rowGroupCount > (colModel.pivotMode ? 1 : 0))
        ) {
            result.push('expandAll');
            result.push('contractAll');
        }

        return result;
    }
}
