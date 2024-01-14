"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initFontPanelParams = void 0;
function initFontPanelParams({ labelName, chartOptionsService, getSelectedSeries, seriesOptionLabelProperty }) {
    const getFontOptionExpression = (fontOption) => {
        return `${seriesOptionLabelProperty}.${fontOption}`;
    };
    const getFontOption = (fontOption) => {
        const expression = getFontOptionExpression(fontOption);
        return chartOptionsService.getSeriesOption(expression, getSelectedSeries());
    };
    const setFontOption = (fontOption, value) => {
        const expression = getFontOptionExpression(fontOption);
        chartOptionsService.setSeriesOption(expression, value, getSelectedSeries());
    };
    const initialFont = {
        family: getFontOption('fontFamily'),
        style: getFontOption('fontStyle'),
        weight: getFontOption('fontWeight'),
        size: getFontOption('fontSize'),
        color: getFontOption('color'),
    };
    const setFont = (font) => {
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
    const params = {
        name: labelName,
        enabled: getFontOption('enabled') || false,
        setEnabled: (enabled) => setFontOption('enabled', enabled),
        suppressEnabledCheckbox: false,
        initialFont: initialFont,
        setFont: setFont
    };
    return params;
}
exports.initFontPanelParams = initFontPanelParams;
