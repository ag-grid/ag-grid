import type { BeanCollection } from '@ag-grid-community/core';
import { Component } from '@ag-grid-community/core';
import type { AgGroupComponentParams } from '@ag-grid-enterprise/core';
import { AgGroupComponentSelector } from '@ag-grid-enterprise/core';

import { AgSliderSelector } from '../../../../../widgets/agSlider';
import type { ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class CapsPanel extends Component {
    public static TEMPLATE /* html */ = `<div>
            <ag-group-component data-ref="capsGroup">
                <ag-slider data-ref="capLengthRatioSlider"></ag-slider>
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
        const capsGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate('cap'),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        const capLengthRatioSliderParams = this.chartMenuUtils.getDefaultSliderParams(
            'cap.lengthRatio',
            'capLengthRatio',
            1
        );
        capLengthRatioSliderParams.step = 0.05;

        this.setTemplate(CapsPanel.TEMPLATE, [AgGroupComponentSelector, AgSliderSelector], {
            capsGroup: capsGroupParams,
            capLengthRatioSlider: capLengthRatioSliderParams,
        });
    }
}
