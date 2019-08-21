import {
    Autowired,
    Optional,
    Bean,
    ChartType,
    Column,
    ColumnController,
    GridApi,
    GridOptionsWrapper,
    IChartService,
    MenuItemDef,
    _
} from 'ag-grid-community';
import { ClipboardService } from "../clipboardService";
import { AggFuncService } from "../aggregation/aggFuncService";

@Bean('menuItemMapper')
export class MenuItemMapper {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('clipboardService') private clipboardService: ClipboardService;
    @Autowired('aggFuncService') private aggFuncService: AggFuncService;
    @Optional('chartService') private chartService: IChartService;

    public mapWithStockItems(originalList: (MenuItemDef | string)[], column: Column | null): (MenuItemDef | string)[] {
        if (!originalList) {
            return [];
        }

        const resultList: (MenuItemDef | string)[] = [];

        originalList.forEach(menuItemOrString => {
            let result: MenuItemDef | string | null;

            if (typeof menuItemOrString === 'string') {
                result = this.getStockMenuItem(menuItemOrString as string, column);
            } else {
                result = menuItemOrString;
            }
            if ((result as MenuItemDef).subMenu) {
                const resultDef = result as MenuItemDef;
                resultDef.subMenu = this.mapWithStockItems(resultDef.subMenu!, column);
            }
            if (result != null) {
                resultList.push(result);
            }
        });

        return resultList;
    }

    private getStockMenuItem(key: string, column: Column | null): MenuItemDef | string | null {

        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

        switch (key) {
            case 'pinSubMenu':
                return {
                    name: localeTextFunc('pinColumn', 'Pin Column'),
                    icon: _.createIconNoSpan('menuPin', this.gridOptionsWrapper, null),
                    subMenu: ['pinLeft', 'pinRight', 'clearPinned']
                };
            case 'pinLeft':
                return {
                    name: localeTextFunc('pinLeft', 'Pin Left'),
                    action: () => this.columnController.setColumnPinned(column, Column.PINNED_LEFT, "contextMenu"),
                    checked: (column as Column).isPinnedLeft()
                };
            case 'pinRight':
                return {
                    name: localeTextFunc('pinRight', 'Pin Right'),
                    action: () => this.columnController.setColumnPinned(column, Column.PINNED_RIGHT, "contextMenu"),
                    checked: (column as Column).isPinnedRight()
                };
            case 'clearPinned':
                return {
                    name: localeTextFunc('noPin', 'No Pin'),
                    action: () => this.columnController.setColumnPinned(column, null, "contextMenu"),
                    checked: !(column as Column).isPinned()
                };
            case 'valueAggSubMenu':
                return {
                    name: localeTextFunc('valueAggregation', 'Value Aggregation'),
                    icon: _.createIconNoSpan('menuValue', this.gridOptionsWrapper, null),
                    subMenu: this.createAggregationSubMenu((column as Column))
                };
            case 'autoSizeThis':
                return {
                    name: localeTextFunc('autosizeThiscolumn', 'Autosize This Column'),
                    action: () => this.columnController.autoSizeColumn(column, "contextMenu")
                };
            case 'autoSizeAll':
                return {
                    name: localeTextFunc('autosizeAllColumns', 'Autosize All Columns'),
                    action: () => this.columnController.autoSizeAllColumns("contextMenu")
                };
            case 'rowGroup':
                return {
                    name: localeTextFunc('groupBy', 'Group by') + ' ' + _.escape(this.columnController.getDisplayNameForColumn(column, 'header')),
                    action: () => this.columnController.addRowGroupColumn(column, "contextMenu"),
                    icon: _.createIconNoSpan('menuAddRowGroup', this.gridOptionsWrapper, null)
                };
            case 'rowUnGroup':
                return {
                    name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + _.escape(this.columnController.getDisplayNameForColumn(column, 'header')),
                    action: () => this.columnController.removeRowGroupColumn(column, "contextMenu"),
                    icon: _.createIconNoSpan('menuRemoveRowGroup', this.gridOptionsWrapper, null)
                };
            case 'resetColumns':
                return {
                    name: localeTextFunc('resetColumns', 'Reset Columns'),
                    action: () => this.columnController.resetColumnState(false, "contextMenu")
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
                return {
                    name: localeTextFunc('copy', 'Copy'),
                    shortcut: localeTextFunc('ctrlC', 'Ctrl+C'),
                    icon: _.createIconNoSpan('clipboardCopy', this.gridOptionsWrapper, null),
                    action: () => this.clipboardService.copyToClipboard(false)
                };
            case 'copyWithHeaders':
                return {
                    name: localeTextFunc('copyWithHeaders', 'Copy with Headers'),
                    // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                    icon: _.createIconNoSpan('clipboardCopy', this.gridOptionsWrapper, null),
                    action: () => this.clipboardService.copyToClipboard(true)
                };
            case 'paste':
                return {
                    name: localeTextFunc('paste', 'Paste'),
                    shortcut: localeTextFunc('ctrlV', 'Ctrl+V'),
                    disabled: true,
                    icon: _.createIconNoSpan('clipboardPaste', this.gridOptionsWrapper, null),
                    action: () => this.clipboardService.pasteFromClipboard()
                };
            case 'export':
                const exportSubMenuItems: string[] = [];
                if (!this.gridOptionsWrapper.isSuppressCsvExport()) {
                    exportSubMenuItems.push('csvExport');
                }
                if (!this.gridOptionsWrapper.isSuppressExcelExport()) {
                    exportSubMenuItems.push('excelExport');
                    exportSubMenuItems.push('excelXmlExport');
                }
                return {
                    name: localeTextFunc('export', 'Export'),
                    subMenu: exportSubMenuItems,
                    icon: _.createIconNoSpan('save', this.gridOptionsWrapper, null),
                };
            case 'csvExport':
                return {
                    name: localeTextFunc('csvExport', 'CSV Export'),
                    action: () => this.gridApi.exportDataAsCsv({})
                };
            case 'excelExport':
                return {
                    name: localeTextFunc('excelExport', 'Excel Export (.xlsx)&lrm;'),
                    action: () => this.gridApi.exportDataAsExcel({
                        exportMode: 'xlsx'
                    })
                };
            case 'excelXmlExport':
                return {
                    name: localeTextFunc('excelXmlExport', 'Excel Export (.xml)&lrm;'),
                    action: () => this.gridApi.exportDataAsExcel({
                        exportMode: 'xml'
                    })
                };
            case 'separator':
                return 'separator';
            default:
                const chartMenuItem = this.getChartItems(key);
                if (chartMenuItem) {
                    return chartMenuItem;
                } else {
                    console.warn(`ag-Grid: unknown menu item type ${key}`);
                    return null;
                }
        }
    }

    private getChartItems(key: string) {
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

        const pivotChartMenuItem = (localeKey: string, defaultText: string, chartType: ChartType) => {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: () => this.chartService.pivotChart(chartType)
            };
        };

        const rangeChartMenuItem = (localeKey: string, defaultText: string, chartType: ChartType) => {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: () => this.chartService.chartCurrentRange(chartType)
            };
        };

