// ag-grid-enterprise v21.2.2
import { Component, IComponent, ISideBar } from "ag-grid-community";
export interface IToolPanelChildComp extends IComponent<any> {
    refresh(): void;
}
export declare class SideBarComp extends Component implements ISideBar {
    private eventService;
    private gridOptionsWrapper;
    private sideBarButtonsComp;
    private toolPanelWrappers;
    private static readonly TEMPLATE;
    constructor();
    private postConstruct;
    private onToolPanelButtonClicked;
    private clearDownUi;
    private setSideBarDef;
    private setupToolPanels;
    refresh(): void;
    openToolPanel(key: string | undefined): void;
    private raiseToolPanelVisibleEvent;
    close(): void;
    isToolPanelShowing(): boolean;
    openedItem(): string | null;
    reset(): void;
    private destroyToolPanelWrappers;
    destroy(): void;
}
