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
import { ChartDataPanel } from "./data/chartDataPanel";
import { FormatPanel } from "./format/formatPanel";
import { ChartSettingsPanel } from "./settings/chartSettingsPanel";
import { ChartTranslationService } from "../services/chartTranslationService";
import { ChartOptionsService } from "../services/chartOptionsService";

export class TabbedChartMenu extends Component {
    public static TAB_DATA = 'data';
    public static TAB_FORMAT = 'format';

    private tabbedLayout: TabbedLayout;

    private panels: ChartMenuOptions[];
    private tabs: TabbedItem[] = [];
    private readonly chartController: ChartController;
    private readonly chartOptionsService: ChartOptionsService;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    constructor(params: {
        controller: ChartController,
        type: ChartType,
        panels: ChartMenuOptions[];
        chartOptionsService: ChartOptionsService;
    }) {
        super();

        const { controller, panels, chartOptionsService } = params;

        this.chartController = controller;
        this.chartOptionsService = chartOptionsService;
        this.panels = panels;
    }

    @PostConstruct
    public init(): void {
        this.panels.forEach(panel => {
            const panelType = panel.replace('chart', '').toLowerCase();
            const { comp, tab } = this.createTab(panel, panelType, this.getPanelClass(panelType));

            this.tabs.push(tab);
            this.addDestroyFunc(() => this.destroyBean(comp));
        });

        this.tabbedLayout = new TabbedLayout({
            items: this.tabs,
            cssClass: 'ag-chart-tabbed-menu',
            keepScrollPosition: true
        });
        this.getContext().createBean(this.tabbedLayout);
    }

    private createTab(
        name: ChartMenuOptions,
        title: string,
        TabPanelClass: new (controller: ChartController, chartOptionsService: ChartOptionsService) => Component
    ): { comp: Component, tab: TabbedItem; } {
        const eWrapperDiv = document.createElement('div');
        eWrapperDiv.classList.add('ag-chart-tab', `ag-chart-${title}`);

        const comp = new TabPanelClass(this.chartController, this.chartOptionsService);
        this.getContext().createBean(comp);

        eWrapperDiv.appendChild(comp.getGui());

        const titleEl = document.createElement('div');
        const translatedTitle = this.chartTranslationService.translate(title);
        titleEl.innerText = translatedTitle;

        return {
            comp,
            tab: {
                title: titleEl,
                titleLabel: translatedTitle,
                bodyPromise: AgPromise.resolve(eWrapperDiv),
                getScrollableContainer: () => {
                    const scrollableContainer = eWrapperDiv.querySelector('.ag-scrollable-container');
                    return (scrollableContainer || eWrapperDiv) as HTMLElement;
                },
                name
            }
        };
    }

    public showTab(tab: number) {
        const tabItem = this.tabs[tab];
        this.tabbedLayout.showItem(tabItem);
    }

    public getGui(): HTMLElement {
        return this.tabbedLayout && this.tabbedLayout.getGui();
    }

    protected destroy(): void {
        if (this.parentComponent && this.parentComponent.isAlive()) {
            this.destroyBean(this.parentComponent);
        }
        super.destroy();
    }

    private getPanelClass(panelType: string) {
        switch (panelType) {
            case TabbedChartMenu.TAB_DATA:
                return ChartDataPanel;
            case TabbedChartMenu.TAB_FORMAT:
                return FormatPanel;
            default:
                return ChartSettingsPanel;
        }
    }
}
