import type { ColumnAnimationService } from '../columnMove/columnAnimationService';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { StylesChangedEvent } from '../events';
import { _canScrollVertically } from '../gridOptionsUtils';
import { _createElement } from '../utils/element';
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

    private scrollbarWidth: number | undefined;
    private invisibleScrollbar: boolean | undefined;
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

        this.ctrlsSvc.whenReady(this, () => this.measureScrollbar());

        const refresh = this.refresh.bind(this);
        this.addManagedEventListeners({
            displayedColumnsChanged: refresh,
            displayedColumnsWidthChanged: refresh,
            newColumnsLoaded: refresh,
            stylesChanged: (event: StylesChangedEvent) => {
                if (event.themeChanged) {
                    this.measureScrollbar();
                }
            },
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
        // Nothing writes between the two evaluations below, so one read serves both.
        const viewportClientHeight = gridBodyCtrl.eGridViewport.clientHeight;
        // Resolve both axes from the layout without a horizontal scrollbar. Otherwise two scrollbars that
        // only overflow because of each other can become a stable, but incorrect, visibility state.
        const verticalScrollShowingWithoutHorizontal = this.calculateVerticalScrollShowing(
            gridBodyCtrl,
            false,
            viewportClientHeight
        );
        const horizontalScrollShowing = this.calculateHorizontalScrollShowing(
            gridBodyCtrl,
            verticalScrollShowingWithoutHorizontal
        );
        const verticalScrollShowing =
            verticalScrollShowingWithoutHorizontal ||
            (horizontalScrollShowing && this.calculateVerticalScrollShowing(gridBodyCtrl, true, viewportClientHeight));

        return {
            horizontalScrollShowing,
            verticalScrollShowing,
        };
    }

    private calculateVerticalScrollShowing(
        gridBodyCtrl: GridBodyCtrl,
        horizontalScrollShowing: boolean,
        viewportClientHeight: number
    ): boolean {
        if (this.gos.get('alwaysShowVerticalScroll')) {
            return true;
        }

        if (!_canScrollVertically(this.beans)) {
            return false;
        }

        // clientHeight already excludes an applied fake horizontal scrollbar, so restore that space before
        // evaluating the requested visibility state.
        const viewportHeightWithoutHorizontalScroll =
            viewportClientHeight + this.getAppliedHorizontalScrollbarLayoutHeight();
        const viewportHeight =
            viewportHeightWithoutHorizontalScroll - this.getHorizontalScrollbarLayoutHeight(horizontalScrollShowing);
        const bodyViewportHeight = gridBodyCtrl.getBodyViewportHeight(viewportHeight);
        const rowContainerHeight = this.beans.rowContainerHeight.uiContainerHeight ?? 0;
        // When zooming the browser there can be an error caused by rounding of fractional measurements, so tolerate a
        // small error in checking if the content exceeds the viewport
        return rowContainerHeight - bodyViewportHeight > 0.5;
    }

    private getHorizontalScrollbarLayoutHeight(horizontalScrollShowing: boolean): number {
        if (!horizontalScrollShowing || this.gos.get('suppressHorizontalScroll') || this.isInvisibleScrollbar()) {
            return 0;
        }
        return this.getScrollbarWidth() || 0;
    }

    private getAppliedHorizontalScrollbarLayoutHeight(): number {
        if (this.gos.get('suppressHorizontalScroll') || this.isInvisibleScrollbar()) {
            return 0;
        }
        const height = Number.parseFloat(this.ctrlsSvc.get('fakeHScrollComp')?.getGui().style.height ?? '');
        return Number.isFinite(height) ? height : 0;
    }

    private calculateHorizontalScrollShowing(gridBodyCtrl: GridBodyCtrl, verticalScrollShowing: boolean): boolean {
        if (this.gos.get('alwaysShowHorizontalScroll')) {
            return true;
        }

        // One width for both the overflow check and the comparison, or they can disagree about the viewport.
        const viewportWidth = gridBodyCtrl.getReportedViewportWidth();
        const pinnedColumnsOverflowing = gridBodyCtrl.isPinnedWidthOverflowingViewport(
            viewportWidth,
            verticalScrollShowing
        );
        const contentWidth = gridBodyCtrl.getHorizontalContentWidth(pinnedColumnsOverflowing, verticalScrollShowing);
        return contentWidth - viewportWidth > 0.5;
    }

    private calculateScrollGapState(gridBodyCtrl: GridBodyCtrl, verticalScrollShowing: boolean): ScrollGapState {
        const { rowContainerHeight } = this.beans;
        const horizontalContentWidth = gridBodyCtrl.getColumnsWidth();
        const horizontalViewportWidth = gridBodyCtrl.getViewportWidthWithoutScrollbar(
            gridBodyCtrl.getReportedViewportWidth(),
            verticalScrollShowing
        );
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
    public getScrollbarWidth(): number | undefined {
        if (this.scrollbarWidth == null) {
            this.measureScrollbar();
        }
        return this.scrollbarWidth;
    }

    /** True for overlay scrollbars that take up no space, undefined until the grid can be measured. */
    public isInvisibleScrollbar(): boolean | undefined {
        if (this.invisibleScrollbar == null) {
            this.measureScrollbar();
        }
        return this.invisibleScrollbar;
    }

    private measureScrollbar(): void {
        const measured = this.measureScrollbarProbe();
        if (measured == null) {
            return;
        }

        const { nativeWidth, borderWidth } = measured;
        const gridOptionsScrollbarWidth = this.gos.get('scrollbarWidth');
        const useGridOptions = typeof gridOptionsScrollbarWidth === 'number' && gridOptionsScrollbarWidth >= 0;
        const invisibleScrollbar = nativeWidth === 0;
        const scrollbarWidth =
            (useGridOptions ? gridOptionsScrollbarWidth : nativeWidth) + (invisibleScrollbar ? 0 : borderWidth);

        if (scrollbarWidth !== this.scrollbarWidth || invisibleScrollbar !== this.invisibleScrollbar) {
            this.scrollbarWidth = scrollbarWidth;
            this.invisibleScrollbar = invisibleScrollbar;

            this.eventSvc.dispatchEvent({
                type: 'scrollbarWidthChanged',
            });
        }
    }

    private measureScrollbarProbe(): { nativeWidth: number; borderWidth: number } | null {
        const eGridBody = this.ctrlsSvc.getGridBodyCtrl()?.eGridBody;
        if (!eGridBody) {
            return null;
        }

        const probe = _createElement({ tag: 'div', cls: 'ag-body-vertical-scroll-viewport ag-scrollbar-probe' });
        const style = probe.style as CSSStyleDeclaration & { msOverflowStyle?: string };
        style.width = style.height = '100px';
        style.opacity = '0';
        style.overflow = 'scroll';
        style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
        style.position = 'absolute';

        eGridBody.appendChild(probe);
        const clientWidth = probe.clientWidth;
        const totalWidth = probe.offsetWidth - clientWidth;
        const computed = getComputedStyle(probe);
        const borderWidth =
            (Number.parseFloat(computed.borderLeftWidth) || 0) + (Number.parseFloat(computed.borderRightWidth) || 0);
        probe.remove();

        // a zero client width means the probe was not laid out, e.g. the grid is not displayed yet
        if (totalWidth === 0 && clientWidth === 0) {
            return null;
        }
        return { nativeWidth: Math.max(0, totalWidth - borderWidth), borderWidth };
    }
}
