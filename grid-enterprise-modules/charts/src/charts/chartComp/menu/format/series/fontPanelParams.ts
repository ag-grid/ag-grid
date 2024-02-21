import { FontPanelParams } from "../fontPanel";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";

interface InitFontPanelParams {
    labelName: string,
    chartOptionsService: ChartOptionsService,
    getSelectedSeries: () => ChartSeriesType,
    seriesOptionLabelProperty: 'calloutLabel' | 'sectorLabel' | 'label' | 'item.positive.label' | 'item.negative.label'
}

export function initFontPanelParams({
    labelName,
    chartOptionsService,
    getSelectedSeries,
    seriesOptionLabelProperty
}: InitFontPanelParams) {

    const getFontOptionExpression = (fontOption: string) => {
        return `${seriesOptionLabelProperty}.${fontOption}`;
    };
    const getFontOption = <T = string>(fontOption: string) => {
        const expression = getFontOptionExpression(fontOption);
        return chartOptionsService.getSeriesOption<T>(expression, getSelectedSeries());
    };
    const setFontOption = (fontOption: string, value: any) => {
        const expression = getFontOptionExpression(fontOption);
        chartOptionsService.setSeriesOption(expression, value, getSelectedSeries());
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