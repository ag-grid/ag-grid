import { AgInputNumberField, Autowired, Component, PostConstruct } from '@ag-grid-community/core';
import type { AgGroupComponentParams } from '@ag-grid-enterprise/core';
import { AgGroupComponent } from '@ag-grid-enterprise/core';

import type { ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class AnimationPanel extends Component {
    public static TEMPLATE /* html */ = `<div>
            <ag-group-component data-ref="animationGroup">
                <ag-input-number-field data-ref="animationHeightInput"></ag-input>
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    constructor(private readonly chartMenuParamsFactory: ChartMenuParamsFactory) {
        super();
    }

    @PostConstruct
    private init() {
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
        this.setTemplate(AnimationPanel.TEMPLATE, [AgGroupComponent, AgInputNumberField], {
            animationGroup: animationGroupParams,
            animationHeightInput: animationHeightInputParams,
        });
    }
}
