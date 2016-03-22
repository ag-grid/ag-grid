// ag-grid-enterprise v4.0.7
import { IMenuFactory } from "ag-grid/main";
import { Column } from "ag-grid/main";
export declare class EnterpriseMenuFactory implements IMenuFactory {
    private context;
    private popupService;
    private gridOptionsWrapper;
    private lastSelectedTab;
    showMenu(column: Column, eventSource: HTMLElement): void;
    isMenuEnabled(column: Column): boolean;
}
export declare class EnterpriseMenu {
    static EVENT_TAB_SELECTED: string;
    static TAB_FILTER: string;
    static TAB_GENERAL: string;
    static TAB_COLUMNS: string;
    private columnController;
    private filterManager;
    private context;
    private gridApi;
    private gridOptionsWrapper;
    private tabbedLayout;
    private hidePopupFunc;
    private column;
    private mainMenuList;
    private columnSelectPanel;
    private eventService;
    private tabItemFilter;
    private tabItemGeneral;
    private tabItemColumns;
    private initialSelection;
    constructor(column: Column, initialSelection: string);
    addEventListener(event: string, listener: Function): void;
    getMinWidth(): number;
    init(): void;
    private showTabBasedOnPreviousSelection();
    private onTabItemClicked(event);
    destroy(): void;
    private createPinnedSubMenu();
    private createAggregationSubMenu();
    private createBuiltInMenuOptions();
    private getMenuItems();
    private getDefaultMenuOptions();
    private createMainPanel();
    private onHidePopup();
    private createFilterPanel();
    private createColumnsPanel();
    afterGuiAttached(params: any): void;
    getGui(): HTMLElement;
}
