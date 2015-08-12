/// <reference path="../utils.ts" />
/// <reference path="../layout/borderLayout.ts" />

module awk.grid {

    var gridHtml =
            '<div>'+
                '<!-- header -->'+
                '<div class="ag-header">'+
                    '<div class="ag-pinned-header"></div><div class="ag-header-viewport"><div class="ag-header-container"></div></div>'+
                '</div>'+
                '<!-- body -->'+
                '<div class="ag-body">'+
                    '<div class="ag-pinned-cols-viewport">'+
                        '<div class="ag-pinned-cols-container"></div>'+
                    '</div>'+
                    '<div class="ag-body-viewport-wrapper">'+
                        '<div class="ag-body-viewport">'+
                            '<div class="ag-body-container"></div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>';

    var gridNoScrollsHtml =
            '<div>'+
                '<!-- header -->'+
                '<div class="ag-header-container"></div>'+
                '<!-- body -->'+
                '<div class="ag-body-container"></div>'+
            '</div>';

    // wrapping in outer div, and wrapper, is needed to center the loading icon
    // The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/
    var loadingHtml =
            '<div class="ag-loading-panel">'+
                '<div class="ag-loading-wrapper">'+
                    '<span class="ag-loading-center">Loading...</span>'+
                '</div>'+
            '</div>';

    var utils = Utils;

    export class GridPanel {

        private masterSlaveService: MasterSlaveService;
        gridOptionsWrapper: any;
        forPrint: any;
        scrollWidth: any;
        eRoot: any;
        layout: any;
        rowModel: any;
        eBodyViewport: any;
        columnModel: any;
        eBody: any;
        rowRenderer: any;

        eBodyContainer: any;
        ePinnedColsContainer: any;
        eHeaderContainer: any;
        ePinnedHeader: any;
        eHeader: any;
        eParentOfRows: any;
        eBodyViewportWrapper: any;
        ePinnedColsViewport: any;

        private scrollLagCounter = 0;

        constructor(gridOptionsWrapper: any) {
            this.gridOptionsWrapper = gridOptionsWrapper;
            // makes code below more readable if we pull 'forPrint' out
            this.forPrint = this.gridOptionsWrapper.isDontUseScrolls();
            this.setupComponents();
            this.scrollWidth = utils.getScrollbarWidth();
        }

        public init(columnModel: any, rowRenderer: any, masterSlaveService: MasterSlaveService) {
            this.columnModel = columnModel;
            this.rowRenderer = rowRenderer;
            this.masterSlaveService = masterSlaveService;
        }

        private setupComponents() {

            if (this.forPrint) {
                this.eRoot = utils.loadTemplate(gridNoScrollsHtml);
                utils.addCssClass(this.eRoot, 'ag-root ag-no-scrolls');
            } else {
                this.eRoot = utils.loadTemplate(gridHtml);
                utils.addCssClass(this.eRoot, 'ag-root ag-scrolls');
            }

            this.findElements();

            this.layout = new BorderLayout({
                overlay: utils.loadTemplate(loadingHtml),
                center: this.eRoot,
                dontFill: this.forPrint,
                name: 'eGridPanel'
            });

            this.addScrollListener();

            if (this.gridOptionsWrapper.isSuppressHorizontalScroll()) {
                this.eBodyViewport.style.overflowX = 'hidden';
            }
        }

        public ensureIndexVisible(index: any) {
            var lastRow = this.rowModel.getVirtualRowCount();
            if (typeof index !== 'number' || index < 0 || index >= lastRow) {
                console.warn('invalid row index for ensureIndexVisible: ' + index);
                return;
            }

            var rowHeight = this.gridOptionsWrapper.getRowHeight();
            var rowTopPixel = rowHeight * index;
            var rowBottomPixel = rowTopPixel + rowHeight;

            var viewportTopPixel = this.eBodyViewport.scrollTop;
            var viewportHeight = this.eBodyViewport.offsetHeight;
            var scrollShowing = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
            if (scrollShowing) {
                viewportHeight -= this.scrollWidth;
            }
            var viewportBottomPixel = viewportTopPixel + viewportHeight;

            var viewportScrolledPastRow = viewportTopPixel > rowTopPixel;
            var viewportScrolledBeforeRow = viewportBottomPixel < rowBottomPixel;

            if (viewportScrolledPastRow) {
                // if row is before, scroll up with row at top
                this.eBodyViewport.scrollTop = rowTopPixel;
            } else if (viewportScrolledBeforeRow) {
                // if row is below, scroll down with row at bottom
                var newScrollPosition = rowBottomPixel - viewportHeight;
                this.eBodyViewport.scrollTop = newScrollPosition;
            }
            // otherwise, row is already in view, so do nothing
        }

