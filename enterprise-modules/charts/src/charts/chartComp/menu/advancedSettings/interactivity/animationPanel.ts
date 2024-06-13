import type { BeanCollection } from '@ag-grid-community/core';
import { AgInputNumberFieldSelector, Component } from '@ag-grid-community/core';
import type { AgGroupComponentParams } from '@ag-grid-enterprise/core';
import { AgGroupComponentSelector } from '@ag-grid-enterprise/core';

import type { ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class AnimationPanel extends Component {
    private chartTranslationService: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslationService = beans.chartTranslationService as ChartTranslationService;
    }

    constructor(private readonly chartMenuParamsFactory: ChartMenuParamsFactory) {
        super();
    }

    public postConstruct() {
        const animationGroupParams = this.chartMenuParamsFactory.addEnableParams<AgGroupComponentParams>(
            'animation.enabled',
            {
                cssIdentifier: 'charts-advanced-settings-top-level',
                direction: 'vertical',
                suppressOpenCloseIcons: true,
                title: this.chartTranslationService.translate('animation'),
                suppressEnabledCheckbox: true,
                useToggle: true,
            }
        );
        const animationHeightInputParams = this.chartMenuParamsFactory.getDefaultNumberInputParams(
            'animation.duration',
            'durationMillis',
            {
                min: 0,
            }
        );
        this.setTemplate(
            /* html */ `<div>
            <ag-group-component data-ref="animationGroup">
                <ag-input-number-field data-ref="animationHeightInput"></ag-input>
            </ag-group-component>
        </div>`,
            [AgGroupComponentSelector, AgInputNumberFieldSelector],
            {
                animationGroup: animationGroupParams,
                animationHeightInput: animationHeightInputParams,
            }
        );
    }
}
