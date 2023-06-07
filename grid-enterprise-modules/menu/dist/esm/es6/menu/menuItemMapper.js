var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, ModuleNames, ModuleRegistry, Optional, } from '@ag-grid-community/core';
let MenuItemMapper = class MenuItemMapper extends BeanStub {
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
                    disabled: (column === null || column === void 0 ? void 0 : column.isRowGroupActive()) || !(column === null || column === void 0 ? void 0 : column.getColDef().enableRowGroup),
                    action: () => this.columnModel.addRowGroupColumn(column, "contextMenu"),
                    icon: _.createIconNoSpan('menuAddRowGroup', this.gridOptionsService, null)
                };
            case 'rowUnGroup':
                return {
                    name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + _.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    disabled: !(column === null || column === void 0 ? void 0 : column.isRowGroupActive()) || !(column === null || column === void 0 ? void 0 : column.getColDef().enableRowGroup),
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
                    name: localeTextFunc('expandAll', 'Expand All Row Groups'),
                    action: () => this.gridApi.expandAll()
                };
            case 'contractAll':
                return {
                    name: localeTextFunc('collapseAll', 'Collapse All Row Groups'),
                    action: () => this.gridApi.collapseAll()
                };
            case 'copy':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Copy from Menu', this.context.getGridId())) {
                    return {
                        name: localeTextFunc('copy', 'Copy'),
                        shortcut: localeTextFunc('ctrlC', 'Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.gridOptionsService, null),
                        action: () => this.clipboardService.copyToClipboard()
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
                        action: () => this.clipboardService.copyToClipboard({ includeHeaders: true })
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
                        action: () => this.clipboardService.copyToClipboard({ includeHeaders: true, includeGroupHeaders: true })
                    };
                }
                else {
                    return null;
                }
            case 'cut':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Cut from Menu', this.context.getGridId())) {
                    const focusedCell = this.focusService.getFocusedCell();
                    const rowNode = focusedCell ? this.rowPositionUtils.getRowNode(focusedCell) : null;
                    const isEditable = rowNode ? focusedCell === null || focusedCell === void 0 ? void 0 : focusedCell.column.isCellEditable(rowNode) : false;
                    return {
                        name: localeTextFunc('cut', 'Cut'),
                        shortcut: localeTextFunc('ctrlX', 'Ctrl+X'),
                        icon: _.createIconNoSpan('clipboardCut', this.gridOptionsService, null),
                        disabled: !isEditable || this.gridOptionsService.is('suppressCutToClipboard'),
                        action: () => this.clipboardService.cutToClipboard(undefined, 'contextMenu')
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
                        action: () => this.clipboardService.pasteFromClipboard()
                    };
                }
                else {
                    return null;
                }
            case 'export':
                const exportSubMenuItems = [];
                const csvModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.CsvExportModule, this.context.getGridId());
                const excelModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.ExcelExportModule, this.context.getGridId());
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
            columnToUse = _.exists(pivotValueColumn) ? pivotValueColumn : undefined;
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
                    name: localeTextFunc(funcName, _.capitalise(funcName)),
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
export { MenuItemMapper };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudUl0ZW1NYXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbWVudS9tZW51SXRlbU1hcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUNELFNBQVMsRUFDVCxJQUFJLEVBQ0osUUFBUSxFQU9SLFdBQVcsRUFBRSxjQUFjLEVBQzNCLFFBQVEsR0FHWCxNQUFNLHlCQUF5QixDQUFDO0FBSWpDLElBQWEsY0FBYyxHQUEzQixNQUFhLGNBQWUsU0FBUSxRQUFRO0lBVWpDLGlCQUFpQixDQUFDLFlBQXNDLEVBQUUsTUFBcUI7UUFDbEYsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNmLE9BQU8sRUFBRSxDQUFDO1NBQ2I7UUFFRCxNQUFNLFVBQVUsR0FBNkIsRUFBRSxDQUFDO1FBRWhELFlBQVksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtZQUNwQyxJQUFJLE1BQW1DLENBQUM7WUFFeEMsSUFBSSxPQUFPLGdCQUFnQixLQUFLLFFBQVEsRUFBRTtnQkFDdEMsTUFBTSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQzthQUM1RDtpQkFBTTtnQkFDSCw0RUFBNEU7Z0JBQzVFLE1BQU0scUJBQVEsZ0JBQWdCLENBQUUsQ0FBQzthQUNwQztZQUNELDBGQUEwRjtZQUMxRixJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUFFLE9BQU87YUFBRTtZQUV4QixNQUFNLFNBQVMsR0FBRyxNQUFxQixDQUFDO1lBQ3hDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxTQUFTLENBQUM7WUFFOUIsSUFBSSxPQUFPLElBQUksT0FBTyxZQUFZLEtBQUssRUFBRTtnQkFDckMsU0FBUyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBbUMsRUFBRSxNQUFNLENBQUMsQ0FBQzthQUMzRjtZQUVELElBQUksTUFBTSxJ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