import type { ColumnModel } from '../columns/columnModel';
import type { VisibleColsService } from '../columns/visibleColsService';
import { KeyCode } from '../constants/keyCode';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { FilterManager } from '../filter/filterManager';
import type { FocusService } from '../focusService';
import type { MenuService } from '../misc/menuService';
import { _isIOSUserAgent } from '../utils/browser';
import { _exists } from '../utils/generic';
import { ManagedFocusFeature } from '../widgets/managedFocusFeature';
import type { LongTapEvent } from '../widgets/touchListener';
import { TouchListener } from '../widgets/touchListener';
import type { HeaderNavigationService } from './common/headerNavigationService';
import { HeaderNavigationDirection } from './common/headerNavigationService';

export interface IGridHeaderComp {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    setHeightAndMinHeight(height: string): void;
}

export class GridHeaderCtrl extends BeanStub {
    private headerNavigationService: HeaderNavigationService;
    private focusService: FocusService;
    private columnModel: ColumnModel;
    private visibleColsService: VisibleColsService;
    private ctrlsService: CtrlsService;
    private filterManager?: FilterManager;
    private menuService: MenuService;

    public wireBeans(beans: BeanCollection) {
        this.headerNavigationService = beans.headerNavigationService;
        this.focusService = beans.focusService;
        this.columnModel = beans.columnModel;
        this.visibleColsService = beans.visibleColsService;
        this.ctrlsService = beans.ctrlsService;
        this.filterManager = beans.filterManager;
        this.menuService = beans.menuService;
    }

    private comp: IGridHeaderComp;
    private eGui: HTMLElement;
    private headerHeight: number;

    public setComp(comp: IGridHeaderComp, eGui: HTMLElement, eFocusableElement: HTMLElement): void {
        this.comp = comp;
        this.eGui = eGui;

        this.createManagedBean(
            new ManagedFocusFeature(eFocusableElement, {
                onTabKeyDown: this.onTabKeyDown.bind(this),
                handleKeyDown: this.handleKeyDown.bind(this),
                onFocusOut: this.onFocusOut.bind(this),
            })
        );

        // for setting ag-pivot-on / ag-pivot-off CSS classes
        this.addManagedEventListeners({
            columnPivotModeChanged: this.onPivotModeChanged.bind(this),
            displayedColumnsChanged: this.onDisplayedColumnsChanged.bind(this),
        });

        this.onPivotModeChanged();
        this.setupHeaderHeight();

        const listener = this.onHeaderContextMenu.bind(this);
        this.addManagedElementListeners(this.eGui, { contextmenu: listener });
        this.mockContextMenuForIPad(listener);

        this.ctrlsService.register('gridHeaderCtrl', this);
    }

    private setupHeaderHeight(): void {
        const listener = this.setHeaderHeight.bind(this);
        listener();

        this.addManagedPropertyListeners(
            [
                'headerHeight',
                'pivotHeaderHeight',
                'groupHeaderHeight',
                'pivotGroupHeaderHeight',
                'floatingFiltersHeight',
            ],
            listener
        );

        this.addManagedEventListeners({
            displayedColumnsChanged: listener,
            columnHeaderHeightChanged: listener,
            gridStylesChanged: listener,
            advancedFilterEnabledChanged: listener,
        });
    }

    public getHeaderHeight(): number {
        return this.headerHeight;
    }

    private setHeaderHeight(): void {
        const { columnModel } = this;

        let numberOfFloating = 0;
        let headerRowCount = columnModel.getHeaderRowCount();
        let totalHeaderHeight: number;

        const hasFloatingFilters = this.filterManager?.hasFloatingFilters();

        if (hasFloatingFilters) {
            headerRowCount++;
            numberOfFloating = 1;
        }

        const groupHeight = this.columnModel.getColumnGroupHeaderRowHeight();
        const headerHeight = this.columnModel.getColumnHeaderRowHeight();

        const numberOfNonGroups = 1 + numberOfFloating;
        const numberOfGroups = headerRowCount - numberOfNonGroups;

        totalHeaderHeight = numberOfFloating * columnModel.getFloatingFiltersHeight()!;
        totalHeaderHeight += numberOfGroups * groupHeight!;
        totalHeaderHeight += headerHeight!;

        if (this.headerHeight === totalHeaderHeight) {
            return;
        }

        this.headerHeight = totalHeaderHeight;

        // one extra pixel is needed here to account for the
        // height of the border
        const px = `${totalHeaderHeight + 1}px`;
        this.comp.setHeightAndMinHeight(px);

        this.eventService.dispatchEvent({
            type: 'headerHeightChanged',
        });
    }

