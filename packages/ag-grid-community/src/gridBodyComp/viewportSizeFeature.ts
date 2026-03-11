import { _getInnerHeight, _observeResize, _requestAnimationFrame } from '../agStack/utils/dom';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { ScrollVisibleService, SetScrollsVisibleParams } from '../gridBodyComp/scrollVisibleService';
import type { GridBodyCtrl } from './gridBodyCtrl';
import type { RowContainerCtrl } from './rowContainer/rowContainerCtrl';

// listens to changes in the shared grid viewport and center container size for
// column/row virtualisation and scrollbar visibility updates.
export class ViewportSizeFeature extends BeanStub {
    private scrollVisibleSvc: ScrollVisibleService;

    public wireBeans(beans: BeanCollection): void {
        this.scrollVisibleSvc = beans.scrollVisibleSvc;
    }

    private gridBodyCtrl: GridBodyCtrl | undefined;

    private centerWidth: number;
    private bodyHeight: number;
    private centerViewportResizeQueued = false;
    private scrollVisibilityRefreshQueued = false;

    constructor(private readonly centerContainerCtrl: RowContainerCtrl) {
        super();
    }

    public postConstruct(): void {
        this.beans.ctrlsSvc.whenReady(this, (p) => {
            this.gridBodyCtrl = p.gridBodyCtrl;
            this.listenForResize();
        });

        const scheduleCenterViewportResize = this.scheduleCenterViewportResize.bind(this);
        this.addManagedEventListeners({
            scrollbarWidthChanged: this.onScrollbarWidthChanged.bind(this),
            scrollVisibilityChanged: this.onCenterViewportResized.bind(this),
            pinnedHeightChanged: scheduleCenterViewportResize,
            pinnedRowsChanged: scheduleCenterViewportResize,
            headerHeightChanged: scheduleCenterViewportResize,
        });

        this.addManagedPropertyListeners(['alwaysShowHorizontalScroll', 'alwaysShowVerticalScroll'], () => {
            this.checkViewportAndScrolls();
        });
    }

    private listenForResize(): void {
        const { beans, centerContainerCtrl, gridBodyCtrl } = this;
        if (!gridBodyCtrl) {
            return;
        }

        const scheduleCenterViewportResize = () => this.scheduleCenterViewportResize();

        // In the flattened layout this viewport is the shared horizontal+vertical scroll container.
        centerContainerCtrl.registerViewportResizeListener(scheduleCenterViewportResize);

        const unsubscribeFromContainerResize = _observeResize(beans, centerContainerCtrl.eContainer, () =>
            this.scheduleScrollVisibilityRefresh()
        );
        this.addDestroyFunc(() => unsubscribeFromContainerResize());
    }

    private scheduleCenterViewportResize(): void {
        if (this.centerViewportResizeQueued) {
            return;
        }
        this.centerViewportResizeQueued = true;

        const { beans } = this;
        // onCenterViewportResize can trigger flex recalculations, which in turn trigger more resizes.
        // Queueing once per frame prevents duplicate work and avoids resize-observer loops.
        _requestAnimationFrame(beans, () => {
            this.centerViewportResizeQueued = false;
            this.onCenterViewportResized();
        });
    }

    private scheduleScrollVisibilityRefresh(): void {
        if (this.scrollVisibilityRefreshQueued) {
            return;
        }
        this.scrollVisibilityRefreshQueued = true;

        const { beans } = this;
        _requestAnimationFrame(beans, () => {
            this.scrollVisibilityRefreshQueued = false;
            this.updateScrollVisibleServiceImpl();
        });
    }

    private onScrollbarWidthChanged() {
        this.checkViewportAndScrolls();
    }

    private onCenterViewportResized(): void {
        if (!this.gridBodyCtrl) {
            return;
        }

        this.scrollVisibleSvc.updateScrollGap();
        if (this.centerContainerCtrl.isViewportInTheDOMTree()) {
            const { pinnedCols, colFlex } = this.beans;
            pinnedCols?.keepPinnedColumnsNarrowerThanViewport();
            this.checkViewportAndScrolls();

            const newWidth = this.centerContainerCtrl.getCenterWidth();

            if (newWidth !== this.centerWidth) {
                this.centerWidth = newWidth;
                colFlex?.refreshFlexedColumns({
                    viewportWidth: this.centerWidth,
                    updateBodyWidths: true,
                    fireResizedEvent: true,
                });
            }
        } else {
            this.bodyHeight = 0;
        }
    }

    // gets called every time the viewport size changes. we use this to check visibility of scrollbars
    // in the grid panel, and also to check size and position of viewport for row and column virtualisation.
    private checkViewportAndScrolls(): void {
        const gridBodyCtrl = this.gridBodyCtrl;
        if (!gridBodyCtrl) {
            return;
        }

        // results in updating anything that depends on scroll showing
        this.updateScrollVisibleService();

        // fires event if height changes, used by PaginationService, HeightScalerService, RowRenderer
        this.checkBodyHeight();

        // check for virtual columns for ColumnController
        this.onHorizontalViewportChanged();

        gridBodyCtrl.scrollFeature.checkScrollLeft();
    }

    public getBodyHeight(): number {
        return this.bodyHeight;
    }

    private checkBodyHeight(): void {
        const gridBodyCtrl = this.gridBodyCtrl;
        if (!gridBodyCtrl) {
            return;
        }

        const eGridViewport = gridBodyCtrl.eGridViewport;
        const bodyHeight = gridBodyCtrl.getBodyViewportHeight(_getInnerHeight(eGridViewport));

        if (this.bodyHeight !== bodyHeight) {
            this.bodyHeight = bodyHeight;
            this.eventSvc.dispatchEvent({
                type: 'bodyHeightChanged',
            });
        }
    }

    private updateScrollVisibleService(): void {
        // because of column animation (which takes 200ms), we have to do this twice.
        // eg if user removes cols anywhere except at the RHS, then the cols on the RHS
        // will animate to the left to fill the gap. this animation means just after
        // the cols are removed, the remaining cols are still in the original location
        // at the start of the animation, so pre animation the H scrollbar is still needed,
        // but post animation it is not.
        this.updateScrollVisibleServiceImpl();
        setTimeout(this.updateScrollVisibleServiceImpl.bind(this), 500);
    }

    private updateScrollVisibleServiceImpl(): void {
        const gridBodyCtrl = this.gridBodyCtrl;
        if (!this.isAlive() || !gridBodyCtrl) {
            return;
        }

        const params: SetScrollsVisibleParams = {
            horizontalScrollShowing: this.centerContainerCtrl.isHorizontalScrollShowing(),
            verticalScrollShowing: gridBodyCtrl.isVerticalScrollShowing(),
        };

        this.scrollVisibleSvc.setScrollsVisible(params);
    }

    // this gets called whenever a change in the viewport, so we can inform column controller it has to work
    // out the virtual columns again. gets called from following locations:
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged
    private onHorizontalViewportChanged(): void {
        const { centerContainerCtrl, beans } = this;
        const scrollWidth = centerContainerCtrl.getCenterWidth();
        const scrollPosition = centerContainerCtrl.getViewportScrollLeft();

        beans.colViewport.setScrollPosition(scrollWidth, scrollPosition);
    }
}
