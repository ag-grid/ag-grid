/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderRowCtrl = void 0;
var beanStub_1 = require("../../context/beanStub");
var context_1 = require("../../context/context");
var eventKeys_1 = require("../../eventKeys");
var browser_1 = require("../../utils/browser");
var object_1 = require("../../utils/object");
var headerFilterCellCtrl_1 = require("../cells/floatingFilter/headerFilterCellCtrl");
var headerCellCtrl_1 = require("../cells/column/headerCellCtrl");
var headerGroupCellCtrl_1 = require("../cells/columnGroup/headerGroupCellCtrl");
var headerRowComp_1 = require("./headerRowComp");
var generic_1 = require("../../utils/generic");
var instanceIdSequence = 0;
var HeaderRowCtrl = /** @class */ (function (_super) {
    __extends(HeaderRowCtrl, _super);
    function HeaderRowCtrl(rowIndex, pinned, type) {
        var _this = _super.call(this) || this;
        _this.instanceId = instanceIdSequence++;
        _this.headerCellCtrls = {};
        _this.rowIndex = rowIndex;
        _this.pinned = pinned;
        _this.type = type;
        return _this;
    }
    HeaderRowCtrl.prototype.getInstanceId = function () {
        return this.instanceId;
    };
    HeaderRowCtrl.prototype.setComp = function (comp) {
        this.comp = comp;
        this.onRowHeightChanged();
        this.onVirtualColumnsChanged();
        this.setWidth();
        this.addEventListeners();
        if (browser_1.isBrowserSafari()) {
            // fix for a Safari rendering bug that caused the header to flicker above chart panels
            // as you move the mouse over the header
            this.comp.setTransform('translateZ(0)');
        }
        comp.setAriaRowIndex(this.rowIndex + 1);
    };
    HeaderRowCtrl.prototype.addEventListeners = function () {
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_HEADER_HEIGHT_CHANGED, this.onRowHeightChanged.bind(this));
        // when print layout changes, it changes what columns are in what section
        this.addManagedPropertyListener('domLayout', this.onDisplayedColumnsChanged.bind(this));
        this.addManagedPropertyListener('headerHeight', this.onRowHeightChanged.bind(this));
        this.addManagedPropertyListener('pivotHeaderHeight', this.onRowHeightChanged.bind(this));
        this.addManagedPropertyListener('groupHeaderHeight', this.onRowHeightChanged.bind(this));
        this.addManagedPropertyListener('pivotGroupHeaderHeight', this.onRowHeightChanged.bind(this));
        this.addManagedPropertyListener('floatingFiltersHeight', this.onRowHeightChanged.bind(this));
    };
    HeaderRowCtrl.prototype.getHeaderCellCtrl = function (column) {
        return generic_1.values(this.headerCellCtrls).find(function (cellCtrl) { return cellCtrl.getColumnGroupChild() === column; });
    };
    HeaderRowCtrl.prototype.onDisplayedColumnsChanged = function () {
        this.onVirtualColumnsChanged();
        this.setWidth();
        this.onRowHeightChanged();
    };
    HeaderRowCtrl.prototype.getType = function () {
        return this.type;
    };
    HeaderRowCtrl.prototype.onColumnResized = function () {
        this.setWidth();
    };
    HeaderRowCtrl.prototype.setWidth = function () {
        var width = this.getWidthForRow();
        this.comp.setWidth(width + "px");
    };
    HeaderRowCtrl.prototype.getWidthForRow = function () {
        var printLayout = this.gridOptionsService.isDomLayout('print');
        if (printLayout) {
            var pinned = this.pinned != null;
            if (pinned) {
                return 0;
            }
            return this.columnModel.getContainerWidth('right')
                + this.columnModel.getContainerWidth('left')
                + this.columnModel.getContainerWidth(null);
        }
        // if not printing, just return the width as normal
        return this.columnModel.getContainerWidth(this.pinned);
    };
    HeaderRowCtrl.prototype.onRowHeightChanged = function () {
        var headerRowCount = this.columnModel.getHeaderRowCount();
        var sizes = [];
        var numberOfFloating = 0;
        if (this.columnModel.hasFloatingFilters()) {
            headerRowCount++;
            numberOfFloating = 1;
        }
        var groupHeight = this.columnModel.getColumnGroupHeaderRowHeight();
        var headerHeight = this.columnModel.getColumnHeaderRowHeight();
        var numberOfNonGroups = 1 + numberOfFloating;
        var numberOfGroups = headerRowCount - numberOfNonGroups;
        for (var i = 0; i < numberOfGroups; i++) {
            sizes.push(groupHeight);
        }
        sizes.push(headerHeight);
        for (var i = 0; i < numberOfFloating; i++) {
            sizes.push(this.columnModel.getFloatingFiltersHeight());
        }
        var topOffset = 0;
        for (var i = 0; i < this.rowIndex; i++) {
            topOffset += sizes[i];
        }
        var thisRowHeight = sizes[this.rowIndex] + 'px';
        this.comp.setTop(topOffset + 'px');
        this.comp.setHeight(thisRowHeight);
    };
    HeaderRowCtrl.prototype.getPinned = function () {
        return this.pinned;
    };
    HeaderRowCtrl.prototype.getRowIndex = function () {
        return this.rowIndex;
    };
    HeaderRowCtrl.prototype.onVirtualColumnsChanged = function () {
        var _this = this;
        var oldCtrls = this.headerCellCtrls;
        this.headerCellCtrls = {};
        var columns = this.getColumnsInViewport();
        columns.forEach(function (child) {
            // skip groups that have no displayed children. this can happen when the group is broken,
            // and this section happens to have nothing to display for the open / closed state.
            // (a broken group is one that is split, ie columns in the group have a non-group column
            // in between them)
            if (child.isEmptyGroup()) {
                return;
            }
            var idOfChild = child.getUniqueId();
            // if we already have this cell rendered, do nothing
            var headerCtrl = oldCtrls[idOfChild];
            delete oldCtrls[idOfChild];
            // it's possible there is a new Column with the same ID, but it's for a different Column.
            // this is common with pivoting, where the pivot cols change, but the id's are still pivot_0,
            // pivot_1 etc. so if new col but same ID, need to remove the old col here first as we are
            // about to replace it in the this.headerComps map.
            var forOldColumn = headerCtrl && headerCtrl.getColumnGroupChild() != child;
            if (forOldColumn) {
                _this.destroyBean(headerCtrl);
                headerCtrl = undefined;
            }
            if (headerCtrl == null) {
                switch (_this.type) {
                    case headerRowComp_1.HeaderRowType.FLOATING_FILTER:
                        headerCtrl = _this.createBean(new headerFilterCellCtrl_1.HeaderFilterCellCtrl(child, _this));
                        break;
                    case headerRowComp_1.HeaderRowType.COLUMN_GROUP:
                        headerCtrl = _this.createBean(new headerGroupCellCtrl_1.HeaderGroupCellCtrl(child, _this));
                        break;
                    default:
                        headerCtrl = _this.createBean(new headerCellCtrl_1.HeaderCellCtrl(child, _this));
                        break;
                }
            }
            _this.headerCellCtrls[idOfChild] = headerCtrl;
        });
        // we want to keep columns that are focused, otherwise keyboard navigation breaks
        var isFocusedAndDisplayed = function (ctrl) {
            var isFocused = _this.focusService.isHeaderWrapperFocused(ctrl);
            if (!isFocused) {
                return false;
            }
            var isDisplayed = _this.columnModel.isDisplayed(ctrl.getColumnGroupChild());
            return isDisplayed;
        };
        object_1.iterateObject(oldCtrls, function (id, oldCtrl) {
            var keepCtrl = isFocusedAndDisplayed(oldCtrl);
            if (keepCtrl) {
                _this.headerCellCtrls[id] = oldCtrl;
            }
            else {
                _this.destroyBean(oldCtrl);
            }
        });
        var ctrlsToDisplay = object_1.getAllValuesInObject(this.headerCellCtrls);
        this.comp.setHeaderCtrls(ctrlsToDisplay);
    };
    HeaderRowCtrl.prototype.destroyCtrls = function () {
        var _this = this;
        object_1.iterateObject(this.headerCellCtrls, function (key, ctrl) {
            _this.destroyBean(ctrl);
        });
        this.headerCellCtrls = {};
    };
    HeaderRowCtrl.prototype.getColumnsInViewport = function () {
        var printLayout = this.gridOptionsService.isDomLayout('print');
        return printLayout ? this.getColumnsInViewportPrintLayout() : this.getColumnsInViewportNormalLayout();
    };
    HeaderRowCtrl.prototype.getColumnsInViewportPrintLayout = function () {
        var _this = this;
        // for print layout, we add all columns into the center
        if (this.pinned != null) {
            return [];
        }
        var viewportColumns = [];
        var actualDepth = this.getActualDepth();
        ['left', null, 'right'].forEach(function (pinned) {
            var items = _this.columnModel.getVirtualHeaderGroupRow(pinned, actualDepth);
            viewportColumns = viewportColumns.concat(items);
        });
        return viewportColumns;
    };
    HeaderRowCtrl.prototype.getActualDepth = function () {
        return this.type == headerRowComp_1.HeaderRowType.FLOATING_FILTER ? this.rowIndex - 1 : this.rowIndex;
    };
    HeaderRowCtrl.prototype.getColumnsInViewportNormalLayout = function () {
        // when in normal layout, we add the columns for that container only
        return this.columnModel.getVirtualHeaderGroupRow(this.pinned, this.getActualDepth());
    };
    HeaderRowCtrl.prototype.focusHeader = function (column, event) {
        var allCtrls = object_1.getAllValuesInObject(this.headerCellCtrls);
        var ctrl = allCtrls.find(function (ctrl) { return ctrl.getColumnGroupChild() == column; });
        if (!ctrl) {
            return false;
        }
        ctrl.focus(event);
        return true;
    };
    __decorate([
        context_1.Autowired('columnModel')
    ], HeaderRowCtrl.prototype, "columnModel", void 0);
    __decorate([
        context_1.Autowired('focusService')
    ], HeaderRowCtrl.prototype, "focusService", void 0);
    __decorate([
        context_1.PreDestroy
    ], HeaderRowCtrl.prototype, "destroyCtrls", null);
    return HeaderRowCtrl;
}(beanStub_1.BeanStub));
exports.HeaderRowCtrl = HeaderRowCtrl;
