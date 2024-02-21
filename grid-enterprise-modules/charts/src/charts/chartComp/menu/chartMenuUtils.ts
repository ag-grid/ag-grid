import { AgSliderParams, Autowired, Bean, BeanStub } from "@ag-grid-community/core";
import { AgColorPickerParams } from "../../../widgets/agColorPicker";
import { ChartTranslationService } from "../services/chartTranslationService";

@Bean('chartMenuUtils')
export class ChartMenuUtils extends BeanStub {
    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    public getDefaultColorPickerParams(params: {
        labelKey?: string,
        value: any,
        onValueChange: (value: any) => void
    }): AgColorPickerParams {
        const { labelKey, value, onValueChange } = params;
        return {
            label: this.chartTranslationService.translate(labelKey ?? 'color'),
            labelWidth: 'flex',
            inputWidth: 'flex',
            value,
            onValueChange
        }
    }

    public getDefaultSliderParams(params: {
        labelKey: string,
        value: number,
        onValueChange: (value: any) => void,
        defaultMaxValue: number
    }): AgSliderParams {
        const { labelKey, value, onValueChange, defaultMaxValue } = params;
        return {
            label: this.chartTranslationService.translate(labelKey),
            maxValue: Math.max(value, defaultMaxValue),
            textFieldWidth: 45,
            value: `${value}`,
            onValueChange
        };
    }
}