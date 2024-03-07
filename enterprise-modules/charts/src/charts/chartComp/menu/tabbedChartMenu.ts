import {
    AgPromise,
    Autowired,
    ChartMenuOptions,
    ChartType,
    Component,
    PostConstruct,
    TabbedItem,
    TabbedLayout
} from "@ag-grid-community/core";
import { ChartController } from "../chartController";
import { ChartMenuUtils } from './chartMenuUtils';
import { ChartDataPanel } from "./data/chartDataPanel";
import { FormatPanel } from "./format/formatPanel";
import { ChartSettingsPanel } from "./settings/chartSettingsPanel";
import { ChartTranslationKey, ChartTranslationService } from "../services/chartTranslationService";
import { ChartOptionsService } from "../services/chartOptionsService";

export class TabbedChartMenu extends Component {
    public static TAB_DATA = 'data';
    public static TAB_FORMAT = 'format';

    private tabbedLayout: TabbedLayout;

    private panels: ChartMenuOptions[];
    private tabs: TabbedItem[] = [];
    private readonly chartController: ChartController;
    private readonly chartOptionsService: ChartOptionsService;
    private readonly chartMenuUtils: ChartMenuUtils;
    private readonly chartAxisMenuUtils: ChartMenuUtils;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    constructor(params: {
        type: ChartType,
        panels: ChartMenuOptions[];
        chartController: ChartController,
        chartOptionsService: ChartOptionsService;
        chartMenuUtils: ChartMenuUtils;
        chartAxisMenuUtils: ChartMenuUtils;
    }) {
        super();

        const { chartController, chartMenuUtils, chartAxisMenuUtils, panels, chartOptionsService } = params;

        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.chartMenuUtils = chartMenuUtils;
        this.chartAxisMenuUtils = chartAxisMenuUtils;
        this.panels = panels;
    }

    @PostConstruct
    public init(): void {
        this.panels.forEach(panel => {
            const panelType = panel.replace('chart', '').toLowerCase() as 'settings' | 'data' | 'format';
            const panelComp = this.createPanel(
                panelType,
                this.chartController,
                this.chartOptionsService,
                this.chartMenuUtils,
                this.chartAxisMenuUtils,
            );
            const tabItem = this.createTab(panel, panelType, panelComp);

            this.tabs.push(tabItem);
            this.addDestroyFunc(() => this.destroyBean(panelComp));
        });

        this.tabbedLayout = new TabbedLayout({
            items: this.tabs,
            cssClass: 'ag-chart-tabbed-menu',
            keepScrollPosition: true,
            suppressFocusBodyOnOpen: true,
            suppressTrapFocus: true
        });
        this.getContext().createBean(this.tabbedLayout);
    }

    private createTab(
        name: ChartMenuOptions,
        title: ChartTranslationKey,
        panelComp: Component,
    ): TabbedItem {
        const eWrapperDiv = document.createElement('div');
        eWrapperDiv.classList.add('ag-chart-tab', `ag-chart-${title}`);

        this.getContext().createBean(panelComp);

        eWrapperDiv.appendChild(panelComp.getGui());

        const titleEl = document.createElement('div');
        const translatedTitle = this.chartTranslationService.translate(title);
        titleEl.innerText = translatedTitle;

        return {
            title: titleEl,
            titleLabel: translatedTitle,
            bodyPromise: AgPromise.resolve(eWrapperDiv),
            getScrollableContainer: () => {
                const scrollableContainer = eWrapperDiv.querySelector('.ag-scrollable-container');
                return (scrollableContainer || eWrapperDiv) as HTMLElement;
            },
            name
        };
    }

    public showTab(tab: number) {
        const tabItem = this.tabs[tab];
        this.tabbedLayout.showItem(tabItem);
    }

    public getGui(): HTMLElement {
        return this.tabbedLayout && this.tabbedLayout.getGui();
    }

    public focusHeader(): void {
        this.tabbedLayout?.focusHeader(true);
    }

    protected destroy(): void {
        if (this.parentComponent && this.parentComponent.isAlive()) {
            this.destroyBean(this.parentComponent);
        }
        super.destroy();
    }

    private createPanel(
        panelType: string,
        chartController: ChartController,
        chartOptionsService: ChartOptionsService,
        chartMenuUtils: ChartMenuUtils,
        chartAxisMenuUtils: ChartMenuUtils,
    ): Component {
        switch (panelType) {
            case TabbedChartMenu.TAB_DATA:
                return new ChartDataPanel(chartController, chartOptionsService);
            case TabbedChartMenu.TAB_FORMAT:
                return new FormatPanel(chartController, chartOptionsService, chartMenuUtils, chartAxisMenuUtils);
            default:
                return new ChartSettingsPanel(chartController);
        }
    }
}
