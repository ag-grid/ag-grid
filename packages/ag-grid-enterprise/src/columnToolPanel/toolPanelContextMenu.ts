import type { AgColumn, AgProvidedColumnGroup, IconName, MenuItemDef } from 'ag-grid-community';
import { Component, _createIconNoSpan, _focusInto, isColumn, isProvidedColumnGroup } from 'ag-grid-community';

import { isRowGroupColLocked } from '../rowGrouping/rowGroupingUtils';
import { AgMenuList } from '../widgets/agMenuList';

type MenuItemName = 'scrollIntoView' | 'rowGroup' | 'value' | 'pivot';

type MenuItemProperty = {
    allowedFunction: (col: AgColumn) => boolean;
    activeFunction: (col: AgColumn) => boolean;
    activateLabel: (name: string) => string;
    activateFunction: () => void;
    deactivateLabel?: (name: string) => string;
    deActivateFunction?: () => void;
    addIcon: IconName;
    removeIcon?: IconName;
};

export class ToolPanelContextMenu extends Component {
    private columns: AgColumn[];
    private allowScrollIntoView: boolean;
    private allowGrouping: boolean;
    private allowValues: boolean;
    private allowPivoting: boolean;
    private menuItemMap: Map<MenuItemName, MenuItemProperty>;
    private displayName: string | null = null;

    constructor(
        private readonly column: AgColumn | AgProvidedColumnGroup,
        private readonly mouseEventOrTouch: MouseEvent | Touch,
        private readonly parentEl: HTMLElement
    ) {
        super({ tag: 'div', cls: 'ag-menu' });
    }

    public postConstruct(): void {
        const {
            column,
            beans: { colNames },
        } = this;
        this.initializeProperties(column);

        let displayName: string | null;
        if (isColumn(column)) {
            displayName = colNames.getDisplayNameForColumn(column, 'columnToolPanel');
        } else {
            displayName = colNames.getDisplayNameForProvidedColumnGroup(null, column, 'columnToolPanel');
        }
        this.displayName = displayName;

        this.buildMenuItemMap();

        if (this.isActive()) {
            const mouseEventOrTouch = this.mouseEventOrTouch;
            if ('preventDefault' in mouseEventOrTouch) {
                mouseEventOrTouch.preventDefault();
            }
            const menuItemsMapped: MenuItemDef[] = this.getMappedMenuItems();
            if (menuItemsMapped.length === 0) {
                return;
            }

            this.displayContextMenu(menuItemsMapped);
        }
    }

    private initializeProperties(column: AgColumn | AgProvidedColumnGroup): void {
        let columns: AgColumn[];
        if (isProvidedColumnGroup(column)) {
            columns = column.getLeafColumns();
        } else {
            columns = [column];
        }
        this.columns = columns;

        const isPivotMode = this.beans.colModel.isPivotMode();

        this.allowScrollIntoView = !isPivotMode && columns.some(this.isColumnValidForScrollIntoView);
        this.allowGrouping = columns.some((col) => col.isPrimary() && col.isAllowRowGroup());
        this.allowValues = columns.some((col) => col.isPrimary() && col.isAllowValue());
        this.allowPivoting = isPivotMode && columns.some((col) => col.isPrimary() && col.isAllowPivot());
    }

