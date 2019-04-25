import {
    Autowired,
    Component,
    Dialog,
    ChartType,
    GridOptionsWrapper,
    TabbedLayout,
    PostConstruct,
    TabbedItem,
    Promise,
    _
} from "ag-grid-community";
import { ChartController } from "../chartController";
import { ChartSettingsPanel } from "./chartSettingsPanel";
import { ChartDataPanel } from "./chartDataPanel";

export class TabbedChartMenu extends Component {

    public static EVENT_TAB_SELECTED = 'tabSelected';
    public static TAB_MAIN = 'settings';
    public static TAB_DATA = 'data';
    public static MENU_ITEM_SEPARATOR = 'separator';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private tabbedLayout: TabbedLayout;
    private currentChartType: ChartType;

    private chartSettingsPanel: ChartSettingsPanel;
    private chartDataPanel: ChartDataPanel;

    private tabs: TabbedItem[];
    private readonly chartController: ChartController;

    private chartIcons: HTMLElement[] = [];

    constructor(chartController: ChartController, currentChartType: ChartType) {
        super();
        this.chartController = chartController;
        this.currentChartType = currentChartType;
    }

    @PostConstruct
    public init(): void {
        const { comp: settingsComp, tab: mainTab } = this.createTab(TabbedChartMenu.TAB_MAIN, 'chart', ChartSettingsPanel);
        const { comp: dataComp, tab: columnsTab } = this.createTab(TabbedChartMenu.TAB_DATA, 'data', ChartDataPanel);

        this.chartSettingsPanel = settingsComp as ChartSettingsPanel;
        this.chartDataPanel = dataComp as ChartDataPanel;

        this.tabs = [mainTab, columnsTab];

        this.tabbedLayout = new TabbedLayout({
            items: this.tabs,
            cssClass: 'ag-chart-tabbed-menu'
        });
    }

    public getMinDimensions(): {width: number, height: number} {
        return this.tabbedLayout.getMinDimensions();
    }

    private createTab(
        name: string,
        iconName: string, 
        ChildClass: new (controller: ChartController) => Component
    ): {comp: Component, tab: TabbedItem} {
        const eWrapperDiv = document.createElement('div');
        _.addCssClass(eWrapperDiv, `ag-chart-${name}`);

        const comp = new ChildClass(this.chartController);
        this.getContext().wireBean(comp);
        eWrapperDiv.appendChild(comp.getGui());

        return {
            comp,
            tab: {
                title: _.createIconNoSpan(iconName, this.gridOptionsWrapper, null),
                bodyPromise: Promise.resolve(eWrapperDiv),
                name,
                afterAttachedCallback: () => {
                    (this.parentComponent as Dialog).setTitle(`Chart ${_.capitalise(name)}`)
                }
            }
        }
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
        if (this.chartSettingsPanel) {
            this.chartSettingsPanel.destroy();
        }

        if (this.chartDataPanel) {
            this.chartDataPanel.destroy();
        }

        if (this.parentComponent && this.parentComponent.isAlive()) {
            this.parentComponent.destroy();
        }
        super.destroy();
    }
}