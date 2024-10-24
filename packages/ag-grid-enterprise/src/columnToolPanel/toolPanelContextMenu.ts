import type {
    AgColumn,
    AgProvidedColumnGroup,
    BeanCollection,
    ColumnModel,
    ColumnNameService,
    FocusService,
    IColsService,
    IconName,
    MenuItemDef,
    PopupService,
} from 'ag-grid-community';
import { Component, _createIconNoSpan, isColumn, isProvidedColumnGroup } from 'ag-grid-community';

import { isRowGroupColLocked } from '../rowGrouping/rowGroupingUtils';
import { AgMenuList } from '../widgets/agMenuList';

type MenuItemName = 'rowGroup' | 'value' | 'pivot';

type MenuItemProperty = {
    allowedFunction: (col: AgColumn) => boolean;
    activeFunction: (col: AgColumn) => boolean;
    activateLabel: (name: string) => string;
    deactivateLabel: (name: string) => string;
    activateFunction: () => void;
    deActivateFunction: () => void;
    addIcon: IconName;
    removeIcon: IconName;
};

export class ToolPanelContextMenu extends Component {
    private columnModel: ColumnModel;
    private columnNameService: ColumnNameService;
    private rowGroupColsService?: IColsService;
    private valueColsService?: IColsService;
    private pivotColsService?: IColsService;

    private popupService: PopupService;
    private focusService: FocusService;

    public wireBeans(beans: BeanCollection) {
        this.columnModel = beans.columnModel;
        this.columnNameService = beans.columnNameService;
        this.rowGroupColsService = beans.rowGroupColsService;
        this.valueColsService = beans.valueColsService;
        this.pivotColsService = beans.pivotColsService;
        this.popupService = beans.popupService!;
        this.focusService = beans.focusService;
    }

    private columns: AgColumn[];
    private allowGrouping: boolean;
    private allowValues: boolean;
    private allowPivoting: boolean;
    private menuItemMap: Map<MenuItemName, MenuItemProperty>;
    private displayName: string | null = null;

    constructor(
        private readonly column: AgColumn | AgProvidedColumnGroup,
        private readonly mouseEvent: MouseEvent,
        private readonly parentEl: HTMLElement
    ) {
        super(/* html */ `<div class="ag-menu"></div>`);
    }

    public postConstruct(): void {
        this.initializeProperties(this.column);
        this.buildMenuItemMap();

        if (isColumn(this.column)) {
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

    private initializeProperties(column: AgColumn | AgProvidedColumnGroup): void {
        if (isProvidedColumnGroup(column)) {
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
        const localeTextFunc = this.getLocaleTextFunc();

        this.menuItemMap = new Map<MenuItemName, MenuItemProperty>();
        this.menuItemMap.set('rowGroup', {
            allowedFunction: (col) =>
                col.isPrimary() &&
                col.isAllowRowGroup() &&
                !isRowGroupColLocked(this.gos, col, this.rowGroupColsService),
            activeFunction: (col) => col.isRowGroupActive(),
            activateLabel: () => `${localeTextFunc('groupBy', 'Group by')} ${this.displayName}`,
            deactivateLabel: () => `${localeTextFunc('ungroupBy', 'Un-Group by')} ${this.displayName}`,
            activateFunction: () => {
                if (this.rowGroupColsService) {
                    const groupedColumns = this.rowGroupColsService.columns;
                    this.rowGroupColsService.setColumns(this.addColumnsToList(groupedColumns), 'toolPanelUi');
                }
            },
            deActivateFunction: () => {
                if (this.rowGroupColsService) {
                    const groupedColumns = this.rowGroupColsService.columns;
                    this.rowGroupColsService.setColumns(this.removeColumnsFromList(groupedColumns), 'toolPanelUi');
                }
            },
            addIcon: 'menuAddRowGroup',
            removeIcon: 'menuRemoveRowGroup',
        });

        this.menuItemMap.set('value', {
            allowedFunction: (col) => col.isPrimary() && col.isAllowValue(),
            activeFunction: (col) => col.isValueActive(),
            activateLabel: () =>
                localeTextFunc('addToValues', `Add ${this.displayName} to values`, [this.displayName!]),
            deactivateLabel: () =>
                localeTextFunc('removeFromValues', `Remove ${this.displayName} from values`, [this.displayName!]),
            activateFunction: () => {
                if (this.valueColsService) {
                    const valueColumns = this.valueColsService.columns;
                    this.valueColsService.setColumns(this.addColumnsToList(valueColumns), 'toolPanelUi');
                }
            },
            deActivateFunction: () => {
                if (this.valueColsService) {
                    const valueColumns = this.valueColsService.columns;
                    this.valueColsService.setColumns(this.removeColumnsFromList(valueColumns), 'toolPanelUi');
                }
            },
            addIcon: 'valuePanel',
            removeIcon: 'valuePanel',
        });

        this.menuItemMap.set('pivot', {
            allowedFunction: (col) => this.columnModel.isPivotMode() && col.isPrimary() && col.isAllowPivot(),
            activeFunction: (col) => col.isPivotActive(),
            activateLabel: () =>
                localeTextFunc('addToLabels', `Add ${this.displayName} to labels`, [this.displayName!]),
            deactivateLabel: () =>
                localeTextFunc('removeFromLabels', `Remove ${this.displayName} from labels`, [this.displayName!]),
            activateFunction: () => {
                if (this.pivotColsService) {
                    const pivotColumns = this.pivotColsService.columns;
                    this.pivotColsService.setColumns(this.addColumnsToList(pivotColumns), 'toolPanelUi');
                }
            },
            deActivateFunction: () => {
                if (this.pivotColsService) {
                    const pivotColumns = this.pivotColsService.columns;
                    this.pivotColsService.setColumns(this.removeColumnsFromList(pivotColumns), 'toolPanelUi');
                }
            },
            addIcon: 'pivotPanel',
            removeIcon: 'pivotPanel',
        });
    }

    private addColumnsToList(columnList: AgColumn[] = []): AgColumn[] {
        return [...columnList].concat(this.columns.filter((col) => columnList.indexOf(col) === -1));
    }

    private removeColumnsFromList(columnList: AgColumn[] = []): AgColumn[] {
        return columnList.filter((col) => this.columns.indexOf(col) === -1);
    }

    private displayContextMenu(menuItemsMapped: MenuItemDef[]): void {
        const eGui = this.getGui();
        const menuList = this.createBean(new AgMenuList());
        const localeTextFunc = this.getLocaleTextFunc();

        let hideFunc = () => {};

        eGui.appendChild(menuList.getGui());
        menuList.addMenuItems(menuItemsMapped);
        menuList.addManagedListeners(menuList, {
            closeMenu: () => {
                this.parentEl.focus();
                hideFunc();
            },
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
                    icon: _createIconNoSpan(val.addIcon, this.beans, null),
                    action: () => val.activateFunction(),
                });
            }

            if (isActive) {
                ret.push({
                    name: val.deactivateLabel(this.displayName!),
                    icon: _createIconNoSpan(val.removeIcon, this.beans, null),
                    action: () => val.deActivateFunction(),
                });
            }
        }

        return ret;
    }
}
