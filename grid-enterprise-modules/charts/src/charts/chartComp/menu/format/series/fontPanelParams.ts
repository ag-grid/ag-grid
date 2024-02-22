import { FontPanelParams } from "../fontPanel";
import { ChartOptionsProxy, ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";

interface InitFontPanelParams {
    labelName: string,
    chartOptionsProxy: ChartOptionsProxy,
    seriesOptionLabelProperty: 'calloutLabel' | 'sectorLabel' | 'label' | 'item.positive.label' | 'item.negative.label'
}

export function initFontPanelParams({
    labelName,
    chartOptionsProxy,
    seriesOptionLabelProperty
}: InitFontPanelParams) {

    const getFontOptionExpression = (fontOption: string) => {
        return `${seriesOptionLabelProperty}.${fontOption}`;
    };
    const getFontOption = <T = string>(fontOption: string) => {
        const expression = getFontOptionExpression(fontOption);
        return chartOptionsProxy.getValue<T>(expression);
    };
    const setFontOption = (fontOption: string, value: any) => {
        const expression = getFontOptionExpression(fontOption);
        chartOptionsProxy.setValue(expression, value);
    };

    const params: FontPanelParams = {
        name: labelName,
        enabled: getFontOption('enabled') || false,
        setEnabled: (enabled: boolean) => setFontOption('enabled', enabled),
        suppressEnabledCheckbox: false,
        fontModelProxy: {
            getValue: getFontOption,
            setValue: setFontOption
        }
    };

    return params;
}