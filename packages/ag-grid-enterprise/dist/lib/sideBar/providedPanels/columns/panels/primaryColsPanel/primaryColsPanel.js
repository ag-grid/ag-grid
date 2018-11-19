// ag-grid-enterprise v19.1.3
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
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
        this.instantiate(this.context);
        var hideFilter = this.params.suppressColumnFilter;
        var hideSelect = this.params.suppressColumnSelectAll;
        var hideExpand = this.params.suppressColumnExpandAll;
        if (hideExpand && hideFilter && hideSelect) {
            this.columnSelectHeaderComp.setVisible(false);
        }
    };
    PrimaryColsPanel.prototype.onFilterChanged = function (event) {
        this.columnContainerComp.setFilterText(event.filterText);
    };
    PrimaryColsPanel.prototype.onSelectAll = function () {
        this.columnContainerComp.doSetSelectedAll(true);
    };
    PrimaryColsPanel.prototype.onUnselectAll = function () {
        this.columnContainerComp.doSetSelectedAll(false);
    };
    PrimaryColsPanel.prototype.onExpandAll = function () {
        this.columnContainerComp.doSetExpandedAll(true);
    };
    PrimaryColsPanel.prototype.onCollapseAll = function () {
        this.columnContainerComp.doSetExpandedAll(false);
    };
    PrimaryColsPanel.prototype.onGroupExpanded = function (event) {
        this.columnSelectHeaderComp.setExpandState(event.state);
    };
    PrimaryColsPanel.TEMPLATE = "<div class=\"ag-column-select-panel\">\n            <ag-primary-cols-header\n                [params]=\"params\"\n                (expand-all)=\"onExpandAll\"\n                (collapse-all)=\"onCollapseAll\"\n                (select-all)=\"onSelectAll\"\n                (unselect-all)=\"onUnselectAll\"\n                (filter-changed)=\"onFilterChanged\"\n                ref=\"eColumnSelectHeader\">\n            </ag-primary-cols-header>\n            <ag-primary-cols-list\n                [allow-dragging]=\"allowDragging\"\n                [params]=\"params\"\n                (group-expanded)=\"onGroupExpanded\"\n                ref=\"eToolPanelColumnsContainerComp\">\n            </ag-primary-cols-list>\n        </div>";
    __decorate([
        main_1.Autowired('context'),
        __metadata("design:type", main_1.Context)
    ], PrimaryColsPanel.prototype, "context", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], PrimaryColsPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.RefSelector('eColumnSelectHeader'),
        __metadata("design:type", primaryColsHeaderPanel_1.PrimaryColsHeaderPanel)
    ], PrimaryColsPanel.prototype, "columnSelectHeaderComp", void 0);
    __decorate([
        main_1.RefSelector('eToolPanelColumnsContainerComp'),
        __metadata("design:type", primaryColsListPanel_1.PrimaryColsListPanel)
    ], PrimaryColsPanel.prototype, "columnContainerComp", void 0);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PrimaryColsPanel.prototype, "init", null);
    return PrimaryColsPanel;
}(main_1.Component));
exports.PrimaryColsPanel = PrimaryColsPanel;
