import {
    Utils as _,
    SvgFactory,
    Bean,
    IMenuFactory,
    Autowired,
    Context,
    PopupService,
    GridOptionsWrapper,
    Column,
    ColumnController,
    FilterManager,
    GridApi,
    TabbedLayout,
    MenuList,
    EventService,
    TabbedItem,
    PostConstruct,
    MenuItemComponent,
    MenuItem
} from "ag-grid/main";
import {ColumnSelectPanel} from "./columnSelect/columnSelectPanel";

var svgFactory = SvgFactory.getInstance();

@Bean('menuFactory')
export class EnterpriseMenuFactory implements IMenuFactory {

    @Autowired('context') private context: Context;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private lastSelectedTab: string;

    public showMenuAfterMouseEvent(column:Column, mouseEvent:MouseEvent): void {

        this.showMenu(column, (menu: EnterpriseMenu)=> {
            this.popupService.positionPopupUnderMouseEvent({
                mouseEvent: mouseEvent,
                ePopup: menu.getGui()
            });
        });

    }

    public showMenuAfterButtonClick(column: Column, eventSource: HTMLElement): void {

        this.showMenu(column, (menu: EnterpriseMenu)=> {
            this.popupService.positionPopupUnderComponent({eventSource: eventSource,
                ePopup: menu.getGui(),
                nudgeX: -9,
                nudgeY: -26,
                minWidth: menu.getMinWidth(),
                keepWithinBounds: true
            });
        });

    }

    public showMenu(column: Column, positionCallback: (menu: EnterpriseMenu)=>void): void {

        var menu = new EnterpriseMenu(column, this.lastSelectedTab);
        this.context.wireBean(menu);

        var eMenuGui =  menu.getGui();

        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        var hidePopup = this.popupService.addAsModalPopup(
            eMenuGui,
            true,
            ()=> menu.destroy()
        );

        positionCallback(menu);

        menu.afterGuiAttached({
            hidePopup: hidePopup
        });

        menu.addEventListener(EnterpriseMenu.EVENT_TAB_SELECTED, (event: any) => {
            this.lastSelectedTab = event.key
        } );
    }

    public isMenuEnabled(column: Column): boolean {

        var showColumnPanel = !this.gridOptionsWrapper.isSuppressMenuColumnPanel();
        var showMainPanel = !this.gridOptionsWrapper.isSuppressMenuMainPanel();
        var showFilterPanel = !this.gridOptionsWrapper.isSuppressMenuFilterPanel();

        return showColumnPanel || showMainPanel || showFilterPanel;
    }
}

export class EnterpriseMenu {

    public static EVENT_TAB_SELECTED = 'tabSelected';

    public static TAB_FILTER = 'filter';
    public static TAB_GENERAL = 'general';
    public static TAB_COLUMNS = 'columns';

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('context') private context: Context;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private tabbedLayout: TabbedLayout;
    private hidePopupFunc: Function;
    private column: Column;
    private mainMenuList: MenuList;

    private columnSelectPanel: ColumnSelectPanel;
    private eventService = new EventService();

    private tabItemFilter: TabbedItem;
    private tabItemGeneral: TabbedItem;
    private tabItemColumns: TabbedItem;

    private initialSelection: string;

    constructor(column: Column, initialSelection: string) {
        this.column = column;
        this.initialSelection = initialSelection;
    }

    public addEventListener(event: string, listener: Function): void {
        this.eventService.addEventListener(event, listener);
    }

    public getMinWidth(): number {
        return this.tabbedLayout.getMinWidth();
    }

    @PostConstruct
    public init(): void {

        var tabItems: TabbedItem[] = [];
        if (!this.gridOptionsWrapper.isSuppressMenuMainPanel()) {
            this.createMainPanel();
            tabItems.push(this.tabItemGeneral);
        }
        if (!this.gridOptionsWrapper.isSuppressMenuFilterPanel()) {
            this.createFilterPanel();
            tabItems.push(this.tabItemFilter);
        }
        if (!this.gridOptionsWrapper.isSuppressMenuColumnPanel()) {
            this.createColumnsPanel();
            tabItems.push(this.tabItemColumns);
        }

        this.tabbedLayout = new TabbedLayout({
            items: tabItems,
            cssClass: 'ag-menu',
            onActiveItemClicked: this.onHidePopup.bind(this),
            onItemClicked: this.onTabItemClicked.bind(this)
        });
    }

    private showTabBasedOnPreviousSelection(): void {
        // show the tab the user was on last time they had a menu open
        if (this.tabItemColumns && this.initialSelection===EnterpriseMenu.TAB_COLUMNS) {
            this.tabbedLayout.showItem(this.tabItemColumns);
        }
        else if (this.tabItemFilter&& this.initialSelection===EnterpriseMenu.TAB_FILTER) {
            this.tabbedLayout.showItem(this.tabItemFilter);
        }
        else if (this.tabItemGeneral && this.initialSelection===EnterpriseMenu.TAB_GENERAL) {
            this.tabbedLayout.showItem(this.tabItemGeneral);
        }
        else {
            this.tabbedLayout.showFirstItem();
        }
    }

