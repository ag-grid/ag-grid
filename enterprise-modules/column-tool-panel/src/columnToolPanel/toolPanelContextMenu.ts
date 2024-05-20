import {
    Autowired,
    Column,
    ColumnModel,
    ColumnNameService,
    Component,
    FocusService,
    FuncColsService,
    MenuItemDef,
    PopupService,
    PostConstruct,
    ProvidedColumnGroup,
    _createIconNoSpan,
} from '@ag-grid-community/core';
import { AgMenuItemComponent, AgMenuList } from '@ag-grid-enterprise/core';

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
    @Autowired('columnNameService') private columnNameService: ColumnNameService;
    @Autowired('funcColsService') private funcColsService: FuncColsService;
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
            this.displayName = this.columnNameService.getDisplayNameForColumn(this.column, 'columnToolPanel');
        } else {
            this.displayName = this.columnNameService.getDisplayNameForProvidedColumnGroup(
                null,
                this.column,
                'columnToolPanel'
            );
        }

        if (this.isActive()) {
            this.mouseEvent.preventDefault();
            const menuItemsMapped: MenuItemDef[] = this.getMappedMenuItems();
            if (menuItemsMapped.length === 0) {
                return;
            }

            this.displayContextMenu(menuItemsMapped);
        }
    }

    private initializeProperties(column: Column | ProvidedColumnGroup): void {
        if (column instanceof ProvidedColumnGroup) {
            this.columns = column.getLeafColumns();
        } else {
            this.columns = [column];
        }

        this.allowGrouping = this.columns.some((col) => col.isPrimary() && col.isAllowRowGroup());
        this.allowValues = this.columns.some((col) => col.isPrimary() && col.isAllowValue());
        this.allowPivoting =
            this.columnModel.isPivotMode() && this.columns.some((col) => col.isPrimary() && col.isAllowPivot());
    }

    private buildMenuItemMap(): void {
        const localeTextFunc = this.localeService.getLocaleTextFunc();

        this.menuItemMap = new Map<MenuItemName, MenuItemProperty>();
        this.menuItemMap.set('rowGroup', {
            allowedFunction: (col: Column) =>
                col.isPrimary() && col.isAllowRowGroup() && !this.columnModel.isColGroupLocked(col),
            activeFunction: (col: Column) => col.isRowGroupActive(),
            activateLabel: () => `${localeTextFunc('groupBy', 'Group by')} ${this.displayName}`,
            deactivateLabel: () => `${localeTextFunc('ungroupBy', 'Un-Group by')} ${this.displayName}`,
            activateFunction: () => {
                const groupedColumns = this.funcColsService.getRowGroupColumns();
                this.funcColsService.setRowGroupColumns(this.addColumnsToList(groupedColumns), 'toolPanelUi');
            },
            deActivateFunction: () => {
                const groupedColumns = this.funcColsService.getRowGroupColumns();
                this.funcColsService.setRowGroupColumns(this.removeColumnsFromList(groupedColumns), 'toolPanelUi');
            },
            addIcon: 'menuAddRowGroup',
            removeIcon: 'menuRemoveRowGroup',
        });

        this.menuItemMap.set('value', {
            allowedFunction: (col: Column) => col.isPrimary() && col.isAllowValue(),
            activeFunction: (col: Column) => col.isValueActive(),
            activateLabel: () =>
                localeTextFunc('addToValues', `Add ${this.displayName} to values`, [this.displayName!]),
            deactivateLabel: () =>
                localeTextFunc('removeFromValues', `Remove ${this.displayName} from values`, [this.displayName!]),
            activateFunction: () => {
                const valueColumns = this.funcColsService.getValueColumns();
                this.funcColsService.setValueColumns(this.addColumnsToList(valueColumns), 'toolPanelUi');
            },
            deActivateFunction: () => {
                const valueColumns = this.funcColsService.getValueColumns();
                this.funcColsService.setValueColumns(this.removeColumnsFromList(valueColumns), 'toolPanelUi');
            },
            addIcon: 'valuePanel',
            removeIcon: 'valuePanel',
        });

        this.menuItemMap.set('pivot', {
            allowedFunction: (col: Column) => this.columnModel.isPivotMode() && col.isPrimary() && col.isAllowPivot(),
            activeFunction: (col: Column) => col.isPivotActive(),
            activateLabel: () =>
                localeTextFunc('addToLabels', `Add ${this.displayName} to labels`, [this.displayName!]),
            deactivateLabel: () =>
                localeTextFunc('removeFromLabels', `Remove ${this.displayName} from labels`, [this.displayName!]),
            activateFunction: () => {
                const pivotColumns = this.funcColsService.getPivotColumns();
                this.funcColsService.setPivotColumns(this.addColumnsToList(pivotColumns), 'toolPanelUi');
            },
            deActivateFunction: () => {
                const pivotColumns = this.funcColsService.getPivotColumns();
                this.funcColsService.setPivotColumns(this.removeColumnsFromList(pivotColumns), 'toolPanelUi');
            },
            addIcon: 'pivotPanel',
            removeIcon: 'pivotPanel',
        });
    }

    private addColumnsToList(columnList: Column[]): Column[] {
        return [...columnList].concat(this.columns.filter((col) => columnList.indexOf(col) === -1));
    }

    private removeColumnsFromList(columnList: Column[]): Column[] {
        return columnList.filter((col) => this.columns.indexOf(col) === -1);
    }

    private displayContextMenu(menuItemsMapped: MenuItemDef[]): void {
        const eGui = this.getGui();
        const menuList = this.createBean(new AgMenuList());
        const localeTextFunc = this.localeService.getLocaleTextFunc();

        let hideFunc = () => {};

        eGui.appendChild(menuList.getGui());
        menuList.addMenuItems(menuItemsMapped);
        menuList.addManagedListener(menuList, AgMenuItemComponent.EVENT_CLOSE_MENU, () => {
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
            },
        });

        if (addPopupRes) {
            hideFunc = addPopupRes.hideFunc;
        }

        this.popupService.positionPopupUnderMouseEvent({
            type: 'columnContextMenu',
            mouseEvent: this.mouseEvent,
            ePopup: eGui,
        });
    }

    private isActive(): boolean {
        return this.allowGrouping || this.allowValues || this.allowPivoting;
    }

    private getMappedMenuItems(): MenuItemDef[] {
        const ret: MenuItemDef[] = [];
        for (const val of this.menuItemMap.values()) {
            const isInactive = this.columns.some((col) => val.allowedFunction(col) && !val.activeFunction(col));
            const isActive = this.columns.some((col) => val.allowedFunction(col) && val.activeFunction(col));

            if (isInactive) {
                ret.push({
                    name: val.activateLabel(this.displayName!),
                    icon: _createIconNoSpan(val.addIcon, this.gos, null),
                    action: () => val.activateFunction(),
                });
            }

            if (isActive) {
                ret.push({
                    name: val.deactivateLabel(this.displayName!),
                    icon: _createIconNoSpan(val.removeIcon, this.gos, null),
                    action: () => val.deActivateFunction(),
                });
            }
        }

        return ret;
    }
}