    private buildMenuItemMap(): void {
        const localeTextFunc = this.getLocaleTextFunc();
        const { beans, displayName } = this;
        const { rowGroupColsSvc, valueColsSvc, pivotColsSvc, colModel } = beans;

        const menuItemMap = new Map<MenuItemName, MenuItemProperty>();
        this.menuItemMap = menuItemMap;

        const isPivotMode = colModel.isPivotMode();

        menuItemMap.set('scrollIntoView', {
            allowedFunction: (col) => !col.isPinned() && !isPivotMode && this.isColumnValidForScrollIntoView(col),
            activeFunction: () => false,
            activateLabel: () =>
                localeTextFunc('scrollColumnIntoView', `Scroll ${displayName} into View`, [displayName!]),
            activateFunction: () => {
                const firstVisibleColumn = this.columns.find(this.isColumnValidForScrollIntoView);

                if (firstVisibleColumn) {
                    this.beans.ctrlsSvc.getScrollFeature().ensureColumnVisible(firstVisibleColumn);
                }
            },
            deActivateFunction: () => {},
            addIcon: 'ensureColumnVisible',
        });

        const rowGroupAllowed = (col: AgColumn) =>
            col.isPrimary() && col.isAllowRowGroup() && !isRowGroupColLocked(col, beans);
        menuItemMap.set('rowGroup', {
            allowedFunction: rowGroupAllowed,
            activeFunction: (col) => col.isRowGroupActive(),
            activateLabel: () => `${localeTextFunc('groupBy', 'Group by')} ${displayName}`,
            deactivateLabel: () => `${localeTextFunc('ungroupBy', 'Un-Group by')} ${displayName}`,
            activateFunction: () =>
                rowGroupColsSvc?.setColumns(
                    this.addColumnsToList(rowGroupColsSvc.columns, rowGroupAllowed),
                    'toolPanelUi'
                ),
            deActivateFunction: () =>
                rowGroupColsSvc?.setColumns(
                    this.removeColumnsFromList(rowGroupColsSvc.columns, rowGroupAllowed),
                    'toolPanelUi'
                ),
            addIcon: 'menuAddRowGroup',
            removeIcon: 'menuRemoveRowGroup',
        });

        const valueAllowed = (col: AgColumn) => col.isPrimary() && col.isAllowValue();
        menuItemMap.set('value', {
            allowedFunction: valueAllowed,
            activeFunction: (col) => col.isValueActive(),
            activateLabel: () => localeTextFunc('addToValues', `Add ${displayName} to values`, [displayName!]),
            deactivateLabel: () =>
                localeTextFunc('removeFromValues', `Remove ${displayName} from values`, [displayName!]),
            activateFunction: () =>
                valueColsSvc?.setColumns(this.addColumnsToList(valueColsSvc.columns, valueAllowed), 'toolPanelUi'),
            deActivateFunction: () =>
                valueColsSvc?.setColumns(this.removeColumnsFromList(valueColsSvc.columns, valueAllowed), 'toolPanelUi'),
            addIcon: 'valuePanel',
            removeIcon: 'valuePanel',
        });

        const pivotAllowed = (col: AgColumn) => isPivotMode && col.isPrimary() && col.isAllowPivot();
        menuItemMap.set('pivot', {
            allowedFunction: pivotAllowed,
            activeFunction: (col) => col.isPivotActive(),
            activateLabel: () => localeTextFunc('addToLabels', `Add ${displayName} to labels`, [displayName!]),
            deactivateLabel: () =>
                localeTextFunc('removeFromLabels', `Remove ${displayName} from labels`, [displayName!]),
            activateFunction: () =>
                pivotColsSvc?.setColumns(this.addColumnsToList(pivotColsSvc.columns, pivotAllowed), 'toolPanelUi'),
            deActivateFunction: () =>
                pivotColsSvc?.setColumns(this.removeColumnsFromList(pivotColsSvc.columns, pivotAllowed), 'toolPanelUi'),
            addIcon: 'pivotPanel',
            removeIcon: 'pivotPanel',
        });
    }

    private isColumnValidForScrollIntoView(col: AgColumn): boolean {
        const isVisible = col.isVisible();

        if (!isVisible) {
            return false;
        }

        const parent = col.getParent();
        if (!parent) {
            return true;
        }

        return parent.getDisplayedChildren()?.includes(col) ?? true;
    }

    private addColumnsToList(columnList: AgColumn[], predicate: (col: AgColumn) => boolean): AgColumn[] {
        return [...columnList].concat(this.columns.filter((col) => predicate(col) && !columnList.includes(col)));
    }

    private removeColumnsFromList(columnList: AgColumn[], predicate: (col: AgColumn) => boolean): AgColumn[] {
        return columnList.filter((col) => predicate(col) && this.columns.includes(col));
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

        const popupSvc = this.beans.popupSvc!;
        const addPopupRes = popupSvc.addPopup({
            modal: true,
            eChild: eGui,
            closeOnEsc: true,
            afterGuiAttached: () => _focusInto(menuList.getGui()),
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

        popupSvc.positionPopupUnderMouseEvent({
            type: 'columnContextMenu',
            mouseEvent: this.mouseEventOrTouch,
            ePopup: eGui,
        });
    }

    private isActive(): boolean {
        return this.allowScrollIntoView || this.allowGrouping || this.allowValues || this.allowPivoting;
    }

    private getMappedMenuItems(): MenuItemDef[] {
        const ret: MenuItemDef[] = [];
        const { menuItemMap, columns, displayName, beans } = this;
        for (const val of menuItemMap.values()) {
            const isInactive = columns.some((col) => val.allowedFunction(col) && !val.activeFunction(col));
            const isActive = columns.some((col) => val.allowedFunction(col) && val.activeFunction(col));

            if (isInactive) {
                ret.push({
                    name: val.activateLabel(displayName!),
                    icon: _createIconNoSpan(val.addIcon, beans, null),
                    action: () => val.activateFunction(),
                });
            }

            if (isActive && val.removeIcon && val.deactivateLabel) {
                ret.push({
                    name: val.deactivateLabel(displayName!),
                    icon: _createIconNoSpan(val.removeIcon, beans, null),
                    action: () => val.deActivateFunction?.(),
                });
            }
        }

        return ret;
    }
}
