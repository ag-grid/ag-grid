import { AgGroupComponentParams } from "@ag-grid-community/core";
import { AgFieldParams, AgSelectParams, AgSliderParams, Autowired, Bean, BeanStub } from "@ag-grid-community/core";
import { AgColorPickerParams } from "../../../widgets/agColorPicker";
import { ChartOptionsProxy } from "../services/chartOptionsService";
import { ChartTranslationService } from "../services/chartTranslationService";

@Bean('chartMenuUtils')
export class ChartMenuUtils extends BeanStub {
    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    public getDefaultColorPickerParams(
        chartOptionsProxy: ChartOptionsProxy,
        expression: string,
        labelKey?: string
    ): AgColorPickerParams {
        return this.addValueParams(
            chartOptionsProxy,
            expression,
            {
                label: this.chartTranslationService.translate(labelKey ?? 'color'),
                labelWidth: 'flex',
                inputWidth: 'flex',
            }
        );
    }


    public getDefaultSliderParams(
        chartOptionsProxy: ChartOptionsProxy,
        expression: string,
        labelKey: string,
        defaultMaxValue: number,
        isArray?: boolean
    ): AgSliderParams {
        let value = chartOptionsProxy.getValue<number>(expression) ?? 0;
        if (isArray && Array.isArray(value)) {
            value = value[0];
        }
        return {
            label: this.chartTranslationService.translate(labelKey),
            minValue: 0,
            maxValue: Math.max(value, defaultMaxValue),
            textFieldWidth: 45,
            value: `${value}`,
            onValueChange: value => chartOptionsProxy.setValue(expression, isArray ? [value] : value)
        };
    }

    public getDefaultLegendParams(
        chartOptionsProxy: ChartOptionsProxy,
        expression: string
    ): AgSelectParams {
        return this.addValueParams(
            chartOptionsProxy,
            expression,
            {
                label: this.chartTranslationService.translate('position'),
                labelWidth: "flex",
                inputWidth: 'flex',
                options: ['top', 'right', 'bottom', 'left'].map(position => ({
                    value: position,
                    text: this.chartTranslationService.translate(position)
                })),
            }
        );
    }

    public addValueParams<P extends AgFieldParams>(chartOptionsProxy: ChartOptionsProxy, expression: string, params: P): P {
        params.value =  chartOptionsProxy.getValue(expression);
        params.onValueChange = value => chartOptionsProxy.setValue(expression, value);
        return params;
    }

    public addEnableParams<P extends AgGroupComponentParams>(chartOptionsProxy: ChartOptionsProxy, expression: string, params: P): P {
        params.enabled =  chartOptionsProxy.getValue(expression) ?? false;
        params.onEnableChange = value => chartOptionsProxy.setValue(expression, value);
        return params;
    }
}