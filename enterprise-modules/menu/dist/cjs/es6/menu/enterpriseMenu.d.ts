import { AgEvent, BeanStub, Column, IMenuFactory, IAfterGuiAttachedParams, ContainerType } from '@ag-grid-community/core';
export interface TabSelectedEvent extends AgEvent {
    key: string;
}
export declare class EnterpriseMenuFactory extends BeanStub implements IMenuFactory {
    private popupService;
    private focusService;
    private ctrlsService;
    private lastSelectedTab;
    private activeMenu;
    hideActiveMenu(): void;
    showMenuAfterMouseEvent(column: Column, mouseEvent: MouseEvent, defaultTab?: string): void;
    showMenuAfterButtonClick(column: Column, eventSource: HTMLElement, containerType: ContainerType, defaultTab?: string, restrictToTabs?: string[]): void;
    showMenu(column: Column, positionCallback: (menu: EnterpriseMenu) => void, containerType: ContainerType, defaultTab?: string, restrictToTabs?: string[], eventSource?: HTMLElement): void;
    isMenuEnabled(column: Column): boolean;
}
export declare class EnterpriseMenu extends BeanStub {
    static EVENT_TAB_SELECTED: string;
    static TAB_FILTER: string;
    static TAB_GENERAL: string;
    static TAB_COLUMNS: string;
    static TABS_DEFAULT: string[];
    static MENU_ITEM_SEPARATOR: string;
    private columnModel;
    private filterManager;
    private gridApi;
    private columnApi;
    private menuItemMapper;
    private rowModel;
    private focusService;
    private tabbedLayout;
    private hidePopupFunc;
    private column;
    private mainMenuList;
    private columnSelectPanel;
    private tabItemFilter;
    private tabItemGeneral;
    private tabItemColumns;
    private initialSelection;
    private tabFactories;
    private includeChecks;
    private restrictTo?;
    constructor(column: Column, initialSelection: string, restrictTo?: string[]);
    init(): void;
    private getTabsToCreate;
    private isModuleLoaded;
    private isValidMenuTabItem;
    private isNotSuppressed;
    private createTab;
    showTabBasedOnPreviousSelection(): void;
    showTab(toShow: string): void;
    private onTabItemClicked;
    private activateTab;
    private getMenuItems;
    private getDefaultMenuOptions;
    private createMainPanel;
    private onHidePopup;
    private createFilterPanel;
    private createColumnsPanel;
    afterGuiAttached(params: IAfterGuiAttachedParams): void;
    getGui(): HTMLElement;
}
