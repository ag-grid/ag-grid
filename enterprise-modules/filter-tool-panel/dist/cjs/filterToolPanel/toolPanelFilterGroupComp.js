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
var core_1 = require("@ag-grid-community/core");
var toolPanelFilterComp_1 = require("./toolPanelFilterComp");
var ToolPanelFilterGroupComp = /** @class */ (function (_super) {
    __extends(ToolPanelFilterGroupComp, _super);
    function ToolPanelFilterGroupComp(columnGroup, childFilterComps, expandedCallback, depth) {
        var _this = _super.call(this) || this;
        _this.columnGroup = columnGroup;
        _this.childFilterComps = childFilterComps;
        _this.depth = depth;
        _this.expandedCallback = expandedCallback;
        return _this;
    }
    ToolPanelFilterGroupComp.prototype.preConstruct = function () {
        this.setTemplate(ToolPanelFilterGroupComp.TEMPLATE);
    };
    ToolPanelFilterGroupComp.prototype.init = function () {
        var _this = this;
        this.setGroupTitle();
        this.filterGroupComp.setAlignItems('stretch');
        core_1._.addCssClass(this.filterGroupComp.getGui(), "ag-level-" + this.depth);
        this.childFilterComps.forEach(function (filterComp) { return _this.filterGroupComp.addItem(filterComp); });
        if (!this.isColumnGroup()) {
            this.addTopLevelColumnGroupExpandListener();
        }
        else {
            this.addDestroyableEventListener(this.filterGroupComp, 'expanded', function () {
                _this.expandedCallback();
            });
            this.addDestroyableEventListener(this.filterGroupComp, 'collapsed', function () {
                _this.expandedCallback();
            });
        }
        this.addFilterChangedListeners();
    };
    ToolPanelFilterGroupComp.prototype.refreshFilters = function () {
        this.childFilterComps.forEach(function (filterComp) {
            if (filterComp instanceof ToolPanelFilterGroupComp) {
                filterComp.refreshFilters();
            }
            else {
                filterComp.refreshFilter();
            }
        });
    };
    ToolPanelFilterGroupComp.prototype.isColumnGroup = function () {
        return this.columnGroup instanceof core_1.OriginalColumnGroup;
    };
    ToolPanelFilterGroupComp.prototype.isExpanded = function () {
        return this.filterGroupComp.isExpanded();
    };
    ToolPanelFilterGroupComp.prototype.getChildren = function () {
        return this.childFilterComps;
    };
    ToolPanelFilterGroupComp.prototype.getFilterGroupName = function () {
        return this.filterGroupName ? this.filterGroupName : '';
    };
    ToolPanelFilterGroupComp.prototype.getFilterGroupId = function () {
        return this.columnGroup.getId();
    };
    ToolPanelFilterGroupComp.prototype.hideGroupItem = function (hide, index) {
        this.filterGroupComp.hideItem(hide, index);
    };
    ToolPanelFilterGroupComp.prototype.hideGroup = function (hide) {
        core_1._.addOrRemoveCssClass(this.getGui(), 'ag-hidden', hide);
    };
    ToolPanelFilterGroupComp.prototype.addTopLevelColumnGroupExpandListener = function () {
        var _this = this;
        this.addDestroyableEventListener(this.filterGroupComp, 'expanded', function () {
            _this.childFilterComps.forEach(function (filterComp) {
                // also need to refresh the virtual list on set filters as the filter may have been updated elsewhere
                if (filterComp instanceof toolPanelFilterComp_1.ToolPanelFilterComp) {
                    filterComp.expand();
                    filterComp.refreshFilter();
                }
                else {
                    filterComp.refreshFilters();
                }
            });
        });
    };
    ToolPanelFilterGroupComp.prototype.addFilterChangedListeners = function () {
        var _this = this;
        if (this.columnGroup instanceof core_1.OriginalColumnGroup) {
            var group_1 = this.columnGroup;
            var anyChildFiltersActive_1 = function () { return group_1.getLeafColumns().some(function (col) { return col.isFilterActive(); }); };
            group_1.getLeafColumns().forEach(function (column) {
                _this.addDestroyableEventListener(column, core_1.Column.EVENT_FILTER_CHANGED, function () {
                    core_1._.addOrRemoveCssClass(_this.filterGroupComp.getGui(), 'ag-has-filter', anyChildFiltersActive_1());
                });
            });
        }
        else {
            var column_1 = this.columnGroup;
            this.addDestroyableEventListener(this.eventService, core_1.Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));
            this.addDestroyableEventListener(column_1, core_1.Column.EVENT_FILTER_CHANGED, function () {
                core_1._.addOrRemoveCssClass(_this.filterGroupComp.getGui(), 'ag-has-filter', column_1.isFilterActive());
            });
        }
    };
    ToolPanelFilterGroupComp.prototype.onFilterOpened = function (event) {
        // when a filter is opened elsewhere, i.e. column menu we close the filter comp so we also need to collapse
        // the column group. This approach means we don't need to try and sync filter models on the same column.
        if (event.source !== 'COLUMN_MENU') {
            return;
        }
        if (event.column !== this.columnGroup) {
            return;
        }
        if (!this.isExpanded()) {
            return;
        }
        this.collapse();
    };
    ToolPanelFilterGroupComp.prototype.expand = function () {
        this.filterGroupComp.toggleGroupExpand(true);
    };
    ToolPanelFilterGroupComp.prototype.collapse = function () {
        this.filterGroupComp.toggleGroupExpand(false);
    };
    ToolPanelFilterGroupComp.prototype.setGroupTitle = function () {
        this.filterGroupName = (this.columnGroup instanceof core_1.OriginalColumnGroup) ?
            this.getColumnGroupName(this.columnGroup) : this.getColumnName(this.columnGroup);
        this.filterGroupComp.setTitle(this.filterGroupName);
    };
    ToolPanelFilterGroupComp.prototype.getColumnGroupName = function (columnGroup) {
        return this.columnController.getDisplayNameForOriginalColumnGroup(null, columnGroup, 'toolPanel');
    };
    ToolPanelFilterGroupComp.prototype.getColumnName = function (column) {
        return this.columnController.getDisplayNameForColumn(column, 'header', false);
    };
    ToolPanelFilterGroupComp.prototype.destroyFilters = function () {
        this.childFilterComps.forEach(function (filterComp) { return filterComp.destroy(); });
        this.childFilterComps.length = 0;
        core_1._.clearElement(this.getGui());
    };
    ToolPanelFilterGroupComp.prototype.destroy = function () {
        this.destroyFilters();
        _super.prototype.destroy.call(this);
    };
    ToolPanelFilterGroupComp.TEMPLATE = "<div>\n            <ag-group-component ref=\"filterGroupComp\"></ag-group-component>\n         </div>";
    __decorate([
        core_1.RefSelector('filterGroupComp')
    ], ToolPanelFilterGroupComp.prototype, "filterGroupComp", void 0);
    __decorate([
        core_1.Autowired('gridApi')
    ], ToolPanelFilterGroupComp.prototype, "gridApi", void 0);
    __decorate([
        core_1.Autowired('filterManager')
    ], ToolPanelFilterGroupComp.prototype, "filterManager", void 0);
    __decorate([
        core_1.Autowired('eventService')
    ], ToolPanelFilterGroupComp.prototype, "eventService", void 0);
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], ToolPanelFilterGroupComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.Autowired('columnController')
    ], ToolPanelFilterGroupComp.prototype, "columnController", void 0);
    __decorate([
        core_1.PreConstruct
    ], ToolPanelFilterGroupComp.prototype, "preConstruct", null);
    __decorate([
        core_1.PostConstruct
    ], ToolPanelFilterGroupComp.prototype, "init", null);
    return ToolPanelFilterGroupComp;
}(core_1.Component));
exports.ToolPanelFilterGroupComp = ToolPanelFilterGroupComp;
//# sourceMappingURL=toolPanelFilterGroupComp.js.map