        switch (key) {
            // case 'pivotChartAndPivotMode':
            //     return {
            //         name: localeTextFunc('pivotChartAndPivotMode', 'Pivot Chart & Pivot Mode&lrm;'),
            //         action: () => this.chartService.pivotChart(ChartType.GroupedColumn),
            //         icon: _.createIconNoSpan('chart', this.gridOptionsWrapper, null)
            //     };
            case 'pivotChart':
                return {
                    name: localeTextFunc('pivotChart', 'Pivot Chart'),
                    subMenu: [
                        'pivotColumnChart',
                        'pivotBarChart',
                        'pivotPieChart',
                        'pivotLineChart',
                        'pivotXYChart',
                        'pivotAreaChart'
                    ],
                    icon: _.createIconNoSpan('chart', this.gridOptionsWrapper, null),
                };

            case 'chartRange':
                return {
                    name: localeTextFunc('chartRange', 'Chart Range'),
                    subMenu: [
                        'rangeColumnChart',
                        'rangeBarChart',
                        'rangePieChart',
                        'rangeLineChart',
                        'rangeXYChart',
                        'rangeAreaChart'
                    ],
                    icon: _.createIconNoSpan('chart', this.gridOptionsWrapper, null),
                };

            case 'pivotColumnChart':
                return {
                    name: localeTextFunc('columnChart', 'Column'),
                    subMenu: ['pivotGroupedColumn', 'pivotStackedColumn', 'pivotNormalizedColumn']
                };

            case 'pivotGroupedColumn':
                return pivotChartMenuItem('groupedColumn', 'Grouped&lrm;', ChartType.GroupedColumn);

            case 'pivotStackedColumn':
                return pivotChartMenuItem('stackedColumn', 'Stacked&lrm;', ChartType.StackedColumn);

            case 'pivotNormalizedColumn':
                return pivotChartMenuItem('normalizedColumn', '100% Stacked&lrm;', ChartType.NormalizedColumn);

            case 'rangeColumnChart':
                return {
                    name: localeTextFunc('columnChart', 'Column'),
                    subMenu: ['rangeGroupedColumn', 'rangeStackedColumn', 'rangeNormalizedColumn']
                };

            case 'rangeGroupedColumn':
                return rangeChartMenuItem('groupedColumn', 'Grouped&lrm;', ChartType.GroupedColumn);

            case 'rangeStackedColumn':
                return rangeChartMenuItem('stackedColumn', 'Stacked&lrm;', ChartType.StackedColumn);

            case 'rangeNormalizedColumn':
                return rangeChartMenuItem('normalizedColumn', '100% Stacked&lrm;', ChartType.NormalizedColumn);

            case 'pivotBarChart':
                return {
                    name: localeTextFunc('barChart', 'Bar'),
                    subMenu: ['pivotGroupedBar', 'pivotStackedBar', 'pivotNormalizedBar']
                };

            case 'pivotGroupedBar':
                return pivotChartMenuItem('groupedBar', 'Grouped&lrm;', ChartType.GroupedBar);

            case 'pivotStackedBar':
                return pivotChartMenuItem('stackedBar', 'Stacked&lrm;', ChartType.StackedBar);

            case 'pivotNormalizedBar':
                return pivotChartMenuItem('normalizedBar', '100% Stacked&lrm;', ChartType.NormalizedBar);

            case 'rangeBarChart':
                return {
                    name: localeTextFunc('barChart', 'Bar'),
                    subMenu: ['rangeGroupedBar', 'rangeStackedBar', 'rangeNormalizedBar']
                };

            case 'rangeGroupedBar':
                return rangeChartMenuItem('groupedBar', 'Grouped&lrm;', ChartType.GroupedBar);

            case 'rangeStackedBar':
                return rangeChartMenuItem('stackedBar', 'Stacked&lrm;', ChartType.StackedBar);

            case 'rangeNormalizedBar':
                return rangeChartMenuItem('normalizedBar', '100% Stacked&lrm;', ChartType.NormalizedBar);

            case 'pivotPieChart':
                return {
                    name: localeTextFunc('pieChart', 'Pie'),
                    subMenu: ['pivotPie', 'pivotDoughnut']
                };
            case 'pivotPie':
                return pivotChartMenuItem('pie', 'Pie&lrm;', ChartType.Pie);

            case 'pivotDoughnut':
                return pivotChartMenuItem('doughnut', 'Doughnut&lrm;', ChartType.Doughnut);

            case 'rangePieChart':
                return {
                    name: localeTextFunc('pieChart', 'Pie'),
                    subMenu: ['rangePie', 'rangeDoughnut']
                };
            case 'rangePie':
                return rangeChartMenuItem('pie', 'Pie&lrm;', ChartType.Pie);

            case 'rangeDoughnut':
                return rangeChartMenuItem('doughnut', 'Doughnut&lrm;', ChartType.Doughnut);

            case 'pivotLineChart':
                return pivotChartMenuItem('line', 'Line&lrm;', ChartType.Line);

            case 'rangeLineChart':
                return rangeChartMenuItem('line', 'Line&lrm;', ChartType.Line);

            case 'pivotXYChart':
                return {
                    name: localeTextFunc('xyChart', 'X Y (Scatter)'),
                    subMenu: ['pivotScatter', 'pivotBubble']
                };
            case 'pivotScatter':
                return pivotChartMenuItem('scatter', 'Scatter&lrm;', ChartType.Scatter);
            case 'pivotBubble':
                return pivotChartMenuItem('bubble', 'Bubble&lrm;', ChartType.Bubble);

            case 'rangeXYChart':
                return {
                    name: localeTextFunc('xyChart', 'X Y (Scatter)'),
                    subMenu: ['rangeScatter', 'rangeBubble']
                };
            case 'rangeScatter':
                return rangeChartMenuItem('scatter', 'Scatter&lrm;', ChartType.Scatter);
            case 'rangeBubble':
                return rangeChartMenuItem('bubble', 'Bubble&lrm;', ChartType.Bubble);

            case 'pivotAreaChart':
                return {
                    name: localeTextFunc('areaChart', 'Area'),
                    subMenu: ['pivotArea', 'pivotStackedArea', 'pivotNormalizedArea']
                };
            case 'pivotArea':
                return pivotChartMenuItem('area', 'Area&lrm;', ChartType.Area);

            case 'pivotStackedArea':
                return pivotChartMenuItem('stackedArea', 'Stacked&lrm;', ChartType.StackedArea);

            case 'pivotNormalizedArea':
                return pivotChartMenuItem('normalizedArea', '100% Stacked&lrm;', ChartType.NormalizedArea);

            case 'rangeAreaChart':
                return {
                    name: localeTextFunc('areaChart', 'Area'),
                    subMenu: ['rangeArea', 'rangeStackedArea', 'rangeNormalizedArea']
                };

            case 'rangeArea':
                return rangeChartMenuItem('area', 'Area&lrm;', ChartType.Area);

            case 'rangeStackedArea':
                return rangeChartMenuItem('stackedArea', 'Stacked&lrm;', ChartType.StackedArea);

            case 'rangeNormalizedArea':
                return rangeChartMenuItem('normalizedArea', '100% Stacked&lrm;', ChartType.NormalizedArea);

            default:
                return null;
        }
    }

    private createAggregationSubMenu(column: Column): MenuItemDef[] {
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        const columnIsAlreadyAggValue = column.isValueActive();
        const funcNames = this.aggFuncService.getFuncNames(column);

        let columnToUse: Column | undefined;
        if (column.isPrimary()) {
            columnToUse = column;
        } else {
            const pivotValueColumn = column.getColDef().pivotValueColumn;
            columnToUse = _.exists(pivotValueColumn) ? pivotValueColumn! : undefined;
        }

        const result: MenuItemDef[] = [];

        funcNames.forEach(funcName => {
            result.push({
                name: localeTextFunc(funcName, funcName),
                action: () => {
                    this.columnController.setColumnAggFunc(columnToUse, funcName, "contextMenu");
                    this.columnController.addValueColumn(columnToUse, "contextMenu");
                },
                checked: columnIsAlreadyAggValue && columnToUse!.getAggFunc() === funcName
            });
        });

        return result;
    }
}
