var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
            var api = this.gridOptionsService.api;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGl2b3RNb2RlUGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29sdW1uVG9vbFBhbmVsL3Bpdm90TW9kZVBhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxVQUFVLEVBQ1YsU0FBUyxFQUVULFNBQVMsRUFDVCxNQUFNLEVBQ04sWUFBWSxFQUNaLFdBQVcsRUFDZCxNQUFNLHlCQUF5QixDQUFDO0FBRWpDO0lBQW9DLGtDQUFTO0lBQTdDOztJQXdDQSxDQUFDO0lBbENXLHVDQUFjLEdBQXRCO1FBQ0ksT0FBTyxVQUFVLENBQUMsbUtBRVAsQ0FBQztJQUNoQixDQUFDO0lBR00sNkJBQUksR0FBWDtRQUNJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFFeEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQzFELElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUM5RCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFFckUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25HLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDaEgsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLCtCQUErQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMzSCxDQUFDO0lBRU8sc0NBQWEsR0FBckI7UUFDSSxJQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMvQyxJQUFJLFFBQVEsS0FBSyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQzdDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN2RCxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDO1lBQ3hDLElBQUksR0FBRyxFQUFFO2dCQUNMLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQzthQUN2QjtTQUNKO0lBQ0wsQ0FBQztJQUVPLDJDQUFrQixHQUExQjtRQUNJLElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQXJDeUI7UUFBekIsU0FBUyxDQUFDLGFBQWEsQ0FBQzt1REFBa0M7SUFFL0I7UUFBM0IsV0FBVyxDQUFDLGFBQWEsQ0FBQzt1REFBaUM7SUFTNUQ7UUFEQyxZQUFZOzhDQVdaO0lBaUJMLHFCQUFDO0NBQUEsQUF4Q0QsQ0FBb0MsU0FBUyxHQXdDNUM7U0F4Q1ksY0FBYyJ9