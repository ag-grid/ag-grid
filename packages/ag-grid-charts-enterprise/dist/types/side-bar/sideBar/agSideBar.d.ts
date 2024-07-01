import type { BeanCollection, ComponentSelector, ISideBar, IToolPanel, SideBarDef, SideBarState } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
export declare class AgSideBar extends Component implements ISideBar {
    private focusService;
    private filterManager?;
    private sideBarService;
    wireBeans(beans: BeanCollection): void;
    private readonly sideBarButtons;
    private toolPanelWrappers;
    private sideBar;
    private position;
    constructor();
    postConstruct(): void;
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
    destroy(): void;
}
export declare const AgSideBarSelector: ComponentSelector;
