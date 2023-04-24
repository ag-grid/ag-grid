import {
    AgMenuItemComponent,
    AgMenuList,
    Autowired,
    Column,
    ColumnModel,
    Component,
    FocusService,
    MenuItemDef,
    PopupService,
    PostConstruct,
    ProvidedColumnGroup, 
    _
} from "@ag-grid-community/core";

type MenuItemName = 'rowGroup' | 'value' | 'pivot';

type MenuItemProperty = {
    allowedFunction: (col: Column) => boolean;
    activeFunction: (col: Column) => boolean;
    activateLabel: (name: string) => string;
    deactivateLabel: (name: string) => string;
    activateFunction: () => void;
    deActivateFunction: () => void;
    addIcon: string;
    removeIcon: string;
};

export class ToolPanelContextMenu extends Component {

    private columns: Column[];
    private allowGrouping: boolean;
    private allowValues: boolean;
    private allowPivoting: boolean;
    private menuItemMap: Map<MenuItemName, MenuItemProperty>;
    private displayName: string | null = null;

    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('popupService') private readonly popupService: PopupService;
    @Autowired('focusService') private readonly focusService: FocusService;

    constructor(
        private readonly column: Column | ProvidedColumnGroup,
        private readonly mouseEvent: MouseEvent,
        private readonly parentEl: HTMLElement
    ) {
        super(/* html */ `<div class="ag-menu"></div>`);
    }

    @PostConstruct
    private postConstruct(): void {
        this.initializeProperties(this.column);
        this.buildMenuItemMap();

        if (this.column instanceof Column) {
            this.displayName = this.columnModel.getDisplayNameForColumn(this.column, 'columnToolPanel');
        } else {
            this.displayName = this.columnModel.getDisplayNameForProvidedColumnGroup(null, this.column, 'columnToolPanel');
        }

        if (this.isActive()) {
            this.mouseEvent.preventDefault();
            this.displayContextMenu();
        }
    }

    private initializeProperties(column: Column | ProvidedColumnGroup): void {
        if (column instanceof ProvidedColumnGroup) {
            this.columns = column.getLeafColumns();
        } else {
            this.columns = [column];
        }

        this.allowGrouping = this.columns.some(col => col.isPrimary() && col.isAllowRowGroup());
        this.allowValues = this.columns.some(col => col.isPrimary() && col.isAllowValue());
        this.allowPivoting = this.columnModel.isPivotMode() && this.columns.some(col => col.isPrimary() && col.isAllowPivot());
    }

    private buildMenuItemMap(): void {
        const localeTextFunc = this.localeService.getLocaleTextFunc();

        this.menuItemMap = new Map<MenuItemName, MenuItemProperty>();
        this.menuItemMap.set('rowGroup', {
            allowedFunction: (col: Column) => col.isPrimary() && col.isAllowRowGroup(),
            activeFunction: (col: Column) => col.isRowGroupActive(),
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
            allowedFunction: (col: Column) => col.isPrimary() && col.isAllowValue(),
            activeFunction: (col: Column) => col.isValueActive(),
            activateLabel: () => localeTextFunc('addToValues', `Add ${this.displayName} to values`, [this.displayName!]),
            deactivateLabel: () => localeTextFunc('removeFromValues', `Remove ${this.displayName} from values`, [this.displayName!]),
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
            allowedFunction: (col: Column) => this.columnModel.isPivotMode() && col.isPrimary() && col.isAllowPivot(),
            activeFunction: (col: Column) => col.isPivotActive(),
            activateLabel: () => localeTextFunc('addToLabels', `Add ${this.displayName} to labels`, [this.displayName!]),
            deactivateLabel: () => localeTextFunc('removeFromLabels', `Remove ${this.displayName} from labels`, [this.displayName!]),
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

    private addColumnsToList(columnList: Column[]): Column[] {
        return [...columnList].concat(this.columns.filter(col => columnList.indexOf(col) === -1));
    }

    private removeColumnsFromList(columnList: Column[]): Column[] {
        return columnList.filter(col => this.columns.indexOf(col) === -1);
    }

    private displayContextMenu(): void {
        const eGui = this.getGui();
        const menuList = this.createBean(new AgMenuList());
        const menuItemsMapped: MenuItemDef[] = this.getMappedMenuItems();
        const localeTextFunc = this.localeService.getLocaleTextFunc();

        let hideFunc = () => {};

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
            closedCallback: (e: KeyboardEvent) => {
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

    private isActive(): boolean {
        return this.allowGrouping || this.allowValues || this.allowPivoting;
    }

    private getMappedMenuItems(): MenuItemDef[] {
        const ret: MenuItemDef[] = [];

        for (const val of this.menuItemMap.values()) {
            const isInactive = this.columns.some(col => val.allowedFunction(col) && !val.activeFunction(col));
            const isActive = this.columns.some(col => val.allowedFunction(col) && val.activeFunction(col));

            if (isInactive) {
                ret.push({
                    name: val.activateLabel(this.displayName!),
                    icon: _.createIconNoSpan(val.addIcon, this.gridOptionsService, null),
                    action: () => val.activateFunction()
                });
            }

            if (isActive) {
                ret.push({
                    name: val.deactivateLabel(this.displayName!),
                    icon: _.createIconNoSpan(val.removeIcon, this.gridOptionsService, null),
                    action: () => val.deActivateFunction()
                });
            }
        }

        return ret;
    }


}