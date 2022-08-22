/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
var abstractHeaderCellCtrl_1 = require("../abstractCell/abstractHeaderCellCtrl");
var keyCode_1 = require("../../../constants/keyCode");
var context_1 = require("../../../context/context");
var column_1 = require("../../../entities/column");
var events_1 = require("../../../events");
var gridApi_1 = require("../../../gridApi");
var setLeftFeature_1 = require("../../../rendering/features/setLeftFeature");
var dom_1 = require("../../../utils/dom");
var icon_1 = require("../../../utils/icon");
var managedFocusFeature_1 = require("../../../widgets/managedFocusFeature");
var hoverFeature_1 = require("../hoverFeature");
var componentTypes_1 = require("../../../components/framework/componentTypes");
var HeaderFilterCellCtrl = /** @class */ (function (_super) {
    __extends(HeaderFilterCellCtrl, _super);
    function HeaderFilterCellCtrl(column, parentRowCtrl) {
        var _this = _super.call(this, column, parentRowCtrl) || this;
        _this.column = column;
        return _this;
    }
    HeaderFilterCellCtrl.prototype.setComp = function (comp, eGui, eButtonShowMainFilter, eFloatingFilterBody) {
        _super.prototype.setGui.call(this, eGui);
        this.comp = comp;
        this.eButtonShowMainFilter = eButtonShowMainFilter;
        this.eFloatingFilterBody = eFloatingFilterBody;
        var colDef = this.column.getColDef();
        var filterExists = !!colDef.filter || !!colDef.filterFramework;
        var floatingFilterExists = !!colDef.floatingFilter;
        this.active = filterExists && floatingFilterExists;
        this.setupWidth();
        this.setupLeft();
        this.setupHover();
        this.setupFocus();
        this.setupUserComp();
        this.setupSyncWithFilter();
        this.setupUi();
        this.addManagedListener(this.eButtonShowMainFilter, 'click', this.showParentFilter.bind(this));
    };
    HeaderFilterCellCtrl.prototype.setupUi = function () {
        this.comp.addOrRemoveButtonWrapperCssClass('ag-hidden', !this.active || this.suppressFilterButton);
        if (!this.active) {
            return;
        }
        this.comp.addOrRemoveBodyCssClass('ag-floating-filter-full-body', this.suppressFilterButton);
        this.comp.addOrRemoveBodyCssClass('ag-floating-filter-body', !this.suppressFilterButton);
        var eMenuIcon = icon_1.createIconNoSpan('filter', this.gridOptionsWrapper, this.column);
        if (eMenuIcon) {
            this.eButtonShowMainFilter.appendChild(eMenuIcon);
        }
    };
    HeaderFilterCellCtrl.prototype.setupFocus = function () {
        this.createManagedBean(new managedFocusFeature_1.ManagedFocusFeature(this.eGui, {
            shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
            onTabKeyDown: this.onTabKeyDown.bind(this),
            handleKeyDown: this.handleKeyDown.bind(this),
            onFocusIn: this.onFocusIn.bind(this)
        }));
    };
    HeaderFilterCellCtrl.prototype.onTabKeyDown = function (e) {
        var eDocument = this.gridOptionsWrapper.getDocument();
        var activeEl = eDocument.activeElement;
        var wrapperHasFocus = activeEl === this.eGui;
        if (wrapperHasFocus) {
            return;
        }
        var nextFocusableEl = this.focusService.findNextFocusableElement(this.eGui, null, e.shiftKey);
        if (nextFocusableEl) {
            this.beans.headerNavigationService.scrollToColumn(this.column);
            e.preventDefault();
            nextFocusableEl.focus();
            return;
        }
        var nextFocusableColumn = this.findNextColumnWithFloatingFilter(e.shiftKey);
        if (!nextFocusableColumn) {
            return;
        }
        if (this.focusService.focusHeaderPosition({
            headerPosition: {
                headerRowIndex: this.getParentRowCtrl().getRowIndex(),
                column: nextFocusableColumn
            },
            event: e
        })) {
            e.preventDefault();
        }
    };
    HeaderFilterCellCtrl.prototype.findNextColumnWithFloatingFilter = function (backwards) {
        var columModel = this.beans.columnModel;
        var nextCol = this.column;
        do {
            nextCol = backwards
                ? columModel.getDisplayedColBefore(nextCol)
                : columModel.getDisplayedColAfter(nextCol);
            if (!nextCol) {
                break;
            }
        } while (!nextCol.getColDef().filter || !nextCol.getColDef().floatingFilter);
        return nextCol;
    };
    HeaderFilterCellCtrl.prototype.handleKeyDown = function (e) {
        _super.prototype.handleKeyDown.call(this, e);
        var wrapperHasFocus = this.getWrapperHasFocus();
        switch (e.key) {
            case keyCode_1.KeyCode.UP:
            case keyCode_1.KeyCode.DOWN:
                if (!wrapperHasFocus) {
                    e.preventDefault();
                }
            case keyCode_1.KeyCode.LEFT:
            case keyCode_1.KeyCode.RIGHT:
                if (wrapperHasFocus) {
                    return;
                }
                e.stopPropagation();
            case keyCode_1.KeyCode.ENTER:
                if (wrapperHasFocus) {
                    if (this.focusService.focusInto(this.eGui)) {
                        e.preventDefault();
                    }
                }
                break;
            case keyCode_1.KeyCode.ESCAPE:
                if (!wrapperHasFocus) {
                    this.eGui.focus();
                }
        }
    };
    HeaderFilterCellCtrl.prototype.onFocusIn = function (e) {
        var isRelatedWithin = this.eGui.contains(e.relatedTarget);
        // when the focus is already within the component,
        // we default to the browser's behavior
        if (isRelatedWithin) {
            return;
        }
        var notFromHeaderWrapper = !!e.relatedTarget && !e.relatedTarget.classList.contains('ag-floating-filter');
        var fromWithinHeader = !!e.relatedTarget && dom_1.isElementChildOfClass(e.relatedTarget, 'ag-floating-filter');
        if (notFromHeaderWrapper && fromWithinHeader && e.target === this.eGui) {
            var lastFocusEvent = this.lastFocusEvent;
            var fromTab = !!(lastFocusEvent && lastFocusEvent.key === keyCode_1.KeyCode.TAB);
            if (lastFocusEvent && fromTab) {
                var shouldFocusLast = lastFocusEvent.shiftKey;
                this.focusService.focusInto(this.eGui, shouldFocusLast);
            }
        }
        var rowIndex = this.getRowIndex();
        this.beans.focusService.setFocusedHeader(rowIndex, this.column);
    };
    HeaderFilterCellCtrl.prototype.setupHover = function () {
        var _this = this;
        this.createManagedBean(new hoverFeature_1.HoverFeature([this.column], this.eGui));
        var listener = function () {
            if (!_this.gridOptionsWrapper.isColumnHoverHighlight()) {
                return;
            }
            var hovered = _this.columnHoverService.isHovered(_this.column);
            _this.comp.addOrRemoveCssClass('ag-column-hover', hovered);
        };
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_HOVER_CHANGED, listener);
        listener();
    };
    HeaderFilterCellCtrl.prototype.setupLeft = function () {
        var setLeftFeature = new setLeftFeature_1.SetLeftFeature(this.column, this.eGui, this.beans);
        this.createManagedBean(setLeftFeature);
    };
    HeaderFilterCellCtrl.prototype.setupUserComp = function () {
        var _this = this;
        if (!this.active) {
            return;
        }
        var colDef = this.column.getColDef();
        var filterParams = this.filterManager.createFilterParams(this.column, colDef);
        var finalFilterParams = this.userComponentFactory.mergeParamsWithApplicationProvidedParams(colDef, componentTypes_1.FilterComponent, filterParams);
        var defaultFloatingFilterType = this.userComponentFactory.getDefaultFloatingFilterType(colDef);
        if (defaultFloatingFilterType == null) {
            defaultFloatingFilterType = 'agReadOnlyFloatingFilter';
        }
        var params = {
            column: this.column,
            filterParams: finalFilterParams,
            currentParentModel: function () { return _this.currentParentModel(); },
            parentFilterInstance: function (cb) { return _this.parentFilterInstance(cb); },
            showParentFilter: function () { return _this.showParentFilter(); },
            suppressFilterButton: false // This one might be overridden from the colDef
        };
        // this is unusual - we need a params value OUTSIDE the component the params are for.
        // the params are for the floating filter component, but this property is actually for the wrapper.
        this.suppressFilterButton = colDef.floatingFilterComponentParams ? !!colDef.floatingFilterComponentParams.suppressFilterButton : false;
        var compDetails = this.userComponentFactory.getFloatingFilterCompDetails(colDef, params, defaultFloatingFilterType);
        if (compDetails) {
            this.comp.setCompDetails(compDetails);
        }
    };
    HeaderFilterCellCtrl.prototype.currentParentModel = function () {
        var filterComponent = this.getFilterComponent(false);
        return filterComponent ? filterComponent.resolveNow(null, function (filter) { return filter && filter.getModel(); }) : null;
    };
    HeaderFilterCellCtrl.prototype.getFilterComponent = function (createIfDoesNotExist) {
        if (createIfDoesNotExist === void 0) { createIfDoesNotExist = true; }
        return this.filterManager.getFilterComponent(this.column, 'NO_UI', createIfDoesNotExist);
    };
    HeaderFilterCellCtrl.prototype.parentFilterInstance = function (callback) {
        var filterComponent = this.getFilterComponent();
        if (filterComponent == null) {
            return;
        }
        filterComponent.then(function (instance) {
            callback(gridApi_1.unwrapUserComp(instance));
        });
    };
    HeaderFilterCellCtrl.prototype.showParentFilter = function () {
        var eventSource = this.suppressFilterButton ? this.eFloatingFilterBody : this.eButtonShowMainFilter;
        this.menuFactory.showMenuAfterButtonClick(this.column, eventSource, 'floatingFilter', 'filterMenuTab', ['filterMenuTab']);
    };
    HeaderFilterCellCtrl.prototype.setupSyncWithFilter = function () {
        var _this = this;
        if (!this.active) {
            return;
        }
        var syncWithFilter = function (filterChangedEvent) {
            var compPromise = _this.comp.getFloatingFilterComp();
            if (!compPromise) {
                return;
            }
            var parentModel = _this.currentParentModel();
            compPromise.then(function (comp) {
                if (comp) {
                    comp.onParentModelChanged(parentModel, filterChangedEvent);
                }
            });
        };
        this.addManagedListener(this.column, column_1.Column.EVENT_FILTER_CHANGED, syncWithFilter);
        if (this.filterManager.isFilterActive(this.column)) {
            syncWithFilter(null);
        }
    };
    HeaderFilterCellCtrl.prototype.setupWidth = function () {
        var _this = this;
        var listener = function () {
            var width = _this.column.getActualWidth() + "px";
            _this.comp.setWidth(width);
        };
        this.addManagedListener(this.column, column_1.Column.EVENT_WIDTH_CHANGED, listener);
        listener();
    };
    __decorate([
        context_1.Autowired('filterManager')
    ], HeaderFilterCellCtrl.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('columnHoverService')
    ], HeaderFilterCellCtrl.prototype, "columnHoverService", void 0);
    __decorate([
        context_1.Autowired('menuFactory')
    ], HeaderFilterCellCtrl.prototype, "menuFactory", void 0);
    return HeaderFilterCellCtrl;
}(abstractHeaderCellCtrl_1.AbstractHeaderCellCtrl));
exports.HeaderFilterCellCtrl = HeaderFilterCellCtrl;
