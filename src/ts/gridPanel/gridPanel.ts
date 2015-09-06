/// <reference path="../utils.ts" />
/// <reference path="../layout/borderLayout.ts" />

module awk.grid {

    var gridHtml =
            `<div>
                <!-- header -->
                <div class="ag-header">
                    <div class="ag-pinned-header"></div><div class="ag-header-viewport"><div class="ag-header-container"></div></div>
                </div>
                <!-- floating top -->
                <div class="ag-floating-top">
                    <div class="ag-pinned-floating-top"></div><div class="ag-floating-top-viewport"><div class="ag-floating-top-container"></div></div>
                </div>
                <!-- floating bottom -->
                <div class="ag-floating-bottom">
                    <div class="ag-pinned-floating-bottom"></div><div class="ag-floating-bottom-viewport"><div class="ag-floating-bottom-container"></div></div>
                </div>
                <!-- body -->
                <div class="ag-body">
                    <div class="ag-pinned-cols-viewport">
                        <div class="ag-pinned-cols-container"></div>
                    </div>
                    <div class="ag-body-viewport-wrapper">
                        <div class="ag-body-viewport">
                            <div class="ag-body-container"></div>
                        </div>
                    </div>
                </div>
            </div>`;

    var gridNoScrollsHtml =
            `<div>
                <!-- header -->
                <div class="ag-header-container"></div>
                <!-- floating top -->
                <div class="ag-floating-top-container"></div>
                <!-- body -->
                <div class="ag-body-container"></div>
                <!-- floating bottom -->
                <div class="ag-floating-bottom-container"></div>
            </div>`;

    // wrapping in outer div, and wrapper, is needed to center the loading icon
    // The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/
    var loadingHtml =
            '<div class="ag-loading-panel">'+
                '<div class="ag-loading-wrapper">'+
                    '<span class="ag-loading-center">[LOADING...]</span>'+
                '</div>'+
            '</div>';

    var _ = Utils;

    export class GridPanel {

        private masterSlaveService: MasterSlaveService;
        private gridOptionsWrapper: GridOptionsWrapper;
        private columnModel: ColumnController;
        private rowRenderer: RowRenderer;
        private rowModel: any;

        private layout: BorderLayout;

        private forPrint: boolean;
        private scrollWidth: number;
        private scrollLagCounter = 0;

        private eBodyViewport: HTMLElement;
        private eRoot: HTMLElement;
        private eBody: HTMLElement;
        private eBodyContainer: HTMLElement;
        private ePinnedColsContainer: HTMLElement;
        private eHeaderContainer: HTMLElement;
        private ePinnedHeader: HTMLElement;
        private eHeader: HTMLElement;
        private eParentsOfRows: HTMLElement[];
        private eBodyViewportWrapper: HTMLElement;
        private ePinnedColsViewport: HTMLElement;

        private eFloatingTop: HTMLElement;
        private ePinnedFloatingTop: HTMLElement;
        private eFloatingTopContainer: HTMLElement;

        private eFloatingBottom: HTMLElement;
        private ePinnedFloatingBottom: HTMLElement;
        private eFloatingBottomContainer: HTMLElement;

        constructor(gridOptionsWrapper: GridOptionsWrapper) {
            this.gridOptionsWrapper = gridOptionsWrapper;
            // makes code below more readable if we pull 'forPrint' out
            this.forPrint = this.gridOptionsWrapper.isDontUseScrolls();
            this.setupComponents();
            this.scrollWidth = _.getScrollbarWidth();
        }

        public init(columnModel: ColumnController, rowRenderer: RowRenderer, masterSlaveService: MasterSlaveService) {
            this.columnModel = columnModel;
            this.rowRenderer = rowRenderer;
            this.masterSlaveService = masterSlaveService;
            this.sizeHeaderAndBody();
        }

        public getLayout(): BorderLayout {
            return this.layout;
        }

