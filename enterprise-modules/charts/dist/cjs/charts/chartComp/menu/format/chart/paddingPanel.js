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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var PaddingPanel = /** @class */ (function (_super) {
    __extends(PaddingPanel, _super);
    function PaddingPanel(chartController) {
        var _this = _super.call(this) || this;
        _this.chartController = chartController;
        return _this;
    }
    PaddingPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true
        };
        this.setTemplate(PaddingPanel.TEMPLATE, { chartPaddingGroup: groupParams });
        this.initGroup();
        this.initChartPaddingItems();
    };
    PaddingPanel.prototype.initGroup = function () {
        this.chartPaddingGroup
            .setTitle(this.chartTranslator.translate("padding"))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);
    };
    PaddingPanel.prototype.initChartPaddingItems = function () {
        var _this = this;
        var initInput = function (property, input) {
            input.setLabel(_this.chartTranslator.translate(property))
                .setValue(_this.chartController.getChartProxy().getChartPaddingOption(property))
                .setMaxValue(200)
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) { return _this.chartController.getChartProxy().setChartPaddingOption(property, newValue); });
        };
        initInput('top', this.paddingTopSlider);
        initInput('right', this.paddingRightSlider);
        initInput('bottom', this.paddingBottomSlider);
        initInput('left', this.paddingLeftSlider);
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
        core_1.Autowired('chartTranslator')
    ], PaddingPanel.prototype, "chartTranslator", void 0);
    __decorate([
        core_1.PostConstruct
    ], PaddingPanel.prototype, "init", null);
    return PaddingPanel;
}(core_1.Component));
exports.PaddingPanel = PaddingPanel;
//# sourceMappingURL=paddingPanel.js.map