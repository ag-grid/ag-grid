import {Bean} from "../context/context";
import {IMenuFactory} from "../interfaces/IMenuFactory";
import {IMenu} from "../interfaces/iMenu";
import Column from "../entities/column";
import _ from '../utils';
import {TabbedLayout} from "../layout/tabbedLayout";
import FilterManager from "../filter/filterManager";
import {TabbedItem} from "../layout/tabbedLayout";
import {ColumnController} from "../columnController/columnController";
import {Autowired} from "../context/context";
import SvgFactory from "../svgFactory";
import {Context} from "../context/context";
import PopupService from "../widgets/agPopupService";
import {ColumnSelectPanel} from "./columnSelect/columnSelectPanel";
import {GridApi} from "../gridApi";
import {MenuList} from "./../widgets/menuList";
import {MenuItem} from "./../widgets/menuItem";
import {PostConstruct} from "../context/context";
import EventService from "../eventService";

var svgFactory = SvgFactory.getInstance();

@Bean('menuFactory')
export class EnterpriseMenuFactory implements IMenuFactory {

    @Autowired('context') private context: Context;
    @Autowired('popupService') private popupService: PopupService;

    private lastSelectedTab: string;

    public showMenu(column: Column, eventSource: HTMLElement): void {

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
        this.popupService.positionPopup({eventSource: eventSource,
            ePopup: eMenuGui,
            nudgeX: -9,
            nudgeY: -26,
            minWidth: menu.getMinWidth(),
            keepWithinBounds: true
        });

        menu.afterGuiAttached({
            hidePopup: hidePopup,
            eventSource: eventSource
        });

        menu.addEventListener(EnterpriseMenu.EVENT_TAB_SELECTED, (event: any) => {
            console.log('saved ' + event.key);
            this.lastSelectedTab = event.key
        } );
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

        this.createGeneralPanel();
        this.createFilterPanel();
        this.createColumnsPanel();

        var tabItems: TabbedItem[] = [
            this.tabItemGeneral,
            this.tabItemFilter,
            this.tabItemColumns
        ];

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
            console.log('showing columns');
            this.tabbedLayout.showItem(this.tabItemColumns);
        }
        else if (this.tabItemFilter&& this.initialSelection===EnterpriseMenu.TAB_FILTER) {
            console.log('showing filter');
            this.tabbedLayout.showItem(this.tabItemFilter);
        }
        else if (this.tabItemGeneral && this.initialSelection===EnterpriseMenu.TAB_GENERAL) {
            console.log('showing general');
            this.tabbedLayout.showItem(this.tabItemGeneral);
        }
        else {
            console.log('showing first');
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
        this.columnSelectPanel.destroy();
        this.mainMenuList.destroy();
    }

    private createPinnedSubMenu(): MenuList {
        var cMenuList = new MenuList();
        this.context.wireBean(cMenuList);

        cMenuList.addItem({
            name: 'Pin Left',
            action: ()=> this.columnController.setColumnPinned(this.column, Column.PINNED_LEFT),
            checked: this.column.isPinnedLeft()
        });
        cMenuList.addItem({
            name: 'Pin Right',
            action: ()=> this.columnController.setColumnPinned(this.column, Column.PINNED_RIGHT),
            checked: this.column.isPinnedRight()
        });
        cMenuList.addItem({
            name: 'No Pin',
            action: ()=> this.columnController.setColumnPinned(this.column, null),
            checked: !this.column.isPinned()
        });

        return cMenuList;
    }