        private setupComponents() {

            if (this.forPrint) {
                this.eRoot = <HTMLElement> _.loadTemplate(gridNoScrollsHtml);
                _.addCssClass(this.eRoot, 'ag-root ag-no-scrolls');
            } else {
                this.eRoot = <HTMLElement> _.loadTemplate(gridHtml);
                _.addCssClass(this.eRoot, 'ag-root ag-scrolls');
            }

            this.findElements();

            this.layout = new BorderLayout({
                overlay: _.loadTemplate(this.createTemplate()),
                center: this.eRoot,
                dontFill: this.forPrint,
                name: 'eGridPanel'
            });

            this.layout.addSizeChangeListener(this.onBodyHeightChange.bind(this));

            this.addScrollListener();

            if (this.gridOptionsWrapper.isSuppressHorizontalScroll()) {
                this.eBodyViewport.style.overflowX = 'hidden';
            }
        }

        public getPinnedFloatingTop(): HTMLElement {
            return this.ePinnedFloatingTop;
        }

        public getFloatingTopContainer(): HTMLElement {
            return this.eFloatingTopContainer;
        }

        public getPinnedFloatingBottom(): HTMLElement {
            return this.ePinnedFloatingBottom;
        }

        public getFloatingBottomContainer(): HTMLElement {
            return this.eFloatingBottomContainer;
        }

