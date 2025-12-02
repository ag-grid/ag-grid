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
    GridOptionsService,
    GridOptionsWithDefaults,
    IContextMenuService,
    IMenuActionParams,
    MenuItemDef,
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
    _areCellsEqual,
    _exists,
    _getGrandTotalRow,
    _isIOSUserAgent,
    _isKeyboardMode,
    _isNothingFocused,
} from 'ag-grid-community';

import { AgContextMenuService } from '../agStack/agContextMenuService';
import { MENU_ITEM_CALLBACKS } from '../widgets/menuItemComponent';
import type { MenuItemMapper } from './menuItemMapper';
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

        const defaultMenuOptions: DefaultMenuItem[] = [];

        const { clipboardSvc, chartSvc, csvCreator, excelCreator, colModel, rangeSvc, gos } = this.beans;

        if (_exists(node) && clipboardSvc) {
            if (column) {
                // only makes sense if column exists, could have originated from a row
                if (!gos.get('suppressCutToClipboard')) {
                    defaultMenuOptions.push('cut');
                }
                defaultMenuOptions.push('copy', 'copyWithHeaders', 'copyWithGroupHeaders', 'paste', 'separator');
            }
        }

        if (gos.get('enableCharts') && chartSvc) {
            if (colModel.isPivotMode()) {
                defaultMenuOptions.push('pivotChart');
            }

            if (rangeSvc && !rangeSvc.isEmpty()) {
                defaultMenuOptions.push('chartRange');
            }
        }

        // if user clicks a cell
        if (_exists(node)) {
            const enableRowPinning = gos.get('enableRowPinning');
            const isRowPinnable = gos.get('isRowPinnable');
            if (enableRowPinning) {
                const isGroupTotalRow = node.level > -1 && node.footer;
                const isGrandTotalRow = node.level === -1 && node.footer;
                const grandTotalRow = _getGrandTotalRow(gos);
                const isGrandTotalRowFixed = grandTotalRow === 'pinnedBottom' || grandTotalRow === 'pinnedTop';

                // We do not allow pinning of group total rows. As such, only show pinning related menu options for
                // grand total rows that are not fixed in place, and normal rows that are not group total rows.
                if ((isGrandTotalRow && !isGrandTotalRowFixed) || (!isGrandTotalRow && !isGroupTotalRow)) {
                    const pinnable = isRowPinnable?.(node) ?? true;
                    // `pinnable` determines whether pinned status can be affected by the user via the context menu,
                    // not whether the row may be pinned at all (via for example, the `isRowPinned` callback).
                    // As-such if `pinnable` is falsy, don't show any context menu options for the end user.
                    if (pinnable) {
                        defaultMenuOptions.push('pinRowSubMenu');
                    }
                }
            }

            const suppressExcel = gos.get('suppressExcelExport') || !excelCreator;
            const suppressCsv = gos.get('suppressCsvExport') || !csvCreator;
            const onIPad = _isIOSUserAgent();
            const anyExport = !onIPad && (!suppressExcel || !suppressCsv);
            if (anyExport) {
                defaultMenuOptions.push('export');
            }
        }

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

    public showContextMenu(params: EventShowContextMenuParams & { anchorToElement?: HTMLElement }): void {
        const rowNode = (params.rowNode ?? null) as RowNode | null;
        const column = (params.column ?? null) as AgColumn | null;
        let { anchorToElement, value, source } = params;

        if (rowNode && column && value == null) {
            value = this.beans.valueSvc.getValueForDisplay({ column, node: rowNode }).value;
        }

        if (anchorToElement == null) {
            anchorToElement = this.getContextMenuAnchorElement(rowNode, column);
        }

        (this.beans.menuUtils as MenuUtils).onContextMenu({
            mouseEvent: (params as MouseShowContextMenuParams).mouseEvent ?? null,
            touchEvent: (params as TouchShowContextMenuParam).touchEvent ?? null,
            showMenuCallback: (eventOrTouch) =>
                this.menu.showMenu({ node: rowNode, column, value }, eventOrTouch, anchorToElement),
            source,
        });
    }

    public handleContextMenuMouseEvent(
        mouseEvent: MouseEvent | undefined,
        touchEvent: TouchEvent | undefined,
        rowCtrl: RowCtrl | null,
        cellCtrl: CellCtrl
    ): void {
        // prio cell ctrl first, in case of spanned cell, then rowCtrl in case of full width row
        const rowNode = cellCtrl?.rowNode ?? rowCtrl?.rowNode ?? null;
        const column = cellCtrl?.column ?? rowCtrl?.findFullWidthInfoForEvent(mouseEvent || touchEvent)?.column ?? null;
        const { valueSvc, ctrlsSvc } = this.beans;
        const value = column ? valueSvc.getValue(column, rowNode) : null;

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
        const focusSvc = beans.focusSvc;
        const currentFocusedCell = focusSvc.getFocusedCell();

        if (currentFocusedCell && focusedCell && _areCellsEqual(currentFocusedCell, focusedCell)) {
            const { rowIndex, rowPinned, column } = focusedCell;

            if (_isNothingFocused(beans)) {
                focusSvc.setFocusedCell({
                    rowIndex,
                    column,
                    rowPinned,
                    forceBrowserFocus: true,
                    preventScrollOnBrowserFocus: !_isKeyboardMode(),
                });
            }
        }
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
            return rowCtrl.getFullWidthElement() as HTMLElement;
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
            getGui,
            'contextMenu'
        );
    }
}
