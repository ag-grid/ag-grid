// ag-grid-enterprise v21.2.2
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var ToolPanelFilterComp = /** @class */ (function (_super) {
    __extends(ToolPanelFilterComp, _super);
    function ToolPanelFilterComp() {
        var _this = _super.call(this, ToolPanelFilterComp.TEMPLATE) || this;
        _this.expanded = false;
        return _this;
    }
    ToolPanelFilterComp.prototype.postConstruct = function () {
        this.eExpandChecked = ag_grid_community_1._.createIconNoSpan('columnSelectOpen', this.gridOptionsWrapper);
        this.eExpandUnchecked = ag_grid_community_1._.createIconNoSpan('columnSelectClosed', this.gridOptionsWrapper);
        this.eExpand.appendChild(this.eExpandChecked);
        this.eExpand.appendChild(this.eExpandUnchecked);
    };
    ToolPanelFilterComp.prototype.setColumn = function (column) {
        this.column = column;
        var displayName = this.columnController.getDisplayNameForColumn(this.column, 'header', false);
        this.eFilterName.innerText = displayName;
        this.addDestroyableEventListener(this.eFilterToolPanelHeader, 'click', this.doExpandOrCollapse.bind(this));
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));
        this.addInIcon('filter', this.eFilterIcon, this.column);
        ag_grid_community_1._.addOrRemoveCssClass(this.eFilterIcon, 'ag-hidden', !this.isFilterActive());
        ag_grid_community_1._.addCssClass(this.eExpandChecked, 'ag-hidden');
        this.addDestroyableEventListener(this.column, ag_grid_community_1.Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
    };
    ToolPanelFilterComp.prototype.addInIcon = function (iconName, eParent, column) {
        if (eParent == null) {
            return;
        }
        var eIcon = ag_grid_community_1._.createIconNoSpan(iconName, this.gridOptionsWrapper, column);
        eIcon.innerHTML = '&nbsp';
        eParent.appendChild(eIcon);
    };
    ToolPanelFilterComp.prototype.isFilterActive = function () {
        return this.filterManager.isFilterActive(this.column);
    };
    ToolPanelFilterComp.prototype.onFilterChanged = function () {
        ag_grid_community_1._.addOrRemoveCssClass(this.eFilterIcon, 'ag-hidden', !this.isFilterActive());
    };
    ToolPanelFilterComp.prototype.doExpandOrCollapse = function () {
        this.expanded ? this.doCollapse() : this.doExpand();
    };
    ToolPanelFilterComp.prototype.doExpand = function () {
        var _this = this;
        this.expanded = true;
        var container = ag_grid_community_1._.loadTemplate("<div class=\"ag-filter-air\" />");
        this.filterManager.getOrCreateFilterWrapper(this.column, 'TOOLBAR').filterPromise.then(function (filter) {
            container.appendChild(filter.getGui());
            _this.agFilterToolPanelBody.appendChild(container);
            if (filter.afterGuiAttached) {
                filter.afterGuiAttached({});
            }
        });
        ag_grid_community_1._.setDisplayed(this.eExpandChecked, true);
        ag_grid_community_1._.setDisplayed(this.eExpandUnchecked, false);
    };
    ToolPanelFilterComp.prototype.doCollapse = function () {
        this.expanded = false;
        this.agFilterToolPanelBody.removeChild(this.agFilterToolPanelBody.children[0]);
        ag_grid_community_1._.setDisplayed(this.eExpandChecked, false);
        ag_grid_community_1._.setDisplayed(this.eExpandUnchecked, true);
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
        this.doCollapse();
    };
    ToolPanelFilterComp.TEMPLATE = "<div class=\"ag-filter-toolpanel-instance\" >\n            <div class=\"ag-filter-toolpanel-header ag-header-cell-label\" ref=\"eFilterToolPanelHeader\">\n                <div ref=\"eExpand\"></div>\n                <span ref=\"eFilterName\" class=\"ag-header-cell-text\"></span>\n                <span ref=\"eFilterIcon\" class=\"ag-header-icon ag-filter-icon\" aria-hidden=\"true\"></span>\n            </div>\n            <div class=\"ag-filter-toolpanel-body ag-filter\" ref=\"agFilterToolPanelBody\"/>\n        </div>";
    __decorate([
        ag_grid_community_1.Autowired('gridApi'),
        __metadata("design:type", ag_grid_community_1.GridApi)
    ], ToolPanelFilterComp.prototype, "gridApi", void 0);
    __decorate([
        ag_grid_community_1.Autowired('filterManager'),
        __metadata("design:type", ag_grid_community_1.FilterManager)
    ], ToolPanelFilterComp.prototype, "filterManager", void 0);
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], ToolPanelFilterComp.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], ToolPanelFilterComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_community_1.ColumnController)
    ], ToolPanelFilterComp.prototype, "columnController", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eFilterToolPanelHeader'),
        __metadata("design:type", HTMLElement)
    ], ToolPanelFilterComp.prototype, "eFilterToolPanelHeader", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eFilterName'),
        __metadata("design:type", HTMLElement)
    ], ToolPanelFilterComp.prototype, "eFilterName", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('agFilterToolPanelBody'),
        __metadata("design:type", HTMLElement)
    ], ToolPanelFilterComp.prototype, "agFilterToolPanelBody", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eFilterIcon'),
        __metadata("design:type", HTMLElement)
    ], ToolPanelFilterComp.prototype, "eFilterIcon", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eExpand'),
        __metadata("design:type", HTMLElement)
    ], ToolPanelFilterComp.prototype, "eExpand", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ToolPanelFilterComp.prototype, "postConstruct", null);
    return ToolPanelFilterComp;
}(ag_grid_community_1.Component));
exports.ToolPanelFilterComp = ToolPanelFilterComp;
