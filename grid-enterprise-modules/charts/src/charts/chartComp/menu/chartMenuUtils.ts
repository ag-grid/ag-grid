import { AgSelectParams, AgSliderParams, Autowired, Bean, BeanStub } from "@ag-grid-community/core";
import { AgColorPickerParams } from "../../../widgets/agColorPicker";
import { ChartTranslationService } from "../services/chartTranslationService";

@Bean('chartMenuUtils')
export class ChartMenuUtils extends BeanStub {
    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    public getDefaultColorPickerParams(
        value: any,
        onValueChange: (value: any) => void,
        labelKey?: string
    ): AgColorPickerParams {
        return {
            label: this.chartTranslationService.translate(labelKey ?? 'color'),
            labelWidth: 'flex',
            inputWidth: 'flex',
            value,
            onValueChange
        }
    }

    public getDefaultSliderParams(
        value: number,
        onValueChange: (value: any) => void,
        labelKey: string,
        defaultMaxValue: number
    ): AgSliderParams {
        return {
            label: this.chartTranslationService.translate(labelKey),
            minValue: 0,
            maxValue: Math.max(value, defaultMaxValue),
            textFieldWidth: 45,
            value: `${value}`,
            onValueChange
        };
    }

    public getDefaultLegendParams(
        value: any,
        onValueChange: (value: any) => void
    ): AgSelectParams {
        return {
            label: this.chartTranslationService.translate('position'),
            labelWidth: "flex",
            inputWidth: 'flex',
            options: ['top', 'right', 'bottom', 'left'].map(position => ({
                value: position,
                text: this.chartTranslationService.translate(position)
            })),
            value,
            onValueChange
        };
    }
}