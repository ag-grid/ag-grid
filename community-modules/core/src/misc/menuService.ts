import { BeanStub } from '../context/beanStub';
import { Autowired, Bean, Optional } from '../context/context';
import { CtrlsService } from '../ctrlsService';
import { Column } from '../entities/column';
import { RowNode } from '../entities/rowNode';
import { FilterManager } from '../filter/filterManager';
import { ContainerType } from '../interfaces/iAfterGuiAttachedParams';
import { IColumnChooserFactory, ShowColumnChooserParams } from '../interfaces/iColumnChooserFactory';
import { IContextMenuFactory } from '../interfaces/iContextMenuFactory';
import { IMenuFactory } from '../interfaces/iMenuFactory';
import { RowCtrl } from '../rendering/row/rowCtrl';
import { RowRenderer } from '../rendering/rowRenderer';
import { _isIOSUserAgent } from '../utils/browser';
import { _warnOnce } from '../utils/function';
import { AnimationFrameService } from './animationFrameService';

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
    /** The `RowNode` associated with the Context Menu */
    rowNode?: RowNode | null;
    /** The `Column` associated with the Context Menu */
    column?: Column | null;
    /** The value that will be passed to the Context Menu (useful with `getContextMenuItems`). If none is passed, and `RowNode` and `Column` are provided, this will be the respective Cell value */
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
    /** The x position for the Context Menu, if no value is given and `RowNode` and `Column` are provided, this will default to be middle of the cell, otherwise it will be `0`. */
    x?: number;
    /** The y position for the Context Menu, if no value is given and `RowNode` and `Column` are provided, this will default to be middle of the cell, otherwise it will be `0`. */
    y?: number;
}

@Bean('menuService')
export class MenuService extends BeanStub {
    @Autowired('filterMenuFactory') private readonly filterMenuFactory: IMenuFactory;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;

    @Optional('columnChooserFactory') private columnChooserFactory?: IColumnChooserFactory;
    @Optional('contextMenuFactory') private readonly contextMenuFactory?: IContextMenuFactory;
    @Optional('enterpriseMenuFactory') private readonly enterpriseMenuFactory?: IMenuFactory;

    private activeMenuFactory: IMenuFactory;

    public override postConstruct(): void {
        super.postConstruct();
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

    public showHeaderContextMenu(column: Column | undefined, mouseEvent?: MouseEvent, touchEvent?: TouchEvent): void {
        this.activeMenuFactory.showMenuAfterContextMenuEvent(column, mouseEvent, touchEvent);
    }

    public getContextMenuPosition(rowNode?: RowNode | null, column?: Column | null): { x: number; y: number } {
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
        const { column, rowNode } = params;
        let { anchorToElement, value } = params;

        if (rowNode && column && value == null) {
            value = rowNode.getValueFromValueService(column);
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

    public isColumnMenuInHeaderEnabled(column: Column): boolean {
        const { suppressMenu, suppressHeaderMenuButton } = column.getColDef();
        const isSuppressMenuButton = suppressHeaderMenuButton ?? suppressMenu;
        return (
            !isSuppressMenuButton &&
            this.activeMenuFactory.isMenuEnabled(column) &&
            (this.isLegacyMenuEnabled() || !!this.enterpriseMenuFactory)
        );
    }

    public isFilterMenuInHeaderEnabled(column: Column): boolean {
        return !column.getColDef().suppressHeaderFilterButton && this.filterManager.isFilterAllowed(column);
    }

    public isHeaderContextMenuEnabled(column?: Column): boolean {
        return !column?.getColDef().suppressHeaderContextMenu && this.getColumnMenuType() === 'new';
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

    public isHeaderFilterButtonEnabled(column: Column): boolean {
        return (
            this.isFilterMenuInHeaderEnabled(column) &&
            !this.isLegacyMenuEnabled() &&
            !this.isFloatingFilterButtonDisplayed(column)
        );
    }

    public isFilterMenuItemEnabled(column: Column): boolean {
        return (
            this.filterManager.isFilterAllowed(column) &&
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

    public isFloatingFilterButtonEnabled(column: Column): boolean {
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

    private isFloatingFilterButtonDisplayed(column: Column): boolean {
        return !!column.getColDef().floatingFilter && this.isFloatingFilterButtonEnabled(column);
    }

    private isSuppressMenuHide(): boolean {
        const suppressMenuHide = this.gos.get('suppressMenuHide');
        if (this.isLegacyMenuEnabled()) {
            return suppressMenuHide;
        } else {
            // default to true for new
            return this.gos.exists('suppressMenuHide') ? suppressMenuHide : true;
        }
    }

    private showColumnMenuCommon(
        menuFactory: IMenuFactory,
        params: ShowColumnMenuParams,
        containerType: ContainerType,
        filtersOnly?: boolean
    ): void {
        const { column, positionBy } = params;
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
                    .getHeaderCtrlForColumn(column)!;
                menuFactory.showMenuAfterButtonClick(
                    column,
                    headerCellCtrl.getAnchorElementForMenu(filtersOnly),
                    containerType,
                    true
                );
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

    private getCellGui(rowCtrl?: RowCtrl, column?: Column | null): HTMLElement | undefined {
        if (!rowCtrl || !column) {
            return;
        }

        const cellCtrl = rowCtrl.getCellCtrl(column);

        return cellCtrl?.getGui() || undefined;
    }

    private getContextMenuAnchorElement(rowNode?: RowNode | null, column?: Column | null): HTMLElement {
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
