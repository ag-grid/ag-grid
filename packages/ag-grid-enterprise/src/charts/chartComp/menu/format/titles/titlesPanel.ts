import { RefPlaceholder } from 'ag-stack';

import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import { AgGroupComponentSelector } from '../../../../../agStack/agGroupComponent';
import type { GroupComponent, GroupComponentParams } from '../../../../../widgets/gridEnterpriseWidgetTypes';
import type { ChartTranslationService } from '../../../services/chartTranslationService';
import { isCartesian, isPolar } from '../../../utils/seriesTypeMapper';
import { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
import type { FormatPanelOptions } from '../formatPanel';
import { ChartTitlePanel } from './chartTitlePanel';
import { TitlePanel } from './titlePanel';

export class TitlesPanel extends Component {
    private chartTranslation: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslation = beans.chartTranslation as ChartTranslationService;
    }
    private readonly titleGroup: GroupComponent = RefPlaceholder;

    constructor(private readonly options: FormatPanelOptions) {
        super();
    }

    public postConstruct() {
        const {
            chartMenuParamsFactory,
            chartOptionsService,
            seriesType,
            isExpandedOnInit: expanded = false,
            registerGroupComponent,
        } = this.options;
        const axisTitlePanels: TitlePanel[] = [];
        if (isCartesian(seriesType) && seriesType !== 'pyramid') {
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
            // Of the two polar axes only the radius axis has a title.
            const radiusAxisParamsFactory = this.createManagedBean(
                new ChartMenuParamsFactory(chartOptionsService.getPolarAxisThemeOverridesProxy('radius', 'thisAxis'))
            );
            axisTitlePanels.push(
                this.createManagedBean(new TitlePanel(radiusAxisParamsFactory, 'polarAxisTitle', 'title'))
            );
        }
        const titleGroupParams: GroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.chartTranslation.translate('chartTitles'),
            expanded,
            suppressEnabledCheckbox: true,
            items: [
                this.createManagedBean(new ChartTitlePanel(chartMenuParamsFactory, 'chartTitle', 'title')),
                this.createManagedBean(new TitlePanel(chartMenuParamsFactory, 'chartSubtitle', 'subtitle')),
                ...axisTitlePanels,
            ],
        };
        this.setTemplate(
            /* html */ `<div>
            <ag-group-component data-ref="titleGroup"></ag-group-component>
        </div>`,
            [AgGroupComponentSelector],
            { titleGroup: titleGroupParams }
        );
        registerGroupComponent(this.titleGroup);
    }
}
