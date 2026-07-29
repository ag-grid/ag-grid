import type {
    AgColumn,
    AgProvidedColumnGroup,
    ColumnEventType,
    ColumnMenuItemsSource,
    DefaultColumnMenuItem,
    DefaultMenuItem,
    DefaultToolPanelItem,
    IconName,
    MenuItemDef,
} from 'ag-grid-community';
import { Component, _createIconNoSpan, isProvidedColumnGroup } from 'ag-grid-community';

import { _resolveColumnMenuItems } from '../menu/columnMenuItemsResolver';
import { PIVOT_TOKEN, SCROLL_INTO_VIEW_TOKEN, VALUE_TOKEN, columnMenuTokenLabel } from '../menu/columnMenuTokenLabels';
import type { MenuItemMapper } from '../menu/menuItemMapper';
import { MENU_ITEM_SEPARATOR, _normaliseSeparators } from '../menu/menuSeparators';
import { getGroupingLocaleText, isRowGroupColLocked } from '../rowGrouping/rowGroupingUtils';
import { MenuList } from '../widgets/menuList';
import { isDeferredMode, refreshDeferredToolPanelUi } from './toolPanelDeferredUiUtils';
import type { ColumnStateUpdateParams } from './updates/columnStateUpdateTypes';

type MenuItemProperty = {
    allowedFunction: (col: AgColumn) => boolean;
    activeFunction: (col: AgColumn) => boolean;
    activateLabel: (name: string) => string;
    activateFunction: () => void;
    deactivateLabel?: (name: string) => string;
    deActivateFunction?: () => void;
    addIcon: IconName;
    removeIcon?: IconName;
    /** Whether the item changes column state, and so must be disabled under `functionsReadOnly`. */
    mutatesState?: boolean;
};

export class ToolPanelContextMenu extends Component {
    private columns: AgColumn[];
    private allowScrollIntoView: boolean;
    private allowGrouping: boolean;
    private allowValues: boolean;
    private allowPivoting: boolean;
    private allowEditHeaderName: boolean;
    private menuItemMap: Map<DefaultToolPanelItem, MenuItemProperty>;
    private displayName: string | null = null;

    constructor(
        private readonly column: AgColumn | AgProvidedColumnGroup,
        private readonly mouseEventOrTouch: MouseEvent | Touch,
        private readonly parentEl: HTMLElement,
        private readonly params: ColumnStateUpdateParams,
        private readonly eventType: ColumnEventType,
        private readonly source: ColumnMenuItemsSource
    ) {
        super({ tag: 'div', cls: 'ag-menu' });
    }

