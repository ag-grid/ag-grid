import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, Optional, PostConstruct } from "../context/context";
import { IMenuFactory } from "../interfaces/iMenuFactory";
import { IContextMenuFactory } from "../interfaces/iContextMenuFactory";
import { Column } from "../entities/column";
import { ContainerType } from "../interfaces/iAfterGuiAttachedParams";
import { RowNode } from "../entities/rowNode";
import { CtrlsService } from "../ctrlsService";
import { AnimationFrameService } from "./animationFrameService";
import { IColumnChooserFactory, ShowColumnChooserParams } from "../interfaces/iColumnChooserFactory";
import { FilterManager } from "../filter/filterManager";
import { isIOSUserAgent } from "../utils/browser";
import { warnOnce } from "../utils/function";

interface BaseShowColumnMenuParams {
    column?: Column,
}

interface BaseShowFilterMenuParams {
    column: Column,
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

export type ShowColumnMenuParams = (MouseShowMenuParams | ButtonShowMenuParams | AutoShowMenuParams) & BaseShowColumnMenuParams;

export type ShowFilterMenuParams = (MouseShowMenuParams | ButtonShowMenuParams | AutoShowMenuParams) & BaseShowFilterMenuParams;

interface BaseShowContextMenuParams { 
    rowNode?: RowNode | null,
    column?: Column | null,
    value: any,
    anchorToElement: HTMLElement
}

interface MouseShowContextMenuParams {
    mouseEvent: MouseEvent;
}

interface TouchShowContextMenuParam {
    touchEvent: TouchEvent;
}

export type ShowContextMenuParams = (MouseShowContextMenuParams | TouchShowContextMenuParam) & BaseShowContextMenuParams;

@Bean('menuService')
export class MenuService extends BeanStub {
    @Optional('enterpriseMenuFactory') private readonly enterpriseMenuFactory? : IMenuFactory;
    @Autowired('filterMenuFactory') private readonly filterMenuFactory: IMenuFactory;
    @Optional('contextMenuFactory') private readonly contextMenuFactory?: IContextMenuFactory;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;
    @Optional('columnChooserFactory') private columnChooserFactory: IColumnChooserFactory;
    @Autowired('filterManager') private filterManager: FilterManager;

    private activeMenuFactory: IMenuFactory;

    @PostConstruct
    private postConstruct(): void {
        this.activeMenuFactory = this.enterpriseMenuFactory ?? this.filterMenuFactory;
    }

    public showColumnMenu(params: ShowColumnMenuParams): void {
        this.showColumnMenuCommon(this.activeMenuFactory, params, 'columnMenu');
    }

    public showFilterMenu(params: ShowFilterMenuParams): void {
        const menuFactory: IMenuFactory = this.enterpriseMenuFactory && this.isLegacyMenuEnabled()
            ? this.enterpriseMenuFactory
            : this.filterMenuFactory;
        this.showColumnMenuCommon(menuFactory, params, params.containerType, true);
    }

    public showHeaderContextMenu(column: Column | undefined, mouseEvent?: MouseEvent, touchEvent?: TouchEvent): void {
        this.activeMenuFactory.showMenuAfterContextMenuEvent(column, mouseEvent, touchEvent);
    }

    public showContextMenu(
        params: ShowContextMenuParams
    ): void {
        const { column, anchorToElement, rowNode, value } = params;
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
        return !isSuppressMenuButton && this.activeMenuFactory.isMenuEnabled(column) && (this.isLegacyMenuEnabled() || !!this.enterpriseMenuFactory);
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

        const onIpadAndMenuHides = isIOSUserAgent() && menuHides;

        return !onIpadAndMenuHides;
    }

    public isHeaderFilterButtonEnabled(column: Column): boolean {
        return this.isFilterMenuInHeaderEnabled(column) && !this.isLegacyMenuEnabled() && !this.isFloatingFilterButtonDisplayed(column);
    }

    public isFilterMenuItemEnabled(column: Column): boolean {
        return this.filterManager.isFilterAllowed(column) && !this.isLegacyMenuEnabled() &&
            !this.isFilterMenuInHeaderEnabled(column) && !this.isFloatingFilterButtonDisplayed(column);
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
            warnOnce(`As of v31.1, 'colDef.floatingFilterComponentParams.suppressFilterButton' is deprecated. Use 'colDef.suppressFloatingFilterButton' instead.`);
        }
        return colDef.suppressFloatingFilterButton == null ? !legacySuppressFilterButton : !colDef.suppressFloatingFilterButton;
    }

    private getColumnMenuType(): 'legacy' | 'new' {
        return this.gos.get('columnMenu') ?? 'legacy';
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

    private showColumnMenuCommon(menuFactory: IMenuFactory, params: ShowColumnMenuParams, containerType: ContainerType, filtersOnly?: boolean): void {
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
                const headerCellCtrl = this.ctrlsService.getHeaderRowContainerCtrl(column.getPinned()).getHeaderCtrlForColumn(column)!;
                menuFactory.showMenuAfterButtonClick(column, headerCellCtrl.getAnchorElementForMenu(filtersOnly), containerType, true);
            });
        }
    }
}
