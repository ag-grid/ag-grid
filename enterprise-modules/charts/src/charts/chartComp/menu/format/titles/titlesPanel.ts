import type { BeanCollection } from '@ag-grid-community/core';
import { Component, RefPlaceholder } from '@ag-grid-community/core';
import type { AgGroupComponentParams } from '@ag-grid-enterprise/core';
import { AgGroupComponent } from '@ag-grid-enterprise/core';

import type { ChartTranslationService } from '../../../services/chartTranslationService';
import { isCartesian, isPolar } from '../../../utils/seriesTypeMapper';
import { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
import type { FormatPanelOptions } from '../formatPanel';
import { ChartTitlePanel } from './chartTitlePanel';
import { TitlePanel } from './titlePanel';

export class TitlesPanel extends Component {
    private static TEMPLATE /* html */ = `<div>
            <ag-group-component data-ref="titleGroup"></ag-group-component>
        </div>`;

    private chartTranslationService: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslationService = beans.chartTranslationService;
    }
    private readonly titleGroup: AgGroupComponent = RefPlaceholder;

    constructor(private readonly options: FormatPanelOptions) {
        super();
    }

    public postConstruct() {
        const {
            chartMenuParamsFactory,
            chartAxisMenuParamsFactory,
            chartOptionsService,
            seriesType,
            isExpandedOnInit: expanded = false,
            registerGroupComponent,
        } = this.options;
        const axisTitlePanels: TitlePanel[] = [];
        if (isCartesian(seriesType)) {
            const createAxisParamsFactory = (axisType: 'xAxis' | 'yAxis') =>
                this.createManagedBean(
                    new ChartMenuParamsFactory(chartOptionsService.getCartesianAxisThemeOverridesProxy(axisType))
                );
            axisTitlePanels.push(
                this.createManagedBean(new TitlePanel(createAxisParamsFactory('xAxis'), 'horizontalAxisTitle', 'title'))
            );
            axisTitlePanels.push(
                this.createManagedBean(new TitlePanel(createAxisParamsFactory('yAxis'), 'verticalAxisTitle', 'title'))
            );
        } else if (isPolar(seriesType)) {
            axisTitlePanels.push(
                this.createManagedBean(new TitlePanel(chartAxisMenuParamsFactory, 'polarAxisTitle', 'title'))
            );
        }
        const titleGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate('chartTitles'),
            expanded,
            suppressEnabledCheckbox: true,
            items: [
                this.createManagedBean(new ChartTitlePanel(chartMenuParamsFactory, 'chartTitle', 'title')),
                this.createManagedBean(new TitlePanel(chartMenuParamsFactory, 'chartSubtitle', 'subtitle')),
                ...axisTitlePanels,
            ],
        };
        this.setTemplate(TitlesPanel.TEMPLATE, [AgGroupComponent], { titleGroup: titleGroupParams });
        registerGroupComponent(this.titleGroup);
    }
}