    private onTabItemClicked(event: any): void {
        var key: string;
        switch (event.item) {
            case this.tabItemColumns: key = EnterpriseMenu.TAB_COLUMNS; break;
            case this.tabItemFilter: key = EnterpriseMenu.TAB_FILTER; break;
            case this.tabItemGeneral: key = EnterpriseMenu.TAB_GENERAL; break;
        }
        if (key) {
            this.eventService.dispatchEvent(EnterpriseMenu.EVENT_TAB_SELECTED, {key: key});
        }
    }

    public destroy(): void {
        if (this.columnSelectPanel) {
            this.columnSelectPanel.destroy();
        }
        if (this.mainMenuList) {
            this.mainMenuList.destroy();
        }
    }

    private createPinnedSubMenu(): MenuList {
        var cMenuList = new MenuList();
        this.context.wireBean(cMenuList);
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

        cMenuList.addItem({
            name: localeTextFunc('pinLeft', 'Pin Left'),
            action: ()=> this.columnController.setColumnPinned(this.column, Column.PINNED_LEFT),
            checked: this.column.isPinnedLeft()
        });
        cMenuList.addItem({
            name: localeTextFunc('pinRight', 'Pin Right'),
            action: ()=> this.columnController.setColumnPinned(this.column, Column.PINNED_RIGHT),
            checked: this.column.isPinnedRight()
        });
        cMenuList.addItem({
            name: localeTextFunc('noPin', 'No Pin'),
            action: ()=> this.columnController.setColumnPinned(this.column, null),
            checked: !this.column.isPinned()
        });

        return cMenuList;
    }

    private createAggregationSubMenu(): MenuList {
        var cMenuList = new MenuList();
        this.context.wireBean(cMenuList);
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

        var columnIsAlreadyAggValue = this.columnController.getValueColumns().indexOf(this.column) >= 0;

        cMenuList.addItem({
            name: localeTextFunc('sum', 'Sum'),
            action: ()=> {
                this.columnController.setColumnAggFunction(this.column, Column.AGG_SUM);
                this.columnController.addValueColumn(this.column);
            },
            checked: columnIsAlreadyAggValue && this.column.getAggFunc() === Column.AGG_SUM
        });
        cMenuList.addItem({
            name: localeTextFunc('min', 'Min'),
            action: ()=> {
                this.columnController.setColumnAggFunction(this.column, Column.AGG_MIN);
                this.columnController.addValueColumn(this.column);
            },
            checked: columnIsAlreadyAggValue && this.column.getAggFunc() === Column.AGG_MIN
        });
        cMenuList.addItem({
            name: localeTextFunc('max', 'Max'),
            action: ()=> {
                this.columnController.setColumnAggFunction(this.column, Column.AGG_MAX);
                this.columnController.addValueColumn(this.column);
            },
            checked: columnIsAlreadyAggValue && this.column.getAggFunc() === Column.AGG_MAX
        });
        cMenuList.addItem({
            name: localeTextFunc('first', 'First'),
            action: ()=> {
                this.columnController.setColumnAggFunction(this.column, Column.AGG_FIRST);
                this.columnController.addValueColumn(this.column);
            },
            checked: columnIsAlreadyAggValue && this.column.getAggFunc() === Column.AGG_FIRST
        });
        cMenuList.addItem({
            name: localeTextFunc('last', 'Last'),
            action: ()=> {
                this.columnController.setColumnAggFunction(this.column, Column.AGG_LAST);
                this.columnController.addValueColumn(this.column);
            },
            checked: columnIsAlreadyAggValue && this.column.getAggFunc() === Column.AGG_LAST
        });
        cMenuList.addItem({
            name: localeTextFunc('none', 'None'),
            action: ()=> {
                this.column.setAggFunc(null);
                this.columnController.removeValueColumn(this.column);
            },
            checked: !columnIsAlreadyAggValue
        });

        return cMenuList;
    }

