import type { ColumnModel } from '../columns/columnModel';
import type { ColumnSizeService } from '../columns/columnSizeService';
import type { ColumnViewportService } from '../columns/columnViewportService';
import type { VisibleColsService } from '../columns/visibleColsService';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { AgColumn } from '../entities/agColumn';
import type { ScrollVisibleService, SetScrollsVisibleParams } from '../gridBodyComp/scrollVisibleService';
import type { ProcessUnpinnedColumnsParams } from '../interfaces/iCallbackParams';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { AnimationFrameService } from '../misc/animationFrameService';
import { _getInnerHeight, _getInnerWidth } from '../utils/dom';
import type { GridBodyCtrl } from './gridBodyCtrl';
import type { PinnedWidthService } from './pinnedWidthService';
import type { RowContainerCtrl } from './rowContainer/rowContainerCtrl';

// listens to changes in the center viewport size, for column and row virtualisation,
// and adjusts grid as necessary. there are two viewports, one for horizontal and one for
// vertical scrolling.
export class ViewportSizeFeature extends BeanStub {
    private ctrlsService: CtrlsService;
    private pinnedWidthService: PinnedWidthService;
    private columnModel: ColumnModel;
    private visibleColsService: VisibleColsService;
    private columnSizeService: ColumnSizeService;
    private scrollVisibleService: ScrollVisibleService;
    private columnViewportService: ColumnViewportService;
    private animationFrameService: AnimationFrameService;

    public wireBeans(beans: BeanCollection): void {
        this.animationFrameService = beans.animationFrameService;
        this.ctrlsService = beans.ctrlsService;
        this.pinnedWidthService = beans.pinnedWidthService;
        this.columnModel = beans.columnModel;
        this.visibleColsService = beans.visibleColsService;
        this.columnSizeService = beans.columnSizeService;
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
        const listener = () => {
            // onCenterViewportResize causes resize events to be fired (flex-columns).
            // when any resize event happens, style and layout are re-evaluated — which in turn may
            // trigger more resize events. Infinite loops from cyclic dependencies are addressed by
            // only processing elements deeper in the DOM during each iteration.
            // so the solution here is to use the animation frame service to avoid infinite loops.
            // For more info, see: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver#observation_errors
            this.animationFrameService.requestAnimationFrame(() => {
                this.onCenterViewportResized();
            });
        };

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
            this.keepPinnedColumnsNarrowerThanViewport();
            this.checkViewportAndScrolls();

            const newWidth = this.centerContainerCtrl.getCenterWidth();

            if (newWidth !== this.centerWidth) {
                this.centerWidth = newWidth;
                this.columnSizeService.refreshFlexedColumns({
                    viewportWidth: this.centerWidth,
                    updateBodyWidths: true,
                    fireResizedEvent: true,
                });
            }
        } else {
            this.bodyHeight = 0;
        }
    }

    private keepPinnedColumnsNarrowerThanViewport(): void {
        const eBodyViewport = this.gridBodyCtrl.getBodyViewportElement();
        const bodyWidth = _getInnerWidth(eBodyViewport);

        if (bodyWidth <= 50) {
            return;
        }

        // remove 50px from the bodyWidth to give some margin
        let columnsToRemove = this.getPinnedColumnsOverflowingViewport(bodyWidth - 50);
        const processUnpinnedColumns = this.gos.getCallback('processUnpinnedColumns');

        if (!columnsToRemove.length) {
            return;
        }

        if (processUnpinnedColumns) {
            const params: WithoutGridCommon<ProcessUnpinnedColumnsParams> = {
                columns: columnsToRemove,
                viewportWidth: bodyWidth,
            };
            columnsToRemove = processUnpinnedColumns(params) as AgColumn[];
        }

        this.columnModel.setColsPinned(columnsToRemove, null, 'viewportSizeFeature');
    }

    private getPinnedColumnsOverflowingViewport(viewportWidth: number): AgColumn[] {
        const pinnedRightWidth = this.pinnedWidthService.getPinnedRightWidth();
        const pinnedLeftWidth = this.pinnedWidthService.getPinnedLeftWidth();
        const totalPinnedWidth = pinnedRightWidth + pinnedLeftWidth;

        if (totalPinnedWidth < viewportWidth) {
            return [];
        }

        const pinnedLeftColumns = [...this.visibleColsService.getLeftCols()];
        const pinnedRightColumns = [...this.visibleColsService.getRightCols()];

        let indexRight = 0;
        let indexLeft = 0;
        const totalWidthRemoved = 0;

        const columnsToRemove: AgColumn[] = [];

        let spaceNecessary = totalPinnedWidth - totalWidthRemoved - viewportWidth;

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
