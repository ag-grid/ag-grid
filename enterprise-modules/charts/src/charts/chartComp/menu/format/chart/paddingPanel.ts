import type { BeanCollection, ChartOptionsChanged} from '@ag-grid-community/core';
import { Component, Events, RefSelector } from '@ag-grid-community/core';
import type { AgGroupComponentParams } from '@ag-grid-enterprise/core';
import { AgGroupComponent } from '@ag-grid-enterprise/core';
import type { AgChartPaddingOptions, AgChartThemeOverrides } from 'ag-charts-community';

import { AgSlider } from '../../../../../widgets/agSlider';
import type { ChartController } from '../../../chartController';
import type { ChartTranslationService } from '../../../services/chartTranslationService';
import type { ChartThemeOverridesSeriesType } from '../../../utils/seriesTypeMapper';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';

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

    private chartTranslationService: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.chartTranslationService = beans.chartTranslationService;
    }
    constructor(
        private readonly chartMenuUtils: ChartMenuParamsFactory,
        private readonly chartController: ChartController
    ) {
        super();
    }

    public postConstruct() {
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
