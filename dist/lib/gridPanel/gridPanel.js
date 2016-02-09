/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var borderLayout_1 = require("../layout/borderLayout");
// in the html below, it is important that there are no white space between some of the divs, as if there is white space,
// it won't render correctly in safari, as safari renders white space as a gap
var gridHtml = '<div>' +
    // header
    '<div class="ag-header">' +
    '<div class="ag-pinned-left-header"></div>' +
    '<div class="ag-pinned-right-header"></div>' +
    '<div class="ag-header-viewport">' +
    '<div class="ag-header-container"></div>' +
    '</div>' +
    '<div class="ag-header-overlay"></div>' +
    '</div>' +
    // floating top
    '<div class="ag-floating-top">' +
    '<div class="ag-pinned-left-floating-top"></div>' +
    '<div class="ag-pinned-right-floating-top"></div>' +
    '<div class="ag-floating-top-viewport">' +
    '<div class="ag-floating-top-container"></div>' +
    '</div>' +
    '</div>' +
    // floating bottom
    '<div class="ag-floating-bottom">' +
    '<div class="ag-pinned-left-floating-bottom"></div>' +
    '<div class="ag-pinned-right-floating-bottom"></div>' +
    '<div class="ag-floating-bottom-viewport">' +
    '<div class="ag-floating-bottom-container"></div>' +
    '</div>' +
    '</div>' +
    // body
    '<div class="ag-body">' +
    '<div class="ag-pinned-left-cols-viewport">' +
    '<div class="ag-pinned-left-cols-container"></div>' +
    '</div>' +
    '<div class="ag-pinned-right-cols-viewport">' +
    '<div class="ag-pinned-right-cols-container"></div>' +
    '</div>' +
    '<div class="ag-body-viewport-wrapper">' +
    '<div class="ag-body-viewport">' +
    '<div class="ag-body-container"></div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';
var gridForPrintHtml = '<div>' +
    // header
    '<div class="ag-header-container"></div>' +
    // floating
    '<div class="ag-floating-top-container"></div>' +
    // body
    '<div class="ag-body-container"></div>' +
    // floating bottom
    '<div class="ag-floating-bottom-container"></div>' +
    '</div>';
// wrapping in outer div, and wrapper, is needed to center the loading icon
// The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/
var mainOverlayTemplate = '<div class="ag-overlay-panel">' +
    '<div class="ag-overlay-wrapper ag-overlay-[OVERLAY_NAME]-wrapper">[OVERLAY_TEMPLATE]</div>' +
    '</div>';
