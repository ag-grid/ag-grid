import {ChartTranslator} from "../../chartTranslator";
import {ChartProxy} from "../../chartProxies/chartProxy";
import {AgSlider} from "@ag-grid-community/core";

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
