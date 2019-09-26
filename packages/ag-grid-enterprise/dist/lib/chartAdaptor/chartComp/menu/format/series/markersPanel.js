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
var scatterChartProxy_1 = require("../../../chartProxies/cartesian/scatterChartProxy");
var MarkersPanel = /** @class */ (function (_super) {
    __extends(MarkersPanel, _super);
    function MarkersPanel(chartProxy) {
        var _this = _super.call(this) || this;
        _this.chartProxy = chartProxy;
        return _this;
    }
    MarkersPanel.prototype.init = function () {
        this.setTemplate(MarkersPanel.TEMPLATE);
        this.initMarkers();
    };
    MarkersPanel.prototype.initMarkers = function () {
        var _this = this;
        // scatter charts should always show markers
        var shouldHideEnabledCheckbox = this.chartProxy instanceof scatterChartProxy_1.ScatterChartProxy;
        this.seriesMarkersGroup
            .setTitle(this.chartTranslator.translate('markers'))
            .hideEnabledCheckbox(shouldHideEnabledCheckbox)
            .setEnabled(this.chartProxy.getMarkersEnabled())
            .hideOpenCloseIcons(true)
            .onEnableChange(function (newValue) { return _this.chartProxy.setSeriesProperty('marker', newValue); });
        var initInput = function (property, input, labelKey, maxValue) {
            input.setLabel(_this.chartTranslator.translate(labelKey))
                .setValue(_this.chartProxy.getSeriesProperty(property))
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) { return _this.chartProxy.setSeriesProperty(property, newValue); });
        };
        initInput('markerSize', this.seriesMarkerSizeSlider, 'size', 30);
        initInput('markerStrokeWidth', this.seriesMarkerStrokeWidthSlider, 'strokeWidth', 10);
    };
    MarkersPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"seriesMarkersGroup\">\n                <ag-slider ref=\"seriesMarkerSizeSlider\"></ag-slider>\n                <ag-slider ref=\"seriesMarkerStrokeWidthSlider\"></ag-slider>\n            </ag-group-component>  \n        </div>";
    __decorate([
        ag_grid_community_1.RefSelector('seriesMarkersGroup'),
        __metadata("design:type", ag_grid_community_1.AgGroupComponent)
    ], MarkersPanel.prototype, "seriesMarkersGroup", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('seriesMarkerSizeSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], MarkersPanel.prototype, "seriesMarkerSizeSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('seriesMarkerStrokeWidthSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], MarkersPanel.prototype, "seriesMarkerStrokeWidthSlider", void 0);
    __decorate([
        ag_grid_community_1.Autowired('chartTranslator'),
        __metadata("design:type", chartTranslator_1.ChartTranslator)
    ], MarkersPanel.prototype, "chartTranslator", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MarkersPanel.prototype, "init", null);
    return MarkersPanel;
}(ag_grid_community_1.Component));
exports.MarkersPanel = MarkersPanel;
