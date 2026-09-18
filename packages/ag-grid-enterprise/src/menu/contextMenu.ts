import type {
    AgColumn,
    AgComponentSelectorType,
    AgEventTypeParams,
    AgGridCommon,
    BeanCollection,
    CellCtrl,
    CellPosition,
    DefaultMenuItem,
    EventShowContextMenuParams,
    GetNoteParams,
    GridOptionsService,
    GridOptionsWithDefaults,
    IContextMenuService,
    IMenuActionParams,
    MenuItemDef,
    MenuItemProviderParams,
    MouseShowContextMenuParams,
    NamedBean,
    RowCtrl,
    RowNode,
    TouchShowContextMenuParam,
    WithoutGridCommon,
} from 'ag-grid-community';
import {
    BeanStub,
    _addGridCommonParams,
    _attemptToRestoreCellFocus,
    isRowNumberCol,
    isSpecialCol,
} from 'ag-grid-community';

import { AgContextMenuService } from '../agStack/agContextMenuService';
import { MENU_ITEM_CALLBACKS } from '../widgets/menuItemComponent';
import type { MenuItemMapper } from './menuItemMapper';
import { _getMenuItemProviders } from './menuItemProviders';
import type { MenuUtils } from './menuUtils';

const CSS_CONTEXT_MENU_OPEN = 'ag-context-menu-open';

export class ContextMenuService extends BeanStub implements NamedBean, IContextMenuService {
    beanName = 'contextMenuSvc' as const;

    private menu: AgContextMenuService<
        BeanCollection,
        GridOptionsWithDefaults,
        AgEventTypeParams,
        AgGridCommon<any, any>,
        GridOptionsService,
        AgComponentSelectorType,
        IMenuActionParams,
        DefaultMenuItem
    >;

    private focusedCell: CellPosition | null = null;

    postConstruct(): void {
        this.menu = this.createManagedBean(
            new AgContextMenuService<
                BeanCollection,
                GridOptionsWithDefaults,
                AgEventTypeParams,
                AgGridCommon<any, any>,
                GridOptionsService,
                AgComponentSelectorType,
                IMenuActionParams,
                DefaultMenuItem
            >({
                menuItemCallbacks: MENU_ITEM_CALLBACKS,
                getMenuItems: this.getMenuItems.bind(this),
                mapMenuItems: this.mapWithStockItems.bind(this),
                beforeMenuOpen: this.beforeMenuOpen.bind(this),
                onMenuOpen: this.onMenuOpen.bind(this),
                onMenuClose: this.onMenuClose.bind(this),
                afterMenuDestroyed: this.afterMenuDestroyed.bind(this),
                onVisibleChanged: this.dispatchVisibleChangedEvent.bind(this),
                // overlay was displayed
                shouldBlockMenuOpen: () => !!this.beans.overlays?.exclusive,
            })
        );
    }

    public hideActiveMenu(): void {
        this.menu.hideActiveMenu();
    }

    private getMenuItems(
        menuActionParams: WithoutGridCommon<IMenuActionParams>,
        mouseEvent: MouseEvent | Touch
    ): (DefaultMenuItem | MenuItemDef)[] | Promise<(DefaultMenuItem | MenuItemDef<any, any>)[]> | undefined {
        const { column, node, value } = menuActionParams;

        const { rowNumbersSvc, gos } = this.beans;

        // a selection or row-number cell has no data of its own, so it offers the row-level items only; the exception
        // is a row-number cell whose click selects the whole row, as the cell items then act on that row
        const isDatalessSpecialCell =
            !!column && isSpecialCol(column) && !(isRowNumberCol(column) && rowNumbersSvc?.isIntegratedWithSelection);
        const providerParams: MenuItemProviderParams = {
            column: column ?? null,
            dataColumn: isDatalessSpecialCell ? null : (column ?? null),
            node: node ?? null,
        };
        const defaultMenuOptions = _getMenuItemProviders(this.beans).flatMap((provider) =>
            provider.getContextMenuItems(providerParams)
        );

        const defaultItems = defaultMenuOptions.length ? defaultMenuOptions : undefined;
        const columnContextMenuItems = column?.getColDef().contextMenuItems;

        if (Array.isArray(columnContextMenuItems)) {
            return columnContextMenuItems;
        }

        if (typeof columnContextMenuItems === 'function') {
            return columnContextMenuItems(
                _addGridCommonParams(gos, {
                    column,
                    node,
                    value,
                    defaultItems,
                    event: mouseEvent,
                })
            );
        }

        const userFunc = gos.getCallback('getContextMenuItems');

        return userFunc?.({ column, node, value, defaultItems, event: mouseEvent }) ?? defaultMenuOptions;
    }

    public getContextMenuPosition(rowNode?: RowNode | null, column?: AgColumn | null): { x: number; y: number } {
        const rowCtrl = this.getRowCtrl(rowNode);
        const eGui = this.getCellGui(rowCtrl, column);

        if (!eGui) {
            return { x: 0, y: rowCtrl?.getRowYPosition() ?? 0 };
        }

        const rect = eGui.getBoundingClientRect();

        return {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
        };
    }

