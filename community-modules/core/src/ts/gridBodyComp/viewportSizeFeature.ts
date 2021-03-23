import { BeanStub } from "../context/beanStub";
import { Autowired, PostConstruct } from "../context/context";
import { ResizeObserverService } from "../misc/resizeObserverService";
import { ColumnController } from "../columnController/columnController";
import { ScrollVisibleService, SetScrollsVisibleParams } from "../gridBodyComp/scrollVisibleService";
import { GridBodyController } from "../gridBodyComp/gridBodyController";
import { Events } from "../events";
import { ColumnApi } from "../columnController/columnApi";
import { GridApi } from "../gridApi";
import { RowContainerComp } from "./rowContainer/rowContainerComp";

export class ViewportSizeFeature extends BeanStub {

    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    private centerContainer: RowContainerComp;
    private gridBodyCon: GridBodyController;

    private centerWidth: number;

    constructor(centerContainer: RowContainerComp, gridBodyCon: GridBodyController) {
        super();
        this.centerContainer = centerContainer;
        this.gridBodyCon = gridBodyCon;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_SCROLLBAR_WIDTH_CHANGED, this.onScrollbarWidthChanged.bind(this));

        this.listenForResize();
    }

    private listenForResize(): void {
        const listener = this.onCenterViewportResized.bind(this);

        // centerContainer gets horizontal resizes
        this.centerContainer.registerViewportResizeListener(listener);

        // eBodyViewport gets vertical resizes
        this.gridBodyCon.registerBodyViewportResizeListener(listener);
    }

    private onScrollbarWidthChanged() {
        this.checkViewportAndScrolls();
    }

    private onCenterViewportResized(): void {
        if (this.centerContainer.isViewportVisible()) {
            this.checkViewportAndScrolls();

            const newWidth = this.centerContainer.getCenterWidth();

            if (newWidth !== this.centerWidth) {
                this.centerWidth = newWidth;
                this.columnController.refreshFlexedColumns(
                    { viewportWidth: this.centerWidth, updateBodyWidths: true, fireResizedEvent: true }
                );
            }
        } else {
            this.gridBodyCon.clearBodyHeight();
        }
    }

    // gets called every time the viewport size changes. we use this to check visibility of scrollbars
    // in the grid panel, and also to check size and position of viewport for row and column virtualisation.
    public checkViewportAndScrolls(): void {
        // results in updating anything that depends on scroll showing
        this.updateScrollVisibleService();

        // fires event if height changes, used by PaginationService, HeightScalerService, RowRenderer
        this.gridBodyCon.checkBodyHeight();

        // check for virtual columns for ColumnController
        this.onHorizontalViewportChanged();

        this.gridBodyCon.checkScrollLeft();
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
            verticalScrollShowing: this.gridBodyCon.isVerticalScrollShowing()
        };

        this.scrollVisibleService.setScrollsVisible(params);

        // fix - gridComp should just listen to event from above
        this.gridBodyCon.setVerticalScrollPaddingVisible(params.verticalScrollShowing);
    }

    public isHorizontalScrollShowing(): boolean {
        const isAlwaysShowHorizontalScroll = this.gridOptionsWrapper.isAlwaysShowHorizontalScroll();
        return isAlwaysShowHorizontalScroll || this.centerContainer.isViewportHScrollShowing();
    }

    // this gets called whenever a change in the viewport, so we can inform column controller it has to work
    // out the virtual columns again. gets called from following locations:
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged, API (doLayout)
    private onHorizontalViewportChanged(): void {
        const scrollWidth = this.centerContainer.getCenterWidth();
        const scrollPosition = this.centerContainer.getViewportScrollLeft();

        this.columnController.setViewportPosition(scrollWidth, scrollPosition);
    }
}