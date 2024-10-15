import type { ColumnFlexService } from '../columns/columnFlexService';
import type { ColumnViewportService } from '../columns/columnViewportService';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { ScrollVisibleService, SetScrollsVisibleParams } from '../gridBodyComp/scrollVisibleService';
import type { PinnedColumnService } from '../pinnedColumns/pinnedColumnService';
import { _getInnerHeight } from '../utils/dom';
import type { GridBodyCtrl } from './gridBodyCtrl';
import type { RowContainerCtrl } from './rowContainer/rowContainerCtrl';

// listens to changes in the center viewport size, for column and row virtualisation,
// and adjusts grid as necessary. there are two viewports, one for horizontal and one for
// vertical scrolling.
export class ViewportSizeFeature extends BeanStub {
    private ctrlsService: CtrlsService;
    private pinnedColumnService?: PinnedColumnService;
    private columnFlexService?: ColumnFlexService;
    private scrollVisibleService: ScrollVisibleService;
    private columnViewportService: ColumnViewportService;

    public wireBeans(beans: BeanCollection): void {
        this.ctrlsService = beans.ctrlsService;
        this.pinnedColumnService = beans.pinnedColumnService;
        this.columnFlexService = beans.columnFlexService;
        this.scrollVisibleService = beans.scrollVisibleService;
        this.columnViewportService = beans.columnViewportService;
    }

    private centerContainerCtrl: RowContainerCtrl;
    private gridBodyCtrl: GridBodyCtrl;

    private centerWidth: number;
    private bodyHeight: number;

    constructor(centerContainerCtrl: RowContainerCtrl) {
        super();
        this.centerContainerCtrl = centerContainerCtrl;
    }

    public postConstruct(): void {
        this.ctrlsService.whenReady(this, (p) => {
            this.gridBodyCtrl = p.gridBodyCtrl;
            this.listenForResize();
        });
        this.addManagedEventListeners({ scrollbarWidthChanged: this.onScrollbarWidthChanged.bind(this) });
        this.addManagedPropertyListeners(['alwaysShowHorizontalScroll', 'alwaysShowVerticalScroll'], () => {
            this.checkViewportAndScrolls();
        });
    }

    private listenForResize(): void {
        const listener = () => this.onCenterViewportResized();

        // centerContainer gets horizontal resizes
        this.centerContainerCtrl.registerViewportResizeListener(listener);

        // eBodyViewport gets vertical resizes
        this.gridBodyCtrl.registerBodyViewportResizeListener(listener);
    }

    private onScrollbarWidthChanged() {
        this.checkViewportAndScrolls();
    }

    private onCenterViewportResized(): void {
        this.scrollVisibleService.onCentreViewportResized();
        if (this.centerContainerCtrl.isViewportInTheDOMTree()) {
            this.pinnedColumnService?.keepPinnedColumnsNarrowerThanViewport();
            this.checkViewportAndScrolls();

            const newWidth = this.centerContainerCtrl.getCenterWidth();

            if (newWidth !== this.centerWidth) {
                this.centerWidth = newWidth;
                this.columnFlexService?.refreshFlexedColumns({
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
        // results in updating anything that depends on scroll showing
        this.updateScrollVisibleService();

        // fires event if height changes, used by PaginationService, HeightScalerService, RowRenderer
        this.checkBodyHeight();

        // check for virtual columns for ColumnController
        this.onHorizontalViewportChanged();

        this.gridBodyCtrl.getScrollFeature().checkScrollLeft();
    }

    public getBodyHeight(): number {
        return this.bodyHeight;
    }

    private checkBodyHeight(): void {
        const eBodyViewport = this.gridBodyCtrl.getBodyViewportElement();
        const bodyHeight = _getInnerHeight(eBodyViewport);

        if (this.bodyHeight !== bodyHeight) {
            this.bodyHeight = bodyHeight;
            this.eventService.dispatchEvent({
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
        const params: SetScrollsVisibleParams = {
            horizontalScrollShowing: this.isHorizontalScrollShowing(),
            verticalScrollShowing: this.gridBodyCtrl.isVerticalScrollShowing(),
        };

        this.scrollVisibleService.setScrollsVisible(params);
    }

    private isHorizontalScrollShowing(): boolean {
        return this.centerContainerCtrl.isHorizontalScrollShowing();
    }

    // this gets called whenever a change in the viewport, so we can inform column controller it has to work
    // out the virtual columns again. gets called from following locations:
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged
    private onHorizontalViewportChanged(): void {
        const scrollWidth = this.centerContainerCtrl.getCenterWidth();
        const scrollPosition = this.centerContainerCtrl.getViewportScrollLeft();

        this.columnViewportService.setScrollPosition(scrollWidth, scrollPosition);
    }
}
