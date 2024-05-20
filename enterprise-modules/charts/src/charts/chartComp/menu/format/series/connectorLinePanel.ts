import { AgGroupComponentParams, AgSliderParams, Autowired, Component, PostConstruct } from '@ag-grid-community/core';

import { ChartTranslationKey, ChartTranslationService } from '../../../services/chartTranslationService';
import { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class ConnectorLinePanel extends Component {
    public static TEMPLATE /* html */ = `<div>
            <ag-group-component ref="lineGroup">
                <ag-color-picker ref="lineColorPicker"></ag-color-picker>
                <ag-slider ref="lineStrokeWidthSlider"></ag-slider>
                <ag-slider ref="lineOpacitySlider"></ag-slider>
                <ag-slider ref="lineDashSlider"></ag-slider>                
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    constructor(private readonly chartMenuUtils: ChartMenuParamsFactory) {
        super();
    }

    @PostConstruct
    private init() {
        const lineGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate('connectorLine'),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(ConnectorLinePanel.TEMPLATE, {
            lineGroup: lineGroupParams,
            lineColorPicker: this.chartMenuUtils.getDefaultColorPickerParams('line.stroke'),
            lineStrokeWidthSlider: this.getSliderParams('strokeWidth', 10, 'line.strokeWidth'),
            lineDashSlider: this.getSliderParams('lineDash', 30, 'line.lineDash', 1, true),
            lineOpacitySlider: this.getSliderParams('strokeOpacity', 1, 'line.strokeOpacity', 0.05),
        });
    }

    private getSliderParams(
        labelKey: ChartTranslationKey,
        maxValue: number,
        seriesOptionKey: string,
        step: number = 1,
        isArray: boolean = false
    ): AgSliderParams {
        const params = this.chartMenuUtils.getDefaultSliderParams(seriesOptionKey, labelKey, maxValue, isArray);
        params.step = step;
        return params;
    }
}
