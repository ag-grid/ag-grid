import { getMaxValue } from "./formatPanel";
export function initLineOpacitySlider(seriesLineOpacitySlider, chartTranslator, chartOptionsService) {
    var currentValue = chartOptionsService.getSeriesOption("strokeOpacity");
    seriesLineOpacitySlider
        .setLabel(chartTranslator.translate("strokeOpacity"))
        .setStep(0.05)
        .setMaxValue(getMaxValue(currentValue, 1))
        .setTextFieldWidth(45)
        .setValue("" + currentValue)
        .onValueChange(function (newValue) { return chartOptionsService.setSeriesOption("strokeOpacity", newValue); });
}
export function initFillOpacitySlider(seriesFillOpacitySlider, chartTranslator, chartOptionsService) {
    var currentValue = chartOptionsService.getSeriesOption("fillOpacity");
    seriesFillOpacitySlider
        .setLabel(chartTranslator.translate("fillOpacity"))
        .setStep(0.05)
        .setMaxValue(getMaxValue(currentValue, 1))
        .setTextFieldWidth(45)
        .setValue("" + currentValue)
        .onValueChange(function (newValue) { return chartOptionsService.setSeriesOption("fillOpacity", newValue); });
}
export function initFontPanelParams(chartTranslator, chartOptionsService) {
    var initialFont = {
        family: chartOptionsService.getSeriesOption("label.fontFamily"),
        style: chartOptionsService.getSeriesOption("label.fontStyle"),
        weight: chartOptionsService.getSeriesOption("label.fontWeight"),
        size: chartOptionsService.getSeriesOption("label.fontSize"),
        color: chartOptionsService.getSeriesOption("label.color")
    };
    var setFont = function (font) {
        if (font.family) {
            chartOptionsService.setSeriesOption("label.fontFamily", font.family);
        }
        if (font.weight) {
            chartOptionsService.setSeriesOption("label.fontWeight", font.weight);
        }
        if (font.style) {
            chartOptionsService.setSeriesOption("label.fontStyle", font.style);
        }
        if (font.size) {
            chartOptionsService.setSeriesOption("label.fontSize", font.size);
        }
        if (font.color) {
            chartOptionsService.setSeriesOption("label.color", font.color);
        }
    };
    var params = {
        name: chartTranslator.translate('labels'),
        enabled: chartOptionsService.getSeriesOption("label.enabled") || false,
        setEnabled: function (enabled) { return chartOptionsService.setSeriesOption("label.enabled", enabled); },
        suppressEnabledCheckbox: false,
        initialFont: initialFont,
        setFont: setFont
    };
    return params;
}