    public postConstruct(): void {
        const {
            column,
            gos,
            source,
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

        let col: AgColumn | null = null;
        let columnGroup: AgProvidedColumnGroup | null = null;
        if (isProvidedColumnGroup(column)) {
            columnGroup = column;
        } else {
            col = column;
        }

        // Under functionsReadOnly the state-changing defaults are dropped, but non-mutating items (scroll
        // into view) remain, so a read-only grid can still be navigated. A user callback can additionally
        // contribute items. An explicitly-returned state-changing token still renders disabled rather than
        // being dropped (see resolveToolPanelToken), so read-only cannot be bypassed.
        const functionsReadOnly = gos.get('functionsReadOnly');
        let defaultItems: DefaultToolPanelItem[];
        if (!this.isActive()) {
            defaultItems = [];
        } else if (functionsReadOnly) {
            defaultItems = this.getDefaultTokens().filter((token) => !this.menuItemMap.get(token)?.mutatesState);
        } else {
            defaultItems = this.getDefaultTokens();
        }

        const resolvedItems = _resolveColumnMenuItems(gos, col, columnGroup, source, defaultItems);
        const menuItemsMapped = this.mapMenuItems(resolvedItems, col);

        if (this.allowEditHeaderName) {
            const editColumnNameItem = this.beans.colHeaderEditSvc!.getEditColumnNameMenuItem(this.column);
            if (editColumnNameItem) {
                menuItemsMapped.unshift(editColumnNameItem);
            }
        }

        // Suppress the native browser context menu only when AG Grid handles the gesture: it shows a menu, or
        // a per-column/group `columnMenuItems` is explicitly configured (including an empty array, which
        // deliberately shows nothing). A grid-level `getColumnMenuItems` that resolves to nothing for this
        // column does not suppress it, matching how the grid only blocks the browser menu when it has items.
        const colOrGroupDef = col?.colDef ?? columnGroup?.getColGroupDef();
        const handled = menuItemsMapped.length > 0 || colOrGroupDef?.columnMenuItems != null;
        if (handled) {
            const mouseEventOrTouch = this.mouseEventOrTouch;
            if ('preventDefault' in mouseEventOrTouch) {
                mouseEventOrTouch.preventDefault();
            }
        }

        if (menuItemsMapped.length === 0) {
            return;
        }

        this.displayContextMenu(menuItemsMapped);
    }

    private mapMenuItems(
        items: (DefaultColumnMenuItem | MenuItemDef)[],
        column: AgColumn | null
    ): (MenuItemDef | 'separator')[] {
        // Resolve our own tool panel tokens locally (they carry tool-panel-specific actions), preserving
        // order. Everything else (custom items, cross-surface stock tokens such as pin) is left for the mapper.
        const { menuItemMap } = this;
        const expanded: (DefaultMenuItem | MenuItemDef | 'separator')[] = [];
        for (let i = 0, len = items.length; i < len; ++i) {
            const item = items[i];
            if (typeof item === 'string') {
                const token = item as DefaultToolPanelItem;
                if (menuItemMap.has(token)) {
                    expanded.push(...this.resolveToolPanelToken(token));
                    continue;
                }
            }
            expanded.push(item as DefaultMenuItem | MenuItemDef);
        }

        const menuItemMapper = this.beans.menuItemMapper as MenuItemMapper | undefined;
        // Without the menu module (which provides the mapper) any remaining stock string tokens (e.g. pin)
        // cannot be resolved, so keep the built definitions and drop the tokens.
        const mapped: (MenuItemDef | 'separator')[] = menuItemMapper
            ? menuItemMapper.mapWithStockItems(expanded, column, null, undefined, () => this.getGui(), this.eventType)
            : expanded.filter((item): item is MenuItemDef => typeof item !== 'string');

        // Collapse duplicate/stranded separators, matching the column menu (ColumnMenuFactory.getMenuItems).
        _normaliseSeparators(mapped, MENU_ITEM_SEPARATOR);
        return mapped;
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
        const headerNameEditable = isProvidedColumnGroup(column)
            ? !!column.colGroupDef?.headerNameEditable
            : !!column.colDef.headerNameEditable;
        const isCalculatedCol = !isProvidedColumnGroup(column) && column.isCalculatedCol;
        this.allowEditHeaderName = !!this.beans.colHeaderEditSvc && headerNameEditable && !isCalculatedCol;
    }

    private buildMenuItemMap(): void {
        const localeTextFunc = this.getLocaleTextFunc();
        const { beans, displayName } = this;
        const updateStrategy = this.beans.columnStateUpdateStrategy;

        const menuItemMap = new Map<DefaultToolPanelItem, MenuItemProperty>();
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
                columnMenuTokenLabel(
                    localeTextFunc,
                    SCROLL_INTO_VIEW_TOKEN.key,
                    SCROLL_INTO_VIEW_TOKEN.default,
                    displayName!
                ),
            activateFunction: () => {
                const firstVisibleColumn = this.columns.find(this.isColumnValidForScrollIntoView);

                if (firstVisibleColumn) {
                    this.beans.ctrlsSvc.getScrollFeature().ensureColumnVisible(firstVisibleColumn);
                }
            },
            deActivateFunction: () => {},
            addIcon: SCROLL_INTO_VIEW_TOKEN.icon,
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
                updateStrategy.setRowGroupColumns(deferMode, columns, this.eventType);
                refreshDeferredToolPanelUi(this.beans, this.params);
            },
            deActivateFunction: () => {
                const columns = this.removeColumnsFromList(
                    updateStrategy.getRowGroupColumns(deferMode),
                    rowGroupAllowed
                );
                updateStrategy.setRowGroupColumns(deferMode, columns, this.eventType);
                refreshDeferredToolPanelUi(this.beans, this.params);
            },
            addIcon: 'menuAddRowGroup',
            removeIcon: 'menuRemoveRowGroup',
            mutatesState: true,
        });

        const valueAllowed = (col: AgColumn) => col.primary && col.isAllowValue();
        menuItemMap.set('value', {
            allowedFunction: valueAllowed,
            activeFunction: (col) => valueColIdSet.has(col.colId),
            activateLabel: () =>
                columnMenuTokenLabel(localeTextFunc, VALUE_TOKEN.addKey, VALUE_TOKEN.addDefault, displayName!),
            deactivateLabel: () =>
                columnMenuTokenLabel(localeTextFunc, VALUE_TOKEN.removeKey, VALUE_TOKEN.removeDefault, displayName!),
            activateFunction: () => {
                const columns = this.addColumnsToList(updateStrategy.getValueColumns(deferMode), valueAllowed);
                updateStrategy.setValueColumns(deferMode, columns, this.eventType);
                refreshDeferredToolPanelUi(this.beans, this.params);
            },
            deActivateFunction: () => {
                const columns = this.removeColumnsFromList(updateStrategy.getValueColumns(deferMode), valueAllowed);
                updateStrategy.setValueColumns(deferMode, columns, this.eventType);
                refreshDeferredToolPanelUi(this.beans, this.params);
            },
            addIcon: VALUE_TOKEN.icon,
            removeIcon: VALUE_TOKEN.icon,
            mutatesState: true,
        });

        const pivotAllowed = (col: AgColumn) => isPivotMode && col.primary && col.isAllowPivot();
        menuItemMap.set('pivot', {
            allowedFunction: pivotAllowed,
            activeFunction: (col) => pivotColIdSet.has(col.colId),
            activateLabel: () =>
                columnMenuTokenLabel(localeTextFunc, PIVOT_TOKEN.addKey, PIVOT_TOKEN.addDefault, displayName!),
            deactivateLabel: () =>
                columnMenuTokenLabel(localeTextFunc, PIVOT_TOKEN.removeKey, PIVOT_TOKEN.removeDefault, displayName!),
            activateFunction: () => {
                const columns = this.addColumnsToList(updateStrategy.getPivotColumns(deferMode), pivotAllowed);
                updateStrategy.setPivotColumns(deferMode, columns, this.eventType);
                refreshDeferredToolPanelUi(this.beans, this.params);
            },
            deActivateFunction: () => {
                const columns = this.removeColumnsFromList(updateStrategy.getPivotColumns(deferMode), pivotAllowed);
                updateStrategy.setPivotColumns(deferMode, columns, this.eventType);
                refreshDeferredToolPanelUi(this.beans, this.params);
            },
            addIcon: PIVOT_TOKEN.icon,
            removeIcon: PIVOT_TOKEN.icon,
            mutatesState: true,
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

    private displayContextMenu(menuItemsMapped: (MenuItemDef | 'separator')[]): void {
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
            afterGuiAttached: () => menuList.focusInto(),
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
        return (
            this.allowScrollIntoView ||
            this.allowGrouping ||
            this.allowValues ||
            this.allowPivoting ||
            this.allowEditHeaderName
        );
    }

    private getDefaultTokens(): DefaultToolPanelItem[] {
        const tokens: DefaultToolPanelItem[] = [];
        const { menuItemMap, columns } = this;
        for (const [key, val] of menuItemMap) {
            if (columns.some((col) => val.allowedFunction(col))) {
                tokens.push(key);
            }
        }
        return tokens;
    }

    private resolveToolPanelToken(key: DefaultToolPanelItem): MenuItemDef[] {
        const { menuItemMap, columns, displayName, beans } = this;
        const val = menuItemMap.get(key);
        if (!val) {
            return [];
        }

        const ret: MenuItemDef[] = [];
        const isInactive = columns.some((col) => val.allowedFunction(col) && !val.activeFunction(col));
        const isActive = columns.some((col) => val.allowedFunction(col) && val.activeFunction(col));

        // State-changing tokens are shown disabled under functionsReadOnly, matching the column menu
        // (MenuItemMapper), so an explicitly-returned token cannot be used to bypass the restriction.
        const disabled = !!val.mutatesState && this.gos.get('functionsReadOnly');

        if (isInactive) {
            ret.push({
                name: val.activateLabel(displayName!),
                icon: _createIconNoSpan(val.addIcon, beans, null),
                disabled,
                action: () => val.activateFunction(),
            });
        }

        if (isActive && val.removeIcon && val.deactivateLabel) {
            ret.push({
                name: val.deactivateLabel(displayName!),
                icon: _createIconNoSpan(val.removeIcon, beans, null),
                disabled,
                action: () => val.deActivateFunction?.(),
            });
        }

        return ret;
    }
}
