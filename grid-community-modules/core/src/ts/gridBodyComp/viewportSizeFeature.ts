import { BeanStub } from "../context/beanStub";
import { Autowired, PostConstruct } from "../context/context";
import { ColumnModel } from "../columns/columnModel";
import { ScrollVisibleService, SetScrollsVisibleParams } from "../gridBodyComp/scrollVisibleService";
import { GridBodyCtrl } from "./gridBodyCtrl";
import { BodyHeightChangedEvent, Events } from "../events";
import { CtrlsService } from "../ctrlsService";
import { RowContainerCtrl } from "./rowContainer/rowContainerCtrl";
import { getInnerHeight, getInnerWidth } from "../utils/dom";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { PinnedWidthService } from "./pinnedWidthService";
import { Column } from "../entities/column";
import { ProcessUnpinnedColumnsParams } from "../interfaces/iCallbackParams";

// listens to changes in the center viewport size, for column and row virtualisation,
// and adjusts grid as necessary. there are two viewports, one for horizontal and one for
// vertical scrolling.
export class ViewportSizeFeature extends BeanStub {

    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('pinnedWidthService') private pinnedWidthService: PinnedWidthService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;

    private centerContainerCtrl: RowContainerCtrl;
    private gridBodyCtrl: GridBodyCtrl;

    private centerWidth: number;
    private bodyHeight: number;

    constructor(centerContainerCtrl: RowContainerCtrl) {
        super();
        this.centerContainerCtrl = centerContainerCtrl;
    }

    @PostConstruct
    private postConstruct(): void {
        this.ctrlsService.whenReady(() => {
            this.gridBodyCtrl = this.ctrlsService.getGridBodyCtrl();
            this.listenForResize();
        });
        this.addManagedListener(this.eventService, Events.EVENT_SCROLLBAR_WIDTH_CHANGED, this.onScrollbarWidthChanged.bind(this));
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
        if (this.centerContainerCtrl.isViewportVisible()) {
            this.keepPinnedColumnsNarrowerThanViewport();
            this.checkViewportAndScrolls();

            const newWidth = this.centerContainerCtrl.getCenterWidth();

            if (newWidth !== this.centerWidth) {
                this.centerWidth = newWidth;
                this.columnModel.refreshFlexedColumns(
                    { viewportWidth: this.centerWidth, updateBodyWidths: true, fireResizedEvent: true }
                );
            }
        } else {
            this.bodyHeight = 0;
        }
    }

    private keepPinnedColumnsNarrowerThanViewport(): void {
        const eBodyViewport = this.gridBodyCtrl.getBodyViewportElement();
        const bodyWidth = getInnerWidth(eBodyViewport);

        if (isNaN(bodyWidth) || bodyWidth <= 50) { return; }

        // remove 50px from the bodyWidth to give some margin
        let columnsToRemove = this.getPinnedColumnsOverflowingViewport(bodyWidth - 50);
        const processUnpinnedColumns = this.gridOptionsService.getCallback('processUnpinnedColumns');

        if (!columnsToRemove.length) { return; }

        if (processUnpinnedColumns) {
            const params: WithoutGridCommon<ProcessUnpinnedColumnsParams> = {
                columns: columnsToRemove,
                viewportWidth: bodyWidth
            }
            columnsToRemove = processUnpinnedColumns(params);
        }

        this.columnModel.setColumnsPinned(columnsToRemove, null, 'viewportSizeFeature')
    }

    private getPinnedColumnsOverflowingViewport(viewportWidth: number): Column[] {
        const pinnedRightWidth = this.pinnedWidthService.getPinnedRightWidth();
        const pinnedLeftWidth = this.pinnedWidthService.getPinnedLeftWidth();
        const totalPinnedWidth = pinnedRightWidth + pinnedLeftWidth;

        if (totalPinnedWidth < viewportWidth) { return []; }

        const pinnedLeftColumns: Column[] = [...this.columnModel.getDisplayedLeftColumns()];
        const pinnedRightColumns: Column[] = [...this.columnModel.getDisplayedRightColumns()];

        let indexRight = 0;
        let indexLeft = 0;
        let totalWidthRemoved = 0;

        const columnsToRemove: Column[] = [];

        let spaceNecessary = (totalPinnedWidth - totalWidthRemoved) - viewportWidth;

        while ((indexLeft < pinnedLeftColumns.length || indexRight < pinnedRightColumns.length) && spaceNecessary > 0) {
            if (indexRight < pinnedRightColumns.length) {
                const currentColumn = pinnedRightColumns[indexRight++];
                spaceNecessary -= currentColumn.getActualWidth();
                columnsToRemove.push(currentColumn);
            }

            if (indexLeft < pinnedLeftColumns.length && spaceNecessary > 0) {
                const currentColumn = pinnedLeftColumns[indexLeft++];
                spaceNecessary -= currentColumn.getActualWidth();
                columnsToRemove.push(currentColumn);
            }
        }

        return columnsToRemove;
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
        const bodyHeight = getInnerHeight(eBodyViewport);

        if (this.bodyHeight !== bodyHeight) {
            this.bodyHeight = bodyHeight;
            const event: WithoutGridCommon<BodyHeightChangedEvent> = {
                type: Events.EVENT_BODY_HEIGHT_CHANGED
            };
            this.eventService.dispatchEvent(event);
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
            verticalScrollShowing: this.gridBodyCtrl.isVerticalScrollShowing()
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

        this.columnModel.setViewportPosition(scrollWidth, scrollPosition);
    }
}