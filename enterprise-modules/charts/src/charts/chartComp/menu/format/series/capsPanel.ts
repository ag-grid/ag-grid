import type { BeanCollection } from '@ag-grid-community/core';
import { Component } from '@ag-grid-community/core';
import type { AgGroupComponentParams } from '@ag-grid-enterprise/core';
import { AgGroupComponent } from '@ag-grid-enterprise/core';

import { AgSlider } from '../../../../../widgets/agSlider';
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
        super.wireBeans(beans);
        this.chartTranslationService = beans.chartTranslationService;
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

        this.setTemplate(CapsPanel.TEMPLATE, [AgGroupComponent, AgSlider], {
            capsGroup: capsGroupParams,
            capLengthRatioSlider: capLengthRatioSliderParams,
        });
    }
}
