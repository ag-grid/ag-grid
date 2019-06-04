import {
    _,
    Autowired,
    Bean,
    ChartType,
    Column,
    ColumnController,
    GridApi,
    GridOptionsWrapper,
    IRangeChartService,
    MenuItemDef, Optional,
    Utils
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
    @Optional('rangeChartService') private rangeChartService: IRangeChartService;

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
                    icon: Utils.createIconNoSpan('menuPin', this.gridOptionsWrapper, null),
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
                    icon: Utils.createIconNoSpan('menuValue', this.gridOptionsWrapper, null),
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
                    icon: Utils.createIconNoSpan('menuAddRowGroup', this.gridOptionsWrapper, null)
                };
            case 'rowUnGroup':
                return {
                    name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + _.escape(this.columnController.getDisplayNameForColumn(column, 'header')),
                    action: () => this.columnController.removeRowGroupColumn(column, "contextMenu"),
                    icon: Utils.createIconNoSpan('menuRemoveRowGroup', this.gridOptionsWrapper, null)
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
                    icon: Utils.createIconNoSpan('clipboardCopy', this.gridOptionsWrapper, null),
                    action: () => this.clipboardService.copyToClipboard(false)
                };
            case 'copyWithHeaders':
                return {
                    name: localeTextFunc('copyWithHeaders', 'Copy with Headers'),
                    // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                    icon: Utils.createIconNoSpan('clipboardCopy', this.gridOptionsWrapper, null),
                    action: () => this.clipboardService.copyToClipboard(true)
                };
            case 'paste':
                return {
                    name: localeTextFunc('paste', 'Paste'),
                    shortcut: localeTextFunc('ctrlV', 'Ctrl+V'),
                    disabled: true,
                    icon: Utils.createIconNoSpan('clipboardPaste', this.gridOptionsWrapper, null),
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
                    subMenu: exportSubMenuItems
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
            case 'chartRange':
                const chartRangeSubMenuItems: string[] = [];
                chartRangeSubMenuItems.push('groupedBarRangeChart');
                chartRangeSubMenuItems.push('stackedBarRangeChart');
                chartRangeSubMenuItems.push('lineRangeChart');
                chartRangeSubMenuItems.push('pieRangeChart');
                chartRangeSubMenuItems.push('doughnutRangeChart');
                return {
                    name: 'Chart Range',
                    subMenu: chartRangeSubMenuItems
                };
            case 'groupedBarRangeChart': return {
                name: localeTextFunc('groupedBarRangeChart', 'Bar (Grouped)'),
                action: () => {
                    this.rangeChartService.chartCurrentRange(ChartType.GroupedBar);
                }
            };
            case 'stackedBarRangeChart': return {
                name: localeTextFunc('stackedBarRangeChart', 'Bar (Stacked)'),
                action: () => {
                    this.rangeChartService.chartCurrentRange(ChartType.StackedBar);
                }
            };
            case 'lineRangeChart': return {
                name: localeTextFunc('lineRangeChart', 'Line'),
                action: () => {
                    this.rangeChartService.chartCurrentRange(ChartType.Line);
                }
            };
            case 'pieRangeChart': return {
                name: localeTextFunc('pieRangeChart', 'Pie'),
                action: () => {
                    this.rangeChartService.chartCurrentRange(ChartType.Pie);
                }
            };
            case 'doughnutRangeChart': return {
                name: localeTextFunc('doughnutRangeChart', 'Doughnut'),
                action: () => {
                    this.rangeChartService.chartCurrentRange(ChartType.Doughnut);
                }
            };
            default:
                console.warn(`ag-Grid: unknown menu item type ${key}`);
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
