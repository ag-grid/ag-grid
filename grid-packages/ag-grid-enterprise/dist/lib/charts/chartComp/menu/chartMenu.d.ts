import { ChartToolPanelMenuOptions, Component } from "ag-grid-community";
import { ChartController } from "../chartController";
import { ChartOptionsService } from "../services/chartOptionsService";
import { ExtraPaddingDirection } from "../chartProxies/chartProxy";
export declare class ChartMenu extends Component {
    private readonly eChartContainer;
    private readonly eMenuPanelContainer;
    private readonly chartController;
    private readonly chartOptionsService;
    private chartTranslationService;
    static EVENT_DOWNLOAD_CHART: string;
    private buttons;
    private panels;
    private defaultPanel;
    private buttonListenersDestroyFuncs;
    private static TEMPLATE;
    private eMenu;
    private eHideButton;
    private eHideButtonIcon;
    private tabbedMenu;
    private menuPanel?;
    private menuVisible;
    private chartToolbarOptions;
    constructor(eChartContainer: HTMLElement, eMenuPanelContainer: HTMLElement, chartController: ChartController, chartOptionsService: ChartOptionsService);
    private postConstruct;
    isVisible(): boolean;
    getExtraPaddingDirections(): ExtraPaddingDirection[];
    private getToolbarOptions;
    private toggleDetached;
    private createButtons;
    private saveChart;
    private createMenuPanel;
    private showContainer;
    private toggleMenu;
    showMenu(
    /**
     * Menu panel to show. If empty, shows the existing menu, or creates the default menu if menu panel has not been created
     */
    panel?: ChartToolPanelMenuOptions, 
    /**
     * Whether to animate the menu opening
     */
    animate?: boolean): void;
    hideMenu(): void;
    private refreshMenuClasses;
    private showParent;
    private hideParent;
    protected destroy(): void;
}
