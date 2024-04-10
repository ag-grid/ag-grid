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

    
    @Autowired('gridApi') private readonly gridApi: GridApi;
    @Autowired('focusService') private readonly focusService: FocusService;
    @Autowired('rowPositionUtils') private readonly rowPositionUtils: RowPositionUtils;
    @Autowired('chartMenuItemMapper') private readonly chartMenuItemMapper: ChartMenuItemMapper;
    @Autowired('menuService') private readonly menuService: MenuService;
    @Autowired('sortController') private readonly sortController: SortController;
    
    @Optional('clipboardService') private readonly clipboardService?: IClipboardService;
    @Optional('aggFuncService') private readonly aggFuncService?: IAggFuncService;

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
        const localeTextFunc = this.beans.localeService.getLocaleTextFunc();
        const skipHeaderOnAutoSize = this.beans.gos.get('skipHeaderOnAutoSize');

        switch (key) {
            case 'pinSubMenu':
                return {
                    name: localeTextFunc('pinColumn', 'Pin Column'),
                    icon: _.createIconNoSpan('menuPin', this.beans.gos, null),
                    subMenu: ['clearPinned', 'pinLeft', 'pinRight']
                };
            case 'pinLeft':
                return {
                    name: localeTextFunc('pinLeft', 'Pin Left'),
                    action: () => this.beans.columnModel.setColumnsPinned([column], 'left', "contextMenu"),
                    checked: !!column && column.isPinnedLeft()
                };
            case 'pinRight':
                return {
                    name: localeTextFunc('pinRight', 'Pin Right'),
                    action: () => this.beans.columnModel.setColumnsPinned([column], 'right', "contextMenu"),
                    checked: !!column && column.isPinnedRight()
                };
            case 'clearPinned':
                return {
                    name: localeTextFunc('noPin', 'No Pin'),
                    action: () => this.beans.columnModel.setColumnsPinned([column], null, "contextMenu"),
                    checked: !!column && !column.isPinned()
                };
            case 'valueAggSubMenu':
                if (ModuleRegistry.__assertRegistered(ModuleNames.RowGroupingModule, 'Aggregation from Menu', this.beans.context.getGridId())) {
                    if (!column?.isPrimary() && !column?.getColDef().pivotValueColumn) {
                        return null;
                    }

                    return {
                        name: localeTextFunc('valueAggregation', 'Value Aggregation'),
                        icon: _.createIconNoSpan('menuValue', this.beans.gos, null),
                        subMenu: this.createAggregationSubMenu(column!, this.aggFuncService!)
                    };
                } else {
                    return null;
                }
            case 'autoSizeThis':
                return {
                    name: localeTextFunc('autosizeThiscolumn', 'Autosize This Column'),
                    action: () => this.beans.columnModel.autoSizeColumn(column, "contextMenu", skipHeaderOnAutoSize)
                };
            case 'autoSizeAll':
                return {
                    name: localeTextFunc('autosizeAllColumns', 'Autosize All Columns'),
                    action: () => this.beans.columnModel.autoSizeAllColumns("contextMenu", skipHeaderOnAutoSize)
                };
            case 'rowGroup':
                return {
                    name: localeTextFunc('groupBy', 'Group by') + ' ' + _.escapeString(this.beans.columnModel.getDisplayNameForColumn(column, 'header')),
                    disabled: column?.isRowGroupActive() || !column?.getColDef().enableRowGroup,
                    action: () => this.beans.columnModel.addRowGroupColumns([column], "contextMenu"),
                    icon: _.createIconNoSpan('menuAddRowGroup', this.beans.gos, null)
                };
            case 'rowUnGroup':
                const icon = _.createIconNoSpan('menuRemoveRowGroup', this.beans.gos, null);
                const showRowGroup = column?.getColDef().showRowGroup;
                const lockedGroups = this.beans.gos.get('groupLockGroupColumns');
                // Handle single auto group column
                if (showRowGroup === true) {
                    return {
                        name: localeTextFunc('ungroupAll', 'Un-Group All'),
                        disabled: lockedGroups === -1 || lockedGroups >= this.beans.columnModel.getRowGroupColumns().length,
                        action: () => this.beans.columnModel.setRowGroupColumns(this.beans.columnModel.getRowGroupColumns().slice(0, lockedGroups), "contextMenu"),
                        icon: icon
                    };
                }
                // Handle multiple auto group columns
                if (typeof showRowGroup === 'string') {
                    const underlyingColumn = this.beans.columnModel.getPrimaryColumn(showRowGroup);
                    const ungroupByName = (underlyingColumn != null) ? _.escapeString(this.beans.columnModel.getDisplayNameForColumn(underlyingColumn, 'header')) : showRowGroup;
                    return {
                        name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + ungroupByName,
                        disabled: underlyingColumn != null && this.beans.columnModel.isColumnGroupingLocked(underlyingColumn),
                        action: () => this.beans.columnModel.removeRowGroupColumns([showRowGroup], "contextMenu"),
                        icon: icon
                    };
                }
                // Handle primary column
                return {
                    name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + _.escapeString(this.beans.columnModel.getDisplayNameForColumn(column, 'header')),
                    disabled: !column?.isRowGroupActive() || !column?.getColDef().enableRowGroup || this.beans.columnModel.isColumnGroupingLocked(column),
                    action: () => this.beans.columnModel.removeRowGroupColumns([column], "contextMenu"),
                    icon: icon
                };
            case 'resetColumns':
                return {
                    name: localeTextFunc('resetColumns', 'Reset Columns'),
                    action: () => this.beans.columnModel.resetColumnState("contextMenu")
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
                if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'Copy from Menu', this.beans.context.getGridId())) {
                    return {
                        name: localeTextFunc('copy', 'Copy'),
                        shortcut: localeTextFunc('ctrlC', 'Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.beans.gos, null),
                        action: () => this.clipboardService!.copyToClipboard()
                    };
                } else {
                    return null;
                }
            case 'copyWithHeaders':
                if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'Copy with Headers from Menu', this.beans.context.getGridId())) {
                    return {
                        name: localeTextFunc('copyWithHeaders', 'Copy with Headers'),
                        // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.beans.gos, null),
                        action: () => this.clipboardService!.copyToClipboard({ includeHeaders: true })
                    };
                } else {
                    return null;
                }
            case 'copyWithGroupHeaders':
                if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'Copy with Group Headers from Menu', this.beans.context.getGridId())) {
                    return {
                        name: localeTextFunc('copyWithGroupHeaders', 'Copy with Group Headers'),
                        // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.beans.gos, null),
                        action: () => this.clipboardService!.copyToClipboard({ includeHeaders: true, includeGroupHeaders: true })
                    };
                } else {
                    return null;
                }
            case 'cut':
                if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'Cut from Menu', this.beans.context.getGridId())) {
                    const focusedCell = this.focusService.getFocusedCell();
                    const rowNode = focusedCell ? this.rowPositionUtils.getRowNode(focusedCell) : null;
                    const isEditable = rowNode ? focusedCell?.column.isCellEditable(rowNode) : false;
                    return {
                        name: localeTextFunc('cut', 'Cut'),
                        shortcut: localeTextFunc('ctrlX', 'Ctrl+X'),
                        icon: _.createIconNoSpan('clipboardCut', this.beans.gos, null),
                        disabled: !isEditable || this.beans.gos.get('suppressCutToClipboard'),
                        action: () => this.clipboardService!.cutToClipboard(undefined, 'contextMenu')
                    };
                } else {
                    return null;
                }
            case 'paste':
                if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'Paste from Clipboard', this.beans.context.getGridId())) {
                    return {
                        name: localeTextFunc('paste', 'Paste'),
                        shortcut: localeTextFunc('ctrlV', 'Ctrl+V'),
                        disabled: true,
                        icon: _.createIconNoSpan('clipboardPaste', this.beans.gos, null),
                        action: () => this.clipboardService!.pasteFromClipboard()
                    };
                } else {
                    return null;
                }
            case 'export':
                const exportSubMenuItems: string[] = [];

                const csvModuleLoaded = ModuleRegistry.__isRegistered(ModuleNames.CsvExportModule, this.beans.context.getGridId());
                const excelModuleLoaded = ModuleRegistry.__isRegistered(ModuleNames.ExcelExportModule, this.beans.context.getGridId());

                if (!this.beans.gos.get('suppressCsvExport') && csvModuleLoaded) {
                    exportSubMenuItems.push('csvExport');
                }
                if (!this.beans.gos.get('suppressExcelExport') && excelModuleLoaded) {
                    exportSubMenuItems.push('excelExport');
                }
                return {
                    name: localeTextFunc('export', 'Export'),
                    subMenu: exportSubMenuItems,
                    icon: _.createIconNoSpan('save', this.beans.gos, null),
                };
            case 'csvExport':
                return {
                    name: localeTextFunc('csvExport', 'CSV Export'),
                    icon: _.createIconNoSpan('csvExport', this.beans.gos, null),
                    action: () => this.gridApi.exportDataAsCsv({})
                };
            case 'excelExport':
                return {
                    name: localeTextFunc('excelExport', 'Excel Export'),
                    icon: _.createIconNoSpan('excelExport', this.beans.gos, null),
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
                        icon: _.createIconNoSpan('filter', this.beans.gos, null),
                        action: () => this.menuService.showFilterMenu({
                            column, buttonElement: sourceElement(), containerType: 'columnFilter', positionBy: 'button'
                        })
                    };
                } else {
                    return null;
                }
            case 'columnChooser':
                if (ModuleRegistry.__isRegistered(ModuleNames.ColumnsToolPanelModule, this.beans.context.getGridId())) {
                    return {
                        name: localeTextFunc('columnChooser', 'Choose Columns'),
                        icon: _.createIconNoSpan('columns', this.beans.gos, null),
                        action: () => this.menuService.showColumnChooser({ column, eventSource: sourceElement() })
                    }
                } else {
                    return null;
                }
            case 'sortAscending':
                return {
                    name: localeTextFunc('sortAscending', 'Sort Ascending'),
                    icon: _.createIconNoSpan('sortAscending', this.beans.gos, null),
                    action: () => this.sortController.setSortForColumn(column!, 'asc', false, 'columnMenu')
                }
            case 'sortDescending':
                return {
                    name: localeTextFunc('sortDescending', 'Sort Descending'),
                    icon: _.createIconNoSpan('sortDescending', this.beans.gos, null),
                    action: () => this.sortController.setSortForColumn(column!, 'desc', false, 'columnMenu')
                }
            case 'sortUnSort':
                return {
                    name: localeTextFunc('sortUnSort', 'Clear Sort'),
                    icon: _.createIconNoSpan('sortUnSort', this.beans.gos, null),
                    action: () => this.sortController.setSortForColumn(column!, null, false, 'columnMenu')
                }
            default: {
                console.warn(`AG Grid: unknown menu item type ${key}`);
                return null;
            }
        }
    }

    private createAggregationSubMenu(column: Column, aggFuncService: IAggFuncService): MenuItemDef[] {
        const localeTextFunc = this.beans.localeService.getLocaleTextFunc();

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
            const funcNames = aggFuncService.getFuncNames(columnToUse);

            result.push({
                name: localeTextFunc('noAggregation', 'None'),
                action: () => {
                    this.beans.columnModel.removeValueColumns([columnToUse!], "contextMenu");
                    this.beans.columnModel.setColumnAggFunc(columnToUse, undefined, "contextMenu");
                },
                checked: !columnIsAlreadyAggValue
            })

            funcNames.forEach(funcName => {
                result.push({
                    name: localeTextFunc(funcName, aggFuncService.getDefaultFuncLabel(funcName)),
                    action: () => {
                        this.beans.columnModel.setColumnAggFunc(columnToUse, funcName, "contextMenu");
                        this.beans.columnModel.addValueColumns([columnToUse!], "contextMenu");
                    },
                    checked: columnIsAlreadyAggValue && columnToUse!.getAggFunc() === funcName
                });
            });

        }

        return result;
    }
}
