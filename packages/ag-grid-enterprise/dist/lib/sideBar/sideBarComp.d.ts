// ag-grid-enterprise v20.1.0
import { Component, GridPanel, IComponent, ISideBar } from "ag-grid-community";
export interface IToolPanelChildComp extends IComponent<any> {
    refresh(): void;
}
export declare class SideBarComp extends Component implements ISideBar {
    private context;
    private eventService;
    private gridOptionsWrapper;
    private componentResolver;
    private sideBarButtonsComp;
    private panelComps;
    private static readonly TEMPLATE;
    constructor();
    /** @deprecated in v19, we can drop in v20 */
    getPreferredWidth(): number;
    registerGridComp(gridPanel: GridPanel): void;
    private postConstruct;
    refresh(): void;
    setVisible(show: boolean): void;
    openToolPanel(key: string): void;
    close(): void;
    isToolPanelShowing(): boolean;
    getActiveToolPanelItem(): string | null;
    openedItem(): string | null;
    reset(): void;
}
