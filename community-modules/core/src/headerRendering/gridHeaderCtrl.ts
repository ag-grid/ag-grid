import { KeyCode } from "../constants/keyCode";
import { BeanStub } from "../context/beanStub";
import { Events } from "../eventKeys";
import { isIOSUserAgent } from "../utils/browser";
import { exists } from "../utils/generic";
import { ManagedFocusFeature } from "../widgets/managedFocusFeature";
import { LongTapEvent, TouchListener } from "../widgets/touchListener";
import { HeaderNavigationDirection } from "./common/headerNavigationService";

export interface IGridHeaderComp {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    setHeightAndMinHeight(height: string): void;
}

export class GridHeaderCtrl extends BeanStub {

    private comp: IGridHeaderComp;
    private eGui: HTMLElement;
    private headerHeight: number;

    public setComp(comp: IGridHeaderComp, eGui: HTMLElement, eFocusableElement: HTMLElement): void {
        this.comp = comp;
        this.eGui = eGui;

        this.createManagedBean(new ManagedFocusFeature(
            eFocusableElement,
            {
                onTabKeyDown: this.onTabKeyDown.bind(this),
                handleKeyDown: this.handleKeyDown.bind(this),
                onFocusOut: this.onFocusOut.bind(this)
            }
        ));

        // for setting ag-pivot-on / ag-pivot-off CSS classes
        this.addManagedEventListener(Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
        this.addManagedEventListener(Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));

        this.onPivotModeChanged();
        this.setupHeaderHeight();

        const listener = this.onHeaderContextMenu.bind(this)
        this.addManagedListener(this.eGui, 'contextmenu', listener);
        this.mockContextMenuForIPad(listener);

        this.beans.ctrlsService.registerGridHeaderCtrl(this);
    }

    private setupHeaderHeight(): void {
        const listener = this.setHeaderHeight.bind(this);
        listener();

        this.addManagedPropertyListener('headerHeight', listener);
        this.addManagedPropertyListener('pivotHeaderHeight', listener);
        this.addManagedPropertyListener('groupHeaderHeight', listener);
        this.addManagedPropertyListener('pivotGroupHeaderHeight', listener);
        this.addManagedPropertyListener('floatingFiltersHeight', listener);

        this.addManagedEventListener(Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addManagedEventListener(Events.EVENT_COLUMN_HEADER_HEIGHT_CHANGED, listener);
        this.addManagedEventListener(Events.EVENT_GRID_STYLES_CHANGED, listener);
        this.addManagedEventListener(Events.EVENT_ADVANCED_FILTER_ENABLED_CHANGED, listener);
    }

    public getHeaderHeight(): number {
        return this.headerHeight;
    }

    private setHeaderHeight(): void {
        const { columnModel, filterManager } = this.beans;

        let numberOfFloating = 0;
        let headerRowCount = columnModel.getHeaderRowCount();
        let totalHeaderHeight: number;

        const hasFloatingFilters = filterManager.hasFloatingFilters();

        if (hasFloatingFilters) {
            headerRowCount++;
            numberOfFloating = 1;
        }

        const groupHeight = columnModel.getColumnGroupHeaderRowHeight();
        const headerHeight = columnModel.getColumnHeaderRowHeight();

        const numberOfNonGroups = 1 + numberOfFloating;
        const numberOfGroups = headerRowCount - numberOfNonGroups;

        totalHeaderHeight = numberOfFloating * columnModel.getFloatingFiltersHeight()!;
        totalHeaderHeight += numberOfGroups * groupHeight!;
        totalHeaderHeight += headerHeight!;

        if (this.headerHeight === totalHeaderHeight) { return; }

        this.headerHeight = totalHeaderHeight;

        // one extra pixel is needed here to account for the
        // height of the border
        const px = `${totalHeaderHeight + 1}px`;
        this.comp.setHeightAndMinHeight(px);

        this.beans.eventService.dispatchEvent({
            type: Events.EVENT_HEADER_HEIGHT_CHANGED
        });
    }

    private onPivotModeChanged(): void {
        const pivotMode = this.beans.columnModel.isPivotMode();

        this.comp.addOrRemoveCssClass('ag-pivot-on', pivotMode);
        this.comp.addOrRemoveCssClass('ag-pivot-off', !pivotMode);
    }

    private onDisplayedColumnsChanged(): void {
        const columns = this.beans.columnModel.getAllDisplayedColumns();
        const shouldAllowOverflow = columns.some(col => col.isSpanHeaderHeight());

        this.comp.addOrRemoveCssClass('ag-header-allow-overflow', shouldAllowOverflow);
    }

    protected onTabKeyDown(e: KeyboardEvent): void {
        const isRtl = this.beans.gos.get('enableRtl');
        const direction = e.shiftKey !== isRtl
            ? HeaderNavigationDirection.LEFT
            : HeaderNavigationDirection.RIGHT;

        if (this.beans.headerNavigationService.navigateHorizontally(direction, true, e) ||
            this.beans.focusService.focusNextGridCoreContainer(e.shiftKey)
        ) {
            e.preventDefault();
        }
     }

    protected handleKeyDown(e: KeyboardEvent): void {
        let direction: HeaderNavigationDirection | null = null;

        switch (e.key) {
            case KeyCode.LEFT:
                direction = HeaderNavigationDirection.LEFT;
            case KeyCode.RIGHT:
                if (!exists(direction)) {
                    direction = HeaderNavigationDirection.RIGHT;
                }
                this.beans.headerNavigationService.navigateHorizontally(direction, false, e);
                break;
            case KeyCode.UP:
                direction = HeaderNavigationDirection.UP;
            case KeyCode.DOWN:
                if (!exists(direction)) {
                    direction = HeaderNavigationDirection.DOWN;
                }
                if (this.beans.headerNavigationService.navigateVertically(direction, null, e)) {
                    e.preventDefault();
                }
                break;
            default:
                return;
        }
    }

    protected onFocusOut(e: FocusEvent): void {
        const { relatedTarget } = e;

        if (!relatedTarget && this.eGui.contains(this.beans.gos.getActiveDomElement())) { return; }

        if (!this.eGui.contains(relatedTarget as HTMLElement)) {
            this.beans.focusService.clearFocusedHeader();
        }
    }

    private onHeaderContextMenu(mouseEvent?: MouseEvent, touch?: Touch, touchEvent?: TouchEvent): void {
        if ((!mouseEvent && !touchEvent) || !this.beans.menuService.isHeaderContextMenuEnabled()) { return; }

        const { target } = (mouseEvent ?? touch)!;

        if (target === this.eGui || target === this.beans.ctrlsService.getHeaderRowContainerCtrl().getViewport()) {
            this.beans.menuService.showHeaderContextMenu(undefined, mouseEvent, touchEvent);
        }
    }

    private mockContextMenuForIPad(listener: (mouseListener?: MouseEvent, touch?: Touch, touchEvent?: TouchEvent) => void): void {
        // we do NOT want this when not in iPad
        if (!isIOSUserAgent()) { return; }

        const touchListener = new TouchListener(this.eGui);
        const longTapListener = (event: LongTapEvent) => {
            listener(undefined, event.touchStart, event.touchEvent);
        };

        this.addManagedListener(touchListener, TouchListener.EVENT_LONG_TAP, longTapListener);
        this.addDestroyFunc(() => touchListener.destroy());
    }
}
