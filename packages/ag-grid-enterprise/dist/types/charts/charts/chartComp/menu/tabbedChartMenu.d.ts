import { ChartMenuOptions, Component } from "ag-grid-community";
import { ChartMenuContext } from "./chartMenuContext";
export declare class TabbedChartMenu extends Component {
    private readonly panels;
    private readonly chartMenuContext;
    static EVENT_CLOSED: string;
    static TAB_DATA: string;
    static TAB_FORMAT: string;
    private tabbedLayout;
    private tabs;
    private eventSource?;
    private chartTranslationService;
    private chartMenuService;
    constructor(panels: ChartMenuOptions[], chartMenuContext: ChartMenuContext);
    init(): void;
    private createTab;
    showTab(tab: number): void;
    getGui(): HTMLElement;
    showMenu(eventSource?: HTMLElement, suppressFocus?: boolean): void;
    protected destroy(): void;
    private createPanel;
}
