import type { LocaleTextFunc } from 'ag-stack';
import { _exists } from 'ag-stack';

import type {
    AgColumn,
    AgProvidedColumnGroup,
    ColumnEventType,
    DefaultColumnMenuItem,
    DefaultMenuItem,
    GetNoteParams,
    IAggFuncService,
    IValueColsService,
    MappedMenuItem,
    MenuItemDef,
    MenuItemMapParams,
    NamedBean,
    RowNode,
    SortDef,
} from 'ag-grid-community';
import { BeanStub, _createIconNoSpan, _normalizeSortType, _resetColumnState } from 'ag-grid-community';

import { getGroupingLocaleText, isRowGroupColLocked } from '../rowGrouping/rowGroupingUtils';
import type { ColumnChooserFactory } from './columnChooserFactory';
import { PIVOT_TOKEN, SCROLL_INTO_VIEW_TOKEN, VALUE_TOKEN, columnMenuTokenLabel } from './columnMenuTokenLabels';
import { _getMenuItemProviders } from './menuItemProviders';
import { validateMenuItem } from './menuItemValidations';
import { MENU_ITEM_SEPARATOR, _normaliseSeparators } from './menuSeparators';

const SORT_MENU_ITEM_TO_MENU_ACTION_PARAMS: Record<
    string,
    { fallback: string; getSortDef: (col?: AgColumn) => SortDef }
> = {
    sortAscending: { fallback: 'Sort Ascending', getSortDef: () => ({ type: 'default', direction: 'asc' }) },
    sortDescending: {
        fallback: 'Sort Descending',
        getSortDef: () => ({ type: 'default', direction: 'desc' }),
    },
    sortAbsoluteAscending: {
        fallback: 'Sort Absolute Ascending',
        getSortDef: () => ({ type: 'absolute', direction: 'asc' }),
    },
    sortAbsoluteDescending: {
        fallback: 'Sort Absolute Descending',
        getSortDef: () => ({ type: 'absolute', direction: 'desc' }),
    },
    sortUnSort: {
        fallback: 'Clear Sort',
        getSortDef: (column: AgColumn) => ({ type: _normalizeSortType(column.getSortDef()?.type), direction: null }),
    },
};

export class MenuItemMapper extends BeanStub implements NamedBean {
    beanName = 'menuItemMapper' as const;

