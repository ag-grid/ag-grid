import { ChartTranslator } from "../../chartTranslator";
import { ChartProxy } from "../../chartProxies/chartProxy";
import { AgSlider, FontStyle, FontWeight } from "@ag-grid-community/core";
import { Font, FontPanelParams } from "./fontPanel";

export function initLineOpacitySlider(seriesLineOpacitySlider: AgSlider, chartTranslator: ChartTranslator, chartProxy: ChartProxy<any, any>) {
    seriesLineOpacitySlider
        .setLabel(chartTranslator.translate("strokeOpacity"))
        .setStep(0.05)
        .setMaxValue(1)
        .setTextFieldWidth(45)
        .setValue(chartProxy.getSeriesOption("stroke.opacity") || "1")
        .onValueChange(newValue => chartProxy.setSeriesOption("stroke.opacity", newValue));
}

export function initFillOpacitySlider(seriesFillOpacitySlider: AgSlider, chartTranslator: ChartTranslator, chartProxy: ChartProxy<any, any>) {
    seriesFillOpacitySlider
        .setLabel(chartTranslator.translate("fillOpacity"))
        .setStep(0.05)
        .setMaxValue(1)
        .setTextFieldWidth(45)
        .setValue(chartProxy.getSeriesOption("fill.opacity") || "1")
        .onValueChange(newValue => chartProxy.setSeriesOption("fill.opacity", newValue));
}

export function initFontPanelParams(chartTranslator: ChartTranslator, chartProxy: ChartProxy<any, any>) {
    const initialFont = {
        family: chartProxy.getSeriesOption("label.fontFamily"),
        style: chartProxy.getSeriesOption<FontStyle>("label.fontStyle"),
        weight: chartProxy.getSeriesOption<FontWeight>("label.fontWeight"),
        size: chartProxy.getSeriesOption<number>("label.fontSize"),
        color: chartProxy.getSeriesOption("label.color")
    };

    const setFont = (font: Font) => {
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

    const params: FontPanelParams = {
        name: chartTranslator.translate('labels'),
        enabled: chartProxy.getSeriesOption("label.enabled") || false,
        setEnabled: (enabled: boolean) => chartProxy.setSeriesOption("label.enabled", enabled),
        suppressEnabledCheckbox: false,
        initialFont: initialFont,
        setFont: setFont
    };

    return params;
}