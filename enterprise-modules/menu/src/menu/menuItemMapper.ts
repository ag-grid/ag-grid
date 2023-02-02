import {
    _,
    Autowired,
    Bean,
    BeanStub,
    ChartType,
    Column,
    ColumnModel,
    GridApi,
    IAggFuncService,
    IChartService,
    IClipboardService,
    MenuItemDef,
    ModuleNames, ModuleRegistry,
    Optional,
    FocusService,
    RowPositionUtils,
    ChartGroupsDef
} from '@ag-grid-community/core';
import { ChartMenuOptionName, getValidChartMenuItems } from './chartMenuMapper';

@Bean('menuItemMapper')
export class MenuItemMapper extends BeanStub {

    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('gridApi') private readonly gridApi: GridApi;
    @Optional('clipboardService') private readonly clipboardService: IClipboardService;
    @Optional('aggFuncService') private readonly aggFuncService: IAggFuncService;
    @Optional('chartService') private readonly chartService: IChartService;
    @Autowired('focusService') private readonly focusService: FocusService;
    @Autowired('rowPositionUtils') private readonly rowPositionUtils: RowPositionUtils;

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
                const subMenus = this.mapWithStockItems(subMenu as (MenuItemDef | string)[], column);
                if (subMenus.length > 0) {
                    resultDef.subMenu = subMenus
                } else {
                    // All the subMenus were filtered out so do not include this menuItem
                    return;
                }
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
                {
                    const chartGroupsDef = this.gridOptionsService.get('chartToolPanelsDef')?.settingsPanel?.chartGroupsDef;
                    const chartMenuItem = this.getChartItems(key as ChartMenuOptionName, chartGroupsDef);
                    return chartMenuItem;
                }
        }
    }

    private getChartItems(key: ChartMenuOptionName, chartGroupsDef: ChartGroupsDef | undefined): MenuItemDef | null {
        const localeTextFunc = this.localeService.getLocaleTextFunc();

        const pivotChartMenuItem = (localeKey: string, defaultText: string, chartType: ChartType) => {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: () => this.chartService.createPivotChart({ chartType })
            };
        };

        const rangeChartMenuItem = (localeKey: string, defaultText: string, chartType: ChartType) => {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: () => this.chartService.createChartFromCurrentRange(chartType)
            };
        };

        let chartMenuItem: MenuItemDef;
        switch (key) {
            case 'pivotChart':
                chartMenuItem = {
                    name: localeTextFunc('pivotChart', 'Pivot Chart'),
                    subMenu: [
                        'pivotColumnChart',
                        'pivotBarChart',
                        'pivotPieChart',
                        'pivotLineChart',
                        'pivotXYChart',
                        'pivotAreaChart'
                    ],
                    icon: _.createIconNoSpan('chart', this.gridOptionsService, null),
                };
                break;
            case 'chartRange':
                chartMenuItem = {
                    name: localeTextFunc('chartRange', 'Chart Range'),
                    subMenu: [
                        'rangeColumnChart',
                        'rangeBarChart',
                        'rangePieChart',
                        'rangeLineChart',
                        'rangeXYChart',
                        'rangeAreaChart',
                        'rangeHistogramChart',
                        'rangeCombinationChart'
                    ],
                    icon: _.createIconNoSpan('chart', this.gridOptionsService, null),
                };
                break;
            case 'pivotColumnChart':
                chartMenuItem = {
                    name: localeTextFunc('columnChart', 'Column'),
                    subMenu: ['pivotGroupedColumn', 'pivotStackedColumn', 'pivotNormalizedColumn']
                };
                break;
            case 'pivotGroupedColumn':
                chartMenuItem = pivotChartMenuItem('groupedColumn', 'Grouped&lrm;', 'groupedColumn');
                break;
            case 'pivotStackedColumn':
                chartMenuItem = pivotChartMenuItem('stackedColumn', 'Stacked&lrm;', 'stackedColumn');
                break;
            case 'pivotNormalizedColumn':
                chartMenuItem = pivotChartMenuItem('normalizedColumn', '100% Stacked&lrm;', 'normalizedColumn');
                break;
            case 'rangeColumnChart':
                chartMenuItem = {
                    name: localeTextFunc('columnChart', 'Column'),
                    subMenu: ['rangeGroupedColumn', 'rangeStackedColumn', 'rangeNormalizedColumn']
                };
                break;
            case 'rangeGroupedColumn':
                chartMenuItem = rangeChartMenuItem('groupedColumn', 'Grouped&lrm;', 'groupedColumn');
                break;
            case 'rangeStackedColumn':
                chartMenuItem = rangeChartMenuItem('stackedColumn', 'Stacked&lrm;', 'stackedColumn');
                break;
            case 'rangeNormalizedColumn':
                chartMenuItem = rangeChartMenuItem('normalizedColumn', '100% Stacked&lrm;', 'normalizedColumn');
                break;
            case 'pivotBarChart':
                chartMenuItem = {
                    name: localeTextFunc('barChart', 'Bar'),
                    subMenu: ['pivotGroupedBar', 'pivotStackedBar', 'pivotNormalizedBar']
                };
                break;
            case 'pivotGroupedBar':
                chartMenuItem = pivotChartMenuItem('groupedBar', 'Grouped&lrm;', 'groupedBar');
                break;
            case 'pivotStackedBar':
                chartMenuItem = pivotChartMenuItem('stackedBar', 'Stacked&lrm;', 'stackedBar');
                break;
            case 'pivotNormalizedBar':
                chartMenuItem = pivotChartMenuItem('normalizedBar', '100% Stacked&lrm;', 'normalizedBar');
                break;
            case 'rangeBarChart':
                chartMenuItem = {
                    name: localeTextFunc('barChart', 'Bar'),
                    subMenu: ['rangeGroupedBar', 'rangeStackedBar', 'rangeNormalizedBar']
                };
                break;
            case 'rangeGroupedBar':
                chartMenuItem = rangeChartMenuItem('groupedBar', 'Grouped&lrm;', 'groupedBar');
                break;
            case 'rangeStackedBar':
                chartMenuItem = rangeChartMenuItem('stackedBar', 'Stacked&lrm;', 'stackedBar');
                break;
            case 'rangeNormalizedBar':
                chartMenuItem = rangeChartMenuItem('normalizedBar', '100% Stacked&lrm;', 'normalizedBar');
                break;
            case 'pivotPieChart':
                chartMenuItem = {
                    name: localeTextFunc('pieChart', 'Pie'),
                    subMenu: ['pivotPie', 'pivotDoughnut']
                };
                break;
            case 'pivotPie':
                chartMenuItem = pivotChartMenuItem('pie', 'Pie&lrm;', 'pie');
                break;
            case 'pivotDoughnut':
                chartMenuItem = pivotChartMenuItem('doughnut', 'Doughnut&lrm;', 'doughnut');
                break;
            case 'rangePieChart':
                chartMenuItem = {
                    name: localeTextFunc('pieChart', 'Pie'),
                    subMenu: ['rangePie', 'rangeDoughnut']
                };
                break;
            case 'rangePie':
                chartMenuItem = rangeChartMenuItem('pie', 'Pie&lrm;', 'pie');
                break;
            case 'rangeDoughnut':
                chartMenuItem = rangeChartMenuItem('doughnut', 'Doughnut&lrm;', 'doughnut');
                break;
            case 'pivotLineChart':
                chartMenuItem = pivotChartMenuItem('line', 'Line&lrm;', 'line');
                break;
            case 'rangeLineChart':
                chartMenuItem = rangeChartMenuItem('line', 'Line&lrm;', 'line');
                break;
            case 'pivotXYChart':
                chartMenuItem = {
                    name: localeTextFunc('xyChart', 'X Y (Scatter)'),
                    subMenu: ['pivotScatter', 'pivotBubble']
                };
                break;
            case 'pivotScatter':
                chartMenuItem = pivotChartMenuItem('scatter', 'Scatter&lrm;', 'scatter');
                break;
            case 'pivotBubble':
                chartMenuItem = pivotChartMenuItem('bubble', 'Bubble&lrm;', 'bubble');
                break;
            case 'rangeXYChart':
                chartMenuItem = {
                    name: localeTextFunc('xyChart', 'X Y (Scatter)'),
                    subMenu: ['rangeScatter', 'rangeBubble']
                };
                break;
            case 'rangeScatter':
                chartMenuItem = rangeChartMenuItem('scatter', 'Scatter&lrm;', 'scatter');
                break;
            case 'rangeBubble':
                chartMenuItem = rangeChartMenuItem('bubble', 'Bubble&lrm;', 'bubble');
                break;
            case 'pivotAreaChart':
                chartMenuItem = {
                    name: localeTextFunc('areaChart', 'Area'),
                    subMenu: ['pivotArea', 'pivotStackedArea', 'pivotNormalizedArea']
                };
                break;
            case 'pivotArea':
                chartMenuItem = pivotChartMenuItem('area', 'Area&lrm;', 'area');
                break;
            case 'pivotStackedArea':
                chartMenuItem = pivotChartMenuItem('stackedArea', 'Stacked&lrm;', 'stackedArea');
                break;
            case 'pivotNormalizedArea':
                chartMenuItem = pivotChartMenuItem('normalizedArea', '100% Stacked&lrm;', 'normalizedArea');
                break;
            case 'rangeAreaChart':
                chartMenuItem = {
                    name: localeTextFunc('areaChart', 'Area'),
                    subMenu: ['rangeArea', 'rangeStackedArea', 'rangeNormalizedArea']
                };
                break;
            case 'rangeArea':
                chartMenuItem = rangeChartMenuItem('area', 'Area&lrm;', 'area');
                break;
            case 'rangeStackedArea':
                chartMenuItem = rangeChartMenuItem('stackedArea', 'Stacked&lrm;', 'stackedArea');
                break;
            case 'rangeNormalizedArea':
                chartMenuItem = rangeChartMenuItem('normalizedArea', '100% Stacked&lrm;', 'normalizedArea');
                break;
            case 'rangeHistogramChart':
                chartMenuItem = rangeChartMenuItem('histogramChart', 'Histogram&lrm;', 'histogram');
                break;
            case 'rangeColumnLineCombo':
                chartMenuItem = rangeChartMenuItem('columnLineCombo', 'Column & Line&lrm;', 'columnLineCombo');
                break;
            case 'rangeAreaColumnCombo':
                chartMenuItem = rangeChartMenuItem('AreaColumnCombo', 'Area & Column&lrm;', 'areaColumnCombo');
                break;
            case 'rangeCombinationChart':
                chartMenuItem = {
                    name: localeTextFunc('combinationChart', 'Combination'),
                    subMenu: ['rangeColumnLineCombo', 'rangeAreaColumnCombo']
                };
                break;
            default:
                console.warn(`AG Grid: unknown menu item type ${key}`);
                return null;
        }

        return this.getMenuItemIfValid(chartGroupsDef, key, chartMenuItem);
    }

    getMenuItemIfValid(chartGroupsDef: ChartGroupsDef | undefined, key: string, menuItem: MenuItemDef): MenuItemDef | null {
        if (chartGroupsDef == undefined || menuItem.subMenu) {
            // If chartGroupsDef not provided every option is valid.
            // We do not filter items with subMenu directly but via their children
            return menuItem;
        }

        const validItems = getValidChartMenuItems(chartGroupsDef);
        return validItems.includes(key) ? menuItem : null;
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
