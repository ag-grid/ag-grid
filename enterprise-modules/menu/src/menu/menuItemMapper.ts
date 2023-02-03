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
} from '@ag-grid-community/core';
import { ChartMenuItemMapper, ChartMenuOptionName } from './chartMenuItemMapper';

@Bean('menuItemMapper')
export class MenuItemMapper extends BeanStub {

    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('gridApi') private readonly gridApi: GridApi;
    @Optional('clipboardService') private readonly clipboardService: IClipboardService;
    @Optional('aggFuncService') private readonly aggFuncService: IAggFuncService;
    @Autowired('focusService') private readonly focusService: FocusService;
    @Autowired('rowPositionUtils') private readonly rowPositionUtils: RowPositionUtils;
    @Autowired('chartMenuItemMapper') private readonly chartMenuItemMapper: ChartMenuItemMapper;

    public mapWithStockItems(originalList: (MenuItemDef | string)[], column: Column | null): (MenuItemDef | string)[] {
        if (!originalList) {
            return [];
        }

        const resultList: (MenuItemDef | string)[] = [];

        originalList.forEach(menuItemOrString => {
            let result: MenuItemDef | string | null;

            if (typeof menuItemOrString === 'string') {
                result = this.getStockMenuItem(menuItemOrString, column);
            } else {
                // Spread to prevent leaking mapped subMenus back into the original menuItem
                result = { ...menuItemOrString };
            }
            // if no mapping, can happen when module is not loaded but user tries to use module anyway
            if (!result) { return; }

            const resultDef = result as MenuItemDef;
            const { subMenu } = resultDef;

            if (subMenu && subMenu instanceof Array) {
                resultDef.subMenu = this.mapWithStockItems(subMenu as (MenuItemDef | string)[], column);
            }

            if (result != null) {
                resultList.push(result);
            }
        });

        return resultList;
    }

    private getStockMenuItem(key: string, column: Column | null): MenuItemDef | string | null {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const skipHeaderOnAutoSize = this.gridOptionsService.is('skipHeaderOnAutoSize');

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
                    action: () => this.columnModel.setColumnPinned(column, 'left', "contextMenu"),
                    checked: !!column && column.isPinnedLeft()
                };
            case 'pinRight':
                return {
                    name: localeTextFunc('pinRight', 'Pin Right'),
                    action: () => this.columnModel.setColumnPinned(column, 'right', "contextMenu"),
                    checked: !!column && column.isPinnedRight()
                };
            case 'clearPinned':
                return {
                    name: localeTextFunc('noPin', 'No Pin'),
                    action: () => this.columnModel.setColumnPinned(column, null, "contextMenu"),
                    checked: !!column && !column.isPinned()
                };
            case 'valueAggSubMenu':
                if (ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Aggregation from Menu')) {
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
                    action: () => this.columnModel.autoSizeColumn(column, skipHeaderOnAutoSize, "contextMenu")
                };
            case 'autoSizeAll':
                return {
                    name: localeTextFunc('autosizeAllColumns', 'Autosize All Columns'),
                    action: () => this.columnModel.autoSizeAllColumns(skipHeaderOnAutoSize, "contextMenu")
                };
            case 'rowGroup':
                return {
                    name: localeTextFunc('groupBy', 'Group by') + ' ' + _.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    action: () => this.columnModel.addRowGroupColumn(column, "contextMenu"),
                    icon: _.createIconNoSpan('menuAddRowGroup', this.gridOptionsService, null)
                };
            case 'rowUnGroup':
                return {
                    name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + _.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    action: () => this.columnModel.removeRowGroupColumn(column, "contextMenu"),
                    icon: _.createIconNoSpan('menuRemoveRowGroup', this.gridOptionsService, null)
                };
            case 'resetColumns':
                return {
                    name: localeTextFunc('resetColumns', 'Reset Columns'),
                    action: () => this.columnModel.resetColumnState("contextMenu")
                };
            case 'expandAll':
                return {
                    name: localeTextFunc('expandAll', 'Expand All'),
                    action: () => this.gridApi.expandAll()
                };
            case 'contractAll':
                return {
                    name: localeTextFunc('collapseAll', 'Collapse All'),
                    action: () => this.gridApi.collapseAll()
                };
            case 'copy':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Copy from Menu')) {
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
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Copy with Headers from Menu')) {
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
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Copy with Group Headers from Menu')) {
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
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Cut from Menu')) {
                    const focusedCell = this.focusService.getFocusedCell();
                    const rowNode = focusedCell ? this.rowPositionUtils.getRowNode(focusedCell) : null;
                    const isEditable = rowNode ? focusedCell?.column.isCellEditable(rowNode) : false;
                    return {
                        name: localeTextFunc('cut', 'Cut'),
                        shortcut: localeTextFunc('ctrlX', 'Ctrl+X'),
                        disabled: !isEditable,
                        action: () => this.clipboardService.cutToClipboard()
                    };
                } else {
                    return null;
                }
            case 'paste':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Paste from Clipboard')) {
                    return {
                        name: localeTextFunc('paste', 'Paste'),
                        shortcut: localeTextFunc('ctrlV', 'Ctrl+V'),
                        disabled: false,
                        icon: _.createIconNoSpan('clipboardPaste', this.gridOptionsService, null),
                        action: () => this.clipboardService.pasteFromClipboard()
                    };
                } else {
                    return null;
                }
            case 'export':
                const exportSubMenuItems: string[] = [];

                const csvModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.CsvExportModule);
                const excelModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.ExcelExportModule);

                if (!this.gridOptionsService.is('suppressCsvExport') && csvModuleLoaded) {
                    exportSubMenuItems.push('csvExport');
                }
                if (!this.gridOptionsService.is('suppressExcelExport') && excelModuleLoaded) {
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
            default:
                return this.chartMenuItemMapper.getChartItems(key as ChartMenuOptionName) ?? null;
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
                    this.columnModel.removeValueColumn(columnToUse!, "contextMenu");
                    this.columnModel.setColumnAggFunc(columnToUse, undefined, "contextMenu");
                },
                checked: !columnIsAlreadyAggValue
            })

            funcNames.forEach(funcName => {
                result.push({
                    name: localeTextFunc(funcName, _.capitalise(funcName)),
                    action: () => {
                        this.columnModel.setColumnAggFunc(columnToUse, funcName, "contextMenu");
                        this.columnModel.addValueColumn(columnToUse, "contextMenu");
                    },
                    checked: columnIsAlreadyAggValue && columnToUse!.getAggFunc() === funcName
                });
            });

        }

        return result;
    }
}
