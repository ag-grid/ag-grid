// ag-grid-enterprise v18.0.1
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
var main_1 = require("ag-grid/main");
var columnContainerComp_1 = require("./columnContainerComp");
var columnSelectHeaderComp_1 = require("./columnSelectHeaderComp");
var ColumnSelectComp = (function (_super) {
    __extends(ColumnSelectComp, _super);
    // we allow dragging in the toolPanel, but not when this component appears in the column menu
    function ColumnSelectComp(allowDragging) {
        var _this = _super.call(this, ColumnSelectComp.TEMPLATE) || this;
        _this.allowDragging = allowDragging;
        return _this;
    }
    ColumnSelectComp.prototype.init = function () {
        this.instantiate(this.context);
        var hideFilter = this.gridOptionsWrapper.isToolPanelSuppressColumnFilter();
        var hideSelect = this.gridOptionsWrapper.isToolPanelSuppressColumnSelectAll();
        var hideExpand = this.gridOptionsWrapper.isToolPanelSuppressColumnExpandAll();
        if (hideExpand && hideFilter && hideSelect) {
            this.columnSelectHeaderComp.setVisible(false);
        }
    };
    ColumnSelectComp.prototype.onFilterChanged = function (event) {
        this.columnContainerComp.setFilterText(event.filterText);
    };
    ColumnSelectComp.prototype.onSelectAll = function () {
        this.columnContainerComp.doSetSelectedAll(true);
    };
    ColumnSelectComp.prototype.onUnselectAll = function () {
        this.columnContainerComp.doSetSelectedAll(false);
    };
    ColumnSelectComp.prototype.onExpandAll = function () {
        this.columnContainerComp.doSetExpandedAll(true);
    };
    ColumnSelectComp.prototype.onCollapseAll = function () {
        this.columnContainerComp.doSetExpandedAll(false);
    };
    ColumnSelectComp.prototype.onGroupExpanded = function (event) {
        this.columnSelectHeaderComp.setExpandState(event.state);
    };
    ColumnSelectComp.TEMPLATE = "<div class=\"ag-column-select-panel\">\n            <ag-column-select-header \n                (expand-all)=\"onExpandAll\"\n                (collapse-all)=\"onCollapseAll\"\n                (select-all)=\"onSelectAll\"\n                (unselect-all)=\"onUnselectAll\"\n                (filter-changed)=\"onFilterChanged\"\n                ref=\"eColumnSelectHeader\">\n            </ag-column-select-header>\n            <ag-column-container \n                [allow-dragging]=\"allowDragging\"\n                (group-expanded)=\"onGroupExpanded\"\n                ref=\"eToolPanelColumnsContainerComp\">\n            </ag-column-container>\n        </div>";
    __decorate([
        main_1.Autowired('context'),
        __metadata("design:type", main_1.Context)
    ], ColumnSelectComp.prototype, "context", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], ColumnSelectComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.RefSelector('eColumnSelectHeader'),
        __metadata("design:type", columnSelectHeaderComp_1.ColumnSelectHeaderComp)
    ], ColumnSelectComp.prototype, "columnSelectHeaderComp", void 0);
    __decorate([
        main_1.RefSelector('eToolPanelColumnsContainerComp'),
        __metadata("design:type", columnContainerComp_1.ColumnContainerComp)
    ], ColumnSelectComp.prototype, "columnContainerComp", void 0);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ColumnSelectComp.prototype, "init", null);
    return ColumnSelectComp;
}(main_1.Component));
exports.ColumnSelectComp = ColumnSelectComp;
