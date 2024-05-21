import { AgCheckbox, Autowired, Component, RefSelector } from '@ag-grid-community/core';
import { AgGroupComponent, AgGroupComponentParams } from '@ag-grid-enterprise/core';

import { AgSlider } from '../../../../../widgets/agSlider';
import { ChartTranslationService } from '../../../services/chartTranslationService';
import { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class ZoomPanel extends Component {
    public static TEMPLATE = /* html */ `<div>
            <ag-group-component ref="zoomGroup">
                <ag-checkbox ref="zoomSelectingCheckbox"></ag-checkbox>
                <ag-checkbox ref="zoomScrollingCheckbox"></ag-checkbox>
                <ag-slider ref="zoomScrollingStepInput"></ag-slider>
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    @RefSelector('zoomScrollingStepInput') private readonly zoomScrollingStepInput: AgSlider;

    constructor(private readonly chartMenuParamsFactory: ChartMenuParamsFactory) {
        super();
    }

    protected override postConstruct() {
        super.postConstruct();
        const zoomGroupParams = this.chartMenuParamsFactory.addEnableParams<AgGroupComponentParams>('zoom.enabled', {
            cssIdentifier: 'charts-advanced-settings-top-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true,
            title: this.chartTranslationService.translate('zoom'),
            suppressEnabledCheckbox: true,
            useToggle: true,
        });
        const zoomScrollingCheckboxParams = this.chartMenuParamsFactory.getDefaultCheckboxParams(
            'zoom.enableScrolling',
            'scrollingZoom'
        );
        const zoomScrollingStepSliderParams = this.chartMenuParamsFactory.getDefaultSliderParams(
            'zoom.scrollingStep',
            'scrollingStep',
            1
        );
        zoomScrollingStepSliderParams.step = 0.01;
        zoomScrollingStepSliderParams.minValue = zoomScrollingStepSliderParams.step;
        const zoomSelectingCheckboxParams = this.chartMenuParamsFactory.getDefaultCheckboxParams(
            'zoom.enableSelecting',
            'selectingZoom'
        );

        // Enable/disable the scrolling step input according to whether the scrolling checkbox is checked
        zoomScrollingCheckboxParams.onValueChange = ((onValueChange) => (value: boolean) => {
            if (!onValueChange) return;
            onValueChange(value);
            this.zoomScrollingStepInput.setDisabled(!value);
        })(zoomScrollingCheckboxParams.onValueChange);

        this.setTemplate(ZoomPanel.TEMPLATE, [AgGroupComponent, AgCheckbox, AgSlider], {
            zoomGroup: zoomGroupParams,
            zoomScrollingCheckbox: zoomScrollingCheckboxParams,
            zoomScrollingStepInput: zoomScrollingStepSliderParams,
            zoomSelectingCheckbox: zoomSelectingCheckboxParams,
        });

        // Set the initial state of the scrolling step input according to whether the scrolling checkbox is checked
        this.zoomScrollingStepInput.setDisabled(!zoomScrollingCheckboxParams.value);
    }
}
