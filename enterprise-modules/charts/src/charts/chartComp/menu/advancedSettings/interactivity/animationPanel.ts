import { AgGroupComponentParams, Autowired, Component, PostConstruct } from '@ag-grid-community/core';

import { ChartTranslationService } from '../../../services/chartTranslationService';
import { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class AnimationPanel extends Component {
    public static TEMPLATE /* html */ = `<div>
            <ag-group-component ref="animationGroup">
                <ag-input-number-field ref="animationHeightInput"></ag-input>
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
        this.setTemplate(AnimationPanel.TEMPLATE, {
            animationGroup: animationGroupParams,
            animationHeightInput: animationHeightInputParams,
        });
    }
}
