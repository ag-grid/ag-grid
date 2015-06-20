var gridHtml = require('./grid.html');
var gridNoScrollsHtml = require('./gridNoScrolls.html');
var loadingHtml = require('./loading.html');
var BorderLayout = require('../layout/borderLayout');
var utils = require('../utils');

function GridPanel(gridOptionsWrapper) {
    this.gridOptionsWrapper = gridOptionsWrapper;
    // makes code below more readable if we pull 'forPrint' out
    this.forPrint = this.gridOptionsWrapper.isDontUseScrolls();
    this.setupComponents();
    this.scrollWidth = utils.getScrollbarWidth();
}

GridPanel.prototype.setupComponents = function() {

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
};

GridPanel.prototype.ensureIndexVisible = function(index) {
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
};

GridPanel.prototype.ensureColIndexVisible = function(index) {
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
    for (var i = pinnedColCount; i<index; i++) {
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
};

GridPanel.prototype.showLoading = function(loading) {
    this.layout.setOverlayVisible(loading);
};

GridPanel.prototype.getWidthForSizeColsToFit = function() {
    var availableWidth = this.eBody.clientWidth;
    var scrollShowing = this.eBodyViewport.clientHeight < this.eBodyViewport.scrollHeight;
    if (scrollShowing) {
        availableWidth -= this.scrollWidth;
    }
    return availableWidth;
};

GridPanel.prototype.init = function(columnModel, rowRenderer) {
    this.columnModel = columnModel;
    this.rowRenderer = rowRenderer;
};

GridPanel.prototype.setRowModel = function(rowModel) {
    this.rowModel = rowModel;
};

GridPanel.prototype.getBodyContainer = function() { return this.eBodyContainer; };

GridPanel.prototype.getBodyViewport = function() { return this.eBodyViewport; };

GridPanel.prototype.getPinnedColsContainer = function() { return this.ePinnedColsContainer; };

GridPanel.prototype.getHeaderContainer = function() { return this.eHeaderContainer; };

GridPanel.prototype.getRoot = function() { return this.eRoot; };

GridPanel.prototype.getPinnedHeader = function() { return this.ePinnedHeader; };

GridPanel.prototype.getHeader = function() { return this.eHeader; };

GridPanel.prototype.getRowsParent = function() { return this.eParentOfRows; };

GridPanel.prototype.findElements = function() {
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
};

GridPanel.prototype.setBodyContainerWidth = function() {
    var mainRowWidth = this.columnModel.getBodyContainerWidth() + "px";
    this.eBodyContainer.style.width = mainRowWidth;
};

GridPanel.prototype.setPinnedColContainerWidth = function() {
    var pinnedColWidth = this.columnModel.getPinnedContainerWidth() + "px";
    this.ePinnedColsContainer.style.width = pinnedColWidth;
    this.eBodyViewportWrapper.style.marginLeft = pinnedColWidth;
};

GridPanel.prototype.showPinnedColContainersIfNeeded = function() {
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
};

GridPanel.prototype.setHeaderHeight = function() {
    var headerHeight = this.gridOptionsWrapper.getHeaderHeight();
    var headerHeightPixels = headerHeight + 'px';
    if (this.forPrint) {
        this.eHeaderContainer.style['height'] = headerHeightPixels;
    } else {
        this.eHeader.style['height'] = headerHeightPixels;
        this.eBody.style['paddingTop'] = headerHeightPixels;
    }
};

// see if a grey box is needed at the bottom of the pinned col
GridPanel.prototype.setPinnedColHeight = function() {
    if (!this.forPrint) {
        var bodyHeight = this.eBodyViewport.offsetHeight;
        this.ePinnedColsViewport.style.height = bodyHeight + "px";
    }
};

GridPanel.prototype.addScrollListener = function() {
    // if printing, then no scrolling, so no point in listening for scroll events
    if (this.forPrint) {
        return;
    }

    var that = this;
    var lastLeftPosition = -1;
    var lastTopPosition = -1;

    this.eBodyViewport.addEventListener("scroll", function() {
        var newLeftPosition = that.eBodyViewport.scrollLeft;
        var newTopPosition = that.eBodyViewport.scrollTop;

        if (newLeftPosition !== lastLeftPosition) {
            lastLeftPosition = newLeftPosition;
            that.scrollHeader(newLeftPosition);
        }

        if (newTopPosition !== lastTopPosition) {
            lastTopPosition = newTopPosition;
            that.scrollPinned(newTopPosition);
            that.rowRenderer.drawVirtualRows();
        }
    });

    this.ePinnedColsViewport.addEventListener("scroll", function() {
        // this means the pinned panel was moved, which can only
        // happen when the user is navigating in the pinned container
        // as the pinned col should never scroll. so we rollback
        // the scroll on the pinned.
        that.ePinnedColsViewport.scrollTop = 0;
    });

};

GridPanel.prototype.scrollHeader = function(bodyLeftPosition) {
    // this.eHeaderContainer.style.transform = 'translate3d(' + -bodyLeftPosition + "px,0,0)";
    this.eHeaderContainer.style.left = -bodyLeftPosition + "px";
};

GridPanel.prototype.scrollPinned = function(bodyTopPosition) {
    // this.ePinnedColsContainer.style.transform = 'translate3d(0,' + -bodyTopPosition + "px,0)";
    this.ePinnedColsContainer.style.top = -bodyTopPosition + "px";
};

module.exports = GridPanel;