        public ensureColIndexVisible(index: any) {
            if (typeof index !== 'number') {
                console.warn('col index must be a number: ' + index);
                return;
            }

            var columns = this.columnModel.getDisplayedColumns();
            if (typeof index !== 'number' || index < 0 || index >= columns.length) {
                console.warn('invalid col index for ensureColIndexVisible: ' + index
                    + ', should be between 0 and ' + (columns.length - 1));
                return;
            }

            var column = columns[index];
            var pinnedColCount = this.gridOptionsWrapper.getPinnedColCount();
            if (index < pinnedColCount) {
                console.warn('invalid col index for ensureColIndexVisible: ' + index
                    + ', scrolling to a pinned col makes no sense');
                return;
            }

            // sum up all col width to the let to get the start pixel
            var colLeftPixel = 0;
            for (var i = pinnedColCount; i < index; i++) {
                colLeftPixel += columns[i].actualWidth;
            }

            var colRightPixel = colLeftPixel + column.actualWidth;

            var viewportLeftPixel = this.eBodyViewport.scrollLeft;
            var viewportWidth = this.eBodyViewport.offsetWidth;

            var scrollShowing = this.eBodyViewport.clientHeight < this.eBodyViewport.scrollHeight;
            if (scrollShowing) {
                viewportWidth -= this.scrollWidth;
            }

            var viewportRightPixel = viewportLeftPixel + viewportWidth;

            var viewportScrolledPastCol = viewportLeftPixel > colLeftPixel;
            var viewportScrolledBeforeCol = viewportRightPixel < colRightPixel;

            if (viewportScrolledPastCol) {
                // if viewport's left side is after col's left side, scroll right to pull col into viewport at left
                this.eBodyViewport.scrollLeft = colLeftPixel;
            } else if (viewportScrolledBeforeCol) {
                // if viewport's right side is before col's right side, scroll left to pull col into viewport at right
                var newScrollPosition = colRightPixel - viewportWidth;
                this.eBodyViewport.scrollLeft = newScrollPosition;
            }
            // otherwise, col is already in view, so do nothing
        }

        public showLoading(loading: any) {
            this.layout.setOverlayVisible(loading);
        }

        public getWidthForSizeColsToFit() {
            var availableWidth = this.eBody.clientWidth;
            var scrollShowing = this.eBodyViewport.clientHeight < this.eBodyViewport.scrollHeight;
            if (scrollShowing) {
                availableWidth -= this.scrollWidth;
            }
            return availableWidth;
        }

        public setRowModel(rowModel: any) {
            this.rowModel = rowModel;
        }

        public getBodyContainer() {
            return this.eBodyContainer;
        }

        public getBodyViewport() {
            return this.eBodyViewport;
        }

        public getPinnedColsContainer() {
            return this.ePinnedColsContainer;
        }

        public getHeaderContainer() {
            return this.eHeaderContainer;
        }

        public getRoot() {
            return this.eRoot;
        }

        public getPinnedHeader() {
            return this.ePinnedHeader;
        }

        //private getHeader() {
        //    return this.eHeader;
        //}

        public getRowsParent() {
            return this.eParentOfRows;
        }

        private findElements() {
            if (this.forPrint) {
                this.eHeaderContainer = this.eRoot.querySelector(".ag-header-container");
                this.eBodyContainer = this.eRoot.querySelector(".ag-body-container");
                // for no-scrolls, all rows live in the body container
                this.eParentOfRows = this.eBodyContainer;
            } else {
                this.eBody = this.eRoot.querySelector(".ag-body");
                this.eBodyContainer = this.eRoot.querySelector(".ag-body-container");
                this.eBodyViewport = this.eRoot.querySelector(".ag-body-viewport");
                this.eBodyViewportWrapper = this.eRoot.querySelector(".ag-body-viewport-wrapper");
                this.ePinnedColsContainer = this.eRoot.querySelector(".ag-pinned-cols-container");
                this.ePinnedColsViewport = this.eRoot.querySelector(".ag-pinned-cols-viewport");
                this.ePinnedHeader = this.eRoot.querySelector(".ag-pinned-header");
                this.eHeader = this.eRoot.querySelector(".ag-header");
                this.eHeaderContainer = this.eRoot.querySelector(".ag-header-container");
                // for scrolls, all rows live in eBody (containing pinned and normal body)
                this.eParentOfRows = this.eBody;
            }
        }

        public setBodyContainerWidth() {
            var mainRowWidth = this.columnModel.getBodyContainerWidth() + "px";
            this.eBodyContainer.style.width = mainRowWidth;
        }

