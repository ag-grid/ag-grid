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
        var skipHeaderOnAutoSize = this.gridOptionsService.get('skipHeaderOnAutoSize');
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
                if (ModuleRegistry.__assertRegistered(ModuleNames.RowGroupingModule, 'Aggregation from Menu', this.context.getGridId())) {
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
                var icon = _.createIconNoSpan('menuRemoveRowGroup', this.gridOptionsService, null);
                var showRowGroup_1 = column === null || column === void 0 ? void 0 : column.getColDef().showRowGroup;
                var lockedGroups_1 = this.gridOptionsService.get('groupLockGroupColumns');
                // Handle single auto group column
                if (showRowGroup_1 === true) {
                    return {
                        name: localeTextFunc('ungroupAll', 'Un-Group All'),
                        disabled: lockedGroups_1 === -1 || lockedGroups_1 >= this.columnModel.getRowGroupColumns().length,
                        action: function () { return _this.columnModel.setRowGroupColumns(_this.columnModel.getRowGroupColumns().slice(0, lockedGroups_1), "contextMenu"); },
                        icon: icon
                    };
                }
                // Handle multiple auto group columns
                if (typeof showRowGroup_1 === 'string') {
                    var underlyingColumn = this.columnModel.getPrimaryColumn(showRowGroup_1);
                    var ungroupByName = (underlyingColumn != null) ? _.escapeString(this.columnModel.getDisplayNameForColumn(underlyingColumn, 'header')) : showRowGroup_1;
                    return {
                        name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + ungroupByName,
                        disabled: underlyingColumn != null && this.columnModel.isColumnGroupingLocked(underlyingColumn),
                        action: function () { return _this.columnModel.removeRowGroupColumn(showRowGroup_1, "contextMenu"); },
                        icon: icon
                    };
                }
                // Handle primary column
                return {
                    name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + _.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    disabled: !(column === null || column === void 0 ? void 0 : column.isRowGroupActive()) || !(column === null || column === void 0 ? void 0 : column.getColDef().enableRowGroup) || this.columnModel.isColumnGroupingLocked(column),
                    action: function () { return _this.columnModel.removeRowGroupColumn(column, "contextMenu"); },
                    icon: icon
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
                if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'Copy from Menu', this.context.getGridId())) {
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
                if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'Copy with Headers from Menu', this.context.getGridId())) {
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
                if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'Copy with Group Headers from Menu', this.context.getGridId())) {
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
                if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'Cut from Menu', this.context.getGridId())) {
                    var focusedCell = this.focusService.getFocusedCell();
                    var rowNode = focusedCell ? this.rowPositionUtils.getRowNode(focusedCell) : null;
                    var isEditable = rowNode ? focusedCell === null || focusedCell === void 0 ? void 0 : focusedCell.column.isCellEditable(rowNode) : false;
                    return {
                        name: localeTextFunc('cut', 'Cut'),
                        shortcut: localeTextFunc('ctrlX', 'Ctrl+X'),
                        icon: _.createIconNoSpan('clipboardCut', this.gridOptionsService, null),
                        disabled: !isEditable || this.gridOptionsService.get('suppressCutToClipboard'),
                        action: function () { return _this.clipboardService.cutToClipboard(undefined, 'contextMenu'); }
                    };
                }
                else {
                    return null;
                }
            case 'paste':
                if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'Paste from Clipboard', this.context.getGridId())) {
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
                var csvModuleLoaded = ModuleRegistry.__isRegistered(ModuleNames.CsvExportModule, this.context.getGridId());
                var excelModuleLoaded = ModuleRegistry.__isRegistered(ModuleNames.ExcelExportModule, this.context.getGridId());
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
                console.warn("AG Grid: unknown menu item type ".concat(key));
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
                    name: localeTextFunc(funcName, _this.aggFuncService.getDefaultFuncLabel(funcName)),
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
