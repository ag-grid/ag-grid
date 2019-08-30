import {
    _,
    Autowired,
    ChartMenuOptions,
    ChartType,
    Component,
    PostConstruct,
    Promise,
    TabbedItem,
    TabbedLayout
} from "ag-grid-community";
import {ChartController} from "../chartController";
import {ChartDataPanel} from "./data/chartDataPanel";
import {ChartFormattingPanel} from "./format/chartFormatingPanel";
import {ChartSettingsPanel} from "./settings/chartSettingsPanel";
import {ChartTranslator} from "../chartTranslator";

export class TabbedChartMenu extends Component {

    public static EVENT_TAB_SELECTED = 'tabSelected';
    public static TAB_MAIN = 'settings';
    public static TAB_DATA = 'data';
    public static TAB_FORMAT = 'format';

    private tabbedLayout: TabbedLayout;
    private currentChartType: ChartType;

    private panels: ChartMenuOptions[];
    private tabs: TabbedItem[] = [];
    private readonly chartController: ChartController;

    private chartIcons: { [key in string]: HTMLElement } = {};

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    constructor(params: {
        controller: ChartController,
        type: ChartType,
        panels: ChartMenuOptions[]
    }) {
        super();

        const { controller, type, panels } = params;

        this.chartController = controller;
        this.currentChartType = type;
        this.panels = panels;
    }

    @PostConstruct
    public init(): void {
        this.panels.forEach(panel => {
            const panelType = panel.replace('chart', '').toLowerCase();
            const { comp, tab } = this.createTab(panel, panelType, this.getPanelClass(panelType));

            this.tabs.push(tab);
            this.addDestroyFunc(() => comp.destroy());
        });

        this.tabbedLayout = new TabbedLayout({
            items: this.tabs,
            cssClass: 'ag-chart-tabbed-menu'
        });
    }

    private createTab(
        name: ChartMenuOptions,
        title: string,
        ChildClass: new (controller: ChartController) => Component
    ): {comp: Component, tab: TabbedItem} {
        const eWrapperDiv = document.createElement('div');
        _.addCssClass(eWrapperDiv, `ag-chart-${title}`);

        const comp = new ChildClass(this.chartController);
        this.getContext().wireBean(comp);

        eWrapperDiv.appendChild(comp.getGui());

        const titleEl = document.createElement('div');
        titleEl.innerText = this.chartTranslator.translate(title);

        return {
            comp,
            tab: {
                title: titleEl,
                bodyPromise: Promise.resolve(eWrapperDiv),
                name
            }
        };
    }

    public getMinDimensions(): {width: number, height: number} {
        return this.tabbedLayout.getMinDimensions();
    }

    public updateCurrentChartType(chartType: ChartType) {
        _.removeCssClass(this.chartIcons[this.currentChartType], 'ag-selected');
        this.currentChartType = chartType;
        _.addCssClass(this.chartIcons[chartType], 'ag-selected');
    }

    public showTab(tab: number) {
        const tabItem = this.tabs[tab];
        this.tabbedLayout.showItem(tabItem);
    }

    public getGui(): HTMLElement {
        return this.tabbedLayout && this.tabbedLayout.getGui();
    }

    public destroy(): void {
        if (this.parentComponent && this.parentComponent.isAlive()) {
            this.parentComponent.destroy();
        }
        super.destroy();
    }

    private getPanelClass(panelType: string) {
        const isDataPanel = panelType === TabbedChartMenu.TAB_DATA;
        const isFormatPanel = panelType === TabbedChartMenu.TAB_FORMAT;
        return isDataPanel ? ChartDataPanel : (isFormatPanel ? ChartFormattingPanel : ChartSettingsPanel);
    }
}
