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
var ag_grid_1 = require("ag-grid");
var HeaderColumnDropComp = (function (_super) {
    __extends(HeaderColumnDropComp, _super);
    function HeaderColumnDropComp() {
        return _super.call(this) || this;
    }
    HeaderColumnDropComp.prototype.postConstruct = function () {
        this.setGui(this.createNorthPanel());
        this.eventService.addEventListener(ag_grid_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onRowGroupChanged.bind(this));
        this.eventService.addEventListener(ag_grid_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onRowGroupChanged.bind(this));
        this.onRowGroupChanged();
    };
    HeaderColumnDropComp.prototype.createNorthPanel = function () {
        var _this = this;
        var topPanelGui = document.createElement('div');
        var dropPanelVisibleListener = this.onDropPanelVisible.bind(this);
        this.rowGroupComp = this.rowGroupCompFactory.create();
        this.pivotComp = this.pivotCompFactory.create();
        topPanelGui.appendChild(this.rowGroupComp.getGui());
        topPanelGui.appendChild(this.pivotComp.getGui());
        this.rowGroupComp.addEventListener(ag_grid_1.Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
        this.pivotComp.addEventListener(ag_grid_1.Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
        this.addDestroyFunc(function () {
            _this.rowGroupComp.removeEventListener(ag_grid_1.Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
            _this.pivotComp.removeEventListener(ag_grid_1.Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
        });
        this.onDropPanelVisible();
        return topPanelGui;
    };
    HeaderColumnDropComp.prototype.onDropPanelVisible = function () {
        var bothVisible = this.rowGroupComp.isVisible() && this.pivotComp.isVisible();
        this.rowGroupComp.addOrRemoveCssClass('ag-width-half', bothVisible);
        this.pivotComp.addOrRemoveCssClass('ag-width-half', bothVisible);
    };
    HeaderColumnDropComp.prototype.onRowGroupChanged = function () {
        if (!this.rowGroupComp) {
            return;
        }
        var rowGroupPanelShow = this.gridOptionsWrapper.getRowGroupPanelShow();
        if (rowGroupPanelShow === ag_grid_1.Constants.ALWAYS) {
            this.rowGroupComp.setVisible(true);
        }
        else if (rowGroupPanelShow === ag_grid_1.Constants.ONLY_WHEN_GROUPING) {
            var grouping = !this.columnController.isRowGroupEmpty();
            this.rowGroupComp.setVisible(grouping);
        }
        else {
            this.rowGroupComp.setVisible(false);
        }
    };
    __decorate([
        ag_grid_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_1.GridOptionsWrapper)
    ], HeaderColumnDropComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_1.ColumnController)
    ], HeaderColumnDropComp.prototype, "columnController", void 0);
    __decorate([
        ag_grid_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_1.EventService)
    ], HeaderColumnDropComp.prototype, "eventService", void 0);
    __decorate([
        ag_grid_1.Optional('rowGroupCompFactory'),
        __metadata("design:type", Object)
    ], HeaderColumnDropComp.prototype, "rowGroupCompFactory", void 0);
    __decorate([
        ag_grid_1.Optional('pivotCompFactory'),
        __metadata("design:type", Object)
    ], HeaderColumnDropComp.prototype, "pivotCompFactory", void 0);
    __decorate([
        ag_grid_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], HeaderColumnDropComp.prototype, "postConstruct", null);
    return HeaderColumnDropComp;
}(ag_grid_1.Component));
exports.HeaderColumnDropComp = HeaderColumnDropComp;