    public showContextMenu(
        params: EventShowContextMenuParams & { anchorToElement?: HTMLElement; noteParams?: GetNoteParams }
    ): void {
        const rowNode = (params.rowNode ?? null) as RowNode | null;
        const column = (params.column ?? null) as AgColumn | null;
        let { anchorToElement, value, source, noteParams } = params;

        if (rowNode && column && value == null) {
            value = this.beans.valueSvc.getDisplayValue(column, rowNode, 'edit', false);
        }

        if (anchorToElement == null) {
            anchorToElement = this.getContextMenuAnchorElement(rowNode, column);
        }

        (this.beans.menuUtils as MenuUtils).onContextMenu({
            mouseEvent: (params as MouseShowContextMenuParams).mouseEvent ?? null,
            touchEvent: (params as TouchShowContextMenuParam).touchEvent ?? null,
            showMenuCallback: (eventOrTouch) =>
                this.menu.showMenu({ node: rowNode, column, value, noteParams }, eventOrTouch, anchorToElement),
            source,
        });
    }

    public handleContextMenuMouseEvent(
        mouseEvent: MouseEvent | undefined,
        touchEvent: TouchEvent | undefined,
        rowCtrl: RowCtrl | null,
        cellCtrl: CellCtrl | null
    ): void {
        // prio cell ctrl first, in case of spanned cell, then rowCtrl in case of full width row
        const fullWidthInfo = rowCtrl?.findInfoForEvent(mouseEvent || touchEvent);
        const rowNode = cellCtrl?.rowNode ?? rowCtrl?.rowNode ?? null;
        const column =
            cellCtrl?.column ??
            fullWidthInfo?.column ??
            (rowCtrl?.isFullWidth() ? rowCtrl.getNavigationColumn() : null);
        const noteParams: GetNoteParams | undefined = cellCtrl
            ? { rowNode: cellCtrl.rowNode, column: cellCtrl.column }
            : rowCtrl && fullWidthInfo
              ? {
                    rowNode: rowCtrl.rowNode,
                    location: 'fullWidthRow' as const,
                    pinned:
                        fullWidthInfo.pinned === 'left' || fullWidthInfo.pinned === 'right'
                            ? fullWidthInfo.pinned
                            : undefined,
                }
              : undefined;
        const { valueSvc, ctrlsSvc } = this.beans;
        const value = column ? valueSvc.getValue(column, rowNode, 'edit') : null;

        // if user clicked on a cell, anchor to that cell, otherwise anchor to the grid panel
        const gridBodyCon = ctrlsSvc.getGridBodyCtrl();
        const anchorToElement = cellCtrl ? cellCtrl.eGui : gridBodyCon.eGridBody;

        this.showContextMenu({
            mouseEvent,
            touchEvent,
            rowNode,
            column,
            value,
            anchorToElement,
            noteParams,
            source: 'ui',
        } as EventShowContextMenuParams);
    }

    private beforeMenuOpen(menuActionParams: WithoutGridCommon<IMenuActionParams>): void {
        if (!menuActionParams.column) {
            // the context menu has been opened not on a cell, therefore we don't want to
            // display the previous cell as focused, or return focus there after
            this.beans.focusSvc.clearFocusedCell();
        }
    }

    private onMenuOpen(): void {
        const { ctrlsSvc, focusSvc } = this.beans;
        ctrlsSvc.getGridBodyCtrl().eGridBody.classList.add(CSS_CONTEXT_MENU_OPEN);
        this.focusedCell = focusSvc.getFocusedCell();
    }

    private onMenuClose(): void {
        this.beans.ctrlsSvc.getGridBodyCtrl().eGridBody.classList.remove(CSS_CONTEXT_MENU_OPEN);
    }

    private afterMenuDestroyed(): void {
        const { beans, focusedCell } = this;
        _attemptToRestoreCellFocus(beans, focusedCell);
    }

    private dispatchVisibleChangedEvent(visible: boolean, source: 'api' | 'ui'): void {
        this.eventSvc.dispatchEvent({
            type: 'contextMenuVisibleChanged',
            visible,
            source,
        });
    }

    private getRowCtrl(rowNode?: RowNode | null): RowCtrl | undefined {
        const { rowIndex, rowPinned } = rowNode || {};

        if (rowIndex == null) {
            return;
        }

        return this.beans.rowRenderer.getRowByPosition({ rowIndex, rowPinned }) || undefined;
    }

    private getCellGui(rowCtrl?: RowCtrl, column?: AgColumn | null): HTMLElement | undefined {
        if (!rowCtrl || !column) {
            return;
        }

        const cellCtrl = rowCtrl.getCellCtrl(column);

        return cellCtrl?.eGui || undefined;
    }

    private getContextMenuAnchorElement(rowNode: RowNode | null, column?: AgColumn | null): HTMLElement {
        const gridBodyEl = this.beans.ctrlsSvc.getGridBodyCtrl().eGridBody;
        const rowCtrl = this.getRowCtrl(rowNode);

        if (!rowCtrl) {
            return gridBodyEl;
        }

        const cellGui = this.getCellGui(rowCtrl, column);

        if (cellGui) {
            return cellGui;
        }

        if (rowCtrl.isFullWidth()) {
            return rowCtrl.getRowContentElement() as HTMLElement;
        }

        return gridBodyEl;
    }

    private mapWithStockItems(
        menuItems: (DefaultMenuItem | MenuItemDef<any, any>)[],
        menuActionParams: WithoutGridCommon<IMenuActionParams>,
        getGui: () => HTMLElement
    ): (MenuItemDef | DefaultMenuItem)[] {
        const { column, node } = menuActionParams;
        return (this.beans.menuItemMapper as MenuItemMapper).mapWithStockItems(
            menuItems,
            column as AgColumn | null,
            node as RowNode | null,
            menuActionParams.noteParams,
            getGui,
            'contextMenu'
        );
    }
}
