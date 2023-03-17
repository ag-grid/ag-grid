export function initFontPanelParams(_a) {
    var labelName = _a.labelName, chartOptionsService = _a.chartOptionsService, getSelectedSeries = _a.getSelectedSeries, seriesOptionLabelProperty = _a.seriesOptionLabelProperty;
    var getFontOptionExpression = function (fontOption) {
        return seriesOptionLabelProperty + "." + fontOption;
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
        name: labelName,
        enabled: getFontOption('enabled') || false,
        setEnabled: function (enabled) { return setFontOption('enabled', enabled); },
        suppressEnabledCheckbox: false,
        initialFont: initialFont,
        setFont: setFont
    };
    return params;
}
