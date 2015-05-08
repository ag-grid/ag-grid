(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Angular Grid
// Written by Niall Crosby
// www.angulargrid.com
//
// Version 1.4.1

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
    }

    root.angularGrid = angularGridGlobalFunction;


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

}).call(window);

},{"./grid":13}],2:[function(require,module,exports){
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
ColumnController.prototype.consumeUnusedColumnWidth = function(availableWidth) {
    // avoid divide by zero
    if (availableWidth <= 0 || this.visibleColumns.length === 0) {
        return;
    }

    var colDefined = this.getTotalDefinedColWidth();
    var leftoverWidth = availableWidth - colDefined.definedWidth;

    if (colDefined.undefinedCols.length > 0) {
        //Math.floor
        var colWidth = leftoverWidth / colDefined.undefinedCols.length;
        colDefined.undefinedCols.forEach(function(column) {
            column.actualWidth = colWidth;
        });
    }

    // widths set, refresh the gui
    this.angularGrid.refreshHeaderAndBody();
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
    var defaultWidth = this.gridOptionsWrapper.getColWidth();
    if (typeof defaultWidth !== 'number' || defaultWidth < constants.MIN_COL_WIDTH) {
        defaultWidth = 200;
    }
    this.columns.forEach(function(colDefWrapper) {
        var colDef = colDefWrapper.colDef;
        if (colDefWrapper.actualWidth) {
            // if actual width already set, do nothing
            return;
        } else if (!colDef.width) {
            // if no width defined in colDef, default to 200
            colDefWrapper.actualWidth = defaultWidth;
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

// private
// call with true (pinned), false (not-pinned) or undefined (all columns)
ColumnController.prototype.getTotalDefinedColWidth = function(includePinned) {
    var ret = {
        definedWidth: 0,
        definedCols: [],
        undefinedCols: []
    };
    var widthSoFar = 0;
    var pinedNotImportant = typeof includePinned !== 'boolean';

    this.visibleColumns.forEach(function(column) {
        var includeThisCol = pinedNotImportant || column.pinned === includePinned;
        if (includeThisCol) {
            if(column.colDef.width){
                ret.definedWidth += column.colDef.width;
                ret.definedCols.push(column);
            } else {
                ret.undefinedCols.push(column);
            }
        }
    });

    return ret;
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
function ExpressionService() {}

ExpressionService.prototype.evaluate = function(rule, params) {
};

function ExpressionService() {
    this.expressionToFunctionCache = {};
}

ExpressionService.prototype.evaluate = function (expression, params) {

    try {
        var javaScriptFunction = this.createExpressionFunction(expression);
        var result = javaScriptFunction(params.value, params.context, params.node,
            params.data, params.colDef, params.rowIndex, params.api);
        return result;
    } catch (e) {
        // the expression failed, which can happen, as it's the client that
        // provides the expression. so print a nice message
        console.error('Processing of the expression failed');
        console.error('Expression = ' + expression);
        console.error('Exception = ' + e);
        return null;
    }
};

ExpressionService.prototype.createExpressionFunction = function (expression) {
    // check cache first
    if (this.expressionToFunctionCache[expression]) {
        return this.expressionToFunctionCache[expression];
    }
    // if not found in cache, return the function
    var functionBody = this.createFunctionBody(expression);
    var theFunction = new Function('x, ctx, node, data, colDef, rowIndex, api', functionBody);

    // store in cache
    this.expressionToFunctionCache[expression] = theFunction;

    return theFunction;
};

ExpressionService.prototype.createFunctionBody = function (expression) {
    // if the expression has the 'return' word in it, then use as is,
    // if not, then wrap it with return and ';' to make a function
    if (expression.indexOf('return') >= 0) {
        return expression;
    } else {
        return 'return ' + expression + ';';
    }
};

module.exports = ExpressionService;

},{}],5:[function(require,module,exports){
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
        if (utils.isNodeOrElement(guiFromFilter)) {
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

},{"./../utils":26,"./numberFilter":6,"./setFilter":8,"./textFilter":11}],6:[function(require,module,exports){
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

},{"./../utils":26,"./numberFilterTemplate.js":7}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

        if (utils.isNode(resultFromRenderer)) {
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

},{"./../utils":26,"./setFilterModel":9,"./setFilterTemplate":10}],9:[function(require,module,exports){
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

        function recursivelyProcess(nodes) {
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                if (node.group && !node.footer) {
                    // group node, so dig deeper
                    recursivelyProcess(node.children);
                } else {
                    var data = node.data;
                    var value = data ? data[key] : null;
                    if (value === "" || value === undefined) {
                        value = null;
                    }
                    if (!uniqueCheck.hasOwnProperty(value)) {
                        result.push(value);
                        uniqueCheck[value] = 1;
                    }
                }
            }
        }

        var topLevelNodes = rowModel.getTopLevelNodes();
        recursivelyProcess(topLevelNodes);

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

},{"../utils":26}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"../utils":26,"./textFilterTemplate":12}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
var utils = require('./utils');
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
var ExpressionService = require('./expressionService');
var TemplateService = require('./templateService');

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

    this.scrollWidth = utils.getScrollbarWidth();

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

    // if ready function provided, use it
    if (typeof this.gridOptionsWrapper.getReady() == 'function') {
        this.gridOptionsWrapper.getReady()(gridOptions.api);
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
    var expressionService = new ExpressionService();
    var templateService = new TemplateService();

    var columnModel = columnController.getModel();

    // initialise all the beans
    templateService.init($scope);
    selectionController.init(this, this.eParentOfRows, gridOptionsWrapper, $scope, rowRenderer);
    filterManager.init(this, gridOptionsWrapper, $compile, $scope);
    selectionRendererFactory.init(this, selectionController);
    columnController.init(this, selectionRendererFactory, gridOptionsWrapper);
    rowRenderer.init(gridOptions, columnModel, gridOptionsWrapper, eGridDiv, this,
        selectionRendererFactory, $compile, $scope, selectionController, expressionService, templateService);
    headerRenderer.init(gridOptionsWrapper, columnController, columnModel, eGridDiv, this, filterManager, $scope, $compile);
    inMemoryRowController.init(gridOptionsWrapper, columnModel, this, filterManager, $scope, expressionService);
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

    // we do not allow selecting groups by clicking (as the click here expands the group)
    // so return if it's a group row
    if (node.group) {
        return;
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
    this.columnController.setColumns(this.gridOptionsWrapper.getColumnDefs());
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
        softRefreshView: function() {
            that.rowRenderer.softRefreshView();
        },
        refreshGroupRows: function() {
            that.rowRenderer.refreshGroupRows();
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
        consumeUnusedColumnWidth: function() {
            var availableWidth = that.eBody.clientWidth;
            that.columnController.consumeUnusedColumnWidth(availableWidth);
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
        this.ePinnedColsViewport.style.height = (bodyHeight - this.scrollWidth) + "px";
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
};

Grid.prototype.scrollHeader = function(bodyLeftPosition) {
    // this.eHeaderContainer.style.transform = 'translate3d(' + -bodyLeftPosition + "px,0,0)";
    this.eHeaderContainer.style.left = -bodyLeftPosition + "px";
};

Grid.prototype.scrollPinned = function(bodyTopPosition) {
    // this.ePinnedColsContainer.style.transform = 'translate3d(0,' + -bodyTopPosition + "px,0)";
    this.ePinnedColsContainer.style.top = -bodyTopPosition + "px";
};

module.exports = Grid;

},{"./columnController":2,"./constants":3,"./expressionService":4,"./filter/filterManager":5,"./gridOptionsWrapper":14,"./headerRenderer":16,"./inMemoryRowController":17,"./paginationController":18,"./rowRenderer":19,"./selectionController":20,"./selectionRendererFactory":21,"./template.js":23,"./templateNoScrolls.js":24,"./templateService":25,"./utils":26,"./virtualPageRowController":27}],14:[function(require,module,exports){
var DEFAULT_ROW_HEIGHT = 30;

function GridOptionsWrapper(gridOptions) {
    this.gridOptions = gridOptions;
    this.setupDefaults();
}

function isTrue(value) {
    return value === true || value === 'true';
}

GridOptionsWrapper.prototype.isRowSelection = function() { return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple"; };
GridOptionsWrapper.prototype.isRowSelectionMulti = function() { return this.gridOptions.rowSelection === 'multiple'; };
GridOptionsWrapper.prototype.getContext = function() { return this.gridOptions.context; };
GridOptionsWrapper.prototype.isVirtualPaging = function() { return isTrue(this.gridOptions.virtualPaging); };
GridOptionsWrapper.prototype.isRowsAlreadyGrouped = function() { return isTrue(this.gridOptions.rowsAlreadyGrouped); };
GridOptionsWrapper.prototype.isGroupCheckboxSelectionGroup = function() { return this.gridOptions.groupCheckboxSelection === 'group'; };
GridOptionsWrapper.prototype.isGroupCheckboxSelectionChildren = function() { return this.gridOptions.groupCheckboxSelection === 'children'; };
GridOptionsWrapper.prototype.isGroupIncludeFooter = function() { return isTrue(this.gridOptions.groupIncludeFooter); };
GridOptionsWrapper.prototype.isSuppressRowClickSelection = function() { return isTrue(this.gridOptions.suppressRowClickSelection); };
GridOptionsWrapper.prototype.isGroupHeaders = function() { return isTrue(this.gridOptions.groupHeaders); };
GridOptionsWrapper.prototype.isDontUseScrolls = function() { return isTrue(this.gridOptions.dontUseScrolls); };
GridOptionsWrapper.prototype.getRowStyle = function() { return this.gridOptions.rowStyle; };
GridOptionsWrapper.prototype.getRowClass = function() { return this.gridOptions.rowClass; };
GridOptionsWrapper.prototype.getGridOptions = function() { return this.gridOptions; };
GridOptionsWrapper.prototype.getHeaderCellRenderer = function() { return this.gridOptions.headerCellRenderer; };
GridOptionsWrapper.prototype.getApi = function() { return this.gridOptions.api; };
GridOptionsWrapper.prototype.isEnableSorting = function() { return this.gridOptions.enableSorting; };
GridOptionsWrapper.prototype.isEnableColResize = function() { return this.gridOptions.enableColResize; };
GridOptionsWrapper.prototype.isEnableFilter = function() { return this.gridOptions.enableFilter; };
GridOptionsWrapper.prototype.getColWidth = function() { return this.gridOptions.colWidth; };
GridOptionsWrapper.prototype.getGroupDefaultExpanded = function() { return this.gridOptions.groupDefaultExpanded; };
GridOptionsWrapper.prototype.getGroupKeys = function() { return this.gridOptions.groupKeys; };
GridOptionsWrapper.prototype.getGroupAggFunction = function() { return this.gridOptions.groupAggFunction; };
GridOptionsWrapper.prototype.getAllRows = function() { return this.gridOptions.rowData; };
GridOptionsWrapper.prototype.isGroupUseEntireRow = function() { return isTrue(this.gridOptions.groupUseEntireRow); };
GridOptionsWrapper.prototype.isAngularCompileRows = function() { return isTrue(this.gridOptions.angularCompileRows); };
GridOptionsWrapper.prototype.isAngularCompileFilters = function() { return isTrue(this.gridOptions.angularCompileFilters); };
GridOptionsWrapper.prototype.isAngularCompileHeaders = function() { return isTrue(this.gridOptions.angularCompileHeaders); };
GridOptionsWrapper.prototype.getColumnDefs = function() { return this.gridOptions.columnDefs; };
GridOptionsWrapper.prototype.getRowHeight = function() { return this.gridOptions.rowHeight; };
GridOptionsWrapper.prototype.getModelUpdated = function() { return this.gridOptions.modelUpdated; };
GridOptionsWrapper.prototype.getCellClicked = function() { return this.gridOptions.cellClicked; };
GridOptionsWrapper.prototype.getCellDoubleClicked = function() { return this.gridOptions.cellDoubleClicked; };
GridOptionsWrapper.prototype.getCellValueChanged = function() { return this.gridOptions.cellValueChanged; };
GridOptionsWrapper.prototype.getRowSelected = function() { return this.gridOptions.rowSelected; };
GridOptionsWrapper.prototype.getSelectionChanged = function() { return this.gridOptions.selectionChanged; };
GridOptionsWrapper.prototype.getVirtualRowRemoved = function() { return this.gridOptions.virtualRowRemoved; };
GridOptionsWrapper.prototype.getDatasource = function() { return this.gridOptions.datasource; };
GridOptionsWrapper.prototype.getReady = function() { return this.gridOptions.ready; };
GridOptionsWrapper.prototype.getRowBuffer = function() { return this.gridOptions.rowBuffer; };

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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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
            api: this.gridOptionsWrapper.getApi()
        };
        var cellRendererResult = headerCellRenderer(cellRendererParams);
        var childToAppend;
        if (utils.isNodeOrElement(cellRendererResult)) {
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

},{"./constants":3,"./svgFactory":22,"./utils":26}],17:[function(require,module,exports){
var groupCreator = require('./groupCreator');
var utils = require('./utils');
var constants = require('./constants');

function InMemoryRowController() {
    this.createModel();
}

InMemoryRowController.prototype.init = function(gridOptionsWrapper, columnModel, angularGrid, filterManager, $scope, expressionService) {
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.columnModel = columnModel;
    this.angularGrid = angularGrid;
    this.filterManager = filterManager;
    this.$scope = $scope;
    this.expressionService = expressionService;

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

// private
InMemoryRowController.prototype.getValue = function(data, colDef, node, rowIndex) {
    var api = this.gridOptionsWrapper.getApi();
    var context = this.gridOptionsWrapper.getContext();
    return utils.getValue(this.expressionService, data, colDef, node, rowIndex, api, context);
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
            this.recursivelyCreateAggData(node.childrenAfterFilter, groupAggFunction);
            // after traversal, we can now do the agg at this level
            var data = groupAggFunction(node.childrenAfterFilter);
            node.data = data;
            // if we are grouping, then it's possible there is a sibling footer
            // to the group, so update the data here also if there is one
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
    this.columnModel.getAllColumns().forEach(function(column) {
        if (column.sort) {
            columnForSorting = column;
        }
    });

    var rowNodesBeforeSort = this.rowsAfterFilter.slice(0);

    if (columnForSorting) {
        var ascending = columnForSorting.sort === constants.ASC;
        var inverter = ascending ? 1 : -1;

        this.sortList(rowNodesBeforeSort, columnForSorting.colDef, inverter);
    } else {
        // if no sorting, set all group children after sort to the original list
        this.recursivelyResetSort(rowNodesBeforeSort);
    }

    this.rowsAfterSort = rowNodesBeforeSort;
};

// private
InMemoryRowController.prototype.recursivelyResetSort = function(rowNodes) {
    for (var i = 0, l = rowNodes.length; i < l; i++) {
        var item = rowNodes[i];
        if (item.group && item.children) {
            item.childrenAfterSort = item.childrenAfterFilter;
            this.recursivelyResetSort(item.children);
        }
    }
};

// private
InMemoryRowController.prototype.sortList = function(nodes, colDef, inverter) {

    // sort any groups recursively
    for (var i = 0, l = nodes.length; i < l; i++) { // critical section, no functional programming
        var node = nodes[i];
        if (node.group && node.children) {
            node.childrenAfterSort = node.childrenAfterFilter.slice(0);
            this.sortList(node.childrenAfterSort, colDef, inverter);
        }
    }

    var that = this;
    nodes.sort(function(objA, objB) {

        var valueA = that.getValue(objA.data, colDef, objA);
        var valueB = that.getValue(objB.data, colDef, objB);

        if (colDef.comparator) {
            //if comparator provided, use it
            return colDef.comparator(valueA, valueB, objA, objB) * inverter;
        } else {
            //otherwise do our own comparison
            return utils.defaultComparator(valueA, valueB, objA, objB) * inverter;
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
        // do it here
        rowsAfterFilter = this.rowsAfterGroup;
        this.recursivelyResetFilter(this.rowsAfterGroup);
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
            node.childrenAfterFilter = this.filterItems(node.children, quickFilterPresent, advancedFilterPresent);
            if (node.childrenAfterFilter.length > 0) {
                node.allChildrenCount = this.getTotalChildCount(node.childrenAfterFilter);
                result.push(node);
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
InMemoryRowController.prototype.recursivelyResetFilter = function(nodes) {
    for (var i = 0, l = nodes.length; i < l; i++) {
        var node = nodes[i];
        if (node.group && node.children) {
            node.childrenAfterFilter = node.children;
            node.allChildrenCount = this.getTotalChildCount(node.childrenAfterFilter);
            this.recursivelyResetFilter(node.children);
        }
    }
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

},{"./constants":3,"./groupCreator":15,"./utils":26}],18:[function(require,module,exports){
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
    if (typeof this.datasource.rowCount === 'number' && this.datasource.rowCount >= 0) {
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

},{}],19:[function(require,module,exports){
var constants = require('./constants');
var SvgFactory = require('./svgFactory');
var utils = require('./utils');

var svgFactory = new SvgFactory();

var TAB_KEY = 9;
var ENTER_KEY = 13;

function RowRenderer() {}

RowRenderer.prototype.init = function(gridOptions, columnModel, gridOptionsWrapper, eGrid,
    angularGrid, selectionRendererFactory, $compile, $scope,
    selectionController, expressionService, templateService) {
    this.gridOptions = gridOptions;
    this.columnModel = columnModel;
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.angularGrid = angularGrid;
    this.selectionRendererFactory = selectionRendererFactory;
    this.findAllElements(eGrid);
    this.$compile = $compile;
    this.$scope = $scope;
    this.selectionController = selectionController;
    this.expressionService = expressionService;
    this.templateService = templateService;

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

RowRenderer.prototype.softRefreshView = function() {

    var first = this.firstVirtualRenderedRow;
    var last = this.lastVirtualRenderedRow;

    var columns = this.columnModel.getVisibleColumns();
    // if no cols, don't draw row
    if (!columns || columns.length === 0) {
        return;
    }

    for (var rowIndex = first; rowIndex <= last; rowIndex++) {
        var node = this.rowModel.getVirtualRow(rowIndex);
        if (node) {

            for (var colIndex = 0; colIndex <= columns.length; colIndex++) {
                var column = columns[colIndex];
                var renderedRow = this.renderedRows[rowIndex];
                var eGridCell = renderedRow.eVolatileCells[colIndex];

                if (!eGridCell) {
                    continue;
                }

                var isFirstColumn = colIndex === 0;
                var scope = renderedRow.scope;

                this.softRefreshCell(eGridCell, isFirstColumn, node, column, scope, rowIndex);
            }
        }
    }
};

RowRenderer.prototype.softRefreshCell = function(eGridCell, isFirstColumn, node, column, scope, rowIndex) {

    utils.removeAllChildren(eGridCell);

    var data = this.getDataForNode(node);
    var valueGetter = this.createValueGetter(data, column.colDef, node);

    var value;
    if (valueGetter) {
        value = valueGetter();
    }

    this.populateAndStyleGridCell(valueGetter, value, eGridCell, isFirstColumn, node, column, rowIndex, scope);

    // if angular compiling, then need to also compile the cell again (angular compiling sucks, please wait...)
    if (this.gridOptionsWrapper.isAngularCompileRows()) {
        this.$compile(eGridCell)(scope);
    }
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
        var buffer = this.gridOptionsWrapper.getRowBuffer() || constants.ROW_BUFFER_SIZE;
        first = first - buffer;
        last = last + buffer;

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

RowRenderer.prototype.getFirstVirtualRenderedRow = function() {
    return this.firstVirtualRenderedRow;
};

RowRenderer.prototype.getLastVirtualRenderedRow = function() {
    return this.lastVirtualRenderedRow;
};

RowRenderer.prototype.ensureRowsRendered = function() {

    var mainRowWidth = this.columnModel.getBodyContainerWidth();
    var that = this;

    // at the end, this array will contain the items we need to remove
    var rowsToRemove = Object.keys(this.renderedRows);

    // add in new rows
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

    // at this point, everything in our 'rowsToRemove' . . .
    this.removeVirtualRows(rowsToRemove);

    // if we are doing angular compiling, then do digest the scope here
    if (this.gridOptionsWrapper.isAngularCompileRows()) {
        // we do it in a timeout, in case we are already in an apply
        setTimeout(function() {
            that.$scope.$apply();
        }, 0);
    }
};

RowRenderer.prototype.insertRow = function(node, rowIndex, mainRowWidth) {
    var columns = this.columnModel.getVisibleColumns();
    // if no cols, don't draw row
    if (!columns || columns.length == 0) {
        return;
    }

    // var rowData = node.rowData;
    var rowIsAGroup = node.group;
    var rowIsAFooter = node.footer;

    var ePinnedRow = this.createRowContainer(rowIndex, node, rowIsAGroup);
    var eMainRow = this.createRowContainer(rowIndex, node, rowIsAGroup);
    var that = this;

    eMainRow.style.width = mainRowWidth + "px";

    // try compiling as we insert rows
    var newChildScope = this.createChildScopeOrNull(node.data);

    var renderedRow = {
        scope: newChildScope,
        node: node,
        rowIndex: rowIndex,
        eVolatileCells: {}
    };
    this.renderedRows[rowIndex] = renderedRow;
    this.renderedRowStartEditingListeners[rowIndex] = {};

    // if group item, insert the first row
    if (rowIsAGroup) {
        var firstColumn = columns[0];
        var groupHeaderTakesEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow();

        var eGroupRow = that.createGroupElement(node, firstColumn, groupHeaderTakesEntireRow, false, rowIndex, rowIsAFooter);
        if (firstColumn.pinned) {
            ePinnedRow.appendChild(eGroupRow);
        } else {
            eMainRow.appendChild(eGroupRow);
        }

        if (firstColumn.pinned && groupHeaderTakesEntireRow) {
            var eGroupRowPadding = that.createGroupElement(node, firstColumn, groupHeaderTakesEntireRow, true, rowIndex, rowIsAFooter);
            eMainRow.appendChild(eGroupRowPadding);
        }

        if (!groupHeaderTakesEntireRow) {

            // draw in cells for the rest of the row.
            var groupData = this.getDataForNode(node);

            columns.forEach(function(column, index) {
                if (index === 0) { //skip first col, as this is the group col we already inserted
                    return;
                }
                var valueGetter;
                if (groupData) {
                    valueGetter = that.createValueGetter(groupData, column.colDef, node);
                }
                that.createCellFromColDef(false, column, valueGetter, node, rowIndex, eMainRow, ePinnedRow, newChildScope, renderedRow);
            });

        }

    } else {

        columns.forEach(function(column, index) {
            var firstCol = index === 0;
            var data = that.getDataForNode(node);
            var valueGetter = that.createValueGetter(data, column.colDef, node);
            that.createCellFromColDef(firstCol, column, valueGetter, node, rowIndex, eMainRow, ePinnedRow, newChildScope, renderedRow);
        });
    }

    //try compiling as we insert rows
    renderedRow.pinnedElement = this.compileAndAdd(this.ePinnedColsContainer, rowIndex, ePinnedRow, newChildScope);
    renderedRow.bodyElement = this.compileAndAdd(this.eBodyContainer, rowIndex, eMainRow, newChildScope);
};

// if group is a footer, always show the data.
// if group is a header, only show data if not expanded
RowRenderer.prototype.getDataForNode = function(node) {
    if (node.footer) {
        // if footer, we always show the data
        return node.data;
    } else if (node.group) {
        // if header and header is expanded, we show data in footer only
        var footersEnabled = this.gridOptionsWrapper.isGroupIncludeFooter();
        return (node.expanded && footersEnabled) ? undefined : node.data;
    } else {
        // otherwise it's a normal node, just return data as normal
        return node.data;
    }
};

RowRenderer.prototype.createValueGetter = function(data, colDef, node) {
    var that = this;
    return function() {
        var api = that.gridOptionsWrapper.getApi();
        var context = that.gridOptionsWrapper.getContext();
        return utils.getValue(that.expressionService, data, colDef, node, api, context);
    };
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

RowRenderer.prototype.createCellFromColDef = function(isFirstColumn, column, valueGetter, node, rowIndex, eMainRow, ePinnedRow, $childScope, renderedRow) {
    var eGridCell = this.createCell(isFirstColumn, column, valueGetter, node, rowIndex, $childScope);

    if (column.colDef.volatile) {
        renderedRow.eVolatileCells[column.colKey] = eGridCell;
    }

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
            api: this.gridOptionsWrapper.getApi()
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

    var _this = this;
    eRow.addEventListener("click", function(event) {
        _this.angularGrid.onRowClicked(event, Number(this.getAttribute("row")), node)
    });

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
            api: this.gridOptionsWrapper.getApi(),
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

RowRenderer.prototype.putDataIntoCell = function(colDef, value, valueGetter, node, $childScope, eGridCell, rowIndex, refreshCellFunction) {
    // template gets preference, then cellRenderer, then do it ourselves
    if (colDef.template) {
        eGridCell.innerHTML = colDef.template;
    } else if (colDef.templateUrl) {
        var template = this.templateService.getTemplate(colDef.templateUrl, refreshCellFunction);
        if (template) {
            eGridCell.innerHTML = template;
        }
    } else if (colDef.cellRenderer) {
        var rendererParams = {
            value: value,
            valueGetter: valueGetter,
            data: node.data,
            node: node,
            colDef: colDef,
            $scope: $childScope,
            rowIndex: rowIndex,
            api: this.gridOptionsWrapper.getApi(),
            context: this.gridOptionsWrapper.getContext(),
            refreshCell: refreshCellFunction
        };
        var resultFromRenderer = colDef.cellRenderer(rendererParams);
        if (utils.isNodeOrElement(resultFromRenderer)) {
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

RowRenderer.prototype.addStylesFromCollDef = function(colDef, value, node, $childScope, eGridCell) {
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
                api: this.gridOptionsWrapper.getApi()
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
};

RowRenderer.prototype.addClassesFromCollDef = function(colDef, value, node, $childScope, eGridCell) {
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
                api: this.gridOptionsWrapper.getApi()
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
};

RowRenderer.prototype.addClassesToCell = function(column, node, eGridCell) {
    var classes = ['ag-cell', 'cell-col-' + column.index];
    if (node.group) {
        if (node.footer) {
            classes.push('ag-footer-cell');
        } else {
            classes.push('ag-group-cell');
        }
    }
    eGridCell.className = classes.join(' ');
};

RowRenderer.prototype.addClassesFromRules = function(colDef, eGridCell, value, node, rowIndex) {
    var classRules = colDef.cellClassRules;
    if (typeof classRules === 'object') {

        var params = {
            value: value,
            data: node.data,
            node: node,
            colDef: colDef,
            rowIndex: rowIndex,
            api: this.gridOptionsWrapper.getApi(),
            context: this.gridOptionsWrapper.getContext()
        };

        var classNames = Object.keys(classRules);
        for (var i = 0; i < classNames.length; i++) {
            var className = classNames[i];
            var rule = classRules[className];
            var resultOfRule;
            if (typeof rule === 'string') {
                resultOfRule = this.expressionService.evaluate(rule, params);
            } else if (typeof rule === 'function') {
                resultOfRule = rule(params);
            }
            if (resultOfRule) {
                utils.addCssClass(eGridCell, className);
            } else {
                utils.removeCssClass(eGridCell, className);
            }
        }
    }
};

RowRenderer.prototype.createCell = function(isFirstColumn, column, valueGetter, node, rowIndex, $childScope) {
    var that = this;
    var eGridCell = document.createElement("div");
    eGridCell.setAttribute("col", column.index);

    var value;
    if (valueGetter) {
        value = valueGetter();
    }

    // these are the grid styles, don't change between soft refreshes
    this.addClassesToCell(column, node, eGridCell);

    this.populateAndStyleGridCell(valueGetter, value, eGridCell, isFirstColumn, node, column, rowIndex, $childScope);

    this.addCellClickedHandler(eGridCell, node, column, value, rowIndex);
    this.addCellDoubleClickedHandler(eGridCell, node, column, value, rowIndex, $childScope, isFirstColumn, valueGetter);

    eGridCell.style.width = utils.formatWidth(column.actualWidth);

    // add the 'start editing' call to the chain of editors
    this.renderedRowStartEditingListeners[rowIndex][column.index] = function() {
        if (that.isCellEditable(column.colDef, node)) {
            that.startEditing(eGridCell, column, node, $childScope, rowIndex, isFirstColumn, valueGetter);
            return true;
        } else {
            return false;
        }
    };

    return eGridCell;
};

RowRenderer.prototype.populateAndStyleGridCell = function(valueGetter, value, eGridCell, isFirstColumn, node, column, rowIndex, $childScope) {
    var colDef = column.colDef;

    // populate
    this.populateGridCell(eGridCell, isFirstColumn, node, column, rowIndex, value, valueGetter, $childScope);
    // style
    this.addStylesFromCollDef(colDef, value, node, $childScope, eGridCell);
    this.addClassesFromCollDef(colDef, value, node, $childScope, eGridCell);
    this.addClassesFromRules(colDef, eGridCell, value, node, rowIndex);
};

RowRenderer.prototype.populateGridCell = function(eGridCell, isFirstColumn, node, column, rowIndex, value, valueGetter, $childScope) {
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

    var that = this;
    var refreshCellFunction = function() {
        that.softRefreshCell(eGridCell, isFirstColumn, node, column, $childScope, rowIndex);
    };

    this.putDataIntoCell(colDef, value, valueGetter, node, $childScope, eSpanWithValue, rowIndex, refreshCellFunction);
};

RowRenderer.prototype.addCellDoubleClickedHandler = function(eGridCell, node, column, value, rowIndex, $childScope, isFirstColumn, valueGetter) {
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
                api: that.gridOptionsWrapper.getApi()
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
                api: that.gridOptionsWrapper.getApi()
            };
            colDef.cellDoubleClicked(paramsForColDef);
        }
        if (that.isCellEditable(colDef, node)) {
            that.startEditing(eGridCell, column, node, $childScope, rowIndex, isFirstColumn, valueGetter);
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
                api: that.gridOptionsWrapper.getApi()
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
                api: that.gridOptionsWrapper.getApi()
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

RowRenderer.prototype.stopEditing = function(eGridCell, column, node, $childScope, eInput, blurListener, rowIndex, isFirstColumn, valueGetter) {
    this.editingCell = false;
    var newValue = eInput.value;
    var colDef = column.colDef;

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
        api: this.gridOptionsWrapper.getApi(),
        context: this.gridOptionsWrapper.getContext()
    };

    if (colDef.newValueHandler) {
        colDef.newValueHandler(paramsForCallbacks);
    } else {
        node.data[colDef.field] = newValue;
    }

    // at this point, the value has been updated
    var newValue;
    if (valueGetter) {
        newValue = valueGetter();
    }
    paramsForCallbacks.newValue = newValue;
    if (typeof colDef.cellValueChanged === 'function') {
        colDef.cellValueChanged(paramsForCallbacks);
    }
    if (typeof this.gridOptionsWrapper.getCellValueChanged() === 'function') {
        this.gridOptionsWrapper.getCellValueChanged()(paramsForCallbacks);
    }

    this.populateAndStyleGridCell(valueGetter, newValue, eGridCell, isFirstColumn, node, column, rowIndex, $childScope);
};

RowRenderer.prototype.startEditing = function(eGridCell, column, node, $childScope, rowIndex, isFirstColumn, valueGetter) {
    var that = this;
    this.editingCell = true;
    utils.removeAllChildren(eGridCell);
    var eInput = document.createElement('input');
    eInput.type = 'text';
    utils.addCssClass(eInput, 'ag-cell-edit-input');

    if (valueGetter) {
        var value = valueGetter();
        if (value !== null && value !== undefined) {
            eInput.value = value;
        }
    }

    eInput.style.width = (column.actualWidth - 14) + 'px';
    eGridCell.appendChild(eInput);
    eInput.focus();
    eInput.select();

    var blurListener = function() {
        that.stopEditing(eGridCell, column, node, $childScope, eInput, blurListener, rowIndex, isFirstColumn, valueGetter);
    };

    //stop entering if we loose focus
    eInput.addEventListener("blur", blurListener);

    //stop editing if enter pressed
    eInput.addEventListener('keypress', function(event) {
        var key = event.which || event.keyCode;
        // 13 is enter
        if (key == ENTER_KEY) {
            that.stopEditing(eGridCell, column, node, $childScope, eInput, blurListener, rowIndex, isFirstColumn, valueGetter);
        }
    });

    // tab key doesn't generate keypress, so need keydown to listen for that
    eInput.addEventListener('keydown', function(event) {
        var key = event.which || event.keyCode;
        if (key == TAB_KEY) {
            that.stopEditing(eGridCell, column, node, $childScope, eInput, blurListener, rowIndex, isFirstColumn, valueGetter);
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

},{"./constants":3,"./svgFactory":22,"./utils":26}],20:[function(require,module,exports){
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

},{"./utils":26}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){

function TemplateService() {
    this.templateCache = {};
    this.waitingCallbacks = {};
}

TemplateService.prototype.init = function ($scope) {
    this.$scope = $scope;
};

// returns the template if it is loaded, or null if it is not loaded
// but will call the callback when it is loaded
TemplateService.prototype.getTemplate = function (url, callback) {

    var templateFromCache = this.templateCache[url];
    if (templateFromCache) {
        return templateFromCache;
    }

    var callbackList = this.waitingCallbacks[url];
    var that = this;
    if (!callbackList) {
        // first time this was called, so need a new list for callbacks
        callbackList = [];
        this.waitingCallbacks[url] = callbackList;
        // and also need to do the http request
        var client = new XMLHttpRequest();
        client.onload = function () { that.handleHttpResult(this, url); };
        client.open("GET", url);
        client.send();
    }

    // add this callback
    if (callback) {
        callbackList.push(callback);
    }

    // caller needs to wait for template to load, so return null
    return null;
};

TemplateService.prototype.handleHttpResult = function (httpResult, url) {

    if (httpResult.status !== 200 || httpResult.response === null) {
        console.log('Unable to get template error ' + httpResult.status + ' - ' + url);
        return;
    }

    // response success, so process it
    this.templateCache[url] = httpResult.response;

    // inform all listeners that this is now in the cache
    var callbacks = this.waitingCallbacks[url];
    for (var i = 0; i < callbacks.length; i++) {
        var callback = callbacks[i];
        // we could pass the callback the response, however we know the client of this code
        // is the cell renderer, and it passes the 'cellRefresh' method in as the callback
        // which doesn't take any parameters.
        callback();
    }

    if (this.$scope) {
        var that = this;
        setTimeout(function() {
            that.$scope.$apply();
        }, 0);
    }
};

module.exports = TemplateService;

},{}],26:[function(require,module,exports){
function Utils() {}


Utils.prototype.getValue = function(expressionService, data, colDef, node, api, context) {

    var valueGetter = colDef.valueGetter;
    var field = colDef.field;

    // if there is a value getter, this gets precedence over a field
    if (valueGetter) {

        var params = {
            data: data,
            node: node,
            colDef: colDef,
            api: api,
            context: context
        };

        if (typeof valueGetter === 'function') {
            // valueGetter is a function, so just call it
            return valueGetter(params);
        } else if (typeof valueGetter === 'string') {
            // valueGetter is an expression, so execute the expression
            return expressionService.evaluate(valueGetter, params);
        }

    } else if (field && data) {
        return data[field];
    } else {
        return undefined;
    }
};

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


Utils.prototype.getScrollbarWidth = function () {
    var outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

    document.body.appendChild(outer);

    var widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = "scroll";

    // add innerdiv
    var inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);

    var widthWithScroll = inner.offsetWidth;

    // remove divs
    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
};

module.exports = new Utils();

},{}],27:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9jb2x1bW5Db250cm9sbGVyLmpzIiwic3JjL2pzL2NvbnN0YW50cy5qcyIsInNyYy9qcy9leHByZXNzaW9uU2VydmljZS5qcyIsInNyYy9qcy9maWx0ZXIvZmlsdGVyTWFuYWdlci5qcyIsInNyYy9qcy9maWx0ZXIvbnVtYmVyRmlsdGVyLmpzIiwic3JjL2pzL2ZpbHRlci9udW1iZXJGaWx0ZXJUZW1wbGF0ZS5qcyIsInNyYy9qcy9maWx0ZXIvc2V0RmlsdGVyLmpzIiwic3JjL2pzL2ZpbHRlci9zZXRGaWx0ZXJNb2RlbC5qcyIsInNyYy9qcy9maWx0ZXIvc2V0RmlsdGVyVGVtcGxhdGUuanMiLCJzcmMvanMvZmlsdGVyL3RleHRGaWx0ZXIuanMiLCJzcmMvanMvZmlsdGVyL3RleHRGaWx0ZXJUZW1wbGF0ZS5qcyIsInNyYy9qcy9ncmlkLmpzIiwic3JjL2pzL2dyaWRPcHRpb25zV3JhcHBlci5qcyIsInNyYy9qcy9ncm91cENyZWF0b3IuanMiLCJzcmMvanMvaGVhZGVyUmVuZGVyZXIuanMiLCJzcmMvanMvaW5NZW1vcnlSb3dDb250cm9sbGVyLmpzIiwic3JjL2pzL3BhZ2luYXRpb25Db250cm9sbGVyLmpzIiwic3JjL2pzL3Jvd1JlbmRlcmVyLmpzIiwic3JjL2pzL3NlbGVjdGlvbkNvbnRyb2xsZXIuanMiLCJzcmMvanMvc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LmpzIiwic3JjL2pzL3N2Z0ZhY3RvcnkuanMiLCJzcmMvanMvdGVtcGxhdGUuanMiLCJzcmMvanMvdGVtcGxhdGVOb1Njcm9sbHMuanMiLCJzcmMvanMvdGVtcGxhdGVTZXJ2aWNlLmpzIiwic3JjL2pzL3V0aWxzLmpzIiwic3JjL2pzL3ZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2ZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9hQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hrQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBBbmd1bGFyIEdyaWRcclxuLy8gV3JpdHRlbiBieSBOaWFsbCBDcm9zYnlcclxuLy8gd3d3LmFuZ3VsYXJncmlkLmNvbVxyXG4vL1xyXG4vLyBWZXJzaW9uIDEuNC4xXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2Agb3IgYGV4cG9ydHNgXHJcbiAgICB2YXIgcm9vdCA9IHRoaXM7XHJcbiAgICB2YXIgR3JpZCA9IHJlcXVpcmUoJy4vZ3JpZCcpO1xyXG5cclxuICAgIC8vIGlmIGFuZ3VsYXIgaXMgcHJlc2VudCwgcmVnaXN0ZXIgdGhlIGRpcmVjdGl2ZVxyXG4gICAgaWYgKHR5cGVvZiBhbmd1bGFyICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHZhciBhbmd1bGFyTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoXCJhbmd1bGFyR3JpZFwiLCBbXSk7XHJcbiAgICAgICAgYW5ndWxhck1vZHVsZS5kaXJlY3RpdmUoXCJhbmd1bGFyR3JpZFwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiBcIkFcIixcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJGVsZW1lbnQnLCAnJHNjb3BlJywgJyRjb21waWxlJywgQW5ndWxhckRpcmVjdGl2ZUNvbnRyb2xsZXJdLFxyXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyR3JpZDogXCI9XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XHJcbiAgICAgICAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXJHcmlkR2xvYmFsRnVuY3Rpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGV4cG9ydHMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZEdsb2JhbEZ1bmN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHJvb3QuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZEdsb2JhbEZ1bmN0aW9uO1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBBbmd1bGFyRGlyZWN0aXZlQ29udHJvbGxlcigkZWxlbWVudCwgJHNjb3BlLCAkY29tcGlsZSkge1xyXG4gICAgICAgIHZhciBlR3JpZERpdiA9ICRlbGVtZW50WzBdO1xyXG4gICAgICAgIHZhciBncmlkT3B0aW9ucyA9ICRzY29wZS5hbmd1bGFyR3JpZDtcclxuICAgICAgICBpZiAoIWdyaWRPcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIldBUk5JTkcgLSBncmlkIG9wdGlvbnMgZm9yIEFuZ3VsYXIgR3JpZCBub3QgZm91bmQuIFBsZWFzZSBlbnN1cmUgdGhlIGF0dHJpYnV0ZSBhbmd1bGFyLWdyaWQgcG9pbnRzIHRvIGEgdmFsaWQgb2JqZWN0IG9uIHRoZSBzY29wZVwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZ3JpZCA9IG5ldyBHcmlkKGVHcmlkRGl2LCBncmlkT3B0aW9ucywgJHNjb3BlLCAkY29tcGlsZSk7XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oXCIkZGVzdHJveVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZ3JpZC5zZXRGaW5pc2hlZCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdsb2JhbCBGdW5jdGlvbiAtIHRoaXMgZnVuY3Rpb24gaXMgdXNlZCBmb3IgY3JlYXRpbmcgYSBncmlkLCBvdXRzaWRlIG9mIGFueSBBbmd1bGFySlNcclxuICAgIGZ1bmN0aW9uIGFuZ3VsYXJHcmlkR2xvYmFsRnVuY3Rpb24oZWxlbWVudCwgZ3JpZE9wdGlvbnMpIHtcclxuICAgICAgICAvLyBzZWUgaWYgZWxlbWVudCBpcyBhIHF1ZXJ5IHNlbGVjdG9yLCBvciBhIHJlYWwgZWxlbWVudFxyXG4gICAgICAgIHZhciBlR3JpZERpdjtcclxuICAgICAgICBpZiAodHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGVHcmlkRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbGVtZW50KTtcclxuICAgICAgICAgICAgaWYgKCFlR3JpZERpdikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1dBUk5JTkcgLSB3YXMgbm90IGFibGUgdG8gZmluZCBlbGVtZW50ICcgKyBlbGVtZW50ICsgJyBpbiB0aGUgRE9NLCBBbmd1bGFyIEdyaWQgaW5pdGlhbGlzYXRpb24gYWJvcnRlZC4nKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVHcmlkRGl2ID0gZWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmV3IEdyaWQoZUdyaWREaXYsIGdyaWRPcHRpb25zLCBudWxsLCBudWxsKTtcclxuICAgIH1cclxuXHJcbn0pLmNhbGwod2luZG93KTtcclxuIiwidmFyIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XHJcblxyXG5mdW5jdGlvbiBDb2x1bW5Db250cm9sbGVyKCkge1xyXG4gICAgdGhpcy5jcmVhdGVNb2RlbCgpO1xyXG59XHJcblxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oYW5ndWxhckdyaWQsIHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSwgZ3JpZE9wdGlvbnNXcmFwcGVyKSB7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZDtcclxuICAgIHRoaXMuc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5ID0gc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5O1xyXG59O1xyXG5cclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuY3JlYXRlTW9kZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHRoaXMubW9kZWwgPSB7XHJcbiAgICAgICAgLy8gdXNlZCBieTpcclxuICAgICAgICAvLyArIGluTWVtb3J5Um93Q29udHJvbGxlciAtPiBzb3J0aW5nLCBidWlsZGluZyBxdWljayBmaWx0ZXIgdGV4dFxyXG4gICAgICAgIC8vICsgaGVhZGVyUmVuZGVyZXIgLT4gc29ydGluZyAoY2xlYXJpbmcgaWNvbilcclxuICAgICAgICBnZXRBbGxDb2x1bW5zOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuY29sdW1ucztcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vICsgcm93Q29udHJvbGxlciAtPiB3aGlsZSBpbnNlcnRpbmcgcm93cywgYW5kIHdoZW4gdGFiYmluZyB0aHJvdWdoIGNlbGxzIChuZWVkIHRvIGNoYW5nZSB0aGlzKVxyXG4gICAgICAgIC8vIG5lZWQgYSBuZXdNZXRob2QgLSBnZXQgbmV4dCBjb2wgaW5kZXhcclxuICAgICAgICBnZXRWaXNpYmxlQ29sdW1uczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnZpc2libGVDb2x1bW5zO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gdXNlZCBieTpcclxuICAgICAgICAvLyArIGFuZ3VsYXJHcmlkIC0+IGZvciBzZXR0aW5nIGJvZHkgd2lkdGhcclxuICAgICAgICAvLyArIHJvd0NvbnRyb2xsZXIgLT4gc2V0dGluZyBtYWluIHJvdyB3aWR0aHMgKHdoZW4gaW5zZXJ0aW5nIGFuZCByZXNpemluZylcclxuICAgICAgICBnZXRCb2R5Q29udGFpbmVyV2lkdGg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5nZXRUb3RhbENvbFdpZHRoKGZhbHNlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIHVzZWQgYnk6XHJcbiAgICAgICAgLy8gKyBhbmd1bGFyR3JpZCAtPiBzZXR0aW5nIHBpbm5lZCBib2R5IHdpZHRoXHJcbiAgICAgICAgZ2V0UGlubmVkQ29udGFpbmVyV2lkdGg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5nZXRUb3RhbENvbFdpZHRoKHRydWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gdXNlZCBieTpcclxuICAgICAgICAvLyArIGhlYWRlclJlbmRlcmVyIC0+IHNldHRpbmcgcGlubmVkIGJvZHkgd2lkdGhcclxuICAgICAgICBnZXRDb2x1bW5Hcm91cHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5jb2x1bW5Hcm91cHM7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmdldE1vZGVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbDtcclxufTtcclxuXHJcbi8vIGNhbGxlZCBieSBhbmd1bGFyR3JpZFxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5zZXRDb2x1bW5zID0gZnVuY3Rpb24oY29sdW1uRGVmcykge1xyXG4gICAgdGhpcy5idWlsZENvbHVtbnMoY29sdW1uRGVmcyk7XHJcbiAgICB0aGlzLmVuc3VyZUVhY2hDb2xIYXNTaXplKCk7XHJcbiAgICB0aGlzLmJ1aWxkR3JvdXBzKCk7XHJcbiAgICB0aGlzLnVwZGF0ZUdyb3VwcygpO1xyXG4gICAgdGhpcy51cGRhdGVWaXNpYmxlQ29sdW1ucygpO1xyXG59O1xyXG5cclxuLy8gY2FsbGVkIGJ5IGhlYWRlclJlbmRlcmVyIC0gd2hlbiBhIGhlYWRlciBpcyBvcGVuZWQgb3IgY2xvc2VkXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmNvbHVtbkdyb3VwT3BlbmVkID0gZnVuY3Rpb24oZ3JvdXApIHtcclxuICAgIGdyb3VwLmV4cGFuZGVkID0gIWdyb3VwLmV4cGFuZGVkO1xyXG4gICAgdGhpcy51cGRhdGVHcm91cHMoKTtcclxuICAgIHRoaXMudXBkYXRlVmlzaWJsZUNvbHVtbnMoKTtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQucmVmcmVzaEhlYWRlckFuZEJvZHkoKTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlVmlzaWJsZUNvbHVtbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGlmIG5vdCBncm91cGluZyBieSBoZWFkZXJzLCB0aGVuIGFsbCBjb2x1bW5zIGFyZSB2aXNpYmxlXHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBIZWFkZXJzKCkpIHtcclxuICAgICAgICB0aGlzLnZpc2libGVDb2x1bW5zID0gdGhpcy5jb2x1bW5zO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBncm91cGluZywgdGhlbiBvbmx5IHNob3cgY29sIGFzIHBlciBncm91cCBydWxlc1xyXG4gICAgdGhpcy52aXNpYmxlQ29sdW1ucyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbHVtbkdyb3Vwcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBncm91cCA9IHRoaXMuY29sdW1uR3JvdXBzW2ldO1xyXG4gICAgICAgIGdyb3VwLmFkZFRvVmlzaWJsZUNvbHVtbnModGhpcy52aXNpYmxlQ29sdW1ucyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgLSBjYWxsZWQgZnJvbSBhcGlcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuY29uc3VtZVVudXNlZENvbHVtbldpZHRoID0gZnVuY3Rpb24oYXZhaWxhYmxlV2lkdGgpIHtcclxuICAgIC8vIGF2b2lkIGRpdmlkZSBieSB6ZXJvXHJcbiAgICBpZiAoYXZhaWxhYmxlV2lkdGggPD0gMCB8fCB0aGlzLnZpc2libGVDb2x1bW5zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY29sRGVmaW5lZCA9IHRoaXMuZ2V0VG90YWxEZWZpbmVkQ29sV2lkdGgoKTtcclxuICAgIHZhciBsZWZ0b3ZlcldpZHRoID0gYXZhaWxhYmxlV2lkdGggLSBjb2xEZWZpbmVkLmRlZmluZWRXaWR0aDtcclxuXHJcbiAgICBpZiAoY29sRGVmaW5lZC51bmRlZmluZWRDb2xzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAvL01hdGguZmxvb3JcclxuICAgICAgICB2YXIgY29sV2lkdGggPSBsZWZ0b3ZlcldpZHRoIC8gY29sRGVmaW5lZC51bmRlZmluZWRDb2xzLmxlbmd0aDtcclxuICAgICAgICBjb2xEZWZpbmVkLnVuZGVmaW5lZENvbHMuZm9yRWFjaChmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgICAgICAgICAgY29sdW1uLmFjdHVhbFdpZHRoID0gY29sV2lkdGg7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gd2lkdGhzIHNldCwgcmVmcmVzaCB0aGUgZ3VpXHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkLnJlZnJlc2hIZWFkZXJBbmRCb2R5KCk7XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgLSBjYWxsZWQgZnJvbSBhcGlcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuc2l6ZUNvbHVtbnNUb0ZpdCA9IGZ1bmN0aW9uKGF2YWlsYWJsZVdpZHRoKSB7XHJcbiAgICAvLyBhdm9pZCBkaXZpZGUgYnkgemVyb1xyXG4gICAgaWYgKGF2YWlsYWJsZVdpZHRoIDw9IDAgfHwgdGhpcy52aXNpYmxlQ29sdW1ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGN1cnJlbnRUb3RhbFdpZHRoID0gdGhpcy5nZXRUb3RhbENvbFdpZHRoKCk7XHJcbiAgICB2YXIgc2NhbGUgPSBhdmFpbGFibGVXaWR0aCAvIGN1cnJlbnRUb3RhbFdpZHRoO1xyXG5cclxuICAgIC8vIHNpemUgYWxsIGNvbHMgZXhjZXB0IHRoZSBsYXN0IGJ5IHRoZSBzY2FsZVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAodGhpcy52aXNpYmxlQ29sdW1ucy5sZW5ndGggLSAxKTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNvbHVtbiA9IHRoaXMudmlzaWJsZUNvbHVtbnNbaV07XHJcbiAgICAgICAgdmFyIG5ld1dpZHRoID0gcGFyc2VJbnQoY29sdW1uLmFjdHVhbFdpZHRoICogc2NhbGUpO1xyXG4gICAgICAgIGNvbHVtbi5hY3R1YWxXaWR0aCA9IG5ld1dpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHNpemUgdGhlIGxhc3QgYnkgd2hhdHMgcmVtYWluaW5nICh0aGlzIGF2b2lkcyByb3VuZGluZyBlcnJvcnMgdGhhdCBjb3VsZFxyXG4gICAgLy8gb2NjdXIgd2l0aCBzY2FsaW5nIGV2ZXJ5dGhpbmcsIHdoZXJlIGl0IHJlc3VsdCBpbiBzb21lIHBpeGVscyBvZmYpXHJcbiAgICB2YXIgcGl4ZWxzTGVmdEZvckxhc3RDb2wgPSBhdmFpbGFibGVXaWR0aCAtIHRoaXMuZ2V0VG90YWxDb2xXaWR0aCgpO1xyXG4gICAgdmFyIGxhc3RDb2x1bW4gPSB0aGlzLnZpc2libGVDb2x1bW5zW3RoaXMudmlzaWJsZUNvbHVtbnMubGVuZ3RoIC0gMV07XHJcbiAgICBsYXN0Q29sdW1uLmFjdHVhbFdpZHRoICs9IHBpeGVsc0xlZnRGb3JMYXN0Q29sO1xyXG5cclxuICAgIC8vIHdpZHRocyBzZXQsIHJlZnJlc2ggdGhlIGd1aVxyXG4gICAgdGhpcy5hbmd1bGFyR3JpZC5yZWZyZXNoSGVhZGVyQW5kQm9keSgpO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5idWlsZEdyb3VwcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gaWYgbm90IGdyb3VwaW5nIGJ5IGhlYWRlcnMsIGRvIG5vdGhpbmdcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEhlYWRlcnMoKSkge1xyXG4gICAgICAgIHRoaXMuY29sdW1uR3JvdXBzID0gbnVsbDtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc3BsaXQgdGhlIGNvbHVtbnMgaW50byBncm91cHNcclxuICAgIHZhciBjdXJyZW50R3JvdXAgPSBudWxsO1xyXG4gICAgdGhpcy5jb2x1bW5Hcm91cHMgPSBbXTtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICB2YXIgbGFzdENvbFdhc1Bpbm5lZCA9IHRydWU7XHJcblxyXG4gICAgdGhpcy5jb2x1bW5zLmZvckVhY2goZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICAgICAgLy8gZG8gd2UgbmVlZCBhIG5ldyBncm91cCwgYmVjYXVzZSB3ZSBtb3ZlIGZyb20gcGlubmVkIHRvIG5vbi1waW5uZWQgY29sdW1ucz9cclxuICAgICAgICB2YXIgZW5kT2ZQaW5uZWRIZWFkZXIgPSBsYXN0Q29sV2FzUGlubmVkICYmICFjb2x1bW4ucGlubmVkO1xyXG4gICAgICAgIGlmICghY29sdW1uLnBpbm5lZCkge1xyXG4gICAgICAgICAgICBsYXN0Q29sV2FzUGlubmVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGRvIHdlIG5lZWQgYSBuZXcgZ3JvdXAsIGJlY2F1c2UgdGhlIGdyb3VwIG5hbWVzIGRvZXNuJ3QgbWF0Y2ggZnJvbSBwcmV2aW91cyBjb2w/XHJcbiAgICAgICAgdmFyIGdyb3VwS2V5TWlzbWF0Y2ggPSBjdXJyZW50R3JvdXAgJiYgY29sdW1uLmNvbERlZi5ncm91cCAhPT0gY3VycmVudEdyb3VwLm5hbWU7XHJcbiAgICAgICAgLy8gd2UgZG9uJ3QgZ3JvdXAgY29sdW1ucyB3aGVyZSBubyBncm91cCBpcyBzcGVjaWZpZWRcclxuICAgICAgICB2YXIgY29sTm90SW5Hcm91cCA9IGN1cnJlbnRHcm91cCAmJiAhY3VycmVudEdyb3VwLm5hbWU7XHJcbiAgICAgICAgLy8gZG8gd2UgbmVlZCBhIG5ldyBncm91cCwgYmVjYXVzZSB3ZSBhcmUganVzdCBzdGFydGluZ1xyXG4gICAgICAgIHZhciBwcm9jZXNzaW5nRmlyc3RDb2wgPSBjb2x1bW4uaW5kZXggPT09IDA7XHJcbiAgICAgICAgdmFyIG5ld0dyb3VwTmVlZGVkID0gcHJvY2Vzc2luZ0ZpcnN0Q29sIHx8IGVuZE9mUGlubmVkSGVhZGVyIHx8IGdyb3VwS2V5TWlzbWF0Y2ggfHwgY29sTm90SW5Hcm91cDtcclxuICAgICAgICAvLyBjcmVhdGUgbmV3IGdyb3VwLCBpZiBpdCdzIG5lZWRlZFxyXG4gICAgICAgIGlmIChuZXdHcm91cE5lZWRlZCkge1xyXG4gICAgICAgICAgICB2YXIgcGlubmVkID0gY29sdW1uLnBpbm5lZDtcclxuICAgICAgICAgICAgY3VycmVudEdyb3VwID0gbmV3IENvbHVtbkdyb3VwKHBpbm5lZCwgY29sdW1uLmNvbERlZi5ncm91cCk7XHJcbiAgICAgICAgICAgIHRoYXQuY29sdW1uR3JvdXBzLnB1c2goY3VycmVudEdyb3VwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY3VycmVudEdyb3VwLmFkZENvbHVtbihjb2x1bW4pO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZUdyb3VwcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gaWYgbm90IGdyb3VwaW5nIGJ5IGhlYWRlcnMsIGRvIG5vdGhpbmdcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEhlYWRlcnMoKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29sdW1uR3JvdXBzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gdGhpcy5jb2x1bW5Hcm91cHNbaV07XHJcbiAgICAgICAgZ3JvdXAuY2FsY3VsYXRlRXhwYW5kYWJsZSgpO1xyXG4gICAgICAgIGdyb3VwLmNhbGN1bGF0ZVZpc2libGVDb2x1bW5zKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmJ1aWxkQ29sdW1ucyA9IGZ1bmN0aW9uKGNvbHVtbkRlZnMpIHtcclxuICAgIHRoaXMuY29sdW1ucyA9IFtdO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIHBpbm5lZENvbHVtbkNvdW50ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0UGlubmVkQ29sQ291bnQoKTtcclxuICAgIGlmIChjb2x1bW5EZWZzKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2x1bW5EZWZzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBjb2xEZWYgPSBjb2x1bW5EZWZzW2ldO1xyXG4gICAgICAgICAgICAvLyB0aGlzIGlzIG1lc3N5IC0gd2Ugc3dhcCBpbiBhbm90aGVyIGNvbCBkZWYgaWYgaXQncyBjaGVja2JveCBzZWxlY3Rpb24gLSBub3QgaGFwcHkgOihcclxuICAgICAgICAgICAgaWYgKGNvbERlZiA9PT0gJ2NoZWNrYm94U2VsZWN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgY29sRGVmID0gdGhhdC5zZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkuY3JlYXRlQ2hlY2tib3hDb2xEZWYoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgcGlubmVkID0gcGlubmVkQ29sdW1uQ291bnQgPiBpO1xyXG4gICAgICAgICAgICB2YXIgY29sdW1uID0gbmV3IENvbHVtbihjb2xEZWYsIGksIHBpbm5lZCk7XHJcbiAgICAgICAgICAgIHRoYXQuY29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyBzZXQgdGhlIGFjdHVhbCB3aWR0aHMgZm9yIGVhY2ggY29sXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmVuc3VyZUVhY2hDb2xIYXNTaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZGVmYXVsdFdpZHRoID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29sV2lkdGgoKTtcclxuICAgIGlmICh0eXBlb2YgZGVmYXVsdFdpZHRoICE9PSAnbnVtYmVyJyB8fCBkZWZhdWx0V2lkdGggPCBjb25zdGFudHMuTUlOX0NPTF9XSURUSCkge1xyXG4gICAgICAgIGRlZmF1bHRXaWR0aCA9IDIwMDtcclxuICAgIH1cclxuICAgIHRoaXMuY29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbERlZldyYXBwZXIpIHtcclxuICAgICAgICB2YXIgY29sRGVmID0gY29sRGVmV3JhcHBlci5jb2xEZWY7XHJcbiAgICAgICAgaWYgKGNvbERlZldyYXBwZXIuYWN0dWFsV2lkdGgpIHtcclxuICAgICAgICAgICAgLy8gaWYgYWN0dWFsIHdpZHRoIGFscmVhZHkgc2V0LCBkbyBub3RoaW5nXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9IGVsc2UgaWYgKCFjb2xEZWYud2lkdGgpIHtcclxuICAgICAgICAgICAgLy8gaWYgbm8gd2lkdGggZGVmaW5lZCBpbiBjb2xEZWYsIGRlZmF1bHQgdG8gMjAwXHJcbiAgICAgICAgICAgIGNvbERlZldyYXBwZXIuYWN0dWFsV2lkdGggPSBkZWZhdWx0V2lkdGg7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2xEZWYud2lkdGggPCBjb25zdGFudHMuTUlOX0NPTF9XSURUSCkge1xyXG4gICAgICAgICAgICAvLyBpZiB3aWR0aCBpbiBjb2wgZGVmIHRvIHNtYWxsLCBzZXQgdG8gbWluIHdpZHRoXHJcbiAgICAgICAgICAgIGNvbERlZldyYXBwZXIuYWN0dWFsV2lkdGggPSBjb25zdGFudHMuTUlOX0NPTF9XSURUSDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UgdXNlIHRoZSBwcm92aWRlZCB3aWR0aFxyXG4gICAgICAgICAgICBjb2xEZWZXcmFwcGVyLmFjdHVhbFdpZHRoID0gY29sRGVmLndpZHRoO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyBjYWxsIHdpdGggdHJ1ZSAocGlubmVkKSwgZmFsc2UgKG5vdC1waW5uZWQpIG9yIHVuZGVmaW5lZCAoYWxsIGNvbHVtbnMpXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmdldFRvdGFsQ29sV2lkdGggPSBmdW5jdGlvbihpbmNsdWRlUGlubmVkKSB7XHJcbiAgICB2YXIgd2lkdGhTb0ZhciA9IDA7XHJcbiAgICB2YXIgcGluZWROb3RJbXBvcnRhbnQgPSB0eXBlb2YgaW5jbHVkZVBpbm5lZCAhPT0gJ2Jvb2xlYW4nO1xyXG5cclxuICAgIHRoaXMudmlzaWJsZUNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgICAgICB2YXIgaW5jbHVkZVRoaXNDb2wgPSBwaW5lZE5vdEltcG9ydGFudCB8fCBjb2x1bW4ucGlubmVkID09PSBpbmNsdWRlUGlubmVkO1xyXG4gICAgICAgIGlmIChpbmNsdWRlVGhpc0NvbCkge1xyXG4gICAgICAgICAgICB3aWR0aFNvRmFyICs9IGNvbHVtbi5hY3R1YWxXaWR0aDtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gd2lkdGhTb0ZhcjtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuLy8gY2FsbCB3aXRoIHRydWUgKHBpbm5lZCksIGZhbHNlIChub3QtcGlubmVkKSBvciB1bmRlZmluZWQgKGFsbCBjb2x1bW5zKVxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5nZXRUb3RhbERlZmluZWRDb2xXaWR0aCA9IGZ1bmN0aW9uKGluY2x1ZGVQaW5uZWQpIHtcclxuICAgIHZhciByZXQgPSB7XHJcbiAgICAgICAgZGVmaW5lZFdpZHRoOiAwLFxyXG4gICAgICAgIGRlZmluZWRDb2xzOiBbXSxcclxuICAgICAgICB1bmRlZmluZWRDb2xzOiBbXVxyXG4gICAgfTtcclxuICAgIHZhciB3aWR0aFNvRmFyID0gMDtcclxuICAgIHZhciBwaW5lZE5vdEltcG9ydGFudCA9IHR5cGVvZiBpbmNsdWRlUGlubmVkICE9PSAnYm9vbGVhbic7XHJcblxyXG4gICAgdGhpcy52aXNpYmxlQ29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgICAgIHZhciBpbmNsdWRlVGhpc0NvbCA9IHBpbmVkTm90SW1wb3J0YW50IHx8IGNvbHVtbi5waW5uZWQgPT09IGluY2x1ZGVQaW5uZWQ7XHJcbiAgICAgICAgaWYgKGluY2x1ZGVUaGlzQ29sKSB7XHJcbiAgICAgICAgICAgIGlmKGNvbHVtbi5jb2xEZWYud2lkdGgpe1xyXG4gICAgICAgICAgICAgICAgcmV0LmRlZmluZWRXaWR0aCArPSBjb2x1bW4uY29sRGVmLndpZHRoO1xyXG4gICAgICAgICAgICAgICAgcmV0LmRlZmluZWRDb2xzLnB1c2goY29sdW1uKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldC51bmRlZmluZWRDb2xzLnB1c2goY29sdW1uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXQ7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBDb2x1bW5Hcm91cChwaW5uZWQsIG5hbWUpIHtcclxuICAgIHRoaXMucGlubmVkID0gcGlubmVkO1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIHRoaXMuYWxsQ29sdW1ucyA9IFtdO1xyXG4gICAgdGhpcy52aXNpYmxlQ29sdW1ucyA9IFtdO1xyXG4gICAgdGhpcy5leHBhbmRhYmxlID0gZmFsc2U7IC8vIHdoZXRoZXIgdGhpcyBncm91cCBjYW4gYmUgZXhwYW5kZWQgb3Igbm90XHJcbiAgICB0aGlzLmV4cGFuZGVkID0gZmFsc2U7XHJcbn1cclxuXHJcbkNvbHVtbkdyb3VwLnByb3RvdHlwZS5hZGRDb2x1bW4gPSBmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgIHRoaXMuYWxsQ29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbn07XHJcblxyXG4vLyBuZWVkIHRvIGNoZWNrIHRoYXQgdGhpcyBncm91cCBoYXMgYXQgbGVhc3Qgb25lIGNvbCBzaG93aW5nIHdoZW4gYm90aCBleHBhbmRlZCBhbmQgY29udHJhY3RlZC5cclxuLy8gaWYgbm90LCB0aGVuIHdlIGRvbid0IGFsbG93IGV4cGFuZGluZyBhbmQgY29udHJhY3Rpbmcgb24gdGhpcyBncm91cFxyXG5Db2x1bW5Hcm91cC5wcm90b3R5cGUuY2FsY3VsYXRlRXhwYW5kYWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gd2FudCB0byBtYWtlIHN1cmUgdGhlIGdyb3VwIGRvZXNuJ3QgZGlzYXBwZWFyIHdoZW4gaXQncyBvcGVuXHJcbiAgICB2YXIgYXRMZWFzdE9uZVNob3dpbmdXaGVuT3BlbiA9IGZhbHNlO1xyXG4gICAgLy8gd2FudCB0byBtYWtlIHN1cmUgdGhlIGdyb3VwIGRvZXNuJ3QgZGlzYXBwZWFyIHdoZW4gaXQncyBjbG9zZWRcclxuICAgIHZhciBhdExlYXN0T25lU2hvd2luZ1doZW5DbG9zZWQgPSBmYWxzZTtcclxuICAgIC8vIHdhbnQgdG8gbWFrZSBzdXJlIHRoZSBncm91cCBoYXMgc29tZXRoaW5nIHRvIHNob3cgLyBoaWRlXHJcbiAgICB2YXIgYXRMZWFzdE9uZUNoYW5nZWFibGUgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBqID0gdGhpcy5hbGxDb2x1bW5zLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICAgIHZhciBjb2x1bW4gPSB0aGlzLmFsbENvbHVtbnNbaV07XHJcbiAgICAgICAgaWYgKGNvbHVtbi5jb2xEZWYuZ3JvdXBTaG93ID09PSAnb3BlbicpIHtcclxuICAgICAgICAgICAgYXRMZWFzdE9uZVNob3dpbmdXaGVuT3BlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVDaGFuZ2VhYmxlID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbHVtbi5jb2xEZWYuZ3JvdXBTaG93ID09PSAnY2xvc2VkJykge1xyXG4gICAgICAgICAgICBhdExlYXN0T25lU2hvd2luZ1doZW5DbG9zZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBhdExlYXN0T25lQ2hhbmdlYWJsZSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYXRMZWFzdE9uZVNob3dpbmdXaGVuT3BlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVTaG93aW5nV2hlbkNsb3NlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZXhwYW5kYWJsZSA9IGF0TGVhc3RPbmVTaG93aW5nV2hlbk9wZW4gJiYgYXRMZWFzdE9uZVNob3dpbmdXaGVuQ2xvc2VkICYmIGF0TGVhc3RPbmVDaGFuZ2VhYmxlO1xyXG59O1xyXG5cclxuQ29sdW1uR3JvdXAucHJvdG90eXBlLmNhbGN1bGF0ZVZpc2libGVDb2x1bW5zID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBjbGVhciBvdXQgbGFzdCB0aW1lIHdlIGNhbGN1bGF0ZWRcclxuICAgIHRoaXMudmlzaWJsZUNvbHVtbnMgPSBbXTtcclxuICAgIC8vIGl0IG5vdCBleHBhbmRhYmxlLCBldmVyeXRoaW5nIGlzIHZpc2libGVcclxuICAgIGlmICghdGhpcy5leHBhbmRhYmxlKSB7XHJcbiAgICAgICAgdGhpcy52aXNpYmxlQ29sdW1ucyA9IHRoaXMuYWxsQ29sdW1ucztcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAvLyBhbmQgY2FsY3VsYXRlIGFnYWluXHJcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IHRoaXMuYWxsQ29sdW1ucy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgICB2YXIgY29sdW1uID0gdGhpcy5hbGxDb2x1bW5zW2ldO1xyXG4gICAgICAgIHN3aXRjaCAoY29sdW1uLmNvbERlZi5ncm91cFNob3cpIHtcclxuICAgICAgICAgICAgY2FzZSAnb3Blbic6XHJcbiAgICAgICAgICAgICAgICAvLyB3aGVuIHNldCB0byBvcGVuLCBvbmx5IHNob3cgY29sIGlmIGdyb3VwIGlzIG9wZW5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmV4cGFuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aXNpYmxlQ29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnY2xvc2VkJzpcclxuICAgICAgICAgICAgICAgIC8vIHdoZW4gc2V0IHRvIG9wZW4sIG9ubHkgc2hvdyBjb2wgaWYgZ3JvdXAgaXMgb3BlblxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmV4cGFuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aXNpYmxlQ29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8vIGRlZmF1bHQgaXMgYWx3YXlzIHNob3cgdGhlIGNvbHVtblxyXG4gICAgICAgICAgICAgICAgdGhpcy52aXNpYmxlQ29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5Db2x1bW5Hcm91cC5wcm90b3R5cGUuYWRkVG9WaXNpYmxlQ29sdW1ucyA9IGZ1bmN0aW9uKGFsbFZpc2libGVDb2x1bW5zKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmlzaWJsZUNvbHVtbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgY29sdW1uID0gdGhpcy52aXNpYmxlQ29sdW1uc1tpXTtcclxuICAgICAgICBhbGxWaXNpYmxlQ29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5mdW5jdGlvbiBDb2x1bW4oY29sRGVmLCBpbmRleCwgcGlubmVkKSB7XHJcbiAgICB0aGlzLmNvbERlZiA9IGNvbERlZjtcclxuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcclxuICAgIHRoaXMucGlubmVkID0gcGlubmVkO1xyXG4gICAgLy8gaW4gdGhlIGZ1dHVyZSwgdGhlIGNvbEtleSBtaWdodCBiZSBzb21ldGhpbmcgb3RoZXIgdGhhbiB0aGUgaW5kZXhcclxuICAgIHRoaXMuY29sS2V5ID0gaW5kZXg7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29sdW1uQ29udHJvbGxlcjtcclxuIiwidmFyIGNvbnN0YW50cyA9IHtcclxuICAgIFNURVBfRVZFUllUSElORzogMCxcclxuICAgIFNURVBfRklMVEVSOiAxLFxyXG4gICAgU1RFUF9TT1JUOiAyLFxyXG4gICAgU1RFUF9NQVA6IDMsXHJcbiAgICBBU0M6IFwiYXNjXCIsXHJcbiAgICBERVNDOiBcImRlc2NcIixcclxuICAgIFJPV19CVUZGRVJfU0laRTogNSxcclxuICAgIFNPUlRfU1RZTEVfU0hPVzogXCJkaXNwbGF5OmlubGluZTtcIixcclxuICAgIFNPUlRfU1RZTEVfSElERTogXCJkaXNwbGF5Om5vbmU7XCIsXHJcbiAgICBNSU5fQ09MX1dJRFRIOiAxMCxcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY29uc3RhbnRzO1xyXG4iLCJmdW5jdGlvbiBFeHByZXNzaW9uU2VydmljZSgpIHt9XHJcblxyXG5FeHByZXNzaW9uU2VydmljZS5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbihydWxlLCBwYXJhbXMpIHtcclxufTtcclxuXHJcbmZ1bmN0aW9uIEV4cHJlc3Npb25TZXJ2aWNlKCkge1xyXG4gICAgdGhpcy5leHByZXNzaW9uVG9GdW5jdGlvbkNhY2hlID0ge307XHJcbn1cclxuXHJcbkV4cHJlc3Npb25TZXJ2aWNlLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uIChleHByZXNzaW9uLCBwYXJhbXMpIHtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIHZhciBqYXZhU2NyaXB0RnVuY3Rpb24gPSB0aGlzLmNyZWF0ZUV4cHJlc3Npb25GdW5jdGlvbihleHByZXNzaW9uKTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gamF2YVNjcmlwdEZ1bmN0aW9uKHBhcmFtcy52YWx1ZSwgcGFyYW1zLmNvbnRleHQsIHBhcmFtcy5ub2RlLFxyXG4gICAgICAgICAgICBwYXJhbXMuZGF0YSwgcGFyYW1zLmNvbERlZiwgcGFyYW1zLnJvd0luZGV4LCBwYXJhbXMuYXBpKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIC8vIHRoZSBleHByZXNzaW9uIGZhaWxlZCwgd2hpY2ggY2FuIGhhcHBlbiwgYXMgaXQncyB0aGUgY2xpZW50IHRoYXRcclxuICAgICAgICAvLyBwcm92aWRlcyB0aGUgZXhwcmVzc2lvbi4gc28gcHJpbnQgYSBuaWNlIG1lc3NhZ2VcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdQcm9jZXNzaW5nIG9mIHRoZSBleHByZXNzaW9uIGZhaWxlZCcpO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0V4cHJlc3Npb24gPSAnICsgZXhwcmVzc2lvbik7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRXhjZXB0aW9uID0gJyArIGUpO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59O1xyXG5cclxuRXhwcmVzc2lvblNlcnZpY2UucHJvdG90eXBlLmNyZWF0ZUV4cHJlc3Npb25GdW5jdGlvbiA9IGZ1bmN0aW9uIChleHByZXNzaW9uKSB7XHJcbiAgICAvLyBjaGVjayBjYWNoZSBmaXJzdFxyXG4gICAgaWYgKHRoaXMuZXhwcmVzc2lvblRvRnVuY3Rpb25DYWNoZVtleHByZXNzaW9uXSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV4cHJlc3Npb25Ub0Z1bmN0aW9uQ2FjaGVbZXhwcmVzc2lvbl07XHJcbiAgICB9XHJcbiAgICAvLyBpZiBub3QgZm91bmQgaW4gY2FjaGUsIHJldHVybiB0aGUgZnVuY3Rpb25cclxuICAgIHZhciBmdW5jdGlvbkJvZHkgPSB0aGlzLmNyZWF0ZUZ1bmN0aW9uQm9keShleHByZXNzaW9uKTtcclxuICAgIHZhciB0aGVGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbigneCwgY3R4LCBub2RlLCBkYXRhLCBjb2xEZWYsIHJvd0luZGV4LCBhcGknLCBmdW5jdGlvbkJvZHkpO1xyXG5cclxuICAgIC8vIHN0b3JlIGluIGNhY2hlXHJcbiAgICB0aGlzLmV4cHJlc3Npb25Ub0Z1bmN0aW9uQ2FjaGVbZXhwcmVzc2lvbl0gPSB0aGVGdW5jdGlvbjtcclxuXHJcbiAgICByZXR1cm4gdGhlRnVuY3Rpb247XHJcbn07XHJcblxyXG5FeHByZXNzaW9uU2VydmljZS5wcm90b3R5cGUuY3JlYXRlRnVuY3Rpb25Cb2R5ID0gZnVuY3Rpb24gKGV4cHJlc3Npb24pIHtcclxuICAgIC8vIGlmIHRoZSBleHByZXNzaW9uIGhhcyB0aGUgJ3JldHVybicgd29yZCBpbiBpdCwgdGhlbiB1c2UgYXMgaXMsXHJcbiAgICAvLyBpZiBub3QsIHRoZW4gd3JhcCBpdCB3aXRoIHJldHVybiBhbmQgJzsnIHRvIG1ha2UgYSBmdW5jdGlvblxyXG4gICAgaWYgKGV4cHJlc3Npb24uaW5kZXhPZigncmV0dXJuJykgPj0gMCkge1xyXG4gICAgICAgIHJldHVybiBleHByZXNzaW9uO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gJ3JldHVybiAnICsgZXhwcmVzc2lvbiArICc7JztcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRXhwcmVzc2lvblNlcnZpY2U7XHJcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcclxudmFyIFNldEZpbHRlciA9IHJlcXVpcmUoJy4vc2V0RmlsdGVyJyk7XHJcbnZhciBOdW1iZXJGaWx0ZXIgPSByZXF1aXJlKCcuL251bWJlckZpbHRlcicpO1xyXG52YXIgU3RyaW5nRmlsdGVyID0gcmVxdWlyZSgnLi90ZXh0RmlsdGVyJyk7XHJcblxyXG5mdW5jdGlvbiBGaWx0ZXJNYW5hZ2VyKCkge31cclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihncmlkLCBncmlkT3B0aW9uc1dyYXBwZXIsICRjb21waWxlLCAkc2NvcGUpIHtcclxuICAgIHRoaXMuJGNvbXBpbGUgPSAkY29tcGlsZTtcclxuICAgIHRoaXMuJHNjb3BlID0gJHNjb3BlO1xyXG4gICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIgPSBncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB0aGlzLmdyaWQgPSBncmlkO1xyXG4gICAgdGhpcy5hbGxGaWx0ZXJzID0ge307XHJcbn07XHJcblxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5zZXRSb3dNb2RlbCA9IGZ1bmN0aW9uKHJvd01vZGVsKSB7XHJcbiAgICB0aGlzLnJvd01vZGVsID0gcm93TW9kZWw7XHJcbn07XHJcblxyXG4vLyByZXR1cm5zIHRydWUgaWYgYXQgbGVhc3Qgb25lIGZpbHRlciBpcyBhY3RpdmVcclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuaXNGaWx0ZXJQcmVzZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgYXRMZWFzdE9uZUFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcy5hbGxGaWx0ZXJzKTtcclxuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICB2YXIgZmlsdGVyV3JhcHBlciA9IHRoYXQuYWxsRmlsdGVyc1trZXldO1xyXG4gICAgICAgIGlmICghZmlsdGVyV3JhcHBlci5maWx0ZXIuaXNGaWx0ZXJBY3RpdmUpIHsgLy8gYmVjYXVzZSB1c2VycyBjYW4gZG8gY3VzdG9tIGZpbHRlcnMsIGdpdmUgbmljZSBlcnJvciBtZXNzYWdlXHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZpbHRlciBpcyBtaXNzaW5nIG1ldGhvZCBpc0ZpbHRlckFjdGl2ZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZmlsdGVyV3JhcHBlci5maWx0ZXIuaXNGaWx0ZXJBY3RpdmUoKSkge1xyXG4gICAgICAgICAgICBhdExlYXN0T25lQWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBhdExlYXN0T25lQWN0aXZlO1xyXG59O1xyXG5cclxuLy8gcmV0dXJucyB0cnVlIGlmIGdpdmVuIGNvbCBoYXMgYSBmaWx0ZXIgYWN0aXZlXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLmlzRmlsdGVyUHJlc2VudEZvckNvbCA9IGZ1bmN0aW9uKGNvbEtleSkge1xyXG4gICAgdmFyIGZpbHRlcldyYXBwZXIgPSB0aGlzLmFsbEZpbHRlcnNbY29sS2V5XTtcclxuICAgIGlmICghZmlsdGVyV3JhcHBlcikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmICghZmlsdGVyV3JhcHBlci5maWx0ZXIuaXNGaWx0ZXJBY3RpdmUpIHsgLy8gYmVjYXVzZSB1c2VycyBjYW4gZG8gY3VzdG9tIGZpbHRlcnMsIGdpdmUgbmljZSBlcnJvciBtZXNzYWdlXHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRmlsdGVyIGlzIG1pc3NpbmcgbWV0aG9kIGlzRmlsdGVyQWN0aXZlJyk7XHJcbiAgICB9XHJcbiAgICB2YXIgZmlsdGVyUHJlc2VudCA9IGZpbHRlcldyYXBwZXIuZmlsdGVyLmlzRmlsdGVyQWN0aXZlKCk7XHJcbiAgICByZXR1cm4gZmlsdGVyUHJlc2VudDtcclxufTtcclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLmRvZXNGaWx0ZXJQYXNzID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIGRhdGEgPSBub2RlLmRhdGE7XHJcbiAgICB2YXIgY29sS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuYWxsRmlsdGVycyk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNvbEtleXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IC8vIGNyaXRpY2FsIGNvZGUsIGRvbid0IHVzZSBmdW5jdGlvbmFsIHByb2dyYW1taW5nXHJcblxyXG4gICAgICAgIHZhciBjb2xLZXkgPSBjb2xLZXlzW2ldO1xyXG4gICAgICAgIHZhciBmaWx0ZXJXcmFwcGVyID0gdGhpcy5hbGxGaWx0ZXJzW2NvbEtleV07XHJcblxyXG4gICAgICAgIC8vIGlmIG5vIGZpbHRlciwgYWx3YXlzIHBhc3NcclxuICAgICAgICBpZiAoZmlsdGVyV3JhcHBlciA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHZhbHVlID0gZGF0YVtmaWx0ZXJXcmFwcGVyLmZpZWxkXTtcclxuICAgICAgICBpZiAoIWZpbHRlcldyYXBwZXIuZmlsdGVyLmRvZXNGaWx0ZXJQYXNzKSB7IC8vIGJlY2F1c2UgdXNlcnMgY2FuIGRvIGN1c3RvbSBmaWx0ZXJzLCBnaXZlIG5pY2UgZXJyb3IgbWVzc2FnZVxyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGaWx0ZXIgaXMgbWlzc2luZyBtZXRob2QgZG9lc0ZpbHRlclBhc3MnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG1vZGVsO1xyXG4gICAgICAgIC8vIGlmIG1vZGVsIGlzIGV4cG9zZWQsIGdyYWIgaXRcclxuICAgICAgICBpZiAoZmlsdGVyV3JhcHBlci5maWx0ZXIuZ2V0TW9kZWwpIHtcclxuICAgICAgICAgICAgbW9kZWwgPSBmaWx0ZXJXcmFwcGVyLmZpbHRlci5nZXRNb2RlbCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbCxcclxuICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgZGF0YTogZGF0YVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKCFmaWx0ZXJXcmFwcGVyLmZpbHRlci5kb2VzRmlsdGVyUGFzcyhwYXJhbXMpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBhbGwgZmlsdGVycyBwYXNzZWRcclxuICAgIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUub25OZXdSb3dzTG9hZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBPYmplY3Qua2V5cyh0aGlzLmFsbEZpbHRlcnMpLmZvckVhY2goZnVuY3Rpb24oZmllbGQpIHtcclxuICAgICAgICB2YXIgZmlsdGVyID0gdGhhdC5hbGxGaWx0ZXJzW2ZpZWxkXS5maWx0ZXI7XHJcbiAgICAgICAgaWYgKGZpbHRlci5vbk5ld1Jvd3NMb2FkZWQpIHtcclxuICAgICAgICAgICAgZmlsdGVyLm9uTmV3Um93c0xvYWRlZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUucG9zaXRpb25Qb3B1cCA9IGZ1bmN0aW9uKGV2ZW50U291cmNlLCBlUG9wdXAsIGVQb3B1cFJvb3QpIHtcclxuICAgIHZhciBzb3VyY2VSZWN0ID0gZXZlbnRTb3VyY2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICB2YXIgcGFyZW50UmVjdCA9IGVQb3B1cFJvb3QuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgdmFyIHggPSBzb3VyY2VSZWN0LmxlZnQgLSBwYXJlbnRSZWN0LmxlZnQ7XHJcbiAgICB2YXIgeSA9IHNvdXJjZVJlY3QudG9wIC0gcGFyZW50UmVjdC50b3AgKyBzb3VyY2VSZWN0LmhlaWdodDtcclxuXHJcbiAgICAvLyBpZiBwb3B1cCBpcyBvdmVyZmxvd2luZyB0byB0aGUgcmlnaHQsIG1vdmUgaXQgbGVmdFxyXG4gICAgdmFyIHdpZHRoT2ZQb3B1cCA9IDIwMDsgLy8gdGhpcyBpcyBzZXQgaW4gdGhlIGNzc1xyXG4gICAgdmFyIHdpZHRoT2ZQYXJlbnQgPSBwYXJlbnRSZWN0LnJpZ2h0IC0gcGFyZW50UmVjdC5sZWZ0O1xyXG4gICAgdmFyIG1heFggPSB3aWR0aE9mUGFyZW50IC0gd2lkdGhPZlBvcHVwIC0gMjA7IC8vIDIwIHBpeGVscyBncmFjZVxyXG4gICAgaWYgKHggPiBtYXhYKSB7IC8vIG1vdmUgcG9zaXRpb24gbGVmdCwgYmFjayBpbnRvIHZpZXdcclxuICAgICAgICB4ID0gbWF4WDtcclxuICAgIH1cclxuICAgIGlmICh4IDwgMCkgeyAvLyBpbiBjYXNlIHRoZSBwb3B1cCBoYXMgYSBuZWdhdGl2ZSB2YWx1ZVxyXG4gICAgICAgIHggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGVQb3B1cC5zdHlsZS5sZWZ0ID0geCArIFwicHhcIjtcclxuICAgIGVQb3B1cC5zdHlsZS50b3AgPSB5ICsgXCJweFwiO1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuc2hvd0ZpbHRlciA9IGZ1bmN0aW9uKGNvbERlZldyYXBwZXIsIGV2ZW50U291cmNlKSB7XHJcblxyXG4gICAgdmFyIGZpbHRlcldyYXBwZXIgPSB0aGlzLmFsbEZpbHRlcnNbY29sRGVmV3JhcHBlci5jb2xLZXldO1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbERlZldyYXBwZXIuY29sRGVmO1xyXG5cclxuICAgIGlmICghZmlsdGVyV3JhcHBlcikge1xyXG4gICAgICAgIGZpbHRlcldyYXBwZXIgPSB7XHJcbiAgICAgICAgICAgIGNvbEtleTogY29sRGVmV3JhcHBlci5jb2xLZXksXHJcbiAgICAgICAgICAgIGZpZWxkOiBjb2xEZWYuZmllbGRcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBmaWx0ZXJDaGFuZ2VkQ2FsbGJhY2sgPSB0aGlzLmdyaWQub25GaWx0ZXJDaGFuZ2VkLmJpbmQodGhpcy5ncmlkKTtcclxuICAgICAgICB2YXIgZmlsdGVyUGFyYW1zID0gY29sRGVmLmZpbHRlclBhcmFtcztcclxuICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgcm93TW9kZWw6IHRoaXMucm93TW9kZWwsXHJcbiAgICAgICAgICAgIGZpbHRlckNoYW5nZWRDYWxsYmFjazogZmlsdGVyQ2hhbmdlZENhbGxiYWNrLFxyXG4gICAgICAgICAgICBmaWx0ZXJQYXJhbXM6IGZpbHRlclBhcmFtcyxcclxuICAgICAgICAgICAgc2NvcGU6IGZpbHRlcldyYXBwZXIuc2NvcGVcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29sRGVmLmZpbHRlciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAvLyBpZiB1c2VyIHByb3ZpZGVkIGEgZmlsdGVyLCBqdXN0IHVzZSBpdFxyXG4gICAgICAgICAgICAvLyBmaXJzdCB1cCwgY3JlYXRlIGNoaWxkIHNjb3BlIGlmIG5lZWRlZFxyXG4gICAgICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNBbmd1bGFyQ29tcGlsZUZpbHRlcnMoKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNjb3BlID0gdGhpcy4kc2NvcGUuJG5ldygpO1xyXG4gICAgICAgICAgICAgICAgZmlsdGVyV3JhcHBlci5zY29wZSA9IHNjb3BlO1xyXG4gICAgICAgICAgICAgICAgcGFyYW1zLiRzY29wZSA9IHNjb3BlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIG5vdyBjcmVhdGUgZmlsdGVyXHJcbiAgICAgICAgICAgIGZpbHRlcldyYXBwZXIuZmlsdGVyID0gbmV3IGNvbERlZi5maWx0ZXIocGFyYW1zKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbERlZi5maWx0ZXIgPT09ICd0ZXh0Jykge1xyXG4gICAgICAgICAgICBmaWx0ZXJXcmFwcGVyLmZpbHRlciA9IG5ldyBTdHJpbmdGaWx0ZXIocGFyYW1zKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbERlZi5maWx0ZXIgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIGZpbHRlcldyYXBwZXIuZmlsdGVyID0gbmV3IE51bWJlckZpbHRlcihwYXJhbXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZpbHRlcldyYXBwZXIuZmlsdGVyID0gbmV3IFNldEZpbHRlcihwYXJhbXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmFsbEZpbHRlcnNbY29sRGVmV3JhcHBlci5jb2xLZXldID0gZmlsdGVyV3JhcHBlcjtcclxuXHJcbiAgICAgICAgaWYgKCFmaWx0ZXJXcmFwcGVyLmZpbHRlci5nZXRHdWkpIHsgLy8gYmVjYXVzZSB1c2VycyBjYW4gZG8gY3VzdG9tIGZpbHRlcnMsIGdpdmUgbmljZSBlcnJvciBtZXNzYWdlXHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZpbHRlciBpcyBtaXNzaW5nIG1ldGhvZCBnZXRHdWknKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBlRmlsdGVyR3VpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgZUZpbHRlckd1aS5jbGFzc05hbWUgPSAnYWctZmlsdGVyJztcclxuICAgICAgICB2YXIgZ3VpRnJvbUZpbHRlciA9IGZpbHRlcldyYXBwZXIuZmlsdGVyLmdldEd1aSgpO1xyXG4gICAgICAgIGlmICh1dGlscy5pc05vZGVPckVsZW1lbnQoZ3VpRnJvbUZpbHRlcikpIHtcclxuICAgICAgICAgICAgLy9hIGRvbSBub2RlIG9yIGVsZW1lbnQgd2FzIHJldHVybmVkLCBzbyBhZGQgY2hpbGRcclxuICAgICAgICAgICAgZUZpbHRlckd1aS5hcHBlbmRDaGlsZChndWlGcm9tRmlsdGVyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvL290aGVyd2lzZSBhc3N1bWUgaXQgd2FzIGh0bWwsIHNvIGp1c3QgaW5zZXJ0XHJcbiAgICAgICAgICAgIHZhciBlVGV4dFNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgICAgIGVUZXh0U3Bhbi5pbm5lckhUTUwgPSBndWlGcm9tRmlsdGVyO1xyXG4gICAgICAgICAgICBlRmlsdGVyR3VpLmFwcGVuZENoaWxkKGVUZXh0U3Bhbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZmlsdGVyV3JhcHBlci5zY29wZSkge1xyXG4gICAgICAgICAgICBmaWx0ZXJXcmFwcGVyLmd1aSA9IHRoaXMuJGNvbXBpbGUoZUZpbHRlckd1aSkoZmlsdGVyV3JhcHBlci5zY29wZSlbMF07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmlsdGVyV3JhcHBlci5ndWkgPSBlRmlsdGVyR3VpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGVQb3B1cFBhcmVudCA9IHRoaXMuZ3JpZC5nZXRQb3B1cFBhcmVudCgpO1xyXG4gICAgdGhpcy5wb3NpdGlvblBvcHVwKGV2ZW50U291cmNlLCBmaWx0ZXJXcmFwcGVyLmd1aSwgZVBvcHVwUGFyZW50KTtcclxuXHJcbiAgICB1dGlscy5hZGRBc01vZGFsUG9wdXAoZVBvcHVwUGFyZW50LCBmaWx0ZXJXcmFwcGVyLmd1aSk7XHJcblxyXG4gICAgaWYgKGZpbHRlcldyYXBwZXIuZmlsdGVyLmFmdGVyR3VpQXR0YWNoZWQpIHtcclxuICAgICAgICBmaWx0ZXJXcmFwcGVyLmZpbHRlci5hZnRlckd1aUF0dGFjaGVkKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZpbHRlck1hbmFnZXI7XHJcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9udW1iZXJGaWx0ZXJUZW1wbGF0ZS5qcycpO1xyXG5cclxudmFyIEVRVUFMUyA9IDE7XHJcbnZhciBMRVNTX1RIQU4gPSAyO1xyXG52YXIgR1JFQVRFUl9USEFOID0gMztcclxuXHJcbmZ1bmN0aW9uIE51bWJlckZpbHRlcihwYXJhbXMpIHtcclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrID0gcGFyYW1zLmZpbHRlckNoYW5nZWRDYWxsYmFjaztcclxuICAgIHRoaXMuY3JlYXRlR3VpKCk7XHJcbiAgICB0aGlzLmZpbHRlck51bWJlciA9IG51bGw7XHJcbiAgICB0aGlzLmZpbHRlclR5cGUgPSBFUVVBTFM7XHJcbn1cclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5OdW1iZXJGaWx0ZXIucHJvdG90eXBlLmFmdGVyR3VpQXR0YWNoZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZUZpbHRlclRleHRGaWVsZC5mb2N1cygpO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcbk51bWJlckZpbHRlci5wcm90b3R5cGUuZG9lc0ZpbHRlclBhc3MgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICBpZiAodGhpcy5maWx0ZXJOdW1iZXIgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHZhciB2YWx1ZSA9IG5vZGUudmFsdWU7XHJcblxyXG4gICAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdmFsdWVBc051bWJlcjtcclxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgdmFsdWVBc051bWJlciA9IHZhbHVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB2YWx1ZUFzTnVtYmVyID0gcGFyc2VGbG9hdCh2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoICh0aGlzLmZpbHRlclR5cGUpIHtcclxuICAgICAgICBjYXNlIEVRVUFMUzpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlQXNOdW1iZXIgPT09IHRoaXMuZmlsdGVyTnVtYmVyO1xyXG4gICAgICAgIGNhc2UgTEVTU19USEFOOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVBc051bWJlciA8PSB0aGlzLmZpbHRlck51bWJlcjtcclxuICAgICAgICBjYXNlIEdSRUFURVJfVEhBTjpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlQXNOdW1iZXIgPj0gdGhpcy5maWx0ZXJOdW1iZXI7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLy8gc2hvdWxkIG5ldmVyIGhhcHBlblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnaW52YWxpZCBmaWx0ZXIgdHlwZSAnICsgdGhpcy5maWx0ZXJUeXBlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcbk51bWJlckZpbHRlci5wcm90b3R5cGUuZ2V0R3VpID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lR3VpO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcbk51bWJlckZpbHRlci5wcm90b3R5cGUuaXNGaWx0ZXJBY3RpdmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmZpbHRlck51bWJlciAhPT0gbnVsbDtcclxufTtcclxuXHJcbk51bWJlckZpbHRlci5wcm90b3R5cGUuY3JlYXRlR3VpID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVHdWkgPSB1dGlscy5sb2FkVGVtcGxhdGUodGVtcGxhdGUpO1xyXG4gICAgdGhpcy5lRmlsdGVyVGV4dEZpZWxkID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIjZmlsdGVyVGV4dFwiKTtcclxuICAgIHRoaXMuZVR5cGVTZWxlY3QgPSB0aGlzLmVHdWkucXVlcnlTZWxlY3RvcihcIiNmaWx0ZXJUeXBlXCIpO1xyXG5cclxuICAgIHV0aWxzLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuZUZpbHRlclRleHRGaWVsZCwgdGhpcy5vbkZpbHRlckNoYW5nZWQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVUeXBlU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgdGhpcy5vblR5cGVDaGFuZ2VkLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5vblR5cGVDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmZpbHRlclR5cGUgPSBwYXJzZUludCh0aGlzLmVUeXBlU2VsZWN0LnZhbHVlKTtcclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrKCk7XHJcbn07XHJcblxyXG5OdW1iZXJGaWx0ZXIucHJvdG90eXBlLm9uRmlsdGVyQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGZpbHRlclRleHQgPSB1dGlscy5tYWtlTnVsbCh0aGlzLmVGaWx0ZXJUZXh0RmllbGQudmFsdWUpO1xyXG4gICAgaWYgKGZpbHRlclRleHQgJiYgZmlsdGVyVGV4dC50cmltKCkgPT09ICcnKSB7XHJcbiAgICAgICAgZmlsdGVyVGV4dCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAoZmlsdGVyVGV4dCkge1xyXG4gICAgICAgIHRoaXMuZmlsdGVyTnVtYmVyID0gcGFyc2VGbG9hdChmaWx0ZXJUZXh0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJOdW1iZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2soKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTnVtYmVyRmlsdGVyO1xyXG4iLCJ2YXIgdGVtcGxhdGUgPSBbXHJcbiAgICAnPGRpdj4nLFxyXG4gICAgJzxkaXY+JyxcclxuICAgICc8c2VsZWN0IGNsYXNzPVwiYWctZmlsdGVyLXNlbGVjdFwiIGlkPVwiZmlsdGVyVHlwZVwiPicsXHJcbiAgICAnPG9wdGlvbiB2YWx1ZT1cIjFcIj5FcXVhbHM8L29wdGlvbj4nLFxyXG4gICAgJzxvcHRpb24gdmFsdWU9XCIyXCI+TGVzcyB0aGFuPC9vcHRpb24+JyxcclxuICAgICc8b3B0aW9uIHZhbHVlPVwiM1wiPkdyZWF0ZXIgdGhhbjwvb3B0aW9uPicsXHJcbiAgICAnPC9zZWxlY3Q+JyxcclxuICAgICc8L2Rpdj4nLFxyXG4gICAgJzxkaXY+JyxcclxuICAgICc8aW5wdXQgY2xhc3M9XCJhZy1maWx0ZXItZmlsdGVyXCIgaWQ9XCJmaWx0ZXJUZXh0XCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cImZpbHRlci4uLlwiLz4nLFxyXG4gICAgJzwvZGl2PicsXHJcbiAgICAnPC9kaXY+JyxcclxuXS5qb2luKCcnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XHJcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcclxudmFyIFNldEZpbHRlck1vZGVsID0gcmVxdWlyZSgnLi9zZXRGaWx0ZXJNb2RlbCcpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL3NldEZpbHRlclRlbXBsYXRlJyk7XHJcblxyXG52YXIgREVGQVVMVF9ST1dfSEVJR0hUID0gMjA7XHJcblxyXG5mdW5jdGlvbiBTZXRGaWx0ZXIocGFyYW1zKSB7XHJcbiAgICB2YXIgZmlsdGVyUGFyYW1zID0gcGFyYW1zLmZpbHRlclBhcmFtcztcclxuICAgIHRoaXMucm93SGVpZ2h0ID0gKGZpbHRlclBhcmFtcyAmJiBmaWx0ZXJQYXJhbXMuY2VsbEhlaWdodCkgPyBmaWx0ZXJQYXJhbXMuY2VsbEhlaWdodCA6IERFRkFVTFRfUk9XX0hFSUdIVDtcclxuICAgIHRoaXMubW9kZWwgPSBuZXcgU2V0RmlsdGVyTW9kZWwocGFyYW1zLmNvbERlZiwgcGFyYW1zLnJvd01vZGVsKTtcclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrID0gcGFyYW1zLmZpbHRlckNoYW5nZWRDYWxsYmFjaztcclxuICAgIHRoaXMucm93c0luQm9keUNvbnRhaW5lciA9IHt9O1xyXG4gICAgdGhpcy5jb2xEZWYgPSBwYXJhbXMuY29sRGVmO1xyXG4gICAgaWYgKGZpbHRlclBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuY2VsbFJlbmRlcmVyID0gZmlsdGVyUGFyYW1zLmNlbGxSZW5kZXJlcjtcclxuICAgIH1cclxuICAgIHRoaXMuY3JlYXRlR3VpKCk7XHJcbiAgICB0aGlzLmFkZFNjcm9sbExpc3RlbmVyKCk7XHJcbn1cclxuXHJcbi8vIHdlIG5lZWQgdG8gaGF2ZSB0aGUgZ3VpIGF0dGFjaGVkIGJlZm9yZSB3ZSBjYW4gZHJhdyB0aGUgdmlydHVhbCByb3dzLCBhcyB0aGVcclxuLy8gdmlydHVhbCByb3cgbG9naWMgbmVlZHMgaW5mbyBhYm91dCB0aGUgZ3VpIHN0YXRlXHJcbi8qIHB1YmxpYyAqL1xyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmFmdGVyR3VpQXR0YWNoZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZHJhd1ZpcnR1YWxSb3dzKCk7XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5pc0ZpbHRlckFjdGl2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubW9kZWwuaXNGaWx0ZXJBY3RpdmUoKTtcclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmRvZXNGaWx0ZXJQYXNzID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIHZhbHVlID0gbm9kZS52YWx1ZTtcclxuICAgIHZhciBtb2RlbCA9IG5vZGUubW9kZWw7XHJcbiAgICAvL2lmIG5vIGZpbHRlciwgYWx3YXlzIHBhc3NcclxuICAgIGlmIChtb2RlbC5pc0V2ZXJ5dGhpbmdTZWxlY3RlZCgpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICAvL2lmIG5vdGhpbmcgc2VsZWN0ZWQgaW4gZmlsdGVyLCBhbHdheXMgZmFpbFxyXG4gICAgaWYgKG1vZGVsLmlzTm90aGluZ1NlbGVjdGVkKCkpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFsdWUgPSB1dGlscy5tYWtlTnVsbCh2YWx1ZSk7XHJcbiAgICB2YXIgZmlsdGVyUGFzc2VkID0gbW9kZWwuc2VsZWN0ZWRWYWx1ZXNNYXBbdmFsdWVdICE9PSB1bmRlZmluZWQ7XHJcbiAgICByZXR1cm4gZmlsdGVyUGFzc2VkO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcblNldEZpbHRlci5wcm90b3R5cGUuZ2V0R3VpID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lR3VpO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcblNldEZpbHRlci5wcm90b3R5cGUub25OZXdSb3dzTG9hZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm1vZGVsLnNlbGVjdEV2ZXJ5dGhpbmcoKTtcclxuICAgIHRoaXMudXBkYXRlQWxsQ2hlY2tib3hlcyh0cnVlKTtcclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmdldE1vZGVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbDtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUuY3JlYXRlR3VpID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIHRoaXMuZUd1aSA9IHV0aWxzLmxvYWRUZW1wbGF0ZSh0ZW1wbGF0ZSk7XHJcblxyXG4gICAgdGhpcy5lTGlzdENvbnRhaW5lciA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKFwiLmFnLWZpbHRlci1saXN0LWNvbnRhaW5lclwiKTtcclxuICAgIHRoaXMuZUZpbHRlclZhbHVlVGVtcGxhdGUgPSB0aGlzLmVHdWkucXVlcnlTZWxlY3RvcihcIiNpdGVtRm9yUmVwZWF0XCIpO1xyXG4gICAgdGhpcy5lU2VsZWN0QWxsID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIjc2VsZWN0QWxsXCIpO1xyXG4gICAgdGhpcy5lTGlzdFZpZXdwb3J0ID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIuYWctZmlsdGVyLWxpc3Qtdmlld3BvcnRcIik7XHJcbiAgICB0aGlzLmVNaW5pRmlsdGVyID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIuYWctZmlsdGVyLWZpbHRlclwiKTtcclxuICAgIHRoaXMuZUxpc3RDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gKHRoaXMubW9kZWwuZ2V0VW5pcXVlVmFsdWVDb3VudCgpICogdGhpcy5yb3dIZWlnaHQpICsgXCJweFwiO1xyXG5cclxuICAgIHRoaXMuc2V0Q29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICB0aGlzLmVNaW5pRmlsdGVyLnZhbHVlID0gdGhpcy5tb2RlbC5nZXRNaW5pRmlsdGVyKCk7XHJcbiAgICB1dGlscy5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLmVNaW5pRmlsdGVyLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBfdGhpcy5vbkZpbHRlckNoYW5nZWQoKTtcclxuICAgIH0pO1xyXG4gICAgdXRpbHMucmVtb3ZlQWxsQ2hpbGRyZW4odGhpcy5lTGlzdENvbnRhaW5lcik7XHJcblxyXG4gICAgdGhpcy5lU2VsZWN0QWxsLm9uY2xpY2sgPSB0aGlzLm9uU2VsZWN0QWxsLmJpbmQodGhpcyk7XHJcblxyXG4gICAgaWYgKHRoaXMubW9kZWwuaXNFdmVyeXRoaW5nU2VsZWN0ZWQoKSkge1xyXG4gICAgICAgIHRoaXMuZVNlbGVjdEFsbC5pbmRldGVybWluYXRlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmNoZWNrZWQgPSB0cnVlO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLm1vZGVsLmlzTm90aGluZ1NlbGVjdGVkKCkpIHtcclxuICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZVNlbGVjdEFsbC5jaGVja2VkID0gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZVNlbGVjdEFsbC5pbmRldGVybWluYXRlID0gdHJ1ZTtcclxuICAgIH1cclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUuc2V0Q29udGFpbmVySGVpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVMaXN0Q29udGFpbmVyLnN0eWxlLmhlaWdodCA9ICh0aGlzLm1vZGVsLmdldERpc3BsYXllZFZhbHVlQ291bnQoKSAqIHRoaXMucm93SGVpZ2h0KSArIFwicHhcIjtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUuZHJhd1ZpcnR1YWxSb3dzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdG9wUGl4ZWwgPSB0aGlzLmVMaXN0Vmlld3BvcnQuc2Nyb2xsVG9wO1xyXG4gICAgdmFyIGJvdHRvbVBpeGVsID0gdG9wUGl4ZWwgKyB0aGlzLmVMaXN0Vmlld3BvcnQub2Zmc2V0SGVpZ2h0O1xyXG5cclxuICAgIHZhciBmaXJzdFJvdyA9IE1hdGguZmxvb3IodG9wUGl4ZWwgLyB0aGlzLnJvd0hlaWdodCk7XHJcbiAgICB2YXIgbGFzdFJvdyA9IE1hdGguZmxvb3IoYm90dG9tUGl4ZWwgLyB0aGlzLnJvd0hlaWdodCk7XHJcblxyXG4gICAgdGhpcy5lbnN1cmVSb3dzUmVuZGVyZWQoZmlyc3RSb3csIGxhc3RSb3cpO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5lbnN1cmVSb3dzUmVuZGVyZWQgPSBmdW5jdGlvbihzdGFydCwgZmluaXNoKSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIC8vYXQgdGhlIGVuZCwgdGhpcyBhcnJheSB3aWxsIGNvbnRhaW4gdGhlIGl0ZW1zIHdlIG5lZWQgdG8gcmVtb3ZlXHJcbiAgICB2YXIgcm93c1RvUmVtb3ZlID0gT2JqZWN0LmtleXModGhpcy5yb3dzSW5Cb2R5Q29udGFpbmVyKTtcclxuXHJcbiAgICAvL2FkZCBpbiBuZXcgcm93c1xyXG4gICAgZm9yICh2YXIgcm93SW5kZXggPSBzdGFydDsgcm93SW5kZXggPD0gZmluaXNoOyByb3dJbmRleCsrKSB7XHJcbiAgICAgICAgLy9zZWUgaWYgaXRlbSBhbHJlYWR5IHRoZXJlLCBhbmQgaWYgeWVzLCB0YWtlIGl0IG91dCBvZiB0aGUgJ3RvIHJlbW92ZScgYXJyYXlcclxuICAgICAgICBpZiAocm93c1RvUmVtb3ZlLmluZGV4T2Yocm93SW5kZXgudG9TdHJpbmcoKSkgPj0gMCkge1xyXG4gICAgICAgICAgICByb3dzVG9SZW1vdmUuc3BsaWNlKHJvd3NUb1JlbW92ZS5pbmRleE9mKHJvd0luZGV4LnRvU3RyaW5nKCkpLCAxKTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vY2hlY2sgdGhpcyByb3cgYWN0dWFsbHkgZXhpc3RzIChpbiBjYXNlIG92ZXJmbG93IGJ1ZmZlciB3aW5kb3cgZXhjZWVkcyByZWFsIGRhdGEpXHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwuZ2V0RGlzcGxheWVkVmFsdWVDb3VudCgpID4gcm93SW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5tb2RlbC5nZXREaXNwbGF5ZWRWYWx1ZShyb3dJbmRleCk7XHJcbiAgICAgICAgICAgIF90aGlzLmluc2VydFJvdyh2YWx1ZSwgcm93SW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL2F0IHRoaXMgcG9pbnQsIGV2ZXJ5dGhpbmcgaW4gb3VyICdyb3dzVG9SZW1vdmUnIC4gLiAuXHJcbiAgICB0aGlzLnJlbW92ZVZpcnR1YWxSb3dzKHJvd3NUb1JlbW92ZSk7XHJcbn07XHJcblxyXG4vL3Rha2VzIGFycmF5IG9mIHJvdyBpZCdzXHJcblNldEZpbHRlci5wcm90b3R5cGUucmVtb3ZlVmlydHVhbFJvd3MgPSBmdW5jdGlvbihyb3dzVG9SZW1vdmUpIHtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICByb3dzVG9SZW1vdmUuZm9yRWFjaChmdW5jdGlvbihpbmRleFRvUmVtb3ZlKSB7XHJcbiAgICAgICAgdmFyIGVSb3dUb1JlbW92ZSA9IF90aGlzLnJvd3NJbkJvZHlDb250YWluZXJbaW5kZXhUb1JlbW92ZV07XHJcbiAgICAgICAgX3RoaXMuZUxpc3RDb250YWluZXIucmVtb3ZlQ2hpbGQoZVJvd1RvUmVtb3ZlKTtcclxuICAgICAgICBkZWxldGUgX3RoaXMucm93c0luQm9keUNvbnRhaW5lcltpbmRleFRvUmVtb3ZlXTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5pbnNlcnRSb3cgPSBmdW5jdGlvbih2YWx1ZSwgcm93SW5kZXgpIHtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgdmFyIGVGaWx0ZXJWYWx1ZSA9IHRoaXMuZUZpbHRlclZhbHVlVGVtcGxhdGUuY2xvbmVOb2RlKHRydWUpO1xyXG5cclxuICAgIHZhciB2YWx1ZUVsZW1lbnQgPSBlRmlsdGVyVmFsdWUucXVlcnlTZWxlY3RvcihcIi5hZy1maWx0ZXItdmFsdWVcIik7XHJcbiAgICBpZiAodGhpcy5jZWxsUmVuZGVyZXIpIHtcclxuICAgICAgICAvL3JlbmRlcmVyIHByb3ZpZGVkLCBzbyB1c2UgaXRcclxuICAgICAgICB2YXIgcmVzdWx0RnJvbVJlbmRlcmVyID0gdGhpcy5jZWxsUmVuZGVyZXIoe1xyXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKHV0aWxzLmlzTm9kZShyZXN1bHRGcm9tUmVuZGVyZXIpKSB7XHJcbiAgICAgICAgICAgIC8vYSBkb20gbm9kZSBvciBlbGVtZW50IHdhcyByZXR1cm5lZCwgc28gYWRkIGNoaWxkXHJcbiAgICAgICAgICAgIHZhbHVlRWxlbWVudC5hcHBlbmRDaGlsZChyZXN1bHRGcm9tUmVuZGVyZXIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vb3RoZXJ3aXNlIGFzc3VtZSBpdCB3YXMgaHRtbCwgc28ganVzdCBpbnNlcnRcclxuICAgICAgICAgICAgdmFsdWVFbGVtZW50LmlubmVySFRNTCA9IHJlc3VsdEZyb21SZW5kZXJlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvL290aGVyd2lzZSBkaXNwbGF5IGFzIGEgc3RyaW5nXHJcbiAgICAgICAgdmFyIGRpc3BsYXlOYW1lT2ZWYWx1ZSA9IHZhbHVlID09PSBudWxsID8gXCIoQmxhbmtzKVwiIDogdmFsdWU7XHJcbiAgICAgICAgdmFsdWVFbGVtZW50LmlubmVySFRNTCA9IGRpc3BsYXlOYW1lT2ZWYWx1ZTtcclxuICAgIH1cclxuICAgIHZhciBlQ2hlY2tib3ggPSBlRmlsdGVyVmFsdWUucXVlcnlTZWxlY3RvcihcImlucHV0XCIpO1xyXG4gICAgZUNoZWNrYm94LmNoZWNrZWQgPSB0aGlzLm1vZGVsLmlzVmFsdWVTZWxlY3RlZCh2YWx1ZSk7XHJcblxyXG4gICAgZUNoZWNrYm94Lm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBfdGhpcy5vbkNoZWNrYm94Q2xpY2tlZChlQ2hlY2tib3gsIHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBlRmlsdGVyVmFsdWUuc3R5bGUudG9wID0gKHRoaXMucm93SGVpZ2h0ICogcm93SW5kZXgpICsgXCJweFwiO1xyXG5cclxuICAgIHRoaXMuZUxpc3RDb250YWluZXIuYXBwZW5kQ2hpbGQoZUZpbHRlclZhbHVlKTtcclxuICAgIHRoaXMucm93c0luQm9keUNvbnRhaW5lcltyb3dJbmRleF0gPSBlRmlsdGVyVmFsdWU7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLm9uQ2hlY2tib3hDbGlja2VkID0gZnVuY3Rpb24oZUNoZWNrYm94LCB2YWx1ZSkge1xyXG4gICAgdmFyIGNoZWNrZWQgPSBlQ2hlY2tib3guY2hlY2tlZDtcclxuICAgIGlmIChjaGVja2VkKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZWxlY3RWYWx1ZSh2YWx1ZSk7XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwuaXNFdmVyeXRoaW5nU2VsZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmVTZWxlY3RBbGwuY2hlY2tlZCA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmluZGV0ZXJtaW5hdGUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC51bnNlbGVjdFZhbHVlKHZhbHVlKTtcclxuICAgICAgICAvL2lmIHNldCBpcyBlbXB0eSwgbm90aGluZyBpcyBzZWxlY3RlZFxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmlzTm90aGluZ1NlbGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmNoZWNrZWQgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrKCk7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLm9uRmlsdGVyQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG1pbmlGaWx0ZXJDaGFuZ2VkID0gdGhpcy5tb2RlbC5zZXRNaW5pRmlsdGVyKHRoaXMuZU1pbmlGaWx0ZXIudmFsdWUpO1xyXG4gICAgaWYgKG1pbmlGaWx0ZXJDaGFuZ2VkKSB7XHJcbiAgICAgICAgdGhpcy5zZXRDb250YWluZXJIZWlnaHQoKTtcclxuICAgICAgICB0aGlzLmNsZWFyVmlydHVhbFJvd3MoKTtcclxuICAgICAgICB0aGlzLmRyYXdWaXJ0dWFsUm93cygpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5jbGVhclZpcnR1YWxSb3dzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcm93c1RvUmVtb3ZlID0gT2JqZWN0LmtleXModGhpcy5yb3dzSW5Cb2R5Q29udGFpbmVyKTtcclxuICAgIHRoaXMucmVtb3ZlVmlydHVhbFJvd3Mocm93c1RvUmVtb3ZlKTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUub25TZWxlY3RBbGwgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjaGVja2VkID0gdGhpcy5lU2VsZWN0QWxsLmNoZWNrZWQ7XHJcbiAgICBpZiAoY2hlY2tlZCkge1xyXG4gICAgICAgIHRoaXMubW9kZWwuc2VsZWN0RXZlcnl0aGluZygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm1vZGVsLnNlbGVjdE5vdGhpbmcoKTtcclxuICAgIH1cclxuICAgIHRoaXMudXBkYXRlQWxsQ2hlY2tib3hlcyhjaGVja2VkKTtcclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrKCk7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLnVwZGF0ZUFsbENoZWNrYm94ZXMgPSBmdW5jdGlvbihjaGVja2VkKSB7XHJcbiAgICB2YXIgY3VycmVudGx5RGlzcGxheWVkQ2hlY2tib3hlcyA9IHRoaXMuZUxpc3RDb250YWluZXIucXVlcnlTZWxlY3RvckFsbChcIltmaWx0ZXItY2hlY2tib3g9dHJ1ZV1cIik7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGN1cnJlbnRseURpc3BsYXllZENoZWNrYm94ZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgY3VycmVudGx5RGlzcGxheWVkQ2hlY2tib3hlc1tpXS5jaGVja2VkID0gY2hlY2tlZDtcclxuICAgIH1cclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUuYWRkU2Nyb2xsTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgdGhpcy5lTGlzdFZpZXdwb3J0LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgX3RoaXMuZHJhd1ZpcnR1YWxSb3dzKCk7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2V0RmlsdGVyO1xyXG4iLCIgICAgdmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcclxuXHJcbiAgICBmdW5jdGlvbiBTZXRGaWx0ZXJNb2RlbChjb2xEZWYsIHJvd01vZGVsKSB7XHJcblxyXG4gICAgICAgIGlmIChjb2xEZWYuZmlsdGVyUGFyYW1zICYmIGNvbERlZi5maWx0ZXJQYXJhbXMudmFsdWVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMudW5pcXVlVmFsdWVzID0gY29sRGVmLmZpbHRlclBhcmFtcy52YWx1ZXM7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVVbmlxdWVWYWx1ZXMocm93TW9kZWwsIGNvbERlZi5maWVsZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29sRGVmLmNvbXBhcmF0b3IpIHtcclxuICAgICAgICAgICAgdGhpcy51bmlxdWVWYWx1ZXMuc29ydChjb2xEZWYuY29tcGFyYXRvcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy51bmlxdWVWYWx1ZXMuc29ydCh1dGlscy5kZWZhdWx0Q29tcGFyYXRvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmRpc3BsYXllZFZhbHVlcyA9IHRoaXMudW5pcXVlVmFsdWVzO1xyXG4gICAgICAgIHRoaXMubWluaUZpbHRlciA9IG51bGw7XHJcbiAgICAgICAgLy93ZSB1c2UgYSBtYXAgcmF0aGVyIHRoYW4gYW4gYXJyYXkgZm9yIHRoZSBzZWxlY3RlZCB2YWx1ZXMgYXMgdGhlIGxvb2t1cFxyXG4gICAgICAgIC8vZm9yIGEgbWFwIGlzIG11Y2ggZmFzdGVyIHRoYW4gdGhlIGxvb2t1cCBmb3IgYW4gYXJyYXksIGVzcGVjaWFsbHkgd2hlblxyXG4gICAgICAgIC8vdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXkgaXMgdGhvdXNhbmRzIG9mIHJlY29yZHMgbG9uZ1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRWYWx1ZXNNYXAgPSB7fTtcclxuICAgICAgICB0aGlzLnNlbGVjdEV2ZXJ5dGhpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuY3JlYXRlVW5pcXVlVmFsdWVzID0gZnVuY3Rpb24ocm93TW9kZWwsIGtleSkge1xyXG4gICAgICAgIHZhciB1bmlxdWVDaGVjayA9IHt9O1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVjdXJzaXZlbHlQcm9jZXNzKG5vZGVzKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5ncm91cCAmJiAhbm9kZS5mb290ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBncm91cCBub2RlLCBzbyBkaWcgZGVlcGVyXHJcbiAgICAgICAgICAgICAgICAgICAgcmVjdXJzaXZlbHlQcm9jZXNzKG5vZGUuY2hpbGRyZW4pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IG5vZGUuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBkYXRhID8gZGF0YVtrZXldIDogbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IFwiXCIgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdW5pcXVlQ2hlY2suaGFzT3duUHJvcGVydHkodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdW5pcXVlQ2hlY2tbdmFsdWVdID0gMTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB0b3BMZXZlbE5vZGVzID0gcm93TW9kZWwuZ2V0VG9wTGV2ZWxOb2RlcygpO1xyXG4gICAgICAgIHJlY3Vyc2l2ZWx5UHJvY2Vzcyh0b3BMZXZlbE5vZGVzKTtcclxuXHJcbiAgICAgICAgdGhpcy51bmlxdWVWYWx1ZXMgPSByZXN1bHQ7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vc2V0cyBtaW5pIGZpbHRlci4gcmV0dXJucyB0cnVlIGlmIGl0IGNoYW5nZWQgZnJvbSBsYXN0IHZhbHVlLCBvdGhlcndpc2UgZmFsc2VcclxuICAgIFNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5zZXRNaW5pRmlsdGVyID0gZnVuY3Rpb24obmV3TWluaUZpbHRlcikge1xyXG4gICAgICAgIG5ld01pbmlGaWx0ZXIgPSB1dGlscy5tYWtlTnVsbChuZXdNaW5pRmlsdGVyKTtcclxuICAgICAgICBpZiAodGhpcy5taW5pRmlsdGVyID09PSBuZXdNaW5pRmlsdGVyKSB7XHJcbiAgICAgICAgICAgIC8vZG8gbm90aGluZyBpZiBmaWx0ZXIgaGFzIG5vdCBjaGFuZ2VkXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5taW5pRmlsdGVyID0gbmV3TWluaUZpbHRlcjtcclxuICAgICAgICB0aGlzLmZpbHRlckRpc3BsYXllZFZhbHVlcygpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuZ2V0TWluaUZpbHRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbmlGaWx0ZXI7XHJcbiAgICB9O1xyXG5cclxuICAgIFNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5maWx0ZXJEaXNwbGF5ZWRWYWx1ZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBpZiBubyBmaWx0ZXIsIGp1c3QgdXNlIHRoZSB1bmlxdWUgdmFsdWVzXHJcbiAgICAgICAgaWYgKHRoaXMubWluaUZpbHRlciA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXllZFZhbHVlcyA9IHRoaXMudW5pcXVlVmFsdWVzO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBpZiBmaWx0ZXIgcHJlc2VudCwgd2UgZmlsdGVyIGRvd24gdGhlIGxpc3RcclxuICAgICAgICB0aGlzLmRpc3BsYXllZFZhbHVlcyA9IFtdO1xyXG4gICAgICAgIHZhciBtaW5pRmlsdGVyVXBwZXJDYXNlID0gdGhpcy5taW5pRmlsdGVyLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLnVuaXF1ZVZhbHVlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHVuaXF1ZVZhbHVlID0gdGhpcy51bmlxdWVWYWx1ZXNbaV07XHJcbiAgICAgICAgICAgIGlmICh1bmlxdWVWYWx1ZSAhPT0gbnVsbCAmJiB1bmlxdWVWYWx1ZS50b1N0cmluZygpLnRvVXBwZXJDYXNlKCkuaW5kZXhPZihtaW5pRmlsdGVyVXBwZXJDYXNlKSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXllZFZhbHVlcy5wdXNoKHVuaXF1ZVZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIFNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5nZXREaXNwbGF5ZWRWYWx1ZUNvdW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlzcGxheWVkVmFsdWVzLmxlbmd0aDtcclxuICAgIH07XHJcblxyXG4gICAgU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmdldERpc3BsYXllZFZhbHVlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kaXNwbGF5ZWRWYWx1ZXNbaW5kZXhdO1xyXG4gICAgfTtcclxuXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuc2VsZWN0RXZlcnl0aGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb3VudCA9IHRoaXMudW5pcXVlVmFsdWVzLmxlbmd0aDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy51bmlxdWVWYWx1ZXNbaV07XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRWYWx1ZXNNYXBbdmFsdWVdID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZFZhbHVlc0NvdW50ID0gY291bnQ7XHJcbiAgICB9O1xyXG5cclxuICAgIFNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5pc0ZpbHRlckFjdGl2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVuaXF1ZVZhbHVlcy5sZW5ndGggIT09IHRoaXMuc2VsZWN0ZWRWYWx1ZXNDb3VudDtcclxuICAgIH07XHJcblxyXG4gICAgU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLnNlbGVjdE5vdGhpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkVmFsdWVzTWFwID0ge307XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZFZhbHVlc0NvdW50ID0gMDtcclxuICAgIH07XHJcblxyXG4gICAgU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmdldFVuaXF1ZVZhbHVlQ291bnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51bmlxdWVWYWx1ZXMubGVuZ3RoO1xyXG4gICAgfTtcclxuXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUudW5zZWxlY3RWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRWYWx1ZXNNYXBbdmFsdWVdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuc2VsZWN0ZWRWYWx1ZXNNYXBbdmFsdWVdO1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkVmFsdWVzQ291bnQtLTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIFNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5zZWxlY3RWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRWYWx1ZXNNYXBbdmFsdWVdID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFZhbHVlc01hcFt2YWx1ZV0gPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkVmFsdWVzQ291bnQrKztcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIFNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5pc1ZhbHVlU2VsZWN0ZWQgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkVmFsdWVzTWFwW3ZhbHVlXSAhPT0gdW5kZWZpbmVkO1xyXG4gICAgfTtcclxuXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuaXNFdmVyeXRoaW5nU2VsZWN0ZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51bmlxdWVWYWx1ZXMubGVuZ3RoID09PSB0aGlzLnNlbGVjdGVkVmFsdWVzQ291bnQ7XHJcbiAgICB9O1xyXG5cclxuICAgIFNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5pc05vdGhpbmdTZWxlY3RlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVuaXF1ZVZhbHVlcy5sZW5ndGggPT09IDA7XHJcbiAgICB9O1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gU2V0RmlsdGVyTW9kZWw7XHJcbiIsInZhciB0ZW1wbGF0ZSA9IFtcclxuICAgICc8ZGl2PicsXHJcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJhZy1maWx0ZXItaGVhZGVyLWNvbnRhaW5lclwiPicsXHJcbiAgICAnICAgICAgICA8aW5wdXQgY2xhc3M9XCJhZy1maWx0ZXItZmlsdGVyXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cInNlYXJjaC4uLlwiLz4nLFxyXG4gICAgJyAgICA8L2Rpdj4nLFxyXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYWctZmlsdGVyLWhlYWRlci1jb250YWluZXJcIj4nLFxyXG4gICAgJyAgICAgICAgPGxhYmVsPicsXHJcbiAgICAnICAgICAgICAgICAgPGlucHV0IGlkPVwic2VsZWN0QWxsXCIgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJhZy1maWx0ZXItY2hlY2tib3hcIi8+JyxcclxuICAgICcgICAgICAgICAgICAoU2VsZWN0IEFsbCknLFxyXG4gICAgJyAgICAgICAgPC9sYWJlbD4nLFxyXG4gICAgJyAgICA8L2Rpdj4nLFxyXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYWctZmlsdGVyLWxpc3Qtdmlld3BvcnRcIj4nLFxyXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cImFnLWZpbHRlci1saXN0LWNvbnRhaW5lclwiPicsXHJcbiAgICAnICAgICAgICAgICAgPGRpdiBpZD1cIml0ZW1Gb3JSZXBlYXRcIiBjbGFzcz1cImFnLWZpbHRlci1pdGVtXCI+JyxcclxuICAgICcgICAgICAgICAgICAgICAgPGxhYmVsPicsXHJcbiAgICAnICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJhZy1maWx0ZXItY2hlY2tib3hcIiBmaWx0ZXItY2hlY2tib3g9XCJ0cnVlXCIvPicsXHJcbiAgICAnICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImFnLWZpbHRlci12YWx1ZVwiPjwvc3Bhbj4nLFxyXG4gICAgJyAgICAgICAgICAgICAgICA8L2xhYmVsPicsXHJcbiAgICAnICAgICAgICAgICAgPC9kaXY+JyxcclxuICAgICcgICAgICAgIDwvZGl2PicsXHJcbiAgICAnICAgIDwvZGl2PicsXHJcbiAgICAnPC9kaXY+JyxcclxuXS5qb2luKCcnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XHJcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGV4dEZpbHRlclRlbXBsYXRlJyk7XHJcblxyXG52YXIgQ09OVEFJTlMgPSAxO1xyXG52YXIgRVFVQUxTID0gMjtcclxudmFyIFNUQVJUU19XSVRIID0gMztcclxudmFyIEVORFNfV0lUSCA9IDQ7XHJcblxyXG5mdW5jdGlvbiBUZXh0RmlsdGVyKHBhcmFtcykge1xyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2sgPSBwYXJhbXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrO1xyXG4gICAgdGhpcy5jcmVhdGVHdWkoKTtcclxuICAgIHRoaXMuZmlsdGVyVGV4dCA9IG51bGw7XHJcbiAgICB0aGlzLmZpbHRlclR5cGUgPSBDT05UQUlOUztcclxufVxyXG5cclxuLyogcHVibGljICovXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLmFmdGVyR3VpQXR0YWNoZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZUZpbHRlclRleHRGaWVsZC5mb2N1cygpO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLmRvZXNGaWx0ZXJQYXNzID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKCF0aGlzLmZpbHRlclRleHQpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHZhciB2YWx1ZSA9IG5vZGUudmFsdWU7XHJcbiAgICBpZiAoIXZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdmFyIHZhbHVlTG93ZXJDYXNlID0gdmFsdWUudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgc3dpdGNoICh0aGlzLmZpbHRlclR5cGUpIHtcclxuICAgICAgICBjYXNlIENPTlRBSU5TOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVMb3dlckNhc2UuaW5kZXhPZih0aGlzLmZpbHRlclRleHQpID49IDA7XHJcbiAgICAgICAgY2FzZSBFUVVBTFM6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZUxvd2VyQ2FzZSA9PT0gdGhpcy5maWx0ZXJUZXh0O1xyXG4gICAgICAgIGNhc2UgU1RBUlRTX1dJVEg6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZUxvd2VyQ2FzZS5pbmRleE9mKHRoaXMuZmlsdGVyVGV4dCkgPT09IDA7XHJcbiAgICAgICAgY2FzZSBFTkRTX1dJVEg6XHJcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHZhbHVlTG93ZXJDYXNlLmluZGV4T2YodGhpcy5maWx0ZXJUZXh0KTtcclxuICAgICAgICAgICAgcmV0dXJuIGluZGV4ID49IDAgJiYgaW5kZXggPT09ICh2YWx1ZUxvd2VyQ2FzZS5sZW5ndGggLSB0aGlzLmZpbHRlclRleHQubGVuZ3RoKTtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvLyBzaG91bGQgbmV2ZXIgaGFwcGVuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbnZhbGlkIGZpbHRlciB0eXBlICcgKyB0aGlzLmZpbHRlclR5cGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuVGV4dEZpbHRlci5wcm90b3R5cGUuZ2V0R3VpID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lR3VpO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLmlzRmlsdGVyQWN0aXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJUZXh0ICE9PSBudWxsO1xyXG59O1xyXG5cclxuVGV4dEZpbHRlci5wcm90b3R5cGUuY3JlYXRlR3VpID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVHdWkgPSB1dGlscy5sb2FkVGVtcGxhdGUodGVtcGxhdGUpO1xyXG4gICAgdGhpcy5lRmlsdGVyVGV4dEZpZWxkID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIjZmlsdGVyVGV4dFwiKTtcclxuICAgIHRoaXMuZVR5cGVTZWxlY3QgPSB0aGlzLmVHdWkucXVlcnlTZWxlY3RvcihcIiNmaWx0ZXJUeXBlXCIpO1xyXG5cclxuICAgIHV0aWxzLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuZUZpbHRlclRleHRGaWVsZCwgdGhpcy5vbkZpbHRlckNoYW5nZWQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVUeXBlU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgdGhpcy5vblR5cGVDaGFuZ2VkLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuVGV4dEZpbHRlci5wcm90b3R5cGUub25UeXBlQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5maWx0ZXJUeXBlID0gcGFyc2VJbnQodGhpcy5lVHlwZVNlbGVjdC52YWx1ZSk7XHJcbiAgICB0aGlzLmZpbHRlckNoYW5nZWRDYWxsYmFjaygpO1xyXG59O1xyXG5cclxuVGV4dEZpbHRlci5wcm90b3R5cGUub25GaWx0ZXJDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZmlsdGVyVGV4dCA9IHV0aWxzLm1ha2VOdWxsKHRoaXMuZUZpbHRlclRleHRGaWVsZC52YWx1ZSk7XHJcbiAgICBpZiAoZmlsdGVyVGV4dCAmJiBmaWx0ZXJUZXh0LnRyaW0oKSA9PT0gJycpIHtcclxuICAgICAgICBmaWx0ZXJUZXh0ID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmIChmaWx0ZXJUZXh0KSB7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJUZXh0ID0gZmlsdGVyVGV4dC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmZpbHRlclRleHQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2soKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGV4dEZpbHRlcjtcclxuIiwidmFyIHRlbXBsYXRlID0gW1xyXG4gICAgJzxkaXY+JyxcclxuICAgICc8ZGl2PicsXHJcbiAgICAnPHNlbGVjdCBjbGFzcz1cImFnLWZpbHRlci1zZWxlY3RcIiBpZD1cImZpbHRlclR5cGVcIj4nLFxyXG4gICAgJzxvcHRpb24gdmFsdWU9XCIxXCI+Q29udGFpbnM8L29wdGlvbj4nLFxyXG4gICAgJzxvcHRpb24gdmFsdWU9XCIyXCI+RXF1YWxzPC9vcHRpb24+JyxcclxuICAgICc8b3B0aW9uIHZhbHVlPVwiM1wiPlN0YXJ0cyB3aXRoPC9vcHRpb24+JyxcclxuICAgICc8b3B0aW9uIHZhbHVlPVwiNFwiPkVuZHMgd2l0aDwvb3B0aW9uPicsXHJcbiAgICAnPC9zZWxlY3Q+JyxcclxuICAgICc8L2Rpdj4nLFxyXG4gICAgJzxkaXY+JyxcclxuICAgICc8aW5wdXQgY2xhc3M9XCJhZy1maWx0ZXItZmlsdGVyXCIgaWQ9XCJmaWx0ZXJUZXh0XCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cImZpbHRlci4uLlwiLz4nLFxyXG4gICAgJzwvZGl2PicsXHJcbiAgICAnPC9kaXY+JyxcclxuXS5qb2luKCcnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XHJcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxudmFyIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XHJcbnZhciBHcmlkT3B0aW9uc1dyYXBwZXIgPSByZXF1aXJlKCcuL2dyaWRPcHRpb25zV3JhcHBlcicpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlLmpzJyk7XHJcbnZhciB0ZW1wbGF0ZU5vU2Nyb2xscyA9IHJlcXVpcmUoJy4vdGVtcGxhdGVOb1Njcm9sbHMuanMnKTtcclxudmFyIFNlbGVjdGlvbkNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL3NlbGVjdGlvbkNvbnRyb2xsZXInKTtcclxudmFyIEZpbHRlck1hbmFnZXIgPSByZXF1aXJlKCcuL2ZpbHRlci9maWx0ZXJNYW5hZ2VyJyk7XHJcbnZhciBTZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkgPSByZXF1aXJlKCcuL3NlbGVjdGlvblJlbmRlcmVyRmFjdG9yeScpO1xyXG52YXIgQ29sdW1uQ29udHJvbGxlciA9IHJlcXVpcmUoJy4vY29sdW1uQ29udHJvbGxlcicpO1xyXG52YXIgUm93UmVuZGVyZXIgPSByZXF1aXJlKCcuL3Jvd1JlbmRlcmVyJyk7XHJcbnZhciBIZWFkZXJSZW5kZXJlciA9IHJlcXVpcmUoJy4vaGVhZGVyUmVuZGVyZXInKTtcclxudmFyIEluTWVtb3J5Um93Q29udHJvbGxlciA9IHJlcXVpcmUoJy4vaW5NZW1vcnlSb3dDb250cm9sbGVyJyk7XHJcbnZhciBWaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIgPSByZXF1aXJlKCcuL3ZpcnR1YWxQYWdlUm93Q29udHJvbGxlcicpO1xyXG52YXIgUGFnaW5hdGlvbkNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL3BhZ2luYXRpb25Db250cm9sbGVyJyk7XHJcbnZhciBFeHByZXNzaW9uU2VydmljZSA9IHJlcXVpcmUoJy4vZXhwcmVzc2lvblNlcnZpY2UnKTtcclxudmFyIFRlbXBsYXRlU2VydmljZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGVTZXJ2aWNlJyk7XHJcblxyXG5mdW5jdGlvbiBHcmlkKGVHcmlkRGl2LCBncmlkT3B0aW9ucywgJHNjb3BlLCAkY29tcGlsZSkge1xyXG5cclxuICAgIHRoaXMuZ3JpZE9wdGlvbnMgPSBncmlkT3B0aW9ucztcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyID0gbmV3IEdyaWRPcHRpb25zV3JhcHBlcih0aGlzLmdyaWRPcHRpb25zKTtcclxuXHJcbiAgICB2YXIgdXNlU2Nyb2xscyA9ICF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0RvbnRVc2VTY3JvbGxzKCk7XHJcbiAgICBpZiAodXNlU2Nyb2xscykge1xyXG4gICAgICAgIGVHcmlkRGl2LmlubmVySFRNTCA9IHRlbXBsYXRlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBlR3JpZERpdi5pbm5lckhUTUwgPSB0ZW1wbGF0ZU5vU2Nyb2xscztcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB0aGlzLnF1aWNrRmlsdGVyID0gbnVsbDtcclxuXHJcbiAgICAvLyBpZiB1c2luZyBhbmd1bGFyLCB3YXRjaCBmb3IgcXVpY2tGaWx0ZXIgY2hhbmdlc1xyXG4gICAgaWYgKCRzY29wZSkge1xyXG4gICAgICAgICRzY29wZS4kd2F0Y2goXCJhbmd1bGFyR3JpZC5xdWlja0ZpbHRlclRleHRcIiwgZnVuY3Rpb24obmV3RmlsdGVyKSB7XHJcbiAgICAgICAgICAgIHRoYXQub25RdWlja0ZpbHRlckNoYW5nZWQobmV3RmlsdGVyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnZpcnR1YWxSb3dDYWxsYmFja3MgPSB7fTtcclxuXHJcbiAgICB0aGlzLmFkZEFwaSgpO1xyXG4gICAgdGhpcy5maW5kQWxsRWxlbWVudHMoZUdyaWREaXYpO1xyXG4gICAgdGhpcy5jcmVhdGVBbmRXaXJlQmVhbnMoJHNjb3BlLCAkY29tcGlsZSwgZUdyaWREaXYsIHVzZVNjcm9sbHMpO1xyXG5cclxuICAgIHRoaXMuc2Nyb2xsV2lkdGggPSB1dGlscy5nZXRTY3JvbGxiYXJXaWR0aCgpO1xyXG5cclxuICAgIHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyLnNldEFsbFJvd3ModGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QWxsUm93cygpKTtcclxuXHJcbiAgICBpZiAodXNlU2Nyb2xscykge1xyXG4gICAgICAgIHRoaXMuYWRkU2Nyb2xsTGlzdGVuZXIoKTtcclxuICAgICAgICB0aGlzLnNldEJvZHlTaXplKCk7IC8vc2V0dGluZyBzaXplcyBvZiBib2R5IChjb250YWluaW5nIHZpZXdwb3J0cyksIGRvZXNuJ3QgY2hhbmdlIGNvbnRhaW5lciBzaXplc1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGRvbmUgd2hlbiBjb2xzIGNoYW5nZVxyXG4gICAgdGhpcy5zZXR1cENvbHVtbnMoKTtcclxuXHJcbiAgICAvLyBkb25lIHdoZW4gcm93cyBjaGFuZ2VcclxuICAgIHRoaXMudXBkYXRlTW9kZWxBbmRSZWZyZXNoKGNvbnN0YW50cy5TVEVQX0VWRVJZVEhJTkcpO1xyXG5cclxuICAgIC8vIGZsYWcgdG8gbWFyayB3aGVuIHRoZSBkaXJlY3RpdmUgaXMgZGVzdHJveWVkXHJcbiAgICB0aGlzLmZpbmlzaGVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gaWYgbm8gZGF0YSBwcm92aWRlZCBpbml0aWFsbHksIGFuZCBub3QgZG9pbmcgaW5maW5pdGUgc2Nyb2xsaW5nLCBzaG93IHRoZSBsb2FkaW5nIHBhbmVsXHJcbiAgICB2YXIgc2hvd0xvYWRpbmcgPSAhdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QWxsUm93cygpICYmICF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc1ZpcnR1YWxQYWdpbmcoKTtcclxuICAgIHRoaXMuc2hvd0xvYWRpbmdQYW5lbChzaG93TG9hZGluZyk7XHJcblxyXG4gICAgLy8gaWYgZGF0YXNvdXJjZSBwcm92aWRlZCwgdXNlIGl0XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0RGF0YXNvdXJjZSgpKSB7XHJcbiAgICAgICAgdGhpcy5zZXREYXRhc291cmNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgcmVhZHkgZnVuY3Rpb24gcHJvdmlkZWQsIHVzZSBpdFxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSZWFkeSgpID09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSZWFkeSgpKGdyaWRPcHRpb25zLmFwaSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkdyaWQucHJvdG90eXBlLmNyZWF0ZUFuZFdpcmVCZWFucyA9IGZ1bmN0aW9uKCRzY29wZSwgJGNvbXBpbGUsIGVHcmlkRGl2LCB1c2VTY3JvbGxzKSB7XHJcblxyXG4gICAgLy8gbWFrZSBsb2NhbCByZWZlcmVuY2VzLCB0byBtYWtlIHRoZSBiZWxvdyBtb3JlIGh1bWFuIHJlYWRhYmxlXHJcbiAgICB2YXIgZ3JpZE9wdGlvbnNXcmFwcGVyID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB2YXIgZ3JpZE9wdGlvbnMgPSB0aGlzLmdyaWRPcHRpb25zO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbGwgdGhlIGJlYW5zXHJcbiAgICB2YXIgc2VsZWN0aW9uQ29udHJvbGxlciA9IG5ldyBTZWxlY3Rpb25Db250cm9sbGVyKCk7XHJcbiAgICB2YXIgZmlsdGVyTWFuYWdlciA9IG5ldyBGaWx0ZXJNYW5hZ2VyKCk7XHJcbiAgICB2YXIgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5ID0gbmV3IFNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSgpO1xyXG4gICAgdmFyIGNvbHVtbkNvbnRyb2xsZXIgPSBuZXcgQ29sdW1uQ29udHJvbGxlcigpO1xyXG4gICAgdmFyIHJvd1JlbmRlcmVyID0gbmV3IFJvd1JlbmRlcmVyKCk7XHJcbiAgICB2YXIgaGVhZGVyUmVuZGVyZXIgPSBuZXcgSGVhZGVyUmVuZGVyZXIoKTtcclxuICAgIHZhciBpbk1lbW9yeVJvd0NvbnRyb2xsZXIgPSBuZXcgSW5NZW1vcnlSb3dDb250cm9sbGVyKCk7XHJcbiAgICB2YXIgdmlydHVhbFBhZ2VSb3dDb250cm9sbGVyID0gbmV3IFZpcnR1YWxQYWdlUm93Q29udHJvbGxlcigpO1xyXG4gICAgdmFyIGV4cHJlc3Npb25TZXJ2aWNlID0gbmV3IEV4cHJlc3Npb25TZXJ2aWNlKCk7XHJcbiAgICB2YXIgdGVtcGxhdGVTZXJ2aWNlID0gbmV3IFRlbXBsYXRlU2VydmljZSgpO1xyXG5cclxuICAgIHZhciBjb2x1bW5Nb2RlbCA9IGNvbHVtbkNvbnRyb2xsZXIuZ2V0TW9kZWwoKTtcclxuXHJcbiAgICAvLyBpbml0aWFsaXNlIGFsbCB0aGUgYmVhbnNcclxuICAgIHRlbXBsYXRlU2VydmljZS5pbml0KCRzY29wZSk7XHJcbiAgICBzZWxlY3Rpb25Db250cm9sbGVyLmluaXQodGhpcywgdGhpcy5lUGFyZW50T2ZSb3dzLCBncmlkT3B0aW9uc1dyYXBwZXIsICRzY29wZSwgcm93UmVuZGVyZXIpO1xyXG4gICAgZmlsdGVyTWFuYWdlci5pbml0KHRoaXMsIGdyaWRPcHRpb25zV3JhcHBlciwgJGNvbXBpbGUsICRzY29wZSk7XHJcbiAgICBzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkuaW5pdCh0aGlzLCBzZWxlY3Rpb25Db250cm9sbGVyKTtcclxuICAgIGNvbHVtbkNvbnRyb2xsZXIuaW5pdCh0aGlzLCBzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnksIGdyaWRPcHRpb25zV3JhcHBlcik7XHJcbiAgICByb3dSZW5kZXJlci5pbml0KGdyaWRPcHRpb25zLCBjb2x1bW5Nb2RlbCwgZ3JpZE9wdGlvbnNXcmFwcGVyLCBlR3JpZERpdiwgdGhpcyxcclxuICAgICAgICBzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnksICRjb21waWxlLCAkc2NvcGUsIHNlbGVjdGlvbkNvbnRyb2xsZXIsIGV4cHJlc3Npb25TZXJ2aWNlLCB0ZW1wbGF0ZVNlcnZpY2UpO1xyXG4gICAgaGVhZGVyUmVuZGVyZXIuaW5pdChncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbkNvbnRyb2xsZXIsIGNvbHVtbk1vZGVsLCBlR3JpZERpdiwgdGhpcywgZmlsdGVyTWFuYWdlciwgJHNjb3BlLCAkY29tcGlsZSk7XHJcbiAgICBpbk1lbW9yeVJvd0NvbnRyb2xsZXIuaW5pdChncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbk1vZGVsLCB0aGlzLCBmaWx0ZXJNYW5hZ2VyLCAkc2NvcGUsIGV4cHJlc3Npb25TZXJ2aWNlKTtcclxuICAgIHZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5pbml0KHJvd1JlbmRlcmVyKTtcclxuXHJcbiAgICAvLyB0aGlzIGlzIGEgY2hpbGQgYmVhbiwgZ2V0IGEgcmVmZXJlbmNlIGFuZCBwYXNzIGl0IG9uXHJcbiAgICAvLyBDQU4gV0UgREVMRVRFIFRISVM/IGl0J3MgZG9uZSBpbiB0aGUgc2V0RGF0YXNvdXJjZSBzZWN0aW9uXHJcbiAgICB2YXIgcm93TW9kZWwgPSBpbk1lbW9yeVJvd0NvbnRyb2xsZXIuZ2V0TW9kZWwoKTtcclxuICAgIHNlbGVjdGlvbkNvbnRyb2xsZXIuc2V0Um93TW9kZWwocm93TW9kZWwpO1xyXG4gICAgZmlsdGVyTWFuYWdlci5zZXRSb3dNb2RlbChyb3dNb2RlbCk7XHJcbiAgICByb3dSZW5kZXJlci5zZXRSb3dNb2RlbChyb3dNb2RlbCk7XHJcblxyXG4gICAgLy8gYW5kIHRoZSBsYXN0IGJlYW4sIGRvbmUgaW4gaXQncyBvd24gc2VjdGlvbiwgYXMgaXQncyBvcHRpb25hbFxyXG4gICAgdmFyIHBhZ2luYXRpb25Db250cm9sbGVyID0gbnVsbDtcclxuICAgIGlmICh1c2VTY3JvbGxzKSB7XHJcbiAgICAgICAgcGFnaW5hdGlvbkNvbnRyb2xsZXIgPSBuZXcgUGFnaW5hdGlvbkNvbnRyb2xsZXIoKTtcclxuICAgICAgICBwYWdpbmF0aW9uQ29udHJvbGxlci5pbml0KHRoaXMuZVBhZ2luZ1BhbmVsLCB0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJvd01vZGVsID0gcm93TW9kZWw7XHJcbiAgICB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIgPSBzZWxlY3Rpb25Db250cm9sbGVyO1xyXG4gICAgdGhpcy5jb2x1bW5Db250cm9sbGVyID0gY29sdW1uQ29udHJvbGxlcjtcclxuICAgIHRoaXMuY29sdW1uTW9kZWwgPSBjb2x1bW5Nb2RlbDtcclxuICAgIHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyID0gaW5NZW1vcnlSb3dDb250cm9sbGVyO1xyXG4gICAgdGhpcy52aXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIgPSB2aXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXI7XHJcbiAgICB0aGlzLnJvd1JlbmRlcmVyID0gcm93UmVuZGVyZXI7XHJcbiAgICB0aGlzLmhlYWRlclJlbmRlcmVyID0gaGVhZGVyUmVuZGVyZXI7XHJcbiAgICB0aGlzLnBhZ2luYXRpb25Db250cm9sbGVyID0gcGFnaW5hdGlvbkNvbnRyb2xsZXI7XHJcbiAgICB0aGlzLmZpbHRlck1hbmFnZXIgPSBmaWx0ZXJNYW5hZ2VyO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2hvd0FuZFBvc2l0aW9uUGFnaW5nUGFuZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIG5vIHBhZ2luZyB3aGVuIG5vLXNjcm9sbHNcclxuICAgIGlmICghdGhpcy5lUGFnaW5nUGFuZWwpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaXNTaG93UGFnaW5nUGFuZWwoKSkge1xyXG4gICAgICAgIHRoaXMuZVBhZ2luZ1BhbmVsLnN0eWxlWydkaXNwbGF5J10gPSBudWxsO1xyXG4gICAgICAgIHZhciBoZWlnaHRPZlBhZ2VyID0gdGhpcy5lUGFnaW5nUGFuZWwub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuZUJvZHkuc3R5bGVbJ3BhZGRpbmctYm90dG9tJ10gPSBoZWlnaHRPZlBhZ2VyICsgJ3B4JztcclxuICAgICAgICB2YXIgaGVpZ2h0T2ZSb290ID0gdGhpcy5lUm9vdC5jbGllbnRIZWlnaHQ7XHJcbiAgICAgICAgdmFyIHRvcE9mUGFnZXIgPSBoZWlnaHRPZlJvb3QgLSBoZWlnaHRPZlBhZ2VyO1xyXG4gICAgICAgIHRoaXMuZVBhZ2luZ1BhbmVsLnN0eWxlWyd0b3AnXSA9IHRvcE9mUGFnZXIgKyAncHgnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVQYWdpbmdQYW5lbC5zdHlsZVsnZGlzcGxheSddID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuZUJvZHkuc3R5bGVbJ3BhZGRpbmctYm90dG9tJ10gPSBudWxsO1xyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmlzU2hvd1BhZ2luZ1BhbmVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zaG93UGFnaW5nUGFuZWw7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zZXREYXRhc291cmNlID0gZnVuY3Rpb24oZGF0YXNvdXJjZSkge1xyXG4gICAgLy8gaWYgZGF0YXNvdXJjZSBwcm92aWRlZCwgdGhlbiBzZXQgaXRcclxuICAgIGlmIChkYXRhc291cmNlKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5kYXRhc291cmNlID0gZGF0YXNvdXJjZTtcclxuICAgIH1cclxuICAgIC8vIGdldCB0aGUgc2V0IGRhdGFzb3VyY2UgKGlmIG51bGwgd2FzIHBhc3NlZCB0byB0aGlzIG1ldGhvZCxcclxuICAgIC8vIHRoZW4gbmVlZCB0byBnZXQgdGhlIGFjdHVhbCBkYXRhc291cmNlIGZyb20gb3B0aW9uc1xyXG4gICAgdmFyIGRhdGFzb3VyY2VUb1VzZSA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldERhdGFzb3VyY2UoKTtcclxuICAgIHZhciB2aXJ0dWFsUGFnaW5nID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNWaXJ0dWFsUGFnaW5nKCkgJiYgZGF0YXNvdXJjZVRvVXNlO1xyXG4gICAgdmFyIHBhZ2luYXRpb24gPSBkYXRhc291cmNlVG9Vc2UgJiYgIXZpcnR1YWxQYWdpbmc7XHJcblxyXG4gICAgaWYgKHZpcnR1YWxQYWdpbmcpIHtcclxuICAgICAgICB0aGlzLnBhZ2luYXRpb25Db250cm9sbGVyLnNldERhdGFzb3VyY2UobnVsbCk7XHJcbiAgICAgICAgdGhpcy52aXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIuc2V0RGF0YXNvdXJjZShkYXRhc291cmNlVG9Vc2UpO1xyXG4gICAgICAgIHRoaXMucm93TW9kZWwgPSB0aGlzLnZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5nZXRNb2RlbCgpO1xyXG4gICAgICAgIHRoaXMuc2hvd1BhZ2luZ1BhbmVsID0gZmFsc2U7XHJcbiAgICB9IGVsc2UgaWYgKHBhZ2luYXRpb24pIHtcclxuICAgICAgICB0aGlzLnBhZ2luYXRpb25Db250cm9sbGVyLnNldERhdGFzb3VyY2UoZGF0YXNvdXJjZVRvVXNlKTtcclxuICAgICAgICB0aGlzLnZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5zZXREYXRhc291cmNlKG51bGwpO1xyXG4gICAgICAgIHRoaXMucm93TW9kZWwgPSB0aGlzLmluTWVtb3J5Um93Q29udHJvbGxlci5nZXRNb2RlbCgpO1xyXG4gICAgICAgIHRoaXMuc2hvd1BhZ2luZ1BhbmVsID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uQ29udHJvbGxlci5zZXREYXRhc291cmNlKG51bGwpO1xyXG4gICAgICAgIHRoaXMudmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnNldERhdGFzb3VyY2UobnVsbCk7XHJcbiAgICAgICAgdGhpcy5yb3dNb2RlbCA9IHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyLmdldE1vZGVsKCk7XHJcbiAgICAgICAgdGhpcy5zaG93UGFnaW5nUGFuZWwgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIuc2V0Um93TW9kZWwodGhpcy5yb3dNb2RlbCk7XHJcbiAgICB0aGlzLmZpbHRlck1hbmFnZXIuc2V0Um93TW9kZWwodGhpcy5yb3dNb2RlbCk7XHJcbiAgICB0aGlzLnJvd1JlbmRlcmVyLnNldFJvd01vZGVsKHRoaXMucm93TW9kZWwpO1xyXG5cclxuICAgIC8vIHdlIG1heSBvZiBqdXN0IHNob3duIG9yIGhpZGRlbiB0aGUgcGFnaW5nIHBhbmVsLCBzbyBuZWVkXHJcbiAgICAvLyB0byBnZXQgdGFibGUgdG8gY2hlY2sgdGhlIGJvZHkgc2l6ZSwgd2hpY2ggYWxzbyBoaWRlcyBhbmRcclxuICAgIC8vIHNob3dzIHRoZSBwYWdpbmcgcGFuZWwuXHJcbiAgICB0aGlzLnNldEJvZHlTaXplKCk7XHJcblxyXG4gICAgLy8gYmVjYXVzZSB3ZSBqdXN0IHNldCB0aGUgcm93TW9kZWwsIG5lZWQgdG8gdXBkYXRlIHRoZSBndWlcclxuICAgIHRoaXMucm93UmVuZGVyZXIucmVmcmVzaFZpZXcoKTtcclxufTtcclxuXHJcbi8vIGdldHMgY2FsbGVkIGFmdGVyIGNvbHVtbnMgYXJlIHNob3duIC8gaGlkZGVuIGZyb20gZ3JvdXBzIGV4cGFuZGluZ1xyXG5HcmlkLnByb3RvdHlwZS5yZWZyZXNoSGVhZGVyQW5kQm9keSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci5yZWZyZXNoSGVhZGVyKCk7XHJcbiAgICB0aGlzLmhlYWRlclJlbmRlcmVyLnVwZGF0ZUZpbHRlckljb25zKCk7XHJcbiAgICB0aGlzLnNldEJvZHlDb250YWluZXJXaWR0aCgpO1xyXG4gICAgdGhpcy5zZXRQaW5uZWRDb2xDb250YWluZXJXaWR0aCgpO1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0RmluaXNoZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZmluaXNoZWQgPSB0cnVlO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuZ2V0UG9wdXBQYXJlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmVSb290O1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuZ2V0UXVpY2tGaWx0ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLnF1aWNrRmlsdGVyO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUub25RdWlja0ZpbHRlckNoYW5nZWQgPSBmdW5jdGlvbihuZXdGaWx0ZXIpIHtcclxuICAgIGlmIChuZXdGaWx0ZXIgPT09IHVuZGVmaW5lZCB8fCBuZXdGaWx0ZXIgPT09IFwiXCIpIHtcclxuICAgICAgICBuZXdGaWx0ZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucXVpY2tGaWx0ZXIgIT09IG5ld0ZpbHRlcikge1xyXG4gICAgICAgIC8vd2FudCAnbnVsbCcgdG8gbWVhbiB0byBmaWx0ZXIsIHNvIHJlbW92ZSB1bmRlZmluZWQgYW5kIGVtcHR5IHN0cmluZ1xyXG4gICAgICAgIGlmIChuZXdGaWx0ZXIgPT09IHVuZGVmaW5lZCB8fCBuZXdGaWx0ZXIgPT09IFwiXCIpIHtcclxuICAgICAgICAgICAgbmV3RmlsdGVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5ld0ZpbHRlciAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBuZXdGaWx0ZXIgPSBuZXdGaWx0ZXIudG9VcHBlckNhc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5xdWlja0ZpbHRlciA9IG5ld0ZpbHRlcjtcclxuICAgICAgICB0aGlzLm9uRmlsdGVyQ2hhbmdlZCgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUub25GaWx0ZXJDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9GSUxURVIpO1xyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci51cGRhdGVGaWx0ZXJJY29ucygpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUub25Sb3dDbGlja2VkID0gZnVuY3Rpb24oZXZlbnQsIHJvd0luZGV4LCBub2RlKSB7XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMucm93Q2xpY2tlZCkge1xyXG4gICAgICAgIHZhciBwYXJhbXMgPSB7XHJcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgZXZlbnQ6IGV2ZW50XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zLnJvd0NsaWNrZWQocGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB3ZSBkbyBub3QgYWxsb3cgc2VsZWN0aW5nIGdyb3VwcyBieSBjbGlja2luZyAoYXMgdGhlIGNsaWNrIGhlcmUgZXhwYW5kcyB0aGUgZ3JvdXApXHJcbiAgICAvLyBzbyByZXR1cm4gaWYgaXQncyBhIGdyb3VwIHJvd1xyXG4gICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgbm8gc2VsZWN0aW9uIG1ldGhvZCBlbmFibGVkLCBkbyBub3RoaW5nXHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzUm93U2VsZWN0aW9uKCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgY2xpY2sgc2VsZWN0aW9uIHN1cHByZXNzZWQsIGRvIG5vdGhpbmdcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc1N1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb24oKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjdHJsS2V5IGZvciB3aW5kb3dzLCBtZXRhS2V5IGZvciBBcHBsZVxyXG4gICAgdmFyIHRyeU11bHRpID0gZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5O1xyXG4gICAgdGhpcy5zZWxlY3Rpb25Db250cm9sbGVyLnNlbGVjdE5vZGUobm9kZSwgdHJ5TXVsdGkpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0SGVhZGVySGVpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaGVhZGVySGVpZ2h0ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0SGVhZGVySGVpZ2h0KCk7XHJcbiAgICB2YXIgaGVhZGVySGVpZ2h0UGl4ZWxzID0gaGVhZGVySGVpZ2h0ICsgJ3B4JztcclxuICAgIHZhciBkb250VXNlU2Nyb2xscyA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9udFVzZVNjcm9sbHMoKTtcclxuICAgIGlmIChkb250VXNlU2Nyb2xscykge1xyXG4gICAgICAgIHRoaXMuZUhlYWRlckNvbnRhaW5lci5zdHlsZVsnaGVpZ2h0J10gPSBoZWFkZXJIZWlnaHRQaXhlbHM7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZUhlYWRlci5zdHlsZVsnaGVpZ2h0J10gPSBoZWFkZXJIZWlnaHRQaXhlbHM7XHJcbiAgICAgICAgdGhpcy5lQm9keS5zdHlsZVsncGFkZGluZy10b3AnXSA9IGhlYWRlckhlaWdodFBpeGVscztcclxuICAgICAgICB0aGlzLmVMb2FkaW5nUGFuZWwuc3R5bGVbJ21hcmdpbi10b3AnXSA9IGhlYWRlckhlaWdodFBpeGVscztcclxuICAgIH1cclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNob3dMb2FkaW5nUGFuZWwgPSBmdW5jdGlvbihzaG93KSB7XHJcbiAgICBpZiAoc2hvdykge1xyXG4gICAgICAgIC8vIHNldHRpbmcgZGlzcGxheSB0byBudWxsLCBhY3R1YWxseSBoYXMgdGhlIGltcGFjdCBvZiBzZXR0aW5nIGl0XHJcbiAgICAgICAgLy8gdG8gJ3RhYmxlJywgYXMgdGhpcyBpcyBwYXJ0IG9mIHRoZSBhZy1sb2FkaW5nLXBhbmVsIGNvcmUgc3R5bGVcclxuICAgICAgICB0aGlzLmVMb2FkaW5nUGFuZWwuc3R5bGUuZGlzcGxheSA9IG51bGw7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZUxvYWRpbmdQYW5lbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0dXBDb2x1bW5zID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNldEhlYWRlckhlaWdodCgpO1xyXG4gICAgdGhpcy5jb2x1bW5Db250cm9sbGVyLnNldENvbHVtbnModGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29sdW1uRGVmcygpKTtcclxuICAgIHRoaXMuc2hvd1Bpbm5lZENvbENvbnRhaW5lcnNJZk5lZWRlZCgpO1xyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci5yZWZyZXNoSGVhZGVyKCk7XHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9udFVzZVNjcm9sbHMoKSkge1xyXG4gICAgICAgIHRoaXMuc2V0UGlubmVkQ29sQ29udGFpbmVyV2lkdGgoKTtcclxuICAgICAgICB0aGlzLnNldEJvZHlDb250YWluZXJXaWR0aCgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci51cGRhdGVGaWx0ZXJJY29ucygpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0Qm9keUNvbnRhaW5lcldpZHRoID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbWFpblJvd1dpZHRoID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRCb2R5Q29udGFpbmVyV2lkdGgoKSArIFwicHhcIjtcclxuICAgIHRoaXMuZUJvZHlDb250YWluZXIuc3R5bGUud2lkdGggPSBtYWluUm93V2lkdGg7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS51cGRhdGVNb2RlbEFuZFJlZnJlc2ggPSBmdW5jdGlvbihzdGVwKSB7XHJcbiAgICB0aGlzLmluTWVtb3J5Um93Q29udHJvbGxlci51cGRhdGVNb2RlbChzdGVwKTtcclxuICAgIHRoaXMucm93UmVuZGVyZXIucmVmcmVzaFZpZXcoKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNldFJvd3MgPSBmdW5jdGlvbihyb3dzLCBmaXJzdElkKSB7XHJcbiAgICBpZiAocm93cykge1xyXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMucm93RGF0YSA9IHJvd3M7XHJcbiAgICB9XHJcbiAgICB0aGlzLmluTWVtb3J5Um93Q29udHJvbGxlci5zZXRBbGxSb3dzKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFsbFJvd3MoKSwgZmlyc3RJZCk7XHJcbiAgICB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIuY2xlYXJTZWxlY3Rpb24oKTtcclxuICAgIHRoaXMuZmlsdGVyTWFuYWdlci5vbk5ld1Jvd3NMb2FkZWQoKTtcclxuICAgIHRoaXMudXBkYXRlTW9kZWxBbmRSZWZyZXNoKGNvbnN0YW50cy5TVEVQX0VWRVJZVEhJTkcpO1xyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci51cGRhdGVGaWx0ZXJJY29ucygpO1xyXG4gICAgdGhpcy5zaG93TG9hZGluZ1BhbmVsKGZhbHNlKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmFkZEFwaSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIGFwaSA9IHtcclxuICAgICAgICBzZXREYXRhc291cmNlOiBmdW5jdGlvbihkYXRhc291cmNlKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YXNvdXJjZShkYXRhc291cmNlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uTmV3RGF0YXNvdXJjZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YXNvdXJjZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0Um93czogZnVuY3Rpb24ocm93cykge1xyXG4gICAgICAgICAgICB0aGF0LnNldFJvd3Mocm93cyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbk5ld1Jvd3M6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LnNldFJvd3MoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uTmV3Q29sczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQub25OZXdDb2xzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1bnNlbGVjdEFsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5jbGVhclNlbGVjdGlvbigpO1xyXG4gICAgICAgICAgICB0aGF0LnJvd1JlbmRlcmVyLnJlZnJlc2hWaWV3KCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWZyZXNoVmlldzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQucm93UmVuZGVyZXIucmVmcmVzaFZpZXcoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNvZnRSZWZyZXNoVmlldzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQucm93UmVuZGVyZXIuc29mdFJlZnJlc2hWaWV3KCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWZyZXNoR3JvdXBSb3dzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5yb3dSZW5kZXJlci5yZWZyZXNoR3JvdXBSb3dzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWZyZXNoSGVhZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gbmVlZCB0byByZXZpZXcgdGhpcyAtIHRoZSByZWZyZXNoSGVhZGVyIHNob3VsZCBhbHNvIHJlZnJlc2ggYWxsIGljb25zIGluIHRoZSBoZWFkZXJcclxuICAgICAgICAgICAgdGhhdC5oZWFkZXJSZW5kZXJlci5yZWZyZXNoSGVhZGVyKCk7XHJcbiAgICAgICAgICAgIHRoYXQuaGVhZGVyUmVuZGVyZXIudXBkYXRlRmlsdGVySWNvbnMoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldE1vZGVsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQucm93TW9kZWw7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkdyb3VwRXhwYW5kZWRPckNvbGxhcHNlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQudXBkYXRlTW9kZWxBbmRSZWZyZXNoKGNvbnN0YW50cy5TVEVQX01BUCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBleHBhbmRBbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LmluTWVtb3J5Um93Q29udHJvbGxlci5leHBhbmRPckNvbGxhcHNlQWxsKHRydWUsIG51bGwpO1xyXG4gICAgICAgICAgICB0aGF0LnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9NQVApO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29sbGFwc2VBbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LmluTWVtb3J5Um93Q29udHJvbGxlci5leHBhbmRPckNvbGxhcHNlQWxsKGZhbHNlLCBudWxsKTtcclxuICAgICAgICAgICAgdGhhdC51cGRhdGVNb2RlbEFuZFJlZnJlc2goY29uc3RhbnRzLlNURVBfTUFQKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZFZpcnR1YWxSb3dMaXN0ZW5lcjogZnVuY3Rpb24ocm93SW5kZXgsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHRoYXQuYWRkVmlydHVhbFJvd0xpc3RlbmVyKHJvd0luZGV4LCBjYWxsYmFjayk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByb3dEYXRhQ2hhbmdlZDogZnVuY3Rpb24ocm93cykge1xyXG4gICAgICAgICAgICB0aGF0LnJvd1JlbmRlcmVyLnJvd0RhdGFDaGFuZ2VkKHJvd3MpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0UXVpY2tGaWx0ZXI6IGZ1bmN0aW9uKG5ld0ZpbHRlcikge1xyXG4gICAgICAgICAgICB0aGF0Lm9uUXVpY2tGaWx0ZXJDaGFuZ2VkKG5ld0ZpbHRlcilcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdEluZGV4OiBmdW5jdGlvbihpbmRleCwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5zZWxlY3RJbmRleChpbmRleCwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlc2VsZWN0SW5kZXg6IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5kZXNlbGVjdEluZGV4KGluZGV4KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdE5vZGU6IGZ1bmN0aW9uKG5vZGUsIHRyeU11bHRpLCBzdXBwcmVzc0V2ZW50cykge1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuc2VsZWN0Tm9kZShub2RlLCB0cnlNdWx0aSwgc3VwcHJlc3NFdmVudHMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVzZWxlY3ROb2RlOiBmdW5jdGlvbihub2RlKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5kZXNlbGVjdE5vZGUobm9kZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWNvbXB1dGVBZ2dyZWdhdGVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5pbk1lbW9yeVJvd0NvbnRyb2xsZXIuZG9BZ2dyZWdhdGUoKTtcclxuICAgICAgICAgICAgdGhhdC5yb3dSZW5kZXJlci5yZWZyZXNoR3JvdXBSb3dzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaXplQ29sdW1uc1RvRml0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGF2YWlsYWJsZVdpZHRoID0gdGhhdC5lQm9keS5jbGllbnRXaWR0aDtcclxuICAgICAgICAgICAgdGhhdC5jb2x1bW5Db250cm9sbGVyLnNpemVDb2x1bW5zVG9GaXQoYXZhaWxhYmxlV2lkdGgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29uc3VtZVVudXNlZENvbHVtbldpZHRoOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGF2YWlsYWJsZVdpZHRoID0gdGhhdC5lQm9keS5jbGllbnRXaWR0aDtcclxuICAgICAgICAgICAgdGhhdC5jb2x1bW5Db250cm9sbGVyLmNvbnN1bWVVbnVzZWRDb2x1bW5XaWR0aChhdmFpbGFibGVXaWR0aCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaG93TG9hZGluZzogZnVuY3Rpb24oc2hvdykge1xyXG4gICAgICAgICAgICB0aGF0LnNob3dMb2FkaW5nUGFuZWwoc2hvdyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc05vZGVTZWxlY3RlZDogZnVuY3Rpb24obm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLmlzTm9kZVNlbGVjdGVkKG5vZGUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0U2VsZWN0ZWROb2RlczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuZ2V0U2VsZWN0ZWROb2RlcygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0QmVzdENvc3ROb2RlU2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5nZXRCZXN0Q29zdE5vZGVTZWxlY3Rpb24oKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhpcy5ncmlkT3B0aW9ucy5hcGkgPSBhcGk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5hZGRWaXJ0dWFsUm93TGlzdGVuZXIgPSBmdW5jdGlvbihyb3dJbmRleCwgY2FsbGJhY2spIHtcclxuICAgIGlmICghdGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XSkge1xyXG4gICAgICAgIHRoaXMudmlydHVhbFJvd0NhbGxiYWNrc1tyb3dJbmRleF0gPSBbXTtcclxuICAgIH1cclxuICAgIHRoaXMudmlydHVhbFJvd0NhbGxiYWNrc1tyb3dJbmRleF0ucHVzaChjYWxsYmFjayk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5vblZpcnR1YWxSb3dTZWxlY3RlZCA9IGZ1bmN0aW9uKHJvd0luZGV4LCBzZWxlY3RlZCkge1xyXG4gICAgLy8gaW5mb3JtIHRoZSBjYWxsYmFja3Mgb2YgdGhlIGV2ZW50XHJcbiAgICBpZiAodGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XSkge1xyXG4gICAgICAgIHRoaXMudmlydHVhbFJvd0NhbGxiYWNrc1tyb3dJbmRleF0uZm9yRWFjaChmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrLnJvd1JlbW92ZWQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrLnJvd1NlbGVjdGVkKHNlbGVjdGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUub25WaXJ0dWFsUm93UmVtb3ZlZCA9IGZ1bmN0aW9uKHJvd0luZGV4KSB7XHJcbiAgICAvLyBpbmZvcm0gdGhlIGNhbGxiYWNrcyBvZiB0aGUgZXZlbnRcclxuICAgIGlmICh0aGlzLnZpcnR1YWxSb3dDYWxsYmFja3Nbcm93SW5kZXhdKSB7XHJcbiAgICAgICAgdGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XS5mb3JFYWNoKGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sucm93UmVtb3ZlZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sucm93UmVtb3ZlZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvLyByZW1vdmUgdGhlIGNhbGxiYWNrc1xyXG4gICAgZGVsZXRlIHRoaXMudmlydHVhbFJvd0NhbGxiYWNrc1tyb3dJbmRleF07XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5vbk5ld0NvbHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuc2V0dXBDb2x1bW5zKCk7XHJcbiAgICB0aGlzLnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9FVkVSWVRISU5HKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmZpbmRBbGxFbGVtZW50cyA9IGZ1bmN0aW9uKGVHcmlkRGl2KSB7XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgdGhpcy5lUm9vdCA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctcm9vdFwiKTtcclxuICAgICAgICB0aGlzLmVIZWFkZXJDb250YWluZXIgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLWhlYWRlci1jb250YWluZXJcIik7XHJcbiAgICAgICAgdGhpcy5lQm9keUNvbnRhaW5lciA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keS1jb250YWluZXJcIik7XHJcbiAgICAgICAgdGhpcy5lTG9hZGluZ1BhbmVsID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcignLmFnLWxvYWRpbmctcGFuZWwnKTtcclxuICAgICAgICAvLyBmb3Igbm8tc2Nyb2xscywgYWxsIHJvd3MgbGl2ZSBpbiB0aGUgYm9keSBjb250YWluZXJcclxuICAgICAgICB0aGlzLmVQYXJlbnRPZlJvd3MgPSB0aGlzLmVCb2R5Q29udGFpbmVyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVSb290ID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1yb290XCIpO1xyXG4gICAgICAgIHRoaXMuZUJvZHkgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLWJvZHlcIik7XHJcbiAgICAgICAgdGhpcy5lQm9keUNvbnRhaW5lciA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keS1jb250YWluZXJcIik7XHJcbiAgICAgICAgdGhpcy5lQm9keVZpZXdwb3J0ID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1ib2R5LXZpZXdwb3J0XCIpO1xyXG4gICAgICAgIHRoaXMuZUJvZHlWaWV3cG9ydFdyYXBwZXIgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLWJvZHktdmlld3BvcnQtd3JhcHBlclwiKTtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1waW5uZWQtY29scy1jb250YWluZXJcIik7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc1ZpZXdwb3J0ID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1waW5uZWQtY29scy12aWV3cG9ydFwiKTtcclxuICAgICAgICB0aGlzLmVQaW5uZWRIZWFkZXIgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLXBpbm5lZC1oZWFkZXJcIik7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1oZWFkZXJcIik7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyQ29udGFpbmVyID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1oZWFkZXItY29udGFpbmVyXCIpO1xyXG4gICAgICAgIHRoaXMuZUxvYWRpbmdQYW5lbCA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoJy5hZy1sb2FkaW5nLXBhbmVsJyk7XHJcbiAgICAgICAgLy8gZm9yIHNjcm9sbHMsIGFsbCByb3dzIGxpdmUgaW4gZUJvZHkgKGNvbnRhaW5pbmcgcGlubmVkIGFuZCBub3JtYWwgYm9keSlcclxuICAgICAgICB0aGlzLmVQYXJlbnRPZlJvd3MgPSB0aGlzLmVCb2R5O1xyXG4gICAgICAgIHRoaXMuZVBhZ2luZ1BhbmVsID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcignLmFnLXBhZ2luZy1wYW5lbCcpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2hvd1Bpbm5lZENvbENvbnRhaW5lcnNJZk5lZWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gbm8gbmVlZCB0byBkbyB0aGlzIGlmIG5vdCB1c2luZyBzY3JvbGxzXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzaG93aW5nUGlubmVkQ29scyA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFBpbm5lZENvbENvdW50KCkgPiAwO1xyXG5cclxuICAgIC8vc29tZSBicm93c2VycyBoYWQgbGF5b3V0IGlzc3VlcyB3aXRoIHRoZSBibGFuayBkaXZzLCBzbyBpZiBibGFuayxcclxuICAgIC8vd2UgZG9uJ3QgZGlzcGxheSB0aGVtXHJcbiAgICBpZiAoc2hvd2luZ1Bpbm5lZENvbHMpIHtcclxuICAgICAgICB0aGlzLmVQaW5uZWRIZWFkZXIuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZENvbHNWaWV3cG9ydC5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZEhlYWRlci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZENvbHNWaWV3cG9ydC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUudXBkYXRlQm9keUNvbnRhaW5lcldpZHRoQWZ0ZXJDb2xSZXNpemUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucm93UmVuZGVyZXIuc2V0TWFpblJvd1dpZHRocygpO1xyXG4gICAgdGhpcy5zZXRCb2R5Q29udGFpbmVyV2lkdGgoKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnVwZGF0ZVBpbm5lZENvbENvbnRhaW5lcldpZHRoQWZ0ZXJDb2xSZXNpemUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuc2V0UGlubmVkQ29sQ29udGFpbmVyV2lkdGgoKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNldFBpbm5lZENvbENvbnRhaW5lcldpZHRoID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcGlubmVkQ29sV2lkdGggPSB0aGlzLmNvbHVtbk1vZGVsLmdldFBpbm5lZENvbnRhaW5lcldpZHRoKCkgKyBcInB4XCI7XHJcbiAgICB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyLnN0eWxlLndpZHRoID0gcGlubmVkQ29sV2lkdGg7XHJcbiAgICB0aGlzLmVCb2R5Vmlld3BvcnRXcmFwcGVyLnN0eWxlLm1hcmdpbkxlZnQgPSBwaW5uZWRDb2xXaWR0aDtcclxufTtcclxuXHJcbi8vIHNlZSBpZiBhIGdyZXkgYm94IGlzIG5lZWRlZCBhdCB0aGUgYm90dG9tIG9mIHRoZSBwaW5uZWQgY29sXHJcbkdyaWQucHJvdG90eXBlLnNldFBpbm5lZENvbEhlaWdodCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gdmFyIGJvZHlIZWlnaHQgPSB1dGlscy5waXhlbFN0cmluZ1RvTnVtYmVyKHRoaXMuZUJvZHkuc3R5bGUuaGVpZ2h0KTtcclxuICAgIHZhciBzY3JvbGxTaG93aW5nID0gdGhpcy5lQm9keVZpZXdwb3J0LmNsaWVudFdpZHRoIDwgdGhpcy5lQm9keVZpZXdwb3J0LnNjcm9sbFdpZHRoO1xyXG4gICAgdmFyIGJvZHlIZWlnaHQgPSB0aGlzLmVCb2R5Vmlld3BvcnQub2Zmc2V0SGVpZ2h0O1xyXG4gICAgaWYgKHNjcm9sbFNob3dpbmcpIHtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzVmlld3BvcnQuc3R5bGUuaGVpZ2h0ID0gKGJvZHlIZWlnaHQgLSB0aGlzLnNjcm9sbFdpZHRoKSArIFwicHhcIjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc1ZpZXdwb3J0LnN0eWxlLmhlaWdodCA9IGJvZHlIZWlnaHQgKyBcInB4XCI7XHJcbiAgICB9XHJcbiAgICAvLyBhbHNvIHRoZSBsb2FkaW5nIG92ZXJsYXksIG5lZWRzIHRvIGhhdmUgaXQncyBoZWlnaHQgYWRqdXN0ZWRcclxuICAgIHRoaXMuZUxvYWRpbmdQYW5lbC5zdHlsZS5oZWlnaHQgPSBib2R5SGVpZ2h0ICsgJ3B4JztcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNldEJvZHlTaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIHZhciBib2R5SGVpZ2h0ID0gdGhpcy5lQm9keVZpZXdwb3J0Lm9mZnNldEhlaWdodDtcclxuICAgIHZhciBwYWdpbmdWaXNpYmxlID0gdGhpcy5pc1Nob3dQYWdpbmdQYW5lbCgpO1xyXG5cclxuICAgIGlmICh0aGlzLmJvZHlIZWlnaHRMYXN0VGltZSAhPSBib2R5SGVpZ2h0IHx8IHRoaXMuc2hvd1BhZ2luZ1BhbmVsVmlzaWJsZUxhc3RUaW1lICE9IHBhZ2luZ1Zpc2libGUpIHtcclxuICAgICAgICB0aGlzLmJvZHlIZWlnaHRMYXN0VGltZSA9IGJvZHlIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5zaG93UGFnaW5nUGFuZWxWaXNpYmxlTGFzdFRpbWUgPSBwYWdpbmdWaXNpYmxlO1xyXG5cclxuICAgICAgICB0aGlzLnNldFBpbm5lZENvbEhlaWdodCgpO1xyXG5cclxuICAgICAgICAvL29ubHkgZHJhdyB2aXJ0dWFsIHJvd3MgaWYgZG9uZSBzb3J0ICYgZmlsdGVyIC0gdGhpc1xyXG4gICAgICAgIC8vbWVhbnMgd2UgZG9uJ3QgZHJhdyByb3dzIGlmIHRhYmxlIGlzIG5vdCB5ZXQgaW5pdGlhbGlzZWRcclxuICAgICAgICBpZiAodGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93Q291bnQoKSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5yb3dSZW5kZXJlci5kcmF3VmlydHVhbFJvd3MoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHNob3cgYW5kIHBvc2l0aW9uIHBhZ2luZyBwYW5lbFxyXG4gICAgICAgIHRoaXMuc2hvd0FuZFBvc2l0aW9uUGFnaW5nUGFuZWwoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuZmluaXNoZWQpIHtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBfdGhpcy5zZXRCb2R5U2l6ZSgpO1xyXG4gICAgICAgIH0sIDIwMCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5hZGRTY3JvbGxMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIHZhciBsYXN0TGVmdFBvc2l0aW9uID0gLTE7XHJcbiAgICB2YXIgbGFzdFRvcFBvc2l0aW9uID0gLTE7XHJcblxyXG4gICAgdGhpcy5lQm9keVZpZXdwb3J0LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG5ld0xlZnRQb3NpdGlvbiA9IHRoYXQuZUJvZHlWaWV3cG9ydC5zY3JvbGxMZWZ0O1xyXG4gICAgICAgIHZhciBuZXdUb3BQb3NpdGlvbiA9IHRoYXQuZUJvZHlWaWV3cG9ydC5zY3JvbGxUb3A7XHJcblxyXG4gICAgICAgIGlmIChuZXdMZWZ0UG9zaXRpb24gIT09IGxhc3RMZWZ0UG9zaXRpb24pIHtcclxuICAgICAgICAgICAgbGFzdExlZnRQb3NpdGlvbiA9IG5ld0xlZnRQb3NpdGlvbjtcclxuICAgICAgICAgICAgdGhhdC5zY3JvbGxIZWFkZXIobmV3TGVmdFBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChuZXdUb3BQb3NpdGlvbiAhPT0gbGFzdFRvcFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGxhc3RUb3BQb3NpdGlvbiA9IG5ld1RvcFBvc2l0aW9uO1xyXG4gICAgICAgICAgICB0aGF0LnNjcm9sbFBpbm5lZChuZXdUb3BQb3NpdGlvbik7XHJcbiAgICAgICAgICAgIHRoYXQucm93UmVuZGVyZXIuZHJhd1ZpcnR1YWxSb3dzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zY3JvbGxIZWFkZXIgPSBmdW5jdGlvbihib2R5TGVmdFBvc2l0aW9uKSB7XHJcbiAgICAvLyB0aGlzLmVIZWFkZXJDb250YWluZXIuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZTNkKCcgKyAtYm9keUxlZnRQb3NpdGlvbiArIFwicHgsMCwwKVwiO1xyXG4gICAgdGhpcy5lSGVhZGVyQ29udGFpbmVyLnN0eWxlLmxlZnQgPSAtYm9keUxlZnRQb3NpdGlvbiArIFwicHhcIjtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNjcm9sbFBpbm5lZCA9IGZ1bmN0aW9uKGJvZHlUb3BQb3NpdGlvbikge1xyXG4gICAgLy8gdGhpcy5lUGlubmVkQ29sc0NvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoMCwnICsgLWJvZHlUb3BQb3NpdGlvbiArIFwicHgsMClcIjtcclxuICAgIHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIuc3R5bGUudG9wID0gLWJvZHlUb3BQb3NpdGlvbiArIFwicHhcIjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR3JpZDtcclxuIiwidmFyIERFRkFVTFRfUk9XX0hFSUdIVCA9IDMwO1xyXG5cclxuZnVuY3Rpb24gR3JpZE9wdGlvbnNXcmFwcGVyKGdyaWRPcHRpb25zKSB7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zID0gZ3JpZE9wdGlvbnM7XHJcbiAgICB0aGlzLnNldHVwRGVmYXVsdHMoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNUcnVlKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gdmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09ICd0cnVlJztcclxufVxyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc1Jvd1NlbGVjdGlvbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5yb3dTZWxlY3Rpb24gPT09IFwic2luZ2xlXCIgfHwgdGhpcy5ncmlkT3B0aW9ucy5yb3dTZWxlY3Rpb24gPT09IFwibXVsdGlwbGVcIjsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc1Jvd1NlbGVjdGlvbk11bHRpID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd1NlbGVjdGlvbiA9PT0gJ211bHRpcGxlJzsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRDb250ZXh0ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmNvbnRleHQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNWaXJ0dWFsUGFnaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy52aXJ0dWFsUGFnaW5nKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc1Jvd3NBbHJlYWR5R3JvdXBlZCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMucm93c0FscmVhZHlHcm91cGVkKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0dyb3VwQ2hlY2tib3hTZWxlY3Rpb25Hcm91cCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5ncm91cENoZWNrYm94U2VsZWN0aW9uID09PSAnZ3JvdXAnOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzR3JvdXBDaGVja2JveFNlbGVjdGlvbkNoaWxkcmVuID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmdyb3VwQ2hlY2tib3hTZWxlY3Rpb24gPT09ICdjaGlsZHJlbic7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNHcm91cEluY2x1ZGVGb290ZXIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLmdyb3VwSW5jbHVkZUZvb3Rlcik7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNTdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5zdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0dyb3VwSGVhZGVycyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBIZWFkZXJzKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0RvbnRVc2VTY3JvbGxzID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5kb250VXNlU2Nyb2xscyk7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Um93U3R5bGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMucm93U3R5bGU7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Um93Q2xhc3MgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMucm93Q2xhc3M7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0R3JpZE9wdGlvbnMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnM7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0SGVhZGVyQ2VsbFJlbmRlcmVyID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmhlYWRlckNlbGxSZW5kZXJlcjsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRBcGkgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuYXBpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzRW5hYmxlU29ydGluZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5lbmFibGVTb3J0aW5nOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzRW5hYmxlQ29sUmVzaXplID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmVuYWJsZUNvbFJlc2l6ZTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0VuYWJsZUZpbHRlciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5lbmFibGVGaWx0ZXI7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Q29sV2lkdGggPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuY29sV2lkdGg7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0R3JvdXBEZWZhdWx0RXhwYW5kZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBEZWZhdWx0RXhwYW5kZWQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0R3JvdXBLZXlzID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmdyb3VwS2V5czsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRHcm91cEFnZ0Z1bmN0aW9uID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmdyb3VwQWdnRnVuY3Rpb247IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0QWxsUm93cyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5yb3dEYXRhOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzR3JvdXBVc2VFbnRpcmVSb3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLmdyb3VwVXNlRW50aXJlUm93KTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0FuZ3VsYXJDb21waWxlUm93cyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuYW5ndWxhckNvbXBpbGVSb3dzKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0FuZ3VsYXJDb21waWxlRmlsdGVycyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuYW5ndWxhckNvbXBpbGVGaWx0ZXJzKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0FuZ3VsYXJDb21waWxlSGVhZGVycyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuYW5ndWxhckNvbXBpbGVIZWFkZXJzKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRDb2x1bW5EZWZzID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkRlZnM7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Um93SGVpZ2h0ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd0hlaWdodDsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRNb2RlbFVwZGF0ZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMubW9kZWxVcGRhdGVkOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldENlbGxDbGlja2VkID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmNlbGxDbGlja2VkOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldENlbGxEb3VibGVDbGlja2VkID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmNlbGxEb3VibGVDbGlja2VkOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldENlbGxWYWx1ZUNoYW5nZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuY2VsbFZhbHVlQ2hhbmdlZDsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRSb3dTZWxlY3RlZCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5yb3dTZWxlY3RlZDsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRTZWxlY3Rpb25DaGFuZ2VkID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnNlbGVjdGlvbkNoYW5nZWQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0VmlydHVhbFJvd1JlbW92ZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMudmlydHVhbFJvd1JlbW92ZWQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0RGF0YXNvdXJjZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5kYXRhc291cmNlOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldFJlYWR5ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJlYWR5OyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldFJvd0J1ZmZlciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5yb3dCdWZmZXI7IH07XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLnNldFNlbGVjdGVkUm93cyA9IGZ1bmN0aW9uKG5ld1NlbGVjdGVkUm93cykge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuc2VsZWN0ZWRSb3dzID0gbmV3U2VsZWN0ZWRSb3dzO1xyXG59O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLnNldFNlbGVjdGVkTm9kZXNCeUlkID0gZnVuY3Rpb24obmV3U2VsZWN0ZWROb2Rlcykge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuc2VsZWN0ZWROb2Rlc0J5SWQgPSBuZXdTZWxlY3RlZE5vZGVzO1xyXG59O1xyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRJY29ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuaWNvbnM7XHJcbn07XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzRG9JbnRlcm5hbEdyb3VwaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gIXRoaXMuaXNSb3dzQWxyZWFkeUdyb3VwZWQoKSAmJiB0aGlzLmdyaWRPcHRpb25zLmdyb3VwS2V5cztcclxufTtcclxuXHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNHcm91cENoZWNrYm94U2VsZWN0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pc0dyb3VwQ2hlY2tib3hTZWxlY3Rpb25DaGlsZHJlbigpIHx8IHRoaXMuaXNHcm91cENoZWNrYm94U2VsZWN0aW9uR3JvdXAoKTtcclxufTtcclxuXHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0SGVhZGVySGVpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZ3JpZE9wdGlvbnMuaGVhZGVySGVpZ2h0ID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgIC8vIGlmIGhlYWRlciBoZWlnaHQgcHJvdmlkZWQsIHVzZWQgaXRcclxuICAgICAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5oZWFkZXJIZWlnaHQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIG90aGVyd2lzZSByZXR1cm4gMjUgaWYgbm8gZ3JvdXBpbmcsIDUwIGlmIGdyb3VwaW5nXHJcbiAgICAgICAgaWYgKHRoaXMuaXNHcm91cEhlYWRlcnMoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gNTA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIDI1O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuc2V0dXBEZWZhdWx0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCF0aGlzLmdyaWRPcHRpb25zLnJvd0hlaWdodCkge1xyXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMucm93SGVpZ2h0ID0gREVGQVVMVF9ST1dfSEVJR0hUO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRQaW5uZWRDb2xDb3VudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gaWYgbm90IHVzaW5nIHNjcm9sbHMsIHRoZW4gcGlubmVkIGNvbHVtbnMgZG9lc24ndCBtYWtlXHJcbiAgICAvLyBzZW5zZSwgc28gYWx3YXlzIHJldHVybiAwXHJcbiAgICBpZiAodGhpcy5pc0RvbnRVc2VTY3JvbGxzKCkpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLnBpbm5lZENvbHVtbkNvdW50KSB7XHJcbiAgICAgICAgLy9pbiBjYXNlIHVzZXIgcHV0cyBpbiBhIHN0cmluZywgY2FzdCB0byBudW1iZXJcclxuICAgICAgICByZXR1cm4gTnVtYmVyKHRoaXMuZ3JpZE9wdGlvbnMucGlubmVkQ29sdW1uQ291bnQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4iLCJmdW5jdGlvbiBHcm91cENyZWF0b3IoKSB7fVxyXG5cclxuR3JvdXBDcmVhdG9yLnByb3RvdHlwZS5ncm91cCA9IGZ1bmN0aW9uKHJvd05vZGVzLCBncm91cEJ5RmllbGRzLCBncm91cEFnZ0Z1bmN0aW9uLCBleHBhbmRCeURlZmF1bHQpIHtcclxuXHJcbiAgICB2YXIgdG9wTW9zdEdyb3VwID0ge1xyXG4gICAgICAgIGxldmVsOiAtMSxcclxuICAgICAgICBjaGlsZHJlbjogW10sXHJcbiAgICAgICAgY2hpbGRyZW5NYXA6IHt9XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBhbGxHcm91cHMgPSBbXTtcclxuICAgIGFsbEdyb3Vwcy5wdXNoKHRvcE1vc3RHcm91cCk7XHJcblxyXG4gICAgdmFyIGxldmVsVG9JbnNlcnRDaGlsZCA9IGdyb3VwQnlGaWVsZHMubGVuZ3RoIC0gMTtcclxuICAgIHZhciBpLCBjdXJyZW50TGV2ZWwsIG5vZGUsIGRhdGEsIGN1cnJlbnRHcm91cCwgZ3JvdXBCeUZpZWxkLCBncm91cEtleSwgbmV4dEdyb3VwO1xyXG5cclxuICAgIC8vIHN0YXJ0IGF0IC0xIGFuZCBnbyBiYWNrd2FyZHMsIGFzIGFsbCB0aGUgcG9zaXRpdmUgaW5kZXhlc1xyXG4gICAgLy8gYXJlIGFscmVhZHkgdXNlZCBieSB0aGUgbm9kZXMuXHJcbiAgICB2YXIgaW5kZXggPSAtMTtcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgcm93Tm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBub2RlID0gcm93Tm9kZXNbaV07XHJcbiAgICAgICAgZGF0YSA9IG5vZGUuZGF0YTtcclxuXHJcbiAgICAgICAgZm9yIChjdXJyZW50TGV2ZWwgPSAwOyBjdXJyZW50TGV2ZWwgPCBncm91cEJ5RmllbGRzLmxlbmd0aDsgY3VycmVudExldmVsKyspIHtcclxuICAgICAgICAgICAgZ3JvdXBCeUZpZWxkID0gZ3JvdXBCeUZpZWxkc1tjdXJyZW50TGV2ZWxdO1xyXG4gICAgICAgICAgICBncm91cEtleSA9IGRhdGFbZ3JvdXBCeUZpZWxkXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50TGV2ZWwgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEdyb3VwID0gdG9wTW9zdEdyb3VwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL2lmIGdyb3VwIGRvZXNuJ3QgZXhpc3QgeWV0LCBjcmVhdGUgaXRcclxuICAgICAgICAgICAgbmV4dEdyb3VwID0gY3VycmVudEdyb3VwLmNoaWxkcmVuTWFwW2dyb3VwS2V5XTtcclxuICAgICAgICAgICAgaWYgKCFuZXh0R3JvdXApIHtcclxuICAgICAgICAgICAgICAgIG5leHRHcm91cCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBncm91cDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBmaWVsZDogZ3JvdXBCeUZpZWxkLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBpbmRleC0tLFxyXG4gICAgICAgICAgICAgICAgICAgIGtleTogZ3JvdXBLZXksXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwYW5kZWQ6IHRoaXMuaXNFeHBhbmRlZChleHBhbmRCeURlZmF1bHQsIGN1cnJlbnRMZXZlbCksXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciB0b3AgbW9zdCBsZXZlbCwgcGFyZW50IGlzIG51bGxcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN1cnJlbnRHcm91cCA9PT0gdG9wTW9zdEdyb3VwID8gbnVsbCA6IGN1cnJlbnRHcm91cCxcclxuICAgICAgICAgICAgICAgICAgICBhbGxDaGlsZHJlbkNvdW50OiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGxldmVsOiBjdXJyZW50R3JvdXAubGV2ZWwgKyAxLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuTWFwOiB7fSAvL3RoaXMgaXMgYSB0ZW1wb3JhcnkgbWFwLCB3ZSByZW1vdmUgYXQgdGhlIGVuZCBvZiB0aGlzIG1ldGhvZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRHcm91cC5jaGlsZHJlbk1hcFtncm91cEtleV0gPSBuZXh0R3JvdXA7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50R3JvdXAuY2hpbGRyZW4ucHVzaChuZXh0R3JvdXApO1xyXG4gICAgICAgICAgICAgICAgYWxsR3JvdXBzLnB1c2gobmV4dEdyb3VwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbmV4dEdyb3VwLmFsbENoaWxkcmVuQ291bnQrKztcclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50TGV2ZWwgPT0gbGV2ZWxUb0luc2VydENoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLnBhcmVudCA9IG5leHRHcm91cCA9PT0gdG9wTW9zdEdyb3VwID8gbnVsbCA6IG5leHRHcm91cDtcclxuICAgICAgICAgICAgICAgIG5leHRHcm91cC5jaGlsZHJlbi5wdXNoKG5vZGUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEdyb3VwID0gbmV4dEdyb3VwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvL3JlbW92ZSB0aGUgdGVtcG9yYXJ5IG1hcFxyXG4gICAgZm9yIChpID0gMDsgaSA8IGFsbEdyb3Vwcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGRlbGV0ZSBhbGxHcm91cHNbaV0uY2hpbGRyZW5NYXA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRvcE1vc3RHcm91cC5jaGlsZHJlbjtcclxufTtcclxuXHJcbkdyb3VwQ3JlYXRvci5wcm90b3R5cGUuaXNFeHBhbmRlZCA9IGZ1bmN0aW9uKGV4cGFuZEJ5RGVmYXVsdCwgbGV2ZWwpIHtcclxuICAgIGlmICh0eXBlb2YgZXhwYW5kQnlEZWZhdWx0ID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgIHJldHVybiBsZXZlbCA8IGV4cGFuZEJ5RGVmYXVsdDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGV4cGFuZEJ5RGVmYXVsdCA9PT0gdHJ1ZSB8fCBleHBhbmRCeURlZmF1bHQgPT09ICd0cnVlJztcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IEdyb3VwQ3JlYXRvcigpO1xyXG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcbnZhciBTdmdGYWN0b3J5ID0gcmVxdWlyZSgnLi9zdmdGYWN0b3J5Jyk7XHJcbnZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xyXG5cclxudmFyIHN2Z0ZhY3RvcnkgPSBuZXcgU3ZnRmFjdG9yeSgpO1xyXG5cclxuZnVuY3Rpb24gSGVhZGVyUmVuZGVyZXIoKSB7fVxyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbkNvbnRyb2xsZXIsIGNvbHVtbk1vZGVsLCBlR3JpZCwgYW5ndWxhckdyaWQsIGZpbHRlck1hbmFnZXIsICRzY29wZSwgJGNvbXBpbGUpIHtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyID0gZ3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4gICAgdGhpcy5jb2x1bW5Nb2RlbCA9IGNvbHVtbk1vZGVsO1xyXG4gICAgdGhpcy5jb2x1bW5Db250cm9sbGVyID0gY29sdW1uQ29udHJvbGxlcjtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZDtcclxuICAgIHRoaXMuZmlsdGVyTWFuYWdlciA9IGZpbHRlck1hbmFnZXI7XHJcbiAgICB0aGlzLiRzY29wZSA9ICRzY29wZTtcclxuICAgIHRoaXMuJGNvbXBpbGUgPSAkY29tcGlsZTtcclxuICAgIHRoaXMuZmluZEFsbEVsZW1lbnRzKGVHcmlkKTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5maW5kQWxsRWxlbWVudHMgPSBmdW5jdGlvbihlR3JpZCkge1xyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0RvbnRVc2VTY3JvbGxzKCkpIHtcclxuICAgICAgICB0aGlzLmVIZWFkZXJDb250YWluZXIgPSBlR3JpZC5xdWVyeVNlbGVjdG9yKFwiLmFnLWhlYWRlci1jb250YWluZXJcIik7XHJcbiAgICAgICAgdGhpcy5lUm9vdCA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctcm9vdFwiKTtcclxuICAgICAgICAvLyBmb3Igbm8tc2Nyb2xsLCBhbGwgaGVhZGVyIGNlbGxzIGxpdmUgaW4gdGhlIGhlYWRlciBjb250YWluZXIgKHRoZSBhZy1oZWFkZXIgZG9lc24ndCBleGlzdClcclxuICAgICAgICB0aGlzLmVIZWFkZXJQYXJlbnQgPSB0aGlzLmVIZWFkZXJDb250YWluZXI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZEhlYWRlciA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctcGlubmVkLWhlYWRlclwiKTtcclxuICAgICAgICB0aGlzLmVIZWFkZXJDb250YWluZXIgPSBlR3JpZC5xdWVyeVNlbGVjdG9yKFwiLmFnLWhlYWRlci1jb250YWluZXJcIik7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyID0gZUdyaWQucXVlcnlTZWxlY3RvcihcIi5hZy1oZWFkZXJcIik7XHJcbiAgICAgICAgdGhpcy5lUm9vdCA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctcm9vdFwiKTtcclxuICAgICAgICAvLyBmb3Igc2Nyb2xsLCBhbGwgaGVhZGVyIGNlbGxzIGxpdmUgaW4gdGhlIGhlYWRlciAoY29udGFpbnMgYm90aCBub3JtYWwgYW5kIHBpbm5lZCBoZWFkZXJzKVxyXG4gICAgICAgIHRoaXMuZUhlYWRlclBhcmVudCA9IHRoaXMuZUhlYWRlcjtcclxuICAgIH1cclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5yZWZyZXNoSGVhZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB1dGlscy5yZW1vdmVBbGxDaGlsZHJlbih0aGlzLmVQaW5uZWRIZWFkZXIpO1xyXG4gICAgdXRpbHMucmVtb3ZlQWxsQ2hpbGRyZW4odGhpcy5lSGVhZGVyQ29udGFpbmVyKTtcclxuXHJcbiAgICBpZiAodGhpcy5jaGlsZFNjb3Blcykge1xyXG4gICAgICAgIHRoaXMuY2hpbGRTY29wZXMuZm9yRWFjaChmdW5jdGlvbihjaGlsZFNjb3BlKSB7XHJcbiAgICAgICAgICAgIGNoaWxkU2NvcGUuJGRlc3Ryb3koKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHRoaXMuY2hpbGRTY29wZXMgPSBbXTtcclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEhlYWRlcnMoKSkge1xyXG4gICAgICAgIHRoaXMuaW5zZXJ0SGVhZGVyc1dpdGhHcm91cGluZygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmluc2VydEhlYWRlcnNXaXRob3V0R3JvdXBpbmcoKTtcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuaW5zZXJ0SGVhZGVyc1dpdGhHcm91cGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdyb3VwcyA9IHRoaXMuY29sdW1uTW9kZWwuZ2V0Q29sdW1uR3JvdXBzKCk7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBncm91cHMuZm9yRWFjaChmdW5jdGlvbihncm91cCkge1xyXG4gICAgICAgIHZhciBlSGVhZGVyQ2VsbCA9IHRoYXQuY3JlYXRlR3JvdXBlZEhlYWRlckNlbGwoZ3JvdXApO1xyXG4gICAgICAgIHZhciBlQ29udGFpbmVyVG9BZGRUbyA9IGdyb3VwLnBpbm5lZCA/IHRoYXQuZVBpbm5lZEhlYWRlciA6IHRoYXQuZUhlYWRlckNvbnRhaW5lcjtcclxuICAgICAgICBlQ29udGFpbmVyVG9BZGRUby5hcHBlbmRDaGlsZChlSGVhZGVyQ2VsbCk7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVHcm91cGVkSGVhZGVyQ2VsbCA9IGZ1bmN0aW9uKGdyb3VwKSB7XHJcblxyXG4gICAgdmFyIGVIZWFkZXJHcm91cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZUhlYWRlckdyb3VwLmNsYXNzTmFtZSA9ICdhZy1oZWFkZXItZ3JvdXAnO1xyXG5cclxuICAgIHZhciBlSGVhZGVyR3JvdXBDZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBncm91cC5lSGVhZGVyR3JvdXBDZWxsID0gZUhlYWRlckdyb3VwQ2VsbDtcclxuICAgIHZhciBjbGFzc05hbWVzID0gWydhZy1oZWFkZXItZ3JvdXAtY2VsbCddO1xyXG4gICAgLy8gaGF2aW5nIGRpZmZlcmVudCBjbGFzc2VzIGJlbG93IGFsbG93cyB0aGUgc3R5bGUgdG8gbm90IGhhdmUgYSBib3R0b20gYm9yZGVyXHJcbiAgICAvLyBvbiB0aGUgZ3JvdXAgaGVhZGVyLCBpZiBubyBncm91cCBpcyBzcGVjaWZpZWRcclxuICAgIGlmIChncm91cC5uYW1lKSB7XHJcbiAgICAgICAgY2xhc3NOYW1lcy5wdXNoKCdhZy1oZWFkZXItZ3JvdXAtY2VsbC13aXRoLWdyb3VwJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNsYXNzTmFtZXMucHVzaCgnYWctaGVhZGVyLWdyb3VwLWNlbGwtbm8tZ3JvdXAnKTtcclxuICAgIH1cclxuICAgIGVIZWFkZXJHcm91cENlbGwuY2xhc3NOYW1lID0gY2xhc3NOYW1lcy5qb2luKCcgJyk7XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRW5hYmxlQ29sUmVzaXplKCkpIHtcclxuICAgICAgICB2YXIgZUhlYWRlckNlbGxSZXNpemUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGVIZWFkZXJDZWxsUmVzaXplLmNsYXNzTmFtZSA9IFwiYWctaGVhZGVyLWNlbGwtcmVzaXplXCI7XHJcbiAgICAgICAgZUhlYWRlckdyb3VwQ2VsbC5hcHBlbmRDaGlsZChlSGVhZGVyQ2VsbFJlc2l6ZSk7XHJcbiAgICAgICAgZ3JvdXAuZUhlYWRlckNlbGxSZXNpemUgPSBlSGVhZGVyQ2VsbFJlc2l6ZTtcclxuICAgICAgICB2YXIgZHJhZ0NhbGxiYWNrID0gdGhpcy5ncm91cERyYWdDYWxsYmFja0ZhY3RvcnkoZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuYWRkRHJhZ0hhbmRsZXIoZUhlYWRlckNlbGxSZXNpemUsIGRyYWdDYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbm8gcmVuZGVyZXIsIGRlZmF1bHQgdGV4dCByZW5kZXJcclxuICAgIHZhciBncm91cE5hbWUgPSBncm91cC5uYW1lO1xyXG4gICAgaWYgKGdyb3VwTmFtZSAmJiBncm91cE5hbWUgIT09ICcnKSB7XHJcbiAgICAgICAgdmFyIGVHcm91cENlbGxMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgZUdyb3VwQ2VsbExhYmVsLmNsYXNzTmFtZSA9ICdhZy1oZWFkZXItZ3JvdXAtY2VsbC1sYWJlbCc7XHJcbiAgICAgICAgZUhlYWRlckdyb3VwQ2VsbC5hcHBlbmRDaGlsZChlR3JvdXBDZWxsTGFiZWwpO1xyXG5cclxuICAgICAgICB2YXIgZUlubmVyVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgICAgIGVJbm5lclRleHQuY2xhc3NOYW1lID0gJ2FnLWhlYWRlci1ncm91cC10ZXh0JztcclxuICAgICAgICBlSW5uZXJUZXh0LmlubmVySFRNTCA9IGdyb3VwTmFtZTtcclxuICAgICAgICBlR3JvdXBDZWxsTGFiZWwuYXBwZW5kQ2hpbGQoZUlubmVyVGV4dCk7XHJcblxyXG4gICAgICAgIGlmIChncm91cC5leHBhbmRhYmxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkR3JvdXBFeHBhbmRJY29uKGdyb3VwLCBlR3JvdXBDZWxsTGFiZWwsIGdyb3VwLmV4cGFuZGVkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlSGVhZGVyR3JvdXAuYXBwZW5kQ2hpbGQoZUhlYWRlckdyb3VwQ2VsbCk7XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgZ3JvdXAudmlzaWJsZUNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgICAgICB2YXIgZUhlYWRlckNlbGwgPSB0aGF0LmNyZWF0ZUhlYWRlckNlbGwoY29sdW1uLCB0cnVlLCBncm91cCk7XHJcbiAgICAgICAgZUhlYWRlckdyb3VwLmFwcGVuZENoaWxkKGVIZWFkZXJDZWxsKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoYXQuc2V0V2lkdGhPZkdyb3VwSGVhZGVyQ2VsbChncm91cCk7XHJcblxyXG4gICAgcmV0dXJuIGVIZWFkZXJHcm91cDtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5hZGRHcm91cEV4cGFuZEljb24gPSBmdW5jdGlvbihncm91cCwgZUhlYWRlckdyb3VwLCBleHBhbmRlZCkge1xyXG4gICAgdmFyIGVHcm91cEljb247XHJcbiAgICBpZiAoZXhwYW5kZWQpIHtcclxuICAgICAgICBlR3JvdXBJY29uID0gdXRpbHMuY3JlYXRlSWNvbignY29sdW1uR3JvdXBPcGVuZWQnLCB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciwgbnVsbCwgc3ZnRmFjdG9yeS5jcmVhdGVBcnJvd0xlZnRTdmcpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBlR3JvdXBJY29uID0gdXRpbHMuY3JlYXRlSWNvbignY29sdW1uR3JvdXBDbG9zZWQnLCB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciwgbnVsbCwgc3ZnRmFjdG9yeS5jcmVhdGVBcnJvd1JpZ2h0U3ZnKTtcclxuICAgIH1cclxuICAgIGVHcm91cEljb24uY2xhc3NOYW1lID0gJ2FnLWhlYWRlci1leHBhbmQtaWNvbic7XHJcbiAgICBlSGVhZGVyR3JvdXAuYXBwZW5kQ2hpbGQoZUdyb3VwSWNvbik7XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgZUdyb3VwSWNvbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhhdC5jb2x1bW5Db250cm9sbGVyLmNvbHVtbkdyb3VwT3BlbmVkKGdyb3VwKTtcclxuICAgIH07XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuYWRkRHJhZ0hhbmRsZXIgPSBmdW5jdGlvbihlRHJhZ2dhYmxlRWxlbWVudCwgZHJhZ0NhbGxiYWNrKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBlRHJhZ2dhYmxlRWxlbWVudC5vbm1vdXNlZG93biA9IGZ1bmN0aW9uKGRvd25FdmVudCkge1xyXG4gICAgICAgIGRyYWdDYWxsYmFjay5vbkRyYWdTdGFydCgpO1xyXG4gICAgICAgIHRoYXQuZVJvb3Quc3R5bGUuY3Vyc29yID0gXCJjb2wtcmVzaXplXCI7XHJcbiAgICAgICAgdGhhdC5kcmFnU3RhcnRYID0gZG93bkV2ZW50LmNsaWVudFg7XHJcblxyXG4gICAgICAgIHRoYXQuZVJvb3Qub25tb3VzZW1vdmUgPSBmdW5jdGlvbihtb3ZlRXZlbnQpIHtcclxuICAgICAgICAgICAgdmFyIG5ld1ggPSBtb3ZlRXZlbnQuY2xpZW50WDtcclxuICAgICAgICAgICAgdmFyIGNoYW5nZSA9IG5ld1ggLSB0aGF0LmRyYWdTdGFydFg7XHJcbiAgICAgICAgICAgIGRyYWdDYWxsYmFjay5vbkRyYWdnaW5nKGNoYW5nZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGF0LmVSb290Lm9ubW91c2V1cCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LnN0b3BEcmFnZ2luZygpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhhdC5lUm9vdC5vbm1vdXNlbGVhdmUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5zdG9wRHJhZ2dpbmcoKTtcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5zZXRXaWR0aE9mR3JvdXBIZWFkZXJDZWxsID0gZnVuY3Rpb24oaGVhZGVyR3JvdXApIHtcclxuICAgIHZhciB0b3RhbFdpZHRoID0gMDtcclxuICAgIGhlYWRlckdyb3VwLnZpc2libGVDb2x1bW5zLmZvckVhY2goZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICAgICAgdG90YWxXaWR0aCArPSBjb2x1bW4uYWN0dWFsV2lkdGg7XHJcbiAgICB9KTtcclxuICAgIGhlYWRlckdyb3VwLmVIZWFkZXJHcm91cENlbGwuc3R5bGUud2lkdGggPSB1dGlscy5mb3JtYXRXaWR0aCh0b3RhbFdpZHRoKTtcclxuICAgIGhlYWRlckdyb3VwLmFjdHVhbFdpZHRoID0gdG90YWxXaWR0aDtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5pbnNlcnRIZWFkZXJzV2l0aG91dEdyb3VwaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZVBpbm5lZEhlYWRlciA9IHRoaXMuZVBpbm5lZEhlYWRlcjtcclxuICAgIHZhciBlSGVhZGVyQ29udGFpbmVyID0gdGhpcy5lSGVhZGVyQ29udGFpbmVyO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIHRoaXMuY29sdW1uTW9kZWwuZ2V0VmlzaWJsZUNvbHVtbnMoKS5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgICAgIC8vIG9ubHkgaW5jbHVkZSB0aGUgZmlyc3QgeCBjb2xzXHJcbiAgICAgICAgdmFyIGhlYWRlckNlbGwgPSB0aGF0LmNyZWF0ZUhlYWRlckNlbGwoY29sdW1uLCBmYWxzZSk7XHJcbiAgICAgICAgaWYgKGNvbHVtbi5waW5uZWQpIHtcclxuICAgICAgICAgICAgZVBpbm5lZEhlYWRlci5hcHBlbmRDaGlsZChoZWFkZXJDZWxsKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlSGVhZGVyQ29udGFpbmVyLmFwcGVuZENoaWxkKGhlYWRlckNlbGwpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmNyZWF0ZUhlYWRlckNlbGwgPSBmdW5jdGlvbihjb2x1bW4sIGdyb3VwZWQsIGhlYWRlckdyb3VwKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB2YXIgY29sRGVmID0gY29sdW1uLmNvbERlZjtcclxuICAgIHZhciBlSGVhZGVyQ2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAvLyBzdGljayB0aGUgaGVhZGVyIGNlbGwgaW4gY29sdW1uLCBhcyB3ZSBhY2Nlc3MgaXQgd2hlbiBncm91cCBpcyByZS1zaXplZFxyXG4gICAgY29sdW1uLmVIZWFkZXJDZWxsID0gZUhlYWRlckNlbGw7XHJcblxyXG4gICAgdmFyIGhlYWRlckNlbGxDbGFzc2VzID0gWydhZy1oZWFkZXItY2VsbCddO1xyXG4gICAgaWYgKGdyb3VwZWQpIHtcclxuICAgICAgICBoZWFkZXJDZWxsQ2xhc3Nlcy5wdXNoKCdhZy1oZWFkZXItY2VsbC1ncm91cGVkJyk7IC8vIHRoaXMgdGFrZXMgNTAlIGhlaWdodFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBoZWFkZXJDZWxsQ2xhc3Nlcy5wdXNoKCdhZy1oZWFkZXItY2VsbC1ub3QtZ3JvdXBlZCcpOyAvLyB0aGlzIHRha2VzIDEwMCUgaGVpZ2h0XHJcbiAgICB9XHJcbiAgICBlSGVhZGVyQ2VsbC5jbGFzc05hbWUgPSBoZWFkZXJDZWxsQ2xhc3Nlcy5qb2luKCcgJyk7XHJcblxyXG4gICAgLy8gYWRkIHRvb2x0aXAgaWYgZXhpc3RzXHJcbiAgICBpZiAoY29sRGVmLmhlYWRlclRvb2x0aXApIHtcclxuICAgICAgICBlSGVhZGVyQ2VsbC50aXRsZSA9IGNvbERlZi5oZWFkZXJUb29sdGlwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0VuYWJsZUNvbFJlc2l6ZSgpKSB7XHJcbiAgICAgICAgdmFyIGhlYWRlckNlbGxSZXNpemUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGhlYWRlckNlbGxSZXNpemUuY2xhc3NOYW1lID0gXCJhZy1oZWFkZXItY2VsbC1yZXNpemVcIjtcclxuICAgICAgICBlSGVhZGVyQ2VsbC5hcHBlbmRDaGlsZChoZWFkZXJDZWxsUmVzaXplKTtcclxuICAgICAgICB2YXIgZHJhZ0NhbGxiYWNrID0gdGhpcy5oZWFkZXJEcmFnQ2FsbGJhY2tGYWN0b3J5KGVIZWFkZXJDZWxsLCBjb2x1bW4sIGhlYWRlckdyb3VwKTtcclxuICAgICAgICB0aGlzLmFkZERyYWdIYW5kbGVyKGhlYWRlckNlbGxSZXNpemUsIGRyYWdDYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmlsdGVyIGJ1dHRvblxyXG4gICAgdmFyIHNob3dNZW51ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNFbmFibGVGaWx0ZXIoKSAmJiAhY29sRGVmLnN1cHByZXNzTWVudTtcclxuICAgIGlmIChzaG93TWVudSkge1xyXG4gICAgICAgIHZhciBlTWVudUJ1dHRvbiA9IHV0aWxzLmNyZWF0ZUljb24oJ21lbnUnLCB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciwgY29sdW1uLCBzdmdGYWN0b3J5LmNyZWF0ZU1lbnVTdmcpO1xyXG4gICAgICAgIHV0aWxzLmFkZENzc0NsYXNzKGVNZW51QnV0dG9uLCAnYWctaGVhZGVyLWljb24nKTtcclxuXHJcbiAgICAgICAgZU1lbnVCdXR0b24uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJhZy1oZWFkZXItY2VsbC1tZW51LWJ1dHRvblwiKTtcclxuICAgICAgICBlTWVudUJ1dHRvbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuZmlsdGVyTWFuYWdlci5zaG93RmlsdGVyKGNvbHVtbiwgdGhpcyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBlSGVhZGVyQ2VsbC5hcHBlbmRDaGlsZChlTWVudUJ1dHRvbik7XHJcbiAgICAgICAgZUhlYWRlckNlbGwub25tb3VzZWVudGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGVNZW51QnV0dG9uLnN0eWxlLm9wYWNpdHkgPSAxO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgZUhlYWRlckNlbGwub25tb3VzZWxlYXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGVNZW51QnV0dG9uLnN0eWxlLm9wYWNpdHkgPSAwO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgZU1lbnVCdXR0b24uc3R5bGUub3BhY2l0eSA9IDA7XHJcbiAgICAgICAgZU1lbnVCdXR0b24uc3R5bGVbXCItd2Via2l0LXRyYW5zaXRpb25cIl0gPSBcIm9wYWNpdHkgMC41cywgYm9yZGVyIDAuMnNcIjtcclxuICAgICAgICBlTWVudUJ1dHRvbi5zdHlsZVtcInRyYW5zaXRpb25cIl0gPSBcIm9wYWNpdHkgMC41cywgYm9yZGVyIDAuMnNcIjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBsYWJlbCBkaXZcclxuICAgIHZhciBoZWFkZXJDZWxsTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgaGVhZGVyQ2VsbExhYmVsLmNsYXNzTmFtZSA9IFwiYWctaGVhZGVyLWNlbGwtbGFiZWxcIjtcclxuXHJcbiAgICAvLyBhZGQgaW4gc29ydCBpY29uc1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRW5hYmxlU29ydGluZygpICYmICFjb2xEZWYuc3VwcHJlc3NTb3J0aW5nKSB7XHJcbiAgICAgICAgY29sdW1uLmVTb3J0QXNjID0gdXRpbHMuY3JlYXRlSWNvbignc29ydEFzY2VuZGluZycsIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLCBjb2x1bW4sIHN2Z0ZhY3RvcnkuY3JlYXRlQXJyb3dVcFN2Zyk7XHJcbiAgICAgICAgY29sdW1uLmVTb3J0RGVzYyA9IHV0aWxzLmNyZWF0ZUljb24oJ3NvcnREZXNjZW5kaW5nJywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbiwgc3ZnRmFjdG9yeS5jcmVhdGVBcnJvd0Rvd25TdmcpO1xyXG4gICAgICAgIHV0aWxzLmFkZENzc0NsYXNzKGNvbHVtbi5lU29ydEFzYywgJ2FnLWhlYWRlci1pY29uJyk7XHJcbiAgICAgICAgdXRpbHMuYWRkQ3NzQ2xhc3MoY29sdW1uLmVTb3J0RGVzYywgJ2FnLWhlYWRlci1pY29uJyk7XHJcbiAgICAgICAgaGVhZGVyQ2VsbExhYmVsLmFwcGVuZENoaWxkKGNvbHVtbi5lU29ydEFzYyk7XHJcbiAgICAgICAgaGVhZGVyQ2VsbExhYmVsLmFwcGVuZENoaWxkKGNvbHVtbi5lU29ydERlc2MpO1xyXG4gICAgICAgIGNvbHVtbi5lU29ydEFzYy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIGNvbHVtbi5lU29ydERlc2Muc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB0aGlzLmFkZFNvcnRIYW5kbGluZyhoZWFkZXJDZWxsTGFiZWwsIGNvbHVtbik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWRkIGluIGZpbHRlciBpY29uXHJcbiAgICBjb2x1bW4uZUZpbHRlckljb24gPSB1dGlscy5jcmVhdGVJY29uKCdmaWx0ZXInLCB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciwgY29sdW1uLCBzdmdGYWN0b3J5LmNyZWF0ZUZpbHRlclN2Zyk7XHJcbiAgICB1dGlscy5hZGRDc3NDbGFzcyhjb2x1bW4uZUZpbHRlckljb24sICdhZy1oZWFkZXItaWNvbicpO1xyXG4gICAgaGVhZGVyQ2VsbExhYmVsLmFwcGVuZENoaWxkKGNvbHVtbi5lRmlsdGVySWNvbik7XHJcblxyXG4gICAgLy8gcmVuZGVyIHRoZSBjZWxsLCB1c2UgYSByZW5kZXJlciBpZiBvbmUgaXMgcHJvdmlkZWRcclxuICAgIHZhciBoZWFkZXJDZWxsUmVuZGVyZXI7XHJcbiAgICBpZiAoY29sRGVmLmhlYWRlckNlbGxSZW5kZXJlcikgeyAvLyBmaXJzdCBsb29rIGZvciBhIHJlbmRlcmVyIGluIGNvbCBkZWZcclxuICAgICAgICBoZWFkZXJDZWxsUmVuZGVyZXIgPSBjb2xEZWYuaGVhZGVyQ2VsbFJlbmRlcmVyO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRIZWFkZXJDZWxsUmVuZGVyZXIoKSkgeyAvLyBzZWNvbmQgbG9vayBmb3Igb25lIGluIGdyaWQgb3B0aW9uc1xyXG4gICAgICAgIGhlYWRlckNlbGxSZW5kZXJlciA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEhlYWRlckNlbGxSZW5kZXJlcigpO1xyXG4gICAgfVxyXG4gICAgaWYgKGhlYWRlckNlbGxSZW5kZXJlcikge1xyXG4gICAgICAgIC8vIHJlbmRlcmVyIHByb3ZpZGVkLCB1c2UgaXRcclxuICAgICAgICB2YXIgbmV3Q2hpbGRTY29wZTtcclxuICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNBbmd1bGFyQ29tcGlsZUhlYWRlcnMoKSkge1xyXG4gICAgICAgICAgICBuZXdDaGlsZFNjb3BlID0gdGhpcy4kc2NvcGUuJG5ldygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgY2VsbFJlbmRlcmVyUGFyYW1zID0ge1xyXG4gICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgJHNjb3BlOiBuZXdDaGlsZFNjb3BlLFxyXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCksXHJcbiAgICAgICAgICAgIGFwaTogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKClcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBjZWxsUmVuZGVyZXJSZXN1bHQgPSBoZWFkZXJDZWxsUmVuZGVyZXIoY2VsbFJlbmRlcmVyUGFyYW1zKTtcclxuICAgICAgICB2YXIgY2hpbGRUb0FwcGVuZDtcclxuICAgICAgICBpZiAodXRpbHMuaXNOb2RlT3JFbGVtZW50KGNlbGxSZW5kZXJlclJlc3VsdCkpIHtcclxuICAgICAgICAgICAgLy8gYSBkb20gbm9kZSBvciBlbGVtZW50IHdhcyByZXR1cm5lZCwgc28gYWRkIGNoaWxkXHJcbiAgICAgICAgICAgIGNoaWxkVG9BcHBlbmQgPSBjZWxsUmVuZGVyZXJSZXN1bHQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIGFzc3VtZSBpdCB3YXMgaHRtbCwgc28ganVzdCBpbnNlcnRcclxuICAgICAgICAgICAgdmFyIGVUZXh0U3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgICAgICAgICBlVGV4dFNwYW4uaW5uZXJIVE1MID0gY2VsbFJlbmRlcmVyUmVzdWx0O1xyXG4gICAgICAgICAgICBjaGlsZFRvQXBwZW5kID0gZVRleHRTcGFuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBhbmd1bGFyIGNvbXBpbGUgaGVhZGVyIGlmIG9wdGlvbiBpcyB0dXJuZWQgb25cclxuICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNBbmd1bGFyQ29tcGlsZUhlYWRlcnMoKSkge1xyXG4gICAgICAgICAgICBuZXdDaGlsZFNjb3BlLmNvbERlZiA9IGNvbERlZjtcclxuICAgICAgICAgICAgbmV3Q2hpbGRTY29wZS5jb2xJbmRleCA9IGNvbERlZi5pbmRleDtcclxuICAgICAgICAgICAgbmV3Q2hpbGRTY29wZS5jb2xEZWZXcmFwcGVyID0gY29sdW1uO1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkU2NvcGVzLnB1c2gobmV3Q2hpbGRTY29wZSk7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZFRvQXBwZW5kQ29tcGlsZWQgPSB0aGlzLiRjb21waWxlKGNoaWxkVG9BcHBlbmQpKG5ld0NoaWxkU2NvcGUpWzBdO1xyXG4gICAgICAgICAgICBoZWFkZXJDZWxsTGFiZWwuYXBwZW5kQ2hpbGQoY2hpbGRUb0FwcGVuZENvbXBpbGVkKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoZWFkZXJDZWxsTGFiZWwuYXBwZW5kQ2hpbGQoY2hpbGRUb0FwcGVuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBubyByZW5kZXJlciwgZGVmYXVsdCB0ZXh0IHJlbmRlclxyXG4gICAgICAgIHZhciBlSW5uZXJUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAgICAgZUlubmVyVGV4dC5jbGFzc05hbWUgPSAnYWctaGVhZGVyLWNlbGwtdGV4dCc7XHJcbiAgICAgICAgZUlubmVyVGV4dC5pbm5lckhUTUwgPSBjb2xEZWYuZGlzcGxheU5hbWU7XHJcbiAgICAgICAgaGVhZGVyQ2VsbExhYmVsLmFwcGVuZENoaWxkKGVJbm5lclRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGVIZWFkZXJDZWxsLmFwcGVuZENoaWxkKGhlYWRlckNlbGxMYWJlbCk7XHJcbiAgICBlSGVhZGVyQ2VsbC5zdHlsZS53aWR0aCA9IHV0aWxzLmZvcm1hdFdpZHRoKGNvbHVtbi5hY3R1YWxXaWR0aCk7XHJcblxyXG4gICAgcmV0dXJuIGVIZWFkZXJDZWxsO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmFkZFNvcnRIYW5kbGluZyA9IGZ1bmN0aW9uKGhlYWRlckNlbGxMYWJlbCwgY29sRGVmV3JhcHBlcikge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIGhlYWRlckNlbGxMYWJlbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBzb3J0IG9uIGN1cnJlbnQgY29sXHJcbiAgICAgICAgaWYgKGNvbERlZldyYXBwZXIuc29ydCA9PT0gY29uc3RhbnRzLkFTQykge1xyXG4gICAgICAgICAgICBjb2xEZWZXcmFwcGVyLnNvcnQgPSBjb25zdGFudHMuREVTQztcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbERlZldyYXBwZXIuc29ydCA9PT0gY29uc3RhbnRzLkRFU0MpIHtcclxuICAgICAgICAgICAgY29sRGVmV3JhcHBlci5zb3J0ID0gbnVsbFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbERlZldyYXBwZXIuc29ydCA9IGNvbnN0YW50cy5BU0M7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjbGVhciBzb3J0IG9uIGFsbCBjb2x1bW5zIGV4Y2VwdCB0aGlzIG9uZSwgYW5kIHVwZGF0ZSB0aGUgaWNvbnNcclxuICAgICAgICB0aGF0LmNvbHVtbk1vZGVsLmdldEFsbENvbHVtbnMoKS5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtblRvQ2xlYXIpIHtcclxuICAgICAgICAgICAgaWYgKGNvbHVtblRvQ2xlYXIgIT09IGNvbERlZldyYXBwZXIpIHtcclxuICAgICAgICAgICAgICAgIGNvbHVtblRvQ2xlYXIuc29ydCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGluIGNhc2Ugbm8gc29ydGluZyBvbiB0aGlzIHBhcnRpY3VsYXIgY29sLCBhcyBzb3J0aW5nIGlzIG9wdGlvbmFsIHBlciBjb2xcclxuICAgICAgICAgICAgaWYgKGNvbHVtblRvQ2xlYXIuY29sRGVmLnN1cHByZXNzU29ydGluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyB1cGRhdGUgdmlzaWJpbGl0eSBvZiBpY29uc1xyXG4gICAgICAgICAgICB2YXIgc29ydEFzY2VuZGluZyA9IGNvbHVtblRvQ2xlYXIuc29ydCA9PT0gY29uc3RhbnRzLkFTQztcclxuICAgICAgICAgICAgdmFyIHNvcnREZXNjZW5kaW5nID0gY29sdW1uVG9DbGVhci5zb3J0ID09PSBjb25zdGFudHMuREVTQztcclxuXHJcbiAgICAgICAgICAgIGlmIChjb2x1bW5Ub0NsZWFyLmVTb3J0QXNjKSB7XHJcbiAgICAgICAgICAgICAgICBjb2x1bW5Ub0NsZWFyLmVTb3J0QXNjLnN0eWxlLmRpc3BsYXkgPSBzb3J0QXNjZW5kaW5nID8gJ2lubGluZScgOiAnbm9uZSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNvbHVtblRvQ2xlYXIuZVNvcnREZXNjKSB7XHJcbiAgICAgICAgICAgICAgICBjb2x1bW5Ub0NsZWFyLmVTb3J0RGVzYy5zdHlsZS5kaXNwbGF5ID0gc29ydERlc2NlbmRpbmcgPyAnaW5saW5lJyA6ICdub25lJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGF0LmFuZ3VsYXJHcmlkLnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9TT1JUKTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmdyb3VwRHJhZ0NhbGxiYWNrRmFjdG9yeSA9IGZ1bmN0aW9uKGN1cnJlbnRHcm91cCkge1xyXG4gICAgdmFyIHBhcmVudCA9IHRoaXM7XHJcbiAgICB2YXIgdmlzaWJsZUNvbHVtbnMgPSBjdXJyZW50R3JvdXAudmlzaWJsZUNvbHVtbnM7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5ncm91cFdpZHRoU3RhcnQgPSBjdXJyZW50R3JvdXAuYWN0dWFsV2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW5XaWR0aFN0YXJ0cyA9IFtdO1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIHZpc2libGVDb2x1bW5zLmZvckVhY2goZnVuY3Rpb24oY29sRGVmV3JhcHBlcikge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5jaGlsZHJlbldpZHRoU3RhcnRzLnB1c2goY29sRGVmV3JhcHBlci5hY3R1YWxXaWR0aCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLm1pbldpZHRoID0gdmlzaWJsZUNvbHVtbnMubGVuZ3RoICogY29uc3RhbnRzLk1JTl9DT0xfV0lEVEg7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkRyYWdnaW5nOiBmdW5jdGlvbihkcmFnQ2hhbmdlKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgbmV3V2lkdGggPSB0aGlzLmdyb3VwV2lkdGhTdGFydCArIGRyYWdDaGFuZ2U7XHJcbiAgICAgICAgICAgIGlmIChuZXdXaWR0aCA8IHRoaXMubWluV2lkdGgpIHtcclxuICAgICAgICAgICAgICAgIG5ld1dpZHRoID0gdGhpcy5taW5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gc2V0IHRoZSBuZXcgd2lkdGggdG8gdGhlIGdyb3VwIGhlYWRlclxyXG4gICAgICAgICAgICB2YXIgbmV3V2lkdGhQeCA9IG5ld1dpZHRoICsgXCJweFwiO1xyXG4gICAgICAgICAgICBjdXJyZW50R3JvdXAuZUhlYWRlckdyb3VwQ2VsbC5zdHlsZS53aWR0aCA9IG5ld1dpZHRoUHg7XHJcbiAgICAgICAgICAgIGN1cnJlbnRHcm91cC5hY3R1YWxXaWR0aCA9IG5ld1dpZHRoO1xyXG5cclxuICAgICAgICAgICAgLy8gZGlzdHJpYnV0ZSB0aGUgbmV3IHdpZHRoIHRvIHRoZSBjaGlsZCBoZWFkZXJzXHJcbiAgICAgICAgICAgIHZhciBjaGFuZ2VSYXRpbyA9IG5ld1dpZHRoIC8gdGhpcy5ncm91cFdpZHRoU3RhcnQ7XHJcbiAgICAgICAgICAgIC8vIGtlZXAgdHJhY2sgb2YgcGl4ZWxzIHVzZWQsIGFuZCBsYXN0IGNvbHVtbiBnZXRzIHRoZSByZW1haW5pbmcsXHJcbiAgICAgICAgICAgIC8vIHRvIGNhdGVyIGZvciByb3VuZGluZyBlcnJvcnMsIGFuZCBtaW4gd2lkdGggYWRqdXN0bWVudHNcclxuICAgICAgICAgICAgdmFyIHBpeGVsc1RvRGlzdHJpYnV0ZSA9IG5ld1dpZHRoO1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgIGN1cnJlbnRHcm91cC52aXNpYmxlQ29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbERlZldyYXBwZXIsIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbm90TGFzdENvbCA9IGluZGV4ICE9PSAodmlzaWJsZUNvbHVtbnMubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3Q2hpbGRTaXplO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vdExhc3RDb2wpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBub3QgdGhlIGxhc3QgY29sLCBjYWxjdWxhdGUgdGhlIGNvbHVtbiB3aWR0aCBhcyBub3JtYWxcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhcnRDaGlsZFNpemUgPSB0aGF0LmNoaWxkcmVuV2lkdGhTdGFydHNbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkU2l6ZSA9IHN0YXJ0Q2hpbGRTaXplICogY2hhbmdlUmF0aW87XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkU2l6ZSA8IGNvbnN0YW50cy5NSU5fQ09MX1dJRFRIKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkU2l6ZSA9IGNvbnN0YW50cy5NSU5fQ09MX1dJRFRIO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBwaXhlbHNUb0Rpc3RyaWJ1dGUgLT0gbmV3Q2hpbGRTaXplO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBsYXN0IGNvbCwgZ2l2ZSBpdCB0aGUgcmVtYWluaW5nIHBpeGVsc1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkU2l6ZSA9IHBpeGVsc1RvRGlzdHJpYnV0ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBlSGVhZGVyQ2VsbCA9IHZpc2libGVDb2x1bW5zW2luZGV4XS5lSGVhZGVyQ2VsbDtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5hZGp1c3RDb2x1bW5XaWR0aChuZXdDaGlsZFNpemUsIGNvbERlZldyYXBwZXIsIGVIZWFkZXJDZWxsKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBzaG91bGQgbm90IGJlIGNhbGxpbmcgdGhlc2UgaGVyZSwgc2hvdWxkIGRvIHNvbWV0aGluZyBlbHNlXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50R3JvdXAucGlubmVkKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuYW5ndWxhckdyaWQudXBkYXRlUGlubmVkQ29sQ29udGFpbmVyV2lkdGhBZnRlckNvbFJlc2l6ZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50LmFuZ3VsYXJHcmlkLnVwZGF0ZUJvZHlDb250YWluZXJXaWR0aEFmdGVyQ29sUmVzaXplKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmFkanVzdENvbHVtbldpZHRoID0gZnVuY3Rpb24obmV3V2lkdGgsIGNvbHVtbiwgZUhlYWRlckNlbGwpIHtcclxuICAgIHZhciBuZXdXaWR0aFB4ID0gbmV3V2lkdGggKyBcInB4XCI7XHJcbiAgICB2YXIgc2VsZWN0b3JGb3JBbGxDb2xzSW5DZWxsID0gXCIuY2VsbC1jb2wtXCIgKyBjb2x1bW4uaW5kZXg7XHJcbiAgICB2YXIgY2VsbHNGb3JUaGlzQ29sID0gdGhpcy5lUm9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yRm9yQWxsQ29sc0luQ2VsbCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNlbGxzRm9yVGhpc0NvbC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNlbGxzRm9yVGhpc0NvbFtpXS5zdHlsZS53aWR0aCA9IG5ld1dpZHRoUHg7XHJcbiAgICB9XHJcblxyXG4gICAgZUhlYWRlckNlbGwuc3R5bGUud2lkdGggPSBuZXdXaWR0aFB4O1xyXG4gICAgY29sdW1uLmFjdHVhbFdpZHRoID0gbmV3V2lkdGg7XHJcbn07XHJcblxyXG4vLyBnZXRzIGNhbGxlZCB3aGVuIGEgaGVhZGVyIChub3QgYSBoZWFkZXIgZ3JvdXApIGdldHMgcmVzaXplZFxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuaGVhZGVyRHJhZ0NhbGxiYWNrRmFjdG9yeSA9IGZ1bmN0aW9uKGhlYWRlckNlbGwsIGNvbHVtbiwgaGVhZGVyR3JvdXApIHtcclxuICAgIHZhciBwYXJlbnQgPSB0aGlzO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBvbkRyYWdTdGFydDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRXaWR0aCA9IGNvbHVtbi5hY3R1YWxXaWR0aDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRHJhZ2dpbmc6IGZ1bmN0aW9uKGRyYWdDaGFuZ2UpIHtcclxuICAgICAgICAgICAgdmFyIG5ld1dpZHRoID0gdGhpcy5zdGFydFdpZHRoICsgZHJhZ0NoYW5nZTtcclxuICAgICAgICAgICAgaWYgKG5ld1dpZHRoIDwgY29uc3RhbnRzLk1JTl9DT0xfV0lEVEgpIHtcclxuICAgICAgICAgICAgICAgIG5ld1dpZHRoID0gY29uc3RhbnRzLk1JTl9DT0xfV0lEVEg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHBhcmVudC5hZGp1c3RDb2x1bW5XaWR0aChuZXdXaWR0aCwgY29sdW1uLCBoZWFkZXJDZWxsKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChoZWFkZXJHcm91cCkge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50LnNldFdpZHRoT2ZHcm91cEhlYWRlckNlbGwoaGVhZGVyR3JvdXApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBzaG91bGQgbm90IGJlIGNhbGxpbmcgdGhlc2UgaGVyZSwgc2hvdWxkIGRvIHNvbWV0aGluZyBlbHNlXHJcbiAgICAgICAgICAgIGlmIChjb2x1bW4ucGlubmVkKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuYW5ndWxhckdyaWQudXBkYXRlUGlubmVkQ29sQ29udGFpbmVyV2lkdGhBZnRlckNvbFJlc2l6ZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50LmFuZ3VsYXJHcmlkLnVwZGF0ZUJvZHlDb250YWluZXJXaWR0aEFmdGVyQ29sUmVzaXplKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLnN0b3BEcmFnZ2luZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lUm9vdC5zdHlsZS5jdXJzb3IgPSBcIlwiO1xyXG4gICAgdGhpcy5lUm9vdC5vbm1vdXNldXAgPSBudWxsO1xyXG4gICAgdGhpcy5lUm9vdC5vbm1vdXNlbGVhdmUgPSBudWxsO1xyXG4gICAgdGhpcy5lUm9vdC5vbm1vdXNlbW92ZSA9IG51bGw7XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUudXBkYXRlRmlsdGVySWNvbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHRoaXMuY29sdW1uTW9kZWwuZ2V0VmlzaWJsZUNvbHVtbnMoKS5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgICAgIC8vIHRvZG86IG5lZWQgdG8gY2hhbmdlIHRoaXMsIHNvIG9ubHkgdXBkYXRlcyBpZiBjb2x1bW4gaXMgdmlzaWJsZVxyXG4gICAgICAgIGlmIChjb2x1bW4uZUZpbHRlckljb24pIHtcclxuICAgICAgICAgICAgdmFyIGZpbHRlclByZXNlbnQgPSB0aGF0LmZpbHRlck1hbmFnZXIuaXNGaWx0ZXJQcmVzZW50Rm9yQ29sKGNvbHVtbi5jb2xLZXkpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheVN0eWxlID0gZmlsdGVyUHJlc2VudCA/ICdpbmxpbmUnIDogJ25vbmUnO1xyXG4gICAgICAgICAgICBjb2x1bW4uZUZpbHRlckljb24uc3R5bGUuZGlzcGxheSA9IGRpc3BsYXlTdHlsZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyUmVuZGVyZXI7XHJcbiIsInZhciBncm91cENyZWF0b3IgPSByZXF1aXJlKCcuL2dyb3VwQ3JlYXRvcicpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcbnZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xyXG5cclxuZnVuY3Rpb24gSW5NZW1vcnlSb3dDb250cm9sbGVyKCkge1xyXG4gICAgdGhpcy5jcmVhdGVNb2RlbCgpO1xyXG59XHJcblxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbk1vZGVsLCBhbmd1bGFyR3JpZCwgZmlsdGVyTWFuYWdlciwgJHNjb3BlLCBleHByZXNzaW9uU2VydmljZSkge1xyXG4gICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIgPSBncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsID0gY29sdW1uTW9kZWw7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkID0gYW5ndWxhckdyaWQ7XHJcbiAgICB0aGlzLmZpbHRlck1hbmFnZXIgPSBmaWx0ZXJNYW5hZ2VyO1xyXG4gICAgdGhpcy4kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLmV4cHJlc3Npb25TZXJ2aWNlID0gZXhwcmVzc2lvblNlcnZpY2U7XHJcblxyXG4gICAgdGhpcy5hbGxSb3dzID0gbnVsbDtcclxuICAgIHRoaXMucm93c0FmdGVyR3JvdXAgPSBudWxsO1xyXG4gICAgdGhpcy5yb3dzQWZ0ZXJGaWx0ZXIgPSBudWxsO1xyXG4gICAgdGhpcy5yb3dzQWZ0ZXJTb3J0ID0gbnVsbDtcclxuICAgIHRoaXMucm93c0FmdGVyTWFwID0gbnVsbDtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5jcmVhdGVNb2RlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5tb2RlbCA9IHtcclxuICAgICAgICAvLyB0aGlzIG1ldGhvZCBpcyBpbXBsZW1lbnRlZCBieSB0aGUgaW5NZW1vcnkgbW9kZWwgb25seSxcclxuICAgICAgICAvLyBpdCBnaXZlcyB0aGUgdG9wIGxldmVsIG9mIHRoZSBzZWxlY3Rpb24uIHVzZWQgYnkgdGhlIHNlbGVjdGlvblxyXG4gICAgICAgIC8vIGNvbnRyb2xsZXIsIHdoZW4gaXQgbmVlZHMgdG8gZG8gYSBmdWxsIHRyYXZlcnNhbFxyXG4gICAgICAgIGdldFRvcExldmVsTm9kZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5yb3dzQWZ0ZXJHcm91cDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFZpcnR1YWxSb3c6IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnJvd3NBZnRlck1hcFtpbmRleF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRWaXJ0dWFsUm93Q291bnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhhdC5yb3dzQWZ0ZXJNYXApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGF0LnJvd3NBZnRlck1hcC5sZW5ndGg7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG4vLyBwdWJsaWNcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5nZXRNb2RlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubW9kZWw7XHJcbn07XHJcblxyXG4vLyBwdWJsaWNcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVNb2RlbCA9IGZ1bmN0aW9uKHN0ZXApIHtcclxuXHJcbiAgICAvLyBmYWxsdGhyb3VnaCBpbiBiZWxvdyBzd2l0Y2ggaXMgb24gcHVycG9zZVxyXG4gICAgc3dpdGNoIChzdGVwKSB7XHJcbiAgICAgICAgY2FzZSBjb25zdGFudHMuU1RFUF9FVkVSWVRISU5HOlxyXG4gICAgICAgICAgICB0aGlzLmRvR3JvdXBpbmcoKTtcclxuICAgICAgICBjYXNlIGNvbnN0YW50cy5TVEVQX0ZJTFRFUjpcclxuICAgICAgICAgICAgdGhpcy5kb0ZpbHRlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmRvQWdncmVnYXRlKCk7XHJcbiAgICAgICAgY2FzZSBjb25zdGFudHMuU1RFUF9TT1JUOlxyXG4gICAgICAgICAgICB0aGlzLmRvU29ydCgpO1xyXG4gICAgICAgIGNhc2UgY29uc3RhbnRzLlNURVBfTUFQOlxyXG4gICAgICAgICAgICB0aGlzLmRvR3JvdXBNYXBwaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRNb2RlbFVwZGF0ZWQoKSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldE1vZGVsVXBkYXRlZCgpKCk7XHJcbiAgICAgICAgdmFyICRzY29wZSA9IHRoaXMuJHNjb3BlO1xyXG4gICAgICAgIGlmICgkc2NvcGUpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uKGRhdGEsIGNvbERlZiwgbm9kZSwgcm93SW5kZXgpIHtcclxuICAgIHZhciBhcGkgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKTtcclxuICAgIHZhciBjb250ZXh0ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpO1xyXG4gICAgcmV0dXJuIHV0aWxzLmdldFZhbHVlKHRoaXMuZXhwcmVzc2lvblNlcnZpY2UsIGRhdGEsIGNvbERlZiwgbm9kZSwgcm93SW5kZXgsIGFwaSwgY29udGV4dCk7XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgLSBpdCdzIHBvc3NpYmxlIHRvIHJlY29tcHV0ZSB0aGUgYWdncmVnYXRlIHdpdGhvdXQgZG9pbmcgdGhlIG90aGVyIHBhcnRzXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZG9BZ2dyZWdhdGUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgZ3JvdXBBZ2dGdW5jdGlvbiA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEdyb3VwQWdnRnVuY3Rpb24oKTtcclxuICAgIGlmICh0eXBlb2YgZ3JvdXBBZ2dGdW5jdGlvbiAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlY3Vyc2l2ZWx5Q3JlYXRlQWdnRGF0YSh0aGlzLnJvd3NBZnRlckZpbHRlciwgZ3JvdXBBZ2dGdW5jdGlvbik7XHJcbn07XHJcblxyXG4vLyBwdWJsaWNcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5leHBhbmRPckNvbGxhcHNlQWxsID0gZnVuY3Rpb24oZXhwYW5kLCByb3dOb2Rlcykge1xyXG4gICAgLy8gaWYgZmlyc3QgY2FsbCBpbiByZWN1cnNpb24sIHdlIHNldCBsaXN0IHRvIHBhcmVudCBsaXN0XHJcbiAgICBpZiAocm93Tm9kZXMgPT09IG51bGwpIHtcclxuICAgICAgICByb3dOb2RlcyA9IHRoaXMucm93c0FmdGVyR3JvdXA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFyb3dOb2Rlcykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgcm93Tm9kZXMuZm9yRWFjaChmdW5jdGlvbihub2RlKSB7XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgbm9kZS5leHBhbmRlZCA9IGV4cGFuZDtcclxuICAgICAgICAgICAgX3RoaXMuZXhwYW5kT3JDb2xsYXBzZUFsbChleHBhbmQsIG5vZGUuY2hpbGRyZW4pO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnJlY3Vyc2l2ZWx5Q3JlYXRlQWdnRGF0YSA9IGZ1bmN0aW9uKG5vZGVzLCBncm91cEFnZ0Z1bmN0aW9uKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG5vZGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgLy8gYWdnIGZ1bmN0aW9uIG5lZWRzIHRvIHN0YXJ0IGF0IHRoZSBib3R0b20sIHNvIHRyYXZlcnNlIGZpcnN0XHJcbiAgICAgICAgICAgIHRoaXMucmVjdXJzaXZlbHlDcmVhdGVBZ2dEYXRhKG5vZGUuY2hpbGRyZW5BZnRlckZpbHRlciwgZ3JvdXBBZ2dGdW5jdGlvbik7XHJcbiAgICAgICAgICAgIC8vIGFmdGVyIHRyYXZlcnNhbCwgd2UgY2FuIG5vdyBkbyB0aGUgYWdnIGF0IHRoaXMgbGV2ZWxcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBncm91cEFnZ0Z1bmN0aW9uKG5vZGUuY2hpbGRyZW5BZnRlckZpbHRlcik7XHJcbiAgICAgICAgICAgIG5vZGUuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgICAgIC8vIGlmIHdlIGFyZSBncm91cGluZywgdGhlbiBpdCdzIHBvc3NpYmxlIHRoZXJlIGlzIGEgc2libGluZyBmb290ZXJcclxuICAgICAgICAgICAgLy8gdG8gdGhlIGdyb3VwLCBzbyB1cGRhdGUgdGhlIGRhdGEgaGVyZSBhbHNvIGlmIHRoZXJlIGlzIG9uZVxyXG4gICAgICAgICAgICBpZiAobm9kZS5zaWJsaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLnNpYmxpbmcuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZG9Tb3J0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL3NlZSBpZiB0aGVyZSBpcyBhIGNvbCB3ZSBhcmUgc29ydGluZyBieVxyXG4gICAgdmFyIGNvbHVtbkZvclNvcnRpbmcgPSBudWxsO1xyXG4gICAgdGhpcy5jb2x1bW5Nb2RlbC5nZXRBbGxDb2x1bW5zKCkuZm9yRWFjaChmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgICAgICBpZiAoY29sdW1uLnNvcnQpIHtcclxuICAgICAgICAgICAgY29sdW1uRm9yU29ydGluZyA9IGNvbHVtbjtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgcm93Tm9kZXNCZWZvcmVTb3J0ID0gdGhpcy5yb3dzQWZ0ZXJGaWx0ZXIuc2xpY2UoMCk7XHJcblxyXG4gICAgaWYgKGNvbHVtbkZvclNvcnRpbmcpIHtcclxuICAgICAgICB2YXIgYXNjZW5kaW5nID0gY29sdW1uRm9yU29ydGluZy5zb3J0ID09PSBjb25zdGFudHMuQVNDO1xyXG4gICAgICAgIHZhciBpbnZlcnRlciA9IGFzY2VuZGluZyA/IDEgOiAtMTtcclxuXHJcbiAgICAgICAgdGhpcy5zb3J0TGlzdChyb3dOb2Rlc0JlZm9yZVNvcnQsIGNvbHVtbkZvclNvcnRpbmcuY29sRGVmLCBpbnZlcnRlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGlmIG5vIHNvcnRpbmcsIHNldCBhbGwgZ3JvdXAgY2hpbGRyZW4gYWZ0ZXIgc29ydCB0byB0aGUgb3JpZ2luYWwgbGlzdFxyXG4gICAgICAgIHRoaXMucmVjdXJzaXZlbHlSZXNldFNvcnQocm93Tm9kZXNCZWZvcmVTb3J0KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJvd3NBZnRlclNvcnQgPSByb3dOb2Rlc0JlZm9yZVNvcnQ7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlSZXNldFNvcnQgPSBmdW5jdGlvbihyb3dOb2Rlcykge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSByb3dOb2Rlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICB2YXIgaXRlbSA9IHJvd05vZGVzW2ldO1xyXG4gICAgICAgIGlmIChpdGVtLmdyb3VwICYmIGl0ZW0uY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgaXRlbS5jaGlsZHJlbkFmdGVyU29ydCA9IGl0ZW0uY2hpbGRyZW5BZnRlckZpbHRlcjtcclxuICAgICAgICAgICAgdGhpcy5yZWN1cnNpdmVseVJlc2V0U29ydChpdGVtLmNoaWxkcmVuKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuc29ydExpc3QgPSBmdW5jdGlvbihub2RlcywgY29sRGVmLCBpbnZlcnRlcikge1xyXG5cclxuICAgIC8vIHNvcnQgYW55IGdyb3VwcyByZWN1cnNpdmVseVxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBub2Rlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgLy8gY3JpdGljYWwgc2VjdGlvbiwgbm8gZnVuY3Rpb25hbCBwcm9ncmFtbWluZ1xyXG4gICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXAgJiYgbm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuQWZ0ZXJTb3J0ID0gbm9kZS5jaGlsZHJlbkFmdGVyRmlsdGVyLnNsaWNlKDApO1xyXG4gICAgICAgICAgICB0aGlzLnNvcnRMaXN0KG5vZGUuY2hpbGRyZW5BZnRlclNvcnQsIGNvbERlZiwgaW52ZXJ0ZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBub2Rlcy5zb3J0KGZ1bmN0aW9uKG9iakEsIG9iakIpIHtcclxuXHJcbiAgICAgICAgdmFyIHZhbHVlQSA9IHRoYXQuZ2V0VmFsdWUob2JqQS5kYXRhLCBjb2xEZWYsIG9iakEpO1xyXG4gICAgICAgIHZhciB2YWx1ZUIgPSB0aGF0LmdldFZhbHVlKG9iakIuZGF0YSwgY29sRGVmLCBvYmpCKTtcclxuXHJcbiAgICAgICAgaWYgKGNvbERlZi5jb21wYXJhdG9yKSB7XHJcbiAgICAgICAgICAgIC8vaWYgY29tcGFyYXRvciBwcm92aWRlZCwgdXNlIGl0XHJcbiAgICAgICAgICAgIHJldHVybiBjb2xEZWYuY29tcGFyYXRvcih2YWx1ZUEsIHZhbHVlQiwgb2JqQSwgb2JqQikgKiBpbnZlcnRlcjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvL290aGVyd2lzZSBkbyBvdXIgb3duIGNvbXBhcmlzb25cclxuICAgICAgICAgICAgcmV0dXJuIHV0aWxzLmRlZmF1bHRDb21wYXJhdG9yKHZhbHVlQSwgdmFsdWVCLCBvYmpBLCBvYmpCKSAqIGludmVydGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5kb0dyb3VwaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcm93c0FmdGVyR3JvdXA7XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb0ludGVybmFsR3JvdXBpbmcoKSkge1xyXG4gICAgICAgIHZhciBleHBhbmRCeURlZmF1bHQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcm91cERlZmF1bHRFeHBhbmRlZCgpO1xyXG4gICAgICAgIHJvd3NBZnRlckdyb3VwID0gZ3JvdXBDcmVhdG9yLmdyb3VwKHRoaXMuYWxsUm93cywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0R3JvdXBLZXlzKCksXHJcbiAgICAgICAgICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEdyb3VwQWdnRnVuY3Rpb24oKSwgZXhwYW5kQnlEZWZhdWx0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcm93c0FmdGVyR3JvdXAgPSB0aGlzLmFsbFJvd3M7XHJcbiAgICB9XHJcbiAgICB0aGlzLnJvd3NBZnRlckdyb3VwID0gcm93c0FmdGVyR3JvdXA7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBxdWlja0ZpbHRlclByZXNlbnQgPSB0aGlzLmFuZ3VsYXJHcmlkLmdldFF1aWNrRmlsdGVyKCkgIT09IG51bGw7XHJcbiAgICB2YXIgYWR2YW5jZWRGaWx0ZXJQcmVzZW50ID0gdGhpcy5maWx0ZXJNYW5hZ2VyLmlzRmlsdGVyUHJlc2VudCgpO1xyXG4gICAgdmFyIGZpbHRlclByZXNlbnQgPSBxdWlja0ZpbHRlclByZXNlbnQgfHwgYWR2YW5jZWRGaWx0ZXJQcmVzZW50O1xyXG5cclxuICAgIHZhciByb3dzQWZ0ZXJGaWx0ZXI7XHJcbiAgICBpZiAoZmlsdGVyUHJlc2VudCkge1xyXG4gICAgICAgIHJvd3NBZnRlckZpbHRlciA9IHRoaXMuZmlsdGVySXRlbXModGhpcy5yb3dzQWZ0ZXJHcm91cCwgcXVpY2tGaWx0ZXJQcmVzZW50LCBhZHZhbmNlZEZpbHRlclByZXNlbnQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBkbyBpdCBoZXJlXHJcbiAgICAgICAgcm93c0FmdGVyRmlsdGVyID0gdGhpcy5yb3dzQWZ0ZXJHcm91cDtcclxuICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5UmVzZXRGaWx0ZXIodGhpcy5yb3dzQWZ0ZXJHcm91cCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnJvd3NBZnRlckZpbHRlciA9IHJvd3NBZnRlckZpbHRlcjtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5maWx0ZXJJdGVtcyA9IGZ1bmN0aW9uKHJvd05vZGVzLCBxdWlja0ZpbHRlclByZXNlbnQsIGFkdmFuY2VkRmlsdGVyUHJlc2VudCkge1xyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gcm93Tm9kZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSByb3dOb2Rlc1tpXTtcclxuXHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgLy8gZGVhbCB3aXRoIGdyb3VwXHJcbiAgICAgICAgICAgIG5vZGUuY2hpbGRyZW5BZnRlckZpbHRlciA9IHRoaXMuZmlsdGVySXRlbXMobm9kZS5jaGlsZHJlbiwgcXVpY2tGaWx0ZXJQcmVzZW50LCBhZHZhbmNlZEZpbHRlclByZXNlbnQpO1xyXG4gICAgICAgICAgICBpZiAobm9kZS5jaGlsZHJlbkFmdGVyRmlsdGVyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIG5vZGUuYWxsQ2hpbGRyZW5Db3VudCA9IHRoaXMuZ2V0VG90YWxDaGlsZENvdW50KG5vZGUuY2hpbGRyZW5BZnRlckZpbHRlcik7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChub2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRvZXNSb3dQYXNzRmlsdGVyKG5vZGUsIHF1aWNrRmlsdGVyUHJlc2VudCwgYWR2YW5jZWRGaWx0ZXJQcmVzZW50KSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5yZWN1cnNpdmVseVJlc2V0RmlsdGVyID0gZnVuY3Rpb24obm9kZXMpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbm9kZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgIG5vZGUuY2hpbGRyZW5BZnRlckZpbHRlciA9IG5vZGUuY2hpbGRyZW47XHJcbiAgICAgICAgICAgIG5vZGUuYWxsQ2hpbGRyZW5Db3VudCA9IHRoaXMuZ2V0VG90YWxDaGlsZENvdW50KG5vZGUuY2hpbGRyZW5BZnRlckZpbHRlcik7XHJcbiAgICAgICAgICAgIHRoaXMucmVjdXJzaXZlbHlSZXNldEZpbHRlcihub2RlLmNoaWxkcmVuKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbi8vIHJvd3M6IHRoZSByb3dzIHRvIHB1dCBpbnRvIHRoZSBtb2RlbFxyXG4vLyBmaXJzdElkOiB0aGUgZmlyc3QgaWQgdG8gdXNlLCB1c2VkIGZvciBwYWdpbmcsIHdoZXJlIHdlIGFyZSBub3Qgb24gdGhlIGZpcnN0IHBhZ2VcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5zZXRBbGxSb3dzID0gZnVuY3Rpb24ocm93cywgZmlyc3RJZCkge1xyXG4gICAgdmFyIG5vZGVzO1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzUm93c0FscmVhZHlHcm91cGVkKCkpIHtcclxuICAgICAgICBub2RlcyA9IHJvd3M7XHJcbiAgICAgICAgdGhpcy5yZWN1cnNpdmVseUNoZWNrVXNlclByb3ZpZGVkTm9kZXMobm9kZXMsIG51bGwsIDApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBwbGFjZSBlYWNoIHJvdyBpbnRvIGEgd3JhcHBlclxyXG4gICAgICAgIHZhciBub2RlcyA9IFtdO1xyXG4gICAgICAgIGlmIChyb3dzKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm93cy5sZW5ndGg7IGkrKykgeyAvLyBjb3VsZCBiZSBsb3RzIG9mIHJvd3MsIGRvbid0IHVzZSBmdW5jdGlvbmFsIHByb2dyYW1taW5nXHJcbiAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiByb3dzW2ldXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBmaXJzdElkIHByb3ZpZGVkLCB1c2UgaXQsIG90aGVyd2lzZSBzdGFydCBhdCAwXHJcbiAgICB2YXIgZmlyc3RJZFRvVXNlID0gZmlyc3RJZCA/IGZpcnN0SWQgOiAwO1xyXG4gICAgdGhpcy5yZWN1cnNpdmVseUFkZElkVG9Ob2Rlcyhub2RlcywgZmlyc3RJZFRvVXNlKTtcclxuICAgIHRoaXMuYWxsUm93cyA9IG5vZGVzO1xyXG59O1xyXG5cclxuLy8gYWRkIGluIGluZGV4IC0gdGhpcyBpcyB1c2VkIGJ5IHRoZSBzZWxlY3Rpb25Db250cm9sbGVyIC0gc28gcXVpY2tcclxuLy8gdG8gbG9vayB1cCBzZWxlY3RlZCByb3dzXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlBZGRJZFRvTm9kZXMgPSBmdW5jdGlvbihub2RlcywgaW5kZXgpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldO1xyXG4gICAgICAgIG5vZGUuaWQgPSBpbmRleCsrO1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgaW5kZXggPSB0aGlzLnJlY3Vyc2l2ZWx5QWRkSWRUb05vZGVzKG5vZGUuY2hpbGRyZW4sIGluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5kZXg7XHJcbn07XHJcblxyXG4vLyBhZGQgaW4gaW5kZXggLSB0aGlzIGlzIHVzZWQgYnkgdGhlIHNlbGVjdGlvbkNvbnRyb2xsZXIgLSBzbyBxdWlja1xyXG4vLyB0byBsb29rIHVwIHNlbGVjdGVkIHJvd3NcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5yZWN1cnNpdmVseUNoZWNrVXNlclByb3ZpZGVkTm9kZXMgPSBmdW5jdGlvbihub2RlcywgcGFyZW50LCBsZXZlbCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgaWYgKHBhcmVudCkge1xyXG4gICAgICAgICAgICBub2RlLnBhcmVudCA9IHBhcmVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbm9kZS5sZXZlbCA9IGxldmVsO1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgdGhpcy5yZWN1cnNpdmVseUNoZWNrVXNlclByb3ZpZGVkTm9kZXMobm9kZS5jaGlsZHJlbiwgbm9kZSwgbGV2ZWwgKyAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZ2V0VG90YWxDaGlsZENvdW50ID0gZnVuY3Rpb24ocm93Tm9kZXMpIHtcclxuICAgIHZhciBjb3VudCA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHJvd05vZGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHZhciBpdGVtID0gcm93Tm9kZXNbaV07XHJcbiAgICAgICAgaWYgKGl0ZW0uZ3JvdXApIHtcclxuICAgICAgICAgICAgY291bnQgKz0gaXRlbS5hbGxDaGlsZHJlbkNvdW50O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNvdW50O1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmNvcHlHcm91cE5vZGUgPSBmdW5jdGlvbihncm91cE5vZGUsIGNoaWxkcmVuLCBhbGxDaGlsZHJlbkNvdW50KSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdyb3VwOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGdyb3VwTm9kZS5kYXRhLFxyXG4gICAgICAgIGZpZWxkOiBncm91cE5vZGUuZmllbGQsXHJcbiAgICAgICAga2V5OiBncm91cE5vZGUua2V5LFxyXG4gICAgICAgIGV4cGFuZGVkOiBncm91cE5vZGUuZXhwYW5kZWQsXHJcbiAgICAgICAgY2hpbGRyZW46IGNoaWxkcmVuLFxyXG4gICAgICAgIGFsbENoaWxkcmVuQ291bnQ6IGFsbENoaWxkcmVuQ291bnQsXHJcbiAgICAgICAgbGV2ZWw6IGdyb3VwTm9kZS5sZXZlbFxyXG4gICAgfTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5kb0dyb3VwTWFwcGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gZXZlbiBpZiBub3QgZ29pbmcgZ3JvdXBpbmcsIHdlIGRvIHRoZSBtYXBwaW5nLCBhcyB0aGUgY2xpZW50IG1pZ2h0XHJcbiAgICAvLyBvZiBwYXNzZWQgaW4gZGF0YSB0aGF0IGFscmVhZHkgaGFzIGEgZ3JvdXBpbmcgaW4gaXQgc29tZXdoZXJlXHJcbiAgICB2YXIgcm93c0FmdGVyTWFwID0gW107XHJcbiAgICB0aGlzLmFkZFRvTWFwKHJvd3NBZnRlck1hcCwgdGhpcy5yb3dzQWZ0ZXJTb3J0KTtcclxuICAgIHRoaXMucm93c0FmdGVyTWFwID0gcm93c0FmdGVyTWFwO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmFkZFRvTWFwID0gZnVuY3Rpb24obWFwcGVkRGF0YSwgb3JpZ2luYWxOb2Rlcykge1xyXG4gICAgaWYgKCFvcmlnaW5hbE5vZGVzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcmlnaW5hbE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBvcmlnaW5hbE5vZGVzW2ldO1xyXG4gICAgICAgIG1hcHBlZERhdGEucHVzaChub2RlKTtcclxuICAgICAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmV4cGFuZGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkVG9NYXAobWFwcGVkRGF0YSwgbm9kZS5jaGlsZHJlbkFmdGVyU29ydCk7XHJcblxyXG4gICAgICAgICAgICAvLyBwdXQgYSBmb290ZXIgaW4gaWYgdXNlciBpcyBsb29raW5nIGZvciBpdFxyXG4gICAgICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEluY2x1ZGVGb290ZXIoKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZvb3Rlck5vZGUgPSB0aGlzLmNyZWF0ZUZvb3Rlck5vZGUobm9kZSk7XHJcbiAgICAgICAgICAgICAgICBtYXBwZWREYXRhLnB1c2goZm9vdGVyTm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuY3JlYXRlRm9vdGVyTm9kZSA9IGZ1bmN0aW9uKGdyb3VwTm9kZSkge1xyXG4gICAgdmFyIGZvb3Rlck5vZGUgPSB7fTtcclxuICAgIE9iamVjdC5rZXlzKGdyb3VwTm9kZSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICBmb290ZXJOb2RlW2tleV0gPSBncm91cE5vZGVba2V5XTtcclxuICAgIH0pO1xyXG4gICAgZm9vdGVyTm9kZS5mb290ZXIgPSB0cnVlO1xyXG4gICAgLy8gZ2V0IGJvdGggaGVhZGVyIGFuZCBmb290ZXIgdG8gcmVmZXJlbmNlIGVhY2ggb3RoZXIgYXMgc2libGluZ3MuIHRoaXMgaXMgbmV2ZXIgdW5kb25lLFxyXG4gICAgLy8gb25seSBvdmVyd3JpdHRlbi4gc28gaWYgYSBncm91cCBpcyBleHBhbmRlZCwgdGhlbiBjb250cmFjdGVkLCBpdCB3aWxsIGhhdmUgYSBnaG9zdFxyXG4gICAgLy8gc2libGluZyAtIGJ1dCB0aGF0J3MgZmluZSwgYXMgd2UgY2FuIGlnbm9yZSB0aGlzIGlmIHRoZSBoZWFkZXIgaXMgY29udHJhY3RlZC5cclxuICAgIGZvb3Rlck5vZGUuc2libGluZyA9IGdyb3VwTm9kZTtcclxuICAgIGdyb3VwTm9kZS5zaWJsaW5nID0gZm9vdGVyTm9kZTtcclxuICAgIHJldHVybiBmb290ZXJOb2RlO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmRvZXNSb3dQYXNzRmlsdGVyID0gZnVuY3Rpb24obm9kZSwgcXVpY2tGaWx0ZXJQcmVzZW50LCBhZHZhbmNlZEZpbHRlclByZXNlbnQpIHtcclxuICAgIC8vZmlyc3QgdXAsIGNoZWNrIHF1aWNrIGZpbHRlclxyXG4gICAgaWYgKHF1aWNrRmlsdGVyUHJlc2VudCkge1xyXG4gICAgICAgIGlmICghbm9kZS5xdWlja0ZpbHRlckFnZ3JlZ2F0ZVRleHQpIHtcclxuICAgICAgICAgICAgdGhpcy5hZ2dyZWdhdGVSb3dGb3JRdWlja0ZpbHRlcihub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5vZGUucXVpY2tGaWx0ZXJBZ2dyZWdhdGVUZXh0LmluZGV4T2YodGhpcy5hbmd1bGFyR3JpZC5nZXRRdWlja0ZpbHRlcigpKSA8IDApIHtcclxuICAgICAgICAgICAgLy9xdWljayBmaWx0ZXIgZmFpbHMsIHNvIHNraXAgaXRlbVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vc2Vjb25kLCBjaGVjayBhZHZhbmNlZCBmaWx0ZXJcclxuICAgIGlmIChhZHZhbmNlZEZpbHRlclByZXNlbnQpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZmlsdGVyTWFuYWdlci5kb2VzRmlsdGVyUGFzcyhub2RlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vZ290IHRoaXMgZmFyLCBhbGwgZmlsdGVycyBwYXNzXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5hZ2dyZWdhdGVSb3dGb3JRdWlja0ZpbHRlciA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIHZhciBhZ2dyZWdhdGVkVGV4dCA9ICcnO1xyXG4gICAgdGhpcy5jb2x1bW5Nb2RlbC5nZXRBbGxDb2x1bW5zKCkuZm9yRWFjaChmdW5jdGlvbihjb2xEZWZXcmFwcGVyKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBub2RlLmRhdGE7XHJcbiAgICAgICAgdmFyIHZhbHVlID0gZGF0YSA/IGRhdGFbY29sRGVmV3JhcHBlci5jb2xEZWYuZmllbGRdIDogbnVsbDtcclxuICAgICAgICBpZiAodmFsdWUgJiYgdmFsdWUgIT09ICcnKSB7XHJcbiAgICAgICAgICAgIGFnZ3JlZ2F0ZWRUZXh0ID0gYWdncmVnYXRlZFRleHQgKyB2YWx1ZS50b1N0cmluZygpLnRvVXBwZXJDYXNlKCkgKyBcIl9cIjtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIG5vZGUucXVpY2tGaWx0ZXJBZ2dyZWdhdGVUZXh0ID0gYWdncmVnYXRlZFRleHQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEluTWVtb3J5Um93Q29udHJvbGxlcjtcclxuIiwidmFyIFRFTVBMQVRFID0gW1xyXG4gICAgJzxzcGFuIGlkPVwicGFnZVJvd1N1bW1hcnlQYW5lbFwiIGNsYXNzPVwiYWctcGFnaW5nLXJvdy1zdW1tYXJ5LXBhbmVsXCI+JyxcclxuICAgICc8c3BhbiBpZD1cImZpcnN0Um93T25QYWdlXCI+PC9zcGFuPicsXHJcbiAgICAnIHRvICcsXHJcbiAgICAnPHNwYW4gaWQ9XCJsYXN0Um93T25QYWdlXCI+PC9zcGFuPicsXHJcbiAgICAnIG9mICcsXHJcbiAgICAnPHNwYW4gaWQ9XCJyZWNvcmRDb3VudFwiPjwvc3Bhbj4nLFxyXG4gICAgJzwvc3Bhbj4nLFxyXG4gICAgJzxzcGFuIGNsYXM9XCJhZy1wYWdpbmctcGFnZS1zdW1tYXJ5LXBhbmVsXCI+JyxcclxuICAgICc8YnV0dG9uIGNsYXNzPVwiYWctcGFnaW5nLWJ1dHRvblwiIGlkPVwiYnRGaXJzdFwiPkZpcnN0PC9idXR0b24+JyxcclxuICAgICc8YnV0dG9uIGNsYXNzPVwiYWctcGFnaW5nLWJ1dHRvblwiIGlkPVwiYnRQcmV2aW91c1wiPlByZXZpb3VzPC9idXR0b24+JyxcclxuICAgICcgUGFnZSAnLFxyXG4gICAgJzxzcGFuIGlkPVwiY3VycmVudFwiPjwvc3Bhbj4nLFxyXG4gICAgJyBvZiAnLFxyXG4gICAgJzxzcGFuIGlkPVwidG90YWxcIj48L3NwYW4+JyxcclxuICAgICc8YnV0dG9uIGNsYXNzPVwiYWctcGFnaW5nLWJ1dHRvblwiIGlkPVwiYnROZXh0XCI+TmV4dDwvYnV0dG9uPicsXHJcbiAgICAnPGJ1dHRvbiBjbGFzcz1cImFnLXBhZ2luZy1idXR0b25cIiBpZD1cImJ0TGFzdFwiPkxhc3Q8L2J1dHRvbj4nLFxyXG4gICAgJzwvc3Bhbj4nXHJcbl0uam9pbignJyk7XHJcblxyXG5mdW5jdGlvbiBQYWdpbmF0aW9uQ29udHJvbGxlcigpIHt9XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGVQYWdpbmdQYW5lbCwgYW5ndWxhckdyaWQpIHtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZDtcclxuICAgIHRoaXMucG9wdWxhdGVQYW5lbChlUGFnaW5nUGFuZWwpO1xyXG4gICAgdGhpcy5jYWxsVmVyc2lvbiA9IDA7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuc2V0RGF0YXNvdXJjZSA9IGZ1bmN0aW9uKGRhdGFzb3VyY2UpIHtcclxuICAgIHRoaXMuZGF0YXNvdXJjZSA9IGRhdGFzb3VyY2U7XHJcblxyXG4gICAgaWYgKCFkYXRhc291cmNlKSB7XHJcbiAgICAgICAgLy8gb25seSBjb250aW51ZSBpZiB3ZSBoYXZlIGEgdmFsaWQgZGF0YXNvdXJjZSB0byB3b3JrIHdpdGhcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZXNldCgpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBjb3B5IHBhZ2VTaXplLCB0byBndWFyZCBhZ2FpbnN0IGl0IGNoYW5naW5nIHRoZSB0aGUgZGF0YXNvdXJjZSBiZXR3ZWVuIGNhbGxzXHJcbiAgICB0aGlzLnBhZ2VTaXplID0gdGhpcy5kYXRhc291cmNlLnBhZ2VTaXplO1xyXG4gICAgLy8gc2VlIGlmIHdlIGtub3cgdGhlIHRvdGFsIG51bWJlciBvZiBwYWdlcywgb3IgaWYgaXQncyAndG8gYmUgZGVjaWRlZCdcclxuICAgIGlmICh0eXBlb2YgdGhpcy5kYXRhc291cmNlLnJvd0NvdW50ID09PSAnbnVtYmVyJyAmJiB0aGlzLmRhdGFzb3VyY2Uucm93Q291bnQgPj0gMCkge1xyXG4gICAgICAgIHRoaXMucm93Q291bnQgPSB0aGlzLmRhdGFzb3VyY2Uucm93Q291bnQ7XHJcbiAgICAgICAgdGhpcy5mb3VuZE1heFJvdyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVUb3RhbFBhZ2VzKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMucm93Q291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuZm91bmRNYXhSb3cgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnRvdGFsUGFnZXMgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY3VycmVudFBhZ2UgPSAwO1xyXG5cclxuICAgIC8vIGhpZGUgdGhlIHN1bW1hcnkgcGFuZWwgdW50aWwgc29tZXRoaW5nIGlzIGxvYWRlZFxyXG4gICAgdGhpcy5lUGFnZVJvd1N1bW1hcnlQYW5lbC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XHJcblxyXG4gICAgdGhpcy5zZXRUb3RhbExhYmVscygpO1xyXG4gICAgdGhpcy5sb2FkUGFnZSgpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnNldFRvdGFsTGFiZWxzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5mb3VuZE1heFJvdykge1xyXG4gICAgICAgIHRoaXMubGJUb3RhbC5pbm5lckhUTUwgPSB0aGlzLnRvdGFsUGFnZXMudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgICAgICB0aGlzLmxiUmVjb3JkQ291bnQuaW5uZXJIVE1MID0gdGhpcy5yb3dDb3VudC50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmxiVG90YWwuaW5uZXJIVE1MID0gJ21vcmUnO1xyXG4gICAgICAgIHRoaXMubGJSZWNvcmRDb3VudC5pbm5lckhUTUwgPSAnbW9yZSc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuY2FsY3VsYXRlVG90YWxQYWdlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy50b3RhbFBhZ2VzID0gTWF0aC5mbG9vcigodGhpcy5yb3dDb3VudCAtIDEpIC8gdGhpcy5wYWdlU2l6ZSkgKyAxO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnBhZ2VMb2FkZWQgPSBmdW5jdGlvbihyb3dzLCBsYXN0Um93SW5kZXgpIHtcclxuICAgIHZhciBmaXJzdElkID0gdGhpcy5jdXJyZW50UGFnZSAqIHRoaXMucGFnZVNpemU7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkLnNldFJvd3Mocm93cywgZmlyc3RJZCk7XHJcbiAgICAvLyBzZWUgaWYgd2UgaGl0IHRoZSBsYXN0IHJvd1xyXG4gICAgaWYgKCF0aGlzLmZvdW5kTWF4Um93ICYmIHR5cGVvZiBsYXN0Um93SW5kZXggPT09ICdudW1iZXInICYmIGxhc3RSb3dJbmRleCA+PSAwKSB7XHJcbiAgICAgICAgdGhpcy5mb3VuZE1heFJvdyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5yb3dDb3VudCA9IGxhc3RSb3dJbmRleDtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsUGFnZXMoKTtcclxuICAgICAgICB0aGlzLnNldFRvdGFsTGFiZWxzKCk7XHJcblxyXG4gICAgICAgIC8vIGlmIG92ZXJzaG90IHBhZ2VzLCBnbyBiYWNrXHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFBhZ2UgPiB0aGlzLnRvdGFsUGFnZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IHRoaXMudG90YWxQYWdlcyAtIDE7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZFBhZ2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmVuYWJsZU9yRGlzYWJsZUJ1dHRvbnMoKTtcclxuICAgIHRoaXMudXBkYXRlUm93TGFiZWxzKCk7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlUm93TGFiZWxzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc3RhcnRSb3cgPSAodGhpcy5wYWdlU2l6ZSAqIHRoaXMuY3VycmVudFBhZ2UpICsgMTtcclxuICAgIHZhciBlbmRSb3cgPSBzdGFydFJvdyArIHRoaXMucGFnZVNpemUgLSAxO1xyXG4gICAgaWYgKHRoaXMuZm91bmRNYXhSb3cgJiYgZW5kUm93ID4gdGhpcy5yb3dDb3VudCkge1xyXG4gICAgICAgIGVuZFJvdyA9IHRoaXMucm93Q291bnQ7XHJcbiAgICB9XHJcbiAgICB0aGlzLmxiRmlyc3RSb3dPblBhZ2UuaW5uZXJIVE1MID0gKHN0YXJ0Um93KS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgdGhpcy5sYkxhc3RSb3dPblBhZ2UuaW5uZXJIVE1MID0gKGVuZFJvdykudG9Mb2NhbGVTdHJpbmcoKTtcclxuXHJcbiAgICAvLyBzaG93IHRoZSBzdW1tYXJ5IHBhbmVsLCB3aGVuIGZpcnN0IHNob3duLCB0aGlzIGlzIGJsYW5rXHJcbiAgICB0aGlzLmVQYWdlUm93U3VtbWFyeVBhbmVsLnN0eWxlLnZpc2liaWxpdHkgPSBudWxsO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmxvYWRQYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVuYWJsZU9yRGlzYWJsZUJ1dHRvbnMoKTtcclxuICAgIHZhciBzdGFydFJvdyA9IHRoaXMuY3VycmVudFBhZ2UgKiB0aGlzLmRhdGFzb3VyY2UucGFnZVNpemU7XHJcbiAgICB2YXIgZW5kUm93ID0gKHRoaXMuY3VycmVudFBhZ2UgKyAxKSAqIHRoaXMuZGF0YXNvdXJjZS5wYWdlU2l6ZTtcclxuXHJcbiAgICB0aGlzLmxiQ3VycmVudC5pbm5lckhUTUwgPSAodGhpcy5jdXJyZW50UGFnZSArIDEpLnRvTG9jYWxlU3RyaW5nKCk7XHJcblxyXG4gICAgdGhpcy5jYWxsVmVyc2lvbisrO1xyXG4gICAgdmFyIGNhbGxWZXJzaW9uQ29weSA9IHRoaXMuY2FsbFZlcnNpb247XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkLnNob3dMb2FkaW5nUGFuZWwodHJ1ZSk7XHJcbiAgICB0aGlzLmRhdGFzb3VyY2UuZ2V0Um93cyhzdGFydFJvdywgZW5kUm93LFxyXG4gICAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3Mocm93cywgbGFzdFJvd0luZGV4KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGF0LmlzQ2FsbERhZW1vbihjYWxsVmVyc2lvbkNvcHkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhhdC5wYWdlTG9hZGVkKHJvd3MsIGxhc3RSb3dJbmRleCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmdW5jdGlvbiBmYWlsKCkge1xyXG4gICAgICAgICAgICBpZiAodGhhdC5pc0NhbGxEYWVtb24oY2FsbFZlcnNpb25Db3B5KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHNldCBpbiBhbiBlbXB0eSBzZXQgb2Ygcm93cywgdGhpcyB3aWxsIGF0XHJcbiAgICAgICAgICAgIC8vIGxlYXN0IGdldCByaWQgb2YgdGhlIGxvYWRpbmcgcGFuZWwsIGFuZFxyXG4gICAgICAgICAgICAvLyBzdG9wIGJsb2NraW5nIHRoaW5nc1xyXG4gICAgICAgICAgICB0aGF0LmFuZ3VsYXJHcmlkLnNldFJvd3MoW10pO1xyXG4gICAgICAgIH1cclxuICAgICk7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuaXNDYWxsRGFlbW9uID0gZnVuY3Rpb24odmVyc2lvbkNvcHkpIHtcclxuICAgIHJldHVybiB2ZXJzaW9uQ29weSAhPT0gdGhpcy5jYWxsVmVyc2lvbjtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5vbkJ0TmV4dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdXJyZW50UGFnZSsrO1xyXG4gICAgdGhpcy5sb2FkUGFnZSgpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLm9uQnRQcmV2aW91cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdXJyZW50UGFnZS0tO1xyXG4gICAgdGhpcy5sb2FkUGFnZSgpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLm9uQnRGaXJzdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdXJyZW50UGFnZSA9IDA7XHJcbiAgICB0aGlzLmxvYWRQYWdlKCk7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUub25CdExhc3QgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY3VycmVudFBhZ2UgPSB0aGlzLnRvdGFsUGFnZXMgLSAxO1xyXG4gICAgdGhpcy5sb2FkUGFnZSgpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmVuYWJsZU9yRGlzYWJsZUJ1dHRvbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBkaXNhYmxlUHJldmlvdXNBbmRGaXJzdCA9IHRoaXMuY3VycmVudFBhZ2UgPT09IDA7XHJcbiAgICB0aGlzLmJ0UHJldmlvdXMuZGlzYWJsZWQgPSBkaXNhYmxlUHJldmlvdXNBbmRGaXJzdDtcclxuICAgIHRoaXMuYnRGaXJzdC5kaXNhYmxlZCA9IGRpc2FibGVQcmV2aW91c0FuZEZpcnN0O1xyXG5cclxuICAgIHZhciBkaXNhYmxlTmV4dCA9IHRoaXMuZm91bmRNYXhSb3cgJiYgdGhpcy5jdXJyZW50UGFnZSA9PT0gKHRoaXMudG90YWxQYWdlcyAtIDEpO1xyXG4gICAgdGhpcy5idE5leHQuZGlzYWJsZWQgPSBkaXNhYmxlTmV4dDtcclxuXHJcbiAgICB2YXIgZGlzYWJsZUxhc3QgPSAhdGhpcy5mb3VuZE1heFJvdyB8fCB0aGlzLmN1cnJlbnRQYWdlID09PSAodGhpcy50b3RhbFBhZ2VzIC0gMSk7XHJcbiAgICB0aGlzLmJ0TGFzdC5kaXNhYmxlZCA9IGRpc2FibGVMYXN0O1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnBvcHVsYXRlUGFuZWwgPSBmdW5jdGlvbihlUGFnaW5nUGFuZWwpIHtcclxuXHJcbiAgICBlUGFnaW5nUGFuZWwuaW5uZXJIVE1MID0gVEVNUExBVEU7XHJcblxyXG4gICAgdGhpcy5idE5leHQgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI2J0TmV4dCcpO1xyXG4gICAgdGhpcy5idFByZXZpb3VzID0gZVBhZ2luZ1BhbmVsLnF1ZXJ5U2VsZWN0b3IoJyNidFByZXZpb3VzJyk7XHJcbiAgICB0aGlzLmJ0Rmlyc3QgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI2J0Rmlyc3QnKTtcclxuICAgIHRoaXMuYnRMYXN0ID0gZVBhZ2luZ1BhbmVsLnF1ZXJ5U2VsZWN0b3IoJyNidExhc3QnKTtcclxuICAgIHRoaXMubGJDdXJyZW50ID0gZVBhZ2luZ1BhbmVsLnF1ZXJ5U2VsZWN0b3IoJyNjdXJyZW50Jyk7XHJcbiAgICB0aGlzLmxiVG90YWwgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI3RvdGFsJyk7XHJcblxyXG4gICAgdGhpcy5sYlJlY29yZENvdW50ID0gZVBhZ2luZ1BhbmVsLnF1ZXJ5U2VsZWN0b3IoJyNyZWNvcmRDb3VudCcpO1xyXG4gICAgdGhpcy5sYkZpcnN0Um93T25QYWdlID0gZVBhZ2luZ1BhbmVsLnF1ZXJ5U2VsZWN0b3IoJyNmaXJzdFJvd09uUGFnZScpO1xyXG4gICAgdGhpcy5sYkxhc3RSb3dPblBhZ2UgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI2xhc3RSb3dPblBhZ2UnKTtcclxuICAgIHRoaXMuZVBhZ2VSb3dTdW1tYXJ5UGFuZWwgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI3BhZ2VSb3dTdW1tYXJ5UGFuZWwnKTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgdGhpcy5idE5leHQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGF0Lm9uQnROZXh0KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmJ0UHJldmlvdXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGF0Lm9uQnRQcmV2aW91cygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5idEZpcnN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhhdC5vbkJ0Rmlyc3QoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYnRMYXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhhdC5vbkJ0TGFzdCgpO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhZ2luYXRpb25Db250cm9sbGVyO1xyXG4iLCJ2YXIgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcclxudmFyIFN2Z0ZhY3RvcnkgPSByZXF1aXJlKCcuL3N2Z0ZhY3RvcnknKTtcclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG5cclxudmFyIHN2Z0ZhY3RvcnkgPSBuZXcgU3ZnRmFjdG9yeSgpO1xyXG5cclxudmFyIFRBQl9LRVkgPSA5O1xyXG52YXIgRU5URVJfS0VZID0gMTM7XHJcblxyXG5mdW5jdGlvbiBSb3dSZW5kZXJlcigpIHt9XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGdyaWRPcHRpb25zLCBjb2x1bW5Nb2RlbCwgZ3JpZE9wdGlvbnNXcmFwcGVyLCBlR3JpZCxcclxuICAgIGFuZ3VsYXJHcmlkLCBzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnksICRjb21waWxlLCAkc2NvcGUsXHJcbiAgICBzZWxlY3Rpb25Db250cm9sbGVyLCBleHByZXNzaW9uU2VydmljZSwgdGVtcGxhdGVTZXJ2aWNlKSB7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zID0gZ3JpZE9wdGlvbnM7XHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsID0gY29sdW1uTW9kZWw7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZDtcclxuICAgIHRoaXMuc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5ID0gc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5O1xyXG4gICAgdGhpcy5maW5kQWxsRWxlbWVudHMoZUdyaWQpO1xyXG4gICAgdGhpcy4kY29tcGlsZSA9ICRjb21waWxlO1xyXG4gICAgdGhpcy4kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIgPSBzZWxlY3Rpb25Db250cm9sbGVyO1xyXG4gICAgdGhpcy5leHByZXNzaW9uU2VydmljZSA9IGV4cHJlc3Npb25TZXJ2aWNlO1xyXG4gICAgdGhpcy50ZW1wbGF0ZVNlcnZpY2UgPSB0ZW1wbGF0ZVNlcnZpY2U7XHJcblxyXG4gICAgLy8gbWFwIG9mIHJvdyBpZHMgdG8gcm93IG9iamVjdHMuIGtlZXBzIHRyYWNrIG9mIHdoaWNoIGVsZW1lbnRzXHJcbiAgICAvLyBhcmUgcmVuZGVyZWQgZm9yIHdoaWNoIHJvd3MgaW4gdGhlIGRvbS4gZWFjaCByb3cgb2JqZWN0IGhhczpcclxuICAgIC8vIFtzY29wZSwgYm9keVJvdywgcGlubmVkUm93LCByb3dEYXRhXVxyXG4gICAgdGhpcy5yZW5kZXJlZFJvd3MgPSB7fTtcclxuXHJcbiAgICB0aGlzLnJlbmRlcmVkUm93U3RhcnRFZGl0aW5nTGlzdGVuZXJzID0ge307XHJcblxyXG4gICAgdGhpcy5lZGl0aW5nQ2VsbCA9IGZhbHNlOyAvL2dldHMgc2V0IHRvIHRydWUgd2hlbiBlZGl0aW5nIGEgY2VsbFxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnNldFJvd01vZGVsID0gZnVuY3Rpb24ocm93TW9kZWwpIHtcclxuICAgIHRoaXMucm93TW9kZWwgPSByb3dNb2RlbDtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zZXRNYWluUm93V2lkdGhzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbWFpblJvd1dpZHRoID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRCb2R5Q29udGFpbmVyV2lkdGgoKSArIFwicHhcIjtcclxuXHJcbiAgICB2YXIgdW5waW5uZWRSb3dzID0gdGhpcy5lQm9keUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiLmFnLXJvd1wiKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdW5waW5uZWRSb3dzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdW5waW5uZWRSb3dzW2ldLnN0eWxlLndpZHRoID0gbWFpblJvd1dpZHRoO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmZpbmRBbGxFbGVtZW50cyA9IGZ1bmN0aW9uKGVHcmlkKSB7XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgdGhpcy5lQm9keUNvbnRhaW5lciA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keS1jb250YWluZXJcIik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZUJvZHlDb250YWluZXIgPSBlR3JpZC5xdWVyeVNlbGVjdG9yKFwiLmFnLWJvZHktY29udGFpbmVyXCIpO1xyXG4gICAgICAgIHRoaXMuZUJvZHlWaWV3cG9ydCA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keS12aWV3cG9ydFwiKTtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyID0gZUdyaWQucXVlcnlTZWxlY3RvcihcIi5hZy1waW5uZWQtY29scy1jb250YWluZXJcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUucmVmcmVzaFZpZXcgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgdmFyIHJvd0NvdW50ID0gdGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93Q291bnQoKTtcclxuICAgICAgICB2YXIgY29udGFpbmVySGVpZ2h0ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93SGVpZ2h0KCkgKiByb3dDb3VudDtcclxuICAgICAgICB0aGlzLmVCb2R5Q29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGNvbnRhaW5lckhlaWdodCArIFwicHhcIjtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGNvbnRhaW5lckhlaWdodCArIFwicHhcIjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlZnJlc2hBbGxWaXJ0dWFsUm93cygpO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnNvZnRSZWZyZXNoVmlldyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBmaXJzdCA9IHRoaXMuZmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3c7XHJcbiAgICB2YXIgbGFzdCA9IHRoaXMubGFzdFZpcnR1YWxSZW5kZXJlZFJvdztcclxuXHJcbiAgICB2YXIgY29sdW1ucyA9IHRoaXMuY29sdW1uTW9kZWwuZ2V0VmlzaWJsZUNvbHVtbnMoKTtcclxuICAgIC8vIGlmIG5vIGNvbHMsIGRvbid0IGRyYXcgcm93XHJcbiAgICBpZiAoIWNvbHVtbnMgfHwgY29sdW1ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgcm93SW5kZXggPSBmaXJzdDsgcm93SW5kZXggPD0gbGFzdDsgcm93SW5kZXgrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gdGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93KHJvd0luZGV4KTtcclxuICAgICAgICBpZiAobm9kZSkge1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgY29sSW5kZXggPSAwOyBjb2xJbmRleCA8PSBjb2x1bW5zLmxlbmd0aDsgY29sSW5kZXgrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbHVtbiA9IGNvbHVtbnNbY29sSW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlbmRlcmVkUm93ID0gdGhpcy5yZW5kZXJlZFJvd3Nbcm93SW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgdmFyIGVHcmlkQ2VsbCA9IHJlbmRlcmVkUm93LmVWb2xhdGlsZUNlbGxzW2NvbEluZGV4XTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWVHcmlkQ2VsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpc0ZpcnN0Q29sdW1uID0gY29sSW5kZXggPT09IDA7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2NvcGUgPSByZW5kZXJlZFJvdy5zY29wZTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNvZnRSZWZyZXNoQ2VsbChlR3JpZENlbGwsIGlzRmlyc3RDb2x1bW4sIG5vZGUsIGNvbHVtbiwgc2NvcGUsIHJvd0luZGV4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zb2Z0UmVmcmVzaENlbGwgPSBmdW5jdGlvbihlR3JpZENlbGwsIGlzRmlyc3RDb2x1bW4sIG5vZGUsIGNvbHVtbiwgc2NvcGUsIHJvd0luZGV4KSB7XHJcblxyXG4gICAgdXRpbHMucmVtb3ZlQWxsQ2hpbGRyZW4oZUdyaWRDZWxsKTtcclxuXHJcbiAgICB2YXIgZGF0YSA9IHRoaXMuZ2V0RGF0YUZvck5vZGUobm9kZSk7XHJcbiAgICB2YXIgdmFsdWVHZXR0ZXIgPSB0aGlzLmNyZWF0ZVZhbHVlR2V0dGVyKGRhdGEsIGNvbHVtbi5jb2xEZWYsIG5vZGUpO1xyXG5cclxuICAgIHZhciB2YWx1ZTtcclxuICAgIGlmICh2YWx1ZUdldHRlcikge1xyXG4gICAgICAgIHZhbHVlID0gdmFsdWVHZXR0ZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnBvcHVsYXRlQW5kU3R5bGVHcmlkQ2VsbCh2YWx1ZUdldHRlciwgdmFsdWUsIGVHcmlkQ2VsbCwgaXNGaXJzdENvbHVtbiwgbm9kZSwgY29sdW1uLCByb3dJbmRleCwgc2NvcGUpO1xyXG5cclxuICAgIC8vIGlmIGFuZ3VsYXIgY29tcGlsaW5nLCB0aGVuIG5lZWQgdG8gYWxzbyBjb21waWxlIHRoZSBjZWxsIGFnYWluIChhbmd1bGFyIGNvbXBpbGluZyBzdWNrcywgcGxlYXNlIHdhaXQuLi4pXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNBbmd1bGFyQ29tcGlsZVJvd3MoKSkge1xyXG4gICAgICAgIHRoaXMuJGNvbXBpbGUoZUdyaWRDZWxsKShzY29wZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUucm93RGF0YUNoYW5nZWQgPSBmdW5jdGlvbihyb3dzKSB7XHJcbiAgICAvLyB3ZSBvbmx5IG5lZWQgdG8gYmUgd29ycmllZCBhYm91dCByZW5kZXJlZCByb3dzLCBhcyB0aGlzIG1ldGhvZCBpc1xyXG4gICAgLy8gY2FsbGVkIHRvIHdoYXRzIHJlbmRlcmVkLiBpZiB0aGUgcm93IGlzbid0IHJlbmRlcmVkLCB3ZSBkb24ndCBjYXJlXHJcbiAgICB2YXIgaW5kZXhlc1RvUmVtb3ZlID0gW107XHJcbiAgICB2YXIgcmVuZGVyZWRSb3dzID0gdGhpcy5yZW5kZXJlZFJvd3M7XHJcbiAgICBPYmplY3Qua2V5cyhyZW5kZXJlZFJvd3MpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgdmFyIHJlbmRlcmVkUm93ID0gcmVuZGVyZWRSb3dzW2tleV07XHJcbiAgICAgICAgLy8gc2VlIGlmIHRoZSByZW5kZXJlZCByb3cgaXMgaW4gdGhlIGxpc3Qgb2Ygcm93cyB3ZSBoYXZlIHRvIHVwZGF0ZVxyXG4gICAgICAgIHZhciByb3dOZWVkc1VwZGF0aW5nID0gcm93cy5pbmRleE9mKHJlbmRlcmVkUm93Lm5vZGUuZGF0YSkgPj0gMDtcclxuICAgICAgICBpZiAocm93TmVlZHNVcGRhdGluZykge1xyXG4gICAgICAgICAgICBpbmRleGVzVG9SZW1vdmUucHVzaChrZXkpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgLy8gcmVtb3ZlIHRoZSByb3dzXHJcbiAgICB0aGlzLnJlbW92ZVZpcnR1YWxSb3dzKGluZGV4ZXNUb1JlbW92ZSk7XHJcbiAgICAvLyBhZGQgZHJhdyB0aGVtIGFnYWluXHJcbiAgICB0aGlzLmRyYXdWaXJ0dWFsUm93cygpO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnJlZnJlc2hBbGxWaXJ0dWFsUm93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gcmVtb3ZlIGFsbCBjdXJyZW50IHZpcnR1YWwgcm93cywgYXMgdGhleSBoYXZlIG9sZCBkYXRhXHJcbiAgICB2YXIgcm93c1RvUmVtb3ZlID0gT2JqZWN0LmtleXModGhpcy5yZW5kZXJlZFJvd3MpO1xyXG4gICAgdGhpcy5yZW1vdmVWaXJ0dWFsUm93cyhyb3dzVG9SZW1vdmUpO1xyXG5cclxuICAgIC8vIGFkZCBpbiBuZXcgcm93c1xyXG4gICAgdGhpcy5kcmF3VmlydHVhbFJvd3MoKTtcclxufTtcclxuXHJcbi8vIHB1YmxpYyAtIHJlbW92ZXMgdGhlIGdyb3VwIHJvd3MgYW5kIHRoZW4gcmVkcmF3cyB0aGVtIGFnYWluXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5yZWZyZXNoR3JvdXBSb3dzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBmaW5kIGFsbCB0aGUgZ3JvdXAgcm93c1xyXG4gICAgdmFyIHJvd3NUb1JlbW92ZSA9IFtdO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgT2JqZWN0LmtleXModGhpcy5yZW5kZXJlZFJvd3MpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgdmFyIHJlbmRlcmVkUm93ID0gdGhhdC5yZW5kZXJlZFJvd3Nba2V5XTtcclxuICAgICAgICB2YXIgbm9kZSA9IHJlbmRlcmVkUm93Lm5vZGU7XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgcm93c1RvUmVtb3ZlLnB1c2goa2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIC8vIHJlbW92ZSB0aGUgcm93c1xyXG4gICAgdGhpcy5yZW1vdmVWaXJ0dWFsUm93cyhyb3dzVG9SZW1vdmUpO1xyXG4gICAgLy8gYW5kIGRyYXcgdGhlbSBiYWNrIGFnYWluXHJcbiAgICB0aGlzLmVuc3VyZVJvd3NSZW5kZXJlZCgpO1xyXG59O1xyXG5cclxuLy8gdGFrZXMgYXJyYXkgb2Ygcm93IGluZGV4ZXNcclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnJlbW92ZVZpcnR1YWxSb3dzID0gZnVuY3Rpb24ocm93c1RvUmVtb3ZlKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICByb3dzVG9SZW1vdmUuZm9yRWFjaChmdW5jdGlvbihpbmRleFRvUmVtb3ZlKSB7XHJcbiAgICAgICAgdGhhdC5yZW1vdmVWaXJ0dWFsUm93KGluZGV4VG9SZW1vdmUpO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUucmVtb3ZlVmlydHVhbFJvdyA9IGZ1bmN0aW9uKGluZGV4VG9SZW1vdmUpIHtcclxuICAgIHZhciByZW5kZXJlZFJvdyA9IHRoaXMucmVuZGVyZWRSb3dzW2luZGV4VG9SZW1vdmVdO1xyXG4gICAgaWYgKHJlbmRlcmVkUm93LnBpbm5lZEVsZW1lbnQgJiYgdGhpcy5lUGlubmVkQ29sc0NvbnRhaW5lcikge1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIucmVtb3ZlQ2hpbGQocmVuZGVyZWRSb3cucGlubmVkRWxlbWVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlbmRlcmVkUm93LmJvZHlFbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5lQm9keUNvbnRhaW5lci5yZW1vdmVDaGlsZChyZW5kZXJlZFJvdy5ib2R5RWxlbWVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlbmRlcmVkUm93LnNjb3BlKSB7XHJcbiAgICAgICAgcmVuZGVyZWRSb3cuc2NvcGUuJGRlc3Ryb3koKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0VmlydHVhbFJvd1JlbW92ZWQoKSkge1xyXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFZpcnR1YWxSb3dSZW1vdmVkKCkocmVuZGVyZWRSb3cuZGF0YSwgaW5kZXhUb1JlbW92ZSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkLm9uVmlydHVhbFJvd1JlbW92ZWQoaW5kZXhUb1JlbW92ZSk7XHJcblxyXG4gICAgZGVsZXRlIHRoaXMucmVuZGVyZWRSb3dzW2luZGV4VG9SZW1vdmVdO1xyXG4gICAgZGVsZXRlIHRoaXMucmVuZGVyZWRSb3dTdGFydEVkaXRpbmdMaXN0ZW5lcnNbaW5kZXhUb1JlbW92ZV07XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuZHJhd1ZpcnR1YWxSb3dzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZmlyc3Q7XHJcbiAgICB2YXIgbGFzdDtcclxuXHJcbiAgICB2YXIgcm93Q291bnQgPSB0aGlzLnJvd01vZGVsLmdldFZpcnR1YWxSb3dDb3VudCgpO1xyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0RvbnRVc2VTY3JvbGxzKCkpIHtcclxuICAgICAgICBmaXJzdCA9IDA7XHJcbiAgICAgICAgbGFzdCA9IHJvd0NvdW50O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgdG9wUGl4ZWwgPSB0aGlzLmVCb2R5Vmlld3BvcnQuc2Nyb2xsVG9wO1xyXG4gICAgICAgIHZhciBib3R0b21QaXhlbCA9IHRvcFBpeGVsICsgdGhpcy5lQm9keVZpZXdwb3J0Lm9mZnNldEhlaWdodDtcclxuXHJcbiAgICAgICAgZmlyc3QgPSBNYXRoLmZsb29yKHRvcFBpeGVsIC8gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93SGVpZ2h0KCkpO1xyXG4gICAgICAgIGxhc3QgPSBNYXRoLmZsb29yKGJvdHRvbVBpeGVsIC8gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93SGVpZ2h0KCkpO1xyXG5cclxuICAgICAgICAvL2FkZCBpbiBidWZmZXJcclxuICAgICAgICB2YXIgYnVmZmVyID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93QnVmZmVyKCkgfHwgY29uc3RhbnRzLlJPV19CVUZGRVJfU0laRTtcclxuICAgICAgICBmaXJzdCA9IGZpcnN0IC0gYnVmZmVyO1xyXG4gICAgICAgIGxhc3QgPSBsYXN0ICsgYnVmZmVyO1xyXG5cclxuICAgICAgICAvLyBhZGp1c3QsIGluIGNhc2UgYnVmZmVyIGV4dGVuZGVkIGFjdHVhbCBzaXplXHJcbiAgICAgICAgaWYgKGZpcnN0IDwgMCkge1xyXG4gICAgICAgICAgICBmaXJzdCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChsYXN0ID4gcm93Q291bnQgLSAxKSB7XHJcbiAgICAgICAgICAgIGxhc3QgPSByb3dDb3VudCAtIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3cgPSBmaXJzdDtcclxuICAgIHRoaXMubGFzdFZpcnR1YWxSZW5kZXJlZFJvdyA9IGxhc3Q7XHJcblxyXG4gICAgdGhpcy5lbnN1cmVSb3dzUmVuZGVyZWQoKTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5nZXRGaXJzdFZpcnR1YWxSZW5kZXJlZFJvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3c7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuZ2V0TGFzdFZpcnR1YWxSZW5kZXJlZFJvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubGFzdFZpcnR1YWxSZW5kZXJlZFJvdztcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5lbnN1cmVSb3dzUmVuZGVyZWQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgbWFpblJvd1dpZHRoID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRCb2R5Q29udGFpbmVyV2lkdGgoKTtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAvLyBhdCB0aGUgZW5kLCB0aGlzIGFycmF5IHdpbGwgY29udGFpbiB0aGUgaXRlbXMgd2UgbmVlZCB0byByZW1vdmVcclxuICAgIHZhciByb3dzVG9SZW1vdmUgPSBPYmplY3Qua2V5cyh0aGlzLnJlbmRlcmVkUm93cyk7XHJcblxyXG4gICAgLy8gYWRkIGluIG5ldyByb3dzXHJcbiAgICBmb3IgKHZhciByb3dJbmRleCA9IHRoaXMuZmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3c7IHJvd0luZGV4IDw9IHRoaXMubGFzdFZpcnR1YWxSZW5kZXJlZFJvdzsgcm93SW5kZXgrKykge1xyXG4gICAgICAgIC8vIHNlZSBpZiBpdGVtIGFscmVhZHkgdGhlcmUsIGFuZCBpZiB5ZXMsIHRha2UgaXQgb3V0IG9mIHRoZSAndG8gcmVtb3ZlJyBhcnJheVxyXG4gICAgICAgIGlmIChyb3dzVG9SZW1vdmUuaW5kZXhPZihyb3dJbmRleC50b1N0cmluZygpKSA+PSAwKSB7XHJcbiAgICAgICAgICAgIHJvd3NUb1JlbW92ZS5zcGxpY2Uocm93c1RvUmVtb3ZlLmluZGV4T2Yocm93SW5kZXgudG9TdHJpbmcoKSksIDEpO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY2hlY2sgdGhpcyByb3cgYWN0dWFsbHkgZXhpc3RzIChpbiBjYXNlIG92ZXJmbG93IGJ1ZmZlciB3aW5kb3cgZXhjZWVkcyByZWFsIGRhdGEpXHJcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnJvd01vZGVsLmdldFZpcnR1YWxSb3cocm93SW5kZXgpO1xyXG4gICAgICAgIGlmIChub2RlKSB7XHJcbiAgICAgICAgICAgIHRoYXQuaW5zZXJ0Um93KG5vZGUsIHJvd0luZGV4LCBtYWluUm93V2lkdGgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBhdCB0aGlzIHBvaW50LCBldmVyeXRoaW5nIGluIG91ciAncm93c1RvUmVtb3ZlJyAuIC4gLlxyXG4gICAgdGhpcy5yZW1vdmVWaXJ0dWFsUm93cyhyb3dzVG9SZW1vdmUpO1xyXG5cclxuICAgIC8vIGlmIHdlIGFyZSBkb2luZyBhbmd1bGFyIGNvbXBpbGluZywgdGhlbiBkbyBkaWdlc3QgdGhlIHNjb3BlIGhlcmVcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0FuZ3VsYXJDb21waWxlUm93cygpKSB7XHJcbiAgICAgICAgLy8gd2UgZG8gaXQgaW4gYSB0aW1lb3V0LCBpbiBjYXNlIHdlIGFyZSBhbHJlYWR5IGluIGFuIGFwcGx5XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuaW5zZXJ0Um93ID0gZnVuY3Rpb24obm9kZSwgcm93SW5kZXgsIG1haW5Sb3dXaWR0aCkge1xyXG4gICAgdmFyIGNvbHVtbnMgPSB0aGlzLmNvbHVtbk1vZGVsLmdldFZpc2libGVDb2x1bW5zKCk7XHJcbiAgICAvLyBpZiBubyBjb2xzLCBkb24ndCBkcmF3IHJvd1xyXG4gICAgaWYgKCFjb2x1bW5zIHx8IGNvbHVtbnMubGVuZ3RoID09IDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdmFyIHJvd0RhdGEgPSBub2RlLnJvd0RhdGE7XHJcbiAgICB2YXIgcm93SXNBR3JvdXAgPSBub2RlLmdyb3VwO1xyXG4gICAgdmFyIHJvd0lzQUZvb3RlciA9IG5vZGUuZm9vdGVyO1xyXG5cclxuICAgIHZhciBlUGlubmVkUm93ID0gdGhpcy5jcmVhdGVSb3dDb250YWluZXIocm93SW5kZXgsIG5vZGUsIHJvd0lzQUdyb3VwKTtcclxuICAgIHZhciBlTWFpblJvdyA9IHRoaXMuY3JlYXRlUm93Q29udGFpbmVyKHJvd0luZGV4LCBub2RlLCByb3dJc0FHcm91cCk7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgZU1haW5Sb3cuc3R5bGUud2lkdGggPSBtYWluUm93V2lkdGggKyBcInB4XCI7XHJcblxyXG4gICAgLy8gdHJ5IGNvbXBpbGluZyBhcyB3ZSBpbnNlcnQgcm93c1xyXG4gICAgdmFyIG5ld0NoaWxkU2NvcGUgPSB0aGlzLmNyZWF0ZUNoaWxkU2NvcGVPck51bGwobm9kZS5kYXRhKTtcclxuXHJcbiAgICB2YXIgcmVuZGVyZWRSb3cgPSB7XHJcbiAgICAgICAgc2NvcGU6IG5ld0NoaWxkU2NvcGUsXHJcbiAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgZVZvbGF0aWxlQ2VsbHM6IHt9XHJcbiAgICB9O1xyXG4gICAgdGhpcy5yZW5kZXJlZFJvd3Nbcm93SW5kZXhdID0gcmVuZGVyZWRSb3c7XHJcbiAgICB0aGlzLnJlbmRlcmVkUm93U3RhcnRFZGl0aW5nTGlzdGVuZXJzW3Jvd0luZGV4XSA9IHt9O1xyXG5cclxuICAgIC8vIGlmIGdyb3VwIGl0ZW0sIGluc2VydCB0aGUgZmlyc3Qgcm93XHJcbiAgICBpZiAocm93SXNBR3JvdXApIHtcclxuICAgICAgICB2YXIgZmlyc3RDb2x1bW4gPSBjb2x1bW5zWzBdO1xyXG4gICAgICAgIHZhciBncm91cEhlYWRlclRha2VzRW50aXJlUm93ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cFVzZUVudGlyZVJvdygpO1xyXG5cclxuICAgICAgICB2YXIgZUdyb3VwUm93ID0gdGhhdC5jcmVhdGVHcm91cEVsZW1lbnQobm9kZSwgZmlyc3RDb2x1bW4sIGdyb3VwSGVhZGVyVGFrZXNFbnRpcmVSb3csIGZhbHNlLCByb3dJbmRleCwgcm93SXNBRm9vdGVyKTtcclxuICAgICAgICBpZiAoZmlyc3RDb2x1bW4ucGlubmVkKSB7XHJcbiAgICAgICAgICAgIGVQaW5uZWRSb3cuYXBwZW5kQ2hpbGQoZUdyb3VwUm93KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlTWFpblJvdy5hcHBlbmRDaGlsZChlR3JvdXBSb3cpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGZpcnN0Q29sdW1uLnBpbm5lZCAmJiBncm91cEhlYWRlclRha2VzRW50aXJlUm93KSB7XHJcbiAgICAgICAgICAgIHZhciBlR3JvdXBSb3dQYWRkaW5nID0gdGhhdC5jcmVhdGVHcm91cEVsZW1lbnQobm9kZSwgZmlyc3RDb2x1bW4sIGdyb3VwSGVhZGVyVGFrZXNFbnRpcmVSb3csIHRydWUsIHJvd0luZGV4LCByb3dJc0FGb290ZXIpO1xyXG4gICAgICAgICAgICBlTWFpblJvdy5hcHBlbmRDaGlsZChlR3JvdXBSb3dQYWRkaW5nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZ3JvdXBIZWFkZXJUYWtlc0VudGlyZVJvdykge1xyXG5cclxuICAgICAgICAgICAgLy8gZHJhdyBpbiBjZWxscyBmb3IgdGhlIHJlc3Qgb2YgdGhlIHJvdy5cclxuICAgICAgICAgICAgdmFyIGdyb3VwRGF0YSA9IHRoaXMuZ2V0RGF0YUZvck5vZGUobm9kZSk7XHJcblxyXG4gICAgICAgICAgICBjb2x1bW5zLmZvckVhY2goZnVuY3Rpb24oY29sdW1uLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7IC8vc2tpcCBmaXJzdCBjb2wsIGFzIHRoaXMgaXMgdGhlIGdyb3VwIGNvbCB3ZSBhbHJlYWR5IGluc2VydGVkXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlR2V0dGVyO1xyXG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlR2V0dGVyID0gdGhhdC5jcmVhdGVWYWx1ZUdldHRlcihncm91cERhdGEsIGNvbHVtbi5jb2xEZWYsIG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhhdC5jcmVhdGVDZWxsRnJvbUNvbERlZihmYWxzZSwgY29sdW1uLCB2YWx1ZUdldHRlciwgbm9kZSwgcm93SW5kZXgsIGVNYWluUm93LCBlUGlubmVkUm93LCBuZXdDaGlsZFNjb3BlLCByZW5kZXJlZFJvdyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgY29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbiwgaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIGZpcnN0Q29sID0gaW5kZXggPT09IDA7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhhdC5nZXREYXRhRm9yTm9kZShub2RlKTtcclxuICAgICAgICAgICAgdmFyIHZhbHVlR2V0dGVyID0gdGhhdC5jcmVhdGVWYWx1ZUdldHRlcihkYXRhLCBjb2x1bW4uY29sRGVmLCBub2RlKTtcclxuICAgICAgICAgICAgdGhhdC5jcmVhdGVDZWxsRnJvbUNvbERlZihmaXJzdENvbCwgY29sdW1uLCB2YWx1ZUdldHRlciwgbm9kZSwgcm93SW5kZXgsIGVNYWluUm93LCBlUGlubmVkUm93LCBuZXdDaGlsZFNjb3BlLCByZW5kZXJlZFJvdyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy90cnkgY29tcGlsaW5nIGFzIHdlIGluc2VydCByb3dzXHJcbiAgICByZW5kZXJlZFJvdy5waW5uZWRFbGVtZW50ID0gdGhpcy5jb21waWxlQW5kQWRkKHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIsIHJvd0luZGV4LCBlUGlubmVkUm93LCBuZXdDaGlsZFNjb3BlKTtcclxuICAgIHJlbmRlcmVkUm93LmJvZHlFbGVtZW50ID0gdGhpcy5jb21waWxlQW5kQWRkKHRoaXMuZUJvZHlDb250YWluZXIsIHJvd0luZGV4LCBlTWFpblJvdywgbmV3Q2hpbGRTY29wZSk7XHJcbn07XHJcblxyXG4vLyBpZiBncm91cCBpcyBhIGZvb3RlciwgYWx3YXlzIHNob3cgdGhlIGRhdGEuXHJcbi8vIGlmIGdyb3VwIGlzIGEgaGVhZGVyLCBvbmx5IHNob3cgZGF0YSBpZiBub3QgZXhwYW5kZWRcclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmdldERhdGFGb3JOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKG5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgLy8gaWYgZm9vdGVyLCB3ZSBhbHdheXMgc2hvdyB0aGUgZGF0YVxyXG4gICAgICAgIHJldHVybiBub2RlLmRhdGE7XHJcbiAgICB9IGVsc2UgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAvLyBpZiBoZWFkZXIgYW5kIGhlYWRlciBpcyBleHBhbmRlZCwgd2Ugc2hvdyBkYXRhIGluIGZvb3RlciBvbmx5XHJcbiAgICAgICAgdmFyIGZvb3RlcnNFbmFibGVkID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEluY2x1ZGVGb290ZXIoKTtcclxuICAgICAgICByZXR1cm4gKG5vZGUuZXhwYW5kZWQgJiYgZm9vdGVyc0VuYWJsZWQpID8gdW5kZWZpbmVkIDogbm9kZS5kYXRhO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvdGhlcndpc2UgaXQncyBhIG5vcm1hbCBub2RlLCBqdXN0IHJldHVybiBkYXRhIGFzIG5vcm1hbFxyXG4gICAgICAgIHJldHVybiBub2RlLmRhdGE7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlVmFsdWVHZXR0ZXIgPSBmdW5jdGlvbihkYXRhLCBjb2xEZWYsIG5vZGUpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXBpID0gdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKCk7XHJcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCk7XHJcbiAgICAgICAgcmV0dXJuIHV0aWxzLmdldFZhbHVlKHRoYXQuZXhwcmVzc2lvblNlcnZpY2UsIGRhdGEsIGNvbERlZiwgbm9kZSwgYXBpLCBjb250ZXh0KTtcclxuICAgIH07XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlQ2hpbGRTY29wZU9yTnVsbCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0FuZ3VsYXJDb21waWxlUm93cygpKSB7XHJcbiAgICAgICAgdmFyIG5ld0NoaWxkU2NvcGUgPSB0aGlzLiRzY29wZS4kbmV3KCk7XHJcbiAgICAgICAgbmV3Q2hpbGRTY29wZS5kYXRhID0gZGF0YTtcclxuICAgICAgICByZXR1cm4gbmV3Q2hpbGRTY29wZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY29tcGlsZUFuZEFkZCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgcm93SW5kZXgsIGVsZW1lbnQsIHNjb3BlKSB7XHJcbiAgICBpZiAoc2NvcGUpIHtcclxuICAgICAgICB2YXIgZUVsZW1lbnRDb21waWxlZCA9IHRoaXMuJGNvbXBpbGUoZWxlbWVudCkoc2NvcGUpO1xyXG4gICAgICAgIGlmIChjb250YWluZXIpIHsgLy8gY2hlY2tpbmcgY29udGFpbmVyLCBhcyBpZiBub1Njcm9sbCwgcGlubmVkIGNvbnRhaW5lciBpcyBtaXNzaW5nXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlRWxlbWVudENvbXBpbGVkWzBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGVFbGVtZW50Q29tcGlsZWRbMF07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChjb250YWluZXIpIHtcclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVDZWxsRnJvbUNvbERlZiA9IGZ1bmN0aW9uKGlzRmlyc3RDb2x1bW4sIGNvbHVtbiwgdmFsdWVHZXR0ZXIsIG5vZGUsIHJvd0luZGV4LCBlTWFpblJvdywgZVBpbm5lZFJvdywgJGNoaWxkU2NvcGUsIHJlbmRlcmVkUm93KSB7XHJcbiAgICB2YXIgZUdyaWRDZWxsID0gdGhpcy5jcmVhdGVDZWxsKGlzRmlyc3RDb2x1bW4sIGNvbHVtbiwgdmFsdWVHZXR0ZXIsIG5vZGUsIHJvd0luZGV4LCAkY2hpbGRTY29wZSk7XHJcblxyXG4gICAgaWYgKGNvbHVtbi5jb2xEZWYudm9sYXRpbGUpIHtcclxuICAgICAgICByZW5kZXJlZFJvdy5lVm9sYXRpbGVDZWxsc1tjb2x1bW4uY29sS2V5XSA9IGVHcmlkQ2VsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY29sdW1uLnBpbm5lZCkge1xyXG4gICAgICAgIGVQaW5uZWRSb3cuYXBwZW5kQ2hpbGQoZUdyaWRDZWxsKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZU1haW5Sb3cuYXBwZW5kQ2hpbGQoZUdyaWRDZWxsKTtcclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5hZGRDbGFzc2VzVG9Sb3cgPSBmdW5jdGlvbihyb3dJbmRleCwgbm9kZSwgZVJvdykge1xyXG4gICAgdmFyIGNsYXNzZXNMaXN0ID0gW1wiYWctcm93XCJdO1xyXG4gICAgY2xhc3Nlc0xpc3QucHVzaChyb3dJbmRleCAlIDIgPT0gMCA/IFwiYWctcm93LWV2ZW5cIiA6IFwiYWctcm93LW9kZFwiKTtcclxuXHJcbiAgICBpZiAodGhpcy5zZWxlY3Rpb25Db250cm9sbGVyLmlzTm9kZVNlbGVjdGVkKG5vZGUpKSB7XHJcbiAgICAgICAgY2xhc3Nlc0xpc3QucHVzaChcImFnLXJvdy1zZWxlY3RlZFwiKTtcclxuICAgIH1cclxuICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgLy8gaWYgYSBncm91cCwgcHV0IHRoZSBsZXZlbCBvZiB0aGUgZ3JvdXAgaW5cclxuICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LWxldmVsLVwiICsgbm9kZS5sZXZlbCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGlmIGEgbGVhZiwgYW5kIGEgcGFyZW50IGV4aXN0cywgcHV0IGEgbGV2ZWwgb2YgdGhlIHBhcmVudCwgZWxzZSBwdXQgbGV2ZWwgb2YgMCBmb3IgdG9wIGxldmVsIGl0ZW1cclxuICAgICAgICBpZiAobm9kZS5wYXJlbnQpIHtcclxuICAgICAgICAgICAgY2xhc3Nlc0xpc3QucHVzaChcImFnLXJvdy1sZXZlbC1cIiArIChub2RlLnBhcmVudC5sZXZlbCArIDEpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LWxldmVsLTBcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LWdyb3VwXCIpO1xyXG4gICAgfVxyXG4gICAgaWYgKG5vZGUuZ3JvdXAgJiYgIW5vZGUuZm9vdGVyICYmIG5vZGUuZXhwYW5kZWQpIHtcclxuICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LWdyb3VwLWV4cGFuZGVkXCIpO1xyXG4gICAgfVxyXG4gICAgaWYgKG5vZGUuZ3JvdXAgJiYgIW5vZGUuZm9vdGVyICYmICFub2RlLmV4cGFuZGVkKSB7XHJcbiAgICAgICAgLy8gb3Bwb3NpdGUgb2YgZXhwYW5kZWQgaXMgY29udHJhY3RlZCBhY2NvcmRpbmcgdG8gdGhlIGludGVybmV0LlxyXG4gICAgICAgIGNsYXNzZXNMaXN0LnB1c2goXCJhZy1yb3ctZ3JvdXAtY29udHJhY3RlZFwiKTtcclxuICAgIH1cclxuICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgY2xhc3Nlc0xpc3QucHVzaChcImFnLXJvdy1mb290ZXJcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWRkIGluIGV4dHJhIGNsYXNzZXMgcHJvdmlkZWQgYnkgdGhlIGNvbmZpZ1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0NsYXNzKCkpIHtcclxuICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpLFxyXG4gICAgICAgICAgICBhcGk6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgZXh0cmFSb3dDbGFzc2VzID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93Q2xhc3MoKShwYXJhbXMpO1xyXG4gICAgICAgIGlmIChleHRyYVJvd0NsYXNzZXMpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBleHRyYVJvd0NsYXNzZXMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKGV4dHJhUm93Q2xhc3Nlcyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShleHRyYVJvd0NsYXNzZXMpKSB7XHJcbiAgICAgICAgICAgICAgICBleHRyYVJvd0NsYXNzZXMuZm9yRWFjaChmdW5jdGlvbihjbGFzc0l0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKGNsYXNzSXRlbSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2xhc3NlcyA9IGNsYXNzZXNMaXN0LmpvaW4oXCIgXCIpO1xyXG5cclxuICAgIGVSb3cuY2xhc3NOYW1lID0gY2xhc3NlcztcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVSb3dDb250YWluZXIgPSBmdW5jdGlvbihyb3dJbmRleCwgbm9kZSwgZ3JvdXBSb3cpIHtcclxuICAgIHZhciBlUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuXHJcbiAgICB0aGlzLmFkZENsYXNzZXNUb1Jvdyhyb3dJbmRleCwgbm9kZSwgZVJvdyk7XHJcblxyXG4gICAgZVJvdy5zZXRBdHRyaWJ1dGUoXCJyb3dcIiwgcm93SW5kZXgpO1xyXG5cclxuICAgIC8vIGlmIHNob3dpbmcgc2Nyb2xscywgcG9zaXRpb24gb24gdGhlIGNvbnRhaW5lclxyXG4gICAgaWYgKCF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0RvbnRVc2VTY3JvbGxzKCkpIHtcclxuICAgICAgICBlUm93LnN0eWxlLnRvcCA9ICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dIZWlnaHQoKSAqIHJvd0luZGV4KSArIFwicHhcIjtcclxuICAgIH1cclxuICAgIGVSb3cuc3R5bGUuaGVpZ2h0ID0gKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0hlaWdodCgpKSArIFwicHhcIjtcclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93U3R5bGUoKSkge1xyXG4gICAgICAgIHZhciBjc3NUb1VzZTtcclxuICAgICAgICB2YXIgcm93U3R5bGUgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dTdHlsZSgpO1xyXG4gICAgICAgIGlmICh0eXBlb2Ygcm93U3R5bGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgY3NzVG9Vc2UgPSByb3dTdHlsZShub2RlLmRhdGEsIHJvd0luZGV4LCBncm91cFJvdyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3NzVG9Vc2UgPSByb3dTdHlsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjc3NUb1VzZSkge1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjc3NUb1VzZSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgICAgIGVSb3cuc3R5bGVba2V5XSA9IGNzc1RvVXNlW2tleV07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgZVJvdy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBfdGhpcy5hbmd1bGFyR3JpZC5vblJvd0NsaWNrZWQoZXZlbnQsIE51bWJlcih0aGlzLmdldEF0dHJpYnV0ZShcInJvd1wiKSksIG5vZGUpXHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gZVJvdztcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5nZXRJbmRleE9mUmVuZGVyZWROb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIHJlbmRlcmVkUm93cyA9IHRoaXMucmVuZGVyZWRSb3dzO1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyZW5kZXJlZFJvd3MpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHJlbmRlcmVkUm93c1trZXlzW2ldXS5ub2RlID09PSBub2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJlZFJvd3Nba2V5c1tpXV0ucm93SW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIC0xO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnNldENzc0NsYXNzRm9yR3JvdXBDZWxsID0gZnVuY3Rpb24oZUdyaWRHcm91cFJvdywgZm9vdGVyLCB1c2VFbnRpcmVSb3csIGZpcnN0Q29sdW1uSW5kZXgpIHtcclxuICAgIGlmICh1c2VFbnRpcmVSb3cpIHtcclxuICAgICAgICBpZiAoZm9vdGVyKSB7XHJcbiAgICAgICAgICAgIGVHcmlkR3JvdXBSb3cuY2xhc3NOYW1lID0gJ2FnLWZvb3Rlci1jZWxsLWVudGlyZS1yb3cnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVHcmlkR3JvdXBSb3cuY2xhc3NOYW1lID0gJ2FnLWdyb3VwLWNlbGwtZW50aXJlLXJvdyc7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoZm9vdGVyKSB7XHJcbiAgICAgICAgICAgIGVHcmlkR3JvdXBSb3cuY2xhc3NOYW1lID0gJ2FnLWZvb3Rlci1jZWxsIGFnLWNlbGwgY2VsbC1jb2wtJyArIGZpcnN0Q29sdW1uSW5kZXg7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZUdyaWRHcm91cFJvdy5jbGFzc05hbWUgPSAnYWctZ3JvdXAtY2VsbCBhZy1jZWxsIGNlbGwtY29sLScgKyBmaXJzdENvbHVtbkluZGV4O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVHcm91cEVsZW1lbnQgPSBmdW5jdGlvbihub2RlLCBmaXJzdENvbHVtbiwgdXNlRW50aXJlUm93LCBwYWRkaW5nLCByb3dJbmRleCwgZm9vdGVyKSB7XHJcbiAgICB2YXIgZUdyaWRHcm91cFJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuICAgIHRoaXMuc2V0Q3NzQ2xhc3NGb3JHcm91cENlbGwoZUdyaWRHcm91cFJvdywgZm9vdGVyLCB1c2VFbnRpcmVSb3csIGZpcnN0Q29sdW1uLmluZGV4KTtcclxuXHJcbiAgICB2YXIgZXhwYW5kSWNvbk5lZWRlZCA9ICFwYWRkaW5nICYmICFmb290ZXI7XHJcbiAgICBpZiAoZXhwYW5kSWNvbk5lZWRlZCkge1xyXG4gICAgICAgIHRoaXMuYWRkR3JvdXBFeHBhbmRJY29uKGVHcmlkR3JvdXBSb3csIG5vZGUuZXhwYW5kZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjaGVja2JveE5lZWRlZCA9ICFwYWRkaW5nICYmICFmb290ZXIgJiYgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cENoZWNrYm94U2VsZWN0aW9uKCk7XHJcbiAgICBpZiAoY2hlY2tib3hOZWVkZWQpIHtcclxuICAgICAgICB2YXIgZUNoZWNrYm94ID0gdGhpcy5zZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkuY3JlYXRlU2VsZWN0aW9uQ2hlY2tib3gobm9kZSwgcm93SW5kZXgpO1xyXG4gICAgICAgIGVHcmlkR3JvdXBSb3cuYXBwZW5kQ2hpbGQoZUNoZWNrYm94KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0cnkgdXNlciBjdXN0b20gcmVuZGVyaW5nIGZpcnN0XHJcbiAgICB2YXIgdXNlUmVuZGVyZXIgPSB0eXBlb2YgdGhpcy5ncmlkT3B0aW9ucy5ncm91cElubmVyQ2VsbFJlbmRlcmVyID09PSAnZnVuY3Rpb24nO1xyXG4gICAgaWYgKHVzZVJlbmRlcmVyKSB7XHJcbiAgICAgICAgdmFyIHJlbmRlcmVyUGFyYW1zID0ge1xyXG4gICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgIHBhZGRpbmc6IHBhZGRpbmcsXHJcbiAgICAgICAgICAgIGFwaTogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKCksXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdXRpbHMudXNlUmVuZGVyZXIoZUdyaWRHcm91cFJvdywgdGhpcy5ncmlkT3B0aW9ucy5ncm91cElubmVyQ2VsbFJlbmRlcmVyLCByZW5kZXJlclBhcmFtcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmICghcGFkZGluZykge1xyXG4gICAgICAgICAgICBpZiAoZm9vdGVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUZvb3RlckNlbGwoZUdyaWRHcm91cFJvdywgbm9kZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUdyb3VwQ2VsbChlR3JpZEdyb3VwUm93LCBub2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXVzZUVudGlyZVJvdykge1xyXG4gICAgICAgIGVHcmlkR3JvdXBSb3cuc3R5bGUud2lkdGggPSB1dGlscy5mb3JtYXRXaWR0aChmaXJzdENvbHVtbi5hY3R1YWxXaWR0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaW5kZW50IHdpdGggdGhlIGdyb3VwIGxldmVsXHJcbiAgICBpZiAoIXBhZGRpbmcpIHtcclxuICAgICAgICAvLyBvbmx5IGRvIHRoaXMgaWYgYW4gaW5kZW50IC0gYXMgdGhpcyBvdmVyd3JpdGVzIHRoZSBwYWRkaW5nIHRoYXRcclxuICAgICAgICAvLyB0aGUgdGhlbWUgc2V0LCB3aGljaCB3aWxsIG1ha2UgdGhpbmdzIGxvb2sgJ25vdCBhbGlnbmVkJyBmb3IgdGhlXHJcbiAgICAgICAgLy8gZmlyc3QgZ3JvdXAgbGV2ZWwuXHJcbiAgICAgICAgaWYgKG5vZGUuZm9vdGVyIHx8IG5vZGUubGV2ZWwgPiAwKSB7XHJcbiAgICAgICAgICAgIHZhciBwYWRkaW5nUHggPSBub2RlLmxldmVsICogMTA7XHJcbiAgICAgICAgICAgIGlmIChmb290ZXIpIHtcclxuICAgICAgICAgICAgICAgIHBhZGRpbmdQeCArPSAxMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlR3JpZEdyb3VwUm93LnN0eWxlLnBhZGRpbmdMZWZ0ID0gcGFkZGluZ1B4ICsgXCJweFwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBlR3JpZEdyb3VwUm93LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBub2RlLmV4cGFuZGVkID0gIW5vZGUuZXhwYW5kZWQ7XHJcbiAgICAgICAgdGhhdC5hbmd1bGFyR3JpZC51cGRhdGVNb2RlbEFuZFJlZnJlc2goY29uc3RhbnRzLlNURVBfTUFQKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBlR3JpZEdyb3VwUm93O1xyXG59O1xyXG5cclxuLy8gY3JlYXRlcyBjZWxsIHdpdGggJ1RvdGFsIHt7a2V5fX0nIGZvciBhIGdyb3VwXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVGb290ZXJDZWxsID0gZnVuY3Rpb24oZVBhcmVudCwgbm9kZSkge1xyXG4gICAgLy8gaWYgd2UgYXJlIGRvaW5nIGNlbGwgLSB0aGVuIGl0IG1ha2VzIHNlbnNlIHRvIHB1dCBpbiAndG90YWwnLCB3aGljaCBpcyBqdXN0IGEgYmVzdCBndWVzcyxcclxuICAgIC8vIHRoYXQgdGhlIHVzZXIgaXMgZ29pbmcgdG8gd2FudCB0byBzYXkgJ3RvdGFsJy4gdHlwaWNhbGx5IGkgZXhwZWN0IHRoZSB1c2VyIHRvIG92ZXJyaWRlXHJcbiAgICAvLyBob3cgdGhpcyBjZWxsIGlzIHJlbmRlcmVkXHJcbiAgICB2YXIgdGV4dFRvRGlzcGxheTtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwVXNlRW50aXJlUm93KCkpIHtcclxuICAgICAgICB0ZXh0VG9EaXNwbGF5ID0gXCJHcm91cCBmb290ZXIgLSB5b3Ugc2hvdWxkIHByb3ZpZGUgYSBjdXN0b20gZ3JvdXBJbm5lckNlbGxSZW5kZXJlciB0byByZW5kZXIgd2hhdCBtYWtlcyBzZW5zZSBmb3IgeW91XCJcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGV4dFRvRGlzcGxheSA9IFwiVG90YWwgXCIgKyBub2RlLmtleTtcclxuICAgIH1cclxuICAgIHZhciBlVGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHRUb0Rpc3BsYXkpO1xyXG4gICAgZVBhcmVudC5hcHBlbmRDaGlsZChlVGV4dCk7XHJcbn07XHJcblxyXG4vLyBjcmVhdGVzIGNlbGwgd2l0aCAne3trZXl9fSAoe3tjaGlsZENvdW50fX0pJyBmb3IgYSBncm91cFxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlR3JvdXBDZWxsID0gZnVuY3Rpb24oZVBhcmVudCwgbm9kZSkge1xyXG4gICAgdmFyIHRleHRUb0Rpc3BsYXkgPSBcIiBcIiArIG5vZGUua2V5O1xyXG4gICAgLy8gb25seSBpbmNsdWRlIHRoZSBjaGlsZCBjb3VudCBpZiBpdCdzIGluY2x1ZGVkLCBlZyBpZiB1c2VyIGRvaW5nIGN1c3RvbSBhZ2dyZWdhdGlvbixcclxuICAgIC8vIHRoZW4gdGhpcyBjb3VsZCBiZSBsZWZ0IG91dCwgb3Igc2V0IHRvIC0xLCBpZSBubyBjaGlsZCBjb3VudFxyXG4gICAgaWYgKG5vZGUuYWxsQ2hpbGRyZW5Db3VudCA+PSAwKSB7XHJcbiAgICAgICAgdGV4dFRvRGlzcGxheSArPSBcIiAoXCIgKyBub2RlLmFsbENoaWxkcmVuQ291bnQgKyBcIilcIjtcclxuICAgIH1cclxuICAgIHZhciBlVGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHRUb0Rpc3BsYXkpO1xyXG4gICAgZVBhcmVudC5hcHBlbmRDaGlsZChlVGV4dCk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuYWRkR3JvdXBFeHBhbmRJY29uID0gZnVuY3Rpb24oZUdyaWRHcm91cFJvdywgZXhwYW5kZWQpIHtcclxuICAgIHZhciBlR3JvdXBJY29uO1xyXG4gICAgaWYgKGV4cGFuZGVkKSB7XHJcbiAgICAgICAgZUdyb3VwSWNvbiA9IHV0aWxzLmNyZWF0ZUljb24oJ2dyb3VwRXhwYW5kZWQnLCB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciwgbnVsbCwgc3ZnRmFjdG9yeS5jcmVhdGVBcnJvd0Rvd25TdmcpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBlR3JvdXBJY29uID0gdXRpbHMuY3JlYXRlSWNvbignZ3JvdXBDb250cmFjdGVkJywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIG51bGwsIHN2Z0ZhY3RvcnkuY3JlYXRlQXJyb3dSaWdodFN2Zyk7XHJcbiAgICB9XHJcblxyXG4gICAgZUdyaWRHcm91cFJvdy5hcHBlbmRDaGlsZChlR3JvdXBJY29uKTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5wdXREYXRhSW50b0NlbGwgPSBmdW5jdGlvbihjb2xEZWYsIHZhbHVlLCB2YWx1ZUdldHRlciwgbm9kZSwgJGNoaWxkU2NvcGUsIGVHcmlkQ2VsbCwgcm93SW5kZXgsIHJlZnJlc2hDZWxsRnVuY3Rpb24pIHtcclxuICAgIC8vIHRlbXBsYXRlIGdldHMgcHJlZmVyZW5jZSwgdGhlbiBjZWxsUmVuZGVyZXIsIHRoZW4gZG8gaXQgb3Vyc2VsdmVzXHJcbiAgICBpZiAoY29sRGVmLnRlbXBsYXRlKSB7XHJcbiAgICAgICAgZUdyaWRDZWxsLmlubmVySFRNTCA9IGNvbERlZi50ZW1wbGF0ZTtcclxuICAgIH0gZWxzZSBpZiAoY29sRGVmLnRlbXBsYXRlVXJsKSB7XHJcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZVNlcnZpY2UuZ2V0VGVtcGxhdGUoY29sRGVmLnRlbXBsYXRlVXJsLCByZWZyZXNoQ2VsbEZ1bmN0aW9uKTtcclxuICAgICAgICBpZiAodGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgZUdyaWRDZWxsLmlubmVySFRNTCA9IHRlbXBsYXRlO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoY29sRGVmLmNlbGxSZW5kZXJlcikge1xyXG4gICAgICAgIHZhciByZW5kZXJlclBhcmFtcyA9IHtcclxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICB2YWx1ZUdldHRlcjogdmFsdWVHZXR0ZXIsXHJcbiAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgICAgICRzY29wZTogJGNoaWxkU2NvcGUsXHJcbiAgICAgICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKSxcclxuICAgICAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpLFxyXG4gICAgICAgICAgICByZWZyZXNoQ2VsbDogcmVmcmVzaENlbGxGdW5jdGlvblxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIHJlc3VsdEZyb21SZW5kZXJlciA9IGNvbERlZi5jZWxsUmVuZGVyZXIocmVuZGVyZXJQYXJhbXMpO1xyXG4gICAgICAgIGlmICh1dGlscy5pc05vZGVPckVsZW1lbnQocmVzdWx0RnJvbVJlbmRlcmVyKSkge1xyXG4gICAgICAgICAgICAvLyBhIGRvbSBub2RlIG9yIGVsZW1lbnQgd2FzIHJldHVybmVkLCBzbyBhZGQgY2hpbGRcclxuICAgICAgICAgICAgZUdyaWRDZWxsLmFwcGVuZENoaWxkKHJlc3VsdEZyb21SZW5kZXJlcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIGFzc3VtZSBpdCB3YXMgaHRtbCwgc28ganVzdCBpbnNlcnRcclxuICAgICAgICAgICAgZUdyaWRDZWxsLmlubmVySFRNTCA9IHJlc3VsdEZyb21SZW5kZXJlcjtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGlmIHdlIGluc2VydCB1bmRlZmluZWQsIHRoZW4gaXQgZGlzcGxheXMgYXMgdGhlIHN0cmluZyAndW5kZWZpbmVkJywgdWdseSFcclxuICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gJycpIHtcclxuICAgICAgICAgICAgZUdyaWRDZWxsLmlubmVySFRNTCA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5hZGRTdHlsZXNGcm9tQ29sbERlZiA9IGZ1bmN0aW9uKGNvbERlZiwgdmFsdWUsIG5vZGUsICRjaGlsZFNjb3BlLCBlR3JpZENlbGwpIHtcclxuICAgIGlmIChjb2xEZWYuY2VsbFN0eWxlKSB7XHJcbiAgICAgICAgdmFyIGNzc1RvVXNlO1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29sRGVmLmNlbGxTdHlsZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB2YXIgY2VsbFN0eWxlUGFyYW1zID0ge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAgICAgJHNjb3BlOiAkY2hpbGRTY29wZSxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKSxcclxuICAgICAgICAgICAgICAgIGFwaTogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY3NzVG9Vc2UgPSBjb2xEZWYuY2VsbFN0eWxlKGNlbGxTdHlsZVBhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3NzVG9Vc2UgPSBjb2xEZWYuY2VsbFN0eWxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNzc1RvVXNlKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNzc1RvVXNlKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICAgICAgZUdyaWRDZWxsLnN0eWxlW2tleV0gPSBjc3NUb1VzZVtrZXldO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuYWRkQ2xhc3Nlc0Zyb21Db2xsRGVmID0gZnVuY3Rpb24oY29sRGVmLCB2YWx1ZSwgbm9kZSwgJGNoaWxkU2NvcGUsIGVHcmlkQ2VsbCkge1xyXG4gICAgaWYgKGNvbERlZi5jZWxsQ2xhc3MpIHtcclxuICAgICAgICB2YXIgY2xhc3NUb1VzZTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbERlZi5jZWxsQ2xhc3MgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdmFyIGNlbGxDbGFzc1BhcmFtcyA9IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgICAgICRzY29wZTogJGNoaWxkU2NvcGUsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0OiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCksXHJcbiAgICAgICAgICAgICAgICBhcGk6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNsYXNzVG9Vc2UgPSBjb2xEZWYuY2VsbENsYXNzKGNlbGxDbGFzc1BhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2xhc3NUb1VzZSA9IGNvbERlZi5jZWxsQ2xhc3M7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIGNsYXNzVG9Vc2UgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHV0aWxzLmFkZENzc0NsYXNzKGVHcmlkQ2VsbCwgY2xhc3NUb1VzZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGNsYXNzVG9Vc2UpKSB7XHJcbiAgICAgICAgICAgIGNsYXNzVG9Vc2UuZm9yRWFjaChmdW5jdGlvbihjc3NDbGFzc0l0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHV0aWxzLmFkZENzc0NsYXNzKGVHcmlkQ2VsbCwgY3NzQ2xhc3NJdGVtKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmFkZENsYXNzZXNUb0NlbGwgPSBmdW5jdGlvbihjb2x1bW4sIG5vZGUsIGVHcmlkQ2VsbCkge1xyXG4gICAgdmFyIGNsYXNzZXMgPSBbJ2FnLWNlbGwnLCAnY2VsbC1jb2wtJyArIGNvbHVtbi5pbmRleF07XHJcbiAgICBpZiAobm9kZS5ncm91cCkge1xyXG4gICAgICAgIGlmIChub2RlLmZvb3Rlcikge1xyXG4gICAgICAgICAgICBjbGFzc2VzLnB1c2goJ2FnLWZvb3Rlci1jZWxsJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKCdhZy1ncm91cC1jZWxsJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZUdyaWRDZWxsLmNsYXNzTmFtZSA9IGNsYXNzZXMuam9pbignICcpO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmFkZENsYXNzZXNGcm9tUnVsZXMgPSBmdW5jdGlvbihjb2xEZWYsIGVHcmlkQ2VsbCwgdmFsdWUsIG5vZGUsIHJvd0luZGV4KSB7XHJcbiAgICB2YXIgY2xhc3NSdWxlcyA9IGNvbERlZi5jZWxsQ2xhc3NSdWxlcztcclxuICAgIGlmICh0eXBlb2YgY2xhc3NSdWxlcyA9PT0gJ29iamVjdCcpIHtcclxuXHJcbiAgICAgICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgICAgIGFwaTogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKCksXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBjbGFzc05hbWVzID0gT2JqZWN0LmtleXMoY2xhc3NSdWxlcyk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc05hbWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSBjbGFzc05hbWVzW2ldO1xyXG4gICAgICAgICAgICB2YXIgcnVsZSA9IGNsYXNzUnVsZXNbY2xhc3NOYW1lXTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdE9mUnVsZTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBydWxlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0T2ZSdWxlID0gdGhpcy5leHByZXNzaW9uU2VydmljZS5ldmFsdWF0ZShydWxlLCBwYXJhbXMpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBydWxlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRPZlJ1bGUgPSBydWxlKHBhcmFtcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlc3VsdE9mUnVsZSkge1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuYWRkQ3NzQ2xhc3MoZUdyaWRDZWxsLCBjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdXRpbHMucmVtb3ZlQ3NzQ2xhc3MoZUdyaWRDZWxsLCBjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmNyZWF0ZUNlbGwgPSBmdW5jdGlvbihpc0ZpcnN0Q29sdW1uLCBjb2x1bW4sIHZhbHVlR2V0dGVyLCBub2RlLCByb3dJbmRleCwgJGNoaWxkU2NvcGUpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHZhciBlR3JpZENlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgZUdyaWRDZWxsLnNldEF0dHJpYnV0ZShcImNvbFwiLCBjb2x1bW4uaW5kZXgpO1xyXG5cclxuICAgIHZhciB2YWx1ZTtcclxuICAgIGlmICh2YWx1ZUdldHRlcikge1xyXG4gICAgICAgIHZhbHVlID0gdmFsdWVHZXR0ZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0aGVzZSBhcmUgdGhlIGdyaWQgc3R5bGVzLCBkb24ndCBjaGFuZ2UgYmV0d2VlbiBzb2Z0IHJlZnJlc2hlc1xyXG4gICAgdGhpcy5hZGRDbGFzc2VzVG9DZWxsKGNvbHVtbiwgbm9kZSwgZUdyaWRDZWxsKTtcclxuXHJcbiAgICB0aGlzLnBvcHVsYXRlQW5kU3R5bGVHcmlkQ2VsbCh2YWx1ZUdldHRlciwgdmFsdWUsIGVHcmlkQ2VsbCwgaXNGaXJzdENvbHVtbiwgbm9kZSwgY29sdW1uLCByb3dJbmRleCwgJGNoaWxkU2NvcGUpO1xyXG5cclxuICAgIHRoaXMuYWRkQ2VsbENsaWNrZWRIYW5kbGVyKGVHcmlkQ2VsbCwgbm9kZSwgY29sdW1uLCB2YWx1ZSwgcm93SW5kZXgpO1xyXG4gICAgdGhpcy5hZGRDZWxsRG91YmxlQ2xpY2tlZEhhbmRsZXIoZUdyaWRDZWxsLCBub2RlLCBjb2x1bW4sIHZhbHVlLCByb3dJbmRleCwgJGNoaWxkU2NvcGUsIGlzRmlyc3RDb2x1bW4sIHZhbHVlR2V0dGVyKTtcclxuXHJcbiAgICBlR3JpZENlbGwuc3R5bGUud2lkdGggPSB1dGlscy5mb3JtYXRXaWR0aChjb2x1bW4uYWN0dWFsV2lkdGgpO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgJ3N0YXJ0IGVkaXRpbmcnIGNhbGwgdG8gdGhlIGNoYWluIG9mIGVkaXRvcnNcclxuICAgIHRoaXMucmVuZGVyZWRSb3dTdGFydEVkaXRpbmdMaXN0ZW5lcnNbcm93SW5kZXhdW2NvbHVtbi5pbmRleF0gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAodGhhdC5pc0NlbGxFZGl0YWJsZShjb2x1bW4uY29sRGVmLCBub2RlKSkge1xyXG4gICAgICAgICAgICB0aGF0LnN0YXJ0RWRpdGluZyhlR3JpZENlbGwsIGNvbHVtbiwgbm9kZSwgJGNoaWxkU2NvcGUsIHJvd0luZGV4LCBpc0ZpcnN0Q29sdW1uLCB2YWx1ZUdldHRlcik7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBlR3JpZENlbGw7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUucG9wdWxhdGVBbmRTdHlsZUdyaWRDZWxsID0gZnVuY3Rpb24odmFsdWVHZXR0ZXIsIHZhbHVlLCBlR3JpZENlbGwsIGlzRmlyc3RDb2x1bW4sIG5vZGUsIGNvbHVtbiwgcm93SW5kZXgsICRjaGlsZFNjb3BlKSB7XHJcbiAgICB2YXIgY29sRGVmID0gY29sdW1uLmNvbERlZjtcclxuXHJcbiAgICAvLyBwb3B1bGF0ZVxyXG4gICAgdGhpcy5wb3B1bGF0ZUdyaWRDZWxsKGVHcmlkQ2VsbCwgaXNGaXJzdENvbHVtbiwgbm9kZSwgY29sdW1uLCByb3dJbmRleCwgdmFsdWUsIHZhbHVlR2V0dGVyLCAkY2hpbGRTY29wZSk7XHJcbiAgICAvLyBzdHlsZVxyXG4gICAgdGhpcy5hZGRTdHlsZXNGcm9tQ29sbERlZihjb2xEZWYsIHZhbHVlLCBub2RlLCAkY2hpbGRTY29wZSwgZUdyaWRDZWxsKTtcclxuICAgIHRoaXMuYWRkQ2xhc3Nlc0Zyb21Db2xsRGVmKGNvbERlZiwgdmFsdWUsIG5vZGUsICRjaGlsZFNjb3BlLCBlR3JpZENlbGwpO1xyXG4gICAgdGhpcy5hZGRDbGFzc2VzRnJvbVJ1bGVzKGNvbERlZiwgZUdyaWRDZWxsLCB2YWx1ZSwgbm9kZSwgcm93SW5kZXgpO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnBvcHVsYXRlR3JpZENlbGwgPSBmdW5jdGlvbihlR3JpZENlbGwsIGlzRmlyc3RDb2x1bW4sIG5vZGUsIGNvbHVtbiwgcm93SW5kZXgsIHZhbHVlLCB2YWx1ZUdldHRlciwgJGNoaWxkU2NvcGUpIHtcclxuICAgIHZhciBlQ2VsbFdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICBlR3JpZENlbGwuYXBwZW5kQ2hpbGQoZUNlbGxXcmFwcGVyKTtcclxuXHJcbiAgICAvLyBzZWUgaWYgd2UgbmVlZCBhIHBhZGRpbmcgYm94XHJcbiAgICBpZiAoaXNGaXJzdENvbHVtbiAmJiAobm9kZS5wYXJlbnQpKSB7XHJcbiAgICAgICAgdmFyIHBpeGVsc1RvSW5kZW50ID0gMjAgKyAobm9kZS5wYXJlbnQubGV2ZWwgKiAxMCk7XHJcbiAgICAgICAgZUNlbGxXcmFwcGVyLnN0eWxlWydwYWRkaW5nLWxlZnQnXSA9IHBpeGVsc1RvSW5kZW50ICsgJ3B4JztcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY29sRGVmID0gY29sdW1uLmNvbERlZjtcclxuICAgIGlmIChjb2xEZWYuY2hlY2tib3hTZWxlY3Rpb24pIHtcclxuICAgICAgICB2YXIgZUNoZWNrYm94ID0gdGhpcy5zZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkuY3JlYXRlU2VsZWN0aW9uQ2hlY2tib3gobm9kZSwgcm93SW5kZXgpO1xyXG4gICAgICAgIGVDZWxsV3JhcHBlci5hcHBlbmRDaGlsZChlQ2hlY2tib3gpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBlU3BhbldpdGhWYWx1ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgZUNlbGxXcmFwcGVyLmFwcGVuZENoaWxkKGVTcGFuV2l0aFZhbHVlKTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB2YXIgcmVmcmVzaENlbGxGdW5jdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQuc29mdFJlZnJlc2hDZWxsKGVHcmlkQ2VsbCwgaXNGaXJzdENvbHVtbiwgbm9kZSwgY29sdW1uLCAkY2hpbGRTY29wZSwgcm93SW5kZXgpO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnB1dERhdGFJbnRvQ2VsbChjb2xEZWYsIHZhbHVlLCB2YWx1ZUdldHRlciwgbm9kZSwgJGNoaWxkU2NvcGUsIGVTcGFuV2l0aFZhbHVlLCByb3dJbmRleCwgcmVmcmVzaENlbGxGdW5jdGlvbik7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuYWRkQ2VsbERvdWJsZUNsaWNrZWRIYW5kbGVyID0gZnVuY3Rpb24oZUdyaWRDZWxsLCBub2RlLCBjb2x1bW4sIHZhbHVlLCByb3dJbmRleCwgJGNoaWxkU2NvcGUsIGlzRmlyc3RDb2x1bW4sIHZhbHVlR2V0dGVyKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB2YXIgY29sRGVmID0gY29sdW1uLmNvbERlZjtcclxuICAgIGVHcmlkQ2VsbC5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBpZiAodGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q2VsbERvdWJsZUNsaWNrZWQoKSkge1xyXG4gICAgICAgICAgICB2YXIgcGFyYW1zRm9yR3JpZCA9IHtcclxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudCxcclxuICAgICAgICAgICAgICAgIGV2ZW50U291cmNlOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYXBpOiB0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRDZWxsRG91YmxlQ2xpY2tlZCgpKHBhcmFtc0ZvckdyaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29sRGVmLmNlbGxEb3VibGVDbGlja2VkKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXJhbXNGb3JDb2xEZWYgPSB7XHJcbiAgICAgICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgcm93SW5kZXg6IHJvd0luZGV4LFxyXG4gICAgICAgICAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgICAgICAgICBldmVudDogZXZlbnQsXHJcbiAgICAgICAgICAgICAgICBldmVudFNvdXJjZTogdGhpcyxcclxuICAgICAgICAgICAgICAgIGFwaTogdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29sRGVmLmNlbGxEb3VibGVDbGlja2VkKHBhcmFtc0ZvckNvbERlZik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGF0LmlzQ2VsbEVkaXRhYmxlKGNvbERlZiwgbm9kZSkpIHtcclxuICAgICAgICAgICAgdGhhdC5zdGFydEVkaXRpbmcoZUdyaWRDZWxsLCBjb2x1bW4sIG5vZGUsICRjaGlsZFNjb3BlLCByb3dJbmRleCwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmFkZENlbGxDbGlja2VkSGFuZGxlciA9IGZ1bmN0aW9uKGVHcmlkQ2VsbCwgbm9kZSwgY29sRGVmV3JhcHBlciwgdmFsdWUsIHJvd0luZGV4KSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB2YXIgY29sRGVmID0gY29sRGVmV3JhcHBlci5jb2xEZWY7XHJcbiAgICBlR3JpZENlbGwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxDbGlja2VkKCkpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmFtc0ZvckdyaWQgPSB7XHJcbiAgICAgICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgcm93SW5kZXg6IHJvd0luZGV4LFxyXG4gICAgICAgICAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgICAgICAgICBldmVudDogZXZlbnQsXHJcbiAgICAgICAgICAgICAgICBldmVudFNvdXJjZTogdGhpcyxcclxuICAgICAgICAgICAgICAgIGFwaTogdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q2VsbENsaWNrZWQoKShwYXJhbXNGb3JHcmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbERlZi5jZWxsQ2xpY2tlZCkge1xyXG4gICAgICAgICAgICB2YXIgcGFyYW1zRm9yQ29sRGVmID0ge1xyXG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgICAgICAgICAgZXZlbnRTb3VyY2U6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBhcGk6IHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbERlZi5jZWxsQ2xpY2tlZChwYXJhbXNGb3JDb2xEZWYpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmlzQ2VsbEVkaXRhYmxlID0gZnVuY3Rpb24oY29sRGVmLCBub2RlKSB7XHJcbiAgICBpZiAodGhpcy5lZGl0aW5nQ2VsbCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBuZXZlciBhbGxvdyBlZGl0aW5nIG9mIGdyb3Vwc1xyXG4gICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgYm9vbGVhbiBzZXQsIHRoZW4ganVzdCB1c2UgaXRcclxuICAgIGlmICh0eXBlb2YgY29sRGVmLmVkaXRhYmxlID09PSAnYm9vbGVhbicpIHtcclxuICAgICAgICByZXR1cm4gY29sRGVmLmVkaXRhYmxlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGZ1bmN0aW9uLCB0aGVuIGNhbGwgdGhlIGZ1bmN0aW9uIHRvIGZpbmQgb3V0XHJcbiAgICBpZiAodHlwZW9mIGNvbERlZi5lZGl0YWJsZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIC8vIHNob3VsZCBjaGFuZ2UgdGhpcywgc28gaXQgZ2V0cyBwYXNzZWQgcGFyYW1zIHdpdGggbmljZSB1c2VmdWwgdmFsdWVzXHJcbiAgICAgICAgcmV0dXJuIGNvbERlZi5lZGl0YWJsZShub2RlLmRhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zdG9wRWRpdGluZyA9IGZ1bmN0aW9uKGVHcmlkQ2VsbCwgY29sdW1uLCBub2RlLCAkY2hpbGRTY29wZSwgZUlucHV0LCBibHVyTGlzdGVuZXIsIHJvd0luZGV4LCBpc0ZpcnN0Q29sdW1uLCB2YWx1ZUdldHRlcikge1xyXG4gICAgdGhpcy5lZGl0aW5nQ2VsbCA9IGZhbHNlO1xyXG4gICAgdmFyIG5ld1ZhbHVlID0gZUlucHV0LnZhbHVlO1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcblxyXG4gICAgLy9JZiB3ZSBkb24ndCByZW1vdmUgdGhlIGJsdXIgbGlzdGVuZXIgZmlyc3QsIHdlIGdldDpcclxuICAgIC8vVW5jYXVnaHQgTm90Rm91bmRFcnJvcjogRmFpbGVkIHRvIGV4ZWN1dGUgJ3JlbW92ZUNoaWxkJyBvbiAnTm9kZSc6IFRoZSBub2RlIHRvIGJlIHJlbW92ZWQgaXMgbm8gbG9uZ2VyIGEgY2hpbGQgb2YgdGhpcyBub2RlLiBQZXJoYXBzIGl0IHdhcyBtb3ZlZCBpbiBhICdibHVyJyBldmVudCBoYW5kbGVyP1xyXG4gICAgZUlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCBibHVyTGlzdGVuZXIpO1xyXG5cclxuICAgIHV0aWxzLnJlbW92ZUFsbENoaWxkcmVuKGVHcmlkQ2VsbCk7XHJcblxyXG4gICAgdmFyIHBhcmFtc0ZvckNhbGxiYWNrcyA9IHtcclxuICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICBvbGRWYWx1ZTogbm9kZS5kYXRhW2NvbERlZi5maWVsZF0sXHJcbiAgICAgICAgbmV3VmFsdWU6IG5ld1ZhbHVlLFxyXG4gICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICBhcGk6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpLFxyXG4gICAgICAgIGNvbnRleHQ6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKVxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoY29sRGVmLm5ld1ZhbHVlSGFuZGxlcikge1xyXG4gICAgICAgIGNvbERlZi5uZXdWYWx1ZUhhbmRsZXIocGFyYW1zRm9yQ2FsbGJhY2tzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbm9kZS5kYXRhW2NvbERlZi5maWVsZF0gPSBuZXdWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhdCB0aGlzIHBvaW50LCB0aGUgdmFsdWUgaGFzIGJlZW4gdXBkYXRlZFxyXG4gICAgdmFyIG5ld1ZhbHVlO1xyXG4gICAgaWYgKHZhbHVlR2V0dGVyKSB7XHJcbiAgICAgICAgbmV3VmFsdWUgPSB2YWx1ZUdldHRlcigpO1xyXG4gICAgfVxyXG4gICAgcGFyYW1zRm9yQ2FsbGJhY2tzLm5ld1ZhbHVlID0gbmV3VmFsdWU7XHJcbiAgICBpZiAodHlwZW9mIGNvbERlZi5jZWxsVmFsdWVDaGFuZ2VkID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgY29sRGVmLmNlbGxWYWx1ZUNoYW5nZWQocGFyYW1zRm9yQ2FsbGJhY2tzKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q2VsbFZhbHVlQ2hhbmdlZCgpID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q2VsbFZhbHVlQ2hhbmdlZCgpKHBhcmFtc0ZvckNhbGxiYWNrcyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5wb3B1bGF0ZUFuZFN0eWxlR3JpZENlbGwodmFsdWVHZXR0ZXIsIG5ld1ZhbHVlLCBlR3JpZENlbGwsIGlzRmlyc3RDb2x1bW4sIG5vZGUsIGNvbHVtbiwgcm93SW5kZXgsICRjaGlsZFNjb3BlKTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zdGFydEVkaXRpbmcgPSBmdW5jdGlvbihlR3JpZENlbGwsIGNvbHVtbiwgbm9kZSwgJGNoaWxkU2NvcGUsIHJvd0luZGV4LCBpc0ZpcnN0Q29sdW1uLCB2YWx1ZUdldHRlcikge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5lZGl0aW5nQ2VsbCA9IHRydWU7XHJcbiAgICB1dGlscy5yZW1vdmVBbGxDaGlsZHJlbihlR3JpZENlbGwpO1xyXG4gICAgdmFyIGVJbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICBlSW5wdXQudHlwZSA9ICd0ZXh0JztcclxuICAgIHV0aWxzLmFkZENzc0NsYXNzKGVJbnB1dCwgJ2FnLWNlbGwtZWRpdC1pbnB1dCcpO1xyXG5cclxuICAgIGlmICh2YWx1ZUdldHRlcikge1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlR2V0dGVyKCk7XHJcbiAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZUlucHV0LnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGVJbnB1dC5zdHlsZS53aWR0aCA9IChjb2x1bW4uYWN0dWFsV2lkdGggLSAxNCkgKyAncHgnO1xyXG4gICAgZUdyaWRDZWxsLmFwcGVuZENoaWxkKGVJbnB1dCk7XHJcbiAgICBlSW5wdXQuZm9jdXMoKTtcclxuICAgIGVJbnB1dC5zZWxlY3QoKTtcclxuXHJcbiAgICB2YXIgYmx1ckxpc3RlbmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhhdC5zdG9wRWRpdGluZyhlR3JpZENlbGwsIGNvbHVtbiwgbm9kZSwgJGNoaWxkU2NvcGUsIGVJbnB1dCwgYmx1ckxpc3RlbmVyLCByb3dJbmRleCwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvL3N0b3AgZW50ZXJpbmcgaWYgd2UgbG9vc2UgZm9jdXNcclxuICAgIGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCBibHVyTGlzdGVuZXIpO1xyXG5cclxuICAgIC8vc3RvcCBlZGl0aW5nIGlmIGVudGVyIHByZXNzZWRcclxuICAgIGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGV2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGU7XHJcbiAgICAgICAgLy8gMTMgaXMgZW50ZXJcclxuICAgICAgICBpZiAoa2V5ID09IEVOVEVSX0tFWSkge1xyXG4gICAgICAgICAgICB0aGF0LnN0b3BFZGl0aW5nKGVHcmlkQ2VsbCwgY29sdW1uLCBub2RlLCAkY2hpbGRTY29wZSwgZUlucHV0LCBibHVyTGlzdGVuZXIsIHJvd0luZGV4LCBpc0ZpcnN0Q29sdW1uLCB2YWx1ZUdldHRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gdGFiIGtleSBkb2Vzbid0IGdlbmVyYXRlIGtleXByZXNzLCBzbyBuZWVkIGtleWRvd24gdG8gbGlzdGVuIGZvciB0aGF0XHJcbiAgICBlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGV2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGU7XHJcbiAgICAgICAgaWYgKGtleSA9PSBUQUJfS0VZKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc3RvcEVkaXRpbmcoZUdyaWRDZWxsLCBjb2x1bW4sIG5vZGUsICRjaGlsZFNjb3BlLCBlSW5wdXQsIGJsdXJMaXN0ZW5lciwgcm93SW5kZXgsIGlzRmlyc3RDb2x1bW4sIHZhbHVlR2V0dGVyKTtcclxuICAgICAgICAgICAgdGhhdC5zdGFydEVkaXRpbmdOZXh0Q2VsbChyb3dJbmRleCwgY29sdW1uLCBldmVudC5zaGlmdEtleSk7XHJcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IHdhbnQgdGhlIGRlZmF1bHQgdGFiIGFjdGlvbiwgc28gcmV0dXJuIGZhbHNlLCB0aGlzIHN0b3BzIHRoZSBldmVudCBmcm9tIGJ1YmJsaW5nXHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zdGFydEVkaXRpbmdOZXh0Q2VsbCA9IGZ1bmN0aW9uKHJvd0luZGV4LCBjb2x1bW4sIHNoaWZ0S2V5KSB7XHJcblxyXG4gICAgdmFyIGZpcnN0Um93VG9DaGVjayA9IHRoaXMuZmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3c7XHJcbiAgICB2YXIgbGFzdFJvd1RvQ2hlY2sgPSB0aGlzLmxhc3RWaXJ0dWFsUmVuZGVyZWRSb3c7XHJcbiAgICB2YXIgY3VycmVudFJvd0luZGV4ID0gcm93SW5kZXg7XHJcblxyXG4gICAgdmFyIHZpc2libGVDb2x1bW5zID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRWaXNpYmxlQ29sdW1ucygpO1xyXG4gICAgdmFyIGN1cnJlbnRDb2wgPSBjb2x1bW47XHJcblxyXG4gICAgd2hpbGUgKHRydWUpIHtcclxuXHJcbiAgICAgICAgdmFyIGluZGV4T2ZDdXJyZW50Q29sID0gdmlzaWJsZUNvbHVtbnMuaW5kZXhPZihjdXJyZW50Q29sKTtcclxuXHJcbiAgICAgICAgLy8gbW92ZSBiYWNrd2FyZFxyXG4gICAgICAgIGlmIChzaGlmdEtleSkge1xyXG4gICAgICAgICAgICAvLyBtb3ZlIGFsb25nIHRvIHRoZSBwcmV2aW91cyBjZWxsXHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2wgPSB2aXNpYmxlQ29sdW1uc1tpbmRleE9mQ3VycmVudENvbCAtIDFdO1xyXG4gICAgICAgICAgICAvLyBjaGVjayBpZiBlbmQgb2YgdGhlIHJvdywgYW5kIGlmIHNvLCBnbyBiYWNrIGEgcm93XHJcbiAgICAgICAgICAgIGlmICghY3VycmVudENvbCkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudENvbCA9IHZpc2libGVDb2x1bW5zW3Zpc2libGVDb2x1bW5zLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFJvd0luZGV4LS07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGlmIGdvdCB0byBlbmQgb2YgcmVuZGVyZWQgcm93cywgdGhlbiBxdWl0IGxvb2tpbmdcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRSb3dJbmRleCA8IGZpcnN0Um93VG9DaGVjaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIG1vdmUgZm9yd2FyZFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIG1vdmUgYWxvbmcgdG8gdGhlIG5leHQgY2VsbFxyXG4gICAgICAgICAgICBjdXJyZW50Q29sID0gdmlzaWJsZUNvbHVtbnNbaW5kZXhPZkN1cnJlbnRDb2wgKyAxXTtcclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgZW5kIG9mIHRoZSByb3csIGFuZCBpZiBzbywgZ28gZm9yd2FyZCBhIHJvd1xyXG4gICAgICAgICAgICBpZiAoIWN1cnJlbnRDb2wpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRDb2wgPSB2aXNpYmxlQ29sdW1uc1swXTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRSb3dJbmRleCsrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBnb3QgdG8gZW5kIG9mIHJlbmRlcmVkIHJvd3MsIHRoZW4gcXVpdCBsb29raW5nXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50Um93SW5kZXggPiBsYXN0Um93VG9DaGVjaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgbmV4dEZ1bmMgPSB0aGlzLnJlbmRlcmVkUm93U3RhcnRFZGl0aW5nTGlzdGVuZXJzW2N1cnJlbnRSb3dJbmRleF1bY3VycmVudENvbC5jb2xLZXldO1xyXG4gICAgICAgIGlmIChuZXh0RnVuYykge1xyXG4gICAgICAgICAgICAvLyBzZWUgaWYgdGhlIG5leHQgY2VsbCBpcyBlZGl0YWJsZSwgYW5kIGlmIHNvLCB3ZSBoYXZlIGNvbWUgdG9cclxuICAgICAgICAgICAgLy8gdGhlIGVuZCBvZiBvdXIgc2VhcmNoLCBzbyBzdG9wIGxvb2tpbmcgZm9yIHRoZSBuZXh0IGNlbGxcclxuICAgICAgICAgICAgdmFyIG5leHRDZWxsQWNjZXB0ZWRFZGl0ID0gbmV4dEZ1bmMoKTtcclxuICAgICAgICAgICAgaWYgKG5leHRDZWxsQWNjZXB0ZWRFZGl0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSb3dSZW5kZXJlcjtcclxuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG5cclxuLy8gdGhlc2UgY29uc3RhbnRzIGFyZSB1c2VkIGZvciBkZXRlcm1pbmluZyBpZiBncm91cHMgc2hvdWxkXHJcbi8vIGJlIHNlbGVjdGVkIG9yIGRlc2VsZWN0ZWQgd2hlbiBzZWxlY3RpbmcgZ3JvdXBzLCBhbmQgdGhlIGdyb3VwXHJcbi8vIHRoZW4gc2VsZWN0cyB0aGUgY2hpbGRyZW4uXHJcbnZhciBTRUxFQ1RFRCA9IDA7XHJcbnZhciBVTlNFTEVDVEVEID0gMTtcclxudmFyIE1JWEVEID0gMjtcclxudmFyIERPX05PVF9DQVJFID0gMztcclxuXHJcbmZ1bmN0aW9uIFNlbGVjdGlvbkNvbnRyb2xsZXIoKSB7fVxyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGFuZ3VsYXJHcmlkLCBlUm93c1BhcmVudCwgZ3JpZE9wdGlvbnNXcmFwcGVyLCAkc2NvcGUsIHJvd1JlbmRlcmVyKSB7XHJcbiAgICB0aGlzLmVSb3dzUGFyZW50ID0gZVJvd3NQYXJlbnQ7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkID0gYW5ndWxhckdyaWQ7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHRoaXMuJHNjb3BlID0gJHNjb3BlO1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlciA9IHJvd1JlbmRlcmVyO1xyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWQgPSB7fTtcclxuICAgIHRoaXMuc2VsZWN0ZWRSb3dzID0gW107XHJcblxyXG4gICAgZ3JpZE9wdGlvbnNXcmFwcGVyLnNldFNlbGVjdGVkUm93cyh0aGlzLnNlbGVjdGVkUm93cyk7XHJcbiAgICBncmlkT3B0aW9uc1dyYXBwZXIuc2V0U2VsZWN0ZWROb2Rlc0J5SWQodGhpcy5zZWxlY3RlZE5vZGVzQnlJZCk7XHJcbn07XHJcblxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5nZXRTZWxlY3RlZE5vZGVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2VsZWN0ZWROb2RlcyA9IFtdO1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBpZCA9IGtleXNbaV07XHJcbiAgICAgICAgdmFyIHNlbGVjdGVkTm9kZSA9IHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRbaWRdO1xyXG4gICAgICAgIHNlbGVjdGVkTm9kZXMucHVzaChzZWxlY3RlZE5vZGUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlbGVjdGVkTm9kZXM7XHJcbn07XHJcblxyXG4vLyByZXR1cm5zIGEgbGlzdCBvZiBhbGwgbm9kZXMgYXQgJ2Jlc3QgY29zdCcgLSBhIGZlYXR1cmUgdG8gYmUgdXNlZFxyXG4vLyB3aXRoIGdyb3VwcyAvIHRyZWVzLiBpZiBhIGdyb3VwIGhhcyBhbGwgaXQncyBjaGlsZHJlbiBzZWxlY3RlZCxcclxuLy8gdGhlbiB0aGUgZ3JvdXAgYXBwZWFycyBpbiB0aGUgcmVzdWx0LCBidXQgbm90IHRoZSBjaGlsZHJlbi5cclxuLy8gRGVzaWduZWQgZm9yIHVzZSB3aXRoICdjaGlsZHJlbicgYXMgdGhlIGdyb3VwIHNlbGVjdGlvbiB0eXBlLFxyXG4vLyB3aGVyZSBncm91cHMgZG9uJ3QgYWN0dWFsbHkgYXBwZWFyIGluIHRoZSBzZWxlY3Rpb24gbm9ybWFsbHkuXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmdldEJlc3RDb3N0Tm9kZVNlbGVjdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciB0b3BMZXZlbE5vZGVzID0gdGhpcy5yb3dNb2RlbC5nZXRUb3BMZXZlbE5vZGVzKCk7XHJcblxyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIC8vIHJlY3Vyc2l2ZSBmdW5jdGlvbiwgdG8gZmluZCB0aGUgc2VsZWN0ZWQgbm9kZXNcclxuICAgIGZ1bmN0aW9uIHRyYXZlcnNlKG5vZGVzKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBub2Rlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICAgICAgaWYgKHRoYXQuaXNOb2RlU2VsZWN0ZWQobm9kZSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5vZGUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgbm90IHNlbGVjdGVkLCB0aGVuIGlmIGl0J3MgYSBncm91cCwgYW5kIHRoZSBncm91cFxyXG4gICAgICAgICAgICAgICAgLy8gaGFzIGNoaWxkcmVuLCBjb250aW51ZSB0byBzZWFyY2ggZm9yIHNlbGVjdGlvbnNcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmF2ZXJzZShub2RlLmNoaWxkcmVuKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0cmF2ZXJzZSh0b3BMZXZlbE5vZGVzKTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuc2V0Um93TW9kZWwgPSBmdW5jdGlvbihyb3dNb2RlbCkge1xyXG4gICAgdGhpcy5yb3dNb2RlbCA9IHJvd01vZGVsO1xyXG59O1xyXG5cclxuLy8gcHVibGljIC0gdGhpcyBjbGVhcnMgdGhlIHNlbGVjdGlvbiwgYnV0IGRvZXNuJ3QgY2xlYXIgZG93biB0aGUgY3NzIC0gd2hlbiBpdCBpcyBjYWxsZWQsIHRoZVxyXG4vLyBjYWxsZXIgdGhlbiBnZXRzIHRoZSBncmlkIHRvIHJlZnJlc2guXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmNsZWFyU2VsZWN0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNlbGVjdGVkUm93cy5sZW5ndGggPSAwO1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW2tleXNbaV1dO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHVibGljXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnNlbGVjdE5vZGUgPSBmdW5jdGlvbihub2RlLCB0cnlNdWx0aSwgc3VwcHJlc3NFdmVudHMpIHtcclxuICAgIHZhciBtdWx0aVNlbGVjdCA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzUm93U2VsZWN0aW9uTXVsdGkoKSAmJiB0cnlNdWx0aTtcclxuXHJcbiAgICAvLyBpZiB0aGUgbm9kZSBpcyBhIGdyb3VwLCB0aGVuIHNlbGVjdGluZyB0aGlzIGlzIHRoZSBzYW1lIGFzIHNlbGVjdGluZyB0aGUgcGFyZW50LFxyXG4gICAgLy8gc28gdG8gaGF2ZSBvbmx5IG9uZSBmbG93IHRocm91Z2ggdGhlIGJlbG93LCB3ZSBhbHdheXMgc2VsZWN0IHRoZSBoZWFkZXIgcGFyZW50XHJcbiAgICAvLyAod2hpY2ggdGhlbiBoYXMgdGhlIHNpZGUgZWZmZWN0IG9mIHNlbGVjdGluZyB0aGUgY2hpbGQpLlxyXG4gICAgdmFyIG5vZGVUb1NlbGVjdDtcclxuICAgIGlmIChub2RlLmZvb3Rlcikge1xyXG4gICAgICAgIG5vZGVUb1NlbGVjdCA9IG5vZGUuc2libGluZztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbm9kZVRvU2VsZWN0ID0gbm9kZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhdCB0aGUgZW5kLCBpZiB0aGlzIGlzIHRydWUsIHdlIGluZm9ybSB0aGUgY2FsbGJhY2tcclxuICAgIHZhciBhdExlYXN0T25lSXRlbVVuc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgIHZhciBhdExlYXN0T25lSXRlbVNlbGVjdGVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gc2VlIGlmIHJvd3MgdG8gYmUgZGVzZWxlY3RlZFxyXG4gICAgaWYgKCFtdWx0aVNlbGVjdCkge1xyXG4gICAgICAgIGF0TGVhc3RPbmVJdGVtVW5zZWxlY3RlZCA9IHRoaXMuZG9Xb3JrT2ZEZXNlbGVjdEFsbE5vZGVzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBDaGVja2JveFNlbGVjdGlvbkNoaWxkcmVuKCkgJiYgbm9kZVRvU2VsZWN0Lmdyb3VwKSB7XHJcbiAgICAgICAgLy8gZG9uJ3Qgc2VsZWN0IHRoZSBncm91cCwgc2VsZWN0IHRoZSBjaGlsZHJlbiBpbnN0ZWFkXHJcbiAgICAgICAgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCA9IHRoaXMucmVjdXJzaXZlbHlTZWxlY3RBbGxDaGlsZHJlbihub2RlVG9TZWxlY3QpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBzZWUgaWYgcm93IG5lZWRzIHRvIGJlIHNlbGVjdGVkXHJcbiAgICAgICAgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCA9IHRoaXMuZG9Xb3JrT2ZTZWxlY3ROb2RlKG5vZGVUb1NlbGVjdCwgc3VwcHJlc3NFdmVudHMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhdExlYXN0T25lSXRlbVVuc2VsZWN0ZWQgfHwgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCkge1xyXG4gICAgICAgIHRoaXMuc3luY1NlbGVjdGVkUm93c0FuZENhbGxMaXN0ZW5lcihzdXBwcmVzc0V2ZW50cyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51cGRhdGVHcm91cFBhcmVudHNJZk5lZWRlZCgpO1xyXG59O1xyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlTZWxlY3RBbGxDaGlsZHJlbiA9IGZ1bmN0aW9uKG5vZGUsIHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICB2YXIgYXRMZWFzdE9uZSA9IGZhbHNlO1xyXG4gICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZWN1cnNpdmVseVNlbGVjdEFsbENoaWxkcmVuKGNoaWxkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0TGVhc3RPbmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZG9Xb3JrT2ZTZWxlY3ROb2RlKGNoaWxkLCBzdXBwcmVzc0V2ZW50cykpIHtcclxuICAgICAgICAgICAgICAgICAgICBhdExlYXN0T25lID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhdExlYXN0T25lO1xyXG59O1xyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlEZXNlbGVjdEFsbENoaWxkcmVuID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5RGVzZWxlY3RBbGxDaGlsZHJlbihjaGlsZCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0UmVhbE5vZGUoY2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyAxIC0gc2VsZWN0cyBhIG5vZGVcclxuLy8gMiAtIHVwZGF0ZXMgdGhlIFVJXHJcbi8vIDMgLSBjYWxscyBjYWxsYmFja3NcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZG9Xb3JrT2ZTZWxlY3ROb2RlID0gZnVuY3Rpb24obm9kZSwgc3VwcHJlc3NFdmVudHMpIHtcclxuICAgIGlmICh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW25vZGUuaWRdKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRbbm9kZS5pZF0gPSBub2RlO1xyXG5cclxuICAgIHRoaXMuYWRkQ3NzQ2xhc3NGb3JOb2RlX2FuZEluZm9ybVZpcnR1YWxSb3dMaXN0ZW5lcihub2RlKTtcclxuXHJcbiAgICAvLyBhbHNvIGNvbG9yIGluIHRoZSBmb290ZXIgaWYgdGhlcmUgaXMgb25lXHJcbiAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmV4cGFuZGVkICYmIG5vZGUuc2libGluZykge1xyXG4gICAgICAgIHRoaXMuYWRkQ3NzQ2xhc3NGb3JOb2RlX2FuZEluZm9ybVZpcnR1YWxSb3dMaXN0ZW5lcihub2RlLnNpYmxpbmcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGluZm9ybSB0aGUgcm93U2VsZWN0ZWQgbGlzdGVuZXIsIGlmIGFueVxyXG4gICAgaWYgKCFzdXBwcmVzc0V2ZW50cyAmJiB0eXBlb2YgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93U2VsZWN0ZWQoKSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93U2VsZWN0ZWQoKShub2RlLmRhdGEsIG5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyAxIC0gc2VsZWN0cyBhIG5vZGVcclxuLy8gMiAtIHVwZGF0ZXMgdGhlIFVJXHJcbi8vIDMgLSBjYWxscyBjYWxsYmFja3NcclxuLy8gd293IC0gd2hhdCBhIGJpZyBuYW1lIGZvciBhIG1ldGhvZCwgZXhjZXB0aW9uIGNhc2UsIGl0J3Mgc2F5aW5nIHdoYXQgdGhlIG1ldGhvZCBkb2VzXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmFkZENzc0NsYXNzRm9yTm9kZV9hbmRJbmZvcm1WaXJ0dWFsUm93TGlzdGVuZXIgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICB2YXIgdmlydHVhbFJlbmRlcmVkUm93SW5kZXggPSB0aGlzLnJvd1JlbmRlcmVyLmdldEluZGV4T2ZSZW5kZXJlZE5vZGUobm9kZSk7XHJcbiAgICBpZiAodmlydHVhbFJlbmRlcmVkUm93SW5kZXggPj0gMCkge1xyXG4gICAgICAgIHV0aWxzLnF1ZXJ5U2VsZWN0b3JBbGxfYWRkQ3NzQ2xhc3ModGhpcy5lUm93c1BhcmVudCwgJ1tyb3c9XCInICsgdmlydHVhbFJlbmRlcmVkUm93SW5kZXggKyAnXCJdJywgJ2FnLXJvdy1zZWxlY3RlZCcpO1xyXG5cclxuICAgICAgICAvLyBpbmZvcm0gdmlydHVhbCByb3cgbGlzdGVuZXJcclxuICAgICAgICB0aGlzLmFuZ3VsYXJHcmlkLm9uVmlydHVhbFJvd1NlbGVjdGVkKHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4LCB0cnVlKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuLy8gMSAtIHVuLXNlbGVjdHMgYSBub2RlXHJcbi8vIDIgLSB1cGRhdGVzIHRoZSBVSVxyXG4vLyAzIC0gY2FsbHMgY2FsbGJhY2tzXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmRvV29ya09mRGVzZWxlY3RBbGxOb2RlcyA9IGZ1bmN0aW9uKG5vZGVUb0tlZXBTZWxlY3RlZCkge1xyXG4gICAgLy8gbm90IGRvaW5nIG11bHRpLXNlbGVjdCwgc28gZGVzZWxlY3QgZXZlcnl0aGluZyBvdGhlciB0aGFuIHRoZSAnanVzdCBzZWxlY3RlZCcgcm93XHJcbiAgICB2YXIgYXRMZWFzdE9uZVNlbGVjdGlvbkNoYW5nZTtcclxuICAgIHZhciBzZWxlY3RlZE5vZGVLZXlzID0gT2JqZWN0LmtleXModGhpcy5zZWxlY3RlZE5vZGVzQnlJZCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGVkTm9kZUtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAvLyBza2lwIHRoZSAnanVzdCBzZWxlY3RlZCcgcm93XHJcbiAgICAgICAgdmFyIGtleSA9IHNlbGVjdGVkTm9kZUtleXNbaV07XHJcbiAgICAgICAgdmFyIG5vZGVUb0Rlc2VsZWN0ID0gdGhpcy5zZWxlY3RlZE5vZGVzQnlJZFtrZXldO1xyXG4gICAgICAgIGlmIChub2RlVG9EZXNlbGVjdCA9PT0gbm9kZVRvS2VlcFNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RSZWFsTm9kZShub2RlVG9EZXNlbGVjdCk7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVTZWxlY3Rpb25DaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhdExlYXN0T25lU2VsZWN0aW9uQ2hhbmdlO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5kZXNlbGVjdFJlYWxOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgLy8gZGVzZWxlY3QgdGhlIGNzc1xyXG4gICAgdGhpcy5yZW1vdmVDc3NDbGFzc0Zvck5vZGUobm9kZSk7XHJcblxyXG4gICAgLy8gaWYgbm9kZSBpcyBhIGhlYWRlciwgYW5kIGlmIGl0IGhhcyBhIHNpYmxpbmcgZm9vdGVyLCBkZXNlbGVjdCB0aGUgZm9vdGVyIGFsc29cclxuICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuZXhwYW5kZWQgJiYgbm9kZS5zaWJsaW5nKSB7IC8vIGFsc28gY2hlY2sgdGhhdCBpdCdzIGV4cGFuZGVkLCBhcyBzaWJsaW5nIGNvdWxkIGJlIGEgZ2hvc3RcclxuICAgICAgICB0aGlzLnJlbW92ZUNzc0NsYXNzRm9yTm9kZShub2RlLnNpYmxpbmcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlbW92ZSB0aGUgcm93XHJcbiAgICBkZWxldGUgdGhpcy5zZWxlY3RlZE5vZGVzQnlJZFtub2RlLmlkXTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucmVtb3ZlQ3NzQ2xhc3NGb3JOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ID0gdGhpcy5yb3dSZW5kZXJlci5nZXRJbmRleE9mUmVuZGVyZWROb2RlKG5vZGUpO1xyXG4gICAgaWYgKHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ID49IDApIHtcclxuICAgICAgICB1dGlscy5xdWVyeVNlbGVjdG9yQWxsX3JlbW92ZUNzc0NsYXNzKHRoaXMuZVJvd3NQYXJlbnQsICdbcm93PVwiJyArIHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ICsgJ1wiXScsICdhZy1yb3ctc2VsZWN0ZWQnKTtcclxuICAgICAgICAvLyBpbmZvcm0gdmlydHVhbCByb3cgbGlzdGVuZXJcclxuICAgICAgICB0aGlzLmFuZ3VsYXJHcmlkLm9uVmlydHVhbFJvd1NlbGVjdGVkKHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4LCBmYWxzZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgKHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSlcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZGVzZWxlY3RJbmRleCA9IGZ1bmN0aW9uKHJvd0luZGV4KSB7XHJcbiAgICB2YXIgbm9kZSA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvdyhyb3dJbmRleCk7XHJcbiAgICB0aGlzLmRlc2VsZWN0Tm9kZShub2RlKTtcclxufTtcclxuXHJcbi8vIHB1YmxpYyAoYXBpKVxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5kZXNlbGVjdE5vZGUgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICBpZiAobm9kZSkge1xyXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwQ2hlY2tib3hTZWxlY3Rpb25DaGlsZHJlbigpICYmIG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgLy8gd2FudCB0byBkZXNlbGVjdCBjaGlsZHJlbiwgbm90IHRoaXMgbm9kZSwgc28gcmVjdXJzaXZlbHkgZGVzZWxlY3RcclxuICAgICAgICAgICAgdGhpcy5yZWN1cnNpdmVseURlc2VsZWN0QWxsQ2hpbGRyZW4obm9kZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kZXNlbGVjdFJlYWxOb2RlKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuc3luY1NlbGVjdGVkUm93c0FuZENhbGxMaXN0ZW5lcigpO1xyXG4gICAgdGhpcy51cGRhdGVHcm91cFBhcmVudHNJZk5lZWRlZCgpO1xyXG59O1xyXG5cclxuLy8gcHVibGljIChzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkgJiBhcGkpXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnNlbGVjdEluZGV4ID0gZnVuY3Rpb24oaW5kZXgsIHRyeU11bHRpLCBzdXBwcmVzc0V2ZW50cykge1xyXG4gICAgdmFyIG5vZGUgPSB0aGlzLnJvd01vZGVsLmdldFZpcnR1YWxSb3coaW5kZXgpO1xyXG4gICAgdGhpcy5zZWxlY3ROb2RlKG5vZGUsIHRyeU11bHRpLCBzdXBwcmVzc0V2ZW50cyk7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbi8vIHVwZGF0ZXMgdGhlIHNlbGVjdGVkUm93cyB3aXRoIHRoZSBzZWxlY3RlZE5vZGVzIGFuZCBjYWxscyBzZWxlY3Rpb25DaGFuZ2VkIGxpc3RlbmVyXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnN5bmNTZWxlY3RlZFJvd3NBbmRDYWxsTGlzdGVuZXIgPSBmdW5jdGlvbihzdXBwcmVzc0V2ZW50cykge1xyXG4gICAgLy8gdXBkYXRlIHNlbGVjdGVkIHJvd3NcclxuICAgIHZhciBzZWxlY3RlZFJvd3MgPSB0aGlzLnNlbGVjdGVkUm93cztcclxuICAgIC8vIGNsZWFyIHNlbGVjdGVkIHJvd3NcclxuICAgIHNlbGVjdGVkUm93cy5sZW5ndGggPSAwO1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW2tleXNbaV1dICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkTm9kZSA9IHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRba2V5c1tpXV07XHJcbiAgICAgICAgICAgIHNlbGVjdGVkUm93cy5wdXNoKHNlbGVjdGVkTm9kZS5kYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFzdXBwcmVzc0V2ZW50cyAmJiB0eXBlb2YgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0U2VsZWN0aW9uQ2hhbmdlZCgpID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRTZWxlY3Rpb25DaGFuZ2VkKCkoKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQuJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgfSwgMCk7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnJlY3Vyc2l2ZWx5Q2hlY2tJZlNlbGVjdGVkID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIGZvdW5kU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgIHZhciBmb3VuZFVuc2VsZWN0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAobm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQuZ3JvdXApIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMucmVjdXJzaXZlbHlDaGVja0lmU2VsZWN0ZWQoY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFNFTEVDVEVEOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZFNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBVTlNFTEVDVEVEOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZFVuc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIE1JWEVEOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZFNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRVbnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIGNhbiBpZ25vcmUgdGhlIERPX05PVF9DQVJFLCBhcyBpdCBkb2Vzbid0IGltcGFjdCwgbWVhbnMgdGhlIGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGhhcyBubyBjaGlsZHJlbiBhbmQgc2hvdWxkbid0IGJlIGNvbnNpZGVyZWQgd2hlbiBkZWNpZGluZ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNOb2RlU2VsZWN0ZWQoY2hpbGQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmRTZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kVW5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChmb3VuZFNlbGVjdGVkICYmIGZvdW5kVW5zZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgbWl4ZWQsIHRoZW4gbm8gbmVlZCB0byBnbyBmdXJ0aGVyLCBqdXN0IHJldHVybiB1cCB0aGUgY2hhaW5cclxuICAgICAgICAgICAgICAgIHJldHVybiBNSVhFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBnb3QgdGhpcyBmYXIsIHNvIG5vIGNvbmZsaWN0cywgZWl0aGVyIGFsbCBjaGlsZHJlbiBzZWxlY3RlZCwgdW5zZWxlY3RlZCwgb3IgbmVpdGhlclxyXG4gICAgaWYgKGZvdW5kU2VsZWN0ZWQpIHtcclxuICAgICAgICByZXR1cm4gU0VMRUNURUQ7XHJcbiAgICB9IGVsc2UgaWYgKGZvdW5kVW5zZWxlY3RlZCkge1xyXG4gICAgICAgIHJldHVybiBVTlNFTEVDVEVEO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRE9fTk9UX0NBUkU7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgKHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSlcclxuLy8gcmV0dXJuczpcclxuLy8gdHJ1ZTogaWYgc2VsZWN0ZWRcclxuLy8gZmFsc2U6IGlmIHVuc2VsZWN0ZWRcclxuLy8gdW5kZWZpbmVkOiBpZiBpdCdzIGEgZ3JvdXAgYW5kICdjaGlsZHJlbiBzZWxlY3Rpb24nIGlzIHVzZWQgYW5kICdjaGlsZHJlbicgYXJlIGEgbWl4IG9mIHNlbGVjdGVkIGFuZCB1bnNlbGVjdGVkXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmlzTm9kZVNlbGVjdGVkID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBDaGVja2JveFNlbGVjdGlvbkNoaWxkcmVuKCkgJiYgbm9kZS5ncm91cCkge1xyXG4gICAgICAgIC8vIGRvaW5nIGNoaWxkIHNlbGVjdGlvbiwgd2UgbmVlZCB0byB0cmF2ZXJzZSB0aGUgY2hpbGRyZW5cclxuICAgICAgICB2YXIgcmVzdWx0T2ZDaGlsZHJlbiA9IHRoaXMucmVjdXJzaXZlbHlDaGVja0lmU2VsZWN0ZWQobm9kZSk7XHJcbiAgICAgICAgc3dpdGNoIChyZXN1bHRPZkNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgIGNhc2UgU0VMRUNURUQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgY2FzZSBVTlNFTEVDVEVEOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW25vZGUuaWRdICE9PSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbn07XHJcblxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVHcm91cFBhcmVudHNJZk5lZWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gd2Ugb25seSBkbyB0aGlzIGlmIHBhcmVudCBub2RlcyBhcmUgcmVzcG9uc2libGVcclxuICAgIC8vIGZvciBzZWxlY3RpbmcgdGhlaXIgY2hpbGRyZW4uXHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBDaGVja2JveFNlbGVjdGlvbkNoaWxkcmVuKCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGZpcnN0Um93ID0gdGhpcy5yb3dSZW5kZXJlci5nZXRGaXJzdFZpcnR1YWxSZW5kZXJlZFJvdygpO1xyXG4gICAgdmFyIGxhc3RSb3cgPSB0aGlzLnJvd1JlbmRlcmVyLmdldExhc3RWaXJ0dWFsUmVuZGVyZWRSb3coKTtcclxuICAgIGZvciAodmFyIHJvd0luZGV4ID0gZmlyc3RSb3c7IHJvd0luZGV4IDw9IGxhc3RSb3c7IHJvd0luZGV4KyspIHtcclxuICAgICAgICAvLyBzZWUgaWYgbm9kZSBpcyBhIGdyb3VwXHJcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnJvd01vZGVsLmdldFZpcnR1YWxSb3cocm93SW5kZXgpO1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IHRoaXMuaXNOb2RlU2VsZWN0ZWQobm9kZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYW5ndWxhckdyaWQub25WaXJ0dWFsUm93U2VsZWN0ZWQocm93SW5kZXgsIHNlbGVjdGVkKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgdXRpbHMucXVlcnlTZWxlY3RvckFsbF9hZGRDc3NDbGFzcyh0aGlzLmVSb3dzUGFyZW50LCAnW3Jvdz1cIicgKyByb3dJbmRleCArICdcIl0nLCAnYWctcm93LXNlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5xdWVyeVNlbGVjdG9yQWxsX3JlbW92ZUNzc0NsYXNzKHRoaXMuZVJvd3NQYXJlbnQsICdbcm93PVwiJyArIHJvd0luZGV4ICsgJ1wiXScsICdhZy1yb3ctc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0aW9uQ29udHJvbGxlcjtcclxuIiwiZnVuY3Rpb24gU2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5KCkge31cclxuXHJcblNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGFuZ3VsYXJHcmlkLCBzZWxlY3Rpb25Db250cm9sbGVyKSB7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkID0gYW5ndWxhckdyaWQ7XHJcbiAgICB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIgPSBzZWxlY3Rpb25Db250cm9sbGVyO1xyXG59O1xyXG5cclxuU2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LnByb3RvdHlwZS5jcmVhdGVDaGVja2JveENvbERlZiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB3aWR0aDogMzAsXHJcbiAgICAgICAgc3VwcHJlc3NNZW51OiB0cnVlLFxyXG4gICAgICAgIHN1cHByZXNzU29ydGluZzogdHJ1ZSxcclxuICAgICAgICBoZWFkZXJDZWxsUmVuZGVyZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgZUNoZWNrYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgZUNoZWNrYm94LnR5cGUgPSAnY2hlY2tib3gnO1xyXG4gICAgICAgICAgICBlQ2hlY2tib3gubmFtZSA9ICduYW1lJztcclxuICAgICAgICAgICAgcmV0dXJuIGVDaGVja2JveDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNlbGxSZW5kZXJlcjogdGhpcy5jcmVhdGVDaGVja2JveFJlbmRlcmVyKClcclxuICAgIH07XHJcbn07XHJcblxyXG5TZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZUNoZWNrYm94UmVuZGVyZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHJldHVybiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgICByZXR1cm4gdGhhdC5jcmVhdGVTZWxlY3Rpb25DaGVja2JveChwYXJhbXMubm9kZSwgcGFyYW1zLnJvd0luZGV4KTtcclxuICAgIH07XHJcbn07XHJcblxyXG5TZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZVNlbGVjdGlvbkNoZWNrYm94ID0gZnVuY3Rpb24obm9kZSwgcm93SW5kZXgpIHtcclxuXHJcbiAgICB2YXIgZUNoZWNrYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgIGVDaGVja2JveC50eXBlID0gXCJjaGVja2JveFwiO1xyXG4gICAgZUNoZWNrYm94Lm5hbWUgPSBcIm5hbWVcIjtcclxuICAgIGVDaGVja2JveC5jbGFzc05hbWUgPSAnYWctc2VsZWN0aW9uLWNoZWNrYm94JztcclxuICAgIHNldENoZWNrYm94U3RhdGUoZUNoZWNrYm94LCB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIuaXNOb2RlU2VsZWN0ZWQobm9kZSkpO1xyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGVDaGVja2JveC5vbmNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIH07XHJcblxyXG4gICAgZUNoZWNrYm94Lm9uY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG5ld1ZhbHVlID0gZUNoZWNrYm94LmNoZWNrZWQ7XHJcbiAgICAgICAgaWYgKG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5zZWxlY3RJbmRleChyb3dJbmRleCwgdHJ1ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLmRlc2VsZWN0SW5kZXgocm93SW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5hbmd1bGFyR3JpZC5hZGRWaXJ0dWFsUm93TGlzdGVuZXIocm93SW5kZXgsIHtcclxuICAgICAgICByb3dTZWxlY3RlZDogZnVuY3Rpb24oc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgc2V0Q2hlY2tib3hTdGF0ZShlQ2hlY2tib3gsIHNlbGVjdGVkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJvd1JlbW92ZWQ6IGZ1bmN0aW9uKCkge31cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBlQ2hlY2tib3g7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBzZXRDaGVja2JveFN0YXRlKGVDaGVja2JveCwgc3RhdGUpIHtcclxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09ICdib29sZWFuJykge1xyXG4gICAgICAgIGVDaGVja2JveC5jaGVja2VkID0gc3RhdGU7XHJcbiAgICAgICAgZUNoZWNrYm94LmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gaXNOb2RlU2VsZWN0ZWQgcmV0dXJucyBiYWNrIHVuZGVmaW5lZCBpZiBpdCdzIGEgZ3JvdXAgYW5kIHRoZSBjaGlsZHJlblxyXG4gICAgICAgIC8vIGFyZSBhIG1peCBvZiBzZWxlY3RlZCBhbmQgdW5zZWxlY3RlZFxyXG4gICAgICAgIGVDaGVja2JveC5pbmRldGVybWluYXRlID0gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3Rpb25SZW5kZXJlckZhY3Rvcnk7XHJcbiIsInZhciBTVkdfTlMgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI7XHJcblxyXG5mdW5jdGlvbiBTdmdGYWN0b3J5KCkge31cclxuXHJcblN2Z0ZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZUZpbHRlclN2ZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGVTdmcgPSBjcmVhdGVJY29uU3ZnKCk7XHJcblxyXG4gICAgdmFyIGVGdW5uZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCBcInBvbHlnb25cIik7XHJcbiAgICBlRnVubmVsLnNldEF0dHJpYnV0ZShcInBvaW50c1wiLCBcIjAsMCA0LDQgNCwxMCA2LDEwIDYsNCAxMCwwXCIpO1xyXG4gICAgZUZ1bm5lbC5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcImFnLWhlYWRlci1pY29uXCIpO1xyXG4gICAgZVN2Zy5hcHBlbmRDaGlsZChlRnVubmVsKTtcclxuXHJcbiAgICByZXR1cm4gZVN2ZztcclxufTtcclxuXHJcblN2Z0ZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZU1lbnVTdmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBlU3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgXCJzdmdcIik7XHJcbiAgICB2YXIgc2l6ZSA9IFwiMTJcIjtcclxuICAgIGVTdmcuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgc2l6ZSk7XHJcbiAgICBlU3ZnLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBzaXplKTtcclxuXHJcbiAgICBbXCIwXCIsIFwiNVwiLCBcIjEwXCJdLmZvckVhY2goZnVuY3Rpb24oeSkge1xyXG4gICAgICAgIHZhciBlTGluZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsIFwicmVjdFwiKTtcclxuICAgICAgICBlTGluZS5zZXRBdHRyaWJ1dGUoXCJ5XCIsIHkpO1xyXG4gICAgICAgIGVMaW5lLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIHNpemUpO1xyXG4gICAgICAgIGVMaW5lLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBcIjJcIik7XHJcbiAgICAgICAgZUxpbmUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJhZy1oZWFkZXItaWNvblwiKTtcclxuICAgICAgICBlU3ZnLmFwcGVuZENoaWxkKGVMaW5lKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBlU3ZnO1xyXG59O1xyXG5cclxuU3ZnRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlQXJyb3dVcFN2ZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGNyZWF0ZVBvbHlnb25TdmcoXCIwLDEwIDUsMCAxMCwxMFwiKTtcclxufTtcclxuXHJcblN2Z0ZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZUFycm93TGVmdFN2ZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGNyZWF0ZVBvbHlnb25TdmcoXCIxMCwwIDAsNSAxMCwxMFwiKTtcclxufTtcclxuXHJcblN2Z0ZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZUFycm93RG93blN2ZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGNyZWF0ZVBvbHlnb25TdmcoXCIwLDAgNSwxMCAxMCwwXCIpO1xyXG59O1xyXG5cclxuU3ZnRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlQXJyb3dSaWdodFN2ZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGNyZWF0ZVBvbHlnb25TdmcoXCIwLDAgMTAsNSAwLDEwXCIpO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlUG9seWdvblN2Zyhwb2ludHMpIHtcclxuICAgIHZhciBlU3ZnID0gY3JlYXRlSWNvblN2ZygpO1xyXG5cclxuICAgIHZhciBlRGVzY0ljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCBcInBvbHlnb25cIik7XHJcbiAgICBlRGVzY0ljb24uc2V0QXR0cmlidXRlKFwicG9pbnRzXCIsIHBvaW50cyk7XHJcbiAgICBlU3ZnLmFwcGVuZENoaWxkKGVEZXNjSWNvbik7XHJcblxyXG4gICAgcmV0dXJuIGVTdmc7XHJcbn1cclxuXHJcbi8vIHV0aWwgZnVuY3Rpb24gZm9yIHRoZSBhYm92ZVxyXG5mdW5jdGlvbiBjcmVhdGVJY29uU3ZnKCkge1xyXG4gICAgdmFyIGVTdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCBcInN2Z1wiKTtcclxuICAgIGVTdmcuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgXCIxMFwiKTtcclxuICAgIGVTdmcuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIFwiMTBcIik7XHJcbiAgICByZXR1cm4gZVN2ZztcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTdmdGYWN0b3J5O1xyXG4iLCJ2YXIgdGVtcGxhdGUgPSBbXHJcbiAgICAnPGRpdiBjbGFzcz1cImFnLXJvb3QgYWctc2Nyb2xsc1wiPicsXHJcbiAgICAnICAgIDwhLS0gVGhlIGxvYWRpbmcgcGFuZWwgLS0+JyxcclxuICAgICcgICAgPCEtLSB3cmFwcGluZyBpbiBvdXRlciBkaXYsIGFuZCB3cmFwcGVyLCBpcyBuZWVkZWQgdG8gY2VudGVyIHRoZSBsb2FkaW5nIGljb24gLS0+JyxcclxuICAgICcgICAgPCEtLSBUaGUgaWRlYSBmb3IgY2VudGVyaW5nIGNhbWUgZnJvbSBoZXJlOiBodHRwOi8vd3d3LnZhbnNlb2Rlc2lnbi5jb20vY3NzL3ZlcnRpY2FsLWNlbnRlcmluZy8gLS0+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLWxvYWRpbmctcGFuZWxcIj4nLFxyXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cImFnLWxvYWRpbmctd3JhcHBlclwiPicsXHJcbiAgICAnICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJhZy1sb2FkaW5nLWNlbnRlclwiPkxvYWRpbmcuLi48L3NwYW4+JyxcclxuICAgICcgICAgICAgIDwvZGl2PicsXHJcbiAgICAnICAgIDwvZGl2PicsXHJcbiAgICAnICAgIDwhLS0gaGVhZGVyIC0tPicsXHJcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJhZy1oZWFkZXJcIj4nLFxyXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cImFnLXBpbm5lZC1oZWFkZXJcIj48L2Rpdj48ZGl2IGNsYXNzPVwiYWctaGVhZGVyLXZpZXdwb3J0XCI+PGRpdiBjbGFzcz1cImFnLWhlYWRlci1jb250YWluZXJcIj48L2Rpdj48L2Rpdj4nLFxyXG4gICAgJyAgICA8L2Rpdj4nLFxyXG4gICAgJyAgICA8IS0tIGJvZHkgLS0+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLWJvZHlcIj4nLFxyXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cImFnLXBpbm5lZC1jb2xzLXZpZXdwb3J0XCI+JyxcclxuICAgICcgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWctcGlubmVkLWNvbHMtY29udGFpbmVyXCI+PC9kaXY+JyxcclxuICAgICcgICAgICAgIDwvZGl2PicsXHJcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiYWctYm9keS12aWV3cG9ydC13cmFwcGVyXCI+JyxcclxuICAgICcgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWctYm9keS12aWV3cG9ydFwiPicsXHJcbiAgICAnICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZy1ib2R5LWNvbnRhaW5lclwiPjwvZGl2PicsXHJcbiAgICAnICAgICAgICAgICAgPC9kaXY+JyxcclxuICAgICcgICAgICAgIDwvZGl2PicsXHJcbiAgICAnICAgIDwvZGl2PicsXHJcbiAgICAnICAgIDwhLS0gUGFnaW5nIC0tPicsXHJcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJhZy1wYWdpbmctcGFuZWxcIj4nLFxyXG4gICAgJyAgICA8L2Rpdj4nLFxyXG4gICAgJyAgICA8L2Rpdj4nXHJcbl0uam9pbignJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xyXG4iLCJ2YXIgdGVtcGxhdGUgPSBbXHJcbiAgICAnPGRpdiBjbGFzcz1cImFnLXJvb3QgYWctbm8tc2Nyb2xsc1wiPicsXHJcbiAgICAnICAgIDwhLS0gU2VlIGNvbW1lbnQgaW4gdGVtcGxhdGUuaHRtbCBmb3Igd2h5IGxvYWRpbmcgaXMgbGFpZCBvdXQgbGlrZSBzbyAtLT4nLFxyXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYWctbG9hZGluZy1wYW5lbFwiPicsXHJcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiYWctbG9hZGluZy13cmFwcGVyXCI+JyxcclxuICAgICcgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImFnLWxvYWRpbmctY2VudGVyXCI+TG9hZGluZy4uLjwvc3Bhbj4nLFxyXG4gICAgJyAgICAgICAgPC9kaXY+JyxcclxuICAgICcgICAgPC9kaXY+JyxcclxuICAgICcgICAgPCEtLSBoZWFkZXIgLS0+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLWhlYWRlci1jb250YWluZXJcIj48L2Rpdj4nLFxyXG4gICAgJyAgICA8IS0tIGJvZHkgLS0+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLWJvZHktY29udGFpbmVyXCI+PC9kaXY+JyxcclxuICAgICc8L2Rpdj4nXHJcbl0uam9pbignJyk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcclxuIiwiXHJcbmZ1bmN0aW9uIFRlbXBsYXRlU2VydmljZSgpIHtcclxuICAgIHRoaXMudGVtcGxhdGVDYWNoZSA9IHt9O1xyXG4gICAgdGhpcy53YWl0aW5nQ2FsbGJhY2tzID0ge307XHJcbn1cclxuXHJcblRlbXBsYXRlU2VydmljZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgkc2NvcGUpIHtcclxuICAgIHRoaXMuJHNjb3BlID0gJHNjb3BlO1xyXG59O1xyXG5cclxuLy8gcmV0dXJucyB0aGUgdGVtcGxhdGUgaWYgaXQgaXMgbG9hZGVkLCBvciBudWxsIGlmIGl0IGlzIG5vdCBsb2FkZWRcclxuLy8gYnV0IHdpbGwgY2FsbCB0aGUgY2FsbGJhY2sgd2hlbiBpdCBpcyBsb2FkZWRcclxuVGVtcGxhdGVTZXJ2aWNlLnByb3RvdHlwZS5nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKSB7XHJcblxyXG4gICAgdmFyIHRlbXBsYXRlRnJvbUNhY2hlID0gdGhpcy50ZW1wbGF0ZUNhY2hlW3VybF07XHJcbiAgICBpZiAodGVtcGxhdGVGcm9tQ2FjaGUpIHtcclxuICAgICAgICByZXR1cm4gdGVtcGxhdGVGcm9tQ2FjaGU7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNhbGxiYWNrTGlzdCA9IHRoaXMud2FpdGluZ0NhbGxiYWNrc1t1cmxdO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgaWYgKCFjYWxsYmFja0xpc3QpIHtcclxuICAgICAgICAvLyBmaXJzdCB0aW1lIHRoaXMgd2FzIGNhbGxlZCwgc28gbmVlZCBhIG5ldyBsaXN0IGZvciBjYWxsYmFja3NcclxuICAgICAgICBjYWxsYmFja0xpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLndhaXRpbmdDYWxsYmFja3NbdXJsXSA9IGNhbGxiYWNrTGlzdDtcclxuICAgICAgICAvLyBhbmQgYWxzbyBuZWVkIHRvIGRvIHRoZSBodHRwIHJlcXVlc3RcclxuICAgICAgICB2YXIgY2xpZW50ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgY2xpZW50Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHsgdGhhdC5oYW5kbGVIdHRwUmVzdWx0KHRoaXMsIHVybCk7IH07XHJcbiAgICAgICAgY2xpZW50Lm9wZW4oXCJHRVRcIiwgdXJsKTtcclxuICAgICAgICBjbGllbnQuc2VuZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFkZCB0aGlzIGNhbGxiYWNrXHJcbiAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICBjYWxsYmFja0xpc3QucHVzaChjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2FsbGVyIG5lZWRzIHRvIHdhaXQgZm9yIHRlbXBsYXRlIHRvIGxvYWQsIHNvIHJldHVybiBudWxsXHJcbiAgICByZXR1cm4gbnVsbDtcclxufTtcclxuXHJcblRlbXBsYXRlU2VydmljZS5wcm90b3R5cGUuaGFuZGxlSHR0cFJlc3VsdCA9IGZ1bmN0aW9uIChodHRwUmVzdWx0LCB1cmwpIHtcclxuXHJcbiAgICBpZiAoaHR0cFJlc3VsdC5zdGF0dXMgIT09IDIwMCB8fCBodHRwUmVzdWx0LnJlc3BvbnNlID09PSBudWxsKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1VuYWJsZSB0byBnZXQgdGVtcGxhdGUgZXJyb3IgJyArIGh0dHBSZXN1bHQuc3RhdHVzICsgJyAtICcgKyB1cmwpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZXNwb25zZSBzdWNjZXNzLCBzbyBwcm9jZXNzIGl0XHJcbiAgICB0aGlzLnRlbXBsYXRlQ2FjaGVbdXJsXSA9IGh0dHBSZXN1bHQucmVzcG9uc2U7XHJcblxyXG4gICAgLy8gaW5mb3JtIGFsbCBsaXN0ZW5lcnMgdGhhdCB0aGlzIGlzIG5vdyBpbiB0aGUgY2FjaGVcclxuICAgIHZhciBjYWxsYmFja3MgPSB0aGlzLndhaXRpbmdDYWxsYmFja3NbdXJsXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gY2FsbGJhY2tzW2ldO1xyXG4gICAgICAgIC8vIHdlIGNvdWxkIHBhc3MgdGhlIGNhbGxiYWNrIHRoZSByZXNwb25zZSwgaG93ZXZlciB3ZSBrbm93IHRoZSBjbGllbnQgb2YgdGhpcyBjb2RlXHJcbiAgICAgICAgLy8gaXMgdGhlIGNlbGwgcmVuZGVyZXIsIGFuZCBpdCBwYXNzZXMgdGhlICdjZWxsUmVmcmVzaCcgbWV0aG9kIGluIGFzIHRoZSBjYWxsYmFja1xyXG4gICAgICAgIC8vIHdoaWNoIGRvZXNuJ3QgdGFrZSBhbnkgcGFyYW1ldGVycy5cclxuICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLiRzY29wZSkge1xyXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LiRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9LCAwKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGVtcGxhdGVTZXJ2aWNlO1xyXG4iLCJmdW5jdGlvbiBVdGlscygpIHt9XHJcblxyXG5cclxuVXRpbHMucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24oZXhwcmVzc2lvblNlcnZpY2UsIGRhdGEsIGNvbERlZiwgbm9kZSwgYXBpLCBjb250ZXh0KSB7XHJcblxyXG4gICAgdmFyIHZhbHVlR2V0dGVyID0gY29sRGVmLnZhbHVlR2V0dGVyO1xyXG4gICAgdmFyIGZpZWxkID0gY29sRGVmLmZpZWxkO1xyXG5cclxuICAgIC8vIGlmIHRoZXJlIGlzIGEgdmFsdWUgZ2V0dGVyLCB0aGlzIGdldHMgcHJlY2VkZW5jZSBvdmVyIGEgZmllbGRcclxuICAgIGlmICh2YWx1ZUdldHRlcikge1xyXG5cclxuICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgYXBpOiBhcGksXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlR2V0dGVyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIC8vIHZhbHVlR2V0dGVyIGlzIGEgZnVuY3Rpb24sIHNvIGp1c3QgY2FsbCBpdFxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVHZXR0ZXIocGFyYW1zKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZUdldHRlciA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgLy8gdmFsdWVHZXR0ZXIgaXMgYW4gZXhwcmVzc2lvbiwgc28gZXhlY3V0ZSB0aGUgZXhwcmVzc2lvblxyXG4gICAgICAgICAgICByZXR1cm4gZXhwcmVzc2lvblNlcnZpY2UuZXZhbHVhdGUodmFsdWVHZXR0ZXIsIHBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSBpZiAoZmllbGQgJiYgZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBkYXRhW2ZpZWxkXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxufTtcclxuXHJcbi8vUmV0dXJucyB0cnVlIGlmIGl0IGlzIGEgRE9NIG5vZGVcclxuLy90YWtlbiBmcm9tOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM4NDI4Ni9qYXZhc2NyaXB0LWlzZG9tLWhvdy1kby15b3UtY2hlY2staWYtYS1qYXZhc2NyaXB0LW9iamVjdC1pcy1hLWRvbS1vYmplY3RcclxuVXRpbHMucHJvdG90eXBlLmlzTm9kZSA9IGZ1bmN0aW9uKG8pIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgdHlwZW9mIE5vZGUgPT09IFwib2JqZWN0XCIgPyBvIGluc3RhbmNlb2YgTm9kZSA6XHJcbiAgICAgICAgbyAmJiB0eXBlb2YgbyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2Ygby5ub2RlVHlwZSA9PT0gXCJudW1iZXJcIiAmJiB0eXBlb2Ygby5ub2RlTmFtZSA9PT0gXCJzdHJpbmdcIlxyXG4gICAgKTtcclxufTtcclxuXHJcbi8vUmV0dXJucyB0cnVlIGlmIGl0IGlzIGEgRE9NIGVsZW1lbnRcclxuLy90YWtlbiBmcm9tOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM4NDI4Ni9qYXZhc2NyaXB0LWlzZG9tLWhvdy1kby15b3UtY2hlY2staWYtYS1qYXZhc2NyaXB0LW9iamVjdC1pcy1hLWRvbS1vYmplY3RcclxuVXRpbHMucHJvdG90eXBlLmlzRWxlbWVudCA9IGZ1bmN0aW9uKG8pIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgdHlwZW9mIEhUTUxFbGVtZW50ID09PSBcIm9iamVjdFwiID8gbyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50IDogLy9ET00yXHJcbiAgICAgICAgbyAmJiB0eXBlb2YgbyA9PT0gXCJvYmplY3RcIiAmJiBvICE9PSBudWxsICYmIG8ubm9kZVR5cGUgPT09IDEgJiYgdHlwZW9mIG8ubm9kZU5hbWUgPT09IFwic3RyaW5nXCJcclxuICAgICk7XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUuaXNOb2RlT3JFbGVtZW50ID0gZnVuY3Rpb24obykge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNOb2RlKG8pIHx8IHRoaXMuaXNFbGVtZW50KG8pO1xyXG59O1xyXG5cclxuLy9hZGRzIGFsbCB0eXBlIG9mIGNoYW5nZSBsaXN0ZW5lcnMgdG8gYW4gZWxlbWVudCwgaW50ZW5kZWQgdG8gYmUgYSB0ZXh0IGZpZWxkXHJcblV0aWxzLnByb3RvdHlwZS5hZGRDaGFuZ2VMaXN0ZW5lciA9IGZ1bmN0aW9uKGVsZW1lbnQsIGxpc3RlbmVyKSB7XHJcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VkXCIsIGxpc3RlbmVyKTtcclxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInBhc3RlXCIsIGxpc3RlbmVyKTtcclxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIGxpc3RlbmVyKTtcclxufTtcclxuXHJcbi8vaWYgdmFsdWUgaXMgdW5kZWZpbmVkLCBudWxsIG9yIGJsYW5rLCByZXR1cm5zIG51bGwsIG90aGVyd2lzZSByZXR1cm5zIHRoZSB2YWx1ZVxyXG5VdGlscy5wcm90b3R5cGUubWFrZU51bGwgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IFwiXCIpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnJlbW92ZUFsbENoaWxkcmVuID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKG5vZGUpIHtcclxuICAgICAgICB3aGlsZSAobm9kZS5oYXNDaGlsZE5vZGVzKCkpIHtcclxuICAgICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZChub2RlLmxhc3RDaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy9hZGRzIGFuIGVsZW1lbnQgdG8gYSBkaXYsIGJ1dCBhbHNvIGFkZHMgYSBiYWNrZ3JvdW5kIGNoZWNraW5nIGZvciBjbGlja3MsXHJcbi8vc28gdGhhdCB3aGVuIHRoZSBiYWNrZ3JvdW5kIGlzIGNsaWNrZWQsIHRoZSBjaGlsZCBpcyByZW1vdmVkIGFnYWluLCBnaXZpbmdcclxuLy9hIG1vZGVsIGxvb2sgdG8gcG9wdXBzLlxyXG5VdGlscy5wcm90b3R5cGUuYWRkQXNNb2RhbFBvcHVwID0gZnVuY3Rpb24oZVBhcmVudCwgZUNoaWxkKSB7XHJcbiAgICB2YXIgZUJhY2tkcm9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIGVCYWNrZHJvcC5jbGFzc05hbWUgPSBcImFnLXBvcHVwLWJhY2tkcm9wXCI7XHJcblxyXG4gICAgZUJhY2tkcm9wLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBlUGFyZW50LnJlbW92ZUNoaWxkKGVDaGlsZCk7XHJcbiAgICAgICAgZVBhcmVudC5yZW1vdmVDaGlsZChlQmFja2Ryb3ApO1xyXG4gICAgfTtcclxuXHJcbiAgICBlUGFyZW50LmFwcGVuZENoaWxkKGVCYWNrZHJvcCk7XHJcbiAgICBlUGFyZW50LmFwcGVuZENoaWxkKGVDaGlsZCk7XHJcbn07XHJcblxyXG4vL2xvYWRzIHRoZSB0ZW1wbGF0ZSBhbmQgcmV0dXJucyBpdCBhcyBhbiBlbGVtZW50LiBtYWtlcyB1cCBmb3Igbm8gc2ltcGxlIHdheSBpblxyXG4vL3RoZSBkb20gYXBpIHRvIGxvYWQgaHRtbCBkaXJlY3RseSwgZWcgd2UgY2Fubm90IGRvIHRoaXM6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGVtcGxhdGUpXHJcblV0aWxzLnByb3RvdHlwZS5sb2FkVGVtcGxhdGUgPSBmdW5jdGlvbih0ZW1wbGF0ZSkge1xyXG4gICAgdmFyIHRlbXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgdGVtcERpdi5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcclxuICAgIHJldHVybiB0ZW1wRGl2LmZpcnN0Q2hpbGQ7XHJcbn07XHJcblxyXG4vL2lmIHBhc3NlZCAnNDJweCcgdGhlbiByZXR1cm5zIHRoZSBudW1iZXIgNDJcclxuVXRpbHMucHJvdG90eXBlLnBpeGVsU3RyaW5nVG9OdW1iZXIgPSBmdW5jdGlvbih2YWwpIHtcclxuICAgIGlmICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgaWYgKHZhbC5pbmRleE9mKFwicHhcIikgPj0gMCkge1xyXG4gICAgICAgICAgICB2YWwucmVwbGFjZShcInB4XCIsIFwiXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQodmFsKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbDtcclxuICAgIH1cclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5xdWVyeVNlbGVjdG9yQWxsX2FkZENzc0NsYXNzID0gZnVuY3Rpb24oZVBhcmVudCwgc2VsZWN0b3IsIGNzc0NsYXNzKSB7XHJcbiAgICB2YXIgZVJvd3MgPSBlUGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBlUm93cy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgIHRoaXMuYWRkQ3NzQ2xhc3MoZVJvd3Nba10sIGNzc0NsYXNzKTtcclxuICAgIH1cclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5xdWVyeVNlbGVjdG9yQWxsX3JlbW92ZUNzc0NsYXNzID0gZnVuY3Rpb24oZVBhcmVudCwgc2VsZWN0b3IsIGNzc0NsYXNzKSB7XHJcbiAgICB2YXIgZVJvd3MgPSBlUGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBlUm93cy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlQ3NzQ2xhc3MoZVJvd3Nba10sIGNzc0NsYXNzKTtcclxuICAgIH1cclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5hZGRDc3NDbGFzcyA9IGZ1bmN0aW9uKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xyXG4gICAgdmFyIG9sZENsYXNzZXMgPSBlbGVtZW50LmNsYXNzTmFtZTtcclxuICAgIGlmIChvbGRDbGFzc2VzKSB7XHJcbiAgICAgICAgaWYgKG9sZENsYXNzZXMuaW5kZXhPZihjbGFzc05hbWUpID49IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9IG9sZENsYXNzZXMgKyBcIiBcIiArIGNsYXNzTmFtZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUucmVtb3ZlQ3NzQ2xhc3MgPSBmdW5jdGlvbihlbGVtZW50LCBjbGFzc05hbWUpIHtcclxuICAgIHZhciBvbGRDbGFzc2VzID0gZWxlbWVudC5jbGFzc05hbWU7XHJcbiAgICBpZiAob2xkQ2xhc3Nlcy5pbmRleE9mKGNsYXNzTmFtZSkgPCAwKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIG5ld0NsYXNzZXMgPSBvbGRDbGFzc2VzLnJlcGxhY2UoXCIgXCIgKyBjbGFzc05hbWUsIFwiXCIpO1xyXG4gICAgbmV3Q2xhc3NlcyA9IG5ld0NsYXNzZXMucmVwbGFjZShjbGFzc05hbWUgKyBcIiBcIiwgXCJcIik7XHJcbiAgICBpZiAobmV3Q2xhc3NlcyA9PSBjbGFzc05hbWUpIHtcclxuICAgICAgICBuZXdDbGFzc2VzID0gXCJcIjtcclxuICAgIH1cclxuICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gbmV3Q2xhc3NlcztcclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5yZW1vdmVGcm9tQXJyYXkgPSBmdW5jdGlvbihhcnJheSwgb2JqZWN0KSB7XHJcbiAgICBhcnJheS5zcGxpY2UoYXJyYXkuaW5kZXhPZihvYmplY3QpLCAxKTtcclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5kZWZhdWx0Q29tcGFyYXRvciA9IGZ1bmN0aW9uKHZhbHVlQSwgdmFsdWVCKSB7XHJcbiAgICB2YXIgdmFsdWVBTWlzc2luZyA9IHZhbHVlQSA9PT0gbnVsbCB8fCB2YWx1ZUEgPT09IHVuZGVmaW5lZDtcclxuICAgIHZhciB2YWx1ZUJNaXNzaW5nID0gdmFsdWVCID09PSBudWxsIHx8IHZhbHVlQiA9PT0gdW5kZWZpbmVkO1xyXG4gICAgaWYgKHZhbHVlQU1pc3NpbmcgJiYgdmFsdWVCTWlzc2luZykge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgaWYgKHZhbHVlQU1pc3NpbmcpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcbiAgICBpZiAodmFsdWVCTWlzc2luZykge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh2YWx1ZUEgPCB2YWx1ZUIpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlQSA+IHZhbHVlQikge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5mb3JtYXRXaWR0aCA9IGZ1bmN0aW9uKHdpZHRoKSB7XHJcbiAgICBpZiAodHlwZW9mIHdpZHRoID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgcmV0dXJuIHdpZHRoICsgXCJweFwiO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gd2lkdGg7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyB0cmllcyB0byB1c2UgdGhlIHByb3ZpZGVkIHJlbmRlcmVyLiBpZiBhIHJlbmRlcmVyIGZvdW5kLCByZXR1cm5zIHRydWUuXHJcbi8vIGlmIG5vIHJlbmRlcmVyLCByZXR1cm5zIGZhbHNlLlxyXG5VdGlscy5wcm90b3R5cGUudXNlUmVuZGVyZXIgPSBmdW5jdGlvbihlUGFyZW50LCBlUmVuZGVyZXIsIHBhcmFtcykge1xyXG4gICAgdmFyIHJlc3VsdEZyb21SZW5kZXJlciA9IGVSZW5kZXJlcihwYXJhbXMpO1xyXG4gICAgaWYgKHRoaXMuaXNOb2RlKHJlc3VsdEZyb21SZW5kZXJlcikgfHwgdGhpcy5pc0VsZW1lbnQocmVzdWx0RnJvbVJlbmRlcmVyKSkge1xyXG4gICAgICAgIC8vYSBkb20gbm9kZSBvciBlbGVtZW50IHdhcyByZXR1cm5lZCwgc28gYWRkIGNoaWxkXHJcbiAgICAgICAgZVBhcmVudC5hcHBlbmRDaGlsZChyZXN1bHRGcm9tUmVuZGVyZXIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvL290aGVyd2lzZSBhc3N1bWUgaXQgd2FzIGh0bWwsIHNvIGp1c3QgaW5zZXJ0XHJcbiAgICAgICAgdmFyIGVUZXh0U3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICBlVGV4dFNwYW4uaW5uZXJIVE1MID0gcmVzdWx0RnJvbVJlbmRlcmVyO1xyXG4gICAgICAgIGVQYXJlbnQuYXBwZW5kQ2hpbGQoZVRleHRTcGFuKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8vIGlmIGljb24gcHJvdmlkZWQsIHVzZSB0aGlzIChlaXRoZXIgYSBzdHJpbmcsIG9yIGEgZnVuY3Rpb24gY2FsbGJhY2spLlxyXG4vLyBpZiBub3QsIHRoZW4gdXNlIHRoZSBzZWNvbmQgcGFyYW1ldGVyLCB3aGljaCBpcyB0aGUgc3ZnRmFjdG9yeSBmdW5jdGlvblxyXG5VdGlscy5wcm90b3R5cGUuY3JlYXRlSWNvbiA9IGZ1bmN0aW9uKGljb25OYW1lLCBncmlkT3B0aW9uc1dyYXBwZXIsIGNvbERlZldyYXBwZXIsIHN2Z0ZhY3RvcnlGdW5jKSB7XHJcbiAgICB2YXIgZVJlc3VsdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgIHZhciB1c2VyUHJvdmlkZWRJY29uO1xyXG4gICAgLy8gY2hlY2sgY29sIGZvciBpY29uIGZpcnN0XHJcbiAgICBpZiAoY29sRGVmV3JhcHBlciAmJiBjb2xEZWZXcmFwcGVyLmNvbERlZi5pY29ucykge1xyXG4gICAgICAgIHVzZXJQcm92aWRlZEljb24gPSBjb2xEZWZXcmFwcGVyLmNvbERlZi5pY29uc1tpY29uTmFtZV07XHJcbiAgICB9XHJcbiAgICAvLyBpdCBub3QgaW4gY29sLCB0cnkgZ3JpZCBvcHRpb25zXHJcbiAgICBpZiAoIXVzZXJQcm92aWRlZEljb24gJiYgZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEljb25zKCkpIHtcclxuICAgICAgICB1c2VyUHJvdmlkZWRJY29uID0gZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEljb25zKClbaWNvbk5hbWVdO1xyXG4gICAgfVxyXG4gICAgLy8gbm93IGlmIHVzZXIgcHJvdmlkZWQsIHVzZSBpdFxyXG4gICAgaWYgKHVzZXJQcm92aWRlZEljb24pIHtcclxuICAgICAgICB2YXIgcmVuZGVyZXJSZXN1bHQ7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB1c2VyUHJvdmlkZWRJY29uID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHJlbmRlcmVyUmVzdWx0ID0gdXNlclByb3ZpZGVkSWNvbigpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHVzZXJQcm92aWRlZEljb24gPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHJlbmRlcmVyUmVzdWx0ID0gdXNlclByb3ZpZGVkSWNvbjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyAnaWNvbiBmcm9tIGdyaWQgb3B0aW9ucyBuZWVkcyB0byBiZSBhIHN0cmluZyBvciBhIGZ1bmN0aW9uJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiByZW5kZXJlclJlc3VsdCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgZVJlc3VsdC5pbm5lckhUTUwgPSByZW5kZXJlclJlc3VsdDtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNOb2RlT3JFbGVtZW50KHJlbmRlcmVyUmVzdWx0KSkge1xyXG4gICAgICAgICAgICBlUmVzdWx0LmFwcGVuZENoaWxkKHJlbmRlcmVyUmVzdWx0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyAnaWNvblJlbmRlcmVyIHNob3VsZCByZXR1cm4gYmFjayBhIHN0cmluZyBvciBhIGRvbSBvYmplY3QnO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlIHdlIHVzZSB0aGUgYnVpbHQgaW4gaWNvblxyXG4gICAgICAgIGVSZXN1bHQuYXBwZW5kQ2hpbGQoc3ZnRmFjdG9yeUZ1bmMoKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZVJlc3VsdDtcclxufTtcclxuXHJcblxyXG5VdGlscy5wcm90b3R5cGUuZ2V0U2Nyb2xsYmFyV2lkdGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgb3V0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgb3V0ZXIuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XHJcbiAgICBvdXRlci5zdHlsZS53aWR0aCA9IFwiMTAwcHhcIjtcclxuICAgIG91dGVyLnN0eWxlLm1zT3ZlcmZsb3dTdHlsZSA9IFwic2Nyb2xsYmFyXCI7IC8vIG5lZWRlZCBmb3IgV2luSlMgYXBwc1xyXG5cclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3V0ZXIpO1xyXG5cclxuICAgIHZhciB3aWR0aE5vU2Nyb2xsID0gb3V0ZXIub2Zmc2V0V2lkdGg7XHJcbiAgICAvLyBmb3JjZSBzY3JvbGxiYXJzXHJcbiAgICBvdXRlci5zdHlsZS5vdmVyZmxvdyA9IFwic2Nyb2xsXCI7XHJcblxyXG4gICAgLy8gYWRkIGlubmVyZGl2XHJcbiAgICB2YXIgaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgaW5uZXIuc3R5bGUud2lkdGggPSBcIjEwMCVcIjtcclxuICAgIG91dGVyLmFwcGVuZENoaWxkKGlubmVyKTtcclxuXHJcbiAgICB2YXIgd2lkdGhXaXRoU2Nyb2xsID0gaW5uZXIub2Zmc2V0V2lkdGg7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGRpdnNcclxuICAgIG91dGVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob3V0ZXIpO1xyXG5cclxuICAgIHJldHVybiB3aWR0aE5vU2Nyb2xsIC0gd2lkdGhXaXRoU2Nyb2xsO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVXRpbHMoKTtcclxuIiwiLypcclxuICogVGhpcyByb3cgY29udHJvbGxlciBpcyB1c2VkIGZvciBpbmZpbml0ZSBzY3JvbGxpbmcgb25seS4gRm9yIG5vcm1hbCAnaW4gbWVtb3J5JyB0YWJsZSxcclxuICogb3Igc3RhbmRhcmQgcGFnaW5hdGlvbiwgdGhlIGluTWVtb3J5Um93Q29udHJvbGxlciBpcyB1c2VkLlxyXG4gKi9cclxuXHJcbnZhciBsb2dnaW5nID0gdHJ1ZTtcclxuXHJcbmZ1bmN0aW9uIFZpcnR1YWxQYWdlUm93Q29udHJvbGxlcigpIHt9XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihyb3dSZW5kZXJlcikge1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlciA9IHJvd1JlbmRlcmVyO1xyXG4gICAgdGhpcy5kYXRhc291cmNlVmVyc2lvbiA9IDA7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnNldERhdGFzb3VyY2UgPSBmdW5jdGlvbihkYXRhc291cmNlKSB7XHJcbiAgICB0aGlzLmRhdGFzb3VyY2UgPSBkYXRhc291cmNlO1xyXG5cclxuICAgIGlmICghZGF0YXNvdXJjZSkge1xyXG4gICAgICAgIC8vIG9ubHkgY29udGludWUgaWYgd2UgaGF2ZSBhIHZhbGlkIGRhdGFzb3VyY2UgdG8gd29ya2luZyB3aXRoXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmVzZXQoKTtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIHNlZSBpZiBkYXRhc291cmNlIGtub3dzIGhvdyBtYW55IHJvd3MgdGhlcmUgYXJlXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZGF0YXNvdXJjZS5yb3dDb3VudCA9PT0gJ251bWJlcicgJiYgdGhpcy5kYXRhc291cmNlLnJvd0NvdW50ID49IDApIHtcclxuICAgICAgICB0aGlzLnZpcnR1YWxSb3dDb3VudCA9IHRoaXMuZGF0YXNvdXJjZS5yb3dDb3VudDtcclxuICAgICAgICB0aGlzLmZvdW5kTWF4Um93ID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy52aXJ0dWFsUm93Q291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuZm91bmRNYXhSb3cgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpbiBjYXNlIGFueSBkYWVtb24gcmVxdWVzdHMgY29taW5nIGZyb20gZGF0YXNvdXJjZSwgd2Uga25vdyBpdCBpZ25vcmUgdGhlbVxyXG4gICAgdGhpcy5kYXRhc291cmNlVmVyc2lvbisrO1xyXG5cclxuICAgIC8vIG1hcCBvZiBwYWdlIG51bWJlcnMgdG8gcm93cyBpbiB0aGF0IHBhZ2VcclxuICAgIHRoaXMucGFnZUNhY2hlID0ge307XHJcbiAgICB0aGlzLnBhZ2VDYWNoZVNpemUgPSAwO1xyXG5cclxuICAgIC8vIGlmIGEgbnVtYmVyIGlzIGluIHRoaXMgYXJyYXksIGl0IG1lYW5zIHdlIGFyZSBwZW5kaW5nIGEgbG9hZCBmcm9tIGl0XHJcbiAgICB0aGlzLnBhZ2VMb2Fkc0luUHJvZ3Jlc3MgPSBbXTtcclxuICAgIHRoaXMucGFnZUxvYWRzUXVldWVkID0gW107XHJcbiAgICB0aGlzLnBhZ2VBY2Nlc3NUaW1lcyA9IHt9OyAvLyBrZWVwcyBhIHJlY29yZCBvZiB3aGVuIGVhY2ggcGFnZSB3YXMgbGFzdCB2aWV3ZWQsIHVzZWQgZm9yIExSVSBjYWNoZVxyXG4gICAgdGhpcy5hY2Nlc3NUaW1lID0gMDsgLy8gcmF0aGVyIHRoYW4gdXNpbmcgdGhlIGNsb2NrLCB3ZSB1c2UgdGhpcyBjb3VudGVyXHJcblxyXG4gICAgLy8gdGhlIG51bWJlciBvZiBjb25jdXJyZW50IGxvYWRzIHdlIGFyZSBhbGxvd2VkIHRvIHRoZSBzZXJ2ZXJcclxuICAgIGlmICh0eXBlb2YgdGhpcy5kYXRhc291cmNlLm1heENvbmN1cnJlbnRSZXF1ZXN0cyA9PT0gJ251bWJlcicgJiYgdGhpcy5kYXRhc291cmNlLm1heENvbmN1cnJlbnRSZXF1ZXN0cyA+IDApIHtcclxuICAgICAgICB0aGlzLm1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHMgPSB0aGlzLmRhdGFzb3VyY2UubWF4Q29uY3VycmVudFJlcXVlc3RzO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHMgPSAyO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoZSBudW1iZXIgb2YgcGFnZXMgdG8ga2VlcCBpbiBicm93c2VyIGNhY2hlXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZGF0YXNvdXJjZS5tYXhQYWdlc0luQ2FjaGUgPT09ICdudW1iZXInICYmIHRoaXMuZGF0YXNvdXJjZS5tYXhQYWdlc0luQ2FjaGUgPiAwKSB7XHJcbiAgICAgICAgdGhpcy5tYXhQYWdlc0luQ2FjaGUgPSB0aGlzLmRhdGFzb3VyY2UubWF4UGFnZXNJbkNhY2hlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBudWxsIGlzIGRlZmF1bHQsIG1lYW5zIGRvbid0ICBoYXZlIGFueSBtYXggc2l6ZSBvbiB0aGUgY2FjaGVcclxuICAgICAgICB0aGlzLm1heFBhZ2VzSW5DYWNoZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5wYWdlU2l6ZSA9IHRoaXMuZGF0YXNvdXJjZS5wYWdlU2l6ZTsgLy8gdGFrZSBhIGNvcHkgb2YgcGFnZSBzaXplLCB3ZSBkb24ndCB3YW50IGl0IGNoYW5naW5nXHJcbiAgICB0aGlzLm92ZXJmbG93U2l6ZSA9IHRoaXMuZGF0YXNvdXJjZS5vdmVyZmxvd1NpemU7IC8vIHRha2UgYSBjb3B5IG9mIHBhZ2Ugc2l6ZSwgd2UgZG9uJ3Qgd2FudCBpdCBjaGFuZ2luZ1xyXG5cclxuICAgIHRoaXMuZG9Mb2FkT3JRdWV1ZSgwKTtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUuY3JlYXRlTm9kZXNGcm9tUm93cyA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIsIHJvd3MpIHtcclxuICAgIHZhciBub2RlcyA9IFtdO1xyXG4gICAgaWYgKHJvd3MpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IHJvd3MubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB2aXJ0dWFsUm93SW5kZXggPSAocGFnZU51bWJlciAqIHRoaXMucGFnZVNpemUpICsgaTtcclxuICAgICAgICAgICAgbm9kZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBkYXRhOiByb3dzW2ldLFxyXG4gICAgICAgICAgICAgICAgaWQ6IHZpcnR1YWxSb3dJbmRleFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbm9kZXM7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnJlbW92ZUZyb21Mb2FkaW5nID0gZnVuY3Rpb24ocGFnZU51bWJlcikge1xyXG4gICAgdmFyIGluZGV4ID0gdGhpcy5wYWdlTG9hZHNJblByb2dyZXNzLmluZGV4T2YocGFnZU51bWJlcik7XHJcbiAgICB0aGlzLnBhZ2VMb2Fkc0luUHJvZ3Jlc3Muc3BsaWNlKGluZGV4LCAxKTtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUucGFnZUxvYWRGYWlsZWQgPSBmdW5jdGlvbihwYWdlTnVtYmVyKSB7XHJcbiAgICB0aGlzLnJlbW92ZUZyb21Mb2FkaW5nKHBhZ2VOdW1iZXIpO1xyXG4gICAgdGhpcy5jaGVja1F1ZXVlRm9yTmV4dExvYWQoKTtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUucGFnZUxvYWRlZCA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIsIHJvd3MsIGxhc3RSb3cpIHtcclxuICAgIHRoaXMucHV0UGFnZUludG9DYWNoZUFuZFB1cmdlKHBhZ2VOdW1iZXIsIHJvd3MpO1xyXG4gICAgdGhpcy5jaGVja01heFJvd0FuZEluZm9ybVJvd1JlbmRlcmVyKHBhZ2VOdW1iZXIsIGxhc3RSb3cpO1xyXG4gICAgdGhpcy5yZW1vdmVGcm9tTG9hZGluZyhwYWdlTnVtYmVyKTtcclxuICAgIHRoaXMuY2hlY2tRdWV1ZUZvck5leHRMb2FkKCk7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnB1dFBhZ2VJbnRvQ2FjaGVBbmRQdXJnZSA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIsIHJvd3MpIHtcclxuICAgIHRoaXMucGFnZUNhY2hlW3BhZ2VOdW1iZXJdID0gdGhpcy5jcmVhdGVOb2Rlc0Zyb21Sb3dzKHBhZ2VOdW1iZXIsIHJvd3MpO1xyXG4gICAgdGhpcy5wYWdlQ2FjaGVTaXplKys7XHJcbiAgICBpZiAobG9nZ2luZykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdhZGRpbmcgcGFnZSAnICsgcGFnZU51bWJlcik7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG5lZWRUb1B1cmdlID0gdGhpcy5tYXhQYWdlc0luQ2FjaGUgJiYgdGhpcy5tYXhQYWdlc0luQ2FjaGUgPCB0aGlzLnBhZ2VDYWNoZVNpemU7XHJcbiAgICBpZiAobmVlZFRvUHVyZ2UpIHtcclxuICAgICAgICAvLyBmaW5kIHRoZSBMUlUgcGFnZVxyXG4gICAgICAgIHZhciB5b3VuZ2VzdFBhZ2VJbmRleCA9IHRoaXMuZmluZExlYXN0UmVjZW50bHlBY2Nlc3NlZFBhZ2UoT2JqZWN0LmtleXModGhpcy5wYWdlQ2FjaGUpKTtcclxuXHJcbiAgICAgICAgaWYgKGxvZ2dpbmcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3B1cmdpbmcgcGFnZSAnICsgeW91bmdlc3RQYWdlSW5kZXggKyAnIGZyb20gY2FjaGUgJyArIE9iamVjdC5rZXlzKHRoaXMucGFnZUNhY2hlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnBhZ2VDYWNoZVt5b3VuZ2VzdFBhZ2VJbmRleF07XHJcbiAgICAgICAgdGhpcy5wYWdlQ2FjaGVTaXplLS07XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5jaGVja01heFJvd0FuZEluZm9ybVJvd1JlbmRlcmVyID0gZnVuY3Rpb24ocGFnZU51bWJlciwgbGFzdFJvdykge1xyXG4gICAgaWYgKCF0aGlzLmZvdW5kTWF4Um93KSB7XHJcbiAgICAgICAgLy8gaWYgd2Uga25vdyB0aGUgbGFzdCByb3csIHVzZSBpZlxyXG4gICAgICAgIGlmICh0eXBlb2YgbGFzdFJvdyA9PT0gJ251bWJlcicgJiYgbGFzdFJvdyA+PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlydHVhbFJvd0NvdW50ID0gbGFzdFJvdztcclxuICAgICAgICAgICAgdGhpcy5mb3VuZE1heFJvdyA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBzZWUgaWYgd2UgbmVlZCB0byBhZGQgc29tZSB2aXJ0dWFsIHJvd3NcclxuICAgICAgICAgICAgdmFyIHRoaXNQYWdlUGx1c0J1ZmZlciA9ICgocGFnZU51bWJlciArIDEpICogdGhpcy5wYWdlU2l6ZSkgKyB0aGlzLm92ZXJmbG93U2l6ZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMudmlydHVhbFJvd0NvdW50IDwgdGhpc1BhZ2VQbHVzQnVmZmVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZpcnR1YWxSb3dDb3VudCA9IHRoaXNQYWdlUGx1c0J1ZmZlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpZiByb3dDb3VudCBjaGFuZ2VzLCByZWZyZXNoVmlldywgb3RoZXJ3aXNlIGp1c3QgcmVmcmVzaEFsbFZpcnR1YWxSb3dzXHJcbiAgICAgICAgdGhpcy5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnJvd1JlbmRlcmVyLnJlZnJlc2hBbGxWaXJ0dWFsUm93cygpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5pc1BhZ2VBbHJlYWR5TG9hZGluZyA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpIHtcclxuICAgIHZhciByZXN1bHQgPSB0aGlzLnBhZ2VMb2Fkc0luUHJvZ3Jlc3MuaW5kZXhPZihwYWdlTnVtYmVyKSA+PSAwIHx8IHRoaXMucGFnZUxvYWRzUXVldWVkLmluZGV4T2YocGFnZU51bWJlcikgPj0gMDtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmRvTG9hZE9yUXVldWUgPSBmdW5jdGlvbihwYWdlTnVtYmVyKSB7XHJcbiAgICAvLyBpZiB3ZSBhbHJlYWR5IHRyaWVkIHRvIGxvYWQgdGhpcyBwYWdlLCB0aGVuIGlnbm9yZSB0aGUgcmVxdWVzdCxcclxuICAgIC8vIG90aGVyd2lzZSBzZXJ2ZXIgd291bGQgYmUgaGl0IDUwIHRpbWVzIGp1c3QgdG8gZGlzcGxheSBvbmUgcGFnZSwgdGhlXHJcbiAgICAvLyBmaXJzdCByb3cgdG8gZmluZCB0aGUgcGFnZSBtaXNzaW5nIGlzIGVub3VnaC5cclxuICAgIGlmICh0aGlzLmlzUGFnZUFscmVhZHlMb2FkaW5nKHBhZ2VOdW1iZXIpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRyeSB0aGUgcGFnZSBsb2FkIC0gaWYgbm90IGFscmVhZHkgZG9pbmcgYSBsb2FkLCB0aGVuIHdlIGNhbiBnbyBhaGVhZFxyXG4gICAgaWYgKHRoaXMucGFnZUxvYWRzSW5Qcm9ncmVzcy5sZW5ndGggPCB0aGlzLm1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHMpIHtcclxuICAgICAgICAvLyBnbyBhaGVhZCwgbG9hZCB0aGUgcGFnZVxyXG4gICAgICAgIHRoaXMubG9hZFBhZ2UocGFnZU51bWJlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIG90aGVyd2lzZSwgcXVldWUgdGhlIHJlcXVlc3RcclxuICAgICAgICB0aGlzLmFkZFRvUXVldWVBbmRQdXJnZVF1ZXVlKHBhZ2VOdW1iZXIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5hZGRUb1F1ZXVlQW5kUHVyZ2VRdWV1ZSA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpIHtcclxuICAgIGlmIChsb2dnaW5nKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3F1ZXVlaW5nICcgKyBwYWdlTnVtYmVyICsgJyAtICcgKyB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5wdXNoKHBhZ2VOdW1iZXIpO1xyXG5cclxuICAgIC8vIHNlZSBpZiB0aGVyZSBhcmUgbW9yZSBwYWdlcyBxdWV1ZWQgdGhhdCBhcmUgYWN0dWFsbHkgaW4gb3VyIGNhY2hlLCBpZiBzbyB0aGVyZSBpc1xyXG4gICAgLy8gbm8gcG9pbnQgaW4gbG9hZGluZyB0aGVtIGFsbCBhcyBzb21lIHdpbGwgYmUgcHVyZ2VkIGFzIHNvb24gYXMgbG9hZGVkXHJcbiAgICB2YXIgbmVlZFRvUHVyZ2UgPSB0aGlzLm1heFBhZ2VzSW5DYWNoZSAmJiB0aGlzLm1heFBhZ2VzSW5DYWNoZSA8IHRoaXMucGFnZUxvYWRzUXVldWVkLmxlbmd0aDtcclxuICAgIGlmIChuZWVkVG9QdXJnZSkge1xyXG4gICAgICAgIC8vIGZpbmQgdGhlIExSVSBwYWdlXHJcbiAgICAgICAgdmFyIHlvdW5nZXN0UGFnZUluZGV4ID0gdGhpcy5maW5kTGVhc3RSZWNlbnRseUFjY2Vzc2VkUGFnZSh0aGlzLnBhZ2VMb2Fkc1F1ZXVlZCk7XHJcblxyXG4gICAgICAgIGlmIChsb2dnaW5nKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZS1xdWV1ZWluZyAnICsgcGFnZU51bWJlciArICcgLSAnICsgdGhpcy5wYWdlTG9hZHNRdWV1ZWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGluZGV4VG9SZW1vdmUgPSB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5pbmRleE9mKHlvdW5nZXN0UGFnZUluZGV4KTtcclxuICAgICAgICB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5zcGxpY2UoaW5kZXhUb1JlbW92ZSwgMSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmZpbmRMZWFzdFJlY2VudGx5QWNjZXNzZWRQYWdlID0gZnVuY3Rpb24ocGFnZUluZGV4ZXMpIHtcclxuICAgIHZhciB5b3VuZ2VzdFBhZ2VJbmRleCA9IC0xO1xyXG4gICAgdmFyIHlvdW5nZXN0UGFnZUFjY2Vzc1RpbWUgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIHBhZ2VJbmRleGVzLmZvckVhY2goZnVuY3Rpb24ocGFnZUluZGV4KSB7XHJcbiAgICAgICAgdmFyIGFjY2Vzc1RpbWVUaGlzUGFnZSA9IHRoYXQucGFnZUFjY2Vzc1RpbWVzW3BhZ2VJbmRleF07XHJcbiAgICAgICAgaWYgKGFjY2Vzc1RpbWVUaGlzUGFnZSA8IHlvdW5nZXN0UGFnZUFjY2Vzc1RpbWUpIHtcclxuICAgICAgICAgICAgeW91bmdlc3RQYWdlQWNjZXNzVGltZSA9IGFjY2Vzc1RpbWVUaGlzUGFnZTtcclxuICAgICAgICAgICAgeW91bmdlc3RQYWdlSW5kZXggPSBwYWdlSW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHlvdW5nZXN0UGFnZUluZGV4O1xyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5jaGVja1F1ZXVlRm9yTmV4dExvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgLy8gdGFrZSBmcm9tIHRoZSBmcm9udCBvZiB0aGUgcXVldWVcclxuICAgICAgICB2YXIgcGFnZVRvTG9hZCA9IHRoaXMucGFnZUxvYWRzUXVldWVkWzBdO1xyXG4gICAgICAgIHRoaXMucGFnZUxvYWRzUXVldWVkLnNwbGljZSgwLCAxKTtcclxuXHJcbiAgICAgICAgaWYgKGxvZ2dpbmcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2RlcXVldWVpbmcgJyArIHBhZ2VUb0xvYWQgKyAnIC0gJyArIHRoaXMucGFnZUxvYWRzUXVldWVkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubG9hZFBhZ2UocGFnZVRvTG9hZCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmxvYWRQYWdlID0gZnVuY3Rpb24ocGFnZU51bWJlcikge1xyXG5cclxuICAgIHRoaXMucGFnZUxvYWRzSW5Qcm9ncmVzcy5wdXNoKHBhZ2VOdW1iZXIpO1xyXG5cclxuICAgIHZhciBzdGFydFJvdyA9IHBhZ2VOdW1iZXIgKiB0aGlzLnBhZ2VTaXplO1xyXG4gICAgdmFyIGVuZFJvdyA9IChwYWdlTnVtYmVyICsgMSkgKiB0aGlzLnBhZ2VTaXplO1xyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHZhciBkYXRhc291cmNlVmVyc2lvbkNvcHkgPSB0aGlzLmRhdGFzb3VyY2VWZXJzaW9uO1xyXG5cclxuICAgIHRoaXMuZGF0YXNvdXJjZS5nZXRSb3dzKHN0YXJ0Um93LCBlbmRSb3csXHJcbiAgICAgICAgZnVuY3Rpb24gc3VjY2Vzcyhyb3dzLCBsYXN0Um93KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGF0LnJlcXVlc3RJc0RhZW1vbihkYXRhc291cmNlVmVyc2lvbkNvcHkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhhdC5wYWdlTG9hZGVkKHBhZ2VOdW1iZXIsIHJvd3MsIGxhc3RSb3cpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb24gZmFpbCgpIHtcclxuICAgICAgICAgICAgaWYgKHRoYXQucmVxdWVzdElzRGFlbW9uKGRhdGFzb3VyY2VWZXJzaW9uQ29weSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGF0LnBhZ2VMb2FkRmFpbGVkKHBhZ2VOdW1iZXIpO1xyXG4gICAgICAgIH1cclxuICAgICk7XHJcbn07XHJcblxyXG4vLyBjaGVjayB0aGF0IHRoZSBkYXRhc291cmNlIGhhcyBub3QgY2hhbmdlZCBzaW5jZSB0aGUgbGF0cyB0aW1lIHdlIGRpZCBhIHJlcXVlc3RcclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5yZXF1ZXN0SXNEYWVtb24gPSBmdW5jdGlvbihkYXRhc291cmNlVmVyc2lvbkNvcHkpIHtcclxuICAgIHJldHVybiB0aGlzLmRhdGFzb3VyY2VWZXJzaW9uICE9PSBkYXRhc291cmNlVmVyc2lvbkNvcHk7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmdldFZpcnR1YWxSb3cgPSBmdW5jdGlvbihyb3dJbmRleCkge1xyXG4gICAgaWYgKHJvd0luZGV4ID4gdGhpcy52aXJ0dWFsUm93Q291bnQpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcGFnZU51bWJlciA9IE1hdGguZmxvb3Iocm93SW5kZXggLyB0aGlzLnBhZ2VTaXplKTtcclxuICAgIHZhciBwYWdlID0gdGhpcy5wYWdlQ2FjaGVbcGFnZU51bWJlcl07XHJcblxyXG4gICAgLy8gZm9yIExSVSBjYWNoZSwgdHJhY2sgd2hlbiB0aGlzIHBhZ2Ugd2FzIGxhc3QgaGl0XHJcbiAgICB0aGlzLnBhZ2VBY2Nlc3NUaW1lc1twYWdlTnVtYmVyXSA9IHRoaXMuYWNjZXNzVGltZSsrO1xyXG5cclxuICAgIGlmICghcGFnZSkge1xyXG4gICAgICAgIHRoaXMuZG9Mb2FkT3JRdWV1ZShwYWdlTnVtYmVyKTtcclxuICAgICAgICAvLyByZXR1cm4gYmFjayBhbiBlbXB0eSByb3csIHNvIHRhYmxlIGNhbiBhdCBsZWFzdCByZW5kZXIgZW1wdHkgY2VsbHNcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBkYXRhOiB7fSxcclxuICAgICAgICAgICAgaWQ6IHJvd0luZGV4XHJcbiAgICAgICAgfTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGluZGV4SW5UaGlzUGFnZSA9IHJvd0luZGV4ICUgdGhpcy5wYWdlU2l6ZTtcclxuICAgICAgICByZXR1cm4gcGFnZVtpbmRleEluVGhpc1BhZ2VdO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5nZXRNb2RlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXRWaXJ0dWFsUm93OiBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5nZXRWaXJ0dWFsUm93KGluZGV4KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFZpcnR1YWxSb3dDb3VudDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnZpcnR1YWxSb3dDb3VudDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBWaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXI7XHJcbiJdfQ==
