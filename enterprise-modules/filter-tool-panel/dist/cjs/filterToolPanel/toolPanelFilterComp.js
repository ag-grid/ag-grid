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
var ToolPanelFilterComp = /** @class */ (function (_super) {
    __extends(ToolPanelFilterComp, _super);
    function ToolPanelFilterComp(hideHeader) {
        if (hideHeader === void 0) { hideHeader = false; }
        var _this = _super.call(this, ToolPanelFilterComp.TEMPLATE) || this;
        _this.expanded = false;
        _this.hideHeader = hideHeader;
        return _this;
    }
    ToolPanelFilterComp.prototype.postConstruct = function () {
        this.eExpandChecked = core_1._.createIconNoSpan('columnSelectOpen', this.gridOptionsWrapper);
        this.eExpandUnchecked = core_1._.createIconNoSpan('columnSelectClosed', this.gridOptionsWrapper);
        this.eExpand.appendChild(this.eExpandChecked);
        this.eExpand.appendChild(this.eExpandUnchecked);
    };
    ToolPanelFilterComp.prototype.setColumn = function (column) {
        this.column = column;
        this.eFilterName.innerText = this.columnController.getDisplayNameForColumn(this.column, 'header', false);
        this.addDestroyableEventListener(this.eFilterToolPanelHeader, 'click', this.toggleExpanded.bind(this));
        this.addDestroyableEventListener(this.eventService, core_1.Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));
        this.addInIcon('filter', this.eFilterIcon, this.column);
        core_1._.addOrRemoveCssClass(this.eFilterIcon, 'ag-hidden', !this.isFilterActive());
        core_1._.addCssClass(this.eExpandChecked, 'ag-hidden');
        if (this.hideHeader) {
            core_1._.addOrRemoveCssClass(this.eFilterToolPanelHeader, 'ag-hidden', true);
        }
        this.addDestroyableEventListener(this.column, core_1.Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
    };
    ToolPanelFilterComp.prototype.getColumn = function () {
        return this.column;
    };
    ToolPanelFilterComp.prototype.getColumnFilterName = function () {
        return this.columnController.getDisplayNameForColumn(this.column, 'header', false);
    };
    ToolPanelFilterComp.prototype.addInIcon = function (iconName, eParent, column) {
        if (eParent == null) {
            return;
        }
        var eIcon = core_1._.createIconNoSpan(iconName, this.gridOptionsWrapper, column);
        eParent.appendChild(eIcon);
    };
    ToolPanelFilterComp.prototype.isFilterActive = function () {
        return this.filterManager.isFilterActive(this.column);
    };
    ToolPanelFilterComp.prototype.onFilterChanged = function () {
        core_1._.addOrRemoveCssClass(this.eFilterIcon, 'ag-hidden', !this.isFilterActive());
        this.dispatchEvent({ type: core_1.Column.EVENT_FILTER_CHANGED });
    };
    ToolPanelFilterComp.prototype.toggleExpanded = function () {
        this.expanded ? this.collapse() : this.expand();
    };
    ToolPanelFilterComp.prototype.expand = function () {
        var _this = this;
        if (this.expanded)
            return;
        this.expanded = true;
        var container = core_1._.loadTemplate("<div class=\"ag-filter-air\" />");
        var filterPromise = this.filterManager.getOrCreateFilterWrapper(this.column, 'TOOLBAR').filterPromise;
        if (filterPromise) {
            filterPromise.then(function (filter) {
                _this.underlyingFilter = filter;
                container.appendChild(filter.getGui());
                _this.agFilterToolPanelBody.appendChild(container);
                if (filter.afterGuiAttached) {
                    filter.afterGuiAttached({});
                }
            });
        }
        core_1._.setDisplayed(this.eExpandChecked, true);
        core_1._.setDisplayed(this.eExpandUnchecked, false);
    };
    ToolPanelFilterComp.prototype.collapse = function () {
        if (!this.expanded)
            return;
        this.expanded = false;
        this.agFilterToolPanelBody.removeChild(this.agFilterToolPanelBody.children[0]);
        core_1._.setDisplayed(this.eExpandChecked, false);
        core_1._.setDisplayed(this.eExpandUnchecked, true);
    };
    ToolPanelFilterComp.prototype.refreshFilter = function () {
        var filter = this.underlyingFilter;
        if (!filter)
            return;
        // set filters should be updated when the filter has been changed elsewhere, i.e. via api. Note that we can't
        // use 'afterGuiAttached' to refresh the virtual list as it also focuses on the mini filter which changes the
        // scroll position in the filter list panel
        var isSetFilter = filter.refreshVirtualList;
        if (isSetFilter) {
            filter.refreshVirtualList();
        }
    };
    ToolPanelFilterComp.prototype.onFilterOpened = function (event) {
        if (event.source !== 'COLUMN_MENU') {
            return;
        }
        if (event.column !== this.column) {
            return;
        }
        if (!this.expanded) {
            return;
        }
        this.collapse();
    };
    ToolPanelFilterComp.TEMPLATE = "<div class=\"ag-filter-toolpanel-instance\" >\n            <div class=\"ag-filter-toolpanel-header ag-header-cell-label\" ref=\"eFilterToolPanelHeader\">\n                <div ref=\"eExpand\"></div>\n                <span ref=\"eFilterName\" class=\"ag-header-cell-text\"></span>\n                <span ref=\"eFilterIcon\" class=\"ag-header-icon ag-filter-icon\" aria-hidden=\"true\"></span>\n            </div>\n            <div class=\"ag-filter-toolpanel-body ag-filter\" ref=\"agFilterToolPanelBody\"/></div>";
    __decorate([
        core_1.RefSelector('eFilterToolPanelHeader')
    ], ToolPanelFilterComp.prototype, "eFilterToolPanelHeader", void 0);
    __decorate([
        core_1.RefSelector('eFilterName')
    ], ToolPanelFilterComp.prototype, "eFilterName", void 0);
    __decorate([
        core_1.RefSelector('agFilterToolPanelBody')
    ], ToolPanelFilterComp.prototype, "agFilterToolPanelBody", void 0);
    __decorate([
        core_1.RefSelector('eFilterIcon')
    ], ToolPanelFilterComp.prototype, "eFilterIcon", void 0);
    __decorate([
        core_1.RefSelector('eExpand')
    ], ToolPanelFilterComp.prototype, "eExpand", void 0);
    __decorate([
        core_1.Autowired('gridApi')
    ], ToolPanelFilterComp.prototype, "gridApi", void 0);
    __decorate([
        core_1.Autowired('filterManager')
    ], ToolPanelFilterComp.prototype, "filterManager", void 0);
    __decorate([
        core_1.Autowired('eventService')
    ], ToolPanelFilterComp.prototype, "eventService", void 0);
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], ToolPanelFilterComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.Autowired('columnController')
    ], ToolPanelFilterComp.prototype, "columnController", void 0);
    __decorate([
        core_1.PostConstruct
    ], ToolPanelFilterComp.prototype, "postConstruct", null);
    return ToolPanelFilterComp;
}(core_1.Component));
exports.ToolPanelFilterComp = ToolPanelFilterComp;
//# sourceMappingURL=toolPanelFilterComp.js.map