        public setPinnedColContainerWidth() {
            if (this.forPrint) {
                // pinned col doesn't exist when doing forPrint
                return;
            }
            var pinnedColWidth = this.columnModel.getPinnedContainerWidth() + "px";
            this.ePinnedColsContainer.style.width = pinnedColWidth;
            this.eBodyViewportWrapper.style.marginLeft = pinnedColWidth;
        }

        public showPinnedColContainersIfNeeded() {
            // no need to do this if not using scrolls
            if (this.forPrint) {
                return;
            }

            var showingPinnedCols = this.gridOptionsWrapper.getPinnedColCount() > 0;

            //some browsers had layout issues with the blank divs, so if blank,
            //we don't display them
            if (showingPinnedCols) {
                this.ePinnedHeader.style.display = 'inline-block';
                this.ePinnedColsViewport.style.display = 'inline';
            } else {
                this.ePinnedHeader.style.display = 'none';
                this.ePinnedColsViewport.style.display = 'none';
            }
        }

        public setHeaderHeight() {
            var headerHeight = this.gridOptionsWrapper.getHeaderHeight();
            var headerHeightPixels = headerHeight + 'px';
            if (this.forPrint) {
                this.eHeaderContainer.style['height'] = headerHeightPixels;
            } else {
                this.eHeader.style['height'] = headerHeightPixels;
                this.eBody.style['paddingTop'] = headerHeightPixels;
            }
        }

        // see if a grey box is needed at the bottom of the pinned col
        public setPinnedColHeight() {
            if (!this.forPrint) {
                var bodyHeight = this.eBodyViewport.offsetHeight;
                this.ePinnedColsViewport.style.height = bodyHeight + "px";
            }
        }

        public setHorizontalScrollPosition(hScrollPosition: number): void {
            this.eBodyViewport.scrollLeft = hScrollPosition;
        }

        private addScrollListener() {
            // if printing, then no scrolling, so no point in listening for scroll events
            if (this.forPrint) {
                return;
            }

            var lastLeftPosition = -1;
            var lastTopPosition = -1;

            this.eBodyViewport.addEventListener("scroll", () => {
                var newLeftPosition = this.eBodyViewport.scrollLeft;
                var newTopPosition = this.eBodyViewport.scrollTop;

                if (newLeftPosition !== lastLeftPosition) {
                    lastLeftPosition = newLeftPosition;
                    this.scrollHeader(newLeftPosition);
                }

                if (newTopPosition !== lastTopPosition) {
                    lastTopPosition = newTopPosition;
                    this.scrollPinned(newTopPosition);
                    this.requestDrawVirtualRows();
                }

                this.masterSlaveService.fireHorizontalScrollEvent(newLeftPosition);
            });

            this.ePinnedColsViewport.addEventListener("scroll", () => {
                // this means the pinned panel was moved, which can only
                // happen when the user is navigating in the pinned container
                // as the pinned col should never scroll. so we rollback
                // the scroll on the pinned.
                this.ePinnedColsViewport.scrollTop = 0;
            });

        }

        private requestDrawVirtualRows() {
            // if we are in IE or Safari, then we only redraw if there was no scroll event
            // in the 50ms following this scroll event. without this, these browsers have
            // a bad scrolling feel, where the redraws clog the scroll experience
            // (makes the scroll clunky and sticky). this method is like throttling
            // the scroll events.
            var useScrollLag: boolean;
            // let the user override scroll lag option
            if (this.gridOptionsWrapper.isSuppressScrollLag()) {
                useScrollLag = false;
            } else if (this.gridOptionsWrapper.getIsScrollLag()) {
                useScrollLag = this.gridOptionsWrapper.getIsScrollLag()();
            } else {
                useScrollLag = utils.isBrowserIE() || utils.isBrowserSafari();
            }
            if (useScrollLag) {
                this.scrollLagCounter++;
                var scrollLagCounterCopy = this.scrollLagCounter;
                setTimeout( ()=> {
                    if (this.scrollLagCounter === scrollLagCounterCopy) {
                        this.rowRenderer.drawVirtualRows();
                    }
                }, 50);
            // all other browsers, afaik, are fine, so just do the redraw
            } else {
                this.rowRenderer.drawVirtualRows();
            }
        }

        private scrollHeader(bodyLeftPosition: any) {
            // this.eHeaderContainer.style.transform = 'translate3d(' + -bodyLeftPosition + "px,0,0)";
            this.eHeaderContainer.style.left = -bodyLeftPosition + "px";
        }

        private scrollPinned(bodyTopPosition: any) {
            // this.ePinnedColsContainer.style.transform = 'translate3d(0,' + -bodyTopPosition + "px,0)";
            this.ePinnedColsContainer.style.top = -bodyTopPosition + "px";
        }
    }
}

