var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, ModuleNames, ModuleRegistry, Optional, } from '@ag-grid-community/core';
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
                // Spread to prevent leaking mapped subMenus back into the original menuItem
                result = __assign({}, menuItemOrString);
            }
            // if no mapping, can happen when module is not loaded but user tries to use module anyway
            if (!result) {
                return;
            }
            var resultDef = result;
            var subMenu = resultDef.subMenu;
            if (subMenu && subMenu instanceof Array) {
                resultDef.subMenu = _this.mapWithStockItems(subMenu, column);
            }
            if (result != null) {
                resultList.push(result);
            }
        });
        return resultList;
    };
    MenuItemMapper.prototype.getStockMenuItem = function (key, column) {
        var _this = this;
        var _a;
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var skipHeaderOnAutoSize = this.gridOptionsService.is('skipHeaderOnAutoSize');
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
                    action: function () { return _this.columnModel.setColumnPinned(column, 'left', "contextMenu"); },
                    checked: !!column && column.isPinnedLeft()
                };
            case 'pinRight':
                return {
                    name: localeTextFunc('pinRight', 'Pin Right'),
                    action: function () { return _this.columnModel.setColumnPinned(column, 'right', "contextMenu"); },
                    checked: !!column && column.isPinnedRight()
                };
            case 'clearPinned':
                return {
                    name: localeTextFunc('noPin', 'No Pin'),
                    action: function () { return _this.columnModel.setColumnPinned(column, null, "contextMenu"); },
                    checked: !!column && !column.isPinned()
                };
            case 'valueAggSubMenu':
                if (ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Aggregation from Menu', this.context.getGridId())) {
                    if (!(column === null || column === void 0 ? void 0 : column.isPrimary()) && !(column === null || column === void 0 ? void 0 : column.getColDef().pivotValueColumn)) {
                        return null;
                    }
                    return {
                        name: localeTextFunc('valueAggregation', 'Value Aggregation'),
                        icon: _.createIconNoSpan('menuValue', this.gridOptionsService, null),
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
                    disabled: (column === null || column === void 0 ? void 0 : column.isRowGroupActive()) || !(column === null || column === void 0 ? void 0 : column.getColDef().enableRowGroup),
                    action: function () { return _this.columnModel.addRowGroupColumn(column, "contextMenu"); },
                    icon: _.createIconNoSpan('menuAddRowGroup', this.gridOptionsService, null)
                };
            case 'rowUnGroup':
                return {
                    name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + _.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    disabled: !(column === null || column === void 0 ? void 0 : column.isRowGroupActive()) || !(column === null || column === void 0 ? void 0 : column.getColDef().enableRowGroup),
                    action: function () { return _this.columnModel.removeRowGroupColumn(column, "contextMenu"); },
                    icon: _.createIconNoSpan('menuRemoveRowGroup', this.gridOptionsService, null)
                };
            case 'resetColumns':
                return {
                    name: localeTextFunc('resetColumns', 'Reset Columns'),
                    action: function () { return _this.columnModel.resetColumnState("contextMenu"); }
                };
            case 'expandAll':
                return {
                    name: localeTextFunc('expandAll', 'Expand All Row Groups'),
                    action: function () { return _this.gridApi.expandAll(); }
                };
            case 'contractAll':
                return {
                    name: localeTextFunc('collapseAll', 'Collapse All Row Groups'),
                    action: function () { return _this.gridApi.collapseAll(); }
                };
            case 'copy':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Copy from Menu', this.context.getGridId())) {
                    return {
                        name: localeTextFunc('copy', 'Copy'),
                        shortcut: localeTextFunc('ctrlC', 'Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.gridOptionsService, null),
                        action: function () { return _this.clipboardService.copyToClipboard(); }
                    };
                }
                else {
                    return null;
                }
            case 'copyWithHeaders':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Copy with Headers from Menu', this.context.getGridId())) {
                    return {
                        name: localeTextFunc('copyWithHeaders', 'Copy with Headers'),
                        // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.gridOptionsService, null),
                        action: function () { return _this.clipboardService.copyToClipboard({ includeHeaders: true }); }
                    };
                }
                else {
                    return null;
                }
            case 'copyWithGroupHeaders':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Copy with Group Headers from Menu', this.context.getGridId())) {
                    return {
                        name: localeTextFunc('copyWithGroupHeaders', 'Copy with Group Headers'),
                        // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.gridOptionsService, null),
                        action: function () { return _this.clipboardService.copyToClipboard({ includeHeaders: true, includeGroupHeaders: true }); }
                    };
                }
                else {
                    return null;
                }
            case 'cut':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Cut from Menu', this.context.getGridId())) {
                    var focusedCell = this.focusService.getFocusedCell();
                    var rowNode = focusedCell ? this.rowPositionUtils.getRowNode(focusedCell) : null;
                    var isEditable = rowNode ? focusedCell === null || focusedCell === void 0 ? void 0 : focusedCell.column.isCellEditable(rowNode) : false;
                    return {
                        name: localeTextFunc('cut', 'Cut'),
                        shortcut: localeTextFunc('ctrlX', 'Ctrl+X'),
                        icon: _.createIconNoSpan('clipboardCut', this.gridOptionsService, null),
                        disabled: !isEditable || this.gridOptionsService.is('suppressCutToClipboard'),
                        action: function () { return _this.clipboardService.cutToClipboard(undefined, 'contextMenu'); }
                    };
                }
                else {
                    return null;
                }
            case 'paste':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Paste from Clipboard', this.context.getGridId())) {
                    return {
                        name: localeTextFunc('paste', 'Paste'),
                        shortcut: localeTextFunc('ctrlV', 'Ctrl+V'),
                        disabled: true,
                        icon: _.createIconNoSpan('clipboardPaste', this.gridOptionsService, null),
                        action: function () { return _this.clipboardService.pasteFromClipboard(); }
                    };
                }
                else {
                    return null;
                }
            case 'export':
                var exportSubMenuItems = [];
                var csvModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.CsvExportModule, this.context.getGridId());
                var excelModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.ExcelExportModule, this.context.getGridId());
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
                    action: function () { return _this.gridApi.exportDataAsCsv({}); }
                };
            case 'excelExport':
                return {
                    name: localeTextFunc('excelExport', 'Excel Export'),
                    icon: _.createIconNoSpan('excelExport', this.gridOptionsService, null),
                    action: function () { return _this.gridApi.exportDataAsExcel(); }
                };
            case 'separator':
                return 'separator';
            case 'pivotChart':
            case 'chartRange':
                return (_a = this.chartMenuItemMapper.getChartItems(key)) !== null && _a !== void 0 ? _a : null;
            default: {
                console.warn("AG Grid: unknown menu item type " + key);
                return null;
            }
        }
    };
    MenuItemMapper.prototype.createAggregationSubMenu = function (column) {
        var _this = this;
        var localeTextFunc = this.localeService.getLocaleTextFunc();
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
            result.push({
                name: localeTextFunc('noAggregation', 'None'),
                action: function () {
                    _this.columnModel.removeValueColumn(columnToUse, "contextMenu");
                    _this.columnModel.setColumnAggFunc(columnToUse, undefined, "contextMenu");
                },
                checked: !columnIsAlreadyAggValue_1
            });
            funcNames.forEach(function (funcName) {
                result.push({
                    name: localeTextFunc(funcName, _.capitalise(funcName)),
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
        Autowired('focusService')
    ], MenuItemMapper.prototype, "focusService", void 0);
    __decorate([
        Autowired('rowPositionUtils')
    ], MenuItemMapper.prototype, "rowPositionUtils", void 0);
    __decorate([
        Autowired('chartMenuItemMapper')
    ], MenuItemMapper.prototype, "chartMenuItemMapper", void 0);
    MenuItemMapper = __decorate([
        Bean('menuItemMapper')
    ], MenuItemMapper);
    return MenuItemMapper;
}(BeanStub));
export { MenuItemMapper };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudUl0ZW1NYXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbWVudS9tZW51SXRlbU1hcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsU0FBUyxFQUNULElBQUksRUFDSixRQUFRLEVBT1IsV0FBVyxFQUFFLGNBQWMsRUFDM0IsUUFBUSxHQUdYLE1BQU0seUJBQXlCLENBQUM7QUFJakM7SUFBb0Msa0NBQVE7SUFBNUM7O0lBMlFBLENBQUM7SUFqUVUsMENBQWlCLEdBQXhCLFVBQXlCLFlBQXNDLEVBQUUsTUFBcUI7UUFBdEYsaUJBZ0NDO1FBL0JHLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDZixPQUFPLEVBQUUsQ0FBQztTQUNiO1FBRUQsSUFBTSxVQUFVLEdBQTZCLEVBQUUsQ0FBQztRQUVoRCxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQUEsZ0JBQWdCO1lBQ2pDLElBQUksTUFBbUMsQ0FBQztZQUV4QyxJQUFJLE9BQU8sZ0JBQWdCLEtBQUssUUFBUSxFQUFFO2dCQUN0QyxNQUFNLEdBQUcsS0FBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQzVEO2lCQUFNO2dCQUNILDRFQUE0RTtnQkFDNUUsTUFBTSxnQkFBUSxnQkFBZ0IsQ0FBRSxDQUFDO2FBQ3BDO1lBQ0QsMEZBQTBGO1lBQzFGLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQUUsT0FBTzthQUFFO1lBRXhCLElBQU0sU0FBUyxHQUFHLE1BQXFCLENBQUM7WUFDaEMsSUFBQSxPQUFPLEdBQUssU0FBUyxRQUFkLENBQWU7WUFFOUIsSUFBSSxPQUFPLElBQUksT0FBTyxZQUFZLEtBQUssRUFBRTtnQkFDckMsU0FBUyxDQUFDLE9BQU8sR0FBRyxLQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBbUMsRUFBRSxNQUFNLENB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