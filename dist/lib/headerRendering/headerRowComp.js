/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v12.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../widgets/component");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var columnController_1 = require("../columnController/columnController");
var column_1 = require("../entities/column");
var renderedHeaderCell_1 = require("./deprecated/renderedHeaderCell");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var utils_1 = require("../utils");
var headerWrapperComp_1 = require("./header/headerWrapperComp");
var headerGroupWrapperComp_1 = require("./headerGroup/headerGroupWrapperComp");
var filterManager_1 = require("../filter/filterManager");
var componentProvider_1 = require("../componentProvider");
var HeaderRowType;
(function (HeaderRowType) {
    HeaderRowType[HeaderRowType["COLUMN_GROUP"] = 0] = "COLUMN_GROUP";
    HeaderRowType[HeaderRowType["COLUMN"] = 1] = "COLUMN";
    HeaderRowType[HeaderRowType["FLOATING_FILTER"] = 2] = "FLOATING_FILTER";
})(HeaderRowType = exports.HeaderRowType || (exports.HeaderRowType = {}));
var HeaderRowComp = (function (_super) {
    __extends(HeaderRowComp, _super);
    function HeaderRowComp(dept, type, pinned, eRoot, dropTarget) {
        var _this = _super.call(this, "<div class=\"ag-header-row\" role=\"presentation\"/>") || this;
        _this.headerComps = {};
        _this.dept = dept;
        _this.type = type;
        _this.pinned = pinned;
        _this.eRoot = eRoot;
        _this.dropTarget = dropTarget;
        return _this;
    }
    HeaderRowComp.prototype.forEachHeaderElement = function (callback) {
        var _this = this;
        Object.keys(this.headerComps).forEach(function (key) {
            var headerElement = _this.headerComps[key];
            callback(headerElement);
        });
    };
    HeaderRowComp.prototype.destroy = function () {
        var idsOfAllChildren = Object.keys(this.headerComps);
        this.removeAndDestroyChildComponents(idsOfAllChildren);
        _super.prototype.destroy.call(this);
    };
    HeaderRowComp.prototype.removeAndDestroyChildComponents = function (idsToDestroy) {
        var _this = this;
        idsToDestroy.forEach(function (id) {
            var child = _this.headerComps[id];
            _this.getGui().removeChild(child.getGui());
            if (child.destroy) {
                child.destroy();
            }
            delete _this.headerComps[id];
        });
    };
    HeaderRowComp.prototype.onRowHeightChanged = function () {
        var headerRowCount = this.columnController.getHeaderRowCount();
        var sizes = [];
        var numberOfFloating = 0;
        var groupHeight;
        var headerHeight;
        if (!this.columnController.isPivotMode()) {
            if (this.gridOptionsWrapper.isFloatingFilter()) {
                headerRowCount++;
            }
            numberOfFloating = (this.gridOptionsWrapper.isFloatingFilter()) ? 1 : 0;
            groupHeight = this.gridOptionsWrapper.getGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getHeaderHeight();
        }
        else {
            numberOfFloating = 0;
            groupHeight = this.gridOptionsWrapper.getPivotGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getPivotHeaderHeight();
        }
        var numberOfNonGroups = 1 + numberOfFloating;
        var numberOfGroups = headerRowCount - numberOfNonGroups;
        for (var i = 0; i < numberOfGroups; i++)
            sizes.push(groupHeight);
        sizes.push(headerHeight);
        for (var i = 0; i < numberOfFloating; i++)
            sizes.push(this.gridOptionsWrapper.getFloatingFiltersHeight());
        var rowHeight = 0;
        for (var i = 0; i < this.dept; i++)
            rowHeight += sizes[i];
        this.getGui().style.top = rowHeight + 'px';
        this.getGui().style.height = sizes[this.dept] + 'px';
    };
    //noinspection JSUnusedLocalSymbols
    HeaderRowComp.prototype.init = function () {
        this.onRowHeightChanged();
        this.onVirtualColumnsChanged();
        this.setWidth();
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
    };
    HeaderRowComp.prototype.onColumnResized = function () {
        this.setWidth();
    };
    HeaderRowComp.prototype.setWidth = function () {
        var mainRowWidth = this.columnController.getContainerWidth(this.pinned) + 'px';
        this.getGui().style.width = mainRowWidth;
    };
    HeaderRowComp.prototype.onGridColumnsChanged = function () {
        this.removeAndDestroyAllChildComponents();
    };
    HeaderRowComp.prototype.removeAndDestroyAllChildComponents = function () {
        var idsOfAllChildren = Object.keys(this.headerComps);
        this.removeAndDestroyChildComponents(idsOfAllChildren);
    };
    HeaderRowComp.prototype.onDisplayedColumnsChanged = function () {
        this.onVirtualColumnsChanged();
        this.setWidth();
    };
    HeaderRowComp.prototype.onVirtualColumnsChanged = function () {
        var _this = this;
        var currentChildIds = Object.keys(this.headerComps);
        var itemsAtDepth = this.columnController.getVirtualHeaderGroupRow(this.pinned, this.type == HeaderRowType.FLOATING_FILTER ?
            this.dept - 1 :
            this.dept);
        var ensureDomOrder = this.gridOptionsWrapper.isEnsureDomOrder();
        var eBefore;
        itemsAtDepth.forEach(function (child) {
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
            var colAlreadyInDom = currentChildIds.indexOf(idOfChild) >= 0;
            var headerComp;
            if (colAlreadyInDom) {
                utils_1.Utils.removeFromArray(currentChildIds, idOfChild);
                headerComp = _this.headerComps[idOfChild];
                if (ensureDomOrder) {
                    utils_1.Utils.ensureDomOrder(eParentContainer, headerComp.getGui(), eBefore);
                }
            }
            else {
                headerComp = _this.createHeaderComp(child);
                _this.headerComps[idOfChild] = headerComp;
                if (ensureDomOrder) {
                    utils_1.Utils.insertWithDomOrder(eParentContainer, headerComp.getGui(), eBefore);
                }
                else {
                    eParentContainer.appendChild(headerComp.getGui());
                }
            }
            eBefore = headerComp.getGui();
        });
        // at this point, anything left in currentChildIds is an element that is no longer in the viewport
        this.removeAndDestroyChildComponents(currentChildIds);
    };
    // check if user is using the deprecated
    HeaderRowComp.prototype.isUsingOldHeaderRenderer = function (column) {
        var colDef = column.getColDef();
        return utils_1.Utils.anyExists([
            // header template
            this.gridOptionsWrapper.getHeaderCellTemplateFunc(),
            this.gridOptionsWrapper.getHeaderCellTemplate(),
            colDef.headerCellTemplate,
            // header cellRenderer
            colDef.headerCellRenderer,
            this.gridOptionsWrapper.getHeaderCellRenderer()
        ]);
    };
    HeaderRowComp.prototype.createHeaderComp = function (columnGroupChild) {
        var result;
        switch (this.type) {
            case HeaderRowType.COLUMN:
                if (this.isUsingOldHeaderRenderer(columnGroupChild)) {
                    result = new renderedHeaderCell_1.RenderedHeaderCell(columnGroupChild, this.eRoot, this.dropTarget, this.pinned);
                }
                else {
                    result = new headerWrapperComp_1.HeaderWrapperComp(columnGroupChild, this.eRoot, this.dropTarget, this.pinned);
                }
                break;
            case HeaderRowType.COLUMN_GROUP:
                result = new headerGroupWrapperComp_1.HeaderGroupWrapperComp(columnGroupChild, this.eRoot, this.dropTarget, this.pinned);
                break;
            case HeaderRowType.FLOATING_FILTER:
                var column = columnGroupChild;
                result = this.createFloatingFilterWrapper(column);
                break;
        }
        this.context.wireBean(result);
        return result;
    };
    HeaderRowComp.prototype.createFloatingFilterWrapper = function (column) {
        var _this = this;
        var floatingFilterParams = this.createFloatingFilterParams(column);
        var floatingFilterWrapper = this.componentProvider.newFloatingFilterWrapperComponent(column, floatingFilterParams);
        this.addDestroyableEventListener(column, column_1.Column.EVENT_FILTER_CHANGED, function () {
            var filterComponent = _this.filterManager.getFilterComponent(column);
            floatingFilterWrapper.onParentModelChanged(filterComponent.getModel());
        });
        var cachedFilter = this.filterManager.cachedFilter(column);
        if (cachedFilter) {
            var filterComponent = this.filterManager.getFilterComponent(column);
            floatingFilterWrapper.onParentModelChanged(filterComponent.getModel());
        }
        return floatingFilterWrapper;
    };
    HeaderRowComp.prototype.createFloatingFilterParams = function (column) {
        var _this = this;
        // We always get the freshest reference to the baseFilter because the filters get sometimes created
        // and destroyed between calls
        //
        // let filterComponent:BaseFilter<any, any, any> = <any>this.filterManager.getFilterComponent(column);
        //
        var baseParams = {
            column: column,
            currentParentModel: function () {
                var filterComponent = _this.filterManager.getFilterComponent(column);
                return (filterComponent.getNullableModel) ?
                    filterComponent.getNullableModel() :
                    filterComponent.getModel();
            },
            onFloatingFilterChanged: function (change) {
                var filterComponent = _this.filterManager.getFilterComponent(column);
                if (filterComponent.onFloatingFilterChanged) {
                    //If going through this branch of code the user MUST
                    //be passing an object of type change that contains
                    //a model propery inside and some other stuff
                    return filterComponent.onFloatingFilterChanged(change);
                }
                else {
                    //If going through this branch of code the user MUST
                    //be passing the plain model and delegating to ag-Grid
                    //the responsibility to set the parent model and refresh
                    //the filters
                    filterComponent.setModel(change);
                    _this.filterManager.onFilterChanged();
                    return true;
                }
            },
            //This one might be overriden from the colDef
            suppressFilterButton: false
        };
        return baseParams;
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], HeaderRowComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], HeaderRowComp.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], HeaderRowComp.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], HeaderRowComp.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('filterManager'),
        __metadata("design:type", filterManager_1.FilterManager)
    ], HeaderRowComp.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('componentProvider'),
        __metadata("design:type", componentProvider_1.ComponentProvider)
    ], HeaderRowComp.prototype, "componentProvider", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], HeaderRowComp.prototype, "init", null);
    return HeaderRowComp;
}(component_1.Component));
exports.HeaderRowComp = HeaderRowComp;
