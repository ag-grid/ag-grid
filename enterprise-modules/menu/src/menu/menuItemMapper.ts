import type {
    BeanCollection,
    BeanName,
    Column,
    ColumnApplyStateService,
    ColumnAutosizeService,
    ColumnModel,
    ColumnNameService,
    FocusService,
    FuncColsService,
    IAggFuncService,
    IClipboardService,
    ICsvCreator,
    IExcelCreator,
    IExpansionService,
    MenuItemDef,
    MenuService,
    RowPositionUtils,
    SortController,
} from '@ag-grid-community/core';
import {
    BeanStub,
    ModuleNames,
    ModuleRegistry,
    _createIconNoSpan,
    _escapeString,
    _exists,
} from '@ag-grid-community/core';

import type { ChartMenuItemMapper } from './chartMenuItemMapper';

export class MenuItemMapper extends BeanStub {
    beanName: BeanName = 'menuItemMapper';

    private columnModel: ColumnModel;
    private columnNameService: ColumnNameService;
    private columnApplyStateService: ColumnApplyStateService;
    private funcColsService: FuncColsService;
    private focusService: FocusService;
    private rowPositionUtils: RowPositionUtils;
    private chartMenuItemMapper: ChartMenuItemMapper;
    private menuService: MenuService;
    private sortController: SortController;
    private columnAutosizeService: ColumnAutosizeService;
    private expansionService: IExpansionService;
    private clipboardService?: IClipboardService;
    private aggFuncService?: IAggFuncService;
    private csvCreator?: ICsvCreator;
    private excelCreator?: IExcelCreator;

    public override wireBeans(beans: BeanCollection) {
        super.wireBeans(beans);
        this.columnModel = beans.columnModel;
        this.columnNameService = beans.columnNameService;
        this.columnApplyStateService = beans.columnApplyStateService;
        this.funcColsService = beans.funcColsService;
        this.focusService = beans.focusService;
        this.rowPositionUtils = beans.rowPositionUtils;
        this.chartMenuItemMapper = beans.chartMenuItemMapper;
        this.menuService = beans.menuService;
        this.sortController = beans.sortController;
        this.columnAutosizeService = beans.columnAutosizeService;
        this.expansionService = beans.expansionService;
        this.clipboardService = beans.clipboardService;
        this.aggFuncService = beans.aggFuncService;
        this.csvCreator = beans.csvCreator;
        this.excelCreator = beans.excelCreator;
    }

    public mapWithStockItems(
        originalList: (MenuItemDef | string)[],
        column: Column | null,
        sourceElement: () => HTMLElement
    ): (MenuItemDef | string)[] {
        if (!originalList) {
            return [];
        }

        const resultList: (MenuItemDef | string)[] = [];

        originalList.forEach((menuItemOrString) => {
            let result: MenuItemDef | string | null;

            if (typeof menuItemOrString === 'string') {
                result = this.getStockMenuItem(menuItemOrString, column, sourceElement);
            } else {
                // Spread to prevent leaking mapped subMenus back into the original menuItem
                result = { ...menuItemOrString };
            }
            // if no mapping, can happen when module is not loaded but user tries to use module anyway
            if (!result) {
                return;
            }

            const resultDef = result as MenuItemDef;
            const { subMenu } = resultDef;

            if (subMenu && subMenu instanceof Array) {
                resultDef.subMenu = this.mapWithStockItems(subMenu as (MenuItemDef | string)[], column, sourceElement);
            }

            if (result != null) {
                resultList.push(result);
            }
        });

        return resultList;
    }

