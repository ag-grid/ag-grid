import { ChartTranslationService } from "../../services/chartTranslationService";
import { AgSlider } from "@ag-grid-community/core";
import { Font, FontPanelParams } from "./fontPanel";
import { ChartOptionsService } from "../../services/chartOptionsService";
import { getMaxValue } from "./formatPanel";

export function initLineOpacitySlider(seriesLineOpacitySlider: AgSlider, chartTranslationService: ChartTranslationService, chartOptionsService: ChartOptionsService) {
    const currentValue = chartOptionsService.getSeriesOption<number>("strokeOpacity");
    seriesLineOpacitySlider
        .setLabel(chartTranslationService.translate("strokeOpacity"))
        .setStep(0.05)
        .setMaxValue(getMaxValue(currentValue, 1))
        .setTextFieldWidth(45)
        .setValue(`${currentValue}`)
        .onValueChange(newValue => chartOptionsService.setSeriesOption("strokeOpacity", newValue));
}

export function initFillOpacitySlider(seriesFillOpacitySlider: AgSlider, chartTranslationService: ChartTranslationService, chartOptionsService: ChartOptionsService) {
    const currentValue = chartOptionsService.getSeriesOption<number>("fillOpacity");
    seriesFillOpacitySlider
        .setLabel(chartTranslationService.translate("fillOpacity"))
        .setStep(0.05)
        .setMaxValue(getMaxValue(currentValue, 1))
        .setTextFieldWidth(45)
        .setValue(`${currentValue}`)
        .onValueChange(newValue => chartOptionsService.setSeriesOption("fillOpacity", newValue));
}

export function initFontPanelParams(chartTranslationService: ChartTranslationService, chartOptionsService: ChartOptionsService) {
    const initialFont = {
        family: chartOptionsService.getSeriesOption("label.fontFamily"),
        style: chartOptionsService.getSeriesOption("label.fontStyle"),
        weight: chartOptionsService.getSeriesOption("label.fontWeight"),
        size: chartOptionsService.getSeriesOption<number>("label.fontSize"),
        color: chartOptionsService.getSeriesOption("label.color")
    };

    const setFont = (font: Font) => {
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

    const params: FontPanelParams = {
        name: chartTranslationService.translate('labels'),
        enabled: chartOptionsService.getSeriesOption("label.enabled") || false,
        setEnabled: (enabled: boolean) => chartOptionsService.setSeriesOption("label.enabled", enabled),
        suppressEnabledCheckbox: false,
        initialFont: initialFont,
        setFont: setFont
    };

    return params;
}