import { Autowired, Component, PostConstruct } from '@ag-grid-community/core';
import { AgGroupComponent, AgGroupComponentParams } from '@ag-grid-enterprise/core';

import { ChartTranslationService } from '../../../services/chartTranslationService';
import { isCartesian, isPolar } from '../../../utils/seriesTypeMapper';
import { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
import { FormatPanelOptions } from '../formatPanel';
import { ChartTitlePanel } from './chartTitlePanel';
import { TitlePanel } from './titlePanel';

export class TitlesPanel extends Component {
    private static TEMPLATE /* html */ = `<div>
            <ag-group-component data-ref="titleGroup"></ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    private readonly titleGroup: AgGroupComponent;

    constructor(private readonly options: FormatPanelOptions) {
        super();
    }

    @PostConstruct
    private init() {
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
