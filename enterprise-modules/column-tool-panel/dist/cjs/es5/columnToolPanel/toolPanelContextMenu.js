"use strict";
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
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
        if (this.column instanceof core_1.Column) {
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
        if (column instanceof core_1.ProvidedColumnGroup) {
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
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
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
        return __spread(columnList).concat(this.columns.filter(function (col) { return columnList.indexOf(col) === -1; }));
    };
    ToolPanelContextMenu.prototype.removeColumnsFromList = function (columnList) {
        var _this = this;
        return columnList.filter(function (col) { return _this.columns.indexOf(col) === -1; });
    };
    ToolPanelContextMenu.prototype.displayContextMenu = function () {
        var _this = this;
        var eGui = this.getGui();
        var menuList = this.createBean(new core_1.AgMenuList());
        var menuItemsMapped = this.getMappedMenuItems();
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var hideFunc = function () { };
        eGui.appendChild(menuList.getGui());
        menuList.addMenuItems(menuItemsMapped);
        menuList.addManagedListener(menuList, core_1.AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, function () {
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
                    icon: core_1._.createIconNoSpan(val.addIcon, this_1.gridOptionsWrapper, null),
                    action: function () { return val.activateFunction(); }
                });
            }
            if (isActive) {
                ret.push({
                    name: val.deactivateLabel(this_1.displayName),
                    icon: core_1._.createIconNoSpan(val.removeIcon, this_1.gridOptionsWrapper, null),
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
        core_1.Autowired('columnModel')
    ], ToolPanelContextMenu.prototype, "columnModel", void 0);
    __decorate([
        core_1.Autowired('popupService')
    ], ToolPanelContextMenu.prototype, "popupService", void 0);
    __decorate([
        core_1.Autowired('focusService')
    ], ToolPanelContextMenu.prototype, "focusService", void 0);
    __decorate([
        core_1.PostConstruct
    ], ToolPanelContextMenu.prototype, "postConstruct", null);
    return ToolPanelContextMenu;
}(core_1.Component));
exports.ToolPanelContextMenu = ToolPanelContextMenu;
