import { Autowired, Component } from '@ag-grid-community/core';
import { AgGroupComponent, AgGroupComponentParams } from '@ag-grid-enterprise/core';

import { AgColorPicker } from '../../../../../widgets/agColorPicker';
import { AgSlider } from '../../../../../widgets/agSlider';
import { ChartTranslationService } from '../../../services/chartTranslationService';
import { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class AxisTicksPanel extends Component {
    public static TEMPLATE /* html */ = `<div>
            <ag-group-component ref="axisTicksGroup">
                <ag-color-picker ref="axisTicksColorPicker"></ag-color-picker>
                <ag-slider ref="axisTicksWidthSlider"></ag-slider>
                <ag-slider ref="axisTicksSizeSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    constructor(private readonly chartMenuUtils: ChartMenuParamsFactory) {
        super();
    }

    public override postConstruct() {
        super.postConstruct();
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
