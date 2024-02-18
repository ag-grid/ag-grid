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
import { Autowired, Component, PostConstruct, RefSelector, } from "@ag-grid-community/core";
var CapsPanel = /** @class */ (function (_super) {
    __extends(CapsPanel, _super);
    function CapsPanel(chartOptionsService, getSelectedSeries) {
        var _this = _super.call(this) || this;
        _this.chartOptionsService = chartOptionsService;
        _this.getSelectedSeries = getSelectedSeries;
        return _this;
    }
    CapsPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("cap"),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(CapsPanel.TEMPLATE, { capsGroup: groupParams });
        this.initControls();
    };
    CapsPanel.prototype.initControls = function () {
        var _this = this;
        var lengthRatio = this.chartOptionsService.getSeriesOption("cap.lengthRatio", this.getSelectedSeries());
        this.capLengthRatioSlider
            .setLabel(this.chartTranslationService.translate("capLengthRatio"))
            .setStep(0.05)
            .setMinValue(0)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue("".concat(lengthRatio))
            .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption("cap.lengthRatio", newValue, _this.getSelectedSeries()); });
    };
    CapsPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"capsGroup\">\n                <ag-slider ref=\"capLengthRatioSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        RefSelector('capsGroup')
    ], CapsPanel.prototype, "capsGroup", void 0);
    __decorate([
        RefSelector('capLengthRatioSlider')
    ], CapsPanel.prototype, "capLengthRatioSlider", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], CapsPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], CapsPanel.prototype, "init", null);
    return CapsPanel;
}(Component));
export { CapsPanel };
