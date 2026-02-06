import type { BeanCollection } from 'ag-grid-community';
import { AgCheckboxSelector, Component } from 'ag-grid-community';

import { AgGroupComponentSelector } from '../../../../../agStack/agGroupComponent';
import { AgSliderSelector } from '../../../../../agStack/agSlider';
import type { GroupComponentParams } from '../../../../../widgets/gridEnterpriseWidgetTypes';
import type { ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class NavigatorPanel extends Component {
    private chartTranslation: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslation = beans.chartTranslation as ChartTranslationService;
    }

    constructor(private readonly chartMenuParamsFactory: ChartMenuParamsFactory) {
        super();
    }

    public postConstruct() {
        const navigatorGroupParams = this.chartMenuParamsFactory.addEnableParams<GroupComponentParams>(
            'navigator.enabled',
            {
                cssIdentifier: 'charts-advanced-settings-top-level',
                direction: 'vertical',
                suppressOpenCloseIcons: true,
                title: this.chartTranslation.translate('navigator'),
                suppressEnabledCheckbox: true,
                useToggle: true,
            }
        );
        const navigatorHeightSliderParams = this.chartMenuParamsFactory.getDefaultSliderParams(
            'navigator.height',
            'height',
            60
        );
        navigatorHeightSliderParams.minValue = 10;
        const navigatorMiniChartCheckboxParams = this.chartMenuParamsFactory.getDefaultCheckboxParams(
            'navigator.miniChart.enabled',
            'miniChart'
        );

        this.setTemplate(
            /* html */ `<div>
            <ag-group-component data-ref="navigatorGroup">
                <ag-slider data-ref="navigatorHeightSlider"></ag-slider>
                <ag-checkbox data-ref="navigatorMiniChartCheckbox"></ag-checkbox>
            </ag-group-component>
        </div>`,
            [AgGroupComponentSelector, AgSliderSelector, AgCheckboxSelector],
            {
                navigatorGroup: navigatorGroupParams,
                navigatorHeightSlider: navigatorHeightSliderParams,
                navigatorMiniChartCheckbox: navigatorMiniChartCheckboxParams,
            }
        );
    }
}
