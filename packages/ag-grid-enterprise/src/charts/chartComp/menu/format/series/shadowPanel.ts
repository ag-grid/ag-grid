import { _getDocument } from 'ag-stack';

import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import { AgColor } from '../../../../../agStack/agColor';
import { AgGroupComponentSelector } from '../../../../../agStack/agGroupComponent';
import type { AgSliderParams } from '../../../../../agStack/agSlider';
import { AgSliderSelector } from '../../../../../agStack/agSlider';
import type { GroupComponentParams } from '../../../../../widgets/gridEnterpriseWidgetTypes';
import { ColorPickerSelector } from '../../../../widgets/colorPicker';
import type { ChartTranslationKey, ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class ShadowPanel extends Component {
    private chartTranslation: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslation = beans.chartTranslation as ChartTranslationService;
    }
    constructor(
        private readonly chartMenuUtils: ChartMenuParamsFactory,
        private readonly propertyKey: string = 'shadow'
    ) {
        super();
    }

    public postConstruct() {
        // Determine the path within the series options object to get/set the individual shadow options
        const propertyNamespace = this.propertyKey;
        const shadowGroupParams = this.chartMenuUtils.addEnableParams<GroupComponentParams>(
            `${propertyNamespace}.enabled`,
            {
                cssIdentifier: 'charts-format-sub-level',
                direction: 'vertical',
                suppressOpenCloseIcons: true,
                title: this.chartTranslation.translate('shadow'),
                suppressEnabledCheckbox: true,
                useToggle: true,
            }
        );
        const shadowColorPickerParams = this.getColorPickerParams(propertyNamespace);
        this.setTemplate(
            /* html */ `<div>
            <ag-group-component data-ref="shadowGroup">
                <ag-color-picker data-ref="shadowColorPicker"></ag-color-picker>
                <ag-slider data-ref="shadowBlurSlider"></ag-slider>
                <ag-slider data-ref="shadowXOffsetSlider"></ag-slider>
                <ag-slider data-ref="shadowYOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`,
            [AgGroupComponentSelector, ColorPickerSelector, AgSliderSelector],
            {
                shadowGroup: shadowGroupParams,
                shadowColorPicker: shadowColorPickerParams,
                shadowBlurSlider: this.getSliderParams('blur', 0, 20),
                shadowXOffsetSlider: this.getSliderParams('xOffset', -10, 10),
                shadowYOffsetSlider: this.getSliderParams('yOffset', -10, 10),
            }
        );
    }

    /**
     * The shadow casts `fill` at `fillOpacity`, so the picker shows the two combined as one colour with an alpha,
     * and a pick writes both back, leaving `fill` opaque so the opacity is not applied twice.
     */
    private getColorPickerParams(propertyNamespace: string) {
        const fillExpression = `${propertyNamespace}.fill`;
        const fillOpacityExpression = `${propertyNamespace}.fillOpacity`;
        const chartOptions = this.chartMenuUtils.getChartOptions();
        const doc = _getDocument(this.beans);

        const params = this.chartMenuUtils.getDefaultColorPickerParams(fillExpression);
        const fill = chartOptions.getValue<string | undefined>(fillExpression);
        if (fill != null) {
            const fillColor = AgColor.fromString(fill, doc);
            const fillOpacity = chartOptions.getValue<number | undefined>(fillOpacityExpression) ?? 1;
            params.value = new AgColor(fillColor.r, fillColor.g, fillColor.b, fillColor.a * fillOpacity).toRgbaString();
        }
        params.onValueChange = (value) => {
            const color = AgColor.fromString(value, doc);
            chartOptions.setValues<string | number>([
                { expression: fillExpression, value: new AgColor(color.r, color.g, color.b).toRgbaString() },
                { expression: fillOpacityExpression, value: Math.round(color.a * 1000) / 1000 },
            ]);
        };
        return params;
    }

    private getSliderParams(property: ChartTranslationKey, minValue: number, defaultMaxValue: number): AgSliderParams {
        const expression = `${this.propertyKey}.${property}`;
        const params = this.chartMenuUtils.getDefaultSliderParams(expression, property, defaultMaxValue);
        params.minValue = minValue;
        return params;
    }
}
