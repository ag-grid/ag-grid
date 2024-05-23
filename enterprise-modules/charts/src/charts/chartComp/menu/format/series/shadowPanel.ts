import { Autowired, Component, PostConstruct } from '@ag-grid-community/core';
import type { AgGroupComponentParams } from '@ag-grid-enterprise/core';
import { AgGroupComponent } from '@ag-grid-enterprise/core';

import { AgColorPicker } from '../../../../../widgets/agColorPicker';
import type { AgSliderParams } from '../../../../../widgets/agSlider';
import { AgSlider } from '../../../../../widgets/agSlider';
import type { ChartTranslationKey, ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class ShadowPanel extends Component {
    public static TEMPLATE /* html */ = `<div>
            <ag-group-component data-ref="shadowGroup">
                <ag-color-picker data-ref="shadowColorPicker"></ag-color-picker>
                <ag-slider data-ref="shadowBlurSlider"></ag-slider>
                <ag-slider data-ref="shadowXOffsetSlider"></ag-slider>
                <ag-slider data-ref="shadowYOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    constructor(
        private readonly chartMenuUtils: ChartMenuParamsFactory,
        private propertyKey: string = 'shadow'
    ) {
        super();
    }

    @PostConstruct
    private init() {
        // Determine the path within the series options object to get/set the individual shadow options
        const propertyNamespace = this.propertyKey;
        const shadowGroupParams = this.chartMenuUtils.addEnableParams<AgGroupComponentParams>(
            `${propertyNamespace}.enabled`,
            {
                cssIdentifier: 'charts-format-sub-level',
                direction: 'vertical',
                suppressOpenCloseIcons: true,
                title: this.chartTranslationService.translate('shadow'),
                suppressEnabledCheckbox: true,
                useToggle: true,
            }
        );
        const shadowColorPickerParams = this.chartMenuUtils.getDefaultColorPickerParams(`${propertyNamespace}.color`);
        this.setTemplate(ShadowPanel.TEMPLATE, [AgGroupComponent, AgColorPicker, AgSlider], {
            shadowGroup: shadowGroupParams,
            shadowColorPicker: shadowColorPickerParams,
            shadowBlurSlider: this.getSliderParams('blur', 0, 20),
            shadowXOffsetSlider: this.getSliderParams('xOffset', -10, 10),
            shadowYOffsetSlider: this.getSliderParams('yOffset', -10, 10),
        });
    }

    private getSliderParams(property: ChartTranslationKey, minValue: number, defaultMaxValue: number): AgSliderParams {
        const expression = `${this.propertyKey}.${property}`;
        const params = this.chartMenuUtils.getDefaultSliderParams(expression, property, defaultMaxValue);
        params.minValue = minValue;
        return params;
    }
}
