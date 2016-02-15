import VerticalStack from "../layout/verticalStack";
import {Bean} from "../context/context";
import {IMenuFactory} from "../interfaces/IMenuFactory";
import {IMenu} from "../interfaces/iMenu";
import Column from "../entities/column";
import {ICreateMenuResult} from "../interfaces/iMenuFactory";
import _ from '../utils';
import {TabbedLayout} from "../layout/tabbedLayout";
import {Qualifier} from "../context/context";
import FilterManager from "../filter/filterManager";
import {TabbedItem} from "../layout/tabbedLayout";
import {ColumnController} from "../columnController/columnController";
import {ColumnPinnedPanel} from "./columnPinnedPanel";
import {MenuPanel} from "./menuPanel";
import {MenuPanelItems} from "./menuPanel";
import {Autowired} from "../context/context";
import SvgFactory from "../svgFactory";
import {Context} from "../context/context";

var svgFactory = SvgFactory.getInstance();

@Bean('menuFactory')
export class EnterpriseMenuFactory implements IMenuFactory {

    @Autowired('context') private context: Context;

    public createMenu(column: Column): ICreateMenuResult {

        var menu = new EnterpriseMenu(column);
        this.context.wireBean(menu);

        return {
            afterGuiAttached: menu.afterGuiAttached.bind(menu),
            menuGui: menu.getGui()
        };

    }

}

export class EnterpriseMenu {

    private tabbedLayout: TabbedLayout;
    private hidePopupFunc: Function;
    private column: Column;

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('filterManager') private filterManager: FilterManager;

    constructor(column: Column) {
        this.column = column;
    }

    public agPostWire(): void {
        var tabItems: TabbedItem[] = [
            this.createGeneralPanel(),
            this.createFilterPanel(),
            {
                title: svgFactory.createColumnHiddenSvg(),
                body: this.createOtherPanel()
            }
        ];

        this.tabbedLayout = new TabbedLayout({
            items: tabItems,
            cssClass: 'ag-menu'
        });
    }

    private createPinnedMenuPanel(): MenuPanel {
        var ePinnedPanel = new MenuPanel([
            {
                name: 'Pin Left',
                action: ()=> this.columnController.setColumnPinned(this.column, Column.PINNED_LEFT),
                checked: this.column.isPinnedLeft()
            },
            {
                name: 'Pin Right',
                action: ()=> this.columnController.setColumnPinned(this.column, Column.PINNED_RIGHT),
                checked: this.column.isPinnedRight()
            },
            {
                name: 'No Pin',
                action: ()=> this.columnController.setColumnPinned(this.column, null),
                checked: !this.column.isPinned()
            }
        ], this.onHidePopup.bind(this));
        return ePinnedPanel;
    }

    private createAutoSizePanel(): MenuPanel {
        var eAutoSizePanel = new MenuPanel([
            {
                name: 'Autosize This Column',
                action: ()=> this.columnController.autoSizeColumn(this.column)
            },
            {
                name: 'Autosize All Columns',
                action: ()=> this.columnController.autoSizeAllColumns()
            }
        ], this.onHidePopup.bind(this));
        return eAutoSizePanel;
    }

    private createRowGroupPanel(): MenuPanel {
        var items: MenuPanelItems[] = [];

        if (this.columnController.isColumnRowGrouped(this.column)) {
            items.push({
                name: 'Un-Group by ' + this.column.getColDef().headerName,
                action: ()=> this.columnController.removeRowGroupColumn(this.column)
            });
        } else {
            items.push({
                name: 'Group by ' + this.column.getColDef().headerName,
                action: ()=> this.columnController.addRowGroupColumn(this.column)
            });
        }

        var eAutoSizePanel = new MenuPanel(items, this.onHidePopup.bind(this));
        return eAutoSizePanel;
    }

    private createGeneralPanel(): TabbedItem {

        var ePanel = document.createElement('div');
        var ePinnedPanel = this.createPinnedMenuPanel();
        ePanel.appendChild(ePinnedPanel.getGui());

        var eAutoSizePanel = this.createAutoSizePanel();
        ePanel.appendChild(eAutoSizePanel.getGui());

        var eRowGroupPanel = this.createRowGroupPanel();
        ePanel.appendChild(eRowGroupPanel.getGui());

        return {
            title: svgFactory.createMenuSvg(),
            body: ePanel
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

    private createOtherPanel(): HTMLElement {
        var eDiv = document.createElement('div');
        eDiv.innerHTML = 'hello there';
        return eDiv;
    }

    public afterGuiAttached(params: any): void {
        this.tabbedLayout.showFirstItem();
        this.hidePopupFunc = params.hidePopup;
    }

    public getGui(): HTMLElement {
        return this.tabbedLayout.getGui();
    }

}
