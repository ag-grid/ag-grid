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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbFBhbmVsQ29udGV4dE1lbnUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29sdW1uVG9vbFBhbmVsL3Rvb2xQYW5lbENvbnRleHRNZW51LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxtQkFBbUIsRUFDbkIsVUFBVSxFQUNWLFNBQVMsRUFDVCxNQUFNLEVBRU4sU0FBUyxFQUlULGFBQWEsRUFDYixtQkFBbUIsRUFDbkIsQ0FBQyxFQUNKLE1BQU0seUJBQXlCLENBQUM7QUFlakMsTUFBTSxPQUFPLG9CQUFxQixTQUFRLFNBQVM7SUFhL0MsWUFDcUIsTUFBb0MsRUFDcEMsVUFBc0IsRUFDdEIsUUFBcUI7UUFFdEMsS0FBSyxDQUFDLFVBQVUsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1FBSi9CLFdBQU0sR0FBTixNQUFNLENBQThCO1FBQ3BDLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsYUFBUSxHQUFSLFFBQVEsQ0FBYTtRQVRsQyxnQkFBVyxHQUFrQixJQUFJLENBQUM7SUFZMUMsQ0FBQztJQUdPLGFBQWE7UUFDakIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUV4QixJQUFJLElBQUksQ0FBQyxNQUFNLFlBQVksTUFBTSxFQUFFO1lBQy9CLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUM7U0FDL0Y7YUFBTTtZQUNILElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQ0FBb0MsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1NBQ2xIO1FBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLEVB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