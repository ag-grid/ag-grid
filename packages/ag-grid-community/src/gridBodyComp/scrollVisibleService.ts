import { _getScrollbarWidth } from 'ag-stack';

import type { ColumnAnimationService } from '../columnMove/columnAnimationService';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import { _isDomLayout } from '../gridOptionsUtils';
import type { GridBodyCtrl } from './gridBodyCtrl';

interface ScrollVisibilityState {
    horizontalScrollShowing: boolean;
    verticalScrollShowing: boolean;
}

interface ScrollGapState {
    horizontalScrollGap: boolean;
    verticalScrollGap: boolean;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class ScrollVisibleService extends BeanStub implements NamedBean {
    beanName = 'scrollVisibleSvc' as const;

    private ctrlsSvc: CtrlsService;
    private colAnimation?: ColumnAnimationService;

    // we store this locally, so we are not calling getScrollWidth() multiple times as it's an expensive operation
    private scrollbarWidth: number;
    private refreshTimer = 0;

    public wireBeans(beans: BeanCollection) {
        this.ctrlsSvc = beans.ctrlsSvc;
        this.colAnimation = beans.colAnimation;
    }

    public horizontalScrollShowing: boolean;
    public verticalScrollShowing: boolean;

    public horizontalScrollGap: boolean;
    public verticalScrollGap: boolean;

    public override destroy(): void {
        window.clearTimeout(this.refreshTimer);
        super.destroy();
    }

    public postConstruct(): void {
        const { gos } = this;
        this.horizontalScrollShowing = gos.get('alwaysShowHorizontalScroll') === true;
        this.verticalScrollShowing = gos.get('alwaysShowVerticalScroll') === true;

        // sets an initial calculation for the scrollbar width
        this.getScrollbarWidth();

        const refresh = this.refresh.bind(this);
        this.addManagedEventListeners({
            displayedColumnsChanged: refresh,
            displayedColumnsWidthChanged: refresh,
            newColumnsLoaded: refresh,
        });
    }

    public refresh(): void {
        this.refreshImpl();
        window.clearTimeout(this.refreshTimer);
        this.refreshTimer = window.setTimeout(() => this.refreshImpl(), 500);
    }

    public isHorizontalScrollShowing(): boolean {
        return this.horizontalScrollShowing;
    }

    public isVerticalScrollShowing(): boolean {
        return this.verticalScrollShowing;
    }

    private refreshImpl(): void {
        // Because of column animation, if user removes cols anywhere except at the RHS,
        // then the cols on the RHS will animate to the left to fill the gap. This animation
        // means just after the cols are removed, the remaining cols are still in the original
        // location at the start of the animation, so pre animation the H scrollbar is still
        // needed, but post animation it is not. So if animation is active, we only update
        // after the animation has ended.
        const { colAnimation } = this;
        if (colAnimation?.isActive()) {
            colAnimation.executeLaterVMTurn(() => {
                colAnimation.executeLaterVMTurn(() => this.refreshScrollState());
            });
        } else {
            this.refreshScrollState();
        }
    }

    private refreshScrollState(): void {
        const gridBodyCtrl = this.ctrlsSvc.getGridBodyCtrl();

        if (!this.isAlive() || !gridBodyCtrl || this.colAnimation?.isActive()) {
            return;
        }

        const scrollVisibilityState = this.calculateScrollVisibilityState(gridBodyCtrl);
        this.applyScrollVisibility(scrollVisibilityState);
        // Gap measurements depend on the current DOM geometry, so they must be read
        // after visibility updates have synchronously adjusted widths and classes.
        this.applyScrollGap(this.calculateScrollGapState(gridBodyCtrl, scrollVisibilityState.verticalScrollShowing));
    }

    private calculateScrollVisibilityState(gridBodyCtrl: GridBodyCtrl): ScrollVisibilityState {
        const verticalScrollShowing = this.calculateVerticalScrollShowing(gridBodyCtrl);

        return {
            horizontalScrollShowing: this.calculateHorizontalScrollShowing(gridBodyCtrl, verticalScrollShowing),
            verticalScrollShowing,
        };
    }

    private calculateVerticalScrollShowing(gridBodyCtrl: GridBodyCtrl): boolean {
        if (this.gos.get('alwaysShowVerticalScroll')) {
            return true;
        }

        if (!_isDomLayout(this.gos, 'normal')) {
            return false;
        }

        const bodyViewportHeight = gridBodyCtrl.getBodyViewportHeight(gridBodyCtrl.eGridViewport.clientHeight);
        const rowContainerHeight = this.beans.rowContainerHeight.uiContainerHeight ?? 0;
        return rowContainerHeight > bodyViewportHeight;
    }

    private calculateHorizontalScrollShowing(gridBodyCtrl: GridBodyCtrl, verticalScrollShowing: boolean): boolean {
        if (this.gos.get('alwaysShowHorizontalScroll')) {
            return true;
        }

        return (
            gridBodyCtrl.getHorizontalContentWidth(verticalScrollShowing) - gridBodyCtrl.getHorizontalViewportWidth() >
            0.5
        );
    }

    private calculateScrollGapState(gridBodyCtrl: GridBodyCtrl, verticalScrollShowing: boolean): ScrollGapState {
        const { visibleCols, rowContainerHeight } = this.beans;
        const horizontalContentWidth =
            visibleCols.bodyWidth +
            visibleCols.getLeftStickyColumnContainerWidth() +
            visibleCols.getRightStickyColumnContainerWidth();
        const horizontalViewportWidth = gridBodyCtrl.getViewportWidthWithoutScrollbar(verticalScrollShowing);
        const verticalContentHeight = rowContainerHeight.getAdjustedUiContainerHeight() ?? 0;
        const verticalViewportHeight = gridBodyCtrl.getBodyViewportHeight(gridBodyCtrl.eGridViewport.clientHeight);

        return {
            horizontalScrollGap: horizontalContentWidth < horizontalViewportWidth - 0.5,
            verticalScrollGap: verticalContentHeight < verticalViewportHeight - 0.5,
        };
    }

    private applyScrollGap({ horizontalScrollGap, verticalScrollGap }: ScrollGapState): void {
        const atLeastOneDifferent =
            this.horizontalScrollGap !== horizontalScrollGap || this.verticalScrollGap !== verticalScrollGap;
        if (atLeastOneDifferent) {
            this.horizontalScrollGap = horizontalScrollGap;
            this.verticalScrollGap = verticalScrollGap;

            this.eventSvc.dispatchEvent({
                type: 'scrollGapChanged',
            });
        }
    }

    private applyScrollVisibility(params: ScrollVisibilityState): void {
        const atLeastOneDifferent =
            this.horizontalScrollShowing !== params.horizontalScrollShowing ||
            this.verticalScrollShowing !== params.verticalScrollShowing;

        if (atLeastOneDifferent) {
            this.horizontalScrollShowing = params.horizontalScrollShowing;
            this.verticalScrollShowing = params.verticalScrollShowing;

            this.eventSvc.dispatchEvent({
                type: 'scrollVisibilityChanged',
            });
        }
    }

    // the user might be using some non-standard scrollbar, eg a scrollbar that has zero
    // width and overlays (like the Safari scrollbar, but presented in Chrome). so we
    // allow the user to provide the scroll width before we work it out.
    public getScrollbarWidth() {
        if (this.scrollbarWidth == null) {
            const gridOptionsScrollbarWidth = this.gos.get('scrollbarWidth');
            const useGridOptions = typeof gridOptionsScrollbarWidth === 'number' && gridOptionsScrollbarWidth >= 0;
            const scrollbarWidth = useGridOptions ? gridOptionsScrollbarWidth : _getScrollbarWidth();

            if (scrollbarWidth != null) {
                this.scrollbarWidth = scrollbarWidth;

                this.eventSvc.dispatchEvent({
                    type: 'scrollbarWidthChanged',
                });
            }
        }

        return this.scrollbarWidth;
    }
}
