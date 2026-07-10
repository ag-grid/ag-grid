import type { LocaleTextFunc } from 'ag-stack';
import { _exists } from 'ag-stack';

import type {
    AgColumn,
    ColumnEventType,
    DefaultMenuItem,
    GetNoteParams,
    IAggFuncService,
    IMenuActionParams,
    INoteAccess,
    INotesService,
    IValueColsService,
    MenuItemDef,
    NamedBean,
    RowNode,
    SortDef,
} from 'ag-grid-community';
import { BeanStub, _createIconNoSpan, _getRowNode, _normalizeSortType, _resetColumnState } from 'ag-grid-community';

import { getGroupingLocaleText, isRowGroupColLocked } from '../rowGrouping/rowGroupingUtils';
import type { ChartMenuItemMapper } from './chartMenuItemMapper';
import type { ColumnChooserFactory } from './columnChooserFactory';
import { validateMenuItem } from './menuItemValidations';

export const MENU_ITEM_SEPARATOR = 'separator';

export function _normaliseSeparators<T>(array: T[], separator: T) {
    if (!array?.length) {
        return;
    }

    let writeIndex = 0;
    let lastItemWasSeparator = true;

    for (const item of array) {
        const isSeparator = item === separator;

        if (isSeparator && lastItemWasSeparator) {
            continue;
        }

        array[writeIndex++] = item;
        lastItemWasSeparator = isSeparator;
    }

    if (writeIndex > 0 && array[writeIndex - 1] === separator) {
        writeIndex--;
    }

    array.length = writeIndex;
}

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
        originalList: (MenuItemDef | DefaultMenuItem)[],
        column: AgColumn | null,
        node: RowNode | null,
        noteParams: GetNoteParams | undefined,
        sourceElement: () => HTMLElement,
        source: ColumnEventType
    ): (MenuItemDef | 'separator')[] {
        if (!originalList) {
            return [];
        }

        const resultList: (MenuItemDef | 'separator')[] = [];

        const localeTextFunc = this.getLocaleTextFunc();
        const { beans, gos } = this;

        const {
            aggFuncSvc,
            chartMenuItemMapper,
            clipboardSvc,
            colAutosize,
            colChooserFactory,
            colModel,
            colNames,
            csvCreator,
            excelCreator,
            expansionSvc,
            focusSvc,
            menuSvc,
            notesSvc,
            calculatedColsSvc,
            pdfCreator,
            pinnedCols,
            pinnedRowModel,
            rangeSvc,
            rowGroupColsSvc,
            showValuesAsSvc,
            sortSvc,
            valueColsSvc,
        } = beans;

        const getPinActionHandler =
            (sideOrRemove: 'top' | 'bottom' | null) =>
            ({ node, column }: IMenuActionParams) => {
                if (node) {
                    pinnedRowModel!.pinRow(node as RowNode, sideOrRemove ?? null, column as AgColumn);
                    return;
                }
                // pick selected cells / rows / columns
                rangeSvc?.getCellRanges()?.forEach((cellRange) => {
                    rangeSvc.forEachRowInRange(cellRange, (row) => {
                        const nodeFromSelection = _getRowNode(beans, row);
                        if (nodeFromSelection) {
                            pinnedRowModel!.pinRow(nodeFromSelection, sideOrRemove ?? null, null);
                        }
                    });
                });
            };

        const getStockMenuItem = (
            key: DefaultMenuItem,
            column: AgColumn | null,
            sourceElement: () => HTMLElement,
            source: ColumnEventType
        ): MenuItemDef | 'separator' | null => {
            validateMenuItem(gos, key);

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
                case 'pinRowSubMenu': {
                    const enableRowPinning = gos.get('enableRowPinning');
                    const subMenu: string[] = [];
                    const pinned = node?.rowPinned ?? node?.pinnedSibling?.rowPinned;

                    if (pinned) {
                        subMenu.push('unpinRow');
                    }

                    if (enableRowPinning && enableRowPinning !== 'bottom' && pinned != 'top') {
                        subMenu.push('pinTop');
                    }

                    if (enableRowPinning && enableRowPinning !== 'top' && pinned != 'bottom') {
                        subMenu.push('pinBottom');
                    }

                    return pinnedRowModel?.isManual()
                        ? {
                              name: localeTextFunc('pinRow', 'Pin Row'),
                              icon: _createIconNoSpan('rowPin', beans, column),
                              subMenu,
                          }
                        : null;
                }
                case 'pinTop':
                    return pinnedRowModel?.isManual()
                        ? {
                              name: localeTextFunc('pinTop', 'Pin to Top'),
                              icon: _createIconNoSpan('rowPinTop', beans, column),
                              action: getPinActionHandler('top'),
                          }
                        : null;
                case 'pinBottom':
                    return pinnedRowModel?.isManual()
                        ? {
                              name: localeTextFunc('pinBottom', 'Pin to Bottom'),
                              icon: _createIconNoSpan('rowPinBottom', beans, column),
                              action: getPinActionHandler('bottom'),
                          }
                        : null;
                case 'unpinRow':
                    return pinnedRowModel?.isManual()
                        ? {
                              name: localeTextFunc('unpinRow', 'Unpin Row'),
                              icon: _createIconNoSpan('rowUnpin', beans, column),
                              action: getPinActionHandler(null),
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
                case 'copy':
                    return clipboardSvc
                        ? {
                              name: localeTextFunc('copy', 'Copy'),
                              shortcut: localeTextFunc('ctrlC', 'Ctrl+C'),
                              icon: _createIconNoSpan('clipboardCopy', beans, null),
                              action: () => clipboardSvc.copyToClipboard(),
                          }
                        : null;
                case 'copyWithHeaders':
                    return clipboardSvc
                        ? {
                              name: localeTextFunc('copyWithHeaders', 'Copy with Headers'),
                              // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                              icon: _createIconNoSpan('clipboardCopy', beans, null),
                              action: () => clipboardSvc.copyToClipboard({ includeHeaders: true }),
                          }
                        : null;
                case 'copyWithGroupHeaders':
                    return clipboardSvc
                        ? {
                              name: localeTextFunc('copyWithGroupHeaders', 'Copy with Group Headers'),
                              // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                              icon: _createIconNoSpan('clipboardCopy', beans, null),
                              action: () =>
                                  clipboardSvc.copyToClipboard({ includeHeaders: true, includeGroupHeaders: true }),
                          }
                        : null;
                case 'cut':
                    if (clipboardSvc) {
                        const focusedCell = focusSvc.getFocusedCell();
                        const rowNode = focusedCell ? _getRowNode(beans, focusedCell) : null;
                        const isEditable = rowNode ? focusedCell?.column.isCellEditable(rowNode) : false;
                        return {
                            name: localeTextFunc('cut', 'Cut'),
                            shortcut: localeTextFunc('ctrlX', 'Ctrl+X'),
                            icon: _createIconNoSpan('clipboardCut', beans, null),
                            disabled: !isEditable || gos.get('suppressCutToClipboard'),
                            action: () => clipboardSvc.cutToClipboard(undefined, 'contextMenu'),
                        };
                    } else {
                        return null;
                    }
                case 'paste':
                    if (clipboardSvc) {
                        const isPasteBlocked =
                            gos.get('suppressClipboardApi') ||
                            gos.get('suppressClipboardPaste') ||
                            !column ||
                            !node ||
                            !column.isCellEditable(node) ||
                            column.isSuppressPaste(node);

                        return {
                            name: localeTextFunc('paste', 'Paste'),
                            shortcut: localeTextFunc('ctrlV', 'Ctrl+V'),
                            icon: _createIconNoSpan('clipboardPaste', beans, null),
                            disabled: isPasteBlocked,
                            action: () => clipboardSvc.pasteFromClipboard(),
                        };
                    } else {
                        return null;
                    }
                case 'export': {
                    const exportSubMenuItems: string[] = [];

                    if (!gos.get('suppressCsvExport') && csvCreator) {
                        exportSubMenuItems.push('csvExport');
                    }
                    if (!gos.get('suppressExcelExport') && excelCreator) {
                        exportSubMenuItems.push('excelExport');
                    }
                    if (!gos.get('suppressPdfExport') && pdfCreator) {
                        exportSubMenuItems.push('pdfExport');
                    }
                    return exportSubMenuItems.length
                        ? {
                              name: localeTextFunc('export', 'Export'),
                              subMenu: exportSubMenuItems,
                              icon: _createIconNoSpan('save', beans, null),
                          }
                        : null;
                }
                case 'csvExport':
                    return csvCreator
                        ? {
                              name: localeTextFunc('csvExport', 'CSV Export'),
                              icon: _createIconNoSpan('csvExport', beans, null),
                              action: () => csvCreator.exportDataAsCsv(),
                          }
                        : null;
                case 'excelExport':
                    return excelCreator
                        ? {
                              name: localeTextFunc('excelExport', 'Excel Export'),
                              icon: _createIconNoSpan('excelExport', beans, null),
                              action: () => excelCreator.exportDataAsExcel(),
                          }
                        : null;
                case 'pdfExport':
                    return pdfCreator
                        ? {
                              name: localeTextFunc('pdfExport', 'PDF Export'),
                              icon: _createIconNoSpan('pdfExport', beans, null),
                              action: () => pdfCreator.exportDataAsPdf(),
                          }
                        : null;
                case 'separator':
                    return key;
                case 'pivotChart':
                case 'chartRange':
                    return (chartMenuItemMapper as ChartMenuItemMapper).getChartItems(key);
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

                case 'calculatedColumn': {
                    if (!calculatedColsSvc?.isEnabled()) {
                        return null;
                    }

                    const headerPosition = focusSvc.focusedHeader ?? (column ? { headerRowIndex: 0, column } : null);

                    return {
                        name: localeTextFunc('calculatedColumnAdd', 'Add Calculated Column'),
                        icon: _createIconNoSpan('calculatedColumnAdd', beans, null),
                        action: () =>
                            calculatedColsSvc.openCalculatedColumnDialog(column, 'add', true, {
                                eventSource: sourceElement(),
                                headerPosition,
                            }),
                    };
                }
                case 'editCalculatedColumn': {
                    if (!calculatedColsSvc?.isEnabled() || !column?.isCalculatedCol) {
                        return null;
                    }
                    const headerPosition = focusSvc.focusedHeader ?? { headerRowIndex: 0, column };

                    return {
                        name: localeTextFunc('calculatedColumnEdit', 'Edit Calculated Column'),
                        icon: _createIconNoSpan('calculatedColumnEdit', beans, null),
                        action: () =>
                            calculatedColsSvc.openCalculatedColumnDialog(column, 'edit', true, {
                                eventSource: sourceElement(),
                                headerPosition,
                            }),
                    };
                }

                case 'removeCalculatedColumn':
                    return calculatedColsSvc?.isEnabled() && column?.isCalculatedCol
                        ? {
                              name: localeTextFunc('calculatedColumnRemove', 'Remove Calculated Column'),
                              icon: _createIconNoSpan('calculatedColumnRemove', beans, null),
                              action: () => calculatedColsSvc.removeCalculatedColumn(column),
                          }
                        : null;
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
                if (menuItemOrString === 'note') {
                    const noteItems = createNoteMenuItems({
                        notesSvc,
                        column,
                        node,
                        noteParams,
                        localeTextFunc,
                    });

                    if (noteItems.length) {
                        resultList.push(MENU_ITEM_SEPARATOR, ...noteItems, MENU_ITEM_SEPARATOR);
                    }

                    continue;
                }

                result = getStockMenuItem(menuItemOrString, column, sourceElement, source);
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
                    source
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

function createNoteMenuItems({
    notesSvc,
    column,
    node,
    noteParams,
    localeTextFunc,
}: {
    notesSvc: Pick<INotesService, 'hasDataSource' | 'getNoteAccess' | 'showNote' | 'setNote'> | undefined;
    column: AgColumn | null;
    node: RowNode | null;
    noteParams: GetNoteParams | undefined;
    localeTextFunc: LocaleTextFunc;
}): MenuItemDef[] {
    const access: INoteAccess | undefined = notesSvc?.hasDataSource()
        ? noteParams
            ? notesSvc.getNoteAccess(noteParams)
            : column && node
              ? notesSvc.getNoteAccess({ rowNode: node, column })
              : undefined
        : undefined;

    if (!access) {
        return [];
    }

    const result: MenuItemDef[] = [];

    if (!access.note) {
        result.push({
            name: localeTextFunc('addNote', 'Add Note'),
            shortcut: localeTextFunc('shiftF2', 'Shift+F2'),
            disabled: !access.canCreate,
            action: access.canCreate ? () => notesSvc!.showNote(access.params, true) : undefined,
        });

        return result;
    }

    if (access.canView && (access.isReadOnly || access.isSuppressed)) {
        result.push({
            name: localeTextFunc('viewNote', 'View Note'),
            shortcut: localeTextFunc('shiftF2', 'Shift+F2'),
            action: () => notesSvc!.showNote(access.params, true),
        });
    }

    if (!access.isReadOnly && !access.isSuppressed) {
        result.push({
            name: localeTextFunc('editNote', 'Edit Note'),
            shortcut: localeTextFunc('shiftF2', 'Shift+F2'),
            disabled: !access.canEdit,
            action: access.canEdit ? () => notesSvc!.showNote(access.params, true) : undefined,
        });
    }

    result.push({
        name: localeTextFunc('deleteNote', 'Remove Note'),
        disabled: !access.canDelete,
        action: access.canDelete
            ? () =>
                  notesSvc!.setNote({
                      ...access.params,
                      note: undefined,
                  })
            : undefined,
    });

    return result;
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
