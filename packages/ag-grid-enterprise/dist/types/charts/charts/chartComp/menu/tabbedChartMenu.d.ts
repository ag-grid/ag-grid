import type { BeanCollection, ChartToolPanelMenuOptions } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { ChartMenuContext } from './chartMenuContext';
export type TabbedChartMenuEvent = 'closed';
export declare class TabbedChartMenu extends Component<TabbedChartMenuEvent> {
    private readonly panels;
    private readonly chartMenuContext;
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    static TAB_DATA: string;
    static TAB_FORMAT: string;
    private tabbedLayout;
    private tabs;
    private eventSource?;
    constructor(panels: ChartToolPanelMenuOptions[], chartMenuContext: ChartMenuContext);
    postConstruct(): void;
    private createTab;
    showTab(tab: number): void;
    getGui(): HTMLElement;
    showMenu(eventSource?: HTMLElement, suppressFocus?: boolean): void;
    destroy(): void;
    private createPanel;
}
