"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItemMapper = void 0;
const core_1 = require("@ag-grid-community/core");
let MenuItemMapper = class MenuItemMapper extends core_1.BeanStub {
    mapWithStockItems(originalList, column) {
        if (!originalList) {
            return [];
        }
        const resultList = [];
        originalList.forEach(menuItemOrString => {
            let result;
            if (typeof menuItemOrString === 'string') {
                result = this.getStockMenuItem(menuItemOrString, column);
            }
            else {
                // Spread to prevent leaking mapped subMenus back into the original menuItem
                result = Object.assign({}, menuItemOrString);
            }
            // if no mapping, can happen when module is not loaded but user tries to use module anyway
            if (!result) {
                return;
            }
            const resultDef = result;
            const { subMenu } = resultDef;
            if (subMenu && subMenu instanceof Array) {
                resultDef.subMenu = this.mapWithStockItems(subMenu, column);
            }
            if (result != null) {
                resultList.push(result);
            }
        });
        return resultList;
    }
    getStockMenuItem(key, column) {
        var _a;
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const skipHeaderOnAutoSize = this.gridOptionsService.get('skipHeaderOnAutoSize');
        switch (key) {
            case 'pinSubMenu':
                return {
                    name: localeTextFunc('pinColumn', 'Pin Column'),
                    icon: core_1._.createIconNoSpan('menuPin', this.gridOptionsService, null),
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
                if (core_1.ModuleRegistry.__assertRegistered(core_1.ModuleNames.RowGroupingModule, 'Aggregation from Menu', this.context.getGridId())) {
                    if (!(column === null || column === void 0 ? void 0 : column.isPrimary()) && !(column === null || column === void 0 ? void 0 : column.getColDef().pivotValueColumn)) {
                        return null;
                    }
                    return {
                        name: localeTextFunc('valueAggregation', 'Value Aggregation'),
                        icon: core_1._.createIconNoSpan('menuValue', this.gridOptionsService, null),
                        subMenu: this.createAggregationSubMenu(column)
                    };
                }
                else {
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
                    name: localeTextFunc('groupBy', 'Group by') + ' ' + core_1._.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    disabled: (column === null || column === void 0 ? void 0 : column.isRowGroupActive()) || !(column === null || column === void 0 ? void 0 : column.getColDef().enableRowGroup),
                    action: () => this.columnModel.addRowGroupColumn(column, "contextMenu"),
                    icon: core_1._.createIconNoSpan('menuAddRowGroup', this.gridOptionsService, null)
                };
            case 'rowUnGroup':
                const icon = core_1._.createIconNoSpan('menuRemoveRowGroup', this.gridOptionsService, null);
                const showRowGroup = column === null || column === void 0 ? void 0 : column.getColDef().showRowGroup;
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
                    const ungroupByName = (underlyingColumn != null) ? core_1._.escapeString(this.columnModel.getDisplayNameForColumn(underlyingColumn, 'header')) : showRowGroup;
                    return {
                        name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + ungroupByName,
                        disabled: underlyingColumn != null && this.columnModel.isColumnGroupingLocked(underlyingColumn),
                        action: () => this.columnModel.removeRowGroupColumn(showRowGroup, "contextMenu"),
                        icon: icon
                    };
                }
                // Handle primary column
                return {
                    name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + core_1._.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    disabled: !(column === null || column === void 0 ? void 0 : column.isRowGroupActive()) || !(column === null || column === void 0 ? void 0 : column.getColDef().enableRowGroup) || this.columnModel.isColumnGroupingLocked(column),
                    action: () => this.columnModel.removeRowGroupColumn(column, "contextMenu"),
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
                if (core_1.ModuleRegistry.__assertRegistered(core_1.ModuleNames.ClipboardModule, 'Copy from Menu', this.context.getGridId())) {
                    return {
                        name: localeTextFunc('copy', 'Copy'),
                        shortcut: localeTextFunc('ctrlC', 'Ctrl+C'),
                        icon: core_1._.createIconNoSpan('clipboardCopy', this.gridOptionsService, null),
                        action: () => this.clipboardService.copyToClipboard()
                    };
                }
                else {
                    return null;
                }
            case 'copyWithHeaders':
                if (core_1.ModuleRegistry.__assertRegistered(core_1.ModuleNames.ClipboardModule, 'Copy with Headers from Menu', this.context.getGridId())) {
                    return {
                        name: localeTextFunc('copyWithHeaders', 'Copy with Headers'),
                        // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                        icon: core_1._.createIconNoSpan('clipboardCopy', this.gridOptionsService, null),
                        action: () => this.clipboardService.copyToClipboard({ includeHeaders: true })
                    };
                }
                else {
                    return null;
                }
            case 'copyWithGroupHeaders':
                if (core_1.ModuleRegistry.__assertRegistered(core_1.ModuleNames.ClipboardModule, 'Copy with Group Headers from Menu', this.context.getGridId())) {
                    return {
                        name: localeTextFunc('copyWithGroupHeaders', 'Copy with Group Headers'),
                        // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                        icon: core_1._.createIconNoSpan('clipboardCopy', this.gridOptionsService, null),
                        action: () => this.clipboardService.copyToClipboard({ includeHeaders: true, includeGroupHeaders: true })
                    };
                }
                else {
                    return null;
                }
            case 'cut':
                if (core_1.ModuleRegistry.__assertRegistered(core_1.ModuleNames.ClipboardModule, 'Cut from Menu', this.context.getGridId())) {
                    const focusedCell = this.focusService.getFocusedCell();
                    const rowNode = focusedCell ? this.rowPositionUtils.getRowNode(focusedCell) : null;
                    const isEditable = rowNode ? focusedCell === null || focusedCell === void 0 ? void 0 : focusedCell.column.isCellEditable(rowNode) : false;
                    return {
                        name: localeTextFunc('cut', 'Cut'),
                        shortcut: localeTextFunc('ctrlX', 'Ctrl+X'),
                        icon: core_1._.createIconNoSpan('clipboardCut', this.gridOptionsService, null),
                        disabled: !isEditable || this.gridOptionsService.get('suppressCutToClipboard'),
                        action: () => this.clipboardService.cutToClipboard(undefined, 'contextMenu')
                    };
                }
                else {
                    return null;
                }
            case 'paste':
                if (core_1.ModuleRegistry.__assertRegistered(core_1.ModuleNames.ClipboardModule, 'Paste from Clipboard', this.context.getGridId())) {
                    return {
                        name: localeTextFunc('paste', 'Paste'),
                        shortcut: localeTextFunc('ctrlV', 'Ctrl+V'),
                        disabled: true,
                        icon: core_1._.createIconNoSpan('clipboardPaste', this.gridOptionsService, null),
                        action: () => this.clipboardService.pasteFromClipboard()
                    };
                }
                else {
                    return null;
                }
            case 'export':
                const exportSubMenuItems = [];
                const csvModuleLoaded = core_1.ModuleRegistry.__isRegistered(core_1.ModuleNames.CsvExportModule, this.context.getGridId());
                const excelModuleLoaded = core_1.ModuleRegistry.__isRegistered(core_1.ModuleNames.ExcelExportModule, this.context.getGridId());
                if (!this.gridOptionsService.get('suppressCsvExport') && csvModuleLoaded) {
                    exportSubMenuItems.push('csvExport');
                }
                if (!this.gridOptionsService.get('suppressExcelExport') && excelModuleLoaded) {
                    exportSubMenuItems.push('excelExport');
                }
                return {
                    name: localeTextFunc('export', 'Export'),
                    subMenu: exportSubMenuItems,
                    icon: core_1._.createIconNoSpan('save', this.gridOptionsService, null),
                };
            case 'csvExport':
                return {
                    name: localeTextFunc('csvExport', 'CSV Export'),
                    icon: core_1._.createIconNoSpan('csvExport', this.gridOptionsService, null),
                    action: () => this.gridApi.exportDataAsCsv({})
                };
            case 'excelExport':
                return {
                    name: localeTextFunc('excelExport', 'Excel Export'),
                    icon: core_1._.createIconNoSpan('excelExport', this.gridOptionsService, null),
                    action: () => this.gridApi.exportDataAsExcel()
                };
            case 'separator':
                return 'separator';
            case 'pivotChart':
            case 'chartRange':
                return (_a = this.chartMenuItemMapper.getChartItems(key)) !== null && _a !== void 0 ? _a : null;
            default: {
                console.warn(`AG Grid: unknown menu item type ${key}`);
                return null;
            }
        }
    }
    createAggregationSubMenu(column) {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        let columnToUse;
        if (column.isPrimary()) {
            columnToUse = column;
        }
        else {
            const pivotValueColumn = column.getColDef().pivotValueColumn;
            columnToUse = core_1._.exists(pivotValueColumn) ? pivotValueColumn : undefined;
        }
        const result = [];
        if (columnToUse) {
            const columnIsAlreadyAggValue = columnToUse.isValueActive();
            const funcNames = this.aggFuncService.getFuncNames(columnToUse);
            result.push({
                name: localeTextFunc('noAggregation', 'None'),
                action: () => {
                    this.columnModel.removeValueColumn(columnToUse, "contextMenu");
                    this.columnModel.setColumnAggFunc(columnToUse, undefined, "contextMenu");
                },
                checked: !columnIsAlreadyAggValue
            });
            funcNames.forEach(funcName => {
                result.push({
                    name: localeTextFunc(funcName, this.aggFuncService.getDefaultFuncLabel(funcName)),
                    action: () => {
                        this.columnModel.setColumnAggFunc(columnToUse, funcName, "contextMenu");
                        this.columnModel.addValueColumn(columnToUse, "contextMenu");
                    },
                    checked: columnIsAlreadyAggValue && columnToUse.getAggFunc() === funcName
                });
            });
        }
        return result;
    }
};
__decorate([
    (0, core_1.Autowired)('columnModel')
], MenuItemMapper.prototype, "columnModel", void 0);
__decorate([
    (0, core_1.Autowired)('gridApi')
], MenuItemMapper.prototype, "gridApi", void 0);
__decorate([
    (0, core_1.Optional)('clipboardService')
], MenuItemMapper.prototype, "clipboardService", void 0);
__decorate([
    (0, core_1.Optional)('aggFuncService')
], MenuItemMapper.prototype, "aggFuncService", void 0);
__decorate([
    (0, core_1.Autowired)('focusService')
], MenuItemMapper.prototype, "focusService", void 0);
__decorate([
    (0, core_1.Autowired)('rowPositionUtils')
], MenuItemMapper.prototype, "rowPositionUtils", void 0);
__decorate([
    (0, core_1.Autowired)('chartMenuItemMapper')
], MenuItemMapper.prototype, "chartMenuItemMapper", void 0);
MenuItemMapper = __decorate([
    (0, core_1.Bean)('menuItemMapper')
], MenuItemMapper);
exports.MenuItemMapper = MenuItemMapper;
