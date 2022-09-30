var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, Constants, ModuleNames, ModuleRegistry, Optional } from '@ag-grid-community/core';
var MenuItemMapper = /** @class */ (function (_super) {
    __extends(MenuItemMapper, _super);
    function MenuItemMapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MenuItemMapper.prototype.mapWithStockItems = function (originalList, column) {
        var _this = this;
        if (!originalList) {
            return [];
        }
        var resultList = [];
        originalList.forEach(function (menuItemOrString) {
            var result;
            if (typeof menuItemOrString === 'string') {
                result = _this.getStockMenuItem(menuItemOrString, column);
            }
            else {
                result = menuItemOrString;
            }
            // if no mapping, can happen when module is not loaded but user tries to use module anyway
            if (!result) {
                return;
            }
            var resultDef = result;
            var subMenu = resultDef.subMenu;
            if (subMenu && subMenu instanceof Array) {
                resultDef.subMenu = _this.mapWithStockItems(resultDef.subMenu, column);
            }
            if (result != null) {
                resultList.push(result);
            }
        });
        return resultList;
    };
    MenuItemMapper.prototype.getStockMenuItem = function (key, column) {
        var _this = this;
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var skipHeaderOnAutoSize = this.gridOptionsWrapper.isSkipHeaderOnAutoSize();
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
                    action: function () { return _this.columnModel.setColumnPinned(column, Constants.PINNED_LEFT, "contextMenu"); },
                    checked: !!column && column.isPinnedLeft()
                };
            case 'pinRight':
                return {
                    name: localeTextFunc('pinRight', 'Pin Right'),
                    action: function () { return _this.columnModel.setColumnPinned(column, Constants.PINNED_RIGHT, "contextMenu"); },
                    checked: !!column && column.isPinnedRight()
                };
            case 'clearPinned':
                return {
                    name: localeTextFunc('noPin', 'No Pin'),
                    action: function () { return _this.columnModel.setColumnPinned(column, null, "contextMenu"); },
                    checked: !!column && !column.isPinned()
                };
            case 'valueAggSubMenu':
                if (ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Aggregation from Menu')) {
                    return {
                        name: localeTextFunc('valueAggregation', 'Value Aggregation'),
                        icon: _.createIconNoSpan('menuValue', this.gridOptionsWrapper, null),
                        subMenu: this.createAggregationSubMenu(column)
                    };
                }
                else {
                    return null;
                }
            case 'autoSizeThis':
                return {
                    name: localeTextFunc('autosizeThiscolumn', 'Autosize This Column'),
                    action: function () { return _this.columnModel.autoSizeColumn(column, skipHeaderOnAutoSize, "contextMenu"); }
                };
            case 'autoSizeAll':
                return {
                    name: localeTextFunc('autosizeAllColumns', 'Autosize All Columns'),
                    action: function () { return _this.columnModel.autoSizeAllColumns(skipHeaderOnAutoSize, "contextMenu"); }
                };
            case 'rowGroup':
                return {
                    name: localeTextFunc('groupBy', 'Group by') + ' ' + _.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    action: function () { return _this.columnModel.addRowGroupColumn(column, "contextMenu"); },
                    icon: _.createIconNoSpan('menuAddRowGroup', this.gridOptionsWrapper, null)
                };
            case 'rowUnGroup':
                return {
                    name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + _.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    action: function () { return _this.columnModel.removeRowGroupColumn(column, "contextMenu"); },
                    icon: _.createIconNoSpan('menuRemoveRowGroup', this.gridOptionsWrapper, null)
                };
            case 'resetColumns':
                return {
                    name: localeTextFunc('resetColumns', 'Reset Columns'),
                    action: function () { return _this.columnModel.resetColumnState("contextMenu"); }
                };
            case 'expandAll':
                return {
                    name: localeTextFunc('expandAll', 'Expand All'),
                    action: function () { return _this.gridApi.expandAll(); }
                };
            case 'contractAll':
                return {
                    name: localeTextFunc('collapseAll', 'Collapse All'),
                    action: function () { return _this.gridApi.collapseAll(); }
                };
            case 'copy':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Copy from Menu')) {
                    return {
                        name: localeTextFunc('copy', 'Copy'),
                        shortcut: localeTextFunc('ctrlC', 'Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.gridOptionsWrapper, null),
                        action: function () { return _this.clipboardService.copyToClipboard(); }
                    };
                }
                else {
                    return null;
                }
            case 'copyWithHeaders':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Copy with Headers from Menu')) {
                    return {
                        name: localeTextFunc('copyWithHeaders', 'Copy with Headers'),
                        // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.gridOptionsWrapper, null),
                        action: function () { return _this.clipboardService.copyToClipboard({ includeHeaders: true }); }
                    };
                }
                else {
                    return null;
                }
            case 'copyWithGroupHeaders':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Copy with Group Headers from Menu')) {
                    return {
                        name: localeTextFunc('copyWithGroupHeaders', 'Copy with Group Headers'),
                        // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.gridOptionsWrapper, null),
                        action: function () { return _this.clipboardService.copyToClipboard({ includeHeaders: true, includeGroupHeaders: true }); }
                    };
                }
                else {
                    return null;
                }
            case 'paste':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Paste from Clipboard')) {
                    return {
                        name: localeTextFunc('paste', 'Paste'),
                        shortcut: localeTextFunc('ctrlV', 'Ctrl+V'),
                        disabled: true,
                        icon: _.createIconNoSpan('clipboardPaste', this.gridOptionsWrapper, null),
                        action: function () { return _this.clipboardService.pasteFromClipboard(); }
                    };
                }
                else {
                    return null;
                }
            case 'export':
                var exportSubMenuItems = [];
                var csvModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.CsvExportModule);
                var excelModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.ExcelExportModule);
                if (!this.gridOptionsWrapper.isSuppressCsvExport() && csvModuleLoaded) {
                    exportSubMenuItems.push('csvExport');
                }
                if (!this.gridOptionsWrapper.isSuppressExcelExport() && excelModuleLoaded) {
                    exportSubMenuItems.push('excelExport');
                }
                return {
                    name: localeTextFunc('export', 'Export'),
                    subMenu: exportSubMenuItems,
                    icon: _.createIconNoSpan('save', this.gridOptionsWrapper, null),
                };
            case 'csvExport':
                return {
                    name: localeTextFunc('csvExport', 'CSV Export'),
                    icon: _.createIconNoSpan('csvExport', this.gridOptionsWrapper, null),
                    action: function () { return _this.gridApi.exportDataAsCsv({}); }
                };
            case 'excelExport':
                return {
                    name: localeTextFunc('excelExport', 'Excel Export'),
                    icon: _.createIconNoSpan('excelExport', this.gridOptionsWrapper, null),
                    action: function () { return _this.gridApi.exportDataAsExcel(); }
                };
            case 'separator':
                return 'separator';
            default:
                var chartMenuItem = this.getChartItems(key);
                if (chartMenuItem) {
                    return chartMenuItem;
                }
                else {
                    console.warn("AG Grid: unknown menu item type " + key);
                    return null;
                }
        }
    };
    MenuItemMapper.prototype.getChartItems = function (key) {
        var _this = this;
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var pivotChartMenuItem = function (localeKey, defaultText, chartType) {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: function () { return _this.chartService.createPivotChart({ chartType: chartType }); }
            };
        };
        var rangeChartMenuItem = function (localeKey, defaultText, chartType) {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: function () { return _this.chartService.createChartFromCurrentRange(chartType); }
            };
        };
        switch (key) {
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
                        'rangeAreaChart',
                        'rangeHistogramChart',
                        'rangeCombinationChart'
                    ],
                    icon: _.createIconNoSpan('chart', this.gridOptionsWrapper, null),
                };
            case 'pivotColumnChart':
                return {
                    name: localeTextFunc('columnChart', 'Column'),
                    subMenu: ['pivotGroupedColumn', 'pivotStackedColumn', 'pivotNormalizedColumn']
                };
            case 'pivotGroupedColumn':
                return pivotChartMenuItem('groupedColumn', 'Grouped&lrm;', 'groupedColumn');
            case 'pivotStackedColumn':
                return pivotChartMenuItem('stackedColumn', 'Stacked&lrm;', 'stackedColumn');
            case 'pivotNormalizedColumn':
                return pivotChartMenuItem('normalizedColumn', '100% Stacked&lrm;', 'normalizedColumn');
            case 'rangeColumnChart':
                return {
                    name: localeTextFunc('columnChart', 'Column'),
                    subMenu: ['rangeGroupedColumn', 'rangeStackedColumn', 'rangeNormalizedColumn']
                };
            case 'rangeGroupedColumn':
                return rangeChartMenuItem('groupedColumn', 'Grouped&lrm;', 'groupedColumn');
            case 'rangeStackedColumn':
                return rangeChartMenuItem('stackedColumn', 'Stacked&lrm;', 'stackedColumn');
            case 'rangeNormalizedColumn':
                return rangeChartMenuItem('normalizedColumn', '100% Stacked&lrm;', 'normalizedColumn');
            case 'pivotBarChart':
                return {
                    name: localeTextFunc('barChart', 'Bar'),
                    subMenu: ['pivotGroupedBar', 'pivotStackedBar', 'pivotNormalizedBar']
                };
            case 'pivotGroupedBar':
                return pivotChartMenuItem('groupedBar', 'Grouped&lrm;', 'groupedBar');
            case 'pivotStackedBar':
                return pivotChartMenuItem('stackedBar', 'Stacked&lrm;', 'stackedBar');
            case 'pivotNormalizedBar':
                return pivotChartMenuItem('normalizedBar', '100% Stacked&lrm;', 'normalizedBar');
            case 'rangeBarChart':
                return {
                    name: localeTextFunc('barChart', 'Bar'),
                    subMenu: ['rangeGroupedBar', 'rangeStackedBar', 'rangeNormalizedBar']
                };
            case 'rangeGroupedBar':
                return rangeChartMenuItem('groupedBar', 'Grouped&lrm;', 'groupedBar');
            case 'rangeStackedBar':
                return rangeChartMenuItem('stackedBar', 'Stacked&lrm;', 'stackedBar');
            case 'rangeNormalizedBar':
                return rangeChartMenuItem('normalizedBar', '100% Stacked&lrm;', 'normalizedBar');
            case 'pivotPieChart':
                return {
                    name: localeTextFunc('pieChart', 'Pie'),
                    subMenu: ['pivotPie', 'pivotDoughnut']
                };
            case 'pivotPie':
                return pivotChartMenuItem('pie', 'Pie&lrm;', 'pie');
            case 'pivotDoughnut':
                return pivotChartMenuItem('doughnut', 'Doughnut&lrm;', 'doughnut');
            case 'rangePieChart':
                return {
                    name: localeTextFunc('pieChart', 'Pie'),
                    subMenu: ['rangePie', 'rangeDoughnut']
                };
            case 'rangePie':
                return rangeChartMenuItem('pie', 'Pie&lrm;', 'pie');
            case 'rangeDoughnut':
                return rangeChartMenuItem('doughnut', 'Doughnut&lrm;', 'doughnut');
            case 'pivotLineChart':
                return pivotChartMenuItem('line', 'Line&lrm;', 'line');
            case 'rangeLineChart':
                return rangeChartMenuItem('line', 'Line&lrm;', 'line');
            case 'pivotXYChart':
                return {
                    name: localeTextFunc('xyChart', 'X Y (Scatter)'),
                    subMenu: ['pivotScatter', 'pivotBubble']
                };
            case 'pivotScatter':
                return pivotChartMenuItem('scatter', 'Scatter&lrm;', 'scatter');
            case 'pivotBubble':
                return pivotChartMenuItem('bubble', 'Bubble&lrm;', 'bubble');
            case 'rangeXYChart':
                return {
                    name: localeTextFunc('xyChart', 'X Y (Scatter)'),
                    subMenu: ['rangeScatter', 'rangeBubble']
                };
            case 'rangeScatter':
                return rangeChartMenuItem('scatter', 'Scatter&lrm;', 'scatter');
            case 'rangeBubble':
                return rangeChartMenuItem('bubble', 'Bubble&lrm;', 'bubble');
            case 'pivotAreaChart':
                return {
                    name: localeTextFunc('areaChart', 'Area'),
                    subMenu: ['pivotArea', 'pivotStackedArea', 'pivotNormalizedArea']
                };
            case 'pivotArea':
                return pivotChartMenuItem('area', 'Area&lrm;', 'area');
            case 'pivotStackedArea':
                return pivotChartMenuItem('stackedArea', 'Stacked&lrm;', 'stackedArea');
            case 'pivotNormalizedArea':
                return pivotChartMenuItem('normalizedArea', '100% Stacked&lrm;', 'normalizedArea');
            case 'rangeAreaChart':
                return {
                    name: localeTextFunc('areaChart', 'Area'),
                    subMenu: ['rangeArea', 'rangeStackedArea', 'rangeNormalizedArea']
                };
            case 'rangeArea':
                return rangeChartMenuItem('area', 'Area&lrm;', 'area');
            case 'rangeStackedArea':
                return rangeChartMenuItem('stackedArea', 'Stacked&lrm;', 'stackedArea');
            case 'rangeNormalizedArea':
                return rangeChartMenuItem('normalizedArea', '100% Stacked&lrm;', 'normalizedArea');
            case 'rangeHistogramChart':
                return rangeChartMenuItem('histogramChart', 'Histogram&lrm;', 'histogram');
            case 'rangeColumnLineCombo':
                return rangeChartMenuItem('columnLineCombo', 'Column & Line&lrm;', 'columnLineCombo');
            case 'rangeAreaColumnCombo':
                return rangeChartMenuItem('AreaColumnCombo', 'Area & Column&lrm;', 'areaColumnCombo');
            case 'rangeCombinationChart':
                return {
                    name: localeTextFunc('combinationChart', 'Combination'),
                    subMenu: ['rangeColumnLineCombo', 'rangeAreaColumnCombo']
                };
            default:
                return null;
        }
    };
    MenuItemMapper.prototype.createAggregationSubMenu = function (column) {
        var _this = this;
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var columnToUse;
        if (column.isPrimary()) {
            columnToUse = column;
        }
        else {
            var pivotValueColumn = column.getColDef().pivotValueColumn;
            columnToUse = _.exists(pivotValueColumn) ? pivotValueColumn : undefined;
        }
        var result = [];
        if (columnToUse) {
            var columnIsAlreadyAggValue_1 = columnToUse.isValueActive();
            var funcNames = this.aggFuncService.getFuncNames(columnToUse);
            funcNames.forEach(function (funcName) {
                result.push({
                    name: localeTextFunc(funcName, funcName),
                    action: function () {
                        _this.columnModel.setColumnAggFunc(columnToUse, funcName, "contextMenu");
                        _this.columnModel.addValueColumn(columnToUse, "contextMenu");
                    },
                    checked: columnIsAlreadyAggValue_1 && columnToUse.getAggFunc() === funcName
                });
            });
        }
        return result;
    };
    __decorate([
        Autowired('columnModel')
    ], MenuItemMapper.prototype, "columnModel", void 0);
    __decorate([
        Autowired('gridApi')
    ], MenuItemMapper.prototype, "gridApi", void 0);
    __decorate([
        Optional('clipboardService')
    ], MenuItemMapper.prototype, "clipboardService", void 0);
    __decorate([
        Optional('aggFuncService')
    ], MenuItemMapper.prototype, "aggFuncService", void 0);
    __decorate([
        Optional('chartService')
    ], MenuItemMapper.prototype, "chartService", void 0);
    MenuItemMapper = __decorate([
        Bean('menuItemMapper')
    ], MenuItemMapper);
    return MenuItemMapper;
}(BeanStub));
export { MenuItemMapper };
