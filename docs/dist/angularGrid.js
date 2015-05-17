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

},{"./grid":14}],2:[function(require,module,exports){
var SvgFactory = require('../svgFactory');
var utils = require('../utils');
var svgFactory = new SvgFactory();

function groupCellRendererFactory(gridOptionsWrapper, selectionRendererFactory) {

    return function groupCellRenderer(params) {

        var eGroupCell = document.createElement('span');
        var node = params.node;

        var expandIconNeeded = node.group && !node.footer;
        if (expandIconNeeded) {
            var eExpandIcon = createGroupExpandIcon(node.expanded);
            eGroupCell.appendChild(eExpandIcon);
            eExpandIcon.addEventListener("click", function () {
                expandGroup(node, params);
            });
        }

        var checkboxNeeded = params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.checkbox && !node.footer;
        if (checkboxNeeded) {
            var eCheckbox = selectionRendererFactory.createSelectionCheckbox(node, params.rowIndex);
            eGroupCell.appendChild(eCheckbox);
        }

        if (params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.innerRenderer) {
            createFromInnerRenderer(eGroupCell, params, params.colDef.cellRenderer.innerRenderer);
        } else if (node.footer) {
            createFooterCell(eGroupCell, node);
        } else if (node.group) {
            createGroupCell(eGroupCell, node);
        } else {
            createLeafCell(eGroupCell, params);
        }

        // only do this if an indent - as this overwrites the padding that
        // the theme set, which will make things look 'not aligned' for the
        // first group level.
        if (node.footer || node.level > 0) {
            var paddingPx = node.level * 10;
            if (node.footer) {
                paddingPx += 10;
            } else if (!node.group) {
                paddingPx += 5;
            }
            eGroupCell.style.paddingLeft = paddingPx + "px";
        }

        if (node.group) {
            eGroupCell.addEventListener("dblclick", function () {
                expandGroup(node, params);
            });
        }

        return eGroupCell;
    };

    function createFromInnerRenderer(eGroupCell, params, renderer) {
        utils.useRenderer(eGroupCell, renderer, params);
    }

    function expandGroup(node, params) {
        node.expanded = !node.expanded;
        params.api.onGroupExpandedOrCollapsed();
    }

    function createGroupExpandIcon(expanded) {
        if (expanded) {
            return utils.createIcon('groupExpanded', gridOptionsWrapper, null, svgFactory.createArrowDownSvg);
        } else {
            return utils.createIcon('groupContracted', gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
        }
    }

    // creates cell with 'Total {{key}}' for a group
    function createFooterCell(eParent, node) {
        var textToDisplay = "Total " + node.key;
        var eText = document.createTextNode(textToDisplay);
        eParent.appendChild(eText);
    }

    // creates cell with '{{key}} ({{childCount}})' for a group
    function createGroupCell(eParent, node) {
        var textToDisplay = " " + node.key;
        // only include the child count if it's included, eg if user doing custom aggregation,
        // then this could be left out, or set to -1, ie no child count
        if (node.allChildrenCount >= 0) {
            textToDisplay += " (" + node.allChildrenCount + ")";
        }
        var eText = document.createTextNode(textToDisplay);
        eParent.appendChild(eText);
    }


    // creates cell with '{{key}} ({{childCount}})' for a group
    function createLeafCell(eParent, params) {
        if (params.value) {
            var eText = document.createTextNode(' ' + params.value);
            eParent.appendChild(eText);
        }
    }
}

module.exports = groupCellRendererFactory;
},{"../svgFactory":23,"../utils":27}],3:[function(require,module,exports){
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
        },
        // used by:
        // + rowRenderer -> for navigation
        getVisibleColBefore: function(col) {
            var oldIndex = that.visibleColumns.indexOf(col);
            if (oldIndex > 0) {
                return that.visibleColumns[oldIndex - 1];
            } else {
                return null;
            }
        },
        // used by:
        // + rowRenderer -> for navigation
        getVisibleColAfter: function(col) {
            var oldIndex = that.visibleColumns.indexOf(col);
            if (oldIndex < (that.visibleColumns.length - 1)) {
                return that.visibleColumns[oldIndex + 1];
            } else {
                return null;
            }
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
ColumnController.prototype.sizeColumnsToFit = function(gridWidth) {
    // avoid divide by zero
    if (gridWidth <= 0 || this.visibleColumns.length === 0) {
        return;
    }

    var columnStartWidth = 0; // will contain the starting total width of the cols been spread
    var colsToSpread = []; // all visible cols, except those with avoidSizeToFit
    var widthForSpreading = gridWidth; // grid width minus the columns we are not resizing

    // get the list of cols to work with
    for (var j = 0; j < this.visibleColumns.length ; j++) {
        if (this.visibleColumns[j].colDef.suppressSizeToFit === true) {
            // don't include col, and remove the width from teh available width
            widthForSpreading -= this.visibleColumns[j].actualWidth;
        } else {
            // include the col
            colsToSpread.push(this.visibleColumns[j]);
            columnStartWidth += this.visibleColumns[j].actualWidth;
        }
    }

    // if no width left over to spread with, do nothing
    if (widthForSpreading <= 0) {
        return;
    }

    var scale = widthForSpreading / columnStartWidth;
    var pixelsForLastCol = widthForSpreading;

    // size all cols except the last by the scale
    for (var i = 0; i < (colsToSpread.length - 1); i++) {
        var column = colsToSpread[i];
        var newWidth = parseInt(column.actualWidth * scale);
        column.actualWidth = newWidth;
        pixelsForLastCol -= newWidth;
    }

    // size the last by whats remaining (this avoids rounding errors that could
    // occur with scaling everything, where it result in some pixels off)
    var lastColumn = colsToSpread[colsToSpread.length - 1];
    lastColumn.actualWidth = pixelsForLastCol;

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

},{"./constants":4}],4:[function(require,module,exports){
var constants = {
    STEP_EVERYTHING: 0,
    STEP_FILTER: 1,
    STEP_SORT: 2,
    STEP_MAP: 3,
    ASC: "asc",
    DESC: "desc",
    ROW_BUFFER_SIZE: 20,
    SORT_STYLE_SHOW: "display:inline;",
    SORT_STYLE_HIDE: "display:none;",
    MIN_COL_WIDTH: 10
};

module.exports = constants;

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./../utils":27,"./numberFilter":7,"./setFilter":9,"./textFilter":12}],7:[function(require,module,exports){
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

},{"./../utils":27,"./numberFilterTemplate.js":8}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{"./../utils":27,"./setFilterModel":10,"./setFilterTemplate":11}],10:[function(require,module,exports){
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

},{"../utils":27}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{"../utils":27,"./textFilterTemplate":13}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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
        selectionRendererFactory, $compile, $scope, selectionController, expressionService, templateService,
        this.eParentOfRows);
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
    this.selectionController.deselectAll();
    this.filterManager.onNewRowsLoaded();
    this.updateModelAndRefresh(constants.STEP_EVERYTHING);
    this.headerRenderer.updateFilterIcons();
    this.showLoadingPanel(false);
};

Grid.prototype.ensureNodeVisible = function(comparator) {
    // look for the node index we want to display
    var rowCount = this.rowModel.getVirtualRowCount();
    var comparatorIsAFunction = typeof comparator === 'function';
    var indexToSelect = -1;
    // go through all the nodes, find the one we want to show
    for (var i = 0; i < rowCount; i++) {
        var node = this.rowModel.getVirtualRow(i);
        if (comparatorIsAFunction) {
            if (comparator(node)) {
                indexToSelect = i;
                break;
            }
        } else {
            // check object equality against node and data
            if (comparator === node || comparator === node.data) {
                indexToSelect = i;
                break;
            }
        }
    }
    if (indexToSelect >= 0) {
        this.ensureIndexVisible(indexToSelect);
    }
};

Grid.prototype.ensureIndexVisible = function(index) {
    var lastRow = this.rowModel.getVirtualRowCount();
    if (typeof index !== 'number' || index < 0 || index >= lastRow) {
        throw 'invalid row index for ensureIndexVisible: ' + index;
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
            console.error("unselectAll deprecated, call deselectAll instead");
            this.deselectAll();
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
        selectAll: function() {
            that.selectionController.selectAll();
            that.rowRenderer.refreshView();
        },
        deselectAll: function() {
            that.selectionController.deselectAll();
            that.rowRenderer.refreshView();
        },
        recomputeAggregates: function() {
            that.inMemoryRowController.doAggregate();
            that.rowRenderer.refreshGroupRows();
        },
        sizeColumnsToFit: function() {
            var availableWidth = that.eBody.clientWidth;
            var scrollShowing = that.eBodyViewport.clientHeight < that.eBodyViewport.scrollHeight;
            if (scrollShowing) {
                availableWidth -= that.scrollWidth;
            }
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
        },
        ensureIndexVisible: function(index) {
            return that.ensureIndexVisible(index);
        },
        ensureNodeVisible: function(comparator) {
            return that.ensureNodeVisible(comparator);
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

    this.ePinnedColsViewport.addEventListener("scroll", function() {
        // this means the pinned panel was moved, which can only
        // happen when the user is navigating in the pinned container
        // as the pinned col should never scroll. so we rollback
        // the scroll on the pinned.
        that.ePinnedColsViewport.scrollTop = 0;
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

},{"./columnController":3,"./constants":4,"./expressionService":5,"./filter/filterManager":6,"./gridOptionsWrapper":15,"./headerRenderer":17,"./inMemoryRowController":18,"./paginationController":19,"./rowRenderer":20,"./selectionController":21,"./selectionRendererFactory":22,"./template.js":24,"./templateNoScrolls.js":25,"./templateService":26,"./utils":27,"./virtualPageRowController":28}],15:[function(require,module,exports){
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
GridOptionsWrapper.prototype.isGroupSelectsChildren = function() { return isTrue(this.gridOptions.groupSelectsChildren); };
GridOptionsWrapper.prototype.isGroupIncludeFooter = function() { return isTrue(this.gridOptions.groupIncludeFooter); };
GridOptionsWrapper.prototype.isSuppressRowClickSelection = function() { return isTrue(this.gridOptions.suppressRowClickSelection); };
GridOptionsWrapper.prototype.isGroupHeaders = function() { return isTrue(this.gridOptions.groupHeaders); };
GridOptionsWrapper.prototype.getGroupInnerRenderer = function() { return this.gridOptions.groupInnerRenderer; };
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

},{}],16:[function(require,module,exports){
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

        // all leaf nodes have the same level in this grouping, which is one level after the last group
        node.level = levelToInsertChild + 1;

        for (currentLevel = 0; currentLevel < groupByFields.length; currentLevel++) {
            groupByField = groupByFields[currentLevel];
            groupKey = data[groupByField];

            if (currentLevel == 0) {
                currentGroup = topMostGroup;
            }

            // if group doesn't exist yet, create it
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

},{}],17:[function(require,module,exports){
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

    headerCellLabel.addEventListener("click", function(e) {

        // update sort on current col
        if (colDefWrapper.sort === constants.DESC) {
            colDefWrapper.sort = null
        }
        else {
            if (colDefWrapper.sort === constants.ASC) {
                colDefWrapper.sort = constants.DESC;
            } else {
                colDefWrapper.sort = constants.ASC;
            }
            // Useful for determining the order in which the user sorted the columns:
            colDefWrapper.sortedAt = new Date().valueOf();
        }

        // clear sort on all columns except this one, and update the icons
        that.columnModel.getAllColumns().forEach(function(columnToClear) {
            // Do not clear if either holding shift, or if column in question was clicked
            if (!(e.shiftKey || columnToClear === colDefWrapper)) {
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

},{"./constants":4,"./svgFactory":23,"./utils":27}],18:[function(require,module,exports){
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
    var sortingOptions = [];
    this.columnModel.getAllColumns().forEach(function(column) {
        if (column.sort) {
            var ascending = column.sort === constants.ASC;
            sortingOptions.push({
                inverter: ascending ? 1 : -1,
                sortedAt: column.sortedAt,
                colDef: column.colDef
            });
        }
    });

    // The columns are to be sorted in the order that the user selected them:
    sortingOptions.sort(function(optionA, optionB){
        return optionA.sortedAt - optionB.sortedAt;
    });

    var rowNodesBeforeSort = this.rowsAfterFilter.slice(0);

    if (sortingOptions.length) {
        this.sortList(rowNodesBeforeSort, sortingOptions);
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
InMemoryRowController.prototype.sortList = function(nodes, sortOptions) {

    // sort any groups recursively
    for (var i = 0, l = nodes.length; i < l; i++) { // critical section, no functional programming
        var node = nodes[i];
        if (node.group && node.children) {
            node.childrenAfterSort = node.childrenAfterFilter.slice(0);
            this.sortList(node.childrenAfterSort, sortOptions);
        }
    }

    var that = this;
    function compare(objA, objB, colDef){
        var valueA = that.getValue(objA.data, colDef, objA);
        var valueB = that.getValue(objB.data, colDef, objB);
        if (colDef.comparator) {
            //if comparator provided, use it
            return colDef.comparator(valueA, valueB, objA, objB);
        } else {
            //otherwise do our own comparison
            return utils.defaultComparator(valueA, valueB, objA, objB);
        }
    }

    nodes.sort(function(objA, objB) {
        // Iterate columns, return the first that doesn't match
        for (var i = 0, len = sortOptions.length; i < len; i++) {
            var sortOption = sortOptions[i];
            var compared = compare(objA, objB, sortOption.colDef);
            if (compared !== 0) {
                return compared * sortOption.inverter;
            }
        }
        // All matched, these are identical as far as the sort is concerned:
        return 0;
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

},{"./constants":4,"./groupCreator":16,"./utils":27}],19:[function(require,module,exports){
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
    var startRow;
    var endRow;
    if (this.isZeroPagesToDisplay()) {
        startRow = 0;
        endRow = 0;
    } else {
        startRow = (this.pageSize * this.currentPage) + 1;
        endRow = startRow + this.pageSize - 1;
        if (this.foundMaxRow && endRow > this.rowCount) {
            endRow = this.rowCount;
        }
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

PaginationController.prototype.isZeroPagesToDisplay = function() {
    return this.foundMaxRow && this.totalPages === 0;
};

PaginationController.prototype.enableOrDisableButtons = function() {
    var disablePreviousAndFirst = this.currentPage === 0;
    this.btPrevious.disabled = disablePreviousAndFirst;
    this.btFirst.disabled = disablePreviousAndFirst;

    var zeroPagesToDisplay = this.isZeroPagesToDisplay();
    var onLastPage = this.foundMaxRow && this.currentPage === (this.totalPages - 1);

    var disableNext = onLastPage || zeroPagesToDisplay;
    this.btNext.disabled = disableNext;

    var disableLast = !this.foundMaxRow || zeroPagesToDisplay || this.currentPage === (this.totalPages - 1);
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

},{}],20:[function(require,module,exports){
var constants = require('./constants');
var utils = require('./utils');
var groupCellRendererFactory = require('./cellRenderers/groupCellRendererFactory');

var TAB_KEY = 9;
var ENTER_KEY = 13;

var DOWN_KEY = 40;
var UP_KEY = 38;
var LEFT_KEY = 37;
var RIGHT_KEY = 39;

function RowRenderer() {}

RowRenderer.prototype.init = function(gridOptions, columnModel, gridOptionsWrapper, eGrid,
    angularGrid, selectionRendererFactory, $compile, $scope,
    selectionController, expressionService, templateService, eParentOfRows) {
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
    this.eParentOfRows = eParentOfRows;

    this.cellRendererMap = {
        'group': groupCellRendererFactory(gridOptionsWrapper, selectionRendererFactory)
    };

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

    // try compiling as we insert rows
    var newChildScope = this.createChildScopeOrNull(node.data);

    var ePinnedRow = this.createRowContainer(rowIndex, node, rowIsAGroup, newChildScope);
    var eMainRow = this.createRowContainer(rowIndex, node, rowIsAGroup, newChildScope);
    var that = this;

    eMainRow.style.width = mainRowWidth + "px";

    var renderedRow = {
        scope: newChildScope,
        node: node,
        rowIndex: rowIndex,
        eCells: {},
        eVolatileCells: {}
    };
    this.renderedRows[rowIndex] = renderedRow;
    this.renderedRowStartEditingListeners[rowIndex] = {};

    // if group item, insert the first row
    var groupHeaderTakesEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow();
    var drawGroupRow = rowIsAGroup && groupHeaderTakesEntireRow;

    if (drawGroupRow) {
        var firstColumn = columns[0];

        var eGroupRow = that.createGroupElement(node, false);
        if (firstColumn.pinned) {
            ePinnedRow.appendChild(eGroupRow);

            var eGroupRowPadding = that.createGroupElement(node, true);
            eMainRow.appendChild(eGroupRowPadding);
        } else {
            eMainRow.appendChild(eGroupRow);
        }

        //renderedRow.eCells[firstColumn.colKey] = eGroupRow;

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
    renderedRow.eCells[column.colKey] = eGridCell;

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

RowRenderer.prototype.createRowContainer = function(rowIndex, node, groupRow, $scope) {
    var eRow = document.createElement("div");

    this.addClassesToRow(rowIndex, node, eRow);

    eRow.setAttribute('row', rowIndex);

    // if showing scrolls, position on the container
    if (!this.gridOptionsWrapper.isDontUseScrolls()) {
        eRow.style.top = (this.gridOptionsWrapper.getRowHeight() * rowIndex) + "px";
    }
    eRow.style.height = (this.gridOptionsWrapper.getRowHeight()) + "px";

    if (this.gridOptionsWrapper.getRowStyle()) {
        var cssToUse;
        var rowStyle = this.gridOptionsWrapper.getRowStyle();
        if (typeof rowStyle === 'function') {
            var params = {
                data: node.data,
                node: node,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext(),
                $scope: $scope
            };
            cssToUse = rowStyle(params);
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

RowRenderer.prototype.createGroupElement = function(node, padding) {
    var eRow;
    if (padding) {
        eRow = document.createElement('span');
    } else {
        var params = {
            node: node,
            data: node.data,
            rowIndex: 4,
            api: this.gridOptionsWrapper.getApi(),
            colDef: {
                cellRenderer: {
                    renderer: 'group',
                    innerRenderer: this.gridOptionsWrapper.getGroupInnerRenderer()
                }
            }
        };
        eRow = this.cellRendererMap['group'](params);
    }

    if (node.footer) {
        utils.addCssClass(eRow, 'ag-footer-cell-entire-row');
    } else {
        utils.addCssClass(eRow, 'ag-group-cell-entire-row');
    }

    return eRow;
};

RowRenderer.prototype.putDataIntoCell = function(column, value, valueGetter, node, $childScope, eGridCell, rowIndex, refreshCellFunction) {
    // template gets preference, then cellRenderer, then do it ourselves
    var colDef = column.colDef;
    if (colDef.template) {
        eGridCell.innerHTML = colDef.template;
    } else if (colDef.templateUrl) {
        var template = this.templateService.getTemplate(colDef.templateUrl, refreshCellFunction);
        if (template) {
            eGridCell.innerHTML = template;
        }
    } else if (colDef.cellRenderer) {
        this.useCellRenderer(column, value, node, $childScope, eGridCell, rowIndex, refreshCellFunction, valueGetter);
    } else {
        // if we insert undefined, then it displays as the string 'undefined', ugly!
        if (value !== undefined && value !== null && value !== '') {
            eGridCell.innerHTML = value;
        }
    }
};

RowRenderer.prototype.useCellRenderer = function(column, value, node, $childScope, eGridCell, rowIndex, refreshCellFunction, valueGetter) {
    var colDef = column.colDef;
    var rendererParams = {
        value: value,
        valueGetter: valueGetter,
        data: node.data,
        node: node,
        colDef: colDef,
        column: column,
        $scope: $childScope,
        rowIndex: rowIndex,
        api: this.gridOptionsWrapper.getApi(),
        context: this.gridOptionsWrapper.getContext(),
        refreshCell: refreshCellFunction
    };
    var cellRenderer;
    if (typeof colDef.cellRenderer === 'object') {
        cellRenderer = this.cellRendererMap[colDef.cellRenderer.renderer];
        if (!cellRenderer) {
            throw 'Cell renderer ' + colDef.cellRenderer + ' not found, available are ' + Object.keys(this.cellRendererMap);
        }
    } else if (typeof colDef.cellRenderer === 'function') {
        cellRenderer = colDef.cellRenderer;
    } else {
        throw 'Cell Renderer must be String or Function';
    }
    var resultFromRenderer = cellRenderer(rendererParams);
    if (utils.isNodeOrElement(resultFromRenderer)) {
        // a dom node or element was returned, so add child
        eGridCell.appendChild(resultFromRenderer);
    } else {
        // otherwise assume it was html, so just insert
        eGridCell.innerHTML = resultFromRenderer;
    }
};

RowRenderer.prototype.addStylesFromCollDef = function(column, value, node, $childScope, eGridCell) {
    var colDef = column.colDef;
    if (colDef.cellStyle) {
        var cssToUse;
        if (typeof colDef.cellStyle === 'function') {
            var cellStyleParams = {
                value: value,
                data: node.data,
                node: node,
                colDef: colDef,
                column: column,
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
    var classes = ['ag-cell', 'ag-cell-no-focus', 'cell-col-' + column.index];
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

    eGridCell.setAttribute("tabindex", "-1");

    var value;
    if (valueGetter) {
        value = valueGetter();
    }

    // these are the grid styles, don't change between soft refreshes
    this.addClassesToCell(column, node, eGridCell);

    this.populateAndStyleGridCell(valueGetter, value, eGridCell, isFirstColumn, node, column, rowIndex, $childScope);

    this.addCellClickedHandler(eGridCell, node, column, value, rowIndex);
    this.addCellDoubleClickedHandler(eGridCell, node, column, value, rowIndex, $childScope, isFirstColumn, valueGetter);

    this.addCellNavigationHandler(eGridCell, rowIndex, column);

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

RowRenderer.prototype.addCellNavigationHandler = function(eGridCell, rowIndex, column) {
    var that = this;
    eGridCell.addEventListener('keydown', function(event) {
        var key = event.which || event.keyCode;
        if (key === DOWN_KEY || key === UP_KEY || key === LEFT_KEY || key === RIGHT_KEY) {
            event.preventDefault();
            that.navigateToNextCell(key, rowIndex, column);
        }
    });
};

RowRenderer.prototype.navigateToNextCell = function(key, rowIndex, column) {

    var rowToFocus;
    var colToFocus;

    switch (key) {
        case UP_KEY :
            // if already on top row, do nothing
            if (rowIndex === this.firstVirtualRenderedRow) {
                return;
            }
            rowToFocus = rowIndex - 1;
            colToFocus = column.index;
            break;
        case DOWN_KEY :
            // if already on bottom, do nothing
            if (rowIndex === this.lastVirtualRenderedRow) {
                return;
            }
            rowToFocus = rowIndex + 1;
            colToFocus = column.index;
            break;
        case RIGHT_KEY :
            var colToRight = this.columnModel.getVisibleColAfter(column);
            // if already on right, do nothing
            if (!colToRight) {
                return;
            }
            rowToFocus = rowIndex ;
            colToFocus = colToRight.index;
            break;
        case LEFT_KEY :
            var colToLeft = this.columnModel.getVisibleColBefore(column);
            // if already on right, do nothing
            if (!colToLeft) {
                return;
            }
            rowToFocus = rowIndex ;
            colToFocus = colToLeft.index;
            break;
    }

    var renderedRow = this.renderedRows[rowToFocus];
    var eCell = renderedRow.eCells[colToFocus];

    // this scrolls the row into view
    this.angularGrid.ensureIndexVisible(renderedRow.rowIndex);

    // this changes the css on the cell
    this.focusCell(rowToFocus, colToFocus);
    // this puts the browser focus on the cell (so it gets key presses)
    eCell.focus();
};

RowRenderer.prototype.focusCell = function(rowIndex, colIndex) {
    // remove any previous focus
    utils.querySelectorAll_replaceCssClass(this.eParentOfRows, '.ag-cell-focus', 'ag-cell-focus', 'ag-cell-no-focus');

    var selectorForCell = '[row="' + rowIndex + '"] [col="' + colIndex + '"]';
    utils.querySelectorAll_replaceCssClass(this.eParentOfRows, selectorForCell, 'ag-cell-no-focus', 'ag-cell-focus');
};

RowRenderer.prototype.populateAndStyleGridCell = function(valueGetter, value, eGridCell, isFirstColumn, node, column, rowIndex, $childScope) {
    var colDef = column.colDef;

    // populate
    this.populateGridCell(eGridCell, isFirstColumn, node, column, rowIndex, value, valueGetter, $childScope);
    // style
    this.addStylesFromCollDef(column, value, node, $childScope, eGridCell);
    this.addClassesFromCollDef(colDef, value, node, $childScope, eGridCell);
    this.addClassesFromRules(colDef, eGridCell, value, node, rowIndex);
};

RowRenderer.prototype.populateGridCell = function(eGridCell, isFirstColumn, node, column, rowIndex, value, valueGetter, $childScope) {
    var eCellWrapper = document.createElement('span');
    eGridCell.appendChild(eCellWrapper);

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

    this.putDataIntoCell(column, value, valueGetter, node, $childScope, eSpanWithValue, rowIndex, refreshCellFunction);
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

RowRenderer.prototype.addCellClickedHandler = function(eGridCell, node, column, value, rowIndex) {
    var colDef = column.colDef;
    var that = this;
    eGridCell.addEventListener("click", function(event) {
        //that.focusCell(rowIndex, column.index);
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

},{"./cellRenderers/groupCellRendererFactory":2,"./constants":4,"./utils":27}],21:[function(require,module,exports){
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

    if (typeof this.rowModel.getTopLevelNodes !== 'function') {
        throw 'selectAll not available when rows are on the server';
    }

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
SelectionController.prototype.deselectAll = function() {
    this.selectedRows.length = 0;
    var keys = Object.keys(this.selectedNodesById);
    for (var i = 0; i < keys.length; i++) {
        delete this.selectedNodesById[keys[i]];
    }
    this.syncSelectedRowsAndCallListener();
};

// public - this selects everything, but doesn't clear down the css - when it is called, the
// caller then gets the grid to refresh.
SelectionController.prototype.selectAll = function() {

    if (typeof this.rowModel.getTopLevelNodes !== 'function') {
        throw 'selectAll not available when rows are on the server';
    }

    var selectedNodesById = this.selectedNodesById;
    // if the selection is "don't include groups", then we don't include them!
    var includeGroups = !this.gridOptionsWrapper.isGroupSelectsChildren();

    function recursivelySelect(nodes) {
        if (nodes) {
            for (var i = 0; i<nodes.length; i++) {
                var node = nodes[i];
                if (node.group) {
                    recursivelySelect(node.children);
                    if (includeGroups) {
                        selectedNodesById[node.id] = node;
                    }
                } else {
                    selectedNodesById[node.id] = node;
                }
            }
        }
    }

    var topLevelNodes = this.rowModel.getTopLevelNodes();
    recursivelySelect(topLevelNodes);

    this.syncSelectedRowsAndCallListener();
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

    if (this.gridOptionsWrapper.isGroupSelectsChildren() && nodeToSelect.group) {
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
        if (this.gridOptionsWrapper.isGroupSelectsChildren() && node.group) {
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
    var oldCount = selectedRows.length;
    // clear selected rows
    selectedRows.length = 0;
    var keys = Object.keys(this.selectedNodesById);
    for (var i = 0; i < keys.length; i++) {
        if (this.selectedNodesById[keys[i]] !== undefined) {
            var selectedNode = this.selectedNodesById[keys[i]];
            selectedRows.push(selectedNode.data);
        }
    }

    // this stope the event firing the very first the time grid is initialised. without this, the documentation
    // page had a popup in the 'selection' page as soon as the page was loaded!!
    var nothingChangedMustBeInitialising = oldCount === 0 && selectedRows.length === 0;

    if (!nothingChangedMustBeInitialising && !suppressEvents && typeof this.gridOptionsWrapper.getSelectionChanged() === "function") {
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
    if (this.gridOptionsWrapper.isGroupSelectsChildren() && node.group) {
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
    if (!this.gridOptionsWrapper.isGroupSelectsChildren()) {
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

},{"./utils":27}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){

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

},{}],27:[function(require,module,exports){
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

Utils.prototype.querySelectorAll_replaceCssClass = function(eParent, selector, cssClassToRemove, cssClassToAdd) {
    var eRows = eParent.querySelectorAll(selector);
    for (var k = 0; k < eRows.length; k++) {
        this.removeCssClass(eRows[k], cssClassToRemove);
        this.addCssClass(eRows[k], cssClassToAdd);
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

},{}],28:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9jZWxsUmVuZGVyZXJzL2dyb3VwQ2VsbFJlbmRlcmVyRmFjdG9yeS5qcyIsInNyYy9qcy9jb2x1bW5Db250cm9sbGVyLmpzIiwic3JjL2pzL2NvbnN0YW50cy5qcyIsInNyYy9qcy9leHByZXNzaW9uU2VydmljZS5qcyIsInNyYy9qcy9maWx0ZXIvZmlsdGVyTWFuYWdlci5qcyIsInNyYy9qcy9maWx0ZXIvbnVtYmVyRmlsdGVyLmpzIiwic3JjL2pzL2ZpbHRlci9udW1iZXJGaWx0ZXJUZW1wbGF0ZS5qcyIsInNyYy9qcy9maWx0ZXIvc2V0RmlsdGVyLmpzIiwic3JjL2pzL2ZpbHRlci9zZXRGaWx0ZXJNb2RlbC5qcyIsInNyYy9qcy9maWx0ZXIvc2V0RmlsdGVyVGVtcGxhdGUuanMiLCJzcmMvanMvZmlsdGVyL3RleHRGaWx0ZXIuanMiLCJzcmMvanMvZmlsdGVyL3RleHRGaWx0ZXJUZW1wbGF0ZS5qcyIsInNyYy9qcy9ncmlkLmpzIiwic3JjL2pzL2dyaWRPcHRpb25zV3JhcHBlci5qcyIsInNyYy9qcy9ncm91cENyZWF0b3IuanMiLCJzcmMvanMvaGVhZGVyUmVuZGVyZXIuanMiLCJzcmMvanMvaW5NZW1vcnlSb3dDb250cm9sbGVyLmpzIiwic3JjL2pzL3BhZ2luYXRpb25Db250cm9sbGVyLmpzIiwic3JjL2pzL3Jvd1JlbmRlcmVyLmpzIiwic3JjL2pzL3NlbGVjdGlvbkNvbnRyb2xsZXIuanMiLCJzcmMvanMvc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LmpzIiwic3JjL2pzL3N2Z0ZhY3RvcnkuanMiLCJzcmMvanMvdGVtcGxhdGUuanMiLCJzcmMvanMvdGVtcGxhdGVOb1Njcm9sbHMuanMiLCJzcmMvanMvdGVtcGxhdGVTZXJ2aWNlLmpzIiwic3JjL2pzL3V0aWxzLmpzIiwic3JjL2pzL3ZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL3FCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaGNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWtDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gQW5ndWxhciBHcmlkXHJcbi8vIFdyaXR0ZW4gYnkgTmlhbGwgQ3Jvc2J5XHJcbi8vIHd3dy5hbmd1bGFyZ3JpZC5jb21cclxuLy9cclxuLy8gVmVyc2lvbiAxLjQuMVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIG9yIGBleHBvcnRzYFxyXG4gICAgdmFyIHJvb3QgPSB0aGlzO1xyXG4gICAgdmFyIEdyaWQgPSByZXF1aXJlKCcuL2dyaWQnKTtcclxuXHJcbiAgICAvLyBpZiBhbmd1bGFyIGlzIHByZXNlbnQsIHJlZ2lzdGVyIHRoZSBkaXJlY3RpdmVcclxuICAgIGlmICh0eXBlb2YgYW5ndWxhciAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICB2YXIgYW5ndWxhck1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwiYW5ndWxhckdyaWRcIiwgW10pO1xyXG4gICAgICAgIGFuZ3VsYXJNb2R1bGUuZGlyZWN0aXZlKFwiYW5ndWxhckdyaWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICByZXN0cmljdDogXCJBXCIsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRlbGVtZW50JywgJyRzY29wZScsICckY29tcGlsZScsIEFuZ3VsYXJEaXJlY3RpdmVDb250cm9sbGVyXSxcclxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhckdyaWQ6IFwiPVwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xyXG4gICAgICAgICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyR3JpZEdsb2JhbEZ1bmN0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBleHBvcnRzLmFuZ3VsYXJHcmlkID0gYW5ndWxhckdyaWRHbG9iYWxGdW5jdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICByb290LmFuZ3VsYXJHcmlkID0gYW5ndWxhckdyaWRHbG9iYWxGdW5jdGlvbjtcclxuXHJcbiAgICBmdW5jdGlvbiBBbmd1bGFyRGlyZWN0aXZlQ29udHJvbGxlcigkZWxlbWVudCwgJHNjb3BlLCAkY29tcGlsZSkge1xyXG4gICAgICAgIHZhciBlR3JpZERpdiA9ICRlbGVtZW50WzBdO1xyXG4gICAgICAgIHZhciBncmlkT3B0aW9ucyA9ICRzY29wZS5hbmd1bGFyR3JpZDtcclxuICAgICAgICBpZiAoIWdyaWRPcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIldBUk5JTkcgLSBncmlkIG9wdGlvbnMgZm9yIEFuZ3VsYXIgR3JpZCBub3QgZm91bmQuIFBsZWFzZSBlbnN1cmUgdGhlIGF0dHJpYnV0ZSBhbmd1bGFyLWdyaWQgcG9pbnRzIHRvIGEgdmFsaWQgb2JqZWN0IG9uIHRoZSBzY29wZVwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZ3JpZCA9IG5ldyBHcmlkKGVHcmlkRGl2LCBncmlkT3B0aW9ucywgJHNjb3BlLCAkY29tcGlsZSk7XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oXCIkZGVzdHJveVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZ3JpZC5zZXRGaW5pc2hlZCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdsb2JhbCBGdW5jdGlvbiAtIHRoaXMgZnVuY3Rpb24gaXMgdXNlZCBmb3IgY3JlYXRpbmcgYSBncmlkLCBvdXRzaWRlIG9mIGFueSBBbmd1bGFySlNcclxuICAgIGZ1bmN0aW9uIGFuZ3VsYXJHcmlkR2xvYmFsRnVuY3Rpb24oZWxlbWVudCwgZ3JpZE9wdGlvbnMpIHtcclxuICAgICAgICAvLyBzZWUgaWYgZWxlbWVudCBpcyBhIHF1ZXJ5IHNlbGVjdG9yLCBvciBhIHJlYWwgZWxlbWVudFxyXG4gICAgICAgIHZhciBlR3JpZERpdjtcclxuICAgICAgICBpZiAodHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGVHcmlkRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbGVtZW50KTtcclxuICAgICAgICAgICAgaWYgKCFlR3JpZERpdikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1dBUk5JTkcgLSB3YXMgbm90IGFibGUgdG8gZmluZCBlbGVtZW50ICcgKyBlbGVtZW50ICsgJyBpbiB0aGUgRE9NLCBBbmd1bGFyIEdyaWQgaW5pdGlhbGlzYXRpb24gYWJvcnRlZC4nKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVHcmlkRGl2ID0gZWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmV3IEdyaWQoZUdyaWREaXYsIGdyaWRPcHRpb25zLCBudWxsLCBudWxsKTtcclxuICAgIH1cclxuXHJcbn0pLmNhbGwod2luZG93KTtcclxuIiwidmFyIFN2Z0ZhY3RvcnkgPSByZXF1aXJlKCcuLi9zdmdGYWN0b3J5Jyk7XHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcbnZhciBzdmdGYWN0b3J5ID0gbmV3IFN2Z0ZhY3RvcnkoKTtcclxuXHJcbmZ1bmN0aW9uIGdyb3VwQ2VsbFJlbmRlcmVyRmFjdG9yeShncmlkT3B0aW9uc1dyYXBwZXIsIHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSkge1xyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbiBncm91cENlbGxSZW5kZXJlcihwYXJhbXMpIHtcclxuXHJcbiAgICAgICAgdmFyIGVHcm91cENlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBwYXJhbXMubm9kZTtcclxuXHJcbiAgICAgICAgdmFyIGV4cGFuZEljb25OZWVkZWQgPSBub2RlLmdyb3VwICYmICFub2RlLmZvb3RlcjtcclxuICAgICAgICBpZiAoZXhwYW5kSWNvbk5lZWRlZCkge1xyXG4gICAgICAgICAgICB2YXIgZUV4cGFuZEljb24gPSBjcmVhdGVHcm91cEV4cGFuZEljb24obm9kZS5leHBhbmRlZCk7XHJcbiAgICAgICAgICAgIGVHcm91cENlbGwuYXBwZW5kQ2hpbGQoZUV4cGFuZEljb24pO1xyXG4gICAgICAgICAgICBlRXhwYW5kSWNvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZXhwYW5kR3JvdXAobm9kZSwgcGFyYW1zKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgY2hlY2tib3hOZWVkZWQgPSBwYXJhbXMuY29sRGVmICYmIHBhcmFtcy5jb2xEZWYuY2VsbFJlbmRlcmVyICYmIHBhcmFtcy5jb2xEZWYuY2VsbFJlbmRlcmVyLmNoZWNrYm94ICYmICFub2RlLmZvb3RlcjtcclxuICAgICAgICBpZiAoY2hlY2tib3hOZWVkZWQpIHtcclxuICAgICAgICAgICAgdmFyIGVDaGVja2JveCA9IHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeS5jcmVhdGVTZWxlY3Rpb25DaGVja2JveChub2RlLCBwYXJhbXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgICBlR3JvdXBDZWxsLmFwcGVuZENoaWxkKGVDaGVja2JveCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGFyYW1zLmNvbERlZiAmJiBwYXJhbXMuY29sRGVmLmNlbGxSZW5kZXJlciAmJiBwYXJhbXMuY29sRGVmLmNlbGxSZW5kZXJlci5pbm5lclJlbmRlcmVyKSB7XHJcbiAgICAgICAgICAgIGNyZWF0ZUZyb21Jbm5lclJlbmRlcmVyKGVHcm91cENlbGwsIHBhcmFtcywgcGFyYW1zLmNvbERlZi5jZWxsUmVuZGVyZXIuaW5uZXJSZW5kZXJlcik7XHJcbiAgICAgICAgfSBlbHNlIGlmIChub2RlLmZvb3Rlcikge1xyXG4gICAgICAgICAgICBjcmVhdGVGb290ZXJDZWxsKGVHcm91cENlbGwsIG5vZGUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobm9kZS5ncm91cCkge1xyXG4gICAgICAgICAgICBjcmVhdGVHcm91cENlbGwoZUdyb3VwQ2VsbCwgbm9kZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3JlYXRlTGVhZkNlbGwoZUdyb3VwQ2VsbCwgcGFyYW1zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG9ubHkgZG8gdGhpcyBpZiBhbiBpbmRlbnQgLSBhcyB0aGlzIG92ZXJ3cml0ZXMgdGhlIHBhZGRpbmcgdGhhdFxyXG4gICAgICAgIC8vIHRoZSB0aGVtZSBzZXQsIHdoaWNoIHdpbGwgbWFrZSB0aGluZ3MgbG9vayAnbm90IGFsaWduZWQnIGZvciB0aGVcclxuICAgICAgICAvLyBmaXJzdCBncm91cCBsZXZlbC5cclxuICAgICAgICBpZiAobm9kZS5mb290ZXIgfHwgbm9kZS5sZXZlbCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIHBhZGRpbmdQeCA9IG5vZGUubGV2ZWwgKiAxMDtcclxuICAgICAgICAgICAgaWYgKG5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nUHggKz0gMTA7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIW5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgICAgIHBhZGRpbmdQeCArPSA1O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVHcm91cENlbGwuc3R5bGUucGFkZGluZ0xlZnQgPSBwYWRkaW5nUHggKyBcInB4XCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobm9kZS5ncm91cCkge1xyXG4gICAgICAgICAgICBlR3JvdXBDZWxsLmFkZEV2ZW50TGlzdGVuZXIoXCJkYmxjbGlja1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBleHBhbmRHcm91cChub2RlLCBwYXJhbXMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBlR3JvdXBDZWxsO1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVGcm9tSW5uZXJSZW5kZXJlcihlR3JvdXBDZWxsLCBwYXJhbXMsIHJlbmRlcmVyKSB7XHJcbiAgICAgICAgdXRpbHMudXNlUmVuZGVyZXIoZUdyb3VwQ2VsbCwgcmVuZGVyZXIsIHBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZXhwYW5kR3JvdXAobm9kZSwgcGFyYW1zKSB7XHJcbiAgICAgICAgbm9kZS5leHBhbmRlZCA9ICFub2RlLmV4cGFuZGVkO1xyXG4gICAgICAgIHBhcmFtcy5hcGkub25Hcm91cEV4cGFuZGVkT3JDb2xsYXBzZWQoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVHcm91cEV4cGFuZEljb24oZXhwYW5kZWQpIHtcclxuICAgICAgICBpZiAoZXhwYW5kZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHV0aWxzLmNyZWF0ZUljb24oJ2dyb3VwRXhwYW5kZWQnLCBncmlkT3B0aW9uc1dyYXBwZXIsIG51bGwsIHN2Z0ZhY3RvcnkuY3JlYXRlQXJyb3dEb3duU3ZnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdXRpbHMuY3JlYXRlSWNvbignZ3JvdXBDb250cmFjdGVkJywgZ3JpZE9wdGlvbnNXcmFwcGVyLCBudWxsLCBzdmdGYWN0b3J5LmNyZWF0ZUFycm93UmlnaHRTdmcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBjcmVhdGVzIGNlbGwgd2l0aCAnVG90YWwge3trZXl9fScgZm9yIGEgZ3JvdXBcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUZvb3RlckNlbGwoZVBhcmVudCwgbm9kZSkge1xyXG4gICAgICAgIHZhciB0ZXh0VG9EaXNwbGF5ID0gXCJUb3RhbCBcIiArIG5vZGUua2V5O1xyXG4gICAgICAgIHZhciBlVGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHRUb0Rpc3BsYXkpO1xyXG4gICAgICAgIGVQYXJlbnQuYXBwZW5kQ2hpbGQoZVRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNyZWF0ZXMgY2VsbCB3aXRoICd7e2tleX19ICh7e2NoaWxkQ291bnR9fSknIGZvciBhIGdyb3VwXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVHcm91cENlbGwoZVBhcmVudCwgbm9kZSkge1xyXG4gICAgICAgIHZhciB0ZXh0VG9EaXNwbGF5ID0gXCIgXCIgKyBub2RlLmtleTtcclxuICAgICAgICAvLyBvbmx5IGluY2x1ZGUgdGhlIGNoaWxkIGNvdW50IGlmIGl0J3MgaW5jbHVkZWQsIGVnIGlmIHVzZXIgZG9pbmcgY3VzdG9tIGFnZ3JlZ2F0aW9uLFxyXG4gICAgICAgIC8vIHRoZW4gdGhpcyBjb3VsZCBiZSBsZWZ0IG91dCwgb3Igc2V0IHRvIC0xLCBpZSBubyBjaGlsZCBjb3VudFxyXG4gICAgICAgIGlmIChub2RlLmFsbENoaWxkcmVuQ291bnQgPj0gMCkge1xyXG4gICAgICAgICAgICB0ZXh0VG9EaXNwbGF5ICs9IFwiIChcIiArIG5vZGUuYWxsQ2hpbGRyZW5Db3VudCArIFwiKVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZVRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0VG9EaXNwbGF5KTtcclxuICAgICAgICBlUGFyZW50LmFwcGVuZENoaWxkKGVUZXh0KTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gY3JlYXRlcyBjZWxsIHdpdGggJ3t7a2V5fX0gKHt7Y2hpbGRDb3VudH19KScgZm9yIGEgZ3JvdXBcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUxlYWZDZWxsKGVQYXJlbnQsIHBhcmFtcykge1xyXG4gICAgICAgIGlmIChwYXJhbXMudmFsdWUpIHtcclxuICAgICAgICAgICAgdmFyIGVUZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJyAnICsgcGFyYW1zLnZhbHVlKTtcclxuICAgICAgICAgICAgZVBhcmVudC5hcHBlbmRDaGlsZChlVGV4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGdyb3VwQ2VsbFJlbmRlcmVyRmFjdG9yeTsiLCJ2YXIgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcclxuXHJcbmZ1bmN0aW9uIENvbHVtbkNvbnRyb2xsZXIoKSB7XHJcbiAgICB0aGlzLmNyZWF0ZU1vZGVsKCk7XHJcbn1cclxuXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihhbmd1bGFyR3JpZCwgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LCBncmlkT3B0aW9uc1dyYXBwZXIpIHtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyID0gZ3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkO1xyXG4gICAgdGhpcy5zZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkgPSBzZWxlY3Rpb25SZW5kZXJlckZhY3Rvcnk7XHJcbn07XHJcblxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5jcmVhdGVNb2RlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5tb2RlbCA9IHtcclxuICAgICAgICAvLyB1c2VkIGJ5OlxyXG4gICAgICAgIC8vICsgaW5NZW1vcnlSb3dDb250cm9sbGVyIC0+IHNvcnRpbmcsIGJ1aWxkaW5nIHF1aWNrIGZpbHRlciB0ZXh0XHJcbiAgICAgICAgLy8gKyBoZWFkZXJSZW5kZXJlciAtPiBzb3J0aW5nIChjbGVhcmluZyBpY29uKVxyXG4gICAgICAgIGdldEFsbENvbHVtbnM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5jb2x1bW5zO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gKyByb3dDb250cm9sbGVyIC0+IHdoaWxlIGluc2VydGluZyByb3dzLCBhbmQgd2hlbiB0YWJiaW5nIHRocm91Z2ggY2VsbHMgKG5lZWQgdG8gY2hhbmdlIHRoaXMpXHJcbiAgICAgICAgLy8gbmVlZCBhIG5ld01ldGhvZCAtIGdldCBuZXh0IGNvbCBpbmRleFxyXG4gICAgICAgIGdldFZpc2libGVDb2x1bW5zOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQudmlzaWJsZUNvbHVtbnM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyB1c2VkIGJ5OlxyXG4gICAgICAgIC8vICsgYW5ndWxhckdyaWQgLT4gZm9yIHNldHRpbmcgYm9keSB3aWR0aFxyXG4gICAgICAgIC8vICsgcm93Q29udHJvbGxlciAtPiBzZXR0aW5nIG1haW4gcm93IHdpZHRocyAod2hlbiBpbnNlcnRpbmcgYW5kIHJlc2l6aW5nKVxyXG4gICAgICAgIGdldEJvZHlDb250YWluZXJXaWR0aDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmdldFRvdGFsQ29sV2lkdGgoZmFsc2UpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gdXNlZCBieTpcclxuICAgICAgICAvLyArIGFuZ3VsYXJHcmlkIC0+IHNldHRpbmcgcGlubmVkIGJvZHkgd2lkdGhcclxuICAgICAgICBnZXRQaW5uZWRDb250YWluZXJXaWR0aDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmdldFRvdGFsQ29sV2lkdGgodHJ1ZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyB1c2VkIGJ5OlxyXG4gICAgICAgIC8vICsgaGVhZGVyUmVuZGVyZXIgLT4gc2V0dGluZyBwaW5uZWQgYm9keSB3aWR0aFxyXG4gICAgICAgIGdldENvbHVtbkdyb3VwczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmNvbHVtbkdyb3VwcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIHVzZWQgYnk6XHJcbiAgICAgICAgLy8gKyByb3dSZW5kZXJlciAtPiBmb3IgbmF2aWdhdGlvblxyXG4gICAgICAgIGdldFZpc2libGVDb2xCZWZvcmU6IGZ1bmN0aW9uKGNvbCkge1xyXG4gICAgICAgICAgICB2YXIgb2xkSW5kZXggPSB0aGF0LnZpc2libGVDb2x1bW5zLmluZGV4T2YoY29sKTtcclxuICAgICAgICAgICAgaWYgKG9sZEluZGV4ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoYXQudmlzaWJsZUNvbHVtbnNbb2xkSW5kZXggLSAxXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyB1c2VkIGJ5OlxyXG4gICAgICAgIC8vICsgcm93UmVuZGVyZXIgLT4gZm9yIG5hdmlnYXRpb25cclxuICAgICAgICBnZXRWaXNpYmxlQ29sQWZ0ZXI6IGZ1bmN0aW9uKGNvbCkge1xyXG4gICAgICAgICAgICB2YXIgb2xkSW5kZXggPSB0aGF0LnZpc2libGVDb2x1bW5zLmluZGV4T2YoY29sKTtcclxuICAgICAgICAgICAgaWYgKG9sZEluZGV4IDwgKHRoYXQudmlzaWJsZUNvbHVtbnMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGF0LnZpc2libGVDb2x1bW5zW29sZEluZGV4ICsgMV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5nZXRNb2RlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubW9kZWw7XHJcbn07XHJcblxyXG4vLyBjYWxsZWQgYnkgYW5ndWxhckdyaWRcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuc2V0Q29sdW1ucyA9IGZ1bmN0aW9uKGNvbHVtbkRlZnMpIHtcclxuICAgIHRoaXMuYnVpbGRDb2x1bW5zKGNvbHVtbkRlZnMpO1xyXG4gICAgdGhpcy5lbnN1cmVFYWNoQ29sSGFzU2l6ZSgpO1xyXG4gICAgdGhpcy5idWlsZEdyb3VwcygpO1xyXG4gICAgdGhpcy51cGRhdGVHcm91cHMoKTtcclxuICAgIHRoaXMudXBkYXRlVmlzaWJsZUNvbHVtbnMoKTtcclxufTtcclxuXHJcbi8vIGNhbGxlZCBieSBoZWFkZXJSZW5kZXJlciAtIHdoZW4gYSBoZWFkZXIgaXMgb3BlbmVkIG9yIGNsb3NlZFxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5jb2x1bW5Hcm91cE9wZW5lZCA9IGZ1bmN0aW9uKGdyb3VwKSB7XHJcbiAgICBncm91cC5leHBhbmRlZCA9ICFncm91cC5leHBhbmRlZDtcclxuICAgIHRoaXMudXBkYXRlR3JvdXBzKCk7XHJcbiAgICB0aGlzLnVwZGF0ZVZpc2libGVDb2x1bW5zKCk7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkLnJlZnJlc2hIZWFkZXJBbmRCb2R5KCk7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZVZpc2libGVDb2x1bW5zID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBpZiBub3QgZ3JvdXBpbmcgYnkgaGVhZGVycywgdGhlbiBhbGwgY29sdW1ucyBhcmUgdmlzaWJsZVxyXG4gICAgaWYgKCF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwSGVhZGVycygpKSB7XHJcbiAgICAgICAgdGhpcy52aXNpYmxlQ29sdW1ucyA9IHRoaXMuY29sdW1ucztcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgZ3JvdXBpbmcsIHRoZW4gb25seSBzaG93IGNvbCBhcyBwZXIgZ3JvdXAgcnVsZXNcclxuICAgIHRoaXMudmlzaWJsZUNvbHVtbnMgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb2x1bW5Hcm91cHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgZ3JvdXAgPSB0aGlzLmNvbHVtbkdyb3Vwc1tpXTtcclxuICAgICAgICBncm91cC5hZGRUb1Zpc2libGVDb2x1bW5zKHRoaXMudmlzaWJsZUNvbHVtbnMpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHVibGljIC0gY2FsbGVkIGZyb20gYXBpXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLnNpemVDb2x1bW5zVG9GaXQgPSBmdW5jdGlvbihncmlkV2lkdGgpIHtcclxuICAgIC8vIGF2b2lkIGRpdmlkZSBieSB6ZXJvXHJcbiAgICBpZiAoZ3JpZFdpZHRoIDw9IDAgfHwgdGhpcy52aXNpYmxlQ29sdW1ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNvbHVtblN0YXJ0V2lkdGggPSAwOyAvLyB3aWxsIGNvbnRhaW4gdGhlIHN0YXJ0aW5nIHRvdGFsIHdpZHRoIG9mIHRoZSBjb2xzIGJlZW4gc3ByZWFkXHJcbiAgICB2YXIgY29sc1RvU3ByZWFkID0gW107IC8vIGFsbCB2aXNpYmxlIGNvbHMsIGV4Y2VwdCB0aG9zZSB3aXRoIGF2b2lkU2l6ZVRvRml0XHJcbiAgICB2YXIgd2lkdGhGb3JTcHJlYWRpbmcgPSBncmlkV2lkdGg7IC8vIGdyaWQgd2lkdGggbWludXMgdGhlIGNvbHVtbnMgd2UgYXJlIG5vdCByZXNpemluZ1xyXG5cclxuICAgIC8vIGdldCB0aGUgbGlzdCBvZiBjb2xzIHRvIHdvcmsgd2l0aFxyXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLnZpc2libGVDb2x1bW5zLmxlbmd0aCA7IGorKykge1xyXG4gICAgICAgIGlmICh0aGlzLnZpc2libGVDb2x1bW5zW2pdLmNvbERlZi5zdXBwcmVzc1NpemVUb0ZpdCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAvLyBkb24ndCBpbmNsdWRlIGNvbCwgYW5kIHJlbW92ZSB0aGUgd2lkdGggZnJvbSB0ZWggYXZhaWxhYmxlIHdpZHRoXHJcbiAgICAgICAgICAgIHdpZHRoRm9yU3ByZWFkaW5nIC09IHRoaXMudmlzaWJsZUNvbHVtbnNbal0uYWN0dWFsV2lkdGg7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gaW5jbHVkZSB0aGUgY29sXHJcbiAgICAgICAgICAgIGNvbHNUb1NwcmVhZC5wdXNoKHRoaXMudmlzaWJsZUNvbHVtbnNbal0pO1xyXG4gICAgICAgICAgICBjb2x1bW5TdGFydFdpZHRoICs9IHRoaXMudmlzaWJsZUNvbHVtbnNbal0uYWN0dWFsV2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIG5vIHdpZHRoIGxlZnQgb3ZlciB0byBzcHJlYWQgd2l0aCwgZG8gbm90aGluZ1xyXG4gICAgaWYgKHdpZHRoRm9yU3ByZWFkaW5nIDw9IDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNjYWxlID0gd2lkdGhGb3JTcHJlYWRpbmcgLyBjb2x1bW5TdGFydFdpZHRoO1xyXG4gICAgdmFyIHBpeGVsc0Zvckxhc3RDb2wgPSB3aWR0aEZvclNwcmVhZGluZztcclxuXHJcbiAgICAvLyBzaXplIGFsbCBjb2xzIGV4Y2VwdCB0aGUgbGFzdCBieSB0aGUgc2NhbGVcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgKGNvbHNUb1NwcmVhZC5sZW5ndGggLSAxKTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNvbHVtbiA9IGNvbHNUb1NwcmVhZFtpXTtcclxuICAgICAgICB2YXIgbmV3V2lkdGggPSBwYXJzZUludChjb2x1bW4uYWN0dWFsV2lkdGggKiBzY2FsZSk7XHJcbiAgICAgICAgY29sdW1uLmFjdHVhbFdpZHRoID0gbmV3V2lkdGg7XHJcbiAgICAgICAgcGl4ZWxzRm9yTGFzdENvbCAtPSBuZXdXaWR0aDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzaXplIHRoZSBsYXN0IGJ5IHdoYXRzIHJlbWFpbmluZyAodGhpcyBhdm9pZHMgcm91bmRpbmcgZXJyb3JzIHRoYXQgY291bGRcclxuICAgIC8vIG9jY3VyIHdpdGggc2NhbGluZyBldmVyeXRoaW5nLCB3aGVyZSBpdCByZXN1bHQgaW4gc29tZSBwaXhlbHMgb2ZmKVxyXG4gICAgdmFyIGxhc3RDb2x1bW4gPSBjb2xzVG9TcHJlYWRbY29sc1RvU3ByZWFkLmxlbmd0aCAtIDFdO1xyXG4gICAgbGFzdENvbHVtbi5hY3R1YWxXaWR0aCA9IHBpeGVsc0Zvckxhc3RDb2w7XHJcblxyXG4gICAgLy8gd2lkdGhzIHNldCwgcmVmcmVzaCB0aGUgZ3VpXHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkLnJlZnJlc2hIZWFkZXJBbmRCb2R5KCk7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmJ1aWxkR3JvdXBzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBpZiBub3QgZ3JvdXBpbmcgYnkgaGVhZGVycywgZG8gbm90aGluZ1xyXG4gICAgaWYgKCF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwSGVhZGVycygpKSB7XHJcbiAgICAgICAgdGhpcy5jb2x1bW5Hcm91cHMgPSBudWxsO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzcGxpdCB0aGUgY29sdW1ucyBpbnRvIGdyb3Vwc1xyXG4gICAgdmFyIGN1cnJlbnRHcm91cCA9IG51bGw7XHJcbiAgICB0aGlzLmNvbHVtbkdyb3VwcyA9IFtdO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIHZhciBsYXN0Q29sV2FzUGlubmVkID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLmNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgICAgICAvLyBkbyB3ZSBuZWVkIGEgbmV3IGdyb3VwLCBiZWNhdXNlIHdlIG1vdmUgZnJvbSBwaW5uZWQgdG8gbm9uLXBpbm5lZCBjb2x1bW5zP1xyXG4gICAgICAgIHZhciBlbmRPZlBpbm5lZEhlYWRlciA9IGxhc3RDb2xXYXNQaW5uZWQgJiYgIWNvbHVtbi5waW5uZWQ7XHJcbiAgICAgICAgaWYgKCFjb2x1bW4ucGlubmVkKSB7XHJcbiAgICAgICAgICAgIGxhc3RDb2xXYXNQaW5uZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZG8gd2UgbmVlZCBhIG5ldyBncm91cCwgYmVjYXVzZSB0aGUgZ3JvdXAgbmFtZXMgZG9lc24ndCBtYXRjaCBmcm9tIHByZXZpb3VzIGNvbD9cclxuICAgICAgICB2YXIgZ3JvdXBLZXlNaXNtYXRjaCA9IGN1cnJlbnRHcm91cCAmJiBjb2x1bW4uY29sRGVmLmdyb3VwICE9PSBjdXJyZW50R3JvdXAubmFtZTtcclxuICAgICAgICAvLyB3ZSBkb24ndCBncm91cCBjb2x1bW5zIHdoZXJlIG5vIGdyb3VwIGlzIHNwZWNpZmllZFxyXG4gICAgICAgIHZhciBjb2xOb3RJbkdyb3VwID0gY3VycmVudEdyb3VwICYmICFjdXJyZW50R3JvdXAubmFtZTtcclxuICAgICAgICAvLyBkbyB3ZSBuZWVkIGEgbmV3IGdyb3VwLCBiZWNhdXNlIHdlIGFyZSBqdXN0IHN0YXJ0aW5nXHJcbiAgICAgICAgdmFyIHByb2Nlc3NpbmdGaXJzdENvbCA9IGNvbHVtbi5pbmRleCA9PT0gMDtcclxuICAgICAgICB2YXIgbmV3R3JvdXBOZWVkZWQgPSBwcm9jZXNzaW5nRmlyc3RDb2wgfHwgZW5kT2ZQaW5uZWRIZWFkZXIgfHwgZ3JvdXBLZXlNaXNtYXRjaCB8fCBjb2xOb3RJbkdyb3VwO1xyXG4gICAgICAgIC8vIGNyZWF0ZSBuZXcgZ3JvdXAsIGlmIGl0J3MgbmVlZGVkXHJcbiAgICAgICAgaWYgKG5ld0dyb3VwTmVlZGVkKSB7XHJcbiAgICAgICAgICAgIHZhciBwaW5uZWQgPSBjb2x1bW4ucGlubmVkO1xyXG4gICAgICAgICAgICBjdXJyZW50R3JvdXAgPSBuZXcgQ29sdW1uR3JvdXAocGlubmVkLCBjb2x1bW4uY29sRGVmLmdyb3VwKTtcclxuICAgICAgICAgICAgdGhhdC5jb2x1bW5Hcm91cHMucHVzaChjdXJyZW50R3JvdXApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjdXJyZW50R3JvdXAuYWRkQ29sdW1uKGNvbHVtbik7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlR3JvdXBzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBpZiBub3QgZ3JvdXBpbmcgYnkgaGVhZGVycywgZG8gbm90aGluZ1xyXG4gICAgaWYgKCF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwSGVhZGVycygpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb2x1bW5Hcm91cHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgZ3JvdXAgPSB0aGlzLmNvbHVtbkdyb3Vwc1tpXTtcclxuICAgICAgICBncm91cC5jYWxjdWxhdGVFeHBhbmRhYmxlKCk7XHJcbiAgICAgICAgZ3JvdXAuY2FsY3VsYXRlVmlzaWJsZUNvbHVtbnMoKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuYnVpbGRDb2x1bW5zID0gZnVuY3Rpb24oY29sdW1uRGVmcykge1xyXG4gICAgdGhpcy5jb2x1bW5zID0gW107XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB2YXIgcGlubmVkQ29sdW1uQ291bnQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRQaW5uZWRDb2xDb3VudCgpO1xyXG4gICAgaWYgKGNvbHVtbkRlZnMpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbHVtbkRlZnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGNvbERlZiA9IGNvbHVtbkRlZnNbaV07XHJcbiAgICAgICAgICAgIC8vIHRoaXMgaXMgbWVzc3kgLSB3ZSBzd2FwIGluIGFub3RoZXIgY29sIGRlZiBpZiBpdCdzIGNoZWNrYm94IHNlbGVjdGlvbiAtIG5vdCBoYXBweSA6KFxyXG4gICAgICAgICAgICBpZiAoY29sRGVmID09PSAnY2hlY2tib3hTZWxlY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICBjb2xEZWYgPSB0aGF0LnNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeS5jcmVhdGVDaGVja2JveENvbERlZigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBwaW5uZWQgPSBwaW5uZWRDb2x1bW5Db3VudCA+IGk7XHJcbiAgICAgICAgICAgIHZhciBjb2x1bW4gPSBuZXcgQ29sdW1uKGNvbERlZiwgaSwgcGlubmVkKTtcclxuICAgICAgICAgICAgdGhhdC5jb2x1bW5zLnB1c2goY29sdW1uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbi8vIHNldCB0aGUgYWN0dWFsIHdpZHRocyBmb3IgZWFjaCBjb2xcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuZW5zdXJlRWFjaENvbEhhc1NpemUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBkZWZhdWx0V2lkdGggPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb2xXaWR0aCgpO1xyXG4gICAgaWYgKHR5cGVvZiBkZWZhdWx0V2lkdGggIT09ICdudW1iZXInIHx8IGRlZmF1bHRXaWR0aCA8IGNvbnN0YW50cy5NSU5fQ09MX1dJRFRIKSB7XHJcbiAgICAgICAgZGVmYXVsdFdpZHRoID0gMjAwO1xyXG4gICAgfVxyXG4gICAgdGhpcy5jb2x1bW5zLmZvckVhY2goZnVuY3Rpb24oY29sRGVmV3JhcHBlcikge1xyXG4gICAgICAgIHZhciBjb2xEZWYgPSBjb2xEZWZXcmFwcGVyLmNvbERlZjtcclxuICAgICAgICBpZiAoY29sRGVmV3JhcHBlci5hY3R1YWxXaWR0aCkge1xyXG4gICAgICAgICAgICAvLyBpZiBhY3R1YWwgd2lkdGggYWxyZWFkeSBzZXQsIGRvIG5vdGhpbmdcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIWNvbERlZi53aWR0aCkge1xyXG4gICAgICAgICAgICAvLyBpZiBubyB3aWR0aCBkZWZpbmVkIGluIGNvbERlZiwgZGVmYXVsdCB0byAyMDBcclxuICAgICAgICAgICAgY29sRGVmV3JhcHBlci5hY3R1YWxXaWR0aCA9IGRlZmF1bHRXaWR0aDtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbERlZi53aWR0aCA8IGNvbnN0YW50cy5NSU5fQ09MX1dJRFRIKSB7XHJcbiAgICAgICAgICAgIC8vIGlmIHdpZHRoIGluIGNvbCBkZWYgdG8gc21hbGwsIHNldCB0byBtaW4gd2lkdGhcclxuICAgICAgICAgICAgY29sRGVmV3JhcHBlci5hY3R1YWxXaWR0aCA9IGNvbnN0YW50cy5NSU5fQ09MX1dJRFRIO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSB1c2UgdGhlIHByb3ZpZGVkIHdpZHRoXHJcbiAgICAgICAgICAgIGNvbERlZldyYXBwZXIuYWN0dWFsV2lkdGggPSBjb2xEZWYud2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbi8vIGNhbGwgd2l0aCB0cnVlIChwaW5uZWQpLCBmYWxzZSAobm90LXBpbm5lZCkgb3IgdW5kZWZpbmVkIChhbGwgY29sdW1ucylcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0VG90YWxDb2xXaWR0aCA9IGZ1bmN0aW9uKGluY2x1ZGVQaW5uZWQpIHtcclxuICAgIHZhciB3aWR0aFNvRmFyID0gMDtcclxuICAgIHZhciBwaW5lZE5vdEltcG9ydGFudCA9IHR5cGVvZiBpbmNsdWRlUGlubmVkICE9PSAnYm9vbGVhbic7XHJcblxyXG4gICAgdGhpcy52aXNpYmxlQ29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgICAgIHZhciBpbmNsdWRlVGhpc0NvbCA9IHBpbmVkTm90SW1wb3J0YW50IHx8IGNvbHVtbi5waW5uZWQgPT09IGluY2x1ZGVQaW5uZWQ7XHJcbiAgICAgICAgaWYgKGluY2x1ZGVUaGlzQ29sKSB7XHJcbiAgICAgICAgICAgIHdpZHRoU29GYXIgKz0gY29sdW1uLmFjdHVhbFdpZHRoO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB3aWR0aFNvRmFyO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gQ29sdW1uR3JvdXAocGlubmVkLCBuYW1lKSB7XHJcbiAgICB0aGlzLnBpbm5lZCA9IHBpbm5lZDtcclxuICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICB0aGlzLmFsbENvbHVtbnMgPSBbXTtcclxuICAgIHRoaXMudmlzaWJsZUNvbHVtbnMgPSBbXTtcclxuICAgIHRoaXMuZXhwYW5kYWJsZSA9IGZhbHNlOyAvLyB3aGV0aGVyIHRoaXMgZ3JvdXAgY2FuIGJlIGV4cGFuZGVkIG9yIG5vdFxyXG4gICAgdGhpcy5leHBhbmRlZCA9IGZhbHNlO1xyXG59XHJcblxyXG5Db2x1bW5Hcm91cC5wcm90b3R5cGUuYWRkQ29sdW1uID0gZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICB0aGlzLmFsbENvbHVtbnMucHVzaChjb2x1bW4pO1xyXG59O1xyXG5cclxuLy8gbmVlZCB0byBjaGVjayB0aGF0IHRoaXMgZ3JvdXAgaGFzIGF0IGxlYXN0IG9uZSBjb2wgc2hvd2luZyB3aGVuIGJvdGggZXhwYW5kZWQgYW5kIGNvbnRyYWN0ZWQuXHJcbi8vIGlmIG5vdCwgdGhlbiB3ZSBkb24ndCBhbGxvdyBleHBhbmRpbmcgYW5kIGNvbnRyYWN0aW5nIG9uIHRoaXMgZ3JvdXBcclxuQ29sdW1uR3JvdXAucHJvdG90eXBlLmNhbGN1bGF0ZUV4cGFuZGFibGUgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIHdhbnQgdG8gbWFrZSBzdXJlIHRoZSBncm91cCBkb2Vzbid0IGRpc2FwcGVhciB3aGVuIGl0J3Mgb3BlblxyXG4gICAgdmFyIGF0TGVhc3RPbmVTaG93aW5nV2hlbk9wZW4gPSBmYWxzZTtcclxuICAgIC8vIHdhbnQgdG8gbWFrZSBzdXJlIHRoZSBncm91cCBkb2Vzbid0IGRpc2FwcGVhciB3aGVuIGl0J3MgY2xvc2VkXHJcbiAgICB2YXIgYXRMZWFzdE9uZVNob3dpbmdXaGVuQ2xvc2VkID0gZmFsc2U7XHJcbiAgICAvLyB3YW50IHRvIG1ha2Ugc3VyZSB0aGUgZ3JvdXAgaGFzIHNvbWV0aGluZyB0byBzaG93IC8gaGlkZVxyXG4gICAgdmFyIGF0TGVhc3RPbmVDaGFuZ2VhYmxlID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IHRoaXMuYWxsQ29sdW1ucy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgICB2YXIgY29sdW1uID0gdGhpcy5hbGxDb2x1bW5zW2ldO1xyXG4gICAgICAgIGlmIChjb2x1bW4uY29sRGVmLmdyb3VwU2hvdyA9PT0gJ29wZW4nKSB7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVTaG93aW5nV2hlbk9wZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICBhdExlYXN0T25lQ2hhbmdlYWJsZSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2x1bW4uY29sRGVmLmdyb3VwU2hvdyA9PT0gJ2Nsb3NlZCcpIHtcclxuICAgICAgICAgICAgYXRMZWFzdE9uZVNob3dpbmdXaGVuQ2xvc2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgYXRMZWFzdE9uZUNoYW5nZWFibGUgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVTaG93aW5nV2hlbk9wZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICBhdExlYXN0T25lU2hvd2luZ1doZW5DbG9zZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmV4cGFuZGFibGUgPSBhdExlYXN0T25lU2hvd2luZ1doZW5PcGVuICYmIGF0TGVhc3RPbmVTaG93aW5nV2hlbkNsb3NlZCAmJiBhdExlYXN0T25lQ2hhbmdlYWJsZTtcclxufTtcclxuXHJcbkNvbHVtbkdyb3VwLnByb3RvdHlwZS5jYWxjdWxhdGVWaXNpYmxlQ29sdW1ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gY2xlYXIgb3V0IGxhc3QgdGltZSB3ZSBjYWxjdWxhdGVkXHJcbiAgICB0aGlzLnZpc2libGVDb2x1bW5zID0gW107XHJcbiAgICAvLyBpdCBub3QgZXhwYW5kYWJsZSwgZXZlcnl0aGluZyBpcyB2aXNpYmxlXHJcbiAgICBpZiAoIXRoaXMuZXhwYW5kYWJsZSkge1xyXG4gICAgICAgIHRoaXMudmlzaWJsZUNvbHVtbnMgPSB0aGlzLmFsbENvbHVtbnM7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgLy8gYW5kIGNhbGN1bGF0ZSBhZ2FpblxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGogPSB0aGlzLmFsbENvbHVtbnMubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNvbHVtbiA9IHRoaXMuYWxsQ29sdW1uc1tpXTtcclxuICAgICAgICBzd2l0Y2ggKGNvbHVtbi5jb2xEZWYuZ3JvdXBTaG93KSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ29wZW4nOlxyXG4gICAgICAgICAgICAgICAgLy8gd2hlbiBzZXQgdG8gb3Blbiwgb25seSBzaG93IGNvbCBpZiBncm91cCBpcyBvcGVuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5leHBhbmRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlzaWJsZUNvbHVtbnMucHVzaChjb2x1bW4pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2Nsb3NlZCc6XHJcbiAgICAgICAgICAgICAgICAvLyB3aGVuIHNldCB0byBvcGVuLCBvbmx5IHNob3cgY29sIGlmIGdyb3VwIGlzIG9wZW5cclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5leHBhbmRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlzaWJsZUNvbHVtbnMucHVzaChjb2x1bW4pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvLyBkZWZhdWx0IGlzIGFsd2F5cyBzaG93IHRoZSBjb2x1bW5cclxuICAgICAgICAgICAgICAgIHRoaXMudmlzaWJsZUNvbHVtbnMucHVzaChjb2x1bW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuQ29sdW1uR3JvdXAucHJvdG90eXBlLmFkZFRvVmlzaWJsZUNvbHVtbnMgPSBmdW5jdGlvbihhbGxWaXNpYmxlQ29sdW1ucykge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZpc2libGVDb2x1bW5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNvbHVtbiA9IHRoaXMudmlzaWJsZUNvbHVtbnNbaV07XHJcbiAgICAgICAgYWxsVmlzaWJsZUNvbHVtbnMucHVzaChjb2x1bW4pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZnVuY3Rpb24gQ29sdW1uKGNvbERlZiwgaW5kZXgsIHBpbm5lZCkge1xyXG4gICAgdGhpcy5jb2xEZWYgPSBjb2xEZWY7XHJcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XHJcbiAgICB0aGlzLnBpbm5lZCA9IHBpbm5lZDtcclxuICAgIC8vIGluIHRoZSBmdXR1cmUsIHRoZSBjb2xLZXkgbWlnaHQgYmUgc29tZXRoaW5nIG90aGVyIHRoYW4gdGhlIGluZGV4XHJcbiAgICB0aGlzLmNvbEtleSA9IGluZGV4O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbHVtbkNvbnRyb2xsZXI7XHJcbiIsInZhciBjb25zdGFudHMgPSB7XHJcbiAgICBTVEVQX0VWRVJZVEhJTkc6IDAsXHJcbiAgICBTVEVQX0ZJTFRFUjogMSxcclxuICAgIFNURVBfU09SVDogMixcclxuICAgIFNURVBfTUFQOiAzLFxyXG4gICAgQVNDOiBcImFzY1wiLFxyXG4gICAgREVTQzogXCJkZXNjXCIsXHJcbiAgICBST1dfQlVGRkVSX1NJWkU6IDIwLFxyXG4gICAgU09SVF9TVFlMRV9TSE9XOiBcImRpc3BsYXk6aW5saW5lO1wiLFxyXG4gICAgU09SVF9TVFlMRV9ISURFOiBcImRpc3BsYXk6bm9uZTtcIixcclxuICAgIE1JTl9DT0xfV0lEVEg6IDEwXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnN0YW50cztcclxuIiwiZnVuY3Rpb24gRXhwcmVzc2lvblNlcnZpY2UoKSB7fVxyXG5cclxuRXhwcmVzc2lvblNlcnZpY2UucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24ocnVsZSwgcGFyYW1zKSB7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBFeHByZXNzaW9uU2VydmljZSgpIHtcclxuICAgIHRoaXMuZXhwcmVzc2lvblRvRnVuY3Rpb25DYWNoZSA9IHt9O1xyXG59XHJcblxyXG5FeHByZXNzaW9uU2VydmljZS5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoZXhwcmVzc2lvbiwgcGFyYW1zKSB7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICB2YXIgamF2YVNjcmlwdEZ1bmN0aW9uID0gdGhpcy5jcmVhdGVFeHByZXNzaW9uRnVuY3Rpb24oZXhwcmVzc2lvbik7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGphdmFTY3JpcHRGdW5jdGlvbihwYXJhbXMudmFsdWUsIHBhcmFtcy5jb250ZXh0LCBwYXJhbXMubm9kZSxcclxuICAgICAgICAgICAgcGFyYW1zLmRhdGEsIHBhcmFtcy5jb2xEZWYsIHBhcmFtcy5yb3dJbmRleCwgcGFyYW1zLmFwaSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAvLyB0aGUgZXhwcmVzc2lvbiBmYWlsZWQsIHdoaWNoIGNhbiBoYXBwZW4sIGFzIGl0J3MgdGhlIGNsaWVudCB0aGF0XHJcbiAgICAgICAgLy8gcHJvdmlkZXMgdGhlIGV4cHJlc3Npb24uIHNvIHByaW50IGEgbmljZSBtZXNzYWdlXHJcbiAgICAgICAgY29uc29sZS5lcnJvcignUHJvY2Vzc2luZyBvZiB0aGUgZXhwcmVzc2lvbiBmYWlsZWQnKTtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdFeHByZXNzaW9uID0gJyArIGV4cHJlc3Npb24pO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0V4Y2VwdGlvbiA9ICcgKyBlKTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufTtcclxuXHJcbkV4cHJlc3Npb25TZXJ2aWNlLnByb3RvdHlwZS5jcmVhdGVFeHByZXNzaW9uRnVuY3Rpb24gPSBmdW5jdGlvbiAoZXhwcmVzc2lvbikge1xyXG4gICAgLy8gY2hlY2sgY2FjaGUgZmlyc3RcclxuICAgIGlmICh0aGlzLmV4cHJlc3Npb25Ub0Z1bmN0aW9uQ2FjaGVbZXhwcmVzc2lvbl0pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5leHByZXNzaW9uVG9GdW5jdGlvbkNhY2hlW2V4cHJlc3Npb25dO1xyXG4gICAgfVxyXG4gICAgLy8gaWYgbm90IGZvdW5kIGluIGNhY2hlLCByZXR1cm4gdGhlIGZ1bmN0aW9uXHJcbiAgICB2YXIgZnVuY3Rpb25Cb2R5ID0gdGhpcy5jcmVhdGVGdW5jdGlvbkJvZHkoZXhwcmVzc2lvbik7XHJcbiAgICB2YXIgdGhlRnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24oJ3gsIGN0eCwgbm9kZSwgZGF0YSwgY29sRGVmLCByb3dJbmRleCwgYXBpJywgZnVuY3Rpb25Cb2R5KTtcclxuXHJcbiAgICAvLyBzdG9yZSBpbiBjYWNoZVxyXG4gICAgdGhpcy5leHByZXNzaW9uVG9GdW5jdGlvbkNhY2hlW2V4cHJlc3Npb25dID0gdGhlRnVuY3Rpb247XHJcblxyXG4gICAgcmV0dXJuIHRoZUZ1bmN0aW9uO1xyXG59O1xyXG5cclxuRXhwcmVzc2lvblNlcnZpY2UucHJvdG90eXBlLmNyZWF0ZUZ1bmN0aW9uQm9keSA9IGZ1bmN0aW9uIChleHByZXNzaW9uKSB7XHJcbiAgICAvLyBpZiB0aGUgZXhwcmVzc2lvbiBoYXMgdGhlICdyZXR1cm4nIHdvcmQgaW4gaXQsIHRoZW4gdXNlIGFzIGlzLFxyXG4gICAgLy8gaWYgbm90LCB0aGVuIHdyYXAgaXQgd2l0aCByZXR1cm4gYW5kICc7JyB0byBtYWtlIGEgZnVuY3Rpb25cclxuICAgIGlmIChleHByZXNzaW9uLmluZGV4T2YoJ3JldHVybicpID49IDApIHtcclxuICAgICAgICByZXR1cm4gZXhwcmVzc2lvbjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuICdyZXR1cm4gJyArIGV4cHJlc3Npb24gKyAnOyc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEV4cHJlc3Npb25TZXJ2aWNlO1xyXG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XHJcbnZhciBTZXRGaWx0ZXIgPSByZXF1aXJlKCcuL3NldEZpbHRlcicpO1xyXG52YXIgTnVtYmVyRmlsdGVyID0gcmVxdWlyZSgnLi9udW1iZXJGaWx0ZXInKTtcclxudmFyIFN0cmluZ0ZpbHRlciA9IHJlcXVpcmUoJy4vdGV4dEZpbHRlcicpO1xyXG5cclxuZnVuY3Rpb24gRmlsdGVyTWFuYWdlcigpIHt9XHJcblxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oZ3JpZCwgZ3JpZE9wdGlvbnNXcmFwcGVyLCAkY29tcGlsZSwgJHNjb3BlKSB7XHJcbiAgICB0aGlzLiRjb21waWxlID0gJGNvbXBpbGU7XHJcbiAgICB0aGlzLiRzY29wZSA9ICRzY29wZTtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyID0gZ3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4gICAgdGhpcy5ncmlkID0gZ3JpZDtcclxuICAgIHRoaXMuYWxsRmlsdGVycyA9IHt9O1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuc2V0Um93TW9kZWwgPSBmdW5jdGlvbihyb3dNb2RlbCkge1xyXG4gICAgdGhpcy5yb3dNb2RlbCA9IHJvd01vZGVsO1xyXG59O1xyXG5cclxuLy8gcmV0dXJucyB0cnVlIGlmIGF0IGxlYXN0IG9uZSBmaWx0ZXIgaXMgYWN0aXZlXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLmlzRmlsdGVyUHJlc2VudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGF0TGVhc3RPbmVBY3RpdmUgPSBmYWxzZTtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuYWxsRmlsdGVycyk7XHJcbiAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgdmFyIGZpbHRlcldyYXBwZXIgPSB0aGF0LmFsbEZpbHRlcnNba2V5XTtcclxuICAgICAgICBpZiAoIWZpbHRlcldyYXBwZXIuZmlsdGVyLmlzRmlsdGVyQWN0aXZlKSB7IC8vIGJlY2F1c2UgdXNlcnMgY2FuIGRvIGN1c3RvbSBmaWx0ZXJzLCBnaXZlIG5pY2UgZXJyb3IgbWVzc2FnZVxyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGaWx0ZXIgaXMgbWlzc2luZyBtZXRob2QgaXNGaWx0ZXJBY3RpdmUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZpbHRlcldyYXBwZXIuZmlsdGVyLmlzRmlsdGVyQWN0aXZlKCkpIHtcclxuICAgICAgICAgICAgYXRMZWFzdE9uZUFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gYXRMZWFzdE9uZUFjdGl2ZTtcclxufTtcclxuXHJcbi8vIHJldHVybnMgdHJ1ZSBpZiBnaXZlbiBjb2wgaGFzIGEgZmlsdGVyIGFjdGl2ZVxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5pc0ZpbHRlclByZXNlbnRGb3JDb2wgPSBmdW5jdGlvbihjb2xLZXkpIHtcclxuICAgIHZhciBmaWx0ZXJXcmFwcGVyID0gdGhpcy5hbGxGaWx0ZXJzW2NvbEtleV07XHJcbiAgICBpZiAoIWZpbHRlcldyYXBwZXIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAoIWZpbHRlcldyYXBwZXIuZmlsdGVyLmlzRmlsdGVyQWN0aXZlKSB7IC8vIGJlY2F1c2UgdXNlcnMgY2FuIGRvIGN1c3RvbSBmaWx0ZXJzLCBnaXZlIG5pY2UgZXJyb3IgbWVzc2FnZVxyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZpbHRlciBpcyBtaXNzaW5nIG1ldGhvZCBpc0ZpbHRlckFjdGl2ZScpO1xyXG4gICAgfVxyXG4gICAgdmFyIGZpbHRlclByZXNlbnQgPSBmaWx0ZXJXcmFwcGVyLmZpbHRlci5pc0ZpbHRlckFjdGl2ZSgpO1xyXG4gICAgcmV0dXJuIGZpbHRlclByZXNlbnQ7XHJcbn07XHJcblxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5kb2VzRmlsdGVyUGFzcyA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIHZhciBkYXRhID0gbm9kZS5kYXRhO1xyXG4gICAgdmFyIGNvbEtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmFsbEZpbHRlcnMpO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjb2xLZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyAvLyBjcml0aWNhbCBjb2RlLCBkb24ndCB1c2UgZnVuY3Rpb25hbCBwcm9ncmFtbWluZ1xyXG5cclxuICAgICAgICB2YXIgY29sS2V5ID0gY29sS2V5c1tpXTtcclxuICAgICAgICB2YXIgZmlsdGVyV3JhcHBlciA9IHRoaXMuYWxsRmlsdGVyc1tjb2xLZXldO1xyXG5cclxuICAgICAgICAvLyBpZiBubyBmaWx0ZXIsIGFsd2F5cyBwYXNzXHJcbiAgICAgICAgaWYgKGZpbHRlcldyYXBwZXIgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB2YWx1ZSA9IGRhdGFbZmlsdGVyV3JhcHBlci5maWVsZF07XHJcbiAgICAgICAgaWYgKCFmaWx0ZXJXcmFwcGVyLmZpbHRlci5kb2VzRmlsdGVyUGFzcykgeyAvLyBiZWNhdXNlIHVzZXJzIGNhbiBkbyBjdXN0b20gZmlsdGVycywgZ2l2ZSBuaWNlIGVycm9yIG1lc3NhZ2VcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmlsdGVyIGlzIG1pc3NpbmcgbWV0aG9kIGRvZXNGaWx0ZXJQYXNzJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBtb2RlbDtcclxuICAgICAgICAvLyBpZiBtb2RlbCBpcyBleHBvc2VkLCBncmFiIGl0XHJcbiAgICAgICAgaWYgKGZpbHRlcldyYXBwZXIuZmlsdGVyLmdldE1vZGVsKSB7XHJcbiAgICAgICAgICAgIG1vZGVsID0gZmlsdGVyV3JhcHBlci5maWx0ZXIuZ2V0TW9kZWwoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICBtb2RlbDogbW9kZWwsXHJcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGFcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmICghZmlsdGVyV3JhcHBlci5maWx0ZXIuZG9lc0ZpbHRlclBhc3MocGFyYW1zKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gYWxsIGZpbHRlcnMgcGFzc2VkXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLm9uTmV3Um93c0xvYWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgT2JqZWN0LmtleXModGhpcy5hbGxGaWx0ZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkKSB7XHJcbiAgICAgICAgdmFyIGZpbHRlciA9IHRoYXQuYWxsRmlsdGVyc1tmaWVsZF0uZmlsdGVyO1xyXG4gICAgICAgIGlmIChmaWx0ZXIub25OZXdSb3dzTG9hZGVkKSB7XHJcbiAgICAgICAgICAgIGZpbHRlci5vbk5ld1Jvd3NMb2FkZWQoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLnBvc2l0aW9uUG9wdXAgPSBmdW5jdGlvbihldmVudFNvdXJjZSwgZVBvcHVwLCBlUG9wdXBSb290KSB7XHJcbiAgICB2YXIgc291cmNlUmVjdCA9IGV2ZW50U291cmNlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgdmFyIHBhcmVudFJlY3QgPSBlUG9wdXBSb290LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgIHZhciB4ID0gc291cmNlUmVjdC5sZWZ0IC0gcGFyZW50UmVjdC5sZWZ0O1xyXG4gICAgdmFyIHkgPSBzb3VyY2VSZWN0LnRvcCAtIHBhcmVudFJlY3QudG9wICsgc291cmNlUmVjdC5oZWlnaHQ7XHJcblxyXG4gICAgLy8gaWYgcG9wdXAgaXMgb3ZlcmZsb3dpbmcgdG8gdGhlIHJpZ2h0LCBtb3ZlIGl0IGxlZnRcclxuICAgIHZhciB3aWR0aE9mUG9wdXAgPSAyMDA7IC8vIHRoaXMgaXMgc2V0IGluIHRoZSBjc3NcclxuICAgIHZhciB3aWR0aE9mUGFyZW50ID0gcGFyZW50UmVjdC5yaWdodCAtIHBhcmVudFJlY3QubGVmdDtcclxuICAgIHZhciBtYXhYID0gd2lkdGhPZlBhcmVudCAtIHdpZHRoT2ZQb3B1cCAtIDIwOyAvLyAyMCBwaXhlbHMgZ3JhY2VcclxuICAgIGlmICh4ID4gbWF4WCkgeyAvLyBtb3ZlIHBvc2l0aW9uIGxlZnQsIGJhY2sgaW50byB2aWV3XHJcbiAgICAgICAgeCA9IG1heFg7XHJcbiAgICB9XHJcbiAgICBpZiAoeCA8IDApIHsgLy8gaW4gY2FzZSB0aGUgcG9wdXAgaGFzIGEgbmVnYXRpdmUgdmFsdWVcclxuICAgICAgICB4ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBlUG9wdXAuc3R5bGUubGVmdCA9IHggKyBcInB4XCI7XHJcbiAgICBlUG9wdXAuc3R5bGUudG9wID0geSArIFwicHhcIjtcclxufTtcclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLnNob3dGaWx0ZXIgPSBmdW5jdGlvbihjb2xEZWZXcmFwcGVyLCBldmVudFNvdXJjZSkge1xyXG5cclxuICAgIHZhciBmaWx0ZXJXcmFwcGVyID0gdGhpcy5hbGxGaWx0ZXJzW2NvbERlZldyYXBwZXIuY29sS2V5XTtcclxuICAgIHZhciBjb2xEZWYgPSBjb2xEZWZXcmFwcGVyLmNvbERlZjtcclxuXHJcbiAgICBpZiAoIWZpbHRlcldyYXBwZXIpIHtcclxuICAgICAgICBmaWx0ZXJXcmFwcGVyID0ge1xyXG4gICAgICAgICAgICBjb2xLZXk6IGNvbERlZldyYXBwZXIuY29sS2V5LFxyXG4gICAgICAgICAgICBmaWVsZDogY29sRGVmLmZpZWxkXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgZmlsdGVyQ2hhbmdlZENhbGxiYWNrID0gdGhpcy5ncmlkLm9uRmlsdGVyQ2hhbmdlZC5iaW5kKHRoaXMuZ3JpZCk7XHJcbiAgICAgICAgdmFyIGZpbHRlclBhcmFtcyA9IGNvbERlZi5maWx0ZXJQYXJhbXM7XHJcbiAgICAgICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgICAgIHJvd01vZGVsOiB0aGlzLnJvd01vZGVsLFxyXG4gICAgICAgICAgICBmaWx0ZXJDaGFuZ2VkQ2FsbGJhY2s6IGZpbHRlckNoYW5nZWRDYWxsYmFjayxcclxuICAgICAgICAgICAgZmlsdGVyUGFyYW1zOiBmaWx0ZXJQYXJhbXMsXHJcbiAgICAgICAgICAgIHNjb3BlOiBmaWx0ZXJXcmFwcGVyLnNjb3BlXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbERlZi5maWx0ZXIgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgLy8gaWYgdXNlciBwcm92aWRlZCBhIGZpbHRlciwganVzdCB1c2UgaXRcclxuICAgICAgICAgICAgLy8gZmlyc3QgdXAsIGNyZWF0ZSBjaGlsZCBzY29wZSBpZiBuZWVkZWRcclxuICAgICAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzQW5ndWxhckNvbXBpbGVGaWx0ZXJzKCkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzY29wZSA9IHRoaXMuJHNjb3BlLiRuZXcoKTtcclxuICAgICAgICAgICAgICAgIGZpbHRlcldyYXBwZXIuc2NvcGUgPSBzY29wZTtcclxuICAgICAgICAgICAgICAgIHBhcmFtcy4kc2NvcGUgPSBzY29wZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBub3cgY3JlYXRlIGZpbHRlclxyXG4gICAgICAgICAgICBmaWx0ZXJXcmFwcGVyLmZpbHRlciA9IG5ldyBjb2xEZWYuZmlsdGVyKHBhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2xEZWYuZmlsdGVyID09PSAndGV4dCcpIHtcclxuICAgICAgICAgICAgZmlsdGVyV3JhcHBlci5maWx0ZXIgPSBuZXcgU3RyaW5nRmlsdGVyKHBhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2xEZWYuZmlsdGVyID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICBmaWx0ZXJXcmFwcGVyLmZpbHRlciA9IG5ldyBOdW1iZXJGaWx0ZXIocGFyYW1zKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaWx0ZXJXcmFwcGVyLmZpbHRlciA9IG5ldyBTZXRGaWx0ZXIocGFyYW1zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hbGxGaWx0ZXJzW2NvbERlZldyYXBwZXIuY29sS2V5XSA9IGZpbHRlcldyYXBwZXI7XHJcblxyXG4gICAgICAgIGlmICghZmlsdGVyV3JhcHBlci5maWx0ZXIuZ2V0R3VpKSB7IC8vIGJlY2F1c2UgdXNlcnMgY2FuIGRvIGN1c3RvbSBmaWx0ZXJzLCBnaXZlIG5pY2UgZXJyb3IgbWVzc2FnZVxyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGaWx0ZXIgaXMgbWlzc2luZyBtZXRob2QgZ2V0R3VpJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZUZpbHRlckd1aSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGVGaWx0ZXJHdWkuY2xhc3NOYW1lID0gJ2FnLWZpbHRlcic7XHJcbiAgICAgICAgdmFyIGd1aUZyb21GaWx0ZXIgPSBmaWx0ZXJXcmFwcGVyLmZpbHRlci5nZXRHdWkoKTtcclxuICAgICAgICBpZiAodXRpbHMuaXNOb2RlT3JFbGVtZW50KGd1aUZyb21GaWx0ZXIpKSB7XHJcbiAgICAgICAgICAgIC8vYSBkb20gbm9kZSBvciBlbGVtZW50IHdhcyByZXR1cm5lZCwgc28gYWRkIGNoaWxkXHJcbiAgICAgICAgICAgIGVGaWx0ZXJHdWkuYXBwZW5kQ2hpbGQoZ3VpRnJvbUZpbHRlcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy9vdGhlcndpc2UgYXNzdW1lIGl0IHdhcyBodG1sLCBzbyBqdXN0IGluc2VydFxyXG4gICAgICAgICAgICB2YXIgZVRleHRTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgICAgICBlVGV4dFNwYW4uaW5uZXJIVE1MID0gZ3VpRnJvbUZpbHRlcjtcclxuICAgICAgICAgICAgZUZpbHRlckd1aS5hcHBlbmRDaGlsZChlVGV4dFNwYW4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGZpbHRlcldyYXBwZXIuc2NvcGUpIHtcclxuICAgICAgICAgICAgZmlsdGVyV3JhcHBlci5ndWkgPSB0aGlzLiRjb21waWxlKGVGaWx0ZXJHdWkpKGZpbHRlcldyYXBwZXIuc2NvcGUpWzBdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZpbHRlcldyYXBwZXIuZ3VpID0gZUZpbHRlckd1aTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHZhciBlUG9wdXBQYXJlbnQgPSB0aGlzLmdyaWQuZ2V0UG9wdXBQYXJlbnQoKTtcclxuICAgIHRoaXMucG9zaXRpb25Qb3B1cChldmVudFNvdXJjZSwgZmlsdGVyV3JhcHBlci5ndWksIGVQb3B1cFBhcmVudCk7XHJcblxyXG4gICAgdXRpbHMuYWRkQXNNb2RhbFBvcHVwKGVQb3B1cFBhcmVudCwgZmlsdGVyV3JhcHBlci5ndWkpO1xyXG5cclxuICAgIGlmIChmaWx0ZXJXcmFwcGVyLmZpbHRlci5hZnRlckd1aUF0dGFjaGVkKSB7XHJcbiAgICAgICAgZmlsdGVyV3JhcHBlci5maWx0ZXIuYWZ0ZXJHdWlBdHRhY2hlZCgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGaWx0ZXJNYW5hZ2VyO1xyXG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vbnVtYmVyRmlsdGVyVGVtcGxhdGUuanMnKTtcclxuXHJcbnZhciBFUVVBTFMgPSAxO1xyXG52YXIgTEVTU19USEFOID0gMjtcclxudmFyIEdSRUFURVJfVEhBTiA9IDM7XHJcblxyXG5mdW5jdGlvbiBOdW1iZXJGaWx0ZXIocGFyYW1zKSB7XHJcbiAgICB0aGlzLmZpbHRlckNoYW5nZWRDYWxsYmFjayA9IHBhcmFtcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2s7XHJcbiAgICB0aGlzLmNyZWF0ZUd1aSgpO1xyXG4gICAgdGhpcy5maWx0ZXJOdW1iZXIgPSBudWxsO1xyXG4gICAgdGhpcy5maWx0ZXJUeXBlID0gRVFVQUxTO1xyXG59XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5hZnRlckd1aUF0dGFjaGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVGaWx0ZXJUZXh0RmllbGQuZm9jdXMoKTtcclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5OdW1iZXJGaWx0ZXIucHJvdG90eXBlLmRvZXNGaWx0ZXJQYXNzID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKHRoaXMuZmlsdGVyTnVtYmVyID09PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICB2YXIgdmFsdWUgPSBub2RlLnZhbHVlO1xyXG5cclxuICAgIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHZhbHVlQXNOdW1iZXI7XHJcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgIHZhbHVlQXNOdW1iZXIgPSB2YWx1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFsdWVBc051bWJlciA9IHBhcnNlRmxvYXQodmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHN3aXRjaCAodGhpcy5maWx0ZXJUeXBlKSB7XHJcbiAgICAgICAgY2FzZSBFUVVBTFM6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZUFzTnVtYmVyID09PSB0aGlzLmZpbHRlck51bWJlcjtcclxuICAgICAgICBjYXNlIExFU1NfVEhBTjpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlQXNOdW1iZXIgPD0gdGhpcy5maWx0ZXJOdW1iZXI7XHJcbiAgICAgICAgY2FzZSBHUkVBVEVSX1RIQU46XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZUFzTnVtYmVyID49IHRoaXMuZmlsdGVyTnVtYmVyO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8vIHNob3VsZCBuZXZlciBoYXBwZW5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2ludmFsaWQgZmlsdGVyIHR5cGUgJyArIHRoaXMuZmlsdGVyVHlwZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5OdW1iZXJGaWx0ZXIucHJvdG90eXBlLmdldEd1aSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZUd1aTtcclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5OdW1iZXJGaWx0ZXIucHJvdG90eXBlLmlzRmlsdGVyQWN0aXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJOdW1iZXIgIT09IG51bGw7XHJcbn07XHJcblxyXG5OdW1iZXJGaWx0ZXIucHJvdG90eXBlLmNyZWF0ZUd1aSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lR3VpID0gdXRpbHMubG9hZFRlbXBsYXRlKHRlbXBsYXRlKTtcclxuICAgIHRoaXMuZUZpbHRlclRleHRGaWVsZCA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKFwiI2ZpbHRlclRleHRcIik7XHJcbiAgICB0aGlzLmVUeXBlU2VsZWN0ID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIjZmlsdGVyVHlwZVwiKTtcclxuXHJcbiAgICB1dGlscy5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLmVGaWx0ZXJUZXh0RmllbGQsIHRoaXMub25GaWx0ZXJDaGFuZ2VkLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5lVHlwZVNlbGVjdC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIHRoaXMub25UeXBlQ2hhbmdlZC5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbk51bWJlckZpbHRlci5wcm90b3R5cGUub25UeXBlQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5maWx0ZXJUeXBlID0gcGFyc2VJbnQodGhpcy5lVHlwZVNlbGVjdC52YWx1ZSk7XHJcbiAgICB0aGlzLmZpbHRlckNoYW5nZWRDYWxsYmFjaygpO1xyXG59O1xyXG5cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5vbkZpbHRlckNoYW5nZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBmaWx0ZXJUZXh0ID0gdXRpbHMubWFrZU51bGwodGhpcy5lRmlsdGVyVGV4dEZpZWxkLnZhbHVlKTtcclxuICAgIGlmIChmaWx0ZXJUZXh0ICYmIGZpbHRlclRleHQudHJpbSgpID09PSAnJykge1xyXG4gICAgICAgIGZpbHRlclRleHQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKGZpbHRlclRleHQpIHtcclxuICAgICAgICB0aGlzLmZpbHRlck51bWJlciA9IHBhcnNlRmxvYXQoZmlsdGVyVGV4dCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZmlsdGVyTnVtYmVyID0gbnVsbDtcclxuICAgIH1cclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE51bWJlckZpbHRlcjtcclxuIiwidmFyIHRlbXBsYXRlID0gW1xyXG4gICAgJzxkaXY+JyxcclxuICAgICc8ZGl2PicsXHJcbiAgICAnPHNlbGVjdCBjbGFzcz1cImFnLWZpbHRlci1zZWxlY3RcIiBpZD1cImZpbHRlclR5cGVcIj4nLFxyXG4gICAgJzxvcHRpb24gdmFsdWU9XCIxXCI+RXF1YWxzPC9vcHRpb24+JyxcclxuICAgICc8b3B0aW9uIHZhbHVlPVwiMlwiPkxlc3MgdGhhbjwvb3B0aW9uPicsXHJcbiAgICAnPG9wdGlvbiB2YWx1ZT1cIjNcIj5HcmVhdGVyIHRoYW48L29wdGlvbj4nLFxyXG4gICAgJzwvc2VsZWN0PicsXHJcbiAgICAnPC9kaXY+JyxcclxuICAgICc8ZGl2PicsXHJcbiAgICAnPGlucHV0IGNsYXNzPVwiYWctZmlsdGVyLWZpbHRlclwiIGlkPVwiZmlsdGVyVGV4dFwiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJmaWx0ZXIuLi5cIi8+JyxcclxuICAgICc8L2Rpdj4nLFxyXG4gICAgJzwvZGl2PicsXHJcbl0uam9pbignJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xyXG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XHJcbnZhciBTZXRGaWx0ZXJNb2RlbCA9IHJlcXVpcmUoJy4vc2V0RmlsdGVyTW9kZWwnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9zZXRGaWx0ZXJUZW1wbGF0ZScpO1xyXG5cclxudmFyIERFRkFVTFRfUk9XX0hFSUdIVCA9IDIwO1xyXG5cclxuZnVuY3Rpb24gU2V0RmlsdGVyKHBhcmFtcykge1xyXG4gICAgdmFyIGZpbHRlclBhcmFtcyA9IHBhcmFtcy5maWx0ZXJQYXJhbXM7XHJcbiAgICB0aGlzLnJvd0hlaWdodCA9IChmaWx0ZXJQYXJhbXMgJiYgZmlsdGVyUGFyYW1zLmNlbGxIZWlnaHQpID8gZmlsdGVyUGFyYW1zLmNlbGxIZWlnaHQgOiBERUZBVUxUX1JPV19IRUlHSFQ7XHJcbiAgICB0aGlzLm1vZGVsID0gbmV3IFNldEZpbHRlck1vZGVsKHBhcmFtcy5jb2xEZWYsIHBhcmFtcy5yb3dNb2RlbCk7XHJcbiAgICB0aGlzLmZpbHRlckNoYW5nZWRDYWxsYmFjayA9IHBhcmFtcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2s7XHJcbiAgICB0aGlzLnJvd3NJbkJvZHlDb250YWluZXIgPSB7fTtcclxuICAgIHRoaXMuY29sRGVmID0gcGFyYW1zLmNvbERlZjtcclxuICAgIGlmIChmaWx0ZXJQYXJhbXMpIHtcclxuICAgICAgICB0aGlzLmNlbGxSZW5kZXJlciA9IGZpbHRlclBhcmFtcy5jZWxsUmVuZGVyZXI7XHJcbiAgICB9XHJcbiAgICB0aGlzLmNyZWF0ZUd1aSgpO1xyXG4gICAgdGhpcy5hZGRTY3JvbGxMaXN0ZW5lcigpO1xyXG59XHJcblxyXG4vLyB3ZSBuZWVkIHRvIGhhdmUgdGhlIGd1aSBhdHRhY2hlZCBiZWZvcmUgd2UgY2FuIGRyYXcgdGhlIHZpcnR1YWwgcm93cywgYXMgdGhlXHJcbi8vIHZpcnR1YWwgcm93IGxvZ2ljIG5lZWRzIGluZm8gYWJvdXQgdGhlIGd1aSBzdGF0ZVxyXG4vKiBwdWJsaWMgKi9cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5hZnRlckd1aUF0dGFjaGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmRyYXdWaXJ0dWFsUm93cygpO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcblNldEZpbHRlci5wcm90b3R5cGUuaXNGaWx0ZXJBY3RpdmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLm1vZGVsLmlzRmlsdGVyQWN0aXZlKCk7XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5kb2VzRmlsdGVyUGFzcyA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIHZhciB2YWx1ZSA9IG5vZGUudmFsdWU7XHJcbiAgICB2YXIgbW9kZWwgPSBub2RlLm1vZGVsO1xyXG4gICAgLy9pZiBubyBmaWx0ZXIsIGFsd2F5cyBwYXNzXHJcbiAgICBpZiAobW9kZWwuaXNFdmVyeXRoaW5nU2VsZWN0ZWQoKSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgLy9pZiBub3RoaW5nIHNlbGVjdGVkIGluIGZpbHRlciwgYWx3YXlzIGZhaWxcclxuICAgIGlmIChtb2RlbC5pc05vdGhpbmdTZWxlY3RlZCgpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhbHVlID0gdXRpbHMubWFrZU51bGwodmFsdWUpO1xyXG4gICAgdmFyIGZpbHRlclBhc3NlZCA9IG1vZGVsLnNlbGVjdGVkVmFsdWVzTWFwW3ZhbHVlXSAhPT0gdW5kZWZpbmVkO1xyXG4gICAgcmV0dXJuIGZpbHRlclBhc3NlZDtcclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmdldEd1aSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZUd1aTtcclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5TZXRGaWx0ZXIucHJvdG90eXBlLm9uTmV3Um93c0xvYWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5tb2RlbC5zZWxlY3RFdmVyeXRoaW5nKCk7XHJcbiAgICB0aGlzLnVwZGF0ZUFsbENoZWNrYm94ZXModHJ1ZSk7XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5nZXRNb2RlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubW9kZWw7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmNyZWF0ZUd1aSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICB0aGlzLmVHdWkgPSB1dGlscy5sb2FkVGVtcGxhdGUodGVtcGxhdGUpO1xyXG5cclxuICAgIHRoaXMuZUxpc3RDb250YWluZXIgPSB0aGlzLmVHdWkucXVlcnlTZWxlY3RvcihcIi5hZy1maWx0ZXItbGlzdC1jb250YWluZXJcIik7XHJcbiAgICB0aGlzLmVGaWx0ZXJWYWx1ZVRlbXBsYXRlID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIjaXRlbUZvclJlcGVhdFwiKTtcclxuICAgIHRoaXMuZVNlbGVjdEFsbCA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKFwiI3NlbGVjdEFsbFwiKTtcclxuICAgIHRoaXMuZUxpc3RWaWV3cG9ydCA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKFwiLmFnLWZpbHRlci1saXN0LXZpZXdwb3J0XCIpO1xyXG4gICAgdGhpcy5lTWluaUZpbHRlciA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKFwiLmFnLWZpbHRlci1maWx0ZXJcIik7XHJcbiAgICB0aGlzLmVMaXN0Q29udGFpbmVyLnN0eWxlLmhlaWdodCA9ICh0aGlzLm1vZGVsLmdldFVuaXF1ZVZhbHVlQ291bnQoKSAqIHRoaXMucm93SGVpZ2h0KSArIFwicHhcIjtcclxuXHJcbiAgICB0aGlzLnNldENvbnRhaW5lckhlaWdodCgpO1xyXG4gICAgdGhpcy5lTWluaUZpbHRlci52YWx1ZSA9IHRoaXMubW9kZWwuZ2V0TWluaUZpbHRlcigpO1xyXG4gICAgdXRpbHMuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5lTWluaUZpbHRlciwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgX3RoaXMub25GaWx0ZXJDaGFuZ2VkKCk7XHJcbiAgICB9KTtcclxuICAgIHV0aWxzLnJlbW92ZUFsbENoaWxkcmVuKHRoaXMuZUxpc3RDb250YWluZXIpO1xyXG5cclxuICAgIHRoaXMuZVNlbGVjdEFsbC5vbmNsaWNrID0gdGhpcy5vblNlbGVjdEFsbC5iaW5kKHRoaXMpO1xyXG5cclxuICAgIGlmICh0aGlzLm1vZGVsLmlzRXZlcnl0aGluZ1NlbGVjdGVkKCkpIHtcclxuICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZVNlbGVjdEFsbC5jaGVja2VkID0gdHJ1ZTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5tb2RlbC5pc05vdGhpbmdTZWxlY3RlZCgpKSB7XHJcbiAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmVTZWxlY3RBbGwuY2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IHRydWU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLnNldENvbnRhaW5lckhlaWdodCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lTGlzdENvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSAodGhpcy5tb2RlbC5nZXREaXNwbGF5ZWRWYWx1ZUNvdW50KCkgKiB0aGlzLnJvd0hlaWdodCkgKyBcInB4XCI7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmRyYXdWaXJ0dWFsUm93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRvcFBpeGVsID0gdGhpcy5lTGlzdFZpZXdwb3J0LnNjcm9sbFRvcDtcclxuICAgIHZhciBib3R0b21QaXhlbCA9IHRvcFBpeGVsICsgdGhpcy5lTGlzdFZpZXdwb3J0Lm9mZnNldEhlaWdodDtcclxuXHJcbiAgICB2YXIgZmlyc3RSb3cgPSBNYXRoLmZsb29yKHRvcFBpeGVsIC8gdGhpcy5yb3dIZWlnaHQpO1xyXG4gICAgdmFyIGxhc3RSb3cgPSBNYXRoLmZsb29yKGJvdHRvbVBpeGVsIC8gdGhpcy5yb3dIZWlnaHQpO1xyXG5cclxuICAgIHRoaXMuZW5zdXJlUm93c1JlbmRlcmVkKGZpcnN0Um93LCBsYXN0Um93KTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUuZW5zdXJlUm93c1JlbmRlcmVkID0gZnVuY3Rpb24oc3RhcnQsIGZpbmlzaCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICAvL2F0IHRoZSBlbmQsIHRoaXMgYXJyYXkgd2lsbCBjb250YWluIHRoZSBpdGVtcyB3ZSBuZWVkIHRvIHJlbW92ZVxyXG4gICAgdmFyIHJvd3NUb1JlbW92ZSA9IE9iamVjdC5rZXlzKHRoaXMucm93c0luQm9keUNvbnRhaW5lcik7XHJcblxyXG4gICAgLy9hZGQgaW4gbmV3IHJvd3NcclxuICAgIGZvciAodmFyIHJvd0luZGV4ID0gc3RhcnQ7IHJvd0luZGV4IDw9IGZpbmlzaDsgcm93SW5kZXgrKykge1xyXG4gICAgICAgIC8vc2VlIGlmIGl0ZW0gYWxyZWFkeSB0aGVyZSwgYW5kIGlmIHllcywgdGFrZSBpdCBvdXQgb2YgdGhlICd0byByZW1vdmUnIGFycmF5XHJcbiAgICAgICAgaWYgKHJvd3NUb1JlbW92ZS5pbmRleE9mKHJvd0luZGV4LnRvU3RyaW5nKCkpID49IDApIHtcclxuICAgICAgICAgICAgcm93c1RvUmVtb3ZlLnNwbGljZShyb3dzVG9SZW1vdmUuaW5kZXhPZihyb3dJbmRleC50b1N0cmluZygpKSwgMSk7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL2NoZWNrIHRoaXMgcm93IGFjdHVhbGx5IGV4aXN0cyAoaW4gY2FzZSBvdmVyZmxvdyBidWZmZXIgd2luZG93IGV4Y2VlZHMgcmVhbCBkYXRhKVxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmdldERpc3BsYXllZFZhbHVlQ291bnQoKSA+IHJvd0luZGV4KSB7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMubW9kZWwuZ2V0RGlzcGxheWVkVmFsdWUocm93SW5kZXgpO1xyXG4gICAgICAgICAgICBfdGhpcy5pbnNlcnRSb3codmFsdWUsIHJvd0luZGV4KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy9hdCB0aGlzIHBvaW50LCBldmVyeXRoaW5nIGluIG91ciAncm93c1RvUmVtb3ZlJyAuIC4gLlxyXG4gICAgdGhpcy5yZW1vdmVWaXJ0dWFsUm93cyhyb3dzVG9SZW1vdmUpO1xyXG59O1xyXG5cclxuLy90YWtlcyBhcnJheSBvZiByb3cgaWQnc1xyXG5TZXRGaWx0ZXIucHJvdG90eXBlLnJlbW92ZVZpcnR1YWxSb3dzID0gZnVuY3Rpb24ocm93c1RvUmVtb3ZlKSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgcm93c1RvUmVtb3ZlLmZvckVhY2goZnVuY3Rpb24oaW5kZXhUb1JlbW92ZSkge1xyXG4gICAgICAgIHZhciBlUm93VG9SZW1vdmUgPSBfdGhpcy5yb3dzSW5Cb2R5Q29udGFpbmVyW2luZGV4VG9SZW1vdmVdO1xyXG4gICAgICAgIF90aGlzLmVMaXN0Q29udGFpbmVyLnJlbW92ZUNoaWxkKGVSb3dUb1JlbW92ZSk7XHJcbiAgICAgICAgZGVsZXRlIF90aGlzLnJvd3NJbkJvZHlDb250YWluZXJbaW5kZXhUb1JlbW92ZV07XHJcbiAgICB9KTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUuaW5zZXJ0Um93ID0gZnVuY3Rpb24odmFsdWUsIHJvd0luZGV4KSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIHZhciBlRmlsdGVyVmFsdWUgPSB0aGlzLmVGaWx0ZXJWYWx1ZVRlbXBsYXRlLmNsb25lTm9kZSh0cnVlKTtcclxuXHJcbiAgICB2YXIgdmFsdWVFbGVtZW50ID0gZUZpbHRlclZhbHVlLnF1ZXJ5U2VsZWN0b3IoXCIuYWctZmlsdGVyLXZhbHVlXCIpO1xyXG4gICAgaWYgKHRoaXMuY2VsbFJlbmRlcmVyKSB7XHJcbiAgICAgICAgLy9yZW5kZXJlciBwcm92aWRlZCwgc28gdXNlIGl0XHJcbiAgICAgICAgdmFyIHJlc3VsdEZyb21SZW5kZXJlciA9IHRoaXMuY2VsbFJlbmRlcmVyKHtcclxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh1dGlscy5pc05vZGUocmVzdWx0RnJvbVJlbmRlcmVyKSkge1xyXG4gICAgICAgICAgICAvL2EgZG9tIG5vZGUgb3IgZWxlbWVudCB3YXMgcmV0dXJuZWQsIHNvIGFkZCBjaGlsZFxyXG4gICAgICAgICAgICB2YWx1ZUVsZW1lbnQuYXBwZW5kQ2hpbGQocmVzdWx0RnJvbVJlbmRlcmVyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvL290aGVyd2lzZSBhc3N1bWUgaXQgd2FzIGh0bWwsIHNvIGp1c3QgaW5zZXJ0XHJcbiAgICAgICAgICAgIHZhbHVlRWxlbWVudC5pbm5lckhUTUwgPSByZXN1bHRGcm9tUmVuZGVyZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy9vdGhlcndpc2UgZGlzcGxheSBhcyBhIHN0cmluZ1xyXG4gICAgICAgIHZhciBkaXNwbGF5TmFtZU9mVmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCA/IFwiKEJsYW5rcylcIiA6IHZhbHVlO1xyXG4gICAgICAgIHZhbHVlRWxlbWVudC5pbm5lckhUTUwgPSBkaXNwbGF5TmFtZU9mVmFsdWU7XHJcbiAgICB9XHJcbiAgICB2YXIgZUNoZWNrYm94ID0gZUZpbHRlclZhbHVlLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFwiKTtcclxuICAgIGVDaGVja2JveC5jaGVja2VkID0gdGhpcy5tb2RlbC5pc1ZhbHVlU2VsZWN0ZWQodmFsdWUpO1xyXG5cclxuICAgIGVDaGVja2JveC5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgX3RoaXMub25DaGVja2JveENsaWNrZWQoZUNoZWNrYm94LCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZUZpbHRlclZhbHVlLnN0eWxlLnRvcCA9ICh0aGlzLnJvd0hlaWdodCAqIHJvd0luZGV4KSArIFwicHhcIjtcclxuXHJcbiAgICB0aGlzLmVMaXN0Q29udGFpbmVyLmFwcGVuZENoaWxkKGVGaWx0ZXJWYWx1ZSk7XHJcbiAgICB0aGlzLnJvd3NJbkJvZHlDb250YWluZXJbcm93SW5kZXhdID0gZUZpbHRlclZhbHVlO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5vbkNoZWNrYm94Q2xpY2tlZCA9IGZ1bmN0aW9uKGVDaGVja2JveCwgdmFsdWUpIHtcclxuICAgIHZhciBjaGVja2VkID0gZUNoZWNrYm94LmNoZWNrZWQ7XHJcbiAgICBpZiAoY2hlY2tlZCkge1xyXG4gICAgICAgIHRoaXMubW9kZWwuc2VsZWN0VmFsdWUodmFsdWUpO1xyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmlzRXZlcnl0aGluZ1NlbGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmNoZWNrZWQgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZVNlbGVjdEFsbC5pbmRldGVybWluYXRlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubW9kZWwudW5zZWxlY3RWYWx1ZSh2YWx1ZSk7XHJcbiAgICAgICAgLy9pZiBzZXQgaXMgZW1wdHksIG5vdGhpbmcgaXMgc2VsZWN0ZWRcclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5pc05vdGhpbmdTZWxlY3RlZCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZVNlbGVjdEFsbC5pbmRldGVybWluYXRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZVNlbGVjdEFsbC5jaGVja2VkID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmluZGV0ZXJtaW5hdGUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmZpbHRlckNoYW5nZWRDYWxsYmFjaygpO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5vbkZpbHRlckNoYW5nZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtaW5pRmlsdGVyQ2hhbmdlZCA9IHRoaXMubW9kZWwuc2V0TWluaUZpbHRlcih0aGlzLmVNaW5pRmlsdGVyLnZhbHVlKTtcclxuICAgIGlmIChtaW5pRmlsdGVyQ2hhbmdlZCkge1xyXG4gICAgICAgIHRoaXMuc2V0Q29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgICAgdGhpcy5jbGVhclZpcnR1YWxSb3dzKCk7XHJcbiAgICAgICAgdGhpcy5kcmF3VmlydHVhbFJvd3MoKTtcclxuICAgIH1cclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUuY2xlYXJWaXJ0dWFsUm93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHJvd3NUb1JlbW92ZSA9IE9iamVjdC5rZXlzKHRoaXMucm93c0luQm9keUNvbnRhaW5lcik7XHJcbiAgICB0aGlzLnJlbW92ZVZpcnR1YWxSb3dzKHJvd3NUb1JlbW92ZSk7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLm9uU2VsZWN0QWxsID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY2hlY2tlZCA9IHRoaXMuZVNlbGVjdEFsbC5jaGVja2VkO1xyXG4gICAgaWYgKGNoZWNrZWQpIHtcclxuICAgICAgICB0aGlzLm1vZGVsLnNlbGVjdEV2ZXJ5dGhpbmcoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZWxlY3ROb3RoaW5nKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnVwZGF0ZUFsbENoZWNrYm94ZXMoY2hlY2tlZCk7XHJcbiAgICB0aGlzLmZpbHRlckNoYW5nZWRDYWxsYmFjaygpO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS51cGRhdGVBbGxDaGVja2JveGVzID0gZnVuY3Rpb24oY2hlY2tlZCkge1xyXG4gICAgdmFyIGN1cnJlbnRseURpc3BsYXllZENoZWNrYm94ZXMgPSB0aGlzLmVMaXN0Q29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZmlsdGVyLWNoZWNrYm94PXRydWVdXCIpO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjdXJyZW50bHlEaXNwbGF5ZWRDaGVja2JveGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGN1cnJlbnRseURpc3BsYXllZENoZWNrYm94ZXNbaV0uY2hlY2tlZCA9IGNoZWNrZWQ7XHJcbiAgICB9XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmFkZFNjcm9sbExpc3RlbmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIHRoaXMuZUxpc3RWaWV3cG9ydC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF90aGlzLmRyYXdWaXJ0dWFsUm93cygpO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNldEZpbHRlcjtcclxuIiwiICAgIHZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcblxyXG4gICAgZnVuY3Rpb24gU2V0RmlsdGVyTW9kZWwoY29sRGVmLCByb3dNb2RlbCkge1xyXG5cclxuICAgICAgICBpZiAoY29sRGVmLmZpbHRlclBhcmFtcyAmJiBjb2xEZWYuZmlsdGVyUGFyYW1zLnZhbHVlcykge1xyXG4gICAgICAgICAgICB0aGlzLnVuaXF1ZVZhbHVlcyA9IGNvbERlZi5maWx0ZXJQYXJhbXMudmFsdWVzO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVW5pcXVlVmFsdWVzKHJvd01vZGVsLCBjb2xEZWYuZmllbGQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvbERlZi5jb21wYXJhdG9yKSB7XHJcbiAgICAgICAgICAgIHRoaXMudW5pcXVlVmFsdWVzLnNvcnQoY29sRGVmLmNvbXBhcmF0b3IpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudW5pcXVlVmFsdWVzLnNvcnQodXRpbHMuZGVmYXVsdENvbXBhcmF0b3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5kaXNwbGF5ZWRWYWx1ZXMgPSB0aGlzLnVuaXF1ZVZhbHVlcztcclxuICAgICAgICB0aGlzLm1pbmlGaWx0ZXIgPSBudWxsO1xyXG4gICAgICAgIC8vd2UgdXNlIGEgbWFwIHJhdGhlciB0aGFuIGFuIGFycmF5IGZvciB0aGUgc2VsZWN0ZWQgdmFsdWVzIGFzIHRoZSBsb29rdXBcclxuICAgICAgICAvL2ZvciBhIG1hcCBpcyBtdWNoIGZhc3RlciB0aGFuIHRoZSBsb29rdXAgZm9yIGFuIGFycmF5LCBlc3BlY2lhbGx5IHdoZW5cclxuICAgICAgICAvL3RoZSBsZW5ndGggb2YgdGhlIGFycmF5IGlzIHRob3VzYW5kcyBvZiByZWNvcmRzIGxvbmdcclxuICAgICAgICB0aGlzLnNlbGVjdGVkVmFsdWVzTWFwID0ge307XHJcbiAgICAgICAgdGhpcy5zZWxlY3RFdmVyeXRoaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmNyZWF0ZVVuaXF1ZVZhbHVlcyA9IGZ1bmN0aW9uKHJvd01vZGVsLCBrZXkpIHtcclxuICAgICAgICB2YXIgdW5pcXVlQ2hlY2sgPSB7fTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlY3Vyc2l2ZWx5UHJvY2Vzcyhub2Rlcykge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuZ3JvdXAgJiYgIW5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZ3JvdXAgbm9kZSwgc28gZGlnIGRlZXBlclxyXG4gICAgICAgICAgICAgICAgICAgIHJlY3Vyc2l2ZWx5UHJvY2Vzcyhub2RlLmNoaWxkcmVuKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBub2RlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gZGF0YSA/IGRhdGFba2V5XSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSBcIlwiIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXVuaXF1ZUNoZWNrLmhhc093blByb3BlcnR5KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaXF1ZUNoZWNrW3ZhbHVlXSA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgdG9wTGV2ZWxOb2RlcyA9IHJvd01vZGVsLmdldFRvcExldmVsTm9kZXMoKTtcclxuICAgICAgICByZWN1cnNpdmVseVByb2Nlc3ModG9wTGV2ZWxOb2Rlcyk7XHJcblxyXG4gICAgICAgIHRoaXMudW5pcXVlVmFsdWVzID0gcmVzdWx0O1xyXG4gICAgfTtcclxuXHJcbiAgICAvL3NldHMgbWluaSBmaWx0ZXIuIHJldHVybnMgdHJ1ZSBpZiBpdCBjaGFuZ2VkIGZyb20gbGFzdCB2YWx1ZSwgb3RoZXJ3aXNlIGZhbHNlXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuc2V0TWluaUZpbHRlciA9IGZ1bmN0aW9uKG5ld01pbmlGaWx0ZXIpIHtcclxuICAgICAgICBuZXdNaW5pRmlsdGVyID0gdXRpbHMubWFrZU51bGwobmV3TWluaUZpbHRlcik7XHJcbiAgICAgICAgaWYgKHRoaXMubWluaUZpbHRlciA9PT0gbmV3TWluaUZpbHRlcikge1xyXG4gICAgICAgICAgICAvL2RvIG5vdGhpbmcgaWYgZmlsdGVyIGhhcyBub3QgY2hhbmdlZFxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubWluaUZpbHRlciA9IG5ld01pbmlGaWx0ZXI7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJEaXNwbGF5ZWRWYWx1ZXMoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmdldE1pbmlGaWx0ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5taW5pRmlsdGVyO1xyXG4gICAgfTtcclxuXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuZmlsdGVyRGlzcGxheWVkVmFsdWVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gaWYgbm8gZmlsdGVyLCBqdXN0IHVzZSB0aGUgdW5pcXVlIHZhbHVlc1xyXG4gICAgICAgIGlmICh0aGlzLm1pbmlGaWx0ZXIgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5ZWRWYWx1ZXMgPSB0aGlzLnVuaXF1ZVZhbHVlcztcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaWYgZmlsdGVyIHByZXNlbnQsIHdlIGZpbHRlciBkb3duIHRoZSBsaXN0XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5ZWRWYWx1ZXMgPSBbXTtcclxuICAgICAgICB2YXIgbWluaUZpbHRlclVwcGVyQ2FzZSA9IHRoaXMubWluaUZpbHRlci50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy51bmlxdWVWYWx1ZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB1bmlxdWVWYWx1ZSA9IHRoaXMudW5pcXVlVmFsdWVzW2ldO1xyXG4gICAgICAgICAgICBpZiAodW5pcXVlVmFsdWUgIT09IG51bGwgJiYgdW5pcXVlVmFsdWUudG9TdHJpbmcoKS50b1VwcGVyQ2FzZSgpLmluZGV4T2YobWluaUZpbHRlclVwcGVyQ2FzZSkgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5ZWRWYWx1ZXMucHVzaCh1bmlxdWVWYWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuZ2V0RGlzcGxheWVkVmFsdWVDb3VudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRpc3BsYXllZFZhbHVlcy5sZW5ndGg7XHJcbiAgICB9O1xyXG5cclxuICAgIFNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5nZXREaXNwbGF5ZWRWYWx1ZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlzcGxheWVkVmFsdWVzW2luZGV4XTtcclxuICAgIH07XHJcblxyXG4gICAgU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLnNlbGVjdEV2ZXJ5dGhpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgY291bnQgPSB0aGlzLnVuaXF1ZVZhbHVlcy5sZW5ndGg7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMudW5pcXVlVmFsdWVzW2ldO1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkVmFsdWVzTWFwW3ZhbHVlXSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRWYWx1ZXNDb3VudCA9IGNvdW50O1xyXG4gICAgfTtcclxuXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuaXNGaWx0ZXJBY3RpdmUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51bmlxdWVWYWx1ZXMubGVuZ3RoICE9PSB0aGlzLnNlbGVjdGVkVmFsdWVzQ291bnQ7XHJcbiAgICB9O1xyXG5cclxuICAgIFNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5zZWxlY3ROb3RoaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZFZhbHVlc01hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRWYWx1ZXNDb3VudCA9IDA7XHJcbiAgICB9O1xyXG5cclxuICAgIFNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5nZXRVbmlxdWVWYWx1ZUNvdW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudW5pcXVlVmFsdWVzLmxlbmd0aDtcclxuICAgIH07XHJcblxyXG4gICAgU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLnVuc2VsZWN0VmFsdWUgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkVmFsdWVzTWFwW3ZhbHVlXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnNlbGVjdGVkVmFsdWVzTWFwW3ZhbHVlXTtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFZhbHVlc0NvdW50LS07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuc2VsZWN0VmFsdWUgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkVmFsdWVzTWFwW3ZhbHVlXSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRWYWx1ZXNNYXBbdmFsdWVdID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFZhbHVlc0NvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuaXNWYWx1ZVNlbGVjdGVkID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZFZhbHVlc01hcFt2YWx1ZV0gIT09IHVuZGVmaW5lZDtcclxuICAgIH07XHJcblxyXG4gICAgU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmlzRXZlcnl0aGluZ1NlbGVjdGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudW5pcXVlVmFsdWVzLmxlbmd0aCA9PT0gdGhpcy5zZWxlY3RlZFZhbHVlc0NvdW50O1xyXG4gICAgfTtcclxuXHJcbiAgICBTZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuaXNOb3RoaW5nU2VsZWN0ZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51bmlxdWVWYWx1ZXMubGVuZ3RoID09PSAwO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNldEZpbHRlck1vZGVsO1xyXG4iLCJ2YXIgdGVtcGxhdGUgPSBbXHJcbiAgICAnPGRpdj4nLFxyXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYWctZmlsdGVyLWhlYWRlci1jb250YWluZXJcIj4nLFxyXG4gICAgJyAgICAgICAgPGlucHV0IGNsYXNzPVwiYWctZmlsdGVyLWZpbHRlclwiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJzZWFyY2guLi5cIi8+JyxcclxuICAgICcgICAgPC9kaXY+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLWZpbHRlci1oZWFkZXItY29udGFpbmVyXCI+JyxcclxuICAgICcgICAgICAgIDxsYWJlbD4nLFxyXG4gICAgJyAgICAgICAgICAgIDxpbnB1dCBpZD1cInNlbGVjdEFsbFwiIHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwiYWctZmlsdGVyLWNoZWNrYm94XCIvPicsXHJcbiAgICAnICAgICAgICAgICAgKFNlbGVjdCBBbGwpJyxcclxuICAgICcgICAgICAgIDwvbGFiZWw+JyxcclxuICAgICcgICAgPC9kaXY+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLWZpbHRlci1saXN0LXZpZXdwb3J0XCI+JyxcclxuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJhZy1maWx0ZXItbGlzdC1jb250YWluZXJcIj4nLFxyXG4gICAgJyAgICAgICAgICAgIDxkaXYgaWQ9XCJpdGVtRm9yUmVwZWF0XCIgY2xhc3M9XCJhZy1maWx0ZXItaXRlbVwiPicsXHJcbiAgICAnICAgICAgICAgICAgICAgIDxsYWJlbD4nLFxyXG4gICAgJyAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwiYWctZmlsdGVyLWNoZWNrYm94XCIgZmlsdGVyLWNoZWNrYm94PVwidHJ1ZVwiLz4nLFxyXG4gICAgJyAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJhZy1maWx0ZXItdmFsdWVcIj48L3NwYW4+JyxcclxuICAgICcgICAgICAgICAgICAgICAgPC9sYWJlbD4nLFxyXG4gICAgJyAgICAgICAgICAgIDwvZGl2PicsXHJcbiAgICAnICAgICAgICA8L2Rpdj4nLFxyXG4gICAgJyAgICA8L2Rpdj4nLFxyXG4gICAgJzwvZGl2PicsXHJcbl0uam9pbignJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xyXG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL3RleHRGaWx0ZXJUZW1wbGF0ZScpO1xyXG5cclxudmFyIENPTlRBSU5TID0gMTtcclxudmFyIEVRVUFMUyA9IDI7XHJcbnZhciBTVEFSVFNfV0lUSCA9IDM7XHJcbnZhciBFTkRTX1dJVEggPSA0O1xyXG5cclxuZnVuY3Rpb24gVGV4dEZpbHRlcihwYXJhbXMpIHtcclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrID0gcGFyYW1zLmZpbHRlckNoYW5nZWRDYWxsYmFjaztcclxuICAgIHRoaXMuY3JlYXRlR3VpKCk7XHJcbiAgICB0aGlzLmZpbHRlclRleHQgPSBudWxsO1xyXG4gICAgdGhpcy5maWx0ZXJUeXBlID0gQ09OVEFJTlM7XHJcbn1cclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5UZXh0RmlsdGVyLnByb3RvdHlwZS5hZnRlckd1aUF0dGFjaGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVGaWx0ZXJUZXh0RmllbGQuZm9jdXMoKTtcclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5UZXh0RmlsdGVyLnByb3RvdHlwZS5kb2VzRmlsdGVyUGFzcyA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIGlmICghdGhpcy5maWx0ZXJUZXh0KSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICB2YXIgdmFsdWUgPSBub2RlLnZhbHVlO1xyXG4gICAgaWYgKCF2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHZhciB2YWx1ZUxvd2VyQ2FzZSA9IHZhbHVlLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKTtcclxuICAgIHN3aXRjaCAodGhpcy5maWx0ZXJUeXBlKSB7XHJcbiAgICAgICAgY2FzZSBDT05UQUlOUzpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlTG93ZXJDYXNlLmluZGV4T2YodGhpcy5maWx0ZXJUZXh0KSA+PSAwO1xyXG4gICAgICAgIGNhc2UgRVFVQUxTOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVMb3dlckNhc2UgPT09IHRoaXMuZmlsdGVyVGV4dDtcclxuICAgICAgICBjYXNlIFNUQVJUU19XSVRIOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVMb3dlckNhc2UuaW5kZXhPZih0aGlzLmZpbHRlclRleHQpID09PSAwO1xyXG4gICAgICAgIGNhc2UgRU5EU19XSVRIOlxyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSB2YWx1ZUxvd2VyQ2FzZS5pbmRleE9mKHRoaXMuZmlsdGVyVGV4dCk7XHJcbiAgICAgICAgICAgIHJldHVybiBpbmRleCA+PSAwICYmIGluZGV4ID09PSAodmFsdWVMb3dlckNhc2UubGVuZ3RoIC0gdGhpcy5maWx0ZXJUZXh0Lmxlbmd0aCk7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLy8gc2hvdWxkIG5ldmVyIGhhcHBlblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnaW52YWxpZCBmaWx0ZXIgdHlwZSAnICsgdGhpcy5maWx0ZXJUeXBlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLmdldEd1aSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZUd1aTtcclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5UZXh0RmlsdGVyLnByb3RvdHlwZS5pc0ZpbHRlckFjdGl2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyVGV4dCAhPT0gbnVsbDtcclxufTtcclxuXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLmNyZWF0ZUd1aSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lR3VpID0gdXRpbHMubG9hZFRlbXBsYXRlKHRlbXBsYXRlKTtcclxuICAgIHRoaXMuZUZpbHRlclRleHRGaWVsZCA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKFwiI2ZpbHRlclRleHRcIik7XHJcbiAgICB0aGlzLmVUeXBlU2VsZWN0ID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIjZmlsdGVyVHlwZVwiKTtcclxuXHJcbiAgICB1dGlscy5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLmVGaWx0ZXJUZXh0RmllbGQsIHRoaXMub25GaWx0ZXJDaGFuZ2VkLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5lVHlwZVNlbGVjdC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIHRoaXMub25UeXBlQ2hhbmdlZC5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLm9uVHlwZUNoYW5nZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZmlsdGVyVHlwZSA9IHBhcnNlSW50KHRoaXMuZVR5cGVTZWxlY3QudmFsdWUpO1xyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2soKTtcclxufTtcclxuXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLm9uRmlsdGVyQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGZpbHRlclRleHQgPSB1dGlscy5tYWtlTnVsbCh0aGlzLmVGaWx0ZXJUZXh0RmllbGQudmFsdWUpO1xyXG4gICAgaWYgKGZpbHRlclRleHQgJiYgZmlsdGVyVGV4dC50cmltKCkgPT09ICcnKSB7XHJcbiAgICAgICAgZmlsdGVyVGV4dCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAoZmlsdGVyVGV4dCkge1xyXG4gICAgICAgIHRoaXMuZmlsdGVyVGV4dCA9IGZpbHRlclRleHQudG9Mb3dlckNhc2UoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJUZXh0ID0gbnVsbDtcclxuICAgIH1cclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrKCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRleHRGaWx0ZXI7XHJcbiIsInZhciB0ZW1wbGF0ZSA9IFtcclxuICAgICc8ZGl2PicsXHJcbiAgICAnPGRpdj4nLFxyXG4gICAgJzxzZWxlY3QgY2xhc3M9XCJhZy1maWx0ZXItc2VsZWN0XCIgaWQ9XCJmaWx0ZXJUeXBlXCI+JyxcclxuICAgICc8b3B0aW9uIHZhbHVlPVwiMVwiPkNvbnRhaW5zPC9vcHRpb24+JyxcclxuICAgICc8b3B0aW9uIHZhbHVlPVwiMlwiPkVxdWFsczwvb3B0aW9uPicsXHJcbiAgICAnPG9wdGlvbiB2YWx1ZT1cIjNcIj5TdGFydHMgd2l0aDwvb3B0aW9uPicsXHJcbiAgICAnPG9wdGlvbiB2YWx1ZT1cIjRcIj5FbmRzIHdpdGg8L29wdGlvbj4nLFxyXG4gICAgJzwvc2VsZWN0PicsXHJcbiAgICAnPC9kaXY+JyxcclxuICAgICc8ZGl2PicsXHJcbiAgICAnPGlucHV0IGNsYXNzPVwiYWctZmlsdGVyLWZpbHRlclwiIGlkPVwiZmlsdGVyVGV4dFwiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJmaWx0ZXIuLi5cIi8+JyxcclxuICAgICc8L2Rpdj4nLFxyXG4gICAgJzwvZGl2PicsXHJcbl0uam9pbignJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xyXG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcbnZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xyXG52YXIgR3JpZE9wdGlvbnNXcmFwcGVyID0gcmVxdWlyZSgnLi9ncmlkT3B0aW9uc1dyYXBwZXInKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS5qcycpO1xyXG52YXIgdGVtcGxhdGVOb1Njcm9sbHMgPSByZXF1aXJlKCcuL3RlbXBsYXRlTm9TY3JvbGxzLmpzJyk7XHJcbnZhciBTZWxlY3Rpb25Db250cm9sbGVyID0gcmVxdWlyZSgnLi9zZWxlY3Rpb25Db250cm9sbGVyJyk7XHJcbnZhciBGaWx0ZXJNYW5hZ2VyID0gcmVxdWlyZSgnLi9maWx0ZXIvZmlsdGVyTWFuYWdlcicpO1xyXG52YXIgU2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5ID0gcmVxdWlyZSgnLi9zZWxlY3Rpb25SZW5kZXJlckZhY3RvcnknKTtcclxudmFyIENvbHVtbkNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL2NvbHVtbkNvbnRyb2xsZXInKTtcclxudmFyIFJvd1JlbmRlcmVyID0gcmVxdWlyZSgnLi9yb3dSZW5kZXJlcicpO1xyXG52YXIgSGVhZGVyUmVuZGVyZXIgPSByZXF1aXJlKCcuL2hlYWRlclJlbmRlcmVyJyk7XHJcbnZhciBJbk1lbW9yeVJvd0NvbnRyb2xsZXIgPSByZXF1aXJlKCcuL2luTWVtb3J5Um93Q29udHJvbGxlcicpO1xyXG52YXIgVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyID0gcmVxdWlyZSgnLi92aXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXInKTtcclxudmFyIFBhZ2luYXRpb25Db250cm9sbGVyID0gcmVxdWlyZSgnLi9wYWdpbmF0aW9uQ29udHJvbGxlcicpO1xyXG52YXIgRXhwcmVzc2lvblNlcnZpY2UgPSByZXF1aXJlKCcuL2V4cHJlc3Npb25TZXJ2aWNlJyk7XHJcbnZhciBUZW1wbGF0ZVNlcnZpY2UgPSByZXF1aXJlKCcuL3RlbXBsYXRlU2VydmljZScpO1xyXG5cclxuZnVuY3Rpb24gR3JpZChlR3JpZERpdiwgZ3JpZE9wdGlvbnMsICRzY29wZSwgJGNvbXBpbGUpIHtcclxuXHJcbiAgICB0aGlzLmdyaWRPcHRpb25zID0gZ3JpZE9wdGlvbnM7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IG5ldyBHcmlkT3B0aW9uc1dyYXBwZXIodGhpcy5ncmlkT3B0aW9ucyk7XHJcblxyXG4gICAgdmFyIHVzZVNjcm9sbHMgPSAhdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpO1xyXG4gICAgaWYgKHVzZVNjcm9sbHMpIHtcclxuICAgICAgICBlR3JpZERpdi5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZUdyaWREaXYuaW5uZXJIVE1MID0gdGVtcGxhdGVOb1Njcm9sbHM7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5xdWlja0ZpbHRlciA9IG51bGw7XHJcblxyXG4gICAgLy8gaWYgdXNpbmcgYW5ndWxhciwgd2F0Y2ggZm9yIHF1aWNrRmlsdGVyIGNoYW5nZXNcclxuICAgIGlmICgkc2NvcGUpIHtcclxuICAgICAgICAkc2NvcGUuJHdhdGNoKFwiYW5ndWxhckdyaWQucXVpY2tGaWx0ZXJUZXh0XCIsIGZ1bmN0aW9uKG5ld0ZpbHRlcikge1xyXG4gICAgICAgICAgICB0aGF0Lm9uUXVpY2tGaWx0ZXJDaGFuZ2VkKG5ld0ZpbHRlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzID0ge307XHJcblxyXG4gICAgdGhpcy5hZGRBcGkoKTtcclxuICAgIHRoaXMuZmluZEFsbEVsZW1lbnRzKGVHcmlkRGl2KTtcclxuICAgIHRoaXMuY3JlYXRlQW5kV2lyZUJlYW5zKCRzY29wZSwgJGNvbXBpbGUsIGVHcmlkRGl2LCB1c2VTY3JvbGxzKTtcclxuXHJcbiAgICB0aGlzLnNjcm9sbFdpZHRoID0gdXRpbHMuZ2V0U2Nyb2xsYmFyV2lkdGgoKTtcclxuXHJcbiAgICB0aGlzLmluTWVtb3J5Um93Q29udHJvbGxlci5zZXRBbGxSb3dzKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFsbFJvd3MoKSk7XHJcblxyXG4gICAgaWYgKHVzZVNjcm9sbHMpIHtcclxuICAgICAgICB0aGlzLmFkZFNjcm9sbExpc3RlbmVyKCk7XHJcbiAgICAgICAgdGhpcy5zZXRCb2R5U2l6ZSgpOyAvL3NldHRpbmcgc2l6ZXMgb2YgYm9keSAoY29udGFpbmluZyB2aWV3cG9ydHMpLCBkb2Vzbid0IGNoYW5nZSBjb250YWluZXIgc2l6ZXNcclxuICAgIH1cclxuXHJcbiAgICAvLyBkb25lIHdoZW4gY29scyBjaGFuZ2VcclxuICAgIHRoaXMuc2V0dXBDb2x1bW5zKCk7XHJcblxyXG4gICAgLy8gZG9uZSB3aGVuIHJvd3MgY2hhbmdlXHJcbiAgICB0aGlzLnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9FVkVSWVRISU5HKTtcclxuXHJcbiAgICAvLyBmbGFnIHRvIG1hcmsgd2hlbiB0aGUgZGlyZWN0aXZlIGlzIGRlc3Ryb3llZFxyXG4gICAgdGhpcy5maW5pc2hlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIGlmIG5vIGRhdGEgcHJvdmlkZWQgaW5pdGlhbGx5LCBhbmQgbm90IGRvaW5nIGluZmluaXRlIHNjcm9sbGluZywgc2hvdyB0aGUgbG9hZGluZyBwYW5lbFxyXG4gICAgdmFyIHNob3dMb2FkaW5nID0gIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFsbFJvd3MoKSAmJiAhdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNWaXJ0dWFsUGFnaW5nKCk7XHJcbiAgICB0aGlzLnNob3dMb2FkaW5nUGFuZWwoc2hvd0xvYWRpbmcpO1xyXG5cclxuICAgIC8vIGlmIGRhdGFzb3VyY2UgcHJvdmlkZWQsIHVzZSBpdFxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldERhdGFzb3VyY2UoKSkge1xyXG4gICAgICAgIHRoaXMuc2V0RGF0YXNvdXJjZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIHJlYWR5IGZ1bmN0aW9uIHByb3ZpZGVkLCB1c2UgaXRcclxuICAgIGlmICh0eXBlb2YgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0UmVhZHkoKSA9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0UmVhZHkoKShncmlkT3B0aW9ucy5hcGkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5HcmlkLnByb3RvdHlwZS5jcmVhdGVBbmRXaXJlQmVhbnMgPSBmdW5jdGlvbigkc2NvcGUsICRjb21waWxlLCBlR3JpZERpdiwgdXNlU2Nyb2xscykge1xyXG5cclxuICAgIC8vIG1ha2UgbG9jYWwgcmVmZXJlbmNlcywgdG8gbWFrZSB0aGUgYmVsb3cgbW9yZSBodW1hbiByZWFkYWJsZVxyXG4gICAgdmFyIGdyaWRPcHRpb25zV3JhcHBlciA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4gICAgdmFyIGdyaWRPcHRpb25zID0gdGhpcy5ncmlkT3B0aW9ucztcclxuXHJcbiAgICAvLyBjcmVhdGUgYWxsIHRoZSBiZWFuc1xyXG4gICAgdmFyIHNlbGVjdGlvbkNvbnRyb2xsZXIgPSBuZXcgU2VsZWN0aW9uQ29udHJvbGxlcigpO1xyXG4gICAgdmFyIGZpbHRlck1hbmFnZXIgPSBuZXcgRmlsdGVyTWFuYWdlcigpO1xyXG4gICAgdmFyIHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSA9IG5ldyBTZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkoKTtcclxuICAgIHZhciBjb2x1bW5Db250cm9sbGVyID0gbmV3IENvbHVtbkNvbnRyb2xsZXIoKTtcclxuICAgIHZhciByb3dSZW5kZXJlciA9IG5ldyBSb3dSZW5kZXJlcigpO1xyXG4gICAgdmFyIGhlYWRlclJlbmRlcmVyID0gbmV3IEhlYWRlclJlbmRlcmVyKCk7XHJcbiAgICB2YXIgaW5NZW1vcnlSb3dDb250cm9sbGVyID0gbmV3IEluTWVtb3J5Um93Q29udHJvbGxlcigpO1xyXG4gICAgdmFyIHZpcnR1YWxQYWdlUm93Q29udHJvbGxlciA9IG5ldyBWaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIoKTtcclxuICAgIHZhciBleHByZXNzaW9uU2VydmljZSA9IG5ldyBFeHByZXNzaW9uU2VydmljZSgpO1xyXG4gICAgdmFyIHRlbXBsYXRlU2VydmljZSA9IG5ldyBUZW1wbGF0ZVNlcnZpY2UoKTtcclxuXHJcbiAgICB2YXIgY29sdW1uTW9kZWwgPSBjb2x1bW5Db250cm9sbGVyLmdldE1vZGVsKCk7XHJcblxyXG4gICAgLy8gaW5pdGlhbGlzZSBhbGwgdGhlIGJlYW5zXHJcbiAgICB0ZW1wbGF0ZVNlcnZpY2UuaW5pdCgkc2NvcGUpO1xyXG4gICAgc2VsZWN0aW9uQ29udHJvbGxlci5pbml0KHRoaXMsIHRoaXMuZVBhcmVudE9mUm93cywgZ3JpZE9wdGlvbnNXcmFwcGVyLCAkc2NvcGUsIHJvd1JlbmRlcmVyKTtcclxuICAgIGZpbHRlck1hbmFnZXIuaW5pdCh0aGlzLCBncmlkT3B0aW9uc1dyYXBwZXIsICRjb21waWxlLCAkc2NvcGUpO1xyXG4gICAgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LmluaXQodGhpcywgc2VsZWN0aW9uQ29udHJvbGxlcik7XHJcbiAgICBjb2x1bW5Db250cm9sbGVyLmluaXQodGhpcywgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LCBncmlkT3B0aW9uc1dyYXBwZXIpO1xyXG4gICAgcm93UmVuZGVyZXIuaW5pdChncmlkT3B0aW9ucywgY29sdW1uTW9kZWwsIGdyaWRPcHRpb25zV3JhcHBlciwgZUdyaWREaXYsIHRoaXMsXHJcbiAgICAgICAgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LCAkY29tcGlsZSwgJHNjb3BlLCBzZWxlY3Rpb25Db250cm9sbGVyLCBleHByZXNzaW9uU2VydmljZSwgdGVtcGxhdGVTZXJ2aWNlLFxyXG4gICAgICAgIHRoaXMuZVBhcmVudE9mUm93cyk7XHJcbiAgICBoZWFkZXJSZW5kZXJlci5pbml0KGdyaWRPcHRpb25zV3JhcHBlciwgY29sdW1uQ29udHJvbGxlciwgY29sdW1uTW9kZWwsIGVHcmlkRGl2LCB0aGlzLCBmaWx0ZXJNYW5hZ2VyLCAkc2NvcGUsICRjb21waWxlKTtcclxuICAgIGluTWVtb3J5Um93Q29udHJvbGxlci5pbml0KGdyaWRPcHRpb25zV3JhcHBlciwgY29sdW1uTW9kZWwsIHRoaXMsIGZpbHRlck1hbmFnZXIsICRzY29wZSwgZXhwcmVzc2lvblNlcnZpY2UpO1xyXG4gICAgdmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLmluaXQocm93UmVuZGVyZXIpO1xyXG5cclxuICAgIC8vIHRoaXMgaXMgYSBjaGlsZCBiZWFuLCBnZXQgYSByZWZlcmVuY2UgYW5kIHBhc3MgaXQgb25cclxuICAgIC8vIENBTiBXRSBERUxFVEUgVEhJUz8gaXQncyBkb25lIGluIHRoZSBzZXREYXRhc291cmNlIHNlY3Rpb25cclxuICAgIHZhciByb3dNb2RlbCA9IGluTWVtb3J5Um93Q29udHJvbGxlci5nZXRNb2RlbCgpO1xyXG4gICAgc2VsZWN0aW9uQ29udHJvbGxlci5zZXRSb3dNb2RlbChyb3dNb2RlbCk7XHJcbiAgICBmaWx0ZXJNYW5hZ2VyLnNldFJvd01vZGVsKHJvd01vZGVsKTtcclxuICAgIHJvd1JlbmRlcmVyLnNldFJvd01vZGVsKHJvd01vZGVsKTtcclxuXHJcbiAgICAvLyBhbmQgdGhlIGxhc3QgYmVhbiwgZG9uZSBpbiBpdCdzIG93biBzZWN0aW9uLCBhcyBpdCdzIG9wdGlvbmFsXHJcbiAgICB2YXIgcGFnaW5hdGlvbkNvbnRyb2xsZXIgPSBudWxsO1xyXG4gICAgaWYgKHVzZVNjcm9sbHMpIHtcclxuICAgICAgICBwYWdpbmF0aW9uQ29udHJvbGxlciA9IG5ldyBQYWdpbmF0aW9uQ29udHJvbGxlcigpO1xyXG4gICAgICAgIHBhZ2luYXRpb25Db250cm9sbGVyLmluaXQodGhpcy5lUGFnaW5nUGFuZWwsIHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucm93TW9kZWwgPSByb3dNb2RlbDtcclxuICAgIHRoaXMuc2VsZWN0aW9uQ29udHJvbGxlciA9IHNlbGVjdGlvbkNvbnRyb2xsZXI7XHJcbiAgICB0aGlzLmNvbHVtbkNvbnRyb2xsZXIgPSBjb2x1bW5Db250cm9sbGVyO1xyXG4gICAgdGhpcy5jb2x1bW5Nb2RlbCA9IGNvbHVtbk1vZGVsO1xyXG4gICAgdGhpcy5pbk1lbW9yeVJvd0NvbnRyb2xsZXIgPSBpbk1lbW9yeVJvd0NvbnRyb2xsZXI7XHJcbiAgICB0aGlzLnZpcnR1YWxQYWdlUm93Q29udHJvbGxlciA9IHZpcnR1YWxQYWdlUm93Q29udHJvbGxlcjtcclxuICAgIHRoaXMucm93UmVuZGVyZXIgPSByb3dSZW5kZXJlcjtcclxuICAgIHRoaXMuaGVhZGVyUmVuZGVyZXIgPSBoZWFkZXJSZW5kZXJlcjtcclxuICAgIHRoaXMucGFnaW5hdGlvbkNvbnRyb2xsZXIgPSBwYWdpbmF0aW9uQ29udHJvbGxlcjtcclxuICAgIHRoaXMuZmlsdGVyTWFuYWdlciA9IGZpbHRlck1hbmFnZXI7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zaG93QW5kUG9zaXRpb25QYWdpbmdQYW5lbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gbm8gcGFnaW5nIHdoZW4gbm8tc2Nyb2xsc1xyXG4gICAgaWYgKCF0aGlzLmVQYWdpbmdQYW5lbCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5pc1Nob3dQYWdpbmdQYW5lbCgpKSB7XHJcbiAgICAgICAgdGhpcy5lUGFnaW5nUGFuZWwuc3R5bGVbJ2Rpc3BsYXknXSA9IG51bGw7XHJcbiAgICAgICAgdmFyIGhlaWdodE9mUGFnZXIgPSB0aGlzLmVQYWdpbmdQYW5lbC5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5lQm9keS5zdHlsZVsncGFkZGluZy1ib3R0b20nXSA9IGhlaWdodE9mUGFnZXIgKyAncHgnO1xyXG4gICAgICAgIHZhciBoZWlnaHRPZlJvb3QgPSB0aGlzLmVSb290LmNsaWVudEhlaWdodDtcclxuICAgICAgICB2YXIgdG9wT2ZQYWdlciA9IGhlaWdodE9mUm9vdCAtIGhlaWdodE9mUGFnZXI7XHJcbiAgICAgICAgdGhpcy5lUGFnaW5nUGFuZWwuc3R5bGVbJ3RvcCddID0gdG9wT2ZQYWdlciArICdweCc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZVBhZ2luZ1BhbmVsLnN0eWxlWydkaXNwbGF5J10gPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5lQm9keS5zdHlsZVsncGFkZGluZy1ib3R0b20nXSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuaXNTaG93UGFnaW5nUGFuZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLnNob3dQYWdpbmdQYW5lbDtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNldERhdGFzb3VyY2UgPSBmdW5jdGlvbihkYXRhc291cmNlKSB7XHJcbiAgICAvLyBpZiBkYXRhc291cmNlIHByb3ZpZGVkLCB0aGVuIHNldCBpdFxyXG4gICAgaWYgKGRhdGFzb3VyY2UpIHtcclxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zLmRhdGFzb3VyY2UgPSBkYXRhc291cmNlO1xyXG4gICAgfVxyXG4gICAgLy8gZ2V0IHRoZSBzZXQgZGF0YXNvdXJjZSAoaWYgbnVsbCB3YXMgcGFzc2VkIHRvIHRoaXMgbWV0aG9kLFxyXG4gICAgLy8gdGhlbiBuZWVkIHRvIGdldCB0aGUgYWN0dWFsIGRhdGFzb3VyY2UgZnJvbSBvcHRpb25zXHJcbiAgICB2YXIgZGF0YXNvdXJjZVRvVXNlID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0RGF0YXNvdXJjZSgpO1xyXG4gICAgdmFyIHZpcnR1YWxQYWdpbmcgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc1ZpcnR1YWxQYWdpbmcoKSAmJiBkYXRhc291cmNlVG9Vc2U7XHJcbiAgICB2YXIgcGFnaW5hdGlvbiA9IGRhdGFzb3VyY2VUb1VzZSAmJiAhdmlydHVhbFBhZ2luZztcclxuXHJcbiAgICBpZiAodmlydHVhbFBhZ2luZykge1xyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkNvbnRyb2xsZXIuc2V0RGF0YXNvdXJjZShudWxsKTtcclxuICAgICAgICB0aGlzLnZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5zZXREYXRhc291cmNlKGRhdGFzb3VyY2VUb1VzZSk7XHJcbiAgICAgICAgdGhpcy5yb3dNb2RlbCA9IHRoaXMudmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLmdldE1vZGVsKCk7XHJcbiAgICAgICAgdGhpcy5zaG93UGFnaW5nUGFuZWwgPSBmYWxzZTtcclxuICAgIH0gZWxzZSBpZiAocGFnaW5hdGlvbikge1xyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkNvbnRyb2xsZXIuc2V0RGF0YXNvdXJjZShkYXRhc291cmNlVG9Vc2UpO1xyXG4gICAgICAgIHRoaXMudmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnNldERhdGFzb3VyY2UobnVsbCk7XHJcbiAgICAgICAgdGhpcy5yb3dNb2RlbCA9IHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyLmdldE1vZGVsKCk7XHJcbiAgICAgICAgdGhpcy5zaG93UGFnaW5nUGFuZWwgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnBhZ2luYXRpb25Db250cm9sbGVyLnNldERhdGFzb3VyY2UobnVsbCk7XHJcbiAgICAgICAgdGhpcy52aXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIuc2V0RGF0YXNvdXJjZShudWxsKTtcclxuICAgICAgICB0aGlzLnJvd01vZGVsID0gdGhpcy5pbk1lbW9yeVJvd0NvbnRyb2xsZXIuZ2V0TW9kZWwoKTtcclxuICAgICAgICB0aGlzLnNob3dQYWdpbmdQYW5lbCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VsZWN0aW9uQ29udHJvbGxlci5zZXRSb3dNb2RlbCh0aGlzLnJvd01vZGVsKTtcclxuICAgIHRoaXMuZmlsdGVyTWFuYWdlci5zZXRSb3dNb2RlbCh0aGlzLnJvd01vZGVsKTtcclxuICAgIHRoaXMucm93UmVuZGVyZXIuc2V0Um93TW9kZWwodGhpcy5yb3dNb2RlbCk7XHJcblxyXG4gICAgLy8gd2UgbWF5IG9mIGp1c3Qgc2hvd24gb3IgaGlkZGVuIHRoZSBwYWdpbmcgcGFuZWwsIHNvIG5lZWRcclxuICAgIC8vIHRvIGdldCB0YWJsZSB0byBjaGVjayB0aGUgYm9keSBzaXplLCB3aGljaCBhbHNvIGhpZGVzIGFuZFxyXG4gICAgLy8gc2hvd3MgdGhlIHBhZ2luZyBwYW5lbC5cclxuICAgIHRoaXMuc2V0Qm9keVNpemUoKTtcclxuXHJcbiAgICAvLyBiZWNhdXNlIHdlIGp1c3Qgc2V0IHRoZSByb3dNb2RlbCwgbmVlZCB0byB1cGRhdGUgdGhlIGd1aVxyXG4gICAgdGhpcy5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG59O1xyXG5cclxuLy8gZ2V0cyBjYWxsZWQgYWZ0ZXIgY29sdW1ucyBhcmUgc2hvd24gLyBoaWRkZW4gZnJvbSBncm91cHMgZXhwYW5kaW5nXHJcbkdyaWQucHJvdG90eXBlLnJlZnJlc2hIZWFkZXJBbmRCb2R5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmhlYWRlclJlbmRlcmVyLnJlZnJlc2hIZWFkZXIoKTtcclxuICAgIHRoaXMuaGVhZGVyUmVuZGVyZXIudXBkYXRlRmlsdGVySWNvbnMoKTtcclxuICAgIHRoaXMuc2V0Qm9keUNvbnRhaW5lcldpZHRoKCk7XHJcbiAgICB0aGlzLnNldFBpbm5lZENvbENvbnRhaW5lcldpZHRoKCk7XHJcbiAgICB0aGlzLnJvd1JlbmRlcmVyLnJlZnJlc2hWaWV3KCk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zZXRGaW5pc2hlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5maW5pc2hlZCA9IHRydWU7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5nZXRQb3B1cFBhcmVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZVJvb3Q7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5nZXRRdWlja0ZpbHRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucXVpY2tGaWx0ZXI7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5vblF1aWNrRmlsdGVyQ2hhbmdlZCA9IGZ1bmN0aW9uKG5ld0ZpbHRlcikge1xyXG4gICAgaWYgKG5ld0ZpbHRlciA9PT0gdW5kZWZpbmVkIHx8IG5ld0ZpbHRlciA9PT0gXCJcIikge1xyXG4gICAgICAgIG5ld0ZpbHRlciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5xdWlja0ZpbHRlciAhPT0gbmV3RmlsdGVyKSB7XHJcbiAgICAgICAgLy93YW50ICdudWxsJyB0byBtZWFuIHRvIGZpbHRlciwgc28gcmVtb3ZlIHVuZGVmaW5lZCBhbmQgZW1wdHkgc3RyaW5nXHJcbiAgICAgICAgaWYgKG5ld0ZpbHRlciA9PT0gdW5kZWZpbmVkIHx8IG5ld0ZpbHRlciA9PT0gXCJcIikge1xyXG4gICAgICAgICAgICBuZXdGaWx0ZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobmV3RmlsdGVyICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIG5ld0ZpbHRlciA9IG5ld0ZpbHRlci50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnF1aWNrRmlsdGVyID0gbmV3RmlsdGVyO1xyXG4gICAgICAgIHRoaXMub25GaWx0ZXJDaGFuZ2VkKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5vbkZpbHRlckNoYW5nZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMudXBkYXRlTW9kZWxBbmRSZWZyZXNoKGNvbnN0YW50cy5TVEVQX0ZJTFRFUik7XHJcbiAgICB0aGlzLmhlYWRlclJlbmRlcmVyLnVwZGF0ZUZpbHRlckljb25zKCk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5vblJvd0NsaWNrZWQgPSBmdW5jdGlvbihldmVudCwgcm93SW5kZXgsIG5vZGUpIHtcclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9ucy5yb3dDbGlja2VkKSB7XHJcbiAgICAgICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgICAgICBldmVudDogZXZlbnRcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMucm93Q2xpY2tlZChwYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHdlIGRvIG5vdCBhbGxvdyBzZWxlY3RpbmcgZ3JvdXBzIGJ5IGNsaWNraW5nIChhcyB0aGUgY2xpY2sgaGVyZSBleHBhbmRzIHRoZSBncm91cClcclxuICAgIC8vIHNvIHJldHVybiBpZiBpdCdzIGEgZ3JvdXAgcm93XHJcbiAgICBpZiAobm9kZS5ncm91cCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBubyBzZWxlY3Rpb24gbWV0aG9kIGVuYWJsZWQsIGRvIG5vdGhpbmdcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNSb3dTZWxlY3Rpb24oKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBjbGljayBzZWxlY3Rpb24gc3VwcHJlc3NlZCwgZG8gbm90aGluZ1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzU3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbigpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGN0cmxLZXkgZm9yIHdpbmRvd3MsIG1ldGFLZXkgZm9yIEFwcGxlXHJcbiAgICB2YXIgdHJ5TXVsdGkgPSBldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXk7XHJcbiAgICB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIuc2VsZWN0Tm9kZShub2RlLCB0cnlNdWx0aSk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zZXRIZWFkZXJIZWlnaHQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBoZWFkZXJIZWlnaHQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRIZWFkZXJIZWlnaHQoKTtcclxuICAgIHZhciBoZWFkZXJIZWlnaHRQaXhlbHMgPSBoZWFkZXJIZWlnaHQgKyAncHgnO1xyXG4gICAgdmFyIGRvbnRVc2VTY3JvbGxzID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpO1xyXG4gICAgaWYgKGRvbnRVc2VTY3JvbGxzKSB7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyQ29udGFpbmVyLnN0eWxlWydoZWlnaHQnXSA9IGhlYWRlckhlaWdodFBpeGVscztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyLnN0eWxlWydoZWlnaHQnXSA9IGhlYWRlckhlaWdodFBpeGVscztcclxuICAgICAgICB0aGlzLmVCb2R5LnN0eWxlWydwYWRkaW5nLXRvcCddID0gaGVhZGVySGVpZ2h0UGl4ZWxzO1xyXG4gICAgICAgIHRoaXMuZUxvYWRpbmdQYW5lbC5zdHlsZVsnbWFyZ2luLXRvcCddID0gaGVhZGVySGVpZ2h0UGl4ZWxzO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2hvd0xvYWRpbmdQYW5lbCA9IGZ1bmN0aW9uKHNob3cpIHtcclxuICAgIGlmIChzaG93KSB7XHJcbiAgICAgICAgLy8gc2V0dGluZyBkaXNwbGF5IHRvIG51bGwsIGFjdHVhbGx5IGhhcyB0aGUgaW1wYWN0IG9mIHNldHRpbmcgaXRcclxuICAgICAgICAvLyB0byAndGFibGUnLCBhcyB0aGlzIGlzIHBhcnQgb2YgdGhlIGFnLWxvYWRpbmctcGFuZWwgY29yZSBzdHlsZVxyXG4gICAgICAgIHRoaXMuZUxvYWRpbmdQYW5lbC5zdHlsZS5kaXNwbGF5ID0gbnVsbDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lTG9hZGluZ1BhbmVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zZXR1cENvbHVtbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuc2V0SGVhZGVySGVpZ2h0KCk7XHJcbiAgICB0aGlzLmNvbHVtbkNvbnRyb2xsZXIuc2V0Q29sdW1ucyh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb2x1bW5EZWZzKCkpO1xyXG4gICAgdGhpcy5zaG93UGlubmVkQ29sQ29udGFpbmVyc0lmTmVlZGVkKCk7XHJcbiAgICB0aGlzLmhlYWRlclJlbmRlcmVyLnJlZnJlc2hIZWFkZXIoKTtcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgdGhpcy5zZXRQaW5uZWRDb2xDb250YWluZXJXaWR0aCgpO1xyXG4gICAgICAgIHRoaXMuc2V0Qm9keUNvbnRhaW5lcldpZHRoKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmhlYWRlclJlbmRlcmVyLnVwZGF0ZUZpbHRlckljb25zKCk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zZXRCb2R5Q29udGFpbmVyV2lkdGggPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtYWluUm93V2lkdGggPSB0aGlzLmNvbHVtbk1vZGVsLmdldEJvZHlDb250YWluZXJXaWR0aCgpICsgXCJweFwiO1xyXG4gICAgdGhpcy5lQm9keUNvbnRhaW5lci5zdHlsZS53aWR0aCA9IG1haW5Sb3dXaWR0aDtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnVwZGF0ZU1vZGVsQW5kUmVmcmVzaCA9IGZ1bmN0aW9uKHN0ZXApIHtcclxuICAgIHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyLnVwZGF0ZU1vZGVsKHN0ZXApO1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0Um93cyA9IGZ1bmN0aW9uKHJvd3MsIGZpcnN0SWQpIHtcclxuICAgIGlmIChyb3dzKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5yb3dEYXRhID0gcm93cztcclxuICAgIH1cclxuICAgIHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyLnNldEFsbFJvd3ModGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QWxsUm93cygpLCBmaXJzdElkKTtcclxuICAgIHRoaXMuc2VsZWN0aW9uQ29udHJvbGxlci5kZXNlbGVjdEFsbCgpO1xyXG4gICAgdGhpcy5maWx0ZXJNYW5hZ2VyLm9uTmV3Um93c0xvYWRlZCgpO1xyXG4gICAgdGhpcy51cGRhdGVNb2RlbEFuZFJlZnJlc2goY29uc3RhbnRzLlNURVBfRVZFUllUSElORyk7XHJcbiAgICB0aGlzLmhlYWRlclJlbmRlcmVyLnVwZGF0ZUZpbHRlckljb25zKCk7XHJcbiAgICB0aGlzLnNob3dMb2FkaW5nUGFuZWwoZmFsc2UpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuZW5zdXJlTm9kZVZpc2libGUgPSBmdW5jdGlvbihjb21wYXJhdG9yKSB7XHJcbiAgICAvLyBsb29rIGZvciB0aGUgbm9kZSBpbmRleCB3ZSB3YW50IHRvIGRpc3BsYXlcclxuICAgIHZhciByb3dDb3VudCA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvd0NvdW50KCk7XHJcbiAgICB2YXIgY29tcGFyYXRvcklzQUZ1bmN0aW9uID0gdHlwZW9mIGNvbXBhcmF0b3IgPT09ICdmdW5jdGlvbic7XHJcbiAgICB2YXIgaW5kZXhUb1NlbGVjdCA9IC0xO1xyXG4gICAgLy8gZ28gdGhyb3VnaCBhbGwgdGhlIG5vZGVzLCBmaW5kIHRoZSBvbmUgd2Ugd2FudCB0byBzaG93XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvd0NvdW50OyBpKyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvdyhpKTtcclxuICAgICAgICBpZiAoY29tcGFyYXRvcklzQUZ1bmN0aW9uKSB7XHJcbiAgICAgICAgICAgIGlmIChjb21wYXJhdG9yKG5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleFRvU2VsZWN0ID0gaTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gY2hlY2sgb2JqZWN0IGVxdWFsaXR5IGFnYWluc3Qgbm9kZSBhbmQgZGF0YVxyXG4gICAgICAgICAgICBpZiAoY29tcGFyYXRvciA9PT0gbm9kZSB8fCBjb21wYXJhdG9yID09PSBub2RlLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4VG9TZWxlY3QgPSBpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoaW5kZXhUb1NlbGVjdCA+PSAwKSB7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVJbmRleFZpc2libGUoaW5kZXhUb1NlbGVjdCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5lbnN1cmVJbmRleFZpc2libGUgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgdmFyIGxhc3RSb3cgPSB0aGlzLnJvd01vZGVsLmdldFZpcnR1YWxSb3dDb3VudCgpO1xyXG4gICAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicgfHwgaW5kZXggPCAwIHx8IGluZGV4ID49IGxhc3RSb3cpIHtcclxuICAgICAgICB0aHJvdyAnaW52YWxpZCByb3cgaW5kZXggZm9yIGVuc3VyZUluZGV4VmlzaWJsZTogJyArIGluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIHZhciByb3dIZWlnaHQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dIZWlnaHQoKTtcclxuICAgIHZhciByb3dUb3BQaXhlbCA9IHJvd0hlaWdodCAqIGluZGV4O1xyXG4gICAgdmFyIHJvd0JvdHRvbVBpeGVsID0gcm93VG9wUGl4ZWwgKyByb3dIZWlnaHQ7XHJcblxyXG4gICAgdmFyIHZpZXdwb3J0VG9wUGl4ZWwgPSB0aGlzLmVCb2R5Vmlld3BvcnQuc2Nyb2xsVG9wO1xyXG4gICAgdmFyIHZpZXdwb3J0SGVpZ2h0ID0gdGhpcy5lQm9keVZpZXdwb3J0Lm9mZnNldEhlaWdodDtcclxuICAgIHZhciBzY3JvbGxTaG93aW5nID0gdGhpcy5lQm9keVZpZXdwb3J0LmNsaWVudFdpZHRoIDwgdGhpcy5lQm9keVZpZXdwb3J0LnNjcm9sbFdpZHRoO1xyXG4gICAgaWYgKHNjcm9sbFNob3dpbmcpIHtcclxuICAgICAgICB2aWV3cG9ydEhlaWdodCAtPSB0aGlzLnNjcm9sbFdpZHRoO1xyXG4gICAgfVxyXG4gICAgdmFyIHZpZXdwb3J0Qm90dG9tUGl4ZWwgPSB2aWV3cG9ydFRvcFBpeGVsICsgdmlld3BvcnRIZWlnaHQ7XHJcblxyXG4gICAgdmFyIHZpZXdwb3J0U2Nyb2xsZWRQYXN0Um93ID0gdmlld3BvcnRUb3BQaXhlbCA+IHJvd1RvcFBpeGVsO1xyXG4gICAgdmFyIHZpZXdwb3J0U2Nyb2xsZWRCZWZvcmVSb3cgPSB2aWV3cG9ydEJvdHRvbVBpeGVsIDwgcm93Qm90dG9tUGl4ZWw7XHJcblxyXG4gICAgaWYgKHZpZXdwb3J0U2Nyb2xsZWRQYXN0Um93KSB7XHJcbiAgICAgICAgLy8gaWYgcm93IGlzIGJlZm9yZSwgc2Nyb2xsIHVwIHdpdGggcm93IGF0IHRvcFxyXG4gICAgICAgIHRoaXMuZUJvZHlWaWV3cG9ydC5zY3JvbGxUb3AgPSByb3dUb3BQaXhlbDtcclxuICAgIH0gZWxzZSBpZiAodmlld3BvcnRTY3JvbGxlZEJlZm9yZVJvdykge1xyXG4gICAgICAgIC8vIGlmIHJvdyBpcyBiZWxvdywgc2Nyb2xsIGRvd24gd2l0aCByb3cgYXQgYm90dG9tXHJcbiAgICAgICAgdmFyIG5ld1Njcm9sbFBvc2l0aW9uID0gcm93Qm90dG9tUGl4ZWwgLSB2aWV3cG9ydEhlaWdodDtcclxuICAgICAgICB0aGlzLmVCb2R5Vmlld3BvcnQuc2Nyb2xsVG9wID0gbmV3U2Nyb2xsUG9zaXRpb247XHJcbiAgICB9XHJcbiAgICAvLyBvdGhlcndpc2UsIHJvdyBpcyBhbHJlYWR5IGluIHZpZXcsIHNvIGRvIG5vdGhpbmdcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmFkZEFwaSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIGFwaSA9IHtcclxuICAgICAgICBzZXREYXRhc291cmNlOiBmdW5jdGlvbihkYXRhc291cmNlKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YXNvdXJjZShkYXRhc291cmNlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uTmV3RGF0YXNvdXJjZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YXNvdXJjZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0Um93czogZnVuY3Rpb24ocm93cykge1xyXG4gICAgICAgICAgICB0aGF0LnNldFJvd3Mocm93cyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbk5ld1Jvd3M6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LnNldFJvd3MoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uTmV3Q29sczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQub25OZXdDb2xzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1bnNlbGVjdEFsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJ1bnNlbGVjdEFsbCBkZXByZWNhdGVkLCBjYWxsIGRlc2VsZWN0QWxsIGluc3RlYWRcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RBbGwoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlZnJlc2hWaWV3OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc29mdFJlZnJlc2hWaWV3OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5yb3dSZW5kZXJlci5zb2Z0UmVmcmVzaFZpZXcoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlZnJlc2hHcm91cFJvd3M6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LnJvd1JlbmRlcmVyLnJlZnJlc2hHcm91cFJvd3MoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlZnJlc2hIZWFkZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBuZWVkIHRvIHJldmlldyB0aGlzIC0gdGhlIHJlZnJlc2hIZWFkZXIgc2hvdWxkIGFsc28gcmVmcmVzaCBhbGwgaWNvbnMgaW4gdGhlIGhlYWRlclxyXG4gICAgICAgICAgICB0aGF0LmhlYWRlclJlbmRlcmVyLnJlZnJlc2hIZWFkZXIoKTtcclxuICAgICAgICAgICAgdGhhdC5oZWFkZXJSZW5kZXJlci51cGRhdGVGaWx0ZXJJY29ucygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0TW9kZWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5yb3dNb2RlbDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uR3JvdXBFeHBhbmRlZE9yQ29sbGFwc2VkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC51cGRhdGVNb2RlbEFuZFJlZnJlc2goY29uc3RhbnRzLlNURVBfTUFQKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4cGFuZEFsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuaW5NZW1vcnlSb3dDb250cm9sbGVyLmV4cGFuZE9yQ29sbGFwc2VBbGwodHJ1ZSwgbnVsbCk7XHJcbiAgICAgICAgICAgIHRoYXQudXBkYXRlTW9kZWxBbmRSZWZyZXNoKGNvbnN0YW50cy5TVEVQX01BUCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb2xsYXBzZUFsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuaW5NZW1vcnlSb3dDb250cm9sbGVyLmV4cGFuZE9yQ29sbGFwc2VBbGwoZmFsc2UsIG51bGwpO1xyXG4gICAgICAgICAgICB0aGF0LnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9NQVApO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkVmlydHVhbFJvd0xpc3RlbmVyOiBmdW5jdGlvbihyb3dJbmRleCwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgdGhhdC5hZGRWaXJ0dWFsUm93TGlzdGVuZXIocm93SW5kZXgsIGNhbGxiYWNrKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJvd0RhdGFDaGFuZ2VkOiBmdW5jdGlvbihyb3dzKSB7XHJcbiAgICAgICAgICAgIHRoYXQucm93UmVuZGVyZXIucm93RGF0YUNoYW5nZWQocm93cyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRRdWlja0ZpbHRlcjogZnVuY3Rpb24obmV3RmlsdGVyKSB7XHJcbiAgICAgICAgICAgIHRoYXQub25RdWlja0ZpbHRlckNoYW5nZWQobmV3RmlsdGVyKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0SW5kZXg6IGZ1bmN0aW9uKGluZGV4LCB0cnlNdWx0aSwgc3VwcHJlc3NFdmVudHMpIHtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLnNlbGVjdEluZGV4KGluZGV4LCB0cnlNdWx0aSwgc3VwcHJlc3NFdmVudHMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVzZWxlY3RJbmRleDogZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLmRlc2VsZWN0SW5kZXgoaW5kZXgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0Tm9kZTogZnVuY3Rpb24obm9kZSwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5zZWxlY3ROb2RlKG5vZGUsIHRyeU11bHRpLCBzdXBwcmVzc0V2ZW50cyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZXNlbGVjdE5vZGU6IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLmRlc2VsZWN0Tm9kZShub2RlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdEFsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5zZWxlY3RBbGwoKTtcclxuICAgICAgICAgICAgdGhhdC5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVzZWxlY3RBbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuZGVzZWxlY3RBbGwoKTtcclxuICAgICAgICAgICAgdGhhdC5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVjb21wdXRlQWdncmVnYXRlczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuaW5NZW1vcnlSb3dDb250cm9sbGVyLmRvQWdncmVnYXRlKCk7XHJcbiAgICAgICAgICAgIHRoYXQucm93UmVuZGVyZXIucmVmcmVzaEdyb3VwUm93cygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2l6ZUNvbHVtbnNUb0ZpdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBhdmFpbGFibGVXaWR0aCA9IHRoYXQuZUJvZHkuY2xpZW50V2lkdGg7XHJcbiAgICAgICAgICAgIHZhciBzY3JvbGxTaG93aW5nID0gdGhhdC5lQm9keVZpZXdwb3J0LmNsaWVudEhlaWdodCA8IHRoYXQuZUJvZHlWaWV3cG9ydC5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxTaG93aW5nKSB7XHJcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVXaWR0aCAtPSB0aGF0LnNjcm9sbFdpZHRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoYXQuY29sdW1uQ29udHJvbGxlci5zaXplQ29sdW1uc1RvRml0KGF2YWlsYWJsZVdpZHRoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNob3dMb2FkaW5nOiBmdW5jdGlvbihzaG93KSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2hvd0xvYWRpbmdQYW5lbChzaG93KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzTm9kZVNlbGVjdGVkOiBmdW5jdGlvbihub2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuaXNOb2RlU2VsZWN0ZWQobm9kZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRTZWxlY3RlZE5vZGVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5nZXRTZWxlY3RlZE5vZGVzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRCZXN0Q29zdE5vZGVTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLmdldEJlc3RDb3N0Tm9kZVNlbGVjdGlvbigpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW5zdXJlSW5kZXhWaXNpYmxlOiBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5lbnN1cmVJbmRleFZpc2libGUoaW5kZXgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW5zdXJlTm9kZVZpc2libGU6IGZ1bmN0aW9uKGNvbXBhcmF0b3IpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZW5zdXJlTm9kZVZpc2libGUoY29tcGFyYXRvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnMuYXBpID0gYXBpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuYWRkVmlydHVhbFJvd0xpc3RlbmVyID0gZnVuY3Rpb24ocm93SW5kZXgsIGNhbGxiYWNrKSB7XHJcbiAgICBpZiAoIXRoaXMudmlydHVhbFJvd0NhbGxiYWNrc1tyb3dJbmRleF0pIHtcclxuICAgICAgICB0aGlzLnZpcnR1YWxSb3dDYWxsYmFja3Nbcm93SW5kZXhdID0gW107XHJcbiAgICB9XHJcbiAgICB0aGlzLnZpcnR1YWxSb3dDYWxsYmFja3Nbcm93SW5kZXhdLnB1c2goY2FsbGJhY2spO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUub25WaXJ0dWFsUm93U2VsZWN0ZWQgPSBmdW5jdGlvbihyb3dJbmRleCwgc2VsZWN0ZWQpIHtcclxuICAgIC8vIGluZm9ybSB0aGUgY2FsbGJhY2tzIG9mIHRoZSBldmVudFxyXG4gICAgaWYgKHRoaXMudmlydHVhbFJvd0NhbGxiYWNrc1tyb3dJbmRleF0pIHtcclxuICAgICAgICB0aGlzLnZpcnR1YWxSb3dDYWxsYmFja3Nbcm93SW5kZXhdLmZvckVhY2goZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjay5yb3dSZW1vdmVkID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5yb3dTZWxlY3RlZChzZWxlY3RlZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLm9uVmlydHVhbFJvd1JlbW92ZWQgPSBmdW5jdGlvbihyb3dJbmRleCkge1xyXG4gICAgLy8gaW5mb3JtIHRoZSBjYWxsYmFja3Mgb2YgdGhlIGV2ZW50XHJcbiAgICBpZiAodGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XSkge1xyXG4gICAgICAgIHRoaXMudmlydHVhbFJvd0NhbGxiYWNrc1tyb3dJbmRleF0uZm9yRWFjaChmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrLnJvd1JlbW92ZWQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrLnJvd1JlbW92ZWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLy8gcmVtb3ZlIHRoZSBjYWxsYmFja3NcclxuICAgIGRlbGV0ZSB0aGlzLnZpcnR1YWxSb3dDYWxsYmFja3Nbcm93SW5kZXhdO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUub25OZXdDb2xzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNldHVwQ29sdW1ucygpO1xyXG4gICAgdGhpcy51cGRhdGVNb2RlbEFuZFJlZnJlc2goY29uc3RhbnRzLlNURVBfRVZFUllUSElORyk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5maW5kQWxsRWxlbWVudHMgPSBmdW5jdGlvbihlR3JpZERpdikge1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9udFVzZVNjcm9sbHMoKSkge1xyXG4gICAgICAgIHRoaXMuZVJvb3QgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLXJvb3RcIik7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyQ29udGFpbmVyID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1oZWFkZXItY29udGFpbmVyXCIpO1xyXG4gICAgICAgIHRoaXMuZUJvZHlDb250YWluZXIgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLWJvZHktY29udGFpbmVyXCIpO1xyXG4gICAgICAgIHRoaXMuZUxvYWRpbmdQYW5lbCA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoJy5hZy1sb2FkaW5nLXBhbmVsJyk7XHJcbiAgICAgICAgLy8gZm9yIG5vLXNjcm9sbHMsIGFsbCByb3dzIGxpdmUgaW4gdGhlIGJvZHkgY29udGFpbmVyXHJcbiAgICAgICAgdGhpcy5lUGFyZW50T2ZSb3dzID0gdGhpcy5lQm9keUNvbnRhaW5lcjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lUm9vdCA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctcm9vdFwiKTtcclxuICAgICAgICB0aGlzLmVCb2R5ID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1ib2R5XCIpO1xyXG4gICAgICAgIHRoaXMuZUJvZHlDb250YWluZXIgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLWJvZHktY29udGFpbmVyXCIpO1xyXG4gICAgICAgIHRoaXMuZUJvZHlWaWV3cG9ydCA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keS12aWV3cG9ydFwiKTtcclxuICAgICAgICB0aGlzLmVCb2R5Vmlld3BvcnRXcmFwcGVyID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1ib2R5LXZpZXdwb3J0LXdyYXBwZXJcIik7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc0NvbnRhaW5lciA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctcGlubmVkLWNvbHMtY29udGFpbmVyXCIpO1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZENvbHNWaWV3cG9ydCA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctcGlubmVkLWNvbHMtdmlld3BvcnRcIik7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkSGVhZGVyID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1waW5uZWQtaGVhZGVyXCIpO1xyXG4gICAgICAgIHRoaXMuZUhlYWRlciA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctaGVhZGVyXCIpO1xyXG4gICAgICAgIHRoaXMuZUhlYWRlckNvbnRhaW5lciA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctaGVhZGVyLWNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLmVMb2FkaW5nUGFuZWwgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKCcuYWctbG9hZGluZy1wYW5lbCcpO1xyXG4gICAgICAgIC8vIGZvciBzY3JvbGxzLCBhbGwgcm93cyBsaXZlIGluIGVCb2R5IChjb250YWluaW5nIHBpbm5lZCBhbmQgbm9ybWFsIGJvZHkpXHJcbiAgICAgICAgdGhpcy5lUGFyZW50T2ZSb3dzID0gdGhpcy5lQm9keTtcclxuICAgICAgICB0aGlzLmVQYWdpbmdQYW5lbCA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoJy5hZy1wYWdpbmctcGFuZWwnKTtcclxuICAgIH1cclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNob3dQaW5uZWRDb2xDb250YWluZXJzSWZOZWVkZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIG5vIG5lZWQgdG8gZG8gdGhpcyBpZiBub3QgdXNpbmcgc2Nyb2xsc1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9udFVzZVNjcm9sbHMoKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2hvd2luZ1Bpbm5lZENvbHMgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRQaW5uZWRDb2xDb3VudCgpID4gMDtcclxuXHJcbiAgICAvL3NvbWUgYnJvd3NlcnMgaGFkIGxheW91dCBpc3N1ZXMgd2l0aCB0aGUgYmxhbmsgZGl2cywgc28gaWYgYmxhbmssXHJcbiAgICAvL3dlIGRvbid0IGRpc3BsYXkgdGhlbVxyXG4gICAgaWYgKHNob3dpbmdQaW5uZWRDb2xzKSB7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkSGVhZGVyLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzVmlld3BvcnQuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVQaW5uZWRIZWFkZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzVmlld3BvcnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH1cclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnVwZGF0ZUJvZHlDb250YWluZXJXaWR0aEFmdGVyQ29sUmVzaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnJvd1JlbmRlcmVyLnNldE1haW5Sb3dXaWR0aHMoKTtcclxuICAgIHRoaXMuc2V0Qm9keUNvbnRhaW5lcldpZHRoKCk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS51cGRhdGVQaW5uZWRDb2xDb250YWluZXJXaWR0aEFmdGVyQ29sUmVzaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNldFBpbm5lZENvbENvbnRhaW5lcldpZHRoKCk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zZXRQaW5uZWRDb2xDb250YWluZXJXaWR0aCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHBpbm5lZENvbFdpZHRoID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRQaW5uZWRDb250YWluZXJXaWR0aCgpICsgXCJweFwiO1xyXG4gICAgdGhpcy5lUGlubmVkQ29sc0NvbnRhaW5lci5zdHlsZS53aWR0aCA9IHBpbm5lZENvbFdpZHRoO1xyXG4gICAgdGhpcy5lQm9keVZpZXdwb3J0V3JhcHBlci5zdHlsZS5tYXJnaW5MZWZ0ID0gcGlubmVkQ29sV2lkdGg7XHJcbn07XHJcblxyXG4vLyBzZWUgaWYgYSBncmV5IGJveCBpcyBuZWVkZWQgYXQgdGhlIGJvdHRvbSBvZiB0aGUgcGlubmVkIGNvbFxyXG5HcmlkLnByb3RvdHlwZS5zZXRQaW5uZWRDb2xIZWlnaHQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIHZhciBib2R5SGVpZ2h0ID0gdXRpbHMucGl4ZWxTdHJpbmdUb051bWJlcih0aGlzLmVCb2R5LnN0eWxlLmhlaWdodCk7XHJcbiAgICB2YXIgc2Nyb2xsU2hvd2luZyA9IHRoaXMuZUJvZHlWaWV3cG9ydC5jbGllbnRXaWR0aCA8IHRoaXMuZUJvZHlWaWV3cG9ydC5zY3JvbGxXaWR0aDtcclxuICAgIHZhciBib2R5SGVpZ2h0ID0gdGhpcy5lQm9keVZpZXdwb3J0Lm9mZnNldEhlaWdodDtcclxuICAgIGlmIChzY3JvbGxTaG93aW5nKSB7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc1ZpZXdwb3J0LnN0eWxlLmhlaWdodCA9IChib2R5SGVpZ2h0IC0gdGhpcy5zY3JvbGxXaWR0aCkgKyBcInB4XCI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZENvbHNWaWV3cG9ydC5zdHlsZS5oZWlnaHQgPSBib2R5SGVpZ2h0ICsgXCJweFwiO1xyXG4gICAgfVxyXG4gICAgLy8gYWxzbyB0aGUgbG9hZGluZyBvdmVybGF5LCBuZWVkcyB0byBoYXZlIGl0J3MgaGVpZ2h0IGFkanVzdGVkXHJcbiAgICB0aGlzLmVMb2FkaW5nUGFuZWwuc3R5bGUuaGVpZ2h0ID0gYm9keUhlaWdodCArICdweCc7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zZXRCb2R5U2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICB2YXIgYm9keUhlaWdodCA9IHRoaXMuZUJvZHlWaWV3cG9ydC5vZmZzZXRIZWlnaHQ7XHJcbiAgICB2YXIgcGFnaW5nVmlzaWJsZSA9IHRoaXMuaXNTaG93UGFnaW5nUGFuZWwoKTtcclxuXHJcbiAgICBpZiAodGhpcy5ib2R5SGVpZ2h0TGFzdFRpbWUgIT0gYm9keUhlaWdodCB8fCB0aGlzLnNob3dQYWdpbmdQYW5lbFZpc2libGVMYXN0VGltZSAhPSBwYWdpbmdWaXNpYmxlKSB7XHJcbiAgICAgICAgdGhpcy5ib2R5SGVpZ2h0TGFzdFRpbWUgPSBib2R5SGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuc2hvd1BhZ2luZ1BhbmVsVmlzaWJsZUxhc3RUaW1lID0gcGFnaW5nVmlzaWJsZTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRQaW5uZWRDb2xIZWlnaHQoKTtcclxuXHJcbiAgICAgICAgLy9vbmx5IGRyYXcgdmlydHVhbCByb3dzIGlmIGRvbmUgc29ydCAmIGZpbHRlciAtIHRoaXNcclxuICAgICAgICAvL21lYW5zIHdlIGRvbid0IGRyYXcgcm93cyBpZiB0YWJsZSBpcyBub3QgeWV0IGluaXRpYWxpc2VkXHJcbiAgICAgICAgaWYgKHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvd0NvdW50KCkgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucm93UmVuZGVyZXIuZHJhd1ZpcnR1YWxSb3dzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzaG93IGFuZCBwb3NpdGlvbiBwYWdpbmcgcGFuZWxcclxuICAgICAgICB0aGlzLnNob3dBbmRQb3NpdGlvblBhZ2luZ1BhbmVsKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLmZpbmlzaGVkKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgX3RoaXMuc2V0Qm9keVNpemUoKTtcclxuICAgICAgICB9LCAyMDApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuYWRkU2Nyb2xsTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICB2YXIgbGFzdExlZnRQb3NpdGlvbiA9IC0xO1xyXG4gICAgdmFyIGxhc3RUb3BQb3NpdGlvbiA9IC0xO1xyXG5cclxuICAgIHRoaXMuZUJvZHlWaWV3cG9ydC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBuZXdMZWZ0UG9zaXRpb24gPSB0aGF0LmVCb2R5Vmlld3BvcnQuc2Nyb2xsTGVmdDtcclxuICAgICAgICB2YXIgbmV3VG9wUG9zaXRpb24gPSB0aGF0LmVCb2R5Vmlld3BvcnQuc2Nyb2xsVG9wO1xyXG5cclxuICAgICAgICBpZiAobmV3TGVmdFBvc2l0aW9uICE9PSBsYXN0TGVmdFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGxhc3RMZWZ0UG9zaXRpb24gPSBuZXdMZWZ0UG9zaXRpb247XHJcbiAgICAgICAgICAgIHRoYXQuc2Nyb2xsSGVhZGVyKG5ld0xlZnRQb3NpdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobmV3VG9wUG9zaXRpb24gIT09IGxhc3RUb3BQb3NpdGlvbikge1xyXG4gICAgICAgICAgICBsYXN0VG9wUG9zaXRpb24gPSBuZXdUb3BQb3NpdGlvbjtcclxuICAgICAgICAgICAgdGhhdC5zY3JvbGxQaW5uZWQobmV3VG9wUG9zaXRpb24pO1xyXG4gICAgICAgICAgICB0aGF0LnJvd1JlbmRlcmVyLmRyYXdWaXJ0dWFsUm93cygpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZVBpbm5lZENvbHNWaWV3cG9ydC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIHRoaXMgbWVhbnMgdGhlIHBpbm5lZCBwYW5lbCB3YXMgbW92ZWQsIHdoaWNoIGNhbiBvbmx5XHJcbiAgICAgICAgLy8gaGFwcGVuIHdoZW4gdGhlIHVzZXIgaXMgbmF2aWdhdGluZyBpbiB0aGUgcGlubmVkIGNvbnRhaW5lclxyXG4gICAgICAgIC8vIGFzIHRoZSBwaW5uZWQgY29sIHNob3VsZCBuZXZlciBzY3JvbGwuIHNvIHdlIHJvbGxiYWNrXHJcbiAgICAgICAgLy8gdGhlIHNjcm9sbCBvbiB0aGUgcGlubmVkLlxyXG4gICAgICAgIHRoYXQuZVBpbm5lZENvbHNWaWV3cG9ydC5zY3JvbGxUb3AgPSAwO1xyXG4gICAgfSk7XHJcblxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2Nyb2xsSGVhZGVyID0gZnVuY3Rpb24oYm9keUxlZnRQb3NpdGlvbikge1xyXG4gICAgLy8gdGhpcy5lSGVhZGVyQ29udGFpbmVyLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnICsgLWJvZHlMZWZ0UG9zaXRpb24gKyBcInB4LDAsMClcIjtcclxuICAgIHRoaXMuZUhlYWRlckNvbnRhaW5lci5zdHlsZS5sZWZ0ID0gLWJvZHlMZWZ0UG9zaXRpb24gKyBcInB4XCI7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zY3JvbGxQaW5uZWQgPSBmdW5jdGlvbihib2R5VG9wUG9zaXRpb24pIHtcclxuICAgIC8vIHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZTNkKDAsJyArIC1ib2R5VG9wUG9zaXRpb24gKyBcInB4LDApXCI7XHJcbiAgICB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyLnN0eWxlLnRvcCA9IC1ib2R5VG9wUG9zaXRpb24gKyBcInB4XCI7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdyaWQ7XHJcbiIsInZhciBERUZBVUxUX1JPV19IRUlHSFQgPSAzMDtcclxuXHJcbmZ1bmN0aW9uIEdyaWRPcHRpb25zV3JhcHBlcihncmlkT3B0aW9ucykge1xyXG4gICAgdGhpcy5ncmlkT3B0aW9ucyA9IGdyaWRPcHRpb25zO1xyXG4gICAgdGhpcy5zZXR1cERlZmF1bHRzKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzVHJ1ZSh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSAndHJ1ZSc7XHJcbn1cclxuXHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNSb3dTZWxlY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMucm93U2VsZWN0aW9uID09PSBcInNpbmdsZVwiIHx8IHRoaXMuZ3JpZE9wdGlvbnMucm93U2VsZWN0aW9uID09PSBcIm11bHRpcGxlXCI7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNSb3dTZWxlY3Rpb25NdWx0aSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5yb3dTZWxlY3Rpb24gPT09ICdtdWx0aXBsZSc7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5jb250ZXh0OyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzVmlydHVhbFBhZ2luZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMudmlydHVhbFBhZ2luZyk7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNSb3dzQWxyZWFkeUdyb3VwZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLnJvd3NBbHJlYWR5R3JvdXBlZCk7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNHcm91cFNlbGVjdHNDaGlsZHJlbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBTZWxlY3RzQ2hpbGRyZW4pOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzR3JvdXBJbmNsdWRlRm9vdGVyID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5ncm91cEluY2x1ZGVGb290ZXIpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzU3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbik7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNHcm91cEhlYWRlcnMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLmdyb3VwSGVhZGVycyk7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0R3JvdXBJbm5lclJlbmRlcmVyID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmdyb3VwSW5uZXJSZW5kZXJlcjsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0RvbnRVc2VTY3JvbGxzID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5kb250VXNlU2Nyb2xscyk7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Um93U3R5bGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMucm93U3R5bGU7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Um93Q2xhc3MgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMucm93Q2xhc3M7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0R3JpZE9wdGlvbnMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnM7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0SGVhZGVyQ2VsbFJlbmRlcmVyID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmhlYWRlckNlbGxSZW5kZXJlcjsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRBcGkgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuYXBpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzRW5hYmxlU29ydGluZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5lbmFibGVTb3J0aW5nOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzRW5hYmxlQ29sUmVzaXplID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmVuYWJsZUNvbFJlc2l6ZTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0VuYWJsZUZpbHRlciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5lbmFibGVGaWx0ZXI7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Q29sV2lkdGggPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuY29sV2lkdGg7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0R3JvdXBEZWZhdWx0RXhwYW5kZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBEZWZhdWx0RXhwYW5kZWQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0R3JvdXBLZXlzID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmdyb3VwS2V5czsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRHcm91cEFnZ0Z1bmN0aW9uID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmdyb3VwQWdnRnVuY3Rpb247IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0QWxsUm93cyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5yb3dEYXRhOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzR3JvdXBVc2VFbnRpcmVSb3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLmdyb3VwVXNlRW50aXJlUm93KTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0FuZ3VsYXJDb21waWxlUm93cyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuYW5ndWxhckNvbXBpbGVSb3dzKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0FuZ3VsYXJDb21waWxlRmlsdGVycyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuYW5ndWxhckNvbXBpbGVGaWx0ZXJzKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0FuZ3VsYXJDb21waWxlSGVhZGVycyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuYW5ndWxhckNvbXBpbGVIZWFkZXJzKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRDb2x1bW5EZWZzID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkRlZnM7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Um93SGVpZ2h0ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd0hlaWdodDsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRNb2RlbFVwZGF0ZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMubW9kZWxVcGRhdGVkOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldENlbGxDbGlja2VkID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmNlbGxDbGlja2VkOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldENlbGxEb3VibGVDbGlja2VkID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmNlbGxEb3VibGVDbGlja2VkOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldENlbGxWYWx1ZUNoYW5nZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuY2VsbFZhbHVlQ2hhbmdlZDsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRSb3dTZWxlY3RlZCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5yb3dTZWxlY3RlZDsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRTZWxlY3Rpb25DaGFuZ2VkID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnNlbGVjdGlvbkNoYW5nZWQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0VmlydHVhbFJvd1JlbW92ZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMudmlydHVhbFJvd1JlbW92ZWQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0RGF0YXNvdXJjZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5kYXRhc291cmNlOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldFJlYWR5ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJlYWR5OyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldFJvd0J1ZmZlciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5yb3dCdWZmZXI7IH07XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLnNldFNlbGVjdGVkUm93cyA9IGZ1bmN0aW9uKG5ld1NlbGVjdGVkUm93cykge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuc2VsZWN0ZWRSb3dzID0gbmV3U2VsZWN0ZWRSb3dzO1xyXG59O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLnNldFNlbGVjdGVkTm9kZXNCeUlkID0gZnVuY3Rpb24obmV3U2VsZWN0ZWROb2Rlcykge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuc2VsZWN0ZWROb2Rlc0J5SWQgPSBuZXdTZWxlY3RlZE5vZGVzO1xyXG59O1xyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRJY29ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuaWNvbnM7XHJcbn07XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzRG9JbnRlcm5hbEdyb3VwaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gIXRoaXMuaXNSb3dzQWxyZWFkeUdyb3VwZWQoKSAmJiB0aGlzLmdyaWRPcHRpb25zLmdyb3VwS2V5cztcclxufTtcclxuXHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0SGVhZGVySGVpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZ3JpZE9wdGlvbnMuaGVhZGVySGVpZ2h0ID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgIC8vIGlmIGhlYWRlciBoZWlnaHQgcHJvdmlkZWQsIHVzZWQgaXRcclxuICAgICAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5oZWFkZXJIZWlnaHQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIG90aGVyd2lzZSByZXR1cm4gMjUgaWYgbm8gZ3JvdXBpbmcsIDUwIGlmIGdyb3VwaW5nXHJcbiAgICAgICAgaWYgKHRoaXMuaXNHcm91cEhlYWRlcnMoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gNTA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIDI1O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuc2V0dXBEZWZhdWx0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCF0aGlzLmdyaWRPcHRpb25zLnJvd0hlaWdodCkge1xyXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMucm93SGVpZ2h0ID0gREVGQVVMVF9ST1dfSEVJR0hUO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRQaW5uZWRDb2xDb3VudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gaWYgbm90IHVzaW5nIHNjcm9sbHMsIHRoZW4gcGlubmVkIGNvbHVtbnMgZG9lc24ndCBtYWtlXHJcbiAgICAvLyBzZW5zZSwgc28gYWx3YXlzIHJldHVybiAwXHJcbiAgICBpZiAodGhpcy5pc0RvbnRVc2VTY3JvbGxzKCkpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLnBpbm5lZENvbHVtbkNvdW50KSB7XHJcbiAgICAgICAgLy9pbiBjYXNlIHVzZXIgcHV0cyBpbiBhIHN0cmluZywgY2FzdCB0byBudW1iZXJcclxuICAgICAgICByZXR1cm4gTnVtYmVyKHRoaXMuZ3JpZE9wdGlvbnMucGlubmVkQ29sdW1uQ291bnQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4iLCJmdW5jdGlvbiBHcm91cENyZWF0b3IoKSB7fVxyXG5cclxuR3JvdXBDcmVhdG9yLnByb3RvdHlwZS5ncm91cCA9IGZ1bmN0aW9uKHJvd05vZGVzLCBncm91cEJ5RmllbGRzLCBncm91cEFnZ0Z1bmN0aW9uLCBleHBhbmRCeURlZmF1bHQpIHtcclxuXHJcbiAgICB2YXIgdG9wTW9zdEdyb3VwID0ge1xyXG4gICAgICAgIGxldmVsOiAtMSxcclxuICAgICAgICBjaGlsZHJlbjogW10sXHJcbiAgICAgICAgY2hpbGRyZW5NYXA6IHt9XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBhbGxHcm91cHMgPSBbXTtcclxuICAgIGFsbEdyb3Vwcy5wdXNoKHRvcE1vc3RHcm91cCk7XHJcblxyXG4gICAgdmFyIGxldmVsVG9JbnNlcnRDaGlsZCA9IGdyb3VwQnlGaWVsZHMubGVuZ3RoIC0gMTtcclxuICAgIHZhciBpLCBjdXJyZW50TGV2ZWwsIG5vZGUsIGRhdGEsIGN1cnJlbnRHcm91cCwgZ3JvdXBCeUZpZWxkLCBncm91cEtleSwgbmV4dEdyb3VwO1xyXG5cclxuICAgIC8vIHN0YXJ0IGF0IC0xIGFuZCBnbyBiYWNrd2FyZHMsIGFzIGFsbCB0aGUgcG9zaXRpdmUgaW5kZXhlc1xyXG4gICAgLy8gYXJlIGFscmVhZHkgdXNlZCBieSB0aGUgbm9kZXMuXHJcbiAgICB2YXIgaW5kZXggPSAtMTtcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgcm93Tm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBub2RlID0gcm93Tm9kZXNbaV07XHJcbiAgICAgICAgZGF0YSA9IG5vZGUuZGF0YTtcclxuXHJcbiAgICAgICAgLy8gYWxsIGxlYWYgbm9kZXMgaGF2ZSB0aGUgc2FtZSBsZXZlbCBpbiB0aGlzIGdyb3VwaW5nLCB3aGljaCBpcyBvbmUgbGV2ZWwgYWZ0ZXIgdGhlIGxhc3QgZ3JvdXBcclxuICAgICAgICBub2RlLmxldmVsID0gbGV2ZWxUb0luc2VydENoaWxkICsgMTtcclxuXHJcbiAgICAgICAgZm9yIChjdXJyZW50TGV2ZWwgPSAwOyBjdXJyZW50TGV2ZWwgPCBncm91cEJ5RmllbGRzLmxlbmd0aDsgY3VycmVudExldmVsKyspIHtcclxuICAgICAgICAgICAgZ3JvdXBCeUZpZWxkID0gZ3JvdXBCeUZpZWxkc1tjdXJyZW50TGV2ZWxdO1xyXG4gICAgICAgICAgICBncm91cEtleSA9IGRhdGFbZ3JvdXBCeUZpZWxkXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50TGV2ZWwgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEdyb3VwID0gdG9wTW9zdEdyb3VwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBncm91cCBkb2Vzbid0IGV4aXN0IHlldCwgY3JlYXRlIGl0XHJcbiAgICAgICAgICAgIG5leHRHcm91cCA9IGN1cnJlbnRHcm91cC5jaGlsZHJlbk1hcFtncm91cEtleV07XHJcbiAgICAgICAgICAgIGlmICghbmV4dEdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBuZXh0R3JvdXAgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZmllbGQ6IGdyb3VwQnlGaWVsZCxcclxuICAgICAgICAgICAgICAgICAgICBpZDogaW5kZXgtLSxcclxuICAgICAgICAgICAgICAgICAgICBrZXk6IGdyb3VwS2V5LFxyXG4gICAgICAgICAgICAgICAgICAgIGV4cGFuZGVkOiB0aGlzLmlzRXhwYW5kZWQoZXhwYW5kQnlEZWZhdWx0LCBjdXJyZW50TGV2ZWwpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAvLyBmb3IgdG9wIG1vc3QgbGV2ZWwsIHBhcmVudCBpcyBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdXJyZW50R3JvdXAgPT09IHRvcE1vc3RHcm91cCA/IG51bGwgOiBjdXJyZW50R3JvdXAsXHJcbiAgICAgICAgICAgICAgICAgICAgYWxsQ2hpbGRyZW5Db3VudDogMCxcclxuICAgICAgICAgICAgICAgICAgICBsZXZlbDogY3VycmVudEdyb3VwLmxldmVsICsgMSxcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbk1hcDoge30gLy90aGlzIGlzIGEgdGVtcG9yYXJ5IG1hcCwgd2UgcmVtb3ZlIGF0IHRoZSBlbmQgb2YgdGhpcyBtZXRob2RcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50R3JvdXAuY2hpbGRyZW5NYXBbZ3JvdXBLZXldID0gbmV4dEdyb3VwO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEdyb3VwLmNoaWxkcmVuLnB1c2gobmV4dEdyb3VwKTtcclxuICAgICAgICAgICAgICAgIGFsbEdyb3Vwcy5wdXNoKG5leHRHcm91cCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG5leHRHcm91cC5hbGxDaGlsZHJlbkNvdW50Kys7XHJcblxyXG4gICAgICAgICAgICBpZiAoY3VycmVudExldmVsID09IGxldmVsVG9JbnNlcnRDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5wYXJlbnQgPSBuZXh0R3JvdXAgPT09IHRvcE1vc3RHcm91cCA/IG51bGwgOiBuZXh0R3JvdXA7XHJcbiAgICAgICAgICAgICAgICBuZXh0R3JvdXAuY2hpbGRyZW4ucHVzaChub2RlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRHcm91cCA9IG5leHRHcm91cDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy9yZW1vdmUgdGhlIHRlbXBvcmFyeSBtYXBcclxuICAgIGZvciAoaSA9IDA7IGkgPCBhbGxHcm91cHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBkZWxldGUgYWxsR3JvdXBzW2ldLmNoaWxkcmVuTWFwO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0b3BNb3N0R3JvdXAuY2hpbGRyZW47XHJcbn07XHJcblxyXG5Hcm91cENyZWF0b3IucHJvdG90eXBlLmlzRXhwYW5kZWQgPSBmdW5jdGlvbihleHBhbmRCeURlZmF1bHQsIGxldmVsKSB7XHJcbiAgICBpZiAodHlwZW9mIGV4cGFuZEJ5RGVmYXVsdCA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICByZXR1cm4gbGV2ZWwgPCBleHBhbmRCeURlZmF1bHQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBleHBhbmRCeURlZmF1bHQgPT09IHRydWUgfHwgZXhwYW5kQnlEZWZhdWx0ID09PSAndHJ1ZSc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBHcm91cENyZWF0b3IoKTtcclxuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG52YXIgU3ZnRmFjdG9yeSA9IHJlcXVpcmUoJy4vc3ZnRmFjdG9yeScpO1xyXG52YXIgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcclxuXHJcbnZhciBzdmdGYWN0b3J5ID0gbmV3IFN2Z0ZhY3RvcnkoKTtcclxuXHJcbmZ1bmN0aW9uIEhlYWRlclJlbmRlcmVyKCkge31cclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oZ3JpZE9wdGlvbnNXcmFwcGVyLCBjb2x1bW5Db250cm9sbGVyLCBjb2x1bW5Nb2RlbCwgZUdyaWQsIGFuZ3VsYXJHcmlkLCBmaWx0ZXJNYW5hZ2VyLCAkc2NvcGUsICRjb21waWxlKSB7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHRoaXMuY29sdW1uTW9kZWwgPSBjb2x1bW5Nb2RlbDtcclxuICAgIHRoaXMuY29sdW1uQ29udHJvbGxlciA9IGNvbHVtbkNvbnRyb2xsZXI7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkID0gYW5ndWxhckdyaWQ7XHJcbiAgICB0aGlzLmZpbHRlck1hbmFnZXIgPSBmaWx0ZXJNYW5hZ2VyO1xyXG4gICAgdGhpcy4kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLiRjb21waWxlID0gJGNvbXBpbGU7XHJcbiAgICB0aGlzLmZpbmRBbGxFbGVtZW50cyhlR3JpZCk7XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuZmluZEFsbEVsZW1lbnRzID0gZnVuY3Rpb24oZUdyaWQpIHtcclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyQ29udGFpbmVyID0gZUdyaWQucXVlcnlTZWxlY3RvcihcIi5hZy1oZWFkZXItY29udGFpbmVyXCIpO1xyXG4gICAgICAgIHRoaXMuZVJvb3QgPSBlR3JpZC5xdWVyeVNlbGVjdG9yKFwiLmFnLXJvb3RcIik7XHJcbiAgICAgICAgLy8gZm9yIG5vLXNjcm9sbCwgYWxsIGhlYWRlciBjZWxscyBsaXZlIGluIHRoZSBoZWFkZXIgY29udGFpbmVyICh0aGUgYWctaGVhZGVyIGRvZXNuJ3QgZXhpc3QpXHJcbiAgICAgICAgdGhpcy5lSGVhZGVyUGFyZW50ID0gdGhpcy5lSGVhZGVyQ29udGFpbmVyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVQaW5uZWRIZWFkZXIgPSBlR3JpZC5xdWVyeVNlbGVjdG9yKFwiLmFnLXBpbm5lZC1oZWFkZXJcIik7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyQ29udGFpbmVyID0gZUdyaWQucXVlcnlTZWxlY3RvcihcIi5hZy1oZWFkZXItY29udGFpbmVyXCIpO1xyXG4gICAgICAgIHRoaXMuZUhlYWRlciA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctaGVhZGVyXCIpO1xyXG4gICAgICAgIHRoaXMuZVJvb3QgPSBlR3JpZC5xdWVyeVNlbGVjdG9yKFwiLmFnLXJvb3RcIik7XHJcbiAgICAgICAgLy8gZm9yIHNjcm9sbCwgYWxsIGhlYWRlciBjZWxscyBsaXZlIGluIHRoZSBoZWFkZXIgKGNvbnRhaW5zIGJvdGggbm9ybWFsIGFuZCBwaW5uZWQgaGVhZGVycylcclxuICAgICAgICB0aGlzLmVIZWFkZXJQYXJlbnQgPSB0aGlzLmVIZWFkZXI7XHJcbiAgICB9XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUucmVmcmVzaEhlYWRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdXRpbHMucmVtb3ZlQWxsQ2hpbGRyZW4odGhpcy5lUGlubmVkSGVhZGVyKTtcclxuICAgIHV0aWxzLnJlbW92ZUFsbENoaWxkcmVuKHRoaXMuZUhlYWRlckNvbnRhaW5lcik7XHJcblxyXG4gICAgaWYgKHRoaXMuY2hpbGRTY29wZXMpIHtcclxuICAgICAgICB0aGlzLmNoaWxkU2NvcGVzLmZvckVhY2goZnVuY3Rpb24oY2hpbGRTY29wZSkge1xyXG4gICAgICAgICAgICBjaGlsZFNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmNoaWxkU2NvcGVzID0gW107XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBIZWFkZXJzKCkpIHtcclxuICAgICAgICB0aGlzLmluc2VydEhlYWRlcnNXaXRoR3JvdXBpbmcoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5pbnNlcnRIZWFkZXJzV2l0aG91dEdyb3VwaW5nKCk7XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmluc2VydEhlYWRlcnNXaXRoR3JvdXBpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBncm91cHMgPSB0aGlzLmNvbHVtbk1vZGVsLmdldENvbHVtbkdyb3VwcygpO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24oZ3JvdXApIHtcclxuICAgICAgICB2YXIgZUhlYWRlckNlbGwgPSB0aGF0LmNyZWF0ZUdyb3VwZWRIZWFkZXJDZWxsKGdyb3VwKTtcclxuICAgICAgICB2YXIgZUNvbnRhaW5lclRvQWRkVG8gPSBncm91cC5waW5uZWQgPyB0aGF0LmVQaW5uZWRIZWFkZXIgOiB0aGF0LmVIZWFkZXJDb250YWluZXI7XHJcbiAgICAgICAgZUNvbnRhaW5lclRvQWRkVG8uYXBwZW5kQ2hpbGQoZUhlYWRlckNlbGwpO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlR3JvdXBlZEhlYWRlckNlbGwgPSBmdW5jdGlvbihncm91cCkge1xyXG5cclxuICAgIHZhciBlSGVhZGVyR3JvdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGVIZWFkZXJHcm91cC5jbGFzc05hbWUgPSAnYWctaGVhZGVyLWdyb3VwJztcclxuXHJcbiAgICB2YXIgZUhlYWRlckdyb3VwQ2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZ3JvdXAuZUhlYWRlckdyb3VwQ2VsbCA9IGVIZWFkZXJHcm91cENlbGw7XHJcbiAgICB2YXIgY2xhc3NOYW1lcyA9IFsnYWctaGVhZGVyLWdyb3VwLWNlbGwnXTtcclxuICAgIC8vIGhhdmluZyBkaWZmZXJlbnQgY2xhc3NlcyBiZWxvdyBhbGxvd3MgdGhlIHN0eWxlIHRvIG5vdCBoYXZlIGEgYm90dG9tIGJvcmRlclxyXG4gICAgLy8gb24gdGhlIGdyb3VwIGhlYWRlciwgaWYgbm8gZ3JvdXAgaXMgc3BlY2lmaWVkXHJcbiAgICBpZiAoZ3JvdXAubmFtZSkge1xyXG4gICAgICAgIGNsYXNzTmFtZXMucHVzaCgnYWctaGVhZGVyLWdyb3VwLWNlbGwtd2l0aC1ncm91cCcpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjbGFzc05hbWVzLnB1c2goJ2FnLWhlYWRlci1ncm91cC1jZWxsLW5vLWdyb3VwJyk7XHJcbiAgICB9XHJcbiAgICBlSGVhZGVyR3JvdXBDZWxsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZXMuam9pbignICcpO1xyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0VuYWJsZUNvbFJlc2l6ZSgpKSB7XHJcbiAgICAgICAgdmFyIGVIZWFkZXJDZWxsUmVzaXplID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBlSGVhZGVyQ2VsbFJlc2l6ZS5jbGFzc05hbWUgPSBcImFnLWhlYWRlci1jZWxsLXJlc2l6ZVwiO1xyXG4gICAgICAgIGVIZWFkZXJHcm91cENlbGwuYXBwZW5kQ2hpbGQoZUhlYWRlckNlbGxSZXNpemUpO1xyXG4gICAgICAgIGdyb3VwLmVIZWFkZXJDZWxsUmVzaXplID0gZUhlYWRlckNlbGxSZXNpemU7XHJcbiAgICAgICAgdmFyIGRyYWdDYWxsYmFjayA9IHRoaXMuZ3JvdXBEcmFnQ2FsbGJhY2tGYWN0b3J5KGdyb3VwKTtcclxuICAgICAgICB0aGlzLmFkZERyYWdIYW5kbGVyKGVIZWFkZXJDZWxsUmVzaXplLCBkcmFnQ2FsbGJhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG5vIHJlbmRlcmVyLCBkZWZhdWx0IHRleHQgcmVuZGVyXHJcbiAgICB2YXIgZ3JvdXBOYW1lID0gZ3JvdXAubmFtZTtcclxuICAgIGlmIChncm91cE5hbWUgJiYgZ3JvdXBOYW1lICE9PSAnJykge1xyXG4gICAgICAgIHZhciBlR3JvdXBDZWxsTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGVHcm91cENlbGxMYWJlbC5jbGFzc05hbWUgPSAnYWctaGVhZGVyLWdyb3VwLWNlbGwtbGFiZWwnO1xyXG4gICAgICAgIGVIZWFkZXJHcm91cENlbGwuYXBwZW5kQ2hpbGQoZUdyb3VwQ2VsbExhYmVsKTtcclxuXHJcbiAgICAgICAgdmFyIGVJbm5lclRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgICAgICBlSW5uZXJUZXh0LmNsYXNzTmFtZSA9ICdhZy1oZWFkZXItZ3JvdXAtdGV4dCc7XHJcbiAgICAgICAgZUlubmVyVGV4dC5pbm5lckhUTUwgPSBncm91cE5hbWU7XHJcbiAgICAgICAgZUdyb3VwQ2VsbExhYmVsLmFwcGVuZENoaWxkKGVJbm5lclRleHQpO1xyXG5cclxuICAgICAgICBpZiAoZ3JvdXAuZXhwYW5kYWJsZSkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZEdyb3VwRXhwYW5kSWNvbihncm91cCwgZUdyb3VwQ2VsbExhYmVsLCBncm91cC5leHBhbmRlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZUhlYWRlckdyb3VwLmFwcGVuZENoaWxkKGVIZWFkZXJHcm91cENlbGwpO1xyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGdyb3VwLnZpc2libGVDb2x1bW5zLmZvckVhY2goZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICAgICAgdmFyIGVIZWFkZXJDZWxsID0gdGhhdC5jcmVhdGVIZWFkZXJDZWxsKGNvbHVtbiwgdHJ1ZSwgZ3JvdXApO1xyXG4gICAgICAgIGVIZWFkZXJHcm91cC5hcHBlbmRDaGlsZChlSGVhZGVyQ2VsbCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGF0LnNldFdpZHRoT2ZHcm91cEhlYWRlckNlbGwoZ3JvdXApO1xyXG5cclxuICAgIHJldHVybiBlSGVhZGVyR3JvdXA7XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuYWRkR3JvdXBFeHBhbmRJY29uID0gZnVuY3Rpb24oZ3JvdXAsIGVIZWFkZXJHcm91cCwgZXhwYW5kZWQpIHtcclxuICAgIHZhciBlR3JvdXBJY29uO1xyXG4gICAgaWYgKGV4cGFuZGVkKSB7XHJcbiAgICAgICAgZUdyb3VwSWNvbiA9IHV0aWxzLmNyZWF0ZUljb24oJ2NvbHVtbkdyb3VwT3BlbmVkJywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIG51bGwsIHN2Z0ZhY3RvcnkuY3JlYXRlQXJyb3dMZWZ0U3ZnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZUdyb3VwSWNvbiA9IHV0aWxzLmNyZWF0ZUljb24oJ2NvbHVtbkdyb3VwQ2xvc2VkJywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIG51bGwsIHN2Z0ZhY3RvcnkuY3JlYXRlQXJyb3dSaWdodFN2Zyk7XHJcbiAgICB9XHJcbiAgICBlR3JvdXBJY29uLmNsYXNzTmFtZSA9ICdhZy1oZWFkZXItZXhwYW5kLWljb24nO1xyXG4gICAgZUhlYWRlckdyb3VwLmFwcGVuZENoaWxkKGVHcm91cEljb24pO1xyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGVHcm91cEljb24ub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQuY29sdW1uQ29udHJvbGxlci5jb2x1bW5Hcm91cE9wZW5lZChncm91cCk7XHJcbiAgICB9O1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmFkZERyYWdIYW5kbGVyID0gZnVuY3Rpb24oZURyYWdnYWJsZUVsZW1lbnQsIGRyYWdDYWxsYmFjaykge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgZURyYWdnYWJsZUVsZW1lbnQub25tb3VzZWRvd24gPSBmdW5jdGlvbihkb3duRXZlbnQpIHtcclxuICAgICAgICBkcmFnQ2FsbGJhY2sub25EcmFnU3RhcnQoKTtcclxuICAgICAgICB0aGF0LmVSb290LnN0eWxlLmN1cnNvciA9IFwiY29sLXJlc2l6ZVwiO1xyXG4gICAgICAgIHRoYXQuZHJhZ1N0YXJ0WCA9IGRvd25FdmVudC5jbGllbnRYO1xyXG5cclxuICAgICAgICB0aGF0LmVSb290Lm9ubW91c2Vtb3ZlID0gZnVuY3Rpb24obW92ZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBuZXdYID0gbW92ZUV2ZW50LmNsaWVudFg7XHJcbiAgICAgICAgICAgIHZhciBjaGFuZ2UgPSBuZXdYIC0gdGhhdC5kcmFnU3RhcnRYO1xyXG4gICAgICAgICAgICBkcmFnQ2FsbGJhY2sub25EcmFnZ2luZyhjaGFuZ2UpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhhdC5lUm9vdC5vbm1vdXNldXAgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5zdG9wRHJhZ2dpbmcoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoYXQuZVJvb3Qub25tb3VzZWxlYXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc3RvcERyYWdnaW5nKCk7XHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuc2V0V2lkdGhPZkdyb3VwSGVhZGVyQ2VsbCA9IGZ1bmN0aW9uKGhlYWRlckdyb3VwKSB7XHJcbiAgICB2YXIgdG90YWxXaWR0aCA9IDA7XHJcbiAgICBoZWFkZXJHcm91cC52aXNpYmxlQ29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgICAgIHRvdGFsV2lkdGggKz0gY29sdW1uLmFjdHVhbFdpZHRoO1xyXG4gICAgfSk7XHJcbiAgICBoZWFkZXJHcm91cC5lSGVhZGVyR3JvdXBDZWxsLnN0eWxlLndpZHRoID0gdXRpbHMuZm9ybWF0V2lkdGgodG90YWxXaWR0aCk7XHJcbiAgICBoZWFkZXJHcm91cC5hY3R1YWxXaWR0aCA9IHRvdGFsV2lkdGg7XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuaW5zZXJ0SGVhZGVyc1dpdGhvdXRHcm91cGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGVQaW5uZWRIZWFkZXIgPSB0aGlzLmVQaW5uZWRIZWFkZXI7XHJcbiAgICB2YXIgZUhlYWRlckNvbnRhaW5lciA9IHRoaXMuZUhlYWRlckNvbnRhaW5lcjtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsLmdldFZpc2libGVDb2x1bW5zKCkuZm9yRWFjaChmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgICAgICAvLyBvbmx5IGluY2x1ZGUgdGhlIGZpcnN0IHggY29sc1xyXG4gICAgICAgIHZhciBoZWFkZXJDZWxsID0gdGhhdC5jcmVhdGVIZWFkZXJDZWxsKGNvbHVtbiwgZmFsc2UpO1xyXG4gICAgICAgIGlmIChjb2x1bW4ucGlubmVkKSB7XHJcbiAgICAgICAgICAgIGVQaW5uZWRIZWFkZXIuYXBwZW5kQ2hpbGQoaGVhZGVyQ2VsbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZUhlYWRlckNvbnRhaW5lci5hcHBlbmRDaGlsZChoZWFkZXJDZWxsKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVIZWFkZXJDZWxsID0gZnVuY3Rpb24oY29sdW1uLCBncm91cGVkLCBoZWFkZXJHcm91cCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcbiAgICB2YXIgZUhlYWRlckNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgLy8gc3RpY2sgdGhlIGhlYWRlciBjZWxsIGluIGNvbHVtbiwgYXMgd2UgYWNjZXNzIGl0IHdoZW4gZ3JvdXAgaXMgcmUtc2l6ZWRcclxuICAgIGNvbHVtbi5lSGVhZGVyQ2VsbCA9IGVIZWFkZXJDZWxsO1xyXG5cclxuICAgIHZhciBoZWFkZXJDZWxsQ2xhc3NlcyA9IFsnYWctaGVhZGVyLWNlbGwnXTtcclxuICAgIGlmIChncm91cGVkKSB7XHJcbiAgICAgICAgaGVhZGVyQ2VsbENsYXNzZXMucHVzaCgnYWctaGVhZGVyLWNlbGwtZ3JvdXBlZCcpOyAvLyB0aGlzIHRha2VzIDUwJSBoZWlnaHRcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaGVhZGVyQ2VsbENsYXNzZXMucHVzaCgnYWctaGVhZGVyLWNlbGwtbm90LWdyb3VwZWQnKTsgLy8gdGhpcyB0YWtlcyAxMDAlIGhlaWdodFxyXG4gICAgfVxyXG4gICAgZUhlYWRlckNlbGwuY2xhc3NOYW1lID0gaGVhZGVyQ2VsbENsYXNzZXMuam9pbignICcpO1xyXG5cclxuICAgIC8vIGFkZCB0b29sdGlwIGlmIGV4aXN0c1xyXG4gICAgaWYgKGNvbERlZi5oZWFkZXJUb29sdGlwKSB7XHJcbiAgICAgICAgZUhlYWRlckNlbGwudGl0bGUgPSBjb2xEZWYuaGVhZGVyVG9vbHRpcDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNFbmFibGVDb2xSZXNpemUoKSkge1xyXG4gICAgICAgIHZhciBoZWFkZXJDZWxsUmVzaXplID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBoZWFkZXJDZWxsUmVzaXplLmNsYXNzTmFtZSA9IFwiYWctaGVhZGVyLWNlbGwtcmVzaXplXCI7XHJcbiAgICAgICAgZUhlYWRlckNlbGwuYXBwZW5kQ2hpbGQoaGVhZGVyQ2VsbFJlc2l6ZSk7XHJcbiAgICAgICAgdmFyIGRyYWdDYWxsYmFjayA9IHRoaXMuaGVhZGVyRHJhZ0NhbGxiYWNrRmFjdG9yeShlSGVhZGVyQ2VsbCwgY29sdW1uLCBoZWFkZXJHcm91cCk7XHJcbiAgICAgICAgdGhpcy5hZGREcmFnSGFuZGxlcihoZWFkZXJDZWxsUmVzaXplLCBkcmFnQ2FsbGJhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGZpbHRlciBidXR0b25cclxuICAgIHZhciBzaG93TWVudSA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRW5hYmxlRmlsdGVyKCkgJiYgIWNvbERlZi5zdXBwcmVzc01lbnU7XHJcbiAgICBpZiAoc2hvd01lbnUpIHtcclxuICAgICAgICB2YXIgZU1lbnVCdXR0b24gPSB1dGlscy5jcmVhdGVJY29uKCdtZW51JywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbiwgc3ZnRmFjdG9yeS5jcmVhdGVNZW51U3ZnKTtcclxuICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhlTWVudUJ1dHRvbiwgJ2FnLWhlYWRlci1pY29uJyk7XHJcblxyXG4gICAgICAgIGVNZW51QnV0dG9uLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiYWctaGVhZGVyLWNlbGwtbWVudS1idXR0b25cIik7XHJcbiAgICAgICAgZU1lbnVCdXR0b24ub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LmZpbHRlck1hbmFnZXIuc2hvd0ZpbHRlcihjb2x1bW4sIHRoaXMpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgZUhlYWRlckNlbGwuYXBwZW5kQ2hpbGQoZU1lbnVCdXR0b24pO1xyXG4gICAgICAgIGVIZWFkZXJDZWxsLm9ubW91c2VlbnRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBlTWVudUJ1dHRvbi5zdHlsZS5vcGFjaXR5ID0gMTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGVIZWFkZXJDZWxsLm9ubW91c2VsZWF2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBlTWVudUJ1dHRvbi5zdHlsZS5vcGFjaXR5ID0gMDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGVNZW51QnV0dG9uLnN0eWxlLm9wYWNpdHkgPSAwO1xyXG4gICAgICAgIGVNZW51QnV0dG9uLnN0eWxlW1wiLXdlYmtpdC10cmFuc2l0aW9uXCJdID0gXCJvcGFjaXR5IDAuNXMsIGJvcmRlciAwLjJzXCI7XHJcbiAgICAgICAgZU1lbnVCdXR0b24uc3R5bGVbXCJ0cmFuc2l0aW9uXCJdID0gXCJvcGFjaXR5IDAuNXMsIGJvcmRlciAwLjJzXCI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbGFiZWwgZGl2XHJcbiAgICB2YXIgaGVhZGVyQ2VsbExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIGhlYWRlckNlbGxMYWJlbC5jbGFzc05hbWUgPSBcImFnLWhlYWRlci1jZWxsLWxhYmVsXCI7XHJcblxyXG4gICAgLy8gYWRkIGluIHNvcnQgaWNvbnNcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0VuYWJsZVNvcnRpbmcoKSAmJiAhY29sRGVmLnN1cHByZXNzU29ydGluZykge1xyXG4gICAgICAgIGNvbHVtbi5lU29ydEFzYyA9IHV0aWxzLmNyZWF0ZUljb24oJ3NvcnRBc2NlbmRpbmcnLCB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciwgY29sdW1uLCBzdmdGYWN0b3J5LmNyZWF0ZUFycm93VXBTdmcpO1xyXG4gICAgICAgIGNvbHVtbi5lU29ydERlc2MgPSB1dGlscy5jcmVhdGVJY29uKCdzb3J0RGVzY2VuZGluZycsIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLCBjb2x1bW4sIHN2Z0ZhY3RvcnkuY3JlYXRlQXJyb3dEb3duU3ZnKTtcclxuICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhjb2x1bW4uZVNvcnRBc2MsICdhZy1oZWFkZXItaWNvbicpO1xyXG4gICAgICAgIHV0aWxzLmFkZENzc0NsYXNzKGNvbHVtbi5lU29ydERlc2MsICdhZy1oZWFkZXItaWNvbicpO1xyXG4gICAgICAgIGhlYWRlckNlbGxMYWJlbC5hcHBlbmRDaGlsZChjb2x1bW4uZVNvcnRBc2MpO1xyXG4gICAgICAgIGhlYWRlckNlbGxMYWJlbC5hcHBlbmRDaGlsZChjb2x1bW4uZVNvcnREZXNjKTtcclxuICAgICAgICBjb2x1bW4uZVNvcnRBc2Muc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICBjb2x1bW4uZVNvcnREZXNjLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5hZGRTb3J0SGFuZGxpbmcoaGVhZGVyQ2VsbExhYmVsLCBjb2x1bW4pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFkZCBpbiBmaWx0ZXIgaWNvblxyXG4gICAgY29sdW1uLmVGaWx0ZXJJY29uID0gdXRpbHMuY3JlYXRlSWNvbignZmlsdGVyJywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbiwgc3ZnRmFjdG9yeS5jcmVhdGVGaWx0ZXJTdmcpO1xyXG4gICAgdXRpbHMuYWRkQ3NzQ2xhc3MoY29sdW1uLmVGaWx0ZXJJY29uLCAnYWctaGVhZGVyLWljb24nKTtcclxuICAgIGhlYWRlckNlbGxMYWJlbC5hcHBlbmRDaGlsZChjb2x1bW4uZUZpbHRlckljb24pO1xyXG5cclxuICAgIC8vIHJlbmRlciB0aGUgY2VsbCwgdXNlIGEgcmVuZGVyZXIgaWYgb25lIGlzIHByb3ZpZGVkXHJcbiAgICB2YXIgaGVhZGVyQ2VsbFJlbmRlcmVyO1xyXG4gICAgaWYgKGNvbERlZi5oZWFkZXJDZWxsUmVuZGVyZXIpIHsgLy8gZmlyc3QgbG9vayBmb3IgYSByZW5kZXJlciBpbiBjb2wgZGVmXHJcbiAgICAgICAgaGVhZGVyQ2VsbFJlbmRlcmVyID0gY29sRGVmLmhlYWRlckNlbGxSZW5kZXJlcjtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0SGVhZGVyQ2VsbFJlbmRlcmVyKCkpIHsgLy8gc2Vjb25kIGxvb2sgZm9yIG9uZSBpbiBncmlkIG9wdGlvbnNcclxuICAgICAgICBoZWFkZXJDZWxsUmVuZGVyZXIgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRIZWFkZXJDZWxsUmVuZGVyZXIoKTtcclxuICAgIH1cclxuICAgIGlmIChoZWFkZXJDZWxsUmVuZGVyZXIpIHtcclxuICAgICAgICAvLyByZW5kZXJlciBwcm92aWRlZCwgdXNlIGl0XHJcbiAgICAgICAgdmFyIG5ld0NoaWxkU2NvcGU7XHJcbiAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzQW5ndWxhckNvbXBpbGVIZWFkZXJzKCkpIHtcclxuICAgICAgICAgICAgbmV3Q2hpbGRTY29wZSA9IHRoaXMuJHNjb3BlLiRuZXcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGNlbGxSZW5kZXJlclBhcmFtcyA9IHtcclxuICAgICAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgICAgICRzY29wZTogbmV3Q2hpbGRTY29wZSxcclxuICAgICAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpLFxyXG4gICAgICAgICAgICBhcGk6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgY2VsbFJlbmRlcmVyUmVzdWx0ID0gaGVhZGVyQ2VsbFJlbmRlcmVyKGNlbGxSZW5kZXJlclBhcmFtcyk7XHJcbiAgICAgICAgdmFyIGNoaWxkVG9BcHBlbmQ7XHJcbiAgICAgICAgaWYgKHV0aWxzLmlzTm9kZU9yRWxlbWVudChjZWxsUmVuZGVyZXJSZXN1bHQpKSB7XHJcbiAgICAgICAgICAgIC8vIGEgZG9tIG5vZGUgb3IgZWxlbWVudCB3YXMgcmV0dXJuZWQsIHNvIGFkZCBjaGlsZFxyXG4gICAgICAgICAgICBjaGlsZFRvQXBwZW5kID0gY2VsbFJlbmRlcmVyUmVzdWx0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSBhc3N1bWUgaXQgd2FzIGh0bWwsIHNvIGp1c3QgaW5zZXJ0XHJcbiAgICAgICAgICAgIHZhciBlVGV4dFNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgICAgICAgICAgZVRleHRTcGFuLmlubmVySFRNTCA9IGNlbGxSZW5kZXJlclJlc3VsdDtcclxuICAgICAgICAgICAgY2hpbGRUb0FwcGVuZCA9IGVUZXh0U3BhbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gYW5ndWxhciBjb21waWxlIGhlYWRlciBpZiBvcHRpb24gaXMgdHVybmVkIG9uXHJcbiAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzQW5ndWxhckNvbXBpbGVIZWFkZXJzKCkpIHtcclxuICAgICAgICAgICAgbmV3Q2hpbGRTY29wZS5jb2xEZWYgPSBjb2xEZWY7XHJcbiAgICAgICAgICAgIG5ld0NoaWxkU2NvcGUuY29sSW5kZXggPSBjb2xEZWYuaW5kZXg7XHJcbiAgICAgICAgICAgIG5ld0NoaWxkU2NvcGUuY29sRGVmV3JhcHBlciA9IGNvbHVtbjtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZFNjb3Blcy5wdXNoKG5ld0NoaWxkU2NvcGUpO1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRUb0FwcGVuZENvbXBpbGVkID0gdGhpcy4kY29tcGlsZShjaGlsZFRvQXBwZW5kKShuZXdDaGlsZFNjb3BlKVswXTtcclxuICAgICAgICAgICAgaGVhZGVyQ2VsbExhYmVsLmFwcGVuZENoaWxkKGNoaWxkVG9BcHBlbmRDb21waWxlZCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGVhZGVyQ2VsbExhYmVsLmFwcGVuZENoaWxkKGNoaWxkVG9BcHBlbmQpO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gbm8gcmVuZGVyZXIsIGRlZmF1bHQgdGV4dCByZW5kZXJcclxuICAgICAgICB2YXIgZUlubmVyVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgICAgIGVJbm5lclRleHQuY2xhc3NOYW1lID0gJ2FnLWhlYWRlci1jZWxsLXRleHQnO1xyXG4gICAgICAgIGVJbm5lclRleHQuaW5uZXJIVE1MID0gY29sRGVmLmRpc3BsYXlOYW1lO1xyXG4gICAgICAgIGhlYWRlckNlbGxMYWJlbC5hcHBlbmRDaGlsZChlSW5uZXJUZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICBlSGVhZGVyQ2VsbC5hcHBlbmRDaGlsZChoZWFkZXJDZWxsTGFiZWwpO1xyXG4gICAgZUhlYWRlckNlbGwuc3R5bGUud2lkdGggPSB1dGlscy5mb3JtYXRXaWR0aChjb2x1bW4uYWN0dWFsV2lkdGgpO1xyXG5cclxuICAgIHJldHVybiBlSGVhZGVyQ2VsbDtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5hZGRTb3J0SGFuZGxpbmcgPSBmdW5jdGlvbihoZWFkZXJDZWxsTGFiZWwsIGNvbERlZldyYXBwZXIpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICBoZWFkZXJDZWxsTGFiZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGUpIHtcclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIHNvcnQgb24gY3VycmVudCBjb2xcclxuICAgICAgICBpZiAoY29sRGVmV3JhcHBlci5zb3J0ID09PSBjb25zdGFudHMuREVTQykge1xyXG4gICAgICAgICAgICBjb2xEZWZXcmFwcGVyLnNvcnQgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoY29sRGVmV3JhcHBlci5zb3J0ID09PSBjb25zdGFudHMuQVNDKSB7XHJcbiAgICAgICAgICAgICAgICBjb2xEZWZXcmFwcGVyLnNvcnQgPSBjb25zdGFudHMuREVTQztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbERlZldyYXBwZXIuc29ydCA9IGNvbnN0YW50cy5BU0M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gVXNlZnVsIGZvciBkZXRlcm1pbmluZyB0aGUgb3JkZXIgaW4gd2hpY2ggdGhlIHVzZXIgc29ydGVkIHRoZSBjb2x1bW5zOlxyXG4gICAgICAgICAgICBjb2xEZWZXcmFwcGVyLnNvcnRlZEF0ID0gbmV3IERhdGUoKS52YWx1ZU9mKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjbGVhciBzb3J0IG9uIGFsbCBjb2x1bW5zIGV4Y2VwdCB0aGlzIG9uZSwgYW5kIHVwZGF0ZSB0aGUgaWNvbnNcclxuICAgICAgICB0aGF0LmNvbHVtbk1vZGVsLmdldEFsbENvbHVtbnMoKS5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtblRvQ2xlYXIpIHtcclxuICAgICAgICAgICAgLy8gRG8gbm90IGNsZWFyIGlmIGVpdGhlciBob2xkaW5nIHNoaWZ0LCBvciBpZiBjb2x1bW4gaW4gcXVlc3Rpb24gd2FzIGNsaWNrZWRcclxuICAgICAgICAgICAgaWYgKCEoZS5zaGlmdEtleSB8fCBjb2x1bW5Ub0NsZWFyID09PSBjb2xEZWZXcmFwcGVyKSkge1xyXG4gICAgICAgICAgICAgICAgY29sdW1uVG9DbGVhci5zb3J0ID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gY2hlY2sgaW4gY2FzZSBubyBzb3J0aW5nIG9uIHRoaXMgcGFydGljdWxhciBjb2wsIGFzIHNvcnRpbmcgaXMgb3B0aW9uYWwgcGVyIGNvbFxyXG4gICAgICAgICAgICBpZiAoY29sdW1uVG9DbGVhci5jb2xEZWYuc3VwcHJlc3NTb3J0aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHVwZGF0ZSB2aXNpYmlsaXR5IG9mIGljb25zXHJcbiAgICAgICAgICAgIHZhciBzb3J0QXNjZW5kaW5nID0gY29sdW1uVG9DbGVhci5zb3J0ID09PSBjb25zdGFudHMuQVNDO1xyXG4gICAgICAgICAgICB2YXIgc29ydERlc2NlbmRpbmcgPSBjb2x1bW5Ub0NsZWFyLnNvcnQgPT09IGNvbnN0YW50cy5ERVNDO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNvbHVtblRvQ2xlYXIuZVNvcnRBc2MpIHtcclxuICAgICAgICAgICAgICAgIGNvbHVtblRvQ2xlYXIuZVNvcnRBc2Muc3R5bGUuZGlzcGxheSA9IHNvcnRBc2NlbmRpbmcgPyAnaW5saW5lJyA6ICdub25lJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY29sdW1uVG9DbGVhci5lU29ydERlc2MpIHtcclxuICAgICAgICAgICAgICAgIGNvbHVtblRvQ2xlYXIuZVNvcnREZXNjLnN0eWxlLmRpc3BsYXkgPSBzb3J0RGVzY2VuZGluZyA/ICdpbmxpbmUnIDogJ25vbmUnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoYXQuYW5ndWxhckdyaWQudXBkYXRlTW9kZWxBbmRSZWZyZXNoKGNvbnN0YW50cy5TVEVQX1NPUlQpO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuZ3JvdXBEcmFnQ2FsbGJhY2tGYWN0b3J5ID0gZnVuY3Rpb24oY3VycmVudEdyb3VwKSB7XHJcbiAgICB2YXIgcGFyZW50ID0gdGhpcztcclxuICAgIHZhciB2aXNpYmxlQ29sdW1ucyA9IGN1cnJlbnRHcm91cC52aXNpYmxlQ29sdW1ucztcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VwV2lkdGhTdGFydCA9IGN1cnJlbnRHcm91cC5hY3R1YWxXaWR0aDtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbldpZHRoU3RhcnRzID0gW107XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgdmlzaWJsZUNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbihjb2xEZWZXcmFwcGVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmNoaWxkcmVuV2lkdGhTdGFydHMucHVzaChjb2xEZWZXcmFwcGVyLmFjdHVhbFdpZHRoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMubWluV2lkdGggPSB2aXNpYmxlQ29sdW1ucy5sZW5ndGggKiBjb25zdGFudHMuTUlOX0NPTF9XSURUSDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRHJhZ2dpbmc6IGZ1bmN0aW9uKGRyYWdDaGFuZ2UpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBuZXdXaWR0aCA9IHRoaXMuZ3JvdXBXaWR0aFN0YXJ0ICsgZHJhZ0NoYW5nZTtcclxuICAgICAgICAgICAgaWYgKG5ld1dpZHRoIDwgdGhpcy5taW5XaWR0aCkge1xyXG4gICAgICAgICAgICAgICAgbmV3V2lkdGggPSB0aGlzLm1pbldpZHRoO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBzZXQgdGhlIG5ldyB3aWR0aCB0byB0aGUgZ3JvdXAgaGVhZGVyXHJcbiAgICAgICAgICAgIHZhciBuZXdXaWR0aFB4ID0gbmV3V2lkdGggKyBcInB4XCI7XHJcbiAgICAgICAgICAgIGN1cnJlbnRHcm91cC5lSGVhZGVyR3JvdXBDZWxsLnN0eWxlLndpZHRoID0gbmV3V2lkdGhQeDtcclxuICAgICAgICAgICAgY3VycmVudEdyb3VwLmFjdHVhbFdpZHRoID0gbmV3V2lkdGg7XHJcblxyXG4gICAgICAgICAgICAvLyBkaXN0cmlidXRlIHRoZSBuZXcgd2lkdGggdG8gdGhlIGNoaWxkIGhlYWRlcnNcclxuICAgICAgICAgICAgdmFyIGNoYW5nZVJhdGlvID0gbmV3V2lkdGggLyB0aGlzLmdyb3VwV2lkdGhTdGFydDtcclxuICAgICAgICAgICAgLy8ga2VlcCB0cmFjayBvZiBwaXhlbHMgdXNlZCwgYW5kIGxhc3QgY29sdW1uIGdldHMgdGhlIHJlbWFpbmluZyxcclxuICAgICAgICAgICAgLy8gdG8gY2F0ZXIgZm9yIHJvdW5kaW5nIGVycm9ycywgYW5kIG1pbiB3aWR0aCBhZGp1c3RtZW50c1xyXG4gICAgICAgICAgICB2YXIgcGl4ZWxzVG9EaXN0cmlidXRlID0gbmV3V2lkdGg7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgY3VycmVudEdyb3VwLnZpc2libGVDb2x1bW5zLmZvckVhY2goZnVuY3Rpb24oY29sRGVmV3JhcHBlciwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBub3RMYXN0Q29sID0gaW5kZXggIT09ICh2aXNpYmxlQ29sdW1ucy5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdDaGlsZFNpemU7XHJcbiAgICAgICAgICAgICAgICBpZiAobm90TGFzdENvbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIG5vdCB0aGUgbGFzdCBjb2wsIGNhbGN1bGF0ZSB0aGUgY29sdW1uIHdpZHRoIGFzIG5vcm1hbFxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGFydENoaWxkU2l6ZSA9IHRoYXQuY2hpbGRyZW5XaWR0aFN0YXJ0c1tpbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGRTaXplID0gc3RhcnRDaGlsZFNpemUgKiBjaGFuZ2VSYXRpbztcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGRTaXplIDwgY29uc3RhbnRzLk1JTl9DT0xfV0lEVEgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGRTaXplID0gY29uc3RhbnRzLk1JTl9DT0xfV0lEVEg7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHBpeGVsc1RvRGlzdHJpYnV0ZSAtPSBuZXdDaGlsZFNpemU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIGxhc3QgY29sLCBnaXZlIGl0IHRoZSByZW1haW5pbmcgcGl4ZWxzXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGRTaXplID0gcGl4ZWxzVG9EaXN0cmlidXRlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIGVIZWFkZXJDZWxsID0gdmlzaWJsZUNvbHVtbnNbaW5kZXhdLmVIZWFkZXJDZWxsO1xyXG4gICAgICAgICAgICAgICAgcGFyZW50LmFkanVzdENvbHVtbldpZHRoKG5ld0NoaWxkU2l6ZSwgY29sRGVmV3JhcHBlciwgZUhlYWRlckNlbGwpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIHNob3VsZCBub3QgYmUgY2FsbGluZyB0aGVzZSBoZXJlLCBzaG91bGQgZG8gc29tZXRoaW5nIGVsc2VcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRHcm91cC5waW5uZWQpIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5hbmd1bGFyR3JpZC51cGRhdGVQaW5uZWRDb2xDb250YWluZXJXaWR0aEFmdGVyQ29sUmVzaXplKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuYW5ndWxhckdyaWQudXBkYXRlQm9keUNvbnRhaW5lcldpZHRoQWZ0ZXJDb2xSZXNpemUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuYWRqdXN0Q29sdW1uV2lkdGggPSBmdW5jdGlvbihuZXdXaWR0aCwgY29sdW1uLCBlSGVhZGVyQ2VsbCkge1xyXG4gICAgdmFyIG5ld1dpZHRoUHggPSBuZXdXaWR0aCArIFwicHhcIjtcclxuICAgIHZhciBzZWxlY3RvckZvckFsbENvbHNJbkNlbGwgPSBcIi5jZWxsLWNvbC1cIiArIGNvbHVtbi5pbmRleDtcclxuICAgIHZhciBjZWxsc0ZvclRoaXNDb2wgPSB0aGlzLmVSb290LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JGb3JBbGxDb2xzSW5DZWxsKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2VsbHNGb3JUaGlzQ29sLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY2VsbHNGb3JUaGlzQ29sW2ldLnN0eWxlLndpZHRoID0gbmV3V2lkdGhQeDtcclxuICAgIH1cclxuXHJcbiAgICBlSGVhZGVyQ2VsbC5zdHlsZS53aWR0aCA9IG5ld1dpZHRoUHg7XHJcbiAgICBjb2x1bW4uYWN0dWFsV2lkdGggPSBuZXdXaWR0aDtcclxufTtcclxuXHJcbi8vIGdldHMgY2FsbGVkIHdoZW4gYSBoZWFkZXIgKG5vdCBhIGhlYWRlciBncm91cCkgZ2V0cyByZXNpemVkXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5oZWFkZXJEcmFnQ2FsbGJhY2tGYWN0b3J5ID0gZnVuY3Rpb24oaGVhZGVyQ2VsbCwgY29sdW1uLCBoZWFkZXJHcm91cCkge1xyXG4gICAgdmFyIHBhcmVudCA9IHRoaXM7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGFydFdpZHRoID0gY29sdW1uLmFjdHVhbFdpZHRoO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25EcmFnZ2luZzogZnVuY3Rpb24oZHJhZ0NoYW5nZSkge1xyXG4gICAgICAgICAgICB2YXIgbmV3V2lkdGggPSB0aGlzLnN0YXJ0V2lkdGggKyBkcmFnQ2hhbmdlO1xyXG4gICAgICAgICAgICBpZiAobmV3V2lkdGggPCBjb25zdGFudHMuTUlOX0NPTF9XSURUSCkge1xyXG4gICAgICAgICAgICAgICAgbmV3V2lkdGggPSBjb25zdGFudHMuTUlOX0NPTF9XSURUSDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcGFyZW50LmFkanVzdENvbHVtbldpZHRoKG5ld1dpZHRoLCBjb2x1bW4sIGhlYWRlckNlbGwpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGhlYWRlckdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuc2V0V2lkdGhPZkdyb3VwSGVhZGVyQ2VsbChoZWFkZXJHcm91cCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHNob3VsZCBub3QgYmUgY2FsbGluZyB0aGVzZSBoZXJlLCBzaG91bGQgZG8gc29tZXRoaW5nIGVsc2VcclxuICAgICAgICAgICAgaWYgKGNvbHVtbi5waW5uZWQpIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5hbmd1bGFyR3JpZC51cGRhdGVQaW5uZWRDb2xDb250YWluZXJXaWR0aEFmdGVyQ29sUmVzaXplKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuYW5ndWxhckdyaWQudXBkYXRlQm9keUNvbnRhaW5lcldpZHRoQWZ0ZXJDb2xSZXNpemUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuc3RvcERyYWdnaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVSb290LnN0eWxlLmN1cnNvciA9IFwiXCI7XHJcbiAgICB0aGlzLmVSb290Lm9ubW91c2V1cCA9IG51bGw7XHJcbiAgICB0aGlzLmVSb290Lm9ubW91c2VsZWF2ZSA9IG51bGw7XHJcbiAgICB0aGlzLmVSb290Lm9ubW91c2Vtb3ZlID0gbnVsbDtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS51cGRhdGVGaWx0ZXJJY29ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5jb2x1bW5Nb2RlbC5nZXRWaXNpYmxlQ29sdW1ucygpLmZvckVhY2goZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICAgICAgLy8gdG9kbzogbmVlZCB0byBjaGFuZ2UgdGhpcywgc28gb25seSB1cGRhdGVzIGlmIGNvbHVtbiBpcyB2aXNpYmxlXHJcbiAgICAgICAgaWYgKGNvbHVtbi5lRmlsdGVySWNvbikge1xyXG4gICAgICAgICAgICB2YXIgZmlsdGVyUHJlc2VudCA9IHRoYXQuZmlsdGVyTWFuYWdlci5pc0ZpbHRlclByZXNlbnRGb3JDb2woY29sdW1uLmNvbEtleSk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5U3R5bGUgPSBmaWx0ZXJQcmVzZW50ID8gJ2lubGluZScgOiAnbm9uZSc7XHJcbiAgICAgICAgICAgIGNvbHVtbi5lRmlsdGVySWNvbi5zdHlsZS5kaXNwbGF5ID0gZGlzcGxheVN0eWxlO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJSZW5kZXJlcjtcclxuIiwidmFyIGdyb3VwQ3JlYXRvciA9IHJlcXVpcmUoJy4vZ3JvdXBDcmVhdG9yJyk7XHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxudmFyIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XHJcblxyXG5mdW5jdGlvbiBJbk1lbW9yeVJvd0NvbnRyb2xsZXIoKSB7XHJcbiAgICB0aGlzLmNyZWF0ZU1vZGVsKCk7XHJcbn1cclxuXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGdyaWRPcHRpb25zV3JhcHBlciwgY29sdW1uTW9kZWwsIGFuZ3VsYXJHcmlkLCBmaWx0ZXJNYW5hZ2VyLCAkc2NvcGUsIGV4cHJlc3Npb25TZXJ2aWNlKSB7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHRoaXMuY29sdW1uTW9kZWwgPSBjb2x1bW5Nb2RlbDtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZDtcclxuICAgIHRoaXMuZmlsdGVyTWFuYWdlciA9IGZpbHRlck1hbmFnZXI7XHJcbiAgICB0aGlzLiRzY29wZSA9ICRzY29wZTtcclxuICAgIHRoaXMuZXhwcmVzc2lvblNlcnZpY2UgPSBleHByZXNzaW9uU2VydmljZTtcclxuXHJcbiAgICB0aGlzLmFsbFJvd3MgPSBudWxsO1xyXG4gICAgdGhpcy5yb3dzQWZ0ZXJHcm91cCA9IG51bGw7XHJcbiAgICB0aGlzLnJvd3NBZnRlckZpbHRlciA9IG51bGw7XHJcbiAgICB0aGlzLnJvd3NBZnRlclNvcnQgPSBudWxsO1xyXG4gICAgdGhpcy5yb3dzQWZ0ZXJNYXAgPSBudWxsO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmNyZWF0ZU1vZGVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB0aGlzLm1vZGVsID0ge1xyXG4gICAgICAgIC8vIHRoaXMgbWV0aG9kIGlzIGltcGxlbWVudGVkIGJ5IHRoZSBpbk1lbW9yeSBtb2RlbCBvbmx5LFxyXG4gICAgICAgIC8vIGl0IGdpdmVzIHRoZSB0b3AgbGV2ZWwgb2YgdGhlIHNlbGVjdGlvbi4gdXNlZCBieSB0aGUgc2VsZWN0aW9uXHJcbiAgICAgICAgLy8gY29udHJvbGxlciwgd2hlbiBpdCBuZWVkcyB0byBkbyBhIGZ1bGwgdHJhdmVyc2FsXHJcbiAgICAgICAgZ2V0VG9wTGV2ZWxOb2RlczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnJvd3NBZnRlckdyb3VwO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VmlydHVhbFJvdzogZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQucm93c0FmdGVyTWFwW2luZGV4XTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFZpcnR1YWxSb3dDb3VudDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGF0LnJvd3NBZnRlck1hcCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoYXQucm93c0FmdGVyTWFwLmxlbmd0aDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuXHJcbi8vIHB1YmxpY1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmdldE1vZGVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbDtcclxufTtcclxuXHJcbi8vIHB1YmxpY1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZU1vZGVsID0gZnVuY3Rpb24oc3RlcCkge1xyXG5cclxuICAgIC8vIGZhbGx0aHJvdWdoIGluIGJlbG93IHN3aXRjaCBpcyBvbiBwdXJwb3NlXHJcbiAgICBzd2l0Y2ggKHN0ZXApIHtcclxuICAgICAgICBjYXNlIGNvbnN0YW50cy5TVEVQX0VWRVJZVEhJTkc6XHJcbiAgICAgICAgICAgIHRoaXMuZG9Hcm91cGluZygpO1xyXG4gICAgICAgIGNhc2UgY29uc3RhbnRzLlNURVBfRklMVEVSOlxyXG4gICAgICAgICAgICB0aGlzLmRvRmlsdGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZG9BZ2dyZWdhdGUoKTtcclxuICAgICAgICBjYXNlIGNvbnN0YW50cy5TVEVQX1NPUlQ6XHJcbiAgICAgICAgICAgIHRoaXMuZG9Tb3J0KCk7XHJcbiAgICAgICAgY2FzZSBjb25zdGFudHMuU1RFUF9NQVA6XHJcbiAgICAgICAgICAgIHRoaXMuZG9Hcm91cE1hcHBpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldE1vZGVsVXBkYXRlZCgpID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0TW9kZWxVcGRhdGVkKCkoKTtcclxuICAgICAgICB2YXIgJHNjb3BlID0gdGhpcy4kc2NvcGU7XHJcbiAgICAgICAgaWYgKCRzY29wZSkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24oZGF0YSwgY29sRGVmLCBub2RlLCByb3dJbmRleCkge1xyXG4gICAgdmFyIGFwaSA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpO1xyXG4gICAgdmFyIGNvbnRleHQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCk7XHJcbiAgICByZXR1cm4gdXRpbHMuZ2V0VmFsdWUodGhpcy5leHByZXNzaW9uU2VydmljZSwgZGF0YSwgY29sRGVmLCBub2RlLCByb3dJbmRleCwgYXBpLCBjb250ZXh0KTtcclxufTtcclxuXHJcbi8vIHB1YmxpYyAtIGl0J3MgcG9zc2libGUgdG8gcmVjb21wdXRlIHRoZSBhZ2dyZWdhdGUgd2l0aG91dCBkb2luZyB0aGUgb3RoZXIgcGFydHNcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5kb0FnZ3JlZ2F0ZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBncm91cEFnZ0Z1bmN0aW9uID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0R3JvdXBBZ2dGdW5jdGlvbigpO1xyXG4gICAgaWYgKHR5cGVvZiBncm91cEFnZ0Z1bmN0aW9uICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmVjdXJzaXZlbHlDcmVhdGVBZ2dEYXRhKHRoaXMucm93c0FmdGVyRmlsdGVyLCBncm91cEFnZ0Z1bmN0aW9uKTtcclxufTtcclxuXHJcbi8vIHB1YmxpY1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmV4cGFuZE9yQ29sbGFwc2VBbGwgPSBmdW5jdGlvbihleHBhbmQsIHJvd05vZGVzKSB7XHJcbiAgICAvLyBpZiBmaXJzdCBjYWxsIGluIHJlY3Vyc2lvbiwgd2Ugc2V0IGxpc3QgdG8gcGFyZW50IGxpc3RcclxuICAgIGlmIChyb3dOb2RlcyA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJvd05vZGVzID0gdGhpcy5yb3dzQWZ0ZXJHcm91cDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXJvd05vZGVzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICByb3dOb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgICAgICBpZiAobm9kZS5ncm91cCkge1xyXG4gICAgICAgICAgICBub2RlLmV4cGFuZGVkID0gZXhwYW5kO1xyXG4gICAgICAgICAgICBfdGhpcy5leHBhbmRPckNvbGxhcHNlQWxsKGV4cGFuZCwgbm9kZS5jaGlsZHJlbik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlDcmVhdGVBZ2dEYXRhID0gZnVuY3Rpb24obm9kZXMsIGdyb3VwQWdnRnVuY3Rpb24pIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbm9kZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICBpZiAobm9kZS5ncm91cCkge1xyXG4gICAgICAgICAgICAvLyBhZ2cgZnVuY3Rpb24gbmVlZHMgdG8gc3RhcnQgYXQgdGhlIGJvdHRvbSwgc28gdHJhdmVyc2UgZmlyc3RcclxuICAgICAgICAgICAgdGhpcy5yZWN1cnNpdmVseUNyZWF0ZUFnZ0RhdGEobm9kZS5jaGlsZHJlbkFmdGVyRmlsdGVyLCBncm91cEFnZ0Z1bmN0aW9uKTtcclxuICAgICAgICAgICAgLy8gYWZ0ZXIgdHJhdmVyc2FsLCB3ZSBjYW4gbm93IGRvIHRoZSBhZ2cgYXQgdGhpcyBsZXZlbFxyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IGdyb3VwQWdnRnVuY3Rpb24obm9kZS5jaGlsZHJlbkFmdGVyRmlsdGVyKTtcclxuICAgICAgICAgICAgbm9kZS5kYXRhID0gZGF0YTtcclxuICAgICAgICAgICAgLy8gaWYgd2UgYXJlIGdyb3VwaW5nLCB0aGVuIGl0J3MgcG9zc2libGUgdGhlcmUgaXMgYSBzaWJsaW5nIGZvb3RlclxyXG4gICAgICAgICAgICAvLyB0byB0aGUgZ3JvdXAsIHNvIHVwZGF0ZSB0aGUgZGF0YSBoZXJlIGFsc28gaWYgdGhlcmUgaXMgb25lXHJcbiAgICAgICAgICAgIGlmIChub2RlLnNpYmxpbmcpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUuc2libGluZy5kYXRhID0gZGF0YTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5kb1NvcnQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vc2VlIGlmIHRoZXJlIGlzIGEgY29sIHdlIGFyZSBzb3J0aW5nIGJ5XHJcbiAgICB2YXIgc29ydGluZ09wdGlvbnMgPSBbXTtcclxuICAgIHRoaXMuY29sdW1uTW9kZWwuZ2V0QWxsQ29sdW1ucygpLmZvckVhY2goZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICAgICAgaWYgKGNvbHVtbi5zb3J0KSB7XHJcbiAgICAgICAgICAgIHZhciBhc2NlbmRpbmcgPSBjb2x1bW4uc29ydCA9PT0gY29uc3RhbnRzLkFTQztcclxuICAgICAgICAgICAgc29ydGluZ09wdGlvbnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBpbnZlcnRlcjogYXNjZW5kaW5nID8gMSA6IC0xLFxyXG4gICAgICAgICAgICAgICAgc29ydGVkQXQ6IGNvbHVtbi5zb3J0ZWRBdCxcclxuICAgICAgICAgICAgICAgIGNvbERlZjogY29sdW1uLmNvbERlZlxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaGUgY29sdW1ucyBhcmUgdG8gYmUgc29ydGVkIGluIHRoZSBvcmRlciB0aGF0IHRoZSB1c2VyIHNlbGVjdGVkIHRoZW06XHJcbiAgICBzb3J0aW5nT3B0aW9ucy5zb3J0KGZ1bmN0aW9uKG9wdGlvbkEsIG9wdGlvbkIpe1xyXG4gICAgICAgIHJldHVybiBvcHRpb25BLnNvcnRlZEF0IC0gb3B0aW9uQi5zb3J0ZWRBdDtcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciByb3dOb2Rlc0JlZm9yZVNvcnQgPSB0aGlzLnJvd3NBZnRlckZpbHRlci5zbGljZSgwKTtcclxuXHJcbiAgICBpZiAoc29ydGluZ09wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5zb3J0TGlzdChyb3dOb2Rlc0JlZm9yZVNvcnQsIHNvcnRpbmdPcHRpb25zKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gaWYgbm8gc29ydGluZywgc2V0IGFsbCBncm91cCBjaGlsZHJlbiBhZnRlciBzb3J0IHRvIHRoZSBvcmlnaW5hbCBsaXN0XHJcbiAgICAgICAgdGhpcy5yZWN1cnNpdmVseVJlc2V0U29ydChyb3dOb2Rlc0JlZm9yZVNvcnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucm93c0FmdGVyU29ydCA9IHJvd05vZGVzQmVmb3JlU29ydDtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5yZWN1cnNpdmVseVJlc2V0U29ydCA9IGZ1bmN0aW9uKHJvd05vZGVzKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHJvd05vZGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHZhciBpdGVtID0gcm93Tm9kZXNbaV07XHJcbiAgICAgICAgaWYgKGl0ZW0uZ3JvdXAgJiYgaXRlbS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICBpdGVtLmNoaWxkcmVuQWZ0ZXJTb3J0ID0gaXRlbS5jaGlsZHJlbkFmdGVyRmlsdGVyO1xyXG4gICAgICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5UmVzZXRTb3J0KGl0ZW0uY2hpbGRyZW4pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5zb3J0TGlzdCA9IGZ1bmN0aW9uKG5vZGVzLCBzb3J0T3B0aW9ucykge1xyXG5cclxuICAgIC8vIHNvcnQgYW55IGdyb3VwcyByZWN1cnNpdmVseVxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBub2Rlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgLy8gY3JpdGljYWwgc2VjdGlvbiwgbm8gZnVuY3Rpb25hbCBwcm9ncmFtbWluZ1xyXG4gICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXAgJiYgbm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuQWZ0ZXJTb3J0ID0gbm9kZS5jaGlsZHJlbkFmdGVyRmlsdGVyLnNsaWNlKDApO1xyXG4gICAgICAgICAgICB0aGlzLnNvcnRMaXN0KG5vZGUuY2hpbGRyZW5BZnRlclNvcnQsIHNvcnRPcHRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgZnVuY3Rpb24gY29tcGFyZShvYmpBLCBvYmpCLCBjb2xEZWYpe1xyXG4gICAgICAgIHZhciB2YWx1ZUEgPSB0aGF0LmdldFZhbHVlKG9iakEuZGF0YSwgY29sRGVmLCBvYmpBKTtcclxuICAgICAgICB2YXIgdmFsdWVCID0gdGhhdC5nZXRWYWx1ZShvYmpCLmRhdGEsIGNvbERlZiwgb2JqQik7XHJcbiAgICAgICAgaWYgKGNvbERlZi5jb21wYXJhdG9yKSB7XHJcbiAgICAgICAgICAgIC8vaWYgY29tcGFyYXRvciBwcm92aWRlZCwgdXNlIGl0XHJcbiAgICAgICAgICAgIHJldHVybiBjb2xEZWYuY29tcGFyYXRvcih2YWx1ZUEsIHZhbHVlQiwgb2JqQSwgb2JqQik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy9vdGhlcndpc2UgZG8gb3VyIG93biBjb21wYXJpc29uXHJcbiAgICAgICAgICAgIHJldHVybiB1dGlscy5kZWZhdWx0Q29tcGFyYXRvcih2YWx1ZUEsIHZhbHVlQiwgb2JqQSwgb2JqQik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5vZGVzLnNvcnQoZnVuY3Rpb24ob2JqQSwgb2JqQikge1xyXG4gICAgICAgIC8vIEl0ZXJhdGUgY29sdW1ucywgcmV0dXJuIHRoZSBmaXJzdCB0aGF0IGRvZXNuJ3QgbWF0Y2hcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gc29ydE9wdGlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHNvcnRPcHRpb24gPSBzb3J0T3B0aW9uc1tpXTtcclxuICAgICAgICAgICAgdmFyIGNvbXBhcmVkID0gY29tcGFyZShvYmpBLCBvYmpCLCBzb3J0T3B0aW9uLmNvbERlZik7XHJcbiAgICAgICAgICAgIGlmIChjb21wYXJlZCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBhcmVkICogc29ydE9wdGlvbi5pbnZlcnRlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBBbGwgbWF0Y2hlZCwgdGhlc2UgYXJlIGlkZW50aWNhbCBhcyBmYXIgYXMgdGhlIHNvcnQgaXMgY29uY2VybmVkOlxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZG9Hcm91cGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHJvd3NBZnRlckdyb3VwO1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9JbnRlcm5hbEdyb3VwaW5nKCkpIHtcclxuICAgICAgICB2YXIgZXhwYW5kQnlEZWZhdWx0ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0R3JvdXBEZWZhdWx0RXhwYW5kZWQoKTtcclxuICAgICAgICByb3dzQWZ0ZXJHcm91cCA9IGdyb3VwQ3JlYXRvci5ncm91cCh0aGlzLmFsbFJvd3MsIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEdyb3VwS2V5cygpLFxyXG4gICAgICAgICAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcm91cEFnZ0Z1bmN0aW9uKCksIGV4cGFuZEJ5RGVmYXVsdCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJvd3NBZnRlckdyb3VwID0gdGhpcy5hbGxSb3dzO1xyXG4gICAgfVxyXG4gICAgdGhpcy5yb3dzQWZ0ZXJHcm91cCA9IHJvd3NBZnRlckdyb3VwO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcXVpY2tGaWx0ZXJQcmVzZW50ID0gdGhpcy5hbmd1bGFyR3JpZC5nZXRRdWlja0ZpbHRlcigpICE9PSBudWxsO1xyXG4gICAgdmFyIGFkdmFuY2VkRmlsdGVyUHJlc2VudCA9IHRoaXMuZmlsdGVyTWFuYWdlci5pc0ZpbHRlclByZXNlbnQoKTtcclxuICAgIHZhciBmaWx0ZXJQcmVzZW50ID0gcXVpY2tGaWx0ZXJQcmVzZW50IHx8IGFkdmFuY2VkRmlsdGVyUHJlc2VudDtcclxuXHJcbiAgICB2YXIgcm93c0FmdGVyRmlsdGVyO1xyXG4gICAgaWYgKGZpbHRlclByZXNlbnQpIHtcclxuICAgICAgICByb3dzQWZ0ZXJGaWx0ZXIgPSB0aGlzLmZpbHRlckl0ZW1zKHRoaXMucm93c0FmdGVyR3JvdXAsIHF1aWNrRmlsdGVyUHJlc2VudCwgYWR2YW5jZWRGaWx0ZXJQcmVzZW50KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gZG8gaXQgaGVyZVxyXG4gICAgICAgIHJvd3NBZnRlckZpbHRlciA9IHRoaXMucm93c0FmdGVyR3JvdXA7XHJcbiAgICAgICAgdGhpcy5yZWN1cnNpdmVseVJlc2V0RmlsdGVyKHRoaXMucm93c0FmdGVyR3JvdXApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5yb3dzQWZ0ZXJGaWx0ZXIgPSByb3dzQWZ0ZXJGaWx0ZXI7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZmlsdGVySXRlbXMgPSBmdW5jdGlvbihyb3dOb2RlcywgcXVpY2tGaWx0ZXJQcmVzZW50LCBhZHZhbmNlZEZpbHRlclByZXNlbnQpIHtcclxuICAgIHZhciByZXN1bHQgPSBbXTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHJvd05vZGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gcm93Tm9kZXNbaV07XHJcblxyXG4gICAgICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIC8vIGRlYWwgd2l0aCBncm91cFxyXG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuQWZ0ZXJGaWx0ZXIgPSB0aGlzLmZpbHRlckl0ZW1zKG5vZGUuY2hpbGRyZW4sIHF1aWNrRmlsdGVyUHJlc2VudCwgYWR2YW5jZWRGaWx0ZXJQcmVzZW50KTtcclxuICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW5BZnRlckZpbHRlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLmFsbENoaWxkcmVuQ291bnQgPSB0aGlzLmdldFRvdGFsQ2hpbGRDb3VudChub2RlLmNoaWxkcmVuQWZ0ZXJGaWx0ZXIpO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kb2VzUm93UGFzc0ZpbHRlcihub2RlLCBxdWlja0ZpbHRlclByZXNlbnQsIGFkdmFuY2VkRmlsdGVyUHJlc2VudCkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlSZXNldEZpbHRlciA9IGZ1bmN0aW9uKG5vZGVzKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG5vZGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXAgJiYgbm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuQWZ0ZXJGaWx0ZXIgPSBub2RlLmNoaWxkcmVuO1xyXG4gICAgICAgICAgICBub2RlLmFsbENoaWxkcmVuQ291bnQgPSB0aGlzLmdldFRvdGFsQ2hpbGRDb3VudChub2RlLmNoaWxkcmVuQWZ0ZXJGaWx0ZXIpO1xyXG4gICAgICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5UmVzZXRGaWx0ZXIobm9kZS5jaGlsZHJlbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyByb3dzOiB0aGUgcm93cyB0byBwdXQgaW50byB0aGUgbW9kZWxcclxuLy8gZmlyc3RJZDogdGhlIGZpcnN0IGlkIHRvIHVzZSwgdXNlZCBmb3IgcGFnaW5nLCB3aGVyZSB3ZSBhcmUgbm90IG9uIHRoZSBmaXJzdCBwYWdlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuc2V0QWxsUm93cyA9IGZ1bmN0aW9uKHJvd3MsIGZpcnN0SWQpIHtcclxuICAgIHZhciBub2RlcztcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc1Jvd3NBbHJlYWR5R3JvdXBlZCgpKSB7XHJcbiAgICAgICAgbm9kZXMgPSByb3dzO1xyXG4gICAgICAgIHRoaXMucmVjdXJzaXZlbHlDaGVja1VzZXJQcm92aWRlZE5vZGVzKG5vZGVzLCBudWxsLCAwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gcGxhY2UgZWFjaCByb3cgaW50byBhIHdyYXBwZXJcclxuICAgICAgICB2YXIgbm9kZXMgPSBbXTtcclxuICAgICAgICBpZiAocm93cykge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvd3MubGVuZ3RoOyBpKyspIHsgLy8gY291bGQgYmUgbG90cyBvZiByb3dzLCBkb24ndCB1c2UgZnVuY3Rpb25hbCBwcm9ncmFtbWluZ1xyXG4gICAgICAgICAgICAgICAgbm9kZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcm93c1tpXVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgZmlyc3RJZCBwcm92aWRlZCwgdXNlIGl0LCBvdGhlcndpc2Ugc3RhcnQgYXQgMFxyXG4gICAgdmFyIGZpcnN0SWRUb1VzZSA9IGZpcnN0SWQgPyBmaXJzdElkIDogMDtcclxuICAgIHRoaXMucmVjdXJzaXZlbHlBZGRJZFRvTm9kZXMobm9kZXMsIGZpcnN0SWRUb1VzZSk7XHJcbiAgICB0aGlzLmFsbFJvd3MgPSBub2RlcztcclxufTtcclxuXHJcbi8vIGFkZCBpbiBpbmRleCAtIHRoaXMgaXMgdXNlZCBieSB0aGUgc2VsZWN0aW9uQ29udHJvbGxlciAtIHNvIHF1aWNrXHJcbi8vIHRvIGxvb2sgdXAgc2VsZWN0ZWQgcm93c1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnJlY3Vyc2l2ZWx5QWRkSWRUb05vZGVzID0gZnVuY3Rpb24obm9kZXMsIGluZGV4KSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICBub2RlLmlkID0gaW5kZXgrKztcclxuICAgICAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgIGluZGV4ID0gdGhpcy5yZWN1cnNpdmVseUFkZElkVG9Ob2Rlcyhub2RlLmNoaWxkcmVuLCBpbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGluZGV4O1xyXG59O1xyXG5cclxuLy8gYWRkIGluIGluZGV4IC0gdGhpcyBpcyB1c2VkIGJ5IHRoZSBzZWxlY3Rpb25Db250cm9sbGVyIC0gc28gcXVpY2tcclxuLy8gdG8gbG9vayB1cCBzZWxlY3RlZCByb3dzXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlDaGVja1VzZXJQcm92aWRlZE5vZGVzID0gZnVuY3Rpb24obm9kZXMsIHBhcmVudCwgbGV2ZWwpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldO1xyXG4gICAgICAgIGlmIChwYXJlbnQpIHtcclxuICAgICAgICAgICAgbm9kZS5wYXJlbnQgPSBwYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5vZGUubGV2ZWwgPSBsZXZlbDtcclxuICAgICAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVjdXJzaXZlbHlDaGVja1VzZXJQcm92aWRlZE5vZGVzKG5vZGUuY2hpbGRyZW4sIG5vZGUsIGxldmVsICsgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmdldFRvdGFsQ2hpbGRDb3VudCA9IGZ1bmN0aW9uKHJvd05vZGVzKSB7XHJcbiAgICB2YXIgY291bnQgPSAwO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSByb3dOb2Rlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICB2YXIgaXRlbSA9IHJvd05vZGVzW2ldO1xyXG4gICAgICAgIGlmIChpdGVtLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIGNvdW50ICs9IGl0ZW0uYWxsQ2hpbGRyZW5Db3VudDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBjb3VudDtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5jb3B5R3JvdXBOb2RlID0gZnVuY3Rpb24oZ3JvdXBOb2RlLCBjaGlsZHJlbiwgYWxsQ2hpbGRyZW5Db3VudCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBncm91cDogdHJ1ZSxcclxuICAgICAgICBkYXRhOiBncm91cE5vZGUuZGF0YSxcclxuICAgICAgICBmaWVsZDogZ3JvdXBOb2RlLmZpZWxkLFxyXG4gICAgICAgIGtleTogZ3JvdXBOb2RlLmtleSxcclxuICAgICAgICBleHBhbmRlZDogZ3JvdXBOb2RlLmV4cGFuZGVkLFxyXG4gICAgICAgIGNoaWxkcmVuOiBjaGlsZHJlbixcclxuICAgICAgICBhbGxDaGlsZHJlbkNvdW50OiBhbGxDaGlsZHJlbkNvdW50LFxyXG4gICAgICAgIGxldmVsOiBncm91cE5vZGUubGV2ZWxcclxuICAgIH07XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZG9Hcm91cE1hcHBpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGV2ZW4gaWYgbm90IGdvaW5nIGdyb3VwaW5nLCB3ZSBkbyB0aGUgbWFwcGluZywgYXMgdGhlIGNsaWVudCBtaWdodFxyXG4gICAgLy8gb2YgcGFzc2VkIGluIGRhdGEgdGhhdCBhbHJlYWR5IGhhcyBhIGdyb3VwaW5nIGluIGl0IHNvbWV3aGVyZVxyXG4gICAgdmFyIHJvd3NBZnRlck1hcCA9IFtdO1xyXG4gICAgdGhpcy5hZGRUb01hcChyb3dzQWZ0ZXJNYXAsIHRoaXMucm93c0FmdGVyU29ydCk7XHJcbiAgICB0aGlzLnJvd3NBZnRlck1hcCA9IHJvd3NBZnRlck1hcDtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5hZGRUb01hcCA9IGZ1bmN0aW9uKG1hcHBlZERhdGEsIG9yaWdpbmFsTm9kZXMpIHtcclxuICAgIGlmICghb3JpZ2luYWxOb2Rlcykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3JpZ2luYWxOb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gb3JpZ2luYWxOb2Rlc1tpXTtcclxuICAgICAgICBtYXBwZWREYXRhLnB1c2gobm9kZSk7XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXAgJiYgbm9kZS5leHBhbmRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZFRvTWFwKG1hcHBlZERhdGEsIG5vZGUuY2hpbGRyZW5BZnRlclNvcnQpO1xyXG5cclxuICAgICAgICAgICAgLy8gcHV0IGEgZm9vdGVyIGluIGlmIHVzZXIgaXMgbG9va2luZyBmb3IgaXRcclxuICAgICAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBJbmNsdWRlRm9vdGVyKCkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBmb290ZXJOb2RlID0gdGhpcy5jcmVhdGVGb290ZXJOb2RlKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgbWFwcGVkRGF0YS5wdXNoKGZvb3Rlck5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmNyZWF0ZUZvb3Rlck5vZGUgPSBmdW5jdGlvbihncm91cE5vZGUpIHtcclxuICAgIHZhciBmb290ZXJOb2RlID0ge307XHJcbiAgICBPYmplY3Qua2V5cyhncm91cE5vZGUpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgZm9vdGVyTm9kZVtrZXldID0gZ3JvdXBOb2RlW2tleV07XHJcbiAgICB9KTtcclxuICAgIGZvb3Rlck5vZGUuZm9vdGVyID0gdHJ1ZTtcclxuICAgIC8vIGdldCBib3RoIGhlYWRlciBhbmQgZm9vdGVyIHRvIHJlZmVyZW5jZSBlYWNoIG90aGVyIGFzIHNpYmxpbmdzLiB0aGlzIGlzIG5ldmVyIHVuZG9uZSxcclxuICAgIC8vIG9ubHkgb3ZlcndyaXR0ZW4uIHNvIGlmIGEgZ3JvdXAgaXMgZXhwYW5kZWQsIHRoZW4gY29udHJhY3RlZCwgaXQgd2lsbCBoYXZlIGEgZ2hvc3RcclxuICAgIC8vIHNpYmxpbmcgLSBidXQgdGhhdCdzIGZpbmUsIGFzIHdlIGNhbiBpZ25vcmUgdGhpcyBpZiB0aGUgaGVhZGVyIGlzIGNvbnRyYWN0ZWQuXHJcbiAgICBmb290ZXJOb2RlLnNpYmxpbmcgPSBncm91cE5vZGU7XHJcbiAgICBncm91cE5vZGUuc2libGluZyA9IGZvb3Rlck5vZGU7XHJcbiAgICByZXR1cm4gZm9vdGVyTm9kZTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5kb2VzUm93UGFzc0ZpbHRlciA9IGZ1bmN0aW9uKG5vZGUsIHF1aWNrRmlsdGVyUHJlc2VudCwgYWR2YW5jZWRGaWx0ZXJQcmVzZW50KSB7XHJcbiAgICAvL2ZpcnN0IHVwLCBjaGVjayBxdWljayBmaWx0ZXJcclxuICAgIGlmIChxdWlja0ZpbHRlclByZXNlbnQpIHtcclxuICAgICAgICBpZiAoIW5vZGUucXVpY2tGaWx0ZXJBZ2dyZWdhdGVUZXh0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWdncmVnYXRlUm93Rm9yUXVpY2tGaWx0ZXIobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChub2RlLnF1aWNrRmlsdGVyQWdncmVnYXRlVGV4dC5pbmRleE9mKHRoaXMuYW5ndWxhckdyaWQuZ2V0UXVpY2tGaWx0ZXIoKSkgPCAwKSB7XHJcbiAgICAgICAgICAgIC8vcXVpY2sgZmlsdGVyIGZhaWxzLCBzbyBza2lwIGl0ZW1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL3NlY29uZCwgY2hlY2sgYWR2YW5jZWQgZmlsdGVyXHJcbiAgICBpZiAoYWR2YW5jZWRGaWx0ZXJQcmVzZW50KSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmZpbHRlck1hbmFnZXIuZG9lc0ZpbHRlclBhc3Mobm9kZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL2dvdCB0aGlzIGZhciwgYWxsIGZpbHRlcnMgcGFzc1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuYWdncmVnYXRlUm93Rm9yUXVpY2tGaWx0ZXIgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICB2YXIgYWdncmVnYXRlZFRleHQgPSAnJztcclxuICAgIHRoaXMuY29sdW1uTW9kZWwuZ2V0QWxsQ29sdW1ucygpLmZvckVhY2goZnVuY3Rpb24oY29sRGVmV3JhcHBlcikge1xyXG4gICAgICAgIHZhciBkYXRhID0gbm9kZS5kYXRhO1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IGRhdGEgPyBkYXRhW2NvbERlZldyYXBwZXIuY29sRGVmLmZpZWxkXSA6IG51bGw7XHJcbiAgICAgICAgaWYgKHZhbHVlICYmIHZhbHVlICE9PSAnJykge1xyXG4gICAgICAgICAgICBhZ2dyZWdhdGVkVGV4dCA9IGFnZ3JlZ2F0ZWRUZXh0ICsgdmFsdWUudG9TdHJpbmcoKS50b1VwcGVyQ2FzZSgpICsgXCJfXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBub2RlLnF1aWNrRmlsdGVyQWdncmVnYXRlVGV4dCA9IGFnZ3JlZ2F0ZWRUZXh0O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBJbk1lbW9yeVJvd0NvbnRyb2xsZXI7XHJcbiIsInZhciBURU1QTEFURSA9IFtcclxuICAgICc8c3BhbiBpZD1cInBhZ2VSb3dTdW1tYXJ5UGFuZWxcIiBjbGFzcz1cImFnLXBhZ2luZy1yb3ctc3VtbWFyeS1wYW5lbFwiPicsXHJcbiAgICAnPHNwYW4gaWQ9XCJmaXJzdFJvd09uUGFnZVwiPjwvc3Bhbj4nLFxyXG4gICAgJyB0byAnLFxyXG4gICAgJzxzcGFuIGlkPVwibGFzdFJvd09uUGFnZVwiPjwvc3Bhbj4nLFxyXG4gICAgJyBvZiAnLFxyXG4gICAgJzxzcGFuIGlkPVwicmVjb3JkQ291bnRcIj48L3NwYW4+JyxcclxuICAgICc8L3NwYW4+JyxcclxuICAgICc8c3BhbiBjbGFzPVwiYWctcGFnaW5nLXBhZ2Utc3VtbWFyeS1wYW5lbFwiPicsXHJcbiAgICAnPGJ1dHRvbiBjbGFzcz1cImFnLXBhZ2luZy1idXR0b25cIiBpZD1cImJ0Rmlyc3RcIj5GaXJzdDwvYnV0dG9uPicsXHJcbiAgICAnPGJ1dHRvbiBjbGFzcz1cImFnLXBhZ2luZy1idXR0b25cIiBpZD1cImJ0UHJldmlvdXNcIj5QcmV2aW91czwvYnV0dG9uPicsXHJcbiAgICAnIFBhZ2UgJyxcclxuICAgICc8c3BhbiBpZD1cImN1cnJlbnRcIj48L3NwYW4+JyxcclxuICAgICcgb2YgJyxcclxuICAgICc8c3BhbiBpZD1cInRvdGFsXCI+PC9zcGFuPicsXHJcbiAgICAnPGJ1dHRvbiBjbGFzcz1cImFnLXBhZ2luZy1idXR0b25cIiBpZD1cImJ0TmV4dFwiPk5leHQ8L2J1dHRvbj4nLFxyXG4gICAgJzxidXR0b24gY2xhc3M9XCJhZy1wYWdpbmctYnV0dG9uXCIgaWQ9XCJidExhc3RcIj5MYXN0PC9idXR0b24+JyxcclxuICAgICc8L3NwYW4+J1xyXG5dLmpvaW4oJycpO1xyXG5cclxuZnVuY3Rpb24gUGFnaW5hdGlvbkNvbnRyb2xsZXIoKSB7fVxyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihlUGFnaW5nUGFuZWwsIGFuZ3VsYXJHcmlkKSB7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkID0gYW5ndWxhckdyaWQ7XHJcbiAgICB0aGlzLnBvcHVsYXRlUGFuZWwoZVBhZ2luZ1BhbmVsKTtcclxuICAgIHRoaXMuY2FsbFZlcnNpb24gPSAwO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnNldERhdGFzb3VyY2UgPSBmdW5jdGlvbihkYXRhc291cmNlKSB7XHJcbiAgICB0aGlzLmRhdGFzb3VyY2UgPSBkYXRhc291cmNlO1xyXG5cclxuICAgIGlmICghZGF0YXNvdXJjZSkge1xyXG4gICAgICAgIC8vIG9ubHkgY29udGludWUgaWYgd2UgaGF2ZSBhIHZhbGlkIGRhdGFzb3VyY2UgdG8gd29yayB3aXRoXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmVzZXQoKTtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gY29weSBwYWdlU2l6ZSwgdG8gZ3VhcmQgYWdhaW5zdCBpdCBjaGFuZ2luZyB0aGUgdGhlIGRhdGFzb3VyY2UgYmV0d2VlbiBjYWxsc1xyXG4gICAgdGhpcy5wYWdlU2l6ZSA9IHRoaXMuZGF0YXNvdXJjZS5wYWdlU2l6ZTtcclxuICAgIC8vIHNlZSBpZiB3ZSBrbm93IHRoZSB0b3RhbCBudW1iZXIgb2YgcGFnZXMsIG9yIGlmIGl0J3MgJ3RvIGJlIGRlY2lkZWQnXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZGF0YXNvdXJjZS5yb3dDb3VudCA9PT0gJ251bWJlcicgJiYgdGhpcy5kYXRhc291cmNlLnJvd0NvdW50ID49IDApIHtcclxuICAgICAgICB0aGlzLnJvd0NvdW50ID0gdGhpcy5kYXRhc291cmNlLnJvd0NvdW50O1xyXG4gICAgICAgIHRoaXMuZm91bmRNYXhSb3cgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlVG90YWxQYWdlcygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnJvd0NvdW50ID0gMDtcclxuICAgICAgICB0aGlzLmZvdW5kTWF4Um93ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy50b3RhbFBhZ2VzID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmN1cnJlbnRQYWdlID0gMDtcclxuXHJcbiAgICAvLyBoaWRlIHRoZSBzdW1tYXJ5IHBhbmVsIHVudGlsIHNvbWV0aGluZyBpcyBsb2FkZWRcclxuICAgIHRoaXMuZVBhZ2VSb3dTdW1tYXJ5UGFuZWwuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xyXG5cclxuICAgIHRoaXMuc2V0VG90YWxMYWJlbHMoKTtcclxuICAgIHRoaXMubG9hZFBhZ2UoKTtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5zZXRUb3RhbExhYmVscyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuZm91bmRNYXhSb3cpIHtcclxuICAgICAgICB0aGlzLmxiVG90YWwuaW5uZXJIVE1MID0gdGhpcy50b3RhbFBhZ2VzLnRvTG9jYWxlU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy5sYlJlY29yZENvdW50LmlubmVySFRNTCA9IHRoaXMucm93Q291bnQudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5sYlRvdGFsLmlubmVySFRNTCA9ICdtb3JlJztcclxuICAgICAgICB0aGlzLmxiUmVjb3JkQ291bnQuaW5uZXJIVE1MID0gJ21vcmUnO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmNhbGN1bGF0ZVRvdGFsUGFnZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMudG90YWxQYWdlcyA9IE1hdGguZmxvb3IoKHRoaXMucm93Q291bnQgLSAxKSAvIHRoaXMucGFnZVNpemUpICsgMTtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5wYWdlTG9hZGVkID0gZnVuY3Rpb24ocm93cywgbGFzdFJvd0luZGV4KSB7XHJcbiAgICB2YXIgZmlyc3RJZCA9IHRoaXMuY3VycmVudFBhZ2UgKiB0aGlzLnBhZ2VTaXplO1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZC5zZXRSb3dzKHJvd3MsIGZpcnN0SWQpO1xyXG4gICAgLy8gc2VlIGlmIHdlIGhpdCB0aGUgbGFzdCByb3dcclxuICAgIGlmICghdGhpcy5mb3VuZE1heFJvdyAmJiB0eXBlb2YgbGFzdFJvd0luZGV4ID09PSAnbnVtYmVyJyAmJiBsYXN0Um93SW5kZXggPj0gMCkge1xyXG4gICAgICAgIHRoaXMuZm91bmRNYXhSb3cgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMucm93Q291bnQgPSBsYXN0Um93SW5kZXg7XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVUb3RhbFBhZ2VzKCk7XHJcbiAgICAgICAgdGhpcy5zZXRUb3RhbExhYmVscygpO1xyXG5cclxuICAgICAgICAvLyBpZiBvdmVyc2hvdCBwYWdlcywgZ28gYmFja1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQYWdlID4gdGhpcy50b3RhbFBhZ2VzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSB0aGlzLnRvdGFsUGFnZXMgLSAxO1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRQYWdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5lbmFibGVPckRpc2FibGVCdXR0b25zKCk7XHJcbiAgICB0aGlzLnVwZGF0ZVJvd0xhYmVscygpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZVJvd0xhYmVscyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHN0YXJ0Um93O1xyXG4gICAgdmFyIGVuZFJvdztcclxuICAgIGlmICh0aGlzLmlzWmVyb1BhZ2VzVG9EaXNwbGF5KCkpIHtcclxuICAgICAgICBzdGFydFJvdyA9IDA7XHJcbiAgICAgICAgZW5kUm93ID0gMDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc3RhcnRSb3cgPSAodGhpcy5wYWdlU2l6ZSAqIHRoaXMuY3VycmVudFBhZ2UpICsgMTtcclxuICAgICAgICBlbmRSb3cgPSBzdGFydFJvdyArIHRoaXMucGFnZVNpemUgLSAxO1xyXG4gICAgICAgIGlmICh0aGlzLmZvdW5kTWF4Um93ICYmIGVuZFJvdyA+IHRoaXMucm93Q291bnQpIHtcclxuICAgICAgICAgICAgZW5kUm93ID0gdGhpcy5yb3dDb3VudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmxiRmlyc3RSb3dPblBhZ2UuaW5uZXJIVE1MID0gKHN0YXJ0Um93KS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgdGhpcy5sYkxhc3RSb3dPblBhZ2UuaW5uZXJIVE1MID0gKGVuZFJvdykudG9Mb2NhbGVTdHJpbmcoKTtcclxuXHJcbiAgICAvLyBzaG93IHRoZSBzdW1tYXJ5IHBhbmVsLCB3aGVuIGZpcnN0IHNob3duLCB0aGlzIGlzIGJsYW5rXHJcbiAgICB0aGlzLmVQYWdlUm93U3VtbWFyeVBhbmVsLnN0eWxlLnZpc2liaWxpdHkgPSBudWxsO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmxvYWRQYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVuYWJsZU9yRGlzYWJsZUJ1dHRvbnMoKTtcclxuICAgIHZhciBzdGFydFJvdyA9IHRoaXMuY3VycmVudFBhZ2UgKiB0aGlzLmRhdGFzb3VyY2UucGFnZVNpemU7XHJcbiAgICB2YXIgZW5kUm93ID0gKHRoaXMuY3VycmVudFBhZ2UgKyAxKSAqIHRoaXMuZGF0YXNvdXJjZS5wYWdlU2l6ZTtcclxuXHJcbiAgICB0aGlzLmxiQ3VycmVudC5pbm5lckhUTUwgPSAodGhpcy5jdXJyZW50UGFnZSArIDEpLnRvTG9jYWxlU3RyaW5nKCk7XHJcblxyXG4gICAgdGhpcy5jYWxsVmVyc2lvbisrO1xyXG4gICAgdmFyIGNhbGxWZXJzaW9uQ29weSA9IHRoaXMuY2FsbFZlcnNpb247XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkLnNob3dMb2FkaW5nUGFuZWwodHJ1ZSk7XHJcbiAgICB0aGlzLmRhdGFzb3VyY2UuZ2V0Um93cyhzdGFydFJvdywgZW5kUm93LFxyXG4gICAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3Mocm93cywgbGFzdFJvd0luZGV4KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGF0LmlzQ2FsbERhZW1vbihjYWxsVmVyc2lvbkNvcHkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhhdC5wYWdlTG9hZGVkKHJvd3MsIGxhc3RSb3dJbmRleCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmdW5jdGlvbiBmYWlsKCkge1xyXG4gICAgICAgICAgICBpZiAodGhhdC5pc0NhbGxEYWVtb24oY2FsbFZlcnNpb25Db3B5KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHNldCBpbiBhbiBlbXB0eSBzZXQgb2Ygcm93cywgdGhpcyB3aWxsIGF0XHJcbiAgICAgICAgICAgIC8vIGxlYXN0IGdldCByaWQgb2YgdGhlIGxvYWRpbmcgcGFuZWwsIGFuZFxyXG4gICAgICAgICAgICAvLyBzdG9wIGJsb2NraW5nIHRoaW5nc1xyXG4gICAgICAgICAgICB0aGF0LmFuZ3VsYXJHcmlkLnNldFJvd3MoW10pO1xyXG4gICAgICAgIH1cclxuICAgICk7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuaXNDYWxsRGFlbW9uID0gZnVuY3Rpb24odmVyc2lvbkNvcHkpIHtcclxuICAgIHJldHVybiB2ZXJzaW9uQ29weSAhPT0gdGhpcy5jYWxsVmVyc2lvbjtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5vbkJ0TmV4dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdXJyZW50UGFnZSsrO1xyXG4gICAgdGhpcy5sb2FkUGFnZSgpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLm9uQnRQcmV2aW91cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdXJyZW50UGFnZS0tO1xyXG4gICAgdGhpcy5sb2FkUGFnZSgpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLm9uQnRGaXJzdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdXJyZW50UGFnZSA9IDA7XHJcbiAgICB0aGlzLmxvYWRQYWdlKCk7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUub25CdExhc3QgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY3VycmVudFBhZ2UgPSB0aGlzLnRvdGFsUGFnZXMgLSAxO1xyXG4gICAgdGhpcy5sb2FkUGFnZSgpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmlzWmVyb1BhZ2VzVG9EaXNwbGF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5mb3VuZE1heFJvdyAmJiB0aGlzLnRvdGFsUGFnZXMgPT09IDA7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZW5hYmxlT3JEaXNhYmxlQnV0dG9ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGRpc2FibGVQcmV2aW91c0FuZEZpcnN0ID0gdGhpcy5jdXJyZW50UGFnZSA9PT0gMDtcclxuICAgIHRoaXMuYnRQcmV2aW91cy5kaXNhYmxlZCA9IGRpc2FibGVQcmV2aW91c0FuZEZpcnN0O1xyXG4gICAgdGhpcy5idEZpcnN0LmRpc2FibGVkID0gZGlzYWJsZVByZXZpb3VzQW5kRmlyc3Q7XHJcblxyXG4gICAgdmFyIHplcm9QYWdlc1RvRGlzcGxheSA9IHRoaXMuaXNaZXJvUGFnZXNUb0Rpc3BsYXkoKTtcclxuICAgIHZhciBvbkxhc3RQYWdlID0gdGhpcy5mb3VuZE1heFJvdyAmJiB0aGlzLmN1cnJlbnRQYWdlID09PSAodGhpcy50b3RhbFBhZ2VzIC0gMSk7XHJcblxyXG4gICAgdmFyIGRpc2FibGVOZXh0ID0gb25MYXN0UGFnZSB8fCB6ZXJvUGFnZXNUb0Rpc3BsYXk7XHJcbiAgICB0aGlzLmJ0TmV4dC5kaXNhYmxlZCA9IGRpc2FibGVOZXh0O1xyXG5cclxuICAgIHZhciBkaXNhYmxlTGFzdCA9ICF0aGlzLmZvdW5kTWF4Um93IHx8IHplcm9QYWdlc1RvRGlzcGxheSB8fCB0aGlzLmN1cnJlbnRQYWdlID09PSAodGhpcy50b3RhbFBhZ2VzIC0gMSk7XHJcbiAgICB0aGlzLmJ0TGFzdC5kaXNhYmxlZCA9IGRpc2FibGVMYXN0O1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnBvcHVsYXRlUGFuZWwgPSBmdW5jdGlvbihlUGFnaW5nUGFuZWwpIHtcclxuXHJcbiAgICBlUGFnaW5nUGFuZWwuaW5uZXJIVE1MID0gVEVNUExBVEU7XHJcblxyXG4gICAgdGhpcy5idE5leHQgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI2J0TmV4dCcpO1xyXG4gICAgdGhpcy5idFByZXZpb3VzID0gZVBhZ2luZ1BhbmVsLnF1ZXJ5U2VsZWN0b3IoJyNidFByZXZpb3VzJyk7XHJcbiAgICB0aGlzLmJ0Rmlyc3QgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI2J0Rmlyc3QnKTtcclxuICAgIHRoaXMuYnRMYXN0ID0gZVBhZ2luZ1BhbmVsLnF1ZXJ5U2VsZWN0b3IoJyNidExhc3QnKTtcclxuICAgIHRoaXMubGJDdXJyZW50ID0gZVBhZ2luZ1BhbmVsLnF1ZXJ5U2VsZWN0b3IoJyNjdXJyZW50Jyk7XHJcbiAgICB0aGlzLmxiVG90YWwgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI3RvdGFsJyk7XHJcblxyXG4gICAgdGhpcy5sYlJlY29yZENvdW50ID0gZVBhZ2luZ1BhbmVsLnF1ZXJ5U2VsZWN0b3IoJyNyZWNvcmRDb3VudCcpO1xyXG4gICAgdGhpcy5sYkZpcnN0Um93T25QYWdlID0gZVBhZ2luZ1BhbmVsLnF1ZXJ5U2VsZWN0b3IoJyNmaXJzdFJvd09uUGFnZScpO1xyXG4gICAgdGhpcy5sYkxhc3RSb3dPblBhZ2UgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI2xhc3RSb3dPblBhZ2UnKTtcclxuICAgIHRoaXMuZVBhZ2VSb3dTdW1tYXJ5UGFuZWwgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI3BhZ2VSb3dTdW1tYXJ5UGFuZWwnKTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgdGhpcy5idE5leHQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGF0Lm9uQnROZXh0KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmJ0UHJldmlvdXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGF0Lm9uQnRQcmV2aW91cygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5idEZpcnN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhhdC5vbkJ0Rmlyc3QoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYnRMYXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhhdC5vbkJ0TGFzdCgpO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhZ2luYXRpb25Db250cm9sbGVyO1xyXG4iLCJ2YXIgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG52YXIgZ3JvdXBDZWxsUmVuZGVyZXJGYWN0b3J5ID0gcmVxdWlyZSgnLi9jZWxsUmVuZGVyZXJzL2dyb3VwQ2VsbFJlbmRlcmVyRmFjdG9yeScpO1xyXG5cclxudmFyIFRBQl9LRVkgPSA5O1xyXG52YXIgRU5URVJfS0VZID0gMTM7XHJcblxyXG52YXIgRE9XTl9LRVkgPSA0MDtcclxudmFyIFVQX0tFWSA9IDM4O1xyXG52YXIgTEVGVF9LRVkgPSAzNztcclxudmFyIFJJR0hUX0tFWSA9IDM5O1xyXG5cclxuZnVuY3Rpb24gUm93UmVuZGVyZXIoKSB7fVxyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihncmlkT3B0aW9ucywgY29sdW1uTW9kZWwsIGdyaWRPcHRpb25zV3JhcHBlciwgZUdyaWQsXHJcbiAgICBhbmd1bGFyR3JpZCwgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LCAkY29tcGlsZSwgJHNjb3BlLFxyXG4gICAgc2VsZWN0aW9uQ29udHJvbGxlciwgZXhwcmVzc2lvblNlcnZpY2UsIHRlbXBsYXRlU2VydmljZSwgZVBhcmVudE9mUm93cykge1xyXG4gICAgdGhpcy5ncmlkT3B0aW9ucyA9IGdyaWRPcHRpb25zO1xyXG4gICAgdGhpcy5jb2x1bW5Nb2RlbCA9IGNvbHVtbk1vZGVsO1xyXG4gICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIgPSBncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkID0gYW5ndWxhckdyaWQ7XHJcbiAgICB0aGlzLnNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSA9IHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeTtcclxuICAgIHRoaXMuZmluZEFsbEVsZW1lbnRzKGVHcmlkKTtcclxuICAgIHRoaXMuJGNvbXBpbGUgPSAkY29tcGlsZTtcclxuICAgIHRoaXMuJHNjb3BlID0gJHNjb3BlO1xyXG4gICAgdGhpcy5zZWxlY3Rpb25Db250cm9sbGVyID0gc2VsZWN0aW9uQ29udHJvbGxlcjtcclxuICAgIHRoaXMuZXhwcmVzc2lvblNlcnZpY2UgPSBleHByZXNzaW9uU2VydmljZTtcclxuICAgIHRoaXMudGVtcGxhdGVTZXJ2aWNlID0gdGVtcGxhdGVTZXJ2aWNlO1xyXG4gICAgdGhpcy5lUGFyZW50T2ZSb3dzID0gZVBhcmVudE9mUm93cztcclxuXHJcbiAgICB0aGlzLmNlbGxSZW5kZXJlck1hcCA9IHtcclxuICAgICAgICAnZ3JvdXAnOiBncm91cENlbGxSZW5kZXJlckZhY3RvcnkoZ3JpZE9wdGlvbnNXcmFwcGVyLCBzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkpXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIG1hcCBvZiByb3cgaWRzIHRvIHJvdyBvYmplY3RzLiBrZWVwcyB0cmFjayBvZiB3aGljaCBlbGVtZW50c1xyXG4gICAgLy8gYXJlIHJlbmRlcmVkIGZvciB3aGljaCByb3dzIGluIHRoZSBkb20uIGVhY2ggcm93IG9iamVjdCBoYXM6XHJcbiAgICAvLyBbc2NvcGUsIGJvZHlSb3csIHBpbm5lZFJvdywgcm93RGF0YV1cclxuICAgIHRoaXMucmVuZGVyZWRSb3dzID0ge307XHJcblxyXG4gICAgdGhpcy5yZW5kZXJlZFJvd1N0YXJ0RWRpdGluZ0xpc3RlbmVycyA9IHt9O1xyXG5cclxuICAgIHRoaXMuZWRpdGluZ0NlbGwgPSBmYWxzZTsgLy9nZXRzIHNldCB0byB0cnVlIHdoZW4gZWRpdGluZyBhIGNlbGxcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zZXRSb3dNb2RlbCA9IGZ1bmN0aW9uKHJvd01vZGVsKSB7XHJcbiAgICB0aGlzLnJvd01vZGVsID0gcm93TW9kZWw7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuc2V0TWFpblJvd1dpZHRocyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG1haW5Sb3dXaWR0aCA9IHRoaXMuY29sdW1uTW9kZWwuZ2V0Qm9keUNvbnRhaW5lcldpZHRoKCkgKyBcInB4XCI7XHJcblxyXG4gICAgdmFyIHVucGlubmVkUm93cyA9IHRoaXMuZUJvZHlDb250YWluZXIucXVlcnlTZWxlY3RvckFsbChcIi5hZy1yb3dcIik7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHVucGlubmVkUm93cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHVucGlubmVkUm93c1tpXS5zdHlsZS53aWR0aCA9IG1haW5Sb3dXaWR0aDtcclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5maW5kQWxsRWxlbWVudHMgPSBmdW5jdGlvbihlR3JpZCkge1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9udFVzZVNjcm9sbHMoKSkge1xyXG4gICAgICAgIHRoaXMuZUJvZHlDb250YWluZXIgPSBlR3JpZC5xdWVyeVNlbGVjdG9yKFwiLmFnLWJvZHktY29udGFpbmVyXCIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVCb2R5Q29udGFpbmVyID0gZUdyaWQucXVlcnlTZWxlY3RvcihcIi5hZy1ib2R5LWNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLmVCb2R5Vmlld3BvcnQgPSBlR3JpZC5xdWVyeVNlbGVjdG9yKFwiLmFnLWJvZHktdmlld3BvcnRcIik7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc0NvbnRhaW5lciA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctcGlubmVkLWNvbHMtY29udGFpbmVyXCIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnJlZnJlc2hWaWV3ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9udFVzZVNjcm9sbHMoKSkge1xyXG4gICAgICAgIHZhciByb3dDb3VudCA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvd0NvdW50KCk7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lckhlaWdodCA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0hlaWdodCgpICogcm93Q291bnQ7XHJcbiAgICAgICAgdGhpcy5lQm9keUNvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBjb250YWluZXJIZWlnaHQgKyBcInB4XCI7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc0NvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBjb250YWluZXJIZWlnaHQgKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZWZyZXNoQWxsVmlydHVhbFJvd3MoKTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zb2Z0UmVmcmVzaFZpZXcgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgZmlyc3QgPSB0aGlzLmZpcnN0VmlydHVhbFJlbmRlcmVkUm93O1xyXG4gICAgdmFyIGxhc3QgPSB0aGlzLmxhc3RWaXJ0dWFsUmVuZGVyZWRSb3c7XHJcblxyXG4gICAgdmFyIGNvbHVtbnMgPSB0aGlzLmNvbHVtbk1vZGVsLmdldFZpc2libGVDb2x1bW5zKCk7XHJcbiAgICAvLyBpZiBubyBjb2xzLCBkb24ndCBkcmF3IHJvd1xyXG4gICAgaWYgKCFjb2x1bW5zIHx8IGNvbHVtbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIHJvd0luZGV4ID0gZmlyc3Q7IHJvd0luZGV4IDw9IGxhc3Q7IHJvd0luZGV4KyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvdyhyb3dJbmRleCk7XHJcbiAgICAgICAgaWYgKG5vZGUpIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGNvbEluZGV4ID0gMDsgY29sSW5kZXggPD0gY29sdW1ucy5sZW5ndGg7IGNvbEluZGV4KyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb2x1bW4gPSBjb2x1bW5zW2NvbEluZGV4XTtcclxuICAgICAgICAgICAgICAgIHZhciByZW5kZXJlZFJvdyA9IHRoaXMucmVuZGVyZWRSb3dzW3Jvd0luZGV4XTtcclxuICAgICAgICAgICAgICAgIHZhciBlR3JpZENlbGwgPSByZW5kZXJlZFJvdy5lVm9sYXRpbGVDZWxsc1tjb2xJbmRleF07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFlR3JpZENlbGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaXNGaXJzdENvbHVtbiA9IGNvbEluZGV4ID09PSAwO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNjb3BlID0gcmVuZGVyZWRSb3cuc2NvcGU7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zb2Z0UmVmcmVzaENlbGwoZUdyaWRDZWxsLCBpc0ZpcnN0Q29sdW1uLCBub2RlLCBjb2x1bW4sIHNjb3BlLCByb3dJbmRleCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuc29mdFJlZnJlc2hDZWxsID0gZnVuY3Rpb24oZUdyaWRDZWxsLCBpc0ZpcnN0Q29sdW1uLCBub2RlLCBjb2x1bW4sIHNjb3BlLCByb3dJbmRleCkge1xyXG5cclxuICAgIHV0aWxzLnJlbW92ZUFsbENoaWxkcmVuKGVHcmlkQ2VsbCk7XHJcblxyXG4gICAgdmFyIGRhdGEgPSB0aGlzLmdldERhdGFGb3JOb2RlKG5vZGUpO1xyXG4gICAgdmFyIHZhbHVlR2V0dGVyID0gdGhpcy5jcmVhdGVWYWx1ZUdldHRlcihkYXRhLCBjb2x1bW4uY29sRGVmLCBub2RlKTtcclxuXHJcbiAgICB2YXIgdmFsdWU7XHJcbiAgICBpZiAodmFsdWVHZXR0ZXIpIHtcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlR2V0dGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5wb3B1bGF0ZUFuZFN0eWxlR3JpZENlbGwodmFsdWVHZXR0ZXIsIHZhbHVlLCBlR3JpZENlbGwsIGlzRmlyc3RDb2x1bW4sIG5vZGUsIGNvbHVtbiwgcm93SW5kZXgsIHNjb3BlKTtcclxuXHJcbiAgICAvLyBpZiBhbmd1bGFyIGNvbXBpbGluZywgdGhlbiBuZWVkIHRvIGFsc28gY29tcGlsZSB0aGUgY2VsbCBhZ2FpbiAoYW5ndWxhciBjb21waWxpbmcgc3Vja3MsIHBsZWFzZSB3YWl0Li4uKVxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzQW5ndWxhckNvbXBpbGVSb3dzKCkpIHtcclxuICAgICAgICB0aGlzLiRjb21waWxlKGVHcmlkQ2VsbCkoc2NvcGUpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnJvd0RhdGFDaGFuZ2VkID0gZnVuY3Rpb24ocm93cykge1xyXG4gICAgLy8gd2Ugb25seSBuZWVkIHRvIGJlIHdvcnJpZWQgYWJvdXQgcmVuZGVyZWQgcm93cywgYXMgdGhpcyBtZXRob2QgaXNcclxuICAgIC8vIGNhbGxlZCB0byB3aGF0cyByZW5kZXJlZC4gaWYgdGhlIHJvdyBpc24ndCByZW5kZXJlZCwgd2UgZG9uJ3QgY2FyZVxyXG4gICAgdmFyIGluZGV4ZXNUb1JlbW92ZSA9IFtdO1xyXG4gICAgdmFyIHJlbmRlcmVkUm93cyA9IHRoaXMucmVuZGVyZWRSb3dzO1xyXG4gICAgT2JqZWN0LmtleXMocmVuZGVyZWRSb3dzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIHZhciByZW5kZXJlZFJvdyA9IHJlbmRlcmVkUm93c1trZXldO1xyXG4gICAgICAgIC8vIHNlZSBpZiB0aGUgcmVuZGVyZWQgcm93IGlzIGluIHRoZSBsaXN0IG9mIHJvd3Mgd2UgaGF2ZSB0byB1cGRhdGVcclxuICAgICAgICB2YXIgcm93TmVlZHNVcGRhdGluZyA9IHJvd3MuaW5kZXhPZihyZW5kZXJlZFJvdy5ub2RlLmRhdGEpID49IDA7XHJcbiAgICAgICAgaWYgKHJvd05lZWRzVXBkYXRpbmcpIHtcclxuICAgICAgICAgICAgaW5kZXhlc1RvUmVtb3ZlLnB1c2goa2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIC8vIHJlbW92ZSB0aGUgcm93c1xyXG4gICAgdGhpcy5yZW1vdmVWaXJ0dWFsUm93cyhpbmRleGVzVG9SZW1vdmUpO1xyXG4gICAgLy8gYWRkIGRyYXcgdGhlbSBhZ2FpblxyXG4gICAgdGhpcy5kcmF3VmlydHVhbFJvd3MoKTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5yZWZyZXNoQWxsVmlydHVhbFJvd3MgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIHJlbW92ZSBhbGwgY3VycmVudCB2aXJ0dWFsIHJvd3MsIGFzIHRoZXkgaGF2ZSBvbGQgZGF0YVxyXG4gICAgdmFyIHJvd3NUb1JlbW92ZSA9IE9iamVjdC5rZXlzKHRoaXMucmVuZGVyZWRSb3dzKTtcclxuICAgIHRoaXMucmVtb3ZlVmlydHVhbFJvd3Mocm93c1RvUmVtb3ZlKTtcclxuXHJcbiAgICAvLyBhZGQgaW4gbmV3IHJvd3NcclxuICAgIHRoaXMuZHJhd1ZpcnR1YWxSb3dzKCk7XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgLSByZW1vdmVzIHRoZSBncm91cCByb3dzIGFuZCB0aGVuIHJlZHJhd3MgdGhlbSBhZ2FpblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUucmVmcmVzaEdyb3VwUm93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gZmluZCBhbGwgdGhlIGdyb3VwIHJvd3NcclxuICAgIHZhciByb3dzVG9SZW1vdmUgPSBbXTtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIE9iamVjdC5rZXlzKHRoaXMucmVuZGVyZWRSb3dzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIHZhciByZW5kZXJlZFJvdyA9IHRoYXQucmVuZGVyZWRSb3dzW2tleV07XHJcbiAgICAgICAgdmFyIG5vZGUgPSByZW5kZXJlZFJvdy5ub2RlO1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIHJvd3NUb1JlbW92ZS5wdXNoKGtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAvLyByZW1vdmUgdGhlIHJvd3NcclxuICAgIHRoaXMucmVtb3ZlVmlydHVhbFJvd3Mocm93c1RvUmVtb3ZlKTtcclxuICAgIC8vIGFuZCBkcmF3IHRoZW0gYmFjayBhZ2FpblxyXG4gICAgdGhpcy5lbnN1cmVSb3dzUmVuZGVyZWQoKTtcclxufTtcclxuXHJcbi8vIHRha2VzIGFycmF5IG9mIHJvdyBpbmRleGVzXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5yZW1vdmVWaXJ0dWFsUm93cyA9IGZ1bmN0aW9uKHJvd3NUb1JlbW92ZSkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgcm93c1RvUmVtb3ZlLmZvckVhY2goZnVuY3Rpb24oaW5kZXhUb1JlbW92ZSkge1xyXG4gICAgICAgIHRoYXQucmVtb3ZlVmlydHVhbFJvdyhpbmRleFRvUmVtb3ZlKTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnJlbW92ZVZpcnR1YWxSb3cgPSBmdW5jdGlvbihpbmRleFRvUmVtb3ZlKSB7XHJcbiAgICB2YXIgcmVuZGVyZWRSb3cgPSB0aGlzLnJlbmRlcmVkUm93c1tpbmRleFRvUmVtb3ZlXTtcclxuICAgIGlmIChyZW5kZXJlZFJvdy5waW5uZWRFbGVtZW50ICYmIHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIpIHtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyLnJlbW92ZUNoaWxkKHJlbmRlcmVkUm93LnBpbm5lZEVsZW1lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZW5kZXJlZFJvdy5ib2R5RWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuZUJvZHlDb250YWluZXIucmVtb3ZlQ2hpbGQocmVuZGVyZWRSb3cuYm9keUVsZW1lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZW5kZXJlZFJvdy5zY29wZSkge1xyXG4gICAgICAgIHJlbmRlcmVkUm93LnNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFZpcnR1YWxSb3dSZW1vdmVkKCkpIHtcclxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRWaXJ0dWFsUm93UmVtb3ZlZCgpKHJlbmRlcmVkUm93LmRhdGEsIGluZGV4VG9SZW1vdmUpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hbmd1bGFyR3JpZC5vblZpcnR1YWxSb3dSZW1vdmVkKGluZGV4VG9SZW1vdmUpO1xyXG5cclxuICAgIGRlbGV0ZSB0aGlzLnJlbmRlcmVkUm93c1tpbmRleFRvUmVtb3ZlXTtcclxuICAgIGRlbGV0ZSB0aGlzLnJlbmRlcmVkUm93U3RhcnRFZGl0aW5nTGlzdGVuZXJzW2luZGV4VG9SZW1vdmVdO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmRyYXdWaXJ0dWFsUm93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGZpcnN0O1xyXG4gICAgdmFyIGxhc3Q7XHJcblxyXG4gICAgdmFyIHJvd0NvdW50ID0gdGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93Q291bnQoKTtcclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgZmlyc3QgPSAwO1xyXG4gICAgICAgIGxhc3QgPSByb3dDb3VudDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIHRvcFBpeGVsID0gdGhpcy5lQm9keVZpZXdwb3J0LnNjcm9sbFRvcDtcclxuICAgICAgICB2YXIgYm90dG9tUGl4ZWwgPSB0b3BQaXhlbCArIHRoaXMuZUJvZHlWaWV3cG9ydC5vZmZzZXRIZWlnaHQ7XHJcblxyXG4gICAgICAgIGZpcnN0ID0gTWF0aC5mbG9vcih0b3BQaXhlbCAvIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0hlaWdodCgpKTtcclxuICAgICAgICBsYXN0ID0gTWF0aC5mbG9vcihib3R0b21QaXhlbCAvIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0hlaWdodCgpKTtcclxuXHJcbiAgICAgICAgLy9hZGQgaW4gYnVmZmVyXHJcbiAgICAgICAgdmFyIGJ1ZmZlciA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0J1ZmZlcigpIHx8IGNvbnN0YW50cy5ST1dfQlVGRkVSX1NJWkU7XHJcbiAgICAgICAgZmlyc3QgPSBmaXJzdCAtIGJ1ZmZlcjtcclxuICAgICAgICBsYXN0ID0gbGFzdCArIGJ1ZmZlcjtcclxuXHJcbiAgICAgICAgLy8gYWRqdXN0LCBpbiBjYXNlIGJ1ZmZlciBleHRlbmRlZCBhY3R1YWwgc2l6ZVxyXG4gICAgICAgIGlmIChmaXJzdCA8IDApIHtcclxuICAgICAgICAgICAgZmlyc3QgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobGFzdCA+IHJvd0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICBsYXN0ID0gcm93Q291bnQgLSAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmZpcnN0VmlydHVhbFJlbmRlcmVkUm93ID0gZmlyc3Q7XHJcbiAgICB0aGlzLmxhc3RWaXJ0dWFsUmVuZGVyZWRSb3cgPSBsYXN0O1xyXG5cclxuICAgIHRoaXMuZW5zdXJlUm93c1JlbmRlcmVkKCk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuZ2V0Rmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3cgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmZpcnN0VmlydHVhbFJlbmRlcmVkUm93O1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmdldExhc3RWaXJ0dWFsUmVuZGVyZWRSb3cgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmxhc3RWaXJ0dWFsUmVuZGVyZWRSb3c7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuZW5zdXJlUm93c1JlbmRlcmVkID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIG1haW5Sb3dXaWR0aCA9IHRoaXMuY29sdW1uTW9kZWwuZ2V0Qm9keUNvbnRhaW5lcldpZHRoKCk7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgLy8gYXQgdGhlIGVuZCwgdGhpcyBhcnJheSB3aWxsIGNvbnRhaW4gdGhlIGl0ZW1zIHdlIG5lZWQgdG8gcmVtb3ZlXHJcbiAgICB2YXIgcm93c1RvUmVtb3ZlID0gT2JqZWN0LmtleXModGhpcy5yZW5kZXJlZFJvd3MpO1xyXG5cclxuICAgIC8vIGFkZCBpbiBuZXcgcm93c1xyXG4gICAgZm9yICh2YXIgcm93SW5kZXggPSB0aGlzLmZpcnN0VmlydHVhbFJlbmRlcmVkUm93OyByb3dJbmRleCA8PSB0aGlzLmxhc3RWaXJ0dWFsUmVuZGVyZWRSb3c7IHJvd0luZGV4KyspIHtcclxuICAgICAgICAvLyBzZWUgaWYgaXRlbSBhbHJlYWR5IHRoZXJlLCBhbmQgaWYgeWVzLCB0YWtlIGl0IG91dCBvZiB0aGUgJ3RvIHJlbW92ZScgYXJyYXlcclxuICAgICAgICBpZiAocm93c1RvUmVtb3ZlLmluZGV4T2Yocm93SW5kZXgudG9TdHJpbmcoKSkgPj0gMCkge1xyXG4gICAgICAgICAgICByb3dzVG9SZW1vdmUuc3BsaWNlKHJvd3NUb1JlbW92ZS5pbmRleE9mKHJvd0luZGV4LnRvU3RyaW5nKCkpLCAxKTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNoZWNrIHRoaXMgcm93IGFjdHVhbGx5IGV4aXN0cyAoaW4gY2FzZSBvdmVyZmxvdyBidWZmZXIgd2luZG93IGV4Y2VlZHMgcmVhbCBkYXRhKVxyXG4gICAgICAgIHZhciBub2RlID0gdGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93KHJvd0luZGV4KTtcclxuICAgICAgICBpZiAobm9kZSkge1xyXG4gICAgICAgICAgICB0aGF0Lmluc2VydFJvdyhub2RlLCByb3dJbmRleCwgbWFpblJvd1dpZHRoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYXQgdGhpcyBwb2ludCwgZXZlcnl0aGluZyBpbiBvdXIgJ3Jvd3NUb1JlbW92ZScgLiAuIC5cclxuICAgIHRoaXMucmVtb3ZlVmlydHVhbFJvd3Mocm93c1RvUmVtb3ZlKTtcclxuXHJcbiAgICAvLyBpZiB3ZSBhcmUgZG9pbmcgYW5ndWxhciBjb21waWxpbmcsIHRoZW4gZG8gZGlnZXN0IHRoZSBzY29wZSBoZXJlXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNBbmd1bGFyQ29tcGlsZVJvd3MoKSkge1xyXG4gICAgICAgIC8vIHdlIGRvIGl0IGluIGEgdGltZW91dCwgaW4gY2FzZSB3ZSBhcmUgYWxyZWFkeSBpbiBhbiBhcHBseVxyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH0sIDApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmluc2VydFJvdyA9IGZ1bmN0aW9uKG5vZGUsIHJvd0luZGV4LCBtYWluUm93V2lkdGgpIHtcclxuICAgIHZhciBjb2x1bW5zID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRWaXNpYmxlQ29sdW1ucygpO1xyXG4gICAgLy8gaWYgbm8gY29scywgZG9uJ3QgZHJhdyByb3dcclxuICAgIGlmICghY29sdW1ucyB8fCBjb2x1bW5zLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHZhciByb3dEYXRhID0gbm9kZS5yb3dEYXRhO1xyXG4gICAgdmFyIHJvd0lzQUdyb3VwID0gbm9kZS5ncm91cDtcclxuICAgIHZhciByb3dJc0FGb290ZXIgPSBub2RlLmZvb3RlcjtcclxuXHJcbiAgICAvLyB0cnkgY29tcGlsaW5nIGFzIHdlIGluc2VydCByb3dzXHJcbiAgICB2YXIgbmV3Q2hpbGRTY29wZSA9IHRoaXMuY3JlYXRlQ2hpbGRTY29wZU9yTnVsbChub2RlLmRhdGEpO1xyXG5cclxuICAgIHZhciBlUGlubmVkUm93ID0gdGhpcy5jcmVhdGVSb3dDb250YWluZXIocm93SW5kZXgsIG5vZGUsIHJvd0lzQUdyb3VwLCBuZXdDaGlsZFNjb3BlKTtcclxuICAgIHZhciBlTWFpblJvdyA9IHRoaXMuY3JlYXRlUm93Q29udGFpbmVyKHJvd0luZGV4LCBub2RlLCByb3dJc0FHcm91cCwgbmV3Q2hpbGRTY29wZSk7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgZU1haW5Sb3cuc3R5bGUud2lkdGggPSBtYWluUm93V2lkdGggKyBcInB4XCI7XHJcblxyXG4gICAgdmFyIHJlbmRlcmVkUm93ID0ge1xyXG4gICAgICAgIHNjb3BlOiBuZXdDaGlsZFNjb3BlLFxyXG4gICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgcm93SW5kZXg6IHJvd0luZGV4LFxyXG4gICAgICAgIGVDZWxsczoge30sXHJcbiAgICAgICAgZVZvbGF0aWxlQ2VsbHM6IHt9XHJcbiAgICB9O1xyXG4gICAgdGhpcy5yZW5kZXJlZFJvd3Nbcm93SW5kZXhdID0gcmVuZGVyZWRSb3c7XHJcbiAgICB0aGlzLnJlbmRlcmVkUm93U3RhcnRFZGl0aW5nTGlzdGVuZXJzW3Jvd0luZGV4XSA9IHt9O1xyXG5cclxuICAgIC8vIGlmIGdyb3VwIGl0ZW0sIGluc2VydCB0aGUgZmlyc3Qgcm93XHJcbiAgICB2YXIgZ3JvdXBIZWFkZXJUYWtlc0VudGlyZVJvdyA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBVc2VFbnRpcmVSb3coKTtcclxuICAgIHZhciBkcmF3R3JvdXBSb3cgPSByb3dJc0FHcm91cCAmJiBncm91cEhlYWRlclRha2VzRW50aXJlUm93O1xyXG5cclxuICAgIGlmIChkcmF3R3JvdXBSb3cpIHtcclxuICAgICAgICB2YXIgZmlyc3RDb2x1bW4gPSBjb2x1bW5zWzBdO1xyXG5cclxuICAgICAgICB2YXIgZUdyb3VwUm93ID0gdGhhdC5jcmVhdGVHcm91cEVsZW1lbnQobm9kZSwgZmFsc2UpO1xyXG4gICAgICAgIGlmIChmaXJzdENvbHVtbi5waW5uZWQpIHtcclxuICAgICAgICAgICAgZVBpbm5lZFJvdy5hcHBlbmRDaGlsZChlR3JvdXBSb3cpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGVHcm91cFJvd1BhZGRpbmcgPSB0aGF0LmNyZWF0ZUdyb3VwRWxlbWVudChub2RlLCB0cnVlKTtcclxuICAgICAgICAgICAgZU1haW5Sb3cuYXBwZW5kQ2hpbGQoZUdyb3VwUm93UGFkZGluZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZU1haW5Sb3cuYXBwZW5kQ2hpbGQoZUdyb3VwUm93KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vcmVuZGVyZWRSb3cuZUNlbGxzW2ZpcnN0Q29sdW1uLmNvbEtleV0gPSBlR3JvdXBSb3c7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgY29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbiwgaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIGZpcnN0Q29sID0gaW5kZXggPT09IDA7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhhdC5nZXREYXRhRm9yTm9kZShub2RlKTtcclxuICAgICAgICAgICAgdmFyIHZhbHVlR2V0dGVyID0gdGhhdC5jcmVhdGVWYWx1ZUdldHRlcihkYXRhLCBjb2x1bW4uY29sRGVmLCBub2RlKTtcclxuICAgICAgICAgICAgdGhhdC5jcmVhdGVDZWxsRnJvbUNvbERlZihmaXJzdENvbCwgY29sdW1uLCB2YWx1ZUdldHRlciwgbm9kZSwgcm93SW5kZXgsIGVNYWluUm93LCBlUGlubmVkUm93LCBuZXdDaGlsZFNjb3BlLCByZW5kZXJlZFJvdyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy90cnkgY29tcGlsaW5nIGFzIHdlIGluc2VydCByb3dzXHJcbiAgICByZW5kZXJlZFJvdy5waW5uZWRFbGVtZW50ID0gdGhpcy5jb21waWxlQW5kQWRkKHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIsIHJvd0luZGV4LCBlUGlubmVkUm93LCBuZXdDaGlsZFNjb3BlKTtcclxuICAgIHJlbmRlcmVkUm93LmJvZHlFbGVtZW50ID0gdGhpcy5jb21waWxlQW5kQWRkKHRoaXMuZUJvZHlDb250YWluZXIsIHJvd0luZGV4LCBlTWFpblJvdywgbmV3Q2hpbGRTY29wZSk7XHJcbn07XHJcblxyXG4vLyBpZiBncm91cCBpcyBhIGZvb3RlciwgYWx3YXlzIHNob3cgdGhlIGRhdGEuXHJcbi8vIGlmIGdyb3VwIGlzIGEgaGVhZGVyLCBvbmx5IHNob3cgZGF0YSBpZiBub3QgZXhwYW5kZWRcclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmdldERhdGFGb3JOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKG5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgLy8gaWYgZm9vdGVyLCB3ZSBhbHdheXMgc2hvdyB0aGUgZGF0YVxyXG4gICAgICAgIHJldHVybiBub2RlLmRhdGE7XHJcbiAgICB9IGVsc2UgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAvLyBpZiBoZWFkZXIgYW5kIGhlYWRlciBpcyBleHBhbmRlZCwgd2Ugc2hvdyBkYXRhIGluIGZvb3RlciBvbmx5XHJcbiAgICAgICAgdmFyIGZvb3RlcnNFbmFibGVkID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEluY2x1ZGVGb290ZXIoKTtcclxuICAgICAgICByZXR1cm4gKG5vZGUuZXhwYW5kZWQgJiYgZm9vdGVyc0VuYWJsZWQpID8gdW5kZWZpbmVkIDogbm9kZS5kYXRhO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvdGhlcndpc2UgaXQncyBhIG5vcm1hbCBub2RlLCBqdXN0IHJldHVybiBkYXRhIGFzIG5vcm1hbFxyXG4gICAgICAgIHJldHVybiBub2RlLmRhdGE7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlVmFsdWVHZXR0ZXIgPSBmdW5jdGlvbihkYXRhLCBjb2xEZWYsIG5vZGUpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXBpID0gdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKCk7XHJcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCk7XHJcbiAgICAgICAgcmV0dXJuIHV0aWxzLmdldFZhbHVlKHRoYXQuZXhwcmVzc2lvblNlcnZpY2UsIGRhdGEsIGNvbERlZiwgbm9kZSwgYXBpLCBjb250ZXh0KTtcclxuICAgIH07XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlQ2hpbGRTY29wZU9yTnVsbCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0FuZ3VsYXJDb21waWxlUm93cygpKSB7XHJcbiAgICAgICAgdmFyIG5ld0NoaWxkU2NvcGUgPSB0aGlzLiRzY29wZS4kbmV3KCk7XHJcbiAgICAgICAgbmV3Q2hpbGRTY29wZS5kYXRhID0gZGF0YTtcclxuICAgICAgICByZXR1cm4gbmV3Q2hpbGRTY29wZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY29tcGlsZUFuZEFkZCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgcm93SW5kZXgsIGVsZW1lbnQsIHNjb3BlKSB7XHJcbiAgICBpZiAoc2NvcGUpIHtcclxuICAgICAgICB2YXIgZUVsZW1lbnRDb21waWxlZCA9IHRoaXMuJGNvbXBpbGUoZWxlbWVudCkoc2NvcGUpO1xyXG4gICAgICAgIGlmIChjb250YWluZXIpIHsgLy8gY2hlY2tpbmcgY29udGFpbmVyLCBhcyBpZiBub1Njcm9sbCwgcGlubmVkIGNvbnRhaW5lciBpcyBtaXNzaW5nXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlRWxlbWVudENvbXBpbGVkWzBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGVFbGVtZW50Q29tcGlsZWRbMF07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChjb250YWluZXIpIHtcclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVDZWxsRnJvbUNvbERlZiA9IGZ1bmN0aW9uKGlzRmlyc3RDb2x1bW4sIGNvbHVtbiwgdmFsdWVHZXR0ZXIsIG5vZGUsIHJvd0luZGV4LCBlTWFpblJvdywgZVBpbm5lZFJvdywgJGNoaWxkU2NvcGUsIHJlbmRlcmVkUm93KSB7XHJcbiAgICB2YXIgZUdyaWRDZWxsID0gdGhpcy5jcmVhdGVDZWxsKGlzRmlyc3RDb2x1bW4sIGNvbHVtbiwgdmFsdWVHZXR0ZXIsIG5vZGUsIHJvd0luZGV4LCAkY2hpbGRTY29wZSk7XHJcblxyXG4gICAgaWYgKGNvbHVtbi5jb2xEZWYudm9sYXRpbGUpIHtcclxuICAgICAgICByZW5kZXJlZFJvdy5lVm9sYXRpbGVDZWxsc1tjb2x1bW4uY29sS2V5XSA9IGVHcmlkQ2VsbDtcclxuICAgIH1cclxuICAgIHJlbmRlcmVkUm93LmVDZWxsc1tjb2x1bW4uY29sS2V5XSA9IGVHcmlkQ2VsbDtcclxuXHJcbiAgICBpZiAoY29sdW1uLnBpbm5lZCkge1xyXG4gICAgICAgIGVQaW5uZWRSb3cuYXBwZW5kQ2hpbGQoZUdyaWRDZWxsKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZU1haW5Sb3cuYXBwZW5kQ2hpbGQoZUdyaWRDZWxsKTtcclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5hZGRDbGFzc2VzVG9Sb3cgPSBmdW5jdGlvbihyb3dJbmRleCwgbm9kZSwgZVJvdykge1xyXG4gICAgdmFyIGNsYXNzZXNMaXN0ID0gW1wiYWctcm93XCJdO1xyXG4gICAgY2xhc3Nlc0xpc3QucHVzaChyb3dJbmRleCAlIDIgPT0gMCA/IFwiYWctcm93LWV2ZW5cIiA6IFwiYWctcm93LW9kZFwiKTtcclxuXHJcbiAgICBpZiAodGhpcy5zZWxlY3Rpb25Db250cm9sbGVyLmlzTm9kZVNlbGVjdGVkKG5vZGUpKSB7XHJcbiAgICAgICAgY2xhc3Nlc0xpc3QucHVzaChcImFnLXJvdy1zZWxlY3RlZFwiKTtcclxuICAgIH1cclxuICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgLy8gaWYgYSBncm91cCwgcHV0IHRoZSBsZXZlbCBvZiB0aGUgZ3JvdXAgaW5cclxuICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LWxldmVsLVwiICsgbm9kZS5sZXZlbCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGlmIGEgbGVhZiwgYW5kIGEgcGFyZW50IGV4aXN0cywgcHV0IGEgbGV2ZWwgb2YgdGhlIHBhcmVudCwgZWxzZSBwdXQgbGV2ZWwgb2YgMCBmb3IgdG9wIGxldmVsIGl0ZW1cclxuICAgICAgICBpZiAobm9kZS5wYXJlbnQpIHtcclxuICAgICAgICAgICAgY2xhc3Nlc0xpc3QucHVzaChcImFnLXJvdy1sZXZlbC1cIiArIChub2RlLnBhcmVudC5sZXZlbCArIDEpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LWxldmVsLTBcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LWdyb3VwXCIpO1xyXG4gICAgfVxyXG4gICAgaWYgKG5vZGUuZ3JvdXAgJiYgIW5vZGUuZm9vdGVyICYmIG5vZGUuZXhwYW5kZWQpIHtcclxuICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LWdyb3VwLWV4cGFuZGVkXCIpO1xyXG4gICAgfVxyXG4gICAgaWYgKG5vZGUuZ3JvdXAgJiYgIW5vZGUuZm9vdGVyICYmICFub2RlLmV4cGFuZGVkKSB7XHJcbiAgICAgICAgLy8gb3Bwb3NpdGUgb2YgZXhwYW5kZWQgaXMgY29udHJhY3RlZCBhY2NvcmRpbmcgdG8gdGhlIGludGVybmV0LlxyXG4gICAgICAgIGNsYXNzZXNMaXN0LnB1c2goXCJhZy1yb3ctZ3JvdXAtY29udHJhY3RlZFwiKTtcclxuICAgIH1cclxuICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgY2xhc3Nlc0xpc3QucHVzaChcImFnLXJvdy1mb290ZXJcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWRkIGluIGV4dHJhIGNsYXNzZXMgcHJvdmlkZWQgYnkgdGhlIGNvbmZpZ1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0NsYXNzKCkpIHtcclxuICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpLFxyXG4gICAgICAgICAgICBhcGk6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgZXh0cmFSb3dDbGFzc2VzID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93Q2xhc3MoKShwYXJhbXMpO1xyXG4gICAgICAgIGlmIChleHRyYVJvd0NsYXNzZXMpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBleHRyYVJvd0NsYXNzZXMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKGV4dHJhUm93Q2xhc3Nlcyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShleHRyYVJvd0NsYXNzZXMpKSB7XHJcbiAgICAgICAgICAgICAgICBleHRyYVJvd0NsYXNzZXMuZm9yRWFjaChmdW5jdGlvbihjbGFzc0l0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKGNsYXNzSXRlbSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2xhc3NlcyA9IGNsYXNzZXNMaXN0LmpvaW4oXCIgXCIpO1xyXG5cclxuICAgIGVSb3cuY2xhc3NOYW1lID0gY2xhc3NlcztcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVSb3dDb250YWluZXIgPSBmdW5jdGlvbihyb3dJbmRleCwgbm9kZSwgZ3JvdXBSb3csICRzY29wZSkge1xyXG4gICAgdmFyIGVSb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG5cclxuICAgIHRoaXMuYWRkQ2xhc3Nlc1RvUm93KHJvd0luZGV4LCBub2RlLCBlUm93KTtcclxuXHJcbiAgICBlUm93LnNldEF0dHJpYnV0ZSgncm93Jywgcm93SW5kZXgpO1xyXG5cclxuICAgIC8vIGlmIHNob3dpbmcgc2Nyb2xscywgcG9zaXRpb24gb24gdGhlIGNvbnRhaW5lclxyXG4gICAgaWYgKCF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0RvbnRVc2VTY3JvbGxzKCkpIHtcclxuICAgICAgICBlUm93LnN0eWxlLnRvcCA9ICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dIZWlnaHQoKSAqIHJvd0luZGV4KSArIFwicHhcIjtcclxuICAgIH1cclxuICAgIGVSb3cuc3R5bGUuaGVpZ2h0ID0gKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0hlaWdodCgpKSArIFwicHhcIjtcclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93U3R5bGUoKSkge1xyXG4gICAgICAgIHZhciBjc3NUb1VzZTtcclxuICAgICAgICB2YXIgcm93U3R5bGUgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dTdHlsZSgpO1xyXG4gICAgICAgIGlmICh0eXBlb2Ygcm93U3R5bGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICBhcGk6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpLFxyXG4gICAgICAgICAgICAgICAgJHNjb3BlOiAkc2NvcGVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY3NzVG9Vc2UgPSByb3dTdHlsZShwYXJhbXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNzc1RvVXNlID0gcm93U3R5bGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY3NzVG9Vc2UpIHtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMoY3NzVG9Vc2UpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgICAgICBlUm93LnN0eWxlW2tleV0gPSBjc3NUb1VzZVtrZXldO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgIGVSb3cuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgX3RoaXMuYW5ndWxhckdyaWQub25Sb3dDbGlja2VkKGV2ZW50LCBOdW1iZXIodGhpcy5nZXRBdHRyaWJ1dGUoXCJyb3dcIikpLCBub2RlKVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGVSb3c7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuZ2V0SW5kZXhPZlJlbmRlcmVkTm9kZSA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIHZhciByZW5kZXJlZFJvd3MgPSB0aGlzLnJlbmRlcmVkUm93cztcclxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocmVuZGVyZWRSb3dzKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChyZW5kZXJlZFJvd3Nba2V5c1tpXV0ubm9kZSA9PT0gbm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyZWRSb3dzW2tleXNbaV1dLnJvd0luZGV4O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiAtMTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVHcm91cEVsZW1lbnQgPSBmdW5jdGlvbihub2RlLCBwYWRkaW5nKSB7XHJcbiAgICB2YXIgZVJvdztcclxuICAgIGlmIChwYWRkaW5nKSB7XHJcbiAgICAgICAgZVJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgICAgICByb3dJbmRleDogNCxcclxuICAgICAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKSxcclxuICAgICAgICAgICAgY29sRGVmOiB7XHJcbiAgICAgICAgICAgICAgICBjZWxsUmVuZGVyZXI6IHtcclxuICAgICAgICAgICAgICAgICAgICByZW5kZXJlcjogJ2dyb3VwJyxcclxuICAgICAgICAgICAgICAgICAgICBpbm5lclJlbmRlcmVyOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcm91cElubmVyUmVuZGVyZXIoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBlUm93ID0gdGhpcy5jZWxsUmVuZGVyZXJNYXBbJ2dyb3VwJ10ocGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobm9kZS5mb290ZXIpIHtcclxuICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhlUm93LCAnYWctZm9vdGVyLWNlbGwtZW50aXJlLXJvdycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhlUm93LCAnYWctZ3JvdXAtY2VsbC1lbnRpcmUtcm93Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVSb3c7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUucHV0RGF0YUludG9DZWxsID0gZnVuY3Rpb24oY29sdW1uLCB2YWx1ZSwgdmFsdWVHZXR0ZXIsIG5vZGUsICRjaGlsZFNjb3BlLCBlR3JpZENlbGwsIHJvd0luZGV4LCByZWZyZXNoQ2VsbEZ1bmN0aW9uKSB7XHJcbiAgICAvLyB0ZW1wbGF0ZSBnZXRzIHByZWZlcmVuY2UsIHRoZW4gY2VsbFJlbmRlcmVyLCB0aGVuIGRvIGl0IG91cnNlbHZlc1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcbiAgICBpZiAoY29sRGVmLnRlbXBsYXRlKSB7XHJcbiAgICAgICAgZUdyaWRDZWxsLmlubmVySFRNTCA9IGNvbERlZi50ZW1wbGF0ZTtcclxuICAgIH0gZWxzZSBpZiAoY29sRGVmLnRlbXBsYXRlVXJsKSB7XHJcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZVNlcnZpY2UuZ2V0VGVtcGxhdGUoY29sRGVmLnRlbXBsYXRlVXJsLCByZWZyZXNoQ2VsbEZ1bmN0aW9uKTtcclxuICAgICAgICBpZiAodGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgZUdyaWRDZWxsLmlubmVySFRNTCA9IHRlbXBsYXRlO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoY29sRGVmLmNlbGxSZW5kZXJlcikge1xyXG4gICAgICAgIHRoaXMudXNlQ2VsbFJlbmRlcmVyKGNvbHVtbiwgdmFsdWUsIG5vZGUsICRjaGlsZFNjb3BlLCBlR3JpZENlbGwsIHJvd0luZGV4LCByZWZyZXNoQ2VsbEZ1bmN0aW9uLCB2YWx1ZUdldHRlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGlmIHdlIGluc2VydCB1bmRlZmluZWQsIHRoZW4gaXQgZGlzcGxheXMgYXMgdGhlIHN0cmluZyAndW5kZWZpbmVkJywgdWdseSFcclxuICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gJycpIHtcclxuICAgICAgICAgICAgZUdyaWRDZWxsLmlubmVySFRNTCA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS51c2VDZWxsUmVuZGVyZXIgPSBmdW5jdGlvbihjb2x1bW4sIHZhbHVlLCBub2RlLCAkY2hpbGRTY29wZSwgZUdyaWRDZWxsLCByb3dJbmRleCwgcmVmcmVzaENlbGxGdW5jdGlvbiwgdmFsdWVHZXR0ZXIpIHtcclxuICAgIHZhciBjb2xEZWYgPSBjb2x1bW4uY29sRGVmO1xyXG4gICAgdmFyIHJlbmRlcmVyUGFyYW1zID0ge1xyXG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICB2YWx1ZUdldHRlcjogdmFsdWVHZXR0ZXIsXHJcbiAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgY29sdW1uOiBjb2x1bW4sXHJcbiAgICAgICAgJHNjb3BlOiAkY2hpbGRTY29wZSxcclxuICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKSxcclxuICAgICAgICBjb250ZXh0OiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCksXHJcbiAgICAgICAgcmVmcmVzaENlbGw6IHJlZnJlc2hDZWxsRnVuY3Rpb25cclxuICAgIH07XHJcbiAgICB2YXIgY2VsbFJlbmRlcmVyO1xyXG4gICAgaWYgKHR5cGVvZiBjb2xEZWYuY2VsbFJlbmRlcmVyID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIGNlbGxSZW5kZXJlciA9IHRoaXMuY2VsbFJlbmRlcmVyTWFwW2NvbERlZi5jZWxsUmVuZGVyZXIucmVuZGVyZXJdO1xyXG4gICAgICAgIGlmICghY2VsbFJlbmRlcmVyKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdDZWxsIHJlbmRlcmVyICcgKyBjb2xEZWYuY2VsbFJlbmRlcmVyICsgJyBub3QgZm91bmQsIGF2YWlsYWJsZSBhcmUgJyArIE9iamVjdC5rZXlzKHRoaXMuY2VsbFJlbmRlcmVyTWFwKTtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb2xEZWYuY2VsbFJlbmRlcmVyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgY2VsbFJlbmRlcmVyID0gY29sRGVmLmNlbGxSZW5kZXJlcjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgJ0NlbGwgUmVuZGVyZXIgbXVzdCBiZSBTdHJpbmcgb3IgRnVuY3Rpb24nO1xyXG4gICAgfVxyXG4gICAgdmFyIHJlc3VsdEZyb21SZW5kZXJlciA9IGNlbGxSZW5kZXJlcihyZW5kZXJlclBhcmFtcyk7XHJcbiAgICBpZiAodXRpbHMuaXNOb2RlT3JFbGVtZW50KHJlc3VsdEZyb21SZW5kZXJlcikpIHtcclxuICAgICAgICAvLyBhIGRvbSBub2RlIG9yIGVsZW1lbnQgd2FzIHJldHVybmVkLCBzbyBhZGQgY2hpbGRcclxuICAgICAgICBlR3JpZENlbGwuYXBwZW5kQ2hpbGQocmVzdWx0RnJvbVJlbmRlcmVyKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlIGFzc3VtZSBpdCB3YXMgaHRtbCwgc28ganVzdCBpbnNlcnRcclxuICAgICAgICBlR3JpZENlbGwuaW5uZXJIVE1MID0gcmVzdWx0RnJvbVJlbmRlcmVyO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmFkZFN0eWxlc0Zyb21Db2xsRGVmID0gZnVuY3Rpb24oY29sdW1uLCB2YWx1ZSwgbm9kZSwgJGNoaWxkU2NvcGUsIGVHcmlkQ2VsbCkge1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcbiAgICBpZiAoY29sRGVmLmNlbGxTdHlsZSkge1xyXG4gICAgICAgIHZhciBjc3NUb1VzZTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbERlZi5jZWxsU3R5bGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdmFyIGNlbGxTdHlsZVBhcmFtcyA9IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgICAgIGNvbHVtbjogY29sdW1uLFxyXG4gICAgICAgICAgICAgICAgJHNjb3BlOiAkY2hpbGRTY29wZSxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKSxcclxuICAgICAgICAgICAgICAgIGFwaTogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY3NzVG9Vc2UgPSBjb2xEZWYuY2VsbFN0eWxlKGNlbGxTdHlsZVBhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3NzVG9Vc2UgPSBjb2xEZWYuY2VsbFN0eWxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNzc1RvVXNlKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNzc1RvVXNlKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICAgICAgZUdyaWRDZWxsLnN0eWxlW2tleV0gPSBjc3NUb1VzZVtrZXldO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuYWRkQ2xhc3Nlc0Zyb21Db2xsRGVmID0gZnVuY3Rpb24oY29sRGVmLCB2YWx1ZSwgbm9kZSwgJGNoaWxkU2NvcGUsIGVHcmlkQ2VsbCkge1xyXG4gICAgaWYgKGNvbERlZi5jZWxsQ2xhc3MpIHtcclxuICAgICAgICB2YXIgY2xhc3NUb1VzZTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbERlZi5jZWxsQ2xhc3MgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdmFyIGNlbGxDbGFzc1BhcmFtcyA9IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgICAgICRzY29wZTogJGNoaWxkU2NvcGUsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0OiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCksXHJcbiAgICAgICAgICAgICAgICBhcGk6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNsYXNzVG9Vc2UgPSBjb2xEZWYuY2VsbENsYXNzKGNlbGxDbGFzc1BhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2xhc3NUb1VzZSA9IGNvbERlZi5jZWxsQ2xhc3M7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIGNsYXNzVG9Vc2UgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHV0aWxzLmFkZENzc0NsYXNzKGVHcmlkQ2VsbCwgY2xhc3NUb1VzZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGNsYXNzVG9Vc2UpKSB7XHJcbiAgICAgICAgICAgIGNsYXNzVG9Vc2UuZm9yRWFjaChmdW5jdGlvbihjc3NDbGFzc0l0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHV0aWxzLmFkZENzc0NsYXNzKGVHcmlkQ2VsbCwgY3NzQ2xhc3NJdGVtKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmFkZENsYXNzZXNUb0NlbGwgPSBmdW5jdGlvbihjb2x1bW4sIG5vZGUsIGVHcmlkQ2VsbCkge1xyXG4gICAgdmFyIGNsYXNzZXMgPSBbJ2FnLWNlbGwnLCAnYWctY2VsbC1uby1mb2N1cycsICdjZWxsLWNvbC0nICsgY29sdW1uLmluZGV4XTtcclxuICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgaWYgKG5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgICAgIGNsYXNzZXMucHVzaCgnYWctZm9vdGVyLWNlbGwnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjbGFzc2VzLnB1c2goJ2FnLWdyb3VwLWNlbGwnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlR3JpZENlbGwuY2xhc3NOYW1lID0gY2xhc3Nlcy5qb2luKCcgJyk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuYWRkQ2xhc3Nlc0Zyb21SdWxlcyA9IGZ1bmN0aW9uKGNvbERlZiwgZUdyaWRDZWxsLCB2YWx1ZSwgbm9kZSwgcm93SW5kZXgpIHtcclxuICAgIHZhciBjbGFzc1J1bGVzID0gY29sRGVmLmNlbGxDbGFzc1J1bGVzO1xyXG4gICAgaWYgKHR5cGVvZiBjbGFzc1J1bGVzID09PSAnb2JqZWN0Jykge1xyXG5cclxuICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKSxcclxuICAgICAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGNsYXNzTmFtZXMgPSBPYmplY3Qua2V5cyhjbGFzc1J1bGVzKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzTmFtZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGNsYXNzTmFtZXNbaV07XHJcbiAgICAgICAgICAgIHZhciBydWxlID0gY2xhc3NSdWxlc1tjbGFzc05hbWVdO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0T2ZSdWxlO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHJ1bGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRPZlJ1bGUgPSB0aGlzLmV4cHJlc3Npb25TZXJ2aWNlLmV2YWx1YXRlKHJ1bGUsIHBhcmFtcyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHJ1bGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdE9mUnVsZSA9IHJ1bGUocGFyYW1zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVzdWx0T2ZSdWxlKSB7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhlR3JpZENlbGwsIGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5yZW1vdmVDc3NDbGFzcyhlR3JpZENlbGwsIGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlQ2VsbCA9IGZ1bmN0aW9uKGlzRmlyc3RDb2x1bW4sIGNvbHVtbiwgdmFsdWVHZXR0ZXIsIG5vZGUsIHJvd0luZGV4LCAkY2hpbGRTY29wZSkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIGVHcmlkQ2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBlR3JpZENlbGwuc2V0QXR0cmlidXRlKFwiY29sXCIsIGNvbHVtbi5pbmRleCk7XHJcblxyXG4gICAgZUdyaWRDZWxsLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIFwiLTFcIik7XHJcblxyXG4gICAgdmFyIHZhbHVlO1xyXG4gICAgaWYgKHZhbHVlR2V0dGVyKSB7XHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZUdldHRlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoZXNlIGFyZSB0aGUgZ3JpZCBzdHlsZXMsIGRvbid0IGNoYW5nZSBiZXR3ZWVuIHNvZnQgcmVmcmVzaGVzXHJcbiAgICB0aGlzLmFkZENsYXNzZXNUb0NlbGwoY29sdW1uLCBub2RlLCBlR3JpZENlbGwpO1xyXG5cclxuICAgIHRoaXMucG9wdWxhdGVBbmRTdHlsZUdyaWRDZWxsKHZhbHVlR2V0dGVyLCB2YWx1ZSwgZUdyaWRDZWxsLCBpc0ZpcnN0Q29sdW1uLCBub2RlLCBjb2x1bW4sIHJvd0luZGV4LCAkY2hpbGRTY29wZSk7XHJcblxyXG4gICAgdGhpcy5hZGRDZWxsQ2xpY2tlZEhhbmRsZXIoZUdyaWRDZWxsLCBub2RlLCBjb2x1bW4sIHZhbHVlLCByb3dJbmRleCk7XHJcbiAgICB0aGlzLmFkZENlbGxEb3VibGVDbGlja2VkSGFuZGxlcihlR3JpZENlbGwsIG5vZGUsIGNvbHVtbiwgdmFsdWUsIHJvd0luZGV4LCAkY2hpbGRTY29wZSwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpO1xyXG5cclxuICAgIHRoaXMuYWRkQ2VsbE5hdmlnYXRpb25IYW5kbGVyKGVHcmlkQ2VsbCwgcm93SW5kZXgsIGNvbHVtbik7XHJcblxyXG4gICAgZUdyaWRDZWxsLnN0eWxlLndpZHRoID0gdXRpbHMuZm9ybWF0V2lkdGgoY29sdW1uLmFjdHVhbFdpZHRoKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlICdzdGFydCBlZGl0aW5nJyBjYWxsIHRvIHRoZSBjaGFpbiBvZiBlZGl0b3JzXHJcbiAgICB0aGlzLnJlbmRlcmVkUm93U3RhcnRFZGl0aW5nTGlzdGVuZXJzW3Jvd0luZGV4XVtjb2x1bW4uaW5kZXhdID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKHRoYXQuaXNDZWxsRWRpdGFibGUoY29sdW1uLmNvbERlZiwgbm9kZSkpIHtcclxuICAgICAgICAgICAgdGhhdC5zdGFydEVkaXRpbmcoZUdyaWRDZWxsLCBjb2x1bW4sIG5vZGUsICRjaGlsZFNjb3BlLCByb3dJbmRleCwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gZUdyaWRDZWxsO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmFkZENlbGxOYXZpZ2F0aW9uSGFuZGxlciA9IGZ1bmN0aW9uKGVHcmlkQ2VsbCwgcm93SW5kZXgsIGNvbHVtbikge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgZUdyaWRDZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIHZhciBrZXkgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlO1xyXG4gICAgICAgIGlmIChrZXkgPT09IERPV05fS0VZIHx8IGtleSA9PT0gVVBfS0VZIHx8IGtleSA9PT0gTEVGVF9LRVkgfHwga2V5ID09PSBSSUdIVF9LRVkpIHtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgdGhhdC5uYXZpZ2F0ZVRvTmV4dENlbGwoa2V5LCByb3dJbmRleCwgY29sdW1uKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5uYXZpZ2F0ZVRvTmV4dENlbGwgPSBmdW5jdGlvbihrZXksIHJvd0luZGV4LCBjb2x1bW4pIHtcclxuXHJcbiAgICB2YXIgcm93VG9Gb2N1cztcclxuICAgIHZhciBjb2xUb0ZvY3VzO1xyXG5cclxuICAgIHN3aXRjaCAoa2V5KSB7XHJcbiAgICAgICAgY2FzZSBVUF9LRVkgOlxyXG4gICAgICAgICAgICAvLyBpZiBhbHJlYWR5IG9uIHRvcCByb3csIGRvIG5vdGhpbmdcclxuICAgICAgICAgICAgaWYgKHJvd0luZGV4ID09PSB0aGlzLmZpcnN0VmlydHVhbFJlbmRlcmVkUm93KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcm93VG9Gb2N1cyA9IHJvd0luZGV4IC0gMTtcclxuICAgICAgICAgICAgY29sVG9Gb2N1cyA9IGNvbHVtbi5pbmRleDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBET1dOX0tFWSA6XHJcbiAgICAgICAgICAgIC8vIGlmIGFscmVhZHkgb24gYm90dG9tLCBkbyBub3RoaW5nXHJcbiAgICAgICAgICAgIGlmIChyb3dJbmRleCA9PT0gdGhpcy5sYXN0VmlydHVhbFJlbmRlcmVkUm93KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcm93VG9Gb2N1cyA9IHJvd0luZGV4ICsgMTtcclxuICAgICAgICAgICAgY29sVG9Gb2N1cyA9IGNvbHVtbi5pbmRleDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBSSUdIVF9LRVkgOlxyXG4gICAgICAgICAgICB2YXIgY29sVG9SaWdodCA9IHRoaXMuY29sdW1uTW9kZWwuZ2V0VmlzaWJsZUNvbEFmdGVyKGNvbHVtbik7XHJcbiAgICAgICAgICAgIC8vIGlmIGFscmVhZHkgb24gcmlnaHQsIGRvIG5vdGhpbmdcclxuICAgICAgICAgICAgaWYgKCFjb2xUb1JpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcm93VG9Gb2N1cyA9IHJvd0luZGV4IDtcclxuICAgICAgICAgICAgY29sVG9Gb2N1cyA9IGNvbFRvUmlnaHQuaW5kZXg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgTEVGVF9LRVkgOlxyXG4gICAgICAgICAgICB2YXIgY29sVG9MZWZ0ID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRWaXNpYmxlQ29sQmVmb3JlKGNvbHVtbik7XHJcbiAgICAgICAgICAgIC8vIGlmIGFscmVhZHkgb24gcmlnaHQsIGRvIG5vdGhpbmdcclxuICAgICAgICAgICAgaWYgKCFjb2xUb0xlZnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByb3dUb0ZvY3VzID0gcm93SW5kZXggO1xyXG4gICAgICAgICAgICBjb2xUb0ZvY3VzID0gY29sVG9MZWZ0LmluZGV4O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcmVuZGVyZWRSb3cgPSB0aGlzLnJlbmRlcmVkUm93c1tyb3dUb0ZvY3VzXTtcclxuICAgIHZhciBlQ2VsbCA9IHJlbmRlcmVkUm93LmVDZWxsc1tjb2xUb0ZvY3VzXTtcclxuXHJcbiAgICAvLyB0aGlzIHNjcm9sbHMgdGhlIHJvdyBpbnRvIHZpZXdcclxuICAgIHRoaXMuYW5ndWxhckdyaWQuZW5zdXJlSW5kZXhWaXNpYmxlKHJlbmRlcmVkUm93LnJvd0luZGV4KTtcclxuXHJcbiAgICAvLyB0aGlzIGNoYW5nZXMgdGhlIGNzcyBvbiB0aGUgY2VsbFxyXG4gICAgdGhpcy5mb2N1c0NlbGwocm93VG9Gb2N1cywgY29sVG9Gb2N1cyk7XHJcbiAgICAvLyB0aGlzIHB1dHMgdGhlIGJyb3dzZXIgZm9jdXMgb24gdGhlIGNlbGwgKHNvIGl0IGdldHMga2V5IHByZXNzZXMpXHJcbiAgICBlQ2VsbC5mb2N1cygpO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmZvY3VzQ2VsbCA9IGZ1bmN0aW9uKHJvd0luZGV4LCBjb2xJbmRleCkge1xyXG4gICAgLy8gcmVtb3ZlIGFueSBwcmV2aW91cyBmb2N1c1xyXG4gICAgdXRpbHMucXVlcnlTZWxlY3RvckFsbF9yZXBsYWNlQ3NzQ2xhc3ModGhpcy5lUGFyZW50T2ZSb3dzLCAnLmFnLWNlbGwtZm9jdXMnLCAnYWctY2VsbC1mb2N1cycsICdhZy1jZWxsLW5vLWZvY3VzJyk7XHJcblxyXG4gICAgdmFyIHNlbGVjdG9yRm9yQ2VsbCA9ICdbcm93PVwiJyArIHJvd0luZGV4ICsgJ1wiXSBbY29sPVwiJyArIGNvbEluZGV4ICsgJ1wiXSc7XHJcbiAgICB1dGlscy5xdWVyeVNlbGVjdG9yQWxsX3JlcGxhY2VDc3NDbGFzcyh0aGlzLmVQYXJlbnRPZlJvd3MsIHNlbGVjdG9yRm9yQ2VsbCwgJ2FnLWNlbGwtbm8tZm9jdXMnLCAnYWctY2VsbC1mb2N1cycpO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnBvcHVsYXRlQW5kU3R5bGVHcmlkQ2VsbCA9IGZ1bmN0aW9uKHZhbHVlR2V0dGVyLCB2YWx1ZSwgZUdyaWRDZWxsLCBpc0ZpcnN0Q29sdW1uLCBub2RlLCBjb2x1bW4sIHJvd0luZGV4LCAkY2hpbGRTY29wZSkge1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcblxyXG4gICAgLy8gcG9wdWxhdGVcclxuICAgIHRoaXMucG9wdWxhdGVHcmlkQ2VsbChlR3JpZENlbGwsIGlzRmlyc3RDb2x1bW4sIG5vZGUsIGNvbHVtbiwgcm93SW5kZXgsIHZhbHVlLCB2YWx1ZUdldHRlciwgJGNoaWxkU2NvcGUpO1xyXG4gICAgLy8gc3R5bGVcclxuICAgIHRoaXMuYWRkU3R5bGVzRnJvbUNvbGxEZWYoY29sdW1uLCB2YWx1ZSwgbm9kZSwgJGNoaWxkU2NvcGUsIGVHcmlkQ2VsbCk7XHJcbiAgICB0aGlzLmFkZENsYXNzZXNGcm9tQ29sbERlZihjb2xEZWYsIHZhbHVlLCBub2RlLCAkY2hpbGRTY29wZSwgZUdyaWRDZWxsKTtcclxuICAgIHRoaXMuYWRkQ2xhc3Nlc0Zyb21SdWxlcyhjb2xEZWYsIGVHcmlkQ2VsbCwgdmFsdWUsIG5vZGUsIHJvd0luZGV4KTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5wb3B1bGF0ZUdyaWRDZWxsID0gZnVuY3Rpb24oZUdyaWRDZWxsLCBpc0ZpcnN0Q29sdW1uLCBub2RlLCBjb2x1bW4sIHJvd0luZGV4LCB2YWx1ZSwgdmFsdWVHZXR0ZXIsICRjaGlsZFNjb3BlKSB7XHJcbiAgICB2YXIgZUNlbGxXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgZUdyaWRDZWxsLmFwcGVuZENoaWxkKGVDZWxsV3JhcHBlcik7XHJcblxyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcbiAgICBpZiAoY29sRGVmLmNoZWNrYm94U2VsZWN0aW9uKSB7XHJcbiAgICAgICAgdmFyIGVDaGVja2JveCA9IHRoaXMuc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LmNyZWF0ZVNlbGVjdGlvbkNoZWNrYm94KG5vZGUsIHJvd0luZGV4KTtcclxuICAgICAgICBlQ2VsbFdyYXBwZXIuYXBwZW5kQ2hpbGQoZUNoZWNrYm94KTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZVNwYW5XaXRoVmFsdWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgIGVDZWxsV3JhcHBlci5hcHBlbmRDaGlsZChlU3BhbldpdGhWYWx1ZSk7XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIHJlZnJlc2hDZWxsRnVuY3Rpb24gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGF0LnNvZnRSZWZyZXNoQ2VsbChlR3JpZENlbGwsIGlzRmlyc3RDb2x1bW4sIG5vZGUsIGNvbHVtbiwgJGNoaWxkU2NvcGUsIHJvd0luZGV4KTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5wdXREYXRhSW50b0NlbGwoY29sdW1uLCB2YWx1ZSwgdmFsdWVHZXR0ZXIsIG5vZGUsICRjaGlsZFNjb3BlLCBlU3BhbldpdGhWYWx1ZSwgcm93SW5kZXgsIHJlZnJlc2hDZWxsRnVuY3Rpb24pO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmFkZENlbGxEb3VibGVDbGlja2VkSGFuZGxlciA9IGZ1bmN0aW9uKGVHcmlkQ2VsbCwgbm9kZSwgY29sdW1uLCB2YWx1ZSwgcm93SW5kZXgsICRjaGlsZFNjb3BlLCBpc0ZpcnN0Q29sdW1uLCB2YWx1ZUdldHRlcikge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcbiAgICBlR3JpZENlbGwuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxEb3VibGVDbGlja2VkKCkpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmFtc0ZvckdyaWQgPSB7XHJcbiAgICAgICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgcm93SW5kZXg6IHJvd0luZGV4LFxyXG4gICAgICAgICAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgICAgICAgICBldmVudDogZXZlbnQsXHJcbiAgICAgICAgICAgICAgICBldmVudFNvdXJjZTogdGhpcyxcclxuICAgICAgICAgICAgICAgIGFwaTogdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q2VsbERvdWJsZUNsaWNrZWQoKShwYXJhbXNGb3JHcmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbERlZi5jZWxsRG91YmxlQ2xpY2tlZCkge1xyXG4gICAgICAgICAgICB2YXIgcGFyYW1zRm9yQ29sRGVmID0ge1xyXG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgICAgICAgICAgZXZlbnRTb3VyY2U6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBhcGk6IHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbERlZi5jZWxsRG91YmxlQ2xpY2tlZChwYXJhbXNGb3JDb2xEZWYpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhhdC5pc0NlbGxFZGl0YWJsZShjb2xEZWYsIG5vZGUpKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc3RhcnRFZGl0aW5nKGVHcmlkQ2VsbCwgY29sdW1uLCBub2RlLCAkY2hpbGRTY29wZSwgcm93SW5kZXgsIGlzRmlyc3RDb2x1bW4sIHZhbHVlR2V0dGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5hZGRDZWxsQ2xpY2tlZEhhbmRsZXIgPSBmdW5jdGlvbihlR3JpZENlbGwsIG5vZGUsIGNvbHVtbiwgdmFsdWUsIHJvd0luZGV4KSB7XHJcbiAgICB2YXIgY29sRGVmID0gY29sdW1uLmNvbERlZjtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGVHcmlkQ2VsbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAvL3RoYXQuZm9jdXNDZWxsKHJvd0luZGV4LCBjb2x1bW4uaW5kZXgpO1xyXG4gICAgICAgIGlmICh0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRDZWxsQ2xpY2tlZCgpKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXJhbXNGb3JHcmlkID0ge1xyXG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgICAgICAgICAgZXZlbnRTb3VyY2U6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBhcGk6IHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxDbGlja2VkKCkocGFyYW1zRm9yR3JpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb2xEZWYuY2VsbENsaWNrZWQpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmFtc0ZvckNvbERlZiA9IHtcclxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudCxcclxuICAgICAgICAgICAgICAgIGV2ZW50U291cmNlOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYXBpOiB0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb2xEZWYuY2VsbENsaWNrZWQocGFyYW1zRm9yQ29sRGVmKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5pc0NlbGxFZGl0YWJsZSA9IGZ1bmN0aW9uKGNvbERlZiwgbm9kZSkge1xyXG4gICAgaWYgKHRoaXMuZWRpdGluZ0NlbGwpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbmV2ZXIgYWxsb3cgZWRpdGluZyBvZiBncm91cHNcclxuICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGJvb2xlYW4gc2V0LCB0aGVuIGp1c3QgdXNlIGl0XHJcbiAgICBpZiAodHlwZW9mIGNvbERlZi5lZGl0YWJsZSA9PT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgcmV0dXJuIGNvbERlZi5lZGl0YWJsZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBmdW5jdGlvbiwgdGhlbiBjYWxsIHRoZSBmdW5jdGlvbiB0byBmaW5kIG91dFxyXG4gICAgaWYgKHR5cGVvZiBjb2xEZWYuZWRpdGFibGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAvLyBzaG91bGQgY2hhbmdlIHRoaXMsIHNvIGl0IGdldHMgcGFzc2VkIHBhcmFtcyB3aXRoIG5pY2UgdXNlZnVsIHZhbHVlc1xyXG4gICAgICAgIHJldHVybiBjb2xEZWYuZWRpdGFibGUobm9kZS5kYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuc3RvcEVkaXRpbmcgPSBmdW5jdGlvbihlR3JpZENlbGwsIGNvbHVtbiwgbm9kZSwgJGNoaWxkU2NvcGUsIGVJbnB1dCwgYmx1ckxpc3RlbmVyLCByb3dJbmRleCwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpIHtcclxuICAgIHRoaXMuZWRpdGluZ0NlbGwgPSBmYWxzZTtcclxuICAgIHZhciBuZXdWYWx1ZSA9IGVJbnB1dC52YWx1ZTtcclxuICAgIHZhciBjb2xEZWYgPSBjb2x1bW4uY29sRGVmO1xyXG5cclxuICAgIC8vSWYgd2UgZG9uJ3QgcmVtb3ZlIHRoZSBibHVyIGxpc3RlbmVyIGZpcnN0LCB3ZSBnZXQ6XHJcbiAgICAvL1VuY2F1Z2h0IE5vdEZvdW5kRXJyb3I6IEZhaWxlZCB0byBleGVjdXRlICdyZW1vdmVDaGlsZCcgb24gJ05vZGUnOiBUaGUgbm9kZSB0byBiZSByZW1vdmVkIGlzIG5vIGxvbmdlciBhIGNoaWxkIG9mIHRoaXMgbm9kZS4gUGVyaGFwcyBpdCB3YXMgbW92ZWQgaW4gYSAnYmx1cicgZXZlbnQgaGFuZGxlcj9cclxuICAgIGVJbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgYmx1ckxpc3RlbmVyKTtcclxuXHJcbiAgICB1dGlscy5yZW1vdmVBbGxDaGlsZHJlbihlR3JpZENlbGwpO1xyXG5cclxuICAgIHZhciBwYXJhbXNGb3JDYWxsYmFja3MgPSB7XHJcbiAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgb2xkVmFsdWU6IG5vZGUuZGF0YVtjb2xEZWYuZmllbGRdLFxyXG4gICAgICAgIG5ld1ZhbHVlOiBuZXdWYWx1ZSxcclxuICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKSxcclxuICAgICAgICBjb250ZXh0OiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KClcclxuICAgIH07XHJcblxyXG4gICAgaWYgKGNvbERlZi5uZXdWYWx1ZUhhbmRsZXIpIHtcclxuICAgICAgICBjb2xEZWYubmV3VmFsdWVIYW5kbGVyKHBhcmFtc0ZvckNhbGxiYWNrcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5vZGUuZGF0YVtjb2xEZWYuZmllbGRdID0gbmV3VmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYXQgdGhpcyBwb2ludCwgdGhlIHZhbHVlIGhhcyBiZWVuIHVwZGF0ZWRcclxuICAgIHZhciBuZXdWYWx1ZTtcclxuICAgIGlmICh2YWx1ZUdldHRlcikge1xyXG4gICAgICAgIG5ld1ZhbHVlID0gdmFsdWVHZXR0ZXIoKTtcclxuICAgIH1cclxuICAgIHBhcmFtc0ZvckNhbGxiYWNrcy5uZXdWYWx1ZSA9IG5ld1ZhbHVlO1xyXG4gICAgaWYgKHR5cGVvZiBjb2xEZWYuY2VsbFZhbHVlQ2hhbmdlZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIGNvbERlZi5jZWxsVmFsdWVDaGFuZ2VkKHBhcmFtc0ZvckNhbGxiYWNrcyk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxWYWx1ZUNoYW5nZWQoKSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxWYWx1ZUNoYW5nZWQoKShwYXJhbXNGb3JDYWxsYmFja3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucG9wdWxhdGVBbmRTdHlsZUdyaWRDZWxsKHZhbHVlR2V0dGVyLCBuZXdWYWx1ZSwgZUdyaWRDZWxsLCBpc0ZpcnN0Q29sdW1uLCBub2RlLCBjb2x1bW4sIHJvd0luZGV4LCAkY2hpbGRTY29wZSk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuc3RhcnRFZGl0aW5nID0gZnVuY3Rpb24oZUdyaWRDZWxsLCBjb2x1bW4sIG5vZGUsICRjaGlsZFNjb3BlLCByb3dJbmRleCwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHRoaXMuZWRpdGluZ0NlbGwgPSB0cnVlO1xyXG4gICAgdXRpbHMucmVtb3ZlQWxsQ2hpbGRyZW4oZUdyaWRDZWxsKTtcclxuICAgIHZhciBlSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgZUlucHV0LnR5cGUgPSAndGV4dCc7XHJcbiAgICB1dGlscy5hZGRDc3NDbGFzcyhlSW5wdXQsICdhZy1jZWxsLWVkaXQtaW5wdXQnKTtcclxuXHJcbiAgICBpZiAodmFsdWVHZXR0ZXIpIHtcclxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUdldHRlcigpO1xyXG4gICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGVJbnB1dC52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBlSW5wdXQuc3R5bGUud2lkdGggPSAoY29sdW1uLmFjdHVhbFdpZHRoIC0gMTQpICsgJ3B4JztcclxuICAgIGVHcmlkQ2VsbC5hcHBlbmRDaGlsZChlSW5wdXQpO1xyXG4gICAgZUlucHV0LmZvY3VzKCk7XHJcbiAgICBlSW5wdXQuc2VsZWN0KCk7XHJcblxyXG4gICAgdmFyIGJsdXJMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQuc3RvcEVkaXRpbmcoZUdyaWRDZWxsLCBjb2x1bW4sIG5vZGUsICRjaGlsZFNjb3BlLCBlSW5wdXQsIGJsdXJMaXN0ZW5lciwgcm93SW5kZXgsIGlzRmlyc3RDb2x1bW4sIHZhbHVlR2V0dGVyKTtcclxuICAgIH07XHJcblxyXG4gICAgLy9zdG9wIGVudGVyaW5nIGlmIHdlIGxvb3NlIGZvY3VzXHJcbiAgICBlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgYmx1ckxpc3RlbmVyKTtcclxuXHJcbiAgICAvL3N0b3AgZWRpdGluZyBpZiBlbnRlciBwcmVzc2VkXHJcbiAgICBlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIHZhciBrZXkgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlO1xyXG4gICAgICAgIC8vIDEzIGlzIGVudGVyXHJcbiAgICAgICAgaWYgKGtleSA9PSBFTlRFUl9LRVkpIHtcclxuICAgICAgICAgICAgdGhhdC5zdG9wRWRpdGluZyhlR3JpZENlbGwsIGNvbHVtbiwgbm9kZSwgJGNoaWxkU2NvcGUsIGVJbnB1dCwgYmx1ckxpc3RlbmVyLCByb3dJbmRleCwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIHRhYiBrZXkgZG9lc24ndCBnZW5lcmF0ZSBrZXlwcmVzcywgc28gbmVlZCBrZXlkb3duIHRvIGxpc3RlbiBmb3IgdGhhdFxyXG4gICAgZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIHZhciBrZXkgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlO1xyXG4gICAgICAgIGlmIChrZXkgPT0gVEFCX0tFWSkge1xyXG4gICAgICAgICAgICB0aGF0LnN0b3BFZGl0aW5nKGVHcmlkQ2VsbCwgY29sdW1uLCBub2RlLCAkY2hpbGRTY29wZSwgZUlucHV0LCBibHVyTGlzdGVuZXIsIHJvd0luZGV4LCBpc0ZpcnN0Q29sdW1uLCB2YWx1ZUdldHRlcik7XHJcbiAgICAgICAgICAgIHRoYXQuc3RhcnRFZGl0aW5nTmV4dENlbGwocm93SW5kZXgsIGNvbHVtbiwgZXZlbnQuc2hpZnRLZXkpO1xyXG4gICAgICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRoZSBkZWZhdWx0IHRhYiBhY3Rpb24sIHNvIHJldHVybiBmYWxzZSwgdGhpcyBzdG9wcyB0aGUgZXZlbnQgZnJvbSBidWJibGluZ1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuc3RhcnRFZGl0aW5nTmV4dENlbGwgPSBmdW5jdGlvbihyb3dJbmRleCwgY29sdW1uLCBzaGlmdEtleSkge1xyXG5cclxuICAgIHZhciBmaXJzdFJvd1RvQ2hlY2sgPSB0aGlzLmZpcnN0VmlydHVhbFJlbmRlcmVkUm93O1xyXG4gICAgdmFyIGxhc3RSb3dUb0NoZWNrID0gdGhpcy5sYXN0VmlydHVhbFJlbmRlcmVkUm93O1xyXG4gICAgdmFyIGN1cnJlbnRSb3dJbmRleCA9IHJvd0luZGV4O1xyXG5cclxuICAgIHZhciB2aXNpYmxlQ29sdW1ucyA9IHRoaXMuY29sdW1uTW9kZWwuZ2V0VmlzaWJsZUNvbHVtbnMoKTtcclxuICAgIHZhciBjdXJyZW50Q29sID0gY29sdW1uO1xyXG5cclxuICAgIHdoaWxlICh0cnVlKSB7XHJcblxyXG4gICAgICAgIHZhciBpbmRleE9mQ3VycmVudENvbCA9IHZpc2libGVDb2x1bW5zLmluZGV4T2YoY3VycmVudENvbCk7XHJcblxyXG4gICAgICAgIC8vIG1vdmUgYmFja3dhcmRcclxuICAgICAgICBpZiAoc2hpZnRLZXkpIHtcclxuICAgICAgICAgICAgLy8gbW92ZSBhbG9uZyB0byB0aGUgcHJldmlvdXMgY2VsbFxyXG4gICAgICAgICAgICBjdXJyZW50Q29sID0gdmlzaWJsZUNvbHVtbnNbaW5kZXhPZkN1cnJlbnRDb2wgLSAxXTtcclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgZW5kIG9mIHRoZSByb3csIGFuZCBpZiBzbywgZ28gYmFjayBhIHJvd1xyXG4gICAgICAgICAgICBpZiAoIWN1cnJlbnRDb2wpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRDb2wgPSB2aXNpYmxlQ29sdW1uc1t2aXNpYmxlQ29sdW1ucy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRSb3dJbmRleC0tO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBnb3QgdG8gZW5kIG9mIHJlbmRlcmVkIHJvd3MsIHRoZW4gcXVpdCBsb29raW5nXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50Um93SW5kZXggPCBmaXJzdFJvd1RvQ2hlY2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBtb3ZlIGZvcndhcmRcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBtb3ZlIGFsb25nIHRvIHRoZSBuZXh0IGNlbGxcclxuICAgICAgICAgICAgY3VycmVudENvbCA9IHZpc2libGVDb2x1bW5zW2luZGV4T2ZDdXJyZW50Q29sICsgMV07XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIGVuZCBvZiB0aGUgcm93LCBhbmQgaWYgc28sIGdvIGZvcndhcmQgYSByb3dcclxuICAgICAgICAgICAgaWYgKCFjdXJyZW50Q29sKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50Q29sID0gdmlzaWJsZUNvbHVtbnNbMF07XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50Um93SW5kZXgrKztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgZ290IHRvIGVuZCBvZiByZW5kZXJlZCByb3dzLCB0aGVuIHF1aXQgbG9va2luZ1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudFJvd0luZGV4ID4gbGFzdFJvd1RvQ2hlY2spIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIG5leHRGdW5jID0gdGhpcy5yZW5kZXJlZFJvd1N0YXJ0RWRpdGluZ0xpc3RlbmVyc1tjdXJyZW50Um93SW5kZXhdW2N1cnJlbnRDb2wuY29sS2V5XTtcclxuICAgICAgICBpZiAobmV4dEZ1bmMpIHtcclxuICAgICAgICAgICAgLy8gc2VlIGlmIHRoZSBuZXh0IGNlbGwgaXMgZWRpdGFibGUsIGFuZCBpZiBzbywgd2UgaGF2ZSBjb21lIHRvXHJcbiAgICAgICAgICAgIC8vIHRoZSBlbmQgb2Ygb3VyIHNlYXJjaCwgc28gc3RvcCBsb29raW5nIGZvciB0aGUgbmV4dCBjZWxsXHJcbiAgICAgICAgICAgIHZhciBuZXh0Q2VsbEFjY2VwdGVkRWRpdCA9IG5leHRGdW5jKCk7XHJcbiAgICAgICAgICAgIGlmIChuZXh0Q2VsbEFjY2VwdGVkRWRpdCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUm93UmVuZGVyZXI7XHJcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxuXHJcbi8vIHRoZXNlIGNvbnN0YW50cyBhcmUgdXNlZCBmb3IgZGV0ZXJtaW5pbmcgaWYgZ3JvdXBzIHNob3VsZFxyXG4vLyBiZSBzZWxlY3RlZCBvciBkZXNlbGVjdGVkIHdoZW4gc2VsZWN0aW5nIGdyb3VwcywgYW5kIHRoZSBncm91cFxyXG4vLyB0aGVuIHNlbGVjdHMgdGhlIGNoaWxkcmVuLlxyXG52YXIgU0VMRUNURUQgPSAwO1xyXG52YXIgVU5TRUxFQ1RFRCA9IDE7XHJcbnZhciBNSVhFRCA9IDI7XHJcbnZhciBET19OT1RfQ0FSRSA9IDM7XHJcblxyXG5mdW5jdGlvbiBTZWxlY3Rpb25Db250cm9sbGVyKCkge31cclxuXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihhbmd1bGFyR3JpZCwgZVJvd3NQYXJlbnQsIGdyaWRPcHRpb25zV3JhcHBlciwgJHNjb3BlLCByb3dSZW5kZXJlcikge1xyXG4gICAgdGhpcy5lUm93c1BhcmVudCA9IGVSb3dzUGFyZW50O1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkO1xyXG4gICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIgPSBncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB0aGlzLiRzY29wZSA9ICRzY29wZTtcclxuICAgIHRoaXMucm93UmVuZGVyZXIgPSByb3dSZW5kZXJlcjtcclxuXHJcbiAgICB0aGlzLnNlbGVjdGVkTm9kZXNCeUlkID0ge307XHJcbiAgICB0aGlzLnNlbGVjdGVkUm93cyA9IFtdO1xyXG5cclxuICAgIGdyaWRPcHRpb25zV3JhcHBlci5zZXRTZWxlY3RlZFJvd3ModGhpcy5zZWxlY3RlZFJvd3MpO1xyXG4gICAgZ3JpZE9wdGlvbnNXcmFwcGVyLnNldFNlbGVjdGVkTm9kZXNCeUlkKHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWQpO1xyXG59O1xyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0U2VsZWN0ZWROb2RlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHNlbGVjdGVkTm9kZXMgPSBbXTtcclxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcy5zZWxlY3RlZE5vZGVzQnlJZCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgaWQgPSBrZXlzW2ldO1xyXG4gICAgICAgIHZhciBzZWxlY3RlZE5vZGUgPSB0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW2lkXTtcclxuICAgICAgICBzZWxlY3RlZE5vZGVzLnB1c2goc2VsZWN0ZWROb2RlKTtcclxuICAgIH1cclxuICAgIHJldHVybiBzZWxlY3RlZE5vZGVzO1xyXG59O1xyXG5cclxuLy8gcmV0dXJucyBhIGxpc3Qgb2YgYWxsIG5vZGVzIGF0ICdiZXN0IGNvc3QnIC0gYSBmZWF0dXJlIHRvIGJlIHVzZWRcclxuLy8gd2l0aCBncm91cHMgLyB0cmVlcy4gaWYgYSBncm91cCBoYXMgYWxsIGl0J3MgY2hpbGRyZW4gc2VsZWN0ZWQsXHJcbi8vIHRoZW4gdGhlIGdyb3VwIGFwcGVhcnMgaW4gdGhlIHJlc3VsdCwgYnV0IG5vdCB0aGUgY2hpbGRyZW4uXHJcbi8vIERlc2lnbmVkIGZvciB1c2Ugd2l0aCAnY2hpbGRyZW4nIGFzIHRoZSBncm91cCBzZWxlY3Rpb24gdHlwZSxcclxuLy8gd2hlcmUgZ3JvdXBzIGRvbid0IGFjdHVhbGx5IGFwcGVhciBpbiB0aGUgc2VsZWN0aW9uIG5vcm1hbGx5LlxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5nZXRCZXN0Q29zdE5vZGVTZWxlY3Rpb24gPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBpZiAodHlwZW9mIHRoaXMucm93TW9kZWwuZ2V0VG9wTGV2ZWxOb2RlcyAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRocm93ICdzZWxlY3RBbGwgbm90IGF2YWlsYWJsZSB3aGVuIHJvd3MgYXJlIG9uIHRoZSBzZXJ2ZXInO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0b3BMZXZlbE5vZGVzID0gdGhpcy5yb3dNb2RlbC5nZXRUb3BMZXZlbE5vZGVzKCk7XHJcblxyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIC8vIHJlY3Vyc2l2ZSBmdW5jdGlvbiwgdG8gZmluZCB0aGUgc2VsZWN0ZWQgbm9kZXNcclxuICAgIGZ1bmN0aW9uIHRyYXZlcnNlKG5vZGVzKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBub2Rlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICAgICAgaWYgKHRoYXQuaXNOb2RlU2VsZWN0ZWQobm9kZSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5vZGUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgbm90IHNlbGVjdGVkLCB0aGVuIGlmIGl0J3MgYSBncm91cCwgYW5kIHRoZSBncm91cFxyXG4gICAgICAgICAgICAgICAgLy8gaGFzIGNoaWxkcmVuLCBjb250aW51ZSB0byBzZWFyY2ggZm9yIHNlbGVjdGlvbnNcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmF2ZXJzZShub2RlLmNoaWxkcmVuKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0cmF2ZXJzZSh0b3BMZXZlbE5vZGVzKTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuc2V0Um93TW9kZWwgPSBmdW5jdGlvbihyb3dNb2RlbCkge1xyXG4gICAgdGhpcy5yb3dNb2RlbCA9IHJvd01vZGVsO1xyXG59O1xyXG5cclxuLy8gcHVibGljIC0gdGhpcyBjbGVhcnMgdGhlIHNlbGVjdGlvbiwgYnV0IGRvZXNuJ3QgY2xlYXIgZG93biB0aGUgY3NzIC0gd2hlbiBpdCBpcyBjYWxsZWQsIHRoZVxyXG4vLyBjYWxsZXIgdGhlbiBnZXRzIHRoZSBncmlkIHRvIHJlZnJlc2guXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmRlc2VsZWN0QWxsID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNlbGVjdGVkUm93cy5sZW5ndGggPSAwO1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW2tleXNbaV1dO1xyXG4gICAgfVxyXG4gICAgdGhpcy5zeW5jU2VsZWN0ZWRSb3dzQW5kQ2FsbExpc3RlbmVyKCk7XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgLSB0aGlzIHNlbGVjdHMgZXZlcnl0aGluZywgYnV0IGRvZXNuJ3QgY2xlYXIgZG93biB0aGUgY3NzIC0gd2hlbiBpdCBpcyBjYWxsZWQsIHRoZVxyXG4vLyBjYWxsZXIgdGhlbiBnZXRzIHRoZSBncmlkIHRvIHJlZnJlc2guXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnNlbGVjdEFsbCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmICh0eXBlb2YgdGhpcy5yb3dNb2RlbC5nZXRUb3BMZXZlbE5vZGVzICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhyb3cgJ3NlbGVjdEFsbCBub3QgYXZhaWxhYmxlIHdoZW4gcm93cyBhcmUgb24gdGhlIHNlcnZlcic7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNlbGVjdGVkTm9kZXNCeUlkID0gdGhpcy5zZWxlY3RlZE5vZGVzQnlJZDtcclxuICAgIC8vIGlmIHRoZSBzZWxlY3Rpb24gaXMgXCJkb24ndCBpbmNsdWRlIGdyb3Vwc1wiLCB0aGVuIHdlIGRvbid0IGluY2x1ZGUgdGhlbSFcclxuICAgIHZhciBpbmNsdWRlR3JvdXBzID0gIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBTZWxlY3RzQ2hpbGRyZW4oKTtcclxuXHJcbiAgICBmdW5jdGlvbiByZWN1cnNpdmVseVNlbGVjdChub2Rlcykge1xyXG4gICAgICAgIGlmIChub2Rlcykge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaTxub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVjdXJzaXZlbHlTZWxlY3Qobm9kZS5jaGlsZHJlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVHcm91cHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWROb2Rlc0J5SWRbbm9kZS5pZF0gPSBub2RlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWROb2Rlc0J5SWRbbm9kZS5pZF0gPSBub2RlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciB0b3BMZXZlbE5vZGVzID0gdGhpcy5yb3dNb2RlbC5nZXRUb3BMZXZlbE5vZGVzKCk7XHJcbiAgICByZWN1cnNpdmVseVNlbGVjdCh0b3BMZXZlbE5vZGVzKTtcclxuXHJcbiAgICB0aGlzLnN5bmNTZWxlY3RlZFJvd3NBbmRDYWxsTGlzdGVuZXIoKTtcclxufTtcclxuXHJcbi8vIHB1YmxpY1xyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5zZWxlY3ROb2RlID0gZnVuY3Rpb24obm9kZSwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICB2YXIgbXVsdGlTZWxlY3QgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc1Jvd1NlbGVjdGlvbk11bHRpKCkgJiYgdHJ5TXVsdGk7XHJcblxyXG4gICAgLy8gaWYgdGhlIG5vZGUgaXMgYSBncm91cCwgdGhlbiBzZWxlY3RpbmcgdGhpcyBpcyB0aGUgc2FtZSBhcyBzZWxlY3RpbmcgdGhlIHBhcmVudCxcclxuICAgIC8vIHNvIHRvIGhhdmUgb25seSBvbmUgZmxvdyB0aHJvdWdoIHRoZSBiZWxvdywgd2UgYWx3YXlzIHNlbGVjdCB0aGUgaGVhZGVyIHBhcmVudFxyXG4gICAgLy8gKHdoaWNoIHRoZW4gaGFzIHRoZSBzaWRlIGVmZmVjdCBvZiBzZWxlY3RpbmcgdGhlIGNoaWxkKS5cclxuICAgIHZhciBub2RlVG9TZWxlY3Q7XHJcbiAgICBpZiAobm9kZS5mb290ZXIpIHtcclxuICAgICAgICBub2RlVG9TZWxlY3QgPSBub2RlLnNpYmxpbmc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5vZGVUb1NlbGVjdCA9IG5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYXQgdGhlIGVuZCwgaWYgdGhpcyBpcyB0cnVlLCB3ZSBpbmZvcm0gdGhlIGNhbGxiYWNrXHJcbiAgICB2YXIgYXRMZWFzdE9uZUl0ZW1VbnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICB2YXIgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIHNlZSBpZiByb3dzIHRvIGJlIGRlc2VsZWN0ZWRcclxuICAgIGlmICghbXVsdGlTZWxlY3QpIHtcclxuICAgICAgICBhdExlYXN0T25lSXRlbVVuc2VsZWN0ZWQgPSB0aGlzLmRvV29ya09mRGVzZWxlY3RBbGxOb2RlcygpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwU2VsZWN0c0NoaWxkcmVuKCkgJiYgbm9kZVRvU2VsZWN0Lmdyb3VwKSB7XHJcbiAgICAgICAgLy8gZG9uJ3Qgc2VsZWN0IHRoZSBncm91cCwgc2VsZWN0IHRoZSBjaGlsZHJlbiBpbnN0ZWFkXHJcbiAgICAgICAgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCA9IHRoaXMucmVjdXJzaXZlbHlTZWxlY3RBbGxDaGlsZHJlbihub2RlVG9TZWxlY3QpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBzZWUgaWYgcm93IG5lZWRzIHRvIGJlIHNlbGVjdGVkXHJcbiAgICAgICAgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCA9IHRoaXMuZG9Xb3JrT2ZTZWxlY3ROb2RlKG5vZGVUb1NlbGVjdCwgc3VwcHJlc3NFdmVudHMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhdExlYXN0T25lSXRlbVVuc2VsZWN0ZWQgfHwgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCkge1xyXG4gICAgICAgIHRoaXMuc3luY1NlbGVjdGVkUm93c0FuZENhbGxMaXN0ZW5lcihzdXBwcmVzc0V2ZW50cyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51cGRhdGVHcm91cFBhcmVudHNJZk5lZWRlZCgpO1xyXG59O1xyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlTZWxlY3RBbGxDaGlsZHJlbiA9IGZ1bmN0aW9uKG5vZGUsIHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICB2YXIgYXRMZWFzdE9uZSA9IGZhbHNlO1xyXG4gICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZWN1cnNpdmVseVNlbGVjdEFsbENoaWxkcmVuKGNoaWxkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0TGVhc3RPbmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZG9Xb3JrT2ZTZWxlY3ROb2RlKGNoaWxkLCBzdXBwcmVzc0V2ZW50cykpIHtcclxuICAgICAgICAgICAgICAgICAgICBhdExlYXN0T25lID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhdExlYXN0T25lO1xyXG59O1xyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlEZXNlbGVjdEFsbENoaWxkcmVuID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5RGVzZWxlY3RBbGxDaGlsZHJlbihjaGlsZCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0UmVhbE5vZGUoY2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyAxIC0gc2VsZWN0cyBhIG5vZGVcclxuLy8gMiAtIHVwZGF0ZXMgdGhlIFVJXHJcbi8vIDMgLSBjYWxscyBjYWxsYmFja3NcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZG9Xb3JrT2ZTZWxlY3ROb2RlID0gZnVuY3Rpb24obm9kZSwgc3VwcHJlc3NFdmVudHMpIHtcclxuICAgIGlmICh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW25vZGUuaWRdKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRbbm9kZS5pZF0gPSBub2RlO1xyXG5cclxuICAgIHRoaXMuYWRkQ3NzQ2xhc3NGb3JOb2RlX2FuZEluZm9ybVZpcnR1YWxSb3dMaXN0ZW5lcihub2RlKTtcclxuXHJcbiAgICAvLyBhbHNvIGNvbG9yIGluIHRoZSBmb290ZXIgaWYgdGhlcmUgaXMgb25lXHJcbiAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmV4cGFuZGVkICYmIG5vZGUuc2libGluZykge1xyXG4gICAgICAgIHRoaXMuYWRkQ3NzQ2xhc3NGb3JOb2RlX2FuZEluZm9ybVZpcnR1YWxSb3dMaXN0ZW5lcihub2RlLnNpYmxpbmcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGluZm9ybSB0aGUgcm93U2VsZWN0ZWQgbGlzdGVuZXIsIGlmIGFueVxyXG4gICAgaWYgKCFzdXBwcmVzc0V2ZW50cyAmJiB0eXBlb2YgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93U2VsZWN0ZWQoKSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93U2VsZWN0ZWQoKShub2RlLmRhdGEsIG5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyAxIC0gc2VsZWN0cyBhIG5vZGVcclxuLy8gMiAtIHVwZGF0ZXMgdGhlIFVJXHJcbi8vIDMgLSBjYWxscyBjYWxsYmFja3NcclxuLy8gd293IC0gd2hhdCBhIGJpZyBuYW1lIGZvciBhIG1ldGhvZCwgZXhjZXB0aW9uIGNhc2UsIGl0J3Mgc2F5aW5nIHdoYXQgdGhlIG1ldGhvZCBkb2VzXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmFkZENzc0NsYXNzRm9yTm9kZV9hbmRJbmZvcm1WaXJ0dWFsUm93TGlzdGVuZXIgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICB2YXIgdmlydHVhbFJlbmRlcmVkUm93SW5kZXggPSB0aGlzLnJvd1JlbmRlcmVyLmdldEluZGV4T2ZSZW5kZXJlZE5vZGUobm9kZSk7XHJcbiAgICBpZiAodmlydHVhbFJlbmRlcmVkUm93SW5kZXggPj0gMCkge1xyXG4gICAgICAgIHV0aWxzLnF1ZXJ5U2VsZWN0b3JBbGxfYWRkQ3NzQ2xhc3ModGhpcy5lUm93c1BhcmVudCwgJ1tyb3c9XCInICsgdmlydHVhbFJlbmRlcmVkUm93SW5kZXggKyAnXCJdJywgJ2FnLXJvdy1zZWxlY3RlZCcpO1xyXG5cclxuICAgICAgICAvLyBpbmZvcm0gdmlydHVhbCByb3cgbGlzdGVuZXJcclxuICAgICAgICB0aGlzLmFuZ3VsYXJHcmlkLm9uVmlydHVhbFJvd1NlbGVjdGVkKHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4LCB0cnVlKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuLy8gMSAtIHVuLXNlbGVjdHMgYSBub2RlXHJcbi8vIDIgLSB1cGRhdGVzIHRoZSBVSVxyXG4vLyAzIC0gY2FsbHMgY2FsbGJhY2tzXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmRvV29ya09mRGVzZWxlY3RBbGxOb2RlcyA9IGZ1bmN0aW9uKG5vZGVUb0tlZXBTZWxlY3RlZCkge1xyXG4gICAgLy8gbm90IGRvaW5nIG11bHRpLXNlbGVjdCwgc28gZGVzZWxlY3QgZXZlcnl0aGluZyBvdGhlciB0aGFuIHRoZSAnanVzdCBzZWxlY3RlZCcgcm93XHJcbiAgICB2YXIgYXRMZWFzdE9uZVNlbGVjdGlvbkNoYW5nZTtcclxuICAgIHZhciBzZWxlY3RlZE5vZGVLZXlzID0gT2JqZWN0LmtleXModGhpcy5zZWxlY3RlZE5vZGVzQnlJZCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGVkTm9kZUtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAvLyBza2lwIHRoZSAnanVzdCBzZWxlY3RlZCcgcm93XHJcbiAgICAgICAgdmFyIGtleSA9IHNlbGVjdGVkTm9kZUtleXNbaV07XHJcbiAgICAgICAgdmFyIG5vZGVUb0Rlc2VsZWN0ID0gdGhpcy5zZWxlY3RlZE5vZGVzQnlJZFtrZXldO1xyXG4gICAgICAgIGlmIChub2RlVG9EZXNlbGVjdCA9PT0gbm9kZVRvS2VlcFNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RSZWFsTm9kZShub2RlVG9EZXNlbGVjdCk7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVTZWxlY3Rpb25DaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhdExlYXN0T25lU2VsZWN0aW9uQ2hhbmdlO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5kZXNlbGVjdFJlYWxOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgLy8gZGVzZWxlY3QgdGhlIGNzc1xyXG4gICAgdGhpcy5yZW1vdmVDc3NDbGFzc0Zvck5vZGUobm9kZSk7XHJcblxyXG4gICAgLy8gaWYgbm9kZSBpcyBhIGhlYWRlciwgYW5kIGlmIGl0IGhhcyBhIHNpYmxpbmcgZm9vdGVyLCBkZXNlbGVjdCB0aGUgZm9vdGVyIGFsc29cclxuICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuZXhwYW5kZWQgJiYgbm9kZS5zaWJsaW5nKSB7IC8vIGFsc28gY2hlY2sgdGhhdCBpdCdzIGV4cGFuZGVkLCBhcyBzaWJsaW5nIGNvdWxkIGJlIGEgZ2hvc3RcclxuICAgICAgICB0aGlzLnJlbW92ZUNzc0NsYXNzRm9yTm9kZShub2RlLnNpYmxpbmcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlbW92ZSB0aGUgcm93XHJcbiAgICBkZWxldGUgdGhpcy5zZWxlY3RlZE5vZGVzQnlJZFtub2RlLmlkXTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucmVtb3ZlQ3NzQ2xhc3NGb3JOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ID0gdGhpcy5yb3dSZW5kZXJlci5nZXRJbmRleE9mUmVuZGVyZWROb2RlKG5vZGUpO1xyXG4gICAgaWYgKHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ID49IDApIHtcclxuICAgICAgICB1dGlscy5xdWVyeVNlbGVjdG9yQWxsX3JlbW92ZUNzc0NsYXNzKHRoaXMuZVJvd3NQYXJlbnQsICdbcm93PVwiJyArIHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ICsgJ1wiXScsICdhZy1yb3ctc2VsZWN0ZWQnKTtcclxuICAgICAgICAvLyBpbmZvcm0gdmlydHVhbCByb3cgbGlzdGVuZXJcclxuICAgICAgICB0aGlzLmFuZ3VsYXJHcmlkLm9uVmlydHVhbFJvd1NlbGVjdGVkKHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4LCBmYWxzZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgKHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSlcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZGVzZWxlY3RJbmRleCA9IGZ1bmN0aW9uKHJvd0luZGV4KSB7XHJcbiAgICB2YXIgbm9kZSA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvdyhyb3dJbmRleCk7XHJcbiAgICB0aGlzLmRlc2VsZWN0Tm9kZShub2RlKTtcclxufTtcclxuXHJcbi8vIHB1YmxpYyAoYXBpKVxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5kZXNlbGVjdE5vZGUgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICBpZiAobm9kZSkge1xyXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwU2VsZWN0c0NoaWxkcmVuKCkgJiYgbm9kZS5ncm91cCkge1xyXG4gICAgICAgICAgICAvLyB3YW50IHRvIGRlc2VsZWN0IGNoaWxkcmVuLCBub3QgdGhpcyBub2RlLCBzbyByZWN1cnNpdmVseSBkZXNlbGVjdFxyXG4gICAgICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5RGVzZWxlY3RBbGxDaGlsZHJlbihub2RlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRlc2VsZWN0UmVhbE5vZGUobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5zeW5jU2VsZWN0ZWRSb3dzQW5kQ2FsbExpc3RlbmVyKCk7XHJcbiAgICB0aGlzLnVwZGF0ZUdyb3VwUGFyZW50c0lmTmVlZGVkKCk7XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgKHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSAmIGFwaSlcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuc2VsZWN0SW5kZXggPSBmdW5jdGlvbihpbmRleCwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICB2YXIgbm9kZSA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvdyhpbmRleCk7XHJcbiAgICB0aGlzLnNlbGVjdE5vZGUobm9kZSwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuLy8gdXBkYXRlcyB0aGUgc2VsZWN0ZWRSb3dzIHdpdGggdGhlIHNlbGVjdGVkTm9kZXMgYW5kIGNhbGxzIHNlbGVjdGlvbkNoYW5nZWQgbGlzdGVuZXJcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuc3luY1NlbGVjdGVkUm93c0FuZENhbGxMaXN0ZW5lciA9IGZ1bmN0aW9uKHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICAvLyB1cGRhdGUgc2VsZWN0ZWQgcm93c1xyXG4gICAgdmFyIHNlbGVjdGVkUm93cyA9IHRoaXMuc2VsZWN0ZWRSb3dzO1xyXG4gICAgdmFyIG9sZENvdW50ID0gc2VsZWN0ZWRSb3dzLmxlbmd0aDtcclxuICAgIC8vIGNsZWFyIHNlbGVjdGVkIHJvd3NcclxuICAgIHNlbGVjdGVkUm93cy5sZW5ndGggPSAwO1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW2tleXNbaV1dICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkTm9kZSA9IHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRba2V5c1tpXV07XHJcbiAgICAgICAgICAgIHNlbGVjdGVkUm93cy5wdXNoKHNlbGVjdGVkTm9kZS5kYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGhpcyBzdG9wZSB0aGUgZXZlbnQgZmlyaW5nIHRoZSB2ZXJ5IGZpcnN0IHRoZSB0aW1lIGdyaWQgaXMgaW5pdGlhbGlzZWQuIHdpdGhvdXQgdGhpcywgdGhlIGRvY3VtZW50YXRpb25cclxuICAgIC8vIHBhZ2UgaGFkIGEgcG9wdXAgaW4gdGhlICdzZWxlY3Rpb24nIHBhZ2UgYXMgc29vbiBhcyB0aGUgcGFnZSB3YXMgbG9hZGVkISFcclxuICAgIHZhciBub3RoaW5nQ2hhbmdlZE11c3RCZUluaXRpYWxpc2luZyA9IG9sZENvdW50ID09PSAwICYmIHNlbGVjdGVkUm93cy5sZW5ndGggPT09IDA7XHJcblxyXG4gICAgaWYgKCFub3RoaW5nQ2hhbmdlZE11c3RCZUluaXRpYWxpc2luZyAmJiAhc3VwcHJlc3NFdmVudHMgJiYgdHlwZW9mIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFNlbGVjdGlvbkNoYW5nZWQoKSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0U2VsZWN0aW9uQ2hhbmdlZCgpKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGF0LiRzY29wZS4kYXBwbHkoKTtcclxuICAgIH0sIDApO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5yZWN1cnNpdmVseUNoZWNrSWZTZWxlY3RlZCA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIHZhciBmb3VuZFNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICB2YXIgZm91bmRVbnNlbGVjdGVkID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdDtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLnJlY3Vyc2l2ZWx5Q2hlY2tJZlNlbGVjdGVkKGNoaWxkKTtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBTRUxFQ1RFRDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRTZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgVU5TRUxFQ1RFRDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRVbnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBNSVhFRDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRTZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kVW5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBjYW4gaWdub3JlIHRoZSBET19OT1RfQ0FSRSwgYXMgaXQgZG9lc24ndCBpbXBhY3QsIG1lYW5zIHRoZSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBoYXMgbm8gY2hpbGRyZW4gYW5kIHNob3VsZG4ndCBiZSBjb25zaWRlcmVkIHdoZW4gZGVjaWRpbmdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzTm9kZVNlbGVjdGVkKGNoaWxkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kU2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZFVuc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZm91bmRTZWxlY3RlZCAmJiBmb3VuZFVuc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIGlmIG1peGVkLCB0aGVuIG5vIG5lZWQgdG8gZ28gZnVydGhlciwganVzdCByZXR1cm4gdXAgdGhlIGNoYWluXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gTUlYRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZ290IHRoaXMgZmFyLCBzbyBubyBjb25mbGljdHMsIGVpdGhlciBhbGwgY2hpbGRyZW4gc2VsZWN0ZWQsIHVuc2VsZWN0ZWQsIG9yIG5laXRoZXJcclxuICAgIGlmIChmb3VuZFNlbGVjdGVkKSB7XHJcbiAgICAgICAgcmV0dXJuIFNFTEVDVEVEO1xyXG4gICAgfSBlbHNlIGlmIChmb3VuZFVuc2VsZWN0ZWQpIHtcclxuICAgICAgICByZXR1cm4gVU5TRUxFQ1RFRDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIERPX05PVF9DQVJFO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHVibGljIChzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkpXHJcbi8vIHJldHVybnM6XHJcbi8vIHRydWU6IGlmIHNlbGVjdGVkXHJcbi8vIGZhbHNlOiBpZiB1bnNlbGVjdGVkXHJcbi8vIHVuZGVmaW5lZDogaWYgaXQncyBhIGdyb3VwIGFuZCAnY2hpbGRyZW4gc2VsZWN0aW9uJyBpcyB1c2VkIGFuZCAnY2hpbGRyZW4nIGFyZSBhIG1peCBvZiBzZWxlY3RlZCBhbmQgdW5zZWxlY3RlZFxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5pc05vZGVTZWxlY3RlZCA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwU2VsZWN0c0NoaWxkcmVuKCkgJiYgbm9kZS5ncm91cCkge1xyXG4gICAgICAgIC8vIGRvaW5nIGNoaWxkIHNlbGVjdGlvbiwgd2UgbmVlZCB0byB0cmF2ZXJzZSB0aGUgY2hpbGRyZW5cclxuICAgICAgICB2YXIgcmVzdWx0T2ZDaGlsZHJlbiA9IHRoaXMucmVjdXJzaXZlbHlDaGVja0lmU2VsZWN0ZWQobm9kZSk7XHJcbiAgICAgICAgc3dpdGNoIChyZXN1bHRPZkNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgIGNhc2UgU0VMRUNURUQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgY2FzZSBVTlNFTEVDVEVEOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW25vZGUuaWRdICE9PSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbn07XHJcblxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVHcm91cFBhcmVudHNJZk5lZWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gd2Ugb25seSBkbyB0aGlzIGlmIHBhcmVudCBub2RlcyBhcmUgcmVzcG9uc2libGVcclxuICAgIC8vIGZvciBzZWxlY3RpbmcgdGhlaXIgY2hpbGRyZW4uXHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBTZWxlY3RzQ2hpbGRyZW4oKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZmlyc3RSb3cgPSB0aGlzLnJvd1JlbmRlcmVyLmdldEZpcnN0VmlydHVhbFJlbmRlcmVkUm93KCk7XHJcbiAgICB2YXIgbGFzdFJvdyA9IHRoaXMucm93UmVuZGVyZXIuZ2V0TGFzdFZpcnR1YWxSZW5kZXJlZFJvdygpO1xyXG4gICAgZm9yICh2YXIgcm93SW5kZXggPSBmaXJzdFJvdzsgcm93SW5kZXggPD0gbGFzdFJvdzsgcm93SW5kZXgrKykge1xyXG4gICAgICAgIC8vIHNlZSBpZiBub2RlIGlzIGEgZ3JvdXBcclxuICAgICAgICB2YXIgbm9kZSA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvdyhyb3dJbmRleCk7XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gdGhpcy5pc05vZGVTZWxlY3RlZChub2RlKTtcclxuICAgICAgICAgICAgdGhpcy5hbmd1bGFyR3JpZC5vblZpcnR1YWxSb3dTZWxlY3RlZChyb3dJbmRleCwgc2VsZWN0ZWQpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5xdWVyeVNlbGVjdG9yQWxsX2FkZENzc0NsYXNzKHRoaXMuZVJvd3NQYXJlbnQsICdbcm93PVwiJyArIHJvd0luZGV4ICsgJ1wiXScsICdhZy1yb3ctc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHV0aWxzLnF1ZXJ5U2VsZWN0b3JBbGxfcmVtb3ZlQ3NzQ2xhc3ModGhpcy5lUm93c1BhcmVudCwgJ1tyb3c9XCInICsgcm93SW5kZXggKyAnXCJdJywgJ2FnLXJvdy1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3Rpb25Db250cm9sbGVyO1xyXG4iLCJmdW5jdGlvbiBTZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkoKSB7fVxyXG5cclxuU2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oYW5ndWxhckdyaWQsIHNlbGVjdGlvbkNvbnRyb2xsZXIpIHtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZDtcclxuICAgIHRoaXMuc2VsZWN0aW9uQ29udHJvbGxlciA9IHNlbGVjdGlvbkNvbnRyb2xsZXI7XHJcbn07XHJcblxyXG5TZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZUNoZWNrYm94Q29sRGVmID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHdpZHRoOiAzMCxcclxuICAgICAgICBzdXBwcmVzc01lbnU6IHRydWUsXHJcbiAgICAgICAgc3VwcHJlc3NTb3J0aW5nOiB0cnVlLFxyXG4gICAgICAgIGhlYWRlckNlbGxSZW5kZXJlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBlQ2hlY2tib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgICAgICBlQ2hlY2tib3gudHlwZSA9ICdjaGVja2JveCc7XHJcbiAgICAgICAgICAgIGVDaGVja2JveC5uYW1lID0gJ25hbWUnO1xyXG4gICAgICAgICAgICByZXR1cm4gZUNoZWNrYm94O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2VsbFJlbmRlcmVyOiB0aGlzLmNyZWF0ZUNoZWNrYm94UmVuZGVyZXIoKVxyXG4gICAgfTtcclxufTtcclxuXHJcblNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlQ2hlY2tib3hSZW5kZXJlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHJldHVybiB0aGF0LmNyZWF0ZVNlbGVjdGlvbkNoZWNrYm94KHBhcmFtcy5ub2RlLCBwYXJhbXMucm93SW5kZXgpO1xyXG4gICAgfTtcclxufTtcclxuXHJcblNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlU2VsZWN0aW9uQ2hlY2tib3ggPSBmdW5jdGlvbihub2RlLCByb3dJbmRleCkge1xyXG5cclxuICAgIHZhciBlQ2hlY2tib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgZUNoZWNrYm94LnR5cGUgPSBcImNoZWNrYm94XCI7XHJcbiAgICBlQ2hlY2tib3gubmFtZSA9IFwibmFtZVwiO1xyXG4gICAgZUNoZWNrYm94LmNsYXNzTmFtZSA9ICdhZy1zZWxlY3Rpb24tY2hlY2tib3gnO1xyXG4gICAgc2V0Q2hlY2tib3hTdGF0ZShlQ2hlY2tib3gsIHRoaXMuc2VsZWN0aW9uQ29udHJvbGxlci5pc05vZGVTZWxlY3RlZChub2RlKSk7XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgZUNoZWNrYm94Lm9uY2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgfTtcclxuXHJcbiAgICBlQ2hlY2tib3gub25jaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbmV3VmFsdWUgPSBlQ2hlY2tib3guY2hlY2tlZDtcclxuICAgICAgICBpZiAobmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLnNlbGVjdEluZGV4KHJvd0luZGV4LCB0cnVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuZGVzZWxlY3RJbmRleChyb3dJbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkLmFkZFZpcnR1YWxSb3dMaXN0ZW5lcihyb3dJbmRleCwge1xyXG4gICAgICAgIHJvd1NlbGVjdGVkOiBmdW5jdGlvbihzZWxlY3RlZCkge1xyXG4gICAgICAgICAgICBzZXRDaGVja2JveFN0YXRlKGVDaGVja2JveCwgc2VsZWN0ZWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcm93UmVtb3ZlZDogZnVuY3Rpb24oKSB7fVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGVDaGVja2JveDtcclxufTtcclxuXHJcbmZ1bmN0aW9uIHNldENoZWNrYm94U3RhdGUoZUNoZWNrYm94LCBzdGF0ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgZUNoZWNrYm94LmNoZWNrZWQgPSBzdGF0ZTtcclxuICAgICAgICBlQ2hlY2tib3guaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBpc05vZGVTZWxlY3RlZCByZXR1cm5zIGJhY2sgdW5kZWZpbmVkIGlmIGl0J3MgYSBncm91cCBhbmQgdGhlIGNoaWxkcmVuXHJcbiAgICAgICAgLy8gYXJlIGEgbWl4IG9mIHNlbGVjdGVkIGFuZCB1bnNlbGVjdGVkXHJcbiAgICAgICAgZUNoZWNrYm94LmluZGV0ZXJtaW5hdGUgPSB0cnVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeTtcclxuIiwidmFyIFNWR19OUyA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtcclxuXHJcbmZ1bmN0aW9uIFN2Z0ZhY3RvcnkoKSB7fVxyXG5cclxuU3ZnRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlRmlsdGVyU3ZnID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZVN2ZyA9IGNyZWF0ZUljb25TdmcoKTtcclxuXHJcbiAgICB2YXIgZUZ1bm5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsIFwicG9seWdvblwiKTtcclxuICAgIGVGdW5uZWwuc2V0QXR0cmlidXRlKFwicG9pbnRzXCIsIFwiMCwwIDQsNCA0LDEwIDYsMTAgNiw0IDEwLDBcIik7XHJcbiAgICBlRnVubmVsLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiYWctaGVhZGVyLWljb25cIik7XHJcbiAgICBlU3ZnLmFwcGVuZENoaWxkKGVGdW5uZWwpO1xyXG5cclxuICAgIHJldHVybiBlU3ZnO1xyXG59O1xyXG5cclxuU3ZnRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlTWVudVN2ZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGVTdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCBcInN2Z1wiKTtcclxuICAgIHZhciBzaXplID0gXCIxMlwiO1xyXG4gICAgZVN2Zy5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBzaXplKTtcclxuICAgIGVTdmcuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIHNpemUpO1xyXG5cclxuICAgIFtcIjBcIiwgXCI1XCIsIFwiMTBcIl0uZm9yRWFjaChmdW5jdGlvbih5KSB7XHJcbiAgICAgICAgdmFyIGVMaW5lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgXCJyZWN0XCIpO1xyXG4gICAgICAgIGVMaW5lLnNldEF0dHJpYnV0ZShcInlcIiwgeSk7XHJcbiAgICAgICAgZUxpbmUuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgc2l6ZSk7XHJcbiAgICAgICAgZUxpbmUuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIFwiMlwiKTtcclxuICAgICAgICBlTGluZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcImFnLWhlYWRlci1pY29uXCIpO1xyXG4gICAgICAgIGVTdmcuYXBwZW5kQ2hpbGQoZUxpbmUpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGVTdmc7XHJcbn07XHJcblxyXG5TdmdGYWN0b3J5LnByb3RvdHlwZS5jcmVhdGVBcnJvd1VwU3ZnID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gY3JlYXRlUG9seWdvblN2ZyhcIjAsMTAgNSwwIDEwLDEwXCIpO1xyXG59O1xyXG5cclxuU3ZnRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlQXJyb3dMZWZ0U3ZnID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gY3JlYXRlUG9seWdvblN2ZyhcIjEwLDAgMCw1IDEwLDEwXCIpO1xyXG59O1xyXG5cclxuU3ZnRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlQXJyb3dEb3duU3ZnID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gY3JlYXRlUG9seWdvblN2ZyhcIjAsMCA1LDEwIDEwLDBcIik7XHJcbn07XHJcblxyXG5TdmdGYWN0b3J5LnByb3RvdHlwZS5jcmVhdGVBcnJvd1JpZ2h0U3ZnID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gY3JlYXRlUG9seWdvblN2ZyhcIjAsMCAxMCw1IDAsMTBcIik7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVQb2x5Z29uU3ZnKHBvaW50cykge1xyXG4gICAgdmFyIGVTdmcgPSBjcmVhdGVJY29uU3ZnKCk7XHJcblxyXG4gICAgdmFyIGVEZXNjSWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsIFwicG9seWdvblwiKTtcclxuICAgIGVEZXNjSWNvbi5zZXRBdHRyaWJ1dGUoXCJwb2ludHNcIiwgcG9pbnRzKTtcclxuICAgIGVTdmcuYXBwZW5kQ2hpbGQoZURlc2NJY29uKTtcclxuXHJcbiAgICByZXR1cm4gZVN2ZztcclxufVxyXG5cclxuLy8gdXRpbCBmdW5jdGlvbiBmb3IgdGhlIGFib3ZlXHJcbmZ1bmN0aW9uIGNyZWF0ZUljb25TdmcoKSB7XHJcbiAgICB2YXIgZVN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsIFwic3ZnXCIpO1xyXG4gICAgZVN2Zy5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBcIjEwXCIpO1xyXG4gICAgZVN2Zy5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgXCIxMFwiKTtcclxuICAgIHJldHVybiBlU3ZnO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFN2Z0ZhY3Rvcnk7XHJcbiIsInZhciB0ZW1wbGF0ZSA9IFtcclxuICAgICc8ZGl2IGNsYXNzPVwiYWctcm9vdCBhZy1zY3JvbGxzXCI+JyxcclxuICAgICcgICAgPCEtLSBUaGUgbG9hZGluZyBwYW5lbCAtLT4nLFxyXG4gICAgJyAgICA8IS0tIHdyYXBwaW5nIGluIG91dGVyIGRpdiwgYW5kIHdyYXBwZXIsIGlzIG5lZWRlZCB0byBjZW50ZXIgdGhlIGxvYWRpbmcgaWNvbiAtLT4nLFxyXG4gICAgJyAgICA8IS0tIFRoZSBpZGVhIGZvciBjZW50ZXJpbmcgY2FtZSBmcm9tIGhlcmU6IGh0dHA6Ly93d3cudmFuc2VvZGVzaWduLmNvbS9jc3MvdmVydGljYWwtY2VudGVyaW5nLyAtLT4nLFxyXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYWctbG9hZGluZy1wYW5lbFwiPicsXHJcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiYWctbG9hZGluZy13cmFwcGVyXCI+JyxcclxuICAgICcgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImFnLWxvYWRpbmctY2VudGVyXCI+TG9hZGluZy4uLjwvc3Bhbj4nLFxyXG4gICAgJyAgICAgICAgPC9kaXY+JyxcclxuICAgICcgICAgPC9kaXY+JyxcclxuICAgICcgICAgPCEtLSBoZWFkZXIgLS0+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLWhlYWRlclwiPicsXHJcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiYWctcGlubmVkLWhlYWRlclwiPjwvZGl2PjxkaXYgY2xhc3M9XCJhZy1oZWFkZXItdmlld3BvcnRcIj48ZGl2IGNsYXNzPVwiYWctaGVhZGVyLWNvbnRhaW5lclwiPjwvZGl2PjwvZGl2PicsXHJcbiAgICAnICAgIDwvZGl2PicsXHJcbiAgICAnICAgIDwhLS0gYm9keSAtLT4nLFxyXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYWctYm9keVwiPicsXHJcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiYWctcGlubmVkLWNvbHMtdmlld3BvcnRcIj4nLFxyXG4gICAgJyAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZy1waW5uZWQtY29scy1jb250YWluZXJcIj48L2Rpdj4nLFxyXG4gICAgJyAgICAgICAgPC9kaXY+JyxcclxuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJhZy1ib2R5LXZpZXdwb3J0LXdyYXBwZXJcIj4nLFxyXG4gICAgJyAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZy1ib2R5LXZpZXdwb3J0XCI+JyxcclxuICAgICcgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFnLWJvZHktY29udGFpbmVyXCI+PC9kaXY+JyxcclxuICAgICcgICAgICAgICAgICA8L2Rpdj4nLFxyXG4gICAgJyAgICAgICAgPC9kaXY+JyxcclxuICAgICcgICAgPC9kaXY+JyxcclxuICAgICcgICAgPCEtLSBQYWdpbmcgLS0+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLXBhZ2luZy1wYW5lbFwiPicsXHJcbiAgICAnICAgIDwvZGl2PicsXHJcbiAgICAnICAgIDwvZGl2PidcclxuXS5qb2luKCcnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XHJcbiIsInZhciB0ZW1wbGF0ZSA9IFtcclxuICAgICc8ZGl2IGNsYXNzPVwiYWctcm9vdCBhZy1uby1zY3JvbGxzXCI+JyxcclxuICAgICcgICAgPCEtLSBTZWUgY29tbWVudCBpbiB0ZW1wbGF0ZS5odG1sIGZvciB3aHkgbG9hZGluZyBpcyBsYWlkIG91dCBsaWtlIHNvIC0tPicsXHJcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJhZy1sb2FkaW5nLXBhbmVsXCI+JyxcclxuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJhZy1sb2FkaW5nLXdyYXBwZXJcIj4nLFxyXG4gICAgJyAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYWctbG9hZGluZy1jZW50ZXJcIj5Mb2FkaW5nLi4uPC9zcGFuPicsXHJcbiAgICAnICAgICAgICA8L2Rpdj4nLFxyXG4gICAgJyAgICA8L2Rpdj4nLFxyXG4gICAgJyAgICA8IS0tIGhlYWRlciAtLT4nLFxyXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYWctaGVhZGVyLWNvbnRhaW5lclwiPjwvZGl2PicsXHJcbiAgICAnICAgIDwhLS0gYm9keSAtLT4nLFxyXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYWctYm9keS1jb250YWluZXJcIj48L2Rpdj4nLFxyXG4gICAgJzwvZGl2PidcclxuXS5qb2luKCcnKTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xyXG4iLCJcclxuZnVuY3Rpb24gVGVtcGxhdGVTZXJ2aWNlKCkge1xyXG4gICAgdGhpcy50ZW1wbGF0ZUNhY2hlID0ge307XHJcbiAgICB0aGlzLndhaXRpbmdDYWxsYmFja3MgPSB7fTtcclxufVxyXG5cclxuVGVtcGxhdGVTZXJ2aWNlLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCRzY29wZSkge1xyXG4gICAgdGhpcy4kc2NvcGUgPSAkc2NvcGU7XHJcbn07XHJcblxyXG4vLyByZXR1cm5zIHRoZSB0ZW1wbGF0ZSBpZiBpdCBpcyBsb2FkZWQsIG9yIG51bGwgaWYgaXQgaXMgbm90IGxvYWRlZFxyXG4vLyBidXQgd2lsbCBjYWxsIHRoZSBjYWxsYmFjayB3aGVuIGl0IGlzIGxvYWRlZFxyXG5UZW1wbGF0ZVNlcnZpY2UucHJvdG90eXBlLmdldFRlbXBsYXRlID0gZnVuY3Rpb24gKHVybCwgY2FsbGJhY2spIHtcclxuXHJcbiAgICB2YXIgdGVtcGxhdGVGcm9tQ2FjaGUgPSB0aGlzLnRlbXBsYXRlQ2FjaGVbdXJsXTtcclxuICAgIGlmICh0ZW1wbGF0ZUZyb21DYWNoZSkge1xyXG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZUZyb21DYWNoZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2FsbGJhY2tMaXN0ID0gdGhpcy53YWl0aW5nQ2FsbGJhY2tzW3VybF07XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBpZiAoIWNhbGxiYWNrTGlzdCkge1xyXG4gICAgICAgIC8vIGZpcnN0IHRpbWUgdGhpcyB3YXMgY2FsbGVkLCBzbyBuZWVkIGEgbmV3IGxpc3QgZm9yIGNhbGxiYWNrc1xyXG4gICAgICAgIGNhbGxiYWNrTGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMud2FpdGluZ0NhbGxiYWNrc1t1cmxdID0gY2FsbGJhY2tMaXN0O1xyXG4gICAgICAgIC8vIGFuZCBhbHNvIG5lZWQgdG8gZG8gdGhlIGh0dHAgcmVxdWVzdFxyXG4gICAgICAgIHZhciBjbGllbnQgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICBjbGllbnQub25sb2FkID0gZnVuY3Rpb24gKCkgeyB0aGF0LmhhbmRsZUh0dHBSZXN1bHQodGhpcywgdXJsKTsgfTtcclxuICAgICAgICBjbGllbnQub3BlbihcIkdFVFwiLCB1cmwpO1xyXG4gICAgICAgIGNsaWVudC5zZW5kKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWRkIHRoaXMgY2FsbGJhY2tcclxuICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgIGNhbGxiYWNrTGlzdC5wdXNoKGNhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjYWxsZXIgbmVlZHMgdG8gd2FpdCBmb3IgdGVtcGxhdGUgdG8gbG9hZCwgc28gcmV0dXJuIG51bGxcclxuICAgIHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuVGVtcGxhdGVTZXJ2aWNlLnByb3RvdHlwZS5oYW5kbGVIdHRwUmVzdWx0ID0gZnVuY3Rpb24gKGh0dHBSZXN1bHQsIHVybCkge1xyXG5cclxuICAgIGlmIChodHRwUmVzdWx0LnN0YXR1cyAhPT0gMjAwIHx8IGh0dHBSZXN1bHQucmVzcG9uc2UgPT09IG51bGwpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnVW5hYmxlIHRvIGdldCB0ZW1wbGF0ZSBlcnJvciAnICsgaHR0cFJlc3VsdC5zdGF0dXMgKyAnIC0gJyArIHVybCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlc3BvbnNlIHN1Y2Nlc3MsIHNvIHByb2Nlc3MgaXRcclxuICAgIHRoaXMudGVtcGxhdGVDYWNoZVt1cmxdID0gaHR0cFJlc3VsdC5yZXNwb25zZTtcclxuXHJcbiAgICAvLyBpbmZvcm0gYWxsIGxpc3RlbmVycyB0aGF0IHRoaXMgaXMgbm93IGluIHRoZSBjYWNoZVxyXG4gICAgdmFyIGNhbGxiYWNrcyA9IHRoaXMud2FpdGluZ0NhbGxiYWNrc1t1cmxdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgY2FsbGJhY2sgPSBjYWxsYmFja3NbaV07XHJcbiAgICAgICAgLy8gd2UgY291bGQgcGFzcyB0aGUgY2FsbGJhY2sgdGhlIHJlc3BvbnNlLCBob3dldmVyIHdlIGtub3cgdGhlIGNsaWVudCBvZiB0aGlzIGNvZGVcclxuICAgICAgICAvLyBpcyB0aGUgY2VsbCByZW5kZXJlciwgYW5kIGl0IHBhc3NlcyB0aGUgJ2NlbGxSZWZyZXNoJyBtZXRob2QgaW4gYXMgdGhlIGNhbGxiYWNrXHJcbiAgICAgICAgLy8gd2hpY2ggZG9lc24ndCB0YWtlIGFueSBwYXJhbWV0ZXJzLlxyXG4gICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuJHNjb3BlKSB7XHJcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH0sIDApO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUZW1wbGF0ZVNlcnZpY2U7XHJcbiIsImZ1bmN0aW9uIFV0aWxzKCkge31cclxuXHJcblxyXG5VdGlscy5wcm90b3R5cGUuZ2V0VmFsdWUgPSBmdW5jdGlvbihleHByZXNzaW9uU2VydmljZSwgZGF0YSwgY29sRGVmLCBub2RlLCBhcGksIGNvbnRleHQpIHtcclxuXHJcbiAgICB2YXIgdmFsdWVHZXR0ZXIgPSBjb2xEZWYudmFsdWVHZXR0ZXI7XHJcbiAgICB2YXIgZmllbGQgPSBjb2xEZWYuZmllbGQ7XHJcblxyXG4gICAgLy8gaWYgdGhlcmUgaXMgYSB2YWx1ZSBnZXR0ZXIsIHRoaXMgZ2V0cyBwcmVjZWRlbmNlIG92ZXIgYSBmaWVsZFxyXG4gICAgaWYgKHZhbHVlR2V0dGVyKSB7XHJcblxyXG4gICAgICAgIHZhciBwYXJhbXMgPSB7XHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICBhcGk6IGFwaSxcclxuICAgICAgICAgICAgY29udGV4dDogY29udGV4dFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWVHZXR0ZXIgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgLy8gdmFsdWVHZXR0ZXIgaXMgYSBmdW5jdGlvbiwgc28ganVzdCBjYWxsIGl0XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZUdldHRlcihwYXJhbXMpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlR2V0dGVyID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAvLyB2YWx1ZUdldHRlciBpcyBhbiBleHByZXNzaW9uLCBzbyBleGVjdXRlIHRoZSBleHByZXNzaW9uXHJcbiAgICAgICAgICAgIHJldHVybiBleHByZXNzaW9uU2VydmljZS5ldmFsdWF0ZSh2YWx1ZUdldHRlciwgcGFyYW1zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSBlbHNlIGlmIChmaWVsZCAmJiBkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIGRhdGFbZmllbGRdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy9SZXR1cm5zIHRydWUgaWYgaXQgaXMgYSBET00gbm9kZVxyXG4vL3Rha2VuIGZyb206IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzg0Mjg2L2phdmFzY3JpcHQtaXNkb20taG93LWRvLXlvdS1jaGVjay1pZi1hLWphdmFzY3JpcHQtb2JqZWN0LWlzLWEtZG9tLW9iamVjdFxyXG5VdGlscy5wcm90b3R5cGUuaXNOb2RlID0gZnVuY3Rpb24obykge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgICB0eXBlb2YgTm9kZSA9PT0gXCJvYmplY3RcIiA/IG8gaW5zdGFuY2VvZiBOb2RlIDpcclxuICAgICAgICBvICYmIHR5cGVvZiBvID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBvLm5vZGVUeXBlID09PSBcIm51bWJlclwiICYmIHR5cGVvZiBvLm5vZGVOYW1lID09PSBcInN0cmluZ1wiXHJcbiAgICApO1xyXG59O1xyXG5cclxuLy9SZXR1cm5zIHRydWUgaWYgaXQgaXMgYSBET00gZWxlbWVudFxyXG4vL3Rha2VuIGZyb206IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzg0Mjg2L2phdmFzY3JpcHQtaXNkb20taG93LWRvLXlvdS1jaGVjay1pZi1hLWphdmFzY3JpcHQtb2JqZWN0LWlzLWEtZG9tLW9iamVjdFxyXG5VdGlscy5wcm90b3R5cGUuaXNFbGVtZW50ID0gZnVuY3Rpb24obykge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgICB0eXBlb2YgSFRNTEVsZW1lbnQgPT09IFwib2JqZWN0XCIgPyBvIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgOiAvL0RPTTJcclxuICAgICAgICBvICYmIHR5cGVvZiBvID09PSBcIm9iamVjdFwiICYmIG8gIT09IG51bGwgJiYgby5ub2RlVHlwZSA9PT0gMSAmJiB0eXBlb2Ygby5ub2RlTmFtZSA9PT0gXCJzdHJpbmdcIlxyXG4gICAgKTtcclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5pc05vZGVPckVsZW1lbnQgPSBmdW5jdGlvbihvKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pc05vZGUobykgfHwgdGhpcy5pc0VsZW1lbnQobyk7XHJcbn07XHJcblxyXG4vL2FkZHMgYWxsIHR5cGUgb2YgY2hhbmdlIGxpc3RlbmVycyB0byBhbiBlbGVtZW50LCBpbnRlbmRlZCB0byBiZSBhIHRleHQgZmllbGRcclxuVXRpbHMucHJvdG90eXBlLmFkZENoYW5nZUxpc3RlbmVyID0gZnVuY3Rpb24oZWxlbWVudCwgbGlzdGVuZXIpIHtcclxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZWRcIiwgbGlzdGVuZXIpO1xyXG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwicGFzdGVcIiwgbGlzdGVuZXIpO1xyXG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgbGlzdGVuZXIpO1xyXG59O1xyXG5cclxuLy9pZiB2YWx1ZSBpcyB1bmRlZmluZWQsIG51bGwgb3IgYmxhbmssIHJldHVybnMgbnVsbCwgb3RoZXJ3aXNlIHJldHVybnMgdGhlIHZhbHVlXHJcblV0aWxzLnByb3RvdHlwZS5tYWtlTnVsbCA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gXCJcIikge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUucmVtb3ZlQWxsQ2hpbGRyZW4gPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICBpZiAobm9kZSkge1xyXG4gICAgICAgIHdoaWxlIChub2RlLmhhc0NoaWxkTm9kZXMoKSkge1xyXG4gICAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKG5vZGUubGFzdENoaWxkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vL2FkZHMgYW4gZWxlbWVudCB0byBhIGRpdiwgYnV0IGFsc28gYWRkcyBhIGJhY2tncm91bmQgY2hlY2tpbmcgZm9yIGNsaWNrcyxcclxuLy9zbyB0aGF0IHdoZW4gdGhlIGJhY2tncm91bmQgaXMgY2xpY2tlZCwgdGhlIGNoaWxkIGlzIHJlbW92ZWQgYWdhaW4sIGdpdmluZ1xyXG4vL2EgbW9kZWwgbG9vayB0byBwb3B1cHMuXHJcblV0aWxzLnByb3RvdHlwZS5hZGRBc01vZGFsUG9wdXAgPSBmdW5jdGlvbihlUGFyZW50LCBlQ2hpbGQpIHtcclxuICAgIHZhciBlQmFja2Ryb3AgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgZUJhY2tkcm9wLmNsYXNzTmFtZSA9IFwiYWctcG9wdXAtYmFja2Ryb3BcIjtcclxuXHJcbiAgICBlQmFja2Ryb3Aub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGVQYXJlbnQucmVtb3ZlQ2hpbGQoZUNoaWxkKTtcclxuICAgICAgICBlUGFyZW50LnJlbW92ZUNoaWxkKGVCYWNrZHJvcCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGVQYXJlbnQuYXBwZW5kQ2hpbGQoZUJhY2tkcm9wKTtcclxuICAgIGVQYXJlbnQuYXBwZW5kQ2hpbGQoZUNoaWxkKTtcclxufTtcclxuXHJcbi8vbG9hZHMgdGhlIHRlbXBsYXRlIGFuZCByZXR1cm5zIGl0IGFzIGFuIGVsZW1lbnQuIG1ha2VzIHVwIGZvciBubyBzaW1wbGUgd2F5IGluXHJcbi8vdGhlIGRvbSBhcGkgdG8gbG9hZCBodG1sIGRpcmVjdGx5LCBlZyB3ZSBjYW5ub3QgZG8gdGhpczogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0ZW1wbGF0ZSlcclxuVXRpbHMucHJvdG90eXBlLmxvYWRUZW1wbGF0ZSA9IGZ1bmN0aW9uKHRlbXBsYXRlKSB7XHJcbiAgICB2YXIgdGVtcERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICB0ZW1wRGl2LmlubmVySFRNTCA9IHRlbXBsYXRlO1xyXG4gICAgcmV0dXJuIHRlbXBEaXYuZmlyc3RDaGlsZDtcclxufTtcclxuXHJcbi8vaWYgcGFzc2VkICc0MnB4JyB0aGVuIHJldHVybnMgdGhlIG51bWJlciA0MlxyXG5VdGlscy5wcm90b3R5cGUucGl4ZWxTdHJpbmdUb051bWJlciA9IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICBpZiAodmFsLmluZGV4T2YoXCJweFwiKSA+PSAwKSB7XHJcbiAgICAgICAgICAgIHZhbC5yZXBsYWNlKFwicHhcIiwgXCJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYXJzZUludCh2YWwpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnF1ZXJ5U2VsZWN0b3JBbGxfYWRkQ3NzQ2xhc3MgPSBmdW5jdGlvbihlUGFyZW50LCBzZWxlY3RvciwgY3NzQ2xhc3MpIHtcclxuICAgIHZhciBlUm93cyA9IGVQYXJlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XHJcbiAgICBmb3IgKHZhciBrID0gMDsgayA8IGVSb3dzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgdGhpcy5hZGRDc3NDbGFzcyhlUm93c1trXSwgY3NzQ2xhc3MpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnF1ZXJ5U2VsZWN0b3JBbGxfcmVtb3ZlQ3NzQ2xhc3MgPSBmdW5jdGlvbihlUGFyZW50LCBzZWxlY3RvciwgY3NzQ2xhc3MpIHtcclxuICAgIHZhciBlUm93cyA9IGVQYXJlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XHJcbiAgICBmb3IgKHZhciBrID0gMDsgayA8IGVSb3dzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVDc3NDbGFzcyhlUm93c1trXSwgY3NzQ2xhc3MpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnF1ZXJ5U2VsZWN0b3JBbGxfcmVwbGFjZUNzc0NsYXNzID0gZnVuY3Rpb24oZVBhcmVudCwgc2VsZWN0b3IsIGNzc0NsYXNzVG9SZW1vdmUsIGNzc0NsYXNzVG9BZGQpIHtcclxuICAgIHZhciBlUm93cyA9IGVQYXJlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XHJcbiAgICBmb3IgKHZhciBrID0gMDsgayA8IGVSb3dzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVDc3NDbGFzcyhlUm93c1trXSwgY3NzQ2xhc3NUb1JlbW92ZSk7XHJcbiAgICAgICAgdGhpcy5hZGRDc3NDbGFzcyhlUm93c1trXSwgY3NzQ2xhc3NUb0FkZCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUuYWRkQ3NzQ2xhc3MgPSBmdW5jdGlvbihlbGVtZW50LCBjbGFzc05hbWUpIHtcclxuICAgIHZhciBvbGRDbGFzc2VzID0gZWxlbWVudC5jbGFzc05hbWU7XHJcbiAgICBpZiAob2xkQ2xhc3Nlcykge1xyXG4gICAgICAgIGlmIChvbGRDbGFzc2VzLmluZGV4T2YoY2xhc3NOYW1lKSA+PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSBvbGRDbGFzc2VzICsgXCIgXCIgKyBjbGFzc05hbWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnJlbW92ZUNzc0NsYXNzID0gZnVuY3Rpb24oZWxlbWVudCwgY2xhc3NOYW1lKSB7XHJcbiAgICB2YXIgb2xkQ2xhc3NlcyA9IGVsZW1lbnQuY2xhc3NOYW1lO1xyXG4gICAgaWYgKG9sZENsYXNzZXMuaW5kZXhPZihjbGFzc05hbWUpIDwgMCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBuZXdDbGFzc2VzID0gb2xkQ2xhc3Nlcy5yZXBsYWNlKFwiIFwiICsgY2xhc3NOYW1lLCBcIlwiKTtcclxuICAgIG5ld0NsYXNzZXMgPSBuZXdDbGFzc2VzLnJlcGxhY2UoY2xhc3NOYW1lICsgXCIgXCIsIFwiXCIpO1xyXG4gICAgaWYgKG5ld0NsYXNzZXMgPT0gY2xhc3NOYW1lKSB7XHJcbiAgICAgICAgbmV3Q2xhc3NlcyA9IFwiXCI7XHJcbiAgICB9XHJcbiAgICBlbGVtZW50LmNsYXNzTmFtZSA9IG5ld0NsYXNzZXM7XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUucmVtb3ZlRnJvbUFycmF5ID0gZnVuY3Rpb24oYXJyYXksIG9iamVjdCkge1xyXG4gICAgYXJyYXkuc3BsaWNlKGFycmF5LmluZGV4T2Yob2JqZWN0KSwgMSk7XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUuZGVmYXVsdENvbXBhcmF0b3IgPSBmdW5jdGlvbih2YWx1ZUEsIHZhbHVlQikge1xyXG4gICAgdmFyIHZhbHVlQU1pc3NpbmcgPSB2YWx1ZUEgPT09IG51bGwgfHwgdmFsdWVBID09PSB1bmRlZmluZWQ7XHJcbiAgICB2YXIgdmFsdWVCTWlzc2luZyA9IHZhbHVlQiA9PT0gbnVsbCB8fCB2YWx1ZUIgPT09IHVuZGVmaW5lZDtcclxuICAgIGlmICh2YWx1ZUFNaXNzaW5nICYmIHZhbHVlQk1pc3NpbmcpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGlmICh2YWx1ZUFNaXNzaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG4gICAgaWYgKHZhbHVlQk1pc3NpbmcpIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodmFsdWVBIDwgdmFsdWVCKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZUEgPiB2YWx1ZUIpIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUuZm9ybWF0V2lkdGggPSBmdW5jdGlvbih3aWR0aCkge1xyXG4gICAgaWYgKHR5cGVvZiB3aWR0aCA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgIHJldHVybiB3aWR0aCArIFwicHhcIjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHdpZHRoO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gdHJpZXMgdG8gdXNlIHRoZSBwcm92aWRlZCByZW5kZXJlci4gaWYgYSByZW5kZXJlciBmb3VuZCwgcmV0dXJucyB0cnVlLlxyXG4vLyBpZiBubyByZW5kZXJlciwgcmV0dXJucyBmYWxzZS5cclxuVXRpbHMucHJvdG90eXBlLnVzZVJlbmRlcmVyID0gZnVuY3Rpb24oZVBhcmVudCwgZVJlbmRlcmVyLCBwYXJhbXMpIHtcclxuICAgIHZhciByZXN1bHRGcm9tUmVuZGVyZXIgPSBlUmVuZGVyZXIocGFyYW1zKTtcclxuICAgIGlmICh0aGlzLmlzTm9kZShyZXN1bHRGcm9tUmVuZGVyZXIpIHx8IHRoaXMuaXNFbGVtZW50KHJlc3VsdEZyb21SZW5kZXJlcikpIHtcclxuICAgICAgICAvL2EgZG9tIG5vZGUgb3IgZWxlbWVudCB3YXMgcmV0dXJuZWQsIHNvIGFkZCBjaGlsZFxyXG4gICAgICAgIGVQYXJlbnQuYXBwZW5kQ2hpbGQocmVzdWx0RnJvbVJlbmRlcmVyKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy9vdGhlcndpc2UgYXNzdW1lIGl0IHdhcyBodG1sLCBzbyBqdXN0IGluc2VydFxyXG4gICAgICAgIHZhciBlVGV4dFNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgZVRleHRTcGFuLmlubmVySFRNTCA9IHJlc3VsdEZyb21SZW5kZXJlcjtcclxuICAgICAgICBlUGFyZW50LmFwcGVuZENoaWxkKGVUZXh0U3Bhbik7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBpZiBpY29uIHByb3ZpZGVkLCB1c2UgdGhpcyAoZWl0aGVyIGEgc3RyaW5nLCBvciBhIGZ1bmN0aW9uIGNhbGxiYWNrKS5cclxuLy8gaWYgbm90LCB0aGVuIHVzZSB0aGUgc2Vjb25kIHBhcmFtZXRlciwgd2hpY2ggaXMgdGhlIHN2Z0ZhY3RvcnkgZnVuY3Rpb25cclxuVXRpbHMucHJvdG90eXBlLmNyZWF0ZUljb24gPSBmdW5jdGlvbihpY29uTmFtZSwgZ3JpZE9wdGlvbnNXcmFwcGVyLCBjb2xEZWZXcmFwcGVyLCBzdmdGYWN0b3J5RnVuYykge1xyXG4gICAgdmFyIGVSZXN1bHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICB2YXIgdXNlclByb3ZpZGVkSWNvbjtcclxuICAgIC8vIGNoZWNrIGNvbCBmb3IgaWNvbiBmaXJzdFxyXG4gICAgaWYgKGNvbERlZldyYXBwZXIgJiYgY29sRGVmV3JhcHBlci5jb2xEZWYuaWNvbnMpIHtcclxuICAgICAgICB1c2VyUHJvdmlkZWRJY29uID0gY29sRGVmV3JhcHBlci5jb2xEZWYuaWNvbnNbaWNvbk5hbWVdO1xyXG4gICAgfVxyXG4gICAgLy8gaXQgbm90IGluIGNvbCwgdHJ5IGdyaWQgb3B0aW9uc1xyXG4gICAgaWYgKCF1c2VyUHJvdmlkZWRJY29uICYmIGdyaWRPcHRpb25zV3JhcHBlci5nZXRJY29ucygpKSB7XHJcbiAgICAgICAgdXNlclByb3ZpZGVkSWNvbiA9IGdyaWRPcHRpb25zV3JhcHBlci5nZXRJY29ucygpW2ljb25OYW1lXTtcclxuICAgIH1cclxuICAgIC8vIG5vdyBpZiB1c2VyIHByb3ZpZGVkLCB1c2UgaXRcclxuICAgIGlmICh1c2VyUHJvdmlkZWRJY29uKSB7XHJcbiAgICAgICAgdmFyIHJlbmRlcmVyUmVzdWx0O1xyXG4gICAgICAgIGlmICh0eXBlb2YgdXNlclByb3ZpZGVkSWNvbiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICByZW5kZXJlclJlc3VsdCA9IHVzZXJQcm92aWRlZEljb24oKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB1c2VyUHJvdmlkZWRJY29uID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICByZW5kZXJlclJlc3VsdCA9IHVzZXJQcm92aWRlZEljb247XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgJ2ljb24gZnJvbSBncmlkIG9wdGlvbnMgbmVlZHMgdG8gYmUgYSBzdHJpbmcgb3IgYSBmdW5jdGlvbic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgcmVuZGVyZXJSZXN1bHQgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGVSZXN1bHQuaW5uZXJIVE1MID0gcmVuZGVyZXJSZXN1bHQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzTm9kZU9yRWxlbWVudChyZW5kZXJlclJlc3VsdCkpIHtcclxuICAgICAgICAgICAgZVJlc3VsdC5hcHBlbmRDaGlsZChyZW5kZXJlclJlc3VsdCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgJ2ljb25SZW5kZXJlciBzaG91bGQgcmV0dXJuIGJhY2sgYSBzdHJpbmcgb3IgYSBkb20gb2JqZWN0JztcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIG90aGVyd2lzZSB3ZSB1c2UgdGhlIGJ1aWx0IGluIGljb25cclxuICAgICAgICBlUmVzdWx0LmFwcGVuZENoaWxkKHN2Z0ZhY3RvcnlGdW5jKCkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGVSZXN1bHQ7XHJcbn07XHJcblxyXG5cclxuVXRpbHMucHJvdG90eXBlLmdldFNjcm9sbGJhcldpZHRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIG91dGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIG91dGVyLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xyXG4gICAgb3V0ZXIuc3R5bGUud2lkdGggPSBcIjEwMHB4XCI7XHJcbiAgICBvdXRlci5zdHlsZS5tc092ZXJmbG93U3R5bGUgPSBcInNjcm9sbGJhclwiOyAvLyBuZWVkZWQgZm9yIFdpbkpTIGFwcHNcclxuXHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG91dGVyKTtcclxuXHJcbiAgICB2YXIgd2lkdGhOb1Njcm9sbCA9IG91dGVyLm9mZnNldFdpZHRoO1xyXG4gICAgLy8gZm9yY2Ugc2Nyb2xsYmFyc1xyXG4gICAgb3V0ZXIuc3R5bGUub3ZlcmZsb3cgPSBcInNjcm9sbFwiO1xyXG5cclxuICAgIC8vIGFkZCBpbm5lcmRpdlxyXG4gICAgdmFyIGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIGlubmVyLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XHJcbiAgICBvdXRlci5hcHBlbmRDaGlsZChpbm5lcik7XHJcblxyXG4gICAgdmFyIHdpZHRoV2l0aFNjcm9sbCA9IGlubmVyLm9mZnNldFdpZHRoO1xyXG5cclxuICAgIC8vIHJlbW92ZSBkaXZzXHJcbiAgICBvdXRlci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG91dGVyKTtcclxuXHJcbiAgICByZXR1cm4gd2lkdGhOb1Njcm9sbCAtIHdpZHRoV2l0aFNjcm9sbDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IFV0aWxzKCk7XHJcbiIsIi8qXHJcbiAqIFRoaXMgcm93IGNvbnRyb2xsZXIgaXMgdXNlZCBmb3IgaW5maW5pdGUgc2Nyb2xsaW5nIG9ubHkuIEZvciBub3JtYWwgJ2luIG1lbW9yeScgdGFibGUsXHJcbiAqIG9yIHN0YW5kYXJkIHBhZ2luYXRpb24sIHRoZSBpbk1lbW9yeVJvd0NvbnRyb2xsZXIgaXMgdXNlZC5cclxuICovXHJcblxyXG52YXIgbG9nZ2luZyA9IHRydWU7XHJcblxyXG5mdW5jdGlvbiBWaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIoKSB7fVxyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ocm93UmVuZGVyZXIpIHtcclxuICAgIHRoaXMucm93UmVuZGVyZXIgPSByb3dSZW5kZXJlcjtcclxuICAgIHRoaXMuZGF0YXNvdXJjZVZlcnNpb24gPSAwO1xyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5zZXREYXRhc291cmNlID0gZnVuY3Rpb24oZGF0YXNvdXJjZSkge1xyXG4gICAgdGhpcy5kYXRhc291cmNlID0gZGF0YXNvdXJjZTtcclxuXHJcbiAgICBpZiAoIWRhdGFzb3VyY2UpIHtcclxuICAgICAgICAvLyBvbmx5IGNvbnRpbnVlIGlmIHdlIGhhdmUgYSB2YWxpZCBkYXRhc291cmNlIHRvIHdvcmtpbmcgd2l0aFxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlc2V0KCk7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBzZWUgaWYgZGF0YXNvdXJjZSBrbm93cyBob3cgbWFueSByb3dzIHRoZXJlIGFyZVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmRhdGFzb3VyY2Uucm93Q291bnQgPT09ICdudW1iZXInICYmIHRoaXMuZGF0YXNvdXJjZS5yb3dDb3VudCA+PSAwKSB7XHJcbiAgICAgICAgdGhpcy52aXJ0dWFsUm93Q291bnQgPSB0aGlzLmRhdGFzb3VyY2Uucm93Q291bnQ7XHJcbiAgICAgICAgdGhpcy5mb3VuZE1heFJvdyA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMudmlydHVhbFJvd0NvdW50ID0gMDtcclxuICAgICAgICB0aGlzLmZvdW5kTWF4Um93ID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaW4gY2FzZSBhbnkgZGFlbW9uIHJlcXVlc3RzIGNvbWluZyBmcm9tIGRhdGFzb3VyY2UsIHdlIGtub3cgaXQgaWdub3JlIHRoZW1cclxuICAgIHRoaXMuZGF0YXNvdXJjZVZlcnNpb24rKztcclxuXHJcbiAgICAvLyBtYXAgb2YgcGFnZSBudW1iZXJzIHRvIHJvd3MgaW4gdGhhdCBwYWdlXHJcbiAgICB0aGlzLnBhZ2VDYWNoZSA9IHt9O1xyXG4gICAgdGhpcy5wYWdlQ2FjaGVTaXplID0gMDtcclxuXHJcbiAgICAvLyBpZiBhIG51bWJlciBpcyBpbiB0aGlzIGFycmF5LCBpdCBtZWFucyB3ZSBhcmUgcGVuZGluZyBhIGxvYWQgZnJvbSBpdFxyXG4gICAgdGhpcy5wYWdlTG9hZHNJblByb2dyZXNzID0gW107XHJcbiAgICB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZCA9IFtdO1xyXG4gICAgdGhpcy5wYWdlQWNjZXNzVGltZXMgPSB7fTsgLy8ga2VlcHMgYSByZWNvcmQgb2Ygd2hlbiBlYWNoIHBhZ2Ugd2FzIGxhc3Qgdmlld2VkLCB1c2VkIGZvciBMUlUgY2FjaGVcclxuICAgIHRoaXMuYWNjZXNzVGltZSA9IDA7IC8vIHJhdGhlciB0aGFuIHVzaW5nIHRoZSBjbG9jaywgd2UgdXNlIHRoaXMgY291bnRlclxyXG5cclxuICAgIC8vIHRoZSBudW1iZXIgb2YgY29uY3VycmVudCBsb2FkcyB3ZSBhcmUgYWxsb3dlZCB0byB0aGUgc2VydmVyXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZGF0YXNvdXJjZS5tYXhDb25jdXJyZW50UmVxdWVzdHMgPT09ICdudW1iZXInICYmIHRoaXMuZGF0YXNvdXJjZS5tYXhDb25jdXJyZW50UmVxdWVzdHMgPiAwKSB7XHJcbiAgICAgICAgdGhpcy5tYXhDb25jdXJyZW50RGF0YXNvdXJjZVJlcXVlc3RzID0gdGhpcy5kYXRhc291cmNlLm1heENvbmN1cnJlbnRSZXF1ZXN0cztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tYXhDb25jdXJyZW50RGF0YXNvdXJjZVJlcXVlc3RzID0gMjtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0aGUgbnVtYmVyIG9mIHBhZ2VzIHRvIGtlZXAgaW4gYnJvd3NlciBjYWNoZVxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmRhdGFzb3VyY2UubWF4UGFnZXNJbkNhY2hlID09PSAnbnVtYmVyJyAmJiB0aGlzLmRhdGFzb3VyY2UubWF4UGFnZXNJbkNhY2hlID4gMCkge1xyXG4gICAgICAgIHRoaXMubWF4UGFnZXNJbkNhY2hlID0gdGhpcy5kYXRhc291cmNlLm1heFBhZ2VzSW5DYWNoZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gbnVsbCBpcyBkZWZhdWx0LCBtZWFucyBkb24ndCAgaGF2ZSBhbnkgbWF4IHNpemUgb24gdGhlIGNhY2hlXHJcbiAgICAgICAgdGhpcy5tYXhQYWdlc0luQ2FjaGUgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucGFnZVNpemUgPSB0aGlzLmRhdGFzb3VyY2UucGFnZVNpemU7IC8vIHRha2UgYSBjb3B5IG9mIHBhZ2Ugc2l6ZSwgd2UgZG9uJ3Qgd2FudCBpdCBjaGFuZ2luZ1xyXG4gICAgdGhpcy5vdmVyZmxvd1NpemUgPSB0aGlzLmRhdGFzb3VyY2Uub3ZlcmZsb3dTaXplOyAvLyB0YWtlIGEgY29weSBvZiBwYWdlIHNpemUsIHdlIGRvbid0IHdhbnQgaXQgY2hhbmdpbmdcclxuXHJcbiAgICB0aGlzLmRvTG9hZE9yUXVldWUoMCk7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmNyZWF0ZU5vZGVzRnJvbVJvd3MgPSBmdW5jdGlvbihwYWdlTnVtYmVyLCByb3dzKSB7XHJcbiAgICB2YXIgbm9kZXMgPSBbXTtcclxuICAgIGlmIChyb3dzKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSByb3dzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgdmlydHVhbFJvd0luZGV4ID0gKHBhZ2VOdW1iZXIgKiB0aGlzLnBhZ2VTaXplKSArIGk7XHJcbiAgICAgICAgICAgIG5vZGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgZGF0YTogcm93c1tpXSxcclxuICAgICAgICAgICAgICAgIGlkOiB2aXJ0dWFsUm93SW5kZXhcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5vZGVzO1xyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5yZW1vdmVGcm9tTG9hZGluZyA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpIHtcclxuICAgIHZhciBpbmRleCA9IHRoaXMucGFnZUxvYWRzSW5Qcm9ncmVzcy5pbmRleE9mKHBhZ2VOdW1iZXIpO1xyXG4gICAgdGhpcy5wYWdlTG9hZHNJblByb2dyZXNzLnNwbGljZShpbmRleCwgMSk7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnBhZ2VMb2FkRmFpbGVkID0gZnVuY3Rpb24ocGFnZU51bWJlcikge1xyXG4gICAgdGhpcy5yZW1vdmVGcm9tTG9hZGluZyhwYWdlTnVtYmVyKTtcclxuICAgIHRoaXMuY2hlY2tRdWV1ZUZvck5leHRMb2FkKCk7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnBhZ2VMb2FkZWQgPSBmdW5jdGlvbihwYWdlTnVtYmVyLCByb3dzLCBsYXN0Um93KSB7XHJcbiAgICB0aGlzLnB1dFBhZ2VJbnRvQ2FjaGVBbmRQdXJnZShwYWdlTnVtYmVyLCByb3dzKTtcclxuICAgIHRoaXMuY2hlY2tNYXhSb3dBbmRJbmZvcm1Sb3dSZW5kZXJlcihwYWdlTnVtYmVyLCBsYXN0Um93KTtcclxuICAgIHRoaXMucmVtb3ZlRnJvbUxvYWRpbmcocGFnZU51bWJlcik7XHJcbiAgICB0aGlzLmNoZWNrUXVldWVGb3JOZXh0TG9hZCgpO1xyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5wdXRQYWdlSW50b0NhY2hlQW5kUHVyZ2UgPSBmdW5jdGlvbihwYWdlTnVtYmVyLCByb3dzKSB7XHJcbiAgICB0aGlzLnBhZ2VDYWNoZVtwYWdlTnVtYmVyXSA9IHRoaXMuY3JlYXRlTm9kZXNGcm9tUm93cyhwYWdlTnVtYmVyLCByb3dzKTtcclxuICAgIHRoaXMucGFnZUNhY2hlU2l6ZSsrO1xyXG4gICAgaWYgKGxvZ2dpbmcpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnYWRkaW5nIHBhZ2UgJyArIHBhZ2VOdW1iZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBuZWVkVG9QdXJnZSA9IHRoaXMubWF4UGFnZXNJbkNhY2hlICYmIHRoaXMubWF4UGFnZXNJbkNhY2hlIDwgdGhpcy5wYWdlQ2FjaGVTaXplO1xyXG4gICAgaWYgKG5lZWRUb1B1cmdlKSB7XHJcbiAgICAgICAgLy8gZmluZCB0aGUgTFJVIHBhZ2VcclxuICAgICAgICB2YXIgeW91bmdlc3RQYWdlSW5kZXggPSB0aGlzLmZpbmRMZWFzdFJlY2VudGx5QWNjZXNzZWRQYWdlKE9iamVjdC5rZXlzKHRoaXMucGFnZUNhY2hlKSk7XHJcblxyXG4gICAgICAgIGlmIChsb2dnaW5nKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwdXJnaW5nIHBhZ2UgJyArIHlvdW5nZXN0UGFnZUluZGV4ICsgJyBmcm9tIGNhY2hlICcgKyBPYmplY3Qua2V5cyh0aGlzLnBhZ2VDYWNoZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkZWxldGUgdGhpcy5wYWdlQ2FjaGVbeW91bmdlc3RQYWdlSW5kZXhdO1xyXG4gICAgICAgIHRoaXMucGFnZUNhY2hlU2l6ZS0tO1xyXG4gICAgfVxyXG5cclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUuY2hlY2tNYXhSb3dBbmRJbmZvcm1Sb3dSZW5kZXJlciA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIsIGxhc3RSb3cpIHtcclxuICAgIGlmICghdGhpcy5mb3VuZE1heFJvdykge1xyXG4gICAgICAgIC8vIGlmIHdlIGtub3cgdGhlIGxhc3Qgcm93LCB1c2UgaWZcclxuICAgICAgICBpZiAodHlwZW9mIGxhc3RSb3cgPT09ICdudW1iZXInICYmIGxhc3RSb3cgPj0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnZpcnR1YWxSb3dDb3VudCA9IGxhc3RSb3c7XHJcbiAgICAgICAgICAgIHRoaXMuZm91bmRNYXhSb3cgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgc2VlIGlmIHdlIG5lZWQgdG8gYWRkIHNvbWUgdmlydHVhbCByb3dzXHJcbiAgICAgICAgICAgIHZhciB0aGlzUGFnZVBsdXNCdWZmZXIgPSAoKHBhZ2VOdW1iZXIgKyAxKSAqIHRoaXMucGFnZVNpemUpICsgdGhpcy5vdmVyZmxvd1NpemU7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnZpcnR1YWxSb3dDb3VudCA8IHRoaXNQYWdlUGx1c0J1ZmZlcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy52aXJ0dWFsUm93Q291bnQgPSB0aGlzUGFnZVBsdXNCdWZmZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaWYgcm93Q291bnQgY2hhbmdlcywgcmVmcmVzaFZpZXcsIG90aGVyd2lzZSBqdXN0IHJlZnJlc2hBbGxWaXJ0dWFsUm93c1xyXG4gICAgICAgIHRoaXMucm93UmVuZGVyZXIucmVmcmVzaFZpZXcoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5yb3dSZW5kZXJlci5yZWZyZXNoQWxsVmlydHVhbFJvd3MoKTtcclxuICAgIH1cclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUuaXNQYWdlQWxyZWFkeUxvYWRpbmcgPSBmdW5jdGlvbihwYWdlTnVtYmVyKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5wYWdlTG9hZHNJblByb2dyZXNzLmluZGV4T2YocGFnZU51bWJlcikgPj0gMCB8fCB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5pbmRleE9mKHBhZ2VOdW1iZXIpID49IDA7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5kb0xvYWRPclF1ZXVlID0gZnVuY3Rpb24ocGFnZU51bWJlcikge1xyXG4gICAgLy8gaWYgd2UgYWxyZWFkeSB0cmllZCB0byBsb2FkIHRoaXMgcGFnZSwgdGhlbiBpZ25vcmUgdGhlIHJlcXVlc3QsXHJcbiAgICAvLyBvdGhlcndpc2Ugc2VydmVyIHdvdWxkIGJlIGhpdCA1MCB0aW1lcyBqdXN0IHRvIGRpc3BsYXkgb25lIHBhZ2UsIHRoZVxyXG4gICAgLy8gZmlyc3Qgcm93IHRvIGZpbmQgdGhlIHBhZ2UgbWlzc2luZyBpcyBlbm91Z2guXHJcbiAgICBpZiAodGhpcy5pc1BhZ2VBbHJlYWR5TG9hZGluZyhwYWdlTnVtYmVyKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0cnkgdGhlIHBhZ2UgbG9hZCAtIGlmIG5vdCBhbHJlYWR5IGRvaW5nIGEgbG9hZCwgdGhlbiB3ZSBjYW4gZ28gYWhlYWRcclxuICAgIGlmICh0aGlzLnBhZ2VMb2Fkc0luUHJvZ3Jlc3MubGVuZ3RoIDwgdGhpcy5tYXhDb25jdXJyZW50RGF0YXNvdXJjZVJlcXVlc3RzKSB7XHJcbiAgICAgICAgLy8gZ28gYWhlYWQsIGxvYWQgdGhlIHBhZ2VcclxuICAgICAgICB0aGlzLmxvYWRQYWdlKHBhZ2VOdW1iZXIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvdGhlcndpc2UsIHF1ZXVlIHRoZSByZXF1ZXN0XHJcbiAgICAgICAgdGhpcy5hZGRUb1F1ZXVlQW5kUHVyZ2VRdWV1ZShwYWdlTnVtYmVyKTtcclxuICAgIH1cclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUuYWRkVG9RdWV1ZUFuZFB1cmdlUXVldWUgPSBmdW5jdGlvbihwYWdlTnVtYmVyKSB7XHJcbiAgICBpZiAobG9nZ2luZykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdxdWV1ZWluZyAnICsgcGFnZU51bWJlciArICcgLSAnICsgdGhpcy5wYWdlTG9hZHNRdWV1ZWQpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5wYWdlTG9hZHNRdWV1ZWQucHVzaChwYWdlTnVtYmVyKTtcclxuXHJcbiAgICAvLyBzZWUgaWYgdGhlcmUgYXJlIG1vcmUgcGFnZXMgcXVldWVkIHRoYXQgYXJlIGFjdHVhbGx5IGluIG91ciBjYWNoZSwgaWYgc28gdGhlcmUgaXNcclxuICAgIC8vIG5vIHBvaW50IGluIGxvYWRpbmcgdGhlbSBhbGwgYXMgc29tZSB3aWxsIGJlIHB1cmdlZCBhcyBzb29uIGFzIGxvYWRlZFxyXG4gICAgdmFyIG5lZWRUb1B1cmdlID0gdGhpcy5tYXhQYWdlc0luQ2FjaGUgJiYgdGhpcy5tYXhQYWdlc0luQ2FjaGUgPCB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5sZW5ndGg7XHJcbiAgICBpZiAobmVlZFRvUHVyZ2UpIHtcclxuICAgICAgICAvLyBmaW5kIHRoZSBMUlUgcGFnZVxyXG4gICAgICAgIHZhciB5b3VuZ2VzdFBhZ2VJbmRleCA9IHRoaXMuZmluZExlYXN0UmVjZW50bHlBY2Nlc3NlZFBhZ2UodGhpcy5wYWdlTG9hZHNRdWV1ZWQpO1xyXG5cclxuICAgICAgICBpZiAobG9nZ2luZykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZGUtcXVldWVpbmcgJyArIHBhZ2VOdW1iZXIgKyAnIC0gJyArIHRoaXMucGFnZUxvYWRzUXVldWVkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBpbmRleFRvUmVtb3ZlID0gdGhpcy5wYWdlTG9hZHNRdWV1ZWQuaW5kZXhPZih5b3VuZ2VzdFBhZ2VJbmRleCk7XHJcbiAgICAgICAgdGhpcy5wYWdlTG9hZHNRdWV1ZWQuc3BsaWNlKGluZGV4VG9SZW1vdmUsIDEpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5maW5kTGVhc3RSZWNlbnRseUFjY2Vzc2VkUGFnZSA9IGZ1bmN0aW9uKHBhZ2VJbmRleGVzKSB7XHJcbiAgICB2YXIgeW91bmdlc3RQYWdlSW5kZXggPSAtMTtcclxuICAgIHZhciB5b3VuZ2VzdFBhZ2VBY2Nlc3NUaW1lID0gTnVtYmVyLk1BWF9WQUxVRTtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICBwYWdlSW5kZXhlcy5mb3JFYWNoKGZ1bmN0aW9uKHBhZ2VJbmRleCkge1xyXG4gICAgICAgIHZhciBhY2Nlc3NUaW1lVGhpc1BhZ2UgPSB0aGF0LnBhZ2VBY2Nlc3NUaW1lc1twYWdlSW5kZXhdO1xyXG4gICAgICAgIGlmIChhY2Nlc3NUaW1lVGhpc1BhZ2UgPCB5b3VuZ2VzdFBhZ2VBY2Nlc3NUaW1lKSB7XHJcbiAgICAgICAgICAgIHlvdW5nZXN0UGFnZUFjY2Vzc1RpbWUgPSBhY2Nlc3NUaW1lVGhpc1BhZ2U7XHJcbiAgICAgICAgICAgIHlvdW5nZXN0UGFnZUluZGV4ID0gcGFnZUluZGV4O1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB5b3VuZ2VzdFBhZ2VJbmRleDtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUuY2hlY2tRdWV1ZUZvck5leHRMb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5wYWdlTG9hZHNRdWV1ZWQubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIC8vIHRha2UgZnJvbSB0aGUgZnJvbnQgb2YgdGhlIHF1ZXVlXHJcbiAgICAgICAgdmFyIHBhZ2VUb0xvYWQgPSB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZFswXTtcclxuICAgICAgICB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5zcGxpY2UoMCwgMSk7XHJcblxyXG4gICAgICAgIGlmIChsb2dnaW5nKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZXF1ZXVlaW5nICcgKyBwYWdlVG9Mb2FkICsgJyAtICcgKyB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxvYWRQYWdlKHBhZ2VUb0xvYWQpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5sb2FkUGFnZSA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpIHtcclxuXHJcbiAgICB0aGlzLnBhZ2VMb2Fkc0luUHJvZ3Jlc3MucHVzaChwYWdlTnVtYmVyKTtcclxuXHJcbiAgICB2YXIgc3RhcnRSb3cgPSBwYWdlTnVtYmVyICogdGhpcy5wYWdlU2l6ZTtcclxuICAgIHZhciBlbmRSb3cgPSAocGFnZU51bWJlciArIDEpICogdGhpcy5wYWdlU2l6ZTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB2YXIgZGF0YXNvdXJjZVZlcnNpb25Db3B5ID0gdGhpcy5kYXRhc291cmNlVmVyc2lvbjtcclxuXHJcbiAgICB0aGlzLmRhdGFzb3VyY2UuZ2V0Um93cyhzdGFydFJvdywgZW5kUm93LFxyXG4gICAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3Mocm93cywgbGFzdFJvdykge1xyXG4gICAgICAgICAgICBpZiAodGhhdC5yZXF1ZXN0SXNEYWVtb24oZGF0YXNvdXJjZVZlcnNpb25Db3B5KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoYXQucGFnZUxvYWRlZChwYWdlTnVtYmVyLCByb3dzLCBsYXN0Um93KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZ1bmN0aW9uIGZhaWwoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGF0LnJlcXVlc3RJc0RhZW1vbihkYXRhc291cmNlVmVyc2lvbkNvcHkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhhdC5wYWdlTG9hZEZhaWxlZChwYWdlTnVtYmVyKTtcclxuICAgICAgICB9XHJcbiAgICApO1xyXG59O1xyXG5cclxuLy8gY2hlY2sgdGhhdCB0aGUgZGF0YXNvdXJjZSBoYXMgbm90IGNoYW5nZWQgc2luY2UgdGhlIGxhdHMgdGltZSB3ZSBkaWQgYSByZXF1ZXN0XHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUucmVxdWVzdElzRGFlbW9uID0gZnVuY3Rpb24oZGF0YXNvdXJjZVZlcnNpb25Db3B5KSB7XHJcbiAgICByZXR1cm4gdGhpcy5kYXRhc291cmNlVmVyc2lvbiAhPT0gZGF0YXNvdXJjZVZlcnNpb25Db3B5O1xyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5nZXRWaXJ0dWFsUm93ID0gZnVuY3Rpb24ocm93SW5kZXgpIHtcclxuICAgIGlmIChyb3dJbmRleCA+IHRoaXMudmlydHVhbFJvd0NvdW50KSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHBhZ2VOdW1iZXIgPSBNYXRoLmZsb29yKHJvd0luZGV4IC8gdGhpcy5wYWdlU2l6ZSk7XHJcbiAgICB2YXIgcGFnZSA9IHRoaXMucGFnZUNhY2hlW3BhZ2VOdW1iZXJdO1xyXG5cclxuICAgIC8vIGZvciBMUlUgY2FjaGUsIHRyYWNrIHdoZW4gdGhpcyBwYWdlIHdhcyBsYXN0IGhpdFxyXG4gICAgdGhpcy5wYWdlQWNjZXNzVGltZXNbcGFnZU51bWJlcl0gPSB0aGlzLmFjY2Vzc1RpbWUrKztcclxuXHJcbiAgICBpZiAoIXBhZ2UpIHtcclxuICAgICAgICB0aGlzLmRvTG9hZE9yUXVldWUocGFnZU51bWJlcik7XHJcbiAgICAgICAgLy8gcmV0dXJuIGJhY2sgYW4gZW1wdHkgcm93LCBzbyB0YWJsZSBjYW4gYXQgbGVhc3QgcmVuZGVyIGVtcHR5IGNlbGxzXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZGF0YToge30sXHJcbiAgICAgICAgICAgIGlkOiByb3dJbmRleFxyXG4gICAgICAgIH07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBpbmRleEluVGhpc1BhZ2UgPSByb3dJbmRleCAlIHRoaXMucGFnZVNpemU7XHJcbiAgICAgICAgcmV0dXJuIHBhZ2VbaW5kZXhJblRoaXNQYWdlXTtcclxuICAgIH1cclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUuZ2V0TW9kZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0VmlydHVhbFJvdzogZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZ2V0VmlydHVhbFJvdyhpbmRleCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRWaXJ0dWFsUm93Q291bnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC52aXJ0dWFsUm93Q291bnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyO1xyXG4iXX0=
