import type { BeanCollection } from '@ag-grid-community/core';
import { AgCheckboxClass, Component, RefPlaceholder } from '@ag-grid-community/core';
import type { AgGroupComponentParams } from '@ag-grid-enterprise/core';
import { AgGroupComponentClass } from '@ag-grid-enterprise/core';

import type { AgSlider } from '../../../../../widgets/agSlider';
import { AgSliderClass } from '../../../../../widgets/agSlider';
import type { ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class ZoomPanel extends Component {
    public static TEMPLATE = /* html */ `<div>
            <ag-group-component data-ref="zoomGroup">
                <ag-checkbox data-ref="zoomSelectingCheckbox"></ag-checkbox>
                <ag-checkbox data-ref="zoomScrollingCheckbox"></ag-checkbox>
                <ag-slider data-ref="zoomScrollingStepInput"></ag-slider>
            </ag-group-component>
        </div>`;

    private chartTranslationService: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslationService = beans.chartTranslationService as ChartTranslationService;
    }

    private readonly zoomScrollingStepInput: AgSlider = RefPlaceholder;

    constructor(private readonly chartMenuParamsFactory: ChartMenuParamsFactory) {
        super();
    }

    public postConstruct() {
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

        this.setTemplate(ZoomPanel.TEMPLATE, [AgGroupComponentClass, AgCheckboxClass, AgSliderClass], {
            zoomGroup: zoomGroupParams,
            zoomScrollingCheckbox: zoomScrollingCheckboxParams,
            zoomScrollingStepInput: zoomScrollingStepSliderParams,
            zoomSelectingCheckbox: zoomSelectingCheckboxParams,
        });

        // Set the initial state of the scrolling step input according to whether the scrolling checkbox is checked
        this.zoomScrollingStepInput.setDisabled(!zoomScrollingCheckboxParams.value);
    }
}