    private getStockMenuItem(
        key: string,
        column: Column | null,
        sourceElement: () => HTMLElement
    ): MenuItemDef | string | null {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const skipHeaderOnAutoSize = this.gos.get('skipHeaderOnAutoSize');

        switch (key) {
            case 'pinSubMenu':
                return {
                    name: localeTextFunc('pinColumn', 'Pin Column'),
                    icon: _createIconNoSpan('menuPin', this.gos, null),
                    subMenu: ['clearPinned', 'pinLeft', 'pinRight'],
                };
            case 'pinLeft':
                return {
                    name: localeTextFunc('pinLeft', 'Pin Left'),
                    action: () => this.columnModel.setColsPinned([column], 'left', 'contextMenu'),
                    checked: !!column && column.isPinnedLeft(),
                };
            case 'pinRight':
                return {
                    name: localeTextFunc('pinRight', 'Pin Right'),
                    action: () => this.columnModel.setColsPinned([column], 'right', 'contextMenu'),
                    checked: !!column && column.isPinnedRight(),
                };
            case 'clearPinned':
                return {
                    name: localeTextFunc('noPin', 'No Pin'),
                    action: () => this.columnModel.setColsPinned([column], null, 'contextMenu'),
                    checked: !!column && !column.isPinned(),
                };
            case 'valueAggSubMenu':
                if (
                    ModuleRegistry.__assertRegistered(
                        ModuleNames.RowGroupingModule,
                        'Aggregation from Menu',
                        this.context.getGridId()
                    )
                ) {
                    if (!column?.isPrimary() && !column?.getColDef().pivotValueColumn) {
                        return null;
                    }

                    return {
                        name: localeTextFunc('valueAggregation', 'Value Aggregation'),
                        icon: _createIconNoSpan('menuValue', this.gos, null),
                        subMenu: this.createAggregationSubMenu(column!, this.aggFuncService!),
                    };
                } else {
                    return null;
                }
            case 'autoSizeThis':
                return {
                    name: localeTextFunc('autosizeThisColumn', 'Autosize This Column'),
                    action: () =>
                        this.columnAutosizeService.autoSizeColumn(column, 'contextMenu', skipHeaderOnAutoSize),
                };
            case 'autoSizeAll':
                return {
                    name: localeTextFunc('autosizeAllColumns', 'Autosize All Columns'),
                    action: () => this.columnAutosizeService.autoSizeAllColumns('contextMenu', skipHeaderOnAutoSize),
                };
            case 'rowGroup':
                return {
                    name:
                        localeTextFunc('groupBy', 'Group by') +
                        ' ' +
                        _escapeString(this.columnNameService.getDisplayNameForColumn(column, 'header')),
                    disabled: column?.isRowGroupActive() || !column?.getColDef().enableRowGroup,
                    action: () => this.funcColsService.addRowGroupColumns([column], 'contextMenu'),
                    icon: _createIconNoSpan('menuAddRowGroup', this.gos, null),
                };
            case 'rowUnGroup': {
                const icon = _createIconNoSpan('menuRemoveRowGroup', this.gos, null);
                const showRowGroup = column?.getColDef().showRowGroup;
                const lockedGroups = this.gos.get('groupLockGroupColumns');
                // Handle single auto group column
                if (showRowGroup === true) {
                    return {
                        name: localeTextFunc('ungroupAll', 'Un-Group All'),
                        disabled:
                            lockedGroups === -1 || lockedGroups >= this.funcColsService.getRowGroupColumns().length,
                        action: () =>
                            this.funcColsService.setRowGroupColumns(
                                this.funcColsService.getRowGroupColumns().slice(0, lockedGroups),
                                'contextMenu'
                            ),
                        icon: icon,
                    };
                }
                // Handle multiple auto group columns
                if (typeof showRowGroup === 'string') {
                    const underlyingColumn = this.columnModel.getColDefCol(showRowGroup);
                    const ungroupByName =
                        underlyingColumn != null
                            ? _escapeString(this.columnNameService.getDisplayNameForColumn(underlyingColumn, 'header'))
                            : showRowGroup;
                    return {
                        name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + ungroupByName,
                        disabled: underlyingColumn != null && this.columnModel.isColGroupLocked(underlyingColumn),
                        action: () => this.funcColsService.removeRowGroupColumns([showRowGroup], 'contextMenu'),
                        icon: icon,
                    };
                }
                // Handle primary column
                return {
                    name:
                        localeTextFunc('ungroupBy', 'Un-Group by') +
                        ' ' +
                        _escapeString(this.columnNameService.getDisplayNameForColumn(column, 'header')),
                    disabled:
                        !column?.isRowGroupActive() ||
                        !column?.getColDef().enableRowGroup ||
                        this.columnModel.isColGroupLocked(column),
                    action: () => this.funcColsService.removeRowGroupColumns([column], 'contextMenu'),
                    icon: icon,
                };
            }
            case 'resetColumns':
                return {
                    name: localeTextFunc('resetColumns', 'Reset Columns'),
                    action: () => this.columnApplyStateService.resetColumnState('contextMenu'),
                };
            case 'expandAll':
                return {
                    name: localeTextFunc('expandAll', 'Expand All Row Groups'),
                    action: () => this.expansionService.expandAll(true),
                };
            case 'contractAll':
                return {
                    name: localeTextFunc('collapseAll', 'Collapse All Row Groups'),
                    action: () => this.expansionService.expandAll(false),
                };
            case 'copy':
                if (
                    ModuleRegistry.__assertRegistered(
                        ModuleNames.ClipboardModule,
                        'Copy from Menu',
                        this.context.getGridId()
                    )
                ) {
                    return {
                        name: localeTextFunc('copy', 'Copy'),
                        shortcut: localeTextFunc('ctrlC', 'Ctrl+C'),
                        icon: _createIconNoSpan('clipboardCopy', this.gos, null),
                        action: () => this.clipboardService!.copyToClipboard(),
                    };
                } else {
                    return null;
                }
            case 'copyWithHeaders':
                if (
                    ModuleRegistry.__assertRegistered(
                        ModuleNames.ClipboardModule,
                        'Copy with Headers from Menu',
                        this.context.getGridId()
                    )
                ) {
                    return {
                        name: localeTextFunc('copyWithHeaders', 'Copy with Headers'),
                        // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                        icon: _createIconNoSpan('clipboardCopy', this.gos, null),
                        action: () => this.clipboardService!.copyToClipboard({ includeHeaders: true }),
                    };
                } else {
                    return null;
                }
            case 'copyWithGroupHeaders':
                if (
                    ModuleRegistry.__assertRegistered(
                        ModuleNames.ClipboardModule,
                        'Copy with Group Headers from Menu',
                        this.context.getGridId()
                    )
                ) {
                    return {
                        name: localeTextFunc('copyWithGroupHeaders', 'Copy with Group Headers'),
                        // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                        icon: _createIconNoSpan('clipboardCopy', this.gos, null),
                        action: () =>
                            this.clipboardService!.copyToClipboard({ includeHeaders: true, includeGroupHeaders: true }),
                    };
                } else {
                    return null;
                }
            case 'cut':
                if (
                    ModuleRegistry.__assertRegistered(
                        ModuleNames.ClipboardModule,
                        'Cut from Menu',
                        this.context.getGridId()
                    )
                ) {
                    const focusedCell = this.focusService.getFocusedCell();
                    const rowNode = focusedCell ? this.rowPositionUtils.getRowNode(focusedCell) : null;
                    const isEditable = rowNode ? focusedCell?.column.isCellEditable(rowNode) : false;
                    return {
                        name: localeTextFunc('cut', 'Cut'),
                        shortcut: localeTextFunc('ctrlX', 'Ctrl+X'),
                        icon: _createIconNoSpan('clipboardCut', this.gos, null),
                        disabled: !isEditable || this.gos.get('suppressCutToClipboard'),
                        action: () => this.clipboardService!.cutToClipboard(undefined, 'contextMenu'),
                    };
                } else {
                    return null;
                }
            case 'paste':
                if (
                    ModuleRegistry.__assertRegistered(
                        ModuleNames.ClipboardModule,
                        'Paste from Clipboard',
                        this.context.getGridId()
                    )
                ) {
                    return {
                        name: localeTextFunc('paste', 'Paste'),
                        shortcut: localeTextFunc('ctrlV', 'Ctrl+V'),
                        disabled: true,
                        icon: _createIconNoSpan('clipboardPaste', this.gos, null),
                        action: () => this.clipboardService!.pasteFromClipboard(),
                    };
                } else {
                    return null;
                }
            case 'export': {
                const exportSubMenuItems: string[] = [];

                const csvModuleLoaded = ModuleRegistry.__isRegistered(
                    ModuleNames.CsvExportModule,
                    this.context.getGridId()
                );
                const excelModuleLoaded = ModuleRegistry.__isRegistered(
                    ModuleNames.ExcelExportModule,
                    this.context.getGridId()
                );

                if (!this.gos.get('suppressCsvExport') && csvModuleLoaded) {
                    exportSubMenuItems.push('csvExport');
                }
                if (!this.gos.get('suppressExcelExport') && excelModuleLoaded) {
                    exportSubMenuItems.push('excelExport');
                }
                return {
                    name: localeTextFunc('export', 'Export'),
                    subMenu: exportSubMenuItems,
                    icon: _createIconNoSpan('save', this.gos, null),
                };
            }
            case 'csvExport':
                return {
                    name: localeTextFunc('csvExport', 'CSV Export'),
                    icon: _createIconNoSpan('csvExport', this.gos, null),
                    action: () => this.csvCreator?.exportDataAsCsv(),
                };
            case 'excelExport':
                return {
                    name: localeTextFunc('excelExport', 'Excel Export'),
                    icon: _createIconNoSpan('excelExport', this.gos, null),
                    action: () => this.excelCreator?.exportDataAsExcel(),
                };
            case 'separator':
                return 'separator';
            case 'pivotChart':
            case 'chartRange':
                return this.chartMenuItemMapper.getChartItems(key) ?? null;
            case 'columnFilter':
                if (column) {
                    return {
                        name: localeTextFunc('columnFilter', 'Column Filter'),
                        icon: _createIconNoSpan('filter', this.gos, null),
                        action: () =>
                            this.menuService.showFilterMenu({
                                column,
                                buttonElement: sourceElement(),
                                containerType: 'columnFilter',
                                positionBy: 'button',
                            }),
                    };
                } else {
                    return null;
                }
            case 'columnChooser':
                if (ModuleRegistry.__isRegistered(ModuleNames.ColumnsToolPanelModule, this.context.getGridId())) {
                    return {
                        name: localeTextFunc('columnChooser', 'Choose Columns'),
                        icon: _createIconNoSpan('columns', this.gos, null),
                        action: () => this.menuService.showColumnChooser({ column, eventSource: sourceElement() }),
                    };
                } else {
                    return null;
                }
            case 'sortAscending':
                return {
                    name: localeTextFunc('sortAscending', 'Sort Ascending'),
                    icon: _createIconNoSpan('sortAscending', this.gos, null),
                    action: () => this.sortController.setSortForColumn(column!, 'asc', false, 'columnMenu'),
                };
            case 'sortDescending':
                return {
                    name: localeTextFunc('sortDescending', 'Sort Descending'),
                    icon: _createIconNoSpan('sortDescending', this.gos, null),
                    action: () => this.sortController.setSortForColumn(column!, 'desc', false, 'columnMenu'),
                };
            case 'sortUnSort':
                return {
                    name: localeTextFunc('sortUnSort', 'Clear Sort'),
                    icon: _createIconNoSpan('sortUnSort', this.gos, null),
                    action: () => this.sortController.setSortForColumn(column!, null, false, 'columnMenu'),
                };
            default: {
                console.warn(`AG Grid: unknown menu item type ${key}`);
                return null;
            }
        }
    }

