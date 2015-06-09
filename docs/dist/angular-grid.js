(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Angular Grid
// Written by Niall Crosby
// www.angulargrid.com
//
// Version 1.8.1

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
        angularModule.directive("agGrid", function() {
            return {
                restrict: "A",
                controller: ['$element', '$scope', '$compile', '$attrs', AngularDirectiveController],
                scope: true
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

    function AngularDirectiveController($element, $scope, $compile, $attrs) {
        var gridOptions;
        var quickFilterOnScope;
        if ($attrs) {
            // new directive of ag-grid
            var keyOfGridInScope = $attrs.agGrid;
            var quickFilterOnScope = keyOfGridInScope + '.quickFilterText';
            gridOptions = $scope.$eval(keyOfGridInScope);
            if (!gridOptions) {
                console.warn("WARNING - grid options for Angular Grid not found. Please ensure the attribute ag-grid points to a valid object on the scope");
                return;
            }
        } else {
            // old directive of angular-grid
            console.warn("WARNING - Directive angular-grid is deprecated, you should use the ag-grid directive instead.");
            gridOptions = $scope.angularGrid;
            quickFilterOnScope = 'angularGrid.quickFilterText';
            if (!gridOptions) {
                console.warn("WARNING - grid options for Angular Grid not found. Please ensure the attribute angular-grid points to a valid object on the scope");
                return;
            }
        }

        var eGridDiv = $element[0];
        var grid = new Grid(eGridDiv, gridOptions, $scope, $compile, quickFilterOnScope);

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
var constants = require('../constants');
var svgFactory = new SvgFactory();

function groupCellRendererFactory(gridOptionsWrapper, selectionRendererFactory) {

    return function groupCellRenderer(params) {

        var eGroupCell = document.createElement('span');
        var node = params.node;

        var cellExpandable = node.group && !node.footer;
        if (cellExpandable) {
            addExpandAndContract(eGroupCell, params);
        }

        var checkboxNeeded = params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.checkbox && !node.footer;
        if (checkboxNeeded) {
            var eCheckbox = selectionRendererFactory.createSelectionCheckbox(node, params.rowIndex);
            eGroupCell.appendChild(eCheckbox);
        }

        if (params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.innerRenderer) {
            createFromInnerRenderer(eGroupCell, params, params.colDef.cellRenderer.innerRenderer);
        } else if (node.footer) {
            createFooterCell(eGroupCell, params);
        } else if (node.group) {
            createGroupCell(eGroupCell, params);
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
            eGroupCell.style.paddingLeft = paddingPx + 'px';
        }

        return eGroupCell;
    };

    function addExpandAndContract(eGroupCell, params) {

        var eExpandIcon = createGroupExpandIcon(true);
        var eContractIcon = createGroupExpandIcon(false);
        eGroupCell.appendChild(eExpandIcon);
        eGroupCell.appendChild(eContractIcon);

        eExpandIcon.addEventListener('click', expandOrContract);
        eContractIcon.addEventListener('click', expandOrContract);
        eGroupCell.addEventListener('dblclick', expandOrContract);

        showAndHideExpandAndContract(eExpandIcon, eContractIcon, params.node.expanded);

        // if parent cell was passed, then we can listen for when focus is on the cell,
        // and then expand / contract as the user hits enter or space-bar
        if (params.eGridCell) {
            params.eGridCell.addEventListener('keydown', function(event) {
                if (utils.isKeyPressed(event, constants.KEY_ENTER)) {
                    expandOrContract();
                    event.preventDefault();
                }
            });
        }

        function expandOrContract() {
            expandGroup(eExpandIcon, eContractIcon, params);
        }
    }

    function showAndHideExpandAndContract(eExpandIcon, eContractIcon, expanded) {
        utils.setVisible(eExpandIcon, !expanded);
        utils.setVisible(eContractIcon, expanded);
    }

    function createFromInnerRenderer(eGroupCell, params, renderer) {
        utils.useRenderer(eGroupCell, renderer, params);
    }

    function expandGroup(eExpandIcon, eContractIcon, params) {
        params.node.expanded = !params.node.expanded;
        params.api.onGroupExpandedOrCollapsed(params.rowIndex + 1);
        showAndHideExpandAndContract(eExpandIcon, eContractIcon, params.node.expanded);
    }

    function createGroupExpandIcon(expanded) {
        if (expanded) {
            return utils.createIcon('groupContracted', gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
        } else {
            return utils.createIcon('groupExpanded', gridOptionsWrapper, null, svgFactory.createArrowDownSvg);
        }
    }

    // creates cell with 'Total {{key}}' for a group
    function createFooterCell(eGroupCell, params) {
        var textToDisplay = "Total " + getGroupName(params);
        var eText = document.createTextNode(textToDisplay);
        eGroupCell.appendChild(eText);
    }

    function getGroupName(params) {
        var cellRenderer = params.colDef.cellRenderer;
        if (cellRenderer && cellRenderer.keyMap
            && typeof cellRenderer.keyMap === 'object' && params.colDef.cellRenderer !== null) {
            var valueFromMap = cellRenderer.keyMap[params.node.key];
            if (valueFromMap) {
                return valueFromMap;
            } else {
                return params.node.key;
            }
        } else {
            return params.node.key;
        }
    }

    // creates cell with '{{key}} ({{childCount}})' for a group
    function createGroupCell(eGroupCell, params) {
        var textToDisplay = " " + getGroupName(params);
        // only include the child count if it's included, eg if user doing custom aggregation,
        // then this could be left out, or set to -1, ie no child count
        var suppressCount = params.colDef.cellRenderer && params.colDef.cellRenderer.suppressCount;
        if (!suppressCount && params.node.allChildrenCount >= 0) {
            textToDisplay += " (" + params.node.allChildrenCount + ")";
        }
        var eText = document.createTextNode(textToDisplay);
        eGroupCell.appendChild(eText);
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
},{"../constants":4,"../svgFactory":23,"../utils":27}],3:[function(require,module,exports){
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
        // + api.getFilterModel() -> to map colDef to column, key can be colDef or field
        getColumn: function(key) {
            for (var i = 0; i<that.columns.length; i++) {
                var colDefMatches = that.columns[i].colDef === key;
                var fieldMatches = that.columns[i].colDef.field === key;
                if (colDefMatches || fieldMatches) {
                    return that.columns[i];
                }
            }
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
    MIN_COL_WIDTH: 10,

    KEY_TAB: 9,
    KEY_ENTER: 13,
    KEY_SPACE: 32,
    KEY_DOWN: 40,
    KEY_UP: 38,
    KEY_LEFT: 37,
    KEY_RIGHT: 39
};

// taken from http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
// At least Safari 3+: "[object HTMLElementConstructor]"
var isChrome = !!window.chrome && !this.isOpera; // Chrome 1+
var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6

if (isOpera) {
    constants.BROWSER = 'opera';
} else if (isFirefox) {
    constants.BROWSER = 'firefox';
} else if (isSafari) {
    constants.BROWSER = 'safari';
} else if (isChrome) {
    constants.BROWSER = 'chrome';
} else if (isIE) {
    constants.BROWSER = 'ie';
}

var isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;
var isWindows = navigator.platform.toUpperCase().indexOf('WIN')>=0;
if (isMac) {
    constants.PLATFORM = 'mac';
} else if (isWindows) {
    constants.PLATFORM = 'win';
}

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

FilterManager.prototype.init = function(grid, gridOptionsWrapper, $compile, $scope, expressionService, columnModel) {
    this.$compile = $compile;
    this.$scope = $scope;
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.grid = grid;
    this.allFilters = {};
    this.expressionService = expressionService;
    this.columnModel = columnModel;
};

FilterManager.prototype.setFilterModel = function(model) {
    var that = this;
    if (model) {
        // mark the filters as we set them, so any active filters left over we stop
        var processedFields = Object.keys(model);
        utils.iterateObject(this.allFilters, function(key, filterWrapper) {
            var field = filterWrapper.column.colDef.field;
            utils.removeFromArray(processedFields, field);
            if (field) {
                var newModel = model[field];
                that.setModelOnFilterWrapper(filterWrapper.filter, newModel);
            } else {
                console.warn('Warning ag-grid - no field found for column while doing setFilterModel');
            }
        });
        // at this point, processedFields contains data for which we don't have a filter working yet
        utils.iterateArray(processedFields, function(field) {
            var column = that.columnModel.getColumn(field);
            if (!column) {
                console.warn('Warning ag-grid - no column found for field ' + field);
                return;
            }
            var filterWrapper = that.getOrCreateFilterWrapper(column);
            that.setModelOnFilterWrapper(filterWrapper.filter, model[field]);
        });
    } else {
        utils.iterateObject(this.allFilters, function(key, filterWrapper) {
            that.setModelOnFilterWrapper(filterWrapper.filter, null);
        });
    }
};

FilterManager.prototype.setModelOnFilterWrapper = function(filter, newModel) {
    // because user can provide filters, we provide useful error checking and messages
    if (typeof filter.getApi !== 'function') {
        console.warn('Warning ag-grid - filter missing getApi method, which is needed for getFilterModel');
        return;
    }
    var filterApi = filter.getApi();
    if (typeof filterApi.setModel !== 'function') {
        console.warn('Warning ag-grid - filter API missing setModel method, which is needed for setFilterModel');
        return;
    }
    filterApi.setModel(newModel);
};

FilterManager.prototype.getFilterModel = function() {
    var result = {};
    utils.iterateObject(this.allFilters, function(key, filterWrapper) {
        // because user can provide filters, we provide useful error checking and messages
        if (typeof filterWrapper.filter.getApi !== 'function') {
            console.warn('Warning ag-grid - filter missing getApi method, which is needed for getFilterModel');
            return;
        }
        var filterApi = filterWrapper.filter.getApi();
        if (typeof filterApi.getModel !== 'function') {
            console.warn('Warning ag-grid - filter API missing getModel method, which is needed for getFilterModel');
            return;
        }
        var model = filterApi.getModel();
        if (model) {
            var field = filterWrapper.column.colDef.field;
            if (!field) {
                console.warn('Warning ag-grid - cannot get filter model when no field value present for column');
            } else {
                result[field] = model;
            }
        }
    });
    return result;
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

        if (!filterWrapper.filter.doesFilterPass) { // because users can do custom filters, give nice error message
            console.error('Filter is missing method doesFilterPass');
        }
        var params = {
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

FilterManager.prototype.createValueGetter = function(colDef) {
    var that = this;
    return function valueGetter(node) {
        var api = that.gridOptionsWrapper.getApi();
        var context = that.gridOptionsWrapper.getContext();
        return utils.getValue(that.expressionService, node.data, colDef, node, api, context);
    };
};

FilterManager.prototype.getFilterApi = function(column) {
    var filterWrapper = this.getOrCreateFilterWrapper(column);
    if (filterWrapper) {
        if (typeof filterWrapper.filter.getApi === 'function') {
            return filterWrapper.filter.getApi();
        }
    }
};

FilterManager.prototype.getOrCreateFilterWrapper = function(column) {
    var filterWrapper = this.allFilters[column.colKey];

    if (!filterWrapper) {
        filterWrapper = this.createFilterWrapper(column);
        this.allFilters[column.colKey] = filterWrapper;
    }

    return filterWrapper;
};

FilterManager.prototype.createFilterWrapper = function(column) {
    var colDef = column.colDef;

    var filterWrapper = {
        column: column
    };
    var filterChangedCallback = this.grid.onFilterChanged.bind(this.grid);
    var filterParams = colDef.filterParams;
    var params = {
        colDef: colDef,
        rowModel: this.rowModel,
        filterChangedCallback: filterChangedCallback,
        filterParams: filterParams,
        localeTextFunc: this.gridOptionsWrapper.getLocaleTextFunc(),
        valueGetter: this.createValueGetter(colDef)
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

    if (!filterWrapper.filter.getGui) { // because users can do custom filters, give nice error message
        throw 'Filter is missing method getGui';
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

    return filterWrapper;
};

FilterManager.prototype.showFilter = function(column, eventSource) {

    var filterWrapper = this.getOrCreateFilterWrapper(column);

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
    this.localeTextFunc = params.localeTextFunc;
    this.valueGetter = params.valueGetter;
    this.createGui();
    this.filterNumber = null;
    this.filterType = EQUALS;
    this.createApi();
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
    var value = this.valueGetter(node);

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

NumberFilter.prototype.createTemplate = function() {
    return template
        .replace('[FILTER...]', this.localeTextFunc('filterOoo', 'Filter...'))
        .replace('[EQUALS]', this.localeTextFunc('equals', 'Equals'))
        .replace('[LESS THAN]', this.localeTextFunc('lessThan', 'Less than'))
        .replace('[GREATER THAN]', this.localeTextFunc('greaterThan', 'Greater than'));
};

NumberFilter.prototype.createGui = function() {
    this.eGui = utils.loadTemplate(this.createTemplate());
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

NumberFilter.prototype.createApi = function() {
    var that = this;
    this.api = {
        EQUALS: EQUALS,
        LESS_THAN: LESS_THAN,
        GREATER_THAN: GREATER_THAN,
        setType: function(type) {
            that.filterType = type;
            that.eTypeSelect.value = type;
        },
        setFilter: function(filter) {
            filter = utils.makeNull(filter);

            if (filter!==null && !(typeof filter === 'number')) {
                filter = parseFloat(filter);
            }
            that.filterNumber = filter;
            that.eFilterTextField.value = filter;
        },
        getType: function() {
            return that.filterType;
        },
        getFilter: function() {
            return that.filterNumber;
        },
        getModel: function() {
            if (that.isFilterActive()) {
                return {
                    type: that.filterType,
                    filter: that.filterNumber
                };
            } else {
                return null;
            }
        },
        setModel: function(dataModel) {
            if (dataModel) {
                this.setType(dataModel.type);
                this.setFilter(dataModel.filter);
            } else {
                this.setFilter(null);
            }
        }
    };
};

NumberFilter.prototype.getApi = function() {
    return this.api;
};

module.exports = NumberFilter;

},{"./../utils":27,"./numberFilterTemplate.js":8}],8:[function(require,module,exports){
var template = [
    '<div>',
    '<div>',
    '<select class="ag-filter-select" id="filterType">',
    '<option value="1">[EQUALS]</option>',
    '<option value="2">[LESS THAN]</option>',
    '<option value="3">[GREATER THAN]</option>',
    '</select>',
    '</div>',
    '<div>',
    '<input class="ag-filter-filter" id="filterText" type="text" placeholder="[FILTER...]"/>',
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
    this.model = new SetFilterModel(params.colDef, params.rowModel, params.valueGetter);
    this.filterChangedCallback = params.filterChangedCallback;
    this.valueGetter = params.valueGetter;
    this.rowsInBodyContainer = {};
    this.colDef = params.colDef;
    this.localeTextFunc = params.localeTextFunc;
    if (filterParams) {
        this.cellRenderer = filterParams.cellRenderer;
    }
    this.createGui();
    this.addScrollListener();
    this.createApi();
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

    //if no filter, always pass
    if (this.model.isEverythingSelected()) {
        return true;
    }
    //if nothing selected in filter, always fail
    if (this.model.isNothingSelected()) {
        return false;
    }

    var value = this.valueGetter(node);
    value = utils.makeNull(value);

    var filterPassed = this.model.isValueSelected(value);
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

SetFilter.prototype.createTemplate = function() {
    return template
        .replace('[SELECT ALL]', this.localeTextFunc('selectAll', 'Select All'))
        .replace('[SEARCH...]', this.localeTextFunc('searchOoo', 'Search...'));
};

SetFilter.prototype.createGui = function() {
    var _this = this;

    this.eGui = utils.loadTemplate(this.createTemplate());

    this.eListContainer = this.eGui.querySelector(".ag-filter-list-container");
    this.eFilterValueTemplate = this.eGui.querySelector("#itemForRepeat");
    this.eSelectAll = this.eGui.querySelector("#selectAll");
    this.eListViewport = this.eGui.querySelector(".ag-filter-list-viewport");
    this.eMiniFilter = this.eGui.querySelector(".ag-filter-filter");
    this.eListContainer.style.height = (this.model.getUniqueValueCount() * this.rowHeight) + "px";

    this.setContainerHeight();
    this.eMiniFilter.value = this.model.getMiniFilter();
    utils.addChangeListener(this.eMiniFilter, function() {
        _this.onMiniFilterChanged();
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
        var blanksText = '(' + this.localeTextFunc('blanks', 'Blanks') + ')';
        var displayNameOfValue = value === null ? blanksText : value;
        valueElement.innerHTML = displayNameOfValue;
    }
    var eCheckbox = eFilterValue.querySelector("input");
    eCheckbox.checked = this.model.isValueSelected(value);

    eCheckbox.onclick = function() {
        _this.onCheckboxClicked(eCheckbox, value);
    };

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

SetFilter.prototype.onMiniFilterChanged = function() {
    var miniFilterChanged = this.model.setMiniFilter(this.eMiniFilter.value);
    if (miniFilterChanged) {
        this.setContainerHeight();
        this.refreshVirtualRows();
    }
};

SetFilter.prototype.refreshVirtualRows = function() {
    this.clearVirtualRows();
    this.drawVirtualRows();
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

SetFilter.prototype.getApi = function() {
    return this.api;
};

SetFilter.prototype.createApi = function() {
    var model = this.model;
    var that = this;
    this.api = {
        setMiniFilter: function(newMiniFilter) {
            model.setMiniFilter(newMiniFilter);
        },
        getMiniFilter: function() {
            return model.getMiniFilter();
        },
        selectEverything: function() {
            model.selectEverything();
        },
        isFilterActive: function() {
            return model.isFilterActive();
        },
        selectNothing: function() {
            model.selectNothing();
        },
        unselectValue: function(value) {
            model.unselectValue(value);
            that.refreshVirtualRows();
        },
        selectValue: function(value) {
            model.selectValue(value);
            that.refreshVirtualRows();
        },
        isValueSelected: function(value) {
            return model.isValueSelected(value);
        },
        isEverythingSelected: function() {
            return model.isEverythingSelected();
        },
        isNothingSelected: function() {
            return model.isNothingSelected();
        },
        getUniqueValueCount: function() {
            return model.getUniqueValueCount();
        },
        getUniqueValue: function(index) {
            return model.getUniqueValue(index);
        },
        getModel: function() {
            return model.getModel();
        },
        setModel: function(dataModel) {
            model.setModel(dataModel);
            that.refreshVirtualRows();
        }
    };
};

module.exports = SetFilter;

},{"./../utils":27,"./setFilterModel":10,"./setFilterTemplate":11}],10:[function(require,module,exports){
var utils = require('../utils');

function SetFilterModel(colDef, rowModel, valueGetter) {

    if (colDef.filterParams && colDef.filterParams.values) {
        this.uniqueValues = colDef.filterParams.values;
    } else {
        this.createUniqueValues(rowModel, colDef.field, valueGetter);
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

SetFilterModel.prototype.createUniqueValues = function(rowModel, key, valueGetter) {
    var uniqueCheck = {};
    var result = [];

    function recursivelyProcess(nodes) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.group && !node.footer) {
                // group node, so dig deeper
                recursivelyProcess(node.children);
            } else {
                var value = valueGetter(node);
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

SetFilterModel.prototype.getUniqueValue = function(index) {
    return this.uniqueValues[index];
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

SetFilterModel.prototype.getModel = function() {
    if (!this.isFilterActive()) {
        return null;
    }
    var selectedValues = [];
    utils.iterateObject(this.selectedValuesMap, function(key) {
        selectedValues.push(key);
    });
    return selectedValues;
};

SetFilterModel.prototype.setModel = function(model) {
    if (model) {
        this.selectNothing();
        for (var i = 0; i<model.length; i++) {
            var newValue = model[i];
            if (this.uniqueValues.indexOf(newValue)>=0) {
                this.selectValue(model[i]);
            } else {
                console.warn('Value ' + newValue + ' is not a valid value for filter');
            }
        }
    } else {
        this.selectEverything();
    }
};

module.exports = SetFilterModel;

},{"../utils":27}],11:[function(require,module,exports){
var template = [
    '<div>',
    '    <div class="ag-filter-header-container">',
    '        <input class="ag-filter-filter" type="text" placeholder="[SEARCH...]"/>',
    '    </div>',
    '    <div class="ag-filter-header-container">',
    '        <label>',
    '            <input id="selectAll" type="checkbox" class="ag-filter-checkbox"/>',
    '            ([SELECT ALL])',
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
    this.localeTextFunc = params.localeTextFunc;
    this.valueGetter = params.valueGetter;
    this.createGui();
    this.filterText = null;
    this.filterType = CONTAINS;
    this.createApi();
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
    var value = this.valueGetter(node);
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

TextFilter.prototype.createTemplate = function() {
    return template
        .replace('[FILTER...]', this.localeTextFunc('filterOoo', 'Filter...'))
        .replace('[EQUALS]', this.localeTextFunc('equals', 'Equals'))
        .replace('[CONTAINS]', this.localeTextFunc('contains', 'Contains'))
        .replace('[STARTS WITH]', this.localeTextFunc('startsWith', 'Starts with'))
        .replace('[ENDS WITH]', this.localeTextFunc('endsWith', 'Ends with'))
;
};

'<option value="1">Contains</option>',
    '<option value="2">Equals</option>',
    '<option value="3">Starts with</option>',
    '<option value="4">Ends with</option>',


TextFilter.prototype.createGui = function() {
    this.eGui = utils.loadTemplate(this.createTemplate());
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

TextFilter.prototype.createApi = function() {
    var that = this;
    this.api = {
        EQUALS: EQUALS,
        CONTAINS: CONTAINS,
        STARTS_WITH: STARTS_WITH,
        ENDS_WITH: ENDS_WITH,
        setType: function(type) {
            that.filterType = type;
            that.eTypeSelect.value = type;
        },
        setFilter: function(filter) {
            filter = utils.makeNull(filter);

            if (filter) {
                that.filterText = filter.toLowerCase();
                that.eFilterTextField.value = filter;
            } else {
                that.filterText = null;
                that.eFilterTextField.value = null;
            }
        },
        getType: function() {
            return that.filterType;
        },
        getFilter: function() {
            return that.filterText;
        },
        getModel: function() {
            if (that.isFilterActive()) {
                return {
                    type: that.filterType,
                    filter: that.filterText
                };
            } else {
                return null;
            }
        },
        setModel: function(dataModel) {
            if (dataModel) {
                this.setType(dataModel.type);
                this.setFilter(dataModel.filter);
            } else {
                this.setFilter(null);
            }
        }
    };
};

TextFilter.prototype.getApi = function() {
    return this.api;
};

module.exports = TextFilter;

},{"../utils":27,"./textFilterTemplate":13}],13:[function(require,module,exports){
var template = [
    '<div>',
    '<div>',
    '<select class="ag-filter-select" id="filterType">',
    '<option value="1">[CONTAINS]</option>',
    '<option value="2">[EQUALS]</option>',
    '<option value="3">[STARTS WITH]</option>',
    '<option value="4">[ENDS WITH]</option>',
    '</select>',
    '</div>',
    '<div>',
    '<input class="ag-filter-filter" id="filterText" type="text" placeholder="[FILTER...]"/>',
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

function Grid(eGridDiv, gridOptions, $scope, $compile, quickFilterOnScope) {

    this.addEnvironmentClasses(eGridDiv);

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
        $scope.$watch(quickFilterOnScope, function(newFilter) {
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

Grid.prototype.addEnvironmentClasses = function(eGridDiv) {
    var platformAndBrowser = 'ag-env-' + constants.PLATFORM + "-" + constants.BROWSER;
    utils.addCssClass(eGridDiv, platformAndBrowser);
};

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
    filterManager.init(this, gridOptionsWrapper, $compile, $scope, expressionService, columnModel);
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
        paginationController.init(this.ePagingPanel, this, gridOptionsWrapper);
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
        this.ePagingPanel.style['display'] = 'inline';
        var heightOfPager = this.ePagingPanel.offsetHeight;
        this.eBody.style['paddingBottom'] = heightOfPager + 'px';
        var heightOfRoot = this.eRoot.clientHeight;
        var topOfPager = heightOfRoot - heightOfPager;
        this.ePagingPanel.style['top'] = topOfPager + 'px';
    } else {
        this.ePagingPanel.style['display'] = 'none';
        this.eBody.style['paddingBottom'] = null;
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
    this.doingVirtualPaging = this.gridOptionsWrapper.isVirtualPaging() && datasourceToUse;
    this.doingPagination = datasourceToUse && !this.doingVirtualPaging;

    if (this.doingVirtualPaging) {
        this.paginationController.setDatasource(null);
        this.virtualPageRowController.setDatasource(datasourceToUse);
        this.rowModel = this.virtualPageRowController.getModel();
        this.showPagingPanel = false;
    } else if (this.doingPagination) {
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
    this.headerRenderer.updateSortIcons();
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

    // making local variables to make the below more readable
    var gridOptionsWrapper = this.gridOptionsWrapper;
    var selectionController = this.selectionController;

    // if no selection method enabled, do nothing
    if (!gridOptionsWrapper.isRowSelection()) {
        return;
    }

    // if click selection suppressed, do nothing
    if (gridOptionsWrapper.isSuppressRowClickSelection()) {
        return;
    }

    // ctrlKey for windows, metaKey for Apple
    var ctrlKeyPressed = event.ctrlKey || event.metaKey;

    var doDeselect = ctrlKeyPressed
        && selectionController.isNodeSelected(node)
        && gridOptionsWrapper.isRowDeselection() ;

    if (doDeselect) {
        selectionController.deselectNode(node);
    } else {
        var tryMulti = ctrlKeyPressed;
        selectionController.selectNode(node, tryMulti);
    }
};

Grid.prototype.setHeaderHeight = function() {
    var headerHeight = this.gridOptionsWrapper.getHeaderHeight();
    var headerHeightPixels = headerHeight + 'px';
    var dontUseScrolls = this.gridOptionsWrapper.isDontUseScrolls();
    if (dontUseScrolls) {
        this.eHeaderContainer.style['height'] = headerHeightPixels;
    } else {
        this.eHeader.style['height'] = headerHeightPixels;
        this.eBody.style['paddingTop'] = headerHeightPixels;
        this.eLoadingPanel.style['marginTop'] = headerHeightPixels;
    }
};

Grid.prototype.showLoadingPanel = function(show) {
    if (show) {
        // setting display to null, actually has the impact of setting it
        // to 'table', as this is part of the ag-loading-panel core style
        this.eLoadingPanel.style.display = 'table';
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

// rowsToRefresh is at what index to start refreshing the rows. the assumption is
// if we are expanding or collapsing a group, then only he rows below the group
// need to be refresh. this allows the context (eg focus) of the other cells to
// remain.
Grid.prototype.updateModelAndRefresh = function(step, refreshFromIndex) {
    this.inMemoryRowController.updateModel(step);
    this.rowRenderer.refreshView(refreshFromIndex);
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
    if (this.doingVirtualPaging) {
        throw 'Cannot use ensureNodeVisible when doing virtual paging, as we cannot check rows that are not in memory';
    }
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

Grid.prototype.ensureColIndexVisible = function(index) {
    if (typeof index !== 'number') {
        console.warn('col index must be a number: ' + index);
        return;
    }

    var columns = this.columnModel.getVisibleColumns();
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
        onGroupExpandedOrCollapsed: function(refreshFromIndex) {
            that.updateModelAndRefresh(constants.STEP_MAP, refreshFromIndex);
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
        ensureColIndexVisible: function(index) {
            return that.ensureColIndexVisible(index);
        },
        ensureIndexVisible: function(index) {
            return that.ensureIndexVisible(index);
        },
        ensureNodeVisible: function(comparator) {
            return that.ensureNodeVisible(comparator);
        },
        forEachInMemory: function(callback) {
            that.rowModel.forEachInMemory(callback);
        },
        getFilterApiForColDef: function(colDef) {
            console.warn('ag-grid API method getFilterApiForColDef deprecated, use getFilterApi instead');
            return this.getFilterApi(colDef);
        },
        getFilterApi: function(key) {
            var column = that.columnModel.getColumn(key);
            return that.filterManager.getFilterApi(column);
        },
        onFilterChanged: function() {
            that.onFilterChanged();
        },
        setSortModel: function(sortModel) {
            that.setSortModel(sortModel);
        },
        getSortModel: function() {
            return that.getSortModel();
        },
        setFilterModel: function(model) {
            that.filterManager.setFilterModel(model);
        },
        getFilterModel: function() {
            return that.filterManager.getFilterModel();
        }
    };
    this.gridOptions.api = api;
};

Grid.prototype.getSortModel = function() {
    var allColumns = this.columnModel.getAllColumns();
    var columnsWithSorting = [];
    var i;
    for (i = 0; i<allColumns.length; i++) {
        if (allColumns[i].sort) {
            columnsWithSorting.push(allColumns[i]);
        }
    }
    columnsWithSorting.sort( function(a,b) {
        return a.sortedAt - b.sortedAt;
    });

    var result = [];
    for (i = 0; i<columnsWithSorting.length; i++) {
        var resultEntry = {
            field: columnsWithSorting[i].colDef.field,
            sort: columnsWithSorting[i].sort
        };
        result.push(resultEntry);
    }

    return result;
};

Grid.prototype.setSortModel = function(sortModel) {
    // first up, clear any previous sort
    var sortModelProvided = sortModel!==null && sortModel!==undefined && sortModel.length>0;
    var allColumns = this.columnModel.getAllColumns();
    for (var i = 0; i<allColumns.length; i++) {
        var column = allColumns[i];

        var sortForCol = null;
        var sortedAt = -1;
        if (sortModelProvided && !column.colDef.suppressSorting) {
            for (var j = 0; j<sortModel.length; j++) {
                var sortModelEntry = sortModel[j];
                if (typeof sortModelEntry.field === 'string'
                    && typeof column.colDef.field === 'string'
                    && sortModelEntry.field === column.colDef.field) {
                    sortForCol = sortModelEntry.sort;
                    sortedAt = j;
                }
            }
        }

        if (sortForCol) {
            column.sort = sortForCol;
            column.sortedAt = sortedAt;
        } else {
            column.sort = null;
            column.sortedAt = null;
        }
    }

    this.headerRenderer.updateSortIcons();
    this.updateModelAndRefresh(constants.STEP_SORT);
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
GridOptionsWrapper.prototype.isRowDeselection = function() { return isTrue(this.gridOptions.rowDeselection); };
GridOptionsWrapper.prototype.isRowSelectionMulti = function() { return this.gridOptions.rowSelection === 'multiple'; };
GridOptionsWrapper.prototype.getContext = function() { return this.gridOptions.context; };
GridOptionsWrapper.prototype.isVirtualPaging = function() { return isTrue(this.gridOptions.virtualPaging); };
GridOptionsWrapper.prototype.isRowsAlreadyGrouped = function() { return isTrue(this.gridOptions.rowsAlreadyGrouped); };
GridOptionsWrapper.prototype.isGroupSelectsChildren = function() { return isTrue(this.gridOptions.groupSelectsChildren); };
GridOptionsWrapper.prototype.isGroupIncludeFooter = function() { return isTrue(this.gridOptions.groupIncludeFooter); };
GridOptionsWrapper.prototype.isSuppressRowClickSelection = function() { return isTrue(this.gridOptions.suppressRowClickSelection); };
GridOptionsWrapper.prototype.isSuppressCellSelection = function() { return isTrue(this.gridOptions.suppressCellSelection); };
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
GridOptionsWrapper.prototype.getGroupAggFields = function() { return this.gridOptions.groupAggFields; };
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

GridOptionsWrapper.prototype.getLocaleTextFunc = function() {
    var that = this;
    return function (key, defaultValue) {
        var localeText = that.gridOptions.localeText;
        if (localeText && localeText[key]) {
            return localeText[key];
        } else {
            return defaultValue;
        }
    };
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
        column.eSortAsc = utils.createIcon('sortAscending', this.gridOptionsWrapper, column, svgFactory.createArrowDownSvg);
        column.eSortDesc = utils.createIcon('sortDescending', this.gridOptionsWrapper, column, svgFactory.createArrowUpSvg);
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

HeaderRenderer.prototype.addSortHandling = function(headerCellLabel, column) {
    var that = this;

    headerCellLabel.addEventListener("click", function(e) {

        // update sort on current col
        if (column.sort === constants.DESC) {
            column.sort = null;
        } else if (column.sort === constants.ASC) {
            column.sort = constants.DESC;
        } else {
            column.sort = constants.ASC;
        }

        // sortedAt used for knowing order of cols when multi-col sort
        if (column.sort) {
            column.sortedAt = new Date().valueOf();
        } else {
            column.sortedAt = null;
        }

        // clear sort on all columns except this one, and update the icons
        that.columnModel.getAllColumns().forEach(function(columnToClear) {
            // Do not clear if either holding shift, or if column in question was clicked
            if (!(e.shiftKey || columnToClear === column)) {
                columnToClear.sort = null;
            }
        });

        that.updateSortIcons();
        that.angularGrid.updateModelAndRefresh(constants.STEP_SORT);
    });
};

HeaderRenderer.prototype.updateSortIcons = function() {
    this.columnModel.getAllColumns().forEach(function(column) {
        // update visibility of icons
        var sortAscending = column.sort === constants.ASC;
        var sortDescending = column.sort === constants.DESC;

        if (column.eSortAsc) {
            utils.setVisible(column.eSortAsc, sortAscending);
        }
        if (column.eSortDesc) {
            utils.setVisible(column.eSortDesc, sortDescending);
        }
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
        },
        forEachInMemory: function(callback) {
            that.forEachInMemory(callback);
        }
    };
};

// public
InMemoryRowController.prototype.getModel = function() {
    return this.model;
};

// public
InMemoryRowController.prototype.forEachInMemory = function(callback) {

    // iterates through each item in memory, and calls the callback function
    function doCallback(list, callback) {
        if (list) {
            for (var i = 0; i<list.length; i++) {
                var item = list[i];
                callback(item);
                if (item.group && group.children) {
                    doCallback(group.children);
                }
            }
        }
    }

    doCallback(this.rowsAfterGroup, callback);
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
InMemoryRowController.prototype.defaultGroupAggFunctionFactory = function(groupAggFields) {
    return function groupAggFunction(rows) {

        var sums = {};

        for (var j = 0; j<groupAggFields.length; j++) {
            var colKey = groupAggFields[j];
            var totalForColumn = null;
            for (var i = 0; i<rows.length; i++) {
                var row = rows[i];
                var thisColumnValue = row.data[colKey];
                // only include if the value is a number
                if (typeof thisColumnValue === 'number') {
                    totalForColumn += thisColumnValue;
                }
            }
            // at this point, if no values were numbers, the result is null (not zero)
            sums[colKey] = totalForColumn;
        }

        return sums;

    };
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
    if (typeof groupAggFunction === 'function') {
        this.recursivelyCreateAggData(this.rowsAfterFilter, groupAggFunction);
        return;
    }

    var groupAggFields = this.gridOptionsWrapper.getGroupAggFields();
    if (groupAggFields) {
        var defaultAggFunction = this.defaultGroupAggFunctionFactory(groupAggFields);
        this.recursivelyCreateAggData(this.rowsAfterFilter, defaultAggFunction);
        return;
    }

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

    var rowNodesBeforeSort = this.rowsAfterFilter ? this.rowsAfterFilter.slice(0) : null;

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
    if (!rowNodes) {
        return;
    }
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
    if (!nodes) {
        return;
    }
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
    if (!nodes) {
        return;
    }
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
    if (!nodes) {
        return;
    }
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
    ' [TO] ',
    '<span id="lastRowOnPage"></span>',
    ' [OF] ',
    '<span id="recordCount"></span>',
    '</span>',
    '<span class="ag-paging-page-summary-panel">',
    '<button class="ag-paging-button" id="btFirst">[FIRST]</button>',
    '<button class="ag-paging-button" id="btPrevious">[PREVIOUS]</button>',
    ' [PAGE] ',
    '<span id="current"></span>',
    ' [OF] ',
    '<span id="total"></span>',
    '<button class="ag-paging-button" id="btNext">[NEXT]</button>',
    '<button class="ag-paging-button" id="btLast">[LAST]</button>',
    '</span>'
].join('');

function PaginationController() {}

PaginationController.prototype.init = function(ePagingPanel, angularGrid, gridOptionsWrapper) {
    this.gridOptionsWrapper = gridOptionsWrapper;
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
        var moreText = this.gridOptionsWrapper.getLocaleTextFunc()('more', 'more');
        this.lbTotal.innerHTML = moreText;
        this.lbRecordCount.innerHTML = moreText;
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

PaginationController.prototype.createTemplate = function() {
    var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
    return TEMPLATE
        .replace('[PAGE]', localeTextFunc('page', 'Page'))
        .replace('[TO]', localeTextFunc('to', 'to'))
        .replace('[OF]', localeTextFunc('of', 'of'))
        .replace('[OF]', localeTextFunc('of', 'of'))
        .replace('[FIRST]', localeTextFunc('first', 'First'))
        .replace('[PREVIOUS]', localeTextFunc('previous', 'Previous'))
        .replace('[NEXT]', localeTextFunc('next', 'Next'))
        .replace('[LAST]', localeTextFunc('last', 'Last'));
};

PaginationController.prototype.populatePanel = function(ePagingPanel) {

    ePagingPanel.innerHTML = this.createTemplate();

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

RowRenderer.prototype.refreshView = function(refreshFromIndex) {
    if (!this.gridOptionsWrapper.isDontUseScrolls()) {
        var rowCount = this.rowModel.getVirtualRowCount();
        var containerHeight = this.gridOptionsWrapper.getRowHeight() * rowCount;
        this.eBodyContainer.style.height = containerHeight + "px";
        this.ePinnedColsContainer.style.height = containerHeight + "px";
    }

    this.refreshAllVirtualRows(refreshFromIndex);
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

RowRenderer.prototype.refreshAllVirtualRows = function(fromIndex) {
    // remove all current virtual rows, as they have old data
    var rowsToRemove = Object.keys(this.renderedRows);
    this.removeVirtualRows(rowsToRemove, fromIndex);

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
RowRenderer.prototype.removeVirtualRows = function(rowsToRemove, fromIndex) {
    var that = this;
    // if no from inde then set to -1, which will refresh everything
    var realFromIndex = (typeof fromIndex === 'number') ? fromIndex : -1;
    rowsToRemove.forEach(function(indexToRemove) {
        if (indexToRemove >= realFromIndex) {
            that.removeVirtualRow(indexToRemove);
        }
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

        var eGroupRow = that.createGroupElement(node, rowIndex, false);
        if (firstColumn.pinned) {
            ePinnedRow.appendChild(eGroupRow);

            var eGroupRowPadding = that.createGroupElement(node, rowIndex, true);
            eMainRow.appendChild(eGroupRowPadding);
        } else {
            eMainRow.appendChild(eGroupRow);
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

RowRenderer.prototype.createGroupElement = function(node, rowIndex, padding) {
    var eRow;
    // padding means we are on the right hand side of a pinned table, ie
    // in the main body.
    if (padding) {
        eRow = document.createElement('span');
    } else {
        var params = {
            node: node,
            data: node.data,
            rowIndex: rowIndex,
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

RowRenderer.prototype.putDataIntoCell = function(column, value, valueGetter, node, $childScope, eSpanWithValue, eGridCell, rowIndex, refreshCellFunction) {
    // template gets preference, then cellRenderer, then do it ourselves
    var colDef = column.colDef;
    if (colDef.template) {
        eSpanWithValue.innerHTML = colDef.template;
    } else if (colDef.templateUrl) {
        var template = this.templateService.getTemplate(colDef.templateUrl, refreshCellFunction);
        if (template) {
            eSpanWithValue.innerHTML = template;
        }
    } else if (colDef.cellRenderer) {
        this.useCellRenderer(column, value, node, $childScope, eSpanWithValue, rowIndex, refreshCellFunction, valueGetter, eGridCell);
    } else {
        // if we insert undefined, then it displays as the string 'undefined', ugly!
        if (value !== undefined && value !== null && value !== '') {
            eSpanWithValue.innerHTML = value;
        }
    }
};

RowRenderer.prototype.useCellRenderer = function(column, value, node, $childScope, eSpanWithValue, rowIndex, refreshCellFunction, valueGetter, eGridCell) {
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
        refreshCell: refreshCellFunction,
        eGridCell: eGridCell
    };
    var cellRenderer;
    if (typeof colDef.cellRenderer === 'object' && colDef.cellRenderer !== null) {
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
        eSpanWithValue.appendChild(resultFromRenderer);
    } else {
        // otherwise assume it was html, so just insert
        eSpanWithValue.innerHTML = resultFromRenderer;
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
    if (typeof classRules === 'object' && classRules !== null) {

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

    // only set tab index if cell selection is enabled
    if (!this.gridOptionsWrapper.isSuppressCellSelection()) {
        eGridCell.setAttribute("tabindex", "-1");
    }

    var value;
    if (valueGetter) {
        value = valueGetter();
    }

    // these are the grid styles, don't change between soft refreshes
    this.addClassesToCell(column, node, eGridCell);

    this.populateAndStyleGridCell(valueGetter, value, eGridCell, isFirstColumn, node, column, rowIndex, $childScope);

    this.addCellClickedHandler(eGridCell, node, column, value, rowIndex);
    this.addCellDoubleClickedHandler(eGridCell, node, column, value, rowIndex, $childScope, isFirstColumn, valueGetter);

    this.addCellNavigationHandler(eGridCell, rowIndex, column, node);

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

RowRenderer.prototype.addCellNavigationHandler = function(eGridCell, rowIndex, column, node) {
    var that = this;
    eGridCell.addEventListener('keydown', function(event) {
        if (that.editingCell) {
            return;
        }
        // only interested on key presses that are directly on this element, not any children elements. this
        // stops navigation if the user is in, for example, a text field inside the cell, and user hits
        // on of the keys we are looking for.
        if (event.target !== eGridCell) {
            return;
        }

        var key = event.which || event.keyCode;

        var startNavigation = key === constants.KEY_DOWN || key === constants.KEY_UP
            || key === constants.KEY_LEFT || key === constants.KEY_RIGHT;
        if (startNavigation) {
            event.preventDefault();
            that.navigateToNextCell(key, rowIndex, column);
        }

        var startEdit = key === constants.KEY_ENTER;
        if (startEdit) {
            var startEditingFunc = that.renderedRowStartEditingListeners[rowIndex][column.colKey];
            if (startEditingFunc) {
                var editingStarted = startEditingFunc();
                if (editingStarted) {
                    // if we don't prevent default, then the editor that get displayed also picks up the 'enter key'
                    // press, and stops editing immediately, hence giving he user experience that nothing happened
                    event.preventDefault();
                }
            }
        }

        var selectRow = key === constants.KEY_SPACE;
        if (selectRow && that.gridOptionsWrapper.isRowSelection()) {
            var selected = that.selectionController.isNodeSelected(node);
            if (selected) {
                that.selectionController.deselectNode(node);
            } else {
                that.selectionController.selectNode(node, true);
            }
            event.preventDefault();
        }
    });
};

// we use index for rows, but column object for columns, as the next column (by index) might not
// be visible (header grouping) so it's not reliable, so using the column object instead.
RowRenderer.prototype.navigateToNextCell = function(key, rowIndex, column) {

    var cellToFocus = {rowIndex: rowIndex, column: column};
    var renderedRow;
    var eCell;

    // we keep searching for a next cell until we find one. this is how the group rows get skipped
    while (!eCell) {
        cellToFocus = this.getNextCellToFocus(key, cellToFocus);
        // no next cell means we have reached a grid boundary, eg left, right, top or bottom of grid
        if (!cellToFocus) {
            return;
        }
        // see if the next cell is selectable, if yes, use it, if not, skip it
        renderedRow = this.renderedRows[cellToFocus.rowIndex];
        eCell = renderedRow.eCells[cellToFocus.column.index];
    }

    // this scrolls the row into view
    this.angularGrid.ensureIndexVisible(renderedRow.rowIndex);

    // this changes the css on the cell
    this.focusCell(eCell, cellToFocus.rowIndex, cellToFocus.column.index, true);
};

RowRenderer.prototype.getNextCellToFocus = function(key, lastCellToFocus) {
    var lastRowIndex = lastCellToFocus.rowIndex;
    var lastColumn = lastCellToFocus.column;

    var nextRowToFocus;
    var nextColumnToFocus;
    switch (key) {
        case constants.KEY_UP :
            // if already on top row, do nothing
            if (lastRowIndex === this.firstVirtualRenderedRow) {
                return null;
            }
            nextRowToFocus = lastRowIndex - 1;
            nextColumnToFocus = lastColumn;
            break;
        case constants.KEY_DOWN :
            // if already on bottom, do nothing
            if (lastRowIndex === this.lastVirtualRenderedRow) {
                return null;
            }
            nextRowToFocus = lastRowIndex + 1;
            nextColumnToFocus = lastColumn;
            break;
        case constants.KEY_RIGHT :
            var colToRight = this.columnModel.getVisibleColAfter(lastColumn);
            // if already on right, do nothing
            if (!colToRight) {
                return null;
            }
            nextRowToFocus = lastRowIndex ;
            nextColumnToFocus = colToRight;
            break;
        case constants.KEY_LEFT :
            var colToLeft = this.columnModel.getVisibleColBefore(lastColumn);
            // if already on left, do nothing
            if (!colToLeft) {
                return null;
            }
            nextRowToFocus = lastRowIndex ;
            nextColumnToFocus = colToLeft;
            break;
    }

    return {
        rowIndex: nextRowToFocus,
        column: nextColumnToFocus
    };
};

RowRenderer.prototype.focusCell = function(eCell, rowIndex, colIndex, forceBrowserFocus) {
    // do nothing if cell selection is off
    if (this.gridOptionsWrapper.isSuppressCellSelection()) {
        return;
    }
    // remove any previous focus
    utils.querySelectorAll_replaceCssClass(this.eParentOfRows, '.ag-cell-focus', 'ag-cell-focus', 'ag-cell-no-focus');

    var selectorForCell = '[row="' + rowIndex + '"] [col="' + colIndex + '"]';
    utils.querySelectorAll_replaceCssClass(this.eParentOfRows, selectorForCell, 'ag-cell-no-focus', 'ag-cell-focus');

    // this puts the browser focus on the cell (so it gets key presses)
    if (forceBrowserFocus) {
        eCell.focus();
    }
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
    utils.addCssClass(eCellWrapper, "ag-cell-wrapper");
    eGridCell.appendChild(eCellWrapper);

    var colDef = column.colDef;
    if (colDef.checkboxSelection) {
        var eCheckbox = this.selectionRendererFactory.createSelectionCheckbox(node, rowIndex);
        eCellWrapper.appendChild(eCheckbox);
    }

    // eventually we call eSpanWithValue.innerHTML = xxx, so cannot include the checkbox (above) in this span
    var eSpanWithValue = document.createElement("span");
    utils.addCssClass(eSpanWithValue, "ag-cell-value");

    eCellWrapper.appendChild(eSpanWithValue);

    var that = this;
    var refreshCellFunction = function() {
        that.softRefreshCell(eGridCell, isFirstColumn, node, column, $childScope, rowIndex);
    };

    this.putDataIntoCell(column, value, valueGetter, node, $childScope, eSpanWithValue, eGridCell, rowIndex, refreshCellFunction);
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
        // we pass false to focusCell, as we don't want the cell to focus
        // also get the browser focus. if we did, then the cellRenderer could
        // have a text field in it, for example, and as the user clicks on the
        // text field, the text field, the focus doesn't get to the text
        // field, instead to goes to the div behind, making it impossible to
        // select the text field.
        that.focusCell(eGridCell, rowIndex, column.index, false);
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
        if (key == constants.KEY_ENTER) {
            that.stopEditing(eGridCell, column, node, $childScope, eInput, blurListener, rowIndex, isFirstColumn, valueGetter);
            that.focusCell(eGridCell, rowIndex, column.index, true);
        }
    });

    // tab key doesn't generate keypress, so need keydown to listen for that
    eInput.addEventListener('keydown', function(event) {
        var key = event.which || event.keyCode;
        if (key == constants.KEY_TAB) {
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
    this.gridOptionsWrapper = gridOptionsWrapper;

    this.initSelectedNodesById();

    this.selectedRows = [];
    gridOptionsWrapper.setSelectedRows(this.selectedRows);
};

SelectionController.prototype.initSelectedNodesById = function() {
    this.selectedNodesById = {};
    this.gridOptionsWrapper.setSelectedNodesById(this.selectedNodesById);
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
    this.initSelectedNodesById();
    //var keys = Object.keys(this.selectedNodesById);
    //for (var i = 0; i < keys.length; i++) {
    //    delete this.selectedNodesById[keys[i]];
    //}
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
    if (this.$scope) {
        setTimeout(function() {
            that.$scope.$apply();
        }, 0);
    }
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

Utils.prototype.iterateObject = function(object, callback) {
    var keys = Object.keys(object);
    for (var i = 0; i<keys.length; i++) {
        var key = keys[i];
        var value = object[key];
        callback(key, value);
    }
};

Utils.prototype.iterateArray = function(array, callback) {
    for (var index = 0; index<array.length; index++) {
        var value = array[index];
        callback(value, index);
    }
};

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

Utils.prototype.isKeyPressed = function(event, keyToCheck) {
    var pressedKey = event.which || event.keyCode;
    return pressedKey === keyToCheck;
};

Utils.prototype.setVisible = function(element, visible) {
    if (visible) {
        element.style.display = 'inline';
    } else {
        element.style.display = 'none';
    }
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

VirtualPageRowController.prototype.forEachInMemory = function(callback) {
    var pageKeys = Object.keys(this.pageCache);
    for (var i = 0; i<pageKeys.length; i++) {
        var pageKey = pageKeys[i];
        var page = this.pageCache[pageKey];
        for (var j = 0; j<page.length; j++) {
            var node = page[j];
            callback(node);
        }
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
        },
        forEachInMemory: function( callback ) {
            that.forEachInMemory(callback);
        }
    };
};

module.exports = VirtualPageRowController;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9jZWxsUmVuZGVyZXJzL2dyb3VwQ2VsbFJlbmRlcmVyRmFjdG9yeS5qcyIsInNyYy9qcy9jb2x1bW5Db250cm9sbGVyLmpzIiwic3JjL2pzL2NvbnN0YW50cy5qcyIsInNyYy9qcy9leHByZXNzaW9uU2VydmljZS5qcyIsInNyYy9qcy9maWx0ZXIvZmlsdGVyTWFuYWdlci5qcyIsInNyYy9qcy9maWx0ZXIvbnVtYmVyRmlsdGVyLmpzIiwic3JjL2pzL2ZpbHRlci9udW1iZXJGaWx0ZXJUZW1wbGF0ZS5qcyIsInNyYy9qcy9maWx0ZXIvc2V0RmlsdGVyLmpzIiwic3JjL2pzL2ZpbHRlci9zZXRGaWx0ZXJNb2RlbC5qcyIsInNyYy9qcy9maWx0ZXIvc2V0RmlsdGVyVGVtcGxhdGUuanMiLCJzcmMvanMvZmlsdGVyL3RleHRGaWx0ZXIuanMiLCJzcmMvanMvZmlsdGVyL3RleHRGaWx0ZXJUZW1wbGF0ZS5qcyIsInNyYy9qcy9ncmlkLmpzIiwic3JjL2pzL2dyaWRPcHRpb25zV3JhcHBlci5qcyIsInNyYy9qcy9ncm91cENyZWF0b3IuanMiLCJzcmMvanMvaGVhZGVyUmVuZGVyZXIuanMiLCJzcmMvanMvaW5NZW1vcnlSb3dDb250cm9sbGVyLmpzIiwic3JjL2pzL3BhZ2luYXRpb25Db250cm9sbGVyLmpzIiwic3JjL2pzL3Jvd1JlbmRlcmVyLmpzIiwic3JjL2pzL3NlbGVjdGlvbkNvbnRyb2xsZXIuanMiLCJzcmMvanMvc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LmpzIiwic3JjL2pzL3N2Z0ZhY3RvcnkuanMiLCJzcmMvanMvdGVtcGxhdGUuanMiLCJzcmMvanMvdGVtcGxhdGVOb1Njcm9sbHMuanMiLCJzcmMvanMvdGVtcGxhdGVTZXJ2aWNlLmpzIiwic3JjL2pzL3V0aWxzLmpzIiwic3JjL2pzL3ZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzExQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25nQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3piQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gQW5ndWxhciBHcmlkXHJcbi8vIFdyaXR0ZW4gYnkgTmlhbGwgQ3Jvc2J5XHJcbi8vIHd3dy5hbmd1bGFyZ3JpZC5jb21cclxuLy9cclxuLy8gVmVyc2lvbiAxLjguMVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIG9yIGBleHBvcnRzYFxyXG4gICAgdmFyIHJvb3QgPSB0aGlzO1xyXG4gICAgdmFyIEdyaWQgPSByZXF1aXJlKCcuL2dyaWQnKTtcclxuXHJcbiAgICAvLyBpZiBhbmd1bGFyIGlzIHByZXNlbnQsIHJlZ2lzdGVyIHRoZSBkaXJlY3RpdmVcclxuICAgIGlmICh0eXBlb2YgYW5ndWxhciAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICB2YXIgYW5ndWxhck1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwiYW5ndWxhckdyaWRcIiwgW10pO1xyXG4gICAgICAgIGFuZ3VsYXJNb2R1bGUuZGlyZWN0aXZlKFwiYW5ndWxhckdyaWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICByZXN0cmljdDogXCJBXCIsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRlbGVtZW50JywgJyRzY29wZScsICckY29tcGlsZScsIEFuZ3VsYXJEaXJlY3RpdmVDb250cm9sbGVyXSxcclxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhckdyaWQ6IFwiPVwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgYW5ndWxhck1vZHVsZS5kaXJlY3RpdmUoXCJhZ0dyaWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICByZXN0cmljdDogXCJBXCIsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRlbGVtZW50JywgJyRzY29wZScsICckY29tcGlsZScsICckYXR0cnMnLCBBbmd1bGFyRGlyZWN0aXZlQ29udHJvbGxlcl0sXHJcbiAgICAgICAgICAgICAgICBzY29wZTogdHJ1ZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcclxuICAgICAgICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gYW5ndWxhckdyaWRHbG9iYWxGdW5jdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZXhwb3J0cy5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkR2xvYmFsRnVuY3Rpb247XHJcbiAgICB9XHJcblxyXG4gICAgcm9vdC5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkR2xvYmFsRnVuY3Rpb247XHJcblxyXG4gICAgZnVuY3Rpb24gQW5ndWxhckRpcmVjdGl2ZUNvbnRyb2xsZXIoJGVsZW1lbnQsICRzY29wZSwgJGNvbXBpbGUsICRhdHRycykge1xyXG4gICAgICAgIHZhciBncmlkT3B0aW9ucztcclxuICAgICAgICB2YXIgcXVpY2tGaWx0ZXJPblNjb3BlO1xyXG4gICAgICAgIGlmICgkYXR0cnMpIHtcclxuICAgICAgICAgICAgLy8gbmV3IGRpcmVjdGl2ZSBvZiBhZy1ncmlkXHJcbiAgICAgICAgICAgIHZhciBrZXlPZkdyaWRJblNjb3BlID0gJGF0dHJzLmFnR3JpZDtcclxuICAgICAgICAgICAgdmFyIHF1aWNrRmlsdGVyT25TY29wZSA9IGtleU9mR3JpZEluU2NvcGUgKyAnLnF1aWNrRmlsdGVyVGV4dCc7XHJcbiAgICAgICAgICAgIGdyaWRPcHRpb25zID0gJHNjb3BlLiRldmFsKGtleU9mR3JpZEluU2NvcGUpO1xyXG4gICAgICAgICAgICBpZiAoIWdyaWRPcHRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJXQVJOSU5HIC0gZ3JpZCBvcHRpb25zIGZvciBBbmd1bGFyIEdyaWQgbm90IGZvdW5kLiBQbGVhc2UgZW5zdXJlIHRoZSBhdHRyaWJ1dGUgYWctZ3JpZCBwb2ludHMgdG8gYSB2YWxpZCBvYmplY3Qgb24gdGhlIHNjb3BlXCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gb2xkIGRpcmVjdGl2ZSBvZiBhbmd1bGFyLWdyaWRcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiV0FSTklORyAtIERpcmVjdGl2ZSBhbmd1bGFyLWdyaWQgaXMgZGVwcmVjYXRlZCwgeW91IHNob3VsZCB1c2UgdGhlIGFnLWdyaWQgZGlyZWN0aXZlIGluc3RlYWQuXCIpO1xyXG4gICAgICAgICAgICBncmlkT3B0aW9ucyA9ICRzY29wZS5hbmd1bGFyR3JpZDtcclxuICAgICAgICAgICAgcXVpY2tGaWx0ZXJPblNjb3BlID0gJ2FuZ3VsYXJHcmlkLnF1aWNrRmlsdGVyVGV4dCc7XHJcbiAgICAgICAgICAgIGlmICghZ3JpZE9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIldBUk5JTkcgLSBncmlkIG9wdGlvbnMgZm9yIEFuZ3VsYXIgR3JpZCBub3QgZm91bmQuIFBsZWFzZSBlbnN1cmUgdGhlIGF0dHJpYnV0ZSBhbmd1bGFyLWdyaWQgcG9pbnRzIHRvIGEgdmFsaWQgb2JqZWN0IG9uIHRoZSBzY29wZVwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGVHcmlkRGl2ID0gJGVsZW1lbnRbMF07XHJcbiAgICAgICAgdmFyIGdyaWQgPSBuZXcgR3JpZChlR3JpZERpdiwgZ3JpZE9wdGlvbnMsICRzY29wZSwgJGNvbXBpbGUsIHF1aWNrRmlsdGVyT25TY29wZSk7XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oXCIkZGVzdHJveVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZ3JpZC5zZXRGaW5pc2hlZCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdsb2JhbCBGdW5jdGlvbiAtIHRoaXMgZnVuY3Rpb24gaXMgdXNlZCBmb3IgY3JlYXRpbmcgYSBncmlkLCBvdXRzaWRlIG9mIGFueSBBbmd1bGFySlNcclxuICAgIGZ1bmN0aW9uIGFuZ3VsYXJHcmlkR2xvYmFsRnVuY3Rpb24oZWxlbWVudCwgZ3JpZE9wdGlvbnMpIHtcclxuICAgICAgICAvLyBzZWUgaWYgZWxlbWVudCBpcyBhIHF1ZXJ5IHNlbGVjdG9yLCBvciBhIHJlYWwgZWxlbWVudFxyXG4gICAgICAgIHZhciBlR3JpZERpdjtcclxuICAgICAgICBpZiAodHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGVHcmlkRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbGVtZW50KTtcclxuICAgICAgICAgICAgaWYgKCFlR3JpZERpdikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1dBUk5JTkcgLSB3YXMgbm90IGFibGUgdG8gZmluZCBlbGVtZW50ICcgKyBlbGVtZW50ICsgJyBpbiB0aGUgRE9NLCBBbmd1bGFyIEdyaWQgaW5pdGlhbGlzYXRpb24gYWJvcnRlZC4nKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVHcmlkRGl2ID0gZWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmV3IEdyaWQoZUdyaWREaXYsIGdyaWRPcHRpb25zLCBudWxsLCBudWxsKTtcclxuICAgIH1cclxuXHJcbn0pLmNhbGwod2luZG93KTtcclxuIiwidmFyIFN2Z0ZhY3RvcnkgPSByZXF1aXJlKCcuLi9zdmdGYWN0b3J5Jyk7XHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcbnZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcclxudmFyIHN2Z0ZhY3RvcnkgPSBuZXcgU3ZnRmFjdG9yeSgpO1xyXG5cclxuZnVuY3Rpb24gZ3JvdXBDZWxsUmVuZGVyZXJGYWN0b3J5KGdyaWRPcHRpb25zV3JhcHBlciwgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5KSB7XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGdyb3VwQ2VsbFJlbmRlcmVyKHBhcmFtcykge1xyXG5cclxuICAgICAgICB2YXIgZUdyb3VwQ2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICB2YXIgbm9kZSA9IHBhcmFtcy5ub2RlO1xyXG5cclxuICAgICAgICB2YXIgY2VsbEV4cGFuZGFibGUgPSBub2RlLmdyb3VwICYmICFub2RlLmZvb3RlcjtcclxuICAgICAgICBpZiAoY2VsbEV4cGFuZGFibGUpIHtcclxuICAgICAgICAgICAgYWRkRXhwYW5kQW5kQ29udHJhY3QoZUdyb3VwQ2VsbCwgcGFyYW1zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBjaGVja2JveE5lZWRlZCA9IHBhcmFtcy5jb2xEZWYgJiYgcGFyYW1zLmNvbERlZi5jZWxsUmVuZGVyZXIgJiYgcGFyYW1zLmNvbERlZi5jZWxsUmVuZGVyZXIuY2hlY2tib3ggJiYgIW5vZGUuZm9vdGVyO1xyXG4gICAgICAgIGlmIChjaGVja2JveE5lZWRlZCkge1xyXG4gICAgICAgICAgICB2YXIgZUNoZWNrYm94ID0gc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LmNyZWF0ZVNlbGVjdGlvbkNoZWNrYm94KG5vZGUsIHBhcmFtcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgIGVHcm91cENlbGwuYXBwZW5kQ2hpbGQoZUNoZWNrYm94KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwYXJhbXMuY29sRGVmICYmIHBhcmFtcy5jb2xEZWYuY2VsbFJlbmRlcmVyICYmIHBhcmFtcy5jb2xEZWYuY2VsbFJlbmRlcmVyLmlubmVyUmVuZGVyZXIpIHtcclxuICAgICAgICAgICAgY3JlYXRlRnJvbUlubmVyUmVuZGVyZXIoZUdyb3VwQ2VsbCwgcGFyYW1zLCBwYXJhbXMuY29sRGVmLmNlbGxSZW5kZXJlci5pbm5lclJlbmRlcmVyKTtcclxuICAgICAgICB9IGVsc2UgaWYgKG5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgICAgIGNyZWF0ZUZvb3RlckNlbGwoZUdyb3VwQ2VsbCwgcGFyYW1zKTtcclxuICAgICAgICB9IGVsc2UgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgY3JlYXRlR3JvdXBDZWxsKGVHcm91cENlbGwsIHBhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3JlYXRlTGVhZkNlbGwoZUdyb3VwQ2VsbCwgcGFyYW1zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG9ubHkgZG8gdGhpcyBpZiBhbiBpbmRlbnQgLSBhcyB0aGlzIG92ZXJ3cml0ZXMgdGhlIHBhZGRpbmcgdGhhdFxyXG4gICAgICAgIC8vIHRoZSB0aGVtZSBzZXQsIHdoaWNoIHdpbGwgbWFrZSB0aGluZ3MgbG9vayAnbm90IGFsaWduZWQnIGZvciB0aGVcclxuICAgICAgICAvLyBmaXJzdCBncm91cCBsZXZlbC5cclxuICAgICAgICBpZiAobm9kZS5mb290ZXIgfHwgbm9kZS5sZXZlbCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIHBhZGRpbmdQeCA9IG5vZGUubGV2ZWwgKiAxMDtcclxuICAgICAgICAgICAgaWYgKG5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nUHggKz0gMTA7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIW5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgICAgIHBhZGRpbmdQeCArPSA1O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVHcm91cENlbGwuc3R5bGUucGFkZGluZ0xlZnQgPSBwYWRkaW5nUHggKyAncHgnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGVHcm91cENlbGw7XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGFkZEV4cGFuZEFuZENvbnRyYWN0KGVHcm91cENlbGwsIHBhcmFtcykge1xyXG5cclxuICAgICAgICB2YXIgZUV4cGFuZEljb24gPSBjcmVhdGVHcm91cEV4cGFuZEljb24odHJ1ZSk7XHJcbiAgICAgICAgdmFyIGVDb250cmFjdEljb24gPSBjcmVhdGVHcm91cEV4cGFuZEljb24oZmFsc2UpO1xyXG4gICAgICAgIGVHcm91cENlbGwuYXBwZW5kQ2hpbGQoZUV4cGFuZEljb24pO1xyXG4gICAgICAgIGVHcm91cENlbGwuYXBwZW5kQ2hpbGQoZUNvbnRyYWN0SWNvbik7XHJcblxyXG4gICAgICAgIGVFeHBhbmRJY29uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXhwYW5kT3JDb250cmFjdCk7XHJcbiAgICAgICAgZUNvbnRyYWN0SWNvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV4cGFuZE9yQ29udHJhY3QpO1xyXG4gICAgICAgIGVHcm91cENlbGwuYWRkRXZlbnRMaXN0ZW5lcignZGJsY2xpY2snLCBleHBhbmRPckNvbnRyYWN0KTtcclxuXHJcbiAgICAgICAgc2hvd0FuZEhpZGVFeHBhbmRBbmRDb250cmFjdChlRXhwYW5kSWNvbiwgZUNvbnRyYWN0SWNvbiwgcGFyYW1zLm5vZGUuZXhwYW5kZWQpO1xyXG5cclxuICAgICAgICAvLyBpZiBwYXJlbnQgY2VsbCB3YXMgcGFzc2VkLCB0aGVuIHdlIGNhbiBsaXN0ZW4gZm9yIHdoZW4gZm9jdXMgaXMgb24gdGhlIGNlbGwsXHJcbiAgICAgICAgLy8gYW5kIHRoZW4gZXhwYW5kIC8gY29udHJhY3QgYXMgdGhlIHVzZXIgaGl0cyBlbnRlciBvciBzcGFjZS1iYXJcclxuICAgICAgICBpZiAocGFyYW1zLmVHcmlkQ2VsbCkge1xyXG4gICAgICAgICAgICBwYXJhbXMuZUdyaWRDZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHV0aWxzLmlzS2V5UHJlc3NlZChldmVudCwgY29uc3RhbnRzLktFWV9FTlRFUikpIHtcclxuICAgICAgICAgICAgICAgICAgICBleHBhbmRPckNvbnRyYWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBleHBhbmRPckNvbnRyYWN0KCkge1xyXG4gICAgICAgICAgICBleHBhbmRHcm91cChlRXhwYW5kSWNvbiwgZUNvbnRyYWN0SWNvbiwgcGFyYW1zKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd0FuZEhpZGVFeHBhbmRBbmRDb250cmFjdChlRXhwYW5kSWNvbiwgZUNvbnRyYWN0SWNvbiwgZXhwYW5kZWQpIHtcclxuICAgICAgICB1dGlscy5zZXRWaXNpYmxlKGVFeHBhbmRJY29uLCAhZXhwYW5kZWQpO1xyXG4gICAgICAgIHV0aWxzLnNldFZpc2libGUoZUNvbnRyYWN0SWNvbiwgZXhwYW5kZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUZyb21Jbm5lclJlbmRlcmVyKGVHcm91cENlbGwsIHBhcmFtcywgcmVuZGVyZXIpIHtcclxuICAgICAgICB1dGlscy51c2VSZW5kZXJlcihlR3JvdXBDZWxsLCByZW5kZXJlciwgcGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBleHBhbmRHcm91cChlRXhwYW5kSWNvbiwgZUNvbnRyYWN0SWNvbiwgcGFyYW1zKSB7XHJcbiAgICAgICAgcGFyYW1zLm5vZGUuZXhwYW5kZWQgPSAhcGFyYW1zLm5vZGUuZXhwYW5kZWQ7XHJcbiAgICAgICAgcGFyYW1zLmFwaS5vbkdyb3VwRXhwYW5kZWRPckNvbGxhcHNlZChwYXJhbXMucm93SW5kZXggKyAxKTtcclxuICAgICAgICBzaG93QW5kSGlkZUV4cGFuZEFuZENvbnRyYWN0KGVFeHBhbmRJY29uLCBlQ29udHJhY3RJY29uLCBwYXJhbXMubm9kZS5leHBhbmRlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlR3JvdXBFeHBhbmRJY29uKGV4cGFuZGVkKSB7XHJcbiAgICAgICAgaWYgKGV4cGFuZGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1dGlscy5jcmVhdGVJY29uKCdncm91cENvbnRyYWN0ZWQnLCBncmlkT3B0aW9uc1dyYXBwZXIsIG51bGwsIHN2Z0ZhY3RvcnkuY3JlYXRlQXJyb3dSaWdodFN2Zyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHV0aWxzLmNyZWF0ZUljb24oJ2dyb3VwRXhwYW5kZWQnLCBncmlkT3B0aW9uc1dyYXBwZXIsIG51bGwsIHN2Z0ZhY3RvcnkuY3JlYXRlQXJyb3dEb3duU3ZnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY3JlYXRlcyBjZWxsIHdpdGggJ1RvdGFsIHt7a2V5fX0nIGZvciBhIGdyb3VwXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVGb290ZXJDZWxsKGVHcm91cENlbGwsIHBhcmFtcykge1xyXG4gICAgICAgIHZhciB0ZXh0VG9EaXNwbGF5ID0gXCJUb3RhbCBcIiArIGdldEdyb3VwTmFtZShwYXJhbXMpO1xyXG4gICAgICAgIHZhciBlVGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHRUb0Rpc3BsYXkpO1xyXG4gICAgICAgIGVHcm91cENlbGwuYXBwZW5kQ2hpbGQoZVRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldEdyb3VwTmFtZShwYXJhbXMpIHtcclxuICAgICAgICB2YXIgY2VsbFJlbmRlcmVyID0gcGFyYW1zLmNvbERlZi5jZWxsUmVuZGVyZXI7XHJcbiAgICAgICAgaWYgKGNlbGxSZW5kZXJlciAmJiBjZWxsUmVuZGVyZXIua2V5TWFwXHJcbiAgICAgICAgICAgICYmIHR5cGVvZiBjZWxsUmVuZGVyZXIua2V5TWFwID09PSAnb2JqZWN0JyAmJiBwYXJhbXMuY29sRGVmLmNlbGxSZW5kZXJlciAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB2YXIgdmFsdWVGcm9tTWFwID0gY2VsbFJlbmRlcmVyLmtleU1hcFtwYXJhbXMubm9kZS5rZXldO1xyXG4gICAgICAgICAgICBpZiAodmFsdWVGcm9tTWFwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVGcm9tTWFwO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcmFtcy5ub2RlLmtleTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXJhbXMubm9kZS5rZXk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNyZWF0ZXMgY2VsbCB3aXRoICd7e2tleX19ICh7e2NoaWxkQ291bnR9fSknIGZvciBhIGdyb3VwXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVHcm91cENlbGwoZUdyb3VwQ2VsbCwgcGFyYW1zKSB7XHJcbiAgICAgICAgdmFyIHRleHRUb0Rpc3BsYXkgPSBcIiBcIiArIGdldEdyb3VwTmFtZShwYXJhbXMpO1xyXG4gICAgICAgIC8vIG9ubHkgaW5jbHVkZSB0aGUgY2hpbGQgY291bnQgaWYgaXQncyBpbmNsdWRlZCwgZWcgaWYgdXNlciBkb2luZyBjdXN0b20gYWdncmVnYXRpb24sXHJcbiAgICAgICAgLy8gdGhlbiB0aGlzIGNvdWxkIGJlIGxlZnQgb3V0LCBvciBzZXQgdG8gLTEsIGllIG5vIGNoaWxkIGNvdW50XHJcbiAgICAgICAgdmFyIHN1cHByZXNzQ291bnQgPSBwYXJhbXMuY29sRGVmLmNlbGxSZW5kZXJlciAmJiBwYXJhbXMuY29sRGVmLmNlbGxSZW5kZXJlci5zdXBwcmVzc0NvdW50O1xyXG4gICAgICAgIGlmICghc3VwcHJlc3NDb3VudCAmJiBwYXJhbXMubm9kZS5hbGxDaGlsZHJlbkNvdW50ID49IDApIHtcclxuICAgICAgICAgICAgdGV4dFRvRGlzcGxheSArPSBcIiAoXCIgKyBwYXJhbXMubm9kZS5hbGxDaGlsZHJlbkNvdW50ICsgXCIpXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBlVGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHRUb0Rpc3BsYXkpO1xyXG4gICAgICAgIGVHcm91cENlbGwuYXBwZW5kQ2hpbGQoZVRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNyZWF0ZXMgY2VsbCB3aXRoICd7e2tleX19ICh7e2NoaWxkQ291bnR9fSknIGZvciBhIGdyb3VwXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVMZWFmQ2VsbChlUGFyZW50LCBwYXJhbXMpIHtcclxuICAgICAgICBpZiAocGFyYW1zLnZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhciBlVGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcgJyArIHBhcmFtcy52YWx1ZSk7XHJcbiAgICAgICAgICAgIGVQYXJlbnQuYXBwZW5kQ2hpbGQoZVRleHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBncm91cENlbGxSZW5kZXJlckZhY3Rvcnk7IiwidmFyIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XHJcblxyXG5mdW5jdGlvbiBDb2x1bW5Db250cm9sbGVyKCkge1xyXG4gICAgdGhpcy5jcmVhdGVNb2RlbCgpO1xyXG59XHJcblxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oYW5ndWxhckdyaWQsIHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSwgZ3JpZE9wdGlvbnNXcmFwcGVyKSB7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZDtcclxuICAgIHRoaXMuc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5ID0gc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5O1xyXG59O1xyXG5cclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuY3JlYXRlTW9kZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHRoaXMubW9kZWwgPSB7XHJcbiAgICAgICAgLy8gdXNlZCBieTpcclxuICAgICAgICAvLyArIGluTWVtb3J5Um93Q29udHJvbGxlciAtPiBzb3J0aW5nLCBidWlsZGluZyBxdWljayBmaWx0ZXIgdGV4dFxyXG4gICAgICAgIC8vICsgaGVhZGVyUmVuZGVyZXIgLT4gc29ydGluZyAoY2xlYXJpbmcgaWNvbilcclxuICAgICAgICBnZXRBbGxDb2x1bW5zOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuY29sdW1ucztcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vICsgcm93Q29udHJvbGxlciAtPiB3aGlsZSBpbnNlcnRpbmcgcm93cywgYW5kIHdoZW4gdGFiYmluZyB0aHJvdWdoIGNlbGxzIChuZWVkIHRvIGNoYW5nZSB0aGlzKVxyXG4gICAgICAgIC8vIG5lZWQgYSBuZXdNZXRob2QgLSBnZXQgbmV4dCBjb2wgaW5kZXhcclxuICAgICAgICBnZXRWaXNpYmxlQ29sdW1uczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnZpc2libGVDb2x1bW5zO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gdXNlZCBieTpcclxuICAgICAgICAvLyArIGFuZ3VsYXJHcmlkIC0+IGZvciBzZXR0aW5nIGJvZHkgd2lkdGhcclxuICAgICAgICAvLyArIHJvd0NvbnRyb2xsZXIgLT4gc2V0dGluZyBtYWluIHJvdyB3aWR0aHMgKHdoZW4gaW5zZXJ0aW5nIGFuZCByZXNpemluZylcclxuICAgICAgICBnZXRCb2R5Q29udGFpbmVyV2lkdGg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5nZXRUb3RhbENvbFdpZHRoKGZhbHNlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIHVzZWQgYnk6XHJcbiAgICAgICAgLy8gKyBhbmd1bGFyR3JpZCAtPiBzZXR0aW5nIHBpbm5lZCBib2R5IHdpZHRoXHJcbiAgICAgICAgZ2V0UGlubmVkQ29udGFpbmVyV2lkdGg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5nZXRUb3RhbENvbFdpZHRoKHRydWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gdXNlZCBieTpcclxuICAgICAgICAvLyArIGhlYWRlclJlbmRlcmVyIC0+IHNldHRpbmcgcGlubmVkIGJvZHkgd2lkdGhcclxuICAgICAgICBnZXRDb2x1bW5Hcm91cHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5jb2x1bW5Hcm91cHM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyB1c2VkIGJ5OlxyXG4gICAgICAgIC8vICsgYXBpLmdldEZpbHRlck1vZGVsKCkgLT4gdG8gbWFwIGNvbERlZiB0byBjb2x1bW4sIGtleSBjYW4gYmUgY29sRGVmIG9yIGZpZWxkXHJcbiAgICAgICAgZ2V0Q29sdW1uOiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGk8dGhhdC5jb2x1bW5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29sRGVmTWF0Y2hlcyA9IHRoYXQuY29sdW1uc1tpXS5jb2xEZWYgPT09IGtleTtcclxuICAgICAgICAgICAgICAgIHZhciBmaWVsZE1hdGNoZXMgPSB0aGF0LmNvbHVtbnNbaV0uY29sRGVmLmZpZWxkID09PSBrZXk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29sRGVmTWF0Y2hlcyB8fCBmaWVsZE1hdGNoZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhhdC5jb2x1bW5zW2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyB1c2VkIGJ5OlxyXG4gICAgICAgIC8vICsgcm93UmVuZGVyZXIgLT4gZm9yIG5hdmlnYXRpb25cclxuICAgICAgICBnZXRWaXNpYmxlQ29sQmVmb3JlOiBmdW5jdGlvbihjb2wpIHtcclxuICAgICAgICAgICAgdmFyIG9sZEluZGV4ID0gdGhhdC52aXNpYmxlQ29sdW1ucy5pbmRleE9mKGNvbCk7XHJcbiAgICAgICAgICAgIGlmIChvbGRJbmRleCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGF0LnZpc2libGVDb2x1bW5zW29sZEluZGV4IC0gMV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gdXNlZCBieTpcclxuICAgICAgICAvLyArIHJvd1JlbmRlcmVyIC0+IGZvciBuYXZpZ2F0aW9uXHJcbiAgICAgICAgZ2V0VmlzaWJsZUNvbEFmdGVyOiBmdW5jdGlvbihjb2wpIHtcclxuICAgICAgICAgICAgdmFyIG9sZEluZGV4ID0gdGhhdC52aXNpYmxlQ29sdW1ucy5pbmRleE9mKGNvbCk7XHJcbiAgICAgICAgICAgIGlmIChvbGRJbmRleCA8ICh0aGF0LnZpc2libGVDb2x1bW5zLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhhdC52aXNpYmxlQ29sdW1uc1tvbGRJbmRleCArIDFdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0TW9kZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLm1vZGVsO1xyXG59O1xyXG5cclxuLy8gY2FsbGVkIGJ5IGFuZ3VsYXJHcmlkXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLnNldENvbHVtbnMgPSBmdW5jdGlvbihjb2x1bW5EZWZzKSB7XHJcbiAgICB0aGlzLmJ1aWxkQ29sdW1ucyhjb2x1bW5EZWZzKTtcclxuICAgIHRoaXMuZW5zdXJlRWFjaENvbEhhc1NpemUoKTtcclxuICAgIHRoaXMuYnVpbGRHcm91cHMoKTtcclxuICAgIHRoaXMudXBkYXRlR3JvdXBzKCk7XHJcbiAgICB0aGlzLnVwZGF0ZVZpc2libGVDb2x1bW5zKCk7XHJcbn07XHJcblxyXG4vLyBjYWxsZWQgYnkgaGVhZGVyUmVuZGVyZXIgLSB3aGVuIGEgaGVhZGVyIGlzIG9wZW5lZCBvciBjbG9zZWRcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuY29sdW1uR3JvdXBPcGVuZWQgPSBmdW5jdGlvbihncm91cCkge1xyXG4gICAgZ3JvdXAuZXhwYW5kZWQgPSAhZ3JvdXAuZXhwYW5kZWQ7XHJcbiAgICB0aGlzLnVwZGF0ZUdyb3VwcygpO1xyXG4gICAgdGhpcy51cGRhdGVWaXNpYmxlQ29sdW1ucygpO1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZC5yZWZyZXNoSGVhZGVyQW5kQm9keSgpO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVWaXNpYmxlQ29sdW1ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gaWYgbm90IGdyb3VwaW5nIGJ5IGhlYWRlcnMsIHRoZW4gYWxsIGNvbHVtbnMgYXJlIHZpc2libGVcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEhlYWRlcnMoKSkge1xyXG4gICAgICAgIHRoaXMudmlzaWJsZUNvbHVtbnMgPSB0aGlzLmNvbHVtbnM7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGdyb3VwaW5nLCB0aGVuIG9ubHkgc2hvdyBjb2wgYXMgcGVyIGdyb3VwIHJ1bGVzXHJcbiAgICB0aGlzLnZpc2libGVDb2x1bW5zID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29sdW1uR3JvdXBzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gdGhpcy5jb2x1bW5Hcm91cHNbaV07XHJcbiAgICAgICAgZ3JvdXAuYWRkVG9WaXNpYmxlQ29sdW1ucyh0aGlzLnZpc2libGVDb2x1bW5zKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8vIHB1YmxpYyAtIGNhbGxlZCBmcm9tIGFwaVxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5zaXplQ29sdW1uc1RvRml0ID0gZnVuY3Rpb24oZ3JpZFdpZHRoKSB7XHJcbiAgICAvLyBhdm9pZCBkaXZpZGUgYnkgemVyb1xyXG4gICAgaWYgKGdyaWRXaWR0aCA8PSAwIHx8IHRoaXMudmlzaWJsZUNvbHVtbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjb2x1bW5TdGFydFdpZHRoID0gMDsgLy8gd2lsbCBjb250YWluIHRoZSBzdGFydGluZyB0b3RhbCB3aWR0aCBvZiB0aGUgY29scyBiZWVuIHNwcmVhZFxyXG4gICAgdmFyIGNvbHNUb1NwcmVhZCA9IFtdOyAvLyBhbGwgdmlzaWJsZSBjb2xzLCBleGNlcHQgdGhvc2Ugd2l0aCBhdm9pZFNpemVUb0ZpdFxyXG4gICAgdmFyIHdpZHRoRm9yU3ByZWFkaW5nID0gZ3JpZFdpZHRoOyAvLyBncmlkIHdpZHRoIG1pbnVzIHRoZSBjb2x1bW5zIHdlIGFyZSBub3QgcmVzaXppbmdcclxuXHJcbiAgICAvLyBnZXQgdGhlIGxpc3Qgb2YgY29scyB0byB3b3JrIHdpdGhcclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy52aXNpYmxlQ29sdW1ucy5sZW5ndGggOyBqKyspIHtcclxuICAgICAgICBpZiAodGhpcy52aXNpYmxlQ29sdW1uc1tqXS5jb2xEZWYuc3VwcHJlc3NTaXplVG9GaXQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgLy8gZG9uJ3QgaW5jbHVkZSBjb2wsIGFuZCByZW1vdmUgdGhlIHdpZHRoIGZyb20gdGVoIGF2YWlsYWJsZSB3aWR0aFxyXG4gICAgICAgICAgICB3aWR0aEZvclNwcmVhZGluZyAtPSB0aGlzLnZpc2libGVDb2x1bW5zW2pdLmFjdHVhbFdpZHRoO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGluY2x1ZGUgdGhlIGNvbFxyXG4gICAgICAgICAgICBjb2xzVG9TcHJlYWQucHVzaCh0aGlzLnZpc2libGVDb2x1bW5zW2pdKTtcclxuICAgICAgICAgICAgY29sdW1uU3RhcnRXaWR0aCArPSB0aGlzLnZpc2libGVDb2x1bW5zW2pdLmFjdHVhbFdpZHRoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBubyB3aWR0aCBsZWZ0IG92ZXIgdG8gc3ByZWFkIHdpdGgsIGRvIG5vdGhpbmdcclxuICAgIGlmICh3aWR0aEZvclNwcmVhZGluZyA8PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzY2FsZSA9IHdpZHRoRm9yU3ByZWFkaW5nIC8gY29sdW1uU3RhcnRXaWR0aDtcclxuICAgIHZhciBwaXhlbHNGb3JMYXN0Q29sID0gd2lkdGhGb3JTcHJlYWRpbmc7XHJcblxyXG4gICAgLy8gc2l6ZSBhbGwgY29scyBleGNlcHQgdGhlIGxhc3QgYnkgdGhlIHNjYWxlXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IChjb2xzVG9TcHJlYWQubGVuZ3RoIC0gMSk7IGkrKykge1xyXG4gICAgICAgIHZhciBjb2x1bW4gPSBjb2xzVG9TcHJlYWRbaV07XHJcbiAgICAgICAgdmFyIG5ld1dpZHRoID0gcGFyc2VJbnQoY29sdW1uLmFjdHVhbFdpZHRoICogc2NhbGUpO1xyXG4gICAgICAgIGNvbHVtbi5hY3R1YWxXaWR0aCA9IG5ld1dpZHRoO1xyXG4gICAgICAgIHBpeGVsc0Zvckxhc3RDb2wgLT0gbmV3V2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2l6ZSB0aGUgbGFzdCBieSB3aGF0cyByZW1haW5pbmcgKHRoaXMgYXZvaWRzIHJvdW5kaW5nIGVycm9ycyB0aGF0IGNvdWxkXHJcbiAgICAvLyBvY2N1ciB3aXRoIHNjYWxpbmcgZXZlcnl0aGluZywgd2hlcmUgaXQgcmVzdWx0IGluIHNvbWUgcGl4ZWxzIG9mZilcclxuICAgIHZhciBsYXN0Q29sdW1uID0gY29sc1RvU3ByZWFkW2NvbHNUb1NwcmVhZC5sZW5ndGggLSAxXTtcclxuICAgIGxhc3RDb2x1bW4uYWN0dWFsV2lkdGggPSBwaXhlbHNGb3JMYXN0Q29sO1xyXG5cclxuICAgIC8vIHdpZHRocyBzZXQsIHJlZnJlc2ggdGhlIGd1aVxyXG4gICAgdGhpcy5hbmd1bGFyR3JpZC5yZWZyZXNoSGVhZGVyQW5kQm9keSgpO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5idWlsZEdyb3VwcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gaWYgbm90IGdyb3VwaW5nIGJ5IGhlYWRlcnMsIGRvIG5vdGhpbmdcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEhlYWRlcnMoKSkge1xyXG4gICAgICAgIHRoaXMuY29sdW1uR3JvdXBzID0gbnVsbDtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc3BsaXQgdGhlIGNvbHVtbnMgaW50byBncm91cHNcclxuICAgIHZhciBjdXJyZW50R3JvdXAgPSBudWxsO1xyXG4gICAgdGhpcy5jb2x1bW5Hcm91cHMgPSBbXTtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICB2YXIgbGFzdENvbFdhc1Bpbm5lZCA9IHRydWU7XHJcblxyXG4gICAgdGhpcy5jb2x1bW5zLmZvckVhY2goZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICAgICAgLy8gZG8gd2UgbmVlZCBhIG5ldyBncm91cCwgYmVjYXVzZSB3ZSBtb3ZlIGZyb20gcGlubmVkIHRvIG5vbi1waW5uZWQgY29sdW1ucz9cclxuICAgICAgICB2YXIgZW5kT2ZQaW5uZWRIZWFkZXIgPSBsYXN0Q29sV2FzUGlubmVkICYmICFjb2x1bW4ucGlubmVkO1xyXG4gICAgICAgIGlmICghY29sdW1uLnBpbm5lZCkge1xyXG4gICAgICAgICAgICBsYXN0Q29sV2FzUGlubmVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGRvIHdlIG5lZWQgYSBuZXcgZ3JvdXAsIGJlY2F1c2UgdGhlIGdyb3VwIG5hbWVzIGRvZXNuJ3QgbWF0Y2ggZnJvbSBwcmV2aW91cyBjb2w/XHJcbiAgICAgICAgdmFyIGdyb3VwS2V5TWlzbWF0Y2ggPSBjdXJyZW50R3JvdXAgJiYgY29sdW1uLmNvbERlZi5ncm91cCAhPT0gY3VycmVudEdyb3VwLm5hbWU7XHJcbiAgICAgICAgLy8gd2UgZG9uJ3QgZ3JvdXAgY29sdW1ucyB3aGVyZSBubyBncm91cCBpcyBzcGVjaWZpZWRcclxuICAgICAgICB2YXIgY29sTm90SW5Hcm91cCA9IGN1cnJlbnRHcm91cCAmJiAhY3VycmVudEdyb3VwLm5hbWU7XHJcbiAgICAgICAgLy8gZG8gd2UgbmVlZCBhIG5ldyBncm91cCwgYmVjYXVzZSB3ZSBhcmUganVzdCBzdGFydGluZ1xyXG4gICAgICAgIHZhciBwcm9jZXNzaW5nRmlyc3RDb2wgPSBjb2x1bW4uaW5kZXggPT09IDA7XHJcbiAgICAgICAgdmFyIG5ld0dyb3VwTmVlZGVkID0gcHJvY2Vzc2luZ0ZpcnN0Q29sIHx8IGVuZE9mUGlubmVkSGVhZGVyIHx8IGdyb3VwS2V5TWlzbWF0Y2ggfHwgY29sTm90SW5Hcm91cDtcclxuICAgICAgICAvLyBjcmVhdGUgbmV3IGdyb3VwLCBpZiBpdCdzIG5lZWRlZFxyXG4gICAgICAgIGlmIChuZXdHcm91cE5lZWRlZCkge1xyXG4gICAgICAgICAgICB2YXIgcGlubmVkID0gY29sdW1uLnBpbm5lZDtcclxuICAgICAgICAgICAgY3VycmVudEdyb3VwID0gbmV3IENvbHVtbkdyb3VwKHBpbm5lZCwgY29sdW1uLmNvbERlZi5ncm91cCk7XHJcbiAgICAgICAgICAgIHRoYXQuY29sdW1uR3JvdXBzLnB1c2goY3VycmVudEdyb3VwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY3VycmVudEdyb3VwLmFkZENvbHVtbihjb2x1bW4pO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZUdyb3VwcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gaWYgbm90IGdyb3VwaW5nIGJ5IGhlYWRlcnMsIGRvIG5vdGhpbmdcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEhlYWRlcnMoKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29sdW1uR3JvdXBzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGdyb3VwID0gdGhpcy5jb2x1bW5Hcm91cHNbaV07XHJcbiAgICAgICAgZ3JvdXAuY2FsY3VsYXRlRXhwYW5kYWJsZSgpO1xyXG4gICAgICAgIGdyb3VwLmNhbGN1bGF0ZVZpc2libGVDb2x1bW5zKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmJ1aWxkQ29sdW1ucyA9IGZ1bmN0aW9uKGNvbHVtbkRlZnMpIHtcclxuICAgIHRoaXMuY29sdW1ucyA9IFtdO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIHBpbm5lZENvbHVtbkNvdW50ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0UGlubmVkQ29sQ291bnQoKTtcclxuICAgIGlmIChjb2x1bW5EZWZzKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2x1bW5EZWZzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBjb2xEZWYgPSBjb2x1bW5EZWZzW2ldO1xyXG4gICAgICAgICAgICAvLyB0aGlzIGlzIG1lc3N5IC0gd2Ugc3dhcCBpbiBhbm90aGVyIGNvbCBkZWYgaWYgaXQncyBjaGVja2JveCBzZWxlY3Rpb24gLSBub3QgaGFwcHkgOihcclxuICAgICAgICAgICAgaWYgKGNvbERlZiA9PT0gJ2NoZWNrYm94U2VsZWN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgY29sRGVmID0gdGhhdC5zZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkuY3JlYXRlQ2hlY2tib3hDb2xEZWYoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgcGlubmVkID0gcGlubmVkQ29sdW1uQ291bnQgPiBpO1xyXG4gICAgICAgICAgICB2YXIgY29sdW1uID0gbmV3IENvbHVtbihjb2xEZWYsIGksIHBpbm5lZCk7XHJcbiAgICAgICAgICAgIHRoYXQuY29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyBzZXQgdGhlIGFjdHVhbCB3aWR0aHMgZm9yIGVhY2ggY29sXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmVuc3VyZUVhY2hDb2xIYXNTaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZGVmYXVsdFdpZHRoID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29sV2lkdGgoKTtcclxuICAgIGlmICh0eXBlb2YgZGVmYXVsdFdpZHRoICE9PSAnbnVtYmVyJyB8fCBkZWZhdWx0V2lkdGggPCBjb25zdGFudHMuTUlOX0NPTF9XSURUSCkge1xyXG4gICAgICAgIGRlZmF1bHRXaWR0aCA9IDIwMDtcclxuICAgIH1cclxuICAgIHRoaXMuY29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbERlZldyYXBwZXIpIHtcclxuICAgICAgICB2YXIgY29sRGVmID0gY29sRGVmV3JhcHBlci5jb2xEZWY7XHJcbiAgICAgICAgaWYgKGNvbERlZldyYXBwZXIuYWN0dWFsV2lkdGgpIHtcclxuICAgICAgICAgICAgLy8gaWYgYWN0dWFsIHdpZHRoIGFscmVhZHkgc2V0LCBkbyBub3RoaW5nXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9IGVsc2UgaWYgKCFjb2xEZWYud2lkdGgpIHtcclxuICAgICAgICAgICAgLy8gaWYgbm8gd2lkdGggZGVmaW5lZCBpbiBjb2xEZWYsIGRlZmF1bHQgdG8gMjAwXHJcbiAgICAgICAgICAgIGNvbERlZldyYXBwZXIuYWN0dWFsV2lkdGggPSBkZWZhdWx0V2lkdGg7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2xEZWYud2lkdGggPCBjb25zdGFudHMuTUlOX0NPTF9XSURUSCkge1xyXG4gICAgICAgICAgICAvLyBpZiB3aWR0aCBpbiBjb2wgZGVmIHRvIHNtYWxsLCBzZXQgdG8gbWluIHdpZHRoXHJcbiAgICAgICAgICAgIGNvbERlZldyYXBwZXIuYWN0dWFsV2lkdGggPSBjb25zdGFudHMuTUlOX0NPTF9XSURUSDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UgdXNlIHRoZSBwcm92aWRlZCB3aWR0aFxyXG4gICAgICAgICAgICBjb2xEZWZXcmFwcGVyLmFjdHVhbFdpZHRoID0gY29sRGVmLndpZHRoO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyBjYWxsIHdpdGggdHJ1ZSAocGlubmVkKSwgZmFsc2UgKG5vdC1waW5uZWQpIG9yIHVuZGVmaW5lZCAoYWxsIGNvbHVtbnMpXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmdldFRvdGFsQ29sV2lkdGggPSBmdW5jdGlvbihpbmNsdWRlUGlubmVkKSB7XHJcbiAgICB2YXIgd2lkdGhTb0ZhciA9IDA7XHJcbiAgICB2YXIgcGluZWROb3RJbXBvcnRhbnQgPSB0eXBlb2YgaW5jbHVkZVBpbm5lZCAhPT0gJ2Jvb2xlYW4nO1xyXG5cclxuICAgIHRoaXMudmlzaWJsZUNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgICAgICB2YXIgaW5jbHVkZVRoaXNDb2wgPSBwaW5lZE5vdEltcG9ydGFudCB8fCBjb2x1bW4ucGlubmVkID09PSBpbmNsdWRlUGlubmVkO1xyXG4gICAgICAgIGlmIChpbmNsdWRlVGhpc0NvbCkge1xyXG4gICAgICAgICAgICB3aWR0aFNvRmFyICs9IGNvbHVtbi5hY3R1YWxXaWR0aDtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gd2lkdGhTb0ZhcjtcclxufTtcclxuXHJcbmZ1bmN0aW9uIENvbHVtbkdyb3VwKHBpbm5lZCwgbmFtZSkge1xyXG4gICAgdGhpcy5waW5uZWQgPSBwaW5uZWQ7XHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgdGhpcy5hbGxDb2x1bW5zID0gW107XHJcbiAgICB0aGlzLnZpc2libGVDb2x1bW5zID0gW107XHJcbiAgICB0aGlzLmV4cGFuZGFibGUgPSBmYWxzZTsgLy8gd2hldGhlciB0aGlzIGdyb3VwIGNhbiBiZSBleHBhbmRlZCBvciBub3RcclxuICAgIHRoaXMuZXhwYW5kZWQgPSBmYWxzZTtcclxufVxyXG5cclxuQ29sdW1uR3JvdXAucHJvdG90eXBlLmFkZENvbHVtbiA9IGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgdGhpcy5hbGxDb2x1bW5zLnB1c2goY29sdW1uKTtcclxufTtcclxuXHJcbi8vIG5lZWQgdG8gY2hlY2sgdGhhdCB0aGlzIGdyb3VwIGhhcyBhdCBsZWFzdCBvbmUgY29sIHNob3dpbmcgd2hlbiBib3RoIGV4cGFuZGVkIGFuZCBjb250cmFjdGVkLlxyXG4vLyBpZiBub3QsIHRoZW4gd2UgZG9uJ3QgYWxsb3cgZXhwYW5kaW5nIGFuZCBjb250cmFjdGluZyBvbiB0aGlzIGdyb3VwXHJcbkNvbHVtbkdyb3VwLnByb3RvdHlwZS5jYWxjdWxhdGVFeHBhbmRhYmxlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyB3YW50IHRvIG1ha2Ugc3VyZSB0aGUgZ3JvdXAgZG9lc24ndCBkaXNhcHBlYXIgd2hlbiBpdCdzIG9wZW5cclxuICAgIHZhciBhdExlYXN0T25lU2hvd2luZ1doZW5PcGVuID0gZmFsc2U7XHJcbiAgICAvLyB3YW50IHRvIG1ha2Ugc3VyZSB0aGUgZ3JvdXAgZG9lc24ndCBkaXNhcHBlYXIgd2hlbiBpdCdzIGNsb3NlZFxyXG4gICAgdmFyIGF0TGVhc3RPbmVTaG93aW5nV2hlbkNsb3NlZCA9IGZhbHNlO1xyXG4gICAgLy8gd2FudCB0byBtYWtlIHN1cmUgdGhlIGdyb3VwIGhhcyBzb21ldGhpbmcgdG8gc2hvdyAvIGhpZGVcclxuICAgIHZhciBhdExlYXN0T25lQ2hhbmdlYWJsZSA9IGZhbHNlO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGogPSB0aGlzLmFsbENvbHVtbnMubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNvbHVtbiA9IHRoaXMuYWxsQ29sdW1uc1tpXTtcclxuICAgICAgICBpZiAoY29sdW1uLmNvbERlZi5ncm91cFNob3cgPT09ICdvcGVuJykge1xyXG4gICAgICAgICAgICBhdExlYXN0T25lU2hvd2luZ1doZW5PcGVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgYXRMZWFzdE9uZUNoYW5nZWFibGUgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29sdW1uLmNvbERlZi5ncm91cFNob3cgPT09ICdjbG9zZWQnKSB7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVTaG93aW5nV2hlbkNsb3NlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVDaGFuZ2VhYmxlID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhdExlYXN0T25lU2hvd2luZ1doZW5PcGVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgYXRMZWFzdE9uZVNob3dpbmdXaGVuQ2xvc2VkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5leHBhbmRhYmxlID0gYXRMZWFzdE9uZVNob3dpbmdXaGVuT3BlbiAmJiBhdExlYXN0T25lU2hvd2luZ1doZW5DbG9zZWQgJiYgYXRMZWFzdE9uZUNoYW5nZWFibGU7XHJcbn07XHJcblxyXG5Db2x1bW5Hcm91cC5wcm90b3R5cGUuY2FsY3VsYXRlVmlzaWJsZUNvbHVtbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGNsZWFyIG91dCBsYXN0IHRpbWUgd2UgY2FsY3VsYXRlZFxyXG4gICAgdGhpcy52aXNpYmxlQ29sdW1ucyA9IFtdO1xyXG4gICAgLy8gaXQgbm90IGV4cGFuZGFibGUsIGV2ZXJ5dGhpbmcgaXMgdmlzaWJsZVxyXG4gICAgaWYgKCF0aGlzLmV4cGFuZGFibGUpIHtcclxuICAgICAgICB0aGlzLnZpc2libGVDb2x1bW5zID0gdGhpcy5hbGxDb2x1bW5zO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIC8vIGFuZCBjYWxjdWxhdGUgYWdhaW5cclxuICAgIGZvciAodmFyIGkgPSAwLCBqID0gdGhpcy5hbGxDb2x1bW5zLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICAgIHZhciBjb2x1bW4gPSB0aGlzLmFsbENvbHVtbnNbaV07XHJcbiAgICAgICAgc3dpdGNoIChjb2x1bW4uY29sRGVmLmdyb3VwU2hvdykge1xyXG4gICAgICAgICAgICBjYXNlICdvcGVuJzpcclxuICAgICAgICAgICAgICAgIC8vIHdoZW4gc2V0IHRvIG9wZW4sIG9ubHkgc2hvdyBjb2wgaWYgZ3JvdXAgaXMgb3BlblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZXhwYW5kZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpc2libGVDb2x1bW5zLnB1c2goY29sdW1uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdjbG9zZWQnOlxyXG4gICAgICAgICAgICAgICAgLy8gd2hlbiBzZXQgdG8gb3Blbiwgb25seSBzaG93IGNvbCBpZiBncm91cCBpcyBvcGVuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZXhwYW5kZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpc2libGVDb2x1bW5zLnB1c2goY29sdW1uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLy8gZGVmYXVsdCBpcyBhbHdheXMgc2hvdyB0aGUgY29sdW1uXHJcbiAgICAgICAgICAgICAgICB0aGlzLnZpc2libGVDb2x1bW5zLnB1c2goY29sdW1uKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkNvbHVtbkdyb3VwLnByb3RvdHlwZS5hZGRUb1Zpc2libGVDb2x1bW5zID0gZnVuY3Rpb24oYWxsVmlzaWJsZUNvbHVtbnMpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy52aXNpYmxlQ29sdW1ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBjb2x1bW4gPSB0aGlzLnZpc2libGVDb2x1bW5zW2ldO1xyXG4gICAgICAgIGFsbFZpc2libGVDb2x1bW5zLnB1c2goY29sdW1uKTtcclxuICAgIH1cclxufTtcclxuXHJcbmZ1bmN0aW9uIENvbHVtbihjb2xEZWYsIGluZGV4LCBwaW5uZWQpIHtcclxuICAgIHRoaXMuY29sRGVmID0gY29sRGVmO1xyXG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xyXG4gICAgdGhpcy5waW5uZWQgPSBwaW5uZWQ7XHJcbiAgICAvLyBpbiB0aGUgZnV0dXJlLCB0aGUgY29sS2V5IG1pZ2h0IGJlIHNvbWV0aGluZyBvdGhlciB0aGFuIHRoZSBpbmRleFxyXG4gICAgdGhpcy5jb2xLZXkgPSBpbmRleDtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb2x1bW5Db250cm9sbGVyO1xyXG4iLCJ2YXIgY29uc3RhbnRzID0ge1xyXG4gICAgU1RFUF9FVkVSWVRISU5HOiAwLFxyXG4gICAgU1RFUF9GSUxURVI6IDEsXHJcbiAgICBTVEVQX1NPUlQ6IDIsXHJcbiAgICBTVEVQX01BUDogMyxcclxuICAgIEFTQzogXCJhc2NcIixcclxuICAgIERFU0M6IFwiZGVzY1wiLFxyXG4gICAgUk9XX0JVRkZFUl9TSVpFOiAyMCxcclxuICAgIFNPUlRfU1RZTEVfU0hPVzogXCJkaXNwbGF5OmlubGluZTtcIixcclxuICAgIFNPUlRfU1RZTEVfSElERTogXCJkaXNwbGF5Om5vbmU7XCIsXHJcbiAgICBNSU5fQ09MX1dJRFRIOiAxMCxcclxuXHJcbiAgICBLRVlfVEFCOiA5LFxyXG4gICAgS0VZX0VOVEVSOiAxMyxcclxuICAgIEtFWV9TUEFDRTogMzIsXHJcbiAgICBLRVlfRE9XTjogNDAsXHJcbiAgICBLRVlfVVA6IDM4LFxyXG4gICAgS0VZX0xFRlQ6IDM3LFxyXG4gICAgS0VZX1JJR0hUOiAzOVxyXG59O1xyXG5cclxuLy8gdGFrZW4gZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzk4NDc1ODAvaG93LXRvLWRldGVjdC1zYWZhcmktY2hyb21lLWllLWZpcmVmb3gtYW5kLW9wZXJhLWJyb3dzZXJcclxudmFyIGlzT3BlcmEgPSAhIXdpbmRvdy5vcGVyYSB8fCBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJyBPUFIvJykgPj0gMDtcclxuLy8gT3BlcmEgOC4wKyAoVUEgZGV0ZWN0aW9uIHRvIGRldGVjdCBCbGluay92OC1wb3dlcmVkIE9wZXJhKVxyXG52YXIgaXNGaXJlZm94ID0gdHlwZW9mIEluc3RhbGxUcmlnZ2VyICE9PSAndW5kZWZpbmVkJzsgICAvLyBGaXJlZm94IDEuMCtcclxudmFyIGlzU2FmYXJpID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHdpbmRvdy5IVE1MRWxlbWVudCkuaW5kZXhPZignQ29uc3RydWN0b3InKSA+IDA7XHJcbi8vIEF0IGxlYXN0IFNhZmFyaSAzKzogXCJbb2JqZWN0IEhUTUxFbGVtZW50Q29uc3RydWN0b3JdXCJcclxudmFyIGlzQ2hyb21lID0gISF3aW5kb3cuY2hyb21lICYmICF0aGlzLmlzT3BlcmE7IC8vIENocm9tZSAxK1xyXG52YXIgaXNJRSA9IC8qQGNjX29uIUAqL2ZhbHNlIHx8ICEhZG9jdW1lbnQuZG9jdW1lbnRNb2RlOyAvLyBBdCBsZWFzdCBJRTZcclxuXHJcbmlmIChpc09wZXJhKSB7XHJcbiAgICBjb25zdGFudHMuQlJPV1NFUiA9ICdvcGVyYSc7XHJcbn0gZWxzZSBpZiAoaXNGaXJlZm94KSB7XHJcbiAgICBjb25zdGFudHMuQlJPV1NFUiA9ICdmaXJlZm94JztcclxufSBlbHNlIGlmIChpc1NhZmFyaSkge1xyXG4gICAgY29uc3RhbnRzLkJST1dTRVIgPSAnc2FmYXJpJztcclxufSBlbHNlIGlmIChpc0Nocm9tZSkge1xyXG4gICAgY29uc3RhbnRzLkJST1dTRVIgPSAnY2hyb21lJztcclxufSBlbHNlIGlmIChpc0lFKSB7XHJcbiAgICBjb25zdGFudHMuQlJPV1NFUiA9ICdpZSc7XHJcbn1cclxuXHJcbnZhciBpc01hYyA9IG5hdmlnYXRvci5wbGF0Zm9ybS50b1VwcGVyQ2FzZSgpLmluZGV4T2YoJ01BQycpPj0wO1xyXG52YXIgaXNXaW5kb3dzID0gbmF2aWdhdG9yLnBsYXRmb3JtLnRvVXBwZXJDYXNlKCkuaW5kZXhPZignV0lOJyk+PTA7XHJcbmlmIChpc01hYykge1xyXG4gICAgY29uc3RhbnRzLlBMQVRGT1JNID0gJ21hYyc7XHJcbn0gZWxzZSBpZiAoaXNXaW5kb3dzKSB7XHJcbiAgICBjb25zdGFudHMuUExBVEZPUk0gPSAnd2luJztcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjb25zdGFudHM7XHJcbiIsImZ1bmN0aW9uIEV4cHJlc3Npb25TZXJ2aWNlKCkge31cclxuXHJcbkV4cHJlc3Npb25TZXJ2aWNlLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uKHJ1bGUsIHBhcmFtcykge1xyXG59O1xyXG5cclxuZnVuY3Rpb24gRXhwcmVzc2lvblNlcnZpY2UoKSB7XHJcbiAgICB0aGlzLmV4cHJlc3Npb25Ub0Z1bmN0aW9uQ2FjaGUgPSB7fTtcclxufVxyXG5cclxuRXhwcmVzc2lvblNlcnZpY2UucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKGV4cHJlc3Npb24sIHBhcmFtcykge1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgdmFyIGphdmFTY3JpcHRGdW5jdGlvbiA9IHRoaXMuY3JlYXRlRXhwcmVzc2lvbkZ1bmN0aW9uKGV4cHJlc3Npb24pO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBqYXZhU2NyaXB0RnVuY3Rpb24ocGFyYW1zLnZhbHVlLCBwYXJhbXMuY29udGV4dCwgcGFyYW1zLm5vZGUsXHJcbiAgICAgICAgICAgIHBhcmFtcy5kYXRhLCBwYXJhbXMuY29sRGVmLCBwYXJhbXMucm93SW5kZXgsIHBhcmFtcy5hcGkpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgLy8gdGhlIGV4cHJlc3Npb24gZmFpbGVkLCB3aGljaCBjYW4gaGFwcGVuLCBhcyBpdCdzIHRoZSBjbGllbnQgdGhhdFxyXG4gICAgICAgIC8vIHByb3ZpZGVzIHRoZSBleHByZXNzaW9uLiBzbyBwcmludCBhIG5pY2UgbWVzc2FnZVxyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Byb2Nlc3Npbmcgb2YgdGhlIGV4cHJlc3Npb24gZmFpbGVkJyk7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRXhwcmVzc2lvbiA9ICcgKyBleHByZXNzaW9uKTtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdFeGNlcHRpb24gPSAnICsgZSk7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn07XHJcblxyXG5FeHByZXNzaW9uU2VydmljZS5wcm90b3R5cGUuY3JlYXRlRXhwcmVzc2lvbkZ1bmN0aW9uID0gZnVuY3Rpb24gKGV4cHJlc3Npb24pIHtcclxuICAgIC8vIGNoZWNrIGNhY2hlIGZpcnN0XHJcbiAgICBpZiAodGhpcy5leHByZXNzaW9uVG9GdW5jdGlvbkNhY2hlW2V4cHJlc3Npb25dKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXhwcmVzc2lvblRvRnVuY3Rpb25DYWNoZVtleHByZXNzaW9uXTtcclxuICAgIH1cclxuICAgIC8vIGlmIG5vdCBmb3VuZCBpbiBjYWNoZSwgcmV0dXJuIHRoZSBmdW5jdGlvblxyXG4gICAgdmFyIGZ1bmN0aW9uQm9keSA9IHRoaXMuY3JlYXRlRnVuY3Rpb25Cb2R5KGV4cHJlc3Npb24pO1xyXG4gICAgdmFyIHRoZUZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKCd4LCBjdHgsIG5vZGUsIGRhdGEsIGNvbERlZiwgcm93SW5kZXgsIGFwaScsIGZ1bmN0aW9uQm9keSk7XHJcblxyXG4gICAgLy8gc3RvcmUgaW4gY2FjaGVcclxuICAgIHRoaXMuZXhwcmVzc2lvblRvRnVuY3Rpb25DYWNoZVtleHByZXNzaW9uXSA9IHRoZUZ1bmN0aW9uO1xyXG5cclxuICAgIHJldHVybiB0aGVGdW5jdGlvbjtcclxufTtcclxuXHJcbkV4cHJlc3Npb25TZXJ2aWNlLnByb3RvdHlwZS5jcmVhdGVGdW5jdGlvbkJvZHkgPSBmdW5jdGlvbiAoZXhwcmVzc2lvbikge1xyXG4gICAgLy8gaWYgdGhlIGV4cHJlc3Npb24gaGFzIHRoZSAncmV0dXJuJyB3b3JkIGluIGl0LCB0aGVuIHVzZSBhcyBpcyxcclxuICAgIC8vIGlmIG5vdCwgdGhlbiB3cmFwIGl0IHdpdGggcmV0dXJuIGFuZCAnOycgdG8gbWFrZSBhIGZ1bmN0aW9uXHJcbiAgICBpZiAoZXhwcmVzc2lvbi5pbmRleE9mKCdyZXR1cm4nKSA+PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGV4cHJlc3Npb247XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAncmV0dXJuICcgKyBleHByZXNzaW9uICsgJzsnO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFeHByZXNzaW9uU2VydmljZTtcclxuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xyXG52YXIgU2V0RmlsdGVyID0gcmVxdWlyZSgnLi9zZXRGaWx0ZXInKTtcclxudmFyIE51bWJlckZpbHRlciA9IHJlcXVpcmUoJy4vbnVtYmVyRmlsdGVyJyk7XHJcbnZhciBTdHJpbmdGaWx0ZXIgPSByZXF1aXJlKCcuL3RleHRGaWx0ZXInKTtcclxuXHJcbmZ1bmN0aW9uIEZpbHRlck1hbmFnZXIoKSB7fVxyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGdyaWQsIGdyaWRPcHRpb25zV3JhcHBlciwgJGNvbXBpbGUsICRzY29wZSwgZXhwcmVzc2lvblNlcnZpY2UsIGNvbHVtbk1vZGVsKSB7XHJcbiAgICB0aGlzLiRjb21waWxlID0gJGNvbXBpbGU7XHJcbiAgICB0aGlzLiRzY29wZSA9ICRzY29wZTtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyID0gZ3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4gICAgdGhpcy5ncmlkID0gZ3JpZDtcclxuICAgIHRoaXMuYWxsRmlsdGVycyA9IHt9O1xyXG4gICAgdGhpcy5leHByZXNzaW9uU2VydmljZSA9IGV4cHJlc3Npb25TZXJ2aWNlO1xyXG4gICAgdGhpcy5jb2x1bW5Nb2RlbCA9IGNvbHVtbk1vZGVsO1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuc2V0RmlsdGVyTW9kZWwgPSBmdW5jdGlvbihtb2RlbCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgaWYgKG1vZGVsKSB7XHJcbiAgICAgICAgLy8gbWFyayB0aGUgZmlsdGVycyBhcyB3ZSBzZXQgdGhlbSwgc28gYW55IGFjdGl2ZSBmaWx0ZXJzIGxlZnQgb3ZlciB3ZSBzdG9wXHJcbiAgICAgICAgdmFyIHByb2Nlc3NlZEZpZWxkcyA9IE9iamVjdC5rZXlzKG1vZGVsKTtcclxuICAgICAgICB1dGlscy5pdGVyYXRlT2JqZWN0KHRoaXMuYWxsRmlsdGVycywgZnVuY3Rpb24oa2V5LCBmaWx0ZXJXcmFwcGVyKSB7XHJcbiAgICAgICAgICAgIHZhciBmaWVsZCA9IGZpbHRlcldyYXBwZXIuY29sdW1uLmNvbERlZi5maWVsZDtcclxuICAgICAgICAgICAgdXRpbHMucmVtb3ZlRnJvbUFycmF5KHByb2Nlc3NlZEZpZWxkcywgZmllbGQpO1xyXG4gICAgICAgICAgICBpZiAoZmllbGQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdNb2RlbCA9IG1vZGVsW2ZpZWxkXTtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2V0TW9kZWxPbkZpbHRlcldyYXBwZXIoZmlsdGVyV3JhcHBlci5maWx0ZXIsIG5ld01vZGVsKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignV2FybmluZyBhZy1ncmlkIC0gbm8gZmllbGQgZm91bmQgZm9yIGNvbHVtbiB3aGlsZSBkb2luZyBzZXRGaWx0ZXJNb2RlbCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gYXQgdGhpcyBwb2ludCwgcHJvY2Vzc2VkRmllbGRzIGNvbnRhaW5zIGRhdGEgZm9yIHdoaWNoIHdlIGRvbid0IGhhdmUgYSBmaWx0ZXIgd29ya2luZyB5ZXRcclxuICAgICAgICB1dGlscy5pdGVyYXRlQXJyYXkocHJvY2Vzc2VkRmllbGRzLCBmdW5jdGlvbihmaWVsZCkge1xyXG4gICAgICAgICAgICB2YXIgY29sdW1uID0gdGhhdC5jb2x1bW5Nb2RlbC5nZXRDb2x1bW4oZmllbGQpO1xyXG4gICAgICAgICAgICBpZiAoIWNvbHVtbikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdXYXJuaW5nIGFnLWdyaWQgLSBubyBjb2x1bW4gZm91bmQgZm9yIGZpZWxkICcgKyBmaWVsZCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGZpbHRlcldyYXBwZXIgPSB0aGF0LmdldE9yQ3JlYXRlRmlsdGVyV3JhcHBlcihjb2x1bW4pO1xyXG4gICAgICAgICAgICB0aGF0LnNldE1vZGVsT25GaWx0ZXJXcmFwcGVyKGZpbHRlcldyYXBwZXIuZmlsdGVyLCBtb2RlbFtmaWVsZF0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB1dGlscy5pdGVyYXRlT2JqZWN0KHRoaXMuYWxsRmlsdGVycywgZnVuY3Rpb24oa2V5LCBmaWx0ZXJXcmFwcGVyKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0TW9kZWxPbkZpbHRlcldyYXBwZXIoZmlsdGVyV3JhcHBlci5maWx0ZXIsIG51bGwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuc2V0TW9kZWxPbkZpbHRlcldyYXBwZXIgPSBmdW5jdGlvbihmaWx0ZXIsIG5ld01vZGVsKSB7XHJcbiAgICAvLyBiZWNhdXNlIHVzZXIgY2FuIHByb3ZpZGUgZmlsdGVycywgd2UgcHJvdmlkZSB1c2VmdWwgZXJyb3IgY2hlY2tpbmcgYW5kIG1lc3NhZ2VzXHJcbiAgICBpZiAodHlwZW9mIGZpbHRlci5nZXRBcGkgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ1dhcm5pbmcgYWctZ3JpZCAtIGZpbHRlciBtaXNzaW5nIGdldEFwaSBtZXRob2QsIHdoaWNoIGlzIG5lZWRlZCBmb3IgZ2V0RmlsdGVyTW9kZWwnKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB2YXIgZmlsdGVyQXBpID0gZmlsdGVyLmdldEFwaSgpO1xyXG4gICAgaWYgKHR5cGVvZiBmaWx0ZXJBcGkuc2V0TW9kZWwgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ1dhcm5pbmcgYWctZ3JpZCAtIGZpbHRlciBBUEkgbWlzc2luZyBzZXRNb2RlbCBtZXRob2QsIHdoaWNoIGlzIG5lZWRlZCBmb3Igc2V0RmlsdGVyTW9kZWwnKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmaWx0ZXJBcGkuc2V0TW9kZWwobmV3TW9kZWwpO1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuZ2V0RmlsdGVyTW9kZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIHV0aWxzLml0ZXJhdGVPYmplY3QodGhpcy5hbGxGaWx0ZXJzLCBmdW5jdGlvbihrZXksIGZpbHRlcldyYXBwZXIpIHtcclxuICAgICAgICAvLyBiZWNhdXNlIHVzZXIgY2FuIHByb3ZpZGUgZmlsdGVycywgd2UgcHJvdmlkZSB1c2VmdWwgZXJyb3IgY2hlY2tpbmcgYW5kIG1lc3NhZ2VzXHJcbiAgICAgICAgaWYgKHR5cGVvZiBmaWx0ZXJXcmFwcGVyLmZpbHRlci5nZXRBcGkgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdXYXJuaW5nIGFnLWdyaWQgLSBmaWx0ZXIgbWlzc2luZyBnZXRBcGkgbWV0aG9kLCB3aGljaCBpcyBuZWVkZWQgZm9yIGdldEZpbHRlck1vZGVsJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGZpbHRlckFwaSA9IGZpbHRlcldyYXBwZXIuZmlsdGVyLmdldEFwaSgpO1xyXG4gICAgICAgIGlmICh0eXBlb2YgZmlsdGVyQXBpLmdldE1vZGVsICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignV2FybmluZyBhZy1ncmlkIC0gZmlsdGVyIEFQSSBtaXNzaW5nIGdldE1vZGVsIG1ldGhvZCwgd2hpY2ggaXMgbmVlZGVkIGZvciBnZXRGaWx0ZXJNb2RlbCcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBtb2RlbCA9IGZpbHRlckFwaS5nZXRNb2RlbCgpO1xyXG4gICAgICAgIGlmIChtb2RlbCkge1xyXG4gICAgICAgICAgICB2YXIgZmllbGQgPSBmaWx0ZXJXcmFwcGVyLmNvbHVtbi5jb2xEZWYuZmllbGQ7XHJcbiAgICAgICAgICAgIGlmICghZmllbGQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignV2FybmluZyBhZy1ncmlkIC0gY2Fubm90IGdldCBmaWx0ZXIgbW9kZWwgd2hlbiBubyBmaWVsZCB2YWx1ZSBwcmVzZW50IGZvciBjb2x1bW4nKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtmaWVsZF0gPSBtb2RlbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLnNldFJvd01vZGVsID0gZnVuY3Rpb24ocm93TW9kZWwpIHtcclxuICAgIHRoaXMucm93TW9kZWwgPSByb3dNb2RlbDtcclxufTtcclxuXHJcbi8vIHJldHVybnMgdHJ1ZSBpZiBhdCBsZWFzdCBvbmUgZmlsdGVyIGlzIGFjdGl2ZVxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5pc0ZpbHRlclByZXNlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBhdExlYXN0T25lQWN0aXZlID0gZmFsc2U7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmFsbEZpbHRlcnMpO1xyXG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIHZhciBmaWx0ZXJXcmFwcGVyID0gdGhhdC5hbGxGaWx0ZXJzW2tleV07XHJcbiAgICAgICAgaWYgKCFmaWx0ZXJXcmFwcGVyLmZpbHRlci5pc0ZpbHRlckFjdGl2ZSkgeyAvLyBiZWNhdXNlIHVzZXJzIGNhbiBkbyBjdXN0b20gZmlsdGVycywgZ2l2ZSBuaWNlIGVycm9yIG1lc3NhZ2VcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmlsdGVyIGlzIG1pc3NpbmcgbWV0aG9kIGlzRmlsdGVyQWN0aXZlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmaWx0ZXJXcmFwcGVyLmZpbHRlci5pc0ZpbHRlckFjdGl2ZSgpKSB7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVBY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGF0TGVhc3RPbmVBY3RpdmU7XHJcbn07XHJcblxyXG4vLyByZXR1cm5zIHRydWUgaWYgZ2l2ZW4gY29sIGhhcyBhIGZpbHRlciBhY3RpdmVcclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuaXNGaWx0ZXJQcmVzZW50Rm9yQ29sID0gZnVuY3Rpb24oY29sS2V5KSB7XHJcbiAgICB2YXIgZmlsdGVyV3JhcHBlciA9IHRoaXMuYWxsRmlsdGVyc1tjb2xLZXldO1xyXG4gICAgaWYgKCFmaWx0ZXJXcmFwcGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKCFmaWx0ZXJXcmFwcGVyLmZpbHRlci5pc0ZpbHRlckFjdGl2ZSkgeyAvLyBiZWNhdXNlIHVzZXJzIGNhbiBkbyBjdXN0b20gZmlsdGVycywgZ2l2ZSBuaWNlIGVycm9yIG1lc3NhZ2VcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdGaWx0ZXIgaXMgbWlzc2luZyBtZXRob2QgaXNGaWx0ZXJBY3RpdmUnKTtcclxuICAgIH1cclxuICAgIHZhciBmaWx0ZXJQcmVzZW50ID0gZmlsdGVyV3JhcHBlci5maWx0ZXIuaXNGaWx0ZXJBY3RpdmUoKTtcclxuICAgIHJldHVybiBmaWx0ZXJQcmVzZW50O1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuZG9lc0ZpbHRlclBhc3MgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICB2YXIgZGF0YSA9IG5vZGUuZGF0YTtcclxuICAgIHZhciBjb2xLZXlzID0gT2JqZWN0LmtleXModGhpcy5hbGxGaWx0ZXJzKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY29sS2V5cy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgLy8gY3JpdGljYWwgY29kZSwgZG9uJ3QgdXNlIGZ1bmN0aW9uYWwgcHJvZ3JhbW1pbmdcclxuXHJcbiAgICAgICAgdmFyIGNvbEtleSA9IGNvbEtleXNbaV07XHJcbiAgICAgICAgdmFyIGZpbHRlcldyYXBwZXIgPSB0aGlzLmFsbEZpbHRlcnNbY29sS2V5XTtcclxuXHJcbiAgICAgICAgLy8gaWYgbm8gZmlsdGVyLCBhbHdheXMgcGFzc1xyXG4gICAgICAgIGlmIChmaWx0ZXJXcmFwcGVyID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWZpbHRlcldyYXBwZXIuZmlsdGVyLmRvZXNGaWx0ZXJQYXNzKSB7IC8vIGJlY2F1c2UgdXNlcnMgY2FuIGRvIGN1c3RvbSBmaWx0ZXJzLCBnaXZlIG5pY2UgZXJyb3IgbWVzc2FnZVxyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGaWx0ZXIgaXMgbWlzc2luZyBtZXRob2QgZG9lc0ZpbHRlclBhc3MnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgZGF0YTogZGF0YVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKCFmaWx0ZXJXcmFwcGVyLmZpbHRlci5kb2VzRmlsdGVyUGFzcyhwYXJhbXMpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBhbGwgZmlsdGVycyBwYXNzZWRcclxuICAgIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUub25OZXdSb3dzTG9hZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBPYmplY3Qua2V5cyh0aGlzLmFsbEZpbHRlcnMpLmZvckVhY2goZnVuY3Rpb24oZmllbGQpIHtcclxuICAgICAgICB2YXIgZmlsdGVyID0gdGhhdC5hbGxGaWx0ZXJzW2ZpZWxkXS5maWx0ZXI7XHJcbiAgICAgICAgaWYgKGZpbHRlci5vbk5ld1Jvd3NMb2FkZWQpIHtcclxuICAgICAgICAgICAgZmlsdGVyLm9uTmV3Um93c0xvYWRlZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUucG9zaXRpb25Qb3B1cCA9IGZ1bmN0aW9uKGV2ZW50U291cmNlLCBlUG9wdXAsIGVQb3B1cFJvb3QpIHtcclxuICAgIHZhciBzb3VyY2VSZWN0ID0gZXZlbnRTb3VyY2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICB2YXIgcGFyZW50UmVjdCA9IGVQb3B1cFJvb3QuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgdmFyIHggPSBzb3VyY2VSZWN0LmxlZnQgLSBwYXJlbnRSZWN0LmxlZnQ7XHJcbiAgICB2YXIgeSA9IHNvdXJjZVJlY3QudG9wIC0gcGFyZW50UmVjdC50b3AgKyBzb3VyY2VSZWN0LmhlaWdodDtcclxuXHJcbiAgICAvLyBpZiBwb3B1cCBpcyBvdmVyZmxvd2luZyB0byB0aGUgcmlnaHQsIG1vdmUgaXQgbGVmdFxyXG4gICAgdmFyIHdpZHRoT2ZQb3B1cCA9IDIwMDsgLy8gdGhpcyBpcyBzZXQgaW4gdGhlIGNzc1xyXG4gICAgdmFyIHdpZHRoT2ZQYXJlbnQgPSBwYXJlbnRSZWN0LnJpZ2h0IC0gcGFyZW50UmVjdC5sZWZ0O1xyXG4gICAgdmFyIG1heFggPSB3aWR0aE9mUGFyZW50IC0gd2lkdGhPZlBvcHVwIC0gMjA7IC8vIDIwIHBpeGVscyBncmFjZVxyXG4gICAgaWYgKHggPiBtYXhYKSB7IC8vIG1vdmUgcG9zaXRpb24gbGVmdCwgYmFjayBpbnRvIHZpZXdcclxuICAgICAgICB4ID0gbWF4WDtcclxuICAgIH1cclxuICAgIGlmICh4IDwgMCkgeyAvLyBpbiBjYXNlIHRoZSBwb3B1cCBoYXMgYSBuZWdhdGl2ZSB2YWx1ZVxyXG4gICAgICAgIHggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGVQb3B1cC5zdHlsZS5sZWZ0ID0geCArIFwicHhcIjtcclxuICAgIGVQb3B1cC5zdHlsZS50b3AgPSB5ICsgXCJweFwiO1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuY3JlYXRlVmFsdWVHZXR0ZXIgPSBmdW5jdGlvbihjb2xEZWYpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHJldHVybiBmdW5jdGlvbiB2YWx1ZUdldHRlcihub2RlKSB7XHJcbiAgICAgICAgdmFyIGFwaSA9IHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpO1xyXG4gICAgICAgIHZhciBjb250ZXh0ID0gdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpO1xyXG4gICAgICAgIHJldHVybiB1dGlscy5nZXRWYWx1ZSh0aGF0LmV4cHJlc3Npb25TZXJ2aWNlLCBub2RlLmRhdGEsIGNvbERlZiwgbm9kZSwgYXBpLCBjb250ZXh0KTtcclxuICAgIH07XHJcbn07XHJcblxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5nZXRGaWx0ZXJBcGkgPSBmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgIHZhciBmaWx0ZXJXcmFwcGVyID0gdGhpcy5nZXRPckNyZWF0ZUZpbHRlcldyYXBwZXIoY29sdW1uKTtcclxuICAgIGlmIChmaWx0ZXJXcmFwcGVyKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBmaWx0ZXJXcmFwcGVyLmZpbHRlci5nZXRBcGkgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcldyYXBwZXIuZmlsdGVyLmdldEFwaSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLmdldE9yQ3JlYXRlRmlsdGVyV3JhcHBlciA9IGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgdmFyIGZpbHRlcldyYXBwZXIgPSB0aGlzLmFsbEZpbHRlcnNbY29sdW1uLmNvbEtleV07XHJcblxyXG4gICAgaWYgKCFmaWx0ZXJXcmFwcGVyKSB7XHJcbiAgICAgICAgZmlsdGVyV3JhcHBlciA9IHRoaXMuY3JlYXRlRmlsdGVyV3JhcHBlcihjb2x1bW4pO1xyXG4gICAgICAgIHRoaXMuYWxsRmlsdGVyc1tjb2x1bW4uY29sS2V5XSA9IGZpbHRlcldyYXBwZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZpbHRlcldyYXBwZXI7XHJcbn07XHJcblxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5jcmVhdGVGaWx0ZXJXcmFwcGVyID0gZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICB2YXIgY29sRGVmID0gY29sdW1uLmNvbERlZjtcclxuXHJcbiAgICB2YXIgZmlsdGVyV3JhcHBlciA9IHtcclxuICAgICAgICBjb2x1bW46IGNvbHVtblxyXG4gICAgfTtcclxuICAgIHZhciBmaWx0ZXJDaGFuZ2VkQ2FsbGJhY2sgPSB0aGlzLmdyaWQub25GaWx0ZXJDaGFuZ2VkLmJpbmQodGhpcy5ncmlkKTtcclxuICAgIHZhciBmaWx0ZXJQYXJhbXMgPSBjb2xEZWYuZmlsdGVyUGFyYW1zO1xyXG4gICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICByb3dNb2RlbDogdGhpcy5yb3dNb2RlbCxcclxuICAgICAgICBmaWx0ZXJDaGFuZ2VkQ2FsbGJhY2s6IGZpbHRlckNoYW5nZWRDYWxsYmFjayxcclxuICAgICAgICBmaWx0ZXJQYXJhbXM6IGZpbHRlclBhcmFtcyxcclxuICAgICAgICBsb2NhbGVUZXh0RnVuYzogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0TG9jYWxlVGV4dEZ1bmMoKSxcclxuICAgICAgICB2YWx1ZUdldHRlcjogdGhpcy5jcmVhdGVWYWx1ZUdldHRlcihjb2xEZWYpXHJcbiAgICB9O1xyXG4gICAgaWYgKHR5cGVvZiBjb2xEZWYuZmlsdGVyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgLy8gaWYgdXNlciBwcm92aWRlZCBhIGZpbHRlciwganVzdCB1c2UgaXRcclxuICAgICAgICAvLyBmaXJzdCB1cCwgY3JlYXRlIGNoaWxkIHNjb3BlIGlmIG5lZWRlZFxyXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0FuZ3VsYXJDb21waWxlRmlsdGVycygpKSB7XHJcbiAgICAgICAgICAgIHZhciBzY29wZSA9IHRoaXMuJHNjb3BlLiRuZXcoKTtcclxuICAgICAgICAgICAgZmlsdGVyV3JhcHBlci5zY29wZSA9IHNjb3BlO1xyXG4gICAgICAgICAgICBwYXJhbXMuJHNjb3BlID0gc2NvcGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG5vdyBjcmVhdGUgZmlsdGVyXHJcbiAgICAgICAgZmlsdGVyV3JhcHBlci5maWx0ZXIgPSBuZXcgY29sRGVmLmZpbHRlcihwYXJhbXMpO1xyXG4gICAgfSBlbHNlIGlmIChjb2xEZWYuZmlsdGVyID09PSAndGV4dCcpIHtcclxuICAgICAgICBmaWx0ZXJXcmFwcGVyLmZpbHRlciA9IG5ldyBTdHJpbmdGaWx0ZXIocGFyYW1zKTtcclxuICAgIH0gZWxzZSBpZiAoY29sRGVmLmZpbHRlciA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICBmaWx0ZXJXcmFwcGVyLmZpbHRlciA9IG5ldyBOdW1iZXJGaWx0ZXIocGFyYW1zKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZmlsdGVyV3JhcHBlci5maWx0ZXIgPSBuZXcgU2V0RmlsdGVyKHBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFmaWx0ZXJXcmFwcGVyLmZpbHRlci5nZXRHdWkpIHsgLy8gYmVjYXVzZSB1c2VycyBjYW4gZG8gY3VzdG9tIGZpbHRlcnMsIGdpdmUgbmljZSBlcnJvciBtZXNzYWdlXHJcbiAgICAgICAgdGhyb3cgJ0ZpbHRlciBpcyBtaXNzaW5nIG1ldGhvZCBnZXRHdWknO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBlRmlsdGVyR3VpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBlRmlsdGVyR3VpLmNsYXNzTmFtZSA9ICdhZy1maWx0ZXInO1xyXG4gICAgdmFyIGd1aUZyb21GaWx0ZXIgPSBmaWx0ZXJXcmFwcGVyLmZpbHRlci5nZXRHdWkoKTtcclxuICAgIGlmICh1dGlscy5pc05vZGVPckVsZW1lbnQoZ3VpRnJvbUZpbHRlcikpIHtcclxuICAgICAgICAvL2EgZG9tIG5vZGUgb3IgZWxlbWVudCB3YXMgcmV0dXJuZWQsIHNvIGFkZCBjaGlsZFxyXG4gICAgICAgIGVGaWx0ZXJHdWkuYXBwZW5kQ2hpbGQoZ3VpRnJvbUZpbHRlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vb3RoZXJ3aXNlIGFzc3VtZSBpdCB3YXMgaHRtbCwgc28ganVzdCBpbnNlcnRcclxuICAgICAgICB2YXIgZVRleHRTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgIGVUZXh0U3Bhbi5pbm5lckhUTUwgPSBndWlGcm9tRmlsdGVyO1xyXG4gICAgICAgIGVGaWx0ZXJHdWkuYXBwZW5kQ2hpbGQoZVRleHRTcGFuKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZmlsdGVyV3JhcHBlci5zY29wZSkge1xyXG4gICAgICAgIGZpbHRlcldyYXBwZXIuZ3VpID0gdGhpcy4kY29tcGlsZShlRmlsdGVyR3VpKShmaWx0ZXJXcmFwcGVyLnNjb3BlKVswXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZmlsdGVyV3JhcHBlci5ndWkgPSBlRmlsdGVyR3VpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmaWx0ZXJXcmFwcGVyO1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuc2hvd0ZpbHRlciA9IGZ1bmN0aW9uKGNvbHVtbiwgZXZlbnRTb3VyY2UpIHtcclxuXHJcbiAgICB2YXIgZmlsdGVyV3JhcHBlciA9IHRoaXMuZ2V0T3JDcmVhdGVGaWx0ZXJXcmFwcGVyKGNvbHVtbik7XHJcblxyXG4gICAgdmFyIGVQb3B1cFBhcmVudCA9IHRoaXMuZ3JpZC5nZXRQb3B1cFBhcmVudCgpO1xyXG4gICAgdGhpcy5wb3NpdGlvblBvcHVwKGV2ZW50U291cmNlLCBmaWx0ZXJXcmFwcGVyLmd1aSwgZVBvcHVwUGFyZW50KTtcclxuXHJcbiAgICB1dGlscy5hZGRBc01vZGFsUG9wdXAoZVBvcHVwUGFyZW50LCBmaWx0ZXJXcmFwcGVyLmd1aSk7XHJcblxyXG4gICAgaWYgKGZpbHRlcldyYXBwZXIuZmlsdGVyLmFmdGVyR3VpQXR0YWNoZWQpIHtcclxuICAgICAgICBmaWx0ZXJXcmFwcGVyLmZpbHRlci5hZnRlckd1aUF0dGFjaGVkKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZpbHRlck1hbmFnZXI7XHJcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9udW1iZXJGaWx0ZXJUZW1wbGF0ZS5qcycpO1xyXG5cclxudmFyIEVRVUFMUyA9IDE7XHJcbnZhciBMRVNTX1RIQU4gPSAyO1xyXG52YXIgR1JFQVRFUl9USEFOID0gMztcclxuXHJcbmZ1bmN0aW9uIE51bWJlckZpbHRlcihwYXJhbXMpIHtcclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrID0gcGFyYW1zLmZpbHRlckNoYW5nZWRDYWxsYmFjaztcclxuICAgIHRoaXMubG9jYWxlVGV4dEZ1bmMgPSBwYXJhbXMubG9jYWxlVGV4dEZ1bmM7XHJcbiAgICB0aGlzLnZhbHVlR2V0dGVyID0gcGFyYW1zLnZhbHVlR2V0dGVyO1xyXG4gICAgdGhpcy5jcmVhdGVHdWkoKTtcclxuICAgIHRoaXMuZmlsdGVyTnVtYmVyID0gbnVsbDtcclxuICAgIHRoaXMuZmlsdGVyVHlwZSA9IEVRVUFMUztcclxuICAgIHRoaXMuY3JlYXRlQXBpKCk7XHJcbn1cclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5OdW1iZXJGaWx0ZXIucHJvdG90eXBlLmFmdGVyR3VpQXR0YWNoZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZUZpbHRlclRleHRGaWVsZC5mb2N1cygpO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcbk51bWJlckZpbHRlci5wcm90b3R5cGUuZG9lc0ZpbHRlclBhc3MgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICBpZiAodGhpcy5maWx0ZXJOdW1iZXIgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHZhciB2YWx1ZSA9IHRoaXMudmFsdWVHZXR0ZXIobm9kZSk7XHJcblxyXG4gICAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdmFsdWVBc051bWJlcjtcclxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgdmFsdWVBc051bWJlciA9IHZhbHVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB2YWx1ZUFzTnVtYmVyID0gcGFyc2VGbG9hdCh2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoICh0aGlzLmZpbHRlclR5cGUpIHtcclxuICAgICAgICBjYXNlIEVRVUFMUzpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlQXNOdW1iZXIgPT09IHRoaXMuZmlsdGVyTnVtYmVyO1xyXG4gICAgICAgIGNhc2UgTEVTU19USEFOOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVBc051bWJlciA8PSB0aGlzLmZpbHRlck51bWJlcjtcclxuICAgICAgICBjYXNlIEdSRUFURVJfVEhBTjpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlQXNOdW1iZXIgPj0gdGhpcy5maWx0ZXJOdW1iZXI7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLy8gc2hvdWxkIG5ldmVyIGhhcHBlblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnaW52YWxpZCBmaWx0ZXIgdHlwZSAnICsgdGhpcy5maWx0ZXJUeXBlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcbk51bWJlckZpbHRlci5wcm90b3R5cGUuZ2V0R3VpID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lR3VpO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcbk51bWJlckZpbHRlci5wcm90b3R5cGUuaXNGaWx0ZXJBY3RpdmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmZpbHRlck51bWJlciAhPT0gbnVsbDtcclxufTtcclxuXHJcbk51bWJlckZpbHRlci5wcm90b3R5cGUuY3JlYXRlVGVtcGxhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0ZW1wbGF0ZVxyXG4gICAgICAgIC5yZXBsYWNlKCdbRklMVEVSLi4uXScsIHRoaXMubG9jYWxlVGV4dEZ1bmMoJ2ZpbHRlck9vbycsICdGaWx0ZXIuLi4nKSlcclxuICAgICAgICAucmVwbGFjZSgnW0VRVUFMU10nLCB0aGlzLmxvY2FsZVRleHRGdW5jKCdlcXVhbHMnLCAnRXF1YWxzJykpXHJcbiAgICAgICAgLnJlcGxhY2UoJ1tMRVNTIFRIQU5dJywgdGhpcy5sb2NhbGVUZXh0RnVuYygnbGVzc1RoYW4nLCAnTGVzcyB0aGFuJykpXHJcbiAgICAgICAgLnJlcGxhY2UoJ1tHUkVBVEVSIFRIQU5dJywgdGhpcy5sb2NhbGVUZXh0RnVuYygnZ3JlYXRlclRoYW4nLCAnR3JlYXRlciB0aGFuJykpO1xyXG59O1xyXG5cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5jcmVhdGVHdWkgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZUd1aSA9IHV0aWxzLmxvYWRUZW1wbGF0ZSh0aGlzLmNyZWF0ZVRlbXBsYXRlKCkpO1xyXG4gICAgdGhpcy5lRmlsdGVyVGV4dEZpZWxkID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIjZmlsdGVyVGV4dFwiKTtcclxuICAgIHRoaXMuZVR5cGVTZWxlY3QgPSB0aGlzLmVHdWkucXVlcnlTZWxlY3RvcihcIiNmaWx0ZXJUeXBlXCIpO1xyXG5cclxuICAgIHV0aWxzLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuZUZpbHRlclRleHRGaWVsZCwgdGhpcy5vbkZpbHRlckNoYW5nZWQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVUeXBlU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgdGhpcy5vblR5cGVDaGFuZ2VkLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5vblR5cGVDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmZpbHRlclR5cGUgPSBwYXJzZUludCh0aGlzLmVUeXBlU2VsZWN0LnZhbHVlKTtcclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrKCk7XHJcbn07XHJcblxyXG5OdW1iZXJGaWx0ZXIucHJvdG90eXBlLm9uRmlsdGVyQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGZpbHRlclRleHQgPSB1dGlscy5tYWtlTnVsbCh0aGlzLmVGaWx0ZXJUZXh0RmllbGQudmFsdWUpO1xyXG4gICAgaWYgKGZpbHRlclRleHQgJiYgZmlsdGVyVGV4dC50cmltKCkgPT09ICcnKSB7XHJcbiAgICAgICAgZmlsdGVyVGV4dCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAoZmlsdGVyVGV4dCkge1xyXG4gICAgICAgIHRoaXMuZmlsdGVyTnVtYmVyID0gcGFyc2VGbG9hdChmaWx0ZXJUZXh0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJOdW1iZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2soKTtcclxufTtcclxuXHJcbk51bWJlckZpbHRlci5wcm90b3R5cGUuY3JlYXRlQXBpID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB0aGlzLmFwaSA9IHtcclxuICAgICAgICBFUVVBTFM6IEVRVUFMUyxcclxuICAgICAgICBMRVNTX1RIQU46IExFU1NfVEhBTixcclxuICAgICAgICBHUkVBVEVSX1RIQU46IEdSRUFURVJfVEhBTixcclxuICAgICAgICBzZXRUeXBlOiBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICAgICAgICAgIHRoYXQuZmlsdGVyVHlwZSA9IHR5cGU7XHJcbiAgICAgICAgICAgIHRoYXQuZVR5cGVTZWxlY3QudmFsdWUgPSB0eXBlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0RmlsdGVyOiBmdW5jdGlvbihmaWx0ZXIpIHtcclxuICAgICAgICAgICAgZmlsdGVyID0gdXRpbHMubWFrZU51bGwoZmlsdGVyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXIhPT1udWxsICYmICEodHlwZW9mIGZpbHRlciA9PT0gJ251bWJlcicpKSB7XHJcbiAgICAgICAgICAgICAgICBmaWx0ZXIgPSBwYXJzZUZsb2F0KGZpbHRlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhhdC5maWx0ZXJOdW1iZXIgPSBmaWx0ZXI7XHJcbiAgICAgICAgICAgIHRoYXQuZUZpbHRlclRleHRGaWVsZC52YWx1ZSA9IGZpbHRlcjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFR5cGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5maWx0ZXJUeXBlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0RmlsdGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZmlsdGVyTnVtYmVyO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0TW9kZWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhhdC5pc0ZpbHRlckFjdGl2ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHRoYXQuZmlsdGVyVHlwZSxcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXI6IHRoYXQuZmlsdGVyTnVtYmVyXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldE1vZGVsOiBmdW5jdGlvbihkYXRhTW9kZWwpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGFNb2RlbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUeXBlKGRhdGFNb2RlbC50eXBlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RmlsdGVyKGRhdGFNb2RlbC5maWx0ZXIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRGaWx0ZXIobnVsbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5nZXRBcGkgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmFwaTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTnVtYmVyRmlsdGVyO1xyXG4iLCJ2YXIgdGVtcGxhdGUgPSBbXHJcbiAgICAnPGRpdj4nLFxyXG4gICAgJzxkaXY+JyxcclxuICAgICc8c2VsZWN0IGNsYXNzPVwiYWctZmlsdGVyLXNlbGVjdFwiIGlkPVwiZmlsdGVyVHlwZVwiPicsXHJcbiAgICAnPG9wdGlvbiB2YWx1ZT1cIjFcIj5bRVFVQUxTXTwvb3B0aW9uPicsXHJcbiAgICAnPG9wdGlvbiB2YWx1ZT1cIjJcIj5bTEVTUyBUSEFOXTwvb3B0aW9uPicsXHJcbiAgICAnPG9wdGlvbiB2YWx1ZT1cIjNcIj5bR1JFQVRFUiBUSEFOXTwvb3B0aW9uPicsXHJcbiAgICAnPC9zZWxlY3Q+JyxcclxuICAgICc8L2Rpdj4nLFxyXG4gICAgJzxkaXY+JyxcclxuICAgICc8aW5wdXQgY2xhc3M9XCJhZy1maWx0ZXItZmlsdGVyXCIgaWQ9XCJmaWx0ZXJUZXh0XCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIltGSUxURVIuLi5dXCIvPicsXHJcbiAgICAnPC9kaXY+JyxcclxuICAgICc8L2Rpdj4nLFxyXG5dLmpvaW4oJycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcclxuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xyXG52YXIgU2V0RmlsdGVyTW9kZWwgPSByZXF1aXJlKCcuL3NldEZpbHRlck1vZGVsJyk7XHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vc2V0RmlsdGVyVGVtcGxhdGUnKTtcclxuXHJcbnZhciBERUZBVUxUX1JPV19IRUlHSFQgPSAyMDtcclxuXHJcbmZ1bmN0aW9uIFNldEZpbHRlcihwYXJhbXMpIHtcclxuICAgIHZhciBmaWx0ZXJQYXJhbXMgPSBwYXJhbXMuZmlsdGVyUGFyYW1zO1xyXG4gICAgdGhpcy5yb3dIZWlnaHQgPSAoZmlsdGVyUGFyYW1zICYmIGZpbHRlclBhcmFtcy5jZWxsSGVpZ2h0KSA/IGZpbHRlclBhcmFtcy5jZWxsSGVpZ2h0IDogREVGQVVMVF9ST1dfSEVJR0hUO1xyXG4gICAgdGhpcy5tb2RlbCA9IG5ldyBTZXRGaWx0ZXJNb2RlbChwYXJhbXMuY29sRGVmLCBwYXJhbXMucm93TW9kZWwsIHBhcmFtcy52YWx1ZUdldHRlcik7XHJcbiAgICB0aGlzLmZpbHRlckNoYW5nZWRDYWxsYmFjayA9IHBhcmFtcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2s7XHJcbiAgICB0aGlzLnZhbHVlR2V0dGVyID0gcGFyYW1zLnZhbHVlR2V0dGVyO1xyXG4gICAgdGhpcy5yb3dzSW5Cb2R5Q29udGFpbmVyID0ge307XHJcbiAgICB0aGlzLmNvbERlZiA9IHBhcmFtcy5jb2xEZWY7XHJcbiAgICB0aGlzLmxvY2FsZVRleHRGdW5jID0gcGFyYW1zLmxvY2FsZVRleHRGdW5jO1xyXG4gICAgaWYgKGZpbHRlclBhcmFtcykge1xyXG4gICAgICAgIHRoaXMuY2VsbFJlbmRlcmVyID0gZmlsdGVyUGFyYW1zLmNlbGxSZW5kZXJlcjtcclxuICAgIH1cclxuICAgIHRoaXMuY3JlYXRlR3VpKCk7XHJcbiAgICB0aGlzLmFkZFNjcm9sbExpc3RlbmVyKCk7XHJcbiAgICB0aGlzLmNyZWF0ZUFwaSgpO1xyXG59XHJcblxyXG4vLyB3ZSBuZWVkIHRvIGhhdmUgdGhlIGd1aSBhdHRhY2hlZCBiZWZvcmUgd2UgY2FuIGRyYXcgdGhlIHZpcnR1YWwgcm93cywgYXMgdGhlXHJcbi8vIHZpcnR1YWwgcm93IGxvZ2ljIG5lZWRzIGluZm8gYWJvdXQgdGhlIGd1aSBzdGF0ZVxyXG4vKiBwdWJsaWMgKi9cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5hZnRlckd1aUF0dGFjaGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmRyYXdWaXJ0dWFsUm93cygpO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcblNldEZpbHRlci5wcm90b3R5cGUuaXNGaWx0ZXJBY3RpdmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLm1vZGVsLmlzRmlsdGVyQWN0aXZlKCk7XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5kb2VzRmlsdGVyUGFzcyA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuXHJcbiAgICAvL2lmIG5vIGZpbHRlciwgYWx3YXlzIHBhc3NcclxuICAgIGlmICh0aGlzLm1vZGVsLmlzRXZlcnl0aGluZ1NlbGVjdGVkKCkpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIC8vaWYgbm90aGluZyBzZWxlY3RlZCBpbiBmaWx0ZXIsIGFsd2F5cyBmYWlsXHJcbiAgICBpZiAodGhpcy5tb2RlbC5pc05vdGhpbmdTZWxlY3RlZCgpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB2YWx1ZSA9IHRoaXMudmFsdWVHZXR0ZXIobm9kZSk7XHJcbiAgICB2YWx1ZSA9IHV0aWxzLm1ha2VOdWxsKHZhbHVlKTtcclxuXHJcbiAgICB2YXIgZmlsdGVyUGFzc2VkID0gdGhpcy5tb2RlbC5pc1ZhbHVlU2VsZWN0ZWQodmFsdWUpO1xyXG4gICAgcmV0dXJuIGZpbHRlclBhc3NlZDtcclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmdldEd1aSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZUd1aTtcclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5TZXRGaWx0ZXIucHJvdG90eXBlLm9uTmV3Um93c0xvYWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5tb2RlbC5zZWxlY3RFdmVyeXRoaW5nKCk7XHJcbiAgICB0aGlzLnVwZGF0ZUFsbENoZWNrYm94ZXModHJ1ZSk7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmNyZWF0ZVRlbXBsYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGVtcGxhdGVcclxuICAgICAgICAucmVwbGFjZSgnW1NFTEVDVCBBTExdJywgdGhpcy5sb2NhbGVUZXh0RnVuYygnc2VsZWN0QWxsJywgJ1NlbGVjdCBBbGwnKSlcclxuICAgICAgICAucmVwbGFjZSgnW1NFQVJDSC4uLl0nLCB0aGlzLmxvY2FsZVRleHRGdW5jKCdzZWFyY2hPb28nLCAnU2VhcmNoLi4uJykpO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5jcmVhdGVHdWkgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgdGhpcy5lR3VpID0gdXRpbHMubG9hZFRlbXBsYXRlKHRoaXMuY3JlYXRlVGVtcGxhdGUoKSk7XHJcblxyXG4gICAgdGhpcy5lTGlzdENvbnRhaW5lciA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKFwiLmFnLWZpbHRlci1saXN0LWNvbnRhaW5lclwiKTtcclxuICAgIHRoaXMuZUZpbHRlclZhbHVlVGVtcGxhdGUgPSB0aGlzLmVHdWkucXVlcnlTZWxlY3RvcihcIiNpdGVtRm9yUmVwZWF0XCIpO1xyXG4gICAgdGhpcy5lU2VsZWN0QWxsID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIjc2VsZWN0QWxsXCIpO1xyXG4gICAgdGhpcy5lTGlzdFZpZXdwb3J0ID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIuYWctZmlsdGVyLWxpc3Qtdmlld3BvcnRcIik7XHJcbiAgICB0aGlzLmVNaW5pRmlsdGVyID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIuYWctZmlsdGVyLWZpbHRlclwiKTtcclxuICAgIHRoaXMuZUxpc3RDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gKHRoaXMubW9kZWwuZ2V0VW5pcXVlVmFsdWVDb3VudCgpICogdGhpcy5yb3dIZWlnaHQpICsgXCJweFwiO1xyXG5cclxuICAgIHRoaXMuc2V0Q29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICB0aGlzLmVNaW5pRmlsdGVyLnZhbHVlID0gdGhpcy5tb2RlbC5nZXRNaW5pRmlsdGVyKCk7XHJcbiAgICB1dGlscy5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLmVNaW5pRmlsdGVyLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBfdGhpcy5vbk1pbmlGaWx0ZXJDaGFuZ2VkKCk7XHJcbiAgICB9KTtcclxuICAgIHV0aWxzLnJlbW92ZUFsbENoaWxkcmVuKHRoaXMuZUxpc3RDb250YWluZXIpO1xyXG5cclxuICAgIHRoaXMuZVNlbGVjdEFsbC5vbmNsaWNrID0gdGhpcy5vblNlbGVjdEFsbC5iaW5kKHRoaXMpO1xyXG5cclxuICAgIGlmICh0aGlzLm1vZGVsLmlzRXZlcnl0aGluZ1NlbGVjdGVkKCkpIHtcclxuICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZVNlbGVjdEFsbC5jaGVja2VkID0gdHJ1ZTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5tb2RlbC5pc05vdGhpbmdTZWxlY3RlZCgpKSB7XHJcbiAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmVTZWxlY3RBbGwuY2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IHRydWU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLnNldENvbnRhaW5lckhlaWdodCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lTGlzdENvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSAodGhpcy5tb2RlbC5nZXREaXNwbGF5ZWRWYWx1ZUNvdW50KCkgKiB0aGlzLnJvd0hlaWdodCkgKyBcInB4XCI7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmRyYXdWaXJ0dWFsUm93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRvcFBpeGVsID0gdGhpcy5lTGlzdFZpZXdwb3J0LnNjcm9sbFRvcDtcclxuICAgIHZhciBib3R0b21QaXhlbCA9IHRvcFBpeGVsICsgdGhpcy5lTGlzdFZpZXdwb3J0Lm9mZnNldEhlaWdodDtcclxuXHJcbiAgICB2YXIgZmlyc3RSb3cgPSBNYXRoLmZsb29yKHRvcFBpeGVsIC8gdGhpcy5yb3dIZWlnaHQpO1xyXG4gICAgdmFyIGxhc3RSb3cgPSBNYXRoLmZsb29yKGJvdHRvbVBpeGVsIC8gdGhpcy5yb3dIZWlnaHQpO1xyXG5cclxuICAgIHRoaXMuZW5zdXJlUm93c1JlbmRlcmVkKGZpcnN0Um93LCBsYXN0Um93KTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUuZW5zdXJlUm93c1JlbmRlcmVkID0gZnVuY3Rpb24oc3RhcnQsIGZpbmlzaCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICAvL2F0IHRoZSBlbmQsIHRoaXMgYXJyYXkgd2lsbCBjb250YWluIHRoZSBpdGVtcyB3ZSBuZWVkIHRvIHJlbW92ZVxyXG4gICAgdmFyIHJvd3NUb1JlbW92ZSA9IE9iamVjdC5rZXlzKHRoaXMucm93c0luQm9keUNvbnRhaW5lcik7XHJcblxyXG4gICAgLy9hZGQgaW4gbmV3IHJvd3NcclxuICAgIGZvciAodmFyIHJvd0luZGV4ID0gc3RhcnQ7IHJvd0luZGV4IDw9IGZpbmlzaDsgcm93SW5kZXgrKykge1xyXG4gICAgICAgIC8vc2VlIGlmIGl0ZW0gYWxyZWFkeSB0aGVyZSwgYW5kIGlmIHllcywgdGFrZSBpdCBvdXQgb2YgdGhlICd0byByZW1vdmUnIGFycmF5XHJcbiAgICAgICAgaWYgKHJvd3NUb1JlbW92ZS5pbmRleE9mKHJvd0luZGV4LnRvU3RyaW5nKCkpID49IDApIHtcclxuICAgICAgICAgICAgcm93c1RvUmVtb3ZlLnNwbGljZShyb3dzVG9SZW1vdmUuaW5kZXhPZihyb3dJbmRleC50b1N0cmluZygpKSwgMSk7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL2NoZWNrIHRoaXMgcm93IGFjdHVhbGx5IGV4aXN0cyAoaW4gY2FzZSBvdmVyZmxvdyBidWZmZXIgd2luZG93IGV4Y2VlZHMgcmVhbCBkYXRhKVxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmdldERpc3BsYXllZFZhbHVlQ291bnQoKSA+IHJvd0luZGV4KSB7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMubW9kZWwuZ2V0RGlzcGxheWVkVmFsdWUocm93SW5kZXgpO1xyXG4gICAgICAgICAgICBfdGhpcy5pbnNlcnRSb3codmFsdWUsIHJvd0luZGV4KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy9hdCB0aGlzIHBvaW50LCBldmVyeXRoaW5nIGluIG91ciAncm93c1RvUmVtb3ZlJyAuIC4gLlxyXG4gICAgdGhpcy5yZW1vdmVWaXJ0dWFsUm93cyhyb3dzVG9SZW1vdmUpO1xyXG59O1xyXG5cclxuLy90YWtlcyBhcnJheSBvZiByb3cgaWQnc1xyXG5TZXRGaWx0ZXIucHJvdG90eXBlLnJlbW92ZVZpcnR1YWxSb3dzID0gZnVuY3Rpb24ocm93c1RvUmVtb3ZlKSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgcm93c1RvUmVtb3ZlLmZvckVhY2goZnVuY3Rpb24oaW5kZXhUb1JlbW92ZSkge1xyXG4gICAgICAgIHZhciBlUm93VG9SZW1vdmUgPSBfdGhpcy5yb3dzSW5Cb2R5Q29udGFpbmVyW2luZGV4VG9SZW1vdmVdO1xyXG4gICAgICAgIF90aGlzLmVMaXN0Q29udGFpbmVyLnJlbW92ZUNoaWxkKGVSb3dUb1JlbW92ZSk7XHJcbiAgICAgICAgZGVsZXRlIF90aGlzLnJvd3NJbkJvZHlDb250YWluZXJbaW5kZXhUb1JlbW92ZV07XHJcbiAgICB9KTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUuaW5zZXJ0Um93ID0gZnVuY3Rpb24odmFsdWUsIHJvd0luZGV4KSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIHZhciBlRmlsdGVyVmFsdWUgPSB0aGlzLmVGaWx0ZXJWYWx1ZVRlbXBsYXRlLmNsb25lTm9kZSh0cnVlKTtcclxuXHJcbiAgICB2YXIgdmFsdWVFbGVtZW50ID0gZUZpbHRlclZhbHVlLnF1ZXJ5U2VsZWN0b3IoXCIuYWctZmlsdGVyLXZhbHVlXCIpO1xyXG4gICAgaWYgKHRoaXMuY2VsbFJlbmRlcmVyKSB7XHJcbiAgICAgICAgLy9yZW5kZXJlciBwcm92aWRlZCwgc28gdXNlIGl0XHJcbiAgICAgICAgdmFyIHJlc3VsdEZyb21SZW5kZXJlciA9IHRoaXMuY2VsbFJlbmRlcmVyKHtcclxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh1dGlscy5pc05vZGUocmVzdWx0RnJvbVJlbmRlcmVyKSkge1xyXG4gICAgICAgICAgICAvL2EgZG9tIG5vZGUgb3IgZWxlbWVudCB3YXMgcmV0dXJuZWQsIHNvIGFkZCBjaGlsZFxyXG4gICAgICAgICAgICB2YWx1ZUVsZW1lbnQuYXBwZW5kQ2hpbGQocmVzdWx0RnJvbVJlbmRlcmVyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvL290aGVyd2lzZSBhc3N1bWUgaXQgd2FzIGh0bWwsIHNvIGp1c3QgaW5zZXJ0XHJcbiAgICAgICAgICAgIHZhbHVlRWxlbWVudC5pbm5lckhUTUwgPSByZXN1bHRGcm9tUmVuZGVyZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy9vdGhlcndpc2UgZGlzcGxheSBhcyBhIHN0cmluZ1xyXG4gICAgICAgIHZhciBibGFua3NUZXh0ID0gJygnICsgdGhpcy5sb2NhbGVUZXh0RnVuYygnYmxhbmtzJywgJ0JsYW5rcycpICsgJyknO1xyXG4gICAgICAgIHZhciBkaXNwbGF5TmFtZU9mVmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCA/IGJsYW5rc1RleHQgOiB2YWx1ZTtcclxuICAgICAgICB2YWx1ZUVsZW1lbnQuaW5uZXJIVE1MID0gZGlzcGxheU5hbWVPZlZhbHVlO1xyXG4gICAgfVxyXG4gICAgdmFyIGVDaGVja2JveCA9IGVGaWx0ZXJWYWx1ZS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRcIik7XHJcbiAgICBlQ2hlY2tib3guY2hlY2tlZCA9IHRoaXMubW9kZWwuaXNWYWx1ZVNlbGVjdGVkKHZhbHVlKTtcclxuXHJcbiAgICBlQ2hlY2tib3gub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF90aGlzLm9uQ2hlY2tib3hDbGlja2VkKGVDaGVja2JveCwgdmFsdWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBlRmlsdGVyVmFsdWUuc3R5bGUudG9wID0gKHRoaXMucm93SGVpZ2h0ICogcm93SW5kZXgpICsgXCJweFwiO1xyXG5cclxuICAgIHRoaXMuZUxpc3RDb250YWluZXIuYXBwZW5kQ2hpbGQoZUZpbHRlclZhbHVlKTtcclxuICAgIHRoaXMucm93c0luQm9keUNvbnRhaW5lcltyb3dJbmRleF0gPSBlRmlsdGVyVmFsdWU7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLm9uQ2hlY2tib3hDbGlja2VkID0gZnVuY3Rpb24oZUNoZWNrYm94LCB2YWx1ZSkge1xyXG4gICAgdmFyIGNoZWNrZWQgPSBlQ2hlY2tib3guY2hlY2tlZDtcclxuICAgIGlmIChjaGVja2VkKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZWxlY3RWYWx1ZSh2YWx1ZSk7XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwuaXNFdmVyeXRoaW5nU2VsZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmVTZWxlY3RBbGwuY2hlY2tlZCA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmluZGV0ZXJtaW5hdGUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC51bnNlbGVjdFZhbHVlKHZhbHVlKTtcclxuICAgICAgICAvL2lmIHNldCBpcyBlbXB0eSwgbm90aGluZyBpcyBzZWxlY3RlZFxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmlzTm90aGluZ1NlbGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmNoZWNrZWQgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrKCk7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLm9uTWluaUZpbHRlckNoYW5nZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtaW5pRmlsdGVyQ2hhbmdlZCA9IHRoaXMubW9kZWwuc2V0TWluaUZpbHRlcih0aGlzLmVNaW5pRmlsdGVyLnZhbHVlKTtcclxuICAgIGlmIChtaW5pRmlsdGVyQ2hhbmdlZCkge1xyXG4gICAgICAgIHRoaXMuc2V0Q29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgICAgdGhpcy5yZWZyZXNoVmlydHVhbFJvd3MoKTtcclxuICAgIH1cclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUucmVmcmVzaFZpcnR1YWxSb3dzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmNsZWFyVmlydHVhbFJvd3MoKTtcclxuICAgIHRoaXMuZHJhd1ZpcnR1YWxSb3dzKCk7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmNsZWFyVmlydHVhbFJvd3MgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciByb3dzVG9SZW1vdmUgPSBPYmplY3Qua2V5cyh0aGlzLnJvd3NJbkJvZHlDb250YWluZXIpO1xyXG4gICAgdGhpcy5yZW1vdmVWaXJ0dWFsUm93cyhyb3dzVG9SZW1vdmUpO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5vblNlbGVjdEFsbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNoZWNrZWQgPSB0aGlzLmVTZWxlY3RBbGwuY2hlY2tlZDtcclxuICAgIGlmIChjaGVja2VkKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZWxlY3RFdmVyeXRoaW5nKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubW9kZWwuc2VsZWN0Tm90aGluZygpO1xyXG4gICAgfVxyXG4gICAgdGhpcy51cGRhdGVBbGxDaGVja2JveGVzKGNoZWNrZWQpO1xyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2soKTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUudXBkYXRlQWxsQ2hlY2tib3hlcyA9IGZ1bmN0aW9uKGNoZWNrZWQpIHtcclxuICAgIHZhciBjdXJyZW50bHlEaXNwbGF5ZWRDaGVja2JveGVzID0gdGhpcy5lTGlzdENvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiW2ZpbHRlci1jaGVja2JveD10cnVlXVwiKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY3VycmVudGx5RGlzcGxheWVkQ2hlY2tib3hlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBjdXJyZW50bHlEaXNwbGF5ZWRDaGVja2JveGVzW2ldLmNoZWNrZWQgPSBjaGVja2VkO1xyXG4gICAgfVxyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5hZGRTY3JvbGxMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICB0aGlzLmVMaXN0Vmlld3BvcnQuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBfdGhpcy5kcmF3VmlydHVhbFJvd3MoKTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5nZXRBcGkgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmFwaTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUuY3JlYXRlQXBpID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbW9kZWwgPSB0aGlzLm1vZGVsO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5hcGkgPSB7XHJcbiAgICAgICAgc2V0TWluaUZpbHRlcjogZnVuY3Rpb24obmV3TWluaUZpbHRlcikge1xyXG4gICAgICAgICAgICBtb2RlbC5zZXRNaW5pRmlsdGVyKG5ld01pbmlGaWx0ZXIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0TWluaUZpbHRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5nZXRNaW5pRmlsdGVyKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZWxlY3RFdmVyeXRoaW5nOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbW9kZWwuc2VsZWN0RXZlcnl0aGluZygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNGaWx0ZXJBY3RpdmU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuaXNGaWx0ZXJBY3RpdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdE5vdGhpbmc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBtb2RlbC5zZWxlY3ROb3RoaW5nKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1bnNlbGVjdFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICBtb2RlbC51bnNlbGVjdFZhbHVlKHZhbHVlKTtcclxuICAgICAgICAgICAgdGhhdC5yZWZyZXNoVmlydHVhbFJvd3MoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICBtb2RlbC5zZWxlY3RWYWx1ZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIHRoYXQucmVmcmVzaFZpcnR1YWxSb3dzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc1ZhbHVlU2VsZWN0ZWQ6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5pc1ZhbHVlU2VsZWN0ZWQodmFsdWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNFdmVyeXRoaW5nU2VsZWN0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuaXNFdmVyeXRoaW5nU2VsZWN0ZWQoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzTm90aGluZ1NlbGVjdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmlzTm90aGluZ1NlbGVjdGVkKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRVbmlxdWVWYWx1ZUNvdW50OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmdldFVuaXF1ZVZhbHVlQ291bnQoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFVuaXF1ZVZhbHVlOiBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuZ2V0VW5pcXVlVmFsdWUoaW5kZXgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0TW9kZWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuZ2V0TW9kZWwoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldE1vZGVsOiBmdW5jdGlvbihkYXRhTW9kZWwpIHtcclxuICAgICAgICAgICAgbW9kZWwuc2V0TW9kZWwoZGF0YU1vZGVsKTtcclxuICAgICAgICAgICAgdGhhdC5yZWZyZXNoVmlydHVhbFJvd3MoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZXRGaWx0ZXI7XHJcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcblxyXG5mdW5jdGlvbiBTZXRGaWx0ZXJNb2RlbChjb2xEZWYsIHJvd01vZGVsLCB2YWx1ZUdldHRlcikge1xyXG5cclxuICAgIGlmIChjb2xEZWYuZmlsdGVyUGFyYW1zICYmIGNvbERlZi5maWx0ZXJQYXJhbXMudmFsdWVzKSB7XHJcbiAgICAgICAgdGhpcy51bmlxdWVWYWx1ZXMgPSBjb2xEZWYuZmlsdGVyUGFyYW1zLnZhbHVlcztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVVbmlxdWVWYWx1ZXMocm93TW9kZWwsIGNvbERlZi5maWVsZCwgdmFsdWVHZXR0ZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjb2xEZWYuY29tcGFyYXRvcikge1xyXG4gICAgICAgIHRoaXMudW5pcXVlVmFsdWVzLnNvcnQoY29sRGVmLmNvbXBhcmF0b3IpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnVuaXF1ZVZhbHVlcy5zb3J0KHV0aWxzLmRlZmF1bHRDb21wYXJhdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRpc3BsYXllZFZhbHVlcyA9IHRoaXMudW5pcXVlVmFsdWVzO1xyXG4gICAgdGhpcy5taW5pRmlsdGVyID0gbnVsbDtcclxuICAgIC8vd2UgdXNlIGEgbWFwIHJhdGhlciB0aGFuIGFuIGFycmF5IGZvciB0aGUgc2VsZWN0ZWQgdmFsdWVzIGFzIHRoZSBsb29rdXBcclxuICAgIC8vZm9yIGEgbWFwIGlzIG11Y2ggZmFzdGVyIHRoYW4gdGhlIGxvb2t1cCBmb3IgYW4gYXJyYXksIGVzcGVjaWFsbHkgd2hlblxyXG4gICAgLy90aGUgbGVuZ3RoIG9mIHRoZSBhcnJheSBpcyB0aG91c2FuZHMgb2YgcmVjb3JkcyBsb25nXHJcbiAgICB0aGlzLnNlbGVjdGVkVmFsdWVzTWFwID0ge307XHJcbiAgICB0aGlzLnNlbGVjdEV2ZXJ5dGhpbmcoKTtcclxufVxyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmNyZWF0ZVVuaXF1ZVZhbHVlcyA9IGZ1bmN0aW9uKHJvd01vZGVsLCBrZXksIHZhbHVlR2V0dGVyKSB7XHJcbiAgICB2YXIgdW5pcXVlQ2hlY2sgPSB7fTtcclxuICAgIHZhciByZXN1bHQgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiByZWN1cnNpdmVseVByb2Nlc3Mobm9kZXMpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgICAgIGlmIChub2RlLmdyb3VwICYmICFub2RlLmZvb3Rlcikge1xyXG4gICAgICAgICAgICAgICAgLy8gZ3JvdXAgbm9kZSwgc28gZGlnIGRlZXBlclxyXG4gICAgICAgICAgICAgICAgcmVjdXJzaXZlbHlQcm9jZXNzKG5vZGUuY2hpbGRyZW4pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVHZXR0ZXIobm9kZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IFwiXCIgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghdW5pcXVlQ2hlY2suaGFzT3duUHJvcGVydHkodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHVuaXF1ZUNoZWNrW3ZhbHVlXSA9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRvcExldmVsTm9kZXMgPSByb3dNb2RlbC5nZXRUb3BMZXZlbE5vZGVzKCk7XHJcbiAgICByZWN1cnNpdmVseVByb2Nlc3ModG9wTGV2ZWxOb2Rlcyk7XHJcblxyXG4gICAgdGhpcy51bmlxdWVWYWx1ZXMgPSByZXN1bHQ7XHJcbn07XHJcblxyXG4vL3NldHMgbWluaSBmaWx0ZXIuIHJldHVybnMgdHJ1ZSBpZiBpdCBjaGFuZ2VkIGZyb20gbGFzdCB2YWx1ZSwgb3RoZXJ3aXNlIGZhbHNlXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5zZXRNaW5pRmlsdGVyID0gZnVuY3Rpb24obmV3TWluaUZpbHRlcikge1xyXG4gICAgbmV3TWluaUZpbHRlciA9IHV0aWxzLm1ha2VOdWxsKG5ld01pbmlGaWx0ZXIpO1xyXG4gICAgaWYgKHRoaXMubWluaUZpbHRlciA9PT0gbmV3TWluaUZpbHRlcikge1xyXG4gICAgICAgIC8vZG8gbm90aGluZyBpZiBmaWx0ZXIgaGFzIG5vdCBjaGFuZ2VkXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy5taW5pRmlsdGVyID0gbmV3TWluaUZpbHRlcjtcclxuICAgIHRoaXMuZmlsdGVyRGlzcGxheWVkVmFsdWVzKCk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5nZXRNaW5pRmlsdGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5taW5pRmlsdGVyO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmZpbHRlckRpc3BsYXllZFZhbHVlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gaWYgbm8gZmlsdGVyLCBqdXN0IHVzZSB0aGUgdW5pcXVlIHZhbHVlc1xyXG4gICAgaWYgKHRoaXMubWluaUZpbHRlciA9PT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMuZGlzcGxheWVkVmFsdWVzID0gdGhpcy51bmlxdWVWYWx1ZXM7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGZpbHRlciBwcmVzZW50LCB3ZSBmaWx0ZXIgZG93biB0aGUgbGlzdFxyXG4gICAgdGhpcy5kaXNwbGF5ZWRWYWx1ZXMgPSBbXTtcclxuICAgIHZhciBtaW5pRmlsdGVyVXBwZXJDYXNlID0gdGhpcy5taW5pRmlsdGVyLnRvVXBwZXJDYXNlKCk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMudW5pcXVlVmFsdWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHZhciB1bmlxdWVWYWx1ZSA9IHRoaXMudW5pcXVlVmFsdWVzW2ldO1xyXG4gICAgICAgIGlmICh1bmlxdWVWYWx1ZSAhPT0gbnVsbCAmJiB1bmlxdWVWYWx1ZS50b1N0cmluZygpLnRvVXBwZXJDYXNlKCkuaW5kZXhPZihtaW5pRmlsdGVyVXBwZXJDYXNlKSA+PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheWVkVmFsdWVzLnB1c2godW5pcXVlVmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5TZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuZ2V0RGlzcGxheWVkVmFsdWVDb3VudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZGlzcGxheWVkVmFsdWVzLmxlbmd0aDtcclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5nZXREaXNwbGF5ZWRWYWx1ZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICByZXR1cm4gdGhpcy5kaXNwbGF5ZWRWYWx1ZXNbaW5kZXhdO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLnNlbGVjdEV2ZXJ5dGhpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjb3VudCA9IHRoaXMudW5pcXVlVmFsdWVzLmxlbmd0aDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMudW5pcXVlVmFsdWVzW2ldO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRWYWx1ZXNNYXBbdmFsdWVdID0gbnVsbDtcclxuICAgIH1cclxuICAgIHRoaXMuc2VsZWN0ZWRWYWx1ZXNDb3VudCA9IGNvdW50O1xyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmlzRmlsdGVyQWN0aXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy51bmlxdWVWYWx1ZXMubGVuZ3RoICE9PSB0aGlzLnNlbGVjdGVkVmFsdWVzQ291bnQ7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuc2VsZWN0Tm90aGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5zZWxlY3RlZFZhbHVlc01hcCA9IHt9O1xyXG4gICAgdGhpcy5zZWxlY3RlZFZhbHVlc0NvdW50ID0gMDtcclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5nZXRVbmlxdWVWYWx1ZUNvdW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy51bmlxdWVWYWx1ZXMubGVuZ3RoO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmdldFVuaXF1ZVZhbHVlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIHJldHVybiB0aGlzLnVuaXF1ZVZhbHVlc1tpbmRleF07XHJcbn07XHJcblxyXG5TZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUudW5zZWxlY3RWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICBpZiAodGhpcy5zZWxlY3RlZFZhbHVlc01hcFt2YWx1ZV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnNlbGVjdGVkVmFsdWVzTWFwW3ZhbHVlXTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkVmFsdWVzQ291bnQtLTtcclxuICAgIH1cclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5zZWxlY3RWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICBpZiAodGhpcy5zZWxlY3RlZFZhbHVlc01hcFt2YWx1ZV0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRWYWx1ZXNNYXBbdmFsdWVdID0gbnVsbDtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkVmFsdWVzQ291bnQrKztcclxuICAgIH1cclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5pc1ZhbHVlU2VsZWN0ZWQgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRWYWx1ZXNNYXBbdmFsdWVdICE9PSB1bmRlZmluZWQ7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuaXNFdmVyeXRoaW5nU2VsZWN0ZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLnVuaXF1ZVZhbHVlcy5sZW5ndGggPT09IHRoaXMuc2VsZWN0ZWRWYWx1ZXNDb3VudDtcclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5pc05vdGhpbmdTZWxlY3RlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudW5pcXVlVmFsdWVzLmxlbmd0aCA9PT0gMDtcclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5nZXRNb2RlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCF0aGlzLmlzRmlsdGVyQWN0aXZlKCkpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIHZhciBzZWxlY3RlZFZhbHVlcyA9IFtdO1xyXG4gICAgdXRpbHMuaXRlcmF0ZU9iamVjdCh0aGlzLnNlbGVjdGVkVmFsdWVzTWFwLCBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICBzZWxlY3RlZFZhbHVlcy5wdXNoKGtleSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBzZWxlY3RlZFZhbHVlcztcclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5zZXRNb2RlbCA9IGZ1bmN0aW9uKG1vZGVsKSB7XHJcbiAgICBpZiAobW9kZWwpIHtcclxuICAgICAgICB0aGlzLnNlbGVjdE5vdGhpbmcoKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaTxtb2RlbC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgbmV3VmFsdWUgPSBtb2RlbFtpXTtcclxuICAgICAgICAgICAgaWYgKHRoaXMudW5pcXVlVmFsdWVzLmluZGV4T2YobmV3VmFsdWUpPj0wKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdFZhbHVlKG1vZGVsW2ldKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignVmFsdWUgJyArIG5ld1ZhbHVlICsgJyBpcyBub3QgYSB2YWxpZCB2YWx1ZSBmb3IgZmlsdGVyJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0RXZlcnl0aGluZygpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZXRGaWx0ZXJNb2RlbDtcclxuIiwidmFyIHRlbXBsYXRlID0gW1xyXG4gICAgJzxkaXY+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLWZpbHRlci1oZWFkZXItY29udGFpbmVyXCI+JyxcclxuICAgICcgICAgICAgIDxpbnB1dCBjbGFzcz1cImFnLWZpbHRlci1maWx0ZXJcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiW1NFQVJDSC4uLl1cIi8+JyxcclxuICAgICcgICAgPC9kaXY+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLWZpbHRlci1oZWFkZXItY29udGFpbmVyXCI+JyxcclxuICAgICcgICAgICAgIDxsYWJlbD4nLFxyXG4gICAgJyAgICAgICAgICAgIDxpbnB1dCBpZD1cInNlbGVjdEFsbFwiIHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwiYWctZmlsdGVyLWNoZWNrYm94XCIvPicsXHJcbiAgICAnICAgICAgICAgICAgKFtTRUxFQ1QgQUxMXSknLFxyXG4gICAgJyAgICAgICAgPC9sYWJlbD4nLFxyXG4gICAgJyAgICA8L2Rpdj4nLFxyXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYWctZmlsdGVyLWxpc3Qtdmlld3BvcnRcIj4nLFxyXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cImFnLWZpbHRlci1saXN0LWNvbnRhaW5lclwiPicsXHJcbiAgICAnICAgICAgICAgICAgPGRpdiBpZD1cIml0ZW1Gb3JSZXBlYXRcIiBjbGFzcz1cImFnLWZpbHRlci1pdGVtXCI+JyxcclxuICAgICcgICAgICAgICAgICAgICAgPGxhYmVsPicsXHJcbiAgICAnICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJhZy1maWx0ZXItY2hlY2tib3hcIiBmaWx0ZXItY2hlY2tib3g9XCJ0cnVlXCIvPicsXHJcbiAgICAnICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImFnLWZpbHRlci12YWx1ZVwiPjwvc3Bhbj4nLFxyXG4gICAgJyAgICAgICAgICAgICAgICA8L2xhYmVsPicsXHJcbiAgICAnICAgICAgICAgICAgPC9kaXY+JyxcclxuICAgICcgICAgICAgIDwvZGl2PicsXHJcbiAgICAnICAgIDwvZGl2PicsXHJcbiAgICAnPC9kaXY+JyxcclxuXS5qb2luKCcnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XHJcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGV4dEZpbHRlclRlbXBsYXRlJyk7XHJcblxyXG52YXIgQ09OVEFJTlMgPSAxO1xyXG52YXIgRVFVQUxTID0gMjtcclxudmFyIFNUQVJUU19XSVRIID0gMztcclxudmFyIEVORFNfV0lUSCA9IDQ7XHJcblxyXG5mdW5jdGlvbiBUZXh0RmlsdGVyKHBhcmFtcykge1xyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2sgPSBwYXJhbXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrO1xyXG4gICAgdGhpcy5sb2NhbGVUZXh0RnVuYyA9IHBhcmFtcy5sb2NhbGVUZXh0RnVuYztcclxuICAgIHRoaXMudmFsdWVHZXR0ZXIgPSBwYXJhbXMudmFsdWVHZXR0ZXI7XHJcbiAgICB0aGlzLmNyZWF0ZUd1aSgpO1xyXG4gICAgdGhpcy5maWx0ZXJUZXh0ID0gbnVsbDtcclxuICAgIHRoaXMuZmlsdGVyVHlwZSA9IENPTlRBSU5TO1xyXG4gICAgdGhpcy5jcmVhdGVBcGkoKTtcclxufVxyXG5cclxuLyogcHVibGljICovXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLmFmdGVyR3VpQXR0YWNoZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZUZpbHRlclRleHRGaWVsZC5mb2N1cygpO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLmRvZXNGaWx0ZXJQYXNzID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKCF0aGlzLmZpbHRlclRleHQpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHZhciB2YWx1ZSA9IHRoaXMudmFsdWVHZXR0ZXIobm9kZSk7XHJcbiAgICBpZiAoIXZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdmFyIHZhbHVlTG93ZXJDYXNlID0gdmFsdWUudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgc3dpdGNoICh0aGlzLmZpbHRlclR5cGUpIHtcclxuICAgICAgICBjYXNlIENPTlRBSU5TOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVMb3dlckNhc2UuaW5kZXhPZih0aGlzLmZpbHRlclRleHQpID49IDA7XHJcbiAgICAgICAgY2FzZSBFUVVBTFM6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZUxvd2VyQ2FzZSA9PT0gdGhpcy5maWx0ZXJUZXh0O1xyXG4gICAgICAgIGNhc2UgU1RBUlRTX1dJVEg6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZUxvd2VyQ2FzZS5pbmRleE9mKHRoaXMuZmlsdGVyVGV4dCkgPT09IDA7XHJcbiAgICAgICAgY2FzZSBFTkRTX1dJVEg6XHJcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHZhbHVlTG93ZXJDYXNlLmluZGV4T2YodGhpcy5maWx0ZXJUZXh0KTtcclxuICAgICAgICAgICAgcmV0dXJuIGluZGV4ID49IDAgJiYgaW5kZXggPT09ICh2YWx1ZUxvd2VyQ2FzZS5sZW5ndGggLSB0aGlzLmZpbHRlclRleHQubGVuZ3RoKTtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvLyBzaG91bGQgbmV2ZXIgaGFwcGVuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbnZhbGlkIGZpbHRlciB0eXBlICcgKyB0aGlzLmZpbHRlclR5cGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuVGV4dEZpbHRlci5wcm90b3R5cGUuZ2V0R3VpID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lR3VpO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLmlzRmlsdGVyQWN0aXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJUZXh0ICE9PSBudWxsO1xyXG59O1xyXG5cclxuVGV4dEZpbHRlci5wcm90b3R5cGUuY3JlYXRlVGVtcGxhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0ZW1wbGF0ZVxyXG4gICAgICAgIC5yZXBsYWNlKCdbRklMVEVSLi4uXScsIHRoaXMubG9jYWxlVGV4dEZ1bmMoJ2ZpbHRlck9vbycsICdGaWx0ZXIuLi4nKSlcclxuICAgICAgICAucmVwbGFjZSgnW0VRVUFMU10nLCB0aGlzLmxvY2FsZVRleHRGdW5jKCdlcXVhbHMnLCAnRXF1YWxzJykpXHJcbiAgICAgICAgLnJlcGxhY2UoJ1tDT05UQUlOU10nLCB0aGlzLmxvY2FsZVRleHRGdW5jKCdjb250YWlucycsICdDb250YWlucycpKVxyXG4gICAgICAgIC5yZXBsYWNlKCdbU1RBUlRTIFdJVEhdJywgdGhpcy5sb2NhbGVUZXh0RnVuYygnc3RhcnRzV2l0aCcsICdTdGFydHMgd2l0aCcpKVxyXG4gICAgICAgIC5yZXBsYWNlKCdbRU5EUyBXSVRIXScsIHRoaXMubG9jYWxlVGV4dEZ1bmMoJ2VuZHNXaXRoJywgJ0VuZHMgd2l0aCcpKVxyXG47XHJcbn07XHJcblxyXG4nPG9wdGlvbiB2YWx1ZT1cIjFcIj5Db250YWluczwvb3B0aW9uPicsXHJcbiAgICAnPG9wdGlvbiB2YWx1ZT1cIjJcIj5FcXVhbHM8L29wdGlvbj4nLFxyXG4gICAgJzxvcHRpb24gdmFsdWU9XCIzXCI+U3RhcnRzIHdpdGg8L29wdGlvbj4nLFxyXG4gICAgJzxvcHRpb24gdmFsdWU9XCI0XCI+RW5kcyB3aXRoPC9vcHRpb24+JyxcclxuXHJcblxyXG5UZXh0RmlsdGVyLnByb3RvdHlwZS5jcmVhdGVHdWkgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZUd1aSA9IHV0aWxzLmxvYWRUZW1wbGF0ZSh0aGlzLmNyZWF0ZVRlbXBsYXRlKCkpO1xyXG4gICAgdGhpcy5lRmlsdGVyVGV4dEZpZWxkID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIjZmlsdGVyVGV4dFwiKTtcclxuICAgIHRoaXMuZVR5cGVTZWxlY3QgPSB0aGlzLmVHdWkucXVlcnlTZWxlY3RvcihcIiNmaWx0ZXJUeXBlXCIpO1xyXG5cclxuICAgIHV0aWxzLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuZUZpbHRlclRleHRGaWVsZCwgdGhpcy5vbkZpbHRlckNoYW5nZWQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVUeXBlU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgdGhpcy5vblR5cGVDaGFuZ2VkLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuVGV4dEZpbHRlci5wcm90b3R5cGUub25UeXBlQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5maWx0ZXJUeXBlID0gcGFyc2VJbnQodGhpcy5lVHlwZVNlbGVjdC52YWx1ZSk7XHJcbiAgICB0aGlzLmZpbHRlckNoYW5nZWRDYWxsYmFjaygpO1xyXG59O1xyXG5cclxuVGV4dEZpbHRlci5wcm90b3R5cGUub25GaWx0ZXJDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZmlsdGVyVGV4dCA9IHV0aWxzLm1ha2VOdWxsKHRoaXMuZUZpbHRlclRleHRGaWVsZC52YWx1ZSk7XHJcbiAgICBpZiAoZmlsdGVyVGV4dCAmJiBmaWx0ZXJUZXh0LnRyaW0oKSA9PT0gJycpIHtcclxuICAgICAgICBmaWx0ZXJUZXh0ID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmIChmaWx0ZXJUZXh0KSB7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJUZXh0ID0gZmlsdGVyVGV4dC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmZpbHRlclRleHQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2soKTtcclxufTtcclxuXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLmNyZWF0ZUFwaSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5hcGkgPSB7XHJcbiAgICAgICAgRVFVQUxTOiBFUVVBTFMsXHJcbiAgICAgICAgQ09OVEFJTlM6IENPTlRBSU5TLFxyXG4gICAgICAgIFNUQVJUU19XSVRIOiBTVEFSVFNfV0lUSCxcclxuICAgICAgICBFTkRTX1dJVEg6IEVORFNfV0lUSCxcclxuICAgICAgICBzZXRUeXBlOiBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICAgICAgICAgIHRoYXQuZmlsdGVyVHlwZSA9IHR5cGU7XHJcbiAgICAgICAgICAgIHRoYXQuZVR5cGVTZWxlY3QudmFsdWUgPSB0eXBlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0RmlsdGVyOiBmdW5jdGlvbihmaWx0ZXIpIHtcclxuICAgICAgICAgICAgZmlsdGVyID0gdXRpbHMubWFrZU51bGwoZmlsdGVyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuZmlsdGVyVGV4dCA9IGZpbHRlci50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5lRmlsdGVyVGV4dEZpZWxkLnZhbHVlID0gZmlsdGVyO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5maWx0ZXJUZXh0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoYXQuZUZpbHRlclRleHRGaWVsZC52YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFR5cGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5maWx0ZXJUeXBlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0RmlsdGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZmlsdGVyVGV4dDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldE1vZGVsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoYXQuaXNGaWx0ZXJBY3RpdmUoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiB0aGF0LmZpbHRlclR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyOiB0aGF0LmZpbHRlclRleHRcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0TW9kZWw6IGZ1bmN0aW9uKGRhdGFNb2RlbCkge1xyXG4gICAgICAgICAgICBpZiAoZGF0YU1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFR5cGUoZGF0YU1vZGVsLnR5cGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRGaWx0ZXIoZGF0YU1vZGVsLmZpbHRlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEZpbHRlcihudWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG5UZXh0RmlsdGVyLnByb3RvdHlwZS5nZXRBcGkgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmFwaTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGV4dEZpbHRlcjtcclxuIiwidmFyIHRlbXBsYXRlID0gW1xyXG4gICAgJzxkaXY+JyxcclxuICAgICc8ZGl2PicsXHJcbiAgICAnPHNlbGVjdCBjbGFzcz1cImFnLWZpbHRlci1zZWxlY3RcIiBpZD1cImZpbHRlclR5cGVcIj4nLFxyXG4gICAgJzxvcHRpb24gdmFsdWU9XCIxXCI+W0NPTlRBSU5TXTwvb3B0aW9uPicsXHJcbiAgICAnPG9wdGlvbiB2YWx1ZT1cIjJcIj5bRVFVQUxTXTwvb3B0aW9uPicsXHJcbiAgICAnPG9wdGlvbiB2YWx1ZT1cIjNcIj5bU1RBUlRTIFdJVEhdPC9vcHRpb24+JyxcclxuICAgICc8b3B0aW9uIHZhbHVlPVwiNFwiPltFTkRTIFdJVEhdPC9vcHRpb24+JyxcclxuICAgICc8L3NlbGVjdD4nLFxyXG4gICAgJzwvZGl2PicsXHJcbiAgICAnPGRpdj4nLFxyXG4gICAgJzxpbnB1dCBjbGFzcz1cImFnLWZpbHRlci1maWx0ZXJcIiBpZD1cImZpbHRlclRleHRcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiW0ZJTFRFUi4uLl1cIi8+JyxcclxuICAgICc8L2Rpdj4nLFxyXG4gICAgJzwvZGl2PicsXHJcbl0uam9pbignJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xyXG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcbnZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xyXG52YXIgR3JpZE9wdGlvbnNXcmFwcGVyID0gcmVxdWlyZSgnLi9ncmlkT3B0aW9uc1dyYXBwZXInKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS5qcycpO1xyXG52YXIgdGVtcGxhdGVOb1Njcm9sbHMgPSByZXF1aXJlKCcuL3RlbXBsYXRlTm9TY3JvbGxzLmpzJyk7XHJcbnZhciBTZWxlY3Rpb25Db250cm9sbGVyID0gcmVxdWlyZSgnLi9zZWxlY3Rpb25Db250cm9sbGVyJyk7XHJcbnZhciBGaWx0ZXJNYW5hZ2VyID0gcmVxdWlyZSgnLi9maWx0ZXIvZmlsdGVyTWFuYWdlcicpO1xyXG52YXIgU2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5ID0gcmVxdWlyZSgnLi9zZWxlY3Rpb25SZW5kZXJlckZhY3RvcnknKTtcclxudmFyIENvbHVtbkNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL2NvbHVtbkNvbnRyb2xsZXInKTtcclxudmFyIFJvd1JlbmRlcmVyID0gcmVxdWlyZSgnLi9yb3dSZW5kZXJlcicpO1xyXG52YXIgSGVhZGVyUmVuZGVyZXIgPSByZXF1aXJlKCcuL2hlYWRlclJlbmRlcmVyJyk7XHJcbnZhciBJbk1lbW9yeVJvd0NvbnRyb2xsZXIgPSByZXF1aXJlKCcuL2luTWVtb3J5Um93Q29udHJvbGxlcicpO1xyXG52YXIgVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyID0gcmVxdWlyZSgnLi92aXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXInKTtcclxudmFyIFBhZ2luYXRpb25Db250cm9sbGVyID0gcmVxdWlyZSgnLi9wYWdpbmF0aW9uQ29udHJvbGxlcicpO1xyXG52YXIgRXhwcmVzc2lvblNlcnZpY2UgPSByZXF1aXJlKCcuL2V4cHJlc3Npb25TZXJ2aWNlJyk7XHJcbnZhciBUZW1wbGF0ZVNlcnZpY2UgPSByZXF1aXJlKCcuL3RlbXBsYXRlU2VydmljZScpO1xyXG5cclxuZnVuY3Rpb24gR3JpZChlR3JpZERpdiwgZ3JpZE9wdGlvbnMsICRzY29wZSwgJGNvbXBpbGUsIHF1aWNrRmlsdGVyT25TY29wZSkge1xyXG5cclxuICAgIHRoaXMuYWRkRW52aXJvbm1lbnRDbGFzc2VzKGVHcmlkRGl2KTtcclxuXHJcbiAgICB0aGlzLmdyaWRPcHRpb25zID0gZ3JpZE9wdGlvbnM7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IG5ldyBHcmlkT3B0aW9uc1dyYXBwZXIodGhpcy5ncmlkT3B0aW9ucyk7XHJcblxyXG4gICAgdmFyIHVzZVNjcm9sbHMgPSAhdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpO1xyXG4gICAgaWYgKHVzZVNjcm9sbHMpIHtcclxuICAgICAgICBlR3JpZERpdi5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZUdyaWREaXYuaW5uZXJIVE1MID0gdGVtcGxhdGVOb1Njcm9sbHM7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5xdWlja0ZpbHRlciA9IG51bGw7XHJcblxyXG4gICAgLy8gaWYgdXNpbmcgYW5ndWxhciwgd2F0Y2ggZm9yIHF1aWNrRmlsdGVyIGNoYW5nZXNcclxuICAgIGlmICgkc2NvcGUpIHtcclxuICAgICAgICAkc2NvcGUuJHdhdGNoKHF1aWNrRmlsdGVyT25TY29wZSwgZnVuY3Rpb24obmV3RmlsdGVyKSB7XHJcbiAgICAgICAgICAgIHRoYXQub25RdWlja0ZpbHRlckNoYW5nZWQobmV3RmlsdGVyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnZpcnR1YWxSb3dDYWxsYmFja3MgPSB7fTtcclxuXHJcbiAgICB0aGlzLmFkZEFwaSgpO1xyXG4gICAgdGhpcy5maW5kQWxsRWxlbWVudHMoZUdyaWREaXYpO1xyXG4gICAgdGhpcy5jcmVhdGVBbmRXaXJlQmVhbnMoJHNjb3BlLCAkY29tcGlsZSwgZUdyaWREaXYsIHVzZVNjcm9sbHMpO1xyXG5cclxuICAgIHRoaXMuc2Nyb2xsV2lkdGggPSB1dGlscy5nZXRTY3JvbGxiYXJXaWR0aCgpO1xyXG5cclxuICAgIHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyLnNldEFsbFJvd3ModGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QWxsUm93cygpKTtcclxuXHJcbiAgICBpZiAodXNlU2Nyb2xscykge1xyXG4gICAgICAgIHRoaXMuYWRkU2Nyb2xsTGlzdGVuZXIoKTtcclxuICAgICAgICB0aGlzLnNldEJvZHlTaXplKCk7IC8vc2V0dGluZyBzaXplcyBvZiBib2R5IChjb250YWluaW5nIHZpZXdwb3J0cyksIGRvZXNuJ3QgY2hhbmdlIGNvbnRhaW5lciBzaXplc1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGRvbmUgd2hlbiBjb2xzIGNoYW5nZVxyXG4gICAgdGhpcy5zZXR1cENvbHVtbnMoKTtcclxuXHJcbiAgICAvLyBkb25lIHdoZW4gcm93cyBjaGFuZ2VcclxuICAgIHRoaXMudXBkYXRlTW9kZWxBbmRSZWZyZXNoKGNvbnN0YW50cy5TVEVQX0VWRVJZVEhJTkcpO1xyXG5cclxuICAgIC8vIGZsYWcgdG8gbWFyayB3aGVuIHRoZSBkaXJlY3RpdmUgaXMgZGVzdHJveWVkXHJcbiAgICB0aGlzLmZpbmlzaGVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gaWYgbm8gZGF0YSBwcm92aWRlZCBpbml0aWFsbHksIGFuZCBub3QgZG9pbmcgaW5maW5pdGUgc2Nyb2xsaW5nLCBzaG93IHRoZSBsb2FkaW5nIHBhbmVsXHJcbiAgICB2YXIgc2hvd0xvYWRpbmcgPSAhdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QWxsUm93cygpICYmICF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc1ZpcnR1YWxQYWdpbmcoKTtcclxuICAgIHRoaXMuc2hvd0xvYWRpbmdQYW5lbChzaG93TG9hZGluZyk7XHJcblxyXG4gICAgLy8gaWYgZGF0YXNvdXJjZSBwcm92aWRlZCwgdXNlIGl0XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0RGF0YXNvdXJjZSgpKSB7XHJcbiAgICAgICAgdGhpcy5zZXREYXRhc291cmNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgcmVhZHkgZnVuY3Rpb24gcHJvdmlkZWQsIHVzZSBpdFxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSZWFkeSgpID09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSZWFkeSgpKGdyaWRPcHRpb25zLmFwaSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkdyaWQucHJvdG90eXBlLmFkZEVudmlyb25tZW50Q2xhc3NlcyA9IGZ1bmN0aW9uKGVHcmlkRGl2KSB7XHJcbiAgICB2YXIgcGxhdGZvcm1BbmRCcm93c2VyID0gJ2FnLWVudi0nICsgY29uc3RhbnRzLlBMQVRGT1JNICsgXCItXCIgKyBjb25zdGFudHMuQlJPV1NFUjtcclxuICAgIHV0aWxzLmFkZENzc0NsYXNzKGVHcmlkRGl2LCBwbGF0Zm9ybUFuZEJyb3dzZXIpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuY3JlYXRlQW5kV2lyZUJlYW5zID0gZnVuY3Rpb24oJHNjb3BlLCAkY29tcGlsZSwgZUdyaWREaXYsIHVzZVNjcm9sbHMpIHtcclxuXHJcbiAgICAvLyBtYWtlIGxvY2FsIHJlZmVyZW5jZXMsIHRvIG1ha2UgdGhlIGJlbG93IG1vcmUgaHVtYW4gcmVhZGFibGVcclxuICAgIHZhciBncmlkT3B0aW9uc1dyYXBwZXIgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHZhciBncmlkT3B0aW9ucyA9IHRoaXMuZ3JpZE9wdGlvbnM7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFsbCB0aGUgYmVhbnNcclxuICAgIHZhciBzZWxlY3Rpb25Db250cm9sbGVyID0gbmV3IFNlbGVjdGlvbkNvbnRyb2xsZXIoKTtcclxuICAgIHZhciBmaWx0ZXJNYW5hZ2VyID0gbmV3IEZpbHRlck1hbmFnZXIoKTtcclxuICAgIHZhciBzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkgPSBuZXcgU2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5KCk7XHJcbiAgICB2YXIgY29sdW1uQ29udHJvbGxlciA9IG5ldyBDb2x1bW5Db250cm9sbGVyKCk7XHJcbiAgICB2YXIgcm93UmVuZGVyZXIgPSBuZXcgUm93UmVuZGVyZXIoKTtcclxuICAgIHZhciBoZWFkZXJSZW5kZXJlciA9IG5ldyBIZWFkZXJSZW5kZXJlcigpO1xyXG4gICAgdmFyIGluTWVtb3J5Um93Q29udHJvbGxlciA9IG5ldyBJbk1lbW9yeVJvd0NvbnRyb2xsZXIoKTtcclxuICAgIHZhciB2aXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIgPSBuZXcgVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyKCk7XHJcbiAgICB2YXIgZXhwcmVzc2lvblNlcnZpY2UgPSBuZXcgRXhwcmVzc2lvblNlcnZpY2UoKTtcclxuICAgIHZhciB0ZW1wbGF0ZVNlcnZpY2UgPSBuZXcgVGVtcGxhdGVTZXJ2aWNlKCk7XHJcblxyXG4gICAgdmFyIGNvbHVtbk1vZGVsID0gY29sdW1uQ29udHJvbGxlci5nZXRNb2RlbCgpO1xyXG5cclxuICAgIC8vIGluaXRpYWxpc2UgYWxsIHRoZSBiZWFuc1xyXG4gICAgdGVtcGxhdGVTZXJ2aWNlLmluaXQoJHNjb3BlKTtcclxuICAgIHNlbGVjdGlvbkNvbnRyb2xsZXIuaW5pdCh0aGlzLCB0aGlzLmVQYXJlbnRPZlJvd3MsIGdyaWRPcHRpb25zV3JhcHBlciwgJHNjb3BlLCByb3dSZW5kZXJlcik7XHJcbiAgICBmaWx0ZXJNYW5hZ2VyLmluaXQodGhpcywgZ3JpZE9wdGlvbnNXcmFwcGVyLCAkY29tcGlsZSwgJHNjb3BlLCBleHByZXNzaW9uU2VydmljZSwgY29sdW1uTW9kZWwpO1xyXG4gICAgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LmluaXQodGhpcywgc2VsZWN0aW9uQ29udHJvbGxlcik7XHJcbiAgICBjb2x1bW5Db250cm9sbGVyLmluaXQodGhpcywgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LCBncmlkT3B0aW9uc1dyYXBwZXIpO1xyXG4gICAgcm93UmVuZGVyZXIuaW5pdChncmlkT3B0aW9ucywgY29sdW1uTW9kZWwsIGdyaWRPcHRpb25zV3JhcHBlciwgZUdyaWREaXYsIHRoaXMsXHJcbiAgICAgICAgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LCAkY29tcGlsZSwgJHNjb3BlLCBzZWxlY3Rpb25Db250cm9sbGVyLCBleHByZXNzaW9uU2VydmljZSwgdGVtcGxhdGVTZXJ2aWNlLFxyXG4gICAgICAgIHRoaXMuZVBhcmVudE9mUm93cyk7XHJcbiAgICBoZWFkZXJSZW5kZXJlci5pbml0KGdyaWRPcHRpb25zV3JhcHBlciwgY29sdW1uQ29udHJvbGxlciwgY29sdW1uTW9kZWwsIGVHcmlkRGl2LCB0aGlzLCBmaWx0ZXJNYW5hZ2VyLCAkc2NvcGUsICRjb21waWxlKTtcclxuICAgIGluTWVtb3J5Um93Q29udHJvbGxlci5pbml0KGdyaWRPcHRpb25zV3JhcHBlciwgY29sdW1uTW9kZWwsIHRoaXMsIGZpbHRlck1hbmFnZXIsICRzY29wZSwgZXhwcmVzc2lvblNlcnZpY2UpO1xyXG4gICAgdmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLmluaXQocm93UmVuZGVyZXIpO1xyXG5cclxuICAgIC8vIHRoaXMgaXMgYSBjaGlsZCBiZWFuLCBnZXQgYSByZWZlcmVuY2UgYW5kIHBhc3MgaXQgb25cclxuICAgIC8vIENBTiBXRSBERUxFVEUgVEhJUz8gaXQncyBkb25lIGluIHRoZSBzZXREYXRhc291cmNlIHNlY3Rpb25cclxuICAgIHZhciByb3dNb2RlbCA9IGluTWVtb3J5Um93Q29udHJvbGxlci5nZXRNb2RlbCgpO1xyXG4gICAgc2VsZWN0aW9uQ29udHJvbGxlci5zZXRSb3dNb2RlbChyb3dNb2RlbCk7XHJcbiAgICBmaWx0ZXJNYW5hZ2VyLnNldFJvd01vZGVsKHJvd01vZGVsKTtcclxuICAgIHJvd1JlbmRlcmVyLnNldFJvd01vZGVsKHJvd01vZGVsKTtcclxuXHJcbiAgICAvLyBhbmQgdGhlIGxhc3QgYmVhbiwgZG9uZSBpbiBpdCdzIG93biBzZWN0aW9uLCBhcyBpdCdzIG9wdGlvbmFsXHJcbiAgICB2YXIgcGFnaW5hdGlvbkNvbnRyb2xsZXIgPSBudWxsO1xyXG4gICAgaWYgKHVzZVNjcm9sbHMpIHtcclxuICAgICAgICBwYWdpbmF0aW9uQ29udHJvbGxlciA9IG5ldyBQYWdpbmF0aW9uQ29udHJvbGxlcigpO1xyXG4gICAgICAgIHBhZ2luYXRpb25Db250cm9sbGVyLmluaXQodGhpcy5lUGFnaW5nUGFuZWwsIHRoaXMsIGdyaWRPcHRpb25zV3JhcHBlcik7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yb3dNb2RlbCA9IHJvd01vZGVsO1xyXG4gICAgdGhpcy5zZWxlY3Rpb25Db250cm9sbGVyID0gc2VsZWN0aW9uQ29udHJvbGxlcjtcclxuICAgIHRoaXMuY29sdW1uQ29udHJvbGxlciA9IGNvbHVtbkNvbnRyb2xsZXI7XHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsID0gY29sdW1uTW9kZWw7XHJcbiAgICB0aGlzLmluTWVtb3J5Um93Q29udHJvbGxlciA9IGluTWVtb3J5Um93Q29udHJvbGxlcjtcclxuICAgIHRoaXMudmlydHVhbFBhZ2VSb3dDb250cm9sbGVyID0gdmlydHVhbFBhZ2VSb3dDb250cm9sbGVyO1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlciA9IHJvd1JlbmRlcmVyO1xyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlciA9IGhlYWRlclJlbmRlcmVyO1xyXG4gICAgdGhpcy5wYWdpbmF0aW9uQ29udHJvbGxlciA9IHBhZ2luYXRpb25Db250cm9sbGVyO1xyXG4gICAgdGhpcy5maWx0ZXJNYW5hZ2VyID0gZmlsdGVyTWFuYWdlcjtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNob3dBbmRQb3NpdGlvblBhZ2luZ1BhbmVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBubyBwYWdpbmcgd2hlbiBuby1zY3JvbGxzXHJcbiAgICBpZiAoIXRoaXMuZVBhZ2luZ1BhbmVsKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmlzU2hvd1BhZ2luZ1BhbmVsKCkpIHtcclxuICAgICAgICB0aGlzLmVQYWdpbmdQYW5lbC5zdHlsZVsnZGlzcGxheSddID0gJ2lubGluZSc7XHJcbiAgICAgICAgdmFyIGhlaWdodE9mUGFnZXIgPSB0aGlzLmVQYWdpbmdQYW5lbC5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5lQm9keS5zdHlsZVsncGFkZGluZ0JvdHRvbSddID0gaGVpZ2h0T2ZQYWdlciArICdweCc7XHJcbiAgICAgICAgdmFyIGhlaWdodE9mUm9vdCA9IHRoaXMuZVJvb3QuY2xpZW50SGVpZ2h0O1xyXG4gICAgICAgIHZhciB0b3BPZlBhZ2VyID0gaGVpZ2h0T2ZSb290IC0gaGVpZ2h0T2ZQYWdlcjtcclxuICAgICAgICB0aGlzLmVQYWdpbmdQYW5lbC5zdHlsZVsndG9wJ10gPSB0b3BPZlBhZ2VyICsgJ3B4JztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lUGFnaW5nUGFuZWwuc3R5bGVbJ2Rpc3BsYXknXSA9ICdub25lJztcclxuICAgICAgICB0aGlzLmVCb2R5LnN0eWxlWydwYWRkaW5nQm90dG9tJ10gPSBudWxsO1xyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmlzU2hvd1BhZ2luZ1BhbmVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zaG93UGFnaW5nUGFuZWw7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zZXREYXRhc291cmNlID0gZnVuY3Rpb24oZGF0YXNvdXJjZSkge1xyXG4gICAgLy8gaWYgZGF0YXNvdXJjZSBwcm92aWRlZCwgdGhlbiBzZXQgaXRcclxuICAgIGlmIChkYXRhc291cmNlKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5kYXRhc291cmNlID0gZGF0YXNvdXJjZTtcclxuICAgIH1cclxuICAgIC8vIGdldCB0aGUgc2V0IGRhdGFzb3VyY2UgKGlmIG51bGwgd2FzIHBhc3NlZCB0byB0aGlzIG1ldGhvZCxcclxuICAgIC8vIHRoZW4gbmVlZCB0byBnZXQgdGhlIGFjdHVhbCBkYXRhc291cmNlIGZyb20gb3B0aW9uc1xyXG4gICAgdmFyIGRhdGFzb3VyY2VUb1VzZSA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldERhdGFzb3VyY2UoKTtcclxuICAgIHRoaXMuZG9pbmdWaXJ0dWFsUGFnaW5nID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNWaXJ0dWFsUGFnaW5nKCkgJiYgZGF0YXNvdXJjZVRvVXNlO1xyXG4gICAgdGhpcy5kb2luZ1BhZ2luYXRpb24gPSBkYXRhc291cmNlVG9Vc2UgJiYgIXRoaXMuZG9pbmdWaXJ0dWFsUGFnaW5nO1xyXG5cclxuICAgIGlmICh0aGlzLmRvaW5nVmlydHVhbFBhZ2luZykge1xyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkNvbnRyb2xsZXIuc2V0RGF0YXNvdXJjZShudWxsKTtcclxuICAgICAgICB0aGlzLnZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5zZXREYXRhc291cmNlKGRhdGFzb3VyY2VUb1VzZSk7XHJcbiAgICAgICAgdGhpcy5yb3dNb2RlbCA9IHRoaXMudmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLmdldE1vZGVsKCk7XHJcbiAgICAgICAgdGhpcy5zaG93UGFnaW5nUGFuZWwgPSBmYWxzZTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5kb2luZ1BhZ2luYXRpb24pIHtcclxuICAgICAgICB0aGlzLnBhZ2luYXRpb25Db250cm9sbGVyLnNldERhdGFzb3VyY2UoZGF0YXNvdXJjZVRvVXNlKTtcclxuICAgICAgICB0aGlzLnZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5zZXREYXRhc291cmNlKG51bGwpO1xyXG4gICAgICAgIHRoaXMucm93TW9kZWwgPSB0aGlzLmluTWVtb3J5Um93Q29udHJvbGxlci5nZXRNb2RlbCgpO1xyXG4gICAgICAgIHRoaXMuc2hvd1BhZ2luZ1BhbmVsID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uQ29udHJvbGxlci5zZXREYXRhc291cmNlKG51bGwpO1xyXG4gICAgICAgIHRoaXMudmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnNldERhdGFzb3VyY2UobnVsbCk7XHJcbiAgICAgICAgdGhpcy5yb3dNb2RlbCA9IHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyLmdldE1vZGVsKCk7XHJcbiAgICAgICAgdGhpcy5zaG93UGFnaW5nUGFuZWwgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIuc2V0Um93TW9kZWwodGhpcy5yb3dNb2RlbCk7XHJcbiAgICB0aGlzLmZpbHRlck1hbmFnZXIuc2V0Um93TW9kZWwodGhpcy5yb3dNb2RlbCk7XHJcbiAgICB0aGlzLnJvd1JlbmRlcmVyLnNldFJvd01vZGVsKHRoaXMucm93TW9kZWwpO1xyXG5cclxuICAgIC8vIHdlIG1heSBvZiBqdXN0IHNob3duIG9yIGhpZGRlbiB0aGUgcGFnaW5nIHBhbmVsLCBzbyBuZWVkXHJcbiAgICAvLyB0byBnZXQgdGFibGUgdG8gY2hlY2sgdGhlIGJvZHkgc2l6ZSwgd2hpY2ggYWxzbyBoaWRlcyBhbmRcclxuICAgIC8vIHNob3dzIHRoZSBwYWdpbmcgcGFuZWwuXHJcbiAgICB0aGlzLnNldEJvZHlTaXplKCk7XHJcblxyXG4gICAgLy8gYmVjYXVzZSB3ZSBqdXN0IHNldCB0aGUgcm93TW9kZWwsIG5lZWQgdG8gdXBkYXRlIHRoZSBndWlcclxuICAgIHRoaXMucm93UmVuZGVyZXIucmVmcmVzaFZpZXcoKTtcclxufTtcclxuXHJcbi8vIGdldHMgY2FsbGVkIGFmdGVyIGNvbHVtbnMgYXJlIHNob3duIC8gaGlkZGVuIGZyb20gZ3JvdXBzIGV4cGFuZGluZ1xyXG5HcmlkLnByb3RvdHlwZS5yZWZyZXNoSGVhZGVyQW5kQm9keSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci5yZWZyZXNoSGVhZGVyKCk7XHJcbiAgICB0aGlzLmhlYWRlclJlbmRlcmVyLnVwZGF0ZUZpbHRlckljb25zKCk7XHJcbiAgICB0aGlzLmhlYWRlclJlbmRlcmVyLnVwZGF0ZVNvcnRJY29ucygpO1xyXG4gICAgdGhpcy5zZXRCb2R5Q29udGFpbmVyV2lkdGgoKTtcclxuICAgIHRoaXMuc2V0UGlubmVkQ29sQ29udGFpbmVyV2lkdGgoKTtcclxuICAgIHRoaXMucm93UmVuZGVyZXIucmVmcmVzaFZpZXcoKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNldEZpbmlzaGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmZpbmlzaGVkID0gdHJ1ZTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmdldFBvcHVwUGFyZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lUm9vdDtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmdldFF1aWNrRmlsdGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5xdWlja0ZpbHRlcjtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLm9uUXVpY2tGaWx0ZXJDaGFuZ2VkID0gZnVuY3Rpb24obmV3RmlsdGVyKSB7XHJcbiAgICBpZiAobmV3RmlsdGVyID09PSB1bmRlZmluZWQgfHwgbmV3RmlsdGVyID09PSBcIlwiKSB7XHJcbiAgICAgICAgbmV3RmlsdGVyID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnF1aWNrRmlsdGVyICE9PSBuZXdGaWx0ZXIpIHtcclxuICAgICAgICAvL3dhbnQgJ251bGwnIHRvIG1lYW4gdG8gZmlsdGVyLCBzbyByZW1vdmUgdW5kZWZpbmVkIGFuZCBlbXB0eSBzdHJpbmdcclxuICAgICAgICBpZiAobmV3RmlsdGVyID09PSB1bmRlZmluZWQgfHwgbmV3RmlsdGVyID09PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIG5ld0ZpbHRlciA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChuZXdGaWx0ZXIgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgbmV3RmlsdGVyID0gbmV3RmlsdGVyLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucXVpY2tGaWx0ZXIgPSBuZXdGaWx0ZXI7XHJcbiAgICAgICAgdGhpcy5vbkZpbHRlckNoYW5nZWQoKTtcclxuICAgIH1cclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLm9uRmlsdGVyQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy51cGRhdGVNb2RlbEFuZFJlZnJlc2goY29uc3RhbnRzLlNURVBfRklMVEVSKTtcclxuICAgIHRoaXMuaGVhZGVyUmVuZGVyZXIudXBkYXRlRmlsdGVySWNvbnMoKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLm9uUm93Q2xpY2tlZCA9IGZ1bmN0aW9uKGV2ZW50LCByb3dJbmRleCwgbm9kZSkge1xyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLnJvd0NsaWNrZWQpIHtcclxuICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgIGV2ZW50OiBldmVudFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5yb3dDbGlja2VkKHBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gd2UgZG8gbm90IGFsbG93IHNlbGVjdGluZyBncm91cHMgYnkgY2xpY2tpbmcgKGFzIHRoZSBjbGljayBoZXJlIGV4cGFuZHMgdGhlIGdyb3VwKVxyXG4gICAgLy8gc28gcmV0dXJuIGlmIGl0J3MgYSBncm91cCByb3dcclxuICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1ha2luZyBsb2NhbCB2YXJpYWJsZXMgdG8gbWFrZSB0aGUgYmVsb3cgbW9yZSByZWFkYWJsZVxyXG4gICAgdmFyIGdyaWRPcHRpb25zV3JhcHBlciA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4gICAgdmFyIHNlbGVjdGlvbkNvbnRyb2xsZXIgPSB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXI7XHJcblxyXG4gICAgLy8gaWYgbm8gc2VsZWN0aW9uIG1ldGhvZCBlbmFibGVkLCBkbyBub3RoaW5nXHJcbiAgICBpZiAoIWdyaWRPcHRpb25zV3JhcHBlci5pc1Jvd1NlbGVjdGlvbigpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGNsaWNrIHNlbGVjdGlvbiBzdXBwcmVzc2VkLCBkbyBub3RoaW5nXHJcbiAgICBpZiAoZ3JpZE9wdGlvbnNXcmFwcGVyLmlzU3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbigpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGN0cmxLZXkgZm9yIHdpbmRvd3MsIG1ldGFLZXkgZm9yIEFwcGxlXHJcbiAgICB2YXIgY3RybEtleVByZXNzZWQgPSBldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXk7XHJcblxyXG4gICAgdmFyIGRvRGVzZWxlY3QgPSBjdHJsS2V5UHJlc3NlZFxyXG4gICAgICAgICYmIHNlbGVjdGlvbkNvbnRyb2xsZXIuaXNOb2RlU2VsZWN0ZWQobm9kZSlcclxuICAgICAgICAmJiBncmlkT3B0aW9uc1dyYXBwZXIuaXNSb3dEZXNlbGVjdGlvbigpIDtcclxuXHJcbiAgICBpZiAoZG9EZXNlbGVjdCkge1xyXG4gICAgICAgIHNlbGVjdGlvbkNvbnRyb2xsZXIuZGVzZWxlY3ROb2RlKG5vZGUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgdHJ5TXVsdGkgPSBjdHJsS2V5UHJlc3NlZDtcclxuICAgICAgICBzZWxlY3Rpb25Db250cm9sbGVyLnNlbGVjdE5vZGUobm9kZSwgdHJ5TXVsdGkpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0SGVhZGVySGVpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaGVhZGVySGVpZ2h0ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0SGVhZGVySGVpZ2h0KCk7XHJcbiAgICB2YXIgaGVhZGVySGVpZ2h0UGl4ZWxzID0gaGVhZGVySGVpZ2h0ICsgJ3B4JztcclxuICAgIHZhciBkb250VXNlU2Nyb2xscyA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9udFVzZVNjcm9sbHMoKTtcclxuICAgIGlmIChkb250VXNlU2Nyb2xscykge1xyXG4gICAgICAgIHRoaXMuZUhlYWRlckNvbnRhaW5lci5zdHlsZVsnaGVpZ2h0J10gPSBoZWFkZXJIZWlnaHRQaXhlbHM7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZUhlYWRlci5zdHlsZVsnaGVpZ2h0J10gPSBoZWFkZXJIZWlnaHRQaXhlbHM7XHJcbiAgICAgICAgdGhpcy5lQm9keS5zdHlsZVsncGFkZGluZ1RvcCddID0gaGVhZGVySGVpZ2h0UGl4ZWxzO1xyXG4gICAgICAgIHRoaXMuZUxvYWRpbmdQYW5lbC5zdHlsZVsnbWFyZ2luVG9wJ10gPSBoZWFkZXJIZWlnaHRQaXhlbHM7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zaG93TG9hZGluZ1BhbmVsID0gZnVuY3Rpb24oc2hvdykge1xyXG4gICAgaWYgKHNob3cpIHtcclxuICAgICAgICAvLyBzZXR0aW5nIGRpc3BsYXkgdG8gbnVsbCwgYWN0dWFsbHkgaGFzIHRoZSBpbXBhY3Qgb2Ygc2V0dGluZyBpdFxyXG4gICAgICAgIC8vIHRvICd0YWJsZScsIGFzIHRoaXMgaXMgcGFydCBvZiB0aGUgYWctbG9hZGluZy1wYW5lbCBjb3JlIHN0eWxlXHJcbiAgICAgICAgdGhpcy5lTG9hZGluZ1BhbmVsLnN0eWxlLmRpc3BsYXkgPSAndGFibGUnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVMb2FkaW5nUGFuZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH1cclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNldHVwQ29sdW1ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5zZXRIZWFkZXJIZWlnaHQoKTtcclxuICAgIHRoaXMuY29sdW1uQ29udHJvbGxlci5zZXRDb2x1bW5zKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbHVtbkRlZnMoKSk7XHJcbiAgICB0aGlzLnNob3dQaW5uZWRDb2xDb250YWluZXJzSWZOZWVkZWQoKTtcclxuICAgIHRoaXMuaGVhZGVyUmVuZGVyZXIucmVmcmVzaEhlYWRlcigpO1xyXG4gICAgaWYgKCF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0RvbnRVc2VTY3JvbGxzKCkpIHtcclxuICAgICAgICB0aGlzLnNldFBpbm5lZENvbENvbnRhaW5lcldpZHRoKCk7XHJcbiAgICAgICAgdGhpcy5zZXRCb2R5Q29udGFpbmVyV2lkdGgoKTtcclxuICAgIH1cclxuICAgIHRoaXMuaGVhZGVyUmVuZGVyZXIudXBkYXRlRmlsdGVySWNvbnMoKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNldEJvZHlDb250YWluZXJXaWR0aCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG1haW5Sb3dXaWR0aCA9IHRoaXMuY29sdW1uTW9kZWwuZ2V0Qm9keUNvbnRhaW5lcldpZHRoKCkgKyBcInB4XCI7XHJcbiAgICB0aGlzLmVCb2R5Q29udGFpbmVyLnN0eWxlLndpZHRoID0gbWFpblJvd1dpZHRoO1xyXG59O1xyXG5cclxuLy8gcm93c1RvUmVmcmVzaCBpcyBhdCB3aGF0IGluZGV4IHRvIHN0YXJ0IHJlZnJlc2hpbmcgdGhlIHJvd3MuIHRoZSBhc3N1bXB0aW9uIGlzXHJcbi8vIGlmIHdlIGFyZSBleHBhbmRpbmcgb3IgY29sbGFwc2luZyBhIGdyb3VwLCB0aGVuIG9ubHkgaGUgcm93cyBiZWxvdyB0aGUgZ3JvdXBcclxuLy8gbmVlZCB0byBiZSByZWZyZXNoLiB0aGlzIGFsbG93cyB0aGUgY29udGV4dCAoZWcgZm9jdXMpIG9mIHRoZSBvdGhlciBjZWxscyB0b1xyXG4vLyByZW1haW4uXHJcbkdyaWQucHJvdG90eXBlLnVwZGF0ZU1vZGVsQW5kUmVmcmVzaCA9IGZ1bmN0aW9uKHN0ZXAsIHJlZnJlc2hGcm9tSW5kZXgpIHtcclxuICAgIHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyLnVwZGF0ZU1vZGVsKHN0ZXApO1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlci5yZWZyZXNoVmlldyhyZWZyZXNoRnJvbUluZGV4KTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNldFJvd3MgPSBmdW5jdGlvbihyb3dzLCBmaXJzdElkKSB7XHJcbiAgICBpZiAocm93cykge1xyXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMucm93RGF0YSA9IHJvd3M7XHJcbiAgICB9XHJcbiAgICB0aGlzLmluTWVtb3J5Um93Q29udHJvbGxlci5zZXRBbGxSb3dzKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFsbFJvd3MoKSwgZmlyc3RJZCk7XHJcbiAgICB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIuZGVzZWxlY3RBbGwoKTtcclxuICAgIHRoaXMuZmlsdGVyTWFuYWdlci5vbk5ld1Jvd3NMb2FkZWQoKTtcclxuICAgIHRoaXMudXBkYXRlTW9kZWxBbmRSZWZyZXNoKGNvbnN0YW50cy5TVEVQX0VWRVJZVEhJTkcpO1xyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci51cGRhdGVGaWx0ZXJJY29ucygpO1xyXG4gICAgdGhpcy5zaG93TG9hZGluZ1BhbmVsKGZhbHNlKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmVuc3VyZU5vZGVWaXNpYmxlID0gZnVuY3Rpb24oY29tcGFyYXRvcikge1xyXG4gICAgaWYgKHRoaXMuZG9pbmdWaXJ0dWFsUGFnaW5nKSB7XHJcbiAgICAgICAgdGhyb3cgJ0Nhbm5vdCB1c2UgZW5zdXJlTm9kZVZpc2libGUgd2hlbiBkb2luZyB2aXJ0dWFsIHBhZ2luZywgYXMgd2UgY2Fubm90IGNoZWNrIHJvd3MgdGhhdCBhcmUgbm90IGluIG1lbW9yeSc7XHJcbiAgICB9XHJcbiAgICAvLyBsb29rIGZvciB0aGUgbm9kZSBpbmRleCB3ZSB3YW50IHRvIGRpc3BsYXlcclxuICAgIHZhciByb3dDb3VudCA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvd0NvdW50KCk7XHJcbiAgICB2YXIgY29tcGFyYXRvcklzQUZ1bmN0aW9uID0gdHlwZW9mIGNvbXBhcmF0b3IgPT09ICdmdW5jdGlvbic7XHJcbiAgICB2YXIgaW5kZXhUb1NlbGVjdCA9IC0xO1xyXG4gICAgLy8gZ28gdGhyb3VnaCBhbGwgdGhlIG5vZGVzLCBmaW5kIHRoZSBvbmUgd2Ugd2FudCB0byBzaG93XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvd0NvdW50OyBpKyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvdyhpKTtcclxuICAgICAgICBpZiAoY29tcGFyYXRvcklzQUZ1bmN0aW9uKSB7XHJcbiAgICAgICAgICAgIGlmIChjb21wYXJhdG9yKG5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleFRvU2VsZWN0ID0gaTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gY2hlY2sgb2JqZWN0IGVxdWFsaXR5IGFnYWluc3Qgbm9kZSBhbmQgZGF0YVxyXG4gICAgICAgICAgICBpZiAoY29tcGFyYXRvciA9PT0gbm9kZSB8fCBjb21wYXJhdG9yID09PSBub2RlLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4VG9TZWxlY3QgPSBpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoaW5kZXhUb1NlbGVjdCA+PSAwKSB7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVJbmRleFZpc2libGUoaW5kZXhUb1NlbGVjdCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5lbnN1cmVJbmRleFZpc2libGUgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgdmFyIGxhc3RSb3cgPSB0aGlzLnJvd01vZGVsLmdldFZpcnR1YWxSb3dDb3VudCgpO1xyXG4gICAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicgfHwgaW5kZXggPCAwIHx8IGluZGV4ID49IGxhc3RSb3cpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ2ludmFsaWQgcm93IGluZGV4IGZvciBlbnN1cmVJbmRleFZpc2libGU6ICcgKyBpbmRleCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciByb3dIZWlnaHQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dIZWlnaHQoKTtcclxuICAgIHZhciByb3dUb3BQaXhlbCA9IHJvd0hlaWdodCAqIGluZGV4O1xyXG4gICAgdmFyIHJvd0JvdHRvbVBpeGVsID0gcm93VG9wUGl4ZWwgKyByb3dIZWlnaHQ7XHJcblxyXG4gICAgdmFyIHZpZXdwb3J0VG9wUGl4ZWwgPSB0aGlzLmVCb2R5Vmlld3BvcnQuc2Nyb2xsVG9wO1xyXG4gICAgdmFyIHZpZXdwb3J0SGVpZ2h0ID0gdGhpcy5lQm9keVZpZXdwb3J0Lm9mZnNldEhlaWdodDtcclxuICAgIHZhciBzY3JvbGxTaG93aW5nID0gdGhpcy5lQm9keVZpZXdwb3J0LmNsaWVudFdpZHRoIDwgdGhpcy5lQm9keVZpZXdwb3J0LnNjcm9sbFdpZHRoO1xyXG4gICAgaWYgKHNjcm9sbFNob3dpbmcpIHtcclxuICAgICAgICB2aWV3cG9ydEhlaWdodCAtPSB0aGlzLnNjcm9sbFdpZHRoO1xyXG4gICAgfVxyXG4gICAgdmFyIHZpZXdwb3J0Qm90dG9tUGl4ZWwgPSB2aWV3cG9ydFRvcFBpeGVsICsgdmlld3BvcnRIZWlnaHQ7XHJcblxyXG4gICAgdmFyIHZpZXdwb3J0U2Nyb2xsZWRQYXN0Um93ID0gdmlld3BvcnRUb3BQaXhlbCA+IHJvd1RvcFBpeGVsO1xyXG4gICAgdmFyIHZpZXdwb3J0U2Nyb2xsZWRCZWZvcmVSb3cgPSB2aWV3cG9ydEJvdHRvbVBpeGVsIDwgcm93Qm90dG9tUGl4ZWw7XHJcblxyXG4gICAgaWYgKHZpZXdwb3J0U2Nyb2xsZWRQYXN0Um93KSB7XHJcbiAgICAgICAgLy8gaWYgcm93IGlzIGJlZm9yZSwgc2Nyb2xsIHVwIHdpdGggcm93IGF0IHRvcFxyXG4gICAgICAgIHRoaXMuZUJvZHlWaWV3cG9ydC5zY3JvbGxUb3AgPSByb3dUb3BQaXhlbDtcclxuICAgIH0gZWxzZSBpZiAodmlld3BvcnRTY3JvbGxlZEJlZm9yZVJvdykge1xyXG4gICAgICAgIC8vIGlmIHJvdyBpcyBiZWxvdywgc2Nyb2xsIGRvd24gd2l0aCByb3cgYXQgYm90dG9tXHJcbiAgICAgICAgdmFyIG5ld1Njcm9sbFBvc2l0aW9uID0gcm93Qm90dG9tUGl4ZWwgLSB2aWV3cG9ydEhlaWdodDtcclxuICAgICAgICB0aGlzLmVCb2R5Vmlld3BvcnQuc2Nyb2xsVG9wID0gbmV3U2Nyb2xsUG9zaXRpb247XHJcbiAgICB9XHJcbiAgICAvLyBvdGhlcndpc2UsIHJvdyBpcyBhbHJlYWR5IGluIHZpZXcsIHNvIGRvIG5vdGhpbmdcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmVuc3VyZUNvbEluZGV4VmlzaWJsZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignY29sIGluZGV4IG11c3QgYmUgYSBudW1iZXI6ICcgKyBpbmRleCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjb2x1bW5zID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRWaXNpYmxlQ29sdW1ucygpO1xyXG4gICAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicgfHwgaW5kZXggPCAwIHx8IGluZGV4ID49IGNvbHVtbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdpbnZhbGlkIGNvbCBpbmRleCBmb3IgZW5zdXJlQ29sSW5kZXhWaXNpYmxlOiAnICsgaW5kZXhcclxuICAgICAgICAgICAgKyAnLCBzaG91bGQgYmUgYmV0d2VlbiAwIGFuZCAnICsgKGNvbHVtbnMubGVuZ3RoIC0gMSkpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY29sdW1uID0gY29sdW1uc1tpbmRleF07XHJcbiAgICB2YXIgcGlubmVkQ29sQ291bnQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRQaW5uZWRDb2xDb3VudCgpO1xyXG4gICAgaWYgKGluZGV4IDwgcGlubmVkQ29sQ291bnQpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ2ludmFsaWQgY29sIGluZGV4IGZvciBlbnN1cmVDb2xJbmRleFZpc2libGU6ICcgKyBpbmRleFxyXG4gICAgICAgICAgICArICcsIHNjcm9sbGluZyB0byBhIHBpbm5lZCBjb2wgbWFrZXMgbm8gc2Vuc2UnKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc3VtIHVwIGFsbCBjb2wgd2lkdGggdG8gdGhlIGxldCB0byBnZXQgdGhlIHN0YXJ0IHBpeGVsXHJcbiAgICB2YXIgY29sTGVmdFBpeGVsID0gMDtcclxuICAgIGZvciAodmFyIGkgPSBwaW5uZWRDb2xDb3VudDsgaTxpbmRleDsgaSsrKSB7XHJcbiAgICAgICAgY29sTGVmdFBpeGVsICs9IGNvbHVtbnNbaV0uYWN0dWFsV2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNvbFJpZ2h0UGl4ZWwgPSBjb2xMZWZ0UGl4ZWwgKyBjb2x1bW4uYWN0dWFsV2lkdGg7XHJcblxyXG4gICAgdmFyIHZpZXdwb3J0TGVmdFBpeGVsID0gdGhpcy5lQm9keVZpZXdwb3J0LnNjcm9sbExlZnQ7XHJcbiAgICB2YXIgdmlld3BvcnRXaWR0aCA9IHRoaXMuZUJvZHlWaWV3cG9ydC5vZmZzZXRXaWR0aDtcclxuXHJcbiAgICB2YXIgc2Nyb2xsU2hvd2luZyA9IHRoaXMuZUJvZHlWaWV3cG9ydC5jbGllbnRIZWlnaHQgPCB0aGlzLmVCb2R5Vmlld3BvcnQuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgaWYgKHNjcm9sbFNob3dpbmcpIHtcclxuICAgICAgICB2aWV3cG9ydFdpZHRoIC09IHRoaXMuc2Nyb2xsV2lkdGg7XHJcbiAgICB9XHJcbiAgIFxyXG4gICAgdmFyIHZpZXdwb3J0UmlnaHRQaXhlbCA9IHZpZXdwb3J0TGVmdFBpeGVsICsgdmlld3BvcnRXaWR0aDtcclxuXHJcbiAgICB2YXIgdmlld3BvcnRTY3JvbGxlZFBhc3RDb2wgPSB2aWV3cG9ydExlZnRQaXhlbCA+IGNvbExlZnRQaXhlbDtcclxuICAgIHZhciB2aWV3cG9ydFNjcm9sbGVkQmVmb3JlQ29sID0gdmlld3BvcnRSaWdodFBpeGVsIDwgY29sUmlnaHRQaXhlbDtcclxuXHJcbiAgICBpZiAodmlld3BvcnRTY3JvbGxlZFBhc3RDb2wpIHtcclxuICAgICAgICAvLyBpZiB2aWV3cG9ydCdzIGxlZnQgc2lkZSBpcyBhZnRlciBjb2wncyBsZWZ0IHNpZGUsIHNjcm9sbCByaWdodCB0byBwdWxsIGNvbCBpbnRvIHZpZXdwb3J0IGF0IGxlZnRcclxuICAgICAgICB0aGlzLmVCb2R5Vmlld3BvcnQuc2Nyb2xsTGVmdCA9IGNvbExlZnRQaXhlbDtcclxuICAgIH0gZWxzZSBpZiAodmlld3BvcnRTY3JvbGxlZEJlZm9yZUNvbCkge1xyXG4gICAgICAgIC8vIGlmIHZpZXdwb3J0J3MgcmlnaHQgc2lkZSBpcyBiZWZvcmUgY29sJ3MgcmlnaHQgc2lkZSwgc2Nyb2xsIGxlZnQgdG8gcHVsbCBjb2wgaW50byB2aWV3cG9ydCBhdCByaWdodFxyXG4gICAgICAgIHZhciBuZXdTY3JvbGxQb3NpdGlvbiA9IGNvbFJpZ2h0UGl4ZWwgLSB2aWV3cG9ydFdpZHRoO1xyXG4gICAgICAgIHRoaXMuZUJvZHlWaWV3cG9ydC5zY3JvbGxMZWZ0ID0gbmV3U2Nyb2xsUG9zaXRpb247XHJcbiAgICB9XHJcbiAgICAvLyBvdGhlcndpc2UsIGNvbCBpcyBhbHJlYWR5IGluIHZpZXcsIHNvIGRvIG5vdGhpbmdcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmFkZEFwaSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIGFwaSA9IHtcclxuICAgICAgICBzZXREYXRhc291cmNlOiBmdW5jdGlvbihkYXRhc291cmNlKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YXNvdXJjZShkYXRhc291cmNlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uTmV3RGF0YXNvdXJjZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YXNvdXJjZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0Um93czogZnVuY3Rpb24ocm93cykge1xyXG4gICAgICAgICAgICB0aGF0LnNldFJvd3Mocm93cyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbk5ld1Jvd3M6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LnNldFJvd3MoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uTmV3Q29sczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQub25OZXdDb2xzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1bnNlbGVjdEFsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJ1bnNlbGVjdEFsbCBkZXByZWNhdGVkLCBjYWxsIGRlc2VsZWN0QWxsIGluc3RlYWRcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RBbGwoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlZnJlc2hWaWV3OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc29mdFJlZnJlc2hWaWV3OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5yb3dSZW5kZXJlci5zb2Z0UmVmcmVzaFZpZXcoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlZnJlc2hHcm91cFJvd3M6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LnJvd1JlbmRlcmVyLnJlZnJlc2hHcm91cFJvd3MoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlZnJlc2hIZWFkZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBuZWVkIHRvIHJldmlldyB0aGlzIC0gdGhlIHJlZnJlc2hIZWFkZXIgc2hvdWxkIGFsc28gcmVmcmVzaCBhbGwgaWNvbnMgaW4gdGhlIGhlYWRlclxyXG4gICAgICAgICAgICB0aGF0LmhlYWRlclJlbmRlcmVyLnJlZnJlc2hIZWFkZXIoKTtcclxuICAgICAgICAgICAgdGhhdC5oZWFkZXJSZW5kZXJlci51cGRhdGVGaWx0ZXJJY29ucygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0TW9kZWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5yb3dNb2RlbDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uR3JvdXBFeHBhbmRlZE9yQ29sbGFwc2VkOiBmdW5jdGlvbihyZWZyZXNoRnJvbUluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoYXQudXBkYXRlTW9kZWxBbmRSZWZyZXNoKGNvbnN0YW50cy5TVEVQX01BUCwgcmVmcmVzaEZyb21JbmRleCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBleHBhbmRBbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LmluTWVtb3J5Um93Q29udHJvbGxlci5leHBhbmRPckNvbGxhcHNlQWxsKHRydWUsIG51bGwpO1xyXG4gICAgICAgICAgICB0aGF0LnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9NQVApO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29sbGFwc2VBbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LmluTWVtb3J5Um93Q29udHJvbGxlci5leHBhbmRPckNvbGxhcHNlQWxsKGZhbHNlLCBudWxsKTtcclxuICAgICAgICAgICAgdGhhdC51cGRhdGVNb2RlbEFuZFJlZnJlc2goY29uc3RhbnRzLlNURVBfTUFQKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZFZpcnR1YWxSb3dMaXN0ZW5lcjogZnVuY3Rpb24ocm93SW5kZXgsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHRoYXQuYWRkVmlydHVhbFJvd0xpc3RlbmVyKHJvd0luZGV4LCBjYWxsYmFjayk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByb3dEYXRhQ2hhbmdlZDogZnVuY3Rpb24ocm93cykge1xyXG4gICAgICAgICAgICB0aGF0LnJvd1JlbmRlcmVyLnJvd0RhdGFDaGFuZ2VkKHJvd3MpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0UXVpY2tGaWx0ZXI6IGZ1bmN0aW9uKG5ld0ZpbHRlcikge1xyXG4gICAgICAgICAgICB0aGF0Lm9uUXVpY2tGaWx0ZXJDaGFuZ2VkKG5ld0ZpbHRlcilcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdEluZGV4OiBmdW5jdGlvbihpbmRleCwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5zZWxlY3RJbmRleChpbmRleCwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlc2VsZWN0SW5kZXg6IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5kZXNlbGVjdEluZGV4KGluZGV4KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdE5vZGU6IGZ1bmN0aW9uKG5vZGUsIHRyeU11bHRpLCBzdXBwcmVzc0V2ZW50cykge1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuc2VsZWN0Tm9kZShub2RlLCB0cnlNdWx0aSwgc3VwcHJlc3NFdmVudHMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVzZWxlY3ROb2RlOiBmdW5jdGlvbihub2RlKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5kZXNlbGVjdE5vZGUobm9kZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZWxlY3RBbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuc2VsZWN0QWxsKCk7XHJcbiAgICAgICAgICAgIHRoYXQucm93UmVuZGVyZXIucmVmcmVzaFZpZXcoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlc2VsZWN0QWxsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLmRlc2VsZWN0QWxsKCk7XHJcbiAgICAgICAgICAgIHRoYXQucm93UmVuZGVyZXIucmVmcmVzaFZpZXcoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlY29tcHV0ZUFnZ3JlZ2F0ZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LmluTWVtb3J5Um93Q29udHJvbGxlci5kb0FnZ3JlZ2F0ZSgpO1xyXG4gICAgICAgICAgICB0aGF0LnJvd1JlbmRlcmVyLnJlZnJlc2hHcm91cFJvd3MoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNpemVDb2x1bW5zVG9GaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgYXZhaWxhYmxlV2lkdGggPSB0aGF0LmVCb2R5LmNsaWVudFdpZHRoO1xyXG4gICAgICAgICAgICB2YXIgc2Nyb2xsU2hvd2luZyA9IHRoYXQuZUJvZHlWaWV3cG9ydC5jbGllbnRIZWlnaHQgPCB0aGF0LmVCb2R5Vmlld3BvcnQuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgICAgICAgICBpZiAoc2Nyb2xsU2hvd2luZykge1xyXG4gICAgICAgICAgICAgICAgYXZhaWxhYmxlV2lkdGggLT0gdGhhdC5zY3JvbGxXaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGF0LmNvbHVtbkNvbnRyb2xsZXIuc2l6ZUNvbHVtbnNUb0ZpdChhdmFpbGFibGVXaWR0aCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaG93TG9hZGluZzogZnVuY3Rpb24oc2hvdykge1xyXG4gICAgICAgICAgICB0aGF0LnNob3dMb2FkaW5nUGFuZWwoc2hvdyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc05vZGVTZWxlY3RlZDogZnVuY3Rpb24obm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLmlzTm9kZVNlbGVjdGVkKG5vZGUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0U2VsZWN0ZWROb2RlczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuZ2V0U2VsZWN0ZWROb2RlcygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0QmVzdENvc3ROb2RlU2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5nZXRCZXN0Q29zdE5vZGVTZWxlY3Rpb24oKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuc3VyZUNvbEluZGV4VmlzaWJsZTogZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZW5zdXJlQ29sSW5kZXhWaXNpYmxlKGluZGV4KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuc3VyZUluZGV4VmlzaWJsZTogZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZW5zdXJlSW5kZXhWaXNpYmxlKGluZGV4KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuc3VyZU5vZGVWaXNpYmxlOiBmdW5jdGlvbihjb21wYXJhdG9yKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmVuc3VyZU5vZGVWaXNpYmxlKGNvbXBhcmF0b3IpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9yRWFjaEluTWVtb3J5OiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICB0aGF0LnJvd01vZGVsLmZvckVhY2hJbk1lbW9yeShjYWxsYmFjayk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRGaWx0ZXJBcGlGb3JDb2xEZWY6IGZ1bmN0aW9uKGNvbERlZikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2FnLWdyaWQgQVBJIG1ldGhvZCBnZXRGaWx0ZXJBcGlGb3JDb2xEZWYgZGVwcmVjYXRlZCwgdXNlIGdldEZpbHRlckFwaSBpbnN0ZWFkJyk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpbHRlckFwaShjb2xEZWYpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0RmlsdGVyQXBpOiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGNvbHVtbiA9IHRoYXQuY29sdW1uTW9kZWwuZ2V0Q29sdW1uKGtleSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmZpbHRlck1hbmFnZXIuZ2V0RmlsdGVyQXBpKGNvbHVtbik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkZpbHRlckNoYW5nZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0Lm9uRmlsdGVyQ2hhbmdlZCgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0U29ydE1vZGVsOiBmdW5jdGlvbihzb3J0TW9kZWwpIHtcclxuICAgICAgICAgICAgdGhhdC5zZXRTb3J0TW9kZWwoc29ydE1vZGVsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFNvcnRNb2RlbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmdldFNvcnRNb2RlbCgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0RmlsdGVyTW9kZWw6IGZ1bmN0aW9uKG1vZGVsKSB7XHJcbiAgICAgICAgICAgIHRoYXQuZmlsdGVyTWFuYWdlci5zZXRGaWx0ZXJNb2RlbChtb2RlbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRGaWx0ZXJNb2RlbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmZpbHRlck1hbmFnZXIuZ2V0RmlsdGVyTW9kZWwoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhpcy5ncmlkT3B0aW9ucy5hcGkgPSBhcGk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5nZXRTb3J0TW9kZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBhbGxDb2x1bW5zID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRBbGxDb2x1bW5zKCk7XHJcbiAgICB2YXIgY29sdW1uc1dpdGhTb3J0aW5nID0gW107XHJcbiAgICB2YXIgaTtcclxuICAgIGZvciAoaSA9IDA7IGk8YWxsQ29sdW1ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChhbGxDb2x1bW5zW2ldLnNvcnQpIHtcclxuICAgICAgICAgICAgY29sdW1uc1dpdGhTb3J0aW5nLnB1c2goYWxsQ29sdW1uc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29sdW1uc1dpdGhTb3J0aW5nLnNvcnQoIGZ1bmN0aW9uKGEsYikge1xyXG4gICAgICAgIHJldHVybiBhLnNvcnRlZEF0IC0gYi5zb3J0ZWRBdDtcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgIGZvciAoaSA9IDA7IGk8Y29sdW1uc1dpdGhTb3J0aW5nLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdEVudHJ5ID0ge1xyXG4gICAgICAgICAgICBmaWVsZDogY29sdW1uc1dpdGhTb3J0aW5nW2ldLmNvbERlZi5maWVsZCxcclxuICAgICAgICAgICAgc29ydDogY29sdW1uc1dpdGhTb3J0aW5nW2ldLnNvcnRcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJlc3VsdC5wdXNoKHJlc3VsdEVudHJ5KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0U29ydE1vZGVsID0gZnVuY3Rpb24oc29ydE1vZGVsKSB7XHJcbiAgICAvLyBmaXJzdCB1cCwgY2xlYXIgYW55IHByZXZpb3VzIHNvcnRcclxuICAgIHZhciBzb3J0TW9kZWxQcm92aWRlZCA9IHNvcnRNb2RlbCE9PW51bGwgJiYgc29ydE1vZGVsIT09dW5kZWZpbmVkICYmIHNvcnRNb2RlbC5sZW5ndGg+MDtcclxuICAgIHZhciBhbGxDb2x1bW5zID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRBbGxDb2x1bW5zKCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaTxhbGxDb2x1bW5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNvbHVtbiA9IGFsbENvbHVtbnNbaV07XHJcblxyXG4gICAgICAgIHZhciBzb3J0Rm9yQ29sID0gbnVsbDtcclxuICAgICAgICB2YXIgc29ydGVkQXQgPSAtMTtcclxuICAgICAgICBpZiAoc29ydE1vZGVsUHJvdmlkZWQgJiYgIWNvbHVtbi5jb2xEZWYuc3VwcHJlc3NTb3J0aW5nKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqPHNvcnRNb2RlbC5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNvcnRNb2RlbEVudHJ5ID0gc29ydE1vZGVsW2pdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3J0TW9kZWxFbnRyeS5maWVsZCA9PT0gJ3N0cmluZydcclxuICAgICAgICAgICAgICAgICAgICAmJiB0eXBlb2YgY29sdW1uLmNvbERlZi5maWVsZCA9PT0gJ3N0cmluZydcclxuICAgICAgICAgICAgICAgICAgICAmJiBzb3J0TW9kZWxFbnRyeS5maWVsZCA9PT0gY29sdW1uLmNvbERlZi5maWVsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRGb3JDb2wgPSBzb3J0TW9kZWxFbnRyeS5zb3J0O1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRlZEF0ID0gajtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNvcnRGb3JDb2wpIHtcclxuICAgICAgICAgICAgY29sdW1uLnNvcnQgPSBzb3J0Rm9yQ29sO1xyXG4gICAgICAgICAgICBjb2x1bW4uc29ydGVkQXQgPSBzb3J0ZWRBdDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb2x1bW4uc29ydCA9IG51bGw7XHJcbiAgICAgICAgICAgIGNvbHVtbi5zb3J0ZWRBdCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaGVhZGVyUmVuZGVyZXIudXBkYXRlU29ydEljb25zKCk7XHJcbiAgICB0aGlzLnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9TT1JUKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmFkZFZpcnR1YWxSb3dMaXN0ZW5lciA9IGZ1bmN0aW9uKHJvd0luZGV4LCBjYWxsYmFjaykge1xyXG4gICAgaWYgKCF0aGlzLnZpcnR1YWxSb3dDYWxsYmFja3Nbcm93SW5kZXhdKSB7XHJcbiAgICAgICAgdGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XSA9IFtdO1xyXG4gICAgfVxyXG4gICAgdGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XS5wdXNoKGNhbGxiYWNrKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLm9uVmlydHVhbFJvd1NlbGVjdGVkID0gZnVuY3Rpb24ocm93SW5kZXgsIHNlbGVjdGVkKSB7XHJcbiAgICAvLyBpbmZvcm0gdGhlIGNhbGxiYWNrcyBvZiB0aGUgZXZlbnRcclxuICAgIGlmICh0aGlzLnZpcnR1YWxSb3dDYWxsYmFja3Nbcm93SW5kZXhdKSB7XHJcbiAgICAgICAgdGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XS5mb3JFYWNoKGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sucm93UmVtb3ZlZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sucm93U2VsZWN0ZWQoc2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5vblZpcnR1YWxSb3dSZW1vdmVkID0gZnVuY3Rpb24ocm93SW5kZXgpIHtcclxuICAgIC8vIGluZm9ybSB0aGUgY2FsbGJhY2tzIG9mIHRoZSBldmVudFxyXG4gICAgaWYgKHRoaXMudmlydHVhbFJvd0NhbGxiYWNrc1tyb3dJbmRleF0pIHtcclxuICAgICAgICB0aGlzLnZpcnR1YWxSb3dDYWxsYmFja3Nbcm93SW5kZXhdLmZvckVhY2goZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjay5yb3dSZW1vdmVkID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5yb3dSZW1vdmVkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8vIHJlbW92ZSB0aGUgY2FsbGJhY2tzXHJcbiAgICBkZWxldGUgdGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLm9uTmV3Q29scyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5zZXR1cENvbHVtbnMoKTtcclxuICAgIHRoaXMudXBkYXRlTW9kZWxBbmRSZWZyZXNoKGNvbnN0YW50cy5TVEVQX0VWRVJZVEhJTkcpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuZmluZEFsbEVsZW1lbnRzID0gZnVuY3Rpb24oZUdyaWREaXYpIHtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0RvbnRVc2VTY3JvbGxzKCkpIHtcclxuICAgICAgICB0aGlzLmVSb290ID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1yb290XCIpO1xyXG4gICAgICAgIHRoaXMuZUhlYWRlckNvbnRhaW5lciA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctaGVhZGVyLWNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLmVCb2R5Q29udGFpbmVyID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1ib2R5LWNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLmVMb2FkaW5nUGFuZWwgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKCcuYWctbG9hZGluZy1wYW5lbCcpO1xyXG4gICAgICAgIC8vIGZvciBuby1zY3JvbGxzLCBhbGwgcm93cyBsaXZlIGluIHRoZSBib2R5IGNvbnRhaW5lclxyXG4gICAgICAgIHRoaXMuZVBhcmVudE9mUm93cyA9IHRoaXMuZUJvZHlDb250YWluZXI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZVJvb3QgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLXJvb3RcIik7XHJcbiAgICAgICAgdGhpcy5lQm9keSA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keVwiKTtcclxuICAgICAgICB0aGlzLmVCb2R5Q29udGFpbmVyID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1ib2R5LWNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLmVCb2R5Vmlld3BvcnQgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLWJvZHktdmlld3BvcnRcIik7XHJcbiAgICAgICAgdGhpcy5lQm9keVZpZXdwb3J0V3JhcHBlciA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keS12aWV3cG9ydC13cmFwcGVyXCIpO1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLXBpbm5lZC1jb2xzLWNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzVmlld3BvcnQgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLXBpbm5lZC1jb2xzLXZpZXdwb3J0XCIpO1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZEhlYWRlciA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctcGlubmVkLWhlYWRlclwiKTtcclxuICAgICAgICB0aGlzLmVIZWFkZXIgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLWhlYWRlclwiKTtcclxuICAgICAgICB0aGlzLmVIZWFkZXJDb250YWluZXIgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLWhlYWRlci1jb250YWluZXJcIik7XHJcbiAgICAgICAgdGhpcy5lTG9hZGluZ1BhbmVsID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcignLmFnLWxvYWRpbmctcGFuZWwnKTtcclxuICAgICAgICAvLyBmb3Igc2Nyb2xscywgYWxsIHJvd3MgbGl2ZSBpbiBlQm9keSAoY29udGFpbmluZyBwaW5uZWQgYW5kIG5vcm1hbCBib2R5KVxyXG4gICAgICAgIHRoaXMuZVBhcmVudE9mUm93cyA9IHRoaXMuZUJvZHk7XHJcbiAgICAgICAgdGhpcy5lUGFnaW5nUGFuZWwgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKCcuYWctcGFnaW5nLXBhbmVsJyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zaG93UGlubmVkQ29sQ29udGFpbmVyc0lmTmVlZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBubyBuZWVkIHRvIGRvIHRoaXMgaWYgbm90IHVzaW5nIHNjcm9sbHNcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0RvbnRVc2VTY3JvbGxzKCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNob3dpbmdQaW5uZWRDb2xzID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0UGlubmVkQ29sQ291bnQoKSA+IDA7XHJcblxyXG4gICAgLy9zb21lIGJyb3dzZXJzIGhhZCBsYXlvdXQgaXNzdWVzIHdpdGggdGhlIGJsYW5rIGRpdnMsIHNvIGlmIGJsYW5rLFxyXG4gICAgLy93ZSBkb24ndCBkaXNwbGF5IHRoZW1cclxuICAgIGlmIChzaG93aW5nUGlubmVkQ29scykge1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZEhlYWRlci5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc1ZpZXdwb3J0LnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkSGVhZGVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc1ZpZXdwb3J0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS51cGRhdGVCb2R5Q29udGFpbmVyV2lkdGhBZnRlckNvbFJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlci5zZXRNYWluUm93V2lkdGhzKCk7XHJcbiAgICB0aGlzLnNldEJvZHlDb250YWluZXJXaWR0aCgpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUudXBkYXRlUGlubmVkQ29sQ29udGFpbmVyV2lkdGhBZnRlckNvbFJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5zZXRQaW5uZWRDb2xDb250YWluZXJXaWR0aCgpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0UGlubmVkQ29sQ29udGFpbmVyV2lkdGggPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBwaW5uZWRDb2xXaWR0aCA9IHRoaXMuY29sdW1uTW9kZWwuZ2V0UGlubmVkQ29udGFpbmVyV2lkdGgoKSArIFwicHhcIjtcclxuICAgIHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIuc3R5bGUud2lkdGggPSBwaW5uZWRDb2xXaWR0aDtcclxuICAgIHRoaXMuZUJvZHlWaWV3cG9ydFdyYXBwZXIuc3R5bGUubWFyZ2luTGVmdCA9IHBpbm5lZENvbFdpZHRoO1xyXG59O1xyXG5cclxuLy8gc2VlIGlmIGEgZ3JleSBib3ggaXMgbmVlZGVkIGF0IHRoZSBib3R0b20gb2YgdGhlIHBpbm5lZCBjb2xcclxuR3JpZC5wcm90b3R5cGUuc2V0UGlubmVkQ29sSGVpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyB2YXIgYm9keUhlaWdodCA9IHV0aWxzLnBpeGVsU3RyaW5nVG9OdW1iZXIodGhpcy5lQm9keS5zdHlsZS5oZWlnaHQpO1xyXG4gICAgdmFyIHNjcm9sbFNob3dpbmcgPSB0aGlzLmVCb2R5Vmlld3BvcnQuY2xpZW50V2lkdGggPCB0aGlzLmVCb2R5Vmlld3BvcnQuc2Nyb2xsV2lkdGg7XHJcbiAgICB2YXIgYm9keUhlaWdodCA9IHRoaXMuZUJvZHlWaWV3cG9ydC5vZmZzZXRIZWlnaHQ7XHJcbiAgICBpZiAoc2Nyb2xsU2hvd2luZykge1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZENvbHNWaWV3cG9ydC5zdHlsZS5oZWlnaHQgPSAoYm9keUhlaWdodCAtIHRoaXMuc2Nyb2xsV2lkdGgpICsgXCJweFwiO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzVmlld3BvcnQuc3R5bGUuaGVpZ2h0ID0gYm9keUhlaWdodCArIFwicHhcIjtcclxuICAgIH1cclxuICAgIC8vIGFsc28gdGhlIGxvYWRpbmcgb3ZlcmxheSwgbmVlZHMgdG8gaGF2ZSBpdCdzIGhlaWdodCBhZGp1c3RlZFxyXG4gICAgdGhpcy5lTG9hZGluZ1BhbmVsLnN0eWxlLmhlaWdodCA9IGJvZHlIZWlnaHQgKyAncHgnO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0Qm9keVNpemUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgdmFyIGJvZHlIZWlnaHQgPSB0aGlzLmVCb2R5Vmlld3BvcnQub2Zmc2V0SGVpZ2h0O1xyXG4gICAgdmFyIHBhZ2luZ1Zpc2libGUgPSB0aGlzLmlzU2hvd1BhZ2luZ1BhbmVsKCk7XHJcblxyXG4gICAgaWYgKHRoaXMuYm9keUhlaWdodExhc3RUaW1lICE9IGJvZHlIZWlnaHQgfHwgdGhpcy5zaG93UGFnaW5nUGFuZWxWaXNpYmxlTGFzdFRpbWUgIT0gcGFnaW5nVmlzaWJsZSkge1xyXG4gICAgICAgIHRoaXMuYm9keUhlaWdodExhc3RUaW1lID0gYm9keUhlaWdodDtcclxuICAgICAgICB0aGlzLnNob3dQYWdpbmdQYW5lbFZpc2libGVMYXN0VGltZSA9IHBhZ2luZ1Zpc2libGU7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0UGlubmVkQ29sSGVpZ2h0KCk7XHJcblxyXG4gICAgICAgIC8vb25seSBkcmF3IHZpcnR1YWwgcm93cyBpZiBkb25lIHNvcnQgJiBmaWx0ZXIgLSB0aGlzXHJcbiAgICAgICAgLy9tZWFucyB3ZSBkb24ndCBkcmF3IHJvd3MgaWYgdGFibGUgaXMgbm90IHlldCBpbml0aWFsaXNlZFxyXG4gICAgICAgIGlmICh0aGlzLnJvd01vZGVsLmdldFZpcnR1YWxSb3dDb3VudCgpID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnJvd1JlbmRlcmVyLmRyYXdWaXJ0dWFsUm93cygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gc2hvdyBhbmQgcG9zaXRpb24gcGFnaW5nIHBhbmVsXHJcbiAgICAgICAgdGhpcy5zaG93QW5kUG9zaXRpb25QYWdpbmdQYW5lbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5maW5pc2hlZCkge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIF90aGlzLnNldEJvZHlTaXplKCk7XHJcbiAgICAgICAgfSwgMjAwKTtcclxuICAgIH1cclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmFkZFNjcm9sbExpc3RlbmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgdmFyIGxhc3RMZWZ0UG9zaXRpb24gPSAtMTtcclxuICAgIHZhciBsYXN0VG9wUG9zaXRpb24gPSAtMTtcclxuXHJcbiAgICB0aGlzLmVCb2R5Vmlld3BvcnQuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbmV3TGVmdFBvc2l0aW9uID0gdGhhdC5lQm9keVZpZXdwb3J0LnNjcm9sbExlZnQ7XHJcbiAgICAgICAgdmFyIG5ld1RvcFBvc2l0aW9uID0gdGhhdC5lQm9keVZpZXdwb3J0LnNjcm9sbFRvcDtcclxuXHJcbiAgICAgICAgaWYgKG5ld0xlZnRQb3NpdGlvbiAhPT0gbGFzdExlZnRQb3NpdGlvbikge1xyXG4gICAgICAgICAgICBsYXN0TGVmdFBvc2l0aW9uID0gbmV3TGVmdFBvc2l0aW9uO1xyXG4gICAgICAgICAgICB0aGF0LnNjcm9sbEhlYWRlcihuZXdMZWZ0UG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG5ld1RvcFBvc2l0aW9uICE9PSBsYXN0VG9wUG9zaXRpb24pIHtcclxuICAgICAgICAgICAgbGFzdFRvcFBvc2l0aW9uID0gbmV3VG9wUG9zaXRpb247XHJcbiAgICAgICAgICAgIHRoYXQuc2Nyb2xsUGlubmVkKG5ld1RvcFBvc2l0aW9uKTtcclxuICAgICAgICAgICAgdGhhdC5yb3dSZW5kZXJlci5kcmF3VmlydHVhbFJvd3MoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmVQaW5uZWRDb2xzVmlld3BvcnQuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyB0aGlzIG1lYW5zIHRoZSBwaW5uZWQgcGFuZWwgd2FzIG1vdmVkLCB3aGljaCBjYW4gb25seVxyXG4gICAgICAgIC8vIGhhcHBlbiB3aGVuIHRoZSB1c2VyIGlzIG5hdmlnYXRpbmcgaW4gdGhlIHBpbm5lZCBjb250YWluZXJcclxuICAgICAgICAvLyBhcyB0aGUgcGlubmVkIGNvbCBzaG91bGQgbmV2ZXIgc2Nyb2xsLiBzbyB3ZSByb2xsYmFja1xyXG4gICAgICAgIC8vIHRoZSBzY3JvbGwgb24gdGhlIHBpbm5lZC5cclxuICAgICAgICB0aGF0LmVQaW5uZWRDb2xzVmlld3BvcnQuc2Nyb2xsVG9wID0gMDtcclxuICAgIH0pO1xyXG5cclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNjcm9sbEhlYWRlciA9IGZ1bmN0aW9uKGJvZHlMZWZ0UG9zaXRpb24pIHtcclxuICAgIC8vIHRoaXMuZUhlYWRlckNvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoJyArIC1ib2R5TGVmdFBvc2l0aW9uICsgXCJweCwwLDApXCI7XHJcbiAgICB0aGlzLmVIZWFkZXJDb250YWluZXIuc3R5bGUubGVmdCA9IC1ib2R5TGVmdFBvc2l0aW9uICsgXCJweFwiO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2Nyb2xsUGlubmVkID0gZnVuY3Rpb24oYm9keVRvcFBvc2l0aW9uKSB7XHJcbiAgICAvLyB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgwLCcgKyAtYm9keVRvcFBvc2l0aW9uICsgXCJweCwwKVwiO1xyXG4gICAgdGhpcy5lUGlubmVkQ29sc0NvbnRhaW5lci5zdHlsZS50b3AgPSAtYm9keVRvcFBvc2l0aW9uICsgXCJweFwiO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHcmlkO1xyXG4iLCJ2YXIgREVGQVVMVF9ST1dfSEVJR0hUID0gMzA7XHJcblxyXG5mdW5jdGlvbiBHcmlkT3B0aW9uc1dyYXBwZXIoZ3JpZE9wdGlvbnMpIHtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnMgPSBncmlkT3B0aW9ucztcclxuICAgIHRoaXMuc2V0dXBEZWZhdWx0cygpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc1RydWUodmFsdWUpIHtcclxuICAgIHJldHVybiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gJ3RydWUnO1xyXG59XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzUm93U2VsZWN0aW9uID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd1NlbGVjdGlvbiA9PT0gXCJzaW5nbGVcIiB8fCB0aGlzLmdyaWRPcHRpb25zLnJvd1NlbGVjdGlvbiA9PT0gXCJtdWx0aXBsZVwiOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzUm93RGVzZWxlY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLnJvd0Rlc2VsZWN0aW9uKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc1Jvd1NlbGVjdGlvbk11bHRpID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd1NlbGVjdGlvbiA9PT0gJ211bHRpcGxlJzsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRDb250ZXh0ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmNvbnRleHQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNWaXJ0dWFsUGFnaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy52aXJ0dWFsUGFnaW5nKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc1Jvd3NBbHJlYWR5R3JvdXBlZCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMucm93c0FscmVhZHlHcm91cGVkKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0dyb3VwU2VsZWN0c0NoaWxkcmVuID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5ncm91cFNlbGVjdHNDaGlsZHJlbik7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNHcm91cEluY2x1ZGVGb290ZXIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLmdyb3VwSW5jbHVkZUZvb3Rlcik7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNTdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5zdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc1N1cHByZXNzQ2VsbFNlbGVjdGlvbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuc3VwcHJlc3NDZWxsU2VsZWN0aW9uKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0dyb3VwSGVhZGVycyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBIZWFkZXJzKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRHcm91cElubmVyUmVuZGVyZXIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBJbm5lclJlbmRlcmVyOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzRG9udFVzZVNjcm9sbHMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLmRvbnRVc2VTY3JvbGxzKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRSb3dTdHlsZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5yb3dTdHlsZTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRSb3dDbGFzcyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5yb3dDbGFzczsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRHcmlkT3B0aW9ucyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9uczsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRIZWFkZXJDZWxsUmVuZGVyZXIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuaGVhZGVyQ2VsbFJlbmRlcmVyOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldEFwaSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5hcGk7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNFbmFibGVTb3J0aW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmVuYWJsZVNvcnRpbmc7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNFbmFibGVDb2xSZXNpemUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlQ29sUmVzaXplOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzRW5hYmxlRmlsdGVyID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmVuYWJsZUZpbHRlcjsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRDb2xXaWR0aCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5jb2xXaWR0aDsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRHcm91cERlZmF1bHRFeHBhbmRlZCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5ncm91cERlZmF1bHRFeHBhbmRlZDsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRHcm91cEtleXMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBLZXlzOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldEdyb3VwQWdnRnVuY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBBZ2dGdW5jdGlvbjsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRHcm91cEFnZ0ZpZWxkcyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5ncm91cEFnZ0ZpZWxkczsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRBbGxSb3dzID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd0RhdGE7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNHcm91cFVzZUVudGlyZVJvdyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBVc2VFbnRpcmVSb3cpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzQW5ndWxhckNvbXBpbGVSb3dzID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5hbmd1bGFyQ29tcGlsZVJvd3MpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzQW5ndWxhckNvbXBpbGVGaWx0ZXJzID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5hbmd1bGFyQ29tcGlsZUZpbHRlcnMpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzQW5ndWxhckNvbXBpbGVIZWFkZXJzID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5hbmd1bGFyQ29tcGlsZUhlYWRlcnMpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldENvbHVtbkRlZnMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuY29sdW1uRGVmczsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRSb3dIZWlnaHQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMucm93SGVpZ2h0OyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldE1vZGVsVXBkYXRlZCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5tb2RlbFVwZGF0ZWQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Q2VsbENsaWNrZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuY2VsbENsaWNrZWQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Q2VsbERvdWJsZUNsaWNrZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuY2VsbERvdWJsZUNsaWNrZWQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Q2VsbFZhbHVlQ2hhbmdlZCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5jZWxsVmFsdWVDaGFuZ2VkOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldFJvd1NlbGVjdGVkID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd1NlbGVjdGVkOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldFNlbGVjdGlvbkNoYW5nZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuc2VsZWN0aW9uQ2hhbmdlZDsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRWaXJ0dWFsUm93UmVtb3ZlZCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy52aXJ0dWFsUm93UmVtb3ZlZDsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXREYXRhc291cmNlID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmRhdGFzb3VyY2U7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0UmVhZHkgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMucmVhZHk7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Um93QnVmZmVyID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd0J1ZmZlcjsgfTtcclxuXHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuc2V0U2VsZWN0ZWRSb3dzID0gZnVuY3Rpb24obmV3U2VsZWN0ZWRSb3dzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5zZWxlY3RlZFJvd3MgPSBuZXdTZWxlY3RlZFJvd3M7XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuc2V0U2VsZWN0ZWROb2Rlc0J5SWQgPSBmdW5jdGlvbihuZXdTZWxlY3RlZE5vZGVzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5zZWxlY3RlZE5vZGVzQnlJZCA9IG5ld1NlbGVjdGVkTm9kZXM7XHJcbn07XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldEljb25zID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5pY29ucztcclxufTtcclxuXHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNEb0ludGVybmFsR3JvdXBpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAhdGhpcy5pc1Jvd3NBbHJlYWR5R3JvdXBlZCgpICYmIHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBLZXlzO1xyXG59O1xyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRIZWFkZXJIZWlnaHQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0eXBlb2YgdGhpcy5ncmlkT3B0aW9ucy5oZWFkZXJIZWlnaHQgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgLy8gaWYgaGVhZGVyIGhlaWdodCBwcm92aWRlZCwgdXNlZCBpdFxyXG4gICAgICAgIHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmhlYWRlckhlaWdodDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlIHJldHVybiAyNSBpZiBubyBncm91cGluZywgNTAgaWYgZ3JvdXBpbmdcclxuICAgICAgICBpZiAodGhpcy5pc0dyb3VwSGVhZGVycygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiA1MDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gMjU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5zZXR1cERlZmF1bHRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnMucm93SGVpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5yb3dIZWlnaHQgPSBERUZBVUxUX1JPV19IRUlHSFQ7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldFBpbm5lZENvbENvdW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBpZiBub3QgdXNpbmcgc2Nyb2xscywgdGhlbiBwaW5uZWQgY29sdW1ucyBkb2Vzbid0IG1ha2VcclxuICAgIC8vIHNlbnNlLCBzbyBhbHdheXMgcmV0dXJuIDBcclxuICAgIGlmICh0aGlzLmlzRG9udFVzZVNjcm9sbHMoKSkge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMucGlubmVkQ29sdW1uQ291bnQpIHtcclxuICAgICAgICAvL2luIGNhc2UgdXNlciBwdXRzIGluIGEgc3RyaW5nLCBjYXN0IHRvIG51bWJlclxyXG4gICAgICAgIHJldHVybiBOdW1iZXIodGhpcy5ncmlkT3B0aW9ucy5waW5uZWRDb2x1bW5Db3VudCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRMb2NhbGVUZXh0RnVuYyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChrZXksIGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgICAgIHZhciBsb2NhbGVUZXh0ID0gdGhhdC5ncmlkT3B0aW9ucy5sb2NhbGVUZXh0O1xyXG4gICAgICAgIGlmIChsb2NhbGVUZXh0ICYmIGxvY2FsZVRleHRba2V5XSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbG9jYWxlVGV4dFtrZXldO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4iLCJmdW5jdGlvbiBHcm91cENyZWF0b3IoKSB7fVxyXG5cclxuR3JvdXBDcmVhdG9yLnByb3RvdHlwZS5ncm91cCA9IGZ1bmN0aW9uKHJvd05vZGVzLCBncm91cEJ5RmllbGRzLCBncm91cEFnZ0Z1bmN0aW9uLCBleHBhbmRCeURlZmF1bHQpIHtcclxuXHJcbiAgICB2YXIgdG9wTW9zdEdyb3VwID0ge1xyXG4gICAgICAgIGxldmVsOiAtMSxcclxuICAgICAgICBjaGlsZHJlbjogW10sXHJcbiAgICAgICAgY2hpbGRyZW5NYXA6IHt9XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBhbGxHcm91cHMgPSBbXTtcclxuICAgIGFsbEdyb3Vwcy5wdXNoKHRvcE1vc3RHcm91cCk7XHJcblxyXG4gICAgdmFyIGxldmVsVG9JbnNlcnRDaGlsZCA9IGdyb3VwQnlGaWVsZHMubGVuZ3RoIC0gMTtcclxuICAgIHZhciBpLCBjdXJyZW50TGV2ZWwsIG5vZGUsIGRhdGEsIGN1cnJlbnRHcm91cCwgZ3JvdXBCeUZpZWxkLCBncm91cEtleSwgbmV4dEdyb3VwO1xyXG5cclxuICAgIC8vIHN0YXJ0IGF0IC0xIGFuZCBnbyBiYWNrd2FyZHMsIGFzIGFsbCB0aGUgcG9zaXRpdmUgaW5kZXhlc1xyXG4gICAgLy8gYXJlIGFscmVhZHkgdXNlZCBieSB0aGUgbm9kZXMuXHJcbiAgICB2YXIgaW5kZXggPSAtMTtcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgcm93Tm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBub2RlID0gcm93Tm9kZXNbaV07XHJcbiAgICAgICAgZGF0YSA9IG5vZGUuZGF0YTtcclxuXHJcbiAgICAgICAgLy8gYWxsIGxlYWYgbm9kZXMgaGF2ZSB0aGUgc2FtZSBsZXZlbCBpbiB0aGlzIGdyb3VwaW5nLCB3aGljaCBpcyBvbmUgbGV2ZWwgYWZ0ZXIgdGhlIGxhc3QgZ3JvdXBcclxuICAgICAgICBub2RlLmxldmVsID0gbGV2ZWxUb0luc2VydENoaWxkICsgMTtcclxuXHJcbiAgICAgICAgZm9yIChjdXJyZW50TGV2ZWwgPSAwOyBjdXJyZW50TGV2ZWwgPCBncm91cEJ5RmllbGRzLmxlbmd0aDsgY3VycmVudExldmVsKyspIHtcclxuICAgICAgICAgICAgZ3JvdXBCeUZpZWxkID0gZ3JvdXBCeUZpZWxkc1tjdXJyZW50TGV2ZWxdO1xyXG4gICAgICAgICAgICBncm91cEtleSA9IGRhdGFbZ3JvdXBCeUZpZWxkXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50TGV2ZWwgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEdyb3VwID0gdG9wTW9zdEdyb3VwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBncm91cCBkb2Vzbid0IGV4aXN0IHlldCwgY3JlYXRlIGl0XHJcbiAgICAgICAgICAgIG5leHRHcm91cCA9IGN1cnJlbnRHcm91cC5jaGlsZHJlbk1hcFtncm91cEtleV07XHJcbiAgICAgICAgICAgIGlmICghbmV4dEdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBuZXh0R3JvdXAgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZmllbGQ6IGdyb3VwQnlGaWVsZCxcclxuICAgICAgICAgICAgICAgICAgICBpZDogaW5kZXgtLSxcclxuICAgICAgICAgICAgICAgICAgICBrZXk6IGdyb3VwS2V5LFxyXG4gICAgICAgICAgICAgICAgICAgIGV4cGFuZGVkOiB0aGlzLmlzRXhwYW5kZWQoZXhwYW5kQnlEZWZhdWx0LCBjdXJyZW50TGV2ZWwpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAvLyBmb3IgdG9wIG1vc3QgbGV2ZWwsIHBhcmVudCBpcyBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdXJyZW50R3JvdXAgPT09IHRvcE1vc3RHcm91cCA/IG51bGwgOiBjdXJyZW50R3JvdXAsXHJcbiAgICAgICAgICAgICAgICAgICAgYWxsQ2hpbGRyZW5Db3VudDogMCxcclxuICAgICAgICAgICAgICAgICAgICBsZXZlbDogY3VycmVudEdyb3VwLmxldmVsICsgMSxcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbk1hcDoge30gLy90aGlzIGlzIGEgdGVtcG9yYXJ5IG1hcCwgd2UgcmVtb3ZlIGF0IHRoZSBlbmQgb2YgdGhpcyBtZXRob2RcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50R3JvdXAuY2hpbGRyZW5NYXBbZ3JvdXBLZXldID0gbmV4dEdyb3VwO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEdyb3VwLmNoaWxkcmVuLnB1c2gobmV4dEdyb3VwKTtcclxuICAgICAgICAgICAgICAgIGFsbEdyb3Vwcy5wdXNoKG5leHRHcm91cCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG5leHRHcm91cC5hbGxDaGlsZHJlbkNvdW50Kys7XHJcblxyXG4gICAgICAgICAgICBpZiAoY3VycmVudExldmVsID09IGxldmVsVG9JbnNlcnRDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5wYXJlbnQgPSBuZXh0R3JvdXAgPT09IHRvcE1vc3RHcm91cCA/IG51bGwgOiBuZXh0R3JvdXA7XHJcbiAgICAgICAgICAgICAgICBuZXh0R3JvdXAuY2hpbGRyZW4ucHVzaChub2RlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRHcm91cCA9IG5leHRHcm91cDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy9yZW1vdmUgdGhlIHRlbXBvcmFyeSBtYXBcclxuICAgIGZvciAoaSA9IDA7IGkgPCBhbGxHcm91cHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBkZWxldGUgYWxsR3JvdXBzW2ldLmNoaWxkcmVuTWFwO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0b3BNb3N0R3JvdXAuY2hpbGRyZW47XHJcbn07XHJcblxyXG5Hcm91cENyZWF0b3IucHJvdG90eXBlLmlzRXhwYW5kZWQgPSBmdW5jdGlvbihleHBhbmRCeURlZmF1bHQsIGxldmVsKSB7XHJcbiAgICBpZiAodHlwZW9mIGV4cGFuZEJ5RGVmYXVsdCA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICByZXR1cm4gbGV2ZWwgPCBleHBhbmRCeURlZmF1bHQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBleHBhbmRCeURlZmF1bHQgPT09IHRydWUgfHwgZXhwYW5kQnlEZWZhdWx0ID09PSAndHJ1ZSc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBHcm91cENyZWF0b3IoKTtcclxuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG52YXIgU3ZnRmFjdG9yeSA9IHJlcXVpcmUoJy4vc3ZnRmFjdG9yeScpO1xyXG52YXIgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcclxuXHJcbnZhciBzdmdGYWN0b3J5ID0gbmV3IFN2Z0ZhY3RvcnkoKTtcclxuXHJcbmZ1bmN0aW9uIEhlYWRlclJlbmRlcmVyKCkge31cclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oZ3JpZE9wdGlvbnNXcmFwcGVyLCBjb2x1bW5Db250cm9sbGVyLCBjb2x1bW5Nb2RlbCwgZUdyaWQsIGFuZ3VsYXJHcmlkLCBmaWx0ZXJNYW5hZ2VyLCAkc2NvcGUsICRjb21waWxlKSB7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHRoaXMuY29sdW1uTW9kZWwgPSBjb2x1bW5Nb2RlbDtcclxuICAgIHRoaXMuY29sdW1uQ29udHJvbGxlciA9IGNvbHVtbkNvbnRyb2xsZXI7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkID0gYW5ndWxhckdyaWQ7XHJcbiAgICB0aGlzLmZpbHRlck1hbmFnZXIgPSBmaWx0ZXJNYW5hZ2VyO1xyXG4gICAgdGhpcy4kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLiRjb21waWxlID0gJGNvbXBpbGU7XHJcbiAgICB0aGlzLmZpbmRBbGxFbGVtZW50cyhlR3JpZCk7XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuZmluZEFsbEVsZW1lbnRzID0gZnVuY3Rpb24oZUdyaWQpIHtcclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyQ29udGFpbmVyID0gZUdyaWQucXVlcnlTZWxlY3RvcihcIi5hZy1oZWFkZXItY29udGFpbmVyXCIpO1xyXG4gICAgICAgIHRoaXMuZVJvb3QgPSBlR3JpZC5xdWVyeVNlbGVjdG9yKFwiLmFnLXJvb3RcIik7XHJcbiAgICAgICAgLy8gZm9yIG5vLXNjcm9sbCwgYWxsIGhlYWRlciBjZWxscyBsaXZlIGluIHRoZSBoZWFkZXIgY29udGFpbmVyICh0aGUgYWctaGVhZGVyIGRvZXNuJ3QgZXhpc3QpXHJcbiAgICAgICAgdGhpcy5lSGVhZGVyUGFyZW50ID0gdGhpcy5lSGVhZGVyQ29udGFpbmVyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVQaW5uZWRIZWFkZXIgPSBlR3JpZC5xdWVyeVNlbGVjdG9yKFwiLmFnLXBpbm5lZC1oZWFkZXJcIik7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyQ29udGFpbmVyID0gZUdyaWQucXVlcnlTZWxlY3RvcihcIi5hZy1oZWFkZXItY29udGFpbmVyXCIpO1xyXG4gICAgICAgIHRoaXMuZUhlYWRlciA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctaGVhZGVyXCIpO1xyXG4gICAgICAgIHRoaXMuZVJvb3QgPSBlR3JpZC5xdWVyeVNlbGVjdG9yKFwiLmFnLXJvb3RcIik7XHJcbiAgICAgICAgLy8gZm9yIHNjcm9sbCwgYWxsIGhlYWRlciBjZWxscyBsaXZlIGluIHRoZSBoZWFkZXIgKGNvbnRhaW5zIGJvdGggbm9ybWFsIGFuZCBwaW5uZWQgaGVhZGVycylcclxuICAgICAgICB0aGlzLmVIZWFkZXJQYXJlbnQgPSB0aGlzLmVIZWFkZXI7XHJcbiAgICB9XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUucmVmcmVzaEhlYWRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdXRpbHMucmVtb3ZlQWxsQ2hpbGRyZW4odGhpcy5lUGlubmVkSGVhZGVyKTtcclxuICAgIHV0aWxzLnJlbW92ZUFsbENoaWxkcmVuKHRoaXMuZUhlYWRlckNvbnRhaW5lcik7XHJcblxyXG4gICAgaWYgKHRoaXMuY2hpbGRTY29wZXMpIHtcclxuICAgICAgICB0aGlzLmNoaWxkU2NvcGVzLmZvckVhY2goZnVuY3Rpb24oY2hpbGRTY29wZSkge1xyXG4gICAgICAgICAgICBjaGlsZFNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmNoaWxkU2NvcGVzID0gW107XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBIZWFkZXJzKCkpIHtcclxuICAgICAgICB0aGlzLmluc2VydEhlYWRlcnNXaXRoR3JvdXBpbmcoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5pbnNlcnRIZWFkZXJzV2l0aG91dEdyb3VwaW5nKCk7XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmluc2VydEhlYWRlcnNXaXRoR3JvdXBpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBncm91cHMgPSB0aGlzLmNvbHVtbk1vZGVsLmdldENvbHVtbkdyb3VwcygpO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24oZ3JvdXApIHtcclxuICAgICAgICB2YXIgZUhlYWRlckNlbGwgPSB0aGF0LmNyZWF0ZUdyb3VwZWRIZWFkZXJDZWxsKGdyb3VwKTtcclxuICAgICAgICB2YXIgZUNvbnRhaW5lclRvQWRkVG8gPSBncm91cC5waW5uZWQgPyB0aGF0LmVQaW5uZWRIZWFkZXIgOiB0aGF0LmVIZWFkZXJDb250YWluZXI7XHJcbiAgICAgICAgZUNvbnRhaW5lclRvQWRkVG8uYXBwZW5kQ2hpbGQoZUhlYWRlckNlbGwpO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlR3JvdXBlZEhlYWRlckNlbGwgPSBmdW5jdGlvbihncm91cCkge1xyXG5cclxuICAgIHZhciBlSGVhZGVyR3JvdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGVIZWFkZXJHcm91cC5jbGFzc05hbWUgPSAnYWctaGVhZGVyLWdyb3VwJztcclxuXHJcbiAgICB2YXIgZUhlYWRlckdyb3VwQ2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZ3JvdXAuZUhlYWRlckdyb3VwQ2VsbCA9IGVIZWFkZXJHcm91cENlbGw7XHJcbiAgICB2YXIgY2xhc3NOYW1lcyA9IFsnYWctaGVhZGVyLWdyb3VwLWNlbGwnXTtcclxuICAgIC8vIGhhdmluZyBkaWZmZXJlbnQgY2xhc3NlcyBiZWxvdyBhbGxvd3MgdGhlIHN0eWxlIHRvIG5vdCBoYXZlIGEgYm90dG9tIGJvcmRlclxyXG4gICAgLy8gb24gdGhlIGdyb3VwIGhlYWRlciwgaWYgbm8gZ3JvdXAgaXMgc3BlY2lmaWVkXHJcbiAgICBpZiAoZ3JvdXAubmFtZSkge1xyXG4gICAgICAgIGNsYXNzTmFtZXMucHVzaCgnYWctaGVhZGVyLWdyb3VwLWNlbGwtd2l0aC1ncm91cCcpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjbGFzc05hbWVzLnB1c2goJ2FnLWhlYWRlci1ncm91cC1jZWxsLW5vLWdyb3VwJyk7XHJcbiAgICB9XHJcbiAgICBlSGVhZGVyR3JvdXBDZWxsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZXMuam9pbignICcpO1xyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0VuYWJsZUNvbFJlc2l6ZSgpKSB7XHJcbiAgICAgICAgdmFyIGVIZWFkZXJDZWxsUmVzaXplID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBlSGVhZGVyQ2VsbFJlc2l6ZS5jbGFzc05hbWUgPSBcImFnLWhlYWRlci1jZWxsLXJlc2l6ZVwiO1xyXG4gICAgICAgIGVIZWFkZXJHcm91cENlbGwuYXBwZW5kQ2hpbGQoZUhlYWRlckNlbGxSZXNpemUpO1xyXG4gICAgICAgIGdyb3VwLmVIZWFkZXJDZWxsUmVzaXplID0gZUhlYWRlckNlbGxSZXNpemU7XHJcbiAgICAgICAgdmFyIGRyYWdDYWxsYmFjayA9IHRoaXMuZ3JvdXBEcmFnQ2FsbGJhY2tGYWN0b3J5KGdyb3VwKTtcclxuICAgICAgICB0aGlzLmFkZERyYWdIYW5kbGVyKGVIZWFkZXJDZWxsUmVzaXplLCBkcmFnQ2FsbGJhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG5vIHJlbmRlcmVyLCBkZWZhdWx0IHRleHQgcmVuZGVyXHJcbiAgICB2YXIgZ3JvdXBOYW1lID0gZ3JvdXAubmFtZTtcclxuICAgIGlmIChncm91cE5hbWUgJiYgZ3JvdXBOYW1lICE9PSAnJykge1xyXG4gICAgICAgIHZhciBlR3JvdXBDZWxsTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGVHcm91cENlbGxMYWJlbC5jbGFzc05hbWUgPSAnYWctaGVhZGVyLWdyb3VwLWNlbGwtbGFiZWwnO1xyXG4gICAgICAgIGVIZWFkZXJHcm91cENlbGwuYXBwZW5kQ2hpbGQoZUdyb3VwQ2VsbExhYmVsKTtcclxuXHJcbiAgICAgICAgdmFyIGVJbm5lclRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgICAgICBlSW5uZXJUZXh0LmNsYXNzTmFtZSA9ICdhZy1oZWFkZXItZ3JvdXAtdGV4dCc7XHJcbiAgICAgICAgZUlubmVyVGV4dC5pbm5lckhUTUwgPSBncm91cE5hbWU7XHJcbiAgICAgICAgZUdyb3VwQ2VsbExhYmVsLmFwcGVuZENoaWxkKGVJbm5lclRleHQpO1xyXG5cclxuICAgICAgICBpZiAoZ3JvdXAuZXhwYW5kYWJsZSkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZEdyb3VwRXhwYW5kSWNvbihncm91cCwgZUdyb3VwQ2VsbExhYmVsLCBncm91cC5leHBhbmRlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZUhlYWRlckdyb3VwLmFwcGVuZENoaWxkKGVIZWFkZXJHcm91cENlbGwpO1xyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGdyb3VwLnZpc2libGVDb2x1bW5zLmZvckVhY2goZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICAgICAgdmFyIGVIZWFkZXJDZWxsID0gdGhhdC5jcmVhdGVIZWFkZXJDZWxsKGNvbHVtbiwgdHJ1ZSwgZ3JvdXApO1xyXG4gICAgICAgIGVIZWFkZXJHcm91cC5hcHBlbmRDaGlsZChlSGVhZGVyQ2VsbCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGF0LnNldFdpZHRoT2ZHcm91cEhlYWRlckNlbGwoZ3JvdXApO1xyXG5cclxuICAgIHJldHVybiBlSGVhZGVyR3JvdXA7XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuYWRkR3JvdXBFeHBhbmRJY29uID0gZnVuY3Rpb24oZ3JvdXAsIGVIZWFkZXJHcm91cCwgZXhwYW5kZWQpIHtcclxuICAgIHZhciBlR3JvdXBJY29uO1xyXG4gICAgaWYgKGV4cGFuZGVkKSB7XHJcbiAgICAgICAgZUdyb3VwSWNvbiA9IHV0aWxzLmNyZWF0ZUljb24oJ2NvbHVtbkdyb3VwT3BlbmVkJywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIG51bGwsIHN2Z0ZhY3RvcnkuY3JlYXRlQXJyb3dMZWZ0U3ZnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZUdyb3VwSWNvbiA9IHV0aWxzLmNyZWF0ZUljb24oJ2NvbHVtbkdyb3VwQ2xvc2VkJywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIG51bGwsIHN2Z0ZhY3RvcnkuY3JlYXRlQXJyb3dSaWdodFN2Zyk7XHJcbiAgICB9XHJcbiAgICBlR3JvdXBJY29uLmNsYXNzTmFtZSA9ICdhZy1oZWFkZXItZXhwYW5kLWljb24nO1xyXG4gICAgZUhlYWRlckdyb3VwLmFwcGVuZENoaWxkKGVHcm91cEljb24pO1xyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGVHcm91cEljb24ub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQuY29sdW1uQ29udHJvbGxlci5jb2x1bW5Hcm91cE9wZW5lZChncm91cCk7XHJcbiAgICB9O1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmFkZERyYWdIYW5kbGVyID0gZnVuY3Rpb24oZURyYWdnYWJsZUVsZW1lbnQsIGRyYWdDYWxsYmFjaykge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgZURyYWdnYWJsZUVsZW1lbnQub25tb3VzZWRvd24gPSBmdW5jdGlvbihkb3duRXZlbnQpIHtcclxuICAgICAgICBkcmFnQ2FsbGJhY2sub25EcmFnU3RhcnQoKTtcclxuICAgICAgICB0aGF0LmVSb290LnN0eWxlLmN1cnNvciA9IFwiY29sLXJlc2l6ZVwiO1xyXG4gICAgICAgIHRoYXQuZHJhZ1N0YXJ0WCA9IGRvd25FdmVudC5jbGllbnRYO1xyXG5cclxuICAgICAgICB0aGF0LmVSb290Lm9ubW91c2Vtb3ZlID0gZnVuY3Rpb24obW92ZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBuZXdYID0gbW92ZUV2ZW50LmNsaWVudFg7XHJcbiAgICAgICAgICAgIHZhciBjaGFuZ2UgPSBuZXdYIC0gdGhhdC5kcmFnU3RhcnRYO1xyXG4gICAgICAgICAgICBkcmFnQ2FsbGJhY2sub25EcmFnZ2luZyhjaGFuZ2UpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhhdC5lUm9vdC5vbm1vdXNldXAgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5zdG9wRHJhZ2dpbmcoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoYXQuZVJvb3Qub25tb3VzZWxlYXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc3RvcERyYWdnaW5nKCk7XHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuc2V0V2lkdGhPZkdyb3VwSGVhZGVyQ2VsbCA9IGZ1bmN0aW9uKGhlYWRlckdyb3VwKSB7XHJcbiAgICB2YXIgdG90YWxXaWR0aCA9IDA7XHJcbiAgICBoZWFkZXJHcm91cC52aXNpYmxlQ29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgICAgIHRvdGFsV2lkdGggKz0gY29sdW1uLmFjdHVhbFdpZHRoO1xyXG4gICAgfSk7XHJcbiAgICBoZWFkZXJHcm91cC5lSGVhZGVyR3JvdXBDZWxsLnN0eWxlLndpZHRoID0gdXRpbHMuZm9ybWF0V2lkdGgodG90YWxXaWR0aCk7XHJcbiAgICBoZWFkZXJHcm91cC5hY3R1YWxXaWR0aCA9IHRvdGFsV2lkdGg7XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuaW5zZXJ0SGVhZGVyc1dpdGhvdXRHcm91cGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGVQaW5uZWRIZWFkZXIgPSB0aGlzLmVQaW5uZWRIZWFkZXI7XHJcbiAgICB2YXIgZUhlYWRlckNvbnRhaW5lciA9IHRoaXMuZUhlYWRlckNvbnRhaW5lcjtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsLmdldFZpc2libGVDb2x1bW5zKCkuZm9yRWFjaChmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgICAgICAvLyBvbmx5IGluY2x1ZGUgdGhlIGZpcnN0IHggY29sc1xyXG4gICAgICAgIHZhciBoZWFkZXJDZWxsID0gdGhhdC5jcmVhdGVIZWFkZXJDZWxsKGNvbHVtbiwgZmFsc2UpO1xyXG4gICAgICAgIGlmIChjb2x1bW4ucGlubmVkKSB7XHJcbiAgICAgICAgICAgIGVQaW5uZWRIZWFkZXIuYXBwZW5kQ2hpbGQoaGVhZGVyQ2VsbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZUhlYWRlckNvbnRhaW5lci5hcHBlbmRDaGlsZChoZWFkZXJDZWxsKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVIZWFkZXJDZWxsID0gZnVuY3Rpb24oY29sdW1uLCBncm91cGVkLCBoZWFkZXJHcm91cCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcbiAgICB2YXIgZUhlYWRlckNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgLy8gc3RpY2sgdGhlIGhlYWRlciBjZWxsIGluIGNvbHVtbiwgYXMgd2UgYWNjZXNzIGl0IHdoZW4gZ3JvdXAgaXMgcmUtc2l6ZWRcclxuICAgIGNvbHVtbi5lSGVhZGVyQ2VsbCA9IGVIZWFkZXJDZWxsO1xyXG5cclxuICAgIHZhciBoZWFkZXJDZWxsQ2xhc3NlcyA9IFsnYWctaGVhZGVyLWNlbGwnXTtcclxuICAgIGlmIChncm91cGVkKSB7XHJcbiAgICAgICAgaGVhZGVyQ2VsbENsYXNzZXMucHVzaCgnYWctaGVhZGVyLWNlbGwtZ3JvdXBlZCcpOyAvLyB0aGlzIHRha2VzIDUwJSBoZWlnaHRcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaGVhZGVyQ2VsbENsYXNzZXMucHVzaCgnYWctaGVhZGVyLWNlbGwtbm90LWdyb3VwZWQnKTsgLy8gdGhpcyB0YWtlcyAxMDAlIGhlaWdodFxyXG4gICAgfVxyXG4gICAgZUhlYWRlckNlbGwuY2xhc3NOYW1lID0gaGVhZGVyQ2VsbENsYXNzZXMuam9pbignICcpO1xyXG5cclxuICAgIC8vIGFkZCB0b29sdGlwIGlmIGV4aXN0c1xyXG4gICAgaWYgKGNvbERlZi5oZWFkZXJUb29sdGlwKSB7XHJcbiAgICAgICAgZUhlYWRlckNlbGwudGl0bGUgPSBjb2xEZWYuaGVhZGVyVG9vbHRpcDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNFbmFibGVDb2xSZXNpemUoKSkge1xyXG4gICAgICAgIHZhciBoZWFkZXJDZWxsUmVzaXplID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBoZWFkZXJDZWxsUmVzaXplLmNsYXNzTmFtZSA9IFwiYWctaGVhZGVyLWNlbGwtcmVzaXplXCI7XHJcbiAgICAgICAgZUhlYWRlckNlbGwuYXBwZW5kQ2hpbGQoaGVhZGVyQ2VsbFJlc2l6ZSk7XHJcbiAgICAgICAgdmFyIGRyYWdDYWxsYmFjayA9IHRoaXMuaGVhZGVyRHJhZ0NhbGxiYWNrRmFjdG9yeShlSGVhZGVyQ2VsbCwgY29sdW1uLCBoZWFkZXJHcm91cCk7XHJcbiAgICAgICAgdGhpcy5hZGREcmFnSGFuZGxlcihoZWFkZXJDZWxsUmVzaXplLCBkcmFnQ2FsbGJhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGZpbHRlciBidXR0b25cclxuICAgIHZhciBzaG93TWVudSA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRW5hYmxlRmlsdGVyKCkgJiYgIWNvbERlZi5zdXBwcmVzc01lbnU7XHJcbiAgICBpZiAoc2hvd01lbnUpIHtcclxuICAgICAgICB2YXIgZU1lbnVCdXR0b24gPSB1dGlscy5jcmVhdGVJY29uKCdtZW51JywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbiwgc3ZnRmFjdG9yeS5jcmVhdGVNZW51U3ZnKTtcclxuICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhlTWVudUJ1dHRvbiwgJ2FnLWhlYWRlci1pY29uJyk7XHJcblxyXG4gICAgICAgIGVNZW51QnV0dG9uLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiYWctaGVhZGVyLWNlbGwtbWVudS1idXR0b25cIik7XHJcbiAgICAgICAgZU1lbnVCdXR0b24ub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LmZpbHRlck1hbmFnZXIuc2hvd0ZpbHRlcihjb2x1bW4sIHRoaXMpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgZUhlYWRlckNlbGwuYXBwZW5kQ2hpbGQoZU1lbnVCdXR0b24pO1xyXG4gICAgICAgIGVIZWFkZXJDZWxsLm9ubW91c2VlbnRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBlTWVudUJ1dHRvbi5zdHlsZS5vcGFjaXR5ID0gMTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGVIZWFkZXJDZWxsLm9ubW91c2VsZWF2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBlTWVudUJ1dHRvbi5zdHlsZS5vcGFjaXR5ID0gMDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGVNZW51QnV0dG9uLnN0eWxlLm9wYWNpdHkgPSAwO1xyXG4gICAgICAgIGVNZW51QnV0dG9uLnN0eWxlW1wiLXdlYmtpdC10cmFuc2l0aW9uXCJdID0gXCJvcGFjaXR5IDAuNXMsIGJvcmRlciAwLjJzXCI7XHJcbiAgICAgICAgZU1lbnVCdXR0b24uc3R5bGVbXCJ0cmFuc2l0aW9uXCJdID0gXCJvcGFjaXR5IDAuNXMsIGJvcmRlciAwLjJzXCI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbGFiZWwgZGl2XHJcbiAgICB2YXIgaGVhZGVyQ2VsbExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIGhlYWRlckNlbGxMYWJlbC5jbGFzc05hbWUgPSBcImFnLWhlYWRlci1jZWxsLWxhYmVsXCI7XHJcblxyXG4gICAgLy8gYWRkIGluIHNvcnQgaWNvbnNcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0VuYWJsZVNvcnRpbmcoKSAmJiAhY29sRGVmLnN1cHByZXNzU29ydGluZykge1xyXG4gICAgICAgIGNvbHVtbi5lU29ydEFzYyA9IHV0aWxzLmNyZWF0ZUljb24oJ3NvcnRBc2NlbmRpbmcnLCB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciwgY29sdW1uLCBzdmdGYWN0b3J5LmNyZWF0ZUFycm93RG93blN2Zyk7XHJcbiAgICAgICAgY29sdW1uLmVTb3J0RGVzYyA9IHV0aWxzLmNyZWF0ZUljb24oJ3NvcnREZXNjZW5kaW5nJywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbiwgc3ZnRmFjdG9yeS5jcmVhdGVBcnJvd1VwU3ZnKTtcclxuICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhjb2x1bW4uZVNvcnRBc2MsICdhZy1oZWFkZXItaWNvbicpO1xyXG4gICAgICAgIHV0aWxzLmFkZENzc0NsYXNzKGNvbHVtbi5lU29ydERlc2MsICdhZy1oZWFkZXItaWNvbicpO1xyXG4gICAgICAgIGhlYWRlckNlbGxMYWJlbC5hcHBlbmRDaGlsZChjb2x1bW4uZVNvcnRBc2MpO1xyXG4gICAgICAgIGhlYWRlckNlbGxMYWJlbC5hcHBlbmRDaGlsZChjb2x1bW4uZVNvcnREZXNjKTtcclxuICAgICAgICBjb2x1bW4uZVNvcnRBc2Muc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICBjb2x1bW4uZVNvcnREZXNjLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5hZGRTb3J0SGFuZGxpbmcoaGVhZGVyQ2VsbExhYmVsLCBjb2x1bW4pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFkZCBpbiBmaWx0ZXIgaWNvblxyXG4gICAgY29sdW1uLmVGaWx0ZXJJY29uID0gdXRpbHMuY3JlYXRlSWNvbignZmlsdGVyJywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbiwgc3ZnRmFjdG9yeS5jcmVhdGVGaWx0ZXJTdmcpO1xyXG4gICAgdXRpbHMuYWRkQ3NzQ2xhc3MoY29sdW1uLmVGaWx0ZXJJY29uLCAnYWctaGVhZGVyLWljb24nKTtcclxuICAgIGhlYWRlckNlbGxMYWJlbC5hcHBlbmRDaGlsZChjb2x1bW4uZUZpbHRlckljb24pO1xyXG5cclxuICAgIC8vIHJlbmRlciB0aGUgY2VsbCwgdXNlIGEgcmVuZGVyZXIgaWYgb25lIGlzIHByb3ZpZGVkXHJcbiAgICB2YXIgaGVhZGVyQ2VsbFJlbmRlcmVyO1xyXG4gICAgaWYgKGNvbERlZi5oZWFkZXJDZWxsUmVuZGVyZXIpIHsgLy8gZmlyc3QgbG9vayBmb3IgYSByZW5kZXJlciBpbiBjb2wgZGVmXHJcbiAgICAgICAgaGVhZGVyQ2VsbFJlbmRlcmVyID0gY29sRGVmLmhlYWRlckNlbGxSZW5kZXJlcjtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0SGVhZGVyQ2VsbFJlbmRlcmVyKCkpIHsgLy8gc2Vjb25kIGxvb2sgZm9yIG9uZSBpbiBncmlkIG9wdGlvbnNcclxuICAgICAgICBoZWFkZXJDZWxsUmVuZGVyZXIgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRIZWFkZXJDZWxsUmVuZGVyZXIoKTtcclxuICAgIH1cclxuICAgIGlmIChoZWFkZXJDZWxsUmVuZGVyZXIpIHtcclxuICAgICAgICAvLyByZW5kZXJlciBwcm92aWRlZCwgdXNlIGl0XHJcbiAgICAgICAgdmFyIG5ld0NoaWxkU2NvcGU7XHJcbiAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzQW5ndWxhckNvbXBpbGVIZWFkZXJzKCkpIHtcclxuICAgICAgICAgICAgbmV3Q2hpbGRTY29wZSA9IHRoaXMuJHNjb3BlLiRuZXcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGNlbGxSZW5kZXJlclBhcmFtcyA9IHtcclxuICAgICAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgICAgICRzY29wZTogbmV3Q2hpbGRTY29wZSxcclxuICAgICAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpLFxyXG4gICAgICAgICAgICBhcGk6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgY2VsbFJlbmRlcmVyUmVzdWx0ID0gaGVhZGVyQ2VsbFJlbmRlcmVyKGNlbGxSZW5kZXJlclBhcmFtcyk7XHJcbiAgICAgICAgdmFyIGNoaWxkVG9BcHBlbmQ7XHJcbiAgICAgICAgaWYgKHV0aWxzLmlzTm9kZU9yRWxlbWVudChjZWxsUmVuZGVyZXJSZXN1bHQpKSB7XHJcbiAgICAgICAgICAgIC8vIGEgZG9tIG5vZGUgb3IgZWxlbWVudCB3YXMgcmV0dXJuZWQsIHNvIGFkZCBjaGlsZFxyXG4gICAgICAgICAgICBjaGlsZFRvQXBwZW5kID0gY2VsbFJlbmRlcmVyUmVzdWx0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSBhc3N1bWUgaXQgd2FzIGh0bWwsIHNvIGp1c3QgaW5zZXJ0XHJcbiAgICAgICAgICAgIHZhciBlVGV4dFNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgICAgICAgICAgZVRleHRTcGFuLmlubmVySFRNTCA9IGNlbGxSZW5kZXJlclJlc3VsdDtcclxuICAgICAgICAgICAgY2hpbGRUb0FwcGVuZCA9IGVUZXh0U3BhbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gYW5ndWxhciBjb21waWxlIGhlYWRlciBpZiBvcHRpb24gaXMgdHVybmVkIG9uXHJcbiAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzQW5ndWxhckNvbXBpbGVIZWFkZXJzKCkpIHtcclxuICAgICAgICAgICAgbmV3Q2hpbGRTY29wZS5jb2xEZWYgPSBjb2xEZWY7XHJcbiAgICAgICAgICAgIG5ld0NoaWxkU2NvcGUuY29sSW5kZXggPSBjb2xEZWYuaW5kZXg7XHJcbiAgICAgICAgICAgIG5ld0NoaWxkU2NvcGUuY29sRGVmV3JhcHBlciA9IGNvbHVtbjtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZFNjb3Blcy5wdXNoKG5ld0NoaWxkU2NvcGUpO1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRUb0FwcGVuZENvbXBpbGVkID0gdGhpcy4kY29tcGlsZShjaGlsZFRvQXBwZW5kKShuZXdDaGlsZFNjb3BlKVswXTtcclxuICAgICAgICAgICAgaGVhZGVyQ2VsbExhYmVsLmFwcGVuZENoaWxkKGNoaWxkVG9BcHBlbmRDb21waWxlZCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGVhZGVyQ2VsbExhYmVsLmFwcGVuZENoaWxkKGNoaWxkVG9BcHBlbmQpO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gbm8gcmVuZGVyZXIsIGRlZmF1bHQgdGV4dCByZW5kZXJcclxuICAgICAgICB2YXIgZUlubmVyVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgICAgIGVJbm5lclRleHQuY2xhc3NOYW1lID0gJ2FnLWhlYWRlci1jZWxsLXRleHQnO1xyXG4gICAgICAgIGVJbm5lclRleHQuaW5uZXJIVE1MID0gY29sRGVmLmRpc3BsYXlOYW1lO1xyXG4gICAgICAgIGhlYWRlckNlbGxMYWJlbC5hcHBlbmRDaGlsZChlSW5uZXJUZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICBlSGVhZGVyQ2VsbC5hcHBlbmRDaGlsZChoZWFkZXJDZWxsTGFiZWwpO1xyXG4gICAgZUhlYWRlckNlbGwuc3R5bGUud2lkdGggPSB1dGlscy5mb3JtYXRXaWR0aChjb2x1bW4uYWN0dWFsV2lkdGgpO1xyXG5cclxuICAgIHJldHVybiBlSGVhZGVyQ2VsbDtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5hZGRTb3J0SGFuZGxpbmcgPSBmdW5jdGlvbihoZWFkZXJDZWxsTGFiZWwsIGNvbHVtbikge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIGhlYWRlckNlbGxMYWJlbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgc29ydCBvbiBjdXJyZW50IGNvbFxyXG4gICAgICAgIGlmIChjb2x1bW4uc29ydCA9PT0gY29uc3RhbnRzLkRFU0MpIHtcclxuICAgICAgICAgICAgY29sdW1uLnNvcnQgPSBudWxsO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29sdW1uLnNvcnQgPT09IGNvbnN0YW50cy5BU0MpIHtcclxuICAgICAgICAgICAgY29sdW1uLnNvcnQgPSBjb25zdGFudHMuREVTQztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb2x1bW4uc29ydCA9IGNvbnN0YW50cy5BU0M7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzb3J0ZWRBdCB1c2VkIGZvciBrbm93aW5nIG9yZGVyIG9mIGNvbHMgd2hlbiBtdWx0aS1jb2wgc29ydFxyXG4gICAgICAgIGlmIChjb2x1bW4uc29ydCkge1xyXG4gICAgICAgICAgICBjb2x1bW4uc29ydGVkQXQgPSBuZXcgRGF0ZSgpLnZhbHVlT2YoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb2x1bW4uc29ydGVkQXQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY2xlYXIgc29ydCBvbiBhbGwgY29sdW1ucyBleGNlcHQgdGhpcyBvbmUsIGFuZCB1cGRhdGUgdGhlIGljb25zXHJcbiAgICAgICAgdGhhdC5jb2x1bW5Nb2RlbC5nZXRBbGxDb2x1bW5zKCkuZm9yRWFjaChmdW5jdGlvbihjb2x1bW5Ub0NsZWFyKSB7XHJcbiAgICAgICAgICAgIC8vIERvIG5vdCBjbGVhciBpZiBlaXRoZXIgaG9sZGluZyBzaGlmdCwgb3IgaWYgY29sdW1uIGluIHF1ZXN0aW9uIHdhcyBjbGlja2VkXHJcbiAgICAgICAgICAgIGlmICghKGUuc2hpZnRLZXkgfHwgY29sdW1uVG9DbGVhciA9PT0gY29sdW1uKSkge1xyXG4gICAgICAgICAgICAgICAgY29sdW1uVG9DbGVhci5zb3J0ID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGF0LnVwZGF0ZVNvcnRJY29ucygpO1xyXG4gICAgICAgIHRoYXQuYW5ndWxhckdyaWQudXBkYXRlTW9kZWxBbmRSZWZyZXNoKGNvbnN0YW50cy5TVEVQX1NPUlQpO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUudXBkYXRlU29ydEljb25zID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsLmdldEFsbENvbHVtbnMoKS5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgICAgIC8vIHVwZGF0ZSB2aXNpYmlsaXR5IG9mIGljb25zXHJcbiAgICAgICAgdmFyIHNvcnRBc2NlbmRpbmcgPSBjb2x1bW4uc29ydCA9PT0gY29uc3RhbnRzLkFTQztcclxuICAgICAgICB2YXIgc29ydERlc2NlbmRpbmcgPSBjb2x1bW4uc29ydCA9PT0gY29uc3RhbnRzLkRFU0M7XHJcblxyXG4gICAgICAgIGlmIChjb2x1bW4uZVNvcnRBc2MpIHtcclxuICAgICAgICAgICAgdXRpbHMuc2V0VmlzaWJsZShjb2x1bW4uZVNvcnRBc2MsIHNvcnRBc2NlbmRpbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29sdW1uLmVTb3J0RGVzYykge1xyXG4gICAgICAgICAgICB1dGlscy5zZXRWaXNpYmxlKGNvbHVtbi5lU29ydERlc2MsIHNvcnREZXNjZW5kaW5nKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5ncm91cERyYWdDYWxsYmFja0ZhY3RvcnkgPSBmdW5jdGlvbihjdXJyZW50R3JvdXApIHtcclxuICAgIHZhciBwYXJlbnQgPSB0aGlzO1xyXG4gICAgdmFyIHZpc2libGVDb2x1bW5zID0gY3VycmVudEdyb3VwLnZpc2libGVDb2x1bW5zO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBvbkRyYWdTdGFydDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBXaWR0aFN0YXJ0ID0gY3VycmVudEdyb3VwLmFjdHVhbFdpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuV2lkdGhTdGFydHMgPSBbXTtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB2aXNpYmxlQ29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbERlZldyYXBwZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuY2hpbGRyZW5XaWR0aFN0YXJ0cy5wdXNoKGNvbERlZldyYXBwZXIuYWN0dWFsV2lkdGgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5taW5XaWR0aCA9IHZpc2libGVDb2x1bW5zLmxlbmd0aCAqIGNvbnN0YW50cy5NSU5fQ09MX1dJRFRIO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25EcmFnZ2luZzogZnVuY3Rpb24oZHJhZ0NoYW5nZSkge1xyXG5cclxuICAgICAgICAgICAgdmFyIG5ld1dpZHRoID0gdGhpcy5ncm91cFdpZHRoU3RhcnQgKyBkcmFnQ2hhbmdlO1xyXG4gICAgICAgICAgICBpZiAobmV3V2lkdGggPCB0aGlzLm1pbldpZHRoKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdXaWR0aCA9IHRoaXMubWluV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHNldCB0aGUgbmV3IHdpZHRoIHRvIHRoZSBncm91cCBoZWFkZXJcclxuICAgICAgICAgICAgdmFyIG5ld1dpZHRoUHggPSBuZXdXaWR0aCArIFwicHhcIjtcclxuICAgICAgICAgICAgY3VycmVudEdyb3VwLmVIZWFkZXJHcm91cENlbGwuc3R5bGUud2lkdGggPSBuZXdXaWR0aFB4O1xyXG4gICAgICAgICAgICBjdXJyZW50R3JvdXAuYWN0dWFsV2lkdGggPSBuZXdXaWR0aDtcclxuXHJcbiAgICAgICAgICAgIC8vIGRpc3RyaWJ1dGUgdGhlIG5ldyB3aWR0aCB0byB0aGUgY2hpbGQgaGVhZGVyc1xyXG4gICAgICAgICAgICB2YXIgY2hhbmdlUmF0aW8gPSBuZXdXaWR0aCAvIHRoaXMuZ3JvdXBXaWR0aFN0YXJ0O1xyXG4gICAgICAgICAgICAvLyBrZWVwIHRyYWNrIG9mIHBpeGVscyB1c2VkLCBhbmQgbGFzdCBjb2x1bW4gZ2V0cyB0aGUgcmVtYWluaW5nLFxyXG4gICAgICAgICAgICAvLyB0byBjYXRlciBmb3Igcm91bmRpbmcgZXJyb3JzLCBhbmQgbWluIHdpZHRoIGFkanVzdG1lbnRzXHJcbiAgICAgICAgICAgIHZhciBwaXhlbHNUb0Rpc3RyaWJ1dGUgPSBuZXdXaWR0aDtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICBjdXJyZW50R3JvdXAudmlzaWJsZUNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbihjb2xEZWZXcmFwcGVyLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5vdExhc3RDb2wgPSBpbmRleCAhPT0gKHZpc2libGVDb2x1bW5zLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICAgICAgdmFyIG5ld0NoaWxkU2l6ZTtcclxuICAgICAgICAgICAgICAgIGlmIChub3RMYXN0Q29sKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgbm90IHRoZSBsYXN0IGNvbCwgY2FsY3VsYXRlIHRoZSBjb2x1bW4gd2lkdGggYXMgbm9ybWFsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXJ0Q2hpbGRTaXplID0gdGhhdC5jaGlsZHJlbldpZHRoU3RhcnRzW2luZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZFNpemUgPSBzdGFydENoaWxkU2l6ZSAqIGNoYW5nZVJhdGlvO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZFNpemUgPCBjb25zdGFudHMuTUlOX0NPTF9XSURUSCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZFNpemUgPSBjb25zdGFudHMuTUlOX0NPTF9XSURUSDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcGl4ZWxzVG9EaXN0cmlidXRlIC09IG5ld0NoaWxkU2l6ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgbGFzdCBjb2wsIGdpdmUgaXQgdGhlIHJlbWFpbmluZyBwaXhlbHNcclxuICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZFNpemUgPSBwaXhlbHNUb0Rpc3RyaWJ1dGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgZUhlYWRlckNlbGwgPSB2aXNpYmxlQ29sdW1uc1tpbmRleF0uZUhlYWRlckNlbGw7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuYWRqdXN0Q29sdW1uV2lkdGgobmV3Q2hpbGRTaXplLCBjb2xEZWZXcmFwcGVyLCBlSGVhZGVyQ2VsbCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gc2hvdWxkIG5vdCBiZSBjYWxsaW5nIHRoZXNlIGhlcmUsIHNob3VsZCBkbyBzb21ldGhpbmcgZWxzZVxyXG4gICAgICAgICAgICBpZiAoY3VycmVudEdyb3VwLnBpbm5lZCkge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50LmFuZ3VsYXJHcmlkLnVwZGF0ZVBpbm5lZENvbENvbnRhaW5lcldpZHRoQWZ0ZXJDb2xSZXNpemUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5hbmd1bGFyR3JpZC51cGRhdGVCb2R5Q29udGFpbmVyV2lkdGhBZnRlckNvbFJlc2l6ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5hZGp1c3RDb2x1bW5XaWR0aCA9IGZ1bmN0aW9uKG5ld1dpZHRoLCBjb2x1bW4sIGVIZWFkZXJDZWxsKSB7XHJcbiAgICB2YXIgbmV3V2lkdGhQeCA9IG5ld1dpZHRoICsgXCJweFwiO1xyXG4gICAgdmFyIHNlbGVjdG9yRm9yQWxsQ29sc0luQ2VsbCA9IFwiLmNlbGwtY29sLVwiICsgY29sdW1uLmluZGV4O1xyXG4gICAgdmFyIGNlbGxzRm9yVGhpc0NvbCA9IHRoaXMuZVJvb3QucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvckZvckFsbENvbHNJbkNlbGwpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjZWxsc0ZvclRoaXNDb2wubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjZWxsc0ZvclRoaXNDb2xbaV0uc3R5bGUud2lkdGggPSBuZXdXaWR0aFB4O1xyXG4gICAgfVxyXG5cclxuICAgIGVIZWFkZXJDZWxsLnN0eWxlLndpZHRoID0gbmV3V2lkdGhQeDtcclxuICAgIGNvbHVtbi5hY3R1YWxXaWR0aCA9IG5ld1dpZHRoO1xyXG59O1xyXG5cclxuLy8gZ2V0cyBjYWxsZWQgd2hlbiBhIGhlYWRlciAobm90IGEgaGVhZGVyIGdyb3VwKSBnZXRzIHJlc2l6ZWRcclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmhlYWRlckRyYWdDYWxsYmFja0ZhY3RvcnkgPSBmdW5jdGlvbihoZWFkZXJDZWxsLCBjb2x1bW4sIGhlYWRlckdyb3VwKSB7XHJcbiAgICB2YXIgcGFyZW50ID0gdGhpcztcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0V2lkdGggPSBjb2x1bW4uYWN0dWFsV2lkdGg7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkRyYWdnaW5nOiBmdW5jdGlvbihkcmFnQ2hhbmdlKSB7XHJcbiAgICAgICAgICAgIHZhciBuZXdXaWR0aCA9IHRoaXMuc3RhcnRXaWR0aCArIGRyYWdDaGFuZ2U7XHJcbiAgICAgICAgICAgIGlmIChuZXdXaWR0aCA8IGNvbnN0YW50cy5NSU5fQ09MX1dJRFRIKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdXaWR0aCA9IGNvbnN0YW50cy5NSU5fQ09MX1dJRFRIO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwYXJlbnQuYWRqdXN0Q29sdW1uV2lkdGgobmV3V2lkdGgsIGNvbHVtbiwgaGVhZGVyQ2VsbCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaGVhZGVyR3JvdXApIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5zZXRXaWR0aE9mR3JvdXBIZWFkZXJDZWxsKGhlYWRlckdyb3VwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gc2hvdWxkIG5vdCBiZSBjYWxsaW5nIHRoZXNlIGhlcmUsIHNob3VsZCBkbyBzb21ldGhpbmcgZWxzZVxyXG4gICAgICAgICAgICBpZiAoY29sdW1uLnBpbm5lZCkge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50LmFuZ3VsYXJHcmlkLnVwZGF0ZVBpbm5lZENvbENvbnRhaW5lcldpZHRoQWZ0ZXJDb2xSZXNpemUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5hbmd1bGFyR3JpZC51cGRhdGVCb2R5Q29udGFpbmVyV2lkdGhBZnRlckNvbFJlc2l6ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5zdG9wRHJhZ2dpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZVJvb3Quc3R5bGUuY3Vyc29yID0gXCJcIjtcclxuICAgIHRoaXMuZVJvb3Qub25tb3VzZXVwID0gbnVsbDtcclxuICAgIHRoaXMuZVJvb3Qub25tb3VzZWxlYXZlID0gbnVsbDtcclxuICAgIHRoaXMuZVJvb3Qub25tb3VzZW1vdmUgPSBudWxsO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLnVwZGF0ZUZpbHRlckljb25zID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsLmdldFZpc2libGVDb2x1bW5zKCkuZm9yRWFjaChmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgICAgICAvLyB0b2RvOiBuZWVkIHRvIGNoYW5nZSB0aGlzLCBzbyBvbmx5IHVwZGF0ZXMgaWYgY29sdW1uIGlzIHZpc2libGVcclxuICAgICAgICBpZiAoY29sdW1uLmVGaWx0ZXJJY29uKSB7XHJcbiAgICAgICAgICAgIHZhciBmaWx0ZXJQcmVzZW50ID0gdGhhdC5maWx0ZXJNYW5hZ2VyLmlzRmlsdGVyUHJlc2VudEZvckNvbChjb2x1bW4uY29sS2V5KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlTdHlsZSA9IGZpbHRlclByZXNlbnQgPyAnaW5saW5lJyA6ICdub25lJztcclxuICAgICAgICAgICAgY29sdW1uLmVGaWx0ZXJJY29uLnN0eWxlLmRpc3BsYXkgPSBkaXNwbGF5U3R5bGU7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlclJlbmRlcmVyO1xyXG4iLCJ2YXIgZ3JvdXBDcmVhdG9yID0gcmVxdWlyZSgnLi9ncm91cENyZWF0b3InKTtcclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG52YXIgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcclxuXHJcbmZ1bmN0aW9uIEluTWVtb3J5Um93Q29udHJvbGxlcigpIHtcclxuICAgIHRoaXMuY3JlYXRlTW9kZWwoKTtcclxufVxyXG5cclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oZ3JpZE9wdGlvbnNXcmFwcGVyLCBjb2x1bW5Nb2RlbCwgYW5ndWxhckdyaWQsIGZpbHRlck1hbmFnZXIsICRzY29wZSwgZXhwcmVzc2lvblNlcnZpY2UpIHtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyID0gZ3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4gICAgdGhpcy5jb2x1bW5Nb2RlbCA9IGNvbHVtbk1vZGVsO1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkO1xyXG4gICAgdGhpcy5maWx0ZXJNYW5hZ2VyID0gZmlsdGVyTWFuYWdlcjtcclxuICAgIHRoaXMuJHNjb3BlID0gJHNjb3BlO1xyXG4gICAgdGhpcy5leHByZXNzaW9uU2VydmljZSA9IGV4cHJlc3Npb25TZXJ2aWNlO1xyXG5cclxuICAgIHRoaXMuYWxsUm93cyA9IG51bGw7XHJcbiAgICB0aGlzLnJvd3NBZnRlckdyb3VwID0gbnVsbDtcclxuICAgIHRoaXMucm93c0FmdGVyRmlsdGVyID0gbnVsbDtcclxuICAgIHRoaXMucm93c0FmdGVyU29ydCA9IG51bGw7XHJcbiAgICB0aGlzLnJvd3NBZnRlck1hcCA9IG51bGw7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuY3JlYXRlTW9kZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHRoaXMubW9kZWwgPSB7XHJcbiAgICAgICAgLy8gdGhpcyBtZXRob2QgaXMgaW1wbGVtZW50ZWQgYnkgdGhlIGluTWVtb3J5IG1vZGVsIG9ubHksXHJcbiAgICAgICAgLy8gaXQgZ2l2ZXMgdGhlIHRvcCBsZXZlbCBvZiB0aGUgc2VsZWN0aW9uLiB1c2VkIGJ5IHRoZSBzZWxlY3Rpb25cclxuICAgICAgICAvLyBjb250cm9sbGVyLCB3aGVuIGl0IG5lZWRzIHRvIGRvIGEgZnVsbCB0cmF2ZXJzYWxcclxuICAgICAgICBnZXRUb3BMZXZlbE5vZGVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQucm93c0FmdGVyR3JvdXA7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRWaXJ0dWFsUm93OiBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5yb3dzQWZ0ZXJNYXBbaW5kZXhdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VmlydHVhbFJvd0NvdW50OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoYXQucm93c0FmdGVyTWFwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhhdC5yb3dzQWZ0ZXJNYXAubGVuZ3RoO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGZvckVhY2hJbk1lbW9yeTogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgdGhhdC5mb3JFYWNoSW5NZW1vcnkoY2FsbGJhY2spO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG4vLyBwdWJsaWNcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5nZXRNb2RlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubW9kZWw7XHJcbn07XHJcblxyXG4vLyBwdWJsaWNcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5mb3JFYWNoSW5NZW1vcnkgPSBmdW5jdGlvbihjYWxsYmFjaykge1xyXG5cclxuICAgIC8vIGl0ZXJhdGVzIHRocm91Z2ggZWFjaCBpdGVtIGluIG1lbW9yeSwgYW5kIGNhbGxzIHRoZSBjYWxsYmFjayBmdW5jdGlvblxyXG4gICAgZnVuY3Rpb24gZG9DYWxsYmFjayhsaXN0LCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChsaXN0KSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpPGxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gbGlzdFtpXTtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uZ3JvdXAgJiYgZ3JvdXAuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBkb0NhbGxiYWNrKGdyb3VwLmNoaWxkcmVuKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkb0NhbGxiYWNrKHRoaXMucm93c0FmdGVyR3JvdXAsIGNhbGxiYWNrKTtcclxufTtcclxuXHJcbi8vIHB1YmxpY1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZU1vZGVsID0gZnVuY3Rpb24oc3RlcCkge1xyXG5cclxuICAgIC8vIGZhbGx0aHJvdWdoIGluIGJlbG93IHN3aXRjaCBpcyBvbiBwdXJwb3NlXHJcbiAgICBzd2l0Y2ggKHN0ZXApIHtcclxuICAgICAgICBjYXNlIGNvbnN0YW50cy5TVEVQX0VWRVJZVEhJTkc6XHJcbiAgICAgICAgICAgIHRoaXMuZG9Hcm91cGluZygpO1xyXG4gICAgICAgIGNhc2UgY29uc3RhbnRzLlNURVBfRklMVEVSOlxyXG4gICAgICAgICAgICB0aGlzLmRvRmlsdGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZG9BZ2dyZWdhdGUoKTtcclxuICAgICAgICBjYXNlIGNvbnN0YW50cy5TVEVQX1NPUlQ6XHJcbiAgICAgICAgICAgIHRoaXMuZG9Tb3J0KCk7XHJcbiAgICAgICAgY2FzZSBjb25zdGFudHMuU1RFUF9NQVA6XHJcbiAgICAgICAgICAgIHRoaXMuZG9Hcm91cE1hcHBpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldE1vZGVsVXBkYXRlZCgpID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0TW9kZWxVcGRhdGVkKCkoKTtcclxuICAgICAgICB2YXIgJHNjb3BlID0gdGhpcy4kc2NvcGU7XHJcbiAgICAgICAgaWYgKCRzY29wZSkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmRlZmF1bHRHcm91cEFnZ0Z1bmN0aW9uRmFjdG9yeSA9IGZ1bmN0aW9uKGdyb3VwQWdnRmllbGRzKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gZ3JvdXBBZ2dGdW5jdGlvbihyb3dzKSB7XHJcblxyXG4gICAgICAgIHZhciBzdW1zID0ge307XHJcblxyXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqPGdyb3VwQWdnRmllbGRzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIHZhciBjb2xLZXkgPSBncm91cEFnZ0ZpZWxkc1tqXTtcclxuICAgICAgICAgICAgdmFyIHRvdGFsRm9yQ29sdW1uID0gbnVsbDtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGk8cm93cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJvdyA9IHJvd3NbaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgdGhpc0NvbHVtblZhbHVlID0gcm93LmRhdGFbY29sS2V5XTtcclxuICAgICAgICAgICAgICAgIC8vIG9ubHkgaW5jbHVkZSBpZiB0aGUgdmFsdWUgaXMgYSBudW1iZXJcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpc0NvbHVtblZhbHVlID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsRm9yQ29sdW1uICs9IHRoaXNDb2x1bW5WYWx1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBhdCB0aGlzIHBvaW50LCBpZiBubyB2YWx1ZXMgd2VyZSBudW1iZXJzLCB0aGUgcmVzdWx0IGlzIG51bGwgKG5vdCB6ZXJvKVxyXG4gICAgICAgICAgICBzdW1zW2NvbEtleV0gPSB0b3RhbEZvckNvbHVtbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzdW1zO1xyXG5cclxuICAgIH07XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZ2V0VmFsdWUgPSBmdW5jdGlvbihkYXRhLCBjb2xEZWYsIG5vZGUsIHJvd0luZGV4KSB7XHJcbiAgICB2YXIgYXBpID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKCk7XHJcbiAgICB2YXIgY29udGV4dCA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKTtcclxuICAgIHJldHVybiB1dGlscy5nZXRWYWx1ZSh0aGlzLmV4cHJlc3Npb25TZXJ2aWNlLCBkYXRhLCBjb2xEZWYsIG5vZGUsIHJvd0luZGV4LCBhcGksIGNvbnRleHQpO1xyXG59O1xyXG5cclxuLy8gcHVibGljIC0gaXQncyBwb3NzaWJsZSB0byByZWNvbXB1dGUgdGhlIGFnZ3JlZ2F0ZSB3aXRob3V0IGRvaW5nIHRoZSBvdGhlciBwYXJ0c1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmRvQWdncmVnYXRlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGdyb3VwQWdnRnVuY3Rpb24gPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcm91cEFnZ0Z1bmN0aW9uKCk7XHJcbiAgICBpZiAodHlwZW9mIGdyb3VwQWdnRnVuY3Rpb24gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5Q3JlYXRlQWdnRGF0YSh0aGlzLnJvd3NBZnRlckZpbHRlciwgZ3JvdXBBZ2dGdW5jdGlvbik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBncm91cEFnZ0ZpZWxkcyA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEdyb3VwQWdnRmllbGRzKCk7XHJcbiAgICBpZiAoZ3JvdXBBZ2dGaWVsZHMpIHtcclxuICAgICAgICB2YXIgZGVmYXVsdEFnZ0Z1bmN0aW9uID0gdGhpcy5kZWZhdWx0R3JvdXBBZ2dGdW5jdGlvbkZhY3RvcnkoZ3JvdXBBZ2dGaWVsZHMpO1xyXG4gICAgICAgIHRoaXMucmVjdXJzaXZlbHlDcmVhdGVBZ2dEYXRhKHRoaXMucm93c0FmdGVyRmlsdGVyLCBkZWZhdWx0QWdnRnVuY3Rpb24pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG4vLyBwdWJsaWNcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5leHBhbmRPckNvbGxhcHNlQWxsID0gZnVuY3Rpb24oZXhwYW5kLCByb3dOb2Rlcykge1xyXG4gICAgLy8gaWYgZmlyc3QgY2FsbCBpbiByZWN1cnNpb24sIHdlIHNldCBsaXN0IHRvIHBhcmVudCBsaXN0XHJcbiAgICBpZiAocm93Tm9kZXMgPT09IG51bGwpIHtcclxuICAgICAgICByb3dOb2RlcyA9IHRoaXMucm93c0FmdGVyR3JvdXA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFyb3dOb2Rlcykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgcm93Tm9kZXMuZm9yRWFjaChmdW5jdGlvbihub2RlKSB7XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgbm9kZS5leHBhbmRlZCA9IGV4cGFuZDtcclxuICAgICAgICAgICAgX3RoaXMuZXhwYW5kT3JDb2xsYXBzZUFsbChleHBhbmQsIG5vZGUuY2hpbGRyZW4pO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnJlY3Vyc2l2ZWx5Q3JlYXRlQWdnRGF0YSA9IGZ1bmN0aW9uKG5vZGVzLCBncm91cEFnZ0Z1bmN0aW9uKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG5vZGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgLy8gYWdnIGZ1bmN0aW9uIG5lZWRzIHRvIHN0YXJ0IGF0IHRoZSBib3R0b20sIHNvIHRyYXZlcnNlIGZpcnN0XHJcbiAgICAgICAgICAgIHRoaXMucmVjdXJzaXZlbHlDcmVhdGVBZ2dEYXRhKG5vZGUuY2hpbGRyZW5BZnRlckZpbHRlciwgZ3JvdXBBZ2dGdW5jdGlvbik7XHJcbiAgICAgICAgICAgIC8vIGFmdGVyIHRyYXZlcnNhbCwgd2UgY2FuIG5vdyBkbyB0aGUgYWdnIGF0IHRoaXMgbGV2ZWxcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBncm91cEFnZ0Z1bmN0aW9uKG5vZGUuY2hpbGRyZW5BZnRlckZpbHRlcik7XHJcbiAgICAgICAgICAgIG5vZGUuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgICAgIC8vIGlmIHdlIGFyZSBncm91cGluZywgdGhlbiBpdCdzIHBvc3NpYmxlIHRoZXJlIGlzIGEgc2libGluZyBmb290ZXJcclxuICAgICAgICAgICAgLy8gdG8gdGhlIGdyb3VwLCBzbyB1cGRhdGUgdGhlIGRhdGEgaGVyZSBhbHNvIGlmIHRoZXJlIGlzIG9uZVxyXG4gICAgICAgICAgICBpZiAobm9kZS5zaWJsaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLnNpYmxpbmcuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZG9Tb3J0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvL3NlZSBpZiB0aGVyZSBpcyBhIGNvbCB3ZSBhcmUgc29ydGluZyBieVxyXG4gICAgdmFyIHNvcnRpbmdPcHRpb25zID0gW107XHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsLmdldEFsbENvbHVtbnMoKS5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgICAgIGlmIChjb2x1bW4uc29ydCkge1xyXG4gICAgICAgICAgICB2YXIgYXNjZW5kaW5nID0gY29sdW1uLnNvcnQgPT09IGNvbnN0YW50cy5BU0M7XHJcbiAgICAgICAgICAgIHNvcnRpbmdPcHRpb25zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgaW52ZXJ0ZXI6IGFzY2VuZGluZyA/IDEgOiAtMSxcclxuICAgICAgICAgICAgICAgIHNvcnRlZEF0OiBjb2x1bW4uc29ydGVkQXQsXHJcbiAgICAgICAgICAgICAgICBjb2xEZWY6IGNvbHVtbi5jb2xEZWZcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGhlIGNvbHVtbnMgYXJlIHRvIGJlIHNvcnRlZCBpbiB0aGUgb3JkZXIgdGhhdCB0aGUgdXNlciBzZWxlY3RlZCB0aGVtOlxyXG4gICAgc29ydGluZ09wdGlvbnMuc29ydChmdW5jdGlvbihvcHRpb25BLCBvcHRpb25CKXtcclxuICAgICAgICByZXR1cm4gb3B0aW9uQS5zb3J0ZWRBdCAtIG9wdGlvbkIuc29ydGVkQXQ7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgcm93Tm9kZXNCZWZvcmVTb3J0ID0gdGhpcy5yb3dzQWZ0ZXJGaWx0ZXIgPyB0aGlzLnJvd3NBZnRlckZpbHRlci5zbGljZSgwKSA6IG51bGw7XHJcblxyXG4gICAgaWYgKHNvcnRpbmdPcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMuc29ydExpc3Qocm93Tm9kZXNCZWZvcmVTb3J0LCBzb3J0aW5nT3B0aW9ucyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGlmIG5vIHNvcnRpbmcsIHNldCBhbGwgZ3JvdXAgY2hpbGRyZW4gYWZ0ZXIgc29ydCB0byB0aGUgb3JpZ2luYWwgbGlzdFxyXG4gICAgICAgIHRoaXMucmVjdXJzaXZlbHlSZXNldFNvcnQocm93Tm9kZXNCZWZvcmVTb3J0KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJvd3NBZnRlclNvcnQgPSByb3dOb2Rlc0JlZm9yZVNvcnQ7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlSZXNldFNvcnQgPSBmdW5jdGlvbihyb3dOb2Rlcykge1xyXG4gICAgaWYgKCFyb3dOb2Rlcykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gcm93Tm9kZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGl0ZW0gPSByb3dOb2Rlc1tpXTtcclxuICAgICAgICBpZiAoaXRlbS5ncm91cCAmJiBpdGVtLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgIGl0ZW0uY2hpbGRyZW5BZnRlclNvcnQgPSBpdGVtLmNoaWxkcmVuQWZ0ZXJGaWx0ZXI7XHJcbiAgICAgICAgICAgIHRoaXMucmVjdXJzaXZlbHlSZXNldFNvcnQoaXRlbS5jaGlsZHJlbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnNvcnRMaXN0ID0gZnVuY3Rpb24obm9kZXMsIHNvcnRPcHRpb25zKSB7XHJcblxyXG4gICAgLy8gc29ydCBhbnkgZ3JvdXBzIHJlY3Vyc2l2ZWx5XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG5vZGVzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyAvLyBjcml0aWNhbCBzZWN0aW9uLCBubyBmdW5jdGlvbmFsIHByb2dyYW1taW5nXHJcbiAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgIG5vZGUuY2hpbGRyZW5BZnRlclNvcnQgPSBub2RlLmNoaWxkcmVuQWZ0ZXJGaWx0ZXIuc2xpY2UoMCk7XHJcbiAgICAgICAgICAgIHRoaXMuc29ydExpc3Qobm9kZS5jaGlsZHJlbkFmdGVyU29ydCwgc29ydE9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBmdW5jdGlvbiBjb21wYXJlKG9iakEsIG9iakIsIGNvbERlZil7XHJcbiAgICAgICAgdmFyIHZhbHVlQSA9IHRoYXQuZ2V0VmFsdWUob2JqQS5kYXRhLCBjb2xEZWYsIG9iakEpO1xyXG4gICAgICAgIHZhciB2YWx1ZUIgPSB0aGF0LmdldFZhbHVlKG9iakIuZGF0YSwgY29sRGVmLCBvYmpCKTtcclxuICAgICAgICBpZiAoY29sRGVmLmNvbXBhcmF0b3IpIHtcclxuICAgICAgICAgICAgLy9pZiBjb21wYXJhdG9yIHByb3ZpZGVkLCB1c2UgaXRcclxuICAgICAgICAgICAgcmV0dXJuIGNvbERlZi5jb21wYXJhdG9yKHZhbHVlQSwgdmFsdWVCLCBvYmpBLCBvYmpCKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvL290aGVyd2lzZSBkbyBvdXIgb3duIGNvbXBhcmlzb25cclxuICAgICAgICAgICAgcmV0dXJuIHV0aWxzLmRlZmF1bHRDb21wYXJhdG9yKHZhbHVlQSwgdmFsdWVCLCBvYmpBLCBvYmpCKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbm9kZXMuc29ydChmdW5jdGlvbihvYmpBLCBvYmpCKSB7XHJcbiAgICAgICAgLy8gSXRlcmF0ZSBjb2x1bW5zLCByZXR1cm4gdGhlIGZpcnN0IHRoYXQgZG9lc24ndCBtYXRjaFxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzb3J0T3B0aW9ucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgc29ydE9wdGlvbiA9IHNvcnRPcHRpb25zW2ldO1xyXG4gICAgICAgICAgICB2YXIgY29tcGFyZWQgPSBjb21wYXJlKG9iakEsIG9iakIsIHNvcnRPcHRpb24uY29sRGVmKTtcclxuICAgICAgICAgICAgaWYgKGNvbXBhcmVkICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcGFyZWQgKiBzb3J0T3B0aW9uLmludmVydGVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEFsbCBtYXRjaGVkLCB0aGVzZSBhcmUgaWRlbnRpY2FsIGFzIGZhciBhcyB0aGUgc29ydCBpcyBjb25jZXJuZWQ6XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5kb0dyb3VwaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcm93c0FmdGVyR3JvdXA7XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb0ludGVybmFsR3JvdXBpbmcoKSkge1xyXG4gICAgICAgIHZhciBleHBhbmRCeURlZmF1bHQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcm91cERlZmF1bHRFeHBhbmRlZCgpO1xyXG4gICAgICAgIHJvd3NBZnRlckdyb3VwID0gZ3JvdXBDcmVhdG9yLmdyb3VwKHRoaXMuYWxsUm93cywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0R3JvdXBLZXlzKCksXHJcbiAgICAgICAgICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEdyb3VwQWdnRnVuY3Rpb24oKSwgZXhwYW5kQnlEZWZhdWx0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcm93c0FmdGVyR3JvdXAgPSB0aGlzLmFsbFJvd3M7XHJcbiAgICB9XHJcbiAgICB0aGlzLnJvd3NBZnRlckdyb3VwID0gcm93c0FmdGVyR3JvdXA7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBxdWlja0ZpbHRlclByZXNlbnQgPSB0aGlzLmFuZ3VsYXJHcmlkLmdldFF1aWNrRmlsdGVyKCkgIT09IG51bGw7XHJcbiAgICB2YXIgYWR2YW5jZWRGaWx0ZXJQcmVzZW50ID0gdGhpcy5maWx0ZXJNYW5hZ2VyLmlzRmlsdGVyUHJlc2VudCgpO1xyXG4gICAgdmFyIGZpbHRlclByZXNlbnQgPSBxdWlja0ZpbHRlclByZXNlbnQgfHwgYWR2YW5jZWRGaWx0ZXJQcmVzZW50O1xyXG5cclxuICAgIHZhciByb3dzQWZ0ZXJGaWx0ZXI7XHJcbiAgICBpZiAoZmlsdGVyUHJlc2VudCkge1xyXG4gICAgICAgIHJvd3NBZnRlckZpbHRlciA9IHRoaXMuZmlsdGVySXRlbXModGhpcy5yb3dzQWZ0ZXJHcm91cCwgcXVpY2tGaWx0ZXJQcmVzZW50LCBhZHZhbmNlZEZpbHRlclByZXNlbnQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBkbyBpdCBoZXJlXHJcbiAgICAgICAgcm93c0FmdGVyRmlsdGVyID0gdGhpcy5yb3dzQWZ0ZXJHcm91cDtcclxuICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5UmVzZXRGaWx0ZXIodGhpcy5yb3dzQWZ0ZXJHcm91cCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnJvd3NBZnRlckZpbHRlciA9IHJvd3NBZnRlckZpbHRlcjtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5maWx0ZXJJdGVtcyA9IGZ1bmN0aW9uKHJvd05vZGVzLCBxdWlja0ZpbHRlclByZXNlbnQsIGFkdmFuY2VkRmlsdGVyUHJlc2VudCkge1xyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gcm93Tm9kZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSByb3dOb2Rlc1tpXTtcclxuXHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgLy8gZGVhbCB3aXRoIGdyb3VwXHJcbiAgICAgICAgICAgIG5vZGUuY2hpbGRyZW5BZnRlckZpbHRlciA9IHRoaXMuZmlsdGVySXRlbXMobm9kZS5jaGlsZHJlbiwgcXVpY2tGaWx0ZXJQcmVzZW50LCBhZHZhbmNlZEZpbHRlclByZXNlbnQpO1xyXG4gICAgICAgICAgICBpZiAobm9kZS5jaGlsZHJlbkFmdGVyRmlsdGVyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIG5vZGUuYWxsQ2hpbGRyZW5Db3VudCA9IHRoaXMuZ2V0VG90YWxDaGlsZENvdW50KG5vZGUuY2hpbGRyZW5BZnRlckZpbHRlcik7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChub2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRvZXNSb3dQYXNzRmlsdGVyKG5vZGUsIHF1aWNrRmlsdGVyUHJlc2VudCwgYWR2YW5jZWRGaWx0ZXJQcmVzZW50KSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5yZWN1cnNpdmVseVJlc2V0RmlsdGVyID0gZnVuY3Rpb24obm9kZXMpIHtcclxuICAgIGlmICghbm9kZXMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG5vZGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXAgJiYgbm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuQWZ0ZXJGaWx0ZXIgPSBub2RlLmNoaWxkcmVuO1xyXG4gICAgICAgICAgICBub2RlLmFsbENoaWxkcmVuQ291bnQgPSB0aGlzLmdldFRvdGFsQ2hpbGRDb3VudChub2RlLmNoaWxkcmVuQWZ0ZXJGaWx0ZXIpO1xyXG4gICAgICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5UmVzZXRGaWx0ZXIobm9kZS5jaGlsZHJlbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyByb3dzOiB0aGUgcm93cyB0byBwdXQgaW50byB0aGUgbW9kZWxcclxuLy8gZmlyc3RJZDogdGhlIGZpcnN0IGlkIHRvIHVzZSwgdXNlZCBmb3IgcGFnaW5nLCB3aGVyZSB3ZSBhcmUgbm90IG9uIHRoZSBmaXJzdCBwYWdlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuc2V0QWxsUm93cyA9IGZ1bmN0aW9uKHJvd3MsIGZpcnN0SWQpIHtcclxuICAgIHZhciBub2RlcztcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc1Jvd3NBbHJlYWR5R3JvdXBlZCgpKSB7XHJcbiAgICAgICAgbm9kZXMgPSByb3dzO1xyXG4gICAgICAgIHRoaXMucmVjdXJzaXZlbHlDaGVja1VzZXJQcm92aWRlZE5vZGVzKG5vZGVzLCBudWxsLCAwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gcGxhY2UgZWFjaCByb3cgaW50byBhIHdyYXBwZXJcclxuICAgICAgICB2YXIgbm9kZXMgPSBbXTtcclxuICAgICAgICBpZiAocm93cykge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvd3MubGVuZ3RoOyBpKyspIHsgLy8gY291bGQgYmUgbG90cyBvZiByb3dzLCBkb24ndCB1c2UgZnVuY3Rpb25hbCBwcm9ncmFtbWluZ1xyXG4gICAgICAgICAgICAgICAgbm9kZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcm93c1tpXVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgZmlyc3RJZCBwcm92aWRlZCwgdXNlIGl0LCBvdGhlcndpc2Ugc3RhcnQgYXQgMFxyXG4gICAgdmFyIGZpcnN0SWRUb1VzZSA9IGZpcnN0SWQgPyBmaXJzdElkIDogMDtcclxuICAgIHRoaXMucmVjdXJzaXZlbHlBZGRJZFRvTm9kZXMobm9kZXMsIGZpcnN0SWRUb1VzZSk7XHJcbiAgICB0aGlzLmFsbFJvd3MgPSBub2RlcztcclxufTtcclxuXHJcbi8vIGFkZCBpbiBpbmRleCAtIHRoaXMgaXMgdXNlZCBieSB0aGUgc2VsZWN0aW9uQ29udHJvbGxlciAtIHNvIHF1aWNrXHJcbi8vIHRvIGxvb2sgdXAgc2VsZWN0ZWQgcm93c1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnJlY3Vyc2l2ZWx5QWRkSWRUb05vZGVzID0gZnVuY3Rpb24obm9kZXMsIGluZGV4KSB7XHJcbiAgICBpZiAoIW5vZGVzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgbm9kZS5pZCA9IGluZGV4Kys7XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXAgJiYgbm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICBpbmRleCA9IHRoaXMucmVjdXJzaXZlbHlBZGRJZFRvTm9kZXMobm9kZS5jaGlsZHJlbiwgaW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBpbmRleDtcclxufTtcclxuXHJcbi8vIGFkZCBpbiBpbmRleCAtIHRoaXMgaXMgdXNlZCBieSB0aGUgc2VsZWN0aW9uQ29udHJvbGxlciAtIHNvIHF1aWNrXHJcbi8vIHRvIGxvb2sgdXAgc2VsZWN0ZWQgcm93c1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnJlY3Vyc2l2ZWx5Q2hlY2tVc2VyUHJvdmlkZWROb2RlcyA9IGZ1bmN0aW9uKG5vZGVzLCBwYXJlbnQsIGxldmVsKSB7XHJcbiAgICBpZiAoIW5vZGVzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgaWYgKHBhcmVudCkge1xyXG4gICAgICAgICAgICBub2RlLnBhcmVudCA9IHBhcmVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbm9kZS5sZXZlbCA9IGxldmVsO1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgdGhpcy5yZWN1cnNpdmVseUNoZWNrVXNlclByb3ZpZGVkTm9kZXMobm9kZS5jaGlsZHJlbiwgbm9kZSwgbGV2ZWwgKyAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZ2V0VG90YWxDaGlsZENvdW50ID0gZnVuY3Rpb24ocm93Tm9kZXMpIHtcclxuICAgIHZhciBjb3VudCA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHJvd05vZGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHZhciBpdGVtID0gcm93Tm9kZXNbaV07XHJcbiAgICAgICAgaWYgKGl0ZW0uZ3JvdXApIHtcclxuICAgICAgICAgICAgY291bnQgKz0gaXRlbS5hbGxDaGlsZHJlbkNvdW50O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNvdW50O1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmNvcHlHcm91cE5vZGUgPSBmdW5jdGlvbihncm91cE5vZGUsIGNoaWxkcmVuLCBhbGxDaGlsZHJlbkNvdW50KSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdyb3VwOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGdyb3VwTm9kZS5kYXRhLFxyXG4gICAgICAgIGZpZWxkOiBncm91cE5vZGUuZmllbGQsXHJcbiAgICAgICAga2V5OiBncm91cE5vZGUua2V5LFxyXG4gICAgICAgIGV4cGFuZGVkOiBncm91cE5vZGUuZXhwYW5kZWQsXHJcbiAgICAgICAgY2hpbGRyZW46IGNoaWxkcmVuLFxyXG4gICAgICAgIGFsbENoaWxkcmVuQ291bnQ6IGFsbENoaWxkcmVuQ291bnQsXHJcbiAgICAgICAgbGV2ZWw6IGdyb3VwTm9kZS5sZXZlbFxyXG4gICAgfTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5kb0dyb3VwTWFwcGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gZXZlbiBpZiBub3QgZ29pbmcgZ3JvdXBpbmcsIHdlIGRvIHRoZSBtYXBwaW5nLCBhcyB0aGUgY2xpZW50IG1pZ2h0XHJcbiAgICAvLyBvZiBwYXNzZWQgaW4gZGF0YSB0aGF0IGFscmVhZHkgaGFzIGEgZ3JvdXBpbmcgaW4gaXQgc29tZXdoZXJlXHJcbiAgICB2YXIgcm93c0FmdGVyTWFwID0gW107XHJcbiAgICB0aGlzLmFkZFRvTWFwKHJvd3NBZnRlck1hcCwgdGhpcy5yb3dzQWZ0ZXJTb3J0KTtcclxuICAgIHRoaXMucm93c0FmdGVyTWFwID0gcm93c0FmdGVyTWFwO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmFkZFRvTWFwID0gZnVuY3Rpb24obWFwcGVkRGF0YSwgb3JpZ2luYWxOb2Rlcykge1xyXG4gICAgaWYgKCFvcmlnaW5hbE5vZGVzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcmlnaW5hbE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBvcmlnaW5hbE5vZGVzW2ldO1xyXG4gICAgICAgIG1hcHBlZERhdGEucHVzaChub2RlKTtcclxuICAgICAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmV4cGFuZGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkVG9NYXAobWFwcGVkRGF0YSwgbm9kZS5jaGlsZHJlbkFmdGVyU29ydCk7XHJcblxyXG4gICAgICAgICAgICAvLyBwdXQgYSBmb290ZXIgaW4gaWYgdXNlciBpcyBsb29raW5nIGZvciBpdFxyXG4gICAgICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEluY2x1ZGVGb290ZXIoKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZvb3Rlck5vZGUgPSB0aGlzLmNyZWF0ZUZvb3Rlck5vZGUobm9kZSk7XHJcbiAgICAgICAgICAgICAgICBtYXBwZWREYXRhLnB1c2goZm9vdGVyTm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuY3JlYXRlRm9vdGVyTm9kZSA9IGZ1bmN0aW9uKGdyb3VwTm9kZSkge1xyXG4gICAgdmFyIGZvb3Rlck5vZGUgPSB7fTtcclxuICAgIE9iamVjdC5rZXlzKGdyb3VwTm9kZSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICBmb290ZXJOb2RlW2tleV0gPSBncm91cE5vZGVba2V5XTtcclxuICAgIH0pO1xyXG4gICAgZm9vdGVyTm9kZS5mb290ZXIgPSB0cnVlO1xyXG4gICAgLy8gZ2V0IGJvdGggaGVhZGVyIGFuZCBmb290ZXIgdG8gcmVmZXJlbmNlIGVhY2ggb3RoZXIgYXMgc2libGluZ3MuIHRoaXMgaXMgbmV2ZXIgdW5kb25lLFxyXG4gICAgLy8gb25seSBvdmVyd3JpdHRlbi4gc28gaWYgYSBncm91cCBpcyBleHBhbmRlZCwgdGhlbiBjb250cmFjdGVkLCBpdCB3aWxsIGhhdmUgYSBnaG9zdFxyXG4gICAgLy8gc2libGluZyAtIGJ1dCB0aGF0J3MgZmluZSwgYXMgd2UgY2FuIGlnbm9yZSB0aGlzIGlmIHRoZSBoZWFkZXIgaXMgY29udHJhY3RlZC5cclxuICAgIGZvb3Rlck5vZGUuc2libGluZyA9IGdyb3VwTm9kZTtcclxuICAgIGdyb3VwTm9kZS5zaWJsaW5nID0gZm9vdGVyTm9kZTtcclxuICAgIHJldHVybiBmb290ZXJOb2RlO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmRvZXNSb3dQYXNzRmlsdGVyID0gZnVuY3Rpb24obm9kZSwgcXVpY2tGaWx0ZXJQcmVzZW50LCBhZHZhbmNlZEZpbHRlclByZXNlbnQpIHtcclxuICAgIC8vZmlyc3QgdXAsIGNoZWNrIHF1aWNrIGZpbHRlclxyXG4gICAgaWYgKHF1aWNrRmlsdGVyUHJlc2VudCkge1xyXG4gICAgICAgIGlmICghbm9kZS5xdWlja0ZpbHRlckFnZ3JlZ2F0ZVRleHQpIHtcclxuICAgICAgICAgICAgdGhpcy5hZ2dyZWdhdGVSb3dGb3JRdWlja0ZpbHRlcihub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5vZGUucXVpY2tGaWx0ZXJBZ2dyZWdhdGVUZXh0LmluZGV4T2YodGhpcy5hbmd1bGFyR3JpZC5nZXRRdWlja0ZpbHRlcigpKSA8IDApIHtcclxuICAgICAgICAgICAgLy9xdWljayBmaWx0ZXIgZmFpbHMsIHNvIHNraXAgaXRlbVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vc2Vjb25kLCBjaGVjayBhZHZhbmNlZCBmaWx0ZXJcclxuICAgIGlmIChhZHZhbmNlZEZpbHRlclByZXNlbnQpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZmlsdGVyTWFuYWdlci5kb2VzRmlsdGVyUGFzcyhub2RlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vZ290IHRoaXMgZmFyLCBhbGwgZmlsdGVycyBwYXNzXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5hZ2dyZWdhdGVSb3dGb3JRdWlja0ZpbHRlciA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIHZhciBhZ2dyZWdhdGVkVGV4dCA9ICcnO1xyXG4gICAgdGhpcy5jb2x1bW5Nb2RlbC5nZXRBbGxDb2x1bW5zKCkuZm9yRWFjaChmdW5jdGlvbihjb2xEZWZXcmFwcGVyKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBub2RlLmRhdGE7XHJcbiAgICAgICAgdmFyIHZhbHVlID0gZGF0YSA/IGRhdGFbY29sRGVmV3JhcHBlci5jb2xEZWYuZmllbGRdIDogbnVsbDtcclxuICAgICAgICBpZiAodmFsdWUgJiYgdmFsdWUgIT09ICcnKSB7XHJcbiAgICAgICAgICAgIGFnZ3JlZ2F0ZWRUZXh0ID0gYWdncmVnYXRlZFRleHQgKyB2YWx1ZS50b1N0cmluZygpLnRvVXBwZXJDYXNlKCkgKyBcIl9cIjtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIG5vZGUucXVpY2tGaWx0ZXJBZ2dyZWdhdGVUZXh0ID0gYWdncmVnYXRlZFRleHQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEluTWVtb3J5Um93Q29udHJvbGxlcjtcclxuIiwidmFyIFRFTVBMQVRFID0gW1xyXG4gICAgJzxzcGFuIGlkPVwicGFnZVJvd1N1bW1hcnlQYW5lbFwiIGNsYXNzPVwiYWctcGFnaW5nLXJvdy1zdW1tYXJ5LXBhbmVsXCI+JyxcclxuICAgICc8c3BhbiBpZD1cImZpcnN0Um93T25QYWdlXCI+PC9zcGFuPicsXHJcbiAgICAnIFtUT10gJyxcclxuICAgICc8c3BhbiBpZD1cImxhc3RSb3dPblBhZ2VcIj48L3NwYW4+JyxcclxuICAgICcgW09GXSAnLFxyXG4gICAgJzxzcGFuIGlkPVwicmVjb3JkQ291bnRcIj48L3NwYW4+JyxcclxuICAgICc8L3NwYW4+JyxcclxuICAgICc8c3BhbiBjbGFzcz1cImFnLXBhZ2luZy1wYWdlLXN1bW1hcnktcGFuZWxcIj4nLFxyXG4gICAgJzxidXR0b24gY2xhc3M9XCJhZy1wYWdpbmctYnV0dG9uXCIgaWQ9XCJidEZpcnN0XCI+W0ZJUlNUXTwvYnV0dG9uPicsXHJcbiAgICAnPGJ1dHRvbiBjbGFzcz1cImFnLXBhZ2luZy1idXR0b25cIiBpZD1cImJ0UHJldmlvdXNcIj5bUFJFVklPVVNdPC9idXR0b24+JyxcclxuICAgICcgW1BBR0VdICcsXHJcbiAgICAnPHNwYW4gaWQ9XCJjdXJyZW50XCI+PC9zcGFuPicsXHJcbiAgICAnIFtPRl0gJyxcclxuICAgICc8c3BhbiBpZD1cInRvdGFsXCI+PC9zcGFuPicsXHJcbiAgICAnPGJ1dHRvbiBjbGFzcz1cImFnLXBhZ2luZy1idXR0b25cIiBpZD1cImJ0TmV4dFwiPltORVhUXTwvYnV0dG9uPicsXHJcbiAgICAnPGJ1dHRvbiBjbGFzcz1cImFnLXBhZ2luZy1idXR0b25cIiBpZD1cImJ0TGFzdFwiPltMQVNUXTwvYnV0dG9uPicsXHJcbiAgICAnPC9zcGFuPidcclxuXS5qb2luKCcnKTtcclxuXHJcbmZ1bmN0aW9uIFBhZ2luYXRpb25Db250cm9sbGVyKCkge31cclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oZVBhZ2luZ1BhbmVsLCBhbmd1bGFyR3JpZCwgZ3JpZE9wdGlvbnNXcmFwcGVyKSB7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZDtcclxuICAgIHRoaXMucG9wdWxhdGVQYW5lbChlUGFnaW5nUGFuZWwpO1xyXG4gICAgdGhpcy5jYWxsVmVyc2lvbiA9IDA7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuc2V0RGF0YXNvdXJjZSA9IGZ1bmN0aW9uKGRhdGFzb3VyY2UpIHtcclxuICAgIHRoaXMuZGF0YXNvdXJjZSA9IGRhdGFzb3VyY2U7XHJcblxyXG4gICAgaWYgKCFkYXRhc291cmNlKSB7XHJcbiAgICAgICAgLy8gb25seSBjb250aW51ZSBpZiB3ZSBoYXZlIGEgdmFsaWQgZGF0YXNvdXJjZSB0byB3b3JrIHdpdGhcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZXNldCgpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBjb3B5IHBhZ2VTaXplLCB0byBndWFyZCBhZ2FpbnN0IGl0IGNoYW5naW5nIHRoZSB0aGUgZGF0YXNvdXJjZSBiZXR3ZWVuIGNhbGxzXHJcbiAgICB0aGlzLnBhZ2VTaXplID0gdGhpcy5kYXRhc291cmNlLnBhZ2VTaXplO1xyXG4gICAgLy8gc2VlIGlmIHdlIGtub3cgdGhlIHRvdGFsIG51bWJlciBvZiBwYWdlcywgb3IgaWYgaXQncyAndG8gYmUgZGVjaWRlZCdcclxuICAgIGlmICh0eXBlb2YgdGhpcy5kYXRhc291cmNlLnJvd0NvdW50ID09PSAnbnVtYmVyJyAmJiB0aGlzLmRhdGFzb3VyY2Uucm93Q291bnQgPj0gMCkge1xyXG4gICAgICAgIHRoaXMucm93Q291bnQgPSB0aGlzLmRhdGFzb3VyY2Uucm93Q291bnQ7XHJcbiAgICAgICAgdGhpcy5mb3VuZE1heFJvdyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVUb3RhbFBhZ2VzKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMucm93Q291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuZm91bmRNYXhSb3cgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnRvdGFsUGFnZXMgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY3VycmVudFBhZ2UgPSAwO1xyXG5cclxuICAgIC8vIGhpZGUgdGhlIHN1bW1hcnkgcGFuZWwgdW50aWwgc29tZXRoaW5nIGlzIGxvYWRlZFxyXG4gICAgdGhpcy5lUGFnZVJvd1N1bW1hcnlQYW5lbC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XHJcblxyXG4gICAgdGhpcy5zZXRUb3RhbExhYmVscygpO1xyXG4gICAgdGhpcy5sb2FkUGFnZSgpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnNldFRvdGFsTGFiZWxzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5mb3VuZE1heFJvdykge1xyXG4gICAgICAgIHRoaXMubGJUb3RhbC5pbm5lckhUTUwgPSB0aGlzLnRvdGFsUGFnZXMudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgICAgICB0aGlzLmxiUmVjb3JkQ291bnQuaW5uZXJIVE1MID0gdGhpcy5yb3dDb3VudC50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgbW9yZVRleHQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRMb2NhbGVUZXh0RnVuYygpKCdtb3JlJywgJ21vcmUnKTtcclxuICAgICAgICB0aGlzLmxiVG90YWwuaW5uZXJIVE1MID0gbW9yZVRleHQ7XHJcbiAgICAgICAgdGhpcy5sYlJlY29yZENvdW50LmlubmVySFRNTCA9IG1vcmVUZXh0O1xyXG4gICAgfVxyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmNhbGN1bGF0ZVRvdGFsUGFnZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMudG90YWxQYWdlcyA9IE1hdGguZmxvb3IoKHRoaXMucm93Q291bnQgLSAxKSAvIHRoaXMucGFnZVNpemUpICsgMTtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5wYWdlTG9hZGVkID0gZnVuY3Rpb24ocm93cywgbGFzdFJvd0luZGV4KSB7XHJcbiAgICB2YXIgZmlyc3RJZCA9IHRoaXMuY3VycmVudFBhZ2UgKiB0aGlzLnBhZ2VTaXplO1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZC5zZXRSb3dzKHJvd3MsIGZpcnN0SWQpO1xyXG4gICAgLy8gc2VlIGlmIHdlIGhpdCB0aGUgbGFzdCByb3dcclxuICAgIGlmICghdGhpcy5mb3VuZE1heFJvdyAmJiB0eXBlb2YgbGFzdFJvd0luZGV4ID09PSAnbnVtYmVyJyAmJiBsYXN0Um93SW5kZXggPj0gMCkge1xyXG4gICAgICAgIHRoaXMuZm91bmRNYXhSb3cgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMucm93Q291bnQgPSBsYXN0Um93SW5kZXg7XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVUb3RhbFBhZ2VzKCk7XHJcbiAgICAgICAgdGhpcy5zZXRUb3RhbExhYmVscygpO1xyXG5cclxuICAgICAgICAvLyBpZiBvdmVyc2hvdCBwYWdlcywgZ28gYmFja1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQYWdlID4gdGhpcy50b3RhbFBhZ2VzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSB0aGlzLnRvdGFsUGFnZXMgLSAxO1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRQYWdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5lbmFibGVPckRpc2FibGVCdXR0b25zKCk7XHJcbiAgICB0aGlzLnVwZGF0ZVJvd0xhYmVscygpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZVJvd0xhYmVscyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHN0YXJ0Um93O1xyXG4gICAgdmFyIGVuZFJvdztcclxuICAgIGlmICh0aGlzLmlzWmVyb1BhZ2VzVG9EaXNwbGF5KCkpIHtcclxuICAgICAgICBzdGFydFJvdyA9IDA7XHJcbiAgICAgICAgZW5kUm93ID0gMDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc3RhcnRSb3cgPSAodGhpcy5wYWdlU2l6ZSAqIHRoaXMuY3VycmVudFBhZ2UpICsgMTtcclxuICAgICAgICBlbmRSb3cgPSBzdGFydFJvdyArIHRoaXMucGFnZVNpemUgLSAxO1xyXG4gICAgICAgIGlmICh0aGlzLmZvdW5kTWF4Um93ICYmIGVuZFJvdyA+IHRoaXMucm93Q291bnQpIHtcclxuICAgICAgICAgICAgZW5kUm93ID0gdGhpcy5yb3dDb3VudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmxiRmlyc3RSb3dPblBhZ2UuaW5uZXJIVE1MID0gKHN0YXJ0Um93KS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgdGhpcy5sYkxhc3RSb3dPblBhZ2UuaW5uZXJIVE1MID0gKGVuZFJvdykudG9Mb2NhbGVTdHJpbmcoKTtcclxuXHJcbiAgICAvLyBzaG93IHRoZSBzdW1tYXJ5IHBhbmVsLCB3aGVuIGZpcnN0IHNob3duLCB0aGlzIGlzIGJsYW5rXHJcbiAgICB0aGlzLmVQYWdlUm93U3VtbWFyeVBhbmVsLnN0eWxlLnZpc2liaWxpdHkgPSBudWxsO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmxvYWRQYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVuYWJsZU9yRGlzYWJsZUJ1dHRvbnMoKTtcclxuICAgIHZhciBzdGFydFJvdyA9IHRoaXMuY3VycmVudFBhZ2UgKiB0aGlzLmRhdGFzb3VyY2UucGFnZVNpemU7XHJcbiAgICB2YXIgZW5kUm93ID0gKHRoaXMuY3VycmVudFBhZ2UgKyAxKSAqIHRoaXMuZGF0YXNvdXJjZS5wYWdlU2l6ZTtcclxuXHJcbiAgICB0aGlzLmxiQ3VycmVudC5pbm5lckhUTUwgPSAodGhpcy5jdXJyZW50UGFnZSArIDEpLnRvTG9jYWxlU3RyaW5nKCk7XHJcblxyXG4gICAgdGhpcy5jYWxsVmVyc2lvbisrO1xyXG4gICAgdmFyIGNhbGxWZXJzaW9uQ29weSA9IHRoaXMuY2FsbFZlcnNpb247XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkLnNob3dMb2FkaW5nUGFuZWwodHJ1ZSk7XHJcbiAgICB0aGlzLmRhdGFzb3VyY2UuZ2V0Um93cyhzdGFydFJvdywgZW5kUm93LFxyXG4gICAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3Mocm93cywgbGFzdFJvd0luZGV4KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGF0LmlzQ2FsbERhZW1vbihjYWxsVmVyc2lvbkNvcHkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhhdC5wYWdlTG9hZGVkKHJvd3MsIGxhc3RSb3dJbmRleCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmdW5jdGlvbiBmYWlsKCkge1xyXG4gICAgICAgICAgICBpZiAodGhhdC5pc0NhbGxEYWVtb24oY2FsbFZlcnNpb25Db3B5KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHNldCBpbiBhbiBlbXB0eSBzZXQgb2Ygcm93cywgdGhpcyB3aWxsIGF0XHJcbiAgICAgICAgICAgIC8vIGxlYXN0IGdldCByaWQgb2YgdGhlIGxvYWRpbmcgcGFuZWwsIGFuZFxyXG4gICAgICAgICAgICAvLyBzdG9wIGJsb2NraW5nIHRoaW5nc1xyXG4gICAgICAgICAgICB0aGF0LmFuZ3VsYXJHcmlkLnNldFJvd3MoW10pO1xyXG4gICAgICAgIH1cclxuICAgICk7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuaXNDYWxsRGFlbW9uID0gZnVuY3Rpb24odmVyc2lvbkNvcHkpIHtcclxuICAgIHJldHVybiB2ZXJzaW9uQ29weSAhPT0gdGhpcy5jYWxsVmVyc2lvbjtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5vbkJ0TmV4dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdXJyZW50UGFnZSsrO1xyXG4gICAgdGhpcy5sb2FkUGFnZSgpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLm9uQnRQcmV2aW91cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdXJyZW50UGFnZS0tO1xyXG4gICAgdGhpcy5sb2FkUGFnZSgpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLm9uQnRGaXJzdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdXJyZW50UGFnZSA9IDA7XHJcbiAgICB0aGlzLmxvYWRQYWdlKCk7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUub25CdExhc3QgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY3VycmVudFBhZ2UgPSB0aGlzLnRvdGFsUGFnZXMgLSAxO1xyXG4gICAgdGhpcy5sb2FkUGFnZSgpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmlzWmVyb1BhZ2VzVG9EaXNwbGF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5mb3VuZE1heFJvdyAmJiB0aGlzLnRvdGFsUGFnZXMgPT09IDA7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZW5hYmxlT3JEaXNhYmxlQnV0dG9ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGRpc2FibGVQcmV2aW91c0FuZEZpcnN0ID0gdGhpcy5jdXJyZW50UGFnZSA9PT0gMDtcclxuICAgIHRoaXMuYnRQcmV2aW91cy5kaXNhYmxlZCA9IGRpc2FibGVQcmV2aW91c0FuZEZpcnN0O1xyXG4gICAgdGhpcy5idEZpcnN0LmRpc2FibGVkID0gZGlzYWJsZVByZXZpb3VzQW5kRmlyc3Q7XHJcblxyXG4gICAgdmFyIHplcm9QYWdlc1RvRGlzcGxheSA9IHRoaXMuaXNaZXJvUGFnZXNUb0Rpc3BsYXkoKTtcclxuICAgIHZhciBvbkxhc3RQYWdlID0gdGhpcy5mb3VuZE1heFJvdyAmJiB0aGlzLmN1cnJlbnRQYWdlID09PSAodGhpcy50b3RhbFBhZ2VzIC0gMSk7XHJcblxyXG4gICAgdmFyIGRpc2FibGVOZXh0ID0gb25MYXN0UGFnZSB8fCB6ZXJvUGFnZXNUb0Rpc3BsYXk7XHJcbiAgICB0aGlzLmJ0TmV4dC5kaXNhYmxlZCA9IGRpc2FibGVOZXh0O1xyXG5cclxuICAgIHZhciBkaXNhYmxlTGFzdCA9ICF0aGlzLmZvdW5kTWF4Um93IHx8IHplcm9QYWdlc1RvRGlzcGxheSB8fCB0aGlzLmN1cnJlbnRQYWdlID09PSAodGhpcy50b3RhbFBhZ2VzIC0gMSk7XHJcbiAgICB0aGlzLmJ0TGFzdC5kaXNhYmxlZCA9IGRpc2FibGVMYXN0O1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmNyZWF0ZVRlbXBsYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbG9jYWxlVGV4dEZ1bmMgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRMb2NhbGVUZXh0RnVuYygpO1xyXG4gICAgcmV0dXJuIFRFTVBMQVRFXHJcbiAgICAgICAgLnJlcGxhY2UoJ1tQQUdFXScsIGxvY2FsZVRleHRGdW5jKCdwYWdlJywgJ1BhZ2UnKSlcclxuICAgICAgICAucmVwbGFjZSgnW1RPXScsIGxvY2FsZVRleHRGdW5jKCd0bycsICd0bycpKVxyXG4gICAgICAgIC5yZXBsYWNlKCdbT0ZdJywgbG9jYWxlVGV4dEZ1bmMoJ29mJywgJ29mJykpXHJcbiAgICAgICAgLnJlcGxhY2UoJ1tPRl0nLCBsb2NhbGVUZXh0RnVuYygnb2YnLCAnb2YnKSlcclxuICAgICAgICAucmVwbGFjZSgnW0ZJUlNUXScsIGxvY2FsZVRleHRGdW5jKCdmaXJzdCcsICdGaXJzdCcpKVxyXG4gICAgICAgIC5yZXBsYWNlKCdbUFJFVklPVVNdJywgbG9jYWxlVGV4dEZ1bmMoJ3ByZXZpb3VzJywgJ1ByZXZpb3VzJykpXHJcbiAgICAgICAgLnJlcGxhY2UoJ1tORVhUXScsIGxvY2FsZVRleHRGdW5jKCduZXh0JywgJ05leHQnKSlcclxuICAgICAgICAucmVwbGFjZSgnW0xBU1RdJywgbG9jYWxlVGV4dEZ1bmMoJ2xhc3QnLCAnTGFzdCcpKTtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5wb3B1bGF0ZVBhbmVsID0gZnVuY3Rpb24oZVBhZ2luZ1BhbmVsKSB7XHJcblxyXG4gICAgZVBhZ2luZ1BhbmVsLmlubmVySFRNTCA9IHRoaXMuY3JlYXRlVGVtcGxhdGUoKTtcclxuXHJcbiAgICB0aGlzLmJ0TmV4dCA9IGVQYWdpbmdQYW5lbC5xdWVyeVNlbGVjdG9yKCcjYnROZXh0Jyk7XHJcbiAgICB0aGlzLmJ0UHJldmlvdXMgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI2J0UHJldmlvdXMnKTtcclxuICAgIHRoaXMuYnRGaXJzdCA9IGVQYWdpbmdQYW5lbC5xdWVyeVNlbGVjdG9yKCcjYnRGaXJzdCcpO1xyXG4gICAgdGhpcy5idExhc3QgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI2J0TGFzdCcpO1xyXG4gICAgdGhpcy5sYkN1cnJlbnQgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI2N1cnJlbnQnKTtcclxuICAgIHRoaXMubGJUb3RhbCA9IGVQYWdpbmdQYW5lbC5xdWVyeVNlbGVjdG9yKCcjdG90YWwnKTtcclxuXHJcbiAgICB0aGlzLmxiUmVjb3JkQ291bnQgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI3JlY29yZENvdW50Jyk7XHJcbiAgICB0aGlzLmxiRmlyc3RSb3dPblBhZ2UgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI2ZpcnN0Um93T25QYWdlJyk7XHJcbiAgICB0aGlzLmxiTGFzdFJvd09uUGFnZSA9IGVQYWdpbmdQYW5lbC5xdWVyeVNlbGVjdG9yKCcjbGFzdFJvd09uUGFnZScpO1xyXG4gICAgdGhpcy5lUGFnZVJvd1N1bW1hcnlQYW5lbCA9IGVQYWdpbmdQYW5lbC5xdWVyeVNlbGVjdG9yKCcjcGFnZVJvd1N1bW1hcnlQYW5lbCcpO1xyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICB0aGlzLmJ0TmV4dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQub25CdE5leHQoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYnRQcmV2aW91cy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQub25CdFByZXZpb3VzKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmJ0Rmlyc3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGF0Lm9uQnRGaXJzdCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5idExhc3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGF0Lm9uQnRMYXN0KCk7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGFnaW5hdGlvbkNvbnRyb2xsZXI7XHJcbiIsInZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcbnZhciBncm91cENlbGxSZW5kZXJlckZhY3RvcnkgPSByZXF1aXJlKCcuL2NlbGxSZW5kZXJlcnMvZ3JvdXBDZWxsUmVuZGVyZXJGYWN0b3J5Jyk7XHJcblxyXG5mdW5jdGlvbiBSb3dSZW5kZXJlcigpIHt9XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGdyaWRPcHRpb25zLCBjb2x1bW5Nb2RlbCwgZ3JpZE9wdGlvbnNXcmFwcGVyLCBlR3JpZCxcclxuICAgIGFuZ3VsYXJHcmlkLCBzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnksICRjb21waWxlLCAkc2NvcGUsXHJcbiAgICBzZWxlY3Rpb25Db250cm9sbGVyLCBleHByZXNzaW9uU2VydmljZSwgdGVtcGxhdGVTZXJ2aWNlLCBlUGFyZW50T2ZSb3dzKSB7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zID0gZ3JpZE9wdGlvbnM7XHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsID0gY29sdW1uTW9kZWw7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZDtcclxuICAgIHRoaXMuc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5ID0gc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5O1xyXG4gICAgdGhpcy5maW5kQWxsRWxlbWVudHMoZUdyaWQpO1xyXG4gICAgdGhpcy4kY29tcGlsZSA9ICRjb21waWxlO1xyXG4gICAgdGhpcy4kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIgPSBzZWxlY3Rpb25Db250cm9sbGVyO1xyXG4gICAgdGhpcy5leHByZXNzaW9uU2VydmljZSA9IGV4cHJlc3Npb25TZXJ2aWNlO1xyXG4gICAgdGhpcy50ZW1wbGF0ZVNlcnZpY2UgPSB0ZW1wbGF0ZVNlcnZpY2U7XHJcbiAgICB0aGlzLmVQYXJlbnRPZlJvd3MgPSBlUGFyZW50T2ZSb3dzO1xyXG5cclxuICAgIHRoaXMuY2VsbFJlbmRlcmVyTWFwID0ge1xyXG4gICAgICAgICdncm91cCc6IGdyb3VwQ2VsbFJlbmRlcmVyRmFjdG9yeShncmlkT3B0aW9uc1dyYXBwZXIsIHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSlcclxuICAgIH07XHJcblxyXG4gICAgLy8gbWFwIG9mIHJvdyBpZHMgdG8gcm93IG9iamVjdHMuIGtlZXBzIHRyYWNrIG9mIHdoaWNoIGVsZW1lbnRzXHJcbiAgICAvLyBhcmUgcmVuZGVyZWQgZm9yIHdoaWNoIHJvd3MgaW4gdGhlIGRvbS4gZWFjaCByb3cgb2JqZWN0IGhhczpcclxuICAgIC8vIFtzY29wZSwgYm9keVJvdywgcGlubmVkUm93LCByb3dEYXRhXVxyXG4gICAgdGhpcy5yZW5kZXJlZFJvd3MgPSB7fTtcclxuXHJcbiAgICB0aGlzLnJlbmRlcmVkUm93U3RhcnRFZGl0aW5nTGlzdGVuZXJzID0ge307XHJcblxyXG4gICAgdGhpcy5lZGl0aW5nQ2VsbCA9IGZhbHNlOyAvL2dldHMgc2V0IHRvIHRydWUgd2hlbiBlZGl0aW5nIGEgY2VsbFxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnNldFJvd01vZGVsID0gZnVuY3Rpb24ocm93TW9kZWwpIHtcclxuICAgIHRoaXMucm93TW9kZWwgPSByb3dNb2RlbDtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zZXRNYWluUm93V2lkdGhzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbWFpblJvd1dpZHRoID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRCb2R5Q29udGFpbmVyV2lkdGgoKSArIFwicHhcIjtcclxuXHJcbiAgICB2YXIgdW5waW5uZWRSb3dzID0gdGhpcy5lQm9keUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiLmFnLXJvd1wiKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdW5waW5uZWRSb3dzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdW5waW5uZWRSb3dzW2ldLnN0eWxlLndpZHRoID0gbWFpblJvd1dpZHRoO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmZpbmRBbGxFbGVtZW50cyA9IGZ1bmN0aW9uKGVHcmlkKSB7XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgdGhpcy5lQm9keUNvbnRhaW5lciA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keS1jb250YWluZXJcIik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZUJvZHlDb250YWluZXIgPSBlR3JpZC5xdWVyeVNlbGVjdG9yKFwiLmFnLWJvZHktY29udGFpbmVyXCIpO1xyXG4gICAgICAgIHRoaXMuZUJvZHlWaWV3cG9ydCA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keS12aWV3cG9ydFwiKTtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyID0gZUdyaWQucXVlcnlTZWxlY3RvcihcIi5hZy1waW5uZWQtY29scy1jb250YWluZXJcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUucmVmcmVzaFZpZXcgPSBmdW5jdGlvbihyZWZyZXNoRnJvbUluZGV4KSB7XHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9udFVzZVNjcm9sbHMoKSkge1xyXG4gICAgICAgIHZhciByb3dDb3VudCA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvd0NvdW50KCk7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lckhlaWdodCA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0hlaWdodCgpICogcm93Q291bnQ7XHJcbiAgICAgICAgdGhpcy5lQm9keUNvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBjb250YWluZXJIZWlnaHQgKyBcInB4XCI7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc0NvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBjb250YWluZXJIZWlnaHQgKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZWZyZXNoQWxsVmlydHVhbFJvd3MocmVmcmVzaEZyb21JbmRleCk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuc29mdFJlZnJlc2hWaWV3ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGZpcnN0ID0gdGhpcy5maXJzdFZpcnR1YWxSZW5kZXJlZFJvdztcclxuICAgIHZhciBsYXN0ID0gdGhpcy5sYXN0VmlydHVhbFJlbmRlcmVkUm93O1xyXG5cclxuICAgIHZhciBjb2x1bW5zID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRWaXNpYmxlQ29sdW1ucygpO1xyXG4gICAgLy8gaWYgbm8gY29scywgZG9uJ3QgZHJhdyByb3dcclxuICAgIGlmICghY29sdW1ucyB8fCBjb2x1bW5zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKHZhciByb3dJbmRleCA9IGZpcnN0OyByb3dJbmRleCA8PSBsYXN0OyByb3dJbmRleCsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnJvd01vZGVsLmdldFZpcnR1YWxSb3cocm93SW5kZXgpO1xyXG4gICAgICAgIGlmIChub2RlKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBjb2xJbmRleCA9IDA7IGNvbEluZGV4IDw9IGNvbHVtbnMubGVuZ3RoOyBjb2xJbmRleCsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29sdW1uID0gY29sdW1uc1tjb2xJbmRleF07XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVuZGVyZWRSb3cgPSB0aGlzLnJlbmRlcmVkUm93c1tyb3dJbmRleF07XHJcbiAgICAgICAgICAgICAgICB2YXIgZUdyaWRDZWxsID0gcmVuZGVyZWRSb3cuZVZvbGF0aWxlQ2VsbHNbY29sSW5kZXhdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghZUdyaWRDZWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGlzRmlyc3RDb2x1bW4gPSBjb2xJbmRleCA9PT0gMDtcclxuICAgICAgICAgICAgICAgIHZhciBzY29wZSA9IHJlbmRlcmVkUm93LnNjb3BlO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc29mdFJlZnJlc2hDZWxsKGVHcmlkQ2VsbCwgaXNGaXJzdENvbHVtbiwgbm9kZSwgY29sdW1uLCBzY29wZSwgcm93SW5kZXgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnNvZnRSZWZyZXNoQ2VsbCA9IGZ1bmN0aW9uKGVHcmlkQ2VsbCwgaXNGaXJzdENvbHVtbiwgbm9kZSwgY29sdW1uLCBzY29wZSwgcm93SW5kZXgpIHtcclxuXHJcbiAgICB1dGlscy5yZW1vdmVBbGxDaGlsZHJlbihlR3JpZENlbGwpO1xyXG5cclxuICAgIHZhciBkYXRhID0gdGhpcy5nZXREYXRhRm9yTm9kZShub2RlKTtcclxuICAgIHZhciB2YWx1ZUdldHRlciA9IHRoaXMuY3JlYXRlVmFsdWVHZXR0ZXIoZGF0YSwgY29sdW1uLmNvbERlZiwgbm9kZSk7XHJcblxyXG4gICAgdmFyIHZhbHVlO1xyXG4gICAgaWYgKHZhbHVlR2V0dGVyKSB7XHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZUdldHRlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucG9wdWxhdGVBbmRTdHlsZUdyaWRDZWxsKHZhbHVlR2V0dGVyLCB2YWx1ZSwgZUdyaWRDZWxsLCBpc0ZpcnN0Q29sdW1uLCBub2RlLCBjb2x1bW4sIHJvd0luZGV4LCBzY29wZSk7XHJcblxyXG4gICAgLy8gaWYgYW5ndWxhciBjb21waWxpbmcsIHRoZW4gbmVlZCB0byBhbHNvIGNvbXBpbGUgdGhlIGNlbGwgYWdhaW4gKGFuZ3VsYXIgY29tcGlsaW5nIHN1Y2tzLCBwbGVhc2Ugd2FpdC4uLilcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0FuZ3VsYXJDb21waWxlUm93cygpKSB7XHJcbiAgICAgICAgdGhpcy4kY29tcGlsZShlR3JpZENlbGwpKHNjb3BlKTtcclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5yb3dEYXRhQ2hhbmdlZCA9IGZ1bmN0aW9uKHJvd3MpIHtcclxuICAgIC8vIHdlIG9ubHkgbmVlZCB0byBiZSB3b3JyaWVkIGFib3V0IHJlbmRlcmVkIHJvd3MsIGFzIHRoaXMgbWV0aG9kIGlzXHJcbiAgICAvLyBjYWxsZWQgdG8gd2hhdHMgcmVuZGVyZWQuIGlmIHRoZSByb3cgaXNuJ3QgcmVuZGVyZWQsIHdlIGRvbid0IGNhcmVcclxuICAgIHZhciBpbmRleGVzVG9SZW1vdmUgPSBbXTtcclxuICAgIHZhciByZW5kZXJlZFJvd3MgPSB0aGlzLnJlbmRlcmVkUm93cztcclxuICAgIE9iamVjdC5rZXlzKHJlbmRlcmVkUm93cykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICB2YXIgcmVuZGVyZWRSb3cgPSByZW5kZXJlZFJvd3Nba2V5XTtcclxuICAgICAgICAvLyBzZWUgaWYgdGhlIHJlbmRlcmVkIHJvdyBpcyBpbiB0aGUgbGlzdCBvZiByb3dzIHdlIGhhdmUgdG8gdXBkYXRlXHJcbiAgICAgICAgdmFyIHJvd05lZWRzVXBkYXRpbmcgPSByb3dzLmluZGV4T2YocmVuZGVyZWRSb3cubm9kZS5kYXRhKSA+PSAwO1xyXG4gICAgICAgIGlmIChyb3dOZWVkc1VwZGF0aW5nKSB7XHJcbiAgICAgICAgICAgIGluZGV4ZXNUb1JlbW92ZS5wdXNoKGtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAvLyByZW1vdmUgdGhlIHJvd3NcclxuICAgIHRoaXMucmVtb3ZlVmlydHVhbFJvd3MoaW5kZXhlc1RvUmVtb3ZlKTtcclxuICAgIC8vIGFkZCBkcmF3IHRoZW0gYWdhaW5cclxuICAgIHRoaXMuZHJhd1ZpcnR1YWxSb3dzKCk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUucmVmcmVzaEFsbFZpcnR1YWxSb3dzID0gZnVuY3Rpb24oZnJvbUluZGV4KSB7XHJcbiAgICAvLyByZW1vdmUgYWxsIGN1cnJlbnQgdmlydHVhbCByb3dzLCBhcyB0aGV5IGhhdmUgb2xkIGRhdGFcclxuICAgIHZhciByb3dzVG9SZW1vdmUgPSBPYmplY3Qua2V5cyh0aGlzLnJlbmRlcmVkUm93cyk7XHJcbiAgICB0aGlzLnJlbW92ZVZpcnR1YWxSb3dzKHJvd3NUb1JlbW92ZSwgZnJvbUluZGV4KTtcclxuXHJcbiAgICAvLyBhZGQgaW4gbmV3IHJvd3NcclxuICAgIHRoaXMuZHJhd1ZpcnR1YWxSb3dzKCk7XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgLSByZW1vdmVzIHRoZSBncm91cCByb3dzIGFuZCB0aGVuIHJlZHJhd3MgdGhlbSBhZ2FpblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUucmVmcmVzaEdyb3VwUm93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gZmluZCBhbGwgdGhlIGdyb3VwIHJvd3NcclxuICAgIHZhciByb3dzVG9SZW1vdmUgPSBbXTtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIE9iamVjdC5rZXlzKHRoaXMucmVuZGVyZWRSb3dzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIHZhciByZW5kZXJlZFJvdyA9IHRoYXQucmVuZGVyZWRSb3dzW2tleV07XHJcbiAgICAgICAgdmFyIG5vZGUgPSByZW5kZXJlZFJvdy5ub2RlO1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIHJvd3NUb1JlbW92ZS5wdXNoKGtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAvLyByZW1vdmUgdGhlIHJvd3NcclxuICAgIHRoaXMucmVtb3ZlVmlydHVhbFJvd3Mocm93c1RvUmVtb3ZlKTtcclxuICAgIC8vIGFuZCBkcmF3IHRoZW0gYmFjayBhZ2FpblxyXG4gICAgdGhpcy5lbnN1cmVSb3dzUmVuZGVyZWQoKTtcclxufTtcclxuXHJcbi8vIHRha2VzIGFycmF5IG9mIHJvdyBpbmRleGVzXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5yZW1vdmVWaXJ0dWFsUm93cyA9IGZ1bmN0aW9uKHJvd3NUb1JlbW92ZSwgZnJvbUluZGV4KSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAvLyBpZiBubyBmcm9tIGluZGUgdGhlbiBzZXQgdG8gLTEsIHdoaWNoIHdpbGwgcmVmcmVzaCBldmVyeXRoaW5nXHJcbiAgICB2YXIgcmVhbEZyb21JbmRleCA9ICh0eXBlb2YgZnJvbUluZGV4ID09PSAnbnVtYmVyJykgPyBmcm9tSW5kZXggOiAtMTtcclxuICAgIHJvd3NUb1JlbW92ZS5mb3JFYWNoKGZ1bmN0aW9uKGluZGV4VG9SZW1vdmUpIHtcclxuICAgICAgICBpZiAoaW5kZXhUb1JlbW92ZSA+PSByZWFsRnJvbUluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoYXQucmVtb3ZlVmlydHVhbFJvdyhpbmRleFRvUmVtb3ZlKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5yZW1vdmVWaXJ0dWFsUm93ID0gZnVuY3Rpb24oaW5kZXhUb1JlbW92ZSkge1xyXG4gICAgdmFyIHJlbmRlcmVkUm93ID0gdGhpcy5yZW5kZXJlZFJvd3NbaW5kZXhUb1JlbW92ZV07XHJcbiAgICBpZiAocmVuZGVyZWRSb3cucGlubmVkRWxlbWVudCAmJiB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyKSB7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc0NvbnRhaW5lci5yZW1vdmVDaGlsZChyZW5kZXJlZFJvdy5waW5uZWRFbGVtZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVuZGVyZWRSb3cuYm9keUVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmVCb2R5Q29udGFpbmVyLnJlbW92ZUNoaWxkKHJlbmRlcmVkUm93LmJvZHlFbGVtZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVuZGVyZWRSb3cuc2NvcGUpIHtcclxuICAgICAgICByZW5kZXJlZFJvdy5zY29wZS4kZGVzdHJveSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRWaXJ0dWFsUm93UmVtb3ZlZCgpKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0VmlydHVhbFJvd1JlbW92ZWQoKShyZW5kZXJlZFJvdy5kYXRhLCBpbmRleFRvUmVtb3ZlKTtcclxuICAgIH1cclxuICAgIHRoaXMuYW5ndWxhckdyaWQub25WaXJ0dWFsUm93UmVtb3ZlZChpbmRleFRvUmVtb3ZlKTtcclxuXHJcbiAgICBkZWxldGUgdGhpcy5yZW5kZXJlZFJvd3NbaW5kZXhUb1JlbW92ZV07XHJcbiAgICBkZWxldGUgdGhpcy5yZW5kZXJlZFJvd1N0YXJ0RWRpdGluZ0xpc3RlbmVyc1tpbmRleFRvUmVtb3ZlXTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5kcmF3VmlydHVhbFJvd3MgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBmaXJzdDtcclxuICAgIHZhciBsYXN0O1xyXG5cclxuICAgIHZhciByb3dDb3VudCA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvd0NvdW50KCk7XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9udFVzZVNjcm9sbHMoKSkge1xyXG4gICAgICAgIGZpcnN0ID0gMDtcclxuICAgICAgICBsYXN0ID0gcm93Q291bnQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciB0b3BQaXhlbCA9IHRoaXMuZUJvZHlWaWV3cG9ydC5zY3JvbGxUb3A7XHJcbiAgICAgICAgdmFyIGJvdHRvbVBpeGVsID0gdG9wUGl4ZWwgKyB0aGlzLmVCb2R5Vmlld3BvcnQub2Zmc2V0SGVpZ2h0O1xyXG5cclxuICAgICAgICBmaXJzdCA9IE1hdGguZmxvb3IodG9wUGl4ZWwgLyB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dIZWlnaHQoKSk7XHJcbiAgICAgICAgbGFzdCA9IE1hdGguZmxvb3IoYm90dG9tUGl4ZWwgLyB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dIZWlnaHQoKSk7XHJcblxyXG4gICAgICAgIC8vYWRkIGluIGJ1ZmZlclxyXG4gICAgICAgIHZhciBidWZmZXIgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dCdWZmZXIoKSB8fCBjb25zdGFudHMuUk9XX0JVRkZFUl9TSVpFO1xyXG4gICAgICAgIGZpcnN0ID0gZmlyc3QgLSBidWZmZXI7XHJcbiAgICAgICAgbGFzdCA9IGxhc3QgKyBidWZmZXI7XHJcblxyXG4gICAgICAgIC8vIGFkanVzdCwgaW4gY2FzZSBidWZmZXIgZXh0ZW5kZWQgYWN0dWFsIHNpemVcclxuICAgICAgICBpZiAoZmlyc3QgPCAwKSB7XHJcbiAgICAgICAgICAgIGZpcnN0ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGxhc3QgPiByb3dDb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgbGFzdCA9IHJvd0NvdW50IC0gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5maXJzdFZpcnR1YWxSZW5kZXJlZFJvdyA9IGZpcnN0O1xyXG4gICAgdGhpcy5sYXN0VmlydHVhbFJlbmRlcmVkUm93ID0gbGFzdDtcclxuXHJcbiAgICB0aGlzLmVuc3VyZVJvd3NSZW5kZXJlZCgpO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmdldEZpcnN0VmlydHVhbFJlbmRlcmVkUm93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5maXJzdFZpcnR1YWxSZW5kZXJlZFJvdztcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5nZXRMYXN0VmlydHVhbFJlbmRlcmVkUm93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5sYXN0VmlydHVhbFJlbmRlcmVkUm93O1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmVuc3VyZVJvd3NSZW5kZXJlZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBtYWluUm93V2lkdGggPSB0aGlzLmNvbHVtbk1vZGVsLmdldEJvZHlDb250YWluZXJXaWR0aCgpO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIC8vIGF0IHRoZSBlbmQsIHRoaXMgYXJyYXkgd2lsbCBjb250YWluIHRoZSBpdGVtcyB3ZSBuZWVkIHRvIHJlbW92ZVxyXG4gICAgdmFyIHJvd3NUb1JlbW92ZSA9IE9iamVjdC5rZXlzKHRoaXMucmVuZGVyZWRSb3dzKTtcclxuXHJcbiAgICAvLyBhZGQgaW4gbmV3IHJvd3NcclxuICAgIGZvciAodmFyIHJvd0luZGV4ID0gdGhpcy5maXJzdFZpcnR1YWxSZW5kZXJlZFJvdzsgcm93SW5kZXggPD0gdGhpcy5sYXN0VmlydHVhbFJlbmRlcmVkUm93OyByb3dJbmRleCsrKSB7XHJcbiAgICAgICAgLy8gc2VlIGlmIGl0ZW0gYWxyZWFkeSB0aGVyZSwgYW5kIGlmIHllcywgdGFrZSBpdCBvdXQgb2YgdGhlICd0byByZW1vdmUnIGFycmF5XHJcbiAgICAgICAgaWYgKHJvd3NUb1JlbW92ZS5pbmRleE9mKHJvd0luZGV4LnRvU3RyaW5nKCkpID49IDApIHtcclxuICAgICAgICAgICAgcm93c1RvUmVtb3ZlLnNwbGljZShyb3dzVG9SZW1vdmUuaW5kZXhPZihyb3dJbmRleC50b1N0cmluZygpKSwgMSk7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjaGVjayB0aGlzIHJvdyBhY3R1YWxseSBleGlzdHMgKGluIGNhc2Ugb3ZlcmZsb3cgYnVmZmVyIHdpbmRvdyBleGNlZWRzIHJlYWwgZGF0YSlcclxuICAgICAgICB2YXIgbm9kZSA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvdyhyb3dJbmRleCk7XHJcbiAgICAgICAgaWYgKG5vZGUpIHtcclxuICAgICAgICAgICAgdGhhdC5pbnNlcnRSb3cobm9kZSwgcm93SW5kZXgsIG1haW5Sb3dXaWR0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGF0IHRoaXMgcG9pbnQsIGV2ZXJ5dGhpbmcgaW4gb3VyICdyb3dzVG9SZW1vdmUnIC4gLiAuXHJcbiAgICB0aGlzLnJlbW92ZVZpcnR1YWxSb3dzKHJvd3NUb1JlbW92ZSk7XHJcblxyXG4gICAgLy8gaWYgd2UgYXJlIGRvaW5nIGFuZ3VsYXIgY29tcGlsaW5nLCB0aGVuIGRvIGRpZ2VzdCB0aGUgc2NvcGUgaGVyZVxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzQW5ndWxhckNvbXBpbGVSb3dzKCkpIHtcclxuICAgICAgICAvLyB3ZSBkbyBpdCBpbiBhIHRpbWVvdXQsIGluIGNhc2Ugd2UgYXJlIGFscmVhZHkgaW4gYW4gYXBwbHlcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LiRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9LCAwKTtcclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5pbnNlcnRSb3cgPSBmdW5jdGlvbihub2RlLCByb3dJbmRleCwgbWFpblJvd1dpZHRoKSB7XHJcbiAgICB2YXIgY29sdW1ucyA9IHRoaXMuY29sdW1uTW9kZWwuZ2V0VmlzaWJsZUNvbHVtbnMoKTtcclxuICAgIC8vIGlmIG5vIGNvbHMsIGRvbid0IGRyYXcgcm93XHJcbiAgICBpZiAoIWNvbHVtbnMgfHwgY29sdW1ucy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyB2YXIgcm93RGF0YSA9IG5vZGUucm93RGF0YTtcclxuICAgIHZhciByb3dJc0FHcm91cCA9IG5vZGUuZ3JvdXA7XHJcblxyXG4gICAgLy8gdHJ5IGNvbXBpbGluZyBhcyB3ZSBpbnNlcnQgcm93c1xyXG4gICAgdmFyIG5ld0NoaWxkU2NvcGUgPSB0aGlzLmNyZWF0ZUNoaWxkU2NvcGVPck51bGwobm9kZS5kYXRhKTtcclxuXHJcbiAgICB2YXIgZVBpbm5lZFJvdyA9IHRoaXMuY3JlYXRlUm93Q29udGFpbmVyKHJvd0luZGV4LCBub2RlLCByb3dJc0FHcm91cCwgbmV3Q2hpbGRTY29wZSk7XHJcbiAgICB2YXIgZU1haW5Sb3cgPSB0aGlzLmNyZWF0ZVJvd0NvbnRhaW5lcihyb3dJbmRleCwgbm9kZSwgcm93SXNBR3JvdXAsIG5ld0NoaWxkU2NvcGUpO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIGVNYWluUm93LnN0eWxlLndpZHRoID0gbWFpblJvd1dpZHRoICsgXCJweFwiO1xyXG5cclxuICAgIHZhciByZW5kZXJlZFJvdyA9IHtcclxuICAgICAgICBzY29wZTogbmV3Q2hpbGRTY29wZSxcclxuICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICBlQ2VsbHM6IHt9LFxyXG4gICAgICAgIGVWb2xhdGlsZUNlbGxzOiB7fVxyXG4gICAgfTtcclxuICAgIHRoaXMucmVuZGVyZWRSb3dzW3Jvd0luZGV4XSA9IHJlbmRlcmVkUm93O1xyXG4gICAgdGhpcy5yZW5kZXJlZFJvd1N0YXJ0RWRpdGluZ0xpc3RlbmVyc1tyb3dJbmRleF0gPSB7fTtcclxuXHJcbiAgICAvLyBpZiBncm91cCBpdGVtLCBpbnNlcnQgdGhlIGZpcnN0IHJvd1xyXG4gICAgdmFyIGdyb3VwSGVhZGVyVGFrZXNFbnRpcmVSb3cgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwVXNlRW50aXJlUm93KCk7XHJcbiAgICB2YXIgZHJhd0dyb3VwUm93ID0gcm93SXNBR3JvdXAgJiYgZ3JvdXBIZWFkZXJUYWtlc0VudGlyZVJvdztcclxuXHJcbiAgICBpZiAoZHJhd0dyb3VwUm93KSB7XHJcbiAgICAgICAgdmFyIGZpcnN0Q29sdW1uID0gY29sdW1uc1swXTtcclxuXHJcbiAgICAgICAgdmFyIGVHcm91cFJvdyA9IHRoYXQuY3JlYXRlR3JvdXBFbGVtZW50KG5vZGUsIHJvd0luZGV4LCBmYWxzZSk7XHJcbiAgICAgICAgaWYgKGZpcnN0Q29sdW1uLnBpbm5lZCkge1xyXG4gICAgICAgICAgICBlUGlubmVkUm93LmFwcGVuZENoaWxkKGVHcm91cFJvdyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgZUdyb3VwUm93UGFkZGluZyA9IHRoYXQuY3JlYXRlR3JvdXBFbGVtZW50KG5vZGUsIHJvd0luZGV4LCB0cnVlKTtcclxuICAgICAgICAgICAgZU1haW5Sb3cuYXBwZW5kQ2hpbGQoZUdyb3VwUm93UGFkZGluZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZU1haW5Sb3cuYXBwZW5kQ2hpbGQoZUdyb3VwUm93KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgY29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbiwgaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIGZpcnN0Q29sID0gaW5kZXggPT09IDA7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhhdC5nZXREYXRhRm9yTm9kZShub2RlKTtcclxuICAgICAgICAgICAgdmFyIHZhbHVlR2V0dGVyID0gdGhhdC5jcmVhdGVWYWx1ZUdldHRlcihkYXRhLCBjb2x1bW4uY29sRGVmLCBub2RlKTtcclxuICAgICAgICAgICAgdGhhdC5jcmVhdGVDZWxsRnJvbUNvbERlZihmaXJzdENvbCwgY29sdW1uLCB2YWx1ZUdldHRlciwgbm9kZSwgcm93SW5kZXgsIGVNYWluUm93LCBlUGlubmVkUm93LCBuZXdDaGlsZFNjb3BlLCByZW5kZXJlZFJvdyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy90cnkgY29tcGlsaW5nIGFzIHdlIGluc2VydCByb3dzXHJcbiAgICByZW5kZXJlZFJvdy5waW5uZWRFbGVtZW50ID0gdGhpcy5jb21waWxlQW5kQWRkKHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIsIHJvd0luZGV4LCBlUGlubmVkUm93LCBuZXdDaGlsZFNjb3BlKTtcclxuICAgIHJlbmRlcmVkUm93LmJvZHlFbGVtZW50ID0gdGhpcy5jb21waWxlQW5kQWRkKHRoaXMuZUJvZHlDb250YWluZXIsIHJvd0luZGV4LCBlTWFpblJvdywgbmV3Q2hpbGRTY29wZSk7XHJcbn07XHJcblxyXG4vLyBpZiBncm91cCBpcyBhIGZvb3RlciwgYWx3YXlzIHNob3cgdGhlIGRhdGEuXHJcbi8vIGlmIGdyb3VwIGlzIGEgaGVhZGVyLCBvbmx5IHNob3cgZGF0YSBpZiBub3QgZXhwYW5kZWRcclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmdldERhdGFGb3JOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKG5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgLy8gaWYgZm9vdGVyLCB3ZSBhbHdheXMgc2hvdyB0aGUgZGF0YVxyXG4gICAgICAgIHJldHVybiBub2RlLmRhdGE7XHJcbiAgICB9IGVsc2UgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAvLyBpZiBoZWFkZXIgYW5kIGhlYWRlciBpcyBleHBhbmRlZCwgd2Ugc2hvdyBkYXRhIGluIGZvb3RlciBvbmx5XHJcbiAgICAgICAgdmFyIGZvb3RlcnNFbmFibGVkID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEluY2x1ZGVGb290ZXIoKTtcclxuICAgICAgICByZXR1cm4gKG5vZGUuZXhwYW5kZWQgJiYgZm9vdGVyc0VuYWJsZWQpID8gdW5kZWZpbmVkIDogbm9kZS5kYXRhO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvdGhlcndpc2UgaXQncyBhIG5vcm1hbCBub2RlLCBqdXN0IHJldHVybiBkYXRhIGFzIG5vcm1hbFxyXG4gICAgICAgIHJldHVybiBub2RlLmRhdGE7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlVmFsdWVHZXR0ZXIgPSBmdW5jdGlvbihkYXRhLCBjb2xEZWYsIG5vZGUpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXBpID0gdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKCk7XHJcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCk7XHJcbiAgICAgICAgcmV0dXJuIHV0aWxzLmdldFZhbHVlKHRoYXQuZXhwcmVzc2lvblNlcnZpY2UsIGRhdGEsIGNvbERlZiwgbm9kZSwgYXBpLCBjb250ZXh0KTtcclxuICAgIH07XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlQ2hpbGRTY29wZU9yTnVsbCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0FuZ3VsYXJDb21waWxlUm93cygpKSB7XHJcbiAgICAgICAgdmFyIG5ld0NoaWxkU2NvcGUgPSB0aGlzLiRzY29wZS4kbmV3KCk7XHJcbiAgICAgICAgbmV3Q2hpbGRTY29wZS5kYXRhID0gZGF0YTtcclxuICAgICAgICByZXR1cm4gbmV3Q2hpbGRTY29wZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY29tcGlsZUFuZEFkZCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgcm93SW5kZXgsIGVsZW1lbnQsIHNjb3BlKSB7XHJcbiAgICBpZiAoc2NvcGUpIHtcclxuICAgICAgICB2YXIgZUVsZW1lbnRDb21waWxlZCA9IHRoaXMuJGNvbXBpbGUoZWxlbWVudCkoc2NvcGUpO1xyXG4gICAgICAgIGlmIChjb250YWluZXIpIHsgLy8gY2hlY2tpbmcgY29udGFpbmVyLCBhcyBpZiBub1Njcm9sbCwgcGlubmVkIGNvbnRhaW5lciBpcyBtaXNzaW5nXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlRWxlbWVudENvbXBpbGVkWzBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGVFbGVtZW50Q29tcGlsZWRbMF07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChjb250YWluZXIpIHtcclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVDZWxsRnJvbUNvbERlZiA9IGZ1bmN0aW9uKGlzRmlyc3RDb2x1bW4sIGNvbHVtbiwgdmFsdWVHZXR0ZXIsIG5vZGUsIHJvd0luZGV4LCBlTWFpblJvdywgZVBpbm5lZFJvdywgJGNoaWxkU2NvcGUsIHJlbmRlcmVkUm93KSB7XHJcbiAgICB2YXIgZUdyaWRDZWxsID0gdGhpcy5jcmVhdGVDZWxsKGlzRmlyc3RDb2x1bW4sIGNvbHVtbiwgdmFsdWVHZXR0ZXIsIG5vZGUsIHJvd0luZGV4LCAkY2hpbGRTY29wZSk7XHJcblxyXG4gICAgaWYgKGNvbHVtbi5jb2xEZWYudm9sYXRpbGUpIHtcclxuICAgICAgICByZW5kZXJlZFJvdy5lVm9sYXRpbGVDZWxsc1tjb2x1bW4uY29sS2V5XSA9IGVHcmlkQ2VsbDtcclxuICAgIH1cclxuICAgIHJlbmRlcmVkUm93LmVDZWxsc1tjb2x1bW4uY29sS2V5XSA9IGVHcmlkQ2VsbDtcclxuXHJcbiAgICBpZiAoY29sdW1uLnBpbm5lZCkge1xyXG4gICAgICAgIGVQaW5uZWRSb3cuYXBwZW5kQ2hpbGQoZUdyaWRDZWxsKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZU1haW5Sb3cuYXBwZW5kQ2hpbGQoZUdyaWRDZWxsKTtcclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5hZGRDbGFzc2VzVG9Sb3cgPSBmdW5jdGlvbihyb3dJbmRleCwgbm9kZSwgZVJvdykge1xyXG4gICAgdmFyIGNsYXNzZXNMaXN0ID0gW1wiYWctcm93XCJdO1xyXG4gICAgY2xhc3Nlc0xpc3QucHVzaChyb3dJbmRleCAlIDIgPT0gMCA/IFwiYWctcm93LWV2ZW5cIiA6IFwiYWctcm93LW9kZFwiKTtcclxuXHJcbiAgICBpZiAodGhpcy5zZWxlY3Rpb25Db250cm9sbGVyLmlzTm9kZVNlbGVjdGVkKG5vZGUpKSB7XHJcbiAgICAgICAgY2xhc3Nlc0xpc3QucHVzaChcImFnLXJvdy1zZWxlY3RlZFwiKTtcclxuICAgIH1cclxuICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgLy8gaWYgYSBncm91cCwgcHV0IHRoZSBsZXZlbCBvZiB0aGUgZ3JvdXAgaW5cclxuICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LWxldmVsLVwiICsgbm9kZS5sZXZlbCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGlmIGEgbGVhZiwgYW5kIGEgcGFyZW50IGV4aXN0cywgcHV0IGEgbGV2ZWwgb2YgdGhlIHBhcmVudCwgZWxzZSBwdXQgbGV2ZWwgb2YgMCBmb3IgdG9wIGxldmVsIGl0ZW1cclxuICAgICAgICBpZiAobm9kZS5wYXJlbnQpIHtcclxuICAgICAgICAgICAgY2xhc3Nlc0xpc3QucHVzaChcImFnLXJvdy1sZXZlbC1cIiArIChub2RlLnBhcmVudC5sZXZlbCArIDEpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LWxldmVsLTBcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LWdyb3VwXCIpO1xyXG4gICAgfVxyXG4gICAgaWYgKG5vZGUuZ3JvdXAgJiYgIW5vZGUuZm9vdGVyICYmIG5vZGUuZXhwYW5kZWQpIHtcclxuICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LWdyb3VwLWV4cGFuZGVkXCIpO1xyXG4gICAgfVxyXG4gICAgaWYgKG5vZGUuZ3JvdXAgJiYgIW5vZGUuZm9vdGVyICYmICFub2RlLmV4cGFuZGVkKSB7XHJcbiAgICAgICAgLy8gb3Bwb3NpdGUgb2YgZXhwYW5kZWQgaXMgY29udHJhY3RlZCBhY2NvcmRpbmcgdG8gdGhlIGludGVybmV0LlxyXG4gICAgICAgIGNsYXNzZXNMaXN0LnB1c2goXCJhZy1yb3ctZ3JvdXAtY29udHJhY3RlZFwiKTtcclxuICAgIH1cclxuICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgY2xhc3Nlc0xpc3QucHVzaChcImFnLXJvdy1mb290ZXJcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWRkIGluIGV4dHJhIGNsYXNzZXMgcHJvdmlkZWQgYnkgdGhlIGNvbmZpZ1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0NsYXNzKCkpIHtcclxuICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpLFxyXG4gICAgICAgICAgICBhcGk6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgZXh0cmFSb3dDbGFzc2VzID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93Q2xhc3MoKShwYXJhbXMpO1xyXG4gICAgICAgIGlmIChleHRyYVJvd0NsYXNzZXMpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBleHRyYVJvd0NsYXNzZXMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKGV4dHJhUm93Q2xhc3Nlcyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShleHRyYVJvd0NsYXNzZXMpKSB7XHJcbiAgICAgICAgICAgICAgICBleHRyYVJvd0NsYXNzZXMuZm9yRWFjaChmdW5jdGlvbihjbGFzc0l0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKGNsYXNzSXRlbSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2xhc3NlcyA9IGNsYXNzZXNMaXN0LmpvaW4oXCIgXCIpO1xyXG5cclxuICAgIGVSb3cuY2xhc3NOYW1lID0gY2xhc3NlcztcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVSb3dDb250YWluZXIgPSBmdW5jdGlvbihyb3dJbmRleCwgbm9kZSwgZ3JvdXBSb3csICRzY29wZSkge1xyXG4gICAgdmFyIGVSb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG5cclxuICAgIHRoaXMuYWRkQ2xhc3Nlc1RvUm93KHJvd0luZGV4LCBub2RlLCBlUm93KTtcclxuXHJcbiAgICBlUm93LnNldEF0dHJpYnV0ZSgncm93Jywgcm93SW5kZXgpO1xyXG5cclxuICAgIC8vIGlmIHNob3dpbmcgc2Nyb2xscywgcG9zaXRpb24gb24gdGhlIGNvbnRhaW5lclxyXG4gICAgaWYgKCF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0RvbnRVc2VTY3JvbGxzKCkpIHtcclxuICAgICAgICBlUm93LnN0eWxlLnRvcCA9ICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dIZWlnaHQoKSAqIHJvd0luZGV4KSArIFwicHhcIjtcclxuICAgIH1cclxuICAgIGVSb3cuc3R5bGUuaGVpZ2h0ID0gKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0hlaWdodCgpKSArIFwicHhcIjtcclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93U3R5bGUoKSkge1xyXG4gICAgICAgIHZhciBjc3NUb1VzZTtcclxuICAgICAgICB2YXIgcm93U3R5bGUgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dTdHlsZSgpO1xyXG4gICAgICAgIGlmICh0eXBlb2Ygcm93U3R5bGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICBhcGk6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpLFxyXG4gICAgICAgICAgICAgICAgJHNjb3BlOiAkc2NvcGVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY3NzVG9Vc2UgPSByb3dTdHlsZShwYXJhbXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNzc1RvVXNlID0gcm93U3R5bGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY3NzVG9Vc2UpIHtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMoY3NzVG9Vc2UpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgICAgICBlUm93LnN0eWxlW2tleV0gPSBjc3NUb1VzZVtrZXldO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgIGVSb3cuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgX3RoaXMuYW5ndWxhckdyaWQub25Sb3dDbGlja2VkKGV2ZW50LCBOdW1iZXIodGhpcy5nZXRBdHRyaWJ1dGUoXCJyb3dcIikpLCBub2RlKVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGVSb3c7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuZ2V0SW5kZXhPZlJlbmRlcmVkTm9kZSA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIHZhciByZW5kZXJlZFJvd3MgPSB0aGlzLnJlbmRlcmVkUm93cztcclxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocmVuZGVyZWRSb3dzKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChyZW5kZXJlZFJvd3Nba2V5c1tpXV0ubm9kZSA9PT0gbm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyZWRSb3dzW2tleXNbaV1dLnJvd0luZGV4O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiAtMTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVHcm91cEVsZW1lbnQgPSBmdW5jdGlvbihub2RlLCByb3dJbmRleCwgcGFkZGluZykge1xyXG4gICAgdmFyIGVSb3c7XHJcbiAgICAvLyBwYWRkaW5nIG1lYW5zIHdlIGFyZSBvbiB0aGUgcmlnaHQgaGFuZCBzaWRlIG9mIGEgcGlubmVkIHRhYmxlLCBpZVxyXG4gICAgLy8gaW4gdGhlIG1haW4gYm9keS5cclxuICAgIGlmIChwYWRkaW5nKSB7XHJcbiAgICAgICAgZVJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgICAgIGFwaTogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKCksXHJcbiAgICAgICAgICAgIGNvbERlZjoge1xyXG4gICAgICAgICAgICAgICAgY2VsbFJlbmRlcmVyOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyZXI6ICdncm91cCcsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5uZXJSZW5kZXJlcjogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0R3JvdXBJbm5lclJlbmRlcmVyKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgZVJvdyA9IHRoaXMuY2VsbFJlbmRlcmVyTWFwWydncm91cCddKHBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgdXRpbHMuYWRkQ3NzQ2xhc3MoZVJvdywgJ2FnLWZvb3Rlci1jZWxsLWVudGlyZS1yb3cnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdXRpbHMuYWRkQ3NzQ2xhc3MoZVJvdywgJ2FnLWdyb3VwLWNlbGwtZW50aXJlLXJvdycpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBlUm93O1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnB1dERhdGFJbnRvQ2VsbCA9IGZ1bmN0aW9uKGNvbHVtbiwgdmFsdWUsIHZhbHVlR2V0dGVyLCBub2RlLCAkY2hpbGRTY29wZSwgZVNwYW5XaXRoVmFsdWUsIGVHcmlkQ2VsbCwgcm93SW5kZXgsIHJlZnJlc2hDZWxsRnVuY3Rpb24pIHtcclxuICAgIC8vIHRlbXBsYXRlIGdldHMgcHJlZmVyZW5jZSwgdGhlbiBjZWxsUmVuZGVyZXIsIHRoZW4gZG8gaXQgb3Vyc2VsdmVzXHJcbiAgICB2YXIgY29sRGVmID0gY29sdW1uLmNvbERlZjtcclxuICAgIGlmIChjb2xEZWYudGVtcGxhdGUpIHtcclxuICAgICAgICBlU3BhbldpdGhWYWx1ZS5pbm5lckhUTUwgPSBjb2xEZWYudGVtcGxhdGU7XHJcbiAgICB9IGVsc2UgaWYgKGNvbERlZi50ZW1wbGF0ZVVybCkge1xyXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGVTZXJ2aWNlLmdldFRlbXBsYXRlKGNvbERlZi50ZW1wbGF0ZVVybCwgcmVmcmVzaENlbGxGdW5jdGlvbik7XHJcbiAgICAgICAgaWYgKHRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIGVTcGFuV2l0aFZhbHVlLmlubmVySFRNTCA9IHRlbXBsYXRlO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoY29sRGVmLmNlbGxSZW5kZXJlcikge1xyXG4gICAgICAgIHRoaXMudXNlQ2VsbFJlbmRlcmVyKGNvbHVtbiwgdmFsdWUsIG5vZGUsICRjaGlsZFNjb3BlLCBlU3BhbldpdGhWYWx1ZSwgcm93SW5kZXgsIHJlZnJlc2hDZWxsRnVuY3Rpb24sIHZhbHVlR2V0dGVyLCBlR3JpZENlbGwpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBpZiB3ZSBpbnNlcnQgdW5kZWZpbmVkLCB0aGVuIGl0IGRpc3BsYXlzIGFzIHRoZSBzdHJpbmcgJ3VuZGVmaW5lZCcsIHVnbHkhXHJcbiAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09ICcnKSB7XHJcbiAgICAgICAgICAgIGVTcGFuV2l0aFZhbHVlLmlubmVySFRNTCA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS51c2VDZWxsUmVuZGVyZXIgPSBmdW5jdGlvbihjb2x1bW4sIHZhbHVlLCBub2RlLCAkY2hpbGRTY29wZSwgZVNwYW5XaXRoVmFsdWUsIHJvd0luZGV4LCByZWZyZXNoQ2VsbEZ1bmN0aW9uLCB2YWx1ZUdldHRlciwgZUdyaWRDZWxsKSB7XHJcbiAgICB2YXIgY29sRGVmID0gY29sdW1uLmNvbERlZjtcclxuICAgIHZhciByZW5kZXJlclBhcmFtcyA9IHtcclxuICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgdmFsdWVHZXR0ZXI6IHZhbHVlR2V0dGVyLFxyXG4gICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgIGNvbHVtbjogY29sdW1uLFxyXG4gICAgICAgICRzY29wZTogJGNoaWxkU2NvcGUsXHJcbiAgICAgICAgcm93SW5kZXg6IHJvd0luZGV4LFxyXG4gICAgICAgIGFwaTogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKCksXHJcbiAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpLFxyXG4gICAgICAgIHJlZnJlc2hDZWxsOiByZWZyZXNoQ2VsbEZ1bmN0aW9uLFxyXG4gICAgICAgIGVHcmlkQ2VsbDogZUdyaWRDZWxsXHJcbiAgICB9O1xyXG4gICAgdmFyIGNlbGxSZW5kZXJlcjtcclxuICAgIGlmICh0eXBlb2YgY29sRGVmLmNlbGxSZW5kZXJlciA9PT0gJ29iamVjdCcgJiYgY29sRGVmLmNlbGxSZW5kZXJlciAhPT0gbnVsbCkge1xyXG4gICAgICAgIGNlbGxSZW5kZXJlciA9IHRoaXMuY2VsbFJlbmRlcmVyTWFwW2NvbERlZi5jZWxsUmVuZGVyZXIucmVuZGVyZXJdO1xyXG4gICAgICAgIGlmICghY2VsbFJlbmRlcmVyKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdDZWxsIHJlbmRlcmVyICcgKyBjb2xEZWYuY2VsbFJlbmRlcmVyICsgJyBub3QgZm91bmQsIGF2YWlsYWJsZSBhcmUgJyArIE9iamVjdC5rZXlzKHRoaXMuY2VsbFJlbmRlcmVyTWFwKTtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb2xEZWYuY2VsbFJlbmRlcmVyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgY2VsbFJlbmRlcmVyID0gY29sRGVmLmNlbGxSZW5kZXJlcjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgJ0NlbGwgUmVuZGVyZXIgbXVzdCBiZSBTdHJpbmcgb3IgRnVuY3Rpb24nO1xyXG4gICAgfVxyXG4gICAgdmFyIHJlc3VsdEZyb21SZW5kZXJlciA9IGNlbGxSZW5kZXJlcihyZW5kZXJlclBhcmFtcyk7XHJcbiAgICBpZiAodXRpbHMuaXNOb2RlT3JFbGVtZW50KHJlc3VsdEZyb21SZW5kZXJlcikpIHtcclxuICAgICAgICAvLyBhIGRvbSBub2RlIG9yIGVsZW1lbnQgd2FzIHJldHVybmVkLCBzbyBhZGQgY2hpbGRcclxuICAgICAgICBlU3BhbldpdGhWYWx1ZS5hcHBlbmRDaGlsZChyZXN1bHRGcm9tUmVuZGVyZXIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvdGhlcndpc2UgYXNzdW1lIGl0IHdhcyBodG1sLCBzbyBqdXN0IGluc2VydFxyXG4gICAgICAgIGVTcGFuV2l0aFZhbHVlLmlubmVySFRNTCA9IHJlc3VsdEZyb21SZW5kZXJlcjtcclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5hZGRTdHlsZXNGcm9tQ29sbERlZiA9IGZ1bmN0aW9uKGNvbHVtbiwgdmFsdWUsIG5vZGUsICRjaGlsZFNjb3BlLCBlR3JpZENlbGwpIHtcclxuICAgIHZhciBjb2xEZWYgPSBjb2x1bW4uY29sRGVmO1xyXG4gICAgaWYgKGNvbERlZi5jZWxsU3R5bGUpIHtcclxuICAgICAgICB2YXIgY3NzVG9Vc2U7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb2xEZWYuY2VsbFN0eWxlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHZhciBjZWxsU3R5bGVQYXJhbXMgPSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgICAgICAgICBjb2x1bW46IGNvbHVtbixcclxuICAgICAgICAgICAgICAgICRzY29wZTogJGNoaWxkU2NvcGUsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0OiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCksXHJcbiAgICAgICAgICAgICAgICBhcGk6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNzc1RvVXNlID0gY29sRGVmLmNlbGxTdHlsZShjZWxsU3R5bGVQYXJhbXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNzc1RvVXNlID0gY29sRGVmLmNlbGxTdHlsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjc3NUb1VzZSkge1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjc3NUb1VzZSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgICAgIGVHcmlkQ2VsbC5zdHlsZVtrZXldID0gY3NzVG9Vc2Vba2V5XTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmFkZENsYXNzZXNGcm9tQ29sbERlZiA9IGZ1bmN0aW9uKGNvbERlZiwgdmFsdWUsIG5vZGUsICRjaGlsZFNjb3BlLCBlR3JpZENlbGwpIHtcclxuICAgIGlmIChjb2xEZWYuY2VsbENsYXNzKSB7XHJcbiAgICAgICAgdmFyIGNsYXNzVG9Vc2U7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb2xEZWYuY2VsbENsYXNzID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHZhciBjZWxsQ2xhc3NQYXJhbXMgPSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgICAgICAgICAkc2NvcGU6ICRjaGlsZFNjb3BlLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpLFxyXG4gICAgICAgICAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjbGFzc1RvVXNlID0gY29sRGVmLmNlbGxDbGFzcyhjZWxsQ2xhc3NQYXJhbXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNsYXNzVG9Vc2UgPSBjb2xEZWYuY2VsbENsYXNzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBjbGFzc1RvVXNlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhlR3JpZENlbGwsIGNsYXNzVG9Vc2UpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShjbGFzc1RvVXNlKSkge1xyXG4gICAgICAgICAgICBjbGFzc1RvVXNlLmZvckVhY2goZnVuY3Rpb24oY3NzQ2xhc3NJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhlR3JpZENlbGwsIGNzc0NsYXNzSXRlbSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5hZGRDbGFzc2VzVG9DZWxsID0gZnVuY3Rpb24oY29sdW1uLCBub2RlLCBlR3JpZENlbGwpIHtcclxuICAgIHZhciBjbGFzc2VzID0gWydhZy1jZWxsJywgJ2FnLWNlbGwtbm8tZm9jdXMnLCAnY2VsbC1jb2wtJyArIGNvbHVtbi5pbmRleF07XHJcbiAgICBpZiAobm9kZS5ncm91cCkge1xyXG4gICAgICAgIGlmIChub2RlLmZvb3Rlcikge1xyXG4gICAgICAgICAgICBjbGFzc2VzLnB1c2goJ2FnLWZvb3Rlci1jZWxsJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKCdhZy1ncm91cC1jZWxsJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZUdyaWRDZWxsLmNsYXNzTmFtZSA9IGNsYXNzZXMuam9pbignICcpO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmFkZENsYXNzZXNGcm9tUnVsZXMgPSBmdW5jdGlvbihjb2xEZWYsIGVHcmlkQ2VsbCwgdmFsdWUsIG5vZGUsIHJvd0luZGV4KSB7XHJcbiAgICB2YXIgY2xhc3NSdWxlcyA9IGNvbERlZi5jZWxsQ2xhc3NSdWxlcztcclxuICAgIGlmICh0eXBlb2YgY2xhc3NSdWxlcyA9PT0gJ29iamVjdCcgJiYgY2xhc3NSdWxlcyAhPT0gbnVsbCkge1xyXG5cclxuICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKSxcclxuICAgICAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGNsYXNzTmFtZXMgPSBPYmplY3Qua2V5cyhjbGFzc1J1bGVzKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzTmFtZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGNsYXNzTmFtZXNbaV07XHJcbiAgICAgICAgICAgIHZhciBydWxlID0gY2xhc3NSdWxlc1tjbGFzc05hbWVdO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0T2ZSdWxlO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHJ1bGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRPZlJ1bGUgPSB0aGlzLmV4cHJlc3Npb25TZXJ2aWNlLmV2YWx1YXRlKHJ1bGUsIHBhcmFtcyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHJ1bGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdE9mUnVsZSA9IHJ1bGUocGFyYW1zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVzdWx0T2ZSdWxlKSB7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhlR3JpZENlbGwsIGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5yZW1vdmVDc3NDbGFzcyhlR3JpZENlbGwsIGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlQ2VsbCA9IGZ1bmN0aW9uKGlzRmlyc3RDb2x1bW4sIGNvbHVtbiwgdmFsdWVHZXR0ZXIsIG5vZGUsIHJvd0luZGV4LCAkY2hpbGRTY29wZSkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIGVHcmlkQ2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBlR3JpZENlbGwuc2V0QXR0cmlidXRlKFwiY29sXCIsIGNvbHVtbi5pbmRleCk7XHJcblxyXG4gICAgLy8gb25seSBzZXQgdGFiIGluZGV4IGlmIGNlbGwgc2VsZWN0aW9uIGlzIGVuYWJsZWRcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNTdXBwcmVzc0NlbGxTZWxlY3Rpb24oKSkge1xyXG4gICAgICAgIGVHcmlkQ2VsbC5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCBcIi0xXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB2YWx1ZTtcclxuICAgIGlmICh2YWx1ZUdldHRlcikge1xyXG4gICAgICAgIHZhbHVlID0gdmFsdWVHZXR0ZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0aGVzZSBhcmUgdGhlIGdyaWQgc3R5bGVzLCBkb24ndCBjaGFuZ2UgYmV0d2VlbiBzb2Z0IHJlZnJlc2hlc1xyXG4gICAgdGhpcy5hZGRDbGFzc2VzVG9DZWxsKGNvbHVtbiwgbm9kZSwgZUdyaWRDZWxsKTtcclxuXHJcbiAgICB0aGlzLnBvcHVsYXRlQW5kU3R5bGVHcmlkQ2VsbCh2YWx1ZUdldHRlciwgdmFsdWUsIGVHcmlkQ2VsbCwgaXNGaXJzdENvbHVtbiwgbm9kZSwgY29sdW1uLCByb3dJbmRleCwgJGNoaWxkU2NvcGUpO1xyXG5cclxuICAgIHRoaXMuYWRkQ2VsbENsaWNrZWRIYW5kbGVyKGVHcmlkQ2VsbCwgbm9kZSwgY29sdW1uLCB2YWx1ZSwgcm93SW5kZXgpO1xyXG4gICAgdGhpcy5hZGRDZWxsRG91YmxlQ2xpY2tlZEhhbmRsZXIoZUdyaWRDZWxsLCBub2RlLCBjb2x1bW4sIHZhbHVlLCByb3dJbmRleCwgJGNoaWxkU2NvcGUsIGlzRmlyc3RDb2x1bW4sIHZhbHVlR2V0dGVyKTtcclxuXHJcbiAgICB0aGlzLmFkZENlbGxOYXZpZ2F0aW9uSGFuZGxlcihlR3JpZENlbGwsIHJvd0luZGV4LCBjb2x1bW4sIG5vZGUpO1xyXG5cclxuICAgIGVHcmlkQ2VsbC5zdHlsZS53aWR0aCA9IHV0aWxzLmZvcm1hdFdpZHRoKGNvbHVtbi5hY3R1YWxXaWR0aCk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSAnc3RhcnQgZWRpdGluZycgY2FsbCB0byB0aGUgY2hhaW4gb2YgZWRpdG9yc1xyXG4gICAgdGhpcy5yZW5kZXJlZFJvd1N0YXJ0RWRpdGluZ0xpc3RlbmVyc1tyb3dJbmRleF1bY29sdW1uLmluZGV4XSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGF0LmlzQ2VsbEVkaXRhYmxlKGNvbHVtbi5jb2xEZWYsIG5vZGUpKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc3RhcnRFZGl0aW5nKGVHcmlkQ2VsbCwgY29sdW1uLCBub2RlLCAkY2hpbGRTY29wZSwgcm93SW5kZXgsIGlzRmlyc3RDb2x1bW4sIHZhbHVlR2V0dGVyKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIGVHcmlkQ2VsbDtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5hZGRDZWxsTmF2aWdhdGlvbkhhbmRsZXIgPSBmdW5jdGlvbihlR3JpZENlbGwsIHJvd0luZGV4LCBjb2x1bW4sIG5vZGUpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGVHcmlkQ2VsbC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBpZiAodGhhdC5lZGl0aW5nQ2VsbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG9ubHkgaW50ZXJlc3RlZCBvbiBrZXkgcHJlc3NlcyB0aGF0IGFyZSBkaXJlY3RseSBvbiB0aGlzIGVsZW1lbnQsIG5vdCBhbnkgY2hpbGRyZW4gZWxlbWVudHMuIHRoaXNcclxuICAgICAgICAvLyBzdG9wcyBuYXZpZ2F0aW9uIGlmIHRoZSB1c2VyIGlzIGluLCBmb3IgZXhhbXBsZSwgYSB0ZXh0IGZpZWxkIGluc2lkZSB0aGUgY2VsbCwgYW5kIHVzZXIgaGl0c1xyXG4gICAgICAgIC8vIG9uIG9mIHRoZSBrZXlzIHdlIGFyZSBsb29raW5nIGZvci5cclxuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ICE9PSBlR3JpZENlbGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGtleSA9IGV2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGU7XHJcblxyXG4gICAgICAgIHZhciBzdGFydE5hdmlnYXRpb24gPSBrZXkgPT09IGNvbnN0YW50cy5LRVlfRE9XTiB8fCBrZXkgPT09IGNvbnN0YW50cy5LRVlfVVBcclxuICAgICAgICAgICAgfHwga2V5ID09PSBjb25zdGFudHMuS0VZX0xFRlQgfHwga2V5ID09PSBjb25zdGFudHMuS0VZX1JJR0hUO1xyXG4gICAgICAgIGlmIChzdGFydE5hdmlnYXRpb24pIHtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgdGhhdC5uYXZpZ2F0ZVRvTmV4dENlbGwoa2V5LCByb3dJbmRleCwgY29sdW1uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBzdGFydEVkaXQgPSBrZXkgPT09IGNvbnN0YW50cy5LRVlfRU5URVI7XHJcbiAgICAgICAgaWYgKHN0YXJ0RWRpdCkge1xyXG4gICAgICAgICAgICB2YXIgc3RhcnRFZGl0aW5nRnVuYyA9IHRoYXQucmVuZGVyZWRSb3dTdGFydEVkaXRpbmdMaXN0ZW5lcnNbcm93SW5kZXhdW2NvbHVtbi5jb2xLZXldO1xyXG4gICAgICAgICAgICBpZiAoc3RhcnRFZGl0aW5nRnVuYykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGVkaXRpbmdTdGFydGVkID0gc3RhcnRFZGl0aW5nRnVuYygpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVkaXRpbmdTdGFydGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgd2UgZG9uJ3QgcHJldmVudCBkZWZhdWx0LCB0aGVuIHRoZSBlZGl0b3IgdGhhdCBnZXQgZGlzcGxheWVkIGFsc28gcGlja3MgdXAgdGhlICdlbnRlciBrZXknXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJlc3MsIGFuZCBzdG9wcyBlZGl0aW5nIGltbWVkaWF0ZWx5LCBoZW5jZSBnaXZpbmcgaGUgdXNlciBleHBlcmllbmNlIHRoYXQgbm90aGluZyBoYXBwZW5lZFxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBzZWxlY3RSb3cgPSBrZXkgPT09IGNvbnN0YW50cy5LRVlfU1BBQ0U7XHJcbiAgICAgICAgaWYgKHNlbGVjdFJvdyAmJiB0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5pc1Jvd1NlbGVjdGlvbigpKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5pc05vZGVTZWxlY3RlZChub2RlKTtcclxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuZGVzZWxlY3ROb2RlKG5vZGUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLnNlbGVjdE5vZGUobm9kZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8vIHdlIHVzZSBpbmRleCBmb3Igcm93cywgYnV0IGNvbHVtbiBvYmplY3QgZm9yIGNvbHVtbnMsIGFzIHRoZSBuZXh0IGNvbHVtbiAoYnkgaW5kZXgpIG1pZ2h0IG5vdFxyXG4vLyBiZSB2aXNpYmxlIChoZWFkZXIgZ3JvdXBpbmcpIHNvIGl0J3Mgbm90IHJlbGlhYmxlLCBzbyB1c2luZyB0aGUgY29sdW1uIG9iamVjdCBpbnN0ZWFkLlxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUubmF2aWdhdGVUb05leHRDZWxsID0gZnVuY3Rpb24oa2V5LCByb3dJbmRleCwgY29sdW1uKSB7XHJcblxyXG4gICAgdmFyIGNlbGxUb0ZvY3VzID0ge3Jvd0luZGV4OiByb3dJbmRleCwgY29sdW1uOiBjb2x1bW59O1xyXG4gICAgdmFyIHJlbmRlcmVkUm93O1xyXG4gICAgdmFyIGVDZWxsO1xyXG5cclxuICAgIC8vIHdlIGtlZXAgc2VhcmNoaW5nIGZvciBhIG5leHQgY2VsbCB1bnRpbCB3ZSBmaW5kIG9uZS4gdGhpcyBpcyBob3cgdGhlIGdyb3VwIHJvd3MgZ2V0IHNraXBwZWRcclxuICAgIHdoaWxlICghZUNlbGwpIHtcclxuICAgICAgICBjZWxsVG9Gb2N1cyA9IHRoaXMuZ2V0TmV4dENlbGxUb0ZvY3VzKGtleSwgY2VsbFRvRm9jdXMpO1xyXG4gICAgICAgIC8vIG5vIG5leHQgY2VsbCBtZWFucyB3ZSBoYXZlIHJlYWNoZWQgYSBncmlkIGJvdW5kYXJ5LCBlZyBsZWZ0LCByaWdodCwgdG9wIG9yIGJvdHRvbSBvZiBncmlkXHJcbiAgICAgICAgaWYgKCFjZWxsVG9Gb2N1cykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHNlZSBpZiB0aGUgbmV4dCBjZWxsIGlzIHNlbGVjdGFibGUsIGlmIHllcywgdXNlIGl0LCBpZiBub3QsIHNraXAgaXRcclxuICAgICAgICByZW5kZXJlZFJvdyA9IHRoaXMucmVuZGVyZWRSb3dzW2NlbGxUb0ZvY3VzLnJvd0luZGV4XTtcclxuICAgICAgICBlQ2VsbCA9IHJlbmRlcmVkUm93LmVDZWxsc1tjZWxsVG9Gb2N1cy5jb2x1bW4uaW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoaXMgc2Nyb2xscyB0aGUgcm93IGludG8gdmlld1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZC5lbnN1cmVJbmRleFZpc2libGUocmVuZGVyZWRSb3cucm93SW5kZXgpO1xyXG5cclxuICAgIC8vIHRoaXMgY2hhbmdlcyB0aGUgY3NzIG9uIHRoZSBjZWxsXHJcbiAgICB0aGlzLmZvY3VzQ2VsbChlQ2VsbCwgY2VsbFRvRm9jdXMucm93SW5kZXgsIGNlbGxUb0ZvY3VzLmNvbHVtbi5pbmRleCwgdHJ1ZSk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuZ2V0TmV4dENlbGxUb0ZvY3VzID0gZnVuY3Rpb24oa2V5LCBsYXN0Q2VsbFRvRm9jdXMpIHtcclxuICAgIHZhciBsYXN0Um93SW5kZXggPSBsYXN0Q2VsbFRvRm9jdXMucm93SW5kZXg7XHJcbiAgICB2YXIgbGFzdENvbHVtbiA9IGxhc3RDZWxsVG9Gb2N1cy5jb2x1bW47XHJcblxyXG4gICAgdmFyIG5leHRSb3dUb0ZvY3VzO1xyXG4gICAgdmFyIG5leHRDb2x1bW5Ub0ZvY3VzO1xyXG4gICAgc3dpdGNoIChrZXkpIHtcclxuICAgICAgICBjYXNlIGNvbnN0YW50cy5LRVlfVVAgOlxyXG4gICAgICAgICAgICAvLyBpZiBhbHJlYWR5IG9uIHRvcCByb3csIGRvIG5vdGhpbmdcclxuICAgICAgICAgICAgaWYgKGxhc3RSb3dJbmRleCA9PT0gdGhpcy5maXJzdFZpcnR1YWxSZW5kZXJlZFJvdykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbmV4dFJvd1RvRm9jdXMgPSBsYXN0Um93SW5kZXggLSAxO1xyXG4gICAgICAgICAgICBuZXh0Q29sdW1uVG9Gb2N1cyA9IGxhc3RDb2x1bW47XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgY29uc3RhbnRzLktFWV9ET1dOIDpcclxuICAgICAgICAgICAgLy8gaWYgYWxyZWFkeSBvbiBib3R0b20sIGRvIG5vdGhpbmdcclxuICAgICAgICAgICAgaWYgKGxhc3RSb3dJbmRleCA9PT0gdGhpcy5sYXN0VmlydHVhbFJlbmRlcmVkUm93KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBuZXh0Um93VG9Gb2N1cyA9IGxhc3RSb3dJbmRleCArIDE7XHJcbiAgICAgICAgICAgIG5leHRDb2x1bW5Ub0ZvY3VzID0gbGFzdENvbHVtbjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBjb25zdGFudHMuS0VZX1JJR0hUIDpcclxuICAgICAgICAgICAgdmFyIGNvbFRvUmlnaHQgPSB0aGlzLmNvbHVtbk1vZGVsLmdldFZpc2libGVDb2xBZnRlcihsYXN0Q29sdW1uKTtcclxuICAgICAgICAgICAgLy8gaWYgYWxyZWFkeSBvbiByaWdodCwgZG8gbm90aGluZ1xyXG4gICAgICAgICAgICBpZiAoIWNvbFRvUmlnaHQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5leHRSb3dUb0ZvY3VzID0gbGFzdFJvd0luZGV4IDtcclxuICAgICAgICAgICAgbmV4dENvbHVtblRvRm9jdXMgPSBjb2xUb1JpZ2h0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGNvbnN0YW50cy5LRVlfTEVGVCA6XHJcbiAgICAgICAgICAgIHZhciBjb2xUb0xlZnQgPSB0aGlzLmNvbHVtbk1vZGVsLmdldFZpc2libGVDb2xCZWZvcmUobGFzdENvbHVtbik7XHJcbiAgICAgICAgICAgIC8vIGlmIGFscmVhZHkgb24gbGVmdCwgZG8gbm90aGluZ1xyXG4gICAgICAgICAgICBpZiAoIWNvbFRvTGVmdCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbmV4dFJvd1RvRm9jdXMgPSBsYXN0Um93SW5kZXggO1xyXG4gICAgICAgICAgICBuZXh0Q29sdW1uVG9Gb2N1cyA9IGNvbFRvTGVmdDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByb3dJbmRleDogbmV4dFJvd1RvRm9jdXMsXHJcbiAgICAgICAgY29sdW1uOiBuZXh0Q29sdW1uVG9Gb2N1c1xyXG4gICAgfTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5mb2N1c0NlbGwgPSBmdW5jdGlvbihlQ2VsbCwgcm93SW5kZXgsIGNvbEluZGV4LCBmb3JjZUJyb3dzZXJGb2N1cykge1xyXG4gICAgLy8gZG8gbm90aGluZyBpZiBjZWxsIHNlbGVjdGlvbiBpcyBvZmZcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc1N1cHByZXNzQ2VsbFNlbGVjdGlvbigpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgLy8gcmVtb3ZlIGFueSBwcmV2aW91cyBmb2N1c1xyXG4gICAgdXRpbHMucXVlcnlTZWxlY3RvckFsbF9yZXBsYWNlQ3NzQ2xhc3ModGhpcy5lUGFyZW50T2ZSb3dzLCAnLmFnLWNlbGwtZm9jdXMnLCAnYWctY2VsbC1mb2N1cycsICdhZy1jZWxsLW5vLWZvY3VzJyk7XHJcblxyXG4gICAgdmFyIHNlbGVjdG9yRm9yQ2VsbCA9ICdbcm93PVwiJyArIHJvd0luZGV4ICsgJ1wiXSBbY29sPVwiJyArIGNvbEluZGV4ICsgJ1wiXSc7XHJcbiAgICB1dGlscy5xdWVyeVNlbGVjdG9yQWxsX3JlcGxhY2VDc3NDbGFzcyh0aGlzLmVQYXJlbnRPZlJvd3MsIHNlbGVjdG9yRm9yQ2VsbCwgJ2FnLWNlbGwtbm8tZm9jdXMnLCAnYWctY2VsbC1mb2N1cycpO1xyXG5cclxuICAgIC8vIHRoaXMgcHV0cyB0aGUgYnJvd3NlciBmb2N1cyBvbiB0aGUgY2VsbCAoc28gaXQgZ2V0cyBrZXkgcHJlc3NlcylcclxuICAgIGlmIChmb3JjZUJyb3dzZXJGb2N1cykge1xyXG4gICAgICAgIGVDZWxsLmZvY3VzKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUucG9wdWxhdGVBbmRTdHlsZUdyaWRDZWxsID0gZnVuY3Rpb24odmFsdWVHZXR0ZXIsIHZhbHVlLCBlR3JpZENlbGwsIGlzRmlyc3RDb2x1bW4sIG5vZGUsIGNvbHVtbiwgcm93SW5kZXgsICRjaGlsZFNjb3BlKSB7XHJcbiAgICB2YXIgY29sRGVmID0gY29sdW1uLmNvbERlZjtcclxuXHJcbiAgICAvLyBwb3B1bGF0ZVxyXG4gICAgdGhpcy5wb3B1bGF0ZUdyaWRDZWxsKGVHcmlkQ2VsbCwgaXNGaXJzdENvbHVtbiwgbm9kZSwgY29sdW1uLCByb3dJbmRleCwgdmFsdWUsIHZhbHVlR2V0dGVyLCAkY2hpbGRTY29wZSk7XHJcbiAgICAvLyBzdHlsZVxyXG4gICAgdGhpcy5hZGRTdHlsZXNGcm9tQ29sbERlZihjb2x1bW4sIHZhbHVlLCBub2RlLCAkY2hpbGRTY29wZSwgZUdyaWRDZWxsKTtcclxuICAgIHRoaXMuYWRkQ2xhc3Nlc0Zyb21Db2xsRGVmKGNvbERlZiwgdmFsdWUsIG5vZGUsICRjaGlsZFNjb3BlLCBlR3JpZENlbGwpO1xyXG4gICAgdGhpcy5hZGRDbGFzc2VzRnJvbVJ1bGVzKGNvbERlZiwgZUdyaWRDZWxsLCB2YWx1ZSwgbm9kZSwgcm93SW5kZXgpO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnBvcHVsYXRlR3JpZENlbGwgPSBmdW5jdGlvbihlR3JpZENlbGwsIGlzRmlyc3RDb2x1bW4sIG5vZGUsIGNvbHVtbiwgcm93SW5kZXgsIHZhbHVlLCB2YWx1ZUdldHRlciwgJGNoaWxkU2NvcGUpIHtcclxuICAgIHZhciBlQ2VsbFdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICB1dGlscy5hZGRDc3NDbGFzcyhlQ2VsbFdyYXBwZXIsIFwiYWctY2VsbC13cmFwcGVyXCIpO1xyXG4gICAgZUdyaWRDZWxsLmFwcGVuZENoaWxkKGVDZWxsV3JhcHBlcik7XHJcblxyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcbiAgICBpZiAoY29sRGVmLmNoZWNrYm94U2VsZWN0aW9uKSB7XHJcbiAgICAgICAgdmFyIGVDaGVja2JveCA9IHRoaXMuc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LmNyZWF0ZVNlbGVjdGlvbkNoZWNrYm94KG5vZGUsIHJvd0luZGV4KTtcclxuICAgICAgICBlQ2VsbFdyYXBwZXIuYXBwZW5kQ2hpbGQoZUNoZWNrYm94KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBldmVudHVhbGx5IHdlIGNhbGwgZVNwYW5XaXRoVmFsdWUuaW5uZXJIVE1MID0geHh4LCBzbyBjYW5ub3QgaW5jbHVkZSB0aGUgY2hlY2tib3ggKGFib3ZlKSBpbiB0aGlzIHNwYW5cclxuICAgIHZhciBlU3BhbldpdGhWYWx1ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgdXRpbHMuYWRkQ3NzQ2xhc3MoZVNwYW5XaXRoVmFsdWUsIFwiYWctY2VsbC12YWx1ZVwiKTtcclxuXHJcbiAgICBlQ2VsbFdyYXBwZXIuYXBwZW5kQ2hpbGQoZVNwYW5XaXRoVmFsdWUpO1xyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHZhciByZWZyZXNoQ2VsbEZ1bmN0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhhdC5zb2Z0UmVmcmVzaENlbGwoZUdyaWRDZWxsLCBpc0ZpcnN0Q29sdW1uLCBub2RlLCBjb2x1bW4sICRjaGlsZFNjb3BlLCByb3dJbmRleCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMucHV0RGF0YUludG9DZWxsKGNvbHVtbiwgdmFsdWUsIHZhbHVlR2V0dGVyLCBub2RlLCAkY2hpbGRTY29wZSwgZVNwYW5XaXRoVmFsdWUsIGVHcmlkQ2VsbCwgcm93SW5kZXgsIHJlZnJlc2hDZWxsRnVuY3Rpb24pO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmFkZENlbGxEb3VibGVDbGlja2VkSGFuZGxlciA9IGZ1bmN0aW9uKGVHcmlkQ2VsbCwgbm9kZSwgY29sdW1uLCB2YWx1ZSwgcm93SW5kZXgsICRjaGlsZFNjb3BlLCBpc0ZpcnN0Q29sdW1uLCB2YWx1ZUdldHRlcikge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcbiAgICBlR3JpZENlbGwuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxEb3VibGVDbGlja2VkKCkpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmFtc0ZvckdyaWQgPSB7XHJcbiAgICAgICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgcm93SW5kZXg6IHJvd0luZGV4LFxyXG4gICAgICAgICAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgICAgICAgICBldmVudDogZXZlbnQsXHJcbiAgICAgICAgICAgICAgICBldmVudFNvdXJjZTogdGhpcyxcclxuICAgICAgICAgICAgICAgIGFwaTogdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q2VsbERvdWJsZUNsaWNrZWQoKShwYXJhbXNGb3JHcmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbERlZi5jZWxsRG91YmxlQ2xpY2tlZCkge1xyXG4gICAgICAgICAgICB2YXIgcGFyYW1zRm9yQ29sRGVmID0ge1xyXG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgICAgICAgICAgZXZlbnRTb3VyY2U6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBhcGk6IHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbERlZi5jZWxsRG91YmxlQ2xpY2tlZChwYXJhbXNGb3JDb2xEZWYpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhhdC5pc0NlbGxFZGl0YWJsZShjb2xEZWYsIG5vZGUpKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc3RhcnRFZGl0aW5nKGVHcmlkQ2VsbCwgY29sdW1uLCBub2RlLCAkY2hpbGRTY29wZSwgcm93SW5kZXgsIGlzRmlyc3RDb2x1bW4sIHZhbHVlR2V0dGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5hZGRDZWxsQ2xpY2tlZEhhbmRsZXIgPSBmdW5jdGlvbihlR3JpZENlbGwsIG5vZGUsIGNvbHVtbiwgdmFsdWUsIHJvd0luZGV4KSB7XHJcbiAgICB2YXIgY29sRGVmID0gY29sdW1uLmNvbERlZjtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGVHcmlkQ2VsbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAvLyB3ZSBwYXNzIGZhbHNlIHRvIGZvY3VzQ2VsbCwgYXMgd2UgZG9uJ3Qgd2FudCB0aGUgY2VsbCB0byBmb2N1c1xyXG4gICAgICAgIC8vIGFsc28gZ2V0IHRoZSBicm93c2VyIGZvY3VzLiBpZiB3ZSBkaWQsIHRoZW4gdGhlIGNlbGxSZW5kZXJlciBjb3VsZFxyXG4gICAgICAgIC8vIGhhdmUgYSB0ZXh0IGZpZWxkIGluIGl0LCBmb3IgZXhhbXBsZSwgYW5kIGFzIHRoZSB1c2VyIGNsaWNrcyBvbiB0aGVcclxuICAgICAgICAvLyB0ZXh0IGZpZWxkLCB0aGUgdGV4dCBmaWVsZCwgdGhlIGZvY3VzIGRvZXNuJ3QgZ2V0IHRvIHRoZSB0ZXh0XHJcbiAgICAgICAgLy8gZmllbGQsIGluc3RlYWQgdG8gZ29lcyB0byB0aGUgZGl2IGJlaGluZCwgbWFraW5nIGl0IGltcG9zc2libGUgdG9cclxuICAgICAgICAvLyBzZWxlY3QgdGhlIHRleHQgZmllbGQuXHJcbiAgICAgICAgdGhhdC5mb2N1c0NlbGwoZUdyaWRDZWxsLCByb3dJbmRleCwgY29sdW1uLmluZGV4LCBmYWxzZSk7XHJcbiAgICAgICAgaWYgKHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxDbGlja2VkKCkpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmFtc0ZvckdyaWQgPSB7XHJcbiAgICAgICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgcm93SW5kZXg6IHJvd0luZGV4LFxyXG4gICAgICAgICAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgICAgICAgICBldmVudDogZXZlbnQsXHJcbiAgICAgICAgICAgICAgICBldmVudFNvdXJjZTogdGhpcyxcclxuICAgICAgICAgICAgICAgIGFwaTogdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q2VsbENsaWNrZWQoKShwYXJhbXNGb3JHcmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbERlZi5jZWxsQ2xpY2tlZCkge1xyXG4gICAgICAgICAgICB2YXIgcGFyYW1zRm9yQ29sRGVmID0ge1xyXG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgICAgICAgICAgZXZlbnRTb3VyY2U6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBhcGk6IHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbERlZi5jZWxsQ2xpY2tlZChwYXJhbXNGb3JDb2xEZWYpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmlzQ2VsbEVkaXRhYmxlID0gZnVuY3Rpb24oY29sRGVmLCBub2RlKSB7XHJcbiAgICBpZiAodGhpcy5lZGl0aW5nQ2VsbCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBuZXZlciBhbGxvdyBlZGl0aW5nIG9mIGdyb3Vwc1xyXG4gICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgYm9vbGVhbiBzZXQsIHRoZW4ganVzdCB1c2UgaXRcclxuICAgIGlmICh0eXBlb2YgY29sRGVmLmVkaXRhYmxlID09PSAnYm9vbGVhbicpIHtcclxuICAgICAgICByZXR1cm4gY29sRGVmLmVkaXRhYmxlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGZ1bmN0aW9uLCB0aGVuIGNhbGwgdGhlIGZ1bmN0aW9uIHRvIGZpbmQgb3V0XHJcbiAgICBpZiAodHlwZW9mIGNvbERlZi5lZGl0YWJsZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIC8vIHNob3VsZCBjaGFuZ2UgdGhpcywgc28gaXQgZ2V0cyBwYXNzZWQgcGFyYW1zIHdpdGggbmljZSB1c2VmdWwgdmFsdWVzXHJcbiAgICAgICAgcmV0dXJuIGNvbERlZi5lZGl0YWJsZShub2RlLmRhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zdG9wRWRpdGluZyA9IGZ1bmN0aW9uKGVHcmlkQ2VsbCwgY29sdW1uLCBub2RlLCAkY2hpbGRTY29wZSwgZUlucHV0LCBibHVyTGlzdGVuZXIsIHJvd0luZGV4LCBpc0ZpcnN0Q29sdW1uLCB2YWx1ZUdldHRlcikge1xyXG4gICAgdGhpcy5lZGl0aW5nQ2VsbCA9IGZhbHNlO1xyXG4gICAgdmFyIG5ld1ZhbHVlID0gZUlucHV0LnZhbHVlO1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcblxyXG4gICAgLy9JZiB3ZSBkb24ndCByZW1vdmUgdGhlIGJsdXIgbGlzdGVuZXIgZmlyc3QsIHdlIGdldDpcclxuICAgIC8vVW5jYXVnaHQgTm90Rm91bmRFcnJvcjogRmFpbGVkIHRvIGV4ZWN1dGUgJ3JlbW92ZUNoaWxkJyBvbiAnTm9kZSc6IFRoZSBub2RlIHRvIGJlIHJlbW92ZWQgaXMgbm8gbG9uZ2VyIGEgY2hpbGQgb2YgdGhpcyBub2RlLiBQZXJoYXBzIGl0IHdhcyBtb3ZlZCBpbiBhICdibHVyJyBldmVudCBoYW5kbGVyP1xyXG4gICAgZUlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCBibHVyTGlzdGVuZXIpO1xyXG5cclxuICAgIHV0aWxzLnJlbW92ZUFsbENoaWxkcmVuKGVHcmlkQ2VsbCk7XHJcblxyXG4gICAgdmFyIHBhcmFtc0ZvckNhbGxiYWNrcyA9IHtcclxuICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICBvbGRWYWx1ZTogbm9kZS5kYXRhW2NvbERlZi5maWVsZF0sXHJcbiAgICAgICAgbmV3VmFsdWU6IG5ld1ZhbHVlLFxyXG4gICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICBhcGk6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpLFxyXG4gICAgICAgIGNvbnRleHQ6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKVxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoY29sRGVmLm5ld1ZhbHVlSGFuZGxlcikge1xyXG4gICAgICAgIGNvbERlZi5uZXdWYWx1ZUhhbmRsZXIocGFyYW1zRm9yQ2FsbGJhY2tzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbm9kZS5kYXRhW2NvbERlZi5maWVsZF0gPSBuZXdWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhdCB0aGlzIHBvaW50LCB0aGUgdmFsdWUgaGFzIGJlZW4gdXBkYXRlZFxyXG4gICAgdmFyIG5ld1ZhbHVlO1xyXG4gICAgaWYgKHZhbHVlR2V0dGVyKSB7XHJcbiAgICAgICAgbmV3VmFsdWUgPSB2YWx1ZUdldHRlcigpO1xyXG4gICAgfVxyXG4gICAgcGFyYW1zRm9yQ2FsbGJhY2tzLm5ld1ZhbHVlID0gbmV3VmFsdWU7XHJcbiAgICBpZiAodHlwZW9mIGNvbERlZi5jZWxsVmFsdWVDaGFuZ2VkID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgY29sRGVmLmNlbGxWYWx1ZUNoYW5nZWQocGFyYW1zRm9yQ2FsbGJhY2tzKTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q2VsbFZhbHVlQ2hhbmdlZCgpID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q2VsbFZhbHVlQ2hhbmdlZCgpKHBhcmFtc0ZvckNhbGxiYWNrcyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5wb3B1bGF0ZUFuZFN0eWxlR3JpZENlbGwodmFsdWVHZXR0ZXIsIG5ld1ZhbHVlLCBlR3JpZENlbGwsIGlzRmlyc3RDb2x1bW4sIG5vZGUsIGNvbHVtbiwgcm93SW5kZXgsICRjaGlsZFNjb3BlKTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zdGFydEVkaXRpbmcgPSBmdW5jdGlvbihlR3JpZENlbGwsIGNvbHVtbiwgbm9kZSwgJGNoaWxkU2NvcGUsIHJvd0luZGV4LCBpc0ZpcnN0Q29sdW1uLCB2YWx1ZUdldHRlcikge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5lZGl0aW5nQ2VsbCA9IHRydWU7XHJcbiAgICB1dGlscy5yZW1vdmVBbGxDaGlsZHJlbihlR3JpZENlbGwpO1xyXG4gICAgdmFyIGVJbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICBlSW5wdXQudHlwZSA9ICd0ZXh0JztcclxuICAgIHV0aWxzLmFkZENzc0NsYXNzKGVJbnB1dCwgJ2FnLWNlbGwtZWRpdC1pbnB1dCcpO1xyXG5cclxuICAgIGlmICh2YWx1ZUdldHRlcikge1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlR2V0dGVyKCk7XHJcbiAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZUlucHV0LnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGVJbnB1dC5zdHlsZS53aWR0aCA9IChjb2x1bW4uYWN0dWFsV2lkdGggLSAxNCkgKyAncHgnO1xyXG4gICAgZUdyaWRDZWxsLmFwcGVuZENoaWxkKGVJbnB1dCk7XHJcbiAgICBlSW5wdXQuZm9jdXMoKTtcclxuICAgIGVJbnB1dC5zZWxlY3QoKTtcclxuXHJcbiAgICB2YXIgYmx1ckxpc3RlbmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhhdC5zdG9wRWRpdGluZyhlR3JpZENlbGwsIGNvbHVtbiwgbm9kZSwgJGNoaWxkU2NvcGUsIGVJbnB1dCwgYmx1ckxpc3RlbmVyLCByb3dJbmRleCwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvL3N0b3AgZW50ZXJpbmcgaWYgd2UgbG9vc2UgZm9jdXNcclxuICAgIGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCBibHVyTGlzdGVuZXIpO1xyXG5cclxuICAgIC8vc3RvcCBlZGl0aW5nIGlmIGVudGVyIHByZXNzZWRcclxuICAgIGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGV2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGU7XHJcbiAgICAgICAgLy8gMTMgaXMgZW50ZXJcclxuICAgICAgICBpZiAoa2V5ID09IGNvbnN0YW50cy5LRVlfRU5URVIpIHtcclxuICAgICAgICAgICAgdGhhdC5zdG9wRWRpdGluZyhlR3JpZENlbGwsIGNvbHVtbiwgbm9kZSwgJGNoaWxkU2NvcGUsIGVJbnB1dCwgYmx1ckxpc3RlbmVyLCByb3dJbmRleCwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpO1xyXG4gICAgICAgICAgICB0aGF0LmZvY3VzQ2VsbChlR3JpZENlbGwsIHJvd0luZGV4LCBjb2x1bW4uaW5kZXgsIHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIHRhYiBrZXkgZG9lc24ndCBnZW5lcmF0ZSBrZXlwcmVzcywgc28gbmVlZCBrZXlkb3duIHRvIGxpc3RlbiBmb3IgdGhhdFxyXG4gICAgZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIHZhciBrZXkgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlO1xyXG4gICAgICAgIGlmIChrZXkgPT0gY29uc3RhbnRzLktFWV9UQUIpIHtcclxuICAgICAgICAgICAgdGhhdC5zdG9wRWRpdGluZyhlR3JpZENlbGwsIGNvbHVtbiwgbm9kZSwgJGNoaWxkU2NvcGUsIGVJbnB1dCwgYmx1ckxpc3RlbmVyLCByb3dJbmRleCwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpO1xyXG4gICAgICAgICAgICB0aGF0LnN0YXJ0RWRpdGluZ05leHRDZWxsKHJvd0luZGV4LCBjb2x1bW4sIGV2ZW50LnNoaWZ0S2V5KTtcclxuICAgICAgICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0aGUgZGVmYXVsdCB0YWIgYWN0aW9uLCBzbyByZXR1cm4gZmFsc2UsIHRoaXMgc3RvcHMgdGhlIGV2ZW50IGZyb20gYnViYmxpbmdcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnN0YXJ0RWRpdGluZ05leHRDZWxsID0gZnVuY3Rpb24ocm93SW5kZXgsIGNvbHVtbiwgc2hpZnRLZXkpIHtcclxuXHJcbiAgICB2YXIgZmlyc3RSb3dUb0NoZWNrID0gdGhpcy5maXJzdFZpcnR1YWxSZW5kZXJlZFJvdztcclxuICAgIHZhciBsYXN0Um93VG9DaGVjayA9IHRoaXMubGFzdFZpcnR1YWxSZW5kZXJlZFJvdztcclxuICAgIHZhciBjdXJyZW50Um93SW5kZXggPSByb3dJbmRleDtcclxuXHJcbiAgICB2YXIgdmlzaWJsZUNvbHVtbnMgPSB0aGlzLmNvbHVtbk1vZGVsLmdldFZpc2libGVDb2x1bW5zKCk7XHJcbiAgICB2YXIgY3VycmVudENvbCA9IGNvbHVtbjtcclxuXHJcbiAgICB3aGlsZSAodHJ1ZSkge1xyXG5cclxuICAgICAgICB2YXIgaW5kZXhPZkN1cnJlbnRDb2wgPSB2aXNpYmxlQ29sdW1ucy5pbmRleE9mKGN1cnJlbnRDb2wpO1xyXG5cclxuICAgICAgICAvLyBtb3ZlIGJhY2t3YXJkXHJcbiAgICAgICAgaWYgKHNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICAgIC8vIG1vdmUgYWxvbmcgdG8gdGhlIHByZXZpb3VzIGNlbGxcclxuICAgICAgICAgICAgY3VycmVudENvbCA9IHZpc2libGVDb2x1bW5zW2luZGV4T2ZDdXJyZW50Q29sIC0gMV07XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIGVuZCBvZiB0aGUgcm93LCBhbmQgaWYgc28sIGdvIGJhY2sgYSByb3dcclxuICAgICAgICAgICAgaWYgKCFjdXJyZW50Q29sKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50Q29sID0gdmlzaWJsZUNvbHVtbnNbdmlzaWJsZUNvbHVtbnMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50Um93SW5kZXgtLTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgZ290IHRvIGVuZCBvZiByZW5kZXJlZCByb3dzLCB0aGVuIHF1aXQgbG9va2luZ1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudFJvd0luZGV4IDwgZmlyc3RSb3dUb0NoZWNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gbW92ZSBmb3J3YXJkXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gbW92ZSBhbG9uZyB0byB0aGUgbmV4dCBjZWxsXHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2wgPSB2aXNpYmxlQ29sdW1uc1tpbmRleE9mQ3VycmVudENvbCArIDFdO1xyXG4gICAgICAgICAgICAvLyBjaGVjayBpZiBlbmQgb2YgdGhlIHJvdywgYW5kIGlmIHNvLCBnbyBmb3J3YXJkIGEgcm93XHJcbiAgICAgICAgICAgIGlmICghY3VycmVudENvbCkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudENvbCA9IHZpc2libGVDb2x1bW5zWzBdO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFJvd0luZGV4Kys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGlmIGdvdCB0byBlbmQgb2YgcmVuZGVyZWQgcm93cywgdGhlbiBxdWl0IGxvb2tpbmdcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRSb3dJbmRleCA+IGxhc3RSb3dUb0NoZWNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBuZXh0RnVuYyA9IHRoaXMucmVuZGVyZWRSb3dTdGFydEVkaXRpbmdMaXN0ZW5lcnNbY3VycmVudFJvd0luZGV4XVtjdXJyZW50Q29sLmNvbEtleV07XHJcbiAgICAgICAgaWYgKG5leHRGdW5jKSB7XHJcbiAgICAgICAgICAgIC8vIHNlZSBpZiB0aGUgbmV4dCBjZWxsIGlzIGVkaXRhYmxlLCBhbmQgaWYgc28sIHdlIGhhdmUgY29tZSB0b1xyXG4gICAgICAgICAgICAvLyB0aGUgZW5kIG9mIG91ciBzZWFyY2gsIHNvIHN0b3AgbG9va2luZyBmb3IgdGhlIG5leHQgY2VsbFxyXG4gICAgICAgICAgICB2YXIgbmV4dENlbGxBY2NlcHRlZEVkaXQgPSBuZXh0RnVuYygpO1xyXG4gICAgICAgICAgICBpZiAobmV4dENlbGxBY2NlcHRlZEVkaXQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJvd1JlbmRlcmVyO1xyXG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcblxyXG4vLyB0aGVzZSBjb25zdGFudHMgYXJlIHVzZWQgZm9yIGRldGVybWluaW5nIGlmIGdyb3VwcyBzaG91bGRcclxuLy8gYmUgc2VsZWN0ZWQgb3IgZGVzZWxlY3RlZCB3aGVuIHNlbGVjdGluZyBncm91cHMsIGFuZCB0aGUgZ3JvdXBcclxuLy8gdGhlbiBzZWxlY3RzIHRoZSBjaGlsZHJlbi5cclxudmFyIFNFTEVDVEVEID0gMDtcclxudmFyIFVOU0VMRUNURUQgPSAxO1xyXG52YXIgTUlYRUQgPSAyO1xyXG52YXIgRE9fTk9UX0NBUkUgPSAzO1xyXG5cclxuZnVuY3Rpb24gU2VsZWN0aW9uQ29udHJvbGxlcigpIHt9XHJcblxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oYW5ndWxhckdyaWQsIGVSb3dzUGFyZW50LCBncmlkT3B0aW9uc1dyYXBwZXIsICRzY29wZSwgcm93UmVuZGVyZXIpIHtcclxuICAgIHRoaXMuZVJvd3NQYXJlbnQgPSBlUm93c1BhcmVudDtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZDtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyID0gZ3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4gICAgdGhpcy4kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLnJvd1JlbmRlcmVyID0gcm93UmVuZGVyZXI7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuXHJcbiAgICB0aGlzLmluaXRTZWxlY3RlZE5vZGVzQnlJZCgpO1xyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWRSb3dzID0gW107XHJcbiAgICBncmlkT3B0aW9uc1dyYXBwZXIuc2V0U2VsZWN0ZWRSb3dzKHRoaXMuc2VsZWN0ZWRSb3dzKTtcclxufTtcclxuXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmluaXRTZWxlY3RlZE5vZGVzQnlJZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5zZWxlY3RlZE5vZGVzQnlJZCA9IHt9O1xyXG4gICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuc2V0U2VsZWN0ZWROb2Rlc0J5SWQodGhpcy5zZWxlY3RlZE5vZGVzQnlJZCk7XHJcbn07XHJcblxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5nZXRTZWxlY3RlZE5vZGVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2VsZWN0ZWROb2RlcyA9IFtdO1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBpZCA9IGtleXNbaV07XHJcbiAgICAgICAgdmFyIHNlbGVjdGVkTm9kZSA9IHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRbaWRdO1xyXG4gICAgICAgIHNlbGVjdGVkTm9kZXMucHVzaChzZWxlY3RlZE5vZGUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlbGVjdGVkTm9kZXM7XHJcbn07XHJcblxyXG4vLyByZXR1cm5zIGEgbGlzdCBvZiBhbGwgbm9kZXMgYXQgJ2Jlc3QgY29zdCcgLSBhIGZlYXR1cmUgdG8gYmUgdXNlZFxyXG4vLyB3aXRoIGdyb3VwcyAvIHRyZWVzLiBpZiBhIGdyb3VwIGhhcyBhbGwgaXQncyBjaGlsZHJlbiBzZWxlY3RlZCxcclxuLy8gdGhlbiB0aGUgZ3JvdXAgYXBwZWFycyBpbiB0aGUgcmVzdWx0LCBidXQgbm90IHRoZSBjaGlsZHJlbi5cclxuLy8gRGVzaWduZWQgZm9yIHVzZSB3aXRoICdjaGlsZHJlbicgYXMgdGhlIGdyb3VwIHNlbGVjdGlvbiB0eXBlLFxyXG4vLyB3aGVyZSBncm91cHMgZG9uJ3QgYWN0dWFsbHkgYXBwZWFyIGluIHRoZSBzZWxlY3Rpb24gbm9ybWFsbHkuXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmdldEJlc3RDb3N0Tm9kZVNlbGVjdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmICh0eXBlb2YgdGhpcy5yb3dNb2RlbC5nZXRUb3BMZXZlbE5vZGVzICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhyb3cgJ3NlbGVjdEFsbCBub3QgYXZhaWxhYmxlIHdoZW4gcm93cyBhcmUgb24gdGhlIHNlcnZlcic7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRvcExldmVsTm9kZXMgPSB0aGlzLnJvd01vZGVsLmdldFRvcExldmVsTm9kZXMoKTtcclxuXHJcbiAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgLy8gcmVjdXJzaXZlIGZ1bmN0aW9uLCB0byBmaW5kIHRoZSBzZWxlY3RlZCBub2Rlc1xyXG4gICAgZnVuY3Rpb24gdHJhdmVyc2Uobm9kZXMpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG5vZGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldO1xyXG4gICAgICAgICAgICBpZiAodGhhdC5pc05vZGVTZWxlY3RlZChub2RlKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobm9kZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiBub3Qgc2VsZWN0ZWQsIHRoZW4gaWYgaXQncyBhIGdyb3VwLCBhbmQgdGhlIGdyb3VwXHJcbiAgICAgICAgICAgICAgICAvLyBoYXMgY2hpbGRyZW4sIGNvbnRpbnVlIHRvIHNlYXJjaCBmb3Igc2VsZWN0aW9uc1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuZ3JvdXAgJiYgbm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYXZlcnNlKG5vZGUuY2hpbGRyZW4pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRyYXZlcnNlKHRvcExldmVsTm9kZXMpO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5zZXRSb3dNb2RlbCA9IGZ1bmN0aW9uKHJvd01vZGVsKSB7XHJcbiAgICB0aGlzLnJvd01vZGVsID0gcm93TW9kZWw7XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgLSB0aGlzIGNsZWFycyB0aGUgc2VsZWN0aW9uLCBidXQgZG9lc24ndCBjbGVhciBkb3duIHRoZSBjc3MgLSB3aGVuIGl0IGlzIGNhbGxlZCwgdGhlXHJcbi8vIGNhbGxlciB0aGVuIGdldHMgdGhlIGdyaWQgdG8gcmVmcmVzaC5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZGVzZWxlY3RBbGwgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuaW5pdFNlbGVjdGVkTm9kZXNCeUlkKCk7XHJcbiAgICAvL3ZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcy5zZWxlY3RlZE5vZGVzQnlJZCk7XHJcbiAgICAvL2ZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgLy8gICAgZGVsZXRlIHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRba2V5c1tpXV07XHJcbiAgICAvL31cclxuICAgIHRoaXMuc3luY1NlbGVjdGVkUm93c0FuZENhbGxMaXN0ZW5lcigpO1xyXG59O1xyXG5cclxuLy8gcHVibGljIC0gdGhpcyBzZWxlY3RzIGV2ZXJ5dGhpbmcsIGJ1dCBkb2Vzbid0IGNsZWFyIGRvd24gdGhlIGNzcyAtIHdoZW4gaXQgaXMgY2FsbGVkLCB0aGVcclxuLy8gY2FsbGVyIHRoZW4gZ2V0cyB0aGUgZ3JpZCB0byByZWZyZXNoLlxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5zZWxlY3RBbGwgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBpZiAodHlwZW9mIHRoaXMucm93TW9kZWwuZ2V0VG9wTGV2ZWxOb2RlcyAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRocm93ICdzZWxlY3RBbGwgbm90IGF2YWlsYWJsZSB3aGVuIHJvd3MgYXJlIG9uIHRoZSBzZXJ2ZXInO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzZWxlY3RlZE5vZGVzQnlJZCA9IHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWQ7XHJcbiAgICAvLyBpZiB0aGUgc2VsZWN0aW9uIGlzIFwiZG9uJ3QgaW5jbHVkZSBncm91cHNcIiwgdGhlbiB3ZSBkb24ndCBpbmNsdWRlIHRoZW0hXHJcbiAgICB2YXIgaW5jbHVkZUdyb3VwcyA9ICF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwU2VsZWN0c0NoaWxkcmVuKCk7XHJcblxyXG4gICAgZnVuY3Rpb24gcmVjdXJzaXZlbHlTZWxlY3Qobm9kZXMpIHtcclxuICAgICAgICBpZiAobm9kZXMpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGk8bm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5ncm91cCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlY3Vyc2l2ZWx5U2VsZWN0KG5vZGUuY2hpbGRyZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmNsdWRlR3JvdXBzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkTm9kZXNCeUlkW25vZGUuaWRdID0gbm9kZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkTm9kZXNCeUlkW25vZGUuaWRdID0gbm9kZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgdG9wTGV2ZWxOb2RlcyA9IHRoaXMucm93TW9kZWwuZ2V0VG9wTGV2ZWxOb2RlcygpO1xyXG4gICAgcmVjdXJzaXZlbHlTZWxlY3QodG9wTGV2ZWxOb2Rlcyk7XHJcblxyXG4gICAgdGhpcy5zeW5jU2VsZWN0ZWRSb3dzQW5kQ2FsbExpc3RlbmVyKCk7XHJcbn07XHJcblxyXG4vLyBwdWJsaWNcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuc2VsZWN0Tm9kZSA9IGZ1bmN0aW9uKG5vZGUsIHRyeU11bHRpLCBzdXBwcmVzc0V2ZW50cykge1xyXG4gICAgdmFyIG11bHRpU2VsZWN0ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNSb3dTZWxlY3Rpb25NdWx0aSgpICYmIHRyeU11bHRpO1xyXG5cclxuICAgIC8vIGlmIHRoZSBub2RlIGlzIGEgZ3JvdXAsIHRoZW4gc2VsZWN0aW5nIHRoaXMgaXMgdGhlIHNhbWUgYXMgc2VsZWN0aW5nIHRoZSBwYXJlbnQsXHJcbiAgICAvLyBzbyB0byBoYXZlIG9ubHkgb25lIGZsb3cgdGhyb3VnaCB0aGUgYmVsb3csIHdlIGFsd2F5cyBzZWxlY3QgdGhlIGhlYWRlciBwYXJlbnRcclxuICAgIC8vICh3aGljaCB0aGVuIGhhcyB0aGUgc2lkZSBlZmZlY3Qgb2Ygc2VsZWN0aW5nIHRoZSBjaGlsZCkuXHJcbiAgICB2YXIgbm9kZVRvU2VsZWN0O1xyXG4gICAgaWYgKG5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgbm9kZVRvU2VsZWN0ID0gbm9kZS5zaWJsaW5nO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBub2RlVG9TZWxlY3QgPSBub2RlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGF0IHRoZSBlbmQsIGlmIHRoaXMgaXMgdHJ1ZSwgd2UgaW5mb3JtIHRoZSBjYWxsYmFja1xyXG4gICAgdmFyIGF0TGVhc3RPbmVJdGVtVW5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgdmFyIGF0TGVhc3RPbmVJdGVtU2VsZWN0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBzZWUgaWYgcm93cyB0byBiZSBkZXNlbGVjdGVkXHJcbiAgICBpZiAoIW11bHRpU2VsZWN0KSB7XHJcbiAgICAgICAgYXRMZWFzdE9uZUl0ZW1VbnNlbGVjdGVkID0gdGhpcy5kb1dvcmtPZkRlc2VsZWN0QWxsTm9kZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cFNlbGVjdHNDaGlsZHJlbigpICYmIG5vZGVUb1NlbGVjdC5ncm91cCkge1xyXG4gICAgICAgIC8vIGRvbid0IHNlbGVjdCB0aGUgZ3JvdXAsIHNlbGVjdCB0aGUgY2hpbGRyZW4gaW5zdGVhZFxyXG4gICAgICAgIGF0TGVhc3RPbmVJdGVtU2VsZWN0ZWQgPSB0aGlzLnJlY3Vyc2l2ZWx5U2VsZWN0QWxsQ2hpbGRyZW4obm9kZVRvU2VsZWN0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gc2VlIGlmIHJvdyBuZWVkcyB0byBiZSBzZWxlY3RlZFxyXG4gICAgICAgIGF0TGVhc3RPbmVJdGVtU2VsZWN0ZWQgPSB0aGlzLmRvV29ya09mU2VsZWN0Tm9kZShub2RlVG9TZWxlY3QsIHN1cHByZXNzRXZlbnRzKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYXRMZWFzdE9uZUl0ZW1VbnNlbGVjdGVkIHx8IGF0TGVhc3RPbmVJdGVtU2VsZWN0ZWQpIHtcclxuICAgICAgICB0aGlzLnN5bmNTZWxlY3RlZFJvd3NBbmRDYWxsTGlzdGVuZXIoc3VwcHJlc3NFdmVudHMpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudXBkYXRlR3JvdXBQYXJlbnRzSWZOZWVkZWQoKTtcclxufTtcclxuXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnJlY3Vyc2l2ZWx5U2VsZWN0QWxsQ2hpbGRyZW4gPSBmdW5jdGlvbihub2RlLCBzdXBwcmVzc0V2ZW50cykge1xyXG4gICAgdmFyIGF0TGVhc3RPbmUgPSBmYWxzZTtcclxuICAgIGlmIChub2RlLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5ncm91cCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmVjdXJzaXZlbHlTZWxlY3RBbGxDaGlsZHJlbihjaGlsZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBhdExlYXN0T25lID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRvV29ya09mU2VsZWN0Tm9kZShjaGlsZCwgc3VwcHJlc3NFdmVudHMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXRMZWFzdE9uZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXRMZWFzdE9uZTtcclxufTtcclxuXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnJlY3Vyc2l2ZWx5RGVzZWxlY3RBbGxDaGlsZHJlbiA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIGlmIChub2RlLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5ncm91cCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWN1cnNpdmVseURlc2VsZWN0QWxsQ2hpbGRyZW4oY2hpbGQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXNlbGVjdFJlYWxOb2RlKGNoaWxkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuLy8gMSAtIHNlbGVjdHMgYSBub2RlXHJcbi8vIDIgLSB1cGRhdGVzIHRoZSBVSVxyXG4vLyAzIC0gY2FsbHMgY2FsbGJhY2tzXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmRvV29ya09mU2VsZWN0Tm9kZSA9IGZ1bmN0aW9uKG5vZGUsIHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICBpZiAodGhpcy5zZWxlY3RlZE5vZGVzQnlJZFtub2RlLmlkXSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW25vZGUuaWRdID0gbm9kZTtcclxuXHJcbiAgICB0aGlzLmFkZENzc0NsYXNzRm9yTm9kZV9hbmRJbmZvcm1WaXJ0dWFsUm93TGlzdGVuZXIobm9kZSk7XHJcblxyXG4gICAgLy8gYWxzbyBjb2xvciBpbiB0aGUgZm9vdGVyIGlmIHRoZXJlIGlzIG9uZVxyXG4gICAgaWYgKG5vZGUuZ3JvdXAgJiYgbm9kZS5leHBhbmRlZCAmJiBub2RlLnNpYmxpbmcpIHtcclxuICAgICAgICB0aGlzLmFkZENzc0NsYXNzRm9yTm9kZV9hbmRJbmZvcm1WaXJ0dWFsUm93TGlzdGVuZXIobm9kZS5zaWJsaW5nKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpbmZvcm0gdGhlIHJvd1NlbGVjdGVkIGxpc3RlbmVyLCBpZiBhbnlcclxuICAgIGlmICghc3VwcHJlc3NFdmVudHMgJiYgdHlwZW9mIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd1NlbGVjdGVkKCkgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd1NlbGVjdGVkKCkobm9kZS5kYXRhLCBub2RlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuLy8gMSAtIHNlbGVjdHMgYSBub2RlXHJcbi8vIDIgLSB1cGRhdGVzIHRoZSBVSVxyXG4vLyAzIC0gY2FsbHMgY2FsbGJhY2tzXHJcbi8vIHdvdyAtIHdoYXQgYSBiaWcgbmFtZSBmb3IgYSBtZXRob2QsIGV4Y2VwdGlvbiBjYXNlLCBpdCdzIHNheWluZyB3aGF0IHRoZSBtZXRob2QgZG9lc1xyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5hZGRDc3NDbGFzc0Zvck5vZGVfYW5kSW5mb3JtVmlydHVhbFJvd0xpc3RlbmVyID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ID0gdGhpcy5yb3dSZW5kZXJlci5nZXRJbmRleE9mUmVuZGVyZWROb2RlKG5vZGUpO1xyXG4gICAgaWYgKHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ID49IDApIHtcclxuICAgICAgICB1dGlscy5xdWVyeVNlbGVjdG9yQWxsX2FkZENzc0NsYXNzKHRoaXMuZVJvd3NQYXJlbnQsICdbcm93PVwiJyArIHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ICsgJ1wiXScsICdhZy1yb3ctc2VsZWN0ZWQnKTtcclxuXHJcbiAgICAgICAgLy8gaW5mb3JtIHZpcnR1YWwgcm93IGxpc3RlbmVyXHJcbiAgICAgICAgdGhpcy5hbmd1bGFyR3JpZC5vblZpcnR1YWxSb3dTZWxlY3RlZCh2aXJ0dWFsUmVuZGVyZWRSb3dJbmRleCwgdHJ1ZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbi8vIDEgLSB1bi1zZWxlY3RzIGEgbm9kZVxyXG4vLyAyIC0gdXBkYXRlcyB0aGUgVUlcclxuLy8gMyAtIGNhbGxzIGNhbGxiYWNrc1xyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5kb1dvcmtPZkRlc2VsZWN0QWxsTm9kZXMgPSBmdW5jdGlvbihub2RlVG9LZWVwU2VsZWN0ZWQpIHtcclxuICAgIC8vIG5vdCBkb2luZyBtdWx0aS1zZWxlY3QsIHNvIGRlc2VsZWN0IGV2ZXJ5dGhpbmcgb3RoZXIgdGhhbiB0aGUgJ2p1c3Qgc2VsZWN0ZWQnIHJvd1xyXG4gICAgdmFyIGF0TGVhc3RPbmVTZWxlY3Rpb25DaGFuZ2U7XHJcbiAgICB2YXIgc2VsZWN0ZWROb2RlS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWQpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxlY3RlZE5vZGVLZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgLy8gc2tpcCB0aGUgJ2p1c3Qgc2VsZWN0ZWQnIHJvd1xyXG4gICAgICAgIHZhciBrZXkgPSBzZWxlY3RlZE5vZGVLZXlzW2ldO1xyXG4gICAgICAgIHZhciBub2RlVG9EZXNlbGVjdCA9IHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRba2V5XTtcclxuICAgICAgICBpZiAobm9kZVRvRGVzZWxlY3QgPT09IG5vZGVUb0tlZXBTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRlc2VsZWN0UmVhbE5vZGUobm9kZVRvRGVzZWxlY3QpO1xyXG4gICAgICAgICAgICBhdExlYXN0T25lU2VsZWN0aW9uQ2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXRMZWFzdE9uZVNlbGVjdGlvbkNoYW5nZTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZGVzZWxlY3RSZWFsTm9kZSA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIC8vIGRlc2VsZWN0IHRoZSBjc3NcclxuICAgIHRoaXMucmVtb3ZlQ3NzQ2xhc3NGb3JOb2RlKG5vZGUpO1xyXG5cclxuICAgIC8vIGlmIG5vZGUgaXMgYSBoZWFkZXIsIGFuZCBpZiBpdCBoYXMgYSBzaWJsaW5nIGZvb3RlciwgZGVzZWxlY3QgdGhlIGZvb3RlciBhbHNvXHJcbiAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmV4cGFuZGVkICYmIG5vZGUuc2libGluZykgeyAvLyBhbHNvIGNoZWNrIHRoYXQgaXQncyBleHBhbmRlZCwgYXMgc2libGluZyBjb3VsZCBiZSBhIGdob3N0XHJcbiAgICAgICAgdGhpcy5yZW1vdmVDc3NDbGFzc0Zvck5vZGUobm9kZS5zaWJsaW5nKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZW1vdmUgdGhlIHJvd1xyXG4gICAgZGVsZXRlIHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRbbm9kZS5pZF07XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnJlbW92ZUNzc0NsYXNzRm9yTm9kZSA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIHZhciB2aXJ0dWFsUmVuZGVyZWRSb3dJbmRleCA9IHRoaXMucm93UmVuZGVyZXIuZ2V0SW5kZXhPZlJlbmRlcmVkTm9kZShub2RlKTtcclxuICAgIGlmICh2aXJ0dWFsUmVuZGVyZWRSb3dJbmRleCA+PSAwKSB7XHJcbiAgICAgICAgdXRpbHMucXVlcnlTZWxlY3RvckFsbF9yZW1vdmVDc3NDbGFzcyh0aGlzLmVSb3dzUGFyZW50LCAnW3Jvdz1cIicgKyB2aXJ0dWFsUmVuZGVyZWRSb3dJbmRleCArICdcIl0nLCAnYWctcm93LXNlbGVjdGVkJyk7XHJcbiAgICAgICAgLy8gaW5mb3JtIHZpcnR1YWwgcm93IGxpc3RlbmVyXHJcbiAgICAgICAgdGhpcy5hbmd1bGFyR3JpZC5vblZpcnR1YWxSb3dTZWxlY3RlZCh2aXJ0dWFsUmVuZGVyZWRSb3dJbmRleCwgZmFsc2UpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHVibGljIChzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkpXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmRlc2VsZWN0SW5kZXggPSBmdW5jdGlvbihyb3dJbmRleCkge1xyXG4gICAgdmFyIG5vZGUgPSB0aGlzLnJvd01vZGVsLmdldFZpcnR1YWxSb3cocm93SW5kZXgpO1xyXG4gICAgdGhpcy5kZXNlbGVjdE5vZGUobm9kZSk7XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgKGFwaSlcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZGVzZWxlY3ROb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKG5vZGUpIHtcclxuICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cFNlbGVjdHNDaGlsZHJlbigpICYmIG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgLy8gd2FudCB0byBkZXNlbGVjdCBjaGlsZHJlbiwgbm90IHRoaXMgbm9kZSwgc28gcmVjdXJzaXZlbHkgZGVzZWxlY3RcclxuICAgICAgICAgICAgdGhpcy5yZWN1cnNpdmVseURlc2VsZWN0QWxsQ2hpbGRyZW4obm9kZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kZXNlbGVjdFJlYWxOb2RlKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuc3luY1NlbGVjdGVkUm93c0FuZENhbGxMaXN0ZW5lcigpO1xyXG4gICAgdGhpcy51cGRhdGVHcm91cFBhcmVudHNJZk5lZWRlZCgpO1xyXG59O1xyXG5cclxuLy8gcHVibGljIChzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkgJiBhcGkpXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnNlbGVjdEluZGV4ID0gZnVuY3Rpb24oaW5kZXgsIHRyeU11bHRpLCBzdXBwcmVzc0V2ZW50cykge1xyXG4gICAgdmFyIG5vZGUgPSB0aGlzLnJvd01vZGVsLmdldFZpcnR1YWxSb3coaW5kZXgpO1xyXG4gICAgdGhpcy5zZWxlY3ROb2RlKG5vZGUsIHRyeU11bHRpLCBzdXBwcmVzc0V2ZW50cyk7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbi8vIHVwZGF0ZXMgdGhlIHNlbGVjdGVkUm93cyB3aXRoIHRoZSBzZWxlY3RlZE5vZGVzIGFuZCBjYWxscyBzZWxlY3Rpb25DaGFuZ2VkIGxpc3RlbmVyXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnN5bmNTZWxlY3RlZFJvd3NBbmRDYWxsTGlzdGVuZXIgPSBmdW5jdGlvbihzdXBwcmVzc0V2ZW50cykge1xyXG4gICAgLy8gdXBkYXRlIHNlbGVjdGVkIHJvd3NcclxuICAgIHZhciBzZWxlY3RlZFJvd3MgPSB0aGlzLnNlbGVjdGVkUm93cztcclxuICAgIHZhciBvbGRDb3VudCA9IHNlbGVjdGVkUm93cy5sZW5ndGg7XHJcbiAgICAvLyBjbGVhciBzZWxlY3RlZCByb3dzXHJcbiAgICBzZWxlY3RlZFJvd3MubGVuZ3RoID0gMDtcclxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcy5zZWxlY3RlZE5vZGVzQnlJZCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZE5vZGVzQnlJZFtrZXlzW2ldXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZE5vZGUgPSB0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW2tleXNbaV1dO1xyXG4gICAgICAgICAgICBzZWxlY3RlZFJvd3MucHVzaChzZWxlY3RlZE5vZGUuZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoaXMgc3RvcGUgdGhlIGV2ZW50IGZpcmluZyB0aGUgdmVyeSBmaXJzdCB0aGUgdGltZSBncmlkIGlzIGluaXRpYWxpc2VkLiB3aXRob3V0IHRoaXMsIHRoZSBkb2N1bWVudGF0aW9uXHJcbiAgICAvLyBwYWdlIGhhZCBhIHBvcHVwIGluIHRoZSAnc2VsZWN0aW9uJyBwYWdlIGFzIHNvb24gYXMgdGhlIHBhZ2Ugd2FzIGxvYWRlZCEhXHJcbiAgICB2YXIgbm90aGluZ0NoYW5nZWRNdXN0QmVJbml0aWFsaXNpbmcgPSBvbGRDb3VudCA9PT0gMCAmJiBzZWxlY3RlZFJvd3MubGVuZ3RoID09PSAwO1xyXG5cclxuICAgIGlmICghbm90aGluZ0NoYW5nZWRNdXN0QmVJbml0aWFsaXNpbmcgJiYgIXN1cHByZXNzRXZlbnRzICYmIHR5cGVvZiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRTZWxlY3Rpb25DaGFuZ2VkKCkgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFNlbGVjdGlvbkNoYW5nZWQoKSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGlmICh0aGlzLiRzY29wZSkge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH0sIDApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5yZWN1cnNpdmVseUNoZWNrSWZTZWxlY3RlZCA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIHZhciBmb3VuZFNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICB2YXIgZm91bmRVbnNlbGVjdGVkID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdDtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLnJlY3Vyc2l2ZWx5Q2hlY2tJZlNlbGVjdGVkKGNoaWxkKTtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBTRUxFQ1RFRDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRTZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgVU5TRUxFQ1RFRDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRVbnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBNSVhFRDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRTZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kVW5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBjYW4gaWdub3JlIHRoZSBET19OT1RfQ0FSRSwgYXMgaXQgZG9lc24ndCBpbXBhY3QsIG1lYW5zIHRoZSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBoYXMgbm8gY2hpbGRyZW4gYW5kIHNob3VsZG4ndCBiZSBjb25zaWRlcmVkIHdoZW4gZGVjaWRpbmdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzTm9kZVNlbGVjdGVkKGNoaWxkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kU2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZFVuc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZm91bmRTZWxlY3RlZCAmJiBmb3VuZFVuc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIGlmIG1peGVkLCB0aGVuIG5vIG5lZWQgdG8gZ28gZnVydGhlciwganVzdCByZXR1cm4gdXAgdGhlIGNoYWluXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gTUlYRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZ290IHRoaXMgZmFyLCBzbyBubyBjb25mbGljdHMsIGVpdGhlciBhbGwgY2hpbGRyZW4gc2VsZWN0ZWQsIHVuc2VsZWN0ZWQsIG9yIG5laXRoZXJcclxuICAgIGlmIChmb3VuZFNlbGVjdGVkKSB7XHJcbiAgICAgICAgcmV0dXJuIFNFTEVDVEVEO1xyXG4gICAgfSBlbHNlIGlmIChmb3VuZFVuc2VsZWN0ZWQpIHtcclxuICAgICAgICByZXR1cm4gVU5TRUxFQ1RFRDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIERPX05PVF9DQVJFO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHVibGljIChzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkpXHJcbi8vIHJldHVybnM6XHJcbi8vIHRydWU6IGlmIHNlbGVjdGVkXHJcbi8vIGZhbHNlOiBpZiB1bnNlbGVjdGVkXHJcbi8vIHVuZGVmaW5lZDogaWYgaXQncyBhIGdyb3VwIGFuZCAnY2hpbGRyZW4gc2VsZWN0aW9uJyBpcyB1c2VkIGFuZCAnY2hpbGRyZW4nIGFyZSBhIG1peCBvZiBzZWxlY3RlZCBhbmQgdW5zZWxlY3RlZFxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5pc05vZGVTZWxlY3RlZCA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwU2VsZWN0c0NoaWxkcmVuKCkgJiYgbm9kZS5ncm91cCkge1xyXG4gICAgICAgIC8vIGRvaW5nIGNoaWxkIHNlbGVjdGlvbiwgd2UgbmVlZCB0byB0cmF2ZXJzZSB0aGUgY2hpbGRyZW5cclxuICAgICAgICB2YXIgcmVzdWx0T2ZDaGlsZHJlbiA9IHRoaXMucmVjdXJzaXZlbHlDaGVja0lmU2VsZWN0ZWQobm9kZSk7XHJcbiAgICAgICAgc3dpdGNoIChyZXN1bHRPZkNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgIGNhc2UgU0VMRUNURUQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgY2FzZSBVTlNFTEVDVEVEOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW25vZGUuaWRdICE9PSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbn07XHJcblxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVHcm91cFBhcmVudHNJZk5lZWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gd2Ugb25seSBkbyB0aGlzIGlmIHBhcmVudCBub2RlcyBhcmUgcmVzcG9uc2libGVcclxuICAgIC8vIGZvciBzZWxlY3RpbmcgdGhlaXIgY2hpbGRyZW4uXHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBTZWxlY3RzQ2hpbGRyZW4oKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZmlyc3RSb3cgPSB0aGlzLnJvd1JlbmRlcmVyLmdldEZpcnN0VmlydHVhbFJlbmRlcmVkUm93KCk7XHJcbiAgICB2YXIgbGFzdFJvdyA9IHRoaXMucm93UmVuZGVyZXIuZ2V0TGFzdFZpcnR1YWxSZW5kZXJlZFJvdygpO1xyXG4gICAgZm9yICh2YXIgcm93SW5kZXggPSBmaXJzdFJvdzsgcm93SW5kZXggPD0gbGFzdFJvdzsgcm93SW5kZXgrKykge1xyXG4gICAgICAgIC8vIHNlZSBpZiBub2RlIGlzIGEgZ3JvdXBcclxuICAgICAgICB2YXIgbm9kZSA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvdyhyb3dJbmRleCk7XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gdGhpcy5pc05vZGVTZWxlY3RlZChub2RlKTtcclxuICAgICAgICAgICAgdGhpcy5hbmd1bGFyR3JpZC5vblZpcnR1YWxSb3dTZWxlY3RlZChyb3dJbmRleCwgc2VsZWN0ZWQpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5xdWVyeVNlbGVjdG9yQWxsX2FkZENzc0NsYXNzKHRoaXMuZVJvd3NQYXJlbnQsICdbcm93PVwiJyArIHJvd0luZGV4ICsgJ1wiXScsICdhZy1yb3ctc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHV0aWxzLnF1ZXJ5U2VsZWN0b3JBbGxfcmVtb3ZlQ3NzQ2xhc3ModGhpcy5lUm93c1BhcmVudCwgJ1tyb3c9XCInICsgcm93SW5kZXggKyAnXCJdJywgJ2FnLXJvdy1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3Rpb25Db250cm9sbGVyO1xyXG4iLCJmdW5jdGlvbiBTZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkoKSB7fVxyXG5cclxuU2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oYW5ndWxhckdyaWQsIHNlbGVjdGlvbkNvbnRyb2xsZXIpIHtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZDtcclxuICAgIHRoaXMuc2VsZWN0aW9uQ29udHJvbGxlciA9IHNlbGVjdGlvbkNvbnRyb2xsZXI7XHJcbn07XHJcblxyXG5TZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZUNoZWNrYm94Q29sRGVmID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHdpZHRoOiAzMCxcclxuICAgICAgICBzdXBwcmVzc01lbnU6IHRydWUsXHJcbiAgICAgICAgc3VwcHJlc3NTb3J0aW5nOiB0cnVlLFxyXG4gICAgICAgIGhlYWRlckNlbGxSZW5kZXJlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBlQ2hlY2tib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgICAgICBlQ2hlY2tib3gudHlwZSA9ICdjaGVja2JveCc7XHJcbiAgICAgICAgICAgIGVDaGVja2JveC5uYW1lID0gJ25hbWUnO1xyXG4gICAgICAgICAgICByZXR1cm4gZUNoZWNrYm94O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2VsbFJlbmRlcmVyOiB0aGlzLmNyZWF0ZUNoZWNrYm94UmVuZGVyZXIoKVxyXG4gICAgfTtcclxufTtcclxuXHJcblNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlQ2hlY2tib3hSZW5kZXJlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgICAgIHJldHVybiB0aGF0LmNyZWF0ZVNlbGVjdGlvbkNoZWNrYm94KHBhcmFtcy5ub2RlLCBwYXJhbXMucm93SW5kZXgpO1xyXG4gICAgfTtcclxufTtcclxuXHJcblNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlU2VsZWN0aW9uQ2hlY2tib3ggPSBmdW5jdGlvbihub2RlLCByb3dJbmRleCkge1xyXG5cclxuICAgIHZhciBlQ2hlY2tib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgZUNoZWNrYm94LnR5cGUgPSBcImNoZWNrYm94XCI7XHJcbiAgICBlQ2hlY2tib3gubmFtZSA9IFwibmFtZVwiO1xyXG4gICAgZUNoZWNrYm94LmNsYXNzTmFtZSA9ICdhZy1zZWxlY3Rpb24tY2hlY2tib3gnO1xyXG4gICAgc2V0Q2hlY2tib3hTdGF0ZShlQ2hlY2tib3gsIHRoaXMuc2VsZWN0aW9uQ29udHJvbGxlci5pc05vZGVTZWxlY3RlZChub2RlKSk7XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgZUNoZWNrYm94Lm9uY2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgfTtcclxuXHJcbiAgICBlQ2hlY2tib3gub25jaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbmV3VmFsdWUgPSBlQ2hlY2tib3guY2hlY2tlZDtcclxuICAgICAgICBpZiAobmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLnNlbGVjdEluZGV4KHJvd0luZGV4LCB0cnVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuZGVzZWxlY3RJbmRleChyb3dJbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkLmFkZFZpcnR1YWxSb3dMaXN0ZW5lcihyb3dJbmRleCwge1xyXG4gICAgICAgIHJvd1NlbGVjdGVkOiBmdW5jdGlvbihzZWxlY3RlZCkge1xyXG4gICAgICAgICAgICBzZXRDaGVja2JveFN0YXRlKGVDaGVja2JveCwgc2VsZWN0ZWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcm93UmVtb3ZlZDogZnVuY3Rpb24oKSB7fVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGVDaGVja2JveDtcclxufTtcclxuXHJcbmZ1bmN0aW9uIHNldENoZWNrYm94U3RhdGUoZUNoZWNrYm94LCBzdGF0ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgZUNoZWNrYm94LmNoZWNrZWQgPSBzdGF0ZTtcclxuICAgICAgICBlQ2hlY2tib3guaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBpc05vZGVTZWxlY3RlZCByZXR1cm5zIGJhY2sgdW5kZWZpbmVkIGlmIGl0J3MgYSBncm91cCBhbmQgdGhlIGNoaWxkcmVuXHJcbiAgICAgICAgLy8gYXJlIGEgbWl4IG9mIHNlbGVjdGVkIGFuZCB1bnNlbGVjdGVkXHJcbiAgICAgICAgZUNoZWNrYm94LmluZGV0ZXJtaW5hdGUgPSB0cnVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeTtcclxuIiwidmFyIFNWR19OUyA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtcclxuXHJcbmZ1bmN0aW9uIFN2Z0ZhY3RvcnkoKSB7fVxyXG5cclxuU3ZnRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlRmlsdGVyU3ZnID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZVN2ZyA9IGNyZWF0ZUljb25TdmcoKTtcclxuXHJcbiAgICB2YXIgZUZ1bm5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsIFwicG9seWdvblwiKTtcclxuICAgIGVGdW5uZWwuc2V0QXR0cmlidXRlKFwicG9pbnRzXCIsIFwiMCwwIDQsNCA0LDEwIDYsMTAgNiw0IDEwLDBcIik7XHJcbiAgICBlRnVubmVsLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiYWctaGVhZGVyLWljb25cIik7XHJcbiAgICBlU3ZnLmFwcGVuZENoaWxkKGVGdW5uZWwpO1xyXG5cclxuICAgIHJldHVybiBlU3ZnO1xyXG59O1xyXG5cclxuU3ZnRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlTWVudVN2ZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGVTdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCBcInN2Z1wiKTtcclxuICAgIHZhciBzaXplID0gXCIxMlwiO1xyXG4gICAgZVN2Zy5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBzaXplKTtcclxuICAgIGVTdmcuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIHNpemUpO1xyXG5cclxuICAgIFtcIjBcIiwgXCI1XCIsIFwiMTBcIl0uZm9yRWFjaChmdW5jdGlvbih5KSB7XHJcbiAgICAgICAgdmFyIGVMaW5lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgXCJyZWN0XCIpO1xyXG4gICAgICAgIGVMaW5lLnNldEF0dHJpYnV0ZShcInlcIiwgeSk7XHJcbiAgICAgICAgZUxpbmUuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgc2l6ZSk7XHJcbiAgICAgICAgZUxpbmUuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIFwiMlwiKTtcclxuICAgICAgICBlTGluZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcImFnLWhlYWRlci1pY29uXCIpO1xyXG4gICAgICAgIGVTdmcuYXBwZW5kQ2hpbGQoZUxpbmUpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIGVTdmc7XHJcbn07XHJcblxyXG5TdmdGYWN0b3J5LnByb3RvdHlwZS5jcmVhdGVBcnJvd1VwU3ZnID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gY3JlYXRlUG9seWdvblN2ZyhcIjAsMTAgNSwwIDEwLDEwXCIpO1xyXG59O1xyXG5cclxuU3ZnRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlQXJyb3dMZWZ0U3ZnID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gY3JlYXRlUG9seWdvblN2ZyhcIjEwLDAgMCw1IDEwLDEwXCIpO1xyXG59O1xyXG5cclxuU3ZnRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlQXJyb3dEb3duU3ZnID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gY3JlYXRlUG9seWdvblN2ZyhcIjAsMCA1LDEwIDEwLDBcIik7XHJcbn07XHJcblxyXG5TdmdGYWN0b3J5LnByb3RvdHlwZS5jcmVhdGVBcnJvd1JpZ2h0U3ZnID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gY3JlYXRlUG9seWdvblN2ZyhcIjAsMCAxMCw1IDAsMTBcIik7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVQb2x5Z29uU3ZnKHBvaW50cykge1xyXG4gICAgdmFyIGVTdmcgPSBjcmVhdGVJY29uU3ZnKCk7XHJcblxyXG4gICAgdmFyIGVEZXNjSWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsIFwicG9seWdvblwiKTtcclxuICAgIGVEZXNjSWNvbi5zZXRBdHRyaWJ1dGUoXCJwb2ludHNcIiwgcG9pbnRzKTtcclxuICAgIGVTdmcuYXBwZW5kQ2hpbGQoZURlc2NJY29uKTtcclxuXHJcbiAgICByZXR1cm4gZVN2ZztcclxufVxyXG5cclxuLy8gdXRpbCBmdW5jdGlvbiBmb3IgdGhlIGFib3ZlXHJcbmZ1bmN0aW9uIGNyZWF0ZUljb25TdmcoKSB7XHJcbiAgICB2YXIgZVN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsIFwic3ZnXCIpO1xyXG4gICAgZVN2Zy5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBcIjEwXCIpO1xyXG4gICAgZVN2Zy5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgXCIxMFwiKTtcclxuICAgIHJldHVybiBlU3ZnO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFN2Z0ZhY3Rvcnk7XHJcbiIsInZhciB0ZW1wbGF0ZSA9IFtcclxuICAgICc8ZGl2IGNsYXNzPVwiYWctcm9vdCBhZy1zY3JvbGxzXCI+JyxcclxuICAgICcgICAgPCEtLSBUaGUgbG9hZGluZyBwYW5lbCAtLT4nLFxyXG4gICAgJyAgICA8IS0tIHdyYXBwaW5nIGluIG91dGVyIGRpdiwgYW5kIHdyYXBwZXIsIGlzIG5lZWRlZCB0byBjZW50ZXIgdGhlIGxvYWRpbmcgaWNvbiAtLT4nLFxyXG4gICAgJyAgICA8IS0tIFRoZSBpZGVhIGZvciBjZW50ZXJpbmcgY2FtZSBmcm9tIGhlcmU6IGh0dHA6Ly93d3cudmFuc2VvZGVzaWduLmNvbS9jc3MvdmVydGljYWwtY2VudGVyaW5nLyAtLT4nLFxyXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYWctbG9hZGluZy1wYW5lbFwiPicsXHJcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiYWctbG9hZGluZy13cmFwcGVyXCI+JyxcclxuICAgICcgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImFnLWxvYWRpbmctY2VudGVyXCI+TG9hZGluZy4uLjwvc3Bhbj4nLFxyXG4gICAgJyAgICAgICAgPC9kaXY+JyxcclxuICAgICcgICAgPC9kaXY+JyxcclxuICAgICcgICAgPCEtLSBoZWFkZXIgLS0+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLWhlYWRlclwiPicsXHJcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiYWctcGlubmVkLWhlYWRlclwiPjwvZGl2PjxkaXYgY2xhc3M9XCJhZy1oZWFkZXItdmlld3BvcnRcIj48ZGl2IGNsYXNzPVwiYWctaGVhZGVyLWNvbnRhaW5lclwiPjwvZGl2PjwvZGl2PicsXHJcbiAgICAnICAgIDwvZGl2PicsXHJcbiAgICAnICAgIDwhLS0gYm9keSAtLT4nLFxyXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYWctYm9keVwiPicsXHJcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwiYWctcGlubmVkLWNvbHMtdmlld3BvcnRcIj4nLFxyXG4gICAgJyAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZy1waW5uZWQtY29scy1jb250YWluZXJcIj48L2Rpdj4nLFxyXG4gICAgJyAgICAgICAgPC9kaXY+JyxcclxuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJhZy1ib2R5LXZpZXdwb3J0LXdyYXBwZXJcIj4nLFxyXG4gICAgJyAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZy1ib2R5LXZpZXdwb3J0XCI+JyxcclxuICAgICcgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFnLWJvZHktY29udGFpbmVyXCI+PC9kaXY+JyxcclxuICAgICcgICAgICAgICAgICA8L2Rpdj4nLFxyXG4gICAgJyAgICAgICAgPC9kaXY+JyxcclxuICAgICcgICAgPC9kaXY+JyxcclxuICAgICcgICAgPCEtLSBQYWdpbmcgLS0+JyxcclxuICAgICcgICAgPGRpdiBjbGFzcz1cImFnLXBhZ2luZy1wYW5lbFwiPicsXHJcbiAgICAnICAgIDwvZGl2PicsXHJcbiAgICAnICAgIDwvZGl2PidcclxuXS5qb2luKCcnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XHJcbiIsInZhciB0ZW1wbGF0ZSA9IFtcclxuICAgICc8ZGl2IGNsYXNzPVwiYWctcm9vdCBhZy1uby1zY3JvbGxzXCI+JyxcclxuICAgICcgICAgPCEtLSBTZWUgY29tbWVudCBpbiB0ZW1wbGF0ZS5odG1sIGZvciB3aHkgbG9hZGluZyBpcyBsYWlkIG91dCBsaWtlIHNvIC0tPicsXHJcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJhZy1sb2FkaW5nLXBhbmVsXCI+JyxcclxuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJhZy1sb2FkaW5nLXdyYXBwZXJcIj4nLFxyXG4gICAgJyAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYWctbG9hZGluZy1jZW50ZXJcIj5Mb2FkaW5nLi4uPC9zcGFuPicsXHJcbiAgICAnICAgICAgICA8L2Rpdj4nLFxyXG4gICAgJyAgICA8L2Rpdj4nLFxyXG4gICAgJyAgICA8IS0tIGhlYWRlciAtLT4nLFxyXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYWctaGVhZGVyLWNvbnRhaW5lclwiPjwvZGl2PicsXHJcbiAgICAnICAgIDwhLS0gYm9keSAtLT4nLFxyXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwiYWctYm9keS1jb250YWluZXJcIj48L2Rpdj4nLFxyXG4gICAgJzwvZGl2PidcclxuXS5qb2luKCcnKTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xyXG4iLCJcclxuZnVuY3Rpb24gVGVtcGxhdGVTZXJ2aWNlKCkge1xyXG4gICAgdGhpcy50ZW1wbGF0ZUNhY2hlID0ge307XHJcbiAgICB0aGlzLndhaXRpbmdDYWxsYmFja3MgPSB7fTtcclxufVxyXG5cclxuVGVtcGxhdGVTZXJ2aWNlLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCRzY29wZSkge1xyXG4gICAgdGhpcy4kc2NvcGUgPSAkc2NvcGU7XHJcbn07XHJcblxyXG4vLyByZXR1cm5zIHRoZSB0ZW1wbGF0ZSBpZiBpdCBpcyBsb2FkZWQsIG9yIG51bGwgaWYgaXQgaXMgbm90IGxvYWRlZFxyXG4vLyBidXQgd2lsbCBjYWxsIHRoZSBjYWxsYmFjayB3aGVuIGl0IGlzIGxvYWRlZFxyXG5UZW1wbGF0ZVNlcnZpY2UucHJvdG90eXBlLmdldFRlbXBsYXRlID0gZnVuY3Rpb24gKHVybCwgY2FsbGJhY2spIHtcclxuXHJcbiAgICB2YXIgdGVtcGxhdGVGcm9tQ2FjaGUgPSB0aGlzLnRlbXBsYXRlQ2FjaGVbdXJsXTtcclxuICAgIGlmICh0ZW1wbGF0ZUZyb21DYWNoZSkge1xyXG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZUZyb21DYWNoZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2FsbGJhY2tMaXN0ID0gdGhpcy53YWl0aW5nQ2FsbGJhY2tzW3VybF07XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBpZiAoIWNhbGxiYWNrTGlzdCkge1xyXG4gICAgICAgIC8vIGZpcnN0IHRpbWUgdGhpcyB3YXMgY2FsbGVkLCBzbyBuZWVkIGEgbmV3IGxpc3QgZm9yIGNhbGxiYWNrc1xyXG4gICAgICAgIGNhbGxiYWNrTGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMud2FpdGluZ0NhbGxiYWNrc1t1cmxdID0gY2FsbGJhY2tMaXN0O1xyXG4gICAgICAgIC8vIGFuZCBhbHNvIG5lZWQgdG8gZG8gdGhlIGh0dHAgcmVxdWVzdFxyXG4gICAgICAgIHZhciBjbGllbnQgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICBjbGllbnQub25sb2FkID0gZnVuY3Rpb24gKCkgeyB0aGF0LmhhbmRsZUh0dHBSZXN1bHQodGhpcywgdXJsKTsgfTtcclxuICAgICAgICBjbGllbnQub3BlbihcIkdFVFwiLCB1cmwpO1xyXG4gICAgICAgIGNsaWVudC5zZW5kKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWRkIHRoaXMgY2FsbGJhY2tcclxuICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgIGNhbGxiYWNrTGlzdC5wdXNoKGNhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjYWxsZXIgbmVlZHMgdG8gd2FpdCBmb3IgdGVtcGxhdGUgdG8gbG9hZCwgc28gcmV0dXJuIG51bGxcclxuICAgIHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuVGVtcGxhdGVTZXJ2aWNlLnByb3RvdHlwZS5oYW5kbGVIdHRwUmVzdWx0ID0gZnVuY3Rpb24gKGh0dHBSZXN1bHQsIHVybCkge1xyXG5cclxuICAgIGlmIChodHRwUmVzdWx0LnN0YXR1cyAhPT0gMjAwIHx8IGh0dHBSZXN1bHQucmVzcG9uc2UgPT09IG51bGwpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnVW5hYmxlIHRvIGdldCB0ZW1wbGF0ZSBlcnJvciAnICsgaHR0cFJlc3VsdC5zdGF0dXMgKyAnIC0gJyArIHVybCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlc3BvbnNlIHN1Y2Nlc3MsIHNvIHByb2Nlc3MgaXRcclxuICAgIHRoaXMudGVtcGxhdGVDYWNoZVt1cmxdID0gaHR0cFJlc3VsdC5yZXNwb25zZTtcclxuXHJcbiAgICAvLyBpbmZvcm0gYWxsIGxpc3RlbmVycyB0aGF0IHRoaXMgaXMgbm93IGluIHRoZSBjYWNoZVxyXG4gICAgdmFyIGNhbGxiYWNrcyA9IHRoaXMud2FpdGluZ0NhbGxiYWNrc1t1cmxdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgY2FsbGJhY2sgPSBjYWxsYmFja3NbaV07XHJcbiAgICAgICAgLy8gd2UgY291bGQgcGFzcyB0aGUgY2FsbGJhY2sgdGhlIHJlc3BvbnNlLCBob3dldmVyIHdlIGtub3cgdGhlIGNsaWVudCBvZiB0aGlzIGNvZGVcclxuICAgICAgICAvLyBpcyB0aGUgY2VsbCByZW5kZXJlciwgYW5kIGl0IHBhc3NlcyB0aGUgJ2NlbGxSZWZyZXNoJyBtZXRob2QgaW4gYXMgdGhlIGNhbGxiYWNrXHJcbiAgICAgICAgLy8gd2hpY2ggZG9lc24ndCB0YWtlIGFueSBwYXJhbWV0ZXJzLlxyXG4gICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuJHNjb3BlKSB7XHJcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH0sIDApO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUZW1wbGF0ZVNlcnZpY2U7XHJcbiIsImZ1bmN0aW9uIFV0aWxzKCkge31cclxuXHJcblV0aWxzLnByb3RvdHlwZS5pdGVyYXRlT2JqZWN0ID0gZnVuY3Rpb24ob2JqZWN0LCBjYWxsYmFjaykge1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGk8a2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IG9iamVjdFtrZXldO1xyXG4gICAgICAgIGNhbGxiYWNrKGtleSwgdmFsdWUpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLml0ZXJhdGVBcnJheSA9IGZ1bmN0aW9uKGFycmF5LCBjYWxsYmFjaykge1xyXG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleDxhcnJheS5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICB2YXIgdmFsdWUgPSBhcnJheVtpbmRleF07XHJcbiAgICAgICAgY2FsbGJhY2sodmFsdWUsIGluZGV4KTtcclxuICAgIH1cclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uKGV4cHJlc3Npb25TZXJ2aWNlLCBkYXRhLCBjb2xEZWYsIG5vZGUsIGFwaSwgY29udGV4dCkge1xyXG5cclxuICAgIHZhciB2YWx1ZUdldHRlciA9IGNvbERlZi52YWx1ZUdldHRlcjtcclxuICAgIHZhciBmaWVsZCA9IGNvbERlZi5maWVsZDtcclxuXHJcbiAgICAvLyBpZiB0aGVyZSBpcyBhIHZhbHVlIGdldHRlciwgdGhpcyBnZXRzIHByZWNlZGVuY2Ugb3ZlciBhIGZpZWxkXHJcbiAgICBpZiAodmFsdWVHZXR0ZXIpIHtcclxuXHJcbiAgICAgICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgICAgIGFwaTogYXBpLFxyXG4gICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZUdldHRlciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAvLyB2YWx1ZUdldHRlciBpcyBhIGZ1bmN0aW9uLCBzbyBqdXN0IGNhbGwgaXRcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlR2V0dGVyKHBhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWVHZXR0ZXIgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIC8vIHZhbHVlR2V0dGVyIGlzIGFuIGV4cHJlc3Npb24sIHNvIGV4ZWN1dGUgdGhlIGV4cHJlc3Npb25cclxuICAgICAgICAgICAgcmV0dXJuIGV4cHJlc3Npb25TZXJ2aWNlLmV2YWx1YXRlKHZhbHVlR2V0dGVyLCBwYXJhbXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9IGVsc2UgaWYgKGZpZWxkICYmIGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gZGF0YVtmaWVsZF07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vL1JldHVybnMgdHJ1ZSBpZiBpdCBpcyBhIERPTSBub2RlXHJcbi8vdGFrZW4gZnJvbTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zODQyODYvamF2YXNjcmlwdC1pc2RvbS1ob3ctZG8teW91LWNoZWNrLWlmLWEtamF2YXNjcmlwdC1vYmplY3QtaXMtYS1kb20tb2JqZWN0XHJcblV0aWxzLnByb3RvdHlwZS5pc05vZGUgPSBmdW5jdGlvbihvKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIHR5cGVvZiBOb2RlID09PSBcIm9iamVjdFwiID8gbyBpbnN0YW5jZW9mIE5vZGUgOlxyXG4gICAgICAgIG8gJiYgdHlwZW9mIG8gPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG8ubm9kZVR5cGUgPT09IFwibnVtYmVyXCIgJiYgdHlwZW9mIG8ubm9kZU5hbWUgPT09IFwic3RyaW5nXCJcclxuICAgICk7XHJcbn07XHJcblxyXG4vL1JldHVybnMgdHJ1ZSBpZiBpdCBpcyBhIERPTSBlbGVtZW50XHJcbi8vdGFrZW4gZnJvbTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zODQyODYvamF2YXNjcmlwdC1pc2RvbS1ob3ctZG8teW91LWNoZWNrLWlmLWEtamF2YXNjcmlwdC1vYmplY3QtaXMtYS1kb20tb2JqZWN0XHJcblV0aWxzLnByb3RvdHlwZS5pc0VsZW1lbnQgPSBmdW5jdGlvbihvKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIHR5cGVvZiBIVE1MRWxlbWVudCA9PT0gXCJvYmplY3RcIiA/IG8gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCA6IC8vRE9NMlxyXG4gICAgICAgIG8gJiYgdHlwZW9mIG8gPT09IFwib2JqZWN0XCIgJiYgbyAhPT0gbnVsbCAmJiBvLm5vZGVUeXBlID09PSAxICYmIHR5cGVvZiBvLm5vZGVOYW1lID09PSBcInN0cmluZ1wiXHJcbiAgICApO1xyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLmlzTm9kZU9yRWxlbWVudCA9IGZ1bmN0aW9uKG8pIHtcclxuICAgIHJldHVybiB0aGlzLmlzTm9kZShvKSB8fCB0aGlzLmlzRWxlbWVudChvKTtcclxufTtcclxuXHJcbi8vYWRkcyBhbGwgdHlwZSBvZiBjaGFuZ2UgbGlzdGVuZXJzIHRvIGFuIGVsZW1lbnQsIGludGVuZGVkIHRvIGJlIGEgdGV4dCBmaWVsZFxyXG5VdGlscy5wcm90b3R5cGUuYWRkQ2hhbmdlTGlzdGVuZXIgPSBmdW5jdGlvbihlbGVtZW50LCBsaXN0ZW5lcikge1xyXG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlZFwiLCBsaXN0ZW5lcik7XHJcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJwYXN0ZVwiLCBsaXN0ZW5lcik7XHJcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCBsaXN0ZW5lcik7XHJcbn07XHJcblxyXG4vL2lmIHZhbHVlIGlzIHVuZGVmaW5lZCwgbnVsbCBvciBibGFuaywgcmV0dXJucyBudWxsLCBvdGhlcndpc2UgcmV0dXJucyB0aGUgdmFsdWVcclxuVXRpbHMucHJvdG90eXBlLm1ha2VOdWxsID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBcIlwiKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5yZW1vdmVBbGxDaGlsZHJlbiA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIGlmIChub2RlKSB7XHJcbiAgICAgICAgd2hpbGUgKG5vZGUuaGFzQ2hpbGROb2RlcygpKSB7XHJcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQobm9kZS5sYXN0Q2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vYWRkcyBhbiBlbGVtZW50IHRvIGEgZGl2LCBidXQgYWxzbyBhZGRzIGEgYmFja2dyb3VuZCBjaGVja2luZyBmb3IgY2xpY2tzLFxyXG4vL3NvIHRoYXQgd2hlbiB0aGUgYmFja2dyb3VuZCBpcyBjbGlja2VkLCB0aGUgY2hpbGQgaXMgcmVtb3ZlZCBhZ2FpbiwgZ2l2aW5nXHJcbi8vYSBtb2RlbCBsb29rIHRvIHBvcHVwcy5cclxuVXRpbHMucHJvdG90eXBlLmFkZEFzTW9kYWxQb3B1cCA9IGZ1bmN0aW9uKGVQYXJlbnQsIGVDaGlsZCkge1xyXG4gICAgdmFyIGVCYWNrZHJvcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBlQmFja2Ryb3AuY2xhc3NOYW1lID0gXCJhZy1wb3B1cC1iYWNrZHJvcFwiO1xyXG5cclxuICAgIGVCYWNrZHJvcC5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZVBhcmVudC5yZW1vdmVDaGlsZChlQ2hpbGQpO1xyXG4gICAgICAgIGVQYXJlbnQucmVtb3ZlQ2hpbGQoZUJhY2tkcm9wKTtcclxuICAgIH07XHJcblxyXG4gICAgZVBhcmVudC5hcHBlbmRDaGlsZChlQmFja2Ryb3ApO1xyXG4gICAgZVBhcmVudC5hcHBlbmRDaGlsZChlQ2hpbGQpO1xyXG59O1xyXG5cclxuLy9sb2FkcyB0aGUgdGVtcGxhdGUgYW5kIHJldHVybnMgaXQgYXMgYW4gZWxlbWVudC4gbWFrZXMgdXAgZm9yIG5vIHNpbXBsZSB3YXkgaW5cclxuLy90aGUgZG9tIGFwaSB0byBsb2FkIGh0bWwgZGlyZWN0bHksIGVnIHdlIGNhbm5vdCBkbyB0aGlzOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRlbXBsYXRlKVxyXG5VdGlscy5wcm90b3R5cGUubG9hZFRlbXBsYXRlID0gZnVuY3Rpb24odGVtcGxhdGUpIHtcclxuICAgIHZhciB0ZW1wRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIHRlbXBEaXYuaW5uZXJIVE1MID0gdGVtcGxhdGU7XHJcbiAgICByZXR1cm4gdGVtcERpdi5maXJzdENoaWxkO1xyXG59O1xyXG5cclxuLy9pZiBwYXNzZWQgJzQycHgnIHRoZW4gcmV0dXJucyB0aGUgbnVtYmVyIDQyXHJcblV0aWxzLnByb3RvdHlwZS5waXhlbFN0cmluZ1RvTnVtYmVyID0gZnVuY3Rpb24odmFsKSB7XHJcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgIGlmICh2YWwuaW5kZXhPZihcInB4XCIpID49IDApIHtcclxuICAgICAgICAgICAgdmFsLnJlcGxhY2UoXCJweFwiLCBcIlwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHZhbCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB2YWw7XHJcbiAgICB9XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUucXVlcnlTZWxlY3RvckFsbF9hZGRDc3NDbGFzcyA9IGZ1bmN0aW9uKGVQYXJlbnQsIHNlbGVjdG9yLCBjc3NDbGFzcykge1xyXG4gICAgdmFyIGVSb3dzID0gZVBhcmVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcclxuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgZVJvd3MubGVuZ3RoOyBrKyspIHtcclxuICAgICAgICB0aGlzLmFkZENzc0NsYXNzKGVSb3dzW2tdLCBjc3NDbGFzcyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUucXVlcnlTZWxlY3RvckFsbF9yZW1vdmVDc3NDbGFzcyA9IGZ1bmN0aW9uKGVQYXJlbnQsIHNlbGVjdG9yLCBjc3NDbGFzcykge1xyXG4gICAgdmFyIGVSb3dzID0gZVBhcmVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcclxuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgZVJvd3MubGVuZ3RoOyBrKyspIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUNzc0NsYXNzKGVSb3dzW2tdLCBjc3NDbGFzcyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUucXVlcnlTZWxlY3RvckFsbF9yZXBsYWNlQ3NzQ2xhc3MgPSBmdW5jdGlvbihlUGFyZW50LCBzZWxlY3RvciwgY3NzQ2xhc3NUb1JlbW92ZSwgY3NzQ2xhc3NUb0FkZCkge1xyXG4gICAgdmFyIGVSb3dzID0gZVBhcmVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcclxuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgZVJvd3MubGVuZ3RoOyBrKyspIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUNzc0NsYXNzKGVSb3dzW2tdLCBjc3NDbGFzc1RvUmVtb3ZlKTtcclxuICAgICAgICB0aGlzLmFkZENzc0NsYXNzKGVSb3dzW2tdLCBjc3NDbGFzc1RvQWRkKTtcclxuICAgIH1cclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5hZGRDc3NDbGFzcyA9IGZ1bmN0aW9uKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xyXG4gICAgdmFyIG9sZENsYXNzZXMgPSBlbGVtZW50LmNsYXNzTmFtZTtcclxuICAgIGlmIChvbGRDbGFzc2VzKSB7XHJcbiAgICAgICAgaWYgKG9sZENsYXNzZXMuaW5kZXhPZihjbGFzc05hbWUpID49IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9IG9sZENsYXNzZXMgKyBcIiBcIiArIGNsYXNzTmFtZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUucmVtb3ZlQ3NzQ2xhc3MgPSBmdW5jdGlvbihlbGVtZW50LCBjbGFzc05hbWUpIHtcclxuICAgIHZhciBvbGRDbGFzc2VzID0gZWxlbWVudC5jbGFzc05hbWU7XHJcbiAgICBpZiAob2xkQ2xhc3Nlcy5pbmRleE9mKGNsYXNzTmFtZSkgPCAwKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIG5ld0NsYXNzZXMgPSBvbGRDbGFzc2VzLnJlcGxhY2UoXCIgXCIgKyBjbGFzc05hbWUsIFwiXCIpO1xyXG4gICAgbmV3Q2xhc3NlcyA9IG5ld0NsYXNzZXMucmVwbGFjZShjbGFzc05hbWUgKyBcIiBcIiwgXCJcIik7XHJcbiAgICBpZiAobmV3Q2xhc3NlcyA9PSBjbGFzc05hbWUpIHtcclxuICAgICAgICBuZXdDbGFzc2VzID0gXCJcIjtcclxuICAgIH1cclxuICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gbmV3Q2xhc3NlcztcclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5yZW1vdmVGcm9tQXJyYXkgPSBmdW5jdGlvbihhcnJheSwgb2JqZWN0KSB7XHJcbiAgICBhcnJheS5zcGxpY2UoYXJyYXkuaW5kZXhPZihvYmplY3QpLCAxKTtcclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5kZWZhdWx0Q29tcGFyYXRvciA9IGZ1bmN0aW9uKHZhbHVlQSwgdmFsdWVCKSB7XHJcbiAgICB2YXIgdmFsdWVBTWlzc2luZyA9IHZhbHVlQSA9PT0gbnVsbCB8fCB2YWx1ZUEgPT09IHVuZGVmaW5lZDtcclxuICAgIHZhciB2YWx1ZUJNaXNzaW5nID0gdmFsdWVCID09PSBudWxsIHx8IHZhbHVlQiA9PT0gdW5kZWZpbmVkO1xyXG4gICAgaWYgKHZhbHVlQU1pc3NpbmcgJiYgdmFsdWVCTWlzc2luZykge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgaWYgKHZhbHVlQU1pc3NpbmcpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcbiAgICBpZiAodmFsdWVCTWlzc2luZykge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh2YWx1ZUEgPCB2YWx1ZUIpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlQSA+IHZhbHVlQikge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5mb3JtYXRXaWR0aCA9IGZ1bmN0aW9uKHdpZHRoKSB7XHJcbiAgICBpZiAodHlwZW9mIHdpZHRoID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgcmV0dXJuIHdpZHRoICsgXCJweFwiO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gd2lkdGg7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyB0cmllcyB0byB1c2UgdGhlIHByb3ZpZGVkIHJlbmRlcmVyLiBpZiBhIHJlbmRlcmVyIGZvdW5kLCByZXR1cm5zIHRydWUuXHJcbi8vIGlmIG5vIHJlbmRlcmVyLCByZXR1cm5zIGZhbHNlLlxyXG5VdGlscy5wcm90b3R5cGUudXNlUmVuZGVyZXIgPSBmdW5jdGlvbihlUGFyZW50LCBlUmVuZGVyZXIsIHBhcmFtcykge1xyXG4gICAgdmFyIHJlc3VsdEZyb21SZW5kZXJlciA9IGVSZW5kZXJlcihwYXJhbXMpO1xyXG4gICAgaWYgKHRoaXMuaXNOb2RlKHJlc3VsdEZyb21SZW5kZXJlcikgfHwgdGhpcy5pc0VsZW1lbnQocmVzdWx0RnJvbVJlbmRlcmVyKSkge1xyXG4gICAgICAgIC8vYSBkb20gbm9kZSBvciBlbGVtZW50IHdhcyByZXR1cm5lZCwgc28gYWRkIGNoaWxkXHJcbiAgICAgICAgZVBhcmVudC5hcHBlbmRDaGlsZChyZXN1bHRGcm9tUmVuZGVyZXIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvL290aGVyd2lzZSBhc3N1bWUgaXQgd2FzIGh0bWwsIHNvIGp1c3QgaW5zZXJ0XHJcbiAgICAgICAgdmFyIGVUZXh0U3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICBlVGV4dFNwYW4uaW5uZXJIVE1MID0gcmVzdWx0RnJvbVJlbmRlcmVyO1xyXG4gICAgICAgIGVQYXJlbnQuYXBwZW5kQ2hpbGQoZVRleHRTcGFuKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8vIGlmIGljb24gcHJvdmlkZWQsIHVzZSB0aGlzIChlaXRoZXIgYSBzdHJpbmcsIG9yIGEgZnVuY3Rpb24gY2FsbGJhY2spLlxyXG4vLyBpZiBub3QsIHRoZW4gdXNlIHRoZSBzZWNvbmQgcGFyYW1ldGVyLCB3aGljaCBpcyB0aGUgc3ZnRmFjdG9yeSBmdW5jdGlvblxyXG5VdGlscy5wcm90b3R5cGUuY3JlYXRlSWNvbiA9IGZ1bmN0aW9uKGljb25OYW1lLCBncmlkT3B0aW9uc1dyYXBwZXIsIGNvbERlZldyYXBwZXIsIHN2Z0ZhY3RvcnlGdW5jKSB7XHJcbiAgICB2YXIgZVJlc3VsdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgIHZhciB1c2VyUHJvdmlkZWRJY29uO1xyXG4gICAgLy8gY2hlY2sgY29sIGZvciBpY29uIGZpcnN0XHJcbiAgICBpZiAoY29sRGVmV3JhcHBlciAmJiBjb2xEZWZXcmFwcGVyLmNvbERlZi5pY29ucykge1xyXG4gICAgICAgIHVzZXJQcm92aWRlZEljb24gPSBjb2xEZWZXcmFwcGVyLmNvbERlZi5pY29uc1tpY29uTmFtZV07XHJcbiAgICB9XHJcbiAgICAvLyBpdCBub3QgaW4gY29sLCB0cnkgZ3JpZCBvcHRpb25zXHJcbiAgICBpZiAoIXVzZXJQcm92aWRlZEljb24gJiYgZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEljb25zKCkpIHtcclxuICAgICAgICB1c2VyUHJvdmlkZWRJY29uID0gZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEljb25zKClbaWNvbk5hbWVdO1xyXG4gICAgfVxyXG4gICAgLy8gbm93IGlmIHVzZXIgcHJvdmlkZWQsIHVzZSBpdFxyXG4gICAgaWYgKHVzZXJQcm92aWRlZEljb24pIHtcclxuICAgICAgICB2YXIgcmVuZGVyZXJSZXN1bHQ7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB1c2VyUHJvdmlkZWRJY29uID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHJlbmRlcmVyUmVzdWx0ID0gdXNlclByb3ZpZGVkSWNvbigpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHVzZXJQcm92aWRlZEljb24gPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHJlbmRlcmVyUmVzdWx0ID0gdXNlclByb3ZpZGVkSWNvbjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyAnaWNvbiBmcm9tIGdyaWQgb3B0aW9ucyBuZWVkcyB0byBiZSBhIHN0cmluZyBvciBhIGZ1bmN0aW9uJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiByZW5kZXJlclJlc3VsdCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgZVJlc3VsdC5pbm5lckhUTUwgPSByZW5kZXJlclJlc3VsdDtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNOb2RlT3JFbGVtZW50KHJlbmRlcmVyUmVzdWx0KSkge1xyXG4gICAgICAgICAgICBlUmVzdWx0LmFwcGVuZENoaWxkKHJlbmRlcmVyUmVzdWx0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyAnaWNvblJlbmRlcmVyIHNob3VsZCByZXR1cm4gYmFjayBhIHN0cmluZyBvciBhIGRvbSBvYmplY3QnO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlIHdlIHVzZSB0aGUgYnVpbHQgaW4gaWNvblxyXG4gICAgICAgIGVSZXN1bHQuYXBwZW5kQ2hpbGQoc3ZnRmFjdG9yeUZ1bmMoKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZVJlc3VsdDtcclxufTtcclxuXHJcblxyXG5VdGlscy5wcm90b3R5cGUuZ2V0U2Nyb2xsYmFyV2lkdGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgb3V0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgb3V0ZXIuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XHJcbiAgICBvdXRlci5zdHlsZS53aWR0aCA9IFwiMTAwcHhcIjtcclxuICAgIG91dGVyLnN0eWxlLm1zT3ZlcmZsb3dTdHlsZSA9IFwic2Nyb2xsYmFyXCI7IC8vIG5lZWRlZCBmb3IgV2luSlMgYXBwc1xyXG5cclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3V0ZXIpO1xyXG5cclxuICAgIHZhciB3aWR0aE5vU2Nyb2xsID0gb3V0ZXIub2Zmc2V0V2lkdGg7XHJcbiAgICAvLyBmb3JjZSBzY3JvbGxiYXJzXHJcbiAgICBvdXRlci5zdHlsZS5vdmVyZmxvdyA9IFwic2Nyb2xsXCI7XHJcblxyXG4gICAgLy8gYWRkIGlubmVyZGl2XHJcbiAgICB2YXIgaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgaW5uZXIuc3R5bGUud2lkdGggPSBcIjEwMCVcIjtcclxuICAgIG91dGVyLmFwcGVuZENoaWxkKGlubmVyKTtcclxuXHJcbiAgICB2YXIgd2lkdGhXaXRoU2Nyb2xsID0gaW5uZXIub2Zmc2V0V2lkdGg7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGRpdnNcclxuICAgIG91dGVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob3V0ZXIpO1xyXG5cclxuICAgIHJldHVybiB3aWR0aE5vU2Nyb2xsIC0gd2lkdGhXaXRoU2Nyb2xsO1xyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLmlzS2V5UHJlc3NlZCA9IGZ1bmN0aW9uKGV2ZW50LCBrZXlUb0NoZWNrKSB7XHJcbiAgICB2YXIgcHJlc3NlZEtleSA9IGV2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGU7XHJcbiAgICByZXR1cm4gcHJlc3NlZEtleSA9PT0ga2V5VG9DaGVjaztcclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5zZXRWaXNpYmxlID0gZnVuY3Rpb24oZWxlbWVudCwgdmlzaWJsZSkge1xyXG4gICAgaWYgKHZpc2libGUpIHtcclxuICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVXRpbHMoKTtcclxuIiwiLypcclxuICogVGhpcyByb3cgY29udHJvbGxlciBpcyB1c2VkIGZvciBpbmZpbml0ZSBzY3JvbGxpbmcgb25seS4gRm9yIG5vcm1hbCAnaW4gbWVtb3J5JyB0YWJsZSxcclxuICogb3Igc3RhbmRhcmQgcGFnaW5hdGlvbiwgdGhlIGluTWVtb3J5Um93Q29udHJvbGxlciBpcyB1c2VkLlxyXG4gKi9cclxuXHJcbnZhciBsb2dnaW5nID0gdHJ1ZTtcclxuXHJcbmZ1bmN0aW9uIFZpcnR1YWxQYWdlUm93Q29udHJvbGxlcigpIHt9XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihyb3dSZW5kZXJlcikge1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlciA9IHJvd1JlbmRlcmVyO1xyXG4gICAgdGhpcy5kYXRhc291cmNlVmVyc2lvbiA9IDA7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnNldERhdGFzb3VyY2UgPSBmdW5jdGlvbihkYXRhc291cmNlKSB7XHJcbiAgICB0aGlzLmRhdGFzb3VyY2UgPSBkYXRhc291cmNlO1xyXG5cclxuICAgIGlmICghZGF0YXNvdXJjZSkge1xyXG4gICAgICAgIC8vIG9ubHkgY29udGludWUgaWYgd2UgaGF2ZSBhIHZhbGlkIGRhdGFzb3VyY2UgdG8gd29ya2luZyB3aXRoXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmVzZXQoKTtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIHNlZSBpZiBkYXRhc291cmNlIGtub3dzIGhvdyBtYW55IHJvd3MgdGhlcmUgYXJlXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZGF0YXNvdXJjZS5yb3dDb3VudCA9PT0gJ251bWJlcicgJiYgdGhpcy5kYXRhc291cmNlLnJvd0NvdW50ID49IDApIHtcclxuICAgICAgICB0aGlzLnZpcnR1YWxSb3dDb3VudCA9IHRoaXMuZGF0YXNvdXJjZS5yb3dDb3VudDtcclxuICAgICAgICB0aGlzLmZvdW5kTWF4Um93ID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy52aXJ0dWFsUm93Q291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuZm91bmRNYXhSb3cgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpbiBjYXNlIGFueSBkYWVtb24gcmVxdWVzdHMgY29taW5nIGZyb20gZGF0YXNvdXJjZSwgd2Uga25vdyBpdCBpZ25vcmUgdGhlbVxyXG4gICAgdGhpcy5kYXRhc291cmNlVmVyc2lvbisrO1xyXG5cclxuICAgIC8vIG1hcCBvZiBwYWdlIG51bWJlcnMgdG8gcm93cyBpbiB0aGF0IHBhZ2VcclxuICAgIHRoaXMucGFnZUNhY2hlID0ge307XHJcbiAgICB0aGlzLnBhZ2VDYWNoZVNpemUgPSAwO1xyXG5cclxuICAgIC8vIGlmIGEgbnVtYmVyIGlzIGluIHRoaXMgYXJyYXksIGl0IG1lYW5zIHdlIGFyZSBwZW5kaW5nIGEgbG9hZCBmcm9tIGl0XHJcbiAgICB0aGlzLnBhZ2VMb2Fkc0luUHJvZ3Jlc3MgPSBbXTtcclxuICAgIHRoaXMucGFnZUxvYWRzUXVldWVkID0gW107XHJcbiAgICB0aGlzLnBhZ2VBY2Nlc3NUaW1lcyA9IHt9OyAvLyBrZWVwcyBhIHJlY29yZCBvZiB3aGVuIGVhY2ggcGFnZSB3YXMgbGFzdCB2aWV3ZWQsIHVzZWQgZm9yIExSVSBjYWNoZVxyXG4gICAgdGhpcy5hY2Nlc3NUaW1lID0gMDsgLy8gcmF0aGVyIHRoYW4gdXNpbmcgdGhlIGNsb2NrLCB3ZSB1c2UgdGhpcyBjb3VudGVyXHJcblxyXG4gICAgLy8gdGhlIG51bWJlciBvZiBjb25jdXJyZW50IGxvYWRzIHdlIGFyZSBhbGxvd2VkIHRvIHRoZSBzZXJ2ZXJcclxuICAgIGlmICh0eXBlb2YgdGhpcy5kYXRhc291cmNlLm1heENvbmN1cnJlbnRSZXF1ZXN0cyA9PT0gJ251bWJlcicgJiYgdGhpcy5kYXRhc291cmNlLm1heENvbmN1cnJlbnRSZXF1ZXN0cyA+IDApIHtcclxuICAgICAgICB0aGlzLm1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHMgPSB0aGlzLmRhdGFzb3VyY2UubWF4Q29uY3VycmVudFJlcXVlc3RzO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHMgPSAyO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoZSBudW1iZXIgb2YgcGFnZXMgdG8ga2VlcCBpbiBicm93c2VyIGNhY2hlXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZGF0YXNvdXJjZS5tYXhQYWdlc0luQ2FjaGUgPT09ICdudW1iZXInICYmIHRoaXMuZGF0YXNvdXJjZS5tYXhQYWdlc0luQ2FjaGUgPiAwKSB7XHJcbiAgICAgICAgdGhpcy5tYXhQYWdlc0luQ2FjaGUgPSB0aGlzLmRhdGFzb3VyY2UubWF4UGFnZXNJbkNhY2hlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBudWxsIGlzIGRlZmF1bHQsIG1lYW5zIGRvbid0ICBoYXZlIGFueSBtYXggc2l6ZSBvbiB0aGUgY2FjaGVcclxuICAgICAgICB0aGlzLm1heFBhZ2VzSW5DYWNoZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5wYWdlU2l6ZSA9IHRoaXMuZGF0YXNvdXJjZS5wYWdlU2l6ZTsgLy8gdGFrZSBhIGNvcHkgb2YgcGFnZSBzaXplLCB3ZSBkb24ndCB3YW50IGl0IGNoYW5naW5nXHJcbiAgICB0aGlzLm92ZXJmbG93U2l6ZSA9IHRoaXMuZGF0YXNvdXJjZS5vdmVyZmxvd1NpemU7IC8vIHRha2UgYSBjb3B5IG9mIHBhZ2Ugc2l6ZSwgd2UgZG9uJ3Qgd2FudCBpdCBjaGFuZ2luZ1xyXG5cclxuICAgIHRoaXMuZG9Mb2FkT3JRdWV1ZSgwKTtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUuY3JlYXRlTm9kZXNGcm9tUm93cyA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIsIHJvd3MpIHtcclxuICAgIHZhciBub2RlcyA9IFtdO1xyXG4gICAgaWYgKHJvd3MpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IHJvd3MubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB2aXJ0dWFsUm93SW5kZXggPSAocGFnZU51bWJlciAqIHRoaXMucGFnZVNpemUpICsgaTtcclxuICAgICAgICAgICAgbm9kZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBkYXRhOiByb3dzW2ldLFxyXG4gICAgICAgICAgICAgICAgaWQ6IHZpcnR1YWxSb3dJbmRleFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbm9kZXM7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnJlbW92ZUZyb21Mb2FkaW5nID0gZnVuY3Rpb24ocGFnZU51bWJlcikge1xyXG4gICAgdmFyIGluZGV4ID0gdGhpcy5wYWdlTG9hZHNJblByb2dyZXNzLmluZGV4T2YocGFnZU51bWJlcik7XHJcbiAgICB0aGlzLnBhZ2VMb2Fkc0luUHJvZ3Jlc3Muc3BsaWNlKGluZGV4LCAxKTtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUucGFnZUxvYWRGYWlsZWQgPSBmdW5jdGlvbihwYWdlTnVtYmVyKSB7XHJcbiAgICB0aGlzLnJlbW92ZUZyb21Mb2FkaW5nKHBhZ2VOdW1iZXIpO1xyXG4gICAgdGhpcy5jaGVja1F1ZXVlRm9yTmV4dExvYWQoKTtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUucGFnZUxvYWRlZCA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIsIHJvd3MsIGxhc3RSb3cpIHtcclxuICAgIHRoaXMucHV0UGFnZUludG9DYWNoZUFuZFB1cmdlKHBhZ2VOdW1iZXIsIHJvd3MpO1xyXG4gICAgdGhpcy5jaGVja01heFJvd0FuZEluZm9ybVJvd1JlbmRlcmVyKHBhZ2VOdW1iZXIsIGxhc3RSb3cpO1xyXG4gICAgdGhpcy5yZW1vdmVGcm9tTG9hZGluZyhwYWdlTnVtYmVyKTtcclxuICAgIHRoaXMuY2hlY2tRdWV1ZUZvck5leHRMb2FkKCk7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnB1dFBhZ2VJbnRvQ2FjaGVBbmRQdXJnZSA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIsIHJvd3MpIHtcclxuICAgIHRoaXMucGFnZUNhY2hlW3BhZ2VOdW1iZXJdID0gdGhpcy5jcmVhdGVOb2Rlc0Zyb21Sb3dzKHBhZ2VOdW1iZXIsIHJvd3MpO1xyXG4gICAgdGhpcy5wYWdlQ2FjaGVTaXplKys7XHJcbiAgICBpZiAobG9nZ2luZykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdhZGRpbmcgcGFnZSAnICsgcGFnZU51bWJlcik7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG5lZWRUb1B1cmdlID0gdGhpcy5tYXhQYWdlc0luQ2FjaGUgJiYgdGhpcy5tYXhQYWdlc0luQ2FjaGUgPCB0aGlzLnBhZ2VDYWNoZVNpemU7XHJcbiAgICBpZiAobmVlZFRvUHVyZ2UpIHtcclxuICAgICAgICAvLyBmaW5kIHRoZSBMUlUgcGFnZVxyXG4gICAgICAgIHZhciB5b3VuZ2VzdFBhZ2VJbmRleCA9IHRoaXMuZmluZExlYXN0UmVjZW50bHlBY2Nlc3NlZFBhZ2UoT2JqZWN0LmtleXModGhpcy5wYWdlQ2FjaGUpKTtcclxuXHJcbiAgICAgICAgaWYgKGxvZ2dpbmcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3B1cmdpbmcgcGFnZSAnICsgeW91bmdlc3RQYWdlSW5kZXggKyAnIGZyb20gY2FjaGUgJyArIE9iamVjdC5rZXlzKHRoaXMucGFnZUNhY2hlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnBhZ2VDYWNoZVt5b3VuZ2VzdFBhZ2VJbmRleF07XHJcbiAgICAgICAgdGhpcy5wYWdlQ2FjaGVTaXplLS07XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5jaGVja01heFJvd0FuZEluZm9ybVJvd1JlbmRlcmVyID0gZnVuY3Rpb24ocGFnZU51bWJlciwgbGFzdFJvdykge1xyXG4gICAgaWYgKCF0aGlzLmZvdW5kTWF4Um93KSB7XHJcbiAgICAgICAgLy8gaWYgd2Uga25vdyB0aGUgbGFzdCByb3csIHVzZSBpZlxyXG4gICAgICAgIGlmICh0eXBlb2YgbGFzdFJvdyA9PT0gJ251bWJlcicgJiYgbGFzdFJvdyA+PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlydHVhbFJvd0NvdW50ID0gbGFzdFJvdztcclxuICAgICAgICAgICAgdGhpcy5mb3VuZE1heFJvdyA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBzZWUgaWYgd2UgbmVlZCB0byBhZGQgc29tZSB2aXJ0dWFsIHJvd3NcclxuICAgICAgICAgICAgdmFyIHRoaXNQYWdlUGx1c0J1ZmZlciA9ICgocGFnZU51bWJlciArIDEpICogdGhpcy5wYWdlU2l6ZSkgKyB0aGlzLm92ZXJmbG93U2l6ZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMudmlydHVhbFJvd0NvdW50IDwgdGhpc1BhZ2VQbHVzQnVmZmVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZpcnR1YWxSb3dDb3VudCA9IHRoaXNQYWdlUGx1c0J1ZmZlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpZiByb3dDb3VudCBjaGFuZ2VzLCByZWZyZXNoVmlldywgb3RoZXJ3aXNlIGp1c3QgcmVmcmVzaEFsbFZpcnR1YWxSb3dzXHJcbiAgICAgICAgdGhpcy5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnJvd1JlbmRlcmVyLnJlZnJlc2hBbGxWaXJ0dWFsUm93cygpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5pc1BhZ2VBbHJlYWR5TG9hZGluZyA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpIHtcclxuICAgIHZhciByZXN1bHQgPSB0aGlzLnBhZ2VMb2Fkc0luUHJvZ3Jlc3MuaW5kZXhPZihwYWdlTnVtYmVyKSA+PSAwIHx8IHRoaXMucGFnZUxvYWRzUXVldWVkLmluZGV4T2YocGFnZU51bWJlcikgPj0gMDtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmRvTG9hZE9yUXVldWUgPSBmdW5jdGlvbihwYWdlTnVtYmVyKSB7XHJcbiAgICAvLyBpZiB3ZSBhbHJlYWR5IHRyaWVkIHRvIGxvYWQgdGhpcyBwYWdlLCB0aGVuIGlnbm9yZSB0aGUgcmVxdWVzdCxcclxuICAgIC8vIG90aGVyd2lzZSBzZXJ2ZXIgd291bGQgYmUgaGl0IDUwIHRpbWVzIGp1c3QgdG8gZGlzcGxheSBvbmUgcGFnZSwgdGhlXHJcbiAgICAvLyBmaXJzdCByb3cgdG8gZmluZCB0aGUgcGFnZSBtaXNzaW5nIGlzIGVub3VnaC5cclxuICAgIGlmICh0aGlzLmlzUGFnZUFscmVhZHlMb2FkaW5nKHBhZ2VOdW1iZXIpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRyeSB0aGUgcGFnZSBsb2FkIC0gaWYgbm90IGFscmVhZHkgZG9pbmcgYSBsb2FkLCB0aGVuIHdlIGNhbiBnbyBhaGVhZFxyXG4gICAgaWYgKHRoaXMucGFnZUxvYWRzSW5Qcm9ncmVzcy5sZW5ndGggPCB0aGlzLm1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHMpIHtcclxuICAgICAgICAvLyBnbyBhaGVhZCwgbG9hZCB0aGUgcGFnZVxyXG4gICAgICAgIHRoaXMubG9hZFBhZ2UocGFnZU51bWJlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIG90aGVyd2lzZSwgcXVldWUgdGhlIHJlcXVlc3RcclxuICAgICAgICB0aGlzLmFkZFRvUXVldWVBbmRQdXJnZVF1ZXVlKHBhZ2VOdW1iZXIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5hZGRUb1F1ZXVlQW5kUHVyZ2VRdWV1ZSA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpIHtcclxuICAgIGlmIChsb2dnaW5nKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3F1ZXVlaW5nICcgKyBwYWdlTnVtYmVyICsgJyAtICcgKyB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5wdXNoKHBhZ2VOdW1iZXIpO1xyXG5cclxuICAgIC8vIHNlZSBpZiB0aGVyZSBhcmUgbW9yZSBwYWdlcyBxdWV1ZWQgdGhhdCBhcmUgYWN0dWFsbHkgaW4gb3VyIGNhY2hlLCBpZiBzbyB0aGVyZSBpc1xyXG4gICAgLy8gbm8gcG9pbnQgaW4gbG9hZGluZyB0aGVtIGFsbCBhcyBzb21lIHdpbGwgYmUgcHVyZ2VkIGFzIHNvb24gYXMgbG9hZGVkXHJcbiAgICB2YXIgbmVlZFRvUHVyZ2UgPSB0aGlzLm1heFBhZ2VzSW5DYWNoZSAmJiB0aGlzLm1heFBhZ2VzSW5DYWNoZSA8IHRoaXMucGFnZUxvYWRzUXVldWVkLmxlbmd0aDtcclxuICAgIGlmIChuZWVkVG9QdXJnZSkge1xyXG4gICAgICAgIC8vIGZpbmQgdGhlIExSVSBwYWdlXHJcbiAgICAgICAgdmFyIHlvdW5nZXN0UGFnZUluZGV4ID0gdGhpcy5maW5kTGVhc3RSZWNlbnRseUFjY2Vzc2VkUGFnZSh0aGlzLnBhZ2VMb2Fkc1F1ZXVlZCk7XHJcblxyXG4gICAgICAgIGlmIChsb2dnaW5nKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZS1xdWV1ZWluZyAnICsgcGFnZU51bWJlciArICcgLSAnICsgdGhpcy5wYWdlTG9hZHNRdWV1ZWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGluZGV4VG9SZW1vdmUgPSB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5pbmRleE9mKHlvdW5nZXN0UGFnZUluZGV4KTtcclxuICAgICAgICB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5zcGxpY2UoaW5kZXhUb1JlbW92ZSwgMSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmZpbmRMZWFzdFJlY2VudGx5QWNjZXNzZWRQYWdlID0gZnVuY3Rpb24ocGFnZUluZGV4ZXMpIHtcclxuICAgIHZhciB5b3VuZ2VzdFBhZ2VJbmRleCA9IC0xO1xyXG4gICAgdmFyIHlvdW5nZXN0UGFnZUFjY2Vzc1RpbWUgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIHBhZ2VJbmRleGVzLmZvckVhY2goZnVuY3Rpb24ocGFnZUluZGV4KSB7XHJcbiAgICAgICAgdmFyIGFjY2Vzc1RpbWVUaGlzUGFnZSA9IHRoYXQucGFnZUFjY2Vzc1RpbWVzW3BhZ2VJbmRleF07XHJcbiAgICAgICAgaWYgKGFjY2Vzc1RpbWVUaGlzUGFnZSA8IHlvdW5nZXN0UGFnZUFjY2Vzc1RpbWUpIHtcclxuICAgICAgICAgICAgeW91bmdlc3RQYWdlQWNjZXNzVGltZSA9IGFjY2Vzc1RpbWVUaGlzUGFnZTtcclxuICAgICAgICAgICAgeW91bmdlc3RQYWdlSW5kZXggPSBwYWdlSW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHlvdW5nZXN0UGFnZUluZGV4O1xyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5jaGVja1F1ZXVlRm9yTmV4dExvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgLy8gdGFrZSBmcm9tIHRoZSBmcm9udCBvZiB0aGUgcXVldWVcclxuICAgICAgICB2YXIgcGFnZVRvTG9hZCA9IHRoaXMucGFnZUxvYWRzUXVldWVkWzBdO1xyXG4gICAgICAgIHRoaXMucGFnZUxvYWRzUXVldWVkLnNwbGljZSgwLCAxKTtcclxuXHJcbiAgICAgICAgaWYgKGxvZ2dpbmcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2RlcXVldWVpbmcgJyArIHBhZ2VUb0xvYWQgKyAnIC0gJyArIHRoaXMucGFnZUxvYWRzUXVldWVkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubG9hZFBhZ2UocGFnZVRvTG9hZCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmxvYWRQYWdlID0gZnVuY3Rpb24ocGFnZU51bWJlcikge1xyXG5cclxuICAgIHRoaXMucGFnZUxvYWRzSW5Qcm9ncmVzcy5wdXNoKHBhZ2VOdW1iZXIpO1xyXG5cclxuICAgIHZhciBzdGFydFJvdyA9IHBhZ2VOdW1iZXIgKiB0aGlzLnBhZ2VTaXplO1xyXG4gICAgdmFyIGVuZFJvdyA9IChwYWdlTnVtYmVyICsgMSkgKiB0aGlzLnBhZ2VTaXplO1xyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHZhciBkYXRhc291cmNlVmVyc2lvbkNvcHkgPSB0aGlzLmRhdGFzb3VyY2VWZXJzaW9uO1xyXG5cclxuICAgIHRoaXMuZGF0YXNvdXJjZS5nZXRSb3dzKHN0YXJ0Um93LCBlbmRSb3csXHJcbiAgICAgICAgZnVuY3Rpb24gc3VjY2Vzcyhyb3dzLCBsYXN0Um93KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGF0LnJlcXVlc3RJc0RhZW1vbihkYXRhc291cmNlVmVyc2lvbkNvcHkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhhdC5wYWdlTG9hZGVkKHBhZ2VOdW1iZXIsIHJvd3MsIGxhc3RSb3cpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb24gZmFpbCgpIHtcclxuICAgICAgICAgICAgaWYgKHRoYXQucmVxdWVzdElzRGFlbW9uKGRhdGFzb3VyY2VWZXJzaW9uQ29weSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGF0LnBhZ2VMb2FkRmFpbGVkKHBhZ2VOdW1iZXIpO1xyXG4gICAgICAgIH1cclxuICAgICk7XHJcbn07XHJcblxyXG4vLyBjaGVjayB0aGF0IHRoZSBkYXRhc291cmNlIGhhcyBub3QgY2hhbmdlZCBzaW5jZSB0aGUgbGF0cyB0aW1lIHdlIGRpZCBhIHJlcXVlc3RcclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5yZXF1ZXN0SXNEYWVtb24gPSBmdW5jdGlvbihkYXRhc291cmNlVmVyc2lvbkNvcHkpIHtcclxuICAgIHJldHVybiB0aGlzLmRhdGFzb3VyY2VWZXJzaW9uICE9PSBkYXRhc291cmNlVmVyc2lvbkNvcHk7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmdldFZpcnR1YWxSb3cgPSBmdW5jdGlvbihyb3dJbmRleCkge1xyXG4gICAgaWYgKHJvd0luZGV4ID4gdGhpcy52aXJ0dWFsUm93Q291bnQpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcGFnZU51bWJlciA9IE1hdGguZmxvb3Iocm93SW5kZXggLyB0aGlzLnBhZ2VTaXplKTtcclxuICAgIHZhciBwYWdlID0gdGhpcy5wYWdlQ2FjaGVbcGFnZU51bWJlcl07XHJcblxyXG4gICAgLy8gZm9yIExSVSBjYWNoZSwgdHJhY2sgd2hlbiB0aGlzIHBhZ2Ugd2FzIGxhc3QgaGl0XHJcbiAgICB0aGlzLnBhZ2VBY2Nlc3NUaW1lc1twYWdlTnVtYmVyXSA9IHRoaXMuYWNjZXNzVGltZSsrO1xyXG5cclxuICAgIGlmICghcGFnZSkge1xyXG4gICAgICAgIHRoaXMuZG9Mb2FkT3JRdWV1ZShwYWdlTnVtYmVyKTtcclxuICAgICAgICAvLyByZXR1cm4gYmFjayBhbiBlbXB0eSByb3csIHNvIHRhYmxlIGNhbiBhdCBsZWFzdCByZW5kZXIgZW1wdHkgY2VsbHNcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBkYXRhOiB7fSxcclxuICAgICAgICAgICAgaWQ6IHJvd0luZGV4XHJcbiAgICAgICAgfTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGluZGV4SW5UaGlzUGFnZSA9IHJvd0luZGV4ICUgdGhpcy5wYWdlU2l6ZTtcclxuICAgICAgICByZXR1cm4gcGFnZVtpbmRleEluVGhpc1BhZ2VdO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5mb3JFYWNoSW5NZW1vcnkgPSBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgdmFyIHBhZ2VLZXlzID0gT2JqZWN0LmtleXModGhpcy5wYWdlQ2FjaGUpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGk8cGFnZUtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgcGFnZUtleSA9IHBhZ2VLZXlzW2ldO1xyXG4gICAgICAgIHZhciBwYWdlID0gdGhpcy5wYWdlQ2FjaGVbcGFnZUtleV07XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGo8cGFnZS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICB2YXIgbm9kZSA9IHBhZ2Vbal07XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUuZ2V0TW9kZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0VmlydHVhbFJvdzogZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZ2V0VmlydHVhbFJvdyhpbmRleCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRWaXJ0dWFsUm93Q291bnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC52aXJ0dWFsUm93Q291bnQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3JFYWNoSW5NZW1vcnk6IGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcclxuICAgICAgICAgICAgdGhhdC5mb3JFYWNoSW5NZW1vcnkoY2FsbGJhY2spO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFZpcnR1YWxQYWdlUm93Q29udHJvbGxlcjtcclxuIl19
