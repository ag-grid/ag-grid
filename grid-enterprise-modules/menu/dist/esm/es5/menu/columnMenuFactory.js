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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AgMenuList, Autowired, Bean, BeanStub, _ } from "@ag-grid-community/core";
var ColumnMenuFactory = /** @class */ (function (_super) {
    __extends(ColumnMenuFactory, _super);
    function ColumnMenuFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ColumnMenuFactory_1 = ColumnMenuFactory;
    ColumnMenuFactory.prototype.createMenu = function (parent, column, sourceElement) {
        var menuList = parent.createManagedBean(new AgMenuList(0, {
            column: column !== null && column !== void 0 ? column : null,
            node: null,
            value: null
        }));
        var menuItems = this.getMenuItems(column);
        var menuItemsMapped = this.menuItemMapper.mapWithStockItems(menuItems, column !== null && column !== void 0 ? column : null, sourceElement);
        menuList.addMenuItems(menuItemsMapped);
        return menuList;
    };
    ColumnMenuFactory.prototype.getMenuItems = function (column) {
        var defaultItems = this.getDefaultMenuOptions(column);
        var result;
        var columnMainMenuItems = column === null || column === void 0 ? void 0 : column.getColDef().mainMenuItems;
        if (Array.isArray(columnMainMenuItems)) {
            result = columnMainMenuItems;
        }
        else if (typeof columnMainMenuItems === 'function') {
            result = columnMainMenuItems(this.gridOptionsService.addGridCommonParams({
                column: column,
                defaultItems: defaultItems
            }));
        }
        else {
            var userFunc = this.gridOptionsService.getCallback('getMainMenuItems');
            if (userFunc && column) {
                result = userFunc({
                    column: column,
                    defaultItems: defaultItems
                });
            }
            else {
                result = defaultItems;
            }
        }
        // GUI looks weird when two separators are side by side. this can happen accidentally
        // if we remove items from the menu then two separators can edit up adjacent.
        _.removeRepeatsFromArray(result, ColumnMenuFactory_1.MENU_ITEM_SEPARATOR);
        return result;
    };
    ColumnMenuFactory.prototype.getDefaultMenuOptions = function (column) {
        var result = [];
        var isLegacyMenuEnabled = this.menuService.isLegacyMenuEnabled();
        if (!column) {
            if (!isLegacyMenuEnabled) {
                result.push('columnChooser');
            }
            result.push('resetColumns');
            return result;
        }
        var allowPinning = !column.getColDef().lockPinned;
        var rowGroupCount = this.columnModel.getRowGroupColumns().length;
        var doingGrouping = rowGroupCount > 0;
        var allowValue = column.isAllowValue();
        var allowRowGroup = column.isAllowRowGroup();
        var isPrimary = column.isPrimary();
        var pivotModeOn = this.columnModel.isPivotMode();
        var isInMemoryRowModel = this.rowModel.getType() === 'clientSide';
        var usingTreeData = this.gridOptionsService.get('treeData');
        var allowValueAgg = 
        // if primary, then only allow aggValue if grouping and it's a value columns
        (isPrimary && doingGrouping && allowValue)
            // secondary columns can always have aggValue, as it means it's a pivot value column
            || !isPrimary;
        if (!isLegacyMenuEnabled && column.isSortable()) {
            var sort = column.getSort();
            if (sort !== 'asc') {
                result.push('sortAscending');
            }
            if (sort !== 'desc') {
                result.push('sortDescending');
            }
            if (sort) {
                result.push('sortUnSort');
            }
            result.push(ColumnMenuFactory_1.MENU_ITEM_SEPARATOR);
        }
        if (this.menuService.isFilterMenuItemEnabled(column)) {
            result.push('columnFilter');
            result.push(ColumnMenuFactory_1.MENU_ITEM_SEPARATOR);
        }
        if (allowPinning) {
            result.push('pinSubMenu');
        }
        if (allowValueAgg) {
            result.push('valueAggSubMenu');
        }
        if (allowPinning || allowValueAgg) {
            result.push(ColumnMenuFactory_1.MENU_ITEM_SEPARATOR);
        }
        result.push('autoSizeThis');
        result.push('autoSizeAll');
        result.push(ColumnMenuFactory_1.MENU_ITEM_SEPARATOR);
        var showRowGroup = column.getColDef().showRowGroup;
        if (showRowGroup) {
            result.push('rowUnGroup');
        }
        else if (allowRowGroup && column.isPrimary()) {
            if (column.isRowGroupActive()) {
                var groupLocked = this.columnModel.isColumnGroupingLocked(column);
                if (!groupLocked) {
                    result.push('rowUnGroup');
                }
            }
            else {
                result.push('rowGroup');
            }
        }
        result.push(ColumnMenuFactory_1.MENU_ITEM_SEPARATOR);
        if (!isLegacyMenuEnabled) {
            result.push('columnChooser');
        }
        result.push('resetColumns');
        // only add grouping expand/collapse if grouping in the InMemoryRowModel
        // if pivoting, we only have expandable groups if grouping by 2 or more columns
        // as the lowest level group is not expandable while pivoting.
        // if not pivoting, then any active row group can be expanded.
        var allowExpandAndContract = isInMemoryRowModel && (usingTreeData || rowGroupCount > (pivotModeOn ? 1 : 0));
        if (allowExpandAndContract) {
            result.push('expandAll');
            result.push('contractAll');
        }
        return result;
    };
    var ColumnMenuFactory_1;
    ColumnMenuFactory.MENU_ITEM_SEPARATOR = 'separator';
    __decorate([
        Autowired('menuItemMapper')
    ], ColumnMenuFactory.prototype, "menuItemMapper", void 0);
    __decorate([
        Autowired('columnModel')
    ], ColumnMenuFactory.prototype, "columnModel", void 0);
    __decorate([
        Autowired('rowModel')
    ], ColumnMenuFactory.prototype, "rowModel", void 0);
    __decorate([
        Autowired('filterManager')
    ], ColumnMenuFactory.prototype, "filterManager", void 0);
    __decorate([
        Autowired('menuService')
    ], ColumnMenuFactory.prototype, "menuService", void 0);
    ColumnMenuFactory = ColumnMenuFactory_1 = __decorate([
        Bean('columnMenuFactory')
    ], ColumnMenuFactory);
    return ColumnMenuFactory;
}(BeanStub));
export { ColumnMenuFactory };
