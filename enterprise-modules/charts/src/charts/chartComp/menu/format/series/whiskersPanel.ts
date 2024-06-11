import type { BeanCollection } from '@ag-grid-community/core';
import { Component } from '@ag-grid-community/core';
import type { AgGroupComponentParams } from '@ag-grid-enterprise/core';
import { AgGroupComponentSelector } from '@ag-grid-enterprise/core';

import { AgColorPickerSelector } from '../../../../../widgets/agColorPicker';
import { AgSliderSelector } from '../../../../../widgets/agSlider';
import type { ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class WhiskersPanel extends Component {
    public static TEMPLATE /* html */ = `<div>
            <ag-group-component data-ref="whiskersGroup">
                <ag-color-picker data-ref="whiskerColorPicker"></ag-color-picker>
                <ag-slider data-ref="whiskerThicknessSlider"></ag-slider>
                <ag-slider data-ref="whiskerOpacitySlider"></ag-slider>
                <ag-slider data-ref="whiskerLineDashSlider"></ag-slider>
                <ag-slider data-ref="whiskerLineDashOffsetSlider"></ag-slider>
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
        const whiskersGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate('whisker'),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(WhiskersPanel.TEMPLATE, [AgGroupComponentSelector, AgColorPickerSelector, AgSliderSelector], {
            whiskersGroup: whiskersGroupParams,
            whiskerColorPicker: this.chartMenuUtils.getDefaultColorPickerParams('whisker.stroke'),
            whiskerThicknessSlider: this.chartMenuUtils.getDefaultSliderParams(
                'whisker.strokeWidth',
                'strokeWidth',
                10
            ),
            whiskerOpacitySlider: this.chartMenuUtils.getDefaultSliderParams(
                'whisker.strokeOpacity',
                'strokeOpacity',
                1
            ),
            whiskerLineDashSlider: this.chartMenuUtils.getDefaultSliderParams('whisker.lineDash', 'lineDash', 30, true),
            whiskerLineDashOffsetSlider: this.chartMenuUtils.getDefaultSliderParams(
                'whisker.lineDashOffset',
                'lineDashOffset',
                30
            ),
        });
    }
}
