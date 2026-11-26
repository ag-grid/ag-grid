import { KeyCode, _addManagedElementListeners, _exists, _getActiveDomElement, _throttleToFrame } from 'ag-stack';

import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { HeaderNavigationDirection } from '../navigation/headerNavigationService';
import { _focusNextGridCoreContainer } from '../utils/gridFocus';
import { ManagedFocusFeature } from '../widgets/managedFocusFeature';
import { getColumnHeaderRowHeight, getFloatingFiltersHeight, getGroupRowsHeight } from './headerUtils';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IGridHeaderComp {
    toggleCss(cssClassName: string, on: boolean): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class GridHeaderCtrl extends BeanStub {
    private comp: IGridHeaderComp;
    public eGui: HTMLElement;
    private eGridViewport: HTMLElement;
    public headerHeight: number;
    private headerHeightWithBorder: number;
    private headerRowFocusFeatures: ManagedFocusFeature[] = [];

    public setComp(comp: IGridHeaderComp, eGui: HTMLElement, eGridViewport: HTMLElement): void {
        this.comp = comp;
        this.eGui = eGui;
        this.eGridViewport = eGridViewport;

        const { beans } = this;
        const { touchSvc, ctrlsSvc } = beans;

        // for setting ag-pivot-on / ag-pivot-off CSS classes
        this.addManagedEventListeners({
            columnPivotModeChanged: this.onPivotModeChanged.bind(this, beans),
        });

        this.onPivotModeChanged(beans);
        this.setupHeaderHeight();

        const listener = this.onHeaderContextMenu.bind(this);
        _addManagedElementListeners(this, this.eGui, { contextmenu: listener });
        touchSvc?.mockHeaderContextMenu(this, listener);

        ctrlsSvc.register('gridHeaderCtrl', this);
    }

    public setHeaderRowFocusableElements(eFocusableElements: HTMLElement[]): void {
        this.headerRowFocusFeatures = this.destroyBeans(this.headerRowFocusFeatures);

        if (!this.beans.headerNavigation) {
            return;
        }

        for (const eFocusableElement of eFocusableElements) {
            this.headerRowFocusFeatures.push(
                this.createManagedBean(
                    new ManagedFocusFeature(eFocusableElement, {
                        onTabKeyDown: this.onTabKeyDown.bind(this),
                        handleKeyDown: this.handleKeyDown.bind(this),
                        onFocusOut: this.onFocusOut.bind(this),
                    })
                )
            );
        }
    }

    private setupHeaderHeight(): void {
        this.setHeaderHeight();

        const listener = () => {
            this.setHeaderHeight();
            this.beans.ctrlsSvc.getHeaderRowContainerCtrl()?.placeRows();
        };
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

        const setHeaderHeightNextFrame = _throttleToFrame(this, () => this.beans, this.setHeaderHeight.bind(this));
        this.addManagedEventListeners({
            columnHeaderHeightChanged: listener,
            // the rows move at once; the header's own height follows a frame later, to avoid a feedback loop
            columnGroupHeaderHeightChanged: () => {
                setHeaderHeightNextFrame();
                this.beans.ctrlsSvc.getHeaderRowContainerCtrl()?.placeRows();
            },
            stylesChanged: listener,
        });
    }

    /** The header's height from its rows and options; the rows' owner calls it when their count changes. */
    public setHeaderHeight(): void {
        const { beans } = this;

        let totalHeaderHeight: number = 0;

        const groupRowsHeight = getGroupRowsHeight(beans);
        const groupHeight = groupRowsHeight.reduce((prev, curr) => prev + curr, 0);
        const headerHeight = getColumnHeaderRowHeight(beans);

        if (beans.filterManager?.hasFloatingFilters()) {
            totalHeaderHeight += getFloatingFiltersHeight(beans);
        }

        totalHeaderHeight += groupHeight;
        totalHeaderHeight += headerHeight;
        if (this.headerHeightWithBorder !== totalHeaderHeight) {
            this.headerHeightWithBorder = totalHeaderHeight;
            const heightWithBorder = totalHeaderHeight + beans.environment.getHeaderRowBorderWidth();
            this.eGridViewport.style.setProperty('--ag-internal-header-rows-height', `${heightWithBorder}px`);
            this.eGui.style.height = `${heightWithBorder}px`;
        }

        if (this.headerHeight !== totalHeaderHeight) {
            this.headerHeight = totalHeaderHeight;
            beans.visibleCols.invalidateScrollCheck(); // the body's share of the viewport moved
            beans.ctrlsSvc.getHeaderRowContainerCtrl()?.onHeaderHeightChanged(groupRowsHeight, headerHeight);
            this.eventSvc.dispatchEvent({ type: 'headerHeightChanged' });
        }
    }

    private onPivotModeChanged(beans: BeanCollection): void {
        const pivotMode = beans.colModel.pivotMode;

        this.comp.toggleCss('ag-pivot-on', pivotMode);
        this.comp.toggleCss('ag-pivot-off', !pivotMode);
    }

    /** Follows the displayed columns, as their owner raises `displayedColumnsChanged`. */
    public onDisplayedColumnsChanged(): void {
        const columns = this.beans.visibleCols.allCols;
        const shouldAllowOverflow = columns.some((col) => col.isSpanHeaderHeight());

        this.comp.toggleCss('ag-header-allow-overflow', shouldAllowOverflow);
        this.setHeaderHeight();
    }

    protected onTabKeyDown(e: KeyboardEvent): void {
        const isRtl = this.gos.get('enableRtl');
        const backwards = e.shiftKey;
        const direction = backwards !== isRtl ? 'LEFT' : 'RIGHT';
        const { beans } = this;
        const { headerNavigation, focusSvc } = beans;

        if (
            headerNavigation!.navigateHorizontally(direction, true, e) ||
            (!backwards && focusSvc.focusOverlay(false)) ||
            _focusNextGridCoreContainer(beans, backwards, 'force')
        ) {
            // preventDefault so that the tab key doesn't cause focus to get lost
            e.preventDefault();
        }
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        let direction: HeaderNavigationDirection | null = null;
        const { headerNavigation } = this.beans;

        switch (e.key) {
            case KeyCode.LEFT:
                direction = 'LEFT';
            // eslint-disable-next-line no-fallthrough
            case KeyCode.RIGHT: {
                if (!_exists(direction)) {
                    direction = 'RIGHT';
                }
                if (headerNavigation!.navigateHorizontally(direction, false, e)) {
                    // preventDefault so that the arrow keys don't cause an extra scroll
                    e.preventDefault();
                }
                break;
            }
            case KeyCode.UP:
                direction = 'UP';
            // eslint-disable-next-line no-fallthrough
            case KeyCode.DOWN: {
                if (!_exists(direction)) {
                    direction = 'DOWN';
                }
                if (headerNavigation!.navigateVertically(direction, e)) {
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

        const { eGui, beans } = this;
        if (!relatedTarget && eGui.contains(_getActiveDomElement(beans))) {
            return;
        }

        const nextFocusInHeaderRow =
            relatedTarget instanceof HTMLElement && eGui.contains(relatedTarget.closest('.ag-header-row'));
        if (!nextFocusInHeaderRow) {
            beans.focusSvc.focusedHeader = null;
        }
    }

    private onHeaderContextMenu(mouseEvent?: MouseEvent, touch?: Touch, touchEvent?: TouchEvent): void {
        const { menuSvc } = this.beans;
        if ((!mouseEvent && !touchEvent) || !menuSvc?.isHeaderContextMenuEnabled()) {
            return;
        }

        const { target } = (mouseEvent ?? touch)!;

        // header cells' own contextmenu events bubble up to this listener and must not also open the grid-level menu
        if (target instanceof Element && !target.closest('.ag-header-cell, .ag-header-group-cell')) {
            menuSvc.showHeaderContextMenu(undefined, mouseEvent, touchEvent);
        }
    }
}
