// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var dropShadow_1 = require("../../../charts/scene/dropShadow");
var ChartProxy = /** @class */ (function () {
    function ChartProxy(chartProxyParams) {
        this.chartProxyParams = chartProxyParams;
    }
    ChartProxy.prototype.getChart = function () {
        return this.chart;
    };
    ChartProxy.prototype.getLabelColor = function () {
        return this.chartProxyParams.isDarkTheme() ? ChartProxy.darkLabelColour : ChartProxy.lightLabelColour;
    };
    ChartProxy.prototype.getAxisGridColor = function () {
        return this.chartProxyParams.isDarkTheme() ? ChartProxy.darkAxisColour : ChartProxy.lightAxisColour;
    };
    ChartProxy.prototype.getBackgroundColor = function () {
        return this.chartProxyParams.isDarkTheme() ? '#2d3436' : 'white';
    };
    ChartProxy.prototype.initChartOptions = function (type, options) {
        // allow users to override options before they are applied
        if (this.chartProxyParams.processChartOptions) {
            var params = { type: type, options: options };
            var overriddenOptions = this.chartProxyParams.processChartOptions(params);
            this.overridePalette(overriddenOptions);
            this.chartOptions = overriddenOptions;
        }
        else {
            this.chartOptions = options;
        }
        // these chart options are not overridable via the processChartOptions callback
        this.chartOptions.parent = this.chartProxyParams.parentElement;
        this.chartOptions.width = this.chartProxyParams.width;
        this.chartOptions.height = this.chartProxyParams.height;
    };
    ChartProxy.prototype.overridePalette = function (chartOptions) {
        var seriesDefaults = chartOptions.seriesDefaults;
        var palette = this.chartProxyParams.getSelectedPalette();
        var defaultFills = palette.fills;
        var defaultStrokes = palette.strokes;
        var fillsOverridden = seriesDefaults.fills !== defaultFills;
        var strokesOverridden = seriesDefaults.strokes !== defaultStrokes;
        if (fillsOverridden || strokesOverridden) {
            this.overriddenPalette = {
                fills: fillsOverridden && seriesDefaults.fills ? seriesDefaults.fills : defaultFills,
                strokes: strokesOverridden && seriesDefaults.strokes ? seriesDefaults.strokes : defaultStrokes
            };
        }
    };
    ChartProxy.prototype.setChartPaddingProperty = function (property, value) {
        var padding = this.chart.padding;
        padding[property] = value;
        this.chart.padding = padding;
        this.chartOptions.padding = padding;
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.getChartPadding = function (property) {
        return this.chartOptions.padding ? "" + this.chartOptions.padding[property] : '';
    };
    ChartProxy.prototype.setLegendProperty = function (property, value) {
        this.chart.legend[property] = value;
        if (!this.chartOptions.legend) {
            this.chartOptions.legend = {};
        }
        this.chartOptions.legend[property] = value;
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.getLegendProperty = function (property) {
        return this.chartOptions.legend ? "" + this.chartOptions.legend[property] : '';
    };
    ChartProxy.prototype.getLegendEnabled = function () {
        return this.chartOptions.legend ? !!this.chartOptions.legend.enabled : false;
    };
    ChartProxy.prototype.setLegendPadding = function (padding) {
        this.chart.legendPadding = padding;
        this.chartOptions.legendPadding = padding;
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.getLegendPadding = function () {
        return "" + this.chartOptions.legendPadding;
    };
    ChartProxy.prototype.setLegendPosition = function (position) {
        this.chart.legendPosition = position;
        this.chartOptions.legendPosition = position;
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.getLegendPosition = function () {
        return "" + this.chartOptions.legendPosition;
    };
    ChartProxy.prototype.setTitleProperty = function (property, value) {
        if (!this.chart.title) {
            this.chart.title = {};
        }
        this.chart.title[property] = value;
        if (!this.chartOptions.title) {
            this.chartOptions.title = {};
        }
        this.chartOptions.title[property] = value;
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.getTitleProperty = function (property) {
        return this.chart.title ? "" + this.chart.title[property] : '';
    };
    ChartProxy.prototype.getShadowEnabled = function () {
        var chartOptions = this.chartOptions;
        return chartOptions.seriesDefaults && chartOptions.seriesDefaults.shadow ? !!chartOptions.seriesDefaults.shadow.enabled : false;
    };
    ChartProxy.prototype.getShadowProperty = function (property) {
        var chartOptions = this.chartOptions;
        return chartOptions.seriesDefaults && chartOptions.seriesDefaults.shadow ? chartOptions.seriesDefaults.shadow[property] : '';
    };
    ChartProxy.prototype.setShadowProperty = function (property, value) {
        var series = this.getChart().series;
        series.forEach(function (s) {
            if (!s.shadow) {
                s.shadow = new dropShadow_1.DropShadow({ enabled: false, blur: 0, xOffset: 0, yOffset: 0, color: 'rgba(0,0,0,0.5)' });
            }
            s.shadow[property] = value;
        });
        var chartOptions = this.chartOptions;
        if (!chartOptions.seriesDefaults) {
            chartOptions.seriesDefaults = {};
        }
        if (!chartOptions.seriesDefaults.shadow) {
            chartOptions.seriesDefaults.shadow = {};
        }
        chartOptions.seriesDefaults.shadow[property] = value;
        this.raiseChartOptionsChangedEvent();
    };
    ChartProxy.prototype.raiseChartOptionsChangedEvent = function () {
        var event = {
            type: ag_grid_community_1.Events.EVENT_CHART_OPTIONS_CHANGED,
            chartType: this.chartProxyParams.chartType,
            chartOptions: this.chartOptions
        };
        this.chartProxyParams.eventService.dispatchEvent(event);
    };
    ChartProxy.prototype.destroy = function () {
        this.chart.destroy();
    };
    ChartProxy.darkLabelColour = 'rgb(221, 221, 221)';
    ChartProxy.lightLabelColour = 'rgb(87, 87, 87)';
    ChartProxy.darkAxisColour = 'rgb(100, 100, 100)';
    ChartProxy.lightAxisColour = 'rgb(219, 219, 219)';
    return ChartProxy;
}());
exports.ChartProxy = ChartProxy;
