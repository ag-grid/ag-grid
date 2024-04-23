import { Component, ISideBar, IToolPanel, SideBarDef, SideBarState } from "ag-grid-community";
export declare class SideBarComp extends Component implements ISideBar {
    private focusService;
    private filterManager;
    private sideBarService;
    private sideBarButtonsComp;
    private toolPanelWrappers;
    private sideBar;
    private position;
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
    setDisplayed(displayed: boolean, options?: {
        skipAriaHidden?: boolean | undefined;
    } | undefined): void;
    getState(): SideBarState;
    private createToolPanelsAndSideButtons;
    private validateDef;
    private createToolPanelAndSideButton;
    refresh(): void;
    openToolPanel(key: string | undefined, source?: 'sideBarButtonClicked' | 'sideBarInitializing' | 'api'): void;
    getToolPanelInstance(key: string): IToolPanel | undefined;
    private raiseToolPanelVisibleEvent;
    close(source?: 'sideBarButtonClicked' | 'sideBarInitializing' | 'api'): void;
    isToolPanelShowing(): boolean;
    openedItem(): string | null;
    private onSideBarUpdated;
    private destroyToolPanelWrappers;
    protected destroy(): void;
}
