var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
import { AgCheckbox, Autowired, Component, Events, PreConstruct, RefSelector } from "@ag-grid-community/core";
var PivotModePanel = /** @class */ (function (_super) {
    __extends(PivotModePanel, _super);
    function PivotModePanel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PivotModePanel.prototype.createTemplate = function () {
        return /* html */ "<div class=\"ag-pivot-mode-panel\">\n                <ag-toggle-button ref=\"cbPivotMode\" class=\"ag-pivot-mode-select\"></ag-toggle-button>\n            </div>";
    };
    PivotModePanel.prototype.init = function () {
        this.setTemplate(this.createTemplate());
        this.cbPivotMode.setValue(this.columnModel.isPivotMode());
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        this.cbPivotMode.setLabel(localeTextFunc('pivotMode', 'Pivot Mode'));
        this.addManagedListener(this.cbPivotMode, AgCheckbox.EVENT_CHANGED, this.onBtPivotMode.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onPivotModeChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
    };
    PivotModePanel.prototype.onBtPivotMode = function () {
        var newValue = !!this.cbPivotMode.getValue();
        if (newValue !== this.columnModel.isPivotMode()) {
            this.columnModel.setPivotMode(newValue, "toolPanelUi");
            var api = this.gridOptionsService.get('api');
            if (api) {
                api.refreshHeader();
            }
        }
    };
    PivotModePanel.prototype.onPivotModeChanged = function () {
        var pivotModeActive = this.columnModel.isPivotMode();
        this.cbPivotMode.setValue(pivotModeActive);
    };
    __decorate([
        Autowired('columnModel')
    ], PivotModePanel.prototype, "columnModel", void 0);
    __decorate([
        RefSelector('cbPivotMode')
    ], PivotModePanel.prototype, "cbPivotMode", void 0);
    __decorate([
        PreConstruct
    ], PivotModePanel.prototype, "init", null);
    return PivotModePanel;
}(Component));
export { PivotModePanel };
