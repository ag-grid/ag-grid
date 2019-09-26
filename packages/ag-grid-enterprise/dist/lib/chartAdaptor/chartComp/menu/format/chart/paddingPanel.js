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
var PaddingPanel = /** @class */ (function (_super) {
    __extends(PaddingPanel, _super);
    function PaddingPanel(chartController) {
        var _this = _super.call(this) || this;
        _this.chartProxy = chartController.getChartProxy();
        return _this;
    }
    PaddingPanel.prototype.init = function () {
        this.setTemplate(PaddingPanel.TEMPLATE);
        this.initGroup();
        this.initChartPaddingItems();
    };
    PaddingPanel.prototype.initGroup = function () {
        this.chartPaddingGroup
            .setTitle(this.chartTranslator.translate('padding'))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);
    };
    PaddingPanel.prototype.initChartPaddingItems = function () {
        var _this = this;
        var initInput = function (property, input, labelKey) {
            input.setLabel(_this.chartTranslator.translate(labelKey))
                .setValue(_this.chartProxy.getChartPadding(property))
                .setMaxValue(200)
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) { return _this.chartProxy.setChartPaddingProperty(property, newValue); });
        };
        initInput('top', this.paddingTopSlider, 'top');
        initInput('right', this.paddingRightSlider, 'right');
        initInput('bottom', this.paddingBottomSlider, 'bottom');
        initInput('left', this.paddingLeftSlider, 'left');
    };
    PaddingPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"chartPaddingGroup\">\n                <ag-slider ref=\"paddingTopSlider\"></ag-slider>\n                <ag-slider ref=\"paddingRightSlider\"></ag-slider>\n                <ag-slider ref=\"paddingBottomSlider\"></ag-slider>\n                <ag-slider ref=\"paddingLeftSlider\"></ag-slider>\n            </ag-group-component>\n        <div>";
    __decorate([
        ag_grid_community_1.RefSelector('chartPaddingGroup'),
        __metadata("design:type", ag_grid_community_1.AgGroupComponent)
    ], PaddingPanel.prototype, "chartPaddingGroup", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('paddingTopSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], PaddingPanel.prototype, "paddingTopSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('paddingRightSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], PaddingPanel.prototype, "paddingRightSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('paddingBottomSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], PaddingPanel.prototype, "paddingBottomSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('paddingLeftSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], PaddingPanel.prototype, "paddingLeftSlider", void 0);
    __decorate([
        ag_grid_community_1.Autowired('chartTranslator'),
        __metadata("design:type", chartTranslator_1.ChartTranslator)
    ], PaddingPanel.prototype, "chartTranslator", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PaddingPanel.prototype, "init", null);
    return PaddingPanel;
}(ag_grid_community_1.Component));
exports.PaddingPanel = PaddingPanel;