    public mapWithStockItems(
        originalList: (DefaultColumnMenuItem | MenuItemDef)[],
        column: AgColumn | null,
        node: RowNode | null,
        noteParams: GetNoteParams | undefined,
        sourceElement: () => HTMLElement,
        source: ColumnEventType,
        columnGroup: AgProvidedColumnGroup | null = null
    ): (MenuItemDef | 'separator')[] {
        if (!originalList) {
            return [];
        }

        const resultList: (MenuItemDef | 'separator')[] = [];

        const localeTextFunc = this.getLocaleTextFunc();
        const { beans, gos } = this;

        const {
            aggFuncSvc,
            colAutosize,
            colChooserFactory,
            colHeaderEditSvc,
            colModel,
            colNames,
            ctrlsSvc,
            expansionSvc,
            focusSvc,
            menuSvc,
            pinnedCols,
            pivotColsSvc,
            rowGroupColsSvc,
            showValuesAsSvc,
            sortSvc,
            valueColsSvc,
        } = beans;

        const mapParams: MenuItemMapParams = { column, node, source, sourceElement, noteParams };
        const providers = _getMenuItemProviders(beans);
        const mapProviderItem = (key: DefaultColumnMenuItem): MappedMenuItem | undefined => {
            validateMenuItem(gos, key);
            for (const provider of providers) {
                const mapped = provider.mapMenuItem(key, mapParams);
                if (mapped !== undefined) {
                    return mapped;
                }
            }
            return undefined;
        };

        const getStockMenuItem = (
            key: DefaultColumnMenuItem,
            column: AgColumn | null,
            sourceElement: () => HTMLElement,
            source: ColumnEventType
        ): MenuItemDef | 'separator' | null => {
            switch (key) {
                case 'pinSubMenu':
                    return pinnedCols && column
                        ? {
                              name: localeTextFunc('pinColumn', 'Pin Column'),
                              icon: _createIconNoSpan('menuPin', beans, null),
                              subMenu: ['clearPinned', 'pinLeft', 'pinRight'],
                          }
                        : null;
                case 'pinLeft':
                    return pinnedCols && column
                        ? {
                              name: localeTextFunc('pinLeft', 'Pin Left'),
                              action: () => pinnedCols.setColsPinned([column], 'left', source),
                              checked: !!column && column.isPinnedLeft(),
                          }
                        : null;
                case 'pinRight':
                    return pinnedCols && column
                        ? {
                              name: localeTextFunc('pinRight', 'Pin Right'),
                              action: () => pinnedCols.setColsPinned([column], 'right', source),
                              checked: !!column && column.isPinnedRight(),
                          }
                        : null;
                case 'clearPinned':
                    return pinnedCols && column
                        ? {
                              name: localeTextFunc('noPin', 'No Pin'),
                              action: () => pinnedCols.setColsPinned([column], null, source),
                              checked: !!column && !column.isPinned(),
                          }
                        : null;
                case 'valueAggSubMenu':
                    if (aggFuncSvc && valueColsSvc && (column?.primary || column?.pivotValueColumn)) {
                        return {
                            name: localeTextFunc('valueAggregation', 'Value Aggregation'),
                            icon: _createIconNoSpan('menuValue', beans, null),
                            subMenu: createAggregationSubMenu(column, aggFuncSvc, valueColsSvc, localeTextFunc),
                            disabled: gos.get('functionsReadOnly'),
                        };
                    } else {
                        return null;
                    }
                case 'showValuesAsSubMenu':
                    if (showValuesAsSvc && column && showValuesAsSvc.isMenuEligible(column)) {
                        return {
                            name: localeTextFunc('showValuesAs', 'Show Values As'),
                            icon: _createIconNoSpan('showValuesAs', beans, null),
                            subMenu: showValuesAsSvc.getMenuItems(column, localeTextFunc),
                        };
                    } else {
                        return null;
                    }
                case 'autoSizeThis':
                    return colAutosize
                        ? {
                              name: localeTextFunc('autosizeThisColumn', 'Autosize This Column'),
                              action: () =>
                                  column && colAutosize.autoSizeColumn(column, source, gos.get('skipHeaderOnAutoSize')),
                          }
                        : null;
                case 'autoSizeAll':
                    return colAutosize
                        ? {
                              name: localeTextFunc('autosizeAllColumns', 'Autosize All Columns'),
                              action: () =>
                                  colAutosize.autoSizeAllColumns({
                                      source,
                                      skipHeader: gos.get('skipHeaderOnAutoSize'),
                                  }),
                          }
                        : null;
                case 'rowGroup':
                    return rowGroupColsSvc
                        ? {
                              name: getGroupingLocaleText(
                                  localeTextFunc,
                                  'groupBy',
                                  colNames.getDisplayNameForColumn(column, 'header')!
                              ),
                              disabled:
                                  gos.get('functionsReadOnly') ||
                                  column?.isRowGroupActive() ||
                                  !column?.colDef.enableRowGroup,
                              action: () => rowGroupColsSvc.addColumns([column], source),
                              icon: _createIconNoSpan('menuAddRowGroup', beans, null),
                          }
                        : null;
                case 'rowUnGroup': {
                    if (rowGroupColsSvc && gos.isModuleRegistered('SharedRowGrouping')) {
                        const showRowGroup = column?.showRowGroup;
                        const lockedGroups = gos.get('groupLockGroupColumns');
                        let name: string;
                        let disabled: boolean;
                        let action: () => void;
                        // Handle single auto group column
                        if (showRowGroup === true) {
                            name = localeTextFunc('ungroupAll', 'Un-Group All');
                            disabled =
                                gos.get('functionsReadOnly') ||
                                lockedGroups === -1 ||
                                lockedGroups >= (rowGroupColsSvc.columns.length ?? 0);
                            action = () =>
                                rowGroupColsSvc.setColumns(rowGroupColsSvc.columns.slice(0, lockedGroups), source);
                        } else if (typeof showRowGroup === 'string') {
                            // Handle multiple auto group columns
                            const underlyingColumn = colModel.getNonPivotCol(showRowGroup);
                            const ungroupByName =
                                underlyingColumn != null
                                    ? colNames.getDisplayNameForColumn(underlyingColumn, 'header')
                                    : showRowGroup;
                            name = getGroupingLocaleText(localeTextFunc, 'ungroupBy', ungroupByName!);
                            disabled = gos.get('functionsReadOnly') || isRowGroupColLocked(underlyingColumn, beans);
                            action = () => {
                                rowGroupColsSvc.removeColumns([showRowGroup], source);
                            };
                        } else {
                            // Handle primary column
                            name = getGroupingLocaleText(
                                localeTextFunc,
                                'ungroupBy',
                                colNames.getDisplayNameForColumn(column, 'header')!
                            );
                            disabled =
                                gos.get('functionsReadOnly') ||
                                !column?.isRowGroupActive() ||
                                !column?.colDef.enableRowGroup ||
                                isRowGroupColLocked(column, beans);
                            action = () => rowGroupColsSvc.removeColumns([column], source);
                        }
                        return {
                            name,
                            disabled,
                            action,
                            icon: _createIconNoSpan('menuRemoveRowGroup', beans, null),
                        };
                    } else {
                        return null;
                    }
                }
                case 'scrollIntoView': {
                    if (!ctrlsSvc || !column || column.isPinned()) {
                        return null;
                    }
                    const displayName = colNames.getDisplayNameForColumn(column, 'header')!;
                    return {
                        name: columnMenuTokenLabel(
                            localeTextFunc,
                            SCROLL_INTO_VIEW_TOKEN.key,
                            SCROLL_INTO_VIEW_TOKEN.default,
                            displayName
                        ),
                        icon: _createIconNoSpan(SCROLL_INTO_VIEW_TOKEN.icon, beans, null),
                        action: () => ctrlsSvc.getScrollFeature().ensureColumnVisible(column),
                    };
                }
                case 'value': {
                    if (!valueColsSvc || !column?.primary || !column.isAllowValue()) {
                        return null;
                    }
                    const active = column.isValueActive();
                    const displayName = colNames.getDisplayNameForColumn(column, 'header')!;
                    return {
                        name: active
                            ? columnMenuTokenLabel(
                                  localeTextFunc,
                                  VALUE_TOKEN.removeKey,
                                  VALUE_TOKEN.removeDefault,
                                  displayName
                              )
                            : columnMenuTokenLabel(
                                  localeTextFunc,
                                  VALUE_TOKEN.addKey,
                                  VALUE_TOKEN.addDefault,
                                  displayName
                              ),
                        icon: _createIconNoSpan(VALUE_TOKEN.icon, beans, null),
                        disabled: gos.get('functionsReadOnly'),
                        action: () =>
                            active
                                ? valueColsSvc.removeColumns([column], source)
                                : valueColsSvc.addColumns([column], source),
                    };
                }
                case 'pivot': {
                    if (!pivotColsSvc || !colModel.pivotMode || !column?.primary || !column.isAllowPivot()) {
                        return null;
                    }
                    const active = column.isPivotActive();
                    const displayName = colNames.getDisplayNameForColumn(column, 'header')!;
                    return {
                        name: active
                            ? columnMenuTokenLabel(
                                  localeTextFunc,
                                  PIVOT_TOKEN.removeKey,
                                  PIVOT_TOKEN.removeDefault,
                                  displayName
                              )
                            : columnMenuTokenLabel(
                                  localeTextFunc,
                                  PIVOT_TOKEN.addKey,
                                  PIVOT_TOKEN.addDefault,
                                  displayName
                              ),
                        icon: _createIconNoSpan(PIVOT_TOKEN.icon, beans, null),
                        disabled: gos.get('functionsReadOnly'),
                        action: () =>
                            active
                                ? pivotColsSvc.removeColumns([column], source)
                                : pivotColsSvc.addColumns([column], source),
                    };
                }
                case 'resetColumns':
                    return {
                        name: localeTextFunc('resetColumns', 'Reset Columns'),
                        action: () => _resetColumnState(beans, source),
                    };
                case 'expandAll':
                    return expansionSvc
                        ? {
                              name: localeTextFunc('expandAll', 'Expand All Row Groups'),
                              action: () => expansionSvc.expandAll(true),
                          }
                        : null;
                case 'contractAll':
                    return expansionSvc
                        ? {
                              name: localeTextFunc('collapseAll', 'Collapse All Row Groups'),
                              action: () => expansionSvc.expandAll(false),
                          }
                        : null;
                case 'separator':
                    return key;
                case 'columnFilter':
                    return menuSvc && column
                        ? {
                              name: localeTextFunc('columnFilter', 'Column Filter'),
                              icon: _createIconNoSpan('filter', beans, null),
                              action: () =>
                                  menuSvc.showFilterMenu({
                                      column,
                                      buttonElement: sourceElement(),
                                      containerType: 'columnFilter',
                                      positionBy: 'button',
                                  }),
                          }
                        : null;
                case 'columnChooser': {
                    const headerPosition = focusSvc.focusedHeader;
                    return colChooserFactory
                        ? {
                              name: localeTextFunc('columnChooser', 'Choose Columns'),
                              icon: _createIconNoSpan('columns', beans, null),
                              action: () =>
                                  (colChooserFactory as ColumnChooserFactory).showColumnChooser({
                                      column,
                                      eventSource: sourceElement(),
                                      headerPosition,
                                  }),
                          }
                        : null;
                }

                case 'editColumnName': {
                    const editTarget = column ?? columnGroup;
                    return editTarget ? (colHeaderEditSvc?.getEditColumnNameMenuItem(editTarget) ?? null) : null;
                }
                case 'sortUnSort':
                case 'sortAscending':
                case 'sortDescending':
                case 'sortAbsoluteAscending':
                case 'sortAbsoluteDescending': {
                    if (!sortSvc || !column) {
                        return null;
                    }

                    const { fallback, getSortDef } = SORT_MENU_ITEM_TO_MENU_ACTION_PARAMS[key];

                    return {
                        name: localeTextFunc(key, fallback),
                        icon: _createIconNoSpan(key, beans, null),
                        action: () => sortSvc.setSortForColumn(column, getSortDef(column), false, source),
                    };
                }

                default: {
                    this.warn(176, { key });
                    return null;
                }
            }
        };

        for (const menuItemOrString of originalList) {
            let result: MenuItemDef | 'separator' | null;

            if (typeof menuItemOrString === 'string') {
                const mapped = mapProviderItem(menuItemOrString);
                if (Array.isArray(mapped)) {
                    if (mapped.length) {
                        resultList.push(MENU_ITEM_SEPARATOR, ...mapped, MENU_ITEM_SEPARATOR);
                    }
                    continue;
                }
                result =
                    mapped !== undefined ? mapped : getStockMenuItem(menuItemOrString, column, sourceElement, source);
            } else {
                // Spread to prevent leaking mapped subMenus back into the original menuItem
                result = { ...menuItemOrString };
            }
            // if no mapping, can happen when module is not loaded but user tries to use module anyway
            if (!result) {
                continue;
            }

            const resultDef = result as MenuItemDef;
            const { subMenu } = resultDef;

            if (subMenu && subMenu instanceof Array) {
                resultDef.subMenu = this.mapWithStockItems(
                    subMenu as (DefaultMenuItem | MenuItemDef)[],
                    column,
                    node,
                    noteParams,
                    sourceElement,
                    source,
                    columnGroup
                );
            }

            if (result != null) {
                resultList.push(result);
            }
        }

        // items could have been removed due to missing modules
        _normaliseSeparators(resultList, MENU_ITEM_SEPARATOR);

        return resultList;
    }
}

