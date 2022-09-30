/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
import { Constants } from "../../constants/constants";
import { BeanStub } from "../../context/beanStub";
import { Autowired, PreDestroy } from "../../context/context";
import { Events } from "../../eventKeys";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { isBrowserSafari } from "../../utils/browser";
import { getAllValuesInObject, iterateObject } from "../../utils/object";
import { HeaderFilterCellCtrl } from "../cells/floatingFilter/headerFilterCellCtrl";
import { HeaderCellCtrl } from "../cells/column/headerCellCtrl";
import { HeaderGroupCellCtrl } from "../cells/columnGroup/headerGroupCellCtrl";
import { HeaderRowType } from "./headerRowComp";
import { values } from "../../utils/generic";
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
        if (isBrowserSafari()) {
            // fix for a Safari rendering bug that caused the header to flicker above chart panels
            // as you move the mouse over the header
            this.comp.setTransform('translateZ(0)');
        }
        comp.setAriaRowIndex(this.rowIndex + 1);
    };
    HeaderRowCtrl.prototype.addEventListeners = function () {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        // when print layout changes, it changes what columns are in what section
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HEADER_HEIGHT_CHANGED, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, this.onRowHeightChanged.bind(this));
    };
    HeaderRowCtrl.prototype.getHeaderCellCtrl = function (column) {
        return values(this.headerCellCtrls).find(function (cellCtrl) { return cellCtrl.getColumnGroupChild() === column; });
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
        var printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
        if (printLayout) {
            var pinned = this.pinned != null;
            if (pinned) {
                return 0;
            }
            return this.columnModel.getContainerWidth(Constants.PINNED_RIGHT)
                + this.columnModel.getContainerWidth(Constants.PINNED_LEFT)
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
            sizes.push(this.gridOptionsWrapper.getFloatingFiltersHeight());
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
                    case HeaderRowType.FLOATING_FILTER:
                        headerCtrl = _this.createBean(new HeaderFilterCellCtrl(child, _this));
                        break;
                    case HeaderRowType.COLUMN_GROUP:
                        headerCtrl = _this.createBean(new HeaderGroupCellCtrl(child, _this));
                        break;
                    default:
                        headerCtrl = _this.createBean(new HeaderCellCtrl(child, _this));
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
        iterateObject(oldCtrls, function (id, oldCtrl) {
            var keepCtrl = isFocusedAndDisplayed(oldCtrl);
            if (keepCtrl) {
                _this.headerCellCtrls[id] = oldCtrl;
            }
            else {
                _this.destroyBean(oldCtrl);
            }
        });
        var ctrlsToDisplay = getAllValuesInObject(this.headerCellCtrls);
        this.comp.setHeaderCtrls(ctrlsToDisplay);
    };
    HeaderRowCtrl.prototype.destroyCtrls = function () {
        var _this = this;
        iterateObject(this.headerCellCtrls, function (key, ctrl) {
            _this.destroyBean(ctrl);
        });
        this.headerCellCtrls = {};
    };
    HeaderRowCtrl.prototype.getColumnsInViewport = function () {
        var printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
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
        [Constants.PINNED_LEFT, null, Constants.PINNED_RIGHT].forEach(function (pinned) {
            var items = _this.columnModel.getVirtualHeaderGroupRow(pinned, actualDepth);
            viewportColumns = viewportColumns.concat(items);
        });
        return viewportColumns;
    };
    HeaderRowCtrl.prototype.getActualDepth = function () {
        return this.type == HeaderRowType.FLOATING_FILTER ? this.rowIndex - 1 : this.rowIndex;
    };
    HeaderRowCtrl.prototype.getColumnsInViewportNormalLayout = function () {
        // when in normal layout, we add the columns for that container only
        return this.columnModel.getVirtualHeaderGroupRow(this.pinned, this.getActualDepth());
    };
    HeaderRowCtrl.prototype.focusHeader = function (column, event) {
        var allCtrls = getAllValuesInObject(this.headerCellCtrls);
        var ctrl = allCtrls.find(function (ctrl) { return ctrl.getColumnGroupChild() == column; });
        if (!ctrl) {
            return false;
        }
        ctrl.focus(event);
        return true;
    };
    __decorate([
        Autowired('columnModel')
    ], HeaderRowCtrl.prototype, "columnModel", void 0);
    __decorate([
        Autowired('focusService')
    ], HeaderRowCtrl.prototype, "focusService", void 0);
    __decorate([
        PreDestroy
    ], HeaderRowCtrl.prototype, "destroyCtrls", null);
    return HeaderRowCtrl;
}(BeanStub));
export { HeaderRowCtrl };
