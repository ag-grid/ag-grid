import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { AgColumn } from '../entities/agColumn';
import { isColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { RowNode } from '../entities/rowNode';
import type { FilterManager } from '../filter/filterManager';
import type { ContainerType } from '../interfaces/iAfterGuiAttachedParams';
import type { Column } from '../interfaces/iColumn';
import type { IColumnChooserFactory, ShowColumnChooserParams } from '../interfaces/iColumnChooserFactory';
import type { IContextMenuFactory } from '../interfaces/iContextMenuFactory';
import type { IMenuFactory } from '../interfaces/iMenuFactory';
import type { IRowNode } from '../interfaces/iRowNode';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { RowRenderer } from '../rendering/rowRenderer';
import { _isIOSUserAgent } from '../utils/browser';
import { _warnOnce } from '../utils/function';
import type { ValueService } from '../valueService/valueService';
import type { AnimationFrameService } from './animationFrameService';

interface BaseShowColumnMenuParams {
    column?: Column;
}

interface BaseShowFilterMenuParams {
    column: Column;
    containerType: ContainerType;
}

interface MouseShowMenuParams {
    mouseEvent: MouseEvent | Touch;
    positionBy: 'mouse';
}

interface ButtonShowMenuParams {
    buttonElement: HTMLElement;
    positionBy: 'button';
}

interface AutoShowMenuParams {
    positionBy: 'auto';
}

export type ShowColumnMenuParams = (MouseShowMenuParams | ButtonShowMenuParams | AutoShowMenuParams) &
    BaseShowColumnMenuParams;

export type ShowFilterMenuParams = (MouseShowMenuParams | ButtonShowMenuParams | AutoShowMenuParams) &
    BaseShowFilterMenuParams;

export interface ShowContextMenuParams {
    /** The row node associated with the Context Menu */
    rowNode?: IRowNode | null;
    /** The column associated with the Context Menu */
    column?: Column | null;
    /** The value that will be passed to the Context Menu (useful with `getContextMenuItems`). If none is passed, and `rowNode` and `column` are provided, this will be the respective Cell value */
    value: any;
}

interface MouseShowContextMenuParams {
    mouseEvent: MouseEvent;
}

interface TouchShowContextMenuParam {
    touchEvent: TouchEvent;
}

export type EventShowContextMenuParams = (MouseShowContextMenuParams | TouchShowContextMenuParam) &
    ShowContextMenuParams;
export interface IContextMenuParams extends ShowContextMenuParams {
    /** The x position for the Context Menu, if no value is given and `rowNode` and `column` are provided, this will default to be middle of the cell, otherwise it will be `0`. */
    x?: number;
    /** The y position for the Context Menu, if no value is given and `rowNode` and `column` are provided, this will default to be middle of the cell, otherwise it will be `0`. */
    y?: number;
}

export class MenuService extends BeanStub implements NamedBean {
    beanName = 'menuService' as const;

    private filterMenuFactory: IMenuFactory;
    private ctrlsService: CtrlsService;
    private animationFrameService: AnimationFrameService;
    private filterManager?: FilterManager;
    private valueService: ValueService;
    private rowRenderer: RowRenderer;
    private columnChooserFactory?: IColumnChooserFactory;
    private contextMenuFactory?: IContextMenuFactory;
    private enterpriseMenuFactory?: IMenuFactory;

    public wireBeans(beans: BeanCollection): void {
        this.valueService = beans.valueService;
        this.filterMenuFactory = beans.filterMenuFactory;
        this.ctrlsService = beans.ctrlsService;
        this.animationFrameService = beans.animationFrameService;
        this.filterManager = beans.filterManager;
        this.rowRenderer = beans.rowRenderer;
        this.columnChooserFactory = beans.columnChooserFactory;
        this.contextMenuFactory = beans.contextMenuFactory;
        this.enterpriseMenuFactory = beans.enterpriseMenuFactory;
    }

    private activeMenuFactory: IMenuFactory;

    public postConstruct(): void {
        this.activeMenuFactory = this.enterpriseMenuFactory ?? this.filterMenuFactory;
    }

    public showColumnMenu(params: ShowColumnMenuParams): void {
        this.showColumnMenuCommon(this.activeMenuFactory, params, 'columnMenu');
    }

    public showFilterMenu(params: ShowFilterMenuParams): void {
        const menuFactory: IMenuFactory =
            this.enterpriseMenuFactory && this.isLegacyMenuEnabled()
                ? this.enterpriseMenuFactory
                : this.filterMenuFactory;
        this.showColumnMenuCommon(menuFactory, params, params.containerType, true);
    }

    public showHeaderContextMenu(
        column: AgColumn | AgProvidedColumnGroup | undefined,
        mouseEvent?: MouseEvent,
        touchEvent?: TouchEvent
    ): void {
        this.activeMenuFactory.showMenuAfterContextMenuEvent(column, mouseEvent, touchEvent);
    }

    public getContextMenuPosition(rowNode?: RowNode | null, column?: AgColumn | null): { x: number; y: number } {
        const rowCtrl = this.getRowCtrl(rowNode);
        const eGui = this.getCellGui(rowCtrl, column);

        if (!eGui) {
            if (rowCtrl) {
                return { x: 0, y: rowCtrl.getRowYPosition() };
            }
            return { x: 0, y: 0 };
        }

        const rect = eGui.getBoundingClientRect();

        return {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
        };
    }

    public showContextMenu(params: EventShowContextMenuParams & { anchorToElement?: HTMLElement }): void {
        const rowNode = params.rowNode as RowNode | null | undefined;
        const column = params.column as AgColumn | null | undefined;
        let { anchorToElement, value } = params;

        if (rowNode && column && value == null) {
            value = this.valueService.getValueForDisplay(column, rowNode);
        }

        if (anchorToElement == null) {
            anchorToElement = this.getContextMenuAnchorElement(rowNode, column);
        }

        this.contextMenuFactory?.onContextMenu(
            (params as MouseShowContextMenuParams).mouseEvent ?? null,
            (params as TouchShowContextMenuParam).touchEvent ?? null,
            rowNode ?? null,
            column ?? null,
            value,
            anchorToElement
        );
    }

    public showColumnChooser(params: ShowColumnChooserParams): void {
        this.columnChooserFactory?.showColumnChooser(params);
    }

    public hidePopupMenu(): void {
        // hide the context menu if in enterprise
        this.contextMenuFactory?.hideActiveMenu();
        // and hide the column menu always
        this.activeMenuFactory.hideActiveMenu();
    }

    public hideColumnChooser(): void {
        this.columnChooserFactory?.hideActiveColumnChooser();
    }

    public isColumnMenuInHeaderEnabled(column: AgColumn): boolean {
        const { suppressMenu, suppressHeaderMenuButton } = column.getColDef();
        const isSuppressMenuButton = suppressHeaderMenuButton ?? suppressMenu;
        return (
            !isSuppressMenuButton &&
            this.activeMenuFactory.isMenuEnabled(column) &&
            (this.isLegacyMenuEnabled() || !!this.enterpriseMenuFactory)
        );
    }

    public isFilterMenuInHeaderEnabled(column: AgColumn): boolean {
        return !column.getColDef().suppressHeaderFilterButton && !!this.filterManager?.isFilterAllowed(column);
    }

    public isHeaderContextMenuEnabled(column?: AgColumn | AgProvidedColumnGroup): boolean {
        const colDef = column && isColumn(column) ? column.getColDef() : column?.getColGroupDef();
        return !colDef?.suppressHeaderContextMenu && this.getColumnMenuType() === 'new';
    }

    public isHeaderMenuButtonAlwaysShowEnabled(): boolean {
        return this.isSuppressMenuHide();
    }

    public isHeaderMenuButtonEnabled(): boolean {
        // we don't show the menu if on an iPad/iPhone, as the user cannot have a pointer device/
        // However if suppressMenuHide is set to true the menu will be displayed alwasys, so it's ok
        // to show it on iPad in this case (as hover isn't needed). If suppressMenuHide
        // is false (default) user will need to use longpress to display the menu.
        const menuHides = !this.isSuppressMenuHide();

        const onIpadAndMenuHides = _isIOSUserAgent() && menuHides;

        return !onIpadAndMenuHides;
    }

    public isHeaderFilterButtonEnabled(column: AgColumn): boolean {
        return (
            this.isFilterMenuInHeaderEnabled(column) &&
            !this.isLegacyMenuEnabled() &&
            !this.isFloatingFilterButtonDisplayed(column)
        );
    }

    public isFilterMenuItemEnabled(column: AgColumn): boolean {
        return (
            !!this.filterManager?.isFilterAllowed(column) &&
            !this.isLegacyMenuEnabled() &&
            !this.isFilterMenuInHeaderEnabled(column) &&
            !this.isFloatingFilterButtonDisplayed(column)
        );
    }

    public isColumnMenuAnchoringEnabled(): boolean {
        return !this.isLegacyMenuEnabled();
    }

    public areAdditionalColumnMenuItemsEnabled(): boolean {
        return this.getColumnMenuType() === 'new';
    }

    public isLegacyMenuEnabled(): boolean {
        return this.getColumnMenuType() === 'legacy';
    }

    public isFloatingFilterButtonEnabled(column: AgColumn): boolean {
        const colDef = column.getColDef();
        const legacySuppressFilterButton = colDef.floatingFilterComponentParams?.suppressFilterButton;
        if (legacySuppressFilterButton != null) {
            _warnOnce(
                `As of v31.1, 'colDef.floatingFilterComponentParams.suppressFilterButton' is deprecated. Use 'colDef.suppressFloatingFilterButton' instead.`
            );
        }
        return colDef.suppressFloatingFilterButton == null
            ? !legacySuppressFilterButton
            : !colDef.suppressFloatingFilterButton;
    }

    private getColumnMenuType(): 'legacy' | 'new' {
        return this.gos.get('columnMenu');
    }

    private isFloatingFilterButtonDisplayed(column: AgColumn): boolean {
        return !!column.getColDef().floatingFilter && this.isFloatingFilterButtonEnabled(column);
    }

    private isSuppressMenuHide(): boolean {
        const suppressMenuHide = this.gos.get('suppressMenuHide');
        if (this.isLegacyMenuEnabled()) {
            // default to false for legacy
            return this.gos.exists('suppressMenuHide') ? suppressMenuHide : false;
        }
        return suppressMenuHide;
    }

    private showColumnMenuCommon(
        menuFactory: IMenuFactory,
        params: ShowColumnMenuParams,
        containerType: ContainerType,
        filtersOnly?: boolean
    ): void {
        const { positionBy } = params;
        const column = params.column as AgColumn | undefined;
        if (positionBy === 'button') {
            const { buttonElement } = params;
            menuFactory.showMenuAfterButtonClick(column, buttonElement, containerType, filtersOnly);
        } else if (positionBy === 'mouse') {
            const { mouseEvent } = params;
            menuFactory.showMenuAfterMouseEvent(column, mouseEvent, containerType, filtersOnly);
        } else if (column) {
            // auto
            this.ctrlsService.getGridBodyCtrl().getScrollFeature().ensureColumnVisible(column, 'auto');
            // make sure we've finished scrolling into view before displaying the menu
            this.animationFrameService.requestAnimationFrame(() => {
                const headerCellCtrl = this.ctrlsService
                    .getHeaderRowContainerCtrl(column.getPinned())
                    ?.getHeaderCtrlForColumn(column);

                if (headerCellCtrl) {
                    menuFactory.showMenuAfterButtonClick(
                        column,
                        headerCellCtrl.getAnchorElementForMenu(filtersOnly),
                        containerType,
                        true
                    );
                }
            });
        }
    }

    private getRowCtrl(rowNode?: RowNode | null): RowCtrl | undefined {
        const { rowIndex, rowPinned } = rowNode || {};

        if (rowIndex == null) {
            return;
        }

        return this.rowRenderer.getRowByPosition({ rowIndex, rowPinned }) || undefined;
    }

    private getCellGui(rowCtrl?: RowCtrl, column?: AgColumn | null): HTMLElement | undefined {
        if (!rowCtrl || !column) {
            return;
        }

        const cellCtrl = rowCtrl.getCellCtrl(column);

        return cellCtrl?.getGui() || undefined;
    }

    private getContextMenuAnchorElement(rowNode?: RowNode | null, column?: AgColumn | null): HTMLElement {
        const gridBodyEl = this.ctrlsService.getGridBodyCtrl().getGridBodyElement();
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
}
