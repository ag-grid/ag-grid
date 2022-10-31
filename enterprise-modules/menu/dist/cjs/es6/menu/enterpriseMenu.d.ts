import { AgEvent, BeanStub, Column, ColumnMenuTab, IMenuFactory, IAfterGuiAttachedParams, ContainerType } from '@ag-grid-community/core';
export interface TabSelectedEvent extends AgEvent {
    key: string;
}
export declare class EnterpriseMenuFactory extends BeanStub implements IMenuFactory {
    private readonly popupService;
    private readonly focusService;
    private readonly headerNavigationService;
    private readonly ctrlsService;
    private readonly columnModel;
    private lastSelectedTab;
    private activeMenu;
    hideActiveMenu(): void;
    showMenuAfterMouseEvent(column: Column, mouseEvent: MouseEvent, defaultTab?: string): void;
    showMenuAfterButtonClick(column: Column, eventSource: HTMLElement, containerType: ContainerType, defaultTab?: string, restrictToTabs?: ColumnMenuTab[]): void;
    showMenu(column: Column, positionCallback: (menu: EnterpriseMenu) => void, containerType: ContainerType, defaultTab?: string, restrictToTabs?: ColumnMenuTab[], eventSource?: HTMLElement): void;
    isMenuEnabled(column: Column): boolean;
}
export declare class EnterpriseMenu extends BeanStub {
    static EVENT_TAB_SELECTED: string;
    static TAB_FILTER: 'filterMenuTab';
    static TAB_GENERAL: 'generalMenuTab';
    static TAB_COLUMNS: 'columnsMenuTab';
    static TABS_DEFAULT: ColumnMenuTab[];
    static MENU_ITEM_SEPARATOR: string;
    private readonly columnModel;
    private readonly filterManager;
    private readonly gridApi;
    private readonly columnApi;
    private readonly menuItemMapper;
    private readonly rowModel;
    private readonly focusService;
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
    constructor(column: Column, initialSelection: string, restrictTo?: ColumnMenuTab[]);
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