    private createBuiltInMenuOptions(): {[key: string]: MenuItem} {

        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

        var builtInMenuOptions: any = {
            pinSubMenu: {
                name: localeTextFunc('pinColumn', 'Pin Column'),
                icon: svgFactory.createPinIcon(),
                childMenu: this.createPinnedSubMenu()
            },
            valueAggSubMenu: {
                name: localeTextFunc('valueAggregation', 'Value Aggregation'),
                icon: svgFactory.createAggregationIcon(),
                childMenu: this.createAggregationSubMenu()
            },
            autoSizeThis: {
                name: localeTextFunc('autosizeThiscolumn', 'Autosize This Column'),
                action: ()=> this.columnController.autoSizeColumn(this.column)
            },
            autoSizeAll: {
                name: localeTextFunc('autosizeAllColumns', 'Autosize All Columns'),
                action: ()=> this.columnController.autoSizeAllColumns()
            },
            rowGroup: {
                name: localeTextFunc('groupBy', 'Group by') + ' ' + this.column.getColDef().headerName,
                action: ()=> this.columnController.addRowGroupColumn(this.column),
                icon: svgFactory.createGroupIcon12()
            },
            rowUnGroup: {
                name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + this.column.getColDef().headerName,
                action: ()=> this.columnController.removeRowGroupColumn(this.column),
                icon: svgFactory.createGroupIcon12()
            },
            resetColumns: {
                name: localeTextFunc('resetColumns', 'Reset Columns'),
                action: ()=> this.columnController.resetColumnState()
            },
            expandAll: {
                name: localeTextFunc('expandAll', 'Expand All'),
                action: ()=> this.gridApi.expandAll()
            },
            contractAll: {
                name: localeTextFunc('collapseAll', 'Collapse All'),
                action: ()=> this.gridApi.collapseAll()
            },
            toolPanel: {
                name: localeTextFunc('toolPanel', 'Tool Panel'),
                checked: this.gridApi.isToolPanelShowing(),
                action: ()=> this.gridApi.showToolPanel(!this.gridApi.isToolPanelShowing())
            }
        };

        return builtInMenuOptions;
    }

    private getMenuItems(): [string|MenuItem] {
        var defaultMenuOptions = this.getDefaultMenuOptions();

        var userFunc = this.gridOptionsWrapper.getMainMenuItemsFunc();
        if (userFunc) {
            var userOptions = userFunc({
                column: this.column,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext(),
                defaultItems: defaultMenuOptions
            });
            return userOptions;
        } else {
            return defaultMenuOptions;
        }
    }

    private getDefaultMenuOptions(): [string] {
        var result: [string] = <[string]>[];

        var doingGrouping = this.columnController.getRowGroupColumns().length>0;
        var groupedByThisColumn = this.columnController.getRowGroupColumns().indexOf(this.column) >= 0;

        result.push('separator');
        result.push('pinSubMenu');
        if (doingGrouping && !this.column.getColDef().suppressAggregation) {
            result.push('valueAggSubMenu');
        }
        result.push('separator');
        result.push('autoSizeThis');
        result.push('autoSizeAll');
        result.push('separator');

        if (!this.column.getColDef().suppressRowGroup) {
            if (groupedByThisColumn) {
                result.push('rowUnGroup');
            } else {
                result.push('rowGroup');
            }
        }
        result.push('separator');
        result.push('resetColumns');
        result.push('toolPanel');

        // only add grouping expand/collapse if grouping
        if (doingGrouping) {
            result.push('expandAll');
            result.push('contractAll');
        }

        return result;
    }

    private createMainPanel(): void {

        this.mainMenuList = new MenuList();
        this.context.wireBean(this.mainMenuList);

        var menuItems = this.getMenuItems();
        var builtInOptions = this.createBuiltInMenuOptions();
        this.mainMenuList.addMenuItems(menuItems, builtInOptions);

        this.mainMenuList.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, this.onHidePopup.bind(this));

        this.tabItemGeneral = {
            title: svgFactory.createMenuSvg(),
            body: this.mainMenuList.getGui()
        };
    }

    private onHidePopup(): void {
        this.hidePopupFunc();
    }

    private createFilterPanel(): void {

        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column);

        var afterFilterAttachedCallback: Function;
        if (filterWrapper.filter.afterGuiAttached) {
            afterFilterAttachedCallback = filterWrapper.filter.afterGuiAttached.bind(filterWrapper.filter);
        }

        this.tabItemFilter = {
            title: svgFactory.createFilterSvg12(),
            body: filterWrapper.gui,
            afterAttachedCallback: afterFilterAttachedCallback
        };
    }

    private createColumnsPanel(): void {

        var eWrapperDiv = document.createElement('div');
        _.addCssClass(eWrapperDiv, 'ag-menu-column-select-wrapper');

        this.columnSelectPanel = new ColumnSelectPanel(false);
        this.context.wireBean(this.columnSelectPanel);

        eWrapperDiv.appendChild(this.columnSelectPanel.getGui());

        this.tabItemColumns = {
            title: svgFactory.createColumnsSvg12(),//createColumnsIcon(),
            body: eWrapperDiv
        };
    }

    public afterGuiAttached(params: any): void {
        this.tabbedLayout.setAfterAttachedParams({hidePopup: params.hidePopup});
        this.showTabBasedOnPreviousSelection();
        this.hidePopupFunc = params.hidePopup;
    }

    public getGui(): HTMLElement {
        return this.tabbedLayout.getGui();
    }

}
