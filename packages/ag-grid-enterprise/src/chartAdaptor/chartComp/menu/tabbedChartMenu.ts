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
    _,
    ChartToolbarOptions
} from "ag-grid-community";
import { ChartController } from "../chartController";
import { ChartSettingsPanel } from "./chartSettingsPanel";
import { ChartDataPanel } from "./chartDataPanel";

export class TabbedChartMenu extends Component {

    public static EVENT_TAB_SELECTED = 'tabSelected';
    public static TAB_MAIN = 'settings';
    public static TAB_DATA = 'data';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private tabbedLayout: TabbedLayout;
    private currentChartType: ChartType;

    private panels: ChartToolbarOptions[];
    private tabs: TabbedItem[] = []
    private readonly chartController: ChartController;

    private chartIcons: HTMLElement[] = [];

    constructor(params: {
        controller: ChartController, 
        type: ChartType,
        panels: ChartToolbarOptions[]
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
            const isMain = panelType === TabbedChartMenu.TAB_MAIN;
            const iconCls = isMain ? 'chart' : 'data';
            const panelClass = isMain ? ChartSettingsPanel : ChartDataPanel;

            const { comp, tab } = this.createTab(panelType, iconCls, panelClass);

            this.tabs.push(tab);
            this.addDestroyFunc(() => comp.destroy());
        })

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

        if (this.parentComponent && this.parentComponent.isAlive()) {
            this.parentComponent.destroy();
        }
        super.destroy();
    }
}