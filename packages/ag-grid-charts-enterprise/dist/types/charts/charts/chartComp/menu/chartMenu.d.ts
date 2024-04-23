import { ChartToolPanelMenuOptions, Component } from "ag-grid-community";
import { ExtraPaddingDirection } from "../chartProxies/chartProxy";
import { ChartMenuContext } from "./chartMenuContext";
export declare class ChartMenu extends Component {
    private readonly eChartContainer;
    private readonly eMenuPanelContainer;
    private readonly chartMenuContext;
    private chartMenuService;
    private chartMenuListFactory;
    private readonly chartController;
    private buttons;
    private panels;
    private defaultPanel;
    private static TEMPLATE;
    private eHideButton;
    private eHideButtonIcon;
    private chartToolbar;
    private tabbedMenu;
    private menuPanel?;
    private menuVisible;
    private chartToolbarOptions;
    private legacyFormat;
    constructor(eChartContainer: HTMLElement, eMenuPanelContainer: HTMLElement, chartMenuContext: ChartMenuContext);
    private postConstruct;
    isVisible(): boolean;
    getExtraPaddingDirections(): ExtraPaddingDirection[];
    private createLegacyToggleButton;
    private refreshToolbarAndPanels;
    private initToolbarOptionsAndPanels;
    private updateToolbar;
    private createMenuPanel;
    private showContainer;
    private toggleMenu;
    showMenu(params: {
        /**
         * Menu panel to show. If empty, shows the existing menu, or creates the default menu if menu panel has not been created
         */
        panel?: ChartToolPanelMenuOptions;
        /**
         * Whether to animate the menu opening
         */
        animate?: boolean;
        eventSource?: HTMLElement;
        suppressFocus?: boolean;
    }): void;
    hideMenu(animate?: boolean): void;
    private refreshMenuClasses;
    private showParent;
    private hideParent;
    private showMenuList;
    protected destroy(): void;
}
