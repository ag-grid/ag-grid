// ag-grid-enterprise v16.0.1
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
var PivotModePanel = (function (_super) {
    __extends(PivotModePanel, _super);
    function PivotModePanel() {
        return _super.call(this) || this;
    }
    PivotModePanel.prototype.createTemplate = function () {
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        return "<div class=\"ag-pivot-mode\">\n                <ag-checkbox class=\"ag-pivot-mode-select\" label=\"" + localeTextFunc('pivotMode', 'Pivot Mode') + "\"></ag-checkbox>\n            </div>";
    };
    PivotModePanel.prototype.init = function () {
        this.setTemplate(this.createTemplate());
        this.instantiate(this.context);
        this.cbPivotMode.setSelected(this.columnController.isPivotMode());
        this.addDestroyableEventListener(this.cbPivotMode, main_1.AgCheckbox.EVENT_CHANGED, this.onBtPivotMode.bind(this));
        this.addDestroyableEventListener(this.eventService, main_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onPivotModeChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, main_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
    };
    PivotModePanel.prototype.onBtPivotMode = function () {
        var newValue = this.cbPivotMode.isSelected();
        if (newValue !== this.columnController.isPivotMode()) {
            this.columnController.setPivotMode(newValue, "toolPanelUi");
            this.gridOptionsWrapper.getApi().refreshHeader();
        }
    };
    PivotModePanel.prototype.onPivotModeChanged = function () {
        var pivotModeActive = this.columnController.isPivotMode();
        this.cbPivotMode.setSelected(pivotModeActive);
    };
    __decorate([
        main_1.Autowired('columnController'),
        __metadata("design:type", main_1.ColumnController)
    ], PivotModePanel.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('eventService'),
        __metadata("design:type", main_1.EventService)
    ], PivotModePanel.prototype, "eventService", void 0);
    __decorate([
        main_1.Autowired('context'),
        __metadata("design:type", main_1.Context)
    ], PivotModePanel.prototype, "context", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], PivotModePanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.QuerySelector('.ag-pivot-mode-select'),
        __metadata("design:type", main_1.AgCheckbox)
    ], PivotModePanel.prototype, "cbPivotMode", void 0);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PivotModePanel.prototype, "init", null);
    return PivotModePanel;
}(main_1.Component));
exports.PivotModePanel = PivotModePanel;
