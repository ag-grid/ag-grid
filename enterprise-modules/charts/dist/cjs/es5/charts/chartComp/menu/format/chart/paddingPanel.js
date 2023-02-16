"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaddingPanel = void 0;
var core_1 = require("@ag-grid-community/core");
var formatPanel_1 = require("../formatPanel");
var PaddingPanel = /** @class */ (function (_super) {
    __extends(PaddingPanel, _super);
    function PaddingPanel(chartOptionsService, chartController) {
        var _this = _super.call(this) || this;
        _this.chartOptionsService = chartOptionsService;
        _this.chartController = chartController;
        return _this;
    }
    PaddingPanel.prototype.init = function () {
        var _this = this;
        var groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true
        };
        this.setTemplate(PaddingPanel.TEMPLATE, { chartPaddingGroup: groupParams });
        this.addManagedListener(this.eventService, core_1.Events.EVENT_CHART_OPTIONS_CHANGED, function (e) {
            _this.updateTopPadding(e.chartOptions);
        });
        this.initGroup();
        this.initChartPaddingItems();
    };
    PaddingPanel.prototype.initGroup = function () {
        this.chartPaddingGroup
            .setTitle(this.chartTranslationService.translate("padding"))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);
    };
    PaddingPanel.prototype.initChartPaddingItems = function () {
        var _this = this;
        var initInput = function (property, input) {
            var currentValue = _this.chartOptionsService.getChartOption('padding.' + property);
            input.setLabel(_this.chartTranslationService.translate(property))
                .setMaxValue(formatPanel_1.getMaxValue(currentValue, 200))
                .setValue("" + currentValue)
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) { return _this.chartOptionsService.setChartOption('padding.' + property, newValue); });
        };
        initInput('top', this.paddingTopSlider);
        initInput('right', this.paddingRightSlider);
        initInput('bottom', this.paddingBottomSlider);
        initInput('left', this.paddingLeftSlider);
    };
    PaddingPanel.prototype.updateTopPadding = function (chartOptions) {
        var _a, _b;
        // keep 'top' padding in sync with chart as toggling chart title on / off change the 'top' padding
        var seriesType = this.chartController.getChartSeriesTypes()[0];
        var topPadding = (_b = (_a = chartOptions[seriesType]) === null || _a === void 0 ? void 0 : _a.padding) === null || _b === void 0 ? void 0 : _b.top;
        if (topPadding != null) {
            this.paddingTopSlider.setValue(topPadding);
        }
    };
    PaddingPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"chartPaddingGroup\">\n                <ag-slider ref=\"paddingTopSlider\"></ag-slider>\n                <ag-slider ref=\"paddingRightSlider\"></ag-slider>\n                <ag-slider ref=\"paddingBottomSlider\"></ag-slider>\n                <ag-slider ref=\"paddingLeftSlider\"></ag-slider>\n            </ag-group-component>\n        <div>";
    __decorate([
        core_1.RefSelector('chartPaddingGroup')
    ], PaddingPanel.prototype, "chartPaddingGroup", void 0);
    __decorate([
        core_1.RefSelector('paddingTopSlider')
    ], PaddingPanel.prototype, "paddingTopSlider", void 0);
    __decorate([
        core_1.RefSelector('paddingRightSlider')
    ], PaddingPanel.prototype, "paddingRightSlider", void 0);
    __decorate([
        core_1.RefSelector('paddingBottomSlider')
    ], PaddingPanel.prototype, "paddingBottomSlider", void 0);
    __decorate([
        core_1.RefSelector('paddingLeftSlider')
    ], PaddingPanel.prototype, "paddingLeftSlider", void 0);
    __decorate([
        core_1.Autowired('chartTranslationService')
    ], PaddingPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        core_1.PostConstruct
    ], PaddingPanel.prototype, "init", null);
    return PaddingPanel;
}(core_1.Component));
exports.PaddingPanel = PaddingPanel;
