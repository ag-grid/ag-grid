import type { BeanCollection, ChartToolPanelMenuOptions } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { ExtraPaddingDirection } from '../chartProxies/chartProxy';
import type { ChartMenuContext } from './chartMenuContext';
export declare class ChartMenu extends Component {
    private readonly eChartContainer;
    private readonly eMenuPanelContainer;
    private readonly chartMenuContext;
    private chartMenuService;
    private chartMenuListFactory;
    private environment;
    wireBeans(beans: BeanCollection): void;
    private readonly chartController;
    private buttons;
    private panels;
    private defaultPanel;
    private chartToolbar;
    private tabbedMenu;
    private menuPanel?;
    private menuVisible;
    private chartToolbarOptions;
    constructor(eChartContainer: HTMLElement, eMenuPanelContainer: HTMLElement, chartMenuContext: ChartMenuContext);
    postConstruct(): void;
    isVisible(): boolean;
    getExtraPaddingDirections(): ExtraPaddingDirection[];
    private refreshToolbarAndPanels;
    private initToolbarOptionsAndPanels;
    private updateToolbar;
    private createMenuPanel;
    private showContainer;
    showMenu(params?: {
        /**
         * Menu panel to show. If empty, shows the existing menu, or creates the default menu if menu panel has not been created
         */
        panel?: ChartToolPanelMenuOptions;
        eventSource?: HTMLElement;
        suppressFocus?: boolean;
    }): void;
    hideMenu(): void;
    private refreshMenuClasses;
    private showMenuList;
    destroy(): void;
}
