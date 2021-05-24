/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
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
import { Component } from '../widgets/component';
import { Autowired, PostConstruct, PreDestroy } from '../context/context';
import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { Events } from '../events';
import { HeaderWrapperComp } from './header/headerWrapperComp';
import { HeaderGroupWrapperComp } from './headerGroup/headerGroupWrapperComp';
import { Constants } from '../constants/constants';
import { FloatingFilterWrapper } from '../filter/floating/floatingFilterWrapper';
import { isBrowserSafari } from '../utils/browser';
import { missing } from '../utils/generic';
import { removeFromArray } from '../utils/array';
import { setDomChildOrder } from '../utils/dom';
import { setAriaRowIndex } from '../utils/aria';
export var HeaderRowType;
(function (HeaderRowType) {
    HeaderRowType[HeaderRowType["COLUMN_GROUP"] = 0] = "COLUMN_GROUP";
    HeaderRowType[HeaderRowType["COLUMN"] = 1] = "COLUMN";
    HeaderRowType[HeaderRowType["FLOATING_FILTER"] = 2] = "FLOATING_FILTER";
})(HeaderRowType || (HeaderRowType = {}));
var HeaderRowComp = /** @class */ (function (_super) {
    __extends(HeaderRowComp, _super);
    function HeaderRowComp(dept, type, pinned) {
        var _this = _super.call(this, /* html */ "<div class=\"ag-header-row\" role=\"row\"></div>") || this;
        _this.headerComps = {};
        _this.setRowIndex(dept);
        _this.type = type;
        _this.pinned = pinned;
        var niceClassName = HeaderRowType[type].toLowerCase().replace(/_/g, '-');
        _this.addCssClass("ag-header-row-" + niceClassName);
        if (isBrowserSafari()) {
            // fix for a Safari rendering bug that caused the header to flicker above chart panels
            // as you move the mouse over the header
            _this.getGui().style.transform = 'translateZ(0)';
        }
        return _this;
    }
    HeaderRowComp.prototype.forEachHeaderElement = function (callback) {
        var _this = this;
        Object.keys(this.headerComps).forEach(function (key) {
            callback(_this.headerComps[key]);
        });
    };
    HeaderRowComp.prototype.setRowIndex = function (rowIndex) {
        this.dept = rowIndex;
        setAriaRowIndex(this.getGui(), rowIndex + 1);
    };
    HeaderRowComp.prototype.getRowIndex = function () {
        return this.dept;
    };
    HeaderRowComp.prototype.getType = function () {
        return this.type;
    };
    HeaderRowComp.prototype.destroyAllChildComponents = function () {
        var idsOfAllChildren = Object.keys(this.headerComps);
        this.destroyChildComponents(idsOfAllChildren);
    };
    HeaderRowComp.prototype.destroyChildComponents = function (idsToDestroy) {
        var _this = this;
        idsToDestroy.forEach(function (id) {
            var childHeaderWrapper = _this.headerComps[id];
            _this.getGui().removeChild(childHeaderWrapper.getGui());
            _this.destroyBean(childHeaderWrapper);
            delete _this.headerComps[id];
        });
    };
    HeaderRowComp.prototype.onRowHeightChanged = function () {
        var headerRowCount = this.columnController.getHeaderRowCount();
        var sizes = [];
        var numberOfFloating = 0;
        var groupHeight;
        var headerHeight;
        if (this.columnController.isPivotMode()) {
            groupHeight = this.gridOptionsWrapper.getPivotGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getPivotHeaderHeight();
        }
        else {
            if (this.columnController.hasFloatingFilters()) {
                headerRowCount++;
                numberOfFloating = 1;
            }
            groupHeight = this.gridOptionsWrapper.getGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getHeaderHeight();
        }
        var numberOfNonGroups = 1 + numberOfFloating;
        var numberOfGroups = headerRowCount - numberOfNonGroups;
        for (var i = 0; i < numberOfGroups; i++) {
            sizes.push(groupHeight);
        }
        sizes.push(headerHeight);
        for (var i = 0; i < numberOfFloating; i++) {
            sizes.push(this.gridOptionsWrapper.getFloatingFiltersHeight());
        }
        var rowHeight = 0;
        for (var i = 0; i < this.dept; i++) {
            rowHeight += sizes[i];
        }
        this.getGui().style.top = rowHeight + 'px';
        this.getGui().style.height = sizes[this.dept] + 'px';
    };
    //noinspection JSUnusedLocalSymbols
    HeaderRowComp.prototype.init = function () {
        this.onRowHeightChanged();
        this.onVirtualColumnsChanged();
        this.setWidth();
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        // this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
    };
    HeaderRowComp.prototype.onColumnResized = function () {
        this.setWidth();
    };
    HeaderRowComp.prototype.setWidth = function () {
        var width = this.getWidthForRow();
        this.getGui().style.width = width + 'px';
    };
    HeaderRowComp.prototype.getWidthForRow = function () {
        var printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
        if (printLayout) {
            var centerRow = missing(this.pinned);
            if (centerRow) {
                return this.columnController.getContainerWidth(Constants.PINNED_RIGHT)
                    + this.columnController.getContainerWidth(Constants.PINNED_LEFT)
                    + this.columnController.getContainerWidth(null);
            }
            return 0;
        }
        // if not printing, just return the width as normal
        return this.columnController.getContainerWidth(this.pinned);
    };
    HeaderRowComp.prototype.onDisplayedColumnsChanged = function () {
        this.onVirtualColumnsChanged();
        this.setWidth();
    };
    HeaderRowComp.prototype.getColumnsInViewport = function () {
        var printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
        return printLayout ? this.getColumnsInViewportPrintLayout() : this.getColumnsInViewportNormalLayout();
    };
    HeaderRowComp.prototype.getColumnsInViewportPrintLayout = function () {
        var _this = this;
        // for print layout, we add all columns into the center
        if (this.pinned != null) {
            return [];
        }
        var viewportColumns = [];
        var actualDepth = this.getActualDepth();
        [Constants.PINNED_LEFT, null, Constants.PINNED_RIGHT].forEach(function (pinned) {
            var items = _this.columnController.getVirtualHeaderGroupRow(pinned, actualDepth);
            viewportColumns = viewportColumns.concat(items);
        });
        return viewportColumns;
    };
    HeaderRowComp.prototype.getActualDepth = function () {
        return this.type == HeaderRowType.FLOATING_FILTER ? this.dept - 1 : this.dept;
    };
    HeaderRowComp.prototype.getColumnsInViewportNormalLayout = function () {
        // when in normal layout, we add the columns for that container only
        return this.columnController.getVirtualHeaderGroupRow(this.pinned, this.getActualDepth());
    };
    HeaderRowComp.prototype.onVirtualColumnsChanged = function () {
        var _this = this;
        var compIdsToRemove = Object.keys(this.headerComps);
        var compIdsWanted = [];
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
            var eParentContainer = _this.getGui();
            // if we already have this cell rendered, do nothing
            var previousComp = _this.headerComps[idOfChild];
            // it's possible there is a new Column with the same ID, but it's for a different Column.
            // this is common with pivoting, where the pivot cols change, but the id's are still pivot_0,
            // pivot_1 etc. so if new col but same ID, need to remove the old col here first as we are
            // about to replace it in the this.headerComps map.
            var previousCompForOldColumn = previousComp && previousComp.getColumn() != child;
            if (previousCompForOldColumn) {
                _this.destroyChildComponents([idOfChild]);
                removeFromArray(compIdsToRemove, idOfChild);
                previousComp = undefined;
            }
            if (previousComp) {
                // already have comp for this column, so do nothing
                removeFromArray(compIdsToRemove, idOfChild);
            }
            else {
                // don't have comp, need to create one
                var headerComp = _this.createHeaderComp(child);
                _this.headerComps[idOfChild] = headerComp;
                eParentContainer.appendChild(headerComp.getGui());
            }
            compIdsWanted.push(idOfChild);
        });
        // we want to keep columns that are focused, otherwise keyboard navigation breaks
        var isFocusedAndDisplayed = function (colId) {
            var wrapper = _this.headerComps[colId];
            var isFocused = _this.focusController.isHeaderWrapperFocused(wrapper);
            if (!isFocused) {
                return false;
            }
            var isDisplayed = _this.columnController.isDisplayed(wrapper.getColumn());
            return isDisplayed;
        };
        var focusedAndDisplayedComps = compIdsToRemove.filter(isFocusedAndDisplayed);
        focusedAndDisplayedComps.forEach(function (colId) {
            removeFromArray(compIdsToRemove, colId);
            compIdsWanted.push(colId);
        });
        // at this point, anything left in currentChildIds is an element that is no longer in the viewport
        this.destroyChildComponents(compIdsToRemove);
        var ensureDomOrder = this.gridOptionsWrapper.isEnsureDomOrder();
        if (ensureDomOrder) {
            var correctChildOrder = compIdsWanted.map(function (id) { return _this.headerComps[id].getGui(); });
            setDomChildOrder(this.getGui(), correctChildOrder);
        }
    };
    HeaderRowComp.prototype.createHeaderComp = function (columnGroupChild) {
        var result;
        switch (this.type) {
            case HeaderRowType.COLUMN_GROUP:
                result = new HeaderGroupWrapperComp(columnGroupChild, this.pinned);
                break;
            case HeaderRowType.FLOATING_FILTER:
                result = new FloatingFilterWrapper(columnGroupChild, this.pinned);
                break;
            default:
                result = new HeaderWrapperComp(columnGroupChild, this.pinned);
                break;
        }
        this.createBean(result);
        result.setParentComponent(this);
        return result;
    };
    HeaderRowComp.prototype.getHeaderComps = function () {
        return this.headerComps;
    };
    __decorate([
        Autowired('columnController')
    ], HeaderRowComp.prototype, "columnController", void 0);
    __decorate([
        Autowired('focusController')
    ], HeaderRowComp.prototype, "focusController", void 0);
    __decorate([
        PreDestroy
    ], HeaderRowComp.prototype, "destroyAllChildComponents", null);
    __decorate([
        PostConstruct
    ], HeaderRowComp.prototype, "init", null);
    return HeaderRowComp;
}(Component));
export { HeaderRowComp };
