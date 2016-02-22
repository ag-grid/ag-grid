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
import {MenuList} from "./menuList";
import {MenuItem} from "./menuItem";

var svgFactory = SvgFactory.getInstance();

@Bean('menuFactory')
export class EnterpriseMenuFactory implements IMenuFactory {

    @Autowired('context') private context: Context;
    @Autowired('popupService') private popupService: PopupService;

    public showMenu(column: Column, eventSource: HTMLElement): void {

        var menu = new EnterpriseMenu(column);
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
            keepWithinBounds: true
        });

        menu.afterGuiAttached({
            hidePopup: hidePopup,
            eventSource: eventSource
        });
    }

}

export class EnterpriseMenu {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('context') private context: Context;
    @Autowired('gridApi') private gridApi: GridApi;

    private tabbedLayout: TabbedLayout;
    private hidePopupFunc: Function;
    private column: Column;
    private mainMenuList: MenuList;

    private columnSelectPanel: ColumnSelectPanel;

    constructor(column: Column) {
        this.column = column;
    }

    public agPostWire(): void {
        var tabItems: TabbedItem[] = [
            this.createGeneralPanel(),
            this.createFilterPanel(),
            this.createColumnsPanel()
        ];

        this.tabbedLayout = new TabbedLayout({
            items: tabItems,
            cssClass: 'ag-menu',
            onActiveItemClicked: this.onHidePopup.bind(this)
        });
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

    private createGeneralPanel(): TabbedItem {

        this.mainMenuList = new MenuList();
        this.context.wireBean(this.mainMenuList);

        this.mainMenuList.addSeparator();

        this.mainMenuList.addItem({
            name: 'Pin Column',
            childMenu: this.createPinnedSubMenu()
        });

        this.mainMenuList.addItem({
            name: 'Value Aggregation',
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

        this.mainMenuList.addItem({
            name: 'Un-Group by ' + this.column.getColDef().headerName,
            action: ()=> this.columnController.removeRowGroupColumn(this.column)
        });
        this.mainMenuList.addItem({
            name: 'Group by ' + this.column.getColDef().headerName,
            action: ()=> this.columnController.addRowGroupColumn(this.column)
        });

        this.mainMenuList.addSeparator();

        this.mainMenuList.addItem({
            name: 'Reset Columns',
                action: ()=> this.columnController.resetState()
        });
        this.mainMenuList.addItem({
            name: 'Sum',
            action: ()=> {
                this.columnController.setColumnAggFunction(this.column, Column.AGG_SUM);
                this.columnController.addValueColumn(this.column);
            }
        });
        this.mainMenuList.addItem({
            name: 'Remove Sum',
            action: ()=> this.columnController.removeValueColumn(this.column)
        });
        this.mainMenuList.addItem({
            name: 'Expand All',
            action: ()=> this.gridApi.expandAll()
        });
        this.mainMenuList.addItem({
            name: 'Collapse All',
            action: ()=> this.gridApi.collapseAll()
        });

        this.mainMenuList.addEventListener(MenuItem.EVENT_ITEM_SELECTED, this.onHidePopup.bind(this));

        return {
            title: svgFactory.createMenuSvg(),
            body: this.mainMenuList.getGui()
        };
    }

    private onHidePopup(): void {
        this.hidePopupFunc();
    }

    private createFilterPanel(): TabbedItem {

        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column);

        var afterFilterAttachedCallback: Function;
        if (filterWrapper.filter.afterGuiAttached) {
            afterFilterAttachedCallback = filterWrapper.filter.afterGuiAttached.bind(filterWrapper.filter);
        }

        return {
            title: svgFactory.createFilterSvg(),
            body: filterWrapper.gui,
            afterAttachedCallback: afterFilterAttachedCallback
        };
    }

    private createColumnsPanel(): TabbedItem {

        var eWrapperDiv = document.createElement('div');
        _.addCssClass(eWrapperDiv, 'ag-menu-column-select-wrapper');

        this.columnSelectPanel = new ColumnSelectPanel(false);
        this.context.wireBean(this.columnSelectPanel);

        eWrapperDiv.appendChild(this.columnSelectPanel.getGui());

        return {
            title: svgFactory.createColumnsIcon(),
            body: eWrapperDiv
        };
    }

    public afterGuiAttached(params: any): void {
        this.tabbedLayout.showFirstItem();
        this.hidePopupFunc = params.hidePopup;
    }

    public getGui(): HTMLElement {
        return this.tabbedLayout.getGui();
    }

}
