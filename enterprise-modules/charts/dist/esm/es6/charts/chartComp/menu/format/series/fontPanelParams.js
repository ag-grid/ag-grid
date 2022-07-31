export function initFontPanelParams(chartTranslationService, chartOptionsService, getSelectedSeries) {
    const initialFont = {
        family: chartOptionsService.getSeriesOption("label.fontFamily", getSelectedSeries()),
        style: chartOptionsService.getSeriesOption("label.fontStyle", getSelectedSeries()),
        weight: chartOptionsService.getSeriesOption("label.fontWeight", getSelectedSeries()),
        size: chartOptionsService.getSeriesOption("label.fontSize", getSelectedSeries()),
        color: chartOptionsService.getSeriesOption("label.color", getSelectedSeries())
    };
    const setFont = (font) => {
        if (font.family) {
            chartOptionsService.setSeriesOption("label.fontFamily", font.family, getSelectedSeries());
        }
        if (font.weight) {
            chartOptionsService.setSeriesOption("label.fontWeight", font.weight, getSelectedSeries());
        }
        if (font.style) {
            chartOptionsService.setSeriesOption("label.fontStyle", font.style, getSelectedSeries());
        }
        if (font.size) {
            chartOptionsService.setSeriesOption("label.fontSize", font.size, getSelectedSeries());
        }
        if (font.color) {
            chartOptionsService.setSeriesOption("label.color", font.color, getSelectedSeries());
        }
    };
    const params = {
        name: chartTranslationService.translate('labels'),
        enabled: chartOptionsService.getSeriesOption("label.enabled", getSelectedSeries()) || false,
        setEnabled: (enabled) => chartOptionsService.setSeriesOption("label.enabled", enabled, getSelectedSeries()),
        suppressEnabledCheckbox: false,
        initialFont: initialFont,
        setFont: setFont
    };
    return params;
}
