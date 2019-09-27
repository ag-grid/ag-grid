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
var CalloutPanel = /** @class */ (function (_super) {
    __extends(CalloutPanel, _super);
    function CalloutPanel(chartProxy) {
        var _this = _super.call(this) || this;
        _this.chartProxy = chartProxy;
        return _this;
    }
    CalloutPanel.prototype.init = function () {
        this.setTemplate(CalloutPanel.TEMPLATE);
        this.initCalloutOptions();
    };
    CalloutPanel.prototype.initCalloutOptions = function () {
        var _this = this;
        this.calloutGroup
            .setTitle(this.chartTranslator.translate('callout'))
            .setEnabled(true)
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);
        var initInput = function (property, input, labelKey, maxValue) {
            input.setLabel(_this.chartTranslator.translate(labelKey))
                .setValue(_this.chartProxy.getSeriesProperty(property))
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) { return _this.chartProxy.setSeriesProperty(property, newValue); });
        };
        initInput('calloutLength', this.calloutLengthSlider, 'length', 40);
        initInput('calloutStrokeWidth', this.calloutStrokeWidthSlider, 'strokeWidth', 10);
        initInput('labelOffset', this.labelOffsetSlider, 'offset', 30);
    };
    CalloutPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"calloutGroup\">\n                <ag-slider ref=\"calloutLengthSlider\"></ag-slider>\n                <ag-slider ref=\"calloutStrokeWidthSlider\"></ag-slider>\n                <ag-slider ref=\"labelOffsetSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        ag_grid_community_1.RefSelector('seriesGroup'),
        __metadata("design:type", ag_grid_community_1.AgGroupComponent)
    ], CalloutPanel.prototype, "seriesGroup", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('calloutGroup'),
        __metadata("design:type", ag_grid_community_1.AgGroupComponent)
    ], CalloutPanel.prototype, "calloutGroup", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('calloutLengthSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], CalloutPanel.prototype, "calloutLengthSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('calloutStrokeWidthSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], CalloutPanel.prototype, "calloutStrokeWidthSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('labelOffsetSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], CalloutPanel.prototype, "labelOffsetSlider", void 0);
    __decorate([
        ag_grid_community_1.Autowired('chartTranslator'),
        __metadata("design:type", chartTranslator_1.ChartTranslator)
    ], CalloutPanel.prototype, "chartTranslator", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], CalloutPanel.prototype, "init", null);
    return CalloutPanel;
}(ag_grid_community_1.Component));
exports.CalloutPanel = CalloutPanel;