function createAggregationSubMenu(
    column: AgColumn,
    aggFuncSvc: IAggFuncService,
    valueColsSvc: IValueColsService,
    localeTextFunc: LocaleTextFunc
): MenuItemDef[] {
    let columnToUse: AgColumn | undefined;
    if (column.primary) {
        columnToUse = column;
    } else {
        const pivotValueColumn = column.pivotValueColumn as AgColumn;
        columnToUse = _exists(pivotValueColumn) ? pivotValueColumn : undefined;
    }

    const result: MenuItemDef[] = [];
    if (columnToUse) {
        const columnIsAlreadyAggValue = columnToUse.isValueActive();
        const funcNames = aggFuncSvc.getFuncNames(columnToUse);

        result.push({
            name: localeTextFunc('noAggregation', 'None'),
            action: () => {
                valueColsSvc.removeColumns([columnToUse!], 'contextMenu');
                valueColsSvc.setColumnAggFunc!(columnToUse, undefined, 'contextMenu');
            },
            checked: !columnIsAlreadyAggValue,
        });

        for (const funcName of funcNames) {
            result.push({
                name: localeTextFunc(funcName, aggFuncSvc.getDefaultFuncLabel(funcName)),
                action: () => {
                    valueColsSvc.setColumnAggFunc!(columnToUse, funcName, 'contextMenu');
                    valueColsSvc.addColumns([columnToUse!], 'contextMenu');
                },
                checked: columnIsAlreadyAggValue && columnToUse.aggFunc === funcName,
            });
        }
    }

    return result;
}
