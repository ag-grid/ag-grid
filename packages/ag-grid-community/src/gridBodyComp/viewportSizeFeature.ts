import { _getInnerHeight, _getInnerWidth, _observeResize } from 'ag-stack';

import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { ScrollVisibleService } from '../gridBodyComp/scrollVisibleService';
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

    private readonly scheduleCenterViewportResize = this.throttleToFrame(() => this.onCenterViewportResized());
    private readonly scheduleViewportGeometryRefresh = this.throttleToFrame(() => this.onViewportGeometryChanged());
    private readonly scheduleScrollVisibilityRefresh = this.throttleToFrame(() => this.scrollVisibleSvc.refresh());

    constructor(private readonly centerContainerCtrl: RowContainerCtrl) {
        super();
    }

    public postConstruct(): void {
        this.beans.ctrlsSvc.whenReady(this, (p) => {
            this.gridBodyCtrl = p.gridBodyCtrl;
            this.listenForResize();
        });

        const scheduleViewportGeometryRefresh = this.scheduleViewportGeometryRefresh;
        this.addManagedEventListeners({
            scrollbarWidthChanged: this.onScrollbarWidthChanged.bind(this),
            scrollVisibilityChanged: this.onViewportGeometryChanged.bind(this),
            pinnedHeightChanged: scheduleViewportGeometryRefresh,
            pinnedRowsChanged: scheduleViewportGeometryRefresh,
            headerHeightChanged: scheduleViewportGeometryRefresh,
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

        // In the flattened layout this viewport is the shared horizontal+vertical scroll container.
        centerContainerCtrl.registerViewportResizeListener(this.scheduleCenterViewportResize);

        const unsubscribeFromContainerResize = _observeResize(
            beans,
            centerContainerCtrl.eContainer,
            this.scheduleScrollVisibilityRefresh
        );
        this.addDestroyFunc(() => unsubscribeFromContainerResize());
    }

    private onScrollbarWidthChanged() {
        this.checkViewportAndScrolls();
    }

    private onViewportGeometryChanged(): void {
        if (!this.gridBodyCtrl) {
            return;
        }
        this.checkViewportAndScrolls();
    }

    private onCenterViewportResized(): void {
        if (!this.gridBodyCtrl) {
            return;
        }

        if (this.centerContainerCtrl.isViewportInTheDOMTree()) {
            const { pinnedCols, colFlex } = this.beans;
            const gridBodyCtrl = this.gridBodyCtrl;
            // One resolution for the whole frame. It stays live, so the reads below still see the effect of
            // anything written in between.
            const style = window.getComputedStyle(gridBodyCtrl.eGridViewport);
            // The viewport has just resized, and the pinned-width rule is enforced against it.
            gridBodyCtrl.refreshViewportWidth(_getInnerWidth(gridBodyCtrl.eGridViewport, style));
            pinnedCols?.keepPinnedColumnsNarrowerThanViewport();
            this.checkViewportAndScrolls(style);

            // The width reported above, so the flex pass and the containers are sized from the same one.
            const newWidth = gridBodyCtrl.getCenterWidth(gridBodyCtrl.getReportedViewportWidth());

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
    private checkViewportAndScrolls(sharedStyle?: CSSStyleDeclaration): void {
        const gridBodyCtrl = this.gridBodyCtrl;
        if (!gridBodyCtrl) {
            return;
        }

        const eGridViewport = gridBodyCtrl.eGridViewport;
        const style = sharedStyle ?? window.getComputedStyle(eGridViewport);

        // Before the visibility pass, which resolves both the horizontal scrollbar and the scroll gap
        // from this width and would otherwise decide them on the previous layout.
        gridBodyCtrl.refreshViewportWidth(_getInnerWidth(eGridViewport, style));

        // results in updating anything that depends on scroll showing
        this.scrollVisibleSvc.refresh();

        // After it: an applied horizontal scrollbar takes its space out of the viewport's height.
        // fires event if height changes, used by PaginationService, HeightScalerService, RowRenderer
        this.checkBodyHeight(_getInnerHeight(eGridViewport, style));

        // check for virtual columns for ColumnController
        this.onHorizontalViewportChanged();

        gridBodyCtrl.scrollFeature.checkScrollLeft();
    }

    public getBodyHeight(): number {
        return this.bodyHeight;
    }

    private checkBodyHeight(innerHeight: number): void {
        const gridBodyCtrl = this.gridBodyCtrl;
        if (!gridBodyCtrl) {
            return;
        }

        const bodyHeight = gridBodyCtrl.getBodyViewportHeight(innerHeight);

        if (this.bodyHeight !== bodyHeight) {
            this.bodyHeight = bodyHeight;
            this.eventSvc.dispatchEvent({
                type: 'bodyHeightChanged',
            });
        }
    }

    // this gets called whenever a change in the viewport, so we can inform column controller it has to work
    // out the virtual columns again. gets called from following locations:
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged
    private onHorizontalViewportChanged(): void {
        this.gridBodyCtrl?.updateColumnViewport();
    }
}
