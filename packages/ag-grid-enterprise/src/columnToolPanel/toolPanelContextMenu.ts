import { _focusInto } from 'ag-stack';

import type { AgColumn, AgProvidedColumnGroup, IconName, MenuItemDef } from 'ag-grid-community';
import { Component, _createIconNoSpan, isProvidedColumnGroup } from 'ag-grid-community';

import { getGroupingLocaleText, isRowGroupColLocked } from '../rowGrouping/rowGroupingUtils';
import { MenuList } from '../widgets/menuList';
import { isDeferredMode, refreshDeferredToolPanelUi } from './toolPanelDeferredUiUtils';
import type { ColumnStateUpdateParams } from './updates/columnStateUpdateTypes';

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
        private readonly parentEl: HTMLElement,
        private readonly params: ColumnStateUpdateParams = {}
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
        if (column.isColumn) {
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
        const updateStrategy = this.beans.columnStateUpdateStrategy;
        let columns: AgColumn[];
        if (isProvidedColumnGroup(column)) {
            columns = column.getLeafColumns();
        } else {
            columns = [column];
        }
        this.columns = columns;

        const isPivotMode = updateStrategy.getPivotMode(isDeferredMode(this.params));

        this.allowScrollIntoView = !isPivotMode && columns.some(this.isColumnValidForScrollIntoView);
        this.allowGrouping = columns.some((col) => col.primary && col.isAllowRowGroup());
        this.allowValues = columns.some((col) => col.primary && col.isAllowValue());
        this.allowPivoting = isPivotMode && columns.some((col) => col.isPrimary() && col.isAllowPivot());
    }

    private buildMenuItemMap(): void {
        const localeTextFunc = this.getLocaleTextFunc();
        const { beans, displayName } = this;
        const updateStrategy = this.beans.columnStateUpdateStrategy;

        const menuItemMap = new Map<MenuItemName, MenuItemProperty>();
        this.menuItemMap = menuItemMap;

        const deferMode = isDeferredMode(this.params);
        const isPivotMode = updateStrategy.getPivotMode(deferMode);
        const rowGroupColIdSet = new Set(
            updateStrategy.getRowGroupColumns(deferMode).map((col: AgColumn) => col.colId)
        );
        const valueColIdSet = new Set(updateStrategy.getValueColumns(deferMode).map((col: AgColumn) => col.colId));
        const pivotColIdSet = new Set(updateStrategy.getPivotColumns(deferMode).map((col: AgColumn) => col.colId));

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
            col.primary && col.isAllowRowGroup() && !isRowGroupColLocked(col, beans);
        menuItemMap.set('rowGroup', {
            allowedFunction: rowGroupAllowed,
            activeFunction: (col) => rowGroupColIdSet.has(col.colId),
            activateLabel: () => getGroupingLocaleText(localeTextFunc, 'groupBy', displayName!),
            deactivateLabel: () => getGroupingLocaleText(localeTextFunc, 'ungroupBy', displayName!),
            activateFunction: () => {
                const columns = this.addColumnsToList(updateStrategy.getRowGroupColumns(deferMode), rowGroupAllowed);
                updateStrategy.setRowGroupColumns(deferMode, columns, 'toolPanelUi');
                refreshDeferredToolPanelUi(this.beans, this.params);
            },
            deActivateFunction: () => {
                const columns = this.removeColumnsFromList(
                    updateStrategy.getRowGroupColumns(deferMode),
                    rowGroupAllowed
                );
                updateStrategy.setRowGroupColumns(deferMode, columns, 'toolPanelUi');
                refreshDeferredToolPanelUi(this.beans, this.params);
            },
            addIcon: 'menuAddRowGroup',
            removeIcon: 'menuRemoveRowGroup',
        });

        const valueAllowed = (col: AgColumn) => col.primary && col.isAllowValue();
        menuItemMap.set('value', {
            allowedFunction: valueAllowed,
            activeFunction: (col) => valueColIdSet.has(col.colId),
            activateLabel: () => localeTextFunc('addToValues', `Add ${displayName} to values`, [displayName!]),
            deactivateLabel: () =>
                localeTextFunc('removeFromValues', `Remove ${displayName} from values`, [displayName!]),
            activateFunction: () => {
                const columns = this.addColumnsToList(updateStrategy.getValueColumns(deferMode), valueAllowed);
                updateStrategy.setValueColumns(deferMode, columns, 'toolPanelUi');
                refreshDeferredToolPanelUi(this.beans, this.params);
            },
            deActivateFunction: () => {
                const columns = this.removeColumnsFromList(updateStrategy.getValueColumns(deferMode), valueAllowed);
                updateStrategy.setValueColumns(deferMode, columns, 'toolPanelUi');
                refreshDeferredToolPanelUi(this.beans, this.params);
            },
            addIcon: 'valuePanel',
            removeIcon: 'valuePanel',
        });

        const pivotAllowed = (col: AgColumn) => isPivotMode && col.primary && col.isAllowPivot();
        menuItemMap.set('pivot', {
            allowedFunction: pivotAllowed,
            activeFunction: (col) => pivotColIdSet.has(col.colId),
            activateLabel: () => localeTextFunc('addToLabels', `Add ${displayName} to labels`, [displayName!]),
            deactivateLabel: () =>
                localeTextFunc('removeFromLabels', `Remove ${displayName} from labels`, [displayName!]),
            activateFunction: () => {
                const columns = this.addColumnsToList(updateStrategy.getPivotColumns(deferMode), pivotAllowed);
                updateStrategy.setPivotColumns(deferMode, columns, 'toolPanelUi');
                refreshDeferredToolPanelUi(this.beans, this.params);
            },
            deActivateFunction: () => {
                const columns = this.removeColumnsFromList(updateStrategy.getPivotColumns(deferMode), pivotAllowed);
                updateStrategy.setPivotColumns(deferMode, columns, 'toolPanelUi');
                refreshDeferredToolPanelUi(this.beans, this.params);
            },
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
        const existing = new Set(columnList);
        const additions: AgColumn[] = [];
        for (let i = 0, len = this.columns.length; i < len; ++i) {
            const col = this.columns[i];
            if (predicate(col) && !existing.has(col)) {
                additions.push(col);
            }
        }
        return columnList.concat(additions);
    }

    private removeColumnsFromList(columnList: AgColumn[], predicate: (col: AgColumn) => boolean): AgColumn[] {
        const toRemove = new Set(this.columns);
        return columnList.filter((col) => !predicate(col) || !toRemove.has(col));
    }

    private displayContextMenu(menuItemsMapped: MenuItemDef[]): void {
        const eGui = this.getGui();
        const menuList = this.createBean(new MenuList());
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
