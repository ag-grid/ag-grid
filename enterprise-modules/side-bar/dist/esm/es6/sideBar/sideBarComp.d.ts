import { Component, ISideBar, IToolPanel, SideBarDef } from "@ag-grid-community/core";
export declare class SideBarComp extends Component implements ISideBar {
    private gridApi;
    private focusService;
    private sideBarButtonsComp;
    private toolPanelWrappers;
    private sideBar;
    private static readonly TEMPLATE;
    constructor();
    private postConstruct;
    protected onTabKeyDown(e: KeyboardEvent): void;
    protected handleKeyDown(e: KeyboardEvent): void;
    private onToolPanelButtonClicked;
    private clearDownUi;
    private setSideBarDef;
    getDef(): SideBarDef | undefined;
    setSideBarPosition(position?: 'left' | 'right'): this;
    private setupToolPanels;
    refresh(): void;
    openToolPanel(key: string | undefined): void;
    getToolPanelInstance(key: string): IToolPanel | undefined;
    private raiseToolPanelVisibleEvent;
    close(): void;
    isToolPanelShowing(): boolean;
    openedItem(): string | null;
    private destroyToolPanelWrappers;
    protected destroy(): void;
}
