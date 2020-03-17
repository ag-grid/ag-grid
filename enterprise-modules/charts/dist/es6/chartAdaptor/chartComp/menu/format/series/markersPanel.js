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
import { Autowired, ChartType, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { ScatterChartProxy } from "../../../chartProxies/cartesian/scatterChartProxy";
var MarkersPanel = /** @class */ (function (_super) {
    __extends(MarkersPanel, _super);
    function MarkersPanel(chartController) {
        var _this = _super.call(this) || this;
        _this.chartController = chartController;
        return _this;
    }
    MarkersPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical'
        };
        this.setTemplate(MarkersPanel.TEMPLATE, { seriesMarkersGroup: groupParams });
        this.initMarkers();
    };
    MarkersPanel.prototype.initMarkers = function () {
        var _this = this;
        // scatter charts should always show markers
        var shouldHideEnabledCheckbox = this.chartController.getChartProxy() instanceof ScatterChartProxy;
        this.seriesMarkersGroup
            .setTitle(this.chartTranslator.translate("markers"))
            .hideEnabledCheckbox(shouldHideEnabledCheckbox)
            .setEnabled(this.chartController.getChartProxy().getSeriesOption("marker.enabled") || false)
            .hideOpenCloseIcons(true)
            .onEnableChange(function (newValue) { return _this.chartController.getChartProxy().setSeriesOption("marker.enabled", newValue); });
        var initInput = function (expression, input, labelKey, maxValue) {
            input.setLabel(_this.chartTranslator.translate(labelKey))
                .setValue(_this.chartController.getChartProxy().getSeriesOption(expression))
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) { return _this.chartController.getChartProxy().setSeriesOption(expression, newValue); });
        };
        if (this.chartController.getChartType() === ChartType.Bubble) {
            initInput("marker.minSize", this.seriesMarkerMinSizeSlider, "minSize", 60);
            initInput("marker.size", this.seriesMarkerSizeSlider, "maxSize", 60);
        }
        else {
            this.seriesMarkerMinSizeSlider.setDisplayed(false);
            initInput("marker.size", this.seriesMarkerSizeSlider, "size", 60);
        }
        initInput("marker.strokeWidth", this.seriesMarkerStrokeWidthSlider, "strokeWidth", 10);
    };
    MarkersPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"seriesMarkersGroup\">\n                <ag-slider ref=\"seriesMarkerMinSizeSlider\"></ag-slider>\n                <ag-slider ref=\"seriesMarkerSizeSlider\"></ag-slider>\n                <ag-slider ref=\"seriesMarkerStrokeWidthSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        RefSelector('seriesMarkersGroup')
    ], MarkersPanel.prototype, "seriesMarkersGroup", void 0);
    __decorate([
        RefSelector('seriesMarkerSizeSlider')
    ], MarkersPanel.prototype, "seriesMarkerSizeSlider", void 0);
    __decorate([
        RefSelector('seriesMarkerMinSizeSlider')
    ], MarkersPanel.prototype, "seriesMarkerMinSizeSlider", void 0);
    __decorate([
        RefSelector('seriesMarkerStrokeWidthSlider')
    ], MarkersPanel.prototype, "seriesMarkerStrokeWidthSlider", void 0);
    __decorate([
        Autowired('chartTranslator')
    ], MarkersPanel.prototype, "chartTranslator", void 0);
    __decorate([
        PostConstruct
    ], MarkersPanel.prototype, "init", null);
    return MarkersPanel;
}(Component));
export { MarkersPanel };
