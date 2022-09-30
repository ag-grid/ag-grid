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
var formatPanel_1 = require("../formatPanel");
var MarkersPanel = /** @class */ (function (_super) {
    __extends(MarkersPanel, _super);
    function MarkersPanel(chartOptionsService, getSelectedSeries) {
        var _this = _super.call(this) || this;
        _this.chartOptionsService = chartOptionsService;
        _this.getSelectedSeries = getSelectedSeries;
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
        var seriesMarkerShapeOptions = [
            {
                value: 'square',
                text: 'Square'
            },
            {
                value: 'circle',
                text: 'Circle'
            },
            {
                value: 'cross',
                text: 'Cross'
            },
            {
                value: 'diamond',
                text: 'Diamond'
            },
            {
                value: 'plus',
                text: 'Plus'
            },
            {
                value: 'triangle',
                text: 'Triangle'
            },
            {
                value: 'heart',
                text: 'Heart'
            }
        ];
        this.seriesMarkerShapeSelect
            .addOptions(seriesMarkerShapeOptions)
            .setLabel(this.chartTranslationService.translate('shape'))
            .setValue(this.getSeriesOption("marker.shape"))
            .onValueChange(function (value) { return _this.setSeriesOption("marker.shape", value); });
        // scatter charts should always show markers
        var chartType = this.chartOptionsService.getChartType();
        var shouldHideEnabledCheckbox = core_1._.includes(['scatter', 'bubble'], chartType);
        this.seriesMarkersGroup
            .setTitle(this.chartTranslationService.translate("markers"))
            .hideEnabledCheckbox(shouldHideEnabledCheckbox)
            .setEnabled(this.getSeriesOption("marker.enabled") || false)
            .hideOpenCloseIcons(true)
            .onEnableChange(function (newValue) { return _this.setSeriesOption("marker.enabled", newValue); });
        var initInput = function (expression, input, labelKey, defaultMaxValue) {
            var currentValue = _this.getSeriesOption(expression);
            input.setLabel(_this.chartTranslationService.translate(labelKey))
                .setMaxValue(formatPanel_1.getMaxValue(currentValue, defaultMaxValue))
                .setValue("" + currentValue)
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) { return _this.setSeriesOption(expression, newValue); });
        };
        if (chartType === 'bubble') {
            initInput("marker.maxSize", this.seriesMarkerMinSizeSlider, "maxSize", 60);
            initInput("marker.size", this.seriesMarkerSizeSlider, "minSize", 60);
        }
        else {
            this.seriesMarkerMinSizeSlider.setDisplayed(false);
            initInput("marker.size", this.seriesMarkerSizeSlider, "size", 60);
        }
        initInput("marker.strokeWidth", this.seriesMarkerStrokeWidthSlider, "strokeWidth", 10);
    };
    MarkersPanel.prototype.getSeriesOption = function (expression) {
        return this.chartOptionsService.getSeriesOption(expression, this.getSelectedSeries());
    };
    MarkersPanel.prototype.setSeriesOption = function (expression, newValue) {
        this.chartOptionsService.setSeriesOption(expression, newValue, this.getSelectedSeries());
    };
    MarkersPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"seriesMarkersGroup\">\n                <ag-select ref=\"seriesMarkerShapeSelect\"></ag-select>\n                <ag-slider ref=\"seriesMarkerMinSizeSlider\"></ag-slider>\n                <ag-slider ref=\"seriesMarkerSizeSlider\"></ag-slider>\n                <ag-slider ref=\"seriesMarkerStrokeWidthSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        core_1.RefSelector('seriesMarkersGroup')
    ], MarkersPanel.prototype, "seriesMarkersGroup", void 0);
    __decorate([
        core_1.RefSelector('seriesMarkerShapeSelect')
    ], MarkersPanel.prototype, "seriesMarkerShapeSelect", void 0);
    __decorate([
        core_1.RefSelector('seriesMarkerSizeSlider')
    ], MarkersPanel.prototype, "seriesMarkerSizeSlider", void 0);
    __decorate([
        core_1.RefSelector('seriesMarkerMinSizeSlider')
    ], MarkersPanel.prototype, "seriesMarkerMinSizeSlider", void 0);
    __decorate([
        core_1.RefSelector('seriesMarkerStrokeWidthSlider')
    ], MarkersPanel.prototype, "seriesMarkerStrokeWidthSlider", void 0);
    __decorate([
        core_1.Autowired('chartTranslationService')
    ], MarkersPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        core_1.PostConstruct
    ], MarkersPanel.prototype, "init", null);
    return MarkersPanel;
}(core_1.Component));
exports.MarkersPanel = MarkersPanel;
