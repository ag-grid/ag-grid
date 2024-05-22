import type { BeanCollection} from '@ag-grid-community/core';
import { Component } from '@ag-grid-community/core';
import type { AgGroupComponentParams } from '@ag-grid-enterprise/core';
import { AgGroupComponent } from '@ag-grid-enterprise/core';

import { AgColorPicker } from '../../../../../widgets/agColorPicker';
import { AgSlider } from '../../../../../widgets/agSlider';
import type { ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class AxisTicksPanel extends Component {
    private chartTranslationService: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.chartTranslationService = beans.chartTranslationService;
    }

    public static TEMPLATE /* html */ = `<div>
            <ag-group-component ref="axisTicksGroup">
                <ag-color-picker ref="axisTicksColorPicker"></ag-color-picker>
                <ag-slider ref="axisTicksWidthSlider"></ag-slider>
                <ag-slider ref="axisTicksSizeSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    constructor(private readonly chartMenuUtils: ChartMenuParamsFactory) {
        super();
    }

    public postConstruct() {
        const axisTicksGroupParams = this.chartMenuUtils.addEnableParams<AgGroupComponentParams>('tick.enabled', {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true,
            title: this.chartTranslationService.translate('ticks'),
            suppressEnabledCheckbox: true,
            useToggle: true,
        });
        const axisTicksColorPickerParams = this.chartMenuUtils.getDefaultColorPickerParams('tick.color');
        const axisTicksWidthSliderParams = this.chartMenuUtils.getDefaultSliderParams('tick.width', 'width', 10);
        const axisTicksSizeSliderParams = this.chartMenuUtils.getDefaultSliderParams('tick.size', 'length', 30);
        this.setTemplate(AxisTicksPanel.TEMPLATE, [AgGroupComponent, AgColorPicker, AgSlider], {
            axisTicksGroup: axisTicksGroupParams,
            axisTicksColorPicker: axisTicksColorPickerParams,
            axisTicksWidthSlider: axisTicksWidthSliderParams,
            axisTicksSizeSlider: axisTicksSizeSliderParams,
        });
    }
}