    private createAggregationSubMenu(): MenuList {
        var cMenuList = new MenuList();
        this.context.wireBean(cMenuList);

        var columnIsAlreadyAggValue = this.columnController.getValueColumns().indexOf(this.column) >= 0;

        cMenuList.addItem({
            name: 'Sum',
            action: ()=> {
                this.columnController.setColumnAggFunction(this.column, Column.AGG_SUM);
                this.columnController.addValueColumn(this.column);
            },
            checked: columnIsAlreadyAggValue && this.column.getAggFunc() === Column.AGG_SUM
        });
        cMenuList.addItem({
            name: 'Min',
            action: ()=> {
                this.columnController.setColumnAggFunction(this.column, Column.AGG_MIN);
                this.columnController.addValueColumn(this.column);
            },
            checked: columnIsAlreadyAggValue && this.column.getAggFunc() === Column.AGG_MIN
        });
        cMenuList.addItem({
            name: 'Max',
            action: ()=> {
                this.columnController.setColumnAggFunction(this.column, Column.AGG_MAX);
                this.columnController.addValueColumn(this.column);
            },
            checked: columnIsAlreadyAggValue && this.column.getAggFunc() === Column.AGG_MAX
        });
        cMenuList.addItem({
            name: 'First',
            action: ()=> {
                this.columnController.setColumnAggFunction(this.column, Column.AGG_FIRST);
                this.columnController.addValueColumn(this.column);
            },
            checked: columnIsAlreadyAggValue && this.column.getAggFunc() === Column.AGG_FIRST
        });
        cMenuList.addItem({
            name: 'Last',
            action: ()=> {
                this.columnController.setColumnAggFunction(this.column, Column.AGG_LAST);
                this.columnController.addValueColumn(this.column);
            },
            checked: columnIsAlreadyAggValue && this.column.getAggFunc() === Column.AGG_LAST
        });
        cMenuList.addItem({
            name: 'None',
            action: ()=> {
                this.column.setAggFunc(null);
                this.columnController.removeValueColumn(this.column);
            },
            checked: !columnIsAlreadyAggValue
        });

        return cMenuList;
    }

    private createGeneralPanel(): void {

        this.mainMenuList = new MenuList();
        this.context.wireBean(this.mainMenuList);

        this.mainMenuList.addSeparator();

        this.mainMenuList.addItem({
            name: 'Pin Column',
            icon: svgFactory.createPinIcon(),
            childMenu: this.createPinnedSubMenu()
        });

        this.mainMenuList.addItem({
            name: 'Value Aggregation',
            icon: svgFactory.createAggregationIcon(),
            childMenu: this.createAggregationSubMenu()
        });

        this.mainMenuList.addSeparator();

        this.mainMenuList.addItem({
            name: 'Autosize This Column',
            action: ()=> this.columnController.autoSizeColumn(this.column)
        });
        this.mainMenuList.addItem({
            name: 'Autosize All Columns',
            action: ()=> this.columnController.autoSizeAllColumns()
        });

        this.mainMenuList.addSeparator();

        var groupedByThisColumn = this.columnController.getRowGroupColumns().indexOf(this.column) >= 0;
        if (groupedByThisColumn) {
            this.mainMenuList.addItem({
                name: 'Un-Group by ' + this.column.getColDef().headerName,
                action: ()=> this.columnController.removeRowGroupColumn(this.column),
                icon: svgFactory.createGroupIcon12()
            });
        } else {
            this.mainMenuList.addItem({
                name: 'Group by ' + this.column.getColDef().headerName,
                action: ()=> this.columnController.addRowGroupColumn(this.column),
                icon: svgFactory.createGroupIcon12()
            });
        }

        this.mainMenuList.addSeparator();

        this.mainMenuList.addItem({
            name: 'Reset Columns',
                action: ()=> this.columnController.resetColumnState()
        });

        // only add grouping expand/collapse if grouping
        if (this.columnController.getRowGroupColumns().length>0) {
            this.mainMenuList.addItem({
                name: 'Expand All',
                action: ()=> this.gridApi.expandAll()
            });
            this.mainMenuList.addItem({
                name: 'Collapse All',
                action: ()=> this.gridApi.collapseAll()
            });
        }

        this.mainMenuList.addEventListener(MenuItem.EVENT_ITEM_SELECTED, this.onHidePopup.bind(this));

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
            title: svgFactory.createFilterSvg(),
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
            title: svgFactory.createColumnsIcon(),
            body: eWrapperDiv
        };
    }

    public afterGuiAttached(params: any): void {
        this.showTabBasedOnPreviousSelection();
        this.hidePopupFunc = params.hidePopup;
    }

    public getGui(): HTMLElement {
        return this.tabbedLayout.getGui();
    }

}
