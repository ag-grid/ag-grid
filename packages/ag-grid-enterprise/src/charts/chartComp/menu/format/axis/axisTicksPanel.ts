import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import type { AgGroupComponentParams } from '../../../../../widgets/agGroupComponent';
import { AgGroupComponentSelector } from '../../../../../widgets/agGroupComponent';
import { AgColorPickerSelector } from '../../../../widgets/agColorPicker';
import { AgSliderSelector } from '../../../../widgets/agSlider';
import type { ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class AxisTicksPanel extends Component {
    private chartTranslationService: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslationService = beans.chartTranslationService as ChartTranslationService;
    }

    constructor(private readonly chartMenuUtils: ChartMenuParamsFactory) {
        super();
    }

    public postConstruct() {
        const { chartMenuUtils } = this;
        const axisTicksGroupParams = chartMenuUtils.addEnableParams<AgGroupComponentParams>('tick.enabled', {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true,
            title: this.chartTranslationService.translate('ticks'),
            suppressEnabledCheckbox: true,
            useToggle: true,
        });
        const axisTicksColorPickerParams = chartMenuUtils.getDefaultColorPickerParams('tick.stroke');
        const axisTicksWidthSliderParams = chartMenuUtils.getDefaultSliderParams('tick.width', 'width', 10);
        const axisTicksSizeSliderParams = chartMenuUtils.getDefaultSliderParams('tick.size', 'length', 30);
        this.setTemplate(
            /* html */ `<div>
            <ag-group-component data-ref="axisTicksGroup">
                <ag-color-picker data-ref="axisTicksColorPicker"></ag-color-picker>
                <ag-slider data-ref="axisTicksWidthSlider"></ag-slider>
                <ag-slider data-ref="axisTicksSizeSlider"></ag-slider>
            </ag-group-component>
        </div>`,
            [AgGroupComponentSelector, AgColorPickerSelector, AgSliderSelector],
            {
                axisTicksGroup: axisTicksGroupParams,
                axisTicksColorPicker: axisTicksColorPickerParams,
                axisTicksWidthSlider: axisTicksWidthSliderParams,
                axisTicksSizeSlider: axisTicksSizeSliderParams,
            }
        );
    }
}
