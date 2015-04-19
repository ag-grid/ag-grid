(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Angular Grid
// Written by Niall Crosby
// www.angulargrid.com


(function() {

    // Establish the root object, `window` or `exports`
    var root = this;
    var Grid = require('./grid');

    // if angular is present, register the directive
    if (typeof angular !== 'undefined') {
        var angularModule = angular.module("angularGrid", []);
        angularModule.directive("angularGrid", function() {
            return {
                restrict: "A",
                controller: ['$element', '$scope', '$compile', AngularDirectiveController],
                scope: {
                    angularGrid: "="
                }
            };
        });
    }

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = angularGridGlobalFunction;
        }
        exports.angularGrid = angularGridGlobalFunction;
    } else {
        root.angularGrid = angularGridGlobalFunction;
    }


    function AngularDirectiveController($element, $scope, $compile) {
        var eGridDiv = $element[0];
        var gridOptions = $scope.angularGrid;
        if (!gridOptions) {
            console.warn("WARNING - grid options for Angular Grid not found. Please ensure the attribute angular-grid points to a valid object on the scope");
            return;
        }
        var grid = new Grid(eGridDiv, gridOptions, $scope, $compile);

        $scope.$on("$destroy", function() {
            grid.setFinished();
        });
    }

    // Global Function - this function is used for creating a grid, outside of any AngularJS
    function angularGridGlobalFunction(element, gridOptions) {
        // see if element is a query selector, or a real element
        var eGridDiv;
        if (typeof element === 'string') {
            eGridDiv = document.querySelector(element);
            if (!eGridDiv) {
                console.log('WARNING - was not able to find element ' + element + ' in the DOM, Angular Grid initialisation aborted.');
                return;
            }
        } else {
            eGridDiv = element;
        }
        new Grid(eGridDiv, gridOptions, null, null);
    }

}).call(this);

},{"./grid":12}],2:[function(require,module,exports){
var constants = require('./constants');

function ColumnController() {
    this.createModel();
}

ColumnController.prototype.init = function(angularGrid, selectionRendererFactory, gridOptionsWrapper) {
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.angularGrid = angularGrid;
    this.selectionRendererFactory = selectionRendererFactory;
};

ColumnController.prototype.createModel = function() {
    var that = this;
    this.model = {
        // used by:
        // + inMemoryRowController -> sorting, building quick filter text
        // + headerRenderer -> sorting (clearing icon)
        getAllColumns: function() {
            return that.columns;
        },
        // + rowController -> while inserting rows, and when tabbing through cells (need to change this)
        // need a newMethod - get next col index
        getVisibleColumns: function() {
            return that.visibleColumns;
        },
        // used by:
        // + angularGrid -> for setting body width
        // + rowController -> setting main row widths (when inserting and resizing)
        getBodyContainerWidth: function() {
            return that.getTotalColWidth(false);
        },
        // used by:
        // + angularGrid -> setting pinned body width
        getPinnedContainerWidth: function() {
            return that.getTotalColWidth(true);
        },
        // used by:
        // + headerRenderer -> setting pinned body width
        getColumnGroups: function() {
            return that.columnGroups;
        }
    };
};

ColumnController.prototype.getModel = function() {
    return this.model;
};

// called by angularGrid
ColumnController.prototype.setColumns = function(columnDefs) {
    this.buildColumns(columnDefs);
    this.ensureEachColHasSize();
    this.buildGroups();
    this.updateGroups();
    this.updateVisibleColumns();
};

// called by headerRenderer - when a header is opened or closed
ColumnController.prototype.columnGroupOpened = function(group) {
    group.expanded = !group.expanded;
    this.updateGroups();
    this.updateVisibleColumns();
    this.angularGrid.refreshHeaderAndBody();
};

// private
ColumnController.prototype.updateVisibleColumns = function() {
    // if not grouping by headers, then all columns are visible
    if (!this.gridOptionsWrapper.isGroupHeaders()) {
        this.visibleColumns = this.columns;
        return;
    }

    // if grouping, then only show col as per group rules
    this.visibleColumns = [];
    for (var i = 0; i < this.columnGroups.length; i++) {
        var group = this.columnGroups[i];
        group.addToVisibleColumns(this.visibleColumns);
    }
};

// public - called from api
ColumnController.prototype.sizeColumnsToFit = function(availableWidth) {
    // avoid divide by zero
    if (availableWidth <= 0 || this.visibleColumns.length === 0) {
        return;
    }

    var currentTotalWidth = this.getTotalColWidth();
    var scale = availableWidth / currentTotalWidth;

    // size all cols except the last by the scale
    for (var i = 0; i < (this.visibleColumns.length - 1); i++) {
        var column = this.visibleColumns[i];
        var newWidth = parseInt(column.actualWidth * scale);
        column.actualWidth = newWidth;
    }

    // size the last by whats remaining (this avoids rounding errors that could
    // occur with scaling everything, where it result in some pixels off)
    var pixelsLeftForLastCol = availableWidth - this.getTotalColWidth();
    var lastColumn = this.visibleColumns[this.visibleColumns.length - 1];
    lastColumn.actualWidth += pixelsLeftForLastCol;

    // widths set, refresh the gui
    this.angularGrid.refreshHeaderAndBody();
};

// private
ColumnController.prototype.buildGroups = function() {
    // if not grouping by headers, do nothing
    if (!this.gridOptionsWrapper.isGroupHeaders()) {
        this.columnGroups = null;
        return;
    }

    // split the columns into groups
    var currentGroup = null;
    this.columnGroups = [];
    var that = this;

    var lastColWasPinned = true;

    this.columns.forEach(function(column) {
        // do we need a new group, because we move from pinned to non-pinned columns?
        var endOfPinnedHeader = lastColWasPinned && !column.pinned;
        if (!column.pinned) {
            lastColWasPinned = false;
        }
        // do we need a new group, because the group names doesn't match from previous col?
        var groupKeyMismatch = currentGroup && column.colDef.group !== currentGroup.name;
        // we don't group columns where no group is specified
        var colNotInGroup = currentGroup && !currentGroup.name;
        // do we need a new group, because we are just starting
        var processingFirstCol = column.index === 0;
        var newGroupNeeded = processingFirstCol || endOfPinnedHeader || groupKeyMismatch || colNotInGroup;
        // create new group, if it's needed
        if (newGroupNeeded) {
            var pinned = column.pinned;
            currentGroup = new ColumnGroup(pinned, column.colDef.group);
            that.columnGroups.push(currentGroup);
        }
        currentGroup.addColumn(column);
    });
};

// private
ColumnController.prototype.updateGroups = function() {
    // if not grouping by headers, do nothing
    if (!this.gridOptionsWrapper.isGroupHeaders()) {
        return;
    }

    for (var i = 0; i < this.columnGroups.length; i++) {
        var group = this.columnGroups[i];
        group.calculateExpandable();
        group.calculateVisibleColumns();
    }
};

// private
ColumnController.prototype.buildColumns = function(columnDefs) {
    this.columns = [];
    var that = this;
    var pinnedColumnCount = this.gridOptionsWrapper.getPinnedColCount();
    if (columnDefs) {
        for (var i = 0; i < columnDefs.length; i++) {
            var colDef = columnDefs[i];
            // this is messy - we swap in another col def if it's checkbox selection - not happy :(
            if (colDef === 'checkboxSelection') {
                colDef = that.selectionRendererFactory.createCheckboxColDef();
            }
            var pinned = pinnedColumnCount > i;
            var column = new Column(colDef, i, pinned);
            that.columns.push(column);
        }
    }
};

// private
// set the actual widths for each col
ColumnController.prototype.ensureEachColHasSize = function() {
    this.columns.forEach(function(colDefWrapper) {
        var colDef = colDefWrapper.colDef;
        if (colDefWrapper.actualWidth) {
            // if actual width already set, do nothing
            return;
        } else if (!colDef.width) {
            // if no width defined in colDef, default to 200
            colDefWrapper.actualWidth = 200;
        } else if (colDef.width < constants.MIN_COL_WIDTH) {
            // if width in col def to small, set to min width
            colDefWrapper.actualWidth = constants.MIN_COL_WIDTH;
        } else {
            // otherwise use the provided width
            colDefWrapper.actualWidth = colDef.width;
        }
    });
};

// private
// call with true (pinned), false (not-pinned) or undefined (all columns)
ColumnController.prototype.getTotalColWidth = function(includePinned) {
    var widthSoFar = 0;
    var pinedNotImportant = typeof includePinned !== 'boolean';

    this.visibleColumns.forEach(function(column) {
        var includeThisCol = pinedNotImportant || column.pinned === includePinned;
        if (includeThisCol) {
            widthSoFar += column.actualWidth;
        }
    });

    return widthSoFar;
};

function ColumnGroup(pinned, name) {
    this.pinned = pinned;
    this.name = name;
    this.allColumns = [];
    this.visibleColumns = [];
    this.expandable = false; // whether this group can be expanded or not
    this.expanded = false;
}

ColumnGroup.prototype.addColumn = function(column) {
    this.allColumns.push(column);
};

// need to check that this group has at least one col showing when both expanded and contracted.
// if not, then we don't allow expanding and contracting on this group
ColumnGroup.prototype.calculateExpandable = function() {
    // want to make sure the group doesn't disappear when it's open
    var atLeastOneShowingWhenOpen = false;
    // want to make sure the group doesn't disappear when it's closed
    var atLeastOneShowingWhenClosed = false;
    // want to make sure the group has something to show / hide
    var atLeastOneChangeable = false;
    for (var i = 0, j = this.allColumns.length; i < j; i++) {
        var column = this.allColumns[i];
        if (column.colDef.groupShow === 'open') {
            atLeastOneShowingWhenOpen = true;
            atLeastOneChangeable = true;
        } else if (column.colDef.groupShow === 'closed') {
            atLeastOneShowingWhenClosed = true;
            atLeastOneChangeable = true;
        } else {
            atLeastOneShowingWhenOpen = true;
            atLeastOneShowingWhenClosed = true;
        }
    }

    this.expandable = atLeastOneShowingWhenOpen && atLeastOneShowingWhenClosed && atLeastOneChangeable;
};

ColumnGroup.prototype.calculateVisibleColumns = function() {
    // clear out last time we calculated
    this.visibleColumns = [];
    // it not expandable, everything is visible
    if (!this.expandable) {
        this.visibleColumns = this.allColumns;
        return;
    }
    // and calculate again
    for (var i = 0, j = this.allColumns.length; i < j; i++) {
        var column = this.allColumns[i];
        switch (column.colDef.groupShow) {
            case 'open':
                // when set to open, only show col if group is open
                if (this.expanded) {
                    this.visibleColumns.push(column);
                }
                break;
            case 'closed':
                // when set to open, only show col if group is open
                if (!this.expanded) {
                    this.visibleColumns.push(column);
                }
                break;
            default:
                // default is always show the column
                this.visibleColumns.push(column);
                break;
        }
    }
};

ColumnGroup.prototype.addToVisibleColumns = function(allVisibleColumns) {
    for (var i = 0; i < this.visibleColumns.length; i++) {
        var column = this.visibleColumns[i];
        allVisibleColumns.push(column);
    }
};

function Column(colDef, index, pinned) {
    this.colDef = colDef;
    this.index = index;
    this.pinned = pinned;
    // in the future, the colKey might be something other than the index
    this.colKey = index;
}

module.exports = ColumnController;

},{"./constants":3}],3:[function(require,module,exports){
var constants = {
    STEP_EVERYTHING: 0,
    STEP_FILTER: 1,
    STEP_SORT: 2,
    STEP_MAP: 3,
    ASC: "asc",
    DESC: "desc",
    ROW_BUFFER_SIZE: 5,
    SORT_STYLE_SHOW: "display:inline;",
    SORT_STYLE_HIDE: "display:none;",
    MIN_COL_WIDTH: 10,
};

module.exports = constants;

},{}],4:[function(require,module,exports){
var utils = require('./../utils');
var SetFilter = require('./setFilter');
var NumberFilter = require('./numberFilter');
var StringFilter = require('./textFilter');

function FilterManager() {}

FilterManager.prototype.init = function(grid, gridOptionsWrapper, $compile, $scope) {
    this.$compile = $compile;
    this.$scope = $scope;
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.grid = grid;
    this.allFilters = {};
};

FilterManager.prototype.setRowModel = function(rowModel) {
    this.rowModel = rowModel;
};

// returns true if at least one filter is active
FilterManager.prototype.isFilterPresent = function() {
    var atLeastOneActive = false;
    var that = this;

    var keys = Object.keys(this.allFilters);
    keys.forEach(function(key) {
        var filterWrapper = that.allFilters[key];
        if (!filterWrapper.filter.isFilterActive) { // because users can do custom filters, give nice error message
            console.error('Filter is missing method isFilterActive');
        }
        if (filterWrapper.filter.isFilterActive()) {
            atLeastOneActive = true;
        }
    });
    return atLeastOneActive;
};

// returns true if given col has a filter active
FilterManager.prototype.isFilterPresentForCol = function(colKey) {
    var filterWrapper = this.allFilters[colKey];
    if (!filterWrapper) {
        return false;
    }
    if (!filterWrapper.filter.isFilterActive) { // because users can do custom filters, give nice error message
        console.error('Filter is missing method isFilterActive');
    }
    var filterPresent = filterWrapper.filter.isFilterActive();
    return filterPresent;
};

FilterManager.prototype.doesFilterPass = function(node) {
    var data = node.data;
    var colKeys = Object.keys(this.allFilters);
    for (var i = 0, l = colKeys.length; i < l; i++) { // critical code, don't use functional programming

        var colKey = colKeys[i];
        var filterWrapper = this.allFilters[colKey];

        // if no filter, always pass
        if (filterWrapper === undefined) {
            continue;
        }

        var value = data[filterWrapper.field];
        if (!filterWrapper.filter.doesFilterPass) { // because users can do custom filters, give nice error message
            console.error('Filter is missing method doesFilterPass');
        }
        var model;
        // if model is exposed, grab it
        if (filterWrapper.filter.getModel) {
            model = filterWrapper.filter.getModel();
        }
        var params = {
            value: value,
            model: model,
            node: node,
            data: data
        };
        if (!filterWrapper.filter.doesFilterPass(params)) {
            return false;
        }
    }
    // all filters passed
    return true;
};

FilterManager.prototype.onNewRowsLoaded = function() {
    var that = this;
    Object.keys(this.allFilters).forEach(function(field) {
        var filter = that.allFilters[field].filter;
        if (filter.onNewRowsLoaded) {
            filter.onNewRowsLoaded();
        }
    });
};

FilterManager.prototype.positionPopup = function(eventSource, ePopup, ePopupRoot) {
    var sourceRect = eventSource.getBoundingClientRect();
    var parentRect = ePopupRoot.getBoundingClientRect();

    var x = sourceRect.left - parentRect.left;
    var y = sourceRect.top - parentRect.top + sourceRect.height;

    // if popup is overflowing to the right, move it left
    var widthOfPopup = 200; // this is set in the css
    var widthOfParent = parentRect.right - parentRect.left;
    var maxX = widthOfParent - widthOfPopup - 20; // 20 pixels grace
    if (x > maxX) { // move position left, back into view
        x = maxX;
    }
    if (x < 0) { // in case the popup has a negative value
        x = 0;
    }

    ePopup.style.left = x + "px";
    ePopup.style.top = y + "px";
};

FilterManager.prototype.showFilter = function(colDefWrapper, eventSource) {

    var filterWrapper = this.allFilters[colDefWrapper.colKey];
    var colDef = colDefWrapper.colDef;

    if (!filterWrapper) {
        filterWrapper = {
            colKey: colDefWrapper.colKey,
            field: colDef.field
        };
        var filterChangedCallback = this.grid.onFilterChanged.bind(this.grid);
        var filterParams = colDef.filterParams;
        var params = {
            colDef: colDef,
            rowModel: this.rowModel,
            filterChangedCallback: filterChangedCallback,
            filterParams: filterParams,
            scope: filterWrapper.scope
        };
        if (typeof colDef.filter === 'function') {
            // if user provided a filter, just use it
            // first up, create child scope if needed
            if (this.gridOptionsWrapper.isAngularCompileFilters()) {
                var scope = this.$scope.$new();
                filterWrapper.scope = scope;
                params.$scope = scope;
            }
            // now create filter
            filterWrapper.filter = new colDef.filter(params);
        } else if (colDef.filter === 'text') {
            filterWrapper.filter = new StringFilter(params);
        } else if (colDef.filter === 'number') {
            filterWrapper.filter = new NumberFilter(params);
        } else {
            filterWrapper.filter = new SetFilter(params);
        }
        this.allFilters[colDefWrapper.colKey] = filterWrapper;

        if (!filterWrapper.filter.getGui) { // because users can do custom filters, give nice error message
            console.error('Filter is missing method getGui');
        }

        var eFilterGui = document.createElement('div');
        eFilterGui.className = 'ag-filter';
        var guiFromFilter = filterWrapper.filter.getGui();
        if (utils.isNode(guiFromFilter) || utils.isElement(guiFromFilter)) {
            //a dom node or element was returned, so add child
            eFilterGui.appendChild(guiFromFilter);
        } else {
            //otherwise assume it was html, so just insert
            var eTextSpan = document.createElement('span');
            eTextSpan.innerHTML = guiFromFilter;
            eFilterGui.appendChild(eTextSpan);
        }

        if (filterWrapper.scope) {
            filterWrapper.gui = this.$compile(eFilterGui)(filterWrapper.scope)[0];
        } else {
            filterWrapper.gui = eFilterGui;
        }

    }

    var ePopupParent = this.grid.getPopupParent();
    this.positionPopup(eventSource, filterWrapper.gui, ePopupParent);

    utils.addAsModalPopup(ePopupParent, filterWrapper.gui);

    if (filterWrapper.filter.afterGuiAttached) {
        filterWrapper.filter.afterGuiAttached();
    }
};

module.exports = FilterManager;

},{"./../utils":24,"./numberFilter":5,"./setFilter":7,"./textFilter":10}],5:[function(require,module,exports){
var utils = require('./../utils');
var template = require('./numberFilterTemplate.js');

var EQUALS = 1;
var LESS_THAN = 2;
var GREATER_THAN = 3;

function NumberFilter(params) {
    this.filterChangedCallback = params.filterChangedCallback;
    this.createGui();
    this.filterNumber = null;
    this.filterType = EQUALS;
}

/* public */
NumberFilter.prototype.afterGuiAttached = function() {
    this.eFilterTextField.focus();
};

/* public */
NumberFilter.prototype.doesFilterPass = function(node) {
    if (this.filterNumber === null) {
        return true;
    }
    var value = node.value;

    if (!value && value !== 0) {
        return false;
    }

    var valueAsNumber;
    if (typeof value === 'number') {
        valueAsNumber = value;
    } else {
        valueAsNumber = parseFloat(value);
    }

    switch (this.filterType) {
        case EQUALS:
            return valueAsNumber === this.filterNumber;
        case LESS_THAN:
            return valueAsNumber <= this.filterNumber;
        case GREATER_THAN:
            return valueAsNumber >= this.filterNumber;
        default:
            // should never happen
            console.log('invalid filter type ' + this.filterType);
            return false;
    }
};

/* public */
NumberFilter.prototype.getGui = function() {
    return this.eGui;
};

/* public */
NumberFilter.prototype.isFilterActive = function() {
    return this.filterNumber !== null;
};

NumberFilter.prototype.createGui = function() {
    this.eGui = utils.loadTemplate(template);
    this.eFilterTextField = this.eGui.querySelector("#filterText");
    this.eTypeSelect = this.eGui.querySelector("#filterType");

    utils.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
    this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));
};

NumberFilter.prototype.onTypeChanged = function() {
    this.filterType = parseInt(this.eTypeSelect.value);
    this.filterChangedCallback();
};

NumberFilter.prototype.onFilterChanged = function() {
    var filterText = utils.makeNull(this.eFilterTextField.value);
    if (filterText && filterText.trim() === '') {
        filterText = null;
    }
    if (filterText) {
        this.filterNumber = parseFloat(filterText);
    } else {
        this.filterNumber = null;
    }
    this.filterChangedCallback();
};

module.exports = NumberFilter;

},{"./../utils":24,"./numberFilterTemplate.js":6}],6:[function(require,module,exports){
var template = [
    '<div>',
    '<div>',
    '<select class="ag-filter-select" id="filterType">',
    '<option value="1">Equals</option>',
    '<option value="2">Less than</option>',
    '<option value="3">Greater than</option>',
    '</select>',
    '</div>',
    '<div>',
    '<input class="ag-filter-filter" id="filterText" type="text" placeholder="filter..."/>',
    '</div>',
    '</div>',
].join('');

module.exports = template;

},{}],7:[function(require,module,exports){
var utils = require('./../utils');
var SetFilterModel = require('./setFilterModel');
var template = require('./setFilterTemplate');

var DEFAULT_ROW_HEIGHT = 20;

function SetFilter(params) {
    var filterParams = params.filterParams;
    this.rowHeight = (filterParams && filterParams.cellHeight) ? filterParams.cellHeight : DEFAULT_ROW_HEIGHT;
    this.model = new SetFilterModel(params.colDef, params.rowModel);
    this.filterChangedCallback = params.filterChangedCallback;
    this.rowsInBodyContainer = {};
    this.colDef = params.colDef;
    if (filterParams) {
        this.cellRenderer = filterParams.cellRenderer;
    }
    this.createGui();
    this.addScrollListener();
}

// we need to have the gui attached before we can draw the virtual rows, as the
// virtual row logic needs info about the gui state
/* public */
SetFilter.prototype.afterGuiAttached = function() {
    this.drawVirtualRows();
};

/* public */
SetFilter.prototype.isFilterActive = function() {
    return this.model.isFilterActive();
};

/* public */
SetFilter.prototype.doesFilterPass = function(node) {
    var value = node.value;
    var model = node.model;
    //if no filter, always pass
    if (model.isEverythingSelected()) {
        return true;
    }
    //if nothing selected in filter, always fail
    if (model.isNothingSelected()) {
        return false;
    }

    value = utils.makeNull(value);
    var filterPassed = model.selectedValuesMap[value] !== undefined;
    return filterPassed;
};

/* public */
SetFilter.prototype.getGui = function() {
    return this.eGui;
};

/* public */
SetFilter.prototype.onNewRowsLoaded = function() {
    this.model.selectEverything();
    this.updateAllCheckboxes(true);
};

/* public */
SetFilter.prototype.getModel = function() {
    return this.model;
};

SetFilter.prototype.createGui = function() {
    var _this = this;

    this.eGui = utils.loadTemplate(template);

    this.eListContainer = this.eGui.querySelector(".ag-filter-list-container");
    this.eFilterValueTemplate = this.eGui.querySelector("#itemForRepeat");
    this.eSelectAll = this.eGui.querySelector("#selectAll");
    this.eListViewport = this.eGui.querySelector(".ag-filter-list-viewport");
    this.eMiniFilter = this.eGui.querySelector(".ag-filter-filter");
    this.eListContainer.style.height = (this.model.getUniqueValueCount() * this.rowHeight) + "px";

    this.setContainerHeight();
    this.eMiniFilter.value = this.model.getMiniFilter();
    utils.addChangeListener(this.eMiniFilter, function() {
        _this.onFilterChanged();
    });
    utils.removeAllChildren(this.eListContainer);

    this.eSelectAll.onclick = this.onSelectAll.bind(this);

    if (this.model.isEverythingSelected()) {
        this.eSelectAll.indeterminate = false;
        this.eSelectAll.checked = true;
    } else if (this.model.isNothingSelected()) {
        this.eSelectAll.indeterminate = false;
        this.eSelectAll.checked = false;
    } else {
        this.eSelectAll.indeterminate = true;
    }
};

SetFilter.prototype.setContainerHeight = function() {
    this.eListContainer.style.height = (this.model.getDisplayedValueCount() * this.rowHeight) + "px";
};

SetFilter.prototype.drawVirtualRows = function() {
    var topPixel = this.eListViewport.scrollTop;
    var bottomPixel = topPixel + this.eListViewport.offsetHeight;

    var firstRow = Math.floor(topPixel / this.rowHeight);
    var lastRow = Math.floor(bottomPixel / this.rowHeight);

    this.ensureRowsRendered(firstRow, lastRow);
};

SetFilter.prototype.ensureRowsRendered = function(start, finish) {
    var _this = this;

    //at the end, this array will contain the items we need to remove
    var rowsToRemove = Object.keys(this.rowsInBodyContainer);

    //add in new rows
    for (var rowIndex = start; rowIndex <= finish; rowIndex++) {
        //see if item already there, and if yes, take it out of the 'to remove' array
        if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
            rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
            continue;
        }
        //check this row actually exists (in case overflow buffer window exceeds real data)
        if (this.model.getDisplayedValueCount() > rowIndex) {
            var value = this.model.getDisplayedValue(rowIndex);
            _this.insertRow(value, rowIndex);
        }
    }

    //at this point, everything in our 'rowsToRemove' . . .
    this.removeVirtualRows(rowsToRemove);
};

//takes array of row id's
SetFilter.prototype.removeVirtualRows = function(rowsToRemove) {
    var _this = this;
    rowsToRemove.forEach(function(indexToRemove) {
        var eRowToRemove = _this.rowsInBodyContainer[indexToRemove];
        _this.eListContainer.removeChild(eRowToRemove);
        delete _this.rowsInBodyContainer[indexToRemove];
    });
};

SetFilter.prototype.insertRow = function(value, rowIndex) {
    var _this = this;

    var eFilterValue = this.eFilterValueTemplate.cloneNode(true);

    var valueElement = eFilterValue.querySelector(".ag-filter-value");
    if (this.cellRenderer) {
        //renderer provided, so use it
        var resultFromRenderer = this.cellRenderer({
            value: value
        });

        if (utils.isNode(resultFromRenderer) || utils.isElement(resultFromRenderer)) {
            //a dom node or element was returned, so add child
            valueElement.appendChild(resultFromRenderer);
        } else {
            //otherwise assume it was html, so just insert
            valueElement.innerHTML = resultFromRenderer;
        }

    } else {
        //otherwise display as a string
        var displayNameOfValue = value === null ? "(Blanks)" : value;
        valueElement.innerHTML = displayNameOfValue;
    }
    var eCheckbox = eFilterValue.querySelector("input");
    eCheckbox.checked = this.model.isValueSelected(value);

    eCheckbox.onclick = function() {
        _this.onCheckboxClicked(eCheckbox, value);
    }

    eFilterValue.style.top = (this.rowHeight * rowIndex) + "px";

    this.eListContainer.appendChild(eFilterValue);
    this.rowsInBodyContainer[rowIndex] = eFilterValue;
};

SetFilter.prototype.onCheckboxClicked = function(eCheckbox, value) {
    var checked = eCheckbox.checked;
    if (checked) {
        this.model.selectValue(value);
        if (this.model.isEverythingSelected()) {
            this.eSelectAll.indeterminate = false;
            this.eSelectAll.checked = true;
        } else {
            this.eSelectAll.indeterminate = true;
        }
    } else {
        this.model.unselectValue(value);
        //if set is empty, nothing is selected
        if (this.model.isNothingSelected()) {
            this.eSelectAll.indeterminate = false;
            this.eSelectAll.checked = false;
        } else {
            this.eSelectAll.indeterminate = true;
        }
    }

    this.filterChangedCallback();
};

SetFilter.prototype.onFilterChanged = function() {
    var miniFilterChanged = this.model.setMiniFilter(this.eMiniFilter.value);
    if (miniFilterChanged) {
        this.setContainerHeight();
        this.clearVirtualRows();
        this.drawVirtualRows();
    }
};

SetFilter.prototype.clearVirtualRows = function() {
    var rowsToRemove = Object.keys(this.rowsInBodyContainer);
    this.removeVirtualRows(rowsToRemove);
};

SetFilter.prototype.onSelectAll = function() {
    var checked = this.eSelectAll.checked;
    if (checked) {
        this.model.selectEverything();
    } else {
        this.model.selectNothing();
    }
    this.updateAllCheckboxes(checked);
    this.filterChangedCallback();
};

SetFilter.prototype.updateAllCheckboxes = function(checked) {
    var currentlyDisplayedCheckboxes = this.eListContainer.querySelectorAll("[filter-checkbox=true]");
    for (var i = 0, l = currentlyDisplayedCheckboxes.length; i < l; i++) {
        currentlyDisplayedCheckboxes[i].checked = checked;
    }
};

SetFilter.prototype.addScrollListener = function() {
    var _this = this;

    this.eListViewport.addEventListener("scroll", function() {
        _this.drawVirtualRows();
    });
};

module.exports = SetFilter;

},{"./../utils":24,"./setFilterModel":8,"./setFilterTemplate":9}],8:[function(require,module,exports){
    var utils = require('../utils');

    function SetFilterModel(colDef, rowModel) {

        if (colDef.filterParams && colDef.filterParams.values) {
            this.uniqueValues = colDef.filterParams.values;
        } else {
            this.createUniqueValues(rowModel, colDef.field);
        }

        if (colDef.comparator) {
            this.uniqueValues.sort(colDef.comparator);
        } else {
            this.uniqueValues.sort(utils.defaultComparator);
        }

        this.displayedValues = this.uniqueValues;
        this.miniFilter = null;
        //we use a map rather than an array for the selected values as the lookup
        //for a map is much faster than the lookup for an array, especially when
        //the length of the array is thousands of records long
        this.selectedValuesMap = {};
        this.selectEverything();
    }

    SetFilterModel.prototype.createUniqueValues = function(rowModel, key) {
        var uniqueCheck = {};
        var result = [];
        for (var i = 0, l = rowModel.getVirtualRowCount(); i < l; i++) {
            var data = rowModel.getVirtualRow(i).data;
            var value = data ? data[key] : null;
            if (value === "" || value === undefined) {
                value = null;
            }
            if (!uniqueCheck.hasOwnProperty(value)) {
                result.push(value);
                uniqueCheck[value] = 1;
            }
        }
        this.uniqueValues = result;
    };

    //sets mini filter. returns true if it changed from last value, otherwise false
    SetFilterModel.prototype.setMiniFilter = function(newMiniFilter) {
        newMiniFilter = utils.makeNull(newMiniFilter);
        if (this.miniFilter === newMiniFilter) {
            //do nothing if filter has not changed
            return false;
        }
        this.miniFilter = newMiniFilter;
        this.filterDisplayedValues();
        return true;
    };

    SetFilterModel.prototype.getMiniFilter = function() {
        return this.miniFilter;
    };

    SetFilterModel.prototype.filterDisplayedValues = function() {
        // if no filter, just use the unique values
        if (this.miniFilter === null) {
            this.displayedValues = this.uniqueValues;
            return;
        }

        // if filter present, we filter down the list
        this.displayedValues = [];
        var miniFilterUpperCase = this.miniFilter.toUpperCase();
        for (var i = 0, l = this.uniqueValues.length; i < l; i++) {
            var uniqueValue = this.uniqueValues[i];
            if (uniqueValue !== null && uniqueValue.toString().toUpperCase().indexOf(miniFilterUpperCase) >= 0) {
                this.displayedValues.push(uniqueValue);
            }
        }

    };

    SetFilterModel.prototype.getDisplayedValueCount = function() {
        return this.displayedValues.length;
    };

    SetFilterModel.prototype.getDisplayedValue = function(index) {
        return this.displayedValues[index];
    };

    SetFilterModel.prototype.selectEverything = function() {
        var count = this.uniqueValues.length;
        for (var i = 0; i < count; i++) {
            var value = this.uniqueValues[i];
            this.selectedValuesMap[value] = null;
        }
        this.selectedValuesCount = count;
    };

    SetFilterModel.prototype.isFilterActive = function() {
        return this.uniqueValues.length !== this.selectedValuesCount;
    };

    SetFilterModel.prototype.selectNothing = function() {
        this.selectedValuesMap = {};
        this.selectedValuesCount = 0;
    };

    SetFilterModel.prototype.getUniqueValueCount = function() {
        return this.uniqueValues.length;
    };

    SetFilterModel.prototype.unselectValue = function(value) {
        if (this.selectedValuesMap[value] !== undefined) {
            delete this.selectedValuesMap[value];
            this.selectedValuesCount--;
        }
    };

    SetFilterModel.prototype.selectValue = function(value) {
        if (this.selectedValuesMap[value] === undefined) {
            this.selectedValuesMap[value] = null;
            this.selectedValuesCount++;
        }
    };

    SetFilterModel.prototype.isValueSelected = function(value) {
        return this.selectedValuesMap[value] !== undefined;
    };

    SetFilterModel.prototype.isEverythingSelected = function() {
        return this.uniqueValues.length === this.selectedValuesCount;
    };

    SetFilterModel.prototype.isNothingSelected = function() {
        return this.uniqueValues.length === 0;
    };

    module.exports = SetFilterModel;

},{"../utils":24}],9:[function(require,module,exports){
var template = [
    '<div>',
    '    <div class="ag-filter-header-container">',
    '        <input class="ag-filter-filter" type="text" placeholder="search..."/>',
    '    </div>',
    '    <div class="ag-filter-header-container">',
    '        <label>',
    '            <input id="selectAll" type="checkbox" class="ag-filter-checkbox"/>',
    '            (Select All)',
    '        </label>',
    '    </div>',
    '    <div class="ag-filter-list-viewport">',
    '        <div class="ag-filter-list-container">',
    '            <div id="itemForRepeat" class="ag-filter-item">',
    '                <label>',
    '                    <input type="checkbox" class="ag-filter-checkbox" filter-checkbox="true"/>',
    '                    <span class="ag-filter-value"></span>',
    '                </label>',
    '            </div>',
    '        </div>',
    '    </div>',
    '</div>',
].join('');

module.exports = template;

},{}],10:[function(require,module,exports){
var utils = require('../utils');
var template = require('./textFilterTemplate');

var CONTAINS = 1;
var EQUALS = 2;
var STARTS_WITH = 3;
var ENDS_WITH = 4;

function TextFilter(params) {
    this.filterChangedCallback = params.filterChangedCallback;
    this.createGui();
    this.filterText = null;
    this.filterType = CONTAINS;
}

/* public */
TextFilter.prototype.afterGuiAttached = function() {
    this.eFilterTextField.focus();
};

/* public */
TextFilter.prototype.doesFilterPass = function(node) {
    if (!this.filterText) {
        return true;
    }
    var value = node.value;
    if (!value) {
        return false;
    }
    var valueLowerCase = value.toString().toLowerCase();
    switch (this.filterType) {
        case CONTAINS:
            return valueLowerCase.indexOf(this.filterText) >= 0;
        case EQUALS:
            return valueLowerCase === this.filterText;
        case STARTS_WITH:
            return valueLowerCase.indexOf(this.filterText) === 0;
        case ENDS_WITH:
            var index = valueLowerCase.indexOf(this.filterText);
            return index >= 0 && index === (valueLowerCase.length - this.filterText.length);
        default:
            // should never happen
            console.log('invalid filter type ' + this.filterType);
            return false;
    }
};

/* public */
TextFilter.prototype.getGui = function() {
    return this.eGui;
};

/* public */
TextFilter.prototype.isFilterActive = function() {
    return this.filterText !== null;
};

TextFilter.prototype.createGui = function() {
    this.eGui = utils.loadTemplate(template);
    this.eFilterTextField = this.eGui.querySelector("#filterText");
    this.eTypeSelect = this.eGui.querySelector("#filterType");

    utils.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
    this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));
};

TextFilter.prototype.onTypeChanged = function() {
    this.filterType = parseInt(this.eTypeSelect.value);
    this.filterChangedCallback();
};

TextFilter.prototype.onFilterChanged = function() {
    var filterText = utils.makeNull(this.eFilterTextField.value);
    if (filterText && filterText.trim() === '') {
        filterText = null;
    }
    if (filterText) {
        this.filterText = filterText.toLowerCase();
    } else {
        this.filterText = null;
    }
    this.filterChangedCallback();
};

module.exports = TextFilter;

},{"../utils":24,"./textFilterTemplate":11}],11:[function(require,module,exports){
var template = [
    '<div>',
    '<div>',
    '<select class="ag-filter-select" id="filterType">',
    '<option value="1">Contains</option>',
    '<option value="2">Equals</option>',
    '<option value="3">Starts with</option>',
    '<option value="4">Ends with</option>',
    '</select>',
    '</div>',
    '<div>',
    '<input class="ag-filter-filter" id="filterText" type="text" placeholder="filter..."/>',
    '</div>',
    '</div>',
].join('');

module.exports = template;

},{}],12:[function(require,module,exports){
var constants = require('./constants');
var GridOptionsWrapper = require('./gridOptionsWrapper');
var template = require('./template.js');
var templateNoScrolls = require('./templateNoScrolls.js');
var SelectionController = require('./selectionController');
var FilterManager = require('./filter/filterManager');
var SelectionRendererFactory = require('./selectionRendererFactory');
var ColumnController = require('./columnController');
var RowRenderer = require('./rowRenderer');
var HeaderRenderer = require('./headerRenderer');
var InMemoryRowController = require('./inMemoryRowController');
var VirtualPageRowController = require('./virtualPageRowController');
var PaginationController = require('./paginationController');

function Grid(eGridDiv, gridOptions, $scope, $compile) {

    this.gridOptions = gridOptions;
    this.gridOptionsWrapper = new GridOptionsWrapper(this.gridOptions);

    var useScrolls = !this.gridOptionsWrapper.isDontUseScrolls();
    if (useScrolls) {
        eGridDiv.innerHTML = template;
    } else {
        eGridDiv.innerHTML = templateNoScrolls;
    }

    var that = this;
    this.quickFilter = null;

    // if using angular, watch for quickFilter changes
    if ($scope) {
        $scope.$watch("angularGrid.quickFilterText", function(newFilter) {
            that.onQuickFilterChanged(newFilter);
        });
    }

    this.virtualRowCallbacks = {};

    this.addApi();
    this.findAllElements(eGridDiv);
    this.createAndWireBeans($scope, $compile, eGridDiv, useScrolls);

    this.inMemoryRowController.setAllRows(this.gridOptionsWrapper.getAllRows());

    if (useScrolls) {
        this.addScrollListener();
        this.setBodySize(); //setting sizes of body (containing viewports), doesn't change container sizes
    }

    // done when cols change
    this.setupColumns();

    // done when rows change
    this.updateModelAndRefresh(constants.STEP_EVERYTHING);

    // flag to mark when the directive is destroyed
    this.finished = false;

    // if no data provided initially, and not doing infinite scrolling, show the loading panel
    var showLoading = !this.gridOptionsWrapper.getAllRows() && !this.gridOptionsWrapper.isVirtualPaging();
    this.showLoadingPanel(showLoading);

    // if datasource provided, use it
    if (this.gridOptionsWrapper.getDatasource()) {
        this.setDatasource();
    }
}

Grid.prototype.createAndWireBeans = function($scope, $compile, eGridDiv, useScrolls) {

    // make local references, to make the below more human readable
    var gridOptionsWrapper = this.gridOptionsWrapper;
    var gridOptions = this.gridOptions;

    // create all the beans
    var selectionController = new SelectionController();
    var filterManager = new FilterManager();
    var selectionRendererFactory = new SelectionRendererFactory();
    var columnController = new ColumnController();
    var rowRenderer = new RowRenderer();
    var headerRenderer = new HeaderRenderer();
    var inMemoryRowController = new InMemoryRowController();
    var virtualPageRowController = new VirtualPageRowController();

    var columnModel = columnController.getModel();

    // initialise all the beans
    selectionController.init(this, this.eParentOfRows, gridOptionsWrapper, $scope, rowRenderer);
    filterManager.init(this, gridOptionsWrapper, $compile, $scope);
    selectionRendererFactory.init(this, selectionController);
    columnController.init(this, selectionRendererFactory, gridOptionsWrapper);
    rowRenderer.init(gridOptions, columnModel, gridOptionsWrapper, eGridDiv, this,
        selectionRendererFactory, $compile, $scope, selectionController);
    headerRenderer.init(gridOptionsWrapper, columnController, columnModel, eGridDiv, this, filterManager, $scope, $compile);
    inMemoryRowController.init(gridOptionsWrapper, columnModel, this, filterManager, $scope);
    virtualPageRowController.init(rowRenderer);

    // this is a child bean, get a reference and pass it on
    // CAN WE DELETE THIS? it's done in the setDatasource section
    var rowModel = inMemoryRowController.getModel();
    selectionController.setRowModel(rowModel);
    filterManager.setRowModel(rowModel);
    rowRenderer.setRowModel(rowModel);

    // and the last bean, done in it's own section, as it's optional
    var paginationController = null;
    if (useScrolls) {
        paginationController = new PaginationController();
        paginationController.init(this.ePagingPanel, this);
    }

    this.rowModel = rowModel;
    this.selectionController = selectionController;
    this.columnController = columnController;
    this.columnModel = columnModel;
    this.inMemoryRowController = inMemoryRowController;
    this.virtualPageRowController = virtualPageRowController;
    this.rowRenderer = rowRenderer;
    this.headerRenderer = headerRenderer;
    this.paginationController = paginationController;
    this.filterManager = filterManager;
};

Grid.prototype.showAndPositionPagingPanel = function() {
    // no paging when no-scrolls
    if (!this.ePagingPanel) {
        return;
    }

    if (this.isShowPagingPanel()) {
        this.ePagingPanel.style['display'] = null;
        var heightOfPager = this.ePagingPanel.offsetHeight;
        this.eBody.style['padding-bottom'] = heightOfPager + 'px';
        var heightOfRoot = this.eRoot.clientHeight;
        var topOfPager = heightOfRoot - heightOfPager;
        this.ePagingPanel.style['top'] = topOfPager + 'px';
    } else {
        this.ePagingPanel.style['display'] = 'none';
        this.eBody.style['padding-bottom'] = null;
    }

};

Grid.prototype.isShowPagingPanel = function() {
    return this.showPagingPanel;
};

Grid.prototype.setDatasource = function(datasource) {
    // if datasource provided, then set it
    if (datasource) {
        this.gridOptions.datasource = datasource;
    }
    // get the set datasource (if null was passed to this method,
    // then need to get the actual datasource from options
    var datasourceToUse = this.gridOptionsWrapper.getDatasource();
    var virtualPaging = this.gridOptionsWrapper.isVirtualPaging() && datasourceToUse;
    var pagination = datasourceToUse && !virtualPaging;

    if (virtualPaging) {
        this.paginationController.setDatasource(null);
        this.virtualPageRowController.setDatasource(datasourceToUse);
        this.rowModel = this.virtualPageRowController.getModel();
        this.showPagingPanel = false;
    } else if (pagination) {
        this.paginationController.setDatasource(datasourceToUse);
        this.virtualPageRowController.setDatasource(null);
        this.rowModel = this.inMemoryRowController.getModel();
        this.showPagingPanel = true;
    } else {
        this.paginationController.setDatasource(null);
        this.virtualPageRowController.setDatasource(null);
        this.rowModel = this.inMemoryRowController.getModel();
        this.showPagingPanel = false;
    }

    this.selectionController.setRowModel(this.rowModel);
    this.filterManager.setRowModel(this.rowModel);
    this.rowRenderer.setRowModel(this.rowModel);

    // we may of just shown or hidden the paging panel, so need
    // to get table to check the body size, which also hides and
    // shows the paging panel.
    this.setBodySize();

    // because we just set the rowModel, need to update the gui
    this.rowRenderer.refreshView();
};

// gets called after columns are shown / hidden from groups expanding
Grid.prototype.refreshHeaderAndBody = function() {
    this.headerRenderer.refreshHeader();
    this.headerRenderer.updateFilterIcons();
    this.setBodyContainerWidth();
    this.setPinnedColContainerWidth();
    this.rowRenderer.refreshView();
};

Grid.prototype.setFinished = function() {
    this.finished = true;
};

Grid.prototype.getPopupParent = function() {
    return this.eRoot;
};

Grid.prototype.getQuickFilter = function() {
    return this.quickFilter;
};

Grid.prototype.onQuickFilterChanged = function(newFilter) {
    if (newFilter === undefined || newFilter === "") {
        newFilter = null;
    }
    if (this.quickFilter !== newFilter) {
        //want 'null' to mean to filter, so remove undefined and empty string
        if (newFilter === undefined || newFilter === "") {
            newFilter = null;
        }
        if (newFilter !== null) {
            newFilter = newFilter.toUpperCase();
        }
        this.quickFilter = newFilter;
        this.onFilterChanged();
    }
};

Grid.prototype.onFilterChanged = function() {
    this.updateModelAndRefresh(constants.STEP_FILTER);
    this.headerRenderer.updateFilterIcons();
};

Grid.prototype.onRowClicked = function(event, rowIndex, node) {

    if (this.gridOptions.rowClicked) {
        var params = {
            node: node,
            data: node.data,
            event: event
        };
        this.gridOptions.rowClicked(params);
    }

    // if no selection method enabled, do nothing
    if (!this.gridOptionsWrapper.isRowSelection()) {
        return;
    }

    // if click selection suppressed, do nothing
    if (this.gridOptionsWrapper.isSuppressRowClickSelection()) {
        return;
    }

    // ctrlKey for windows, metaKey for Apple
    var tryMulti = event.ctrlKey || event.metaKey;
    this.selectionController.selectNode(node, tryMulti);
};

Grid.prototype.setHeaderHeight = function() {
    var headerHeight = this.gridOptionsWrapper.getHeaderHeight();
    var headerHeightPixels = headerHeight + 'px';
    var dontUseScrolls = this.gridOptionsWrapper.isDontUseScrolls();
    if (dontUseScrolls) {
        this.eHeaderContainer.style['height'] = headerHeightPixels;
    } else {
        this.eHeader.style['height'] = headerHeightPixels;
        this.eBody.style['padding-top'] = headerHeightPixels;
        this.eLoadingPanel.style['margin-top'] = headerHeightPixels;
    }
};

Grid.prototype.showLoadingPanel = function(show) {
    if (show) {
        // setting display to null, actually has the impact of setting it
        // to 'table', as this is part of the ag-loading-panel core style
        this.eLoadingPanel.style.display = null;
    } else {
        this.eLoadingPanel.style.display = 'none';
    }
};

Grid.prototype.setupColumns = function() {
    this.setHeaderHeight();
    this.columnController.setColumns(this.gridOptions.columnDefs);
    this.showPinnedColContainersIfNeeded();
    this.headerRenderer.refreshHeader();
    if (!this.gridOptionsWrapper.isDontUseScrolls()) {
        this.setPinnedColContainerWidth();
        this.setBodyContainerWidth();
    }
    this.headerRenderer.updateFilterIcons();
};

Grid.prototype.setBodyContainerWidth = function() {
    var mainRowWidth = this.columnModel.getBodyContainerWidth() + "px";
    this.eBodyContainer.style.width = mainRowWidth;
};

Grid.prototype.updateModelAndRefresh = function(step) {
    this.inMemoryRowController.updateModel(step);
    this.rowRenderer.refreshView();
};

Grid.prototype.setRows = function(rows, firstId) {
    if (rows) {
        this.gridOptions.rowData = rows;
    }
    this.inMemoryRowController.setAllRows(this.gridOptionsWrapper.getAllRows(), firstId);
    this.selectionController.clearSelection();
    this.filterManager.onNewRowsLoaded();
    this.updateModelAndRefresh(constants.STEP_EVERYTHING);
    this.headerRenderer.updateFilterIcons();
    this.showLoadingPanel(false);
};

Grid.prototype.addApi = function() {
    var that = this;
    var api = {
        setDatasource: function(datasource) {
            that.setDatasource(datasource);
        },
        onNewDatasource: function() {
            that.setDatasource();
        },
        setRows: function(rows) {
            that.setRows(rows);
        },
        onNewRows: function() {
            that.setRows();
        },
        onNewCols: function() {
            that.onNewCols();
        },
        unselectAll: function() {
            that.selectionController.clearSelection();
            that.rowRenderer.refreshView();
        },
        refreshView: function() {
            that.rowRenderer.refreshView();
        },
        refreshHeader: function() {
            // need to review this - the refreshHeader should also refresh all icons in the header
            that.headerRenderer.refreshHeader();
            that.headerRenderer.updateFilterIcons();
        },
        getModel: function() {
            return that.rowModel;
        },
        onGroupExpandedOrCollapsed: function() {
            that.updateModelAndRefresh(constants.STEP_MAP);
        },
        expandAll: function() {
            that.inMemoryRowController.expandOrCollapseAll(true, null);
            that.updateModelAndRefresh(constants.STEP_MAP);
        },
        collapseAll: function() {
            that.inMemoryRowController.expandOrCollapseAll(false, null);
            that.updateModelAndRefresh(constants.STEP_MAP);
        },
        addVirtualRowListener: function(rowIndex, callback) {
            that.addVirtualRowListener(rowIndex, callback);
        },
        rowDataChanged: function(rows) {
            that.rowRenderer.rowDataChanged(rows);
        },
        setQuickFilter: function(newFilter) {
            that.onQuickFilterChanged(newFilter)
        },
        selectIndex: function(index, tryMulti, suppressEvents) {
            that.selectionController.selectIndex(index, tryMulti, suppressEvents);
        },
        deselectIndex: function(index) {
            that.selectionController.deselectIndex(index);
        },
        selectNode: function(node, tryMulti, suppressEvents) {
            that.selectionController.selectNode(node, tryMulti, suppressEvents);
        },
        deselectNode: function(node) {
            that.selectionController.deselectNode(node);
        },
        recomputeAggregates: function() {
            that.inMemoryRowController.doAggregate();
            that.rowRenderer.refreshGroupRows();
        },
        sizeColumnsToFit: function() {
            var availableWidth = that.eBody.clientWidth;
            that.columnController.sizeColumnsToFit(availableWidth);
        },
        showLoading: function(show) {
            that.showLoadingPanel(show);
        },
        isNodeSelected: function(node) {
            return that.selectionController.isNodeSelected(node);
        },
        getSelectedNodes: function() {
            return that.selectionController.getSelectedNodes();
        },
        getBestCostNodeSelection: function() {
            return that.selectionController.getBestCostNodeSelection();
        }
    };
    this.gridOptions.api = api;
};

Grid.prototype.addVirtualRowListener = function(rowIndex, callback) {
    if (!this.virtualRowCallbacks[rowIndex]) {
        this.virtualRowCallbacks[rowIndex] = [];
    }
    this.virtualRowCallbacks[rowIndex].push(callback);
};

Grid.prototype.onVirtualRowSelected = function(rowIndex, selected) {
    // inform the callbacks of the event
    if (this.virtualRowCallbacks[rowIndex]) {
        this.virtualRowCallbacks[rowIndex].forEach(function(callback) {
            if (typeof callback.rowRemoved === 'function') {
                callback.rowSelected(selected);
            }
        });
    }
};

Grid.prototype.onVirtualRowRemoved = function(rowIndex) {
    // inform the callbacks of the event
    if (this.virtualRowCallbacks[rowIndex]) {
        this.virtualRowCallbacks[rowIndex].forEach(function(callback) {
            if (typeof callback.rowRemoved === 'function') {
                callback.rowRemoved();
            }
        });
    }
    // remove the callbacks
    delete this.virtualRowCallbacks[rowIndex];
};

Grid.prototype.onNewCols = function() {
    this.setupColumns();
    this.updateModelAndRefresh(constants.STEP_EVERYTHING);
};

Grid.prototype.findAllElements = function(eGridDiv) {
    if (this.gridOptionsWrapper.isDontUseScrolls()) {
        this.eRoot = eGridDiv.querySelector(".ag-root");
        this.eHeaderContainer = eGridDiv.querySelector(".ag-header-container");
        this.eBodyContainer = eGridDiv.querySelector(".ag-body-container");
        this.eLoadingPanel = eGridDiv.querySelector('.ag-loading-panel');
        // for no-scrolls, all rows live in the body container
        this.eParentOfRows = this.eBodyContainer;
    } else {
        this.eRoot = eGridDiv.querySelector(".ag-root");
        this.eBody = eGridDiv.querySelector(".ag-body");
        this.eBodyContainer = eGridDiv.querySelector(".ag-body-container");
        this.eBodyViewport = eGridDiv.querySelector(".ag-body-viewport");
        this.eBodyViewportWrapper = eGridDiv.querySelector(".ag-body-viewport-wrapper");
        this.ePinnedColsContainer = eGridDiv.querySelector(".ag-pinned-cols-container");
        this.ePinnedColsViewport = eGridDiv.querySelector(".ag-pinned-cols-viewport");
        this.ePinnedHeader = eGridDiv.querySelector(".ag-pinned-header");
        this.eHeader = eGridDiv.querySelector(".ag-header");
        this.eHeaderContainer = eGridDiv.querySelector(".ag-header-container");
        this.eLoadingPanel = eGridDiv.querySelector('.ag-loading-panel');
        // for scrolls, all rows live in eBody (containing pinned and normal body)
        this.eParentOfRows = this.eBody;
        this.ePagingPanel = eGridDiv.querySelector('.ag-paging-panel');
    }
};

Grid.prototype.showPinnedColContainersIfNeeded = function() {
    // no need to do this if not using scrolls
    if (this.gridOptionsWrapper.isDontUseScrolls()) {
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

Grid.prototype.updateBodyContainerWidthAfterColResize = function() {
    this.rowRenderer.setMainRowWidths();
    this.setBodyContainerWidth();
};

Grid.prototype.updatePinnedColContainerWidthAfterColResize = function() {
    this.setPinnedColContainerWidth();
};

Grid.prototype.setPinnedColContainerWidth = function() {
    var pinnedColWidth = this.columnModel.getPinnedContainerWidth() + "px";
    this.ePinnedColsContainer.style.width = pinnedColWidth;
    this.eBodyViewportWrapper.style.marginLeft = pinnedColWidth;
};

// see if a grey box is needed at the bottom of the pinned col
Grid.prototype.setPinnedColHeight = function() {
    // var bodyHeight = utils.pixelStringToNumber(this.eBody.style.height);
    var scrollShowing = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
    var bodyHeight = this.eBodyViewport.offsetHeight;
    if (scrollShowing) {
        this.ePinnedColsViewport.style.height = (bodyHeight - 20) + "px";
    } else {
        this.ePinnedColsViewport.style.height = bodyHeight + "px";
    }
    // also the loading overlay, needs to have it's height adjusted
    this.eLoadingPanel.style.height = bodyHeight + 'px';
};

Grid.prototype.setBodySize = function() {
    var _this = this;

    var bodyHeight = this.eBodyViewport.offsetHeight;
    var pagingVisible = this.isShowPagingPanel();

    if (this.bodyHeightLastTime != bodyHeight || this.showPagingPanelVisibleLastTime != pagingVisible) {
        this.bodyHeightLastTime = bodyHeight;
        this.showPagingPanelVisibleLastTime = pagingVisible;

        this.setPinnedColHeight();

        //only draw virtual rows if done sort & filter - this
        //means we don't draw rows if table is not yet initialised
        if (this.rowModel.getVirtualRowCount() > 0) {
            this.rowRenderer.drawVirtualRows();
        }

        // show and position paging panel
        this.showAndPositionPagingPanel();
    }

    if (!this.finished) {
        setTimeout(function() {
            _this.setBodySize();
        }, 200);
    }
};

Grid.prototype.addScrollListener = function() {
    var _this = this;

    this.eBodyViewport.addEventListener("scroll", function() {
        _this.scrollHeaderAndPinned();
        _this.rowRenderer.drawVirtualRows();
    });
};

Grid.prototype.scrollHeaderAndPinned = function() {
    this.eHeaderContainer.style.left = -this.eBodyViewport.scrollLeft + "px";
    this.ePinnedColsContainer.style.top = -this.eBodyViewport.scrollTop + "px";
};

module.exports = Grid;

},{"./columnController":2,"./constants":3,"./filter/filterManager":4,"./gridOptionsWrapper":13,"./headerRenderer":15,"./inMemoryRowController":16,"./paginationController":17,"./rowRenderer":18,"./selectionController":19,"./selectionRendererFactory":20,"./template.js":22,"./templateNoScrolls.js":23,"./virtualPageRowController":25}],13:[function(require,module,exports){
var DEFAULT_ROW_HEIGHT = 30;

function GridOptionsWrapper(gridOptions) {
    this.gridOptions = gridOptions;
    this.setupDefaults();
}

function isTrue(value) {
    return value === true || value === 'true';
}

GridOptionsWrapper.prototype.isRowSelection = function() {
    return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple";
};
GridOptionsWrapper.prototype.isRowSelectionMulti = function() {
    return this.gridOptions.rowSelection === 'multiple';
};
GridOptionsWrapper.prototype.getContext = function() {
    return this.gridOptions.context;
};
GridOptionsWrapper.prototype.isVirtualPaging = function() {
    return isTrue(this.gridOptions.virtualPaging);
};
GridOptionsWrapper.prototype.isRowsAlreadyGrouped = function() {
    return isTrue(this.gridOptions.rowsAlreadyGrouped);
};
GridOptionsWrapper.prototype.isGroupCheckboxSelectionGroup = function() {
    return this.gridOptions.groupCheckboxSelection === 'group';
};
GridOptionsWrapper.prototype.isGroupCheckboxSelectionChildren = function() {
    return this.gridOptions.groupCheckboxSelection === 'children';
};
GridOptionsWrapper.prototype.isGroupIncludeFooter = function() {
    return isTrue(this.gridOptions.groupIncludeFooter);
};
GridOptionsWrapper.prototype.isSuppressRowClickSelection = function() {
    return isTrue(this.gridOptions.suppressRowClickSelection);
};
GridOptionsWrapper.prototype.isGroupHeaders = function() {
    return isTrue(this.gridOptions.groupHeaders);
};
GridOptionsWrapper.prototype.isDontUseScrolls = function() {
    return isTrue(this.gridOptions.dontUseScrolls);
};
GridOptionsWrapper.prototype.getRowStyle = function() {
    return this.gridOptions.rowStyle;
};
GridOptionsWrapper.prototype.getRowClass = function() {
    return this.gridOptions.rowClass;
};
GridOptionsWrapper.prototype.getGridOptions = function() {
    return this.gridOptions;
};
GridOptionsWrapper.prototype.getHeaderCellRenderer = function() {
    return this.gridOptions.headerCellRenderer;
};
GridOptionsWrapper.prototype.isEnableSorting = function() {
    return this.gridOptions.enableSorting;
};
GridOptionsWrapper.prototype.isEnableColResize = function() {
    return this.gridOptions.enableColResize;
};
GridOptionsWrapper.prototype.isEnableFilter = function() {
    return this.gridOptions.enableFilter;
};
GridOptionsWrapper.prototype.getGroupDefaultExpanded = function() {
    return this.gridOptions.groupDefaultExpanded;
};
GridOptionsWrapper.prototype.getGroupKeys = function() {
    return this.gridOptions.groupKeys;
};
GridOptionsWrapper.prototype.getGroupIconRenderer = function() {
    return this.gridOptions.groupIconRenderer;
};
GridOptionsWrapper.prototype.getGroupAggFunction = function() {
    return this.gridOptions.groupAggFunction;
};
GridOptionsWrapper.prototype.getAllRows = function() {
    return this.gridOptions.rowData;
};
GridOptionsWrapper.prototype.isGroupUseEntireRow = function() {
    return isTrue(this.gridOptions.groupUseEntireRow);
};
GridOptionsWrapper.prototype.isAngularCompileRows = function() {
    return isTrue(this.gridOptions.angularCompileRows);
};
GridOptionsWrapper.prototype.isAngularCompileFilters = function() {
    return isTrue(this.gridOptions.angularCompileFilters);
};
GridOptionsWrapper.prototype.isAngularCompileHeaders = function() {
    return isTrue(this.gridOptions.angularCompileHeaders);
};
GridOptionsWrapper.prototype.getColumnDefs = function() {
    return this.gridOptions.columnDefs;
};
GridOptionsWrapper.prototype.getRowHeight = function() {
    return this.gridOptions.rowHeight;
};
GridOptionsWrapper.prototype.getModelUpdated = function() {
    return this.gridOptions.modelUpdated;
};
GridOptionsWrapper.prototype.getCellClicked = function() {
    return this.gridOptions.cellClicked;
};
GridOptionsWrapper.prototype.getCellDoubleClicked = function() {
    return this.gridOptions.cellDoubleClicked;
};
GridOptionsWrapper.prototype.getRowSelected = function() {
    return this.gridOptions.rowSelected;
};
GridOptionsWrapper.prototype.getSelectionChanged = function() {
    return this.gridOptions.selectionChanged;
};
GridOptionsWrapper.prototype.getVirtualRowRemoved = function() {
    return this.gridOptions.virtualRowRemoved;
};
GridOptionsWrapper.prototype.getDatasource = function() {
    return this.gridOptions.datasource;
};

GridOptionsWrapper.prototype.setSelectedRows = function(newSelectedRows) {
    return this.gridOptions.selectedRows = newSelectedRows;
};
GridOptionsWrapper.prototype.setSelectedNodesById = function(newSelectedNodes) {
    return this.gridOptions.selectedNodesById = newSelectedNodes;
};

GridOptionsWrapper.prototype.getIcons = function() {
    return this.gridOptions.icons;
};

GridOptionsWrapper.prototype.isDoInternalGrouping = function() {
    return !this.isRowsAlreadyGrouped() && this.gridOptions.groupKeys;
};

GridOptionsWrapper.prototype.isGroupCheckboxSelection = function() {
    return this.isGroupCheckboxSelectionChildren() || this.isGroupCheckboxSelectionGroup();
};

GridOptionsWrapper.prototype.getHeaderHeight = function() {
    if (typeof this.gridOptions.headerHeight === 'number') {
        // if header height provided, used it
        return this.gridOptions.headerHeight;
    } else {
        // otherwise return 25 if no grouping, 50 if grouping
        if (this.isGroupHeaders()) {
            return 50;
        } else {
            return 25;
        }
    }
};

GridOptionsWrapper.prototype.isColumDefsPresent = function() {
    return this.gridOptions.columnDefs && this.gridOptions.columnDefs.length != 0;
};

GridOptionsWrapper.prototype.setupDefaults = function() {
    if (!this.gridOptions.rowHeight) {
        this.gridOptions.rowHeight = DEFAULT_ROW_HEIGHT;
    }
};

GridOptionsWrapper.prototype.getPinnedColCount = function() {
    // if not using scrolls, then pinned columns doesn't make
    // sense, so always return 0
    if (this.isDontUseScrolls()) {
        return 0;
    }
    if (this.gridOptions.pinnedColumnCount) {
        //in case user puts in a string, cast to number
        return Number(this.gridOptions.pinnedColumnCount);
    } else {
        return 0;
    }
};

module.exports = GridOptionsWrapper;

},{}],14:[function(require,module,exports){
function GroupCreator() {}

GroupCreator.prototype.group = function(rowNodes, groupByFields, groupAggFunction, expandByDefault) {

    var topMostGroup = {
        level: -1,
        children: [],
        childrenMap: {}
    };

    var allGroups = [];
    allGroups.push(topMostGroup);

    var levelToInsertChild = groupByFields.length - 1;
    var i, currentLevel, node, data, currentGroup, groupByField, groupKey, nextGroup;

    // start at -1 and go backwards, as all the positive indexes
    // are already used by the nodes.
    var index = -1;

    for (i = 0; i < rowNodes.length; i++) {
        node = rowNodes[i];
        data = node.data;

        for (currentLevel = 0; currentLevel < groupByFields.length; currentLevel++) {
            groupByField = groupByFields[currentLevel];
            groupKey = data[groupByField];

            if (currentLevel == 0) {
                currentGroup = topMostGroup;
            }

            //if group doesn't exist yet, create it
            nextGroup = currentGroup.childrenMap[groupKey];
            if (!nextGroup) {
                nextGroup = {
                    group: true,
                    field: groupByField,
                    id: index--,
                    key: groupKey,
                    expanded: this.isExpanded(expandByDefault, currentLevel),
                    children: [],
                    // for top most level, parent is null
                    parent: currentGroup === topMostGroup ? null : currentGroup,
                    allChildrenCount: 0,
                    level: currentGroup.level + 1,
                    childrenMap: {} //this is a temporary map, we remove at the end of this method
                };
                currentGroup.childrenMap[groupKey] = nextGroup;
                currentGroup.children.push(nextGroup);
                allGroups.push(nextGroup);
            }

            nextGroup.allChildrenCount++;

            if (currentLevel == levelToInsertChild) {
                node.parent = nextGroup === topMostGroup ? null : nextGroup;
                nextGroup.children.push(node);
            } else {
                currentGroup = nextGroup;
            }
        }

    }

    //remove the temporary map
    for (i = 0; i < allGroups.length; i++) {
        delete allGroups[i].childrenMap;
    }

    return topMostGroup.children;
};

GroupCreator.prototype.isExpanded = function(expandByDefault, level) {
    if (typeof expandByDefault === 'number') {
        return level < expandByDefault;
    } else {
        return expandByDefault === true || expandByDefault === 'true';
    }
};

module.exports = new GroupCreator();

},{}],15:[function(require,module,exports){
var utils = require('./utils');
var SvgFactory = require('./svgFactory');
var constants = require('./constants');

var svgFactory = new SvgFactory();

function HeaderRenderer() {}

HeaderRenderer.prototype.init = function(gridOptionsWrapper, columnController, columnModel, eGrid, angularGrid, filterManager, $scope, $compile) {
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.columnModel = columnModel;
    this.columnController = columnController;
    this.angularGrid = angularGrid;
    this.filterManager = filterManager;
    this.$scope = $scope;
    this.$compile = $compile;
    this.findAllElements(eGrid);
};

HeaderRenderer.prototype.findAllElements = function(eGrid) {

    if (this.gridOptionsWrapper.isDontUseScrolls()) {
        this.eHeaderContainer = eGrid.querySelector(".ag-header-container");
        this.eRoot = eGrid.querySelector(".ag-root");
        // for no-scroll, all header cells live in the header container (the ag-header doesn't exist)
        this.eHeaderParent = this.eHeaderContainer;
    } else {
        this.ePinnedHeader = eGrid.querySelector(".ag-pinned-header");
        this.eHeaderContainer = eGrid.querySelector(".ag-header-container");
        this.eHeader = eGrid.querySelector(".ag-header");
        this.eRoot = eGrid.querySelector(".ag-root");
        // for scroll, all header cells live in the header (contains both normal and pinned headers)
        this.eHeaderParent = this.eHeader;
    }
};

HeaderRenderer.prototype.refreshHeader = function() {
    utils.removeAllChildren(this.ePinnedHeader);
    utils.removeAllChildren(this.eHeaderContainer);

    if (this.childScopes) {
        this.childScopes.forEach(function(childScope) {
            childScope.$destroy();
        });
    }
    this.childScopes = [];

    if (this.gridOptionsWrapper.isGroupHeaders()) {
        this.insertHeadersWithGrouping();
    } else {
        this.insertHeadersWithoutGrouping();
    }

};

HeaderRenderer.prototype.insertHeadersWithGrouping = function() {
    var groups = this.columnModel.getColumnGroups();
    var that = this;
    groups.forEach(function(group) {
        var eHeaderCell = that.createGroupedHeaderCell(group);
        var eContainerToAddTo = group.pinned ? that.ePinnedHeader : that.eHeaderContainer;
        eContainerToAddTo.appendChild(eHeaderCell);
    });
};

HeaderRenderer.prototype.createGroupedHeaderCell = function(group) {

    var eHeaderGroup = document.createElement('div');
    eHeaderGroup.className = 'ag-header-group';

    var eHeaderGroupCell = document.createElement('div');
    group.eHeaderGroupCell = eHeaderGroupCell;
    var classNames = ['ag-header-group-cell'];
    // having different classes below allows the style to not have a bottom border
    // on the group header, if no group is specified
    if (group.name) {
        classNames.push('ag-header-group-cell-with-group');
    } else {
        classNames.push('ag-header-group-cell-no-group');
    }
    eHeaderGroupCell.className = classNames.join(' ');

    if (this.gridOptionsWrapper.isEnableColResize()) {
        var eHeaderCellResize = document.createElement("div");
        eHeaderCellResize.className = "ag-header-cell-resize";
        eHeaderGroupCell.appendChild(eHeaderCellResize);
        group.eHeaderCellResize = eHeaderCellResize;
        var dragCallback = this.groupDragCallbackFactory(group);
        this.addDragHandler(eHeaderCellResize, dragCallback);
    }

    // no renderer, default text render
    var groupName = group.name;
    if (groupName && groupName !== '') {
        var eGroupCellLabel = document.createElement("div");
        eGroupCellLabel.className = 'ag-header-group-cell-label';
        eHeaderGroupCell.appendChild(eGroupCellLabel);

        var eInnerText = document.createElement("span");
        eInnerText.className = 'ag-header-group-text';
        eInnerText.innerHTML = groupName;
        eGroupCellLabel.appendChild(eInnerText);

        if (group.expandable) {
            this.addGroupExpandIcon(group, eGroupCellLabel, group.expanded);
        }
    }
    eHeaderGroup.appendChild(eHeaderGroupCell);

    var that = this;
    group.visibleColumns.forEach(function(column) {
        var eHeaderCell = that.createHeaderCell(column, true, group);
        eHeaderGroup.appendChild(eHeaderCell);
    });

    that.setWidthOfGroupHeaderCell(group);

    return eHeaderGroup;
};

HeaderRenderer.prototype.addGroupExpandIcon = function(group, eHeaderGroup, expanded) {
    var eGroupIcon;
    if (expanded) {
        eGroupIcon = utils.createIcon('columnGroupOpened', this.gridOptionsWrapper, null, svgFactory.createArrowLeftSvg);
    } else {
        eGroupIcon = utils.createIcon('columnGroupClosed', this.gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
    }
    eGroupIcon.className = 'ag-header-expand-icon';
    eHeaderGroup.appendChild(eGroupIcon);

    var that = this;
    eGroupIcon.onclick = function() {
        that.columnController.columnGroupOpened(group);
    };
};

HeaderRenderer.prototype.addDragHandler = function(eDraggableElement, dragCallback) {
    var that = this;
    eDraggableElement.onmousedown = function(downEvent) {
        dragCallback.onDragStart();
        that.eRoot.style.cursor = "col-resize";
        that.dragStartX = downEvent.clientX;

        that.eRoot.onmousemove = function(moveEvent) {
            var newX = moveEvent.clientX;
            var change = newX - that.dragStartX;
            dragCallback.onDragging(change);
        };
        that.eRoot.onmouseup = function() {
            that.stopDragging();
        };
        that.eRoot.onmouseleave = function() {
            that.stopDragging();
        };
    };
};

HeaderRenderer.prototype.setWidthOfGroupHeaderCell = function(headerGroup) {
    var totalWidth = 0;
    headerGroup.visibleColumns.forEach(function(column) {
        totalWidth += column.actualWidth;
    });
    headerGroup.eHeaderGroupCell.style.width = utils.formatWidth(totalWidth);
    headerGroup.actualWidth = totalWidth;
};

HeaderRenderer.prototype.insertHeadersWithoutGrouping = function() {
    var ePinnedHeader = this.ePinnedHeader;
    var eHeaderContainer = this.eHeaderContainer;
    var that = this;

    this.columnModel.getVisibleColumns().forEach(function(column) {
        // only include the first x cols
        var headerCell = that.createHeaderCell(column, false);
        if (column.pinned) {
            ePinnedHeader.appendChild(headerCell);
        } else {
            eHeaderContainer.appendChild(headerCell);
        }
    });
};

HeaderRenderer.prototype.createHeaderCell = function(column, grouped, headerGroup) {
    var that = this;
    var colDef = column.colDef;
    var eHeaderCell = document.createElement("div");
    // stick the header cell in column, as we access it when group is re-sized
    column.eHeaderCell = eHeaderCell;

    var headerCellClasses = ['ag-header-cell'];
    if (grouped) {
        headerCellClasses.push('ag-header-cell-grouped'); // this takes 50% height
    } else {
        headerCellClasses.push('ag-header-cell-not-grouped'); // this takes 100% height
    }
    eHeaderCell.className = headerCellClasses.join(' ');

    // add tooltip if exists
    if (colDef.headerTooltip) {
        eHeaderCell.title = colDef.headerTooltip;
    }

    if (this.gridOptionsWrapper.isEnableColResize()) {
        var headerCellResize = document.createElement("div");
        headerCellResize.className = "ag-header-cell-resize";
        eHeaderCell.appendChild(headerCellResize);
        var dragCallback = this.headerDragCallbackFactory(eHeaderCell, column, headerGroup);
        this.addDragHandler(headerCellResize, dragCallback);
    }

    // filter button
    var showMenu = this.gridOptionsWrapper.isEnableFilter() && !colDef.suppressMenu;
    if (showMenu) {
        var eMenuButton = utils.createIcon('menu', this.gridOptionsWrapper, column, svgFactory.createMenuSvg);
        utils.addCssClass(eMenuButton, 'ag-header-icon');

        eMenuButton.setAttribute("class", "ag-header-cell-menu-button");
        eMenuButton.onclick = function() {
            that.filterManager.showFilter(column, this);
        };
        eHeaderCell.appendChild(eMenuButton);
        eHeaderCell.onmouseenter = function() {
            eMenuButton.style.opacity = 1;
        };
        eHeaderCell.onmouseleave = function() {
            eMenuButton.style.opacity = 0;
        };
        eMenuButton.style.opacity = 0;
        eMenuButton.style["-webkit-transition"] = "opacity 0.5s, border 0.2s";
        eMenuButton.style["transition"] = "opacity 0.5s, border 0.2s";
    }

    // label div
    var headerCellLabel = document.createElement("div");
    headerCellLabel.className = "ag-header-cell-label";

    // add in sort icons
    if (this.gridOptionsWrapper.isEnableSorting() && !colDef.suppressSorting) {
        column.eSortAsc = utils.createIcon('sortAscending', this.gridOptionsWrapper, column, svgFactory.createArrowUpSvg);
        column.eSortDesc = utils.createIcon('sortDescending', this.gridOptionsWrapper, column, svgFactory.createArrowDownSvg);
        utils.addCssClass(column.eSortAsc, 'ag-header-icon');
        utils.addCssClass(column.eSortDesc, 'ag-header-icon');
        headerCellLabel.appendChild(column.eSortAsc);
        headerCellLabel.appendChild(column.eSortDesc);
        column.eSortAsc.style.display = 'none';
        column.eSortDesc.style.display = 'none';
        this.addSortHandling(headerCellLabel, column);
    }

    // add in filter icon
    column.eFilterIcon = utils.createIcon('filter', this.gridOptionsWrapper, column, svgFactory.createFilterSvg);
    utils.addCssClass(column.eFilterIcon, 'ag-header-icon');
    headerCellLabel.appendChild(column.eFilterIcon);

    // render the cell, use a renderer if one is provided
    var headerCellRenderer;
    if (colDef.headerCellRenderer) { // first look for a renderer in col def
        headerCellRenderer = colDef.headerCellRenderer;
    } else if (this.gridOptionsWrapper.getHeaderCellRenderer()) { // second look for one in grid options
        headerCellRenderer = this.gridOptionsWrapper.getHeaderCellRenderer();
    }
    if (headerCellRenderer) {
        // renderer provided, use it
        var newChildScope;
        if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
            newChildScope = this.$scope.$new();
        }
        var cellRendererParams = {
            colDef: colDef,
            $scope: newChildScope,
            context: this.gridOptionsWrapper.getContext(),
            gridOptions: this.gridOptionsWrapper.getGridOptions()
        };
        var cellRendererResult = headerCellRenderer(cellRendererParams);
        var childToAppend;
        if (utils.isNode(cellRendererResult) || utils.isElement(cellRendererResult)) {
            // a dom node or element was returned, so add child
            childToAppend = cellRendererResult;
        } else {
            // otherwise assume it was html, so just insert
            var eTextSpan = document.createElement("span");
            eTextSpan.innerHTML = cellRendererResult;
            childToAppend = eTextSpan;
        }
        // angular compile header if option is turned on
        if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
            newChildScope.colDef = colDef;
            newChildScope.colIndex = colDef.index;
            newChildScope.colDefWrapper = column;
            this.childScopes.push(newChildScope);
            var childToAppendCompiled = this.$compile(childToAppend)(newChildScope)[0];
            headerCellLabel.appendChild(childToAppendCompiled);
        } else {
            headerCellLabel.appendChild(childToAppend);
        }
    } else {
        // no renderer, default text render
        var eInnerText = document.createElement("span");
        eInnerText.className = 'ag-header-cell-text';
        eInnerText.innerHTML = colDef.displayName;
        headerCellLabel.appendChild(eInnerText);
    }

    eHeaderCell.appendChild(headerCellLabel);
    eHeaderCell.style.width = utils.formatWidth(column.actualWidth);

    return eHeaderCell;
};

HeaderRenderer.prototype.addSortHandling = function(headerCellLabel, colDefWrapper) {
    var that = this;

    headerCellLabel.addEventListener("click", function() {

        // update sort on current col
        if (colDefWrapper.sort === constants.ASC) {
            colDefWrapper.sort = constants.DESC;
        } else if (colDefWrapper.sort === constants.DESC) {
            colDefWrapper.sort = null
        } else {
            colDefWrapper.sort = constants.ASC;
        }

        // clear sort on all columns except this one, and update the icons
        that.columnModel.getAllColumns().forEach(function(columnToClear) {
            if (columnToClear !== colDefWrapper) {
                columnToClear.sort = null;
            }

            // check in case no sorting on this particular col, as sorting is optional per col
            if (columnToClear.colDef.suppressSorting) {
                return;
            }

            // update visibility of icons
            var sortAscending = columnToClear.sort === constants.ASC;
            var sortDescending = columnToClear.sort === constants.DESC;

            if (columnToClear.eSortAsc) {
                columnToClear.eSortAsc.style.display = sortAscending ? 'inline' : 'none';
            }
            if (columnToClear.eSortDesc) {
                columnToClear.eSortDesc.style.display = sortDescending ? 'inline' : 'none';
            }
        });

        that.angularGrid.updateModelAndRefresh(constants.STEP_SORT);
    });
};

HeaderRenderer.prototype.groupDragCallbackFactory = function(currentGroup) {
    var parent = this;
    var visibleColumns = currentGroup.visibleColumns;
    return {
        onDragStart: function() {
            this.groupWidthStart = currentGroup.actualWidth;
            this.childrenWidthStarts = [];
            var that = this;
            visibleColumns.forEach(function(colDefWrapper) {
                that.childrenWidthStarts.push(colDefWrapper.actualWidth);
            });
            this.minWidth = visibleColumns.length * constants.MIN_COL_WIDTH;
        },
        onDragging: function(dragChange) {

            var newWidth = this.groupWidthStart + dragChange;
            if (newWidth < this.minWidth) {
                newWidth = this.minWidth;
            }

            // set the new width to the group header
            var newWidthPx = newWidth + "px";
            currentGroup.eHeaderGroupCell.style.width = newWidthPx;
            currentGroup.actualWidth = newWidth;

            // distribute the new width to the child headers
            var changeRatio = newWidth / this.groupWidthStart;
            // keep track of pixels used, and last column gets the remaining,
            // to cater for rounding errors, and min width adjustments
            var pixelsToDistribute = newWidth;
            var that = this;
            currentGroup.visibleColumns.forEach(function(colDefWrapper, index) {
                var notLastCol = index !== (visibleColumns.length - 1);
                var newChildSize;
                if (notLastCol) {
                    // if not the last col, calculate the column width as normal
                    var startChildSize = that.childrenWidthStarts[index];
                    newChildSize = startChildSize * changeRatio;
                    if (newChildSize < constants.MIN_COL_WIDTH) {
                        newChildSize = constants.MIN_COL_WIDTH;
                    }
                    pixelsToDistribute -= newChildSize;
                } else {
                    // if last col, give it the remaining pixels
                    newChildSize = pixelsToDistribute;
                }
                var eHeaderCell = visibleColumns[index].eHeaderCell;
                parent.adjustColumnWidth(newChildSize, colDefWrapper, eHeaderCell);
            });

            // should not be calling these here, should do something else
            if (currentGroup.pinned) {
                parent.angularGrid.updatePinnedColContainerWidthAfterColResize();
            } else {
                parent.angularGrid.updateBodyContainerWidthAfterColResize();
            }
        }
    };
};

HeaderRenderer.prototype.adjustColumnWidth = function(newWidth, column, eHeaderCell) {
    var newWidthPx = newWidth + "px";
    var selectorForAllColsInCell = ".cell-col-" + column.index;
    var cellsForThisCol = this.eRoot.querySelectorAll(selectorForAllColsInCell);
    for (var i = 0; i < cellsForThisCol.length; i++) {
        cellsForThisCol[i].style.width = newWidthPx;
    }

    eHeaderCell.style.width = newWidthPx;
    column.actualWidth = newWidth;
};

// gets called when a header (not a header group) gets resized
HeaderRenderer.prototype.headerDragCallbackFactory = function(headerCell, column, headerGroup) {
    var parent = this;
    return {
        onDragStart: function() {
            this.startWidth = column.actualWidth;
        },
        onDragging: function(dragChange) {
            var newWidth = this.startWidth + dragChange;
            if (newWidth < constants.MIN_COL_WIDTH) {
                newWidth = constants.MIN_COL_WIDTH;
            }

            parent.adjustColumnWidth(newWidth, column, headerCell);

            if (headerGroup) {
                parent.setWidthOfGroupHeaderCell(headerGroup);
            }

            // should not be calling these here, should do something else
            if (column.pinned) {
                parent.angularGrid.updatePinnedColContainerWidthAfterColResize();
            } else {
                parent.angularGrid.updateBodyContainerWidthAfterColResize();
            }
        }
    };
};

HeaderRenderer.prototype.stopDragging = function() {
    this.eRoot.style.cursor = "";
    this.eRoot.onmouseup = null;
    this.eRoot.onmouseleave = null;
    this.eRoot.onmousemove = null;
};

HeaderRenderer.prototype.updateFilterIcons = function() {
    var that = this;
    this.columnModel.getVisibleColumns().forEach(function(column) {
        // todo: need to change this, so only updates if column is visible
        if (column.eFilterIcon) {
            var filterPresent = that.filterManager.isFilterPresentForCol(column.colKey);
            var displayStyle = filterPresent ? 'inline' : 'none';
            column.eFilterIcon.style.display = displayStyle;
        }
    });
};

module.exports = HeaderRenderer;

},{"./constants":3,"./svgFactory":21,"./utils":24}],16:[function(require,module,exports){
var groupCreator = require('./groupCreator');
var utils = require('./utils');
var constants = require('./constants');

function InMemoryRowController() {
    this.createModel();
}

InMemoryRowController.prototype.init = function(gridOptionsWrapper, columnModel, angularGrid, filterManager, $scope) {
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.columnModel = columnModel;
    this.angularGrid = angularGrid;
    this.filterManager = filterManager;
    this.$scope = $scope;

    this.allRows = null;
    this.rowsAfterGroup = null;
    this.rowsAfterFilter = null;
    this.rowsAfterSort = null;
    this.rowsAfterMap = null;
};

// private
InMemoryRowController.prototype.createModel = function() {
    var that = this;
    this.model = {
        // this method is implemented by the inMemory model only,
        // it gives the top level of the selection. used by the selection
        // controller, when it needs to do a full traversal
        getTopLevelNodes: function() {
            return that.rowsAfterGroup;
        },
        getVirtualRow: function(index) {
            return that.rowsAfterMap[index];
        },
        getVirtualRowCount: function() {
            if (that.rowsAfterMap) {
                return that.rowsAfterMap.length;
            } else {
                return 0;
            }
        }
    };
};

// public
InMemoryRowController.prototype.getModel = function() {
    return this.model;
};

// public
InMemoryRowController.prototype.updateModel = function(step) {

    // fallthrough in below switch is on purpose
    switch (step) {
        case constants.STEP_EVERYTHING:
            this.doGrouping();
        case constants.STEP_FILTER:
            this.doFilter();
            this.doAggregate();
        case constants.STEP_SORT:
            this.doSort();
        case constants.STEP_MAP:
            this.doGroupMapping();
    }

    if (typeof this.gridOptionsWrapper.getModelUpdated() === 'function') {
        this.gridOptionsWrapper.getModelUpdated()();
        var $scope = this.$scope;
        if ($scope) {
            setTimeout(function() {
                $scope.$apply();
            }, 0);
        }
    }

};

// public - it's possible to recompute the aggregate without doing the other parts
InMemoryRowController.prototype.doAggregate = function() {

    var groupAggFunction = this.gridOptionsWrapper.getGroupAggFunction();
    if (typeof groupAggFunction !== 'function') {
        return;
    }

    this.recursivelyCreateAggData(this.rowsAfterFilter, groupAggFunction);
};

// public
InMemoryRowController.prototype.expandOrCollapseAll = function(expand, rowNodes) {
    // if first call in recursion, we set list to parent list
    if (rowNodes === null) {
        rowNodes = this.rowsAfterGroup;
    }

    if (!rowNodes) {
        return;
    }

    var _this = this;
    rowNodes.forEach(function(node) {
        if (node.group) {
            node.expanded = expand;
            _this.expandOrCollapseAll(expand, node.children);
        }
    });
};

// private
InMemoryRowController.prototype.recursivelyCreateAggData = function(nodes, groupAggFunction) {
    for (var i = 0, l = nodes.length; i < l; i++) {
        var node = nodes[i];
        if (node.group) {
            // agg function needs to start at the bottom, so traverse first
            this.recursivelyCreateAggData(node.children, groupAggFunction);
            // after traversal, we can now do the agg at this level
            var data = groupAggFunction(node.children);
            node.data = data;
            // if we are grouping, then it's possible there is a sibling footer
            // to the group, so update the data here also if thers is one
            if (node.sibling) {
                node.sibling.data = data;
            }
        }
    }
};

// private
InMemoryRowController.prototype.doSort = function() {
    //see if there is a col we are sorting by
    var columnForSorting = null;
    this.columnModel.getAllColumns().forEach(function(colDefWrapper) {
        if (colDefWrapper.sort) {
            columnForSorting = colDefWrapper;
        }
    });

    var rowNodesBeforeSort = this.rowsAfterFilter.slice(0);

    if (columnForSorting) {
        var ascending = columnForSorting.sort === constants.ASC;
        var inverter = ascending ? 1 : -1;

        this.sortList(rowNodesBeforeSort, columnForSorting.colDef, inverter);
    } else {
        //if no sorting, set all group children after sort to the original list
        this.resetSortInGroups(rowNodesBeforeSort);
    }

    this.rowsAfterSort = rowNodesBeforeSort;
};

// private
InMemoryRowController.prototype.resetSortInGroups = function(rowNodes) {
    for (var i = 0, l = rowNodes.length; i < l; i++) {
        var item = rowNodes[i];
        if (item.group && item.children) {
            item.childrenAfterSort = item.children;
            this.resetSortInGroups(item.children);
        }
    }
};

// private
InMemoryRowController.prototype.sortList = function(nodes, columnForSorting, inverter) {

    // sort any groups recursively
    for (var i = 0, l = nodes.length; i < l; i++) { // critical section, no functional programming
        var node = nodes[i];
        if (node.group && node.children) {
            node.childrenAfterSort = node.children.slice(0);
            this.sortList(node.childrenAfterSort, columnForSorting, inverter);
        }
    }

    nodes.sort(function(objA, objB) {
        var keyForSort = columnForSorting.field;
        var valueA = objA.data ? objA.data[keyForSort] : null;
        var valueB = objB.data ? objB.data[keyForSort] : null;

        if (columnForSorting.comparator) {
            //if comparator provided, use it
            return columnForSorting.comparator(valueA, valueB) * inverter;
        } else {
            //otherwise do our own comparison
            return utils.defaultComparator(valueA, valueB) * inverter;
        }

    });
};

// private
InMemoryRowController.prototype.doGrouping = function() {
    var rowsAfterGroup;
    if (this.gridOptionsWrapper.isDoInternalGrouping()) {
        var expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
        rowsAfterGroup = groupCreator.group(this.allRows, this.gridOptionsWrapper.getGroupKeys(),
            this.gridOptionsWrapper.getGroupAggFunction(), expandByDefault);
    } else {
        rowsAfterGroup = this.allRows;
    }
    this.rowsAfterGroup = rowsAfterGroup;
};

// private
InMemoryRowController.prototype.doFilter = function() {
    var quickFilterPresent = this.angularGrid.getQuickFilter() !== null;
    var advancedFilterPresent = this.filterManager.isFilterPresent();
    var filterPresent = quickFilterPresent || advancedFilterPresent;

    var rowsAfterFilter;
    if (filterPresent) {
        rowsAfterFilter = this.filterItems(this.rowsAfterGroup, quickFilterPresent, advancedFilterPresent);
    } else {
        rowsAfterFilter = this.rowsAfterGroup;
    }
    this.rowsAfterFilter = rowsAfterFilter;
};

// private
InMemoryRowController.prototype.filterItems = function(rowNodes, quickFilterPresent, advancedFilterPresent) {
    var result = [];

    for (var i = 0, l = rowNodes.length; i < l; i++) {
        var node = rowNodes[i];

        if (node.group) {
            // deal with group
            var filteredChildren = this.filterItems(node.children, quickFilterPresent, advancedFilterPresent);
            if (filteredChildren.length > 0) {
                var allChildrenCount = this.getTotalChildCount(filteredChildren);
                var newGroup = this.copyGroupNode(node, filteredChildren, allChildrenCount);

                result.push(newGroup);
            }
        } else {
            if (this.doesRowPassFilter(node, quickFilterPresent, advancedFilterPresent)) {
                result.push(node);
            }
        }
    }

    return result;
};

// private
// rows: the rows to put into the model
// firstId: the first id to use, used for paging, where we are not on the first page
InMemoryRowController.prototype.setAllRows = function(rows, firstId) {
    var nodes;
    if (this.gridOptionsWrapper.isRowsAlreadyGrouped()) {
        nodes = rows;
        this.recursivelyCheckUserProvidedNodes(nodes, null, 0);
    } else {
        // place each row into a wrapper
        var nodes = [];
        if (rows) {
            for (var i = 0; i < rows.length; i++) { // could be lots of rows, don't use functional programming
                nodes.push({
                    data: rows[i]
                });
            }
        }
    }

    // if firstId provided, use it, otherwise start at 0
    var firstIdToUse = firstId ? firstId : 0;
    this.recursivelyAddIdToNodes(nodes, firstIdToUse);
    this.allRows = nodes;
};

// add in index - this is used by the selectionController - so quick
// to look up selected rows
InMemoryRowController.prototype.recursivelyAddIdToNodes = function(nodes, index) {
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        node.id = index++;
        if (node.group && node.children) {
            index = this.recursivelyAddIdToNodes(node.children, index);
        }
    }
    return index;
};

// add in index - this is used by the selectionController - so quick
// to look up selected rows
InMemoryRowController.prototype.recursivelyCheckUserProvidedNodes = function(nodes, parent, level) {
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (parent) {
            node.parent = parent;
        }
        node.level = level;
        if (node.group && node.children) {
            this.recursivelyCheckUserProvidedNodes(node.children, node, level + 1);
        }
    }
};

// private
InMemoryRowController.prototype.getTotalChildCount = function(rowNodes) {
    var count = 0;
    for (var i = 0, l = rowNodes.length; i < l; i++) {
        var item = rowNodes[i];
        if (item.group) {
            count += item.allChildrenCount;
        } else {
            count++;
        }
    }
    return count;
};

// private
InMemoryRowController.prototype.copyGroupNode = function(groupNode, children, allChildrenCount) {
    return {
        group: true,
        data: groupNode.data,
        field: groupNode.field,
        key: groupNode.key,
        expanded: groupNode.expanded,
        children: children,
        allChildrenCount: allChildrenCount,
        level: groupNode.level
    };
};

// private
InMemoryRowController.prototype.doGroupMapping = function() {
    // even if not going grouping, we do the mapping, as the client might
    // of passed in data that already has a grouping in it somewhere
    var rowsAfterMap = [];
    this.addToMap(rowsAfterMap, this.rowsAfterSort);
    this.rowsAfterMap = rowsAfterMap;
};

// private
InMemoryRowController.prototype.addToMap = function(mappedData, originalNodes) {
    if (!originalNodes) {
        return;
    }
    for (var i = 0; i < originalNodes.length; i++) {
        var node = originalNodes[i];
        mappedData.push(node);
        if (node.group && node.expanded) {
            this.addToMap(mappedData, node.childrenAfterSort);

            // put a footer in if user is looking for it
            if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
                var footerNode = this.createFooterNode(node);
                mappedData.push(footerNode);
            }
        }
    }
};

// private
InMemoryRowController.prototype.createFooterNode = function(groupNode) {
    var footerNode = {};
    Object.keys(groupNode).forEach(function(key) {
        footerNode[key] = groupNode[key];
    });
    footerNode.footer = true;
    // get both header and footer to reference each other as siblings. this is never undone,
    // only overwritten. so if a group is expanded, then contracted, it will have a ghost
    // sibling - but that's fine, as we can ignore this if the header is contracted.
    footerNode.sibling = groupNode;
    groupNode.sibling = footerNode;
    return footerNode;
};

// private
InMemoryRowController.prototype.doesRowPassFilter = function(node, quickFilterPresent, advancedFilterPresent) {
    //first up, check quick filter
    if (quickFilterPresent) {
        if (!node.quickFilterAggregateText) {
            this.aggregateRowForQuickFilter(node);
        }
        if (node.quickFilterAggregateText.indexOf(this.angularGrid.getQuickFilter()) < 0) {
            //quick filter fails, so skip item
            return false;
        }
    }

    //second, check advanced filter
    if (advancedFilterPresent) {
        if (!this.filterManager.doesFilterPass(node)) {
            return false;
        }
    }

    //got this far, all filters pass
    return true;
};

// private
InMemoryRowController.prototype.aggregateRowForQuickFilter = function(node) {
    var aggregatedText = '';
    this.columnModel.getAllColumns().forEach(function(colDefWrapper) {
        var data = node.data;
        var value = data ? data[colDefWrapper.colDef.field] : null;
        if (value && value !== '') {
            aggregatedText = aggregatedText + value.toString().toUpperCase() + "_";
        }
    });
    node.quickFilterAggregateText = aggregatedText;
};

module.exports = InMemoryRowController;

},{"./constants":3,"./groupCreator":14,"./utils":24}],17:[function(require,module,exports){
var TEMPLATE = [
    '<span id="pageRowSummaryPanel" class="ag-paging-row-summary-panel">',
    '<span id="firstRowOnPage"></span>',
    ' to ',
    '<span id="lastRowOnPage"></span>',
    ' of ',
    '<span id="recordCount"></span>',
    '</span>',
    '<span clas="ag-paging-page-summary-panel">',
    '<button class="ag-paging-button" id="btFirst">First</button>',
    '<button class="ag-paging-button" id="btPrevious">Previous</button>',
    ' Page ',
    '<span id="current"></span>',
    ' of ',
    '<span id="total"></span>',
    '<button class="ag-paging-button" id="btNext">Next</button>',
    '<button class="ag-paging-button" id="btLast">Last</button>',
    '</span>'
].join('');

function PaginationController() {}

PaginationController.prototype.init = function(ePagingPanel, angularGrid) {
    this.angularGrid = angularGrid;
    this.populatePanel(ePagingPanel);
    this.callVersion = 0;
};

PaginationController.prototype.setDatasource = function(datasource) {
    this.datasource = datasource;

    if (!datasource) {
        // only continue if we have a valid datasource to work with
        return;
    }

    this.reset();
};

PaginationController.prototype.reset = function() {
    // copy pageSize, to guard against it changing the the datasource between calls
    this.pageSize = this.datasource.pageSize;
    // see if we know the total number of pages, or if it's 'to be decided'
    if (this.datasource.rowCount >= 0) {
        this.rowCount = this.datasource.rowCount;
        this.foundMaxRow = true;
        this.calculateTotalPages();
    } else {
        this.rowCount = 0;
        this.foundMaxRow = false;
        this.totalPages = null;
    }

    this.currentPage = 0;

    // hide the summary panel until something is loaded
    this.ePageRowSummaryPanel.style.visibility = 'hidden';

    this.setTotalLabels();
    this.loadPage();
};

PaginationController.prototype.setTotalLabels = function() {
    if (this.foundMaxRow) {
        this.lbTotal.innerHTML = this.totalPages.toLocaleString();
        this.lbRecordCount.innerHTML = this.rowCount.toLocaleString();
    } else {
        this.lbTotal.innerHTML = 'more';
        this.lbRecordCount.innerHTML = 'more';
    }
};

PaginationController.prototype.calculateTotalPages = function() {
    this.totalPages = Math.floor((this.rowCount - 1) / this.pageSize) + 1;
};

PaginationController.prototype.pageLoaded = function(rows, lastRowIndex) {
    var firstId = this.currentPage * this.pageSize;
    this.angularGrid.setRows(rows, firstId);
    // see if we hit the last row
    if (!this.foundMaxRow && typeof lastRowIndex === 'number' && lastRowIndex >= 0) {
        this.foundMaxRow = true;
        this.rowCount = lastRowIndex;
        this.calculateTotalPages();
        this.setTotalLabels();

        // if overshot pages, go back
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages - 1;
            this.loadPage();
        }
    }
    this.enableOrDisableButtons();
    this.updateRowLabels();
};

PaginationController.prototype.updateRowLabels = function() {
    var startRow = (this.pageSize * this.currentPage) + 1;
    var endRow = startRow + this.pageSize - 1;
    if (this.foundMaxRow && endRow > this.rowCount) {
        endRow = this.rowCount;
    }
    this.lbFirstRowOnPage.innerHTML = (startRow).toLocaleString();
    this.lbLastRowOnPage.innerHTML = (endRow).toLocaleString();

    // show the summary panel, when first shown, this is blank
    this.ePageRowSummaryPanel.style.visibility = null;
};

PaginationController.prototype.loadPage = function() {
    this.enableOrDisableButtons();
    var startRow = this.currentPage * this.datasource.pageSize;
    var endRow = (this.currentPage + 1) * this.datasource.pageSize;

    this.lbCurrent.innerHTML = (this.currentPage + 1).toLocaleString();

    this.callVersion++;
    var callVersionCopy = this.callVersion;
    var that = this;
    this.angularGrid.showLoadingPanel(true);
    this.datasource.getRows(startRow, endRow,
        function success(rows, lastRowIndex) {
            if (that.isCallDaemon(callVersionCopy)) {
                return;
            }
            that.pageLoaded(rows, lastRowIndex);
        },
        function fail() {
            if (that.isCallDaemon(callVersionCopy)) {
                return;
            }
            // set in an empty set of rows, this will at
            // least get rid of the loading panel, and
            // stop blocking things
            that.angularGrid.setRows([]);
        }
    );
};

PaginationController.prototype.isCallDaemon = function(versionCopy) {
    return versionCopy !== this.callVersion;
};

PaginationController.prototype.onBtNext = function() {
    this.currentPage++;
    this.loadPage();
};

PaginationController.prototype.onBtPrevious = function() {
    this.currentPage--;
    this.loadPage();
};

PaginationController.prototype.onBtFirst = function() {
    this.currentPage = 0;
    this.loadPage();
};

PaginationController.prototype.onBtLast = function() {
    this.currentPage = this.totalPages - 1;
    this.loadPage();
};

PaginationController.prototype.enableOrDisableButtons = function() {
    var disablePreviousAndFirst = this.currentPage === 0;
    this.btPrevious.disabled = disablePreviousAndFirst;
    this.btFirst.disabled = disablePreviousAndFirst;

    var disableNext = this.foundMaxRow && this.currentPage === (this.totalPages - 1);
    this.btNext.disabled = disableNext;

    var disableLast = !this.foundMaxRow || this.currentPage === (this.totalPages - 1);
    this.btLast.disabled = disableLast;
};

PaginationController.prototype.populatePanel = function(ePagingPanel) {

    ePagingPanel.innerHTML = TEMPLATE;

    this.btNext = ePagingPanel.querySelector('#btNext');
    this.btPrevious = ePagingPanel.querySelector('#btPrevious');
    this.btFirst = ePagingPanel.querySelector('#btFirst');
    this.btLast = ePagingPanel.querySelector('#btLast');
    this.lbCurrent = ePagingPanel.querySelector('#current');
    this.lbTotal = ePagingPanel.querySelector('#total');

    this.lbRecordCount = ePagingPanel.querySelector('#recordCount');
    this.lbFirstRowOnPage = ePagingPanel.querySelector('#firstRowOnPage');
    this.lbLastRowOnPage = ePagingPanel.querySelector('#lastRowOnPage');
    this.ePageRowSummaryPanel = ePagingPanel.querySelector('#pageRowSummaryPanel');

    var that = this;

    this.btNext.addEventListener('click', function() {
        that.onBtNext();
    });

    this.btPrevious.addEventListener('click', function() {
        that.onBtPrevious();
    });

    this.btFirst.addEventListener('click', function() {
        that.onBtFirst();
    });

    this.btLast.addEventListener('click', function() {
        that.onBtLast();
    });
};

module.exports = PaginationController;

},{}],18:[function(require,module,exports){
var constants = require('./constants');
var SvgFactory = require('./svgFactory');
var utils = require('./utils');

var svgFactory = new SvgFactory();

var TAB_KEY = 9;
var ENTER_KEY = 13;

function RowRenderer() {}

RowRenderer.prototype.init = function(gridOptions, columnModel, gridOptionsWrapper, eGrid,
    angularGrid, selectionRendererFactory, $compile, $scope,
    selectionController) {
    this.gridOptions = gridOptions;
    this.columnModel = columnModel;
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.angularGrid = angularGrid;
    this.selectionRendererFactory = selectionRendererFactory;
    this.findAllElements(eGrid);
    this.$compile = $compile;
    this.$scope = $scope;
    this.selectionController = selectionController;

    // map of row ids to row objects. keeps track of which elements
    // are rendered for which rows in the dom. each row object has:
    // [scope, bodyRow, pinnedRow, rowData]
    this.renderedRows = {};

    this.renderedRowStartEditingListeners = {};

    this.editingCell = false; //gets set to true when editing a cell
};

RowRenderer.prototype.setRowModel = function(rowModel) {
    this.rowModel = rowModel;
};

RowRenderer.prototype.setMainRowWidths = function() {
    var mainRowWidth = this.columnModel.getBodyContainerWidth() + "px";

    var unpinnedRows = this.eBodyContainer.querySelectorAll(".ag-row");
    for (var i = 0; i < unpinnedRows.length; i++) {
        unpinnedRows[i].style.width = mainRowWidth;
    }
};

RowRenderer.prototype.findAllElements = function(eGrid) {
    if (this.gridOptionsWrapper.isDontUseScrolls()) {
        this.eBodyContainer = eGrid.querySelector(".ag-body-container");
    } else {
        this.eBodyContainer = eGrid.querySelector(".ag-body-container");
        this.eBodyViewport = eGrid.querySelector(".ag-body-viewport");
        this.ePinnedColsContainer = eGrid.querySelector(".ag-pinned-cols-container");
    }
};

RowRenderer.prototype.refreshView = function() {
    if (!this.gridOptionsWrapper.isDontUseScrolls()) {
        var rowCount = this.rowModel.getVirtualRowCount();
        var containerHeight = this.gridOptionsWrapper.getRowHeight() * rowCount;
        this.eBodyContainer.style.height = containerHeight + "px";
        this.ePinnedColsContainer.style.height = containerHeight + "px";
    }

    this.refreshAllVirtualRows();
};

RowRenderer.prototype.rowDataChanged = function(rows) {
    // we only need to be worried about rendered rows, as this method is
    // called to whats rendered. if the row isn't rendered, we don't care
    var indexesToRemove = [];
    var renderedRows = this.renderedRows;
    Object.keys(renderedRows).forEach(function(key) {
        var renderedRow = renderedRows[key];
        // see if the rendered row is in the list of rows we have to update
        var rowNeedsUpdating = rows.indexOf(renderedRow.node.data) >= 0;
        if (rowNeedsUpdating) {
            indexesToRemove.push(key);
        }
    });
    // remove the rows
    this.removeVirtualRows(indexesToRemove);
    // add draw them again
    this.drawVirtualRows();
};

RowRenderer.prototype.refreshAllVirtualRows = function() {
    // remove all current virtual rows, as they have old data
    var rowsToRemove = Object.keys(this.renderedRows);
    this.removeVirtualRows(rowsToRemove);

    // add in new rows
    this.drawVirtualRows();
};

// public - removes the group rows and then redraws them again
RowRenderer.prototype.refreshGroupRows = function() {
    // find all the group rows
    var rowsToRemove = [];
    var that = this;
    Object.keys(this.renderedRows).forEach(function(key) {
        var renderedRow = that.renderedRows[key];
        var node = renderedRow.node;
        if (node.group) {
            rowsToRemove.push(key);
        }
    });
    // remove the rows
    this.removeVirtualRows(rowsToRemove);
    // and draw them back again
    this.ensureRowsRendered();
};

// takes array of row indexes
RowRenderer.prototype.removeVirtualRows = function(rowsToRemove) {
    var that = this;
    rowsToRemove.forEach(function(indexToRemove) {
        that.removeVirtualRow(indexToRemove);
    });
};

RowRenderer.prototype.removeVirtualRow = function(indexToRemove) {
    var renderedRow = this.renderedRows[indexToRemove];
    if (renderedRow.pinnedElement && this.ePinnedColsContainer) {
        this.ePinnedColsContainer.removeChild(renderedRow.pinnedElement);
    }

    if (renderedRow.bodyElement) {
        this.eBodyContainer.removeChild(renderedRow.bodyElement);
    }

    if (renderedRow.scope) {
        renderedRow.scope.$destroy();
    }

    if (this.gridOptionsWrapper.getVirtualRowRemoved()) {
        this.gridOptionsWrapper.getVirtualRowRemoved()(renderedRow.data, indexToRemove);
    }
    this.angularGrid.onVirtualRowRemoved(indexToRemove);

    delete this.renderedRows[indexToRemove];
    delete this.renderedRowStartEditingListeners[indexToRemove];
};

RowRenderer.prototype.drawVirtualRows = function() {
    var first;
    var last;

    var rowCount = this.rowModel.getVirtualRowCount();

    if (this.gridOptionsWrapper.isDontUseScrolls()) {
        first = 0;
        last = rowCount;
    } else {
        var topPixel = this.eBodyViewport.scrollTop;
        var bottomPixel = topPixel + this.eBodyViewport.offsetHeight;

        first = Math.floor(topPixel / this.gridOptionsWrapper.getRowHeight());
        last = Math.floor(bottomPixel / this.gridOptionsWrapper.getRowHeight());

        //add in buffer
        first = first - constants.ROW_BUFFER_SIZE;
        last = last + constants.ROW_BUFFER_SIZE;

        // adjust, in case buffer extended actual size
        if (first < 0) {
            first = 0;
        }
        if (last > rowCount - 1) {
            last = rowCount - 1;
        }
    }

    this.firstVirtualRenderedRow = first;
    this.lastVirtualRenderedRow = last;

    this.ensureRowsRendered();
};

RowRenderer.prototype.isIndexRendered = function(index) {
    return index >= this.firstVirtualRenderedRow && index <= this.lastVirtualRenderedRow;
};

RowRenderer.prototype.getFirstVirtualRenderedRow = function() {
    return this.firstVirtualRenderedRow;
};

RowRenderer.prototype.getLastVirtualRenderedRow = function() {
    return this.lastVirtualRenderedRow;
};

RowRenderer.prototype.ensureRowsRendered = function() {

    var mainRowWidth = this.columnModel.getBodyContainerWidth();
    var that = this;

    //at the end, this array will contain the items we need to remove
    var rowsToRemove = Object.keys(this.renderedRows);

    //add in new rows
    for (var rowIndex = this.firstVirtualRenderedRow; rowIndex <= this.lastVirtualRenderedRow; rowIndex++) {
        // see if item already there, and if yes, take it out of the 'to remove' array
        if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
            rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
            continue;
        }
        // check this row actually exists (in case overflow buffer window exceeds real data)
        var node = this.rowModel.getVirtualRow(rowIndex);
        if (node) {
            that.insertRow(node, rowIndex, mainRowWidth);
        }
    }

    //at this point, everything in our 'rowsToRemove' . . .
    this.removeVirtualRows(rowsToRemove);

    //if we are doing angular compiling, then do digest the scope here
    if (this.gridOptions.angularCompileRows) {
        // we do it in a timeout, in case we are already in an apply
        setTimeout(function() {
            that.$scope.$apply();
        }, 0);
    }
};

RowRenderer.prototype.insertRow = function(node, rowIndex, mainRowWidth) {
    //if no cols, don't draw row
    if (!this.gridOptionsWrapper.isColumDefsPresent()) {
        return;
    }

    //var rowData = node.rowData;
    var rowIsAGroup = node.group;
    var rowIsAFooter = node.footer;

    var ePinnedRow = this.createRowContainer(rowIndex, node, rowIsAGroup);
    var eMainRow = this.createRowContainer(rowIndex, node, rowIsAGroup);
    var _this = this;

    eMainRow.style.width = mainRowWidth + "px";

    // try compiling as we insert rows
    var newChildScope = this.createChildScopeOrNull(node.data);

    var renderedRow = {
        scope: newChildScope,
        node: node,
        rowIndex: rowIndex
    };
    this.renderedRows[rowIndex] = renderedRow;
    this.renderedRowStartEditingListeners[rowIndex] = {};

    // if group item, insert the first row
    var columns = this.columnModel.getVisibleColumns();
    if (rowIsAGroup) {
        var firstColumn = columns[0];
        var groupHeaderTakesEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow();

        var eGroupRow = _this.createGroupElement(node, firstColumn, groupHeaderTakesEntireRow, false, rowIndex, rowIsAFooter);
        if (firstColumn.pinned) {
            ePinnedRow.appendChild(eGroupRow);
        } else {
            eMainRow.appendChild(eGroupRow);
        }

        if (firstColumn.pinned && groupHeaderTakesEntireRow) {
            var eGroupRowPadding = _this.createGroupElement(node, firstColumn, groupHeaderTakesEntireRow, true, rowIndex, rowIsAFooter);
            eMainRow.appendChild(eGroupRowPadding);
        }

        if (!groupHeaderTakesEntireRow) {

            // draw in cells for the rest of the row.
            // if group is a footer, always show the data.
            // if group is a header, only show data if not expanded
            var groupData;
            if (node.footer) {
                groupData = node.data;
            } else {
                // we show data in footer only
                var footersEnabled = this.gridOptionsWrapper.isGroupIncludeFooter();
                groupData = (node.expanded && footersEnabled) ? undefined : node.data;
            }
            columns.forEach(function(column, colIndex) {
                if (colIndex == 0) { //skip first col, as this is the group col we already inserted
                    return;
                }
                var value = groupData ? groupData[column.colDef.field] : undefined;
                _this.createCellFromColDef(false, column, value, node, rowIndex, eMainRow, ePinnedRow, newChildScope);
            });
        }

    } else {
        columns.forEach(function(column, index) {
            var firstCol = index === 0;
            _this.createCellFromColDef(firstCol, column, node.data[column.colDef.field], node, rowIndex, eMainRow, ePinnedRow, newChildScope);
        });
    }

    //try compiling as we insert rows
    renderedRow.pinnedElement = this.compileAndAdd(this.ePinnedColsContainer, rowIndex, ePinnedRow, newChildScope);
    renderedRow.bodyElement = this.compileAndAdd(this.eBodyContainer, rowIndex, eMainRow, newChildScope);
};

RowRenderer.prototype.createChildScopeOrNull = function(data) {
    if (this.gridOptionsWrapper.isAngularCompileRows()) {
        var newChildScope = this.$scope.$new();
        newChildScope.data = data;
        return newChildScope;
    } else {
        return null;
    }
};

RowRenderer.prototype.compileAndAdd = function(container, rowIndex, element, scope) {
    if (scope) {
        var eElementCompiled = this.$compile(element)(scope);
        if (container) { // checking container, as if noScroll, pinned container is missing
            container.appendChild(eElementCompiled[0]);
        }
        return eElementCompiled[0];
    } else {
        if (container) {
            container.appendChild(element);
        }
        return element;
    }
};

RowRenderer.prototype.createCellFromColDef = function(isFirstColumn, column, value, node, rowIndex, eMainRow, ePinnedRow, $childScope) {
    var eGridCell = this.createCell(isFirstColumn, column, value, node, rowIndex, $childScope);

    if (column.pinned) {
        ePinnedRow.appendChild(eGridCell);
    } else {
        eMainRow.appendChild(eGridCell);
    }
};

RowRenderer.prototype.addClassesToRow = function(rowIndex, node, eRow) {
    var classesList = ["ag-row"];
    classesList.push(rowIndex % 2 == 0 ? "ag-row-even" : "ag-row-odd");

    if (this.selectionController.isNodeSelected(node)) {
        classesList.push("ag-row-selected");
    }
    if (node.group) {
        // if a group, put the level of the group in
        classesList.push("ag-row-level-" + node.level);
    } else {
        // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
        if (node.parent) {
            classesList.push("ag-row-level-" + (node.parent.level + 1));
        } else {
            classesList.push("ag-row-level-0");
        }
    }
    if (node.group) {
        classesList.push("ag-row-group");
    }
    if (node.group && !node.footer && node.expanded) {
        classesList.push("ag-row-group-expanded");
    }
    if (node.group && !node.footer && !node.expanded) {
        // opposite of expanded is contracted according to the internet.
        classesList.push("ag-row-group-contracted");
    }
    if (node.group && node.footer) {
        classesList.push("ag-row-footer");
    }

    // add in extra classes provided by the config
    if (this.gridOptionsWrapper.getRowClass()) {
        var params = {
            node: node,
            data: node.data,
            rowIndex: rowIndex,
            context: this.gridOptionsWrapper.getContext(),
            gridOptions: this.gridOptionsWrapper.getGridOptions()
        };
        var extraRowClasses = this.gridOptionsWrapper.getRowClass()(params);
        if (extraRowClasses) {
            if (typeof extraRowClasses === 'string') {
                classesList.push(extraRowClasses);
            } else if (Array.isArray(extraRowClasses)) {
                extraRowClasses.forEach(function(classItem) {
                    classesList.push(classItem);
                });
            }
        }
    }

    var classes = classesList.join(" ");

    eRow.className = classes;
};

RowRenderer.prototype.createRowContainer = function(rowIndex, node, groupRow) {
    var eRow = document.createElement("div");

    this.addClassesToRow(rowIndex, node, eRow);

    eRow.setAttribute("row", rowIndex);

    // if showing scrolls, position on the container
    if (!this.gridOptionsWrapper.isDontUseScrolls()) {
        eRow.style.top = (this.gridOptionsWrapper.getRowHeight() * rowIndex) + "px";
    }
    eRow.style.height = (this.gridOptionsWrapper.getRowHeight()) + "px";

    if (this.gridOptionsWrapper.getRowStyle()) {
        var cssToUse;
        var rowStyle = this.gridOptionsWrapper.getRowStyle();
        if (typeof rowStyle === 'function') {
            cssToUse = rowStyle(node.data, rowIndex, groupRow);
        } else {
            cssToUse = rowStyle;
        }

        if (cssToUse) {
            Object.keys(cssToUse).forEach(function(key) {
                eRow.style[key] = cssToUse[key];
            });
        }
    }

    if (!groupRow) {
        var _this = this;
        eRow.addEventListener("click", function(event) {
            _this.angularGrid.onRowClicked(event, Number(this.getAttribute("row")), node)
        });
    }

    return eRow;
};

RowRenderer.prototype.getIndexOfRenderedNode = function(node) {
    var renderedRows = this.renderedRows;
    var keys = Object.keys(renderedRows);
    for (var i = 0; i < keys.length; i++) {
        if (renderedRows[keys[i]].node === node) {
            return renderedRows[keys[i]].rowIndex;
        }
    }
    return -1;
};

RowRenderer.prototype.setCssClassForGroupCell = function(eGridGroupRow, footer, useEntireRow, firstColumnIndex) {
    if (useEntireRow) {
        if (footer) {
            eGridGroupRow.className = 'ag-footer-cell-entire-row';
        } else {
            eGridGroupRow.className = 'ag-group-cell-entire-row';
        }
    } else {
        if (footer) {
            eGridGroupRow.className = 'ag-footer-cell ag-cell cell-col-' + firstColumnIndex;
        } else {
            eGridGroupRow.className = 'ag-group-cell ag-cell cell-col-' + firstColumnIndex;
        }
    }
};

RowRenderer.prototype.createGroupElement = function(node, firstColumn, useEntireRow, padding, rowIndex, footer) {
    var eGridGroupRow = document.createElement('div');

    this.setCssClassForGroupCell(eGridGroupRow, footer, useEntireRow, firstColumn.index);

    var expandIconNeeded = !padding && !footer;
    if (expandIconNeeded) {
        this.addGroupExpandIcon(eGridGroupRow, node.expanded);
    }

    var checkboxNeeded = !padding && !footer && this.gridOptionsWrapper.isGroupCheckboxSelection();
    if (checkboxNeeded) {
        var eCheckbox = this.selectionRendererFactory.createSelectionCheckbox(node, rowIndex);
        eGridGroupRow.appendChild(eCheckbox);
    }

    // try user custom rendering first
    var useRenderer = typeof this.gridOptions.groupInnerCellRenderer === 'function';
    if (useRenderer) {
        var rendererParams = {
            data: node.data,
            node: node,
            padding: padding,
            gridOptions: this.gridOptions,
            context: this.gridOptionsWrapper.getContext()
        };
        utils.useRenderer(eGridGroupRow, this.gridOptions.groupInnerCellRenderer, rendererParams);
    } else {
        if (!padding) {
            if (footer) {
                this.createFooterCell(eGridGroupRow, node);
            } else {
                this.createGroupCell(eGridGroupRow, node);
            }
        }
    }

    if (!useEntireRow) {
        eGridGroupRow.style.width = utils.formatWidth(firstColumn.actualWidth);
    }

    // indent with the group level
    if (!padding) {
        // only do this if an indent - as this overwrites the padding that
        // the theme set, which will make things look 'not aligned' for the
        // first group level.
        if (node.footer || node.level > 0) {
            var paddingPx = node.level * 10;
            if (footer) {
                paddingPx += 10;
            }
            eGridGroupRow.style.paddingLeft = paddingPx + "px";
        }
    }

    var that = this;
    eGridGroupRow.addEventListener("click", function() {
        node.expanded = !node.expanded;
        that.angularGrid.updateModelAndRefresh(constants.STEP_MAP);
    });

    return eGridGroupRow;
};

// creates cell with 'Total {{key}}' for a group
RowRenderer.prototype.createFooterCell = function(eParent, node) {
    // if we are doing cell - then it makes sense to put in 'total', which is just a best guess,
    // that the user is going to want to say 'total'. typically i expect the user to override
    // how this cell is rendered
    var textToDisplay;
    if (this.gridOptionsWrapper.isGroupUseEntireRow()) {
        textToDisplay = "Group footer - you should provide a custom groupInnerCellRenderer to render what makes sense for you"
    } else {
        textToDisplay = "Total " + node.key;
    }
    var eText = document.createTextNode(textToDisplay);
    eParent.appendChild(eText);
};

// creates cell with '{{key}} ({{childCount}})' for a group
RowRenderer.prototype.createGroupCell = function(eParent, node) {
    var textToDisplay = " " + node.key;
    // only include the child count if it's included, eg if user doing custom aggregation,
    // then this could be left out, or set to -1, ie no child count
    if (node.allChildrenCount >= 0) {
        textToDisplay += " (" + node.allChildrenCount + ")";
    }
    var eText = document.createTextNode(textToDisplay);
    eParent.appendChild(eText);
};

RowRenderer.prototype.addGroupExpandIcon = function(eGridGroupRow, expanded) {
    var eGroupIcon;
    if (expanded) {
        eGroupIcon = utils.createIcon('groupExpanded', this.gridOptionsWrapper, null, svgFactory.createArrowDownSvg);
    } else {
        eGroupIcon = utils.createIcon('groupContracted', this.gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
    }

    eGridGroupRow.appendChild(eGroupIcon);
};

RowRenderer.prototype.putDataIntoCell = function(colDef, value, node, $childScope, eGridCell, rowIndex) {
    if (colDef.cellRenderer) {
        var rendererParams = {
            value: value,
            data: node.data,
            node: node,
            colDef: colDef,
            $scope: $childScope,
            rowIndex: rowIndex,
            gridOptions: this.gridOptionsWrapper.getGridOptions(),
            context: this.gridOptionsWrapper.getContext()
        };
        var resultFromRenderer = colDef.cellRenderer(rendererParams);
        if (utils.isNode(resultFromRenderer) || utils.isElement(resultFromRenderer)) {
            // a dom node or element was returned, so add child
            eGridCell.appendChild(resultFromRenderer);
        } else {
            // otherwise assume it was html, so just insert
            eGridCell.innerHTML = resultFromRenderer;
        }
    } else {
        // if we insert undefined, then it displays as the string 'undefined', ugly!
        if (value !== undefined && value !== null && value !== '') {
            eGridCell.innerHTML = value;
        }
    }
};

RowRenderer.prototype.createCell = function(isFirstColumn, column, value, node, rowIndex, $childScope) {
    var that = this;
    var eGridCell = document.createElement("div");
    eGridCell.setAttribute("col", column.index);

    // set class, only include ag-group-cell if it's a group cell
    var classes = ['ag-cell', 'cell-col-' + column.index];
    if (node.group) {
        if (node.footer) {
            classes.push('ag-footer-cell');
        } else {
            classes.push('ag-group-cell');
        }
    }
    eGridCell.className = classes.join(' ');

    var eCellWrapper = document.createElement('span');
    eGridCell.appendChild(eCellWrapper);

    // see if we need a padding box
    if (isFirstColumn && (node.parent)) {
        var pixelsToIndent = 20 + (node.parent.level * 10);
        eCellWrapper.style['padding-left'] = pixelsToIndent + 'px';
    }

    var colDef = column.colDef;
    if (colDef.checkboxSelection) {
        var eCheckbox = this.selectionRendererFactory.createSelectionCheckbox(node, rowIndex);
        eCellWrapper.appendChild(eCheckbox);
    }

    var eSpanWithValue = document.createElement("span");
    eCellWrapper.appendChild(eSpanWithValue);
    this.putDataIntoCell(colDef, value, node, $childScope, eSpanWithValue, rowIndex);

    if (colDef.cellStyle) {
        var cssToUse;
        if (typeof colDef.cellStyle === 'function') {
            var cellStyleParams = {
                value: value,
                data: node.data,
                node: node,
                colDef: colDef,
                $scope: $childScope,
                context: this.gridOptionsWrapper.getContext(),
                gridOptions: this.gridOptionsWrapper.getGridOptions()
            };
            cssToUse = colDef.cellStyle(cellStyleParams);
        } else {
            cssToUse = colDef.cellStyle;
        }

        if (cssToUse) {
            Object.keys(cssToUse).forEach(function(key) {
                eGridCell.style[key] = cssToUse[key];
            });
        }
    }

    if (colDef.cellClass) {
        var classToUse;
        if (typeof colDef.cellClass === 'function') {
            var cellClassParams = {
                value: value,
                data: node.data,
                node: node,
                colDef: colDef,
                $scope: $childScope,
                context: this.gridOptionsWrapper.getContext(),
                gridOptions: this.gridOptionsWrapper.getGridOptions()
            };
            classToUse = colDef.cellClass(cellClassParams);
        } else {
            classToUse = colDef.cellClass;
        }

        if (typeof classToUse === 'string') {
            utils.addCssClass(eGridCell, classToUse);
        } else if (Array.isArray(classToUse)) {
            classToUse.forEach(function(cssClassItem) {
                utils.addCssClass(eGridCell, cssClassItem);
            });
        }
    }

    this.addCellClickedHandler(eGridCell, node, column, value, rowIndex);
    this.addCellDoubleClickedHandler(eGridCell, node, column, value, rowIndex, $childScope);

    eGridCell.style.width = utils.formatWidth(column.actualWidth);

    // add the 'start editing' call to the chain of editors
    this.renderedRowStartEditingListeners[rowIndex][column.index] = function() {
        if (that.isCellEditable(colDef, node)) {
            that.startEditing(eGridCell, column, node, $childScope, rowIndex);
            return true;
        } else {
            return false;
        }
    };

    return eGridCell;
};

RowRenderer.prototype.addCellDoubleClickedHandler = function(eGridCell, node, column, value, rowIndex, $childScope) {
    var that = this;
    var colDef = column.colDef;
    eGridCell.addEventListener("dblclick", function(event) {
        if (that.gridOptionsWrapper.getCellDoubleClicked()) {
            var paramsForGrid = {
                node: node,
                data: node.data,
                value: value,
                rowIndex: rowIndex,
                colDef: colDef,
                event: event,
                eventSource: this,
                gridOptions: that.gridOptionsWrapper.getGridOptions()
            };
            that.gridOptionsWrapper.getCellDoubleClicked()(paramsForGrid);
        }
        if (colDef.cellDoubleClicked) {
            var paramsForColDef = {
                node: node,
                data: node.data,
                value: value,
                rowIndex: rowIndex,
                colDef: colDef,
                event: event,
                eventSource: this,
                gridOptions: that.gridOptionsWrapper.getGridOptions()
            };
            colDef.cellDoubleClicked(paramsForColDef);
        }
        if (that.isCellEditable(colDef, node)) {
            that.startEditing(eGridCell, column, node, $childScope, rowIndex);
        }
    });
};

RowRenderer.prototype.addCellClickedHandler = function(eGridCell, node, colDefWrapper, value, rowIndex) {
    var that = this;
    var colDef = colDefWrapper.colDef;
    eGridCell.addEventListener("click", function(event) {
        if (that.gridOptionsWrapper.getCellClicked()) {
            var paramsForGrid = {
                node: node,
                data: node.data,
                value: value,
                rowIndex: rowIndex,
                colDef: colDef,
                event: event,
                eventSource: this,
                gridOptions: that.gridOptionsWrapper.getGridOptions()
            };
            that.gridOptionsWrapper.getCellClicked()(paramsForGrid);
        }
        if (colDef.cellClicked) {
            var paramsForColDef = {
                node: node,
                data: node.data,
                value: value,
                rowIndex: rowIndex,
                colDef: colDef,
                event: event,
                eventSource: this,
                gridOptions: that.gridOptionsWrapper.getGridOptions()
            };
            colDef.cellClicked(paramsForColDef);
        }
    });
};

RowRenderer.prototype.isCellEditable = function(colDef, node) {
    if (this.editingCell) {
        return false;
    }

    // never allow editing of groups
    if (node.group) {
        return false;
    }

    // if boolean set, then just use it
    if (typeof colDef.editable === 'boolean') {
        return colDef.editable;
    }

    // if function, then call the function to find out
    if (typeof colDef.editable === 'function') {
        // should change this, so it gets passed params with nice useful values
        return colDef.editable(node.data);
    }

    return false;
};

RowRenderer.prototype.stopEditing = function(eGridCell, colDef, node, $childScope, eInput, blurListener, rowIndex) {
    this.editingCell = false;
    var newValue = eInput.value;

    //If we don't remove the blur listener first, we get:
    //Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is no longer a child of this node. Perhaps it was moved in a 'blur' event handler?
    eInput.removeEventListener('blur', blurListener);

    utils.removeAllChildren(eGridCell);

    var paramsForCallbacks = {
        node: node,
        data: node.data,
        oldValue: node.data[colDef.field],
        newValue: newValue,
        rowIndex: rowIndex,
        colDef: colDef,
        context: this.gridOptionsWrapper.getContext(),
        gridOptions: this.gridOptionsWrapper.getGridOptions()
    };

    if (colDef.newValueHandler) {
        colDef.newValueHandler(paramsForCallbacks);
    } else {
        node.data[colDef.field] = newValue;
    }

    // at this point, the value has been updated
    paramsForCallbacks.newValue = node.data[colDef.field];
    if (typeof colDef.cellValueChanged === 'function') {
        colDef.cellValueChanged(paramsForCallbacks);
    }

    var value = node.data[colDef.field];
    this.putDataIntoCell(colDef, value, node, $childScope, eGridCell);
};

RowRenderer.prototype.startEditing = function(eGridCell, column, node, $childScope, rowIndex) {
    var that = this;
    var colDef = column.colDef;
    this.editingCell = true;
    utils.removeAllChildren(eGridCell);
    var eInput = document.createElement('input');
    eInput.type = 'text';
    utils.addCssClass(eInput, 'ag-cell-edit-input');

    var value = node.data[colDef.field];
    if (value !== null && value !== undefined) {
        eInput.value = value;
    }

    eInput.style.width = (column.actualWidth - 14) + 'px';
    eGridCell.appendChild(eInput);
    eInput.focus();
    eInput.select();

    var blurListener = function() {
        that.stopEditing(eGridCell, colDef, node, $childScope, eInput, blurListener, rowIndex);
    };

    //stop entering if we loose focus
    eInput.addEventListener("blur", blurListener);

    //stop editing if enter pressed
    eInput.addEventListener('keypress', function(event) {
        var key = event.which || event.keyCode;
        // 13 is enter
        if (key == ENTER_KEY) {
            that.stopEditing(eGridCell, colDef, node, $childScope, eInput, blurListener, rowIndex);
        }
    });

    // tab key doesn't generate keypress, so need keydown to listen for that
    eInput.addEventListener('keydown', function(event) {
        var key = event.which || event.keyCode;
        if (key == TAB_KEY) {
            that.stopEditing(eGridCell, colDef, node, $childScope, eInput, blurListener, rowIndex);
            that.startEditingNextCell(rowIndex, column, event.shiftKey);
            // we don't want the default tab action, so return false, this stops the event from bubbling
            event.preventDefault();
            return false;
        }
    });
};

RowRenderer.prototype.startEditingNextCell = function(rowIndex, column, shiftKey) {

    var firstRowToCheck = this.firstVirtualRenderedRow;
    var lastRowToCheck = this.lastVirtualRenderedRow;
    var currentRowIndex = rowIndex;

    var visibleColumns = this.columnModel.getVisibleColumns();
    var currentCol = column;

    while (true) {

        var indexOfCurrentCol = visibleColumns.indexOf(currentCol);

        // move backward
        if (shiftKey) {
            // move along to the previous cell
            currentCol = visibleColumns[indexOfCurrentCol - 1];
            // check if end of the row, and if so, go back a row
            if (!currentCol) {
                currentCol = visibleColumns[visibleColumns.length - 1];
                currentRowIndex--;
            }

            // if got to end of rendered rows, then quit looking
            if (currentRowIndex < firstRowToCheck) {
                return;
            }
            // move forward
        } else {
            // move along to the next cell
            currentCol = visibleColumns[indexOfCurrentCol + 1];
            // check if end of the row, and if so, go forward a row
            if (!currentCol) {
                currentCol = visibleColumns[0];
                currentRowIndex++;
            }

            // if got to end of rendered rows, then quit looking
            if (currentRowIndex > lastRowToCheck) {
                return;
            }
        }

        var nextFunc = this.renderedRowStartEditingListeners[currentRowIndex][currentCol.colKey];
        if (nextFunc) {
            // see if the next cell is editable, and if so, we have come to
            // the end of our search, so stop looking for the next cell
            var nextCellAcceptedEdit = nextFunc();
            if (nextCellAcceptedEdit) {
                return;
            }
        }
    }

};

module.exports = RowRenderer;

},{"./constants":3,"./svgFactory":21,"./utils":24}],19:[function(require,module,exports){
var utils = require('./utils');

// these constants are used for determining if groups should
// be selected or deselected when selecting groups, and the group
// then selects the children.
var SELECTED = 0;
var UNSELECTED = 1;
var MIXED = 2;
var DO_NOT_CARE = 3;

function SelectionController() {}

SelectionController.prototype.init = function(angularGrid, eRowsParent, gridOptionsWrapper, $scope, rowRenderer) {
    this.eRowsParent = eRowsParent;
    this.angularGrid = angularGrid;
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.$scope = $scope;
    this.rowRenderer = rowRenderer;

    this.selectedNodesById = {};
    this.selectedRows = [];

    gridOptionsWrapper.setSelectedRows(this.selectedRows);
    gridOptionsWrapper.setSelectedNodesById(this.selectedNodesById);
};

SelectionController.prototype.getSelectedNodes = function() {
    var selectedNodes = [];
    var keys = Object.keys(this.selectedNodesById);
    for (var i = 0; i < keys.length; i++) {
        var id = keys[i];
        var selectedNode = this.selectedNodesById[id];
        selectedNodes.push(selectedNode);
    }
    return selectedNodes;
};

// returns a list of all nodes at 'best cost' - a feature to be used
// with groups / trees. if a group has all it's children selected,
// then the group appears in the result, but not the children.
// Designed for use with 'children' as the group selection type,
// where groups don't actually appear in the selection normally.
SelectionController.prototype.getBestCostNodeSelection = function() {

    var topLevelNodes = this.rowModel.getTopLevelNodes();

    var result = [];
    var that = this;

    // recursive function, to find the selected nodes
    function traverse(nodes) {
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            if (that.isNodeSelected(node)) {
                result.push(node);
            } else {
                // if not selected, then if it's a group, and the group
                // has children, continue to search for selections
                if (node.group && node.children) {
                    traverse(node.children);
                }
            }
        }
    }

    traverse(topLevelNodes);

    return result;
};

SelectionController.prototype.setRowModel = function(rowModel) {
    this.rowModel = rowModel;
};

// public - this clears the selection, but doesn't clear down the css - when it is called, the
// caller then gets the grid to refresh.
SelectionController.prototype.clearSelection = function() {
    this.selectedRows.length = 0;
    var keys = Object.keys(this.selectedNodesById);
    for (var i = 0; i < keys.length; i++) {
        delete this.selectedNodesById[keys[i]];
    }
};

// public
SelectionController.prototype.selectNode = function(node, tryMulti, suppressEvents) {
    var multiSelect = this.gridOptionsWrapper.isRowSelectionMulti() && tryMulti;

    // if the node is a group, then selecting this is the same as selecting the parent,
    // so to have only one flow through the below, we always select the header parent
    // (which then has the side effect of selecting the child).
    var nodeToSelect;
    if (node.footer) {
        nodeToSelect = node.sibling;
    } else {
        nodeToSelect = node;
    }

    // at the end, if this is true, we inform the callback
    var atLeastOneItemUnselected = false;
    var atLeastOneItemSelected = false;

    // see if rows to be deselected
    if (!multiSelect) {
        atLeastOneItemUnselected = this.doWorkOfDeselectAllNodes();
    }

    if (this.gridOptionsWrapper.isGroupCheckboxSelectionChildren() && nodeToSelect.group) {
        // don't select the group, select the children instead
        atLeastOneItemSelected = this.recursivelySelectAllChildren(nodeToSelect);
    } else {
        // see if row needs to be selected
        atLeastOneItemSelected = this.doWorkOfSelectNode(nodeToSelect, suppressEvents);
    }

    if (atLeastOneItemUnselected || atLeastOneItemSelected) {
        this.syncSelectedRowsAndCallListener(suppressEvents);
    }

    this.updateGroupParentsIfNeeded();
};

SelectionController.prototype.recursivelySelectAllChildren = function(node, suppressEvents) {
    var atLeastOne = false;
    if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
            var child = node.children[i];
            if (child.group) {
                if (this.recursivelySelectAllChildren(child)) {
                    atLeastOne = true;
                }
            } else {
                if (this.doWorkOfSelectNode(child, suppressEvents)) {
                    atLeastOne = true;
                }
            }
        }
    }
    return atLeastOne;
};

SelectionController.prototype.recursivelyDeselectAllChildren = function(node) {
    if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
            var child = node.children[i];
            if (child.group) {
                this.recursivelyDeselectAllChildren(child);
            } else {
                this.deselectRealNode(child);
            }
        }
    }
};

// private
// 1 - selects a node
// 2 - updates the UI
// 3 - calls callbacks
SelectionController.prototype.doWorkOfSelectNode = function(node, suppressEvents) {
    if (this.selectedNodesById[node.id]) {
        return false;
    }

    this.selectedNodesById[node.id] = node;

    this.addCssClassForNode_andInformVirtualRowListener(node);

    // also color in the footer if there is one
    if (node.group && node.expanded && node.sibling) {
        this.addCssClassForNode_andInformVirtualRowListener(node.sibling);
    }

    // inform the rowSelected listener, if any
    if (!suppressEvents && typeof this.gridOptionsWrapper.getRowSelected() === "function") {
        this.gridOptionsWrapper.getRowSelected()(node.data, node);
    }

    return true;
};

// private
// 1 - selects a node
// 2 - updates the UI
// 3 - calls callbacks
// wow - what a big name for a method, exception case, it's saying what the method does
SelectionController.prototype.addCssClassForNode_andInformVirtualRowListener = function(node) {
    var virtualRenderedRowIndex = this.rowRenderer.getIndexOfRenderedNode(node);
    if (virtualRenderedRowIndex >= 0) {
        utils.querySelectorAll_addCssClass(this.eRowsParent, '[row="' + virtualRenderedRowIndex + '"]', 'ag-row-selected');

        // inform virtual row listener
        this.angularGrid.onVirtualRowSelected(virtualRenderedRowIndex, true);
    }
};

// private
// 1 - un-selects a node
// 2 - updates the UI
// 3 - calls callbacks
SelectionController.prototype.doWorkOfDeselectAllNodes = function(nodeToKeepSelected) {
    // not doing multi-select, so deselect everything other than the 'just selected' row
    var atLeastOneSelectionChange;
    var selectedNodeKeys = Object.keys(this.selectedNodesById);
    for (var i = 0; i < selectedNodeKeys.length; i++) {
        // skip the 'just selected' row
        var key = selectedNodeKeys[i];
        var nodeToDeselect = this.selectedNodesById[key];
        if (nodeToDeselect === nodeToKeepSelected) {
            continue;
        } else {
            this.deselectRealNode(nodeToDeselect);
            atLeastOneSelectionChange = true;
        }
    }
    return atLeastOneSelectionChange;
};

// private
SelectionController.prototype.deselectRealNode = function(node) {
    // deselect the css
    this.removeCssClassForNode(node);

    // if node is a header, and if it has a sibling footer, deselect the footer also
    if (node.group && node.expanded && node.sibling) { // also check that it's expanded, as sibling could be a ghost
        this.removeCssClassForNode(node.sibling);
    }

    // remove the row
    delete this.selectedNodesById[node.id];
};

// private
SelectionController.prototype.removeCssClassForNode = function(node) {
    var virtualRenderedRowIndex = this.rowRenderer.getIndexOfRenderedNode(node);
    if (virtualRenderedRowIndex >= 0) {
        utils.querySelectorAll_removeCssClass(this.eRowsParent, '[row="' + virtualRenderedRowIndex + '"]', 'ag-row-selected');
        // inform virtual row listener
        this.angularGrid.onVirtualRowSelected(virtualRenderedRowIndex, false);
    }
};

// public (selectionRendererFactory)
SelectionController.prototype.deselectIndex = function(rowIndex) {
    var node = this.rowModel.getVirtualRow(rowIndex);
    this.deselectNode(node);
};

// public (api)
SelectionController.prototype.deselectNode = function(node) {
    if (node) {
        if (this.gridOptionsWrapper.isGroupCheckboxSelectionChildren() && node.group) {
            // want to deselect children, not this node, so recursively deselect
            this.recursivelyDeselectAllChildren(node);
        } else {
            this.deselectRealNode(node);
        }
    }
    this.syncSelectedRowsAndCallListener();
    this.updateGroupParentsIfNeeded();
};

// public (selectionRendererFactory & api)
SelectionController.prototype.selectIndex = function(index, tryMulti, suppressEvents) {
    var node = this.rowModel.getVirtualRow(index);
    this.selectNode(node, tryMulti, suppressEvents);
};

// private
// updates the selectedRows with the selectedNodes and calls selectionChanged listener
SelectionController.prototype.syncSelectedRowsAndCallListener = function(suppressEvents) {
    // update selected rows
    var selectedRows = this.selectedRows;
    // clear selected rows
    selectedRows.length = 0;
    var keys = Object.keys(this.selectedNodesById);
    for (var i = 0; i < keys.length; i++) {
        if (this.selectedNodesById[keys[i]] !== undefined) {
            var selectedNode = this.selectedNodesById[keys[i]];
            selectedRows.push(selectedNode.data);
        }
    }

    if (!suppressEvents && typeof this.gridOptionsWrapper.getSelectionChanged() === "function") {
        this.gridOptionsWrapper.getSelectionChanged()();
    }

    var that = this;
    setTimeout(function() {
        that.$scope.$apply();
    }, 0);
};

// private
SelectionController.prototype.recursivelyCheckIfSelected = function(node) {
    var foundSelected = false;
    var foundUnselected = false;

    if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
            var child = node.children[i];
            var result;
            if (child.group) {
                result = this.recursivelyCheckIfSelected(child);
                switch (result) {
                    case SELECTED:
                        foundSelected = true;
                        break;
                    case UNSELECTED:
                        foundUnselected = true;
                        break;
                    case MIXED:
                        foundSelected = true;
                        foundUnselected = true;
                        break;
                        // we can ignore the DO_NOT_CARE, as it doesn't impact, means the child
                        // has no children and shouldn't be considered when deciding
                }
            } else {
                if (this.isNodeSelected(child)) {
                    foundSelected = true;
                } else {
                    foundUnselected = true;
                }
            }

            if (foundSelected && foundUnselected) {
                // if mixed, then no need to go further, just return up the chain
                return MIXED;
            }
        }
    }

    // got this far, so no conflicts, either all children selected, unselected, or neither
    if (foundSelected) {
        return SELECTED;
    } else if (foundUnselected) {
        return UNSELECTED;
    } else {
        return DO_NOT_CARE;
    }
};

// public (selectionRendererFactory)
// returns:
// true: if selected
// false: if unselected
// undefined: if it's a group and 'children selection' is used and 'children' are a mix of selected and unselected
SelectionController.prototype.isNodeSelected = function(node) {
    if (this.gridOptionsWrapper.isGroupCheckboxSelectionChildren() && node.group) {
        // doing child selection, we need to traverse the children
        var resultOfChildren = this.recursivelyCheckIfSelected(node);
        switch (resultOfChildren) {
            case SELECTED:
                return true;
            case UNSELECTED:
                return false;
            default:
                return undefined;
        }
    } else {
        return this.selectedNodesById[node.id] !== undefined;
    }
};

SelectionController.prototype.updateGroupParentsIfNeeded = function() {
    // we only do this if parent nodes are responsible
    // for selecting their children.
    if (!this.gridOptionsWrapper.isGroupCheckboxSelectionChildren()) {
        return;
    }

    var firstRow = this.rowRenderer.getFirstVirtualRenderedRow();
    var lastRow = this.rowRenderer.getLastVirtualRenderedRow();
    for (var rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
        // see if node is a group
        var node = this.rowModel.getVirtualRow(rowIndex);
        if (node.group) {
            var selected = this.isNodeSelected(node);
            this.angularGrid.onVirtualRowSelected(rowIndex, selected);

            if (selected) {
                utils.querySelectorAll_addCssClass(this.eRowsParent, '[row="' + rowIndex + '"]', 'ag-row-selected');
            } else {
                utils.querySelectorAll_removeCssClass(this.eRowsParent, '[row="' + rowIndex + '"]', 'ag-row-selected');
            }
        }
    }
};

module.exports = SelectionController;

},{"./utils":24}],20:[function(require,module,exports){
function SelectionRendererFactory() {}

SelectionRendererFactory.prototype.init = function(angularGrid, selectionController) {
    this.angularGrid = angularGrid;
    this.selectionController = selectionController;
};

SelectionRendererFactory.prototype.createCheckboxColDef = function() {
    return {
        width: 30,
        suppressMenu: true,
        suppressSorting: true,
        headerCellRenderer: function() {
            var eCheckbox = document.createElement('input');
            eCheckbox.type = 'checkbox';
            eCheckbox.name = 'name';
            return eCheckbox;
        },
        cellRenderer: this.createCheckboxRenderer()
    };
};

SelectionRendererFactory.prototype.createCheckboxRenderer = function() {
    var that = this;
    return function(params) {
        return that.createSelectionCheckbox(params.node, params.rowIndex);
    };
};

SelectionRendererFactory.prototype.createSelectionCheckbox = function(node, rowIndex) {

    var eCheckbox = document.createElement('input');
    eCheckbox.type = "checkbox";
    eCheckbox.name = "name";
    eCheckbox.className = 'ag-selection-checkbox';
    setCheckboxState(eCheckbox, this.selectionController.isNodeSelected(node));

    var that = this;
    eCheckbox.onclick = function(event) {
        event.stopPropagation();
    };

    eCheckbox.onchange = function() {
        var newValue = eCheckbox.checked;
        if (newValue) {
            that.selectionController.selectIndex(rowIndex, true);
        } else {
            that.selectionController.deselectIndex(rowIndex);
        }
    };

    this.angularGrid.addVirtualRowListener(rowIndex, {
        rowSelected: function(selected) {
            setCheckboxState(eCheckbox, selected);
        },
        rowRemoved: function() {}
    });

    return eCheckbox;
};

function setCheckboxState(eCheckbox, state) {
    if (typeof state === 'boolean') {
        eCheckbox.checked = state;
        eCheckbox.indeterminate = false;
    } else {
        // isNodeSelected returns back undefined if it's a group and the children
        // are a mix of selected and unselected
        eCheckbox.indeterminate = true;
    }
}

module.exports = SelectionRendererFactory;

},{}],21:[function(require,module,exports){
var SVG_NS = "http://www.w3.org/2000/svg";

function SvgFactory() {}

SvgFactory.prototype.createFilterSvg = function() {
    var eSvg = createIconSvg();

    var eFunnel = document.createElementNS(SVG_NS, "polygon");
    eFunnel.setAttribute("points", "0,0 4,4 4,10 6,10 6,4 10,0");
    eFunnel.setAttribute("class", "ag-header-icon");
    eSvg.appendChild(eFunnel);

    return eSvg;
};

SvgFactory.prototype.createMenuSvg = function() {
    var eSvg = document.createElementNS(SVG_NS, "svg");
    var size = "12";
    eSvg.setAttribute("width", size);
    eSvg.setAttribute("height", size);

    ["0", "5", "10"].forEach(function(y) {
        var eLine = document.createElementNS(SVG_NS, "rect");
        eLine.setAttribute("y", y);
        eLine.setAttribute("width", size);
        eLine.setAttribute("height", "2");
        eLine.setAttribute("class", "ag-header-icon");
        eSvg.appendChild(eLine);
    });

    return eSvg;
};

SvgFactory.prototype.createArrowUpSvg = function() {
    return createPolygonSvg("0,10 5,0 10,10");
};

SvgFactory.prototype.createArrowLeftSvg = function() {
    return createPolygonSvg("10,0 0,5 10,10");
};

SvgFactory.prototype.createArrowDownSvg = function() {
    return createPolygonSvg("0,0 5,10 10,0");
};

SvgFactory.prototype.createArrowRightSvg = function() {
    return createPolygonSvg("0,0 10,5 0,10");
};

function createPolygonSvg(points) {
    var eSvg = createIconSvg();

    var eDescIcon = document.createElementNS(SVG_NS, "polygon");
    eDescIcon.setAttribute("points", points);
    eSvg.appendChild(eDescIcon);

    return eSvg;
}

// util function for the above
function createIconSvg() {
    var eSvg = document.createElementNS(SVG_NS, "svg");
    eSvg.setAttribute("width", "10");
    eSvg.setAttribute("height", "10");
    return eSvg;
}

module.exports = SvgFactory;

},{}],22:[function(require,module,exports){
var template = [
    '<div class="ag-root ag-scrolls">',
    '    <!-- The loading panel -->',
    '    <!-- wrapping in outer div, and wrapper, is needed to center the loading icon -->',
    '    <!-- The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/ -->',
    '    <div class="ag-loading-panel">',
    '        <div class="ag-loading-wrapper">',
    '            <span class="ag-loading-center">Loading...</span>',
    '        </div>',
    '    </div>',
    '    <!-- header -->',
    '    <div class="ag-header">',
    '        <div class="ag-pinned-header"></div><div class="ag-header-viewport"><div class="ag-header-container"></div></div>',
    '    </div>',
    '    <!-- body -->',
    '    <div class="ag-body">',
    '        <div class="ag-pinned-cols-viewport">',
    '            <div class="ag-pinned-cols-container"></div>',
    '        </div>',
    '        <div class="ag-body-viewport-wrapper">',
    '            <div class="ag-body-viewport">',
    '                <div class="ag-body-container"></div>',
    '            </div>',
    '        </div>',
    '    </div>',
    '    <!-- Paging -->',
    '    <div class="ag-paging-panel">',
    '    </div>',
    '    </div>'
].join('');

module.exports = template;

},{}],23:[function(require,module,exports){
var template = [
    '<div class="ag-root ag-no-scrolls">',
    '    <!-- See comment in template.html for why loading is laid out like so -->',
    '    <div class="ag-loading-panel">',
    '        <div class="ag-loading-wrapper">',
    '            <span class="ag-loading-center">Loading...</span>',
    '        </div>',
    '    </div>',
    '    <!-- header -->',
    '    <div class="ag-header-container"></div>',
    '    <!-- body -->',
    '    <div class="ag-body-container"></div>',
    '</div>'
].join('');


module.exports = template;

},{}],24:[function(require,module,exports){
function Utils() {}

//Returns true if it is a DOM node
//taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
Utils.prototype.isNode = function(o) {
    return (
        typeof Node === "object" ? o instanceof Node :
        o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
    );
};

//Returns true if it is a DOM element
//taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
Utils.prototype.isElement = function(o) {
    return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
    );
};

Utils.prototype.isNodeOrElement = function(o) {
    return this.isNode(o) || this.isElement(o);
};

//adds all type of change listeners to an element, intended to be a text field
Utils.prototype.addChangeListener = function(element, listener) {
    element.addEventListener("changed", listener);
    element.addEventListener("paste", listener);
    element.addEventListener("input", listener);
};

//if value is undefined, null or blank, returns null, otherwise returns the value
Utils.prototype.makeNull = function(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    } else {
        return value;
    }
};

Utils.prototype.removeAllChildren = function(node) {
    if (node) {
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }
    }
};

//adds an element to a div, but also adds a background checking for clicks,
//so that when the background is clicked, the child is removed again, giving
//a model look to popups.
Utils.prototype.addAsModalPopup = function(eParent, eChild) {
    var eBackdrop = document.createElement("div");
    eBackdrop.className = "ag-popup-backdrop";

    eBackdrop.onclick = function() {
        eParent.removeChild(eChild);
        eParent.removeChild(eBackdrop);
    };

    eParent.appendChild(eBackdrop);
    eParent.appendChild(eChild);
};

//loads the template and returns it as an element. makes up for no simple way in
//the dom api to load html directly, eg we cannot do this: document.createElement(template)
Utils.prototype.loadTemplate = function(template) {
    var tempDiv = document.createElement("div");
    tempDiv.innerHTML = template;
    return tempDiv.firstChild;
};

//if passed '42px' then returns the number 42
Utils.prototype.pixelStringToNumber = function(val) {
    if (typeof val === "string") {
        if (val.indexOf("px") >= 0) {
            val.replace("px", "");
        }
        return parseInt(val);
    } else {
        return val;
    }
};

Utils.prototype.querySelectorAll_addCssClass = function(eParent, selector, cssClass) {
    var eRows = eParent.querySelectorAll(selector);
    for (var k = 0; k < eRows.length; k++) {
        this.addCssClass(eRows[k], cssClass);
    }
};

Utils.prototype.querySelectorAll_removeCssClass = function(eParent, selector, cssClass) {
    var eRows = eParent.querySelectorAll(selector);
    for (var k = 0; k < eRows.length; k++) {
        this.removeCssClass(eRows[k], cssClass);
    }
};

Utils.prototype.addCssClass = function(element, className) {
    var oldClasses = element.className;
    if (oldClasses) {
        if (oldClasses.indexOf(className) >= 0) {
            return;
        }
        element.className = oldClasses + " " + className;
    } else {
        element.className = className;
    }
};

Utils.prototype.removeCssClass = function(element, className) {
    var oldClasses = element.className;
    if (oldClasses.indexOf(className) < 0) {
        return;
    }
    var newClasses = oldClasses.replace(" " + className, "");
    newClasses = newClasses.replace(className + " ", "");
    if (newClasses == className) {
        newClasses = "";
    }
    element.className = newClasses;
};

Utils.prototype.removeFromArray = function(array, object) {
    array.splice(array.indexOf(object), 1);
};

Utils.prototype.defaultComparator = function(valueA, valueB) {
    var valueAMissing = valueA === null || valueA === undefined;
    var valueBMissing = valueB === null || valueB === undefined;
    if (valueAMissing && valueBMissing) {
        return 0;
    }
    if (valueAMissing) {
        return -1;
    }
    if (valueBMissing) {
        return 1;
    }

    if (valueA < valueB) {
        return -1;
    } else if (valueA > valueB) {
        return 1;
    } else {
        return 0;
    }
};

Utils.prototype.formatWidth = function(width) {
    if (typeof width === "number") {
        return width + "px";
    } else {
        return width;
    }
};

// tries to use the provided renderer. if a renderer found, returns true.
// if no renderer, returns false.
Utils.prototype.useRenderer = function(eParent, eRenderer, params) {
    var resultFromRenderer = eRenderer(params);
    if (this.isNode(resultFromRenderer) || this.isElement(resultFromRenderer)) {
        //a dom node or element was returned, so add child
        eParent.appendChild(resultFromRenderer);
    } else {
        //otherwise assume it was html, so just insert
        var eTextSpan = document.createElement('span');
        eTextSpan.innerHTML = resultFromRenderer;
        eParent.appendChild(eTextSpan);
    }
};

// if icon provided, use this (either a string, or a function callback).
// if not, then use the second parameter, which is the svgFactory function
Utils.prototype.createIcon = function(iconName, gridOptionsWrapper, colDefWrapper, svgFactoryFunc) {
    var eResult = document.createElement('span');
    var userProvidedIcon;
    // check col for icon first
    if (colDefWrapper && colDefWrapper.colDef.icons) {
        userProvidedIcon = colDefWrapper.colDef.icons[iconName];
    }
    // it not in col, try grid options
    if (!userProvidedIcon && gridOptionsWrapper.getIcons()) {
        userProvidedIcon = gridOptionsWrapper.getIcons()[iconName];
    }
    // now if user provided, use it
    if (userProvidedIcon) {
        var rendererResult;
        if (typeof userProvidedIcon === 'function') {
            rendererResult = userProvidedIcon();
        } else if (typeof userProvidedIcon === 'string') {
            rendererResult = userProvidedIcon;
        } else {
            throw 'icon from grid options needs to be a string or a function';
        }
        if (typeof rendererResult === 'string') {
            eResult.innerHTML = rendererResult;
        } else if (this.isNodeOrElement(rendererResult)) {
            eResult.appendChild(rendererResult);
        } else {
            throw 'iconRenderer should return back a string or a dom object';
        }
    } else {
        // otherwise we use the built in icon
        eResult.appendChild(svgFactoryFunc());
    }
    return eResult;
};

module.exports = new Utils();

},{}],25:[function(require,module,exports){
/*
 * This row controller is used for infinite scrolling only. For normal 'in memory' table,
 * or standard pagination, the inMemoryRowController is used.
 */

var logging = true;

function VirtualPageRowController() {}

VirtualPageRowController.prototype.init = function(rowRenderer) {
    this.rowRenderer = rowRenderer;
    this.datasourceVersion = 0;
};

VirtualPageRowController.prototype.setDatasource = function(datasource) {
    this.datasource = datasource;

    if (!datasource) {
        // only continue if we have a valid datasource to working with
        return;
    }

    this.reset();
};

VirtualPageRowController.prototype.reset = function() {
    // see if datasource knows how many rows there are
    if (typeof this.datasource.rowCount === 'number' && this.datasource.rowCount >= 0) {
        this.virtualRowCount = this.datasource.rowCount;
        this.foundMaxRow = true;
    } else {
        this.virtualRowCount = 0;
        this.foundMaxRow = false;
    }

    // in case any daemon requests coming from datasource, we know it ignore them
    this.datasourceVersion++;

    // map of page numbers to rows in that page
    this.pageCache = {};
    this.pageCacheSize = 0;

    // if a number is in this array, it means we are pending a load from it
    this.pageLoadsInProgress = [];
    this.pageLoadsQueued = [];
    this.pageAccessTimes = {}; // keeps a record of when each page was last viewed, used for LRU cache
    this.accessTime = 0; // rather than using the clock, we use this counter

    // the number of concurrent loads we are allowed to the server
    if (typeof this.datasource.maxConcurrentRequests === 'number' && this.datasource.maxConcurrentRequests > 0) {
        this.maxConcurrentDatasourceRequests = this.datasource.maxConcurrentRequests;
    } else {
        this.maxConcurrentDatasourceRequests = 2;
    }

    // the number of pages to keep in browser cache
    if (typeof this.datasource.maxPagesInCache === 'number' && this.datasource.maxPagesInCache > 0) {
        this.maxPagesInCache = this.datasource.maxPagesInCache;
    } else {
        // null is default, means don't  have any max size on the cache
        this.maxPagesInCache = null;
    }

    this.pageSize = this.datasource.pageSize; // take a copy of page size, we don't want it changing
    this.overflowSize = this.datasource.overflowSize; // take a copy of page size, we don't want it changing

    this.doLoadOrQueue(0);
};

VirtualPageRowController.prototype.createNodesFromRows = function(pageNumber, rows) {
    var nodes = [];
    if (rows) {
        for (var i = 0, j = rows.length; i < j; i++) {
            var virtualRowIndex = (pageNumber * this.pageSize) + i;
            nodes.push({
                data: rows[i],
                id: virtualRowIndex
            });
        }
    }
    return nodes;
};

VirtualPageRowController.prototype.removeFromLoading = function(pageNumber) {
    var index = this.pageLoadsInProgress.indexOf(pageNumber);
    this.pageLoadsInProgress.splice(index, 1);
};

VirtualPageRowController.prototype.pageLoadFailed = function(pageNumber) {
    this.removeFromLoading(pageNumber);
    this.checkQueueForNextLoad();
};

VirtualPageRowController.prototype.pageLoaded = function(pageNumber, rows, lastRow) {
    this.putPageIntoCacheAndPurge(pageNumber, rows);
    this.checkMaxRowAndInformRowRenderer(pageNumber, lastRow);
    this.removeFromLoading(pageNumber);
    this.checkQueueForNextLoad();
};

VirtualPageRowController.prototype.putPageIntoCacheAndPurge = function(pageNumber, rows) {
    this.pageCache[pageNumber] = this.createNodesFromRows(pageNumber, rows);
    this.pageCacheSize++;
    if (logging) {
        console.log('adding page ' + pageNumber);
    }

    var needToPurge = this.maxPagesInCache && this.maxPagesInCache < this.pageCacheSize;
    if (needToPurge) {
        // find the LRU page
        var youngestPageIndex = this.findLeastRecentlyAccessedPage(Object.keys(this.pageCache));

        if (logging) {
            console.log('purging page ' + youngestPageIndex + ' from cache ' + Object.keys(this.pageCache));
        }
        delete this.pageCache[youngestPageIndex];
        this.pageCacheSize--;
    }

};

VirtualPageRowController.prototype.checkMaxRowAndInformRowRenderer = function(pageNumber, lastRow) {
    if (!this.foundMaxRow) {
        // if we know the last row, use if
        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.virtualRowCount = lastRow;
            this.foundMaxRow = true;
        } else {
            // otherwise, see if we need to add some virtual rows
            var thisPagePlusBuffer = ((pageNumber + 1) * this.pageSize) + this.overflowSize;
            if (this.virtualRowCount < thisPagePlusBuffer) {
                this.virtualRowCount = thisPagePlusBuffer;
            }
        }
        // if rowCount changes, refreshView, otherwise just refreshAllVirtualRows
        this.rowRenderer.refreshView();
    } else {
        this.rowRenderer.refreshAllVirtualRows();
    }
};

VirtualPageRowController.prototype.isPageAlreadyLoading = function(pageNumber) {
    var result = this.pageLoadsInProgress.indexOf(pageNumber) >= 0 || this.pageLoadsQueued.indexOf(pageNumber) >= 0;
    return result;
};

VirtualPageRowController.prototype.doLoadOrQueue = function(pageNumber) {
    // if we already tried to load this page, then ignore the request,
    // otherwise server would be hit 50 times just to display one page, the
    // first row to find the page missing is enough.
    if (this.isPageAlreadyLoading(pageNumber)) {
        return;
    }

    // try the page load - if not already doing a load, then we can go ahead
    if (this.pageLoadsInProgress.length < this.maxConcurrentDatasourceRequests) {
        // go ahead, load the page
        this.loadPage(pageNumber);
    } else {
        // otherwise, queue the request
        this.addToQueueAndPurgeQueue(pageNumber);
    }
};

VirtualPageRowController.prototype.addToQueueAndPurgeQueue = function(pageNumber) {
    if (logging) {
        console.log('queueing ' + pageNumber + ' - ' + this.pageLoadsQueued);
    }
    this.pageLoadsQueued.push(pageNumber);

    // see if there are more pages queued that are actually in our cache, if so there is
    // no point in loading them all as some will be purged as soon as loaded
    var needToPurge = this.maxPagesInCache && this.maxPagesInCache < this.pageLoadsQueued.length;
    if (needToPurge) {
        // find the LRU page
        var youngestPageIndex = this.findLeastRecentlyAccessedPage(this.pageLoadsQueued);

        if (logging) {
            console.log('de-queueing ' + pageNumber + ' - ' + this.pageLoadsQueued);
        }

        var indexToRemove = this.pageLoadsQueued.indexOf(youngestPageIndex);
        this.pageLoadsQueued.splice(indexToRemove, 1);
    }
};

VirtualPageRowController.prototype.findLeastRecentlyAccessedPage = function(pageIndexes) {
    var youngestPageIndex = -1;
    var youngestPageAccessTime = Number.MAX_VALUE;
    var that = this;

    pageIndexes.forEach(function(pageIndex) {
        var accessTimeThisPage = that.pageAccessTimes[pageIndex];
        if (accessTimeThisPage < youngestPageAccessTime) {
            youngestPageAccessTime = accessTimeThisPage;
            youngestPageIndex = pageIndex;
        }
    });

    return youngestPageIndex;
};

VirtualPageRowController.prototype.checkQueueForNextLoad = function() {
    if (this.pageLoadsQueued.length > 0) {
        // take from the front of the queue
        var pageToLoad = this.pageLoadsQueued[0];
        this.pageLoadsQueued.splice(0, 1);

        if (logging) {
            console.log('dequeueing ' + pageToLoad + ' - ' + this.pageLoadsQueued);
        }

        this.loadPage(pageToLoad);
    }
};

VirtualPageRowController.prototype.loadPage = function(pageNumber) {

    this.pageLoadsInProgress.push(pageNumber);

    var startRow = pageNumber * this.pageSize;
    var endRow = (pageNumber + 1) * this.pageSize;

    var that = this;
    var datasourceVersionCopy = this.datasourceVersion;

    this.datasource.getRows(startRow, endRow,
        function success(rows, lastRow) {
            if (that.requestIsDaemon(datasourceVersionCopy)) {
                return;
            }
            that.pageLoaded(pageNumber, rows, lastRow);
        },
        function fail() {
            if (that.requestIsDaemon(datasourceVersionCopy)) {
                return;
            }
            that.pageLoadFailed(pageNumber);
        }
    );
};

// check that the datasource has not changed since the lats time we did a request
VirtualPageRowController.prototype.requestIsDaemon = function(datasourceVersionCopy) {
    return this.datasourceVersion !== datasourceVersionCopy;
};

VirtualPageRowController.prototype.getVirtualRow = function(rowIndex) {
    if (rowIndex > this.virtualRowCount) {
        return null;
    }

    var pageNumber = Math.floor(rowIndex / this.pageSize);
    var page = this.pageCache[pageNumber];

    // for LRU cache, track when this page was last hit
    this.pageAccessTimes[pageNumber] = this.accessTime++;

    if (!page) {
        this.doLoadOrQueue(pageNumber);
        // return back an empty row, so table can at least render empty cells
        return {
            data: {},
            id: rowIndex
        };
    } else {
        var indexInThisPage = rowIndex % this.pageSize;
        return page[indexInThisPage];
    }
};

VirtualPageRowController.prototype.getModel = function() {
    var that = this;
    return {
        getVirtualRow: function(index) {
            return that.getVirtualRow(index);
        },
        getVirtualRowCount: function() {
            return that.virtualRowCount;
        }
    };
};

module.exports = VirtualPageRowController;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9jb2x1bW5Db250cm9sbGVyLmpzIiwic3JjL2pzL2NvbnN0YW50cy5qcyIsInNyYy9qcy9maWx0ZXIvZmlsdGVyTWFuYWdlci5qcyIsInNyYy9qcy9maWx0ZXIvbnVtYmVyRmlsdGVyLmpzIiwic3JjL2pzL2ZpbHRlci9udW1iZXJGaWx0ZXJUZW1wbGF0ZS5qcyIsInNyYy9qcy9maWx0ZXIvc2V0RmlsdGVyLmpzIiwic3JjL2pzL2ZpbHRlci9zZXRGaWx0ZXJNb2RlbC5qcyIsInNyYy9qcy9maWx0ZXIvc2V0RmlsdGVyVGVtcGxhdGUuanMiLCJzcmMvanMvZmlsdGVyL3RleHRGaWx0ZXIuanMiLCJzcmMvanMvZmlsdGVyL3RleHRGaWx0ZXJUZW1wbGF0ZS5qcyIsInNyYy9qcy9ncmlkLmpzIiwic3JjL2pzL2dyaWRPcHRpb25zV3JhcHBlci5qcyIsInNyYy9qcy9ncm91cENyZWF0b3IuanMiLCJzcmMvanMvaGVhZGVyUmVuZGVyZXIuanMiLCJzcmMvanMvaW5NZW1vcnlSb3dDb250cm9sbGVyLmpzIiwic3JjL2pzL3BhZ2luYXRpb25Db250cm9sbGVyLmpzIiwic3JjL2pzL3Jvd1JlbmRlcmVyLmpzIiwic3JjL2pzL3NlbGVjdGlvbkNvbnRyb2xsZXIuanMiLCJzcmMvanMvc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LmpzIiwic3JjL2pzL3N2Z0ZhY3RvcnkuanMiLCJzcmMvanMvdGVtcGxhdGUuanMiLCJzcmMvanMvdGVtcGxhdGVOb1Njcm9sbHMuanMiLCJzcmMvanMvdXRpbHMuanMiLCJzcmMvanMvdmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3aUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwNkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIEFuZ3VsYXIgR3JpZFxyXG4vLyBXcml0dGVuIGJ5IE5pYWxsIENyb3NieVxyXG4vLyB3d3cuYW5ndWxhcmdyaWQuY29tXHJcblxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIG9yIGBleHBvcnRzYFxyXG4gICAgdmFyIHJvb3QgPSB0aGlzO1xyXG4gICAgdmFyIEdyaWQgPSByZXF1aXJlKCcuL2dyaWQnKTtcclxuXHJcbiAgICAvLyBpZiBhbmd1bGFyIGlzIHByZXNlbnQsIHJlZ2lzdGVyIHRoZSBkaXJlY3RpdmVcclxuICAgIGlmICh0eXBlb2YgYW5ndWxhciAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICB2YXIgYW5ndWxhck1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwiYW5ndWxhckdyaWRcIiwgW10pO1xyXG4gICAgICAgIGFuZ3VsYXJNb2R1bGUuZGlyZWN0aXZlKFwiYW5ndWxhckdyaWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICByZXN0cmljdDogXCJBXCIsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRlbGVtZW50JywgJyRzY29wZScsICckY29tcGlsZScsIEFuZ3VsYXJEaXJlY3RpdmVDb250cm9sbGVyXSxcclxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhckdyaWQ6IFwiPVwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xyXG4gICAgICAgICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyR3JpZEdsb2JhbEZ1bmN0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBleHBvcnRzLmFuZ3VsYXJHcmlkID0gYW5ndWxhckdyaWRHbG9iYWxGdW5jdGlvbjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcm9vdC5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkR2xvYmFsRnVuY3Rpb247XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIEFuZ3VsYXJEaXJlY3RpdmVDb250cm9sbGVyKCRlbGVtZW50LCAkc2NvcGUsICRjb21waWxlKSB7XHJcbiAgICAgICAgdmFyIGVHcmlkRGl2ID0gJGVsZW1lbnRbMF07XHJcbiAgICAgICAgdmFyIGdyaWRPcHRpb25zID0gJHNjb3BlLmFuZ3VsYXJHcmlkO1xyXG4gICAgICAgIGlmICghZ3JpZE9wdGlvbnMpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiV0FSTklORyAtIGdyaWQgb3B0aW9ucyBmb3IgQW5ndWxhciBHcmlkIG5vdCBmb3VuZC4gUGxlYXNlIGVuc3VyZSB0aGUgYXR0cmlidXRlIGFuZ3VsYXItZ3JpZCBwb2ludHMgdG8gYSB2YWxpZCBvYmplY3Qgb24gdGhlIHNjb3BlXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBncmlkID0gbmV3IEdyaWQoZUdyaWREaXYsIGdyaWRPcHRpb25zLCAkc2NvcGUsICRjb21waWxlKTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbihcIiRkZXN0cm95XCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBncmlkLnNldEZpbmlzaGVkKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2xvYmFsIEZ1bmN0aW9uIC0gdGhpcyBmdW5jdGlvbiBpcyB1c2VkIGZvciBjcmVhdGluZyBhIGdyaWQsIG91dHNpZGUgb2YgYW55IEFuZ3VsYXJKU1xyXG4gICAgZnVuY3Rpb24gYW5ndWxhckdyaWRHbG9iYWxGdW5jdGlvbihlbGVtZW50LCBncmlkT3B0aW9ucykge1xyXG4gICAgICAgIC8vIHNlZSBpZiBlbGVtZW50IGlzIGEgcXVlcnkgc2VsZWN0b3IsIG9yIGEgcmVhbCBlbGVtZW50XHJcbiAgICAgICAgdmFyIGVHcmlkRGl2O1xyXG4gICAgICAgIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgZUdyaWREaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICBpZiAoIWVHcmlkRGl2KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnV0FSTklORyAtIHdhcyBub3QgYWJsZSB0byBmaW5kIGVsZW1lbnQgJyArIGVsZW1lbnQgKyAnIGluIHRoZSBET00sIEFuZ3VsYXIgR3JpZCBpbml0aWFsaXNhdGlvbiBhYm9ydGVkLicpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZUdyaWREaXYgPSBlbGVtZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBuZXcgR3JpZChlR3JpZERpdiwgZ3JpZE9wdGlvbnMsIG51bGwsIG51bGwpO1xyXG4gICAgfVxyXG5cclxufSkuY2FsbCh0aGlzKTtcclxuIiwidmFyIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XHJcblxyXG5mdW5jdGlvbiBDb2x1bW5Db250cm9sbGVyKCkge1xyXG4gICAgdGhpcy5jcmVhdGVNb2RlbCgpO1xyXG59XHJcblxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oYW5ndWxhckdyaWQsIHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSwgZ3JpZE9wdGlvbnNXcmFwcGVyKSB7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZDtcclxuICAgIHRoaXMuc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5ID0gc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5O1xyXG59O1xyXG5cclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuY3JlYXRlTW9kZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHRoaXMubW9kZWwgPSB7XHJcbiAgICAgICAgLy8gdXNlZCBieTpcclxuICAgICAgICAvLyArIGluTWVtb3J5Um93Q29udHJvbGxlciAtPiBzb3J0aW5nLCBidWlsZGluZyBxdWljayBmaWx0ZXIgdGV4dFxyXG4gICAgICAgIC8vICsgaGVhZGVyUmVuZGVyZXIgLT4gc29ydGluZyAoY2xlYXJpbmcgaWNvbilcclxuICAgICAgICBnZXRBbGxDb2x1bW5zOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuY29sdW1ucztcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vICsgcm93Q29udHJvbGxlciAtPiB3aGlsZSBpbnNlcnRpbmcgcm93cywgYW5kIHdoZW4gdGFiYmluZyB0aHJvdWdoIGNlbGxzIChuZWVkIHRvIGNoYW5nZSB0aGlzKVxyXG4gICAgICAgIC8vIG5lZWQgYSBuZXdNZXRob2QgLSBnZXQgbmV4dCBjb2wgaW5kZXhcclxuICAgICAgICBnZXRWaXNpYmxlQ29sdW1uczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnZpc2libGVDb2x1bW5zO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gdXNlZCBieTpcclxuICAgICAgICAvLyArIGFuZ3VsYXJHcmlkIC0+IGZvciBzZXR0aW5nIGJvZHkgd2lkdGhcclxuICAgICAgICAvLyArIHJvd0NvbnRyb2xsZXIgLT4gc2V0dGluZyBtYWluIHJvdyB3aWR0aHMgKHdoZW4gaW5zZXJ0aW5nIGFuZCByZXNpemluZylcclxuICAgICAgICBnZXRCb2R5Q29udGFpbmVyV2lkdGg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5nZXRUb3RhbENvbFdpZHRoKGZhbHNlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIHVzZWQgYnk6XHJcbiAgICAgICAgLy8gKyBhbmd1bGFyR3JpZCAtPiBzZXR0aW5nIHBpbm5lZCBib2R5IHdpZHRoXHJcbiAgICAgICAgZ2V0UGlubmVkQ29udGFpbmVyV2lkdGg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5nZXRUb3RhbENvbFdpZHRoKHRydWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gdXNlZCBieTpcclxuICAgICAgICAvLyArIGhlYWRlclJlbmRlcmVyIC0+IHNldHRpbmcgcGlubmVkIGJvZHkgd2lkdGhcclxuICAgICAgICBnZXRDb2x1bW5Hcm91cHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5jb2x1bW5Hcm91cHM7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmdldE1vZGVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbDtcclxufTtcclxuXHJcbi8vIGNhbGxlZCBieSBhbmd1bGFyR3JpZFxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5zZXRDb2x1bW5zID0gZnVuY3Rpb24oY29sdW1uRGVmcykge1xyXG4gICAgdGhpcy5idWlsZENvbHVtbnMoY29sdW1uRGVmcyk7XHJcbiAgICB0aGlzLmVuc3VyZUVhY2hDb2xIYXNTaXplKCk7XHJcbiAgICB0aGlzLmJ1aWxkR3JvdXBzKCk7XHJcbiAgICB0aGlzLnVwZGF0ZUdyb3VwcygpO1xyXG4gICAgdGhpcy51cGRhdGVWaXNpYmxlQ29sdW1ucygpO1xyXG59O1xyXG5cclxuLy8gY2FsbGVkIGJ5IGhlYWRlclJlbmRlcmVyIC0gd2hlbiBhIGhlYWRlciBpcyBvcGVuZWQgb3IgY2xvc2VkXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmNvbHVtbkdyb3VwT3BlbmVkID0gZnVuY3Rpb24oZ3JvdXApIHtcclxuICAgIGdyb3VwLmV4cGFuZGVkID0gIWdyb3VwLmV4cGFuZGVkO1xyXG4gICAgdGhpcy51cGRhdGVHcm91cHMoKTtcclxuICAgIHRoaXMudXBkYXRlVmlzaWJsZUNvbHVtbnMoKTtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQucmVmcmVzaEhlYWRlckFuZEJvZHkoKTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlVmlzaWJsZUNvbHVtbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGlmIG5vdCBncm91cGluZyBieSBoZWFkZXJzLCB0aGVuIGFsbCBjb2x1bW5zIGFyZSB2aXNpYmxlXHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBIZWFkZXJzKCkpIHtcclxuICAgICAgICB0aGlzLnZpc2libGVDb2x1bW5zID0gdGhpcy5jb2x1bW5zO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBncm91cGluZywgdGhlbiBvbmx5IHNob3cgY29sIGFzIHBlciBncm91cCBydWxlc1xyXG4gICAgdGhpcy52aXNpYmxlQ29sdW1ucyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbHVtbkdyb3Vwcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBncm91cCA9IHRoaXMuY29sdW1uR3JvdXBzW2ldO1xyXG4gICAgICAgIGdyb3VwLmFkZFRvVmlzaWJsZUNvbHVtbnModGhpcy52aXNpYmxlQ29sdW1ucyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgLSBjYWxsZWQgZnJvbSBhcGlcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuc2l6ZUNvbHVtbnNUb0ZpdCA9IGZ1bmN0aW9uKGF2YWlsYWJsZVdpZHRoKSB7XHJcbiAgICAvLyBhdm9pZCBkaXZpZGUgYnkgemVyb1xyXG4gICAgaWYgKGF2YWlsYWJsZVdpZHRoIDw9IDAgfHwgdGhpcy52aXNpYmxlQ29sdW1ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGN1cnJlbnRUb3RhbFdpZHRoID0gdGhpcy5nZXRUb3RhbENvbFdpZHRoKCk7XHJcbiAgICB2YXIgc2NhbGUgPSBhdmFpbGFibGVXaWR0aCAvIGN1cnJlbnRUb3RhbFdpZHRoO1xyXG5cclxuICAgIC8vIHNpemUgYWxsIGNvbHMgZXhjZXB0IHRoZSBsYXN0IGJ5IHRoZSBzY2FsZVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAodGhpcy52aXNpYmxlQ29sdW1ucy5sZW5ndGggLSAxKTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNvbHVtbiA9IHRoaXMudmlzaWJsZUNvbHVtbnNbaV07XHJcbiAgICAgICAgdmFyIG5ld1dpZHRoID0gcGFyc2VJbnQoY29sdW1uLmFjdHVhbFdpZHRoICogc2NhbGUpO1xyXG4gICAgICAgIGNvbHVtbi5hY3R1YWxXaWR0aCA9IG5ld1dpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHNpemUgdGhlIGxhc3QgYnkgd2hhdHMgcmVtYWluaW5nICh0aGlzIGF2b2lkcyByb3VuZGluZyBlcnJvcnMgdGhhdCBjb3VsZFxyXG4gICAgLy8gb2NjdXIgd2l0aCBzY2FsaW5nIGV2ZXJ5dGhpbmcsIHdoZXJlIGl0IHJlc3VsdCBpbiBzb21lIHBpeGVscyBvZmYpXHJcbiAgICB2YXIgcGl4ZWxzTGVmdEZvckxhc3RDb2wgPSBhdmFpbGFibGVXaWR0aCAtIHRoaXMuZ2V0VG90YWxDb2xXaWR0aCgpO1xyXG4gICAgdmFyIGxhc3RDb2x1bW4gPSB0aGlzLnZpc2libGVDb2x1bW5zW3RoaXMudmlzaWJsZUNvbHVtbnMubGVuZ3RoIC0gMV07XHJcbiAgICBsYXN0Q29sdW1uLmFjdHVhbFdpZHRoICs9IHBpeGVsc0xlZnRGb3JMYXN0Q29sO1xyXG5cclxuICAgIC8vIHdpZHRocyBzZXQsIHJlZnJlc2ggdGhlIGd1aVxyXG4gICAgdGhpcy5hbmd1bGFyR3JpZC5yZWZyZXNoSGVhZGVyQW5kQm9keSgpO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5idWlsZEdyb3VwcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gaWYgbm90IGdyb3VwaW5nIGJ5IGhlYWRlcnMsIGRvIG5vdGhpbmdcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEhlYWRlcnMoKSkge1xyXG4gICAgICAgIHRoaXMuY29sdW1uR3JvdXBzID0gbnVsbDtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc3BsaXQgdGhlIGNvbHVtbnMgaW50byBncm91cHNcclxuICAgIHZhciBjdXJyZW50R3JvdXAgPSBudWxsO1xyXG4gICAgdGhpcy5jb2x1bW5Hcm91cHMgPSBbXTtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICB2YXIgbGFzdENvbFdhc1Bpbm5lZCA9IHRydWU7XHJcblxyXG4gICAgdGhpcy5jb2x1bW5zLmZvckVhY2goZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICAgICAgLy8gZG8gd2UgbmVlZCBhIG5ldyBncm91cCwgYmVjYXVzZSB3ZSBtb3ZlIGZyb20gcGlubmVkIHRvIG5vbi1waW5uZWQgY29sdW1ucz9cclxuICAgICAgICB2YXIgZW5kT2ZQaW5uZWRIZWFkZXIgPSBsYXN0Q29sV2FzUGlubmVkICYmICFjb2x1bW4ucGlubmVkO1xyXG4gICAgICAgIGlmICghY29sdW1uLnBpbm5lZCkge1xyXG4gICAgICAgICAgICBsYXN0Q29sV2FzUGlubmVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGRvIHdlIG5lZWQgYSBuZXcgZ3JvdXAsIGJlY2F1c2UgdGhlIGdyb3VwIG5hbWVzIGRvZXNuJ3QgbWF0Y2ggZnJvbSBwcmV2aW91cyBjb2w/XHJcbiAgICAgICAgdmFyIGdyb3VwS2V5TWlzbWF0Y2ggPSBjdXJyZW50R3JvdXAgJiYgY29sdW1uLmNvbERlZi5ncm91cCAhPT0gY3VycmVudEdyb3VwLm5hbWU7XHJcbiAgICAgICAgLy8gd2UgZG9uJ3QgZ3JvdXAgY29sdW1ucyB3aGVyZSBubyBncm91cCBpcyBzcGVjaWZpZWRcclxuICAgICAgICB2YXIgY29sTm90SW5Hcm91cCA9IGN1cnJlbnRHcm91cCAmJiAhY3VycmVudEdyb3VwLm5hbWU7XHJcbiAgICAgICAgLy8gZG8gd2UgbmVlZCBhIG5ldyBncm91cCwgYmVjYXVzZSB3ZSBhcmUganVzdCBzdGFydGluZ1xyXG4gICAgICAgIHZhciBwcm9jZXNzaW5nRmlyc3RDb2wgPSBjb2x1bW4uaW5kZXggPT09IDA7XHJcbiAgICAgICAgdmFyIG5ld0dyb3VwTmVlZGVkID0gcHJvY2Vzc2luZ0ZpcnN0Q29sIHx8IGVuZE9mUGlubmVkSGVhZGVyIHx8IGdyb3VwS2V5TWlzbWF0Y2ggfHwgY29sTm90SW5Hcm91cDtcclxuICAgICAgICAvLyBjcmVhdGUgbmV3IGdyb3VwLCBpZiBpdCdzIG5lZWRlZFxyXG4gICAgICAgIGlmIChuZXdHcm91cE5lZWRlZCkge1xyXG4gICAgICAgICAgICB2YXIgcGlubmVkID0gY29sdW1uLnBpbm5lZDtcclxuICAgICAgICAgICAgY3VycmVudEdyb3VwID0gbmV3IENvbHVtbkdyb3VwKHBpbm5lZCwgY29sdW1uLmNvbERlZi5ncm91cCk7XHJcbiAgICAgICAgICAgIHRoYXQuY29sdW1uR3JvdXBzLnB1c2goY3VycmVudEdyb3VwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY3VycmVudEdyb3VwLmFkZENvbHVtbihjb2x1bW4pO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZUdyb3VwcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gaWYgbm90IGdyb3VwaW5nIGJ5IGhlYWRlcnMsIGRvIG5vdGhpbmdcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEhlYWRlcnMoKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29sdW1uR3JvdXBzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gdGhpcy5jb2x1bW5Hcm91cHNbaV07XHJcbiAgICAgICAgZ3JvdXAuY2FsY3VsYXRlRXhwYW5kYWJsZSgpO1xyXG4gICAgICAgIGdyb3VwLmNhbGN1bGF0ZVZpc2libGVDb2x1bW5zKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmJ1aWxkQ29sdW1ucyA9IGZ1bmN0aW9uKGNvbHVtbkRlZnMpIHtcclxuICAgIHRoaXMuY29sdW1ucyA9IFtdO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIHBpbm5lZENvbHVtbkNvdW50ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0UGlubmVkQ29sQ291bnQoKTtcclxuICAgIGlmIChjb2x1bW5EZWZzKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2x1bW5EZWZzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBjb2xEZWYgPSBjb2x1bW5EZWZzW2ldO1xyXG4gICAgICAgICAgICAvLyB0aGlzIGlzIG1lc3N5IC0gd2Ugc3dhcCBpbiBhbm90aGVyIGNvbCBkZWYgaWYgaXQncyBjaGVja2JveCBzZWxlY3Rpb24gLSBub3QgaGFwcHkgOihcclxuICAgICAgICAgICAgaWYgKGNvbERlZiA9PT0gJ2NoZWNrYm94U2VsZWN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgY29sRGVmID0gdGhhdC5zZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkuY3JlYXRlQ2hlY2tib3hDb2xEZWYoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgcGlubmVkID0gcGlubmVkQ29sdW1uQ291bnQgPiBpO1xyXG4gICAgICAgICAgICB2YXIgY29sdW1uID0gbmV3IENvbHVtbihjb2xEZWYsIGksIHBpbm5lZCk7XHJcbiAgICAgICAgICAgIHRoYXQuY29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyBzZXQgdGhlIGFjdHVhbCB3aWR0aHMgZm9yIGVhY2ggY29sXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmVuc3VyZUVhY2hDb2xIYXNTaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbihjb2xEZWZXcmFwcGVyKSB7XHJcbiAgICAgICAgdmFyIGNvbERlZiA9IGNvbERlZldyYXBwZXIuY29sRGVmO1xyXG4gICAgICAgIGlmIChjb2xEZWZXcmFwcGVyLmFjdHVhbFdpZHRoKSB7XHJcbiAgICAgICAgICAgIC8vIGlmIGFjdHVhbCB3aWR0aCBhbHJlYWR5IHNldCwgZG8gbm90aGluZ1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfSBlbHNlIGlmICghY29sRGVmLndpZHRoKSB7XHJcbiAgICAgICAgICAgIC8vIGlmIG5vIHdpZHRoIGRlZmluZWQgaW4gY29sRGVmLCBkZWZhdWx0IHRvIDIwMFxyXG4gICAgICAgICAgICBjb2xEZWZXcmFwcGVyLmFjdHVhbFdpZHRoID0gMjAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29sRGVmLndpZHRoIDwgY29uc3RhbnRzLk1JTl9DT0xfV0lEVEgpIHtcclxuICAgICAgICAgICAgLy8gaWYgd2lkdGggaW4gY29sIGRlZiB0byBzbWFsbCwgc2V0IHRvIG1pbiB3aWR0aFxyXG4gICAgICAgICAgICBjb2xEZWZXcmFwcGVyLmFjdHVhbFdpZHRoID0gY29uc3RhbnRzLk1JTl9DT0xfV0lEVEg7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIHVzZSB0aGUgcHJvdmlkZWQgd2lkdGhcclxuICAgICAgICAgICAgY29sRGVmV3JhcHBlci5hY3R1YWxXaWR0aCA9IGNvbERlZi53aWR0aDtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuLy8gY2FsbCB3aXRoIHRydWUgKHBpbm5lZCksIGZhbHNlIChub3QtcGlubmVkKSBvciB1bmRlZmluZWQgKGFsbCBjb2x1bW5zKVxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5nZXRUb3RhbENvbFdpZHRoID0gZnVuY3Rpb24oaW5jbHVkZVBpbm5lZCkge1xyXG4gICAgdmFyIHdpZHRoU29GYXIgPSAwO1xyXG4gICAgdmFyIHBpbmVkTm90SW1wb3J0YW50ID0gdHlwZW9mIGluY2x1ZGVQaW5uZWQgIT09ICdib29sZWFuJztcclxuXHJcbiAgICB0aGlzLnZpc2libGVDb2x1bW5zLmZvckVhY2goZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICAgICAgdmFyIGluY2x1ZGVUaGlzQ29sID0gcGluZWROb3RJbXBvcnRhbnQgfHwgY29sdW1uLnBpbm5lZCA9PT0gaW5jbHVkZVBpbm5lZDtcclxuICAgICAgICBpZiAoaW5jbHVkZVRoaXNDb2wpIHtcclxuICAgICAgICAgICAgd2lkdGhTb0ZhciArPSBjb2x1bW4uYWN0dWFsV2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHdpZHRoU29GYXI7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBDb2x1bW5Hcm91cChwaW5uZWQsIG5hbWUpIHtcclxuICAgIHRoaXMucGlubmVkID0gcGlubmVkO1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIHRoaXMuYWxsQ29sdW1ucyA9IFtdO1xyXG4gICAgdGhpcy52aXNpYmxlQ29sdW1ucyA9IFtdO1xyXG4gICAgdGhpcy5leHBhbmRhYmxlID0gZmFsc2U7IC8vIHdoZXRoZXIgdGhpcyBncm91cCBjYW4gYmUgZXhwYW5kZWQgb3Igbm90XHJcbiAgICB0aGlzLmV4cGFuZGVkID0gZmFsc2U7XHJcbn1cclxuXHJcbkNvbHVtbkdyb3VwLnByb3RvdHlwZS5hZGRDb2x1bW4gPSBmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgIHRoaXMuYWxsQ29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbn07XHJcblxyXG4vLyBuZWVkIHRvIGNoZWNrIHRoYXQgdGhpcyBncm91cCBoYXMgYXQgbGVhc3Qgb25lIGNvbCBzaG93aW5nIHdoZW4gYm90aCBleHBhbmRlZCBhbmQgY29udHJhY3RlZC5cclxuLy8gaWYgbm90LCB0aGVuIHdlIGRvbid0IGFsbG93IGV4cGFuZGluZyBhbmQgY29udHJhY3Rpbmcgb24gdGhpcyBncm91cFxyXG5Db2x1bW5Hcm91cC5wcm90b3R5cGUuY2FsY3VsYXRlRXhwYW5kYWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gd2FudCB0byBtYWtlIHN1cmUgdGhlIGdyb3VwIGRvZXNuJ3QgZGlzYXBwZWFyIHdoZW4gaXQncyBvcGVuXHJcbiAgICB2YXIgYXRMZWFzdE9uZVNob3dpbmdXaGVuT3BlbiA9IGZhbHNlO1xyXG4gICAgLy8gd2FudCB0byBtYWtlIHN1cmUgdGhlIGdyb3VwIGRvZXNuJ3QgZGlzYXBwZWFyIHdoZW4gaXQncyBjbG9zZWRcclxuICAgIHZhciBhdExlYXN0T25lU2hvd2luZ1doZW5DbG9zZWQgPSBmYWxzZTtcclxuICAgIC8vIHdhbnQgdG8gbWFrZSBzdXJlIHRoZSBncm91cCBoYXMgc29tZXRoaW5nIHRvIHNob3cgLyBoaWRlXHJcbiAgICB2YXIgYXRMZWFzdE9uZUNoYW5nZWFibGUgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBqID0gdGhpcy5hbGxDb2x1bW5zLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICAgIHZhciBjb2x1bW4gPSB0aGlzLmFsbENvbHVtbnNbaV07XHJcbiAgICAgICAgaWYgKGNvbHVtbi5jb2xEZWYuZ3JvdXBTaG93ID09PSAnb3BlbicpIHtcclxuICAgICAgICAgICAgYXRMZWFzdE9uZVNob3dpbmdXaGVuT3BlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVDaGFuZ2VhYmxlID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbHVtbi5jb2xEZWYuZ3JvdXBTaG93ID09PSAnY2xvc2VkJykge1xyXG4gICAgICAgICAgICBhdExlYXN0T25lU2hvd2luZ1doZW5DbG9zZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBhdExlYXN0T25lQ2hhbmdlYWJsZSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYXRMZWFzdE9uZVNob3dpbmdXaGVuT3BlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVTaG93aW5nV2hlbkNsb3NlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZXhwYW5kYWJsZSA9IGF0TGVhc3RPbmVTaG93aW5nV2hlbk9wZW4gJiYgYXRMZWFzdE9uZVNob3dpbmdXaGVuQ2xvc2VkICYmIGF0TGVhc3RPbmVDaGFuZ2VhYmxlO1xyXG59O1xyXG5cclxuQ29sdW1uR3JvdXAucHJvdG90eXBlLmNhbGN1bGF0ZVZpc2libGVDb2x1bW5zID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBjbGVhciBvdXQgbGFzdCB0aW1lIHdlIGNhbGN1bGF0ZWRcclxuICAgIHRoaXMudmlzaWJsZUNvbHVtbnMgPSBbXTtcclxuICAgIC8vIGl0IG5vdCBleHBhbmRhYmxlLCBldmVyeXRoaW5nIGlzIHZpc2libGVcclxuICAgIGlmICghdGhpcy5leHBhbmRhYmxlKSB7XHJcbiAgICAgICAgdGhpcy52aXNpYmxlQ29sdW1ucyA9IHRoaXMuYWxsQ29sdW1ucztcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAvLyBhbmQgY2FsY3VsYXRlIGFnYWluXHJcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IHRoaXMuYWxsQ29sdW1ucy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgICB2YXIgY29sdW1uID0gdGhpcy5hbGxDb2x1bW5zW2ldO1xyXG4gICAgICAgIHN3aXRjaCAoY29sdW1uLmNvbERlZi5ncm91cFNob3cpIHtcclxuICAgICAgICAgICAgY2FzZSAnb3Blbic6XHJcbiAgICAgICAgICAgICAgICAvLyB3aGVuIHNldCB0byBvcGVuLCBvbmx5IHNob3cgY29sIGlmIGdyb3VwIGlzIG9wZW5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmV4cGFuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aXNpYmxlQ29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnY2xvc2VkJzpcclxuICAgICAgICAgICAgICAgIC8vIHdoZW4gc2V0IHRvIG9wZW4sIG9ubHkgc2hvdyBjb2wgaWYgZ3JvdXAgaXMgb3BlblxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmV4cGFuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aXNpYmxlQ29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8vIGRlZmF1bHQgaXMgYWx3YXlzIHNob3cgdGhlIGNvbHVtblxyXG4gICAgICAgICAgICAgICAgdGhpcy52aXNpYmxlQ29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5Db2x1bW5Hcm91cC5wcm90b3R5cGUuYWRkVG9WaXNpYmxlQ29sdW1ucyA9IGZ1bmN0aW9uKGFsbFZpc2libGVDb2x1bW5zKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmlzaWJsZUNvbHVtbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgY29sdW1uID0gdGhpcy52aXNpYmxlQ29sdW1uc1tpXTtcclxuICAgICAgICBhbGxWaXNpYmxlQ29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5mdW5jdGlvbiBDb2x1bW4oY29sRGVmLCBpbmRleCwgcGlubmVkKSB7XHJcbiAgICB0aGlzLmNvbERlZiA9IGNvbERlZjtcclxuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcclxuICAgIHRoaXMucGlubmVkID0gcGlubmVkO1xyXG4gICAgLy8gaW4gdGhlIGZ1dHVyZSwgdGhlIGNvbEtleSBtaWdodCBiZSBzb21ldGhpbmcgb3RoZXIgdGhhbiB0aGUgaW5kZXhcclxuICAgIHRoaXMuY29sS2V5ID0gaW5kZXg7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29sdW1uQ29udHJvbGxlcjtcclxuIiwidmFyIGNvbnN0YW50cyA9IHtcclxuICAgIFNURVBfRVZFUllUSElORzogMCxcclxuICAgIFNURVBfRklMVEVSOiAxLFxyXG4gICAgU1RFUF9TT1JUOiAyLFxyXG4gICAgU1RFUF9NQVA6IDMsXHJcbiAgICBBU0M6IFwiYXNjXCIsXHJcbiAgICBERVNDOiBcImRlc2NcIixcclxuICAgIFJPV19CVUZGRVJfU0laRTogNSxcclxuICAgIFNPUlRfU1RZTEVfU0hPVzogXCJkaXNwbGF5OmlubGluZTtcIixcclxuICAgIFNPUlRfU1RZTEVfSElERTogXCJkaXNwbGF5Om5vbmU7XCIsXHJcbiAgICBNSU5fQ09MX1dJRFRIOiAxMCxcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY29uc3RhbnRzO1xyXG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XHJcbnZhciBTZXRGaWx0ZXIgPSByZXF1aXJlKCcuL3NldEZpbHRlcicpO1xyXG52YXIgTnVtYmVyRmlsdGVyID0gcmVxdWlyZSgnLi9udW1iZXJGaWx0ZXInKTtcclxudmFyIFN0cmluZ0ZpbHRlciA9IHJlcXVpcmUoJy4vdGV4dEZpbHRlcicpO1xyXG5cclxuZnVuY3Rpb24gRmlsdGVyTWFuYWdlcigpIHt9XHJcblxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oZ3JpZCwgZ3JpZE9wdGlvbnNXcmFwcGVyLCAkY29tcGlsZSwgJHNjb3BlKSB7XHJcbiAgICB0aGlzLiRjb21waWxlID0gJGNvbXBpbGU7XHJcbiAgICB0aGlzLiRzY29wZSA9ICRzY29wZTtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyID0gZ3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4gICAgdGhpcy5ncmlkID0gZ3JpZDtcclxuICAgIHRoaXMuYWxsRmlsdGVycyA9IHt9O1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuc2V0Um93TW9kZWwgPSBmdW5jdGlvbihyb3dNb2RlbCkge1xyXG4gICAgdGhpcy5yb3dNb2RlbCA9IHJvd01vZGVsO1xyXG59O1xyXG5cclxuLy8gcmV0dXJucyB0cnVlIGlmIGF0IGxlYXN0IG9uZSBmaWx0ZXIgaXMgYWN0aXZlXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLmlzRmlsdGVyUHJlc2VudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGF0TGVhc3RPbmVBY3RpdmUgPSBmYWxzZTtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuYWxsRmlsdGVycyk7XHJcbiAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgdmFyIGZpbHRlcldyYXBwZXIgPSB0aGF0LmFsbEZpbHRlcnNba2V5XTtcclxuICAgICAgICBpZiAoIWZpbHRlcldyYXBwZXIuZmlsdGVyLmlzRmlsdGVyQWN0aXZlKSB7IC8vIGJlY2F1c2UgdXNlcnMgY2FuIGRvIGN1c3RvbSBmaWx0ZXJzLCBnaXZlIG5pY2UgZXJyb3IgbWVzc2FnZVxyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGaWx0ZXIgaXMgbWlzc2luZyBtZXRob2QgaXNGaWx0ZXJBY3RpdmUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZpbHRlcldyYXBwZXIuZmlsdGVyLmlzRmlsdGVyQWN0aXZlKCkpIHtcclxuICAgICAgICAgICAgYXRMZWFzdE9uZUFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gYXRMZWFzdE9uZUFjdGl2ZTtcclxufTtcclxuXHJcbi8vIHJldHVybnMgdHJ1ZSBpZiBnaXZlbiBjb2wgaGFzIGEgZmlsdGVyIGFjdGl2ZVxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5pc0ZpbHRlclByZXNlbnRGb3JDb2wgPSBmdW5jdGlvbihjb2xLZXkpIHtcclxuICAgIHZhciBmaWx0ZXJXcmFwcGVyID0gdGhpcy5hbGxGaWx0ZXJzW2NvbEtleV07XHJcbiAgICBpZiAoIWZpbHRlcldyYXBwZXIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAoIWZpbHRlcldyYXBwZXIuZmlsdGVyLmlzRmlsdGVyQWN0aXZlKSB7IC8vIGJlY2F1c2UgdXNlcnMgY2FuIGRvIGN1c3RvbSBmaWx0ZXJzLCBnaXZlIG5pY2UgZXJyb3IgbWVzc2FnZVxyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZpbHRlciBpcyBtaXNzaW5nIG1ldGhvZCBpc0ZpbHRlckFjdGl2ZScpO1xyXG4gICAgfVxyXG4gICAgdmFyIGZpbHRlclByZXNlbnQgPSBmaWx0ZXJXcmFwcGVyLmZpbHRlci5pc0ZpbHRlckFjdGl2ZSgpO1xyXG4gICAgcmV0dXJuIGZpbHRlclByZXNlbnQ7XHJcbn07XHJcblxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5kb2VzRmlsdGVyUGFzcyA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIHZhciBkYXRhID0gbm9kZS5kYXRhO1xyXG4gICAgdmFyIGNvbEtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmFsbEZpbHRlcnMpO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjb2xLZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyAvLyBjcml0aWNhbCBjb2RlLCBkb24ndCB1c2UgZnVuY3Rpb25hbCBwcm9ncmFtbWluZ1xyXG5cclxuICAgICAgICB2YXIgY29sS2V5ID0gY29sS2V5c1tpXTtcclxuICAgICAgICB2YXIgZmlsdGVyV3JhcHBlciA9IHRoaXMuYWxsRmlsdGVyc1tjb2xLZXldO1xyXG5cclxuICAgICAgICAvLyBpZiBubyBmaWx0ZXIsIGFsd2F5cyBwYXNzXHJcbiAgICAgICAgaWYgKGZpbHRlcldyYXBwZXIgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB2YWx1ZSA9IGRhdGFbZmlsdGVyV3JhcHBlci5maWVsZF07XHJcbiAgICAgICAgaWYgKCFmaWx0ZXJXcmFwcGVyLmZpbHRlci5kb2VzRmlsdGVyUGFzcykgeyAvLyBiZWNhdXNlIHVzZXJzIGNhbiBkbyBjdXN0b20gZmlsdGVycywgZ2l2ZSBuaWNlIGVycm9yIG1lc3NhZ2VcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmlsdGVyIGlzIG1pc3NpbmcgbWV0aG9kIGRvZXNGaWx0ZXJQYXNzJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBtb2RlbDtcclxuICAgICAgICAvLyBpZiBtb2RlbCBpcyBleHBvc2VkLCBncmFiIGl0XHJcbiAgICAgICAgaWYgKGZpbHRlcldyYXBwZXIuZmlsdGVyLmdldE1vZGVsKSB7XHJcbiAgICAgICAgICAgIG1vZGVsID0gZmlsdGVyV3JhcHBlci5maWx0ZXIuZ2V0TW9kZWwoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICBtb2RlbDogbW9kZWwsXHJcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGFcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmICghZmlsdGVyV3JhcHBlci5maWx0ZXIuZG9lc0ZpbHRlclBhc3MocGFyYW1zKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gYWxsIGZpbHRlcnMgcGFzc2VkXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLm9uTmV3Um93c0xvYWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgT2JqZWN0LmtleXModGhpcy5hbGxGaWx0ZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkKSB7XHJcbiAgICAgICAgdmFyIGZpbHRlciA9IHRoYXQuYWxsRmlsdGVyc1tmaWVsZF0uZmlsdGVyO1xyXG4gICAgICAgIGlmIChmaWx0ZXIub25OZXdSb3dzTG9hZGVkKSB7XHJcbiAgICAgICAgICAgIGZpbHRlci5vbk5ld1Jvd3NMb2FkZWQoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLnBvc2l0aW9uUG9wdXAgPSBmdW5jdGlvbihldmVudFNvdXJjZSwgZVBvcHVwLCBlUG9wdXBSb290KSB7XHJcbiAgICB2YXIgc291cmNlUmVjdCA9IGV2ZW50U291cmNlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgdmFyIHBhcmVudFJlY3QgPSBlUG9wdXBSb290LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgIHZhciB4ID0gc291cmNlUmVjdC5sZWZ0IC0gcGFyZW50UmVjdC5sZWZ0O1xyXG4gICAgdmFyIHkgPSBzb3VyY2VSZWN0LnRvcCAtIHBhcmVudFJlY3QudG9wICsgc291cmNlUmVjdC5oZWlnaHQ7XHJcblxyXG4gICAgLy8gaWYgcG9wdXAgaXMgb3ZlcmZsb3dpbmcgdG8gdGhlIHJpZ2h0LCBtb3ZlIGl0IGxlZnRcclxuICAgIHZhciB3aWR0aE9mUG9wdXAgPSAyMDA7IC8vIHRoaXMgaXMgc2V0IGluIHRoZSBjc3NcclxuICAgIHZhciB3aWR0aE9mUGFyZW50ID0gcGFyZW50UmVjdC5yaWdodCAtIHBhcmVudFJlY3QubGVmdDtcclxuICAgIHZhciBtYXhYID0gd2lkdGhPZlBhcmVudCAtIHdpZHRoT2ZQb3B1cCAtIDIwOyAvLyAyMCBwaXhlbHMgZ3JhY2VcclxuICAgIGlmICh4ID4gbWF4WCkgeyAvLyBtb3ZlIHBvc2l0aW9uIGxlZnQsIGJhY2sgaW50byB2aWV3XHJcbiAgICAgICAgeCA9IG1heFg7XHJcbiAgICB9XHJcbiAgICBpZiAoeCA8IDApIHsgLy8gaW4gY2FzZSB0aGUgcG9wdXAgaGFzIGEgbmVnYXRpdmUgdmFsdWVcclxuICAgICAgICB4ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBlUG9wdXAuc3R5bGUubGVmdCA9IHggKyBcInB4XCI7XHJcbiAgICBlUG9wdXAuc3R5bGUudG9wID0geSArIFwicHhcIjtcclxufTtcclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLnNob3dGaWx0ZXIgPSBmdW5jdGlvbihjb2xEZWZXcmFwcGVyLCBldmVudFNvdXJjZSkge1xyXG5cclxuICAgIHZhciBmaWx0ZXJXcmFwcGVyID0gdGhpcy5hbGxGaWx0ZXJzW2NvbERlZldyYXBwZXIuY29sS2V5XTtcclxuICAgIHZhciBjb2xEZWYgPSBjb2xEZWZXcmFwcGVyLmNvbERlZjtcclxuXHJcbiAgICBpZiAoIWZpbHRlcldyYXBwZXIpIHtcclxuICAgICAgICBmaWx0ZXJXcmFwcGVyID0ge1xyXG4gICAgICAgICAgICBjb2xLZXk6IGNvbERlZldyYXBwZXIuY29sS2V5LFxyXG4gICAgICAgICAgICBmaWVsZDogY29sRGVmLmZpZWxkXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgZmlsdGVyQ2hhbmdlZENhbGxiYWNrID0gdGhpcy5ncmlkLm9uRmlsdGVyQ2hhbmdlZC5iaW5kKHRoaXMuZ3JpZCk7XHJcbiAgICAgICAgdmFyIGZpbHRlclBhcmFtcyA9IGNvbERlZi5maWx0ZXJQYXJhbXM7XHJcbiAgICAgICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgICAgIHJvd01vZGVsOiB0aGlzLnJvd01vZGVsLFxyXG4gICAgICAgICAgICBmaWx0ZXJDaGFuZ2VkQ2FsbGJhY2s6IGZpbHRlckNoYW5nZWRDYWxsYmFjayxcclxuICAgICAgICAgICAgZmlsdGVyUGFyYW1zOiBmaWx0ZXJQYXJhbXMsXHJcbiAgICAgICAgICAgIHNjb3BlOiBmaWx0ZXJXcmFwcGVyLnNjb3BlXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbERlZi5maWx0ZXIgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgLy8gaWYgdXNlciBwcm92aWRlZCBhIGZpbHRlciwganVzdCB1c2UgaXRcclxuICAgICAgICAgICAgLy8gZmlyc3QgdXAsIGNyZWF0ZSBjaGlsZCBzY29wZSBpZiBuZWVkZWRcclxuICAgICAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzQW5ndWxhckNvbXBpbGVGaWx0ZXJzKCkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzY29wZSA9IHRoaXMuJHNjb3BlLiRuZXcoKTtcclxuICAgICAgICAgICAgICAgIGZpbHRlcldyYXBwZXIuc2NvcGUgPSBzY29wZTtcclxuICAgICAgICAgICAgICAgIHBhcmFtcy4kc2NvcGUgPSBzY29wZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBub3cgY3JlYXRlIGZpbHRlclxyXG4gICAgICAgICAgICBmaWx0ZXJXcmFwcGVyLmZpbHRlciA9IG5ldyBjb2xEZWYuZmlsdGVyKHBhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2xEZWYuZmlsdGVyID09PSAndGV4dCcpIHtcclxuICAgICAgICAgICAgZmlsdGVyV3JhcHBlci5maWx0ZXIgPSBuZXcgU3RyaW5nRmlsdGVyKHBhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2xEZWYuZmlsdGVyID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICBmaWx0ZXJXcmFwcGVyLmZpbHRlciA9IG5ldyBOdW1iZXJGaWx0ZXIocGFyYW1zKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaWx0ZXJXcmFwcGVyLmZpbHRlciA9IG5ldyBTZXRGaWx0ZXIocGFyYW1zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hbGxGaWx0ZXJzW2NvbERlZldyYXBwZXIuY29sS2V5XSA9IGZpbHRlcldyYXBwZXI7XHJcblxyXG4gICAgICAgIGlmICghZmlsdGVyV3JhcHBlci5maWx0ZXIuZ2V0R3VpKSB7IC8vIGJlY2F1c2UgdXNlcnMgY2FuIGRvIGN1c3RvbSBmaWx0ZXJzLCBnaXZlIG5pY2UgZXJyb3IgbWVzc2FnZVxyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGaWx0ZXIgaXMgbWlzc2luZyBtZXRob2QgZ2V0R3VpJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZUZpbHRlckd1aSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGVGaWx0ZXJHdWkuY2xhc3NOYW1lID0gJ2FnLWZpbHRlcic7XHJcbiAgICAgICAgdmFyIGd1aUZyb21GaWx0ZXIgPSBmaWx0ZXJXcmFwcGVyLmZpbHRlci5nZXRHdWkoKTtcclxuICAgICAgICBpZiAodXRpbHMuaXNOb2RlKGd1aUZyb21GaWx0ZXIpIHx8IHV0aWxzLmlzRWxlbWVudChndWlGcm9tRmlsdGVyKSkge1xyXG4gICAgICAgICAgICAvL2EgZG9tIG5vZGUgb3IgZWxlbWVudCB3YXMgcmV0dXJuZWQsIHNvIGFkZCBjaGlsZFxyXG4gICAgICAgICAgICBlRmlsdGVyR3VpLmFwcGVuZENoaWxkKGd1aUZyb21GaWx0ZXIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vb3RoZXJ3aXNlIGFzc3VtZSBpdCB3YXMgaHRtbCwgc28ganVzdCBpbnNlcnRcclxuICAgICAgICAgICAgdmFyIGVUZXh0U3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICAgICAgZVRleHRTcGFuLmlubmVySFRNTCA9IGd1aUZyb21GaWx0ZXI7XHJcbiAgICAgICAgICAgIGVGaWx0ZXJHdWkuYXBwZW5kQ2hpbGQoZVRleHRTcGFuKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChmaWx0ZXJXcmFwcGVyLnNjb3BlKSB7XHJcbiAgICAgICAgICAgIGZpbHRlcldyYXBwZXIuZ3VpID0gdGhpcy4kY29tcGlsZShlRmlsdGVyR3VpKShmaWx0ZXJXcmFwcGVyLnNjb3BlKVswXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaWx0ZXJXcmFwcGVyLmd1aSA9IGVGaWx0ZXJHdWk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICB2YXIgZVBvcHVwUGFyZW50ID0gdGhpcy5ncmlkLmdldFBvcHVwUGFyZW50KCk7XHJcbiAgICB0aGlzLnBvc2l0aW9uUG9wdXAoZXZlbnRTb3VyY2UsIGZpbHRlcldyYXBwZXIuZ3VpLCBlUG9wdXBQYXJlbnQpO1xyXG5cclxuICAgIHV0aWxzLmFkZEFzTW9kYWxQb3B1cChlUG9wdXBQYXJlbnQsIGZpbHRlcldyYXBwZXIuZ3VpKTtcclxuXHJcbiAgICBpZiAoZmlsdGVyV3JhcHBlci5maWx0ZXIuYWZ0ZXJHdWlBdHRhY2hlZCkge1xyXG4gICAgICAgIGZpbHRlcldyYXBwZXIuZmlsdGVyLmFmdGVyR3VpQXR0YWNoZWQoKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRmlsdGVyTWFuYWdlcjtcclxuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL251bWJlckZpbHRlclRlbXBsYXRlLmpzJyk7XHJcblxyXG52YXIgRVFVQUxTID0gMTtcclxudmFyIExFU1NfVEhBTiA9IDI7XHJcbnZhciBHUkVBVEVSX1RIQU4gPSAzO1xyXG5cclxuZnVuY3Rpb24gTnVtYmVyRmlsdGVyKHBhcmFtcykge1xyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2sgPSBwYXJhbXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrO1xyXG4gICAgdGhpcy5jcmVhdGVHdWkoKTtcclxuICAgIHRoaXMuZmlsdGVyTnVtYmVyID0gbnVsbDtcclxuICAgIHRoaXMuZmlsdGVyVHlwZSA9IEVRVUFMUztcclxufVxyXG5cclxuLyogcHVibGljICovXHJcbk51bWJlckZpbHRlci5wcm90b3R5cGUuYWZ0ZXJHdWlBdHRhY2hlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lRmlsdGVyVGV4dEZpZWxkLmZvY3VzKCk7XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5kb2VzRmlsdGVyUGFzcyA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIGlmICh0aGlzLmZpbHRlck51bWJlciA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgdmFyIHZhbHVlID0gbm9kZS52YWx1ZTtcclxuXHJcbiAgICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB2YWx1ZUFzTnVtYmVyO1xyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICB2YWx1ZUFzTnVtYmVyID0gdmFsdWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhbHVlQXNOdW1iZXIgPSBwYXJzZUZsb2F0KHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBzd2l0Y2ggKHRoaXMuZmlsdGVyVHlwZSkge1xyXG4gICAgICAgIGNhc2UgRVFVQUxTOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVBc051bWJlciA9PT0gdGhpcy5maWx0ZXJOdW1iZXI7XHJcbiAgICAgICAgY2FzZSBMRVNTX1RIQU46XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZUFzTnVtYmVyIDw9IHRoaXMuZmlsdGVyTnVtYmVyO1xyXG4gICAgICAgIGNhc2UgR1JFQVRFUl9USEFOOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVBc051bWJlciA+PSB0aGlzLmZpbHRlck51bWJlcjtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvLyBzaG91bGQgbmV2ZXIgaGFwcGVuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbnZhbGlkIGZpbHRlciB0eXBlICcgKyB0aGlzLmZpbHRlclR5cGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5nZXRHdWkgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmVHdWk7XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5pc0ZpbHRlckFjdGl2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyTnVtYmVyICE9PSBudWxsO1xyXG59O1xyXG5cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5jcmVhdGVHdWkgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZUd1aSA9IHV0aWxzLmxvYWRUZW1wbGF0ZSh0ZW1wbGF0ZSk7XHJcbiAgICB0aGlzLmVGaWx0ZXJUZXh0RmllbGQgPSB0aGlzLmVHdWkucXVlcnlTZWxlY3RvcihcIiNmaWx0ZXJUZXh0XCIpO1xyXG4gICAgdGhpcy5lVHlwZVNlbGVjdCA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKFwiI2ZpbHRlclR5cGVcIik7XHJcblxyXG4gICAgdXRpbHMuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5lRmlsdGVyVGV4dEZpZWxkLCB0aGlzLm9uRmlsdGVyQ2hhbmdlZC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZVR5cGVTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCB0aGlzLm9uVHlwZUNoYW5nZWQuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5OdW1iZXJGaWx0ZXIucHJvdG90eXBlLm9uVHlwZUNoYW5nZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZmlsdGVyVHlwZSA9IHBhcnNlSW50KHRoaXMuZVR5cGVTZWxlY3QudmFsdWUpO1xyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2soKTtcclxufTtcclxuXHJcbk51bWJlckZpbHRlci5wcm90b3R5cGUub25GaWx0ZXJDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZmlsdGVyVGV4dCA9IHV0aWxzLm1ha2VOdWxsKHRoaXMuZUZpbHRlclRleHRGaWVsZC52YWx1ZSk7XHJcbiAgICBpZiAoZmlsdGVyVGV4dCAmJiBmaWx0ZXJUZXh0LnRyaW0oKSA9PT0gJycpIHtcclxuICAgICAgICBmaWx0ZXJUZXh0ID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmIChmaWx0ZXJUZXh0KSB7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJOdW1iZXIgPSBwYXJzZUZsb2F0KGZpbHRlclRleHQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmZpbHRlck51bWJlciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICB0aGlzLmZpbHRlckNoYW5nZWRDYWxsYmFjaygpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOdW1iZXJGaWx0ZXI7XHJcbiIsInZhciB0ZW1wbGF0ZSA9IFtcclxuICAgICc8ZGl2PicsXHJcbiAgICAnPGRpdj4nLFxyXG4gICAgJzxzZWxlY3QgY2xhc3M9XCJhZy1maWx0ZXItc2VsZWN0XCIgaWQ9XCJmaWx0ZXJUeXBlXCI+JyxcclxuICAgICc8b3B0aW9uIHZhbHVlPVwiMVwiPkVxdWFsczwvb3B0aW9uPicsXHJcbiAgICAnPG9wdGlvbiB2YWx1ZT1cIjJcIj5MZXNzIHRoYW48L29wdGlvbj4nLFxyXG4gICAgJzxvcHRpb24gdmFsdWU9XCIzXCI+R3JlYXRlciB0aGFuPC9vcHRpb24+JyxcclxuICAgICc8L3NlbGVjdD4nLFxyXG4gICAgJzwvZGl2PicsXHJcbiAgICAnPGRpdj4nLFxyXG4gICAgJzxpbnB1dCBjbGFzcz1cImFnLWZpbHRlci1maWx0ZXJcIiBpZD1cImZpbHRlclRleHRcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiZmlsdGVyLi4uXCIvPicsXHJcbiAgICAnPC9kaXY+JyxcclxuICAgICc8L2Rpdj4nLFxyXG5dLmpvaW4oJycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcclxuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xyXG52YXIgU2V0RmlsdGVyTW9kZWwgPSByZXF1aXJlKCcuL3NldEZpbHRlck1vZGVsJyk7XHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vc2V0RmlsdGVyVGVtcGxhdGUnKTtcclxuXHJcbnZhciBERUZBVUxUX1JPV19IRUlHSFQgPSAyMDtcclxuXHJcbmZ1bmN0aW9uIFNldEZpbHRlcihwYXJhbXMpIHtcclxuICAgIHZhciBmaWx0ZXJQYXJhbXMgPSBwYXJhbXMuZmlsdGVyUGFyYW1zO1xyXG4gICAgdGhpcy5yb3dIZWlnaHQgPSAoZmlsdGVyUGFyYW1zICYmIGZpbHRlclBhcmFtcy5jZWxsSGVpZ2h0KSA/IGZpbHRlclBhcmFtcy5jZWxsSGVpZ2h0IDogREVGQVVMVF9ST1dfSEVJR0hUO1xyXG4gICAgdGhpcy5tb2RlbCA9IG5ldyBTZXRGaWx0ZXJNb2RlbChwYXJhbXMuY29sRGVmLCBwYXJhbXMucm93TW9kZWwpO1xyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2sgPSBwYXJhbXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrO1xyXG4gICAgdGhpcy5yb3dzSW5Cb2R5Q29udGFpbmVyID0ge307XHJcbiAgICB0aGlzLmNvbERlZiA9IHBhcmFtcy5jb2xEZWY7XHJcbiAgICBpZiAoZmlsdGVyUGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5jZWxsUmVuZGVyZXIgPSBmaWx0ZXJQYXJhbXMuY2VsbFJlbmRlcmVyO1xyXG4gICAgfVxyXG4gICAgdGhpcy5jcmVhdGVHdWkoKTtcclxuICAgIHRoaXMuYWRkU2Nyb2xsTGlzdGVuZXIoKTtcclxufVxyXG5cclxuLy8gd2UgbmVlZCB0byBoYXZlIHRoZSBndWkgYXR0YWNoZWQgYmVmb3JlIHdlIGNhbiBkcmF3IHRoZSB2aXJ0dWFsIHJvd3MsIGFzIHRoZVxyXG4vLyB2aXJ0dWFsIHJvdyBsb2dpYyBuZWVkcyBpbmZvIGFib3V0IHRoZSBndWkgc3RhdGVcclxuLyogcHVibGljICovXHJcblNldEZpbHRlci5wcm90b3R5cGUuYWZ0ZXJHdWlBdHRhY2hlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5kcmF3VmlydHVhbFJvd3MoKTtcclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmlzRmlsdGVyQWN0aXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbC5pc0ZpbHRlckFjdGl2ZSgpO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcblNldEZpbHRlci5wcm90b3R5cGUuZG9lc0ZpbHRlclBhc3MgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICB2YXIgdmFsdWUgPSBub2RlLnZhbHVlO1xyXG4gICAgdmFyIG1vZGVsID0gbm9kZS5tb2RlbDtcclxuICAgIC8vaWYgbm8gZmlsdGVyLCBhbHdheXMgcGFzc1xyXG4gICAgaWYgKG1vZGVsLmlzRXZlcnl0aGluZ1NlbGVjdGVkKCkpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIC8vaWYgbm90aGluZyBzZWxlY3RlZCBpbiBmaWx0ZXIsIGFsd2F5cyBmYWlsXHJcbiAgICBpZiAobW9kZWwuaXNOb3RoaW5nU2VsZWN0ZWQoKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YWx1ZSA9IHV0aWxzLm1ha2VOdWxsKHZhbHVlKTtcclxuICAgIHZhciBmaWx0ZXJQYXNzZWQgPSBtb2RlbC5zZWxlY3RlZFZhbHVlc01hcFt2YWx1ZV0gIT09IHVuZGVmaW5lZDtcclxuICAgIHJldHVybiBmaWx0ZXJQYXNzZWQ7XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5nZXRHdWkgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmVHdWk7XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5vbk5ld1Jvd3NMb2FkZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMubW9kZWwuc2VsZWN0RXZlcnl0aGluZygpO1xyXG4gICAgdGhpcy51cGRhdGVBbGxDaGVja2JveGVzKHRydWUpO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcblNldEZpbHRlci5wcm90b3R5cGUuZ2V0TW9kZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLm1vZGVsO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5jcmVhdGVHdWkgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgdGhpcy5lR3VpID0gdXRpbHMubG9hZFRlbXBsYXRlKHRlbXBsYXRlKTtcclxuXHJcbiAgICB0aGlzLmVMaXN0Q29udGFpbmVyID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIuYWctZmlsdGVyLWxpc3QtY29udGFpbmVyXCIpO1xyXG4gICAgdGhpcy5lRmlsdGVyVmFsdWVUZW1wbGF0ZSA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKFwiI2l0ZW1Gb3JSZXBlYXRcIik7XHJcbiAgICB0aGlzLmVTZWxlY3RBbGwgPSB0aGlzLmVHdWkucXVlcnlTZWxlY3RvcihcIiNzZWxlY3RBbGxcIik7XHJcbiAgICB0aGlzLmVMaXN0Vmlld3BvcnQgPSB0aGlzLmVHdWkucXVlcnlTZWxlY3RvcihcIi5hZy1maWx0ZXItbGlzdC12aWV3cG9ydFwiKTtcclxuICAgIHRoaXMuZU1pbmlGaWx0ZXIgPSB0aGlzLmVHdWkucXVlcnlTZWxlY3RvcihcIi5hZy1maWx0ZXItZmlsdGVyXCIpO1xyXG4gICAgdGhpcy5lTGlzdENvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSAodGhpcy5tb2RlbC5nZXRVbmlxdWVWYWx1ZUNvdW50KCkgKiB0aGlzLnJvd0hlaWdodCkgKyBcInB4XCI7XHJcblxyXG4gICAgdGhpcy5zZXRDb250YWluZXJIZWlnaHQoKTtcclxuICAgIHRoaXMuZU1pbmlGaWx0ZXIudmFsdWUgPSB0aGlzLm1vZGVsLmdldE1pbmlGaWx0ZXIoKTtcclxuICAgIHV0aWxzLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuZU1pbmlGaWx0ZXIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF90aGlzLm9uRmlsdGVyQ2hhbmdlZCgpO1xyXG4gICAgfSk7XHJcbiAgICB1dGlscy5yZW1vdmVBbGxDaGlsZHJlbih0aGlzLmVMaXN0Q29udGFpbmVyKTtcclxuXHJcbiAgICB0aGlzLmVTZWxlY3RBbGwub25jbGljayA9IHRoaXMub25TZWxlY3RBbGwuYmluZCh0aGlzKTtcclxuXHJcbiAgICBpZiAodGhpcy5tb2RlbC5pc0V2ZXJ5dGhpbmdTZWxlY3RlZCgpKSB7XHJcbiAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmVTZWxlY3RBbGwuY2hlY2tlZCA9IHRydWU7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMubW9kZWwuaXNOb3RoaW5nU2VsZWN0ZWQoKSkge1xyXG4gICAgICAgIHRoaXMuZVNlbGVjdEFsbC5pbmRldGVybWluYXRlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmNoZWNrZWQgPSBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmluZGV0ZXJtaW5hdGUgPSB0cnVlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5zZXRDb250YWluZXJIZWlnaHQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZUxpc3RDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gKHRoaXMubW9kZWwuZ2V0RGlzcGxheWVkVmFsdWVDb3VudCgpICogdGhpcy5yb3dIZWlnaHQpICsgXCJweFwiO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5kcmF3VmlydHVhbFJvd3MgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0b3BQaXhlbCA9IHRoaXMuZUxpc3RWaWV3cG9ydC5zY3JvbGxUb3A7XHJcbiAgICB2YXIgYm90dG9tUGl4ZWwgPSB0b3BQaXhlbCArIHRoaXMuZUxpc3RWaWV3cG9ydC5vZmZzZXRIZWlnaHQ7XHJcblxyXG4gICAgdmFyIGZpcnN0Um93ID0gTWF0aC5mbG9vcih0b3BQaXhlbCAvIHRoaXMucm93SGVpZ2h0KTtcclxuICAgIHZhciBsYXN0Um93ID0gTWF0aC5mbG9vcihib3R0b21QaXhlbCAvIHRoaXMucm93SGVpZ2h0KTtcclxuXHJcbiAgICB0aGlzLmVuc3VyZVJvd3NSZW5kZXJlZChmaXJzdFJvdywgbGFzdFJvdyk7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmVuc3VyZVJvd3NSZW5kZXJlZCA9IGZ1bmN0aW9uKHN0YXJ0LCBmaW5pc2gpIHtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgLy9hdCB0aGUgZW5kLCB0aGlzIGFycmF5IHdpbGwgY29udGFpbiB0aGUgaXRlbXMgd2UgbmVlZCB0byByZW1vdmVcclxuICAgIHZhciByb3dzVG9SZW1vdmUgPSBPYmplY3Qua2V5cyh0aGlzLnJvd3NJbkJvZHlDb250YWluZXIpO1xyXG5cclxuICAgIC8vYWRkIGluIG5ldyByb3dzXHJcbiAgICBmb3IgKHZhciByb3dJbmRleCA9IHN0YXJ0OyByb3dJbmRleCA8PSBmaW5pc2g7IHJvd0luZGV4KyspIHtcclxuICAgICAgICAvL3NlZSBpZiBpdGVtIGFscmVhZHkgdGhlcmUsIGFuZCBpZiB5ZXMsIHRha2UgaXQgb3V0IG9mIHRoZSAndG8gcmVtb3ZlJyBhcnJheVxyXG4gICAgICAgIGlmIChyb3dzVG9SZW1vdmUuaW5kZXhPZihyb3dJbmRleC50b1N0cmluZygpKSA+PSAwKSB7XHJcbiAgICAgICAgICAgIHJvd3NUb1JlbW92ZS5zcGxpY2Uocm93c1RvUmVtb3ZlLmluZGV4T2Yocm93SW5kZXgudG9TdHJpbmcoKSksIDEpO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9jaGVjayB0aGlzIHJvdyBhY3R1YWxseSBleGlzdHMgKGluIGNhc2Ugb3ZlcmZsb3cgYnVmZmVyIHdpbmRvdyBleGNlZWRzIHJlYWwgZGF0YSlcclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5nZXREaXNwbGF5ZWRWYWx1ZUNvdW50KCkgPiByb3dJbmRleCkge1xyXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLm1vZGVsLmdldERpc3BsYXllZFZhbHVlKHJvd0luZGV4KTtcclxuICAgICAgICAgICAgX3RoaXMuaW5zZXJ0Um93KHZhbHVlLCByb3dJbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vYXQgdGhpcyBwb2ludCwgZXZlcnl0aGluZyBpbiBvdXIgJ3Jvd3NUb1JlbW92ZScgLiAuIC5cclxuICAgIHRoaXMucmVtb3ZlVmlydHVhbFJvd3Mocm93c1RvUmVtb3ZlKTtcclxufTtcclxuXHJcbi8vdGFrZXMgYXJyYXkgb2Ygcm93IGlkJ3NcclxuU2V0RmlsdGVyLnByb3RvdHlwZS5yZW1vdmVWaXJ0dWFsUm93cyA9IGZ1bmN0aW9uKHJvd3NUb1JlbW92ZSkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgIHJvd3NUb1JlbW92ZS5mb3JFYWNoKGZ1bmN0aW9uKGluZGV4VG9SZW1vdmUpIHtcclxuICAgICAgICB2YXIgZVJvd1RvUmVtb3ZlID0gX3RoaXMucm93c0luQm9keUNvbnRhaW5lcltpbmRleFRvUmVtb3ZlXTtcclxuICAgICAgICBfdGhpcy5lTGlzdENvbnRhaW5lci5yZW1vdmVDaGlsZChlUm93VG9SZW1vdmUpO1xyXG4gICAgICAgIGRlbGV0ZSBfdGhpcy5yb3dzSW5Cb2R5Q29udGFpbmVyW2luZGV4VG9SZW1vdmVdO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmluc2VydFJvdyA9IGZ1bmN0aW9uKHZhbHVlLCByb3dJbmRleCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICB2YXIgZUZpbHRlclZhbHVlID0gdGhpcy5lRmlsdGVyVmFsdWVUZW1wbGF0ZS5jbG9uZU5vZGUodHJ1ZSk7XHJcblxyXG4gICAgdmFyIHZhbHVlRWxlbWVudCA9IGVGaWx0ZXJWYWx1ZS5xdWVyeVNlbGVjdG9yKFwiLmFnLWZpbHRlci12YWx1ZVwiKTtcclxuICAgIGlmICh0aGlzLmNlbGxSZW5kZXJlcikge1xyXG4gICAgICAgIC8vcmVuZGVyZXIgcHJvdmlkZWQsIHNvIHVzZSBpdFxyXG4gICAgICAgIHZhciByZXN1bHRGcm9tUmVuZGVyZXIgPSB0aGlzLmNlbGxSZW5kZXJlcih7XHJcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAodXRpbHMuaXNOb2RlKHJlc3VsdEZyb21SZW5kZXJlcikgfHwgdXRpbHMuaXNFbGVtZW50KHJlc3VsdEZyb21SZW5kZXJlcikpIHtcclxuICAgICAgICAgICAgLy9hIGRvbSBub2RlIG9yIGVsZW1lbnQgd2FzIHJldHVybmVkLCBzbyBhZGQgY2hpbGRcclxuICAgICAgICAgICAgdmFsdWVFbGVtZW50LmFwcGVuZENoaWxkKHJlc3VsdEZyb21SZW5kZXJlcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy9vdGhlcndpc2UgYXNzdW1lIGl0IHdhcyBodG1sLCBzbyBqdXN0IGluc2VydFxyXG4gICAgICAgICAgICB2YWx1ZUVsZW1lbnQuaW5uZXJIVE1MID0gcmVzdWx0RnJvbVJlbmRlcmVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vb3RoZXJ3aXNlIGRpc3BsYXkgYXMgYSBzdHJpbmdcclxuICAgICAgICB2YXIgZGlzcGxheU5hbWVPZlZhbHVlID0gdmFsdWUgPT09IG51bGwgPyBcIihCbGFua3MpXCIgOiB2YWx1ZTtcclxuICAgICAgICB2YWx1ZUVsZW1lbnQuaW5uZXJIVE1MID0gZGlzcGxheU5hbWVPZlZhbHVlO1xyXG4gICAgfVxyXG4gICAgdmFyIGVDaGVja2JveCA9IGVGaWx0ZXJWYWx1ZS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRcIik7XHJcbiAgICBlQ2hlY2tib3guY2hlY2tlZCA9IHRoaXMubW9kZWwuaXNWYWx1ZVNlbGVjdGVkKHZhbHVlKTtcclxuXHJcbiAgICBlQ2hlY2tib3gub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF90aGlzLm9uQ2hlY2tib3hDbGlja2VkKGVDaGVja2JveCwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGVGaWx0ZXJWYWx1ZS5zdHlsZS50b3AgPSAodGhpcy5yb3dIZWlnaHQgKiByb3dJbmRleCkgKyBcInB4XCI7XHJcblxyXG4gICAgdGhpcy5lTGlzdENvbnRhaW5lci5hcHBlbmRDaGlsZChlRmlsdGVyVmFsdWUpO1xyXG4gICAgdGhpcy5yb3dzSW5Cb2R5Q29udGFpbmVyW3Jvd0luZGV4XSA9IGVGaWx0ZXJWYWx1ZTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUub25DaGVja2JveENsaWNrZWQgPSBmdW5jdGlvbihlQ2hlY2tib3gsIHZhbHVlKSB7XHJcbiAgICB2YXIgY2hlY2tlZCA9IGVDaGVja2JveC5jaGVja2VkO1xyXG4gICAgaWYgKGNoZWNrZWQpIHtcclxuICAgICAgICB0aGlzLm1vZGVsLnNlbGVjdFZhbHVlKHZhbHVlKTtcclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5pc0V2ZXJ5dGhpbmdTZWxlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZVNlbGVjdEFsbC5pbmRldGVybWluYXRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZVNlbGVjdEFsbC5jaGVja2VkID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm1vZGVsLnVuc2VsZWN0VmFsdWUodmFsdWUpO1xyXG4gICAgICAgIC8vaWYgc2V0IGlzIGVtcHR5LCBub3RoaW5nIGlzIHNlbGVjdGVkXHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwuaXNOb3RoaW5nU2VsZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmVTZWxlY3RBbGwuY2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZVNlbGVjdEFsbC5pbmRldGVybWluYXRlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2soKTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUub25GaWx0ZXJDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbWluaUZpbHRlckNoYW5nZWQgPSB0aGlzLm1vZGVsLnNldE1pbmlGaWx0ZXIodGhpcy5lTWluaUZpbHRlci52YWx1ZSk7XHJcbiAgICBpZiAobWluaUZpbHRlckNoYW5nZWQpIHtcclxuICAgICAgICB0aGlzLnNldENvbnRhaW5lckhlaWdodCgpO1xyXG4gICAgICAgIHRoaXMuY2xlYXJWaXJ0dWFsUm93cygpO1xyXG4gICAgICAgIHRoaXMuZHJhd1ZpcnR1YWxSb3dzKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmNsZWFyVmlydHVhbFJvd3MgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciByb3dzVG9SZW1vdmUgPSBPYmplY3Qua2V5cyh0aGlzLnJvd3NJbkJvZHlDb250YWluZXIpO1xyXG4gICAgdGhpcy5yZW1vdmVWaXJ0dWFsUm93cyhyb3dzVG9SZW1vdmUpO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5vblNlbGVjdEFsbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNoZWNrZWQgPSB0aGlzLmVTZWxlY3RBbGwuY2hlY2tlZDtcclxuICAgIGlmIChjaGVja2VkKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZWxlY3RFdmVyeXRoaW5nKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubW9kZWwuc2VsZWN0Tm90aGluZygpO1xyXG4gICAgfVxyXG4gICAgdGhpcy51cGRhdGVBbGxDaGVja2JveGVzKGNoZWNrZWQpO1xyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2soKTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUudXBkYXRlQWxsQ2hlY2tib3hlcyA9IGZ1bmN0aW9uKGNoZWNrZWQpIHtcclxuICAgIHZhciBjdXJyZW50bHlEaXNwbGF5ZWRDaGVja2JveGVzID0gdGhpcy5lTGlzdENvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiW2ZpbHRlci1jaGVja2JveD10cnVlXVwiKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY3VycmVudGx5RGlzcGxheWVkQ2hlY2tib3hlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBjdXJyZW50bHlEaXNwbGF5ZWRDaGVja2JveGVzW2ldLmNoZWNrZWQgPSBjaGVja2VkO1xyXG4gICAgfVxyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5hZGRTY3JvbGxMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICB0aGlzLmVMaXN0Vmlld3BvcnQuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBfdGhpcy5kcmF3VmlydHVhbFJvd3MoKTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZXRGaWx0ZXI7XHJcbiIsIiAgICB2YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xyXG5cclxuICAgIGZ1bmN0aW9uIFNldEZpbHRlck1vZGVsKGNvbERlZiwgcm93TW9kZWwpIHtcclxuXHJcbiAgICAgICAgaWYgKGNvbERlZi5maWx0ZXJQYXJhbXMgJiYgY29sRGVmLmZpbHRlclBhcmFtcy52YWx1ZXMpIHtcclxuICAgICAgICAgICAgdGhpcy51bmlxdWVWYWx1ZXMgPSBjb2xEZWYuZmlsdGVyUGFyYW1zLnZhbHVlcztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVVuaXF1ZVZhbHVlcyhyb3dNb2RlbCwgY29sRGVmLmZpZWxkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb2xEZWYuY29tcGFyYXRvcikge1xyXG4gICAgICAgICAgICB0aGlzLnVuaXF1ZVZhbHVlcy5zb3J0KGNvbERlZi5jb21wYXJhdG9yKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnVuaXF1ZVZhbHVlcy5zb3J0KHV0aWxzLmRlZmF1bHRDb21wYXJhdG9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZGlzcGxheWVkVmFsdWVzID0gdGhpcy51bmlxdWVWYWx1ZXM7XHJcbiAgICAgICAgdGhpcy5taW5pRmlsdGVyID0gbnVsbDtcclxuICAgICAgICAvL3dlIHVzZSBhIG1hcCByYXRoZXIgdGhhbiBhbiBhcnJheSBmb3IgdGhlIHNlbGVjdGVkIHZhbHVlcyBhcyB0aGUgbG9va3VwXHJcbiAgICAgICAgLy9mb3IgYSBtYXAgaXMgbXVjaCBmYXN0ZXIgdGhhbiB0aGUgbG9va3VwIGZvciBhbiBhcnJheSwgZXNwZWNpYWxseSB3aGVuXHJcbiAgICAgICAgLy90aGUgbGVuZ3RoIG9mIHRoZSBhcnJheSBpcyB0aG91c2FuZHMgb2YgcmVjb3JkcyBsb25nXHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZFZhbHVlc01hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuc2VsZWN0RXZlcnl0aGluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIFNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5jcmVhdGVVbmlxdWVWYWx1ZXMgPSBmdW5jdGlvbihyb3dNb2RlbCwga2V5KSB7XHJcbiAgICAgICAgdmFyIHVuaXF1ZUNoZWNrID0ge307XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gcm93TW9kZWwuZ2V0VmlydHVhbFJvd0NvdW50KCk7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSByb3dNb2RlbC5nZXRWaXJ0dWFsUm93KGkpLmRhdGE7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGRhdGEgPyBkYXRhW2tleV0gOiBudWxsO1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IFwiXCIgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdW5pcXVlQ2hlY2suaGFzT3duUHJvcGVydHkodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB1bmlxdWVDaGVja1t2YWx1ZV0gPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudW5pcXVlVmFsdWVzID0gcmVzdWx0O1xyXG4gICAgfTtcclxuXHJcbiAgICAvL3NldHMgbWluaSBmaWx0ZXIuIHJldHVybnMgdHJ1ZSBpZiBpdCBjaGFuZ2VkIGZyb20gbGFzdCB2YWx1ZSwgb3RoZXJ3aXNlIGZhbHNlXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuc2V0TWluaUZpbHRlciA9IGZ1bmN0aW9uKG5ld01pbmlGaWx0ZXIpIHtcclxuICAgICAgICBuZXdNaW5pRmlsdGVyID0gdXRpbHMubWFrZU51bGwobmV3TWluaUZpbHRlcik7XHJcbiAgICAgICAgaWYgKHRoaXMubWluaUZpbHRlciA9PT0gbmV3TWluaUZpbHRlcikge1xyXG4gICAgICAgICAgICAvL2RvIG5vdGhpbmcgaWYgZmlsdGVyIGhhcyBub3QgY2hhbmdlZFxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubWluaUZpbHRlciA9IG5ld01pbmlGaWx0ZXI7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJEaXNwbGF5ZWRWYWx1ZXMoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmdldE1pbmlGaWx0ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5taW5pRmlsdGVyO1xyXG4gICAgfTtcclxuXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuZmlsdGVyRGlzcGxheWVkVmFsdWVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gaWYgbm8gZmlsdGVyLCBqdXN0IHVzZSB0aGUgdW5pcXVlIHZhbHVlc1xyXG4gICAgICAgIGlmICh0aGlzLm1pbmlGaWx0ZXIgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5ZWRWYWx1ZXMgPSB0aGlzLnVuaXF1ZVZhbHVlcztcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaWYgZmlsdGVyIHByZXNlbnQsIHdlIGZpbHRlciBkb3duIHRoZSBsaXN0XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5ZWRWYWx1ZXMgPSBbXTtcclxuICAgICAgICB2YXIgbWluaUZpbHRlclVwcGVyQ2FzZSA9IHRoaXMubWluaUZpbHRlci50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy51bmlxdWVWYWx1ZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB1bmlxdWVWYWx1ZSA9IHRoaXMudW5pcXVlVmFsdWVzW2ldO1xyXG4gICAgICAgICAgICBpZiAodW5pcXVlVmFsdWUgIT09IG51bGwgJiYgdW5pcXVlVmFsdWUudG9TdHJpbmcoKS50b1VwcGVyQ2FzZSgpLmluZGV4T2YobWluaUZpbHRlclVwcGVyQ2FzZSkgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5ZWRWYWx1ZXMucHVzaCh1bmlxdWVWYWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuZ2V0RGlzcGxheWVkVmFsdWVDb3VudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRpc3BsYXllZFZhbHVlcy5sZW5ndGg7XHJcbiAgICB9O1xyXG5cclxuICAgIFNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5nZXREaXNwbGF5ZWRWYWx1ZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlzcGxheWVkVmFsdWVzW2luZGV4XTtcclxuICAgIH07XHJcblxyXG4gICAgU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLnNlbGVjdEV2ZXJ5dGhpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY291bnQgPSB0aGlzLnVuaXF1ZVZhbHVlcy5sZW5ndGg7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMudW5pcXVlVmFsdWVzW2ldO1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkVmFsdWVzTWFwW3ZhbHVlXSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRWYWx1ZXNDb3VudCA9IGNvdW50O1xyXG4gICAgfTtcclxuXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuaXNGaWx0ZXJBY3RpdmUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51bmlxdWVWYWx1ZXMubGVuZ3RoICE9PSB0aGlzLnNlbGVjdGVkVmFsdWVzQ291bnQ7XHJcbiAgICB9O1xyXG5cclxuICAgIFNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5zZWxlY3ROb3RoaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZFZhbHVlc01hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRWYWx1ZXNDb3VudCA9IDA7XHJcbiAgICB9O1xyXG5cclxuICAgIFNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5nZXRVbmlxdWVWYWx1ZUNvdW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudW5pcXVlVmFsdWVzLmxlbmd0aDtcclxuICAgIH07XHJcblxyXG4gICAgU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLnVuc2VsZWN0VmFsdWUgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkVmFsdWVzTWFwW3ZhbHVlXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnNlbGVjdGVkVmFsdWVzTWFwW3ZhbHVlXTtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFZhbHVlc0NvdW50LS07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuc2VsZWN0VmFsdWUgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkVmFsdWVzTWFwW3ZhbHVlXSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRWYWx1ZXNNYXBbdmFsdWVdID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFZhbHVlc0NvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuaXNWYWx1ZVNlbGVjdGVkID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZFZhbHVlc01hcFt2YWx1ZV0gIT09IHVuZGVmaW5lZDtcclxuICAgIH07XHJcblxyXG4gICAgU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmlzRXZlcnl0aGluZ1NlbGVjdGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudW5pcXVlVmFsdWVzLmxlbmd0aCA9PT0gdGhpcy5zZWxlY3RlZFZhbHVlc0NvdW50O1xyXG4gICAgfTtcclxuXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuaXNOb3RoaW5nU2VsZWN0ZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51bmlxdWVWYWx1ZXMubGVuZ3RoID09PSAwO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNldEZpbHRlck1vZGVsO1xyXG4iLCJ2YXIgdGVtcGxhdGUgPSBbXHJcbiAgICAnPGRpdj4nLFxyXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYWctZmlsdGVyLWhlYWRlci1jb250YWluZXJcIj4nLFxyXG4gICAgJyAgICAgICAgPGlucHV0IGNsYXNzPVwiYWctZmlsdGVyLWZpbHRlclwiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJzZWFyY2guLi5cIi8+JyxcclxuICAgICcgICAgPC9kaXY+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLWZpbHRlci1oZWFkZXItY29udGFpbmVyXCI+JyxcclxuICAgICcgICAgICAgIDxsYWJlbD4nLFxyXG4gICAgJyAgICAgICAgICAgIDxpbnB1dCBpZD1cInNlbGVjdEFsbFwiIHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwiYWctZmlsdGVyLWNoZWNrYm94XCIvPicsXHJcbiAgICAnICAgICAgICAgICAgKFNlbGVjdCBBbGwpJyxcclxuICAgICcgICAgICAgIDwvbGFiZWw+JyxcclxuICAgICcgICAgPC9kaXY+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLWZpbHRlci1saXN0LXZpZXdwb3J0XCI+JyxcclxuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJhZy1maWx0ZXItbGlzdC1jb250YWluZXJcIj4nLFxyXG4gICAgJyAgICAgICAgICAgIDxkaXYgaWQ9XCJpdGVtRm9yUmVwZWF0XCIgY2xhc3M9XCJhZy1maWx0ZXItaXRlbVwiPicsXHJcbiAgICAnICAgICAgICAgICAgICAgIDxsYWJlbD4nLFxyXG4gICAgJyAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwiYWctZmlsdGVyLWNoZWNrYm94XCIgZmlsdGVyLWNoZWNrYm94PVwidHJ1ZVwiLz4nLFxyXG4gICAgJyAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJhZy1maWx0ZXItdmFsdWVcIj48L3NwYW4+JyxcclxuICAgICcgICAgICAgICAgICAgICAgPC9sYWJlbD4nLFxyXG4gICAgJyAgICAgICAgICAgIDwvZGl2PicsXHJcbiAgICAnICAgICAgICA8L2Rpdj4nLFxyXG4gICAgJyAgICA8L2Rpdj4nLFxyXG4gICAgJzwvZGl2PicsXHJcbl0uam9pbignJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xyXG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL3RleHRGaWx0ZXJUZW1wbGF0ZScpO1xyXG5cclxudmFyIENPTlRBSU5TID0gMTtcclxudmFyIEVRVUFMUyA9IDI7XHJcbnZhciBTVEFSVFNfV0lUSCA9IDM7XHJcbnZhciBFTkRTX1dJVEggPSA0O1xyXG5cclxuZnVuY3Rpb24gVGV4dEZpbHRlcihwYXJhbXMpIHtcclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrID0gcGFyYW1zLmZpbHRlckNoYW5nZWRDYWxsYmFjaztcclxuICAgIHRoaXMuY3JlYXRlR3VpKCk7XHJcbiAgICB0aGlzLmZpbHRlclRleHQgPSBudWxsO1xyXG4gICAgdGhpcy5maWx0ZXJUeXBlID0gQ09OVEFJTlM7XHJcbn1cclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5UZXh0RmlsdGVyLnByb3RvdHlwZS5hZnRlckd1aUF0dGFjaGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVGaWx0ZXJUZXh0RmllbGQuZm9jdXMoKTtcclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5UZXh0RmlsdGVyLnByb3RvdHlwZS5kb2VzRmlsdGVyUGFzcyA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIGlmICghdGhpcy5maWx0ZXJUZXh0KSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICB2YXIgdmFsdWUgPSBub2RlLnZhbHVlO1xyXG4gICAgaWYgKCF2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHZhciB2YWx1ZUxvd2VyQ2FzZSA9IHZhbHVlLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKTtcclxuICAgIHN3aXRjaCAodGhpcy5maWx0ZXJUeXBlKSB7XHJcbiAgICAgICAgY2FzZSBDT05UQUlOUzpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlTG93ZXJDYXNlLmluZGV4T2YodGhpcy5maWx0ZXJUZXh0KSA+PSAwO1xyXG4gICAgICAgIGNhc2UgRVFVQUxTOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVMb3dlckNhc2UgPT09IHRoaXMuZmlsdGVyVGV4dDtcclxuICAgICAgICBjYXNlIFNUQVJUU19XSVRIOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVMb3dlckNhc2UuaW5kZXhPZih0aGlzLmZpbHRlclRleHQpID09PSAwO1xyXG4gICAgICAgIGNhc2UgRU5EU19XSVRIOlxyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSB2YWx1ZUxvd2VyQ2FzZS5pbmRleE9mKHRoaXMuZmlsdGVyVGV4dCk7XHJcbiAgICAgICAgICAgIHJldHVybiBpbmRleCA+PSAwICYmIGluZGV4ID09PSAodmFsdWVMb3dlckNhc2UubGVuZ3RoIC0gdGhpcy5maWx0ZXJUZXh0Lmxlbmd0aCk7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLy8gc2hvdWxkIG5ldmVyIGhhcHBlblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnaW52YWxpZCBmaWx0ZXIgdHlwZSAnICsgdGhpcy5maWx0ZXJUeXBlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLmdldEd1aSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZUd1aTtcclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5UZXh0RmlsdGVyLnByb3RvdHlwZS5pc0ZpbHRlckFjdGl2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyVGV4dCAhPT0gbnVsbDtcclxufTtcclxuXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLmNyZWF0ZUd1aSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lR3VpID0gdXRpbHMubG9hZFRlbXBsYXRlKHRlbXBsYXRlKTtcclxuICAgIHRoaXMuZUZpbHRlclRleHRGaWVsZCA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKFwiI2ZpbHRlclRleHRcIik7XHJcbiAgICB0aGlzLmVUeXBlU2VsZWN0ID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIjZmlsdGVyVHlwZVwiKTtcclxuXHJcbiAgICB1dGlscy5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLmVGaWx0ZXJUZXh0RmllbGQsIHRoaXMub25GaWx0ZXJDaGFuZ2VkLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5lVHlwZVNlbGVjdC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIHRoaXMub25UeXBlQ2hhbmdlZC5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLm9uVHlwZUNoYW5nZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZmlsdGVyVHlwZSA9IHBhcnNlSW50KHRoaXMuZVR5cGVTZWxlY3QudmFsdWUpO1xyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2soKTtcclxufTtcclxuXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLm9uRmlsdGVyQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGZpbHRlclRleHQgPSB1dGlscy5tYWtlTnVsbCh0aGlzLmVGaWx0ZXJUZXh0RmllbGQudmFsdWUpO1xyXG4gICAgaWYgKGZpbHRlclRleHQgJiYgZmlsdGVyVGV4dC50cmltKCkgPT09ICcnKSB7XHJcbiAgICAgICAgZmlsdGVyVGV4dCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAoZmlsdGVyVGV4dCkge1xyXG4gICAgICAgIHRoaXMuZmlsdGVyVGV4dCA9IGZpbHRlclRleHQudG9Mb3dlckNhc2UoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJUZXh0ID0gbnVsbDtcclxuICAgIH1cclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRleHRGaWx0ZXI7XHJcbiIsInZhciB0ZW1wbGF0ZSA9IFtcclxuICAgICc8ZGl2PicsXHJcbiAgICAnPGRpdj4nLFxyXG4gICAgJzxzZWxlY3QgY2xhc3M9XCJhZy1maWx0ZXItc2VsZWN0XCIgaWQ9XCJmaWx0ZXJUeXBlXCI+JyxcclxuICAgICc8b3B0aW9uIHZhbHVlPVwiMVwiPkNvbnRhaW5zPC9vcHRpb24+JyxcclxuICAgICc8b3B0aW9uIHZhbHVlPVwiMlwiPkVxdWFsczwvb3B0aW9uPicsXHJcbiAgICAnPG9wdGlvbiB2YWx1ZT1cIjNcIj5TdGFydHMgd2l0aDwvb3B0aW9uPicsXHJcbiAgICAnPG9wdGlvbiB2YWx1ZT1cIjRcIj5FbmRzIHdpdGg8L29wdGlvbj4nLFxyXG4gICAgJzwvc2VsZWN0PicsXHJcbiAgICAnPC9kaXY+JyxcclxuICAgICc8ZGl2PicsXHJcbiAgICAnPGlucHV0IGNsYXNzPVwiYWctZmlsdGVyLWZpbHRlclwiIGlkPVwiZmlsdGVyVGV4dFwiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJmaWx0ZXIuLi5cIi8+JyxcclxuICAgICc8L2Rpdj4nLFxyXG4gICAgJzwvZGl2PicsXHJcbl0uam9pbignJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xyXG4iLCJ2YXIgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcclxudmFyIEdyaWRPcHRpb25zV3JhcHBlciA9IHJlcXVpcmUoJy4vZ3JpZE9wdGlvbnNXcmFwcGVyJyk7XHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUuanMnKTtcclxudmFyIHRlbXBsYXRlTm9TY3JvbGxzID0gcmVxdWlyZSgnLi90ZW1wbGF0ZU5vU2Nyb2xscy5qcycpO1xyXG52YXIgU2VsZWN0aW9uQ29udHJvbGxlciA9IHJlcXVpcmUoJy4vc2VsZWN0aW9uQ29udHJvbGxlcicpO1xyXG52YXIgRmlsdGVyTWFuYWdlciA9IHJlcXVpcmUoJy4vZmlsdGVyL2ZpbHRlck1hbmFnZXInKTtcclxudmFyIFNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSA9IHJlcXVpcmUoJy4vc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5Jyk7XHJcbnZhciBDb2x1bW5Db250cm9sbGVyID0gcmVxdWlyZSgnLi9jb2x1bW5Db250cm9sbGVyJyk7XHJcbnZhciBSb3dSZW5kZXJlciA9IHJlcXVpcmUoJy4vcm93UmVuZGVyZXInKTtcclxudmFyIEhlYWRlclJlbmRlcmVyID0gcmVxdWlyZSgnLi9oZWFkZXJSZW5kZXJlcicpO1xyXG52YXIgSW5NZW1vcnlSb3dDb250cm9sbGVyID0gcmVxdWlyZSgnLi9pbk1lbW9yeVJvd0NvbnRyb2xsZXInKTtcclxudmFyIFZpcnR1YWxQYWdlUm93Q29udHJvbGxlciA9IHJlcXVpcmUoJy4vdmlydHVhbFBhZ2VSb3dDb250cm9sbGVyJyk7XHJcbnZhciBQYWdpbmF0aW9uQ29udHJvbGxlciA9IHJlcXVpcmUoJy4vcGFnaW5hdGlvbkNvbnRyb2xsZXInKTtcclxuXHJcbmZ1bmN0aW9uIEdyaWQoZUdyaWREaXYsIGdyaWRPcHRpb25zLCAkc2NvcGUsICRjb21waWxlKSB7XHJcblxyXG4gICAgdGhpcy5ncmlkT3B0aW9ucyA9IGdyaWRPcHRpb25zO1xyXG4gICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIgPSBuZXcgR3JpZE9wdGlvbnNXcmFwcGVyKHRoaXMuZ3JpZE9wdGlvbnMpO1xyXG5cclxuICAgIHZhciB1c2VTY3JvbGxzID0gIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9udFVzZVNjcm9sbHMoKTtcclxuICAgIGlmICh1c2VTY3JvbGxzKSB7XHJcbiAgICAgICAgZUdyaWREaXYuaW5uZXJIVE1MID0gdGVtcGxhdGU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVHcmlkRGl2LmlubmVySFRNTCA9IHRlbXBsYXRlTm9TY3JvbGxzO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHRoaXMucXVpY2tGaWx0ZXIgPSBudWxsO1xyXG5cclxuICAgIC8vIGlmIHVzaW5nIGFuZ3VsYXIsIHdhdGNoIGZvciBxdWlja0ZpbHRlciBjaGFuZ2VzXHJcbiAgICBpZiAoJHNjb3BlKSB7XHJcbiAgICAgICAgJHNjb3BlLiR3YXRjaChcImFuZ3VsYXJHcmlkLnF1aWNrRmlsdGVyVGV4dFwiLCBmdW5jdGlvbihuZXdGaWx0ZXIpIHtcclxuICAgICAgICAgICAgdGhhdC5vblF1aWNrRmlsdGVyQ2hhbmdlZChuZXdGaWx0ZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudmlydHVhbFJvd0NhbGxiYWNrcyA9IHt9O1xyXG5cclxuICAgIHRoaXMuYWRkQXBpKCk7XHJcbiAgICB0aGlzLmZpbmRBbGxFbGVtZW50cyhlR3JpZERpdik7XHJcbiAgICB0aGlzLmNyZWF0ZUFuZFdpcmVCZWFucygkc2NvcGUsICRjb21waWxlLCBlR3JpZERpdiwgdXNlU2Nyb2xscyk7XHJcblxyXG4gICAgdGhpcy5pbk1lbW9yeVJvd0NvbnRyb2xsZXIuc2V0QWxsUm93cyh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBbGxSb3dzKCkpO1xyXG5cclxuICAgIGlmICh1c2VTY3JvbGxzKSB7XHJcbiAgICAgICAgdGhpcy5hZGRTY3JvbGxMaXN0ZW5lcigpO1xyXG4gICAgICAgIHRoaXMuc2V0Qm9keVNpemUoKTsgLy9zZXR0aW5nIHNpemVzIG9mIGJvZHkgKGNvbnRhaW5pbmcgdmlld3BvcnRzKSwgZG9lc24ndCBjaGFuZ2UgY29udGFpbmVyIHNpemVzXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZG9uZSB3aGVuIGNvbHMgY2hhbmdlXHJcbiAgICB0aGlzLnNldHVwQ29sdW1ucygpO1xyXG5cclxuICAgIC8vIGRvbmUgd2hlbiByb3dzIGNoYW5nZVxyXG4gICAgdGhpcy51cGRhdGVNb2RlbEFuZFJlZnJlc2goY29uc3RhbnRzLlNURVBfRVZFUllUSElORyk7XHJcblxyXG4gICAgLy8gZmxhZyB0byBtYXJrIHdoZW4gdGhlIGRpcmVjdGl2ZSBpcyBkZXN0cm95ZWRcclxuICAgIHRoaXMuZmluaXNoZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBpZiBubyBkYXRhIHByb3ZpZGVkIGluaXRpYWxseSwgYW5kIG5vdCBkb2luZyBpbmZpbml0ZSBzY3JvbGxpbmcsIHNob3cgdGhlIGxvYWRpbmcgcGFuZWxcclxuICAgIHZhciBzaG93TG9hZGluZyA9ICF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBbGxSb3dzKCkgJiYgIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzVmlydHVhbFBhZ2luZygpO1xyXG4gICAgdGhpcy5zaG93TG9hZGluZ1BhbmVsKHNob3dMb2FkaW5nKTtcclxuXHJcbiAgICAvLyBpZiBkYXRhc291cmNlIHByb3ZpZGVkLCB1c2UgaXRcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXREYXRhc291cmNlKCkpIHtcclxuICAgICAgICB0aGlzLnNldERhdGFzb3VyY2UoKTtcclxuICAgIH1cclxufVxyXG5cclxuR3JpZC5wcm90b3R5cGUuY3JlYXRlQW5kV2lyZUJlYW5zID0gZnVuY3Rpb24oJHNjb3BlLCAkY29tcGlsZSwgZUdyaWREaXYsIHVzZVNjcm9sbHMpIHtcclxuXHJcbiAgICAvLyBtYWtlIGxvY2FsIHJlZmVyZW5jZXMsIHRvIG1ha2UgdGhlIGJlbG93IG1vcmUgaHVtYW4gcmVhZGFibGVcclxuICAgIHZhciBncmlkT3B0aW9uc1dyYXBwZXIgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHZhciBncmlkT3B0aW9ucyA9IHRoaXMuZ3JpZE9wdGlvbnM7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFsbCB0aGUgYmVhbnNcclxuICAgIHZhciBzZWxlY3Rpb25Db250cm9sbGVyID0gbmV3IFNlbGVjdGlvbkNvbnRyb2xsZXIoKTtcclxuICAgIHZhciBmaWx0ZXJNYW5hZ2VyID0gbmV3IEZpbHRlck1hbmFnZXIoKTtcclxuICAgIHZhciBzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkgPSBuZXcgU2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5KCk7XHJcbiAgICB2YXIgY29sdW1uQ29udHJvbGxlciA9IG5ldyBDb2x1bW5Db250cm9sbGVyKCk7XHJcbiAgICB2YXIgcm93UmVuZGVyZXIgPSBuZXcgUm93UmVuZGVyZXIoKTtcclxuICAgIHZhciBoZWFkZXJSZW5kZXJlciA9IG5ldyBIZWFkZXJSZW5kZXJlcigpO1xyXG4gICAgdmFyIGluTWVtb3J5Um93Q29udHJvbGxlciA9IG5ldyBJbk1lbW9yeVJvd0NvbnRyb2xsZXIoKTtcclxuICAgIHZhciB2aXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIgPSBuZXcgVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyKCk7XHJcblxyXG4gICAgdmFyIGNvbHVtbk1vZGVsID0gY29sdW1uQ29udHJvbGxlci5nZXRNb2RlbCgpO1xyXG5cclxuICAgIC8vIGluaXRpYWxpc2UgYWxsIHRoZSBiZWFuc1xyXG4gICAgc2VsZWN0aW9uQ29udHJvbGxlci5pbml0KHRoaXMsIHRoaXMuZVBhcmVudE9mUm93cywgZ3JpZE9wdGlvbnNXcmFwcGVyLCAkc2NvcGUsIHJvd1JlbmRlcmVyKTtcclxuICAgIGZpbHRlck1hbmFnZXIuaW5pdCh0aGlzLCBncmlkT3B0aW9uc1dyYXBwZXIsICRjb21waWxlLCAkc2NvcGUpO1xyXG4gICAgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LmluaXQodGhpcywgc2VsZWN0aW9uQ29udHJvbGxlcik7XHJcbiAgICBjb2x1bW5Db250cm9sbGVyLmluaXQodGhpcywgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LCBncmlkT3B0aW9uc1dyYXBwZXIpO1xyXG4gICAgcm93UmVuZGVyZXIuaW5pdChncmlkT3B0aW9ucywgY29sdW1uTW9kZWwsIGdyaWRPcHRpb25zV3JhcHBlciwgZUdyaWREaXYsIHRoaXMsXHJcbiAgICAgICAgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LCAkY29tcGlsZSwgJHNjb3BlLCBzZWxlY3Rpb25Db250cm9sbGVyKTtcclxuICAgIGhlYWRlclJlbmRlcmVyLmluaXQoZ3JpZE9wdGlvbnNXcmFwcGVyLCBjb2x1bW5Db250cm9sbGVyLCBjb2x1bW5Nb2RlbCwgZUdyaWREaXYsIHRoaXMsIGZpbHRlck1hbmFnZXIsICRzY29wZSwgJGNvbXBpbGUpO1xyXG4gICAgaW5NZW1vcnlSb3dDb250cm9sbGVyLmluaXQoZ3JpZE9wdGlvbnNXcmFwcGVyLCBjb2x1bW5Nb2RlbCwgdGhpcywgZmlsdGVyTWFuYWdlciwgJHNjb3BlKTtcclxuICAgIHZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5pbml0KHJvd1JlbmRlcmVyKTtcclxuXHJcbiAgICAvLyB0aGlzIGlzIGEgY2hpbGQgYmVhbiwgZ2V0IGEgcmVmZXJlbmNlIGFuZCBwYXNzIGl0IG9uXHJcbiAgICAvLyBDQU4gV0UgREVMRVRFIFRISVM/IGl0J3MgZG9uZSBpbiB0aGUgc2V0RGF0YXNvdXJjZSBzZWN0aW9uXHJcbiAgICB2YXIgcm93TW9kZWwgPSBpbk1lbW9yeVJvd0NvbnRyb2xsZXIuZ2V0TW9kZWwoKTtcclxuICAgIHNlbGVjdGlvbkNvbnRyb2xsZXIuc2V0Um93TW9kZWwocm93TW9kZWwpO1xyXG4gICAgZmlsdGVyTWFuYWdlci5zZXRSb3dNb2RlbChyb3dNb2RlbCk7XHJcbiAgICByb3dSZW5kZXJlci5zZXRSb3dNb2RlbChyb3dNb2RlbCk7XHJcblxyXG4gICAgLy8gYW5kIHRoZSBsYXN0IGJlYW4sIGRvbmUgaW4gaXQncyBvd24gc2VjdGlvbiwgYXMgaXQncyBvcHRpb25hbFxyXG4gICAgdmFyIHBhZ2luYXRpb25Db250cm9sbGVyID0gbnVsbDtcclxuICAgIGlmICh1c2VTY3JvbGxzKSB7XHJcbiAgICAgICAgcGFnaW5hdGlvbkNvbnRyb2xsZXIgPSBuZXcgUGFnaW5hdGlvbkNvbnRyb2xsZXIoKTtcclxuICAgICAgICBwYWdpbmF0aW9uQ29udHJvbGxlci5pbml0KHRoaXMuZVBhZ2luZ1BhbmVsLCB0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJvd01vZGVsID0gcm93TW9kZWw7XHJcbiAgICB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIgPSBzZWxlY3Rpb25Db250cm9sbGVyO1xyXG4gICAgdGhpcy5jb2x1bW5Db250cm9sbGVyID0gY29sdW1uQ29udHJvbGxlcjtcclxuICAgIHRoaXMuY29sdW1uTW9kZWwgPSBjb2x1bW5Nb2RlbDtcclxuICAgIHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyID0gaW5NZW1vcnlSb3dDb250cm9sbGVyO1xyXG4gICAgdGhpcy52aXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIgPSB2aXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXI7XHJcbiAgICB0aGlzLnJvd1JlbmRlcmVyID0gcm93UmVuZGVyZXI7XHJcbiAgICB0aGlzLmhlYWRlclJlbmRlcmVyID0gaGVhZGVyUmVuZGVyZXI7XHJcbiAgICB0aGlzLnBhZ2luYXRpb25Db250cm9sbGVyID0gcGFnaW5hdGlvbkNvbnRyb2xsZXI7XHJcbiAgICB0aGlzLmZpbHRlck1hbmFnZXIgPSBmaWx0ZXJNYW5hZ2VyO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2hvd0FuZFBvc2l0aW9uUGFnaW5nUGFuZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIG5vIHBhZ2luZyB3aGVuIG5vLXNjcm9sbHNcclxuICAgIGlmICghdGhpcy5lUGFnaW5nUGFuZWwpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaXNTaG93UGFnaW5nUGFuZWwoKSkge1xyXG4gICAgICAgIHRoaXMuZVBhZ2luZ1BhbmVsLnN0eWxlWydkaXNwbGF5J10gPSBudWxsO1xyXG4gICAgICAgIHZhciBoZWlnaHRPZlBhZ2VyID0gdGhpcy5lUGFnaW5nUGFuZWwub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuZUJvZHkuc3R5bGVbJ3BhZGRpbmctYm90dG9tJ10gPSBoZWlnaHRPZlBhZ2VyICsgJ3B4JztcclxuICAgICAgICB2YXIgaGVpZ2h0T2ZSb290ID0gdGhpcy5lUm9vdC5jbGllbnRIZWlnaHQ7XHJcbiAgICAgICAgdmFyIHRvcE9mUGFnZXIgPSBoZWlnaHRPZlJvb3QgLSBoZWlnaHRPZlBhZ2VyO1xyXG4gICAgICAgIHRoaXMuZVBhZ2luZ1BhbmVsLnN0eWxlWyd0b3AnXSA9IHRvcE9mUGFnZXIgKyAncHgnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVQYWdpbmdQYW5lbC5zdHlsZVsnZGlzcGxheSddID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuZUJvZHkuc3R5bGVbJ3BhZGRpbmctYm90dG9tJ10gPSBudWxsO1xyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmlzU2hvd1BhZ2luZ1BhbmVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zaG93UGFnaW5nUGFuZWw7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zZXREYXRhc291cmNlID0gZnVuY3Rpb24oZGF0YXNvdXJjZSkge1xyXG4gICAgLy8gaWYgZGF0YXNvdXJjZSBwcm92aWRlZCwgdGhlbiBzZXQgaXRcclxuICAgIGlmIChkYXRhc291cmNlKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5kYXRhc291cmNlID0gZGF0YXNvdXJjZTtcclxuICAgIH1cclxuICAgIC8vIGdldCB0aGUgc2V0IGRhdGFzb3VyY2UgKGlmIG51bGwgd2FzIHBhc3NlZCB0byB0aGlzIG1ldGhvZCxcclxuICAgIC8vIHRoZW4gbmVlZCB0byBnZXQgdGhlIGFjdHVhbCBkYXRhc291cmNlIGZyb20gb3B0aW9uc1xyXG4gICAgdmFyIGRhdGFzb3VyY2VUb1VzZSA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldERhdGFzb3VyY2UoKTtcclxuICAgIHZhciB2aXJ0dWFsUGFnaW5nID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNWaXJ0dWFsUGFnaW5nKCkgJiYgZGF0YXNvdXJjZVRvVXNlO1xyXG4gICAgdmFyIHBhZ2luYXRpb24gPSBkYXRhc291cmNlVG9Vc2UgJiYgIXZpcnR1YWxQYWdpbmc7XHJcblxyXG4gICAgaWYgKHZpcnR1YWxQYWdpbmcpIHtcclxuICAgICAgICB0aGlzLnBhZ2luYXRpb25Db250cm9sbGVyLnNldERhdGFzb3VyY2UobnVsbCk7XHJcbiAgICAgICAgdGhpcy52aXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIuc2V0RGF0YXNvdXJjZShkYXRhc291cmNlVG9Vc2UpO1xyXG4gICAgICAgIHRoaXMucm93TW9kZWwgPSB0aGlzLnZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5nZXRNb2RlbCgpO1xyXG4gICAgICAgIHRoaXMuc2hvd1BhZ2luZ1BhbmVsID0gZmFsc2U7XHJcbiAgICB9IGVsc2UgaWYgKHBhZ2luYXRpb24pIHtcclxuICAgICAgICB0aGlzLnBhZ2luYXRpb25Db250cm9sbGVyLnNldERhdGFzb3VyY2UoZGF0YXNvdXJjZVRvVXNlKTtcclxuICAgICAgICB0aGlzLnZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5zZXREYXRhc291cmNlKG51bGwpO1xyXG4gICAgICAgIHRoaXMucm93TW9kZWwgPSB0aGlzLmluTWVtb3J5Um93Q29udHJvbGxlci5nZXRNb2RlbCgpO1xyXG4gICAgICAgIHRoaXMuc2hvd1BhZ2luZ1BhbmVsID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uQ29udHJvbGxlci5zZXREYXRhc291cmNlKG51bGwpO1xyXG4gICAgICAgIHRoaXMudmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnNldERhdGFzb3VyY2UobnVsbCk7XHJcbiAgICAgICAgdGhpcy5yb3dNb2RlbCA9IHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyLmdldE1vZGVsKCk7XHJcbiAgICAgICAgdGhpcy5zaG93UGFnaW5nUGFuZWwgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIuc2V0Um93TW9kZWwodGhpcy5yb3dNb2RlbCk7XHJcbiAgICB0aGlzLmZpbHRlck1hbmFnZXIuc2V0Um93TW9kZWwodGhpcy5yb3dNb2RlbCk7XHJcbiAgICB0aGlzLnJvd1JlbmRlcmVyLnNldFJvd01vZGVsKHRoaXMucm93TW9kZWwpO1xyXG5cclxuICAgIC8vIHdlIG1heSBvZiBqdXN0IHNob3duIG9yIGhpZGRlbiB0aGUgcGFnaW5nIHBhbmVsLCBzbyBuZWVkXHJcbiAgICAvLyB0byBnZXQgdGFibGUgdG8gY2hlY2sgdGhlIGJvZHkgc2l6ZSwgd2hpY2ggYWxzbyBoaWRlcyBhbmRcclxuICAgIC8vIHNob3dzIHRoZSBwYWdpbmcgcGFuZWwuXHJcbiAgICB0aGlzLnNldEJvZHlTaXplKCk7XHJcblxyXG4gICAgLy8gYmVjYXVzZSB3ZSBqdXN0IHNldCB0aGUgcm93TW9kZWwsIG5lZWQgdG8gdXBkYXRlIHRoZSBndWlcclxuICAgIHRoaXMucm93UmVuZGVyZXIucmVmcmVzaFZpZXcoKTtcclxufTtcclxuXHJcbi8vIGdldHMgY2FsbGVkIGFmdGVyIGNvbHVtbnMgYXJlIHNob3duIC8gaGlkZGVuIGZyb20gZ3JvdXBzIGV4cGFuZGluZ1xyXG5HcmlkLnByb3RvdHlwZS5yZWZyZXNoSGVhZGVyQW5kQm9keSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci5yZWZyZXNoSGVhZGVyKCk7XHJcbiAgICB0aGlzLmhlYWRlclJlbmRlcmVyLnVwZGF0ZUZpbHRlckljb25zKCk7XHJcbiAgICB0aGlzLnNldEJvZHlDb250YWluZXJXaWR0aCgpO1xyXG4gICAgdGhpcy5zZXRQaW5uZWRDb2xDb250YWluZXJXaWR0aCgpO1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0RmluaXNoZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZmluaXNoZWQgPSB0cnVlO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuZ2V0UG9wdXBQYXJlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmVSb290O1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuZ2V0UXVpY2tGaWx0ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLnF1aWNrRmlsdGVyO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUub25RdWlja0ZpbHRlckNoYW5nZWQgPSBmdW5jdGlvbihuZXdGaWx0ZXIpIHtcclxuICAgIGlmIChuZXdGaWx0ZXIgPT09IHVuZGVmaW5lZCB8fCBuZXdGaWx0ZXIgPT09IFwiXCIpIHtcclxuICAgICAgICBuZXdGaWx0ZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucXVpY2tGaWx0ZXIgIT09IG5ld0ZpbHRlcikge1xyXG4gICAgICAgIC8vd2FudCAnbnVsbCcgdG8gbWVhbiB0byBmaWx0ZXIsIHNvIHJlbW92ZSB1bmRlZmluZWQgYW5kIGVtcHR5IHN0cmluZ1xyXG4gICAgICAgIGlmIChuZXdGaWx0ZXIgPT09IHVuZGVmaW5lZCB8fCBuZXdGaWx0ZXIgPT09IFwiXCIpIHtcclxuICAgICAgICAgICAgbmV3RmlsdGVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5ld0ZpbHRlciAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBuZXdGaWx0ZXIgPSBuZXdGaWx0ZXIudG9VcHBlckNhc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5xdWlja0ZpbHRlciA9IG5ld0ZpbHRlcjtcclxuICAgICAgICB0aGlzLm9uRmlsdGVyQ2hhbmdlZCgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUub25GaWx0ZXJDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9GSUxURVIpO1xyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci51cGRhdGVGaWx0ZXJJY29ucygpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUub25Sb3dDbGlja2VkID0gZnVuY3Rpb24oZXZlbnQsIHJvd0luZGV4LCBub2RlKSB7XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMucm93Q2xpY2tlZCkge1xyXG4gICAgICAgIHZhciBwYXJhbXMgPSB7XHJcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgZXZlbnQ6IGV2ZW50XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zLnJvd0NsaWNrZWQocGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBubyBzZWxlY3Rpb24gbWV0aG9kIGVuYWJsZWQsIGRvIG5vdGhpbmdcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNSb3dTZWxlY3Rpb24oKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBjbGljayBzZWxlY3Rpb24gc3VwcHJlc3NlZCwgZG8gbm90aGluZ1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzU3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbigpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGN0cmxLZXkgZm9yIHdpbmRvd3MsIG1ldGFLZXkgZm9yIEFwcGxlXHJcbiAgICB2YXIgdHJ5TXVsdGkgPSBldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXk7XHJcbiAgICB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIuc2VsZWN0Tm9kZShub2RlLCB0cnlNdWx0aSk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zZXRIZWFkZXJIZWlnaHQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBoZWFkZXJIZWlnaHQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRIZWFkZXJIZWlnaHQoKTtcclxuICAgIHZhciBoZWFkZXJIZWlnaHRQaXhlbHMgPSBoZWFkZXJIZWlnaHQgKyAncHgnO1xyXG4gICAgdmFyIGRvbnRVc2VTY3JvbGxzID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpO1xyXG4gICAgaWYgKGRvbnRVc2VTY3JvbGxzKSB7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyQ29udGFpbmVyLnN0eWxlWydoZWlnaHQnXSA9IGhlYWRlckhlaWdodFBpeGVscztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyLnN0eWxlWydoZWlnaHQnXSA9IGhlYWRlckhlaWdodFBpeGVscztcclxuICAgICAgICB0aGlzLmVCb2R5LnN0eWxlWydwYWRkaW5nLXRvcCddID0gaGVhZGVySGVpZ2h0UGl4ZWxzO1xyXG4gICAgICAgIHRoaXMuZUxvYWRpbmdQYW5lbC5zdHlsZVsnbWFyZ2luLXRvcCddID0gaGVhZGVySGVpZ2h0UGl4ZWxzO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2hvd0xvYWRpbmdQYW5lbCA9IGZ1bmN0aW9uKHNob3cpIHtcclxuICAgIGlmIChzaG93KSB7XHJcbiAgICAgICAgLy8gc2V0dGluZyBkaXNwbGF5IHRvIG51bGwsIGFjdHVhbGx5IGhhcyB0aGUgaW1wYWN0IG9mIHNldHRpbmcgaXRcclxuICAgICAgICAvLyB0byAndGFibGUnLCBhcyB0aGlzIGlzIHBhcnQgb2YgdGhlIGFnLWxvYWRpbmctcGFuZWwgY29yZSBzdHlsZVxyXG4gICAgICAgIHRoaXMuZUxvYWRpbmdQYW5lbC5zdHlsZS5kaXNwbGF5ID0gbnVsbDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lTG9hZGluZ1BhbmVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zZXR1cENvbHVtbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuc2V0SGVhZGVySGVpZ2h0KCk7XHJcbiAgICB0aGlzLmNvbHVtbkNvbnRyb2xsZXIuc2V0Q29sdW1ucyh0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkRlZnMpO1xyXG4gICAgdGhpcy5zaG93UGlubmVkQ29sQ29udGFpbmVyc0lmTmVlZGVkKCk7XHJcbiAgICB0aGlzLmhlYWRlclJlbmRlcmVyLnJlZnJlc2hIZWFkZXIoKTtcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgdGhpcy5zZXRQaW5uZWRDb2xDb250YWluZXJXaWR0aCgpO1xyXG4gICAgICAgIHRoaXMuc2V0Qm9keUNvbnRhaW5lcldpZHRoKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmhlYWRlclJlbmRlcmVyLnVwZGF0ZUZpbHRlckljb25zKCk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zZXRCb2R5Q29udGFpbmVyV2lkdGggPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtYWluUm93V2lkdGggPSB0aGlzLmNvbHVtbk1vZGVsLmdldEJvZHlDb250YWluZXJXaWR0aCgpICsgXCJweFwiO1xyXG4gICAgdGhpcy5lQm9keUNvbnRhaW5lci5zdHlsZS53aWR0aCA9IG1haW5Sb3dXaWR0aDtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnVwZGF0ZU1vZGVsQW5kUmVmcmVzaCA9IGZ1bmN0aW9uKHN0ZXApIHtcclxuICAgIHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyLnVwZGF0ZU1vZGVsKHN0ZXApO1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0Um93cyA9IGZ1bmN0aW9uKHJvd3MsIGZpcnN0SWQpIHtcclxuICAgIGlmIChyb3dzKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5yb3dEYXRhID0gcm93cztcclxuICAgIH1cclxuICAgIHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyLnNldEFsbFJvd3ModGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QWxsUm93cygpLCBmaXJzdElkKTtcclxuICAgIHRoaXMuc2VsZWN0aW9uQ29udHJvbGxlci5jbGVhclNlbGVjdGlvbigpO1xyXG4gICAgdGhpcy5maWx0ZXJNYW5hZ2VyLm9uTmV3Um93c0xvYWRlZCgpO1xyXG4gICAgdGhpcy51cGRhdGVNb2RlbEFuZFJlZnJlc2goY29uc3RhbnRzLlNURVBfRVZFUllUSElORyk7XHJcbiAgICB0aGlzLmhlYWRlclJlbmRlcmVyLnVwZGF0ZUZpbHRlckljb25zKCk7XHJcbiAgICB0aGlzLnNob3dMb2FkaW5nUGFuZWwoZmFsc2UpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuYWRkQXBpID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB2YXIgYXBpID0ge1xyXG4gICAgICAgIHNldERhdGFzb3VyY2U6IGZ1bmN0aW9uKGRhdGFzb3VyY2UpIHtcclxuICAgICAgICAgICAgdGhhdC5zZXREYXRhc291cmNlKGRhdGFzb3VyY2UpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25OZXdEYXRhc291cmNlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5zZXREYXRhc291cmNlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRSb3dzOiBmdW5jdGlvbihyb3dzKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0Um93cyhyb3dzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uTmV3Um93czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0Um93cygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25OZXdDb2xzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5vbk5ld0NvbHMoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVuc2VsZWN0QWxsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLmNsZWFyU2VsZWN0aW9uKCk7XHJcbiAgICAgICAgICAgIHRoYXQucm93UmVuZGVyZXIucmVmcmVzaFZpZXcoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlZnJlc2hWaWV3OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVmcmVzaEhlYWRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIG5lZWQgdG8gcmV2aWV3IHRoaXMgLSB0aGUgcmVmcmVzaEhlYWRlciBzaG91bGQgYWxzbyByZWZyZXNoIGFsbCBpY29ucyBpbiB0aGUgaGVhZGVyXHJcbiAgICAgICAgICAgIHRoYXQuaGVhZGVyUmVuZGVyZXIucmVmcmVzaEhlYWRlcigpO1xyXG4gICAgICAgICAgICB0aGF0LmhlYWRlclJlbmRlcmVyLnVwZGF0ZUZpbHRlckljb25zKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRNb2RlbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnJvd01vZGVsO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25Hcm91cEV4cGFuZGVkT3JDb2xsYXBzZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9NQVApO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXhwYW5kQWxsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5pbk1lbW9yeVJvd0NvbnRyb2xsZXIuZXhwYW5kT3JDb2xsYXBzZUFsbCh0cnVlLCBudWxsKTtcclxuICAgICAgICAgICAgdGhhdC51cGRhdGVNb2RlbEFuZFJlZnJlc2goY29uc3RhbnRzLlNURVBfTUFQKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbGxhcHNlQWxsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5pbk1lbW9yeVJvd0NvbnRyb2xsZXIuZXhwYW5kT3JDb2xsYXBzZUFsbChmYWxzZSwgbnVsbCk7XHJcbiAgICAgICAgICAgIHRoYXQudXBkYXRlTW9kZWxBbmRSZWZyZXNoKGNvbnN0YW50cy5TVEVQX01BUCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhZGRWaXJ0dWFsUm93TGlzdGVuZXI6IGZ1bmN0aW9uKHJvd0luZGV4LCBjYWxsYmFjaykge1xyXG4gICAgICAgICAgICB0aGF0LmFkZFZpcnR1YWxSb3dMaXN0ZW5lcihyb3dJbmRleCwgY2FsbGJhY2spO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcm93RGF0YUNoYW5nZWQ6IGZ1bmN0aW9uKHJvd3MpIHtcclxuICAgICAgICAgICAgdGhhdC5yb3dSZW5kZXJlci5yb3dEYXRhQ2hhbmdlZChyb3dzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldFF1aWNrRmlsdGVyOiBmdW5jdGlvbihuZXdGaWx0ZXIpIHtcclxuICAgICAgICAgICAgdGhhdC5vblF1aWNrRmlsdGVyQ2hhbmdlZChuZXdGaWx0ZXIpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZWxlY3RJbmRleDogZnVuY3Rpb24oaW5kZXgsIHRyeU11bHRpLCBzdXBwcmVzc0V2ZW50cykge1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuc2VsZWN0SW5kZXgoaW5kZXgsIHRyeU11bHRpLCBzdXBwcmVzc0V2ZW50cyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZXNlbGVjdEluZGV4OiBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuZGVzZWxlY3RJbmRleChpbmRleCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZWxlY3ROb2RlOiBmdW5jdGlvbihub2RlLCB0cnlNdWx0aSwgc3VwcHJlc3NFdmVudHMpIHtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLnNlbGVjdE5vZGUobm9kZSwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlc2VsZWN0Tm9kZTogZnVuY3Rpb24obm9kZSkge1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuZGVzZWxlY3ROb2RlKG5vZGUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVjb21wdXRlQWdncmVnYXRlczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuaW5NZW1vcnlSb3dDb250cm9sbGVyLmRvQWdncmVnYXRlKCk7XHJcbiAgICAgICAgICAgIHRoYXQucm93UmVuZGVyZXIucmVmcmVzaEdyb3VwUm93cygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2l6ZUNvbHVtbnNUb0ZpdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBhdmFpbGFibGVXaWR0aCA9IHRoYXQuZUJvZHkuY2xpZW50V2lkdGg7XHJcbiAgICAgICAgICAgIHRoYXQuY29sdW1uQ29udHJvbGxlci5zaXplQ29sdW1uc1RvRml0KGF2YWlsYWJsZVdpZHRoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNob3dMb2FkaW5nOiBmdW5jdGlvbihzaG93KSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2hvd0xvYWRpbmdQYW5lbChzaG93KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzTm9kZVNlbGVjdGVkOiBmdW5jdGlvbihub2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuaXNOb2RlU2VsZWN0ZWQobm9kZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRTZWxlY3RlZE5vZGVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5nZXRTZWxlY3RlZE5vZGVzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRCZXN0Q29zdE5vZGVTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLmdldEJlc3RDb3N0Tm9kZVNlbGVjdGlvbigpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zLmFwaSA9IGFwaTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmFkZFZpcnR1YWxSb3dMaXN0ZW5lciA9IGZ1bmN0aW9uKHJvd0luZGV4LCBjYWxsYmFjaykge1xyXG4gICAgaWYgKCF0aGlzLnZpcnR1YWxSb3dDYWxsYmFja3Nbcm93SW5kZXhdKSB7XHJcbiAgICAgICAgdGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XSA9IFtdO1xyXG4gICAgfVxyXG4gICAgdGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XS5wdXNoKGNhbGxiYWNrKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLm9uVmlydHVhbFJvd1NlbGVjdGVkID0gZnVuY3Rpb24ocm93SW5kZXgsIHNlbGVjdGVkKSB7XHJcbiAgICAvLyBpbmZvcm0gdGhlIGNhbGxiYWNrcyBvZiB0aGUgZXZlbnRcclxuICAgIGlmICh0aGlzLnZpcnR1YWxSb3dDYWxsYmFja3Nbcm93SW5kZXhdKSB7XHJcbiAgICAgICAgdGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XS5mb3JFYWNoKGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sucm93UmVtb3ZlZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sucm93U2VsZWN0ZWQoc2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5vblZpcnR1YWxSb3dSZW1vdmVkID0gZnVuY3Rpb24ocm93SW5kZXgpIHtcclxuICAgIC8vIGluZm9ybSB0aGUgY2FsbGJhY2tzIG9mIHRoZSBldmVudFxyXG4gICAgaWYgKHRoaXMudmlydHVhbFJvd0NhbGxiYWNrc1tyb3dJbmRleF0pIHtcclxuICAgICAgICB0aGlzLnZpcnR1YWxSb3dDYWxsYmFja3Nbcm93SW5kZXhdLmZvckVhY2goZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjay5yb3dSZW1vdmVkID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5yb3dSZW1vdmVkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8vIHJlbW92ZSB0aGUgY2FsbGJhY2tzXHJcbiAgICBkZWxldGUgdGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLm9uTmV3Q29scyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5zZXR1cENvbHVtbnMoKTtcclxuICAgIHRoaXMudXBkYXRlTW9kZWxBbmRSZWZyZXNoKGNvbnN0YW50cy5TVEVQX0VWRVJZVEhJTkcpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuZmluZEFsbEVsZW1lbnRzID0gZnVuY3Rpb24oZUdyaWREaXYpIHtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0RvbnRVc2VTY3JvbGxzKCkpIHtcclxuICAgICAgICB0aGlzLmVSb290ID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1yb290XCIpO1xyXG4gICAgICAgIHRoaXMuZUhlYWRlckNvbnRhaW5lciA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctaGVhZGVyLWNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLmVCb2R5Q29udGFpbmVyID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1ib2R5LWNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLmVMb2FkaW5nUGFuZWwgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKCcuYWctbG9hZGluZy1wYW5lbCcpO1xyXG4gICAgICAgIC8vIGZvciBuby1zY3JvbGxzLCBhbGwgcm93cyBsaXZlIGluIHRoZSBib2R5IGNvbnRhaW5lclxyXG4gICAgICAgIHRoaXMuZVBhcmVudE9mUm93cyA9IHRoaXMuZUJvZHlDb250YWluZXI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZVJvb3QgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLXJvb3RcIik7XHJcbiAgICAgICAgdGhpcy5lQm9keSA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keVwiKTtcclxuICAgICAgICB0aGlzLmVCb2R5Q29udGFpbmVyID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1ib2R5LWNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLmVCb2R5Vmlld3BvcnQgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLWJvZHktdmlld3BvcnRcIik7XHJcbiAgICAgICAgdGhpcy5lQm9keVZpZXdwb3J0V3JhcHBlciA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keS12aWV3cG9ydC13cmFwcGVyXCIpO1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLXBpbm5lZC1jb2xzLWNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzVmlld3BvcnQgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLXBpbm5lZC1jb2xzLXZpZXdwb3J0XCIpO1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZEhlYWRlciA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctcGlubmVkLWhlYWRlclwiKTtcclxuICAgICAgICB0aGlzLmVIZWFkZXIgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLWhlYWRlclwiKTtcclxuICAgICAgICB0aGlzLmVIZWFkZXJDb250YWluZXIgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLWhlYWRlci1jb250YWluZXJcIik7XHJcbiAgICAgICAgdGhpcy5lTG9hZGluZ1BhbmVsID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcignLmFnLWxvYWRpbmctcGFuZWwnKTtcclxuICAgICAgICAvLyBmb3Igc2Nyb2xscywgYWxsIHJvd3MgbGl2ZSBpbiBlQm9keSAoY29udGFpbmluZyBwaW5uZWQgYW5kIG5vcm1hbCBib2R5KVxyXG4gICAgICAgIHRoaXMuZVBhcmVudE9mUm93cyA9IHRoaXMuZUJvZHk7XHJcbiAgICAgICAgdGhpcy5lUGFnaW5nUGFuZWwgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKCcuYWctcGFnaW5nLXBhbmVsJyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zaG93UGlubmVkQ29sQ29udGFpbmVyc0lmTmVlZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBubyBuZWVkIHRvIGRvIHRoaXMgaWYgbm90IHVzaW5nIHNjcm9sbHNcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0RvbnRVc2VTY3JvbGxzKCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNob3dpbmdQaW5uZWRDb2xzID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0UGlubmVkQ29sQ291bnQoKSA+IDA7XHJcblxyXG4gICAgLy9zb21lIGJyb3dzZXJzIGhhZCBsYXlvdXQgaXNzdWVzIHdpdGggdGhlIGJsYW5rIGRpdnMsIHNvIGlmIGJsYW5rLFxyXG4gICAgLy93ZSBkb24ndCBkaXNwbGF5IHRoZW1cclxuICAgIGlmIChzaG93aW5nUGlubmVkQ29scykge1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZEhlYWRlci5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc1ZpZXdwb3J0LnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkSGVhZGVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc1ZpZXdwb3J0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS51cGRhdGVCb2R5Q29udGFpbmVyV2lkdGhBZnRlckNvbFJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlci5zZXRNYWluUm93V2lkdGhzKCk7XHJcbiAgICB0aGlzLnNldEJvZHlDb250YWluZXJXaWR0aCgpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUudXBkYXRlUGlubmVkQ29sQ29udGFpbmVyV2lkdGhBZnRlckNvbFJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5zZXRQaW5uZWRDb2xDb250YWluZXJXaWR0aCgpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0UGlubmVkQ29sQ29udGFpbmVyV2lkdGggPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBwaW5uZWRDb2xXaWR0aCA9IHRoaXMuY29sdW1uTW9kZWwuZ2V0UGlubmVkQ29udGFpbmVyV2lkdGgoKSArIFwicHhcIjtcclxuICAgIHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIuc3R5bGUud2lkdGggPSBwaW5uZWRDb2xXaWR0aDtcclxuICAgIHRoaXMuZUJvZHlWaWV3cG9ydFdyYXBwZXIuc3R5bGUubWFyZ2luTGVmdCA9IHBpbm5lZENvbFdpZHRoO1xyXG59O1xyXG5cclxuLy8gc2VlIGlmIGEgZ3JleSBib3ggaXMgbmVlZGVkIGF0IHRoZSBib3R0b20gb2YgdGhlIHBpbm5lZCBjb2xcclxuR3JpZC5wcm90b3R5cGUuc2V0UGlubmVkQ29sSGVpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyB2YXIgYm9keUhlaWdodCA9IHV0aWxzLnBpeGVsU3RyaW5nVG9OdW1iZXIodGhpcy5lQm9keS5zdHlsZS5oZWlnaHQpO1xyXG4gICAgdmFyIHNjcm9sbFNob3dpbmcgPSB0aGlzLmVCb2R5Vmlld3BvcnQuY2xpZW50V2lkdGggPCB0aGlzLmVCb2R5Vmlld3BvcnQuc2Nyb2xsV2lkdGg7XHJcbiAgICB2YXIgYm9keUhlaWdodCA9IHRoaXMuZUJvZHlWaWV3cG9ydC5vZmZzZXRIZWlnaHQ7XHJcbiAgICBpZiAoc2Nyb2xsU2hvd2luZykge1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZENvbHNWaWV3cG9ydC5zdHlsZS5oZWlnaHQgPSAoYm9keUhlaWdodCAtIDIwKSArIFwicHhcIjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc1ZpZXdwb3J0LnN0eWxlLmhlaWdodCA9IGJvZHlIZWlnaHQgKyBcInB4XCI7XHJcbiAgICB9XHJcbiAgICAvLyBhbHNvIHRoZSBsb2FkaW5nIG92ZXJsYXksIG5lZWRzIHRvIGhhdmUgaXQncyBoZWlnaHQgYWRqdXN0ZWRcclxuICAgIHRoaXMuZUxvYWRpbmdQYW5lbC5zdHlsZS5oZWlnaHQgPSBib2R5SGVpZ2h0ICsgJ3B4JztcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNldEJvZHlTaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIHZhciBib2R5SGVpZ2h0ID0gdGhpcy5lQm9keVZpZXdwb3J0Lm9mZnNldEhlaWdodDtcclxuICAgIHZhciBwYWdpbmdWaXNpYmxlID0gdGhpcy5pc1Nob3dQYWdpbmdQYW5lbCgpO1xyXG5cclxuICAgIGlmICh0aGlzLmJvZHlIZWlnaHRMYXN0VGltZSAhPSBib2R5SGVpZ2h0IHx8IHRoaXMuc2hvd1BhZ2luZ1BhbmVsVmlzaWJsZUxhc3RUaW1lICE9IHBhZ2luZ1Zpc2libGUpIHtcclxuICAgICAgICB0aGlzLmJvZHlIZWlnaHRMYXN0VGltZSA9IGJvZHlIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5zaG93UGFnaW5nUGFuZWxWaXNpYmxlTGFzdFRpbWUgPSBwYWdpbmdWaXNpYmxlO1xyXG5cclxuICAgICAgICB0aGlzLnNldFBpbm5lZENvbEhlaWdodCgpO1xyXG5cclxuICAgICAgICAvL29ubHkgZHJhdyB2aXJ0dWFsIHJvd3MgaWYgZG9uZSBzb3J0ICYgZmlsdGVyIC0gdGhpc1xyXG4gICAgICAgIC8vbWVhbnMgd2UgZG9uJ3QgZHJhdyByb3dzIGlmIHRhYmxlIGlzIG5vdCB5ZXQgaW5pdGlhbGlzZWRcclxuICAgICAgICBpZiAodGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93Q291bnQoKSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5yb3dSZW5kZXJlci5kcmF3VmlydHVhbFJvd3MoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHNob3cgYW5kIHBvc2l0aW9uIHBhZ2luZyBwYW5lbFxyXG4gICAgICAgIHRoaXMuc2hvd0FuZFBvc2l0aW9uUGFnaW5nUGFuZWwoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuZmluaXNoZWQpIHtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBfdGhpcy5zZXRCb2R5U2l6ZSgpO1xyXG4gICAgICAgIH0sIDIwMCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5hZGRTY3JvbGxMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICB0aGlzLmVCb2R5Vmlld3BvcnQuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBfdGhpcy5zY3JvbGxIZWFkZXJBbmRQaW5uZWQoKTtcclxuICAgICAgICBfdGhpcy5yb3dSZW5kZXJlci5kcmF3VmlydHVhbFJvd3MoKTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2Nyb2xsSGVhZGVyQW5kUGlubmVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVIZWFkZXJDb250YWluZXIuc3R5bGUubGVmdCA9IC10aGlzLmVCb2R5Vmlld3BvcnQuc2Nyb2xsTGVmdCArIFwicHhcIjtcclxuICAgIHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIuc3R5bGUudG9wID0gLXRoaXMuZUJvZHlWaWV3cG9ydC5zY3JvbGxUb3AgKyBcInB4XCI7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdyaWQ7XHJcbiIsInZhciBERUZBVUxUX1JPV19IRUlHSFQgPSAzMDtcclxuXHJcbmZ1bmN0aW9uIEdyaWRPcHRpb25zV3JhcHBlcihncmlkT3B0aW9ucykge1xyXG4gICAgdGhpcy5ncmlkT3B0aW9ucyA9IGdyaWRPcHRpb25zO1xyXG4gICAgdGhpcy5zZXR1cERlZmF1bHRzKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzVHJ1ZSh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSAndHJ1ZSc7XHJcbn1cclxuXHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNSb3dTZWxlY3Rpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd1NlbGVjdGlvbiA9PT0gXCJzaW5nbGVcIiB8fCB0aGlzLmdyaWRPcHRpb25zLnJvd1NlbGVjdGlvbiA9PT0gXCJtdWx0aXBsZVwiO1xyXG59O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzUm93U2VsZWN0aW9uTXVsdGkgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd1NlbGVjdGlvbiA9PT0gJ211bHRpcGxlJztcclxufTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRDb250ZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5jb250ZXh0O1xyXG59O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzVmlydHVhbFBhZ2luZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLnZpcnR1YWxQYWdpbmcpO1xyXG59O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzUm93c0FscmVhZHlHcm91cGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMucm93c0FscmVhZHlHcm91cGVkKTtcclxufTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0dyb3VwQ2hlY2tib3hTZWxlY3Rpb25Hcm91cCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBDaGVja2JveFNlbGVjdGlvbiA9PT0gJ2dyb3VwJztcclxufTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0dyb3VwQ2hlY2tib3hTZWxlY3Rpb25DaGlsZHJlbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBDaGVja2JveFNlbGVjdGlvbiA9PT0gJ2NoaWxkcmVuJztcclxufTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0dyb3VwSW5jbHVkZUZvb3RlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLmdyb3VwSW5jbHVkZUZvb3Rlcik7XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNTdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbik7XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNHcm91cEhlYWRlcnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5ncm91cEhlYWRlcnMpO1xyXG59O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzRG9udFVzZVNjcm9sbHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5kb250VXNlU2Nyb2xscyk7XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Um93U3R5bGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd1N0eWxlO1xyXG59O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldFJvd0NsYXNzID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5yb3dDbGFzcztcclxufTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRHcmlkT3B0aW9ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnM7XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0SGVhZGVyQ2VsbFJlbmRlcmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5oZWFkZXJDZWxsUmVuZGVyZXI7XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNFbmFibGVTb3J0aW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5lbmFibGVTb3J0aW5nO1xyXG59O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzRW5hYmxlQ29sUmVzaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5lbmFibGVDb2xSZXNpemU7XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNFbmFibGVGaWx0ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmVuYWJsZUZpbHRlcjtcclxufTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRHcm91cERlZmF1bHRFeHBhbmRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBEZWZhdWx0RXhwYW5kZWQ7XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0R3JvdXBLZXlzID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5ncm91cEtleXM7XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0R3JvdXBJY29uUmVuZGVyZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmdyb3VwSWNvblJlbmRlcmVyO1xyXG59O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldEdyb3VwQWdnRnVuY3Rpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmdyb3VwQWdnRnVuY3Rpb247XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0QWxsUm93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMucm93RGF0YTtcclxufTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0dyb3VwVXNlRW50aXJlUm93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBVc2VFbnRpcmVSb3cpO1xyXG59O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzQW5ndWxhckNvbXBpbGVSb3dzID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuYW5ndWxhckNvbXBpbGVSb3dzKTtcclxufTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0FuZ3VsYXJDb21waWxlRmlsdGVycyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLmFuZ3VsYXJDb21waWxlRmlsdGVycyk7XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNBbmd1bGFyQ29tcGlsZUhlYWRlcnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5hbmd1bGFyQ29tcGlsZUhlYWRlcnMpO1xyXG59O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldENvbHVtbkRlZnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkRlZnM7XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Um93SGVpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5yb3dIZWlnaHQ7XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0TW9kZWxVcGRhdGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5tb2RlbFVwZGF0ZWQ7XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Q2VsbENsaWNrZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmNlbGxDbGlja2VkO1xyXG59O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldENlbGxEb3VibGVDbGlja2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5jZWxsRG91YmxlQ2xpY2tlZDtcclxufTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRSb3dTZWxlY3RlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMucm93U2VsZWN0ZWQ7XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0U2VsZWN0aW9uQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuc2VsZWN0aW9uQ2hhbmdlZDtcclxufTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRWaXJ0dWFsUm93UmVtb3ZlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMudmlydHVhbFJvd1JlbW92ZWQ7XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0RGF0YXNvdXJjZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuZGF0YXNvdXJjZTtcclxufTtcclxuXHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuc2V0U2VsZWN0ZWRSb3dzID0gZnVuY3Rpb24obmV3U2VsZWN0ZWRSb3dzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5zZWxlY3RlZFJvd3MgPSBuZXdTZWxlY3RlZFJvd3M7XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuc2V0U2VsZWN0ZWROb2Rlc0J5SWQgPSBmdW5jdGlvbihuZXdTZWxlY3RlZE5vZGVzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5zZWxlY3RlZE5vZGVzQnlJZCA9IG5ld1NlbGVjdGVkTm9kZXM7XHJcbn07XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldEljb25zID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5pY29ucztcclxufTtcclxuXHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNEb0ludGVybmFsR3JvdXBpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAhdGhpcy5pc1Jvd3NBbHJlYWR5R3JvdXBlZCgpICYmIHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBLZXlzO1xyXG59O1xyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0dyb3VwQ2hlY2tib3hTZWxlY3Rpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmlzR3JvdXBDaGVja2JveFNlbGVjdGlvbkNoaWxkcmVuKCkgfHwgdGhpcy5pc0dyb3VwQ2hlY2tib3hTZWxlY3Rpb25Hcm91cCgpO1xyXG59O1xyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRIZWFkZXJIZWlnaHQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0eXBlb2YgdGhpcy5ncmlkT3B0aW9ucy5oZWFkZXJIZWlnaHQgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgLy8gaWYgaGVhZGVyIGhlaWdodCBwcm92aWRlZCwgdXNlZCBpdFxyXG4gICAgICAgIHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmhlYWRlckhlaWdodDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlIHJldHVybiAyNSBpZiBubyBncm91cGluZywgNTAgaWYgZ3JvdXBpbmdcclxuICAgICAgICBpZiAodGhpcy5pc0dyb3VwSGVhZGVycygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiA1MDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gMjU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0NvbHVtRGVmc1ByZXNlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkRlZnMgJiYgdGhpcy5ncmlkT3B0aW9ucy5jb2x1bW5EZWZzLmxlbmd0aCAhPSAwO1xyXG59O1xyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5zZXR1cERlZmF1bHRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnMucm93SGVpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5yb3dIZWlnaHQgPSBERUZBVUxUX1JPV19IRUlHSFQ7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldFBpbm5lZENvbENvdW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBpZiBub3QgdXNpbmcgc2Nyb2xscywgdGhlbiBwaW5uZWQgY29sdW1ucyBkb2Vzbid0IG1ha2VcclxuICAgIC8vIHNlbnNlLCBzbyBhbHdheXMgcmV0dXJuIDBcclxuICAgIGlmICh0aGlzLmlzRG9udFVzZVNjcm9sbHMoKSkge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMucGlubmVkQ29sdW1uQ291bnQpIHtcclxuICAgICAgICAvL2luIGNhc2UgdXNlciBwdXRzIGluIGEgc3RyaW5nLCBjYXN0IHRvIG51bWJlclxyXG4gICAgICAgIHJldHVybiBOdW1iZXIodGhpcy5ncmlkT3B0aW9ucy5waW5uZWRDb2x1bW5Db3VudCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHcmlkT3B0aW9uc1dyYXBwZXI7XHJcbiIsImZ1bmN0aW9uIEdyb3VwQ3JlYXRvcigpIHt9XHJcblxyXG5Hcm91cENyZWF0b3IucHJvdG90eXBlLmdyb3VwID0gZnVuY3Rpb24ocm93Tm9kZXMsIGdyb3VwQnlGaWVsZHMsIGdyb3VwQWdnRnVuY3Rpb24sIGV4cGFuZEJ5RGVmYXVsdCkge1xyXG5cclxuICAgIHZhciB0b3BNb3N0R3JvdXAgPSB7XHJcbiAgICAgICAgbGV2ZWw6IC0xLFxyXG4gICAgICAgIGNoaWxkcmVuOiBbXSxcclxuICAgICAgICBjaGlsZHJlbk1hcDoge31cclxuICAgIH07XHJcblxyXG4gICAgdmFyIGFsbEdyb3VwcyA9IFtdO1xyXG4gICAgYWxsR3JvdXBzLnB1c2godG9wTW9zdEdyb3VwKTtcclxuXHJcbiAgICB2YXIgbGV2ZWxUb0luc2VydENoaWxkID0gZ3JvdXBCeUZpZWxkcy5sZW5ndGggLSAxO1xyXG4gICAgdmFyIGksIGN1cnJlbnRMZXZlbCwgbm9kZSwgZGF0YSwgY3VycmVudEdyb3VwLCBncm91cEJ5RmllbGQsIGdyb3VwS2V5LCBuZXh0R3JvdXA7XHJcblxyXG4gICAgLy8gc3RhcnQgYXQgLTEgYW5kIGdvIGJhY2t3YXJkcywgYXMgYWxsIHRoZSBwb3NpdGl2ZSBpbmRleGVzXHJcbiAgICAvLyBhcmUgYWxyZWFkeSB1c2VkIGJ5IHRoZSBub2Rlcy5cclxuICAgIHZhciBpbmRleCA9IC0xO1xyXG5cclxuICAgIGZvciAoaSA9IDA7IGkgPCByb3dOb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIG5vZGUgPSByb3dOb2Rlc1tpXTtcclxuICAgICAgICBkYXRhID0gbm9kZS5kYXRhO1xyXG5cclxuICAgICAgICBmb3IgKGN1cnJlbnRMZXZlbCA9IDA7IGN1cnJlbnRMZXZlbCA8IGdyb3VwQnlGaWVsZHMubGVuZ3RoOyBjdXJyZW50TGV2ZWwrKykge1xyXG4gICAgICAgICAgICBncm91cEJ5RmllbGQgPSBncm91cEJ5RmllbGRzW2N1cnJlbnRMZXZlbF07XHJcbiAgICAgICAgICAgIGdyb3VwS2V5ID0gZGF0YVtncm91cEJ5RmllbGRdO1xyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRMZXZlbCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50R3JvdXAgPSB0b3BNb3N0R3JvdXA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vaWYgZ3JvdXAgZG9lc24ndCBleGlzdCB5ZXQsIGNyZWF0ZSBpdFxyXG4gICAgICAgICAgICBuZXh0R3JvdXAgPSBjdXJyZW50R3JvdXAuY2hpbGRyZW5NYXBbZ3JvdXBLZXldO1xyXG4gICAgICAgICAgICBpZiAoIW5leHRHcm91cCkge1xyXG4gICAgICAgICAgICAgICAgbmV4dEdyb3VwID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkOiBncm91cEJ5RmllbGQsXHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGluZGV4LS0sXHJcbiAgICAgICAgICAgICAgICAgICAga2V5OiBncm91cEtleSxcclxuICAgICAgICAgICAgICAgICAgICBleHBhbmRlZDogdGhpcy5pc0V4cGFuZGVkKGV4cGFuZEJ5RGVmYXVsdCwgY3VycmVudExldmVsKSxcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZm9yIHRvcCBtb3N0IGxldmVsLCBwYXJlbnQgaXMgbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3VycmVudEdyb3VwID09PSB0b3BNb3N0R3JvdXAgPyBudWxsIDogY3VycmVudEdyb3VwLFxyXG4gICAgICAgICAgICAgICAgICAgIGFsbENoaWxkcmVuQ291bnQ6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IGN1cnJlbnRHcm91cC5sZXZlbCArIDEsXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5NYXA6IHt9IC8vdGhpcyBpcyBhIHRlbXBvcmFyeSBtYXAsIHdlIHJlbW92ZSBhdCB0aGUgZW5kIG9mIHRoaXMgbWV0aG9kXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEdyb3VwLmNoaWxkcmVuTWFwW2dyb3VwS2V5XSA9IG5leHRHcm91cDtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRHcm91cC5jaGlsZHJlbi5wdXNoKG5leHRHcm91cCk7XHJcbiAgICAgICAgICAgICAgICBhbGxHcm91cHMucHVzaChuZXh0R3JvdXApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBuZXh0R3JvdXAuYWxsQ2hpbGRyZW5Db3VudCsrO1xyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRMZXZlbCA9PSBsZXZlbFRvSW5zZXJ0Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUucGFyZW50ID0gbmV4dEdyb3VwID09PSB0b3BNb3N0R3JvdXAgPyBudWxsIDogbmV4dEdyb3VwO1xyXG4gICAgICAgICAgICAgICAgbmV4dEdyb3VwLmNoaWxkcmVuLnB1c2gobm9kZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50R3JvdXAgPSBuZXh0R3JvdXA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vcmVtb3ZlIHRoZSB0ZW1wb3JhcnkgbWFwXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgYWxsR3JvdXBzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgZGVsZXRlIGFsbEdyb3Vwc1tpXS5jaGlsZHJlbk1hcDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdG9wTW9zdEdyb3VwLmNoaWxkcmVuO1xyXG59O1xyXG5cclxuR3JvdXBDcmVhdG9yLnByb3RvdHlwZS5pc0V4cGFuZGVkID0gZnVuY3Rpb24oZXhwYW5kQnlEZWZhdWx0LCBsZXZlbCkge1xyXG4gICAgaWYgKHR5cGVvZiBleHBhbmRCeURlZmF1bHQgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgcmV0dXJuIGxldmVsIDwgZXhwYW5kQnlEZWZhdWx0O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gZXhwYW5kQnlEZWZhdWx0ID09PSB0cnVlIHx8IGV4cGFuZEJ5RGVmYXVsdCA9PT0gJ3RydWUnO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgR3JvdXBDcmVhdG9yKCk7XHJcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxudmFyIFN2Z0ZhY3RvcnkgPSByZXF1aXJlKCcuL3N2Z0ZhY3RvcnknKTtcclxudmFyIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XHJcblxyXG52YXIgc3ZnRmFjdG9yeSA9IG5ldyBTdmdGYWN0b3J5KCk7XHJcblxyXG5mdW5jdGlvbiBIZWFkZXJSZW5kZXJlcigpIHt9XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGdyaWRPcHRpb25zV3JhcHBlciwgY29sdW1uQ29udHJvbGxlciwgY29sdW1uTW9kZWwsIGVHcmlkLCBhbmd1bGFyR3JpZCwgZmlsdGVyTWFuYWdlciwgJHNjb3BlLCAkY29tcGlsZSkge1xyXG4gICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIgPSBncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsID0gY29sdW1uTW9kZWw7XHJcbiAgICB0aGlzLmNvbHVtbkNvbnRyb2xsZXIgPSBjb2x1bW5Db250cm9sbGVyO1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkO1xyXG4gICAgdGhpcy5maWx0ZXJNYW5hZ2VyID0gZmlsdGVyTWFuYWdlcjtcclxuICAgIHRoaXMuJHNjb3BlID0gJHNjb3BlO1xyXG4gICAgdGhpcy4kY29tcGlsZSA9ICRjb21waWxlO1xyXG4gICAgdGhpcy5maW5kQWxsRWxlbWVudHMoZUdyaWQpO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmZpbmRBbGxFbGVtZW50cyA9IGZ1bmN0aW9uKGVHcmlkKSB7XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9udFVzZVNjcm9sbHMoKSkge1xyXG4gICAgICAgIHRoaXMuZUhlYWRlckNvbnRhaW5lciA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctaGVhZGVyLWNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLmVSb290ID0gZUdyaWQucXVlcnlTZWxlY3RvcihcIi5hZy1yb290XCIpO1xyXG4gICAgICAgIC8vIGZvciBuby1zY3JvbGwsIGFsbCBoZWFkZXIgY2VsbHMgbGl2ZSBpbiB0aGUgaGVhZGVyIGNvbnRhaW5lciAodGhlIGFnLWhlYWRlciBkb2Vzbid0IGV4aXN0KVxyXG4gICAgICAgIHRoaXMuZUhlYWRlclBhcmVudCA9IHRoaXMuZUhlYWRlckNvbnRhaW5lcjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkSGVhZGVyID0gZUdyaWQucXVlcnlTZWxlY3RvcihcIi5hZy1waW5uZWQtaGVhZGVyXCIpO1xyXG4gICAgICAgIHRoaXMuZUhlYWRlckNvbnRhaW5lciA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctaGVhZGVyLWNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLmVIZWFkZXIgPSBlR3JpZC5xdWVyeVNlbGVjdG9yKFwiLmFnLWhlYWRlclwiKTtcclxuICAgICAgICB0aGlzLmVSb290ID0gZUdyaWQucXVlcnlTZWxlY3RvcihcIi5hZy1yb290XCIpO1xyXG4gICAgICAgIC8vIGZvciBzY3JvbGwsIGFsbCBoZWFkZXIgY2VsbHMgbGl2ZSBpbiB0aGUgaGVhZGVyIChjb250YWlucyBib3RoIG5vcm1hbCBhbmQgcGlubmVkIGhlYWRlcnMpXHJcbiAgICAgICAgdGhpcy5lSGVhZGVyUGFyZW50ID0gdGhpcy5lSGVhZGVyO1xyXG4gICAgfVxyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLnJlZnJlc2hIZWFkZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHV0aWxzLnJlbW92ZUFsbENoaWxkcmVuKHRoaXMuZVBpbm5lZEhlYWRlcik7XHJcbiAgICB1dGlscy5yZW1vdmVBbGxDaGlsZHJlbih0aGlzLmVIZWFkZXJDb250YWluZXIpO1xyXG5cclxuICAgIGlmICh0aGlzLmNoaWxkU2NvcGVzKSB7XHJcbiAgICAgICAgdGhpcy5jaGlsZFNjb3Blcy5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkU2NvcGUpIHtcclxuICAgICAgICAgICAgY2hpbGRTY29wZS4kZGVzdHJveSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5jaGlsZFNjb3BlcyA9IFtdO1xyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwSGVhZGVycygpKSB7XHJcbiAgICAgICAgdGhpcy5pbnNlcnRIZWFkZXJzV2l0aEdyb3VwaW5nKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuaW5zZXJ0SGVhZGVyc1dpdGhvdXRHcm91cGluZygpO1xyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5pbnNlcnRIZWFkZXJzV2l0aEdyb3VwaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ3JvdXBzID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRDb2x1bW5Hcm91cHMoKTtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uKGdyb3VwKSB7XHJcbiAgICAgICAgdmFyIGVIZWFkZXJDZWxsID0gdGhhdC5jcmVhdGVHcm91cGVkSGVhZGVyQ2VsbChncm91cCk7XHJcbiAgICAgICAgdmFyIGVDb250YWluZXJUb0FkZFRvID0gZ3JvdXAucGlubmVkID8gdGhhdC5lUGlubmVkSGVhZGVyIDogdGhhdC5lSGVhZGVyQ29udGFpbmVyO1xyXG4gICAgICAgIGVDb250YWluZXJUb0FkZFRvLmFwcGVuZENoaWxkKGVIZWFkZXJDZWxsKTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmNyZWF0ZUdyb3VwZWRIZWFkZXJDZWxsID0gZnVuY3Rpb24oZ3JvdXApIHtcclxuXHJcbiAgICB2YXIgZUhlYWRlckdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBlSGVhZGVyR3JvdXAuY2xhc3NOYW1lID0gJ2FnLWhlYWRlci1ncm91cCc7XHJcblxyXG4gICAgdmFyIGVIZWFkZXJHcm91cENlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGdyb3VwLmVIZWFkZXJHcm91cENlbGwgPSBlSGVhZGVyR3JvdXBDZWxsO1xyXG4gICAgdmFyIGNsYXNzTmFtZXMgPSBbJ2FnLWhlYWRlci1ncm91cC1jZWxsJ107XHJcbiAgICAvLyBoYXZpbmcgZGlmZmVyZW50IGNsYXNzZXMgYmVsb3cgYWxsb3dzIHRoZSBzdHlsZSB0byBub3QgaGF2ZSBhIGJvdHRvbSBib3JkZXJcclxuICAgIC8vIG9uIHRoZSBncm91cCBoZWFkZXIsIGlmIG5vIGdyb3VwIGlzIHNwZWNpZmllZFxyXG4gICAgaWYgKGdyb3VwLm5hbWUpIHtcclxuICAgICAgICBjbGFzc05hbWVzLnB1c2goJ2FnLWhlYWRlci1ncm91cC1jZWxsLXdpdGgtZ3JvdXAnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2xhc3NOYW1lcy5wdXNoKCdhZy1oZWFkZXItZ3JvdXAtY2VsbC1uby1ncm91cCcpO1xyXG4gICAgfVxyXG4gICAgZUhlYWRlckdyb3VwQ2VsbC5jbGFzc05hbWUgPSBjbGFzc05hbWVzLmpvaW4oJyAnKTtcclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNFbmFibGVDb2xSZXNpemUoKSkge1xyXG4gICAgICAgIHZhciBlSGVhZGVyQ2VsbFJlc2l6ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgZUhlYWRlckNlbGxSZXNpemUuY2xhc3NOYW1lID0gXCJhZy1oZWFkZXItY2VsbC1yZXNpemVcIjtcclxuICAgICAgICBlSGVhZGVyR3JvdXBDZWxsLmFwcGVuZENoaWxkKGVIZWFkZXJDZWxsUmVzaXplKTtcclxuICAgICAgICBncm91cC5lSGVhZGVyQ2VsbFJlc2l6ZSA9IGVIZWFkZXJDZWxsUmVzaXplO1xyXG4gICAgICAgIHZhciBkcmFnQ2FsbGJhY2sgPSB0aGlzLmdyb3VwRHJhZ0NhbGxiYWNrRmFjdG9yeShncm91cCk7XHJcbiAgICAgICAgdGhpcy5hZGREcmFnSGFuZGxlcihlSGVhZGVyQ2VsbFJlc2l6ZSwgZHJhZ0NhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBubyByZW5kZXJlciwgZGVmYXVsdCB0ZXh0IHJlbmRlclxyXG4gICAgdmFyIGdyb3VwTmFtZSA9IGdyb3VwLm5hbWU7XHJcbiAgICBpZiAoZ3JvdXBOYW1lICYmIGdyb3VwTmFtZSAhPT0gJycpIHtcclxuICAgICAgICB2YXIgZUdyb3VwQ2VsbExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBlR3JvdXBDZWxsTGFiZWwuY2xhc3NOYW1lID0gJ2FnLWhlYWRlci1ncm91cC1jZWxsLWxhYmVsJztcclxuICAgICAgICBlSGVhZGVyR3JvdXBDZWxsLmFwcGVuZENoaWxkKGVHcm91cENlbGxMYWJlbCk7XHJcblxyXG4gICAgICAgIHZhciBlSW5uZXJUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAgICAgZUlubmVyVGV4dC5jbGFzc05hbWUgPSAnYWctaGVhZGVyLWdyb3VwLXRleHQnO1xyXG4gICAgICAgIGVJbm5lclRleHQuaW5uZXJIVE1MID0gZ3JvdXBOYW1lO1xyXG4gICAgICAgIGVHcm91cENlbGxMYWJlbC5hcHBlbmRDaGlsZChlSW5uZXJUZXh0KTtcclxuXHJcbiAgICAgICAgaWYgKGdyb3VwLmV4cGFuZGFibGUpIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRHcm91cEV4cGFuZEljb24oZ3JvdXAsIGVHcm91cENlbGxMYWJlbCwgZ3JvdXAuZXhwYW5kZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVIZWFkZXJHcm91cC5hcHBlbmRDaGlsZChlSGVhZGVyR3JvdXBDZWxsKTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBncm91cC52aXNpYmxlQ29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgICAgIHZhciBlSGVhZGVyQ2VsbCA9IHRoYXQuY3JlYXRlSGVhZGVyQ2VsbChjb2x1bW4sIHRydWUsIGdyb3VwKTtcclxuICAgICAgICBlSGVhZGVyR3JvdXAuYXBwZW5kQ2hpbGQoZUhlYWRlckNlbGwpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhhdC5zZXRXaWR0aE9mR3JvdXBIZWFkZXJDZWxsKGdyb3VwKTtcclxuXHJcbiAgICByZXR1cm4gZUhlYWRlckdyb3VwO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmFkZEdyb3VwRXhwYW5kSWNvbiA9IGZ1bmN0aW9uKGdyb3VwLCBlSGVhZGVyR3JvdXAsIGV4cGFuZGVkKSB7XHJcbiAgICB2YXIgZUdyb3VwSWNvbjtcclxuICAgIGlmIChleHBhbmRlZCkge1xyXG4gICAgICAgIGVHcm91cEljb24gPSB1dGlscy5jcmVhdGVJY29uKCdjb2x1bW5Hcm91cE9wZW5lZCcsIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLCBudWxsLCBzdmdGYWN0b3J5LmNyZWF0ZUFycm93TGVmdFN2Zyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVHcm91cEljb24gPSB1dGlscy5jcmVhdGVJY29uKCdjb2x1bW5Hcm91cENsb3NlZCcsIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLCBudWxsLCBzdmdGYWN0b3J5LmNyZWF0ZUFycm93UmlnaHRTdmcpO1xyXG4gICAgfVxyXG4gICAgZUdyb3VwSWNvbi5jbGFzc05hbWUgPSAnYWctaGVhZGVyLWV4cGFuZC1pY29uJztcclxuICAgIGVIZWFkZXJHcm91cC5hcHBlbmRDaGlsZChlR3JvdXBJY29uKTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBlR3JvdXBJY29uLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGF0LmNvbHVtbkNvbnRyb2xsZXIuY29sdW1uR3JvdXBPcGVuZWQoZ3JvdXApO1xyXG4gICAgfTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5hZGREcmFnSGFuZGxlciA9IGZ1bmN0aW9uKGVEcmFnZ2FibGVFbGVtZW50LCBkcmFnQ2FsbGJhY2spIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGVEcmFnZ2FibGVFbGVtZW50Lm9ubW91c2Vkb3duID0gZnVuY3Rpb24oZG93bkV2ZW50KSB7XHJcbiAgICAgICAgZHJhZ0NhbGxiYWNrLm9uRHJhZ1N0YXJ0KCk7XHJcbiAgICAgICAgdGhhdC5lUm9vdC5zdHlsZS5jdXJzb3IgPSBcImNvbC1yZXNpemVcIjtcclxuICAgICAgICB0aGF0LmRyYWdTdGFydFggPSBkb3duRXZlbnQuY2xpZW50WDtcclxuXHJcbiAgICAgICAgdGhhdC5lUm9vdC5vbm1vdXNlbW92ZSA9IGZ1bmN0aW9uKG1vdmVFdmVudCkge1xyXG4gICAgICAgICAgICB2YXIgbmV3WCA9IG1vdmVFdmVudC5jbGllbnRYO1xyXG4gICAgICAgICAgICB2YXIgY2hhbmdlID0gbmV3WCAtIHRoYXQuZHJhZ1N0YXJ0WDtcclxuICAgICAgICAgICAgZHJhZ0NhbGxiYWNrLm9uRHJhZ2dpbmcoY2hhbmdlKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoYXQuZVJvb3Qub25tb3VzZXVwID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc3RvcERyYWdnaW5nKCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGF0LmVSb290Lm9ubW91c2VsZWF2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LnN0b3BEcmFnZ2luZygpO1xyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLnNldFdpZHRoT2ZHcm91cEhlYWRlckNlbGwgPSBmdW5jdGlvbihoZWFkZXJHcm91cCkge1xyXG4gICAgdmFyIHRvdGFsV2lkdGggPSAwO1xyXG4gICAgaGVhZGVyR3JvdXAudmlzaWJsZUNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgICAgICB0b3RhbFdpZHRoICs9IGNvbHVtbi5hY3R1YWxXaWR0aDtcclxuICAgIH0pO1xyXG4gICAgaGVhZGVyR3JvdXAuZUhlYWRlckdyb3VwQ2VsbC5zdHlsZS53aWR0aCA9IHV0aWxzLmZvcm1hdFdpZHRoKHRvdGFsV2lkdGgpO1xyXG4gICAgaGVhZGVyR3JvdXAuYWN0dWFsV2lkdGggPSB0b3RhbFdpZHRoO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmluc2VydEhlYWRlcnNXaXRob3V0R3JvdXBpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBlUGlubmVkSGVhZGVyID0gdGhpcy5lUGlubmVkSGVhZGVyO1xyXG4gICAgdmFyIGVIZWFkZXJDb250YWluZXIgPSB0aGlzLmVIZWFkZXJDb250YWluZXI7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgdGhpcy5jb2x1bW5Nb2RlbC5nZXRWaXNpYmxlQ29sdW1ucygpLmZvckVhY2goZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICAgICAgLy8gb25seSBpbmNsdWRlIHRoZSBmaXJzdCB4IGNvbHNcclxuICAgICAgICB2YXIgaGVhZGVyQ2VsbCA9IHRoYXQuY3JlYXRlSGVhZGVyQ2VsbChjb2x1bW4sIGZhbHNlKTtcclxuICAgICAgICBpZiAoY29sdW1uLnBpbm5lZCkge1xyXG4gICAgICAgICAgICBlUGlubmVkSGVhZGVyLmFwcGVuZENoaWxkKGhlYWRlckNlbGwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVIZWFkZXJDb250YWluZXIuYXBwZW5kQ2hpbGQoaGVhZGVyQ2VsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlSGVhZGVyQ2VsbCA9IGZ1bmN0aW9uKGNvbHVtbiwgZ3JvdXBlZCwgaGVhZGVyR3JvdXApIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHZhciBjb2xEZWYgPSBjb2x1bW4uY29sRGVmO1xyXG4gICAgdmFyIGVIZWFkZXJDZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIC8vIHN0aWNrIHRoZSBoZWFkZXIgY2VsbCBpbiBjb2x1bW4sIGFzIHdlIGFjY2VzcyBpdCB3aGVuIGdyb3VwIGlzIHJlLXNpemVkXHJcbiAgICBjb2x1bW4uZUhlYWRlckNlbGwgPSBlSGVhZGVyQ2VsbDtcclxuXHJcbiAgICB2YXIgaGVhZGVyQ2VsbENsYXNzZXMgPSBbJ2FnLWhlYWRlci1jZWxsJ107XHJcbiAgICBpZiAoZ3JvdXBlZCkge1xyXG4gICAgICAgIGhlYWRlckNlbGxDbGFzc2VzLnB1c2goJ2FnLWhlYWRlci1jZWxsLWdyb3VwZWQnKTsgLy8gdGhpcyB0YWtlcyA1MCUgaGVpZ2h0XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGhlYWRlckNlbGxDbGFzc2VzLnB1c2goJ2FnLWhlYWRlci1jZWxsLW5vdC1ncm91cGVkJyk7IC8vIHRoaXMgdGFrZXMgMTAwJSBoZWlnaHRcclxuICAgIH1cclxuICAgIGVIZWFkZXJDZWxsLmNsYXNzTmFtZSA9IGhlYWRlckNlbGxDbGFzc2VzLmpvaW4oJyAnKTtcclxuXHJcbiAgICAvLyBhZGQgdG9vbHRpcCBpZiBleGlzdHNcclxuICAgIGlmIChjb2xEZWYuaGVhZGVyVG9vbHRpcCkge1xyXG4gICAgICAgIGVIZWFkZXJDZWxsLnRpdGxlID0gY29sRGVmLmhlYWRlclRvb2x0aXA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRW5hYmxlQ29sUmVzaXplKCkpIHtcclxuICAgICAgICB2YXIgaGVhZGVyQ2VsbFJlc2l6ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgaGVhZGVyQ2VsbFJlc2l6ZS5jbGFzc05hbWUgPSBcImFnLWhlYWRlci1jZWxsLXJlc2l6ZVwiO1xyXG4gICAgICAgIGVIZWFkZXJDZWxsLmFwcGVuZENoaWxkKGhlYWRlckNlbGxSZXNpemUpO1xyXG4gICAgICAgIHZhciBkcmFnQ2FsbGJhY2sgPSB0aGlzLmhlYWRlckRyYWdDYWxsYmFja0ZhY3RvcnkoZUhlYWRlckNlbGwsIGNvbHVtbiwgaGVhZGVyR3JvdXApO1xyXG4gICAgICAgIHRoaXMuYWRkRHJhZ0hhbmRsZXIoaGVhZGVyQ2VsbFJlc2l6ZSwgZHJhZ0NhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBmaWx0ZXIgYnV0dG9uXHJcbiAgICB2YXIgc2hvd01lbnUgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0VuYWJsZUZpbHRlcigpICYmICFjb2xEZWYuc3VwcHJlc3NNZW51O1xyXG4gICAgaWYgKHNob3dNZW51KSB7XHJcbiAgICAgICAgdmFyIGVNZW51QnV0dG9uID0gdXRpbHMuY3JlYXRlSWNvbignbWVudScsIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLCBjb2x1bW4sIHN2Z0ZhY3RvcnkuY3JlYXRlTWVudVN2Zyk7XHJcbiAgICAgICAgdXRpbHMuYWRkQ3NzQ2xhc3MoZU1lbnVCdXR0b24sICdhZy1oZWFkZXItaWNvbicpO1xyXG5cclxuICAgICAgICBlTWVudUJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcImFnLWhlYWRlci1jZWxsLW1lbnUtYnV0dG9uXCIpO1xyXG4gICAgICAgIGVNZW51QnV0dG9uLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5maWx0ZXJNYW5hZ2VyLnNob3dGaWx0ZXIoY29sdW1uLCB0aGlzKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGVIZWFkZXJDZWxsLmFwcGVuZENoaWxkKGVNZW51QnV0dG9uKTtcclxuICAgICAgICBlSGVhZGVyQ2VsbC5vbm1vdXNlZW50ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZU1lbnVCdXR0b24uc3R5bGUub3BhY2l0eSA9IDE7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBlSGVhZGVyQ2VsbC5vbm1vdXNlbGVhdmUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZU1lbnVCdXR0b24uc3R5bGUub3BhY2l0eSA9IDA7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBlTWVudUJ1dHRvbi5zdHlsZS5vcGFjaXR5ID0gMDtcclxuICAgICAgICBlTWVudUJ1dHRvbi5zdHlsZVtcIi13ZWJraXQtdHJhbnNpdGlvblwiXSA9IFwib3BhY2l0eSAwLjVzLCBib3JkZXIgMC4yc1wiO1xyXG4gICAgICAgIGVNZW51QnV0dG9uLnN0eWxlW1widHJhbnNpdGlvblwiXSA9IFwib3BhY2l0eSAwLjVzLCBib3JkZXIgMC4yc1wiO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGxhYmVsIGRpdlxyXG4gICAgdmFyIGhlYWRlckNlbGxMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBoZWFkZXJDZWxsTGFiZWwuY2xhc3NOYW1lID0gXCJhZy1oZWFkZXItY2VsbC1sYWJlbFwiO1xyXG5cclxuICAgIC8vIGFkZCBpbiBzb3J0IGljb25zXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNFbmFibGVTb3J0aW5nKCkgJiYgIWNvbERlZi5zdXBwcmVzc1NvcnRpbmcpIHtcclxuICAgICAgICBjb2x1bW4uZVNvcnRBc2MgPSB1dGlscy5jcmVhdGVJY29uKCdzb3J0QXNjZW5kaW5nJywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbiwgc3ZnRmFjdG9yeS5jcmVhdGVBcnJvd1VwU3ZnKTtcclxuICAgICAgICBjb2x1bW4uZVNvcnREZXNjID0gdXRpbHMuY3JlYXRlSWNvbignc29ydERlc2NlbmRpbmcnLCB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciwgY29sdW1uLCBzdmdGYWN0b3J5LmNyZWF0ZUFycm93RG93blN2Zyk7XHJcbiAgICAgICAgdXRpbHMuYWRkQ3NzQ2xhc3MoY29sdW1uLmVTb3J0QXNjLCAnYWctaGVhZGVyLWljb24nKTtcclxuICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhjb2x1bW4uZVNvcnREZXNjLCAnYWctaGVhZGVyLWljb24nKTtcclxuICAgICAgICBoZWFkZXJDZWxsTGFiZWwuYXBwZW5kQ2hpbGQoY29sdW1uLmVTb3J0QXNjKTtcclxuICAgICAgICBoZWFkZXJDZWxsTGFiZWwuYXBwZW5kQ2hpbGQoY29sdW1uLmVTb3J0RGVzYyk7XHJcbiAgICAgICAgY29sdW1uLmVTb3J0QXNjLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgY29sdW1uLmVTb3J0RGVzYy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuYWRkU29ydEhhbmRsaW5nKGhlYWRlckNlbGxMYWJlbCwgY29sdW1uKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhZGQgaW4gZmlsdGVyIGljb25cclxuICAgIGNvbHVtbi5lRmlsdGVySWNvbiA9IHV0aWxzLmNyZWF0ZUljb24oJ2ZpbHRlcicsIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLCBjb2x1bW4sIHN2Z0ZhY3RvcnkuY3JlYXRlRmlsdGVyU3ZnKTtcclxuICAgIHV0aWxzLmFkZENzc0NsYXNzKGNvbHVtbi5lRmlsdGVySWNvbiwgJ2FnLWhlYWRlci1pY29uJyk7XHJcbiAgICBoZWFkZXJDZWxsTGFiZWwuYXBwZW5kQ2hpbGQoY29sdW1uLmVGaWx0ZXJJY29uKTtcclxuXHJcbiAgICAvLyByZW5kZXIgdGhlIGNlbGwsIHVzZSBhIHJlbmRlcmVyIGlmIG9uZSBpcyBwcm92aWRlZFxyXG4gICAgdmFyIGhlYWRlckNlbGxSZW5kZXJlcjtcclxuICAgIGlmIChjb2xEZWYuaGVhZGVyQ2VsbFJlbmRlcmVyKSB7IC8vIGZpcnN0IGxvb2sgZm9yIGEgcmVuZGVyZXIgaW4gY29sIGRlZlxyXG4gICAgICAgIGhlYWRlckNlbGxSZW5kZXJlciA9IGNvbERlZi5oZWFkZXJDZWxsUmVuZGVyZXI7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEhlYWRlckNlbGxSZW5kZXJlcigpKSB7IC8vIHNlY29uZCBsb29rIGZvciBvbmUgaW4gZ3JpZCBvcHRpb25zXHJcbiAgICAgICAgaGVhZGVyQ2VsbFJlbmRlcmVyID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0SGVhZGVyQ2VsbFJlbmRlcmVyKCk7XHJcbiAgICB9XHJcbiAgICBpZiAoaGVhZGVyQ2VsbFJlbmRlcmVyKSB7XHJcbiAgICAgICAgLy8gcmVuZGVyZXIgcHJvdmlkZWQsIHVzZSBpdFxyXG4gICAgICAgIHZhciBuZXdDaGlsZFNjb3BlO1xyXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0FuZ3VsYXJDb21waWxlSGVhZGVycygpKSB7XHJcbiAgICAgICAgICAgIG5ld0NoaWxkU2NvcGUgPSB0aGlzLiRzY29wZS4kbmV3KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBjZWxsUmVuZGVyZXJQYXJhbXMgPSB7XHJcbiAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAkc2NvcGU6IG5ld0NoaWxkU2NvcGUsXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKSxcclxuICAgICAgICAgICAgZ3JpZE9wdGlvbnM6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEdyaWRPcHRpb25zKClcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBjZWxsUmVuZGVyZXJSZXN1bHQgPSBoZWFkZXJDZWxsUmVuZGVyZXIoY2VsbFJlbmRlcmVyUGFyYW1zKTtcclxuICAgICAgICB2YXIgY2hpbGRUb0FwcGVuZDtcclxuICAgICAgICBpZiAodXRpbHMuaXNOb2RlKGNlbGxSZW5kZXJlclJlc3VsdCkgfHwgdXRpbHMuaXNFbGVtZW50KGNlbGxSZW5kZXJlclJlc3VsdCkpIHtcclxuICAgICAgICAgICAgLy8gYSBkb20gbm9kZSBvciBlbGVtZW50IHdhcyByZXR1cm5lZCwgc28gYWRkIGNoaWxkXHJcbiAgICAgICAgICAgIGNoaWxkVG9BcHBlbmQgPSBjZWxsUmVuZGVyZXJSZXN1bHQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIGFzc3VtZSBpdCB3YXMgaHRtbCwgc28ganVzdCBpbnNlcnRcclxuICAgICAgICAgICAgdmFyIGVUZXh0U3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgICAgICAgICBlVGV4dFNwYW4uaW5uZXJIVE1MID0gY2VsbFJlbmRlcmVyUmVzdWx0O1xyXG4gICAgICAgICAgICBjaGlsZFRvQXBwZW5kID0gZVRleHRTcGFuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBhbmd1bGFyIGNvbXBpbGUgaGVhZGVyIGlmIG9wdGlvbiBpcyB0dXJuZWQgb25cclxuICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNBbmd1bGFyQ29tcGlsZUhlYWRlcnMoKSkge1xyXG4gICAgICAgICAgICBuZXdDaGlsZFNjb3BlLmNvbERlZiA9IGNvbERlZjtcclxuICAgICAgICAgICAgbmV3Q2hpbGRTY29wZS5jb2xJbmRleCA9IGNvbERlZi5pbmRleDtcclxuICAgICAgICAgICAgbmV3Q2hpbGRTY29wZS5jb2xEZWZXcmFwcGVyID0gY29sdW1uO1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkU2NvcGVzLnB1c2gobmV3Q2hpbGRTY29wZSk7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZFRvQXBwZW5kQ29tcGlsZWQgPSB0aGlzLiRjb21waWxlKGNoaWxkVG9BcHBlbmQpKG5ld0NoaWxkU2NvcGUpWzBdO1xyXG4gICAgICAgICAgICBoZWFkZXJDZWxsTGFiZWwuYXBwZW5kQ2hpbGQoY2hpbGRUb0FwcGVuZENvbXBpbGVkKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoZWFkZXJDZWxsTGFiZWwuYXBwZW5kQ2hpbGQoY2hpbGRUb0FwcGVuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBubyByZW5kZXJlciwgZGVmYXVsdCB0ZXh0IHJlbmRlclxyXG4gICAgICAgIHZhciBlSW5uZXJUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAgICAgZUlubmVyVGV4dC5jbGFzc05hbWUgPSAnYWctaGVhZGVyLWNlbGwtdGV4dCc7XHJcbiAgICAgICAgZUlubmVyVGV4dC5pbm5lckhUTUwgPSBjb2xEZWYuZGlzcGxheU5hbWU7XHJcbiAgICAgICAgaGVhZGVyQ2VsbExhYmVsLmFwcGVuZENoaWxkKGVJbm5lclRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGVIZWFkZXJDZWxsLmFwcGVuZENoaWxkKGhlYWRlckNlbGxMYWJlbCk7XHJcbiAgICBlSGVhZGVyQ2VsbC5zdHlsZS53aWR0aCA9IHV0aWxzLmZvcm1hdFdpZHRoKGNvbHVtbi5hY3R1YWxXaWR0aCk7XHJcblxyXG4gICAgcmV0dXJuIGVIZWFkZXJDZWxsO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmFkZFNvcnRIYW5kbGluZyA9IGZ1bmN0aW9uKGhlYWRlckNlbGxMYWJlbCwgY29sRGVmV3JhcHBlcikge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIGhlYWRlckNlbGxMYWJlbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBzb3J0IG9uIGN1cnJlbnQgY29sXHJcbiAgICAgICAgaWYgKGNvbERlZldyYXBwZXIuc29ydCA9PT0gY29uc3RhbnRzLkFTQykge1xyXG4gICAgICAgICAgICBjb2xEZWZXcmFwcGVyLnNvcnQgPSBjb25zdGFudHMuREVTQztcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbERlZldyYXBwZXIuc29ydCA9PT0gY29uc3RhbnRzLkRFU0MpIHtcclxuICAgICAgICAgICAgY29sRGVmV3JhcHBlci5zb3J0ID0gbnVsbFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbERlZldyYXBwZXIuc29ydCA9IGNvbnN0YW50cy5BU0M7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjbGVhciBzb3J0IG9uIGFsbCBjb2x1bW5zIGV4Y2VwdCB0aGlzIG9uZSwgYW5kIHVwZGF0ZSB0aGUgaWNvbnNcclxuICAgICAgICB0aGF0LmNvbHVtbk1vZGVsLmdldEFsbENvbHVtbnMoKS5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtblRvQ2xlYXIpIHtcclxuICAgICAgICAgICAgaWYgKGNvbHVtblRvQ2xlYXIgIT09IGNvbERlZldyYXBwZXIpIHtcclxuICAgICAgICAgICAgICAgIGNvbHVtblRvQ2xlYXIuc29ydCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGluIGNhc2Ugbm8gc29ydGluZyBvbiB0aGlzIHBhcnRpY3VsYXIgY29sLCBhcyBzb3J0aW5nIGlzIG9wdGlvbmFsIHBlciBjb2xcclxuICAgICAgICAgICAgaWYgKGNvbHVtblRvQ2xlYXIuY29sRGVmLnN1cHByZXNzU29ydGluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyB1cGRhdGUgdmlzaWJpbGl0eSBvZiBpY29uc1xyXG4gICAgICAgICAgICB2YXIgc29ydEFzY2VuZGluZyA9IGNvbHVtblRvQ2xlYXIuc29ydCA9PT0gY29uc3RhbnRzLkFTQztcclxuICAgICAgICAgICAgdmFyIHNvcnREZXNjZW5kaW5nID0gY29sdW1uVG9DbGVhci5zb3J0ID09PSBjb25zdGFudHMuREVTQztcclxuXHJcbiAgICAgICAgICAgIGlmIChjb2x1bW5Ub0NsZWFyLmVTb3J0QXNjKSB7XHJcbiAgICAgICAgICAgICAgICBjb2x1bW5Ub0NsZWFyLmVTb3J0QXNjLnN0eWxlLmRpc3BsYXkgPSBzb3J0QXNjZW5kaW5nID8gJ2lubGluZScgOiAnbm9uZSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNvbHVtblRvQ2xlYXIuZVNvcnREZXNjKSB7XHJcbiAgICAgICAgICAgICAgICBjb2x1bW5Ub0NsZWFyLmVTb3J0RGVzYy5zdHlsZS5kaXNwbGF5ID0gc29ydERlc2NlbmRpbmcgPyAnaW5saW5lJyA6ICdub25lJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGF0LmFuZ3VsYXJHcmlkLnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9TT1JUKTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmdyb3VwRHJhZ0NhbGxiYWNrRmFjdG9yeSA9IGZ1bmN0aW9uKGN1cnJlbnRHcm91cCkge1xyXG4gICAgdmFyIHBhcmVudCA9IHRoaXM7XHJcbiAgICB2YXIgdmlzaWJsZUNvbHVtbnMgPSBjdXJyZW50R3JvdXAudmlzaWJsZUNvbHVtbnM7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5ncm91cFdpZHRoU3RhcnQgPSBjdXJyZW50R3JvdXAuYWN0dWFsV2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW5XaWR0aFN0YXJ0cyA9IFtdO1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHZpc2libGVDb2x1bW5zLmZvckVhY2goZnVuY3Rpb24oY29sRGVmV3JhcHBlcikge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5jaGlsZHJlbldpZHRoU3RhcnRzLnB1c2goY29sRGVmV3JhcHBlci5hY3R1YWxXaWR0aCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLm1pbldpZHRoID0gdmlzaWJsZUNvbHVtbnMubGVuZ3RoICogY29uc3RhbnRzLk1JTl9DT0xfV0lEVEg7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkRyYWdnaW5nOiBmdW5jdGlvbihkcmFnQ2hhbmdlKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgbmV3V2lkdGggPSB0aGlzLmdyb3VwV2lkdGhTdGFydCArIGRyYWdDaGFuZ2U7XHJcbiAgICAgICAgICAgIGlmIChuZXdXaWR0aCA8IHRoaXMubWluV2lkdGgpIHtcclxuICAgICAgICAgICAgICAgIG5ld1dpZHRoID0gdGhpcy5taW5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gc2V0IHRoZSBuZXcgd2lkdGggdG8gdGhlIGdyb3VwIGhlYWRlclxyXG4gICAgICAgICAgICB2YXIgbmV3V2lkdGhQeCA9IG5ld1dpZHRoICsgXCJweFwiO1xyXG4gICAgICAgICAgICBjdXJyZW50R3JvdXAuZUhlYWRlckdyb3VwQ2VsbC5zdHlsZS53aWR0aCA9IG5ld1dpZHRoUHg7XHJcbiAgICAgICAgICAgIGN1cnJlbnRHcm91cC5hY3R1YWxXaWR0aCA9IG5ld1dpZHRoO1xyXG5cclxuICAgICAgICAgICAgLy8gZGlzdHJpYnV0ZSB0aGUgbmV3IHdpZHRoIHRvIHRoZSBjaGlsZCBoZWFkZXJzXHJcbiAgICAgICAgICAgIHZhciBjaGFuZ2VSYXRpbyA9IG5ld1dpZHRoIC8gdGhpcy5ncm91cFdpZHRoU3RhcnQ7XHJcbiAgICAgICAgICAgIC8vIGtlZXAgdHJhY2sgb2YgcGl4ZWxzIHVzZWQsIGFuZCBsYXN0IGNvbHVtbiBnZXRzIHRoZSByZW1haW5pbmcsXHJcbiAgICAgICAgICAgIC8vIHRvIGNhdGVyIGZvciByb3VuZGluZyBlcnJvcnMsIGFuZCBtaW4gd2lkdGggYWRqdXN0bWVudHNcclxuICAgICAgICAgICAgdmFyIHBpeGVsc1RvRGlzdHJpYnV0ZSA9IG5ld1dpZHRoO1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIGN1cnJlbnRHcm91cC52aXNpYmxlQ29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbERlZldyYXBwZXIsIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbm90TGFzdENvbCA9IGluZGV4ICE9PSAodmlzaWJsZUNvbHVtbnMubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3Q2hpbGRTaXplO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vdExhc3RDb2wpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBub3QgdGhlIGxhc3QgY29sLCBjYWxjdWxhdGUgdGhlIGNvbHVtbiB3aWR0aCBhcyBub3JtYWxcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhcnRDaGlsZFNpemUgPSB0aGF0LmNoaWxkcmVuV2lkdGhTdGFydHNbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkU2l6ZSA9IHN0YXJ0Q2hpbGRTaXplICogY2hhbmdlUmF0aW87XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkU2l6ZSA8IGNvbnN0YW50cy5NSU5fQ09MX1dJRFRIKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkU2l6ZSA9IGNvbnN0YW50cy5NSU5fQ09MX1dJRFRIO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBwaXhlbHNUb0Rpc3RyaWJ1dGUgLT0gbmV3Q2hpbGRTaXplO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBsYXN0IGNvbCwgZ2l2ZSBpdCB0aGUgcmVtYWluaW5nIHBpeGVsc1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkU2l6ZSA9IHBpeGVsc1RvRGlzdHJpYnV0ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBlSGVhZGVyQ2VsbCA9IHZpc2libGVDb2x1bW5zW2luZGV4XS5lSGVhZGVyQ2VsbDtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5hZGp1c3RDb2x1bW5XaWR0aChuZXdDaGlsZFNpemUsIGNvbERlZldyYXBwZXIsIGVIZWFkZXJDZWxsKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBzaG91bGQgbm90IGJlIGNhbGxpbmcgdGhlc2UgaGVyZSwgc2hvdWxkIGRvIHNvbWV0aGluZyBlbHNlXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50R3JvdXAucGlubmVkKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuYW5ndWxhckdyaWQudXBkYXRlUGlubmVkQ29sQ29udGFpbmVyV2lkdGhBZnRlckNvbFJlc2l6ZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50LmFuZ3VsYXJHcmlkLnVwZGF0ZUJvZHlDb250YWluZXJXaWR0aEFmdGVyQ29sUmVzaXplKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmFkanVzdENvbHVtbldpZHRoID0gZnVuY3Rpb24obmV3V2lkdGgsIGNvbHVtbiwgZUhlYWRlckNlbGwpIHtcclxuICAgIHZhciBuZXdXaWR0aFB4ID0gbmV3V2lkdGggKyBcInB4XCI7XHJcbiAgICB2YXIgc2VsZWN0b3JGb3JBbGxDb2xzSW5DZWxsID0gXCIuY2VsbC1jb2wtXCIgKyBjb2x1bW4uaW5kZXg7XHJcbiAgICB2YXIgY2VsbHNGb3JUaGlzQ29sID0gdGhpcy5lUm9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yRm9yQWxsQ29sc0luQ2VsbCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNlbGxzRm9yVGhpc0NvbC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNlbGxzRm9yVGhpc0NvbFtpXS5zdHlsZS53aWR0aCA9IG5ld1dpZHRoUHg7XHJcbiAgICB9XHJcblxyXG4gICAgZUhlYWRlckNlbGwuc3R5bGUud2lkdGggPSBuZXdXaWR0aFB4O1xyXG4gICAgY29sdW1uLmFjdHVhbFdpZHRoID0gbmV3V2lkdGg7XHJcbn07XHJcblxyXG4vLyBnZXRzIGNhbGxlZCB3aGVuIGEgaGVhZGVyIChub3QgYSBoZWFkZXIgZ3JvdXApIGdldHMgcmVzaXplZFxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuaGVhZGVyRHJhZ0NhbGxiYWNrRmFjdG9yeSA9IGZ1bmN0aW9uKGhlYWRlckNlbGwsIGNvbHVtbiwgaGVhZGVyR3JvdXApIHtcclxuICAgIHZhciBwYXJlbnQgPSB0aGlzO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBvbkRyYWdTdGFydDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRXaWR0aCA9IGNvbHVtbi5hY3R1YWxXaWR0aDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRHJhZ2dpbmc6IGZ1bmN0aW9uKGRyYWdDaGFuZ2UpIHtcclxuICAgICAgICAgICAgdmFyIG5ld1dpZHRoID0gdGhpcy5zdGFydFdpZHRoICsgZHJhZ0NoYW5nZTtcclxuICAgICAgICAgICAgaWYgKG5ld1dpZHRoIDwgY29uc3RhbnRzLk1JTl9DT0xfV0lEVEgpIHtcclxuICAgICAgICAgICAgICAgIG5ld1dpZHRoID0gY29uc3RhbnRzLk1JTl9DT0xfV0lEVEg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHBhcmVudC5hZGp1c3RDb2x1bW5XaWR0aChuZXdXaWR0aCwgY29sdW1uLCBoZWFkZXJDZWxsKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChoZWFkZXJHcm91cCkge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50LnNldFdpZHRoT2ZHcm91cEhlYWRlckNlbGwoaGVhZGVyR3JvdXApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBzaG91bGQgbm90IGJlIGNhbGxpbmcgdGhlc2UgaGVyZSwgc2hvdWxkIGRvIHNvbWV0aGluZyBlbHNlXHJcbiAgICAgICAgICAgIGlmIChjb2x1bW4ucGlubmVkKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuYW5ndWxhckdyaWQudXBkYXRlUGlubmVkQ29sQ29udGFpbmVyV2lkdGhBZnRlckNvbFJlc2l6ZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50LmFuZ3VsYXJHcmlkLnVwZGF0ZUJvZHlDb250YWluZXJXaWR0aEFmdGVyQ29sUmVzaXplKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLnN0b3BEcmFnZ2luZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lUm9vdC5zdHlsZS5jdXJzb3IgPSBcIlwiO1xyXG4gICAgdGhpcy5lUm9vdC5vbm1vdXNldXAgPSBudWxsO1xyXG4gICAgdGhpcy5lUm9vdC5vbm1vdXNlbGVhdmUgPSBudWxsO1xyXG4gICAgdGhpcy5lUm9vdC5vbm1vdXNlbW92ZSA9IG51bGw7XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUudXBkYXRlRmlsdGVySWNvbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHRoaXMuY29sdW1uTW9kZWwuZ2V0VmlzaWJsZUNvbHVtbnMoKS5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgICAgIC8vIHRvZG86IG5lZWQgdG8gY2hhbmdlIHRoaXMsIHNvIG9ubHkgdXBkYXRlcyBpZiBjb2x1bW4gaXMgdmlzaWJsZVxyXG4gICAgICAgIGlmIChjb2x1bW4uZUZpbHRlckljb24pIHtcclxuICAgICAgICAgICAgdmFyIGZpbHRlclByZXNlbnQgPSB0aGF0LmZpbHRlck1hbmFnZXIuaXNGaWx0ZXJQcmVzZW50Rm9yQ29sKGNvbHVtbi5jb2xLZXkpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheVN0eWxlID0gZmlsdGVyUHJlc2VudCA/ICdpbmxpbmUnIDogJ25vbmUnO1xyXG4gICAgICAgICAgICBjb2x1bW4uZUZpbHRlckljb24uc3R5bGUuZGlzcGxheSA9IGRpc3BsYXlTdHlsZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyUmVuZGVyZXI7XHJcbiIsInZhciBncm91cENyZWF0b3IgPSByZXF1aXJlKCcuL2dyb3VwQ3JlYXRvcicpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcbnZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xyXG5cclxuZnVuY3Rpb24gSW5NZW1vcnlSb3dDb250cm9sbGVyKCkge1xyXG4gICAgdGhpcy5jcmVhdGVNb2RlbCgpO1xyXG59XHJcblxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbk1vZGVsLCBhbmd1bGFyR3JpZCwgZmlsdGVyTWFuYWdlciwgJHNjb3BlKSB7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHRoaXMuY29sdW1uTW9kZWwgPSBjb2x1bW5Nb2RlbDtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZDtcclxuICAgIHRoaXMuZmlsdGVyTWFuYWdlciA9IGZpbHRlck1hbmFnZXI7XHJcbiAgICB0aGlzLiRzY29wZSA9ICRzY29wZTtcclxuXHJcbiAgICB0aGlzLmFsbFJvd3MgPSBudWxsO1xyXG4gICAgdGhpcy5yb3dzQWZ0ZXJHcm91cCA9IG51bGw7XHJcbiAgICB0aGlzLnJvd3NBZnRlckZpbHRlciA9IG51bGw7XHJcbiAgICB0aGlzLnJvd3NBZnRlclNvcnQgPSBudWxsO1xyXG4gICAgdGhpcy5yb3dzQWZ0ZXJNYXAgPSBudWxsO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmNyZWF0ZU1vZGVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB0aGlzLm1vZGVsID0ge1xyXG4gICAgICAgIC8vIHRoaXMgbWV0aG9kIGlzIGltcGxlbWVudGVkIGJ5IHRoZSBpbk1lbW9yeSBtb2RlbCBvbmx5LFxyXG4gICAgICAgIC8vIGl0IGdpdmVzIHRoZSB0b3AgbGV2ZWwgb2YgdGhlIHNlbGVjdGlvbi4gdXNlZCBieSB0aGUgc2VsZWN0aW9uXHJcbiAgICAgICAgLy8gY29udHJvbGxlciwgd2hlbiBpdCBuZWVkcyB0byBkbyBhIGZ1bGwgdHJhdmVyc2FsXHJcbiAgICAgICAgZ2V0VG9wTGV2ZWxOb2RlczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnJvd3NBZnRlckdyb3VwO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VmlydHVhbFJvdzogZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQucm93c0FmdGVyTWFwW2luZGV4XTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFZpcnR1YWxSb3dDb3VudDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGF0LnJvd3NBZnRlck1hcCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoYXQucm93c0FmdGVyTWFwLmxlbmd0aDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuXHJcbi8vIHB1YmxpY1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmdldE1vZGVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbDtcclxufTtcclxuXHJcbi8vIHB1YmxpY1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZU1vZGVsID0gZnVuY3Rpb24oc3RlcCkge1xyXG5cclxuICAgIC8vIGZhbGx0aHJvdWdoIGluIGJlbG93IHN3aXRjaCBpcyBvbiBwdXJwb3NlXHJcbiAgICBzd2l0Y2ggKHN0ZXApIHtcclxuICAgICAgICBjYXNlIGNvbnN0YW50cy5TVEVQX0VWRVJZVEhJTkc6XHJcbiAgICAgICAgICAgIHRoaXMuZG9Hcm91cGluZygpO1xyXG4gICAgICAgIGNhc2UgY29uc3RhbnRzLlNURVBfRklMVEVSOlxyXG4gICAgICAgICAgICB0aGlzLmRvRmlsdGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZG9BZ2dyZWdhdGUoKTtcclxuICAgICAgICBjYXNlIGNvbnN0YW50cy5TVEVQX1NPUlQ6XHJcbiAgICAgICAgICAgIHRoaXMuZG9Tb3J0KCk7XHJcbiAgICAgICAgY2FzZSBjb25zdGFudHMuU1RFUF9NQVA6XHJcbiAgICAgICAgICAgIHRoaXMuZG9Hcm91cE1hcHBpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldE1vZGVsVXBkYXRlZCgpID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0TW9kZWxVcGRhdGVkKCkoKTtcclxuICAgICAgICB2YXIgJHNjb3BlID0gdGhpcy4kc2NvcGU7XHJcbiAgICAgICAgaWYgKCRzY29wZSkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuLy8gcHVibGljIC0gaXQncyBwb3NzaWJsZSB0byByZWNvbXB1dGUgdGhlIGFnZ3JlZ2F0ZSB3aXRob3V0IGRvaW5nIHRoZSBvdGhlciBwYXJ0c1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmRvQWdncmVnYXRlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGdyb3VwQWdnRnVuY3Rpb24gPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcm91cEFnZ0Z1bmN0aW9uKCk7XHJcbiAgICBpZiAodHlwZW9mIGdyb3VwQWdnRnVuY3Rpb24gIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZWN1cnNpdmVseUNyZWF0ZUFnZ0RhdGEodGhpcy5yb3dzQWZ0ZXJGaWx0ZXIsIGdyb3VwQWdnRnVuY3Rpb24pO1xyXG59O1xyXG5cclxuLy8gcHVibGljXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZXhwYW5kT3JDb2xsYXBzZUFsbCA9IGZ1bmN0aW9uKGV4cGFuZCwgcm93Tm9kZXMpIHtcclxuICAgIC8vIGlmIGZpcnN0IGNhbGwgaW4gcmVjdXJzaW9uLCB3ZSBzZXQgbGlzdCB0byBwYXJlbnQgbGlzdFxyXG4gICAgaWYgKHJvd05vZGVzID09PSBudWxsKSB7XHJcbiAgICAgICAgcm93Tm9kZXMgPSB0aGlzLnJvd3NBZnRlckdyb3VwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghcm93Tm9kZXMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgIHJvd05vZGVzLmZvckVhY2goZnVuY3Rpb24obm9kZSkge1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIG5vZGUuZXhwYW5kZWQgPSBleHBhbmQ7XHJcbiAgICAgICAgICAgIF90aGlzLmV4cGFuZE9yQ29sbGFwc2VBbGwoZXhwYW5kLCBub2RlLmNoaWxkcmVuKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5yZWN1cnNpdmVseUNyZWF0ZUFnZ0RhdGEgPSBmdW5jdGlvbihub2RlcywgZ3JvdXBBZ2dGdW5jdGlvbikge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBub2Rlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldO1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIC8vIGFnZyBmdW5jdGlvbiBuZWVkcyB0byBzdGFydCBhdCB0aGUgYm90dG9tLCBzbyB0cmF2ZXJzZSBmaXJzdFxyXG4gICAgICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5Q3JlYXRlQWdnRGF0YShub2RlLmNoaWxkcmVuLCBncm91cEFnZ0Z1bmN0aW9uKTtcclxuICAgICAgICAgICAgLy8gYWZ0ZXIgdHJhdmVyc2FsLCB3ZSBjYW4gbm93IGRvIHRoZSBhZ2cgYXQgdGhpcyBsZXZlbFxyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IGdyb3VwQWdnRnVuY3Rpb24obm9kZS5jaGlsZHJlbik7XHJcbiAgICAgICAgICAgIG5vZGUuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgICAgIC8vIGlmIHdlIGFyZSBncm91cGluZywgdGhlbiBpdCdzIHBvc3NpYmxlIHRoZXJlIGlzIGEgc2libGluZyBmb290ZXJcclxuICAgICAgICAgICAgLy8gdG8gdGhlIGdyb3VwLCBzbyB1cGRhdGUgdGhlIGRhdGEgaGVyZSBhbHNvIGlmIHRoZXJzIGlzIG9uZVxyXG4gICAgICAgICAgICBpZiAobm9kZS5zaWJsaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLnNpYmxpbmcuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZG9Tb3J0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL3NlZSBpZiB0aGVyZSBpcyBhIGNvbCB3ZSBhcmUgc29ydGluZyBieVxyXG4gICAgdmFyIGNvbHVtbkZvclNvcnRpbmcgPSBudWxsO1xyXG4gICAgdGhpcy5jb2x1bW5Nb2RlbC5nZXRBbGxDb2x1bW5zKCkuZm9yRWFjaChmdW5jdGlvbihjb2xEZWZXcmFwcGVyKSB7XHJcbiAgICAgICAgaWYgKGNvbERlZldyYXBwZXIuc29ydCkge1xyXG4gICAgICAgICAgICBjb2x1bW5Gb3JTb3J0aW5nID0gY29sRGVmV3JhcHBlcjtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgcm93Tm9kZXNCZWZvcmVTb3J0ID0gdGhpcy5yb3dzQWZ0ZXJGaWx0ZXIuc2xpY2UoMCk7XHJcblxyXG4gICAgaWYgKGNvbHVtbkZvclNvcnRpbmcpIHtcclxuICAgICAgICB2YXIgYXNjZW5kaW5nID0gY29sdW1uRm9yU29ydGluZy5zb3J0ID09PSBjb25zdGFudHMuQVNDO1xyXG4gICAgICAgIHZhciBpbnZlcnRlciA9IGFzY2VuZGluZyA/IDEgOiAtMTtcclxuXHJcbiAgICAgICAgdGhpcy5zb3J0TGlzdChyb3dOb2Rlc0JlZm9yZVNvcnQsIGNvbHVtbkZvclNvcnRpbmcuY29sRGVmLCBpbnZlcnRlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vaWYgbm8gc29ydGluZywgc2V0IGFsbCBncm91cCBjaGlsZHJlbiBhZnRlciBzb3J0IHRvIHRoZSBvcmlnaW5hbCBsaXN0XHJcbiAgICAgICAgdGhpcy5yZXNldFNvcnRJbkdyb3Vwcyhyb3dOb2Rlc0JlZm9yZVNvcnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucm93c0FmdGVyU29ydCA9IHJvd05vZGVzQmVmb3JlU29ydDtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5yZXNldFNvcnRJbkdyb3VwcyA9IGZ1bmN0aW9uKHJvd05vZGVzKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHJvd05vZGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHZhciBpdGVtID0gcm93Tm9kZXNbaV07XHJcbiAgICAgICAgaWYgKGl0ZW0uZ3JvdXAgJiYgaXRlbS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICBpdGVtLmNoaWxkcmVuQWZ0ZXJTb3J0ID0gaXRlbS5jaGlsZHJlbjtcclxuICAgICAgICAgICAgdGhpcy5yZXNldFNvcnRJbkdyb3VwcyhpdGVtLmNoaWxkcmVuKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuc29ydExpc3QgPSBmdW5jdGlvbihub2RlcywgY29sdW1uRm9yU29ydGluZywgaW52ZXJ0ZXIpIHtcclxuXHJcbiAgICAvLyBzb3J0IGFueSBncm91cHMgcmVjdXJzaXZlbHlcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbm9kZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IC8vIGNyaXRpY2FsIHNlY3Rpb24sIG5vIGZ1bmN0aW9uYWwgcHJvZ3JhbW1pbmdcclxuICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldO1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgbm9kZS5jaGlsZHJlbkFmdGVyU29ydCA9IG5vZGUuY2hpbGRyZW4uc2xpY2UoMCk7XHJcbiAgICAgICAgICAgIHRoaXMuc29ydExpc3Qobm9kZS5jaGlsZHJlbkFmdGVyU29ydCwgY29sdW1uRm9yU29ydGluZywgaW52ZXJ0ZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBub2Rlcy5zb3J0KGZ1bmN0aW9uKG9iakEsIG9iakIpIHtcclxuICAgICAgICB2YXIga2V5Rm9yU29ydCA9IGNvbHVtbkZvclNvcnRpbmcuZmllbGQ7XHJcbiAgICAgICAgdmFyIHZhbHVlQSA9IG9iakEuZGF0YSA/IG9iakEuZGF0YVtrZXlGb3JTb3J0XSA6IG51bGw7XHJcbiAgICAgICAgdmFyIHZhbHVlQiA9IG9iakIuZGF0YSA/IG9iakIuZGF0YVtrZXlGb3JTb3J0XSA6IG51bGw7XHJcblxyXG4gICAgICAgIGlmIChjb2x1bW5Gb3JTb3J0aW5nLmNvbXBhcmF0b3IpIHtcclxuICAgICAgICAgICAgLy9pZiBjb21wYXJhdG9yIHByb3ZpZGVkLCB1c2UgaXRcclxuICAgICAgICAgICAgcmV0dXJuIGNvbHVtbkZvclNvcnRpbmcuY29tcGFyYXRvcih2YWx1ZUEsIHZhbHVlQikgKiBpbnZlcnRlcjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvL290aGVyd2lzZSBkbyBvdXIgb3duIGNvbXBhcmlzb25cclxuICAgICAgICAgICAgcmV0dXJuIHV0aWxzLmRlZmF1bHRDb21wYXJhdG9yKHZhbHVlQSwgdmFsdWVCKSAqIGludmVydGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5kb0dyb3VwaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcm93c0FmdGVyR3JvdXA7XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb0ludGVybmFsR3JvdXBpbmcoKSkge1xyXG4gICAgICAgIHZhciBleHBhbmRCeURlZmF1bHQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcm91cERlZmF1bHRFeHBhbmRlZCgpO1xyXG4gICAgICAgIHJvd3NBZnRlckdyb3VwID0gZ3JvdXBDcmVhdG9yLmdyb3VwKHRoaXMuYWxsUm93cywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0R3JvdXBLZXlzKCksXHJcbiAgICAgICAgICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEdyb3VwQWdnRnVuY3Rpb24oKSwgZXhwYW5kQnlEZWZhdWx0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcm93c0FmdGVyR3JvdXAgPSB0aGlzLmFsbFJvd3M7XHJcbiAgICB9XHJcbiAgICB0aGlzLnJvd3NBZnRlckdyb3VwID0gcm93c0FmdGVyR3JvdXA7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBxdWlja0ZpbHRlclByZXNlbnQgPSB0aGlzLmFuZ3VsYXJHcmlkLmdldFF1aWNrRmlsdGVyKCkgIT09IG51bGw7XHJcbiAgICB2YXIgYWR2YW5jZWRGaWx0ZXJQcmVzZW50ID0gdGhpcy5maWx0ZXJNYW5hZ2VyLmlzRmlsdGVyUHJlc2VudCgpO1xyXG4gICAgdmFyIGZpbHRlclByZXNlbnQgPSBxdWlja0ZpbHRlclByZXNlbnQgfHwgYWR2YW5jZWRGaWx0ZXJQcmVzZW50O1xyXG5cclxuICAgIHZhciByb3dzQWZ0ZXJGaWx0ZXI7XHJcbiAgICBpZiAoZmlsdGVyUHJlc2VudCkge1xyXG4gICAgICAgIHJvd3NBZnRlckZpbHRlciA9IHRoaXMuZmlsdGVySXRlbXModGhpcy5yb3dzQWZ0ZXJHcm91cCwgcXVpY2tGaWx0ZXJQcmVzZW50LCBhZHZhbmNlZEZpbHRlclByZXNlbnQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByb3dzQWZ0ZXJGaWx0ZXIgPSB0aGlzLnJvd3NBZnRlckdyb3VwO1xyXG4gICAgfVxyXG4gICAgdGhpcy5yb3dzQWZ0ZXJGaWx0ZXIgPSByb3dzQWZ0ZXJGaWx0ZXI7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZmlsdGVySXRlbXMgPSBmdW5jdGlvbihyb3dOb2RlcywgcXVpY2tGaWx0ZXJQcmVzZW50LCBhZHZhbmNlZEZpbHRlclByZXNlbnQpIHtcclxuICAgIHZhciByZXN1bHQgPSBbXTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHJvd05vZGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gcm93Tm9kZXNbaV07XHJcblxyXG4gICAgICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIC8vIGRlYWwgd2l0aCBncm91cFxyXG4gICAgICAgICAgICB2YXIgZmlsdGVyZWRDaGlsZHJlbiA9IHRoaXMuZmlsdGVySXRlbXMobm9kZS5jaGlsZHJlbiwgcXVpY2tGaWx0ZXJQcmVzZW50LCBhZHZhbmNlZEZpbHRlclByZXNlbnQpO1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVyZWRDaGlsZHJlbi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYWxsQ2hpbGRyZW5Db3VudCA9IHRoaXMuZ2V0VG90YWxDaGlsZENvdW50KGZpbHRlcmVkQ2hpbGRyZW4pO1xyXG4gICAgICAgICAgICAgICAgdmFyIG5ld0dyb3VwID0gdGhpcy5jb3B5R3JvdXBOb2RlKG5vZGUsIGZpbHRlcmVkQ2hpbGRyZW4sIGFsbENoaWxkcmVuQ291bnQpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ld0dyb3VwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRvZXNSb3dQYXNzRmlsdGVyKG5vZGUsIHF1aWNrRmlsdGVyUHJlc2VudCwgYWR2YW5jZWRGaWx0ZXJQcmVzZW50KSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuLy8gcm93czogdGhlIHJvd3MgdG8gcHV0IGludG8gdGhlIG1vZGVsXHJcbi8vIGZpcnN0SWQ6IHRoZSBmaXJzdCBpZCB0byB1c2UsIHVzZWQgZm9yIHBhZ2luZywgd2hlcmUgd2UgYXJlIG5vdCBvbiB0aGUgZmlyc3QgcGFnZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnNldEFsbFJvd3MgPSBmdW5jdGlvbihyb3dzLCBmaXJzdElkKSB7XHJcbiAgICB2YXIgbm9kZXM7XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNSb3dzQWxyZWFkeUdyb3VwZWQoKSkge1xyXG4gICAgICAgIG5vZGVzID0gcm93cztcclxuICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5Q2hlY2tVc2VyUHJvdmlkZWROb2Rlcyhub2RlcywgbnVsbCwgMCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIHBsYWNlIGVhY2ggcm93IGludG8gYSB3cmFwcGVyXHJcbiAgICAgICAgdmFyIG5vZGVzID0gW107XHJcbiAgICAgICAgaWYgKHJvd3MpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgaSsrKSB7IC8vIGNvdWxkIGJlIGxvdHMgb2Ygcm93cywgZG9uJ3QgdXNlIGZ1bmN0aW9uYWwgcHJvZ3JhbW1pbmdcclxuICAgICAgICAgICAgICAgIG5vZGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHJvd3NbaV1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGZpcnN0SWQgcHJvdmlkZWQsIHVzZSBpdCwgb3RoZXJ3aXNlIHN0YXJ0IGF0IDBcclxuICAgIHZhciBmaXJzdElkVG9Vc2UgPSBmaXJzdElkID8gZmlyc3RJZCA6IDA7XHJcbiAgICB0aGlzLnJlY3Vyc2l2ZWx5QWRkSWRUb05vZGVzKG5vZGVzLCBmaXJzdElkVG9Vc2UpO1xyXG4gICAgdGhpcy5hbGxSb3dzID0gbm9kZXM7XHJcbn07XHJcblxyXG4vLyBhZGQgaW4gaW5kZXggLSB0aGlzIGlzIHVzZWQgYnkgdGhlIHNlbGVjdGlvbkNvbnRyb2xsZXIgLSBzbyBxdWlja1xyXG4vLyB0byBsb29rIHVwIHNlbGVjdGVkIHJvd3NcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5yZWN1cnNpdmVseUFkZElkVG9Ob2RlcyA9IGZ1bmN0aW9uKG5vZGVzLCBpbmRleCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgbm9kZS5pZCA9IGluZGV4Kys7XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXAgJiYgbm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICBpbmRleCA9IHRoaXMucmVjdXJzaXZlbHlBZGRJZFRvTm9kZXMobm9kZS5jaGlsZHJlbiwgaW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBpbmRleDtcclxufTtcclxuXHJcbi8vIGFkZCBpbiBpbmRleCAtIHRoaXMgaXMgdXNlZCBieSB0aGUgc2VsZWN0aW9uQ29udHJvbGxlciAtIHNvIHF1aWNrXHJcbi8vIHRvIGxvb2sgdXAgc2VsZWN0ZWQgcm93c1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnJlY3Vyc2l2ZWx5Q2hlY2tVc2VyUHJvdmlkZWROb2RlcyA9IGZ1bmN0aW9uKG5vZGVzLCBwYXJlbnQsIGxldmVsKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgICAgIG5vZGUucGFyZW50ID0gcGFyZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBub2RlLmxldmVsID0gbGV2ZWw7XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXAgJiYgbm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5Q2hlY2tVc2VyUHJvdmlkZWROb2Rlcyhub2RlLmNoaWxkcmVuLCBub2RlLCBsZXZlbCArIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5nZXRUb3RhbENoaWxkQ291bnQgPSBmdW5jdGlvbihyb3dOb2Rlcykge1xyXG4gICAgdmFyIGNvdW50ID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gcm93Tm9kZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGl0ZW0gPSByb3dOb2Rlc1tpXTtcclxuICAgICAgICBpZiAoaXRlbS5ncm91cCkge1xyXG4gICAgICAgICAgICBjb3VudCArPSBpdGVtLmFsbENoaWxkcmVuQ291bnQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY291bnQ7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuY29weUdyb3VwTm9kZSA9IGZ1bmN0aW9uKGdyb3VwTm9kZSwgY2hpbGRyZW4sIGFsbENoaWxkcmVuQ291bnQpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ3JvdXA6IHRydWUsXHJcbiAgICAgICAgZGF0YTogZ3JvdXBOb2RlLmRhdGEsXHJcbiAgICAgICAgZmllbGQ6IGdyb3VwTm9kZS5maWVsZCxcclxuICAgICAgICBrZXk6IGdyb3VwTm9kZS5rZXksXHJcbiAgICAgICAgZXhwYW5kZWQ6IGdyb3VwTm9kZS5leHBhbmRlZCxcclxuICAgICAgICBjaGlsZHJlbjogY2hpbGRyZW4sXHJcbiAgICAgICAgYWxsQ2hpbGRyZW5Db3VudDogYWxsQ2hpbGRyZW5Db3VudCxcclxuICAgICAgICBsZXZlbDogZ3JvdXBOb2RlLmxldmVsXHJcbiAgICB9O1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmRvR3JvdXBNYXBwaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBldmVuIGlmIG5vdCBnb2luZyBncm91cGluZywgd2UgZG8gdGhlIG1hcHBpbmcsIGFzIHRoZSBjbGllbnQgbWlnaHRcclxuICAgIC8vIG9mIHBhc3NlZCBpbiBkYXRhIHRoYXQgYWxyZWFkeSBoYXMgYSBncm91cGluZyBpbiBpdCBzb21ld2hlcmVcclxuICAgIHZhciByb3dzQWZ0ZXJNYXAgPSBbXTtcclxuICAgIHRoaXMuYWRkVG9NYXAocm93c0FmdGVyTWFwLCB0aGlzLnJvd3NBZnRlclNvcnQpO1xyXG4gICAgdGhpcy5yb3dzQWZ0ZXJNYXAgPSByb3dzQWZ0ZXJNYXA7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuYWRkVG9NYXAgPSBmdW5jdGlvbihtYXBwZWREYXRhLCBvcmlnaW5hbE5vZGVzKSB7XHJcbiAgICBpZiAoIW9yaWdpbmFsTm9kZXMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9yaWdpbmFsTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IG9yaWdpbmFsTm9kZXNbaV07XHJcbiAgICAgICAgbWFwcGVkRGF0YS5wdXNoKG5vZGUpO1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuZXhwYW5kZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRUb01hcChtYXBwZWREYXRhLCBub2RlLmNoaWxkcmVuQWZ0ZXJTb3J0KTtcclxuXHJcbiAgICAgICAgICAgIC8vIHB1dCBhIGZvb3RlciBpbiBpZiB1c2VyIGlzIGxvb2tpbmcgZm9yIGl0XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwSW5jbHVkZUZvb3RlcigpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZm9vdGVyTm9kZSA9IHRoaXMuY3JlYXRlRm9vdGVyTm9kZShub2RlKTtcclxuICAgICAgICAgICAgICAgIG1hcHBlZERhdGEucHVzaChmb290ZXJOb2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5jcmVhdGVGb290ZXJOb2RlID0gZnVuY3Rpb24oZ3JvdXBOb2RlKSB7XHJcbiAgICB2YXIgZm9vdGVyTm9kZSA9IHt9O1xyXG4gICAgT2JqZWN0LmtleXMoZ3JvdXBOb2RlKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIGZvb3Rlck5vZGVba2V5XSA9IGdyb3VwTm9kZVtrZXldO1xyXG4gICAgfSk7XHJcbiAgICBmb290ZXJOb2RlLmZvb3RlciA9IHRydWU7XHJcbiAgICAvLyBnZXQgYm90aCBoZWFkZXIgYW5kIGZvb3RlciB0byByZWZlcmVuY2UgZWFjaCBvdGhlciBhcyBzaWJsaW5ncy4gdGhpcyBpcyBuZXZlciB1bmRvbmUsXHJcbiAgICAvLyBvbmx5IG92ZXJ3cml0dGVuLiBzbyBpZiBhIGdyb3VwIGlzIGV4cGFuZGVkLCB0aGVuIGNvbnRyYWN0ZWQsIGl0IHdpbGwgaGF2ZSBhIGdob3N0XHJcbiAgICAvLyBzaWJsaW5nIC0gYnV0IHRoYXQncyBmaW5lLCBhcyB3ZSBjYW4gaWdub3JlIHRoaXMgaWYgdGhlIGhlYWRlciBpcyBjb250cmFjdGVkLlxyXG4gICAgZm9vdGVyTm9kZS5zaWJsaW5nID0gZ3JvdXBOb2RlO1xyXG4gICAgZ3JvdXBOb2RlLnNpYmxpbmcgPSBmb290ZXJOb2RlO1xyXG4gICAgcmV0dXJuIGZvb3Rlck5vZGU7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZG9lc1Jvd1Bhc3NGaWx0ZXIgPSBmdW5jdGlvbihub2RlLCBxdWlja0ZpbHRlclByZXNlbnQsIGFkdmFuY2VkRmlsdGVyUHJlc2VudCkge1xyXG4gICAgLy9maXJzdCB1cCwgY2hlY2sgcXVpY2sgZmlsdGVyXHJcbiAgICBpZiAocXVpY2tGaWx0ZXJQcmVzZW50KSB7XHJcbiAgICAgICAgaWYgKCFub2RlLnF1aWNrRmlsdGVyQWdncmVnYXRlVGV4dCkge1xyXG4gICAgICAgICAgICB0aGlzLmFnZ3JlZ2F0ZVJvd0ZvclF1aWNrRmlsdGVyKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobm9kZS5xdWlja0ZpbHRlckFnZ3JlZ2F0ZVRleHQuaW5kZXhPZih0aGlzLmFuZ3VsYXJHcmlkLmdldFF1aWNrRmlsdGVyKCkpIDwgMCkge1xyXG4gICAgICAgICAgICAvL3F1aWNrIGZpbHRlciBmYWlscywgc28gc2tpcCBpdGVtXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy9zZWNvbmQsIGNoZWNrIGFkdmFuY2VkIGZpbHRlclxyXG4gICAgaWYgKGFkdmFuY2VkRmlsdGVyUHJlc2VudCkge1xyXG4gICAgICAgIGlmICghdGhpcy5maWx0ZXJNYW5hZ2VyLmRvZXNGaWx0ZXJQYXNzKG5vZGUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy9nb3QgdGhpcyBmYXIsIGFsbCBmaWx0ZXJzIHBhc3NcclxuICAgIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmFnZ3JlZ2F0ZVJvd0ZvclF1aWNrRmlsdGVyID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIGFnZ3JlZ2F0ZWRUZXh0ID0gJyc7XHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsLmdldEFsbENvbHVtbnMoKS5mb3JFYWNoKGZ1bmN0aW9uKGNvbERlZldyYXBwZXIpIHtcclxuICAgICAgICB2YXIgZGF0YSA9IG5vZGUuZGF0YTtcclxuICAgICAgICB2YXIgdmFsdWUgPSBkYXRhID8gZGF0YVtjb2xEZWZXcmFwcGVyLmNvbERlZi5maWVsZF0gOiBudWxsO1xyXG4gICAgICAgIGlmICh2YWx1ZSAmJiB2YWx1ZSAhPT0gJycpIHtcclxuICAgICAgICAgICAgYWdncmVnYXRlZFRleHQgPSBhZ2dyZWdhdGVkVGV4dCArIHZhbHVlLnRvU3RyaW5nKCkudG9VcHBlckNhc2UoKSArIFwiX1wiO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgbm9kZS5xdWlja0ZpbHRlckFnZ3JlZ2F0ZVRleHQgPSBhZ2dyZWdhdGVkVGV4dDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSW5NZW1vcnlSb3dDb250cm9sbGVyO1xyXG4iLCJ2YXIgVEVNUExBVEUgPSBbXHJcbiAgICAnPHNwYW4gaWQ9XCJwYWdlUm93U3VtbWFyeVBhbmVsXCIgY2xhc3M9XCJhZy1wYWdpbmctcm93LXN1bW1hcnktcGFuZWxcIj4nLFxyXG4gICAgJzxzcGFuIGlkPVwiZmlyc3RSb3dPblBhZ2VcIj48L3NwYW4+JyxcclxuICAgICcgdG8gJyxcclxuICAgICc8c3BhbiBpZD1cImxhc3RSb3dPblBhZ2VcIj48L3NwYW4+JyxcclxuICAgICcgb2YgJyxcclxuICAgICc8c3BhbiBpZD1cInJlY29yZENvdW50XCI+PC9zcGFuPicsXHJcbiAgICAnPC9zcGFuPicsXHJcbiAgICAnPHNwYW4gY2xhcz1cImFnLXBhZ2luZy1wYWdlLXN1bW1hcnktcGFuZWxcIj4nLFxyXG4gICAgJzxidXR0b24gY2xhc3M9XCJhZy1wYWdpbmctYnV0dG9uXCIgaWQ9XCJidEZpcnN0XCI+Rmlyc3Q8L2J1dHRvbj4nLFxyXG4gICAgJzxidXR0b24gY2xhc3M9XCJhZy1wYWdpbmctYnV0dG9uXCIgaWQ9XCJidFByZXZpb3VzXCI+UHJldmlvdXM8L2J1dHRvbj4nLFxyXG4gICAgJyBQYWdlICcsXHJcbiAgICAnPHNwYW4gaWQ9XCJjdXJyZW50XCI+PC9zcGFuPicsXHJcbiAgICAnIG9mICcsXHJcbiAgICAnPHNwYW4gaWQ9XCJ0b3RhbFwiPjwvc3Bhbj4nLFxyXG4gICAgJzxidXR0b24gY2xhc3M9XCJhZy1wYWdpbmctYnV0dG9uXCIgaWQ9XCJidE5leHRcIj5OZXh0PC9idXR0b24+JyxcclxuICAgICc8YnV0dG9uIGNsYXNzPVwiYWctcGFnaW5nLWJ1dHRvblwiIGlkPVwiYnRMYXN0XCI+TGFzdDwvYnV0dG9uPicsXHJcbiAgICAnPC9zcGFuPidcclxuXS5qb2luKCcnKTtcclxuXHJcbmZ1bmN0aW9uIFBhZ2luYXRpb25Db250cm9sbGVyKCkge31cclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oZVBhZ2luZ1BhbmVsLCBhbmd1bGFyR3JpZCkge1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkO1xyXG4gICAgdGhpcy5wb3B1bGF0ZVBhbmVsKGVQYWdpbmdQYW5lbCk7XHJcbiAgICB0aGlzLmNhbGxWZXJzaW9uID0gMDtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5zZXREYXRhc291cmNlID0gZnVuY3Rpb24oZGF0YXNvdXJjZSkge1xyXG4gICAgdGhpcy5kYXRhc291cmNlID0gZGF0YXNvdXJjZTtcclxuXHJcbiAgICBpZiAoIWRhdGFzb3VyY2UpIHtcclxuICAgICAgICAvLyBvbmx5IGNvbnRpbnVlIGlmIHdlIGhhdmUgYSB2YWxpZCBkYXRhc291cmNlIHRvIHdvcmsgd2l0aFxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlc2V0KCk7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGNvcHkgcGFnZVNpemUsIHRvIGd1YXJkIGFnYWluc3QgaXQgY2hhbmdpbmcgdGhlIHRoZSBkYXRhc291cmNlIGJldHdlZW4gY2FsbHNcclxuICAgIHRoaXMucGFnZVNpemUgPSB0aGlzLmRhdGFzb3VyY2UucGFnZVNpemU7XHJcbiAgICAvLyBzZWUgaWYgd2Uga25vdyB0aGUgdG90YWwgbnVtYmVyIG9mIHBhZ2VzLCBvciBpZiBpdCdzICd0byBiZSBkZWNpZGVkJ1xyXG4gICAgaWYgKHRoaXMuZGF0YXNvdXJjZS5yb3dDb3VudCA+PSAwKSB7XHJcbiAgICAgICAgdGhpcy5yb3dDb3VudCA9IHRoaXMuZGF0YXNvdXJjZS5yb3dDb3VudDtcclxuICAgICAgICB0aGlzLmZvdW5kTWF4Um93ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsUGFnZXMoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5yb3dDb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5mb3VuZE1heFJvdyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudG90YWxQYWdlcyA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jdXJyZW50UGFnZSA9IDA7XHJcblxyXG4gICAgLy8gaGlkZSB0aGUgc3VtbWFyeSBwYW5lbCB1bnRpbCBzb21ldGhpbmcgaXMgbG9hZGVkXHJcbiAgICB0aGlzLmVQYWdlUm93U3VtbWFyeVBhbmVsLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcclxuXHJcbiAgICB0aGlzLnNldFRvdGFsTGFiZWxzKCk7XHJcbiAgICB0aGlzLmxvYWRQYWdlKCk7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuc2V0VG90YWxMYWJlbHMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLmZvdW5kTWF4Um93KSB7XHJcbiAgICAgICAgdGhpcy5sYlRvdGFsLmlubmVySFRNTCA9IHRoaXMudG90YWxQYWdlcy50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICAgIHRoaXMubGJSZWNvcmRDb3VudC5pbm5lckhUTUwgPSB0aGlzLnJvd0NvdW50LnRvTG9jYWxlU3RyaW5nKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubGJUb3RhbC5pbm5lckhUTUwgPSAnbW9yZSc7XHJcbiAgICAgICAgdGhpcy5sYlJlY29yZENvdW50LmlubmVySFRNTCA9ICdtb3JlJztcclxuICAgIH1cclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5jYWxjdWxhdGVUb3RhbFBhZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnRvdGFsUGFnZXMgPSBNYXRoLmZsb29yKCh0aGlzLnJvd0NvdW50IC0gMSkgLyB0aGlzLnBhZ2VTaXplKSArIDE7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucGFnZUxvYWRlZCA9IGZ1bmN0aW9uKHJvd3MsIGxhc3RSb3dJbmRleCkge1xyXG4gICAgdmFyIGZpcnN0SWQgPSB0aGlzLmN1cnJlbnRQYWdlICogdGhpcy5wYWdlU2l6ZTtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQuc2V0Um93cyhyb3dzLCBmaXJzdElkKTtcclxuICAgIC8vIHNlZSBpZiB3ZSBoaXQgdGhlIGxhc3Qgcm93XHJcbiAgICBpZiAoIXRoaXMuZm91bmRNYXhSb3cgJiYgdHlwZW9mIGxhc3RSb3dJbmRleCA9PT0gJ251bWJlcicgJiYgbGFzdFJvd0luZGV4ID49IDApIHtcclxuICAgICAgICB0aGlzLmZvdW5kTWF4Um93ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnJvd0NvdW50ID0gbGFzdFJvd0luZGV4O1xyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlVG90YWxQYWdlcygpO1xyXG4gICAgICAgIHRoaXMuc2V0VG90YWxMYWJlbHMoKTtcclxuXHJcbiAgICAgICAgLy8gaWYgb3ZlcnNob3QgcGFnZXMsIGdvIGJhY2tcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50UGFnZSA+IHRoaXMudG90YWxQYWdlcykge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gdGhpcy50b3RhbFBhZ2VzIC0gMTtcclxuICAgICAgICAgICAgdGhpcy5sb2FkUGFnZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuZW5hYmxlT3JEaXNhYmxlQnV0dG9ucygpO1xyXG4gICAgdGhpcy51cGRhdGVSb3dMYWJlbHMoKTtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVSb3dMYWJlbHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzdGFydFJvdyA9ICh0aGlzLnBhZ2VTaXplICogdGhpcy5jdXJyZW50UGFnZSkgKyAxO1xyXG4gICAgdmFyIGVuZFJvdyA9IHN0YXJ0Um93ICsgdGhpcy5wYWdlU2l6ZSAtIDE7XHJcbiAgICBpZiAodGhpcy5mb3VuZE1heFJvdyAmJiBlbmRSb3cgPiB0aGlzLnJvd0NvdW50KSB7XHJcbiAgICAgICAgZW5kUm93ID0gdGhpcy5yb3dDb3VudDtcclxuICAgIH1cclxuICAgIHRoaXMubGJGaXJzdFJvd09uUGFnZS5pbm5lckhUTUwgPSAoc3RhcnRSb3cpLnRvTG9jYWxlU3RyaW5nKCk7XHJcbiAgICB0aGlzLmxiTGFzdFJvd09uUGFnZS5pbm5lckhUTUwgPSAoZW5kUm93KS50b0xvY2FsZVN0cmluZygpO1xyXG5cclxuICAgIC8vIHNob3cgdGhlIHN1bW1hcnkgcGFuZWwsIHdoZW4gZmlyc3Qgc2hvd24sIHRoaXMgaXMgYmxhbmtcclxuICAgIHRoaXMuZVBhZ2VSb3dTdW1tYXJ5UGFuZWwuc3R5bGUudmlzaWJpbGl0eSA9IG51bGw7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUubG9hZFBhZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZW5hYmxlT3JEaXNhYmxlQnV0dG9ucygpO1xyXG4gICAgdmFyIHN0YXJ0Um93ID0gdGhpcy5jdXJyZW50UGFnZSAqIHRoaXMuZGF0YXNvdXJjZS5wYWdlU2l6ZTtcclxuICAgIHZhciBlbmRSb3cgPSAodGhpcy5jdXJyZW50UGFnZSArIDEpICogdGhpcy5kYXRhc291cmNlLnBhZ2VTaXplO1xyXG5cclxuICAgIHRoaXMubGJDdXJyZW50LmlubmVySFRNTCA9ICh0aGlzLmN1cnJlbnRQYWdlICsgMSkudG9Mb2NhbGVTdHJpbmcoKTtcclxuXHJcbiAgICB0aGlzLmNhbGxWZXJzaW9uKys7XHJcbiAgICB2YXIgY2FsbFZlcnNpb25Db3B5ID0gdGhpcy5jYWxsVmVyc2lvbjtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHRoaXMuYW5ndWxhckdyaWQuc2hvd0xvYWRpbmdQYW5lbCh0cnVlKTtcclxuICAgIHRoaXMuZGF0YXNvdXJjZS5nZXRSb3dzKHN0YXJ0Um93LCBlbmRSb3csXHJcbiAgICAgICAgZnVuY3Rpb24gc3VjY2Vzcyhyb3dzLCBsYXN0Um93SW5kZXgpIHtcclxuICAgICAgICAgICAgaWYgKHRoYXQuaXNDYWxsRGFlbW9uKGNhbGxWZXJzaW9uQ29weSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGF0LnBhZ2VMb2FkZWQocm93cywgbGFzdFJvd0luZGV4KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZ1bmN0aW9uIGZhaWwoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGF0LmlzQ2FsbERhZW1vbihjYWxsVmVyc2lvbkNvcHkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gc2V0IGluIGFuIGVtcHR5IHNldCBvZiByb3dzLCB0aGlzIHdpbGwgYXRcclxuICAgICAgICAgICAgLy8gbGVhc3QgZ2V0IHJpZCBvZiB0aGUgbG9hZGluZyBwYW5lbCwgYW5kXHJcbiAgICAgICAgICAgIC8vIHN0b3AgYmxvY2tpbmcgdGhpbmdzXHJcbiAgICAgICAgICAgIHRoYXQuYW5ndWxhckdyaWQuc2V0Um93cyhbXSk7XHJcbiAgICAgICAgfVxyXG4gICAgKTtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5pc0NhbGxEYWVtb24gPSBmdW5jdGlvbih2ZXJzaW9uQ29weSkge1xyXG4gICAgcmV0dXJuIHZlcnNpb25Db3B5ICE9PSB0aGlzLmNhbGxWZXJzaW9uO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLm9uQnROZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRQYWdlKys7XHJcbiAgICB0aGlzLmxvYWRQYWdlKCk7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUub25CdFByZXZpb3VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRQYWdlLS07XHJcbiAgICB0aGlzLmxvYWRQYWdlKCk7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUub25CdEZpcnN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRQYWdlID0gMDtcclxuICAgIHRoaXMubG9hZFBhZ2UoKTtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5vbkJ0TGFzdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdXJyZW50UGFnZSA9IHRoaXMudG90YWxQYWdlcyAtIDE7XHJcbiAgICB0aGlzLmxvYWRQYWdlKCk7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZW5hYmxlT3JEaXNhYmxlQnV0dG9ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGRpc2FibGVQcmV2aW91c0FuZEZpcnN0ID0gdGhpcy5jdXJyZW50UGFnZSA9PT0gMDtcclxuICAgIHRoaXMuYnRQcmV2aW91cy5kaXNhYmxlZCA9IGRpc2FibGVQcmV2aW91c0FuZEZpcnN0O1xyXG4gICAgdGhpcy5idEZpcnN0LmRpc2FibGVkID0gZGlzYWJsZVByZXZpb3VzQW5kRmlyc3Q7XHJcblxyXG4gICAgdmFyIGRpc2FibGVOZXh0ID0gdGhpcy5mb3VuZE1heFJvdyAmJiB0aGlzLmN1cnJlbnRQYWdlID09PSAodGhpcy50b3RhbFBhZ2VzIC0gMSk7XHJcbiAgICB0aGlzLmJ0TmV4dC5kaXNhYmxlZCA9IGRpc2FibGVOZXh0O1xyXG5cclxuICAgIHZhciBkaXNhYmxlTGFzdCA9ICF0aGlzLmZvdW5kTWF4Um93IHx8IHRoaXMuY3VycmVudFBhZ2UgPT09ICh0aGlzLnRvdGFsUGFnZXMgLSAxKTtcclxuICAgIHRoaXMuYnRMYXN0LmRpc2FibGVkID0gZGlzYWJsZUxhc3Q7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucG9wdWxhdGVQYW5lbCA9IGZ1bmN0aW9uKGVQYWdpbmdQYW5lbCkge1xyXG5cclxuICAgIGVQYWdpbmdQYW5lbC5pbm5lckhUTUwgPSBURU1QTEFURTtcclxuXHJcbiAgICB0aGlzLmJ0TmV4dCA9IGVQYWdpbmdQYW5lbC5xdWVyeVNlbGVjdG9yKCcjYnROZXh0Jyk7XHJcbiAgICB0aGlzLmJ0UHJldmlvdXMgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI2J0UHJldmlvdXMnKTtcclxuICAgIHRoaXMuYnRGaXJzdCA9IGVQYWdpbmdQYW5lbC5xdWVyeVNlbGVjdG9yKCcjYnRGaXJzdCcpO1xyXG4gICAgdGhpcy5idExhc3QgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI2J0TGFzdCcpO1xyXG4gICAgdGhpcy5sYkN1cnJlbnQgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI2N1cnJlbnQnKTtcclxuICAgIHRoaXMubGJUb3RhbCA9IGVQYWdpbmdQYW5lbC5xdWVyeVNlbGVjdG9yKCcjdG90YWwnKTtcclxuXHJcbiAgICB0aGlzLmxiUmVjb3JkQ291bnQgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI3JlY29yZENvdW50Jyk7XHJcbiAgICB0aGlzLmxiRmlyc3RSb3dPblBhZ2UgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI2ZpcnN0Um93T25QYWdlJyk7XHJcbiAgICB0aGlzLmxiTGFzdFJvd09uUGFnZSA9IGVQYWdpbmdQYW5lbC5xdWVyeVNlbGVjdG9yKCcjbGFzdFJvd09uUGFnZScpO1xyXG4gICAgdGhpcy5lUGFnZVJvd1N1bW1hcnlQYW5lbCA9IGVQYWdpbmdQYW5lbC5xdWVyeVNlbGVjdG9yKCcjcGFnZVJvd1N1bW1hcnlQYW5lbCcpO1xyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICB0aGlzLmJ0TmV4dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQub25CdE5leHQoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYnRQcmV2aW91cy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQub25CdFByZXZpb3VzKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmJ0Rmlyc3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGF0Lm9uQnRGaXJzdCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5idExhc3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGF0Lm9uQnRMYXN0KCk7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGFnaW5hdGlvbkNvbnRyb2xsZXI7XHJcbiIsInZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xyXG52YXIgU3ZnRmFjdG9yeSA9IHJlcXVpcmUoJy4vc3ZnRmFjdG9yeScpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcblxyXG52YXIgc3ZnRmFjdG9yeSA9IG5ldyBTdmdGYWN0b3J5KCk7XHJcblxyXG52YXIgVEFCX0tFWSA9IDk7XHJcbnZhciBFTlRFUl9LRVkgPSAxMztcclxuXHJcbmZ1bmN0aW9uIFJvd1JlbmRlcmVyKCkge31cclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oZ3JpZE9wdGlvbnMsIGNvbHVtbk1vZGVsLCBncmlkT3B0aW9uc1dyYXBwZXIsIGVHcmlkLFxyXG4gICAgYW5ndWxhckdyaWQsIHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSwgJGNvbXBpbGUsICRzY29wZSxcclxuICAgIHNlbGVjdGlvbkNvbnRyb2xsZXIpIHtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnMgPSBncmlkT3B0aW9ucztcclxuICAgIHRoaXMuY29sdW1uTW9kZWwgPSBjb2x1bW5Nb2RlbDtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyID0gZ3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkO1xyXG4gICAgdGhpcy5zZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkgPSBzZWxlY3Rpb25SZW5kZXJlckZhY3Rvcnk7XHJcbiAgICB0aGlzLmZpbmRBbGxFbGVtZW50cyhlR3JpZCk7XHJcbiAgICB0aGlzLiRjb21waWxlID0gJGNvbXBpbGU7XHJcbiAgICB0aGlzLiRzY29wZSA9ICRzY29wZTtcclxuICAgIHRoaXMuc2VsZWN0aW9uQ29udHJvbGxlciA9IHNlbGVjdGlvbkNvbnRyb2xsZXI7XHJcblxyXG4gICAgLy8gbWFwIG9mIHJvdyBpZHMgdG8gcm93IG9iamVjdHMuIGtlZXBzIHRyYWNrIG9mIHdoaWNoIGVsZW1lbnRzXHJcbiAgICAvLyBhcmUgcmVuZGVyZWQgZm9yIHdoaWNoIHJvd3MgaW4gdGhlIGRvbS4gZWFjaCByb3cgb2JqZWN0IGhhczpcclxuICAgIC8vIFtzY29wZSwgYm9keVJvdywgcGlubmVkUm93LCByb3dEYXRhXVxyXG4gICAgdGhpcy5yZW5kZXJlZFJvd3MgPSB7fTtcclxuXHJcbiAgICB0aGlzLnJlbmRlcmVkUm93U3RhcnRFZGl0aW5nTGlzdGVuZXJzID0ge307XHJcblxyXG4gICAgdGhpcy5lZGl0aW5nQ2VsbCA9IGZhbHNlOyAvL2dldHMgc2V0IHRvIHRydWUgd2hlbiBlZGl0aW5nIGEgY2VsbFxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnNldFJvd01vZGVsID0gZnVuY3Rpb24ocm93TW9kZWwpIHtcclxuICAgIHRoaXMucm93TW9kZWwgPSByb3dNb2RlbDtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zZXRNYWluUm93V2lkdGhzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbWFpblJvd1dpZHRoID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRCb2R5Q29udGFpbmVyV2lkdGgoKSArIFwicHhcIjtcclxuXHJcbiAgICB2YXIgdW5waW5uZWRSb3dzID0gdGhpcy5lQm9keUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiLmFnLXJvd1wiKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdW5waW5uZWRSb3dzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdW5waW5uZWRSb3dzW2ldLnN0eWxlLndpZHRoID0gbWFpblJvd1dpZHRoO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmZpbmRBbGxFbGVtZW50cyA9IGZ1bmN0aW9uKGVHcmlkKSB7XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgdGhpcy5lQm9keUNvbnRhaW5lciA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keS1jb250YWluZXJcIik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZUJvZHlDb250YWluZXIgPSBlR3JpZC5xdWVyeVNlbGVjdG9yKFwiLmFnLWJvZHktY29udGFpbmVyXCIpO1xyXG4gICAgICAgIHRoaXMuZUJvZHlWaWV3cG9ydCA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keS12aWV3cG9ydFwiKTtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyID0gZUdyaWQucXVlcnlTZWxlY3RvcihcIi5hZy1waW5uZWQtY29scy1jb250YWluZXJcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUucmVmcmVzaFZpZXcgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgdmFyIHJvd0NvdW50ID0gdGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93Q291bnQoKTtcclxuICAgICAgICB2YXIgY29udGFpbmVySGVpZ2h0ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93SGVpZ2h0KCkgKiByb3dDb3VudDtcclxuICAgICAgICB0aGlzLmVCb2R5Q29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGNvbnRhaW5lckhlaWdodCArIFwicHhcIjtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGNvbnRhaW5lckhlaWdodCArIFwicHhcIjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlZnJlc2hBbGxWaXJ0dWFsUm93cygpO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnJvd0RhdGFDaGFuZ2VkID0gZnVuY3Rpb24ocm93cykge1xyXG4gICAgLy8gd2Ugb25seSBuZWVkIHRvIGJlIHdvcnJpZWQgYWJvdXQgcmVuZGVyZWQgcm93cywgYXMgdGhpcyBtZXRob2QgaXNcclxuICAgIC8vIGNhbGxlZCB0byB3aGF0cyByZW5kZXJlZC4gaWYgdGhlIHJvdyBpc24ndCByZW5kZXJlZCwgd2UgZG9uJ3QgY2FyZVxyXG4gICAgdmFyIGluZGV4ZXNUb1JlbW92ZSA9IFtdO1xyXG4gICAgdmFyIHJlbmRlcmVkUm93cyA9IHRoaXMucmVuZGVyZWRSb3dzO1xyXG4gICAgT2JqZWN0LmtleXMocmVuZGVyZWRSb3dzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIHZhciByZW5kZXJlZFJvdyA9IHJlbmRlcmVkUm93c1trZXldO1xyXG4gICAgICAgIC8vIHNlZSBpZiB0aGUgcmVuZGVyZWQgcm93IGlzIGluIHRoZSBsaXN0IG9mIHJvd3Mgd2UgaGF2ZSB0byB1cGRhdGVcclxuICAgICAgICB2YXIgcm93TmVlZHNVcGRhdGluZyA9IHJvd3MuaW5kZXhPZihyZW5kZXJlZFJvdy5ub2RlLmRhdGEpID49IDA7XHJcbiAgICAgICAgaWYgKHJvd05lZWRzVXBkYXRpbmcpIHtcclxuICAgICAgICAgICAgaW5kZXhlc1RvUmVtb3ZlLnB1c2goa2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIC8vIHJlbW92ZSB0aGUgcm93c1xyXG4gICAgdGhpcy5yZW1vdmVWaXJ0dWFsUm93cyhpbmRleGVzVG9SZW1vdmUpO1xyXG4gICAgLy8gYWRkIGRyYXcgdGhlbSBhZ2FpblxyXG4gICAgdGhpcy5kcmF3VmlydHVhbFJvd3MoKTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5yZWZyZXNoQWxsVmlydHVhbFJvd3MgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIHJlbW92ZSBhbGwgY3VycmVudCB2aXJ0dWFsIHJvd3MsIGFzIHRoZXkgaGF2ZSBvbGQgZGF0YVxyXG4gICAgdmFyIHJvd3NUb1JlbW92ZSA9IE9iamVjdC5rZXlzKHRoaXMucmVuZGVyZWRSb3dzKTtcclxuICAgIHRoaXMucmVtb3ZlVmlydHVhbFJvd3Mocm93c1RvUmVtb3ZlKTtcclxuXHJcbiAgICAvLyBhZGQgaW4gbmV3IHJvd3NcclxuICAgIHRoaXMuZHJhd1ZpcnR1YWxSb3dzKCk7XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgLSByZW1vdmVzIHRoZSBncm91cCByb3dzIGFuZCB0aGVuIHJlZHJhd3MgdGhlbSBhZ2FpblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUucmVmcmVzaEdyb3VwUm93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gZmluZCBhbGwgdGhlIGdyb3VwIHJvd3NcclxuICAgIHZhciByb3dzVG9SZW1vdmUgPSBbXTtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIE9iamVjdC5rZXlzKHRoaXMucmVuZGVyZWRSb3dzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIHZhciByZW5kZXJlZFJvdyA9IHRoYXQucmVuZGVyZWRSb3dzW2tleV07XHJcbiAgICAgICAgdmFyIG5vZGUgPSByZW5kZXJlZFJvdy5ub2RlO1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIHJvd3NUb1JlbW92ZS5wdXNoKGtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAvLyByZW1vdmUgdGhlIHJvd3NcclxuICAgIHRoaXMucmVtb3ZlVmlydHVhbFJvd3Mocm93c1RvUmVtb3ZlKTtcclxuICAgIC8vIGFuZCBkcmF3IHRoZW0gYmFjayBhZ2FpblxyXG4gICAgdGhpcy5lbnN1cmVSb3dzUmVuZGVyZWQoKTtcclxufTtcclxuXHJcbi8vIHRha2VzIGFycmF5IG9mIHJvdyBpbmRleGVzXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5yZW1vdmVWaXJ0dWFsUm93cyA9IGZ1bmN0aW9uKHJvd3NUb1JlbW92ZSkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgcm93c1RvUmVtb3ZlLmZvckVhY2goZnVuY3Rpb24oaW5kZXhUb1JlbW92ZSkge1xyXG4gICAgICAgIHRoYXQucmVtb3ZlVmlydHVhbFJvdyhpbmRleFRvUmVtb3ZlKTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnJlbW92ZVZpcnR1YWxSb3cgPSBmdW5jdGlvbihpbmRleFRvUmVtb3ZlKSB7XHJcbiAgICB2YXIgcmVuZGVyZWRSb3cgPSB0aGlzLnJlbmRlcmVkUm93c1tpbmRleFRvUmVtb3ZlXTtcclxuICAgIGlmIChyZW5kZXJlZFJvdy5waW5uZWRFbGVtZW50ICYmIHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIpIHtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyLnJlbW92ZUNoaWxkKHJlbmRlcmVkUm93LnBpbm5lZEVsZW1lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZW5kZXJlZFJvdy5ib2R5RWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuZUJvZHlDb250YWluZXIucmVtb3ZlQ2hpbGQocmVuZGVyZWRSb3cuYm9keUVsZW1lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZW5kZXJlZFJvdy5zY29wZSkge1xyXG4gICAgICAgIHJlbmRlcmVkUm93LnNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFZpcnR1YWxSb3dSZW1vdmVkKCkpIHtcclxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRWaXJ0dWFsUm93UmVtb3ZlZCgpKHJlbmRlcmVkUm93LmRhdGEsIGluZGV4VG9SZW1vdmUpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hbmd1bGFyR3JpZC5vblZpcnR1YWxSb3dSZW1vdmVkKGluZGV4VG9SZW1vdmUpO1xyXG5cclxuICAgIGRlbGV0ZSB0aGlzLnJlbmRlcmVkUm93c1tpbmRleFRvUmVtb3ZlXTtcclxuICAgIGRlbGV0ZSB0aGlzLnJlbmRlcmVkUm93U3RhcnRFZGl0aW5nTGlzdGVuZXJzW2luZGV4VG9SZW1vdmVdO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmRyYXdWaXJ0dWFsUm93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGZpcnN0O1xyXG4gICAgdmFyIGxhc3Q7XHJcblxyXG4gICAgdmFyIHJvd0NvdW50ID0gdGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93Q291bnQoKTtcclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgZmlyc3QgPSAwO1xyXG4gICAgICAgIGxhc3QgPSByb3dDb3VudDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIHRvcFBpeGVsID0gdGhpcy5lQm9keVZpZXdwb3J0LnNjcm9sbFRvcDtcclxuICAgICAgICB2YXIgYm90dG9tUGl4ZWwgPSB0b3BQaXhlbCArIHRoaXMuZUJvZHlWaWV3cG9ydC5vZmZzZXRIZWlnaHQ7XHJcblxyXG4gICAgICAgIGZpcnN0ID0gTWF0aC5mbG9vcih0b3BQaXhlbCAvIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0hlaWdodCgpKTtcclxuICAgICAgICBsYXN0ID0gTWF0aC5mbG9vcihib3R0b21QaXhlbCAvIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0hlaWdodCgpKTtcclxuXHJcbiAgICAgICAgLy9hZGQgaW4gYnVmZmVyXHJcbiAgICAgICAgZmlyc3QgPSBmaXJzdCAtIGNvbnN0YW50cy5ST1dfQlVGRkVSX1NJWkU7XHJcbiAgICAgICAgbGFzdCA9IGxhc3QgKyBjb25zdGFudHMuUk9XX0JVRkZFUl9TSVpFO1xyXG5cclxuICAgICAgICAvLyBhZGp1c3QsIGluIGNhc2UgYnVmZmVyIGV4dGVuZGVkIGFjdHVhbCBzaXplXHJcbiAgICAgICAgaWYgKGZpcnN0IDwgMCkge1xyXG4gICAgICAgICAgICBmaXJzdCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChsYXN0ID4gcm93Q291bnQgLSAxKSB7XHJcbiAgICAgICAgICAgIGxhc3QgPSByb3dDb3VudCAtIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3cgPSBmaXJzdDtcclxuICAgIHRoaXMubGFzdFZpcnR1YWxSZW5kZXJlZFJvdyA9IGxhc3Q7XHJcblxyXG4gICAgdGhpcy5lbnN1cmVSb3dzUmVuZGVyZWQoKTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5pc0luZGV4UmVuZGVyZWQgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgcmV0dXJuIGluZGV4ID49IHRoaXMuZmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3cgJiYgaW5kZXggPD0gdGhpcy5sYXN0VmlydHVhbFJlbmRlcmVkUm93O1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmdldEZpcnN0VmlydHVhbFJlbmRlcmVkUm93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5maXJzdFZpcnR1YWxSZW5kZXJlZFJvdztcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5nZXRMYXN0VmlydHVhbFJlbmRlcmVkUm93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5sYXN0VmlydHVhbFJlbmRlcmVkUm93O1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmVuc3VyZVJvd3NSZW5kZXJlZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBtYWluUm93V2lkdGggPSB0aGlzLmNvbHVtbk1vZGVsLmdldEJvZHlDb250YWluZXJXaWR0aCgpO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIC8vYXQgdGhlIGVuZCwgdGhpcyBhcnJheSB3aWxsIGNvbnRhaW4gdGhlIGl0ZW1zIHdlIG5lZWQgdG8gcmVtb3ZlXHJcbiAgICB2YXIgcm93c1RvUmVtb3ZlID0gT2JqZWN0LmtleXModGhpcy5yZW5kZXJlZFJvd3MpO1xyXG5cclxuICAgIC8vYWRkIGluIG5ldyByb3dzXHJcbiAgICBmb3IgKHZhciByb3dJbmRleCA9IHRoaXMuZmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3c7IHJvd0luZGV4IDw9IHRoaXMubGFzdFZpcnR1YWxSZW5kZXJlZFJvdzsgcm93SW5kZXgrKykge1xyXG4gICAgICAgIC8vIHNlZSBpZiBpdGVtIGFscmVhZHkgdGhlcmUsIGFuZCBpZiB5ZXMsIHRha2UgaXQgb3V0IG9mIHRoZSAndG8gcmVtb3ZlJyBhcnJheVxyXG4gICAgICAgIGlmIChyb3dzVG9SZW1vdmUuaW5kZXhPZihyb3dJbmRleC50b1N0cmluZygpKSA+PSAwKSB7XHJcbiAgICAgICAgICAgIHJvd3NUb1JlbW92ZS5zcGxpY2Uocm93c1RvUmVtb3ZlLmluZGV4T2Yocm93SW5kZXgudG9TdHJpbmcoKSksIDEpO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY2hlY2sgdGhpcyByb3cgYWN0dWFsbHkgZXhpc3RzIChpbiBjYXNlIG92ZXJmbG93IGJ1ZmZlciB3aW5kb3cgZXhjZWVkcyByZWFsIGRhdGEpXHJcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnJvd01vZGVsLmdldFZpcnR1YWxSb3cocm93SW5kZXgpO1xyXG4gICAgICAgIGlmIChub2RlKSB7XHJcbiAgICAgICAgICAgIHRoYXQuaW5zZXJ0Um93KG5vZGUsIHJvd0luZGV4LCBtYWluUm93V2lkdGgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL2F0IHRoaXMgcG9pbnQsIGV2ZXJ5dGhpbmcgaW4gb3VyICdyb3dzVG9SZW1vdmUnIC4gLiAuXHJcbiAgICB0aGlzLnJlbW92ZVZpcnR1YWxSb3dzKHJvd3NUb1JlbW92ZSk7XHJcblxyXG4gICAgLy9pZiB3ZSBhcmUgZG9pbmcgYW5ndWxhciBjb21waWxpbmcsIHRoZW4gZG8gZGlnZXN0IHRoZSBzY29wZSBoZXJlXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9ucy5hbmd1bGFyQ29tcGlsZVJvd3MpIHtcclxuICAgICAgICAvLyB3ZSBkbyBpdCBpbiBhIHRpbWVvdXQsIGluIGNhc2Ugd2UgYXJlIGFscmVhZHkgaW4gYW4gYXBwbHlcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LiRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9LCAwKTtcclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5pbnNlcnRSb3cgPSBmdW5jdGlvbihub2RlLCByb3dJbmRleCwgbWFpblJvd1dpZHRoKSB7XHJcbiAgICAvL2lmIG5vIGNvbHMsIGRvbid0IGRyYXcgcm93XHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzQ29sdW1EZWZzUHJlc2VudCgpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vdmFyIHJvd0RhdGEgPSBub2RlLnJvd0RhdGE7XHJcbiAgICB2YXIgcm93SXNBR3JvdXAgPSBub2RlLmdyb3VwO1xyXG4gICAgdmFyIHJvd0lzQUZvb3RlciA9IG5vZGUuZm9vdGVyO1xyXG5cclxuICAgIHZhciBlUGlubmVkUm93ID0gdGhpcy5jcmVhdGVSb3dDb250YWluZXIocm93SW5kZXgsIG5vZGUsIHJvd0lzQUdyb3VwKTtcclxuICAgIHZhciBlTWFpblJvdyA9IHRoaXMuY3JlYXRlUm93Q29udGFpbmVyKHJvd0luZGV4LCBub2RlLCByb3dJc0FHcm91cCk7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIGVNYWluUm93LnN0eWxlLndpZHRoID0gbWFpblJvd1dpZHRoICsgXCJweFwiO1xyXG5cclxuICAgIC8vIHRyeSBjb21waWxpbmcgYXMgd2UgaW5zZXJ0IHJvd3NcclxuICAgIHZhciBuZXdDaGlsZFNjb3BlID0gdGhpcy5jcmVhdGVDaGlsZFNjb3BlT3JOdWxsKG5vZGUuZGF0YSk7XHJcblxyXG4gICAgdmFyIHJlbmRlcmVkUm93ID0ge1xyXG4gICAgICAgIHNjb3BlOiBuZXdDaGlsZFNjb3BlLFxyXG4gICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgcm93SW5kZXg6IHJvd0luZGV4XHJcbiAgICB9O1xyXG4gICAgdGhpcy5yZW5kZXJlZFJvd3Nbcm93SW5kZXhdID0gcmVuZGVyZWRSb3c7XHJcbiAgICB0aGlzLnJlbmRlcmVkUm93U3RhcnRFZGl0aW5nTGlzdGVuZXJzW3Jvd0luZGV4XSA9IHt9O1xyXG5cclxuICAgIC8vIGlmIGdyb3VwIGl0ZW0sIGluc2VydCB0aGUgZmlyc3Qgcm93XHJcbiAgICB2YXIgY29sdW1ucyA9IHRoaXMuY29sdW1uTW9kZWwuZ2V0VmlzaWJsZUNvbHVtbnMoKTtcclxuICAgIGlmIChyb3dJc0FHcm91cCkge1xyXG4gICAgICAgIHZhciBmaXJzdENvbHVtbiA9IGNvbHVtbnNbMF07XHJcbiAgICAgICAgdmFyIGdyb3VwSGVhZGVyVGFrZXNFbnRpcmVSb3cgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwVXNlRW50aXJlUm93KCk7XHJcblxyXG4gICAgICAgIHZhciBlR3JvdXBSb3cgPSBfdGhpcy5jcmVhdGVHcm91cEVsZW1lbnQobm9kZSwgZmlyc3RDb2x1bW4sIGdyb3VwSGVhZGVyVGFrZXNFbnRpcmVSb3csIGZhbHNlLCByb3dJbmRleCwgcm93SXNBRm9vdGVyKTtcclxuICAgICAgICBpZiAoZmlyc3RDb2x1bW4ucGlubmVkKSB7XHJcbiAgICAgICAgICAgIGVQaW5uZWRSb3cuYXBwZW5kQ2hpbGQoZUdyb3VwUm93KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlTWFpblJvdy5hcHBlbmRDaGlsZChlR3JvdXBSb3cpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGZpcnN0Q29sdW1uLnBpbm5lZCAmJiBncm91cEhlYWRlclRha2VzRW50aXJlUm93KSB7XHJcbiAgICAgICAgICAgIHZhciBlR3JvdXBSb3dQYWRkaW5nID0gX3RoaXMuY3JlYXRlR3JvdXBFbGVtZW50KG5vZGUsIGZpcnN0Q29sdW1uLCBncm91cEhlYWRlclRha2VzRW50aXJlUm93LCB0cnVlLCByb3dJbmRleCwgcm93SXNBRm9vdGVyKTtcclxuICAgICAgICAgICAgZU1haW5Sb3cuYXBwZW5kQ2hpbGQoZUdyb3VwUm93UGFkZGluZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWdyb3VwSGVhZGVyVGFrZXNFbnRpcmVSb3cpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGRyYXcgaW4gY2VsbHMgZm9yIHRoZSByZXN0IG9mIHRoZSByb3cuXHJcbiAgICAgICAgICAgIC8vIGlmIGdyb3VwIGlzIGEgZm9vdGVyLCBhbHdheXMgc2hvdyB0aGUgZGF0YS5cclxuICAgICAgICAgICAgLy8gaWYgZ3JvdXAgaXMgYSBoZWFkZXIsIG9ubHkgc2hvdyBkYXRhIGlmIG5vdCBleHBhbmRlZFxyXG4gICAgICAgICAgICB2YXIgZ3JvdXBEYXRhO1xyXG4gICAgICAgICAgICBpZiAobm9kZS5mb290ZXIpIHtcclxuICAgICAgICAgICAgICAgIGdyb3VwRGF0YSA9IG5vZGUuZGF0YTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIHdlIHNob3cgZGF0YSBpbiBmb290ZXIgb25seVxyXG4gICAgICAgICAgICAgICAgdmFyIGZvb3RlcnNFbmFibGVkID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEluY2x1ZGVGb290ZXIoKTtcclxuICAgICAgICAgICAgICAgIGdyb3VwRGF0YSA9IChub2RlLmV4cGFuZGVkICYmIGZvb3RlcnNFbmFibGVkKSA/IHVuZGVmaW5lZCA6IG5vZGUuZGF0YTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb2x1bW5zLmZvckVhY2goZnVuY3Rpb24oY29sdW1uLCBjb2xJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbEluZGV4ID09IDApIHsgLy9za2lwIGZpcnN0IGNvbCwgYXMgdGhpcyBpcyB0aGUgZ3JvdXAgY29sIHdlIGFscmVhZHkgaW5zZXJ0ZWRcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBncm91cERhdGEgPyBncm91cERhdGFbY29sdW1uLmNvbERlZi5maWVsZF0gOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5jcmVhdGVDZWxsRnJvbUNvbERlZihmYWxzZSwgY29sdW1uLCB2YWx1ZSwgbm9kZSwgcm93SW5kZXgsIGVNYWluUm93LCBlUGlubmVkUm93LCBuZXdDaGlsZFNjb3BlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbiwgaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIGZpcnN0Q29sID0gaW5kZXggPT09IDA7XHJcbiAgICAgICAgICAgIF90aGlzLmNyZWF0ZUNlbGxGcm9tQ29sRGVmKGZpcnN0Q29sLCBjb2x1bW4sIG5vZGUuZGF0YVtjb2x1bW4uY29sRGVmLmZpZWxkXSwgbm9kZSwgcm93SW5kZXgsIGVNYWluUm93LCBlUGlubmVkUm93LCBuZXdDaGlsZFNjb3BlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvL3RyeSBjb21waWxpbmcgYXMgd2UgaW5zZXJ0IHJvd3NcclxuICAgIHJlbmRlcmVkUm93LnBpbm5lZEVsZW1lbnQgPSB0aGlzLmNvbXBpbGVBbmRBZGQodGhpcy5lUGlubmVkQ29sc0NvbnRhaW5lciwgcm93SW5kZXgsIGVQaW5uZWRSb3csIG5ld0NoaWxkU2NvcGUpO1xyXG4gICAgcmVuZGVyZWRSb3cuYm9keUVsZW1lbnQgPSB0aGlzLmNvbXBpbGVBbmRBZGQodGhpcy5lQm9keUNvbnRhaW5lciwgcm93SW5kZXgsIGVNYWluUm93LCBuZXdDaGlsZFNjb3BlKTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVDaGlsZFNjb3BlT3JOdWxsID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzQW5ndWxhckNvbXBpbGVSb3dzKCkpIHtcclxuICAgICAgICB2YXIgbmV3Q2hpbGRTY29wZSA9IHRoaXMuJHNjb3BlLiRuZXcoKTtcclxuICAgICAgICBuZXdDaGlsZFNjb3BlLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgIHJldHVybiBuZXdDaGlsZFNjb3BlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5jb21waWxlQW5kQWRkID0gZnVuY3Rpb24oY29udGFpbmVyLCByb3dJbmRleCwgZWxlbWVudCwgc2NvcGUpIHtcclxuICAgIGlmIChzY29wZSkge1xyXG4gICAgICAgIHZhciBlRWxlbWVudENvbXBpbGVkID0gdGhpcy4kY29tcGlsZShlbGVtZW50KShzY29wZSk7XHJcbiAgICAgICAgaWYgKGNvbnRhaW5lcikgeyAvLyBjaGVja2luZyBjb250YWluZXIsIGFzIGlmIG5vU2Nyb2xsLCBwaW5uZWQgY29udGFpbmVyIGlzIG1pc3NpbmdcclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVFbGVtZW50Q29tcGlsZWRbMF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZUVsZW1lbnRDb21waWxlZFswXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKGNvbnRhaW5lcikge1xyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmNyZWF0ZUNlbGxGcm9tQ29sRGVmID0gZnVuY3Rpb24oaXNGaXJzdENvbHVtbiwgY29sdW1uLCB2YWx1ZSwgbm9kZSwgcm93SW5kZXgsIGVNYWluUm93LCBlUGlubmVkUm93LCAkY2hpbGRTY29wZSkge1xyXG4gICAgdmFyIGVHcmlkQ2VsbCA9IHRoaXMuY3JlYXRlQ2VsbChpc0ZpcnN0Q29sdW1uLCBjb2x1bW4sIHZhbHVlLCBub2RlLCByb3dJbmRleCwgJGNoaWxkU2NvcGUpO1xyXG5cclxuICAgIGlmIChjb2x1bW4ucGlubmVkKSB7XHJcbiAgICAgICAgZVBpbm5lZFJvdy5hcHBlbmRDaGlsZChlR3JpZENlbGwpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBlTWFpblJvdy5hcHBlbmRDaGlsZChlR3JpZENlbGwpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmFkZENsYXNzZXNUb1JvdyA9IGZ1bmN0aW9uKHJvd0luZGV4LCBub2RlLCBlUm93KSB7XHJcbiAgICB2YXIgY2xhc3Nlc0xpc3QgPSBbXCJhZy1yb3dcIl07XHJcbiAgICBjbGFzc2VzTGlzdC5wdXNoKHJvd0luZGV4ICUgMiA9PSAwID8gXCJhZy1yb3ctZXZlblwiIDogXCJhZy1yb3ctb2RkXCIpO1xyXG5cclxuICAgIGlmICh0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIuaXNOb2RlU2VsZWN0ZWQobm9kZSkpIHtcclxuICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LXNlbGVjdGVkXCIpO1xyXG4gICAgfVxyXG4gICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAvLyBpZiBhIGdyb3VwLCBwdXQgdGhlIGxldmVsIG9mIHRoZSBncm91cCBpblxyXG4gICAgICAgIGNsYXNzZXNMaXN0LnB1c2goXCJhZy1yb3ctbGV2ZWwtXCIgKyBub2RlLmxldmVsKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gaWYgYSBsZWFmLCBhbmQgYSBwYXJlbnQgZXhpc3RzLCBwdXQgYSBsZXZlbCBvZiB0aGUgcGFyZW50LCBlbHNlIHB1dCBsZXZlbCBvZiAwIGZvciB0b3AgbGV2ZWwgaXRlbVxyXG4gICAgICAgIGlmIChub2RlLnBhcmVudCkge1xyXG4gICAgICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LWxldmVsLVwiICsgKG5vZGUucGFyZW50LmxldmVsICsgMSkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNsYXNzZXNMaXN0LnB1c2goXCJhZy1yb3ctbGV2ZWwtMFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAobm9kZS5ncm91cCkge1xyXG4gICAgICAgIGNsYXNzZXNMaXN0LnB1c2goXCJhZy1yb3ctZ3JvdXBcIik7XHJcbiAgICB9XHJcbiAgICBpZiAobm9kZS5ncm91cCAmJiAhbm9kZS5mb290ZXIgJiYgbm9kZS5leHBhbmRlZCkge1xyXG4gICAgICAgIGNsYXNzZXNMaXN0LnB1c2goXCJhZy1yb3ctZ3JvdXAtZXhwYW5kZWRcIik7XHJcbiAgICB9XHJcbiAgICBpZiAobm9kZS5ncm91cCAmJiAhbm9kZS5mb290ZXIgJiYgIW5vZGUuZXhwYW5kZWQpIHtcclxuICAgICAgICAvLyBvcHBvc2l0ZSBvZiBleHBhbmRlZCBpcyBjb250cmFjdGVkIGFjY29yZGluZyB0byB0aGUgaW50ZXJuZXQuXHJcbiAgICAgICAgY2xhc3Nlc0xpc3QucHVzaChcImFnLXJvdy1ncm91cC1jb250cmFjdGVkXCIpO1xyXG4gICAgfVxyXG4gICAgaWYgKG5vZGUuZ3JvdXAgJiYgbm9kZS5mb290ZXIpIHtcclxuICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LWZvb3RlclwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhZGQgaW4gZXh0cmEgY2xhc3NlcyBwcm92aWRlZCBieSB0aGUgY29uZmlnXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93Q2xhc3MoKSkge1xyXG4gICAgICAgIHZhciBwYXJhbXMgPSB7XHJcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgcm93SW5kZXg6IHJvd0luZGV4LFxyXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCksXHJcbiAgICAgICAgICAgIGdyaWRPcHRpb25zOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcmlkT3B0aW9ucygpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgZXh0cmFSb3dDbGFzc2VzID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93Q2xhc3MoKShwYXJhbXMpO1xyXG4gICAgICAgIGlmIChleHRyYVJvd0NsYXNzZXMpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBleHRyYVJvd0NsYXNzZXMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKGV4dHJhUm93Q2xhc3Nlcyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShleHRyYVJvd0NsYXNzZXMpKSB7XHJcbiAgICAgICAgICAgICAgICBleHRyYVJvd0NsYXNzZXMuZm9yRWFjaChmdW5jdGlvbihjbGFzc0l0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKGNsYXNzSXRlbSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2xhc3NlcyA9IGNsYXNzZXNMaXN0LmpvaW4oXCIgXCIpO1xyXG5cclxuICAgIGVSb3cuY2xhc3NOYW1lID0gY2xhc3NlcztcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVSb3dDb250YWluZXIgPSBmdW5jdGlvbihyb3dJbmRleCwgbm9kZSwgZ3JvdXBSb3cpIHtcclxuICAgIHZhciBlUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuXHJcbiAgICB0aGlzLmFkZENsYXNzZXNUb1Jvdyhyb3dJbmRleCwgbm9kZSwgZVJvdyk7XHJcblxyXG4gICAgZVJvdy5zZXRBdHRyaWJ1dGUoXCJyb3dcIiwgcm93SW5kZXgpO1xyXG5cclxuICAgIC8vIGlmIHNob3dpbmcgc2Nyb2xscywgcG9zaXRpb24gb24gdGhlIGNvbnRhaW5lclxyXG4gICAgaWYgKCF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0RvbnRVc2VTY3JvbGxzKCkpIHtcclxuICAgICAgICBlUm93LnN0eWxlLnRvcCA9ICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dIZWlnaHQoKSAqIHJvd0luZGV4KSArIFwicHhcIjtcclxuICAgIH1cclxuICAgIGVSb3cuc3R5bGUuaGVpZ2h0ID0gKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0hlaWdodCgpKSArIFwicHhcIjtcclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93U3R5bGUoKSkge1xyXG4gICAgICAgIHZhciBjc3NUb1VzZTtcclxuICAgICAgICB2YXIgcm93U3R5bGUgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dTdHlsZSgpO1xyXG4gICAgICAgIGlmICh0eXBlb2Ygcm93U3R5bGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgY3NzVG9Vc2UgPSByb3dTdHlsZShub2RlLmRhdGEsIHJvd0luZGV4LCBncm91cFJvdyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3NzVG9Vc2UgPSByb3dTdHlsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjc3NUb1VzZSkge1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjc3NUb1VzZSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgICAgIGVSb3cuc3R5bGVba2V5XSA9IGNzc1RvVXNlW2tleV07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWdyb3VwUm93KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBlUm93LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICBfdGhpcy5hbmd1bGFyR3JpZC5vblJvd0NsaWNrZWQoZXZlbnQsIE51bWJlcih0aGlzLmdldEF0dHJpYnV0ZShcInJvd1wiKSksIG5vZGUpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVSb3c7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuZ2V0SW5kZXhPZlJlbmRlcmVkTm9kZSA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIHZhciByZW5kZXJlZFJvd3MgPSB0aGlzLnJlbmRlcmVkUm93cztcclxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocmVuZGVyZWRSb3dzKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChyZW5kZXJlZFJvd3Nba2V5c1tpXV0ubm9kZSA9PT0gbm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyZWRSb3dzW2tleXNbaV1dLnJvd0luZGV4O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiAtMTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zZXRDc3NDbGFzc0Zvckdyb3VwQ2VsbCA9IGZ1bmN0aW9uKGVHcmlkR3JvdXBSb3csIGZvb3RlciwgdXNlRW50aXJlUm93LCBmaXJzdENvbHVtbkluZGV4KSB7XHJcbiAgICBpZiAodXNlRW50aXJlUm93KSB7XHJcbiAgICAgICAgaWYgKGZvb3Rlcikge1xyXG4gICAgICAgICAgICBlR3JpZEdyb3VwUm93LmNsYXNzTmFtZSA9ICdhZy1mb290ZXItY2VsbC1lbnRpcmUtcm93JztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlR3JpZEdyb3VwUm93LmNsYXNzTmFtZSA9ICdhZy1ncm91cC1jZWxsLWVudGlyZS1yb3cnO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKGZvb3Rlcikge1xyXG4gICAgICAgICAgICBlR3JpZEdyb3VwUm93LmNsYXNzTmFtZSA9ICdhZy1mb290ZXItY2VsbCBhZy1jZWxsIGNlbGwtY29sLScgKyBmaXJzdENvbHVtbkluZGV4O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVHcmlkR3JvdXBSb3cuY2xhc3NOYW1lID0gJ2FnLWdyb3VwLWNlbGwgYWctY2VsbCBjZWxsLWNvbC0nICsgZmlyc3RDb2x1bW5JbmRleDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlR3JvdXBFbGVtZW50ID0gZnVuY3Rpb24obm9kZSwgZmlyc3RDb2x1bW4sIHVzZUVudGlyZVJvdywgcGFkZGluZywgcm93SW5kZXgsIGZvb3Rlcikge1xyXG4gICAgdmFyIGVHcmlkR3JvdXBSb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcbiAgICB0aGlzLnNldENzc0NsYXNzRm9yR3JvdXBDZWxsKGVHcmlkR3JvdXBSb3csIGZvb3RlciwgdXNlRW50aXJlUm93LCBmaXJzdENvbHVtbi5pbmRleCk7XHJcblxyXG4gICAgdmFyIGV4cGFuZEljb25OZWVkZWQgPSAhcGFkZGluZyAmJiAhZm9vdGVyO1xyXG4gICAgaWYgKGV4cGFuZEljb25OZWVkZWQpIHtcclxuICAgICAgICB0aGlzLmFkZEdyb3VwRXhwYW5kSWNvbihlR3JpZEdyb3VwUm93LCBub2RlLmV4cGFuZGVkKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2hlY2tib3hOZWVkZWQgPSAhcGFkZGluZyAmJiAhZm9vdGVyICYmIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBDaGVja2JveFNlbGVjdGlvbigpO1xyXG4gICAgaWYgKGNoZWNrYm94TmVlZGVkKSB7XHJcbiAgICAgICAgdmFyIGVDaGVja2JveCA9IHRoaXMuc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LmNyZWF0ZVNlbGVjdGlvbkNoZWNrYm94KG5vZGUsIHJvd0luZGV4KTtcclxuICAgICAgICBlR3JpZEdyb3VwUm93LmFwcGVuZENoaWxkKGVDaGVja2JveCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdHJ5IHVzZXIgY3VzdG9tIHJlbmRlcmluZyBmaXJzdFxyXG4gICAgdmFyIHVzZVJlbmRlcmVyID0gdHlwZW9mIHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBJbm5lckNlbGxSZW5kZXJlciA9PT0gJ2Z1bmN0aW9uJztcclxuICAgIGlmICh1c2VSZW5kZXJlcikge1xyXG4gICAgICAgIHZhciByZW5kZXJlclBhcmFtcyA9IHtcclxuICAgICAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICBwYWRkaW5nOiBwYWRkaW5nLFxyXG4gICAgICAgICAgICBncmlkT3B0aW9uczogdGhpcy5ncmlkT3B0aW9ucyxcclxuICAgICAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB1dGlscy51c2VSZW5kZXJlcihlR3JpZEdyb3VwUm93LCB0aGlzLmdyaWRPcHRpb25zLmdyb3VwSW5uZXJDZWxsUmVuZGVyZXIsIHJlbmRlcmVyUGFyYW1zKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKCFwYWRkaW5nKSB7XHJcbiAgICAgICAgICAgIGlmIChmb290ZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlRm9vdGVyQ2VsbChlR3JpZEdyb3VwUm93LCBub2RlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlR3JvdXBDZWxsKGVHcmlkR3JvdXBSb3csIG5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghdXNlRW50aXJlUm93KSB7XHJcbiAgICAgICAgZUdyaWRHcm91cFJvdy5zdHlsZS53aWR0aCA9IHV0aWxzLmZvcm1hdFdpZHRoKGZpcnN0Q29sdW1uLmFjdHVhbFdpZHRoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpbmRlbnQgd2l0aCB0aGUgZ3JvdXAgbGV2ZWxcclxuICAgIGlmICghcGFkZGluZykge1xyXG4gICAgICAgIC8vIG9ubHkgZG8gdGhpcyBpZiBhbiBpbmRlbnQgLSBhcyB0aGlzIG92ZXJ3cml0ZXMgdGhlIHBhZGRpbmcgdGhhdFxyXG4gICAgICAgIC8vIHRoZSB0aGVtZSBzZXQsIHdoaWNoIHdpbGwgbWFrZSB0aGluZ3MgbG9vayAnbm90IGFsaWduZWQnIGZvciB0aGVcclxuICAgICAgICAvLyBmaXJzdCBncm91cCBsZXZlbC5cclxuICAgICAgICBpZiAobm9kZS5mb290ZXIgfHwgbm9kZS5sZXZlbCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIHBhZGRpbmdQeCA9IG5vZGUubGV2ZWwgKiAxMDtcclxuICAgICAgICAgICAgaWYgKGZvb3Rlcikge1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZ1B4ICs9IDEwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVHcmlkR3JvdXBSb3cuc3R5bGUucGFkZGluZ0xlZnQgPSBwYWRkaW5nUHggKyBcInB4XCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGVHcmlkR3JvdXBSb3cuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIG5vZGUuZXhwYW5kZWQgPSAhbm9kZS5leHBhbmRlZDtcclxuICAgICAgICB0aGF0LmFuZ3VsYXJHcmlkLnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9NQVApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGVHcmlkR3JvdXBSb3c7XHJcbn07XHJcblxyXG4vLyBjcmVhdGVzIGNlbGwgd2l0aCAnVG90YWwge3trZXl9fScgZm9yIGEgZ3JvdXBcclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmNyZWF0ZUZvb3RlckNlbGwgPSBmdW5jdGlvbihlUGFyZW50LCBub2RlKSB7XHJcbiAgICAvLyBpZiB3ZSBhcmUgZG9pbmcgY2VsbCAtIHRoZW4gaXQgbWFrZXMgc2Vuc2UgdG8gcHV0IGluICd0b3RhbCcsIHdoaWNoIGlzIGp1c3QgYSBiZXN0IGd1ZXNzLFxyXG4gICAgLy8gdGhhdCB0aGUgdXNlciBpcyBnb2luZyB0byB3YW50IHRvIHNheSAndG90YWwnLiB0eXBpY2FsbHkgaSBleHBlY3QgdGhlIHVzZXIgdG8gb3ZlcnJpZGVcclxuICAgIC8vIGhvdyB0aGlzIGNlbGwgaXMgcmVuZGVyZWRcclxuICAgIHZhciB0ZXh0VG9EaXNwbGF5O1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBVc2VFbnRpcmVSb3coKSkge1xyXG4gICAgICAgIHRleHRUb0Rpc3BsYXkgPSBcIkdyb3VwIGZvb3RlciAtIHlvdSBzaG91bGQgcHJvdmlkZSBhIGN1c3RvbSBncm91cElubmVyQ2VsbFJlbmRlcmVyIHRvIHJlbmRlciB3aGF0IG1ha2VzIHNlbnNlIGZvciB5b3VcIlxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0ZXh0VG9EaXNwbGF5ID0gXCJUb3RhbCBcIiArIG5vZGUua2V5O1xyXG4gICAgfVxyXG4gICAgdmFyIGVUZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dFRvRGlzcGxheSk7XHJcbiAgICBlUGFyZW50LmFwcGVuZENoaWxkKGVUZXh0KTtcclxufTtcclxuXHJcbi8vIGNyZWF0ZXMgY2VsbCB3aXRoICd7e2tleX19ICh7e2NoaWxkQ291bnR9fSknIGZvciBhIGdyb3VwXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVHcm91cENlbGwgPSBmdW5jdGlvbihlUGFyZW50LCBub2RlKSB7XHJcbiAgICB2YXIgdGV4dFRvRGlzcGxheSA9IFwiIFwiICsgbm9kZS5rZXk7XHJcbiAgICAvLyBvbmx5IGluY2x1ZGUgdGhlIGNoaWxkIGNvdW50IGlmIGl0J3MgaW5jbHVkZWQsIGVnIGlmIHVzZXIgZG9pbmcgY3VzdG9tIGFnZ3JlZ2F0aW9uLFxyXG4gICAgLy8gdGhlbiB0aGlzIGNvdWxkIGJlIGxlZnQgb3V0LCBvciBzZXQgdG8gLTEsIGllIG5vIGNoaWxkIGNvdW50XHJcbiAgICBpZiAobm9kZS5hbGxDaGlsZHJlbkNvdW50ID49IDApIHtcclxuICAgICAgICB0ZXh0VG9EaXNwbGF5ICs9IFwiIChcIiArIG5vZGUuYWxsQ2hpbGRyZW5Db3VudCArIFwiKVwiO1xyXG4gICAgfVxyXG4gICAgdmFyIGVUZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dFRvRGlzcGxheSk7XHJcbiAgICBlUGFyZW50LmFwcGVuZENoaWxkKGVUZXh0KTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5hZGRHcm91cEV4cGFuZEljb24gPSBmdW5jdGlvbihlR3JpZEdyb3VwUm93LCBleHBhbmRlZCkge1xyXG4gICAgdmFyIGVHcm91cEljb247XHJcbiAgICBpZiAoZXhwYW5kZWQpIHtcclxuICAgICAgICBlR3JvdXBJY29uID0gdXRpbHMuY3JlYXRlSWNvbignZ3JvdXBFeHBhbmRlZCcsIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLCBudWxsLCBzdmdGYWN0b3J5LmNyZWF0ZUFycm93RG93blN2Zyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVHcm91cEljb24gPSB1dGlscy5jcmVhdGVJY29uKCdncm91cENvbnRyYWN0ZWQnLCB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciwgbnVsbCwgc3ZnRmFjdG9yeS5jcmVhdGVBcnJvd1JpZ2h0U3ZnKTtcclxuICAgIH1cclxuXHJcbiAgICBlR3JpZEdyb3VwUm93LmFwcGVuZENoaWxkKGVHcm91cEljb24pO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnB1dERhdGFJbnRvQ2VsbCA9IGZ1bmN0aW9uKGNvbERlZiwgdmFsdWUsIG5vZGUsICRjaGlsZFNjb3BlLCBlR3JpZENlbGwsIHJvd0luZGV4KSB7XHJcbiAgICBpZiAoY29sRGVmLmNlbGxSZW5kZXJlcikge1xyXG4gICAgICAgIHZhciByZW5kZXJlclBhcmFtcyA9IHtcclxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAkc2NvcGU6ICRjaGlsZFNjb3BlLFxyXG4gICAgICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgICAgIGdyaWRPcHRpb25zOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcmlkT3B0aW9ucygpLFxyXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KClcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciByZXN1bHRGcm9tUmVuZGVyZXIgPSBjb2xEZWYuY2VsbFJlbmRlcmVyKHJlbmRlcmVyUGFyYW1zKTtcclxuICAgICAgICBpZiAodXRpbHMuaXNOb2RlKHJlc3VsdEZyb21SZW5kZXJlcikgfHwgdXRpbHMuaXNFbGVtZW50KHJlc3VsdEZyb21SZW5kZXJlcikpIHtcclxuICAgICAgICAgICAgLy8gYSBkb20gbm9kZSBvciBlbGVtZW50IHdhcyByZXR1cm5lZCwgc28gYWRkIGNoaWxkXHJcbiAgICAgICAgICAgIGVHcmlkQ2VsbC5hcHBlbmRDaGlsZChyZXN1bHRGcm9tUmVuZGVyZXIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSBhc3N1bWUgaXQgd2FzIGh0bWwsIHNvIGp1c3QgaW5zZXJ0XHJcbiAgICAgICAgICAgIGVHcmlkQ2VsbC5pbm5lckhUTUwgPSByZXN1bHRGcm9tUmVuZGVyZXI7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBpZiB3ZSBpbnNlcnQgdW5kZWZpbmVkLCB0aGVuIGl0IGRpc3BsYXlzIGFzIHRoZSBzdHJpbmcgJ3VuZGVmaW5lZCcsIHVnbHkhXHJcbiAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09ICcnKSB7XHJcbiAgICAgICAgICAgIGVHcmlkQ2VsbC5pbm5lckhUTUwgPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlQ2VsbCA9IGZ1bmN0aW9uKGlzRmlyc3RDb2x1bW4sIGNvbHVtbiwgdmFsdWUsIG5vZGUsIHJvd0luZGV4LCAkY2hpbGRTY29wZSkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIGVHcmlkQ2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBlR3JpZENlbGwuc2V0QXR0cmlidXRlKFwiY29sXCIsIGNvbHVtbi5pbmRleCk7XHJcblxyXG4gICAgLy8gc2V0IGNsYXNzLCBvbmx5IGluY2x1ZGUgYWctZ3JvdXAtY2VsbCBpZiBpdCdzIGEgZ3JvdXAgY2VsbFxyXG4gICAgdmFyIGNsYXNzZXMgPSBbJ2FnLWNlbGwnLCAnY2VsbC1jb2wtJyArIGNvbHVtbi5pbmRleF07XHJcbiAgICBpZiAobm9kZS5ncm91cCkge1xyXG4gICAgICAgIGlmIChub2RlLmZvb3Rlcikge1xyXG4gICAgICAgICAgICBjbGFzc2VzLnB1c2goJ2FnLWZvb3Rlci1jZWxsJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKCdhZy1ncm91cC1jZWxsJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZUdyaWRDZWxsLmNsYXNzTmFtZSA9IGNsYXNzZXMuam9pbignICcpO1xyXG5cclxuICAgIHZhciBlQ2VsbFdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICBlR3JpZENlbGwuYXBwZW5kQ2hpbGQoZUNlbGxXcmFwcGVyKTtcclxuXHJcbiAgICAvLyBzZWUgaWYgd2UgbmVlZCBhIHBhZGRpbmcgYm94XHJcbiAgICBpZiAoaXNGaXJzdENvbHVtbiAmJiAobm9kZS5wYXJlbnQpKSB7XHJcbiAgICAgICAgdmFyIHBpeGVsc1RvSW5kZW50ID0gMjAgKyAobm9kZS5wYXJlbnQubGV2ZWwgKiAxMCk7XHJcbiAgICAgICAgZUNlbGxXcmFwcGVyLnN0eWxlWydwYWRkaW5nLWxlZnQnXSA9IHBpeGVsc1RvSW5kZW50ICsgJ3B4JztcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY29sRGVmID0gY29sdW1uLmNvbERlZjtcclxuICAgIGlmIChjb2xEZWYuY2hlY2tib3hTZWxlY3Rpb24pIHtcclxuICAgICAgICB2YXIgZUNoZWNrYm94ID0gdGhpcy5zZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkuY3JlYXRlU2VsZWN0aW9uQ2hlY2tib3gobm9kZSwgcm93SW5kZXgpO1xyXG4gICAgICAgIGVDZWxsV3JhcHBlci5hcHBlbmRDaGlsZChlQ2hlY2tib3gpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBlU3BhbldpdGhWYWx1ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgZUNlbGxXcmFwcGVyLmFwcGVuZENoaWxkKGVTcGFuV2l0aFZhbHVlKTtcclxuICAgIHRoaXMucHV0RGF0YUludG9DZWxsKGNvbERlZiwgdmFsdWUsIG5vZGUsICRjaGlsZFNjb3BlLCBlU3BhbldpdGhWYWx1ZSwgcm93SW5kZXgpO1xyXG5cclxuICAgIGlmIChjb2xEZWYuY2VsbFN0eWxlKSB7XHJcbiAgICAgICAgdmFyIGNzc1RvVXNlO1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29sRGVmLmNlbGxTdHlsZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB2YXIgY2VsbFN0eWxlUGFyYW1zID0ge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAgICAgJHNjb3BlOiAkY2hpbGRTY29wZSxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKSxcclxuICAgICAgICAgICAgICAgIGdyaWRPcHRpb25zOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcmlkT3B0aW9ucygpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNzc1RvVXNlID0gY29sRGVmLmNlbGxTdHlsZShjZWxsU3R5bGVQYXJhbXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNzc1RvVXNlID0gY29sRGVmLmNlbGxTdHlsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjc3NUb1VzZSkge1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjc3NUb1VzZSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgICAgIGVHcmlkQ2VsbC5zdHlsZVtrZXldID0gY3NzVG9Vc2Vba2V5XTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChjb2xEZWYuY2VsbENsYXNzKSB7XHJcbiAgICAgICAgdmFyIGNsYXNzVG9Vc2U7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb2xEZWYuY2VsbENsYXNzID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHZhciBjZWxsQ2xhc3NQYXJhbXMgPSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgICAgICAgICAkc2NvcGU6ICRjaGlsZFNjb3BlLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpLFxyXG4gICAgICAgICAgICAgICAgZ3JpZE9wdGlvbnM6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEdyaWRPcHRpb25zKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY2xhc3NUb1VzZSA9IGNvbERlZi5jZWxsQ2xhc3MoY2VsbENsYXNzUGFyYW1zKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjbGFzc1RvVXNlID0gY29sRGVmLmNlbGxDbGFzcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgY2xhc3NUb1VzZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdXRpbHMuYWRkQ3NzQ2xhc3MoZUdyaWRDZWxsLCBjbGFzc1RvVXNlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoY2xhc3NUb1VzZSkpIHtcclxuICAgICAgICAgICAgY2xhc3NUb1VzZS5mb3JFYWNoKGZ1bmN0aW9uKGNzc0NsYXNzSXRlbSkge1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuYWRkQ3NzQ2xhc3MoZUdyaWRDZWxsLCBjc3NDbGFzc0l0ZW0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hZGRDZWxsQ2xpY2tlZEhhbmRsZXIoZUdyaWRDZWxsLCBub2RlLCBjb2x1bW4sIHZhbHVlLCByb3dJbmRleCk7XHJcbiAgICB0aGlzLmFkZENlbGxEb3VibGVDbGlja2VkSGFuZGxlcihlR3JpZENlbGwsIG5vZGUsIGNvbHVtbiwgdmFsdWUsIHJvd0luZGV4LCAkY2hpbGRTY29wZSk7XHJcblxyXG4gICAgZUdyaWRDZWxsLnN0eWxlLndpZHRoID0gdXRpbHMuZm9ybWF0V2lkdGgoY29sdW1uLmFjdHVhbFdpZHRoKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlICdzdGFydCBlZGl0aW5nJyBjYWxsIHRvIHRoZSBjaGFpbiBvZiBlZGl0b3JzXHJcbiAgICB0aGlzLnJlbmRlcmVkUm93U3RhcnRFZGl0aW5nTGlzdGVuZXJzW3Jvd0luZGV4XVtjb2x1bW4uaW5kZXhdID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKHRoYXQuaXNDZWxsRWRpdGFibGUoY29sRGVmLCBub2RlKSkge1xyXG4gICAgICAgICAgICB0aGF0LnN0YXJ0RWRpdGluZyhlR3JpZENlbGwsIGNvbHVtbiwgbm9kZSwgJGNoaWxkU2NvcGUsIHJvd0luZGV4KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIGVHcmlkQ2VsbDtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5hZGRDZWxsRG91YmxlQ2xpY2tlZEhhbmRsZXIgPSBmdW5jdGlvbihlR3JpZENlbGwsIG5vZGUsIGNvbHVtbiwgdmFsdWUsIHJvd0luZGV4LCAkY2hpbGRTY29wZSkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcbiAgICBlR3JpZENlbGwuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxEb3VibGVDbGlja2VkKCkpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmFtc0ZvckdyaWQgPSB7XHJcbiAgICAgICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgcm93SW5kZXg6IHJvd0luZGV4LFxyXG4gICAgICAgICAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgICAgICAgICBldmVudDogZXZlbnQsXHJcbiAgICAgICAgICAgICAgICBldmVudFNvdXJjZTogdGhpcyxcclxuICAgICAgICAgICAgICAgIGdyaWRPcHRpb25zOiB0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcmlkT3B0aW9ucygpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxEb3VibGVDbGlja2VkKCkocGFyYW1zRm9yR3JpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb2xEZWYuY2VsbERvdWJsZUNsaWNrZWQpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmFtc0ZvckNvbERlZiA9IHtcclxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudCxcclxuICAgICAgICAgICAgICAgIGV2ZW50U291cmNlOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgZ3JpZE9wdGlvbnM6IHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEdyaWRPcHRpb25zKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29sRGVmLmNlbGxEb3VibGVDbGlja2VkKHBhcmFtc0ZvckNvbERlZik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGF0LmlzQ2VsbEVkaXRhYmxlKGNvbERlZiwgbm9kZSkpIHtcclxuICAgICAgICAgICAgdGhhdC5zdGFydEVkaXRpbmcoZUdyaWRDZWxsLCBjb2x1bW4sIG5vZGUsICRjaGlsZFNjb3BlLCByb3dJbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuYWRkQ2VsbENsaWNrZWRIYW5kbGVyID0gZnVuY3Rpb24oZUdyaWRDZWxsLCBub2RlLCBjb2xEZWZXcmFwcGVyLCB2YWx1ZSwgcm93SW5kZXgpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHZhciBjb2xEZWYgPSBjb2xEZWZXcmFwcGVyLmNvbERlZjtcclxuICAgIGVHcmlkQ2VsbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBpZiAodGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q2VsbENsaWNrZWQoKSkge1xyXG4gICAgICAgICAgICB2YXIgcGFyYW1zRm9yR3JpZCA9IHtcclxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudCxcclxuICAgICAgICAgICAgICAgIGV2ZW50U291cmNlOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgZ3JpZE9wdGlvbnM6IHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEdyaWRPcHRpb25zKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q2VsbENsaWNrZWQoKShwYXJhbXNGb3JHcmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbERlZi5jZWxsQ2xpY2tlZCkge1xyXG4gICAgICAgICAgICB2YXIgcGFyYW1zRm9yQ29sRGVmID0ge1xyXG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgICAgICAgICAgZXZlbnRTb3VyY2U6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBncmlkT3B0aW9uczogdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0R3JpZE9wdGlvbnMoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb2xEZWYuY2VsbENsaWNrZWQocGFyYW1zRm9yQ29sRGVmKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5pc0NlbGxFZGl0YWJsZSA9IGZ1bmN0aW9uKGNvbERlZiwgbm9kZSkge1xyXG4gICAgaWYgKHRoaXMuZWRpdGluZ0NlbGwpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbmV2ZXIgYWxsb3cgZWRpdGluZyBvZiBncm91cHNcclxuICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGJvb2xlYW4gc2V0LCB0aGVuIGp1c3QgdXNlIGl0XHJcbiAgICBpZiAodHlwZW9mIGNvbERlZi5lZGl0YWJsZSA9PT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgcmV0dXJuIGNvbERlZi5lZGl0YWJsZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBmdW5jdGlvbiwgdGhlbiBjYWxsIHRoZSBmdW5jdGlvbiB0byBmaW5kIG91dFxyXG4gICAgaWYgKHR5cGVvZiBjb2xEZWYuZWRpdGFibGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAvLyBzaG91bGQgY2hhbmdlIHRoaXMsIHNvIGl0IGdldHMgcGFzc2VkIHBhcmFtcyB3aXRoIG5pY2UgdXNlZnVsIHZhbHVlc1xyXG4gICAgICAgIHJldHVybiBjb2xEZWYuZWRpdGFibGUobm9kZS5kYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuc3RvcEVkaXRpbmcgPSBmdW5jdGlvbihlR3JpZENlbGwsIGNvbERlZiwgbm9kZSwgJGNoaWxkU2NvcGUsIGVJbnB1dCwgYmx1ckxpc3RlbmVyLCByb3dJbmRleCkge1xyXG4gICAgdGhpcy5lZGl0aW5nQ2VsbCA9IGZhbHNlO1xyXG4gICAgdmFyIG5ld1ZhbHVlID0gZUlucHV0LnZhbHVlO1xyXG5cclxuICAgIC8vSWYgd2UgZG9uJ3QgcmVtb3ZlIHRoZSBibHVyIGxpc3RlbmVyIGZpcnN0LCB3ZSBnZXQ6XHJcbiAgICAvL1VuY2F1Z2h0IE5vdEZvdW5kRXJyb3I6IEZhaWxlZCB0byBleGVjdXRlICdyZW1vdmVDaGlsZCcgb24gJ05vZGUnOiBUaGUgbm9kZSB0byBiZSByZW1vdmVkIGlzIG5vIGxvbmdlciBhIGNoaWxkIG9mIHRoaXMgbm9kZS4gUGVyaGFwcyBpdCB3YXMgbW92ZWQgaW4gYSAnYmx1cicgZXZlbnQgaGFuZGxlcj9cclxuICAgIGVJbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgYmx1ckxpc3RlbmVyKTtcclxuXHJcbiAgICB1dGlscy5yZW1vdmVBbGxDaGlsZHJlbihlR3JpZENlbGwpO1xyXG5cclxuICAgIHZhciBwYXJhbXNGb3JDYWxsYmFja3MgPSB7XHJcbiAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgb2xkVmFsdWU6IG5vZGUuZGF0YVtjb2xEZWYuZmllbGRdLFxyXG4gICAgICAgIG5ld1ZhbHVlOiBuZXdWYWx1ZSxcclxuICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpLFxyXG4gICAgICAgIGdyaWRPcHRpb25zOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcmlkT3B0aW9ucygpXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChjb2xEZWYubmV3VmFsdWVIYW5kbGVyKSB7XHJcbiAgICAgICAgY29sRGVmLm5ld1ZhbHVlSGFuZGxlcihwYXJhbXNGb3JDYWxsYmFja3MpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBub2RlLmRhdGFbY29sRGVmLmZpZWxkXSA9IG5ld1ZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGF0IHRoaXMgcG9pbnQsIHRoZSB2YWx1ZSBoYXMgYmVlbiB1cGRhdGVkXHJcbiAgICBwYXJhbXNGb3JDYWxsYmFja3MubmV3VmFsdWUgPSBub2RlLmRhdGFbY29sRGVmLmZpZWxkXTtcclxuICAgIGlmICh0eXBlb2YgY29sRGVmLmNlbGxWYWx1ZUNoYW5nZWQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBjb2xEZWYuY2VsbFZhbHVlQ2hhbmdlZChwYXJhbXNGb3JDYWxsYmFja3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB2YWx1ZSA9IG5vZGUuZGF0YVtjb2xEZWYuZmllbGRdO1xyXG4gICAgdGhpcy5wdXREYXRhSW50b0NlbGwoY29sRGVmLCB2YWx1ZSwgbm9kZSwgJGNoaWxkU2NvcGUsIGVHcmlkQ2VsbCk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuc3RhcnRFZGl0aW5nID0gZnVuY3Rpb24oZUdyaWRDZWxsLCBjb2x1bW4sIG5vZGUsICRjaGlsZFNjb3BlLCByb3dJbmRleCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcbiAgICB0aGlzLmVkaXRpbmdDZWxsID0gdHJ1ZTtcclxuICAgIHV0aWxzLnJlbW92ZUFsbENoaWxkcmVuKGVHcmlkQ2VsbCk7XHJcbiAgICB2YXIgZUlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgIGVJbnB1dC50eXBlID0gJ3RleHQnO1xyXG4gICAgdXRpbHMuYWRkQ3NzQ2xhc3MoZUlucHV0LCAnYWctY2VsbC1lZGl0LWlucHV0Jyk7XHJcblxyXG4gICAgdmFyIHZhbHVlID0gbm9kZS5kYXRhW2NvbERlZi5maWVsZF07XHJcbiAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGVJbnB1dC52YWx1ZSA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGVJbnB1dC5zdHlsZS53aWR0aCA9IChjb2x1bW4uYWN0dWFsV2lkdGggLSAxNCkgKyAncHgnO1xyXG4gICAgZUdyaWRDZWxsLmFwcGVuZENoaWxkKGVJbnB1dCk7XHJcbiAgICBlSW5wdXQuZm9jdXMoKTtcclxuICAgIGVJbnB1dC5zZWxlY3QoKTtcclxuXHJcbiAgICB2YXIgYmx1ckxpc3RlbmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhhdC5zdG9wRWRpdGluZyhlR3JpZENlbGwsIGNvbERlZiwgbm9kZSwgJGNoaWxkU2NvcGUsIGVJbnB1dCwgYmx1ckxpc3RlbmVyLCByb3dJbmRleCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vc3RvcCBlbnRlcmluZyBpZiB3ZSBsb29zZSBmb2N1c1xyXG4gICAgZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIGJsdXJMaXN0ZW5lcik7XHJcblxyXG4gICAgLy9zdG9wIGVkaXRpbmcgaWYgZW50ZXIgcHJlc3NlZFxyXG4gICAgZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICB2YXIga2V5ID0gZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZTtcclxuICAgICAgICAvLyAxMyBpcyBlbnRlclxyXG4gICAgICAgIGlmIChrZXkgPT0gRU5URVJfS0VZKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc3RvcEVkaXRpbmcoZUdyaWRDZWxsLCBjb2xEZWYsIG5vZGUsICRjaGlsZFNjb3BlLCBlSW5wdXQsIGJsdXJMaXN0ZW5lciwgcm93SW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIHRhYiBrZXkgZG9lc24ndCBnZW5lcmF0ZSBrZXlwcmVzcywgc28gbmVlZCBrZXlkb3duIHRvIGxpc3RlbiBmb3IgdGhhdFxyXG4gICAgZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIHZhciBrZXkgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlO1xyXG4gICAgICAgIGlmIChrZXkgPT0gVEFCX0tFWSkge1xyXG4gICAgICAgICAgICB0aGF0LnN0b3BFZGl0aW5nKGVHcmlkQ2VsbCwgY29sRGVmLCBub2RlLCAkY2hpbGRTY29wZSwgZUlucHV0LCBibHVyTGlzdGVuZXIsIHJvd0luZGV4KTtcclxuICAgICAgICAgICAgdGhhdC5zdGFydEVkaXRpbmdOZXh0Q2VsbChyb3dJbmRleCwgY29sdW1uLCBldmVudC5zaGlmdEtleSk7XHJcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IHdhbnQgdGhlIGRlZmF1bHQgdGFiIGFjdGlvbiwgc28gcmV0dXJuIGZhbHNlLCB0aGlzIHN0b3BzIHRoZSBldmVudCBmcm9tIGJ1YmJsaW5nXHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zdGFydEVkaXRpbmdOZXh0Q2VsbCA9IGZ1bmN0aW9uKHJvd0luZGV4LCBjb2x1bW4sIHNoaWZ0S2V5KSB7XHJcblxyXG4gICAgdmFyIGZpcnN0Um93VG9DaGVjayA9IHRoaXMuZmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3c7XHJcbiAgICB2YXIgbGFzdFJvd1RvQ2hlY2sgPSB0aGlzLmxhc3RWaXJ0dWFsUmVuZGVyZWRSb3c7XHJcbiAgICB2YXIgY3VycmVudFJvd0luZGV4ID0gcm93SW5kZXg7XHJcblxyXG4gICAgdmFyIHZpc2libGVDb2x1bW5zID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRWaXNpYmxlQ29sdW1ucygpO1xyXG4gICAgdmFyIGN1cnJlbnRDb2wgPSBjb2x1bW47XHJcblxyXG4gICAgd2hpbGUgKHRydWUpIHtcclxuXHJcbiAgICAgICAgdmFyIGluZGV4T2ZDdXJyZW50Q29sID0gdmlzaWJsZUNvbHVtbnMuaW5kZXhPZihjdXJyZW50Q29sKTtcclxuXHJcbiAgICAgICAgLy8gbW92ZSBiYWNrd2FyZFxyXG4gICAgICAgIGlmIChzaGlmdEtleSkge1xyXG4gICAgICAgICAgICAvLyBtb3ZlIGFsb25nIHRvIHRoZSBwcmV2aW91cyBjZWxsXHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2wgPSB2aXNpYmxlQ29sdW1uc1tpbmRleE9mQ3VycmVudENvbCAtIDFdO1xyXG4gICAgICAgICAgICAvLyBjaGVjayBpZiBlbmQgb2YgdGhlIHJvdywgYW5kIGlmIHNvLCBnbyBiYWNrIGEgcm93XHJcbiAgICAgICAgICAgIGlmICghY3VycmVudENvbCkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudENvbCA9IHZpc2libGVDb2x1bW5zW3Zpc2libGVDb2x1bW5zLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFJvd0luZGV4LS07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGlmIGdvdCB0byBlbmQgb2YgcmVuZGVyZWQgcm93cywgdGhlbiBxdWl0IGxvb2tpbmdcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRSb3dJbmRleCA8IGZpcnN0Um93VG9DaGVjaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIG1vdmUgZm9yd2FyZFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIG1vdmUgYWxvbmcgdG8gdGhlIG5leHQgY2VsbFxyXG4gICAgICAgICAgICBjdXJyZW50Q29sID0gdmlzaWJsZUNvbHVtbnNbaW5kZXhPZkN1cnJlbnRDb2wgKyAxXTtcclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgZW5kIG9mIHRoZSByb3csIGFuZCBpZiBzbywgZ28gZm9yd2FyZCBhIHJvd1xyXG4gICAgICAgICAgICBpZiAoIWN1cnJlbnRDb2wpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRDb2wgPSB2aXNpYmxlQ29sdW1uc1swXTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRSb3dJbmRleCsrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBnb3QgdG8gZW5kIG9mIHJlbmRlcmVkIHJvd3MsIHRoZW4gcXVpdCBsb29raW5nXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50Um93SW5kZXggPiBsYXN0Um93VG9DaGVjaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgbmV4dEZ1bmMgPSB0aGlzLnJlbmRlcmVkUm93U3RhcnRFZGl0aW5nTGlzdGVuZXJzW2N1cnJlbnRSb3dJbmRleF1bY3VycmVudENvbC5jb2xLZXldO1xyXG4gICAgICAgIGlmIChuZXh0RnVuYykge1xyXG4gICAgICAgICAgICAvLyBzZWUgaWYgdGhlIG5leHQgY2VsbCBpcyBlZGl0YWJsZSwgYW5kIGlmIHNvLCB3ZSBoYXZlIGNvbWUgdG9cclxuICAgICAgICAgICAgLy8gdGhlIGVuZCBvZiBvdXIgc2VhcmNoLCBzbyBzdG9wIGxvb2tpbmcgZm9yIHRoZSBuZXh0IGNlbGxcclxuICAgICAgICAgICAgdmFyIG5leHRDZWxsQWNjZXB0ZWRFZGl0ID0gbmV4dEZ1bmMoKTtcclxuICAgICAgICAgICAgaWYgKG5leHRDZWxsQWNjZXB0ZWRFZGl0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSb3dSZW5kZXJlcjtcclxuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG5cclxuLy8gdGhlc2UgY29uc3RhbnRzIGFyZSB1c2VkIGZvciBkZXRlcm1pbmluZyBpZiBncm91cHMgc2hvdWxkXHJcbi8vIGJlIHNlbGVjdGVkIG9yIGRlc2VsZWN0ZWQgd2hlbiBzZWxlY3RpbmcgZ3JvdXBzLCBhbmQgdGhlIGdyb3VwXHJcbi8vIHRoZW4gc2VsZWN0cyB0aGUgY2hpbGRyZW4uXHJcbnZhciBTRUxFQ1RFRCA9IDA7XHJcbnZhciBVTlNFTEVDVEVEID0gMTtcclxudmFyIE1JWEVEID0gMjtcclxudmFyIERPX05PVF9DQVJFID0gMztcclxuXHJcbmZ1bmN0aW9uIFNlbGVjdGlvbkNvbnRyb2xsZXIoKSB7fVxyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGFuZ3VsYXJHcmlkLCBlUm93c1BhcmVudCwgZ3JpZE9wdGlvbnNXcmFwcGVyLCAkc2NvcGUsIHJvd1JlbmRlcmVyKSB7XHJcbiAgICB0aGlzLmVSb3dzUGFyZW50ID0gZVJvd3NQYXJlbnQ7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkID0gYW5ndWxhckdyaWQ7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHRoaXMuJHNjb3BlID0gJHNjb3BlO1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlciA9IHJvd1JlbmRlcmVyO1xyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWQgPSB7fTtcclxuICAgIHRoaXMuc2VsZWN0ZWRSb3dzID0gW107XHJcblxyXG4gICAgZ3JpZE9wdGlvbnNXcmFwcGVyLnNldFNlbGVjdGVkUm93cyh0aGlzLnNlbGVjdGVkUm93cyk7XHJcbiAgICBncmlkT3B0aW9uc1dyYXBwZXIuc2V0U2VsZWN0ZWROb2Rlc0J5SWQodGhpcy5zZWxlY3RlZE5vZGVzQnlJZCk7XHJcbn07XHJcblxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5nZXRTZWxlY3RlZE5vZGVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2VsZWN0ZWROb2RlcyA9IFtdO1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBpZCA9IGtleXNbaV07XHJcbiAgICAgICAgdmFyIHNlbGVjdGVkTm9kZSA9IHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRbaWRdO1xyXG4gICAgICAgIHNlbGVjdGVkTm9kZXMucHVzaChzZWxlY3RlZE5vZGUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlbGVjdGVkTm9kZXM7XHJcbn07XHJcblxyXG4vLyByZXR1cm5zIGEgbGlzdCBvZiBhbGwgbm9kZXMgYXQgJ2Jlc3QgY29zdCcgLSBhIGZlYXR1cmUgdG8gYmUgdXNlZFxyXG4vLyB3aXRoIGdyb3VwcyAvIHRyZWVzLiBpZiBhIGdyb3VwIGhhcyBhbGwgaXQncyBjaGlsZHJlbiBzZWxlY3RlZCxcclxuLy8gdGhlbiB0aGUgZ3JvdXAgYXBwZWFycyBpbiB0aGUgcmVzdWx0LCBidXQgbm90IHRoZSBjaGlsZHJlbi5cclxuLy8gRGVzaWduZWQgZm9yIHVzZSB3aXRoICdjaGlsZHJlbicgYXMgdGhlIGdyb3VwIHNlbGVjdGlvbiB0eXBlLFxyXG4vLyB3aGVyZSBncm91cHMgZG9uJ3QgYWN0dWFsbHkgYXBwZWFyIGluIHRoZSBzZWxlY3Rpb24gbm9ybWFsbHkuXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmdldEJlc3RDb3N0Tm9kZVNlbGVjdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciB0b3BMZXZlbE5vZGVzID0gdGhpcy5yb3dNb2RlbC5nZXRUb3BMZXZlbE5vZGVzKCk7XHJcblxyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIC8vIHJlY3Vyc2l2ZSBmdW5jdGlvbiwgdG8gZmluZCB0aGUgc2VsZWN0ZWQgbm9kZXNcclxuICAgIGZ1bmN0aW9uIHRyYXZlcnNlKG5vZGVzKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBub2Rlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICAgICAgaWYgKHRoYXQuaXNOb2RlU2VsZWN0ZWQobm9kZSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5vZGUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgbm90IHNlbGVjdGVkLCB0aGVuIGlmIGl0J3MgYSBncm91cCwgYW5kIHRoZSBncm91cFxyXG4gICAgICAgICAgICAgICAgLy8gaGFzIGNoaWxkcmVuLCBjb250aW51ZSB0byBzZWFyY2ggZm9yIHNlbGVjdGlvbnNcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmF2ZXJzZShub2RlLmNoaWxkcmVuKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0cmF2ZXJzZSh0b3BMZXZlbE5vZGVzKTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuc2V0Um93TW9kZWwgPSBmdW5jdGlvbihyb3dNb2RlbCkge1xyXG4gICAgdGhpcy5yb3dNb2RlbCA9IHJvd01vZGVsO1xyXG59O1xyXG5cclxuLy8gcHVibGljIC0gdGhpcyBjbGVhcnMgdGhlIHNlbGVjdGlvbiwgYnV0IGRvZXNuJ3QgY2xlYXIgZG93biB0aGUgY3NzIC0gd2hlbiBpdCBpcyBjYWxsZWQsIHRoZVxyXG4vLyBjYWxsZXIgdGhlbiBnZXRzIHRoZSBncmlkIHRvIHJlZnJlc2guXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmNsZWFyU2VsZWN0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNlbGVjdGVkUm93cy5sZW5ndGggPSAwO1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW2tleXNbaV1dO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHVibGljXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnNlbGVjdE5vZGUgPSBmdW5jdGlvbihub2RlLCB0cnlNdWx0aSwgc3VwcHJlc3NFdmVudHMpIHtcclxuICAgIHZhciBtdWx0aVNlbGVjdCA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzUm93U2VsZWN0aW9uTXVsdGkoKSAmJiB0cnlNdWx0aTtcclxuXHJcbiAgICAvLyBpZiB0aGUgbm9kZSBpcyBhIGdyb3VwLCB0aGVuIHNlbGVjdGluZyB0aGlzIGlzIHRoZSBzYW1lIGFzIHNlbGVjdGluZyB0aGUgcGFyZW50LFxyXG4gICAgLy8gc28gdG8gaGF2ZSBvbmx5IG9uZSBmbG93IHRocm91Z2ggdGhlIGJlbG93LCB3ZSBhbHdheXMgc2VsZWN0IHRoZSBoZWFkZXIgcGFyZW50XHJcbiAgICAvLyAod2hpY2ggdGhlbiBoYXMgdGhlIHNpZGUgZWZmZWN0IG9mIHNlbGVjdGluZyB0aGUgY2hpbGQpLlxyXG4gICAgdmFyIG5vZGVUb1NlbGVjdDtcclxuICAgIGlmIChub2RlLmZvb3Rlcikge1xyXG4gICAgICAgIG5vZGVUb1NlbGVjdCA9IG5vZGUuc2libGluZztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbm9kZVRvU2VsZWN0ID0gbm9kZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhdCB0aGUgZW5kLCBpZiB0aGlzIGlzIHRydWUsIHdlIGluZm9ybSB0aGUgY2FsbGJhY2tcclxuICAgIHZhciBhdExlYXN0T25lSXRlbVVuc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgIHZhciBhdExlYXN0T25lSXRlbVNlbGVjdGVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gc2VlIGlmIHJvd3MgdG8gYmUgZGVzZWxlY3RlZFxyXG4gICAgaWYgKCFtdWx0aVNlbGVjdCkge1xyXG4gICAgICAgIGF0TGVhc3RPbmVJdGVtVW5zZWxlY3RlZCA9IHRoaXMuZG9Xb3JrT2ZEZXNlbGVjdEFsbE5vZGVzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBDaGVja2JveFNlbGVjdGlvbkNoaWxkcmVuKCkgJiYgbm9kZVRvU2VsZWN0Lmdyb3VwKSB7XHJcbiAgICAgICAgLy8gZG9uJ3Qgc2VsZWN0IHRoZSBncm91cCwgc2VsZWN0IHRoZSBjaGlsZHJlbiBpbnN0ZWFkXHJcbiAgICAgICAgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCA9IHRoaXMucmVjdXJzaXZlbHlTZWxlY3RBbGxDaGlsZHJlbihub2RlVG9TZWxlY3QpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBzZWUgaWYgcm93IG5lZWRzIHRvIGJlIHNlbGVjdGVkXHJcbiAgICAgICAgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCA9IHRoaXMuZG9Xb3JrT2ZTZWxlY3ROb2RlKG5vZGVUb1NlbGVjdCwgc3VwcHJlc3NFdmVudHMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhdExlYXN0T25lSXRlbVVuc2VsZWN0ZWQgfHwgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCkge1xyXG4gICAgICAgIHRoaXMuc3luY1NlbGVjdGVkUm93c0FuZENhbGxMaXN0ZW5lcihzdXBwcmVzc0V2ZW50cyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51cGRhdGVHcm91cFBhcmVudHNJZk5lZWRlZCgpO1xyXG59O1xyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlTZWxlY3RBbGxDaGlsZHJlbiA9IGZ1bmN0aW9uKG5vZGUsIHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICB2YXIgYXRMZWFzdE9uZSA9IGZhbHNlO1xyXG4gICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZWN1cnNpdmVseVNlbGVjdEFsbENoaWxkcmVuKGNoaWxkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0TGVhc3RPbmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZG9Xb3JrT2ZTZWxlY3ROb2RlKGNoaWxkLCBzdXBwcmVzc0V2ZW50cykpIHtcclxuICAgICAgICAgICAgICAgICAgICBhdExlYXN0T25lID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhdExlYXN0T25lO1xyXG59O1xyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlEZXNlbGVjdEFsbENoaWxkcmVuID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5RGVzZWxlY3RBbGxDaGlsZHJlbihjaGlsZCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0UmVhbE5vZGUoY2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyAxIC0gc2VsZWN0cyBhIG5vZGVcclxuLy8gMiAtIHVwZGF0ZXMgdGhlIFVJXHJcbi8vIDMgLSBjYWxscyBjYWxsYmFja3NcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZG9Xb3JrT2ZTZWxlY3ROb2RlID0gZnVuY3Rpb24obm9kZSwgc3VwcHJlc3NFdmVudHMpIHtcclxuICAgIGlmICh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW25vZGUuaWRdKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRbbm9kZS5pZF0gPSBub2RlO1xyXG5cclxuICAgIHRoaXMuYWRkQ3NzQ2xhc3NGb3JOb2RlX2FuZEluZm9ybVZpcnR1YWxSb3dMaXN0ZW5lcihub2RlKTtcclxuXHJcbiAgICAvLyBhbHNvIGNvbG9yIGluIHRoZSBmb290ZXIgaWYgdGhlcmUgaXMgb25lXHJcbiAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmV4cGFuZGVkICYmIG5vZGUuc2libGluZykge1xyXG4gICAgICAgIHRoaXMuYWRkQ3NzQ2xhc3NGb3JOb2RlX2FuZEluZm9ybVZpcnR1YWxSb3dMaXN0ZW5lcihub2RlLnNpYmxpbmcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGluZm9ybSB0aGUgcm93U2VsZWN0ZWQgbGlzdGVuZXIsIGlmIGFueVxyXG4gICAgaWYgKCFzdXBwcmVzc0V2ZW50cyAmJiB0eXBlb2YgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93U2VsZWN0ZWQoKSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93U2VsZWN0ZWQoKShub2RlLmRhdGEsIG5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyAxIC0gc2VsZWN0cyBhIG5vZGVcclxuLy8gMiAtIHVwZGF0ZXMgdGhlIFVJXHJcbi8vIDMgLSBjYWxscyBjYWxsYmFja3NcclxuLy8gd293IC0gd2hhdCBhIGJpZyBuYW1lIGZvciBhIG1ldGhvZCwgZXhjZXB0aW9uIGNhc2UsIGl0J3Mgc2F5aW5nIHdoYXQgdGhlIG1ldGhvZCBkb2VzXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmFkZENzc0NsYXNzRm9yTm9kZV9hbmRJbmZvcm1WaXJ0dWFsUm93TGlzdGVuZXIgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICB2YXIgdmlydHVhbFJlbmRlcmVkUm93SW5kZXggPSB0aGlzLnJvd1JlbmRlcmVyLmdldEluZGV4T2ZSZW5kZXJlZE5vZGUobm9kZSk7XHJcbiAgICBpZiAodmlydHVhbFJlbmRlcmVkUm93SW5kZXggPj0gMCkge1xyXG4gICAgICAgIHV0aWxzLnF1ZXJ5U2VsZWN0b3JBbGxfYWRkQ3NzQ2xhc3ModGhpcy5lUm93c1BhcmVudCwgJ1tyb3c9XCInICsgdmlydHVhbFJlbmRlcmVkUm93SW5kZXggKyAnXCJdJywgJ2FnLXJvdy1zZWxlY3RlZCcpO1xyXG5cclxuICAgICAgICAvLyBpbmZvcm0gdmlydHVhbCByb3cgbGlzdGVuZXJcclxuICAgICAgICB0aGlzLmFuZ3VsYXJHcmlkLm9uVmlydHVhbFJvd1NlbGVjdGVkKHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4LCB0cnVlKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuLy8gMSAtIHVuLXNlbGVjdHMgYSBub2RlXHJcbi8vIDIgLSB1cGRhdGVzIHRoZSBVSVxyXG4vLyAzIC0gY2FsbHMgY2FsbGJhY2tzXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmRvV29ya09mRGVzZWxlY3RBbGxOb2RlcyA9IGZ1bmN0aW9uKG5vZGVUb0tlZXBTZWxlY3RlZCkge1xyXG4gICAgLy8gbm90IGRvaW5nIG11bHRpLXNlbGVjdCwgc28gZGVzZWxlY3QgZXZlcnl0aGluZyBvdGhlciB0aGFuIHRoZSAnanVzdCBzZWxlY3RlZCcgcm93XHJcbiAgICB2YXIgYXRMZWFzdE9uZVNlbGVjdGlvbkNoYW5nZTtcclxuICAgIHZhciBzZWxlY3RlZE5vZGVLZXlzID0gT2JqZWN0LmtleXModGhpcy5zZWxlY3RlZE5vZGVzQnlJZCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGVkTm9kZUtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAvLyBza2lwIHRoZSAnanVzdCBzZWxlY3RlZCcgcm93XHJcbiAgICAgICAgdmFyIGtleSA9IHNlbGVjdGVkTm9kZUtleXNbaV07XHJcbiAgICAgICAgdmFyIG5vZGVUb0Rlc2VsZWN0ID0gdGhpcy5zZWxlY3RlZE5vZGVzQnlJZFtrZXldO1xyXG4gICAgICAgIGlmIChub2RlVG9EZXNlbGVjdCA9PT0gbm9kZVRvS2VlcFNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RSZWFsTm9kZShub2RlVG9EZXNlbGVjdCk7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVTZWxlY3Rpb25DaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhdExlYXN0T25lU2VsZWN0aW9uQ2hhbmdlO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5kZXNlbGVjdFJlYWxOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgLy8gZGVzZWxlY3QgdGhlIGNzc1xyXG4gICAgdGhpcy5yZW1vdmVDc3NDbGFzc0Zvck5vZGUobm9kZSk7XHJcblxyXG4gICAgLy8gaWYgbm9kZSBpcyBhIGhlYWRlciwgYW5kIGlmIGl0IGhhcyBhIHNpYmxpbmcgZm9vdGVyLCBkZXNlbGVjdCB0aGUgZm9vdGVyIGFsc29cclxuICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuZXhwYW5kZWQgJiYgbm9kZS5zaWJsaW5nKSB7IC8vIGFsc28gY2hlY2sgdGhhdCBpdCdzIGV4cGFuZGVkLCBhcyBzaWJsaW5nIGNvdWxkIGJlIGEgZ2hvc3RcclxuICAgICAgICB0aGlzLnJlbW92ZUNzc0NsYXNzRm9yTm9kZShub2RlLnNpYmxpbmcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlbW92ZSB0aGUgcm93XHJcbiAgICBkZWxldGUgdGhpcy5zZWxlY3RlZE5vZGVzQnlJZFtub2RlLmlkXTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucmVtb3ZlQ3NzQ2xhc3NGb3JOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ID0gdGhpcy5yb3dSZW5kZXJlci5nZXRJbmRleE9mUmVuZGVyZWROb2RlKG5vZGUpO1xyXG4gICAgaWYgKHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ID49IDApIHtcclxuICAgICAgICB1dGlscy5xdWVyeVNlbGVjdG9yQWxsX3JlbW92ZUNzc0NsYXNzKHRoaXMuZVJvd3NQYXJlbnQsICdbcm93PVwiJyArIHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ICsgJ1wiXScsICdhZy1yb3ctc2VsZWN0ZWQnKTtcclxuICAgICAgICAvLyBpbmZvcm0gdmlydHVhbCByb3cgbGlzdGVuZXJcclxuICAgICAgICB0aGlzLmFuZ3VsYXJHcmlkLm9uVmlydHVhbFJvd1NlbGVjdGVkKHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4LCBmYWxzZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgKHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSlcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZGVzZWxlY3RJbmRleCA9IGZ1bmN0aW9uKHJvd0luZGV4KSB7XHJcbiAgICB2YXIgbm9kZSA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvdyhyb3dJbmRleCk7XHJcbiAgICB0aGlzLmRlc2VsZWN0Tm9kZShub2RlKTtcclxufTtcclxuXHJcbi8vIHB1YmxpYyAoYXBpKVxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5kZXNlbGVjdE5vZGUgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICBpZiAobm9kZSkge1xyXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwQ2hlY2tib3hTZWxlY3Rpb25DaGlsZHJlbigpICYmIG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgLy8gd2FudCB0byBkZXNlbGVjdCBjaGlsZHJlbiwgbm90IHRoaXMgbm9kZSwgc28gcmVjdXJzaXZlbHkgZGVzZWxlY3RcclxuICAgICAgICAgICAgdGhpcy5yZWN1cnNpdmVseURlc2VsZWN0QWxsQ2hpbGRyZW4obm9kZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kZXNlbGVjdFJlYWxOb2RlKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuc3luY1NlbGVjdGVkUm93c0FuZENhbGxMaXN0ZW5lcigpO1xyXG4gICAgdGhpcy51cGRhdGVHcm91cFBhcmVudHNJZk5lZWRlZCgpO1xyXG59O1xyXG5cclxuLy8gcHVibGljIChzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkgJiBhcGkpXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnNlbGVjdEluZGV4ID0gZnVuY3Rpb24oaW5kZXgsIHRyeU11bHRpLCBzdXBwcmVzc0V2ZW50cykge1xyXG4gICAgdmFyIG5vZGUgPSB0aGlzLnJvd01vZGVsLmdldFZpcnR1YWxSb3coaW5kZXgpO1xyXG4gICAgdGhpcy5zZWxlY3ROb2RlKG5vZGUsIHRyeU11bHRpLCBzdXBwcmVzc0V2ZW50cyk7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbi8vIHVwZGF0ZXMgdGhlIHNlbGVjdGVkUm93cyB3aXRoIHRoZSBzZWxlY3RlZE5vZGVzIGFuZCBjYWxscyBzZWxlY3Rpb25DaGFuZ2VkIGxpc3RlbmVyXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnN5bmNTZWxlY3RlZFJvd3NBbmRDYWxsTGlzdGVuZXIgPSBmdW5jdGlvbihzdXBwcmVzc0V2ZW50cykge1xyXG4gICAgLy8gdXBkYXRlIHNlbGVjdGVkIHJvd3NcclxuICAgIHZhciBzZWxlY3RlZFJvd3MgPSB0aGlzLnNlbGVjdGVkUm93cztcclxuICAgIC8vIGNsZWFyIHNlbGVjdGVkIHJvd3NcclxuICAgIHNlbGVjdGVkUm93cy5sZW5ndGggPSAwO1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW2tleXNbaV1dICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkTm9kZSA9IHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRba2V5c1tpXV07XHJcbiAgICAgICAgICAgIHNlbGVjdGVkUm93cy5wdXNoKHNlbGVjdGVkTm9kZS5kYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFzdXBwcmVzc0V2ZW50cyAmJiB0eXBlb2YgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0U2VsZWN0aW9uQ2hhbmdlZCgpID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRTZWxlY3Rpb25DaGFuZ2VkKCkoKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQuJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgfSwgMCk7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnJlY3Vyc2l2ZWx5Q2hlY2tJZlNlbGVjdGVkID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIGZvdW5kU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgIHZhciBmb3VuZFVuc2VsZWN0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAobm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQuZ3JvdXApIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMucmVjdXJzaXZlbHlDaGVja0lmU2VsZWN0ZWQoY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFNFTEVDVEVEOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZFNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBVTlNFTEVDVEVEOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZFVuc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIE1JWEVEOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZFNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRVbnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIGNhbiBpZ25vcmUgdGhlIERPX05PVF9DQVJFLCBhcyBpdCBkb2Vzbid0IGltcGFjdCwgbWVhbnMgdGhlIGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGhhcyBubyBjaGlsZHJlbiBhbmQgc2hvdWxkbid0IGJlIGNvbnNpZGVyZWQgd2hlbiBkZWNpZGluZ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNOb2RlU2VsZWN0ZWQoY2hpbGQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmRTZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kVW5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChmb3VuZFNlbGVjdGVkICYmIGZvdW5kVW5zZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgbWl4ZWQsIHRoZW4gbm8gbmVlZCB0byBnbyBmdXJ0aGVyLCBqdXN0IHJldHVybiB1cCB0aGUgY2hhaW5cclxuICAgICAgICAgICAgICAgIHJldHVybiBNSVhFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBnb3QgdGhpcyBmYXIsIHNvIG5vIGNvbmZsaWN0cywgZWl0aGVyIGFsbCBjaGlsZHJlbiBzZWxlY3RlZCwgdW5zZWxlY3RlZCwgb3IgbmVpdGhlclxyXG4gICAgaWYgKGZvdW5kU2VsZWN0ZWQpIHtcclxuICAgICAgICByZXR1cm4gU0VMRUNURUQ7XHJcbiAgICB9IGVsc2UgaWYgKGZvdW5kVW5zZWxlY3RlZCkge1xyXG4gICAgICAgIHJldHVybiBVTlNFTEVDVEVEO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRE9fTk9UX0NBUkU7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgKHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSlcclxuLy8gcmV0dXJuczpcclxuLy8gdHJ1ZTogaWYgc2VsZWN0ZWRcclxuLy8gZmFsc2U6IGlmIHVuc2VsZWN0ZWRcclxuLy8gdW5kZWZpbmVkOiBpZiBpdCdzIGEgZ3JvdXAgYW5kICdjaGlsZHJlbiBzZWxlY3Rpb24nIGlzIHVzZWQgYW5kICdjaGlsZHJlbicgYXJlIGEgbWl4IG9mIHNlbGVjdGVkIGFuZCB1bnNlbGVjdGVkXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmlzTm9kZVNlbGVjdGVkID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBDaGVja2JveFNlbGVjdGlvbkNoaWxkcmVuKCkgJiYgbm9kZS5ncm91cCkge1xyXG4gICAgICAgIC8vIGRvaW5nIGNoaWxkIHNlbGVjdGlvbiwgd2UgbmVlZCB0byB0cmF2ZXJzZSB0aGUgY2hpbGRyZW5cclxuICAgICAgICB2YXIgcmVzdWx0T2ZDaGlsZHJlbiA9IHRoaXMucmVjdXJzaXZlbHlDaGVja0lmU2VsZWN0ZWQobm9kZSk7XHJcbiAgICAgICAgc3dpdGNoIChyZXN1bHRPZkNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgIGNhc2UgU0VMRUNURUQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgY2FzZSBVTlNFTEVDVEVEOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW25vZGUuaWRdICE9PSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbn07XHJcblxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVHcm91cFBhcmVudHNJZk5lZWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gd2Ugb25seSBkbyB0aGlzIGlmIHBhcmVudCBub2RlcyBhcmUgcmVzcG9uc2libGVcclxuICAgIC8vIGZvciBzZWxlY3RpbmcgdGhlaXIgY2hpbGRyZW4uXHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBDaGVja2JveFNlbGVjdGlvbkNoaWxkcmVuKCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGZpcnN0Um93ID0gdGhpcy5yb3dSZW5kZXJlci5nZXRGaXJzdFZpcnR1YWxSZW5kZXJlZFJvdygpO1xyXG4gICAgdmFyIGxhc3RSb3cgPSB0aGlzLnJvd1JlbmRlcmVyLmdldExhc3RWaXJ0dWFsUmVuZGVyZWRSb3coKTtcclxuICAgIGZvciAodmFyIHJvd0luZGV4ID0gZmlyc3RSb3c7IHJvd0luZGV4IDw9IGxhc3RSb3c7IHJvd0luZGV4KyspIHtcclxuICAgICAgICAvLyBzZWUgaWYgbm9kZSBpcyBhIGdyb3VwXHJcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnJvd01vZGVsLmdldFZpcnR1YWxSb3cocm93SW5kZXgpO1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IHRoaXMuaXNOb2RlU2VsZWN0ZWQobm9kZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYW5ndWxhckdyaWQub25WaXJ0dWFsUm93U2VsZWN0ZWQocm93SW5kZXgsIHNlbGVjdGVkKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgdXRpbHMucXVlcnlTZWxlY3RvckFsbF9hZGRDc3NDbGFzcyh0aGlzLmVSb3dzUGFyZW50LCAnW3Jvdz1cIicgKyByb3dJbmRleCArICdcIl0nLCAnYWctcm93LXNlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5xdWVyeVNlbGVjdG9yQWxsX3JlbW92ZUNzc0NsYXNzKHRoaXMuZVJvd3NQYXJlbnQsICdbcm93PVwiJyArIHJvd0luZGV4ICsgJ1wiXScsICdhZy1yb3ctc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0aW9uQ29udHJvbGxlcjtcclxuIiwiZnVuY3Rpb24gU2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5KCkge31cclxuXHJcblNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGFuZ3VsYXJHcmlkLCBzZWxlY3Rpb25Db250cm9sbGVyKSB7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkID0gYW5ndWxhckdyaWQ7XHJcbiAgICB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIgPSBzZWxlY3Rpb25Db250cm9sbGVyO1xyXG59O1xyXG5cclxuU2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LnByb3RvdHlwZS5jcmVhdGVDaGVja2JveENvbERlZiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB3aWR0aDogMzAsXHJcbiAgICAgICAgc3VwcHJlc3NNZW51OiB0cnVlLFxyXG4gICAgICAgIHN1cHByZXNzU29ydGluZzogdHJ1ZSxcclxuICAgICAgICBoZWFkZXJDZWxsUmVuZGVyZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgZUNoZWNrYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgZUNoZWNrYm94LnR5cGUgPSAnY2hlY2tib3gnO1xyXG4gICAgICAgICAgICBlQ2hlY2tib3gubmFtZSA9ICduYW1lJztcclxuICAgICAgICAgICAgcmV0dXJuIGVDaGVja2JveDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNlbGxSZW5kZXJlcjogdGhpcy5jcmVhdGVDaGVja2JveFJlbmRlcmVyKClcclxuICAgIH07XHJcbn07XHJcblxyXG5TZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZUNoZWNrYm94UmVuZGVyZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHJldHVybiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICByZXR1cm4gdGhhdC5jcmVhdGVTZWxlY3Rpb25DaGVja2JveChwYXJhbXMubm9kZSwgcGFyYW1zLnJvd0luZGV4KTtcclxuICAgIH07XHJcbn07XHJcblxyXG5TZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZVNlbGVjdGlvbkNoZWNrYm94ID0gZnVuY3Rpb24obm9kZSwgcm93SW5kZXgpIHtcclxuXHJcbiAgICB2YXIgZUNoZWNrYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgIGVDaGVja2JveC50eXBlID0gXCJjaGVja2JveFwiO1xyXG4gICAgZUNoZWNrYm94Lm5hbWUgPSBcIm5hbWVcIjtcclxuICAgIGVDaGVja2JveC5jbGFzc05hbWUgPSAnYWctc2VsZWN0aW9uLWNoZWNrYm94JztcclxuICAgIHNldENoZWNrYm94U3RhdGUoZUNoZWNrYm94LCB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIuaXNOb2RlU2VsZWN0ZWQobm9kZSkpO1xyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGVDaGVja2JveC5vbmNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIH07XHJcblxyXG4gICAgZUNoZWNrYm94Lm9uY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG5ld1ZhbHVlID0gZUNoZWNrYm94LmNoZWNrZWQ7XHJcbiAgICAgICAgaWYgKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5zZWxlY3RJbmRleChyb3dJbmRleCwgdHJ1ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLmRlc2VsZWN0SW5kZXgocm93SW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5hbmd1bGFyR3JpZC5hZGRWaXJ0dWFsUm93TGlzdGVuZXIocm93SW5kZXgsIHtcclxuICAgICAgICByb3dTZWxlY3RlZDogZnVuY3Rpb24oc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgc2V0Q2hlY2tib3hTdGF0ZShlQ2hlY2tib3gsIHNlbGVjdGVkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJvd1JlbW92ZWQ6IGZ1bmN0aW9uKCkge31cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBlQ2hlY2tib3g7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBzZXRDaGVja2JveFN0YXRlKGVDaGVja2JveCwgc3RhdGUpIHtcclxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09ICdib29sZWFuJykge1xyXG4gICAgICAgIGVDaGVja2JveC5jaGVja2VkID0gc3RhdGU7XHJcbiAgICAgICAgZUNoZWNrYm94LmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gaXNOb2RlU2VsZWN0ZWQgcmV0dXJucyBiYWNrIHVuZGVmaW5lZCBpZiBpdCdzIGEgZ3JvdXAgYW5kIHRoZSBjaGlsZHJlblxyXG4gICAgICAgIC8vIGFyZSBhIG1peCBvZiBzZWxlY3RlZCBhbmQgdW5zZWxlY3RlZFxyXG4gICAgICAgIGVDaGVja2JveC5pbmRldGVybWluYXRlID0gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3Rpb25SZW5kZXJlckZhY3Rvcnk7XHJcbiIsInZhciBTVkdfTlMgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI7XHJcblxyXG5mdW5jdGlvbiBTdmdGYWN0b3J5KCkge31cclxuXHJcblN2Z0ZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZUZpbHRlclN2ZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGVTdmcgPSBjcmVhdGVJY29uU3ZnKCk7XHJcblxyXG4gICAgdmFyIGVGdW5uZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCBcInBvbHlnb25cIik7XHJcbiAgICBlRnVubmVsLnNldEF0dHJpYnV0ZShcInBvaW50c1wiLCBcIjAsMCA0LDQgNCwxMCA2LDEwIDYsNCAxMCwwXCIpO1xyXG4gICAgZUZ1bm5lbC5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcImFnLWhlYWRlci1pY29uXCIpO1xyXG4gICAgZVN2Zy5hcHBlbmRDaGlsZChlRnVubmVsKTtcclxuXHJcbiAgICByZXR1cm4gZVN2ZztcclxufTtcclxuXHJcblN2Z0ZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZU1lbnVTdmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBlU3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgXCJzdmdcIik7XHJcbiAgICB2YXIgc2l6ZSA9IFwiMTJcIjtcclxuICAgIGVTdmcuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgc2l6ZSk7XHJcbiAgICBlU3ZnLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBzaXplKTtcclxuXHJcbiAgICBbXCIwXCIsIFwiNVwiLCBcIjEwXCJdLmZvckVhY2goZnVuY3Rpb24oeSkge1xyXG4gICAgICAgIHZhciBlTGluZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsIFwicmVjdFwiKTtcclxuICAgICAgICBlTGluZS5zZXRBdHRyaWJ1dGUoXCJ5XCIsIHkpO1xyXG4gICAgICAgIGVMaW5lLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIHNpemUpO1xyXG4gICAgICAgIGVMaW5lLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBcIjJcIik7XHJcbiAgICAgICAgZUxpbmUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJhZy1oZWFkZXItaWNvblwiKTtcclxuICAgICAgICBlU3ZnLmFwcGVuZENoaWxkKGVMaW5lKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBlU3ZnO1xyXG59O1xyXG5cclxuU3ZnRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlQXJyb3dVcFN2ZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGNyZWF0ZVBvbHlnb25TdmcoXCIwLDEwIDUsMCAxMCwxMFwiKTtcclxufTtcclxuXHJcblN2Z0ZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZUFycm93TGVmdFN2ZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGNyZWF0ZVBvbHlnb25TdmcoXCIxMCwwIDAsNSAxMCwxMFwiKTtcclxufTtcclxuXHJcblN2Z0ZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZUFycm93RG93blN2ZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGNyZWF0ZVBvbHlnb25TdmcoXCIwLDAgNSwxMCAxMCwwXCIpO1xyXG59O1xyXG5cclxuU3ZnRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlQXJyb3dSaWdodFN2ZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGNyZWF0ZVBvbHlnb25TdmcoXCIwLDAgMTAsNSAwLDEwXCIpO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlUG9seWdvblN2Zyhwb2ludHMpIHtcclxuICAgIHZhciBlU3ZnID0gY3JlYXRlSWNvblN2ZygpO1xyXG5cclxuICAgIHZhciBlRGVzY0ljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCBcInBvbHlnb25cIik7XHJcbiAgICBlRGVzY0ljb24uc2V0QXR0cmlidXRlKFwicG9pbnRzXCIsIHBvaW50cyk7XHJcbiAgICBlU3ZnLmFwcGVuZENoaWxkKGVEZXNjSWNvbik7XHJcblxyXG4gICAgcmV0dXJuIGVTdmc7XHJcbn1cclxuXHJcbi8vIHV0aWwgZnVuY3Rpb24gZm9yIHRoZSBhYm92ZVxyXG5mdW5jdGlvbiBjcmVhdGVJY29uU3ZnKCkge1xyXG4gICAgdmFyIGVTdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCBcInN2Z1wiKTtcclxuICAgIGVTdmcuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgXCIxMFwiKTtcclxuICAgIGVTdmcuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIFwiMTBcIik7XHJcbiAgICByZXR1cm4gZVN2ZztcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTdmdGYWN0b3J5O1xyXG4iLCJ2YXIgdGVtcGxhdGUgPSBbXHJcbiAgICAnPGRpdiBjbGFzcz1cImFnLXJvb3QgYWctc2Nyb2xsc1wiPicsXHJcbiAgICAnICAgIDwhLS0gVGhlIGxvYWRpbmcgcGFuZWwgLS0+JyxcclxuICAgICcgICAgPCEtLSB3cmFwcGluZyBpbiBvdXRlciBkaXYsIGFuZCB3cmFwcGVyLCBpcyBuZWVkZWQgdG8gY2VudGVyIHRoZSBsb2FkaW5nIGljb24gLS0+JyxcclxuICAgICcgICAgPCEtLSBUaGUgaWRlYSBmb3IgY2VudGVyaW5nIGNhbWUgZnJvbSBoZXJlOiBodHRwOi8vd3d3LnZhbnNlb2Rlc2lnbi5jb20vY3NzL3ZlcnRpY2FsLWNlbnRlcmluZy8gLS0+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLWxvYWRpbmctcGFuZWxcIj4nLFxyXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cImFnLWxvYWRpbmctd3JhcHBlclwiPicsXHJcbiAgICAnICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJhZy1sb2FkaW5nLWNlbnRlclwiPkxvYWRpbmcuLi48L3NwYW4+JyxcclxuICAgICcgICAgICAgIDwvZGl2PicsXHJcbiAgICAnICAgIDwvZGl2PicsXHJcbiAgICAnICAgIDwhLS0gaGVhZGVyIC0tPicsXHJcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJhZy1oZWFkZXJcIj4nLFxyXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cImFnLXBpbm5lZC1oZWFkZXJcIj48L2Rpdj48ZGl2IGNsYXNzPVwiYWctaGVhZGVyLXZpZXdwb3J0XCI+PGRpdiBjbGFzcz1cImFnLWhlYWRlci1jb250YWluZXJcIj48L2Rpdj48L2Rpdj4nLFxyXG4gICAgJyAgICA8L2Rpdj4nLFxyXG4gICAgJyAgICA8IS0tIGJvZHkgLS0+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLWJvZHlcIj4nLFxyXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cImFnLXBpbm5lZC1jb2xzLXZpZXdwb3J0XCI+JyxcclxuICAgICcgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWctcGlubmVkLWNvbHMtY29udGFpbmVyXCI+PC9kaXY+JyxcclxuICAgICcgICAgICAgIDwvZGl2PicsXHJcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiYWctYm9keS12aWV3cG9ydC13cmFwcGVyXCI+JyxcclxuICAgICcgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWctYm9keS12aWV3cG9ydFwiPicsXHJcbiAgICAnICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZy1ib2R5LWNvbnRhaW5lclwiPjwvZGl2PicsXHJcbiAgICAnICAgICAgICAgICAgPC9kaXY+JyxcclxuICAgICcgICAgICAgIDwvZGl2PicsXHJcbiAgICAnICAgIDwvZGl2PicsXHJcbiAgICAnICAgIDwhLS0gUGFnaW5nIC0tPicsXHJcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJhZy1wYWdpbmctcGFuZWxcIj4nLFxyXG4gICAgJyAgICA8L2Rpdj4nLFxyXG4gICAgJyAgICA8L2Rpdj4nXHJcbl0uam9pbignJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xyXG4iLCJ2YXIgdGVtcGxhdGUgPSBbXHJcbiAgICAnPGRpdiBjbGFzcz1cImFnLXJvb3QgYWctbm8tc2Nyb2xsc1wiPicsXHJcbiAgICAnICAgIDwhLS0gU2VlIGNvbW1lbnQgaW4gdGVtcGxhdGUuaHRtbCBmb3Igd2h5IGxvYWRpbmcgaXMgbGFpZCBvdXQgbGlrZSBzbyAtLT4nLFxyXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYWctbG9hZGluZy1wYW5lbFwiPicsXHJcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiYWctbG9hZGluZy13cmFwcGVyXCI+JyxcclxuICAgICcgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImFnLWxvYWRpbmctY2VudGVyXCI+TG9hZGluZy4uLjwvc3Bhbj4nLFxyXG4gICAgJyAgICAgICAgPC9kaXY+JyxcclxuICAgICcgICAgPC9kaXY+JyxcclxuICAgICcgICAgPCEtLSBoZWFkZXIgLS0+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLWhlYWRlci1jb250YWluZXJcIj48L2Rpdj4nLFxyXG4gICAgJyAgICA8IS0tIGJvZHkgLS0+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLWJvZHktY29udGFpbmVyXCI+PC9kaXY+JyxcclxuICAgICc8L2Rpdj4nXHJcbl0uam9pbignJyk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcclxuIiwiZnVuY3Rpb24gVXRpbHMoKSB7fVxyXG5cclxuLy9SZXR1cm5zIHRydWUgaWYgaXQgaXMgYSBET00gbm9kZVxyXG4vL3Rha2VuIGZyb206IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzg0Mjg2L2phdmFzY3JpcHQtaXNkb20taG93LWRvLXlvdS1jaGVjay1pZi1hLWphdmFzY3JpcHQtb2JqZWN0LWlzLWEtZG9tLW9iamVjdFxyXG5VdGlscy5wcm90b3R5cGUuaXNOb2RlID0gZnVuY3Rpb24obykge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgICB0eXBlb2YgTm9kZSA9PT0gXCJvYmplY3RcIiA/IG8gaW5zdGFuY2VvZiBOb2RlIDpcclxuICAgICAgICBvICYmIHR5cGVvZiBvID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBvLm5vZGVUeXBlID09PSBcIm51bWJlclwiICYmIHR5cGVvZiBvLm5vZGVOYW1lID09PSBcInN0cmluZ1wiXHJcbiAgICApO1xyXG59O1xyXG5cclxuLy9SZXR1cm5zIHRydWUgaWYgaXQgaXMgYSBET00gZWxlbWVudFxyXG4vL3Rha2VuIGZyb206IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzg0Mjg2L2phdmFzY3JpcHQtaXNkb20taG93LWRvLXlvdS1jaGVjay1pZi1hLWphdmFzY3JpcHQtb2JqZWN0LWlzLWEtZG9tLW9iamVjdFxyXG5VdGlscy5wcm90b3R5cGUuaXNFbGVtZW50ID0gZnVuY3Rpb24obykge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgICB0eXBlb2YgSFRNTEVsZW1lbnQgPT09IFwib2JqZWN0XCIgPyBvIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgOiAvL0RPTTJcclxuICAgICAgICBvICYmIHR5cGVvZiBvID09PSBcIm9iamVjdFwiICYmIG8gIT09IG51bGwgJiYgby5ub2RlVHlwZSA9PT0gMSAmJiB0eXBlb2Ygby5ub2RlTmFtZSA9PT0gXCJzdHJpbmdcIlxyXG4gICAgKTtcclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5pc05vZGVPckVsZW1lbnQgPSBmdW5jdGlvbihvKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pc05vZGUobykgfHwgdGhpcy5pc0VsZW1lbnQobyk7XHJcbn07XHJcblxyXG4vL2FkZHMgYWxsIHR5cGUgb2YgY2hhbmdlIGxpc3RlbmVycyB0byBhbiBlbGVtZW50LCBpbnRlbmRlZCB0byBiZSBhIHRleHQgZmllbGRcclxuVXRpbHMucHJvdG90eXBlLmFkZENoYW5nZUxpc3RlbmVyID0gZnVuY3Rpb24oZWxlbWVudCwgbGlzdGVuZXIpIHtcclxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZWRcIiwgbGlzdGVuZXIpO1xyXG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwicGFzdGVcIiwgbGlzdGVuZXIpO1xyXG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgbGlzdGVuZXIpO1xyXG59O1xyXG5cclxuLy9pZiB2YWx1ZSBpcyB1bmRlZmluZWQsIG51bGwgb3IgYmxhbmssIHJldHVybnMgbnVsbCwgb3RoZXJ3aXNlIHJldHVybnMgdGhlIHZhbHVlXHJcblV0aWxzLnByb3RvdHlwZS5tYWtlTnVsbCA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gXCJcIikge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUucmVtb3ZlQWxsQ2hpbGRyZW4gPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICBpZiAobm9kZSkge1xyXG4gICAgICAgIHdoaWxlIChub2RlLmhhc0NoaWxkTm9kZXMoKSkge1xyXG4gICAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKG5vZGUubGFzdENoaWxkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vL2FkZHMgYW4gZWxlbWVudCB0byBhIGRpdiwgYnV0IGFsc28gYWRkcyBhIGJhY2tncm91bmQgY2hlY2tpbmcgZm9yIGNsaWNrcyxcclxuLy9zbyB0aGF0IHdoZW4gdGhlIGJhY2tncm91bmQgaXMgY2xpY2tlZCwgdGhlIGNoaWxkIGlzIHJlbW92ZWQgYWdhaW4sIGdpdmluZ1xyXG4vL2EgbW9kZWwgbG9vayB0byBwb3B1cHMuXHJcblV0aWxzLnByb3RvdHlwZS5hZGRBc01vZGFsUG9wdXAgPSBmdW5jdGlvbihlUGFyZW50LCBlQ2hpbGQpIHtcclxuICAgIHZhciBlQmFja2Ryb3AgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgZUJhY2tkcm9wLmNsYXNzTmFtZSA9IFwiYWctcG9wdXAtYmFja2Ryb3BcIjtcclxuXHJcbiAgICBlQmFja2Ryb3Aub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGVQYXJlbnQucmVtb3ZlQ2hpbGQoZUNoaWxkKTtcclxuICAgICAgICBlUGFyZW50LnJlbW92ZUNoaWxkKGVCYWNrZHJvcCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGVQYXJlbnQuYXBwZW5kQ2hpbGQoZUJhY2tkcm9wKTtcclxuICAgIGVQYXJlbnQuYXBwZW5kQ2hpbGQoZUNoaWxkKTtcclxufTtcclxuXHJcbi8vbG9hZHMgdGhlIHRlbXBsYXRlIGFuZCByZXR1cm5zIGl0IGFzIGFuIGVsZW1lbnQuIG1ha2VzIHVwIGZvciBubyBzaW1wbGUgd2F5IGluXHJcbi8vdGhlIGRvbSBhcGkgdG8gbG9hZCBodG1sIGRpcmVjdGx5LCBlZyB3ZSBjYW5ub3QgZG8gdGhpczogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0ZW1wbGF0ZSlcclxuVXRpbHMucHJvdG90eXBlLmxvYWRUZW1wbGF0ZSA9IGZ1bmN0aW9uKHRlbXBsYXRlKSB7XHJcbiAgICB2YXIgdGVtcERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICB0ZW1wRGl2LmlubmVySFRNTCA9IHRlbXBsYXRlO1xyXG4gICAgcmV0dXJuIHRlbXBEaXYuZmlyc3RDaGlsZDtcclxufTtcclxuXHJcbi8vaWYgcGFzc2VkICc0MnB4JyB0aGVuIHJldHVybnMgdGhlIG51bWJlciA0MlxyXG5VdGlscy5wcm90b3R5cGUucGl4ZWxTdHJpbmdUb051bWJlciA9IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICBpZiAodmFsLmluZGV4T2YoXCJweFwiKSA+PSAwKSB7XHJcbiAgICAgICAgICAgIHZhbC5yZXBsYWNlKFwicHhcIiwgXCJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYXJzZUludCh2YWwpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnF1ZXJ5U2VsZWN0b3JBbGxfYWRkQ3NzQ2xhc3MgPSBmdW5jdGlvbihlUGFyZW50LCBzZWxlY3RvciwgY3NzQ2xhc3MpIHtcclxuICAgIHZhciBlUm93cyA9IGVQYXJlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XHJcbiAgICBmb3IgKHZhciBrID0gMDsgayA8IGVSb3dzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgdGhpcy5hZGRDc3NDbGFzcyhlUm93c1trXSwgY3NzQ2xhc3MpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnF1ZXJ5U2VsZWN0b3JBbGxfcmVtb3ZlQ3NzQ2xhc3MgPSBmdW5jdGlvbihlUGFyZW50LCBzZWxlY3RvciwgY3NzQ2xhc3MpIHtcclxuICAgIHZhciBlUm93cyA9IGVQYXJlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XHJcbiAgICBmb3IgKHZhciBrID0gMDsgayA8IGVSb3dzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVDc3NDbGFzcyhlUm93c1trXSwgY3NzQ2xhc3MpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLmFkZENzc0NsYXNzID0gZnVuY3Rpb24oZWxlbWVudCwgY2xhc3NOYW1lKSB7XHJcbiAgICB2YXIgb2xkQ2xhc3NlcyA9IGVsZW1lbnQuY2xhc3NOYW1lO1xyXG4gICAgaWYgKG9sZENsYXNzZXMpIHtcclxuICAgICAgICBpZiAob2xkQ2xhc3Nlcy5pbmRleE9mKGNsYXNzTmFtZSkgPj0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gb2xkQ2xhc3NlcyArIFwiIFwiICsgY2xhc3NOYW1lO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcclxuICAgIH1cclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5yZW1vdmVDc3NDbGFzcyA9IGZ1bmN0aW9uKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xyXG4gICAgdmFyIG9sZENsYXNzZXMgPSBlbGVtZW50LmNsYXNzTmFtZTtcclxuICAgIGlmIChvbGRDbGFzc2VzLmluZGV4T2YoY2xhc3NOYW1lKSA8IDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB2YXIgbmV3Q2xhc3NlcyA9IG9sZENsYXNzZXMucmVwbGFjZShcIiBcIiArIGNsYXNzTmFtZSwgXCJcIik7XHJcbiAgICBuZXdDbGFzc2VzID0gbmV3Q2xhc3Nlcy5yZXBsYWNlKGNsYXNzTmFtZSArIFwiIFwiLCBcIlwiKTtcclxuICAgIGlmIChuZXdDbGFzc2VzID09IGNsYXNzTmFtZSkge1xyXG4gICAgICAgIG5ld0NsYXNzZXMgPSBcIlwiO1xyXG4gICAgfVxyXG4gICAgZWxlbWVudC5jbGFzc05hbWUgPSBuZXdDbGFzc2VzO1xyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnJlbW92ZUZyb21BcnJheSA9IGZ1bmN0aW9uKGFycmF5LCBvYmplY3QpIHtcclxuICAgIGFycmF5LnNwbGljZShhcnJheS5pbmRleE9mKG9iamVjdCksIDEpO1xyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLmRlZmF1bHRDb21wYXJhdG9yID0gZnVuY3Rpb24odmFsdWVBLCB2YWx1ZUIpIHtcclxuICAgIHZhciB2YWx1ZUFNaXNzaW5nID0gdmFsdWVBID09PSBudWxsIHx8IHZhbHVlQSA9PT0gdW5kZWZpbmVkO1xyXG4gICAgdmFyIHZhbHVlQk1pc3NpbmcgPSB2YWx1ZUIgPT09IG51bGwgfHwgdmFsdWVCID09PSB1bmRlZmluZWQ7XHJcbiAgICBpZiAodmFsdWVBTWlzc2luZyAmJiB2YWx1ZUJNaXNzaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBpZiAodmFsdWVBTWlzc2luZykge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuICAgIGlmICh2YWx1ZUJNaXNzaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHZhbHVlQSA8IHZhbHVlQikge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH0gZWxzZSBpZiAodmFsdWVBID4gdmFsdWVCKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLmZvcm1hdFdpZHRoID0gZnVuY3Rpb24od2lkdGgpIHtcclxuICAgIGlmICh0eXBlb2Ygd2lkdGggPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICByZXR1cm4gd2lkdGggKyBcInB4XCI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB3aWR0aDtcclxuICAgIH1cclxufTtcclxuXHJcbi8vIHRyaWVzIHRvIHVzZSB0aGUgcHJvdmlkZWQgcmVuZGVyZXIuIGlmIGEgcmVuZGVyZXIgZm91bmQsIHJldHVybnMgdHJ1ZS5cclxuLy8gaWYgbm8gcmVuZGVyZXIsIHJldHVybnMgZmFsc2UuXHJcblV0aWxzLnByb3RvdHlwZS51c2VSZW5kZXJlciA9IGZ1bmN0aW9uKGVQYXJlbnQsIGVSZW5kZXJlciwgcGFyYW1zKSB7XHJcbiAgICB2YXIgcmVzdWx0RnJvbVJlbmRlcmVyID0gZVJlbmRlcmVyKHBhcmFtcyk7XHJcbiAgICBpZiAodGhpcy5pc05vZGUocmVzdWx0RnJvbVJlbmRlcmVyKSB8fCB0aGlzLmlzRWxlbWVudChyZXN1bHRGcm9tUmVuZGVyZXIpKSB7XHJcbiAgICAgICAgLy9hIGRvbSBub2RlIG9yIGVsZW1lbnQgd2FzIHJldHVybmVkLCBzbyBhZGQgY2hpbGRcclxuICAgICAgICBlUGFyZW50LmFwcGVuZENoaWxkKHJlc3VsdEZyb21SZW5kZXJlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vb3RoZXJ3aXNlIGFzc3VtZSBpdCB3YXMgaHRtbCwgc28ganVzdCBpbnNlcnRcclxuICAgICAgICB2YXIgZVRleHRTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgIGVUZXh0U3Bhbi5pbm5lckhUTUwgPSByZXN1bHRGcm9tUmVuZGVyZXI7XHJcbiAgICAgICAgZVBhcmVudC5hcHBlbmRDaGlsZChlVGV4dFNwYW4pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gaWYgaWNvbiBwcm92aWRlZCwgdXNlIHRoaXMgKGVpdGhlciBhIHN0cmluZywgb3IgYSBmdW5jdGlvbiBjYWxsYmFjaykuXHJcbi8vIGlmIG5vdCwgdGhlbiB1c2UgdGhlIHNlY29uZCBwYXJhbWV0ZXIsIHdoaWNoIGlzIHRoZSBzdmdGYWN0b3J5IGZ1bmN0aW9uXHJcblV0aWxzLnByb3RvdHlwZS5jcmVhdGVJY29uID0gZnVuY3Rpb24oaWNvbk5hbWUsIGdyaWRPcHRpb25zV3JhcHBlciwgY29sRGVmV3JhcHBlciwgc3ZnRmFjdG9yeUZ1bmMpIHtcclxuICAgIHZhciBlUmVzdWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgdmFyIHVzZXJQcm92aWRlZEljb247XHJcbiAgICAvLyBjaGVjayBjb2wgZm9yIGljb24gZmlyc3RcclxuICAgIGlmIChjb2xEZWZXcmFwcGVyICYmIGNvbERlZldyYXBwZXIuY29sRGVmLmljb25zKSB7XHJcbiAgICAgICAgdXNlclByb3ZpZGVkSWNvbiA9IGNvbERlZldyYXBwZXIuY29sRGVmLmljb25zW2ljb25OYW1lXTtcclxuICAgIH1cclxuICAgIC8vIGl0IG5vdCBpbiBjb2wsIHRyeSBncmlkIG9wdGlvbnNcclxuICAgIGlmICghdXNlclByb3ZpZGVkSWNvbiAmJiBncmlkT3B0aW9uc1dyYXBwZXIuZ2V0SWNvbnMoKSkge1xyXG4gICAgICAgIHVzZXJQcm92aWRlZEljb24gPSBncmlkT3B0aW9uc1dyYXBwZXIuZ2V0SWNvbnMoKVtpY29uTmFtZV07XHJcbiAgICB9XHJcbiAgICAvLyBub3cgaWYgdXNlciBwcm92aWRlZCwgdXNlIGl0XHJcbiAgICBpZiAodXNlclByb3ZpZGVkSWNvbikge1xyXG4gICAgICAgIHZhciByZW5kZXJlclJlc3VsdDtcclxuICAgICAgICBpZiAodHlwZW9mIHVzZXJQcm92aWRlZEljb24gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgcmVuZGVyZXJSZXN1bHQgPSB1c2VyUHJvdmlkZWRJY29uKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdXNlclByb3ZpZGVkSWNvbiA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgcmVuZGVyZXJSZXN1bHQgPSB1c2VyUHJvdmlkZWRJY29uO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93ICdpY29uIGZyb20gZ3JpZCBvcHRpb25zIG5lZWRzIHRvIGJlIGEgc3RyaW5nIG9yIGEgZnVuY3Rpb24nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIHJlbmRlcmVyUmVzdWx0ID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBlUmVzdWx0LmlubmVySFRNTCA9IHJlbmRlcmVyUmVzdWx0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc05vZGVPckVsZW1lbnQocmVuZGVyZXJSZXN1bHQpKSB7XHJcbiAgICAgICAgICAgIGVSZXN1bHQuYXBwZW5kQ2hpbGQocmVuZGVyZXJSZXN1bHQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93ICdpY29uUmVuZGVyZXIgc2hvdWxkIHJldHVybiBiYWNrIGEgc3RyaW5nIG9yIGEgZG9tIG9iamVjdCc7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvdGhlcndpc2Ugd2UgdXNlIHRoZSBidWlsdCBpbiBpY29uXHJcbiAgICAgICAgZVJlc3VsdC5hcHBlbmRDaGlsZChzdmdGYWN0b3J5RnVuYygpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBlUmVzdWx0O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVXRpbHMoKTtcclxuIiwiLypcclxuICogVGhpcyByb3cgY29udHJvbGxlciBpcyB1c2VkIGZvciBpbmZpbml0ZSBzY3JvbGxpbmcgb25seS4gRm9yIG5vcm1hbCAnaW4gbWVtb3J5JyB0YWJsZSxcclxuICogb3Igc3RhbmRhcmQgcGFnaW5hdGlvbiwgdGhlIGluTWVtb3J5Um93Q29udHJvbGxlciBpcyB1c2VkLlxyXG4gKi9cclxuXHJcbnZhciBsb2dnaW5nID0gdHJ1ZTtcclxuXHJcbmZ1bmN0aW9uIFZpcnR1YWxQYWdlUm93Q29udHJvbGxlcigpIHt9XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihyb3dSZW5kZXJlcikge1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlciA9IHJvd1JlbmRlcmVyO1xyXG4gICAgdGhpcy5kYXRhc291cmNlVmVyc2lvbiA9IDA7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnNldERhdGFzb3VyY2UgPSBmdW5jdGlvbihkYXRhc291cmNlKSB7XHJcbiAgICB0aGlzLmRhdGFzb3VyY2UgPSBkYXRhc291cmNlO1xyXG5cclxuICAgIGlmICghZGF0YXNvdXJjZSkge1xyXG4gICAgICAgIC8vIG9ubHkgY29udGludWUgaWYgd2UgaGF2ZSBhIHZhbGlkIGRhdGFzb3VyY2UgdG8gd29ya2luZyB3aXRoXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmVzZXQoKTtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIHNlZSBpZiBkYXRhc291cmNlIGtub3dzIGhvdyBtYW55IHJvd3MgdGhlcmUgYXJlXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZGF0YXNvdXJjZS5yb3dDb3VudCA9PT0gJ251bWJlcicgJiYgdGhpcy5kYXRhc291cmNlLnJvd0NvdW50ID49IDApIHtcclxuICAgICAgICB0aGlzLnZpcnR1YWxSb3dDb3VudCA9IHRoaXMuZGF0YXNvdXJjZS5yb3dDb3VudDtcclxuICAgICAgICB0aGlzLmZvdW5kTWF4Um93ID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy52aXJ0dWFsUm93Q291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuZm91bmRNYXhSb3cgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpbiBjYXNlIGFueSBkYWVtb24gcmVxdWVzdHMgY29taW5nIGZyb20gZGF0YXNvdXJjZSwgd2Uga25vdyBpdCBpZ25vcmUgdGhlbVxyXG4gICAgdGhpcy5kYXRhc291cmNlVmVyc2lvbisrO1xyXG5cclxuICAgIC8vIG1hcCBvZiBwYWdlIG51bWJlcnMgdG8gcm93cyBpbiB0aGF0IHBhZ2VcclxuICAgIHRoaXMucGFnZUNhY2hlID0ge307XHJcbiAgICB0aGlzLnBhZ2VDYWNoZVNpemUgPSAwO1xyXG5cclxuICAgIC8vIGlmIGEgbnVtYmVyIGlzIGluIHRoaXMgYXJyYXksIGl0IG1lYW5zIHdlIGFyZSBwZW5kaW5nIGEgbG9hZCBmcm9tIGl0XHJcbiAgICB0aGlzLnBhZ2VMb2Fkc0luUHJvZ3Jlc3MgPSBbXTtcclxuICAgIHRoaXMucGFnZUxvYWRzUXVldWVkID0gW107XHJcbiAgICB0aGlzLnBhZ2VBY2Nlc3NUaW1lcyA9IHt9OyAvLyBrZWVwcyBhIHJlY29yZCBvZiB3aGVuIGVhY2ggcGFnZSB3YXMgbGFzdCB2aWV3ZWQsIHVzZWQgZm9yIExSVSBjYWNoZVxyXG4gICAgdGhpcy5hY2Nlc3NUaW1lID0gMDsgLy8gcmF0aGVyIHRoYW4gdXNpbmcgdGhlIGNsb2NrLCB3ZSB1c2UgdGhpcyBjb3VudGVyXHJcblxyXG4gICAgLy8gdGhlIG51bWJlciBvZiBjb25jdXJyZW50IGxvYWRzIHdlIGFyZSBhbGxvd2VkIHRvIHRoZSBzZXJ2ZXJcclxuICAgIGlmICh0eXBlb2YgdGhpcy5kYXRhc291cmNlLm1heENvbmN1cnJlbnRSZXF1ZXN0cyA9PT0gJ251bWJlcicgJiYgdGhpcy5kYXRhc291cmNlLm1heENvbmN1cnJlbnRSZXF1ZXN0cyA+IDApIHtcclxuICAgICAgICB0aGlzLm1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHMgPSB0aGlzLmRhdGFzb3VyY2UubWF4Q29uY3VycmVudFJlcXVlc3RzO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHMgPSAyO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoZSBudW1iZXIgb2YgcGFnZXMgdG8ga2VlcCBpbiBicm93c2VyIGNhY2hlXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZGF0YXNvdXJjZS5tYXhQYWdlc0luQ2FjaGUgPT09ICdudW1iZXInICYmIHRoaXMuZGF0YXNvdXJjZS5tYXhQYWdlc0luQ2FjaGUgPiAwKSB7XHJcbiAgICAgICAgdGhpcy5tYXhQYWdlc0luQ2FjaGUgPSB0aGlzLmRhdGFzb3VyY2UubWF4UGFnZXNJbkNhY2hlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBudWxsIGlzIGRlZmF1bHQsIG1lYW5zIGRvbid0ICBoYXZlIGFueSBtYXggc2l6ZSBvbiB0aGUgY2FjaGVcclxuICAgICAgICB0aGlzLm1heFBhZ2VzSW5DYWNoZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5wYWdlU2l6ZSA9IHRoaXMuZGF0YXNvdXJjZS5wYWdlU2l6ZTsgLy8gdGFrZSBhIGNvcHkgb2YgcGFnZSBzaXplLCB3ZSBkb24ndCB3YW50IGl0IGNoYW5naW5nXHJcbiAgICB0aGlzLm92ZXJmbG93U2l6ZSA9IHRoaXMuZGF0YXNvdXJjZS5vdmVyZmxvd1NpemU7IC8vIHRha2UgYSBjb3B5IG9mIHBhZ2Ugc2l6ZSwgd2UgZG9uJ3Qgd2FudCBpdCBjaGFuZ2luZ1xyXG5cclxuICAgIHRoaXMuZG9Mb2FkT3JRdWV1ZSgwKTtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUuY3JlYXRlTm9kZXNGcm9tUm93cyA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIsIHJvd3MpIHtcclxuICAgIHZhciBub2RlcyA9IFtdO1xyXG4gICAgaWYgKHJvd3MpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IHJvd3MubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB2aXJ0dWFsUm93SW5kZXggPSAocGFnZU51bWJlciAqIHRoaXMucGFnZVNpemUpICsgaTtcclxuICAgICAgICAgICAgbm9kZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBkYXRhOiByb3dzW2ldLFxyXG4gICAgICAgICAgICAgICAgaWQ6IHZpcnR1YWxSb3dJbmRleFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbm9kZXM7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnJlbW92ZUZyb21Mb2FkaW5nID0gZnVuY3Rpb24ocGFnZU51bWJlcikge1xyXG4gICAgdmFyIGluZGV4ID0gdGhpcy5wYWdlTG9hZHNJblByb2dyZXNzLmluZGV4T2YocGFnZU51bWJlcik7XHJcbiAgICB0aGlzLnBhZ2VMb2Fkc0luUHJvZ3Jlc3Muc3BsaWNlKGluZGV4LCAxKTtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUucGFnZUxvYWRGYWlsZWQgPSBmdW5jdGlvbihwYWdlTnVtYmVyKSB7XHJcbiAgICB0aGlzLnJlbW92ZUZyb21Mb2FkaW5nKHBhZ2VOdW1iZXIpO1xyXG4gICAgdGhpcy5jaGVja1F1ZXVlRm9yTmV4dExvYWQoKTtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUucGFnZUxvYWRlZCA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIsIHJvd3MsIGxhc3RSb3cpIHtcclxuICAgIHRoaXMucHV0UGFnZUludG9DYWNoZUFuZFB1cmdlKHBhZ2VOdW1iZXIsIHJvd3MpO1xyXG4gICAgdGhpcy5jaGVja01heFJvd0FuZEluZm9ybVJvd1JlbmRlcmVyKHBhZ2VOdW1iZXIsIGxhc3RSb3cpO1xyXG4gICAgdGhpcy5yZW1vdmVGcm9tTG9hZGluZyhwYWdlTnVtYmVyKTtcclxuICAgIHRoaXMuY2hlY2tRdWV1ZUZvck5leHRMb2FkKCk7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnB1dFBhZ2VJbnRvQ2FjaGVBbmRQdXJnZSA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIsIHJvd3MpIHtcclxuICAgIHRoaXMucGFnZUNhY2hlW3BhZ2VOdW1iZXJdID0gdGhpcy5jcmVhdGVOb2Rlc0Zyb21Sb3dzKHBhZ2VOdW1iZXIsIHJvd3MpO1xyXG4gICAgdGhpcy5wYWdlQ2FjaGVTaXplKys7XHJcbiAgICBpZiAobG9nZ2luZykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdhZGRpbmcgcGFnZSAnICsgcGFnZU51bWJlcik7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG5lZWRUb1B1cmdlID0gdGhpcy5tYXhQYWdlc0luQ2FjaGUgJiYgdGhpcy5tYXhQYWdlc0luQ2FjaGUgPCB0aGlzLnBhZ2VDYWNoZVNpemU7XHJcbiAgICBpZiAobmVlZFRvUHVyZ2UpIHtcclxuICAgICAgICAvLyBmaW5kIHRoZSBMUlUgcGFnZVxyXG4gICAgICAgIHZhciB5b3VuZ2VzdFBhZ2VJbmRleCA9IHRoaXMuZmluZExlYXN0UmVjZW50bHlBY2Nlc3NlZFBhZ2UoT2JqZWN0LmtleXModGhpcy5wYWdlQ2FjaGUpKTtcclxuXHJcbiAgICAgICAgaWYgKGxvZ2dpbmcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3B1cmdpbmcgcGFnZSAnICsgeW91bmdlc3RQYWdlSW5kZXggKyAnIGZyb20gY2FjaGUgJyArIE9iamVjdC5rZXlzKHRoaXMucGFnZUNhY2hlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnBhZ2VDYWNoZVt5b3VuZ2VzdFBhZ2VJbmRleF07XHJcbiAgICAgICAgdGhpcy5wYWdlQ2FjaGVTaXplLS07XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5jaGVja01heFJvd0FuZEluZm9ybVJvd1JlbmRlcmVyID0gZnVuY3Rpb24ocGFnZU51bWJlciwgbGFzdFJvdykge1xyXG4gICAgaWYgKCF0aGlzLmZvdW5kTWF4Um93KSB7XHJcbiAgICAgICAgLy8gaWYgd2Uga25vdyB0aGUgbGFzdCByb3csIHVzZSBpZlxyXG4gICAgICAgIGlmICh0eXBlb2YgbGFzdFJvdyA9PT0gJ251bWJlcicgJiYgbGFzdFJvdyA+PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlydHVhbFJvd0NvdW50ID0gbGFzdFJvdztcclxuICAgICAgICAgICAgdGhpcy5mb3VuZE1heFJvdyA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBzZWUgaWYgd2UgbmVlZCB0byBhZGQgc29tZSB2aXJ0dWFsIHJvd3NcclxuICAgICAgICAgICAgdmFyIHRoaXNQYWdlUGx1c0J1ZmZlciA9ICgocGFnZU51bWJlciArIDEpICogdGhpcy5wYWdlU2l6ZSkgKyB0aGlzLm92ZXJmbG93U2l6ZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMudmlydHVhbFJvd0NvdW50IDwgdGhpc1BhZ2VQbHVzQnVmZmVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZpcnR1YWxSb3dDb3VudCA9IHRoaXNQYWdlUGx1c0J1ZmZlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpZiByb3dDb3VudCBjaGFuZ2VzLCByZWZyZXNoVmlldywgb3RoZXJ3aXNlIGp1c3QgcmVmcmVzaEFsbFZpcnR1YWxSb3dzXHJcbiAgICAgICAgdGhpcy5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnJvd1JlbmRlcmVyLnJlZnJlc2hBbGxWaXJ0dWFsUm93cygpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5pc1BhZ2VBbHJlYWR5TG9hZGluZyA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpIHtcclxuICAgIHZhciByZXN1bHQgPSB0aGlzLnBhZ2VMb2Fkc0luUHJvZ3Jlc3MuaW5kZXhPZihwYWdlTnVtYmVyKSA+PSAwIHx8IHRoaXMucGFnZUxvYWRzUXVldWVkLmluZGV4T2YocGFnZU51bWJlcikgPj0gMDtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmRvTG9hZE9yUXVldWUgPSBmdW5jdGlvbihwYWdlTnVtYmVyKSB7XHJcbiAgICAvLyBpZiB3ZSBhbHJlYWR5IHRyaWVkIHRvIGxvYWQgdGhpcyBwYWdlLCB0aGVuIGlnbm9yZSB0aGUgcmVxdWVzdCxcclxuICAgIC8vIG90aGVyd2lzZSBzZXJ2ZXIgd291bGQgYmUgaGl0IDUwIHRpbWVzIGp1c3QgdG8gZGlzcGxheSBvbmUgcGFnZSwgdGhlXHJcbiAgICAvLyBmaXJzdCByb3cgdG8gZmluZCB0aGUgcGFnZSBtaXNzaW5nIGlzIGVub3VnaC5cclxuICAgIGlmICh0aGlzLmlzUGFnZUFscmVhZHlMb2FkaW5nKHBhZ2VOdW1iZXIpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRyeSB0aGUgcGFnZSBsb2FkIC0gaWYgbm90IGFscmVhZHkgZG9pbmcgYSBsb2FkLCB0aGVuIHdlIGNhbiBnbyBhaGVhZFxyXG4gICAgaWYgKHRoaXMucGFnZUxvYWRzSW5Qcm9ncmVzcy5sZW5ndGggPCB0aGlzLm1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHMpIHtcclxuICAgICAgICAvLyBnbyBhaGVhZCwgbG9hZCB0aGUgcGFnZVxyXG4gICAgICAgIHRoaXMubG9hZFBhZ2UocGFnZU51bWJlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIG90aGVyd2lzZSwgcXVldWUgdGhlIHJlcXVlc3RcclxuICAgICAgICB0aGlzLmFkZFRvUXVldWVBbmRQdXJnZVF1ZXVlKHBhZ2VOdW1iZXIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5hZGRUb1F1ZXVlQW5kUHVyZ2VRdWV1ZSA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpIHtcclxuICAgIGlmIChsb2dnaW5nKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3F1ZXVlaW5nICcgKyBwYWdlTnVtYmVyICsgJyAtICcgKyB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5wdXNoKHBhZ2VOdW1iZXIpO1xyXG5cclxuICAgIC8vIHNlZSBpZiB0aGVyZSBhcmUgbW9yZSBwYWdlcyBxdWV1ZWQgdGhhdCBhcmUgYWN0dWFsbHkgaW4gb3VyIGNhY2hlLCBpZiBzbyB0aGVyZSBpc1xyXG4gICAgLy8gbm8gcG9pbnQgaW4gbG9hZGluZyB0aGVtIGFsbCBhcyBzb21lIHdpbGwgYmUgcHVyZ2VkIGFzIHNvb24gYXMgbG9hZGVkXHJcbiAgICB2YXIgbmVlZFRvUHVyZ2UgPSB0aGlzLm1heFBhZ2VzSW5DYWNoZSAmJiB0aGlzLm1heFBhZ2VzSW5DYWNoZSA8IHRoaXMucGFnZUxvYWRzUXVldWVkLmxlbmd0aDtcclxuICAgIGlmIChuZWVkVG9QdXJnZSkge1xyXG4gICAgICAgIC8vIGZpbmQgdGhlIExSVSBwYWdlXHJcbiAgICAgICAgdmFyIHlvdW5nZXN0UGFnZUluZGV4ID0gdGhpcy5maW5kTGVhc3RSZWNlbnRseUFjY2Vzc2VkUGFnZSh0aGlzLnBhZ2VMb2Fkc1F1ZXVlZCk7XHJcblxyXG4gICAgICAgIGlmIChsb2dnaW5nKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZS1xdWV1ZWluZyAnICsgcGFnZU51bWJlciArICcgLSAnICsgdGhpcy5wYWdlTG9hZHNRdWV1ZWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGluZGV4VG9SZW1vdmUgPSB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5pbmRleE9mKHlvdW5nZXN0UGFnZUluZGV4KTtcclxuICAgICAgICB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5zcGxpY2UoaW5kZXhUb1JlbW92ZSwgMSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmZpbmRMZWFzdFJlY2VudGx5QWNjZXNzZWRQYWdlID0gZnVuY3Rpb24ocGFnZUluZGV4ZXMpIHtcclxuICAgIHZhciB5b3VuZ2VzdFBhZ2VJbmRleCA9IC0xO1xyXG4gICAgdmFyIHlvdW5nZXN0UGFnZUFjY2Vzc1RpbWUgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIHBhZ2VJbmRleGVzLmZvckVhY2goZnVuY3Rpb24ocGFnZUluZGV4KSB7XHJcbiAgICAgICAgdmFyIGFjY2Vzc1RpbWVUaGlzUGFnZSA9IHRoYXQucGFnZUFjY2Vzc1RpbWVzW3BhZ2VJbmRleF07XHJcbiAgICAgICAgaWYgKGFjY2Vzc1RpbWVUaGlzUGFnZSA8IHlvdW5nZXN0UGFnZUFjY2Vzc1RpbWUpIHtcclxuICAgICAgICAgICAgeW91bmdlc3RQYWdlQWNjZXNzVGltZSA9IGFjY2Vzc1RpbWVUaGlzUGFnZTtcclxuICAgICAgICAgICAgeW91bmdlc3RQYWdlSW5kZXggPSBwYWdlSW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHlvdW5nZXN0UGFnZUluZGV4O1xyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5jaGVja1F1ZXVlRm9yTmV4dExvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgLy8gdGFrZSBmcm9tIHRoZSBmcm9udCBvZiB0aGUgcXVldWVcclxuICAgICAgICB2YXIgcGFnZVRvTG9hZCA9IHRoaXMucGFnZUxvYWRzUXVldWVkWzBdO1xyXG4gICAgICAgIHRoaXMucGFnZUxvYWRzUXVldWVkLnNwbGljZSgwLCAxKTtcclxuXHJcbiAgICAgICAgaWYgKGxvZ2dpbmcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2RlcXVldWVpbmcgJyArIHBhZ2VUb0xvYWQgKyAnIC0gJyArIHRoaXMucGFnZUxvYWRzUXVldWVkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubG9hZFBhZ2UocGFnZVRvTG9hZCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmxvYWRQYWdlID0gZnVuY3Rpb24ocGFnZU51bWJlcikge1xyXG5cclxuICAgIHRoaXMucGFnZUxvYWRzSW5Qcm9ncmVzcy5wdXNoKHBhZ2VOdW1iZXIpO1xyXG5cclxuICAgIHZhciBzdGFydFJvdyA9IHBhZ2VOdW1iZXIgKiB0aGlzLnBhZ2VTaXplO1xyXG4gICAgdmFyIGVuZFJvdyA9IChwYWdlTnVtYmVyICsgMSkgKiB0aGlzLnBhZ2VTaXplO1xyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHZhciBkYXRhc291cmNlVmVyc2lvbkNvcHkgPSB0aGlzLmRhdGFzb3VyY2VWZXJzaW9uO1xyXG5cclxuICAgIHRoaXMuZGF0YXNvdXJjZS5nZXRSb3dzKHN0YXJ0Um93LCBlbmRSb3csXHJcbiAgICAgICAgZnVuY3Rpb24gc3VjY2Vzcyhyb3dzLCBsYXN0Um93KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGF0LnJlcXVlc3RJc0RhZW1vbihkYXRhc291cmNlVmVyc2lvbkNvcHkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhhdC5wYWdlTG9hZGVkKHBhZ2VOdW1iZXIsIHJvd3MsIGxhc3RSb3cpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb24gZmFpbCgpIHtcclxuICAgICAgICAgICAgaWYgKHRoYXQucmVxdWVzdElzRGFlbW9uKGRhdGFzb3VyY2VWZXJzaW9uQ29weSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGF0LnBhZ2VMb2FkRmFpbGVkKHBhZ2VOdW1iZXIpO1xyXG4gICAgICAgIH1cclxuICAgICk7XHJcbn07XHJcblxyXG4vLyBjaGVjayB0aGF0IHRoZSBkYXRhc291cmNlIGhhcyBub3QgY2hhbmdlZCBzaW5jZSB0aGUgbGF0cyB0aW1lIHdlIGRpZCBhIHJlcXVlc3RcclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5yZXF1ZXN0SXNEYWVtb24gPSBmdW5jdGlvbihkYXRhc291cmNlVmVyc2lvbkNvcHkpIHtcclxuICAgIHJldHVybiB0aGlzLmRhdGFzb3VyY2VWZXJzaW9uICE9PSBkYXRhc291cmNlVmVyc2lvbkNvcHk7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmdldFZpcnR1YWxSb3cgPSBmdW5jdGlvbihyb3dJbmRleCkge1xyXG4gICAgaWYgKHJvd0luZGV4ID4gdGhpcy52aXJ0dWFsUm93Q291bnQpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcGFnZU51bWJlciA9IE1hdGguZmxvb3Iocm93SW5kZXggLyB0aGlzLnBhZ2VTaXplKTtcclxuICAgIHZhciBwYWdlID0gdGhpcy5wYWdlQ2FjaGVbcGFnZU51bWJlcl07XHJcblxyXG4gICAgLy8gZm9yIExSVSBjYWNoZSwgdHJhY2sgd2hlbiB0aGlzIHBhZ2Ugd2FzIGxhc3QgaGl0XHJcbiAgICB0aGlzLnBhZ2VBY2Nlc3NUaW1lc1twYWdlTnVtYmVyXSA9IHRoaXMuYWNjZXNzVGltZSsrO1xyXG5cclxuICAgIGlmICghcGFnZSkge1xyXG4gICAgICAgIHRoaXMuZG9Mb2FkT3JRdWV1ZShwYWdlTnVtYmVyKTtcclxuICAgICAgICAvLyByZXR1cm4gYmFjayBhbiBlbXB0eSByb3csIHNvIHRhYmxlIGNhbiBhdCBsZWFzdCByZW5kZXIgZW1wdHkgY2VsbHNcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBkYXRhOiB7fSxcclxuICAgICAgICAgICAgaWQ6IHJvd0luZGV4XHJcbiAgICAgICAgfTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGluZGV4SW5UaGlzUGFnZSA9IHJvd0luZGV4ICUgdGhpcy5wYWdlU2l6ZTtcclxuICAgICAgICByZXR1cm4gcGFnZVtpbmRleEluVGhpc1BhZ2VdO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5nZXRNb2RlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXRWaXJ0dWFsUm93OiBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5nZXRWaXJ0dWFsUm93KGluZGV4KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFZpcnR1YWxSb3dDb3VudDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnZpcnR1YWxSb3dDb3VudDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBWaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXI7XHJcbiJdfQ==
