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
var ag_grid_community_1 = require("ag-grid-community");
var chartTranslator_1 = require("../../../chartTranslator");
var ShadowPanel = /** @class */ (function (_super) {
    __extends(ShadowPanel, _super);
    function ShadowPanel(chartProxy) {
        var _this = _super.call(this) || this;
        _this.chartProxy = chartProxy;
        return _this;
    }
    ShadowPanel.prototype.init = function () {
        this.setTemplate(ShadowPanel.TEMPLATE);
        this.shadowBlurSlider.setTextFieldWidth(45);
        this.shadowXOffsetSlider.setTextFieldWidth(45);
        this.shadowYOffsetSlider.setTextFieldWidth(45);
        this.initSeriesShadow();
    };
    ShadowPanel.prototype.initSeriesShadow = function () {
        var _this = this;
        this.shadowGroup
            .setTitle(this.chartTranslator.translate('shadow'))
            .setEnabled(this.chartProxy.getShadowEnabled())
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(false)
            .onEnableChange(function (newValue) { return _this.chartProxy.setShadowProperty('enabled', newValue); });
        this.shadowColorPicker
            .setLabel(this.chartTranslator.translate('color'))
            .setLabelWidth('flex')
            .setInputWidth(45)
            .setValue('rgba(0,0,0,0.5)')
            .onValueChange(function (newValue) { return _this.chartProxy.setShadowProperty('color', newValue); });
        var initInput = function (input, property, maxValue) {
            input.setLabel(_this.chartTranslator.translate(property))
                .setValue(_this.chartProxy.getShadowProperty(property))
                .setMaxValue(maxValue)
                .onValueChange(function (newValue) { return _this.chartProxy.setShadowProperty(property, newValue); });
        };
        initInput(this.shadowBlurSlider, 'blur', 20);
        initInput(this.shadowXOffsetSlider, 'xOffset', 20);
        initInput(this.shadowYOffsetSlider, 'yOffset', 20);
    };
    ShadowPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"shadowGroup\">\n                <ag-color-picker ref=\"shadowColorPicker\"></ag-color-picker>\n                <ag-slider ref=\"shadowBlurSlider\"></ag-slider>\n                <ag-slider ref=\"shadowXOffsetSlider\"></ag-slider>\n                <ag-slider ref=\"shadowYOffsetSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        ag_grid_community_1.RefSelector('shadowGroup'),
        __metadata("design:type", ag_grid_community_1.AgGroupComponent)
    ], ShadowPanel.prototype, "shadowGroup", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('shadowColorPicker'),
        __metadata("design:type", ag_grid_community_1.AgColorPicker)
    ], ShadowPanel.prototype, "shadowColorPicker", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('shadowBlurSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], ShadowPanel.prototype, "shadowBlurSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('shadowXOffsetSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], ShadowPanel.prototype, "shadowXOffsetSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('shadowYOffsetSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], ShadowPanel.prototype, "shadowYOffsetSlider", void 0);
    __decorate([
        ag_grid_community_1.Autowired('chartTranslator'),
        __metadata("design:type", chartTranslator_1.ChartTranslator)
    ], ShadowPanel.prototype, "chartTranslator", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ShadowPanel.prototype, "init", null);
    return ShadowPanel;
}(ag_grid_community_1.Component));
exports.ShadowPanel = ShadowPanel;
