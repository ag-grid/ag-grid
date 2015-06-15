(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Angular Grid
// Written by Niall Crosby
// www.angulargrid.com
//
// Version 1.9.2

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

},{"./grid":15}],2:[function(require,module,exports){
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
},{"../constants":4,"../svgFactory":27,"../utils":31}],3:[function(require,module,exports){
var constants = require('./constants');
var utils = require('./utils');

function ColumnController() {
    this.listeners = [];
    this.createModel();
}

ColumnController.prototype.init = function(angularGrid, selectionRendererFactory, gridOptionsWrapper, expressionService) {
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.angularGrid = angularGrid;
    this.selectionRendererFactory = selectionRendererFactory;
    this.expressionService = expressionService;
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
        getDisplayedColumns: function() {
            return that.displayedColumns;
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
        },
        getDisplayNameForCol: function(column) {
            return that.getDisplayNameForCol(column);
        }
    };
};

ColumnController.prototype.getDisplayNameForCol = function(column) {

    var colDef = column.colDef;
    var headerValueGetter = colDef.headerValueGetter;

    if (headerValueGetter) {
        var params = {
            colDef: colDef,
            api: this.gridOptionsWrapper.getApi(),
            context: this.gridOptionsWrapper.getContext()
        };

        if (typeof headerValueGetter === 'function') {
            // valueGetter is a function, so just call it
            return headerValueGetter(params);
        } else if (typeof headerValueGetter === 'string') {
            // valueGetter is an expression, so execute the expression
            return this.expressionService.evaluate(headerValueGetter, params);
        }

        return utils.getValue(this.expressionService, undefined, colDef, undefined, api, context);
    } else if (colDef.displayName) {
        console.warn("ag-grid: Found displayName " + colDef.displayName + ", please use headerName instead, displayName is deprecated.");
        return colDef.displayName;
    } else {
        return colDef.headerName;
    }
};

ColumnController.prototype.addListener = function(listener) {
    this.listeners.push(listener);
};

ColumnController.prototype.fireColumnsChanged = function() {
    for (var i = 0; i<this.listeners.length; i++) {
        this.listeners[i].columnsChanged(this.columns);
    }
};

ColumnController.prototype.getModel = function() {
    return this.model;
};

// called by angularGrid
ColumnController.prototype.setColumns = function(columnDefs) {
    this.createColumns(columnDefs);
    this.updateModel();
    this.fireColumnsChanged();
};

// called by headerRenderer - when a header is opened or closed
ColumnController.prototype.columnGroupOpened = function(group) {
    group.expanded = !group.expanded;
    this.updateGroups();
    this.updateDisplayedColumns();
    this.angularGrid.refreshHeaderAndBody();
};

// called by toolPanel - when change in columns happens
ColumnController.prototype.onColumnStateChanged = function() {
    this.updateModel();
    this.angularGrid.refreshHeaderAndBody();
};

ColumnController.prototype.updateModel= function() {
    this.updateVisibleColumns();
    this.updatePinnedColumns();
    this.buildGroups();
    this.updateGroups();
    this.updateDisplayedColumns();
};

// private
ColumnController.prototype.updateDisplayedColumns = function() {
    this.displayedColumns = [];

    if (!this.gridOptionsWrapper.isGroupHeaders()) {
        // if not grouping by headers, then pull visible cols
        for (var j = 0; j < this.columns.length; j++) {
            var column = this.columns[j];
            if (column.visible) {
                this.displayedColumns.push(column);
            }
        }
    } else {
        // if grouping, then only show col as per group rules
        for (var i = 0; i < this.columnGroups.length; i++) {
            var group = this.columnGroups[i];
            group.addToVisibleColumns(this.displayedColumns);
        }
    }

};

// public - called from api
ColumnController.prototype.sizeColumnsToFit = function(gridWidth) {
    // avoid divide by zero
    if (gridWidth <= 0 || this.displayedColumns.length === 0) {
        return;
    }

    var columnStartWidth = 0; // will contain the starting total width of the cols been spread
    var colsToSpread = []; // all visible cols, except those with avoidSizeToFit
    var widthForSpreading = gridWidth; // grid width minus the columns we are not resizing

    // get the list of cols to work with
    for (var j = 0; j < this.displayedColumns.length ; j++) {
        if (this.displayedColumns[j].colDef.suppressSizeToFit === true) {
            // don't include col, and remove the width from teh available width
            widthForSpreading -= this.displayedColumns[j].actualWidth;
        } else {
            // include the col
            colsToSpread.push(this.displayedColumns[j]);
            columnStartWidth += this.displayedColumns[j].actualWidth;
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

    this.visibleColumns.forEach(function(column) {
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
        var processingFirstCol = currentGroup === null;
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
        group.calculateDisplayedColumns();
    }
};

// private
ColumnController.prototype.updateVisibleColumns = function() {
    this.visibleColumns = [];

    for (var i = 0; i < this.columns.length; i++) {
        var column = this.columns[i];
        if (column.visible) {
            column.index = i;
            this.visibleColumns.push(this.columns[i]);
        }
    }
};

// private
ColumnController.prototype.updatePinnedColumns = function() {
    var pinnedColumnCount = this.gridOptionsWrapper.getPinnedColCount();
    for (var i = 0; i < this.visibleColumns.length; i++) {
        var pinned = i < pinnedColumnCount;
        this.visibleColumns[i].pinned = pinned;
    }
};

// private
ColumnController.prototype.createColumns = function(columnDefs) {
    this.columns = [];
    var that = this;
    if (columnDefs) {
        for (var i = 0; i < columnDefs.length; i++) {
            var colDef = columnDefs[i];
            // this is messy - we swap in another col def if it's checkbox selection - not happy :(
            if (colDef === 'checkboxSelection') {
                colDef = that.selectionRendererFactory.createCheckboxColDef();
            }
            var width = that.calculateColInitialWidth(colDef);
            var visible = true;
            var column = new Column(colDef, width, visible);
            that.columns.push(column);
        }
    }
};

// private
ColumnController.prototype.calculateColInitialWidth = function(colDef) {
    if (!colDef.width) {
        // if no width defined in colDef, use default
        return this.gridOptionsWrapper.getColWidth();
    } else if (colDef.width < constants.MIN_COL_WIDTH) {
        // if width in col def to small, set to min width
        return constants.MIN_COL_WIDTH;
    } else {
        // otherwise use the provided width
        return colDef.width;
    }
};

// private
// call with true (pinned), false (not-pinned) or undefined (all columns)
ColumnController.prototype.getTotalColWidth = function(includePinned) {
    var widthSoFar = 0;
    var pinedNotImportant = typeof includePinned !== 'boolean';

    this.displayedColumns.forEach(function(column) {
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
    this.displayedColumns = [];
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

ColumnGroup.prototype.calculateDisplayedColumns = function() {
    // clear out last time we calculated
    this.displayedColumns = [];
    // it not expandable, everything is visible
    if (!this.expandable) {
        this.displayedColumns = this.allColumns;
        return;
    }
    // and calculate again
    for (var i = 0, j = this.allColumns.length; i < j; i++) {
        var column = this.allColumns[i];
        switch (column.colDef.groupShow) {
            case 'open':
                // when set to open, only show col if group is open
                if (this.expanded) {
                    this.displayedColumns.push(column);
                }
                break;
            case 'closed':
                // when set to open, only show col if group is open
                if (!this.expanded) {
                    this.displayedColumns.push(column);
                }
                break;
            default:
                // default is always show the column
                this.displayedColumns.push(column);
                break;
        }
    }
};

// should replace with utils method 'add all'
ColumnGroup.prototype.addToVisibleColumns = function(colsToAdd) {
    for (var i = 0; i < this.displayedColumns.length; i++) {
        var column = this.displayedColumns[i];
        colsToAdd.push(column);
    }
};

var colIdSequence = 0;

function Column(colDef, actualWidth, visible) {
    this.colDef = colDef;
    this.actualWidth = actualWidth;
    this.visible = visible;
    // in the future, the colKey might be something other than the index
    if (colDef.colId) {
        this.colId = colDef.colId;
    }else if (colDef.field) {
        this.colId = colDef.field;
    } else {
        this.colId = '' + colIdSequence++;
    }
}

module.exports = ColumnController;

},{"./constants":4,"./utils":31}],4:[function(require,module,exports){
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
FilterManager.prototype.isFilterPresentForCol = function(colId) {
    var filterWrapper = this.allFilters[colId];
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

        var colId = colKeys[i];
        var filterWrapper = this.allFilters[colId];

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
    var filterWrapper = this.allFilters[column.colId];

    if (!filterWrapper) {
        filterWrapper = this.createFilterWrapper(column);
        this.allFilters[column.colId] = filterWrapper;
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

},{"./../utils":31,"./numberFilter":8,"./setFilter":10,"./textFilter":13}],7:[function(require,module,exports){
module.exports = "<div><div><select class=ag-filter-select id=filterType><option value=1>[EQUALS]</option><option value=2>[LESS THAN]</option><option value=3>[GREATER THAN]</option></select></div><div><input class=ag-filter-filter id=filterText type=text placeholder=\"[FILTER...]\"></div></div>";

},{}],8:[function(require,module,exports){
var utils = require('./../utils');
var template = require('./numberFilter.html');

var EQUALS = 1;
var LESS_THAN = 2;
var GREATER_THAN = 3;

function NumberFilter(params) {
    this.filterParams = params.filterParams;
    this.filterChangedCallback = params.filterChangedCallback;
    this.localeTextFunc = params.localeTextFunc;
    this.valueGetter = params.valueGetter;
    this.createGui();
    this.filterNumber = null;
    this.filterType = EQUALS;
    this.createApi();
}

/* public */
NumberFilter.prototype.onNewRowsLoaded = function() {
    var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
    if (!keepSelection) {
        this.api.setType(EQUALS);
        this.api.setFilter(null);
    }
};

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

},{"./../utils":31,"./numberFilter.html":7}],9:[function(require,module,exports){
module.exports = "<div><div class=ag-filter-header-container><input class=ag-filter-filter type=text placeholder=\"[SEARCH...]\"></div><div class=ag-filter-header-container><label><input id=selectAll type=checkbox class=\"ag-filter-checkbox\"> ([SELECT ALL])</label></div><div class=ag-filter-list-viewport><div class=ag-filter-list-container><div id=itemForRepeat class=ag-filter-item><label><input type=checkbox class=ag-filter-checkbox filter-checkbox=\"true\"> <span class=ag-filter-value></span></label></div></div></div></div>";

},{}],10:[function(require,module,exports){
var utils = require('./../utils');
var SetFilterModel = require('./setFilterModel');
var template = require('./setFilter.html');

var DEFAULT_ROW_HEIGHT = 20;

function SetFilter(params) {
    this.filterParams = params.filterParams;
    this.rowHeight = (this.filterParams && this.filterParams.cellHeight) ? this.filterParams.cellHeight : DEFAULT_ROW_HEIGHT;
    this.model = new SetFilterModel(params.colDef, params.rowModel, params.valueGetter);
    this.filterChangedCallback = params.filterChangedCallback;
    this.valueGetter = params.valueGetter;
    this.rowsInBodyContainer = {};
    this.colDef = params.colDef;
    this.localeTextFunc = params.localeTextFunc;
    if (this.filterParams) {
        this.cellRenderer = this.filterParams.cellRenderer;
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
    var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
    // default is reset
    this.model.refreshUniqueValues(keepSelection);
    this.setContainerHeight();
    this.refreshVirtualRows();
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

},{"./../utils":31,"./setFilter.html":9,"./setFilterModel":11}],11:[function(require,module,exports){
var utils = require('../utils');

function SetFilterModel(colDef, rowModel, valueGetter) {
    this.colDef = colDef;
    this.rowModel = rowModel;
    this.valueGetter = valueGetter;

    this.createUniqueValues();

    // by default, no filter, so we display everything
    this.displayedValues = this.uniqueValues;
    this.miniFilter = null;
    //we use a map rather than an array for the selected values as the lookup
    //for a map is much faster than the lookup for an array, especially when
    //the length of the array is thousands of records long
    this.selectedValuesMap = {};
    this.selectEverything();
}

SetFilterModel.prototype.refreshUniqueValues = function(keepSelection) {
    this.createUniqueValues();

    var oldModel = Object.keys(this.selectedValuesMap);

    this.selectedValuesMap = {};
    this.filterDisplayedValues();

    if (keepSelection) {
        this.setModel(oldModel);
    } else {
        this.selectEverything();
    }
};

SetFilterModel.prototype.createUniqueValues = function() {
    if (this.colDef.filterParams && this.colDef.filterParams.values) {
        this.uniqueValues = utils.toStrings(this.colDef.filterParams.values);
    } else {
        this.uniqueValues = utils.toStrings(this.iterateThroughNodesForValues());
    }

    var bla = '';
    this.uniqueValues.forEach( function(item) {
        bla += '\'' + item + '\','
    });
    console.log(bla);

    if (this.colDef.comparator) {
        this.uniqueValues.sort(this.colDef.comparator);
    } else {
        this.uniqueValues.sort(utils.defaultComparator);
    }
};

SetFilterModel.prototype.iterateThroughNodesForValues = function() {
    var uniqueCheck = {};
    var result = [];

    var that = this;

    function recursivelyProcess(nodes) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.group && !node.footer) {
                // group node, so dig deeper
                recursivelyProcess(node.children);
            } else {
                var value = that.valueGetter(node);
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

    var topLevelNodes = this.rowModel.getTopLevelNodes();
    recursivelyProcess(topLevelNodes);

    return result;
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

},{"../utils":31}],12:[function(require,module,exports){
module.exports = "<div><div><select class=ag-filter-select id=filterType><option value=1>[CONTAINS]</option><option value=2>[EQUALS]</option><option value=3>[STARTS WITH]</option><option value=4>[ENDS WITH]</option></select></div><div><input class=ag-filter-filter id=filterText type=text placeholder=\"[FILTER...]\"></div></div>";

},{}],13:[function(require,module,exports){
var utils = require('../utils');
var template = require('./textFilter.html');

var CONTAINS = 1;
var EQUALS = 2;
var STARTS_WITH = 3;
var ENDS_WITH = 4;

function TextFilter(params) {
    this.filterParams = params.filterParams;
    this.filterChangedCallback = params.filterChangedCallback;
    this.localeTextFunc = params.localeTextFunc;
    this.valueGetter = params.valueGetter;
    this.createGui();
    this.filterText = null;
    this.filterType = CONTAINS;
    this.createApi();
}

/* public */
TextFilter.prototype.onNewRowsLoaded = function() {
    var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
    if (!keepSelection) {
        this.api.setType(CONTAINS);
        this.api.setFilter(null);
    }
};

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

},{"../utils":31,"./textFilter.html":12}],14:[function(require,module,exports){
module.exports = "<div class=\"ag-root ag-scrolls\"><div class=ag-loading-panel><div class=ag-loading-wrapper><span class=ag-loading-center>Loading...</span></div></div><div class=ag-header><div class=ag-pinned-header></div><div class=ag-header-viewport><div class=ag-header-container></div></div></div><div class=ag-body><div class=ag-pinned-cols-viewport><div class=ag-pinned-cols-container></div></div><div class=ag-body-viewport-wrapper><div class=ag-body-viewport><div class=ag-body-container></div></div></div></div><div class=ag-paging-panel></div></div>";

},{}],15:[function(require,module,exports){
var utils = require('./utils');
var constants = require('./constants');
var GridOptionsWrapper = require('./gridOptionsWrapper');
var template = require('./grid.html');
var templateNoScrolls = require('./gridNoScrolls.html');
var SelectionController = require('./selectionController');
var FilterManager = require('./filter/filterManager');
var SelectionRendererFactory = require('./selectionRendererFactory');
var ColumnController = require('./columnController');
var RowRenderer = require('./rowRenderer');
var HeaderRenderer = require('./headerRenderer');
var InMemoryRowController = require('./rowControllers/inMemoryRowController');
var VirtualPageRowController = require('./rowControllers/virtualPageRowController');
var PaginationController = require('./rowControllers/paginationController');
var ExpressionService = require('./expressionService');
var TemplateService = require('./templateService');
var ToolPanel = require('./toolPanel/toolPanel');

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

    if (this.gridOptionsWrapper.isSuppressVerticalScroll() && !this.gridOptionsWrapper.isDontUseScrolls()) {
        utils.addCssClass(eGridDiv, 'ag-no-vertical-scroll');
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
    var toolPanel = new ToolPanel();

    var columnModel = columnController.getModel();

    // initialise all the beans
    templateService.init($scope);
    selectionController.init(this, this.eParentOfRows, gridOptionsWrapper, $scope, rowRenderer);
    filterManager.init(this, gridOptionsWrapper, $compile, $scope, expressionService, columnModel);
    selectionRendererFactory.init(this, selectionController);
    columnController.init(this, selectionRendererFactory, gridOptionsWrapper, expressionService);
    rowRenderer.init(gridOptions, columnModel, gridOptionsWrapper, eGridDiv, this,
        selectionRendererFactory, $compile, $scope, selectionController, expressionService, templateService,
        this.eParentOfRows);
    headerRenderer.init(gridOptionsWrapper, columnController, columnModel, eGridDiv, this, filterManager,
        $scope, $compile, expressionService);
    inMemoryRowController.init(gridOptionsWrapper, columnModel, this, filterManager, $scope, expressionService);
    virtualPageRowController.init(rowRenderer, gridOptionsWrapper, this);

    if (this.eToolPanelContainer) {
        if (gridOptionsWrapper.isShowToolPanel()) {
            toolPanel.init(this.eToolPanelContainer, columnController);
            this.eRoot.style.marginRight = '200px';
        } else {
            this.eToolPanelContainer.style.layout = 'none';
        }
    }

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
        if (this.gridOptionsWrapper.isVirtualPaging()) {
            console.warn('ag-grid: cannot do quick filtering when doing virtual paging');
            return;
        }

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
    this.headerRenderer.updateFilterIcons();
    if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
        // if doing server side filtering, changing the sort has the impact
        // of resetting the datasource
        this.setDatasource();
    } else {
        // if doing in memory filtering, we just update the in memory data
        this.updateModelAndRefresh(constants.STEP_FILTER);
    }
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

Grid.prototype.getFilterModel = function() {
    return this.filterManager.getFilterModel();
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
            if (that.gridOptionsWrapper.isDontUseScrolls()) {
                console.warn('ag-grid: sizeColumnsToFit does not work when dontUseScrolls=true');
                return;
            }
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
            that.ensureColIndexVisible(index);
        },
        ensureIndexVisible: function(index) {
            that.ensureIndexVisible(index);
        },
        ensureNodeVisible: function(comparator) {
            that.ensureNodeVisible(comparator);
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
            return that.getFilterModel();
        },
        getFocusedCell: function() {
            return that.rowRenderer.getFocusedCell();
        },
        setFocusedCell: function(rowIndex, colIndex) {
            that.setFocusedCell(rowIndex, colIndex);
        }
    };
    this.gridOptions.api = api;
};

Grid.prototype.setFocusedCell = function(rowIndex, colIndex) {
    this.ensureIndexVisible(rowIndex);
    this.ensureColIndexVisible(colIndex);
    var that = this;
    setTimeout( function() {
        that.rowRenderer.setFocusedCell(rowIndex, colIndex);
    }, 10);
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
    if (!this.gridOptionsWrapper.isEnableSorting()) {
        console.warn('ag-grid: You are setting the sort model on a grid that does not have sorting enabled');
        return;
    }
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

    this.onSortingChanged();
};

Grid.prototype.onSortingChanged = function() {
    this.headerRenderer.updateSortIcons();
    if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
        // if doing server side sorting, changing the sort has the impact
        // of resetting the datasource
        this.setDatasource();
    } else {
        // if doing in memory sorting, we just update the in memory data
        this.updateModelAndRefresh(constants.STEP_SORT);
    }
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
        this.eToolPanelContainer = eGridDiv.querySelector('.ag-tool-panel-container');
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

},{"./columnController":3,"./constants":4,"./expressionService":5,"./filter/filterManager":6,"./grid.html":14,"./gridNoScrolls.html":16,"./gridOptionsWrapper":17,"./headerRenderer":19,"./rowControllers/inMemoryRowController":20,"./rowControllers/paginationController":21,"./rowControllers/virtualPageRowController":23,"./rowRenderer":24,"./selectionController":25,"./selectionRendererFactory":26,"./templateService":28,"./toolPanel/toolPanel":30,"./utils":31}],16:[function(require,module,exports){
module.exports = "<div class=\"ag-root ag-no-scrolls\"><div class=ag-loading-panel><div class=ag-loading-wrapper><span class=ag-loading-center>Loading...</span></div></div><div class=ag-header-container></div><div class=ag-body-container></div></div>";

},{}],17:[function(require,module,exports){
var DEFAULT_ROW_HEIGHT = 30;

var constants = require('./constants');
function GridOptionsWrapper(gridOptions) {
    this.gridOptions = gridOptions;
    this.setupDefaults();
}

function isTrue(value) {
    return value === true || value === 'true';
}

GridOptionsWrapper.prototype.isSuppressVerticalScroll = function() { return isTrue(this.gridOptions.suppressVerticalScroll); };
GridOptionsWrapper.prototype.isRowSelection = function() { return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple"; };
GridOptionsWrapper.prototype.isRowDeselection = function() { return isTrue(this.gridOptions.rowDeselection); };
GridOptionsWrapper.prototype.isRowSelectionMulti = function() { return this.gridOptions.rowSelection === 'multiple'; };
GridOptionsWrapper.prototype.getContext = function() { return this.gridOptions.context; };
GridOptionsWrapper.prototype.isVirtualPaging = function() { return isTrue(this.gridOptions.virtualPaging); };
GridOptionsWrapper.prototype.isShowToolPanel = function() { return isTrue(this.gridOptions.showToolPanel); };
GridOptionsWrapper.prototype.isRowsAlreadyGrouped = function() { return isTrue(this.gridOptions.rowsAlreadyGrouped); };
GridOptionsWrapper.prototype.isGroupSelectsChildren = function() { return isTrue(this.gridOptions.groupSelectsChildren); };
GridOptionsWrapper.prototype.isGroupIncludeFooter = function() { return isTrue(this.gridOptions.groupIncludeFooter); };
GridOptionsWrapper.prototype.isSuppressRowClickSelection = function() { return isTrue(this.gridOptions.suppressRowClickSelection); };
GridOptionsWrapper.prototype.isSuppressCellSelection = function() { return isTrue(this.gridOptions.suppressCellSelection); };
GridOptionsWrapper.prototype.isSuppressUnSort = function() { return isTrue(this.gridOptions.suppressUnSort); };
GridOptionsWrapper.prototype.isSuppressMultiSort = function() { return isTrue(this.gridOptions.suppressMultiSort); };
GridOptionsWrapper.prototype.isGroupHeaders = function() { return isTrue(this.gridOptions.groupHeaders); };
GridOptionsWrapper.prototype.getGroupInnerRenderer = function() { return this.gridOptions.groupInnerRenderer; };
GridOptionsWrapper.prototype.isDontUseScrolls = function() { return isTrue(this.gridOptions.dontUseScrolls); };
GridOptionsWrapper.prototype.getRowStyle = function() { return this.gridOptions.rowStyle; };
GridOptionsWrapper.prototype.getRowClass = function() { return this.gridOptions.rowClass; };
GridOptionsWrapper.prototype.getGridOptions = function() { return this.gridOptions; };
GridOptionsWrapper.prototype.getHeaderCellRenderer = function() { return this.gridOptions.headerCellRenderer; };
GridOptionsWrapper.prototype.getApi = function() { return this.gridOptions.api; };
GridOptionsWrapper.prototype.isEnableColResize = function() { return this.gridOptions.enableColResize; };
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
GridOptionsWrapper.prototype.getCellFocused = function() { return this.gridOptions.cellFocused; };
GridOptionsWrapper.prototype.getRowSelected = function() { return this.gridOptions.rowSelected; };
GridOptionsWrapper.prototype.getSelectionChanged = function() { return this.gridOptions.selectionChanged; };
GridOptionsWrapper.prototype.getVirtualRowRemoved = function() { return this.gridOptions.virtualRowRemoved; };
GridOptionsWrapper.prototype.getDatasource = function() { return this.gridOptions.datasource; };
GridOptionsWrapper.prototype.getReady = function() { return this.gridOptions.ready; };
GridOptionsWrapper.prototype.getRowBuffer = function() { return this.gridOptions.rowBuffer; };

GridOptionsWrapper.prototype.getColWidth = function() {
    if (typeof this.gridOptions.colWidth !== 'number' ||  this.gridOptions.colWidth < constants.MIN_COL_WIDTH) {
        return 200;
    } else  {
        return this.gridOptions.colWidth;
    }
};

GridOptionsWrapper.prototype.isEnableSorting = function() { return isTrue(this.gridOptions.enableSorting) || isTrue(this.gridOptions.enableServerSideSorting); };
GridOptionsWrapper.prototype.isEnableServerSideSorting = function() { return isTrue(this.gridOptions.enableServerSideSorting); };

GridOptionsWrapper.prototype.isEnableFilter = function() { return isTrue(this.gridOptions.enableFilter) || isTrue(this.gridOptions.enableServerSideFilter); };
GridOptionsWrapper.prototype.isEnableServerSideFilter = function() { return this.gridOptions.enableServerSideFilter; };

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

},{"./constants":4}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
var utils = require('./utils');
var SvgFactory = require('./svgFactory');
var constants = require('./constants');

var svgFactory = new SvgFactory();

function HeaderRenderer() {}

HeaderRenderer.prototype.init = function(gridOptionsWrapper, columnController, columnModel, eGrid, angularGrid, filterManager, $scope, $compile, expressionService) {
    this.expressionService = expressionService;
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
    group.displayedColumns.forEach(function(column) {
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
    eDraggableElement.addEventListener('mousedown', function(downEvent) {
        dragCallback.onDragStart();
        that.eRoot.style.cursor = "col-resize";
        that.dragStartX = downEvent.clientX;

        var listenersToRemove = {};

        listenersToRemove.mousemove = function (moveEvent) {
            var newX = moveEvent.clientX;
            var change = newX - that.dragStartX;
            dragCallback.onDragging(change);
        };

        listenersToRemove.mouseup = function () {
            that.stopDragging(listenersToRemove);
        };

        listenersToRemove.mouseleave = function () {
            that.stopDragging(listenersToRemove);
        };

        that.eRoot.addEventListener('mousemove', listenersToRemove.mousemove);
        that.eRoot.addEventListener('mouseup', listenersToRemove.mouseup);
        that.eRoot.addEventListener('mouseleave', listenersToRemove.mouseleave);
    });
};

HeaderRenderer.prototype.setWidthOfGroupHeaderCell = function(headerGroup) {
    var totalWidth = 0;
    headerGroup.displayedColumns.forEach(function(column) {
        totalWidth += column.actualWidth;
    });
    headerGroup.eHeaderGroupCell.style.width = utils.formatWidth(totalWidth);
    headerGroup.actualWidth = totalWidth;
};

HeaderRenderer.prototype.insertHeadersWithoutGrouping = function() {
    var ePinnedHeader = this.ePinnedHeader;
    var eHeaderContainer = this.eHeaderContainer;
    var that = this;

    this.columnModel.getDisplayedColumns().forEach(function(column) {
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

    var newChildScope;
    if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
        newChildScope = this.$scope.$new();
        newChildScope.colDef = colDef;
        newChildScope.colIndex = colDef.index;
        newChildScope.colDefWrapper = column;
        this.childScopes.push(newChildScope);
    }

    var headerNameValue = this.columnModel.getDisplayNameForCol(column);

    if (headerCellRenderer) {
        // renderer provided, use it
        var cellRendererParams = {
            colDef: colDef,
            $scope: newChildScope,
            context: this.gridOptionsWrapper.getContext(),
            value: headerNameValue,
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
            var childToAppendCompiled = this.$compile(childToAppend)(newChildScope)[0];
            headerCellLabel.appendChild(childToAppendCompiled);
        } else {
            headerCellLabel.appendChild(childToAppend);
        }
    } else {
        // no renderer, default text render
        var eInnerText = document.createElement("span");
        eInnerText.className = 'ag-header-cell-text';
        eInnerText.innerHTML = headerNameValue;
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
            if (that.gridOptionsWrapper.isSuppressUnSort()) {
                column.sort = constants.ASC;
            } else {
                column.sort = null;
            }
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

        var doingMultiSort = !that.gridOptionsWrapper.isSuppressMultiSort() && e.shiftKey;

        // clear sort on all columns except this one, and update the icons
        that.columnModel.getAllColumns().forEach(function(columnToClear) {
            // Do not clear if either holding shift, or if column in question was clicked
            if (!(doingMultiSort || columnToClear === column)) {
                columnToClear.sort = null;
            }
        });

        that.angularGrid.onSortingChanged();
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
    var displayedColumns = currentGroup.displayedColumns;
    return {
        onDragStart: function() {
            this.groupWidthStart = currentGroup.actualWidth;
            this.childrenWidthStarts = [];
            var that = this;
            displayedColumns.forEach(function(colDefWrapper) {
                that.childrenWidthStarts.push(colDefWrapper.actualWidth);
            });
            this.minWidth = displayedColumns.length * constants.MIN_COL_WIDTH;
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
            currentGroup.displayedColumns.forEach(function(colDefWrapper, index) {
                var notLastCol = index !== (displayedColumns.length - 1);
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
                var eHeaderCell = displayedColumns[index].eHeaderCell;
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

HeaderRenderer.prototype.stopDragging = function(listenersToRemove) {
    this.eRoot.style.cursor = "";
    var that = this;
    utils.iterateObject(listenersToRemove, function(key, listener) {
        that.eRoot.removeEventListener(key, listener);
    });
};

HeaderRenderer.prototype.updateFilterIcons = function() {
    var that = this;
    this.columnModel.getDisplayedColumns().forEach(function(column) {
        // todo: need to change this, so only updates if column is visible
        if (column.eFilterIcon) {
            var filterPresent = that.filterManager.isFilterPresentForCol(column.colId);
            var displayStyle = filterPresent ? 'inline' : 'none';
            column.eFilterIcon.style.display = displayStyle;
        }
    });
};

module.exports = HeaderRenderer;

},{"./constants":4,"./svgFactory":27,"./utils":31}],20:[function(require,module,exports){
var groupCreator = require('./../groupCreator');
var utils = require('./../utils');
var constants = require('./../constants');

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
    var sorting;

    // if the sorting is already done by the server, then we should not do it here
    if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
        sorting = false;
    } else {
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
        if (sortingOptions.length >= 0) {
            sorting = true;
        }
    }

    var rowNodesReadyForSorting = this.rowsAfterFilter ? this.rowsAfterFilter.slice(0) : null;

    if (sorting) {
        // The columns are to be sorted in the order that the user selected them:
        sortingOptions.sort(function(optionA, optionB){
            return optionA.sortedAt - optionB.sortedAt;
        });
        this.sortList(rowNodesReadyForSorting, sortingOptions);
    } else {
        // if no sorting, set all group children after sort to the original list.
        // note: it is important to do this, even if doing server side sorting,
        // to allow the rows to pass to the next stage (ie set the node value
        // childrenAfterSort)
        this.recursivelyResetSort(rowNodesReadyForSorting);
    }

    this.rowsAfterSort = rowNodesReadyForSorting;
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
    var doingFilter;

    if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
        doingFilter = false;
    } else {
        var quickFilterPresent = this.angularGrid.getQuickFilter() !== null;
        var advancedFilterPresent = this.filterManager.isFilterPresent();
        doingFilter = quickFilterPresent || advancedFilterPresent;
    }

    var rowsAfterFilter;
    if (doingFilter) {
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

    // aggregate here, so filters have the agg data ready
    this.doGrouping();
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

},{"./../constants":4,"./../groupCreator":18,"./../utils":31}],21:[function(require,module,exports){
var template = require('./paginationPanel.html');

var utils = require('./../utils');

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
    if (this.datasource.pageSize && typeof this.datasource.pageSize !== 'number') {
        console.warn('datasource.pageSize should be a number');
    }
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

    var sortModel;
    if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
        sortModel = this.angularGrid.getSortModel();
    }

    var filterModel;
    if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
        filterModel = this.angularGrid.getFilterModel();
    }

    var params = {
        startRow: startRow,
        endRow: endRow,
        successCallback: successCallback,
        failCallback: failCallback,
        sortModel: sortModel,
        filterModel: filterModel
    };

    // check if old version of datasource used
    var getRowsParams = utils.getFunctionParameters(this.datasource.getRows);
    if (getRowsParams.length > 1) {
        console.warn('ag-grid: It looks like your paging datasource is of the old type, taking more than one parameter.');
        console.warn('ag-grid: From ag-grid 1.9.0, now the getRows takes one parameter. See the documentation for details.');
    }

    this.datasource.getRows(params);

    function successCallback(rows, lastRowIndex) {
        if (that.isCallDaemon(callVersionCopy)) {
            return;
        }
        that.pageLoaded(rows, lastRowIndex);
    }

    function failCallback() {
        if (that.isCallDaemon(callVersionCopy)) {
            return;
        }
        // set in an empty set of rows, this will at
        // least get rid of the loading panel, and
        // stop blocking things
        that.angularGrid.setRows([]);
    }
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
    return template
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

},{"./../utils":31,"./paginationPanel.html":22}],22:[function(require,module,exports){
module.exports = "<span id=pageRowSummaryPanel class=ag-paging-row-summary-panel><span id=firstRowOnPage></span> [TO] <span id=lastRowOnPage></span> [OF] <span id=recordCount></span></span> <span class=ag-paging-page-summary-panel><button class=ag-paging-button id=btFirst>[FIRST]</button> <button class=ag-paging-button id=btPrevious>[PREVIOUS]</button> [PAGE] <span id=current></span> [OF] <span id=total></span> <button class=ag-paging-button id=btNext>[NEXT]</button> <button class=ag-paging-button id=btLast>[LAST]</button></span>";

},{}],23:[function(require,module,exports){
/*
 * This row controller is used for infinite scrolling only. For normal 'in memory' table,
 * or standard pagination, the inMemoryRowController is used.
 */
var utils = require('./../utils');
var logging = true;

function VirtualPageRowController() {}

VirtualPageRowController.prototype.init = function(rowRenderer, gridOptionsWrapper, angularGrid) {
    this.rowRenderer = rowRenderer;
    this.datasourceVersion = 0;
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.angularGrid = angularGrid;
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

    var sortModel;
    if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
        sortModel = this.angularGrid.getSortModel();
    }

    var filterModel;
    if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
        filterModel = this.angularGrid.getFilterModel();
    }

    var params = {
        startRow: startRow,
        endRow: endRow,
        successCallback: successCallback,
        failCallback: failCallback,
        sortModel: sortModel,
        filterModel: filterModel
    };

    // check if old version of datasource used
    var getRowsParams = utils.getFunctionParameters(this.datasource.getRows);
    if (getRowsParams.length > 1) {
        console.warn('ag-grid: It looks like your paging datasource is of the old type, taking more than one parameter.');
        console.warn('ag-grid: From ag-grid 1.9.0, now the getRows takes one parameter. See the documentation for details.');
    }

    this.datasource.getRows(params);

    function successCallback(rows, lastRowIndex) {
        if (that.requestIsDaemon(datasourceVersionCopy)) {
            return;
        }
        that.pageLoaded(pageNumber, rows, lastRowIndex);
    }

    function failCallback() {
        if (that.requestIsDaemon(datasourceVersionCopy)) {
            return;
        }
        that.pageLoadFailed(pageNumber);
    }
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

},{"./../utils":31}],24:[function(require,module,exports){
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

    var columns = this.columnModel.getDisplayedColumns();
    // if no cols, don't draw row
    if (!columns || columns.length === 0) {
        return;
    }

    for (var rowIndex = first; rowIndex <= last; rowIndex++) {
        var node = this.rowModel.getVirtualRow(rowIndex);
        if (node) {

            for (var colIndex = 0; colIndex < columns.length; colIndex++) {
                var column = columns[colIndex];
                var renderedRow = this.renderedRows[rowIndex];
                var eGridCell = renderedRow.eVolatileCells[column.colId];

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
    // if no fromIndex then set to -1, which will refresh everything
    var realFromIndex = (typeof fromIndex === 'number') ? fromIndex : -1;
    rowsToRemove.forEach(function(indexToRemove) {
        if (indexToRemove >= realFromIndex) {
            that.removeVirtualRow(indexToRemove);

            // if the row was last to have focus, we remove the fact that it has focus
            if (that.focusedCell && that.focusedCell.rowIndex == indexToRemove) {
                that.focusedCell = null;
            }
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
    var columns = this.columnModel.getDisplayedColumns();
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
        renderedRow.eVolatileCells[column.colId] = eGridCell;
    }
    renderedRow.eCells[column.colId] = eGridCell;

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
    this.renderedRowStartEditingListeners[rowIndex][column.colId] = function() {
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
            var startEditingFunc = that.renderedRowStartEditingListeners[rowIndex][column.colId];
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
        eCell = renderedRow.eCells[cellToFocus.column.colId];
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

// called internally
RowRenderer.prototype.focusCell = function(eCell, rowIndex, colIndex, forceBrowserFocus) {
    // do nothing if cell selection is off
    if (this.gridOptionsWrapper.isSuppressCellSelection()) {
        return;
    }

    // remove any previous focus
    utils.querySelectorAll_replaceCssClass(this.eParentOfRows, '.ag-cell-focus', 'ag-cell-focus', 'ag-cell-no-focus');

    var selectorForCell = '[row="' + rowIndex + '"] [col="' + colIndex + '"]';
    utils.querySelectorAll_replaceCssClass(this.eParentOfRows, selectorForCell, 'ag-cell-no-focus', 'ag-cell-focus');

    this.focusedCell = {rowIndex: rowIndex, colIndex: colIndex, node: this.rowModel.getVirtualRow(rowIndex)};

    // this puts the browser focus on the cell (so it gets key presses)
    if (forceBrowserFocus) {
        eCell.focus();
    }

    if (typeof this.gridOptionsWrapper.getCellFocused() === 'function') {
        this.gridOptionsWrapper.getCellFocused()(this.focusedCell);
    }
};

// for API
RowRenderer.prototype.getFocusedCell = function() {
    return this.focusedCell;
};

// called via API
RowRenderer.prototype.setFocusedCell = function(rowIndex, colIndex) {
    var renderedRow = this.renderedRows[rowIndex];
    var column = this.columnModel.getDisplayedColumns()[colIndex];
    if (renderedRow && column) {
        var eCell = renderedRow.eCells[column.colId];
        this.focusCell(eCell, rowIndex, colIndex, true);
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

    var visibleColumns = this.columnModel.getDisplayedColumns();
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

        var nextFunc = this.renderedRowStartEditingListeners[currentRowIndex][currentCol.colId];
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

},{"./cellRenderers/groupCellRendererFactory":2,"./constants":4,"./utils":31}],25:[function(require,module,exports){
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

},{"./utils":31}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){

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

},{}],29:[function(require,module,exports){
var CheckboxSelection = require("../widgets/checkboxSelection");

function ColumnSelectionPanel(columnController) {
    this.eGui = document.createElement('div');
    this.setupComponents();
    this.columnController = columnController;

    var that = this;
    this.columnController.addListener({
        columnsChanged: that.columnsChanged.bind(that)
    });
}

ColumnSelectionPanel.prototype.columnsChanged = function(newColumns) {
    this.cColumnList.setModel(newColumns);
};

ColumnSelectionPanel.prototype.setupComponents = function() {
    this.cColumnList = new CheckboxSelection();
    this.eGui.appendChild(this.cColumnList.getGui());

    var columnItemProxy = this.createColumnItemProxy();
    this.cColumnList.setItemProxy(columnItemProxy);

    var that = this;
    this.cColumnList.addItemMovedListener( function() {
        that.columnController.onColumnStateChanged();
    });
};

ColumnSelectionPanel.prototype.createColumnItemProxy = function() {
    var that = this;
    return {
        getText: function(item) { return that.columnController.getDisplayNameForCol(item)},
        isSelected: function(item) { return item.visible},
        setSelected: function(item, selected) { that.setSelected(item, selected); }
    };
};

ColumnSelectionPanel.prototype.setSelected = function(column, selected) {
    column.visible = selected;
    this.columnController.onColumnStateChanged();
};

ColumnSelectionPanel.prototype.getGui = function() {
    return this.eGui;
};

module.exports = ColumnSelectionPanel;

},{"../widgets/checkboxSelection":33}],30:[function(require,module,exports){
var utils = require('../utils');
var ColumnSelectionPanel = require('./columnSelectionPanel');

function ToolPanel() {
}

ToolPanel.prototype.init = function(eToolPanelContainer, columnController) {
    var eGui = document.createElement('div');
    eGui.style.height = '100%';
    eToolPanelContainer.appendChild(eGui);

    var columnSelectionPanel = new ColumnSelectionPanel(columnController);
    eGui.appendChild(columnSelectionPanel.getGui());
};

module.exports = ToolPanel;

},{"../utils":31,"./columnSelectionPanel":29}],31:[function(require,module,exports){
function Utils() {}

var FUNCTION_STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var FUNCTION_ARGUMENT_NAMES = /([^\s,]+)/g;

Utils.prototype.iterateObject = function(object, callback) {
    var keys = Object.keys(object);
    for (var i = 0; i<keys.length; i++) {
        var key = keys[i];
        var value = object[key];
        callback(key, value);
    }
};

Utils.prototype.map = function(array, callback) {
    var result = [];
    for (var i = 0; i<array.length; i++) {
        var item = array[i];
        var mappedItem = callback(item);
        result.push(mappedItem);
    }
    return result;
};

Utils.prototype.getFunctionParameters = function(func) {
    var fnStr = func.toString().replace(FUNCTION_STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(FUNCTION_ARGUMENT_NAMES);
    if (result === null) {
        return [];
    } else {
        return result;
    }
};

Utils.prototype.toStrings = function(array) {
    return this.map(array, function (item) {
        if (item === undefined || item === null || !item.toString) {
            return null;
        } else {
            return item.toString();
        }
    });
};

/*
Utils.prototype.objectValuesToArray = function(object) {
    var keys = Object.keys(object);
    var result = [];
    for (var i = 0; i<keys.length; i++) {
        var key = keys[i];
        var value = object[key];
        result.push(value);
    }
    return result;
};
*/

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

Utils.prototype.addOrRemoveCssClass = function(element, className, addOrRemove) {
    if (addOrRemove) {
        this.addCssClass(element, className);
    } else {
        this.removeCssClass(element, className);
    }
};

Utils.prototype.addCssClass = function(element, className) {
    if (element.className && element.className.length > 0) {
        var cssClasses = element.className.split(' ');
        if (cssClasses.indexOf(className) < 0) {
            cssClasses.push(className);
            element.className = cssClasses.join(' ');
        }
    } else {
        element.className = className;
    }
};

Utils.prototype.removeCssClass = function(element, className) {
    if (element.className && element.className.length > 0) {
        var cssClasses = element.className.split(' ');
        var index = cssClasses.indexOf(className);
        if (index >= 0) {
            cssClasses.splice(index, 1);
            element.className = cssClasses.join(' ');
        }
    }
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

},{}],32:[function(require,module,exports){
module.exports = "<div class=ag-list-selection style=\"height: 100%; overflow: auto\"><div><div ag-repeat draggable=true><span class=\"fa ag-checkbox-selection-checkbox\"></span> <span class=ag-checkbox-selection-value></span></div></div></div>";

},{}],33:[function(require,module,exports){
var template = require('./checkboxSelection.html');
var utils = require('../utils');

var NOT_DROP_TARGET = 0;
var DROP_TARGET_ABOVE = 1;
var DROP_TARGET_BELOW = -11;

function CheckboxSelection() {
    this.setupComponents();
    this.uniqueId = 'CheckboxSelection-' + Math.random();
    this.itemMovedListeners = [];
}

CheckboxSelection.prototype.addItemMovedListener = function(listener) {
    this.itemMovedListeners.push(listener);
};

CheckboxSelection.prototype.fireItemMoved = function() {
    for (var i = 0; i<this.itemMovedListeners.length; i++) {
        this.itemMovedListeners[i]();
    }
};

CheckboxSelection.prototype.setItemProxy = function(itemProxy) {
    this.itemProxy = itemProxy;
};

CheckboxSelection.prototype.setupComponents = function() {

    this.eGui = utils.loadTemplate(template);
    this.eFilterValueTemplate = this.eGui.querySelector("[ag-repeat]");

    this.eListParent = this.eFilterValueTemplate.parentNode;
    utils.removeAllChildren(this.eListParent);
};

CheckboxSelection.prototype.setModel = function(model) {
    this.model = model;
    this.drawListItems();
};

CheckboxSelection.prototype.drawListItems = function() {
    utils.removeAllChildren(this.eListParent);

    if (!this.model) {
        return;
    }

    for (var i = 0; i<this.model.length; i++) {
        var item = this.model[i];
        var text = this.getText(item);
        var selected = this.isSelected(item);
        var eListItem = this.eFilterValueTemplate.cloneNode(true);

        var eCheckbox = eListItem.querySelector('.ag-checkbox-selection-checkbox');
        this.styleListItemSelected(eListItem, eCheckbox, selected);

        var eValue = eListItem.querySelector(".ag-checkbox-selection-value");
        eValue.innerHTML = text;

        this.addChangeListener(eListItem, eCheckbox, item);
        this.addDragAndDrop(eListItem, item);

        this.eListParent.appendChild(eListItem);
    }
};

CheckboxSelection.prototype.styleListItemSelected = function(eListItem, eCheckbox, selected) {
    utils.addOrRemoveCssClass(eCheckbox, 'fa-eye', selected);
    utils.addOrRemoveCssClass(eCheckbox, 'fa-eye-slash', !selected);

    utils.addOrRemoveCssClass(eListItem, 'ag-list-item-selected', !selected);
    utils.addOrRemoveCssClass(eListItem, 'ag-list-item-not-selected', !selected);
};

CheckboxSelection.prototype.dragAfterThisItem = function(item) {
    var itemAfter = this.model.indexOf(item) < this.model.indexOf(this.dragItem);
    return itemAfter;
};

CheckboxSelection.prototype.setDropCssClasses = function(eListItem, state) {
    utils.addOrRemoveCssClass(eListItem, 'ag-not-drop-target', state === NOT_DROP_TARGET);
    utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-above', state === DROP_TARGET_ABOVE);
    utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-below', state === DROP_TARGET_BELOW);
};

CheckboxSelection.prototype.setDragCssClasses = function(eListItem, dragging) {
    utils.addOrRemoveCssClass(eListItem, 'ag-dragging', dragging);
    utils.addOrRemoveCssClass(eListItem, 'ag-not-dragging', !dragging);
};

CheckboxSelection.prototype.addDragAndDrop = function(eListItem, item) {

    this.setDropCssClasses(eListItem, NOT_DROP_TARGET);

    var that = this;
    eListItem.addEventListener('drop', function(event) {
        if (that.dragItem && that.dragItem!==item) {
            that.onItemDropped(item, that.dragItem);
            that.setDropCssClasses(eListItem, NOT_DROP_TARGET);
        }
        event.preventDefault();
    });

    eListItem.addEventListener('dragover', function() {
        if (that.dragItem && that.dragItem!==item) {
            if (that.dragAfterThisItem(item)) {
                that.setDropCssClasses(eListItem, DROP_TARGET_ABOVE);
            } else {
                that.setDropCssClasses(eListItem, DROP_TARGET_BELOW);
            }
        }
        event.preventDefault();
    });

    eListItem.addEventListener('dragleave', function(event) {
        that.setDropCssClasses(eListItem, NOT_DROP_TARGET);
        event.preventDefault();
    });

    eListItem.addEventListener('dragstart', function() {
        that.setDragCssClasses(eListItem, true);
        that.dragItem = item;
    });

    eListItem.addEventListener('dragend', function() {
        that.setDragCssClasses(eListItem, false);
        that.dragItem = null;
    });
};

CheckboxSelection.prototype.onItemDropped = function(targetColumn, draggedColumn) {
    var oldIndex = this.model.indexOf(draggedColumn);
    var newIndex = this.model.indexOf(targetColumn);

    this.model.splice(oldIndex, 1);
    this.model.splice(newIndex, 0, draggedColumn);

    this.drawListItems();
    this.fireItemMoved();
};

CheckboxSelection.prototype.addChangeListener = function(eListItem, eCheckbox, item) {
    var that = this;
    eListItem.addEventListener('click', function() {
        var selected = !that.isSelected(item);
        that.styleListItemSelected(eListItem, eCheckbox, selected);
        that.itemProxy.setSelected(item, selected);
    });
};

CheckboxSelection.prototype.setSelected = function(item, selected) {
    return this.itemProxy.setSelected(item, selected);
};

CheckboxSelection.prototype.isSelected = function(item) {
    return this.itemProxy.isSelected(item);
};

CheckboxSelection.prototype.getText = function(item) {
    return this.itemProxy.getText(item);
};

CheckboxSelection.prototype.getGui = function() {
    return this.eGui;
};

module.exports = CheckboxSelection;

},{"../utils":31,"./checkboxSelection.html":32}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9jZWxsUmVuZGVyZXJzL2dyb3VwQ2VsbFJlbmRlcmVyRmFjdG9yeS5qcyIsInNyYy9qcy9jb2x1bW5Db250cm9sbGVyLmpzIiwic3JjL2pzL2NvbnN0YW50cy5qcyIsInNyYy9qcy9leHByZXNzaW9uU2VydmljZS5qcyIsInNyYy9qcy9maWx0ZXIvZmlsdGVyTWFuYWdlci5qcyIsInNyYy9qcy9maWx0ZXIvbnVtYmVyRmlsdGVyLmh0bWwiLCJzcmMvanMvZmlsdGVyL251bWJlckZpbHRlci5qcyIsInNyYy9qcy9maWx0ZXIvc2V0RmlsdGVyLmh0bWwiLCJzcmMvanMvZmlsdGVyL3NldEZpbHRlci5qcyIsInNyYy9qcy9maWx0ZXIvc2V0RmlsdGVyTW9kZWwuanMiLCJzcmMvanMvZmlsdGVyL3RleHRGaWx0ZXIuaHRtbCIsInNyYy9qcy9maWx0ZXIvdGV4dEZpbHRlci5qcyIsInNyYy9qcy9ncmlkLmh0bWwiLCJzcmMvanMvZ3JpZC5qcyIsInNyYy9qcy9ncmlkTm9TY3JvbGxzLmh0bWwiLCJzcmMvanMvZ3JpZE9wdGlvbnNXcmFwcGVyLmpzIiwic3JjL2pzL2dyb3VwQ3JlYXRvci5qcyIsInNyYy9qcy9oZWFkZXJSZW5kZXJlci5qcyIsInNyYy9qcy9yb3dDb250cm9sbGVycy9pbk1lbW9yeVJvd0NvbnRyb2xsZXIuanMiLCJzcmMvanMvcm93Q29udHJvbGxlcnMvcGFnaW5hdGlvbkNvbnRyb2xsZXIuanMiLCJzcmMvanMvcm93Q29udHJvbGxlcnMvcGFnaW5hdGlvblBhbmVsLmh0bWwiLCJzcmMvanMvcm93Q29udHJvbGxlcnMvdmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLmpzIiwic3JjL2pzL3Jvd1JlbmRlcmVyLmpzIiwic3JjL2pzL3NlbGVjdGlvbkNvbnRyb2xsZXIuanMiLCJzcmMvanMvc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LmpzIiwic3JjL2pzL3N2Z0ZhY3RvcnkuanMiLCJzcmMvanMvdGVtcGxhdGVTZXJ2aWNlLmpzIiwic3JjL2pzL3Rvb2xQYW5lbC9jb2x1bW5TZWxlY3Rpb25QYW5lbC5qcyIsInNyYy9qcy90b29sUGFuZWwvdG9vbFBhbmVsLmpzIiwic3JjL2pzL3V0aWxzLmpzIiwic3JjL2pzL3dpZGdldHMvY2hlY2tib3hTZWxlY3Rpb24uaHRtbCIsInNyYy9qcy93aWRnZXRzL2NoZWNrYm94U2VsZWN0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hTQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEtBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE5BO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNzVCQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2aEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9QQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDemJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BXQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIEFuZ3VsYXIgR3JpZFxyXG4vLyBXcml0dGVuIGJ5IE5pYWxsIENyb3NieVxyXG4vLyB3d3cuYW5ndWxhcmdyaWQuY29tXHJcbi8vXHJcbi8vIFZlcnNpb24gMS45LjJcclxuXHJcbihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCBvciBgZXhwb3J0c2BcclxuICAgIHZhciByb290ID0gdGhpcztcclxuICAgIHZhciBHcmlkID0gcmVxdWlyZSgnLi9ncmlkJyk7XHJcblxyXG4gICAgLy8gaWYgYW5ndWxhciBpcyBwcmVzZW50LCByZWdpc3RlciB0aGUgZGlyZWN0aXZlXHJcbiAgICBpZiAodHlwZW9mIGFuZ3VsYXIgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgdmFyIGFuZ3VsYXJNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShcImFuZ3VsYXJHcmlkXCIsIFtdKTtcclxuICAgICAgICBhbmd1bGFyTW9kdWxlLmRpcmVjdGl2ZShcImFuZ3VsYXJHcmlkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6IFwiQVwiLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckZWxlbWVudCcsICckc2NvcGUnLCAnJGNvbXBpbGUnLCBBbmd1bGFyRGlyZWN0aXZlQ29udHJvbGxlcl0sXHJcbiAgICAgICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXJHcmlkOiBcIj1cIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGFuZ3VsYXJNb2R1bGUuZGlyZWN0aXZlKFwiYWdHcmlkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6IFwiQVwiLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckZWxlbWVudCcsICckc2NvcGUnLCAnJGNvbXBpbGUnLCAnJGF0dHJzJywgQW5ndWxhckRpcmVjdGl2ZUNvbnRyb2xsZXJdLFxyXG4gICAgICAgICAgICAgICAgc2NvcGU6IHRydWVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XHJcbiAgICAgICAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXJHcmlkR2xvYmFsRnVuY3Rpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGV4cG9ydHMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZEdsb2JhbEZ1bmN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHJvb3QuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZEdsb2JhbEZ1bmN0aW9uO1xyXG5cclxuICAgIGZ1bmN0aW9uIEFuZ3VsYXJEaXJlY3RpdmVDb250cm9sbGVyKCRlbGVtZW50LCAkc2NvcGUsICRjb21waWxlLCAkYXR0cnMpIHtcclxuICAgICAgICB2YXIgZ3JpZE9wdGlvbnM7XHJcbiAgICAgICAgdmFyIHF1aWNrRmlsdGVyT25TY29wZTtcclxuICAgICAgICBpZiAoJGF0dHJzKSB7XHJcbiAgICAgICAgICAgIC8vIG5ldyBkaXJlY3RpdmUgb2YgYWctZ3JpZFxyXG4gICAgICAgICAgICB2YXIga2V5T2ZHcmlkSW5TY29wZSA9ICRhdHRycy5hZ0dyaWQ7XHJcbiAgICAgICAgICAgIHZhciBxdWlja0ZpbHRlck9uU2NvcGUgPSBrZXlPZkdyaWRJblNjb3BlICsgJy5xdWlja0ZpbHRlclRleHQnO1xyXG4gICAgICAgICAgICBncmlkT3B0aW9ucyA9ICRzY29wZS4kZXZhbChrZXlPZkdyaWRJblNjb3BlKTtcclxuICAgICAgICAgICAgaWYgKCFncmlkT3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiV0FSTklORyAtIGdyaWQgb3B0aW9ucyBmb3IgQW5ndWxhciBHcmlkIG5vdCBmb3VuZC4gUGxlYXNlIGVuc3VyZSB0aGUgYXR0cmlidXRlIGFnLWdyaWQgcG9pbnRzIHRvIGEgdmFsaWQgb2JqZWN0IG9uIHRoZSBzY29wZVwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIG9sZCBkaXJlY3RpdmUgb2YgYW5ndWxhci1ncmlkXHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIldBUk5JTkcgLSBEaXJlY3RpdmUgYW5ndWxhci1ncmlkIGlzIGRlcHJlY2F0ZWQsIHlvdSBzaG91bGQgdXNlIHRoZSBhZy1ncmlkIGRpcmVjdGl2ZSBpbnN0ZWFkLlwiKTtcclxuICAgICAgICAgICAgZ3JpZE9wdGlvbnMgPSAkc2NvcGUuYW5ndWxhckdyaWQ7XHJcbiAgICAgICAgICAgIHF1aWNrRmlsdGVyT25TY29wZSA9ICdhbmd1bGFyR3JpZC5xdWlja0ZpbHRlclRleHQnO1xyXG4gICAgICAgICAgICBpZiAoIWdyaWRPcHRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJXQVJOSU5HIC0gZ3JpZCBvcHRpb25zIGZvciBBbmd1bGFyIEdyaWQgbm90IGZvdW5kLiBQbGVhc2UgZW5zdXJlIHRoZSBhdHRyaWJ1dGUgYW5ndWxhci1ncmlkIHBvaW50cyB0byBhIHZhbGlkIG9iamVjdCBvbiB0aGUgc2NvcGVcIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBlR3JpZERpdiA9ICRlbGVtZW50WzBdO1xyXG4gICAgICAgIHZhciBncmlkID0gbmV3IEdyaWQoZUdyaWREaXYsIGdyaWRPcHRpb25zLCAkc2NvcGUsICRjb21waWxlLCBxdWlja0ZpbHRlck9uU2NvcGUpO1xyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKFwiJGRlc3Ryb3lcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGdyaWQuc2V0RmluaXNoZWQoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHbG9iYWwgRnVuY3Rpb24gLSB0aGlzIGZ1bmN0aW9uIGlzIHVzZWQgZm9yIGNyZWF0aW5nIGEgZ3JpZCwgb3V0c2lkZSBvZiBhbnkgQW5ndWxhckpTXHJcbiAgICBmdW5jdGlvbiBhbmd1bGFyR3JpZEdsb2JhbEZ1bmN0aW9uKGVsZW1lbnQsIGdyaWRPcHRpb25zKSB7XHJcbiAgICAgICAgLy8gc2VlIGlmIGVsZW1lbnQgaXMgYSBxdWVyeSBzZWxlY3Rvciwgb3IgYSByZWFsIGVsZW1lbnRcclxuICAgICAgICB2YXIgZUdyaWREaXY7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBlR3JpZERpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudCk7XHJcbiAgICAgICAgICAgIGlmICghZUdyaWREaXYpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXQVJOSU5HIC0gd2FzIG5vdCBhYmxlIHRvIGZpbmQgZWxlbWVudCAnICsgZWxlbWVudCArICcgaW4gdGhlIERPTSwgQW5ndWxhciBHcmlkIGluaXRpYWxpc2F0aW9uIGFib3J0ZWQuJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlR3JpZERpdiA9IGVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5ldyBHcmlkKGVHcmlkRGl2LCBncmlkT3B0aW9ucywgbnVsbCwgbnVsbCk7XHJcbiAgICB9XHJcblxyXG59KS5jYWxsKHdpbmRvdyk7XHJcbiIsInZhciBTdmdGYWN0b3J5ID0gcmVxdWlyZSgnLi4vc3ZnRmFjdG9yeScpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xyXG52YXIgY29uc3RhbnRzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJyk7XHJcbnZhciBzdmdGYWN0b3J5ID0gbmV3IFN2Z0ZhY3RvcnkoKTtcclxuXHJcbmZ1bmN0aW9uIGdyb3VwQ2VsbFJlbmRlcmVyRmFjdG9yeShncmlkT3B0aW9uc1dyYXBwZXIsIHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSkge1xyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbiBncm91cENlbGxSZW5kZXJlcihwYXJhbXMpIHtcclxuXHJcbiAgICAgICAgdmFyIGVHcm91cENlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBwYXJhbXMubm9kZTtcclxuXHJcbiAgICAgICAgdmFyIGNlbGxFeHBhbmRhYmxlID0gbm9kZS5ncm91cCAmJiAhbm9kZS5mb290ZXI7XHJcbiAgICAgICAgaWYgKGNlbGxFeHBhbmRhYmxlKSB7XHJcbiAgICAgICAgICAgIGFkZEV4cGFuZEFuZENvbnRyYWN0KGVHcm91cENlbGwsIHBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgY2hlY2tib3hOZWVkZWQgPSBwYXJhbXMuY29sRGVmICYmIHBhcmFtcy5jb2xEZWYuY2VsbFJlbmRlcmVyICYmIHBhcmFtcy5jb2xEZWYuY2VsbFJlbmRlcmVyLmNoZWNrYm94ICYmICFub2RlLmZvb3RlcjtcclxuICAgICAgICBpZiAoY2hlY2tib3hOZWVkZWQpIHtcclxuICAgICAgICAgICAgdmFyIGVDaGVja2JveCA9IHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeS5jcmVhdGVTZWxlY3Rpb25DaGVja2JveChub2RlLCBwYXJhbXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgICBlR3JvdXBDZWxsLmFwcGVuZENoaWxkKGVDaGVja2JveCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGFyYW1zLmNvbERlZiAmJiBwYXJhbXMuY29sRGVmLmNlbGxSZW5kZXJlciAmJiBwYXJhbXMuY29sRGVmLmNlbGxSZW5kZXJlci5pbm5lclJlbmRlcmVyKSB7XHJcbiAgICAgICAgICAgIGNyZWF0ZUZyb21Jbm5lclJlbmRlcmVyKGVHcm91cENlbGwsIHBhcmFtcywgcGFyYW1zLmNvbERlZi5jZWxsUmVuZGVyZXIuaW5uZXJSZW5kZXJlcik7XHJcbiAgICAgICAgfSBlbHNlIGlmIChub2RlLmZvb3Rlcikge1xyXG4gICAgICAgICAgICBjcmVhdGVGb290ZXJDZWxsKGVHcm91cENlbGwsIHBhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIGNyZWF0ZUdyb3VwQ2VsbChlR3JvdXBDZWxsLCBwYXJhbXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNyZWF0ZUxlYWZDZWxsKGVHcm91cENlbGwsIHBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBvbmx5IGRvIHRoaXMgaWYgYW4gaW5kZW50IC0gYXMgdGhpcyBvdmVyd3JpdGVzIHRoZSBwYWRkaW5nIHRoYXRcclxuICAgICAgICAvLyB0aGUgdGhlbWUgc2V0LCB3aGljaCB3aWxsIG1ha2UgdGhpbmdzIGxvb2sgJ25vdCBhbGlnbmVkJyBmb3IgdGhlXHJcbiAgICAgICAgLy8gZmlyc3QgZ3JvdXAgbGV2ZWwuXHJcbiAgICAgICAgaWYgKG5vZGUuZm9vdGVyIHx8IG5vZGUubGV2ZWwgPiAwKSB7XHJcbiAgICAgICAgICAgIHZhciBwYWRkaW5nUHggPSBub2RlLmxldmVsICogMTA7XHJcbiAgICAgICAgICAgIGlmIChub2RlLmZvb3Rlcikge1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZ1B4ICs9IDEwO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nUHggKz0gNTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlR3JvdXBDZWxsLnN0eWxlLnBhZGRpbmdMZWZ0ID0gcGFkZGluZ1B4ICsgJ3B4JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBlR3JvdXBDZWxsO1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBhZGRFeHBhbmRBbmRDb250cmFjdChlR3JvdXBDZWxsLCBwYXJhbXMpIHtcclxuXHJcbiAgICAgICAgdmFyIGVFeHBhbmRJY29uID0gY3JlYXRlR3JvdXBFeHBhbmRJY29uKHRydWUpO1xyXG4gICAgICAgIHZhciBlQ29udHJhY3RJY29uID0gY3JlYXRlR3JvdXBFeHBhbmRJY29uKGZhbHNlKTtcclxuICAgICAgICBlR3JvdXBDZWxsLmFwcGVuZENoaWxkKGVFeHBhbmRJY29uKTtcclxuICAgICAgICBlR3JvdXBDZWxsLmFwcGVuZENoaWxkKGVDb250cmFjdEljb24pO1xyXG5cclxuICAgICAgICBlRXhwYW5kSWNvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV4cGFuZE9yQ29udHJhY3QpO1xyXG4gICAgICAgIGVDb250cmFjdEljb24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBleHBhbmRPckNvbnRyYWN0KTtcclxuICAgICAgICBlR3JvdXBDZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2RibGNsaWNrJywgZXhwYW5kT3JDb250cmFjdCk7XHJcblxyXG4gICAgICAgIHNob3dBbmRIaWRlRXhwYW5kQW5kQ29udHJhY3QoZUV4cGFuZEljb24sIGVDb250cmFjdEljb24sIHBhcmFtcy5ub2RlLmV4cGFuZGVkKTtcclxuXHJcbiAgICAgICAgLy8gaWYgcGFyZW50IGNlbGwgd2FzIHBhc3NlZCwgdGhlbiB3ZSBjYW4gbGlzdGVuIGZvciB3aGVuIGZvY3VzIGlzIG9uIHRoZSBjZWxsLFxyXG4gICAgICAgIC8vIGFuZCB0aGVuIGV4cGFuZCAvIGNvbnRyYWN0IGFzIHRoZSB1c2VyIGhpdHMgZW50ZXIgb3Igc3BhY2UtYmFyXHJcbiAgICAgICAgaWYgKHBhcmFtcy5lR3JpZENlbGwpIHtcclxuICAgICAgICAgICAgcGFyYW1zLmVHcmlkQ2VsbC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGlmICh1dGlscy5pc0tleVByZXNzZWQoZXZlbnQsIGNvbnN0YW50cy5LRVlfRU5URVIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwYW5kT3JDb250cmFjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZXhwYW5kT3JDb250cmFjdCgpIHtcclxuICAgICAgICAgICAgZXhwYW5kR3JvdXAoZUV4cGFuZEljb24sIGVDb250cmFjdEljb24sIHBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNob3dBbmRIaWRlRXhwYW5kQW5kQ29udHJhY3QoZUV4cGFuZEljb24sIGVDb250cmFjdEljb24sIGV4cGFuZGVkKSB7XHJcbiAgICAgICAgdXRpbHMuc2V0VmlzaWJsZShlRXhwYW5kSWNvbiwgIWV4cGFuZGVkKTtcclxuICAgICAgICB1dGlscy5zZXRWaXNpYmxlKGVDb250cmFjdEljb24sIGV4cGFuZGVkKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVGcm9tSW5uZXJSZW5kZXJlcihlR3JvdXBDZWxsLCBwYXJhbXMsIHJlbmRlcmVyKSB7XHJcbiAgICAgICAgdXRpbHMudXNlUmVuZGVyZXIoZUdyb3VwQ2VsbCwgcmVuZGVyZXIsIHBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZXhwYW5kR3JvdXAoZUV4cGFuZEljb24sIGVDb250cmFjdEljb24sIHBhcmFtcykge1xyXG4gICAgICAgIHBhcmFtcy5ub2RlLmV4cGFuZGVkID0gIXBhcmFtcy5ub2RlLmV4cGFuZGVkO1xyXG4gICAgICAgIHBhcmFtcy5hcGkub25Hcm91cEV4cGFuZGVkT3JDb2xsYXBzZWQocGFyYW1zLnJvd0luZGV4ICsgMSk7XHJcbiAgICAgICAgc2hvd0FuZEhpZGVFeHBhbmRBbmRDb250cmFjdChlRXhwYW5kSWNvbiwgZUNvbnRyYWN0SWNvbiwgcGFyYW1zLm5vZGUuZXhwYW5kZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUdyb3VwRXhwYW5kSWNvbihleHBhbmRlZCkge1xyXG4gICAgICAgIGlmIChleHBhbmRlZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdXRpbHMuY3JlYXRlSWNvbignZ3JvdXBDb250cmFjdGVkJywgZ3JpZE9wdGlvbnNXcmFwcGVyLCBudWxsLCBzdmdGYWN0b3J5LmNyZWF0ZUFycm93UmlnaHRTdmcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1dGlscy5jcmVhdGVJY29uKCdncm91cEV4cGFuZGVkJywgZ3JpZE9wdGlvbnNXcmFwcGVyLCBudWxsLCBzdmdGYWN0b3J5LmNyZWF0ZUFycm93RG93blN2Zyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNyZWF0ZXMgY2VsbCB3aXRoICdUb3RhbCB7e2tleX19JyBmb3IgYSBncm91cFxyXG4gICAgZnVuY3Rpb24gY3JlYXRlRm9vdGVyQ2VsbChlR3JvdXBDZWxsLCBwYXJhbXMpIHtcclxuICAgICAgICB2YXIgdGV4dFRvRGlzcGxheSA9IFwiVG90YWwgXCIgKyBnZXRHcm91cE5hbWUocGFyYW1zKTtcclxuICAgICAgICB2YXIgZVRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0VG9EaXNwbGF5KTtcclxuICAgICAgICBlR3JvdXBDZWxsLmFwcGVuZENoaWxkKGVUZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRHcm91cE5hbWUocGFyYW1zKSB7XHJcbiAgICAgICAgdmFyIGNlbGxSZW5kZXJlciA9IHBhcmFtcy5jb2xEZWYuY2VsbFJlbmRlcmVyO1xyXG4gICAgICAgIGlmIChjZWxsUmVuZGVyZXIgJiYgY2VsbFJlbmRlcmVyLmtleU1hcFxyXG4gICAgICAgICAgICAmJiB0eXBlb2YgY2VsbFJlbmRlcmVyLmtleU1hcCA9PT0gJ29iamVjdCcgJiYgcGFyYW1zLmNvbERlZi5jZWxsUmVuZGVyZXIgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdmFyIHZhbHVlRnJvbU1hcCA9IGNlbGxSZW5kZXJlci5rZXlNYXBbcGFyYW1zLm5vZGUua2V5XTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlRnJvbU1hcCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlRnJvbU1hcDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwYXJhbXMubm9kZS5rZXk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gcGFyYW1zLm5vZGUua2V5O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBjcmVhdGVzIGNlbGwgd2l0aCAne3trZXl9fSAoe3tjaGlsZENvdW50fX0pJyBmb3IgYSBncm91cFxyXG4gICAgZnVuY3Rpb24gY3JlYXRlR3JvdXBDZWxsKGVHcm91cENlbGwsIHBhcmFtcykge1xyXG4gICAgICAgIHZhciB0ZXh0VG9EaXNwbGF5ID0gXCIgXCIgKyBnZXRHcm91cE5hbWUocGFyYW1zKTtcclxuICAgICAgICAvLyBvbmx5IGluY2x1ZGUgdGhlIGNoaWxkIGNvdW50IGlmIGl0J3MgaW5jbHVkZWQsIGVnIGlmIHVzZXIgZG9pbmcgY3VzdG9tIGFnZ3JlZ2F0aW9uLFxyXG4gICAgICAgIC8vIHRoZW4gdGhpcyBjb3VsZCBiZSBsZWZ0IG91dCwgb3Igc2V0IHRvIC0xLCBpZSBubyBjaGlsZCBjb3VudFxyXG4gICAgICAgIHZhciBzdXBwcmVzc0NvdW50ID0gcGFyYW1zLmNvbERlZi5jZWxsUmVuZGVyZXIgJiYgcGFyYW1zLmNvbERlZi5jZWxsUmVuZGVyZXIuc3VwcHJlc3NDb3VudDtcclxuICAgICAgICBpZiAoIXN1cHByZXNzQ291bnQgJiYgcGFyYW1zLm5vZGUuYWxsQ2hpbGRyZW5Db3VudCA+PSAwKSB7XHJcbiAgICAgICAgICAgIHRleHRUb0Rpc3BsYXkgKz0gXCIgKFwiICsgcGFyYW1zLm5vZGUuYWxsQ2hpbGRyZW5Db3VudCArIFwiKVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZVRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0VG9EaXNwbGF5KTtcclxuICAgICAgICBlR3JvdXBDZWxsLmFwcGVuZENoaWxkKGVUZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjcmVhdGVzIGNlbGwgd2l0aCAne3trZXl9fSAoe3tjaGlsZENvdW50fX0pJyBmb3IgYSBncm91cFxyXG4gICAgZnVuY3Rpb24gY3JlYXRlTGVhZkNlbGwoZVBhcmVudCwgcGFyYW1zKSB7XHJcbiAgICAgICAgaWYgKHBhcmFtcy52YWx1ZSkge1xyXG4gICAgICAgICAgICB2YXIgZVRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnICcgKyBwYXJhbXMudmFsdWUpO1xyXG4gICAgICAgICAgICBlUGFyZW50LmFwcGVuZENoaWxkKGVUZXh0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZ3JvdXBDZWxsUmVuZGVyZXJGYWN0b3J5OyIsInZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcblxyXG5mdW5jdGlvbiBDb2x1bW5Db250cm9sbGVyKCkge1xyXG4gICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcclxuICAgIHRoaXMuY3JlYXRlTW9kZWwoKTtcclxufVxyXG5cclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGFuZ3VsYXJHcmlkLCBzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnksIGdyaWRPcHRpb25zV3JhcHBlciwgZXhwcmVzc2lvblNlcnZpY2UpIHtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyID0gZ3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkO1xyXG4gICAgdGhpcy5zZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkgPSBzZWxlY3Rpb25SZW5kZXJlckZhY3Rvcnk7XHJcbiAgICB0aGlzLmV4cHJlc3Npb25TZXJ2aWNlID0gZXhwcmVzc2lvblNlcnZpY2U7XHJcbn07XHJcblxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5jcmVhdGVNb2RlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5tb2RlbCA9IHtcclxuICAgICAgICAvLyB1c2VkIGJ5OlxyXG4gICAgICAgIC8vICsgaW5NZW1vcnlSb3dDb250cm9sbGVyIC0+IHNvcnRpbmcsIGJ1aWxkaW5nIHF1aWNrIGZpbHRlciB0ZXh0XHJcbiAgICAgICAgLy8gKyBoZWFkZXJSZW5kZXJlciAtPiBzb3J0aW5nIChjbGVhcmluZyBpY29uKVxyXG4gICAgICAgIGdldEFsbENvbHVtbnM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5jb2x1bW5zO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gKyByb3dDb250cm9sbGVyIC0+IHdoaWxlIGluc2VydGluZyByb3dzLCBhbmQgd2hlbiB0YWJiaW5nIHRocm91Z2ggY2VsbHMgKG5lZWQgdG8gY2hhbmdlIHRoaXMpXHJcbiAgICAgICAgLy8gbmVlZCBhIG5ld01ldGhvZCAtIGdldCBuZXh0IGNvbCBpbmRleFxyXG4gICAgICAgIGdldERpc3BsYXllZENvbHVtbnM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5kaXNwbGF5ZWRDb2x1bW5zO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gdXNlZCBieTpcclxuICAgICAgICAvLyArIGFuZ3VsYXJHcmlkIC0+IGZvciBzZXR0aW5nIGJvZHkgd2lkdGhcclxuICAgICAgICAvLyArIHJvd0NvbnRyb2xsZXIgLT4gc2V0dGluZyBtYWluIHJvdyB3aWR0aHMgKHdoZW4gaW5zZXJ0aW5nIGFuZCByZXNpemluZylcclxuICAgICAgICBnZXRCb2R5Q29udGFpbmVyV2lkdGg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5nZXRUb3RhbENvbFdpZHRoKGZhbHNlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIHVzZWQgYnk6XHJcbiAgICAgICAgLy8gKyBhbmd1bGFyR3JpZCAtPiBzZXR0aW5nIHBpbm5lZCBib2R5IHdpZHRoXHJcbiAgICAgICAgZ2V0UGlubmVkQ29udGFpbmVyV2lkdGg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5nZXRUb3RhbENvbFdpZHRoKHRydWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gdXNlZCBieTpcclxuICAgICAgICAvLyArIGhlYWRlclJlbmRlcmVyIC0+IHNldHRpbmcgcGlubmVkIGJvZHkgd2lkdGhcclxuICAgICAgICBnZXRDb2x1bW5Hcm91cHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5jb2x1bW5Hcm91cHM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyB1c2VkIGJ5OlxyXG4gICAgICAgIC8vICsgYXBpLmdldEZpbHRlck1vZGVsKCkgLT4gdG8gbWFwIGNvbERlZiB0byBjb2x1bW4sIGtleSBjYW4gYmUgY29sRGVmIG9yIGZpZWxkXHJcbiAgICAgICAgZ2V0Q29sdW1uOiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGk8dGhhdC5jb2x1bW5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29sRGVmTWF0Y2hlcyA9IHRoYXQuY29sdW1uc1tpXS5jb2xEZWYgPT09IGtleTtcclxuICAgICAgICAgICAgICAgIHZhciBmaWVsZE1hdGNoZXMgPSB0aGF0LmNvbHVtbnNbaV0uY29sRGVmLmZpZWxkID09PSBrZXk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29sRGVmTWF0Y2hlcyB8fCBmaWVsZE1hdGNoZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhhdC5jb2x1bW5zW2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyB1c2VkIGJ5OlxyXG4gICAgICAgIC8vICsgcm93UmVuZGVyZXIgLT4gZm9yIG5hdmlnYXRpb25cclxuICAgICAgICBnZXRWaXNpYmxlQ29sQmVmb3JlOiBmdW5jdGlvbihjb2wpIHtcclxuICAgICAgICAgICAgdmFyIG9sZEluZGV4ID0gdGhhdC52aXNpYmxlQ29sdW1ucy5pbmRleE9mKGNvbCk7XHJcbiAgICAgICAgICAgIGlmIChvbGRJbmRleCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGF0LnZpc2libGVDb2x1bW5zW29sZEluZGV4IC0gMV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gdXNlZCBieTpcclxuICAgICAgICAvLyArIHJvd1JlbmRlcmVyIC0+IGZvciBuYXZpZ2F0aW9uXHJcbiAgICAgICAgZ2V0VmlzaWJsZUNvbEFmdGVyOiBmdW5jdGlvbihjb2wpIHtcclxuICAgICAgICAgICAgdmFyIG9sZEluZGV4ID0gdGhhdC52aXNpYmxlQ29sdW1ucy5pbmRleE9mKGNvbCk7XHJcbiAgICAgICAgICAgIGlmIChvbGRJbmRleCA8ICh0aGF0LnZpc2libGVDb2x1bW5zLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhhdC52aXNpYmxlQ29sdW1uc1tvbGRJbmRleCArIDFdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldERpc3BsYXlOYW1lRm9yQ29sOiBmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZ2V0RGlzcGxheU5hbWVGb3JDb2woY29sdW1uKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0RGlzcGxheU5hbWVGb3JDb2wgPSBmdW5jdGlvbihjb2x1bW4pIHtcclxuXHJcbiAgICB2YXIgY29sRGVmID0gY29sdW1uLmNvbERlZjtcclxuICAgIHZhciBoZWFkZXJWYWx1ZUdldHRlciA9IGNvbERlZi5oZWFkZXJWYWx1ZUdldHRlcjtcclxuXHJcbiAgICBpZiAoaGVhZGVyVmFsdWVHZXR0ZXIpIHtcclxuICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKSxcclxuICAgICAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBoZWFkZXJWYWx1ZUdldHRlciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAvLyB2YWx1ZUdldHRlciBpcyBhIGZ1bmN0aW9uLCBzbyBqdXN0IGNhbGwgaXRcclxuICAgICAgICAgICAgcmV0dXJuIGhlYWRlclZhbHVlR2V0dGVyKHBhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaGVhZGVyVmFsdWVHZXR0ZXIgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIC8vIHZhbHVlR2V0dGVyIGlzIGFuIGV4cHJlc3Npb24sIHNvIGV4ZWN1dGUgdGhlIGV4cHJlc3Npb25cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhwcmVzc2lvblNlcnZpY2UuZXZhbHVhdGUoaGVhZGVyVmFsdWVHZXR0ZXIsIHBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdXRpbHMuZ2V0VmFsdWUodGhpcy5leHByZXNzaW9uU2VydmljZSwgdW5kZWZpbmVkLCBjb2xEZWYsIHVuZGVmaW5lZCwgYXBpLCBjb250ZXh0KTtcclxuICAgIH0gZWxzZSBpZiAoY29sRGVmLmRpc3BsYXlOYW1lKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKFwiYWctZ3JpZDogRm91bmQgZGlzcGxheU5hbWUgXCIgKyBjb2xEZWYuZGlzcGxheU5hbWUgKyBcIiwgcGxlYXNlIHVzZSBoZWFkZXJOYW1lIGluc3RlYWQsIGRpc3BsYXlOYW1lIGlzIGRlcHJlY2F0ZWQuXCIpO1xyXG4gICAgICAgIHJldHVybiBjb2xEZWYuZGlzcGxheU5hbWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBjb2xEZWYuaGVhZGVyTmFtZTtcclxuICAgIH1cclxufTtcclxuXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24obGlzdGVuZXIpIHtcclxuICAgIHRoaXMubGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xyXG59O1xyXG5cclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuZmlyZUNvbHVtbnNDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaTx0aGlzLmxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzW2ldLmNvbHVtbnNDaGFuZ2VkKHRoaXMuY29sdW1ucyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5nZXRNb2RlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubW9kZWw7XHJcbn07XHJcblxyXG4vLyBjYWxsZWQgYnkgYW5ndWxhckdyaWRcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuc2V0Q29sdW1ucyA9IGZ1bmN0aW9uKGNvbHVtbkRlZnMpIHtcclxuICAgIHRoaXMuY3JlYXRlQ29sdW1ucyhjb2x1bW5EZWZzKTtcclxuICAgIHRoaXMudXBkYXRlTW9kZWwoKTtcclxuICAgIHRoaXMuZmlyZUNvbHVtbnNDaGFuZ2VkKCk7XHJcbn07XHJcblxyXG4vLyBjYWxsZWQgYnkgaGVhZGVyUmVuZGVyZXIgLSB3aGVuIGEgaGVhZGVyIGlzIG9wZW5lZCBvciBjbG9zZWRcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuY29sdW1uR3JvdXBPcGVuZWQgPSBmdW5jdGlvbihncm91cCkge1xyXG4gICAgZ3JvdXAuZXhwYW5kZWQgPSAhZ3JvdXAuZXhwYW5kZWQ7XHJcbiAgICB0aGlzLnVwZGF0ZUdyb3VwcygpO1xyXG4gICAgdGhpcy51cGRhdGVEaXNwbGF5ZWRDb2x1bW5zKCk7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkLnJlZnJlc2hIZWFkZXJBbmRCb2R5KCk7XHJcbn07XHJcblxyXG4vLyBjYWxsZWQgYnkgdG9vbFBhbmVsIC0gd2hlbiBjaGFuZ2UgaW4gY29sdW1ucyBoYXBwZW5zXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLm9uQ29sdW1uU3RhdGVDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnVwZGF0ZU1vZGVsKCk7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkLnJlZnJlc2hIZWFkZXJBbmRCb2R5KCk7XHJcbn07XHJcblxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVNb2RlbD0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnVwZGF0ZVZpc2libGVDb2x1bW5zKCk7XHJcbiAgICB0aGlzLnVwZGF0ZVBpbm5lZENvbHVtbnMoKTtcclxuICAgIHRoaXMuYnVpbGRHcm91cHMoKTtcclxuICAgIHRoaXMudXBkYXRlR3JvdXBzKCk7XHJcbiAgICB0aGlzLnVwZGF0ZURpc3BsYXllZENvbHVtbnMoKTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlRGlzcGxheWVkQ29sdW1ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5kaXNwbGF5ZWRDb2x1bW5zID0gW107XHJcblxyXG4gICAgaWYgKCF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwSGVhZGVycygpKSB7XHJcbiAgICAgICAgLy8gaWYgbm90IGdyb3VwaW5nIGJ5IGhlYWRlcnMsIHRoZW4gcHVsbCB2aXNpYmxlIGNvbHNcclxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuY29sdW1ucy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICB2YXIgY29sdW1uID0gdGhpcy5jb2x1bW5zW2pdO1xyXG4gICAgICAgICAgICBpZiAoY29sdW1uLnZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheWVkQ29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGlmIGdyb3VwaW5nLCB0aGVuIG9ubHkgc2hvdyBjb2wgYXMgcGVyIGdyb3VwIHJ1bGVzXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbHVtbkdyb3Vwcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgZ3JvdXAgPSB0aGlzLmNvbHVtbkdyb3Vwc1tpXTtcclxuICAgICAgICAgICAgZ3JvdXAuYWRkVG9WaXNpYmxlQ29sdW1ucyh0aGlzLmRpc3BsYXllZENvbHVtbnMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn07XHJcblxyXG4vLyBwdWJsaWMgLSBjYWxsZWQgZnJvbSBhcGlcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuc2l6ZUNvbHVtbnNUb0ZpdCA9IGZ1bmN0aW9uKGdyaWRXaWR0aCkge1xyXG4gICAgLy8gYXZvaWQgZGl2aWRlIGJ5IHplcm9cclxuICAgIGlmIChncmlkV2lkdGggPD0gMCB8fCB0aGlzLmRpc3BsYXllZENvbHVtbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjb2x1bW5TdGFydFdpZHRoID0gMDsgLy8gd2lsbCBjb250YWluIHRoZSBzdGFydGluZyB0b3RhbCB3aWR0aCBvZiB0aGUgY29scyBiZWVuIHNwcmVhZFxyXG4gICAgdmFyIGNvbHNUb1NwcmVhZCA9IFtdOyAvLyBhbGwgdmlzaWJsZSBjb2xzLCBleGNlcHQgdGhvc2Ugd2l0aCBhdm9pZFNpemVUb0ZpdFxyXG4gICAgdmFyIHdpZHRoRm9yU3ByZWFkaW5nID0gZ3JpZFdpZHRoOyAvLyBncmlkIHdpZHRoIG1pbnVzIHRoZSBjb2x1bW5zIHdlIGFyZSBub3QgcmVzaXppbmdcclxuXHJcbiAgICAvLyBnZXQgdGhlIGxpc3Qgb2YgY29scyB0byB3b3JrIHdpdGhcclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5kaXNwbGF5ZWRDb2x1bW5zLmxlbmd0aCA7IGorKykge1xyXG4gICAgICAgIGlmICh0aGlzLmRpc3BsYXllZENvbHVtbnNbal0uY29sRGVmLnN1cHByZXNzU2l6ZVRvRml0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIC8vIGRvbid0IGluY2x1ZGUgY29sLCBhbmQgcmVtb3ZlIHRoZSB3aWR0aCBmcm9tIHRlaCBhdmFpbGFibGUgd2lkdGhcclxuICAgICAgICAgICAgd2lkdGhGb3JTcHJlYWRpbmcgLT0gdGhpcy5kaXNwbGF5ZWRDb2x1bW5zW2pdLmFjdHVhbFdpZHRoO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGluY2x1ZGUgdGhlIGNvbFxyXG4gICAgICAgICAgICBjb2xzVG9TcHJlYWQucHVzaCh0aGlzLmRpc3BsYXllZENvbHVtbnNbal0pO1xyXG4gICAgICAgICAgICBjb2x1bW5TdGFydFdpZHRoICs9IHRoaXMuZGlzcGxheWVkQ29sdW1uc1tqXS5hY3R1YWxXaWR0aDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgbm8gd2lkdGggbGVmdCBvdmVyIHRvIHNwcmVhZCB3aXRoLCBkbyBub3RoaW5nXHJcbiAgICBpZiAod2lkdGhGb3JTcHJlYWRpbmcgPD0gMCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2NhbGUgPSB3aWR0aEZvclNwcmVhZGluZyAvIGNvbHVtblN0YXJ0V2lkdGg7XHJcbiAgICB2YXIgcGl4ZWxzRm9yTGFzdENvbCA9IHdpZHRoRm9yU3ByZWFkaW5nO1xyXG5cclxuICAgIC8vIHNpemUgYWxsIGNvbHMgZXhjZXB0IHRoZSBsYXN0IGJ5IHRoZSBzY2FsZVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAoY29sc1RvU3ByZWFkLmxlbmd0aCAtIDEpOyBpKyspIHtcclxuICAgICAgICB2YXIgY29sdW1uID0gY29sc1RvU3ByZWFkW2ldO1xyXG4gICAgICAgIHZhciBuZXdXaWR0aCA9IHBhcnNlSW50KGNvbHVtbi5hY3R1YWxXaWR0aCAqIHNjYWxlKTtcclxuICAgICAgICBjb2x1bW4uYWN0dWFsV2lkdGggPSBuZXdXaWR0aDtcclxuICAgICAgICBwaXhlbHNGb3JMYXN0Q29sIC09IG5ld1dpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHNpemUgdGhlIGxhc3QgYnkgd2hhdHMgcmVtYWluaW5nICh0aGlzIGF2b2lkcyByb3VuZGluZyBlcnJvcnMgdGhhdCBjb3VsZFxyXG4gICAgLy8gb2NjdXIgd2l0aCBzY2FsaW5nIGV2ZXJ5dGhpbmcsIHdoZXJlIGl0IHJlc3VsdCBpbiBzb21lIHBpeGVscyBvZmYpXHJcbiAgICB2YXIgbGFzdENvbHVtbiA9IGNvbHNUb1NwcmVhZFtjb2xzVG9TcHJlYWQubGVuZ3RoIC0gMV07XHJcbiAgICBsYXN0Q29sdW1uLmFjdHVhbFdpZHRoID0gcGl4ZWxzRm9yTGFzdENvbDtcclxuXHJcbiAgICAvLyB3aWR0aHMgc2V0LCByZWZyZXNoIHRoZSBndWlcclxuICAgIHRoaXMuYW5ndWxhckdyaWQucmVmcmVzaEhlYWRlckFuZEJvZHkoKTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuYnVpbGRHcm91cHMgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGlmIG5vdCBncm91cGluZyBieSBoZWFkZXJzLCBkbyBub3RoaW5nXHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBIZWFkZXJzKCkpIHtcclxuICAgICAgICB0aGlzLmNvbHVtbkdyb3VwcyA9IG51bGw7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHNwbGl0IHRoZSBjb2x1bW5zIGludG8gZ3JvdXBzXHJcbiAgICB2YXIgY3VycmVudEdyb3VwID0gbnVsbDtcclxuICAgIHRoaXMuY29sdW1uR3JvdXBzID0gW107XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgdmFyIGxhc3RDb2xXYXNQaW5uZWQgPSB0cnVlO1xyXG5cclxuICAgIHRoaXMudmlzaWJsZUNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgICAgICAvLyBkbyB3ZSBuZWVkIGEgbmV3IGdyb3VwLCBiZWNhdXNlIHdlIG1vdmUgZnJvbSBwaW5uZWQgdG8gbm9uLXBpbm5lZCBjb2x1bW5zP1xyXG4gICAgICAgIHZhciBlbmRPZlBpbm5lZEhlYWRlciA9IGxhc3RDb2xXYXNQaW5uZWQgJiYgIWNvbHVtbi5waW5uZWQ7XHJcbiAgICAgICAgaWYgKCFjb2x1bW4ucGlubmVkKSB7XHJcbiAgICAgICAgICAgIGxhc3RDb2xXYXNQaW5uZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZG8gd2UgbmVlZCBhIG5ldyBncm91cCwgYmVjYXVzZSB0aGUgZ3JvdXAgbmFtZXMgZG9lc24ndCBtYXRjaCBmcm9tIHByZXZpb3VzIGNvbD9cclxuICAgICAgICB2YXIgZ3JvdXBLZXlNaXNtYXRjaCA9IGN1cnJlbnRHcm91cCAmJiBjb2x1bW4uY29sRGVmLmdyb3VwICE9PSBjdXJyZW50R3JvdXAubmFtZTtcclxuICAgICAgICAvLyB3ZSBkb24ndCBncm91cCBjb2x1bW5zIHdoZXJlIG5vIGdyb3VwIGlzIHNwZWNpZmllZFxyXG4gICAgICAgIHZhciBjb2xOb3RJbkdyb3VwID0gY3VycmVudEdyb3VwICYmICFjdXJyZW50R3JvdXAubmFtZTtcclxuICAgICAgICAvLyBkbyB3ZSBuZWVkIGEgbmV3IGdyb3VwLCBiZWNhdXNlIHdlIGFyZSBqdXN0IHN0YXJ0aW5nXHJcbiAgICAgICAgdmFyIHByb2Nlc3NpbmdGaXJzdENvbCA9IGN1cnJlbnRHcm91cCA9PT0gbnVsbDtcclxuICAgICAgICB2YXIgbmV3R3JvdXBOZWVkZWQgPSBwcm9jZXNzaW5nRmlyc3RDb2wgfHwgZW5kT2ZQaW5uZWRIZWFkZXIgfHwgZ3JvdXBLZXlNaXNtYXRjaCB8fCBjb2xOb3RJbkdyb3VwO1xyXG4gICAgICAgIC8vIGNyZWF0ZSBuZXcgZ3JvdXAsIGlmIGl0J3MgbmVlZGVkXHJcbiAgICAgICAgaWYgKG5ld0dyb3VwTmVlZGVkKSB7XHJcbiAgICAgICAgICAgIHZhciBwaW5uZWQgPSBjb2x1bW4ucGlubmVkO1xyXG4gICAgICAgICAgICBjdXJyZW50R3JvdXAgPSBuZXcgQ29sdW1uR3JvdXAocGlubmVkLCBjb2x1bW4uY29sRGVmLmdyb3VwKTtcclxuICAgICAgICAgICAgdGhhdC5jb2x1bW5Hcm91cHMucHVzaChjdXJyZW50R3JvdXApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjdXJyZW50R3JvdXAuYWRkQ29sdW1uKGNvbHVtbik7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlR3JvdXBzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBpZiBub3QgZ3JvdXBpbmcgYnkgaGVhZGVycywgZG8gbm90aGluZ1xyXG4gICAgaWYgKCF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwSGVhZGVycygpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb2x1bW5Hcm91cHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgZ3JvdXAgPSB0aGlzLmNvbHVtbkdyb3Vwc1tpXTtcclxuICAgICAgICBncm91cC5jYWxjdWxhdGVFeHBhbmRhYmxlKCk7XHJcbiAgICAgICAgZ3JvdXAuY2FsY3VsYXRlRGlzcGxheWVkQ29sdW1ucygpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVWaXNpYmxlQ29sdW1ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy52aXNpYmxlQ29sdW1ucyA9IFtdO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb2x1bW5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNvbHVtbiA9IHRoaXMuY29sdW1uc1tpXTtcclxuICAgICAgICBpZiAoY29sdW1uLnZpc2libGUpIHtcclxuICAgICAgICAgICAgY29sdW1uLmluZGV4ID0gaTtcclxuICAgICAgICAgICAgdGhpcy52aXNpYmxlQ29sdW1ucy5wdXNoKHRoaXMuY29sdW1uc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVQaW5uZWRDb2x1bW5zID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcGlubmVkQ29sdW1uQ291bnQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRQaW5uZWRDb2xDb3VudCgpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZpc2libGVDb2x1bW5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHBpbm5lZCA9IGkgPCBwaW5uZWRDb2x1bW5Db3VudDtcclxuICAgICAgICB0aGlzLnZpc2libGVDb2x1bW5zW2ldLnBpbm5lZCA9IHBpbm5lZDtcclxuICAgIH1cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuY3JlYXRlQ29sdW1ucyA9IGZ1bmN0aW9uKGNvbHVtbkRlZnMpIHtcclxuICAgIHRoaXMuY29sdW1ucyA9IFtdO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgaWYgKGNvbHVtbkRlZnMpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbHVtbkRlZnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGNvbERlZiA9IGNvbHVtbkRlZnNbaV07XHJcbiAgICAgICAgICAgIC8vIHRoaXMgaXMgbWVzc3kgLSB3ZSBzd2FwIGluIGFub3RoZXIgY29sIGRlZiBpZiBpdCdzIGNoZWNrYm94IHNlbGVjdGlvbiAtIG5vdCBoYXBweSA6KFxyXG4gICAgICAgICAgICBpZiAoY29sRGVmID09PSAnY2hlY2tib3hTZWxlY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICBjb2xEZWYgPSB0aGF0LnNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeS5jcmVhdGVDaGVja2JveENvbERlZigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB3aWR0aCA9IHRoYXQuY2FsY3VsYXRlQ29sSW5pdGlhbFdpZHRoKGNvbERlZik7XHJcbiAgICAgICAgICAgIHZhciB2aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdmFyIGNvbHVtbiA9IG5ldyBDb2x1bW4oY29sRGVmLCB3aWR0aCwgdmlzaWJsZSk7XHJcbiAgICAgICAgICAgIHRoYXQuY29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5jYWxjdWxhdGVDb2xJbml0aWFsV2lkdGggPSBmdW5jdGlvbihjb2xEZWYpIHtcclxuICAgIGlmICghY29sRGVmLndpZHRoKSB7XHJcbiAgICAgICAgLy8gaWYgbm8gd2lkdGggZGVmaW5lZCBpbiBjb2xEZWYsIHVzZSBkZWZhdWx0XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbFdpZHRoKCk7XHJcbiAgICB9IGVsc2UgaWYgKGNvbERlZi53aWR0aCA8IGNvbnN0YW50cy5NSU5fQ09MX1dJRFRIKSB7XHJcbiAgICAgICAgLy8gaWYgd2lkdGggaW4gY29sIGRlZiB0byBzbWFsbCwgc2V0IHRvIG1pbiB3aWR0aFxyXG4gICAgICAgIHJldHVybiBjb25zdGFudHMuTUlOX0NPTF9XSURUSDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlIHVzZSB0aGUgcHJvdmlkZWQgd2lkdGhcclxuICAgICAgICByZXR1cm4gY29sRGVmLndpZHRoO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyBjYWxsIHdpdGggdHJ1ZSAocGlubmVkKSwgZmFsc2UgKG5vdC1waW5uZWQpIG9yIHVuZGVmaW5lZCAoYWxsIGNvbHVtbnMpXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmdldFRvdGFsQ29sV2lkdGggPSBmdW5jdGlvbihpbmNsdWRlUGlubmVkKSB7XHJcbiAgICB2YXIgd2lkdGhTb0ZhciA9IDA7XHJcbiAgICB2YXIgcGluZWROb3RJbXBvcnRhbnQgPSB0eXBlb2YgaW5jbHVkZVBpbm5lZCAhPT0gJ2Jvb2xlYW4nO1xyXG5cclxuICAgIHRoaXMuZGlzcGxheWVkQ29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgICAgIHZhciBpbmNsdWRlVGhpc0NvbCA9IHBpbmVkTm90SW1wb3J0YW50IHx8IGNvbHVtbi5waW5uZWQgPT09IGluY2x1ZGVQaW5uZWQ7XHJcbiAgICAgICAgaWYgKGluY2x1ZGVUaGlzQ29sKSB7XHJcbiAgICAgICAgICAgIHdpZHRoU29GYXIgKz0gY29sdW1uLmFjdHVhbFdpZHRoO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB3aWR0aFNvRmFyO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gQ29sdW1uR3JvdXAocGlubmVkLCBuYW1lKSB7XHJcbiAgICB0aGlzLnBpbm5lZCA9IHBpbm5lZDtcclxuICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICB0aGlzLmFsbENvbHVtbnMgPSBbXTtcclxuICAgIHRoaXMuZGlzcGxheWVkQ29sdW1ucyA9IFtdO1xyXG4gICAgdGhpcy5leHBhbmRhYmxlID0gZmFsc2U7IC8vIHdoZXRoZXIgdGhpcyBncm91cCBjYW4gYmUgZXhwYW5kZWQgb3Igbm90XHJcbiAgICB0aGlzLmV4cGFuZGVkID0gZmFsc2U7XHJcbn1cclxuXHJcbkNvbHVtbkdyb3VwLnByb3RvdHlwZS5hZGRDb2x1bW4gPSBmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgIHRoaXMuYWxsQ29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbn07XHJcblxyXG4vLyBuZWVkIHRvIGNoZWNrIHRoYXQgdGhpcyBncm91cCBoYXMgYXQgbGVhc3Qgb25lIGNvbCBzaG93aW5nIHdoZW4gYm90aCBleHBhbmRlZCBhbmQgY29udHJhY3RlZC5cclxuLy8gaWYgbm90LCB0aGVuIHdlIGRvbid0IGFsbG93IGV4cGFuZGluZyBhbmQgY29udHJhY3Rpbmcgb24gdGhpcyBncm91cFxyXG5Db2x1bW5Hcm91cC5wcm90b3R5cGUuY2FsY3VsYXRlRXhwYW5kYWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gd2FudCB0byBtYWtlIHN1cmUgdGhlIGdyb3VwIGRvZXNuJ3QgZGlzYXBwZWFyIHdoZW4gaXQncyBvcGVuXHJcbiAgICB2YXIgYXRMZWFzdE9uZVNob3dpbmdXaGVuT3BlbiA9IGZhbHNlO1xyXG4gICAgLy8gd2FudCB0byBtYWtlIHN1cmUgdGhlIGdyb3VwIGRvZXNuJ3QgZGlzYXBwZWFyIHdoZW4gaXQncyBjbG9zZWRcclxuICAgIHZhciBhdExlYXN0T25lU2hvd2luZ1doZW5DbG9zZWQgPSBmYWxzZTtcclxuICAgIC8vIHdhbnQgdG8gbWFrZSBzdXJlIHRoZSBncm91cCBoYXMgc29tZXRoaW5nIHRvIHNob3cgLyBoaWRlXHJcbiAgICB2YXIgYXRMZWFzdE9uZUNoYW5nZWFibGUgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBqID0gdGhpcy5hbGxDb2x1bW5zLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICAgIHZhciBjb2x1bW4gPSB0aGlzLmFsbENvbHVtbnNbaV07XHJcbiAgICAgICAgaWYgKGNvbHVtbi5jb2xEZWYuZ3JvdXBTaG93ID09PSAnb3BlbicpIHtcclxuICAgICAgICAgICAgYXRMZWFzdE9uZVNob3dpbmdXaGVuT3BlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVDaGFuZ2VhYmxlID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbHVtbi5jb2xEZWYuZ3JvdXBTaG93ID09PSAnY2xvc2VkJykge1xyXG4gICAgICAgICAgICBhdExlYXN0T25lU2hvd2luZ1doZW5DbG9zZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBhdExlYXN0T25lQ2hhbmdlYWJsZSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYXRMZWFzdE9uZVNob3dpbmdXaGVuT3BlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVTaG93aW5nV2hlbkNsb3NlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZXhwYW5kYWJsZSA9IGF0TGVhc3RPbmVTaG93aW5nV2hlbk9wZW4gJiYgYXRMZWFzdE9uZVNob3dpbmdXaGVuQ2xvc2VkICYmIGF0TGVhc3RPbmVDaGFuZ2VhYmxlO1xyXG59O1xyXG5cclxuQ29sdW1uR3JvdXAucHJvdG90eXBlLmNhbGN1bGF0ZURpc3BsYXllZENvbHVtbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGNsZWFyIG91dCBsYXN0IHRpbWUgd2UgY2FsY3VsYXRlZFxyXG4gICAgdGhpcy5kaXNwbGF5ZWRDb2x1bW5zID0gW107XHJcbiAgICAvLyBpdCBub3QgZXhwYW5kYWJsZSwgZXZlcnl0aGluZyBpcyB2aXNpYmxlXHJcbiAgICBpZiAoIXRoaXMuZXhwYW5kYWJsZSkge1xyXG4gICAgICAgIHRoaXMuZGlzcGxheWVkQ29sdW1ucyA9IHRoaXMuYWxsQ29sdW1ucztcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAvLyBhbmQgY2FsY3VsYXRlIGFnYWluXHJcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IHRoaXMuYWxsQ29sdW1ucy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgICB2YXIgY29sdW1uID0gdGhpcy5hbGxDb2x1bW5zW2ldO1xyXG4gICAgICAgIHN3aXRjaCAoY29sdW1uLmNvbERlZi5ncm91cFNob3cpIHtcclxuICAgICAgICAgICAgY2FzZSAnb3Blbic6XHJcbiAgICAgICAgICAgICAgICAvLyB3aGVuIHNldCB0byBvcGVuLCBvbmx5IHNob3cgY29sIGlmIGdyb3VwIGlzIG9wZW5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmV4cGFuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5ZWRDb2x1bW5zLnB1c2goY29sdW1uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdjbG9zZWQnOlxyXG4gICAgICAgICAgICAgICAgLy8gd2hlbiBzZXQgdG8gb3Blbiwgb25seSBzaG93IGNvbCBpZiBncm91cCBpcyBvcGVuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZXhwYW5kZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXllZENvbHVtbnMucHVzaChjb2x1bW4pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvLyBkZWZhdWx0IGlzIGFsd2F5cyBzaG93IHRoZSBjb2x1bW5cclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheWVkQ29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBzaG91bGQgcmVwbGFjZSB3aXRoIHV0aWxzIG1ldGhvZCAnYWRkIGFsbCdcclxuQ29sdW1uR3JvdXAucHJvdG90eXBlLmFkZFRvVmlzaWJsZUNvbHVtbnMgPSBmdW5jdGlvbihjb2xzVG9BZGQpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kaXNwbGF5ZWRDb2x1bW5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNvbHVtbiA9IHRoaXMuZGlzcGxheWVkQ29sdW1uc1tpXTtcclxuICAgICAgICBjb2xzVG9BZGQucHVzaChjb2x1bW4pO1xyXG4gICAgfVxyXG59O1xyXG5cclxudmFyIGNvbElkU2VxdWVuY2UgPSAwO1xyXG5cclxuZnVuY3Rpb24gQ29sdW1uKGNvbERlZiwgYWN0dWFsV2lkdGgsIHZpc2libGUpIHtcclxuICAgIHRoaXMuY29sRGVmID0gY29sRGVmO1xyXG4gICAgdGhpcy5hY3R1YWxXaWR0aCA9IGFjdHVhbFdpZHRoO1xyXG4gICAgdGhpcy52aXNpYmxlID0gdmlzaWJsZTtcclxuICAgIC8vIGluIHRoZSBmdXR1cmUsIHRoZSBjb2xLZXkgbWlnaHQgYmUgc29tZXRoaW5nIG90aGVyIHRoYW4gdGhlIGluZGV4XHJcbiAgICBpZiAoY29sRGVmLmNvbElkKSB7XHJcbiAgICAgICAgdGhpcy5jb2xJZCA9IGNvbERlZi5jb2xJZDtcclxuICAgIH1lbHNlIGlmIChjb2xEZWYuZmllbGQpIHtcclxuICAgICAgICB0aGlzLmNvbElkID0gY29sRGVmLmZpZWxkO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmNvbElkID0gJycgKyBjb2xJZFNlcXVlbmNlKys7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29sdW1uQ29udHJvbGxlcjtcclxuIiwidmFyIGNvbnN0YW50cyA9IHtcclxuICAgIFNURVBfRVZFUllUSElORzogMCxcclxuICAgIFNURVBfRklMVEVSOiAxLFxyXG4gICAgU1RFUF9TT1JUOiAyLFxyXG4gICAgU1RFUF9NQVA6IDMsXHJcbiAgICBBU0M6IFwiYXNjXCIsXHJcbiAgICBERVNDOiBcImRlc2NcIixcclxuICAgIFJPV19CVUZGRVJfU0laRTogMjAsXHJcbiAgICBTT1JUX1NUWUxFX1NIT1c6IFwiZGlzcGxheTppbmxpbmU7XCIsXHJcbiAgICBTT1JUX1NUWUxFX0hJREU6IFwiZGlzcGxheTpub25lO1wiLFxyXG4gICAgTUlOX0NPTF9XSURUSDogMTAsXHJcblxyXG4gICAgS0VZX1RBQjogOSxcclxuICAgIEtFWV9FTlRFUjogMTMsXHJcbiAgICBLRVlfU1BBQ0U6IDMyLFxyXG4gICAgS0VZX0RPV046IDQwLFxyXG4gICAgS0VZX1VQOiAzOCxcclxuICAgIEtFWV9MRUZUOiAzNyxcclxuICAgIEtFWV9SSUdIVDogMzlcclxufTtcclxuXHJcbi8vIHRha2VuIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy85ODQ3NTgwL2hvdy10by1kZXRlY3Qtc2FmYXJpLWNocm9tZS1pZS1maXJlZm94LWFuZC1vcGVyYS1icm93c2VyXHJcbnZhciBpc09wZXJhID0gISF3aW5kb3cub3BlcmEgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCcgT1BSLycpID49IDA7XHJcbi8vIE9wZXJhIDguMCsgKFVBIGRldGVjdGlvbiB0byBkZXRlY3QgQmxpbmsvdjgtcG93ZXJlZCBPcGVyYSlcclxudmFyIGlzRmlyZWZveCA9IHR5cGVvZiBJbnN0YWxsVHJpZ2dlciAhPT0gJ3VuZGVmaW5lZCc7ICAgLy8gRmlyZWZveCAxLjArXHJcbnZhciBpc1NhZmFyaSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh3aW5kb3cuSFRNTEVsZW1lbnQpLmluZGV4T2YoJ0NvbnN0cnVjdG9yJykgPiAwO1xyXG4vLyBBdCBsZWFzdCBTYWZhcmkgMys6IFwiW29iamVjdCBIVE1MRWxlbWVudENvbnN0cnVjdG9yXVwiXHJcbnZhciBpc0Nocm9tZSA9ICEhd2luZG93LmNocm9tZSAmJiAhdGhpcy5pc09wZXJhOyAvLyBDaHJvbWUgMStcclxudmFyIGlzSUUgPSAvKkBjY19vbiFAKi9mYWxzZSB8fCAhIWRvY3VtZW50LmRvY3VtZW50TW9kZTsgLy8gQXQgbGVhc3QgSUU2XHJcblxyXG5pZiAoaXNPcGVyYSkge1xyXG4gICAgY29uc3RhbnRzLkJST1dTRVIgPSAnb3BlcmEnO1xyXG59IGVsc2UgaWYgKGlzRmlyZWZveCkge1xyXG4gICAgY29uc3RhbnRzLkJST1dTRVIgPSAnZmlyZWZveCc7XHJcbn0gZWxzZSBpZiAoaXNTYWZhcmkpIHtcclxuICAgIGNvbnN0YW50cy5CUk9XU0VSID0gJ3NhZmFyaSc7XHJcbn0gZWxzZSBpZiAoaXNDaHJvbWUpIHtcclxuICAgIGNvbnN0YW50cy5CUk9XU0VSID0gJ2Nocm9tZSc7XHJcbn0gZWxzZSBpZiAoaXNJRSkge1xyXG4gICAgY29uc3RhbnRzLkJST1dTRVIgPSAnaWUnO1xyXG59XHJcblxyXG52YXIgaXNNYWMgPSBuYXZpZ2F0b3IucGxhdGZvcm0udG9VcHBlckNhc2UoKS5pbmRleE9mKCdNQUMnKT49MDtcclxudmFyIGlzV2luZG93cyA9IG5hdmlnYXRvci5wbGF0Zm9ybS50b1VwcGVyQ2FzZSgpLmluZGV4T2YoJ1dJTicpPj0wO1xyXG5pZiAoaXNNYWMpIHtcclxuICAgIGNvbnN0YW50cy5QTEFURk9STSA9ICdtYWMnO1xyXG59IGVsc2UgaWYgKGlzV2luZG93cykge1xyXG4gICAgY29uc3RhbnRzLlBMQVRGT1JNID0gJ3dpbic7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY29uc3RhbnRzO1xyXG4iLCJmdW5jdGlvbiBFeHByZXNzaW9uU2VydmljZSgpIHt9XHJcblxyXG5FeHByZXNzaW9uU2VydmljZS5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbihydWxlLCBwYXJhbXMpIHtcclxufTtcclxuXHJcbmZ1bmN0aW9uIEV4cHJlc3Npb25TZXJ2aWNlKCkge1xyXG4gICAgdGhpcy5leHByZXNzaW9uVG9GdW5jdGlvbkNhY2hlID0ge307XHJcbn1cclxuXHJcbkV4cHJlc3Npb25TZXJ2aWNlLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uIChleHByZXNzaW9uLCBwYXJhbXMpIHtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIHZhciBqYXZhU2NyaXB0RnVuY3Rpb24gPSB0aGlzLmNyZWF0ZUV4cHJlc3Npb25GdW5jdGlvbihleHByZXNzaW9uKTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gamF2YVNjcmlwdEZ1bmN0aW9uKHBhcmFtcy52YWx1ZSwgcGFyYW1zLmNvbnRleHQsIHBhcmFtcy5ub2RlLFxyXG4gICAgICAgICAgICBwYXJhbXMuZGF0YSwgcGFyYW1zLmNvbERlZiwgcGFyYW1zLnJvd0luZGV4LCBwYXJhbXMuYXBpKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIC8vIHRoZSBleHByZXNzaW9uIGZhaWxlZCwgd2hpY2ggY2FuIGhhcHBlbiwgYXMgaXQncyB0aGUgY2xpZW50IHRoYXRcclxuICAgICAgICAvLyBwcm92aWRlcyB0aGUgZXhwcmVzc2lvbi4gc28gcHJpbnQgYSBuaWNlIG1lc3NhZ2VcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdQcm9jZXNzaW5nIG9mIHRoZSBleHByZXNzaW9uIGZhaWxlZCcpO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0V4cHJlc3Npb24gPSAnICsgZXhwcmVzc2lvbik7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRXhjZXB0aW9uID0gJyArIGUpO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59O1xyXG5cclxuRXhwcmVzc2lvblNlcnZpY2UucHJvdG90eXBlLmNyZWF0ZUV4cHJlc3Npb25GdW5jdGlvbiA9IGZ1bmN0aW9uIChleHByZXNzaW9uKSB7XHJcbiAgICAvLyBjaGVjayBjYWNoZSBmaXJzdFxyXG4gICAgaWYgKHRoaXMuZXhwcmVzc2lvblRvRnVuY3Rpb25DYWNoZVtleHByZXNzaW9uXSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV4cHJlc3Npb25Ub0Z1bmN0aW9uQ2FjaGVbZXhwcmVzc2lvbl07XHJcbiAgICB9XHJcbiAgICAvLyBpZiBub3QgZm91bmQgaW4gY2FjaGUsIHJldHVybiB0aGUgZnVuY3Rpb25cclxuICAgIHZhciBmdW5jdGlvbkJvZHkgPSB0aGlzLmNyZWF0ZUZ1bmN0aW9uQm9keShleHByZXNzaW9uKTtcclxuICAgIHZhciB0aGVGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbigneCwgY3R4LCBub2RlLCBkYXRhLCBjb2xEZWYsIHJvd0luZGV4LCBhcGknLCBmdW5jdGlvbkJvZHkpO1xyXG5cclxuICAgIC8vIHN0b3JlIGluIGNhY2hlXHJcbiAgICB0aGlzLmV4cHJlc3Npb25Ub0Z1bmN0aW9uQ2FjaGVbZXhwcmVzc2lvbl0gPSB0aGVGdW5jdGlvbjtcclxuXHJcbiAgICByZXR1cm4gdGhlRnVuY3Rpb247XHJcbn07XHJcblxyXG5FeHByZXNzaW9uU2VydmljZS5wcm90b3R5cGUuY3JlYXRlRnVuY3Rpb25Cb2R5ID0gZnVuY3Rpb24gKGV4cHJlc3Npb24pIHtcclxuICAgIC8vIGlmIHRoZSBleHByZXNzaW9uIGhhcyB0aGUgJ3JldHVybicgd29yZCBpbiBpdCwgdGhlbiB1c2UgYXMgaXMsXHJcbiAgICAvLyBpZiBub3QsIHRoZW4gd3JhcCBpdCB3aXRoIHJldHVybiBhbmQgJzsnIHRvIG1ha2UgYSBmdW5jdGlvblxyXG4gICAgaWYgKGV4cHJlc3Npb24uaW5kZXhPZigncmV0dXJuJykgPj0gMCkge1xyXG4gICAgICAgIHJldHVybiBleHByZXNzaW9uO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gJ3JldHVybiAnICsgZXhwcmVzc2lvbiArICc7JztcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRXhwcmVzc2lvblNlcnZpY2U7XHJcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcclxudmFyIFNldEZpbHRlciA9IHJlcXVpcmUoJy4vc2V0RmlsdGVyJyk7XHJcbnZhciBOdW1iZXJGaWx0ZXIgPSByZXF1aXJlKCcuL251bWJlckZpbHRlcicpO1xyXG52YXIgU3RyaW5nRmlsdGVyID0gcmVxdWlyZSgnLi90ZXh0RmlsdGVyJyk7XHJcblxyXG5mdW5jdGlvbiBGaWx0ZXJNYW5hZ2VyKCkge31cclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihncmlkLCBncmlkT3B0aW9uc1dyYXBwZXIsICRjb21waWxlLCAkc2NvcGUsIGV4cHJlc3Npb25TZXJ2aWNlLCBjb2x1bW5Nb2RlbCkge1xyXG4gICAgdGhpcy4kY29tcGlsZSA9ICRjb21waWxlO1xyXG4gICAgdGhpcy4kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHRoaXMuZ3JpZCA9IGdyaWQ7XHJcbiAgICB0aGlzLmFsbEZpbHRlcnMgPSB7fTtcclxuICAgIHRoaXMuZXhwcmVzc2lvblNlcnZpY2UgPSBleHByZXNzaW9uU2VydmljZTtcclxuICAgIHRoaXMuY29sdW1uTW9kZWwgPSBjb2x1bW5Nb2RlbDtcclxufTtcclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLnNldEZpbHRlck1vZGVsID0gZnVuY3Rpb24obW9kZWwpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGlmIChtb2RlbCkge1xyXG4gICAgICAgIC8vIG1hcmsgdGhlIGZpbHRlcnMgYXMgd2Ugc2V0IHRoZW0sIHNvIGFueSBhY3RpdmUgZmlsdGVycyBsZWZ0IG92ZXIgd2Ugc3RvcFxyXG4gICAgICAgIHZhciBwcm9jZXNzZWRGaWVsZHMgPSBPYmplY3Qua2V5cyhtb2RlbCk7XHJcbiAgICAgICAgdXRpbHMuaXRlcmF0ZU9iamVjdCh0aGlzLmFsbEZpbHRlcnMsIGZ1bmN0aW9uKGtleSwgZmlsdGVyV3JhcHBlcikge1xyXG4gICAgICAgICAgICB2YXIgZmllbGQgPSBmaWx0ZXJXcmFwcGVyLmNvbHVtbi5jb2xEZWYuZmllbGQ7XHJcbiAgICAgICAgICAgIHV0aWxzLnJlbW92ZUZyb21BcnJheShwcm9jZXNzZWRGaWVsZHMsIGZpZWxkKTtcclxuICAgICAgICAgICAgaWYgKGZpZWxkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3TW9kZWwgPSBtb2RlbFtmaWVsZF07XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNldE1vZGVsT25GaWx0ZXJXcmFwcGVyKGZpbHRlcldyYXBwZXIuZmlsdGVyLCBuZXdNb2RlbCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1dhcm5pbmcgYWctZ3JpZCAtIG5vIGZpZWxkIGZvdW5kIGZvciBjb2x1bW4gd2hpbGUgZG9pbmcgc2V0RmlsdGVyTW9kZWwnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIGF0IHRoaXMgcG9pbnQsIHByb2Nlc3NlZEZpZWxkcyBjb250YWlucyBkYXRhIGZvciB3aGljaCB3ZSBkb24ndCBoYXZlIGEgZmlsdGVyIHdvcmtpbmcgeWV0XHJcbiAgICAgICAgdXRpbHMuaXRlcmF0ZUFycmF5KHByb2Nlc3NlZEZpZWxkcywgZnVuY3Rpb24oZmllbGQpIHtcclxuICAgICAgICAgICAgdmFyIGNvbHVtbiA9IHRoYXQuY29sdW1uTW9kZWwuZ2V0Q29sdW1uKGZpZWxkKTtcclxuICAgICAgICAgICAgaWYgKCFjb2x1bW4pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignV2FybmluZyBhZy1ncmlkIC0gbm8gY29sdW1uIGZvdW5kIGZvciBmaWVsZCAnICsgZmllbGQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBmaWx0ZXJXcmFwcGVyID0gdGhhdC5nZXRPckNyZWF0ZUZpbHRlcldyYXBwZXIoY29sdW1uKTtcclxuICAgICAgICAgICAgdGhhdC5zZXRNb2RlbE9uRmlsdGVyV3JhcHBlcihmaWx0ZXJXcmFwcGVyLmZpbHRlciwgbW9kZWxbZmllbGRdKTtcclxuICAgICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdXRpbHMuaXRlcmF0ZU9iamVjdCh0aGlzLmFsbEZpbHRlcnMsIGZ1bmN0aW9uKGtleSwgZmlsdGVyV3JhcHBlcikge1xyXG4gICAgICAgICAgICB0aGF0LnNldE1vZGVsT25GaWx0ZXJXcmFwcGVyKGZpbHRlcldyYXBwZXIuZmlsdGVyLCBudWxsKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufTtcclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLnNldE1vZGVsT25GaWx0ZXJXcmFwcGVyID0gZnVuY3Rpb24oZmlsdGVyLCBuZXdNb2RlbCkge1xyXG4gICAgLy8gYmVjYXVzZSB1c2VyIGNhbiBwcm92aWRlIGZpbHRlcnMsIHdlIHByb3ZpZGUgdXNlZnVsIGVycm9yIGNoZWNraW5nIGFuZCBtZXNzYWdlc1xyXG4gICAgaWYgKHR5cGVvZiBmaWx0ZXIuZ2V0QXBpICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdXYXJuaW5nIGFnLWdyaWQgLSBmaWx0ZXIgbWlzc2luZyBnZXRBcGkgbWV0aG9kLCB3aGljaCBpcyBuZWVkZWQgZm9yIGdldEZpbHRlck1vZGVsJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIGZpbHRlckFwaSA9IGZpbHRlci5nZXRBcGkoKTtcclxuICAgIGlmICh0eXBlb2YgZmlsdGVyQXBpLnNldE1vZGVsICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdXYXJuaW5nIGFnLWdyaWQgLSBmaWx0ZXIgQVBJIG1pc3Npbmcgc2V0TW9kZWwgbWV0aG9kLCB3aGljaCBpcyBuZWVkZWQgZm9yIHNldEZpbHRlck1vZGVsJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZmlsdGVyQXBpLnNldE1vZGVsKG5ld01vZGVsKTtcclxufTtcclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLmdldEZpbHRlck1vZGVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICB1dGlscy5pdGVyYXRlT2JqZWN0KHRoaXMuYWxsRmlsdGVycywgZnVuY3Rpb24oa2V5LCBmaWx0ZXJXcmFwcGVyKSB7XHJcbiAgICAgICAgLy8gYmVjYXVzZSB1c2VyIGNhbiBwcm92aWRlIGZpbHRlcnMsIHdlIHByb3ZpZGUgdXNlZnVsIGVycm9yIGNoZWNraW5nIGFuZCBtZXNzYWdlc1xyXG4gICAgICAgIGlmICh0eXBlb2YgZmlsdGVyV3JhcHBlci5maWx0ZXIuZ2V0QXBpICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignV2FybmluZyBhZy1ncmlkIC0gZmlsdGVyIG1pc3NpbmcgZ2V0QXBpIG1ldGhvZCwgd2hpY2ggaXMgbmVlZGVkIGZvciBnZXRGaWx0ZXJNb2RlbCcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBmaWx0ZXJBcGkgPSBmaWx0ZXJXcmFwcGVyLmZpbHRlci5nZXRBcGkoKTtcclxuICAgICAgICBpZiAodHlwZW9mIGZpbHRlckFwaS5nZXRNb2RlbCAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1dhcm5pbmcgYWctZ3JpZCAtIGZpbHRlciBBUEkgbWlzc2luZyBnZXRNb2RlbCBtZXRob2QsIHdoaWNoIGlzIG5lZWRlZCBmb3IgZ2V0RmlsdGVyTW9kZWwnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbW9kZWwgPSBmaWx0ZXJBcGkuZ2V0TW9kZWwoKTtcclxuICAgICAgICBpZiAobW9kZWwpIHtcclxuICAgICAgICAgICAgdmFyIGZpZWxkID0gZmlsdGVyV3JhcHBlci5jb2x1bW4uY29sRGVmLmZpZWxkO1xyXG4gICAgICAgICAgICBpZiAoIWZpZWxkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1dhcm5pbmcgYWctZ3JpZCAtIGNhbm5vdCBnZXQgZmlsdGVyIG1vZGVsIHdoZW4gbm8gZmllbGQgdmFsdWUgcHJlc2VudCBmb3IgY29sdW1uJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRbZmllbGRdID0gbW9kZWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5zZXRSb3dNb2RlbCA9IGZ1bmN0aW9uKHJvd01vZGVsKSB7XHJcbiAgICB0aGlzLnJvd01vZGVsID0gcm93TW9kZWw7XHJcbn07XHJcblxyXG4vLyByZXR1cm5zIHRydWUgaWYgYXQgbGVhc3Qgb25lIGZpbHRlciBpcyBhY3RpdmVcclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuaXNGaWx0ZXJQcmVzZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgYXRMZWFzdE9uZUFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcy5hbGxGaWx0ZXJzKTtcclxuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICB2YXIgZmlsdGVyV3JhcHBlciA9IHRoYXQuYWxsRmlsdGVyc1trZXldO1xyXG4gICAgICAgIGlmICghZmlsdGVyV3JhcHBlci5maWx0ZXIuaXNGaWx0ZXJBY3RpdmUpIHsgLy8gYmVjYXVzZSB1c2VycyBjYW4gZG8gY3VzdG9tIGZpbHRlcnMsIGdpdmUgbmljZSBlcnJvciBtZXNzYWdlXHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZpbHRlciBpcyBtaXNzaW5nIG1ldGhvZCBpc0ZpbHRlckFjdGl2ZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZmlsdGVyV3JhcHBlci5maWx0ZXIuaXNGaWx0ZXJBY3RpdmUoKSkge1xyXG4gICAgICAgICAgICBhdExlYXN0T25lQWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBhdExlYXN0T25lQWN0aXZlO1xyXG59O1xyXG5cclxuLy8gcmV0dXJucyB0cnVlIGlmIGdpdmVuIGNvbCBoYXMgYSBmaWx0ZXIgYWN0aXZlXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLmlzRmlsdGVyUHJlc2VudEZvckNvbCA9IGZ1bmN0aW9uKGNvbElkKSB7XHJcbiAgICB2YXIgZmlsdGVyV3JhcHBlciA9IHRoaXMuYWxsRmlsdGVyc1tjb2xJZF07XHJcbiAgICBpZiAoIWZpbHRlcldyYXBwZXIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAoIWZpbHRlcldyYXBwZXIuZmlsdGVyLmlzRmlsdGVyQWN0aXZlKSB7IC8vIGJlY2F1c2UgdXNlcnMgY2FuIGRvIGN1c3RvbSBmaWx0ZXJzLCBnaXZlIG5pY2UgZXJyb3IgbWVzc2FnZVxyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZpbHRlciBpcyBtaXNzaW5nIG1ldGhvZCBpc0ZpbHRlckFjdGl2ZScpO1xyXG4gICAgfVxyXG4gICAgdmFyIGZpbHRlclByZXNlbnQgPSBmaWx0ZXJXcmFwcGVyLmZpbHRlci5pc0ZpbHRlckFjdGl2ZSgpO1xyXG4gICAgcmV0dXJuIGZpbHRlclByZXNlbnQ7XHJcbn07XHJcblxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5kb2VzRmlsdGVyUGFzcyA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIHZhciBkYXRhID0gbm9kZS5kYXRhO1xyXG4gICAgdmFyIGNvbEtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmFsbEZpbHRlcnMpO1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjb2xLZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyAvLyBjcml0aWNhbCBjb2RlLCBkb24ndCB1c2UgZnVuY3Rpb25hbCBwcm9ncmFtbWluZ1xyXG5cclxuICAgICAgICB2YXIgY29sSWQgPSBjb2xLZXlzW2ldO1xyXG4gICAgICAgIHZhciBmaWx0ZXJXcmFwcGVyID0gdGhpcy5hbGxGaWx0ZXJzW2NvbElkXTtcclxuXHJcbiAgICAgICAgLy8gaWYgbm8gZmlsdGVyLCBhbHdheXMgcGFzc1xyXG4gICAgICAgIGlmIChmaWx0ZXJXcmFwcGVyID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWZpbHRlcldyYXBwZXIuZmlsdGVyLmRvZXNGaWx0ZXJQYXNzKSB7IC8vIGJlY2F1c2UgdXNlcnMgY2FuIGRvIGN1c3RvbSBmaWx0ZXJzLCBnaXZlIG5pY2UgZXJyb3IgbWVzc2FnZVxyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGaWx0ZXIgaXMgbWlzc2luZyBtZXRob2QgZG9lc0ZpbHRlclBhc3MnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgZGF0YTogZGF0YVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKCFmaWx0ZXJXcmFwcGVyLmZpbHRlci5kb2VzRmlsdGVyUGFzcyhwYXJhbXMpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBhbGwgZmlsdGVycyBwYXNzZWRcclxuICAgIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUub25OZXdSb3dzTG9hZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBPYmplY3Qua2V5cyh0aGlzLmFsbEZpbHRlcnMpLmZvckVhY2goZnVuY3Rpb24oZmllbGQpIHtcclxuICAgICAgICB2YXIgZmlsdGVyID0gdGhhdC5hbGxGaWx0ZXJzW2ZpZWxkXS5maWx0ZXI7XHJcbiAgICAgICAgaWYgKGZpbHRlci5vbk5ld1Jvd3NMb2FkZWQpIHtcclxuICAgICAgICAgICAgZmlsdGVyLm9uTmV3Um93c0xvYWRlZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUucG9zaXRpb25Qb3B1cCA9IGZ1bmN0aW9uKGV2ZW50U291cmNlLCBlUG9wdXAsIGVQb3B1cFJvb3QpIHtcclxuICAgIHZhciBzb3VyY2VSZWN0ID0gZXZlbnRTb3VyY2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICB2YXIgcGFyZW50UmVjdCA9IGVQb3B1cFJvb3QuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgdmFyIHggPSBzb3VyY2VSZWN0LmxlZnQgLSBwYXJlbnRSZWN0LmxlZnQ7XHJcbiAgICB2YXIgeSA9IHNvdXJjZVJlY3QudG9wIC0gcGFyZW50UmVjdC50b3AgKyBzb3VyY2VSZWN0LmhlaWdodDtcclxuXHJcbiAgICAvLyBpZiBwb3B1cCBpcyBvdmVyZmxvd2luZyB0byB0aGUgcmlnaHQsIG1vdmUgaXQgbGVmdFxyXG4gICAgdmFyIHdpZHRoT2ZQb3B1cCA9IDIwMDsgLy8gdGhpcyBpcyBzZXQgaW4gdGhlIGNzc1xyXG4gICAgdmFyIHdpZHRoT2ZQYXJlbnQgPSBwYXJlbnRSZWN0LnJpZ2h0IC0gcGFyZW50UmVjdC5sZWZ0O1xyXG4gICAgdmFyIG1heFggPSB3aWR0aE9mUGFyZW50IC0gd2lkdGhPZlBvcHVwIC0gMjA7IC8vIDIwIHBpeGVscyBncmFjZVxyXG4gICAgaWYgKHggPiBtYXhYKSB7IC8vIG1vdmUgcG9zaXRpb24gbGVmdCwgYmFjayBpbnRvIHZpZXdcclxuICAgICAgICB4ID0gbWF4WDtcclxuICAgIH1cclxuICAgIGlmICh4IDwgMCkgeyAvLyBpbiBjYXNlIHRoZSBwb3B1cCBoYXMgYSBuZWdhdGl2ZSB2YWx1ZVxyXG4gICAgICAgIHggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGVQb3B1cC5zdHlsZS5sZWZ0ID0geCArIFwicHhcIjtcclxuICAgIGVQb3B1cC5zdHlsZS50b3AgPSB5ICsgXCJweFwiO1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuY3JlYXRlVmFsdWVHZXR0ZXIgPSBmdW5jdGlvbihjb2xEZWYpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHJldHVybiBmdW5jdGlvbiB2YWx1ZUdldHRlcihub2RlKSB7XHJcbiAgICAgICAgdmFyIGFwaSA9IHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpO1xyXG4gICAgICAgIHZhciBjb250ZXh0ID0gdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpO1xyXG4gICAgICAgIHJldHVybiB1dGlscy5nZXRWYWx1ZSh0aGF0LmV4cHJlc3Npb25TZXJ2aWNlLCBub2RlLmRhdGEsIGNvbERlZiwgbm9kZSwgYXBpLCBjb250ZXh0KTtcclxuICAgIH07XHJcbn07XHJcblxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5nZXRGaWx0ZXJBcGkgPSBmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgIHZhciBmaWx0ZXJXcmFwcGVyID0gdGhpcy5nZXRPckNyZWF0ZUZpbHRlcldyYXBwZXIoY29sdW1uKTtcclxuICAgIGlmIChmaWx0ZXJXcmFwcGVyKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBmaWx0ZXJXcmFwcGVyLmZpbHRlci5nZXRBcGkgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcldyYXBwZXIuZmlsdGVyLmdldEFwaSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLmdldE9yQ3JlYXRlRmlsdGVyV3JhcHBlciA9IGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgdmFyIGZpbHRlcldyYXBwZXIgPSB0aGlzLmFsbEZpbHRlcnNbY29sdW1uLmNvbElkXTtcclxuXHJcbiAgICBpZiAoIWZpbHRlcldyYXBwZXIpIHtcclxuICAgICAgICBmaWx0ZXJXcmFwcGVyID0gdGhpcy5jcmVhdGVGaWx0ZXJXcmFwcGVyKGNvbHVtbik7XHJcbiAgICAgICAgdGhpcy5hbGxGaWx0ZXJzW2NvbHVtbi5jb2xJZF0gPSBmaWx0ZXJXcmFwcGVyO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmaWx0ZXJXcmFwcGVyO1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuY3JlYXRlRmlsdGVyV3JhcHBlciA9IGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcblxyXG4gICAgdmFyIGZpbHRlcldyYXBwZXIgPSB7XHJcbiAgICAgICAgY29sdW1uOiBjb2x1bW5cclxuICAgIH07XHJcbiAgICB2YXIgZmlsdGVyQ2hhbmdlZENhbGxiYWNrID0gdGhpcy5ncmlkLm9uRmlsdGVyQ2hhbmdlZC5iaW5kKHRoaXMuZ3JpZCk7XHJcbiAgICB2YXIgZmlsdGVyUGFyYW1zID0gY29sRGVmLmZpbHRlclBhcmFtcztcclxuICAgIHZhciBwYXJhbXMgPSB7XHJcbiAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgcm93TW9kZWw6IHRoaXMucm93TW9kZWwsXHJcbiAgICAgICAgZmlsdGVyQ2hhbmdlZENhbGxiYWNrOiBmaWx0ZXJDaGFuZ2VkQ2FsbGJhY2ssXHJcbiAgICAgICAgZmlsdGVyUGFyYW1zOiBmaWx0ZXJQYXJhbXMsXHJcbiAgICAgICAgbG9jYWxlVGV4dEZ1bmM6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldExvY2FsZVRleHRGdW5jKCksXHJcbiAgICAgICAgdmFsdWVHZXR0ZXI6IHRoaXMuY3JlYXRlVmFsdWVHZXR0ZXIoY29sRGVmKVxyXG4gICAgfTtcclxuICAgIGlmICh0eXBlb2YgY29sRGVmLmZpbHRlciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIC8vIGlmIHVzZXIgcHJvdmlkZWQgYSBmaWx0ZXIsIGp1c3QgdXNlIGl0XHJcbiAgICAgICAgLy8gZmlyc3QgdXAsIGNyZWF0ZSBjaGlsZCBzY29wZSBpZiBuZWVkZWRcclxuICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNBbmd1bGFyQ29tcGlsZUZpbHRlcnMoKSkge1xyXG4gICAgICAgICAgICB2YXIgc2NvcGUgPSB0aGlzLiRzY29wZS4kbmV3KCk7XHJcbiAgICAgICAgICAgIGZpbHRlcldyYXBwZXIuc2NvcGUgPSBzY29wZTtcclxuICAgICAgICAgICAgcGFyYW1zLiRzY29wZSA9IHNjb3BlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBub3cgY3JlYXRlIGZpbHRlclxyXG4gICAgICAgIGZpbHRlcldyYXBwZXIuZmlsdGVyID0gbmV3IGNvbERlZi5maWx0ZXIocGFyYW1zKTtcclxuICAgIH0gZWxzZSBpZiAoY29sRGVmLmZpbHRlciA9PT0gJ3RleHQnKSB7XHJcbiAgICAgICAgZmlsdGVyV3JhcHBlci5maWx0ZXIgPSBuZXcgU3RyaW5nRmlsdGVyKHBhcmFtcyk7XHJcbiAgICB9IGVsc2UgaWYgKGNvbERlZi5maWx0ZXIgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgZmlsdGVyV3JhcHBlci5maWx0ZXIgPSBuZXcgTnVtYmVyRmlsdGVyKHBhcmFtcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZpbHRlcldyYXBwZXIuZmlsdGVyID0gbmV3IFNldEZpbHRlcihwYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghZmlsdGVyV3JhcHBlci5maWx0ZXIuZ2V0R3VpKSB7IC8vIGJlY2F1c2UgdXNlcnMgY2FuIGRvIGN1c3RvbSBmaWx0ZXJzLCBnaXZlIG5pY2UgZXJyb3IgbWVzc2FnZVxyXG4gICAgICAgIHRocm93ICdGaWx0ZXIgaXMgbWlzc2luZyBtZXRob2QgZ2V0R3VpJztcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZUZpbHRlckd1aSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZUZpbHRlckd1aS5jbGFzc05hbWUgPSAnYWctZmlsdGVyJztcclxuICAgIHZhciBndWlGcm9tRmlsdGVyID0gZmlsdGVyV3JhcHBlci5maWx0ZXIuZ2V0R3VpKCk7XHJcbiAgICBpZiAodXRpbHMuaXNOb2RlT3JFbGVtZW50KGd1aUZyb21GaWx0ZXIpKSB7XHJcbiAgICAgICAgLy9hIGRvbSBub2RlIG9yIGVsZW1lbnQgd2FzIHJldHVybmVkLCBzbyBhZGQgY2hpbGRcclxuICAgICAgICBlRmlsdGVyR3VpLmFwcGVuZENoaWxkKGd1aUZyb21GaWx0ZXIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvL290aGVyd2lzZSBhc3N1bWUgaXQgd2FzIGh0bWwsIHNvIGp1c3QgaW5zZXJ0XHJcbiAgICAgICAgdmFyIGVUZXh0U3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICBlVGV4dFNwYW4uaW5uZXJIVE1MID0gZ3VpRnJvbUZpbHRlcjtcclxuICAgICAgICBlRmlsdGVyR3VpLmFwcGVuZENoaWxkKGVUZXh0U3Bhbik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGZpbHRlcldyYXBwZXIuc2NvcGUpIHtcclxuICAgICAgICBmaWx0ZXJXcmFwcGVyLmd1aSA9IHRoaXMuJGNvbXBpbGUoZUZpbHRlckd1aSkoZmlsdGVyV3JhcHBlci5zY29wZSlbMF07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZpbHRlcldyYXBwZXIuZ3VpID0gZUZpbHRlckd1aTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmlsdGVyV3JhcHBlcjtcclxufTtcclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLnNob3dGaWx0ZXIgPSBmdW5jdGlvbihjb2x1bW4sIGV2ZW50U291cmNlKSB7XHJcblxyXG4gICAgdmFyIGZpbHRlcldyYXBwZXIgPSB0aGlzLmdldE9yQ3JlYXRlRmlsdGVyV3JhcHBlcihjb2x1bW4pO1xyXG5cclxuICAgIHZhciBlUG9wdXBQYXJlbnQgPSB0aGlzLmdyaWQuZ2V0UG9wdXBQYXJlbnQoKTtcclxuICAgIHRoaXMucG9zaXRpb25Qb3B1cChldmVudFNvdXJjZSwgZmlsdGVyV3JhcHBlci5ndWksIGVQb3B1cFBhcmVudCk7XHJcblxyXG4gICAgdXRpbHMuYWRkQXNNb2RhbFBvcHVwKGVQb3B1cFBhcmVudCwgZmlsdGVyV3JhcHBlci5ndWkpO1xyXG5cclxuICAgIGlmIChmaWx0ZXJXcmFwcGVyLmZpbHRlci5hZnRlckd1aUF0dGFjaGVkKSB7XHJcbiAgICAgICAgZmlsdGVyV3JhcHBlci5maWx0ZXIuYWZ0ZXJHdWlBdHRhY2hlZCgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGaWx0ZXJNYW5hZ2VyO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPGRpdj48ZGl2PjxzZWxlY3QgY2xhc3M9YWctZmlsdGVyLXNlbGVjdCBpZD1maWx0ZXJUeXBlPjxvcHRpb24gdmFsdWU9MT5bRVFVQUxTXTwvb3B0aW9uPjxvcHRpb24gdmFsdWU9Mj5bTEVTUyBUSEFOXTwvb3B0aW9uPjxvcHRpb24gdmFsdWU9Mz5bR1JFQVRFUiBUSEFOXTwvb3B0aW9uPjwvc2VsZWN0PjwvZGl2PjxkaXY+PGlucHV0IGNsYXNzPWFnLWZpbHRlci1maWx0ZXIgaWQ9ZmlsdGVyVGV4dCB0eXBlPXRleHQgcGxhY2Vob2xkZXI9XFxcIltGSUxURVIuLi5dXFxcIj48L2Rpdj48L2Rpdj5cIjtcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9udW1iZXJGaWx0ZXIuaHRtbCcpO1xyXG5cclxudmFyIEVRVUFMUyA9IDE7XHJcbnZhciBMRVNTX1RIQU4gPSAyO1xyXG52YXIgR1JFQVRFUl9USEFOID0gMztcclxuXHJcbmZ1bmN0aW9uIE51bWJlckZpbHRlcihwYXJhbXMpIHtcclxuICAgIHRoaXMuZmlsdGVyUGFyYW1zID0gcGFyYW1zLmZpbHRlclBhcmFtcztcclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrID0gcGFyYW1zLmZpbHRlckNoYW5nZWRDYWxsYmFjaztcclxuICAgIHRoaXMubG9jYWxlVGV4dEZ1bmMgPSBwYXJhbXMubG9jYWxlVGV4dEZ1bmM7XHJcbiAgICB0aGlzLnZhbHVlR2V0dGVyID0gcGFyYW1zLnZhbHVlR2V0dGVyO1xyXG4gICAgdGhpcy5jcmVhdGVHdWkoKTtcclxuICAgIHRoaXMuZmlsdGVyTnVtYmVyID0gbnVsbDtcclxuICAgIHRoaXMuZmlsdGVyVHlwZSA9IEVRVUFMUztcclxuICAgIHRoaXMuY3JlYXRlQXBpKCk7XHJcbn1cclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5OdW1iZXJGaWx0ZXIucHJvdG90eXBlLm9uTmV3Um93c0xvYWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGtlZXBTZWxlY3Rpb24gPSB0aGlzLmZpbHRlclBhcmFtcyAmJiB0aGlzLmZpbHRlclBhcmFtcy5uZXdSb3dzQWN0aW9uID09PSAna2VlcCc7XHJcbiAgICBpZiAoIWtlZXBTZWxlY3Rpb24pIHtcclxuICAgICAgICB0aGlzLmFwaS5zZXRUeXBlKEVRVUFMUyk7XHJcbiAgICAgICAgdGhpcy5hcGkuc2V0RmlsdGVyKG51bGwpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcbk51bWJlckZpbHRlci5wcm90b3R5cGUuYWZ0ZXJHdWlBdHRhY2hlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lRmlsdGVyVGV4dEZpZWxkLmZvY3VzKCk7XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5kb2VzRmlsdGVyUGFzcyA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIGlmICh0aGlzLmZpbHRlck51bWJlciA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgdmFyIHZhbHVlID0gdGhpcy52YWx1ZUdldHRlcihub2RlKTtcclxuXHJcbiAgICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB2YWx1ZUFzTnVtYmVyO1xyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICB2YWx1ZUFzTnVtYmVyID0gdmFsdWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhbHVlQXNOdW1iZXIgPSBwYXJzZUZsb2F0KHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBzd2l0Y2ggKHRoaXMuZmlsdGVyVHlwZSkge1xyXG4gICAgICAgIGNhc2UgRVFVQUxTOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVBc051bWJlciA9PT0gdGhpcy5maWx0ZXJOdW1iZXI7XHJcbiAgICAgICAgY2FzZSBMRVNTX1RIQU46XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZUFzTnVtYmVyIDw9IHRoaXMuZmlsdGVyTnVtYmVyO1xyXG4gICAgICAgIGNhc2UgR1JFQVRFUl9USEFOOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVBc051bWJlciA+PSB0aGlzLmZpbHRlck51bWJlcjtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvLyBzaG91bGQgbmV2ZXIgaGFwcGVuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbnZhbGlkIGZpbHRlciB0eXBlICcgKyB0aGlzLmZpbHRlclR5cGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5nZXRHdWkgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmVHdWk7XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5pc0ZpbHRlckFjdGl2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyTnVtYmVyICE9PSBudWxsO1xyXG59O1xyXG5cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5jcmVhdGVUZW1wbGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRlbXBsYXRlXHJcbiAgICAgICAgLnJlcGxhY2UoJ1tGSUxURVIuLi5dJywgdGhpcy5sb2NhbGVUZXh0RnVuYygnZmlsdGVyT29vJywgJ0ZpbHRlci4uLicpKVxyXG4gICAgICAgIC5yZXBsYWNlKCdbRVFVQUxTXScsIHRoaXMubG9jYWxlVGV4dEZ1bmMoJ2VxdWFscycsICdFcXVhbHMnKSlcclxuICAgICAgICAucmVwbGFjZSgnW0xFU1MgVEhBTl0nLCB0aGlzLmxvY2FsZVRleHRGdW5jKCdsZXNzVGhhbicsICdMZXNzIHRoYW4nKSlcclxuICAgICAgICAucmVwbGFjZSgnW0dSRUFURVIgVEhBTl0nLCB0aGlzLmxvY2FsZVRleHRGdW5jKCdncmVhdGVyVGhhbicsICdHcmVhdGVyIHRoYW4nKSk7XHJcbn07XHJcblxyXG5OdW1iZXJGaWx0ZXIucHJvdG90eXBlLmNyZWF0ZUd1aSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lR3VpID0gdXRpbHMubG9hZFRlbXBsYXRlKHRoaXMuY3JlYXRlVGVtcGxhdGUoKSk7XHJcbiAgICB0aGlzLmVGaWx0ZXJUZXh0RmllbGQgPSB0aGlzLmVHdWkucXVlcnlTZWxlY3RvcihcIiNmaWx0ZXJUZXh0XCIpO1xyXG4gICAgdGhpcy5lVHlwZVNlbGVjdCA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKFwiI2ZpbHRlclR5cGVcIik7XHJcblxyXG4gICAgdXRpbHMuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5lRmlsdGVyVGV4dEZpZWxkLCB0aGlzLm9uRmlsdGVyQ2hhbmdlZC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZVR5cGVTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCB0aGlzLm9uVHlwZUNoYW5nZWQuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5OdW1iZXJGaWx0ZXIucHJvdG90eXBlLm9uVHlwZUNoYW5nZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZmlsdGVyVHlwZSA9IHBhcnNlSW50KHRoaXMuZVR5cGVTZWxlY3QudmFsdWUpO1xyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2soKTtcclxufTtcclxuXHJcbk51bWJlckZpbHRlci5wcm90b3R5cGUub25GaWx0ZXJDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZmlsdGVyVGV4dCA9IHV0aWxzLm1ha2VOdWxsKHRoaXMuZUZpbHRlclRleHRGaWVsZC52YWx1ZSk7XHJcbiAgICBpZiAoZmlsdGVyVGV4dCAmJiBmaWx0ZXJUZXh0LnRyaW0oKSA9PT0gJycpIHtcclxuICAgICAgICBmaWx0ZXJUZXh0ID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmIChmaWx0ZXJUZXh0KSB7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJOdW1iZXIgPSBwYXJzZUZsb2F0KGZpbHRlclRleHQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmZpbHRlck51bWJlciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICB0aGlzLmZpbHRlckNoYW5nZWRDYWxsYmFjaygpO1xyXG59O1xyXG5cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5jcmVhdGVBcGkgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHRoaXMuYXBpID0ge1xyXG4gICAgICAgIEVRVUFMUzogRVFVQUxTLFxyXG4gICAgICAgIExFU1NfVEhBTjogTEVTU19USEFOLFxyXG4gICAgICAgIEdSRUFURVJfVEhBTjogR1JFQVRFUl9USEFOLFxyXG4gICAgICAgIHNldFR5cGU6IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgICAgICAgICAgdGhhdC5maWx0ZXJUeXBlID0gdHlwZTtcclxuICAgICAgICAgICAgdGhhdC5lVHlwZVNlbGVjdC52YWx1ZSA9IHR5cGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRGaWx0ZXI6IGZ1bmN0aW9uKGZpbHRlcikge1xyXG4gICAgICAgICAgICBmaWx0ZXIgPSB1dGlscy5tYWtlTnVsbChmaWx0ZXIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGZpbHRlciE9PW51bGwgJiYgISh0eXBlb2YgZmlsdGVyID09PSAnbnVtYmVyJykpIHtcclxuICAgICAgICAgICAgICAgIGZpbHRlciA9IHBhcnNlRmxvYXQoZmlsdGVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGF0LmZpbHRlck51bWJlciA9IGZpbHRlcjtcclxuICAgICAgICAgICAgdGhhdC5lRmlsdGVyVGV4dEZpZWxkLnZhbHVlID0gZmlsdGVyO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VHlwZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmZpbHRlclR5cGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRGaWx0ZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5maWx0ZXJOdW1iZXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRNb2RlbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGF0LmlzRmlsdGVyQWN0aXZlKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogdGhhdC5maWx0ZXJUeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcjogdGhhdC5maWx0ZXJOdW1iZXJcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0TW9kZWw6IGZ1bmN0aW9uKGRhdGFNb2RlbCkge1xyXG4gICAgICAgICAgICBpZiAoZGF0YU1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFR5cGUoZGF0YU1vZGVsLnR5cGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRGaWx0ZXIoZGF0YU1vZGVsLmZpbHRlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEZpbHRlcihudWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG5OdW1iZXJGaWx0ZXIucHJvdG90eXBlLmdldEFwaSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXBpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOdW1iZXJGaWx0ZXI7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gXCI8ZGl2PjxkaXYgY2xhc3M9YWctZmlsdGVyLWhlYWRlci1jb250YWluZXI+PGlucHV0IGNsYXNzPWFnLWZpbHRlci1maWx0ZXIgdHlwZT10ZXh0IHBsYWNlaG9sZGVyPVxcXCJbU0VBUkNILi4uXVxcXCI+PC9kaXY+PGRpdiBjbGFzcz1hZy1maWx0ZXItaGVhZGVyLWNvbnRhaW5lcj48bGFiZWw+PGlucHV0IGlkPXNlbGVjdEFsbCB0eXBlPWNoZWNrYm94IGNsYXNzPVxcXCJhZy1maWx0ZXItY2hlY2tib3hcXFwiPiAoW1NFTEVDVCBBTExdKTwvbGFiZWw+PC9kaXY+PGRpdiBjbGFzcz1hZy1maWx0ZXItbGlzdC12aWV3cG9ydD48ZGl2IGNsYXNzPWFnLWZpbHRlci1saXN0LWNvbnRhaW5lcj48ZGl2IGlkPWl0ZW1Gb3JSZXBlYXQgY2xhc3M9YWctZmlsdGVyLWl0ZW0+PGxhYmVsPjxpbnB1dCB0eXBlPWNoZWNrYm94IGNsYXNzPWFnLWZpbHRlci1jaGVja2JveCBmaWx0ZXItY2hlY2tib3g9XFxcInRydWVcXFwiPiA8c3BhbiBjbGFzcz1hZy1maWx0ZXItdmFsdWU+PC9zcGFuPjwvbGFiZWw+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+XCI7XG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XHJcbnZhciBTZXRGaWx0ZXJNb2RlbCA9IHJlcXVpcmUoJy4vc2V0RmlsdGVyTW9kZWwnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9zZXRGaWx0ZXIuaHRtbCcpO1xyXG5cclxudmFyIERFRkFVTFRfUk9XX0hFSUdIVCA9IDIwO1xyXG5cclxuZnVuY3Rpb24gU2V0RmlsdGVyKHBhcmFtcykge1xyXG4gICAgdGhpcy5maWx0ZXJQYXJhbXMgPSBwYXJhbXMuZmlsdGVyUGFyYW1zO1xyXG4gICAgdGhpcy5yb3dIZWlnaHQgPSAodGhpcy5maWx0ZXJQYXJhbXMgJiYgdGhpcy5maWx0ZXJQYXJhbXMuY2VsbEhlaWdodCkgPyB0aGlzLmZpbHRlclBhcmFtcy5jZWxsSGVpZ2h0IDogREVGQVVMVF9ST1dfSEVJR0hUO1xyXG4gICAgdGhpcy5tb2RlbCA9IG5ldyBTZXRGaWx0ZXJNb2RlbChwYXJhbXMuY29sRGVmLCBwYXJhbXMucm93TW9kZWwsIHBhcmFtcy52YWx1ZUdldHRlcik7XHJcbiAgICB0aGlzLmZpbHRlckNoYW5nZWRDYWxsYmFjayA9IHBhcmFtcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2s7XHJcbiAgICB0aGlzLnZhbHVlR2V0dGVyID0gcGFyYW1zLnZhbHVlR2V0dGVyO1xyXG4gICAgdGhpcy5yb3dzSW5Cb2R5Q29udGFpbmVyID0ge307XHJcbiAgICB0aGlzLmNvbERlZiA9IHBhcmFtcy5jb2xEZWY7XHJcbiAgICB0aGlzLmxvY2FsZVRleHRGdW5jID0gcGFyYW1zLmxvY2FsZVRleHRGdW5jO1xyXG4gICAgaWYgKHRoaXMuZmlsdGVyUGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5jZWxsUmVuZGVyZXIgPSB0aGlzLmZpbHRlclBhcmFtcy5jZWxsUmVuZGVyZXI7XHJcbiAgICB9XHJcbiAgICB0aGlzLmNyZWF0ZUd1aSgpO1xyXG4gICAgdGhpcy5hZGRTY3JvbGxMaXN0ZW5lcigpO1xyXG4gICAgdGhpcy5jcmVhdGVBcGkoKTtcclxufVxyXG5cclxuLy8gd2UgbmVlZCB0byBoYXZlIHRoZSBndWkgYXR0YWNoZWQgYmVmb3JlIHdlIGNhbiBkcmF3IHRoZSB2aXJ0dWFsIHJvd3MsIGFzIHRoZVxyXG4vLyB2aXJ0dWFsIHJvdyBsb2dpYyBuZWVkcyBpbmZvIGFib3V0IHRoZSBndWkgc3RhdGVcclxuLyogcHVibGljICovXHJcblNldEZpbHRlci5wcm90b3R5cGUuYWZ0ZXJHdWlBdHRhY2hlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5kcmF3VmlydHVhbFJvd3MoKTtcclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmlzRmlsdGVyQWN0aXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbC5pc0ZpbHRlckFjdGl2ZSgpO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcblNldEZpbHRlci5wcm90b3R5cGUuZG9lc0ZpbHRlclBhc3MgPSBmdW5jdGlvbihub2RlKSB7XHJcblxyXG4gICAgLy9pZiBubyBmaWx0ZXIsIGFsd2F5cyBwYXNzXHJcbiAgICBpZiAodGhpcy5tb2RlbC5pc0V2ZXJ5dGhpbmdTZWxlY3RlZCgpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICAvL2lmIG5vdGhpbmcgc2VsZWN0ZWQgaW4gZmlsdGVyLCBhbHdheXMgZmFpbFxyXG4gICAgaWYgKHRoaXMubW9kZWwuaXNOb3RoaW5nU2VsZWN0ZWQoKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdmFsdWUgPSB0aGlzLnZhbHVlR2V0dGVyKG5vZGUpO1xyXG4gICAgdmFsdWUgPSB1dGlscy5tYWtlTnVsbCh2YWx1ZSk7XHJcblxyXG4gICAgdmFyIGZpbHRlclBhc3NlZCA9IHRoaXMubW9kZWwuaXNWYWx1ZVNlbGVjdGVkKHZhbHVlKTtcclxuICAgIHJldHVybiBmaWx0ZXJQYXNzZWQ7XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5nZXRHdWkgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmVHdWk7XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5vbk5ld1Jvd3NMb2FkZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBrZWVwU2VsZWN0aW9uID0gdGhpcy5maWx0ZXJQYXJhbXMgJiYgdGhpcy5maWx0ZXJQYXJhbXMubmV3Um93c0FjdGlvbiA9PT0gJ2tlZXAnO1xyXG4gICAgLy8gZGVmYXVsdCBpcyByZXNldFxyXG4gICAgdGhpcy5tb2RlbC5yZWZyZXNoVW5pcXVlVmFsdWVzKGtlZXBTZWxlY3Rpb24pO1xyXG4gICAgdGhpcy5zZXRDb250YWluZXJIZWlnaHQoKTtcclxuICAgIHRoaXMucmVmcmVzaFZpcnR1YWxSb3dzKCk7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmNyZWF0ZVRlbXBsYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGVtcGxhdGVcclxuICAgICAgICAucmVwbGFjZSgnW1NFTEVDVCBBTExdJywgdGhpcy5sb2NhbGVUZXh0RnVuYygnc2VsZWN0QWxsJywgJ1NlbGVjdCBBbGwnKSlcclxuICAgICAgICAucmVwbGFjZSgnW1NFQVJDSC4uLl0nLCB0aGlzLmxvY2FsZVRleHRGdW5jKCdzZWFyY2hPb28nLCAnU2VhcmNoLi4uJykpO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5jcmVhdGVHdWkgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgdGhpcy5lR3VpID0gdXRpbHMubG9hZFRlbXBsYXRlKHRoaXMuY3JlYXRlVGVtcGxhdGUoKSk7XHJcblxyXG4gICAgdGhpcy5lTGlzdENvbnRhaW5lciA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKFwiLmFnLWZpbHRlci1saXN0LWNvbnRhaW5lclwiKTtcclxuICAgIHRoaXMuZUZpbHRlclZhbHVlVGVtcGxhdGUgPSB0aGlzLmVHdWkucXVlcnlTZWxlY3RvcihcIiNpdGVtRm9yUmVwZWF0XCIpO1xyXG4gICAgdGhpcy5lU2VsZWN0QWxsID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIjc2VsZWN0QWxsXCIpO1xyXG4gICAgdGhpcy5lTGlzdFZpZXdwb3J0ID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIuYWctZmlsdGVyLWxpc3Qtdmlld3BvcnRcIik7XHJcbiAgICB0aGlzLmVNaW5pRmlsdGVyID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIuYWctZmlsdGVyLWZpbHRlclwiKTtcclxuICAgIHRoaXMuZUxpc3RDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gKHRoaXMubW9kZWwuZ2V0VW5pcXVlVmFsdWVDb3VudCgpICogdGhpcy5yb3dIZWlnaHQpICsgXCJweFwiO1xyXG5cclxuICAgIHRoaXMuc2V0Q29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICB0aGlzLmVNaW5pRmlsdGVyLnZhbHVlID0gdGhpcy5tb2RlbC5nZXRNaW5pRmlsdGVyKCk7XHJcbiAgICB1dGlscy5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLmVNaW5pRmlsdGVyLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBfdGhpcy5vbk1pbmlGaWx0ZXJDaGFuZ2VkKCk7XHJcbiAgICB9KTtcclxuICAgIHV0aWxzLnJlbW92ZUFsbENoaWxkcmVuKHRoaXMuZUxpc3RDb250YWluZXIpO1xyXG5cclxuICAgIHRoaXMuZVNlbGVjdEFsbC5vbmNsaWNrID0gdGhpcy5vblNlbGVjdEFsbC5iaW5kKHRoaXMpO1xyXG5cclxuICAgIGlmICh0aGlzLm1vZGVsLmlzRXZlcnl0aGluZ1NlbGVjdGVkKCkpIHtcclxuICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZVNlbGVjdEFsbC5jaGVja2VkID0gdHJ1ZTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5tb2RlbC5pc05vdGhpbmdTZWxlY3RlZCgpKSB7XHJcbiAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmVTZWxlY3RBbGwuY2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IHRydWU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLnNldENvbnRhaW5lckhlaWdodCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lTGlzdENvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSAodGhpcy5tb2RlbC5nZXREaXNwbGF5ZWRWYWx1ZUNvdW50KCkgKiB0aGlzLnJvd0hlaWdodCkgKyBcInB4XCI7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmRyYXdWaXJ0dWFsUm93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRvcFBpeGVsID0gdGhpcy5lTGlzdFZpZXdwb3J0LnNjcm9sbFRvcDtcclxuICAgIHZhciBib3R0b21QaXhlbCA9IHRvcFBpeGVsICsgdGhpcy5lTGlzdFZpZXdwb3J0Lm9mZnNldEhlaWdodDtcclxuXHJcbiAgICB2YXIgZmlyc3RSb3cgPSBNYXRoLmZsb29yKHRvcFBpeGVsIC8gdGhpcy5yb3dIZWlnaHQpO1xyXG4gICAgdmFyIGxhc3RSb3cgPSBNYXRoLmZsb29yKGJvdHRvbVBpeGVsIC8gdGhpcy5yb3dIZWlnaHQpO1xyXG5cclxuICAgIHRoaXMuZW5zdXJlUm93c1JlbmRlcmVkKGZpcnN0Um93LCBsYXN0Um93KTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUuZW5zdXJlUm93c1JlbmRlcmVkID0gZnVuY3Rpb24oc3RhcnQsIGZpbmlzaCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICAvL2F0IHRoZSBlbmQsIHRoaXMgYXJyYXkgd2lsbCBjb250YWluIHRoZSBpdGVtcyB3ZSBuZWVkIHRvIHJlbW92ZVxyXG4gICAgdmFyIHJvd3NUb1JlbW92ZSA9IE9iamVjdC5rZXlzKHRoaXMucm93c0luQm9keUNvbnRhaW5lcik7XHJcblxyXG4gICAgLy9hZGQgaW4gbmV3IHJvd3NcclxuICAgIGZvciAodmFyIHJvd0luZGV4ID0gc3RhcnQ7IHJvd0luZGV4IDw9IGZpbmlzaDsgcm93SW5kZXgrKykge1xyXG4gICAgICAgIC8vc2VlIGlmIGl0ZW0gYWxyZWFkeSB0aGVyZSwgYW5kIGlmIHllcywgdGFrZSBpdCBvdXQgb2YgdGhlICd0byByZW1vdmUnIGFycmF5XHJcbiAgICAgICAgaWYgKHJvd3NUb1JlbW92ZS5pbmRleE9mKHJvd0luZGV4LnRvU3RyaW5nKCkpID49IDApIHtcclxuICAgICAgICAgICAgcm93c1RvUmVtb3ZlLnNwbGljZShyb3dzVG9SZW1vdmUuaW5kZXhPZihyb3dJbmRleC50b1N0cmluZygpKSwgMSk7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL2NoZWNrIHRoaXMgcm93IGFjdHVhbGx5IGV4aXN0cyAoaW4gY2FzZSBvdmVyZmxvdyBidWZmZXIgd2luZG93IGV4Y2VlZHMgcmVhbCBkYXRhKVxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmdldERpc3BsYXllZFZhbHVlQ291bnQoKSA+IHJvd0luZGV4KSB7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMubW9kZWwuZ2V0RGlzcGxheWVkVmFsdWUocm93SW5kZXgpO1xyXG4gICAgICAgICAgICBfdGhpcy5pbnNlcnRSb3codmFsdWUsIHJvd0luZGV4KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy9hdCB0aGlzIHBvaW50LCBldmVyeXRoaW5nIGluIG91ciAncm93c1RvUmVtb3ZlJyAuIC4gLlxyXG4gICAgdGhpcy5yZW1vdmVWaXJ0dWFsUm93cyhyb3dzVG9SZW1vdmUpO1xyXG59O1xyXG5cclxuLy90YWtlcyBhcnJheSBvZiByb3cgaWQnc1xyXG5TZXRGaWx0ZXIucHJvdG90eXBlLnJlbW92ZVZpcnR1YWxSb3dzID0gZnVuY3Rpb24ocm93c1RvUmVtb3ZlKSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgcm93c1RvUmVtb3ZlLmZvckVhY2goZnVuY3Rpb24oaW5kZXhUb1JlbW92ZSkge1xyXG4gICAgICAgIHZhciBlUm93VG9SZW1vdmUgPSBfdGhpcy5yb3dzSW5Cb2R5Q29udGFpbmVyW2luZGV4VG9SZW1vdmVdO1xyXG4gICAgICAgIF90aGlzLmVMaXN0Q29udGFpbmVyLnJlbW92ZUNoaWxkKGVSb3dUb1JlbW92ZSk7XHJcbiAgICAgICAgZGVsZXRlIF90aGlzLnJvd3NJbkJvZHlDb250YWluZXJbaW5kZXhUb1JlbW92ZV07XHJcbiAgICB9KTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUuaW5zZXJ0Um93ID0gZnVuY3Rpb24odmFsdWUsIHJvd0luZGV4KSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIHZhciBlRmlsdGVyVmFsdWUgPSB0aGlzLmVGaWx0ZXJWYWx1ZVRlbXBsYXRlLmNsb25lTm9kZSh0cnVlKTtcclxuXHJcbiAgICB2YXIgdmFsdWVFbGVtZW50ID0gZUZpbHRlclZhbHVlLnF1ZXJ5U2VsZWN0b3IoXCIuYWctZmlsdGVyLXZhbHVlXCIpO1xyXG4gICAgaWYgKHRoaXMuY2VsbFJlbmRlcmVyKSB7XHJcbiAgICAgICAgLy9yZW5kZXJlciBwcm92aWRlZCwgc28gdXNlIGl0XHJcbiAgICAgICAgdmFyIHJlc3VsdEZyb21SZW5kZXJlciA9IHRoaXMuY2VsbFJlbmRlcmVyKHtcclxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh1dGlscy5pc05vZGUocmVzdWx0RnJvbVJlbmRlcmVyKSkge1xyXG4gICAgICAgICAgICAvL2EgZG9tIG5vZGUgb3IgZWxlbWVudCB3YXMgcmV0dXJuZWQsIHNvIGFkZCBjaGlsZFxyXG4gICAgICAgICAgICB2YWx1ZUVsZW1lbnQuYXBwZW5kQ2hpbGQocmVzdWx0RnJvbVJlbmRlcmVyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvL290aGVyd2lzZSBhc3N1bWUgaXQgd2FzIGh0bWwsIHNvIGp1c3QgaW5zZXJ0XHJcbiAgICAgICAgICAgIHZhbHVlRWxlbWVudC5pbm5lckhUTUwgPSByZXN1bHRGcm9tUmVuZGVyZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy9vdGhlcndpc2UgZGlzcGxheSBhcyBhIHN0cmluZ1xyXG4gICAgICAgIHZhciBibGFua3NUZXh0ID0gJygnICsgdGhpcy5sb2NhbGVUZXh0RnVuYygnYmxhbmtzJywgJ0JsYW5rcycpICsgJyknO1xyXG4gICAgICAgIHZhciBkaXNwbGF5TmFtZU9mVmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCA/IGJsYW5rc1RleHQgOiB2YWx1ZTtcclxuICAgICAgICB2YWx1ZUVsZW1lbnQuaW5uZXJIVE1MID0gZGlzcGxheU5hbWVPZlZhbHVlO1xyXG4gICAgfVxyXG4gICAgdmFyIGVDaGVja2JveCA9IGVGaWx0ZXJWYWx1ZS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRcIik7XHJcbiAgICBlQ2hlY2tib3guY2hlY2tlZCA9IHRoaXMubW9kZWwuaXNWYWx1ZVNlbGVjdGVkKHZhbHVlKTtcclxuXHJcbiAgICBlQ2hlY2tib3gub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF90aGlzLm9uQ2hlY2tib3hDbGlja2VkKGVDaGVja2JveCwgdmFsdWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBlRmlsdGVyVmFsdWUuc3R5bGUudG9wID0gKHRoaXMucm93SGVpZ2h0ICogcm93SW5kZXgpICsgXCJweFwiO1xyXG5cclxuICAgIHRoaXMuZUxpc3RDb250YWluZXIuYXBwZW5kQ2hpbGQoZUZpbHRlclZhbHVlKTtcclxuICAgIHRoaXMucm93c0luQm9keUNvbnRhaW5lcltyb3dJbmRleF0gPSBlRmlsdGVyVmFsdWU7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLm9uQ2hlY2tib3hDbGlja2VkID0gZnVuY3Rpb24oZUNoZWNrYm94LCB2YWx1ZSkge1xyXG4gICAgdmFyIGNoZWNrZWQgPSBlQ2hlY2tib3guY2hlY2tlZDtcclxuICAgIGlmIChjaGVja2VkKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZWxlY3RWYWx1ZSh2YWx1ZSk7XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwuaXNFdmVyeXRoaW5nU2VsZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmVTZWxlY3RBbGwuY2hlY2tlZCA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmluZGV0ZXJtaW5hdGUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC51bnNlbGVjdFZhbHVlKHZhbHVlKTtcclxuICAgICAgICAvL2lmIHNldCBpcyBlbXB0eSwgbm90aGluZyBpcyBzZWxlY3RlZFxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmlzTm90aGluZ1NlbGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmNoZWNrZWQgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrKCk7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLm9uTWluaUZpbHRlckNoYW5nZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtaW5pRmlsdGVyQ2hhbmdlZCA9IHRoaXMubW9kZWwuc2V0TWluaUZpbHRlcih0aGlzLmVNaW5pRmlsdGVyLnZhbHVlKTtcclxuICAgIGlmIChtaW5pRmlsdGVyQ2hhbmdlZCkge1xyXG4gICAgICAgIHRoaXMuc2V0Q29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgICAgdGhpcy5yZWZyZXNoVmlydHVhbFJvd3MoKTtcclxuICAgIH1cclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUucmVmcmVzaFZpcnR1YWxSb3dzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmNsZWFyVmlydHVhbFJvd3MoKTtcclxuICAgIHRoaXMuZHJhd1ZpcnR1YWxSb3dzKCk7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmNsZWFyVmlydHVhbFJvd3MgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciByb3dzVG9SZW1vdmUgPSBPYmplY3Qua2V5cyh0aGlzLnJvd3NJbkJvZHlDb250YWluZXIpO1xyXG4gICAgdGhpcy5yZW1vdmVWaXJ0dWFsUm93cyhyb3dzVG9SZW1vdmUpO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5vblNlbGVjdEFsbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNoZWNrZWQgPSB0aGlzLmVTZWxlY3RBbGwuY2hlY2tlZDtcclxuICAgIGlmIChjaGVja2VkKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZWxlY3RFdmVyeXRoaW5nKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubW9kZWwuc2VsZWN0Tm90aGluZygpO1xyXG4gICAgfVxyXG4gICAgdGhpcy51cGRhdGVBbGxDaGVja2JveGVzKGNoZWNrZWQpO1xyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2soKTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUudXBkYXRlQWxsQ2hlY2tib3hlcyA9IGZ1bmN0aW9uKGNoZWNrZWQpIHtcclxuICAgIHZhciBjdXJyZW50bHlEaXNwbGF5ZWRDaGVja2JveGVzID0gdGhpcy5lTGlzdENvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiW2ZpbHRlci1jaGVja2JveD10cnVlXVwiKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY3VycmVudGx5RGlzcGxheWVkQ2hlY2tib3hlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBjdXJyZW50bHlEaXNwbGF5ZWRDaGVja2JveGVzW2ldLmNoZWNrZWQgPSBjaGVja2VkO1xyXG4gICAgfVxyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5hZGRTY3JvbGxMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICB0aGlzLmVMaXN0Vmlld3BvcnQuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBfdGhpcy5kcmF3VmlydHVhbFJvd3MoKTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5nZXRBcGkgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmFwaTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUuY3JlYXRlQXBpID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbW9kZWwgPSB0aGlzLm1vZGVsO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5hcGkgPSB7XHJcbiAgICAgICAgc2V0TWluaUZpbHRlcjogZnVuY3Rpb24obmV3TWluaUZpbHRlcikge1xyXG4gICAgICAgICAgICBtb2RlbC5zZXRNaW5pRmlsdGVyKG5ld01pbmlGaWx0ZXIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0TWluaUZpbHRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5nZXRNaW5pRmlsdGVyKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZWxlY3RFdmVyeXRoaW5nOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbW9kZWwuc2VsZWN0RXZlcnl0aGluZygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNGaWx0ZXJBY3RpdmU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuaXNGaWx0ZXJBY3RpdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdE5vdGhpbmc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBtb2RlbC5zZWxlY3ROb3RoaW5nKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1bnNlbGVjdFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICBtb2RlbC51bnNlbGVjdFZhbHVlKHZhbHVlKTtcclxuICAgICAgICAgICAgdGhhdC5yZWZyZXNoVmlydHVhbFJvd3MoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICBtb2RlbC5zZWxlY3RWYWx1ZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIHRoYXQucmVmcmVzaFZpcnR1YWxSb3dzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc1ZhbHVlU2VsZWN0ZWQ6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5pc1ZhbHVlU2VsZWN0ZWQodmFsdWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNFdmVyeXRoaW5nU2VsZWN0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuaXNFdmVyeXRoaW5nU2VsZWN0ZWQoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzTm90aGluZ1NlbGVjdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmlzTm90aGluZ1NlbGVjdGVkKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRVbmlxdWVWYWx1ZUNvdW50OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmdldFVuaXF1ZVZhbHVlQ291bnQoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFVuaXF1ZVZhbHVlOiBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuZ2V0VW5pcXVlVmFsdWUoaW5kZXgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0TW9kZWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuZ2V0TW9kZWwoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldE1vZGVsOiBmdW5jdGlvbihkYXRhTW9kZWwpIHtcclxuICAgICAgICAgICAgbW9kZWwuc2V0TW9kZWwoZGF0YU1vZGVsKTtcclxuICAgICAgICAgICAgdGhhdC5yZWZyZXNoVmlydHVhbFJvd3MoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZXRGaWx0ZXI7XHJcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcblxyXG5mdW5jdGlvbiBTZXRGaWx0ZXJNb2RlbChjb2xEZWYsIHJvd01vZGVsLCB2YWx1ZUdldHRlcikge1xyXG4gICAgdGhpcy5jb2xEZWYgPSBjb2xEZWY7XHJcbiAgICB0aGlzLnJvd01vZGVsID0gcm93TW9kZWw7XHJcbiAgICB0aGlzLnZhbHVlR2V0dGVyID0gdmFsdWVHZXR0ZXI7XHJcblxyXG4gICAgdGhpcy5jcmVhdGVVbmlxdWVWYWx1ZXMoKTtcclxuXHJcbiAgICAvLyBieSBkZWZhdWx0LCBubyBmaWx0ZXIsIHNvIHdlIGRpc3BsYXkgZXZlcnl0aGluZ1xyXG4gICAgdGhpcy5kaXNwbGF5ZWRWYWx1ZXMgPSB0aGlzLnVuaXF1ZVZhbHVlcztcclxuICAgIHRoaXMubWluaUZpbHRlciA9IG51bGw7XHJcbiAgICAvL3dlIHVzZSBhIG1hcCByYXRoZXIgdGhhbiBhbiBhcnJheSBmb3IgdGhlIHNlbGVjdGVkIHZhbHVlcyBhcyB0aGUgbG9va3VwXHJcbiAgICAvL2ZvciBhIG1hcCBpcyBtdWNoIGZhc3RlciB0aGFuIHRoZSBsb29rdXAgZm9yIGFuIGFycmF5LCBlc3BlY2lhbGx5IHdoZW5cclxuICAgIC8vdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXkgaXMgdGhvdXNhbmRzIG9mIHJlY29yZHMgbG9uZ1xyXG4gICAgdGhpcy5zZWxlY3RlZFZhbHVlc01hcCA9IHt9O1xyXG4gICAgdGhpcy5zZWxlY3RFdmVyeXRoaW5nKCk7XHJcbn1cclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5yZWZyZXNoVW5pcXVlVmFsdWVzID0gZnVuY3Rpb24oa2VlcFNlbGVjdGlvbikge1xyXG4gICAgdGhpcy5jcmVhdGVVbmlxdWVWYWx1ZXMoKTtcclxuXHJcbiAgICB2YXIgb2xkTW9kZWwgPSBPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkVmFsdWVzTWFwKTtcclxuXHJcbiAgICB0aGlzLnNlbGVjdGVkVmFsdWVzTWFwID0ge307XHJcbiAgICB0aGlzLmZpbHRlckRpc3BsYXllZFZhbHVlcygpO1xyXG5cclxuICAgIGlmIChrZWVwU2VsZWN0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5zZXRNb2RlbChvbGRNb2RlbCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0RXZlcnl0aGluZygpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmNyZWF0ZVVuaXF1ZVZhbHVlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuY29sRGVmLmZpbHRlclBhcmFtcyAmJiB0aGlzLmNvbERlZi5maWx0ZXJQYXJhbXMudmFsdWVzKSB7XHJcbiAgICAgICAgdGhpcy51bmlxdWVWYWx1ZXMgPSB1dGlscy50b1N0cmluZ3ModGhpcy5jb2xEZWYuZmlsdGVyUGFyYW1zLnZhbHVlcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMudW5pcXVlVmFsdWVzID0gdXRpbHMudG9TdHJpbmdzKHRoaXMuaXRlcmF0ZVRocm91Z2hOb2Rlc0ZvclZhbHVlcygpKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgYmxhID0gJyc7XHJcbiAgICB0aGlzLnVuaXF1ZVZhbHVlcy5mb3JFYWNoKCBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgYmxhICs9ICdcXCcnICsgaXRlbSArICdcXCcsJ1xyXG4gICAgfSk7XHJcbiAgICBjb25zb2xlLmxvZyhibGEpO1xyXG5cclxuICAgIGlmICh0aGlzLmNvbERlZi5jb21wYXJhdG9yKSB7XHJcbiAgICAgICAgdGhpcy51bmlxdWVWYWx1ZXMuc29ydCh0aGlzLmNvbERlZi5jb21wYXJhdG9yKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy51bmlxdWVWYWx1ZXMuc29ydCh1dGlscy5kZWZhdWx0Q29tcGFyYXRvcik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5TZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuaXRlcmF0ZVRocm91Z2hOb2Rlc0ZvclZhbHVlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHVuaXF1ZUNoZWNrID0ge307XHJcbiAgICB2YXIgcmVzdWx0ID0gW107XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJlY3Vyc2l2ZWx5UHJvY2Vzcyhub2Rlcykge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICAgICAgaWYgKG5vZGUuZ3JvdXAgJiYgIW5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBncm91cCBub2RlLCBzbyBkaWcgZGVlcGVyXHJcbiAgICAgICAgICAgICAgICByZWN1cnNpdmVseVByb2Nlc3Mobm9kZS5jaGlsZHJlbik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSB0aGF0LnZhbHVlR2V0dGVyKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSBcIlwiIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIXVuaXF1ZUNoZWNrLmhhc093blByb3BlcnR5KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB1bmlxdWVDaGVja1t2YWx1ZV0gPSAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciB0b3BMZXZlbE5vZGVzID0gdGhpcy5yb3dNb2RlbC5nZXRUb3BMZXZlbE5vZGVzKCk7XHJcbiAgICByZWN1cnNpdmVseVByb2Nlc3ModG9wTGV2ZWxOb2Rlcyk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcbi8vc2V0cyBtaW5pIGZpbHRlci4gcmV0dXJucyB0cnVlIGlmIGl0IGNoYW5nZWQgZnJvbSBsYXN0IHZhbHVlLCBvdGhlcndpc2UgZmFsc2VcclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLnNldE1pbmlGaWx0ZXIgPSBmdW5jdGlvbihuZXdNaW5pRmlsdGVyKSB7XHJcbiAgICBuZXdNaW5pRmlsdGVyID0gdXRpbHMubWFrZU51bGwobmV3TWluaUZpbHRlcik7XHJcbiAgICBpZiAodGhpcy5taW5pRmlsdGVyID09PSBuZXdNaW5pRmlsdGVyKSB7XHJcbiAgICAgICAgLy9kbyBub3RoaW5nIGlmIGZpbHRlciBoYXMgbm90IGNoYW5nZWRcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLm1pbmlGaWx0ZXIgPSBuZXdNaW5pRmlsdGVyO1xyXG4gICAgdGhpcy5maWx0ZXJEaXNwbGF5ZWRWYWx1ZXMoKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmdldE1pbmlGaWx0ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLm1pbmlGaWx0ZXI7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuZmlsdGVyRGlzcGxheWVkVmFsdWVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBpZiBubyBmaWx0ZXIsIGp1c3QgdXNlIHRoZSB1bmlxdWUgdmFsdWVzXHJcbiAgICBpZiAodGhpcy5taW5pRmlsdGVyID09PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5ZWRWYWx1ZXMgPSB0aGlzLnVuaXF1ZVZhbHVlcztcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgZmlsdGVyIHByZXNlbnQsIHdlIGZpbHRlciBkb3duIHRoZSBsaXN0XHJcbiAgICB0aGlzLmRpc3BsYXllZFZhbHVlcyA9IFtdO1xyXG4gICAgdmFyIG1pbmlGaWx0ZXJVcHBlckNhc2UgPSB0aGlzLm1pbmlGaWx0ZXIudG9VcHBlckNhc2UoKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy51bmlxdWVWYWx1ZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHVuaXF1ZVZhbHVlID0gdGhpcy51bmlxdWVWYWx1ZXNbaV07XHJcbiAgICAgICAgaWYgKHVuaXF1ZVZhbHVlICE9PSBudWxsICYmIHVuaXF1ZVZhbHVlLnRvU3RyaW5nKCkudG9VcHBlckNhc2UoKS5pbmRleE9mKG1pbmlGaWx0ZXJVcHBlckNhc2UpID49IDApIHtcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5ZWRWYWx1ZXMucHVzaCh1bmlxdWVWYWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5nZXREaXNwbGF5ZWRWYWx1ZUNvdW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5kaXNwbGF5ZWRWYWx1ZXMubGVuZ3RoO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmdldERpc3BsYXllZFZhbHVlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIHJldHVybiB0aGlzLmRpc3BsYXllZFZhbHVlc1tpbmRleF07XHJcbn07XHJcblxyXG5TZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuc2VsZWN0RXZlcnl0aGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNvdW50ID0gdGhpcy51bmlxdWVWYWx1ZXMubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy51bmlxdWVWYWx1ZXNbaV07XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZFZhbHVlc01hcFt2YWx1ZV0gPSBudWxsO1xyXG4gICAgfVxyXG4gICAgdGhpcy5zZWxlY3RlZFZhbHVlc0NvdW50ID0gY291bnQ7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuaXNGaWx0ZXJBY3RpdmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLnVuaXF1ZVZhbHVlcy5sZW5ndGggIT09IHRoaXMuc2VsZWN0ZWRWYWx1ZXNDb3VudDtcclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5zZWxlY3ROb3RoaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNlbGVjdGVkVmFsdWVzTWFwID0ge307XHJcbiAgICB0aGlzLnNlbGVjdGVkVmFsdWVzQ291bnQgPSAwO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmdldFVuaXF1ZVZhbHVlQ291bnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLnVuaXF1ZVZhbHVlcy5sZW5ndGg7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuZ2V0VW5pcXVlVmFsdWUgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgcmV0dXJuIHRoaXMudW5pcXVlVmFsdWVzW2luZGV4XTtcclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS51bnNlbGVjdFZhbHVlID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgIGlmICh0aGlzLnNlbGVjdGVkVmFsdWVzTWFwW3ZhbHVlXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuc2VsZWN0ZWRWYWx1ZXNNYXBbdmFsdWVdO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRWYWx1ZXNDb3VudC0tO1xyXG4gICAgfVxyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLnNlbGVjdFZhbHVlID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgIGlmICh0aGlzLnNlbGVjdGVkVmFsdWVzTWFwW3ZhbHVlXSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZFZhbHVlc01hcFt2YWx1ZV0gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRWYWx1ZXNDb3VudCsrO1xyXG4gICAgfVxyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmlzVmFsdWVTZWxlY3RlZCA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZWxlY3RlZFZhbHVlc01hcFt2YWx1ZV0gIT09IHVuZGVmaW5lZDtcclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5pc0V2ZXJ5dGhpbmdTZWxlY3RlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudW5pcXVlVmFsdWVzLmxlbmd0aCA9PT0gdGhpcy5zZWxlY3RlZFZhbHVlc0NvdW50O1xyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmlzTm90aGluZ1NlbGVjdGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy51bmlxdWVWYWx1ZXMubGVuZ3RoID09PSAwO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmdldE1vZGVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoIXRoaXMuaXNGaWx0ZXJBY3RpdmUoKSkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgdmFyIHNlbGVjdGVkVmFsdWVzID0gW107XHJcbiAgICB1dGlscy5pdGVyYXRlT2JqZWN0KHRoaXMuc2VsZWN0ZWRWYWx1ZXNNYXAsIGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIHNlbGVjdGVkVmFsdWVzLnB1c2goa2V5KTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHNlbGVjdGVkVmFsdWVzO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLnNldE1vZGVsID0gZnVuY3Rpb24obW9kZWwpIHtcclxuICAgIGlmIChtb2RlbCkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0Tm90aGluZygpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpPG1vZGVsLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBuZXdWYWx1ZSA9IG1vZGVsW2ldO1xyXG4gICAgICAgICAgICBpZiAodGhpcy51bmlxdWVWYWx1ZXMuaW5kZXhPZihuZXdWYWx1ZSk+PTApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0VmFsdWUobW9kZWxbaV0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdWYWx1ZSAnICsgbmV3VmFsdWUgKyAnIGlzIG5vdCBhIHZhbGlkIHZhbHVlIGZvciBmaWx0ZXInKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RFdmVyeXRoaW5nKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNldEZpbHRlck1vZGVsO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPGRpdj48ZGl2PjxzZWxlY3QgY2xhc3M9YWctZmlsdGVyLXNlbGVjdCBpZD1maWx0ZXJUeXBlPjxvcHRpb24gdmFsdWU9MT5bQ09OVEFJTlNdPC9vcHRpb24+PG9wdGlvbiB2YWx1ZT0yPltFUVVBTFNdPC9vcHRpb24+PG9wdGlvbiB2YWx1ZT0zPltTVEFSVFMgV0lUSF08L29wdGlvbj48b3B0aW9uIHZhbHVlPTQ+W0VORFMgV0lUSF08L29wdGlvbj48L3NlbGVjdD48L2Rpdj48ZGl2PjxpbnB1dCBjbGFzcz1hZy1maWx0ZXItZmlsdGVyIGlkPWZpbHRlclRleHQgdHlwZT10ZXh0IHBsYWNlaG9sZGVyPVxcXCJbRklMVEVSLi4uXVxcXCI+PC9kaXY+PC9kaXY+XCI7XG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL3RleHRGaWx0ZXIuaHRtbCcpO1xyXG5cclxudmFyIENPTlRBSU5TID0gMTtcclxudmFyIEVRVUFMUyA9IDI7XHJcbnZhciBTVEFSVFNfV0lUSCA9IDM7XHJcbnZhciBFTkRTX1dJVEggPSA0O1xyXG5cclxuZnVuY3Rpb24gVGV4dEZpbHRlcihwYXJhbXMpIHtcclxuICAgIHRoaXMuZmlsdGVyUGFyYW1zID0gcGFyYW1zLmZpbHRlclBhcmFtcztcclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrID0gcGFyYW1zLmZpbHRlckNoYW5nZWRDYWxsYmFjaztcclxuICAgIHRoaXMubG9jYWxlVGV4dEZ1bmMgPSBwYXJhbXMubG9jYWxlVGV4dEZ1bmM7XHJcbiAgICB0aGlzLnZhbHVlR2V0dGVyID0gcGFyYW1zLnZhbHVlR2V0dGVyO1xyXG4gICAgdGhpcy5jcmVhdGVHdWkoKTtcclxuICAgIHRoaXMuZmlsdGVyVGV4dCA9IG51bGw7XHJcbiAgICB0aGlzLmZpbHRlclR5cGUgPSBDT05UQUlOUztcclxuICAgIHRoaXMuY3JlYXRlQXBpKCk7XHJcbn1cclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5UZXh0RmlsdGVyLnByb3RvdHlwZS5vbk5ld1Jvd3NMb2FkZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBrZWVwU2VsZWN0aW9uID0gdGhpcy5maWx0ZXJQYXJhbXMgJiYgdGhpcy5maWx0ZXJQYXJhbXMubmV3Um93c0FjdGlvbiA9PT0gJ2tlZXAnO1xyXG4gICAgaWYgKCFrZWVwU2VsZWN0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5hcGkuc2V0VHlwZShDT05UQUlOUyk7XHJcbiAgICAgICAgdGhpcy5hcGkuc2V0RmlsdGVyKG51bGwpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLmFmdGVyR3VpQXR0YWNoZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZUZpbHRlclRleHRGaWVsZC5mb2N1cygpO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLmRvZXNGaWx0ZXJQYXNzID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKCF0aGlzLmZpbHRlclRleHQpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHZhciB2YWx1ZSA9IHRoaXMudmFsdWVHZXR0ZXIobm9kZSk7XHJcbiAgICBpZiAoIXZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdmFyIHZhbHVlTG93ZXJDYXNlID0gdmFsdWUudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgc3dpdGNoICh0aGlzLmZpbHRlclR5cGUpIHtcclxuICAgICAgICBjYXNlIENPTlRBSU5TOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVMb3dlckNhc2UuaW5kZXhPZih0aGlzLmZpbHRlclRleHQpID49IDA7XHJcbiAgICAgICAgY2FzZSBFUVVBTFM6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZUxvd2VyQ2FzZSA9PT0gdGhpcy5maWx0ZXJUZXh0O1xyXG4gICAgICAgIGNhc2UgU1RBUlRTX1dJVEg6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZUxvd2VyQ2FzZS5pbmRleE9mKHRoaXMuZmlsdGVyVGV4dCkgPT09IDA7XHJcbiAgICAgICAgY2FzZSBFTkRTX1dJVEg6XHJcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHZhbHVlTG93ZXJDYXNlLmluZGV4T2YodGhpcy5maWx0ZXJUZXh0KTtcclxuICAgICAgICAgICAgcmV0dXJuIGluZGV4ID49IDAgJiYgaW5kZXggPT09ICh2YWx1ZUxvd2VyQ2FzZS5sZW5ndGggLSB0aGlzLmZpbHRlclRleHQubGVuZ3RoKTtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvLyBzaG91bGQgbmV2ZXIgaGFwcGVuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbnZhbGlkIGZpbHRlciB0eXBlICcgKyB0aGlzLmZpbHRlclR5cGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuVGV4dEZpbHRlci5wcm90b3R5cGUuZ2V0R3VpID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lR3VpO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLmlzRmlsdGVyQWN0aXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJUZXh0ICE9PSBudWxsO1xyXG59O1xyXG5cclxuVGV4dEZpbHRlci5wcm90b3R5cGUuY3JlYXRlVGVtcGxhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0ZW1wbGF0ZVxyXG4gICAgICAgIC5yZXBsYWNlKCdbRklMVEVSLi4uXScsIHRoaXMubG9jYWxlVGV4dEZ1bmMoJ2ZpbHRlck9vbycsICdGaWx0ZXIuLi4nKSlcclxuICAgICAgICAucmVwbGFjZSgnW0VRVUFMU10nLCB0aGlzLmxvY2FsZVRleHRGdW5jKCdlcXVhbHMnLCAnRXF1YWxzJykpXHJcbiAgICAgICAgLnJlcGxhY2UoJ1tDT05UQUlOU10nLCB0aGlzLmxvY2FsZVRleHRGdW5jKCdjb250YWlucycsICdDb250YWlucycpKVxyXG4gICAgICAgIC5yZXBsYWNlKCdbU1RBUlRTIFdJVEhdJywgdGhpcy5sb2NhbGVUZXh0RnVuYygnc3RhcnRzV2l0aCcsICdTdGFydHMgd2l0aCcpKVxyXG4gICAgICAgIC5yZXBsYWNlKCdbRU5EUyBXSVRIXScsIHRoaXMubG9jYWxlVGV4dEZ1bmMoJ2VuZHNXaXRoJywgJ0VuZHMgd2l0aCcpKVxyXG47XHJcbn07XHJcblxyXG4nPG9wdGlvbiB2YWx1ZT1cIjFcIj5Db250YWluczwvb3B0aW9uPicsXHJcbiAgICAnPG9wdGlvbiB2YWx1ZT1cIjJcIj5FcXVhbHM8L29wdGlvbj4nLFxyXG4gICAgJzxvcHRpb24gdmFsdWU9XCIzXCI+U3RhcnRzIHdpdGg8L29wdGlvbj4nLFxyXG4gICAgJzxvcHRpb24gdmFsdWU9XCI0XCI+RW5kcyB3aXRoPC9vcHRpb24+JyxcclxuXHJcblxyXG5UZXh0RmlsdGVyLnByb3RvdHlwZS5jcmVhdGVHdWkgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZUd1aSA9IHV0aWxzLmxvYWRUZW1wbGF0ZSh0aGlzLmNyZWF0ZVRlbXBsYXRlKCkpO1xyXG4gICAgdGhpcy5lRmlsdGVyVGV4dEZpZWxkID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIjZmlsdGVyVGV4dFwiKTtcclxuICAgIHRoaXMuZVR5cGVTZWxlY3QgPSB0aGlzLmVHdWkucXVlcnlTZWxlY3RvcihcIiNmaWx0ZXJUeXBlXCIpO1xyXG5cclxuICAgIHV0aWxzLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuZUZpbHRlclRleHRGaWVsZCwgdGhpcy5vbkZpbHRlckNoYW5nZWQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmVUeXBlU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgdGhpcy5vblR5cGVDaGFuZ2VkLmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuVGV4dEZpbHRlci5wcm90b3R5cGUub25UeXBlQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5maWx0ZXJUeXBlID0gcGFyc2VJbnQodGhpcy5lVHlwZVNlbGVjdC52YWx1ZSk7XHJcbiAgICB0aGlzLmZpbHRlckNoYW5nZWRDYWxsYmFjaygpO1xyXG59O1xyXG5cclxuVGV4dEZpbHRlci5wcm90b3R5cGUub25GaWx0ZXJDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZmlsdGVyVGV4dCA9IHV0aWxzLm1ha2VOdWxsKHRoaXMuZUZpbHRlclRleHRGaWVsZC52YWx1ZSk7XHJcbiAgICBpZiAoZmlsdGVyVGV4dCAmJiBmaWx0ZXJUZXh0LnRyaW0oKSA9PT0gJycpIHtcclxuICAgICAgICBmaWx0ZXJUZXh0ID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmIChmaWx0ZXJUZXh0KSB7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJUZXh0ID0gZmlsdGVyVGV4dC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmZpbHRlclRleHQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2soKTtcclxufTtcclxuXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLmNyZWF0ZUFwaSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5hcGkgPSB7XHJcbiAgICAgICAgRVFVQUxTOiBFUVVBTFMsXHJcbiAgICAgICAgQ09OVEFJTlM6IENPTlRBSU5TLFxyXG4gICAgICAgIFNUQVJUU19XSVRIOiBTVEFSVFNfV0lUSCxcclxuICAgICAgICBFTkRTX1dJVEg6IEVORFNfV0lUSCxcclxuICAgICAgICBzZXRUeXBlOiBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICAgICAgICAgIHRoYXQuZmlsdGVyVHlwZSA9IHR5cGU7XHJcbiAgICAgICAgICAgIHRoYXQuZVR5cGVTZWxlY3QudmFsdWUgPSB0eXBlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0RmlsdGVyOiBmdW5jdGlvbihmaWx0ZXIpIHtcclxuICAgICAgICAgICAgZmlsdGVyID0gdXRpbHMubWFrZU51bGwoZmlsdGVyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuZmlsdGVyVGV4dCA9IGZpbHRlci50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5lRmlsdGVyVGV4dEZpZWxkLnZhbHVlID0gZmlsdGVyO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5maWx0ZXJUZXh0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoYXQuZUZpbHRlclRleHRGaWVsZC52YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFR5cGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5maWx0ZXJUeXBlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0RmlsdGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZmlsdGVyVGV4dDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldE1vZGVsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoYXQuaXNGaWx0ZXJBY3RpdmUoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiB0aGF0LmZpbHRlclR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyOiB0aGF0LmZpbHRlclRleHRcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0TW9kZWw6IGZ1bmN0aW9uKGRhdGFNb2RlbCkge1xyXG4gICAgICAgICAgICBpZiAoZGF0YU1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFR5cGUoZGF0YU1vZGVsLnR5cGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRGaWx0ZXIoZGF0YU1vZGVsLmZpbHRlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEZpbHRlcihudWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG5UZXh0RmlsdGVyLnByb3RvdHlwZS5nZXRBcGkgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmFwaTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGV4dEZpbHRlcjtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxkaXYgY2xhc3M9XFxcImFnLXJvb3QgYWctc2Nyb2xsc1xcXCI+PGRpdiBjbGFzcz1hZy1sb2FkaW5nLXBhbmVsPjxkaXYgY2xhc3M9YWctbG9hZGluZy13cmFwcGVyPjxzcGFuIGNsYXNzPWFnLWxvYWRpbmctY2VudGVyPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1hZy1oZWFkZXI+PGRpdiBjbGFzcz1hZy1waW5uZWQtaGVhZGVyPjwvZGl2PjxkaXYgY2xhc3M9YWctaGVhZGVyLXZpZXdwb3J0PjxkaXYgY2xhc3M9YWctaGVhZGVyLWNvbnRhaW5lcj48L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPWFnLWJvZHk+PGRpdiBjbGFzcz1hZy1waW5uZWQtY29scy12aWV3cG9ydD48ZGl2IGNsYXNzPWFnLXBpbm5lZC1jb2xzLWNvbnRhaW5lcj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPWFnLWJvZHktdmlld3BvcnQtd3JhcHBlcj48ZGl2IGNsYXNzPWFnLWJvZHktdmlld3BvcnQ+PGRpdiBjbGFzcz1hZy1ib2R5LWNvbnRhaW5lcj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPWFnLXBhZ2luZy1wYW5lbD48L2Rpdj48L2Rpdj5cIjtcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxudmFyIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XHJcbnZhciBHcmlkT3B0aW9uc1dyYXBwZXIgPSByZXF1aXJlKCcuL2dyaWRPcHRpb25zV3JhcHBlcicpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL2dyaWQuaHRtbCcpO1xyXG52YXIgdGVtcGxhdGVOb1Njcm9sbHMgPSByZXF1aXJlKCcuL2dyaWROb1Njcm9sbHMuaHRtbCcpO1xyXG52YXIgU2VsZWN0aW9uQ29udHJvbGxlciA9IHJlcXVpcmUoJy4vc2VsZWN0aW9uQ29udHJvbGxlcicpO1xyXG52YXIgRmlsdGVyTWFuYWdlciA9IHJlcXVpcmUoJy4vZmlsdGVyL2ZpbHRlck1hbmFnZXInKTtcclxudmFyIFNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSA9IHJlcXVpcmUoJy4vc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5Jyk7XHJcbnZhciBDb2x1bW5Db250cm9sbGVyID0gcmVxdWlyZSgnLi9jb2x1bW5Db250cm9sbGVyJyk7XHJcbnZhciBSb3dSZW5kZXJlciA9IHJlcXVpcmUoJy4vcm93UmVuZGVyZXInKTtcclxudmFyIEhlYWRlclJlbmRlcmVyID0gcmVxdWlyZSgnLi9oZWFkZXJSZW5kZXJlcicpO1xyXG52YXIgSW5NZW1vcnlSb3dDb250cm9sbGVyID0gcmVxdWlyZSgnLi9yb3dDb250cm9sbGVycy9pbk1lbW9yeVJvd0NvbnRyb2xsZXInKTtcclxudmFyIFZpcnR1YWxQYWdlUm93Q29udHJvbGxlciA9IHJlcXVpcmUoJy4vcm93Q29udHJvbGxlcnMvdmlydHVhbFBhZ2VSb3dDb250cm9sbGVyJyk7XHJcbnZhciBQYWdpbmF0aW9uQ29udHJvbGxlciA9IHJlcXVpcmUoJy4vcm93Q29udHJvbGxlcnMvcGFnaW5hdGlvbkNvbnRyb2xsZXInKTtcclxudmFyIEV4cHJlc3Npb25TZXJ2aWNlID0gcmVxdWlyZSgnLi9leHByZXNzaW9uU2VydmljZScpO1xyXG52YXIgVGVtcGxhdGVTZXJ2aWNlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZVNlcnZpY2UnKTtcclxudmFyIFRvb2xQYW5lbCA9IHJlcXVpcmUoJy4vdG9vbFBhbmVsL3Rvb2xQYW5lbCcpO1xyXG5cclxuZnVuY3Rpb24gR3JpZChlR3JpZERpdiwgZ3JpZE9wdGlvbnMsICRzY29wZSwgJGNvbXBpbGUsIHF1aWNrRmlsdGVyT25TY29wZSkge1xyXG5cclxuICAgIHRoaXMuYWRkRW52aXJvbm1lbnRDbGFzc2VzKGVHcmlkRGl2KTtcclxuXHJcbiAgICB0aGlzLmdyaWRPcHRpb25zID0gZ3JpZE9wdGlvbnM7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IG5ldyBHcmlkT3B0aW9uc1dyYXBwZXIodGhpcy5ncmlkT3B0aW9ucyk7XHJcblxyXG4gICAgdmFyIHVzZVNjcm9sbHMgPSAhdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpO1xyXG4gICAgaWYgKHVzZVNjcm9sbHMpIHtcclxuICAgICAgICBlR3JpZERpdi5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZUdyaWREaXYuaW5uZXJIVE1MID0gdGVtcGxhdGVOb1Njcm9sbHM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzU3VwcHJlc3NWZXJ0aWNhbFNjcm9sbCgpICYmICF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0RvbnRVc2VTY3JvbGxzKCkpIHtcclxuICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhlR3JpZERpdiwgJ2FnLW5vLXZlcnRpY2FsLXNjcm9sbCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHRoaXMucXVpY2tGaWx0ZXIgPSBudWxsO1xyXG5cclxuICAgIC8vIGlmIHVzaW5nIGFuZ3VsYXIsIHdhdGNoIGZvciBxdWlja0ZpbHRlciBjaGFuZ2VzXHJcbiAgICBpZiAoJHNjb3BlKSB7XHJcbiAgICAgICAgJHNjb3BlLiR3YXRjaChxdWlja0ZpbHRlck9uU2NvcGUsIGZ1bmN0aW9uKG5ld0ZpbHRlcikge1xyXG4gICAgICAgICAgICB0aGF0Lm9uUXVpY2tGaWx0ZXJDaGFuZ2VkKG5ld0ZpbHRlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzID0ge307XHJcblxyXG4gICAgdGhpcy5hZGRBcGkoKTtcclxuICAgIHRoaXMuZmluZEFsbEVsZW1lbnRzKGVHcmlkRGl2KTtcclxuICAgIHRoaXMuY3JlYXRlQW5kV2lyZUJlYW5zKCRzY29wZSwgJGNvbXBpbGUsIGVHcmlkRGl2LCB1c2VTY3JvbGxzKTtcclxuXHJcbiAgICB0aGlzLnNjcm9sbFdpZHRoID0gdXRpbHMuZ2V0U2Nyb2xsYmFyV2lkdGgoKTtcclxuXHJcbiAgICB0aGlzLmluTWVtb3J5Um93Q29udHJvbGxlci5zZXRBbGxSb3dzKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFsbFJvd3MoKSk7XHJcblxyXG4gICAgaWYgKHVzZVNjcm9sbHMpIHtcclxuICAgICAgICB0aGlzLmFkZFNjcm9sbExpc3RlbmVyKCk7XHJcbiAgICAgICAgdGhpcy5zZXRCb2R5U2l6ZSgpOyAvL3NldHRpbmcgc2l6ZXMgb2YgYm9keSAoY29udGFpbmluZyB2aWV3cG9ydHMpLCBkb2Vzbid0IGNoYW5nZSBjb250YWluZXIgc2l6ZXNcclxuICAgIH1cclxuXHJcbiAgICAvLyBkb25lIHdoZW4gY29scyBjaGFuZ2VcclxuICAgIHRoaXMuc2V0dXBDb2x1bW5zKCk7XHJcblxyXG4gICAgLy8gZG9uZSB3aGVuIHJvd3MgY2hhbmdlXHJcbiAgICB0aGlzLnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9FVkVSWVRISU5HKTtcclxuXHJcbiAgICAvLyBmbGFnIHRvIG1hcmsgd2hlbiB0aGUgZGlyZWN0aXZlIGlzIGRlc3Ryb3llZFxyXG4gICAgdGhpcy5maW5pc2hlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIGlmIG5vIGRhdGEgcHJvdmlkZWQgaW5pdGlhbGx5LCBhbmQgbm90IGRvaW5nIGluZmluaXRlIHNjcm9sbGluZywgc2hvdyB0aGUgbG9hZGluZyBwYW5lbFxyXG4gICAgdmFyIHNob3dMb2FkaW5nID0gIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFsbFJvd3MoKSAmJiAhdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNWaXJ0dWFsUGFnaW5nKCk7XHJcbiAgICB0aGlzLnNob3dMb2FkaW5nUGFuZWwoc2hvd0xvYWRpbmcpO1xyXG5cclxuICAgIC8vIGlmIGRhdGFzb3VyY2UgcHJvdmlkZWQsIHVzZSBpdFxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldERhdGFzb3VyY2UoKSkge1xyXG4gICAgICAgIHRoaXMuc2V0RGF0YXNvdXJjZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIHJlYWR5IGZ1bmN0aW9uIHByb3ZpZGVkLCB1c2UgaXRcclxuICAgIGlmICh0eXBlb2YgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0UmVhZHkoKSA9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0UmVhZHkoKShncmlkT3B0aW9ucy5hcGkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5HcmlkLnByb3RvdHlwZS5hZGRFbnZpcm9ubWVudENsYXNzZXMgPSBmdW5jdGlvbihlR3JpZERpdikge1xyXG4gICAgdmFyIHBsYXRmb3JtQW5kQnJvd3NlciA9ICdhZy1lbnYtJyArIGNvbnN0YW50cy5QTEFURk9STSArIFwiLVwiICsgY29uc3RhbnRzLkJST1dTRVI7XHJcbiAgICB1dGlscy5hZGRDc3NDbGFzcyhlR3JpZERpdiwgcGxhdGZvcm1BbmRCcm93c2VyKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmNyZWF0ZUFuZFdpcmVCZWFucyA9IGZ1bmN0aW9uKCRzY29wZSwgJGNvbXBpbGUsIGVHcmlkRGl2LCB1c2VTY3JvbGxzKSB7XHJcblxyXG4gICAgLy8gbWFrZSBsb2NhbCByZWZlcmVuY2VzLCB0byBtYWtlIHRoZSBiZWxvdyBtb3JlIGh1bWFuIHJlYWRhYmxlXHJcbiAgICB2YXIgZ3JpZE9wdGlvbnNXcmFwcGVyID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB2YXIgZ3JpZE9wdGlvbnMgPSB0aGlzLmdyaWRPcHRpb25zO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbGwgdGhlIGJlYW5zXHJcbiAgICB2YXIgc2VsZWN0aW9uQ29udHJvbGxlciA9IG5ldyBTZWxlY3Rpb25Db250cm9sbGVyKCk7XHJcbiAgICB2YXIgZmlsdGVyTWFuYWdlciA9IG5ldyBGaWx0ZXJNYW5hZ2VyKCk7XHJcbiAgICB2YXIgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5ID0gbmV3IFNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSgpO1xyXG4gICAgdmFyIGNvbHVtbkNvbnRyb2xsZXIgPSBuZXcgQ29sdW1uQ29udHJvbGxlcigpO1xyXG4gICAgdmFyIHJvd1JlbmRlcmVyID0gbmV3IFJvd1JlbmRlcmVyKCk7XHJcbiAgICB2YXIgaGVhZGVyUmVuZGVyZXIgPSBuZXcgSGVhZGVyUmVuZGVyZXIoKTtcclxuICAgIHZhciBpbk1lbW9yeVJvd0NvbnRyb2xsZXIgPSBuZXcgSW5NZW1vcnlSb3dDb250cm9sbGVyKCk7XHJcbiAgICB2YXIgdmlydHVhbFBhZ2VSb3dDb250cm9sbGVyID0gbmV3IFZpcnR1YWxQYWdlUm93Q29udHJvbGxlcigpO1xyXG4gICAgdmFyIGV4cHJlc3Npb25TZXJ2aWNlID0gbmV3IEV4cHJlc3Npb25TZXJ2aWNlKCk7XHJcbiAgICB2YXIgdGVtcGxhdGVTZXJ2aWNlID0gbmV3IFRlbXBsYXRlU2VydmljZSgpO1xyXG4gICAgdmFyIHRvb2xQYW5lbCA9IG5ldyBUb29sUGFuZWwoKTtcclxuXHJcbiAgICB2YXIgY29sdW1uTW9kZWwgPSBjb2x1bW5Db250cm9sbGVyLmdldE1vZGVsKCk7XHJcblxyXG4gICAgLy8gaW5pdGlhbGlzZSBhbGwgdGhlIGJlYW5zXHJcbiAgICB0ZW1wbGF0ZVNlcnZpY2UuaW5pdCgkc2NvcGUpO1xyXG4gICAgc2VsZWN0aW9uQ29udHJvbGxlci5pbml0KHRoaXMsIHRoaXMuZVBhcmVudE9mUm93cywgZ3JpZE9wdGlvbnNXcmFwcGVyLCAkc2NvcGUsIHJvd1JlbmRlcmVyKTtcclxuICAgIGZpbHRlck1hbmFnZXIuaW5pdCh0aGlzLCBncmlkT3B0aW9uc1dyYXBwZXIsICRjb21waWxlLCAkc2NvcGUsIGV4cHJlc3Npb25TZXJ2aWNlLCBjb2x1bW5Nb2RlbCk7XHJcbiAgICBzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkuaW5pdCh0aGlzLCBzZWxlY3Rpb25Db250cm9sbGVyKTtcclxuICAgIGNvbHVtbkNvbnRyb2xsZXIuaW5pdCh0aGlzLCBzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnksIGdyaWRPcHRpb25zV3JhcHBlciwgZXhwcmVzc2lvblNlcnZpY2UpO1xyXG4gICAgcm93UmVuZGVyZXIuaW5pdChncmlkT3B0aW9ucywgY29sdW1uTW9kZWwsIGdyaWRPcHRpb25zV3JhcHBlciwgZUdyaWREaXYsIHRoaXMsXHJcbiAgICAgICAgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LCAkY29tcGlsZSwgJHNjb3BlLCBzZWxlY3Rpb25Db250cm9sbGVyLCBleHByZXNzaW9uU2VydmljZSwgdGVtcGxhdGVTZXJ2aWNlLFxyXG4gICAgICAgIHRoaXMuZVBhcmVudE9mUm93cyk7XHJcbiAgICBoZWFkZXJSZW5kZXJlci5pbml0KGdyaWRPcHRpb25zV3JhcHBlciwgY29sdW1uQ29udHJvbGxlciwgY29sdW1uTW9kZWwsIGVHcmlkRGl2LCB0aGlzLCBmaWx0ZXJNYW5hZ2VyLFxyXG4gICAgICAgICRzY29wZSwgJGNvbXBpbGUsIGV4cHJlc3Npb25TZXJ2aWNlKTtcclxuICAgIGluTWVtb3J5Um93Q29udHJvbGxlci5pbml0KGdyaWRPcHRpb25zV3JhcHBlciwgY29sdW1uTW9kZWwsIHRoaXMsIGZpbHRlck1hbmFnZXIsICRzY29wZSwgZXhwcmVzc2lvblNlcnZpY2UpO1xyXG4gICAgdmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLmluaXQocm93UmVuZGVyZXIsIGdyaWRPcHRpb25zV3JhcHBlciwgdGhpcyk7XHJcblxyXG4gICAgaWYgKHRoaXMuZVRvb2xQYW5lbENvbnRhaW5lcikge1xyXG4gICAgICAgIGlmIChncmlkT3B0aW9uc1dyYXBwZXIuaXNTaG93VG9vbFBhbmVsKCkpIHtcclxuICAgICAgICAgICAgdG9vbFBhbmVsLmluaXQodGhpcy5lVG9vbFBhbmVsQ29udGFpbmVyLCBjb2x1bW5Db250cm9sbGVyKTtcclxuICAgICAgICAgICAgdGhpcy5lUm9vdC5zdHlsZS5tYXJnaW5SaWdodCA9ICcyMDBweCc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lVG9vbFBhbmVsQ29udGFpbmVyLnN0eWxlLmxheW91dCA9ICdub25lJztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGhpcyBpcyBhIGNoaWxkIGJlYW4sIGdldCBhIHJlZmVyZW5jZSBhbmQgcGFzcyBpdCBvblxyXG4gICAgLy8gQ0FOIFdFIERFTEVURSBUSElTPyBpdCdzIGRvbmUgaW4gdGhlIHNldERhdGFzb3VyY2Ugc2VjdGlvblxyXG4gICAgdmFyIHJvd01vZGVsID0gaW5NZW1vcnlSb3dDb250cm9sbGVyLmdldE1vZGVsKCk7XHJcbiAgICBzZWxlY3Rpb25Db250cm9sbGVyLnNldFJvd01vZGVsKHJvd01vZGVsKTtcclxuICAgIGZpbHRlck1hbmFnZXIuc2V0Um93TW9kZWwocm93TW9kZWwpO1xyXG4gICAgcm93UmVuZGVyZXIuc2V0Um93TW9kZWwocm93TW9kZWwpO1xyXG5cclxuICAgIC8vIGFuZCB0aGUgbGFzdCBiZWFuLCBkb25lIGluIGl0J3Mgb3duIHNlY3Rpb24sIGFzIGl0J3Mgb3B0aW9uYWxcclxuICAgIHZhciBwYWdpbmF0aW9uQ29udHJvbGxlciA9IG51bGw7XHJcbiAgICBpZiAodXNlU2Nyb2xscykge1xyXG4gICAgICAgIHBhZ2luYXRpb25Db250cm9sbGVyID0gbmV3IFBhZ2luYXRpb25Db250cm9sbGVyKCk7XHJcbiAgICAgICAgcGFnaW5hdGlvbkNvbnRyb2xsZXIuaW5pdCh0aGlzLmVQYWdpbmdQYW5lbCwgdGhpcywgZ3JpZE9wdGlvbnNXcmFwcGVyKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJvd01vZGVsID0gcm93TW9kZWw7XHJcbiAgICB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIgPSBzZWxlY3Rpb25Db250cm9sbGVyO1xyXG4gICAgdGhpcy5jb2x1bW5Db250cm9sbGVyID0gY29sdW1uQ29udHJvbGxlcjtcclxuICAgIHRoaXMuY29sdW1uTW9kZWwgPSBjb2x1bW5Nb2RlbDtcclxuICAgIHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyID0gaW5NZW1vcnlSb3dDb250cm9sbGVyO1xyXG4gICAgdGhpcy52aXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIgPSB2aXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXI7XHJcbiAgICB0aGlzLnJvd1JlbmRlcmVyID0gcm93UmVuZGVyZXI7XHJcbiAgICB0aGlzLmhlYWRlclJlbmRlcmVyID0gaGVhZGVyUmVuZGVyZXI7XHJcbiAgICB0aGlzLnBhZ2luYXRpb25Db250cm9sbGVyID0gcGFnaW5hdGlvbkNvbnRyb2xsZXI7XHJcbiAgICB0aGlzLmZpbHRlck1hbmFnZXIgPSBmaWx0ZXJNYW5hZ2VyO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2hvd0FuZFBvc2l0aW9uUGFnaW5nUGFuZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIG5vIHBhZ2luZyB3aGVuIG5vLXNjcm9sbHNcclxuICAgIGlmICghdGhpcy5lUGFnaW5nUGFuZWwpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaXNTaG93UGFnaW5nUGFuZWwoKSkge1xyXG4gICAgICAgIHRoaXMuZVBhZ2luZ1BhbmVsLnN0eWxlWydkaXNwbGF5J10gPSAnaW5saW5lJztcclxuICAgICAgICB2YXIgaGVpZ2h0T2ZQYWdlciA9IHRoaXMuZVBhZ2luZ1BhbmVsLm9mZnNldEhlaWdodDtcclxuICAgICAgICB0aGlzLmVCb2R5LnN0eWxlWydwYWRkaW5nQm90dG9tJ10gPSBoZWlnaHRPZlBhZ2VyICsgJ3B4JztcclxuICAgICAgICB2YXIgaGVpZ2h0T2ZSb290ID0gdGhpcy5lUm9vdC5jbGllbnRIZWlnaHQ7XHJcbiAgICAgICAgdmFyIHRvcE9mUGFnZXIgPSBoZWlnaHRPZlJvb3QgLSBoZWlnaHRPZlBhZ2VyO1xyXG4gICAgICAgIHRoaXMuZVBhZ2luZ1BhbmVsLnN0eWxlWyd0b3AnXSA9IHRvcE9mUGFnZXIgKyAncHgnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVQYWdpbmdQYW5lbC5zdHlsZVsnZGlzcGxheSddID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuZUJvZHkuc3R5bGVbJ3BhZGRpbmdCb3R0b20nXSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuaXNTaG93UGFnaW5nUGFuZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLnNob3dQYWdpbmdQYW5lbDtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNldERhdGFzb3VyY2UgPSBmdW5jdGlvbihkYXRhc291cmNlKSB7XHJcbiAgICAvLyBpZiBkYXRhc291cmNlIHByb3ZpZGVkLCB0aGVuIHNldCBpdFxyXG4gICAgaWYgKGRhdGFzb3VyY2UpIHtcclxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zLmRhdGFzb3VyY2UgPSBkYXRhc291cmNlO1xyXG4gICAgfVxyXG4gICAgLy8gZ2V0IHRoZSBzZXQgZGF0YXNvdXJjZSAoaWYgbnVsbCB3YXMgcGFzc2VkIHRvIHRoaXMgbWV0aG9kLFxyXG4gICAgLy8gdGhlbiBuZWVkIHRvIGdldCB0aGUgYWN0dWFsIGRhdGFzb3VyY2UgZnJvbSBvcHRpb25zXHJcbiAgICB2YXIgZGF0YXNvdXJjZVRvVXNlID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0RGF0YXNvdXJjZSgpO1xyXG4gICAgdGhpcy5kb2luZ1ZpcnR1YWxQYWdpbmcgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc1ZpcnR1YWxQYWdpbmcoKSAmJiBkYXRhc291cmNlVG9Vc2U7XHJcbiAgICB0aGlzLmRvaW5nUGFnaW5hdGlvbiA9IGRhdGFzb3VyY2VUb1VzZSAmJiAhdGhpcy5kb2luZ1ZpcnR1YWxQYWdpbmc7XHJcblxyXG4gICAgaWYgKHRoaXMuZG9pbmdWaXJ0dWFsUGFnaW5nKSB7XHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uQ29udHJvbGxlci5zZXREYXRhc291cmNlKG51bGwpO1xyXG4gICAgICAgIHRoaXMudmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnNldERhdGFzb3VyY2UoZGF0YXNvdXJjZVRvVXNlKTtcclxuICAgICAgICB0aGlzLnJvd01vZGVsID0gdGhpcy52aXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIuZ2V0TW9kZWwoKTtcclxuICAgICAgICB0aGlzLnNob3dQYWdpbmdQYW5lbCA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLmRvaW5nUGFnaW5hdGlvbikge1xyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkNvbnRyb2xsZXIuc2V0RGF0YXNvdXJjZShkYXRhc291cmNlVG9Vc2UpO1xyXG4gICAgICAgIHRoaXMudmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnNldERhdGFzb3VyY2UobnVsbCk7XHJcbiAgICAgICAgdGhpcy5yb3dNb2RlbCA9IHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyLmdldE1vZGVsKCk7XHJcbiAgICAgICAgdGhpcy5zaG93UGFnaW5nUGFuZWwgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnBhZ2luYXRpb25Db250cm9sbGVyLnNldERhdGFzb3VyY2UobnVsbCk7XHJcbiAgICAgICAgdGhpcy52aXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIuc2V0RGF0YXNvdXJjZShudWxsKTtcclxuICAgICAgICB0aGlzLnJvd01vZGVsID0gdGhpcy5pbk1lbW9yeVJvd0NvbnRyb2xsZXIuZ2V0TW9kZWwoKTtcclxuICAgICAgICB0aGlzLnNob3dQYWdpbmdQYW5lbCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VsZWN0aW9uQ29udHJvbGxlci5zZXRSb3dNb2RlbCh0aGlzLnJvd01vZGVsKTtcclxuICAgIHRoaXMuZmlsdGVyTWFuYWdlci5zZXRSb3dNb2RlbCh0aGlzLnJvd01vZGVsKTtcclxuICAgIHRoaXMucm93UmVuZGVyZXIuc2V0Um93TW9kZWwodGhpcy5yb3dNb2RlbCk7XHJcblxyXG4gICAgLy8gd2UgbWF5IG9mIGp1c3Qgc2hvd24gb3IgaGlkZGVuIHRoZSBwYWdpbmcgcGFuZWwsIHNvIG5lZWRcclxuICAgIC8vIHRvIGdldCB0YWJsZSB0byBjaGVjayB0aGUgYm9keSBzaXplLCB3aGljaCBhbHNvIGhpZGVzIGFuZFxyXG4gICAgLy8gc2hvd3MgdGhlIHBhZ2luZyBwYW5lbC5cclxuICAgIHRoaXMuc2V0Qm9keVNpemUoKTtcclxuXHJcbiAgICAvLyBiZWNhdXNlIHdlIGp1c3Qgc2V0IHRoZSByb3dNb2RlbCwgbmVlZCB0byB1cGRhdGUgdGhlIGd1aVxyXG4gICAgdGhpcy5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG59O1xyXG5cclxuLy8gZ2V0cyBjYWxsZWQgYWZ0ZXIgY29sdW1ucyBhcmUgc2hvd24gLyBoaWRkZW4gZnJvbSBncm91cHMgZXhwYW5kaW5nXHJcbkdyaWQucHJvdG90eXBlLnJlZnJlc2hIZWFkZXJBbmRCb2R5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmhlYWRlclJlbmRlcmVyLnJlZnJlc2hIZWFkZXIoKTtcclxuICAgIHRoaXMuaGVhZGVyUmVuZGVyZXIudXBkYXRlRmlsdGVySWNvbnMoKTtcclxuICAgIHRoaXMuaGVhZGVyUmVuZGVyZXIudXBkYXRlU29ydEljb25zKCk7XHJcbiAgICB0aGlzLnNldEJvZHlDb250YWluZXJXaWR0aCgpO1xyXG4gICAgdGhpcy5zZXRQaW5uZWRDb2xDb250YWluZXJXaWR0aCgpO1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0RmluaXNoZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZmluaXNoZWQgPSB0cnVlO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuZ2V0UG9wdXBQYXJlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmVSb290O1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuZ2V0UXVpY2tGaWx0ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLnF1aWNrRmlsdGVyO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUub25RdWlja0ZpbHRlckNoYW5nZWQgPSBmdW5jdGlvbihuZXdGaWx0ZXIpIHtcclxuICAgIGlmIChuZXdGaWx0ZXIgPT09IHVuZGVmaW5lZCB8fCBuZXdGaWx0ZXIgPT09IFwiXCIpIHtcclxuICAgICAgICBuZXdGaWx0ZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucXVpY2tGaWx0ZXIgIT09IG5ld0ZpbHRlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc1ZpcnR1YWxQYWdpbmcoKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2FnLWdyaWQ6IGNhbm5vdCBkbyBxdWljayBmaWx0ZXJpbmcgd2hlbiBkb2luZyB2aXJ0dWFsIHBhZ2luZycpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3dhbnQgJ251bGwnIHRvIG1lYW4gdG8gZmlsdGVyLCBzbyByZW1vdmUgdW5kZWZpbmVkIGFuZCBlbXB0eSBzdHJpbmdcclxuICAgICAgICBpZiAobmV3RmlsdGVyID09PSB1bmRlZmluZWQgfHwgbmV3RmlsdGVyID09PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIG5ld0ZpbHRlciA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChuZXdGaWx0ZXIgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgbmV3RmlsdGVyID0gbmV3RmlsdGVyLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucXVpY2tGaWx0ZXIgPSBuZXdGaWx0ZXI7XHJcbiAgICAgICAgdGhpcy5vbkZpbHRlckNoYW5nZWQoKTtcclxuICAgIH1cclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLm9uRmlsdGVyQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci51cGRhdGVGaWx0ZXJJY29ucygpO1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRW5hYmxlU2VydmVyU2lkZUZpbHRlcigpKSB7XHJcbiAgICAgICAgLy8gaWYgZG9pbmcgc2VydmVyIHNpZGUgZmlsdGVyaW5nLCBjaGFuZ2luZyB0aGUgc29ydCBoYXMgdGhlIGltcGFjdFxyXG4gICAgICAgIC8vIG9mIHJlc2V0dGluZyB0aGUgZGF0YXNvdXJjZVxyXG4gICAgICAgIHRoaXMuc2V0RGF0YXNvdXJjZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBpZiBkb2luZyBpbiBtZW1vcnkgZmlsdGVyaW5nLCB3ZSBqdXN0IHVwZGF0ZSB0aGUgaW4gbWVtb3J5IGRhdGFcclxuICAgICAgICB0aGlzLnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9GSUxURVIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUub25Sb3dDbGlja2VkID0gZnVuY3Rpb24oZXZlbnQsIHJvd0luZGV4LCBub2RlKSB7XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMucm93Q2xpY2tlZCkge1xyXG4gICAgICAgIHZhciBwYXJhbXMgPSB7XHJcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgZXZlbnQ6IGV2ZW50XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zLnJvd0NsaWNrZWQocGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB3ZSBkbyBub3QgYWxsb3cgc2VsZWN0aW5nIGdyb3VwcyBieSBjbGlja2luZyAoYXMgdGhlIGNsaWNrIGhlcmUgZXhwYW5kcyB0aGUgZ3JvdXApXHJcbiAgICAvLyBzbyByZXR1cm4gaWYgaXQncyBhIGdyb3VwIHJvd1xyXG4gICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbWFraW5nIGxvY2FsIHZhcmlhYmxlcyB0byBtYWtlIHRoZSBiZWxvdyBtb3JlIHJlYWRhYmxlXHJcbiAgICB2YXIgZ3JpZE9wdGlvbnNXcmFwcGVyID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB2YXIgc2VsZWN0aW9uQ29udHJvbGxlciA9IHRoaXMuc2VsZWN0aW9uQ29udHJvbGxlcjtcclxuXHJcbiAgICAvLyBpZiBubyBzZWxlY3Rpb24gbWV0aG9kIGVuYWJsZWQsIGRvIG5vdGhpbmdcclxuICAgIGlmICghZ3JpZE9wdGlvbnNXcmFwcGVyLmlzUm93U2VsZWN0aW9uKCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgY2xpY2sgc2VsZWN0aW9uIHN1cHByZXNzZWQsIGRvIG5vdGhpbmdcclxuICAgIGlmIChncmlkT3B0aW9uc1dyYXBwZXIuaXNTdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uKCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY3RybEtleSBmb3Igd2luZG93cywgbWV0YUtleSBmb3IgQXBwbGVcclxuICAgIHZhciBjdHJsS2V5UHJlc3NlZCA9IGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleTtcclxuXHJcbiAgICB2YXIgZG9EZXNlbGVjdCA9IGN0cmxLZXlQcmVzc2VkXHJcbiAgICAgICAgJiYgc2VsZWN0aW9uQ29udHJvbGxlci5pc05vZGVTZWxlY3RlZChub2RlKVxyXG4gICAgICAgICYmIGdyaWRPcHRpb25zV3JhcHBlci5pc1Jvd0Rlc2VsZWN0aW9uKCkgO1xyXG5cclxuICAgIGlmIChkb0Rlc2VsZWN0KSB7XHJcbiAgICAgICAgc2VsZWN0aW9uQ29udHJvbGxlci5kZXNlbGVjdE5vZGUobm9kZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciB0cnlNdWx0aSA9IGN0cmxLZXlQcmVzc2VkO1xyXG4gICAgICAgIHNlbGVjdGlvbkNvbnRyb2xsZXIuc2VsZWN0Tm9kZShub2RlLCB0cnlNdWx0aSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zZXRIZWFkZXJIZWlnaHQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBoZWFkZXJIZWlnaHQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRIZWFkZXJIZWlnaHQoKTtcclxuICAgIHZhciBoZWFkZXJIZWlnaHRQaXhlbHMgPSBoZWFkZXJIZWlnaHQgKyAncHgnO1xyXG4gICAgdmFyIGRvbnRVc2VTY3JvbGxzID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpO1xyXG4gICAgaWYgKGRvbnRVc2VTY3JvbGxzKSB7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyQ29udGFpbmVyLnN0eWxlWydoZWlnaHQnXSA9IGhlYWRlckhlaWdodFBpeGVscztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyLnN0eWxlWydoZWlnaHQnXSA9IGhlYWRlckhlaWdodFBpeGVscztcclxuICAgICAgICB0aGlzLmVCb2R5LnN0eWxlWydwYWRkaW5nVG9wJ10gPSBoZWFkZXJIZWlnaHRQaXhlbHM7XHJcbiAgICAgICAgdGhpcy5lTG9hZGluZ1BhbmVsLnN0eWxlWydtYXJnaW5Ub3AnXSA9IGhlYWRlckhlaWdodFBpeGVscztcclxuICAgIH1cclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNob3dMb2FkaW5nUGFuZWwgPSBmdW5jdGlvbihzaG93KSB7XHJcbiAgICBpZiAoc2hvdykge1xyXG4gICAgICAgIC8vIHNldHRpbmcgZGlzcGxheSB0byBudWxsLCBhY3R1YWxseSBoYXMgdGhlIGltcGFjdCBvZiBzZXR0aW5nIGl0XHJcbiAgICAgICAgLy8gdG8gJ3RhYmxlJywgYXMgdGhpcyBpcyBwYXJ0IG9mIHRoZSBhZy1sb2FkaW5nLXBhbmVsIGNvcmUgc3R5bGVcclxuICAgICAgICB0aGlzLmVMb2FkaW5nUGFuZWwuc3R5bGUuZGlzcGxheSA9ICd0YWJsZSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZUxvYWRpbmdQYW5lbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0dXBDb2x1bW5zID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNldEhlYWRlckhlaWdodCgpO1xyXG4gICAgdGhpcy5jb2x1bW5Db250cm9sbGVyLnNldENvbHVtbnModGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29sdW1uRGVmcygpKTtcclxuICAgIHRoaXMuc2hvd1Bpbm5lZENvbENvbnRhaW5lcnNJZk5lZWRlZCgpO1xyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci5yZWZyZXNoSGVhZGVyKCk7XHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9udFVzZVNjcm9sbHMoKSkge1xyXG4gICAgICAgIHRoaXMuc2V0UGlubmVkQ29sQ29udGFpbmVyV2lkdGgoKTtcclxuICAgICAgICB0aGlzLnNldEJvZHlDb250YWluZXJXaWR0aCgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci51cGRhdGVGaWx0ZXJJY29ucygpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0Qm9keUNvbnRhaW5lcldpZHRoID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbWFpblJvd1dpZHRoID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRCb2R5Q29udGFpbmVyV2lkdGgoKSArIFwicHhcIjtcclxuICAgIHRoaXMuZUJvZHlDb250YWluZXIuc3R5bGUud2lkdGggPSBtYWluUm93V2lkdGg7XHJcbn07XHJcblxyXG4vLyByb3dzVG9SZWZyZXNoIGlzIGF0IHdoYXQgaW5kZXggdG8gc3RhcnQgcmVmcmVzaGluZyB0aGUgcm93cy4gdGhlIGFzc3VtcHRpb24gaXNcclxuLy8gaWYgd2UgYXJlIGV4cGFuZGluZyBvciBjb2xsYXBzaW5nIGEgZ3JvdXAsIHRoZW4gb25seSBoZSByb3dzIGJlbG93IHRoZSBncm91cFxyXG4vLyBuZWVkIHRvIGJlIHJlZnJlc2guIHRoaXMgYWxsb3dzIHRoZSBjb250ZXh0IChlZyBmb2N1cykgb2YgdGhlIG90aGVyIGNlbGxzIHRvXHJcbi8vIHJlbWFpbi5cclxuR3JpZC5wcm90b3R5cGUudXBkYXRlTW9kZWxBbmRSZWZyZXNoID0gZnVuY3Rpb24oc3RlcCwgcmVmcmVzaEZyb21JbmRleCkge1xyXG4gICAgdGhpcy5pbk1lbW9yeVJvd0NvbnRyb2xsZXIudXBkYXRlTW9kZWwoc3RlcCk7XHJcbiAgICB0aGlzLnJvd1JlbmRlcmVyLnJlZnJlc2hWaWV3KHJlZnJlc2hGcm9tSW5kZXgpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0Um93cyA9IGZ1bmN0aW9uKHJvd3MsIGZpcnN0SWQpIHtcclxuICAgIGlmIChyb3dzKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5yb3dEYXRhID0gcm93cztcclxuICAgIH1cclxuICAgIHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyLnNldEFsbFJvd3ModGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QWxsUm93cygpLCBmaXJzdElkKTtcclxuICAgIHRoaXMuc2VsZWN0aW9uQ29udHJvbGxlci5kZXNlbGVjdEFsbCgpO1xyXG4gICAgdGhpcy5maWx0ZXJNYW5hZ2VyLm9uTmV3Um93c0xvYWRlZCgpO1xyXG4gICAgdGhpcy51cGRhdGVNb2RlbEFuZFJlZnJlc2goY29uc3RhbnRzLlNURVBfRVZFUllUSElORyk7XHJcbiAgICB0aGlzLmhlYWRlclJlbmRlcmVyLnVwZGF0ZUZpbHRlckljb25zKCk7XHJcbiAgICB0aGlzLnNob3dMb2FkaW5nUGFuZWwoZmFsc2UpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuZW5zdXJlTm9kZVZpc2libGUgPSBmdW5jdGlvbihjb21wYXJhdG9yKSB7XHJcbiAgICBpZiAodGhpcy5kb2luZ1ZpcnR1YWxQYWdpbmcpIHtcclxuICAgICAgICB0aHJvdyAnQ2Fubm90IHVzZSBlbnN1cmVOb2RlVmlzaWJsZSB3aGVuIGRvaW5nIHZpcnR1YWwgcGFnaW5nLCBhcyB3ZSBjYW5ub3QgY2hlY2sgcm93cyB0aGF0IGFyZSBub3QgaW4gbWVtb3J5JztcclxuICAgIH1cclxuICAgIC8vIGxvb2sgZm9yIHRoZSBub2RlIGluZGV4IHdlIHdhbnQgdG8gZGlzcGxheVxyXG4gICAgdmFyIHJvd0NvdW50ID0gdGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93Q291bnQoKTtcclxuICAgIHZhciBjb21wYXJhdG9ySXNBRnVuY3Rpb24gPSB0eXBlb2YgY29tcGFyYXRvciA9PT0gJ2Z1bmN0aW9uJztcclxuICAgIHZhciBpbmRleFRvU2VsZWN0ID0gLTE7XHJcbiAgICAvLyBnbyB0aHJvdWdoIGFsbCB0aGUgbm9kZXMsIGZpbmQgdGhlIG9uZSB3ZSB3YW50IHRvIHNob3dcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm93Q291bnQ7IGkrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gdGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93KGkpO1xyXG4gICAgICAgIGlmIChjb21wYXJhdG9ySXNBRnVuY3Rpb24pIHtcclxuICAgICAgICAgICAgaWYgKGNvbXBhcmF0b3Iobm9kZSkpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4VG9TZWxlY3QgPSBpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBjaGVjayBvYmplY3QgZXF1YWxpdHkgYWdhaW5zdCBub2RlIGFuZCBkYXRhXHJcbiAgICAgICAgICAgIGlmIChjb21wYXJhdG9yID09PSBub2RlIHx8IGNvbXBhcmF0b3IgPT09IG5vZGUuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgaW5kZXhUb1NlbGVjdCA9IGk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChpbmRleFRvU2VsZWN0ID49IDApIHtcclxuICAgICAgICB0aGlzLmVuc3VyZUluZGV4VmlzaWJsZShpbmRleFRvU2VsZWN0KTtcclxuICAgIH1cclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmVuc3VyZUluZGV4VmlzaWJsZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICB2YXIgbGFzdFJvdyA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvd0NvdW50KCk7XHJcbiAgICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJyB8fCBpbmRleCA8IDAgfHwgaW5kZXggPj0gbGFzdFJvdykge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignaW52YWxpZCByb3cgaW5kZXggZm9yIGVuc3VyZUluZGV4VmlzaWJsZTogJyArIGluZGV4KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHJvd0hlaWdodCA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0hlaWdodCgpO1xyXG4gICAgdmFyIHJvd1RvcFBpeGVsID0gcm93SGVpZ2h0ICogaW5kZXg7XHJcbiAgICB2YXIgcm93Qm90dG9tUGl4ZWwgPSByb3dUb3BQaXhlbCArIHJvd0hlaWdodDtcclxuXHJcbiAgICB2YXIgdmlld3BvcnRUb3BQaXhlbCA9IHRoaXMuZUJvZHlWaWV3cG9ydC5zY3JvbGxUb3A7XHJcbiAgICB2YXIgdmlld3BvcnRIZWlnaHQgPSB0aGlzLmVCb2R5Vmlld3BvcnQub2Zmc2V0SGVpZ2h0O1xyXG4gICAgdmFyIHNjcm9sbFNob3dpbmcgPSB0aGlzLmVCb2R5Vmlld3BvcnQuY2xpZW50V2lkdGggPCB0aGlzLmVCb2R5Vmlld3BvcnQuc2Nyb2xsV2lkdGg7XHJcbiAgICBpZiAoc2Nyb2xsU2hvd2luZykge1xyXG4gICAgICAgIHZpZXdwb3J0SGVpZ2h0IC09IHRoaXMuc2Nyb2xsV2lkdGg7XHJcbiAgICB9XHJcbiAgICB2YXIgdmlld3BvcnRCb3R0b21QaXhlbCA9IHZpZXdwb3J0VG9wUGl4ZWwgKyB2aWV3cG9ydEhlaWdodDtcclxuXHJcbiAgICB2YXIgdmlld3BvcnRTY3JvbGxlZFBhc3RSb3cgPSB2aWV3cG9ydFRvcFBpeGVsID4gcm93VG9wUGl4ZWw7XHJcbiAgICB2YXIgdmlld3BvcnRTY3JvbGxlZEJlZm9yZVJvdyA9IHZpZXdwb3J0Qm90dG9tUGl4ZWwgPCByb3dCb3R0b21QaXhlbDtcclxuXHJcbiAgICBpZiAodmlld3BvcnRTY3JvbGxlZFBhc3RSb3cpIHtcclxuICAgICAgICAvLyBpZiByb3cgaXMgYmVmb3JlLCBzY3JvbGwgdXAgd2l0aCByb3cgYXQgdG9wXHJcbiAgICAgICAgdGhpcy5lQm9keVZpZXdwb3J0LnNjcm9sbFRvcCA9IHJvd1RvcFBpeGVsO1xyXG4gICAgfSBlbHNlIGlmICh2aWV3cG9ydFNjcm9sbGVkQmVmb3JlUm93KSB7XHJcbiAgICAgICAgLy8gaWYgcm93IGlzIGJlbG93LCBzY3JvbGwgZG93biB3aXRoIHJvdyBhdCBib3R0b21cclxuICAgICAgICB2YXIgbmV3U2Nyb2xsUG9zaXRpb24gPSByb3dCb3R0b21QaXhlbCAtIHZpZXdwb3J0SGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuZUJvZHlWaWV3cG9ydC5zY3JvbGxUb3AgPSBuZXdTY3JvbGxQb3NpdGlvbjtcclxuICAgIH1cclxuICAgIC8vIG90aGVyd2lzZSwgcm93IGlzIGFscmVhZHkgaW4gdmlldywgc28gZG8gbm90aGluZ1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuZW5zdXJlQ29sSW5kZXhWaXNpYmxlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdjb2wgaW5kZXggbXVzdCBiZSBhIG51bWJlcjogJyArIGluZGV4KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNvbHVtbnMgPSB0aGlzLmNvbHVtbk1vZGVsLmdldERpc3BsYXllZENvbHVtbnMoKTtcclxuICAgIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInIHx8IGluZGV4IDwgMCB8fCBpbmRleCA+PSBjb2x1bW5zLmxlbmd0aCkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignaW52YWxpZCBjb2wgaW5kZXggZm9yIGVuc3VyZUNvbEluZGV4VmlzaWJsZTogJyArIGluZGV4XHJcbiAgICAgICAgICAgICsgJywgc2hvdWxkIGJlIGJldHdlZW4gMCBhbmQgJyArIChjb2x1bW5zLmxlbmd0aCAtIDEpKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNvbHVtbiA9IGNvbHVtbnNbaW5kZXhdO1xyXG4gICAgdmFyIHBpbm5lZENvbENvdW50ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0UGlubmVkQ29sQ291bnQoKTtcclxuICAgIGlmIChpbmRleCA8IHBpbm5lZENvbENvdW50KSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdpbnZhbGlkIGNvbCBpbmRleCBmb3IgZW5zdXJlQ29sSW5kZXhWaXNpYmxlOiAnICsgaW5kZXhcclxuICAgICAgICAgICAgKyAnLCBzY3JvbGxpbmcgdG8gYSBwaW5uZWQgY29sIG1ha2VzIG5vIHNlbnNlJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHN1bSB1cCBhbGwgY29sIHdpZHRoIHRvIHRoZSBsZXQgdG8gZ2V0IHRoZSBzdGFydCBwaXhlbFxyXG4gICAgdmFyIGNvbExlZnRQaXhlbCA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gcGlubmVkQ29sQ291bnQ7IGk8aW5kZXg7IGkrKykge1xyXG4gICAgICAgIGNvbExlZnRQaXhlbCArPSBjb2x1bW5zW2ldLmFjdHVhbFdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjb2xSaWdodFBpeGVsID0gY29sTGVmdFBpeGVsICsgY29sdW1uLmFjdHVhbFdpZHRoO1xyXG5cclxuICAgIHZhciB2aWV3cG9ydExlZnRQaXhlbCA9IHRoaXMuZUJvZHlWaWV3cG9ydC5zY3JvbGxMZWZ0O1xyXG4gICAgdmFyIHZpZXdwb3J0V2lkdGggPSB0aGlzLmVCb2R5Vmlld3BvcnQub2Zmc2V0V2lkdGg7XHJcblxyXG4gICAgdmFyIHNjcm9sbFNob3dpbmcgPSB0aGlzLmVCb2R5Vmlld3BvcnQuY2xpZW50SGVpZ2h0IDwgdGhpcy5lQm9keVZpZXdwb3J0LnNjcm9sbEhlaWdodDtcclxuICAgIGlmIChzY3JvbGxTaG93aW5nKSB7XHJcbiAgICAgICAgdmlld3BvcnRXaWR0aCAtPSB0aGlzLnNjcm9sbFdpZHRoO1xyXG4gICAgfVxyXG4gICBcclxuICAgIHZhciB2aWV3cG9ydFJpZ2h0UGl4ZWwgPSB2aWV3cG9ydExlZnRQaXhlbCArIHZpZXdwb3J0V2lkdGg7XHJcblxyXG4gICAgdmFyIHZpZXdwb3J0U2Nyb2xsZWRQYXN0Q29sID0gdmlld3BvcnRMZWZ0UGl4ZWwgPiBjb2xMZWZ0UGl4ZWw7XHJcbiAgICB2YXIgdmlld3BvcnRTY3JvbGxlZEJlZm9yZUNvbCA9IHZpZXdwb3J0UmlnaHRQaXhlbCA8IGNvbFJpZ2h0UGl4ZWw7XHJcblxyXG4gICAgaWYgKHZpZXdwb3J0U2Nyb2xsZWRQYXN0Q29sKSB7XHJcbiAgICAgICAgLy8gaWYgdmlld3BvcnQncyBsZWZ0IHNpZGUgaXMgYWZ0ZXIgY29sJ3MgbGVmdCBzaWRlLCBzY3JvbGwgcmlnaHQgdG8gcHVsbCBjb2wgaW50byB2aWV3cG9ydCBhdCBsZWZ0XHJcbiAgICAgICAgdGhpcy5lQm9keVZpZXdwb3J0LnNjcm9sbExlZnQgPSBjb2xMZWZ0UGl4ZWw7XHJcbiAgICB9IGVsc2UgaWYgKHZpZXdwb3J0U2Nyb2xsZWRCZWZvcmVDb2wpIHtcclxuICAgICAgICAvLyBpZiB2aWV3cG9ydCdzIHJpZ2h0IHNpZGUgaXMgYmVmb3JlIGNvbCdzIHJpZ2h0IHNpZGUsIHNjcm9sbCBsZWZ0IHRvIHB1bGwgY29sIGludG8gdmlld3BvcnQgYXQgcmlnaHRcclxuICAgICAgICB2YXIgbmV3U2Nyb2xsUG9zaXRpb24gPSBjb2xSaWdodFBpeGVsIC0gdmlld3BvcnRXaWR0aDtcclxuICAgICAgICB0aGlzLmVCb2R5Vmlld3BvcnQuc2Nyb2xsTGVmdCA9IG5ld1Njcm9sbFBvc2l0aW9uO1xyXG4gICAgfVxyXG4gICAgLy8gb3RoZXJ3aXNlLCBjb2wgaXMgYWxyZWFkeSBpbiB2aWV3LCBzbyBkbyBub3RoaW5nXHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5nZXRGaWx0ZXJNb2RlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyTWFuYWdlci5nZXRGaWx0ZXJNb2RlbCgpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuYWRkQXBpID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB2YXIgYXBpID0ge1xyXG4gICAgICAgIHNldERhdGFzb3VyY2U6IGZ1bmN0aW9uKGRhdGFzb3VyY2UpIHtcclxuICAgICAgICAgICAgdGhhdC5zZXREYXRhc291cmNlKGRhdGFzb3VyY2UpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25OZXdEYXRhc291cmNlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5zZXREYXRhc291cmNlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRSb3dzOiBmdW5jdGlvbihyb3dzKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0Um93cyhyb3dzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uTmV3Um93czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0Um93cygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25OZXdDb2xzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5vbk5ld0NvbHMoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVuc2VsZWN0QWxsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcInVuc2VsZWN0QWxsIGRlcHJlY2F0ZWQsIGNhbGwgZGVzZWxlY3RBbGwgaW5zdGVhZFwiKTtcclxuICAgICAgICAgICAgdGhpcy5kZXNlbGVjdEFsbCgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVmcmVzaFZpZXc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LnJvd1JlbmRlcmVyLnJlZnJlc2hWaWV3KCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzb2Z0UmVmcmVzaFZpZXc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LnJvd1JlbmRlcmVyLnNvZnRSZWZyZXNoVmlldygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVmcmVzaEdyb3VwUm93czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQucm93UmVuZGVyZXIucmVmcmVzaEdyb3VwUm93cygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVmcmVzaEhlYWRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIG5lZWQgdG8gcmV2aWV3IHRoaXMgLSB0aGUgcmVmcmVzaEhlYWRlciBzaG91bGQgYWxzbyByZWZyZXNoIGFsbCBpY29ucyBpbiB0aGUgaGVhZGVyXHJcbiAgICAgICAgICAgIHRoYXQuaGVhZGVyUmVuZGVyZXIucmVmcmVzaEhlYWRlcigpO1xyXG4gICAgICAgICAgICB0aGF0LmhlYWRlclJlbmRlcmVyLnVwZGF0ZUZpbHRlckljb25zKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRNb2RlbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnJvd01vZGVsO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25Hcm91cEV4cGFuZGVkT3JDb2xsYXBzZWQ6IGZ1bmN0aW9uKHJlZnJlc2hGcm9tSW5kZXgpIHtcclxuICAgICAgICAgICAgdGhhdC51cGRhdGVNb2RlbEFuZFJlZnJlc2goY29uc3RhbnRzLlNURVBfTUFQLCByZWZyZXNoRnJvbUluZGV4KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4cGFuZEFsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuaW5NZW1vcnlSb3dDb250cm9sbGVyLmV4cGFuZE9yQ29sbGFwc2VBbGwodHJ1ZSwgbnVsbCk7XHJcbiAgICAgICAgICAgIHRoYXQudXBkYXRlTW9kZWxBbmRSZWZyZXNoKGNvbnN0YW50cy5TVEVQX01BUCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb2xsYXBzZUFsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuaW5NZW1vcnlSb3dDb250cm9sbGVyLmV4cGFuZE9yQ29sbGFwc2VBbGwoZmFsc2UsIG51bGwpO1xyXG4gICAgICAgICAgICB0aGF0LnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9NQVApO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkVmlydHVhbFJvd0xpc3RlbmVyOiBmdW5jdGlvbihyb3dJbmRleCwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgdGhhdC5hZGRWaXJ0dWFsUm93TGlzdGVuZXIocm93SW5kZXgsIGNhbGxiYWNrKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJvd0RhdGFDaGFuZ2VkOiBmdW5jdGlvbihyb3dzKSB7XHJcbiAgICAgICAgICAgIHRoYXQucm93UmVuZGVyZXIucm93RGF0YUNoYW5nZWQocm93cyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRRdWlja0ZpbHRlcjogZnVuY3Rpb24obmV3RmlsdGVyKSB7XHJcbiAgICAgICAgICAgIHRoYXQub25RdWlja0ZpbHRlckNoYW5nZWQobmV3RmlsdGVyKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0SW5kZXg6IGZ1bmN0aW9uKGluZGV4LCB0cnlNdWx0aSwgc3VwcHJlc3NFdmVudHMpIHtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLnNlbGVjdEluZGV4KGluZGV4LCB0cnlNdWx0aSwgc3VwcHJlc3NFdmVudHMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVzZWxlY3RJbmRleDogZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLmRlc2VsZWN0SW5kZXgoaW5kZXgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0Tm9kZTogZnVuY3Rpb24obm9kZSwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5zZWxlY3ROb2RlKG5vZGUsIHRyeU11bHRpLCBzdXBwcmVzc0V2ZW50cyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZXNlbGVjdE5vZGU6IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLmRlc2VsZWN0Tm9kZShub2RlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdEFsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5zZWxlY3RBbGwoKTtcclxuICAgICAgICAgICAgdGhhdC5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVzZWxlY3RBbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuZGVzZWxlY3RBbGwoKTtcclxuICAgICAgICAgICAgdGhhdC5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVjb21wdXRlQWdncmVnYXRlczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuaW5NZW1vcnlSb3dDb250cm9sbGVyLmRvQWdncmVnYXRlKCk7XHJcbiAgICAgICAgICAgIHRoYXQucm93UmVuZGVyZXIucmVmcmVzaEdyb3VwUm93cygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2l6ZUNvbHVtbnNUb0ZpdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5pc0RvbnRVc2VTY3JvbGxzKCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignYWctZ3JpZDogc2l6ZUNvbHVtbnNUb0ZpdCBkb2VzIG5vdCB3b3JrIHdoZW4gZG9udFVzZVNjcm9sbHM9dHJ1ZScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBhdmFpbGFibGVXaWR0aCA9IHRoYXQuZUJvZHkuY2xpZW50V2lkdGg7XHJcbiAgICAgICAgICAgIHZhciBzY3JvbGxTaG93aW5nID0gdGhhdC5lQm9keVZpZXdwb3J0LmNsaWVudEhlaWdodCA8IHRoYXQuZUJvZHlWaWV3cG9ydC5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxTaG93aW5nKSB7XHJcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVXaWR0aCAtPSB0aGF0LnNjcm9sbFdpZHRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoYXQuY29sdW1uQ29udHJvbGxlci5zaXplQ29sdW1uc1RvRml0KGF2YWlsYWJsZVdpZHRoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNob3dMb2FkaW5nOiBmdW5jdGlvbihzaG93KSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2hvd0xvYWRpbmdQYW5lbChzaG93KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzTm9kZVNlbGVjdGVkOiBmdW5jdGlvbihub2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuaXNOb2RlU2VsZWN0ZWQobm9kZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRTZWxlY3RlZE5vZGVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5nZXRTZWxlY3RlZE5vZGVzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRCZXN0Q29zdE5vZGVTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLmdldEJlc3RDb3N0Tm9kZVNlbGVjdGlvbigpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW5zdXJlQ29sSW5kZXhWaXNpYmxlOiBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICB0aGF0LmVuc3VyZUNvbEluZGV4VmlzaWJsZShpbmRleCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnN1cmVJbmRleFZpc2libGU6IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoYXQuZW5zdXJlSW5kZXhWaXNpYmxlKGluZGV4KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuc3VyZU5vZGVWaXNpYmxlOiBmdW5jdGlvbihjb21wYXJhdG9yKSB7XHJcbiAgICAgICAgICAgIHRoYXQuZW5zdXJlTm9kZVZpc2libGUoY29tcGFyYXRvcik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3JFYWNoSW5NZW1vcnk6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHRoYXQucm93TW9kZWwuZm9yRWFjaEluTWVtb3J5KGNhbGxiYWNrKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldEZpbHRlckFwaUZvckNvbERlZjogZnVuY3Rpb24oY29sRGVmKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignYWctZ3JpZCBBUEkgbWV0aG9kIGdldEZpbHRlckFwaUZvckNvbERlZiBkZXByZWNhdGVkLCB1c2UgZ2V0RmlsdGVyQXBpIGluc3RlYWQnKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RmlsdGVyQXBpKGNvbERlZik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRGaWx0ZXJBcGk6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgY29sdW1uID0gdGhhdC5jb2x1bW5Nb2RlbC5nZXRDb2x1bW4oa2V5KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZmlsdGVyTWFuYWdlci5nZXRGaWx0ZXJBcGkoY29sdW1uKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRmlsdGVyQ2hhbmdlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQub25GaWx0ZXJDaGFuZ2VkKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRTb3J0TW9kZWw6IGZ1bmN0aW9uKHNvcnRNb2RlbCkge1xyXG4gICAgICAgICAgICB0aGF0LnNldFNvcnRNb2RlbChzb3J0TW9kZWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0U29ydE1vZGVsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZ2V0U29ydE1vZGVsKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRGaWx0ZXJNb2RlbDogZnVuY3Rpb24obW9kZWwpIHtcclxuICAgICAgICAgICAgdGhhdC5maWx0ZXJNYW5hZ2VyLnNldEZpbHRlck1vZGVsKG1vZGVsKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldEZpbHRlck1vZGVsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZ2V0RmlsdGVyTW9kZWwoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldEZvY3VzZWRDZWxsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQucm93UmVuZGVyZXIuZ2V0Rm9jdXNlZENlbGwoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldEZvY3VzZWRDZWxsOiBmdW5jdGlvbihyb3dJbmRleCwgY29sSW5kZXgpIHtcclxuICAgICAgICAgICAgdGhhdC5zZXRGb2N1c2VkQ2VsbChyb3dJbmRleCwgY29sSW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zLmFwaSA9IGFwaTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNldEZvY3VzZWRDZWxsID0gZnVuY3Rpb24ocm93SW5kZXgsIGNvbEluZGV4KSB7XHJcbiAgICB0aGlzLmVuc3VyZUluZGV4VmlzaWJsZShyb3dJbmRleCk7XHJcbiAgICB0aGlzLmVuc3VyZUNvbEluZGV4VmlzaWJsZShjb2xJbmRleCk7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGF0LnJvd1JlbmRlcmVyLnNldEZvY3VzZWRDZWxsKHJvd0luZGV4LCBjb2xJbmRleCk7XHJcbiAgICB9LCAxMCk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5nZXRTb3J0TW9kZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBhbGxDb2x1bW5zID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRBbGxDb2x1bW5zKCk7XHJcbiAgICB2YXIgY29sdW1uc1dpdGhTb3J0aW5nID0gW107XHJcbiAgICB2YXIgaTtcclxuICAgIGZvciAoaSA9IDA7IGk8YWxsQ29sdW1ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChhbGxDb2x1bW5zW2ldLnNvcnQpIHtcclxuICAgICAgICAgICAgY29sdW1uc1dpdGhTb3J0aW5nLnB1c2goYWxsQ29sdW1uc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29sdW1uc1dpdGhTb3J0aW5nLnNvcnQoIGZ1bmN0aW9uKGEsYikge1xyXG4gICAgICAgIHJldHVybiBhLnNvcnRlZEF0IC0gYi5zb3J0ZWRBdDtcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgIGZvciAoaSA9IDA7IGk8Y29sdW1uc1dpdGhTb3J0aW5nLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdEVudHJ5ID0ge1xyXG4gICAgICAgICAgICBmaWVsZDogY29sdW1uc1dpdGhTb3J0aW5nW2ldLmNvbERlZi5maWVsZCxcclxuICAgICAgICAgICAgc29ydDogY29sdW1uc1dpdGhTb3J0aW5nW2ldLnNvcnRcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJlc3VsdC5wdXNoKHJlc3VsdEVudHJ5KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0U29ydE1vZGVsID0gZnVuY3Rpb24oc29ydE1vZGVsKSB7XHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRW5hYmxlU29ydGluZygpKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdhZy1ncmlkOiBZb3UgYXJlIHNldHRpbmcgdGhlIHNvcnQgbW9kZWwgb24gYSBncmlkIHRoYXQgZG9lcyBub3QgaGF2ZSBzb3J0aW5nIGVuYWJsZWQnKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAvLyBmaXJzdCB1cCwgY2xlYXIgYW55IHByZXZpb3VzIHNvcnRcclxuICAgIHZhciBzb3J0TW9kZWxQcm92aWRlZCA9IHNvcnRNb2RlbCE9PW51bGwgJiYgc29ydE1vZGVsIT09dW5kZWZpbmVkICYmIHNvcnRNb2RlbC5sZW5ndGg+MDtcclxuICAgIHZhciBhbGxDb2x1bW5zID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRBbGxDb2x1bW5zKCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaTxhbGxDb2x1bW5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNvbHVtbiA9IGFsbENvbHVtbnNbaV07XHJcblxyXG4gICAgICAgIHZhciBzb3J0Rm9yQ29sID0gbnVsbDtcclxuICAgICAgICB2YXIgc29ydGVkQXQgPSAtMTtcclxuICAgICAgICBpZiAoc29ydE1vZGVsUHJvdmlkZWQgJiYgIWNvbHVtbi5jb2xEZWYuc3VwcHJlc3NTb3J0aW5nKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqPHNvcnRNb2RlbC5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNvcnRNb2RlbEVudHJ5ID0gc29ydE1vZGVsW2pdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3J0TW9kZWxFbnRyeS5maWVsZCA9PT0gJ3N0cmluZydcclxuICAgICAgICAgICAgICAgICAgICAmJiB0eXBlb2YgY29sdW1uLmNvbERlZi5maWVsZCA9PT0gJ3N0cmluZydcclxuICAgICAgICAgICAgICAgICAgICAmJiBzb3J0TW9kZWxFbnRyeS5maWVsZCA9PT0gY29sdW1uLmNvbERlZi5maWVsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRGb3JDb2wgPSBzb3J0TW9kZWxFbnRyeS5zb3J0O1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRlZEF0ID0gajtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNvcnRGb3JDb2wpIHtcclxuICAgICAgICAgICAgY29sdW1uLnNvcnQgPSBzb3J0Rm9yQ29sO1xyXG4gICAgICAgICAgICBjb2x1bW4uc29ydGVkQXQgPSBzb3J0ZWRBdDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb2x1bW4uc29ydCA9IG51bGw7XHJcbiAgICAgICAgICAgIGNvbHVtbi5zb3J0ZWRBdCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMub25Tb3J0aW5nQ2hhbmdlZCgpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUub25Tb3J0aW5nQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci51cGRhdGVTb3J0SWNvbnMoKTtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0VuYWJsZVNlcnZlclNpZGVTb3J0aW5nKCkpIHtcclxuICAgICAgICAvLyBpZiBkb2luZyBzZXJ2ZXIgc2lkZSBzb3J0aW5nLCBjaGFuZ2luZyB0aGUgc29ydCBoYXMgdGhlIGltcGFjdFxyXG4gICAgICAgIC8vIG9mIHJlc2V0dGluZyB0aGUgZGF0YXNvdXJjZVxyXG4gICAgICAgIHRoaXMuc2V0RGF0YXNvdXJjZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBpZiBkb2luZyBpbiBtZW1vcnkgc29ydGluZywgd2UganVzdCB1cGRhdGUgdGhlIGluIG1lbW9yeSBkYXRhXHJcbiAgICAgICAgdGhpcy51cGRhdGVNb2RlbEFuZFJlZnJlc2goY29uc3RhbnRzLlNURVBfU09SVCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5hZGRWaXJ0dWFsUm93TGlzdGVuZXIgPSBmdW5jdGlvbihyb3dJbmRleCwgY2FsbGJhY2spIHtcclxuICAgIGlmICghdGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XSkge1xyXG4gICAgICAgIHRoaXMudmlydHVhbFJvd0NhbGxiYWNrc1tyb3dJbmRleF0gPSBbXTtcclxuICAgIH1cclxuICAgIHRoaXMudmlydHVhbFJvd0NhbGxiYWNrc1tyb3dJbmRleF0ucHVzaChjYWxsYmFjayk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5vblZpcnR1YWxSb3dTZWxlY3RlZCA9IGZ1bmN0aW9uKHJvd0luZGV4LCBzZWxlY3RlZCkge1xyXG4gICAgLy8gaW5mb3JtIHRoZSBjYWxsYmFja3Mgb2YgdGhlIGV2ZW50XHJcbiAgICBpZiAodGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XSkge1xyXG4gICAgICAgIHRoaXMudmlydHVhbFJvd0NhbGxiYWNrc1tyb3dJbmRleF0uZm9yRWFjaChmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrLnJvd1JlbW92ZWQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrLnJvd1NlbGVjdGVkKHNlbGVjdGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUub25WaXJ0dWFsUm93UmVtb3ZlZCA9IGZ1bmN0aW9uKHJvd0luZGV4KSB7XHJcbiAgICAvLyBpbmZvcm0gdGhlIGNhbGxiYWNrcyBvZiB0aGUgZXZlbnRcclxuICAgIGlmICh0aGlzLnZpcnR1YWxSb3dDYWxsYmFja3Nbcm93SW5kZXhdKSB7XHJcbiAgICAgICAgdGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XS5mb3JFYWNoKGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sucm93UmVtb3ZlZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sucm93UmVtb3ZlZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvLyByZW1vdmUgdGhlIGNhbGxiYWNrc1xyXG4gICAgZGVsZXRlIHRoaXMudmlydHVhbFJvd0NhbGxiYWNrc1tyb3dJbmRleF07XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5vbk5ld0NvbHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuc2V0dXBDb2x1bW5zKCk7XHJcbiAgICB0aGlzLnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9FVkVSWVRISU5HKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmZpbmRBbGxFbGVtZW50cyA9IGZ1bmN0aW9uKGVHcmlkRGl2KSB7XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgdGhpcy5lUm9vdCA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctcm9vdFwiKTtcclxuICAgICAgICB0aGlzLmVIZWFkZXJDb250YWluZXIgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLWhlYWRlci1jb250YWluZXJcIik7XHJcbiAgICAgICAgdGhpcy5lQm9keUNvbnRhaW5lciA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keS1jb250YWluZXJcIik7XHJcbiAgICAgICAgdGhpcy5lTG9hZGluZ1BhbmVsID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcignLmFnLWxvYWRpbmctcGFuZWwnKTtcclxuICAgICAgICAvLyBmb3Igbm8tc2Nyb2xscywgYWxsIHJvd3MgbGl2ZSBpbiB0aGUgYm9keSBjb250YWluZXJcclxuICAgICAgICB0aGlzLmVQYXJlbnRPZlJvd3MgPSB0aGlzLmVCb2R5Q29udGFpbmVyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVSb290ID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1yb290XCIpO1xyXG4gICAgICAgIHRoaXMuZUJvZHkgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLWJvZHlcIik7XHJcbiAgICAgICAgdGhpcy5lQm9keUNvbnRhaW5lciA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keS1jb250YWluZXJcIik7XHJcbiAgICAgICAgdGhpcy5lQm9keVZpZXdwb3J0ID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1ib2R5LXZpZXdwb3J0XCIpO1xyXG4gICAgICAgIHRoaXMuZUJvZHlWaWV3cG9ydFdyYXBwZXIgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLWJvZHktdmlld3BvcnQtd3JhcHBlclwiKTtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1waW5uZWQtY29scy1jb250YWluZXJcIik7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc1ZpZXdwb3J0ID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1waW5uZWQtY29scy12aWV3cG9ydFwiKTtcclxuICAgICAgICB0aGlzLmVQaW5uZWRIZWFkZXIgPSBlR3JpZERpdi5xdWVyeVNlbGVjdG9yKFwiLmFnLXBpbm5lZC1oZWFkZXJcIik7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1oZWFkZXJcIik7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyQ29udGFpbmVyID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcihcIi5hZy1oZWFkZXItY29udGFpbmVyXCIpO1xyXG4gICAgICAgIHRoaXMuZUxvYWRpbmdQYW5lbCA9IGVHcmlkRGl2LnF1ZXJ5U2VsZWN0b3IoJy5hZy1sb2FkaW5nLXBhbmVsJyk7XHJcbiAgICAgICAgdGhpcy5lVG9vbFBhbmVsQ29udGFpbmVyID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcignLmFnLXRvb2wtcGFuZWwtY29udGFpbmVyJyk7XHJcbiAgICAgICAgLy8gZm9yIHNjcm9sbHMsIGFsbCByb3dzIGxpdmUgaW4gZUJvZHkgKGNvbnRhaW5pbmcgcGlubmVkIGFuZCBub3JtYWwgYm9keSlcclxuICAgICAgICB0aGlzLmVQYXJlbnRPZlJvd3MgPSB0aGlzLmVCb2R5O1xyXG4gICAgICAgIHRoaXMuZVBhZ2luZ1BhbmVsID0gZUdyaWREaXYucXVlcnlTZWxlY3RvcignLmFnLXBhZ2luZy1wYW5lbCcpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2hvd1Bpbm5lZENvbENvbnRhaW5lcnNJZk5lZWRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gbm8gbmVlZCB0byBkbyB0aGlzIGlmIG5vdCB1c2luZyBzY3JvbGxzXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzaG93aW5nUGlubmVkQ29scyA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFBpbm5lZENvbENvdW50KCkgPiAwO1xyXG5cclxuICAgIC8vc29tZSBicm93c2VycyBoYWQgbGF5b3V0IGlzc3VlcyB3aXRoIHRoZSBibGFuayBkaXZzLCBzbyBpZiBibGFuayxcclxuICAgIC8vd2UgZG9uJ3QgZGlzcGxheSB0aGVtXHJcbiAgICBpZiAoc2hvd2luZ1Bpbm5lZENvbHMpIHtcclxuICAgICAgICB0aGlzLmVQaW5uZWRIZWFkZXIuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZENvbHNWaWV3cG9ydC5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZEhlYWRlci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZENvbHNWaWV3cG9ydC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUudXBkYXRlQm9keUNvbnRhaW5lcldpZHRoQWZ0ZXJDb2xSZXNpemUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucm93UmVuZGVyZXIuc2V0TWFpblJvd1dpZHRocygpO1xyXG4gICAgdGhpcy5zZXRCb2R5Q29udGFpbmVyV2lkdGgoKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnVwZGF0ZVBpbm5lZENvbENvbnRhaW5lcldpZHRoQWZ0ZXJDb2xSZXNpemUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuc2V0UGlubmVkQ29sQ29udGFpbmVyV2lkdGgoKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNldFBpbm5lZENvbENvbnRhaW5lcldpZHRoID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcGlubmVkQ29sV2lkdGggPSB0aGlzLmNvbHVtbk1vZGVsLmdldFBpbm5lZENvbnRhaW5lcldpZHRoKCkgKyBcInB4XCI7XHJcbiAgICB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyLnN0eWxlLndpZHRoID0gcGlubmVkQ29sV2lkdGg7XHJcbiAgICB0aGlzLmVCb2R5Vmlld3BvcnRXcmFwcGVyLnN0eWxlLm1hcmdpbkxlZnQgPSBwaW5uZWRDb2xXaWR0aDtcclxufTtcclxuXHJcbi8vIHNlZSBpZiBhIGdyZXkgYm94IGlzIG5lZWRlZCBhdCB0aGUgYm90dG9tIG9mIHRoZSBwaW5uZWQgY29sXHJcbkdyaWQucHJvdG90eXBlLnNldFBpbm5lZENvbEhlaWdodCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gdmFyIGJvZHlIZWlnaHQgPSB1dGlscy5waXhlbFN0cmluZ1RvTnVtYmVyKHRoaXMuZUJvZHkuc3R5bGUuaGVpZ2h0KTtcclxuICAgIHZhciBzY3JvbGxTaG93aW5nID0gdGhpcy5lQm9keVZpZXdwb3J0LmNsaWVudFdpZHRoIDwgdGhpcy5lQm9keVZpZXdwb3J0LnNjcm9sbFdpZHRoO1xyXG4gICAgdmFyIGJvZHlIZWlnaHQgPSB0aGlzLmVCb2R5Vmlld3BvcnQub2Zmc2V0SGVpZ2h0O1xyXG4gICAgaWYgKHNjcm9sbFNob3dpbmcpIHtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzVmlld3BvcnQuc3R5bGUuaGVpZ2h0ID0gKGJvZHlIZWlnaHQgLSB0aGlzLnNjcm9sbFdpZHRoKSArIFwicHhcIjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc1ZpZXdwb3J0LnN0eWxlLmhlaWdodCA9IGJvZHlIZWlnaHQgKyBcInB4XCI7XHJcbiAgICB9XHJcbiAgICAvLyBhbHNvIHRoZSBsb2FkaW5nIG92ZXJsYXksIG5lZWRzIHRvIGhhdmUgaXQncyBoZWlnaHQgYWRqdXN0ZWRcclxuICAgIHRoaXMuZUxvYWRpbmdQYW5lbC5zdHlsZS5oZWlnaHQgPSBib2R5SGVpZ2h0ICsgJ3B4JztcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNldEJvZHlTaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIHZhciBib2R5SGVpZ2h0ID0gdGhpcy5lQm9keVZpZXdwb3J0Lm9mZnNldEhlaWdodDtcclxuICAgIHZhciBwYWdpbmdWaXNpYmxlID0gdGhpcy5pc1Nob3dQYWdpbmdQYW5lbCgpO1xyXG5cclxuICAgIGlmICh0aGlzLmJvZHlIZWlnaHRMYXN0VGltZSAhPSBib2R5SGVpZ2h0IHx8IHRoaXMuc2hvd1BhZ2luZ1BhbmVsVmlzaWJsZUxhc3RUaW1lICE9IHBhZ2luZ1Zpc2libGUpIHtcclxuICAgICAgICB0aGlzLmJvZHlIZWlnaHRMYXN0VGltZSA9IGJvZHlIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5zaG93UGFnaW5nUGFuZWxWaXNpYmxlTGFzdFRpbWUgPSBwYWdpbmdWaXNpYmxlO1xyXG5cclxuICAgICAgICB0aGlzLnNldFBpbm5lZENvbEhlaWdodCgpO1xyXG5cclxuICAgICAgICAvL29ubHkgZHJhdyB2aXJ0dWFsIHJvd3MgaWYgZG9uZSBzb3J0ICYgZmlsdGVyIC0gdGhpc1xyXG4gICAgICAgIC8vbWVhbnMgd2UgZG9uJ3QgZHJhdyByb3dzIGlmIHRhYmxlIGlzIG5vdCB5ZXQgaW5pdGlhbGlzZWRcclxuICAgICAgICBpZiAodGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93Q291bnQoKSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5yb3dSZW5kZXJlci5kcmF3VmlydHVhbFJvd3MoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHNob3cgYW5kIHBvc2l0aW9uIHBhZ2luZyBwYW5lbFxyXG4gICAgICAgIHRoaXMuc2hvd0FuZFBvc2l0aW9uUGFnaW5nUGFuZWwoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuZmluaXNoZWQpIHtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBfdGhpcy5zZXRCb2R5U2l6ZSgpO1xyXG4gICAgICAgIH0sIDIwMCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5hZGRTY3JvbGxMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIHZhciBsYXN0TGVmdFBvc2l0aW9uID0gLTE7XHJcbiAgICB2YXIgbGFzdFRvcFBvc2l0aW9uID0gLTE7XHJcblxyXG4gICAgdGhpcy5lQm9keVZpZXdwb3J0LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG5ld0xlZnRQb3NpdGlvbiA9IHRoYXQuZUJvZHlWaWV3cG9ydC5zY3JvbGxMZWZ0O1xyXG4gICAgICAgIHZhciBuZXdUb3BQb3NpdGlvbiA9IHRoYXQuZUJvZHlWaWV3cG9ydC5zY3JvbGxUb3A7XHJcblxyXG4gICAgICAgIGlmIChuZXdMZWZ0UG9zaXRpb24gIT09IGxhc3RMZWZ0UG9zaXRpb24pIHtcclxuICAgICAgICAgICAgbGFzdExlZnRQb3NpdGlvbiA9IG5ld0xlZnRQb3NpdGlvbjtcclxuICAgICAgICAgICAgdGhhdC5zY3JvbGxIZWFkZXIobmV3TGVmdFBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChuZXdUb3BQb3NpdGlvbiAhPT0gbGFzdFRvcFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGxhc3RUb3BQb3NpdGlvbiA9IG5ld1RvcFBvc2l0aW9uO1xyXG4gICAgICAgICAgICB0aGF0LnNjcm9sbFBpbm5lZChuZXdUb3BQb3NpdGlvbik7XHJcbiAgICAgICAgICAgIHRoYXQucm93UmVuZGVyZXIuZHJhd1ZpcnR1YWxSb3dzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5lUGlubmVkQ29sc1ZpZXdwb3J0LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gdGhpcyBtZWFucyB0aGUgcGlubmVkIHBhbmVsIHdhcyBtb3ZlZCwgd2hpY2ggY2FuIG9ubHlcclxuICAgICAgICAvLyBoYXBwZW4gd2hlbiB0aGUgdXNlciBpcyBuYXZpZ2F0aW5nIGluIHRoZSBwaW5uZWQgY29udGFpbmVyXHJcbiAgICAgICAgLy8gYXMgdGhlIHBpbm5lZCBjb2wgc2hvdWxkIG5ldmVyIHNjcm9sbC4gc28gd2Ugcm9sbGJhY2tcclxuICAgICAgICAvLyB0aGUgc2Nyb2xsIG9uIHRoZSBwaW5uZWQuXHJcbiAgICAgICAgdGhhdC5lUGlubmVkQ29sc1ZpZXdwb3J0LnNjcm9sbFRvcCA9IDA7XHJcbiAgICB9KTtcclxuXHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zY3JvbGxIZWFkZXIgPSBmdW5jdGlvbihib2R5TGVmdFBvc2l0aW9uKSB7XHJcbiAgICAvLyB0aGlzLmVIZWFkZXJDb250YWluZXIuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZTNkKCcgKyAtYm9keUxlZnRQb3NpdGlvbiArIFwicHgsMCwwKVwiO1xyXG4gICAgdGhpcy5lSGVhZGVyQ29udGFpbmVyLnN0eWxlLmxlZnQgPSAtYm9keUxlZnRQb3NpdGlvbiArIFwicHhcIjtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNjcm9sbFBpbm5lZCA9IGZ1bmN0aW9uKGJvZHlUb3BQb3NpdGlvbikge1xyXG4gICAgLy8gdGhpcy5lUGlubmVkQ29sc0NvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoMCwnICsgLWJvZHlUb3BQb3NpdGlvbiArIFwicHgsMClcIjtcclxuICAgIHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIuc3R5bGUudG9wID0gLWJvZHlUb3BQb3NpdGlvbiArIFwicHhcIjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR3JpZDtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxkaXYgY2xhc3M9XFxcImFnLXJvb3QgYWctbm8tc2Nyb2xsc1xcXCI+PGRpdiBjbGFzcz1hZy1sb2FkaW5nLXBhbmVsPjxkaXYgY2xhc3M9YWctbG9hZGluZy13cmFwcGVyPjxzcGFuIGNsYXNzPWFnLWxvYWRpbmctY2VudGVyPkxvYWRpbmcuLi48L3NwYW4+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1hZy1oZWFkZXItY29udGFpbmVyPjwvZGl2PjxkaXYgY2xhc3M9YWctYm9keS1jb250YWluZXI+PC9kaXY+PC9kaXY+XCI7XG4iLCJ2YXIgREVGQVVMVF9ST1dfSEVJR0hUID0gMzA7XHJcblxyXG52YXIgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcclxuZnVuY3Rpb24gR3JpZE9wdGlvbnNXcmFwcGVyKGdyaWRPcHRpb25zKSB7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zID0gZ3JpZE9wdGlvbnM7XHJcbiAgICB0aGlzLnNldHVwRGVmYXVsdHMoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNUcnVlKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gdmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09ICd0cnVlJztcclxufVxyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc1N1cHByZXNzVmVydGljYWxTY3JvbGwgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLnN1cHByZXNzVmVydGljYWxTY3JvbGwpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzUm93U2VsZWN0aW9uID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd1NlbGVjdGlvbiA9PT0gXCJzaW5nbGVcIiB8fCB0aGlzLmdyaWRPcHRpb25zLnJvd1NlbGVjdGlvbiA9PT0gXCJtdWx0aXBsZVwiOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzUm93RGVzZWxlY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLnJvd0Rlc2VsZWN0aW9uKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc1Jvd1NlbGVjdGlvbk11bHRpID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd1NlbGVjdGlvbiA9PT0gJ211bHRpcGxlJzsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRDb250ZXh0ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmNvbnRleHQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNWaXJ0dWFsUGFnaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy52aXJ0dWFsUGFnaW5nKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc1Nob3dUb29sUGFuZWwgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLnNob3dUb29sUGFuZWwpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzUm93c0FscmVhZHlHcm91cGVkID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5yb3dzQWxyZWFkeUdyb3VwZWQpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzR3JvdXBTZWxlY3RzQ2hpbGRyZW4gPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLmdyb3VwU2VsZWN0c0NoaWxkcmVuKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0dyb3VwSW5jbHVkZUZvb3RlciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBJbmNsdWRlRm9vdGVyKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc1N1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLnN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb24pOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzU3VwcHJlc3NDZWxsU2VsZWN0aW9uID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5zdXBwcmVzc0NlbGxTZWxlY3Rpb24pOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzU3VwcHJlc3NVblNvcnQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLnN1cHByZXNzVW5Tb3J0KTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc1N1cHByZXNzTXVsdGlTb3J0ID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5zdXBwcmVzc011bHRpU29ydCk7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNHcm91cEhlYWRlcnMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLmdyb3VwSGVhZGVycyk7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0R3JvdXBJbm5lclJlbmRlcmVyID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmdyb3VwSW5uZXJSZW5kZXJlcjsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0RvbnRVc2VTY3JvbGxzID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5kb250VXNlU2Nyb2xscyk7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Um93U3R5bGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMucm93U3R5bGU7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Um93Q2xhc3MgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMucm93Q2xhc3M7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0R3JpZE9wdGlvbnMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnM7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0SGVhZGVyQ2VsbFJlbmRlcmVyID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmhlYWRlckNlbGxSZW5kZXJlcjsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRBcGkgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuYXBpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzRW5hYmxlQ29sUmVzaXplID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmVuYWJsZUNvbFJlc2l6ZTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRHcm91cERlZmF1bHRFeHBhbmRlZCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5ncm91cERlZmF1bHRFeHBhbmRlZDsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRHcm91cEtleXMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBLZXlzOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldEdyb3VwQWdnRnVuY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBBZ2dGdW5jdGlvbjsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRHcm91cEFnZ0ZpZWxkcyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5ncm91cEFnZ0ZpZWxkczsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRBbGxSb3dzID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd0RhdGE7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNHcm91cFVzZUVudGlyZVJvdyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBVc2VFbnRpcmVSb3cpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzQW5ndWxhckNvbXBpbGVSb3dzID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5hbmd1bGFyQ29tcGlsZVJvd3MpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzQW5ndWxhckNvbXBpbGVGaWx0ZXJzID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5hbmd1bGFyQ29tcGlsZUZpbHRlcnMpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzQW5ndWxhckNvbXBpbGVIZWFkZXJzID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5hbmd1bGFyQ29tcGlsZUhlYWRlcnMpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldENvbHVtbkRlZnMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuY29sdW1uRGVmczsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRSb3dIZWlnaHQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMucm93SGVpZ2h0OyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldE1vZGVsVXBkYXRlZCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5tb2RlbFVwZGF0ZWQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Q2VsbENsaWNrZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuY2VsbENsaWNrZWQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Q2VsbERvdWJsZUNsaWNrZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuY2VsbERvdWJsZUNsaWNrZWQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Q2VsbFZhbHVlQ2hhbmdlZCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5jZWxsVmFsdWVDaGFuZ2VkOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldENlbGxGb2N1c2VkID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmNlbGxGb2N1c2VkOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldFJvd1NlbGVjdGVkID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd1NlbGVjdGVkOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldFNlbGVjdGlvbkNoYW5nZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuc2VsZWN0aW9uQ2hhbmdlZDsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRWaXJ0dWFsUm93UmVtb3ZlZCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy52aXJ0dWFsUm93UmVtb3ZlZDsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXREYXRhc291cmNlID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmRhdGFzb3VyY2U7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0UmVhZHkgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMucmVhZHk7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Um93QnVmZmVyID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd0J1ZmZlcjsgfTtcclxuXHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Q29sV2lkdGggPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0eXBlb2YgdGhpcy5ncmlkT3B0aW9ucy5jb2xXaWR0aCAhPT0gJ251bWJlcicgfHwgIHRoaXMuZ3JpZE9wdGlvbnMuY29sV2lkdGggPCBjb25zdGFudHMuTUlOX0NPTF9XSURUSCkge1xyXG4gICAgICAgIHJldHVybiAyMDA7XHJcbiAgICB9IGVsc2UgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5jb2xXaWR0aDtcclxuICAgIH1cclxufTtcclxuXHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNFbmFibGVTb3J0aW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5lbmFibGVTb3J0aW5nKSB8fCBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5lbmFibGVTZXJ2ZXJTaWRlU29ydGluZyk7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNFbmFibGVTZXJ2ZXJTaWRlU29ydGluZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlU2VydmVyU2lkZVNvcnRpbmcpOyB9O1xyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0VuYWJsZUZpbHRlciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlRmlsdGVyKSB8fCBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5lbmFibGVTZXJ2ZXJTaWRlRmlsdGVyKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0VuYWJsZVNlcnZlclNpZGVGaWx0ZXIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlU2VydmVyU2lkZUZpbHRlcjsgfTtcclxuXHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuc2V0U2VsZWN0ZWRSb3dzID0gZnVuY3Rpb24obmV3U2VsZWN0ZWRSb3dzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5zZWxlY3RlZFJvd3MgPSBuZXdTZWxlY3RlZFJvd3M7XHJcbn07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuc2V0U2VsZWN0ZWROb2Rlc0J5SWQgPSBmdW5jdGlvbihuZXdTZWxlY3RlZE5vZGVzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5zZWxlY3RlZE5vZGVzQnlJZCA9IG5ld1NlbGVjdGVkTm9kZXM7XHJcbn07XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldEljb25zID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5pY29ucztcclxufTtcclxuXHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNEb0ludGVybmFsR3JvdXBpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAhdGhpcy5pc1Jvd3NBbHJlYWR5R3JvdXBlZCgpICYmIHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBLZXlzO1xyXG59O1xyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRIZWFkZXJIZWlnaHQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0eXBlb2YgdGhpcy5ncmlkT3B0aW9ucy5oZWFkZXJIZWlnaHQgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgLy8gaWYgaGVhZGVyIGhlaWdodCBwcm92aWRlZCwgdXNlZCBpdFxyXG4gICAgICAgIHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmhlYWRlckhlaWdodDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlIHJldHVybiAyNSBpZiBubyBncm91cGluZywgNTAgaWYgZ3JvdXBpbmdcclxuICAgICAgICBpZiAodGhpcy5pc0dyb3VwSGVhZGVycygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiA1MDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gMjU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5zZXR1cERlZmF1bHRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnMucm93SGVpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5yb3dIZWlnaHQgPSBERUZBVUxUX1JPV19IRUlHSFQ7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldFBpbm5lZENvbENvdW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBpZiBub3QgdXNpbmcgc2Nyb2xscywgdGhlbiBwaW5uZWQgY29sdW1ucyBkb2Vzbid0IG1ha2VcclxuICAgIC8vIHNlbnNlLCBzbyBhbHdheXMgcmV0dXJuIDBcclxuICAgIGlmICh0aGlzLmlzRG9udFVzZVNjcm9sbHMoKSkge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMucGlubmVkQ29sdW1uQ291bnQpIHtcclxuICAgICAgICAvL2luIGNhc2UgdXNlciBwdXRzIGluIGEgc3RyaW5nLCBjYXN0IHRvIG51bWJlclxyXG4gICAgICAgIHJldHVybiBOdW1iZXIodGhpcy5ncmlkT3B0aW9ucy5waW5uZWRDb2x1bW5Db3VudCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRMb2NhbGVUZXh0RnVuYyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChrZXksIGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgICAgIHZhciBsb2NhbGVUZXh0ID0gdGhhdC5ncmlkT3B0aW9ucy5sb2NhbGVUZXh0O1xyXG4gICAgICAgIGlmIChsb2NhbGVUZXh0ICYmIGxvY2FsZVRleHRba2V5XSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbG9jYWxlVGV4dFtrZXldO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4iLCJmdW5jdGlvbiBHcm91cENyZWF0b3IoKSB7fVxyXG5cclxuR3JvdXBDcmVhdG9yLnByb3RvdHlwZS5ncm91cCA9IGZ1bmN0aW9uKHJvd05vZGVzLCBncm91cEJ5RmllbGRzLCBncm91cEFnZ0Z1bmN0aW9uLCBleHBhbmRCeURlZmF1bHQpIHtcclxuXHJcbiAgICB2YXIgdG9wTW9zdEdyb3VwID0ge1xyXG4gICAgICAgIGxldmVsOiAtMSxcclxuICAgICAgICBjaGlsZHJlbjogW10sXHJcbiAgICAgICAgY2hpbGRyZW5NYXA6IHt9XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBhbGxHcm91cHMgPSBbXTtcclxuICAgIGFsbEdyb3Vwcy5wdXNoKHRvcE1vc3RHcm91cCk7XHJcblxyXG4gICAgdmFyIGxldmVsVG9JbnNlcnRDaGlsZCA9IGdyb3VwQnlGaWVsZHMubGVuZ3RoIC0gMTtcclxuICAgIHZhciBpLCBjdXJyZW50TGV2ZWwsIG5vZGUsIGRhdGEsIGN1cnJlbnRHcm91cCwgZ3JvdXBCeUZpZWxkLCBncm91cEtleSwgbmV4dEdyb3VwO1xyXG5cclxuICAgIC8vIHN0YXJ0IGF0IC0xIGFuZCBnbyBiYWNrd2FyZHMsIGFzIGFsbCB0aGUgcG9zaXRpdmUgaW5kZXhlc1xyXG4gICAgLy8gYXJlIGFscmVhZHkgdXNlZCBieSB0aGUgbm9kZXMuXHJcbiAgICB2YXIgaW5kZXggPSAtMTtcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgcm93Tm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBub2RlID0gcm93Tm9kZXNbaV07XHJcbiAgICAgICAgZGF0YSA9IG5vZGUuZGF0YTtcclxuXHJcbiAgICAgICAgLy8gYWxsIGxlYWYgbm9kZXMgaGF2ZSB0aGUgc2FtZSBsZXZlbCBpbiB0aGlzIGdyb3VwaW5nLCB3aGljaCBpcyBvbmUgbGV2ZWwgYWZ0ZXIgdGhlIGxhc3QgZ3JvdXBcclxuICAgICAgICBub2RlLmxldmVsID0gbGV2ZWxUb0luc2VydENoaWxkICsgMTtcclxuXHJcbiAgICAgICAgZm9yIChjdXJyZW50TGV2ZWwgPSAwOyBjdXJyZW50TGV2ZWwgPCBncm91cEJ5RmllbGRzLmxlbmd0aDsgY3VycmVudExldmVsKyspIHtcclxuICAgICAgICAgICAgZ3JvdXBCeUZpZWxkID0gZ3JvdXBCeUZpZWxkc1tjdXJyZW50TGV2ZWxdO1xyXG4gICAgICAgICAgICBncm91cEtleSA9IGRhdGFbZ3JvdXBCeUZpZWxkXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50TGV2ZWwgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEdyb3VwID0gdG9wTW9zdEdyb3VwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBncm91cCBkb2Vzbid0IGV4aXN0IHlldCwgY3JlYXRlIGl0XHJcbiAgICAgICAgICAgIG5leHRHcm91cCA9IGN1cnJlbnRHcm91cC5jaGlsZHJlbk1hcFtncm91cEtleV07XHJcbiAgICAgICAgICAgIGlmICghbmV4dEdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBuZXh0R3JvdXAgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZmllbGQ6IGdyb3VwQnlGaWVsZCxcclxuICAgICAgICAgICAgICAgICAgICBpZDogaW5kZXgtLSxcclxuICAgICAgICAgICAgICAgICAgICBrZXk6IGdyb3VwS2V5LFxyXG4gICAgICAgICAgICAgICAgICAgIGV4cGFuZGVkOiB0aGlzLmlzRXhwYW5kZWQoZXhwYW5kQnlEZWZhdWx0LCBjdXJyZW50TGV2ZWwpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAvLyBmb3IgdG9wIG1vc3QgbGV2ZWwsIHBhcmVudCBpcyBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdXJyZW50R3JvdXAgPT09IHRvcE1vc3RHcm91cCA/IG51bGwgOiBjdXJyZW50R3JvdXAsXHJcbiAgICAgICAgICAgICAgICAgICAgYWxsQ2hpbGRyZW5Db3VudDogMCxcclxuICAgICAgICAgICAgICAgICAgICBsZXZlbDogY3VycmVudEdyb3VwLmxldmVsICsgMSxcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbk1hcDoge30gLy90aGlzIGlzIGEgdGVtcG9yYXJ5IG1hcCwgd2UgcmVtb3ZlIGF0IHRoZSBlbmQgb2YgdGhpcyBtZXRob2RcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50R3JvdXAuY2hpbGRyZW5NYXBbZ3JvdXBLZXldID0gbmV4dEdyb3VwO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEdyb3VwLmNoaWxkcmVuLnB1c2gobmV4dEdyb3VwKTtcclxuICAgICAgICAgICAgICAgIGFsbEdyb3Vwcy5wdXNoKG5leHRHcm91cCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG5leHRHcm91cC5hbGxDaGlsZHJlbkNvdW50Kys7XHJcblxyXG4gICAgICAgICAgICBpZiAoY3VycmVudExldmVsID09IGxldmVsVG9JbnNlcnRDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5wYXJlbnQgPSBuZXh0R3JvdXAgPT09IHRvcE1vc3RHcm91cCA/IG51bGwgOiBuZXh0R3JvdXA7XHJcbiAgICAgICAgICAgICAgICBuZXh0R3JvdXAuY2hpbGRyZW4ucHVzaChub2RlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRHcm91cCA9IG5leHRHcm91cDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy9yZW1vdmUgdGhlIHRlbXBvcmFyeSBtYXBcclxuICAgIGZvciAoaSA9IDA7IGkgPCBhbGxHcm91cHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBkZWxldGUgYWxsR3JvdXBzW2ldLmNoaWxkcmVuTWFwO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0b3BNb3N0R3JvdXAuY2hpbGRyZW47XHJcbn07XHJcblxyXG5Hcm91cENyZWF0b3IucHJvdG90eXBlLmlzRXhwYW5kZWQgPSBmdW5jdGlvbihleHBhbmRCeURlZmF1bHQsIGxldmVsKSB7XHJcbiAgICBpZiAodHlwZW9mIGV4cGFuZEJ5RGVmYXVsdCA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICByZXR1cm4gbGV2ZWwgPCBleHBhbmRCeURlZmF1bHQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBleHBhbmRCeURlZmF1bHQgPT09IHRydWUgfHwgZXhwYW5kQnlEZWZhdWx0ID09PSAndHJ1ZSc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBHcm91cENyZWF0b3IoKTtcclxuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG52YXIgU3ZnRmFjdG9yeSA9IHJlcXVpcmUoJy4vc3ZnRmFjdG9yeScpO1xyXG52YXIgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcclxuXHJcbnZhciBzdmdGYWN0b3J5ID0gbmV3IFN2Z0ZhY3RvcnkoKTtcclxuXHJcbmZ1bmN0aW9uIEhlYWRlclJlbmRlcmVyKCkge31cclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oZ3JpZE9wdGlvbnNXcmFwcGVyLCBjb2x1bW5Db250cm9sbGVyLCBjb2x1bW5Nb2RlbCwgZUdyaWQsIGFuZ3VsYXJHcmlkLCBmaWx0ZXJNYW5hZ2VyLCAkc2NvcGUsICRjb21waWxlLCBleHByZXNzaW9uU2VydmljZSkge1xyXG4gICAgdGhpcy5leHByZXNzaW9uU2VydmljZSA9IGV4cHJlc3Npb25TZXJ2aWNlO1xyXG4gICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIgPSBncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsID0gY29sdW1uTW9kZWw7XHJcbiAgICB0aGlzLmNvbHVtbkNvbnRyb2xsZXIgPSBjb2x1bW5Db250cm9sbGVyO1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkO1xyXG4gICAgdGhpcy5maWx0ZXJNYW5hZ2VyID0gZmlsdGVyTWFuYWdlcjtcclxuICAgIHRoaXMuJHNjb3BlID0gJHNjb3BlO1xyXG4gICAgdGhpcy4kY29tcGlsZSA9ICRjb21waWxlO1xyXG4gICAgdGhpcy5maW5kQWxsRWxlbWVudHMoZUdyaWQpO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmZpbmRBbGxFbGVtZW50cyA9IGZ1bmN0aW9uKGVHcmlkKSB7XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9udFVzZVNjcm9sbHMoKSkge1xyXG4gICAgICAgIHRoaXMuZUhlYWRlckNvbnRhaW5lciA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctaGVhZGVyLWNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLmVSb290ID0gZUdyaWQucXVlcnlTZWxlY3RvcihcIi5hZy1yb290XCIpO1xyXG4gICAgICAgIC8vIGZvciBuby1zY3JvbGwsIGFsbCBoZWFkZXIgY2VsbHMgbGl2ZSBpbiB0aGUgaGVhZGVyIGNvbnRhaW5lciAodGhlIGFnLWhlYWRlciBkb2Vzbid0IGV4aXN0KVxyXG4gICAgICAgIHRoaXMuZUhlYWRlclBhcmVudCA9IHRoaXMuZUhlYWRlckNvbnRhaW5lcjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkSGVhZGVyID0gZUdyaWQucXVlcnlTZWxlY3RvcihcIi5hZy1waW5uZWQtaGVhZGVyXCIpO1xyXG4gICAgICAgIHRoaXMuZUhlYWRlckNvbnRhaW5lciA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctaGVhZGVyLWNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLmVIZWFkZXIgPSBlR3JpZC5xdWVyeVNlbGVjdG9yKFwiLmFnLWhlYWRlclwiKTtcclxuICAgICAgICB0aGlzLmVSb290ID0gZUdyaWQucXVlcnlTZWxlY3RvcihcIi5hZy1yb290XCIpO1xyXG4gICAgICAgIC8vIGZvciBzY3JvbGwsIGFsbCBoZWFkZXIgY2VsbHMgbGl2ZSBpbiB0aGUgaGVhZGVyIChjb250YWlucyBib3RoIG5vcm1hbCBhbmQgcGlubmVkIGhlYWRlcnMpXHJcbiAgICAgICAgdGhpcy5lSGVhZGVyUGFyZW50ID0gdGhpcy5lSGVhZGVyO1xyXG4gICAgfVxyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLnJlZnJlc2hIZWFkZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHV0aWxzLnJlbW92ZUFsbENoaWxkcmVuKHRoaXMuZVBpbm5lZEhlYWRlcik7XHJcbiAgICB1dGlscy5yZW1vdmVBbGxDaGlsZHJlbih0aGlzLmVIZWFkZXJDb250YWluZXIpO1xyXG5cclxuICAgIGlmICh0aGlzLmNoaWxkU2NvcGVzKSB7XHJcbiAgICAgICAgdGhpcy5jaGlsZFNjb3Blcy5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkU2NvcGUpIHtcclxuICAgICAgICAgICAgY2hpbGRTY29wZS4kZGVzdHJveSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5jaGlsZFNjb3BlcyA9IFtdO1xyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwSGVhZGVycygpKSB7XHJcbiAgICAgICAgdGhpcy5pbnNlcnRIZWFkZXJzV2l0aEdyb3VwaW5nKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuaW5zZXJ0SGVhZGVyc1dpdGhvdXRHcm91cGluZygpO1xyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5pbnNlcnRIZWFkZXJzV2l0aEdyb3VwaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ3JvdXBzID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRDb2x1bW5Hcm91cHMoKTtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uKGdyb3VwKSB7XHJcbiAgICAgICAgdmFyIGVIZWFkZXJDZWxsID0gdGhhdC5jcmVhdGVHcm91cGVkSGVhZGVyQ2VsbChncm91cCk7XHJcbiAgICAgICAgdmFyIGVDb250YWluZXJUb0FkZFRvID0gZ3JvdXAucGlubmVkID8gdGhhdC5lUGlubmVkSGVhZGVyIDogdGhhdC5lSGVhZGVyQ29udGFpbmVyO1xyXG4gICAgICAgIGVDb250YWluZXJUb0FkZFRvLmFwcGVuZENoaWxkKGVIZWFkZXJDZWxsKTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmNyZWF0ZUdyb3VwZWRIZWFkZXJDZWxsID0gZnVuY3Rpb24oZ3JvdXApIHtcclxuXHJcbiAgICB2YXIgZUhlYWRlckdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBlSGVhZGVyR3JvdXAuY2xhc3NOYW1lID0gJ2FnLWhlYWRlci1ncm91cCc7XHJcblxyXG4gICAgdmFyIGVIZWFkZXJHcm91cENlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGdyb3VwLmVIZWFkZXJHcm91cENlbGwgPSBlSGVhZGVyR3JvdXBDZWxsO1xyXG4gICAgdmFyIGNsYXNzTmFtZXMgPSBbJ2FnLWhlYWRlci1ncm91cC1jZWxsJ107XHJcbiAgICAvLyBoYXZpbmcgZGlmZmVyZW50IGNsYXNzZXMgYmVsb3cgYWxsb3dzIHRoZSBzdHlsZSB0byBub3QgaGF2ZSBhIGJvdHRvbSBib3JkZXJcclxuICAgIC8vIG9uIHRoZSBncm91cCBoZWFkZXIsIGlmIG5vIGdyb3VwIGlzIHNwZWNpZmllZFxyXG4gICAgaWYgKGdyb3VwLm5hbWUpIHtcclxuICAgICAgICBjbGFzc05hbWVzLnB1c2goJ2FnLWhlYWRlci1ncm91cC1jZWxsLXdpdGgtZ3JvdXAnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2xhc3NOYW1lcy5wdXNoKCdhZy1oZWFkZXItZ3JvdXAtY2VsbC1uby1ncm91cCcpO1xyXG4gICAgfVxyXG4gICAgZUhlYWRlckdyb3VwQ2VsbC5jbGFzc05hbWUgPSBjbGFzc05hbWVzLmpvaW4oJyAnKTtcclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNFbmFibGVDb2xSZXNpemUoKSkge1xyXG4gICAgICAgIHZhciBlSGVhZGVyQ2VsbFJlc2l6ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgZUhlYWRlckNlbGxSZXNpemUuY2xhc3NOYW1lID0gXCJhZy1oZWFkZXItY2VsbC1yZXNpemVcIjtcclxuICAgICAgICBlSGVhZGVyR3JvdXBDZWxsLmFwcGVuZENoaWxkKGVIZWFkZXJDZWxsUmVzaXplKTtcclxuICAgICAgICBncm91cC5lSGVhZGVyQ2VsbFJlc2l6ZSA9IGVIZWFkZXJDZWxsUmVzaXplO1xyXG4gICAgICAgIHZhciBkcmFnQ2FsbGJhY2sgPSB0aGlzLmdyb3VwRHJhZ0NhbGxiYWNrRmFjdG9yeShncm91cCk7XHJcbiAgICAgICAgdGhpcy5hZGREcmFnSGFuZGxlcihlSGVhZGVyQ2VsbFJlc2l6ZSwgZHJhZ0NhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBubyByZW5kZXJlciwgZGVmYXVsdCB0ZXh0IHJlbmRlclxyXG4gICAgdmFyIGdyb3VwTmFtZSA9IGdyb3VwLm5hbWU7XHJcbiAgICBpZiAoZ3JvdXBOYW1lICYmIGdyb3VwTmFtZSAhPT0gJycpIHtcclxuICAgICAgICB2YXIgZUdyb3VwQ2VsbExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBlR3JvdXBDZWxsTGFiZWwuY2xhc3NOYW1lID0gJ2FnLWhlYWRlci1ncm91cC1jZWxsLWxhYmVsJztcclxuICAgICAgICBlSGVhZGVyR3JvdXBDZWxsLmFwcGVuZENoaWxkKGVHcm91cENlbGxMYWJlbCk7XHJcblxyXG4gICAgICAgIHZhciBlSW5uZXJUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAgICAgZUlubmVyVGV4dC5jbGFzc05hbWUgPSAnYWctaGVhZGVyLWdyb3VwLXRleHQnO1xyXG4gICAgICAgIGVJbm5lclRleHQuaW5uZXJIVE1MID0gZ3JvdXBOYW1lO1xyXG4gICAgICAgIGVHcm91cENlbGxMYWJlbC5hcHBlbmRDaGlsZChlSW5uZXJUZXh0KTtcclxuXHJcbiAgICAgICAgaWYgKGdyb3VwLmV4cGFuZGFibGUpIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRHcm91cEV4cGFuZEljb24oZ3JvdXAsIGVHcm91cENlbGxMYWJlbCwgZ3JvdXAuZXhwYW5kZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVIZWFkZXJHcm91cC5hcHBlbmRDaGlsZChlSGVhZGVyR3JvdXBDZWxsKTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBncm91cC5kaXNwbGF5ZWRDb2x1bW5zLmZvckVhY2goZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICAgICAgdmFyIGVIZWFkZXJDZWxsID0gdGhhdC5jcmVhdGVIZWFkZXJDZWxsKGNvbHVtbiwgdHJ1ZSwgZ3JvdXApO1xyXG4gICAgICAgIGVIZWFkZXJHcm91cC5hcHBlbmRDaGlsZChlSGVhZGVyQ2VsbCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGF0LnNldFdpZHRoT2ZHcm91cEhlYWRlckNlbGwoZ3JvdXApO1xyXG5cclxuICAgIHJldHVybiBlSGVhZGVyR3JvdXA7XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuYWRkR3JvdXBFeHBhbmRJY29uID0gZnVuY3Rpb24oZ3JvdXAsIGVIZWFkZXJHcm91cCwgZXhwYW5kZWQpIHtcclxuICAgIHZhciBlR3JvdXBJY29uO1xyXG4gICAgaWYgKGV4cGFuZGVkKSB7XHJcbiAgICAgICAgZUdyb3VwSWNvbiA9IHV0aWxzLmNyZWF0ZUljb24oJ2NvbHVtbkdyb3VwT3BlbmVkJywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIG51bGwsIHN2Z0ZhY3RvcnkuY3JlYXRlQXJyb3dMZWZ0U3ZnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZUdyb3VwSWNvbiA9IHV0aWxzLmNyZWF0ZUljb24oJ2NvbHVtbkdyb3VwQ2xvc2VkJywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIG51bGwsIHN2Z0ZhY3RvcnkuY3JlYXRlQXJyb3dSaWdodFN2Zyk7XHJcbiAgICB9XHJcbiAgICBlR3JvdXBJY29uLmNsYXNzTmFtZSA9ICdhZy1oZWFkZXItZXhwYW5kLWljb24nO1xyXG4gICAgZUhlYWRlckdyb3VwLmFwcGVuZENoaWxkKGVHcm91cEljb24pO1xyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGVHcm91cEljb24ub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQuY29sdW1uQ29udHJvbGxlci5jb2x1bW5Hcm91cE9wZW5lZChncm91cCk7XHJcbiAgICB9O1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmFkZERyYWdIYW5kbGVyID0gZnVuY3Rpb24oZURyYWdnYWJsZUVsZW1lbnQsIGRyYWdDYWxsYmFjaykge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgZURyYWdnYWJsZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oZG93bkV2ZW50KSB7XHJcbiAgICAgICAgZHJhZ0NhbGxiYWNrLm9uRHJhZ1N0YXJ0KCk7XHJcbiAgICAgICAgdGhhdC5lUm9vdC5zdHlsZS5jdXJzb3IgPSBcImNvbC1yZXNpemVcIjtcclxuICAgICAgICB0aGF0LmRyYWdTdGFydFggPSBkb3duRXZlbnQuY2xpZW50WDtcclxuXHJcbiAgICAgICAgdmFyIGxpc3RlbmVyc1RvUmVtb3ZlID0ge307XHJcblxyXG4gICAgICAgIGxpc3RlbmVyc1RvUmVtb3ZlLm1vdXNlbW92ZSA9IGZ1bmN0aW9uIChtb3ZlRXZlbnQpIHtcclxuICAgICAgICAgICAgdmFyIG5ld1ggPSBtb3ZlRXZlbnQuY2xpZW50WDtcclxuICAgICAgICAgICAgdmFyIGNoYW5nZSA9IG5ld1ggLSB0aGF0LmRyYWdTdGFydFg7XHJcbiAgICAgICAgICAgIGRyYWdDYWxsYmFjay5vbkRyYWdnaW5nKGNoYW5nZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGlzdGVuZXJzVG9SZW1vdmUubW91c2V1cCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhhdC5zdG9wRHJhZ2dpbmcobGlzdGVuZXJzVG9SZW1vdmUpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxpc3RlbmVyc1RvUmVtb3ZlLm1vdXNlbGVhdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc3RvcERyYWdnaW5nKGxpc3RlbmVyc1RvUmVtb3ZlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGF0LmVSb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGxpc3RlbmVyc1RvUmVtb3ZlLm1vdXNlbW92ZSk7XHJcbiAgICAgICAgdGhhdC5lUm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgbGlzdGVuZXJzVG9SZW1vdmUubW91c2V1cCk7XHJcbiAgICAgICAgdGhhdC5lUm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgbGlzdGVuZXJzVG9SZW1vdmUubW91c2VsZWF2ZSk7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5zZXRXaWR0aE9mR3JvdXBIZWFkZXJDZWxsID0gZnVuY3Rpb24oaGVhZGVyR3JvdXApIHtcclxuICAgIHZhciB0b3RhbFdpZHRoID0gMDtcclxuICAgIGhlYWRlckdyb3VwLmRpc3BsYXllZENvbHVtbnMuZm9yRWFjaChmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgICAgICB0b3RhbFdpZHRoICs9IGNvbHVtbi5hY3R1YWxXaWR0aDtcclxuICAgIH0pO1xyXG4gICAgaGVhZGVyR3JvdXAuZUhlYWRlckdyb3VwQ2VsbC5zdHlsZS53aWR0aCA9IHV0aWxzLmZvcm1hdFdpZHRoKHRvdGFsV2lkdGgpO1xyXG4gICAgaGVhZGVyR3JvdXAuYWN0dWFsV2lkdGggPSB0b3RhbFdpZHRoO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmluc2VydEhlYWRlcnNXaXRob3V0R3JvdXBpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBlUGlubmVkSGVhZGVyID0gdGhpcy5lUGlubmVkSGVhZGVyO1xyXG4gICAgdmFyIGVIZWFkZXJDb250YWluZXIgPSB0aGlzLmVIZWFkZXJDb250YWluZXI7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgdGhpcy5jb2x1bW5Nb2RlbC5nZXREaXNwbGF5ZWRDb2x1bW5zKCkuZm9yRWFjaChmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgICAgICAvLyBvbmx5IGluY2x1ZGUgdGhlIGZpcnN0IHggY29sc1xyXG4gICAgICAgIHZhciBoZWFkZXJDZWxsID0gdGhhdC5jcmVhdGVIZWFkZXJDZWxsKGNvbHVtbiwgZmFsc2UpO1xyXG4gICAgICAgIGlmIChjb2x1bW4ucGlubmVkKSB7XHJcbiAgICAgICAgICAgIGVQaW5uZWRIZWFkZXIuYXBwZW5kQ2hpbGQoaGVhZGVyQ2VsbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZUhlYWRlckNvbnRhaW5lci5hcHBlbmRDaGlsZChoZWFkZXJDZWxsKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVIZWFkZXJDZWxsID0gZnVuY3Rpb24oY29sdW1uLCBncm91cGVkLCBoZWFkZXJHcm91cCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcbiAgICB2YXIgZUhlYWRlckNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgLy8gc3RpY2sgdGhlIGhlYWRlciBjZWxsIGluIGNvbHVtbiwgYXMgd2UgYWNjZXNzIGl0IHdoZW4gZ3JvdXAgaXMgcmUtc2l6ZWRcclxuICAgIGNvbHVtbi5lSGVhZGVyQ2VsbCA9IGVIZWFkZXJDZWxsO1xyXG5cclxuICAgIHZhciBoZWFkZXJDZWxsQ2xhc3NlcyA9IFsnYWctaGVhZGVyLWNlbGwnXTtcclxuICAgIGlmIChncm91cGVkKSB7XHJcbiAgICAgICAgaGVhZGVyQ2VsbENsYXNzZXMucHVzaCgnYWctaGVhZGVyLWNlbGwtZ3JvdXBlZCcpOyAvLyB0aGlzIHRha2VzIDUwJSBoZWlnaHRcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaGVhZGVyQ2VsbENsYXNzZXMucHVzaCgnYWctaGVhZGVyLWNlbGwtbm90LWdyb3VwZWQnKTsgLy8gdGhpcyB0YWtlcyAxMDAlIGhlaWdodFxyXG4gICAgfVxyXG4gICAgZUhlYWRlckNlbGwuY2xhc3NOYW1lID0gaGVhZGVyQ2VsbENsYXNzZXMuam9pbignICcpO1xyXG5cclxuICAgIC8vIGFkZCB0b29sdGlwIGlmIGV4aXN0c1xyXG4gICAgaWYgKGNvbERlZi5oZWFkZXJUb29sdGlwKSB7XHJcbiAgICAgICAgZUhlYWRlckNlbGwudGl0bGUgPSBjb2xEZWYuaGVhZGVyVG9vbHRpcDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNFbmFibGVDb2xSZXNpemUoKSkge1xyXG4gICAgICAgIHZhciBoZWFkZXJDZWxsUmVzaXplID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBoZWFkZXJDZWxsUmVzaXplLmNsYXNzTmFtZSA9IFwiYWctaGVhZGVyLWNlbGwtcmVzaXplXCI7XHJcbiAgICAgICAgZUhlYWRlckNlbGwuYXBwZW5kQ2hpbGQoaGVhZGVyQ2VsbFJlc2l6ZSk7XHJcbiAgICAgICAgdmFyIGRyYWdDYWxsYmFjayA9IHRoaXMuaGVhZGVyRHJhZ0NhbGxiYWNrRmFjdG9yeShlSGVhZGVyQ2VsbCwgY29sdW1uLCBoZWFkZXJHcm91cCk7XHJcbiAgICAgICAgdGhpcy5hZGREcmFnSGFuZGxlcihoZWFkZXJDZWxsUmVzaXplLCBkcmFnQ2FsbGJhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGZpbHRlciBidXR0b25cclxuICAgIHZhciBzaG93TWVudSA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRW5hYmxlRmlsdGVyKCkgJiYgIWNvbERlZi5zdXBwcmVzc01lbnU7XHJcbiAgICBpZiAoc2hvd01lbnUpIHtcclxuICAgICAgICB2YXIgZU1lbnVCdXR0b24gPSB1dGlscy5jcmVhdGVJY29uKCdtZW51JywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbiwgc3ZnRmFjdG9yeS5jcmVhdGVNZW51U3ZnKTtcclxuICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhlTWVudUJ1dHRvbiwgJ2FnLWhlYWRlci1pY29uJyk7XHJcblxyXG4gICAgICAgIGVNZW51QnV0dG9uLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiYWctaGVhZGVyLWNlbGwtbWVudS1idXR0b25cIik7XHJcbiAgICAgICAgZU1lbnVCdXR0b24ub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LmZpbHRlck1hbmFnZXIuc2hvd0ZpbHRlcihjb2x1bW4sIHRoaXMpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgZUhlYWRlckNlbGwuYXBwZW5kQ2hpbGQoZU1lbnVCdXR0b24pO1xyXG4gICAgICAgIGVIZWFkZXJDZWxsLm9ubW91c2VlbnRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBlTWVudUJ1dHRvbi5zdHlsZS5vcGFjaXR5ID0gMTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGVIZWFkZXJDZWxsLm9ubW91c2VsZWF2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBlTWVudUJ1dHRvbi5zdHlsZS5vcGFjaXR5ID0gMDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGVNZW51QnV0dG9uLnN0eWxlLm9wYWNpdHkgPSAwO1xyXG4gICAgICAgIGVNZW51QnV0dG9uLnN0eWxlW1wiLXdlYmtpdC10cmFuc2l0aW9uXCJdID0gXCJvcGFjaXR5IDAuNXMsIGJvcmRlciAwLjJzXCI7XHJcbiAgICAgICAgZU1lbnVCdXR0b24uc3R5bGVbXCJ0cmFuc2l0aW9uXCJdID0gXCJvcGFjaXR5IDAuNXMsIGJvcmRlciAwLjJzXCI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbGFiZWwgZGl2XHJcbiAgICB2YXIgaGVhZGVyQ2VsbExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIGhlYWRlckNlbGxMYWJlbC5jbGFzc05hbWUgPSBcImFnLWhlYWRlci1jZWxsLWxhYmVsXCI7XHJcblxyXG4gICAgLy8gYWRkIGluIHNvcnQgaWNvbnNcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0VuYWJsZVNvcnRpbmcoKSAmJiAhY29sRGVmLnN1cHByZXNzU29ydGluZykge1xyXG4gICAgICAgIGNvbHVtbi5lU29ydEFzYyA9IHV0aWxzLmNyZWF0ZUljb24oJ3NvcnRBc2NlbmRpbmcnLCB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciwgY29sdW1uLCBzdmdGYWN0b3J5LmNyZWF0ZUFycm93RG93blN2Zyk7XHJcbiAgICAgICAgY29sdW1uLmVTb3J0RGVzYyA9IHV0aWxzLmNyZWF0ZUljb24oJ3NvcnREZXNjZW5kaW5nJywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbiwgc3ZnRmFjdG9yeS5jcmVhdGVBcnJvd1VwU3ZnKTtcclxuICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhjb2x1bW4uZVNvcnRBc2MsICdhZy1oZWFkZXItaWNvbicpO1xyXG4gICAgICAgIHV0aWxzLmFkZENzc0NsYXNzKGNvbHVtbi5lU29ydERlc2MsICdhZy1oZWFkZXItaWNvbicpO1xyXG4gICAgICAgIGhlYWRlckNlbGxMYWJlbC5hcHBlbmRDaGlsZChjb2x1bW4uZVNvcnRBc2MpO1xyXG4gICAgICAgIGhlYWRlckNlbGxMYWJlbC5hcHBlbmRDaGlsZChjb2x1bW4uZVNvcnREZXNjKTtcclxuICAgICAgICBjb2x1bW4uZVNvcnRBc2Muc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICBjb2x1bW4uZVNvcnREZXNjLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5hZGRTb3J0SGFuZGxpbmcoaGVhZGVyQ2VsbExhYmVsLCBjb2x1bW4pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFkZCBpbiBmaWx0ZXIgaWNvblxyXG4gICAgY29sdW1uLmVGaWx0ZXJJY29uID0gdXRpbHMuY3JlYXRlSWNvbignZmlsdGVyJywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbiwgc3ZnRmFjdG9yeS5jcmVhdGVGaWx0ZXJTdmcpO1xyXG4gICAgdXRpbHMuYWRkQ3NzQ2xhc3MoY29sdW1uLmVGaWx0ZXJJY29uLCAnYWctaGVhZGVyLWljb24nKTtcclxuICAgIGhlYWRlckNlbGxMYWJlbC5hcHBlbmRDaGlsZChjb2x1bW4uZUZpbHRlckljb24pO1xyXG5cclxuICAgIC8vIHJlbmRlciB0aGUgY2VsbCwgdXNlIGEgcmVuZGVyZXIgaWYgb25lIGlzIHByb3ZpZGVkXHJcbiAgICB2YXIgaGVhZGVyQ2VsbFJlbmRlcmVyO1xyXG4gICAgaWYgKGNvbERlZi5oZWFkZXJDZWxsUmVuZGVyZXIpIHsgLy8gZmlyc3QgbG9vayBmb3IgYSByZW5kZXJlciBpbiBjb2wgZGVmXHJcbiAgICAgICAgaGVhZGVyQ2VsbFJlbmRlcmVyID0gY29sRGVmLmhlYWRlckNlbGxSZW5kZXJlcjtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0SGVhZGVyQ2VsbFJlbmRlcmVyKCkpIHsgLy8gc2Vjb25kIGxvb2sgZm9yIG9uZSBpbiBncmlkIG9wdGlvbnNcclxuICAgICAgICBoZWFkZXJDZWxsUmVuZGVyZXIgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRIZWFkZXJDZWxsUmVuZGVyZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbmV3Q2hpbGRTY29wZTtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0FuZ3VsYXJDb21waWxlSGVhZGVycygpKSB7XHJcbiAgICAgICAgbmV3Q2hpbGRTY29wZSA9IHRoaXMuJHNjb3BlLiRuZXcoKTtcclxuICAgICAgICBuZXdDaGlsZFNjb3BlLmNvbERlZiA9IGNvbERlZjtcclxuICAgICAgICBuZXdDaGlsZFNjb3BlLmNvbEluZGV4ID0gY29sRGVmLmluZGV4O1xyXG4gICAgICAgIG5ld0NoaWxkU2NvcGUuY29sRGVmV3JhcHBlciA9IGNvbHVtbjtcclxuICAgICAgICB0aGlzLmNoaWxkU2NvcGVzLnB1c2gobmV3Q2hpbGRTY29wZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhlYWRlck5hbWVWYWx1ZSA9IHRoaXMuY29sdW1uTW9kZWwuZ2V0RGlzcGxheU5hbWVGb3JDb2woY29sdW1uKTtcclxuXHJcbiAgICBpZiAoaGVhZGVyQ2VsbFJlbmRlcmVyKSB7XHJcbiAgICAgICAgLy8gcmVuZGVyZXIgcHJvdmlkZWQsIHVzZSBpdFxyXG4gICAgICAgIHZhciBjZWxsUmVuZGVyZXJQYXJhbXMgPSB7XHJcbiAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAkc2NvcGU6IG5ld0NoaWxkU2NvcGUsXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKSxcclxuICAgICAgICAgICAgdmFsdWU6IGhlYWRlck5hbWVWYWx1ZSxcclxuICAgICAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIGNlbGxSZW5kZXJlclJlc3VsdCA9IGhlYWRlckNlbGxSZW5kZXJlcihjZWxsUmVuZGVyZXJQYXJhbXMpO1xyXG4gICAgICAgIHZhciBjaGlsZFRvQXBwZW5kO1xyXG4gICAgICAgIGlmICh1dGlscy5pc05vZGVPckVsZW1lbnQoY2VsbFJlbmRlcmVyUmVzdWx0KSkge1xyXG4gICAgICAgICAgICAvLyBhIGRvbSBub2RlIG9yIGVsZW1lbnQgd2FzIHJldHVybmVkLCBzbyBhZGQgY2hpbGRcclxuICAgICAgICAgICAgY2hpbGRUb0FwcGVuZCA9IGNlbGxSZW5kZXJlclJlc3VsdDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UgYXNzdW1lIGl0IHdhcyBodG1sLCBzbyBqdXN0IGluc2VydFxyXG4gICAgICAgICAgICB2YXIgZVRleHRTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAgICAgICAgIGVUZXh0U3Bhbi5pbm5lckhUTUwgPSBjZWxsUmVuZGVyZXJSZXN1bHQ7XHJcbiAgICAgICAgICAgIGNoaWxkVG9BcHBlbmQgPSBlVGV4dFNwYW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGFuZ3VsYXIgY29tcGlsZSBoZWFkZXIgaWYgb3B0aW9uIGlzIHR1cm5lZCBvblxyXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0FuZ3VsYXJDb21waWxlSGVhZGVycygpKSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZFRvQXBwZW5kQ29tcGlsZWQgPSB0aGlzLiRjb21waWxlKGNoaWxkVG9BcHBlbmQpKG5ld0NoaWxkU2NvcGUpWzBdO1xyXG4gICAgICAgICAgICBoZWFkZXJDZWxsTGFiZWwuYXBwZW5kQ2hpbGQoY2hpbGRUb0FwcGVuZENvbXBpbGVkKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoZWFkZXJDZWxsTGFiZWwuYXBwZW5kQ2hpbGQoY2hpbGRUb0FwcGVuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBubyByZW5kZXJlciwgZGVmYXVsdCB0ZXh0IHJlbmRlclxyXG4gICAgICAgIHZhciBlSW5uZXJUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAgICAgZUlubmVyVGV4dC5jbGFzc05hbWUgPSAnYWctaGVhZGVyLWNlbGwtdGV4dCc7XHJcbiAgICAgICAgZUlubmVyVGV4dC5pbm5lckhUTUwgPSBoZWFkZXJOYW1lVmFsdWU7XHJcbiAgICAgICAgaGVhZGVyQ2VsbExhYmVsLmFwcGVuZENoaWxkKGVJbm5lclRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGVIZWFkZXJDZWxsLmFwcGVuZENoaWxkKGhlYWRlckNlbGxMYWJlbCk7XHJcbiAgICBlSGVhZGVyQ2VsbC5zdHlsZS53aWR0aCA9IHV0aWxzLmZvcm1hdFdpZHRoKGNvbHVtbi5hY3R1YWxXaWR0aCk7XHJcblxyXG4gICAgcmV0dXJuIGVIZWFkZXJDZWxsO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmFkZFNvcnRIYW5kbGluZyA9IGZ1bmN0aW9uKGhlYWRlckNlbGxMYWJlbCwgY29sdW1uKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgaGVhZGVyQ2VsbExhYmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihlKSB7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBzb3J0IG9uIGN1cnJlbnQgY29sXHJcbiAgICAgICAgaWYgKGNvbHVtbi5zb3J0ID09PSBjb25zdGFudHMuREVTQykge1xyXG4gICAgICAgICAgICBpZiAodGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuaXNTdXBwcmVzc1VuU29ydCgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb2x1bW4uc29ydCA9IGNvbnN0YW50cy5BU0M7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb2x1bW4uc29ydCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGNvbHVtbi5zb3J0ID09PSBjb25zdGFudHMuQVNDKSB7XHJcbiAgICAgICAgICAgIGNvbHVtbi5zb3J0ID0gY29uc3RhbnRzLkRFU0M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29sdW1uLnNvcnQgPSBjb25zdGFudHMuQVNDO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gc29ydGVkQXQgdXNlZCBmb3Iga25vd2luZyBvcmRlciBvZiBjb2xzIHdoZW4gbXVsdGktY29sIHNvcnRcclxuICAgICAgICBpZiAoY29sdW1uLnNvcnQpIHtcclxuICAgICAgICAgICAgY29sdW1uLnNvcnRlZEF0ID0gbmV3IERhdGUoKS52YWx1ZU9mKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29sdW1uLnNvcnRlZEF0ID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBkb2luZ011bHRpU29ydCA9ICF0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5pc1N1cHByZXNzTXVsdGlTb3J0KCkgJiYgZS5zaGlmdEtleTtcclxuXHJcbiAgICAgICAgLy8gY2xlYXIgc29ydCBvbiBhbGwgY29sdW1ucyBleGNlcHQgdGhpcyBvbmUsIGFuZCB1cGRhdGUgdGhlIGljb25zXHJcbiAgICAgICAgdGhhdC5jb2x1bW5Nb2RlbC5nZXRBbGxDb2x1bW5zKCkuZm9yRWFjaChmdW5jdGlvbihjb2x1bW5Ub0NsZWFyKSB7XHJcbiAgICAgICAgICAgIC8vIERvIG5vdCBjbGVhciBpZiBlaXRoZXIgaG9sZGluZyBzaGlmdCwgb3IgaWYgY29sdW1uIGluIHF1ZXN0aW9uIHdhcyBjbGlja2VkXHJcbiAgICAgICAgICAgIGlmICghKGRvaW5nTXVsdGlTb3J0IHx8IGNvbHVtblRvQ2xlYXIgPT09IGNvbHVtbikpIHtcclxuICAgICAgICAgICAgICAgIGNvbHVtblRvQ2xlYXIuc29ydCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhhdC5hbmd1bGFyR3JpZC5vblNvcnRpbmdDaGFuZ2VkKCk7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS51cGRhdGVTb3J0SWNvbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY29sdW1uTW9kZWwuZ2V0QWxsQ29sdW1ucygpLmZvckVhY2goZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICAgICAgLy8gdXBkYXRlIHZpc2liaWxpdHkgb2YgaWNvbnNcclxuICAgICAgICB2YXIgc29ydEFzY2VuZGluZyA9IGNvbHVtbi5zb3J0ID09PSBjb25zdGFudHMuQVNDO1xyXG4gICAgICAgIHZhciBzb3J0RGVzY2VuZGluZyA9IGNvbHVtbi5zb3J0ID09PSBjb25zdGFudHMuREVTQztcclxuXHJcbiAgICAgICAgaWYgKGNvbHVtbi5lU29ydEFzYykge1xyXG4gICAgICAgICAgICB1dGlscy5zZXRWaXNpYmxlKGNvbHVtbi5lU29ydEFzYywgc29ydEFzY2VuZGluZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb2x1bW4uZVNvcnREZXNjKSB7XHJcbiAgICAgICAgICAgIHV0aWxzLnNldFZpc2libGUoY29sdW1uLmVTb3J0RGVzYywgc29ydERlc2NlbmRpbmcpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmdyb3VwRHJhZ0NhbGxiYWNrRmFjdG9yeSA9IGZ1bmN0aW9uKGN1cnJlbnRHcm91cCkge1xyXG4gICAgdmFyIHBhcmVudCA9IHRoaXM7XHJcbiAgICB2YXIgZGlzcGxheWVkQ29sdW1ucyA9IGN1cnJlbnRHcm91cC5kaXNwbGF5ZWRDb2x1bW5zO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBvbkRyYWdTdGFydDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBXaWR0aFN0YXJ0ID0gY3VycmVudEdyb3VwLmFjdHVhbFdpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuV2lkdGhTdGFydHMgPSBbXTtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICBkaXNwbGF5ZWRDb2x1bW5zLmZvckVhY2goZnVuY3Rpb24oY29sRGVmV3JhcHBlcikge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5jaGlsZHJlbldpZHRoU3RhcnRzLnB1c2goY29sRGVmV3JhcHBlci5hY3R1YWxXaWR0aCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLm1pbldpZHRoID0gZGlzcGxheWVkQ29sdW1ucy5sZW5ndGggKiBjb25zdGFudHMuTUlOX0NPTF9XSURUSDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRHJhZ2dpbmc6IGZ1bmN0aW9uKGRyYWdDaGFuZ2UpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBuZXdXaWR0aCA9IHRoaXMuZ3JvdXBXaWR0aFN0YXJ0ICsgZHJhZ0NoYW5nZTtcclxuICAgICAgICAgICAgaWYgKG5ld1dpZHRoIDwgdGhpcy5taW5XaWR0aCkge1xyXG4gICAgICAgICAgICAgICAgbmV3V2lkdGggPSB0aGlzLm1pbldpZHRoO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBzZXQgdGhlIG5ldyB3aWR0aCB0byB0aGUgZ3JvdXAgaGVhZGVyXHJcbiAgICAgICAgICAgIHZhciBuZXdXaWR0aFB4ID0gbmV3V2lkdGggKyBcInB4XCI7XHJcbiAgICAgICAgICAgIGN1cnJlbnRHcm91cC5lSGVhZGVyR3JvdXBDZWxsLnN0eWxlLndpZHRoID0gbmV3V2lkdGhQeDtcclxuICAgICAgICAgICAgY3VycmVudEdyb3VwLmFjdHVhbFdpZHRoID0gbmV3V2lkdGg7XHJcblxyXG4gICAgICAgICAgICAvLyBkaXN0cmlidXRlIHRoZSBuZXcgd2lkdGggdG8gdGhlIGNoaWxkIGhlYWRlcnNcclxuICAgICAgICAgICAgdmFyIGNoYW5nZVJhdGlvID0gbmV3V2lkdGggLyB0aGlzLmdyb3VwV2lkdGhTdGFydDtcclxuICAgICAgICAgICAgLy8ga2VlcCB0cmFjayBvZiBwaXhlbHMgdXNlZCwgYW5kIGxhc3QgY29sdW1uIGdldHMgdGhlIHJlbWFpbmluZyxcclxuICAgICAgICAgICAgLy8gdG8gY2F0ZXIgZm9yIHJvdW5kaW5nIGVycm9ycywgYW5kIG1pbiB3aWR0aCBhZGp1c3RtZW50c1xyXG4gICAgICAgICAgICB2YXIgcGl4ZWxzVG9EaXN0cmlidXRlID0gbmV3V2lkdGg7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgY3VycmVudEdyb3VwLmRpc3BsYXllZENvbHVtbnMuZm9yRWFjaChmdW5jdGlvbihjb2xEZWZXcmFwcGVyLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5vdExhc3RDb2wgPSBpbmRleCAhPT0gKGRpc3BsYXllZENvbHVtbnMubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3Q2hpbGRTaXplO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vdExhc3RDb2wpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBub3QgdGhlIGxhc3QgY29sLCBjYWxjdWxhdGUgdGhlIGNvbHVtbiB3aWR0aCBhcyBub3JtYWxcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhcnRDaGlsZFNpemUgPSB0aGF0LmNoaWxkcmVuV2lkdGhTdGFydHNbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkU2l6ZSA9IHN0YXJ0Q2hpbGRTaXplICogY2hhbmdlUmF0aW87XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkU2l6ZSA8IGNvbnN0YW50cy5NSU5fQ09MX1dJRFRIKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkU2l6ZSA9IGNvbnN0YW50cy5NSU5fQ09MX1dJRFRIO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBwaXhlbHNUb0Rpc3RyaWJ1dGUgLT0gbmV3Q2hpbGRTaXplO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBsYXN0IGNvbCwgZ2l2ZSBpdCB0aGUgcmVtYWluaW5nIHBpeGVsc1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkU2l6ZSA9IHBpeGVsc1RvRGlzdHJpYnV0ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBlSGVhZGVyQ2VsbCA9IGRpc3BsYXllZENvbHVtbnNbaW5kZXhdLmVIZWFkZXJDZWxsO1xyXG4gICAgICAgICAgICAgICAgcGFyZW50LmFkanVzdENvbHVtbldpZHRoKG5ld0NoaWxkU2l6ZSwgY29sRGVmV3JhcHBlciwgZUhlYWRlckNlbGwpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIHNob3VsZCBub3QgYmUgY2FsbGluZyB0aGVzZSBoZXJlLCBzaG91bGQgZG8gc29tZXRoaW5nIGVsc2VcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRHcm91cC5waW5uZWQpIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5hbmd1bGFyR3JpZC51cGRhdGVQaW5uZWRDb2xDb250YWluZXJXaWR0aEFmdGVyQ29sUmVzaXplKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuYW5ndWxhckdyaWQudXBkYXRlQm9keUNvbnRhaW5lcldpZHRoQWZ0ZXJDb2xSZXNpemUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuYWRqdXN0Q29sdW1uV2lkdGggPSBmdW5jdGlvbihuZXdXaWR0aCwgY29sdW1uLCBlSGVhZGVyQ2VsbCkge1xyXG4gICAgdmFyIG5ld1dpZHRoUHggPSBuZXdXaWR0aCArIFwicHhcIjtcclxuICAgIHZhciBzZWxlY3RvckZvckFsbENvbHNJbkNlbGwgPSBcIi5jZWxsLWNvbC1cIiArIGNvbHVtbi5pbmRleDtcclxuICAgIHZhciBjZWxsc0ZvclRoaXNDb2wgPSB0aGlzLmVSb290LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JGb3JBbGxDb2xzSW5DZWxsKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2VsbHNGb3JUaGlzQ29sLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY2VsbHNGb3JUaGlzQ29sW2ldLnN0eWxlLndpZHRoID0gbmV3V2lkdGhQeDtcclxuICAgIH1cclxuXHJcbiAgICBlSGVhZGVyQ2VsbC5zdHlsZS53aWR0aCA9IG5ld1dpZHRoUHg7XHJcbiAgICBjb2x1bW4uYWN0dWFsV2lkdGggPSBuZXdXaWR0aDtcclxufTtcclxuXHJcbi8vIGdldHMgY2FsbGVkIHdoZW4gYSBoZWFkZXIgKG5vdCBhIGhlYWRlciBncm91cCkgZ2V0cyByZXNpemVkXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5oZWFkZXJEcmFnQ2FsbGJhY2tGYWN0b3J5ID0gZnVuY3Rpb24oaGVhZGVyQ2VsbCwgY29sdW1uLCBoZWFkZXJHcm91cCkge1xyXG4gICAgdmFyIHBhcmVudCA9IHRoaXM7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGFydFdpZHRoID0gY29sdW1uLmFjdHVhbFdpZHRoO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25EcmFnZ2luZzogZnVuY3Rpb24oZHJhZ0NoYW5nZSkge1xyXG4gICAgICAgICAgICB2YXIgbmV3V2lkdGggPSB0aGlzLnN0YXJ0V2lkdGggKyBkcmFnQ2hhbmdlO1xyXG4gICAgICAgICAgICBpZiAobmV3V2lkdGggPCBjb25zdGFudHMuTUlOX0NPTF9XSURUSCkge1xyXG4gICAgICAgICAgICAgICAgbmV3V2lkdGggPSBjb25zdGFudHMuTUlOX0NPTF9XSURUSDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcGFyZW50LmFkanVzdENvbHVtbldpZHRoKG5ld1dpZHRoLCBjb2x1bW4sIGhlYWRlckNlbGwpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGhlYWRlckdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuc2V0V2lkdGhPZkdyb3VwSGVhZGVyQ2VsbChoZWFkZXJHcm91cCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHNob3VsZCBub3QgYmUgY2FsbGluZyB0aGVzZSBoZXJlLCBzaG91bGQgZG8gc29tZXRoaW5nIGVsc2VcclxuICAgICAgICAgICAgaWYgKGNvbHVtbi5waW5uZWQpIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5hbmd1bGFyR3JpZC51cGRhdGVQaW5uZWRDb2xDb250YWluZXJXaWR0aEFmdGVyQ29sUmVzaXplKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuYW5ndWxhckdyaWQudXBkYXRlQm9keUNvbnRhaW5lcldpZHRoQWZ0ZXJDb2xSZXNpemUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuc3RvcERyYWdnaW5nID0gZnVuY3Rpb24obGlzdGVuZXJzVG9SZW1vdmUpIHtcclxuICAgIHRoaXMuZVJvb3Quc3R5bGUuY3Vyc29yID0gXCJcIjtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHV0aWxzLml0ZXJhdGVPYmplY3QobGlzdGVuZXJzVG9SZW1vdmUsIGZ1bmN0aW9uKGtleSwgbGlzdGVuZXIpIHtcclxuICAgICAgICB0aGF0LmVSb290LnJlbW92ZUV2ZW50TGlzdGVuZXIoa2V5LCBsaXN0ZW5lcik7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS51cGRhdGVGaWx0ZXJJY29ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5jb2x1bW5Nb2RlbC5nZXREaXNwbGF5ZWRDb2x1bW5zKCkuZm9yRWFjaChmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgICAgICAvLyB0b2RvOiBuZWVkIHRvIGNoYW5nZSB0aGlzLCBzbyBvbmx5IHVwZGF0ZXMgaWYgY29sdW1uIGlzIHZpc2libGVcclxuICAgICAgICBpZiAoY29sdW1uLmVGaWx0ZXJJY29uKSB7XHJcbiAgICAgICAgICAgIHZhciBmaWx0ZXJQcmVzZW50ID0gdGhhdC5maWx0ZXJNYW5hZ2VyLmlzRmlsdGVyUHJlc2VudEZvckNvbChjb2x1bW4uY29sSWQpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheVN0eWxlID0gZmlsdGVyUHJlc2VudCA/ICdpbmxpbmUnIDogJ25vbmUnO1xyXG4gICAgICAgICAgICBjb2x1bW4uZUZpbHRlckljb24uc3R5bGUuZGlzcGxheSA9IGRpc3BsYXlTdHlsZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyUmVuZGVyZXI7XHJcbiIsInZhciBncm91cENyZWF0b3IgPSByZXF1aXJlKCcuLy4uL2dyb3VwQ3JlYXRvcicpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XHJcbnZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuLy4uL2NvbnN0YW50cycpO1xyXG5cclxuZnVuY3Rpb24gSW5NZW1vcnlSb3dDb250cm9sbGVyKCkge1xyXG4gICAgdGhpcy5jcmVhdGVNb2RlbCgpO1xyXG59XHJcblxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbk1vZGVsLCBhbmd1bGFyR3JpZCwgZmlsdGVyTWFuYWdlciwgJHNjb3BlLCBleHByZXNzaW9uU2VydmljZSkge1xyXG4gICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIgPSBncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsID0gY29sdW1uTW9kZWw7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkID0gYW5ndWxhckdyaWQ7XHJcbiAgICB0aGlzLmZpbHRlck1hbmFnZXIgPSBmaWx0ZXJNYW5hZ2VyO1xyXG4gICAgdGhpcy4kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLmV4cHJlc3Npb25TZXJ2aWNlID0gZXhwcmVzc2lvblNlcnZpY2U7XHJcblxyXG4gICAgdGhpcy5hbGxSb3dzID0gbnVsbDtcclxuICAgIHRoaXMucm93c0FmdGVyR3JvdXAgPSBudWxsO1xyXG4gICAgdGhpcy5yb3dzQWZ0ZXJGaWx0ZXIgPSBudWxsO1xyXG4gICAgdGhpcy5yb3dzQWZ0ZXJTb3J0ID0gbnVsbDtcclxuICAgIHRoaXMucm93c0FmdGVyTWFwID0gbnVsbDtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5jcmVhdGVNb2RlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5tb2RlbCA9IHtcclxuICAgICAgICAvLyB0aGlzIG1ldGhvZCBpcyBpbXBsZW1lbnRlZCBieSB0aGUgaW5NZW1vcnkgbW9kZWwgb25seSxcclxuICAgICAgICAvLyBpdCBnaXZlcyB0aGUgdG9wIGxldmVsIG9mIHRoZSBzZWxlY3Rpb24uIHVzZWQgYnkgdGhlIHNlbGVjdGlvblxyXG4gICAgICAgIC8vIGNvbnRyb2xsZXIsIHdoZW4gaXQgbmVlZHMgdG8gZG8gYSBmdWxsIHRyYXZlcnNhbFxyXG4gICAgICAgIGdldFRvcExldmVsTm9kZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5yb3dzQWZ0ZXJHcm91cDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFZpcnR1YWxSb3c6IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnJvd3NBZnRlck1hcFtpbmRleF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRWaXJ0dWFsUm93Q291bnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhhdC5yb3dzQWZ0ZXJNYXApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGF0LnJvd3NBZnRlck1hcC5sZW5ndGg7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9yRWFjaEluTWVtb3J5OiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICB0aGF0LmZvckVhY2hJbk1lbW9yeShjYWxsYmFjayk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuXHJcbi8vIHB1YmxpY1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmdldE1vZGVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbDtcclxufTtcclxuXHJcbi8vIHB1YmxpY1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmZvckVhY2hJbk1lbW9yeSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcblxyXG4gICAgLy8gaXRlcmF0ZXMgdGhyb3VnaCBlYWNoIGl0ZW0gaW4gbWVtb3J5LCBhbmQgY2FsbHMgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXHJcbiAgICBmdW5jdGlvbiBkb0NhbGxiYWNrKGxpc3QsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKGxpc3QpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGk8bGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soaXRlbSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5ncm91cCAmJiBncm91cC5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvQ2FsbGJhY2soZ3JvdXAuY2hpbGRyZW4pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRvQ2FsbGJhY2sodGhpcy5yb3dzQWZ0ZXJHcm91cCwgY2FsbGJhY2spO1xyXG59O1xyXG5cclxuLy8gcHVibGljXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlTW9kZWwgPSBmdW5jdGlvbihzdGVwKSB7XHJcblxyXG4gICAgLy8gZmFsbHRocm91Z2ggaW4gYmVsb3cgc3dpdGNoIGlzIG9uIHB1cnBvc2VcclxuICAgIHN3aXRjaCAoc3RlcCkge1xyXG4gICAgICAgIGNhc2UgY29uc3RhbnRzLlNURVBfRVZFUllUSElORzpcclxuICAgICAgICBjYXNlIGNvbnN0YW50cy5TVEVQX0ZJTFRFUjpcclxuICAgICAgICAgICAgdGhpcy5kb0ZpbHRlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmRvQWdncmVnYXRlKCk7XHJcbiAgICAgICAgY2FzZSBjb25zdGFudHMuU1RFUF9TT1JUOlxyXG4gICAgICAgICAgICB0aGlzLmRvU29ydCgpO1xyXG4gICAgICAgIGNhc2UgY29uc3RhbnRzLlNURVBfTUFQOlxyXG4gICAgICAgICAgICB0aGlzLmRvR3JvdXBNYXBwaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRNb2RlbFVwZGF0ZWQoKSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldE1vZGVsVXBkYXRlZCgpKCk7XHJcbiAgICAgICAgdmFyICRzY29wZSA9IHRoaXMuJHNjb3BlO1xyXG4gICAgICAgIGlmICgkc2NvcGUpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5kZWZhdWx0R3JvdXBBZ2dGdW5jdGlvbkZhY3RvcnkgPSBmdW5jdGlvbihncm91cEFnZ0ZpZWxkcykge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGdyb3VwQWdnRnVuY3Rpb24ocm93cykge1xyXG5cclxuICAgICAgICB2YXIgc3VtcyA9IHt9O1xyXG5cclxuICAgICAgICBmb3IgKHZhciBqID0gMDsgajxncm91cEFnZ0ZpZWxkcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICB2YXIgY29sS2V5ID0gZ3JvdXBBZ2dGaWVsZHNbal07XHJcbiAgICAgICAgICAgIHZhciB0b3RhbEZvckNvbHVtbiA9IG51bGw7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpPHJvd3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciByb3cgPSByb3dzW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRoaXNDb2x1bW5WYWx1ZSA9IHJvdy5kYXRhW2NvbEtleV07XHJcbiAgICAgICAgICAgICAgICAvLyBvbmx5IGluY2x1ZGUgaWYgdGhlIHZhbHVlIGlzIGEgbnVtYmVyXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRoaXNDb2x1bW5WYWx1ZSA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbEZvckNvbHVtbiArPSB0aGlzQ29sdW1uVmFsdWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gYXQgdGhpcyBwb2ludCwgaWYgbm8gdmFsdWVzIHdlcmUgbnVtYmVycywgdGhlIHJlc3VsdCBpcyBudWxsIChub3QgemVybylcclxuICAgICAgICAgICAgc3Vtc1tjb2xLZXldID0gdG90YWxGb3JDb2x1bW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc3VtcztcclxuXHJcbiAgICB9O1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24oZGF0YSwgY29sRGVmLCBub2RlLCByb3dJbmRleCkge1xyXG4gICAgdmFyIGFwaSA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpO1xyXG4gICAgdmFyIGNvbnRleHQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCk7XHJcbiAgICByZXR1cm4gdXRpbHMuZ2V0VmFsdWUodGhpcy5leHByZXNzaW9uU2VydmljZSwgZGF0YSwgY29sRGVmLCBub2RlLCByb3dJbmRleCwgYXBpLCBjb250ZXh0KTtcclxufTtcclxuXHJcbi8vIHB1YmxpYyAtIGl0J3MgcG9zc2libGUgdG8gcmVjb21wdXRlIHRoZSBhZ2dyZWdhdGUgd2l0aG91dCBkb2luZyB0aGUgb3RoZXIgcGFydHNcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5kb0FnZ3JlZ2F0ZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBncm91cEFnZ0Z1bmN0aW9uID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0R3JvdXBBZ2dGdW5jdGlvbigpO1xyXG4gICAgaWYgKHR5cGVvZiBncm91cEFnZ0Z1bmN0aW9uID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5yZWN1cnNpdmVseUNyZWF0ZUFnZ0RhdGEodGhpcy5yb3dzQWZ0ZXJGaWx0ZXIsIGdyb3VwQWdnRnVuY3Rpb24pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZ3JvdXBBZ2dGaWVsZHMgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcm91cEFnZ0ZpZWxkcygpO1xyXG4gICAgaWYgKGdyb3VwQWdnRmllbGRzKSB7XHJcbiAgICAgICAgdmFyIGRlZmF1bHRBZ2dGdW5jdGlvbiA9IHRoaXMuZGVmYXVsdEdyb3VwQWdnRnVuY3Rpb25GYWN0b3J5KGdyb3VwQWdnRmllbGRzKTtcclxuICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5Q3JlYXRlQWdnRGF0YSh0aGlzLnJvd3NBZnRlckZpbHRlciwgZGVmYXVsdEFnZ0Z1bmN0aW9uKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuLy8gcHVibGljXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZXhwYW5kT3JDb2xsYXBzZUFsbCA9IGZ1bmN0aW9uKGV4cGFuZCwgcm93Tm9kZXMpIHtcclxuICAgIC8vIGlmIGZpcnN0IGNhbGwgaW4gcmVjdXJzaW9uLCB3ZSBzZXQgbGlzdCB0byBwYXJlbnQgbGlzdFxyXG4gICAgaWYgKHJvd05vZGVzID09PSBudWxsKSB7XHJcbiAgICAgICAgcm93Tm9kZXMgPSB0aGlzLnJvd3NBZnRlckdyb3VwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghcm93Tm9kZXMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgIHJvd05vZGVzLmZvckVhY2goZnVuY3Rpb24obm9kZSkge1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIG5vZGUuZXhwYW5kZWQgPSBleHBhbmQ7XHJcbiAgICAgICAgICAgIF90aGlzLmV4cGFuZE9yQ29sbGFwc2VBbGwoZXhwYW5kLCBub2RlLmNoaWxkcmVuKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5yZWN1cnNpdmVseUNyZWF0ZUFnZ0RhdGEgPSBmdW5jdGlvbihub2RlcywgZ3JvdXBBZ2dGdW5jdGlvbikge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBub2Rlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldO1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIC8vIGFnZyBmdW5jdGlvbiBuZWVkcyB0byBzdGFydCBhdCB0aGUgYm90dG9tLCBzbyB0cmF2ZXJzZSBmaXJzdFxyXG4gICAgICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5Q3JlYXRlQWdnRGF0YShub2RlLmNoaWxkcmVuQWZ0ZXJGaWx0ZXIsIGdyb3VwQWdnRnVuY3Rpb24pO1xyXG4gICAgICAgICAgICAvLyBhZnRlciB0cmF2ZXJzYWwsIHdlIGNhbiBub3cgZG8gdGhlIGFnZyBhdCB0aGlzIGxldmVsXHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gZ3JvdXBBZ2dGdW5jdGlvbihub2RlLmNoaWxkcmVuQWZ0ZXJGaWx0ZXIpO1xyXG4gICAgICAgICAgICBub2RlLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgICAgICAvLyBpZiB3ZSBhcmUgZ3JvdXBpbmcsIHRoZW4gaXQncyBwb3NzaWJsZSB0aGVyZSBpcyBhIHNpYmxpbmcgZm9vdGVyXHJcbiAgICAgICAgICAgIC8vIHRvIHRoZSBncm91cCwgc28gdXBkYXRlIHRoZSBkYXRhIGhlcmUgYWxzbyBpZiB0aGVyZSBpcyBvbmVcclxuICAgICAgICAgICAgaWYgKG5vZGUuc2libGluZykge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5zaWJsaW5nLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmRvU29ydCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHNvcnRpbmc7XHJcblxyXG4gICAgLy8gaWYgdGhlIHNvcnRpbmcgaXMgYWxyZWFkeSBkb25lIGJ5IHRoZSBzZXJ2ZXIsIHRoZW4gd2Ugc2hvdWxkIG5vdCBkbyBpdCBoZXJlXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNFbmFibGVTZXJ2ZXJTaWRlU29ydGluZygpKSB7XHJcbiAgICAgICAgc29ydGluZyA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvL3NlZSBpZiB0aGVyZSBpcyBhIGNvbCB3ZSBhcmUgc29ydGluZyBieVxyXG4gICAgICAgIHZhciBzb3J0aW5nT3B0aW9ucyA9IFtdO1xyXG4gICAgICAgIHRoaXMuY29sdW1uTW9kZWwuZ2V0QWxsQ29sdW1ucygpLmZvckVhY2goZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICAgICAgICAgIGlmIChjb2x1bW4uc29ydCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGFzY2VuZGluZyA9IGNvbHVtbi5zb3J0ID09PSBjb25zdGFudHMuQVNDO1xyXG4gICAgICAgICAgICAgICAgc29ydGluZ09wdGlvbnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgaW52ZXJ0ZXI6IGFzY2VuZGluZyA/IDEgOiAtMSxcclxuICAgICAgICAgICAgICAgICAgICBzb3J0ZWRBdDogY29sdW1uLnNvcnRlZEF0LFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbERlZjogY29sdW1uLmNvbERlZlxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoc29ydGluZ09wdGlvbnMubGVuZ3RoID49IDApIHtcclxuICAgICAgICAgICAgc29ydGluZyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciByb3dOb2Rlc1JlYWR5Rm9yU29ydGluZyA9IHRoaXMucm93c0FmdGVyRmlsdGVyID8gdGhpcy5yb3dzQWZ0ZXJGaWx0ZXIuc2xpY2UoMCkgOiBudWxsO1xyXG5cclxuICAgIGlmIChzb3J0aW5nKSB7XHJcbiAgICAgICAgLy8gVGhlIGNvbHVtbnMgYXJlIHRvIGJlIHNvcnRlZCBpbiB0aGUgb3JkZXIgdGhhdCB0aGUgdXNlciBzZWxlY3RlZCB0aGVtOlxyXG4gICAgICAgIHNvcnRpbmdPcHRpb25zLnNvcnQoZnVuY3Rpb24ob3B0aW9uQSwgb3B0aW9uQil7XHJcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25BLnNvcnRlZEF0IC0gb3B0aW9uQi5zb3J0ZWRBdDtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNvcnRMaXN0KHJvd05vZGVzUmVhZHlGb3JTb3J0aW5nLCBzb3J0aW5nT3B0aW9ucyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGlmIG5vIHNvcnRpbmcsIHNldCBhbGwgZ3JvdXAgY2hpbGRyZW4gYWZ0ZXIgc29ydCB0byB0aGUgb3JpZ2luYWwgbGlzdC5cclxuICAgICAgICAvLyBub3RlOiBpdCBpcyBpbXBvcnRhbnQgdG8gZG8gdGhpcywgZXZlbiBpZiBkb2luZyBzZXJ2ZXIgc2lkZSBzb3J0aW5nLFxyXG4gICAgICAgIC8vIHRvIGFsbG93IHRoZSByb3dzIHRvIHBhc3MgdG8gdGhlIG5leHQgc3RhZ2UgKGllIHNldCB0aGUgbm9kZSB2YWx1ZVxyXG4gICAgICAgIC8vIGNoaWxkcmVuQWZ0ZXJTb3J0KVxyXG4gICAgICAgIHRoaXMucmVjdXJzaXZlbHlSZXNldFNvcnQocm93Tm9kZXNSZWFkeUZvclNvcnRpbmcpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucm93c0FmdGVyU29ydCA9IHJvd05vZGVzUmVhZHlGb3JTb3J0aW5nO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnJlY3Vyc2l2ZWx5UmVzZXRTb3J0ID0gZnVuY3Rpb24ocm93Tm9kZXMpIHtcclxuICAgIGlmICghcm93Tm9kZXMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHJvd05vZGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHZhciBpdGVtID0gcm93Tm9kZXNbaV07XHJcbiAgICAgICAgaWYgKGl0ZW0uZ3JvdXAgJiYgaXRlbS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICBpdGVtLmNoaWxkcmVuQWZ0ZXJTb3J0ID0gaXRlbS5jaGlsZHJlbkFmdGVyRmlsdGVyO1xyXG4gICAgICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5UmVzZXRTb3J0KGl0ZW0uY2hpbGRyZW4pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5zb3J0TGlzdCA9IGZ1bmN0aW9uKG5vZGVzLCBzb3J0T3B0aW9ucykge1xyXG5cclxuICAgIC8vIHNvcnQgYW55IGdyb3VwcyByZWN1cnNpdmVseVxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBub2Rlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgLy8gY3JpdGljYWwgc2VjdGlvbiwgbm8gZnVuY3Rpb25hbCBwcm9ncmFtbWluZ1xyXG4gICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXAgJiYgbm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuQWZ0ZXJTb3J0ID0gbm9kZS5jaGlsZHJlbkFmdGVyRmlsdGVyLnNsaWNlKDApO1xyXG4gICAgICAgICAgICB0aGlzLnNvcnRMaXN0KG5vZGUuY2hpbGRyZW5BZnRlclNvcnQsIHNvcnRPcHRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgZnVuY3Rpb24gY29tcGFyZShvYmpBLCBvYmpCLCBjb2xEZWYpe1xyXG4gICAgICAgIHZhciB2YWx1ZUEgPSB0aGF0LmdldFZhbHVlKG9iakEuZGF0YSwgY29sRGVmLCBvYmpBKTtcclxuICAgICAgICB2YXIgdmFsdWVCID0gdGhhdC5nZXRWYWx1ZShvYmpCLmRhdGEsIGNvbERlZiwgb2JqQik7XHJcbiAgICAgICAgaWYgKGNvbERlZi5jb21wYXJhdG9yKSB7XHJcbiAgICAgICAgICAgIC8vaWYgY29tcGFyYXRvciBwcm92aWRlZCwgdXNlIGl0XHJcbiAgICAgICAgICAgIHJldHVybiBjb2xEZWYuY29tcGFyYXRvcih2YWx1ZUEsIHZhbHVlQiwgb2JqQSwgb2JqQik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy9vdGhlcndpc2UgZG8gb3VyIG93biBjb21wYXJpc29uXHJcbiAgICAgICAgICAgIHJldHVybiB1dGlscy5kZWZhdWx0Q29tcGFyYXRvcih2YWx1ZUEsIHZhbHVlQiwgb2JqQSwgb2JqQik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5vZGVzLnNvcnQoZnVuY3Rpb24ob2JqQSwgb2JqQikge1xyXG4gICAgICAgIC8vIEl0ZXJhdGUgY29sdW1ucywgcmV0dXJuIHRoZSBmaXJzdCB0aGF0IGRvZXNuJ3QgbWF0Y2hcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gc29ydE9wdGlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHNvcnRPcHRpb24gPSBzb3J0T3B0aW9uc1tpXTtcclxuICAgICAgICAgICAgdmFyIGNvbXBhcmVkID0gY29tcGFyZShvYmpBLCBvYmpCLCBzb3J0T3B0aW9uLmNvbERlZik7XHJcbiAgICAgICAgICAgIGlmIChjb21wYXJlZCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBhcmVkICogc29ydE9wdGlvbi5pbnZlcnRlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBBbGwgbWF0Y2hlZCwgdGhlc2UgYXJlIGlkZW50aWNhbCBhcyBmYXIgYXMgdGhlIHNvcnQgaXMgY29uY2VybmVkOlxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZG9Hcm91cGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHJvd3NBZnRlckdyb3VwO1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9JbnRlcm5hbEdyb3VwaW5nKCkpIHtcclxuICAgICAgICB2YXIgZXhwYW5kQnlEZWZhdWx0ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0R3JvdXBEZWZhdWx0RXhwYW5kZWQoKTtcclxuICAgICAgICByb3dzQWZ0ZXJHcm91cCA9IGdyb3VwQ3JlYXRvci5ncm91cCh0aGlzLmFsbFJvd3MsIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEdyb3VwS2V5cygpLFxyXG4gICAgICAgICAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcm91cEFnZ0Z1bmN0aW9uKCksIGV4cGFuZEJ5RGVmYXVsdCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJvd3NBZnRlckdyb3VwID0gdGhpcy5hbGxSb3dzO1xyXG4gICAgfVxyXG4gICAgdGhpcy5yb3dzQWZ0ZXJHcm91cCA9IHJvd3NBZnRlckdyb3VwO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZG9pbmdGaWx0ZXI7XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRW5hYmxlU2VydmVyU2lkZUZpbHRlcigpKSB7XHJcbiAgICAgICAgZG9pbmdGaWx0ZXIgPSBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIHF1aWNrRmlsdGVyUHJlc2VudCA9IHRoaXMuYW5ndWxhckdyaWQuZ2V0UXVpY2tGaWx0ZXIoKSAhPT0gbnVsbDtcclxuICAgICAgICB2YXIgYWR2YW5jZWRGaWx0ZXJQcmVzZW50ID0gdGhpcy5maWx0ZXJNYW5hZ2VyLmlzRmlsdGVyUHJlc2VudCgpO1xyXG4gICAgICAgIGRvaW5nRmlsdGVyID0gcXVpY2tGaWx0ZXJQcmVzZW50IHx8IGFkdmFuY2VkRmlsdGVyUHJlc2VudDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcm93c0FmdGVyRmlsdGVyO1xyXG4gICAgaWYgKGRvaW5nRmlsdGVyKSB7XHJcbiAgICAgICAgcm93c0FmdGVyRmlsdGVyID0gdGhpcy5maWx0ZXJJdGVtcyh0aGlzLnJvd3NBZnRlckdyb3VwLCBxdWlja0ZpbHRlclByZXNlbnQsIGFkdmFuY2VkRmlsdGVyUHJlc2VudCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGRvIGl0IGhlcmVcclxuICAgICAgICByb3dzQWZ0ZXJGaWx0ZXIgPSB0aGlzLnJvd3NBZnRlckdyb3VwO1xyXG4gICAgICAgIHRoaXMucmVjdXJzaXZlbHlSZXNldEZpbHRlcih0aGlzLnJvd3NBZnRlckdyb3VwKTtcclxuICAgIH1cclxuICAgIHRoaXMucm93c0FmdGVyRmlsdGVyID0gcm93c0FmdGVyRmlsdGVyO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmZpbHRlckl0ZW1zID0gZnVuY3Rpb24ocm93Tm9kZXMsIHF1aWNrRmlsdGVyUHJlc2VudCwgYWR2YW5jZWRGaWx0ZXJQcmVzZW50KSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gW107XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSByb3dOb2Rlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IHJvd05vZGVzW2ldO1xyXG5cclxuICAgICAgICBpZiAobm9kZS5ncm91cCkge1xyXG4gICAgICAgICAgICAvLyBkZWFsIHdpdGggZ3JvdXBcclxuICAgICAgICAgICAgbm9kZS5jaGlsZHJlbkFmdGVyRmlsdGVyID0gdGhpcy5maWx0ZXJJdGVtcyhub2RlLmNoaWxkcmVuLCBxdWlja0ZpbHRlclByZXNlbnQsIGFkdmFuY2VkRmlsdGVyUHJlc2VudCk7XHJcbiAgICAgICAgICAgIGlmIChub2RlLmNoaWxkcmVuQWZ0ZXJGaWx0ZXIubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5hbGxDaGlsZHJlbkNvdW50ID0gdGhpcy5nZXRUb3RhbENoaWxkQ291bnQobm9kZS5jaGlsZHJlbkFmdGVyRmlsdGVyKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZG9lc1Jvd1Bhc3NGaWx0ZXIobm9kZSwgcXVpY2tGaWx0ZXJQcmVzZW50LCBhZHZhbmNlZEZpbHRlclByZXNlbnQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChub2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnJlY3Vyc2l2ZWx5UmVzZXRGaWx0ZXIgPSBmdW5jdGlvbihub2Rlcykge1xyXG4gICAgaWYgKCFub2Rlcykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbm9kZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgIG5vZGUuY2hpbGRyZW5BZnRlckZpbHRlciA9IG5vZGUuY2hpbGRyZW47XHJcbiAgICAgICAgICAgIG5vZGUuYWxsQ2hpbGRyZW5Db3VudCA9IHRoaXMuZ2V0VG90YWxDaGlsZENvdW50KG5vZGUuY2hpbGRyZW5BZnRlckZpbHRlcik7XHJcbiAgICAgICAgICAgIHRoaXMucmVjdXJzaXZlbHlSZXNldEZpbHRlcihub2RlLmNoaWxkcmVuKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbi8vIHJvd3M6IHRoZSByb3dzIHRvIHB1dCBpbnRvIHRoZSBtb2RlbFxyXG4vLyBmaXJzdElkOiB0aGUgZmlyc3QgaWQgdG8gdXNlLCB1c2VkIGZvciBwYWdpbmcsIHdoZXJlIHdlIGFyZSBub3Qgb24gdGhlIGZpcnN0IHBhZ2VcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5zZXRBbGxSb3dzID0gZnVuY3Rpb24ocm93cywgZmlyc3RJZCkge1xyXG4gICAgdmFyIG5vZGVzO1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzUm93c0FscmVhZHlHcm91cGVkKCkpIHtcclxuICAgICAgICBub2RlcyA9IHJvd3M7XHJcbiAgICAgICAgdGhpcy5yZWN1cnNpdmVseUNoZWNrVXNlclByb3ZpZGVkTm9kZXMobm9kZXMsIG51bGwsIDApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBwbGFjZSBlYWNoIHJvdyBpbnRvIGEgd3JhcHBlclxyXG4gICAgICAgIHZhciBub2RlcyA9IFtdO1xyXG4gICAgICAgIGlmIChyb3dzKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm93cy5sZW5ndGg7IGkrKykgeyAvLyBjb3VsZCBiZSBsb3RzIG9mIHJvd3MsIGRvbid0IHVzZSBmdW5jdGlvbmFsIHByb2dyYW1taW5nXHJcbiAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiByb3dzW2ldXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBmaXJzdElkIHByb3ZpZGVkLCB1c2UgaXQsIG90aGVyd2lzZSBzdGFydCBhdCAwXHJcbiAgICB2YXIgZmlyc3RJZFRvVXNlID0gZmlyc3RJZCA/IGZpcnN0SWQgOiAwO1xyXG4gICAgdGhpcy5yZWN1cnNpdmVseUFkZElkVG9Ob2Rlcyhub2RlcywgZmlyc3RJZFRvVXNlKTtcclxuICAgIHRoaXMuYWxsUm93cyA9IG5vZGVzO1xyXG5cclxuICAgIC8vIGFnZ3JlZ2F0ZSBoZXJlLCBzbyBmaWx0ZXJzIGhhdmUgdGhlIGFnZyBkYXRhIHJlYWR5XHJcbiAgICB0aGlzLmRvR3JvdXBpbmcoKTtcclxufTtcclxuXHJcbi8vIGFkZCBpbiBpbmRleCAtIHRoaXMgaXMgdXNlZCBieSB0aGUgc2VsZWN0aW9uQ29udHJvbGxlciAtIHNvIHF1aWNrXHJcbi8vIHRvIGxvb2sgdXAgc2VsZWN0ZWQgcm93c1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnJlY3Vyc2l2ZWx5QWRkSWRUb05vZGVzID0gZnVuY3Rpb24obm9kZXMsIGluZGV4KSB7XHJcbiAgICBpZiAoIW5vZGVzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgbm9kZS5pZCA9IGluZGV4Kys7XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXAgJiYgbm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICBpbmRleCA9IHRoaXMucmVjdXJzaXZlbHlBZGRJZFRvTm9kZXMobm9kZS5jaGlsZHJlbiwgaW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBpbmRleDtcclxufTtcclxuXHJcbi8vIGFkZCBpbiBpbmRleCAtIHRoaXMgaXMgdXNlZCBieSB0aGUgc2VsZWN0aW9uQ29udHJvbGxlciAtIHNvIHF1aWNrXHJcbi8vIHRvIGxvb2sgdXAgc2VsZWN0ZWQgcm93c1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnJlY3Vyc2l2ZWx5Q2hlY2tVc2VyUHJvdmlkZWROb2RlcyA9IGZ1bmN0aW9uKG5vZGVzLCBwYXJlbnQsIGxldmVsKSB7XHJcbiAgICBpZiAoIW5vZGVzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgaWYgKHBhcmVudCkge1xyXG4gICAgICAgICAgICBub2RlLnBhcmVudCA9IHBhcmVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbm9kZS5sZXZlbCA9IGxldmVsO1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgdGhpcy5yZWN1cnNpdmVseUNoZWNrVXNlclByb3ZpZGVkTm9kZXMobm9kZS5jaGlsZHJlbiwgbm9kZSwgbGV2ZWwgKyAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZ2V0VG90YWxDaGlsZENvdW50ID0gZnVuY3Rpb24ocm93Tm9kZXMpIHtcclxuICAgIHZhciBjb3VudCA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHJvd05vZGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHZhciBpdGVtID0gcm93Tm9kZXNbaV07XHJcbiAgICAgICAgaWYgKGl0ZW0uZ3JvdXApIHtcclxuICAgICAgICAgICAgY291bnQgKz0gaXRlbS5hbGxDaGlsZHJlbkNvdW50O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNvdW50O1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmNvcHlHcm91cE5vZGUgPSBmdW5jdGlvbihncm91cE5vZGUsIGNoaWxkcmVuLCBhbGxDaGlsZHJlbkNvdW50KSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdyb3VwOiB0cnVlLFxyXG4gICAgICAgIGRhdGE6IGdyb3VwTm9kZS5kYXRhLFxyXG4gICAgICAgIGZpZWxkOiBncm91cE5vZGUuZmllbGQsXHJcbiAgICAgICAga2V5OiBncm91cE5vZGUua2V5LFxyXG4gICAgICAgIGV4cGFuZGVkOiBncm91cE5vZGUuZXhwYW5kZWQsXHJcbiAgICAgICAgY2hpbGRyZW46IGNoaWxkcmVuLFxyXG4gICAgICAgIGFsbENoaWxkcmVuQ291bnQ6IGFsbENoaWxkcmVuQ291bnQsXHJcbiAgICAgICAgbGV2ZWw6IGdyb3VwTm9kZS5sZXZlbFxyXG4gICAgfTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5kb0dyb3VwTWFwcGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gZXZlbiBpZiBub3QgZ29pbmcgZ3JvdXBpbmcsIHdlIGRvIHRoZSBtYXBwaW5nLCBhcyB0aGUgY2xpZW50IG1pZ2h0XHJcbiAgICAvLyBvZiBwYXNzZWQgaW4gZGF0YSB0aGF0IGFscmVhZHkgaGFzIGEgZ3JvdXBpbmcgaW4gaXQgc29tZXdoZXJlXHJcbiAgICB2YXIgcm93c0FmdGVyTWFwID0gW107XHJcbiAgICB0aGlzLmFkZFRvTWFwKHJvd3NBZnRlck1hcCwgdGhpcy5yb3dzQWZ0ZXJTb3J0KTtcclxuICAgIHRoaXMucm93c0FmdGVyTWFwID0gcm93c0FmdGVyTWFwO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmFkZFRvTWFwID0gZnVuY3Rpb24obWFwcGVkRGF0YSwgb3JpZ2luYWxOb2Rlcykge1xyXG4gICAgaWYgKCFvcmlnaW5hbE5vZGVzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcmlnaW5hbE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBvcmlnaW5hbE5vZGVzW2ldO1xyXG4gICAgICAgIG1hcHBlZERhdGEucHVzaChub2RlKTtcclxuICAgICAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmV4cGFuZGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkVG9NYXAobWFwcGVkRGF0YSwgbm9kZS5jaGlsZHJlbkFmdGVyU29ydCk7XHJcblxyXG4gICAgICAgICAgICAvLyBwdXQgYSBmb290ZXIgaW4gaWYgdXNlciBpcyBsb29raW5nIGZvciBpdFxyXG4gICAgICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEluY2x1ZGVGb290ZXIoKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZvb3Rlck5vZGUgPSB0aGlzLmNyZWF0ZUZvb3Rlck5vZGUobm9kZSk7XHJcbiAgICAgICAgICAgICAgICBtYXBwZWREYXRhLnB1c2goZm9vdGVyTm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuY3JlYXRlRm9vdGVyTm9kZSA9IGZ1bmN0aW9uKGdyb3VwTm9kZSkge1xyXG4gICAgdmFyIGZvb3Rlck5vZGUgPSB7fTtcclxuICAgIE9iamVjdC5rZXlzKGdyb3VwTm9kZSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICBmb290ZXJOb2RlW2tleV0gPSBncm91cE5vZGVba2V5XTtcclxuICAgIH0pO1xyXG4gICAgZm9vdGVyTm9kZS5mb290ZXIgPSB0cnVlO1xyXG4gICAgLy8gZ2V0IGJvdGggaGVhZGVyIGFuZCBmb290ZXIgdG8gcmVmZXJlbmNlIGVhY2ggb3RoZXIgYXMgc2libGluZ3MuIHRoaXMgaXMgbmV2ZXIgdW5kb25lLFxyXG4gICAgLy8gb25seSBvdmVyd3JpdHRlbi4gc28gaWYgYSBncm91cCBpcyBleHBhbmRlZCwgdGhlbiBjb250cmFjdGVkLCBpdCB3aWxsIGhhdmUgYSBnaG9zdFxyXG4gICAgLy8gc2libGluZyAtIGJ1dCB0aGF0J3MgZmluZSwgYXMgd2UgY2FuIGlnbm9yZSB0aGlzIGlmIHRoZSBoZWFkZXIgaXMgY29udHJhY3RlZC5cclxuICAgIGZvb3Rlck5vZGUuc2libGluZyA9IGdyb3VwTm9kZTtcclxuICAgIGdyb3VwTm9kZS5zaWJsaW5nID0gZm9vdGVyTm9kZTtcclxuICAgIHJldHVybiBmb290ZXJOb2RlO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmRvZXNSb3dQYXNzRmlsdGVyID0gZnVuY3Rpb24obm9kZSwgcXVpY2tGaWx0ZXJQcmVzZW50LCBhZHZhbmNlZEZpbHRlclByZXNlbnQpIHtcclxuICAgIC8vZmlyc3QgdXAsIGNoZWNrIHF1aWNrIGZpbHRlclxyXG4gICAgaWYgKHF1aWNrRmlsdGVyUHJlc2VudCkge1xyXG4gICAgICAgIGlmICghbm9kZS5xdWlja0ZpbHRlckFnZ3JlZ2F0ZVRleHQpIHtcclxuICAgICAgICAgICAgdGhpcy5hZ2dyZWdhdGVSb3dGb3JRdWlja0ZpbHRlcihub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5vZGUucXVpY2tGaWx0ZXJBZ2dyZWdhdGVUZXh0LmluZGV4T2YodGhpcy5hbmd1bGFyR3JpZC5nZXRRdWlja0ZpbHRlcigpKSA8IDApIHtcclxuICAgICAgICAgICAgLy9xdWljayBmaWx0ZXIgZmFpbHMsIHNvIHNraXAgaXRlbVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vc2Vjb25kLCBjaGVjayBhZHZhbmNlZCBmaWx0ZXJcclxuICAgIGlmIChhZHZhbmNlZEZpbHRlclByZXNlbnQpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZmlsdGVyTWFuYWdlci5kb2VzRmlsdGVyUGFzcyhub2RlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vZ290IHRoaXMgZmFyLCBhbGwgZmlsdGVycyBwYXNzXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5hZ2dyZWdhdGVSb3dGb3JRdWlja0ZpbHRlciA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIHZhciBhZ2dyZWdhdGVkVGV4dCA9ICcnO1xyXG4gICAgdGhpcy5jb2x1bW5Nb2RlbC5nZXRBbGxDb2x1bW5zKCkuZm9yRWFjaChmdW5jdGlvbihjb2xEZWZXcmFwcGVyKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBub2RlLmRhdGE7XHJcbiAgICAgICAgdmFyIHZhbHVlID0gZGF0YSA/IGRhdGFbY29sRGVmV3JhcHBlci5jb2xEZWYuZmllbGRdIDogbnVsbDtcclxuICAgICAgICBpZiAodmFsdWUgJiYgdmFsdWUgIT09ICcnKSB7XHJcbiAgICAgICAgICAgIGFnZ3JlZ2F0ZWRUZXh0ID0gYWdncmVnYXRlZFRleHQgKyB2YWx1ZS50b1N0cmluZygpLnRvVXBwZXJDYXNlKCkgKyBcIl9cIjtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIG5vZGUucXVpY2tGaWx0ZXJBZ2dyZWdhdGVUZXh0ID0gYWdncmVnYXRlZFRleHQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEluTWVtb3J5Um93Q29udHJvbGxlcjtcclxuIiwidmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9wYWdpbmF0aW9uUGFuZWwuaHRtbCcpO1xyXG5cclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xyXG5cclxuZnVuY3Rpb24gUGFnaW5hdGlvbkNvbnRyb2xsZXIoKSB7fVxyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihlUGFnaW5nUGFuZWwsIGFuZ3VsYXJHcmlkLCBncmlkT3B0aW9uc1dyYXBwZXIpIHtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyID0gZ3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkO1xyXG4gICAgdGhpcy5wb3B1bGF0ZVBhbmVsKGVQYWdpbmdQYW5lbCk7XHJcbiAgICB0aGlzLmNhbGxWZXJzaW9uID0gMDtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5zZXREYXRhc291cmNlID0gZnVuY3Rpb24oZGF0YXNvdXJjZSkge1xyXG4gICAgdGhpcy5kYXRhc291cmNlID0gZGF0YXNvdXJjZTtcclxuXHJcbiAgICBpZiAoIWRhdGFzb3VyY2UpIHtcclxuICAgICAgICAvLyBvbmx5IGNvbnRpbnVlIGlmIHdlIGhhdmUgYSB2YWxpZCBkYXRhc291cmNlIHRvIHdvcmsgd2l0aFxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlc2V0KCk7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGNvcHkgcGFnZVNpemUsIHRvIGd1YXJkIGFnYWluc3QgaXQgY2hhbmdpbmcgdGhlIHRoZSBkYXRhc291cmNlIGJldHdlZW4gY2FsbHNcclxuICAgIGlmICh0aGlzLmRhdGFzb3VyY2UucGFnZVNpemUgJiYgdHlwZW9mIHRoaXMuZGF0YXNvdXJjZS5wYWdlU2l6ZSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ2RhdGFzb3VyY2UucGFnZVNpemUgc2hvdWxkIGJlIGEgbnVtYmVyJyk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBhZ2VTaXplID0gdGhpcy5kYXRhc291cmNlLnBhZ2VTaXplO1xyXG4gICAgLy8gc2VlIGlmIHdlIGtub3cgdGhlIHRvdGFsIG51bWJlciBvZiBwYWdlcywgb3IgaWYgaXQncyAndG8gYmUgZGVjaWRlZCdcclxuICAgIGlmICh0eXBlb2YgdGhpcy5kYXRhc291cmNlLnJvd0NvdW50ID09PSAnbnVtYmVyJyAmJiB0aGlzLmRhdGFzb3VyY2Uucm93Q291bnQgPj0gMCkge1xyXG4gICAgICAgIHRoaXMucm93Q291bnQgPSB0aGlzLmRhdGFzb3VyY2Uucm93Q291bnQ7XHJcbiAgICAgICAgdGhpcy5mb3VuZE1heFJvdyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVUb3RhbFBhZ2VzKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMucm93Q291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuZm91bmRNYXhSb3cgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnRvdGFsUGFnZXMgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY3VycmVudFBhZ2UgPSAwO1xyXG5cclxuICAgIC8vIGhpZGUgdGhlIHN1bW1hcnkgcGFuZWwgdW50aWwgc29tZXRoaW5nIGlzIGxvYWRlZFxyXG4gICAgdGhpcy5lUGFnZVJvd1N1bW1hcnlQYW5lbC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XHJcblxyXG4gICAgdGhpcy5zZXRUb3RhbExhYmVscygpO1xyXG4gICAgdGhpcy5sb2FkUGFnZSgpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnNldFRvdGFsTGFiZWxzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5mb3VuZE1heFJvdykge1xyXG4gICAgICAgIHRoaXMubGJUb3RhbC5pbm5lckhUTUwgPSB0aGlzLnRvdGFsUGFnZXMudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgICAgICB0aGlzLmxiUmVjb3JkQ291bnQuaW5uZXJIVE1MID0gdGhpcy5yb3dDb3VudC50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgbW9yZVRleHQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRMb2NhbGVUZXh0RnVuYygpKCdtb3JlJywgJ21vcmUnKTtcclxuICAgICAgICB0aGlzLmxiVG90YWwuaW5uZXJIVE1MID0gbW9yZVRleHQ7XHJcbiAgICAgICAgdGhpcy5sYlJlY29yZENvdW50LmlubmVySFRNTCA9IG1vcmVUZXh0O1xyXG4gICAgfVxyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmNhbGN1bGF0ZVRvdGFsUGFnZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMudG90YWxQYWdlcyA9IE1hdGguZmxvb3IoKHRoaXMucm93Q291bnQgLSAxKSAvIHRoaXMucGFnZVNpemUpICsgMTtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5wYWdlTG9hZGVkID0gZnVuY3Rpb24ocm93cywgbGFzdFJvd0luZGV4KSB7XHJcbiAgICB2YXIgZmlyc3RJZCA9IHRoaXMuY3VycmVudFBhZ2UgKiB0aGlzLnBhZ2VTaXplO1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZC5zZXRSb3dzKHJvd3MsIGZpcnN0SWQpO1xyXG4gICAgLy8gc2VlIGlmIHdlIGhpdCB0aGUgbGFzdCByb3dcclxuICAgIGlmICghdGhpcy5mb3VuZE1heFJvdyAmJiB0eXBlb2YgbGFzdFJvd0luZGV4ID09PSAnbnVtYmVyJyAmJiBsYXN0Um93SW5kZXggPj0gMCkge1xyXG4gICAgICAgIHRoaXMuZm91bmRNYXhSb3cgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMucm93Q291bnQgPSBsYXN0Um93SW5kZXg7XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVUb3RhbFBhZ2VzKCk7XHJcbiAgICAgICAgdGhpcy5zZXRUb3RhbExhYmVscygpO1xyXG5cclxuICAgICAgICAvLyBpZiBvdmVyc2hvdCBwYWdlcywgZ28gYmFja1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQYWdlID4gdGhpcy50b3RhbFBhZ2VzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSB0aGlzLnRvdGFsUGFnZXMgLSAxO1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRQYWdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5lbmFibGVPckRpc2FibGVCdXR0b25zKCk7XHJcbiAgICB0aGlzLnVwZGF0ZVJvd0xhYmVscygpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZVJvd0xhYmVscyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHN0YXJ0Um93O1xyXG4gICAgdmFyIGVuZFJvdztcclxuICAgIGlmICh0aGlzLmlzWmVyb1BhZ2VzVG9EaXNwbGF5KCkpIHtcclxuICAgICAgICBzdGFydFJvdyA9IDA7XHJcbiAgICAgICAgZW5kUm93ID0gMDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc3RhcnRSb3cgPSAodGhpcy5wYWdlU2l6ZSAqIHRoaXMuY3VycmVudFBhZ2UpICsgMTtcclxuICAgICAgICBlbmRSb3cgPSBzdGFydFJvdyArIHRoaXMucGFnZVNpemUgLSAxO1xyXG4gICAgICAgIGlmICh0aGlzLmZvdW5kTWF4Um93ICYmIGVuZFJvdyA+IHRoaXMucm93Q291bnQpIHtcclxuICAgICAgICAgICAgZW5kUm93ID0gdGhpcy5yb3dDb3VudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmxiRmlyc3RSb3dPblBhZ2UuaW5uZXJIVE1MID0gKHN0YXJ0Um93KS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgdGhpcy5sYkxhc3RSb3dPblBhZ2UuaW5uZXJIVE1MID0gKGVuZFJvdykudG9Mb2NhbGVTdHJpbmcoKTtcclxuXHJcbiAgICAvLyBzaG93IHRoZSBzdW1tYXJ5IHBhbmVsLCB3aGVuIGZpcnN0IHNob3duLCB0aGlzIGlzIGJsYW5rXHJcbiAgICB0aGlzLmVQYWdlUm93U3VtbWFyeVBhbmVsLnN0eWxlLnZpc2liaWxpdHkgPSBudWxsO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmxvYWRQYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVuYWJsZU9yRGlzYWJsZUJ1dHRvbnMoKTtcclxuICAgIHZhciBzdGFydFJvdyA9IHRoaXMuY3VycmVudFBhZ2UgKiB0aGlzLmRhdGFzb3VyY2UucGFnZVNpemU7XHJcbiAgICB2YXIgZW5kUm93ID0gKHRoaXMuY3VycmVudFBhZ2UgKyAxKSAqIHRoaXMuZGF0YXNvdXJjZS5wYWdlU2l6ZTtcclxuXHJcbiAgICB0aGlzLmxiQ3VycmVudC5pbm5lckhUTUwgPSAodGhpcy5jdXJyZW50UGFnZSArIDEpLnRvTG9jYWxlU3RyaW5nKCk7XHJcblxyXG4gICAgdGhpcy5jYWxsVmVyc2lvbisrO1xyXG4gICAgdmFyIGNhbGxWZXJzaW9uQ29weSA9IHRoaXMuY2FsbFZlcnNpb247XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkLnNob3dMb2FkaW5nUGFuZWwodHJ1ZSk7XHJcblxyXG4gICAgdmFyIHNvcnRNb2RlbDtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0VuYWJsZVNlcnZlclNpZGVTb3J0aW5nKCkpIHtcclxuICAgICAgICBzb3J0TW9kZWwgPSB0aGlzLmFuZ3VsYXJHcmlkLmdldFNvcnRNb2RlbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBmaWx0ZXJNb2RlbDtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0VuYWJsZVNlcnZlclNpZGVGaWx0ZXIoKSkge1xyXG4gICAgICAgIGZpbHRlck1vZGVsID0gdGhpcy5hbmd1bGFyR3JpZC5nZXRGaWx0ZXJNb2RlbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBwYXJhbXMgPSB7XHJcbiAgICAgICAgc3RhcnRSb3c6IHN0YXJ0Um93LFxyXG4gICAgICAgIGVuZFJvdzogZW5kUm93LFxyXG4gICAgICAgIHN1Y2Nlc3NDYWxsYmFjazogc3VjY2Vzc0NhbGxiYWNrLFxyXG4gICAgICAgIGZhaWxDYWxsYmFjazogZmFpbENhbGxiYWNrLFxyXG4gICAgICAgIHNvcnRNb2RlbDogc29ydE1vZGVsLFxyXG4gICAgICAgIGZpbHRlck1vZGVsOiBmaWx0ZXJNb2RlbFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBjaGVjayBpZiBvbGQgdmVyc2lvbiBvZiBkYXRhc291cmNlIHVzZWRcclxuICAgIHZhciBnZXRSb3dzUGFyYW1zID0gdXRpbHMuZ2V0RnVuY3Rpb25QYXJhbWV0ZXJzKHRoaXMuZGF0YXNvdXJjZS5nZXRSb3dzKTtcclxuICAgIGlmIChnZXRSb3dzUGFyYW1zLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ2FnLWdyaWQ6IEl0IGxvb2tzIGxpa2UgeW91ciBwYWdpbmcgZGF0YXNvdXJjZSBpcyBvZiB0aGUgb2xkIHR5cGUsIHRha2luZyBtb3JlIHRoYW4gb25lIHBhcmFtZXRlci4nKTtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ2FnLWdyaWQ6IEZyb20gYWctZ3JpZCAxLjkuMCwgbm93IHRoZSBnZXRSb3dzIHRha2VzIG9uZSBwYXJhbWV0ZXIuIFNlZSB0aGUgZG9jdW1lbnRhdGlvbiBmb3IgZGV0YWlscy4nKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRhdGFzb3VyY2UuZ2V0Um93cyhwYXJhbXMpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHN1Y2Nlc3NDYWxsYmFjayhyb3dzLCBsYXN0Um93SW5kZXgpIHtcclxuICAgICAgICBpZiAodGhhdC5pc0NhbGxEYWVtb24oY2FsbFZlcnNpb25Db3B5KSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoYXQucGFnZUxvYWRlZChyb3dzLCBsYXN0Um93SW5kZXgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGZhaWxDYWxsYmFjaygpIHtcclxuICAgICAgICBpZiAodGhhdC5pc0NhbGxEYWVtb24oY2FsbFZlcnNpb25Db3B5KSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHNldCBpbiBhbiBlbXB0eSBzZXQgb2Ygcm93cywgdGhpcyB3aWxsIGF0XHJcbiAgICAgICAgLy8gbGVhc3QgZ2V0IHJpZCBvZiB0aGUgbG9hZGluZyBwYW5lbCwgYW5kXHJcbiAgICAgICAgLy8gc3RvcCBibG9ja2luZyB0aGluZ3NcclxuICAgICAgICB0aGF0LmFuZ3VsYXJHcmlkLnNldFJvd3MoW10pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmlzQ2FsbERhZW1vbiA9IGZ1bmN0aW9uKHZlcnNpb25Db3B5KSB7XHJcbiAgICByZXR1cm4gdmVyc2lvbkNvcHkgIT09IHRoaXMuY2FsbFZlcnNpb247XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUub25CdE5leHQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY3VycmVudFBhZ2UrKztcclxuICAgIHRoaXMubG9hZFBhZ2UoKTtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5vbkJ0UHJldmlvdXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY3VycmVudFBhZ2UtLTtcclxuICAgIHRoaXMubG9hZFBhZ2UoKTtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5vbkJ0Rmlyc3QgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY3VycmVudFBhZ2UgPSAwO1xyXG4gICAgdGhpcy5sb2FkUGFnZSgpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLm9uQnRMYXN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRQYWdlID0gdGhpcy50b3RhbFBhZ2VzIC0gMTtcclxuICAgIHRoaXMubG9hZFBhZ2UoKTtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5pc1plcm9QYWdlc1RvRGlzcGxheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZm91bmRNYXhSb3cgJiYgdGhpcy50b3RhbFBhZ2VzID09PSAwO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmVuYWJsZU9yRGlzYWJsZUJ1dHRvbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBkaXNhYmxlUHJldmlvdXNBbmRGaXJzdCA9IHRoaXMuY3VycmVudFBhZ2UgPT09IDA7XHJcbiAgICB0aGlzLmJ0UHJldmlvdXMuZGlzYWJsZWQgPSBkaXNhYmxlUHJldmlvdXNBbmRGaXJzdDtcclxuICAgIHRoaXMuYnRGaXJzdC5kaXNhYmxlZCA9IGRpc2FibGVQcmV2aW91c0FuZEZpcnN0O1xyXG5cclxuICAgIHZhciB6ZXJvUGFnZXNUb0Rpc3BsYXkgPSB0aGlzLmlzWmVyb1BhZ2VzVG9EaXNwbGF5KCk7XHJcbiAgICB2YXIgb25MYXN0UGFnZSA9IHRoaXMuZm91bmRNYXhSb3cgJiYgdGhpcy5jdXJyZW50UGFnZSA9PT0gKHRoaXMudG90YWxQYWdlcyAtIDEpO1xyXG5cclxuICAgIHZhciBkaXNhYmxlTmV4dCA9IG9uTGFzdFBhZ2UgfHwgemVyb1BhZ2VzVG9EaXNwbGF5O1xyXG4gICAgdGhpcy5idE5leHQuZGlzYWJsZWQgPSBkaXNhYmxlTmV4dDtcclxuXHJcbiAgICB2YXIgZGlzYWJsZUxhc3QgPSAhdGhpcy5mb3VuZE1heFJvdyB8fCB6ZXJvUGFnZXNUb0Rpc3BsYXkgfHwgdGhpcy5jdXJyZW50UGFnZSA9PT0gKHRoaXMudG90YWxQYWdlcyAtIDEpO1xyXG4gICAgdGhpcy5idExhc3QuZGlzYWJsZWQgPSBkaXNhYmxlTGFzdDtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5jcmVhdGVUZW1wbGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGxvY2FsZVRleHRGdW5jID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0TG9jYWxlVGV4dEZ1bmMoKTtcclxuICAgIHJldHVybiB0ZW1wbGF0ZVxyXG4gICAgICAgIC5yZXBsYWNlKCdbUEFHRV0nLCBsb2NhbGVUZXh0RnVuYygncGFnZScsICdQYWdlJykpXHJcbiAgICAgICAgLnJlcGxhY2UoJ1tUT10nLCBsb2NhbGVUZXh0RnVuYygndG8nLCAndG8nKSlcclxuICAgICAgICAucmVwbGFjZSgnW09GXScsIGxvY2FsZVRleHRGdW5jKCdvZicsICdvZicpKVxyXG4gICAgICAgIC5yZXBsYWNlKCdbT0ZdJywgbG9jYWxlVGV4dEZ1bmMoJ29mJywgJ29mJykpXHJcbiAgICAgICAgLnJlcGxhY2UoJ1tGSVJTVF0nLCBsb2NhbGVUZXh0RnVuYygnZmlyc3QnLCAnRmlyc3QnKSlcclxuICAgICAgICAucmVwbGFjZSgnW1BSRVZJT1VTXScsIGxvY2FsZVRleHRGdW5jKCdwcmV2aW91cycsICdQcmV2aW91cycpKVxyXG4gICAgICAgIC5yZXBsYWNlKCdbTkVYVF0nLCBsb2NhbGVUZXh0RnVuYygnbmV4dCcsICdOZXh0JykpXHJcbiAgICAgICAgLnJlcGxhY2UoJ1tMQVNUXScsIGxvY2FsZVRleHRGdW5jKCdsYXN0JywgJ0xhc3QnKSk7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucG9wdWxhdGVQYW5lbCA9IGZ1bmN0aW9uKGVQYWdpbmdQYW5lbCkge1xyXG5cclxuICAgIGVQYWdpbmdQYW5lbC5pbm5lckhUTUwgPSB0aGlzLmNyZWF0ZVRlbXBsYXRlKCk7XHJcblxyXG4gICAgdGhpcy5idE5leHQgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI2J0TmV4dCcpO1xyXG4gICAgdGhpcy5idFByZXZpb3VzID0gZVBhZ2luZ1BhbmVsLnF1ZXJ5U2VsZWN0b3IoJyNidFByZXZpb3VzJyk7XHJcbiAgICB0aGlzLmJ0Rmlyc3QgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI2J0Rmlyc3QnKTtcclxuICAgIHRoaXMuYnRMYXN0ID0gZVBhZ2luZ1BhbmVsLnF1ZXJ5U2VsZWN0b3IoJyNidExhc3QnKTtcclxuICAgIHRoaXMubGJDdXJyZW50ID0gZVBhZ2luZ1BhbmVsLnF1ZXJ5U2VsZWN0b3IoJyNjdXJyZW50Jyk7XHJcbiAgICB0aGlzLmxiVG90YWwgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI3RvdGFsJyk7XHJcblxyXG4gICAgdGhpcy5sYlJlY29yZENvdW50ID0gZVBhZ2luZ1BhbmVsLnF1ZXJ5U2VsZWN0b3IoJyNyZWNvcmRDb3VudCcpO1xyXG4gICAgdGhpcy5sYkZpcnN0Um93T25QYWdlID0gZVBhZ2luZ1BhbmVsLnF1ZXJ5U2VsZWN0b3IoJyNmaXJzdFJvd09uUGFnZScpO1xyXG4gICAgdGhpcy5sYkxhc3RSb3dPblBhZ2UgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI2xhc3RSb3dPblBhZ2UnKTtcclxuICAgIHRoaXMuZVBhZ2VSb3dTdW1tYXJ5UGFuZWwgPSBlUGFnaW5nUGFuZWwucXVlcnlTZWxlY3RvcignI3BhZ2VSb3dTdW1tYXJ5UGFuZWwnKTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgdGhpcy5idE5leHQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGF0Lm9uQnROZXh0KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmJ0UHJldmlvdXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGF0Lm9uQnRQcmV2aW91cygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5idEZpcnN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhhdC5vbkJ0Rmlyc3QoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYnRMYXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhhdC5vbkJ0TGFzdCgpO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhZ2luYXRpb25Db250cm9sbGVyO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPHNwYW4gaWQ9cGFnZVJvd1N1bW1hcnlQYW5lbCBjbGFzcz1hZy1wYWdpbmctcm93LXN1bW1hcnktcGFuZWw+PHNwYW4gaWQ9Zmlyc3RSb3dPblBhZ2U+PC9zcGFuPiBbVE9dIDxzcGFuIGlkPWxhc3RSb3dPblBhZ2U+PC9zcGFuPiBbT0ZdIDxzcGFuIGlkPXJlY29yZENvdW50Pjwvc3Bhbj48L3NwYW4+IDxzcGFuIGNsYXNzPWFnLXBhZ2luZy1wYWdlLXN1bW1hcnktcGFuZWw+PGJ1dHRvbiBjbGFzcz1hZy1wYWdpbmctYnV0dG9uIGlkPWJ0Rmlyc3Q+W0ZJUlNUXTwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPWFnLXBhZ2luZy1idXR0b24gaWQ9YnRQcmV2aW91cz5bUFJFVklPVVNdPC9idXR0b24+IFtQQUdFXSA8c3BhbiBpZD1jdXJyZW50Pjwvc3Bhbj4gW09GXSA8c3BhbiBpZD10b3RhbD48L3NwYW4+IDxidXR0b24gY2xhc3M9YWctcGFnaW5nLWJ1dHRvbiBpZD1idE5leHQ+W05FWFRdPC9idXR0b24+IDxidXR0b24gY2xhc3M9YWctcGFnaW5nLWJ1dHRvbiBpZD1idExhc3Q+W0xBU1RdPC9idXR0b24+PC9zcGFuPlwiO1xuIiwiLypcclxuICogVGhpcyByb3cgY29udHJvbGxlciBpcyB1c2VkIGZvciBpbmZpbml0ZSBzY3JvbGxpbmcgb25seS4gRm9yIG5vcm1hbCAnaW4gbWVtb3J5JyB0YWJsZSxcclxuICogb3Igc3RhbmRhcmQgcGFnaW5hdGlvbiwgdGhlIGluTWVtb3J5Um93Q29udHJvbGxlciBpcyB1c2VkLlxyXG4gKi9cclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xyXG52YXIgbG9nZ2luZyA9IHRydWU7XHJcblxyXG5mdW5jdGlvbiBWaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIoKSB7fVxyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ocm93UmVuZGVyZXIsIGdyaWRPcHRpb25zV3JhcHBlciwgYW5ndWxhckdyaWQpIHtcclxuICAgIHRoaXMucm93UmVuZGVyZXIgPSByb3dSZW5kZXJlcjtcclxuICAgIHRoaXMuZGF0YXNvdXJjZVZlcnNpb24gPSAwO1xyXG4gICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIgPSBncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkID0gYW5ndWxhckdyaWQ7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnNldERhdGFzb3VyY2UgPSBmdW5jdGlvbihkYXRhc291cmNlKSB7XHJcbiAgICB0aGlzLmRhdGFzb3VyY2UgPSBkYXRhc291cmNlO1xyXG5cclxuICAgIGlmICghZGF0YXNvdXJjZSkge1xyXG4gICAgICAgIC8vIG9ubHkgY29udGludWUgaWYgd2UgaGF2ZSBhIHZhbGlkIGRhdGFzb3VyY2UgdG8gd29ya2luZyB3aXRoXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmVzZXQoKTtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIHNlZSBpZiBkYXRhc291cmNlIGtub3dzIGhvdyBtYW55IHJvd3MgdGhlcmUgYXJlXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZGF0YXNvdXJjZS5yb3dDb3VudCA9PT0gJ251bWJlcicgJiYgdGhpcy5kYXRhc291cmNlLnJvd0NvdW50ID49IDApIHtcclxuICAgICAgICB0aGlzLnZpcnR1YWxSb3dDb3VudCA9IHRoaXMuZGF0YXNvdXJjZS5yb3dDb3VudDtcclxuICAgICAgICB0aGlzLmZvdW5kTWF4Um93ID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy52aXJ0dWFsUm93Q291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuZm91bmRNYXhSb3cgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpbiBjYXNlIGFueSBkYWVtb24gcmVxdWVzdHMgY29taW5nIGZyb20gZGF0YXNvdXJjZSwgd2Uga25vdyBpdCBpZ25vcmUgdGhlbVxyXG4gICAgdGhpcy5kYXRhc291cmNlVmVyc2lvbisrO1xyXG5cclxuICAgIC8vIG1hcCBvZiBwYWdlIG51bWJlcnMgdG8gcm93cyBpbiB0aGF0IHBhZ2VcclxuICAgIHRoaXMucGFnZUNhY2hlID0ge307XHJcbiAgICB0aGlzLnBhZ2VDYWNoZVNpemUgPSAwO1xyXG5cclxuICAgIC8vIGlmIGEgbnVtYmVyIGlzIGluIHRoaXMgYXJyYXksIGl0IG1lYW5zIHdlIGFyZSBwZW5kaW5nIGEgbG9hZCBmcm9tIGl0XHJcbiAgICB0aGlzLnBhZ2VMb2Fkc0luUHJvZ3Jlc3MgPSBbXTtcclxuICAgIHRoaXMucGFnZUxvYWRzUXVldWVkID0gW107XHJcbiAgICB0aGlzLnBhZ2VBY2Nlc3NUaW1lcyA9IHt9OyAvLyBrZWVwcyBhIHJlY29yZCBvZiB3aGVuIGVhY2ggcGFnZSB3YXMgbGFzdCB2aWV3ZWQsIHVzZWQgZm9yIExSVSBjYWNoZVxyXG4gICAgdGhpcy5hY2Nlc3NUaW1lID0gMDsgLy8gcmF0aGVyIHRoYW4gdXNpbmcgdGhlIGNsb2NrLCB3ZSB1c2UgdGhpcyBjb3VudGVyXHJcblxyXG4gICAgLy8gdGhlIG51bWJlciBvZiBjb25jdXJyZW50IGxvYWRzIHdlIGFyZSBhbGxvd2VkIHRvIHRoZSBzZXJ2ZXJcclxuICAgIGlmICh0eXBlb2YgdGhpcy5kYXRhc291cmNlLm1heENvbmN1cnJlbnRSZXF1ZXN0cyA9PT0gJ251bWJlcicgJiYgdGhpcy5kYXRhc291cmNlLm1heENvbmN1cnJlbnRSZXF1ZXN0cyA+IDApIHtcclxuICAgICAgICB0aGlzLm1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHMgPSB0aGlzLmRhdGFzb3VyY2UubWF4Q29uY3VycmVudFJlcXVlc3RzO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHMgPSAyO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoZSBudW1iZXIgb2YgcGFnZXMgdG8ga2VlcCBpbiBicm93c2VyIGNhY2hlXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZGF0YXNvdXJjZS5tYXhQYWdlc0luQ2FjaGUgPT09ICdudW1iZXInICYmIHRoaXMuZGF0YXNvdXJjZS5tYXhQYWdlc0luQ2FjaGUgPiAwKSB7XHJcbiAgICAgICAgdGhpcy5tYXhQYWdlc0luQ2FjaGUgPSB0aGlzLmRhdGFzb3VyY2UubWF4UGFnZXNJbkNhY2hlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBudWxsIGlzIGRlZmF1bHQsIG1lYW5zIGRvbid0ICBoYXZlIGFueSBtYXggc2l6ZSBvbiB0aGUgY2FjaGVcclxuICAgICAgICB0aGlzLm1heFBhZ2VzSW5DYWNoZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5wYWdlU2l6ZSA9IHRoaXMuZGF0YXNvdXJjZS5wYWdlU2l6ZTsgLy8gdGFrZSBhIGNvcHkgb2YgcGFnZSBzaXplLCB3ZSBkb24ndCB3YW50IGl0IGNoYW5naW5nXHJcbiAgICB0aGlzLm92ZXJmbG93U2l6ZSA9IHRoaXMuZGF0YXNvdXJjZS5vdmVyZmxvd1NpemU7IC8vIHRha2UgYSBjb3B5IG9mIHBhZ2Ugc2l6ZSwgd2UgZG9uJ3Qgd2FudCBpdCBjaGFuZ2luZ1xyXG5cclxuICAgIHRoaXMuZG9Mb2FkT3JRdWV1ZSgwKTtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUuY3JlYXRlTm9kZXNGcm9tUm93cyA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIsIHJvd3MpIHtcclxuICAgIHZhciBub2RlcyA9IFtdO1xyXG4gICAgaWYgKHJvd3MpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IHJvd3MubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB2aXJ0dWFsUm93SW5kZXggPSAocGFnZU51bWJlciAqIHRoaXMucGFnZVNpemUpICsgaTtcclxuICAgICAgICAgICAgbm9kZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBkYXRhOiByb3dzW2ldLFxyXG4gICAgICAgICAgICAgICAgaWQ6IHZpcnR1YWxSb3dJbmRleFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbm9kZXM7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnJlbW92ZUZyb21Mb2FkaW5nID0gZnVuY3Rpb24ocGFnZU51bWJlcikge1xyXG4gICAgdmFyIGluZGV4ID0gdGhpcy5wYWdlTG9hZHNJblByb2dyZXNzLmluZGV4T2YocGFnZU51bWJlcik7XHJcbiAgICB0aGlzLnBhZ2VMb2Fkc0luUHJvZ3Jlc3Muc3BsaWNlKGluZGV4LCAxKTtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUucGFnZUxvYWRGYWlsZWQgPSBmdW5jdGlvbihwYWdlTnVtYmVyKSB7XHJcbiAgICB0aGlzLnJlbW92ZUZyb21Mb2FkaW5nKHBhZ2VOdW1iZXIpO1xyXG4gICAgdGhpcy5jaGVja1F1ZXVlRm9yTmV4dExvYWQoKTtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUucGFnZUxvYWRlZCA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIsIHJvd3MsIGxhc3RSb3cpIHtcclxuICAgIHRoaXMucHV0UGFnZUludG9DYWNoZUFuZFB1cmdlKHBhZ2VOdW1iZXIsIHJvd3MpO1xyXG4gICAgdGhpcy5jaGVja01heFJvd0FuZEluZm9ybVJvd1JlbmRlcmVyKHBhZ2VOdW1iZXIsIGxhc3RSb3cpO1xyXG4gICAgdGhpcy5yZW1vdmVGcm9tTG9hZGluZyhwYWdlTnVtYmVyKTtcclxuICAgIHRoaXMuY2hlY2tRdWV1ZUZvck5leHRMb2FkKCk7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnB1dFBhZ2VJbnRvQ2FjaGVBbmRQdXJnZSA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIsIHJvd3MpIHtcclxuICAgIHRoaXMucGFnZUNhY2hlW3BhZ2VOdW1iZXJdID0gdGhpcy5jcmVhdGVOb2Rlc0Zyb21Sb3dzKHBhZ2VOdW1iZXIsIHJvd3MpO1xyXG4gICAgdGhpcy5wYWdlQ2FjaGVTaXplKys7XHJcbiAgICBpZiAobG9nZ2luZykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdhZGRpbmcgcGFnZSAnICsgcGFnZU51bWJlcik7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG5lZWRUb1B1cmdlID0gdGhpcy5tYXhQYWdlc0luQ2FjaGUgJiYgdGhpcy5tYXhQYWdlc0luQ2FjaGUgPCB0aGlzLnBhZ2VDYWNoZVNpemU7XHJcbiAgICBpZiAobmVlZFRvUHVyZ2UpIHtcclxuICAgICAgICAvLyBmaW5kIHRoZSBMUlUgcGFnZVxyXG4gICAgICAgIHZhciB5b3VuZ2VzdFBhZ2VJbmRleCA9IHRoaXMuZmluZExlYXN0UmVjZW50bHlBY2Nlc3NlZFBhZ2UoT2JqZWN0LmtleXModGhpcy5wYWdlQ2FjaGUpKTtcclxuXHJcbiAgICAgICAgaWYgKGxvZ2dpbmcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3B1cmdpbmcgcGFnZSAnICsgeW91bmdlc3RQYWdlSW5kZXggKyAnIGZyb20gY2FjaGUgJyArIE9iamVjdC5rZXlzKHRoaXMucGFnZUNhY2hlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnBhZ2VDYWNoZVt5b3VuZ2VzdFBhZ2VJbmRleF07XHJcbiAgICAgICAgdGhpcy5wYWdlQ2FjaGVTaXplLS07XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5jaGVja01heFJvd0FuZEluZm9ybVJvd1JlbmRlcmVyID0gZnVuY3Rpb24ocGFnZU51bWJlciwgbGFzdFJvdykge1xyXG4gICAgaWYgKCF0aGlzLmZvdW5kTWF4Um93KSB7XHJcbiAgICAgICAgLy8gaWYgd2Uga25vdyB0aGUgbGFzdCByb3csIHVzZSBpZlxyXG4gICAgICAgIGlmICh0eXBlb2YgbGFzdFJvdyA9PT0gJ251bWJlcicgJiYgbGFzdFJvdyA+PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlydHVhbFJvd0NvdW50ID0gbGFzdFJvdztcclxuICAgICAgICAgICAgdGhpcy5mb3VuZE1heFJvdyA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBzZWUgaWYgd2UgbmVlZCB0byBhZGQgc29tZSB2aXJ0dWFsIHJvd3NcclxuICAgICAgICAgICAgdmFyIHRoaXNQYWdlUGx1c0J1ZmZlciA9ICgocGFnZU51bWJlciArIDEpICogdGhpcy5wYWdlU2l6ZSkgKyB0aGlzLm92ZXJmbG93U2l6ZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMudmlydHVhbFJvd0NvdW50IDwgdGhpc1BhZ2VQbHVzQnVmZmVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZpcnR1YWxSb3dDb3VudCA9IHRoaXNQYWdlUGx1c0J1ZmZlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpZiByb3dDb3VudCBjaGFuZ2VzLCByZWZyZXNoVmlldywgb3RoZXJ3aXNlIGp1c3QgcmVmcmVzaEFsbFZpcnR1YWxSb3dzXHJcbiAgICAgICAgdGhpcy5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnJvd1JlbmRlcmVyLnJlZnJlc2hBbGxWaXJ0dWFsUm93cygpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5pc1BhZ2VBbHJlYWR5TG9hZGluZyA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpIHtcclxuICAgIHZhciByZXN1bHQgPSB0aGlzLnBhZ2VMb2Fkc0luUHJvZ3Jlc3MuaW5kZXhPZihwYWdlTnVtYmVyKSA+PSAwIHx8IHRoaXMucGFnZUxvYWRzUXVldWVkLmluZGV4T2YocGFnZU51bWJlcikgPj0gMDtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmRvTG9hZE9yUXVldWUgPSBmdW5jdGlvbihwYWdlTnVtYmVyKSB7XHJcbiAgICAvLyBpZiB3ZSBhbHJlYWR5IHRyaWVkIHRvIGxvYWQgdGhpcyBwYWdlLCB0aGVuIGlnbm9yZSB0aGUgcmVxdWVzdCxcclxuICAgIC8vIG90aGVyd2lzZSBzZXJ2ZXIgd291bGQgYmUgaGl0IDUwIHRpbWVzIGp1c3QgdG8gZGlzcGxheSBvbmUgcGFnZSwgdGhlXHJcbiAgICAvLyBmaXJzdCByb3cgdG8gZmluZCB0aGUgcGFnZSBtaXNzaW5nIGlzIGVub3VnaC5cclxuICAgIGlmICh0aGlzLmlzUGFnZUFscmVhZHlMb2FkaW5nKHBhZ2VOdW1iZXIpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRyeSB0aGUgcGFnZSBsb2FkIC0gaWYgbm90IGFscmVhZHkgZG9pbmcgYSBsb2FkLCB0aGVuIHdlIGNhbiBnbyBhaGVhZFxyXG4gICAgaWYgKHRoaXMucGFnZUxvYWRzSW5Qcm9ncmVzcy5sZW5ndGggPCB0aGlzLm1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHMpIHtcclxuICAgICAgICAvLyBnbyBhaGVhZCwgbG9hZCB0aGUgcGFnZVxyXG4gICAgICAgIHRoaXMubG9hZFBhZ2UocGFnZU51bWJlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIG90aGVyd2lzZSwgcXVldWUgdGhlIHJlcXVlc3RcclxuICAgICAgICB0aGlzLmFkZFRvUXVldWVBbmRQdXJnZVF1ZXVlKHBhZ2VOdW1iZXIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5hZGRUb1F1ZXVlQW5kUHVyZ2VRdWV1ZSA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpIHtcclxuICAgIGlmIChsb2dnaW5nKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3F1ZXVlaW5nICcgKyBwYWdlTnVtYmVyICsgJyAtICcgKyB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5wdXNoKHBhZ2VOdW1iZXIpO1xyXG5cclxuICAgIC8vIHNlZSBpZiB0aGVyZSBhcmUgbW9yZSBwYWdlcyBxdWV1ZWQgdGhhdCBhcmUgYWN0dWFsbHkgaW4gb3VyIGNhY2hlLCBpZiBzbyB0aGVyZSBpc1xyXG4gICAgLy8gbm8gcG9pbnQgaW4gbG9hZGluZyB0aGVtIGFsbCBhcyBzb21lIHdpbGwgYmUgcHVyZ2VkIGFzIHNvb24gYXMgbG9hZGVkXHJcbiAgICB2YXIgbmVlZFRvUHVyZ2UgPSB0aGlzLm1heFBhZ2VzSW5DYWNoZSAmJiB0aGlzLm1heFBhZ2VzSW5DYWNoZSA8IHRoaXMucGFnZUxvYWRzUXVldWVkLmxlbmd0aDtcclxuICAgIGlmIChuZWVkVG9QdXJnZSkge1xyXG4gICAgICAgIC8vIGZpbmQgdGhlIExSVSBwYWdlXHJcbiAgICAgICAgdmFyIHlvdW5nZXN0UGFnZUluZGV4ID0gdGhpcy5maW5kTGVhc3RSZWNlbnRseUFjY2Vzc2VkUGFnZSh0aGlzLnBhZ2VMb2Fkc1F1ZXVlZCk7XHJcblxyXG4gICAgICAgIGlmIChsb2dnaW5nKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZS1xdWV1ZWluZyAnICsgcGFnZU51bWJlciArICcgLSAnICsgdGhpcy5wYWdlTG9hZHNRdWV1ZWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGluZGV4VG9SZW1vdmUgPSB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5pbmRleE9mKHlvdW5nZXN0UGFnZUluZGV4KTtcclxuICAgICAgICB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5zcGxpY2UoaW5kZXhUb1JlbW92ZSwgMSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmZpbmRMZWFzdFJlY2VudGx5QWNjZXNzZWRQYWdlID0gZnVuY3Rpb24ocGFnZUluZGV4ZXMpIHtcclxuICAgIHZhciB5b3VuZ2VzdFBhZ2VJbmRleCA9IC0xO1xyXG4gICAgdmFyIHlvdW5nZXN0UGFnZUFjY2Vzc1RpbWUgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIHBhZ2VJbmRleGVzLmZvckVhY2goZnVuY3Rpb24ocGFnZUluZGV4KSB7XHJcbiAgICAgICAgdmFyIGFjY2Vzc1RpbWVUaGlzUGFnZSA9IHRoYXQucGFnZUFjY2Vzc1RpbWVzW3BhZ2VJbmRleF07XHJcbiAgICAgICAgaWYgKGFjY2Vzc1RpbWVUaGlzUGFnZSA8IHlvdW5nZXN0UGFnZUFjY2Vzc1RpbWUpIHtcclxuICAgICAgICAgICAgeW91bmdlc3RQYWdlQWNjZXNzVGltZSA9IGFjY2Vzc1RpbWVUaGlzUGFnZTtcclxuICAgICAgICAgICAgeW91bmdlc3RQYWdlSW5kZXggPSBwYWdlSW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHlvdW5nZXN0UGFnZUluZGV4O1xyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5jaGVja1F1ZXVlRm9yTmV4dExvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLnBhZ2VMb2Fkc1F1ZXVlZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgLy8gdGFrZSBmcm9tIHRoZSBmcm9udCBvZiB0aGUgcXVldWVcclxuICAgICAgICB2YXIgcGFnZVRvTG9hZCA9IHRoaXMucGFnZUxvYWRzUXVldWVkWzBdO1xyXG4gICAgICAgIHRoaXMucGFnZUxvYWRzUXVldWVkLnNwbGljZSgwLCAxKTtcclxuXHJcbiAgICAgICAgaWYgKGxvZ2dpbmcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2RlcXVldWVpbmcgJyArIHBhZ2VUb0xvYWQgKyAnIC0gJyArIHRoaXMucGFnZUxvYWRzUXVldWVkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubG9hZFBhZ2UocGFnZVRvTG9hZCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmxvYWRQYWdlID0gZnVuY3Rpb24ocGFnZU51bWJlcikge1xyXG5cclxuICAgIHRoaXMucGFnZUxvYWRzSW5Qcm9ncmVzcy5wdXNoKHBhZ2VOdW1iZXIpO1xyXG5cclxuICAgIHZhciBzdGFydFJvdyA9IHBhZ2VOdW1iZXIgKiB0aGlzLnBhZ2VTaXplO1xyXG4gICAgdmFyIGVuZFJvdyA9IChwYWdlTnVtYmVyICsgMSkgKiB0aGlzLnBhZ2VTaXplO1xyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHZhciBkYXRhc291cmNlVmVyc2lvbkNvcHkgPSB0aGlzLmRhdGFzb3VyY2VWZXJzaW9uO1xyXG5cclxuICAgIHZhciBzb3J0TW9kZWw7XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNFbmFibGVTZXJ2ZXJTaWRlU29ydGluZygpKSB7XHJcbiAgICAgICAgc29ydE1vZGVsID0gdGhpcy5hbmd1bGFyR3JpZC5nZXRTb3J0TW9kZWwoKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZmlsdGVyTW9kZWw7XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNFbmFibGVTZXJ2ZXJTaWRlRmlsdGVyKCkpIHtcclxuICAgICAgICBmaWx0ZXJNb2RlbCA9IHRoaXMuYW5ndWxhckdyaWQuZ2V0RmlsdGVyTW9kZWwoKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgIHN0YXJ0Um93OiBzdGFydFJvdyxcclxuICAgICAgICBlbmRSb3c6IGVuZFJvdyxcclxuICAgICAgICBzdWNjZXNzQ2FsbGJhY2s6IHN1Y2Nlc3NDYWxsYmFjayxcclxuICAgICAgICBmYWlsQ2FsbGJhY2s6IGZhaWxDYWxsYmFjayxcclxuICAgICAgICBzb3J0TW9kZWw6IHNvcnRNb2RlbCxcclxuICAgICAgICBmaWx0ZXJNb2RlbDogZmlsdGVyTW9kZWxcclxuICAgIH07XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgb2xkIHZlcnNpb24gb2YgZGF0YXNvdXJjZSB1c2VkXHJcbiAgICB2YXIgZ2V0Um93c1BhcmFtcyA9IHV0aWxzLmdldEZ1bmN0aW9uUGFyYW1ldGVycyh0aGlzLmRhdGFzb3VyY2UuZ2V0Um93cyk7XHJcbiAgICBpZiAoZ2V0Um93c1BhcmFtcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdhZy1ncmlkOiBJdCBsb29rcyBsaWtlIHlvdXIgcGFnaW5nIGRhdGFzb3VyY2UgaXMgb2YgdGhlIG9sZCB0eXBlLCB0YWtpbmcgbW9yZSB0aGFuIG9uZSBwYXJhbWV0ZXIuJyk7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdhZy1ncmlkOiBGcm9tIGFnLWdyaWQgMS45LjAsIG5vdyB0aGUgZ2V0Um93cyB0YWtlcyBvbmUgcGFyYW1ldGVyLiBTZWUgdGhlIGRvY3VtZW50YXRpb24gZm9yIGRldGFpbHMuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kYXRhc291cmNlLmdldFJvd3MocGFyYW1zKTtcclxuXHJcbiAgICBmdW5jdGlvbiBzdWNjZXNzQ2FsbGJhY2socm93cywgbGFzdFJvd0luZGV4KSB7XHJcbiAgICAgICAgaWYgKHRoYXQucmVxdWVzdElzRGFlbW9uKGRhdGFzb3VyY2VWZXJzaW9uQ29weSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGF0LnBhZ2VMb2FkZWQocGFnZU51bWJlciwgcm93cywgbGFzdFJvd0luZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBmYWlsQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgaWYgKHRoYXQucmVxdWVzdElzRGFlbW9uKGRhdGFzb3VyY2VWZXJzaW9uQ29weSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGF0LnBhZ2VMb2FkRmFpbGVkKHBhZ2VOdW1iZXIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gY2hlY2sgdGhhdCB0aGUgZGF0YXNvdXJjZSBoYXMgbm90IGNoYW5nZWQgc2luY2UgdGhlIGxhdHMgdGltZSB3ZSBkaWQgYSByZXF1ZXN0XHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUucmVxdWVzdElzRGFlbW9uID0gZnVuY3Rpb24oZGF0YXNvdXJjZVZlcnNpb25Db3B5KSB7XHJcbiAgICByZXR1cm4gdGhpcy5kYXRhc291cmNlVmVyc2lvbiAhPT0gZGF0YXNvdXJjZVZlcnNpb25Db3B5O1xyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5nZXRWaXJ0dWFsUm93ID0gZnVuY3Rpb24ocm93SW5kZXgpIHtcclxuICAgIGlmIChyb3dJbmRleCA+IHRoaXMudmlydHVhbFJvd0NvdW50KSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHBhZ2VOdW1iZXIgPSBNYXRoLmZsb29yKHJvd0luZGV4IC8gdGhpcy5wYWdlU2l6ZSk7XHJcbiAgICB2YXIgcGFnZSA9IHRoaXMucGFnZUNhY2hlW3BhZ2VOdW1iZXJdO1xyXG5cclxuICAgIC8vIGZvciBMUlUgY2FjaGUsIHRyYWNrIHdoZW4gdGhpcyBwYWdlIHdhcyBsYXN0IGhpdFxyXG4gICAgdGhpcy5wYWdlQWNjZXNzVGltZXNbcGFnZU51bWJlcl0gPSB0aGlzLmFjY2Vzc1RpbWUrKztcclxuXHJcbiAgICBpZiAoIXBhZ2UpIHtcclxuICAgICAgICB0aGlzLmRvTG9hZE9yUXVldWUocGFnZU51bWJlcik7XHJcbiAgICAgICAgLy8gcmV0dXJuIGJhY2sgYW4gZW1wdHkgcm93LCBzbyB0YWJsZSBjYW4gYXQgbGVhc3QgcmVuZGVyIGVtcHR5IGNlbGxzXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZGF0YToge30sXHJcbiAgICAgICAgICAgIGlkOiByb3dJbmRleFxyXG4gICAgICAgIH07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBpbmRleEluVGhpc1BhZ2UgPSByb3dJbmRleCAlIHRoaXMucGFnZVNpemU7XHJcbiAgICAgICAgcmV0dXJuIHBhZ2VbaW5kZXhJblRoaXNQYWdlXTtcclxuICAgIH1cclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUuZm9yRWFjaEluTWVtb3J5ID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgIHZhciBwYWdlS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMucGFnZUNhY2hlKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpPHBhZ2VLZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHBhZ2VLZXkgPSBwYWdlS2V5c1tpXTtcclxuICAgICAgICB2YXIgcGFnZSA9IHRoaXMucGFnZUNhY2hlW3BhZ2VLZXldO1xyXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqPHBhZ2UubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgdmFyIG5vZGUgPSBwYWdlW2pdO1xyXG4gICAgICAgICAgICBjYWxsYmFjayhub2RlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmdldE1vZGVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldFZpcnR1YWxSb3c6IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmdldFZpcnR1YWxSb3coaW5kZXgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VmlydHVhbFJvd0NvdW50OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQudmlydHVhbFJvd0NvdW50O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9yRWFjaEluTWVtb3J5OiBmdW5jdGlvbiggY2FsbGJhY2sgKSB7XHJcbiAgICAgICAgICAgIHRoYXQuZm9yRWFjaEluTWVtb3J5KGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBWaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXI7XHJcbiIsInZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcbnZhciBncm91cENlbGxSZW5kZXJlckZhY3RvcnkgPSByZXF1aXJlKCcuL2NlbGxSZW5kZXJlcnMvZ3JvdXBDZWxsUmVuZGVyZXJGYWN0b3J5Jyk7XHJcblxyXG5mdW5jdGlvbiBSb3dSZW5kZXJlcigpIHt9XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGdyaWRPcHRpb25zLCBjb2x1bW5Nb2RlbCwgZ3JpZE9wdGlvbnNXcmFwcGVyLCBlR3JpZCxcclxuICAgIGFuZ3VsYXJHcmlkLCBzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnksICRjb21waWxlLCAkc2NvcGUsXHJcbiAgICBzZWxlY3Rpb25Db250cm9sbGVyLCBleHByZXNzaW9uU2VydmljZSwgdGVtcGxhdGVTZXJ2aWNlLCBlUGFyZW50T2ZSb3dzKSB7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zID0gZ3JpZE9wdGlvbnM7XHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsID0gY29sdW1uTW9kZWw7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZDtcclxuICAgIHRoaXMuc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5ID0gc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5O1xyXG4gICAgdGhpcy5maW5kQWxsRWxlbWVudHMoZUdyaWQpO1xyXG4gICAgdGhpcy4kY29tcGlsZSA9ICRjb21waWxlO1xyXG4gICAgdGhpcy4kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIgPSBzZWxlY3Rpb25Db250cm9sbGVyO1xyXG4gICAgdGhpcy5leHByZXNzaW9uU2VydmljZSA9IGV4cHJlc3Npb25TZXJ2aWNlO1xyXG4gICAgdGhpcy50ZW1wbGF0ZVNlcnZpY2UgPSB0ZW1wbGF0ZVNlcnZpY2U7XHJcbiAgICB0aGlzLmVQYXJlbnRPZlJvd3MgPSBlUGFyZW50T2ZSb3dzO1xyXG5cclxuICAgIHRoaXMuY2VsbFJlbmRlcmVyTWFwID0ge1xyXG4gICAgICAgICdncm91cCc6IGdyb3VwQ2VsbFJlbmRlcmVyRmFjdG9yeShncmlkT3B0aW9uc1dyYXBwZXIsIHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSlcclxuICAgIH07XHJcblxyXG4gICAgLy8gbWFwIG9mIHJvdyBpZHMgdG8gcm93IG9iamVjdHMuIGtlZXBzIHRyYWNrIG9mIHdoaWNoIGVsZW1lbnRzXHJcbiAgICAvLyBhcmUgcmVuZGVyZWQgZm9yIHdoaWNoIHJvd3MgaW4gdGhlIGRvbS4gZWFjaCByb3cgb2JqZWN0IGhhczpcclxuICAgIC8vIFtzY29wZSwgYm9keVJvdywgcGlubmVkUm93LCByb3dEYXRhXVxyXG4gICAgdGhpcy5yZW5kZXJlZFJvd3MgPSB7fTtcclxuXHJcbiAgICB0aGlzLnJlbmRlcmVkUm93U3RhcnRFZGl0aW5nTGlzdGVuZXJzID0ge307XHJcblxyXG4gICAgdGhpcy5lZGl0aW5nQ2VsbCA9IGZhbHNlOyAvL2dldHMgc2V0IHRvIHRydWUgd2hlbiBlZGl0aW5nIGEgY2VsbFxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnNldFJvd01vZGVsID0gZnVuY3Rpb24ocm93TW9kZWwpIHtcclxuICAgIHRoaXMucm93TW9kZWwgPSByb3dNb2RlbDtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zZXRNYWluUm93V2lkdGhzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbWFpblJvd1dpZHRoID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRCb2R5Q29udGFpbmVyV2lkdGgoKSArIFwicHhcIjtcclxuXHJcbiAgICB2YXIgdW5waW5uZWRSb3dzID0gdGhpcy5lQm9keUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiLmFnLXJvd1wiKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdW5waW5uZWRSb3dzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdW5waW5uZWRSb3dzW2ldLnN0eWxlLndpZHRoID0gbWFpblJvd1dpZHRoO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmZpbmRBbGxFbGVtZW50cyA9IGZ1bmN0aW9uKGVHcmlkKSB7XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgdGhpcy5lQm9keUNvbnRhaW5lciA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keS1jb250YWluZXJcIik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZUJvZHlDb250YWluZXIgPSBlR3JpZC5xdWVyeVNlbGVjdG9yKFwiLmFnLWJvZHktY29udGFpbmVyXCIpO1xyXG4gICAgICAgIHRoaXMuZUJvZHlWaWV3cG9ydCA9IGVHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keS12aWV3cG9ydFwiKTtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyID0gZUdyaWQucXVlcnlTZWxlY3RvcihcIi5hZy1waW5uZWQtY29scy1jb250YWluZXJcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUucmVmcmVzaFZpZXcgPSBmdW5jdGlvbihyZWZyZXNoRnJvbUluZGV4KSB7XHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9udFVzZVNjcm9sbHMoKSkge1xyXG4gICAgICAgIHZhciByb3dDb3VudCA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvd0NvdW50KCk7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lckhlaWdodCA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0hlaWdodCgpICogcm93Q291bnQ7XHJcbiAgICAgICAgdGhpcy5lQm9keUNvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBjb250YWluZXJIZWlnaHQgKyBcInB4XCI7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc0NvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBjb250YWluZXJIZWlnaHQgKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZWZyZXNoQWxsVmlydHVhbFJvd3MocmVmcmVzaEZyb21JbmRleCk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuc29mdFJlZnJlc2hWaWV3ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGZpcnN0ID0gdGhpcy5maXJzdFZpcnR1YWxSZW5kZXJlZFJvdztcclxuICAgIHZhciBsYXN0ID0gdGhpcy5sYXN0VmlydHVhbFJlbmRlcmVkUm93O1xyXG5cclxuICAgIHZhciBjb2x1bW5zID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXREaXNwbGF5ZWRDb2x1bW5zKCk7XHJcbiAgICAvLyBpZiBubyBjb2xzLCBkb24ndCBkcmF3IHJvd1xyXG4gICAgaWYgKCFjb2x1bW5zIHx8IGNvbHVtbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIHJvd0luZGV4ID0gZmlyc3Q7IHJvd0luZGV4IDw9IGxhc3Q7IHJvd0luZGV4KyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvdyhyb3dJbmRleCk7XHJcbiAgICAgICAgaWYgKG5vZGUpIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGNvbEluZGV4ID0gMDsgY29sSW5kZXggPCBjb2x1bW5zLmxlbmd0aDsgY29sSW5kZXgrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbHVtbiA9IGNvbHVtbnNbY29sSW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlbmRlcmVkUm93ID0gdGhpcy5yZW5kZXJlZFJvd3Nbcm93SW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgdmFyIGVHcmlkQ2VsbCA9IHJlbmRlcmVkUm93LmVWb2xhdGlsZUNlbGxzW2NvbHVtbi5jb2xJZF07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFlR3JpZENlbGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaXNGaXJzdENvbHVtbiA9IGNvbEluZGV4ID09PSAwO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNjb3BlID0gcmVuZGVyZWRSb3cuc2NvcGU7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zb2Z0UmVmcmVzaENlbGwoZUdyaWRDZWxsLCBpc0ZpcnN0Q29sdW1uLCBub2RlLCBjb2x1bW4sIHNjb3BlLCByb3dJbmRleCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuc29mdFJlZnJlc2hDZWxsID0gZnVuY3Rpb24oZUdyaWRDZWxsLCBpc0ZpcnN0Q29sdW1uLCBub2RlLCBjb2x1bW4sIHNjb3BlLCByb3dJbmRleCkge1xyXG5cclxuICAgIHV0aWxzLnJlbW92ZUFsbENoaWxkcmVuKGVHcmlkQ2VsbCk7XHJcblxyXG4gICAgdmFyIGRhdGEgPSB0aGlzLmdldERhdGFGb3JOb2RlKG5vZGUpO1xyXG4gICAgdmFyIHZhbHVlR2V0dGVyID0gdGhpcy5jcmVhdGVWYWx1ZUdldHRlcihkYXRhLCBjb2x1bW4uY29sRGVmLCBub2RlKTtcclxuXHJcbiAgICB2YXIgdmFsdWU7XHJcbiAgICBpZiAodmFsdWVHZXR0ZXIpIHtcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlR2V0dGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5wb3B1bGF0ZUFuZFN0eWxlR3JpZENlbGwodmFsdWVHZXR0ZXIsIHZhbHVlLCBlR3JpZENlbGwsIGlzRmlyc3RDb2x1bW4sIG5vZGUsIGNvbHVtbiwgcm93SW5kZXgsIHNjb3BlKTtcclxuXHJcbiAgICAvLyBpZiBhbmd1bGFyIGNvbXBpbGluZywgdGhlbiBuZWVkIHRvIGFsc28gY29tcGlsZSB0aGUgY2VsbCBhZ2FpbiAoYW5ndWxhciBjb21waWxpbmcgc3Vja3MsIHBsZWFzZSB3YWl0Li4uKVxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzQW5ndWxhckNvbXBpbGVSb3dzKCkpIHtcclxuICAgICAgICB0aGlzLiRjb21waWxlKGVHcmlkQ2VsbCkoc2NvcGUpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnJvd0RhdGFDaGFuZ2VkID0gZnVuY3Rpb24ocm93cykge1xyXG4gICAgLy8gd2Ugb25seSBuZWVkIHRvIGJlIHdvcnJpZWQgYWJvdXQgcmVuZGVyZWQgcm93cywgYXMgdGhpcyBtZXRob2QgaXNcclxuICAgIC8vIGNhbGxlZCB0byB3aGF0cyByZW5kZXJlZC4gaWYgdGhlIHJvdyBpc24ndCByZW5kZXJlZCwgd2UgZG9uJ3QgY2FyZVxyXG4gICAgdmFyIGluZGV4ZXNUb1JlbW92ZSA9IFtdO1xyXG4gICAgdmFyIHJlbmRlcmVkUm93cyA9IHRoaXMucmVuZGVyZWRSb3dzO1xyXG4gICAgT2JqZWN0LmtleXMocmVuZGVyZWRSb3dzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIHZhciByZW5kZXJlZFJvdyA9IHJlbmRlcmVkUm93c1trZXldO1xyXG4gICAgICAgIC8vIHNlZSBpZiB0aGUgcmVuZGVyZWQgcm93IGlzIGluIHRoZSBsaXN0IG9mIHJvd3Mgd2UgaGF2ZSB0byB1cGRhdGVcclxuICAgICAgICB2YXIgcm93TmVlZHNVcGRhdGluZyA9IHJvd3MuaW5kZXhPZihyZW5kZXJlZFJvdy5ub2RlLmRhdGEpID49IDA7XHJcbiAgICAgICAgaWYgKHJvd05lZWRzVXBkYXRpbmcpIHtcclxuICAgICAgICAgICAgaW5kZXhlc1RvUmVtb3ZlLnB1c2goa2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIC8vIHJlbW92ZSB0aGUgcm93c1xyXG4gICAgdGhpcy5yZW1vdmVWaXJ0dWFsUm93cyhpbmRleGVzVG9SZW1vdmUpO1xyXG4gICAgLy8gYWRkIGRyYXcgdGhlbSBhZ2FpblxyXG4gICAgdGhpcy5kcmF3VmlydHVhbFJvd3MoKTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5yZWZyZXNoQWxsVmlydHVhbFJvd3MgPSBmdW5jdGlvbihmcm9tSW5kZXgpIHtcclxuICAgIC8vIHJlbW92ZSBhbGwgY3VycmVudCB2aXJ0dWFsIHJvd3MsIGFzIHRoZXkgaGF2ZSBvbGQgZGF0YVxyXG4gICAgdmFyIHJvd3NUb1JlbW92ZSA9IE9iamVjdC5rZXlzKHRoaXMucmVuZGVyZWRSb3dzKTtcclxuICAgIHRoaXMucmVtb3ZlVmlydHVhbFJvd3Mocm93c1RvUmVtb3ZlLCBmcm9tSW5kZXgpO1xyXG5cclxuICAgIC8vIGFkZCBpbiBuZXcgcm93c1xyXG4gICAgdGhpcy5kcmF3VmlydHVhbFJvd3MoKTtcclxufTtcclxuXHJcbi8vIHB1YmxpYyAtIHJlbW92ZXMgdGhlIGdyb3VwIHJvd3MgYW5kIHRoZW4gcmVkcmF3cyB0aGVtIGFnYWluXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5yZWZyZXNoR3JvdXBSb3dzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBmaW5kIGFsbCB0aGUgZ3JvdXAgcm93c1xyXG4gICAgdmFyIHJvd3NUb1JlbW92ZSA9IFtdO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgT2JqZWN0LmtleXModGhpcy5yZW5kZXJlZFJvd3MpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgdmFyIHJlbmRlcmVkUm93ID0gdGhhdC5yZW5kZXJlZFJvd3Nba2V5XTtcclxuICAgICAgICB2YXIgbm9kZSA9IHJlbmRlcmVkUm93Lm5vZGU7XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgcm93c1RvUmVtb3ZlLnB1c2goa2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIC8vIHJlbW92ZSB0aGUgcm93c1xyXG4gICAgdGhpcy5yZW1vdmVWaXJ0dWFsUm93cyhyb3dzVG9SZW1vdmUpO1xyXG4gICAgLy8gYW5kIGRyYXcgdGhlbSBiYWNrIGFnYWluXHJcbiAgICB0aGlzLmVuc3VyZVJvd3NSZW5kZXJlZCgpO1xyXG59O1xyXG5cclxuLy8gdGFrZXMgYXJyYXkgb2Ygcm93IGluZGV4ZXNcclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnJlbW92ZVZpcnR1YWxSb3dzID0gZnVuY3Rpb24ocm93c1RvUmVtb3ZlLCBmcm9tSW5kZXgpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIC8vIGlmIG5vIGZyb21JbmRleCB0aGVuIHNldCB0byAtMSwgd2hpY2ggd2lsbCByZWZyZXNoIGV2ZXJ5dGhpbmdcclxuICAgIHZhciByZWFsRnJvbUluZGV4ID0gKHR5cGVvZiBmcm9tSW5kZXggPT09ICdudW1iZXInKSA/IGZyb21JbmRleCA6IC0xO1xyXG4gICAgcm93c1RvUmVtb3ZlLmZvckVhY2goZnVuY3Rpb24oaW5kZXhUb1JlbW92ZSkge1xyXG4gICAgICAgIGlmIChpbmRleFRvUmVtb3ZlID49IHJlYWxGcm9tSW5kZXgpIHtcclxuICAgICAgICAgICAgdGhhdC5yZW1vdmVWaXJ0dWFsUm93KGluZGV4VG9SZW1vdmUpO1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgdGhlIHJvdyB3YXMgbGFzdCB0byBoYXZlIGZvY3VzLCB3ZSByZW1vdmUgdGhlIGZhY3QgdGhhdCBpdCBoYXMgZm9jdXNcclxuICAgICAgICAgICAgaWYgKHRoYXQuZm9jdXNlZENlbGwgJiYgdGhhdC5mb2N1c2VkQ2VsbC5yb3dJbmRleCA9PSBpbmRleFRvUmVtb3ZlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmZvY3VzZWRDZWxsID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnJlbW92ZVZpcnR1YWxSb3cgPSBmdW5jdGlvbihpbmRleFRvUmVtb3ZlKSB7XHJcbiAgICB2YXIgcmVuZGVyZWRSb3cgPSB0aGlzLnJlbmRlcmVkUm93c1tpbmRleFRvUmVtb3ZlXTtcclxuICAgIGlmIChyZW5kZXJlZFJvdy5waW5uZWRFbGVtZW50ICYmIHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIpIHtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyLnJlbW92ZUNoaWxkKHJlbmRlcmVkUm93LnBpbm5lZEVsZW1lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZW5kZXJlZFJvdy5ib2R5RWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuZUJvZHlDb250YWluZXIucmVtb3ZlQ2hpbGQocmVuZGVyZWRSb3cuYm9keUVsZW1lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZW5kZXJlZFJvdy5zY29wZSkge1xyXG4gICAgICAgIHJlbmRlcmVkUm93LnNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFZpcnR1YWxSb3dSZW1vdmVkKCkpIHtcclxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRWaXJ0dWFsUm93UmVtb3ZlZCgpKHJlbmRlcmVkUm93LmRhdGEsIGluZGV4VG9SZW1vdmUpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hbmd1bGFyR3JpZC5vblZpcnR1YWxSb3dSZW1vdmVkKGluZGV4VG9SZW1vdmUpO1xyXG5cclxuICAgIGRlbGV0ZSB0aGlzLnJlbmRlcmVkUm93c1tpbmRleFRvUmVtb3ZlXTtcclxuICAgIGRlbGV0ZSB0aGlzLnJlbmRlcmVkUm93U3RhcnRFZGl0aW5nTGlzdGVuZXJzW2luZGV4VG9SZW1vdmVdO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmRyYXdWaXJ0dWFsUm93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGZpcnN0O1xyXG4gICAgdmFyIGxhc3Q7XHJcblxyXG4gICAgdmFyIHJvd0NvdW50ID0gdGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93Q291bnQoKTtcclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgZmlyc3QgPSAwO1xyXG4gICAgICAgIGxhc3QgPSByb3dDb3VudDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIHRvcFBpeGVsID0gdGhpcy5lQm9keVZpZXdwb3J0LnNjcm9sbFRvcDtcclxuICAgICAgICB2YXIgYm90dG9tUGl4ZWwgPSB0b3BQaXhlbCArIHRoaXMuZUJvZHlWaWV3cG9ydC5vZmZzZXRIZWlnaHQ7XHJcblxyXG4gICAgICAgIGZpcnN0ID0gTWF0aC5mbG9vcih0b3BQaXhlbCAvIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0hlaWdodCgpKTtcclxuICAgICAgICBsYXN0ID0gTWF0aC5mbG9vcihib3R0b21QaXhlbCAvIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0hlaWdodCgpKTtcclxuXHJcbiAgICAgICAgLy9hZGQgaW4gYnVmZmVyXHJcbiAgICAgICAgdmFyIGJ1ZmZlciA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0J1ZmZlcigpIHx8IGNvbnN0YW50cy5ST1dfQlVGRkVSX1NJWkU7XHJcbiAgICAgICAgZmlyc3QgPSBmaXJzdCAtIGJ1ZmZlcjtcclxuICAgICAgICBsYXN0ID0gbGFzdCArIGJ1ZmZlcjtcclxuXHJcbiAgICAgICAgLy8gYWRqdXN0LCBpbiBjYXNlIGJ1ZmZlciBleHRlbmRlZCBhY3R1YWwgc2l6ZVxyXG4gICAgICAgIGlmIChmaXJzdCA8IDApIHtcclxuICAgICAgICAgICAgZmlyc3QgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobGFzdCA+IHJvd0NvdW50IC0gMSkge1xyXG4gICAgICAgICAgICBsYXN0ID0gcm93Q291bnQgLSAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmZpcnN0VmlydHVhbFJlbmRlcmVkUm93ID0gZmlyc3Q7XHJcbiAgICB0aGlzLmxhc3RWaXJ0dWFsUmVuZGVyZWRSb3cgPSBsYXN0O1xyXG5cclxuICAgIHRoaXMuZW5zdXJlUm93c1JlbmRlcmVkKCk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuZ2V0Rmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3cgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmZpcnN0VmlydHVhbFJlbmRlcmVkUm93O1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmdldExhc3RWaXJ0dWFsUmVuZGVyZWRSb3cgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmxhc3RWaXJ0dWFsUmVuZGVyZWRSb3c7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuZW5zdXJlUm93c1JlbmRlcmVkID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIG1haW5Sb3dXaWR0aCA9IHRoaXMuY29sdW1uTW9kZWwuZ2V0Qm9keUNvbnRhaW5lcldpZHRoKCk7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgLy8gYXQgdGhlIGVuZCwgdGhpcyBhcnJheSB3aWxsIGNvbnRhaW4gdGhlIGl0ZW1zIHdlIG5lZWQgdG8gcmVtb3ZlXHJcbiAgICB2YXIgcm93c1RvUmVtb3ZlID0gT2JqZWN0LmtleXModGhpcy5yZW5kZXJlZFJvd3MpO1xyXG5cclxuICAgIC8vIGFkZCBpbiBuZXcgcm93c1xyXG4gICAgZm9yICh2YXIgcm93SW5kZXggPSB0aGlzLmZpcnN0VmlydHVhbFJlbmRlcmVkUm93OyByb3dJbmRleCA8PSB0aGlzLmxhc3RWaXJ0dWFsUmVuZGVyZWRSb3c7IHJvd0luZGV4KyspIHtcclxuICAgICAgICAvLyBzZWUgaWYgaXRlbSBhbHJlYWR5IHRoZXJlLCBhbmQgaWYgeWVzLCB0YWtlIGl0IG91dCBvZiB0aGUgJ3RvIHJlbW92ZScgYXJyYXlcclxuICAgICAgICBpZiAocm93c1RvUmVtb3ZlLmluZGV4T2Yocm93SW5kZXgudG9TdHJpbmcoKSkgPj0gMCkge1xyXG4gICAgICAgICAgICByb3dzVG9SZW1vdmUuc3BsaWNlKHJvd3NUb1JlbW92ZS5pbmRleE9mKHJvd0luZGV4LnRvU3RyaW5nKCkpLCAxKTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNoZWNrIHRoaXMgcm93IGFjdHVhbGx5IGV4aXN0cyAoaW4gY2FzZSBvdmVyZmxvdyBidWZmZXIgd2luZG93IGV4Y2VlZHMgcmVhbCBkYXRhKVxyXG4gICAgICAgIHZhciBub2RlID0gdGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93KHJvd0luZGV4KTtcclxuICAgICAgICBpZiAobm9kZSkge1xyXG4gICAgICAgICAgICB0aGF0Lmluc2VydFJvdyhub2RlLCByb3dJbmRleCwgbWFpblJvd1dpZHRoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYXQgdGhpcyBwb2ludCwgZXZlcnl0aGluZyBpbiBvdXIgJ3Jvd3NUb1JlbW92ZScgLiAuIC5cclxuICAgIHRoaXMucmVtb3ZlVmlydHVhbFJvd3Mocm93c1RvUmVtb3ZlKTtcclxuXHJcbiAgICAvLyBpZiB3ZSBhcmUgZG9pbmcgYW5ndWxhciBjb21waWxpbmcsIHRoZW4gZG8gZGlnZXN0IHRoZSBzY29wZSBoZXJlXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNBbmd1bGFyQ29tcGlsZVJvd3MoKSkge1xyXG4gICAgICAgIC8vIHdlIGRvIGl0IGluIGEgdGltZW91dCwgaW4gY2FzZSB3ZSBhcmUgYWxyZWFkeSBpbiBhbiBhcHBseVxyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH0sIDApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmluc2VydFJvdyA9IGZ1bmN0aW9uKG5vZGUsIHJvd0luZGV4LCBtYWluUm93V2lkdGgpIHtcclxuICAgIHZhciBjb2x1bW5zID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXREaXNwbGF5ZWRDb2x1bW5zKCk7XHJcbiAgICAvLyBpZiBubyBjb2xzLCBkb24ndCBkcmF3IHJvd1xyXG4gICAgaWYgKCFjb2x1bW5zIHx8IGNvbHVtbnMubGVuZ3RoID09IDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdmFyIHJvd0RhdGEgPSBub2RlLnJvd0RhdGE7XHJcbiAgICB2YXIgcm93SXNBR3JvdXAgPSBub2RlLmdyb3VwO1xyXG5cclxuICAgIC8vIHRyeSBjb21waWxpbmcgYXMgd2UgaW5zZXJ0IHJvd3NcclxuICAgIHZhciBuZXdDaGlsZFNjb3BlID0gdGhpcy5jcmVhdGVDaGlsZFNjb3BlT3JOdWxsKG5vZGUuZGF0YSk7XHJcblxyXG4gICAgdmFyIGVQaW5uZWRSb3cgPSB0aGlzLmNyZWF0ZVJvd0NvbnRhaW5lcihyb3dJbmRleCwgbm9kZSwgcm93SXNBR3JvdXAsIG5ld0NoaWxkU2NvcGUpO1xyXG4gICAgdmFyIGVNYWluUm93ID0gdGhpcy5jcmVhdGVSb3dDb250YWluZXIocm93SW5kZXgsIG5vZGUsIHJvd0lzQUdyb3VwLCBuZXdDaGlsZFNjb3BlKTtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICBlTWFpblJvdy5zdHlsZS53aWR0aCA9IG1haW5Sb3dXaWR0aCArIFwicHhcIjtcclxuXHJcbiAgICB2YXIgcmVuZGVyZWRSb3cgPSB7XHJcbiAgICAgICAgc2NvcGU6IG5ld0NoaWxkU2NvcGUsXHJcbiAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgZUNlbGxzOiB7fSxcclxuICAgICAgICBlVm9sYXRpbGVDZWxsczoge31cclxuICAgIH07XHJcbiAgICB0aGlzLnJlbmRlcmVkUm93c1tyb3dJbmRleF0gPSByZW5kZXJlZFJvdztcclxuICAgIHRoaXMucmVuZGVyZWRSb3dTdGFydEVkaXRpbmdMaXN0ZW5lcnNbcm93SW5kZXhdID0ge307XHJcblxyXG4gICAgLy8gaWYgZ3JvdXAgaXRlbSwgaW5zZXJ0IHRoZSBmaXJzdCByb3dcclxuICAgIHZhciBncm91cEhlYWRlclRha2VzRW50aXJlUm93ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cFVzZUVudGlyZVJvdygpO1xyXG4gICAgdmFyIGRyYXdHcm91cFJvdyA9IHJvd0lzQUdyb3VwICYmIGdyb3VwSGVhZGVyVGFrZXNFbnRpcmVSb3c7XHJcblxyXG4gICAgaWYgKGRyYXdHcm91cFJvdykge1xyXG4gICAgICAgIHZhciBmaXJzdENvbHVtbiA9IGNvbHVtbnNbMF07XHJcblxyXG4gICAgICAgIHZhciBlR3JvdXBSb3cgPSB0aGF0LmNyZWF0ZUdyb3VwRWxlbWVudChub2RlLCByb3dJbmRleCwgZmFsc2UpO1xyXG4gICAgICAgIGlmIChmaXJzdENvbHVtbi5waW5uZWQpIHtcclxuICAgICAgICAgICAgZVBpbm5lZFJvdy5hcHBlbmRDaGlsZChlR3JvdXBSb3cpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGVHcm91cFJvd1BhZGRpbmcgPSB0aGF0LmNyZWF0ZUdyb3VwRWxlbWVudChub2RlLCByb3dJbmRleCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIGVNYWluUm93LmFwcGVuZENoaWxkKGVHcm91cFJvd1BhZGRpbmcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVNYWluUm93LmFwcGVuZENoaWxkKGVHcm91cFJvdyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIGNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbihjb2x1bW4sIGluZGV4KSB7XHJcbiAgICAgICAgICAgIHZhciBmaXJzdENvbCA9IGluZGV4ID09PSAwO1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoYXQuZ2V0RGF0YUZvck5vZGUobm9kZSk7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZUdldHRlciA9IHRoYXQuY3JlYXRlVmFsdWVHZXR0ZXIoZGF0YSwgY29sdW1uLmNvbERlZiwgbm9kZSk7XHJcbiAgICAgICAgICAgIHRoYXQuY3JlYXRlQ2VsbEZyb21Db2xEZWYoZmlyc3RDb2wsIGNvbHVtbiwgdmFsdWVHZXR0ZXIsIG5vZGUsIHJvd0luZGV4LCBlTWFpblJvdywgZVBpbm5lZFJvdywgbmV3Q2hpbGRTY29wZSwgcmVuZGVyZWRSb3cpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vdHJ5IGNvbXBpbGluZyBhcyB3ZSBpbnNlcnQgcm93c1xyXG4gICAgcmVuZGVyZWRSb3cucGlubmVkRWxlbWVudCA9IHRoaXMuY29tcGlsZUFuZEFkZCh0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyLCByb3dJbmRleCwgZVBpbm5lZFJvdywgbmV3Q2hpbGRTY29wZSk7XHJcbiAgICByZW5kZXJlZFJvdy5ib2R5RWxlbWVudCA9IHRoaXMuY29tcGlsZUFuZEFkZCh0aGlzLmVCb2R5Q29udGFpbmVyLCByb3dJbmRleCwgZU1haW5Sb3csIG5ld0NoaWxkU2NvcGUpO1xyXG59O1xyXG5cclxuLy8gaWYgZ3JvdXAgaXMgYSBmb290ZXIsIGFsd2F5cyBzaG93IHRoZSBkYXRhLlxyXG4vLyBpZiBncm91cCBpcyBhIGhlYWRlciwgb25seSBzaG93IGRhdGEgaWYgbm90IGV4cGFuZGVkXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5nZXREYXRhRm9yTm9kZSA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIGlmIChub2RlLmZvb3Rlcikge1xyXG4gICAgICAgIC8vIGlmIGZvb3Rlciwgd2UgYWx3YXlzIHNob3cgdGhlIGRhdGFcclxuICAgICAgICByZXR1cm4gbm9kZS5kYXRhO1xyXG4gICAgfSBlbHNlIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgLy8gaWYgaGVhZGVyIGFuZCBoZWFkZXIgaXMgZXhwYW5kZWQsIHdlIHNob3cgZGF0YSBpbiBmb290ZXIgb25seVxyXG4gICAgICAgIHZhciBmb290ZXJzRW5hYmxlZCA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBJbmNsdWRlRm9vdGVyKCk7XHJcbiAgICAgICAgcmV0dXJuIChub2RlLmV4cGFuZGVkICYmIGZvb3RlcnNFbmFibGVkKSA/IHVuZGVmaW5lZCA6IG5vZGUuZGF0YTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlIGl0J3MgYSBub3JtYWwgbm9kZSwganVzdCByZXR1cm4gZGF0YSBhcyBub3JtYWxcclxuICAgICAgICByZXR1cm4gbm9kZS5kYXRhO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmNyZWF0ZVZhbHVlR2V0dGVyID0gZnVuY3Rpb24oZGF0YSwgY29sRGVmLCBub2RlKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGFwaSA9IHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpO1xyXG4gICAgICAgIHZhciBjb250ZXh0ID0gdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpO1xyXG4gICAgICAgIHJldHVybiB1dGlscy5nZXRWYWx1ZSh0aGF0LmV4cHJlc3Npb25TZXJ2aWNlLCBkYXRhLCBjb2xEZWYsIG5vZGUsIGFwaSwgY29udGV4dCk7XHJcbiAgICB9O1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmNyZWF0ZUNoaWxkU2NvcGVPck51bGwgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNBbmd1bGFyQ29tcGlsZVJvd3MoKSkge1xyXG4gICAgICAgIHZhciBuZXdDaGlsZFNjb3BlID0gdGhpcy4kc2NvcGUuJG5ldygpO1xyXG4gICAgICAgIG5ld0NoaWxkU2NvcGUuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgcmV0dXJuIG5ld0NoaWxkU2NvcGU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmNvbXBpbGVBbmRBZGQgPSBmdW5jdGlvbihjb250YWluZXIsIHJvd0luZGV4LCBlbGVtZW50LCBzY29wZSkge1xyXG4gICAgaWYgKHNjb3BlKSB7XHJcbiAgICAgICAgdmFyIGVFbGVtZW50Q29tcGlsZWQgPSB0aGlzLiRjb21waWxlKGVsZW1lbnQpKHNjb3BlKTtcclxuICAgICAgICBpZiAoY29udGFpbmVyKSB7IC8vIGNoZWNraW5nIGNvbnRhaW5lciwgYXMgaWYgbm9TY3JvbGwsIHBpbm5lZCBjb250YWluZXIgaXMgbWlzc2luZ1xyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZUVsZW1lbnRDb21waWxlZFswXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBlRWxlbWVudENvbXBpbGVkWzBdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoY29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlQ2VsbEZyb21Db2xEZWYgPSBmdW5jdGlvbihpc0ZpcnN0Q29sdW1uLCBjb2x1bW4sIHZhbHVlR2V0dGVyLCBub2RlLCByb3dJbmRleCwgZU1haW5Sb3csIGVQaW5uZWRSb3csICRjaGlsZFNjb3BlLCByZW5kZXJlZFJvdykge1xyXG4gICAgdmFyIGVHcmlkQ2VsbCA9IHRoaXMuY3JlYXRlQ2VsbChpc0ZpcnN0Q29sdW1uLCBjb2x1bW4sIHZhbHVlR2V0dGVyLCBub2RlLCByb3dJbmRleCwgJGNoaWxkU2NvcGUpO1xyXG5cclxuICAgIGlmIChjb2x1bW4uY29sRGVmLnZvbGF0aWxlKSB7XHJcbiAgICAgICAgcmVuZGVyZWRSb3cuZVZvbGF0aWxlQ2VsbHNbY29sdW1uLmNvbElkXSA9IGVHcmlkQ2VsbDtcclxuICAgIH1cclxuICAgIHJlbmRlcmVkUm93LmVDZWxsc1tjb2x1bW4uY29sSWRdID0gZUdyaWRDZWxsO1xyXG5cclxuICAgIGlmIChjb2x1bW4ucGlubmVkKSB7XHJcbiAgICAgICAgZVBpbm5lZFJvdy5hcHBlbmRDaGlsZChlR3JpZENlbGwpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBlTWFpblJvdy5hcHBlbmRDaGlsZChlR3JpZENlbGwpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmFkZENsYXNzZXNUb1JvdyA9IGZ1bmN0aW9uKHJvd0luZGV4LCBub2RlLCBlUm93KSB7XHJcbiAgICB2YXIgY2xhc3Nlc0xpc3QgPSBbXCJhZy1yb3dcIl07XHJcbiAgICBjbGFzc2VzTGlzdC5wdXNoKHJvd0luZGV4ICUgMiA9PSAwID8gXCJhZy1yb3ctZXZlblwiIDogXCJhZy1yb3ctb2RkXCIpO1xyXG5cclxuICAgIGlmICh0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIuaXNOb2RlU2VsZWN0ZWQobm9kZSkpIHtcclxuICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LXNlbGVjdGVkXCIpO1xyXG4gICAgfVxyXG4gICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAvLyBpZiBhIGdyb3VwLCBwdXQgdGhlIGxldmVsIG9mIHRoZSBncm91cCBpblxyXG4gICAgICAgIGNsYXNzZXNMaXN0LnB1c2goXCJhZy1yb3ctbGV2ZWwtXCIgKyBub2RlLmxldmVsKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gaWYgYSBsZWFmLCBhbmQgYSBwYXJlbnQgZXhpc3RzLCBwdXQgYSBsZXZlbCBvZiB0aGUgcGFyZW50LCBlbHNlIHB1dCBsZXZlbCBvZiAwIGZvciB0b3AgbGV2ZWwgaXRlbVxyXG4gICAgICAgIGlmIChub2RlLnBhcmVudCkge1xyXG4gICAgICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LWxldmVsLVwiICsgKG5vZGUucGFyZW50LmxldmVsICsgMSkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNsYXNzZXNMaXN0LnB1c2goXCJhZy1yb3ctbGV2ZWwtMFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAobm9kZS5ncm91cCkge1xyXG4gICAgICAgIGNsYXNzZXNMaXN0LnB1c2goXCJhZy1yb3ctZ3JvdXBcIik7XHJcbiAgICB9XHJcbiAgICBpZiAobm9kZS5ncm91cCAmJiAhbm9kZS5mb290ZXIgJiYgbm9kZS5leHBhbmRlZCkge1xyXG4gICAgICAgIGNsYXNzZXNMaXN0LnB1c2goXCJhZy1yb3ctZ3JvdXAtZXhwYW5kZWRcIik7XHJcbiAgICB9XHJcbiAgICBpZiAobm9kZS5ncm91cCAmJiAhbm9kZS5mb290ZXIgJiYgIW5vZGUuZXhwYW5kZWQpIHtcclxuICAgICAgICAvLyBvcHBvc2l0ZSBvZiBleHBhbmRlZCBpcyBjb250cmFjdGVkIGFjY29yZGluZyB0byB0aGUgaW50ZXJuZXQuXHJcbiAgICAgICAgY2xhc3Nlc0xpc3QucHVzaChcImFnLXJvdy1ncm91cC1jb250cmFjdGVkXCIpO1xyXG4gICAgfVxyXG4gICAgaWYgKG5vZGUuZ3JvdXAgJiYgbm9kZS5mb290ZXIpIHtcclxuICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LWZvb3RlclwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhZGQgaW4gZXh0cmEgY2xhc3NlcyBwcm92aWRlZCBieSB0aGUgY29uZmlnXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93Q2xhc3MoKSkge1xyXG4gICAgICAgIHZhciBwYXJhbXMgPSB7XHJcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgcm93SW5kZXg6IHJvd0luZGV4LFxyXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCksXHJcbiAgICAgICAgICAgIGFwaTogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKClcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBleHRyYVJvd0NsYXNzZXMgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dDbGFzcygpKHBhcmFtcyk7XHJcbiAgICAgICAgaWYgKGV4dHJhUm93Q2xhc3Nlcykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGV4dHJhUm93Q2xhc3NlcyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIGNsYXNzZXNMaXN0LnB1c2goZXh0cmFSb3dDbGFzc2VzKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGV4dHJhUm93Q2xhc3NlcykpIHtcclxuICAgICAgICAgICAgICAgIGV4dHJhUm93Q2xhc3Nlcy5mb3JFYWNoKGZ1bmN0aW9uKGNsYXNzSXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzZXNMaXN0LnB1c2goY2xhc3NJdGVtKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBjbGFzc2VzID0gY2xhc3Nlc0xpc3Quam9pbihcIiBcIik7XHJcblxyXG4gICAgZVJvdy5jbGFzc05hbWUgPSBjbGFzc2VzO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmNyZWF0ZVJvd0NvbnRhaW5lciA9IGZ1bmN0aW9uKHJvd0luZGV4LCBub2RlLCBncm91cFJvdywgJHNjb3BlKSB7XHJcbiAgICB2YXIgZVJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcblxyXG4gICAgdGhpcy5hZGRDbGFzc2VzVG9Sb3cocm93SW5kZXgsIG5vZGUsIGVSb3cpO1xyXG5cclxuICAgIGVSb3cuc2V0QXR0cmlidXRlKCdyb3cnLCByb3dJbmRleCk7XHJcblxyXG4gICAgLy8gaWYgc2hvd2luZyBzY3JvbGxzLCBwb3NpdGlvbiBvbiB0aGUgY29udGFpbmVyXHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9udFVzZVNjcm9sbHMoKSkge1xyXG4gICAgICAgIGVSb3cuc3R5bGUudG9wID0gKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0hlaWdodCgpICogcm93SW5kZXgpICsgXCJweFwiO1xyXG4gICAgfVxyXG4gICAgZVJvdy5zdHlsZS5oZWlnaHQgPSAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93SGVpZ2h0KCkpICsgXCJweFwiO1xyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dTdHlsZSgpKSB7XHJcbiAgICAgICAgdmFyIGNzc1RvVXNlO1xyXG4gICAgICAgIHZhciByb3dTdHlsZSA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd1N0eWxlKCk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiByb3dTdHlsZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgICAgIGFwaTogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKCksXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0OiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCksXHJcbiAgICAgICAgICAgICAgICAkc2NvcGU6ICRzY29wZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjc3NUb1VzZSA9IHJvd1N0eWxlKHBhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3NzVG9Vc2UgPSByb3dTdHlsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjc3NUb1VzZSkge1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjc3NUb1VzZSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgICAgIGVSb3cuc3R5bGVba2V5XSA9IGNzc1RvVXNlW2tleV07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgZVJvdy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBfdGhpcy5hbmd1bGFyR3JpZC5vblJvd0NsaWNrZWQoZXZlbnQsIE51bWJlcih0aGlzLmdldEF0dHJpYnV0ZShcInJvd1wiKSksIG5vZGUpXHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gZVJvdztcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5nZXRJbmRleE9mUmVuZGVyZWROb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIHJlbmRlcmVkUm93cyA9IHRoaXMucmVuZGVyZWRSb3dzO1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyZW5kZXJlZFJvd3MpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHJlbmRlcmVkUm93c1trZXlzW2ldXS5ub2RlID09PSBub2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJlZFJvd3Nba2V5c1tpXV0ucm93SW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIC0xO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmNyZWF0ZUdyb3VwRWxlbWVudCA9IGZ1bmN0aW9uKG5vZGUsIHJvd0luZGV4LCBwYWRkaW5nKSB7XHJcbiAgICB2YXIgZVJvdztcclxuICAgIC8vIHBhZGRpbmcgbWVhbnMgd2UgYXJlIG9uIHRoZSByaWdodCBoYW5kIHNpZGUgb2YgYSBwaW5uZWQgdGFibGUsIGllXHJcbiAgICAvLyBpbiB0aGUgbWFpbiBib2R5LlxyXG4gICAgaWYgKHBhZGRpbmcpIHtcclxuICAgICAgICBlUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKSxcclxuICAgICAgICAgICAgY29sRGVmOiB7XHJcbiAgICAgICAgICAgICAgICBjZWxsUmVuZGVyZXI6IHtcclxuICAgICAgICAgICAgICAgICAgICByZW5kZXJlcjogJ2dyb3VwJyxcclxuICAgICAgICAgICAgICAgICAgICBpbm5lclJlbmRlcmVyOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcm91cElubmVyUmVuZGVyZXIoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBlUm93ID0gdGhpcy5jZWxsUmVuZGVyZXJNYXBbJ2dyb3VwJ10ocGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobm9kZS5mb290ZXIpIHtcclxuICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhlUm93LCAnYWctZm9vdGVyLWNlbGwtZW50aXJlLXJvdycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhlUm93LCAnYWctZ3JvdXAtY2VsbC1lbnRpcmUtcm93Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVSb3c7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUucHV0RGF0YUludG9DZWxsID0gZnVuY3Rpb24oY29sdW1uLCB2YWx1ZSwgdmFsdWVHZXR0ZXIsIG5vZGUsICRjaGlsZFNjb3BlLCBlU3BhbldpdGhWYWx1ZSwgZUdyaWRDZWxsLCByb3dJbmRleCwgcmVmcmVzaENlbGxGdW5jdGlvbikge1xyXG4gICAgLy8gdGVtcGxhdGUgZ2V0cyBwcmVmZXJlbmNlLCB0aGVuIGNlbGxSZW5kZXJlciwgdGhlbiBkbyBpdCBvdXJzZWx2ZXNcclxuICAgIHZhciBjb2xEZWYgPSBjb2x1bW4uY29sRGVmO1xyXG4gICAgaWYgKGNvbERlZi50ZW1wbGF0ZSkge1xyXG4gICAgICAgIGVTcGFuV2l0aFZhbHVlLmlubmVySFRNTCA9IGNvbERlZi50ZW1wbGF0ZTtcclxuICAgIH0gZWxzZSBpZiAoY29sRGVmLnRlbXBsYXRlVXJsKSB7XHJcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZVNlcnZpY2UuZ2V0VGVtcGxhdGUoY29sRGVmLnRlbXBsYXRlVXJsLCByZWZyZXNoQ2VsbEZ1bmN0aW9uKTtcclxuICAgICAgICBpZiAodGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgZVNwYW5XaXRoVmFsdWUuaW5uZXJIVE1MID0gdGVtcGxhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChjb2xEZWYuY2VsbFJlbmRlcmVyKSB7XHJcbiAgICAgICAgdGhpcy51c2VDZWxsUmVuZGVyZXIoY29sdW1uLCB2YWx1ZSwgbm9kZSwgJGNoaWxkU2NvcGUsIGVTcGFuV2l0aFZhbHVlLCByb3dJbmRleCwgcmVmcmVzaENlbGxGdW5jdGlvbiwgdmFsdWVHZXR0ZXIsIGVHcmlkQ2VsbCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGlmIHdlIGluc2VydCB1bmRlZmluZWQsIHRoZW4gaXQgZGlzcGxheXMgYXMgdGhlIHN0cmluZyAndW5kZWZpbmVkJywgdWdseSFcclxuICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gJycpIHtcclxuICAgICAgICAgICAgZVNwYW5XaXRoVmFsdWUuaW5uZXJIVE1MID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnVzZUNlbGxSZW5kZXJlciA9IGZ1bmN0aW9uKGNvbHVtbiwgdmFsdWUsIG5vZGUsICRjaGlsZFNjb3BlLCBlU3BhbldpdGhWYWx1ZSwgcm93SW5kZXgsIHJlZnJlc2hDZWxsRnVuY3Rpb24sIHZhbHVlR2V0dGVyLCBlR3JpZENlbGwpIHtcclxuICAgIHZhciBjb2xEZWYgPSBjb2x1bW4uY29sRGVmO1xyXG4gICAgdmFyIHJlbmRlcmVyUGFyYW1zID0ge1xyXG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICB2YWx1ZUdldHRlcjogdmFsdWVHZXR0ZXIsXHJcbiAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgY29sdW1uOiBjb2x1bW4sXHJcbiAgICAgICAgJHNjb3BlOiAkY2hpbGRTY29wZSxcclxuICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKSxcclxuICAgICAgICBjb250ZXh0OiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCksXHJcbiAgICAgICAgcmVmcmVzaENlbGw6IHJlZnJlc2hDZWxsRnVuY3Rpb24sXHJcbiAgICAgICAgZUdyaWRDZWxsOiBlR3JpZENlbGxcclxuICAgIH07XHJcbiAgICB2YXIgY2VsbFJlbmRlcmVyO1xyXG4gICAgaWYgKHR5cGVvZiBjb2xEZWYuY2VsbFJlbmRlcmVyID09PSAnb2JqZWN0JyAmJiBjb2xEZWYuY2VsbFJlbmRlcmVyICE9PSBudWxsKSB7XHJcbiAgICAgICAgY2VsbFJlbmRlcmVyID0gdGhpcy5jZWxsUmVuZGVyZXJNYXBbY29sRGVmLmNlbGxSZW5kZXJlci5yZW5kZXJlcl07XHJcbiAgICAgICAgaWYgKCFjZWxsUmVuZGVyZXIpIHtcclxuICAgICAgICAgICAgdGhyb3cgJ0NlbGwgcmVuZGVyZXIgJyArIGNvbERlZi5jZWxsUmVuZGVyZXIgKyAnIG5vdCBmb3VuZCwgYXZhaWxhYmxlIGFyZSAnICsgT2JqZWN0LmtleXModGhpcy5jZWxsUmVuZGVyZXJNYXApO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbERlZi5jZWxsUmVuZGVyZXIgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBjZWxsUmVuZGVyZXIgPSBjb2xEZWYuY2VsbFJlbmRlcmVyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aHJvdyAnQ2VsbCBSZW5kZXJlciBtdXN0IGJlIFN0cmluZyBvciBGdW5jdGlvbic7XHJcbiAgICB9XHJcbiAgICB2YXIgcmVzdWx0RnJvbVJlbmRlcmVyID0gY2VsbFJlbmRlcmVyKHJlbmRlcmVyUGFyYW1zKTtcclxuICAgIGlmICh1dGlscy5pc05vZGVPckVsZW1lbnQocmVzdWx0RnJvbVJlbmRlcmVyKSkge1xyXG4gICAgICAgIC8vIGEgZG9tIG5vZGUgb3IgZWxlbWVudCB3YXMgcmV0dXJuZWQsIHNvIGFkZCBjaGlsZFxyXG4gICAgICAgIGVTcGFuV2l0aFZhbHVlLmFwcGVuZENoaWxkKHJlc3VsdEZyb21SZW5kZXJlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIG90aGVyd2lzZSBhc3N1bWUgaXQgd2FzIGh0bWwsIHNvIGp1c3QgaW5zZXJ0XHJcbiAgICAgICAgZVNwYW5XaXRoVmFsdWUuaW5uZXJIVE1MID0gcmVzdWx0RnJvbVJlbmRlcmVyO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmFkZFN0eWxlc0Zyb21Db2xsRGVmID0gZnVuY3Rpb24oY29sdW1uLCB2YWx1ZSwgbm9kZSwgJGNoaWxkU2NvcGUsIGVHcmlkQ2VsbCkge1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcbiAgICBpZiAoY29sRGVmLmNlbGxTdHlsZSkge1xyXG4gICAgICAgIHZhciBjc3NUb1VzZTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbERlZi5jZWxsU3R5bGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdmFyIGNlbGxTdHlsZVBhcmFtcyA9IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgICAgIGNvbHVtbjogY29sdW1uLFxyXG4gICAgICAgICAgICAgICAgJHNjb3BlOiAkY2hpbGRTY29wZSxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKSxcclxuICAgICAgICAgICAgICAgIGFwaTogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY3NzVG9Vc2UgPSBjb2xEZWYuY2VsbFN0eWxlKGNlbGxTdHlsZVBhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3NzVG9Vc2UgPSBjb2xEZWYuY2VsbFN0eWxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNzc1RvVXNlKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNzc1RvVXNlKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICAgICAgZUdyaWRDZWxsLnN0eWxlW2tleV0gPSBjc3NUb1VzZVtrZXldO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuYWRkQ2xhc3Nlc0Zyb21Db2xsRGVmID0gZnVuY3Rpb24oY29sRGVmLCB2YWx1ZSwgbm9kZSwgJGNoaWxkU2NvcGUsIGVHcmlkQ2VsbCkge1xyXG4gICAgaWYgKGNvbERlZi5jZWxsQ2xhc3MpIHtcclxuICAgICAgICB2YXIgY2xhc3NUb1VzZTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbERlZi5jZWxsQ2xhc3MgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdmFyIGNlbGxDbGFzc1BhcmFtcyA9IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgICAgICRzY29wZTogJGNoaWxkU2NvcGUsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0OiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCksXHJcbiAgICAgICAgICAgICAgICBhcGk6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNsYXNzVG9Vc2UgPSBjb2xEZWYuY2VsbENsYXNzKGNlbGxDbGFzc1BhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2xhc3NUb1VzZSA9IGNvbERlZi5jZWxsQ2xhc3M7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIGNsYXNzVG9Vc2UgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHV0aWxzLmFkZENzc0NsYXNzKGVHcmlkQ2VsbCwgY2xhc3NUb1VzZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGNsYXNzVG9Vc2UpKSB7XHJcbiAgICAgICAgICAgIGNsYXNzVG9Vc2UuZm9yRWFjaChmdW5jdGlvbihjc3NDbGFzc0l0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHV0aWxzLmFkZENzc0NsYXNzKGVHcmlkQ2VsbCwgY3NzQ2xhc3NJdGVtKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmFkZENsYXNzZXNUb0NlbGwgPSBmdW5jdGlvbihjb2x1bW4sIG5vZGUsIGVHcmlkQ2VsbCkge1xyXG4gICAgdmFyIGNsYXNzZXMgPSBbJ2FnLWNlbGwnLCAnYWctY2VsbC1uby1mb2N1cycsICdjZWxsLWNvbC0nICsgY29sdW1uLmluZGV4XTtcclxuICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgaWYgKG5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgICAgIGNsYXNzZXMucHVzaCgnYWctZm9vdGVyLWNlbGwnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjbGFzc2VzLnB1c2goJ2FnLWdyb3VwLWNlbGwnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlR3JpZENlbGwuY2xhc3NOYW1lID0gY2xhc3Nlcy5qb2luKCcgJyk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuYWRkQ2xhc3Nlc0Zyb21SdWxlcyA9IGZ1bmN0aW9uKGNvbERlZiwgZUdyaWRDZWxsLCB2YWx1ZSwgbm9kZSwgcm93SW5kZXgpIHtcclxuICAgIHZhciBjbGFzc1J1bGVzID0gY29sRGVmLmNlbGxDbGFzc1J1bGVzO1xyXG4gICAgaWYgKHR5cGVvZiBjbGFzc1J1bGVzID09PSAnb2JqZWN0JyAmJiBjbGFzc1J1bGVzICE9PSBudWxsKSB7XHJcblxyXG4gICAgICAgIHZhciBwYXJhbXMgPSB7XHJcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgcm93SW5kZXg6IHJvd0luZGV4LFxyXG4gICAgICAgICAgICBhcGk6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpLFxyXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KClcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgY2xhc3NOYW1lcyA9IE9iamVjdC5rZXlzKGNsYXNzUnVsZXMpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3NOYW1lcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gY2xhc3NOYW1lc1tpXTtcclxuICAgICAgICAgICAgdmFyIHJ1bGUgPSBjbGFzc1J1bGVzW2NsYXNzTmFtZV07XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRPZlJ1bGU7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcnVsZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdE9mUnVsZSA9IHRoaXMuZXhwcmVzc2lvblNlcnZpY2UuZXZhbHVhdGUocnVsZSwgcGFyYW1zKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcnVsZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0T2ZSdWxlID0gcnVsZShwYXJhbXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHRPZlJ1bGUpIHtcclxuICAgICAgICAgICAgICAgIHV0aWxzLmFkZENzc0NsYXNzKGVHcmlkQ2VsbCwgY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHV0aWxzLnJlbW92ZUNzc0NsYXNzKGVHcmlkQ2VsbCwgY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVDZWxsID0gZnVuY3Rpb24oaXNGaXJzdENvbHVtbiwgY29sdW1uLCB2YWx1ZUdldHRlciwgbm9kZSwgcm93SW5kZXgsICRjaGlsZFNjb3BlKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB2YXIgZUdyaWRDZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIGVHcmlkQ2VsbC5zZXRBdHRyaWJ1dGUoXCJjb2xcIiwgY29sdW1uLmluZGV4KTtcclxuXHJcbiAgICAvLyBvbmx5IHNldCB0YWIgaW5kZXggaWYgY2VsbCBzZWxlY3Rpb24gaXMgZW5hYmxlZFxyXG4gICAgaWYgKCF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc1N1cHByZXNzQ2VsbFNlbGVjdGlvbigpKSB7XHJcbiAgICAgICAgZUdyaWRDZWxsLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIFwiLTFcIik7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHZhbHVlO1xyXG4gICAgaWYgKHZhbHVlR2V0dGVyKSB7XHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZUdldHRlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoZXNlIGFyZSB0aGUgZ3JpZCBzdHlsZXMsIGRvbid0IGNoYW5nZSBiZXR3ZWVuIHNvZnQgcmVmcmVzaGVzXHJcbiAgICB0aGlzLmFkZENsYXNzZXNUb0NlbGwoY29sdW1uLCBub2RlLCBlR3JpZENlbGwpO1xyXG5cclxuICAgIHRoaXMucG9wdWxhdGVBbmRTdHlsZUdyaWRDZWxsKHZhbHVlR2V0dGVyLCB2YWx1ZSwgZUdyaWRDZWxsLCBpc0ZpcnN0Q29sdW1uLCBub2RlLCBjb2x1bW4sIHJvd0luZGV4LCAkY2hpbGRTY29wZSk7XHJcblxyXG4gICAgdGhpcy5hZGRDZWxsQ2xpY2tlZEhhbmRsZXIoZUdyaWRDZWxsLCBub2RlLCBjb2x1bW4sIHZhbHVlLCByb3dJbmRleCk7XHJcbiAgICB0aGlzLmFkZENlbGxEb3VibGVDbGlja2VkSGFuZGxlcihlR3JpZENlbGwsIG5vZGUsIGNvbHVtbiwgdmFsdWUsIHJvd0luZGV4LCAkY2hpbGRTY29wZSwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpO1xyXG5cclxuICAgIHRoaXMuYWRkQ2VsbE5hdmlnYXRpb25IYW5kbGVyKGVHcmlkQ2VsbCwgcm93SW5kZXgsIGNvbHVtbiwgbm9kZSk7XHJcblxyXG4gICAgZUdyaWRDZWxsLnN0eWxlLndpZHRoID0gdXRpbHMuZm9ybWF0V2lkdGgoY29sdW1uLmFjdHVhbFdpZHRoKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlICdzdGFydCBlZGl0aW5nJyBjYWxsIHRvIHRoZSBjaGFpbiBvZiBlZGl0b3JzXHJcbiAgICB0aGlzLnJlbmRlcmVkUm93U3RhcnRFZGl0aW5nTGlzdGVuZXJzW3Jvd0luZGV4XVtjb2x1bW4uY29sSWRdID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKHRoYXQuaXNDZWxsRWRpdGFibGUoY29sdW1uLmNvbERlZiwgbm9kZSkpIHtcclxuICAgICAgICAgICAgdGhhdC5zdGFydEVkaXRpbmcoZUdyaWRDZWxsLCBjb2x1bW4sIG5vZGUsICRjaGlsZFNjb3BlLCByb3dJbmRleCwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gZUdyaWRDZWxsO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmFkZENlbGxOYXZpZ2F0aW9uSGFuZGxlciA9IGZ1bmN0aW9uKGVHcmlkQ2VsbCwgcm93SW5kZXgsIGNvbHVtbiwgbm9kZSkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgZUdyaWRDZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIGlmICh0aGF0LmVkaXRpbmdDZWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gb25seSBpbnRlcmVzdGVkIG9uIGtleSBwcmVzc2VzIHRoYXQgYXJlIGRpcmVjdGx5IG9uIHRoaXMgZWxlbWVudCwgbm90IGFueSBjaGlsZHJlbiBlbGVtZW50cy4gdGhpc1xyXG4gICAgICAgIC8vIHN0b3BzIG5hdmlnYXRpb24gaWYgdGhlIHVzZXIgaXMgaW4sIGZvciBleGFtcGxlLCBhIHRleHQgZmllbGQgaW5zaWRlIHRoZSBjZWxsLCBhbmQgdXNlciBoaXRzXHJcbiAgICAgICAgLy8gb24gb2YgdGhlIGtleXMgd2UgYXJlIGxvb2tpbmcgZm9yLlxyXG4gICAgICAgIGlmIChldmVudC50YXJnZXQgIT09IGVHcmlkQ2VsbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIga2V5ID0gZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZTtcclxuXHJcbiAgICAgICAgdmFyIHN0YXJ0TmF2aWdhdGlvbiA9IGtleSA9PT0gY29uc3RhbnRzLktFWV9ET1dOIHx8IGtleSA9PT0gY29uc3RhbnRzLktFWV9VUFxyXG4gICAgICAgICAgICB8fCBrZXkgPT09IGNvbnN0YW50cy5LRVlfTEVGVCB8fCBrZXkgPT09IGNvbnN0YW50cy5LRVlfUklHSFQ7XHJcbiAgICAgICAgaWYgKHN0YXJ0TmF2aWdhdGlvbikge1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB0aGF0Lm5hdmlnYXRlVG9OZXh0Q2VsbChrZXksIHJvd0luZGV4LCBjb2x1bW4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHN0YXJ0RWRpdCA9IGtleSA9PT0gY29uc3RhbnRzLktFWV9FTlRFUjtcclxuICAgICAgICBpZiAoc3RhcnRFZGl0KSB7XHJcbiAgICAgICAgICAgIHZhciBzdGFydEVkaXRpbmdGdW5jID0gdGhhdC5yZW5kZXJlZFJvd1N0YXJ0RWRpdGluZ0xpc3RlbmVyc1tyb3dJbmRleF1bY29sdW1uLmNvbElkXTtcclxuICAgICAgICAgICAgaWYgKHN0YXJ0RWRpdGluZ0Z1bmMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBlZGl0aW5nU3RhcnRlZCA9IHN0YXJ0RWRpdGluZ0Z1bmMoKTtcclxuICAgICAgICAgICAgICAgIGlmIChlZGl0aW5nU3RhcnRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHdlIGRvbid0IHByZXZlbnQgZGVmYXVsdCwgdGhlbiB0aGUgZWRpdG9yIHRoYXQgZ2V0IGRpc3BsYXllZCBhbHNvIHBpY2tzIHVwIHRoZSAnZW50ZXIga2V5J1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHByZXNzLCBhbmQgc3RvcHMgZWRpdGluZyBpbW1lZGlhdGVseSwgaGVuY2UgZ2l2aW5nIGhlIHVzZXIgZXhwZXJpZW5jZSB0aGF0IG5vdGhpbmcgaGFwcGVuZWRcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgc2VsZWN0Um93ID0ga2V5ID09PSBjb25zdGFudHMuS0VZX1NQQUNFO1xyXG4gICAgICAgIGlmIChzZWxlY3RSb3cgJiYgdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuaXNSb3dTZWxlY3Rpb24oKSkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuaXNOb2RlU2VsZWN0ZWQobm9kZSk7XHJcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLmRlc2VsZWN0Tm9kZShub2RlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5zZWxlY3ROb2RlKG5vZGUsIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vLyB3ZSB1c2UgaW5kZXggZm9yIHJvd3MsIGJ1dCBjb2x1bW4gb2JqZWN0IGZvciBjb2x1bW5zLCBhcyB0aGUgbmV4dCBjb2x1bW4gKGJ5IGluZGV4KSBtaWdodCBub3RcclxuLy8gYmUgdmlzaWJsZSAoaGVhZGVyIGdyb3VwaW5nKSBzbyBpdCdzIG5vdCByZWxpYWJsZSwgc28gdXNpbmcgdGhlIGNvbHVtbiBvYmplY3QgaW5zdGVhZC5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLm5hdmlnYXRlVG9OZXh0Q2VsbCA9IGZ1bmN0aW9uKGtleSwgcm93SW5kZXgsIGNvbHVtbikge1xyXG5cclxuICAgIHZhciBjZWxsVG9Gb2N1cyA9IHtyb3dJbmRleDogcm93SW5kZXgsIGNvbHVtbjogY29sdW1ufTtcclxuICAgIHZhciByZW5kZXJlZFJvdztcclxuICAgIHZhciBlQ2VsbDtcclxuXHJcbiAgICAvLyB3ZSBrZWVwIHNlYXJjaGluZyBmb3IgYSBuZXh0IGNlbGwgdW50aWwgd2UgZmluZCBvbmUuIHRoaXMgaXMgaG93IHRoZSBncm91cCByb3dzIGdldCBza2lwcGVkXHJcbiAgICB3aGlsZSAoIWVDZWxsKSB7XHJcbiAgICAgICAgY2VsbFRvRm9jdXMgPSB0aGlzLmdldE5leHRDZWxsVG9Gb2N1cyhrZXksIGNlbGxUb0ZvY3VzKTtcclxuICAgICAgICAvLyBubyBuZXh0IGNlbGwgbWVhbnMgd2UgaGF2ZSByZWFjaGVkIGEgZ3JpZCBib3VuZGFyeSwgZWcgbGVmdCwgcmlnaHQsIHRvcCBvciBib3R0b20gb2YgZ3JpZFxyXG4gICAgICAgIGlmICghY2VsbFRvRm9jdXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzZWUgaWYgdGhlIG5leHQgY2VsbCBpcyBzZWxlY3RhYmxlLCBpZiB5ZXMsIHVzZSBpdCwgaWYgbm90LCBza2lwIGl0XHJcbiAgICAgICAgcmVuZGVyZWRSb3cgPSB0aGlzLnJlbmRlcmVkUm93c1tjZWxsVG9Gb2N1cy5yb3dJbmRleF07XHJcbiAgICAgICAgZUNlbGwgPSByZW5kZXJlZFJvdy5lQ2VsbHNbY2VsbFRvRm9jdXMuY29sdW1uLmNvbElkXTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0aGlzIHNjcm9sbHMgdGhlIHJvdyBpbnRvIHZpZXdcclxuICAgIHRoaXMuYW5ndWxhckdyaWQuZW5zdXJlSW5kZXhWaXNpYmxlKHJlbmRlcmVkUm93LnJvd0luZGV4KTtcclxuXHJcbiAgICAvLyB0aGlzIGNoYW5nZXMgdGhlIGNzcyBvbiB0aGUgY2VsbFxyXG4gICAgdGhpcy5mb2N1c0NlbGwoZUNlbGwsIGNlbGxUb0ZvY3VzLnJvd0luZGV4LCBjZWxsVG9Gb2N1cy5jb2x1bW4uaW5kZXgsIHRydWUpO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmdldE5leHRDZWxsVG9Gb2N1cyA9IGZ1bmN0aW9uKGtleSwgbGFzdENlbGxUb0ZvY3VzKSB7XHJcbiAgICB2YXIgbGFzdFJvd0luZGV4ID0gbGFzdENlbGxUb0ZvY3VzLnJvd0luZGV4O1xyXG4gICAgdmFyIGxhc3RDb2x1bW4gPSBsYXN0Q2VsbFRvRm9jdXMuY29sdW1uO1xyXG5cclxuICAgIHZhciBuZXh0Um93VG9Gb2N1cztcclxuICAgIHZhciBuZXh0Q29sdW1uVG9Gb2N1cztcclxuICAgIHN3aXRjaCAoa2V5KSB7XHJcbiAgICAgICAgY2FzZSBjb25zdGFudHMuS0VZX1VQIDpcclxuICAgICAgICAgICAgLy8gaWYgYWxyZWFkeSBvbiB0b3Agcm93LCBkbyBub3RoaW5nXHJcbiAgICAgICAgICAgIGlmIChsYXN0Um93SW5kZXggPT09IHRoaXMuZmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3cpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5leHRSb3dUb0ZvY3VzID0gbGFzdFJvd0luZGV4IC0gMTtcclxuICAgICAgICAgICAgbmV4dENvbHVtblRvRm9jdXMgPSBsYXN0Q29sdW1uO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGNvbnN0YW50cy5LRVlfRE9XTiA6XHJcbiAgICAgICAgICAgIC8vIGlmIGFscmVhZHkgb24gYm90dG9tLCBkbyBub3RoaW5nXHJcbiAgICAgICAgICAgIGlmIChsYXN0Um93SW5kZXggPT09IHRoaXMubGFzdFZpcnR1YWxSZW5kZXJlZFJvdykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbmV4dFJvd1RvRm9jdXMgPSBsYXN0Um93SW5kZXggKyAxO1xyXG4gICAgICAgICAgICBuZXh0Q29sdW1uVG9Gb2N1cyA9IGxhc3RDb2x1bW47XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgY29uc3RhbnRzLktFWV9SSUdIVCA6XHJcbiAgICAgICAgICAgIHZhciBjb2xUb1JpZ2h0ID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRWaXNpYmxlQ29sQWZ0ZXIobGFzdENvbHVtbik7XHJcbiAgICAgICAgICAgIC8vIGlmIGFscmVhZHkgb24gcmlnaHQsIGRvIG5vdGhpbmdcclxuICAgICAgICAgICAgaWYgKCFjb2xUb1JpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBuZXh0Um93VG9Gb2N1cyA9IGxhc3RSb3dJbmRleCA7XHJcbiAgICAgICAgICAgIG5leHRDb2x1bW5Ub0ZvY3VzID0gY29sVG9SaWdodDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBjb25zdGFudHMuS0VZX0xFRlQgOlxyXG4gICAgICAgICAgICB2YXIgY29sVG9MZWZ0ID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRWaXNpYmxlQ29sQmVmb3JlKGxhc3RDb2x1bW4pO1xyXG4gICAgICAgICAgICAvLyBpZiBhbHJlYWR5IG9uIGxlZnQsIGRvIG5vdGhpbmdcclxuICAgICAgICAgICAgaWYgKCFjb2xUb0xlZnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5leHRSb3dUb0ZvY3VzID0gbGFzdFJvd0luZGV4IDtcclxuICAgICAgICAgICAgbmV4dENvbHVtblRvRm9jdXMgPSBjb2xUb0xlZnQ7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcm93SW5kZXg6IG5leHRSb3dUb0ZvY3VzLFxyXG4gICAgICAgIGNvbHVtbjogbmV4dENvbHVtblRvRm9jdXNcclxuICAgIH07XHJcbn07XHJcblxyXG4vLyBjYWxsZWQgaW50ZXJuYWxseVxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuZm9jdXNDZWxsID0gZnVuY3Rpb24oZUNlbGwsIHJvd0luZGV4LCBjb2xJbmRleCwgZm9yY2VCcm93c2VyRm9jdXMpIHtcclxuICAgIC8vIGRvIG5vdGhpbmcgaWYgY2VsbCBzZWxlY3Rpb24gaXMgb2ZmXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNTdXBwcmVzc0NlbGxTZWxlY3Rpb24oKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZW1vdmUgYW55IHByZXZpb3VzIGZvY3VzXHJcbiAgICB1dGlscy5xdWVyeVNlbGVjdG9yQWxsX3JlcGxhY2VDc3NDbGFzcyh0aGlzLmVQYXJlbnRPZlJvd3MsICcuYWctY2VsbC1mb2N1cycsICdhZy1jZWxsLWZvY3VzJywgJ2FnLWNlbGwtbm8tZm9jdXMnKTtcclxuXHJcbiAgICB2YXIgc2VsZWN0b3JGb3JDZWxsID0gJ1tyb3c9XCInICsgcm93SW5kZXggKyAnXCJdIFtjb2w9XCInICsgY29sSW5kZXggKyAnXCJdJztcclxuICAgIHV0aWxzLnF1ZXJ5U2VsZWN0b3JBbGxfcmVwbGFjZUNzc0NsYXNzKHRoaXMuZVBhcmVudE9mUm93cywgc2VsZWN0b3JGb3JDZWxsLCAnYWctY2VsbC1uby1mb2N1cycsICdhZy1jZWxsLWZvY3VzJyk7XHJcblxyXG4gICAgdGhpcy5mb2N1c2VkQ2VsbCA9IHtyb3dJbmRleDogcm93SW5kZXgsIGNvbEluZGV4OiBjb2xJbmRleCwgbm9kZTogdGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93KHJvd0luZGV4KX07XHJcblxyXG4gICAgLy8gdGhpcyBwdXRzIHRoZSBicm93c2VyIGZvY3VzIG9uIHRoZSBjZWxsIChzbyBpdCBnZXRzIGtleSBwcmVzc2VzKVxyXG4gICAgaWYgKGZvcmNlQnJvd3NlckZvY3VzKSB7XHJcbiAgICAgICAgZUNlbGwuZm9jdXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxGb2N1c2VkKCkgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDZWxsRm9jdXNlZCgpKHRoaXMuZm9jdXNlZENlbGwpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gZm9yIEFQSVxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuZ2V0Rm9jdXNlZENlbGwgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmZvY3VzZWRDZWxsO1xyXG59O1xyXG5cclxuLy8gY2FsbGVkIHZpYSBBUElcclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnNldEZvY3VzZWRDZWxsID0gZnVuY3Rpb24ocm93SW5kZXgsIGNvbEluZGV4KSB7XHJcbiAgICB2YXIgcmVuZGVyZWRSb3cgPSB0aGlzLnJlbmRlcmVkUm93c1tyb3dJbmRleF07XHJcbiAgICB2YXIgY29sdW1uID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXREaXNwbGF5ZWRDb2x1bW5zKClbY29sSW5kZXhdO1xyXG4gICAgaWYgKHJlbmRlcmVkUm93ICYmIGNvbHVtbikge1xyXG4gICAgICAgIHZhciBlQ2VsbCA9IHJlbmRlcmVkUm93LmVDZWxsc1tjb2x1bW4uY29sSWRdO1xyXG4gICAgICAgIHRoaXMuZm9jdXNDZWxsKGVDZWxsLCByb3dJbmRleCwgY29sSW5kZXgsIHRydWUpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnBvcHVsYXRlQW5kU3R5bGVHcmlkQ2VsbCA9IGZ1bmN0aW9uKHZhbHVlR2V0dGVyLCB2YWx1ZSwgZUdyaWRDZWxsLCBpc0ZpcnN0Q29sdW1uLCBub2RlLCBjb2x1bW4sIHJvd0luZGV4LCAkY2hpbGRTY29wZSkge1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcblxyXG4gICAgLy8gcG9wdWxhdGVcclxuICAgIHRoaXMucG9wdWxhdGVHcmlkQ2VsbChlR3JpZENlbGwsIGlzRmlyc3RDb2x1bW4sIG5vZGUsIGNvbHVtbiwgcm93SW5kZXgsIHZhbHVlLCB2YWx1ZUdldHRlciwgJGNoaWxkU2NvcGUpO1xyXG4gICAgLy8gc3R5bGVcclxuICAgIHRoaXMuYWRkU3R5bGVzRnJvbUNvbGxEZWYoY29sdW1uLCB2YWx1ZSwgbm9kZSwgJGNoaWxkU2NvcGUsIGVHcmlkQ2VsbCk7XHJcbiAgICB0aGlzLmFkZENsYXNzZXNGcm9tQ29sbERlZihjb2xEZWYsIHZhbHVlLCBub2RlLCAkY2hpbGRTY29wZSwgZUdyaWRDZWxsKTtcclxuICAgIHRoaXMuYWRkQ2xhc3Nlc0Zyb21SdWxlcyhjb2xEZWYsIGVHcmlkQ2VsbCwgdmFsdWUsIG5vZGUsIHJvd0luZGV4KTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5wb3B1bGF0ZUdyaWRDZWxsID0gZnVuY3Rpb24oZUdyaWRDZWxsLCBpc0ZpcnN0Q29sdW1uLCBub2RlLCBjb2x1bW4sIHJvd0luZGV4LCB2YWx1ZSwgdmFsdWVHZXR0ZXIsICRjaGlsZFNjb3BlKSB7XHJcbiAgICB2YXIgZUNlbGxXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgdXRpbHMuYWRkQ3NzQ2xhc3MoZUNlbGxXcmFwcGVyLCBcImFnLWNlbGwtd3JhcHBlclwiKTtcclxuICAgIGVHcmlkQ2VsbC5hcHBlbmRDaGlsZChlQ2VsbFdyYXBwZXIpO1xyXG5cclxuICAgIHZhciBjb2xEZWYgPSBjb2x1bW4uY29sRGVmO1xyXG4gICAgaWYgKGNvbERlZi5jaGVja2JveFNlbGVjdGlvbikge1xyXG4gICAgICAgIHZhciBlQ2hlY2tib3ggPSB0aGlzLnNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeS5jcmVhdGVTZWxlY3Rpb25DaGVja2JveChub2RlLCByb3dJbmRleCk7XHJcbiAgICAgICAgZUNlbGxXcmFwcGVyLmFwcGVuZENoaWxkKGVDaGVja2JveCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZXZlbnR1YWxseSB3ZSBjYWxsIGVTcGFuV2l0aFZhbHVlLmlubmVySFRNTCA9IHh4eCwgc28gY2Fubm90IGluY2x1ZGUgdGhlIGNoZWNrYm94IChhYm92ZSkgaW4gdGhpcyBzcGFuXHJcbiAgICB2YXIgZVNwYW5XaXRoVmFsdWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgIHV0aWxzLmFkZENzc0NsYXNzKGVTcGFuV2l0aFZhbHVlLCBcImFnLWNlbGwtdmFsdWVcIik7XHJcblxyXG4gICAgZUNlbGxXcmFwcGVyLmFwcGVuZENoaWxkKGVTcGFuV2l0aFZhbHVlKTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB2YXIgcmVmcmVzaENlbGxGdW5jdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQuc29mdFJlZnJlc2hDZWxsKGVHcmlkQ2VsbCwgaXNGaXJzdENvbHVtbiwgbm9kZSwgY29sdW1uLCAkY2hpbGRTY29wZSwgcm93SW5kZXgpO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnB1dERhdGFJbnRvQ2VsbChjb2x1bW4sIHZhbHVlLCB2YWx1ZUdldHRlciwgbm9kZSwgJGNoaWxkU2NvcGUsIGVTcGFuV2l0aFZhbHVlLCBlR3JpZENlbGwsIHJvd0luZGV4LCByZWZyZXNoQ2VsbEZ1bmN0aW9uKTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5hZGRDZWxsRG91YmxlQ2xpY2tlZEhhbmRsZXIgPSBmdW5jdGlvbihlR3JpZENlbGwsIG5vZGUsIGNvbHVtbiwgdmFsdWUsIHJvd0luZGV4LCAkY2hpbGRTY29wZSwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHZhciBjb2xEZWYgPSBjb2x1bW4uY29sRGVmO1xyXG4gICAgZUdyaWRDZWxsLmFkZEV2ZW50TGlzdGVuZXIoXCJkYmxjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIGlmICh0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRDZWxsRG91YmxlQ2xpY2tlZCgpKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXJhbXNGb3JHcmlkID0ge1xyXG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgICAgICAgICAgZXZlbnRTb3VyY2U6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBhcGk6IHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxEb3VibGVDbGlja2VkKCkocGFyYW1zRm9yR3JpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb2xEZWYuY2VsbERvdWJsZUNsaWNrZWQpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmFtc0ZvckNvbERlZiA9IHtcclxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudCxcclxuICAgICAgICAgICAgICAgIGV2ZW50U291cmNlOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYXBpOiB0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb2xEZWYuY2VsbERvdWJsZUNsaWNrZWQocGFyYW1zRm9yQ29sRGVmKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoYXQuaXNDZWxsRWRpdGFibGUoY29sRGVmLCBub2RlKSkge1xyXG4gICAgICAgICAgICB0aGF0LnN0YXJ0RWRpdGluZyhlR3JpZENlbGwsIGNvbHVtbiwgbm9kZSwgJGNoaWxkU2NvcGUsIHJvd0luZGV4LCBpc0ZpcnN0Q29sdW1uLCB2YWx1ZUdldHRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuYWRkQ2VsbENsaWNrZWRIYW5kbGVyID0gZnVuY3Rpb24oZUdyaWRDZWxsLCBub2RlLCBjb2x1bW4sIHZhbHVlLCByb3dJbmRleCkge1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBlR3JpZENlbGwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgLy8gd2UgcGFzcyBmYWxzZSB0byBmb2N1c0NlbGwsIGFzIHdlIGRvbid0IHdhbnQgdGhlIGNlbGwgdG8gZm9jdXNcclxuICAgICAgICAvLyBhbHNvIGdldCB0aGUgYnJvd3NlciBmb2N1cy4gaWYgd2UgZGlkLCB0aGVuIHRoZSBjZWxsUmVuZGVyZXIgY291bGRcclxuICAgICAgICAvLyBoYXZlIGEgdGV4dCBmaWVsZCBpbiBpdCwgZm9yIGV4YW1wbGUsIGFuZCBhcyB0aGUgdXNlciBjbGlja3Mgb24gdGhlXHJcbiAgICAgICAgLy8gdGV4dCBmaWVsZCwgdGhlIHRleHQgZmllbGQsIHRoZSBmb2N1cyBkb2Vzbid0IGdldCB0byB0aGUgdGV4dFxyXG4gICAgICAgIC8vIGZpZWxkLCBpbnN0ZWFkIHRvIGdvZXMgdG8gdGhlIGRpdiBiZWhpbmQsIG1ha2luZyBpdCBpbXBvc3NpYmxlIHRvXHJcbiAgICAgICAgLy8gc2VsZWN0IHRoZSB0ZXh0IGZpZWxkLlxyXG4gICAgICAgIHRoYXQuZm9jdXNDZWxsKGVHcmlkQ2VsbCwgcm93SW5kZXgsIGNvbHVtbi5pbmRleCwgZmFsc2UpO1xyXG4gICAgICAgIGlmICh0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRDZWxsQ2xpY2tlZCgpKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXJhbXNGb3JHcmlkID0ge1xyXG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgICAgICAgICAgZXZlbnRTb3VyY2U6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBhcGk6IHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxDbGlja2VkKCkocGFyYW1zRm9yR3JpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb2xEZWYuY2VsbENsaWNrZWQpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmFtc0ZvckNvbERlZiA9IHtcclxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudCxcclxuICAgICAgICAgICAgICAgIGV2ZW50U291cmNlOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYXBpOiB0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb2xEZWYuY2VsbENsaWNrZWQocGFyYW1zRm9yQ29sRGVmKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5pc0NlbGxFZGl0YWJsZSA9IGZ1bmN0aW9uKGNvbERlZiwgbm9kZSkge1xyXG4gICAgaWYgKHRoaXMuZWRpdGluZ0NlbGwpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbmV2ZXIgYWxsb3cgZWRpdGluZyBvZiBncm91cHNcclxuICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGJvb2xlYW4gc2V0LCB0aGVuIGp1c3QgdXNlIGl0XHJcbiAgICBpZiAodHlwZW9mIGNvbERlZi5lZGl0YWJsZSA9PT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgcmV0dXJuIGNvbERlZi5lZGl0YWJsZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBmdW5jdGlvbiwgdGhlbiBjYWxsIHRoZSBmdW5jdGlvbiB0byBmaW5kIG91dFxyXG4gICAgaWYgKHR5cGVvZiBjb2xEZWYuZWRpdGFibGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAvLyBzaG91bGQgY2hhbmdlIHRoaXMsIHNvIGl0IGdldHMgcGFzc2VkIHBhcmFtcyB3aXRoIG5pY2UgdXNlZnVsIHZhbHVlc1xyXG4gICAgICAgIHJldHVybiBjb2xEZWYuZWRpdGFibGUobm9kZS5kYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuc3RvcEVkaXRpbmcgPSBmdW5jdGlvbihlR3JpZENlbGwsIGNvbHVtbiwgbm9kZSwgJGNoaWxkU2NvcGUsIGVJbnB1dCwgYmx1ckxpc3RlbmVyLCByb3dJbmRleCwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpIHtcclxuICAgIHRoaXMuZWRpdGluZ0NlbGwgPSBmYWxzZTtcclxuICAgIHZhciBuZXdWYWx1ZSA9IGVJbnB1dC52YWx1ZTtcclxuICAgIHZhciBjb2xEZWYgPSBjb2x1bW4uY29sRGVmO1xyXG5cclxuICAgIC8vSWYgd2UgZG9uJ3QgcmVtb3ZlIHRoZSBibHVyIGxpc3RlbmVyIGZpcnN0LCB3ZSBnZXQ6XHJcbiAgICAvL1VuY2F1Z2h0IE5vdEZvdW5kRXJyb3I6IEZhaWxlZCB0byBleGVjdXRlICdyZW1vdmVDaGlsZCcgb24gJ05vZGUnOiBUaGUgbm9kZSB0byBiZSByZW1vdmVkIGlzIG5vIGxvbmdlciBhIGNoaWxkIG9mIHRoaXMgbm9kZS4gUGVyaGFwcyBpdCB3YXMgbW92ZWQgaW4gYSAnYmx1cicgZXZlbnQgaGFuZGxlcj9cclxuICAgIGVJbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgYmx1ckxpc3RlbmVyKTtcclxuXHJcbiAgICB1dGlscy5yZW1vdmVBbGxDaGlsZHJlbihlR3JpZENlbGwpO1xyXG5cclxuICAgIHZhciBwYXJhbXNGb3JDYWxsYmFja3MgPSB7XHJcbiAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgb2xkVmFsdWU6IG5vZGUuZGF0YVtjb2xEZWYuZmllbGRdLFxyXG4gICAgICAgIG5ld1ZhbHVlOiBuZXdWYWx1ZSxcclxuICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKSxcclxuICAgICAgICBjb250ZXh0OiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KClcclxuICAgIH07XHJcblxyXG4gICAgaWYgKGNvbERlZi5uZXdWYWx1ZUhhbmRsZXIpIHtcclxuICAgICAgICBjb2xEZWYubmV3VmFsdWVIYW5kbGVyKHBhcmFtc0ZvckNhbGxiYWNrcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5vZGUuZGF0YVtjb2xEZWYuZmllbGRdID0gbmV3VmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYXQgdGhpcyBwb2ludCwgdGhlIHZhbHVlIGhhcyBiZWVuIHVwZGF0ZWRcclxuICAgIHZhciBuZXdWYWx1ZTtcclxuICAgIGlmICh2YWx1ZUdldHRlcikge1xyXG4gICAgICAgIG5ld1ZhbHVlID0gdmFsdWVHZXR0ZXIoKTtcclxuICAgIH1cclxuICAgIHBhcmFtc0ZvckNhbGxiYWNrcy5uZXdWYWx1ZSA9IG5ld1ZhbHVlO1xyXG4gICAgaWYgKHR5cGVvZiBjb2xEZWYuY2VsbFZhbHVlQ2hhbmdlZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIGNvbERlZi5jZWxsVmFsdWVDaGFuZ2VkKHBhcmFtc0ZvckNhbGxiYWNrcyk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxWYWx1ZUNoYW5nZWQoKSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxWYWx1ZUNoYW5nZWQoKShwYXJhbXNGb3JDYWxsYmFja3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucG9wdWxhdGVBbmRTdHlsZUdyaWRDZWxsKHZhbHVlR2V0dGVyLCBuZXdWYWx1ZSwgZUdyaWRDZWxsLCBpc0ZpcnN0Q29sdW1uLCBub2RlLCBjb2x1bW4sIHJvd0luZGV4LCAkY2hpbGRTY29wZSk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuc3RhcnRFZGl0aW5nID0gZnVuY3Rpb24oZUdyaWRDZWxsLCBjb2x1bW4sIG5vZGUsICRjaGlsZFNjb3BlLCByb3dJbmRleCwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHRoaXMuZWRpdGluZ0NlbGwgPSB0cnVlO1xyXG4gICAgdXRpbHMucmVtb3ZlQWxsQ2hpbGRyZW4oZUdyaWRDZWxsKTtcclxuICAgIHZhciBlSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgZUlucHV0LnR5cGUgPSAndGV4dCc7XHJcbiAgICB1dGlscy5hZGRDc3NDbGFzcyhlSW5wdXQsICdhZy1jZWxsLWVkaXQtaW5wdXQnKTtcclxuXHJcbiAgICBpZiAodmFsdWVHZXR0ZXIpIHtcclxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUdldHRlcigpO1xyXG4gICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGVJbnB1dC52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBlSW5wdXQuc3R5bGUud2lkdGggPSAoY29sdW1uLmFjdHVhbFdpZHRoIC0gMTQpICsgJ3B4JztcclxuICAgIGVHcmlkQ2VsbC5hcHBlbmRDaGlsZChlSW5wdXQpO1xyXG4gICAgZUlucHV0LmZvY3VzKCk7XHJcbiAgICBlSW5wdXQuc2VsZWN0KCk7XHJcblxyXG4gICAgdmFyIGJsdXJMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQuc3RvcEVkaXRpbmcoZUdyaWRDZWxsLCBjb2x1bW4sIG5vZGUsICRjaGlsZFNjb3BlLCBlSW5wdXQsIGJsdXJMaXN0ZW5lciwgcm93SW5kZXgsIGlzRmlyc3RDb2x1bW4sIHZhbHVlR2V0dGVyKTtcclxuICAgIH07XHJcblxyXG4gICAgLy9zdG9wIGVudGVyaW5nIGlmIHdlIGxvb3NlIGZvY3VzXHJcbiAgICBlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgYmx1ckxpc3RlbmVyKTtcclxuXHJcbiAgICAvL3N0b3AgZWRpdGluZyBpZiBlbnRlciBwcmVzc2VkXHJcbiAgICBlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIHZhciBrZXkgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlO1xyXG4gICAgICAgIC8vIDEzIGlzIGVudGVyXHJcbiAgICAgICAgaWYgKGtleSA9PSBjb25zdGFudHMuS0VZX0VOVEVSKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc3RvcEVkaXRpbmcoZUdyaWRDZWxsLCBjb2x1bW4sIG5vZGUsICRjaGlsZFNjb3BlLCBlSW5wdXQsIGJsdXJMaXN0ZW5lciwgcm93SW5kZXgsIGlzRmlyc3RDb2x1bW4sIHZhbHVlR2V0dGVyKTtcclxuICAgICAgICAgICAgdGhhdC5mb2N1c0NlbGwoZUdyaWRDZWxsLCByb3dJbmRleCwgY29sdW1uLmluZGV4LCB0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyB0YWIga2V5IGRvZXNuJ3QgZ2VuZXJhdGUga2V5cHJlc3MsIHNvIG5lZWQga2V5ZG93biB0byBsaXN0ZW4gZm9yIHRoYXRcclxuICAgIGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICB2YXIga2V5ID0gZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZTtcclxuICAgICAgICBpZiAoa2V5ID09IGNvbnN0YW50cy5LRVlfVEFCKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc3RvcEVkaXRpbmcoZUdyaWRDZWxsLCBjb2x1bW4sIG5vZGUsICRjaGlsZFNjb3BlLCBlSW5wdXQsIGJsdXJMaXN0ZW5lciwgcm93SW5kZXgsIGlzRmlyc3RDb2x1bW4sIHZhbHVlR2V0dGVyKTtcclxuICAgICAgICAgICAgdGhhdC5zdGFydEVkaXRpbmdOZXh0Q2VsbChyb3dJbmRleCwgY29sdW1uLCBldmVudC5zaGlmdEtleSk7XHJcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IHdhbnQgdGhlIGRlZmF1bHQgdGFiIGFjdGlvbiwgc28gcmV0dXJuIGZhbHNlLCB0aGlzIHN0b3BzIHRoZSBldmVudCBmcm9tIGJ1YmJsaW5nXHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zdGFydEVkaXRpbmdOZXh0Q2VsbCA9IGZ1bmN0aW9uKHJvd0luZGV4LCBjb2x1bW4sIHNoaWZ0S2V5KSB7XHJcblxyXG4gICAgdmFyIGZpcnN0Um93VG9DaGVjayA9IHRoaXMuZmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3c7XHJcbiAgICB2YXIgbGFzdFJvd1RvQ2hlY2sgPSB0aGlzLmxhc3RWaXJ0dWFsUmVuZGVyZWRSb3c7XHJcbiAgICB2YXIgY3VycmVudFJvd0luZGV4ID0gcm93SW5kZXg7XHJcblxyXG4gICAgdmFyIHZpc2libGVDb2x1bW5zID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXREaXNwbGF5ZWRDb2x1bW5zKCk7XHJcbiAgICB2YXIgY3VycmVudENvbCA9IGNvbHVtbjtcclxuXHJcbiAgICB3aGlsZSAodHJ1ZSkge1xyXG5cclxuICAgICAgICB2YXIgaW5kZXhPZkN1cnJlbnRDb2wgPSB2aXNpYmxlQ29sdW1ucy5pbmRleE9mKGN1cnJlbnRDb2wpO1xyXG5cclxuICAgICAgICAvLyBtb3ZlIGJhY2t3YXJkXHJcbiAgICAgICAgaWYgKHNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICAgIC8vIG1vdmUgYWxvbmcgdG8gdGhlIHByZXZpb3VzIGNlbGxcclxuICAgICAgICAgICAgY3VycmVudENvbCA9IHZpc2libGVDb2x1bW5zW2luZGV4T2ZDdXJyZW50Q29sIC0gMV07XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIGVuZCBvZiB0aGUgcm93LCBhbmQgaWYgc28sIGdvIGJhY2sgYSByb3dcclxuICAgICAgICAgICAgaWYgKCFjdXJyZW50Q29sKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50Q29sID0gdmlzaWJsZUNvbHVtbnNbdmlzaWJsZUNvbHVtbnMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50Um93SW5kZXgtLTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgZ290IHRvIGVuZCBvZiByZW5kZXJlZCByb3dzLCB0aGVuIHF1aXQgbG9va2luZ1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudFJvd0luZGV4IDwgZmlyc3RSb3dUb0NoZWNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gbW92ZSBmb3J3YXJkXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gbW92ZSBhbG9uZyB0byB0aGUgbmV4dCBjZWxsXHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2wgPSB2aXNpYmxlQ29sdW1uc1tpbmRleE9mQ3VycmVudENvbCArIDFdO1xyXG4gICAgICAgICAgICAvLyBjaGVjayBpZiBlbmQgb2YgdGhlIHJvdywgYW5kIGlmIHNvLCBnbyBmb3J3YXJkIGEgcm93XHJcbiAgICAgICAgICAgIGlmICghY3VycmVudENvbCkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudENvbCA9IHZpc2libGVDb2x1bW5zWzBdO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFJvd0luZGV4Kys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGlmIGdvdCB0byBlbmQgb2YgcmVuZGVyZWQgcm93cywgdGhlbiBxdWl0IGxvb2tpbmdcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRSb3dJbmRleCA+IGxhc3RSb3dUb0NoZWNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBuZXh0RnVuYyA9IHRoaXMucmVuZGVyZWRSb3dTdGFydEVkaXRpbmdMaXN0ZW5lcnNbY3VycmVudFJvd0luZGV4XVtjdXJyZW50Q29sLmNvbElkXTtcclxuICAgICAgICBpZiAobmV4dEZ1bmMpIHtcclxuICAgICAgICAgICAgLy8gc2VlIGlmIHRoZSBuZXh0IGNlbGwgaXMgZWRpdGFibGUsIGFuZCBpZiBzbywgd2UgaGF2ZSBjb21lIHRvXHJcbiAgICAgICAgICAgIC8vIHRoZSBlbmQgb2Ygb3VyIHNlYXJjaCwgc28gc3RvcCBsb29raW5nIGZvciB0aGUgbmV4dCBjZWxsXHJcbiAgICAgICAgICAgIHZhciBuZXh0Q2VsbEFjY2VwdGVkRWRpdCA9IG5leHRGdW5jKCk7XHJcbiAgICAgICAgICAgIGlmIChuZXh0Q2VsbEFjY2VwdGVkRWRpdCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUm93UmVuZGVyZXI7XHJcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxuXHJcbi8vIHRoZXNlIGNvbnN0YW50cyBhcmUgdXNlZCBmb3IgZGV0ZXJtaW5pbmcgaWYgZ3JvdXBzIHNob3VsZFxyXG4vLyBiZSBzZWxlY3RlZCBvciBkZXNlbGVjdGVkIHdoZW4gc2VsZWN0aW5nIGdyb3VwcywgYW5kIHRoZSBncm91cFxyXG4vLyB0aGVuIHNlbGVjdHMgdGhlIGNoaWxkcmVuLlxyXG52YXIgU0VMRUNURUQgPSAwO1xyXG52YXIgVU5TRUxFQ1RFRCA9IDE7XHJcbnZhciBNSVhFRCA9IDI7XHJcbnZhciBET19OT1RfQ0FSRSA9IDM7XHJcblxyXG5mdW5jdGlvbiBTZWxlY3Rpb25Db250cm9sbGVyKCkge31cclxuXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihhbmd1bGFyR3JpZCwgZVJvd3NQYXJlbnQsIGdyaWRPcHRpb25zV3JhcHBlciwgJHNjb3BlLCByb3dSZW5kZXJlcikge1xyXG4gICAgdGhpcy5lUm93c1BhcmVudCA9IGVSb3dzUGFyZW50O1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkO1xyXG4gICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIgPSBncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB0aGlzLiRzY29wZSA9ICRzY29wZTtcclxuICAgIHRoaXMucm93UmVuZGVyZXIgPSByb3dSZW5kZXJlcjtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyID0gZ3JpZE9wdGlvbnNXcmFwcGVyO1xyXG5cclxuICAgIHRoaXMuaW5pdFNlbGVjdGVkTm9kZXNCeUlkKCk7XHJcblxyXG4gICAgdGhpcy5zZWxlY3RlZFJvd3MgPSBbXTtcclxuICAgIGdyaWRPcHRpb25zV3JhcHBlci5zZXRTZWxlY3RlZFJvd3ModGhpcy5zZWxlY3RlZFJvd3MpO1xyXG59O1xyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuaW5pdFNlbGVjdGVkTm9kZXNCeUlkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNlbGVjdGVkTm9kZXNCeUlkID0ge307XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5zZXRTZWxlY3RlZE5vZGVzQnlJZCh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkKTtcclxufTtcclxuXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmdldFNlbGVjdGVkTm9kZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzZWxlY3RlZE5vZGVzID0gW107XHJcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWQpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGlkID0ga2V5c1tpXTtcclxuICAgICAgICB2YXIgc2VsZWN0ZWROb2RlID0gdGhpcy5zZWxlY3RlZE5vZGVzQnlJZFtpZF07XHJcbiAgICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHNlbGVjdGVkTm9kZSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc2VsZWN0ZWROb2RlcztcclxufTtcclxuXHJcbi8vIHJldHVybnMgYSBsaXN0IG9mIGFsbCBub2RlcyBhdCAnYmVzdCBjb3N0JyAtIGEgZmVhdHVyZSB0byBiZSB1c2VkXHJcbi8vIHdpdGggZ3JvdXBzIC8gdHJlZXMuIGlmIGEgZ3JvdXAgaGFzIGFsbCBpdCdzIGNoaWxkcmVuIHNlbGVjdGVkLFxyXG4vLyB0aGVuIHRoZSBncm91cCBhcHBlYXJzIGluIHRoZSByZXN1bHQsIGJ1dCBub3QgdGhlIGNoaWxkcmVuLlxyXG4vLyBEZXNpZ25lZCBmb3IgdXNlIHdpdGggJ2NoaWxkcmVuJyBhcyB0aGUgZ3JvdXAgc2VsZWN0aW9uIHR5cGUsXHJcbi8vIHdoZXJlIGdyb3VwcyBkb24ndCBhY3R1YWxseSBhcHBlYXIgaW4gdGhlIHNlbGVjdGlvbiBub3JtYWxseS5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0QmVzdENvc3ROb2RlU2VsZWN0aW9uID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLnJvd01vZGVsLmdldFRvcExldmVsTm9kZXMgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICB0aHJvdyAnc2VsZWN0QWxsIG5vdCBhdmFpbGFibGUgd2hlbiByb3dzIGFyZSBvbiB0aGUgc2VydmVyJztcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdG9wTGV2ZWxOb2RlcyA9IHRoaXMucm93TW9kZWwuZ2V0VG9wTGV2ZWxOb2RlcygpO1xyXG5cclxuICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAvLyByZWN1cnNpdmUgZnVuY3Rpb24sIHRvIGZpbmQgdGhlIHNlbGVjdGVkIG5vZGVzXHJcbiAgICBmdW5jdGlvbiB0cmF2ZXJzZShub2Rlcykge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbm9kZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgICAgIGlmICh0aGF0LmlzTm9kZVNlbGVjdGVkKG5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChub2RlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIGlmIG5vdCBzZWxlY3RlZCwgdGhlbiBpZiBpdCdzIGEgZ3JvdXAsIGFuZCB0aGUgZ3JvdXBcclxuICAgICAgICAgICAgICAgIC8vIGhhcyBjaGlsZHJlbiwgY29udGludWUgdG8gc2VhcmNoIGZvciBzZWxlY3Rpb25zXHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhdmVyc2Uobm9kZS5jaGlsZHJlbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdHJhdmVyc2UodG9wTGV2ZWxOb2Rlcyk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnNldFJvd01vZGVsID0gZnVuY3Rpb24ocm93TW9kZWwpIHtcclxuICAgIHRoaXMucm93TW9kZWwgPSByb3dNb2RlbDtcclxufTtcclxuXHJcbi8vIHB1YmxpYyAtIHRoaXMgY2xlYXJzIHRoZSBzZWxlY3Rpb24sIGJ1dCBkb2Vzbid0IGNsZWFyIGRvd24gdGhlIGNzcyAtIHdoZW4gaXQgaXMgY2FsbGVkLCB0aGVcclxuLy8gY2FsbGVyIHRoZW4gZ2V0cyB0aGUgZ3JpZCB0byByZWZyZXNoLlxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5kZXNlbGVjdEFsbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5pbml0U2VsZWN0ZWROb2Rlc0J5SWQoKTtcclxuICAgIC8vdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkKTtcclxuICAgIC8vZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAvLyAgICBkZWxldGUgdGhpcy5zZWxlY3RlZE5vZGVzQnlJZFtrZXlzW2ldXTtcclxuICAgIC8vfVxyXG4gICAgdGhpcy5zeW5jU2VsZWN0ZWRSb3dzQW5kQ2FsbExpc3RlbmVyKCk7XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgLSB0aGlzIHNlbGVjdHMgZXZlcnl0aGluZywgYnV0IGRvZXNuJ3QgY2xlYXIgZG93biB0aGUgY3NzIC0gd2hlbiBpdCBpcyBjYWxsZWQsIHRoZVxyXG4vLyBjYWxsZXIgdGhlbiBnZXRzIHRoZSBncmlkIHRvIHJlZnJlc2guXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnNlbGVjdEFsbCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmICh0eXBlb2YgdGhpcy5yb3dNb2RlbC5nZXRUb3BMZXZlbE5vZGVzICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhyb3cgJ3NlbGVjdEFsbCBub3QgYXZhaWxhYmxlIHdoZW4gcm93cyBhcmUgb24gdGhlIHNlcnZlcic7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNlbGVjdGVkTm9kZXNCeUlkID0gdGhpcy5zZWxlY3RlZE5vZGVzQnlJZDtcclxuICAgIC8vIGlmIHRoZSBzZWxlY3Rpb24gaXMgXCJkb24ndCBpbmNsdWRlIGdyb3Vwc1wiLCB0aGVuIHdlIGRvbid0IGluY2x1ZGUgdGhlbSFcclxuICAgIHZhciBpbmNsdWRlR3JvdXBzID0gIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBTZWxlY3RzQ2hpbGRyZW4oKTtcclxuXHJcbiAgICBmdW5jdGlvbiByZWN1cnNpdmVseVNlbGVjdChub2Rlcykge1xyXG4gICAgICAgIGlmIChub2Rlcykge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaTxub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVjdXJzaXZlbHlTZWxlY3Qobm9kZS5jaGlsZHJlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVHcm91cHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWROb2Rlc0J5SWRbbm9kZS5pZF0gPSBub2RlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWROb2Rlc0J5SWRbbm9kZS5pZF0gPSBub2RlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciB0b3BMZXZlbE5vZGVzID0gdGhpcy5yb3dNb2RlbC5nZXRUb3BMZXZlbE5vZGVzKCk7XHJcbiAgICByZWN1cnNpdmVseVNlbGVjdCh0b3BMZXZlbE5vZGVzKTtcclxuXHJcbiAgICB0aGlzLnN5bmNTZWxlY3RlZFJvd3NBbmRDYWxsTGlzdGVuZXIoKTtcclxufTtcclxuXHJcbi8vIHB1YmxpY1xyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5zZWxlY3ROb2RlID0gZnVuY3Rpb24obm9kZSwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICB2YXIgbXVsdGlTZWxlY3QgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc1Jvd1NlbGVjdGlvbk11bHRpKCkgJiYgdHJ5TXVsdGk7XHJcblxyXG4gICAgLy8gaWYgdGhlIG5vZGUgaXMgYSBncm91cCwgdGhlbiBzZWxlY3RpbmcgdGhpcyBpcyB0aGUgc2FtZSBhcyBzZWxlY3RpbmcgdGhlIHBhcmVudCxcclxuICAgIC8vIHNvIHRvIGhhdmUgb25seSBvbmUgZmxvdyB0aHJvdWdoIHRoZSBiZWxvdywgd2UgYWx3YXlzIHNlbGVjdCB0aGUgaGVhZGVyIHBhcmVudFxyXG4gICAgLy8gKHdoaWNoIHRoZW4gaGFzIHRoZSBzaWRlIGVmZmVjdCBvZiBzZWxlY3RpbmcgdGhlIGNoaWxkKS5cclxuICAgIHZhciBub2RlVG9TZWxlY3Q7XHJcbiAgICBpZiAobm9kZS5mb290ZXIpIHtcclxuICAgICAgICBub2RlVG9TZWxlY3QgPSBub2RlLnNpYmxpbmc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5vZGVUb1NlbGVjdCA9IG5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYXQgdGhlIGVuZCwgaWYgdGhpcyBpcyB0cnVlLCB3ZSBpbmZvcm0gdGhlIGNhbGxiYWNrXHJcbiAgICB2YXIgYXRMZWFzdE9uZUl0ZW1VbnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICB2YXIgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIHNlZSBpZiByb3dzIHRvIGJlIGRlc2VsZWN0ZWRcclxuICAgIGlmICghbXVsdGlTZWxlY3QpIHtcclxuICAgICAgICBhdExlYXN0T25lSXRlbVVuc2VsZWN0ZWQgPSB0aGlzLmRvV29ya09mRGVzZWxlY3RBbGxOb2RlcygpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwU2VsZWN0c0NoaWxkcmVuKCkgJiYgbm9kZVRvU2VsZWN0Lmdyb3VwKSB7XHJcbiAgICAgICAgLy8gZG9uJ3Qgc2VsZWN0IHRoZSBncm91cCwgc2VsZWN0IHRoZSBjaGlsZHJlbiBpbnN0ZWFkXHJcbiAgICAgICAgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCA9IHRoaXMucmVjdXJzaXZlbHlTZWxlY3RBbGxDaGlsZHJlbihub2RlVG9TZWxlY3QpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBzZWUgaWYgcm93IG5lZWRzIHRvIGJlIHNlbGVjdGVkXHJcbiAgICAgICAgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCA9IHRoaXMuZG9Xb3JrT2ZTZWxlY3ROb2RlKG5vZGVUb1NlbGVjdCwgc3VwcHJlc3NFdmVudHMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhdExlYXN0T25lSXRlbVVuc2VsZWN0ZWQgfHwgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCkge1xyXG4gICAgICAgIHRoaXMuc3luY1NlbGVjdGVkUm93c0FuZENhbGxMaXN0ZW5lcihzdXBwcmVzc0V2ZW50cyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51cGRhdGVHcm91cFBhcmVudHNJZk5lZWRlZCgpO1xyXG59O1xyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlTZWxlY3RBbGxDaGlsZHJlbiA9IGZ1bmN0aW9uKG5vZGUsIHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICB2YXIgYXRMZWFzdE9uZSA9IGZhbHNlO1xyXG4gICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZWN1cnNpdmVseVNlbGVjdEFsbENoaWxkcmVuKGNoaWxkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0TGVhc3RPbmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZG9Xb3JrT2ZTZWxlY3ROb2RlKGNoaWxkLCBzdXBwcmVzc0V2ZW50cykpIHtcclxuICAgICAgICAgICAgICAgICAgICBhdExlYXN0T25lID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhdExlYXN0T25lO1xyXG59O1xyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlEZXNlbGVjdEFsbENoaWxkcmVuID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5RGVzZWxlY3RBbGxDaGlsZHJlbihjaGlsZCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0UmVhbE5vZGUoY2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyAxIC0gc2VsZWN0cyBhIG5vZGVcclxuLy8gMiAtIHVwZGF0ZXMgdGhlIFVJXHJcbi8vIDMgLSBjYWxscyBjYWxsYmFja3NcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZG9Xb3JrT2ZTZWxlY3ROb2RlID0gZnVuY3Rpb24obm9kZSwgc3VwcHJlc3NFdmVudHMpIHtcclxuICAgIGlmICh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW25vZGUuaWRdKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRbbm9kZS5pZF0gPSBub2RlO1xyXG5cclxuICAgIHRoaXMuYWRkQ3NzQ2xhc3NGb3JOb2RlX2FuZEluZm9ybVZpcnR1YWxSb3dMaXN0ZW5lcihub2RlKTtcclxuXHJcbiAgICAvLyBhbHNvIGNvbG9yIGluIHRoZSBmb290ZXIgaWYgdGhlcmUgaXMgb25lXHJcbiAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmV4cGFuZGVkICYmIG5vZGUuc2libGluZykge1xyXG4gICAgICAgIHRoaXMuYWRkQ3NzQ2xhc3NGb3JOb2RlX2FuZEluZm9ybVZpcnR1YWxSb3dMaXN0ZW5lcihub2RlLnNpYmxpbmcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGluZm9ybSB0aGUgcm93U2VsZWN0ZWQgbGlzdGVuZXIsIGlmIGFueVxyXG4gICAgaWYgKCFzdXBwcmVzc0V2ZW50cyAmJiB0eXBlb2YgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93U2VsZWN0ZWQoKSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93U2VsZWN0ZWQoKShub2RlLmRhdGEsIG5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyAxIC0gc2VsZWN0cyBhIG5vZGVcclxuLy8gMiAtIHVwZGF0ZXMgdGhlIFVJXHJcbi8vIDMgLSBjYWxscyBjYWxsYmFja3NcclxuLy8gd293IC0gd2hhdCBhIGJpZyBuYW1lIGZvciBhIG1ldGhvZCwgZXhjZXB0aW9uIGNhc2UsIGl0J3Mgc2F5aW5nIHdoYXQgdGhlIG1ldGhvZCBkb2VzXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmFkZENzc0NsYXNzRm9yTm9kZV9hbmRJbmZvcm1WaXJ0dWFsUm93TGlzdGVuZXIgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICB2YXIgdmlydHVhbFJlbmRlcmVkUm93SW5kZXggPSB0aGlzLnJvd1JlbmRlcmVyLmdldEluZGV4T2ZSZW5kZXJlZE5vZGUobm9kZSk7XHJcbiAgICBpZiAodmlydHVhbFJlbmRlcmVkUm93SW5kZXggPj0gMCkge1xyXG4gICAgICAgIHV0aWxzLnF1ZXJ5U2VsZWN0b3JBbGxfYWRkQ3NzQ2xhc3ModGhpcy5lUm93c1BhcmVudCwgJ1tyb3c9XCInICsgdmlydHVhbFJlbmRlcmVkUm93SW5kZXggKyAnXCJdJywgJ2FnLXJvdy1zZWxlY3RlZCcpO1xyXG5cclxuICAgICAgICAvLyBpbmZvcm0gdmlydHVhbCByb3cgbGlzdGVuZXJcclxuICAgICAgICB0aGlzLmFuZ3VsYXJHcmlkLm9uVmlydHVhbFJvd1NlbGVjdGVkKHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4LCB0cnVlKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuLy8gMSAtIHVuLXNlbGVjdHMgYSBub2RlXHJcbi8vIDIgLSB1cGRhdGVzIHRoZSBVSVxyXG4vLyAzIC0gY2FsbHMgY2FsbGJhY2tzXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmRvV29ya09mRGVzZWxlY3RBbGxOb2RlcyA9IGZ1bmN0aW9uKG5vZGVUb0tlZXBTZWxlY3RlZCkge1xyXG4gICAgLy8gbm90IGRvaW5nIG11bHRpLXNlbGVjdCwgc28gZGVzZWxlY3QgZXZlcnl0aGluZyBvdGhlciB0aGFuIHRoZSAnanVzdCBzZWxlY3RlZCcgcm93XHJcbiAgICB2YXIgYXRMZWFzdE9uZVNlbGVjdGlvbkNoYW5nZTtcclxuICAgIHZhciBzZWxlY3RlZE5vZGVLZXlzID0gT2JqZWN0LmtleXModGhpcy5zZWxlY3RlZE5vZGVzQnlJZCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGVkTm9kZUtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAvLyBza2lwIHRoZSAnanVzdCBzZWxlY3RlZCcgcm93XHJcbiAgICAgICAgdmFyIGtleSA9IHNlbGVjdGVkTm9kZUtleXNbaV07XHJcbiAgICAgICAgdmFyIG5vZGVUb0Rlc2VsZWN0ID0gdGhpcy5zZWxlY3RlZE5vZGVzQnlJZFtrZXldO1xyXG4gICAgICAgIGlmIChub2RlVG9EZXNlbGVjdCA9PT0gbm9kZVRvS2VlcFNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RSZWFsTm9kZShub2RlVG9EZXNlbGVjdCk7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVTZWxlY3Rpb25DaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhdExlYXN0T25lU2VsZWN0aW9uQ2hhbmdlO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5kZXNlbGVjdFJlYWxOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgLy8gZGVzZWxlY3QgdGhlIGNzc1xyXG4gICAgdGhpcy5yZW1vdmVDc3NDbGFzc0Zvck5vZGUobm9kZSk7XHJcblxyXG4gICAgLy8gaWYgbm9kZSBpcyBhIGhlYWRlciwgYW5kIGlmIGl0IGhhcyBhIHNpYmxpbmcgZm9vdGVyLCBkZXNlbGVjdCB0aGUgZm9vdGVyIGFsc29cclxuICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuZXhwYW5kZWQgJiYgbm9kZS5zaWJsaW5nKSB7IC8vIGFsc28gY2hlY2sgdGhhdCBpdCdzIGV4cGFuZGVkLCBhcyBzaWJsaW5nIGNvdWxkIGJlIGEgZ2hvc3RcclxuICAgICAgICB0aGlzLnJlbW92ZUNzc0NsYXNzRm9yTm9kZShub2RlLnNpYmxpbmcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlbW92ZSB0aGUgcm93XHJcbiAgICBkZWxldGUgdGhpcy5zZWxlY3RlZE5vZGVzQnlJZFtub2RlLmlkXTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucmVtb3ZlQ3NzQ2xhc3NGb3JOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ID0gdGhpcy5yb3dSZW5kZXJlci5nZXRJbmRleE9mUmVuZGVyZWROb2RlKG5vZGUpO1xyXG4gICAgaWYgKHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ID49IDApIHtcclxuICAgICAgICB1dGlscy5xdWVyeVNlbGVjdG9yQWxsX3JlbW92ZUNzc0NsYXNzKHRoaXMuZVJvd3NQYXJlbnQsICdbcm93PVwiJyArIHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ICsgJ1wiXScsICdhZy1yb3ctc2VsZWN0ZWQnKTtcclxuICAgICAgICAvLyBpbmZvcm0gdmlydHVhbCByb3cgbGlzdGVuZXJcclxuICAgICAgICB0aGlzLmFuZ3VsYXJHcmlkLm9uVmlydHVhbFJvd1NlbGVjdGVkKHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4LCBmYWxzZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgKHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSlcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZGVzZWxlY3RJbmRleCA9IGZ1bmN0aW9uKHJvd0luZGV4KSB7XHJcbiAgICB2YXIgbm9kZSA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvdyhyb3dJbmRleCk7XHJcbiAgICB0aGlzLmRlc2VsZWN0Tm9kZShub2RlKTtcclxufTtcclxuXHJcbi8vIHB1YmxpYyAoYXBpKVxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5kZXNlbGVjdE5vZGUgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICBpZiAobm9kZSkge1xyXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwU2VsZWN0c0NoaWxkcmVuKCkgJiYgbm9kZS5ncm91cCkge1xyXG4gICAgICAgICAgICAvLyB3YW50IHRvIGRlc2VsZWN0IGNoaWxkcmVuLCBub3QgdGhpcyBub2RlLCBzbyByZWN1cnNpdmVseSBkZXNlbGVjdFxyXG4gICAgICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5RGVzZWxlY3RBbGxDaGlsZHJlbihub2RlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRlc2VsZWN0UmVhbE5vZGUobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5zeW5jU2VsZWN0ZWRSb3dzQW5kQ2FsbExpc3RlbmVyKCk7XHJcbiAgICB0aGlzLnVwZGF0ZUdyb3VwUGFyZW50c0lmTmVlZGVkKCk7XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgKHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSAmIGFwaSlcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuc2VsZWN0SW5kZXggPSBmdW5jdGlvbihpbmRleCwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICB2YXIgbm9kZSA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvdyhpbmRleCk7XHJcbiAgICB0aGlzLnNlbGVjdE5vZGUobm9kZSwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuLy8gdXBkYXRlcyB0aGUgc2VsZWN0ZWRSb3dzIHdpdGggdGhlIHNlbGVjdGVkTm9kZXMgYW5kIGNhbGxzIHNlbGVjdGlvbkNoYW5nZWQgbGlzdGVuZXJcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuc3luY1NlbGVjdGVkUm93c0FuZENhbGxMaXN0ZW5lciA9IGZ1bmN0aW9uKHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICAvLyB1cGRhdGUgc2VsZWN0ZWQgcm93c1xyXG4gICAgdmFyIHNlbGVjdGVkUm93cyA9IHRoaXMuc2VsZWN0ZWRSb3dzO1xyXG4gICAgdmFyIG9sZENvdW50ID0gc2VsZWN0ZWRSb3dzLmxlbmd0aDtcclxuICAgIC8vIGNsZWFyIHNlbGVjdGVkIHJvd3NcclxuICAgIHNlbGVjdGVkUm93cy5sZW5ndGggPSAwO1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW2tleXNbaV1dICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkTm9kZSA9IHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRba2V5c1tpXV07XHJcbiAgICAgICAgICAgIHNlbGVjdGVkUm93cy5wdXNoKHNlbGVjdGVkTm9kZS5kYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGhpcyBzdG9wZSB0aGUgZXZlbnQgZmlyaW5nIHRoZSB2ZXJ5IGZpcnN0IHRoZSB0aW1lIGdyaWQgaXMgaW5pdGlhbGlzZWQuIHdpdGhvdXQgdGhpcywgdGhlIGRvY3VtZW50YXRpb25cclxuICAgIC8vIHBhZ2UgaGFkIGEgcG9wdXAgaW4gdGhlICdzZWxlY3Rpb24nIHBhZ2UgYXMgc29vbiBhcyB0aGUgcGFnZSB3YXMgbG9hZGVkISFcclxuICAgIHZhciBub3RoaW5nQ2hhbmdlZE11c3RCZUluaXRpYWxpc2luZyA9IG9sZENvdW50ID09PSAwICYmIHNlbGVjdGVkUm93cy5sZW5ndGggPT09IDA7XHJcblxyXG4gICAgaWYgKCFub3RoaW5nQ2hhbmdlZE11c3RCZUluaXRpYWxpc2luZyAmJiAhc3VwcHJlc3NFdmVudHMgJiYgdHlwZW9mIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFNlbGVjdGlvbkNoYW5nZWQoKSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0U2VsZWN0aW9uQ2hhbmdlZCgpKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgaWYgKHRoaXMuJHNjb3BlKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnJlY3Vyc2l2ZWx5Q2hlY2tJZlNlbGVjdGVkID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIGZvdW5kU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgIHZhciBmb3VuZFVuc2VsZWN0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAobm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQuZ3JvdXApIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMucmVjdXJzaXZlbHlDaGVja0lmU2VsZWN0ZWQoY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFNFTEVDVEVEOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZFNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBVTlNFTEVDVEVEOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZFVuc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIE1JWEVEOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZFNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRVbnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIGNhbiBpZ25vcmUgdGhlIERPX05PVF9DQVJFLCBhcyBpdCBkb2Vzbid0IGltcGFjdCwgbWVhbnMgdGhlIGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGhhcyBubyBjaGlsZHJlbiBhbmQgc2hvdWxkbid0IGJlIGNvbnNpZGVyZWQgd2hlbiBkZWNpZGluZ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNOb2RlU2VsZWN0ZWQoY2hpbGQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmRTZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kVW5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChmb3VuZFNlbGVjdGVkICYmIGZvdW5kVW5zZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgbWl4ZWQsIHRoZW4gbm8gbmVlZCB0byBnbyBmdXJ0aGVyLCBqdXN0IHJldHVybiB1cCB0aGUgY2hhaW5cclxuICAgICAgICAgICAgICAgIHJldHVybiBNSVhFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBnb3QgdGhpcyBmYXIsIHNvIG5vIGNvbmZsaWN0cywgZWl0aGVyIGFsbCBjaGlsZHJlbiBzZWxlY3RlZCwgdW5zZWxlY3RlZCwgb3IgbmVpdGhlclxyXG4gICAgaWYgKGZvdW5kU2VsZWN0ZWQpIHtcclxuICAgICAgICByZXR1cm4gU0VMRUNURUQ7XHJcbiAgICB9IGVsc2UgaWYgKGZvdW5kVW5zZWxlY3RlZCkge1xyXG4gICAgICAgIHJldHVybiBVTlNFTEVDVEVEO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRE9fTk9UX0NBUkU7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgKHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSlcclxuLy8gcmV0dXJuczpcclxuLy8gdHJ1ZTogaWYgc2VsZWN0ZWRcclxuLy8gZmFsc2U6IGlmIHVuc2VsZWN0ZWRcclxuLy8gdW5kZWZpbmVkOiBpZiBpdCdzIGEgZ3JvdXAgYW5kICdjaGlsZHJlbiBzZWxlY3Rpb24nIGlzIHVzZWQgYW5kICdjaGlsZHJlbicgYXJlIGEgbWl4IG9mIHNlbGVjdGVkIGFuZCB1bnNlbGVjdGVkXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmlzTm9kZVNlbGVjdGVkID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBTZWxlY3RzQ2hpbGRyZW4oKSAmJiBub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgLy8gZG9pbmcgY2hpbGQgc2VsZWN0aW9uLCB3ZSBuZWVkIHRvIHRyYXZlcnNlIHRoZSBjaGlsZHJlblxyXG4gICAgICAgIHZhciByZXN1bHRPZkNoaWxkcmVuID0gdGhpcy5yZWN1cnNpdmVseUNoZWNrSWZTZWxlY3RlZChub2RlKTtcclxuICAgICAgICBzd2l0Y2ggKHJlc3VsdE9mQ2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgY2FzZSBTRUxFQ1RFRDpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICBjYXNlIFVOU0VMRUNURUQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRbbm9kZS5pZF0gIT09IHVuZGVmaW5lZDtcclxuICAgIH1cclxufTtcclxuXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZUdyb3VwUGFyZW50c0lmTmVlZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyB3ZSBvbmx5IGRvIHRoaXMgaWYgcGFyZW50IG5vZGVzIGFyZSByZXNwb25zaWJsZVxyXG4gICAgLy8gZm9yIHNlbGVjdGluZyB0aGVpciBjaGlsZHJlbi5cclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cFNlbGVjdHNDaGlsZHJlbigpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBmaXJzdFJvdyA9IHRoaXMucm93UmVuZGVyZXIuZ2V0Rmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3coKTtcclxuICAgIHZhciBsYXN0Um93ID0gdGhpcy5yb3dSZW5kZXJlci5nZXRMYXN0VmlydHVhbFJlbmRlcmVkUm93KCk7XHJcbiAgICBmb3IgKHZhciByb3dJbmRleCA9IGZpcnN0Um93OyByb3dJbmRleCA8PSBsYXN0Um93OyByb3dJbmRleCsrKSB7XHJcbiAgICAgICAgLy8gc2VlIGlmIG5vZGUgaXMgYSBncm91cFxyXG4gICAgICAgIHZhciBub2RlID0gdGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93KHJvd0luZGV4KTtcclxuICAgICAgICBpZiAobm9kZS5ncm91cCkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSB0aGlzLmlzTm9kZVNlbGVjdGVkKG5vZGUpO1xyXG4gICAgICAgICAgICB0aGlzLmFuZ3VsYXJHcmlkLm9uVmlydHVhbFJvd1NlbGVjdGVkKHJvd0luZGV4LCBzZWxlY3RlZCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHV0aWxzLnF1ZXJ5U2VsZWN0b3JBbGxfYWRkQ3NzQ2xhc3ModGhpcy5lUm93c1BhcmVudCwgJ1tyb3c9XCInICsgcm93SW5kZXggKyAnXCJdJywgJ2FnLXJvdy1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdXRpbHMucXVlcnlTZWxlY3RvckFsbF9yZW1vdmVDc3NDbGFzcyh0aGlzLmVSb3dzUGFyZW50LCAnW3Jvdz1cIicgKyByb3dJbmRleCArICdcIl0nLCAnYWctcm93LXNlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdGlvbkNvbnRyb2xsZXI7XHJcbiIsImZ1bmN0aW9uIFNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSgpIHt9XHJcblxyXG5TZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihhbmd1bGFyR3JpZCwgc2VsZWN0aW9uQ29udHJvbGxlcikge1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkO1xyXG4gICAgdGhpcy5zZWxlY3Rpb25Db250cm9sbGVyID0gc2VsZWN0aW9uQ29udHJvbGxlcjtcclxufTtcclxuXHJcblNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlQ2hlY2tib3hDb2xEZWYgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgd2lkdGg6IDMwLFxyXG4gICAgICAgIHN1cHByZXNzTWVudTogdHJ1ZSxcclxuICAgICAgICBzdXBwcmVzc1NvcnRpbmc6IHRydWUsXHJcbiAgICAgICAgaGVhZGVyQ2VsbFJlbmRlcmVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGVDaGVja2JveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgIGVDaGVja2JveC50eXBlID0gJ2NoZWNrYm94JztcclxuICAgICAgICAgICAgZUNoZWNrYm94Lm5hbWUgPSAnbmFtZSc7XHJcbiAgICAgICAgICAgIHJldHVybiBlQ2hlY2tib3g7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjZWxsUmVuZGVyZXI6IHRoaXMuY3JlYXRlQ2hlY2tib3hSZW5kZXJlcigpXHJcbiAgICB9O1xyXG59O1xyXG5cclxuU2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LnByb3RvdHlwZS5jcmVhdGVDaGVja2JveFJlbmRlcmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoYXQuY3JlYXRlU2VsZWN0aW9uQ2hlY2tib3gocGFyYW1zLm5vZGUsIHBhcmFtcy5yb3dJbmRleCk7XHJcbiAgICB9O1xyXG59O1xyXG5cclxuU2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LnByb3RvdHlwZS5jcmVhdGVTZWxlY3Rpb25DaGVja2JveCA9IGZ1bmN0aW9uKG5vZGUsIHJvd0luZGV4KSB7XHJcblxyXG4gICAgdmFyIGVDaGVja2JveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICBlQ2hlY2tib3gudHlwZSA9IFwiY2hlY2tib3hcIjtcclxuICAgIGVDaGVja2JveC5uYW1lID0gXCJuYW1lXCI7XHJcbiAgICBlQ2hlY2tib3guY2xhc3NOYW1lID0gJ2FnLXNlbGVjdGlvbi1jaGVja2JveCc7XHJcbiAgICBzZXRDaGVja2JveFN0YXRlKGVDaGVja2JveCwgdGhpcy5zZWxlY3Rpb25Db250cm9sbGVyLmlzTm9kZVNlbGVjdGVkKG5vZGUpKTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBlQ2hlY2tib3gub25jbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGVDaGVja2JveC5vbmNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IGVDaGVja2JveC5jaGVja2VkO1xyXG4gICAgICAgIGlmIChuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuc2VsZWN0SW5kZXgocm93SW5kZXgsIHRydWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5kZXNlbGVjdEluZGV4KHJvd0luZGV4KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuYW5ndWxhckdyaWQuYWRkVmlydHVhbFJvd0xpc3RlbmVyKHJvd0luZGV4LCB7XHJcbiAgICAgICAgcm93U2VsZWN0ZWQ6IGZ1bmN0aW9uKHNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgIHNldENoZWNrYm94U3RhdGUoZUNoZWNrYm94LCBzZWxlY3RlZCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByb3dSZW1vdmVkOiBmdW5jdGlvbigpIHt9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gZUNoZWNrYm94O1xyXG59O1xyXG5cclxuZnVuY3Rpb24gc2V0Q2hlY2tib3hTdGF0ZShlQ2hlY2tib3gsIHN0YXRlKSB7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSAnYm9vbGVhbicpIHtcclxuICAgICAgICBlQ2hlY2tib3guY2hlY2tlZCA9IHN0YXRlO1xyXG4gICAgICAgIGVDaGVja2JveC5pbmRldGVybWluYXRlID0gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGlzTm9kZVNlbGVjdGVkIHJldHVybnMgYmFjayB1bmRlZmluZWQgaWYgaXQncyBhIGdyb3VwIGFuZCB0aGUgY2hpbGRyZW5cclxuICAgICAgICAvLyBhcmUgYSBtaXggb2Ygc2VsZWN0ZWQgYW5kIHVuc2VsZWN0ZWRcclxuICAgICAgICBlQ2hlY2tib3guaW5kZXRlcm1pbmF0ZSA9IHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5O1xyXG4iLCJ2YXIgU1ZHX05TID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO1xyXG5cclxuZnVuY3Rpb24gU3ZnRmFjdG9yeSgpIHt9XHJcblxyXG5TdmdGYWN0b3J5LnByb3RvdHlwZS5jcmVhdGVGaWx0ZXJTdmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBlU3ZnID0gY3JlYXRlSWNvblN2ZygpO1xyXG5cclxuICAgIHZhciBlRnVubmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgXCJwb2x5Z29uXCIpO1xyXG4gICAgZUZ1bm5lbC5zZXRBdHRyaWJ1dGUoXCJwb2ludHNcIiwgXCIwLDAgNCw0IDQsMTAgNiwxMCA2LDQgMTAsMFwiKTtcclxuICAgIGVGdW5uZWwuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJhZy1oZWFkZXItaWNvblwiKTtcclxuICAgIGVTdmcuYXBwZW5kQ2hpbGQoZUZ1bm5lbCk7XHJcblxyXG4gICAgcmV0dXJuIGVTdmc7XHJcbn07XHJcblxyXG5TdmdGYWN0b3J5LnByb3RvdHlwZS5jcmVhdGVNZW51U3ZnID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZVN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsIFwic3ZnXCIpO1xyXG4gICAgdmFyIHNpemUgPSBcIjEyXCI7XHJcbiAgICBlU3ZnLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIHNpemUpO1xyXG4gICAgZVN2Zy5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgc2l6ZSk7XHJcblxyXG4gICAgW1wiMFwiLCBcIjVcIiwgXCIxMFwiXS5mb3JFYWNoKGZ1bmN0aW9uKHkpIHtcclxuICAgICAgICB2YXIgZUxpbmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCBcInJlY3RcIik7XHJcbiAgICAgICAgZUxpbmUuc2V0QXR0cmlidXRlKFwieVwiLCB5KTtcclxuICAgICAgICBlTGluZS5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBzaXplKTtcclxuICAgICAgICBlTGluZS5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgXCIyXCIpO1xyXG4gICAgICAgIGVMaW5lLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiYWctaGVhZGVyLWljb25cIik7XHJcbiAgICAgICAgZVN2Zy5hcHBlbmRDaGlsZChlTGluZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gZVN2ZztcclxufTtcclxuXHJcblN2Z0ZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZUFycm93VXBTdmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBjcmVhdGVQb2x5Z29uU3ZnKFwiMCwxMCA1LDAgMTAsMTBcIik7XHJcbn07XHJcblxyXG5TdmdGYWN0b3J5LnByb3RvdHlwZS5jcmVhdGVBcnJvd0xlZnRTdmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBjcmVhdGVQb2x5Z29uU3ZnKFwiMTAsMCAwLDUgMTAsMTBcIik7XHJcbn07XHJcblxyXG5TdmdGYWN0b3J5LnByb3RvdHlwZS5jcmVhdGVBcnJvd0Rvd25TdmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBjcmVhdGVQb2x5Z29uU3ZnKFwiMCwwIDUsMTAgMTAsMFwiKTtcclxufTtcclxuXHJcblN2Z0ZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZUFycm93UmlnaHRTdmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBjcmVhdGVQb2x5Z29uU3ZnKFwiMCwwIDEwLDUgMCwxMFwiKTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVBvbHlnb25TdmcocG9pbnRzKSB7XHJcbiAgICB2YXIgZVN2ZyA9IGNyZWF0ZUljb25TdmcoKTtcclxuXHJcbiAgICB2YXIgZURlc2NJY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgXCJwb2x5Z29uXCIpO1xyXG4gICAgZURlc2NJY29uLnNldEF0dHJpYnV0ZShcInBvaW50c1wiLCBwb2ludHMpO1xyXG4gICAgZVN2Zy5hcHBlbmRDaGlsZChlRGVzY0ljb24pO1xyXG5cclxuICAgIHJldHVybiBlU3ZnO1xyXG59XHJcblxyXG4vLyB1dGlsIGZ1bmN0aW9uIGZvciB0aGUgYWJvdmVcclxuZnVuY3Rpb24gY3JlYXRlSWNvblN2ZygpIHtcclxuICAgIHZhciBlU3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgXCJzdmdcIik7XHJcbiAgICBlU3ZnLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIFwiMTBcIik7XHJcbiAgICBlU3ZnLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBcIjEwXCIpO1xyXG4gICAgcmV0dXJuIGVTdmc7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3ZnRmFjdG9yeTtcclxuIiwiXHJcbmZ1bmN0aW9uIFRlbXBsYXRlU2VydmljZSgpIHtcclxuICAgIHRoaXMudGVtcGxhdGVDYWNoZSA9IHt9O1xyXG4gICAgdGhpcy53YWl0aW5nQ2FsbGJhY2tzID0ge307XHJcbn1cclxuXHJcblRlbXBsYXRlU2VydmljZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgkc2NvcGUpIHtcclxuICAgIHRoaXMuJHNjb3BlID0gJHNjb3BlO1xyXG59O1xyXG5cclxuLy8gcmV0dXJucyB0aGUgdGVtcGxhdGUgaWYgaXQgaXMgbG9hZGVkLCBvciBudWxsIGlmIGl0IGlzIG5vdCBsb2FkZWRcclxuLy8gYnV0IHdpbGwgY2FsbCB0aGUgY2FsbGJhY2sgd2hlbiBpdCBpcyBsb2FkZWRcclxuVGVtcGxhdGVTZXJ2aWNlLnByb3RvdHlwZS5nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKSB7XHJcblxyXG4gICAgdmFyIHRlbXBsYXRlRnJvbUNhY2hlID0gdGhpcy50ZW1wbGF0ZUNhY2hlW3VybF07XHJcbiAgICBpZiAodGVtcGxhdGVGcm9tQ2FjaGUpIHtcclxuICAgICAgICByZXR1cm4gdGVtcGxhdGVGcm9tQ2FjaGU7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNhbGxiYWNrTGlzdCA9IHRoaXMud2FpdGluZ0NhbGxiYWNrc1t1cmxdO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgaWYgKCFjYWxsYmFja0xpc3QpIHtcclxuICAgICAgICAvLyBmaXJzdCB0aW1lIHRoaXMgd2FzIGNhbGxlZCwgc28gbmVlZCBhIG5ldyBsaXN0IGZvciBjYWxsYmFja3NcclxuICAgICAgICBjYWxsYmFja0xpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLndhaXRpbmdDYWxsYmFja3NbdXJsXSA9IGNhbGxiYWNrTGlzdDtcclxuICAgICAgICAvLyBhbmQgYWxzbyBuZWVkIHRvIGRvIHRoZSBodHRwIHJlcXVlc3RcclxuICAgICAgICB2YXIgY2xpZW50ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgY2xpZW50Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHsgdGhhdC5oYW5kbGVIdHRwUmVzdWx0KHRoaXMsIHVybCk7IH07XHJcbiAgICAgICAgY2xpZW50Lm9wZW4oXCJHRVRcIiwgdXJsKTtcclxuICAgICAgICBjbGllbnQuc2VuZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFkZCB0aGlzIGNhbGxiYWNrXHJcbiAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICBjYWxsYmFja0xpc3QucHVzaChjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2FsbGVyIG5lZWRzIHRvIHdhaXQgZm9yIHRlbXBsYXRlIHRvIGxvYWQsIHNvIHJldHVybiBudWxsXHJcbiAgICByZXR1cm4gbnVsbDtcclxufTtcclxuXHJcblRlbXBsYXRlU2VydmljZS5wcm90b3R5cGUuaGFuZGxlSHR0cFJlc3VsdCA9IGZ1bmN0aW9uIChodHRwUmVzdWx0LCB1cmwpIHtcclxuXHJcbiAgICBpZiAoaHR0cFJlc3VsdC5zdGF0dXMgIT09IDIwMCB8fCBodHRwUmVzdWx0LnJlc3BvbnNlID09PSBudWxsKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1VuYWJsZSB0byBnZXQgdGVtcGxhdGUgZXJyb3IgJyArIGh0dHBSZXN1bHQuc3RhdHVzICsgJyAtICcgKyB1cmwpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZXNwb25zZSBzdWNjZXNzLCBzbyBwcm9jZXNzIGl0XHJcbiAgICB0aGlzLnRlbXBsYXRlQ2FjaGVbdXJsXSA9IGh0dHBSZXN1bHQucmVzcG9uc2U7XHJcblxyXG4gICAgLy8gaW5mb3JtIGFsbCBsaXN0ZW5lcnMgdGhhdCB0aGlzIGlzIG5vdyBpbiB0aGUgY2FjaGVcclxuICAgIHZhciBjYWxsYmFja3MgPSB0aGlzLndhaXRpbmdDYWxsYmFja3NbdXJsXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gY2FsbGJhY2tzW2ldO1xyXG4gICAgICAgIC8vIHdlIGNvdWxkIHBhc3MgdGhlIGNhbGxiYWNrIHRoZSByZXNwb25zZSwgaG93ZXZlciB3ZSBrbm93IHRoZSBjbGllbnQgb2YgdGhpcyBjb2RlXHJcbiAgICAgICAgLy8gaXMgdGhlIGNlbGwgcmVuZGVyZXIsIGFuZCBpdCBwYXNzZXMgdGhlICdjZWxsUmVmcmVzaCcgbWV0aG9kIGluIGFzIHRoZSBjYWxsYmFja1xyXG4gICAgICAgIC8vIHdoaWNoIGRvZXNuJ3QgdGFrZSBhbnkgcGFyYW1ldGVycy5cclxuICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLiRzY29wZSkge1xyXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LiRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9LCAwKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGVtcGxhdGVTZXJ2aWNlO1xyXG4iLCJ2YXIgQ2hlY2tib3hTZWxlY3Rpb24gPSByZXF1aXJlKFwiLi4vd2lkZ2V0cy9jaGVja2JveFNlbGVjdGlvblwiKTtcclxuXHJcbmZ1bmN0aW9uIENvbHVtblNlbGVjdGlvblBhbmVsKGNvbHVtbkNvbnRyb2xsZXIpIHtcclxuICAgIHRoaXMuZUd1aSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgdGhpcy5zZXR1cENvbXBvbmVudHMoKTtcclxuICAgIHRoaXMuY29sdW1uQ29udHJvbGxlciA9IGNvbHVtbkNvbnRyb2xsZXI7XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5jb2x1bW5Db250cm9sbGVyLmFkZExpc3RlbmVyKHtcclxuICAgICAgICBjb2x1bW5zQ2hhbmdlZDogdGhhdC5jb2x1bW5zQ2hhbmdlZC5iaW5kKHRoYXQpXHJcbiAgICB9KTtcclxufVxyXG5cclxuQ29sdW1uU2VsZWN0aW9uUGFuZWwucHJvdG90eXBlLmNvbHVtbnNDaGFuZ2VkID0gZnVuY3Rpb24obmV3Q29sdW1ucykge1xyXG4gICAgdGhpcy5jQ29sdW1uTGlzdC5zZXRNb2RlbChuZXdDb2x1bW5zKTtcclxufTtcclxuXHJcbkNvbHVtblNlbGVjdGlvblBhbmVsLnByb3RvdHlwZS5zZXR1cENvbXBvbmVudHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY0NvbHVtbkxpc3QgPSBuZXcgQ2hlY2tib3hTZWxlY3Rpb24oKTtcclxuICAgIHRoaXMuZUd1aS5hcHBlbmRDaGlsZCh0aGlzLmNDb2x1bW5MaXN0LmdldEd1aSgpKTtcclxuXHJcbiAgICB2YXIgY29sdW1uSXRlbVByb3h5ID0gdGhpcy5jcmVhdGVDb2x1bW5JdGVtUHJveHkoKTtcclxuICAgIHRoaXMuY0NvbHVtbkxpc3Quc2V0SXRlbVByb3h5KGNvbHVtbkl0ZW1Qcm94eSk7XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5jQ29sdW1uTGlzdC5hZGRJdGVtTW92ZWRMaXN0ZW5lciggZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhhdC5jb2x1bW5Db250cm9sbGVyLm9uQ29sdW1uU3RhdGVDaGFuZ2VkKCk7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkNvbHVtblNlbGVjdGlvblBhbmVsLnByb3RvdHlwZS5jcmVhdGVDb2x1bW5JdGVtUHJveHkgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0VGV4dDogZnVuY3Rpb24oaXRlbSkgeyByZXR1cm4gdGhhdC5jb2x1bW5Db250cm9sbGVyLmdldERpc3BsYXlOYW1lRm9yQ29sKGl0ZW0pfSxcclxuICAgICAgICBpc1NlbGVjdGVkOiBmdW5jdGlvbihpdGVtKSB7IHJldHVybiBpdGVtLnZpc2libGV9LFxyXG4gICAgICAgIHNldFNlbGVjdGVkOiBmdW5jdGlvbihpdGVtLCBzZWxlY3RlZCkgeyB0aGF0LnNldFNlbGVjdGVkKGl0ZW0sIHNlbGVjdGVkKTsgfVxyXG4gICAgfTtcclxufTtcclxuXHJcbkNvbHVtblNlbGVjdGlvblBhbmVsLnByb3RvdHlwZS5zZXRTZWxlY3RlZCA9IGZ1bmN0aW9uKGNvbHVtbiwgc2VsZWN0ZWQpIHtcclxuICAgIGNvbHVtbi52aXNpYmxlID0gc2VsZWN0ZWQ7XHJcbiAgICB0aGlzLmNvbHVtbkNvbnRyb2xsZXIub25Db2x1bW5TdGF0ZUNoYW5nZWQoKTtcclxufTtcclxuXHJcbkNvbHVtblNlbGVjdGlvblBhbmVsLnByb3RvdHlwZS5nZXRHdWkgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmVHdWk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbHVtblNlbGVjdGlvblBhbmVsO1xyXG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xyXG52YXIgQ29sdW1uU2VsZWN0aW9uUGFuZWwgPSByZXF1aXJlKCcuL2NvbHVtblNlbGVjdGlvblBhbmVsJyk7XHJcblxyXG5mdW5jdGlvbiBUb29sUGFuZWwoKSB7XHJcbn1cclxuXHJcblRvb2xQYW5lbC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGVUb29sUGFuZWxDb250YWluZXIsIGNvbHVtbkNvbnRyb2xsZXIpIHtcclxuICAgIHZhciBlR3VpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBlR3VpLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcclxuICAgIGVUb29sUGFuZWxDb250YWluZXIuYXBwZW5kQ2hpbGQoZUd1aSk7XHJcblxyXG4gICAgdmFyIGNvbHVtblNlbGVjdGlvblBhbmVsID0gbmV3IENvbHVtblNlbGVjdGlvblBhbmVsKGNvbHVtbkNvbnRyb2xsZXIpO1xyXG4gICAgZUd1aS5hcHBlbmRDaGlsZChjb2x1bW5TZWxlY3Rpb25QYW5lbC5nZXRHdWkoKSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRvb2xQYW5lbDtcclxuIiwiZnVuY3Rpb24gVXRpbHMoKSB7fVxyXG5cclxudmFyIEZVTkNUSU9OX1NUUklQX0NPTU1FTlRTID0gLygoXFwvXFwvLiokKXwoXFwvXFwqW1xcc1xcU10qP1xcKlxcLykpL21nO1xyXG52YXIgRlVOQ1RJT05fQVJHVU1FTlRfTkFNRVMgPSAvKFteXFxzLF0rKS9nO1xyXG5cclxuVXRpbHMucHJvdG90eXBlLml0ZXJhdGVPYmplY3QgPSBmdW5jdGlvbihvYmplY3QsIGNhbGxiYWNrKSB7XHJcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaTxrZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XHJcbiAgICAgICAgdmFyIHZhbHVlID0gb2JqZWN0W2tleV07XHJcbiAgICAgICAgY2FsbGJhY2soa2V5LCB2YWx1ZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24oYXJyYXksIGNhbGxiYWNrKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaTxhcnJheS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBpdGVtID0gYXJyYXlbaV07XHJcbiAgICAgICAgdmFyIG1hcHBlZEl0ZW0gPSBjYWxsYmFjayhpdGVtKTtcclxuICAgICAgICByZXN1bHQucHVzaChtYXBwZWRJdGVtKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUuZ2V0RnVuY3Rpb25QYXJhbWV0ZXJzID0gZnVuY3Rpb24oZnVuYykge1xyXG4gICAgdmFyIGZuU3RyID0gZnVuYy50b1N0cmluZygpLnJlcGxhY2UoRlVOQ1RJT05fU1RSSVBfQ09NTUVOVFMsICcnKTtcclxuICAgIHZhciByZXN1bHQgPSBmblN0ci5zbGljZShmblN0ci5pbmRleE9mKCcoJykrMSwgZm5TdHIuaW5kZXhPZignKScpKS5tYXRjaChGVU5DVElPTl9BUkdVTUVOVF9OQU1FUyk7XHJcbiAgICBpZiAocmVzdWx0ID09PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnRvU3RyaW5ncyA9IGZ1bmN0aW9uKGFycmF5KSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXAoYXJyYXksIGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgaWYgKGl0ZW0gPT09IHVuZGVmaW5lZCB8fCBpdGVtID09PSBudWxsIHx8ICFpdGVtLnRvU3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vKlxyXG5VdGlscy5wcm90b3R5cGUub2JqZWN0VmFsdWVzVG9BcnJheSA9IGZ1bmN0aW9uKG9iamVjdCkge1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpO1xyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGk8a2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IG9iamVjdFtrZXldO1xyXG4gICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcbiovXHJcblxyXG5VdGlscy5wcm90b3R5cGUuaXRlcmF0ZUFycmF5ID0gZnVuY3Rpb24oYXJyYXksIGNhbGxiYWNrKSB7XHJcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4PGFycmF5Lmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IGFycmF5W2luZGV4XTtcclxuICAgICAgICBjYWxsYmFjayh2YWx1ZSwgaW5kZXgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24oZXhwcmVzc2lvblNlcnZpY2UsIGRhdGEsIGNvbERlZiwgbm9kZSwgYXBpLCBjb250ZXh0KSB7XHJcblxyXG4gICAgdmFyIHZhbHVlR2V0dGVyID0gY29sRGVmLnZhbHVlR2V0dGVyO1xyXG4gICAgdmFyIGZpZWxkID0gY29sRGVmLmZpZWxkO1xyXG5cclxuICAgIC8vIGlmIHRoZXJlIGlzIGEgdmFsdWUgZ2V0dGVyLCB0aGlzIGdldHMgcHJlY2VkZW5jZSBvdmVyIGEgZmllbGRcclxuICAgIGlmICh2YWx1ZUdldHRlcikge1xyXG5cclxuICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgYXBpOiBhcGksXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlR2V0dGVyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIC8vIHZhbHVlR2V0dGVyIGlzIGEgZnVuY3Rpb24sIHNvIGp1c3QgY2FsbCBpdFxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVHZXR0ZXIocGFyYW1zKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZUdldHRlciA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgLy8gdmFsdWVHZXR0ZXIgaXMgYW4gZXhwcmVzc2lvbiwgc28gZXhlY3V0ZSB0aGUgZXhwcmVzc2lvblxyXG4gICAgICAgICAgICByZXR1cm4gZXhwcmVzc2lvblNlcnZpY2UuZXZhbHVhdGUodmFsdWVHZXR0ZXIsIHBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSBpZiAoZmllbGQgJiYgZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBkYXRhW2ZpZWxkXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxufTtcclxuXHJcbi8vUmV0dXJucyB0cnVlIGlmIGl0IGlzIGEgRE9NIG5vZGVcclxuLy90YWtlbiBmcm9tOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM4NDI4Ni9qYXZhc2NyaXB0LWlzZG9tLWhvdy1kby15b3UtY2hlY2staWYtYS1qYXZhc2NyaXB0LW9iamVjdC1pcy1hLWRvbS1vYmplY3RcclxuVXRpbHMucHJvdG90eXBlLmlzTm9kZSA9IGZ1bmN0aW9uKG8pIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgdHlwZW9mIE5vZGUgPT09IFwib2JqZWN0XCIgPyBvIGluc3RhbmNlb2YgTm9kZSA6XHJcbiAgICAgICAgbyAmJiB0eXBlb2YgbyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2Ygby5ub2RlVHlwZSA9PT0gXCJudW1iZXJcIiAmJiB0eXBlb2Ygby5ub2RlTmFtZSA9PT0gXCJzdHJpbmdcIlxyXG4gICAgKTtcclxufTtcclxuXHJcbi8vUmV0dXJucyB0cnVlIGlmIGl0IGlzIGEgRE9NIGVsZW1lbnRcclxuLy90YWtlbiBmcm9tOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM4NDI4Ni9qYXZhc2NyaXB0LWlzZG9tLWhvdy1kby15b3UtY2hlY2staWYtYS1qYXZhc2NyaXB0LW9iamVjdC1pcy1hLWRvbS1vYmplY3RcclxuVXRpbHMucHJvdG90eXBlLmlzRWxlbWVudCA9IGZ1bmN0aW9uKG8pIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgdHlwZW9mIEhUTUxFbGVtZW50ID09PSBcIm9iamVjdFwiID8gbyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50IDogLy9ET00yXHJcbiAgICAgICAgbyAmJiB0eXBlb2YgbyA9PT0gXCJvYmplY3RcIiAmJiBvICE9PSBudWxsICYmIG8ubm9kZVR5cGUgPT09IDEgJiYgdHlwZW9mIG8ubm9kZU5hbWUgPT09IFwic3RyaW5nXCJcclxuICAgICk7XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUuaXNOb2RlT3JFbGVtZW50ID0gZnVuY3Rpb24obykge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNOb2RlKG8pIHx8IHRoaXMuaXNFbGVtZW50KG8pO1xyXG59O1xyXG5cclxuLy9hZGRzIGFsbCB0eXBlIG9mIGNoYW5nZSBsaXN0ZW5lcnMgdG8gYW4gZWxlbWVudCwgaW50ZW5kZWQgdG8gYmUgYSB0ZXh0IGZpZWxkXHJcblV0aWxzLnByb3RvdHlwZS5hZGRDaGFuZ2VMaXN0ZW5lciA9IGZ1bmN0aW9uKGVsZW1lbnQsIGxpc3RlbmVyKSB7XHJcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VkXCIsIGxpc3RlbmVyKTtcclxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInBhc3RlXCIsIGxpc3RlbmVyKTtcclxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIGxpc3RlbmVyKTtcclxufTtcclxuXHJcbi8vaWYgdmFsdWUgaXMgdW5kZWZpbmVkLCBudWxsIG9yIGJsYW5rLCByZXR1cm5zIG51bGwsIG90aGVyd2lzZSByZXR1cm5zIHRoZSB2YWx1ZVxyXG5VdGlscy5wcm90b3R5cGUubWFrZU51bGwgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IFwiXCIpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnJlbW92ZUFsbENoaWxkcmVuID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKG5vZGUpIHtcclxuICAgICAgICB3aGlsZSAobm9kZS5oYXNDaGlsZE5vZGVzKCkpIHtcclxuICAgICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZChub2RlLmxhc3RDaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy9hZGRzIGFuIGVsZW1lbnQgdG8gYSBkaXYsIGJ1dCBhbHNvIGFkZHMgYSBiYWNrZ3JvdW5kIGNoZWNraW5nIGZvciBjbGlja3MsXHJcbi8vc28gdGhhdCB3aGVuIHRoZSBiYWNrZ3JvdW5kIGlzIGNsaWNrZWQsIHRoZSBjaGlsZCBpcyByZW1vdmVkIGFnYWluLCBnaXZpbmdcclxuLy9hIG1vZGVsIGxvb2sgdG8gcG9wdXBzLlxyXG5VdGlscy5wcm90b3R5cGUuYWRkQXNNb2RhbFBvcHVwID0gZnVuY3Rpb24oZVBhcmVudCwgZUNoaWxkKSB7XHJcbiAgICB2YXIgZUJhY2tkcm9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIGVCYWNrZHJvcC5jbGFzc05hbWUgPSBcImFnLXBvcHVwLWJhY2tkcm9wXCI7XHJcblxyXG4gICAgZUJhY2tkcm9wLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBlUGFyZW50LnJlbW92ZUNoaWxkKGVDaGlsZCk7XHJcbiAgICAgICAgZVBhcmVudC5yZW1vdmVDaGlsZChlQmFja2Ryb3ApO1xyXG4gICAgfTtcclxuXHJcbiAgICBlUGFyZW50LmFwcGVuZENoaWxkKGVCYWNrZHJvcCk7XHJcbiAgICBlUGFyZW50LmFwcGVuZENoaWxkKGVDaGlsZCk7XHJcbn07XHJcblxyXG4vL2xvYWRzIHRoZSB0ZW1wbGF0ZSBhbmQgcmV0dXJucyBpdCBhcyBhbiBlbGVtZW50LiBtYWtlcyB1cCBmb3Igbm8gc2ltcGxlIHdheSBpblxyXG4vL3RoZSBkb20gYXBpIHRvIGxvYWQgaHRtbCBkaXJlY3RseSwgZWcgd2UgY2Fubm90IGRvIHRoaXM6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGVtcGxhdGUpXHJcblV0aWxzLnByb3RvdHlwZS5sb2FkVGVtcGxhdGUgPSBmdW5jdGlvbih0ZW1wbGF0ZSkge1xyXG4gICAgdmFyIHRlbXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgdGVtcERpdi5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcclxuICAgIHJldHVybiB0ZW1wRGl2LmZpcnN0Q2hpbGQ7XHJcbn07XHJcblxyXG4vL2lmIHBhc3NlZCAnNDJweCcgdGhlbiByZXR1cm5zIHRoZSBudW1iZXIgNDJcclxuVXRpbHMucHJvdG90eXBlLnBpeGVsU3RyaW5nVG9OdW1iZXIgPSBmdW5jdGlvbih2YWwpIHtcclxuICAgIGlmICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgaWYgKHZhbC5pbmRleE9mKFwicHhcIikgPj0gMCkge1xyXG4gICAgICAgICAgICB2YWwucmVwbGFjZShcInB4XCIsIFwiXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQodmFsKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbDtcclxuICAgIH1cclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5xdWVyeVNlbGVjdG9yQWxsX2FkZENzc0NsYXNzID0gZnVuY3Rpb24oZVBhcmVudCwgc2VsZWN0b3IsIGNzc0NsYXNzKSB7XHJcbiAgICB2YXIgZVJvd3MgPSBlUGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBlUm93cy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgIHRoaXMuYWRkQ3NzQ2xhc3MoZVJvd3Nba10sIGNzc0NsYXNzKTtcclxuICAgIH1cclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5xdWVyeVNlbGVjdG9yQWxsX3JlbW92ZUNzc0NsYXNzID0gZnVuY3Rpb24oZVBhcmVudCwgc2VsZWN0b3IsIGNzc0NsYXNzKSB7XHJcbiAgICB2YXIgZVJvd3MgPSBlUGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBlUm93cy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlQ3NzQ2xhc3MoZVJvd3Nba10sIGNzc0NsYXNzKTtcclxuICAgIH1cclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5xdWVyeVNlbGVjdG9yQWxsX3JlcGxhY2VDc3NDbGFzcyA9IGZ1bmN0aW9uKGVQYXJlbnQsIHNlbGVjdG9yLCBjc3NDbGFzc1RvUmVtb3ZlLCBjc3NDbGFzc1RvQWRkKSB7XHJcbiAgICB2YXIgZVJvd3MgPSBlUGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBlUm93cy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlQ3NzQ2xhc3MoZVJvd3Nba10sIGNzc0NsYXNzVG9SZW1vdmUpO1xyXG4gICAgICAgIHRoaXMuYWRkQ3NzQ2xhc3MoZVJvd3Nba10sIGNzc0NsYXNzVG9BZGQpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLmFkZE9yUmVtb3ZlQ3NzQ2xhc3MgPSBmdW5jdGlvbihlbGVtZW50LCBjbGFzc05hbWUsIGFkZE9yUmVtb3ZlKSB7XHJcbiAgICBpZiAoYWRkT3JSZW1vdmUpIHtcclxuICAgICAgICB0aGlzLmFkZENzc0NsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlQ3NzQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lKTtcclxuICAgIH1cclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5hZGRDc3NDbGFzcyA9IGZ1bmN0aW9uKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xyXG4gICAgaWYgKGVsZW1lbnQuY2xhc3NOYW1lICYmIGVsZW1lbnQuY2xhc3NOYW1lLmxlbmd0aCA+IDApIHtcclxuICAgICAgICB2YXIgY3NzQ2xhc3NlcyA9IGVsZW1lbnQuY2xhc3NOYW1lLnNwbGl0KCcgJyk7XHJcbiAgICAgICAgaWYgKGNzc0NsYXNzZXMuaW5kZXhPZihjbGFzc05hbWUpIDwgMCkge1xyXG4gICAgICAgICAgICBjc3NDbGFzc2VzLnB1c2goY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSBjc3NDbGFzc2VzLmpvaW4oJyAnKTtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnJlbW92ZUNzc0NsYXNzID0gZnVuY3Rpb24oZWxlbWVudCwgY2xhc3NOYW1lKSB7XHJcbiAgICBpZiAoZWxlbWVudC5jbGFzc05hbWUgJiYgZWxlbWVudC5jbGFzc05hbWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHZhciBjc3NDbGFzc2VzID0gZWxlbWVudC5jbGFzc05hbWUuc3BsaXQoJyAnKTtcclxuICAgICAgICB2YXIgaW5kZXggPSBjc3NDbGFzc2VzLmluZGV4T2YoY2xhc3NOYW1lKTtcclxuICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xyXG4gICAgICAgICAgICBjc3NDbGFzc2VzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gY3NzQ2xhc3Nlcy5qb2luKCcgJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnJlbW92ZUZyb21BcnJheSA9IGZ1bmN0aW9uKGFycmF5LCBvYmplY3QpIHtcclxuICAgIGFycmF5LnNwbGljZShhcnJheS5pbmRleE9mKG9iamVjdCksIDEpO1xyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLmRlZmF1bHRDb21wYXJhdG9yID0gZnVuY3Rpb24odmFsdWVBLCB2YWx1ZUIpIHtcclxuICAgIHZhciB2YWx1ZUFNaXNzaW5nID0gdmFsdWVBID09PSBudWxsIHx8IHZhbHVlQSA9PT0gdW5kZWZpbmVkO1xyXG4gICAgdmFyIHZhbHVlQk1pc3NpbmcgPSB2YWx1ZUIgPT09IG51bGwgfHwgdmFsdWVCID09PSB1bmRlZmluZWQ7XHJcbiAgICBpZiAodmFsdWVBTWlzc2luZyAmJiB2YWx1ZUJNaXNzaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBpZiAodmFsdWVBTWlzc2luZykge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuICAgIGlmICh2YWx1ZUJNaXNzaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHZhbHVlQSA8IHZhbHVlQikge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH0gZWxzZSBpZiAodmFsdWVBID4gdmFsdWVCKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLmZvcm1hdFdpZHRoID0gZnVuY3Rpb24od2lkdGgpIHtcclxuICAgIGlmICh0eXBlb2Ygd2lkdGggPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICByZXR1cm4gd2lkdGggKyBcInB4XCI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB3aWR0aDtcclxuICAgIH1cclxufTtcclxuXHJcbi8vIHRyaWVzIHRvIHVzZSB0aGUgcHJvdmlkZWQgcmVuZGVyZXIuIGlmIGEgcmVuZGVyZXIgZm91bmQsIHJldHVybnMgdHJ1ZS5cclxuLy8gaWYgbm8gcmVuZGVyZXIsIHJldHVybnMgZmFsc2UuXHJcblV0aWxzLnByb3RvdHlwZS51c2VSZW5kZXJlciA9IGZ1bmN0aW9uKGVQYXJlbnQsIGVSZW5kZXJlciwgcGFyYW1zKSB7XHJcbiAgICB2YXIgcmVzdWx0RnJvbVJlbmRlcmVyID0gZVJlbmRlcmVyKHBhcmFtcyk7XHJcbiAgICBpZiAodGhpcy5pc05vZGUocmVzdWx0RnJvbVJlbmRlcmVyKSB8fCB0aGlzLmlzRWxlbWVudChyZXN1bHRGcm9tUmVuZGVyZXIpKSB7XHJcbiAgICAgICAgLy9hIGRvbSBub2RlIG9yIGVsZW1lbnQgd2FzIHJldHVybmVkLCBzbyBhZGQgY2hpbGRcclxuICAgICAgICBlUGFyZW50LmFwcGVuZENoaWxkKHJlc3VsdEZyb21SZW5kZXJlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vb3RoZXJ3aXNlIGFzc3VtZSBpdCB3YXMgaHRtbCwgc28ganVzdCBpbnNlcnRcclxuICAgICAgICB2YXIgZVRleHRTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgIGVUZXh0U3Bhbi5pbm5lckhUTUwgPSByZXN1bHRGcm9tUmVuZGVyZXI7XHJcbiAgICAgICAgZVBhcmVudC5hcHBlbmRDaGlsZChlVGV4dFNwYW4pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gaWYgaWNvbiBwcm92aWRlZCwgdXNlIHRoaXMgKGVpdGhlciBhIHN0cmluZywgb3IgYSBmdW5jdGlvbiBjYWxsYmFjaykuXHJcbi8vIGlmIG5vdCwgdGhlbiB1c2UgdGhlIHNlY29uZCBwYXJhbWV0ZXIsIHdoaWNoIGlzIHRoZSBzdmdGYWN0b3J5IGZ1bmN0aW9uXHJcblV0aWxzLnByb3RvdHlwZS5jcmVhdGVJY29uID0gZnVuY3Rpb24oaWNvbk5hbWUsIGdyaWRPcHRpb25zV3JhcHBlciwgY29sRGVmV3JhcHBlciwgc3ZnRmFjdG9yeUZ1bmMpIHtcclxuICAgIHZhciBlUmVzdWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgdmFyIHVzZXJQcm92aWRlZEljb247XHJcbiAgICAvLyBjaGVjayBjb2wgZm9yIGljb24gZmlyc3RcclxuICAgIGlmIChjb2xEZWZXcmFwcGVyICYmIGNvbERlZldyYXBwZXIuY29sRGVmLmljb25zKSB7XHJcbiAgICAgICAgdXNlclByb3ZpZGVkSWNvbiA9IGNvbERlZldyYXBwZXIuY29sRGVmLmljb25zW2ljb25OYW1lXTtcclxuICAgIH1cclxuICAgIC8vIGl0IG5vdCBpbiBjb2wsIHRyeSBncmlkIG9wdGlvbnNcclxuICAgIGlmICghdXNlclByb3ZpZGVkSWNvbiAmJiBncmlkT3B0aW9uc1dyYXBwZXIuZ2V0SWNvbnMoKSkge1xyXG4gICAgICAgIHVzZXJQcm92aWRlZEljb24gPSBncmlkT3B0aW9uc1dyYXBwZXIuZ2V0SWNvbnMoKVtpY29uTmFtZV07XHJcbiAgICB9XHJcbiAgICAvLyBub3cgaWYgdXNlciBwcm92aWRlZCwgdXNlIGl0XHJcbiAgICBpZiAodXNlclByb3ZpZGVkSWNvbikge1xyXG4gICAgICAgIHZhciByZW5kZXJlclJlc3VsdDtcclxuICAgICAgICBpZiAodHlwZW9mIHVzZXJQcm92aWRlZEljb24gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgcmVuZGVyZXJSZXN1bHQgPSB1c2VyUHJvdmlkZWRJY29uKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdXNlclByb3ZpZGVkSWNvbiA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgcmVuZGVyZXJSZXN1bHQgPSB1c2VyUHJvdmlkZWRJY29uO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93ICdpY29uIGZyb20gZ3JpZCBvcHRpb25zIG5lZWRzIHRvIGJlIGEgc3RyaW5nIG9yIGEgZnVuY3Rpb24nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIHJlbmRlcmVyUmVzdWx0ID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBlUmVzdWx0LmlubmVySFRNTCA9IHJlbmRlcmVyUmVzdWx0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc05vZGVPckVsZW1lbnQocmVuZGVyZXJSZXN1bHQpKSB7XHJcbiAgICAgICAgICAgIGVSZXN1bHQuYXBwZW5kQ2hpbGQocmVuZGVyZXJSZXN1bHQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93ICdpY29uUmVuZGVyZXIgc2hvdWxkIHJldHVybiBiYWNrIGEgc3RyaW5nIG9yIGEgZG9tIG9iamVjdCc7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvdGhlcndpc2Ugd2UgdXNlIHRoZSBidWlsdCBpbiBpY29uXHJcbiAgICAgICAgZVJlc3VsdC5hcHBlbmRDaGlsZChzdmdGYWN0b3J5RnVuYygpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBlUmVzdWx0O1xyXG59O1xyXG5cclxuXHJcblV0aWxzLnByb3RvdHlwZS5nZXRTY3JvbGxiYXJXaWR0aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBvdXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBvdXRlci5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcclxuICAgIG91dGVyLnN0eWxlLndpZHRoID0gXCIxMDBweFwiO1xyXG4gICAgb3V0ZXIuc3R5bGUubXNPdmVyZmxvd1N0eWxlID0gXCJzY3JvbGxiYXJcIjsgLy8gbmVlZGVkIGZvciBXaW5KUyBhcHBzXHJcblxyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdXRlcik7XHJcblxyXG4gICAgdmFyIHdpZHRoTm9TY3JvbGwgPSBvdXRlci5vZmZzZXRXaWR0aDtcclxuICAgIC8vIGZvcmNlIHNjcm9sbGJhcnNcclxuICAgIG91dGVyLnN0eWxlLm92ZXJmbG93ID0gXCJzY3JvbGxcIjtcclxuXHJcbiAgICAvLyBhZGQgaW5uZXJkaXZcclxuICAgIHZhciBpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBpbm5lci5zdHlsZS53aWR0aCA9IFwiMTAwJVwiO1xyXG4gICAgb3V0ZXIuYXBwZW5kQ2hpbGQoaW5uZXIpO1xyXG5cclxuICAgIHZhciB3aWR0aFdpdGhTY3JvbGwgPSBpbm5lci5vZmZzZXRXaWR0aDtcclxuXHJcbiAgICAvLyByZW1vdmUgZGl2c1xyXG4gICAgb3V0ZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChvdXRlcik7XHJcblxyXG4gICAgcmV0dXJuIHdpZHRoTm9TY3JvbGwgLSB3aWR0aFdpdGhTY3JvbGw7XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUuaXNLZXlQcmVzc2VkID0gZnVuY3Rpb24oZXZlbnQsIGtleVRvQ2hlY2spIHtcclxuICAgIHZhciBwcmVzc2VkS2V5ID0gZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZTtcclxuICAgIHJldHVybiBwcmVzc2VkS2V5ID09PSBrZXlUb0NoZWNrO1xyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnNldFZpc2libGUgPSBmdW5jdGlvbihlbGVtZW50LCB2aXNpYmxlKSB7XHJcbiAgICBpZiAodmlzaWJsZSkge1xyXG4gICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBVdGlscygpO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPGRpdiBjbGFzcz1hZy1saXN0LXNlbGVjdGlvbiBzdHlsZT1cXFwiaGVpZ2h0OiAxMDAlOyBvdmVyZmxvdzogYXV0b1xcXCI+PGRpdj48ZGl2IGFnLXJlcGVhdCBkcmFnZ2FibGU9dHJ1ZT48c3BhbiBjbGFzcz1cXFwiZmEgYWctY2hlY2tib3gtc2VsZWN0aW9uLWNoZWNrYm94XFxcIj48L3NwYW4+IDxzcGFuIGNsYXNzPWFnLWNoZWNrYm94LXNlbGVjdGlvbi12YWx1ZT48L3NwYW4+PC9kaXY+PC9kaXY+PC9kaXY+XCI7XG4iLCJ2YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL2NoZWNrYm94U2VsZWN0aW9uLmh0bWwnKTtcclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcclxuXHJcbnZhciBOT1RfRFJPUF9UQVJHRVQgPSAwO1xyXG52YXIgRFJPUF9UQVJHRVRfQUJPVkUgPSAxO1xyXG52YXIgRFJPUF9UQVJHRVRfQkVMT1cgPSAtMTE7XHJcblxyXG5mdW5jdGlvbiBDaGVja2JveFNlbGVjdGlvbigpIHtcclxuICAgIHRoaXMuc2V0dXBDb21wb25lbnRzKCk7XHJcbiAgICB0aGlzLnVuaXF1ZUlkID0gJ0NoZWNrYm94U2VsZWN0aW9uLScgKyBNYXRoLnJhbmRvbSgpO1xyXG4gICAgdGhpcy5pdGVtTW92ZWRMaXN0ZW5lcnMgPSBbXTtcclxufVxyXG5cclxuQ2hlY2tib3hTZWxlY3Rpb24ucHJvdG90eXBlLmFkZEl0ZW1Nb3ZlZExpc3RlbmVyID0gZnVuY3Rpb24obGlzdGVuZXIpIHtcclxuICAgIHRoaXMuaXRlbU1vdmVkTGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xyXG59O1xyXG5cclxuQ2hlY2tib3hTZWxlY3Rpb24ucHJvdG90eXBlLmZpcmVJdGVtTW92ZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpPHRoaXMuaXRlbU1vdmVkTGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5pdGVtTW92ZWRMaXN0ZW5lcnNbaV0oKTtcclxuICAgIH1cclxufTtcclxuXHJcbkNoZWNrYm94U2VsZWN0aW9uLnByb3RvdHlwZS5zZXRJdGVtUHJveHkgPSBmdW5jdGlvbihpdGVtUHJveHkpIHtcclxuICAgIHRoaXMuaXRlbVByb3h5ID0gaXRlbVByb3h5O1xyXG59O1xyXG5cclxuQ2hlY2tib3hTZWxlY3Rpb24ucHJvdG90eXBlLnNldHVwQ29tcG9uZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHRoaXMuZUd1aSA9IHV0aWxzLmxvYWRUZW1wbGF0ZSh0ZW1wbGF0ZSk7XHJcbiAgICB0aGlzLmVGaWx0ZXJWYWx1ZVRlbXBsYXRlID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCJbYWctcmVwZWF0XVwiKTtcclxuXHJcbiAgICB0aGlzLmVMaXN0UGFyZW50ID0gdGhpcy5lRmlsdGVyVmFsdWVUZW1wbGF0ZS5wYXJlbnROb2RlO1xyXG4gICAgdXRpbHMucmVtb3ZlQWxsQ2hpbGRyZW4odGhpcy5lTGlzdFBhcmVudCk7XHJcbn07XHJcblxyXG5DaGVja2JveFNlbGVjdGlvbi5wcm90b3R5cGUuc2V0TW9kZWwgPSBmdW5jdGlvbihtb2RlbCkge1xyXG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG4gICAgdGhpcy5kcmF3TGlzdEl0ZW1zKCk7XHJcbn07XHJcblxyXG5DaGVja2JveFNlbGVjdGlvbi5wcm90b3R5cGUuZHJhd0xpc3RJdGVtcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdXRpbHMucmVtb3ZlQWxsQ2hpbGRyZW4odGhpcy5lTGlzdFBhcmVudCk7XHJcblxyXG4gICAgaWYgKCF0aGlzLm1vZGVsKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpPHRoaXMubW9kZWwubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgaXRlbSA9IHRoaXMubW9kZWxbaV07XHJcbiAgICAgICAgdmFyIHRleHQgPSB0aGlzLmdldFRleHQoaXRlbSk7XHJcbiAgICAgICAgdmFyIHNlbGVjdGVkID0gdGhpcy5pc1NlbGVjdGVkKGl0ZW0pO1xyXG4gICAgICAgIHZhciBlTGlzdEl0ZW0gPSB0aGlzLmVGaWx0ZXJWYWx1ZVRlbXBsYXRlLmNsb25lTm9kZSh0cnVlKTtcclxuXHJcbiAgICAgICAgdmFyIGVDaGVja2JveCA9IGVMaXN0SXRlbS5xdWVyeVNlbGVjdG9yKCcuYWctY2hlY2tib3gtc2VsZWN0aW9uLWNoZWNrYm94Jyk7XHJcbiAgICAgICAgdGhpcy5zdHlsZUxpc3RJdGVtU2VsZWN0ZWQoZUxpc3RJdGVtLCBlQ2hlY2tib3gsIHNlbGVjdGVkKTtcclxuXHJcbiAgICAgICAgdmFyIGVWYWx1ZSA9IGVMaXN0SXRlbS5xdWVyeVNlbGVjdG9yKFwiLmFnLWNoZWNrYm94LXNlbGVjdGlvbi12YWx1ZVwiKTtcclxuICAgICAgICBlVmFsdWUuaW5uZXJIVE1MID0gdGV4dDtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRDaGFuZ2VMaXN0ZW5lcihlTGlzdEl0ZW0sIGVDaGVja2JveCwgaXRlbSk7XHJcbiAgICAgICAgdGhpcy5hZGREcmFnQW5kRHJvcChlTGlzdEl0ZW0sIGl0ZW0pO1xyXG5cclxuICAgICAgICB0aGlzLmVMaXN0UGFyZW50LmFwcGVuZENoaWxkKGVMaXN0SXRlbSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGVja2JveFNlbGVjdGlvbi5wcm90b3R5cGUuc3R5bGVMaXN0SXRlbVNlbGVjdGVkID0gZnVuY3Rpb24oZUxpc3RJdGVtLCBlQ2hlY2tib3gsIHNlbGVjdGVkKSB7XHJcbiAgICB1dGlscy5hZGRPclJlbW92ZUNzc0NsYXNzKGVDaGVja2JveCwgJ2ZhLWV5ZScsIHNlbGVjdGVkKTtcclxuICAgIHV0aWxzLmFkZE9yUmVtb3ZlQ3NzQ2xhc3MoZUNoZWNrYm94LCAnZmEtZXllLXNsYXNoJywgIXNlbGVjdGVkKTtcclxuXHJcbiAgICB1dGlscy5hZGRPclJlbW92ZUNzc0NsYXNzKGVMaXN0SXRlbSwgJ2FnLWxpc3QtaXRlbS1zZWxlY3RlZCcsICFzZWxlY3RlZCk7XHJcbiAgICB1dGlscy5hZGRPclJlbW92ZUNzc0NsYXNzKGVMaXN0SXRlbSwgJ2FnLWxpc3QtaXRlbS1ub3Qtc2VsZWN0ZWQnLCAhc2VsZWN0ZWQpO1xyXG59O1xyXG5cclxuQ2hlY2tib3hTZWxlY3Rpb24ucHJvdG90eXBlLmRyYWdBZnRlclRoaXNJdGVtID0gZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgdmFyIGl0ZW1BZnRlciA9IHRoaXMubW9kZWwuaW5kZXhPZihpdGVtKSA8IHRoaXMubW9kZWwuaW5kZXhPZih0aGlzLmRyYWdJdGVtKTtcclxuICAgIHJldHVybiBpdGVtQWZ0ZXI7XHJcbn07XHJcblxyXG5DaGVja2JveFNlbGVjdGlvbi5wcm90b3R5cGUuc2V0RHJvcENzc0NsYXNzZXMgPSBmdW5jdGlvbihlTGlzdEl0ZW0sIHN0YXRlKSB7XHJcbiAgICB1dGlscy5hZGRPclJlbW92ZUNzc0NsYXNzKGVMaXN0SXRlbSwgJ2FnLW5vdC1kcm9wLXRhcmdldCcsIHN0YXRlID09PSBOT1RfRFJPUF9UQVJHRVQpO1xyXG4gICAgdXRpbHMuYWRkT3JSZW1vdmVDc3NDbGFzcyhlTGlzdEl0ZW0sICdhZy1kcm9wLXRhcmdldC1hYm92ZScsIHN0YXRlID09PSBEUk9QX1RBUkdFVF9BQk9WRSk7XHJcbiAgICB1dGlscy5hZGRPclJlbW92ZUNzc0NsYXNzKGVMaXN0SXRlbSwgJ2FnLWRyb3AtdGFyZ2V0LWJlbG93Jywgc3RhdGUgPT09IERST1BfVEFSR0VUX0JFTE9XKTtcclxufTtcclxuXHJcbkNoZWNrYm94U2VsZWN0aW9uLnByb3RvdHlwZS5zZXREcmFnQ3NzQ2xhc3NlcyA9IGZ1bmN0aW9uKGVMaXN0SXRlbSwgZHJhZ2dpbmcpIHtcclxuICAgIHV0aWxzLmFkZE9yUmVtb3ZlQ3NzQ2xhc3MoZUxpc3RJdGVtLCAnYWctZHJhZ2dpbmcnLCBkcmFnZ2luZyk7XHJcbiAgICB1dGlscy5hZGRPclJlbW92ZUNzc0NsYXNzKGVMaXN0SXRlbSwgJ2FnLW5vdC1kcmFnZ2luZycsICFkcmFnZ2luZyk7XHJcbn07XHJcblxyXG5DaGVja2JveFNlbGVjdGlvbi5wcm90b3R5cGUuYWRkRHJhZ0FuZERyb3AgPSBmdW5jdGlvbihlTGlzdEl0ZW0sIGl0ZW0pIHtcclxuXHJcbiAgICB0aGlzLnNldERyb3BDc3NDbGFzc2VzKGVMaXN0SXRlbSwgTk9UX0RST1BfVEFSR0VUKTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBlTGlzdEl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKHRoYXQuZHJhZ0l0ZW0gJiYgdGhhdC5kcmFnSXRlbSE9PWl0ZW0pIHtcclxuICAgICAgICAgICAgdGhhdC5vbkl0ZW1Ecm9wcGVkKGl0ZW0sIHRoYXQuZHJhZ0l0ZW0pO1xyXG4gICAgICAgICAgICB0aGF0LnNldERyb3BDc3NDbGFzc2VzKGVMaXN0SXRlbSwgTk9UX0RST1BfVEFSR0VUKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGVMaXN0SXRlbS5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGF0LmRyYWdJdGVtICYmIHRoYXQuZHJhZ0l0ZW0hPT1pdGVtKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGF0LmRyYWdBZnRlclRoaXNJdGVtKGl0ZW0pKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNldERyb3BDc3NDbGFzc2VzKGVMaXN0SXRlbSwgRFJPUF9UQVJHRVRfQUJPVkUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZXREcm9wQ3NzQ2xhc3NlcyhlTGlzdEl0ZW0sIERST1BfVEFSR0VUX0JFTE9XKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZUxpc3RJdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgdGhhdC5zZXREcm9wQ3NzQ2xhc3NlcyhlTGlzdEl0ZW0sIE5PVF9EUk9QX1RBUkdFVCk7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGVMaXN0SXRlbS5hZGRFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGF0LnNldERyYWdDc3NDbGFzc2VzKGVMaXN0SXRlbSwgdHJ1ZSk7XHJcbiAgICAgICAgdGhhdC5kcmFnSXRlbSA9IGl0ZW07XHJcbiAgICB9KTtcclxuXHJcbiAgICBlTGlzdEl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VuZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQuc2V0RHJhZ0Nzc0NsYXNzZXMoZUxpc3RJdGVtLCBmYWxzZSk7XHJcbiAgICAgICAgdGhhdC5kcmFnSXRlbSA9IG51bGw7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkNoZWNrYm94U2VsZWN0aW9uLnByb3RvdHlwZS5vbkl0ZW1Ecm9wcGVkID0gZnVuY3Rpb24odGFyZ2V0Q29sdW1uLCBkcmFnZ2VkQ29sdW1uKSB7XHJcbiAgICB2YXIgb2xkSW5kZXggPSB0aGlzLm1vZGVsLmluZGV4T2YoZHJhZ2dlZENvbHVtbik7XHJcbiAgICB2YXIgbmV3SW5kZXggPSB0aGlzLm1vZGVsLmluZGV4T2YodGFyZ2V0Q29sdW1uKTtcclxuXHJcbiAgICB0aGlzLm1vZGVsLnNwbGljZShvbGRJbmRleCwgMSk7XHJcbiAgICB0aGlzLm1vZGVsLnNwbGljZShuZXdJbmRleCwgMCwgZHJhZ2dlZENvbHVtbik7XHJcblxyXG4gICAgdGhpcy5kcmF3TGlzdEl0ZW1zKCk7XHJcbiAgICB0aGlzLmZpcmVJdGVtTW92ZWQoKTtcclxufTtcclxuXHJcbkNoZWNrYm94U2VsZWN0aW9uLnByb3RvdHlwZS5hZGRDaGFuZ2VMaXN0ZW5lciA9IGZ1bmN0aW9uKGVMaXN0SXRlbSwgZUNoZWNrYm94LCBpdGVtKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBlTGlzdEl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2VsZWN0ZWQgPSAhdGhhdC5pc1NlbGVjdGVkKGl0ZW0pO1xyXG4gICAgICAgIHRoYXQuc3R5bGVMaXN0SXRlbVNlbGVjdGVkKGVMaXN0SXRlbSwgZUNoZWNrYm94LCBzZWxlY3RlZCk7XHJcbiAgICAgICAgdGhhdC5pdGVtUHJveHkuc2V0U2VsZWN0ZWQoaXRlbSwgc2VsZWN0ZWQpO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5DaGVja2JveFNlbGVjdGlvbi5wcm90b3R5cGUuc2V0U2VsZWN0ZWQgPSBmdW5jdGlvbihpdGVtLCBzZWxlY3RlZCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaXRlbVByb3h5LnNldFNlbGVjdGVkKGl0ZW0sIHNlbGVjdGVkKTtcclxufTtcclxuXHJcbkNoZWNrYm94U2VsZWN0aW9uLnByb3RvdHlwZS5pc1NlbGVjdGVkID0gZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgcmV0dXJuIHRoaXMuaXRlbVByb3h5LmlzU2VsZWN0ZWQoaXRlbSk7XHJcbn07XHJcblxyXG5DaGVja2JveFNlbGVjdGlvbi5wcm90b3R5cGUuZ2V0VGV4dCA9IGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgIHJldHVybiB0aGlzLml0ZW1Qcm94eS5nZXRUZXh0KGl0ZW0pO1xyXG59O1xyXG5cclxuQ2hlY2tib3hTZWxlY3Rpb24ucHJvdG90eXBlLmdldEd1aSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZUd1aTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hlY2tib3hTZWxlY3Rpb247XHJcbiJdfQ==
