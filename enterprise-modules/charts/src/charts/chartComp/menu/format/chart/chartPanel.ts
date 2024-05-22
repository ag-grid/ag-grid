import { Autowired, Component, PostConstruct, RefPlaceholder } from '@ag-grid-community/core';
import { AgGroupComponent, AgGroupComponentParams } from '@ag-grid-enterprise/core';

import { ChartTranslationService } from '../../../services/chartTranslationService';
import { FormatPanelOptions } from '../formatPanel';
import { BackgroundPanel } from './backgroundPanel';
import { PaddingPanel } from './paddingPanel';

export class ChartPanel extends Component {
    private static TEMPLATE /* html */ = `<div>
            <ag-group-component data-ref="chartGroup"></ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    private readonly chartGroup: AgGroupComponent = RefPlaceholder;

    constructor(private readonly options: FormatPanelOptions) {
        super();
    }

    @PostConstruct
    private init() {
        const {
            chartController,
            chartMenuParamsFactory,
            isExpandedOnInit: expanded,
            registerGroupComponent,
        } = this.options;

        const chartGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate('chartStyle'),
            expanded,
            suppressEnabledCheckbox: true,
            items: [
                this.createManagedBean(new PaddingPanel(chartMenuParamsFactory, chartController)),
                this.createManagedBean(new BackgroundPanel(chartMenuParamsFactory)),
            ],
        };
        this.setTemplate(ChartPanel.TEMPLATE, [AgGroupComponent], { chartGroup: chartGroupParams });
        registerGroupComponent(this.chartGroup);
    }
}
