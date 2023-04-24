import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { PaddingPanel } from "./paddingPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { BackgroundPanel } from "./backgroundPanel";
import TitlePanel from "./titlePanel";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { FormatPanelOptions } from "../formatPanel";
import { ChartController } from "../../../chartController";

export class ChartPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="chartGroup"></ag-group-component>
        </div>`;

    @RefSelector('chartGroup') private chartGroup: AgGroupComponent;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    private readonly chartOptionsService: ChartOptionsService;
    private readonly chartController: ChartController;
    private readonly isExpandedOnInit: boolean;

    private activePanels: Component[] = [];

    constructor({
        chartController,
        chartOptionsService,
        isExpandedOnInit = false
    }: FormatPanelOptions) {
        super();

        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(ChartPanel.TEMPLATE, { chartGroup: groupParams });

        this.initGroup();
        this.initTitles();
        this.initPaddingPanel();
        this.initBackgroundPanel();
    }

    private initGroup(): void {
        this.chartGroup
            .setTitle(this.chartTranslationService.translate('chart'))
            .toggleGroupExpand(this.isExpandedOnInit)
            .hideEnabledCheckbox(true);
    }

    private initTitles(): void {
        const titlePanelComp = this.createBean(new TitlePanel(this.chartOptionsService));

        this.chartGroup.addItem(titlePanelComp);
        this.activePanels.push(titlePanelComp);
    }

    private initPaddingPanel(): void {
        const paddingPanelComp = this.createBean(new PaddingPanel(this.chartOptionsService, this.chartController));
        this.chartGroup.addItem(paddingPanelComp);
        this.activePanels.push(paddingPanelComp);
    }

    private initBackgroundPanel(): void {
        const backgroundPanelComp = this.createBean(new BackgroundPanel(this.chartOptionsService));
        this.chartGroup.addItem(backgroundPanelComp);
        this.activePanels.push(backgroundPanelComp);
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }

    protected destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}
