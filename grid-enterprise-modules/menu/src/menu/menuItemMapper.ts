import {
    _,
    Autowired,
    Bean,
    BeanStub,
    Column,
    ColumnModel,
    GridApi,
    IAggFuncService,
    IClipboardService,
    MenuItemDef,
    ModuleNames, ModuleRegistry,
    Optional,
    FocusService,
    RowPositionUtils,
    MenuService,
    SortController,
} from '@ag-grid-community/core';
import { ChartMenuItemMapper } from './chartMenuItemMapper';

@Bean('menuItemMapper')
export class MenuItemMapper extends BeanStub {

    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('gridApi') private readonly gridApi: GridApi;
    @Optional('clipboardService') private readonly clipboardService: IClipboardService;
    @Optional('aggFuncService') private readonly aggFuncService: IAggFuncService;
    @Autowired('focusService') private readonly focusService: FocusService;
    @Autowired('rowPositionUtils') private readonly rowPositionUtils: RowPositionUtils;
    @Autowired('chartMenuItemMapper') private readonly chartMenuItemMapper: ChartMenuItemMapper;
    @Autowired('menuService') private readonly menuService: MenuService;
    @Autowired('sortController') private readonly sortController: SortController;

    public mapWithStockItems(originalList: (MenuItemDef | string)[], column: Column | null, sourceElement: () => HTMLElement): (MenuItemDef | string)[] {
        if (!originalList) {
            return [];
        }

        const resultList: (MenuItemDef | string)[] = [];

        originalList.forEach(menuItemOrString => {
            let result: MenuItemDef | string | null;

            if (typeof menuItemOrString === 'string') {
                result = this.getStockMenuItem(menuItemOrString, column, sourceElement);
            } else {
                // Spread to prevent leaking mapped subMenus back into the original menuItem
                result = { ...menuItemOrString };
            }
            // if no mapping, can happen when module is not loaded but user tries to use module anyway
            if (!result) { return; }

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

    private getStockMenuItem(key: string, column: Column | null, sourceElement: () => HTMLElement): MenuItemDef | string | null {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const skipHeaderOnAutoSize = this.gridOptionsService.get('skipHeaderOnAutoSize');

        switch (key) {
            case 'pinSubMenu':
                return {
                    name: localeTextFunc('pinColumn', 'Pin Column'),
                    icon: _.createIconNoSpan('menuPin', this.gridOptionsService, null),
                    subMenu: ['clearPinned', 'pinLeft', 'pinRight']
                };
            case 'pinLeft':
                return {
                    name: localeTextFunc('pinLeft', 'Pin Left'),
                    action: () => this.columnModel.setColumnsPinned([column], 'left', "contextMenu"),
                    checked: !!column && column.isPinnedLeft()
                };
            case 'pinRight':
                return {
                    name: localeTextFunc('pinRight', 'Pin Right'),
                    action: () => this.columnModel.setColumnsPinned([column], 'right', "contextMenu"),
                    checked: !!column && column.isPinnedRight()
                };
            case 'clearPinned':
                return {
                    name: localeTextFunc('noPin', 'No Pin'),
                    action: () => this.columnModel.setColumnsPinned([column], null, "contextMenu"),
                    checked: !!column && !column.isPinned()
                };
            case 'valueAggSubMenu':
                if (ModuleRegistry.__assertRegistered(ModuleNames.RowGroupingModule, 'Aggregation from Menu', this.context.getGridId())) {
                    if (!column?.isPrimary() && !column?.getColDef().pivotValueColumn) {
                        return null;
                    }

                    return {
                        name: localeTextFunc('valueAggregation', 'Value Aggregation'),
                        icon: _.createIconNoSpan('menuValue', this.gridOptionsService, null),
                        subMenu: this.createAggregationSubMenu(column!)
                    };
                } else {
                    return null;
                }
            case 'autoSizeThis':
                return {
                    name: localeTextFunc('autosizeThiscolumn', 'Autosize This Column'),
                    action: () => this.columnModel.autoSizeColumn(column, "contextMenu", skipHeaderOnAutoSize)
                };
            case 'autoSizeAll':
                return {
                    name: localeTextFunc('autosizeAllColumns', 'Autosize All Columns'),
                    action: () => this.columnModel.autoSizeAllColumns("contextMenu", skipHeaderOnAutoSize)
                };
            case 'rowGroup':
                return {
                    name: localeTextFunc('groupBy', 'Group by') + ' ' + _.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    disabled: column?.isRowGroupActive() || !column?.getColDef().enableRowGroup,
                    action: () => this.columnModel.addRowGroupColumns([column], "contextMenu"),
                    icon: _.createIconNoSpan('menuAddRowGroup', this.gridOptionsService, null)
                };
            case 'rowUnGroup':
                const icon = _.createIconNoSpan('menuRemoveRowGroup', this.gridOptionsService, null);
                const showRowGroup = column?.getColDef().showRowGroup;
                const lockedGroups = this.gridOptionsService.get('groupLockGroupColumns');
                // Handle single auto group column
                if (showRowGroup === true) {
                    return {
                        name: localeTextFunc('ungroupAll', 'Un-Group All'),
                        disabled: lockedGroups === -1 || lockedGroups >= this.columnModel.getRowGroupColumns().length,
                        action: () => this.columnModel.setRowGroupColumns(this.columnModel.getRowGroupColumns().slice(0, lockedGroups), "contextMenu"),
                        icon: icon
                    };
                }
                // Handle multiple auto group columns
                if (typeof showRowGroup === 'string') {
                    const underlyingColumn = this.columnModel.getPrimaryColumn(showRowGroup);
                    const ungroupByName = (underlyingColumn != null) ? _.escapeString(this.columnModel.getDisplayNameForColumn(underlyingColumn, 'header')) : showRowGroup;
                    return {
                        name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + ungroupByName,
                        disabled: underlyingColumn != null && this.columnModel.isColumnGroupingLocked(underlyingColumn),
                        action: () => this.columnModel.removeRowGroupColumns([showRowGroup], "contextMenu"),
                        icon: icon
                    };
                }
                // Handle primary column
                return {
                    name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + _.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    disabled: !column?.isRowGroupActive() || !column?.getColDef().enableRowGroup || this.columnModel.isColumnGroupingLocked(column),
                    action: () => this.columnModel.removeRowGroupColumns([column], "contextMenu"),
                    icon: icon
                };
            case 'resetColumns':
                return {
                    name: localeTextFunc('resetColumns', 'Reset Columns'),
                    action: () => this.columnModel.resetColumnState("contextMenu")
                };
            case 'expandAll':
                return {
                    name: localeTextFunc('expandAll', 'Expand All Row Groups'),
                    action: () => this.gridApi.expandAll()
                };
            case 'contractAll':
                return {
                    name: localeTextFunc('collapseAll', 'Collapse All Row Groups'),
                    action: () => this.gridApi.collapseAll()
                };
            case 'copy':
                if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'Copy from Menu', this.context.getGridId())) {
                    return {
                        name: localeTextFunc('copy', 'Copy'),
                        shortcut: localeTextFunc('ctrlC', 'Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.gridOptionsService, null),
                        action: () => this.clipboardService.copyToClipboard()
                    };
                } else {
                    return null;
                }
            case 'copyWithHeaders':
                if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'Copy with Headers from Menu', this.context.getGridId())) {
                    return {
                        name: localeTextFunc('copyWithHeaders', 'Copy with Headers'),
                        // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.gridOptionsService, null),
                        action: () => this.clipboardService.copyToClipboard({ includeHeaders: true })
                    };
                } else {
                    return null;
                }
            case 'copyWithGroupHeaders':
                if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'Copy with Group Headers from Menu', this.context.getGridId())) {
                    return {
                        name: localeTextFunc('copyWithGroupHeaders', 'Copy with Group Headers'),
                        // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.gridOptionsService, null),
                        action: () => this.clipboardService.copyToClipboard({ includeHeaders: true, includeGroupHeaders: true })
                    };
                } else {
                    return null;
                }
            case 'cut':
                if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'Cut from Menu', this.context.getGridId())) {
                    const focusedCell = this.focusService.getFocusedCell();
                    const rowNode = focusedCell ? this.rowPositionUtils.getRowNode(focusedCell) : null;
                    const isEditable = rowNode ? focusedCell?.column.isCellEditable(rowNode) : false;
                    return {
                        name: localeTextFunc('cut', 'Cut'),
                        shortcut: localeTextFunc('ctrlX', 'Ctrl+X'),
                        icon: _.createIconNoSpan('clipboardCut', this.gridOptionsService, null),
                        disabled: !isEditable || this.gridOptionsService.get('suppressCutToClipboard'),
                        action: () => this.clipboardService.cutToClipboard(undefined, 'contextMenu')
                    };
                } else {
                    return null;
                }
            case 'paste':
                if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'Paste from Clipboard', this.context.getGridId())) {
                    return {
                        name: localeTextFunc('paste', 'Paste'),
                        shortcut: localeTextFunc('ctrlV', 'Ctrl+V'),
                        disabled: true,
                        icon: _.createIconNoSpan('clipboardPaste', this.gridOptionsService, null),
                        action: () => this.clipboardService.pasteFromClipboard()
                    };
                } else {
                    return null;
                }
            case 'export':
                const exportSubMenuItems: string[] = [];

                const csvModuleLoaded = ModuleRegistry.__isRegistered(ModuleNames.CsvExportModule, this.context.getGridId());
                const excelModuleLoaded = ModuleRegistry.__isRegistered(ModuleNames.ExcelExportModule, this.context.getGridId());

                if (!this.gridOptionsService.get('suppressCsvExport') && csvModuleLoaded) {
                    exportSubMenuItems.push('csvExport');
                }
                if (!this.gridOptionsService.get('suppressExcelExport') && excelModuleLoaded) {
                    exportSubMenuItems.push('excelExport');
                }
                return {
                    name: localeTextFunc('export', 'Export'),
                    subMenu: exportSubMenuItems,
                    icon: _.createIconNoSpan('save', this.gridOptionsService, null),
                };
            case 'csvExport':
                return {
                    name: localeTextFunc('csvExport', 'CSV Export'),
                    icon: _.createIconNoSpan('csvExport', this.gridOptionsService, null),
                    action: () => this.gridApi.exportDataAsCsv({})
                };
            case 'excelExport':
                return {
                    name: localeTextFunc('excelExport', 'Excel Export'),
                    icon: _.createIconNoSpan('excelExport', this.gridOptionsService, null),
                    action: () => this.gridApi.exportDataAsExcel()
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
                        icon: _.createIconNoSpan('filter', this.gridOptionsService, null),
                        action: () => this.menuService.showFilterMenu({
                            column, buttonElement: sourceElement(), containerType: 'columnFilter', positionBy: 'button'
                        })
                    };
                } else {
                    return null;
                }
            case 'columnChooser':
                if (ModuleRegistry.__isRegistered(ModuleNames.ColumnsToolPanelModule, this.context.getGridId())) {
                    return {
                        name: localeTextFunc('columnChooser', 'Choose Columns'),
                        icon: _.createIconNoSpan('columns', this.gridOptionsService, null),
                        action: () => this.menuService.showColumnChooser({ column, eventSource: sourceElement() })
                    }
                } else {
                    return null;
                }
            case 'sortAscending':
                return {
                    name: localeTextFunc('sortAscending', 'Sort Ascending'),
                    icon: _.createIconNoSpan('sortAscending', this.gridOptionsService, null),
                    action: () => this.sortController.setSortForColumn(column!, 'asc', false, 'columnMenu')
                }
            case 'sortDescending':
                return {
                    name: localeTextFunc('sortDescending', 'Sort Descending'),
                    icon: _.createIconNoSpan('sortDescending', this.gridOptionsService, null),
                    action: () => this.sortController.setSortForColumn(column!, 'desc', false, 'columnMenu')
                }
            case 'sortUnSort':
                return {
                    name: localeTextFunc('sortUnSort', 'Clear Sort'),
                    icon: _.createIconNoSpan('sortUnSort', this.gridOptionsService, null),
                    action: () => this.sortController.setSortForColumn(column!, null, false, 'columnMenu')
                }
            default: {
                console.warn(`AG Grid: unknown menu item type ${key}`);
                return null;
            }
        }
    }

    private createAggregationSubMenu(column: Column): MenuItemDef[] {
        const localeTextFunc = this.localeService.getLocaleTextFunc();

        let columnToUse: Column | undefined;
        if (column.isPrimary()) {
            columnToUse = column;
        } else {
            const pivotValueColumn = column.getColDef().pivotValueColumn;
            columnToUse = _.exists(pivotValueColumn) ? pivotValueColumn : undefined;
        }

        const result: MenuItemDef[] = [];
        if (columnToUse) {
            const columnIsAlreadyAggValue = columnToUse.isValueActive();
            const funcNames = this.aggFuncService.getFuncNames(columnToUse);

            result.push({
                name: localeTextFunc('noAggregation', 'None'),
                action: () => {
                    this.columnModel.removeValueColumns([columnToUse!], "contextMenu");
                    this.columnModel.setColumnAggFunc(columnToUse, undefined, "contextMenu");
                },
                checked: !columnIsAlreadyAggValue
            })

            funcNames.forEach(funcName => {
                result.push({
                    name: localeTextFunc(funcName, this.aggFuncService.getDefaultFuncLabel(funcName)),
                    action: () => {
                        this.columnModel.setColumnAggFunc(columnToUse, funcName, "contextMenu");
                        this.columnModel.addValueColumns([columnToUse!], "contextMenu");
                    },
                    checked: columnIsAlreadyAggValue && columnToUse!.getAggFunc() === funcName
                });
            });

        }

        return result;
    }
}
