import {
    AgPromise,
    Autowired,
    ChartMenuOptions,
    Component,
    PostConstruct,
    TabbedItem,
    TabbedLayout
} from "@ag-grid-community/core";
import { ChartDataPanel } from "./data/chartDataPanel";
import { FormatPanel } from "./format/formatPanel";
import { ChartSettingsPanel } from "./settings/chartSettingsPanel";
import { ChartTranslationKey, ChartTranslationService } from "../services/chartTranslationService";
import { ChartMenuContext } from "./chartMenuContext";
import { ChartMenuService } from "../services/chartMenuService";

export class TabbedChartMenu extends Component {
    public static EVENT_CLOSED = 'closed';
    public static TAB_DATA = 'data';
    public static TAB_FORMAT = 'format';

    private tabbedLayout: TabbedLayout;
    private tabs: TabbedItem[] = [];
    private eventSource?: HTMLElement;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuService') private chartMenuService: ChartMenuService;

    constructor(
        private readonly panels: ChartMenuOptions[],
        private readonly chartMenuContext: ChartMenuContext
    ) {
        super();
    }

    @PostConstruct
    public init(): void {
        this.panels.forEach(panel => {
            const panelType = panel.replace('chart', '').toLowerCase() as 'settings' | 'data' | 'format';
            const panelComp = this.createPanel(panelType);
            const tabItem = this.createTab(panel, panelType, panelComp);

            this.tabs.push(tabItem);
            this.addDestroyFunc(() => this.destroyBean(panelComp));
        });

        this.tabbedLayout = new TabbedLayout({
            items: this.tabs,
            cssClass: 'ag-chart-tabbed-menu',
            keepScrollPosition: true,
            suppressFocusBodyOnOpen: true,
            suppressTrapFocus: true,
            enableCloseButton: !this.chartMenuService.isLegacyFormat(),
            closeButtonAriaLabel: this.chartTranslationService.translate('ariaChartMenuClose'),
            onCloseClicked: () => {
                this.eventSource?.focus({ preventScroll: true });
                this.dispatchEvent({ type: TabbedChartMenu.EVENT_CLOSED });
            }
        });
        this.createBean(this.tabbedLayout);
    }

    private createTab(
        name: ChartMenuOptions,
        title: ChartTranslationKey,
        panelComp: Component,
    ): TabbedItem {
        const eWrapperDiv = document.createElement('div');
        eWrapperDiv.classList.add('ag-chart-tab', `ag-chart-${title}`);

        this.createBean(panelComp);

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

    public showMenu(eventSource?: HTMLElement, suppressFocus?: boolean): void {
        this.eventSource = eventSource;
        if (!suppressFocus) {
            this.tabbedLayout?.focusHeader(true);
        }
    }

    protected destroy(): void {
        if (this.parentComponent && this.parentComponent.isAlive()) {
            this.destroyBean(this.parentComponent);
        }
        super.destroy();
    }

    private createPanel(panelType: string): Component {
        const { chartController, chartOptionsService } = this.chartMenuContext;
        switch (panelType) {
            case TabbedChartMenu.TAB_DATA:
                return new ChartDataPanel(chartController, chartOptionsService);
            case TabbedChartMenu.TAB_FORMAT:
                return new FormatPanel(this.chartMenuContext);
            default:
                return new ChartSettingsPanel(chartController);
        }
    }
}
