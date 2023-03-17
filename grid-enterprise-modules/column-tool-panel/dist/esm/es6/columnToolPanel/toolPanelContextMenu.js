var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AgMenuItemComponent, AgMenuList, Autowired, Column, Component, PostConstruct, ProvidedColumnGroup, _ } from "@ag-grid-community/core";
export class ToolPanelContextMenu extends Component {
    constructor(column, mouseEvent, parentEl) {
        super(/* html */ `<div class="ag-menu"></div>`);
        this.column = column;
        this.mouseEvent = mouseEvent;
        this.parentEl = parentEl;
        this.displayName = null;
    }
    postConstruct() {
        this.initializeProperties(this.column);
        this.buildMenuItemMap();
        if (this.column instanceof Column) {
            this.displayName = this.columnModel.getDisplayNameForColumn(this.column, 'columnToolPanel');
        }
        else {
            this.displayName = this.columnModel.getDisplayNameForProvidedColumnGroup(null, this.column, 'columnToolPanel');
        }
        if (this.isActive()) {
            this.mouseEvent.preventDefault();
            this.displayContextMenu();
        }
    }
    initializeProperties(column) {
        if (column instanceof ProvidedColumnGroup) {
            this.columns = column.getLeafColumns();
        }
        else {
            this.columns = [column];
        }
        this.allowGrouping = this.columns.some(col => col.isPrimary() && col.isAllowRowGroup());
        this.allowValues = this.columns.some(col => col.isPrimary() && col.isAllowValue());
        this.allowPivoting = this.columnModel.isPivotMode() && this.columns.some(col => col.isPrimary() && col.isAllowPivot());
    }
    buildMenuItemMap() {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.menuItemMap = new Map();
        this.menuItemMap.set('rowGroup', {
            allowedFunction: (col) => col.isPrimary() && col.isAllowRowGroup(),
            activeFunction: (col) => col.isRowGroupActive(),
            activateLabel: () => `${localeTextFunc('groupBy', 'Group by')} ${this.displayName}`,
            deactivateLabel: () => `${localeTextFunc('ungroupBy', 'Un-Group by')} ${this.displayName}`,
            activateFunction: () => {
                const groupedColumns = this.columnModel.getRowGroupColumns();
                this.columnModel.setRowGroupColumns(this.addColumnsToList(groupedColumns), "toolPanelUi");
            },
            deActivateFunction: () => {
                const groupedColumns = this.columnModel.getRowGroupColumns();
                this.columnModel.setRowGroupColumns(this.removeColumnsFromList(groupedColumns), "toolPanelUi");
            },
            addIcon: 'menuAddRowGroup',
            removeIcon: 'menuRemoveRowGroup'
        });
        this.menuItemMap.set('value', {
            allowedFunction: (col) => col.isPrimary() && col.isAllowValue(),
            activeFunction: (col) => col.isValueActive(),
            activateLabel: () => localeTextFunc('addToValues', `Add ${this.displayName} to values`, [this.displayName]),
            deactivateLabel: () => localeTextFunc('removeFromValues', `Remove ${this.displayName} from values`, [this.displayName]),
            activateFunction: () => {
                const valueColumns = this.columnModel.getValueColumns();
                this.columnModel.setValueColumns(this.addColumnsToList(valueColumns), "toolPanelUi");
            },
            deActivateFunction: () => {
                const valueColumns = this.columnModel.getValueColumns();
                this.columnModel.setValueColumns(this.removeColumnsFromList(valueColumns), "toolPanelUi");
            },
            addIcon: 'valuePanel',
            removeIcon: 'valuePanel'
        });
        this.menuItemMap.set('pivot', {
            allowedFunction: (col) => this.columnModel.isPivotMode() && col.isPrimary() && col.isAllowPivot(),
            activeFunction: (col) => col.isPivotActive(),
            activateLabel: () => localeTextFunc('addToLabels', `Add ${this.displayName} to labels`, [this.displayName]),
            deactivateLabel: () => localeTextFunc('removeFromLabels', `Remove ${this.displayName} from labels`, [this.displayName]),
            activateFunction: () => {
                const pivotColumns = this.columnModel.getPivotColumns();
                this.columnModel.setPivotColumns(this.addColumnsToList(pivotColumns), "toolPanelUi");
            },
            deActivateFunction: () => {
                const pivotColumns = this.columnModel.getPivotColumns();
                this.columnModel.setPivotColumns(this.removeColumnsFromList(pivotColumns), "toolPanelUi");
            },
            addIcon: 'pivotPanel',
            removeIcon: 'pivotPanel'
        });
    }
    addColumnsToList(columnList) {
        return [...columnList].concat(this.columns.filter(col => columnList.indexOf(col) === -1));
    }
    removeColumnsFromList(columnList) {
        return columnList.filter(col => this.columns.indexOf(col) === -1);
    }
    displayContextMenu() {
        const eGui = this.getGui();
        const menuList = this.createBean(new AgMenuList());
        const menuItemsMapped = this.getMappedMenuItems();
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        let hideFunc = () => { };
        eGui.appendChild(menuList.getGui());
        menuList.addMenuItems(menuItemsMapped);
        menuList.addManagedListener(menuList, AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, () => {
            this.parentEl.focus();
            hideFunc();
        });
        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eGui,
            closeOnEsc: true,
            afterGuiAttached: () => this.focusService.focusInto(menuList.getGui()),
            ariaLabel: localeTextFunc('ariaLabelContextMenu', 'Context Menu'),
            closedCallback: (e) => {
                if (e instanceof KeyboardEvent) {
                    this.parentEl.focus();
                }
                this.destroyBean(menuList);
            }
        });
        if (addPopupRes) {
            hideFunc = addPopupRes.hideFunc;
        }
        this.popupService.positionPopupUnderMouseEvent({
            type: 'columnContextMenu',
            mouseEvent: this.mouseEvent,
            ePopup: eGui
        });
    }
    isActive() {
        return this.allowGrouping || this.allowValues || this.allowPivoting;
    }
    getMappedMenuItems() {
        const ret = [];
        for (const val of this.menuItemMap.values()) {
            const isInactive = this.columns.some(col => val.allowedFunction(col) && !val.activeFunction(col));
            const isActive = this.columns.some(col => val.allowedFunction(col) && val.activeFunction(col));
            if (isInactive) {
                ret.push({
                    name: val.activateLabel(this.displayName),
                    icon: _.createIconNoSpan(val.addIcon, this.gridOptionsService, null),
                    action: () => val.activateFunction()
                });
            }
            if (isActive) {
                ret.push({
                    name: val.deactivateLabel(this.displayName),
                    icon: _.createIconNoSpan(val.removeIcon, this.gridOptionsService, null),
                    action: () => val.deActivateFunction()
                });
            }
        }
        return ret;
    }
}
__decorate([
    Autowired('columnModel')
], ToolPanelContextMenu.prototype, "columnModel", void 0);
__decorate([
    Autowired('popupService')
], ToolPanelContextMenu.prototype, "popupService", void 0);
__decorate([
    Autowired('focusService')
], ToolPanelContextMenu.prototype, "focusService", void 0);
__decorate([
    PostConstruct
], ToolPanelContextMenu.prototype, "postConstruct", null);