var defaultLoadingOverlayTemplate = '<span class="ag-overlay-loading-center">[LOADING...]</span>';
var defaultNoRowsOverlayTemplate = '<span class="ag-overlay-no-rows-center">[NO_ROWS_TO_SHOW]</span>';
var GridPanel = (function () {
    function GridPanel() {
        this.scrollLagCounter = 0;
        this.lastLeftPosition = -1;
        this.lastTopPosition = -1;
    }
    GridPanel.prototype.init = function (gridOptionsWrapper, columnController, rowRenderer, masterSlaveService, loggerFactory, floatingRowModel) {
        this.gridOptionsWrapper = gridOptionsWrapper;
        // makes code below more readable if we pull 'forPrint' out
        this.forPrint = this.gridOptionsWrapper.isForPrint();
        this.setupComponents();
        this.scrollWidth = utils_1.default.getScrollbarWidth();
        this.columnController = columnController;
        this.rowRenderer = rowRenderer;
        this.masterSlaveService = masterSlaveService;
        this.floatingRowModel = floatingRowModel;
        this.logger = loggerFactory.create('GridPanel');
    };
    GridPanel.prototype.getLayout = function () {
        return this.layout;
    };
    GridPanel.prototype.setupComponents = function () {
        if (this.forPrint) {
            this.eRoot = utils_1.default.loadTemplate(gridForPrintHtml);
            utils_1.default.addCssClass(this.eRoot, 'ag-root ag-no-scrolls');
        }
        else {
            this.eRoot = utils_1.default.loadTemplate(gridHtml);
            utils_1.default.addCssClass(this.eRoot, 'ag-root ag-scrolls');
        }
        this.findElements();
        this.layout = new borderLayout_1.default({
            overlays: {
                loading: utils_1.default.loadTemplate(this.createLoadingOverlayTemplate()),
                noRows: utils_1.default.loadTemplate(this.createNoRowsOverlayTemplate())
            },
            center: this.eRoot,
            dontFill: this.forPrint,
            name: 'eGridPanel'
        });
        this.layout.addSizeChangeListener(this.onBodyHeightChange.bind(this));
        this.addScrollListener();
        if (this.gridOptionsWrapper.isSuppressHorizontalScroll()) {
            this.eBodyViewport.style.overflowX = 'hidden';
        }
    };
    GridPanel.prototype.setMovingCss = function (moving) {
        utils_1.default.addOrRemoveCssClass(this.eRoot, 'ag-column-moving', moving);
    };
    GridPanel.prototype.getPinnedLeftFloatingTop = function () {
        return this.ePinnedLeftFloatingTop;
    };
    GridPanel.prototype.getPinnedRightFloatingTop = function () {
        return this.ePinnedRightFloatingTop;
    };
    GridPanel.prototype.getFloatingTopContainer = function () {
        return this.eFloatingTopContainer;
    };
    GridPanel.prototype.getPinnedLeftFloatingBottom = function () {
        return this.ePinnedLeftFloatingBottom;
    };
    GridPanel.prototype.getPinnedRightFloatingBottom = function () {
        return this.ePinnedRightFloatingBottom;
    };
    GridPanel.prototype.getFloatingBottomContainer = function () {
        return this.eFloatingBottomContainer;
    };
    GridPanel.prototype.createOverlayTemplate = function (name, defaultTemplate, userProvidedTemplate) {
        var template = mainOverlayTemplate
            .replace('[OVERLAY_NAME]', name);
        if (userProvidedTemplate) {
            template = template.replace('[OVERLAY_TEMPLATE]', userProvidedTemplate);
        }
        else {
            template = template.replace('[OVERLAY_TEMPLATE]', defaultTemplate);
        }
        return template;
    };
    GridPanel.prototype.createLoadingOverlayTemplate = function () {
        var userProvidedTemplate = this.gridOptionsWrapper.getOverlayLoadingTemplate();
        var templateNotLocalised = this.createOverlayTemplate('loading', defaultLoadingOverlayTemplate, userProvidedTemplate);
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var templateLocalised = templateNotLocalised.replace('[LOADING...]', localeTextFunc('loadingOoo', 'Loading...'));
        return templateLocalised;
    };
    GridPanel.prototype.createNoRowsOverlayTemplate = function () {
        var userProvidedTemplate = this.gridOptionsWrapper.getOverlayNoRowsTemplate();
        var templateNotLocalised = this.createOverlayTemplate('no-rows', defaultNoRowsOverlayTemplate, userProvidedTemplate);
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var templateLocalised = templateNotLocalised.replace('[NO_ROWS_TO_SHOW]', localeTextFunc('noRowsToShow', 'No Rows To Show'));
        return templateLocalised;
    };
    GridPanel.prototype.ensureIndexVisible = function (index) {
        this.logger.log('ensureIndexVisible: ' + index);
        var lastRow = this.rowModel.getVirtualRowCount();
        if (typeof index !== 'number' || index < 0 || index >= lastRow) {
            console.warn('invalid row index for ensureIndexVisible: ' + index);
            return;
        }
        var nodeAtIndex = this.rowModel.getVirtualRow(index);
        var rowTopPixel = nodeAtIndex.rowTop;
        var rowBottomPixel = rowTopPixel + nodeAtIndex.rowHeight;
        var viewportTopPixel = this.eBodyViewport.scrollTop;
        var viewportHeight = this.eBodyViewport.offsetHeight;
        var scrollShowing = this.isHorizontalScrollShowing();
        if (scrollShowing) {
            viewportHeight -= this.scrollWidth;
        }
        var viewportBottomPixel = viewportTopPixel + viewportHeight;
        var viewportScrolledPastRow = viewportTopPixel > rowTopPixel;
        var viewportScrolledBeforeRow = viewportBottomPixel < rowBottomPixel;
        var eViewportToScroll = this.columnController.isPinningRight() ? this.ePinnedRightColsViewport : this.eBodyViewport;
        if (viewportScrolledPastRow) {
            // if row is before, scroll up with row at top
            eViewportToScroll.scrollTop = rowTopPixel;
        }
        else if (viewportScrolledBeforeRow) {
            // if row is below, scroll down with row at bottom
            var newScrollPosition = rowBottomPixel - viewportHeight;
            eViewportToScroll.scrollTop = newScrollPosition;
        }
        // otherwise, row is already in view, so do nothing
    };
    // + moveColumnController
    GridPanel.prototype.getCenterWidth = function () {
        return this.eBodyViewport.clientWidth;
    };
    GridPanel.prototype.isHorizontalScrollShowing = function () {
        var result = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
        return result;
    };
    GridPanel.prototype.isVerticalScrollShowing = function () {
        if (this.columnController.isPinningRight()) {
            // if pinning right, then the scroll bar can show, however for some reason
            // it overlays the grid and doesn't take space.
            return false;
        }
        else {
            return this.eBodyViewport.clientHeight < this.eBodyViewport.scrollHeight;
        }
    };
    // gets called every 500 ms. we use this to set padding on right pinned column
    GridPanel.prototype.periodicallyCheck = function () {
        if (this.columnController.isPinningRight()) {
            var bodyHorizontalScrollShowing = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
            if (bodyHorizontalScrollShowing) {
                this.ePinnedRightColsContainer.style.marginBottom = this.scrollWidth + 'px';
            }
            else {
                this.ePinnedRightColsContainer.style.marginBottom = '';
            }
        }
    };
    GridPanel.prototype.ensureColumnVisible = function (key) {
        var column = this.columnController.getColumn(key);
        if (column.isPinned()) {
            console.warn('calling ensureIndexVisible on a ' + column.getPinned() + ' pinned column doesn\'t make sense for column ' + column.getColId());
            return;
        }
        if (!this.columnController.isColumnDisplayed(column)) {
            console.warn('column is not currently visible');
            return;
        }
        var colLeftPixel = column.getLeft();
        var colRightPixel = colLeftPixel + column.getActualWidth();
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
        }
        else if (viewportScrolledBeforeCol) {
            // if viewport's right side is before col's right side, scroll left to pull col into viewport at right
            var newScrollPosition = colRightPixel - viewportWidth;
            this.eBodyViewport.scrollLeft = newScrollPosition;
        }
        // otherwise, col is already in view, so do nothing
    };
    GridPanel.prototype.showLoadingOverlay = function () {
        if (!this.gridOptionsWrapper.isSuppressLoadingOverlay()) {
            this.layout.showOverlay('loading');
        }
    };
    GridPanel.prototype.showNoRowsOverlay = function () {
        if (!this.gridOptionsWrapper.isSuppressNoRowsOverlay()) {
            this.layout.showOverlay('noRows');
        }
    };
    GridPanel.prototype.hideOverlay = function () {
        this.layout.hideOverlay();
    };
    GridPanel.prototype.getWidthForSizeColsToFit = function () {
        var availableWidth = this.eBody.clientWidth;
        var scrollShowing = this.isVerticalScrollShowing();
        if (scrollShowing) {
            availableWidth -= this.scrollWidth;
        }
        return availableWidth;
    };
    // method will call itself if no available width. this covers if the grid
    // isn't visible, but is just about to be visible.
    GridPanel.prototype.sizeColumnsToFit = function (nextTimeout) {
        var _this = this;
        var availableWidth = this.getWidthForSizeColsToFit();
        if (availableWidth > 0) {
            this.columnController.sizeColumnsToFit(availableWidth);
        }
        else {
            if (nextTimeout === undefined) {
                setTimeout(function () {
                    _this.sizeColumnsToFit(100);
                }, 0);
            }
            else if (nextTimeout === 100) {
                setTimeout(function () {
                    _this.sizeColumnsToFit(-1);
                }, 100);
            }
            else {
                console.log('ag-Grid: tried to call sizeColumnsToFit() but the grid is coming back with ' +
                    'zero width, maybe the grid is not visible yet on the screen?');
            }
        }
    };
    GridPanel.prototype.setRowModel = function (rowModel) {
        this.rowModel = rowModel;
    };
    GridPanel.prototype.getBodyContainer = function () {
        return this.eBodyContainer;
    };
    GridPanel.prototype.getBodyViewport = function () {
        return this.eBodyViewport;
    };
    GridPanel.prototype.getPinnedLeftColsContainer = function () {
        return this.ePinnedLeftColsContainer;
    };
    GridPanel.prototype.getPinnedRightColsContainer = function () {
        return this.ePinnedRightColsContainer;
    };
    GridPanel.prototype.getHeaderContainer = function () {
        return this.eHeaderContainer;
    };
    GridPanel.prototype.getHeaderOverlay = function () {
        return this.eHeaderOverlay;
    };
    GridPanel.prototype.getRoot = function () {
        return this.eRoot;
    };
    GridPanel.prototype.getPinnedLeftHeader = function () {
        return this.ePinnedLeftHeader;
    };
    GridPanel.prototype.getPinnedRightHeader = function () {
        return this.ePinnedRightHeader;
    };
    GridPanel.prototype.getRowsParent = function () {
        return this.eParentsOfRows;
    };
    GridPanel.prototype.queryHtmlElement = function (selector) {
        return this.eRoot.querySelector(selector);
    };
    GridPanel.prototype.findElements = function () {
        if (this.forPrint) {
            this.eHeaderContainer = this.queryHtmlElement('.ag-header-container');
            this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
            this.eFloatingTopContainer = this.queryHtmlElement('.ag-floating-top-container');
            this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');
            this.eParentsOfRows = [this.eBodyContainer, this.eFloatingTopContainer, this.eFloatingBottomContainer];
        }
        else {
            this.eBody = this.queryHtmlElement('.ag-body');
            this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
            this.eBodyViewport = this.queryHtmlElement('.ag-body-viewport');
            this.eBodyViewportWrapper = this.queryHtmlElement('.ag-body-viewport-wrapper');
            this.ePinnedLeftColsContainer = this.queryHtmlElement('.ag-pinned-left-cols-container');
            this.ePinnedRightColsContainer = this.queryHtmlElement('.ag-pinned-right-cols-container');
            this.ePinnedLeftColsViewport = this.queryHtmlElement('.ag-pinned-left-cols-viewport');
            this.ePinnedRightColsViewport = this.queryHtmlElement('.ag-pinned-right-cols-viewport');
            this.ePinnedLeftHeader = this.queryHtmlElement('.ag-pinned-left-header');
            this.ePinnedRightHeader = this.queryHtmlElement('.ag-pinned-right-header');
            this.eHeader = this.queryHtmlElement('.ag-header');
            this.eHeaderContainer = this.queryHtmlElement('.ag-header-container');
            this.eHeaderOverlay = this.queryHtmlElement('.ag-header-overlay');
            this.eHeaderViewport = this.queryHtmlElement('.ag-header-viewport');
            this.eFloatingTop = this.queryHtmlElement('.ag-floating-top');
            this.ePinnedLeftFloatingTop = this.queryHtmlElement('.ag-pinned-left-floating-top');
            this.ePinnedRightFloatingTop = this.queryHtmlElement('.ag-pinned-right-floating-top');
            this.eFloatingTopContainer = this.queryHtmlElement('.ag-floating-top-container');
            this.eFloatingBottom = this.queryHtmlElement('.ag-floating-bottom');
            this.ePinnedLeftFloatingBottom = this.queryHtmlElement('.ag-pinned-left-floating-bottom');
            this.ePinnedRightFloatingBottom = this.queryHtmlElement('.ag-pinned-right-floating-bottom');
            this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');
            // for scrolls, all rows live in eBody (containing pinned and normal body)
            this.eParentsOfRows = [this.eBody, this.eFloatingTop, this.eFloatingBottom];
            // IE9, Chrome, Safari, Opera
            this.ePinnedLeftColsViewport.addEventListener('mousewheel', this.pinnedLeftMouseWheelListener.bind(this));
            this.eBodyViewport.addEventListener('mousewheel', this.centerMouseWheelListener.bind(this));
            // Firefox
            this.ePinnedLeftColsViewport.addEventListener('DOMMouseScroll', this.pinnedLeftMouseWheelListener.bind(this));
            this.eBodyViewport.addEventListener('DOMMouseScroll', this.centerMouseWheelListener.bind(this));
        }
    };
    GridPanel.prototype.getHeaderViewport = function () {
        return this.eHeaderViewport;
    };
    GridPanel.prototype.centerMouseWheelListener = function (event) {
        // we are only interested in mimicking the mouse wheel if we are pinning on the right,
        // as if we are not pinning on the right, then we have scrollbars in the center body, and
        // as such we just use the default browser wheel behaviour.
        if (this.columnController.isPinningRight()) {
            return this.generalMouseWheelListener(event, this.ePinnedRightColsViewport);
        }
    };
    GridPanel.prototype.pinnedLeftMouseWheelListener = function (event) {
        var targetPanel;
        if (this.columnController.isPinningRight()) {
            targetPanel = this.ePinnedRightColsViewport;
        }
        else {
            targetPanel = this.eBodyViewport;
        }
        return this.generalMouseWheelListener(event, targetPanel);
    };
    GridPanel.prototype.generalMouseWheelListener = function (event, targetPanel) {
        var delta;
        if (event.deltaY && event.deltaX != 0) {
            // tested on chrome
            delta = event.deltaY;
        }
        else if (event.wheelDelta && event.wheelDelta != 0) {
            // tested on IE
            delta = -event.wheelDelta;
        }
        else if (event.detail && event.detail != 0) {
            // tested on Firefox. Firefox appears to be slower, 20px rather than the 100px in Chrome and IE
            delta = event.detail * 20;
        }
        else {
            // couldn't find delta
            return;
        }
        var newTopPosition = this.eBodyViewport.scrollTop + delta;
        targetPanel.scrollTop = newTopPosition;
        // if we don't prevent default, then the whole browser will scroll also as well as the grid
        event.preventDefault();
        return false;
    };
    GridPanel.prototype.setBodyContainerWidth = function () {
        var mainRowWidth = this.columnController.getBodyContainerWidth() + 'px';
        this.eBodyContainer.style.width = mainRowWidth;
        if (!this.forPrint) {
            this.eFloatingBottomContainer.style.width = mainRowWidth;
            this.eFloatingTopContainer.style.width = mainRowWidth;
        }
    };
    GridPanel.prototype.setPinnedColContainerWidth = function () {
        if (this.forPrint) {
            // pinned col doesn't exist when doing forPrint
            return;
        }
        var pinnedLeftWidth = this.columnController.getPinnedLeftContainerWidth() + 'px';
        this.ePinnedLeftColsContainer.style.width = pinnedLeftWidth;
        this.ePinnedLeftFloatingBottom.style.width = pinnedLeftWidth;
        this.ePinnedLeftFloatingTop.style.width = pinnedLeftWidth;
        this.eBodyViewportWrapper.style.marginLeft = pinnedLeftWidth;
        var pinnedRightWidth = this.columnController.getPinnedRightContainerWidth() + 'px';
        this.ePinnedRightColsContainer.style.width = pinnedRightWidth;
        this.ePinnedRightFloatingBottom.style.width = pinnedRightWidth;
        this.ePinnedRightFloatingTop.style.width = pinnedRightWidth;
        this.eBodyViewportWrapper.style.marginRight = pinnedRightWidth;
    };
    GridPanel.prototype.showPinnedColContainersIfNeeded = function () {
        // no need to do this if not using scrolls
        if (this.forPrint) {
            return;
        }
        //some browsers had layout issues with the blank divs, so if blank,
        //we don't display them
        if (this.columnController.isPinningLeft()) {
            this.ePinnedLeftHeader.style.display = 'inline-block';
            this.ePinnedLeftColsViewport.style.display = 'inline';
        }
        else {
            this.ePinnedLeftHeader.style.display = 'none';
            this.ePinnedLeftColsViewport.style.display = 'none';
        }
        if (this.columnController.isPinningRight()) {
            this.ePinnedRightHeader.style.display = 'inline-block';
            this.ePinnedRightColsViewport.style.display = 'inline';
            this.eBodyViewport.style.overflowY = 'hidden';
        }
        else {
            this.ePinnedRightHeader.style.display = 'none';
            this.ePinnedRightColsViewport.style.display = 'none';
            this.eBodyViewport.style.overflowY = 'auto';
        }
    };
    GridPanel.prototype.onBodyHeightChange = function () {
        this.sizeHeaderAndBody();
    };
    GridPanel.prototype.sizeHeaderAndBody = function () {
        if (this.forPrint) {
            // if doing 'for print', then the header and footers are laid
            // out naturally by the browser. it whatever size that's needed to fit.
            return;
        }
        var heightOfContainer = this.layout.getCentreHeight();
        if (!heightOfContainer) {
            return;
        }
        var headerHeight = this.gridOptionsWrapper.getHeaderHeight();
        var numberOfRowsInHeader = this.columnController.getHeaderRowCount();
        var totalHeaderHeight = headerHeight * numberOfRowsInHeader;
        this.eHeader.style['height'] = totalHeaderHeight + 'px';
        // padding top covers the header and the floating rows on top
        var floatingTopHeight = this.floatingRowModel.getFloatingTopTotalHeight();
        var paddingTop = totalHeaderHeight + floatingTopHeight;
        // bottom is just the bottom floating rows
        var floatingBottomHeight = this.floatingRowModel.getFloatingBottomTotalHeight();
        var floatingBottomTop = heightOfContainer - floatingBottomHeight;
        var heightOfCentreRows = heightOfContainer - totalHeaderHeight - floatingBottomHeight - floatingTopHeight;
        this.eBody.style.paddingTop = paddingTop + 'px';
        this.eBody.style.paddingBottom = floatingBottomHeight + 'px';
        this.eFloatingTop.style.top = totalHeaderHeight + 'px';
        this.eFloatingTop.style.height = floatingTopHeight + 'px';
        this.eFloatingBottom.style.height = floatingBottomHeight + 'px';
        this.eFloatingBottom.style.top = floatingBottomTop + 'px';
        this.ePinnedLeftColsViewport.style.height = heightOfCentreRows + 'px';
        this.ePinnedRightColsViewport.style.height = heightOfCentreRows + 'px';
    };
    GridPanel.prototype.setHorizontalScrollPosition = function (hScrollPosition) {
        this.eBodyViewport.scrollLeft = hScrollPosition;
    };
    // tries to scroll by pixels, but returns what the result actually was
    GridPanel.prototype.scrollHorizontally = function (pixels) {
        var oldScrollPosition = this.eBodyViewport.scrollLeft;
        this.setHorizontalScrollPosition(oldScrollPosition + pixels);
        var newScrollPosition = this.eBodyViewport.scrollLeft;
        return newScrollPosition - oldScrollPosition;
    };
    GridPanel.prototype.getHorizontalScrollPosition = function () {
        return this.eBodyViewport.scrollLeft;
    };
    GridPanel.prototype.addScrollListener = function () {
        var _this = this;
        // if printing, then no scrolling, so no point in listening for scroll events
        if (this.forPrint) {
            return;
        }
        this.eBodyViewport.addEventListener('scroll', function () {
            // we are always interested in horizontal scrolls of the body
            var newLeftPosition = _this.eBodyViewport.scrollLeft;
            if (newLeftPosition !== _this.lastLeftPosition) {
                _this.lastLeftPosition = newLeftPosition;
                _this.horizontallyScrollHeaderCenterAndFloatingCenter(newLeftPosition);
                _this.masterSlaveService.fireHorizontalScrollEvent(newLeftPosition);
            }
            // if we are pinning to the right, then it's the right pinned container
            // that has the scroll.
            if (!_this.columnController.isPinningRight()) {
                var newTopPosition = _this.eBodyViewport.scrollTop;
                if (newTopPosition !== _this.lastTopPosition) {
                    _this.lastTopPosition = newTopPosition;
                    _this.verticallyScrollLeftPinned(newTopPosition);
                    _this.requestDrawVirtualRows();
                }
            }
        });
        this.ePinnedRightColsViewport.addEventListener('scroll', function () {
            var newTopPosition = _this.ePinnedRightColsViewport.scrollTop;
            if (newTopPosition !== _this.lastTopPosition) {
                _this.lastTopPosition = newTopPosition;
                _this.verticallyScrollLeftPinned(newTopPosition);
                _this.verticallyScrollBody(newTopPosition);
                _this.requestDrawVirtualRows();
            }
        });
        // this means the pinned panel was moved, which can only
        // happen when the user is navigating in the pinned container
        // as the pinned col should never scroll. so we rollback
        // the scroll on the pinned.
        this.ePinnedLeftColsViewport.addEventListener('scroll', function () {
            _this.ePinnedLeftColsViewport.scrollTop = 0;
        });
    };
    GridPanel.prototype.requestDrawVirtualRows = function () {
        var _this = this;
        // if we are in IE or Safari, then we only redraw if there was no scroll event
        // in the 50ms following this scroll event. without this, these browsers have
        // a bad scrolling feel, where the redraws clog the scroll experience
        // (makes the scroll clunky and sticky). this method is like throttling
        // the scroll events.
        var useScrollLag;
        // let the user override scroll lag option
        if (this.gridOptionsWrapper.isSuppressScrollLag()) {
            useScrollLag = false;
        }
        else if (this.gridOptionsWrapper.getIsScrollLag()) {
            useScrollLag = this.gridOptionsWrapper.getIsScrollLag()();
        }
        else {
            useScrollLag = utils_1.default.isBrowserIE() || utils_1.default.isBrowserSafari();
        }
        if (useScrollLag) {
            this.scrollLagCounter++;
            var scrollLagCounterCopy = this.scrollLagCounter;
            setTimeout(function () {
                if (_this.scrollLagCounter === scrollLagCounterCopy) {
                    _this.rowRenderer.drawVirtualRows();
                }
            }, 50);
        }
        else {
            this.rowRenderer.drawVirtualRows();
        }
    };
    GridPanel.prototype.horizontallyScrollHeaderCenterAndFloatingCenter = function (bodyLeftPosition) {
        // this.eHeaderContainer.style.transform = 'translate3d(' + -bodyLeftPosition + 'px,0,0)';
        this.eHeaderContainer.style.left = -bodyLeftPosition + 'px';
        this.eFloatingBottomContainer.style.left = -bodyLeftPosition + 'px';
        this.eFloatingTopContainer.style.left = -bodyLeftPosition + 'px';
    };
    GridPanel.prototype.verticallyScrollLeftPinned = function (bodyTopPosition) {
        // this.ePinnedColsContainer.style.transform = 'translate3d(0,' + -bodyTopPosition + 'px,0)';
        this.ePinnedLeftColsContainer.style.top = -bodyTopPosition + 'px';
    };
    GridPanel.prototype.verticallyScrollBody = function (position) {
        this.eBodyViewport.scrollTop = position;
    };
    return GridPanel;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GridPanel;
