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
var main_1 = require("ag-grid-community/main");
var primaryColsListPanel_1 = require("./primaryColsListPanel");
var primaryColsHeaderPanel_1 = require("./primaryColsHeaderPanel");
var PrimaryColsPanel = /** @class */ (function (_super) {
    __extends(PrimaryColsPanel, _super);
    // we allow dragging in the toolPanel, but not when this component appears in the column menu
    function PrimaryColsPanel(allowDragging, params) {
        var _this = _super.call(this, PrimaryColsPanel.TEMPLATE) || this;
        _this.allowDragging = allowDragging;
        _this.params = params;
        return _this;
    }
    PrimaryColsPanel.prototype.init = function () {
        this.primaryColsHeaderPanel.init(this.params);
        this.primaryColsListPanel.init(this.params, this.allowDragging);
        var hideFilter = this.params.suppressColumnFilter;
        var hideSelect = this.params.suppressColumnSelectAll;
        var hideExpand = this.params.suppressColumnExpandAll;
        if (hideExpand && hideFilter && hideSelect) {
            this.primaryColsHeaderPanel.setDisplayed(false);
        }
        this.addDestroyableEventListener(this.primaryColsHeaderPanel, 'expandAll', this.onExpandAll.bind(this));
        this.addDestroyableEventListener(this.primaryColsHeaderPanel, 'collapseAll', this.onCollapseAll.bind(this));
        this.addDestroyableEventListener(this.primaryColsHeaderPanel, 'selectAll', this.onSelectAll.bind(this));
        this.addDestroyableEventListener(this.primaryColsHeaderPanel, 'unselectAll', this.onUnselectAll.bind(this));
        this.addDestroyableEventListener(this.primaryColsHeaderPanel, 'filterChanged', this.onFilterChanged.bind(this));
        this.addDestroyableEventListener(this.primaryColsListPanel, 'groupExpanded', this.onGroupExpanded.bind(this));
    };
    PrimaryColsPanel.prototype.onFilterChanged = function (event) {
        this.primaryColsListPanel.setFilterText(event.filterText);
    };
    PrimaryColsPanel.prototype.onSelectAll = function () {
        this.primaryColsListPanel.doSetSelectedAll(true);
    };
    PrimaryColsPanel.prototype.onUnselectAll = function () {
        this.primaryColsListPanel.doSetSelectedAll(false);
    };
    PrimaryColsPanel.prototype.onExpandAll = function () {
        this.primaryColsListPanel.doSetExpandedAll(true);
    };
    PrimaryColsPanel.prototype.onCollapseAll = function () {
        this.primaryColsListPanel.doSetExpandedAll(false);
    };
    PrimaryColsPanel.prototype.onGroupExpanded = function (event) {
        this.primaryColsHeaderPanel.setExpandState(event.state);
    };
    PrimaryColsPanel.TEMPLATE = "<div class=\"ag-column-select-panel\">\n            <ag-primary-cols-header ref=\"primaryColsHeaderPanel\"></ag-primary-cols-header>\n            <ag-primary-cols-list ref=\"primaryColsListPanel\"></ag-primary-cols-list>\n        </div>";
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], PrimaryColsPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.RefSelector('primaryColsHeaderPanel'),
        __metadata("design:type", primaryColsHeaderPanel_1.PrimaryColsHeaderPanel)
    ], PrimaryColsPanel.prototype, "primaryColsHeaderPanel", void 0);
    __decorate([
        main_1.RefSelector('primaryColsListPanel'),
        __metadata("design:type", primaryColsListPanel_1.PrimaryColsListPanel)
    ], PrimaryColsPanel.prototype, "primaryColsListPanel", void 0);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PrimaryColsPanel.prototype, "init", null);
    return PrimaryColsPanel;
}(main_1.Component));
exports.PrimaryColsPanel = PrimaryColsPanel;
