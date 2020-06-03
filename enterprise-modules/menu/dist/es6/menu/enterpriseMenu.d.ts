import { AgEvent, BeanStub, Column, IMenuFactory } from "@ag-grid-community/core";
export interface TabSelectedEvent extends AgEvent {
    key: string;
}
export declare class EnterpriseMenuFactory extends BeanStub implements IMenuFactory {
    private popupService;
    private gridOptionsWrapper;
    private focusController;
    private lastSelectedTab;
    private activeMenu;
    hideActiveMenu(): void;
    showMenuAfterMouseEvent(column: Column, mouseEvent: MouseEvent, defaultTab?: string): void;
    showMenuAfterButtonClick(column: Column, eventSource: HTMLElement, defaultTab?: string, restrictToTabs?: string[]): void;
    showMenu(column: Column, positionCallback: (menu: EnterpriseMenu) => void, defaultTab?: string, restrictToTabs?: string[], eventSource?: HTMLElement): void;
    isMenuEnabled(column: Column): boolean;
}
export declare class EnterpriseMenu extends BeanStub {
    static EVENT_TAB_SELECTED: string;
    static TAB_FILTER: string;
    static TAB_GENERAL: string;
    static TAB_COLUMNS: string;
    static TABS_DEFAULT: string[];
    static MENU_ITEM_SEPARATOR: string;
    private columnController;
    private filterManager;
    private gridApi;
    private columnApi;
    private gridOptionsWrapper;
    private menuItemMapper;
    private rowModel;
    private focusController;
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
    private timeOfLastColumnChange;
    constructor(column: Column, initialSelection: string, restrictTo?: string[]);
    getMinDimensions(): {
        width: number;
        height: number;
    };
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
    afterGuiAttached(params: any): void;
    getGui(): HTMLElement;
    private onDisplayedColumnsChanged;
}
