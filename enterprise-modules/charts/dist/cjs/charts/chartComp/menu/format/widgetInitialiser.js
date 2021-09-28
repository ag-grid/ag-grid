"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function initLineOpacitySlider(seriesLineOpacitySlider, chartTranslator, chartProxy) {
    seriesLineOpacitySlider
        .setLabel(chartTranslator.translate("strokeOpacity"))
        .setStep(0.05)
        .setMaxValue(1)
        .setTextFieldWidth(45)
        .setValue(chartProxy.getSeriesOption("stroke.opacity") || "1")
        .onValueChange(function (newValue) { return chartProxy.setSeriesOption("stroke.opacity", newValue); });
}
exports.initLineOpacitySlider = initLineOpacitySlider;
function initFillOpacitySlider(seriesFillOpacitySlider, chartTranslator, chartProxy) {
    seriesFillOpacitySlider
        .setLabel(chartTranslator.translate("fillOpacity"))
        .setStep(0.05)
        .setMaxValue(1)
        .setTextFieldWidth(45)
        .setValue(chartProxy.getSeriesOption("fill.opacity") || "1")
        .onValueChange(function (newValue) { return chartProxy.setSeriesOption("fill.opacity", newValue); });
}
exports.initFillOpacitySlider = initFillOpacitySlider;
function initFontPanelParams(chartTranslator, chartProxy) {
    var initialFont = {
        family: chartProxy.getSeriesOption("label.fontFamily"),
        style: chartProxy.getSeriesOption("label.fontStyle"),
        weight: chartProxy.getSeriesOption("label.fontWeight"),
        size: chartProxy.getSeriesOption("label.fontSize"),
        color: chartProxy.getSeriesOption("label.color")
    };
    var setFont = function (font) {
        if (font.family) {
            chartProxy.setSeriesOption("label.fontFamily", font.family);
        }
        if (font.weight) {
            chartProxy.setSeriesOption("label.fontWeight", font.weight);
        }
        if (font.style) {
            chartProxy.setSeriesOption("label.fontStyle", font.style);
        }
        if (font.size) {
            chartProxy.setSeriesOption("label.fontSize", font.size);
        }
        if (font.color) {
            chartProxy.setSeriesOption("label.color", font.color);
        }
    };
    var params = {
        name: chartTranslator.translate('labels'),
        enabled: chartProxy.getSeriesOption("label.enabled") || false,
        setEnabled: function (enabled) { return chartProxy.setSeriesOption("label.enabled", enabled); },
        suppressEnabledCheckbox: false,
        initialFont: initialFont,
        setFont: setFont
    };
    return params;
}
exports.initFontPanelParams = initFontPanelParams;
//# sourceMappingURL=widgetInitialiser.js.map