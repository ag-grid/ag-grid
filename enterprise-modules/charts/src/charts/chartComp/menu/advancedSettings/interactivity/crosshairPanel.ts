import type { BeanCollection } from '@ag-grid-community/core';
import { AgCheckboxSelector, Component } from '@ag-grid-community/core';
import {  AgGroupComponentSelector } from '@ag-grid-enterprise/core';
import type {AgGroupComponentParams} from '@ag-grid-enterprise/core';

import { AgColorPickerSelector } from '../../../../../widgets/agColorPicker';
import type { ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class CrosshairPanel extends Component {
    private chartTranslationService: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslationService = beans.chartTranslationService as ChartTranslationService;
    }

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
        this.setTemplate(
            /* html */ `<div>
            <ag-group-component data-ref="crosshairGroup">
                <ag-checkbox data-ref="crosshairLabelCheckbox"></ag-checkbox>
                <ag-checkbox data-ref="crosshairSnapCheckbox"></ag-checkbox>
                <ag-color-picker data-ref="crosshairStrokeColorPicker"></ag-color-picker>
            </ag-group-component>
        </div>`,
            [AgGroupComponentSelector, AgCheckboxSelector, AgColorPickerSelector],
            {
                crosshairGroup: crosshairGroupParams,
                crosshairLabelCheckbox: crosshairLabelCheckboxParams,
                crosshairSnapCheckbox: crosshairSnapCheckboxParams,
                crosshairStrokeColorPicker: crosshairStrokeColorPickerParams,
            }
        );
    }
}
