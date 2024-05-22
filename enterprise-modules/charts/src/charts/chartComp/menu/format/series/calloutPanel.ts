import { Autowired, Component } from '@ag-grid-community/core';
import { AgGroupComponent, AgGroupComponentParams } from '@ag-grid-enterprise/core';

import { AgSlider } from '../../../../../widgets/agSlider';
import { ChartTranslationService } from '../../../services/chartTranslationService';
import { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class CalloutPanel extends Component {
    public static TEMPLATE /* html */ = `<div>
            <ag-group-component ref="calloutGroup">
                <ag-slider ref="calloutLengthSlider"></ag-slider>
                <ag-slider ref="calloutStrokeWidthSlider"></ag-slider>
                <ag-slider ref="labelOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    constructor(private readonly chartMenuUtils: ChartMenuParamsFactory) {
        super();
    }

    public override postConstruct() {
        super.postConstruct();
        const calloutGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate('callout'),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(CalloutPanel.TEMPLATE, [AgGroupComponent, AgSlider], {
            calloutGroup: calloutGroupParams,
            calloutLengthSlider: this.chartMenuUtils.getDefaultSliderParams('calloutLine.length', 'length', 40),
            calloutStrokeWidthSlider: this.chartMenuUtils.getDefaultSliderParams(
                'calloutLine.strokeWidth',
                'strokeWidth',
                10
            ),
            labelOffsetSlider: this.chartMenuUtils.getDefaultSliderParams('calloutLabel.offset', 'offset', 30),
        });
    }
}
