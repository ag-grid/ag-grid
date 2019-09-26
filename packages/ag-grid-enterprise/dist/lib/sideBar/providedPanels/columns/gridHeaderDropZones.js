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
var rowGroupDropZonePanel_1 = require("./panels/rowGroupDropZonePanel");
var pivotDropZonePanel_1 = require("./panels/pivotDropZonePanel");
var GridHeaderDropZones = /** @class */ (function (_super) {
    __extends(GridHeaderDropZones, _super);
    function GridHeaderDropZones() {
        return _super.call(this) || this;
    }
    GridHeaderDropZones.prototype.postConstruct = function () {
        this.setGui(this.createNorthPanel());
        this.eventService.addEventListener(main_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onRowGroupChanged.bind(this));
        this.eventService.addEventListener(main_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onRowGroupChanged.bind(this));
        this.onRowGroupChanged();
    };
    GridHeaderDropZones.prototype.createNorthPanel = function () {
        var _this = this;
        var topPanelGui = document.createElement('div');
        var dropPanelVisibleListener = this.onDropPanelVisible.bind(this);
        this.rowGroupComp = new rowGroupDropZonePanel_1.RowGroupDropZonePanel(true);
        this.getContext().wireBean(this.rowGroupComp);
        this.addDestroyFunc(function () { return _this.rowGroupComp.destroy(); });
        this.pivotComp = new pivotDropZonePanel_1.PivotDropZonePanel(true);
        this.getContext().wireBean(this.pivotComp);
        this.addDestroyFunc(function () { return _this.pivotComp.destroy(); });
        topPanelGui.appendChild(this.rowGroupComp.getGui());
        topPanelGui.appendChild(this.pivotComp.getGui());
        this.rowGroupComp.addEventListener(main_1.Component.EVENT_DISPLAYED_CHANGED, dropPanelVisibleListener);
        this.pivotComp.addEventListener(main_1.Component.EVENT_DISPLAYED_CHANGED, dropPanelVisibleListener);
        this.addDestroyFunc(function () {
            _this.rowGroupComp.removeEventListener(main_1.Component.EVENT_DISPLAYED_CHANGED, dropPanelVisibleListener);
            _this.pivotComp.removeEventListener(main_1.Component.EVENT_DISPLAYED_CHANGED, dropPanelVisibleListener);
        });
        this.onDropPanelVisible();
        return topPanelGui;
    };
    GridHeaderDropZones.prototype.onDropPanelVisible = function () {
        var bothDisplayed = this.rowGroupComp.isDisplayed() && this.pivotComp.isDisplayed();
        this.rowGroupComp.addOrRemoveCssClass('ag-width-half', bothDisplayed);
        this.pivotComp.addOrRemoveCssClass('ag-width-half', bothDisplayed);
    };
    GridHeaderDropZones.prototype.onRowGroupChanged = function () {
        if (!this.rowGroupComp) {
            return;
        }
        var rowGroupPanelShow = this.gridOptionsWrapper.getRowGroupPanelShow();
        if (rowGroupPanelShow === main_1.Constants.ALWAYS) {
            this.rowGroupComp.setDisplayed(true);
        }
        else if (rowGroupPanelShow === main_1.Constants.ONLY_WHEN_GROUPING) {
            var grouping = !this.columnController.isRowGroupEmpty();
            this.rowGroupComp.setDisplayed(grouping);
        }
        else {
            this.rowGroupComp.setDisplayed(false);
        }
    };
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], GridHeaderDropZones.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('columnController'),
        __metadata("design:type", main_1.ColumnController)
    ], GridHeaderDropZones.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('eventService'),
        __metadata("design:type", main_1.EventService)
    ], GridHeaderDropZones.prototype, "eventService", void 0);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], GridHeaderDropZones.prototype, "postConstruct", null);
    return GridHeaderDropZones;
}(main_1.Component));
exports.GridHeaderDropZones = GridHeaderDropZones;
