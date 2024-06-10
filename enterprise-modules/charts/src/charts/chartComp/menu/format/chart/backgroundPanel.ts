import type { BeanCollection } from '@ag-grid-community/core';
import { Component } from '@ag-grid-community/core';
import type { AgGroupComponentParams } from '@ag-grid-enterprise/core';
import { AgGroupComponentClass } from '@ag-grid-enterprise/core';

import { AgColorPickerClass } from '../../../../../widgets/agColorPicker';
import type { ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class BackgroundPanel extends Component {
    public static TEMPLATE /* html */ = `<div>
            <ag-group-component data-ref="chartBackgroundGroup">
                <ag-color-picker data-ref="colorPicker"></ag-color-picker>
            </ag-group-component>
        <div>`;

    private chartTranslationService: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslationService = beans.chartTranslationService as ChartTranslationService;
    }
    constructor(private readonly chartMenuUtils: ChartMenuParamsFactory) {
        super();
    }

    public postConstruct() {
        const chartBackgroundGroupParams = this.chartMenuUtils.addEnableParams<AgGroupComponentParams>(
            'background.visible',
            {
                cssIdentifier: 'charts-format-sub-level',
                direction: 'vertical',
                suppressOpenCloseIcons: true,
                title: this.chartTranslationService.translate('background'),
                suppressEnabledCheckbox: true,
                useToggle: true,
            }
        );
        const colorPickerParams = this.chartMenuUtils.getDefaultColorPickerParams('background.fill');
        this.setTemplate(BackgroundPanel.TEMPLATE, [AgGroupComponentClass, AgColorPickerClass], {
            chartBackgroundGroup: chartBackgroundGroupParams,
            colorPicker: colorPickerParams,
        });
    }
}
