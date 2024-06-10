import type { BeanCollection } from '@ag-grid-community/core';
import { Component } from '@ag-grid-community/core';
import type { AgGroupComponentParams } from '@ag-grid-enterprise/core';
import { AgGroupComponentClass } from '@ag-grid-enterprise/core';

import { AgColorPickerClass } from '../../../../../widgets/agColorPicker';
import type { AgSliderParams } from '../../../../../widgets/agSlider';
import { AgSliderClass } from '../../../../../widgets/agSlider';
import type { ChartTranslationKey, ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class ConnectorLinePanel extends Component {
    public static TEMPLATE /* html */ = `<div>
            <ag-group-component data-ref="lineGroup">
                <ag-color-picker data-ref="lineColorPicker"></ag-color-picker>
                <ag-slider data-ref="lineStrokeWidthSlider"></ag-slider>
                <ag-slider data-ref="lineOpacitySlider"></ag-slider>
                <ag-slider data-ref="lineDashSlider"></ag-slider>                
            </ag-group-component>
        </div>`;

    private chartTranslationService: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslationService = beans.chartTranslationService as ChartTranslationService;
    }
    constructor(private readonly chartMenuUtils: ChartMenuParamsFactory) {
        super();
    }

    public postConstruct() {
        const lineGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate('connectorLine'),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(ConnectorLinePanel.TEMPLATE, [AgGroupComponentClass, AgColorPickerClass, AgSliderClass], {
            lineGroup: lineGroupParams,
            lineColorPicker: this.chartMenuUtils.getDefaultColorPickerParams('line.stroke'),
            lineStrokeWidthSlider: this.getSliderParams('strokeWidth', 10, 'line.strokeWidth'),
            lineDashSlider: this.getSliderParams('lineDash', 30, 'line.lineDash', 1, true),
            lineOpacitySlider: this.getSliderParams('strokeOpacity', 1, 'line.strokeOpacity', 0.05),
        });
    }

    private getSliderParams(
        labelKey: ChartTranslationKey,
        maxValue: number,
        seriesOptionKey: string,
        step: number = 1,
        isArray: boolean = false
    ): AgSliderParams {
        const params = this.chartMenuUtils.getDefaultSliderParams(seriesOptionKey, labelKey, maxValue, isArray);
        params.step = step;
        return params;
    }
}