        private createTemplate(): string {
            var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            return loadingHtml.replace('[LOADING...]', localeTextFunc('loadingOoo', 'Loading...'))
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

        public getRowsParent(): HTMLElement[] {
            return this.eParentsOfRows;
        }

        private queryHtmlElement(selector: string): HTMLElement {
            return <HTMLElement> this.eRoot.querySelector(selector);
        }

        private findElements() {
            if (this.forPrint) {
                this.eHeaderContainer = this.queryHtmlElement('.ag-header-container');
                this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
                this.eFloatingTopContainer = this.queryHtmlElement('.ag-floating-top-container');
                this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');

                this.eParentsOfRows = [this.eBodyContainer, this.eFloatingTopContainer, this.eFloatingBottomContainer];
            } else {
                this.eBody = this.queryHtmlElement('.ag-body');
                this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
                this.eBodyViewport = this.queryHtmlElement('.ag-body-viewport');
                this.eBodyViewportWrapper = this.queryHtmlElement('.ag-body-viewport-wrapper');
                this.ePinnedColsContainer = this.queryHtmlElement('.ag-pinned-cols-container');
                this.ePinnedColsViewport = this.queryHtmlElement('.ag-pinned-cols-viewport');
                this.ePinnedHeader = this.queryHtmlElement('.ag-pinned-header');
                this.eHeader = this.queryHtmlElement('.ag-header');
                this.eHeaderContainer = this.queryHtmlElement('.ag-header-container');

                this.eFloatingTop = this.queryHtmlElement('.ag-floating-top');
                this.ePinnedFloatingTop = this.queryHtmlElement('.ag-pinned-floating-top');
                this.eFloatingTopContainer = this.queryHtmlElement('.ag-floating-top-container');

                this.eFloatingBottom = this.queryHtmlElement('.ag-floating-bottom');
                this.ePinnedFloatingBottom = this.queryHtmlElement('.ag-pinned-floating-bottom');
                this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');

                // for scrolls, all rows live in eBody (containing pinned and normal body)
                this.eParentsOfRows = [this.eBody, this.eFloatingTop, this.eFloatingBottom];

                // IE9, Chrome, Safari, Opera
                this.ePinnedColsViewport.addEventListener('mousewheel', this.mouseWheelListener.bind(this));
                // Firefox
                this.ePinnedColsViewport.addEventListener('DOMMouseScroll', this.mouseWheelListener.bind(this));
            }
        }

        private mouseWheelListener(event: any): boolean {
            var delta: number;
            if (event.deltaY && event.deltaX != 0) {
                // tested on chrome
                delta = event.deltaY;
            } else if (event.wheelDelta && event.wheelDelta != 0) {
                // tested on IE
                delta = -event.wheelDelta;
            } else if (event.detail && event.detail != 0) {
                // tested on Firefox. Firefox appears to be slower, 20px rather than the 100px in Chrome and IE
                delta = event.detail * 20;
            } else {
                // couldn't find delta
                return;
            }

            var newTopPosition = this.eBodyViewport.scrollTop + delta;
            this.eBodyViewport.scrollTop = newTopPosition;

            // if we don't prevent default, then the whole browser will scroll also as well as the grid
            event.preventDefault();
            return false;
        }

        public setBodyContainerWidth() {
            var mainRowWidth = this.columnModel.getBodyContainerWidth() + 'px';
            this.eBodyContainer.style.width = mainRowWidth;
            if (!this.forPrint) {
                this.eFloatingBottomContainer.style.width = mainRowWidth;
                this.eFloatingTopContainer.style.width = mainRowWidth;
            }
        }

        public setPinnedColContainerWidth() {
            if (this.forPrint) {
                // pinned col doesn't exist when doing forPrint
                return;
            }
            var pinnedColWidth = this.columnModel.getPinnedContainerWidth() + 'px';
            this.ePinnedColsContainer.style.width = pinnedColWidth;
            this.ePinnedFloatingBottom.style.width = pinnedColWidth;
            this.ePinnedFloatingTop.style.width = pinnedColWidth;

            this.eBodyViewportWrapper.style.marginLeft = pinnedColWidth;
        }

        public showPinnedColContainersIfNeeded() {
            // no need to do this if not using scrolls
            if (this.forPrint) {
                return;
            }

            var showingPinnedCols = this.columnModel.isPinning();

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

        public onBodyHeightChange(): void {
            this.sizeHeaderAndBody();
        }

        private sizeHeaderAndBody(): void {
            if (this.forPrint) {
                this.sizeHeaderAndBodyForPrint();
            } else {
                this.sizeHeaderAndBodyNormal();
            }
        }

        private sizeHeaderAndBodyNormal(): void {
            var heightOfContainer = this.layout.getCentreHeight();
            if (!heightOfContainer) {
                return;
            }

            var headerHeight = this.gridOptionsWrapper.getHeaderHeight();
            this.eHeader.style['height'] = headerHeight + 'px';

            var floatingTopCount = 0;
            if (this.gridOptionsWrapper.getFloatingTopRowData()) {
                floatingTopCount = this.gridOptionsWrapper.getFloatingTopRowData().length;
            }
            var floatingBottomCount = 0;
            if (this.gridOptionsWrapper.getFloatingBottomRowData()) {
                floatingBottomCount = this.gridOptionsWrapper.getFloatingBottomRowData().length;
            }

            var rowHeight = this.gridOptionsWrapper.getRowHeight();

            // padding top covers the header and the floating rows on top
            var floatingTopHeight = floatingTopCount * rowHeight;
            var paddingTop = headerHeight + floatingTopHeight;
            // bottom is just the bottom floating rows
            var floatingBottomHeight = floatingBottomCount * rowHeight;
            var floatingBottomTop = heightOfContainer - floatingBottomHeight;

            var heightOfCentreRows = heightOfContainer - headerHeight - floatingBottomHeight - floatingTopHeight;

            this.eBody.style.paddingTop = paddingTop + 'px';
            this.eBody.style.paddingBottom = floatingBottomHeight + 'px';

            this.eFloatingTop.style.top = headerHeight + 'px';
            this.eFloatingTop.style.height = floatingTopHeight + 'px';
            this.eFloatingBottom.style.height = floatingBottomHeight + 'px';
            this.eFloatingBottom.style.top = floatingBottomTop + 'px';

            this.ePinnedColsViewport.style.height = heightOfCentreRows + 'px';
        }

        private sizeHeaderAndBodyForPrint(): void {
            var headerHeightPixels = this.gridOptionsWrapper.getHeaderHeight() + 'px';
            this.eHeaderContainer.style['height'] = headerHeightPixels;
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

            this.eBodyViewport.addEventListener('scroll', () => {
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

            this.ePinnedColsViewport.addEventListener('scroll', () => {
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
                useScrollLag = _.isBrowserIE() || _.isBrowserSafari();
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
            // this.eHeaderContainer.style.transform = 'translate3d(' + -bodyLeftPosition + 'px,0,0)';
            this.eHeaderContainer.style.left = -bodyLeftPosition + 'px';
            this.eFloatingBottomContainer.style.left = -bodyLeftPosition + 'px';
            this.eFloatingTopContainer.style.left = -bodyLeftPosition + 'px';
        }

        private scrollPinned(bodyTopPosition: any) {
            // this.ePinnedColsContainer.style.transform = 'translate3d(0,' + -bodyTopPosition + 'px,0)';
            this.ePinnedColsContainer.style.top = -bodyTopPosition + 'px';
        }
    }
}

