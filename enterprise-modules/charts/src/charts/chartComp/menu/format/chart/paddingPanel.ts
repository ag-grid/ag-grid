import { Autowired, ChartOptionsChanged, Component, Events, RefSelector } from '@ag-grid-community/core';
import { AgGroupComponent, AgGroupComponentParams } from '@ag-grid-enterprise/core';
import { AgChartPaddingOptions, AgChartThemeOverrides } from 'ag-charts-community';

import { AgSlider } from '../../../../../widgets/agSlider';
import { ChartController } from '../../../chartController';
import { ChartTranslationService } from '../../../services/chartTranslationService';
import { ChartThemeOverridesSeriesType } from '../../../utils/seriesTypeMapper';
import { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

export class PaddingPanel extends Component {
    public static TEMPLATE /* html */ = `<div>
            <ag-group-component ref="chartPaddingGroup">
                <ag-slider ref="paddingTopSlider"></ag-slider>
                <ag-slider ref="paddingRightSlider"></ag-slider>
                <ag-slider ref="paddingBottomSlider"></ag-slider>
                <ag-slider ref="paddingLeftSlider"></ag-slider>
            </ag-group-component>
        <div>`;

    @RefSelector('paddingTopSlider') private paddingTopSlider: AgSlider;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    constructor(
        private readonly chartMenuUtils: ChartMenuParamsFactory,
        private readonly chartController: ChartController
    ) {
        super();
    }

    public override postConstruct() {
        super.postConstruct();
        const chartPaddingGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true,
            title: this.chartTranslationService.translate('padding'),
            suppressEnabledCheckbox: true,
        };
        const getSliderParams = (property: keyof AgChartPaddingOptions) =>
            this.chartMenuUtils.getDefaultSliderParams('padding.' + property, property, 200);

        this.setTemplate(PaddingPanel.TEMPLATE, [AgGroupComponent, AgSlider], {
            chartPaddingGroup: chartPaddingGroupParams,
            paddingTopSlider: getSliderParams('top'),
            paddingRightSlider: getSliderParams('right'),
            paddingBottomSlider: getSliderParams('bottom'),
            paddingLeftSlider: getSliderParams('left'),
        });

        this.addManagedListener(this.eventService, Events.EVENT_CHART_OPTIONS_CHANGED, (e: ChartOptionsChanged) => {
            this.updateTopPadding(e.chartOptions);
        });
    }

    private updateTopPadding(chartOptions: AgChartThemeOverrides) {
        // keep 'top' padding in sync with chart as toggling chart title on / off change the 'top' padding
        const topPadding = [...this.chartController.getChartSeriesTypes(), 'common']
            .map((seriesType: ChartThemeOverridesSeriesType) => chartOptions[seriesType]?.padding?.top)
            .find((value) => value != null);
        if (topPadding != null) {
            this.paddingTopSlider.setValue(`${topPadding}`);
        }
    }
}
