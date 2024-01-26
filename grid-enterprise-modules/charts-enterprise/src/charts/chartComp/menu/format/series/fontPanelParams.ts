import { Font, FontPanelParams } from "../fontPanel";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";

interface InitFontPanelParams {
    labelName: string,
    chartOptionsService: ChartOptionsService,
    getSelectedSeries: () => ChartSeriesType,
    seriesOptionLabelProperty: 'calloutLabel' | 'sectorLabel' | 'label'
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

    const initialFont = {
        family: getFontOption('fontFamily'),
        style: getFontOption('fontStyle'),
        weight: getFontOption('fontWeight'),
        size: getFontOption<number>('fontSize'),
        color: getFontOption('color'),
    };

    const setFont = (font: Font) => {
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

    const params: FontPanelParams = {
        name: labelName,
        enabled: getFontOption('enabled') || false,
        setEnabled: (enabled: boolean) => setFontOption('enabled', enabled),
        suppressEnabledCheckbox: false,
        initialFont: initialFont,
        setFont: setFont
    };

    return params;
}