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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { AgMenuItemComponent, AgMenuList, Autowired, Column, Component, PostConstruct, ProvidedColumnGroup, _ } from "@ag-grid-community/core";
var ToolPanelContextMenu = /** @class */ (function (_super) {
    __extends(ToolPanelContextMenu, _super);
    function ToolPanelContextMenu(column, mouseEvent, parentEl) {
        var _this = _super.call(this, /* html */ "<div class=\"ag-menu\"></div>") || this;
        _this.column = column;
        _this.mouseEvent = mouseEvent;
        _this.parentEl = parentEl;
        _this.displayName = null;
        return _this;
    }
    ToolPanelContextMenu.prototype.postConstruct = function () {
        this.initializeProperties(this.column);
        this.buildMenuItemMap();
        if (this.column instanceof Column) {
            this.displayName = this.columnModel.getDisplayNameForColumn(this.column, 'columnToolPanel');
        }
        else {
            this.displayName = this.columnModel.getDisplayNameForProvidedColumnGroup(null, this.column, 'columnToolPanel');
        }
        if (this.isActive()) {
            this.mouseEvent.preventDefault();
            this.displayContextMenu();
        }
    };
    ToolPanelContextMenu.prototype.initializeProperties = function (column) {
        if (column instanceof ProvidedColumnGroup) {
            this.columns = column.getLeafColumns();
        }
        else {
            this.columns = [column];
        }
        this.allowGrouping = this.columns.some(function (col) { return col.isPrimary() && col.isAllowRowGroup(); });
        this.allowValues = this.columns.some(function (col) { return col.isPrimary() && col.isAllowValue(); });
        this.allowPivoting = this.columnModel.isPivotMode() && this.columns.some(function (col) { return col.isPrimary() && col.isAllowPivot(); });
    };
    ToolPanelContextMenu.prototype.buildMenuItemMap = function () {
        var _this = this;
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        this.menuItemMap = new Map();
        this.menuItemMap.set('rowGroup', {
            allowedFunction: function (col) { return col.isPrimary() && col.isAllowRowGroup(); },
            activeFunction: function (col) { return col.isRowGroupActive(); },
            activateLabel: function () { return localeTextFunc('groupBy', 'Group by') + " " + _this.displayName; },
            deactivateLabel: function () { return localeTextFunc('ungroupBy', 'Un-Group by') + " " + _this.displayName; },
            activateFunction: function () {
                var groupedColumns = _this.columnModel.getRowGroupColumns();
                _this.columnModel.setRowGroupColumns(_this.addColumnsToList(groupedColumns), "toolPanelUi");
            },
            deActivateFunction: function () {
                var groupedColumns = _this.columnModel.getRowGroupColumns();
                _this.columnModel.setRowGroupColumns(_this.removeColumnsFromList(groupedColumns), "toolPanelUi");
            },
            addIcon: 'menuAddRowGroup',
            removeIcon: 'menuRemoveRowGroup'
        });
        this.menuItemMap.set('value', {
            allowedFunction: function (col) { return col.isPrimary() && col.isAllowValue(); },
            activeFunction: function (col) { return col.isValueActive(); },
            activateLabel: function () { return localeTextFunc('addToValues', "Add " + _this.displayName + " to values", [_this.displayName]); },
            deactivateLabel: function () { return localeTextFunc('removeFromValues', "Remove " + _this.displayName + " from values", [_this.displayName]); },
            activateFunction: function () {
                var valueColumns = _this.columnModel.getValueColumns();
                _this.columnModel.setValueColumns(_this.addColumnsToList(valueColumns), "toolPanelUi");
            },
            deActivateFunction: function () {
                var valueColumns = _this.columnModel.getValueColumns();
                _this.columnModel.setValueColumns(_this.removeColumnsFromList(valueColumns), "toolPanelUi");
            },
            addIcon: 'valuePanel',
            removeIcon: 'valuePanel'
        });
        this.menuItemMap.set('pivot', {
            allowedFunction: function (col) { return _this.columnModel.isPivotMode() && col.isPrimary() && col.isAllowPivot(); },
            activeFunction: function (col) { return col.isPivotActive(); },
            activateLabel: function () { return localeTextFunc('addToLabels', "Add " + _this.displayName + " to labels", [_this.displayName]); },
            deactivateLabel: function () { return localeTextFunc('removeFromLabels', "Remove " + _this.displayName + " from labels", [_this.displayName]); },
            activateFunction: function () {
                var pivotColumns = _this.columnModel.getPivotColumns();
                _this.columnModel.setPivotColumns(_this.addColumnsToList(pivotColumns), "toolPanelUi");
            },
            deActivateFunction: function () {
                var pivotColumns = _this.columnModel.getPivotColumns();
                _this.columnModel.setPivotColumns(_this.removeColumnsFromList(pivotColumns), "toolPanelUi");
            },
            addIcon: 'pivotPanel',
            removeIcon: 'pivotPanel'
        });
    };
    ToolPanelContextMenu.prototype.addColumnsToList = function (columnList) {
        return __spreadArray([], __read(columnList)).concat(this.columns.filter(function (col) { return columnList.indexOf(col) === -1; }));
    };
    ToolPanelContextMenu.prototype.removeColumnsFromList = function (columnList) {
        var _this = this;
        return columnList.filter(function (col) { return _this.columns.indexOf(col) === -1; });
    };
    ToolPanelContextMenu.prototype.displayContextMenu = function () {
        var _this = this;
        var eGui = this.getGui();
        var menuList = this.createBean(new AgMenuList());
        var menuItemsMapped = this.getMappedMenuItems();
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var hideFunc = function () { };
        eGui.appendChild(menuList.getGui());
        menuList.addMenuItems(menuItemsMapped);
        menuList.addManagedListener(menuList, AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, function () {
            _this.parentEl.focus();
            hideFunc();
        });
        var addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eGui,
            closeOnEsc: true,
            afterGuiAttached: function () { return _this.focusService.focusInto(menuList.getGui()); },
            ariaLabel: localeTextFunc('ariaLabelContextMenu', 'Context Menu'),
            closedCallback: function (e) {
                if (e instanceof KeyboardEvent) {
                    _this.parentEl.focus();
                }
                _this.destroyBean(menuList);
            }
        });
        if (addPopupRes) {
            hideFunc = addPopupRes.hideFunc;
        }
        this.popupService.positionPopupUnderMouseEvent({
            type: 'columnContextMenu',
            mouseEvent: this.mouseEvent,
            ePopup: eGui
        });
    };
    ToolPanelContextMenu.prototype.isActive = function () {
        return this.allowGrouping || this.allowValues || this.allowPivoting;
    };
    ToolPanelContextMenu.prototype.getMappedMenuItems = function () {
        var e_1, _a;
        var ret = [];
        var _loop_1 = function (val) {
            var isInactive = this_1.columns.some(function (col) { return val.allowedFunction(col) && !val.activeFunction(col); });
            var isActive = this_1.columns.some(function (col) { return val.allowedFunction(col) && val.activeFunction(col); });
            if (isInactive) {
                ret.push({
                    name: val.activateLabel(this_1.displayName),
                    icon: _.createIconNoSpan(val.addIcon, this_1.gridOptionsService, null),
                    action: function () { return val.activateFunction(); }
                });
            }
            if (isActive) {
                ret.push({
                    name: val.deactivateLabel(this_1.displayName),
                    icon: _.createIconNoSpan(val.removeIcon, this_1.gridOptionsService, null),
                    action: function () { return val.deActivateFunction(); }
                });
            }
        };
        var this_1 = this;
        try {
            for (var _b = __values(this.menuItemMap.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var val = _c.value;
                _loop_1(val);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return ret;
    };
    __decorate([
        Autowired('columnModel')
    ], ToolPanelContextMenu.prototype, "columnModel", void 0);
    __decorate([
        Autowired('popupService')
    ], ToolPanelContextMenu.prototype, "popupService", void 0);
    __decorate([
        Autowired('focusService')
    ], ToolPanelContextMenu.prototype, "focusService", void 0);
    __decorate([
        PostConstruct
    ], ToolPanelContextMenu.prototype, "postConstruct", null);
    return ToolPanelContextMenu;
}(Component));
export { ToolPanelContextMenu };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbFBhbmVsQ29udGV4dE1lbnUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29sdW1uVG9vbFBhbmVsL3Rvb2xQYW5lbENvbnRleHRNZW51LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILG1CQUFtQixFQUNuQixVQUFVLEVBQ1YsU0FBUyxFQUNULE1BQU0sRUFFTixTQUFTLEVBSVQsYUFBYSxFQUNiLG1CQUFtQixFQUNuQixDQUFDLEVBQ0osTUFBTSx5QkFBeUIsQ0FBQztBQWVqQztJQUEwQyx3Q0FBUztJQWEvQyw4QkFDcUIsTUFBb0MsRUFDcEMsVUFBc0IsRUFDdEIsUUFBcUI7UUFIMUMsWUFLSSxrQkFBTSxVQUFVLENBQUMsK0JBQTZCLENBQUMsU0FDbEQ7UUFMb0IsWUFBTSxHQUFOLE1BQU0sQ0FBOEI7UUFDcEMsZ0JBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsY0FBUSxHQUFSLFFBQVEsQ0FBYTtRQVRsQyxpQkFBVyxHQUFrQixJQUFJLENBQUM7O0lBWTFDLENBQUM7SUFHTyw0Q0FBYSxHQUFyQjtRQUNJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFeEIsSUFBSSxJQUFJLENBQUMsTUFBTSxZQUFZLE1BQU0sRUFBRTtZQUMvQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1NBQy9GO2FBQU07WUFDSCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsb0NBQW9DLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMs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