    private onPivotModeChanged(): void {
        const pivotMode = this.columnModel.isPivotMode();

        this.comp.addOrRemoveCssClass('ag-pivot-on', pivotMode);
        this.comp.addOrRemoveCssClass('ag-pivot-off', !pivotMode);
    }

    private onDisplayedColumnsChanged(): void {
        const columns = this.visibleColsService.getAllCols();
        const shouldAllowOverflow = columns.some((col) => col.isSpanHeaderHeight());

        this.comp.addOrRemoveCssClass('ag-header-allow-overflow', shouldAllowOverflow);
    }

    protected onTabKeyDown(e: KeyboardEvent): void {
        const isRtl = this.gos.get('enableRtl');
        const backwards = e.shiftKey;
        const direction = backwards !== isRtl ? HeaderNavigationDirection.LEFT : HeaderNavigationDirection.RIGHT;

        if (
            this.headerNavigationService.navigateHorizontally(direction, true, e) ||
            (!backwards && this.focusService.focusOverlay(false)) ||
            this.focusService.focusNextGridCoreContainer(backwards)
        ) {
            // preventDefault so that the tab key doesn't cause focus to get lost
            e.preventDefault();
        }
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        let direction: HeaderNavigationDirection | null = null;

        switch (e.key) {
            case KeyCode.LEFT:
                direction = HeaderNavigationDirection.LEFT;
            // eslint-disable-next-line no-fallthrough
            case KeyCode.RIGHT: {
                if (!_exists(direction)) {
                    direction = HeaderNavigationDirection.RIGHT;
                }
                if (this.headerNavigationService.navigateHorizontally(direction, false, e)) {
                    // preventDefault so that the arrow keys don't cause an extra scroll
                    e.preventDefault();
                }
                break;
            }
            case KeyCode.UP:
                direction = HeaderNavigationDirection.UP;
            // eslint-disable-next-line no-fallthrough
            case KeyCode.DOWN: {
                if (!_exists(direction)) {
                    direction = HeaderNavigationDirection.DOWN;
                }
                if (this.headerNavigationService.navigateVertically(direction, null, e)) {
                    // preventDefault so that the arrow keys don't cause an extra scroll
                    e.preventDefault();
                }
                break;
            }
            default:
                return;
        }
    }

    protected onFocusOut(e: FocusEvent): void {
        const { relatedTarget } = e;

        if (!relatedTarget && this.eGui.contains(this.gos.getActiveDomElement())) {
            return;
        }

        if (!this.eGui.contains(relatedTarget as HTMLElement)) {
            this.focusService.clearFocusedHeader();
        }
    }

    private onHeaderContextMenu(mouseEvent?: MouseEvent, touch?: Touch, touchEvent?: TouchEvent): void {
        if ((!mouseEvent && !touchEvent) || !this.menuService.isHeaderContextMenuEnabled()) {
            return;
        }

        const { target } = (mouseEvent ?? touch)!;

        if (target === this.eGui || target === this.ctrlsService.getHeaderRowContainerCtrl().getViewportElement()) {
            this.menuService.showHeaderContextMenu(undefined, mouseEvent, touchEvent);
        }
    }

    private mockContextMenuForIPad(
        listener: (mouseListener?: MouseEvent, touch?: Touch, touchEvent?: TouchEvent) => void
    ): void {
        // we do NOT want this when not in iPad
        if (!_isIOSUserAgent()) {
            return;
        }

        const touchListener = new TouchListener(this.eGui);
        const longTapListener = (event: LongTapEvent) => {
            listener(undefined, event.touchStart, event.touchEvent);
        };

        this.addManagedListeners(touchListener, { longTap: longTapListener });
        this.addDestroyFunc(() => touchListener.destroy());
    }
}
