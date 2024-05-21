import { Autowired, Component, PostConstruct } from '@ag-grid-community/core';
import { AgGroupComponent, AgGroupComponentParams } from '@ag-grid-enterprise/core';

import { AgColorPicker } from '../../../../../widgets/agColorPicker';
import { ChartTranslationService } from '../../../services/chartTranslationService';
import { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class BackgroundPanel extends Component {
    public static TEMPLATE /* html */ = `<div>
            <ag-group-component data-ref="chartBackgroundGroup">
                <ag-color-picker data-ref="colorPicker"></ag-color-picker>
            </ag-group-component>
        <div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    constructor(private readonly chartMenuUtils: ChartMenuParamsFactory) {
        super();
    }

    @PostConstruct
    private init() {
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
        this.setTemplate(BackgroundPanel.TEMPLATE, [AgGroupComponent, AgColorPicker], {
            chartBackgroundGroup: chartBackgroundGroupParams,
            colorPicker: colorPickerParams,
        });
    }
}
