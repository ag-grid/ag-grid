import { AgCheckbox, Autowired, Component } from '@ag-grid-community/core';
import type { AgGroupComponentParams } from '@ag-grid-enterprise/core';
import { AgGroupComponent } from '@ag-grid-enterprise/core';

import { AgColorPicker } from '../../../../../widgets/agColorPicker';
import type { ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class CrosshairPanel extends Component {
    public static TEMPLATE = /* html */ `<div>
            <ag-group-component ref="crosshairGroup">
                <ag-checkbox ref="crosshairLabelCheckbox"></ag-checkbox>
                <ag-checkbox ref="crosshairSnapCheckbox"></ag-checkbox>
                <ag-color-picker ref="crosshairStrokeColorPicker"></ag-color-picker>
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    constructor(private readonly chartMenuParamsFactory: ChartMenuParamsFactory) {
        super();
    }

    public postConstruct() {
        const crosshairGroupParams = this.chartMenuParamsFactory.addEnableParams<AgGroupComponentParams>(
            'crosshair.enabled',
            {
                cssIdentifier: 'charts-advanced-settings-top-level',
                direction: 'vertical',
                suppressOpenCloseIcons: true,
                title: this.chartTranslationService.translate('crosshair'),
                suppressEnabledCheckbox: true,
                useToggle: true,
            }
        );
        const crosshairLabelCheckboxParams = this.chartMenuParamsFactory.getDefaultCheckboxParams(
            'crosshair.label.enabled',
            'crosshairLabel'
        );
        const crosshairSnapCheckboxParams = this.chartMenuParamsFactory.getDefaultCheckboxParams(
            'crosshair.snap',
            'crosshairSnap'
        );
        const crosshairStrokeColorPickerParams = this.chartMenuParamsFactory.getDefaultColorPickerParams(
            'crosshair.stroke',
            'color'
        );
        this.setTemplate(CrosshairPanel.TEMPLATE, [AgGroupComponent, AgCheckbox, AgColorPicker], {
            crosshairGroup: crosshairGroupParams,
            crosshairLabelCheckbox: crosshairLabelCheckboxParams,
            crosshairSnapCheckbox: crosshairSnapCheckboxParams,
            crosshairStrokeColorPicker: crosshairStrokeColorPickerParams,
        });
    }
}
