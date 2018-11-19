// ag-grid-enterprise v19.1.3
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
//# sourceMappingURL=sideBarComp.d.ts.map