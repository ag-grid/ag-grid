"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function initFontPanelParams(chartTranslationService, chartOptionsService, getSelectedSeries) {
    var getFontOptionExpression = function (fontOption) {
        var labelProperty = getSelectedSeries() === 'pie' ? 'calloutLabel' : 'label';
        return labelProperty + "." + fontOption;
    };
    var getFontOption = function (fontOption) {
        var expression = getFontOptionExpression(fontOption);
        return chartOptionsService.getSeriesOption(expression, getSelectedSeries());
    };
    var setFontOption = function (fontOption, value) {
        var expression = getFontOptionExpression(fontOption);
        chartOptionsService.setSeriesOption(expression, value, getSelectedSeries());
    };
    var initialFont = {
        family: getFontOption('fontFamily'),
        style: getFontOption('fontStyle'),
        weight: getFontOption('fontWeight'),
        size: getFontOption('fontSize'),
        color: getFontOption('color'),
    };
    var setFont = function (font) {
        if (font.family) {
            setFontOption('fontFamily', font.family);
        }
        if (font.weight) {
            setFontOption('fontWeight', font.weight);
        }
        if (font.style) {
            setFontOption('fontStyle', font.style);
        }
        if (font.size) {
            setFontOption('fontSize', font.size);
        }
        if (font.color) {
            setFontOption('color', font.color);
        }
    };
    var params = {
        name: chartTranslationService.translate('labels'),
        enabled: getFontOption('enabled') || false,
        setEnabled: function (enabled) { return setFontOption('enabled', enabled); },
        suppressEnabledCheckbox: false,
        initialFont: initialFont,
        setFont: setFont
    };
    return params;
}
exports.initFontPanelParams = initFontPanelParams;
