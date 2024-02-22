import {
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct
} from "@ag-grid-community/core";
import { PaddingPanel } from "./paddingPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { BackgroundPanel } from "./backgroundPanel";
import TitlePanel from "./titlePanel";
import { ChartOptionsProxy } from "../../../services/chartOptionsService";
import { FormatPanelOptions } from "../formatPanel";
import { ChartController } from "../../../chartController";

export class ChartPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="chartGroup"></ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    private readonly chartOptionsProxy: ChartOptionsProxy;
    private readonly chartController: ChartController;
    private readonly isExpandedOnInit: boolean;

    constructor({
        chartController,
        chartOptionsService,
        isExpandedOnInit = false
    }: FormatPanelOptions) {
        super();

        this.chartController = chartController;
        this.chartOptionsProxy = chartOptionsService.getChartOptionProxy();
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        const chartGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate('chart'),
            expanded: this.isExpandedOnInit,
            suppressEnabledCheckbox: true,
            items: [
                this.createManagedBean(new TitlePanel(this.chartOptionsProxy)),
                this.createManagedBean(new PaddingPanel(this.chartOptionsProxy, this.chartController)),
                this.createManagedBean(new BackgroundPanel(this.chartOptionsProxy))
            ]
        };
        this.setTemplate(ChartPanel.TEMPLATE, { chartGroup: chartGroupParams });
    }
}