    private createAggregationSubMenu(column: Column, aggFuncService: IAggFuncService): MenuItemDef[] {
        const localeTextFunc = this.localeService.getLocaleTextFunc();

        let columnToUse: Column | undefined;
        if (column.isPrimary()) {
            columnToUse = column;
        } else {
            const pivotValueColumn = column.getColDef().pivotValueColumn;
            columnToUse = _exists(pivotValueColumn) ? pivotValueColumn : undefined;
        }

        const result: MenuItemDef[] = [];
        if (columnToUse) {
            const columnIsAlreadyAggValue = columnToUse.isValueActive();
            const funcNames = aggFuncService.getFuncNames(columnToUse);

            result.push({
                name: localeTextFunc('noAggregation', 'None'),
                action: () => {
                    this.funcColsService.removeValueColumns([columnToUse!], 'contextMenu');
                    this.funcColsService.setColumnAggFunc(columnToUse, undefined, 'contextMenu');
                },
                checked: !columnIsAlreadyAggValue,
            });

            funcNames.forEach((funcName) => {
                result.push({
                    name: localeTextFunc(funcName, aggFuncService.getDefaultFuncLabel(funcName)),
                    action: () => {
                        this.funcColsService.setColumnAggFunc(columnToUse, funcName, 'contextMenu');
                        this.funcColsService.addValueColumns([columnToUse!], 'contextMenu');
                    },
                    checked: columnIsAlreadyAggValue && columnToUse!.getAggFunc() === funcName,
                });
            });
        }

        return result;
    }
}
