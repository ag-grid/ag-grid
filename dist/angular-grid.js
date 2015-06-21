(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Angular Grid
// Written by Niall Crosby
// www.angulargrid.com
//
// Version 1.10.0

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
            quickFilterOnScope = keyOfGridInScope + '.quickFilterText';
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
                console.warn('WARNING - was not able to find element ' + element + ' in the DOM, Angular Grid initialisation aborted.');
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
        var eIcon;
        if (expanded) {
            eIcon = utils.createIcon('groupContracted', gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
        } else {
            eIcon = utils.createIcon('groupExpanded', gridOptionsWrapper, null, svgFactory.createArrowDownSvg);
        }
        utils.addCssClass(eIcon, 'ag-group-expand');
        return eIcon;
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
        var groupName = getGroupName(params);

        var colDefOfGroupedCol = params.api.getColumnDef(params.node.field);
        if (colDefOfGroupedCol && typeof colDefOfGroupedCol.cellRenderer === 'function') {
            params.value = groupName;
            utils.useRenderer(eGroupCell, colDefOfGroupedCol.cellRenderer, params);
        } else {
            eGroupCell.appendChild(document.createTextNode(groupName));
        }

        // only include the child count if it's included, eg if user doing custom aggregation,
        // then this could be left out, or set to -1, ie no child count
        var suppressCount = params.colDef.cellRenderer && params.colDef.cellRenderer.suppressCount;
        if (!suppressCount && params.node.allChildrenCount >= 0) {
            eGroupCell.appendChild(document.createTextNode(" (" + params.node.allChildrenCount + ")"));
        }
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
},{"../constants":4,"../svgFactory":33,"../utils":38}],3:[function(require,module,exports){
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
            return that.allColumns;
        },
        // + rowController -> while inserting rows, and when tabbing through cells (need to change this)
        // need a newMethod - get next col index
        getDisplayedColumns: function() {
            return that.displayedColumns;
        },
        // + toolPanel
        getGroupedColumns: function() {
            return that.groupedColumns;
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
        getHeaderGroups: function() {
            return that.headerGroups;
        },
        // used by:
        // + api.getFilterModel() -> to map colDef to column, key can be colDef or field
        getColumn: function(key) {
            return that.getColumn(key);
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

ColumnController.prototype.getColumn = function(key) {
    for (var i = 0; i<this.allColumns.length; i++) {
        var colDefMatches = this.allColumns[i].colDef === key;
        var fieldMatches = this.allColumns[i].colDef.field === key;
        if (colDefMatches || fieldMatches) {
            return this.allColumns[i];
        }
    }
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
        this.listeners[i].columnsChanged(this.allColumns, this.groupedColumns);
    }
};

ColumnController.prototype.getModel = function() {
    return this.model;
};

// called by angularGrid
ColumnController.prototype.setColumns = function(columnDefs) {
    this.checkForDeprecatedItems(columnDefs);
    this.createColumns(columnDefs);
    this.createAggColumns();
    this.updateModel();
    this.fireColumnsChanged();
};

ColumnController.prototype.checkForDeprecatedItems = function(columnDefs) {
    if (columnDefs) {
        for (var i = 0; i<columnDefs.length; i++) {
            var colDef = columnDefs[i];
            if (colDef.group !== undefined) {
                console.warn('ag-grid: ' + colDef.field + ' colDef.group is deprecated, please use colDef.headerGroup');
                colDef.headerGroup = colDef.group;
            }
            if (colDef.groupShow !== undefined) {
                console.warn('ag-grid: ' + colDef.field + ' colDef.groupShow is deprecated, please use colDef.headerGroupShow');
                colDef.headerGroupShow = colDef.groupShow;
            }
        }
    }
};

// called by headerRenderer - when a header is opened or closed
ColumnController.prototype.headerGroupOpened = function(group) {
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

// called from API
ColumnController.prototype.hideColumns = function(colIds, hide) {
    for (var i = 0; i<this.allColumns.length; i++) {
        var idThisCol = this.allColumns[i].colId;
        var hideThisCol = colIds.indexOf(idThisCol) >= 0;
        if (hideThisCol) {
            this.allColumns[i].visible = !hide;
        }
    }
    this.onColumnStateChanged();
    this.fireColumnsChanged(); // to tell toolbar
};

ColumnController.prototype.updateModel = function() {
    this.updateVisibleColumns();
    this.updatePinnedColumns();
    this.buildGroups();
    this.updateGroups();
    this.updateDisplayedColumns();
};

// private
ColumnController.prototype.updateDisplayedColumns = function() {

    if (!this.gridOptionsWrapper.isGroupHeaders()) {
        // if not grouping by headers, then pull visible cols
        this.displayedColumns = this.visibleColumns;
    } else {
        // if grouping, then only show col as per group rules
        this.displayedColumns = [];
        for (var i = 0; i < this.headerGroups.length; i++) {
            var group = this.headerGroups[i];
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
        this.headerGroups = null;
        return;
    }

    // split the columns into groups
    var currentGroup = null;
    this.headerGroups = [];
    var that = this;

    var lastColWasPinned = true;

    this.visibleColumns.forEach(function(column) {
        // do we need a new group, because we move from pinned to non-pinned columns?
        var endOfPinnedHeader = lastColWasPinned && !column.pinned;
        if (!column.pinned) {
            lastColWasPinned = false;
        }
        // do we need a new group, because the group names doesn't match from previous col?
        var groupKeyMismatch = currentGroup && column.colDef.headerGroup !== currentGroup.name;
        // we don't group columns where no group is specified
        var colNotInGroup = currentGroup && !currentGroup.name;
        // do we need a new group, because we are just starting
        var processingFirstCol = currentGroup === null;
        var newGroupNeeded = processingFirstCol || endOfPinnedHeader || groupKeyMismatch || colNotInGroup;
        // create new group, if it's needed
        if (newGroupNeeded) {
            var pinned = column.pinned;
            currentGroup = new headerGroup(pinned, column.colDef.headerGroup);
            that.headerGroups.push(currentGroup);
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

    for (var i = 0; i < this.headerGroups.length; i++) {
        var group = this.headerGroups[i];
        group.calculateExpandable();
        group.calculateDisplayedColumns();
    }
};

// private
ColumnController.prototype.updateVisibleColumns = function() {
    this.visibleColumns = [];

    var needAGroupColumn = this.groupedColumns.length > 0
        && !this.gridOptionsWrapper.isGroupSuppressAutoColumn()
        && !this.gridOptionsWrapper.isGroupUseEntireRow();

    var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

    if (needAGroupColumn) {
        // if one provided by user, use it, otherwise create one
        var groupColDef = this.gridOptionsWrapper.getGroupColumnDef();
        if (!groupColDef) {
            groupColDef = {
                headerName: localeTextFunc('group','Group'),
                cellRenderer: {
                    renderer: "group"
                }
            };
        }
        // no group column provided, need to create one here
        var groupColumn = new Column(groupColDef, this.gridOptionsWrapper.getColWidth());
        this.visibleColumns.push(groupColumn);
    }

    for (var i = 0; i < this.allColumns.length; i++) {
        var column = this.allColumns[i];
        if (column.visible) {
            column.index = this.visibleColumns.length;
            this.visibleColumns.push(this.allColumns[i]);
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
    this.allColumns = [];
    var that = this;
    if (columnDefs) {
        for (var i = 0; i < columnDefs.length; i++) {
            var colDef = columnDefs[i];
            // this is messy - we swap in another col def if it's checkbox selection - not happy :(
            if (colDef === 'checkboxSelection') {
                colDef = that.selectionRendererFactory.createCheckboxColDef();
            }
            var width = that.calculateColInitialWidth(colDef);
            var column = new Column(colDef, width);
            that.allColumns.push(column);
        }
    }
};

// private
ColumnController.prototype.createAggColumns = function() {
    this.groupedColumns = [];
    var groupKeys = this.gridOptionsWrapper.getGroupKeys();
    if (!groupKeys || groupKeys.length <= 0) {
        return;
    }
    for (var i = 0; i < groupKeys.length; i++) {
        var groupKey = groupKeys[i];
        var column = this.getColumn(groupKey);
        if (!column) {
            column = this.createDummyColumn(groupKey);
        }
        this.groupedColumns.push(column);
    }
};

// private
ColumnController.prototype.createDummyColumn = function(field) {
    var colDef = {
        field: field,
        headerName: field,
        hide: false
    };
    var width = this.gridOptionsWrapper.getColWidth();
    var column = new Column(colDef, width);
    return column;
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

function headerGroup(pinned, name) {
    this.pinned = pinned;
    this.name = name;
    this.allColumns = [];
    this.displayedColumns = [];
    this.expandable = false; // whether this group can be expanded or not
    this.expanded = false;
}

headerGroup.prototype.addColumn = function(column) {
    this.allColumns.push(column);
};

// need to check that this group has at least one col showing when both expanded and contracted.
// if not, then we don't allow expanding and contracting on this group
headerGroup.prototype.calculateExpandable = function() {
    // want to make sure the group doesn't disappear when it's open
    var atLeastOneShowingWhenOpen = false;
    // want to make sure the group doesn't disappear when it's closed
    var atLeastOneShowingWhenClosed = false;
    // want to make sure the group has something to show / hide
    var atLeastOneChangeable = false;
    for (var i = 0, j = this.allColumns.length; i < j; i++) {
        var column = this.allColumns[i];
        if (column.colDef.headerGroupShow === 'open') {
            atLeastOneShowingWhenOpen = true;
            atLeastOneChangeable = true;
        } else if (column.colDef.headerGroupShow === 'closed') {
            atLeastOneShowingWhenClosed = true;
            atLeastOneChangeable = true;
        } else {
            atLeastOneShowingWhenOpen = true;
            atLeastOneShowingWhenClosed = true;
        }
    }

    this.expandable = atLeastOneShowingWhenOpen && atLeastOneShowingWhenClosed && atLeastOneChangeable;
};

headerGroup.prototype.calculateDisplayedColumns = function() {
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
        switch (column.colDef.headerGroupShow) {
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
headerGroup.prototype.addToVisibleColumns = function(colsToAdd) {
    for (var i = 0; i < this.displayedColumns.length; i++) {
        var column = this.displayedColumns[i];
        colsToAdd.push(column);
    }
};

var colIdSequence = 0;

function Column(colDef, actualWidth, hide) {
    this.colDef = colDef;
    this.actualWidth = actualWidth;
    this.visible = !colDef.hide;
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

},{"./constants":4,"./utils":38}],4:[function(require,module,exports){
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
var utils = require('../utils');

function DragAndDropService() {
    document.addEventListener('mouseup', this.stopDragging.bind(this));
}

DragAndDropService.prototype.stopDragging = function() {
    if (this.dragItem) {
        this.setDragCssClasses(this.dragItem.eDragSource, false);
        this.dragItem = null;
    }
};

DragAndDropService.prototype.setDragCssClasses = function(eListItem, dragging) {
    utils.addOrRemoveCssClass(eListItem, 'ag-dragging', dragging);
    utils.addOrRemoveCssClass(eListItem, 'ag-not-dragging', !dragging);
};

DragAndDropService.prototype.addDragSource = function(eDragSource, dragSourceCallback, containerId) {

    this.setDragCssClasses(eDragSource, false);

    var mouseDown = false;
    var that = this;

    eDragSource.addEventListener('mousedown', function() {
        mouseDown = true;
    });

    eDragSource.addEventListener('mouseup', function() {
        mouseDown = false;
    });

    eDragSource.addEventListener('mouseout', function() {
        mouseDown = false;
    });

    eDragSource.addEventListener('mousemove', function() {
        if (mouseDown) {
            var alreadyDraggingThisItem = this.dragItem && this.dragItem.eDropSource === eDragSource;
            if (!alreadyDraggingThisItem) {
                that.startDragging(eDragSource, dragSourceCallback, containerId);
            }
        }
    });
};

DragAndDropService.prototype.startDragging = function(eDragSource, dragSourceCallback) {
    if (this.dragItem && this.dragItem.eDragSource === eDragSource) {
        return;
    }
    if (this.dragItem) {
        this.stopDragging();
    }
    var data;
    if (dragSourceCallback.getData) {
        data = dragSourceCallback.getData();
    }
    var containerId;
    if (dragSourceCallback.getContainerId) {
        containerId = dragSourceCallback.getContainerId();
    }

    this.dragItem = {
        eDragSource: eDragSource,
        data: data,
        containerId: containerId
    };
    this.setDragCssClasses(this.dragItem.eDragSource, true);
};

DragAndDropService.prototype.addDropTarget = function(eDropTarget, dropTargetCallback) {
    var mouseIn = false;
    var acceptDrag = false;
    var that = this;

    eDropTarget.addEventListener('mouseover', function() {
        if (!mouseIn) {
            mouseIn = true;
            if (that.dragItem) {
                acceptDrag = dropTargetCallback.acceptDrag(that.dragItem);
            } else {
                acceptDrag = false;
            }
        }
    });

    eDropTarget.addEventListener('mouseout', function() {
        if (acceptDrag) {
            dropTargetCallback.noDrop();
        }
        mouseIn = false;
        acceptDrag = false;
    });

    eDropTarget.addEventListener('mouseup', function() {
        // dragItem should never be null, checking just in case
        if (acceptDrag && that.dragItem) {
            dropTargetCallback.drop(that.dragItem);
        }
    });

};

module.exports = new DragAndDropService();
},{"../utils":38}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{"./../utils":38,"./numberFilter":9,"./setFilter":11,"./textFilter":14}],8:[function(require,module,exports){
module.exports = "<div><div><select class=ag-filter-select id=filterType><option value=1>[EQUALS]</option><option value=2>[LESS THAN]</option><option value=3>[GREATER THAN]</option></select></div><div><input class=ag-filter-filter id=filterText type=text placeholder=\"[FILTER...]\"></div></div>";

},{}],9:[function(require,module,exports){
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
            console.warn('invalid filter type ' + this.filterType);
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

},{"./../utils":38,"./numberFilter.html":8}],10:[function(require,module,exports){
module.exports = "<div><div class=ag-filter-header-container><input class=ag-filter-filter type=text placeholder=\"[SEARCH...]\"></div><div class=ag-filter-header-container><label><input id=selectAll type=checkbox class=\"ag-filter-checkbox\"> ([SELECT ALL])</label></div><div class=ag-filter-list-viewport><div class=ag-filter-list-container><div id=itemForRepeat class=ag-filter-item><label><input type=checkbox class=ag-filter-checkbox filter-checkbox=\"true\"> <span class=ag-filter-value></span></label></div></div></div></div>";

},{}],11:[function(require,module,exports){
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

},{"./../utils":38,"./setFilter.html":10,"./setFilterModel":12}],12:[function(require,module,exports){
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

},{"../utils":38}],13:[function(require,module,exports){
module.exports = "<div><div><select class=ag-filter-select id=filterType><option value=1>[CONTAINS]</option><option value=2>[EQUALS]</option><option value=3>[STARTS WITH]</option><option value=4>[ENDS WITH]</option></select></div><div><input class=ag-filter-filter id=filterText type=text placeholder=\"[FILTER...]\"></div></div>";

},{}],14:[function(require,module,exports){
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
            console.warn('invalid filter type ' + this.filterType);
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

},{"../utils":38,"./textFilter.html":13}],15:[function(require,module,exports){
var utils = require('./utils');
var constants = require('./constants');
var GridOptionsWrapper = require('./gridOptionsWrapper');
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
var BorderLayout = require('./layout/borderLayout');
var GridPanel = require('./gridPanel/gridPanel');

function Grid(eGridDiv, gridOptions, $scope, $compile, quickFilterOnScope) {

    this.gridOptions = gridOptions;
    this.gridOptionsWrapper = new GridOptionsWrapper(this.gridOptions);

    this.setupComponents($scope, $compile, eGridDiv);

    var that = this;
    this.quickFilter = null;

    // if using angular, watch for quickFilter changes
    if ($scope) {
        $scope.$watch(quickFilterOnScope, function(newFilter) {
            that.onQuickFilterChanged(newFilter);
        });
    }

    this.virtualRowCallbacks = {};

    var forPrint = this.gridOptionsWrapper.isDontUseScrolls();
    this.addApi();

    this.scrollWidth = utils.getScrollbarWidth();

    // done when cols change
    this.setupColumns();

    this.inMemoryRowController.setAllRows(this.gridOptionsWrapper.getAllRows());

    if (!forPrint) {
        window.addEventListener('resize', this.doLayout.bind(this));
    }

    this.updateModelAndRefresh(constants.STEP_EVERYTHING);

    // if no data provided initially, and not doing infinite scrolling, show the loading panel
    var showLoading = !this.gridOptionsWrapper.getAllRows() && !this.gridOptionsWrapper.isVirtualPaging();
    this.showLoadingPanel(showLoading);

    // if datasource provided, use it
    if (this.gridOptionsWrapper.getDatasource()) {
        this.setDatasource();
    }

    this.doLayout();

    // if ready function provided, use it
    if (typeof this.gridOptionsWrapper.getReady() == 'function') {
        this.gridOptionsWrapper.getReady()(gridOptions.api);
    }
}

Grid.prototype.setupComponents = function($scope, $compile, eUserProvidedDiv) {

    // make local references, to make the below more human readable
    var gridOptionsWrapper = this.gridOptionsWrapper;
    var gridOptions = this.gridOptions;
    var forPrint = gridOptionsWrapper.isDontUseScrolls();

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
    var gridPanel = new GridPanel(gridOptionsWrapper);

    var columnModel = columnController.getModel();

    // initialise all the beans
    templateService.init($scope);
    selectionController.init(this, gridPanel, gridOptionsWrapper, $scope, rowRenderer);
    filterManager.init(this, gridOptionsWrapper, $compile, $scope, expressionService, columnModel);
    selectionRendererFactory.init(this, selectionController);
    columnController.init(this, selectionRendererFactory, gridOptionsWrapper, expressionService);
    rowRenderer.init(gridOptions, columnModel, gridOptionsWrapper, gridPanel, this,
        selectionRendererFactory, $compile, $scope, selectionController, expressionService, templateService);
    headerRenderer.init(gridOptionsWrapper, columnController, columnModel, gridPanel, this, filterManager,
        $scope, $compile, expressionService);
    inMemoryRowController.init(gridOptionsWrapper, columnModel, this, filterManager, $scope, expressionService);
    virtualPageRowController.init(rowRenderer, gridOptionsWrapper, this);
    gridPanel.init(columnModel, rowRenderer);

    var toolPanelLayout = null;
    var eToolPanel = null;
    if (!forPrint) {
        eToolPanel = new ToolPanel();
        toolPanelLayout = eToolPanel.layout;
        eToolPanel.init(columnController, inMemoryRowController, gridOptionsWrapper);
    }

    // this is a child bean, get a reference and pass it on
    // CAN WE DELETE THIS? it's done in the setDatasource section
    var rowModel = inMemoryRowController.getModel();
    selectionController.setRowModel(rowModel);
    filterManager.setRowModel(rowModel);
    rowRenderer.setRowModel(rowModel);
    gridPanel.setRowModel(rowModel);

    // and the last bean, done in it's own section, as it's optional
    var paginationController = null;
    var paginationGui = null;
    if (!forPrint) {
        paginationController = new PaginationController();
        paginationController.init(this, gridOptionsWrapper);
        paginationGui = paginationController.getGui();
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
    this.eToolPanel = eToolPanel;
    this.gridPanel = gridPanel;

    this.eRootPanel = new BorderLayout({
        center: gridPanel.layout,
        east: toolPanelLayout,
        south: paginationGui,
        dontFill: forPrint,
        name: 'eRootPanel'
    });

    // default is we don't show paging panel, this is set to true when datasource is set
    this.eRootPanel.setSouthVisible(false);

    // see what the grid options are for default of toolbar
    this.showToolPanel(gridOptionsWrapper.isShowToolPanel());

    eUserProvidedDiv.appendChild(this.eRootPanel.getGui());
};

Grid.prototype.showToolPanel = function(show) {
    if (!this.eToolPanel) {
        this.toolPanelShowing = false;
        return;
    }

    this.toolPanelShowing = show;
    this.eRootPanel.setEastVisible(show);
};

Grid.prototype.isToolPanelShowing = function() {
    return this.toolPanelShowing;
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
    var showPagingPanel;

    if (this.doingVirtualPaging) {
        this.paginationController.setDatasource(null);
        this.virtualPageRowController.setDatasource(datasourceToUse);
        this.rowModel = this.virtualPageRowController.getModel();
        showPagingPanel = false;
    } else if (this.doingPagination) {
        this.paginationController.setDatasource(datasourceToUse);
        this.virtualPageRowController.setDatasource(null);
        this.rowModel = this.inMemoryRowController.getModel();
        showPagingPanel = true;
    } else {
        this.paginationController.setDatasource(null);
        this.virtualPageRowController.setDatasource(null);
        this.rowModel = this.inMemoryRowController.getModel();
        showPagingPanel = false;
    }

    this.selectionController.setRowModel(this.rowModel);
    this.filterManager.setRowModel(this.rowModel);
    this.rowRenderer.setRowModel(this.rowModel);

    this.eRootPanel.setSouthVisible(showPagingPanel);

    // because we just set the rowModel, need to update the gui
    this.rowRenderer.refreshView();

    this.doLayout();
};

// gets called after columns are shown / hidden from groups expanding
Grid.prototype.refreshHeaderAndBody = function() {
    this.headerRenderer.refreshHeader();
    this.headerRenderer.updateFilterIcons();
    this.headerRenderer.updateSortIcons();
    this.gridPanel.setBodyContainerWidth();
    this.gridPanel.setPinnedColContainerWidth();
    this.rowRenderer.refreshView();
};

Grid.prototype.setFinished = function() {
    window.removeEventListener('resize', this.doLayout);
};

Grid.prototype.getPopupParent = function() {
    return this.eRootPanel.getGui();
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
            event: event,
            rowIndex: rowIndex
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

Grid.prototype.showLoadingPanel = function(show) {
    this.gridPanel.showLoading(show);
};

Grid.prototype.setupColumns = function() {
    this.gridPanel.setHeaderHeight();
    this.columnController.setColumns(this.gridOptionsWrapper.getColumnDefs());
    this.gridPanel.showPinnedColContainersIfNeeded();
    this.headerRenderer.refreshHeader();
    if (!this.gridOptionsWrapper.isDontUseScrolls()) {
        this.gridPanel.setPinnedColContainerWidth();
        this.gridPanel.setBodyContainerWidth();
    }
    this.headerRenderer.updateFilterIcons();
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
        this.gridPanel.ensureIndexVisible(indexToSelect);
    }
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
            var availableWidth = that.gridPanel.getWidthForSizeColsToFit();
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
            that.gridPanel.ensureColIndexVisible(index);
        },
        ensureIndexVisible: function(index) {
            that.gridPanel.ensureIndexVisible(index);
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
        getColumnDef: function(key) {
            var column = that.columnModel.getColumn(key);
            if (column) {
                return column.colDef;
            } else {
                return null;
            }
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
        },
        showToolPanel: function(show) {
            that.showToolPanel(show);
        },
        isToolPanelShowing: function() {
            return that.isToolPanelShowing();
        },
        hideColumn: function(colId, hide) {
            that.columnController.hideColumns([colId], hide);
        },
        hideColumns: function(colIds, hide) {
            that.columnController.hideColumns(colIds, hide);
        }
    };
    this.gridOptions.api = api;
};

Grid.prototype.setFocusedCell = function(rowIndex, colIndex) {
    this.gridPanel.ensureIndexVisible(rowIndex);
    this.gridPanel.ensureColIndexVisible(colIndex);
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

Grid.prototype.updateBodyContainerWidthAfterColResize = function() {
    this.rowRenderer.setMainRowWidths();
    this.gridPanel.setBodyContainerWidth();
};

Grid.prototype.updatePinnedColContainerWidthAfterColResize = function() {
    this.gridPanel.setPinnedColContainerWidth();
};

Grid.prototype.doLayout = function() {
    setTimeout(this.doLayoutForReal.bind(this), 0);
    setTimeout(this.doLayoutForReal.bind(this), 10);
    setTimeout(this.doLayoutForReal.bind(this), 20);
    //setTimeout(this.doLayoutForReal.bind(this), 500);
    this.doLayoutForReal();
};

Grid.prototype.doLayoutForReal = function() {
    // need to do layout first, as drawVirtualRows and setPinnedColHeight
    // need to know the result of the resizing of the panels.
    this.eRootPanel.doLayout();
    // both of the two below should be done in gridPanel, the gridPanel should register 'resize' to the panel
    this.rowRenderer.drawVirtualRows();
    this.gridPanel.setPinnedColHeight();
};

module.exports = Grid;

},{"./columnController":3,"./constants":4,"./expressionService":6,"./filter/filterManager":7,"./gridOptionsWrapper":16,"./gridPanel/gridPanel":19,"./headerRenderer":22,"./layout/borderLayout":24,"./rowControllers/inMemoryRowController":26,"./rowControllers/paginationController":27,"./rowControllers/virtualPageRowController":29,"./rowRenderer":30,"./selectionController":31,"./selectionRendererFactory":32,"./templateService":34,"./toolPanel/toolPanel":37,"./utils":38}],16:[function(require,module,exports){
var DEFAULT_ROW_HEIGHT = 30;

var constants = require('./constants');
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
GridOptionsWrapper.prototype.isShowToolPanel = function() { return isTrue(this.gridOptions.showToolPanel); };
GridOptionsWrapper.prototype.isRowsAlreadyGrouped = function() { return isTrue(this.gridOptions.rowsAlreadyGrouped); };
GridOptionsWrapper.prototype.isGroupSelectsChildren = function() { return isTrue(this.gridOptions.groupSelectsChildren); };
GridOptionsWrapper.prototype.isGroupIncludeFooter = function() { return isTrue(this.gridOptions.groupIncludeFooter); };
GridOptionsWrapper.prototype.isSuppressRowClickSelection = function() { return isTrue(this.gridOptions.suppressRowClickSelection); };
GridOptionsWrapper.prototype.isSuppressCellSelection = function() { return isTrue(this.gridOptions.suppressCellSelection); };
GridOptionsWrapper.prototype.isSuppressUnSort = function() { return isTrue(this.gridOptions.suppressUnSort); };
GridOptionsWrapper.prototype.isSuppressMultiSort = function() { return isTrue(this.gridOptions.suppressMultiSort); };
GridOptionsWrapper.prototype.isGroupSuppressAutoColumn = function() { return isTrue(this.gridOptions.groupSuppressAutoColumn); };
GridOptionsWrapper.prototype.isGroupHeaders = function() { return isTrue(this.gridOptions.groupHeaders); };
GridOptionsWrapper.prototype.isDontUseScrolls = function() { return isTrue(this.gridOptions.dontUseScrolls); };
GridOptionsWrapper.prototype.isSuppressDescSort = function() { return isTrue(this.gridOptions.suppressDescSort); };
GridOptionsWrapper.prototype.getRowStyle = function() { return this.gridOptions.rowStyle; };
GridOptionsWrapper.prototype.getRowClass = function() { return this.gridOptions.rowClass; };
GridOptionsWrapper.prototype.getHeaderCellRenderer = function() { return this.gridOptions.headerCellRenderer; };
GridOptionsWrapper.prototype.getApi = function() { return this.gridOptions.api; };
GridOptionsWrapper.prototype.isEnableColResize = function() { return this.gridOptions.enableColResize; };
GridOptionsWrapper.prototype.getGroupDefaultExpanded = function() { return this.gridOptions.groupDefaultExpanded; };
GridOptionsWrapper.prototype.getGroupKeys = function() { return this.gridOptions.groupKeys; };
GridOptionsWrapper.prototype.getGroupAggFunction = function() { return this.gridOptions.groupAggFunction; };
GridOptionsWrapper.prototype.getGroupAggFields = function() { return this.gridOptions.groupAggFields; };
GridOptionsWrapper.prototype.getAllRows = function() { return this.gridOptions.rowData; };
GridOptionsWrapper.prototype.isGroupUseEntireRow = function() { return isTrue(this.gridOptions.groupUseEntireRow); };
GridOptionsWrapper.prototype.getGroupColumnDef = function() { return this.gridOptions.groupColumnDef; };
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

GridOptionsWrapper.prototype.getGroupRowInnerRenderer = function() {
    if (this.gridOptions.groupInnerRenderer) {
        console.warn('ag-grid: as of v1.10.0 (21st Jun 2015) groupInnerRenderer is nwo called groupRowInnerRenderer. Please change you code as groupInnerRenderer is deprecated.');
        return this.gridOptions.groupInnerRenderer;
    } else {
        return this.gridOptions.groupRowInnerRenderer;
    }
};

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

},{"./constants":4}],17:[function(require,module,exports){
module.exports = "<div><div class=ag-header><div class=ag-pinned-header></div><div class=ag-header-viewport><div class=ag-header-container></div></div></div><div class=ag-body><div class=ag-pinned-cols-viewport><div class=ag-pinned-cols-container></div></div><div class=ag-body-viewport-wrapper><div class=ag-body-viewport><div class=ag-body-container></div></div></div></div></div>";

},{}],18:[function(require,module,exports){
module.exports = "<div><div class=ag-header-container></div><div class=ag-body-container></div></div>";

},{}],19:[function(require,module,exports){
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
},{"../layout/borderLayout":24,"../utils":38,"./grid.html":17,"./gridNoScrolls.html":18,"./loading.html":20}],20:[function(require,module,exports){
module.exports = "<div class=ag-loading-panel><div class=ag-loading-wrapper><span class=ag-loading-center>Loading...</span></div></div>";

},{}],21:[function(require,module,exports){
function GroupCreator() {}

GroupCreator.prototype.group = function(rowNodes, groupedCols, groupAggFunction, expandByDefault) {

    var topMostGroup = {
        level: -1,
        children: [],
        childrenMap: {}
    };

    var allGroups = [];
    allGroups.push(topMostGroup);

    var levelToInsertChild = groupedCols.length - 1;
    var i, currentLevel, node, data, currentGroup, groupByField, groupKey, nextGroup;

    // start at -1 and go backwards, as all the positive indexes
    // are already used by the nodes.
    var index = -1;

    for (i = 0; i < rowNodes.length; i++) {
        node = rowNodes[i];
        data = node.data;

        // all leaf nodes have the same level in this grouping, which is one level after the last group
        node.level = levelToInsertChild + 1;

        for (currentLevel = 0; currentLevel < groupedCols.length; currentLevel++) {
            groupByField = groupedCols[currentLevel].colDef.field;
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

},{}],22:[function(require,module,exports){
var utils = require('./utils');
var SvgFactory = require('./svgFactory');
var constants = require('./constants');

var svgFactory = new SvgFactory();

function HeaderRenderer() {}

HeaderRenderer.prototype.init = function(gridOptionsWrapper, columnController, columnModel, gridPanel, angularGrid, filterManager, $scope, $compile, expressionService) {
    this.expressionService = expressionService;
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.columnModel = columnModel;
    this.columnController = columnController;
    this.angularGrid = angularGrid;
    this.filterManager = filterManager;
    this.$scope = $scope;
    this.$compile = $compile;
    this.findAllElements(gridPanel);
};

HeaderRenderer.prototype.findAllElements = function(gridPanel) {
    this.ePinnedHeader = gridPanel.getPinnedHeader();
    this.eHeaderContainer = gridPanel.getHeaderContainer();
    this.eHeader = gridPanel.getHeader();
    this.eRoot = gridPanel.getRoot();
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
    var groups = this.columnModel.getHeaderGroups();
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
        eGroupIcon = utils.createIcon('headerGroupOpened', this.gridOptionsWrapper, null, svgFactory.createArrowLeftSvg);
    } else {
        eGroupIcon = utils.createIcon('headerGroupClosed', this.gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
    }
    eGroupIcon.className = 'ag-header-expand-icon';
    eHeaderGroup.appendChild(eGroupIcon);

    var that = this;
    eGroupIcon.onclick = function() {
        that.columnController.headerGroupOpened(group);
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

    var newChildScope;
    if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
        newChildScope = this.$scope.$new();
        newChildScope.colDef = colDef;
        newChildScope.colIndex = colDef.index;
        newChildScope.colDefWrapper = column;
        this.childScopes.push(newChildScope);
    }

    var headerCellClasses = ['ag-header-cell'];
    if (grouped) {
        headerCellClasses.push('ag-header-cell-grouped'); // this takes 50% height
    } else {
        headerCellClasses.push('ag-header-cell-not-grouped'); // this takes 100% height
    }
    eHeaderCell.className = headerCellClasses.join(' ');

    this.addHeaderClassesFromCollDef(colDef, newChildScope, eHeaderCell);

    // add tooltip if exists
    if (colDef.headerTooltip) {
        eHeaderCell.title = colDef.headerTooltip;
    }

    if (this.gridOptionsWrapper.isEnableColResize() && !colDef.suppressResize) {
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

HeaderRenderer.prototype.addHeaderClassesFromCollDef = function(colDef, $childScope, eHeaderCell) {
    if (colDef.headerClass) {
        var classToUse;
        if (typeof colDef.headerClass === 'function') {
            var params = {
                colDef: colDef,
                $scope: $childScope,
                context: this.gridOptionsWrapper.getContext(),
                api: this.gridOptionsWrapper.getApi()
            };
            classToUse = colDef.headerClass(params);
        } else {
            classToUse = colDef.headerClass;
        }

        if (typeof classToUse === 'string') {
            utils.addCssClass(eHeaderCell, classToUse);
        } else if (Array.isArray(classToUse)) {
            classToUse.forEach(function(cssClassItem) {
                utils.addCssClass(eHeaderCell, cssClassItem);
            });
        }
    }
};

HeaderRenderer.prototype.getNextSortDirection = function(direction) {
    var suppressUnSort = this.gridOptionsWrapper.isSuppressUnSort();
    var suppressDescSort = this.gridOptionsWrapper.isSuppressDescSort();

    switch (direction) {
        case constants.DESC:
            if (suppressUnSort) {
                return constants.ASC;
            } else {
                return null;
            }
        case constants.ASC:
            if (suppressUnSort && suppressDescSort) {
                return constants.ASC;
            } else if (suppressDescSort) {
                return null;
            } else {
                return constants.DESC;
            }
        default :
            return constants.ASC;
    }
};

HeaderRenderer.prototype.addSortHandling = function(headerCellLabel, column) {
    var that = this;

    headerCellLabel.addEventListener("click", function(e) {

        // update sort on current col
        column.sort = that.getNextSortDirection(column.sort);

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

},{"./constants":4,"./svgFactory":33,"./utils":38}],23:[function(require,module,exports){
var utils = require('../utils');

function BorderLayout(params) {

    this.isLayoutPanel = true;

    this.fullHeight = !params.north && !params.south;

    var template;
    if (!params.dontFill) {
        if (this.fullHeight) {
            template =
                '<div style="height: 100%; overflow: auto; position: relative;">' +
                '<div id="west" style="height: 100%; float: left;"></div>' +
                '<div id="east" style="height: 100%; float: right;"></div>' +
                '<div id="center" style="height: 100%;"></div>' +
                '<div id="overlay" style="position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
                '</div>';
        } else {
            template =
                '<div style="height: 100%; position: relative;">' +
                '<div id="north"></div>' +
                '<div id="centerRow" style="height: 100%; overflow: hidden;">' +
                '<div id="west" style="height: 100%; float: left;"></div>' +
                '<div id="east" style="height: 100%; float: right;"></div>' +
                '<div id="center" style="height: 100%;"></div>' +
                '</div>' +
                '<div id="south"></div>' +
                '<div id="overlay" style="position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
                '</div>';
        }
        this.layoutActive = true;
    } else {
        template =
            '<div style="position: relative;">' +
                '<div id="north"></div>' +
                '<div id="centerRow">' +
                    '<div id="west"></div>' +
                    '<div id="east"></div>' +
                    '<div id="center"></div>' +
                '</div>' +
                '<div id="south"></div>' +
                '<div id="overlay" style="position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
            '</div>';
        this.layoutActive = false;
    }

    this.eGui = utils.loadTemplate(template);

    this.id = 'borderLayout';
    if (params.name) {
        this.id += '_' + params.name;
    }
    this.eGui.setAttribute('id', this.id);
    this.childPanels = [];

    if (params) {
        this.setupPanels(params);
    }

    this.setOverlayVisible(false);
}

BorderLayout.prototype.setupPanels = function(params) {
    this.eNorthWrapper = this.eGui.querySelector('#north');
    this.eSouthWrapper = this.eGui.querySelector('#south');
    this.eEastWrapper = this.eGui.querySelector('#east');
    this.eWestWrapper = this.eGui.querySelector('#west');
    this.eCenterWrapper = this.eGui.querySelector('#center');
    this.eOverlayWrapper = this.eGui.querySelector('#overlay');
    this.eCenterRow = this.eGui.querySelector('#centerRow');

    this.eNorthChildLayout = this.setupPanel(params.north, this.eNorthWrapper);
    this.eSouthChildLayout = this.setupPanel(params.south, this.eSouthWrapper);
    this.eEastChildLayout = this.setupPanel(params.east, this.eEastWrapper);
    this.eWestChildLayout = this.setupPanel(params.west, this.eWestWrapper);
    this.eCenterChildLayout = this.setupPanel(params.center, this.eCenterWrapper);

    this.setupPanel(params.overlay, this.eOverlayWrapper);
};

BorderLayout.prototype.setupPanel = function(content, ePanel) {
    if (!ePanel) {
        return;
    }
    if (content) {
        if (content.isLayoutPanel) {
            this.childPanels.push(content);
            ePanel.appendChild(content.getGui());
            return content;
        } else {
            ePanel.appendChild(content);
            return null;
        }
    } else {
        ePanel.parentNode.removeChild(ePanel);
        return null;
    }
};

BorderLayout.prototype.getGui = function() {
    return this.eGui;
};

BorderLayout.prototype.doLayout = function() {

    this.layoutChild(this.eNorthChildLayout);
    this.layoutChild(this.eSouthChildLayout);
    this.layoutChild(this.eEastChildLayout);
    this.layoutChild(this.eWestChildLayout);

    if (this.layoutActive) {
        this.layoutHeight();
        this.layoutWidth();
    }

    this.layoutChild(this.eCenterChildLayout);
};

BorderLayout.prototype.layoutChild = function(childPanel) {
    if (childPanel) {
        childPanel.doLayout();
    }
};

BorderLayout.prototype.layoutHeight = function() {
    if (this.fullHeight) {
        return;
    }

    var totalHeight = utils.offsetHeight(this.eGui);
    var northHeight = utils.offsetHeight(this.eNorthWrapper);
    var southHeight = utils.offsetHeight(this.eSouthWrapper);

    var centerHeight = totalHeight - northHeight - southHeight;
    if (centerHeight < 0) {
        centerHeight = 0;
    }

    this.eCenterRow.style.height = centerHeight + 'px';
};

BorderLayout.prototype.layoutWidth = function() {
    var totalWidth = utils.offsetWidth(this.eGui);
    var eastWidth = utils.offsetWidth(this.eEastWrapper);
    var westWidth = utils.offsetWidth(this.eWestWrapper);

    var centerWidth = totalWidth - eastWidth - westWidth;
    if (centerWidth < 0) {
        centerWidth = 0;
    }

    this.eCenterWrapper.style.width = centerWidth + 'px';
};

BorderLayout.prototype.setEastVisible = function(visible) {
    if (this.eEastWrapper) {
        this.eEastWrapper.style.display = visible ? '' : 'none';
    }
    this.doLayout();
};

BorderLayout.prototype.setOverlayVisible = function(visible) {
    if (this.eOverlayWrapper) {
        this.eOverlayWrapper.style.display = visible ? '' : 'none';
    }
    this.doLayout();
};

BorderLayout.prototype.setSouthVisible = function(visible) {
    if (this.eSouthWrapper) {
        this.eSouthWrapper.style.display = visible ? '' : 'none';
    }
    this.doLayout();
};

module.exports = BorderLayout;
},{"../utils":38}],24:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"../utils":38,"dup":23}],25:[function(require,module,exports){
var utils = require('../utils');

function VerticalStack() {

    this.isLayoutPanel = true;
    this.childPanels = [];
    this.eGui = document.createElement('div');
    this.eGui.style.height = '100%';
}

VerticalStack.prototype.addPanel = function(panel, height) {
    var component;
    if (panel.isLayoutPanel) {
        this.childPanels.push(panel);
        component = panel.getGui();
    } else {
        component = panel;
    }

    if (height) {
        component.style.height = height;
    }
    this.eGui.appendChild(component);
};

VerticalStack.prototype.getGui = function() {
    return this.eGui;
};

VerticalStack.prototype.doLayout = function() {
    for (var i = 0; i<this.childPanels.length; i++) {
        this.childPanels[i].doLayout();
    }
};

module.exports = VerticalStack;
},{"../utils":38}],26:[function(require,module,exports){
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
        if (sortingOptions.length > 0) {
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
    var groupedCols = this.columnModel.getGroupedColumns();
    var rowsAlreadyGrouped = this.gridOptionsWrapper.isRowsAlreadyGrouped();

    var doingGrouping = !rowsAlreadyGrouped && groupedCols.length > 0;

    if (doingGrouping) {
        var expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
        rowsAfterGroup = groupCreator.group(this.allRows, groupedCols,
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

},{"./../constants":4,"./../groupCreator":21,"./../utils":38}],27:[function(require,module,exports){
var template = require('./paginationPanel.html');
var utils = require('./../utils');

function PaginationController() {}

PaginationController.prototype.init = function(angularGrid, gridOptionsWrapper) {
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.angularGrid = angularGrid;
    this.setupComponents();
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

PaginationController.prototype.getGui= function() {
    return this.eGui;
};

PaginationController.prototype.setupComponents = function() {

    this.eGui = utils.loadTemplate(this.createTemplate());

    this.btNext = this.eGui.querySelector('#btNext');
    this.btPrevious = this.eGui.querySelector('#btPrevious');
    this.btFirst = this.eGui.querySelector('#btFirst');
    this.btLast = this.eGui.querySelector('#btLast');
    this.lbCurrent = this.eGui.querySelector('#current');
    this.lbTotal = this.eGui.querySelector('#total');

    this.lbRecordCount = this.eGui.querySelector('#recordCount');
    this.lbFirstRowOnPage = this.eGui.querySelector('#firstRowOnPage');
    this.lbLastRowOnPage = this.eGui.querySelector('#lastRowOnPage');
    this.ePageRowSummaryPanel = this.eGui.querySelector('#pageRowSummaryPanel');

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

},{"./../utils":38,"./paginationPanel.html":28}],28:[function(require,module,exports){
module.exports = "<div class=ag-paging-panel><span id=pageRowSummaryPanel class=ag-paging-row-summary-panel><span id=firstRowOnPage></span> [TO] <span id=lastRowOnPage></span> [OF] <span id=recordCount></span></span> <span class=ag-paging-page-summary-panel><button class=ag-paging-button id=btFirst>[FIRST]</button> <button class=ag-paging-button id=btPrevious>[PREVIOUS]</button> [PAGE] <span id=current></span> [OF] <span id=total></span> <button class=ag-paging-button id=btNext>[NEXT]</button> <button class=ag-paging-button id=btLast>[LAST]</button></span></div>";

},{}],29:[function(require,module,exports){
/*
 * This row controller is used for infinite scrolling only. For normal 'in memory' table,
 * or standard pagination, the inMemoryRowController is used.
 */
var utils = require('./../utils');
var logging = false;

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

},{"./../utils":38}],30:[function(require,module,exports){
var constants = require('./constants');
var utils = require('./utils');
var groupCellRendererFactory = require('./cellRenderers/groupCellRendererFactory');

function RowRenderer() {}

RowRenderer.prototype.init = function(gridOptions, columnModel, gridOptionsWrapper, gridPanel,
    angularGrid, selectionRendererFactory, $compile, $scope,
    selectionController, expressionService, templateService) {
    this.gridOptions = gridOptions;
    this.columnModel = columnModel;
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.angularGrid = angularGrid;
    this.selectionRendererFactory = selectionRendererFactory;
    this.gridPanel = gridPanel;
    this.$compile = $compile;
    this.$scope = $scope;
    this.selectionController = selectionController;
    this.expressionService = expressionService;
    this.templateService = templateService;
    this.findAllElements(gridPanel);

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

RowRenderer.prototype.findAllElements = function(gridPanel) {
    this.eBodyContainer = gridPanel.getBodyContainer();
    this.eBodyViewport = gridPanel.getBodyViewport();
    this.ePinnedColsContainer = gridPanel.getPinnedColsContainer();
    this.eParentOfRows = gridPanel.getRowsParent();
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
                    innerRenderer: this.gridOptionsWrapper.getGroupRowInnerRenderer()
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
    this.gridPanel.ensureIndexVisible(renderedRow.rowIndex);

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

},{"./cellRenderers/groupCellRendererFactory":2,"./constants":4,"./utils":38}],31:[function(require,module,exports){
var utils = require('./utils');

// these constants are used for determining if groups should
// be selected or deselected when selecting groups, and the group
// then selects the children.
var SELECTED = 0;
var UNSELECTED = 1;
var MIXED = 2;
var DO_NOT_CARE = 3;

function SelectionController() {}

SelectionController.prototype.init = function(angularGrid, gridPanel, gridOptionsWrapper, $scope, rowRenderer) {
    this.eRowsParent = gridPanel.getRowsParent();
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

},{"./utils":38}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
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

SvgFactory.prototype.createColumnShowingSvg = function() {
    return createCircle(true);
};

SvgFactory.prototype.createColumnHiddenSvg = function() {
    return createCircle(false);
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

function createCircle(fill) {
    var eSvg = createIconSvg();

    var eCircle = document.createElementNS(SVG_NS, "circle");
    eCircle.setAttribute("cx", "5");
    eCircle.setAttribute("cy", "5");
    eCircle.setAttribute("r", "5");
    eCircle.setAttribute("stroke", "black");
    eCircle.setAttribute("stroke-width", "2");
    if (fill) {
        eCircle.setAttribute("fill", "black");
    } else {
        eCircle.setAttribute("fill", "none");
    }
    eSvg.appendChild(eCircle);

    return eSvg;
};

module.exports = SvgFactory;

},{}],34:[function(require,module,exports){

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
        console.warn('Unable to get template error ' + httpResult.status + ' - ' + url);
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

},{}],35:[function(require,module,exports){
var CheckboxSelection = require("../widgets/checkboxSelection");
var utils = require('./../utils');
var BorderLayout = require('../layout/BorderLayout');
var SvgFactory = require('../svgFactory');

var svgFactory = new SvgFactory();

function ColumnSelectionPanel(columnController, gridOptionsWrapper) {
    this.gridOptionsWrapper = gridOptionsWrapper;
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

ColumnSelectionPanel.prototype.getColumnList = function() {
    return this.cColumnList;
};

ColumnSelectionPanel.prototype.columnCellRenderer = function(params) {
    var column = params.value;
    var colDisplayName = this.columnController.getDisplayNameForCol(column);

    var eResult = document.createElement('span');

    var eVisibleIcons = document.createElement('span');
    utils.addCssClass(eVisibleIcons, 'ag-visible-icons');
    var eShowing = utils.createIcon('columnVisible', this.gridOptionsWrapper, column, svgFactory.createColumnShowingSvg);
    var eHidden = utils.createIcon('columnHidden', this.gridOptionsWrapper, column, svgFactory.createColumnHiddenSvg);
    eVisibleIcons.appendChild(eShowing);
    eVisibleIcons.appendChild(eHidden);
    eShowing.style.display = column.visible ? '' : 'none';
    eHidden.style.display = column.visible ? 'none' : '';
    eResult.appendChild(eVisibleIcons);

    var eValue = document.createElement('span');
    eValue.innerHTML = colDisplayName;
    eResult.appendChild(eValue);

    if (!column.visible) {
        utils.addCssClass(eResult, 'ag-column-not-visible');
    }

    // change visible if use clicks the visible icon, or if row is double clicked
    eVisibleIcons.addEventListener('click', showEventListener);

    var that = this;
    function showEventListener() {
        column.visible = !column.visible;
        that.cColumnList.refreshView();
        that.columnController.onColumnStateChanged();
    }

    return eResult;
};

ColumnSelectionPanel.prototype.setupComponents = function() {

    this.cColumnList = new CheckboxSelection();
    this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));

    var that = this;
    this.cColumnList.addModelChangedListener( function() {
        that.columnController.onColumnStateChanged();
    });

    var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
    var columnsLocalText = localeTextFunc('columns', 'Columns');

    var eNorthPanel = document.createElement('div');
    eNorthPanel.innerHTML = '<div style="text-align: center;">'+columnsLocalText+'</div>';

    this.layout = new BorderLayout({
        center: this.cColumnList.getGui(),
        north: eNorthPanel
    });
};

// not sure if this is called anywhere
ColumnSelectionPanel.prototype.setSelected = function(column, selected) {
    column.visible = selected;
    this.columnController.onColumnStateChanged();
};

ColumnSelectionPanel.prototype.getGui = function() {
    return this.eRootPanel.getGui();
};

module.exports = ColumnSelectionPanel;

},{"../layout/BorderLayout":23,"../svgFactory":33,"../widgets/checkboxSelection":40,"./../utils":38}],36:[function(require,module,exports){
var CheckboxSelection = require("../widgets/checkboxSelection");
var constants = require('../constants');
var utils = require('../utils');
var BorderLayout = require('../layout/borderLayout');
var SvgFactory = require('../svgFactory');

var svgFactory = new SvgFactory();

function GroupSelectionPanel(columnController, inMemoryRowController, gridOptionsWrapper) {
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.setupComponents();
    this.columnController = columnController;
    this.inMemoryRowController = inMemoryRowController;

    var that = this;
    this.columnController.addListener({
        columnsChanged: that.columnsChanged.bind(that)
    });
}

GroupSelectionPanel.prototype.columnsChanged = function(newColumns, newGroupedColumns) {
    this.cColumnList.setModel(newGroupedColumns);
};

GroupSelectionPanel.prototype.getColumnList = function() {
    return this.cColumnList;
};

GroupSelectionPanel.prototype.columnCellRenderer = function(params) {
    var column = params.value;
    var colDisplayName = this.columnController.getDisplayNameForCol(column);

    var eResult = document.createElement('span');

    var eRemove = utils.createIcon('columnRemoveFromGroupIcon', this.gridOptionsWrapper, column, svgFactory.createArrowUpSvg);
    utils.addCssClass(eRemove, 'ag-visible-icons');
    eResult.appendChild(eRemove);

    var that = this;
    eRemove.addEventListener('click', function () {
        var model = that.cColumnList.getModel();
        model.splice(model.indexOf(column), 1);
        that.cColumnList.setModel(model);
        that.onGroupingChanged();
    });

    var eValue = document.createElement('span');
    eValue.innerHTML = colDisplayName;
    eResult.appendChild(eValue);

    return eResult;
};

GroupSelectionPanel.prototype.setupComponents = function() {
    var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
    var columnsLocalText = localeTextFunc('pivotedColumns', 'Pivoted Columns');
    var pivotedColumnsEmptyMessage = localeTextFunc('pivotedColumnsEmptyMessage', 'Drag columns down from above to pivot by those columns');

    this.cColumnList = new CheckboxSelection();
    this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));
    this.cColumnList.addModelChangedListener(this.onGroupingChanged.bind(this));
    this.cColumnList.setEmptyMessage(pivotedColumnsEmptyMessage);

    var eNorthPanel = document.createElement('div');
    eNorthPanel.style.paddingTop = '10px';
    eNorthPanel.innerHTML = '<div style="text-align: center;">'+columnsLocalText+'</div>';

    this.layout = new BorderLayout({
        center: this.cColumnList.getGui(),
        north: eNorthPanel
    });
};

GroupSelectionPanel.prototype.onGroupingChanged = function() {
    this.inMemoryRowController.doGrouping();
    this.inMemoryRowController.updateModel(constants.STEP_EVERYTHING);
    this.columnController.onColumnStateChanged();
};

GroupSelectionPanel.prototype.getGui = function() {
    return this.eRootPanel.getGui();
};

module.exports = GroupSelectionPanel;
},{"../constants":4,"../layout/borderLayout":24,"../svgFactory":33,"../utils":38,"../widgets/checkboxSelection":40}],37:[function(require,module,exports){
var utils = require('../utils');
var ColumnSelectionPanel = require('./columnSelectionPanel');
var GroupSelectionPanel = require('./groupSelectionPanel');
var VerticalStack = require('../layout/verticalStack');

function ToolPanel() {
    this.layout = new VerticalStack();
}

ToolPanel.prototype.init = function(columnController, inMemoryRowController, gridOptionsWrapper) {

    var columnSelectionPanel = new ColumnSelectionPanel(columnController, gridOptionsWrapper);
    this.layout.addPanel(columnSelectionPanel.layout, '50%');
    var groupSelectionPanel = new GroupSelectionPanel(columnController, inMemoryRowController, gridOptionsWrapper);
    this.layout.addPanel(groupSelectionPanel.layout, '50%');

    groupSelectionPanel.getColumnList().addDragSource(columnSelectionPanel.getColumnList().getUniqueId());

    var eGui = this.layout.getGui();

    utils.addCssClass(eGui, 'ag-tool-panel-container');
};

module.exports = ToolPanel;

},{"../layout/verticalStack":25,"../utils":38,"./columnSelectionPanel":35,"./groupSelectionPanel":36}],38:[function(require,module,exports){
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

Utils.prototype.offsetHeight = function(element) {
    return element && element.clientHeight ? element.clientHeight : 0;
};

Utils.prototype.offsetWidth = function(element) {
    return element && element.clientWidth ? element.clientWidth : 0;
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

},{}],39:[function(require,module,exports){
module.exports = "<div class=ag-list-selection><div><div ag-repeat></div></div></div>";

},{}],40:[function(require,module,exports){
var template = require('./checkboxSelection.html');
var utils = require('../utils');
var dragAndDropService = require('../dragAndDrop/dragAndDropService');

var NOT_DROP_TARGET = 0;
var DROP_TARGET_ABOVE = 1;
var DROP_TARGET_BELOW = -11;

function CheckboxSelection() {
    this.setupComponents();
    this.uniqueId = 'CheckboxSelection-' + Math.random();
    this.modelChangedListeners = [];
    this.dragSources = [];
    this.setupAsDropTarget();
}

CheckboxSelection.prototype.setEmptyMessage = function(emptyMessage) {
    return this.emptyMessage = emptyMessage;
    this.refreshView();
};

CheckboxSelection.prototype.getUniqueId = function() {
    return this.uniqueId;
};

CheckboxSelection.prototype.addDragSource = function(dragSource) {
    this.dragSources.push(dragSource);
};

CheckboxSelection.prototype.addModelChangedListener = function(listener) {
    this.modelChangedListeners.push(listener);
};

CheckboxSelection.prototype.fireModelChanged = function() {
    for (var i = 0; i<this.modelChangedListeners.length; i++) {
        this.modelChangedListeners[i]();
    }
};

CheckboxSelection.prototype.setupComponents = function() {

    this.eGui = utils.loadTemplate(template);
    this.eFilterValueTemplate = this.eGui.querySelector("[ag-repeat]");

    this.eListParent = this.eFilterValueTemplate.parentNode;
    utils.removeAllChildren(this.eListParent);
};

CheckboxSelection.prototype.setModel = function(model) {
    this.model = model;
    this.refreshView();
};

CheckboxSelection.prototype.getModel = function() {
    return this.model;
};

CheckboxSelection.prototype.setCellRenderer = function(cellRenderer) {
    this.cellRenderer = cellRenderer;
};

CheckboxSelection.prototype.refreshView = function() {
    utils.removeAllChildren(this.eListParent);

    if (this.model && this.model.length > 0) {
        this.insertRows();
    } else {
        this.insertBlankMessage();
    }
};

CheckboxSelection.prototype.insertRows = function() {
    for (var i = 0; i<this.model.length; i++) {
        var item = this.model[i];
        //var text = this.getText(item);
        //var selected = this.isSelected(item);
        var eListItem = this.eFilterValueTemplate.cloneNode(true);

        if (this.cellRenderer) {
            var params = {value: item};
            utils.useRenderer(eListItem, this.cellRenderer, params);
        } else {
            eListItem.innerHTML = item;
        }

        this.addDragAndDropToListItem(eListItem, item);
        this.eListParent.appendChild(eListItem);
    }
};

CheckboxSelection.prototype.insertBlankMessage = function() {
    if (this.emptyMessage) {
        var eMessage = document.createElement('div');
        eMessage.style.color = 'grey';
        eMessage.style.padding = '20px';
        eMessage.style.textAlign = 'center';
        eMessage.innerHTML = this.emptyMessage;
        this.eListParent.appendChild(eMessage);
    }
};

CheckboxSelection.prototype.getDragItem = function() {
    return this.dragItem;
};

CheckboxSelection.prototype.setupAsDropTarget = function() {

    dragAndDropService.addDropTarget(this.eGui, {
        acceptDrag: this.externalAcceptDrag.bind(this),
        drop: this.externalDrop.bind(this),
        noDrop: this.externalNoDrop.bind(this)
    });
};

CheckboxSelection.prototype.externalAcceptDrag = function(dragEvent) {
    var allowedSource = this.dragSources.indexOf(dragEvent.containerId) >= 0;
    if (!allowedSource) {
        return false;
    }
    var alreadyHaveCol = this.model.indexOf(dragEvent.data) >= 0;
    if (alreadyHaveCol) {
        return false;
    }
    this.eGui.style.backgroundColor = 'lightgreen';
    return true;
};

CheckboxSelection.prototype.externalDrop = function(dragEvent) {
    this.addItemToList(dragEvent.data);
    this.eGui.style.backgroundColor = '';
};

CheckboxSelection.prototype.externalNoDrop = function() {
    this.eGui.style.backgroundColor = '';
};

CheckboxSelection.prototype.addItemToList = function(newItem) {
    this.model.push(newItem);
    this.refreshView();
    this.fireModelChanged();
};

CheckboxSelection.prototype.addDragAndDropToListItem = function(eListItem, item) {
    var that = this;
    dragAndDropService.addDragSource(eListItem, {
        getData: function() { return item; },
        getContainerId: function() { return that.uniqueId; }
    });
    dragAndDropService.addDropTarget(eListItem, {
        acceptDrag: function (dragItem) { return that.internalAcceptDrag(item, dragItem, eListItem); },
        drop: function (dragItem) { that.internalDrop(item, dragItem.data); },
        noDrop: function () { that.internalNoDrop(eListItem); }
    });
};

CheckboxSelection.prototype.internalAcceptDrag = function(targetColumn, dragItem, eListItem) {
    var result = dragItem.data !== targetColumn && dragItem.containerId === this.uniqueId;
    if (result) {
        if (this.dragAfterThisItem(targetColumn, dragItem.data)) {
            this.setDropCssClasses(eListItem, DROP_TARGET_ABOVE);
        } else {
            this.setDropCssClasses(eListItem, DROP_TARGET_BELOW);
        }
    }
    return result;
};

CheckboxSelection.prototype.internalDrop = function(targetColumn, draggedColumn) {
    var oldIndex = this.model.indexOf(draggedColumn);
    var newIndex = this.model.indexOf(targetColumn);

    this.model.splice(oldIndex, 1);
    this.model.splice(newIndex, 0, draggedColumn);

    this.refreshView();
    this.fireModelChanged();
};

CheckboxSelection.prototype.internalNoDrop = function(eListItem) {
    this.setDropCssClasses(eListItem, NOT_DROP_TARGET);
};

CheckboxSelection.prototype.dragAfterThisItem = function(targetColumn, draggedColumn) {
    return this.model.indexOf(targetColumn) < this.model.indexOf(draggedColumn);
};

CheckboxSelection.prototype.setDropCssClasses = function(eListItem, state) {
    utils.addOrRemoveCssClass(eListItem, 'ag-not-drop-target', state === NOT_DROP_TARGET);
    utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-above', state === DROP_TARGET_ABOVE);
    utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-below', state === DROP_TARGET_BELOW);
};

CheckboxSelection.prototype.getGui = function() {
    return this.eGui;
};

module.exports = CheckboxSelection;

},{"../dragAndDrop/dragAndDropService":5,"../utils":38,"./checkboxSelection.html":39}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9jZWxsUmVuZGVyZXJzL2dyb3VwQ2VsbFJlbmRlcmVyRmFjdG9yeS5qcyIsInNyYy9qcy9jb2x1bW5Db250cm9sbGVyLmpzIiwic3JjL2pzL2NvbnN0YW50cy5qcyIsInNyYy9qcy9kcmFnQW5kRHJvcC9kcmFnQW5kRHJvcFNlcnZpY2UuanMiLCJzcmMvanMvZXhwcmVzc2lvblNlcnZpY2UuanMiLCJzcmMvanMvZmlsdGVyL2ZpbHRlck1hbmFnZXIuanMiLCJzcmMvanMvZmlsdGVyL251bWJlckZpbHRlci5odG1sIiwic3JjL2pzL2ZpbHRlci9udW1iZXJGaWx0ZXIuanMiLCJzcmMvanMvZmlsdGVyL3NldEZpbHRlci5odG1sIiwic3JjL2pzL2ZpbHRlci9zZXRGaWx0ZXIuanMiLCJzcmMvanMvZmlsdGVyL3NldEZpbHRlck1vZGVsLmpzIiwic3JjL2pzL2ZpbHRlci90ZXh0RmlsdGVyLmh0bWwiLCJzcmMvanMvZmlsdGVyL3RleHRGaWx0ZXIuanMiLCJzcmMvanMvZ3JpZC5qcyIsInNyYy9qcy9ncmlkT3B0aW9uc1dyYXBwZXIuanMiLCJzcmMvanMvZ3JpZFBhbmVsL2dyaWQuaHRtbCIsInNyYy9qcy9ncmlkUGFuZWwvZ3JpZE5vU2Nyb2xscy5odG1sIiwic3JjL2pzL2dyaWRQYW5lbC9ncmlkUGFuZWwuanMiLCJzcmMvanMvZ3JpZFBhbmVsL2xvYWRpbmcuaHRtbCIsInNyYy9qcy9ncm91cENyZWF0b3IuanMiLCJzcmMvanMvaGVhZGVyUmVuZGVyZXIuanMiLCJzcmMvanMvbGF5b3V0L0JvcmRlckxheW91dC5qcyIsInNyYy9qcy9sYXlvdXQvdmVydGljYWxTdGFjay5qcyIsInNyYy9qcy9yb3dDb250cm9sbGVycy9pbk1lbW9yeVJvd0NvbnRyb2xsZXIuanMiLCJzcmMvanMvcm93Q29udHJvbGxlcnMvcGFnaW5hdGlvbkNvbnRyb2xsZXIuanMiLCJzcmMvanMvcm93Q29udHJvbGxlcnMvcGFnaW5hdGlvblBhbmVsLmh0bWwiLCJzcmMvanMvcm93Q29udHJvbGxlcnMvdmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLmpzIiwic3JjL2pzL3Jvd1JlbmRlcmVyLmpzIiwic3JjL2pzL3NlbGVjdGlvbkNvbnRyb2xsZXIuanMiLCJzcmMvanMvc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LmpzIiwic3JjL2pzL3N2Z0ZhY3RvcnkuanMiLCJzcmMvanMvdGVtcGxhdGVTZXJ2aWNlLmpzIiwic3JjL2pzL3Rvb2xQYW5lbC9jb2x1bW5TZWxlY3Rpb25QYW5lbC5qcyIsInNyYy9qcy90b29sUGFuZWwvZ3JvdXBTZWxlY3Rpb25QYW5lbC5qcyIsInNyYy9qcy90b29sUGFuZWwvdG9vbFBhbmVsLmpzIiwic3JjL2pzL3V0aWxzLmpzIiwic3JjL2pzL3dpZGdldHMvY2hlY2tib3hTZWxlY3Rpb24uaHRtbCIsInNyYy9qcy93aWRnZXRzL2NoZWNrYm94U2VsZWN0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9nQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFNBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNJQTtBQUNBOztBQ0RBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFJBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDaExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3piQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVXQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBBbmd1bGFyIEdyaWRcclxuLy8gV3JpdHRlbiBieSBOaWFsbCBDcm9zYnlcclxuLy8gd3d3LmFuZ3VsYXJncmlkLmNvbVxyXG4vL1xyXG4vLyBWZXJzaW9uIDEuMTAuMFxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIG9yIGBleHBvcnRzYFxyXG4gICAgdmFyIHJvb3QgPSB0aGlzO1xyXG4gICAgdmFyIEdyaWQgPSByZXF1aXJlKCcuL2dyaWQnKTtcclxuXHJcbiAgICAvLyBpZiBhbmd1bGFyIGlzIHByZXNlbnQsIHJlZ2lzdGVyIHRoZSBkaXJlY3RpdmVcclxuICAgIGlmICh0eXBlb2YgYW5ndWxhciAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICB2YXIgYW5ndWxhck1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFwiYW5ndWxhckdyaWRcIiwgW10pO1xyXG4gICAgICAgIGFuZ3VsYXJNb2R1bGUuZGlyZWN0aXZlKFwiYW5ndWxhckdyaWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICByZXN0cmljdDogXCJBXCIsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRlbGVtZW50JywgJyRzY29wZScsICckY29tcGlsZScsIEFuZ3VsYXJEaXJlY3RpdmVDb250cm9sbGVyXSxcclxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhckdyaWQ6IFwiPVwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgYW5ndWxhck1vZHVsZS5kaXJlY3RpdmUoXCJhZ0dyaWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICByZXN0cmljdDogXCJBXCIsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRlbGVtZW50JywgJyRzY29wZScsICckY29tcGlsZScsICckYXR0cnMnLCBBbmd1bGFyRGlyZWN0aXZlQ29udHJvbGxlcl0sXHJcbiAgICAgICAgICAgICAgICBzY29wZTogdHJ1ZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcclxuICAgICAgICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gYW5ndWxhckdyaWRHbG9iYWxGdW5jdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZXhwb3J0cy5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkR2xvYmFsRnVuY3Rpb247XHJcbiAgICB9XHJcblxyXG4gICAgcm9vdC5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkR2xvYmFsRnVuY3Rpb247XHJcblxyXG4gICAgZnVuY3Rpb24gQW5ndWxhckRpcmVjdGl2ZUNvbnRyb2xsZXIoJGVsZW1lbnQsICRzY29wZSwgJGNvbXBpbGUsICRhdHRycykge1xyXG4gICAgICAgIHZhciBncmlkT3B0aW9ucztcclxuICAgICAgICB2YXIgcXVpY2tGaWx0ZXJPblNjb3BlO1xyXG4gICAgICAgIGlmICgkYXR0cnMpIHtcclxuICAgICAgICAgICAgLy8gbmV3IGRpcmVjdGl2ZSBvZiBhZy1ncmlkXHJcbiAgICAgICAgICAgIHZhciBrZXlPZkdyaWRJblNjb3BlID0gJGF0dHJzLmFnR3JpZDtcclxuICAgICAgICAgICAgcXVpY2tGaWx0ZXJPblNjb3BlID0ga2V5T2ZHcmlkSW5TY29wZSArICcucXVpY2tGaWx0ZXJUZXh0JztcclxuICAgICAgICAgICAgZ3JpZE9wdGlvbnMgPSAkc2NvcGUuJGV2YWwoa2V5T2ZHcmlkSW5TY29wZSk7XHJcbiAgICAgICAgICAgIGlmICghZ3JpZE9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIldBUk5JTkcgLSBncmlkIG9wdGlvbnMgZm9yIEFuZ3VsYXIgR3JpZCBub3QgZm91bmQuIFBsZWFzZSBlbnN1cmUgdGhlIGF0dHJpYnV0ZSBhZy1ncmlkIHBvaW50cyB0byBhIHZhbGlkIG9iamVjdCBvbiB0aGUgc2NvcGVcIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBvbGQgZGlyZWN0aXZlIG9mIGFuZ3VsYXItZ3JpZFxyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJXQVJOSU5HIC0gRGlyZWN0aXZlIGFuZ3VsYXItZ3JpZCBpcyBkZXByZWNhdGVkLCB5b3Ugc2hvdWxkIHVzZSB0aGUgYWctZ3JpZCBkaXJlY3RpdmUgaW5zdGVhZC5cIik7XHJcbiAgICAgICAgICAgIGdyaWRPcHRpb25zID0gJHNjb3BlLmFuZ3VsYXJHcmlkO1xyXG4gICAgICAgICAgICBxdWlja0ZpbHRlck9uU2NvcGUgPSAnYW5ndWxhckdyaWQucXVpY2tGaWx0ZXJUZXh0JztcclxuICAgICAgICAgICAgaWYgKCFncmlkT3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiV0FSTklORyAtIGdyaWQgb3B0aW9ucyBmb3IgQW5ndWxhciBHcmlkIG5vdCBmb3VuZC4gUGxlYXNlIGVuc3VyZSB0aGUgYXR0cmlidXRlIGFuZ3VsYXItZ3JpZCBwb2ludHMgdG8gYSB2YWxpZCBvYmplY3Qgb24gdGhlIHNjb3BlXCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZUdyaWREaXYgPSAkZWxlbWVudFswXTtcclxuICAgICAgICB2YXIgZ3JpZCA9IG5ldyBHcmlkKGVHcmlkRGl2LCBncmlkT3B0aW9ucywgJHNjb3BlLCAkY29tcGlsZSwgcXVpY2tGaWx0ZXJPblNjb3BlKTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbihcIiRkZXN0cm95XCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBncmlkLnNldEZpbmlzaGVkKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2xvYmFsIEZ1bmN0aW9uIC0gdGhpcyBmdW5jdGlvbiBpcyB1c2VkIGZvciBjcmVhdGluZyBhIGdyaWQsIG91dHNpZGUgb2YgYW55IEFuZ3VsYXJKU1xyXG4gICAgZnVuY3Rpb24gYW5ndWxhckdyaWRHbG9iYWxGdW5jdGlvbihlbGVtZW50LCBncmlkT3B0aW9ucykge1xyXG4gICAgICAgIC8vIHNlZSBpZiBlbGVtZW50IGlzIGEgcXVlcnkgc2VsZWN0b3IsIG9yIGEgcmVhbCBlbGVtZW50XHJcbiAgICAgICAgdmFyIGVHcmlkRGl2O1xyXG4gICAgICAgIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgZUdyaWREaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICBpZiAoIWVHcmlkRGl2KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1dBUk5JTkcgLSB3YXMgbm90IGFibGUgdG8gZmluZCBlbGVtZW50ICcgKyBlbGVtZW50ICsgJyBpbiB0aGUgRE9NLCBBbmd1bGFyIEdyaWQgaW5pdGlhbGlzYXRpb24gYWJvcnRlZC4nKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVHcmlkRGl2ID0gZWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmV3IEdyaWQoZUdyaWREaXYsIGdyaWRPcHRpb25zLCBudWxsLCBudWxsKTtcclxuICAgIH1cclxuXHJcbn0pLmNhbGwod2luZG93KTtcclxuIiwidmFyIFN2Z0ZhY3RvcnkgPSByZXF1aXJlKCcuLi9zdmdGYWN0b3J5Jyk7XHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcbnZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcclxudmFyIHN2Z0ZhY3RvcnkgPSBuZXcgU3ZnRmFjdG9yeSgpO1xyXG5cclxuZnVuY3Rpb24gZ3JvdXBDZWxsUmVuZGVyZXJGYWN0b3J5KGdyaWRPcHRpb25zV3JhcHBlciwgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5KSB7XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGdyb3VwQ2VsbFJlbmRlcmVyKHBhcmFtcykge1xyXG5cclxuICAgICAgICB2YXIgZUdyb3VwQ2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICB2YXIgbm9kZSA9IHBhcmFtcy5ub2RlO1xyXG5cclxuICAgICAgICB2YXIgY2VsbEV4cGFuZGFibGUgPSBub2RlLmdyb3VwICYmICFub2RlLmZvb3RlcjtcclxuICAgICAgICBpZiAoY2VsbEV4cGFuZGFibGUpIHtcclxuICAgICAgICAgICAgYWRkRXhwYW5kQW5kQ29udHJhY3QoZUdyb3VwQ2VsbCwgcGFyYW1zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBjaGVja2JveE5lZWRlZCA9IHBhcmFtcy5jb2xEZWYgJiYgcGFyYW1zLmNvbERlZi5jZWxsUmVuZGVyZXIgJiYgcGFyYW1zLmNvbERlZi5jZWxsUmVuZGVyZXIuY2hlY2tib3ggJiYgIW5vZGUuZm9vdGVyO1xyXG4gICAgICAgIGlmIChjaGVja2JveE5lZWRlZCkge1xyXG4gICAgICAgICAgICB2YXIgZUNoZWNrYm94ID0gc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LmNyZWF0ZVNlbGVjdGlvbkNoZWNrYm94KG5vZGUsIHBhcmFtcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgIGVHcm91cENlbGwuYXBwZW5kQ2hpbGQoZUNoZWNrYm94KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwYXJhbXMuY29sRGVmICYmIHBhcmFtcy5jb2xEZWYuY2VsbFJlbmRlcmVyICYmIHBhcmFtcy5jb2xEZWYuY2VsbFJlbmRlcmVyLmlubmVyUmVuZGVyZXIpIHtcclxuICAgICAgICAgICAgY3JlYXRlRnJvbUlubmVyUmVuZGVyZXIoZUdyb3VwQ2VsbCwgcGFyYW1zLCBwYXJhbXMuY29sRGVmLmNlbGxSZW5kZXJlci5pbm5lclJlbmRlcmVyKTtcclxuICAgICAgICB9IGVsc2UgaWYgKG5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgICAgIGNyZWF0ZUZvb3RlckNlbGwoZUdyb3VwQ2VsbCwgcGFyYW1zKTtcclxuICAgICAgICB9IGVsc2UgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgY3JlYXRlR3JvdXBDZWxsKGVHcm91cENlbGwsIHBhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3JlYXRlTGVhZkNlbGwoZUdyb3VwQ2VsbCwgcGFyYW1zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG9ubHkgZG8gdGhpcyBpZiBhbiBpbmRlbnQgLSBhcyB0aGlzIG92ZXJ3cml0ZXMgdGhlIHBhZGRpbmcgdGhhdFxyXG4gICAgICAgIC8vIHRoZSB0aGVtZSBzZXQsIHdoaWNoIHdpbGwgbWFrZSB0aGluZ3MgbG9vayAnbm90IGFsaWduZWQnIGZvciB0aGVcclxuICAgICAgICAvLyBmaXJzdCBncm91cCBsZXZlbC5cclxuICAgICAgICBpZiAobm9kZS5mb290ZXIgfHwgbm9kZS5sZXZlbCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIHBhZGRpbmdQeCA9IG5vZGUubGV2ZWwgKiAxMDtcclxuICAgICAgICAgICAgaWYgKG5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nUHggKz0gMTA7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIW5vZGUuZ3JvdXApIHtcclxuICAgICAgICAgICAgICAgIHBhZGRpbmdQeCArPSA1O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVHcm91cENlbGwuc3R5bGUucGFkZGluZ0xlZnQgPSBwYWRkaW5nUHggKyAncHgnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGVHcm91cENlbGw7XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGFkZEV4cGFuZEFuZENvbnRyYWN0KGVHcm91cENlbGwsIHBhcmFtcykge1xyXG5cclxuICAgICAgICB2YXIgZUV4cGFuZEljb24gPSBjcmVhdGVHcm91cEV4cGFuZEljb24odHJ1ZSk7XHJcbiAgICAgICAgdmFyIGVDb250cmFjdEljb24gPSBjcmVhdGVHcm91cEV4cGFuZEljb24oZmFsc2UpO1xyXG4gICAgICAgIGVHcm91cENlbGwuYXBwZW5kQ2hpbGQoZUV4cGFuZEljb24pO1xyXG4gICAgICAgIGVHcm91cENlbGwuYXBwZW5kQ2hpbGQoZUNvbnRyYWN0SWNvbik7XHJcblxyXG4gICAgICAgIGVFeHBhbmRJY29uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXhwYW5kT3JDb250cmFjdCk7XHJcbiAgICAgICAgZUNvbnRyYWN0SWNvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV4cGFuZE9yQ29udHJhY3QpO1xyXG4gICAgICAgIGVHcm91cENlbGwuYWRkRXZlbnRMaXN0ZW5lcignZGJsY2xpY2snLCBleHBhbmRPckNvbnRyYWN0KTtcclxuXHJcbiAgICAgICAgc2hvd0FuZEhpZGVFeHBhbmRBbmRDb250cmFjdChlRXhwYW5kSWNvbiwgZUNvbnRyYWN0SWNvbiwgcGFyYW1zLm5vZGUuZXhwYW5kZWQpO1xyXG5cclxuICAgICAgICAvLyBpZiBwYXJlbnQgY2VsbCB3YXMgcGFzc2VkLCB0aGVuIHdlIGNhbiBsaXN0ZW4gZm9yIHdoZW4gZm9jdXMgaXMgb24gdGhlIGNlbGwsXHJcbiAgICAgICAgLy8gYW5kIHRoZW4gZXhwYW5kIC8gY29udHJhY3QgYXMgdGhlIHVzZXIgaGl0cyBlbnRlciBvciBzcGFjZS1iYXJcclxuICAgICAgICBpZiAocGFyYW1zLmVHcmlkQ2VsbCkge1xyXG4gICAgICAgICAgICBwYXJhbXMuZUdyaWRDZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHV0aWxzLmlzS2V5UHJlc3NlZChldmVudCwgY29uc3RhbnRzLktFWV9FTlRFUikpIHtcclxuICAgICAgICAgICAgICAgICAgICBleHBhbmRPckNvbnRyYWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBleHBhbmRPckNvbnRyYWN0KCkge1xyXG4gICAgICAgICAgICBleHBhbmRHcm91cChlRXhwYW5kSWNvbiwgZUNvbnRyYWN0SWNvbiwgcGFyYW1zKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd0FuZEhpZGVFeHBhbmRBbmRDb250cmFjdChlRXhwYW5kSWNvbiwgZUNvbnRyYWN0SWNvbiwgZXhwYW5kZWQpIHtcclxuICAgICAgICB1dGlscy5zZXRWaXNpYmxlKGVFeHBhbmRJY29uLCAhZXhwYW5kZWQpO1xyXG4gICAgICAgIHV0aWxzLnNldFZpc2libGUoZUNvbnRyYWN0SWNvbiwgZXhwYW5kZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUZyb21Jbm5lclJlbmRlcmVyKGVHcm91cENlbGwsIHBhcmFtcywgcmVuZGVyZXIpIHtcclxuICAgICAgICB1dGlscy51c2VSZW5kZXJlcihlR3JvdXBDZWxsLCByZW5kZXJlciwgcGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBleHBhbmRHcm91cChlRXhwYW5kSWNvbiwgZUNvbnRyYWN0SWNvbiwgcGFyYW1zKSB7XHJcbiAgICAgICAgcGFyYW1zLm5vZGUuZXhwYW5kZWQgPSAhcGFyYW1zLm5vZGUuZXhwYW5kZWQ7XHJcbiAgICAgICAgcGFyYW1zLmFwaS5vbkdyb3VwRXhwYW5kZWRPckNvbGxhcHNlZChwYXJhbXMucm93SW5kZXggKyAxKTtcclxuICAgICAgICBzaG93QW5kSGlkZUV4cGFuZEFuZENvbnRyYWN0KGVFeHBhbmRJY29uLCBlQ29udHJhY3RJY29uLCBwYXJhbXMubm9kZS5leHBhbmRlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlR3JvdXBFeHBhbmRJY29uKGV4cGFuZGVkKSB7XHJcbiAgICAgICAgdmFyIGVJY29uO1xyXG4gICAgICAgIGlmIChleHBhbmRlZCkge1xyXG4gICAgICAgICAgICBlSWNvbiA9IHV0aWxzLmNyZWF0ZUljb24oJ2dyb3VwQ29udHJhY3RlZCcsIGdyaWRPcHRpb25zV3JhcHBlciwgbnVsbCwgc3ZnRmFjdG9yeS5jcmVhdGVBcnJvd1JpZ2h0U3ZnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlSWNvbiA9IHV0aWxzLmNyZWF0ZUljb24oJ2dyb3VwRXhwYW5kZWQnLCBncmlkT3B0aW9uc1dyYXBwZXIsIG51bGwsIHN2Z0ZhY3RvcnkuY3JlYXRlQXJyb3dEb3duU3ZnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdXRpbHMuYWRkQ3NzQ2xhc3MoZUljb24sICdhZy1ncm91cC1leHBhbmQnKTtcclxuICAgICAgICByZXR1cm4gZUljb247XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY3JlYXRlcyBjZWxsIHdpdGggJ1RvdGFsIHt7a2V5fX0nIGZvciBhIGdyb3VwXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVGb290ZXJDZWxsKGVHcm91cENlbGwsIHBhcmFtcykge1xyXG4gICAgICAgIHZhciB0ZXh0VG9EaXNwbGF5ID0gXCJUb3RhbCBcIiArIGdldEdyb3VwTmFtZShwYXJhbXMpO1xyXG4gICAgICAgIHZhciBlVGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHRUb0Rpc3BsYXkpO1xyXG4gICAgICAgIGVHcm91cENlbGwuYXBwZW5kQ2hpbGQoZVRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldEdyb3VwTmFtZShwYXJhbXMpIHtcclxuICAgICAgICB2YXIgY2VsbFJlbmRlcmVyID0gcGFyYW1zLmNvbERlZi5jZWxsUmVuZGVyZXI7XHJcbiAgICAgICAgaWYgKGNlbGxSZW5kZXJlciAmJiBjZWxsUmVuZGVyZXIua2V5TWFwXHJcbiAgICAgICAgICAgICYmIHR5cGVvZiBjZWxsUmVuZGVyZXIua2V5TWFwID09PSAnb2JqZWN0JyAmJiBwYXJhbXMuY29sRGVmLmNlbGxSZW5kZXJlciAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB2YXIgdmFsdWVGcm9tTWFwID0gY2VsbFJlbmRlcmVyLmtleU1hcFtwYXJhbXMubm9kZS5rZXldO1xyXG4gICAgICAgICAgICBpZiAodmFsdWVGcm9tTWFwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVGcm9tTWFwO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcmFtcy5ub2RlLmtleTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXJhbXMubm9kZS5rZXk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNyZWF0ZXMgY2VsbCB3aXRoICd7e2tleX19ICh7e2NoaWxkQ291bnR9fSknIGZvciBhIGdyb3VwXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVHcm91cENlbGwoZUdyb3VwQ2VsbCwgcGFyYW1zKSB7XHJcbiAgICAgICAgdmFyIGdyb3VwTmFtZSA9IGdldEdyb3VwTmFtZShwYXJhbXMpO1xyXG5cclxuICAgICAgICB2YXIgY29sRGVmT2ZHcm91cGVkQ29sID0gcGFyYW1zLmFwaS5nZXRDb2x1bW5EZWYocGFyYW1zLm5vZGUuZmllbGQpO1xyXG4gICAgICAgIGlmIChjb2xEZWZPZkdyb3VwZWRDb2wgJiYgdHlwZW9mIGNvbERlZk9mR3JvdXBlZENvbC5jZWxsUmVuZGVyZXIgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgcGFyYW1zLnZhbHVlID0gZ3JvdXBOYW1lO1xyXG4gICAgICAgICAgICB1dGlscy51c2VSZW5kZXJlcihlR3JvdXBDZWxsLCBjb2xEZWZPZkdyb3VwZWRDb2wuY2VsbFJlbmRlcmVyLCBwYXJhbXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVHcm91cENlbGwuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZ3JvdXBOYW1lKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBvbmx5IGluY2x1ZGUgdGhlIGNoaWxkIGNvdW50IGlmIGl0J3MgaW5jbHVkZWQsIGVnIGlmIHVzZXIgZG9pbmcgY3VzdG9tIGFnZ3JlZ2F0aW9uLFxyXG4gICAgICAgIC8vIHRoZW4gdGhpcyBjb3VsZCBiZSBsZWZ0IG91dCwgb3Igc2V0IHRvIC0xLCBpZSBubyBjaGlsZCBjb3VudFxyXG4gICAgICAgIHZhciBzdXBwcmVzc0NvdW50ID0gcGFyYW1zLmNvbERlZi5jZWxsUmVuZGVyZXIgJiYgcGFyYW1zLmNvbERlZi5jZWxsUmVuZGVyZXIuc3VwcHJlc3NDb3VudDtcclxuICAgICAgICBpZiAoIXN1cHByZXNzQ291bnQgJiYgcGFyYW1zLm5vZGUuYWxsQ2hpbGRyZW5Db3VudCA+PSAwKSB7XHJcbiAgICAgICAgICAgIGVHcm91cENlbGwuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCIgKFwiICsgcGFyYW1zLm5vZGUuYWxsQ2hpbGRyZW5Db3VudCArIFwiKVwiKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNyZWF0ZXMgY2VsbCB3aXRoICd7e2tleX19ICh7e2NoaWxkQ291bnR9fSknIGZvciBhIGdyb3VwXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVMZWFmQ2VsbChlUGFyZW50LCBwYXJhbXMpIHtcclxuICAgICAgICBpZiAocGFyYW1zLnZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhciBlVGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcgJyArIHBhcmFtcy52YWx1ZSk7XHJcbiAgICAgICAgICAgIGVQYXJlbnQuYXBwZW5kQ2hpbGQoZVRleHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBncm91cENlbGxSZW5kZXJlckZhY3Rvcnk7IiwidmFyIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxuXHJcbmZ1bmN0aW9uIENvbHVtbkNvbnRyb2xsZXIoKSB7XHJcbiAgICB0aGlzLmxpc3RlbmVycyA9IFtdO1xyXG4gICAgdGhpcy5jcmVhdGVNb2RlbCgpO1xyXG59XHJcblxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oYW5ndWxhckdyaWQsIHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSwgZ3JpZE9wdGlvbnNXcmFwcGVyLCBleHByZXNzaW9uU2VydmljZSkge1xyXG4gICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIgPSBncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkID0gYW5ndWxhckdyaWQ7XHJcbiAgICB0aGlzLnNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSA9IHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeTtcclxuICAgIHRoaXMuZXhwcmVzc2lvblNlcnZpY2UgPSBleHByZXNzaW9uU2VydmljZTtcclxufTtcclxuXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmNyZWF0ZU1vZGVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB0aGlzLm1vZGVsID0ge1xyXG4gICAgICAgIC8vIHVzZWQgYnk6XHJcbiAgICAgICAgLy8gKyBpbk1lbW9yeVJvd0NvbnRyb2xsZXIgLT4gc29ydGluZywgYnVpbGRpbmcgcXVpY2sgZmlsdGVyIHRleHRcclxuICAgICAgICAvLyArIGhlYWRlclJlbmRlcmVyIC0+IHNvcnRpbmcgKGNsZWFyaW5nIGljb24pXHJcbiAgICAgICAgZ2V0QWxsQ29sdW1uczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmFsbENvbHVtbnM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyArIHJvd0NvbnRyb2xsZXIgLT4gd2hpbGUgaW5zZXJ0aW5nIHJvd3MsIGFuZCB3aGVuIHRhYmJpbmcgdGhyb3VnaCBjZWxscyAobmVlZCB0byBjaGFuZ2UgdGhpcylcclxuICAgICAgICAvLyBuZWVkIGEgbmV3TWV0aG9kIC0gZ2V0IG5leHQgY29sIGluZGV4XHJcbiAgICAgICAgZ2V0RGlzcGxheWVkQ29sdW1uczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmRpc3BsYXllZENvbHVtbnM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyArIHRvb2xQYW5lbFxyXG4gICAgICAgIGdldEdyb3VwZWRDb2x1bW5zOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZ3JvdXBlZENvbHVtbnM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyB1c2VkIGJ5OlxyXG4gICAgICAgIC8vICsgYW5ndWxhckdyaWQgLT4gZm9yIHNldHRpbmcgYm9keSB3aWR0aFxyXG4gICAgICAgIC8vICsgcm93Q29udHJvbGxlciAtPiBzZXR0aW5nIG1haW4gcm93IHdpZHRocyAod2hlbiBpbnNlcnRpbmcgYW5kIHJlc2l6aW5nKVxyXG4gICAgICAgIGdldEJvZHlDb250YWluZXJXaWR0aDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmdldFRvdGFsQ29sV2lkdGgoZmFsc2UpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gdXNlZCBieTpcclxuICAgICAgICAvLyArIGFuZ3VsYXJHcmlkIC0+IHNldHRpbmcgcGlubmVkIGJvZHkgd2lkdGhcclxuICAgICAgICBnZXRQaW5uZWRDb250YWluZXJXaWR0aDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmdldFRvdGFsQ29sV2lkdGgodHJ1ZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyB1c2VkIGJ5OlxyXG4gICAgICAgIC8vICsgaGVhZGVyUmVuZGVyZXIgLT4gc2V0dGluZyBwaW5uZWQgYm9keSB3aWR0aFxyXG4gICAgICAgIGdldEhlYWRlckdyb3VwczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmhlYWRlckdyb3VwcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIHVzZWQgYnk6XHJcbiAgICAgICAgLy8gKyBhcGkuZ2V0RmlsdGVyTW9kZWwoKSAtPiB0byBtYXAgY29sRGVmIHRvIGNvbHVtbiwga2V5IGNhbiBiZSBjb2xEZWYgb3IgZmllbGRcclxuICAgICAgICBnZXRDb2x1bW46IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5nZXRDb2x1bW4oa2V5KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIHVzZWQgYnk6XHJcbiAgICAgICAgLy8gKyByb3dSZW5kZXJlciAtPiBmb3IgbmF2aWdhdGlvblxyXG4gICAgICAgIGdldFZpc2libGVDb2xCZWZvcmU6IGZ1bmN0aW9uKGNvbCkge1xyXG4gICAgICAgICAgICB2YXIgb2xkSW5kZXggPSB0aGF0LnZpc2libGVDb2x1bW5zLmluZGV4T2YoY29sKTtcclxuICAgICAgICAgICAgaWYgKG9sZEluZGV4ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoYXQudmlzaWJsZUNvbHVtbnNbb2xkSW5kZXggLSAxXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyB1c2VkIGJ5OlxyXG4gICAgICAgIC8vICsgcm93UmVuZGVyZXIgLT4gZm9yIG5hdmlnYXRpb25cclxuICAgICAgICBnZXRWaXNpYmxlQ29sQWZ0ZXI6IGZ1bmN0aW9uKGNvbCkge1xyXG4gICAgICAgICAgICB2YXIgb2xkSW5kZXggPSB0aGF0LnZpc2libGVDb2x1bW5zLmluZGV4T2YoY29sKTtcclxuICAgICAgICAgICAgaWYgKG9sZEluZGV4IDwgKHRoYXQudmlzaWJsZUNvbHVtbnMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGF0LnZpc2libGVDb2x1bW5zW29sZEluZGV4ICsgMV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0RGlzcGxheU5hbWVGb3JDb2w6IGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5nZXREaXNwbGF5TmFtZUZvckNvbChjb2x1bW4pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5nZXRDb2x1bW4gPSBmdW5jdGlvbihrZXkpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpPHRoaXMuYWxsQ29sdW1ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBjb2xEZWZNYXRjaGVzID0gdGhpcy5hbGxDb2x1bW5zW2ldLmNvbERlZiA9PT0ga2V5O1xyXG4gICAgICAgIHZhciBmaWVsZE1hdGNoZXMgPSB0aGlzLmFsbENvbHVtbnNbaV0uY29sRGVmLmZpZWxkID09PSBrZXk7XHJcbiAgICAgICAgaWYgKGNvbERlZk1hdGNoZXMgfHwgZmllbGRNYXRjaGVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFsbENvbHVtbnNbaV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0RGlzcGxheU5hbWVGb3JDb2wgPSBmdW5jdGlvbihjb2x1bW4pIHtcclxuXHJcbiAgICB2YXIgY29sRGVmID0gY29sdW1uLmNvbERlZjtcclxuICAgIHZhciBoZWFkZXJWYWx1ZUdldHRlciA9IGNvbERlZi5oZWFkZXJWYWx1ZUdldHRlcjtcclxuXHJcbiAgICBpZiAoaGVhZGVyVmFsdWVHZXR0ZXIpIHtcclxuICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKSxcclxuICAgICAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBoZWFkZXJWYWx1ZUdldHRlciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAvLyB2YWx1ZUdldHRlciBpcyBhIGZ1bmN0aW9uLCBzbyBqdXN0IGNhbGwgaXRcclxuICAgICAgICAgICAgcmV0dXJuIGhlYWRlclZhbHVlR2V0dGVyKHBhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaGVhZGVyVmFsdWVHZXR0ZXIgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIC8vIHZhbHVlR2V0dGVyIGlzIGFuIGV4cHJlc3Npb24sIHNvIGV4ZWN1dGUgdGhlIGV4cHJlc3Npb25cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhwcmVzc2lvblNlcnZpY2UuZXZhbHVhdGUoaGVhZGVyVmFsdWVHZXR0ZXIsIHBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdXRpbHMuZ2V0VmFsdWUodGhpcy5leHByZXNzaW9uU2VydmljZSwgdW5kZWZpbmVkLCBjb2xEZWYsIHVuZGVmaW5lZCwgYXBpLCBjb250ZXh0KTtcclxuICAgIH0gZWxzZSBpZiAoY29sRGVmLmRpc3BsYXlOYW1lKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKFwiYWctZ3JpZDogRm91bmQgZGlzcGxheU5hbWUgXCIgKyBjb2xEZWYuZGlzcGxheU5hbWUgKyBcIiwgcGxlYXNlIHVzZSBoZWFkZXJOYW1lIGluc3RlYWQsIGRpc3BsYXlOYW1lIGlzIGRlcHJlY2F0ZWQuXCIpO1xyXG4gICAgICAgIHJldHVybiBjb2xEZWYuZGlzcGxheU5hbWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBjb2xEZWYuaGVhZGVyTmFtZTtcclxuICAgIH1cclxufTtcclxuXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24obGlzdGVuZXIpIHtcclxuICAgIHRoaXMubGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xyXG59O1xyXG5cclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuZmlyZUNvbHVtbnNDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaTx0aGlzLmxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzW2ldLmNvbHVtbnNDaGFuZ2VkKHRoaXMuYWxsQ29sdW1ucywgdGhpcy5ncm91cGVkQ29sdW1ucyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5nZXRNb2RlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubW9kZWw7XHJcbn07XHJcblxyXG4vLyBjYWxsZWQgYnkgYW5ndWxhckdyaWRcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuc2V0Q29sdW1ucyA9IGZ1bmN0aW9uKGNvbHVtbkRlZnMpIHtcclxuICAgIHRoaXMuY2hlY2tGb3JEZXByZWNhdGVkSXRlbXMoY29sdW1uRGVmcyk7XHJcbiAgICB0aGlzLmNyZWF0ZUNvbHVtbnMoY29sdW1uRGVmcyk7XHJcbiAgICB0aGlzLmNyZWF0ZUFnZ0NvbHVtbnMoKTtcclxuICAgIHRoaXMudXBkYXRlTW9kZWwoKTtcclxuICAgIHRoaXMuZmlyZUNvbHVtbnNDaGFuZ2VkKCk7XHJcbn07XHJcblxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5jaGVja0ZvckRlcHJlY2F0ZWRJdGVtcyA9IGZ1bmN0aW9uKGNvbHVtbkRlZnMpIHtcclxuICAgIGlmIChjb2x1bW5EZWZzKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGk8Y29sdW1uRGVmcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgY29sRGVmID0gY29sdW1uRGVmc1tpXTtcclxuICAgICAgICAgICAgaWYgKGNvbERlZi5ncm91cCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2FnLWdyaWQ6ICcgKyBjb2xEZWYuZmllbGQgKyAnIGNvbERlZi5ncm91cCBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIGNvbERlZi5oZWFkZXJHcm91cCcpO1xyXG4gICAgICAgICAgICAgICAgY29sRGVmLmhlYWRlckdyb3VwID0gY29sRGVmLmdyb3VwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb2xEZWYuZ3JvdXBTaG93ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignYWctZ3JpZDogJyArIGNvbERlZi5maWVsZCArICcgY29sRGVmLmdyb3VwU2hvdyBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIGNvbERlZi5oZWFkZXJHcm91cFNob3cnKTtcclxuICAgICAgICAgICAgICAgIGNvbERlZi5oZWFkZXJHcm91cFNob3cgPSBjb2xEZWYuZ3JvdXBTaG93O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gY2FsbGVkIGJ5IGhlYWRlclJlbmRlcmVyIC0gd2hlbiBhIGhlYWRlciBpcyBvcGVuZWQgb3IgY2xvc2VkXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmhlYWRlckdyb3VwT3BlbmVkID0gZnVuY3Rpb24oZ3JvdXApIHtcclxuICAgIGdyb3VwLmV4cGFuZGVkID0gIWdyb3VwLmV4cGFuZGVkO1xyXG4gICAgdGhpcy51cGRhdGVHcm91cHMoKTtcclxuICAgIHRoaXMudXBkYXRlRGlzcGxheWVkQ29sdW1ucygpO1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZC5yZWZyZXNoSGVhZGVyQW5kQm9keSgpO1xyXG59O1xyXG5cclxuLy8gY2FsbGVkIGJ5IHRvb2xQYW5lbCAtIHdoZW4gY2hhbmdlIGluIGNvbHVtbnMgaGFwcGVuc1xyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5vbkNvbHVtblN0YXRlQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy51cGRhdGVNb2RlbCgpO1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZC5yZWZyZXNoSGVhZGVyQW5kQm9keSgpO1xyXG59O1xyXG5cclxuLy8gY2FsbGVkIGZyb20gQVBJXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmhpZGVDb2x1bW5zID0gZnVuY3Rpb24oY29sSWRzLCBoaWRlKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaTx0aGlzLmFsbENvbHVtbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgaWRUaGlzQ29sID0gdGhpcy5hbGxDb2x1bW5zW2ldLmNvbElkO1xyXG4gICAgICAgIHZhciBoaWRlVGhpc0NvbCA9IGNvbElkcy5pbmRleE9mKGlkVGhpc0NvbCkgPj0gMDtcclxuICAgICAgICBpZiAoaGlkZVRoaXNDb2wpIHtcclxuICAgICAgICAgICAgdGhpcy5hbGxDb2x1bW5zW2ldLnZpc2libGUgPSAhaGlkZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLm9uQ29sdW1uU3RhdGVDaGFuZ2VkKCk7XHJcbiAgICB0aGlzLmZpcmVDb2x1bW5zQ2hhbmdlZCgpOyAvLyB0byB0ZWxsIHRvb2xiYXJcclxufTtcclxuXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZU1vZGVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnVwZGF0ZVZpc2libGVDb2x1bW5zKCk7XHJcbiAgICB0aGlzLnVwZGF0ZVBpbm5lZENvbHVtbnMoKTtcclxuICAgIHRoaXMuYnVpbGRHcm91cHMoKTtcclxuICAgIHRoaXMudXBkYXRlR3JvdXBzKCk7XHJcbiAgICB0aGlzLnVwZGF0ZURpc3BsYXllZENvbHVtbnMoKTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlRGlzcGxheWVkQ29sdW1ucyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEhlYWRlcnMoKSkge1xyXG4gICAgICAgIC8vIGlmIG5vdCBncm91cGluZyBieSBoZWFkZXJzLCB0aGVuIHB1bGwgdmlzaWJsZSBjb2xzXHJcbiAgICAgICAgdGhpcy5kaXNwbGF5ZWRDb2x1bW5zID0gdGhpcy52aXNpYmxlQ29sdW1ucztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gaWYgZ3JvdXBpbmcsIHRoZW4gb25seSBzaG93IGNvbCBhcyBwZXIgZ3JvdXAgcnVsZXNcclxuICAgICAgICB0aGlzLmRpc3BsYXllZENvbHVtbnMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaGVhZGVyR3JvdXBzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBncm91cCA9IHRoaXMuaGVhZGVyR3JvdXBzW2ldO1xyXG4gICAgICAgICAgICBncm91cC5hZGRUb1Zpc2libGVDb2x1bW5zKHRoaXMuZGlzcGxheWVkQ29sdW1ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbi8vIHB1YmxpYyAtIGNhbGxlZCBmcm9tIGFwaVxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5zaXplQ29sdW1uc1RvRml0ID0gZnVuY3Rpb24oZ3JpZFdpZHRoKSB7XHJcbiAgICAvLyBhdm9pZCBkaXZpZGUgYnkgemVyb1xyXG4gICAgaWYgKGdyaWRXaWR0aCA8PSAwIHx8IHRoaXMuZGlzcGxheWVkQ29sdW1ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNvbHVtblN0YXJ0V2lkdGggPSAwOyAvLyB3aWxsIGNvbnRhaW4gdGhlIHN0YXJ0aW5nIHRvdGFsIHdpZHRoIG9mIHRoZSBjb2xzIGJlZW4gc3ByZWFkXHJcbiAgICB2YXIgY29sc1RvU3ByZWFkID0gW107IC8vIGFsbCB2aXNpYmxlIGNvbHMsIGV4Y2VwdCB0aG9zZSB3aXRoIGF2b2lkU2l6ZVRvRml0XHJcbiAgICB2YXIgd2lkdGhGb3JTcHJlYWRpbmcgPSBncmlkV2lkdGg7IC8vIGdyaWQgd2lkdGggbWludXMgdGhlIGNvbHVtbnMgd2UgYXJlIG5vdCByZXNpemluZ1xyXG5cclxuICAgIC8vIGdldCB0aGUgbGlzdCBvZiBjb2xzIHRvIHdvcmsgd2l0aFxyXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmRpc3BsYXllZENvbHVtbnMubGVuZ3RoIDsgaisrKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGlzcGxheWVkQ29sdW1uc1tqXS5jb2xEZWYuc3VwcHJlc3NTaXplVG9GaXQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgLy8gZG9uJ3QgaW5jbHVkZSBjb2wsIGFuZCByZW1vdmUgdGhlIHdpZHRoIGZyb20gdGVoIGF2YWlsYWJsZSB3aWR0aFxyXG4gICAgICAgICAgICB3aWR0aEZvclNwcmVhZGluZyAtPSB0aGlzLmRpc3BsYXllZENvbHVtbnNbal0uYWN0dWFsV2lkdGg7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gaW5jbHVkZSB0aGUgY29sXHJcbiAgICAgICAgICAgIGNvbHNUb1NwcmVhZC5wdXNoKHRoaXMuZGlzcGxheWVkQ29sdW1uc1tqXSk7XHJcbiAgICAgICAgICAgIGNvbHVtblN0YXJ0V2lkdGggKz0gdGhpcy5kaXNwbGF5ZWRDb2x1bW5zW2pdLmFjdHVhbFdpZHRoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBubyB3aWR0aCBsZWZ0IG92ZXIgdG8gc3ByZWFkIHdpdGgsIGRvIG5vdGhpbmdcclxuICAgIGlmICh3aWR0aEZvclNwcmVhZGluZyA8PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzY2FsZSA9IHdpZHRoRm9yU3ByZWFkaW5nIC8gY29sdW1uU3RhcnRXaWR0aDtcclxuICAgIHZhciBwaXhlbHNGb3JMYXN0Q29sID0gd2lkdGhGb3JTcHJlYWRpbmc7XHJcblxyXG4gICAgLy8gc2l6ZSBhbGwgY29scyBleGNlcHQgdGhlIGxhc3QgYnkgdGhlIHNjYWxlXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IChjb2xzVG9TcHJlYWQubGVuZ3RoIC0gMSk7IGkrKykge1xyXG4gICAgICAgIHZhciBjb2x1bW4gPSBjb2xzVG9TcHJlYWRbaV07XHJcbiAgICAgICAgdmFyIG5ld1dpZHRoID0gcGFyc2VJbnQoY29sdW1uLmFjdHVhbFdpZHRoICogc2NhbGUpO1xyXG4gICAgICAgIGNvbHVtbi5hY3R1YWxXaWR0aCA9IG5ld1dpZHRoO1xyXG4gICAgICAgIHBpeGVsc0Zvckxhc3RDb2wgLT0gbmV3V2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2l6ZSB0aGUgbGFzdCBieSB3aGF0cyByZW1haW5pbmcgKHRoaXMgYXZvaWRzIHJvdW5kaW5nIGVycm9ycyB0aGF0IGNvdWxkXHJcbiAgICAvLyBvY2N1ciB3aXRoIHNjYWxpbmcgZXZlcnl0aGluZywgd2hlcmUgaXQgcmVzdWx0IGluIHNvbWUgcGl4ZWxzIG9mZilcclxuICAgIHZhciBsYXN0Q29sdW1uID0gY29sc1RvU3ByZWFkW2NvbHNUb1NwcmVhZC5sZW5ndGggLSAxXTtcclxuICAgIGxhc3RDb2x1bW4uYWN0dWFsV2lkdGggPSBwaXhlbHNGb3JMYXN0Q29sO1xyXG5cclxuICAgIC8vIHdpZHRocyBzZXQsIHJlZnJlc2ggdGhlIGd1aVxyXG4gICAgdGhpcy5hbmd1bGFyR3JpZC5yZWZyZXNoSGVhZGVyQW5kQm9keSgpO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5idWlsZEdyb3VwcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gaWYgbm90IGdyb3VwaW5nIGJ5IGhlYWRlcnMsIGRvIG5vdGhpbmdcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEhlYWRlcnMoKSkge1xyXG4gICAgICAgIHRoaXMuaGVhZGVyR3JvdXBzID0gbnVsbDtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc3BsaXQgdGhlIGNvbHVtbnMgaW50byBncm91cHNcclxuICAgIHZhciBjdXJyZW50R3JvdXAgPSBudWxsO1xyXG4gICAgdGhpcy5oZWFkZXJHcm91cHMgPSBbXTtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICB2YXIgbGFzdENvbFdhc1Bpbm5lZCA9IHRydWU7XHJcblxyXG4gICAgdGhpcy52aXNpYmxlQ29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgICAgIC8vIGRvIHdlIG5lZWQgYSBuZXcgZ3JvdXAsIGJlY2F1c2Ugd2UgbW92ZSBmcm9tIHBpbm5lZCB0byBub24tcGlubmVkIGNvbHVtbnM/XHJcbiAgICAgICAgdmFyIGVuZE9mUGlubmVkSGVhZGVyID0gbGFzdENvbFdhc1Bpbm5lZCAmJiAhY29sdW1uLnBpbm5lZDtcclxuICAgICAgICBpZiAoIWNvbHVtbi5waW5uZWQpIHtcclxuICAgICAgICAgICAgbGFzdENvbFdhc1Bpbm5lZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBkbyB3ZSBuZWVkIGEgbmV3IGdyb3VwLCBiZWNhdXNlIHRoZSBncm91cCBuYW1lcyBkb2Vzbid0IG1hdGNoIGZyb20gcHJldmlvdXMgY29sP1xyXG4gICAgICAgIHZhciBncm91cEtleU1pc21hdGNoID0gY3VycmVudEdyb3VwICYmIGNvbHVtbi5jb2xEZWYuaGVhZGVyR3JvdXAgIT09IGN1cnJlbnRHcm91cC5uYW1lO1xyXG4gICAgICAgIC8vIHdlIGRvbid0IGdyb3VwIGNvbHVtbnMgd2hlcmUgbm8gZ3JvdXAgaXMgc3BlY2lmaWVkXHJcbiAgICAgICAgdmFyIGNvbE5vdEluR3JvdXAgPSBjdXJyZW50R3JvdXAgJiYgIWN1cnJlbnRHcm91cC5uYW1lO1xyXG4gICAgICAgIC8vIGRvIHdlIG5lZWQgYSBuZXcgZ3JvdXAsIGJlY2F1c2Ugd2UgYXJlIGp1c3Qgc3RhcnRpbmdcclxuICAgICAgICB2YXIgcHJvY2Vzc2luZ0ZpcnN0Q29sID0gY3VycmVudEdyb3VwID09PSBudWxsO1xyXG4gICAgICAgIHZhciBuZXdHcm91cE5lZWRlZCA9IHByb2Nlc3NpbmdGaXJzdENvbCB8fCBlbmRPZlBpbm5lZEhlYWRlciB8fCBncm91cEtleU1pc21hdGNoIHx8IGNvbE5vdEluR3JvdXA7XHJcbiAgICAgICAgLy8gY3JlYXRlIG5ldyBncm91cCwgaWYgaXQncyBuZWVkZWRcclxuICAgICAgICBpZiAobmV3R3JvdXBOZWVkZWQpIHtcclxuICAgICAgICAgICAgdmFyIHBpbm5lZCA9IGNvbHVtbi5waW5uZWQ7XHJcbiAgICAgICAgICAgIGN1cnJlbnRHcm91cCA9IG5ldyBoZWFkZXJHcm91cChwaW5uZWQsIGNvbHVtbi5jb2xEZWYuaGVhZGVyR3JvdXApO1xyXG4gICAgICAgICAgICB0aGF0LmhlYWRlckdyb3Vwcy5wdXNoKGN1cnJlbnRHcm91cCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGN1cnJlbnRHcm91cC5hZGRDb2x1bW4oY29sdW1uKTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVHcm91cHMgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGlmIG5vdCBncm91cGluZyBieSBoZWFkZXJzLCBkbyBub3RoaW5nXHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBIZWFkZXJzKCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmhlYWRlckdyb3Vwcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBncm91cCA9IHRoaXMuaGVhZGVyR3JvdXBzW2ldO1xyXG4gICAgICAgIGdyb3VwLmNhbGN1bGF0ZUV4cGFuZGFibGUoKTtcclxuICAgICAgICBncm91cC5jYWxjdWxhdGVEaXNwbGF5ZWRDb2x1bW5zKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZVZpc2libGVDb2x1bW5zID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnZpc2libGVDb2x1bW5zID0gW107XHJcblxyXG4gICAgdmFyIG5lZWRBR3JvdXBDb2x1bW4gPSB0aGlzLmdyb3VwZWRDb2x1bW5zLmxlbmd0aCA+IDBcclxuICAgICAgICAmJiAhdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cFN1cHByZXNzQXV0b0NvbHVtbigpXHJcbiAgICAgICAgJiYgIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBVc2VFbnRpcmVSb3coKTtcclxuXHJcbiAgICB2YXIgbG9jYWxlVGV4dEZ1bmMgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRMb2NhbGVUZXh0RnVuYygpO1xyXG5cclxuICAgIGlmIChuZWVkQUdyb3VwQ29sdW1uKSB7XHJcbiAgICAgICAgLy8gaWYgb25lIHByb3ZpZGVkIGJ5IHVzZXIsIHVzZSBpdCwgb3RoZXJ3aXNlIGNyZWF0ZSBvbmVcclxuICAgICAgICB2YXIgZ3JvdXBDb2xEZWYgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcm91cENvbHVtbkRlZigpO1xyXG4gICAgICAgIGlmICghZ3JvdXBDb2xEZWYpIHtcclxuICAgICAgICAgICAgZ3JvdXBDb2xEZWYgPSB7XHJcbiAgICAgICAgICAgICAgICBoZWFkZXJOYW1lOiBsb2NhbGVUZXh0RnVuYygnZ3JvdXAnLCdHcm91cCcpLFxyXG4gICAgICAgICAgICAgICAgY2VsbFJlbmRlcmVyOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyZXI6IFwiZ3JvdXBcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBubyBncm91cCBjb2x1bW4gcHJvdmlkZWQsIG5lZWQgdG8gY3JlYXRlIG9uZSBoZXJlXHJcbiAgICAgICAgdmFyIGdyb3VwQ29sdW1uID0gbmV3IENvbHVtbihncm91cENvbERlZiwgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29sV2lkdGgoKSk7XHJcbiAgICAgICAgdGhpcy52aXNpYmxlQ29sdW1ucy5wdXNoKGdyb3VwQ29sdW1uKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYWxsQ29sdW1ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBjb2x1bW4gPSB0aGlzLmFsbENvbHVtbnNbaV07XHJcbiAgICAgICAgaWYgKGNvbHVtbi52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgIGNvbHVtbi5pbmRleCA9IHRoaXMudmlzaWJsZUNvbHVtbnMubGVuZ3RoO1xyXG4gICAgICAgICAgICB0aGlzLnZpc2libGVDb2x1bW5zLnB1c2godGhpcy5hbGxDb2x1bW5zW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZVBpbm5lZENvbHVtbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBwaW5uZWRDb2x1bW5Db3VudCA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFBpbm5lZENvbENvdW50KCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmlzaWJsZUNvbHVtbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgcGlubmVkID0gaSA8IHBpbm5lZENvbHVtbkNvdW50O1xyXG4gICAgICAgIHRoaXMudmlzaWJsZUNvbHVtbnNbaV0ucGlubmVkID0gcGlubmVkO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5jcmVhdGVDb2x1bW5zID0gZnVuY3Rpb24oY29sdW1uRGVmcykge1xyXG4gICAgdGhpcy5hbGxDb2x1bW5zID0gW107XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBpZiAoY29sdW1uRGVmcykge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29sdW1uRGVmcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgY29sRGVmID0gY29sdW1uRGVmc1tpXTtcclxuICAgICAgICAgICAgLy8gdGhpcyBpcyBtZXNzeSAtIHdlIHN3YXAgaW4gYW5vdGhlciBjb2wgZGVmIGlmIGl0J3MgY2hlY2tib3ggc2VsZWN0aW9uIC0gbm90IGhhcHB5IDooXHJcbiAgICAgICAgICAgIGlmIChjb2xEZWYgPT09ICdjaGVja2JveFNlbGVjdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIGNvbERlZiA9IHRoYXQuc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LmNyZWF0ZUNoZWNrYm94Q29sRGVmKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHdpZHRoID0gdGhhdC5jYWxjdWxhdGVDb2xJbml0aWFsV2lkdGgoY29sRGVmKTtcclxuICAgICAgICAgICAgdmFyIGNvbHVtbiA9IG5ldyBDb2x1bW4oY29sRGVmLCB3aWR0aCk7XHJcbiAgICAgICAgICAgIHRoYXQuYWxsQ29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5jcmVhdGVBZ2dDb2x1bW5zID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmdyb3VwZWRDb2x1bW5zID0gW107XHJcbiAgICB2YXIgZ3JvdXBLZXlzID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0R3JvdXBLZXlzKCk7XHJcbiAgICBpZiAoIWdyb3VwS2V5cyB8fCBncm91cEtleXMubGVuZ3RoIDw9IDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdyb3VwS2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBncm91cEtleSA9IGdyb3VwS2V5c1tpXTtcclxuICAgICAgICB2YXIgY29sdW1uID0gdGhpcy5nZXRDb2x1bW4oZ3JvdXBLZXkpO1xyXG4gICAgICAgIGlmICghY29sdW1uKSB7XHJcbiAgICAgICAgICAgIGNvbHVtbiA9IHRoaXMuY3JlYXRlRHVtbXlDb2x1bW4oZ3JvdXBLZXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmdyb3VwZWRDb2x1bW5zLnB1c2goY29sdW1uKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuQ29sdW1uQ29udHJvbGxlci5wcm90b3R5cGUuY3JlYXRlRHVtbXlDb2x1bW4gPSBmdW5jdGlvbihmaWVsZCkge1xyXG4gICAgdmFyIGNvbERlZiA9IHtcclxuICAgICAgICBmaWVsZDogZmllbGQsXHJcbiAgICAgICAgaGVhZGVyTmFtZTogZmllbGQsXHJcbiAgICAgICAgaGlkZTogZmFsc2VcclxuICAgIH07XHJcbiAgICB2YXIgd2lkdGggPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb2xXaWR0aCgpO1xyXG4gICAgdmFyIGNvbHVtbiA9IG5ldyBDb2x1bW4oY29sRGVmLCB3aWR0aCk7XHJcbiAgICByZXR1cm4gY29sdW1uO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Db2x1bW5Db250cm9sbGVyLnByb3RvdHlwZS5jYWxjdWxhdGVDb2xJbml0aWFsV2lkdGggPSBmdW5jdGlvbihjb2xEZWYpIHtcclxuICAgIGlmICghY29sRGVmLndpZHRoKSB7XHJcbiAgICAgICAgLy8gaWYgbm8gd2lkdGggZGVmaW5lZCBpbiBjb2xEZWYsIHVzZSBkZWZhdWx0XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbFdpZHRoKCk7XHJcbiAgICB9IGVsc2UgaWYgKGNvbERlZi53aWR0aCA8IGNvbnN0YW50cy5NSU5fQ09MX1dJRFRIKSB7XHJcbiAgICAgICAgLy8gaWYgd2lkdGggaW4gY29sIGRlZiB0byBzbWFsbCwgc2V0IHRvIG1pbiB3aWR0aFxyXG4gICAgICAgIHJldHVybiBjb25zdGFudHMuTUlOX0NPTF9XSURUSDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlIHVzZSB0aGUgcHJvdmlkZWQgd2lkdGhcclxuICAgICAgICByZXR1cm4gY29sRGVmLndpZHRoO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyBjYWxsIHdpdGggdHJ1ZSAocGlubmVkKSwgZmFsc2UgKG5vdC1waW5uZWQpIG9yIHVuZGVmaW5lZCAoYWxsIGNvbHVtbnMpXHJcbkNvbHVtbkNvbnRyb2xsZXIucHJvdG90eXBlLmdldFRvdGFsQ29sV2lkdGggPSBmdW5jdGlvbihpbmNsdWRlUGlubmVkKSB7XHJcbiAgICB2YXIgd2lkdGhTb0ZhciA9IDA7XHJcbiAgICB2YXIgcGluZWROb3RJbXBvcnRhbnQgPSB0eXBlb2YgaW5jbHVkZVBpbm5lZCAhPT0gJ2Jvb2xlYW4nO1xyXG5cclxuICAgIHRoaXMuZGlzcGxheWVkQ29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgICAgIHZhciBpbmNsdWRlVGhpc0NvbCA9IHBpbmVkTm90SW1wb3J0YW50IHx8IGNvbHVtbi5waW5uZWQgPT09IGluY2x1ZGVQaW5uZWQ7XHJcbiAgICAgICAgaWYgKGluY2x1ZGVUaGlzQ29sKSB7XHJcbiAgICAgICAgICAgIHdpZHRoU29GYXIgKz0gY29sdW1uLmFjdHVhbFdpZHRoO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB3aWR0aFNvRmFyO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gaGVhZGVyR3JvdXAocGlubmVkLCBuYW1lKSB7XHJcbiAgICB0aGlzLnBpbm5lZCA9IHBpbm5lZDtcclxuICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICB0aGlzLmFsbENvbHVtbnMgPSBbXTtcclxuICAgIHRoaXMuZGlzcGxheWVkQ29sdW1ucyA9IFtdO1xyXG4gICAgdGhpcy5leHBhbmRhYmxlID0gZmFsc2U7IC8vIHdoZXRoZXIgdGhpcyBncm91cCBjYW4gYmUgZXhwYW5kZWQgb3Igbm90XHJcbiAgICB0aGlzLmV4cGFuZGVkID0gZmFsc2U7XHJcbn1cclxuXHJcbmhlYWRlckdyb3VwLnByb3RvdHlwZS5hZGRDb2x1bW4gPSBmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgIHRoaXMuYWxsQ29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbn07XHJcblxyXG4vLyBuZWVkIHRvIGNoZWNrIHRoYXQgdGhpcyBncm91cCBoYXMgYXQgbGVhc3Qgb25lIGNvbCBzaG93aW5nIHdoZW4gYm90aCBleHBhbmRlZCBhbmQgY29udHJhY3RlZC5cclxuLy8gaWYgbm90LCB0aGVuIHdlIGRvbid0IGFsbG93IGV4cGFuZGluZyBhbmQgY29udHJhY3Rpbmcgb24gdGhpcyBncm91cFxyXG5oZWFkZXJHcm91cC5wcm90b3R5cGUuY2FsY3VsYXRlRXhwYW5kYWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gd2FudCB0byBtYWtlIHN1cmUgdGhlIGdyb3VwIGRvZXNuJ3QgZGlzYXBwZWFyIHdoZW4gaXQncyBvcGVuXHJcbiAgICB2YXIgYXRMZWFzdE9uZVNob3dpbmdXaGVuT3BlbiA9IGZhbHNlO1xyXG4gICAgLy8gd2FudCB0byBtYWtlIHN1cmUgdGhlIGdyb3VwIGRvZXNuJ3QgZGlzYXBwZWFyIHdoZW4gaXQncyBjbG9zZWRcclxuICAgIHZhciBhdExlYXN0T25lU2hvd2luZ1doZW5DbG9zZWQgPSBmYWxzZTtcclxuICAgIC8vIHdhbnQgdG8gbWFrZSBzdXJlIHRoZSBncm91cCBoYXMgc29tZXRoaW5nIHRvIHNob3cgLyBoaWRlXHJcbiAgICB2YXIgYXRMZWFzdE9uZUNoYW5nZWFibGUgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBqID0gdGhpcy5hbGxDb2x1bW5zLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICAgIHZhciBjb2x1bW4gPSB0aGlzLmFsbENvbHVtbnNbaV07XHJcbiAgICAgICAgaWYgKGNvbHVtbi5jb2xEZWYuaGVhZGVyR3JvdXBTaG93ID09PSAnb3BlbicpIHtcclxuICAgICAgICAgICAgYXRMZWFzdE9uZVNob3dpbmdXaGVuT3BlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVDaGFuZ2VhYmxlID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbHVtbi5jb2xEZWYuaGVhZGVyR3JvdXBTaG93ID09PSAnY2xvc2VkJykge1xyXG4gICAgICAgICAgICBhdExlYXN0T25lU2hvd2luZ1doZW5DbG9zZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBhdExlYXN0T25lQ2hhbmdlYWJsZSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYXRMZWFzdE9uZVNob3dpbmdXaGVuT3BlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVTaG93aW5nV2hlbkNsb3NlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZXhwYW5kYWJsZSA9IGF0TGVhc3RPbmVTaG93aW5nV2hlbk9wZW4gJiYgYXRMZWFzdE9uZVNob3dpbmdXaGVuQ2xvc2VkICYmIGF0TGVhc3RPbmVDaGFuZ2VhYmxlO1xyXG59O1xyXG5cclxuaGVhZGVyR3JvdXAucHJvdG90eXBlLmNhbGN1bGF0ZURpc3BsYXllZENvbHVtbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGNsZWFyIG91dCBsYXN0IHRpbWUgd2UgY2FsY3VsYXRlZFxyXG4gICAgdGhpcy5kaXNwbGF5ZWRDb2x1bW5zID0gW107XHJcbiAgICAvLyBpdCBub3QgZXhwYW5kYWJsZSwgZXZlcnl0aGluZyBpcyB2aXNpYmxlXHJcbiAgICBpZiAoIXRoaXMuZXhwYW5kYWJsZSkge1xyXG4gICAgICAgIHRoaXMuZGlzcGxheWVkQ29sdW1ucyA9IHRoaXMuYWxsQ29sdW1ucztcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAvLyBhbmQgY2FsY3VsYXRlIGFnYWluXHJcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IHRoaXMuYWxsQ29sdW1ucy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgICB2YXIgY29sdW1uID0gdGhpcy5hbGxDb2x1bW5zW2ldO1xyXG4gICAgICAgIHN3aXRjaCAoY29sdW1uLmNvbERlZi5oZWFkZXJHcm91cFNob3cpIHtcclxuICAgICAgICAgICAgY2FzZSAnb3Blbic6XHJcbiAgICAgICAgICAgICAgICAvLyB3aGVuIHNldCB0byBvcGVuLCBvbmx5IHNob3cgY29sIGlmIGdyb3VwIGlzIG9wZW5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmV4cGFuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5ZWRDb2x1bW5zLnB1c2goY29sdW1uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdjbG9zZWQnOlxyXG4gICAgICAgICAgICAgICAgLy8gd2hlbiBzZXQgdG8gb3Blbiwgb25seSBzaG93IGNvbCBpZiBncm91cCBpcyBvcGVuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZXhwYW5kZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXllZENvbHVtbnMucHVzaChjb2x1bW4pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvLyBkZWZhdWx0IGlzIGFsd2F5cyBzaG93IHRoZSBjb2x1bW5cclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheWVkQ29sdW1ucy5wdXNoKGNvbHVtbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBzaG91bGQgcmVwbGFjZSB3aXRoIHV0aWxzIG1ldGhvZCAnYWRkIGFsbCdcclxuaGVhZGVyR3JvdXAucHJvdG90eXBlLmFkZFRvVmlzaWJsZUNvbHVtbnMgPSBmdW5jdGlvbihjb2xzVG9BZGQpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kaXNwbGF5ZWRDb2x1bW5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNvbHVtbiA9IHRoaXMuZGlzcGxheWVkQ29sdW1uc1tpXTtcclxuICAgICAgICBjb2xzVG9BZGQucHVzaChjb2x1bW4pO1xyXG4gICAgfVxyXG59O1xyXG5cclxudmFyIGNvbElkU2VxdWVuY2UgPSAwO1xyXG5cclxuZnVuY3Rpb24gQ29sdW1uKGNvbERlZiwgYWN0dWFsV2lkdGgsIGhpZGUpIHtcclxuICAgIHRoaXMuY29sRGVmID0gY29sRGVmO1xyXG4gICAgdGhpcy5hY3R1YWxXaWR0aCA9IGFjdHVhbFdpZHRoO1xyXG4gICAgdGhpcy52aXNpYmxlID0gIWNvbERlZi5oaWRlO1xyXG4gICAgLy8gaW4gdGhlIGZ1dHVyZSwgdGhlIGNvbEtleSBtaWdodCBiZSBzb21ldGhpbmcgb3RoZXIgdGhhbiB0aGUgaW5kZXhcclxuICAgIGlmIChjb2xEZWYuY29sSWQpIHtcclxuICAgICAgICB0aGlzLmNvbElkID0gY29sRGVmLmNvbElkO1xyXG4gICAgfWVsc2UgaWYgKGNvbERlZi5maWVsZCkge1xyXG4gICAgICAgIHRoaXMuY29sSWQgPSBjb2xEZWYuZmllbGQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuY29sSWQgPSAnJyArIGNvbElkU2VxdWVuY2UrKztcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb2x1bW5Db250cm9sbGVyO1xyXG4iLCJ2YXIgY29uc3RhbnRzID0ge1xyXG4gICAgU1RFUF9FVkVSWVRISU5HOiAwLFxyXG4gICAgU1RFUF9GSUxURVI6IDEsXHJcbiAgICBTVEVQX1NPUlQ6IDIsXHJcbiAgICBTVEVQX01BUDogMyxcclxuICAgIEFTQzogXCJhc2NcIixcclxuICAgIERFU0M6IFwiZGVzY1wiLFxyXG4gICAgUk9XX0JVRkZFUl9TSVpFOiAyMCxcclxuICAgIFNPUlRfU1RZTEVfU0hPVzogXCJkaXNwbGF5OmlubGluZTtcIixcclxuICAgIFNPUlRfU1RZTEVfSElERTogXCJkaXNwbGF5Om5vbmU7XCIsXHJcbiAgICBNSU5fQ09MX1dJRFRIOiAxMCxcclxuXHJcbiAgICBLRVlfVEFCOiA5LFxyXG4gICAgS0VZX0VOVEVSOiAxMyxcclxuICAgIEtFWV9TUEFDRTogMzIsXHJcbiAgICBLRVlfRE9XTjogNDAsXHJcbiAgICBLRVlfVVA6IDM4LFxyXG4gICAgS0VZX0xFRlQ6IDM3LFxyXG4gICAgS0VZX1JJR0hUOiAzOVxyXG59O1xyXG5cclxuLy8gdGFrZW4gZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzk4NDc1ODAvaG93LXRvLWRldGVjdC1zYWZhcmktY2hyb21lLWllLWZpcmVmb3gtYW5kLW9wZXJhLWJyb3dzZXJcclxudmFyIGlzT3BlcmEgPSAhIXdpbmRvdy5vcGVyYSB8fCBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJyBPUFIvJykgPj0gMDtcclxuLy8gT3BlcmEgOC4wKyAoVUEgZGV0ZWN0aW9uIHRvIGRldGVjdCBCbGluay92OC1wb3dlcmVkIE9wZXJhKVxyXG52YXIgaXNGaXJlZm94ID0gdHlwZW9mIEluc3RhbGxUcmlnZ2VyICE9PSAndW5kZWZpbmVkJzsgICAvLyBGaXJlZm94IDEuMCtcclxudmFyIGlzU2FmYXJpID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHdpbmRvdy5IVE1MRWxlbWVudCkuaW5kZXhPZignQ29uc3RydWN0b3InKSA+IDA7XHJcbi8vIEF0IGxlYXN0IFNhZmFyaSAzKzogXCJbb2JqZWN0IEhUTUxFbGVtZW50Q29uc3RydWN0b3JdXCJcclxudmFyIGlzQ2hyb21lID0gISF3aW5kb3cuY2hyb21lICYmICF0aGlzLmlzT3BlcmE7IC8vIENocm9tZSAxK1xyXG52YXIgaXNJRSA9IC8qQGNjX29uIUAqL2ZhbHNlIHx8ICEhZG9jdW1lbnQuZG9jdW1lbnRNb2RlOyAvLyBBdCBsZWFzdCBJRTZcclxuXHJcbmlmIChpc09wZXJhKSB7XHJcbiAgICBjb25zdGFudHMuQlJPV1NFUiA9ICdvcGVyYSc7XHJcbn0gZWxzZSBpZiAoaXNGaXJlZm94KSB7XHJcbiAgICBjb25zdGFudHMuQlJPV1NFUiA9ICdmaXJlZm94JztcclxufSBlbHNlIGlmIChpc1NhZmFyaSkge1xyXG4gICAgY29uc3RhbnRzLkJST1dTRVIgPSAnc2FmYXJpJztcclxufSBlbHNlIGlmIChpc0Nocm9tZSkge1xyXG4gICAgY29uc3RhbnRzLkJST1dTRVIgPSAnY2hyb21lJztcclxufSBlbHNlIGlmIChpc0lFKSB7XHJcbiAgICBjb25zdGFudHMuQlJPV1NFUiA9ICdpZSc7XHJcbn1cclxuXHJcbnZhciBpc01hYyA9IG5hdmlnYXRvci5wbGF0Zm9ybS50b1VwcGVyQ2FzZSgpLmluZGV4T2YoJ01BQycpPj0wO1xyXG52YXIgaXNXaW5kb3dzID0gbmF2aWdhdG9yLnBsYXRmb3JtLnRvVXBwZXJDYXNlKCkuaW5kZXhPZignV0lOJyk+PTA7XHJcbmlmIChpc01hYykge1xyXG4gICAgY29uc3RhbnRzLlBMQVRGT1JNID0gJ21hYyc7XHJcbn0gZWxzZSBpZiAoaXNXaW5kb3dzKSB7XHJcbiAgICBjb25zdGFudHMuUExBVEZPUk0gPSAnd2luJztcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjb25zdGFudHM7XHJcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcblxyXG5mdW5jdGlvbiBEcmFnQW5kRHJvcFNlcnZpY2UoKSB7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5zdG9wRHJhZ2dpbmcuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbkRyYWdBbmREcm9wU2VydmljZS5wcm90b3R5cGUuc3RvcERyYWdnaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5kcmFnSXRlbSkge1xyXG4gICAgICAgIHRoaXMuc2V0RHJhZ0Nzc0NsYXNzZXModGhpcy5kcmFnSXRlbS5lRHJhZ1NvdXJjZSwgZmFsc2UpO1xyXG4gICAgICAgIHRoaXMuZHJhZ0l0ZW0gPSBudWxsO1xyXG4gICAgfVxyXG59O1xyXG5cclxuRHJhZ0FuZERyb3BTZXJ2aWNlLnByb3RvdHlwZS5zZXREcmFnQ3NzQ2xhc3NlcyA9IGZ1bmN0aW9uKGVMaXN0SXRlbSwgZHJhZ2dpbmcpIHtcclxuICAgIHV0aWxzLmFkZE9yUmVtb3ZlQ3NzQ2xhc3MoZUxpc3RJdGVtLCAnYWctZHJhZ2dpbmcnLCBkcmFnZ2luZyk7XHJcbiAgICB1dGlscy5hZGRPclJlbW92ZUNzc0NsYXNzKGVMaXN0SXRlbSwgJ2FnLW5vdC1kcmFnZ2luZycsICFkcmFnZ2luZyk7XHJcbn07XHJcblxyXG5EcmFnQW5kRHJvcFNlcnZpY2UucHJvdG90eXBlLmFkZERyYWdTb3VyY2UgPSBmdW5jdGlvbihlRHJhZ1NvdXJjZSwgZHJhZ1NvdXJjZUNhbGxiYWNrLCBjb250YWluZXJJZCkge1xyXG5cclxuICAgIHRoaXMuc2V0RHJhZ0Nzc0NsYXNzZXMoZURyYWdTb3VyY2UsIGZhbHNlKTtcclxuXHJcbiAgICB2YXIgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgZURyYWdTb3VyY2UuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbW91c2VEb3duID0gdHJ1ZTtcclxuICAgIH0pO1xyXG5cclxuICAgIGVEcmFnU291cmNlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBtb3VzZURvd24gPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIGVEcmFnU291cmNlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICBlRHJhZ1NvdXJjZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAobW91c2VEb3duKSB7XHJcbiAgICAgICAgICAgIHZhciBhbHJlYWR5RHJhZ2dpbmdUaGlzSXRlbSA9IHRoaXMuZHJhZ0l0ZW0gJiYgdGhpcy5kcmFnSXRlbS5lRHJvcFNvdXJjZSA9PT0gZURyYWdTb3VyY2U7XHJcbiAgICAgICAgICAgIGlmICghYWxyZWFkeURyYWdnaW5nVGhpc0l0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuc3RhcnREcmFnZ2luZyhlRHJhZ1NvdXJjZSwgZHJhZ1NvdXJjZUNhbGxiYWNrLCBjb250YWluZXJJZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkRyYWdBbmREcm9wU2VydmljZS5wcm90b3R5cGUuc3RhcnREcmFnZ2luZyA9IGZ1bmN0aW9uKGVEcmFnU291cmNlLCBkcmFnU291cmNlQ2FsbGJhY2spIHtcclxuICAgIGlmICh0aGlzLmRyYWdJdGVtICYmIHRoaXMuZHJhZ0l0ZW0uZURyYWdTb3VyY2UgPT09IGVEcmFnU291cmNlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuZHJhZ0l0ZW0pIHtcclxuICAgICAgICB0aGlzLnN0b3BEcmFnZ2luZygpO1xyXG4gICAgfVxyXG4gICAgdmFyIGRhdGE7XHJcbiAgICBpZiAoZHJhZ1NvdXJjZUNhbGxiYWNrLmdldERhdGEpIHtcclxuICAgICAgICBkYXRhID0gZHJhZ1NvdXJjZUNhbGxiYWNrLmdldERhdGEoKTtcclxuICAgIH1cclxuICAgIHZhciBjb250YWluZXJJZDtcclxuICAgIGlmIChkcmFnU291cmNlQ2FsbGJhY2suZ2V0Q29udGFpbmVySWQpIHtcclxuICAgICAgICBjb250YWluZXJJZCA9IGRyYWdTb3VyY2VDYWxsYmFjay5nZXRDb250YWluZXJJZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZHJhZ0l0ZW0gPSB7XHJcbiAgICAgICAgZURyYWdTb3VyY2U6IGVEcmFnU291cmNlLFxyXG4gICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgY29udGFpbmVySWQ6IGNvbnRhaW5lcklkXHJcbiAgICB9O1xyXG4gICAgdGhpcy5zZXREcmFnQ3NzQ2xhc3Nlcyh0aGlzLmRyYWdJdGVtLmVEcmFnU291cmNlLCB0cnVlKTtcclxufTtcclxuXHJcbkRyYWdBbmREcm9wU2VydmljZS5wcm90b3R5cGUuYWRkRHJvcFRhcmdldCA9IGZ1bmN0aW9uKGVEcm9wVGFyZ2V0LCBkcm9wVGFyZ2V0Q2FsbGJhY2spIHtcclxuICAgIHZhciBtb3VzZUluID0gZmFsc2U7XHJcbiAgICB2YXIgYWNjZXB0RHJhZyA9IGZhbHNlO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIGVEcm9wVGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICghbW91c2VJbikge1xyXG4gICAgICAgICAgICBtb3VzZUluID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYgKHRoYXQuZHJhZ0l0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGFjY2VwdERyYWcgPSBkcm9wVGFyZ2V0Q2FsbGJhY2suYWNjZXB0RHJhZyh0aGF0LmRyYWdJdGVtKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGFjY2VwdERyYWcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGVEcm9wVGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGFjY2VwdERyYWcpIHtcclxuICAgICAgICAgICAgZHJvcFRhcmdldENhbGxiYWNrLm5vRHJvcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtb3VzZUluID0gZmFsc2U7XHJcbiAgICAgICAgYWNjZXB0RHJhZyA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZURyb3BUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIGRyYWdJdGVtIHNob3VsZCBuZXZlciBiZSBudWxsLCBjaGVja2luZyBqdXN0IGluIGNhc2VcclxuICAgICAgICBpZiAoYWNjZXB0RHJhZyAmJiB0aGF0LmRyYWdJdGVtKSB7XHJcbiAgICAgICAgICAgIGRyb3BUYXJnZXRDYWxsYmFjay5kcm9wKHRoYXQuZHJhZ0l0ZW0pO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IERyYWdBbmREcm9wU2VydmljZSgpOyIsImZ1bmN0aW9uIEV4cHJlc3Npb25TZXJ2aWNlKCkge31cclxuXHJcbkV4cHJlc3Npb25TZXJ2aWNlLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uKHJ1bGUsIHBhcmFtcykge1xyXG59O1xyXG5cclxuZnVuY3Rpb24gRXhwcmVzc2lvblNlcnZpY2UoKSB7XHJcbiAgICB0aGlzLmV4cHJlc3Npb25Ub0Z1bmN0aW9uQ2FjaGUgPSB7fTtcclxufVxyXG5cclxuRXhwcmVzc2lvblNlcnZpY2UucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKGV4cHJlc3Npb24sIHBhcmFtcykge1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgdmFyIGphdmFTY3JpcHRGdW5jdGlvbiA9IHRoaXMuY3JlYXRlRXhwcmVzc2lvbkZ1bmN0aW9uKGV4cHJlc3Npb24pO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBqYXZhU2NyaXB0RnVuY3Rpb24ocGFyYW1zLnZhbHVlLCBwYXJhbXMuY29udGV4dCwgcGFyYW1zLm5vZGUsXHJcbiAgICAgICAgICAgIHBhcmFtcy5kYXRhLCBwYXJhbXMuY29sRGVmLCBwYXJhbXMucm93SW5kZXgsIHBhcmFtcy5hcGkpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgLy8gdGhlIGV4cHJlc3Npb24gZmFpbGVkLCB3aGljaCBjYW4gaGFwcGVuLCBhcyBpdCdzIHRoZSBjbGllbnQgdGhhdFxyXG4gICAgICAgIC8vIHByb3ZpZGVzIHRoZSBleHByZXNzaW9uLiBzbyBwcmludCBhIG5pY2UgbWVzc2FnZVxyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Byb2Nlc3Npbmcgb2YgdGhlIGV4cHJlc3Npb24gZmFpbGVkJyk7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRXhwcmVzc2lvbiA9ICcgKyBleHByZXNzaW9uKTtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdFeGNlcHRpb24gPSAnICsgZSk7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn07XHJcblxyXG5FeHByZXNzaW9uU2VydmljZS5wcm90b3R5cGUuY3JlYXRlRXhwcmVzc2lvbkZ1bmN0aW9uID0gZnVuY3Rpb24gKGV4cHJlc3Npb24pIHtcclxuICAgIC8vIGNoZWNrIGNhY2hlIGZpcnN0XHJcbiAgICBpZiAodGhpcy5leHByZXNzaW9uVG9GdW5jdGlvbkNhY2hlW2V4cHJlc3Npb25dKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXhwcmVzc2lvblRvRnVuY3Rpb25DYWNoZVtleHByZXNzaW9uXTtcclxuICAgIH1cclxuICAgIC8vIGlmIG5vdCBmb3VuZCBpbiBjYWNoZSwgcmV0dXJuIHRoZSBmdW5jdGlvblxyXG4gICAgdmFyIGZ1bmN0aW9uQm9keSA9IHRoaXMuY3JlYXRlRnVuY3Rpb25Cb2R5KGV4cHJlc3Npb24pO1xyXG4gICAgdmFyIHRoZUZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKCd4LCBjdHgsIG5vZGUsIGRhdGEsIGNvbERlZiwgcm93SW5kZXgsIGFwaScsIGZ1bmN0aW9uQm9keSk7XHJcblxyXG4gICAgLy8gc3RvcmUgaW4gY2FjaGVcclxuICAgIHRoaXMuZXhwcmVzc2lvblRvRnVuY3Rpb25DYWNoZVtleHByZXNzaW9uXSA9IHRoZUZ1bmN0aW9uO1xyXG5cclxuICAgIHJldHVybiB0aGVGdW5jdGlvbjtcclxufTtcclxuXHJcbkV4cHJlc3Npb25TZXJ2aWNlLnByb3RvdHlwZS5jcmVhdGVGdW5jdGlvbkJvZHkgPSBmdW5jdGlvbiAoZXhwcmVzc2lvbikge1xyXG4gICAgLy8gaWYgdGhlIGV4cHJlc3Npb24gaGFzIHRoZSAncmV0dXJuJyB3b3JkIGluIGl0LCB0aGVuIHVzZSBhcyBpcyxcclxuICAgIC8vIGlmIG5vdCwgdGhlbiB3cmFwIGl0IHdpdGggcmV0dXJuIGFuZCAnOycgdG8gbWFrZSBhIGZ1bmN0aW9uXHJcbiAgICBpZiAoZXhwcmVzc2lvbi5pbmRleE9mKCdyZXR1cm4nKSA+PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGV4cHJlc3Npb247XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAncmV0dXJuICcgKyBleHByZXNzaW9uICsgJzsnO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFeHByZXNzaW9uU2VydmljZTtcclxuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xyXG52YXIgU2V0RmlsdGVyID0gcmVxdWlyZSgnLi9zZXRGaWx0ZXInKTtcclxudmFyIE51bWJlckZpbHRlciA9IHJlcXVpcmUoJy4vbnVtYmVyRmlsdGVyJyk7XHJcbnZhciBTdHJpbmdGaWx0ZXIgPSByZXF1aXJlKCcuL3RleHRGaWx0ZXInKTtcclxuXHJcbmZ1bmN0aW9uIEZpbHRlck1hbmFnZXIoKSB7fVxyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGdyaWQsIGdyaWRPcHRpb25zV3JhcHBlciwgJGNvbXBpbGUsICRzY29wZSwgZXhwcmVzc2lvblNlcnZpY2UsIGNvbHVtbk1vZGVsKSB7XHJcbiAgICB0aGlzLiRjb21waWxlID0gJGNvbXBpbGU7XHJcbiAgICB0aGlzLiRzY29wZSA9ICRzY29wZTtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyID0gZ3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4gICAgdGhpcy5ncmlkID0gZ3JpZDtcclxuICAgIHRoaXMuYWxsRmlsdGVycyA9IHt9O1xyXG4gICAgdGhpcy5leHByZXNzaW9uU2VydmljZSA9IGV4cHJlc3Npb25TZXJ2aWNlO1xyXG4gICAgdGhpcy5jb2x1bW5Nb2RlbCA9IGNvbHVtbk1vZGVsO1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuc2V0RmlsdGVyTW9kZWwgPSBmdW5jdGlvbihtb2RlbCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgaWYgKG1vZGVsKSB7XHJcbiAgICAgICAgLy8gbWFyayB0aGUgZmlsdGVycyBhcyB3ZSBzZXQgdGhlbSwgc28gYW55IGFjdGl2ZSBmaWx0ZXJzIGxlZnQgb3ZlciB3ZSBzdG9wXHJcbiAgICAgICAgdmFyIHByb2Nlc3NlZEZpZWxkcyA9IE9iamVjdC5rZXlzKG1vZGVsKTtcclxuICAgICAgICB1dGlscy5pdGVyYXRlT2JqZWN0KHRoaXMuYWxsRmlsdGVycywgZnVuY3Rpb24oa2V5LCBmaWx0ZXJXcmFwcGVyKSB7XHJcbiAgICAgICAgICAgIHZhciBmaWVsZCA9IGZpbHRlcldyYXBwZXIuY29sdW1uLmNvbERlZi5maWVsZDtcclxuICAgICAgICAgICAgdXRpbHMucmVtb3ZlRnJvbUFycmF5KHByb2Nlc3NlZEZpZWxkcywgZmllbGQpO1xyXG4gICAgICAgICAgICBpZiAoZmllbGQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdNb2RlbCA9IG1vZGVsW2ZpZWxkXTtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2V0TW9kZWxPbkZpbHRlcldyYXBwZXIoZmlsdGVyV3JhcHBlci5maWx0ZXIsIG5ld01vZGVsKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignV2FybmluZyBhZy1ncmlkIC0gbm8gZmllbGQgZm91bmQgZm9yIGNvbHVtbiB3aGlsZSBkb2luZyBzZXRGaWx0ZXJNb2RlbCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gYXQgdGhpcyBwb2ludCwgcHJvY2Vzc2VkRmllbGRzIGNvbnRhaW5zIGRhdGEgZm9yIHdoaWNoIHdlIGRvbid0IGhhdmUgYSBmaWx0ZXIgd29ya2luZyB5ZXRcclxuICAgICAgICB1dGlscy5pdGVyYXRlQXJyYXkocHJvY2Vzc2VkRmllbGRzLCBmdW5jdGlvbihmaWVsZCkge1xyXG4gICAgICAgICAgICB2YXIgY29sdW1uID0gdGhhdC5jb2x1bW5Nb2RlbC5nZXRDb2x1bW4oZmllbGQpO1xyXG4gICAgICAgICAgICBpZiAoIWNvbHVtbikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdXYXJuaW5nIGFnLWdyaWQgLSBubyBjb2x1bW4gZm91bmQgZm9yIGZpZWxkICcgKyBmaWVsZCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGZpbHRlcldyYXBwZXIgPSB0aGF0LmdldE9yQ3JlYXRlRmlsdGVyV3JhcHBlcihjb2x1bW4pO1xyXG4gICAgICAgICAgICB0aGF0LnNldE1vZGVsT25GaWx0ZXJXcmFwcGVyKGZpbHRlcldyYXBwZXIuZmlsdGVyLCBtb2RlbFtmaWVsZF0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB1dGlscy5pdGVyYXRlT2JqZWN0KHRoaXMuYWxsRmlsdGVycywgZnVuY3Rpb24oa2V5LCBmaWx0ZXJXcmFwcGVyKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0TW9kZWxPbkZpbHRlcldyYXBwZXIoZmlsdGVyV3JhcHBlci5maWx0ZXIsIG51bGwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuc2V0TW9kZWxPbkZpbHRlcldyYXBwZXIgPSBmdW5jdGlvbihmaWx0ZXIsIG5ld01vZGVsKSB7XHJcbiAgICAvLyBiZWNhdXNlIHVzZXIgY2FuIHByb3ZpZGUgZmlsdGVycywgd2UgcHJvdmlkZSB1c2VmdWwgZXJyb3IgY2hlY2tpbmcgYW5kIG1lc3NhZ2VzXHJcbiAgICBpZiAodHlwZW9mIGZpbHRlci5nZXRBcGkgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ1dhcm5pbmcgYWctZ3JpZCAtIGZpbHRlciBtaXNzaW5nIGdldEFwaSBtZXRob2QsIHdoaWNoIGlzIG5lZWRlZCBmb3IgZ2V0RmlsdGVyTW9kZWwnKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB2YXIgZmlsdGVyQXBpID0gZmlsdGVyLmdldEFwaSgpO1xyXG4gICAgaWYgKHR5cGVvZiBmaWx0ZXJBcGkuc2V0TW9kZWwgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ1dhcm5pbmcgYWctZ3JpZCAtIGZpbHRlciBBUEkgbWlzc2luZyBzZXRNb2RlbCBtZXRob2QsIHdoaWNoIGlzIG5lZWRlZCBmb3Igc2V0RmlsdGVyTW9kZWwnKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmaWx0ZXJBcGkuc2V0TW9kZWwobmV3TW9kZWwpO1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuZ2V0RmlsdGVyTW9kZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIHV0aWxzLml0ZXJhdGVPYmplY3QodGhpcy5hbGxGaWx0ZXJzLCBmdW5jdGlvbihrZXksIGZpbHRlcldyYXBwZXIpIHtcclxuICAgICAgICAvLyBiZWNhdXNlIHVzZXIgY2FuIHByb3ZpZGUgZmlsdGVycywgd2UgcHJvdmlkZSB1c2VmdWwgZXJyb3IgY2hlY2tpbmcgYW5kIG1lc3NhZ2VzXHJcbiAgICAgICAgaWYgKHR5cGVvZiBmaWx0ZXJXcmFwcGVyLmZpbHRlci5nZXRBcGkgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdXYXJuaW5nIGFnLWdyaWQgLSBmaWx0ZXIgbWlzc2luZyBnZXRBcGkgbWV0aG9kLCB3aGljaCBpcyBuZWVkZWQgZm9yIGdldEZpbHRlck1vZGVsJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGZpbHRlckFwaSA9IGZpbHRlcldyYXBwZXIuZmlsdGVyLmdldEFwaSgpO1xyXG4gICAgICAgIGlmICh0eXBlb2YgZmlsdGVyQXBpLmdldE1vZGVsICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignV2FybmluZyBhZy1ncmlkIC0gZmlsdGVyIEFQSSBtaXNzaW5nIGdldE1vZGVsIG1ldGhvZCwgd2hpY2ggaXMgbmVlZGVkIGZvciBnZXRGaWx0ZXJNb2RlbCcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBtb2RlbCA9IGZpbHRlckFwaS5nZXRNb2RlbCgpO1xyXG4gICAgICAgIGlmIChtb2RlbCkge1xyXG4gICAgICAgICAgICB2YXIgZmllbGQgPSBmaWx0ZXJXcmFwcGVyLmNvbHVtbi5jb2xEZWYuZmllbGQ7XHJcbiAgICAgICAgICAgIGlmICghZmllbGQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignV2FybmluZyBhZy1ncmlkIC0gY2Fubm90IGdldCBmaWx0ZXIgbW9kZWwgd2hlbiBubyBmaWVsZCB2YWx1ZSBwcmVzZW50IGZvciBjb2x1bW4nKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtmaWVsZF0gPSBtb2RlbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLnNldFJvd01vZGVsID0gZnVuY3Rpb24ocm93TW9kZWwpIHtcclxuICAgIHRoaXMucm93TW9kZWwgPSByb3dNb2RlbDtcclxufTtcclxuXHJcbi8vIHJldHVybnMgdHJ1ZSBpZiBhdCBsZWFzdCBvbmUgZmlsdGVyIGlzIGFjdGl2ZVxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5pc0ZpbHRlclByZXNlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBhdExlYXN0T25lQWN0aXZlID0gZmFsc2U7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmFsbEZpbHRlcnMpO1xyXG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIHZhciBmaWx0ZXJXcmFwcGVyID0gdGhhdC5hbGxGaWx0ZXJzW2tleV07XHJcbiAgICAgICAgaWYgKCFmaWx0ZXJXcmFwcGVyLmZpbHRlci5pc0ZpbHRlckFjdGl2ZSkgeyAvLyBiZWNhdXNlIHVzZXJzIGNhbiBkbyBjdXN0b20gZmlsdGVycywgZ2l2ZSBuaWNlIGVycm9yIG1lc3NhZ2VcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmlsdGVyIGlzIG1pc3NpbmcgbWV0aG9kIGlzRmlsdGVyQWN0aXZlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmaWx0ZXJXcmFwcGVyLmZpbHRlci5pc0ZpbHRlckFjdGl2ZSgpKSB7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVBY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGF0TGVhc3RPbmVBY3RpdmU7XHJcbn07XHJcblxyXG4vLyByZXR1cm5zIHRydWUgaWYgZ2l2ZW4gY29sIGhhcyBhIGZpbHRlciBhY3RpdmVcclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuaXNGaWx0ZXJQcmVzZW50Rm9yQ29sID0gZnVuY3Rpb24oY29sSWQpIHtcclxuICAgIHZhciBmaWx0ZXJXcmFwcGVyID0gdGhpcy5hbGxGaWx0ZXJzW2NvbElkXTtcclxuICAgIGlmICghZmlsdGVyV3JhcHBlcikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmICghZmlsdGVyV3JhcHBlci5maWx0ZXIuaXNGaWx0ZXJBY3RpdmUpIHsgLy8gYmVjYXVzZSB1c2VycyBjYW4gZG8gY3VzdG9tIGZpbHRlcnMsIGdpdmUgbmljZSBlcnJvciBtZXNzYWdlXHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRmlsdGVyIGlzIG1pc3NpbmcgbWV0aG9kIGlzRmlsdGVyQWN0aXZlJyk7XHJcbiAgICB9XHJcbiAgICB2YXIgZmlsdGVyUHJlc2VudCA9IGZpbHRlcldyYXBwZXIuZmlsdGVyLmlzRmlsdGVyQWN0aXZlKCk7XHJcbiAgICByZXR1cm4gZmlsdGVyUHJlc2VudDtcclxufTtcclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLmRvZXNGaWx0ZXJQYXNzID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIGRhdGEgPSBub2RlLmRhdGE7XHJcbiAgICB2YXIgY29sS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuYWxsRmlsdGVycyk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNvbEtleXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IC8vIGNyaXRpY2FsIGNvZGUsIGRvbid0IHVzZSBmdW5jdGlvbmFsIHByb2dyYW1taW5nXHJcblxyXG4gICAgICAgIHZhciBjb2xJZCA9IGNvbEtleXNbaV07XHJcbiAgICAgICAgdmFyIGZpbHRlcldyYXBwZXIgPSB0aGlzLmFsbEZpbHRlcnNbY29sSWRdO1xyXG5cclxuICAgICAgICAvLyBpZiBubyBmaWx0ZXIsIGFsd2F5cyBwYXNzXHJcbiAgICAgICAgaWYgKGZpbHRlcldyYXBwZXIgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZmlsdGVyV3JhcHBlci5maWx0ZXIuZG9lc0ZpbHRlclBhc3MpIHsgLy8gYmVjYXVzZSB1c2VycyBjYW4gZG8gY3VzdG9tIGZpbHRlcnMsIGdpdmUgbmljZSBlcnJvciBtZXNzYWdlXHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZpbHRlciBpcyBtaXNzaW5nIG1ldGhvZCBkb2VzRmlsdGVyUGFzcycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoIWZpbHRlcldyYXBwZXIuZmlsdGVyLmRvZXNGaWx0ZXJQYXNzKHBhcmFtcykpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIGFsbCBmaWx0ZXJzIHBhc3NlZFxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5vbk5ld1Jvd3NMb2FkZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIE9iamVjdC5rZXlzKHRoaXMuYWxsRmlsdGVycykuZm9yRWFjaChmdW5jdGlvbihmaWVsZCkge1xyXG4gICAgICAgIHZhciBmaWx0ZXIgPSB0aGF0LmFsbEZpbHRlcnNbZmllbGRdLmZpbHRlcjtcclxuICAgICAgICBpZiAoZmlsdGVyLm9uTmV3Um93c0xvYWRlZCkge1xyXG4gICAgICAgICAgICBmaWx0ZXIub25OZXdSb3dzTG9hZGVkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5wb3NpdGlvblBvcHVwID0gZnVuY3Rpb24oZXZlbnRTb3VyY2UsIGVQb3B1cCwgZVBvcHVwUm9vdCkge1xyXG4gICAgdmFyIHNvdXJjZVJlY3QgPSBldmVudFNvdXJjZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgIHZhciBwYXJlbnRSZWN0ID0gZVBvcHVwUm9vdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICB2YXIgeCA9IHNvdXJjZVJlY3QubGVmdCAtIHBhcmVudFJlY3QubGVmdDtcclxuICAgIHZhciB5ID0gc291cmNlUmVjdC50b3AgLSBwYXJlbnRSZWN0LnRvcCArIHNvdXJjZVJlY3QuaGVpZ2h0O1xyXG5cclxuICAgIC8vIGlmIHBvcHVwIGlzIG92ZXJmbG93aW5nIHRvIHRoZSByaWdodCwgbW92ZSBpdCBsZWZ0XHJcbiAgICB2YXIgd2lkdGhPZlBvcHVwID0gMjAwOyAvLyB0aGlzIGlzIHNldCBpbiB0aGUgY3NzXHJcbiAgICB2YXIgd2lkdGhPZlBhcmVudCA9IHBhcmVudFJlY3QucmlnaHQgLSBwYXJlbnRSZWN0LmxlZnQ7XHJcbiAgICB2YXIgbWF4WCA9IHdpZHRoT2ZQYXJlbnQgLSB3aWR0aE9mUG9wdXAgLSAyMDsgLy8gMjAgcGl4ZWxzIGdyYWNlXHJcbiAgICBpZiAoeCA+IG1heFgpIHsgLy8gbW92ZSBwb3NpdGlvbiBsZWZ0LCBiYWNrIGludG8gdmlld1xyXG4gICAgICAgIHggPSBtYXhYO1xyXG4gICAgfVxyXG4gICAgaWYgKHggPCAwKSB7IC8vIGluIGNhc2UgdGhlIHBvcHVwIGhhcyBhIG5lZ2F0aXZlIHZhbHVlXHJcbiAgICAgICAgeCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgZVBvcHVwLnN0eWxlLmxlZnQgPSB4ICsgXCJweFwiO1xyXG4gICAgZVBvcHVwLnN0eWxlLnRvcCA9IHkgKyBcInB4XCI7XHJcbn07XHJcblxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5jcmVhdGVWYWx1ZUdldHRlciA9IGZ1bmN0aW9uKGNvbERlZikge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIHZhbHVlR2V0dGVyKG5vZGUpIHtcclxuICAgICAgICB2YXIgYXBpID0gdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKCk7XHJcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCk7XHJcbiAgICAgICAgcmV0dXJuIHV0aWxzLmdldFZhbHVlKHRoYXQuZXhwcmVzc2lvblNlcnZpY2UsIG5vZGUuZGF0YSwgY29sRGVmLCBub2RlLCBhcGksIGNvbnRleHQpO1xyXG4gICAgfTtcclxufTtcclxuXHJcbkZpbHRlck1hbmFnZXIucHJvdG90eXBlLmdldEZpbHRlckFwaSA9IGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgdmFyIGZpbHRlcldyYXBwZXIgPSB0aGlzLmdldE9yQ3JlYXRlRmlsdGVyV3JhcHBlcihjb2x1bW4pO1xyXG4gICAgaWYgKGZpbHRlcldyYXBwZXIpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGZpbHRlcldyYXBwZXIuZmlsdGVyLmdldEFwaSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyV3JhcHBlci5maWx0ZXIuZ2V0QXBpKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuZ2V0T3JDcmVhdGVGaWx0ZXJXcmFwcGVyID0gZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICB2YXIgZmlsdGVyV3JhcHBlciA9IHRoaXMuYWxsRmlsdGVyc1tjb2x1bW4uY29sSWRdO1xyXG5cclxuICAgIGlmICghZmlsdGVyV3JhcHBlcikge1xyXG4gICAgICAgIGZpbHRlcldyYXBwZXIgPSB0aGlzLmNyZWF0ZUZpbHRlcldyYXBwZXIoY29sdW1uKTtcclxuICAgICAgICB0aGlzLmFsbEZpbHRlcnNbY29sdW1uLmNvbElkXSA9IGZpbHRlcldyYXBwZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZpbHRlcldyYXBwZXI7XHJcbn07XHJcblxyXG5GaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5jcmVhdGVGaWx0ZXJXcmFwcGVyID0gZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICB2YXIgY29sRGVmID0gY29sdW1uLmNvbERlZjtcclxuXHJcbiAgICB2YXIgZmlsdGVyV3JhcHBlciA9IHtcclxuICAgICAgICBjb2x1bW46IGNvbHVtblxyXG4gICAgfTtcclxuICAgIHZhciBmaWx0ZXJDaGFuZ2VkQ2FsbGJhY2sgPSB0aGlzLmdyaWQub25GaWx0ZXJDaGFuZ2VkLmJpbmQodGhpcy5ncmlkKTtcclxuICAgIHZhciBmaWx0ZXJQYXJhbXMgPSBjb2xEZWYuZmlsdGVyUGFyYW1zO1xyXG4gICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICByb3dNb2RlbDogdGhpcy5yb3dNb2RlbCxcclxuICAgICAgICBmaWx0ZXJDaGFuZ2VkQ2FsbGJhY2s6IGZpbHRlckNoYW5nZWRDYWxsYmFjayxcclxuICAgICAgICBmaWx0ZXJQYXJhbXM6IGZpbHRlclBhcmFtcyxcclxuICAgICAgICBsb2NhbGVUZXh0RnVuYzogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0TG9jYWxlVGV4dEZ1bmMoKSxcclxuICAgICAgICB2YWx1ZUdldHRlcjogdGhpcy5jcmVhdGVWYWx1ZUdldHRlcihjb2xEZWYpXHJcbiAgICB9O1xyXG4gICAgaWYgKHR5cGVvZiBjb2xEZWYuZmlsdGVyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgLy8gaWYgdXNlciBwcm92aWRlZCBhIGZpbHRlciwganVzdCB1c2UgaXRcclxuICAgICAgICAvLyBmaXJzdCB1cCwgY3JlYXRlIGNoaWxkIHNjb3BlIGlmIG5lZWRlZFxyXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0FuZ3VsYXJDb21waWxlRmlsdGVycygpKSB7XHJcbiAgICAgICAgICAgIHZhciBzY29wZSA9IHRoaXMuJHNjb3BlLiRuZXcoKTtcclxuICAgICAgICAgICAgZmlsdGVyV3JhcHBlci5zY29wZSA9IHNjb3BlO1xyXG4gICAgICAgICAgICBwYXJhbXMuJHNjb3BlID0gc2NvcGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG5vdyBjcmVhdGUgZmlsdGVyXHJcbiAgICAgICAgZmlsdGVyV3JhcHBlci5maWx0ZXIgPSBuZXcgY29sRGVmLmZpbHRlcihwYXJhbXMpO1xyXG4gICAgfSBlbHNlIGlmIChjb2xEZWYuZmlsdGVyID09PSAndGV4dCcpIHtcclxuICAgICAgICBmaWx0ZXJXcmFwcGVyLmZpbHRlciA9IG5ldyBTdHJpbmdGaWx0ZXIocGFyYW1zKTtcclxuICAgIH0gZWxzZSBpZiAoY29sRGVmLmZpbHRlciA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICBmaWx0ZXJXcmFwcGVyLmZpbHRlciA9IG5ldyBOdW1iZXJGaWx0ZXIocGFyYW1zKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZmlsdGVyV3JhcHBlci5maWx0ZXIgPSBuZXcgU2V0RmlsdGVyKHBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFmaWx0ZXJXcmFwcGVyLmZpbHRlci5nZXRHdWkpIHsgLy8gYmVjYXVzZSB1c2VycyBjYW4gZG8gY3VzdG9tIGZpbHRlcnMsIGdpdmUgbmljZSBlcnJvciBtZXNzYWdlXHJcbiAgICAgICAgdGhyb3cgJ0ZpbHRlciBpcyBtaXNzaW5nIG1ldGhvZCBnZXRHdWknO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBlRmlsdGVyR3VpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBlRmlsdGVyR3VpLmNsYXNzTmFtZSA9ICdhZy1maWx0ZXInO1xyXG4gICAgdmFyIGd1aUZyb21GaWx0ZXIgPSBmaWx0ZXJXcmFwcGVyLmZpbHRlci5nZXRHdWkoKTtcclxuICAgIGlmICh1dGlscy5pc05vZGVPckVsZW1lbnQoZ3VpRnJvbUZpbHRlcikpIHtcclxuICAgICAgICAvL2EgZG9tIG5vZGUgb3IgZWxlbWVudCB3YXMgcmV0dXJuZWQsIHNvIGFkZCBjaGlsZFxyXG4gICAgICAgIGVGaWx0ZXJHdWkuYXBwZW5kQ2hpbGQoZ3VpRnJvbUZpbHRlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vb3RoZXJ3aXNlIGFzc3VtZSBpdCB3YXMgaHRtbCwgc28ganVzdCBpbnNlcnRcclxuICAgICAgICB2YXIgZVRleHRTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgIGVUZXh0U3Bhbi5pbm5lckhUTUwgPSBndWlGcm9tRmlsdGVyO1xyXG4gICAgICAgIGVGaWx0ZXJHdWkuYXBwZW5kQ2hpbGQoZVRleHRTcGFuKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZmlsdGVyV3JhcHBlci5zY29wZSkge1xyXG4gICAgICAgIGZpbHRlcldyYXBwZXIuZ3VpID0gdGhpcy4kY29tcGlsZShlRmlsdGVyR3VpKShmaWx0ZXJXcmFwcGVyLnNjb3BlKVswXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZmlsdGVyV3JhcHBlci5ndWkgPSBlRmlsdGVyR3VpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmaWx0ZXJXcmFwcGVyO1xyXG59O1xyXG5cclxuRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuc2hvd0ZpbHRlciA9IGZ1bmN0aW9uKGNvbHVtbiwgZXZlbnRTb3VyY2UpIHtcclxuXHJcbiAgICB2YXIgZmlsdGVyV3JhcHBlciA9IHRoaXMuZ2V0T3JDcmVhdGVGaWx0ZXJXcmFwcGVyKGNvbHVtbik7XHJcblxyXG4gICAgdmFyIGVQb3B1cFBhcmVudCA9IHRoaXMuZ3JpZC5nZXRQb3B1cFBhcmVudCgpO1xyXG4gICAgdGhpcy5wb3NpdGlvblBvcHVwKGV2ZW50U291cmNlLCBmaWx0ZXJXcmFwcGVyLmd1aSwgZVBvcHVwUGFyZW50KTtcclxuXHJcbiAgICB1dGlscy5hZGRBc01vZGFsUG9wdXAoZVBvcHVwUGFyZW50LCBmaWx0ZXJXcmFwcGVyLmd1aSk7XHJcblxyXG4gICAgaWYgKGZpbHRlcldyYXBwZXIuZmlsdGVyLmFmdGVyR3VpQXR0YWNoZWQpIHtcclxuICAgICAgICBmaWx0ZXJXcmFwcGVyLmZpbHRlci5hZnRlckd1aUF0dGFjaGVkKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZpbHRlck1hbmFnZXI7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gXCI8ZGl2PjxkaXY+PHNlbGVjdCBjbGFzcz1hZy1maWx0ZXItc2VsZWN0IGlkPWZpbHRlclR5cGU+PG9wdGlvbiB2YWx1ZT0xPltFUVVBTFNdPC9vcHRpb24+PG9wdGlvbiB2YWx1ZT0yPltMRVNTIFRIQU5dPC9vcHRpb24+PG9wdGlvbiB2YWx1ZT0zPltHUkVBVEVSIFRIQU5dPC9vcHRpb24+PC9zZWxlY3Q+PC9kaXY+PGRpdj48aW5wdXQgY2xhc3M9YWctZmlsdGVyLWZpbHRlciBpZD1maWx0ZXJUZXh0IHR5cGU9dGV4dCBwbGFjZWhvbGRlcj1cXFwiW0ZJTFRFUi4uLl1cXFwiPjwvZGl2PjwvZGl2PlwiO1xuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL251bWJlckZpbHRlci5odG1sJyk7XHJcblxyXG52YXIgRVFVQUxTID0gMTtcclxudmFyIExFU1NfVEhBTiA9IDI7XHJcbnZhciBHUkVBVEVSX1RIQU4gPSAzO1xyXG5cclxuZnVuY3Rpb24gTnVtYmVyRmlsdGVyKHBhcmFtcykge1xyXG4gICAgdGhpcy5maWx0ZXJQYXJhbXMgPSBwYXJhbXMuZmlsdGVyUGFyYW1zO1xyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2sgPSBwYXJhbXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrO1xyXG4gICAgdGhpcy5sb2NhbGVUZXh0RnVuYyA9IHBhcmFtcy5sb2NhbGVUZXh0RnVuYztcclxuICAgIHRoaXMudmFsdWVHZXR0ZXIgPSBwYXJhbXMudmFsdWVHZXR0ZXI7XHJcbiAgICB0aGlzLmNyZWF0ZUd1aSgpO1xyXG4gICAgdGhpcy5maWx0ZXJOdW1iZXIgPSBudWxsO1xyXG4gICAgdGhpcy5maWx0ZXJUeXBlID0gRVFVQUxTO1xyXG4gICAgdGhpcy5jcmVhdGVBcGkoKTtcclxufVxyXG5cclxuLyogcHVibGljICovXHJcbk51bWJlckZpbHRlci5wcm90b3R5cGUub25OZXdSb3dzTG9hZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIga2VlcFNlbGVjdGlvbiA9IHRoaXMuZmlsdGVyUGFyYW1zICYmIHRoaXMuZmlsdGVyUGFyYW1zLm5ld1Jvd3NBY3Rpb24gPT09ICdrZWVwJztcclxuICAgIGlmICgha2VlcFNlbGVjdGlvbikge1xyXG4gICAgICAgIHRoaXMuYXBpLnNldFR5cGUoRVFVQUxTKTtcclxuICAgICAgICB0aGlzLmFwaS5zZXRGaWx0ZXIobnVsbCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5hZnRlckd1aUF0dGFjaGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVGaWx0ZXJUZXh0RmllbGQuZm9jdXMoKTtcclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5OdW1iZXJGaWx0ZXIucHJvdG90eXBlLmRvZXNGaWx0ZXJQYXNzID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKHRoaXMuZmlsdGVyTnVtYmVyID09PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICB2YXIgdmFsdWUgPSB0aGlzLnZhbHVlR2V0dGVyKG5vZGUpO1xyXG5cclxuICAgIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHZhbHVlQXNOdW1iZXI7XHJcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgIHZhbHVlQXNOdW1iZXIgPSB2YWx1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFsdWVBc051bWJlciA9IHBhcnNlRmxvYXQodmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHN3aXRjaCAodGhpcy5maWx0ZXJUeXBlKSB7XHJcbiAgICAgICAgY2FzZSBFUVVBTFM6XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZUFzTnVtYmVyID09PSB0aGlzLmZpbHRlck51bWJlcjtcclxuICAgICAgICBjYXNlIExFU1NfVEhBTjpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlQXNOdW1iZXIgPD0gdGhpcy5maWx0ZXJOdW1iZXI7XHJcbiAgICAgICAgY2FzZSBHUkVBVEVSX1RIQU46XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZUFzTnVtYmVyID49IHRoaXMuZmlsdGVyTnVtYmVyO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8vIHNob3VsZCBuZXZlciBoYXBwZW5cclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdpbnZhbGlkIGZpbHRlciB0eXBlICcgKyB0aGlzLmZpbHRlclR5cGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5nZXRHdWkgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmVHdWk7XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5pc0ZpbHRlckFjdGl2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyTnVtYmVyICE9PSBudWxsO1xyXG59O1xyXG5cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5jcmVhdGVUZW1wbGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRlbXBsYXRlXHJcbiAgICAgICAgLnJlcGxhY2UoJ1tGSUxURVIuLi5dJywgdGhpcy5sb2NhbGVUZXh0RnVuYygnZmlsdGVyT29vJywgJ0ZpbHRlci4uLicpKVxyXG4gICAgICAgIC5yZXBsYWNlKCdbRVFVQUxTXScsIHRoaXMubG9jYWxlVGV4dEZ1bmMoJ2VxdWFscycsICdFcXVhbHMnKSlcclxuICAgICAgICAucmVwbGFjZSgnW0xFU1MgVEhBTl0nLCB0aGlzLmxvY2FsZVRleHRGdW5jKCdsZXNzVGhhbicsICdMZXNzIHRoYW4nKSlcclxuICAgICAgICAucmVwbGFjZSgnW0dSRUFURVIgVEhBTl0nLCB0aGlzLmxvY2FsZVRleHRGdW5jKCdncmVhdGVyVGhhbicsICdHcmVhdGVyIHRoYW4nKSk7XHJcbn07XHJcblxyXG5OdW1iZXJGaWx0ZXIucHJvdG90eXBlLmNyZWF0ZUd1aSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lR3VpID0gdXRpbHMubG9hZFRlbXBsYXRlKHRoaXMuY3JlYXRlVGVtcGxhdGUoKSk7XHJcbiAgICB0aGlzLmVGaWx0ZXJUZXh0RmllbGQgPSB0aGlzLmVHdWkucXVlcnlTZWxlY3RvcihcIiNmaWx0ZXJUZXh0XCIpO1xyXG4gICAgdGhpcy5lVHlwZVNlbGVjdCA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKFwiI2ZpbHRlclR5cGVcIik7XHJcblxyXG4gICAgdXRpbHMuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5lRmlsdGVyVGV4dEZpZWxkLCB0aGlzLm9uRmlsdGVyQ2hhbmdlZC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZVR5cGVTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCB0aGlzLm9uVHlwZUNoYW5nZWQuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5OdW1iZXJGaWx0ZXIucHJvdG90eXBlLm9uVHlwZUNoYW5nZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZmlsdGVyVHlwZSA9IHBhcnNlSW50KHRoaXMuZVR5cGVTZWxlY3QudmFsdWUpO1xyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2soKTtcclxufTtcclxuXHJcbk51bWJlckZpbHRlci5wcm90b3R5cGUub25GaWx0ZXJDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZmlsdGVyVGV4dCA9IHV0aWxzLm1ha2VOdWxsKHRoaXMuZUZpbHRlclRleHRGaWVsZC52YWx1ZSk7XHJcbiAgICBpZiAoZmlsdGVyVGV4dCAmJiBmaWx0ZXJUZXh0LnRyaW0oKSA9PT0gJycpIHtcclxuICAgICAgICBmaWx0ZXJUZXh0ID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmIChmaWx0ZXJUZXh0KSB7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJOdW1iZXIgPSBwYXJzZUZsb2F0KGZpbHRlclRleHQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmZpbHRlck51bWJlciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICB0aGlzLmZpbHRlckNoYW5nZWRDYWxsYmFjaygpO1xyXG59O1xyXG5cclxuTnVtYmVyRmlsdGVyLnByb3RvdHlwZS5jcmVhdGVBcGkgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHRoaXMuYXBpID0ge1xyXG4gICAgICAgIEVRVUFMUzogRVFVQUxTLFxyXG4gICAgICAgIExFU1NfVEhBTjogTEVTU19USEFOLFxyXG4gICAgICAgIEdSRUFURVJfVEhBTjogR1JFQVRFUl9USEFOLFxyXG4gICAgICAgIHNldFR5cGU6IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgICAgICAgICAgdGhhdC5maWx0ZXJUeXBlID0gdHlwZTtcclxuICAgICAgICAgICAgdGhhdC5lVHlwZVNlbGVjdC52YWx1ZSA9IHR5cGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRGaWx0ZXI6IGZ1bmN0aW9uKGZpbHRlcikge1xyXG4gICAgICAgICAgICBmaWx0ZXIgPSB1dGlscy5tYWtlTnVsbChmaWx0ZXIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGZpbHRlciE9PW51bGwgJiYgISh0eXBlb2YgZmlsdGVyID09PSAnbnVtYmVyJykpIHtcclxuICAgICAgICAgICAgICAgIGZpbHRlciA9IHBhcnNlRmxvYXQoZmlsdGVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGF0LmZpbHRlck51bWJlciA9IGZpbHRlcjtcclxuICAgICAgICAgICAgdGhhdC5lRmlsdGVyVGV4dEZpZWxkLnZhbHVlID0gZmlsdGVyO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VHlwZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmZpbHRlclR5cGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRGaWx0ZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5maWx0ZXJOdW1iZXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRNb2RlbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGF0LmlzRmlsdGVyQWN0aXZlKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogdGhhdC5maWx0ZXJUeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcjogdGhhdC5maWx0ZXJOdW1iZXJcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0TW9kZWw6IGZ1bmN0aW9uKGRhdGFNb2RlbCkge1xyXG4gICAgICAgICAgICBpZiAoZGF0YU1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFR5cGUoZGF0YU1vZGVsLnR5cGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRGaWx0ZXIoZGF0YU1vZGVsLmZpbHRlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEZpbHRlcihudWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG5OdW1iZXJGaWx0ZXIucHJvdG90eXBlLmdldEFwaSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXBpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOdW1iZXJGaWx0ZXI7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gXCI8ZGl2PjxkaXYgY2xhc3M9YWctZmlsdGVyLWhlYWRlci1jb250YWluZXI+PGlucHV0IGNsYXNzPWFnLWZpbHRlci1maWx0ZXIgdHlwZT10ZXh0IHBsYWNlaG9sZGVyPVxcXCJbU0VBUkNILi4uXVxcXCI+PC9kaXY+PGRpdiBjbGFzcz1hZy1maWx0ZXItaGVhZGVyLWNvbnRhaW5lcj48bGFiZWw+PGlucHV0IGlkPXNlbGVjdEFsbCB0eXBlPWNoZWNrYm94IGNsYXNzPVxcXCJhZy1maWx0ZXItY2hlY2tib3hcXFwiPiAoW1NFTEVDVCBBTExdKTwvbGFiZWw+PC9kaXY+PGRpdiBjbGFzcz1hZy1maWx0ZXItbGlzdC12aWV3cG9ydD48ZGl2IGNsYXNzPWFnLWZpbHRlci1saXN0LWNvbnRhaW5lcj48ZGl2IGlkPWl0ZW1Gb3JSZXBlYXQgY2xhc3M9YWctZmlsdGVyLWl0ZW0+PGxhYmVsPjxpbnB1dCB0eXBlPWNoZWNrYm94IGNsYXNzPWFnLWZpbHRlci1jaGVja2JveCBmaWx0ZXItY2hlY2tib3g9XFxcInRydWVcXFwiPiA8c3BhbiBjbGFzcz1hZy1maWx0ZXItdmFsdWU+PC9zcGFuPjwvbGFiZWw+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+XCI7XG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XHJcbnZhciBTZXRGaWx0ZXJNb2RlbCA9IHJlcXVpcmUoJy4vc2V0RmlsdGVyTW9kZWwnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9zZXRGaWx0ZXIuaHRtbCcpO1xyXG5cclxudmFyIERFRkFVTFRfUk9XX0hFSUdIVCA9IDIwO1xyXG5cclxuZnVuY3Rpb24gU2V0RmlsdGVyKHBhcmFtcykge1xyXG4gICAgdGhpcy5maWx0ZXJQYXJhbXMgPSBwYXJhbXMuZmlsdGVyUGFyYW1zO1xyXG4gICAgdGhpcy5yb3dIZWlnaHQgPSAodGhpcy5maWx0ZXJQYXJhbXMgJiYgdGhpcy5maWx0ZXJQYXJhbXMuY2VsbEhlaWdodCkgPyB0aGlzLmZpbHRlclBhcmFtcy5jZWxsSGVpZ2h0IDogREVGQVVMVF9ST1dfSEVJR0hUO1xyXG4gICAgdGhpcy5tb2RlbCA9IG5ldyBTZXRGaWx0ZXJNb2RlbChwYXJhbXMuY29sRGVmLCBwYXJhbXMucm93TW9kZWwsIHBhcmFtcy52YWx1ZUdldHRlcik7XHJcbiAgICB0aGlzLmZpbHRlckNoYW5nZWRDYWxsYmFjayA9IHBhcmFtcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2s7XHJcbiAgICB0aGlzLnZhbHVlR2V0dGVyID0gcGFyYW1zLnZhbHVlR2V0dGVyO1xyXG4gICAgdGhpcy5yb3dzSW5Cb2R5Q29udGFpbmVyID0ge307XHJcbiAgICB0aGlzLmNvbERlZiA9IHBhcmFtcy5jb2xEZWY7XHJcbiAgICB0aGlzLmxvY2FsZVRleHRGdW5jID0gcGFyYW1zLmxvY2FsZVRleHRGdW5jO1xyXG4gICAgaWYgKHRoaXMuZmlsdGVyUGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5jZWxsUmVuZGVyZXIgPSB0aGlzLmZpbHRlclBhcmFtcy5jZWxsUmVuZGVyZXI7XHJcbiAgICB9XHJcbiAgICB0aGlzLmNyZWF0ZUd1aSgpO1xyXG4gICAgdGhpcy5hZGRTY3JvbGxMaXN0ZW5lcigpO1xyXG4gICAgdGhpcy5jcmVhdGVBcGkoKTtcclxufVxyXG5cclxuLy8gd2UgbmVlZCB0byBoYXZlIHRoZSBndWkgYXR0YWNoZWQgYmVmb3JlIHdlIGNhbiBkcmF3IHRoZSB2aXJ0dWFsIHJvd3MsIGFzIHRoZVxyXG4vLyB2aXJ0dWFsIHJvdyBsb2dpYyBuZWVkcyBpbmZvIGFib3V0IHRoZSBndWkgc3RhdGVcclxuLyogcHVibGljICovXHJcblNldEZpbHRlci5wcm90b3R5cGUuYWZ0ZXJHdWlBdHRhY2hlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5kcmF3VmlydHVhbFJvd3MoKTtcclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmlzRmlsdGVyQWN0aXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbC5pc0ZpbHRlckFjdGl2ZSgpO1xyXG59O1xyXG5cclxuLyogcHVibGljICovXHJcblNldEZpbHRlci5wcm90b3R5cGUuZG9lc0ZpbHRlclBhc3MgPSBmdW5jdGlvbihub2RlKSB7XHJcblxyXG4gICAgLy9pZiBubyBmaWx0ZXIsIGFsd2F5cyBwYXNzXHJcbiAgICBpZiAodGhpcy5tb2RlbC5pc0V2ZXJ5dGhpbmdTZWxlY3RlZCgpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICAvL2lmIG5vdGhpbmcgc2VsZWN0ZWQgaW4gZmlsdGVyLCBhbHdheXMgZmFpbFxyXG4gICAgaWYgKHRoaXMubW9kZWwuaXNOb3RoaW5nU2VsZWN0ZWQoKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdmFsdWUgPSB0aGlzLnZhbHVlR2V0dGVyKG5vZGUpO1xyXG4gICAgdmFsdWUgPSB1dGlscy5tYWtlTnVsbCh2YWx1ZSk7XHJcblxyXG4gICAgdmFyIGZpbHRlclBhc3NlZCA9IHRoaXMubW9kZWwuaXNWYWx1ZVNlbGVjdGVkKHZhbHVlKTtcclxuICAgIHJldHVybiBmaWx0ZXJQYXNzZWQ7XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5nZXRHdWkgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmVHdWk7XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5vbk5ld1Jvd3NMb2FkZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBrZWVwU2VsZWN0aW9uID0gdGhpcy5maWx0ZXJQYXJhbXMgJiYgdGhpcy5maWx0ZXJQYXJhbXMubmV3Um93c0FjdGlvbiA9PT0gJ2tlZXAnO1xyXG4gICAgLy8gZGVmYXVsdCBpcyByZXNldFxyXG4gICAgdGhpcy5tb2RlbC5yZWZyZXNoVW5pcXVlVmFsdWVzKGtlZXBTZWxlY3Rpb24pO1xyXG4gICAgdGhpcy5zZXRDb250YWluZXJIZWlnaHQoKTtcclxuICAgIHRoaXMucmVmcmVzaFZpcnR1YWxSb3dzKCk7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmNyZWF0ZVRlbXBsYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGVtcGxhdGVcclxuICAgICAgICAucmVwbGFjZSgnW1NFTEVDVCBBTExdJywgdGhpcy5sb2NhbGVUZXh0RnVuYygnc2VsZWN0QWxsJywgJ1NlbGVjdCBBbGwnKSlcclxuICAgICAgICAucmVwbGFjZSgnW1NFQVJDSC4uLl0nLCB0aGlzLmxvY2FsZVRleHRGdW5jKCdzZWFyY2hPb28nLCAnU2VhcmNoLi4uJykpO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5jcmVhdGVHdWkgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgdGhpcy5lR3VpID0gdXRpbHMubG9hZFRlbXBsYXRlKHRoaXMuY3JlYXRlVGVtcGxhdGUoKSk7XHJcblxyXG4gICAgdGhpcy5lTGlzdENvbnRhaW5lciA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKFwiLmFnLWZpbHRlci1saXN0LWNvbnRhaW5lclwiKTtcclxuICAgIHRoaXMuZUZpbHRlclZhbHVlVGVtcGxhdGUgPSB0aGlzLmVHdWkucXVlcnlTZWxlY3RvcihcIiNpdGVtRm9yUmVwZWF0XCIpO1xyXG4gICAgdGhpcy5lU2VsZWN0QWxsID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIjc2VsZWN0QWxsXCIpO1xyXG4gICAgdGhpcy5lTGlzdFZpZXdwb3J0ID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIuYWctZmlsdGVyLWxpc3Qtdmlld3BvcnRcIik7XHJcbiAgICB0aGlzLmVNaW5pRmlsdGVyID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoXCIuYWctZmlsdGVyLWZpbHRlclwiKTtcclxuICAgIHRoaXMuZUxpc3RDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gKHRoaXMubW9kZWwuZ2V0VW5pcXVlVmFsdWVDb3VudCgpICogdGhpcy5yb3dIZWlnaHQpICsgXCJweFwiO1xyXG5cclxuICAgIHRoaXMuc2V0Q29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICB0aGlzLmVNaW5pRmlsdGVyLnZhbHVlID0gdGhpcy5tb2RlbC5nZXRNaW5pRmlsdGVyKCk7XHJcbiAgICB1dGlscy5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLmVNaW5pRmlsdGVyLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBfdGhpcy5vbk1pbmlGaWx0ZXJDaGFuZ2VkKCk7XHJcbiAgICB9KTtcclxuICAgIHV0aWxzLnJlbW92ZUFsbENoaWxkcmVuKHRoaXMuZUxpc3RDb250YWluZXIpO1xyXG5cclxuICAgIHRoaXMuZVNlbGVjdEFsbC5vbmNsaWNrID0gdGhpcy5vblNlbGVjdEFsbC5iaW5kKHRoaXMpO1xyXG5cclxuICAgIGlmICh0aGlzLm1vZGVsLmlzRXZlcnl0aGluZ1NlbGVjdGVkKCkpIHtcclxuICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZVNlbGVjdEFsbC5jaGVja2VkID0gdHJ1ZTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5tb2RlbC5pc05vdGhpbmdTZWxlY3RlZCgpKSB7XHJcbiAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmVTZWxlY3RBbGwuY2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IHRydWU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLnNldENvbnRhaW5lckhlaWdodCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lTGlzdENvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSAodGhpcy5tb2RlbC5nZXREaXNwbGF5ZWRWYWx1ZUNvdW50KCkgKiB0aGlzLnJvd0hlaWdodCkgKyBcInB4XCI7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmRyYXdWaXJ0dWFsUm93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRvcFBpeGVsID0gdGhpcy5lTGlzdFZpZXdwb3J0LnNjcm9sbFRvcDtcclxuICAgIHZhciBib3R0b21QaXhlbCA9IHRvcFBpeGVsICsgdGhpcy5lTGlzdFZpZXdwb3J0Lm9mZnNldEhlaWdodDtcclxuXHJcbiAgICB2YXIgZmlyc3RSb3cgPSBNYXRoLmZsb29yKHRvcFBpeGVsIC8gdGhpcy5yb3dIZWlnaHQpO1xyXG4gICAgdmFyIGxhc3RSb3cgPSBNYXRoLmZsb29yKGJvdHRvbVBpeGVsIC8gdGhpcy5yb3dIZWlnaHQpO1xyXG5cclxuICAgIHRoaXMuZW5zdXJlUm93c1JlbmRlcmVkKGZpcnN0Um93LCBsYXN0Um93KTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUuZW5zdXJlUm93c1JlbmRlcmVkID0gZnVuY3Rpb24oc3RhcnQsIGZpbmlzaCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICAvL2F0IHRoZSBlbmQsIHRoaXMgYXJyYXkgd2lsbCBjb250YWluIHRoZSBpdGVtcyB3ZSBuZWVkIHRvIHJlbW92ZVxyXG4gICAgdmFyIHJvd3NUb1JlbW92ZSA9IE9iamVjdC5rZXlzKHRoaXMucm93c0luQm9keUNvbnRhaW5lcik7XHJcblxyXG4gICAgLy9hZGQgaW4gbmV3IHJvd3NcclxuICAgIGZvciAodmFyIHJvd0luZGV4ID0gc3RhcnQ7IHJvd0luZGV4IDw9IGZpbmlzaDsgcm93SW5kZXgrKykge1xyXG4gICAgICAgIC8vc2VlIGlmIGl0ZW0gYWxyZWFkeSB0aGVyZSwgYW5kIGlmIHllcywgdGFrZSBpdCBvdXQgb2YgdGhlICd0byByZW1vdmUnIGFycmF5XHJcbiAgICAgICAgaWYgKHJvd3NUb1JlbW92ZS5pbmRleE9mKHJvd0luZGV4LnRvU3RyaW5nKCkpID49IDApIHtcclxuICAgICAgICAgICAgcm93c1RvUmVtb3ZlLnNwbGljZShyb3dzVG9SZW1vdmUuaW5kZXhPZihyb3dJbmRleC50b1N0cmluZygpKSwgMSk7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL2NoZWNrIHRoaXMgcm93IGFjdHVhbGx5IGV4aXN0cyAoaW4gY2FzZSBvdmVyZmxvdyBidWZmZXIgd2luZG93IGV4Y2VlZHMgcmVhbCBkYXRhKVxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmdldERpc3BsYXllZFZhbHVlQ291bnQoKSA+IHJvd0luZGV4KSB7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMubW9kZWwuZ2V0RGlzcGxheWVkVmFsdWUocm93SW5kZXgpO1xyXG4gICAgICAgICAgICBfdGhpcy5pbnNlcnRSb3codmFsdWUsIHJvd0luZGV4KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy9hdCB0aGlzIHBvaW50LCBldmVyeXRoaW5nIGluIG91ciAncm93c1RvUmVtb3ZlJyAuIC4gLlxyXG4gICAgdGhpcy5yZW1vdmVWaXJ0dWFsUm93cyhyb3dzVG9SZW1vdmUpO1xyXG59O1xyXG5cclxuLy90YWtlcyBhcnJheSBvZiByb3cgaWQnc1xyXG5TZXRGaWx0ZXIucHJvdG90eXBlLnJlbW92ZVZpcnR1YWxSb3dzID0gZnVuY3Rpb24ocm93c1RvUmVtb3ZlKSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgcm93c1RvUmVtb3ZlLmZvckVhY2goZnVuY3Rpb24oaW5kZXhUb1JlbW92ZSkge1xyXG4gICAgICAgIHZhciBlUm93VG9SZW1vdmUgPSBfdGhpcy5yb3dzSW5Cb2R5Q29udGFpbmVyW2luZGV4VG9SZW1vdmVdO1xyXG4gICAgICAgIF90aGlzLmVMaXN0Q29udGFpbmVyLnJlbW92ZUNoaWxkKGVSb3dUb1JlbW92ZSk7XHJcbiAgICAgICAgZGVsZXRlIF90aGlzLnJvd3NJbkJvZHlDb250YWluZXJbaW5kZXhUb1JlbW92ZV07XHJcbiAgICB9KTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUuaW5zZXJ0Um93ID0gZnVuY3Rpb24odmFsdWUsIHJvd0luZGV4KSB7XHJcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICAgIHZhciBlRmlsdGVyVmFsdWUgPSB0aGlzLmVGaWx0ZXJWYWx1ZVRlbXBsYXRlLmNsb25lTm9kZSh0cnVlKTtcclxuXHJcbiAgICB2YXIgdmFsdWVFbGVtZW50ID0gZUZpbHRlclZhbHVlLnF1ZXJ5U2VsZWN0b3IoXCIuYWctZmlsdGVyLXZhbHVlXCIpO1xyXG4gICAgaWYgKHRoaXMuY2VsbFJlbmRlcmVyKSB7XHJcbiAgICAgICAgLy9yZW5kZXJlciBwcm92aWRlZCwgc28gdXNlIGl0XHJcbiAgICAgICAgdmFyIHJlc3VsdEZyb21SZW5kZXJlciA9IHRoaXMuY2VsbFJlbmRlcmVyKHtcclxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh1dGlscy5pc05vZGUocmVzdWx0RnJvbVJlbmRlcmVyKSkge1xyXG4gICAgICAgICAgICAvL2EgZG9tIG5vZGUgb3IgZWxlbWVudCB3YXMgcmV0dXJuZWQsIHNvIGFkZCBjaGlsZFxyXG4gICAgICAgICAgICB2YWx1ZUVsZW1lbnQuYXBwZW5kQ2hpbGQocmVzdWx0RnJvbVJlbmRlcmVyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvL290aGVyd2lzZSBhc3N1bWUgaXQgd2FzIGh0bWwsIHNvIGp1c3QgaW5zZXJ0XHJcbiAgICAgICAgICAgIHZhbHVlRWxlbWVudC5pbm5lckhUTUwgPSByZXN1bHRGcm9tUmVuZGVyZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy9vdGhlcndpc2UgZGlzcGxheSBhcyBhIHN0cmluZ1xyXG4gICAgICAgIHZhciBibGFua3NUZXh0ID0gJygnICsgdGhpcy5sb2NhbGVUZXh0RnVuYygnYmxhbmtzJywgJ0JsYW5rcycpICsgJyknO1xyXG4gICAgICAgIHZhciBkaXNwbGF5TmFtZU9mVmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCA/IGJsYW5rc1RleHQgOiB2YWx1ZTtcclxuICAgICAgICB2YWx1ZUVsZW1lbnQuaW5uZXJIVE1MID0gZGlzcGxheU5hbWVPZlZhbHVlO1xyXG4gICAgfVxyXG4gICAgdmFyIGVDaGVja2JveCA9IGVGaWx0ZXJWYWx1ZS5xdWVyeVNlbGVjdG9yKFwiaW5wdXRcIik7XHJcbiAgICBlQ2hlY2tib3guY2hlY2tlZCA9IHRoaXMubW9kZWwuaXNWYWx1ZVNlbGVjdGVkKHZhbHVlKTtcclxuXHJcbiAgICBlQ2hlY2tib3gub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF90aGlzLm9uQ2hlY2tib3hDbGlja2VkKGVDaGVja2JveCwgdmFsdWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBlRmlsdGVyVmFsdWUuc3R5bGUudG9wID0gKHRoaXMucm93SGVpZ2h0ICogcm93SW5kZXgpICsgXCJweFwiO1xyXG5cclxuICAgIHRoaXMuZUxpc3RDb250YWluZXIuYXBwZW5kQ2hpbGQoZUZpbHRlclZhbHVlKTtcclxuICAgIHRoaXMucm93c0luQm9keUNvbnRhaW5lcltyb3dJbmRleF0gPSBlRmlsdGVyVmFsdWU7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLm9uQ2hlY2tib3hDbGlja2VkID0gZnVuY3Rpb24oZUNoZWNrYm94LCB2YWx1ZSkge1xyXG4gICAgdmFyIGNoZWNrZWQgPSBlQ2hlY2tib3guY2hlY2tlZDtcclxuICAgIGlmIChjaGVja2VkKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZWxlY3RWYWx1ZSh2YWx1ZSk7XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwuaXNFdmVyeXRoaW5nU2VsZWN0ZWQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmVTZWxlY3RBbGwuY2hlY2tlZCA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmluZGV0ZXJtaW5hdGUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC51bnNlbGVjdFZhbHVlKHZhbHVlKTtcclxuICAgICAgICAvL2lmIHNldCBpcyBlbXB0eSwgbm90aGluZyBpcyBzZWxlY3RlZFxyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmlzTm90aGluZ1NlbGVjdGVkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5lU2VsZWN0QWxsLmNoZWNrZWQgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVTZWxlY3RBbGwuaW5kZXRlcm1pbmF0ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrKCk7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLm9uTWluaUZpbHRlckNoYW5nZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtaW5pRmlsdGVyQ2hhbmdlZCA9IHRoaXMubW9kZWwuc2V0TWluaUZpbHRlcih0aGlzLmVNaW5pRmlsdGVyLnZhbHVlKTtcclxuICAgIGlmIChtaW5pRmlsdGVyQ2hhbmdlZCkge1xyXG4gICAgICAgIHRoaXMuc2V0Q29udGFpbmVySGVpZ2h0KCk7XHJcbiAgICAgICAgdGhpcy5yZWZyZXNoVmlydHVhbFJvd3MoKTtcclxuICAgIH1cclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUucmVmcmVzaFZpcnR1YWxSb3dzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmNsZWFyVmlydHVhbFJvd3MoKTtcclxuICAgIHRoaXMuZHJhd1ZpcnR1YWxSb3dzKCk7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXIucHJvdG90eXBlLmNsZWFyVmlydHVhbFJvd3MgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciByb3dzVG9SZW1vdmUgPSBPYmplY3Qua2V5cyh0aGlzLnJvd3NJbkJvZHlDb250YWluZXIpO1xyXG4gICAgdGhpcy5yZW1vdmVWaXJ0dWFsUm93cyhyb3dzVG9SZW1vdmUpO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5vblNlbGVjdEFsbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGNoZWNrZWQgPSB0aGlzLmVTZWxlY3RBbGwuY2hlY2tlZDtcclxuICAgIGlmIChjaGVja2VkKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5zZWxlY3RFdmVyeXRoaW5nKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubW9kZWwuc2VsZWN0Tm90aGluZygpO1xyXG4gICAgfVxyXG4gICAgdGhpcy51cGRhdGVBbGxDaGVja2JveGVzKGNoZWNrZWQpO1xyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2soKTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUudXBkYXRlQWxsQ2hlY2tib3hlcyA9IGZ1bmN0aW9uKGNoZWNrZWQpIHtcclxuICAgIHZhciBjdXJyZW50bHlEaXNwbGF5ZWRDaGVja2JveGVzID0gdGhpcy5lTGlzdENvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiW2ZpbHRlci1jaGVja2JveD10cnVlXVwiKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY3VycmVudGx5RGlzcGxheWVkQ2hlY2tib3hlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBjdXJyZW50bHlEaXNwbGF5ZWRDaGVja2JveGVzW2ldLmNoZWNrZWQgPSBjaGVja2VkO1xyXG4gICAgfVxyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5hZGRTY3JvbGxMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgICB0aGlzLmVMaXN0Vmlld3BvcnQuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBfdGhpcy5kcmF3VmlydHVhbFJvd3MoKTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyLnByb3RvdHlwZS5nZXRBcGkgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmFwaTtcclxufTtcclxuXHJcblNldEZpbHRlci5wcm90b3R5cGUuY3JlYXRlQXBpID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbW9kZWwgPSB0aGlzLm1vZGVsO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5hcGkgPSB7XHJcbiAgICAgICAgc2V0TWluaUZpbHRlcjogZnVuY3Rpb24obmV3TWluaUZpbHRlcikge1xyXG4gICAgICAgICAgICBtb2RlbC5zZXRNaW5pRmlsdGVyKG5ld01pbmlGaWx0ZXIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0TWluaUZpbHRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5nZXRNaW5pRmlsdGVyKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZWxlY3RFdmVyeXRoaW5nOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbW9kZWwuc2VsZWN0RXZlcnl0aGluZygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNGaWx0ZXJBY3RpdmU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuaXNGaWx0ZXJBY3RpdmUoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdE5vdGhpbmc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBtb2RlbC5zZWxlY3ROb3RoaW5nKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1bnNlbGVjdFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICBtb2RlbC51bnNlbGVjdFZhbHVlKHZhbHVlKTtcclxuICAgICAgICAgICAgdGhhdC5yZWZyZXNoVmlydHVhbFJvd3MoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICBtb2RlbC5zZWxlY3RWYWx1ZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIHRoYXQucmVmcmVzaFZpcnR1YWxSb3dzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc1ZhbHVlU2VsZWN0ZWQ6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5pc1ZhbHVlU2VsZWN0ZWQodmFsdWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNFdmVyeXRoaW5nU2VsZWN0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuaXNFdmVyeXRoaW5nU2VsZWN0ZWQoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzTm90aGluZ1NlbGVjdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmlzTm90aGluZ1NlbGVjdGVkKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRVbmlxdWVWYWx1ZUNvdW50OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmdldFVuaXF1ZVZhbHVlQ291bnQoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFVuaXF1ZVZhbHVlOiBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuZ2V0VW5pcXVlVmFsdWUoaW5kZXgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0TW9kZWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuZ2V0TW9kZWwoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldE1vZGVsOiBmdW5jdGlvbihkYXRhTW9kZWwpIHtcclxuICAgICAgICAgICAgbW9kZWwuc2V0TW9kZWwoZGF0YU1vZGVsKTtcclxuICAgICAgICAgICAgdGhhdC5yZWZyZXNoVmlydHVhbFJvd3MoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZXRGaWx0ZXI7XHJcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcblxyXG5mdW5jdGlvbiBTZXRGaWx0ZXJNb2RlbChjb2xEZWYsIHJvd01vZGVsLCB2YWx1ZUdldHRlcikge1xyXG4gICAgdGhpcy5jb2xEZWYgPSBjb2xEZWY7XHJcbiAgICB0aGlzLnJvd01vZGVsID0gcm93TW9kZWw7XHJcbiAgICB0aGlzLnZhbHVlR2V0dGVyID0gdmFsdWVHZXR0ZXI7XHJcblxyXG4gICAgdGhpcy5jcmVhdGVVbmlxdWVWYWx1ZXMoKTtcclxuXHJcbiAgICAvLyBieSBkZWZhdWx0LCBubyBmaWx0ZXIsIHNvIHdlIGRpc3BsYXkgZXZlcnl0aGluZ1xyXG4gICAgdGhpcy5kaXNwbGF5ZWRWYWx1ZXMgPSB0aGlzLnVuaXF1ZVZhbHVlcztcclxuICAgIHRoaXMubWluaUZpbHRlciA9IG51bGw7XHJcbiAgICAvL3dlIHVzZSBhIG1hcCByYXRoZXIgdGhhbiBhbiBhcnJheSBmb3IgdGhlIHNlbGVjdGVkIHZhbHVlcyBhcyB0aGUgbG9va3VwXHJcbiAgICAvL2ZvciBhIG1hcCBpcyBtdWNoIGZhc3RlciB0aGFuIHRoZSBsb29rdXAgZm9yIGFuIGFycmF5LCBlc3BlY2lhbGx5IHdoZW5cclxuICAgIC8vdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXkgaXMgdGhvdXNhbmRzIG9mIHJlY29yZHMgbG9uZ1xyXG4gICAgdGhpcy5zZWxlY3RlZFZhbHVlc01hcCA9IHt9O1xyXG4gICAgdGhpcy5zZWxlY3RFdmVyeXRoaW5nKCk7XHJcbn1cclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5yZWZyZXNoVW5pcXVlVmFsdWVzID0gZnVuY3Rpb24oa2VlcFNlbGVjdGlvbikge1xyXG4gICAgdGhpcy5jcmVhdGVVbmlxdWVWYWx1ZXMoKTtcclxuXHJcbiAgICB2YXIgb2xkTW9kZWwgPSBPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkVmFsdWVzTWFwKTtcclxuXHJcbiAgICB0aGlzLnNlbGVjdGVkVmFsdWVzTWFwID0ge307XHJcbiAgICB0aGlzLmZpbHRlckRpc3BsYXllZFZhbHVlcygpO1xyXG5cclxuICAgIGlmIChrZWVwU2VsZWN0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5zZXRNb2RlbChvbGRNb2RlbCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0RXZlcnl0aGluZygpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmNyZWF0ZVVuaXF1ZVZhbHVlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuY29sRGVmLmZpbHRlclBhcmFtcyAmJiB0aGlzLmNvbERlZi5maWx0ZXJQYXJhbXMudmFsdWVzKSB7XHJcbiAgICAgICAgdGhpcy51bmlxdWVWYWx1ZXMgPSB1dGlscy50b1N0cmluZ3ModGhpcy5jb2xEZWYuZmlsdGVyUGFyYW1zLnZhbHVlcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMudW5pcXVlVmFsdWVzID0gdXRpbHMudG9TdHJpbmdzKHRoaXMuaXRlcmF0ZVRocm91Z2hOb2Rlc0ZvclZhbHVlcygpKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5jb2xEZWYuY29tcGFyYXRvcikge1xyXG4gICAgICAgIHRoaXMudW5pcXVlVmFsdWVzLnNvcnQodGhpcy5jb2xEZWYuY29tcGFyYXRvcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMudW5pcXVlVmFsdWVzLnNvcnQodXRpbHMuZGVmYXVsdENvbXBhcmF0b3IpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLml0ZXJhdGVUaHJvdWdoTm9kZXNGb3JWYWx1ZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB1bmlxdWVDaGVjayA9IHt9O1xyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICBmdW5jdGlvbiByZWN1cnNpdmVseVByb2Nlc3Mobm9kZXMpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgICAgIGlmIChub2RlLmdyb3VwICYmICFub2RlLmZvb3Rlcikge1xyXG4gICAgICAgICAgICAgICAgLy8gZ3JvdXAgbm9kZSwgc28gZGlnIGRlZXBlclxyXG4gICAgICAgICAgICAgICAgcmVjdXJzaXZlbHlQcm9jZXNzKG5vZGUuY2hpbGRyZW4pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhhdC52YWx1ZUdldHRlcihub2RlKTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gXCJcIiB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCF1bmlxdWVDaGVjay5oYXNPd25Qcm9wZXJ0eSh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pcXVlQ2hlY2tbdmFsdWVdID0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgdG9wTGV2ZWxOb2RlcyA9IHRoaXMucm93TW9kZWwuZ2V0VG9wTGV2ZWxOb2RlcygpO1xyXG4gICAgcmVjdXJzaXZlbHlQcm9jZXNzKHRvcExldmVsTm9kZXMpO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG4vL3NldHMgbWluaSBmaWx0ZXIuIHJldHVybnMgdHJ1ZSBpZiBpdCBjaGFuZ2VkIGZyb20gbGFzdCB2YWx1ZSwgb3RoZXJ3aXNlIGZhbHNlXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5zZXRNaW5pRmlsdGVyID0gZnVuY3Rpb24obmV3TWluaUZpbHRlcikge1xyXG4gICAgbmV3TWluaUZpbHRlciA9IHV0aWxzLm1ha2VOdWxsKG5ld01pbmlGaWx0ZXIpO1xyXG4gICAgaWYgKHRoaXMubWluaUZpbHRlciA9PT0gbmV3TWluaUZpbHRlcikge1xyXG4gICAgICAgIC8vZG8gbm90aGluZyBpZiBmaWx0ZXIgaGFzIG5vdCBjaGFuZ2VkXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy5taW5pRmlsdGVyID0gbmV3TWluaUZpbHRlcjtcclxuICAgIHRoaXMuZmlsdGVyRGlzcGxheWVkVmFsdWVzKCk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5nZXRNaW5pRmlsdGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5taW5pRmlsdGVyO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmZpbHRlckRpc3BsYXllZFZhbHVlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gaWYgbm8gZmlsdGVyLCBqdXN0IHVzZSB0aGUgdW5pcXVlIHZhbHVlc1xyXG4gICAgaWYgKHRoaXMubWluaUZpbHRlciA9PT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMuZGlzcGxheWVkVmFsdWVzID0gdGhpcy51bmlxdWVWYWx1ZXM7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGZpbHRlciBwcmVzZW50LCB3ZSBmaWx0ZXIgZG93biB0aGUgbGlzdFxyXG4gICAgdGhpcy5kaXNwbGF5ZWRWYWx1ZXMgPSBbXTtcclxuICAgIHZhciBtaW5pRmlsdGVyVXBwZXJDYXNlID0gdGhpcy5taW5pRmlsdGVyLnRvVXBwZXJDYXNlKCk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMudW5pcXVlVmFsdWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHZhciB1bmlxdWVWYWx1ZSA9IHRoaXMudW5pcXVlVmFsdWVzW2ldO1xyXG4gICAgICAgIGlmICh1bmlxdWVWYWx1ZSAhPT0gbnVsbCAmJiB1bmlxdWVWYWx1ZS50b1N0cmluZygpLnRvVXBwZXJDYXNlKCkuaW5kZXhPZihtaW5pRmlsdGVyVXBwZXJDYXNlKSA+PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheWVkVmFsdWVzLnB1c2godW5pcXVlVmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5TZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuZ2V0RGlzcGxheWVkVmFsdWVDb3VudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZGlzcGxheWVkVmFsdWVzLmxlbmd0aDtcclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5nZXREaXNwbGF5ZWRWYWx1ZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICByZXR1cm4gdGhpcy5kaXNwbGF5ZWRWYWx1ZXNbaW5kZXhdO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLnNlbGVjdEV2ZXJ5dGhpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjb3VudCA9IHRoaXMudW5pcXVlVmFsdWVzLmxlbmd0aDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMudW5pcXVlVmFsdWVzW2ldO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRWYWx1ZXNNYXBbdmFsdWVdID0gbnVsbDtcclxuICAgIH1cclxuICAgIHRoaXMuc2VsZWN0ZWRWYWx1ZXNDb3VudCA9IGNvdW50O1xyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmlzRmlsdGVyQWN0aXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy51bmlxdWVWYWx1ZXMubGVuZ3RoICE9PSB0aGlzLnNlbGVjdGVkVmFsdWVzQ291bnQ7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuc2VsZWN0Tm90aGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5zZWxlY3RlZFZhbHVlc01hcCA9IHt9O1xyXG4gICAgdGhpcy5zZWxlY3RlZFZhbHVlc0NvdW50ID0gMDtcclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5nZXRVbmlxdWVWYWx1ZUNvdW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy51bmlxdWVWYWx1ZXMubGVuZ3RoO1xyXG59O1xyXG5cclxuU2V0RmlsdGVyTW9kZWwucHJvdG90eXBlLmdldFVuaXF1ZVZhbHVlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIHJldHVybiB0aGlzLnVuaXF1ZVZhbHVlc1tpbmRleF07XHJcbn07XHJcblxyXG5TZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUudW5zZWxlY3RWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICBpZiAodGhpcy5zZWxlY3RlZFZhbHVlc01hcFt2YWx1ZV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnNlbGVjdGVkVmFsdWVzTWFwW3ZhbHVlXTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkVmFsdWVzQ291bnQtLTtcclxuICAgIH1cclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5zZWxlY3RWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICBpZiAodGhpcy5zZWxlY3RlZFZhbHVlc01hcFt2YWx1ZV0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRWYWx1ZXNNYXBbdmFsdWVdID0gbnVsbDtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkVmFsdWVzQ291bnQrKztcclxuICAgIH1cclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5pc1ZhbHVlU2VsZWN0ZWQgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRWYWx1ZXNNYXBbdmFsdWVdICE9PSB1bmRlZmluZWQ7XHJcbn07XHJcblxyXG5TZXRGaWx0ZXJNb2RlbC5wcm90b3R5cGUuaXNFdmVyeXRoaW5nU2VsZWN0ZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLnVuaXF1ZVZhbHVlcy5sZW5ndGggPT09IHRoaXMuc2VsZWN0ZWRWYWx1ZXNDb3VudDtcclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5pc05vdGhpbmdTZWxlY3RlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudW5pcXVlVmFsdWVzLmxlbmd0aCA9PT0gMDtcclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5nZXRNb2RlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCF0aGlzLmlzRmlsdGVyQWN0aXZlKCkpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIHZhciBzZWxlY3RlZFZhbHVlcyA9IFtdO1xyXG4gICAgdXRpbHMuaXRlcmF0ZU9iamVjdCh0aGlzLnNlbGVjdGVkVmFsdWVzTWFwLCBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICBzZWxlY3RlZFZhbHVlcy5wdXNoKGtleSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBzZWxlY3RlZFZhbHVlcztcclxufTtcclxuXHJcblNldEZpbHRlck1vZGVsLnByb3RvdHlwZS5zZXRNb2RlbCA9IGZ1bmN0aW9uKG1vZGVsKSB7XHJcbiAgICBpZiAobW9kZWwpIHtcclxuICAgICAgICB0aGlzLnNlbGVjdE5vdGhpbmcoKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaTxtb2RlbC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgbmV3VmFsdWUgPSBtb2RlbFtpXTtcclxuICAgICAgICAgICAgaWYgKHRoaXMudW5pcXVlVmFsdWVzLmluZGV4T2YobmV3VmFsdWUpPj0wKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdFZhbHVlKG1vZGVsW2ldKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignVmFsdWUgJyArIG5ld1ZhbHVlICsgJyBpcyBub3QgYSB2YWxpZCB2YWx1ZSBmb3IgZmlsdGVyJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0RXZlcnl0aGluZygpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZXRGaWx0ZXJNb2RlbDtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxkaXY+PGRpdj48c2VsZWN0IGNsYXNzPWFnLWZpbHRlci1zZWxlY3QgaWQ9ZmlsdGVyVHlwZT48b3B0aW9uIHZhbHVlPTE+W0NPTlRBSU5TXTwvb3B0aW9uPjxvcHRpb24gdmFsdWU9Mj5bRVFVQUxTXTwvb3B0aW9uPjxvcHRpb24gdmFsdWU9Mz5bU1RBUlRTIFdJVEhdPC9vcHRpb24+PG9wdGlvbiB2YWx1ZT00PltFTkRTIFdJVEhdPC9vcHRpb24+PC9zZWxlY3Q+PC9kaXY+PGRpdj48aW5wdXQgY2xhc3M9YWctZmlsdGVyLWZpbHRlciBpZD1maWx0ZXJUZXh0IHR5cGU9dGV4dCBwbGFjZWhvbGRlcj1cXFwiW0ZJTFRFUi4uLl1cXFwiPjwvZGl2PjwvZGl2PlwiO1xuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZXh0RmlsdGVyLmh0bWwnKTtcclxuXHJcbnZhciBDT05UQUlOUyA9IDE7XHJcbnZhciBFUVVBTFMgPSAyO1xyXG52YXIgU1RBUlRTX1dJVEggPSAzO1xyXG52YXIgRU5EU19XSVRIID0gNDtcclxuXHJcbmZ1bmN0aW9uIFRleHRGaWx0ZXIocGFyYW1zKSB7XHJcbiAgICB0aGlzLmZpbHRlclBhcmFtcyA9IHBhcmFtcy5maWx0ZXJQYXJhbXM7XHJcbiAgICB0aGlzLmZpbHRlckNoYW5nZWRDYWxsYmFjayA9IHBhcmFtcy5maWx0ZXJDaGFuZ2VkQ2FsbGJhY2s7XHJcbiAgICB0aGlzLmxvY2FsZVRleHRGdW5jID0gcGFyYW1zLmxvY2FsZVRleHRGdW5jO1xyXG4gICAgdGhpcy52YWx1ZUdldHRlciA9IHBhcmFtcy52YWx1ZUdldHRlcjtcclxuICAgIHRoaXMuY3JlYXRlR3VpKCk7XHJcbiAgICB0aGlzLmZpbHRlclRleHQgPSBudWxsO1xyXG4gICAgdGhpcy5maWx0ZXJUeXBlID0gQ09OVEFJTlM7XHJcbiAgICB0aGlzLmNyZWF0ZUFwaSgpO1xyXG59XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuVGV4dEZpbHRlci5wcm90b3R5cGUub25OZXdSb3dzTG9hZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIga2VlcFNlbGVjdGlvbiA9IHRoaXMuZmlsdGVyUGFyYW1zICYmIHRoaXMuZmlsdGVyUGFyYW1zLm5ld1Jvd3NBY3Rpb24gPT09ICdrZWVwJztcclxuICAgIGlmICgha2VlcFNlbGVjdGlvbikge1xyXG4gICAgICAgIHRoaXMuYXBpLnNldFR5cGUoQ09OVEFJTlMpO1xyXG4gICAgICAgIHRoaXMuYXBpLnNldEZpbHRlcihudWxsKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5UZXh0RmlsdGVyLnByb3RvdHlwZS5hZnRlckd1aUF0dGFjaGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVGaWx0ZXJUZXh0RmllbGQuZm9jdXMoKTtcclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5UZXh0RmlsdGVyLnByb3RvdHlwZS5kb2VzRmlsdGVyUGFzcyA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgIGlmICghdGhpcy5maWx0ZXJUZXh0KSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICB2YXIgdmFsdWUgPSB0aGlzLnZhbHVlR2V0dGVyKG5vZGUpO1xyXG4gICAgaWYgKCF2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHZhciB2YWx1ZUxvd2VyQ2FzZSA9IHZhbHVlLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKTtcclxuICAgIHN3aXRjaCAodGhpcy5maWx0ZXJUeXBlKSB7XHJcbiAgICAgICAgY2FzZSBDT05UQUlOUzpcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlTG93ZXJDYXNlLmluZGV4T2YodGhpcy5maWx0ZXJUZXh0KSA+PSAwO1xyXG4gICAgICAgIGNhc2UgRVFVQUxTOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVMb3dlckNhc2UgPT09IHRoaXMuZmlsdGVyVGV4dDtcclxuICAgICAgICBjYXNlIFNUQVJUU19XSVRIOlxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVMb3dlckNhc2UuaW5kZXhPZih0aGlzLmZpbHRlclRleHQpID09PSAwO1xyXG4gICAgICAgIGNhc2UgRU5EU19XSVRIOlxyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSB2YWx1ZUxvd2VyQ2FzZS5pbmRleE9mKHRoaXMuZmlsdGVyVGV4dCk7XHJcbiAgICAgICAgICAgIHJldHVybiBpbmRleCA+PSAwICYmIGluZGV4ID09PSAodmFsdWVMb3dlckNhc2UubGVuZ3RoIC0gdGhpcy5maWx0ZXJUZXh0Lmxlbmd0aCk7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLy8gc2hvdWxkIG5ldmVyIGhhcHBlblxyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2ludmFsaWQgZmlsdGVyIHR5cGUgJyArIHRoaXMuZmlsdGVyVHlwZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qIHB1YmxpYyAqL1xyXG5UZXh0RmlsdGVyLnByb3RvdHlwZS5nZXRHdWkgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmVHdWk7XHJcbn07XHJcblxyXG4vKiBwdWJsaWMgKi9cclxuVGV4dEZpbHRlci5wcm90b3R5cGUuaXNGaWx0ZXJBY3RpdmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmZpbHRlclRleHQgIT09IG51bGw7XHJcbn07XHJcblxyXG5UZXh0RmlsdGVyLnByb3RvdHlwZS5jcmVhdGVUZW1wbGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRlbXBsYXRlXHJcbiAgICAgICAgLnJlcGxhY2UoJ1tGSUxURVIuLi5dJywgdGhpcy5sb2NhbGVUZXh0RnVuYygnZmlsdGVyT29vJywgJ0ZpbHRlci4uLicpKVxyXG4gICAgICAgIC5yZXBsYWNlKCdbRVFVQUxTXScsIHRoaXMubG9jYWxlVGV4dEZ1bmMoJ2VxdWFscycsICdFcXVhbHMnKSlcclxuICAgICAgICAucmVwbGFjZSgnW0NPTlRBSU5TXScsIHRoaXMubG9jYWxlVGV4dEZ1bmMoJ2NvbnRhaW5zJywgJ0NvbnRhaW5zJykpXHJcbiAgICAgICAgLnJlcGxhY2UoJ1tTVEFSVFMgV0lUSF0nLCB0aGlzLmxvY2FsZVRleHRGdW5jKCdzdGFydHNXaXRoJywgJ1N0YXJ0cyB3aXRoJykpXHJcbiAgICAgICAgLnJlcGxhY2UoJ1tFTkRTIFdJVEhdJywgdGhpcy5sb2NhbGVUZXh0RnVuYygnZW5kc1dpdGgnLCAnRW5kcyB3aXRoJykpXHJcbjtcclxufTtcclxuXHJcbic8b3B0aW9uIHZhbHVlPVwiMVwiPkNvbnRhaW5zPC9vcHRpb24+JyxcclxuICAgICc8b3B0aW9uIHZhbHVlPVwiMlwiPkVxdWFsczwvb3B0aW9uPicsXHJcbiAgICAnPG9wdGlvbiB2YWx1ZT1cIjNcIj5TdGFydHMgd2l0aDwvb3B0aW9uPicsXHJcbiAgICAnPG9wdGlvbiB2YWx1ZT1cIjRcIj5FbmRzIHdpdGg8L29wdGlvbj4nLFxyXG5cclxuXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLmNyZWF0ZUd1aSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lR3VpID0gdXRpbHMubG9hZFRlbXBsYXRlKHRoaXMuY3JlYXRlVGVtcGxhdGUoKSk7XHJcbiAgICB0aGlzLmVGaWx0ZXJUZXh0RmllbGQgPSB0aGlzLmVHdWkucXVlcnlTZWxlY3RvcihcIiNmaWx0ZXJUZXh0XCIpO1xyXG4gICAgdGhpcy5lVHlwZVNlbGVjdCA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKFwiI2ZpbHRlclR5cGVcIik7XHJcblxyXG4gICAgdXRpbHMuYWRkQ2hhbmdlTGlzdGVuZXIodGhpcy5lRmlsdGVyVGV4dEZpZWxkLCB0aGlzLm9uRmlsdGVyQ2hhbmdlZC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuZVR5cGVTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCB0aGlzLm9uVHlwZUNoYW5nZWQuYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5UZXh0RmlsdGVyLnByb3RvdHlwZS5vblR5cGVDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmZpbHRlclR5cGUgPSBwYXJzZUludCh0aGlzLmVUeXBlU2VsZWN0LnZhbHVlKTtcclxuICAgIHRoaXMuZmlsdGVyQ2hhbmdlZENhbGxiYWNrKCk7XHJcbn07XHJcblxyXG5UZXh0RmlsdGVyLnByb3RvdHlwZS5vbkZpbHRlckNoYW5nZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBmaWx0ZXJUZXh0ID0gdXRpbHMubWFrZU51bGwodGhpcy5lRmlsdGVyVGV4dEZpZWxkLnZhbHVlKTtcclxuICAgIGlmIChmaWx0ZXJUZXh0ICYmIGZpbHRlclRleHQudHJpbSgpID09PSAnJykge1xyXG4gICAgICAgIGZpbHRlclRleHQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKGZpbHRlclRleHQpIHtcclxuICAgICAgICB0aGlzLmZpbHRlclRleHQgPSBmaWx0ZXJUZXh0LnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZmlsdGVyVGV4dCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICB0aGlzLmZpbHRlckNoYW5nZWRDYWxsYmFjaygpO1xyXG59O1xyXG5cclxuVGV4dEZpbHRlci5wcm90b3R5cGUuY3JlYXRlQXBpID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB0aGlzLmFwaSA9IHtcclxuICAgICAgICBFUVVBTFM6IEVRVUFMUyxcclxuICAgICAgICBDT05UQUlOUzogQ09OVEFJTlMsXHJcbiAgICAgICAgU1RBUlRTX1dJVEg6IFNUQVJUU19XSVRILFxyXG4gICAgICAgIEVORFNfV0lUSDogRU5EU19XSVRILFxyXG4gICAgICAgIHNldFR5cGU6IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgICAgICAgICAgdGhhdC5maWx0ZXJUeXBlID0gdHlwZTtcclxuICAgICAgICAgICAgdGhhdC5lVHlwZVNlbGVjdC52YWx1ZSA9IHR5cGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRGaWx0ZXI6IGZ1bmN0aW9uKGZpbHRlcikge1xyXG4gICAgICAgICAgICBmaWx0ZXIgPSB1dGlscy5tYWtlTnVsbChmaWx0ZXIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5maWx0ZXJUZXh0ID0gZmlsdGVyLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmVGaWx0ZXJUZXh0RmllbGQudmFsdWUgPSBmaWx0ZXI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmZpbHRlclRleHQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5lRmlsdGVyVGV4dEZpZWxkLnZhbHVlID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0VHlwZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmZpbHRlclR5cGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRGaWx0ZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5maWx0ZXJUZXh0O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0TW9kZWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhhdC5pc0ZpbHRlckFjdGl2ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHRoYXQuZmlsdGVyVHlwZSxcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXI6IHRoYXQuZmlsdGVyVGV4dFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRNb2RlbDogZnVuY3Rpb24oZGF0YU1vZGVsKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhTW9kZWwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VHlwZShkYXRhTW9kZWwudHlwZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEZpbHRlcihkYXRhTW9kZWwuZmlsdGVyKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RmlsdGVyKG51bGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuXHJcblRleHRGaWx0ZXIucHJvdG90eXBlLmdldEFwaSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXBpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUZXh0RmlsdGVyO1xyXG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcbnZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xyXG52YXIgR3JpZE9wdGlvbnNXcmFwcGVyID0gcmVxdWlyZSgnLi9ncmlkT3B0aW9uc1dyYXBwZXInKTtcclxudmFyIFNlbGVjdGlvbkNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL3NlbGVjdGlvbkNvbnRyb2xsZXInKTtcclxudmFyIEZpbHRlck1hbmFnZXIgPSByZXF1aXJlKCcuL2ZpbHRlci9maWx0ZXJNYW5hZ2VyJyk7XHJcbnZhciBTZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkgPSByZXF1aXJlKCcuL3NlbGVjdGlvblJlbmRlcmVyRmFjdG9yeScpO1xyXG52YXIgQ29sdW1uQ29udHJvbGxlciA9IHJlcXVpcmUoJy4vY29sdW1uQ29udHJvbGxlcicpO1xyXG52YXIgUm93UmVuZGVyZXIgPSByZXF1aXJlKCcuL3Jvd1JlbmRlcmVyJyk7XHJcbnZhciBIZWFkZXJSZW5kZXJlciA9IHJlcXVpcmUoJy4vaGVhZGVyUmVuZGVyZXInKTtcclxudmFyIEluTWVtb3J5Um93Q29udHJvbGxlciA9IHJlcXVpcmUoJy4vcm93Q29udHJvbGxlcnMvaW5NZW1vcnlSb3dDb250cm9sbGVyJyk7XHJcbnZhciBWaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIgPSByZXF1aXJlKCcuL3Jvd0NvbnRyb2xsZXJzL3ZpcnR1YWxQYWdlUm93Q29udHJvbGxlcicpO1xyXG52YXIgUGFnaW5hdGlvbkNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL3Jvd0NvbnRyb2xsZXJzL3BhZ2luYXRpb25Db250cm9sbGVyJyk7XHJcbnZhciBFeHByZXNzaW9uU2VydmljZSA9IHJlcXVpcmUoJy4vZXhwcmVzc2lvblNlcnZpY2UnKTtcclxudmFyIFRlbXBsYXRlU2VydmljZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGVTZXJ2aWNlJyk7XHJcbnZhciBUb29sUGFuZWwgPSByZXF1aXJlKCcuL3Rvb2xQYW5lbC90b29sUGFuZWwnKTtcclxudmFyIEJvcmRlckxheW91dCA9IHJlcXVpcmUoJy4vbGF5b3V0L2JvcmRlckxheW91dCcpO1xyXG52YXIgR3JpZFBhbmVsID0gcmVxdWlyZSgnLi9ncmlkUGFuZWwvZ3JpZFBhbmVsJyk7XHJcblxyXG5mdW5jdGlvbiBHcmlkKGVHcmlkRGl2LCBncmlkT3B0aW9ucywgJHNjb3BlLCAkY29tcGlsZSwgcXVpY2tGaWx0ZXJPblNjb3BlKSB7XHJcblxyXG4gICAgdGhpcy5ncmlkT3B0aW9ucyA9IGdyaWRPcHRpb25zO1xyXG4gICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIgPSBuZXcgR3JpZE9wdGlvbnNXcmFwcGVyKHRoaXMuZ3JpZE9wdGlvbnMpO1xyXG5cclxuICAgIHRoaXMuc2V0dXBDb21wb25lbnRzKCRzY29wZSwgJGNvbXBpbGUsIGVHcmlkRGl2KTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB0aGlzLnF1aWNrRmlsdGVyID0gbnVsbDtcclxuXHJcbiAgICAvLyBpZiB1c2luZyBhbmd1bGFyLCB3YXRjaCBmb3IgcXVpY2tGaWx0ZXIgY2hhbmdlc1xyXG4gICAgaWYgKCRzY29wZSkge1xyXG4gICAgICAgICRzY29wZS4kd2F0Y2gocXVpY2tGaWx0ZXJPblNjb3BlLCBmdW5jdGlvbihuZXdGaWx0ZXIpIHtcclxuICAgICAgICAgICAgdGhhdC5vblF1aWNrRmlsdGVyQ2hhbmdlZChuZXdGaWx0ZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudmlydHVhbFJvd0NhbGxiYWNrcyA9IHt9O1xyXG5cclxuICAgIHZhciBmb3JQcmludCA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9udFVzZVNjcm9sbHMoKTtcclxuICAgIHRoaXMuYWRkQXBpKCk7XHJcblxyXG4gICAgdGhpcy5zY3JvbGxXaWR0aCA9IHV0aWxzLmdldFNjcm9sbGJhcldpZHRoKCk7XHJcblxyXG4gICAgLy8gZG9uZSB3aGVuIGNvbHMgY2hhbmdlXHJcbiAgICB0aGlzLnNldHVwQ29sdW1ucygpO1xyXG5cclxuICAgIHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyLnNldEFsbFJvd3ModGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QWxsUm93cygpKTtcclxuXHJcbiAgICBpZiAoIWZvclByaW50KSB7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuZG9MYXlvdXQuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51cGRhdGVNb2RlbEFuZFJlZnJlc2goY29uc3RhbnRzLlNURVBfRVZFUllUSElORyk7XHJcblxyXG4gICAgLy8gaWYgbm8gZGF0YSBwcm92aWRlZCBpbml0aWFsbHksIGFuZCBub3QgZG9pbmcgaW5maW5pdGUgc2Nyb2xsaW5nLCBzaG93IHRoZSBsb2FkaW5nIHBhbmVsXHJcbiAgICB2YXIgc2hvd0xvYWRpbmcgPSAhdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QWxsUm93cygpICYmICF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc1ZpcnR1YWxQYWdpbmcoKTtcclxuICAgIHRoaXMuc2hvd0xvYWRpbmdQYW5lbChzaG93TG9hZGluZyk7XHJcblxyXG4gICAgLy8gaWYgZGF0YXNvdXJjZSBwcm92aWRlZCwgdXNlIGl0XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0RGF0YXNvdXJjZSgpKSB7XHJcbiAgICAgICAgdGhpcy5zZXREYXRhc291cmNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kb0xheW91dCgpO1xyXG5cclxuICAgIC8vIGlmIHJlYWR5IGZ1bmN0aW9uIHByb3ZpZGVkLCB1c2UgaXRcclxuICAgIGlmICh0eXBlb2YgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0UmVhZHkoKSA9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0UmVhZHkoKShncmlkT3B0aW9ucy5hcGkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zZXR1cENvbXBvbmVudHMgPSBmdW5jdGlvbigkc2NvcGUsICRjb21waWxlLCBlVXNlclByb3ZpZGVkRGl2KSB7XHJcblxyXG4gICAgLy8gbWFrZSBsb2NhbCByZWZlcmVuY2VzLCB0byBtYWtlIHRoZSBiZWxvdyBtb3JlIGh1bWFuIHJlYWRhYmxlXHJcbiAgICB2YXIgZ3JpZE9wdGlvbnNXcmFwcGVyID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB2YXIgZ3JpZE9wdGlvbnMgPSB0aGlzLmdyaWRPcHRpb25zO1xyXG4gICAgdmFyIGZvclByaW50ID0gZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRG9udFVzZVNjcm9sbHMoKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYWxsIHRoZSBiZWFuc1xyXG4gICAgdmFyIHNlbGVjdGlvbkNvbnRyb2xsZXIgPSBuZXcgU2VsZWN0aW9uQ29udHJvbGxlcigpO1xyXG4gICAgdmFyIGZpbHRlck1hbmFnZXIgPSBuZXcgRmlsdGVyTWFuYWdlcigpO1xyXG4gICAgdmFyIHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSA9IG5ldyBTZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkoKTtcclxuICAgIHZhciBjb2x1bW5Db250cm9sbGVyID0gbmV3IENvbHVtbkNvbnRyb2xsZXIoKTtcclxuICAgIHZhciByb3dSZW5kZXJlciA9IG5ldyBSb3dSZW5kZXJlcigpO1xyXG4gICAgdmFyIGhlYWRlclJlbmRlcmVyID0gbmV3IEhlYWRlclJlbmRlcmVyKCk7XHJcbiAgICB2YXIgaW5NZW1vcnlSb3dDb250cm9sbGVyID0gbmV3IEluTWVtb3J5Um93Q29udHJvbGxlcigpO1xyXG4gICAgdmFyIHZpcnR1YWxQYWdlUm93Q29udHJvbGxlciA9IG5ldyBWaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIoKTtcclxuICAgIHZhciBleHByZXNzaW9uU2VydmljZSA9IG5ldyBFeHByZXNzaW9uU2VydmljZSgpO1xyXG4gICAgdmFyIHRlbXBsYXRlU2VydmljZSA9IG5ldyBUZW1wbGF0ZVNlcnZpY2UoKTtcclxuICAgIHZhciBncmlkUGFuZWwgPSBuZXcgR3JpZFBhbmVsKGdyaWRPcHRpb25zV3JhcHBlcik7XHJcblxyXG4gICAgdmFyIGNvbHVtbk1vZGVsID0gY29sdW1uQ29udHJvbGxlci5nZXRNb2RlbCgpO1xyXG5cclxuICAgIC8vIGluaXRpYWxpc2UgYWxsIHRoZSBiZWFuc1xyXG4gICAgdGVtcGxhdGVTZXJ2aWNlLmluaXQoJHNjb3BlKTtcclxuICAgIHNlbGVjdGlvbkNvbnRyb2xsZXIuaW5pdCh0aGlzLCBncmlkUGFuZWwsIGdyaWRPcHRpb25zV3JhcHBlciwgJHNjb3BlLCByb3dSZW5kZXJlcik7XHJcbiAgICBmaWx0ZXJNYW5hZ2VyLmluaXQodGhpcywgZ3JpZE9wdGlvbnNXcmFwcGVyLCAkY29tcGlsZSwgJHNjb3BlLCBleHByZXNzaW9uU2VydmljZSwgY29sdW1uTW9kZWwpO1xyXG4gICAgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LmluaXQodGhpcywgc2VsZWN0aW9uQ29udHJvbGxlcik7XHJcbiAgICBjb2x1bW5Db250cm9sbGVyLmluaXQodGhpcywgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LCBncmlkT3B0aW9uc1dyYXBwZXIsIGV4cHJlc3Npb25TZXJ2aWNlKTtcclxuICAgIHJvd1JlbmRlcmVyLmluaXQoZ3JpZE9wdGlvbnMsIGNvbHVtbk1vZGVsLCBncmlkT3B0aW9uc1dyYXBwZXIsIGdyaWRQYW5lbCwgdGhpcyxcclxuICAgICAgICBzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnksICRjb21waWxlLCAkc2NvcGUsIHNlbGVjdGlvbkNvbnRyb2xsZXIsIGV4cHJlc3Npb25TZXJ2aWNlLCB0ZW1wbGF0ZVNlcnZpY2UpO1xyXG4gICAgaGVhZGVyUmVuZGVyZXIuaW5pdChncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbkNvbnRyb2xsZXIsIGNvbHVtbk1vZGVsLCBncmlkUGFuZWwsIHRoaXMsIGZpbHRlck1hbmFnZXIsXHJcbiAgICAgICAgJHNjb3BlLCAkY29tcGlsZSwgZXhwcmVzc2lvblNlcnZpY2UpO1xyXG4gICAgaW5NZW1vcnlSb3dDb250cm9sbGVyLmluaXQoZ3JpZE9wdGlvbnNXcmFwcGVyLCBjb2x1bW5Nb2RlbCwgdGhpcywgZmlsdGVyTWFuYWdlciwgJHNjb3BlLCBleHByZXNzaW9uU2VydmljZSk7XHJcbiAgICB2aXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIuaW5pdChyb3dSZW5kZXJlciwgZ3JpZE9wdGlvbnNXcmFwcGVyLCB0aGlzKTtcclxuICAgIGdyaWRQYW5lbC5pbml0KGNvbHVtbk1vZGVsLCByb3dSZW5kZXJlcik7XHJcblxyXG4gICAgdmFyIHRvb2xQYW5lbExheW91dCA9IG51bGw7XHJcbiAgICB2YXIgZVRvb2xQYW5lbCA9IG51bGw7XHJcbiAgICBpZiAoIWZvclByaW50KSB7XHJcbiAgICAgICAgZVRvb2xQYW5lbCA9IG5ldyBUb29sUGFuZWwoKTtcclxuICAgICAgICB0b29sUGFuZWxMYXlvdXQgPSBlVG9vbFBhbmVsLmxheW91dDtcclxuICAgICAgICBlVG9vbFBhbmVsLmluaXQoY29sdW1uQ29udHJvbGxlciwgaW5NZW1vcnlSb3dDb250cm9sbGVyLCBncmlkT3B0aW9uc1dyYXBwZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoaXMgaXMgYSBjaGlsZCBiZWFuLCBnZXQgYSByZWZlcmVuY2UgYW5kIHBhc3MgaXQgb25cclxuICAgIC8vIENBTiBXRSBERUxFVEUgVEhJUz8gaXQncyBkb25lIGluIHRoZSBzZXREYXRhc291cmNlIHNlY3Rpb25cclxuICAgIHZhciByb3dNb2RlbCA9IGluTWVtb3J5Um93Q29udHJvbGxlci5nZXRNb2RlbCgpO1xyXG4gICAgc2VsZWN0aW9uQ29udHJvbGxlci5zZXRSb3dNb2RlbChyb3dNb2RlbCk7XHJcbiAgICBmaWx0ZXJNYW5hZ2VyLnNldFJvd01vZGVsKHJvd01vZGVsKTtcclxuICAgIHJvd1JlbmRlcmVyLnNldFJvd01vZGVsKHJvd01vZGVsKTtcclxuICAgIGdyaWRQYW5lbC5zZXRSb3dNb2RlbChyb3dNb2RlbCk7XHJcblxyXG4gICAgLy8gYW5kIHRoZSBsYXN0IGJlYW4sIGRvbmUgaW4gaXQncyBvd24gc2VjdGlvbiwgYXMgaXQncyBvcHRpb25hbFxyXG4gICAgdmFyIHBhZ2luYXRpb25Db250cm9sbGVyID0gbnVsbDtcclxuICAgIHZhciBwYWdpbmF0aW9uR3VpID0gbnVsbDtcclxuICAgIGlmICghZm9yUHJpbnQpIHtcclxuICAgICAgICBwYWdpbmF0aW9uQ29udHJvbGxlciA9IG5ldyBQYWdpbmF0aW9uQ29udHJvbGxlcigpO1xyXG4gICAgICAgIHBhZ2luYXRpb25Db250cm9sbGVyLmluaXQodGhpcywgZ3JpZE9wdGlvbnNXcmFwcGVyKTtcclxuICAgICAgICBwYWdpbmF0aW9uR3VpID0gcGFnaW5hdGlvbkNvbnRyb2xsZXIuZ2V0R3VpKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yb3dNb2RlbCA9IHJvd01vZGVsO1xyXG4gICAgdGhpcy5zZWxlY3Rpb25Db250cm9sbGVyID0gc2VsZWN0aW9uQ29udHJvbGxlcjtcclxuICAgIHRoaXMuY29sdW1uQ29udHJvbGxlciA9IGNvbHVtbkNvbnRyb2xsZXI7XHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsID0gY29sdW1uTW9kZWw7XHJcbiAgICB0aGlzLmluTWVtb3J5Um93Q29udHJvbGxlciA9IGluTWVtb3J5Um93Q29udHJvbGxlcjtcclxuICAgIHRoaXMudmlydHVhbFBhZ2VSb3dDb250cm9sbGVyID0gdmlydHVhbFBhZ2VSb3dDb250cm9sbGVyO1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlciA9IHJvd1JlbmRlcmVyO1xyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlciA9IGhlYWRlclJlbmRlcmVyO1xyXG4gICAgdGhpcy5wYWdpbmF0aW9uQ29udHJvbGxlciA9IHBhZ2luYXRpb25Db250cm9sbGVyO1xyXG4gICAgdGhpcy5maWx0ZXJNYW5hZ2VyID0gZmlsdGVyTWFuYWdlcjtcclxuICAgIHRoaXMuZVRvb2xQYW5lbCA9IGVUb29sUGFuZWw7XHJcbiAgICB0aGlzLmdyaWRQYW5lbCA9IGdyaWRQYW5lbDtcclxuXHJcbiAgICB0aGlzLmVSb290UGFuZWwgPSBuZXcgQm9yZGVyTGF5b3V0KHtcclxuICAgICAgICBjZW50ZXI6IGdyaWRQYW5lbC5sYXlvdXQsXHJcbiAgICAgICAgZWFzdDogdG9vbFBhbmVsTGF5b3V0LFxyXG4gICAgICAgIHNvdXRoOiBwYWdpbmF0aW9uR3VpLFxyXG4gICAgICAgIGRvbnRGaWxsOiBmb3JQcmludCxcclxuICAgICAgICBuYW1lOiAnZVJvb3RQYW5lbCdcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIGRlZmF1bHQgaXMgd2UgZG9uJ3Qgc2hvdyBwYWdpbmcgcGFuZWwsIHRoaXMgaXMgc2V0IHRvIHRydWUgd2hlbiBkYXRhc291cmNlIGlzIHNldFxyXG4gICAgdGhpcy5lUm9vdFBhbmVsLnNldFNvdXRoVmlzaWJsZShmYWxzZSk7XHJcblxyXG4gICAgLy8gc2VlIHdoYXQgdGhlIGdyaWQgb3B0aW9ucyBhcmUgZm9yIGRlZmF1bHQgb2YgdG9vbGJhclxyXG4gICAgdGhpcy5zaG93VG9vbFBhbmVsKGdyaWRPcHRpb25zV3JhcHBlci5pc1Nob3dUb29sUGFuZWwoKSk7XHJcblxyXG4gICAgZVVzZXJQcm92aWRlZERpdi5hcHBlbmRDaGlsZCh0aGlzLmVSb290UGFuZWwuZ2V0R3VpKCkpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2hvd1Rvb2xQYW5lbCA9IGZ1bmN0aW9uKHNob3cpIHtcclxuICAgIGlmICghdGhpcy5lVG9vbFBhbmVsKSB7XHJcbiAgICAgICAgdGhpcy50b29sUGFuZWxTaG93aW5nID0gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudG9vbFBhbmVsU2hvd2luZyA9IHNob3c7XHJcbiAgICB0aGlzLmVSb290UGFuZWwuc2V0RWFzdFZpc2libGUoc2hvdyk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5pc1Rvb2xQYW5lbFNob3dpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLnRvb2xQYW5lbFNob3dpbmc7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zZXREYXRhc291cmNlID0gZnVuY3Rpb24oZGF0YXNvdXJjZSkge1xyXG4gICAgLy8gaWYgZGF0YXNvdXJjZSBwcm92aWRlZCwgdGhlbiBzZXQgaXRcclxuICAgIGlmIChkYXRhc291cmNlKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5kYXRhc291cmNlID0gZGF0YXNvdXJjZTtcclxuICAgIH1cclxuICAgIC8vIGdldCB0aGUgc2V0IGRhdGFzb3VyY2UgKGlmIG51bGwgd2FzIHBhc3NlZCB0byB0aGlzIG1ldGhvZCxcclxuICAgIC8vIHRoZW4gbmVlZCB0byBnZXQgdGhlIGFjdHVhbCBkYXRhc291cmNlIGZyb20gb3B0aW9uc1xyXG4gICAgdmFyIGRhdGFzb3VyY2VUb1VzZSA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldERhdGFzb3VyY2UoKTtcclxuICAgIHRoaXMuZG9pbmdWaXJ0dWFsUGFnaW5nID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNWaXJ0dWFsUGFnaW5nKCkgJiYgZGF0YXNvdXJjZVRvVXNlO1xyXG4gICAgdGhpcy5kb2luZ1BhZ2luYXRpb24gPSBkYXRhc291cmNlVG9Vc2UgJiYgIXRoaXMuZG9pbmdWaXJ0dWFsUGFnaW5nO1xyXG4gICAgdmFyIHNob3dQYWdpbmdQYW5lbDtcclxuXHJcbiAgICBpZiAodGhpcy5kb2luZ1ZpcnR1YWxQYWdpbmcpIHtcclxuICAgICAgICB0aGlzLnBhZ2luYXRpb25Db250cm9sbGVyLnNldERhdGFzb3VyY2UobnVsbCk7XHJcbiAgICAgICAgdGhpcy52aXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIuc2V0RGF0YXNvdXJjZShkYXRhc291cmNlVG9Vc2UpO1xyXG4gICAgICAgIHRoaXMucm93TW9kZWwgPSB0aGlzLnZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5nZXRNb2RlbCgpO1xyXG4gICAgICAgIHNob3dQYWdpbmdQYW5lbCA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLmRvaW5nUGFnaW5hdGlvbikge1xyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkNvbnRyb2xsZXIuc2V0RGF0YXNvdXJjZShkYXRhc291cmNlVG9Vc2UpO1xyXG4gICAgICAgIHRoaXMudmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnNldERhdGFzb3VyY2UobnVsbCk7XHJcbiAgICAgICAgdGhpcy5yb3dNb2RlbCA9IHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyLmdldE1vZGVsKCk7XHJcbiAgICAgICAgc2hvd1BhZ2luZ1BhbmVsID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uQ29udHJvbGxlci5zZXREYXRhc291cmNlKG51bGwpO1xyXG4gICAgICAgIHRoaXMudmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnNldERhdGFzb3VyY2UobnVsbCk7XHJcbiAgICAgICAgdGhpcy5yb3dNb2RlbCA9IHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyLmdldE1vZGVsKCk7XHJcbiAgICAgICAgc2hvd1BhZ2luZ1BhbmVsID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zZWxlY3Rpb25Db250cm9sbGVyLnNldFJvd01vZGVsKHRoaXMucm93TW9kZWwpO1xyXG4gICAgdGhpcy5maWx0ZXJNYW5hZ2VyLnNldFJvd01vZGVsKHRoaXMucm93TW9kZWwpO1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlci5zZXRSb3dNb2RlbCh0aGlzLnJvd01vZGVsKTtcclxuXHJcbiAgICB0aGlzLmVSb290UGFuZWwuc2V0U291dGhWaXNpYmxlKHNob3dQYWdpbmdQYW5lbCk7XHJcblxyXG4gICAgLy8gYmVjYXVzZSB3ZSBqdXN0IHNldCB0aGUgcm93TW9kZWwsIG5lZWQgdG8gdXBkYXRlIHRoZSBndWlcclxuICAgIHRoaXMucm93UmVuZGVyZXIucmVmcmVzaFZpZXcoKTtcclxuXHJcbiAgICB0aGlzLmRvTGF5b3V0KCk7XHJcbn07XHJcblxyXG4vLyBnZXRzIGNhbGxlZCBhZnRlciBjb2x1bW5zIGFyZSBzaG93biAvIGhpZGRlbiBmcm9tIGdyb3VwcyBleHBhbmRpbmdcclxuR3JpZC5wcm90b3R5cGUucmVmcmVzaEhlYWRlckFuZEJvZHkgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuaGVhZGVyUmVuZGVyZXIucmVmcmVzaEhlYWRlcigpO1xyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci51cGRhdGVGaWx0ZXJJY29ucygpO1xyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci51cGRhdGVTb3J0SWNvbnMoKTtcclxuICAgIHRoaXMuZ3JpZFBhbmVsLnNldEJvZHlDb250YWluZXJXaWR0aCgpO1xyXG4gICAgdGhpcy5ncmlkUGFuZWwuc2V0UGlubmVkQ29sQ29udGFpbmVyV2lkdGgoKTtcclxuICAgIHRoaXMucm93UmVuZGVyZXIucmVmcmVzaFZpZXcoKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNldEZpbmlzaGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5kb0xheW91dCk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5nZXRQb3B1cFBhcmVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZVJvb3RQYW5lbC5nZXRHdWkoKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmdldFF1aWNrRmlsdGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5xdWlja0ZpbHRlcjtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLm9uUXVpY2tGaWx0ZXJDaGFuZ2VkID0gZnVuY3Rpb24obmV3RmlsdGVyKSB7XHJcbiAgICBpZiAobmV3RmlsdGVyID09PSB1bmRlZmluZWQgfHwgbmV3RmlsdGVyID09PSBcIlwiKSB7XHJcbiAgICAgICAgbmV3RmlsdGVyID0gbnVsbDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnF1aWNrRmlsdGVyICE9PSBuZXdGaWx0ZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNWaXJ0dWFsUGFnaW5nKCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdhZy1ncmlkOiBjYW5ub3QgZG8gcXVpY2sgZmlsdGVyaW5nIHdoZW4gZG9pbmcgdmlydHVhbCBwYWdpbmcnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy93YW50ICdudWxsJyB0byBtZWFuIHRvIGZpbHRlciwgc28gcmVtb3ZlIHVuZGVmaW5lZCBhbmQgZW1wdHkgc3RyaW5nXHJcbiAgICAgICAgaWYgKG5ld0ZpbHRlciA9PT0gdW5kZWZpbmVkIHx8IG5ld0ZpbHRlciA9PT0gXCJcIikge1xyXG4gICAgICAgICAgICBuZXdGaWx0ZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobmV3RmlsdGVyICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIG5ld0ZpbHRlciA9IG5ld0ZpbHRlci50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnF1aWNrRmlsdGVyID0gbmV3RmlsdGVyO1xyXG4gICAgICAgIHRoaXMub25GaWx0ZXJDaGFuZ2VkKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5vbkZpbHRlckNoYW5nZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuaGVhZGVyUmVuZGVyZXIudXBkYXRlRmlsdGVySWNvbnMoKTtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0VuYWJsZVNlcnZlclNpZGVGaWx0ZXIoKSkge1xyXG4gICAgICAgIC8vIGlmIGRvaW5nIHNlcnZlciBzaWRlIGZpbHRlcmluZywgY2hhbmdpbmcgdGhlIHNvcnQgaGFzIHRoZSBpbXBhY3RcclxuICAgICAgICAvLyBvZiByZXNldHRpbmcgdGhlIGRhdGFzb3VyY2VcclxuICAgICAgICB0aGlzLnNldERhdGFzb3VyY2UoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gaWYgZG9pbmcgaW4gbWVtb3J5IGZpbHRlcmluZywgd2UganVzdCB1cGRhdGUgdGhlIGluIG1lbW9yeSBkYXRhXHJcbiAgICAgICAgdGhpcy51cGRhdGVNb2RlbEFuZFJlZnJlc2goY29uc3RhbnRzLlNURVBfRklMVEVSKTtcclxuICAgIH1cclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLm9uUm93Q2xpY2tlZCA9IGZ1bmN0aW9uKGV2ZW50LCByb3dJbmRleCwgbm9kZSkge1xyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLnJvd0NsaWNrZWQpIHtcclxuICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgIGV2ZW50OiBldmVudCxcclxuICAgICAgICAgICAgcm93SW5kZXg6IHJvd0luZGV4XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zLnJvd0NsaWNrZWQocGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB3ZSBkbyBub3QgYWxsb3cgc2VsZWN0aW5nIGdyb3VwcyBieSBjbGlja2luZyAoYXMgdGhlIGNsaWNrIGhlcmUgZXhwYW5kcyB0aGUgZ3JvdXApXHJcbiAgICAvLyBzbyByZXR1cm4gaWYgaXQncyBhIGdyb3VwIHJvd1xyXG4gICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbWFraW5nIGxvY2FsIHZhcmlhYmxlcyB0byBtYWtlIHRoZSBiZWxvdyBtb3JlIHJlYWRhYmxlXHJcbiAgICB2YXIgZ3JpZE9wdGlvbnNXcmFwcGVyID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB2YXIgc2VsZWN0aW9uQ29udHJvbGxlciA9IHRoaXMuc2VsZWN0aW9uQ29udHJvbGxlcjtcclxuXHJcbiAgICAvLyBpZiBubyBzZWxlY3Rpb24gbWV0aG9kIGVuYWJsZWQsIGRvIG5vdGhpbmdcclxuICAgIGlmICghZ3JpZE9wdGlvbnNXcmFwcGVyLmlzUm93U2VsZWN0aW9uKCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgY2xpY2sgc2VsZWN0aW9uIHN1cHByZXNzZWQsIGRvIG5vdGhpbmdcclxuICAgIGlmIChncmlkT3B0aW9uc1dyYXBwZXIuaXNTdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uKCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY3RybEtleSBmb3Igd2luZG93cywgbWV0YUtleSBmb3IgQXBwbGVcclxuICAgIHZhciBjdHJsS2V5UHJlc3NlZCA9IGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleTtcclxuXHJcbiAgICB2YXIgZG9EZXNlbGVjdCA9IGN0cmxLZXlQcmVzc2VkXHJcbiAgICAgICAgJiYgc2VsZWN0aW9uQ29udHJvbGxlci5pc05vZGVTZWxlY3RlZChub2RlKVxyXG4gICAgICAgICYmIGdyaWRPcHRpb25zV3JhcHBlci5pc1Jvd0Rlc2VsZWN0aW9uKCkgO1xyXG5cclxuICAgIGlmIChkb0Rlc2VsZWN0KSB7XHJcbiAgICAgICAgc2VsZWN0aW9uQ29udHJvbGxlci5kZXNlbGVjdE5vZGUobm9kZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciB0cnlNdWx0aSA9IGN0cmxLZXlQcmVzc2VkO1xyXG4gICAgICAgIHNlbGVjdGlvbkNvbnRyb2xsZXIuc2VsZWN0Tm9kZShub2RlLCB0cnlNdWx0aSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zaG93TG9hZGluZ1BhbmVsID0gZnVuY3Rpb24oc2hvdykge1xyXG4gICAgdGhpcy5ncmlkUGFuZWwuc2hvd0xvYWRpbmcoc2hvdyk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zZXR1cENvbHVtbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZ3JpZFBhbmVsLnNldEhlYWRlckhlaWdodCgpO1xyXG4gICAgdGhpcy5jb2x1bW5Db250cm9sbGVyLnNldENvbHVtbnModGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29sdW1uRGVmcygpKTtcclxuICAgIHRoaXMuZ3JpZFBhbmVsLnNob3dQaW5uZWRDb2xDb250YWluZXJzSWZOZWVkZWQoKTtcclxuICAgIHRoaXMuaGVhZGVyUmVuZGVyZXIucmVmcmVzaEhlYWRlcigpO1xyXG4gICAgaWYgKCF0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0RvbnRVc2VTY3JvbGxzKCkpIHtcclxuICAgICAgICB0aGlzLmdyaWRQYW5lbC5zZXRQaW5uZWRDb2xDb250YWluZXJXaWR0aCgpO1xyXG4gICAgICAgIHRoaXMuZ3JpZFBhbmVsLnNldEJvZHlDb250YWluZXJXaWR0aCgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci51cGRhdGVGaWx0ZXJJY29ucygpO1xyXG59O1xyXG5cclxuLy8gcm93c1RvUmVmcmVzaCBpcyBhdCB3aGF0IGluZGV4IHRvIHN0YXJ0IHJlZnJlc2hpbmcgdGhlIHJvd3MuIHRoZSBhc3N1bXB0aW9uIGlzXHJcbi8vIGlmIHdlIGFyZSBleHBhbmRpbmcgb3IgY29sbGFwc2luZyBhIGdyb3VwLCB0aGVuIG9ubHkgaGUgcm93cyBiZWxvdyB0aGUgZ3JvdXBcclxuLy8gbmVlZCB0byBiZSByZWZyZXNoLiB0aGlzIGFsbG93cyB0aGUgY29udGV4dCAoZWcgZm9jdXMpIG9mIHRoZSBvdGhlciBjZWxscyB0b1xyXG4vLyByZW1haW4uXHJcbkdyaWQucHJvdG90eXBlLnVwZGF0ZU1vZGVsQW5kUmVmcmVzaCA9IGZ1bmN0aW9uKHN0ZXAsIHJlZnJlc2hGcm9tSW5kZXgpIHtcclxuICAgIHRoaXMuaW5NZW1vcnlSb3dDb250cm9sbGVyLnVwZGF0ZU1vZGVsKHN0ZXApO1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlci5yZWZyZXNoVmlldyhyZWZyZXNoRnJvbUluZGV4KTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnNldFJvd3MgPSBmdW5jdGlvbihyb3dzLCBmaXJzdElkKSB7XHJcbiAgICBpZiAocm93cykge1xyXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMucm93RGF0YSA9IHJvd3M7XHJcbiAgICB9XHJcbiAgICB0aGlzLmluTWVtb3J5Um93Q29udHJvbGxlci5zZXRBbGxSb3dzKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFsbFJvd3MoKSwgZmlyc3RJZCk7XHJcbiAgICB0aGlzLnNlbGVjdGlvbkNvbnRyb2xsZXIuZGVzZWxlY3RBbGwoKTtcclxuICAgIHRoaXMuZmlsdGVyTWFuYWdlci5vbk5ld1Jvd3NMb2FkZWQoKTtcclxuICAgIHRoaXMudXBkYXRlTW9kZWxBbmRSZWZyZXNoKGNvbnN0YW50cy5TVEVQX0VWRVJZVEhJTkcpO1xyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci51cGRhdGVGaWx0ZXJJY29ucygpO1xyXG4gICAgdGhpcy5zaG93TG9hZGluZ1BhbmVsKGZhbHNlKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmVuc3VyZU5vZGVWaXNpYmxlID0gZnVuY3Rpb24oY29tcGFyYXRvcikge1xyXG4gICAgaWYgKHRoaXMuZG9pbmdWaXJ0dWFsUGFnaW5nKSB7XHJcbiAgICAgICAgdGhyb3cgJ0Nhbm5vdCB1c2UgZW5zdXJlTm9kZVZpc2libGUgd2hlbiBkb2luZyB2aXJ0dWFsIHBhZ2luZywgYXMgd2UgY2Fubm90IGNoZWNrIHJvd3MgdGhhdCBhcmUgbm90IGluIG1lbW9yeSc7XHJcbiAgICB9XHJcbiAgICAvLyBsb29rIGZvciB0aGUgbm9kZSBpbmRleCB3ZSB3YW50IHRvIGRpc3BsYXlcclxuICAgIHZhciByb3dDb3VudCA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvd0NvdW50KCk7XHJcbiAgICB2YXIgY29tcGFyYXRvcklzQUZ1bmN0aW9uID0gdHlwZW9mIGNvbXBhcmF0b3IgPT09ICdmdW5jdGlvbic7XHJcbiAgICB2YXIgaW5kZXhUb1NlbGVjdCA9IC0xO1xyXG4gICAgLy8gZ28gdGhyb3VnaCBhbGwgdGhlIG5vZGVzLCBmaW5kIHRoZSBvbmUgd2Ugd2FudCB0byBzaG93XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvd0NvdW50OyBpKyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvdyhpKTtcclxuICAgICAgICBpZiAoY29tcGFyYXRvcklzQUZ1bmN0aW9uKSB7XHJcbiAgICAgICAgICAgIGlmIChjb21wYXJhdG9yKG5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleFRvU2VsZWN0ID0gaTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gY2hlY2sgb2JqZWN0IGVxdWFsaXR5IGFnYWluc3Qgbm9kZSBhbmQgZGF0YVxyXG4gICAgICAgICAgICBpZiAoY29tcGFyYXRvciA9PT0gbm9kZSB8fCBjb21wYXJhdG9yID09PSBub2RlLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4VG9TZWxlY3QgPSBpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoaW5kZXhUb1NlbGVjdCA+PSAwKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkUGFuZWwuZW5zdXJlSW5kZXhWaXNpYmxlKGluZGV4VG9TZWxlY3QpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuZ2V0RmlsdGVyTW9kZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmZpbHRlck1hbmFnZXIuZ2V0RmlsdGVyTW9kZWwoKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmFkZEFwaSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIGFwaSA9IHtcclxuICAgICAgICBzZXREYXRhc291cmNlOiBmdW5jdGlvbihkYXRhc291cmNlKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YXNvdXJjZShkYXRhc291cmNlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uTmV3RGF0YXNvdXJjZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0RGF0YXNvdXJjZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0Um93czogZnVuY3Rpb24ocm93cykge1xyXG4gICAgICAgICAgICB0aGF0LnNldFJvd3Mocm93cyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbk5ld1Jvd3M6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LnNldFJvd3MoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uTmV3Q29sczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoYXQub25OZXdDb2xzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1bnNlbGVjdEFsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJ1bnNlbGVjdEFsbCBkZXByZWNhdGVkLCBjYWxsIGRlc2VsZWN0QWxsIGluc3RlYWRcIik7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RBbGwoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlZnJlc2hWaWV3OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5yb3dSZW5kZXJlci5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc29mdFJlZnJlc2hWaWV3OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5yb3dSZW5kZXJlci5zb2Z0UmVmcmVzaFZpZXcoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlZnJlc2hHcm91cFJvd3M6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LnJvd1JlbmRlcmVyLnJlZnJlc2hHcm91cFJvd3MoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlZnJlc2hIZWFkZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBuZWVkIHRvIHJldmlldyB0aGlzIC0gdGhlIHJlZnJlc2hIZWFkZXIgc2hvdWxkIGFsc28gcmVmcmVzaCBhbGwgaWNvbnMgaW4gdGhlIGhlYWRlclxyXG4gICAgICAgICAgICB0aGF0LmhlYWRlclJlbmRlcmVyLnJlZnJlc2hIZWFkZXIoKTtcclxuICAgICAgICAgICAgdGhhdC5oZWFkZXJSZW5kZXJlci51cGRhdGVGaWx0ZXJJY29ucygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0TW9kZWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5yb3dNb2RlbDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uR3JvdXBFeHBhbmRlZE9yQ29sbGFwc2VkOiBmdW5jdGlvbihyZWZyZXNoRnJvbUluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoYXQudXBkYXRlTW9kZWxBbmRSZWZyZXNoKGNvbnN0YW50cy5TVEVQX01BUCwgcmVmcmVzaEZyb21JbmRleCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBleHBhbmRBbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LmluTWVtb3J5Um93Q29udHJvbGxlci5leHBhbmRPckNvbGxhcHNlQWxsKHRydWUsIG51bGwpO1xyXG4gICAgICAgICAgICB0aGF0LnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9NQVApO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29sbGFwc2VBbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LmluTWVtb3J5Um93Q29udHJvbGxlci5leHBhbmRPckNvbGxhcHNlQWxsKGZhbHNlLCBudWxsKTtcclxuICAgICAgICAgICAgdGhhdC51cGRhdGVNb2RlbEFuZFJlZnJlc2goY29uc3RhbnRzLlNURVBfTUFQKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZFZpcnR1YWxSb3dMaXN0ZW5lcjogZnVuY3Rpb24ocm93SW5kZXgsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHRoYXQuYWRkVmlydHVhbFJvd0xpc3RlbmVyKHJvd0luZGV4LCBjYWxsYmFjayk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByb3dEYXRhQ2hhbmdlZDogZnVuY3Rpb24ocm93cykge1xyXG4gICAgICAgICAgICB0aGF0LnJvd1JlbmRlcmVyLnJvd0RhdGFDaGFuZ2VkKHJvd3MpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0UXVpY2tGaWx0ZXI6IGZ1bmN0aW9uKG5ld0ZpbHRlcikge1xyXG4gICAgICAgICAgICB0aGF0Lm9uUXVpY2tGaWx0ZXJDaGFuZ2VkKG5ld0ZpbHRlcilcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdEluZGV4OiBmdW5jdGlvbihpbmRleCwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5zZWxlY3RJbmRleChpbmRleCwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlc2VsZWN0SW5kZXg6IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5kZXNlbGVjdEluZGV4KGluZGV4KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdE5vZGU6IGZ1bmN0aW9uKG5vZGUsIHRyeU11bHRpLCBzdXBwcmVzc0V2ZW50cykge1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuc2VsZWN0Tm9kZShub2RlLCB0cnlNdWx0aSwgc3VwcHJlc3NFdmVudHMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVzZWxlY3ROb2RlOiBmdW5jdGlvbihub2RlKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5kZXNlbGVjdE5vZGUobm9kZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZWxlY3RBbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuc2VsZWN0QWxsKCk7XHJcbiAgICAgICAgICAgIHRoYXQucm93UmVuZGVyZXIucmVmcmVzaFZpZXcoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlc2VsZWN0QWxsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLmRlc2VsZWN0QWxsKCk7XHJcbiAgICAgICAgICAgIHRoYXQucm93UmVuZGVyZXIucmVmcmVzaFZpZXcoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlY29tcHV0ZUFnZ3JlZ2F0ZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGF0LmluTWVtb3J5Um93Q29udHJvbGxlci5kb0FnZ3JlZ2F0ZSgpO1xyXG4gICAgICAgICAgICB0aGF0LnJvd1JlbmRlcmVyLnJlZnJlc2hHcm91cFJvd3MoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNpemVDb2x1bW5zVG9GaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2FnLWdyaWQ6IHNpemVDb2x1bW5zVG9GaXQgZG9lcyBub3Qgd29yayB3aGVuIGRvbnRVc2VTY3JvbGxzPXRydWUnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgYXZhaWxhYmxlV2lkdGggPSB0aGF0LmdyaWRQYW5lbC5nZXRXaWR0aEZvclNpemVDb2xzVG9GaXQoKTtcclxuICAgICAgICAgICAgdGhhdC5jb2x1bW5Db250cm9sbGVyLnNpemVDb2x1bW5zVG9GaXQoYXZhaWxhYmxlV2lkdGgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2hvd0xvYWRpbmc6IGZ1bmN0aW9uKHNob3cpIHtcclxuICAgICAgICAgICAgdGhhdC5zaG93TG9hZGluZ1BhbmVsKHNob3cpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNOb2RlU2VsZWN0ZWQ6IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5pc05vZGVTZWxlY3RlZChub2RlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFNlbGVjdGVkTm9kZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLmdldFNlbGVjdGVkTm9kZXMoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldEJlc3RDb3N0Tm9kZVNlbGVjdGlvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuZ2V0QmVzdENvc3ROb2RlU2VsZWN0aW9uKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnN1cmVDb2xJbmRleFZpc2libGU6IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoYXQuZ3JpZFBhbmVsLmVuc3VyZUNvbEluZGV4VmlzaWJsZShpbmRleCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnN1cmVJbmRleFZpc2libGU6IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoYXQuZ3JpZFBhbmVsLmVuc3VyZUluZGV4VmlzaWJsZShpbmRleCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnN1cmVOb2RlVmlzaWJsZTogZnVuY3Rpb24oY29tcGFyYXRvcikge1xyXG4gICAgICAgICAgICB0aGF0LmVuc3VyZU5vZGVWaXNpYmxlKGNvbXBhcmF0b3IpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9yRWFjaEluTWVtb3J5OiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICB0aGF0LnJvd01vZGVsLmZvckVhY2hJbk1lbW9yeShjYWxsYmFjayk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRGaWx0ZXJBcGlGb3JDb2xEZWY6IGZ1bmN0aW9uKGNvbERlZikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2FnLWdyaWQgQVBJIG1ldGhvZCBnZXRGaWx0ZXJBcGlGb3JDb2xEZWYgZGVwcmVjYXRlZCwgdXNlIGdldEZpbHRlckFwaSBpbnN0ZWFkJyk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpbHRlckFwaShjb2xEZWYpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0RmlsdGVyQXBpOiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGNvbHVtbiA9IHRoYXQuY29sdW1uTW9kZWwuZ2V0Q29sdW1uKGtleSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmZpbHRlck1hbmFnZXIuZ2V0RmlsdGVyQXBpKGNvbHVtbik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRDb2x1bW5EZWY6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgY29sdW1uID0gdGhhdC5jb2x1bW5Nb2RlbC5nZXRDb2x1bW4oa2V5KTtcclxuICAgICAgICAgICAgaWYgKGNvbHVtbikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbHVtbi5jb2xEZWY7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25GaWx0ZXJDaGFuZ2VkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5vbkZpbHRlckNoYW5nZWQoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldFNvcnRNb2RlbDogZnVuY3Rpb24oc29ydE1vZGVsKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0U29ydE1vZGVsKHNvcnRNb2RlbCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRTb3J0TW9kZWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5nZXRTb3J0TW9kZWwoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldEZpbHRlck1vZGVsOiBmdW5jdGlvbihtb2RlbCkge1xyXG4gICAgICAgICAgICB0aGF0LmZpbHRlck1hbmFnZXIuc2V0RmlsdGVyTW9kZWwobW9kZWwpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0RmlsdGVyTW9kZWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5nZXRGaWx0ZXJNb2RlbCgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0Rm9jdXNlZENlbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5yb3dSZW5kZXJlci5nZXRGb2N1c2VkQ2VsbCgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0Rm9jdXNlZENlbGw6IGZ1bmN0aW9uKHJvd0luZGV4LCBjb2xJbmRleCkge1xyXG4gICAgICAgICAgICB0aGF0LnNldEZvY3VzZWRDZWxsKHJvd0luZGV4LCBjb2xJbmRleCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaG93VG9vbFBhbmVsOiBmdW5jdGlvbihzaG93KSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2hvd1Rvb2xQYW5lbChzaG93KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzVG9vbFBhbmVsU2hvd2luZzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmlzVG9vbFBhbmVsU2hvd2luZygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaGlkZUNvbHVtbjogZnVuY3Rpb24oY29sSWQsIGhpZGUpIHtcclxuICAgICAgICAgICAgdGhhdC5jb2x1bW5Db250cm9sbGVyLmhpZGVDb2x1bW5zKFtjb2xJZF0sIGhpZGUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaGlkZUNvbHVtbnM6IGZ1bmN0aW9uKGNvbElkcywgaGlkZSkge1xyXG4gICAgICAgICAgICB0aGF0LmNvbHVtbkNvbnRyb2xsZXIuaGlkZUNvbHVtbnMoY29sSWRzLCBoaWRlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhpcy5ncmlkT3B0aW9ucy5hcGkgPSBhcGk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5zZXRGb2N1c2VkQ2VsbCA9IGZ1bmN0aW9uKHJvd0luZGV4LCBjb2xJbmRleCkge1xyXG4gICAgdGhpcy5ncmlkUGFuZWwuZW5zdXJlSW5kZXhWaXNpYmxlKHJvd0luZGV4KTtcclxuICAgIHRoaXMuZ3JpZFBhbmVsLmVuc3VyZUNvbEluZGV4VmlzaWJsZShjb2xJbmRleCk7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGF0LnJvd1JlbmRlcmVyLnNldEZvY3VzZWRDZWxsKHJvd0luZGV4LCBjb2xJbmRleCk7XHJcbiAgICB9LCAxMCk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5nZXRTb3J0TW9kZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBhbGxDb2x1bW5zID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRBbGxDb2x1bW5zKCk7XHJcbiAgICB2YXIgY29sdW1uc1dpdGhTb3J0aW5nID0gW107XHJcbiAgICB2YXIgaTtcclxuICAgIGZvciAoaSA9IDA7IGk8YWxsQ29sdW1ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChhbGxDb2x1bW5zW2ldLnNvcnQpIHtcclxuICAgICAgICAgICAgY29sdW1uc1dpdGhTb3J0aW5nLnB1c2goYWxsQ29sdW1uc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29sdW1uc1dpdGhTb3J0aW5nLnNvcnQoIGZ1bmN0aW9uKGEsYikge1xyXG4gICAgICAgIHJldHVybiBhLnNvcnRlZEF0IC0gYi5zb3J0ZWRBdDtcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgIGZvciAoaSA9IDA7IGk8Y29sdW1uc1dpdGhTb3J0aW5nLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdEVudHJ5ID0ge1xyXG4gICAgICAgICAgICBmaWVsZDogY29sdW1uc1dpdGhTb3J0aW5nW2ldLmNvbERlZi5maWVsZCxcclxuICAgICAgICAgICAgc29ydDogY29sdW1uc1dpdGhTb3J0aW5nW2ldLnNvcnRcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJlc3VsdC5wdXNoKHJlc3VsdEVudHJ5KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUuc2V0U29ydE1vZGVsID0gZnVuY3Rpb24oc29ydE1vZGVsKSB7XHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRW5hYmxlU29ydGluZygpKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdhZy1ncmlkOiBZb3UgYXJlIHNldHRpbmcgdGhlIHNvcnQgbW9kZWwgb24gYSBncmlkIHRoYXQgZG9lcyBub3QgaGF2ZSBzb3J0aW5nIGVuYWJsZWQnKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAvLyBmaXJzdCB1cCwgY2xlYXIgYW55IHByZXZpb3VzIHNvcnRcclxuICAgIHZhciBzb3J0TW9kZWxQcm92aWRlZCA9IHNvcnRNb2RlbCE9PW51bGwgJiYgc29ydE1vZGVsIT09dW5kZWZpbmVkICYmIHNvcnRNb2RlbC5sZW5ndGg+MDtcclxuICAgIHZhciBhbGxDb2x1bW5zID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRBbGxDb2x1bW5zKCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaTxhbGxDb2x1bW5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNvbHVtbiA9IGFsbENvbHVtbnNbaV07XHJcblxyXG4gICAgICAgIHZhciBzb3J0Rm9yQ29sID0gbnVsbDtcclxuICAgICAgICB2YXIgc29ydGVkQXQgPSAtMTtcclxuICAgICAgICBpZiAoc29ydE1vZGVsUHJvdmlkZWQgJiYgIWNvbHVtbi5jb2xEZWYuc3VwcHJlc3NTb3J0aW5nKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqPHNvcnRNb2RlbC5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNvcnRNb2RlbEVudHJ5ID0gc29ydE1vZGVsW2pdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3J0TW9kZWxFbnRyeS5maWVsZCA9PT0gJ3N0cmluZydcclxuICAgICAgICAgICAgICAgICAgICAmJiB0eXBlb2YgY29sdW1uLmNvbERlZi5maWVsZCA9PT0gJ3N0cmluZydcclxuICAgICAgICAgICAgICAgICAgICAmJiBzb3J0TW9kZWxFbnRyeS5maWVsZCA9PT0gY29sdW1uLmNvbERlZi5maWVsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRGb3JDb2wgPSBzb3J0TW9kZWxFbnRyeS5zb3J0O1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRlZEF0ID0gajtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNvcnRGb3JDb2wpIHtcclxuICAgICAgICAgICAgY29sdW1uLnNvcnQgPSBzb3J0Rm9yQ29sO1xyXG4gICAgICAgICAgICBjb2x1bW4uc29ydGVkQXQgPSBzb3J0ZWRBdDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb2x1bW4uc29ydCA9IG51bGw7XHJcbiAgICAgICAgICAgIGNvbHVtbi5zb3J0ZWRBdCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMub25Tb3J0aW5nQ2hhbmdlZCgpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUub25Tb3J0aW5nQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5oZWFkZXJSZW5kZXJlci51cGRhdGVTb3J0SWNvbnMoKTtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0VuYWJsZVNlcnZlclNpZGVTb3J0aW5nKCkpIHtcclxuICAgICAgICAvLyBpZiBkb2luZyBzZXJ2ZXIgc2lkZSBzb3J0aW5nLCBjaGFuZ2luZyB0aGUgc29ydCBoYXMgdGhlIGltcGFjdFxyXG4gICAgICAgIC8vIG9mIHJlc2V0dGluZyB0aGUgZGF0YXNvdXJjZVxyXG4gICAgICAgIHRoaXMuc2V0RGF0YXNvdXJjZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBpZiBkb2luZyBpbiBtZW1vcnkgc29ydGluZywgd2UganVzdCB1cGRhdGUgdGhlIGluIG1lbW9yeSBkYXRhXHJcbiAgICAgICAgdGhpcy51cGRhdGVNb2RlbEFuZFJlZnJlc2goY29uc3RhbnRzLlNURVBfU09SVCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5hZGRWaXJ0dWFsUm93TGlzdGVuZXIgPSBmdW5jdGlvbihyb3dJbmRleCwgY2FsbGJhY2spIHtcclxuICAgIGlmICghdGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XSkge1xyXG4gICAgICAgIHRoaXMudmlydHVhbFJvd0NhbGxiYWNrc1tyb3dJbmRleF0gPSBbXTtcclxuICAgIH1cclxuICAgIHRoaXMudmlydHVhbFJvd0NhbGxiYWNrc1tyb3dJbmRleF0ucHVzaChjYWxsYmFjayk7XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5vblZpcnR1YWxSb3dTZWxlY3RlZCA9IGZ1bmN0aW9uKHJvd0luZGV4LCBzZWxlY3RlZCkge1xyXG4gICAgLy8gaW5mb3JtIHRoZSBjYWxsYmFja3Mgb2YgdGhlIGV2ZW50XHJcbiAgICBpZiAodGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XSkge1xyXG4gICAgICAgIHRoaXMudmlydHVhbFJvd0NhbGxiYWNrc1tyb3dJbmRleF0uZm9yRWFjaChmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrLnJvd1JlbW92ZWQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrLnJvd1NlbGVjdGVkKHNlbGVjdGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUub25WaXJ0dWFsUm93UmVtb3ZlZCA9IGZ1bmN0aW9uKHJvd0luZGV4KSB7XHJcbiAgICAvLyBpbmZvcm0gdGhlIGNhbGxiYWNrcyBvZiB0aGUgZXZlbnRcclxuICAgIGlmICh0aGlzLnZpcnR1YWxSb3dDYWxsYmFja3Nbcm93SW5kZXhdKSB7XHJcbiAgICAgICAgdGhpcy52aXJ0dWFsUm93Q2FsbGJhY2tzW3Jvd0luZGV4XS5mb3JFYWNoKGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sucm93UmVtb3ZlZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sucm93UmVtb3ZlZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvLyByZW1vdmUgdGhlIGNhbGxiYWNrc1xyXG4gICAgZGVsZXRlIHRoaXMudmlydHVhbFJvd0NhbGxiYWNrc1tyb3dJbmRleF07XHJcbn07XHJcblxyXG5HcmlkLnByb3RvdHlwZS5vbk5ld0NvbHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuc2V0dXBDb2x1bW5zKCk7XHJcbiAgICB0aGlzLnVwZGF0ZU1vZGVsQW5kUmVmcmVzaChjb25zdGFudHMuU1RFUF9FVkVSWVRISU5HKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLnVwZGF0ZUJvZHlDb250YWluZXJXaWR0aEFmdGVyQ29sUmVzaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnJvd1JlbmRlcmVyLnNldE1haW5Sb3dXaWR0aHMoKTtcclxuICAgIHRoaXMuZ3JpZFBhbmVsLnNldEJvZHlDb250YWluZXJXaWR0aCgpO1xyXG59O1xyXG5cclxuR3JpZC5wcm90b3R5cGUudXBkYXRlUGlubmVkQ29sQ29udGFpbmVyV2lkdGhBZnRlckNvbFJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5ncmlkUGFuZWwuc2V0UGlubmVkQ29sQ29udGFpbmVyV2lkdGgoKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmRvTGF5b3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBzZXRUaW1lb3V0KHRoaXMuZG9MYXlvdXRGb3JSZWFsLmJpbmQodGhpcyksIDApO1xyXG4gICAgc2V0VGltZW91dCh0aGlzLmRvTGF5b3V0Rm9yUmVhbC5iaW5kKHRoaXMpLCAxMCk7XHJcbiAgICBzZXRUaW1lb3V0KHRoaXMuZG9MYXlvdXRGb3JSZWFsLmJpbmQodGhpcyksIDIwKTtcclxuICAgIC8vc2V0VGltZW91dCh0aGlzLmRvTGF5b3V0Rm9yUmVhbC5iaW5kKHRoaXMpLCA1MDApO1xyXG4gICAgdGhpcy5kb0xheW91dEZvclJlYWwoKTtcclxufTtcclxuXHJcbkdyaWQucHJvdG90eXBlLmRvTGF5b3V0Rm9yUmVhbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gbmVlZCB0byBkbyBsYXlvdXQgZmlyc3QsIGFzIGRyYXdWaXJ0dWFsUm93cyBhbmQgc2V0UGlubmVkQ29sSGVpZ2h0XHJcbiAgICAvLyBuZWVkIHRvIGtub3cgdGhlIHJlc3VsdCBvZiB0aGUgcmVzaXppbmcgb2YgdGhlIHBhbmVscy5cclxuICAgIHRoaXMuZVJvb3RQYW5lbC5kb0xheW91dCgpO1xyXG4gICAgLy8gYm90aCBvZiB0aGUgdHdvIGJlbG93IHNob3VsZCBiZSBkb25lIGluIGdyaWRQYW5lbCwgdGhlIGdyaWRQYW5lbCBzaG91bGQgcmVnaXN0ZXIgJ3Jlc2l6ZScgdG8gdGhlIHBhbmVsXHJcbiAgICB0aGlzLnJvd1JlbmRlcmVyLmRyYXdWaXJ0dWFsUm93cygpO1xyXG4gICAgdGhpcy5ncmlkUGFuZWwuc2V0UGlubmVkQ29sSGVpZ2h0KCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdyaWQ7XHJcbiIsInZhciBERUZBVUxUX1JPV19IRUlHSFQgPSAzMDtcclxuXHJcbnZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xyXG5mdW5jdGlvbiBHcmlkT3B0aW9uc1dyYXBwZXIoZ3JpZE9wdGlvbnMpIHtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnMgPSBncmlkT3B0aW9ucztcclxuICAgIHRoaXMuc2V0dXBEZWZhdWx0cygpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc1RydWUodmFsdWUpIHtcclxuICAgIHJldHVybiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gJ3RydWUnO1xyXG59XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzUm93U2VsZWN0aW9uID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd1NlbGVjdGlvbiA9PT0gXCJzaW5nbGVcIiB8fCB0aGlzLmdyaWRPcHRpb25zLnJvd1NlbGVjdGlvbiA9PT0gXCJtdWx0aXBsZVwiOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzUm93RGVzZWxlY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLnJvd0Rlc2VsZWN0aW9uKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc1Jvd1NlbGVjdGlvbk11bHRpID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd1NlbGVjdGlvbiA9PT0gJ211bHRpcGxlJzsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRDb250ZXh0ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmNvbnRleHQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNWaXJ0dWFsUGFnaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy52aXJ0dWFsUGFnaW5nKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc1Nob3dUb29sUGFuZWwgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLnNob3dUb29sUGFuZWwpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzUm93c0FscmVhZHlHcm91cGVkID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5yb3dzQWxyZWFkeUdyb3VwZWQpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzR3JvdXBTZWxlY3RzQ2hpbGRyZW4gPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLmdyb3VwU2VsZWN0c0NoaWxkcmVuKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0dyb3VwSW5jbHVkZUZvb3RlciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBJbmNsdWRlRm9vdGVyKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc1N1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLnN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb24pOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzU3VwcHJlc3NDZWxsU2VsZWN0aW9uID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5zdXBwcmVzc0NlbGxTZWxlY3Rpb24pOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzU3VwcHJlc3NVblNvcnQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLnN1cHByZXNzVW5Tb3J0KTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc1N1cHByZXNzTXVsdGlTb3J0ID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5zdXBwcmVzc011bHRpU29ydCk7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNHcm91cFN1cHByZXNzQXV0b0NvbHVtbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBTdXBwcmVzc0F1dG9Db2x1bW4pOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzR3JvdXBIZWFkZXJzID0gZnVuY3Rpb24oKSB7IHJldHVybiBpc1RydWUodGhpcy5ncmlkT3B0aW9ucy5ncm91cEhlYWRlcnMpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzRG9udFVzZVNjcm9sbHMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLmRvbnRVc2VTY3JvbGxzKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc1N1cHByZXNzRGVzY1NvcnQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLnN1cHByZXNzRGVzY1NvcnQpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldFJvd1N0eWxlID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd1N0eWxlOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldFJvd0NsYXNzID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd0NsYXNzOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldEhlYWRlckNlbGxSZW5kZXJlciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5oZWFkZXJDZWxsUmVuZGVyZXI7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0QXBpID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmFwaTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0VuYWJsZUNvbFJlc2l6ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5lbmFibGVDb2xSZXNpemU7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0R3JvdXBEZWZhdWx0RXhwYW5kZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBEZWZhdWx0RXhwYW5kZWQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0R3JvdXBLZXlzID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmdyb3VwS2V5czsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRHcm91cEFnZ0Z1bmN0aW9uID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmdyb3VwQWdnRnVuY3Rpb247IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0R3JvdXBBZ2dGaWVsZHMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBBZ2dGaWVsZHM7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0QWxsUm93cyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5yb3dEYXRhOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzR3JvdXBVc2VFbnRpcmVSb3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLmdyb3VwVXNlRW50aXJlUm93KTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRHcm91cENvbHVtbkRlZiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5ncm91cENvbHVtbkRlZjsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0FuZ3VsYXJDb21waWxlUm93cyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuYW5ndWxhckNvbXBpbGVSb3dzKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0FuZ3VsYXJDb21waWxlRmlsdGVycyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuYW5ndWxhckNvbXBpbGVGaWx0ZXJzKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5pc0FuZ3VsYXJDb21waWxlSGVhZGVycyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuYW5ndWxhckNvbXBpbGVIZWFkZXJzKTsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRDb2x1bW5EZWZzID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkRlZnM7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0Um93SGVpZ2h0ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJvd0hlaWdodDsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRNb2RlbFVwZGF0ZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMubW9kZWxVcGRhdGVkOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldENlbGxDbGlja2VkID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmNlbGxDbGlja2VkOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldENlbGxEb3VibGVDbGlja2VkID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmNlbGxEb3VibGVDbGlja2VkOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldENlbGxWYWx1ZUNoYW5nZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuY2VsbFZhbHVlQ2hhbmdlZDsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRDZWxsRm9jdXNlZCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5jZWxsRm9jdXNlZDsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRSb3dTZWxlY3RlZCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5yb3dTZWxlY3RlZDsgfTtcclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRTZWxlY3Rpb25DaGFuZ2VkID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnNlbGVjdGlvbkNoYW5nZWQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0VmlydHVhbFJvd1JlbW92ZWQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMudmlydHVhbFJvd1JlbW92ZWQ7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0RGF0YXNvdXJjZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5kYXRhc291cmNlOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldFJlYWR5ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLnJlYWR5OyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldFJvd0J1ZmZlciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5yb3dCdWZmZXI7IH07XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldEdyb3VwUm93SW5uZXJSZW5kZXJlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBJbm5lclJlbmRlcmVyKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdhZy1ncmlkOiBhcyBvZiB2MS4xMC4wICgyMXN0IEp1biAyMDE1KSBncm91cElubmVyUmVuZGVyZXIgaXMgbndvIGNhbGxlZCBncm91cFJvd0lubmVyUmVuZGVyZXIuIFBsZWFzZSBjaGFuZ2UgeW91IGNvZGUgYXMgZ3JvdXBJbm5lclJlbmRlcmVyIGlzIGRlcHJlY2F0ZWQuJyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuZ3JvdXBJbm5lclJlbmRlcmVyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ncmlkT3B0aW9ucy5ncm91cFJvd0lubmVyUmVuZGVyZXI7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldENvbFdpZHRoID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZ3JpZE9wdGlvbnMuY29sV2lkdGggIT09ICdudW1iZXInIHx8ICB0aGlzLmdyaWRPcHRpb25zLmNvbFdpZHRoIDwgY29uc3RhbnRzLk1JTl9DT0xfV0lEVEgpIHtcclxuICAgICAgICByZXR1cm4gMjAwO1xyXG4gICAgfSBlbHNlICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuY29sV2lkdGg7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzRW5hYmxlU29ydGluZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlU29ydGluZykgfHwgaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlU2VydmVyU2lkZVNvcnRpbmcpOyB9O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmlzRW5hYmxlU2VydmVyU2lkZVNvcnRpbmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLmVuYWJsZVNlcnZlclNpZGVTb3J0aW5nKTsgfTtcclxuXHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNFbmFibGVGaWx0ZXIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGlzVHJ1ZSh0aGlzLmdyaWRPcHRpb25zLmVuYWJsZUZpbHRlcikgfHwgaXNUcnVlKHRoaXMuZ3JpZE9wdGlvbnMuZW5hYmxlU2VydmVyU2lkZUZpbHRlcik7IH07XHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuaXNFbmFibGVTZXJ2ZXJTaWRlRmlsdGVyID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmdyaWRPcHRpb25zLmVuYWJsZVNlcnZlclNpZGVGaWx0ZXI7IH07XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLnNldFNlbGVjdGVkUm93cyA9IGZ1bmN0aW9uKG5ld1NlbGVjdGVkUm93cykge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuc2VsZWN0ZWRSb3dzID0gbmV3U2VsZWN0ZWRSb3dzO1xyXG59O1xyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLnNldFNlbGVjdGVkTm9kZXNCeUlkID0gZnVuY3Rpb24obmV3U2VsZWN0ZWROb2Rlcykge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuc2VsZWN0ZWROb2Rlc0J5SWQgPSBuZXdTZWxlY3RlZE5vZGVzO1xyXG59O1xyXG5cclxuR3JpZE9wdGlvbnNXcmFwcGVyLnByb3RvdHlwZS5nZXRJY29ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuaWNvbnM7XHJcbn07XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldEhlYWRlckhlaWdodCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmdyaWRPcHRpb25zLmhlYWRlckhlaWdodCA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAvLyBpZiBoZWFkZXIgaGVpZ2h0IHByb3ZpZGVkLCB1c2VkIGl0XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JpZE9wdGlvbnMuaGVhZGVySGVpZ2h0O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvdGhlcndpc2UgcmV0dXJuIDI1IGlmIG5vIGdyb3VwaW5nLCA1MCBpZiBncm91cGluZ1xyXG4gICAgICAgIGlmICh0aGlzLmlzR3JvdXBIZWFkZXJzKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDUwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiAyNTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLnNldHVwRGVmYXVsdHMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9ucy5yb3dIZWlnaHQpIHtcclxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zLnJvd0hlaWdodCA9IERFRkFVTFRfUk9XX0hFSUdIVDtcclxuICAgIH1cclxufTtcclxuXHJcbkdyaWRPcHRpb25zV3JhcHBlci5wcm90b3R5cGUuZ2V0UGlubmVkQ29sQ291bnQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGlmIG5vdCB1c2luZyBzY3JvbGxzLCB0aGVuIHBpbm5lZCBjb2x1bW5zIGRvZXNuJ3QgbWFrZVxyXG4gICAgLy8gc2Vuc2UsIHNvIGFsd2F5cyByZXR1cm4gMFxyXG4gICAgaWYgKHRoaXMuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9ucy5waW5uZWRDb2x1bW5Db3VudCkge1xyXG4gICAgICAgIC8vaW4gY2FzZSB1c2VyIHB1dHMgaW4gYSBzdHJpbmcsIGNhc3QgdG8gbnVtYmVyXHJcbiAgICAgICAgcmV0dXJuIE51bWJlcih0aGlzLmdyaWRPcHRpb25zLnBpbm5lZENvbHVtbkNvdW50KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkT3B0aW9uc1dyYXBwZXIucHJvdG90eXBlLmdldExvY2FsZVRleHRGdW5jID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGtleSwgZGVmYXVsdFZhbHVlKSB7XHJcbiAgICAgICAgdmFyIGxvY2FsZVRleHQgPSB0aGF0LmdyaWRPcHRpb25zLmxvY2FsZVRleHQ7XHJcbiAgICAgICAgaWYgKGxvY2FsZVRleHQgJiYgbG9jYWxlVGV4dFtrZXldKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBsb2NhbGVUZXh0W2tleV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHcmlkT3B0aW9uc1dyYXBwZXI7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gXCI8ZGl2PjxkaXYgY2xhc3M9YWctaGVhZGVyPjxkaXYgY2xhc3M9YWctcGlubmVkLWhlYWRlcj48L2Rpdj48ZGl2IGNsYXNzPWFnLWhlYWRlci12aWV3cG9ydD48ZGl2IGNsYXNzPWFnLWhlYWRlci1jb250YWluZXI+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1hZy1ib2R5PjxkaXYgY2xhc3M9YWctcGlubmVkLWNvbHMtdmlld3BvcnQ+PGRpdiBjbGFzcz1hZy1waW5uZWQtY29scy1jb250YWluZXI+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1hZy1ib2R5LXZpZXdwb3J0LXdyYXBwZXI+PGRpdiBjbGFzcz1hZy1ib2R5LXZpZXdwb3J0PjxkaXYgY2xhc3M9YWctYm9keS1jb250YWluZXI+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+XCI7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPGRpdj48ZGl2IGNsYXNzPWFnLWhlYWRlci1jb250YWluZXI+PC9kaXY+PGRpdiBjbGFzcz1hZy1ib2R5LWNvbnRhaW5lcj48L2Rpdj48L2Rpdj5cIjtcbiIsInZhciBncmlkSHRtbCA9IHJlcXVpcmUoJy4vZ3JpZC5odG1sJyk7XHJcbnZhciBncmlkTm9TY3JvbGxzSHRtbCA9IHJlcXVpcmUoJy4vZ3JpZE5vU2Nyb2xscy5odG1sJyk7XHJcbnZhciBsb2FkaW5nSHRtbCA9IHJlcXVpcmUoJy4vbG9hZGluZy5odG1sJyk7XHJcbnZhciBCb3JkZXJMYXlvdXQgPSByZXF1aXJlKCcuLi9sYXlvdXQvYm9yZGVyTGF5b3V0Jyk7XHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcblxyXG5mdW5jdGlvbiBHcmlkUGFuZWwoZ3JpZE9wdGlvbnNXcmFwcGVyKSB7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIC8vIG1ha2VzIGNvZGUgYmVsb3cgbW9yZSByZWFkYWJsZSBpZiB3ZSBwdWxsICdmb3JQcmludCcgb3V0XHJcbiAgICB0aGlzLmZvclByaW50ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpO1xyXG4gICAgdGhpcy5zZXR1cENvbXBvbmVudHMoKTtcclxuICAgIHRoaXMuc2Nyb2xsV2lkdGggPSB1dGlscy5nZXRTY3JvbGxiYXJXaWR0aCgpO1xyXG59XHJcblxyXG5HcmlkUGFuZWwucHJvdG90eXBlLnNldHVwQ29tcG9uZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmICh0aGlzLmZvclByaW50KSB7XHJcbiAgICAgICAgdGhpcy5lUm9vdCA9IHV0aWxzLmxvYWRUZW1wbGF0ZShncmlkTm9TY3JvbGxzSHRtbCk7XHJcbiAgICAgICAgdXRpbHMuYWRkQ3NzQ2xhc3ModGhpcy5lUm9vdCwgJ2FnLXJvb3QgYWctbm8tc2Nyb2xscycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVSb290ID0gdXRpbHMubG9hZFRlbXBsYXRlKGdyaWRIdG1sKTtcclxuICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyh0aGlzLmVSb290LCAnYWctcm9vdCBhZy1zY3JvbGxzJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5maW5kRWxlbWVudHMoKTtcclxuXHJcbiAgICB0aGlzLmxheW91dCA9IG5ldyBCb3JkZXJMYXlvdXQoe1xyXG4gICAgICAgIG92ZXJsYXk6IHV0aWxzLmxvYWRUZW1wbGF0ZShsb2FkaW5nSHRtbCksXHJcbiAgICAgICAgY2VudGVyOiB0aGlzLmVSb290LFxyXG4gICAgICAgIGRvbnRGaWxsOiB0aGlzLmZvclByaW50LFxyXG4gICAgICAgIG5hbWU6ICdlR3JpZFBhbmVsJ1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRTY3JvbGxMaXN0ZW5lcigpO1xyXG59O1xyXG5cclxuR3JpZFBhbmVsLnByb3RvdHlwZS5lbnN1cmVJbmRleFZpc2libGUgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgdmFyIGxhc3RSb3cgPSB0aGlzLnJvd01vZGVsLmdldFZpcnR1YWxSb3dDb3VudCgpO1xyXG4gICAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicgfHwgaW5kZXggPCAwIHx8IGluZGV4ID49IGxhc3RSb3cpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ2ludmFsaWQgcm93IGluZGV4IGZvciBlbnN1cmVJbmRleFZpc2libGU6ICcgKyBpbmRleCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciByb3dIZWlnaHQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dIZWlnaHQoKTtcclxuICAgIHZhciByb3dUb3BQaXhlbCA9IHJvd0hlaWdodCAqIGluZGV4O1xyXG4gICAgdmFyIHJvd0JvdHRvbVBpeGVsID0gcm93VG9wUGl4ZWwgKyByb3dIZWlnaHQ7XHJcblxyXG4gICAgdmFyIHZpZXdwb3J0VG9wUGl4ZWwgPSB0aGlzLmVCb2R5Vmlld3BvcnQuc2Nyb2xsVG9wO1xyXG4gICAgdmFyIHZpZXdwb3J0SGVpZ2h0ID0gdGhpcy5lQm9keVZpZXdwb3J0Lm9mZnNldEhlaWdodDtcclxuICAgIHZhciBzY3JvbGxTaG93aW5nID0gdGhpcy5lQm9keVZpZXdwb3J0LmNsaWVudFdpZHRoIDwgdGhpcy5lQm9keVZpZXdwb3J0LnNjcm9sbFdpZHRoO1xyXG4gICAgaWYgKHNjcm9sbFNob3dpbmcpIHtcclxuICAgICAgICB2aWV3cG9ydEhlaWdodCAtPSB0aGlzLnNjcm9sbFdpZHRoO1xyXG4gICAgfVxyXG4gICAgdmFyIHZpZXdwb3J0Qm90dG9tUGl4ZWwgPSB2aWV3cG9ydFRvcFBpeGVsICsgdmlld3BvcnRIZWlnaHQ7XHJcblxyXG4gICAgdmFyIHZpZXdwb3J0U2Nyb2xsZWRQYXN0Um93ID0gdmlld3BvcnRUb3BQaXhlbCA+IHJvd1RvcFBpeGVsO1xyXG4gICAgdmFyIHZpZXdwb3J0U2Nyb2xsZWRCZWZvcmVSb3cgPSB2aWV3cG9ydEJvdHRvbVBpeGVsIDwgcm93Qm90dG9tUGl4ZWw7XHJcblxyXG4gICAgaWYgKHZpZXdwb3J0U2Nyb2xsZWRQYXN0Um93KSB7XHJcbiAgICAgICAgLy8gaWYgcm93IGlzIGJlZm9yZSwgc2Nyb2xsIHVwIHdpdGggcm93IGF0IHRvcFxyXG4gICAgICAgIHRoaXMuZUJvZHlWaWV3cG9ydC5zY3JvbGxUb3AgPSByb3dUb3BQaXhlbDtcclxuICAgIH0gZWxzZSBpZiAodmlld3BvcnRTY3JvbGxlZEJlZm9yZVJvdykge1xyXG4gICAgICAgIC8vIGlmIHJvdyBpcyBiZWxvdywgc2Nyb2xsIGRvd24gd2l0aCByb3cgYXQgYm90dG9tXHJcbiAgICAgICAgdmFyIG5ld1Njcm9sbFBvc2l0aW9uID0gcm93Qm90dG9tUGl4ZWwgLSB2aWV3cG9ydEhlaWdodDtcclxuICAgICAgICB0aGlzLmVCb2R5Vmlld3BvcnQuc2Nyb2xsVG9wID0gbmV3U2Nyb2xsUG9zaXRpb247XHJcbiAgICB9XHJcbiAgICAvLyBvdGhlcndpc2UsIHJvdyBpcyBhbHJlYWR5IGluIHZpZXcsIHNvIGRvIG5vdGhpbmdcclxufTtcclxuXHJcbkdyaWRQYW5lbC5wcm90b3R5cGUuZW5zdXJlQ29sSW5kZXhWaXNpYmxlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdjb2wgaW5kZXggbXVzdCBiZSBhIG51bWJlcjogJyArIGluZGV4KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNvbHVtbnMgPSB0aGlzLmNvbHVtbk1vZGVsLmdldERpc3BsYXllZENvbHVtbnMoKTtcclxuICAgIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInIHx8IGluZGV4IDwgMCB8fCBpbmRleCA+PSBjb2x1bW5zLmxlbmd0aCkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignaW52YWxpZCBjb2wgaW5kZXggZm9yIGVuc3VyZUNvbEluZGV4VmlzaWJsZTogJyArIGluZGV4XHJcbiAgICAgICAgICAgICsgJywgc2hvdWxkIGJlIGJldHdlZW4gMCBhbmQgJyArIChjb2x1bW5zLmxlbmd0aCAtIDEpKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNvbHVtbiA9IGNvbHVtbnNbaW5kZXhdO1xyXG4gICAgdmFyIHBpbm5lZENvbENvdW50ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0UGlubmVkQ29sQ291bnQoKTtcclxuICAgIGlmIChpbmRleCA8IHBpbm5lZENvbENvdW50KSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdpbnZhbGlkIGNvbCBpbmRleCBmb3IgZW5zdXJlQ29sSW5kZXhWaXNpYmxlOiAnICsgaW5kZXhcclxuICAgICAgICAgICAgKyAnLCBzY3JvbGxpbmcgdG8gYSBwaW5uZWQgY29sIG1ha2VzIG5vIHNlbnNlJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHN1bSB1cCBhbGwgY29sIHdpZHRoIHRvIHRoZSBsZXQgdG8gZ2V0IHRoZSBzdGFydCBwaXhlbFxyXG4gICAgdmFyIGNvbExlZnRQaXhlbCA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gcGlubmVkQ29sQ291bnQ7IGk8aW5kZXg7IGkrKykge1xyXG4gICAgICAgIGNvbExlZnRQaXhlbCArPSBjb2x1bW5zW2ldLmFjdHVhbFdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjb2xSaWdodFBpeGVsID0gY29sTGVmdFBpeGVsICsgY29sdW1uLmFjdHVhbFdpZHRoO1xyXG5cclxuICAgIHZhciB2aWV3cG9ydExlZnRQaXhlbCA9IHRoaXMuZUJvZHlWaWV3cG9ydC5zY3JvbGxMZWZ0O1xyXG4gICAgdmFyIHZpZXdwb3J0V2lkdGggPSB0aGlzLmVCb2R5Vmlld3BvcnQub2Zmc2V0V2lkdGg7XHJcblxyXG4gICAgdmFyIHNjcm9sbFNob3dpbmcgPSB0aGlzLmVCb2R5Vmlld3BvcnQuY2xpZW50SGVpZ2h0IDwgdGhpcy5lQm9keVZpZXdwb3J0LnNjcm9sbEhlaWdodDtcclxuICAgIGlmIChzY3JvbGxTaG93aW5nKSB7XHJcbiAgICAgICAgdmlld3BvcnRXaWR0aCAtPSB0aGlzLnNjcm9sbFdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB2aWV3cG9ydFJpZ2h0UGl4ZWwgPSB2aWV3cG9ydExlZnRQaXhlbCArIHZpZXdwb3J0V2lkdGg7XHJcblxyXG4gICAgdmFyIHZpZXdwb3J0U2Nyb2xsZWRQYXN0Q29sID0gdmlld3BvcnRMZWZ0UGl4ZWwgPiBjb2xMZWZ0UGl4ZWw7XHJcbiAgICB2YXIgdmlld3BvcnRTY3JvbGxlZEJlZm9yZUNvbCA9IHZpZXdwb3J0UmlnaHRQaXhlbCA8IGNvbFJpZ2h0UGl4ZWw7XHJcblxyXG4gICAgaWYgKHZpZXdwb3J0U2Nyb2xsZWRQYXN0Q29sKSB7XHJcbiAgICAgICAgLy8gaWYgdmlld3BvcnQncyBsZWZ0IHNpZGUgaXMgYWZ0ZXIgY29sJ3MgbGVmdCBzaWRlLCBzY3JvbGwgcmlnaHQgdG8gcHVsbCBjb2wgaW50byB2aWV3cG9ydCBhdCBsZWZ0XHJcbiAgICAgICAgdGhpcy5lQm9keVZpZXdwb3J0LnNjcm9sbExlZnQgPSBjb2xMZWZ0UGl4ZWw7XHJcbiAgICB9IGVsc2UgaWYgKHZpZXdwb3J0U2Nyb2xsZWRCZWZvcmVDb2wpIHtcclxuICAgICAgICAvLyBpZiB2aWV3cG9ydCdzIHJpZ2h0IHNpZGUgaXMgYmVmb3JlIGNvbCdzIHJpZ2h0IHNpZGUsIHNjcm9sbCBsZWZ0IHRvIHB1bGwgY29sIGludG8gdmlld3BvcnQgYXQgcmlnaHRcclxuICAgICAgICB2YXIgbmV3U2Nyb2xsUG9zaXRpb24gPSBjb2xSaWdodFBpeGVsIC0gdmlld3BvcnRXaWR0aDtcclxuICAgICAgICB0aGlzLmVCb2R5Vmlld3BvcnQuc2Nyb2xsTGVmdCA9IG5ld1Njcm9sbFBvc2l0aW9uO1xyXG4gICAgfVxyXG4gICAgLy8gb3RoZXJ3aXNlLCBjb2wgaXMgYWxyZWFkeSBpbiB2aWV3LCBzbyBkbyBub3RoaW5nXHJcbn07XHJcblxyXG5HcmlkUGFuZWwucHJvdG90eXBlLnNob3dMb2FkaW5nID0gZnVuY3Rpb24obG9hZGluZykge1xyXG4gICAgdGhpcy5sYXlvdXQuc2V0T3ZlcmxheVZpc2libGUobG9hZGluZyk7XHJcbn07XHJcblxyXG5HcmlkUGFuZWwucHJvdG90eXBlLmdldFdpZHRoRm9yU2l6ZUNvbHNUb0ZpdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGF2YWlsYWJsZVdpZHRoID0gdGhpcy5lQm9keS5jbGllbnRXaWR0aDtcclxuICAgIHZhciBzY3JvbGxTaG93aW5nID0gdGhpcy5lQm9keVZpZXdwb3J0LmNsaWVudEhlaWdodCA8IHRoaXMuZUJvZHlWaWV3cG9ydC5zY3JvbGxIZWlnaHQ7XHJcbiAgICBpZiAoc2Nyb2xsU2hvd2luZykge1xyXG4gICAgICAgIGF2YWlsYWJsZVdpZHRoIC09IHRoaXMuc2Nyb2xsV2lkdGg7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXZhaWxhYmxlV2lkdGg7XHJcbn07XHJcblxyXG5HcmlkUGFuZWwucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihjb2x1bW5Nb2RlbCwgcm93UmVuZGVyZXIpIHtcclxuICAgIHRoaXMuY29sdW1uTW9kZWwgPSBjb2x1bW5Nb2RlbDtcclxuICAgIHRoaXMucm93UmVuZGVyZXIgPSByb3dSZW5kZXJlcjtcclxufTtcclxuXHJcbkdyaWRQYW5lbC5wcm90b3R5cGUuc2V0Um93TW9kZWwgPSBmdW5jdGlvbihyb3dNb2RlbCkge1xyXG4gICAgdGhpcy5yb3dNb2RlbCA9IHJvd01vZGVsO1xyXG59O1xyXG5cclxuR3JpZFBhbmVsLnByb3RvdHlwZS5nZXRCb2R5Q29udGFpbmVyID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmVCb2R5Q29udGFpbmVyOyB9O1xyXG5cclxuR3JpZFBhbmVsLnByb3RvdHlwZS5nZXRCb2R5Vmlld3BvcnQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZUJvZHlWaWV3cG9ydDsgfTtcclxuXHJcbkdyaWRQYW5lbC5wcm90b3R5cGUuZ2V0UGlubmVkQ29sc0NvbnRhaW5lciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5lUGlubmVkQ29sc0NvbnRhaW5lcjsgfTtcclxuXHJcbkdyaWRQYW5lbC5wcm90b3R5cGUuZ2V0SGVhZGVyQ29udGFpbmVyID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmVIZWFkZXJDb250YWluZXI7IH07XHJcblxyXG5HcmlkUGFuZWwucHJvdG90eXBlLmdldFJvb3QgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZVJvb3Q7IH07XHJcblxyXG5HcmlkUGFuZWwucHJvdG90eXBlLmdldFBpbm5lZEhlYWRlciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5lUGlubmVkSGVhZGVyOyB9O1xyXG5cclxuR3JpZFBhbmVsLnByb3RvdHlwZS5nZXRIZWFkZXIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuZUhlYWRlcjsgfTtcclxuXHJcbkdyaWRQYW5lbC5wcm90b3R5cGUuZ2V0Um93c1BhcmVudCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5lUGFyZW50T2ZSb3dzOyB9O1xyXG5cclxuR3JpZFBhbmVsLnByb3RvdHlwZS5maW5kRWxlbWVudHMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLmZvclByaW50KSB7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyQ29udGFpbmVyID0gdGhpcy5lUm9vdC5xdWVyeVNlbGVjdG9yKFwiLmFnLWhlYWRlci1jb250YWluZXJcIik7XHJcbiAgICAgICAgdGhpcy5lQm9keUNvbnRhaW5lciA9IHRoaXMuZVJvb3QucXVlcnlTZWxlY3RvcihcIi5hZy1ib2R5LWNvbnRhaW5lclwiKTtcclxuICAgICAgICAvLyBmb3Igbm8tc2Nyb2xscywgYWxsIHJvd3MgbGl2ZSBpbiB0aGUgYm9keSBjb250YWluZXJcclxuICAgICAgICB0aGlzLmVQYXJlbnRPZlJvd3MgPSB0aGlzLmVCb2R5Q29udGFpbmVyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVCb2R5ID0gdGhpcy5lUm9vdC5xdWVyeVNlbGVjdG9yKFwiLmFnLWJvZHlcIik7XHJcbiAgICAgICAgdGhpcy5lQm9keUNvbnRhaW5lciA9IHRoaXMuZVJvb3QucXVlcnlTZWxlY3RvcihcIi5hZy1ib2R5LWNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLmVCb2R5Vmlld3BvcnQgPSB0aGlzLmVSb290LnF1ZXJ5U2VsZWN0b3IoXCIuYWctYm9keS12aWV3cG9ydFwiKTtcclxuICAgICAgICB0aGlzLmVCb2R5Vmlld3BvcnRXcmFwcGVyID0gdGhpcy5lUm9vdC5xdWVyeVNlbGVjdG9yKFwiLmFnLWJvZHktdmlld3BvcnQtd3JhcHBlclwiKTtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyID0gdGhpcy5lUm9vdC5xdWVyeVNlbGVjdG9yKFwiLmFnLXBpbm5lZC1jb2xzLWNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzVmlld3BvcnQgPSB0aGlzLmVSb290LnF1ZXJ5U2VsZWN0b3IoXCIuYWctcGlubmVkLWNvbHMtdmlld3BvcnRcIik7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkSGVhZGVyID0gdGhpcy5lUm9vdC5xdWVyeVNlbGVjdG9yKFwiLmFnLXBpbm5lZC1oZWFkZXJcIik7XHJcbiAgICAgICAgdGhpcy5lSGVhZGVyID0gdGhpcy5lUm9vdC5xdWVyeVNlbGVjdG9yKFwiLmFnLWhlYWRlclwiKTtcclxuICAgICAgICB0aGlzLmVIZWFkZXJDb250YWluZXIgPSB0aGlzLmVSb290LnF1ZXJ5U2VsZWN0b3IoXCIuYWctaGVhZGVyLWNvbnRhaW5lclwiKTtcclxuICAgICAgICAvLyBmb3Igc2Nyb2xscywgYWxsIHJvd3MgbGl2ZSBpbiBlQm9keSAoY29udGFpbmluZyBwaW5uZWQgYW5kIG5vcm1hbCBib2R5KVxyXG4gICAgICAgIHRoaXMuZVBhcmVudE9mUm93cyA9IHRoaXMuZUJvZHk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkUGFuZWwucHJvdG90eXBlLnNldEJvZHlDb250YWluZXJXaWR0aCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG1haW5Sb3dXaWR0aCA9IHRoaXMuY29sdW1uTW9kZWwuZ2V0Qm9keUNvbnRhaW5lcldpZHRoKCkgKyBcInB4XCI7XHJcbiAgICB0aGlzLmVCb2R5Q29udGFpbmVyLnN0eWxlLndpZHRoID0gbWFpblJvd1dpZHRoO1xyXG59O1xyXG5cclxuR3JpZFBhbmVsLnByb3RvdHlwZS5zZXRQaW5uZWRDb2xDb250YWluZXJXaWR0aCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHBpbm5lZENvbFdpZHRoID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRQaW5uZWRDb250YWluZXJXaWR0aCgpICsgXCJweFwiO1xyXG4gICAgdGhpcy5lUGlubmVkQ29sc0NvbnRhaW5lci5zdHlsZS53aWR0aCA9IHBpbm5lZENvbFdpZHRoO1xyXG4gICAgdGhpcy5lQm9keVZpZXdwb3J0V3JhcHBlci5zdHlsZS5tYXJnaW5MZWZ0ID0gcGlubmVkQ29sV2lkdGg7XHJcbn07XHJcblxyXG5HcmlkUGFuZWwucHJvdG90eXBlLnNob3dQaW5uZWRDb2xDb250YWluZXJzSWZOZWVkZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIG5vIG5lZWQgdG8gZG8gdGhpcyBpZiBub3QgdXNpbmcgc2Nyb2xsc1xyXG4gICAgaWYgKHRoaXMuZm9yUHJpbnQpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNob3dpbmdQaW5uZWRDb2xzID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0UGlubmVkQ29sQ291bnQoKSA+IDA7XHJcblxyXG4gICAgLy9zb21lIGJyb3dzZXJzIGhhZCBsYXlvdXQgaXNzdWVzIHdpdGggdGhlIGJsYW5rIGRpdnMsIHNvIGlmIGJsYW5rLFxyXG4gICAgLy93ZSBkb24ndCBkaXNwbGF5IHRoZW1cclxuICAgIGlmIChzaG93aW5nUGlubmVkQ29scykge1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZEhlYWRlci5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc1ZpZXdwb3J0LnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkSGVhZGVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5lUGlubmVkQ29sc1ZpZXdwb3J0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5HcmlkUGFuZWwucHJvdG90eXBlLnNldEhlYWRlckhlaWdodCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGhlYWRlckhlaWdodCA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEhlYWRlckhlaWdodCgpO1xyXG4gICAgdmFyIGhlYWRlckhlaWdodFBpeGVscyA9IGhlYWRlckhlaWdodCArICdweCc7XHJcbiAgICBpZiAodGhpcy5mb3JQcmludCkge1xyXG4gICAgICAgIHRoaXMuZUhlYWRlckNvbnRhaW5lci5zdHlsZVsnaGVpZ2h0J10gPSBoZWFkZXJIZWlnaHRQaXhlbHM7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZUhlYWRlci5zdHlsZVsnaGVpZ2h0J10gPSBoZWFkZXJIZWlnaHRQaXhlbHM7XHJcbiAgICAgICAgdGhpcy5lQm9keS5zdHlsZVsncGFkZGluZ1RvcCddID0gaGVhZGVySGVpZ2h0UGl4ZWxzO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gc2VlIGlmIGEgZ3JleSBib3ggaXMgbmVlZGVkIGF0IHRoZSBib3R0b20gb2YgdGhlIHBpbm5lZCBjb2xcclxuR3JpZFBhbmVsLnByb3RvdHlwZS5zZXRQaW5uZWRDb2xIZWlnaHQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghdGhpcy5mb3JQcmludCkge1xyXG4gICAgICAgIHZhciBib2R5SGVpZ2h0ID0gdGhpcy5lQm9keVZpZXdwb3J0Lm9mZnNldEhlaWdodDtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzVmlld3BvcnQuc3R5bGUuaGVpZ2h0ID0gYm9keUhlaWdodCArIFwicHhcIjtcclxuICAgIH1cclxufTtcclxuXHJcbkdyaWRQYW5lbC5wcm90b3R5cGUuYWRkU2Nyb2xsTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGlmIHByaW50aW5nLCB0aGVuIG5vIHNjcm9sbGluZywgc28gbm8gcG9pbnQgaW4gbGlzdGVuaW5nIGZvciBzY3JvbGwgZXZlbnRzXHJcbiAgICBpZiAodGhpcy5mb3JQcmludCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB2YXIgbGFzdExlZnRQb3NpdGlvbiA9IC0xO1xyXG4gICAgdmFyIGxhc3RUb3BQb3NpdGlvbiA9IC0xO1xyXG5cclxuICAgIHRoaXMuZUJvZHlWaWV3cG9ydC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBuZXdMZWZ0UG9zaXRpb24gPSB0aGF0LmVCb2R5Vmlld3BvcnQuc2Nyb2xsTGVmdDtcclxuICAgICAgICB2YXIgbmV3VG9wUG9zaXRpb24gPSB0aGF0LmVCb2R5Vmlld3BvcnQuc2Nyb2xsVG9wO1xyXG5cclxuICAgICAgICBpZiAobmV3TGVmdFBvc2l0aW9uICE9PSBsYXN0TGVmdFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGxhc3RMZWZ0UG9zaXRpb24gPSBuZXdMZWZ0UG9zaXRpb247XHJcbiAgICAgICAgICAgIHRoYXQuc2Nyb2xsSGVhZGVyKG5ld0xlZnRQb3NpdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobmV3VG9wUG9zaXRpb24gIT09IGxhc3RUb3BQb3NpdGlvbikge1xyXG4gICAgICAgICAgICBsYXN0VG9wUG9zaXRpb24gPSBuZXdUb3BQb3NpdGlvbjtcclxuICAgICAgICAgICAgdGhhdC5zY3JvbGxQaW5uZWQobmV3VG9wUG9zaXRpb24pO1xyXG4gICAgICAgICAgICB0aGF0LnJvd1JlbmRlcmVyLmRyYXdWaXJ0dWFsUm93cygpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZVBpbm5lZENvbHNWaWV3cG9ydC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIHRoaXMgbWVhbnMgdGhlIHBpbm5lZCBwYW5lbCB3YXMgbW92ZWQsIHdoaWNoIGNhbiBvbmx5XHJcbiAgICAgICAgLy8gaGFwcGVuIHdoZW4gdGhlIHVzZXIgaXMgbmF2aWdhdGluZyBpbiB0aGUgcGlubmVkIGNvbnRhaW5lclxyXG4gICAgICAgIC8vIGFzIHRoZSBwaW5uZWQgY29sIHNob3VsZCBuZXZlciBzY3JvbGwuIHNvIHdlIHJvbGxiYWNrXHJcbiAgICAgICAgLy8gdGhlIHNjcm9sbCBvbiB0aGUgcGlubmVkLlxyXG4gICAgICAgIHRoYXQuZVBpbm5lZENvbHNWaWV3cG9ydC5zY3JvbGxUb3AgPSAwO1xyXG4gICAgfSk7XHJcblxyXG59O1xyXG5cclxuR3JpZFBhbmVsLnByb3RvdHlwZS5zY3JvbGxIZWFkZXIgPSBmdW5jdGlvbihib2R5TGVmdFBvc2l0aW9uKSB7XHJcbiAgICAvLyB0aGlzLmVIZWFkZXJDb250YWluZXIuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZTNkKCcgKyAtYm9keUxlZnRQb3NpdGlvbiArIFwicHgsMCwwKVwiO1xyXG4gICAgdGhpcy5lSGVhZGVyQ29udGFpbmVyLnN0eWxlLmxlZnQgPSAtYm9keUxlZnRQb3NpdGlvbiArIFwicHhcIjtcclxufTtcclxuXHJcbkdyaWRQYW5lbC5wcm90b3R5cGUuc2Nyb2xsUGlubmVkID0gZnVuY3Rpb24oYm9keVRvcFBvc2l0aW9uKSB7XHJcbiAgICAvLyB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgwLCcgKyAtYm9keVRvcFBvc2l0aW9uICsgXCJweCwwKVwiO1xyXG4gICAgdGhpcy5lUGlubmVkQ29sc0NvbnRhaW5lci5zdHlsZS50b3AgPSAtYm9keVRvcFBvc2l0aW9uICsgXCJweFwiO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHcmlkUGFuZWw7IiwibW9kdWxlLmV4cG9ydHMgPSBcIjxkaXYgY2xhc3M9YWctbG9hZGluZy1wYW5lbD48ZGl2IGNsYXNzPWFnLWxvYWRpbmctd3JhcHBlcj48c3BhbiBjbGFzcz1hZy1sb2FkaW5nLWNlbnRlcj5Mb2FkaW5nLi4uPC9zcGFuPjwvZGl2PjwvZGl2PlwiO1xuIiwiZnVuY3Rpb24gR3JvdXBDcmVhdG9yKCkge31cclxuXHJcbkdyb3VwQ3JlYXRvci5wcm90b3R5cGUuZ3JvdXAgPSBmdW5jdGlvbihyb3dOb2RlcywgZ3JvdXBlZENvbHMsIGdyb3VwQWdnRnVuY3Rpb24sIGV4cGFuZEJ5RGVmYXVsdCkge1xyXG5cclxuICAgIHZhciB0b3BNb3N0R3JvdXAgPSB7XHJcbiAgICAgICAgbGV2ZWw6IC0xLFxyXG4gICAgICAgIGNoaWxkcmVuOiBbXSxcclxuICAgICAgICBjaGlsZHJlbk1hcDoge31cclxuICAgIH07XHJcblxyXG4gICAgdmFyIGFsbEdyb3VwcyA9IFtdO1xyXG4gICAgYWxsR3JvdXBzLnB1c2godG9wTW9zdEdyb3VwKTtcclxuXHJcbiAgICB2YXIgbGV2ZWxUb0luc2VydENoaWxkID0gZ3JvdXBlZENvbHMubGVuZ3RoIC0gMTtcclxuICAgIHZhciBpLCBjdXJyZW50TGV2ZWwsIG5vZGUsIGRhdGEsIGN1cnJlbnRHcm91cCwgZ3JvdXBCeUZpZWxkLCBncm91cEtleSwgbmV4dEdyb3VwO1xyXG5cclxuICAgIC8vIHN0YXJ0IGF0IC0xIGFuZCBnbyBiYWNrd2FyZHMsIGFzIGFsbCB0aGUgcG9zaXRpdmUgaW5kZXhlc1xyXG4gICAgLy8gYXJlIGFscmVhZHkgdXNlZCBieSB0aGUgbm9kZXMuXHJcbiAgICB2YXIgaW5kZXggPSAtMTtcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgcm93Tm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBub2RlID0gcm93Tm9kZXNbaV07XHJcbiAgICAgICAgZGF0YSA9IG5vZGUuZGF0YTtcclxuXHJcbiAgICAgICAgLy8gYWxsIGxlYWYgbm9kZXMgaGF2ZSB0aGUgc2FtZSBsZXZlbCBpbiB0aGlzIGdyb3VwaW5nLCB3aGljaCBpcyBvbmUgbGV2ZWwgYWZ0ZXIgdGhlIGxhc3QgZ3JvdXBcclxuICAgICAgICBub2RlLmxldmVsID0gbGV2ZWxUb0luc2VydENoaWxkICsgMTtcclxuXHJcbiAgICAgICAgZm9yIChjdXJyZW50TGV2ZWwgPSAwOyBjdXJyZW50TGV2ZWwgPCBncm91cGVkQ29scy5sZW5ndGg7IGN1cnJlbnRMZXZlbCsrKSB7XHJcbiAgICAgICAgICAgIGdyb3VwQnlGaWVsZCA9IGdyb3VwZWRDb2xzW2N1cnJlbnRMZXZlbF0uY29sRGVmLmZpZWxkO1xyXG4gICAgICAgICAgICBncm91cEtleSA9IGRhdGFbZ3JvdXBCeUZpZWxkXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50TGV2ZWwgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEdyb3VwID0gdG9wTW9zdEdyb3VwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBncm91cCBkb2Vzbid0IGV4aXN0IHlldCwgY3JlYXRlIGl0XHJcbiAgICAgICAgICAgIG5leHRHcm91cCA9IGN1cnJlbnRHcm91cC5jaGlsZHJlbk1hcFtncm91cEtleV07XHJcbiAgICAgICAgICAgIGlmICghbmV4dEdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBuZXh0R3JvdXAgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZmllbGQ6IGdyb3VwQnlGaWVsZCxcclxuICAgICAgICAgICAgICAgICAgICBpZDogaW5kZXgtLSxcclxuICAgICAgICAgICAgICAgICAgICBrZXk6IGdyb3VwS2V5LFxyXG4gICAgICAgICAgICAgICAgICAgIGV4cGFuZGVkOiB0aGlzLmlzRXhwYW5kZWQoZXhwYW5kQnlEZWZhdWx0LCBjdXJyZW50TGV2ZWwpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAvLyBmb3IgdG9wIG1vc3QgbGV2ZWwsIHBhcmVudCBpcyBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdXJyZW50R3JvdXAgPT09IHRvcE1vc3RHcm91cCA/IG51bGwgOiBjdXJyZW50R3JvdXAsXHJcbiAgICAgICAgICAgICAgICAgICAgYWxsQ2hpbGRyZW5Db3VudDogMCxcclxuICAgICAgICAgICAgICAgICAgICBsZXZlbDogY3VycmVudEdyb3VwLmxldmVsICsgMSxcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbk1hcDoge30gLy90aGlzIGlzIGEgdGVtcG9yYXJ5IG1hcCwgd2UgcmVtb3ZlIGF0IHRoZSBlbmQgb2YgdGhpcyBtZXRob2RcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50R3JvdXAuY2hpbGRyZW5NYXBbZ3JvdXBLZXldID0gbmV4dEdyb3VwO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEdyb3VwLmNoaWxkcmVuLnB1c2gobmV4dEdyb3VwKTtcclxuICAgICAgICAgICAgICAgIGFsbEdyb3Vwcy5wdXNoKG5leHRHcm91cCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG5leHRHcm91cC5hbGxDaGlsZHJlbkNvdW50Kys7XHJcblxyXG4gICAgICAgICAgICBpZiAoY3VycmVudExldmVsID09IGxldmVsVG9JbnNlcnRDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5wYXJlbnQgPSBuZXh0R3JvdXAgPT09IHRvcE1vc3RHcm91cCA/IG51bGwgOiBuZXh0R3JvdXA7XHJcbiAgICAgICAgICAgICAgICBuZXh0R3JvdXAuY2hpbGRyZW4ucHVzaChub2RlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRHcm91cCA9IG5leHRHcm91cDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy9yZW1vdmUgdGhlIHRlbXBvcmFyeSBtYXBcclxuICAgIGZvciAoaSA9IDA7IGkgPCBhbGxHcm91cHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBkZWxldGUgYWxsR3JvdXBzW2ldLmNoaWxkcmVuTWFwO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0b3BNb3N0R3JvdXAuY2hpbGRyZW47XHJcbn07XHJcblxyXG5Hcm91cENyZWF0b3IucHJvdG90eXBlLmlzRXhwYW5kZWQgPSBmdW5jdGlvbihleHBhbmRCeURlZmF1bHQsIGxldmVsKSB7XHJcbiAgICBpZiAodHlwZW9mIGV4cGFuZEJ5RGVmYXVsdCA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICByZXR1cm4gbGV2ZWwgPCBleHBhbmRCeURlZmF1bHQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBleHBhbmRCeURlZmF1bHQgPT09IHRydWUgfHwgZXhwYW5kQnlEZWZhdWx0ID09PSAndHJ1ZSc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBHcm91cENyZWF0b3IoKTtcclxuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xyXG52YXIgU3ZnRmFjdG9yeSA9IHJlcXVpcmUoJy4vc3ZnRmFjdG9yeScpO1xyXG52YXIgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcclxuXHJcbnZhciBzdmdGYWN0b3J5ID0gbmV3IFN2Z0ZhY3RvcnkoKTtcclxuXHJcbmZ1bmN0aW9uIEhlYWRlclJlbmRlcmVyKCkge31cclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oZ3JpZE9wdGlvbnNXcmFwcGVyLCBjb2x1bW5Db250cm9sbGVyLCBjb2x1bW5Nb2RlbCwgZ3JpZFBhbmVsLCBhbmd1bGFyR3JpZCwgZmlsdGVyTWFuYWdlciwgJHNjb3BlLCAkY29tcGlsZSwgZXhwcmVzc2lvblNlcnZpY2UpIHtcclxuICAgIHRoaXMuZXhwcmVzc2lvblNlcnZpY2UgPSBleHByZXNzaW9uU2VydmljZTtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyID0gZ3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4gICAgdGhpcy5jb2x1bW5Nb2RlbCA9IGNvbHVtbk1vZGVsO1xyXG4gICAgdGhpcy5jb2x1bW5Db250cm9sbGVyID0gY29sdW1uQ29udHJvbGxlcjtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZDtcclxuICAgIHRoaXMuZmlsdGVyTWFuYWdlciA9IGZpbHRlck1hbmFnZXI7XHJcbiAgICB0aGlzLiRzY29wZSA9ICRzY29wZTtcclxuICAgIHRoaXMuJGNvbXBpbGUgPSAkY29tcGlsZTtcclxuICAgIHRoaXMuZmluZEFsbEVsZW1lbnRzKGdyaWRQYW5lbCk7XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuZmluZEFsbEVsZW1lbnRzID0gZnVuY3Rpb24oZ3JpZFBhbmVsKSB7XHJcbiAgICB0aGlzLmVQaW5uZWRIZWFkZXIgPSBncmlkUGFuZWwuZ2V0UGlubmVkSGVhZGVyKCk7XHJcbiAgICB0aGlzLmVIZWFkZXJDb250YWluZXIgPSBncmlkUGFuZWwuZ2V0SGVhZGVyQ29udGFpbmVyKCk7XHJcbiAgICB0aGlzLmVIZWFkZXIgPSBncmlkUGFuZWwuZ2V0SGVhZGVyKCk7XHJcbiAgICB0aGlzLmVSb290ID0gZ3JpZFBhbmVsLmdldFJvb3QoKTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5yZWZyZXNoSGVhZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB1dGlscy5yZW1vdmVBbGxDaGlsZHJlbih0aGlzLmVQaW5uZWRIZWFkZXIpO1xyXG4gICAgdXRpbHMucmVtb3ZlQWxsQ2hpbGRyZW4odGhpcy5lSGVhZGVyQ29udGFpbmVyKTtcclxuXHJcbiAgICBpZiAodGhpcy5jaGlsZFNjb3Blcykge1xyXG4gICAgICAgIHRoaXMuY2hpbGRTY29wZXMuZm9yRWFjaChmdW5jdGlvbihjaGlsZFNjb3BlKSB7XHJcbiAgICAgICAgICAgIGNoaWxkU2NvcGUuJGRlc3Ryb3koKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHRoaXMuY2hpbGRTY29wZXMgPSBbXTtcclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEhlYWRlcnMoKSkge1xyXG4gICAgICAgIHRoaXMuaW5zZXJ0SGVhZGVyc1dpdGhHcm91cGluZygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmluc2VydEhlYWRlcnNXaXRob3V0R3JvdXBpbmcoKTtcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuaW5zZXJ0SGVhZGVyc1dpdGhHcm91cGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdyb3VwcyA9IHRoaXMuY29sdW1uTW9kZWwuZ2V0SGVhZGVyR3JvdXBzKCk7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBncm91cHMuZm9yRWFjaChmdW5jdGlvbihncm91cCkge1xyXG4gICAgICAgIHZhciBlSGVhZGVyQ2VsbCA9IHRoYXQuY3JlYXRlR3JvdXBlZEhlYWRlckNlbGwoZ3JvdXApO1xyXG4gICAgICAgIHZhciBlQ29udGFpbmVyVG9BZGRUbyA9IGdyb3VwLnBpbm5lZCA/IHRoYXQuZVBpbm5lZEhlYWRlciA6IHRoYXQuZUhlYWRlckNvbnRhaW5lcjtcclxuICAgICAgICBlQ29udGFpbmVyVG9BZGRUby5hcHBlbmRDaGlsZChlSGVhZGVyQ2VsbCk7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVHcm91cGVkSGVhZGVyQ2VsbCA9IGZ1bmN0aW9uKGdyb3VwKSB7XHJcblxyXG4gICAgdmFyIGVIZWFkZXJHcm91cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZUhlYWRlckdyb3VwLmNsYXNzTmFtZSA9ICdhZy1oZWFkZXItZ3JvdXAnO1xyXG5cclxuICAgIHZhciBlSGVhZGVyR3JvdXBDZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBncm91cC5lSGVhZGVyR3JvdXBDZWxsID0gZUhlYWRlckdyb3VwQ2VsbDtcclxuICAgIHZhciBjbGFzc05hbWVzID0gWydhZy1oZWFkZXItZ3JvdXAtY2VsbCddO1xyXG4gICAgLy8gaGF2aW5nIGRpZmZlcmVudCBjbGFzc2VzIGJlbG93IGFsbG93cyB0aGUgc3R5bGUgdG8gbm90IGhhdmUgYSBib3R0b20gYm9yZGVyXHJcbiAgICAvLyBvbiB0aGUgZ3JvdXAgaGVhZGVyLCBpZiBubyBncm91cCBpcyBzcGVjaWZpZWRcclxuICAgIGlmIChncm91cC5uYW1lKSB7XHJcbiAgICAgICAgY2xhc3NOYW1lcy5wdXNoKCdhZy1oZWFkZXItZ3JvdXAtY2VsbC13aXRoLWdyb3VwJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNsYXNzTmFtZXMucHVzaCgnYWctaGVhZGVyLWdyb3VwLWNlbGwtbm8tZ3JvdXAnKTtcclxuICAgIH1cclxuICAgIGVIZWFkZXJHcm91cENlbGwuY2xhc3NOYW1lID0gY2xhc3NOYW1lcy5qb2luKCcgJyk7XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzRW5hYmxlQ29sUmVzaXplKCkpIHtcclxuICAgICAgICB2YXIgZUhlYWRlckNlbGxSZXNpemUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGVIZWFkZXJDZWxsUmVzaXplLmNsYXNzTmFtZSA9IFwiYWctaGVhZGVyLWNlbGwtcmVzaXplXCI7XHJcbiAgICAgICAgZUhlYWRlckdyb3VwQ2VsbC5hcHBlbmRDaGlsZChlSGVhZGVyQ2VsbFJlc2l6ZSk7XHJcbiAgICAgICAgZ3JvdXAuZUhlYWRlckNlbGxSZXNpemUgPSBlSGVhZGVyQ2VsbFJlc2l6ZTtcclxuICAgICAgICB2YXIgZHJhZ0NhbGxiYWNrID0gdGhpcy5ncm91cERyYWdDYWxsYmFja0ZhY3RvcnkoZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuYWRkRHJhZ0hhbmRsZXIoZUhlYWRlckNlbGxSZXNpemUsIGRyYWdDYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbm8gcmVuZGVyZXIsIGRlZmF1bHQgdGV4dCByZW5kZXJcclxuICAgIHZhciBncm91cE5hbWUgPSBncm91cC5uYW1lO1xyXG4gICAgaWYgKGdyb3VwTmFtZSAmJiBncm91cE5hbWUgIT09ICcnKSB7XHJcbiAgICAgICAgdmFyIGVHcm91cENlbGxMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgZUdyb3VwQ2VsbExhYmVsLmNsYXNzTmFtZSA9ICdhZy1oZWFkZXItZ3JvdXAtY2VsbC1sYWJlbCc7XHJcbiAgICAgICAgZUhlYWRlckdyb3VwQ2VsbC5hcHBlbmRDaGlsZChlR3JvdXBDZWxsTGFiZWwpO1xyXG5cclxuICAgICAgICB2YXIgZUlubmVyVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgICAgIGVJbm5lclRleHQuY2xhc3NOYW1lID0gJ2FnLWhlYWRlci1ncm91cC10ZXh0JztcclxuICAgICAgICBlSW5uZXJUZXh0LmlubmVySFRNTCA9IGdyb3VwTmFtZTtcclxuICAgICAgICBlR3JvdXBDZWxsTGFiZWwuYXBwZW5kQ2hpbGQoZUlubmVyVGV4dCk7XHJcblxyXG4gICAgICAgIGlmIChncm91cC5leHBhbmRhYmxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkR3JvdXBFeHBhbmRJY29uKGdyb3VwLCBlR3JvdXBDZWxsTGFiZWwsIGdyb3VwLmV4cGFuZGVkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlSGVhZGVyR3JvdXAuYXBwZW5kQ2hpbGQoZUhlYWRlckdyb3VwQ2VsbCk7XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgZ3JvdXAuZGlzcGxheWVkQ29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbikge1xyXG4gICAgICAgIHZhciBlSGVhZGVyQ2VsbCA9IHRoYXQuY3JlYXRlSGVhZGVyQ2VsbChjb2x1bW4sIHRydWUsIGdyb3VwKTtcclxuICAgICAgICBlSGVhZGVyR3JvdXAuYXBwZW5kQ2hpbGQoZUhlYWRlckNlbGwpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhhdC5zZXRXaWR0aE9mR3JvdXBIZWFkZXJDZWxsKGdyb3VwKTtcclxuXHJcbiAgICByZXR1cm4gZUhlYWRlckdyb3VwO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmFkZEdyb3VwRXhwYW5kSWNvbiA9IGZ1bmN0aW9uKGdyb3VwLCBlSGVhZGVyR3JvdXAsIGV4cGFuZGVkKSB7XHJcbiAgICB2YXIgZUdyb3VwSWNvbjtcclxuICAgIGlmIChleHBhbmRlZCkge1xyXG4gICAgICAgIGVHcm91cEljb24gPSB1dGlscy5jcmVhdGVJY29uKCdoZWFkZXJHcm91cE9wZW5lZCcsIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLCBudWxsLCBzdmdGYWN0b3J5LmNyZWF0ZUFycm93TGVmdFN2Zyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVHcm91cEljb24gPSB1dGlscy5jcmVhdGVJY29uKCdoZWFkZXJHcm91cENsb3NlZCcsIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLCBudWxsLCBzdmdGYWN0b3J5LmNyZWF0ZUFycm93UmlnaHRTdmcpO1xyXG4gICAgfVxyXG4gICAgZUdyb3VwSWNvbi5jbGFzc05hbWUgPSAnYWctaGVhZGVyLWV4cGFuZC1pY29uJztcclxuICAgIGVIZWFkZXJHcm91cC5hcHBlbmRDaGlsZChlR3JvdXBJY29uKTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBlR3JvdXBJY29uLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGF0LmNvbHVtbkNvbnRyb2xsZXIuaGVhZGVyR3JvdXBPcGVuZWQoZ3JvdXApO1xyXG4gICAgfTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5hZGREcmFnSGFuZGxlciA9IGZ1bmN0aW9uKGVEcmFnZ2FibGVFbGVtZW50LCBkcmFnQ2FsbGJhY2spIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIGVEcmFnZ2FibGVFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGRvd25FdmVudCkge1xyXG4gICAgICAgIGRyYWdDYWxsYmFjay5vbkRyYWdTdGFydCgpO1xyXG4gICAgICAgIHRoYXQuZVJvb3Quc3R5bGUuY3Vyc29yID0gXCJjb2wtcmVzaXplXCI7XHJcbiAgICAgICAgdGhhdC5kcmFnU3RhcnRYID0gZG93bkV2ZW50LmNsaWVudFg7XHJcblxyXG4gICAgICAgIHZhciBsaXN0ZW5lcnNUb1JlbW92ZSA9IHt9O1xyXG5cclxuICAgICAgICBsaXN0ZW5lcnNUb1JlbW92ZS5tb3VzZW1vdmUgPSBmdW5jdGlvbiAobW92ZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBuZXdYID0gbW92ZUV2ZW50LmNsaWVudFg7XHJcbiAgICAgICAgICAgIHZhciBjaGFuZ2UgPSBuZXdYIC0gdGhhdC5kcmFnU3RhcnRYO1xyXG4gICAgICAgICAgICBkcmFnQ2FsbGJhY2sub25EcmFnZ2luZyhjaGFuZ2UpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxpc3RlbmVyc1RvUmVtb3ZlLm1vdXNldXAgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc3RvcERyYWdnaW5nKGxpc3RlbmVyc1RvUmVtb3ZlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsaXN0ZW5lcnNUb1JlbW92ZS5tb3VzZWxlYXZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGF0LnN0b3BEcmFnZ2luZyhsaXN0ZW5lcnNUb1JlbW92ZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhhdC5lUm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBsaXN0ZW5lcnNUb1JlbW92ZS5tb3VzZW1vdmUpO1xyXG4gICAgICAgIHRoYXQuZVJvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGxpc3RlbmVyc1RvUmVtb3ZlLm1vdXNldXApO1xyXG4gICAgICAgIHRoYXQuZVJvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIGxpc3RlbmVyc1RvUmVtb3ZlLm1vdXNlbGVhdmUpO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuc2V0V2lkdGhPZkdyb3VwSGVhZGVyQ2VsbCA9IGZ1bmN0aW9uKGhlYWRlckdyb3VwKSB7XHJcbiAgICB2YXIgdG90YWxXaWR0aCA9IDA7XHJcbiAgICBoZWFkZXJHcm91cC5kaXNwbGF5ZWRDb2x1bW5zLmZvckVhY2goZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICAgICAgdG90YWxXaWR0aCArPSBjb2x1bW4uYWN0dWFsV2lkdGg7XHJcbiAgICB9KTtcclxuICAgIGhlYWRlckdyb3VwLmVIZWFkZXJHcm91cENlbGwuc3R5bGUud2lkdGggPSB1dGlscy5mb3JtYXRXaWR0aCh0b3RhbFdpZHRoKTtcclxuICAgIGhlYWRlckdyb3VwLmFjdHVhbFdpZHRoID0gdG90YWxXaWR0aDtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5pbnNlcnRIZWFkZXJzV2l0aG91dEdyb3VwaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZVBpbm5lZEhlYWRlciA9IHRoaXMuZVBpbm5lZEhlYWRlcjtcclxuICAgIHZhciBlSGVhZGVyQ29udGFpbmVyID0gdGhpcy5lSGVhZGVyQ29udGFpbmVyO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIHRoaXMuY29sdW1uTW9kZWwuZ2V0RGlzcGxheWVkQ29sdW1ucygpLmZvckVhY2goZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICAgICAgLy8gb25seSBpbmNsdWRlIHRoZSBmaXJzdCB4IGNvbHNcclxuICAgICAgICB2YXIgaGVhZGVyQ2VsbCA9IHRoYXQuY3JlYXRlSGVhZGVyQ2VsbChjb2x1bW4sIGZhbHNlKTtcclxuICAgICAgICBpZiAoY29sdW1uLnBpbm5lZCkge1xyXG4gICAgICAgICAgICBlUGlubmVkSGVhZGVyLmFwcGVuZENoaWxkKGhlYWRlckNlbGwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVIZWFkZXJDb250YWluZXIuYXBwZW5kQ2hpbGQoaGVhZGVyQ2VsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlSGVhZGVyQ2VsbCA9IGZ1bmN0aW9uKGNvbHVtbiwgZ3JvdXBlZCwgaGVhZGVyR3JvdXApIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHZhciBjb2xEZWYgPSBjb2x1bW4uY29sRGVmO1xyXG4gICAgdmFyIGVIZWFkZXJDZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIC8vIHN0aWNrIHRoZSBoZWFkZXIgY2VsbCBpbiBjb2x1bW4sIGFzIHdlIGFjY2VzcyBpdCB3aGVuIGdyb3VwIGlzIHJlLXNpemVkXHJcbiAgICBjb2x1bW4uZUhlYWRlckNlbGwgPSBlSGVhZGVyQ2VsbDtcclxuXHJcbiAgICB2YXIgbmV3Q2hpbGRTY29wZTtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0FuZ3VsYXJDb21waWxlSGVhZGVycygpKSB7XHJcbiAgICAgICAgbmV3Q2hpbGRTY29wZSA9IHRoaXMuJHNjb3BlLiRuZXcoKTtcclxuICAgICAgICBuZXdDaGlsZFNjb3BlLmNvbERlZiA9IGNvbERlZjtcclxuICAgICAgICBuZXdDaGlsZFNjb3BlLmNvbEluZGV4ID0gY29sRGVmLmluZGV4O1xyXG4gICAgICAgIG5ld0NoaWxkU2NvcGUuY29sRGVmV3JhcHBlciA9IGNvbHVtbjtcclxuICAgICAgICB0aGlzLmNoaWxkU2NvcGVzLnB1c2gobmV3Q2hpbGRTY29wZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhlYWRlckNlbGxDbGFzc2VzID0gWydhZy1oZWFkZXItY2VsbCddO1xyXG4gICAgaWYgKGdyb3VwZWQpIHtcclxuICAgICAgICBoZWFkZXJDZWxsQ2xhc3Nlcy5wdXNoKCdhZy1oZWFkZXItY2VsbC1ncm91cGVkJyk7IC8vIHRoaXMgdGFrZXMgNTAlIGhlaWdodFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBoZWFkZXJDZWxsQ2xhc3Nlcy5wdXNoKCdhZy1oZWFkZXItY2VsbC1ub3QtZ3JvdXBlZCcpOyAvLyB0aGlzIHRha2VzIDEwMCUgaGVpZ2h0XHJcbiAgICB9XHJcbiAgICBlSGVhZGVyQ2VsbC5jbGFzc05hbWUgPSBoZWFkZXJDZWxsQ2xhc3Nlcy5qb2luKCcgJyk7XHJcblxyXG4gICAgdGhpcy5hZGRIZWFkZXJDbGFzc2VzRnJvbUNvbGxEZWYoY29sRGVmLCBuZXdDaGlsZFNjb3BlLCBlSGVhZGVyQ2VsbCk7XHJcblxyXG4gICAgLy8gYWRkIHRvb2x0aXAgaWYgZXhpc3RzXHJcbiAgICBpZiAoY29sRGVmLmhlYWRlclRvb2x0aXApIHtcclxuICAgICAgICBlSGVhZGVyQ2VsbC50aXRsZSA9IGNvbERlZi5oZWFkZXJUb29sdGlwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0VuYWJsZUNvbFJlc2l6ZSgpICYmICFjb2xEZWYuc3VwcHJlc3NSZXNpemUpIHtcclxuICAgICAgICB2YXIgaGVhZGVyQ2VsbFJlc2l6ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgaGVhZGVyQ2VsbFJlc2l6ZS5jbGFzc05hbWUgPSBcImFnLWhlYWRlci1jZWxsLXJlc2l6ZVwiO1xyXG4gICAgICAgIGVIZWFkZXJDZWxsLmFwcGVuZENoaWxkKGhlYWRlckNlbGxSZXNpemUpO1xyXG4gICAgICAgIHZhciBkcmFnQ2FsbGJhY2sgPSB0aGlzLmhlYWRlckRyYWdDYWxsYmFja0ZhY3RvcnkoZUhlYWRlckNlbGwsIGNvbHVtbiwgaGVhZGVyR3JvdXApO1xyXG4gICAgICAgIHRoaXMuYWRkRHJhZ0hhbmRsZXIoaGVhZGVyQ2VsbFJlc2l6ZSwgZHJhZ0NhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBmaWx0ZXIgYnV0dG9uXHJcbiAgICB2YXIgc2hvd01lbnUgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0VuYWJsZUZpbHRlcigpICYmICFjb2xEZWYuc3VwcHJlc3NNZW51O1xyXG4gICAgaWYgKHNob3dNZW51KSB7XHJcbiAgICAgICAgdmFyIGVNZW51QnV0dG9uID0gdXRpbHMuY3JlYXRlSWNvbignbWVudScsIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLCBjb2x1bW4sIHN2Z0ZhY3RvcnkuY3JlYXRlTWVudVN2Zyk7XHJcbiAgICAgICAgdXRpbHMuYWRkQ3NzQ2xhc3MoZU1lbnVCdXR0b24sICdhZy1oZWFkZXItaWNvbicpO1xyXG5cclxuICAgICAgICBlTWVudUJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcImFnLWhlYWRlci1jZWxsLW1lbnUtYnV0dG9uXCIpO1xyXG4gICAgICAgIGVNZW51QnV0dG9uLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC5maWx0ZXJNYW5hZ2VyLnNob3dGaWx0ZXIoY29sdW1uLCB0aGlzKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGVIZWFkZXJDZWxsLmFwcGVuZENoaWxkKGVNZW51QnV0dG9uKTtcclxuICAgICAgICBlSGVhZGVyQ2VsbC5vbm1vdXNlZW50ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZU1lbnVCdXR0b24uc3R5bGUub3BhY2l0eSA9IDE7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBlSGVhZGVyQ2VsbC5vbm1vdXNlbGVhdmUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZU1lbnVCdXR0b24uc3R5bGUub3BhY2l0eSA9IDA7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBlTWVudUJ1dHRvbi5zdHlsZS5vcGFjaXR5ID0gMDtcclxuICAgICAgICBlTWVudUJ1dHRvbi5zdHlsZVtcIi13ZWJraXQtdHJhbnNpdGlvblwiXSA9IFwib3BhY2l0eSAwLjVzLCBib3JkZXIgMC4yc1wiO1xyXG4gICAgICAgIGVNZW51QnV0dG9uLnN0eWxlW1widHJhbnNpdGlvblwiXSA9IFwib3BhY2l0eSAwLjVzLCBib3JkZXIgMC4yc1wiO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGxhYmVsIGRpdlxyXG4gICAgdmFyIGhlYWRlckNlbGxMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBoZWFkZXJDZWxsTGFiZWwuY2xhc3NOYW1lID0gXCJhZy1oZWFkZXItY2VsbC1sYWJlbFwiO1xyXG5cclxuICAgIC8vIGFkZCBpbiBzb3J0IGljb25zXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNFbmFibGVTb3J0aW5nKCkgJiYgIWNvbERlZi5zdXBwcmVzc1NvcnRpbmcpIHtcclxuICAgICAgICBjb2x1bW4uZVNvcnRBc2MgPSB1dGlscy5jcmVhdGVJY29uKCdzb3J0QXNjZW5kaW5nJywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbiwgc3ZnRmFjdG9yeS5jcmVhdGVBcnJvd0Rvd25TdmcpO1xyXG4gICAgICAgIGNvbHVtbi5lU29ydERlc2MgPSB1dGlscy5jcmVhdGVJY29uKCdzb3J0RGVzY2VuZGluZycsIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLCBjb2x1bW4sIHN2Z0ZhY3RvcnkuY3JlYXRlQXJyb3dVcFN2Zyk7XHJcbiAgICAgICAgdXRpbHMuYWRkQ3NzQ2xhc3MoY29sdW1uLmVTb3J0QXNjLCAnYWctaGVhZGVyLWljb24nKTtcclxuICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhjb2x1bW4uZVNvcnREZXNjLCAnYWctaGVhZGVyLWljb24nKTtcclxuICAgICAgICBoZWFkZXJDZWxsTGFiZWwuYXBwZW5kQ2hpbGQoY29sdW1uLmVTb3J0QXNjKTtcclxuICAgICAgICBoZWFkZXJDZWxsTGFiZWwuYXBwZW5kQ2hpbGQoY29sdW1uLmVTb3J0RGVzYyk7XHJcbiAgICAgICAgY29sdW1uLmVTb3J0QXNjLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgY29sdW1uLmVTb3J0RGVzYy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuYWRkU29ydEhhbmRsaW5nKGhlYWRlckNlbGxMYWJlbCwgY29sdW1uKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhZGQgaW4gZmlsdGVyIGljb25cclxuICAgIGNvbHVtbi5lRmlsdGVySWNvbiA9IHV0aWxzLmNyZWF0ZUljb24oJ2ZpbHRlcicsIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLCBjb2x1bW4sIHN2Z0ZhY3RvcnkuY3JlYXRlRmlsdGVyU3ZnKTtcclxuICAgIHV0aWxzLmFkZENzc0NsYXNzKGNvbHVtbi5lRmlsdGVySWNvbiwgJ2FnLWhlYWRlci1pY29uJyk7XHJcbiAgICBoZWFkZXJDZWxsTGFiZWwuYXBwZW5kQ2hpbGQoY29sdW1uLmVGaWx0ZXJJY29uKTtcclxuXHJcbiAgICAvLyByZW5kZXIgdGhlIGNlbGwsIHVzZSBhIHJlbmRlcmVyIGlmIG9uZSBpcyBwcm92aWRlZFxyXG4gICAgdmFyIGhlYWRlckNlbGxSZW5kZXJlcjtcclxuICAgIGlmIChjb2xEZWYuaGVhZGVyQ2VsbFJlbmRlcmVyKSB7IC8vIGZpcnN0IGxvb2sgZm9yIGEgcmVuZGVyZXIgaW4gY29sIGRlZlxyXG4gICAgICAgIGhlYWRlckNlbGxSZW5kZXJlciA9IGNvbERlZi5oZWFkZXJDZWxsUmVuZGVyZXI7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEhlYWRlckNlbGxSZW5kZXJlcigpKSB7IC8vIHNlY29uZCBsb29rIGZvciBvbmUgaW4gZ3JpZCBvcHRpb25zXHJcbiAgICAgICAgaGVhZGVyQ2VsbFJlbmRlcmVyID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0SGVhZGVyQ2VsbFJlbmRlcmVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhlYWRlck5hbWVWYWx1ZSA9IHRoaXMuY29sdW1uTW9kZWwuZ2V0RGlzcGxheU5hbWVGb3JDb2woY29sdW1uKTtcclxuXHJcbiAgICBpZiAoaGVhZGVyQ2VsbFJlbmRlcmVyKSB7XHJcbiAgICAgICAgLy8gcmVuZGVyZXIgcHJvdmlkZWQsIHVzZSBpdFxyXG4gICAgICAgIHZhciBjZWxsUmVuZGVyZXJQYXJhbXMgPSB7XHJcbiAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAkc2NvcGU6IG5ld0NoaWxkU2NvcGUsXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKSxcclxuICAgICAgICAgICAgdmFsdWU6IGhlYWRlck5hbWVWYWx1ZSxcclxuICAgICAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIGNlbGxSZW5kZXJlclJlc3VsdCA9IGhlYWRlckNlbGxSZW5kZXJlcihjZWxsUmVuZGVyZXJQYXJhbXMpO1xyXG4gICAgICAgIHZhciBjaGlsZFRvQXBwZW5kO1xyXG4gICAgICAgIGlmICh1dGlscy5pc05vZGVPckVsZW1lbnQoY2VsbFJlbmRlcmVyUmVzdWx0KSkge1xyXG4gICAgICAgICAgICAvLyBhIGRvbSBub2RlIG9yIGVsZW1lbnQgd2FzIHJldHVybmVkLCBzbyBhZGQgY2hpbGRcclxuICAgICAgICAgICAgY2hpbGRUb0FwcGVuZCA9IGNlbGxSZW5kZXJlclJlc3VsdDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UgYXNzdW1lIGl0IHdhcyBodG1sLCBzbyBqdXN0IGluc2VydFxyXG4gICAgICAgICAgICB2YXIgZVRleHRTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAgICAgICAgIGVUZXh0U3Bhbi5pbm5lckhUTUwgPSBjZWxsUmVuZGVyZXJSZXN1bHQ7XHJcbiAgICAgICAgICAgIGNoaWxkVG9BcHBlbmQgPSBlVGV4dFNwYW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGFuZ3VsYXIgY29tcGlsZSBoZWFkZXIgaWYgb3B0aW9uIGlzIHR1cm5lZCBvblxyXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0FuZ3VsYXJDb21waWxlSGVhZGVycygpKSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZFRvQXBwZW5kQ29tcGlsZWQgPSB0aGlzLiRjb21waWxlKGNoaWxkVG9BcHBlbmQpKG5ld0NoaWxkU2NvcGUpWzBdO1xyXG4gICAgICAgICAgICBoZWFkZXJDZWxsTGFiZWwuYXBwZW5kQ2hpbGQoY2hpbGRUb0FwcGVuZENvbXBpbGVkKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoZWFkZXJDZWxsTGFiZWwuYXBwZW5kQ2hpbGQoY2hpbGRUb0FwcGVuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBubyByZW5kZXJlciwgZGVmYXVsdCB0ZXh0IHJlbmRlclxyXG4gICAgICAgIHZhciBlSW5uZXJUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAgICAgZUlubmVyVGV4dC5jbGFzc05hbWUgPSAnYWctaGVhZGVyLWNlbGwtdGV4dCc7XHJcbiAgICAgICAgZUlubmVyVGV4dC5pbm5lckhUTUwgPSBoZWFkZXJOYW1lVmFsdWU7XHJcbiAgICAgICAgaGVhZGVyQ2VsbExhYmVsLmFwcGVuZENoaWxkKGVJbm5lclRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGVIZWFkZXJDZWxsLmFwcGVuZENoaWxkKGhlYWRlckNlbGxMYWJlbCk7XHJcbiAgICBlSGVhZGVyQ2VsbC5zdHlsZS53aWR0aCA9IHV0aWxzLmZvcm1hdFdpZHRoKGNvbHVtbi5hY3R1YWxXaWR0aCk7XHJcblxyXG4gICAgcmV0dXJuIGVIZWFkZXJDZWxsO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmFkZEhlYWRlckNsYXNzZXNGcm9tQ29sbERlZiA9IGZ1bmN0aW9uKGNvbERlZiwgJGNoaWxkU2NvcGUsIGVIZWFkZXJDZWxsKSB7XHJcbiAgICBpZiAoY29sRGVmLmhlYWRlckNsYXNzKSB7XHJcbiAgICAgICAgdmFyIGNsYXNzVG9Vc2U7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb2xEZWYuaGVhZGVyQ2xhc3MgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAgICAgJHNjb3BlOiAkY2hpbGRTY29wZSxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKSxcclxuICAgICAgICAgICAgICAgIGFwaTogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY2xhc3NUb1VzZSA9IGNvbERlZi5oZWFkZXJDbGFzcyhwYXJhbXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNsYXNzVG9Vc2UgPSBjb2xEZWYuaGVhZGVyQ2xhc3M7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIGNsYXNzVG9Vc2UgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHV0aWxzLmFkZENzc0NsYXNzKGVIZWFkZXJDZWxsLCBjbGFzc1RvVXNlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoY2xhc3NUb1VzZSkpIHtcclxuICAgICAgICAgICAgY2xhc3NUb1VzZS5mb3JFYWNoKGZ1bmN0aW9uKGNzc0NsYXNzSXRlbSkge1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuYWRkQ3NzQ2xhc3MoZUhlYWRlckNlbGwsIGNzc0NsYXNzSXRlbSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5nZXROZXh0U29ydERpcmVjdGlvbiA9IGZ1bmN0aW9uKGRpcmVjdGlvbikge1xyXG4gICAgdmFyIHN1cHByZXNzVW5Tb3J0ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNTdXBwcmVzc1VuU29ydCgpO1xyXG4gICAgdmFyIHN1cHByZXNzRGVzY1NvcnQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc1N1cHByZXNzRGVzY1NvcnQoKTtcclxuXHJcbiAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgIGNhc2UgY29uc3RhbnRzLkRFU0M6XHJcbiAgICAgICAgICAgIGlmIChzdXBwcmVzc1VuU29ydCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnN0YW50cy5BU0M7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgY29uc3RhbnRzLkFTQzpcclxuICAgICAgICAgICAgaWYgKHN1cHByZXNzVW5Tb3J0ICYmIHN1cHByZXNzRGVzY1NvcnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjb25zdGFudHMuQVNDO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN1cHByZXNzRGVzY1NvcnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnN0YW50cy5ERVNDO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgZGVmYXVsdCA6XHJcbiAgICAgICAgICAgIHJldHVybiBjb25zdGFudHMuQVNDO1xyXG4gICAgfVxyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmFkZFNvcnRIYW5kbGluZyA9IGZ1bmN0aW9uKGhlYWRlckNlbGxMYWJlbCwgY29sdW1uKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgaGVhZGVyQ2VsbExhYmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihlKSB7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBzb3J0IG9uIGN1cnJlbnQgY29sXHJcbiAgICAgICAgY29sdW1uLnNvcnQgPSB0aGF0LmdldE5leHRTb3J0RGlyZWN0aW9uKGNvbHVtbi5zb3J0KTtcclxuXHJcbiAgICAgICAgLy8gc29ydGVkQXQgdXNlZCBmb3Iga25vd2luZyBvcmRlciBvZiBjb2xzIHdoZW4gbXVsdGktY29sIHNvcnRcclxuICAgICAgICBpZiAoY29sdW1uLnNvcnQpIHtcclxuICAgICAgICAgICAgY29sdW1uLnNvcnRlZEF0ID0gbmV3IERhdGUoKS52YWx1ZU9mKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29sdW1uLnNvcnRlZEF0ID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBkb2luZ011bHRpU29ydCA9ICF0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5pc1N1cHByZXNzTXVsdGlTb3J0KCkgJiYgZS5zaGlmdEtleTtcclxuXHJcbiAgICAgICAgLy8gY2xlYXIgc29ydCBvbiBhbGwgY29sdW1ucyBleGNlcHQgdGhpcyBvbmUsIGFuZCB1cGRhdGUgdGhlIGljb25zXHJcbiAgICAgICAgdGhhdC5jb2x1bW5Nb2RlbC5nZXRBbGxDb2x1bW5zKCkuZm9yRWFjaChmdW5jdGlvbihjb2x1bW5Ub0NsZWFyKSB7XHJcbiAgICAgICAgICAgIC8vIERvIG5vdCBjbGVhciBpZiBlaXRoZXIgaG9sZGluZyBzaGlmdCwgb3IgaWYgY29sdW1uIGluIHF1ZXN0aW9uIHdhcyBjbGlja2VkXHJcbiAgICAgICAgICAgIGlmICghKGRvaW5nTXVsdGlTb3J0IHx8IGNvbHVtblRvQ2xlYXIgPT09IGNvbHVtbikpIHtcclxuICAgICAgICAgICAgICAgIGNvbHVtblRvQ2xlYXIuc29ydCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhhdC5hbmd1bGFyR3JpZC5vblNvcnRpbmdDaGFuZ2VkKCk7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS51cGRhdGVTb3J0SWNvbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY29sdW1uTW9kZWwuZ2V0QWxsQ29sdW1ucygpLmZvckVhY2goZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICAgICAgLy8gdXBkYXRlIHZpc2liaWxpdHkgb2YgaWNvbnNcclxuICAgICAgICB2YXIgc29ydEFzY2VuZGluZyA9IGNvbHVtbi5zb3J0ID09PSBjb25zdGFudHMuQVNDO1xyXG4gICAgICAgIHZhciBzb3J0RGVzY2VuZGluZyA9IGNvbHVtbi5zb3J0ID09PSBjb25zdGFudHMuREVTQztcclxuXHJcbiAgICAgICAgaWYgKGNvbHVtbi5lU29ydEFzYykge1xyXG4gICAgICAgICAgICB1dGlscy5zZXRWaXNpYmxlKGNvbHVtbi5lU29ydEFzYywgc29ydEFzY2VuZGluZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb2x1bW4uZVNvcnREZXNjKSB7XHJcbiAgICAgICAgICAgIHV0aWxzLnNldFZpc2libGUoY29sdW1uLmVTb3J0RGVzYywgc29ydERlc2NlbmRpbmcpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuSGVhZGVyUmVuZGVyZXIucHJvdG90eXBlLmdyb3VwRHJhZ0NhbGxiYWNrRmFjdG9yeSA9IGZ1bmN0aW9uKGN1cnJlbnRHcm91cCkge1xyXG4gICAgdmFyIHBhcmVudCA9IHRoaXM7XHJcbiAgICB2YXIgZGlzcGxheWVkQ29sdW1ucyA9IGN1cnJlbnRHcm91cC5kaXNwbGF5ZWRDb2x1bW5zO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBvbkRyYWdTdGFydDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBXaWR0aFN0YXJ0ID0gY3VycmVudEdyb3VwLmFjdHVhbFdpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuV2lkdGhTdGFydHMgPSBbXTtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICBkaXNwbGF5ZWRDb2x1bW5zLmZvckVhY2goZnVuY3Rpb24oY29sRGVmV3JhcHBlcikge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5jaGlsZHJlbldpZHRoU3RhcnRzLnB1c2goY29sRGVmV3JhcHBlci5hY3R1YWxXaWR0aCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLm1pbldpZHRoID0gZGlzcGxheWVkQ29sdW1ucy5sZW5ndGggKiBjb25zdGFudHMuTUlOX0NPTF9XSURUSDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRHJhZ2dpbmc6IGZ1bmN0aW9uKGRyYWdDaGFuZ2UpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBuZXdXaWR0aCA9IHRoaXMuZ3JvdXBXaWR0aFN0YXJ0ICsgZHJhZ0NoYW5nZTtcclxuICAgICAgICAgICAgaWYgKG5ld1dpZHRoIDwgdGhpcy5taW5XaWR0aCkge1xyXG4gICAgICAgICAgICAgICAgbmV3V2lkdGggPSB0aGlzLm1pbldpZHRoO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBzZXQgdGhlIG5ldyB3aWR0aCB0byB0aGUgZ3JvdXAgaGVhZGVyXHJcbiAgICAgICAgICAgIHZhciBuZXdXaWR0aFB4ID0gbmV3V2lkdGggKyBcInB4XCI7XHJcbiAgICAgICAgICAgIGN1cnJlbnRHcm91cC5lSGVhZGVyR3JvdXBDZWxsLnN0eWxlLndpZHRoID0gbmV3V2lkdGhQeDtcclxuICAgICAgICAgICAgY3VycmVudEdyb3VwLmFjdHVhbFdpZHRoID0gbmV3V2lkdGg7XHJcblxyXG4gICAgICAgICAgICAvLyBkaXN0cmlidXRlIHRoZSBuZXcgd2lkdGggdG8gdGhlIGNoaWxkIGhlYWRlcnNcclxuICAgICAgICAgICAgdmFyIGNoYW5nZVJhdGlvID0gbmV3V2lkdGggLyB0aGlzLmdyb3VwV2lkdGhTdGFydDtcclxuICAgICAgICAgICAgLy8ga2VlcCB0cmFjayBvZiBwaXhlbHMgdXNlZCwgYW5kIGxhc3QgY29sdW1uIGdldHMgdGhlIHJlbWFpbmluZyxcclxuICAgICAgICAgICAgLy8gdG8gY2F0ZXIgZm9yIHJvdW5kaW5nIGVycm9ycywgYW5kIG1pbiB3aWR0aCBhZGp1c3RtZW50c1xyXG4gICAgICAgICAgICB2YXIgcGl4ZWxzVG9EaXN0cmlidXRlID0gbmV3V2lkdGg7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgY3VycmVudEdyb3VwLmRpc3BsYXllZENvbHVtbnMuZm9yRWFjaChmdW5jdGlvbihjb2xEZWZXcmFwcGVyLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5vdExhc3RDb2wgPSBpbmRleCAhPT0gKGRpc3BsYXllZENvbHVtbnMubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3Q2hpbGRTaXplO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vdExhc3RDb2wpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBub3QgdGhlIGxhc3QgY29sLCBjYWxjdWxhdGUgdGhlIGNvbHVtbiB3aWR0aCBhcyBub3JtYWxcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhcnRDaGlsZFNpemUgPSB0aGF0LmNoaWxkcmVuV2lkdGhTdGFydHNbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkU2l6ZSA9IHN0YXJ0Q2hpbGRTaXplICogY2hhbmdlUmF0aW87XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkU2l6ZSA8IGNvbnN0YW50cy5NSU5fQ09MX1dJRFRIKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkU2l6ZSA9IGNvbnN0YW50cy5NSU5fQ09MX1dJRFRIO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBwaXhlbHNUb0Rpc3RyaWJ1dGUgLT0gbmV3Q2hpbGRTaXplO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBsYXN0IGNvbCwgZ2l2ZSBpdCB0aGUgcmVtYWluaW5nIHBpeGVsc1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkU2l6ZSA9IHBpeGVsc1RvRGlzdHJpYnV0ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBlSGVhZGVyQ2VsbCA9IGRpc3BsYXllZENvbHVtbnNbaW5kZXhdLmVIZWFkZXJDZWxsO1xyXG4gICAgICAgICAgICAgICAgcGFyZW50LmFkanVzdENvbHVtbldpZHRoKG5ld0NoaWxkU2l6ZSwgY29sRGVmV3JhcHBlciwgZUhlYWRlckNlbGwpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIHNob3VsZCBub3QgYmUgY2FsbGluZyB0aGVzZSBoZXJlLCBzaG91bGQgZG8gc29tZXRoaW5nIGVsc2VcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRHcm91cC5waW5uZWQpIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5hbmd1bGFyR3JpZC51cGRhdGVQaW5uZWRDb2xDb250YWluZXJXaWR0aEFmdGVyQ29sUmVzaXplKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuYW5ndWxhckdyaWQudXBkYXRlQm9keUNvbnRhaW5lcldpZHRoQWZ0ZXJDb2xSZXNpemUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuYWRqdXN0Q29sdW1uV2lkdGggPSBmdW5jdGlvbihuZXdXaWR0aCwgY29sdW1uLCBlSGVhZGVyQ2VsbCkge1xyXG4gICAgdmFyIG5ld1dpZHRoUHggPSBuZXdXaWR0aCArIFwicHhcIjtcclxuICAgIHZhciBzZWxlY3RvckZvckFsbENvbHNJbkNlbGwgPSBcIi5jZWxsLWNvbC1cIiArIGNvbHVtbi5pbmRleDtcclxuICAgIHZhciBjZWxsc0ZvclRoaXNDb2wgPSB0aGlzLmVSb290LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JGb3JBbGxDb2xzSW5DZWxsKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2VsbHNGb3JUaGlzQ29sLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY2VsbHNGb3JUaGlzQ29sW2ldLnN0eWxlLndpZHRoID0gbmV3V2lkdGhQeDtcclxuICAgIH1cclxuXHJcbiAgICBlSGVhZGVyQ2VsbC5zdHlsZS53aWR0aCA9IG5ld1dpZHRoUHg7XHJcbiAgICBjb2x1bW4uYWN0dWFsV2lkdGggPSBuZXdXaWR0aDtcclxufTtcclxuXHJcbi8vIGdldHMgY2FsbGVkIHdoZW4gYSBoZWFkZXIgKG5vdCBhIGhlYWRlciBncm91cCkgZ2V0cyByZXNpemVkXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS5oZWFkZXJEcmFnQ2FsbGJhY2tGYWN0b3J5ID0gZnVuY3Rpb24oaGVhZGVyQ2VsbCwgY29sdW1uLCBoZWFkZXJHcm91cCkge1xyXG4gICAgdmFyIHBhcmVudCA9IHRoaXM7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGFydFdpZHRoID0gY29sdW1uLmFjdHVhbFdpZHRoO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25EcmFnZ2luZzogZnVuY3Rpb24oZHJhZ0NoYW5nZSkge1xyXG4gICAgICAgICAgICB2YXIgbmV3V2lkdGggPSB0aGlzLnN0YXJ0V2lkdGggKyBkcmFnQ2hhbmdlO1xyXG4gICAgICAgICAgICBpZiAobmV3V2lkdGggPCBjb25zdGFudHMuTUlOX0NPTF9XSURUSCkge1xyXG4gICAgICAgICAgICAgICAgbmV3V2lkdGggPSBjb25zdGFudHMuTUlOX0NPTF9XSURUSDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcGFyZW50LmFkanVzdENvbHVtbldpZHRoKG5ld1dpZHRoLCBjb2x1bW4sIGhlYWRlckNlbGwpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGhlYWRlckdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuc2V0V2lkdGhPZkdyb3VwSGVhZGVyQ2VsbChoZWFkZXJHcm91cCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHNob3VsZCBub3QgYmUgY2FsbGluZyB0aGVzZSBoZXJlLCBzaG91bGQgZG8gc29tZXRoaW5nIGVsc2VcclxuICAgICAgICAgICAgaWYgKGNvbHVtbi5waW5uZWQpIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5hbmd1bGFyR3JpZC51cGRhdGVQaW5uZWRDb2xDb250YWluZXJXaWR0aEFmdGVyQ29sUmVzaXplKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuYW5ndWxhckdyaWQudXBkYXRlQm9keUNvbnRhaW5lcldpZHRoQWZ0ZXJDb2xSZXNpemUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG5IZWFkZXJSZW5kZXJlci5wcm90b3R5cGUuc3RvcERyYWdnaW5nID0gZnVuY3Rpb24obGlzdGVuZXJzVG9SZW1vdmUpIHtcclxuICAgIHRoaXMuZVJvb3Quc3R5bGUuY3Vyc29yID0gXCJcIjtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHV0aWxzLml0ZXJhdGVPYmplY3QobGlzdGVuZXJzVG9SZW1vdmUsIGZ1bmN0aW9uKGtleSwgbGlzdGVuZXIpIHtcclxuICAgICAgICB0aGF0LmVSb290LnJlbW92ZUV2ZW50TGlzdGVuZXIoa2V5LCBsaXN0ZW5lcik7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbkhlYWRlclJlbmRlcmVyLnByb3RvdHlwZS51cGRhdGVGaWx0ZXJJY29ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5jb2x1bW5Nb2RlbC5nZXREaXNwbGF5ZWRDb2x1bW5zKCkuZm9yRWFjaChmdW5jdGlvbihjb2x1bW4pIHtcclxuICAgICAgICAvLyB0b2RvOiBuZWVkIHRvIGNoYW5nZSB0aGlzLCBzbyBvbmx5IHVwZGF0ZXMgaWYgY29sdW1uIGlzIHZpc2libGVcclxuICAgICAgICBpZiAoY29sdW1uLmVGaWx0ZXJJY29uKSB7XHJcbiAgICAgICAgICAgIHZhciBmaWx0ZXJQcmVzZW50ID0gdGhhdC5maWx0ZXJNYW5hZ2VyLmlzRmlsdGVyUHJlc2VudEZvckNvbChjb2x1bW4uY29sSWQpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheVN0eWxlID0gZmlsdGVyUHJlc2VudCA/ICdpbmxpbmUnIDogJ25vbmUnO1xyXG4gICAgICAgICAgICBjb2x1bW4uZUZpbHRlckljb24uc3R5bGUuZGlzcGxheSA9IGRpc3BsYXlTdHlsZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyUmVuZGVyZXI7XHJcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcblxyXG5mdW5jdGlvbiBCb3JkZXJMYXlvdXQocGFyYW1zKSB7XHJcblxyXG4gICAgdGhpcy5pc0xheW91dFBhbmVsID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLmZ1bGxIZWlnaHQgPSAhcGFyYW1zLm5vcnRoICYmICFwYXJhbXMuc291dGg7XHJcblxyXG4gICAgdmFyIHRlbXBsYXRlO1xyXG4gICAgaWYgKCFwYXJhbXMuZG9udEZpbGwpIHtcclxuICAgICAgICBpZiAodGhpcy5mdWxsSGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlID1cclxuICAgICAgICAgICAgICAgICc8ZGl2IHN0eWxlPVwiaGVpZ2h0OiAxMDAlOyBvdmVyZmxvdzogYXV0bzsgcG9zaXRpb246IHJlbGF0aXZlO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJ3ZXN0XCIgc3R5bGU9XCJoZWlnaHQ6IDEwMCU7IGZsb2F0OiBsZWZ0O1wiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJlYXN0XCIgc3R5bGU9XCJoZWlnaHQ6IDEwMCU7IGZsb2F0OiByaWdodDtcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwiY2VudGVyXCIgc3R5bGU9XCJoZWlnaHQ6IDEwMCU7XCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cIm92ZXJsYXlcIiBzdHlsZT1cInBvc2l0aW9uOiBhYnNvbHV0ZTsgaGVpZ2h0OiAxMDAlOyB3aWR0aDogMTAwJTsgdG9wOiAwcHg7IGxlZnQ6IDBweDtcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlID1cclxuICAgICAgICAgICAgICAgICc8ZGl2IHN0eWxlPVwiaGVpZ2h0OiAxMDAlOyBwb3NpdGlvbjogcmVsYXRpdmU7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cIm5vcnRoXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cImNlbnRlclJvd1wiIHN0eWxlPVwiaGVpZ2h0OiAxMDAlOyBvdmVyZmxvdzogaGlkZGVuO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJ3ZXN0XCIgc3R5bGU9XCJoZWlnaHQ6IDEwMCU7IGZsb2F0OiBsZWZ0O1wiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJlYXN0XCIgc3R5bGU9XCJoZWlnaHQ6IDEwMCU7IGZsb2F0OiByaWdodDtcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwiY2VudGVyXCIgc3R5bGU9XCJoZWlnaHQ6IDEwMCU7XCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cInNvdXRoXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cIm92ZXJsYXlcIiBzdHlsZT1cInBvc2l0aW9uOiBhYnNvbHV0ZTsgaGVpZ2h0OiAxMDAlOyB3aWR0aDogMTAwJTsgdG9wOiAwcHg7IGxlZnQ6IDBweDtcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmxheW91dEFjdGl2ZSA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRlbXBsYXRlID1cclxuICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJwb3NpdGlvbjogcmVsYXRpdmU7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cIm5vcnRoXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cImNlbnRlclJvd1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwid2VzdFwiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwiZWFzdFwiPjwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGlkPVwiY2VudGVyXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cInNvdXRoXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBpZD1cIm92ZXJsYXlcIiBzdHlsZT1cInBvc2l0aW9uOiBhYnNvbHV0ZTsgaGVpZ2h0OiAxMDAlOyB3aWR0aDogMTAwJTsgdG9wOiAwcHg7IGxlZnQ6IDBweDtcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgdGhpcy5sYXlvdXRBY3RpdmUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmVHdWkgPSB1dGlscy5sb2FkVGVtcGxhdGUodGVtcGxhdGUpO1xyXG5cclxuICAgIHRoaXMuaWQgPSAnYm9yZGVyTGF5b3V0JztcclxuICAgIGlmIChwYXJhbXMubmFtZSkge1xyXG4gICAgICAgIHRoaXMuaWQgKz0gJ18nICsgcGFyYW1zLm5hbWU7XHJcbiAgICB9XHJcbiAgICB0aGlzLmVHdWkuc2V0QXR0cmlidXRlKCdpZCcsIHRoaXMuaWQpO1xyXG4gICAgdGhpcy5jaGlsZFBhbmVscyA9IFtdO1xyXG5cclxuICAgIGlmIChwYXJhbXMpIHtcclxuICAgICAgICB0aGlzLnNldHVwUGFuZWxzKHBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zZXRPdmVybGF5VmlzaWJsZShmYWxzZSk7XHJcbn1cclxuXHJcbkJvcmRlckxheW91dC5wcm90b3R5cGUuc2V0dXBQYW5lbHMgPSBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgIHRoaXMuZU5vcnRoV3JhcHBlciA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKCcjbm9ydGgnKTtcclxuICAgIHRoaXMuZVNvdXRoV3JhcHBlciA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKCcjc291dGgnKTtcclxuICAgIHRoaXMuZUVhc3RXcmFwcGVyID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoJyNlYXN0Jyk7XHJcbiAgICB0aGlzLmVXZXN0V3JhcHBlciA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKCcjd2VzdCcpO1xyXG4gICAgdGhpcy5lQ2VudGVyV3JhcHBlciA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKCcjY2VudGVyJyk7XHJcbiAgICB0aGlzLmVPdmVybGF5V3JhcHBlciA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKCcjb3ZlcmxheScpO1xyXG4gICAgdGhpcy5lQ2VudGVyUm93ID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoJyNjZW50ZXJSb3cnKTtcclxuXHJcbiAgICB0aGlzLmVOb3J0aENoaWxkTGF5b3V0ID0gdGhpcy5zZXR1cFBhbmVsKHBhcmFtcy5ub3J0aCwgdGhpcy5lTm9ydGhXcmFwcGVyKTtcclxuICAgIHRoaXMuZVNvdXRoQ2hpbGRMYXlvdXQgPSB0aGlzLnNldHVwUGFuZWwocGFyYW1zLnNvdXRoLCB0aGlzLmVTb3V0aFdyYXBwZXIpO1xyXG4gICAgdGhpcy5lRWFzdENoaWxkTGF5b3V0ID0gdGhpcy5zZXR1cFBhbmVsKHBhcmFtcy5lYXN0LCB0aGlzLmVFYXN0V3JhcHBlcik7XHJcbiAgICB0aGlzLmVXZXN0Q2hpbGRMYXlvdXQgPSB0aGlzLnNldHVwUGFuZWwocGFyYW1zLndlc3QsIHRoaXMuZVdlc3RXcmFwcGVyKTtcclxuICAgIHRoaXMuZUNlbnRlckNoaWxkTGF5b3V0ID0gdGhpcy5zZXR1cFBhbmVsKHBhcmFtcy5jZW50ZXIsIHRoaXMuZUNlbnRlcldyYXBwZXIpO1xyXG5cclxuICAgIHRoaXMuc2V0dXBQYW5lbChwYXJhbXMub3ZlcmxheSwgdGhpcy5lT3ZlcmxheVdyYXBwZXIpO1xyXG59O1xyXG5cclxuQm9yZGVyTGF5b3V0LnByb3RvdHlwZS5zZXR1cFBhbmVsID0gZnVuY3Rpb24oY29udGVudCwgZVBhbmVsKSB7XHJcbiAgICBpZiAoIWVQYW5lbCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmIChjb250ZW50KSB7XHJcbiAgICAgICAgaWYgKGNvbnRlbnQuaXNMYXlvdXRQYW5lbCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkUGFuZWxzLnB1c2goY29udGVudCk7XHJcbiAgICAgICAgICAgIGVQYW5lbC5hcHBlbmRDaGlsZChjb250ZW50LmdldEd1aSgpKTtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZVBhbmVsLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVQYW5lbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVQYW5lbCk7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Cb3JkZXJMYXlvdXQucHJvdG90eXBlLmdldEd1aSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZUd1aTtcclxufTtcclxuXHJcbkJvcmRlckxheW91dC5wcm90b3R5cGUuZG9MYXlvdXQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB0aGlzLmxheW91dENoaWxkKHRoaXMuZU5vcnRoQ2hpbGRMYXlvdXQpO1xyXG4gICAgdGhpcy5sYXlvdXRDaGlsZCh0aGlzLmVTb3V0aENoaWxkTGF5b3V0KTtcclxuICAgIHRoaXMubGF5b3V0Q2hpbGQodGhpcy5lRWFzdENoaWxkTGF5b3V0KTtcclxuICAgIHRoaXMubGF5b3V0Q2hpbGQodGhpcy5lV2VzdENoaWxkTGF5b3V0KTtcclxuXHJcbiAgICBpZiAodGhpcy5sYXlvdXRBY3RpdmUpIHtcclxuICAgICAgICB0aGlzLmxheW91dEhlaWdodCgpO1xyXG4gICAgICAgIHRoaXMubGF5b3V0V2lkdGgoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxheW91dENoaWxkKHRoaXMuZUNlbnRlckNoaWxkTGF5b3V0KTtcclxufTtcclxuXHJcbkJvcmRlckxheW91dC5wcm90b3R5cGUubGF5b3V0Q2hpbGQgPSBmdW5jdGlvbihjaGlsZFBhbmVsKSB7XHJcbiAgICBpZiAoY2hpbGRQYW5lbCkge1xyXG4gICAgICAgIGNoaWxkUGFuZWwuZG9MYXlvdXQoKTtcclxuICAgIH1cclxufTtcclxuXHJcbkJvcmRlckxheW91dC5wcm90b3R5cGUubGF5b3V0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5mdWxsSGVpZ2h0KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0b3RhbEhlaWdodCA9IHV0aWxzLm9mZnNldEhlaWdodCh0aGlzLmVHdWkpO1xyXG4gICAgdmFyIG5vcnRoSGVpZ2h0ID0gdXRpbHMub2Zmc2V0SGVpZ2h0KHRoaXMuZU5vcnRoV3JhcHBlcik7XHJcbiAgICB2YXIgc291dGhIZWlnaHQgPSB1dGlscy5vZmZzZXRIZWlnaHQodGhpcy5lU291dGhXcmFwcGVyKTtcclxuXHJcbiAgICB2YXIgY2VudGVySGVpZ2h0ID0gdG90YWxIZWlnaHQgLSBub3J0aEhlaWdodCAtIHNvdXRoSGVpZ2h0O1xyXG4gICAgaWYgKGNlbnRlckhlaWdodCA8IDApIHtcclxuICAgICAgICBjZW50ZXJIZWlnaHQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZUNlbnRlclJvdy5zdHlsZS5oZWlnaHQgPSBjZW50ZXJIZWlnaHQgKyAncHgnO1xyXG59O1xyXG5cclxuQm9yZGVyTGF5b3V0LnByb3RvdHlwZS5sYXlvdXRXaWR0aCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRvdGFsV2lkdGggPSB1dGlscy5vZmZzZXRXaWR0aCh0aGlzLmVHdWkpO1xyXG4gICAgdmFyIGVhc3RXaWR0aCA9IHV0aWxzLm9mZnNldFdpZHRoKHRoaXMuZUVhc3RXcmFwcGVyKTtcclxuICAgIHZhciB3ZXN0V2lkdGggPSB1dGlscy5vZmZzZXRXaWR0aCh0aGlzLmVXZXN0V3JhcHBlcik7XHJcblxyXG4gICAgdmFyIGNlbnRlcldpZHRoID0gdG90YWxXaWR0aCAtIGVhc3RXaWR0aCAtIHdlc3RXaWR0aDtcclxuICAgIGlmIChjZW50ZXJXaWR0aCA8IDApIHtcclxuICAgICAgICBjZW50ZXJXaWR0aCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5lQ2VudGVyV3JhcHBlci5zdHlsZS53aWR0aCA9IGNlbnRlcldpZHRoICsgJ3B4JztcclxufTtcclxuXHJcbkJvcmRlckxheW91dC5wcm90b3R5cGUuc2V0RWFzdFZpc2libGUgPSBmdW5jdGlvbih2aXNpYmxlKSB7XHJcbiAgICBpZiAodGhpcy5lRWFzdFdyYXBwZXIpIHtcclxuICAgICAgICB0aGlzLmVFYXN0V3JhcHBlci5zdHlsZS5kaXNwbGF5ID0gdmlzaWJsZSA/ICcnIDogJ25vbmUnO1xyXG4gICAgfVxyXG4gICAgdGhpcy5kb0xheW91dCgpO1xyXG59O1xyXG5cclxuQm9yZGVyTGF5b3V0LnByb3RvdHlwZS5zZXRPdmVybGF5VmlzaWJsZSA9IGZ1bmN0aW9uKHZpc2libGUpIHtcclxuICAgIGlmICh0aGlzLmVPdmVybGF5V3JhcHBlcikge1xyXG4gICAgICAgIHRoaXMuZU92ZXJsYXlXcmFwcGVyLnN0eWxlLmRpc3BsYXkgPSB2aXNpYmxlID8gJycgOiAnbm9uZSc7XHJcbiAgICB9XHJcbiAgICB0aGlzLmRvTGF5b3V0KCk7XHJcbn07XHJcblxyXG5Cb3JkZXJMYXlvdXQucHJvdG90eXBlLnNldFNvdXRoVmlzaWJsZSA9IGZ1bmN0aW9uKHZpc2libGUpIHtcclxuICAgIGlmICh0aGlzLmVTb3V0aFdyYXBwZXIpIHtcclxuICAgICAgICB0aGlzLmVTb3V0aFdyYXBwZXIuc3R5bGUuZGlzcGxheSA9IHZpc2libGUgPyAnJyA6ICdub25lJztcclxuICAgIH1cclxuICAgIHRoaXMuZG9MYXlvdXQoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQm9yZGVyTGF5b3V0OyIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcblxyXG5mdW5jdGlvbiBWZXJ0aWNhbFN0YWNrKCkge1xyXG5cclxuICAgIHRoaXMuaXNMYXlvdXRQYW5lbCA9IHRydWU7XHJcbiAgICB0aGlzLmNoaWxkUGFuZWxzID0gW107XHJcbiAgICB0aGlzLmVHdWkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIHRoaXMuZUd1aS5zdHlsZS5oZWlnaHQgPSAnMTAwJSc7XHJcbn1cclxuXHJcblZlcnRpY2FsU3RhY2sucHJvdG90eXBlLmFkZFBhbmVsID0gZnVuY3Rpb24ocGFuZWwsIGhlaWdodCkge1xyXG4gICAgdmFyIGNvbXBvbmVudDtcclxuICAgIGlmIChwYW5lbC5pc0xheW91dFBhbmVsKSB7XHJcbiAgICAgICAgdGhpcy5jaGlsZFBhbmVscy5wdXNoKHBhbmVsKTtcclxuICAgICAgICBjb21wb25lbnQgPSBwYW5lbC5nZXRHdWkoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29tcG9uZW50ID0gcGFuZWw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGhlaWdodCkge1xyXG4gICAgICAgIGNvbXBvbmVudC5zdHlsZS5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICB9XHJcbiAgICB0aGlzLmVHdWkuYXBwZW5kQ2hpbGQoY29tcG9uZW50KTtcclxufTtcclxuXHJcblZlcnRpY2FsU3RhY2sucHJvdG90eXBlLmdldEd1aSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZUd1aTtcclxufTtcclxuXHJcblZlcnRpY2FsU3RhY2sucHJvdG90eXBlLmRvTGF5b3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaTx0aGlzLmNoaWxkUGFuZWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5jaGlsZFBhbmVsc1tpXS5kb0xheW91dCgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBWZXJ0aWNhbFN0YWNrOyIsInZhciBncm91cENyZWF0b3IgPSByZXF1aXJlKCcuLy4uL2dyb3VwQ3JlYXRvcicpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XHJcbnZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuLy4uL2NvbnN0YW50cycpO1xyXG5cclxuZnVuY3Rpb24gSW5NZW1vcnlSb3dDb250cm9sbGVyKCkge1xyXG4gICAgdGhpcy5jcmVhdGVNb2RlbCgpO1xyXG59XHJcblxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbk1vZGVsLCBhbmd1bGFyR3JpZCwgZmlsdGVyTWFuYWdlciwgJHNjb3BlLCBleHByZXNzaW9uU2VydmljZSkge1xyXG4gICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIgPSBncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsID0gY29sdW1uTW9kZWw7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkID0gYW5ndWxhckdyaWQ7XHJcbiAgICB0aGlzLmZpbHRlck1hbmFnZXIgPSBmaWx0ZXJNYW5hZ2VyO1xyXG4gICAgdGhpcy4kc2NvcGUgPSAkc2NvcGU7XHJcbiAgICB0aGlzLmV4cHJlc3Npb25TZXJ2aWNlID0gZXhwcmVzc2lvblNlcnZpY2U7XHJcblxyXG4gICAgdGhpcy5hbGxSb3dzID0gbnVsbDtcclxuICAgIHRoaXMucm93c0FmdGVyR3JvdXAgPSBudWxsO1xyXG4gICAgdGhpcy5yb3dzQWZ0ZXJGaWx0ZXIgPSBudWxsO1xyXG4gICAgdGhpcy5yb3dzQWZ0ZXJTb3J0ID0gbnVsbDtcclxuICAgIHRoaXMucm93c0FmdGVyTWFwID0gbnVsbDtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5jcmVhdGVNb2RlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5tb2RlbCA9IHtcclxuICAgICAgICAvLyB0aGlzIG1ldGhvZCBpcyBpbXBsZW1lbnRlZCBieSB0aGUgaW5NZW1vcnkgbW9kZWwgb25seSxcclxuICAgICAgICAvLyBpdCBnaXZlcyB0aGUgdG9wIGxldmVsIG9mIHRoZSBzZWxlY3Rpb24uIHVzZWQgYnkgdGhlIHNlbGVjdGlvblxyXG4gICAgICAgIC8vIGNvbnRyb2xsZXIsIHdoZW4gaXQgbmVlZHMgdG8gZG8gYSBmdWxsIHRyYXZlcnNhbFxyXG4gICAgICAgIGdldFRvcExldmVsTm9kZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC5yb3dzQWZ0ZXJHcm91cDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldFZpcnR1YWxSb3c6IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGF0LnJvd3NBZnRlck1hcFtpbmRleF07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRWaXJ0dWFsUm93Q291bnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhhdC5yb3dzQWZ0ZXJNYXApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGF0LnJvd3NBZnRlck1hcC5sZW5ndGg7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9yRWFjaEluTWVtb3J5OiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICB0aGF0LmZvckVhY2hJbk1lbW9yeShjYWxsYmFjayk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuXHJcbi8vIHB1YmxpY1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmdldE1vZGVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbDtcclxufTtcclxuXHJcbi8vIHB1YmxpY1xyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmZvckVhY2hJbk1lbW9yeSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcblxyXG4gICAgLy8gaXRlcmF0ZXMgdGhyb3VnaCBlYWNoIGl0ZW0gaW4gbWVtb3J5LCBhbmQgY2FsbHMgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXHJcbiAgICBmdW5jdGlvbiBkb0NhbGxiYWNrKGxpc3QsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKGxpc3QpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGk8bGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soaXRlbSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5ncm91cCAmJiBncm91cC5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvQ2FsbGJhY2soZ3JvdXAuY2hpbGRyZW4pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRvQ2FsbGJhY2sodGhpcy5yb3dzQWZ0ZXJHcm91cCwgY2FsbGJhY2spO1xyXG59O1xyXG5cclxuLy8gcHVibGljXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlTW9kZWwgPSBmdW5jdGlvbihzdGVwKSB7XHJcblxyXG4gICAgLy8gZmFsbHRocm91Z2ggaW4gYmVsb3cgc3dpdGNoIGlzIG9uIHB1cnBvc2VcclxuICAgIHN3aXRjaCAoc3RlcCkge1xyXG4gICAgICAgIGNhc2UgY29uc3RhbnRzLlNURVBfRVZFUllUSElORzpcclxuICAgICAgICBjYXNlIGNvbnN0YW50cy5TVEVQX0ZJTFRFUjpcclxuICAgICAgICAgICAgdGhpcy5kb0ZpbHRlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmRvQWdncmVnYXRlKCk7XHJcbiAgICAgICAgY2FzZSBjb25zdGFudHMuU1RFUF9TT1JUOlxyXG4gICAgICAgICAgICB0aGlzLmRvU29ydCgpO1xyXG4gICAgICAgIGNhc2UgY29uc3RhbnRzLlNURVBfTUFQOlxyXG4gICAgICAgICAgICB0aGlzLmRvR3JvdXBNYXBwaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRNb2RlbFVwZGF0ZWQoKSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldE1vZGVsVXBkYXRlZCgpKCk7XHJcbiAgICAgICAgdmFyICRzY29wZSA9IHRoaXMuJHNjb3BlO1xyXG4gICAgICAgIGlmICgkc2NvcGUpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5kZWZhdWx0R3JvdXBBZ2dGdW5jdGlvbkZhY3RvcnkgPSBmdW5jdGlvbihncm91cEFnZ0ZpZWxkcykge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGdyb3VwQWdnRnVuY3Rpb24ocm93cykge1xyXG5cclxuICAgICAgICB2YXIgc3VtcyA9IHt9O1xyXG5cclxuICAgICAgICBmb3IgKHZhciBqID0gMDsgajxncm91cEFnZ0ZpZWxkcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICB2YXIgY29sS2V5ID0gZ3JvdXBBZ2dGaWVsZHNbal07XHJcbiAgICAgICAgICAgIHZhciB0b3RhbEZvckNvbHVtbiA9IG51bGw7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpPHJvd3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciByb3cgPSByb3dzW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRoaXNDb2x1bW5WYWx1ZSA9IHJvdy5kYXRhW2NvbEtleV07XHJcbiAgICAgICAgICAgICAgICAvLyBvbmx5IGluY2x1ZGUgaWYgdGhlIHZhbHVlIGlzIGEgbnVtYmVyXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRoaXNDb2x1bW5WYWx1ZSA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbEZvckNvbHVtbiArPSB0aGlzQ29sdW1uVmFsdWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gYXQgdGhpcyBwb2ludCwgaWYgbm8gdmFsdWVzIHdlcmUgbnVtYmVycywgdGhlIHJlc3VsdCBpcyBudWxsIChub3QgemVybylcclxuICAgICAgICAgICAgc3Vtc1tjb2xLZXldID0gdG90YWxGb3JDb2x1bW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc3VtcztcclxuXHJcbiAgICB9O1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24oZGF0YSwgY29sRGVmLCBub2RlLCByb3dJbmRleCkge1xyXG4gICAgdmFyIGFwaSA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpO1xyXG4gICAgdmFyIGNvbnRleHQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCk7XHJcbiAgICByZXR1cm4gdXRpbHMuZ2V0VmFsdWUodGhpcy5leHByZXNzaW9uU2VydmljZSwgZGF0YSwgY29sRGVmLCBub2RlLCByb3dJbmRleCwgYXBpLCBjb250ZXh0KTtcclxufTtcclxuXHJcbi8vIHB1YmxpYyAtIGl0J3MgcG9zc2libGUgdG8gcmVjb21wdXRlIHRoZSBhZ2dyZWdhdGUgd2l0aG91dCBkb2luZyB0aGUgb3RoZXIgcGFydHNcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5kb0FnZ3JlZ2F0ZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBncm91cEFnZ0Z1bmN0aW9uID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0R3JvdXBBZ2dGdW5jdGlvbigpO1xyXG4gICAgaWYgKHR5cGVvZiBncm91cEFnZ0Z1bmN0aW9uID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5yZWN1cnNpdmVseUNyZWF0ZUFnZ0RhdGEodGhpcy5yb3dzQWZ0ZXJGaWx0ZXIsIGdyb3VwQWdnRnVuY3Rpb24pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZ3JvdXBBZ2dGaWVsZHMgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcm91cEFnZ0ZpZWxkcygpO1xyXG4gICAgaWYgKGdyb3VwQWdnRmllbGRzKSB7XHJcbiAgICAgICAgdmFyIGRlZmF1bHRBZ2dGdW5jdGlvbiA9IHRoaXMuZGVmYXVsdEdyb3VwQWdnRnVuY3Rpb25GYWN0b3J5KGdyb3VwQWdnRmllbGRzKTtcclxuICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5Q3JlYXRlQWdnRGF0YSh0aGlzLnJvd3NBZnRlckZpbHRlciwgZGVmYXVsdEFnZ0Z1bmN0aW9uKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuLy8gcHVibGljXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZXhwYW5kT3JDb2xsYXBzZUFsbCA9IGZ1bmN0aW9uKGV4cGFuZCwgcm93Tm9kZXMpIHtcclxuICAgIC8vIGlmIGZpcnN0IGNhbGwgaW4gcmVjdXJzaW9uLCB3ZSBzZXQgbGlzdCB0byBwYXJlbnQgbGlzdFxyXG4gICAgaWYgKHJvd05vZGVzID09PSBudWxsKSB7XHJcbiAgICAgICAgcm93Tm9kZXMgPSB0aGlzLnJvd3NBZnRlckdyb3VwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghcm93Tm9kZXMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgIHJvd05vZGVzLmZvckVhY2goZnVuY3Rpb24obm9kZSkge1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIG5vZGUuZXhwYW5kZWQgPSBleHBhbmQ7XHJcbiAgICAgICAgICAgIF90aGlzLmV4cGFuZE9yQ29sbGFwc2VBbGwoZXhwYW5kLCBub2RlLmNoaWxkcmVuKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5yZWN1cnNpdmVseUNyZWF0ZUFnZ0RhdGEgPSBmdW5jdGlvbihub2RlcywgZ3JvdXBBZ2dGdW5jdGlvbikge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBub2Rlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldO1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIC8vIGFnZyBmdW5jdGlvbiBuZWVkcyB0byBzdGFydCBhdCB0aGUgYm90dG9tLCBzbyB0cmF2ZXJzZSBmaXJzdFxyXG4gICAgICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5Q3JlYXRlQWdnRGF0YShub2RlLmNoaWxkcmVuQWZ0ZXJGaWx0ZXIsIGdyb3VwQWdnRnVuY3Rpb24pO1xyXG4gICAgICAgICAgICAvLyBhZnRlciB0cmF2ZXJzYWwsIHdlIGNhbiBub3cgZG8gdGhlIGFnZyBhdCB0aGlzIGxldmVsXHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gZ3JvdXBBZ2dGdW5jdGlvbihub2RlLmNoaWxkcmVuQWZ0ZXJGaWx0ZXIpO1xyXG4gICAgICAgICAgICBub2RlLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgICAgICAvLyBpZiB3ZSBhcmUgZ3JvdXBpbmcsIHRoZW4gaXQncyBwb3NzaWJsZSB0aGVyZSBpcyBhIHNpYmxpbmcgZm9vdGVyXHJcbiAgICAgICAgICAgIC8vIHRvIHRoZSBncm91cCwgc28gdXBkYXRlIHRoZSBkYXRhIGhlcmUgYWxzbyBpZiB0aGVyZSBpcyBvbmVcclxuICAgICAgICAgICAgaWYgKG5vZGUuc2libGluZykge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5zaWJsaW5nLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmRvU29ydCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHNvcnRpbmc7XHJcblxyXG4gICAgLy8gaWYgdGhlIHNvcnRpbmcgaXMgYWxyZWFkeSBkb25lIGJ5IHRoZSBzZXJ2ZXIsIHRoZW4gd2Ugc2hvdWxkIG5vdCBkbyBpdCBoZXJlXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNFbmFibGVTZXJ2ZXJTaWRlU29ydGluZygpKSB7XHJcbiAgICAgICAgc29ydGluZyA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvL3NlZSBpZiB0aGVyZSBpcyBhIGNvbCB3ZSBhcmUgc29ydGluZyBieVxyXG4gICAgICAgIHZhciBzb3J0aW5nT3B0aW9ucyA9IFtdO1xyXG4gICAgICAgIHRoaXMuY29sdW1uTW9kZWwuZ2V0QWxsQ29sdW1ucygpLmZvckVhY2goZnVuY3Rpb24oY29sdW1uKSB7XHJcbiAgICAgICAgICAgIGlmIChjb2x1bW4uc29ydCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGFzY2VuZGluZyA9IGNvbHVtbi5zb3J0ID09PSBjb25zdGFudHMuQVNDO1xyXG4gICAgICAgICAgICAgICAgc29ydGluZ09wdGlvbnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgaW52ZXJ0ZXI6IGFzY2VuZGluZyA/IDEgOiAtMSxcclxuICAgICAgICAgICAgICAgICAgICBzb3J0ZWRBdDogY29sdW1uLnNvcnRlZEF0LFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbERlZjogY29sdW1uLmNvbERlZlxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoc29ydGluZ09wdGlvbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBzb3J0aW5nID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHJvd05vZGVzUmVhZHlGb3JTb3J0aW5nID0gdGhpcy5yb3dzQWZ0ZXJGaWx0ZXIgPyB0aGlzLnJvd3NBZnRlckZpbHRlci5zbGljZSgwKSA6IG51bGw7XHJcblxyXG4gICAgaWYgKHNvcnRpbmcpIHtcclxuICAgICAgICAvLyBUaGUgY29sdW1ucyBhcmUgdG8gYmUgc29ydGVkIGluIHRoZSBvcmRlciB0aGF0IHRoZSB1c2VyIHNlbGVjdGVkIHRoZW06XHJcbiAgICAgICAgc29ydGluZ09wdGlvbnMuc29ydChmdW5jdGlvbihvcHRpb25BLCBvcHRpb25CKXtcclxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbkEuc29ydGVkQXQgLSBvcHRpb25CLnNvcnRlZEF0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc29ydExpc3Qocm93Tm9kZXNSZWFkeUZvclNvcnRpbmcsIHNvcnRpbmdPcHRpb25zKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gaWYgbm8gc29ydGluZywgc2V0IGFsbCBncm91cCBjaGlsZHJlbiBhZnRlciBzb3J0IHRvIHRoZSBvcmlnaW5hbCBsaXN0LlxyXG4gICAgICAgIC8vIG5vdGU6IGl0IGlzIGltcG9ydGFudCB0byBkbyB0aGlzLCBldmVuIGlmIGRvaW5nIHNlcnZlciBzaWRlIHNvcnRpbmcsXHJcbiAgICAgICAgLy8gdG8gYWxsb3cgdGhlIHJvd3MgdG8gcGFzcyB0byB0aGUgbmV4dCBzdGFnZSAoaWUgc2V0IHRoZSBub2RlIHZhbHVlXHJcbiAgICAgICAgLy8gY2hpbGRyZW5BZnRlclNvcnQpXHJcbiAgICAgICAgdGhpcy5yZWN1cnNpdmVseVJlc2V0U29ydChyb3dOb2Rlc1JlYWR5Rm9yU29ydGluZyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yb3dzQWZ0ZXJTb3J0ID0gcm93Tm9kZXNSZWFkeUZvclNvcnRpbmc7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlSZXNldFNvcnQgPSBmdW5jdGlvbihyb3dOb2Rlcykge1xyXG4gICAgaWYgKCFyb3dOb2Rlcykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gcm93Tm9kZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGl0ZW0gPSByb3dOb2Rlc1tpXTtcclxuICAgICAgICBpZiAoaXRlbS5ncm91cCAmJiBpdGVtLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgIGl0ZW0uY2hpbGRyZW5BZnRlclNvcnQgPSBpdGVtLmNoaWxkcmVuQWZ0ZXJGaWx0ZXI7XHJcbiAgICAgICAgICAgIHRoaXMucmVjdXJzaXZlbHlSZXNldFNvcnQoaXRlbS5jaGlsZHJlbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnNvcnRMaXN0ID0gZnVuY3Rpb24obm9kZXMsIHNvcnRPcHRpb25zKSB7XHJcblxyXG4gICAgLy8gc29ydCBhbnkgZ3JvdXBzIHJlY3Vyc2l2ZWx5XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG5vZGVzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyAvLyBjcml0aWNhbCBzZWN0aW9uLCBubyBmdW5jdGlvbmFsIHByb2dyYW1taW5nXHJcbiAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgIG5vZGUuY2hpbGRyZW5BZnRlclNvcnQgPSBub2RlLmNoaWxkcmVuQWZ0ZXJGaWx0ZXIuc2xpY2UoMCk7XHJcbiAgICAgICAgICAgIHRoaXMuc29ydExpc3Qobm9kZS5jaGlsZHJlbkFmdGVyU29ydCwgc29ydE9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBmdW5jdGlvbiBjb21wYXJlKG9iakEsIG9iakIsIGNvbERlZil7XHJcbiAgICAgICAgdmFyIHZhbHVlQSA9IHRoYXQuZ2V0VmFsdWUob2JqQS5kYXRhLCBjb2xEZWYsIG9iakEpO1xyXG4gICAgICAgIHZhciB2YWx1ZUIgPSB0aGF0LmdldFZhbHVlKG9iakIuZGF0YSwgY29sRGVmLCBvYmpCKTtcclxuICAgICAgICBpZiAoY29sRGVmLmNvbXBhcmF0b3IpIHtcclxuICAgICAgICAgICAgLy9pZiBjb21wYXJhdG9yIHByb3ZpZGVkLCB1c2UgaXRcclxuICAgICAgICAgICAgcmV0dXJuIGNvbERlZi5jb21wYXJhdG9yKHZhbHVlQSwgdmFsdWVCLCBvYmpBLCBvYmpCKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvL290aGVyd2lzZSBkbyBvdXIgb3duIGNvbXBhcmlzb25cclxuICAgICAgICAgICAgcmV0dXJuIHV0aWxzLmRlZmF1bHRDb21wYXJhdG9yKHZhbHVlQSwgdmFsdWVCLCBvYmpBLCBvYmpCKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbm9kZXMuc29ydChmdW5jdGlvbihvYmpBLCBvYmpCKSB7XHJcbiAgICAgICAgLy8gSXRlcmF0ZSBjb2x1bW5zLCByZXR1cm4gdGhlIGZpcnN0IHRoYXQgZG9lc24ndCBtYXRjaFxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzb3J0T3B0aW9ucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgc29ydE9wdGlvbiA9IHNvcnRPcHRpb25zW2ldO1xyXG4gICAgICAgICAgICB2YXIgY29tcGFyZWQgPSBjb21wYXJlKG9iakEsIG9iakIsIHNvcnRPcHRpb24uY29sRGVmKTtcclxuICAgICAgICAgICAgaWYgKGNvbXBhcmVkICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcGFyZWQgKiBzb3J0T3B0aW9uLmludmVydGVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEFsbCBtYXRjaGVkLCB0aGVzZSBhcmUgaWRlbnRpY2FsIGFzIGZhciBhcyB0aGUgc29ydCBpcyBjb25jZXJuZWQ6XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5kb0dyb3VwaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcm93c0FmdGVyR3JvdXA7XHJcbiAgICB2YXIgZ3JvdXBlZENvbHMgPSB0aGlzLmNvbHVtbk1vZGVsLmdldEdyb3VwZWRDb2x1bW5zKCk7XHJcbiAgICB2YXIgcm93c0FscmVhZHlHcm91cGVkID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNSb3dzQWxyZWFkeUdyb3VwZWQoKTtcclxuXHJcbiAgICB2YXIgZG9pbmdHcm91cGluZyA9ICFyb3dzQWxyZWFkeUdyb3VwZWQgJiYgZ3JvdXBlZENvbHMubGVuZ3RoID4gMDtcclxuXHJcbiAgICBpZiAoZG9pbmdHcm91cGluZykge1xyXG4gICAgICAgIHZhciBleHBhbmRCeURlZmF1bHQgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRHcm91cERlZmF1bHRFeHBhbmRlZCgpO1xyXG4gICAgICAgIHJvd3NBZnRlckdyb3VwID0gZ3JvdXBDcmVhdG9yLmdyb3VwKHRoaXMuYWxsUm93cywgZ3JvdXBlZENvbHMsXHJcbiAgICAgICAgICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEdyb3VwQWdnRnVuY3Rpb24oKSwgZXhwYW5kQnlEZWZhdWx0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcm93c0FmdGVyR3JvdXAgPSB0aGlzLmFsbFJvd3M7XHJcbiAgICB9XHJcbiAgICB0aGlzLnJvd3NBZnRlckdyb3VwID0gcm93c0FmdGVyR3JvdXA7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBkb2luZ0ZpbHRlcjtcclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNFbmFibGVTZXJ2ZXJTaWRlRmlsdGVyKCkpIHtcclxuICAgICAgICBkb2luZ0ZpbHRlciA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgcXVpY2tGaWx0ZXJQcmVzZW50ID0gdGhpcy5hbmd1bGFyR3JpZC5nZXRRdWlja0ZpbHRlcigpICE9PSBudWxsO1xyXG4gICAgICAgIHZhciBhZHZhbmNlZEZpbHRlclByZXNlbnQgPSB0aGlzLmZpbHRlck1hbmFnZXIuaXNGaWx0ZXJQcmVzZW50KCk7XHJcbiAgICAgICAgZG9pbmdGaWx0ZXIgPSBxdWlja0ZpbHRlclByZXNlbnQgfHwgYWR2YW5jZWRGaWx0ZXJQcmVzZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHZhciByb3dzQWZ0ZXJGaWx0ZXI7XHJcbiAgICBpZiAoZG9pbmdGaWx0ZXIpIHtcclxuICAgICAgICByb3dzQWZ0ZXJGaWx0ZXIgPSB0aGlzLmZpbHRlckl0ZW1zKHRoaXMucm93c0FmdGVyR3JvdXAsIHF1aWNrRmlsdGVyUHJlc2VudCwgYWR2YW5jZWRGaWx0ZXJQcmVzZW50KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gZG8gaXQgaGVyZVxyXG4gICAgICAgIHJvd3NBZnRlckZpbHRlciA9IHRoaXMucm93c0FmdGVyR3JvdXA7XHJcbiAgICAgICAgdGhpcy5yZWN1cnNpdmVseVJlc2V0RmlsdGVyKHRoaXMucm93c0FmdGVyR3JvdXApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5yb3dzQWZ0ZXJGaWx0ZXIgPSByb3dzQWZ0ZXJGaWx0ZXI7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZmlsdGVySXRlbXMgPSBmdW5jdGlvbihyb3dOb2RlcywgcXVpY2tGaWx0ZXJQcmVzZW50LCBhZHZhbmNlZEZpbHRlclByZXNlbnQpIHtcclxuICAgIHZhciByZXN1bHQgPSBbXTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHJvd05vZGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gcm93Tm9kZXNbaV07XHJcblxyXG4gICAgICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgIC8vIGRlYWwgd2l0aCBncm91cFxyXG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuQWZ0ZXJGaWx0ZXIgPSB0aGlzLmZpbHRlckl0ZW1zKG5vZGUuY2hpbGRyZW4sIHF1aWNrRmlsdGVyUHJlc2VudCwgYWR2YW5jZWRGaWx0ZXJQcmVzZW50KTtcclxuICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW5BZnRlckZpbHRlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLmFsbENoaWxkcmVuQ291bnQgPSB0aGlzLmdldFRvdGFsQ2hpbGRDb3VudChub2RlLmNoaWxkcmVuQWZ0ZXJGaWx0ZXIpO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kb2VzUm93UGFzc0ZpbHRlcihub2RlLCBxdWlja0ZpbHRlclByZXNlbnQsIGFkdmFuY2VkRmlsdGVyUHJlc2VudCkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlSZXNldEZpbHRlciA9IGZ1bmN0aW9uKG5vZGVzKSB7XHJcbiAgICBpZiAoIW5vZGVzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBub2Rlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldO1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgbm9kZS5jaGlsZHJlbkFmdGVyRmlsdGVyID0gbm9kZS5jaGlsZHJlbjtcclxuICAgICAgICAgICAgbm9kZS5hbGxDaGlsZHJlbkNvdW50ID0gdGhpcy5nZXRUb3RhbENoaWxkQ291bnQobm9kZS5jaGlsZHJlbkFmdGVyRmlsdGVyKTtcclxuICAgICAgICAgICAgdGhpcy5yZWN1cnNpdmVseVJlc2V0RmlsdGVyKG5vZGUuY2hpbGRyZW4pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuLy8gcm93czogdGhlIHJvd3MgdG8gcHV0IGludG8gdGhlIG1vZGVsXHJcbi8vIGZpcnN0SWQ6IHRoZSBmaXJzdCBpZCB0byB1c2UsIHVzZWQgZm9yIHBhZ2luZywgd2hlcmUgd2UgYXJlIG5vdCBvbiB0aGUgZmlyc3QgcGFnZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLnNldEFsbFJvd3MgPSBmdW5jdGlvbihyb3dzLCBmaXJzdElkKSB7XHJcbiAgICB2YXIgbm9kZXM7XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNSb3dzQWxyZWFkeUdyb3VwZWQoKSkge1xyXG4gICAgICAgIG5vZGVzID0gcm93cztcclxuICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5Q2hlY2tVc2VyUHJvdmlkZWROb2Rlcyhub2RlcywgbnVsbCwgMCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIHBsYWNlIGVhY2ggcm93IGludG8gYSB3cmFwcGVyXHJcbiAgICAgICAgdmFyIG5vZGVzID0gW107XHJcbiAgICAgICAgaWYgKHJvd3MpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgaSsrKSB7IC8vIGNvdWxkIGJlIGxvdHMgb2Ygcm93cywgZG9uJ3QgdXNlIGZ1bmN0aW9uYWwgcHJvZ3JhbW1pbmdcclxuICAgICAgICAgICAgICAgIG5vZGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHJvd3NbaV1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGZpcnN0SWQgcHJvdmlkZWQsIHVzZSBpdCwgb3RoZXJ3aXNlIHN0YXJ0IGF0IDBcclxuICAgIHZhciBmaXJzdElkVG9Vc2UgPSBmaXJzdElkID8gZmlyc3RJZCA6IDA7XHJcbiAgICB0aGlzLnJlY3Vyc2l2ZWx5QWRkSWRUb05vZGVzKG5vZGVzLCBmaXJzdElkVG9Vc2UpO1xyXG4gICAgdGhpcy5hbGxSb3dzID0gbm9kZXM7XHJcblxyXG4gICAgLy8gYWdncmVnYXRlIGhlcmUsIHNvIGZpbHRlcnMgaGF2ZSB0aGUgYWdnIGRhdGEgcmVhZHlcclxuICAgIHRoaXMuZG9Hcm91cGluZygpO1xyXG59O1xyXG5cclxuLy8gYWRkIGluIGluZGV4IC0gdGhpcyBpcyB1c2VkIGJ5IHRoZSBzZWxlY3Rpb25Db250cm9sbGVyIC0gc28gcXVpY2tcclxuLy8gdG8gbG9vayB1cCBzZWxlY3RlZCByb3dzXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlBZGRJZFRvTm9kZXMgPSBmdW5jdGlvbihub2RlcywgaW5kZXgpIHtcclxuICAgIGlmICghbm9kZXMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICBub2RlLmlkID0gaW5kZXgrKztcclxuICAgICAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgIGluZGV4ID0gdGhpcy5yZWN1cnNpdmVseUFkZElkVG9Ob2Rlcyhub2RlLmNoaWxkcmVuLCBpbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGluZGV4O1xyXG59O1xyXG5cclxuLy8gYWRkIGluIGluZGV4IC0gdGhpcyBpcyB1c2VkIGJ5IHRoZSBzZWxlY3Rpb25Db250cm9sbGVyIC0gc28gcXVpY2tcclxuLy8gdG8gbG9vayB1cCBzZWxlY3RlZCByb3dzXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlDaGVja1VzZXJQcm92aWRlZE5vZGVzID0gZnVuY3Rpb24obm9kZXMsIHBhcmVudCwgbGV2ZWwpIHtcclxuICAgIGlmICghbm9kZXMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgICAgIG5vZGUucGFyZW50ID0gcGFyZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBub2RlLmxldmVsID0gbGV2ZWw7XHJcbiAgICAgICAgaWYgKG5vZGUuZ3JvdXAgJiYgbm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5Q2hlY2tVc2VyUHJvdmlkZWROb2Rlcyhub2RlLmNoaWxkcmVuLCBub2RlLCBsZXZlbCArIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5nZXRUb3RhbENoaWxkQ291bnQgPSBmdW5jdGlvbihyb3dOb2Rlcykge1xyXG4gICAgdmFyIGNvdW50ID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gcm93Tm9kZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGl0ZW0gPSByb3dOb2Rlc1tpXTtcclxuICAgICAgICBpZiAoaXRlbS5ncm91cCkge1xyXG4gICAgICAgICAgICBjb3VudCArPSBpdGVtLmFsbENoaWxkcmVuQ291bnQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY291bnQ7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuY29weUdyb3VwTm9kZSA9IGZ1bmN0aW9uKGdyb3VwTm9kZSwgY2hpbGRyZW4sIGFsbENoaWxkcmVuQ291bnQpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ3JvdXA6IHRydWUsXHJcbiAgICAgICAgZGF0YTogZ3JvdXBOb2RlLmRhdGEsXHJcbiAgICAgICAgZmllbGQ6IGdyb3VwTm9kZS5maWVsZCxcclxuICAgICAgICBrZXk6IGdyb3VwTm9kZS5rZXksXHJcbiAgICAgICAgZXhwYW5kZWQ6IGdyb3VwTm9kZS5leHBhbmRlZCxcclxuICAgICAgICBjaGlsZHJlbjogY2hpbGRyZW4sXHJcbiAgICAgICAgYWxsQ2hpbGRyZW5Db3VudDogYWxsQ2hpbGRyZW5Db3VudCxcclxuICAgICAgICBsZXZlbDogZ3JvdXBOb2RlLmxldmVsXHJcbiAgICB9O1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmRvR3JvdXBNYXBwaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBldmVuIGlmIG5vdCBnb2luZyBncm91cGluZywgd2UgZG8gdGhlIG1hcHBpbmcsIGFzIHRoZSBjbGllbnQgbWlnaHRcclxuICAgIC8vIG9mIHBhc3NlZCBpbiBkYXRhIHRoYXQgYWxyZWFkeSBoYXMgYSBncm91cGluZyBpbiBpdCBzb21ld2hlcmVcclxuICAgIHZhciByb3dzQWZ0ZXJNYXAgPSBbXTtcclxuICAgIHRoaXMuYWRkVG9NYXAocm93c0FmdGVyTWFwLCB0aGlzLnJvd3NBZnRlclNvcnQpO1xyXG4gICAgdGhpcy5yb3dzQWZ0ZXJNYXAgPSByb3dzQWZ0ZXJNYXA7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuYWRkVG9NYXAgPSBmdW5jdGlvbihtYXBwZWREYXRhLCBvcmlnaW5hbE5vZGVzKSB7XHJcbiAgICBpZiAoIW9yaWdpbmFsTm9kZXMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9yaWdpbmFsTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IG9yaWdpbmFsTm9kZXNbaV07XHJcbiAgICAgICAgbWFwcGVkRGF0YS5wdXNoKG5vZGUpO1xyXG4gICAgICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuZXhwYW5kZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRUb01hcChtYXBwZWREYXRhLCBub2RlLmNoaWxkcmVuQWZ0ZXJTb3J0KTtcclxuXHJcbiAgICAgICAgICAgIC8vIHB1dCBhIGZvb3RlciBpbiBpZiB1c2VyIGlzIGxvb2tpbmcgZm9yIGl0XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwSW5jbHVkZUZvb3RlcigpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZm9vdGVyTm9kZSA9IHRoaXMuY3JlYXRlRm9vdGVyTm9kZShub2RlKTtcclxuICAgICAgICAgICAgICAgIG1hcHBlZERhdGEucHVzaChmb290ZXJOb2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuSW5NZW1vcnlSb3dDb250cm9sbGVyLnByb3RvdHlwZS5jcmVhdGVGb290ZXJOb2RlID0gZnVuY3Rpb24oZ3JvdXBOb2RlKSB7XHJcbiAgICB2YXIgZm9vdGVyTm9kZSA9IHt9O1xyXG4gICAgT2JqZWN0LmtleXMoZ3JvdXBOb2RlKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIGZvb3Rlck5vZGVba2V5XSA9IGdyb3VwTm9kZVtrZXldO1xyXG4gICAgfSk7XHJcbiAgICBmb290ZXJOb2RlLmZvb3RlciA9IHRydWU7XHJcbiAgICAvLyBnZXQgYm90aCBoZWFkZXIgYW5kIGZvb3RlciB0byByZWZlcmVuY2UgZWFjaCBvdGhlciBhcyBzaWJsaW5ncy4gdGhpcyBpcyBuZXZlciB1bmRvbmUsXHJcbiAgICAvLyBvbmx5IG92ZXJ3cml0dGVuLiBzbyBpZiBhIGdyb3VwIGlzIGV4cGFuZGVkLCB0aGVuIGNvbnRyYWN0ZWQsIGl0IHdpbGwgaGF2ZSBhIGdob3N0XHJcbiAgICAvLyBzaWJsaW5nIC0gYnV0IHRoYXQncyBmaW5lLCBhcyB3ZSBjYW4gaWdub3JlIHRoaXMgaWYgdGhlIGhlYWRlciBpcyBjb250cmFjdGVkLlxyXG4gICAgZm9vdGVyTm9kZS5zaWJsaW5nID0gZ3JvdXBOb2RlO1xyXG4gICAgZ3JvdXBOb2RlLnNpYmxpbmcgPSBmb290ZXJOb2RlO1xyXG4gICAgcmV0dXJuIGZvb3Rlck5vZGU7XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcbkluTWVtb3J5Um93Q29udHJvbGxlci5wcm90b3R5cGUuZG9lc1Jvd1Bhc3NGaWx0ZXIgPSBmdW5jdGlvbihub2RlLCBxdWlja0ZpbHRlclByZXNlbnQsIGFkdmFuY2VkRmlsdGVyUHJlc2VudCkge1xyXG4gICAgLy9maXJzdCB1cCwgY2hlY2sgcXVpY2sgZmlsdGVyXHJcbiAgICBpZiAocXVpY2tGaWx0ZXJQcmVzZW50KSB7XHJcbiAgICAgICAgaWYgKCFub2RlLnF1aWNrRmlsdGVyQWdncmVnYXRlVGV4dCkge1xyXG4gICAgICAgICAgICB0aGlzLmFnZ3JlZ2F0ZVJvd0ZvclF1aWNrRmlsdGVyKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobm9kZS5xdWlja0ZpbHRlckFnZ3JlZ2F0ZVRleHQuaW5kZXhPZih0aGlzLmFuZ3VsYXJHcmlkLmdldFF1aWNrRmlsdGVyKCkpIDwgMCkge1xyXG4gICAgICAgICAgICAvL3F1aWNrIGZpbHRlciBmYWlscywgc28gc2tpcCBpdGVtXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy9zZWNvbmQsIGNoZWNrIGFkdmFuY2VkIGZpbHRlclxyXG4gICAgaWYgKGFkdmFuY2VkRmlsdGVyUHJlc2VudCkge1xyXG4gICAgICAgIGlmICghdGhpcy5maWx0ZXJNYW5hZ2VyLmRvZXNGaWx0ZXJQYXNzKG5vZGUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy9nb3QgdGhpcyBmYXIsIGFsbCBmaWx0ZXJzIHBhc3NcclxuICAgIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5Jbk1lbW9yeVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmFnZ3JlZ2F0ZVJvd0ZvclF1aWNrRmlsdGVyID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIGFnZ3JlZ2F0ZWRUZXh0ID0gJyc7XHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsLmdldEFsbENvbHVtbnMoKS5mb3JFYWNoKGZ1bmN0aW9uKGNvbERlZldyYXBwZXIpIHtcclxuICAgICAgICB2YXIgZGF0YSA9IG5vZGUuZGF0YTtcclxuICAgICAgICB2YXIgdmFsdWUgPSBkYXRhID8gZGF0YVtjb2xEZWZXcmFwcGVyLmNvbERlZi5maWVsZF0gOiBudWxsO1xyXG4gICAgICAgIGlmICh2YWx1ZSAmJiB2YWx1ZSAhPT0gJycpIHtcclxuICAgICAgICAgICAgYWdncmVnYXRlZFRleHQgPSBhZ2dyZWdhdGVkVGV4dCArIHZhbHVlLnRvU3RyaW5nKCkudG9VcHBlckNhc2UoKSArIFwiX1wiO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgbm9kZS5xdWlja0ZpbHRlckFnZ3JlZ2F0ZVRleHQgPSBhZ2dyZWdhdGVkVGV4dDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSW5NZW1vcnlSb3dDb250cm9sbGVyO1xyXG4iLCJ2YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL3BhZ2luYXRpb25QYW5lbC5odG1sJyk7XHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcclxuXHJcbmZ1bmN0aW9uIFBhZ2luYXRpb25Db250cm9sbGVyKCkge31cclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oYW5ndWxhckdyaWQsIGdyaWRPcHRpb25zV3JhcHBlcikge1xyXG4gICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIgPSBncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkID0gYW5ndWxhckdyaWQ7XHJcbiAgICB0aGlzLnNldHVwQ29tcG9uZW50cygpO1xyXG4gICAgdGhpcy5jYWxsVmVyc2lvbiA9IDA7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuc2V0RGF0YXNvdXJjZSA9IGZ1bmN0aW9uKGRhdGFzb3VyY2UpIHtcclxuICAgIHRoaXMuZGF0YXNvdXJjZSA9IGRhdGFzb3VyY2U7XHJcblxyXG4gICAgaWYgKCFkYXRhc291cmNlKSB7XHJcbiAgICAgICAgLy8gb25seSBjb250aW51ZSBpZiB3ZSBoYXZlIGEgdmFsaWQgZGF0YXNvdXJjZSB0byB3b3JrIHdpdGhcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZXNldCgpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBjb3B5IHBhZ2VTaXplLCB0byBndWFyZCBhZ2FpbnN0IGl0IGNoYW5naW5nIHRoZSB0aGUgZGF0YXNvdXJjZSBiZXR3ZWVuIGNhbGxzXHJcbiAgICBpZiAodGhpcy5kYXRhc291cmNlLnBhZ2VTaXplICYmIHR5cGVvZiB0aGlzLmRhdGFzb3VyY2UucGFnZVNpemUgIT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdkYXRhc291cmNlLnBhZ2VTaXplIHNob3VsZCBiZSBhIG51bWJlcicpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5wYWdlU2l6ZSA9IHRoaXMuZGF0YXNvdXJjZS5wYWdlU2l6ZTtcclxuICAgIC8vIHNlZSBpZiB3ZSBrbm93IHRoZSB0b3RhbCBudW1iZXIgb2YgcGFnZXMsIG9yIGlmIGl0J3MgJ3RvIGJlIGRlY2lkZWQnXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZGF0YXNvdXJjZS5yb3dDb3VudCA9PT0gJ251bWJlcicgJiYgdGhpcy5kYXRhc291cmNlLnJvd0NvdW50ID49IDApIHtcclxuICAgICAgICB0aGlzLnJvd0NvdW50ID0gdGhpcy5kYXRhc291cmNlLnJvd0NvdW50O1xyXG4gICAgICAgIHRoaXMuZm91bmRNYXhSb3cgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlVG90YWxQYWdlcygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnJvd0NvdW50ID0gMDtcclxuICAgICAgICB0aGlzLmZvdW5kTWF4Um93ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy50b3RhbFBhZ2VzID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmN1cnJlbnRQYWdlID0gMDtcclxuXHJcbiAgICAvLyBoaWRlIHRoZSBzdW1tYXJ5IHBhbmVsIHVudGlsIHNvbWV0aGluZyBpcyBsb2FkZWRcclxuICAgIHRoaXMuZVBhZ2VSb3dTdW1tYXJ5UGFuZWwuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xyXG5cclxuICAgIHRoaXMuc2V0VG90YWxMYWJlbHMoKTtcclxuICAgIHRoaXMubG9hZFBhZ2UoKTtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5zZXRUb3RhbExhYmVscyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuZm91bmRNYXhSb3cpIHtcclxuICAgICAgICB0aGlzLmxiVG90YWwuaW5uZXJIVE1MID0gdGhpcy50b3RhbFBhZ2VzLnRvTG9jYWxlU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy5sYlJlY29yZENvdW50LmlubmVySFRNTCA9IHRoaXMucm93Q291bnQudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIG1vcmVUZXh0ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0TG9jYWxlVGV4dEZ1bmMoKSgnbW9yZScsICdtb3JlJyk7XHJcbiAgICAgICAgdGhpcy5sYlRvdGFsLmlubmVySFRNTCA9IG1vcmVUZXh0O1xyXG4gICAgICAgIHRoaXMubGJSZWNvcmRDb3VudC5pbm5lckhUTUwgPSBtb3JlVGV4dDtcclxuICAgIH1cclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5jYWxjdWxhdGVUb3RhbFBhZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnRvdGFsUGFnZXMgPSBNYXRoLmZsb29yKCh0aGlzLnJvd0NvdW50IC0gMSkgLyB0aGlzLnBhZ2VTaXplKSArIDE7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucGFnZUxvYWRlZCA9IGZ1bmN0aW9uKHJvd3MsIGxhc3RSb3dJbmRleCkge1xyXG4gICAgdmFyIGZpcnN0SWQgPSB0aGlzLmN1cnJlbnRQYWdlICogdGhpcy5wYWdlU2l6ZTtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQuc2V0Um93cyhyb3dzLCBmaXJzdElkKTtcclxuICAgIC8vIHNlZSBpZiB3ZSBoaXQgdGhlIGxhc3Qgcm93XHJcbiAgICBpZiAoIXRoaXMuZm91bmRNYXhSb3cgJiYgdHlwZW9mIGxhc3RSb3dJbmRleCA9PT0gJ251bWJlcicgJiYgbGFzdFJvd0luZGV4ID49IDApIHtcclxuICAgICAgICB0aGlzLmZvdW5kTWF4Um93ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnJvd0NvdW50ID0gbGFzdFJvd0luZGV4O1xyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlVG90YWxQYWdlcygpO1xyXG4gICAgICAgIHRoaXMuc2V0VG90YWxMYWJlbHMoKTtcclxuXHJcbiAgICAgICAgLy8gaWYgb3ZlcnNob3QgcGFnZXMsIGdvIGJhY2tcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50UGFnZSA+IHRoaXMudG90YWxQYWdlcykge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gdGhpcy50b3RhbFBhZ2VzIC0gMTtcclxuICAgICAgICAgICAgdGhpcy5sb2FkUGFnZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuZW5hYmxlT3JEaXNhYmxlQnV0dG9ucygpO1xyXG4gICAgdGhpcy51cGRhdGVSb3dMYWJlbHMoKTtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVSb3dMYWJlbHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzdGFydFJvdztcclxuICAgIHZhciBlbmRSb3c7XHJcbiAgICBpZiAodGhpcy5pc1plcm9QYWdlc1RvRGlzcGxheSgpKSB7XHJcbiAgICAgICAgc3RhcnRSb3cgPSAwO1xyXG4gICAgICAgIGVuZFJvdyA9IDA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHN0YXJ0Um93ID0gKHRoaXMucGFnZVNpemUgKiB0aGlzLmN1cnJlbnRQYWdlKSArIDE7XHJcbiAgICAgICAgZW5kUm93ID0gc3RhcnRSb3cgKyB0aGlzLnBhZ2VTaXplIC0gMTtcclxuICAgICAgICBpZiAodGhpcy5mb3VuZE1heFJvdyAmJiBlbmRSb3cgPiB0aGlzLnJvd0NvdW50KSB7XHJcbiAgICAgICAgICAgIGVuZFJvdyA9IHRoaXMucm93Q291bnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5sYkZpcnN0Um93T25QYWdlLmlubmVySFRNTCA9IChzdGFydFJvdykudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgIHRoaXMubGJMYXN0Um93T25QYWdlLmlubmVySFRNTCA9IChlbmRSb3cpLnRvTG9jYWxlU3RyaW5nKCk7XHJcblxyXG4gICAgLy8gc2hvdyB0aGUgc3VtbWFyeSBwYW5lbCwgd2hlbiBmaXJzdCBzaG93biwgdGhpcyBpcyBibGFua1xyXG4gICAgdGhpcy5lUGFnZVJvd1N1bW1hcnlQYW5lbC5zdHlsZS52aXNpYmlsaXR5ID0gbnVsbDtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5sb2FkUGFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbmFibGVPckRpc2FibGVCdXR0b25zKCk7XHJcbiAgICB2YXIgc3RhcnRSb3cgPSB0aGlzLmN1cnJlbnRQYWdlICogdGhpcy5kYXRhc291cmNlLnBhZ2VTaXplO1xyXG4gICAgdmFyIGVuZFJvdyA9ICh0aGlzLmN1cnJlbnRQYWdlICsgMSkgKiB0aGlzLmRhdGFzb3VyY2UucGFnZVNpemU7XHJcblxyXG4gICAgdGhpcy5sYkN1cnJlbnQuaW5uZXJIVE1MID0gKHRoaXMuY3VycmVudFBhZ2UgKyAxKS50b0xvY2FsZVN0cmluZygpO1xyXG5cclxuICAgIHRoaXMuY2FsbFZlcnNpb24rKztcclxuICAgIHZhciBjYWxsVmVyc2lvbkNvcHkgPSB0aGlzLmNhbGxWZXJzaW9uO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZC5zaG93TG9hZGluZ1BhbmVsKHRydWUpO1xyXG5cclxuICAgIHZhciBzb3J0TW9kZWw7XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNFbmFibGVTZXJ2ZXJTaWRlU29ydGluZygpKSB7XHJcbiAgICAgICAgc29ydE1vZGVsID0gdGhpcy5hbmd1bGFyR3JpZC5nZXRTb3J0TW9kZWwoKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZmlsdGVyTW9kZWw7XHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNFbmFibGVTZXJ2ZXJTaWRlRmlsdGVyKCkpIHtcclxuICAgICAgICBmaWx0ZXJNb2RlbCA9IHRoaXMuYW5ndWxhckdyaWQuZ2V0RmlsdGVyTW9kZWwoKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgIHN0YXJ0Um93OiBzdGFydFJvdyxcclxuICAgICAgICBlbmRSb3c6IGVuZFJvdyxcclxuICAgICAgICBzdWNjZXNzQ2FsbGJhY2s6IHN1Y2Nlc3NDYWxsYmFjayxcclxuICAgICAgICBmYWlsQ2FsbGJhY2s6IGZhaWxDYWxsYmFjayxcclxuICAgICAgICBzb3J0TW9kZWw6IHNvcnRNb2RlbCxcclxuICAgICAgICBmaWx0ZXJNb2RlbDogZmlsdGVyTW9kZWxcclxuICAgIH07XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgb2xkIHZlcnNpb24gb2YgZGF0YXNvdXJjZSB1c2VkXHJcbiAgICB2YXIgZ2V0Um93c1BhcmFtcyA9IHV0aWxzLmdldEZ1bmN0aW9uUGFyYW1ldGVycyh0aGlzLmRhdGFzb3VyY2UuZ2V0Um93cyk7XHJcbiAgICBpZiAoZ2V0Um93c1BhcmFtcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdhZy1ncmlkOiBJdCBsb29rcyBsaWtlIHlvdXIgcGFnaW5nIGRhdGFzb3VyY2UgaXMgb2YgdGhlIG9sZCB0eXBlLCB0YWtpbmcgbW9yZSB0aGFuIG9uZSBwYXJhbWV0ZXIuJyk7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdhZy1ncmlkOiBGcm9tIGFnLWdyaWQgMS45LjAsIG5vdyB0aGUgZ2V0Um93cyB0YWtlcyBvbmUgcGFyYW1ldGVyLiBTZWUgdGhlIGRvY3VtZW50YXRpb24gZm9yIGRldGFpbHMuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kYXRhc291cmNlLmdldFJvd3MocGFyYW1zKTtcclxuXHJcbiAgICBmdW5jdGlvbiBzdWNjZXNzQ2FsbGJhY2socm93cywgbGFzdFJvd0luZGV4KSB7XHJcbiAgICAgICAgaWYgKHRoYXQuaXNDYWxsRGFlbW9uKGNhbGxWZXJzaW9uQ29weSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGF0LnBhZ2VMb2FkZWQocm93cywgbGFzdFJvd0luZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBmYWlsQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgaWYgKHRoYXQuaXNDYWxsRGFlbW9uKGNhbGxWZXJzaW9uQ29weSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzZXQgaW4gYW4gZW1wdHkgc2V0IG9mIHJvd3MsIHRoaXMgd2lsbCBhdFxyXG4gICAgICAgIC8vIGxlYXN0IGdldCByaWQgb2YgdGhlIGxvYWRpbmcgcGFuZWwsIGFuZFxyXG4gICAgICAgIC8vIHN0b3AgYmxvY2tpbmcgdGhpbmdzXHJcbiAgICAgICAgdGhhdC5hbmd1bGFyR3JpZC5zZXRSb3dzKFtdKTtcclxuICAgIH1cclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5pc0NhbGxEYWVtb24gPSBmdW5jdGlvbih2ZXJzaW9uQ29weSkge1xyXG4gICAgcmV0dXJuIHZlcnNpb25Db3B5ICE9PSB0aGlzLmNhbGxWZXJzaW9uO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLm9uQnROZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRQYWdlKys7XHJcbiAgICB0aGlzLmxvYWRQYWdlKCk7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUub25CdFByZXZpb3VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRQYWdlLS07XHJcbiAgICB0aGlzLmxvYWRQYWdlKCk7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUub25CdEZpcnN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRQYWdlID0gMDtcclxuICAgIHRoaXMubG9hZFBhZ2UoKTtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5vbkJ0TGFzdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdXJyZW50UGFnZSA9IHRoaXMudG90YWxQYWdlcyAtIDE7XHJcbiAgICB0aGlzLmxvYWRQYWdlKCk7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuaXNaZXJvUGFnZXNUb0Rpc3BsYXkgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmZvdW5kTWF4Um93ICYmIHRoaXMudG90YWxQYWdlcyA9PT0gMDtcclxufTtcclxuXHJcblBhZ2luYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5lbmFibGVPckRpc2FibGVCdXR0b25zID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZGlzYWJsZVByZXZpb3VzQW5kRmlyc3QgPSB0aGlzLmN1cnJlbnRQYWdlID09PSAwO1xyXG4gICAgdGhpcy5idFByZXZpb3VzLmRpc2FibGVkID0gZGlzYWJsZVByZXZpb3VzQW5kRmlyc3Q7XHJcbiAgICB0aGlzLmJ0Rmlyc3QuZGlzYWJsZWQgPSBkaXNhYmxlUHJldmlvdXNBbmRGaXJzdDtcclxuXHJcbiAgICB2YXIgemVyb1BhZ2VzVG9EaXNwbGF5ID0gdGhpcy5pc1plcm9QYWdlc1RvRGlzcGxheSgpO1xyXG4gICAgdmFyIG9uTGFzdFBhZ2UgPSB0aGlzLmZvdW5kTWF4Um93ICYmIHRoaXMuY3VycmVudFBhZ2UgPT09ICh0aGlzLnRvdGFsUGFnZXMgLSAxKTtcclxuXHJcbiAgICB2YXIgZGlzYWJsZU5leHQgPSBvbkxhc3RQYWdlIHx8IHplcm9QYWdlc1RvRGlzcGxheTtcclxuICAgIHRoaXMuYnROZXh0LmRpc2FibGVkID0gZGlzYWJsZU5leHQ7XHJcblxyXG4gICAgdmFyIGRpc2FibGVMYXN0ID0gIXRoaXMuZm91bmRNYXhSb3cgfHwgemVyb1BhZ2VzVG9EaXNwbGF5IHx8IHRoaXMuY3VycmVudFBhZ2UgPT09ICh0aGlzLnRvdGFsUGFnZXMgLSAxKTtcclxuICAgIHRoaXMuYnRMYXN0LmRpc2FibGVkID0gZGlzYWJsZUxhc3Q7XHJcbn07XHJcblxyXG5QYWdpbmF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuY3JlYXRlVGVtcGxhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBsb2NhbGVUZXh0RnVuYyA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldExvY2FsZVRleHRGdW5jKCk7XHJcbiAgICByZXR1cm4gdGVtcGxhdGVcclxuICAgICAgICAucmVwbGFjZSgnW1BBR0VdJywgbG9jYWxlVGV4dEZ1bmMoJ3BhZ2UnLCAnUGFnZScpKVxyXG4gICAgICAgIC5yZXBsYWNlKCdbVE9dJywgbG9jYWxlVGV4dEZ1bmMoJ3RvJywgJ3RvJykpXHJcbiAgICAgICAgLnJlcGxhY2UoJ1tPRl0nLCBsb2NhbGVUZXh0RnVuYygnb2YnLCAnb2YnKSlcclxuICAgICAgICAucmVwbGFjZSgnW09GXScsIGxvY2FsZVRleHRGdW5jKCdvZicsICdvZicpKVxyXG4gICAgICAgIC5yZXBsYWNlKCdbRklSU1RdJywgbG9jYWxlVGV4dEZ1bmMoJ2ZpcnN0JywgJ0ZpcnN0JykpXHJcbiAgICAgICAgLnJlcGxhY2UoJ1tQUkVWSU9VU10nLCBsb2NhbGVUZXh0RnVuYygncHJldmlvdXMnLCAnUHJldmlvdXMnKSlcclxuICAgICAgICAucmVwbGFjZSgnW05FWFRdJywgbG9jYWxlVGV4dEZ1bmMoJ25leHQnLCAnTmV4dCcpKVxyXG4gICAgICAgIC5yZXBsYWNlKCdbTEFTVF0nLCBsb2NhbGVUZXh0RnVuYygnbGFzdCcsICdMYXN0JykpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmdldEd1aT0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lR3VpO1xyXG59O1xyXG5cclxuUGFnaW5hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnNldHVwQ29tcG9uZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHRoaXMuZUd1aSA9IHV0aWxzLmxvYWRUZW1wbGF0ZSh0aGlzLmNyZWF0ZVRlbXBsYXRlKCkpO1xyXG5cclxuICAgIHRoaXMuYnROZXh0ID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoJyNidE5leHQnKTtcclxuICAgIHRoaXMuYnRQcmV2aW91cyA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKCcjYnRQcmV2aW91cycpO1xyXG4gICAgdGhpcy5idEZpcnN0ID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoJyNidEZpcnN0Jyk7XHJcbiAgICB0aGlzLmJ0TGFzdCA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKCcjYnRMYXN0Jyk7XHJcbiAgICB0aGlzLmxiQ3VycmVudCA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKCcjY3VycmVudCcpO1xyXG4gICAgdGhpcy5sYlRvdGFsID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoJyN0b3RhbCcpO1xyXG5cclxuICAgIHRoaXMubGJSZWNvcmRDb3VudCA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKCcjcmVjb3JkQ291bnQnKTtcclxuICAgIHRoaXMubGJGaXJzdFJvd09uUGFnZSA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKCcjZmlyc3RSb3dPblBhZ2UnKTtcclxuICAgIHRoaXMubGJMYXN0Um93T25QYWdlID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoJyNsYXN0Um93T25QYWdlJyk7XHJcbiAgICB0aGlzLmVQYWdlUm93U3VtbWFyeVBhbmVsID0gdGhpcy5lR3VpLnF1ZXJ5U2VsZWN0b3IoJyNwYWdlUm93U3VtbWFyeVBhbmVsJyk7XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIHRoaXMuYnROZXh0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhhdC5vbkJ0TmV4dCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5idFByZXZpb3VzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhhdC5vbkJ0UHJldmlvdXMoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYnRGaXJzdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQub25CdEZpcnN0KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmJ0TGFzdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQub25CdExhc3QoKTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYWdpbmF0aW9uQ29udHJvbGxlcjtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxkaXYgY2xhc3M9YWctcGFnaW5nLXBhbmVsPjxzcGFuIGlkPXBhZ2VSb3dTdW1tYXJ5UGFuZWwgY2xhc3M9YWctcGFnaW5nLXJvdy1zdW1tYXJ5LXBhbmVsPjxzcGFuIGlkPWZpcnN0Um93T25QYWdlPjwvc3Bhbj4gW1RPXSA8c3BhbiBpZD1sYXN0Um93T25QYWdlPjwvc3Bhbj4gW09GXSA8c3BhbiBpZD1yZWNvcmRDb3VudD48L3NwYW4+PC9zcGFuPiA8c3BhbiBjbGFzcz1hZy1wYWdpbmctcGFnZS1zdW1tYXJ5LXBhbmVsPjxidXR0b24gY2xhc3M9YWctcGFnaW5nLWJ1dHRvbiBpZD1idEZpcnN0PltGSVJTVF08L2J1dHRvbj4gPGJ1dHRvbiBjbGFzcz1hZy1wYWdpbmctYnV0dG9uIGlkPWJ0UHJldmlvdXM+W1BSRVZJT1VTXTwvYnV0dG9uPiBbUEFHRV0gPHNwYW4gaWQ9Y3VycmVudD48L3NwYW4+IFtPRl0gPHNwYW4gaWQ9dG90YWw+PC9zcGFuPiA8YnV0dG9uIGNsYXNzPWFnLXBhZ2luZy1idXR0b24gaWQ9YnROZXh0PltORVhUXTwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPWFnLXBhZ2luZy1idXR0b24gaWQ9YnRMYXN0PltMQVNUXTwvYnV0dG9uPjwvc3Bhbj48L2Rpdj5cIjtcbiIsIi8qXHJcbiAqIFRoaXMgcm93IGNvbnRyb2xsZXIgaXMgdXNlZCBmb3IgaW5maW5pdGUgc2Nyb2xsaW5nIG9ubHkuIEZvciBub3JtYWwgJ2luIG1lbW9yeScgdGFibGUsXHJcbiAqIG9yIHN0YW5kYXJkIHBhZ2luYXRpb24sIHRoZSBpbk1lbW9yeVJvd0NvbnRyb2xsZXIgaXMgdXNlZC5cclxuICovXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcclxudmFyIGxvZ2dpbmcgPSBmYWxzZTtcclxuXHJcbmZ1bmN0aW9uIFZpcnR1YWxQYWdlUm93Q29udHJvbGxlcigpIHt9XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihyb3dSZW5kZXJlciwgZ3JpZE9wdGlvbnNXcmFwcGVyLCBhbmd1bGFyR3JpZCkge1xyXG4gICAgdGhpcy5yb3dSZW5kZXJlciA9IHJvd1JlbmRlcmVyO1xyXG4gICAgdGhpcy5kYXRhc291cmNlVmVyc2lvbiA9IDA7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZDtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUuc2V0RGF0YXNvdXJjZSA9IGZ1bmN0aW9uKGRhdGFzb3VyY2UpIHtcclxuICAgIHRoaXMuZGF0YXNvdXJjZSA9IGRhdGFzb3VyY2U7XHJcblxyXG4gICAgaWYgKCFkYXRhc291cmNlKSB7XHJcbiAgICAgICAgLy8gb25seSBjb250aW51ZSBpZiB3ZSBoYXZlIGEgdmFsaWQgZGF0YXNvdXJjZSB0byB3b3JraW5nIHdpdGhcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZXNldCgpO1xyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gc2VlIGlmIGRhdGFzb3VyY2Uga25vd3MgaG93IG1hbnkgcm93cyB0aGVyZSBhcmVcclxuICAgIGlmICh0eXBlb2YgdGhpcy5kYXRhc291cmNlLnJvd0NvdW50ID09PSAnbnVtYmVyJyAmJiB0aGlzLmRhdGFzb3VyY2Uucm93Q291bnQgPj0gMCkge1xyXG4gICAgICAgIHRoaXMudmlydHVhbFJvd0NvdW50ID0gdGhpcy5kYXRhc291cmNlLnJvd0NvdW50O1xyXG4gICAgICAgIHRoaXMuZm91bmRNYXhSb3cgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnZpcnR1YWxSb3dDb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5mb3VuZE1heFJvdyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGluIGNhc2UgYW55IGRhZW1vbiByZXF1ZXN0cyBjb21pbmcgZnJvbSBkYXRhc291cmNlLCB3ZSBrbm93IGl0IGlnbm9yZSB0aGVtXHJcbiAgICB0aGlzLmRhdGFzb3VyY2VWZXJzaW9uKys7XHJcblxyXG4gICAgLy8gbWFwIG9mIHBhZ2UgbnVtYmVycyB0byByb3dzIGluIHRoYXQgcGFnZVxyXG4gICAgdGhpcy5wYWdlQ2FjaGUgPSB7fTtcclxuICAgIHRoaXMucGFnZUNhY2hlU2l6ZSA9IDA7XHJcblxyXG4gICAgLy8gaWYgYSBudW1iZXIgaXMgaW4gdGhpcyBhcnJheSwgaXQgbWVhbnMgd2UgYXJlIHBlbmRpbmcgYSBsb2FkIGZyb20gaXRcclxuICAgIHRoaXMucGFnZUxvYWRzSW5Qcm9ncmVzcyA9IFtdO1xyXG4gICAgdGhpcy5wYWdlTG9hZHNRdWV1ZWQgPSBbXTtcclxuICAgIHRoaXMucGFnZUFjY2Vzc1RpbWVzID0ge307IC8vIGtlZXBzIGEgcmVjb3JkIG9mIHdoZW4gZWFjaCBwYWdlIHdhcyBsYXN0IHZpZXdlZCwgdXNlZCBmb3IgTFJVIGNhY2hlXHJcbiAgICB0aGlzLmFjY2Vzc1RpbWUgPSAwOyAvLyByYXRoZXIgdGhhbiB1c2luZyB0aGUgY2xvY2ssIHdlIHVzZSB0aGlzIGNvdW50ZXJcclxuXHJcbiAgICAvLyB0aGUgbnVtYmVyIG9mIGNvbmN1cnJlbnQgbG9hZHMgd2UgYXJlIGFsbG93ZWQgdG8gdGhlIHNlcnZlclxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmRhdGFzb3VyY2UubWF4Q29uY3VycmVudFJlcXVlc3RzID09PSAnbnVtYmVyJyAmJiB0aGlzLmRhdGFzb3VyY2UubWF4Q29uY3VycmVudFJlcXVlc3RzID4gMCkge1xyXG4gICAgICAgIHRoaXMubWF4Q29uY3VycmVudERhdGFzb3VyY2VSZXF1ZXN0cyA9IHRoaXMuZGF0YXNvdXJjZS5tYXhDb25jdXJyZW50UmVxdWVzdHM7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubWF4Q29uY3VycmVudERhdGFzb3VyY2VSZXF1ZXN0cyA9IDI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGhlIG51bWJlciBvZiBwYWdlcyB0byBrZWVwIGluIGJyb3dzZXIgY2FjaGVcclxuICAgIGlmICh0eXBlb2YgdGhpcy5kYXRhc291cmNlLm1heFBhZ2VzSW5DYWNoZSA9PT0gJ251bWJlcicgJiYgdGhpcy5kYXRhc291cmNlLm1heFBhZ2VzSW5DYWNoZSA+IDApIHtcclxuICAgICAgICB0aGlzLm1heFBhZ2VzSW5DYWNoZSA9IHRoaXMuZGF0YXNvdXJjZS5tYXhQYWdlc0luQ2FjaGU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIG51bGwgaXMgZGVmYXVsdCwgbWVhbnMgZG9uJ3QgIGhhdmUgYW55IG1heCBzaXplIG9uIHRoZSBjYWNoZVxyXG4gICAgICAgIHRoaXMubWF4UGFnZXNJbkNhY2hlID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnBhZ2VTaXplID0gdGhpcy5kYXRhc291cmNlLnBhZ2VTaXplOyAvLyB0YWtlIGEgY29weSBvZiBwYWdlIHNpemUsIHdlIGRvbid0IHdhbnQgaXQgY2hhbmdpbmdcclxuICAgIHRoaXMub3ZlcmZsb3dTaXplID0gdGhpcy5kYXRhc291cmNlLm92ZXJmbG93U2l6ZTsgLy8gdGFrZSBhIGNvcHkgb2YgcGFnZSBzaXplLCB3ZSBkb24ndCB3YW50IGl0IGNoYW5naW5nXHJcblxyXG4gICAgdGhpcy5kb0xvYWRPclF1ZXVlKDApO1xyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5jcmVhdGVOb2Rlc0Zyb21Sb3dzID0gZnVuY3Rpb24ocGFnZU51bWJlciwgcm93cykge1xyXG4gICAgdmFyIG5vZGVzID0gW107XHJcbiAgICBpZiAocm93cykge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gcm93cy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHZpcnR1YWxSb3dJbmRleCA9IChwYWdlTnVtYmVyICogdGhpcy5wYWdlU2l6ZSkgKyBpO1xyXG4gICAgICAgICAgICBub2Rlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGRhdGE6IHJvd3NbaV0sXHJcbiAgICAgICAgICAgICAgICBpZDogdmlydHVhbFJvd0luZGV4XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBub2RlcztcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUucmVtb3ZlRnJvbUxvYWRpbmcgPSBmdW5jdGlvbihwYWdlTnVtYmVyKSB7XHJcbiAgICB2YXIgaW5kZXggPSB0aGlzLnBhZ2VMb2Fkc0luUHJvZ3Jlc3MuaW5kZXhPZihwYWdlTnVtYmVyKTtcclxuICAgIHRoaXMucGFnZUxvYWRzSW5Qcm9ncmVzcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5wYWdlTG9hZEZhaWxlZCA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpIHtcclxuICAgIHRoaXMucmVtb3ZlRnJvbUxvYWRpbmcocGFnZU51bWJlcik7XHJcbiAgICB0aGlzLmNoZWNrUXVldWVGb3JOZXh0TG9hZCgpO1xyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5wYWdlTG9hZGVkID0gZnVuY3Rpb24ocGFnZU51bWJlciwgcm93cywgbGFzdFJvdykge1xyXG4gICAgdGhpcy5wdXRQYWdlSW50b0NhY2hlQW5kUHVyZ2UocGFnZU51bWJlciwgcm93cyk7XHJcbiAgICB0aGlzLmNoZWNrTWF4Um93QW5kSW5mb3JtUm93UmVuZGVyZXIocGFnZU51bWJlciwgbGFzdFJvdyk7XHJcbiAgICB0aGlzLnJlbW92ZUZyb21Mb2FkaW5nKHBhZ2VOdW1iZXIpO1xyXG4gICAgdGhpcy5jaGVja1F1ZXVlRm9yTmV4dExvYWQoKTtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUucHV0UGFnZUludG9DYWNoZUFuZFB1cmdlID0gZnVuY3Rpb24ocGFnZU51bWJlciwgcm93cykge1xyXG4gICAgdGhpcy5wYWdlQ2FjaGVbcGFnZU51bWJlcl0gPSB0aGlzLmNyZWF0ZU5vZGVzRnJvbVJvd3MocGFnZU51bWJlciwgcm93cyk7XHJcbiAgICB0aGlzLnBhZ2VDYWNoZVNpemUrKztcclxuICAgIGlmIChsb2dnaW5nKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2FkZGluZyBwYWdlICcgKyBwYWdlTnVtYmVyKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbmVlZFRvUHVyZ2UgPSB0aGlzLm1heFBhZ2VzSW5DYWNoZSAmJiB0aGlzLm1heFBhZ2VzSW5DYWNoZSA8IHRoaXMucGFnZUNhY2hlU2l6ZTtcclxuICAgIGlmIChuZWVkVG9QdXJnZSkge1xyXG4gICAgICAgIC8vIGZpbmQgdGhlIExSVSBwYWdlXHJcbiAgICAgICAgdmFyIHlvdW5nZXN0UGFnZUluZGV4ID0gdGhpcy5maW5kTGVhc3RSZWNlbnRseUFjY2Vzc2VkUGFnZShPYmplY3Qua2V5cyh0aGlzLnBhZ2VDYWNoZSkpO1xyXG5cclxuICAgICAgICBpZiAobG9nZ2luZykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygncHVyZ2luZyBwYWdlICcgKyB5b3VuZ2VzdFBhZ2VJbmRleCArICcgZnJvbSBjYWNoZSAnICsgT2JqZWN0LmtleXModGhpcy5wYWdlQ2FjaGUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGVsZXRlIHRoaXMucGFnZUNhY2hlW3lvdW5nZXN0UGFnZUluZGV4XTtcclxuICAgICAgICB0aGlzLnBhZ2VDYWNoZVNpemUtLTtcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmNoZWNrTWF4Um93QW5kSW5mb3JtUm93UmVuZGVyZXIgPSBmdW5jdGlvbihwYWdlTnVtYmVyLCBsYXN0Um93KSB7XHJcbiAgICBpZiAoIXRoaXMuZm91bmRNYXhSb3cpIHtcclxuICAgICAgICAvLyBpZiB3ZSBrbm93IHRoZSBsYXN0IHJvdywgdXNlIGlmXHJcbiAgICAgICAgaWYgKHR5cGVvZiBsYXN0Um93ID09PSAnbnVtYmVyJyAmJiBsYXN0Um93ID49IDApIHtcclxuICAgICAgICAgICAgdGhpcy52aXJ0dWFsUm93Q291bnQgPSBsYXN0Um93O1xyXG4gICAgICAgICAgICB0aGlzLmZvdW5kTWF4Um93ID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIHNlZSBpZiB3ZSBuZWVkIHRvIGFkZCBzb21lIHZpcnR1YWwgcm93c1xyXG4gICAgICAgICAgICB2YXIgdGhpc1BhZ2VQbHVzQnVmZmVyID0gKChwYWdlTnVtYmVyICsgMSkgKiB0aGlzLnBhZ2VTaXplKSArIHRoaXMub3ZlcmZsb3dTaXplO1xyXG4gICAgICAgICAgICBpZiAodGhpcy52aXJ0dWFsUm93Q291bnQgPCB0aGlzUGFnZVBsdXNCdWZmZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudmlydHVhbFJvd0NvdW50ID0gdGhpc1BhZ2VQbHVzQnVmZmVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGlmIHJvd0NvdW50IGNoYW5nZXMsIHJlZnJlc2hWaWV3LCBvdGhlcndpc2UganVzdCByZWZyZXNoQWxsVmlydHVhbFJvd3NcclxuICAgICAgICB0aGlzLnJvd1JlbmRlcmVyLnJlZnJlc2hWaWV3KCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMucm93UmVuZGVyZXIucmVmcmVzaEFsbFZpcnR1YWxSb3dzKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmlzUGFnZUFscmVhZHlMb2FkaW5nID0gZnVuY3Rpb24ocGFnZU51bWJlcikge1xyXG4gICAgdmFyIHJlc3VsdCA9IHRoaXMucGFnZUxvYWRzSW5Qcm9ncmVzcy5pbmRleE9mKHBhZ2VOdW1iZXIpID49IDAgfHwgdGhpcy5wYWdlTG9hZHNRdWV1ZWQuaW5kZXhPZihwYWdlTnVtYmVyKSA+PSAwO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUuZG9Mb2FkT3JRdWV1ZSA9IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpIHtcclxuICAgIC8vIGlmIHdlIGFscmVhZHkgdHJpZWQgdG8gbG9hZCB0aGlzIHBhZ2UsIHRoZW4gaWdub3JlIHRoZSByZXF1ZXN0LFxyXG4gICAgLy8gb3RoZXJ3aXNlIHNlcnZlciB3b3VsZCBiZSBoaXQgNTAgdGltZXMganVzdCB0byBkaXNwbGF5IG9uZSBwYWdlLCB0aGVcclxuICAgIC8vIGZpcnN0IHJvdyB0byBmaW5kIHRoZSBwYWdlIG1pc3NpbmcgaXMgZW5vdWdoLlxyXG4gICAgaWYgKHRoaXMuaXNQYWdlQWxyZWFkeUxvYWRpbmcocGFnZU51bWJlcikpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdHJ5IHRoZSBwYWdlIGxvYWQgLSBpZiBub3QgYWxyZWFkeSBkb2luZyBhIGxvYWQsIHRoZW4gd2UgY2FuIGdvIGFoZWFkXHJcbiAgICBpZiAodGhpcy5wYWdlTG9hZHNJblByb2dyZXNzLmxlbmd0aCA8IHRoaXMubWF4Q29uY3VycmVudERhdGFzb3VyY2VSZXF1ZXN0cykge1xyXG4gICAgICAgIC8vIGdvIGFoZWFkLCBsb2FkIHRoZSBwYWdlXHJcbiAgICAgICAgdGhpcy5sb2FkUGFnZShwYWdlTnVtYmVyKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlLCBxdWV1ZSB0aGUgcmVxdWVzdFxyXG4gICAgICAgIHRoaXMuYWRkVG9RdWV1ZUFuZFB1cmdlUXVldWUocGFnZU51bWJlcik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmFkZFRvUXVldWVBbmRQdXJnZVF1ZXVlID0gZnVuY3Rpb24ocGFnZU51bWJlcikge1xyXG4gICAgaWYgKGxvZ2dpbmcpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygncXVldWVpbmcgJyArIHBhZ2VOdW1iZXIgKyAnIC0gJyArIHRoaXMucGFnZUxvYWRzUXVldWVkKTtcclxuICAgIH1cclxuICAgIHRoaXMucGFnZUxvYWRzUXVldWVkLnB1c2gocGFnZU51bWJlcik7XHJcblxyXG4gICAgLy8gc2VlIGlmIHRoZXJlIGFyZSBtb3JlIHBhZ2VzIHF1ZXVlZCB0aGF0IGFyZSBhY3R1YWxseSBpbiBvdXIgY2FjaGUsIGlmIHNvIHRoZXJlIGlzXHJcbiAgICAvLyBubyBwb2ludCBpbiBsb2FkaW5nIHRoZW0gYWxsIGFzIHNvbWUgd2lsbCBiZSBwdXJnZWQgYXMgc29vbiBhcyBsb2FkZWRcclxuICAgIHZhciBuZWVkVG9QdXJnZSA9IHRoaXMubWF4UGFnZXNJbkNhY2hlICYmIHRoaXMubWF4UGFnZXNJbkNhY2hlIDwgdGhpcy5wYWdlTG9hZHNRdWV1ZWQubGVuZ3RoO1xyXG4gICAgaWYgKG5lZWRUb1B1cmdlKSB7XHJcbiAgICAgICAgLy8gZmluZCB0aGUgTFJVIHBhZ2VcclxuICAgICAgICB2YXIgeW91bmdlc3RQYWdlSW5kZXggPSB0aGlzLmZpbmRMZWFzdFJlY2VudGx5QWNjZXNzZWRQYWdlKHRoaXMucGFnZUxvYWRzUXVldWVkKTtcclxuXHJcbiAgICAgICAgaWYgKGxvZ2dpbmcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2RlLXF1ZXVlaW5nICcgKyBwYWdlTnVtYmVyICsgJyAtICcgKyB0aGlzLnBhZ2VMb2Fkc1F1ZXVlZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgaW5kZXhUb1JlbW92ZSA9IHRoaXMucGFnZUxvYWRzUXVldWVkLmluZGV4T2YoeW91bmdlc3RQYWdlSW5kZXgpO1xyXG4gICAgICAgIHRoaXMucGFnZUxvYWRzUXVldWVkLnNwbGljZShpbmRleFRvUmVtb3ZlLCAxKTtcclxuICAgIH1cclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUuZmluZExlYXN0UmVjZW50bHlBY2Nlc3NlZFBhZ2UgPSBmdW5jdGlvbihwYWdlSW5kZXhlcykge1xyXG4gICAgdmFyIHlvdW5nZXN0UGFnZUluZGV4ID0gLTE7XHJcbiAgICB2YXIgeW91bmdlc3RQYWdlQWNjZXNzVGltZSA9IE51bWJlci5NQVhfVkFMVUU7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgcGFnZUluZGV4ZXMuZm9yRWFjaChmdW5jdGlvbihwYWdlSW5kZXgpIHtcclxuICAgICAgICB2YXIgYWNjZXNzVGltZVRoaXNQYWdlID0gdGhhdC5wYWdlQWNjZXNzVGltZXNbcGFnZUluZGV4XTtcclxuICAgICAgICBpZiAoYWNjZXNzVGltZVRoaXNQYWdlIDwgeW91bmdlc3RQYWdlQWNjZXNzVGltZSkge1xyXG4gICAgICAgICAgICB5b3VuZ2VzdFBhZ2VBY2Nlc3NUaW1lID0gYWNjZXNzVGltZVRoaXNQYWdlO1xyXG4gICAgICAgICAgICB5b3VuZ2VzdFBhZ2VJbmRleCA9IHBhZ2VJbmRleDtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4geW91bmdlc3RQYWdlSW5kZXg7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmNoZWNrUXVldWVGb3JOZXh0TG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMucGFnZUxvYWRzUXVldWVkLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAvLyB0YWtlIGZyb20gdGhlIGZyb250IG9mIHRoZSBxdWV1ZVxyXG4gICAgICAgIHZhciBwYWdlVG9Mb2FkID0gdGhpcy5wYWdlTG9hZHNRdWV1ZWRbMF07XHJcbiAgICAgICAgdGhpcy5wYWdlTG9hZHNRdWV1ZWQuc3BsaWNlKDAsIDEpO1xyXG5cclxuICAgICAgICBpZiAobG9nZ2luZykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZGVxdWV1ZWluZyAnICsgcGFnZVRvTG9hZCArICcgLSAnICsgdGhpcy5wYWdlTG9hZHNRdWV1ZWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sb2FkUGFnZShwYWdlVG9Mb2FkKTtcclxuICAgIH1cclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUubG9hZFBhZ2UgPSBmdW5jdGlvbihwYWdlTnVtYmVyKSB7XHJcblxyXG4gICAgdGhpcy5wYWdlTG9hZHNJblByb2dyZXNzLnB1c2gocGFnZU51bWJlcik7XHJcblxyXG4gICAgdmFyIHN0YXJ0Um93ID0gcGFnZU51bWJlciAqIHRoaXMucGFnZVNpemU7XHJcbiAgICB2YXIgZW5kUm93ID0gKHBhZ2VOdW1iZXIgKyAxKSAqIHRoaXMucGFnZVNpemU7XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdmFyIGRhdGFzb3VyY2VWZXJzaW9uQ29weSA9IHRoaXMuZGF0YXNvdXJjZVZlcnNpb247XHJcblxyXG4gICAgdmFyIHNvcnRNb2RlbDtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0VuYWJsZVNlcnZlclNpZGVTb3J0aW5nKCkpIHtcclxuICAgICAgICBzb3J0TW9kZWwgPSB0aGlzLmFuZ3VsYXJHcmlkLmdldFNvcnRNb2RlbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBmaWx0ZXJNb2RlbDtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0VuYWJsZVNlcnZlclNpZGVGaWx0ZXIoKSkge1xyXG4gICAgICAgIGZpbHRlck1vZGVsID0gdGhpcy5hbmd1bGFyR3JpZC5nZXRGaWx0ZXJNb2RlbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBwYXJhbXMgPSB7XHJcbiAgICAgICAgc3RhcnRSb3c6IHN0YXJ0Um93LFxyXG4gICAgICAgIGVuZFJvdzogZW5kUm93LFxyXG4gICAgICAgIHN1Y2Nlc3NDYWxsYmFjazogc3VjY2Vzc0NhbGxiYWNrLFxyXG4gICAgICAgIGZhaWxDYWxsYmFjazogZmFpbENhbGxiYWNrLFxyXG4gICAgICAgIHNvcnRNb2RlbDogc29ydE1vZGVsLFxyXG4gICAgICAgIGZpbHRlck1vZGVsOiBmaWx0ZXJNb2RlbFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBjaGVjayBpZiBvbGQgdmVyc2lvbiBvZiBkYXRhc291cmNlIHVzZWRcclxuICAgIHZhciBnZXRSb3dzUGFyYW1zID0gdXRpbHMuZ2V0RnVuY3Rpb25QYXJhbWV0ZXJzKHRoaXMuZGF0YXNvdXJjZS5nZXRSb3dzKTtcclxuICAgIGlmIChnZXRSb3dzUGFyYW1zLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ2FnLWdyaWQ6IEl0IGxvb2tzIGxpa2UgeW91ciBwYWdpbmcgZGF0YXNvdXJjZSBpcyBvZiB0aGUgb2xkIHR5cGUsIHRha2luZyBtb3JlIHRoYW4gb25lIHBhcmFtZXRlci4nKTtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ2FnLWdyaWQ6IEZyb20gYWctZ3JpZCAxLjkuMCwgbm93IHRoZSBnZXRSb3dzIHRha2VzIG9uZSBwYXJhbWV0ZXIuIFNlZSB0aGUgZG9jdW1lbnRhdGlvbiBmb3IgZGV0YWlscy4nKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRhdGFzb3VyY2UuZ2V0Um93cyhwYXJhbXMpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHN1Y2Nlc3NDYWxsYmFjayhyb3dzLCBsYXN0Um93SW5kZXgpIHtcclxuICAgICAgICBpZiAodGhhdC5yZXF1ZXN0SXNEYWVtb24oZGF0YXNvdXJjZVZlcnNpb25Db3B5KSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoYXQucGFnZUxvYWRlZChwYWdlTnVtYmVyLCByb3dzLCBsYXN0Um93SW5kZXgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGZhaWxDYWxsYmFjaygpIHtcclxuICAgICAgICBpZiAodGhhdC5yZXF1ZXN0SXNEYWVtb24oZGF0YXNvdXJjZVZlcnNpb25Db3B5KSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoYXQucGFnZUxvYWRGYWlsZWQocGFnZU51bWJlcik7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBjaGVjayB0aGF0IHRoZSBkYXRhc291cmNlIGhhcyBub3QgY2hhbmdlZCBzaW5jZSB0aGUgbGF0cyB0aW1lIHdlIGRpZCBhIHJlcXVlc3RcclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5yZXF1ZXN0SXNEYWVtb24gPSBmdW5jdGlvbihkYXRhc291cmNlVmVyc2lvbkNvcHkpIHtcclxuICAgIHJldHVybiB0aGlzLmRhdGFzb3VyY2VWZXJzaW9uICE9PSBkYXRhc291cmNlVmVyc2lvbkNvcHk7XHJcbn07XHJcblxyXG5WaXJ0dWFsUGFnZVJvd0NvbnRyb2xsZXIucHJvdG90eXBlLmdldFZpcnR1YWxSb3cgPSBmdW5jdGlvbihyb3dJbmRleCkge1xyXG4gICAgaWYgKHJvd0luZGV4ID4gdGhpcy52aXJ0dWFsUm93Q291bnQpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcGFnZU51bWJlciA9IE1hdGguZmxvb3Iocm93SW5kZXggLyB0aGlzLnBhZ2VTaXplKTtcclxuICAgIHZhciBwYWdlID0gdGhpcy5wYWdlQ2FjaGVbcGFnZU51bWJlcl07XHJcblxyXG4gICAgLy8gZm9yIExSVSBjYWNoZSwgdHJhY2sgd2hlbiB0aGlzIHBhZ2Ugd2FzIGxhc3QgaGl0XHJcbiAgICB0aGlzLnBhZ2VBY2Nlc3NUaW1lc1twYWdlTnVtYmVyXSA9IHRoaXMuYWNjZXNzVGltZSsrO1xyXG5cclxuICAgIGlmICghcGFnZSkge1xyXG4gICAgICAgIHRoaXMuZG9Mb2FkT3JRdWV1ZShwYWdlTnVtYmVyKTtcclxuICAgICAgICAvLyByZXR1cm4gYmFjayBhbiBlbXB0eSByb3csIHNvIHRhYmxlIGNhbiBhdCBsZWFzdCByZW5kZXIgZW1wdHkgY2VsbHNcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBkYXRhOiB7fSxcclxuICAgICAgICAgICAgaWQ6IHJvd0luZGV4XHJcbiAgICAgICAgfTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGluZGV4SW5UaGlzUGFnZSA9IHJvd0luZGV4ICUgdGhpcy5wYWdlU2l6ZTtcclxuICAgICAgICByZXR1cm4gcGFnZVtpbmRleEluVGhpc1BhZ2VdO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVmlydHVhbFBhZ2VSb3dDb250cm9sbGVyLnByb3RvdHlwZS5mb3JFYWNoSW5NZW1vcnkgPSBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgdmFyIHBhZ2VLZXlzID0gT2JqZWN0LmtleXModGhpcy5wYWdlQ2FjaGUpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGk8cGFnZUtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgcGFnZUtleSA9IHBhZ2VLZXlzW2ldO1xyXG4gICAgICAgIHZhciBwYWdlID0gdGhpcy5wYWdlQ2FjaGVbcGFnZUtleV07XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGo8cGFnZS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICB2YXIgbm9kZSA9IHBhZ2Vbal07XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblZpcnR1YWxQYWdlUm93Q29udHJvbGxlci5wcm90b3R5cGUuZ2V0TW9kZWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0VmlydHVhbFJvdzogZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZ2V0VmlydHVhbFJvdyhpbmRleCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRWaXJ0dWFsUm93Q291bnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhhdC52aXJ0dWFsUm93Q291bnQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3JFYWNoSW5NZW1vcnk6IGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcclxuICAgICAgICAgICAgdGhhdC5mb3JFYWNoSW5NZW1vcnkoY2FsbGJhY2spO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFZpcnR1YWxQYWdlUm93Q29udHJvbGxlcjtcclxuIiwidmFyIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxudmFyIGdyb3VwQ2VsbFJlbmRlcmVyRmFjdG9yeSA9IHJlcXVpcmUoJy4vY2VsbFJlbmRlcmVycy9ncm91cENlbGxSZW5kZXJlckZhY3RvcnknKTtcclxuXHJcbmZ1bmN0aW9uIFJvd1JlbmRlcmVyKCkge31cclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oZ3JpZE9wdGlvbnMsIGNvbHVtbk1vZGVsLCBncmlkT3B0aW9uc1dyYXBwZXIsIGdyaWRQYW5lbCxcclxuICAgIGFuZ3VsYXJHcmlkLCBzZWxlY3Rpb25SZW5kZXJlckZhY3RvcnksICRjb21waWxlLCAkc2NvcGUsXHJcbiAgICBzZWxlY3Rpb25Db250cm9sbGVyLCBleHByZXNzaW9uU2VydmljZSwgdGVtcGxhdGVTZXJ2aWNlKSB7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zID0gZ3JpZE9wdGlvbnM7XHJcbiAgICB0aGlzLmNvbHVtbk1vZGVsID0gY29sdW1uTW9kZWw7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHRoaXMuYW5ndWxhckdyaWQgPSBhbmd1bGFyR3JpZDtcclxuICAgIHRoaXMuc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5ID0gc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5O1xyXG4gICAgdGhpcy5ncmlkUGFuZWwgPSBncmlkUGFuZWw7XHJcbiAgICB0aGlzLiRjb21waWxlID0gJGNvbXBpbGU7XHJcbiAgICB0aGlzLiRzY29wZSA9ICRzY29wZTtcclxuICAgIHRoaXMuc2VsZWN0aW9uQ29udHJvbGxlciA9IHNlbGVjdGlvbkNvbnRyb2xsZXI7XHJcbiAgICB0aGlzLmV4cHJlc3Npb25TZXJ2aWNlID0gZXhwcmVzc2lvblNlcnZpY2U7XHJcbiAgICB0aGlzLnRlbXBsYXRlU2VydmljZSA9IHRlbXBsYXRlU2VydmljZTtcclxuICAgIHRoaXMuZmluZEFsbEVsZW1lbnRzKGdyaWRQYW5lbCk7XHJcblxyXG4gICAgdGhpcy5jZWxsUmVuZGVyZXJNYXAgPSB7XHJcbiAgICAgICAgJ2dyb3VwJzogZ3JvdXBDZWxsUmVuZGVyZXJGYWN0b3J5KGdyaWRPcHRpb25zV3JhcHBlciwgc2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5KVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBtYXAgb2Ygcm93IGlkcyB0byByb3cgb2JqZWN0cy4ga2VlcHMgdHJhY2sgb2Ygd2hpY2ggZWxlbWVudHNcclxuICAgIC8vIGFyZSByZW5kZXJlZCBmb3Igd2hpY2ggcm93cyBpbiB0aGUgZG9tLiBlYWNoIHJvdyBvYmplY3QgaGFzOlxyXG4gICAgLy8gW3Njb3BlLCBib2R5Um93LCBwaW5uZWRSb3csIHJvd0RhdGFdXHJcbiAgICB0aGlzLnJlbmRlcmVkUm93cyA9IHt9O1xyXG5cclxuICAgIHRoaXMucmVuZGVyZWRSb3dTdGFydEVkaXRpbmdMaXN0ZW5lcnMgPSB7fTtcclxuXHJcbiAgICB0aGlzLmVkaXRpbmdDZWxsID0gZmFsc2U7IC8vZ2V0cyBzZXQgdG8gdHJ1ZSB3aGVuIGVkaXRpbmcgYSBjZWxsXHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuc2V0Um93TW9kZWwgPSBmdW5jdGlvbihyb3dNb2RlbCkge1xyXG4gICAgdGhpcy5yb3dNb2RlbCA9IHJvd01vZGVsO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnNldE1haW5Sb3dXaWR0aHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtYWluUm93V2lkdGggPSB0aGlzLmNvbHVtbk1vZGVsLmdldEJvZHlDb250YWluZXJXaWR0aCgpICsgXCJweFwiO1xyXG5cclxuICAgIHZhciB1bnBpbm5lZFJvd3MgPSB0aGlzLmVCb2R5Q29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYWctcm93XCIpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1bnBpbm5lZFJvd3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB1bnBpbm5lZFJvd3NbaV0uc3R5bGUud2lkdGggPSBtYWluUm93V2lkdGg7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuZmluZEFsbEVsZW1lbnRzID0gZnVuY3Rpb24oZ3JpZFBhbmVsKSB7XHJcbiAgICB0aGlzLmVCb2R5Q29udGFpbmVyID0gZ3JpZFBhbmVsLmdldEJvZHlDb250YWluZXIoKTtcclxuICAgIHRoaXMuZUJvZHlWaWV3cG9ydCA9IGdyaWRQYW5lbC5nZXRCb2R5Vmlld3BvcnQoKTtcclxuICAgIHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIgPSBncmlkUGFuZWwuZ2V0UGlubmVkQ29sc0NvbnRhaW5lcigpO1xyXG4gICAgdGhpcy5lUGFyZW50T2ZSb3dzID0gZ3JpZFBhbmVsLmdldFJvd3NQYXJlbnQoKTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5yZWZyZXNoVmlldyA9IGZ1bmN0aW9uKHJlZnJlc2hGcm9tSW5kZXgpIHtcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgdmFyIHJvd0NvdW50ID0gdGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93Q291bnQoKTtcclxuICAgICAgICB2YXIgY29udGFpbmVySGVpZ2h0ID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93SGVpZ2h0KCkgKiByb3dDb3VudDtcclxuICAgICAgICB0aGlzLmVCb2R5Q29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGNvbnRhaW5lckhlaWdodCArIFwicHhcIjtcclxuICAgICAgICB0aGlzLmVQaW5uZWRDb2xzQ29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGNvbnRhaW5lckhlaWdodCArIFwicHhcIjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlZnJlc2hBbGxWaXJ0dWFsUm93cyhyZWZyZXNoRnJvbUluZGV4KTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zb2Z0UmVmcmVzaFZpZXcgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgZmlyc3QgPSB0aGlzLmZpcnN0VmlydHVhbFJlbmRlcmVkUm93O1xyXG4gICAgdmFyIGxhc3QgPSB0aGlzLmxhc3RWaXJ0dWFsUmVuZGVyZWRSb3c7XHJcblxyXG4gICAgdmFyIGNvbHVtbnMgPSB0aGlzLmNvbHVtbk1vZGVsLmdldERpc3BsYXllZENvbHVtbnMoKTtcclxuICAgIC8vIGlmIG5vIGNvbHMsIGRvbid0IGRyYXcgcm93XHJcbiAgICBpZiAoIWNvbHVtbnMgfHwgY29sdW1ucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgcm93SW5kZXggPSBmaXJzdDsgcm93SW5kZXggPD0gbGFzdDsgcm93SW5kZXgrKykge1xyXG4gICAgICAgIHZhciBub2RlID0gdGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93KHJvd0luZGV4KTtcclxuICAgICAgICBpZiAobm9kZSkge1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgY29sSW5kZXggPSAwOyBjb2xJbmRleCA8IGNvbHVtbnMubGVuZ3RoOyBjb2xJbmRleCsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29sdW1uID0gY29sdW1uc1tjb2xJbmRleF07XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVuZGVyZWRSb3cgPSB0aGlzLnJlbmRlcmVkUm93c1tyb3dJbmRleF07XHJcbiAgICAgICAgICAgICAgICB2YXIgZUdyaWRDZWxsID0gcmVuZGVyZWRSb3cuZVZvbGF0aWxlQ2VsbHNbY29sdW1uLmNvbElkXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWVHcmlkQ2VsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpc0ZpcnN0Q29sdW1uID0gY29sSW5kZXggPT09IDA7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2NvcGUgPSByZW5kZXJlZFJvdy5zY29wZTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNvZnRSZWZyZXNoQ2VsbChlR3JpZENlbGwsIGlzRmlyc3RDb2x1bW4sIG5vZGUsIGNvbHVtbiwgc2NvcGUsIHJvd0luZGV4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zb2Z0UmVmcmVzaENlbGwgPSBmdW5jdGlvbihlR3JpZENlbGwsIGlzRmlyc3RDb2x1bW4sIG5vZGUsIGNvbHVtbiwgc2NvcGUsIHJvd0luZGV4KSB7XHJcblxyXG4gICAgdXRpbHMucmVtb3ZlQWxsQ2hpbGRyZW4oZUdyaWRDZWxsKTtcclxuXHJcbiAgICB2YXIgZGF0YSA9IHRoaXMuZ2V0RGF0YUZvck5vZGUobm9kZSk7XHJcbiAgICB2YXIgdmFsdWVHZXR0ZXIgPSB0aGlzLmNyZWF0ZVZhbHVlR2V0dGVyKGRhdGEsIGNvbHVtbi5jb2xEZWYsIG5vZGUpO1xyXG5cclxuICAgIHZhciB2YWx1ZTtcclxuICAgIGlmICh2YWx1ZUdldHRlcikge1xyXG4gICAgICAgIHZhbHVlID0gdmFsdWVHZXR0ZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnBvcHVsYXRlQW5kU3R5bGVHcmlkQ2VsbCh2YWx1ZUdldHRlciwgdmFsdWUsIGVHcmlkQ2VsbCwgaXNGaXJzdENvbHVtbiwgbm9kZSwgY29sdW1uLCByb3dJbmRleCwgc2NvcGUpO1xyXG5cclxuICAgIC8vIGlmIGFuZ3VsYXIgY29tcGlsaW5nLCB0aGVuIG5lZWQgdG8gYWxzbyBjb21waWxlIHRoZSBjZWxsIGFnYWluIChhbmd1bGFyIGNvbXBpbGluZyBzdWNrcywgcGxlYXNlIHdhaXQuLi4pXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNBbmd1bGFyQ29tcGlsZVJvd3MoKSkge1xyXG4gICAgICAgIHRoaXMuJGNvbXBpbGUoZUdyaWRDZWxsKShzY29wZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUucm93RGF0YUNoYW5nZWQgPSBmdW5jdGlvbihyb3dzKSB7XHJcbiAgICAvLyB3ZSBvbmx5IG5lZWQgdG8gYmUgd29ycmllZCBhYm91dCByZW5kZXJlZCByb3dzLCBhcyB0aGlzIG1ldGhvZCBpc1xyXG4gICAgLy8gY2FsbGVkIHRvIHdoYXRzIHJlbmRlcmVkLiBpZiB0aGUgcm93IGlzbid0IHJlbmRlcmVkLCB3ZSBkb24ndCBjYXJlXHJcbiAgICB2YXIgaW5kZXhlc1RvUmVtb3ZlID0gW107XHJcbiAgICB2YXIgcmVuZGVyZWRSb3dzID0gdGhpcy5yZW5kZXJlZFJvd3M7XHJcbiAgICBPYmplY3Qua2V5cyhyZW5kZXJlZFJvd3MpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgdmFyIHJlbmRlcmVkUm93ID0gcmVuZGVyZWRSb3dzW2tleV07XHJcbiAgICAgICAgLy8gc2VlIGlmIHRoZSByZW5kZXJlZCByb3cgaXMgaW4gdGhlIGxpc3Qgb2Ygcm93cyB3ZSBoYXZlIHRvIHVwZGF0ZVxyXG4gICAgICAgIHZhciByb3dOZWVkc1VwZGF0aW5nID0gcm93cy5pbmRleE9mKHJlbmRlcmVkUm93Lm5vZGUuZGF0YSkgPj0gMDtcclxuICAgICAgICBpZiAocm93TmVlZHNVcGRhdGluZykge1xyXG4gICAgICAgICAgICBpbmRleGVzVG9SZW1vdmUucHVzaChrZXkpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgLy8gcmVtb3ZlIHRoZSByb3dzXHJcbiAgICB0aGlzLnJlbW92ZVZpcnR1YWxSb3dzKGluZGV4ZXNUb1JlbW92ZSk7XHJcbiAgICAvLyBhZGQgZHJhdyB0aGVtIGFnYWluXHJcbiAgICB0aGlzLmRyYXdWaXJ0dWFsUm93cygpO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnJlZnJlc2hBbGxWaXJ0dWFsUm93cyA9IGZ1bmN0aW9uKGZyb21JbmRleCkge1xyXG4gICAgLy8gcmVtb3ZlIGFsbCBjdXJyZW50IHZpcnR1YWwgcm93cywgYXMgdGhleSBoYXZlIG9sZCBkYXRhXHJcbiAgICB2YXIgcm93c1RvUmVtb3ZlID0gT2JqZWN0LmtleXModGhpcy5yZW5kZXJlZFJvd3MpO1xyXG4gICAgdGhpcy5yZW1vdmVWaXJ0dWFsUm93cyhyb3dzVG9SZW1vdmUsIGZyb21JbmRleCk7XHJcblxyXG4gICAgLy8gYWRkIGluIG5ldyByb3dzXHJcbiAgICB0aGlzLmRyYXdWaXJ0dWFsUm93cygpO1xyXG59O1xyXG5cclxuLy8gcHVibGljIC0gcmVtb3ZlcyB0aGUgZ3JvdXAgcm93cyBhbmQgdGhlbiByZWRyYXdzIHRoZW0gYWdhaW5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnJlZnJlc2hHcm91cFJvd3MgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGZpbmQgYWxsIHRoZSBncm91cCByb3dzXHJcbiAgICB2YXIgcm93c1RvUmVtb3ZlID0gW107XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBPYmplY3Qua2V5cyh0aGlzLnJlbmRlcmVkUm93cykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICB2YXIgcmVuZGVyZWRSb3cgPSB0aGF0LnJlbmRlcmVkUm93c1trZXldO1xyXG4gICAgICAgIHZhciBub2RlID0gcmVuZGVyZWRSb3cubm9kZTtcclxuICAgICAgICBpZiAobm9kZS5ncm91cCkge1xyXG4gICAgICAgICAgICByb3dzVG9SZW1vdmUucHVzaChrZXkpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgLy8gcmVtb3ZlIHRoZSByb3dzXHJcbiAgICB0aGlzLnJlbW92ZVZpcnR1YWxSb3dzKHJvd3NUb1JlbW92ZSk7XHJcbiAgICAvLyBhbmQgZHJhdyB0aGVtIGJhY2sgYWdhaW5cclxuICAgIHRoaXMuZW5zdXJlUm93c1JlbmRlcmVkKCk7XHJcbn07XHJcblxyXG4vLyB0YWtlcyBhcnJheSBvZiByb3cgaW5kZXhlc1xyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUucmVtb3ZlVmlydHVhbFJvd3MgPSBmdW5jdGlvbihyb3dzVG9SZW1vdmUsIGZyb21JbmRleCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgLy8gaWYgbm8gZnJvbUluZGV4IHRoZW4gc2V0IHRvIC0xLCB3aGljaCB3aWxsIHJlZnJlc2ggZXZlcnl0aGluZ1xyXG4gICAgdmFyIHJlYWxGcm9tSW5kZXggPSAodHlwZW9mIGZyb21JbmRleCA9PT0gJ251bWJlcicpID8gZnJvbUluZGV4IDogLTE7XHJcbiAgICByb3dzVG9SZW1vdmUuZm9yRWFjaChmdW5jdGlvbihpbmRleFRvUmVtb3ZlKSB7XHJcbiAgICAgICAgaWYgKGluZGV4VG9SZW1vdmUgPj0gcmVhbEZyb21JbmRleCkge1xyXG4gICAgICAgICAgICB0aGF0LnJlbW92ZVZpcnR1YWxSb3coaW5kZXhUb1JlbW92ZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiB0aGUgcm93IHdhcyBsYXN0IHRvIGhhdmUgZm9jdXMsIHdlIHJlbW92ZSB0aGUgZmFjdCB0aGF0IGl0IGhhcyBmb2N1c1xyXG4gICAgICAgICAgICBpZiAodGhhdC5mb2N1c2VkQ2VsbCAmJiB0aGF0LmZvY3VzZWRDZWxsLnJvd0luZGV4ID09IGluZGV4VG9SZW1vdmUpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQuZm9jdXNlZENlbGwgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUucmVtb3ZlVmlydHVhbFJvdyA9IGZ1bmN0aW9uKGluZGV4VG9SZW1vdmUpIHtcclxuICAgIHZhciByZW5kZXJlZFJvdyA9IHRoaXMucmVuZGVyZWRSb3dzW2luZGV4VG9SZW1vdmVdO1xyXG4gICAgaWYgKHJlbmRlcmVkUm93LnBpbm5lZEVsZW1lbnQgJiYgdGhpcy5lUGlubmVkQ29sc0NvbnRhaW5lcikge1xyXG4gICAgICAgIHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIucmVtb3ZlQ2hpbGQocmVuZGVyZWRSb3cucGlubmVkRWxlbWVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlbmRlcmVkUm93LmJvZHlFbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5lQm9keUNvbnRhaW5lci5yZW1vdmVDaGlsZChyZW5kZXJlZFJvdy5ib2R5RWxlbWVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlbmRlcmVkUm93LnNjb3BlKSB7XHJcbiAgICAgICAgcmVuZGVyZWRSb3cuc2NvcGUuJGRlc3Ryb3koKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0VmlydHVhbFJvd1JlbW92ZWQoKSkge1xyXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFZpcnR1YWxSb3dSZW1vdmVkKCkocmVuZGVyZWRSb3cuZGF0YSwgaW5kZXhUb1JlbW92ZSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFuZ3VsYXJHcmlkLm9uVmlydHVhbFJvd1JlbW92ZWQoaW5kZXhUb1JlbW92ZSk7XHJcblxyXG4gICAgZGVsZXRlIHRoaXMucmVuZGVyZWRSb3dzW2luZGV4VG9SZW1vdmVdO1xyXG4gICAgZGVsZXRlIHRoaXMucmVuZGVyZWRSb3dTdGFydEVkaXRpbmdMaXN0ZW5lcnNbaW5kZXhUb1JlbW92ZV07XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuZHJhd1ZpcnR1YWxSb3dzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZmlyc3Q7XHJcbiAgICB2YXIgbGFzdDtcclxuXHJcbiAgICB2YXIgcm93Q291bnQgPSB0aGlzLnJvd01vZGVsLmdldFZpcnR1YWxSb3dDb3VudCgpO1xyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0RvbnRVc2VTY3JvbGxzKCkpIHtcclxuICAgICAgICBmaXJzdCA9IDA7XHJcbiAgICAgICAgbGFzdCA9IHJvd0NvdW50O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgdG9wUGl4ZWwgPSB0aGlzLmVCb2R5Vmlld3BvcnQuc2Nyb2xsVG9wO1xyXG4gICAgICAgIHZhciBib3R0b21QaXhlbCA9IHRvcFBpeGVsICsgdGhpcy5lQm9keVZpZXdwb3J0Lm9mZnNldEhlaWdodDtcclxuXHJcbiAgICAgICAgZmlyc3QgPSBNYXRoLmZsb29yKHRvcFBpeGVsIC8gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93SGVpZ2h0KCkpO1xyXG4gICAgICAgIGxhc3QgPSBNYXRoLmZsb29yKGJvdHRvbVBpeGVsIC8gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93SGVpZ2h0KCkpO1xyXG5cclxuICAgICAgICAvL2FkZCBpbiBidWZmZXJcclxuICAgICAgICB2YXIgYnVmZmVyID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93QnVmZmVyKCkgfHwgY29uc3RhbnRzLlJPV19CVUZGRVJfU0laRTtcclxuICAgICAgICBmaXJzdCA9IGZpcnN0IC0gYnVmZmVyO1xyXG4gICAgICAgIGxhc3QgPSBsYXN0ICsgYnVmZmVyO1xyXG5cclxuICAgICAgICAvLyBhZGp1c3QsIGluIGNhc2UgYnVmZmVyIGV4dGVuZGVkIGFjdHVhbCBzaXplXHJcbiAgICAgICAgaWYgKGZpcnN0IDwgMCkge1xyXG4gICAgICAgICAgICBmaXJzdCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChsYXN0ID4gcm93Q291bnQgLSAxKSB7XHJcbiAgICAgICAgICAgIGxhc3QgPSByb3dDb3VudCAtIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3cgPSBmaXJzdDtcclxuICAgIHRoaXMubGFzdFZpcnR1YWxSZW5kZXJlZFJvdyA9IGxhc3Q7XHJcblxyXG4gICAgdGhpcy5lbnN1cmVSb3dzUmVuZGVyZWQoKTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5nZXRGaXJzdFZpcnR1YWxSZW5kZXJlZFJvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3c7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuZ2V0TGFzdFZpcnR1YWxSZW5kZXJlZFJvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubGFzdFZpcnR1YWxSZW5kZXJlZFJvdztcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5lbnN1cmVSb3dzUmVuZGVyZWQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgbWFpblJvd1dpZHRoID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRCb2R5Q29udGFpbmVyV2lkdGgoKTtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAvLyBhdCB0aGUgZW5kLCB0aGlzIGFycmF5IHdpbGwgY29udGFpbiB0aGUgaXRlbXMgd2UgbmVlZCB0byByZW1vdmVcclxuICAgIHZhciByb3dzVG9SZW1vdmUgPSBPYmplY3Qua2V5cyh0aGlzLnJlbmRlcmVkUm93cyk7XHJcblxyXG4gICAgLy8gYWRkIGluIG5ldyByb3dzXHJcbiAgICBmb3IgKHZhciByb3dJbmRleCA9IHRoaXMuZmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3c7IHJvd0luZGV4IDw9IHRoaXMubGFzdFZpcnR1YWxSZW5kZXJlZFJvdzsgcm93SW5kZXgrKykge1xyXG4gICAgICAgIC8vIHNlZSBpZiBpdGVtIGFscmVhZHkgdGhlcmUsIGFuZCBpZiB5ZXMsIHRha2UgaXQgb3V0IG9mIHRoZSAndG8gcmVtb3ZlJyBhcnJheVxyXG4gICAgICAgIGlmIChyb3dzVG9SZW1vdmUuaW5kZXhPZihyb3dJbmRleC50b1N0cmluZygpKSA+PSAwKSB7XHJcbiAgICAgICAgICAgIHJvd3NUb1JlbW92ZS5zcGxpY2Uocm93c1RvUmVtb3ZlLmluZGV4T2Yocm93SW5kZXgudG9TdHJpbmcoKSksIDEpO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY2hlY2sgdGhpcyByb3cgYWN0dWFsbHkgZXhpc3RzIChpbiBjYXNlIG92ZXJmbG93IGJ1ZmZlciB3aW5kb3cgZXhjZWVkcyByZWFsIGRhdGEpXHJcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnJvd01vZGVsLmdldFZpcnR1YWxSb3cocm93SW5kZXgpO1xyXG4gICAgICAgIGlmIChub2RlKSB7XHJcbiAgICAgICAgICAgIHRoYXQuaW5zZXJ0Um93KG5vZGUsIHJvd0luZGV4LCBtYWluUm93V2lkdGgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBhdCB0aGlzIHBvaW50LCBldmVyeXRoaW5nIGluIG91ciAncm93c1RvUmVtb3ZlJyAuIC4gLlxyXG4gICAgdGhpcy5yZW1vdmVWaXJ0dWFsUm93cyhyb3dzVG9SZW1vdmUpO1xyXG5cclxuICAgIC8vIGlmIHdlIGFyZSBkb2luZyBhbmd1bGFyIGNvbXBpbGluZywgdGhlbiBkbyBkaWdlc3QgdGhlIHNjb3BlIGhlcmVcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0FuZ3VsYXJDb21waWxlUm93cygpKSB7XHJcbiAgICAgICAgLy8gd2UgZG8gaXQgaW4gYSB0aW1lb3V0LCBpbiBjYXNlIHdlIGFyZSBhbHJlYWR5IGluIGFuIGFwcGx5XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuaW5zZXJ0Um93ID0gZnVuY3Rpb24obm9kZSwgcm93SW5kZXgsIG1haW5Sb3dXaWR0aCkge1xyXG4gICAgdmFyIGNvbHVtbnMgPSB0aGlzLmNvbHVtbk1vZGVsLmdldERpc3BsYXllZENvbHVtbnMoKTtcclxuICAgIC8vIGlmIG5vIGNvbHMsIGRvbid0IGRyYXcgcm93XHJcbiAgICBpZiAoIWNvbHVtbnMgfHwgY29sdW1ucy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyB2YXIgcm93RGF0YSA9IG5vZGUucm93RGF0YTtcclxuICAgIHZhciByb3dJc0FHcm91cCA9IG5vZGUuZ3JvdXA7XHJcblxyXG4gICAgLy8gdHJ5IGNvbXBpbGluZyBhcyB3ZSBpbnNlcnQgcm93c1xyXG4gICAgdmFyIG5ld0NoaWxkU2NvcGUgPSB0aGlzLmNyZWF0ZUNoaWxkU2NvcGVPck51bGwobm9kZS5kYXRhKTtcclxuXHJcbiAgICB2YXIgZVBpbm5lZFJvdyA9IHRoaXMuY3JlYXRlUm93Q29udGFpbmVyKHJvd0luZGV4LCBub2RlLCByb3dJc0FHcm91cCwgbmV3Q2hpbGRTY29wZSk7XHJcbiAgICB2YXIgZU1haW5Sb3cgPSB0aGlzLmNyZWF0ZVJvd0NvbnRhaW5lcihyb3dJbmRleCwgbm9kZSwgcm93SXNBR3JvdXAsIG5ld0NoaWxkU2NvcGUpO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgIGVNYWluUm93LnN0eWxlLndpZHRoID0gbWFpblJvd1dpZHRoICsgXCJweFwiO1xyXG5cclxuICAgIHZhciByZW5kZXJlZFJvdyA9IHtcclxuICAgICAgICBzY29wZTogbmV3Q2hpbGRTY29wZSxcclxuICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICBlQ2VsbHM6IHt9LFxyXG4gICAgICAgIGVWb2xhdGlsZUNlbGxzOiB7fVxyXG4gICAgfTtcclxuICAgIHRoaXMucmVuZGVyZWRSb3dzW3Jvd0luZGV4XSA9IHJlbmRlcmVkUm93O1xyXG4gICAgdGhpcy5yZW5kZXJlZFJvd1N0YXJ0RWRpdGluZ0xpc3RlbmVyc1tyb3dJbmRleF0gPSB7fTtcclxuXHJcbiAgICAvLyBpZiBncm91cCBpdGVtLCBpbnNlcnQgdGhlIGZpcnN0IHJvd1xyXG4gICAgdmFyIGdyb3VwSGVhZGVyVGFrZXNFbnRpcmVSb3cgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwVXNlRW50aXJlUm93KCk7XHJcbiAgICB2YXIgZHJhd0dyb3VwUm93ID0gcm93SXNBR3JvdXAgJiYgZ3JvdXBIZWFkZXJUYWtlc0VudGlyZVJvdztcclxuXHJcbiAgICBpZiAoZHJhd0dyb3VwUm93KSB7XHJcbiAgICAgICAgdmFyIGZpcnN0Q29sdW1uID0gY29sdW1uc1swXTtcclxuXHJcbiAgICAgICAgdmFyIGVHcm91cFJvdyA9IHRoYXQuY3JlYXRlR3JvdXBFbGVtZW50KG5vZGUsIHJvd0luZGV4LCBmYWxzZSk7XHJcbiAgICAgICAgaWYgKGZpcnN0Q29sdW1uLnBpbm5lZCkge1xyXG4gICAgICAgICAgICBlUGlubmVkUm93LmFwcGVuZENoaWxkKGVHcm91cFJvdyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgZUdyb3VwUm93UGFkZGluZyA9IHRoYXQuY3JlYXRlR3JvdXBFbGVtZW50KG5vZGUsIHJvd0luZGV4LCB0cnVlKTtcclxuICAgICAgICAgICAgZU1haW5Sb3cuYXBwZW5kQ2hpbGQoZUdyb3VwUm93UGFkZGluZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZU1haW5Sb3cuYXBwZW5kQ2hpbGQoZUdyb3VwUm93KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgY29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uKGNvbHVtbiwgaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIGZpcnN0Q29sID0gaW5kZXggPT09IDA7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhhdC5nZXREYXRhRm9yTm9kZShub2RlKTtcclxuICAgICAgICAgICAgdmFyIHZhbHVlR2V0dGVyID0gdGhhdC5jcmVhdGVWYWx1ZUdldHRlcihkYXRhLCBjb2x1bW4uY29sRGVmLCBub2RlKTtcclxuICAgICAgICAgICAgdGhhdC5jcmVhdGVDZWxsRnJvbUNvbERlZihmaXJzdENvbCwgY29sdW1uLCB2YWx1ZUdldHRlciwgbm9kZSwgcm93SW5kZXgsIGVNYWluUm93LCBlUGlubmVkUm93LCBuZXdDaGlsZFNjb3BlLCByZW5kZXJlZFJvdyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy90cnkgY29tcGlsaW5nIGFzIHdlIGluc2VydCByb3dzXHJcbiAgICByZW5kZXJlZFJvdy5waW5uZWRFbGVtZW50ID0gdGhpcy5jb21waWxlQW5kQWRkKHRoaXMuZVBpbm5lZENvbHNDb250YWluZXIsIHJvd0luZGV4LCBlUGlubmVkUm93LCBuZXdDaGlsZFNjb3BlKTtcclxuICAgIHJlbmRlcmVkUm93LmJvZHlFbGVtZW50ID0gdGhpcy5jb21waWxlQW5kQWRkKHRoaXMuZUJvZHlDb250YWluZXIsIHJvd0luZGV4LCBlTWFpblJvdywgbmV3Q2hpbGRTY29wZSk7XHJcbn07XHJcblxyXG4vLyBpZiBncm91cCBpcyBhIGZvb3RlciwgYWx3YXlzIHNob3cgdGhlIGRhdGEuXHJcbi8vIGlmIGdyb3VwIGlzIGEgaGVhZGVyLCBvbmx5IHNob3cgZGF0YSBpZiBub3QgZXhwYW5kZWRcclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmdldERhdGFGb3JOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKG5vZGUuZm9vdGVyKSB7XHJcbiAgICAgICAgLy8gaWYgZm9vdGVyLCB3ZSBhbHdheXMgc2hvdyB0aGUgZGF0YVxyXG4gICAgICAgIHJldHVybiBub2RlLmRhdGE7XHJcbiAgICB9IGVsc2UgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICAvLyBpZiBoZWFkZXIgYW5kIGhlYWRlciBpcyBleHBhbmRlZCwgd2Ugc2hvdyBkYXRhIGluIGZvb3RlciBvbmx5XHJcbiAgICAgICAgdmFyIGZvb3RlcnNFbmFibGVkID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cEluY2x1ZGVGb290ZXIoKTtcclxuICAgICAgICByZXR1cm4gKG5vZGUuZXhwYW5kZWQgJiYgZm9vdGVyc0VuYWJsZWQpID8gdW5kZWZpbmVkIDogbm9kZS5kYXRhO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvdGhlcndpc2UgaXQncyBhIG5vcm1hbCBub2RlLCBqdXN0IHJldHVybiBkYXRhIGFzIG5vcm1hbFxyXG4gICAgICAgIHJldHVybiBub2RlLmRhdGE7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlVmFsdWVHZXR0ZXIgPSBmdW5jdGlvbihkYXRhLCBjb2xEZWYsIG5vZGUpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXBpID0gdGhhdC5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKCk7XHJcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KCk7XHJcbiAgICAgICAgcmV0dXJuIHV0aWxzLmdldFZhbHVlKHRoYXQuZXhwcmVzc2lvblNlcnZpY2UsIGRhdGEsIGNvbERlZiwgbm9kZSwgYXBpLCBjb250ZXh0KTtcclxuICAgIH07XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlQ2hpbGRTY29wZU9yTnVsbCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0FuZ3VsYXJDb21waWxlUm93cygpKSB7XHJcbiAgICAgICAgdmFyIG5ld0NoaWxkU2NvcGUgPSB0aGlzLiRzY29wZS4kbmV3KCk7XHJcbiAgICAgICAgbmV3Q2hpbGRTY29wZS5kYXRhID0gZGF0YTtcclxuICAgICAgICByZXR1cm4gbmV3Q2hpbGRTY29wZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY29tcGlsZUFuZEFkZCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgcm93SW5kZXgsIGVsZW1lbnQsIHNjb3BlKSB7XHJcbiAgICBpZiAoc2NvcGUpIHtcclxuICAgICAgICB2YXIgZUVsZW1lbnRDb21waWxlZCA9IHRoaXMuJGNvbXBpbGUoZWxlbWVudCkoc2NvcGUpO1xyXG4gICAgICAgIGlmIChjb250YWluZXIpIHsgLy8gY2hlY2tpbmcgY29udGFpbmVyLCBhcyBpZiBub1Njcm9sbCwgcGlubmVkIGNvbnRhaW5lciBpcyBtaXNzaW5nXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlRWxlbWVudENvbXBpbGVkWzBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGVFbGVtZW50Q29tcGlsZWRbMF07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChjb250YWluZXIpIHtcclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVDZWxsRnJvbUNvbERlZiA9IGZ1bmN0aW9uKGlzRmlyc3RDb2x1bW4sIGNvbHVtbiwgdmFsdWVHZXR0ZXIsIG5vZGUsIHJvd0luZGV4LCBlTWFpblJvdywgZVBpbm5lZFJvdywgJGNoaWxkU2NvcGUsIHJlbmRlcmVkUm93KSB7XHJcbiAgICB2YXIgZUdyaWRDZWxsID0gdGhpcy5jcmVhdGVDZWxsKGlzRmlyc3RDb2x1bW4sIGNvbHVtbiwgdmFsdWVHZXR0ZXIsIG5vZGUsIHJvd0luZGV4LCAkY2hpbGRTY29wZSk7XHJcblxyXG4gICAgaWYgKGNvbHVtbi5jb2xEZWYudm9sYXRpbGUpIHtcclxuICAgICAgICByZW5kZXJlZFJvdy5lVm9sYXRpbGVDZWxsc1tjb2x1bW4uY29sSWRdID0gZUdyaWRDZWxsO1xyXG4gICAgfVxyXG4gICAgcmVuZGVyZWRSb3cuZUNlbGxzW2NvbHVtbi5jb2xJZF0gPSBlR3JpZENlbGw7XHJcblxyXG4gICAgaWYgKGNvbHVtbi5waW5uZWQpIHtcclxuICAgICAgICBlUGlubmVkUm93LmFwcGVuZENoaWxkKGVHcmlkQ2VsbCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVNYWluUm93LmFwcGVuZENoaWxkKGVHcmlkQ2VsbCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuYWRkQ2xhc3Nlc1RvUm93ID0gZnVuY3Rpb24ocm93SW5kZXgsIG5vZGUsIGVSb3cpIHtcclxuICAgIHZhciBjbGFzc2VzTGlzdCA9IFtcImFnLXJvd1wiXTtcclxuICAgIGNsYXNzZXNMaXN0LnB1c2gocm93SW5kZXggJSAyID09IDAgPyBcImFnLXJvdy1ldmVuXCIgOiBcImFnLXJvdy1vZGRcIik7XHJcblxyXG4gICAgaWYgKHRoaXMuc2VsZWN0aW9uQ29udHJvbGxlci5pc05vZGVTZWxlY3RlZChub2RlKSkge1xyXG4gICAgICAgIGNsYXNzZXNMaXN0LnB1c2goXCJhZy1yb3ctc2VsZWN0ZWRcIik7XHJcbiAgICB9XHJcbiAgICBpZiAobm9kZS5ncm91cCkge1xyXG4gICAgICAgIC8vIGlmIGEgZ3JvdXAsIHB1dCB0aGUgbGV2ZWwgb2YgdGhlIGdyb3VwIGluXHJcbiAgICAgICAgY2xhc3Nlc0xpc3QucHVzaChcImFnLXJvdy1sZXZlbC1cIiArIG5vZGUubGV2ZWwpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBpZiBhIGxlYWYsIGFuZCBhIHBhcmVudCBleGlzdHMsIHB1dCBhIGxldmVsIG9mIHRoZSBwYXJlbnQsIGVsc2UgcHV0IGxldmVsIG9mIDAgZm9yIHRvcCBsZXZlbCBpdGVtXHJcbiAgICAgICAgaWYgKG5vZGUucGFyZW50KSB7XHJcbiAgICAgICAgICAgIGNsYXNzZXNMaXN0LnB1c2goXCJhZy1yb3ctbGV2ZWwtXCIgKyAobm9kZS5wYXJlbnQubGV2ZWwgKyAxKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2xhc3Nlc0xpc3QucHVzaChcImFnLXJvdy1sZXZlbC0wXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgY2xhc3Nlc0xpc3QucHVzaChcImFnLXJvdy1ncm91cFwiKTtcclxuICAgIH1cclxuICAgIGlmIChub2RlLmdyb3VwICYmICFub2RlLmZvb3RlciAmJiBub2RlLmV4cGFuZGVkKSB7XHJcbiAgICAgICAgY2xhc3Nlc0xpc3QucHVzaChcImFnLXJvdy1ncm91cC1leHBhbmRlZFwiKTtcclxuICAgIH1cclxuICAgIGlmIChub2RlLmdyb3VwICYmICFub2RlLmZvb3RlciAmJiAhbm9kZS5leHBhbmRlZCkge1xyXG4gICAgICAgIC8vIG9wcG9zaXRlIG9mIGV4cGFuZGVkIGlzIGNvbnRyYWN0ZWQgYWNjb3JkaW5nIHRvIHRoZSBpbnRlcm5ldC5cclxuICAgICAgICBjbGFzc2VzTGlzdC5wdXNoKFwiYWctcm93LWdyb3VwLWNvbnRyYWN0ZWRcIik7XHJcbiAgICB9XHJcbiAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmZvb3Rlcikge1xyXG4gICAgICAgIGNsYXNzZXNMaXN0LnB1c2goXCJhZy1yb3ctZm9vdGVyXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFkZCBpbiBleHRyYSBjbGFzc2VzIHByb3ZpZGVkIGJ5IHRoZSBjb25maWdcclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dDbGFzcygpKSB7XHJcbiAgICAgICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKSxcclxuICAgICAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIGV4dHJhUm93Q2xhc3NlcyA9IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd0NsYXNzKCkocGFyYW1zKTtcclxuICAgICAgICBpZiAoZXh0cmFSb3dDbGFzc2VzKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXh0cmFSb3dDbGFzc2VzID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgY2xhc3Nlc0xpc3QucHVzaChleHRyYVJvd0NsYXNzZXMpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZXh0cmFSb3dDbGFzc2VzKSkge1xyXG4gICAgICAgICAgICAgICAgZXh0cmFSb3dDbGFzc2VzLmZvckVhY2goZnVuY3Rpb24oY2xhc3NJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3Nlc0xpc3QucHVzaChjbGFzc0l0ZW0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNsYXNzZXMgPSBjbGFzc2VzTGlzdC5qb2luKFwiIFwiKTtcclxuXHJcbiAgICBlUm93LmNsYXNzTmFtZSA9IGNsYXNzZXM7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlUm93Q29udGFpbmVyID0gZnVuY3Rpb24ocm93SW5kZXgsIG5vZGUsIGdyb3VwUm93LCAkc2NvcGUpIHtcclxuICAgIHZhciBlUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuXHJcbiAgICB0aGlzLmFkZENsYXNzZXNUb1Jvdyhyb3dJbmRleCwgbm9kZSwgZVJvdyk7XHJcblxyXG4gICAgZVJvdy5zZXRBdHRyaWJ1dGUoJ3JvdycsIHJvd0luZGV4KTtcclxuXHJcbiAgICAvLyBpZiBzaG93aW5nIHNjcm9sbHMsIHBvc2l0aW9uIG9uIHRoZSBjb250YWluZXJcclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNEb250VXNlU2Nyb2xscygpKSB7XHJcbiAgICAgICAgZVJvdy5zdHlsZS50b3AgPSAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93SGVpZ2h0KCkgKiByb3dJbmRleCkgKyBcInB4XCI7XHJcbiAgICB9XHJcbiAgICBlUm93LnN0eWxlLmhlaWdodCA9ICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRSb3dIZWlnaHQoKSkgKyBcInB4XCI7XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFJvd1N0eWxlKCkpIHtcclxuICAgICAgICB2YXIgY3NzVG9Vc2U7XHJcbiAgICAgICAgdmFyIHJvd1N0eWxlID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93U3R5bGUoKTtcclxuICAgICAgICBpZiAodHlwZW9mIHJvd1N0eWxlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKSxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKSxcclxuICAgICAgICAgICAgICAgICRzY29wZTogJHNjb3BlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNzc1RvVXNlID0gcm93U3R5bGUocGFyYW1zKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjc3NUb1VzZSA9IHJvd1N0eWxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNzc1RvVXNlKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNzc1RvVXNlKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICAgICAgZVJvdy5zdHlsZVtrZXldID0gY3NzVG9Vc2Vba2V5XTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICBlUm93LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIF90aGlzLmFuZ3VsYXJHcmlkLm9uUm93Q2xpY2tlZChldmVudCwgTnVtYmVyKHRoaXMuZ2V0QXR0cmlidXRlKFwicm93XCIpKSwgbm9kZSlcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBlUm93O1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmdldEluZGV4T2ZSZW5kZXJlZE5vZGUgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICB2YXIgcmVuZGVyZWRSb3dzID0gdGhpcy5yZW5kZXJlZFJvd3M7XHJcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHJlbmRlcmVkUm93cyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAocmVuZGVyZWRSb3dzW2tleXNbaV1dLm5vZGUgPT09IG5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlbmRlcmVkUm93c1trZXlzW2ldXS5yb3dJbmRleDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gLTE7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlR3JvdXBFbGVtZW50ID0gZnVuY3Rpb24obm9kZSwgcm93SW5kZXgsIHBhZGRpbmcpIHtcclxuICAgIHZhciBlUm93O1xyXG4gICAgLy8gcGFkZGluZyBtZWFucyB3ZSBhcmUgb24gdGhlIHJpZ2h0IGhhbmQgc2lkZSBvZiBhIHBpbm5lZCB0YWJsZSwgaWVcclxuICAgIC8vIGluIHRoZSBtYWluIGJvZHkuXHJcbiAgICBpZiAocGFkZGluZykge1xyXG4gICAgICAgIGVSb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBwYXJhbXMgPSB7XHJcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgcm93SW5kZXg6IHJvd0luZGV4LFxyXG4gICAgICAgICAgICBhcGk6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpLFxyXG4gICAgICAgICAgICBjb2xEZWY6IHtcclxuICAgICAgICAgICAgICAgIGNlbGxSZW5kZXJlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmVyOiAnZ3JvdXAnLFxyXG4gICAgICAgICAgICAgICAgICAgIGlubmVyUmVuZGVyZXI6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEdyb3VwUm93SW5uZXJSZW5kZXJlcigpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGVSb3cgPSB0aGlzLmNlbGxSZW5kZXJlck1hcFsnZ3JvdXAnXShwYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChub2RlLmZvb3Rlcikge1xyXG4gICAgICAgIHV0aWxzLmFkZENzc0NsYXNzKGVSb3csICdhZy1mb290ZXItY2VsbC1lbnRpcmUtcm93Jyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHV0aWxzLmFkZENzc0NsYXNzKGVSb3csICdhZy1ncm91cC1jZWxsLWVudGlyZS1yb3cnKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZVJvdztcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5wdXREYXRhSW50b0NlbGwgPSBmdW5jdGlvbihjb2x1bW4sIHZhbHVlLCB2YWx1ZUdldHRlciwgbm9kZSwgJGNoaWxkU2NvcGUsIGVTcGFuV2l0aFZhbHVlLCBlR3JpZENlbGwsIHJvd0luZGV4LCByZWZyZXNoQ2VsbEZ1bmN0aW9uKSB7XHJcbiAgICAvLyB0ZW1wbGF0ZSBnZXRzIHByZWZlcmVuY2UsIHRoZW4gY2VsbFJlbmRlcmVyLCB0aGVuIGRvIGl0IG91cnNlbHZlc1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcbiAgICBpZiAoY29sRGVmLnRlbXBsYXRlKSB7XHJcbiAgICAgICAgZVNwYW5XaXRoVmFsdWUuaW5uZXJIVE1MID0gY29sRGVmLnRlbXBsYXRlO1xyXG4gICAgfSBlbHNlIGlmIChjb2xEZWYudGVtcGxhdGVVcmwpIHtcclxuICAgICAgICB2YXIgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlU2VydmljZS5nZXRUZW1wbGF0ZShjb2xEZWYudGVtcGxhdGVVcmwsIHJlZnJlc2hDZWxsRnVuY3Rpb24pO1xyXG4gICAgICAgIGlmICh0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICBlU3BhbldpdGhWYWx1ZS5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKGNvbERlZi5jZWxsUmVuZGVyZXIpIHtcclxuICAgICAgICB0aGlzLnVzZUNlbGxSZW5kZXJlcihjb2x1bW4sIHZhbHVlLCBub2RlLCAkY2hpbGRTY29wZSwgZVNwYW5XaXRoVmFsdWUsIHJvd0luZGV4LCByZWZyZXNoQ2VsbEZ1bmN0aW9uLCB2YWx1ZUdldHRlciwgZUdyaWRDZWxsKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gaWYgd2UgaW5zZXJ0IHVuZGVmaW5lZCwgdGhlbiBpdCBkaXNwbGF5cyBhcyB0aGUgc3RyaW5nICd1bmRlZmluZWQnLCB1Z2x5IVxyXG4gICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSAnJykge1xyXG4gICAgICAgICAgICBlU3BhbldpdGhWYWx1ZS5pbm5lckhUTUwgPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUudXNlQ2VsbFJlbmRlcmVyID0gZnVuY3Rpb24oY29sdW1uLCB2YWx1ZSwgbm9kZSwgJGNoaWxkU2NvcGUsIGVTcGFuV2l0aFZhbHVlLCByb3dJbmRleCwgcmVmcmVzaENlbGxGdW5jdGlvbiwgdmFsdWVHZXR0ZXIsIGVHcmlkQ2VsbCkge1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcbiAgICB2YXIgcmVuZGVyZXJQYXJhbXMgPSB7XHJcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgIHZhbHVlR2V0dGVyOiB2YWx1ZUdldHRlcixcclxuICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICBjb2x1bW46IGNvbHVtbixcclxuICAgICAgICAkc2NvcGU6ICRjaGlsZFNjb3BlLFxyXG4gICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICBhcGk6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpLFxyXG4gICAgICAgIGNvbnRleHQ6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKSxcclxuICAgICAgICByZWZyZXNoQ2VsbDogcmVmcmVzaENlbGxGdW5jdGlvbixcclxuICAgICAgICBlR3JpZENlbGw6IGVHcmlkQ2VsbFxyXG4gICAgfTtcclxuICAgIHZhciBjZWxsUmVuZGVyZXI7XHJcbiAgICBpZiAodHlwZW9mIGNvbERlZi5jZWxsUmVuZGVyZXIgPT09ICdvYmplY3QnICYmIGNvbERlZi5jZWxsUmVuZGVyZXIgIT09IG51bGwpIHtcclxuICAgICAgICBjZWxsUmVuZGVyZXIgPSB0aGlzLmNlbGxSZW5kZXJlck1hcFtjb2xEZWYuY2VsbFJlbmRlcmVyLnJlbmRlcmVyXTtcclxuICAgICAgICBpZiAoIWNlbGxSZW5kZXJlcikge1xyXG4gICAgICAgICAgICB0aHJvdyAnQ2VsbCByZW5kZXJlciAnICsgY29sRGVmLmNlbGxSZW5kZXJlciArICcgbm90IGZvdW5kLCBhdmFpbGFibGUgYXJlICcgKyBPYmplY3Qua2V5cyh0aGlzLmNlbGxSZW5kZXJlck1hcCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgY29sRGVmLmNlbGxSZW5kZXJlciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIGNlbGxSZW5kZXJlciA9IGNvbERlZi5jZWxsUmVuZGVyZXI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRocm93ICdDZWxsIFJlbmRlcmVyIG11c3QgYmUgU3RyaW5nIG9yIEZ1bmN0aW9uJztcclxuICAgIH1cclxuICAgIHZhciByZXN1bHRGcm9tUmVuZGVyZXIgPSBjZWxsUmVuZGVyZXIocmVuZGVyZXJQYXJhbXMpO1xyXG4gICAgaWYgKHV0aWxzLmlzTm9kZU9yRWxlbWVudChyZXN1bHRGcm9tUmVuZGVyZXIpKSB7XHJcbiAgICAgICAgLy8gYSBkb20gbm9kZSBvciBlbGVtZW50IHdhcyByZXR1cm5lZCwgc28gYWRkIGNoaWxkXHJcbiAgICAgICAgZVNwYW5XaXRoVmFsdWUuYXBwZW5kQ2hpbGQocmVzdWx0RnJvbVJlbmRlcmVyKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gb3RoZXJ3aXNlIGFzc3VtZSBpdCB3YXMgaHRtbCwgc28ganVzdCBpbnNlcnRcclxuICAgICAgICBlU3BhbldpdGhWYWx1ZS5pbm5lckhUTUwgPSByZXN1bHRGcm9tUmVuZGVyZXI7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuYWRkU3R5bGVzRnJvbUNvbGxEZWYgPSBmdW5jdGlvbihjb2x1bW4sIHZhbHVlLCBub2RlLCAkY2hpbGRTY29wZSwgZUdyaWRDZWxsKSB7XHJcbiAgICB2YXIgY29sRGVmID0gY29sdW1uLmNvbERlZjtcclxuICAgIGlmIChjb2xEZWYuY2VsbFN0eWxlKSB7XHJcbiAgICAgICAgdmFyIGNzc1RvVXNlO1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29sRGVmLmNlbGxTdHlsZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB2YXIgY2VsbFN0eWxlUGFyYW1zID0ge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAgICAgY29sdW1uOiBjb2x1bW4sXHJcbiAgICAgICAgICAgICAgICAkc2NvcGU6ICRjaGlsZFNjb3BlLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dDogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Q29udGV4dCgpLFxyXG4gICAgICAgICAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjc3NUb1VzZSA9IGNvbERlZi5jZWxsU3R5bGUoY2VsbFN0eWxlUGFyYW1zKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjc3NUb1VzZSA9IGNvbERlZi5jZWxsU3R5bGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY3NzVG9Vc2UpIHtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMoY3NzVG9Vc2UpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgICAgICBlR3JpZENlbGwuc3R5bGVba2V5XSA9IGNzc1RvVXNlW2tleV07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5hZGRDbGFzc2VzRnJvbUNvbGxEZWYgPSBmdW5jdGlvbihjb2xEZWYsIHZhbHVlLCBub2RlLCAkY2hpbGRTY29wZSwgZUdyaWRDZWxsKSB7XHJcbiAgICBpZiAoY29sRGVmLmNlbGxDbGFzcykge1xyXG4gICAgICAgIHZhciBjbGFzc1RvVXNlO1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29sRGVmLmNlbGxDbGFzcyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB2YXIgY2VsbENsYXNzUGFyYW1zID0ge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogbm9kZS5kYXRhLFxyXG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAgICAgJHNjb3BlOiAkY2hpbGRTY29wZSxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKSxcclxuICAgICAgICAgICAgICAgIGFwaTogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY2xhc3NUb1VzZSA9IGNvbERlZi5jZWxsQ2xhc3MoY2VsbENsYXNzUGFyYW1zKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjbGFzc1RvVXNlID0gY29sRGVmLmNlbGxDbGFzcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgY2xhc3NUb1VzZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdXRpbHMuYWRkQ3NzQ2xhc3MoZUdyaWRDZWxsLCBjbGFzc1RvVXNlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoY2xhc3NUb1VzZSkpIHtcclxuICAgICAgICAgICAgY2xhc3NUb1VzZS5mb3JFYWNoKGZ1bmN0aW9uKGNzc0NsYXNzSXRlbSkge1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuYWRkQ3NzQ2xhc3MoZUdyaWRDZWxsLCBjc3NDbGFzc0l0ZW0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuYWRkQ2xhc3Nlc1RvQ2VsbCA9IGZ1bmN0aW9uKGNvbHVtbiwgbm9kZSwgZUdyaWRDZWxsKSB7XHJcbiAgICB2YXIgY2xhc3NlcyA9IFsnYWctY2VsbCcsICdhZy1jZWxsLW5vLWZvY3VzJywgJ2NlbGwtY29sLScgKyBjb2x1bW4uaW5kZXhdO1xyXG4gICAgaWYgKG5vZGUuZ3JvdXApIHtcclxuICAgICAgICBpZiAobm9kZS5mb290ZXIpIHtcclxuICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKCdhZy1mb290ZXItY2VsbCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNsYXNzZXMucHVzaCgnYWctZ3JvdXAtY2VsbCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVHcmlkQ2VsbC5jbGFzc05hbWUgPSBjbGFzc2VzLmpvaW4oJyAnKTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5hZGRDbGFzc2VzRnJvbVJ1bGVzID0gZnVuY3Rpb24oY29sRGVmLCBlR3JpZENlbGwsIHZhbHVlLCBub2RlLCByb3dJbmRleCkge1xyXG4gICAgdmFyIGNsYXNzUnVsZXMgPSBjb2xEZWYuY2VsbENsYXNzUnVsZXM7XHJcbiAgICBpZiAodHlwZW9mIGNsYXNzUnVsZXMgPT09ICdvYmplY3QnICYmIGNsYXNzUnVsZXMgIT09IG51bGwpIHtcclxuXHJcbiAgICAgICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgICAgIGFwaTogdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0QXBpKCksXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENvbnRleHQoKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBjbGFzc05hbWVzID0gT2JqZWN0LmtleXMoY2xhc3NSdWxlcyk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc05hbWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSBjbGFzc05hbWVzW2ldO1xyXG4gICAgICAgICAgICB2YXIgcnVsZSA9IGNsYXNzUnVsZXNbY2xhc3NOYW1lXTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdE9mUnVsZTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBydWxlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0T2ZSdWxlID0gdGhpcy5leHByZXNzaW9uU2VydmljZS5ldmFsdWF0ZShydWxlLCBwYXJhbXMpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBydWxlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRPZlJ1bGUgPSBydWxlKHBhcmFtcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlc3VsdE9mUnVsZSkge1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuYWRkQ3NzQ2xhc3MoZUdyaWRDZWxsLCBjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdXRpbHMucmVtb3ZlQ3NzQ2xhc3MoZUdyaWRDZWxsLCBjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmNyZWF0ZUNlbGwgPSBmdW5jdGlvbihpc0ZpcnN0Q29sdW1uLCBjb2x1bW4sIHZhbHVlR2V0dGVyLCBub2RlLCByb3dJbmRleCwgJGNoaWxkU2NvcGUpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHZhciBlR3JpZENlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgZUdyaWRDZWxsLnNldEF0dHJpYnV0ZShcImNvbFwiLCBjb2x1bW4uaW5kZXgpO1xyXG5cclxuICAgIC8vIG9ubHkgc2V0IHRhYiBpbmRleCBpZiBjZWxsIHNlbGVjdGlvbiBpcyBlbmFibGVkXHJcbiAgICBpZiAoIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzU3VwcHJlc3NDZWxsU2VsZWN0aW9uKCkpIHtcclxuICAgICAgICBlR3JpZENlbGwuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgXCItMVwiKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdmFsdWU7XHJcbiAgICBpZiAodmFsdWVHZXR0ZXIpIHtcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlR2V0dGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGhlc2UgYXJlIHRoZSBncmlkIHN0eWxlcywgZG9uJ3QgY2hhbmdlIGJldHdlZW4gc29mdCByZWZyZXNoZXNcclxuICAgIHRoaXMuYWRkQ2xhc3Nlc1RvQ2VsbChjb2x1bW4sIG5vZGUsIGVHcmlkQ2VsbCk7XHJcblxyXG4gICAgdGhpcy5wb3B1bGF0ZUFuZFN0eWxlR3JpZENlbGwodmFsdWVHZXR0ZXIsIHZhbHVlLCBlR3JpZENlbGwsIGlzRmlyc3RDb2x1bW4sIG5vZGUsIGNvbHVtbiwgcm93SW5kZXgsICRjaGlsZFNjb3BlKTtcclxuXHJcbiAgICB0aGlzLmFkZENlbGxDbGlja2VkSGFuZGxlcihlR3JpZENlbGwsIG5vZGUsIGNvbHVtbiwgdmFsdWUsIHJvd0luZGV4KTtcclxuICAgIHRoaXMuYWRkQ2VsbERvdWJsZUNsaWNrZWRIYW5kbGVyKGVHcmlkQ2VsbCwgbm9kZSwgY29sdW1uLCB2YWx1ZSwgcm93SW5kZXgsICRjaGlsZFNjb3BlLCBpc0ZpcnN0Q29sdW1uLCB2YWx1ZUdldHRlcik7XHJcblxyXG4gICAgdGhpcy5hZGRDZWxsTmF2aWdhdGlvbkhhbmRsZXIoZUdyaWRDZWxsLCByb3dJbmRleCwgY29sdW1uLCBub2RlKTtcclxuXHJcbiAgICBlR3JpZENlbGwuc3R5bGUud2lkdGggPSB1dGlscy5mb3JtYXRXaWR0aChjb2x1bW4uYWN0dWFsV2lkdGgpO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgJ3N0YXJ0IGVkaXRpbmcnIGNhbGwgdG8gdGhlIGNoYWluIG9mIGVkaXRvcnNcclxuICAgIHRoaXMucmVuZGVyZWRSb3dTdGFydEVkaXRpbmdMaXN0ZW5lcnNbcm93SW5kZXhdW2NvbHVtbi5jb2xJZF0gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAodGhhdC5pc0NlbGxFZGl0YWJsZShjb2x1bW4uY29sRGVmLCBub2RlKSkge1xyXG4gICAgICAgICAgICB0aGF0LnN0YXJ0RWRpdGluZyhlR3JpZENlbGwsIGNvbHVtbiwgbm9kZSwgJGNoaWxkU2NvcGUsIHJvd0luZGV4LCBpc0ZpcnN0Q29sdW1uLCB2YWx1ZUdldHRlcik7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBlR3JpZENlbGw7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuYWRkQ2VsbE5hdmlnYXRpb25IYW5kbGVyID0gZnVuY3Rpb24oZUdyaWRDZWxsLCByb3dJbmRleCwgY29sdW1uLCBub2RlKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBlR3JpZENlbGwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKHRoYXQuZWRpdGluZ0NlbGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBvbmx5IGludGVyZXN0ZWQgb24ga2V5IHByZXNzZXMgdGhhdCBhcmUgZGlyZWN0bHkgb24gdGhpcyBlbGVtZW50LCBub3QgYW55IGNoaWxkcmVuIGVsZW1lbnRzLiB0aGlzXHJcbiAgICAgICAgLy8gc3RvcHMgbmF2aWdhdGlvbiBpZiB0aGUgdXNlciBpcyBpbiwgZm9yIGV4YW1wbGUsIGEgdGV4dCBmaWVsZCBpbnNpZGUgdGhlIGNlbGwsIGFuZCB1c2VyIGhpdHNcclxuICAgICAgICAvLyBvbiBvZiB0aGUga2V5cyB3ZSBhcmUgbG9va2luZyBmb3IuXHJcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCAhPT0gZUdyaWRDZWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBrZXkgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlO1xyXG5cclxuICAgICAgICB2YXIgc3RhcnROYXZpZ2F0aW9uID0ga2V5ID09PSBjb25zdGFudHMuS0VZX0RPV04gfHwga2V5ID09PSBjb25zdGFudHMuS0VZX1VQXHJcbiAgICAgICAgICAgIHx8IGtleSA9PT0gY29uc3RhbnRzLktFWV9MRUZUIHx8IGtleSA9PT0gY29uc3RhbnRzLktFWV9SSUdIVDtcclxuICAgICAgICBpZiAoc3RhcnROYXZpZ2F0aW9uKSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHRoYXQubmF2aWdhdGVUb05leHRDZWxsKGtleSwgcm93SW5kZXgsIGNvbHVtbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgc3RhcnRFZGl0ID0ga2V5ID09PSBjb25zdGFudHMuS0VZX0VOVEVSO1xyXG4gICAgICAgIGlmIChzdGFydEVkaXQpIHtcclxuICAgICAgICAgICAgdmFyIHN0YXJ0RWRpdGluZ0Z1bmMgPSB0aGF0LnJlbmRlcmVkUm93U3RhcnRFZGl0aW5nTGlzdGVuZXJzW3Jvd0luZGV4XVtjb2x1bW4uY29sSWRdO1xyXG4gICAgICAgICAgICBpZiAoc3RhcnRFZGl0aW5nRnVuYykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGVkaXRpbmdTdGFydGVkID0gc3RhcnRFZGl0aW5nRnVuYygpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVkaXRpbmdTdGFydGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgd2UgZG9uJ3QgcHJldmVudCBkZWZhdWx0LCB0aGVuIHRoZSBlZGl0b3IgdGhhdCBnZXQgZGlzcGxheWVkIGFsc28gcGlja3MgdXAgdGhlICdlbnRlciBrZXknXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJlc3MsIGFuZCBzdG9wcyBlZGl0aW5nIGltbWVkaWF0ZWx5LCBoZW5jZSBnaXZpbmcgaGUgdXNlciBleHBlcmllbmNlIHRoYXQgbm90aGluZyBoYXBwZW5lZFxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBzZWxlY3RSb3cgPSBrZXkgPT09IGNvbnN0YW50cy5LRVlfU1BBQ0U7XHJcbiAgICAgICAgaWYgKHNlbGVjdFJvdyAmJiB0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5pc1Jvd1NlbGVjdGlvbigpKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5pc05vZGVTZWxlY3RlZChub2RlKTtcclxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuZGVzZWxlY3ROb2RlKG5vZGUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb25Db250cm9sbGVyLnNlbGVjdE5vZGUobm9kZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8vIHdlIHVzZSBpbmRleCBmb3Igcm93cywgYnV0IGNvbHVtbiBvYmplY3QgZm9yIGNvbHVtbnMsIGFzIHRoZSBuZXh0IGNvbHVtbiAoYnkgaW5kZXgpIG1pZ2h0IG5vdFxyXG4vLyBiZSB2aXNpYmxlIChoZWFkZXIgZ3JvdXBpbmcpIHNvIGl0J3Mgbm90IHJlbGlhYmxlLCBzbyB1c2luZyB0aGUgY29sdW1uIG9iamVjdCBpbnN0ZWFkLlxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUubmF2aWdhdGVUb05leHRDZWxsID0gZnVuY3Rpb24oa2V5LCByb3dJbmRleCwgY29sdW1uKSB7XHJcblxyXG4gICAgdmFyIGNlbGxUb0ZvY3VzID0ge3Jvd0luZGV4OiByb3dJbmRleCwgY29sdW1uOiBjb2x1bW59O1xyXG4gICAgdmFyIHJlbmRlcmVkUm93O1xyXG4gICAgdmFyIGVDZWxsO1xyXG5cclxuICAgIC8vIHdlIGtlZXAgc2VhcmNoaW5nIGZvciBhIG5leHQgY2VsbCB1bnRpbCB3ZSBmaW5kIG9uZS4gdGhpcyBpcyBob3cgdGhlIGdyb3VwIHJvd3MgZ2V0IHNraXBwZWRcclxuICAgIHdoaWxlICghZUNlbGwpIHtcclxuICAgICAgICBjZWxsVG9Gb2N1cyA9IHRoaXMuZ2V0TmV4dENlbGxUb0ZvY3VzKGtleSwgY2VsbFRvRm9jdXMpO1xyXG4gICAgICAgIC8vIG5vIG5leHQgY2VsbCBtZWFucyB3ZSBoYXZlIHJlYWNoZWQgYSBncmlkIGJvdW5kYXJ5LCBlZyBsZWZ0LCByaWdodCwgdG9wIG9yIGJvdHRvbSBvZiBncmlkXHJcbiAgICAgICAgaWYgKCFjZWxsVG9Gb2N1cykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHNlZSBpZiB0aGUgbmV4dCBjZWxsIGlzIHNlbGVjdGFibGUsIGlmIHllcywgdXNlIGl0LCBpZiBub3QsIHNraXAgaXRcclxuICAgICAgICByZW5kZXJlZFJvdyA9IHRoaXMucmVuZGVyZWRSb3dzW2NlbGxUb0ZvY3VzLnJvd0luZGV4XTtcclxuICAgICAgICBlQ2VsbCA9IHJlbmRlcmVkUm93LmVDZWxsc1tjZWxsVG9Gb2N1cy5jb2x1bW4uY29sSWRdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRoaXMgc2Nyb2xscyB0aGUgcm93IGludG8gdmlld1xyXG4gICAgdGhpcy5ncmlkUGFuZWwuZW5zdXJlSW5kZXhWaXNpYmxlKHJlbmRlcmVkUm93LnJvd0luZGV4KTtcclxuXHJcbiAgICAvLyB0aGlzIGNoYW5nZXMgdGhlIGNzcyBvbiB0aGUgY2VsbFxyXG4gICAgdGhpcy5mb2N1c0NlbGwoZUNlbGwsIGNlbGxUb0ZvY3VzLnJvd0luZGV4LCBjZWxsVG9Gb2N1cy5jb2x1bW4uaW5kZXgsIHRydWUpO1xyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLmdldE5leHRDZWxsVG9Gb2N1cyA9IGZ1bmN0aW9uKGtleSwgbGFzdENlbGxUb0ZvY3VzKSB7XHJcbiAgICB2YXIgbGFzdFJvd0luZGV4ID0gbGFzdENlbGxUb0ZvY3VzLnJvd0luZGV4O1xyXG4gICAgdmFyIGxhc3RDb2x1bW4gPSBsYXN0Q2VsbFRvRm9jdXMuY29sdW1uO1xyXG5cclxuICAgIHZhciBuZXh0Um93VG9Gb2N1cztcclxuICAgIHZhciBuZXh0Q29sdW1uVG9Gb2N1cztcclxuICAgIHN3aXRjaCAoa2V5KSB7XHJcbiAgICAgICAgY2FzZSBjb25zdGFudHMuS0VZX1VQIDpcclxuICAgICAgICAgICAgLy8gaWYgYWxyZWFkeSBvbiB0b3Agcm93LCBkbyBub3RoaW5nXHJcbiAgICAgICAgICAgIGlmIChsYXN0Um93SW5kZXggPT09IHRoaXMuZmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3cpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5leHRSb3dUb0ZvY3VzID0gbGFzdFJvd0luZGV4IC0gMTtcclxuICAgICAgICAgICAgbmV4dENvbHVtblRvRm9jdXMgPSBsYXN0Q29sdW1uO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGNvbnN0YW50cy5LRVlfRE9XTiA6XHJcbiAgICAgICAgICAgIC8vIGlmIGFscmVhZHkgb24gYm90dG9tLCBkbyBub3RoaW5nXHJcbiAgICAgICAgICAgIGlmIChsYXN0Um93SW5kZXggPT09IHRoaXMubGFzdFZpcnR1YWxSZW5kZXJlZFJvdykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbmV4dFJvd1RvRm9jdXMgPSBsYXN0Um93SW5kZXggKyAxO1xyXG4gICAgICAgICAgICBuZXh0Q29sdW1uVG9Gb2N1cyA9IGxhc3RDb2x1bW47XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgY29uc3RhbnRzLktFWV9SSUdIVCA6XHJcbiAgICAgICAgICAgIHZhciBjb2xUb1JpZ2h0ID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRWaXNpYmxlQ29sQWZ0ZXIobGFzdENvbHVtbik7XHJcbiAgICAgICAgICAgIC8vIGlmIGFscmVhZHkgb24gcmlnaHQsIGRvIG5vdGhpbmdcclxuICAgICAgICAgICAgaWYgKCFjb2xUb1JpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBuZXh0Um93VG9Gb2N1cyA9IGxhc3RSb3dJbmRleCA7XHJcbiAgICAgICAgICAgIG5leHRDb2x1bW5Ub0ZvY3VzID0gY29sVG9SaWdodDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBjb25zdGFudHMuS0VZX0xFRlQgOlxyXG4gICAgICAgICAgICB2YXIgY29sVG9MZWZ0ID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXRWaXNpYmxlQ29sQmVmb3JlKGxhc3RDb2x1bW4pO1xyXG4gICAgICAgICAgICAvLyBpZiBhbHJlYWR5IG9uIGxlZnQsIGRvIG5vdGhpbmdcclxuICAgICAgICAgICAgaWYgKCFjb2xUb0xlZnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5leHRSb3dUb0ZvY3VzID0gbGFzdFJvd0luZGV4IDtcclxuICAgICAgICAgICAgbmV4dENvbHVtblRvRm9jdXMgPSBjb2xUb0xlZnQ7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcm93SW5kZXg6IG5leHRSb3dUb0ZvY3VzLFxyXG4gICAgICAgIGNvbHVtbjogbmV4dENvbHVtblRvRm9jdXNcclxuICAgIH07XHJcbn07XHJcblxyXG4vLyBjYWxsZWQgaW50ZXJuYWxseVxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuZm9jdXNDZWxsID0gZnVuY3Rpb24oZUNlbGwsIHJvd0luZGV4LCBjb2xJbmRleCwgZm9yY2VCcm93c2VyRm9jdXMpIHtcclxuICAgIC8vIGRvIG5vdGhpbmcgaWYgY2VsbCBzZWxlY3Rpb24gaXMgb2ZmXHJcbiAgICBpZiAodGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNTdXBwcmVzc0NlbGxTZWxlY3Rpb24oKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZW1vdmUgYW55IHByZXZpb3VzIGZvY3VzXHJcbiAgICB1dGlscy5xdWVyeVNlbGVjdG9yQWxsX3JlcGxhY2VDc3NDbGFzcyh0aGlzLmVQYXJlbnRPZlJvd3MsICcuYWctY2VsbC1mb2N1cycsICdhZy1jZWxsLWZvY3VzJywgJ2FnLWNlbGwtbm8tZm9jdXMnKTtcclxuXHJcbiAgICB2YXIgc2VsZWN0b3JGb3JDZWxsID0gJ1tyb3c9XCInICsgcm93SW5kZXggKyAnXCJdIFtjb2w9XCInICsgY29sSW5kZXggKyAnXCJdJztcclxuICAgIHV0aWxzLnF1ZXJ5U2VsZWN0b3JBbGxfcmVwbGFjZUNzc0NsYXNzKHRoaXMuZVBhcmVudE9mUm93cywgc2VsZWN0b3JGb3JDZWxsLCAnYWctY2VsbC1uby1mb2N1cycsICdhZy1jZWxsLWZvY3VzJyk7XHJcblxyXG4gICAgdGhpcy5mb2N1c2VkQ2VsbCA9IHtyb3dJbmRleDogcm93SW5kZXgsIGNvbEluZGV4OiBjb2xJbmRleCwgbm9kZTogdGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93KHJvd0luZGV4KX07XHJcblxyXG4gICAgLy8gdGhpcyBwdXRzIHRoZSBicm93c2VyIGZvY3VzIG9uIHRoZSBjZWxsIChzbyBpdCBnZXRzIGtleSBwcmVzc2VzKVxyXG4gICAgaWYgKGZvcmNlQnJvd3NlckZvY3VzKSB7XHJcbiAgICAgICAgZUNlbGwuZm9jdXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxGb2N1c2VkKCkgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDZWxsRm9jdXNlZCgpKHRoaXMuZm9jdXNlZENlbGwpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gZm9yIEFQSVxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuZ2V0Rm9jdXNlZENlbGwgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmZvY3VzZWRDZWxsO1xyXG59O1xyXG5cclxuLy8gY2FsbGVkIHZpYSBBUElcclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnNldEZvY3VzZWRDZWxsID0gZnVuY3Rpb24ocm93SW5kZXgsIGNvbEluZGV4KSB7XHJcbiAgICB2YXIgcmVuZGVyZWRSb3cgPSB0aGlzLnJlbmRlcmVkUm93c1tyb3dJbmRleF07XHJcbiAgICB2YXIgY29sdW1uID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXREaXNwbGF5ZWRDb2x1bW5zKClbY29sSW5kZXhdO1xyXG4gICAgaWYgKHJlbmRlcmVkUm93ICYmIGNvbHVtbikge1xyXG4gICAgICAgIHZhciBlQ2VsbCA9IHJlbmRlcmVkUm93LmVDZWxsc1tjb2x1bW4uY29sSWRdO1xyXG4gICAgICAgIHRoaXMuZm9jdXNDZWxsKGVDZWxsLCByb3dJbmRleCwgY29sSW5kZXgsIHRydWUpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUm93UmVuZGVyZXIucHJvdG90eXBlLnBvcHVsYXRlQW5kU3R5bGVHcmlkQ2VsbCA9IGZ1bmN0aW9uKHZhbHVlR2V0dGVyLCB2YWx1ZSwgZUdyaWRDZWxsLCBpc0ZpcnN0Q29sdW1uLCBub2RlLCBjb2x1bW4sIHJvd0luZGV4LCAkY2hpbGRTY29wZSkge1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcblxyXG4gICAgLy8gcG9wdWxhdGVcclxuICAgIHRoaXMucG9wdWxhdGVHcmlkQ2VsbChlR3JpZENlbGwsIGlzRmlyc3RDb2x1bW4sIG5vZGUsIGNvbHVtbiwgcm93SW5kZXgsIHZhbHVlLCB2YWx1ZUdldHRlciwgJGNoaWxkU2NvcGUpO1xyXG4gICAgLy8gc3R5bGVcclxuICAgIHRoaXMuYWRkU3R5bGVzRnJvbUNvbGxEZWYoY29sdW1uLCB2YWx1ZSwgbm9kZSwgJGNoaWxkU2NvcGUsIGVHcmlkQ2VsbCk7XHJcbiAgICB0aGlzLmFkZENsYXNzZXNGcm9tQ29sbERlZihjb2xEZWYsIHZhbHVlLCBub2RlLCAkY2hpbGRTY29wZSwgZUdyaWRDZWxsKTtcclxuICAgIHRoaXMuYWRkQ2xhc3Nlc0Zyb21SdWxlcyhjb2xEZWYsIGVHcmlkQ2VsbCwgdmFsdWUsIG5vZGUsIHJvd0luZGV4KTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5wb3B1bGF0ZUdyaWRDZWxsID0gZnVuY3Rpb24oZUdyaWRDZWxsLCBpc0ZpcnN0Q29sdW1uLCBub2RlLCBjb2x1bW4sIHJvd0luZGV4LCB2YWx1ZSwgdmFsdWVHZXR0ZXIsICRjaGlsZFNjb3BlKSB7XHJcbiAgICB2YXIgZUNlbGxXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgdXRpbHMuYWRkQ3NzQ2xhc3MoZUNlbGxXcmFwcGVyLCBcImFnLWNlbGwtd3JhcHBlclwiKTtcclxuICAgIGVHcmlkQ2VsbC5hcHBlbmRDaGlsZChlQ2VsbFdyYXBwZXIpO1xyXG5cclxuICAgIHZhciBjb2xEZWYgPSBjb2x1bW4uY29sRGVmO1xyXG4gICAgaWYgKGNvbERlZi5jaGVja2JveFNlbGVjdGlvbikge1xyXG4gICAgICAgIHZhciBlQ2hlY2tib3ggPSB0aGlzLnNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeS5jcmVhdGVTZWxlY3Rpb25DaGVja2JveChub2RlLCByb3dJbmRleCk7XHJcbiAgICAgICAgZUNlbGxXcmFwcGVyLmFwcGVuZENoaWxkKGVDaGVja2JveCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZXZlbnR1YWxseSB3ZSBjYWxsIGVTcGFuV2l0aFZhbHVlLmlubmVySFRNTCA9IHh4eCwgc28gY2Fubm90IGluY2x1ZGUgdGhlIGNoZWNrYm94IChhYm92ZSkgaW4gdGhpcyBzcGFuXHJcbiAgICB2YXIgZVNwYW5XaXRoVmFsdWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgIHV0aWxzLmFkZENzc0NsYXNzKGVTcGFuV2l0aFZhbHVlLCBcImFnLWNlbGwtdmFsdWVcIik7XHJcblxyXG4gICAgZUNlbGxXcmFwcGVyLmFwcGVuZENoaWxkKGVTcGFuV2l0aFZhbHVlKTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB2YXIgcmVmcmVzaENlbGxGdW5jdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQuc29mdFJlZnJlc2hDZWxsKGVHcmlkQ2VsbCwgaXNGaXJzdENvbHVtbiwgbm9kZSwgY29sdW1uLCAkY2hpbGRTY29wZSwgcm93SW5kZXgpO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnB1dERhdGFJbnRvQ2VsbChjb2x1bW4sIHZhbHVlLCB2YWx1ZUdldHRlciwgbm9kZSwgJGNoaWxkU2NvcGUsIGVTcGFuV2l0aFZhbHVlLCBlR3JpZENlbGwsIHJvd0luZGV4LCByZWZyZXNoQ2VsbEZ1bmN0aW9uKTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5hZGRDZWxsRG91YmxlQ2xpY2tlZEhhbmRsZXIgPSBmdW5jdGlvbihlR3JpZENlbGwsIG5vZGUsIGNvbHVtbiwgdmFsdWUsIHJvd0luZGV4LCAkY2hpbGRTY29wZSwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHZhciBjb2xEZWYgPSBjb2x1bW4uY29sRGVmO1xyXG4gICAgZUdyaWRDZWxsLmFkZEV2ZW50TGlzdGVuZXIoXCJkYmxjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIGlmICh0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRDZWxsRG91YmxlQ2xpY2tlZCgpKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXJhbXNGb3JHcmlkID0ge1xyXG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgICAgICAgICAgZXZlbnRTb3VyY2U6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBhcGk6IHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxEb3VibGVDbGlja2VkKCkocGFyYW1zRm9yR3JpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb2xEZWYuY2VsbERvdWJsZUNsaWNrZWQpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmFtc0ZvckNvbERlZiA9IHtcclxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudCxcclxuICAgICAgICAgICAgICAgIGV2ZW50U291cmNlOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYXBpOiB0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb2xEZWYuY2VsbERvdWJsZUNsaWNrZWQocGFyYW1zRm9yQ29sRGVmKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoYXQuaXNDZWxsRWRpdGFibGUoY29sRGVmLCBub2RlKSkge1xyXG4gICAgICAgICAgICB0aGF0LnN0YXJ0RWRpdGluZyhlR3JpZENlbGwsIGNvbHVtbiwgbm9kZSwgJGNoaWxkU2NvcGUsIHJvd0luZGV4LCBpc0ZpcnN0Q29sdW1uLCB2YWx1ZUdldHRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuYWRkQ2VsbENsaWNrZWRIYW5kbGVyID0gZnVuY3Rpb24oZUdyaWRDZWxsLCBub2RlLCBjb2x1bW4sIHZhbHVlLCByb3dJbmRleCkge1xyXG4gICAgdmFyIGNvbERlZiA9IGNvbHVtbi5jb2xEZWY7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBlR3JpZENlbGwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgLy8gd2UgcGFzcyBmYWxzZSB0byBmb2N1c0NlbGwsIGFzIHdlIGRvbid0IHdhbnQgdGhlIGNlbGwgdG8gZm9jdXNcclxuICAgICAgICAvLyBhbHNvIGdldCB0aGUgYnJvd3NlciBmb2N1cy4gaWYgd2UgZGlkLCB0aGVuIHRoZSBjZWxsUmVuZGVyZXIgY291bGRcclxuICAgICAgICAvLyBoYXZlIGEgdGV4dCBmaWVsZCBpbiBpdCwgZm9yIGV4YW1wbGUsIGFuZCBhcyB0aGUgdXNlciBjbGlja3Mgb24gdGhlXHJcbiAgICAgICAgLy8gdGV4dCBmaWVsZCwgdGhlIHRleHQgZmllbGQsIHRoZSBmb2N1cyBkb2Vzbid0IGdldCB0byB0aGUgdGV4dFxyXG4gICAgICAgIC8vIGZpZWxkLCBpbnN0ZWFkIHRvIGdvZXMgdG8gdGhlIGRpdiBiZWhpbmQsIG1ha2luZyBpdCBpbXBvc3NpYmxlIHRvXHJcbiAgICAgICAgLy8gc2VsZWN0IHRoZSB0ZXh0IGZpZWxkLlxyXG4gICAgICAgIHRoYXQuZm9jdXNDZWxsKGVHcmlkQ2VsbCwgcm93SW5kZXgsIGNvbHVtbi5pbmRleCwgZmFsc2UpO1xyXG4gICAgICAgIGlmICh0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRDZWxsQ2xpY2tlZCgpKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXJhbXNGb3JHcmlkID0ge1xyXG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IG5vZGUuZGF0YSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgICAgIHJvd0luZGV4OiByb3dJbmRleCxcclxuICAgICAgICAgICAgICAgIGNvbERlZjogY29sRGVmLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgICAgICAgICAgZXZlbnRTb3VyY2U6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBhcGk6IHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldEFwaSgpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoYXQuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxDbGlja2VkKCkocGFyYW1zRm9yR3JpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb2xEZWYuY2VsbENsaWNrZWQpIHtcclxuICAgICAgICAgICAgdmFyIHBhcmFtc0ZvckNvbERlZiA9IHtcclxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudCxcclxuICAgICAgICAgICAgICAgIGV2ZW50U291cmNlOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYXBpOiB0aGF0LmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb2xEZWYuY2VsbENsaWNrZWQocGFyYW1zRm9yQ29sRGVmKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5pc0NlbGxFZGl0YWJsZSA9IGZ1bmN0aW9uKGNvbERlZiwgbm9kZSkge1xyXG4gICAgaWYgKHRoaXMuZWRpdGluZ0NlbGwpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbmV2ZXIgYWxsb3cgZWRpdGluZyBvZiBncm91cHNcclxuICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIGJvb2xlYW4gc2V0LCB0aGVuIGp1c3QgdXNlIGl0XHJcbiAgICBpZiAodHlwZW9mIGNvbERlZi5lZGl0YWJsZSA9PT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgcmV0dXJuIGNvbERlZi5lZGl0YWJsZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBmdW5jdGlvbiwgdGhlbiBjYWxsIHRoZSBmdW5jdGlvbiB0byBmaW5kIG91dFxyXG4gICAgaWYgKHR5cGVvZiBjb2xEZWYuZWRpdGFibGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAvLyBzaG91bGQgY2hhbmdlIHRoaXMsIHNvIGl0IGdldHMgcGFzc2VkIHBhcmFtcyB3aXRoIG5pY2UgdXNlZnVsIHZhbHVlc1xyXG4gICAgICAgIHJldHVybiBjb2xEZWYuZWRpdGFibGUobm9kZS5kYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuc3RvcEVkaXRpbmcgPSBmdW5jdGlvbihlR3JpZENlbGwsIGNvbHVtbiwgbm9kZSwgJGNoaWxkU2NvcGUsIGVJbnB1dCwgYmx1ckxpc3RlbmVyLCByb3dJbmRleCwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpIHtcclxuICAgIHRoaXMuZWRpdGluZ0NlbGwgPSBmYWxzZTtcclxuICAgIHZhciBuZXdWYWx1ZSA9IGVJbnB1dC52YWx1ZTtcclxuICAgIHZhciBjb2xEZWYgPSBjb2x1bW4uY29sRGVmO1xyXG5cclxuICAgIC8vSWYgd2UgZG9uJ3QgcmVtb3ZlIHRoZSBibHVyIGxpc3RlbmVyIGZpcnN0LCB3ZSBnZXQ6XHJcbiAgICAvL1VuY2F1Z2h0IE5vdEZvdW5kRXJyb3I6IEZhaWxlZCB0byBleGVjdXRlICdyZW1vdmVDaGlsZCcgb24gJ05vZGUnOiBUaGUgbm9kZSB0byBiZSByZW1vdmVkIGlzIG5vIGxvbmdlciBhIGNoaWxkIG9mIHRoaXMgbm9kZS4gUGVyaGFwcyBpdCB3YXMgbW92ZWQgaW4gYSAnYmx1cicgZXZlbnQgaGFuZGxlcj9cclxuICAgIGVJbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgYmx1ckxpc3RlbmVyKTtcclxuXHJcbiAgICB1dGlscy5yZW1vdmVBbGxDaGlsZHJlbihlR3JpZENlbGwpO1xyXG5cclxuICAgIHZhciBwYXJhbXNGb3JDYWxsYmFja3MgPSB7XHJcbiAgICAgICAgbm9kZTogbm9kZSxcclxuICAgICAgICBkYXRhOiBub2RlLmRhdGEsXHJcbiAgICAgICAgb2xkVmFsdWU6IG5vZGUuZGF0YVtjb2xEZWYuZmllbGRdLFxyXG4gICAgICAgIG5ld1ZhbHVlOiBuZXdWYWx1ZSxcclxuICAgICAgICByb3dJbmRleDogcm93SW5kZXgsXHJcbiAgICAgICAgY29sRGVmOiBjb2xEZWYsXHJcbiAgICAgICAgYXBpOiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRBcGkoKSxcclxuICAgICAgICBjb250ZXh0OiB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRDb250ZXh0KClcclxuICAgIH07XHJcblxyXG4gICAgaWYgKGNvbERlZi5uZXdWYWx1ZUhhbmRsZXIpIHtcclxuICAgICAgICBjb2xEZWYubmV3VmFsdWVIYW5kbGVyKHBhcmFtc0ZvckNhbGxiYWNrcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5vZGUuZGF0YVtjb2xEZWYuZmllbGRdID0gbmV3VmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYXQgdGhpcyBwb2ludCwgdGhlIHZhbHVlIGhhcyBiZWVuIHVwZGF0ZWRcclxuICAgIHZhciBuZXdWYWx1ZTtcclxuICAgIGlmICh2YWx1ZUdldHRlcikge1xyXG4gICAgICAgIG5ld1ZhbHVlID0gdmFsdWVHZXR0ZXIoKTtcclxuICAgIH1cclxuICAgIHBhcmFtc0ZvckNhbGxiYWNrcy5uZXdWYWx1ZSA9IG5ld1ZhbHVlO1xyXG4gICAgaWYgKHR5cGVvZiBjb2xEZWYuY2VsbFZhbHVlQ2hhbmdlZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIGNvbERlZi5jZWxsVmFsdWVDaGFuZ2VkKHBhcmFtc0ZvckNhbGxiYWNrcyk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxWYWx1ZUNoYW5nZWQoKSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldENlbGxWYWx1ZUNoYW5nZWQoKShwYXJhbXNGb3JDYWxsYmFja3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucG9wdWxhdGVBbmRTdHlsZUdyaWRDZWxsKHZhbHVlR2V0dGVyLCBuZXdWYWx1ZSwgZUdyaWRDZWxsLCBpc0ZpcnN0Q29sdW1uLCBub2RlLCBjb2x1bW4sIHJvd0luZGV4LCAkY2hpbGRTY29wZSk7XHJcbn07XHJcblxyXG5Sb3dSZW5kZXJlci5wcm90b3R5cGUuc3RhcnRFZGl0aW5nID0gZnVuY3Rpb24oZUdyaWRDZWxsLCBjb2x1bW4sIG5vZGUsICRjaGlsZFNjb3BlLCByb3dJbmRleCwgaXNGaXJzdENvbHVtbiwgdmFsdWVHZXR0ZXIpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHRoaXMuZWRpdGluZ0NlbGwgPSB0cnVlO1xyXG4gICAgdXRpbHMucmVtb3ZlQWxsQ2hpbGRyZW4oZUdyaWRDZWxsKTtcclxuICAgIHZhciBlSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgZUlucHV0LnR5cGUgPSAndGV4dCc7XHJcbiAgICB1dGlscy5hZGRDc3NDbGFzcyhlSW5wdXQsICdhZy1jZWxsLWVkaXQtaW5wdXQnKTtcclxuXHJcbiAgICBpZiAodmFsdWVHZXR0ZXIpIHtcclxuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUdldHRlcigpO1xyXG4gICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGVJbnB1dC52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBlSW5wdXQuc3R5bGUud2lkdGggPSAoY29sdW1uLmFjdHVhbFdpZHRoIC0gMTQpICsgJ3B4JztcclxuICAgIGVHcmlkQ2VsbC5hcHBlbmRDaGlsZChlSW5wdXQpO1xyXG4gICAgZUlucHV0LmZvY3VzKCk7XHJcbiAgICBlSW5wdXQuc2VsZWN0KCk7XHJcblxyXG4gICAgdmFyIGJsdXJMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQuc3RvcEVkaXRpbmcoZUdyaWRDZWxsLCBjb2x1bW4sIG5vZGUsICRjaGlsZFNjb3BlLCBlSW5wdXQsIGJsdXJMaXN0ZW5lciwgcm93SW5kZXgsIGlzRmlyc3RDb2x1bW4sIHZhbHVlR2V0dGVyKTtcclxuICAgIH07XHJcblxyXG4gICAgLy9zdG9wIGVudGVyaW5nIGlmIHdlIGxvb3NlIGZvY3VzXHJcbiAgICBlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgYmx1ckxpc3RlbmVyKTtcclxuXHJcbiAgICAvL3N0b3AgZWRpdGluZyBpZiBlbnRlciBwcmVzc2VkXHJcbiAgICBlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIHZhciBrZXkgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlO1xyXG4gICAgICAgIC8vIDEzIGlzIGVudGVyXHJcbiAgICAgICAgaWYgKGtleSA9PSBjb25zdGFudHMuS0VZX0VOVEVSKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc3RvcEVkaXRpbmcoZUdyaWRDZWxsLCBjb2x1bW4sIG5vZGUsICRjaGlsZFNjb3BlLCBlSW5wdXQsIGJsdXJMaXN0ZW5lciwgcm93SW5kZXgsIGlzRmlyc3RDb2x1bW4sIHZhbHVlR2V0dGVyKTtcclxuICAgICAgICAgICAgdGhhdC5mb2N1c0NlbGwoZUdyaWRDZWxsLCByb3dJbmRleCwgY29sdW1uLmluZGV4LCB0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyB0YWIga2V5IGRvZXNuJ3QgZ2VuZXJhdGUga2V5cHJlc3MsIHNvIG5lZWQga2V5ZG93biB0byBsaXN0ZW4gZm9yIHRoYXRcclxuICAgIGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICB2YXIga2V5ID0gZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZTtcclxuICAgICAgICBpZiAoa2V5ID09IGNvbnN0YW50cy5LRVlfVEFCKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc3RvcEVkaXRpbmcoZUdyaWRDZWxsLCBjb2x1bW4sIG5vZGUsICRjaGlsZFNjb3BlLCBlSW5wdXQsIGJsdXJMaXN0ZW5lciwgcm93SW5kZXgsIGlzRmlyc3RDb2x1bW4sIHZhbHVlR2V0dGVyKTtcclxuICAgICAgICAgICAgdGhhdC5zdGFydEVkaXRpbmdOZXh0Q2VsbChyb3dJbmRleCwgY29sdW1uLCBldmVudC5zaGlmdEtleSk7XHJcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IHdhbnQgdGhlIGRlZmF1bHQgdGFiIGFjdGlvbiwgc28gcmV0dXJuIGZhbHNlLCB0aGlzIHN0b3BzIHRoZSBldmVudCBmcm9tIGJ1YmJsaW5nXHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcblJvd1JlbmRlcmVyLnByb3RvdHlwZS5zdGFydEVkaXRpbmdOZXh0Q2VsbCA9IGZ1bmN0aW9uKHJvd0luZGV4LCBjb2x1bW4sIHNoaWZ0S2V5KSB7XHJcblxyXG4gICAgdmFyIGZpcnN0Um93VG9DaGVjayA9IHRoaXMuZmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3c7XHJcbiAgICB2YXIgbGFzdFJvd1RvQ2hlY2sgPSB0aGlzLmxhc3RWaXJ0dWFsUmVuZGVyZWRSb3c7XHJcbiAgICB2YXIgY3VycmVudFJvd0luZGV4ID0gcm93SW5kZXg7XHJcblxyXG4gICAgdmFyIHZpc2libGVDb2x1bW5zID0gdGhpcy5jb2x1bW5Nb2RlbC5nZXREaXNwbGF5ZWRDb2x1bW5zKCk7XHJcbiAgICB2YXIgY3VycmVudENvbCA9IGNvbHVtbjtcclxuXHJcbiAgICB3aGlsZSAodHJ1ZSkge1xyXG5cclxuICAgICAgICB2YXIgaW5kZXhPZkN1cnJlbnRDb2wgPSB2aXNpYmxlQ29sdW1ucy5pbmRleE9mKGN1cnJlbnRDb2wpO1xyXG5cclxuICAgICAgICAvLyBtb3ZlIGJhY2t3YXJkXHJcbiAgICAgICAgaWYgKHNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICAgIC8vIG1vdmUgYWxvbmcgdG8gdGhlIHByZXZpb3VzIGNlbGxcclxuICAgICAgICAgICAgY3VycmVudENvbCA9IHZpc2libGVDb2x1bW5zW2luZGV4T2ZDdXJyZW50Q29sIC0gMV07XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIGVuZCBvZiB0aGUgcm93LCBhbmQgaWYgc28sIGdvIGJhY2sgYSByb3dcclxuICAgICAgICAgICAgaWYgKCFjdXJyZW50Q29sKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50Q29sID0gdmlzaWJsZUNvbHVtbnNbdmlzaWJsZUNvbHVtbnMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50Um93SW5kZXgtLTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgZ290IHRvIGVuZCBvZiByZW5kZXJlZCByb3dzLCB0aGVuIHF1aXQgbG9va2luZ1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudFJvd0luZGV4IDwgZmlyc3RSb3dUb0NoZWNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gbW92ZSBmb3J3YXJkXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gbW92ZSBhbG9uZyB0byB0aGUgbmV4dCBjZWxsXHJcbiAgICAgICAgICAgIGN1cnJlbnRDb2wgPSB2aXNpYmxlQ29sdW1uc1tpbmRleE9mQ3VycmVudENvbCArIDFdO1xyXG4gICAgICAgICAgICAvLyBjaGVjayBpZiBlbmQgb2YgdGhlIHJvdywgYW5kIGlmIHNvLCBnbyBmb3J3YXJkIGEgcm93XHJcbiAgICAgICAgICAgIGlmICghY3VycmVudENvbCkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudENvbCA9IHZpc2libGVDb2x1bW5zWzBdO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFJvd0luZGV4Kys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGlmIGdvdCB0byBlbmQgb2YgcmVuZGVyZWQgcm93cywgdGhlbiBxdWl0IGxvb2tpbmdcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRSb3dJbmRleCA+IGxhc3RSb3dUb0NoZWNrKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBuZXh0RnVuYyA9IHRoaXMucmVuZGVyZWRSb3dTdGFydEVkaXRpbmdMaXN0ZW5lcnNbY3VycmVudFJvd0luZGV4XVtjdXJyZW50Q29sLmNvbElkXTtcclxuICAgICAgICBpZiAobmV4dEZ1bmMpIHtcclxuICAgICAgICAgICAgLy8gc2VlIGlmIHRoZSBuZXh0IGNlbGwgaXMgZWRpdGFibGUsIGFuZCBpZiBzbywgd2UgaGF2ZSBjb21lIHRvXHJcbiAgICAgICAgICAgIC8vIHRoZSBlbmQgb2Ygb3VyIHNlYXJjaCwgc28gc3RvcCBsb29raW5nIGZvciB0aGUgbmV4dCBjZWxsXHJcbiAgICAgICAgICAgIHZhciBuZXh0Q2VsbEFjY2VwdGVkRWRpdCA9IG5leHRGdW5jKCk7XHJcbiAgICAgICAgICAgIGlmIChuZXh0Q2VsbEFjY2VwdGVkRWRpdCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUm93UmVuZGVyZXI7XHJcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcclxuXHJcbi8vIHRoZXNlIGNvbnN0YW50cyBhcmUgdXNlZCBmb3IgZGV0ZXJtaW5pbmcgaWYgZ3JvdXBzIHNob3VsZFxyXG4vLyBiZSBzZWxlY3RlZCBvciBkZXNlbGVjdGVkIHdoZW4gc2VsZWN0aW5nIGdyb3VwcywgYW5kIHRoZSBncm91cFxyXG4vLyB0aGVuIHNlbGVjdHMgdGhlIGNoaWxkcmVuLlxyXG52YXIgU0VMRUNURUQgPSAwO1xyXG52YXIgVU5TRUxFQ1RFRCA9IDE7XHJcbnZhciBNSVhFRCA9IDI7XHJcbnZhciBET19OT1RfQ0FSRSA9IDM7XHJcblxyXG5mdW5jdGlvbiBTZWxlY3Rpb25Db250cm9sbGVyKCkge31cclxuXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihhbmd1bGFyR3JpZCwgZ3JpZFBhbmVsLCBncmlkT3B0aW9uc1dyYXBwZXIsICRzY29wZSwgcm93UmVuZGVyZXIpIHtcclxuICAgIHRoaXMuZVJvd3NQYXJlbnQgPSBncmlkUGFuZWwuZ2V0Um93c1BhcmVudCgpO1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkO1xyXG4gICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIgPSBncmlkT3B0aW9uc1dyYXBwZXI7XHJcbiAgICB0aGlzLiRzY29wZSA9ICRzY29wZTtcclxuICAgIHRoaXMucm93UmVuZGVyZXIgPSByb3dSZW5kZXJlcjtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyID0gZ3JpZE9wdGlvbnNXcmFwcGVyO1xyXG5cclxuICAgIHRoaXMuaW5pdFNlbGVjdGVkTm9kZXNCeUlkKCk7XHJcblxyXG4gICAgdGhpcy5zZWxlY3RlZFJvd3MgPSBbXTtcclxuICAgIGdyaWRPcHRpb25zV3JhcHBlci5zZXRTZWxlY3RlZFJvd3ModGhpcy5zZWxlY3RlZFJvd3MpO1xyXG59O1xyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuaW5pdFNlbGVjdGVkTm9kZXNCeUlkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNlbGVjdGVkTm9kZXNCeUlkID0ge307XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5zZXRTZWxlY3RlZE5vZGVzQnlJZCh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkKTtcclxufTtcclxuXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmdldFNlbGVjdGVkTm9kZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzZWxlY3RlZE5vZGVzID0gW107XHJcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWQpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGlkID0ga2V5c1tpXTtcclxuICAgICAgICB2YXIgc2VsZWN0ZWROb2RlID0gdGhpcy5zZWxlY3RlZE5vZGVzQnlJZFtpZF07XHJcbiAgICAgICAgc2VsZWN0ZWROb2Rlcy5wdXNoKHNlbGVjdGVkTm9kZSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc2VsZWN0ZWROb2RlcztcclxufTtcclxuXHJcbi8vIHJldHVybnMgYSBsaXN0IG9mIGFsbCBub2RlcyBhdCAnYmVzdCBjb3N0JyAtIGEgZmVhdHVyZSB0byBiZSB1c2VkXHJcbi8vIHdpdGggZ3JvdXBzIC8gdHJlZXMuIGlmIGEgZ3JvdXAgaGFzIGFsbCBpdCdzIGNoaWxkcmVuIHNlbGVjdGVkLFxyXG4vLyB0aGVuIHRoZSBncm91cCBhcHBlYXJzIGluIHRoZSByZXN1bHQsIGJ1dCBub3QgdGhlIGNoaWxkcmVuLlxyXG4vLyBEZXNpZ25lZCBmb3IgdXNlIHdpdGggJ2NoaWxkcmVuJyBhcyB0aGUgZ3JvdXAgc2VsZWN0aW9uIHR5cGUsXHJcbi8vIHdoZXJlIGdyb3VwcyBkb24ndCBhY3R1YWxseSBhcHBlYXIgaW4gdGhlIHNlbGVjdGlvbiBub3JtYWxseS5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0QmVzdENvc3ROb2RlU2VsZWN0aW9uID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLnJvd01vZGVsLmdldFRvcExldmVsTm9kZXMgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICB0aHJvdyAnc2VsZWN0QWxsIG5vdCBhdmFpbGFibGUgd2hlbiByb3dzIGFyZSBvbiB0aGUgc2VydmVyJztcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdG9wTGV2ZWxOb2RlcyA9IHRoaXMucm93TW9kZWwuZ2V0VG9wTGV2ZWxOb2RlcygpO1xyXG5cclxuICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAvLyByZWN1cnNpdmUgZnVuY3Rpb24sIHRvIGZpbmQgdGhlIHNlbGVjdGVkIG5vZGVzXHJcbiAgICBmdW5jdGlvbiB0cmF2ZXJzZShub2Rlcykge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbm9kZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgICAgICAgIGlmICh0aGF0LmlzTm9kZVNlbGVjdGVkKG5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChub2RlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIGlmIG5vdCBzZWxlY3RlZCwgdGhlbiBpZiBpdCdzIGEgZ3JvdXAsIGFuZCB0aGUgZ3JvdXBcclxuICAgICAgICAgICAgICAgIC8vIGhhcyBjaGlsZHJlbiwgY29udGludWUgdG8gc2VhcmNoIGZvciBzZWxlY3Rpb25zXHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhdmVyc2Uobm9kZS5jaGlsZHJlbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdHJhdmVyc2UodG9wTGV2ZWxOb2Rlcyk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnNldFJvd01vZGVsID0gZnVuY3Rpb24ocm93TW9kZWwpIHtcclxuICAgIHRoaXMucm93TW9kZWwgPSByb3dNb2RlbDtcclxufTtcclxuXHJcbi8vIHB1YmxpYyAtIHRoaXMgY2xlYXJzIHRoZSBzZWxlY3Rpb24sIGJ1dCBkb2Vzbid0IGNsZWFyIGRvd24gdGhlIGNzcyAtIHdoZW4gaXQgaXMgY2FsbGVkLCB0aGVcclxuLy8gY2FsbGVyIHRoZW4gZ2V0cyB0aGUgZ3JpZCB0byByZWZyZXNoLlxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5kZXNlbGVjdEFsbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5pbml0U2VsZWN0ZWROb2Rlc0J5SWQoKTtcclxuICAgIC8vdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkKTtcclxuICAgIC8vZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAvLyAgICBkZWxldGUgdGhpcy5zZWxlY3RlZE5vZGVzQnlJZFtrZXlzW2ldXTtcclxuICAgIC8vfVxyXG4gICAgdGhpcy5zeW5jU2VsZWN0ZWRSb3dzQW5kQ2FsbExpc3RlbmVyKCk7XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgLSB0aGlzIHNlbGVjdHMgZXZlcnl0aGluZywgYnV0IGRvZXNuJ3QgY2xlYXIgZG93biB0aGUgY3NzIC0gd2hlbiBpdCBpcyBjYWxsZWQsIHRoZVxyXG4vLyBjYWxsZXIgdGhlbiBnZXRzIHRoZSBncmlkIHRvIHJlZnJlc2guXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnNlbGVjdEFsbCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmICh0eXBlb2YgdGhpcy5yb3dNb2RlbC5nZXRUb3BMZXZlbE5vZGVzICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhyb3cgJ3NlbGVjdEFsbCBub3QgYXZhaWxhYmxlIHdoZW4gcm93cyBhcmUgb24gdGhlIHNlcnZlcic7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNlbGVjdGVkTm9kZXNCeUlkID0gdGhpcy5zZWxlY3RlZE5vZGVzQnlJZDtcclxuICAgIC8vIGlmIHRoZSBzZWxlY3Rpb24gaXMgXCJkb24ndCBpbmNsdWRlIGdyb3Vwc1wiLCB0aGVuIHdlIGRvbid0IGluY2x1ZGUgdGhlbSFcclxuICAgIHZhciBpbmNsdWRlR3JvdXBzID0gIXRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBTZWxlY3RzQ2hpbGRyZW4oKTtcclxuXHJcbiAgICBmdW5jdGlvbiByZWN1cnNpdmVseVNlbGVjdChub2Rlcykge1xyXG4gICAgICAgIGlmIChub2Rlcykge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaTxub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVjdXJzaXZlbHlTZWxlY3Qobm9kZS5jaGlsZHJlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVHcm91cHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWROb2Rlc0J5SWRbbm9kZS5pZF0gPSBub2RlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWROb2Rlc0J5SWRbbm9kZS5pZF0gPSBub2RlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciB0b3BMZXZlbE5vZGVzID0gdGhpcy5yb3dNb2RlbC5nZXRUb3BMZXZlbE5vZGVzKCk7XHJcbiAgICByZWN1cnNpdmVseVNlbGVjdCh0b3BMZXZlbE5vZGVzKTtcclxuXHJcbiAgICB0aGlzLnN5bmNTZWxlY3RlZFJvd3NBbmRDYWxsTGlzdGVuZXIoKTtcclxufTtcclxuXHJcbi8vIHB1YmxpY1xyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5zZWxlY3ROb2RlID0gZnVuY3Rpb24obm9kZSwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICB2YXIgbXVsdGlTZWxlY3QgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc1Jvd1NlbGVjdGlvbk11bHRpKCkgJiYgdHJ5TXVsdGk7XHJcblxyXG4gICAgLy8gaWYgdGhlIG5vZGUgaXMgYSBncm91cCwgdGhlbiBzZWxlY3RpbmcgdGhpcyBpcyB0aGUgc2FtZSBhcyBzZWxlY3RpbmcgdGhlIHBhcmVudCxcclxuICAgIC8vIHNvIHRvIGhhdmUgb25seSBvbmUgZmxvdyB0aHJvdWdoIHRoZSBiZWxvdywgd2UgYWx3YXlzIHNlbGVjdCB0aGUgaGVhZGVyIHBhcmVudFxyXG4gICAgLy8gKHdoaWNoIHRoZW4gaGFzIHRoZSBzaWRlIGVmZmVjdCBvZiBzZWxlY3RpbmcgdGhlIGNoaWxkKS5cclxuICAgIHZhciBub2RlVG9TZWxlY3Q7XHJcbiAgICBpZiAobm9kZS5mb290ZXIpIHtcclxuICAgICAgICBub2RlVG9TZWxlY3QgPSBub2RlLnNpYmxpbmc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5vZGVUb1NlbGVjdCA9IG5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYXQgdGhlIGVuZCwgaWYgdGhpcyBpcyB0cnVlLCB3ZSBpbmZvcm0gdGhlIGNhbGxiYWNrXHJcbiAgICB2YXIgYXRMZWFzdE9uZUl0ZW1VbnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICB2YXIgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIHNlZSBpZiByb3dzIHRvIGJlIGRlc2VsZWN0ZWRcclxuICAgIGlmICghbXVsdGlTZWxlY3QpIHtcclxuICAgICAgICBhdExlYXN0T25lSXRlbVVuc2VsZWN0ZWQgPSB0aGlzLmRvV29ya09mRGVzZWxlY3RBbGxOb2RlcygpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwU2VsZWN0c0NoaWxkcmVuKCkgJiYgbm9kZVRvU2VsZWN0Lmdyb3VwKSB7XHJcbiAgICAgICAgLy8gZG9uJ3Qgc2VsZWN0IHRoZSBncm91cCwgc2VsZWN0IHRoZSBjaGlsZHJlbiBpbnN0ZWFkXHJcbiAgICAgICAgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCA9IHRoaXMucmVjdXJzaXZlbHlTZWxlY3RBbGxDaGlsZHJlbihub2RlVG9TZWxlY3QpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBzZWUgaWYgcm93IG5lZWRzIHRvIGJlIHNlbGVjdGVkXHJcbiAgICAgICAgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCA9IHRoaXMuZG9Xb3JrT2ZTZWxlY3ROb2RlKG5vZGVUb1NlbGVjdCwgc3VwcHJlc3NFdmVudHMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhdExlYXN0T25lSXRlbVVuc2VsZWN0ZWQgfHwgYXRMZWFzdE9uZUl0ZW1TZWxlY3RlZCkge1xyXG4gICAgICAgIHRoaXMuc3luY1NlbGVjdGVkUm93c0FuZENhbGxMaXN0ZW5lcihzdXBwcmVzc0V2ZW50cyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51cGRhdGVHcm91cFBhcmVudHNJZk5lZWRlZCgpO1xyXG59O1xyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlTZWxlY3RBbGxDaGlsZHJlbiA9IGZ1bmN0aW9uKG5vZGUsIHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICB2YXIgYXRMZWFzdE9uZSA9IGZhbHNlO1xyXG4gICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZWN1cnNpdmVseVNlbGVjdEFsbENoaWxkcmVuKGNoaWxkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0TGVhc3RPbmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZG9Xb3JrT2ZTZWxlY3ROb2RlKGNoaWxkLCBzdXBwcmVzc0V2ZW50cykpIHtcclxuICAgICAgICAgICAgICAgICAgICBhdExlYXN0T25lID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhdExlYXN0T25lO1xyXG59O1xyXG5cclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucmVjdXJzaXZlbHlEZXNlbGVjdEFsbENoaWxkcmVuID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5RGVzZWxlY3RBbGxDaGlsZHJlbihjaGlsZCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0UmVhbE5vZGUoY2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyAxIC0gc2VsZWN0cyBhIG5vZGVcclxuLy8gMiAtIHVwZGF0ZXMgdGhlIFVJXHJcbi8vIDMgLSBjYWxscyBjYWxsYmFja3NcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZG9Xb3JrT2ZTZWxlY3ROb2RlID0gZnVuY3Rpb24obm9kZSwgc3VwcHJlc3NFdmVudHMpIHtcclxuICAgIGlmICh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW25vZGUuaWRdKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRbbm9kZS5pZF0gPSBub2RlO1xyXG5cclxuICAgIHRoaXMuYWRkQ3NzQ2xhc3NGb3JOb2RlX2FuZEluZm9ybVZpcnR1YWxSb3dMaXN0ZW5lcihub2RlKTtcclxuXHJcbiAgICAvLyBhbHNvIGNvbG9yIGluIHRoZSBmb290ZXIgaWYgdGhlcmUgaXMgb25lXHJcbiAgICBpZiAobm9kZS5ncm91cCAmJiBub2RlLmV4cGFuZGVkICYmIG5vZGUuc2libGluZykge1xyXG4gICAgICAgIHRoaXMuYWRkQ3NzQ2xhc3NGb3JOb2RlX2FuZEluZm9ybVZpcnR1YWxSb3dMaXN0ZW5lcihub2RlLnNpYmxpbmcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGluZm9ybSB0aGUgcm93U2VsZWN0ZWQgbGlzdGVuZXIsIGlmIGFueVxyXG4gICAgaWYgKCFzdXBwcmVzc0V2ZW50cyAmJiB0eXBlb2YgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93U2VsZWN0ZWQoKSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0Um93U2VsZWN0ZWQoKShub2RlLmRhdGEsIG5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG4vLyAxIC0gc2VsZWN0cyBhIG5vZGVcclxuLy8gMiAtIHVwZGF0ZXMgdGhlIFVJXHJcbi8vIDMgLSBjYWxscyBjYWxsYmFja3NcclxuLy8gd293IC0gd2hhdCBhIGJpZyBuYW1lIGZvciBhIG1ldGhvZCwgZXhjZXB0aW9uIGNhc2UsIGl0J3Mgc2F5aW5nIHdoYXQgdGhlIG1ldGhvZCBkb2VzXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmFkZENzc0NsYXNzRm9yTm9kZV9hbmRJbmZvcm1WaXJ0dWFsUm93TGlzdGVuZXIgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICB2YXIgdmlydHVhbFJlbmRlcmVkUm93SW5kZXggPSB0aGlzLnJvd1JlbmRlcmVyLmdldEluZGV4T2ZSZW5kZXJlZE5vZGUobm9kZSk7XHJcbiAgICBpZiAodmlydHVhbFJlbmRlcmVkUm93SW5kZXggPj0gMCkge1xyXG4gICAgICAgIHV0aWxzLnF1ZXJ5U2VsZWN0b3JBbGxfYWRkQ3NzQ2xhc3ModGhpcy5lUm93c1BhcmVudCwgJ1tyb3c9XCInICsgdmlydHVhbFJlbmRlcmVkUm93SW5kZXggKyAnXCJdJywgJ2FnLXJvdy1zZWxlY3RlZCcpO1xyXG5cclxuICAgICAgICAvLyBpbmZvcm0gdmlydHVhbCByb3cgbGlzdGVuZXJcclxuICAgICAgICB0aGlzLmFuZ3VsYXJHcmlkLm9uVmlydHVhbFJvd1NlbGVjdGVkKHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4LCB0cnVlKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuLy8gMSAtIHVuLXNlbGVjdHMgYSBub2RlXHJcbi8vIDIgLSB1cGRhdGVzIHRoZSBVSVxyXG4vLyAzIC0gY2FsbHMgY2FsbGJhY2tzXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmRvV29ya09mRGVzZWxlY3RBbGxOb2RlcyA9IGZ1bmN0aW9uKG5vZGVUb0tlZXBTZWxlY3RlZCkge1xyXG4gICAgLy8gbm90IGRvaW5nIG11bHRpLXNlbGVjdCwgc28gZGVzZWxlY3QgZXZlcnl0aGluZyBvdGhlciB0aGFuIHRoZSAnanVzdCBzZWxlY3RlZCcgcm93XHJcbiAgICB2YXIgYXRMZWFzdE9uZVNlbGVjdGlvbkNoYW5nZTtcclxuICAgIHZhciBzZWxlY3RlZE5vZGVLZXlzID0gT2JqZWN0LmtleXModGhpcy5zZWxlY3RlZE5vZGVzQnlJZCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGVkTm9kZUtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAvLyBza2lwIHRoZSAnanVzdCBzZWxlY3RlZCcgcm93XHJcbiAgICAgICAgdmFyIGtleSA9IHNlbGVjdGVkTm9kZUtleXNbaV07XHJcbiAgICAgICAgdmFyIG5vZGVUb0Rlc2VsZWN0ID0gdGhpcy5zZWxlY3RlZE5vZGVzQnlJZFtrZXldO1xyXG4gICAgICAgIGlmIChub2RlVG9EZXNlbGVjdCA9PT0gbm9kZVRvS2VlcFNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RSZWFsTm9kZShub2RlVG9EZXNlbGVjdCk7XHJcbiAgICAgICAgICAgIGF0TGVhc3RPbmVTZWxlY3Rpb25DaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhdExlYXN0T25lU2VsZWN0aW9uQ2hhbmdlO1xyXG59O1xyXG5cclxuLy8gcHJpdmF0ZVxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5kZXNlbGVjdFJlYWxOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgLy8gZGVzZWxlY3QgdGhlIGNzc1xyXG4gICAgdGhpcy5yZW1vdmVDc3NDbGFzc0Zvck5vZGUobm9kZSk7XHJcblxyXG4gICAgLy8gaWYgbm9kZSBpcyBhIGhlYWRlciwgYW5kIGlmIGl0IGhhcyBhIHNpYmxpbmcgZm9vdGVyLCBkZXNlbGVjdCB0aGUgZm9vdGVyIGFsc29cclxuICAgIGlmIChub2RlLmdyb3VwICYmIG5vZGUuZXhwYW5kZWQgJiYgbm9kZS5zaWJsaW5nKSB7IC8vIGFsc28gY2hlY2sgdGhhdCBpdCdzIGV4cGFuZGVkLCBhcyBzaWJsaW5nIGNvdWxkIGJlIGEgZ2hvc3RcclxuICAgICAgICB0aGlzLnJlbW92ZUNzc0NsYXNzRm9yTm9kZShub2RlLnNpYmxpbmcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlbW92ZSB0aGUgcm93XHJcbiAgICBkZWxldGUgdGhpcy5zZWxlY3RlZE5vZGVzQnlJZFtub2RlLmlkXTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUucmVtb3ZlQ3NzQ2xhc3NGb3JOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ID0gdGhpcy5yb3dSZW5kZXJlci5nZXRJbmRleE9mUmVuZGVyZWROb2RlKG5vZGUpO1xyXG4gICAgaWYgKHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ID49IDApIHtcclxuICAgICAgICB1dGlscy5xdWVyeVNlbGVjdG9yQWxsX3JlbW92ZUNzc0NsYXNzKHRoaXMuZVJvd3NQYXJlbnQsICdbcm93PVwiJyArIHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4ICsgJ1wiXScsICdhZy1yb3ctc2VsZWN0ZWQnKTtcclxuICAgICAgICAvLyBpbmZvcm0gdmlydHVhbCByb3cgbGlzdGVuZXJcclxuICAgICAgICB0aGlzLmFuZ3VsYXJHcmlkLm9uVmlydHVhbFJvd1NlbGVjdGVkKHZpcnR1YWxSZW5kZXJlZFJvd0luZGV4LCBmYWxzZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgKHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSlcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZGVzZWxlY3RJbmRleCA9IGZ1bmN0aW9uKHJvd0luZGV4KSB7XHJcbiAgICB2YXIgbm9kZSA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvdyhyb3dJbmRleCk7XHJcbiAgICB0aGlzLmRlc2VsZWN0Tm9kZShub2RlKTtcclxufTtcclxuXHJcbi8vIHB1YmxpYyAoYXBpKVxyXG5TZWxlY3Rpb25Db250cm9sbGVyLnByb3RvdHlwZS5kZXNlbGVjdE5vZGUgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgICBpZiAobm9kZSkge1xyXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5pc0dyb3VwU2VsZWN0c0NoaWxkcmVuKCkgJiYgbm9kZS5ncm91cCkge1xyXG4gICAgICAgICAgICAvLyB3YW50IHRvIGRlc2VsZWN0IGNoaWxkcmVuLCBub3QgdGhpcyBub2RlLCBzbyByZWN1cnNpdmVseSBkZXNlbGVjdFxyXG4gICAgICAgICAgICB0aGlzLnJlY3Vyc2l2ZWx5RGVzZWxlY3RBbGxDaGlsZHJlbihub2RlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRlc2VsZWN0UmVhbE5vZGUobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5zeW5jU2VsZWN0ZWRSb3dzQW5kQ2FsbExpc3RlbmVyKCk7XHJcbiAgICB0aGlzLnVwZGF0ZUdyb3VwUGFyZW50c0lmTmVlZGVkKCk7XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgKHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSAmIGFwaSlcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuc2VsZWN0SW5kZXggPSBmdW5jdGlvbihpbmRleCwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICB2YXIgbm9kZSA9IHRoaXMucm93TW9kZWwuZ2V0VmlydHVhbFJvdyhpbmRleCk7XHJcbiAgICB0aGlzLnNlbGVjdE5vZGUobm9kZSwgdHJ5TXVsdGksIHN1cHByZXNzRXZlbnRzKTtcclxufTtcclxuXHJcbi8vIHByaXZhdGVcclxuLy8gdXBkYXRlcyB0aGUgc2VsZWN0ZWRSb3dzIHdpdGggdGhlIHNlbGVjdGVkTm9kZXMgYW5kIGNhbGxzIHNlbGVjdGlvbkNoYW5nZWQgbGlzdGVuZXJcclxuU2VsZWN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuc3luY1NlbGVjdGVkUm93c0FuZENhbGxMaXN0ZW5lciA9IGZ1bmN0aW9uKHN1cHByZXNzRXZlbnRzKSB7XHJcbiAgICAvLyB1cGRhdGUgc2VsZWN0ZWQgcm93c1xyXG4gICAgdmFyIHNlbGVjdGVkUm93cyA9IHRoaXMuc2VsZWN0ZWRSb3dzO1xyXG4gICAgdmFyIG9sZENvdW50ID0gc2VsZWN0ZWRSb3dzLmxlbmd0aDtcclxuICAgIC8vIGNsZWFyIHNlbGVjdGVkIHJvd3NcclxuICAgIHNlbGVjdGVkUm93cy5sZW5ndGggPSAwO1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkTm9kZXNCeUlkW2tleXNbaV1dICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkTm9kZSA9IHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRba2V5c1tpXV07XHJcbiAgICAgICAgICAgIHNlbGVjdGVkUm93cy5wdXNoKHNlbGVjdGVkTm9kZS5kYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGhpcyBzdG9wZSB0aGUgZXZlbnQgZmlyaW5nIHRoZSB2ZXJ5IGZpcnN0IHRoZSB0aW1lIGdyaWQgaXMgaW5pdGlhbGlzZWQuIHdpdGhvdXQgdGhpcywgdGhlIGRvY3VtZW50YXRpb25cclxuICAgIC8vIHBhZ2UgaGFkIGEgcG9wdXAgaW4gdGhlICdzZWxlY3Rpb24nIHBhZ2UgYXMgc29vbiBhcyB0aGUgcGFnZSB3YXMgbG9hZGVkISFcclxuICAgIHZhciBub3RoaW5nQ2hhbmdlZE11c3RCZUluaXRpYWxpc2luZyA9IG9sZENvdW50ID09PSAwICYmIHNlbGVjdGVkUm93cy5sZW5ndGggPT09IDA7XHJcblxyXG4gICAgaWYgKCFub3RoaW5nQ2hhbmdlZE11c3RCZUluaXRpYWxpc2luZyAmJiAhc3VwcHJlc3NFdmVudHMgJiYgdHlwZW9mIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmdldFNlbGVjdGlvbkNoYW5nZWQoKSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0U2VsZWN0aW9uQ2hhbmdlZCgpKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgaWYgKHRoaXMuJHNjb3BlKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwcml2YXRlXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnJlY3Vyc2l2ZWx5Q2hlY2tJZlNlbGVjdGVkID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgdmFyIGZvdW5kU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgIHZhciBmb3VuZFVuc2VsZWN0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAobm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQuZ3JvdXApIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMucmVjdXJzaXZlbHlDaGVja0lmU2VsZWN0ZWQoY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFNFTEVDVEVEOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZFNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBVTlNFTEVDVEVEOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZFVuc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIE1JWEVEOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZFNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRVbnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIGNhbiBpZ25vcmUgdGhlIERPX05PVF9DQVJFLCBhcyBpdCBkb2Vzbid0IGltcGFjdCwgbWVhbnMgdGhlIGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGhhcyBubyBjaGlsZHJlbiBhbmQgc2hvdWxkbid0IGJlIGNvbnNpZGVyZWQgd2hlbiBkZWNpZGluZ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNOb2RlU2VsZWN0ZWQoY2hpbGQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmRTZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kVW5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChmb3VuZFNlbGVjdGVkICYmIGZvdW5kVW5zZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgbWl4ZWQsIHRoZW4gbm8gbmVlZCB0byBnbyBmdXJ0aGVyLCBqdXN0IHJldHVybiB1cCB0aGUgY2hhaW5cclxuICAgICAgICAgICAgICAgIHJldHVybiBNSVhFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBnb3QgdGhpcyBmYXIsIHNvIG5vIGNvbmZsaWN0cywgZWl0aGVyIGFsbCBjaGlsZHJlbiBzZWxlY3RlZCwgdW5zZWxlY3RlZCwgb3IgbmVpdGhlclxyXG4gICAgaWYgKGZvdW5kU2VsZWN0ZWQpIHtcclxuICAgICAgICByZXR1cm4gU0VMRUNURUQ7XHJcbiAgICB9IGVsc2UgaWYgKGZvdW5kVW5zZWxlY3RlZCkge1xyXG4gICAgICAgIHJldHVybiBVTlNFTEVDVEVEO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gRE9fTk9UX0NBUkU7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBwdWJsaWMgKHNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSlcclxuLy8gcmV0dXJuczpcclxuLy8gdHJ1ZTogaWYgc2VsZWN0ZWRcclxuLy8gZmFsc2U6IGlmIHVuc2VsZWN0ZWRcclxuLy8gdW5kZWZpbmVkOiBpZiBpdCdzIGEgZ3JvdXAgYW5kICdjaGlsZHJlbiBzZWxlY3Rpb24nIGlzIHVzZWQgYW5kICdjaGlsZHJlbicgYXJlIGEgbWl4IG9mIHNlbGVjdGVkIGFuZCB1bnNlbGVjdGVkXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmlzTm9kZVNlbGVjdGVkID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLmlzR3JvdXBTZWxlY3RzQ2hpbGRyZW4oKSAmJiBub2RlLmdyb3VwKSB7XHJcbiAgICAgICAgLy8gZG9pbmcgY2hpbGQgc2VsZWN0aW9uLCB3ZSBuZWVkIHRvIHRyYXZlcnNlIHRoZSBjaGlsZHJlblxyXG4gICAgICAgIHZhciByZXN1bHRPZkNoaWxkcmVuID0gdGhpcy5yZWN1cnNpdmVseUNoZWNrSWZTZWxlY3RlZChub2RlKTtcclxuICAgICAgICBzd2l0Y2ggKHJlc3VsdE9mQ2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgY2FzZSBTRUxFQ1RFRDpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICBjYXNlIFVOU0VMRUNURUQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWROb2Rlc0J5SWRbbm9kZS5pZF0gIT09IHVuZGVmaW5lZDtcclxuICAgIH1cclxufTtcclxuXHJcblNlbGVjdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZUdyb3VwUGFyZW50c0lmTmVlZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyB3ZSBvbmx5IGRvIHRoaXMgaWYgcGFyZW50IG5vZGVzIGFyZSByZXNwb25zaWJsZVxyXG4gICAgLy8gZm9yIHNlbGVjdGluZyB0aGVpciBjaGlsZHJlbi5cclxuICAgIGlmICghdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuaXNHcm91cFNlbGVjdHNDaGlsZHJlbigpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBmaXJzdFJvdyA9IHRoaXMucm93UmVuZGVyZXIuZ2V0Rmlyc3RWaXJ0dWFsUmVuZGVyZWRSb3coKTtcclxuICAgIHZhciBsYXN0Um93ID0gdGhpcy5yb3dSZW5kZXJlci5nZXRMYXN0VmlydHVhbFJlbmRlcmVkUm93KCk7XHJcbiAgICBmb3IgKHZhciByb3dJbmRleCA9IGZpcnN0Um93OyByb3dJbmRleCA8PSBsYXN0Um93OyByb3dJbmRleCsrKSB7XHJcbiAgICAgICAgLy8gc2VlIGlmIG5vZGUgaXMgYSBncm91cFxyXG4gICAgICAgIHZhciBub2RlID0gdGhpcy5yb3dNb2RlbC5nZXRWaXJ0dWFsUm93KHJvd0luZGV4KTtcclxuICAgICAgICBpZiAobm9kZS5ncm91cCkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSB0aGlzLmlzTm9kZVNlbGVjdGVkKG5vZGUpO1xyXG4gICAgICAgICAgICB0aGlzLmFuZ3VsYXJHcmlkLm9uVmlydHVhbFJvd1NlbGVjdGVkKHJvd0luZGV4LCBzZWxlY3RlZCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHV0aWxzLnF1ZXJ5U2VsZWN0b3JBbGxfYWRkQ3NzQ2xhc3ModGhpcy5lUm93c1BhcmVudCwgJ1tyb3c9XCInICsgcm93SW5kZXggKyAnXCJdJywgJ2FnLXJvdy1zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdXRpbHMucXVlcnlTZWxlY3RvckFsbF9yZW1vdmVDc3NDbGFzcyh0aGlzLmVSb3dzUGFyZW50LCAnW3Jvdz1cIicgKyByb3dJbmRleCArICdcIl0nLCAnYWctcm93LXNlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdGlvbkNvbnRyb2xsZXI7XHJcbiIsImZ1bmN0aW9uIFNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeSgpIHt9XHJcblxyXG5TZWxlY3Rpb25SZW5kZXJlckZhY3RvcnkucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihhbmd1bGFyR3JpZCwgc2VsZWN0aW9uQ29udHJvbGxlcikge1xyXG4gICAgdGhpcy5hbmd1bGFyR3JpZCA9IGFuZ3VsYXJHcmlkO1xyXG4gICAgdGhpcy5zZWxlY3Rpb25Db250cm9sbGVyID0gc2VsZWN0aW9uQ29udHJvbGxlcjtcclxufTtcclxuXHJcblNlbGVjdGlvblJlbmRlcmVyRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlQ2hlY2tib3hDb2xEZWYgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgd2lkdGg6IDMwLFxyXG4gICAgICAgIHN1cHByZXNzTWVudTogdHJ1ZSxcclxuICAgICAgICBzdXBwcmVzc1NvcnRpbmc6IHRydWUsXHJcbiAgICAgICAgaGVhZGVyQ2VsbFJlbmRlcmVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGVDaGVja2JveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgIGVDaGVja2JveC50eXBlID0gJ2NoZWNrYm94JztcclxuICAgICAgICAgICAgZUNoZWNrYm94Lm5hbWUgPSAnbmFtZSc7XHJcbiAgICAgICAgICAgIHJldHVybiBlQ2hlY2tib3g7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjZWxsUmVuZGVyZXI6IHRoaXMuY3JlYXRlQ2hlY2tib3hSZW5kZXJlcigpXHJcbiAgICB9O1xyXG59O1xyXG5cclxuU2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LnByb3RvdHlwZS5jcmVhdGVDaGVja2JveFJlbmRlcmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoYXQuY3JlYXRlU2VsZWN0aW9uQ2hlY2tib3gocGFyYW1zLm5vZGUsIHBhcmFtcy5yb3dJbmRleCk7XHJcbiAgICB9O1xyXG59O1xyXG5cclxuU2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5LnByb3RvdHlwZS5jcmVhdGVTZWxlY3Rpb25DaGVja2JveCA9IGZ1bmN0aW9uKG5vZGUsIHJvd0luZGV4KSB7XHJcblxyXG4gICAgdmFyIGVDaGVja2JveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICBlQ2hlY2tib3gudHlwZSA9IFwiY2hlY2tib3hcIjtcclxuICAgIGVDaGVja2JveC5uYW1lID0gXCJuYW1lXCI7XHJcbiAgICBlQ2hlY2tib3guY2xhc3NOYW1lID0gJ2FnLXNlbGVjdGlvbi1jaGVja2JveCc7XHJcbiAgICBzZXRDaGVja2JveFN0YXRlKGVDaGVja2JveCwgdGhpcy5zZWxlY3Rpb25Db250cm9sbGVyLmlzTm9kZVNlbGVjdGVkKG5vZGUpKTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBlQ2hlY2tib3gub25jbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGVDaGVja2JveC5vbmNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IGVDaGVja2JveC5jaGVja2VkO1xyXG4gICAgICAgIGlmIChuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbkNvbnRyb2xsZXIuc2VsZWN0SW5kZXgocm93SW5kZXgsIHRydWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uQ29udHJvbGxlci5kZXNlbGVjdEluZGV4KHJvd0luZGV4KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuYW5ndWxhckdyaWQuYWRkVmlydHVhbFJvd0xpc3RlbmVyKHJvd0luZGV4LCB7XHJcbiAgICAgICAgcm93U2VsZWN0ZWQ6IGZ1bmN0aW9uKHNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgIHNldENoZWNrYm94U3RhdGUoZUNoZWNrYm94LCBzZWxlY3RlZCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByb3dSZW1vdmVkOiBmdW5jdGlvbigpIHt9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gZUNoZWNrYm94O1xyXG59O1xyXG5cclxuZnVuY3Rpb24gc2V0Q2hlY2tib3hTdGF0ZShlQ2hlY2tib3gsIHN0YXRlKSB7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSAnYm9vbGVhbicpIHtcclxuICAgICAgICBlQ2hlY2tib3guY2hlY2tlZCA9IHN0YXRlO1xyXG4gICAgICAgIGVDaGVja2JveC5pbmRldGVybWluYXRlID0gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGlzTm9kZVNlbGVjdGVkIHJldHVybnMgYmFjayB1bmRlZmluZWQgaWYgaXQncyBhIGdyb3VwIGFuZCB0aGUgY2hpbGRyZW5cclxuICAgICAgICAvLyBhcmUgYSBtaXggb2Ygc2VsZWN0ZWQgYW5kIHVuc2VsZWN0ZWRcclxuICAgICAgICBlQ2hlY2tib3guaW5kZXRlcm1pbmF0ZSA9IHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0aW9uUmVuZGVyZXJGYWN0b3J5O1xyXG4iLCJ2YXIgU1ZHX05TID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO1xyXG5cclxuZnVuY3Rpb24gU3ZnRmFjdG9yeSgpIHt9XHJcblxyXG5TdmdGYWN0b3J5LnByb3RvdHlwZS5jcmVhdGVGaWx0ZXJTdmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBlU3ZnID0gY3JlYXRlSWNvblN2ZygpO1xyXG5cclxuICAgIHZhciBlRnVubmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgXCJwb2x5Z29uXCIpO1xyXG4gICAgZUZ1bm5lbC5zZXRBdHRyaWJ1dGUoXCJwb2ludHNcIiwgXCIwLDAgNCw0IDQsMTAgNiwxMCA2LDQgMTAsMFwiKTtcclxuICAgIGVGdW5uZWwuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJhZy1oZWFkZXItaWNvblwiKTtcclxuICAgIGVTdmcuYXBwZW5kQ2hpbGQoZUZ1bm5lbCk7XHJcblxyXG4gICAgcmV0dXJuIGVTdmc7XHJcbn07XHJcblxyXG5TdmdGYWN0b3J5LnByb3RvdHlwZS5jcmVhdGVDb2x1bW5TaG93aW5nU3ZnID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gY3JlYXRlQ2lyY2xlKHRydWUpO1xyXG59O1xyXG5cclxuU3ZnRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlQ29sdW1uSGlkZGVuU3ZnID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gY3JlYXRlQ2lyY2xlKGZhbHNlKTtcclxufTtcclxuXHJcblN2Z0ZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZU1lbnVTdmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBlU3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgXCJzdmdcIik7XHJcbiAgICB2YXIgc2l6ZSA9IFwiMTJcIjtcclxuICAgIGVTdmcuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgc2l6ZSk7XHJcbiAgICBlU3ZnLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBzaXplKTtcclxuXHJcbiAgICBbXCIwXCIsIFwiNVwiLCBcIjEwXCJdLmZvckVhY2goZnVuY3Rpb24oeSkge1xyXG4gICAgICAgIHZhciBlTGluZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsIFwicmVjdFwiKTtcclxuICAgICAgICBlTGluZS5zZXRBdHRyaWJ1dGUoXCJ5XCIsIHkpO1xyXG4gICAgICAgIGVMaW5lLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIHNpemUpO1xyXG4gICAgICAgIGVMaW5lLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBcIjJcIik7XHJcbiAgICAgICAgZUxpbmUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJhZy1oZWFkZXItaWNvblwiKTtcclxuICAgICAgICBlU3ZnLmFwcGVuZENoaWxkKGVMaW5lKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBlU3ZnO1xyXG59O1xyXG5cclxuU3ZnRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlQXJyb3dVcFN2ZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGNyZWF0ZVBvbHlnb25TdmcoXCIwLDEwIDUsMCAxMCwxMFwiKTtcclxufTtcclxuXHJcblN2Z0ZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZUFycm93TGVmdFN2ZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGNyZWF0ZVBvbHlnb25TdmcoXCIxMCwwIDAsNSAxMCwxMFwiKTtcclxufTtcclxuXHJcblN2Z0ZhY3RvcnkucHJvdG90eXBlLmNyZWF0ZUFycm93RG93blN2ZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGNyZWF0ZVBvbHlnb25TdmcoXCIwLDAgNSwxMCAxMCwwXCIpO1xyXG59O1xyXG5cclxuU3ZnRmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlQXJyb3dSaWdodFN2ZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGNyZWF0ZVBvbHlnb25TdmcoXCIwLDAgMTAsNSAwLDEwXCIpO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlUG9seWdvblN2Zyhwb2ludHMpIHtcclxuICAgIHZhciBlU3ZnID0gY3JlYXRlSWNvblN2ZygpO1xyXG5cclxuICAgIHZhciBlRGVzY0ljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCBcInBvbHlnb25cIik7XHJcbiAgICBlRGVzY0ljb24uc2V0QXR0cmlidXRlKFwicG9pbnRzXCIsIHBvaW50cyk7XHJcbiAgICBlU3ZnLmFwcGVuZENoaWxkKGVEZXNjSWNvbik7XHJcblxyXG4gICAgcmV0dXJuIGVTdmc7XHJcbn1cclxuXHJcbi8vIHV0aWwgZnVuY3Rpb24gZm9yIHRoZSBhYm92ZVxyXG5mdW5jdGlvbiBjcmVhdGVJY29uU3ZnKCkge1xyXG4gICAgdmFyIGVTdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCBcInN2Z1wiKTtcclxuICAgIGVTdmcuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgXCIxMFwiKTtcclxuICAgIGVTdmcuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIFwiMTBcIik7XHJcbiAgICByZXR1cm4gZVN2ZztcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlQ2lyY2xlKGZpbGwpIHtcclxuICAgIHZhciBlU3ZnID0gY3JlYXRlSWNvblN2ZygpO1xyXG5cclxuICAgIHZhciBlQ2lyY2xlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgXCJjaXJjbGVcIik7XHJcbiAgICBlQ2lyY2xlLnNldEF0dHJpYnV0ZShcImN4XCIsIFwiNVwiKTtcclxuICAgIGVDaXJjbGUuc2V0QXR0cmlidXRlKFwiY3lcIiwgXCI1XCIpO1xyXG4gICAgZUNpcmNsZS5zZXRBdHRyaWJ1dGUoXCJyXCIsIFwiNVwiKTtcclxuICAgIGVDaXJjbGUuc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsIFwiYmxhY2tcIik7XHJcbiAgICBlQ2lyY2xlLnNldEF0dHJpYnV0ZShcInN0cm9rZS13aWR0aFwiLCBcIjJcIik7XHJcbiAgICBpZiAoZmlsbCkge1xyXG4gICAgICAgIGVDaXJjbGUuc2V0QXR0cmlidXRlKFwiZmlsbFwiLCBcImJsYWNrXCIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBlQ2lyY2xlLnNldEF0dHJpYnV0ZShcImZpbGxcIiwgXCJub25lXCIpO1xyXG4gICAgfVxyXG4gICAgZVN2Zy5hcHBlbmRDaGlsZChlQ2lyY2xlKTtcclxuXHJcbiAgICByZXR1cm4gZVN2ZztcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3ZnRmFjdG9yeTtcclxuIiwiXHJcbmZ1bmN0aW9uIFRlbXBsYXRlU2VydmljZSgpIHtcclxuICAgIHRoaXMudGVtcGxhdGVDYWNoZSA9IHt9O1xyXG4gICAgdGhpcy53YWl0aW5nQ2FsbGJhY2tzID0ge307XHJcbn1cclxuXHJcblRlbXBsYXRlU2VydmljZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgkc2NvcGUpIHtcclxuICAgIHRoaXMuJHNjb3BlID0gJHNjb3BlO1xyXG59O1xyXG5cclxuLy8gcmV0dXJucyB0aGUgdGVtcGxhdGUgaWYgaXQgaXMgbG9hZGVkLCBvciBudWxsIGlmIGl0IGlzIG5vdCBsb2FkZWRcclxuLy8gYnV0IHdpbGwgY2FsbCB0aGUgY2FsbGJhY2sgd2hlbiBpdCBpcyBsb2FkZWRcclxuVGVtcGxhdGVTZXJ2aWNlLnByb3RvdHlwZS5nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKSB7XHJcblxyXG4gICAgdmFyIHRlbXBsYXRlRnJvbUNhY2hlID0gdGhpcy50ZW1wbGF0ZUNhY2hlW3VybF07XHJcbiAgICBpZiAodGVtcGxhdGVGcm9tQ2FjaGUpIHtcclxuICAgICAgICByZXR1cm4gdGVtcGxhdGVGcm9tQ2FjaGU7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNhbGxiYWNrTGlzdCA9IHRoaXMud2FpdGluZ0NhbGxiYWNrc1t1cmxdO1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgaWYgKCFjYWxsYmFja0xpc3QpIHtcclxuICAgICAgICAvLyBmaXJzdCB0aW1lIHRoaXMgd2FzIGNhbGxlZCwgc28gbmVlZCBhIG5ldyBsaXN0IGZvciBjYWxsYmFja3NcclxuICAgICAgICBjYWxsYmFja0xpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLndhaXRpbmdDYWxsYmFja3NbdXJsXSA9IGNhbGxiYWNrTGlzdDtcclxuICAgICAgICAvLyBhbmQgYWxzbyBuZWVkIHRvIGRvIHRoZSBodHRwIHJlcXVlc3RcclxuICAgICAgICB2YXIgY2xpZW50ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgY2xpZW50Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHsgdGhhdC5oYW5kbGVIdHRwUmVzdWx0KHRoaXMsIHVybCk7IH07XHJcbiAgICAgICAgY2xpZW50Lm9wZW4oXCJHRVRcIiwgdXJsKTtcclxuICAgICAgICBjbGllbnQuc2VuZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFkZCB0aGlzIGNhbGxiYWNrXHJcbiAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICBjYWxsYmFja0xpc3QucHVzaChjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2FsbGVyIG5lZWRzIHRvIHdhaXQgZm9yIHRlbXBsYXRlIHRvIGxvYWQsIHNvIHJldHVybiBudWxsXHJcbiAgICByZXR1cm4gbnVsbDtcclxufTtcclxuXHJcblRlbXBsYXRlU2VydmljZS5wcm90b3R5cGUuaGFuZGxlSHR0cFJlc3VsdCA9IGZ1bmN0aW9uIChodHRwUmVzdWx0LCB1cmwpIHtcclxuXHJcbiAgICBpZiAoaHR0cFJlc3VsdC5zdGF0dXMgIT09IDIwMCB8fCBodHRwUmVzdWx0LnJlc3BvbnNlID09PSBudWxsKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdVbmFibGUgdG8gZ2V0IHRlbXBsYXRlIGVycm9yICcgKyBodHRwUmVzdWx0LnN0YXR1cyArICcgLSAnICsgdXJsKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVzcG9uc2Ugc3VjY2Vzcywgc28gcHJvY2VzcyBpdFxyXG4gICAgdGhpcy50ZW1wbGF0ZUNhY2hlW3VybF0gPSBodHRwUmVzdWx0LnJlc3BvbnNlO1xyXG5cclxuICAgIC8vIGluZm9ybSBhbGwgbGlzdGVuZXJzIHRoYXQgdGhpcyBpcyBub3cgaW4gdGhlIGNhY2hlXHJcbiAgICB2YXIgY2FsbGJhY2tzID0gdGhpcy53YWl0aW5nQ2FsbGJhY2tzW3VybF07XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBjYWxsYmFjayA9IGNhbGxiYWNrc1tpXTtcclxuICAgICAgICAvLyB3ZSBjb3VsZCBwYXNzIHRoZSBjYWxsYmFjayB0aGUgcmVzcG9uc2UsIGhvd2V2ZXIgd2Uga25vdyB0aGUgY2xpZW50IG9mIHRoaXMgY29kZVxyXG4gICAgICAgIC8vIGlzIHRoZSBjZWxsIHJlbmRlcmVyLCBhbmQgaXQgcGFzc2VzIHRoZSAnY2VsbFJlZnJlc2gnIG1ldGhvZCBpbiBhcyB0aGUgY2FsbGJhY2tcclxuICAgICAgICAvLyB3aGljaCBkb2Vzbid0IHRha2UgYW55IHBhcmFtZXRlcnMuXHJcbiAgICAgICAgY2FsbGJhY2soKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy4kc2NvcGUpIHtcclxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhhdC4kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRlbXBsYXRlU2VydmljZTtcclxuIiwidmFyIENoZWNrYm94U2VsZWN0aW9uID0gcmVxdWlyZShcIi4uL3dpZGdldHMvY2hlY2tib3hTZWxlY3Rpb25cIik7XHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcclxudmFyIEJvcmRlckxheW91dCA9IHJlcXVpcmUoJy4uL2xheW91dC9Cb3JkZXJMYXlvdXQnKTtcclxudmFyIFN2Z0ZhY3RvcnkgPSByZXF1aXJlKCcuLi9zdmdGYWN0b3J5Jyk7XHJcblxyXG52YXIgc3ZnRmFjdG9yeSA9IG5ldyBTdmdGYWN0b3J5KCk7XHJcblxyXG5mdW5jdGlvbiBDb2x1bW5TZWxlY3Rpb25QYW5lbChjb2x1bW5Db250cm9sbGVyLCBncmlkT3B0aW9uc1dyYXBwZXIpIHtcclxuICAgIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyID0gZ3JpZE9wdGlvbnNXcmFwcGVyO1xyXG4gICAgdGhpcy5zZXR1cENvbXBvbmVudHMoKTtcclxuICAgIHRoaXMuY29sdW1uQ29udHJvbGxlciA9IGNvbHVtbkNvbnRyb2xsZXI7XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5jb2x1bW5Db250cm9sbGVyLmFkZExpc3RlbmVyKHtcclxuICAgICAgICBjb2x1bW5zQ2hhbmdlZDogdGhhdC5jb2x1bW5zQ2hhbmdlZC5iaW5kKHRoYXQpXHJcbiAgICB9KTtcclxufVxyXG5cclxuQ29sdW1uU2VsZWN0aW9uUGFuZWwucHJvdG90eXBlLmNvbHVtbnNDaGFuZ2VkID0gZnVuY3Rpb24obmV3Q29sdW1ucykge1xyXG4gICAgdGhpcy5jQ29sdW1uTGlzdC5zZXRNb2RlbChuZXdDb2x1bW5zKTtcclxufTtcclxuXHJcbkNvbHVtblNlbGVjdGlvblBhbmVsLnByb3RvdHlwZS5nZXRDb2x1bW5MaXN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jQ29sdW1uTGlzdDtcclxufTtcclxuXHJcbkNvbHVtblNlbGVjdGlvblBhbmVsLnByb3RvdHlwZS5jb2x1bW5DZWxsUmVuZGVyZXIgPSBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgIHZhciBjb2x1bW4gPSBwYXJhbXMudmFsdWU7XHJcbiAgICB2YXIgY29sRGlzcGxheU5hbWUgPSB0aGlzLmNvbHVtbkNvbnRyb2xsZXIuZ2V0RGlzcGxheU5hbWVGb3JDb2woY29sdW1uKTtcclxuXHJcbiAgICB2YXIgZVJlc3VsdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuXHJcbiAgICB2YXIgZVZpc2libGVJY29ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgIHV0aWxzLmFkZENzc0NsYXNzKGVWaXNpYmxlSWNvbnMsICdhZy12aXNpYmxlLWljb25zJyk7XHJcbiAgICB2YXIgZVNob3dpbmcgPSB1dGlscy5jcmVhdGVJY29uKCdjb2x1bW5WaXNpYmxlJywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbiwgc3ZnRmFjdG9yeS5jcmVhdGVDb2x1bW5TaG93aW5nU3ZnKTtcclxuICAgIHZhciBlSGlkZGVuID0gdXRpbHMuY3JlYXRlSWNvbignY29sdW1uSGlkZGVuJywgdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIsIGNvbHVtbiwgc3ZnRmFjdG9yeS5jcmVhdGVDb2x1bW5IaWRkZW5TdmcpO1xyXG4gICAgZVZpc2libGVJY29ucy5hcHBlbmRDaGlsZChlU2hvd2luZyk7XHJcbiAgICBlVmlzaWJsZUljb25zLmFwcGVuZENoaWxkKGVIaWRkZW4pO1xyXG4gICAgZVNob3dpbmcuc3R5bGUuZGlzcGxheSA9IGNvbHVtbi52aXNpYmxlID8gJycgOiAnbm9uZSc7XHJcbiAgICBlSGlkZGVuLnN0eWxlLmRpc3BsYXkgPSBjb2x1bW4udmlzaWJsZSA/ICdub25lJyA6ICcnO1xyXG4gICAgZVJlc3VsdC5hcHBlbmRDaGlsZChlVmlzaWJsZUljb25zKTtcclxuXHJcbiAgICB2YXIgZVZhbHVlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgZVZhbHVlLmlubmVySFRNTCA9IGNvbERpc3BsYXlOYW1lO1xyXG4gICAgZVJlc3VsdC5hcHBlbmRDaGlsZChlVmFsdWUpO1xyXG5cclxuICAgIGlmICghY29sdW1uLnZpc2libGUpIHtcclxuICAgICAgICB1dGlscy5hZGRDc3NDbGFzcyhlUmVzdWx0LCAnYWctY29sdW1uLW5vdC12aXNpYmxlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hhbmdlIHZpc2libGUgaWYgdXNlIGNsaWNrcyB0aGUgdmlzaWJsZSBpY29uLCBvciBpZiByb3cgaXMgZG91YmxlIGNsaWNrZWRcclxuICAgIGVWaXNpYmxlSWNvbnMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93RXZlbnRMaXN0ZW5lcik7XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgZnVuY3Rpb24gc2hvd0V2ZW50TGlzdGVuZXIoKSB7XHJcbiAgICAgICAgY29sdW1uLnZpc2libGUgPSAhY29sdW1uLnZpc2libGU7XHJcbiAgICAgICAgdGhhdC5jQ29sdW1uTGlzdC5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgIHRoYXQuY29sdW1uQ29udHJvbGxlci5vbkNvbHVtblN0YXRlQ2hhbmdlZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBlUmVzdWx0O1xyXG59O1xyXG5cclxuQ29sdW1uU2VsZWN0aW9uUGFuZWwucHJvdG90eXBlLnNldHVwQ29tcG9uZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHRoaXMuY0NvbHVtbkxpc3QgPSBuZXcgQ2hlY2tib3hTZWxlY3Rpb24oKTtcclxuICAgIHRoaXMuY0NvbHVtbkxpc3Quc2V0Q2VsbFJlbmRlcmVyKHRoaXMuY29sdW1uQ2VsbFJlbmRlcmVyLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHRoaXMuY0NvbHVtbkxpc3QuYWRkTW9kZWxDaGFuZ2VkTGlzdGVuZXIoIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoYXQuY29sdW1uQ29udHJvbGxlci5vbkNvbHVtblN0YXRlQ2hhbmdlZCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGxvY2FsZVRleHRGdW5jID0gdGhpcy5ncmlkT3B0aW9uc1dyYXBwZXIuZ2V0TG9jYWxlVGV4dEZ1bmMoKTtcclxuICAgIHZhciBjb2x1bW5zTG9jYWxUZXh0ID0gbG9jYWxlVGV4dEZ1bmMoJ2NvbHVtbnMnLCAnQ29sdW1ucycpO1xyXG5cclxuICAgIHZhciBlTm9ydGhQYW5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZU5vcnRoUGFuZWwuaW5uZXJIVE1MID0gJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBjZW50ZXI7XCI+Jytjb2x1bW5zTG9jYWxUZXh0Kyc8L2Rpdj4nO1xyXG5cclxuICAgIHRoaXMubGF5b3V0ID0gbmV3IEJvcmRlckxheW91dCh7XHJcbiAgICAgICAgY2VudGVyOiB0aGlzLmNDb2x1bW5MaXN0LmdldEd1aSgpLFxyXG4gICAgICAgIG5vcnRoOiBlTm9ydGhQYW5lbFxyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vLyBub3Qgc3VyZSBpZiB0aGlzIGlzIGNhbGxlZCBhbnl3aGVyZVxyXG5Db2x1bW5TZWxlY3Rpb25QYW5lbC5wcm90b3R5cGUuc2V0U2VsZWN0ZWQgPSBmdW5jdGlvbihjb2x1bW4sIHNlbGVjdGVkKSB7XHJcbiAgICBjb2x1bW4udmlzaWJsZSA9IHNlbGVjdGVkO1xyXG4gICAgdGhpcy5jb2x1bW5Db250cm9sbGVyLm9uQ29sdW1uU3RhdGVDaGFuZ2VkKCk7XHJcbn07XHJcblxyXG5Db2x1bW5TZWxlY3Rpb25QYW5lbC5wcm90b3R5cGUuZ2V0R3VpID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lUm9vdFBhbmVsLmdldEd1aSgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb2x1bW5TZWxlY3Rpb25QYW5lbDtcclxuIiwidmFyIENoZWNrYm94U2VsZWN0aW9uID0gcmVxdWlyZShcIi4uL3dpZGdldHMvY2hlY2tib3hTZWxlY3Rpb25cIik7XHJcbnZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcclxudmFyIEJvcmRlckxheW91dCA9IHJlcXVpcmUoJy4uL2xheW91dC9ib3JkZXJMYXlvdXQnKTtcclxudmFyIFN2Z0ZhY3RvcnkgPSByZXF1aXJlKCcuLi9zdmdGYWN0b3J5Jyk7XHJcblxyXG52YXIgc3ZnRmFjdG9yeSA9IG5ldyBTdmdGYWN0b3J5KCk7XHJcblxyXG5mdW5jdGlvbiBHcm91cFNlbGVjdGlvblBhbmVsKGNvbHVtbkNvbnRyb2xsZXIsIGluTWVtb3J5Um93Q29udHJvbGxlciwgZ3JpZE9wdGlvbnNXcmFwcGVyKSB7XHJcbiAgICB0aGlzLmdyaWRPcHRpb25zV3JhcHBlciA9IGdyaWRPcHRpb25zV3JhcHBlcjtcclxuICAgIHRoaXMuc2V0dXBDb21wb25lbnRzKCk7XHJcbiAgICB0aGlzLmNvbHVtbkNvbnRyb2xsZXIgPSBjb2x1bW5Db250cm9sbGVyO1xyXG4gICAgdGhpcy5pbk1lbW9yeVJvd0NvbnRyb2xsZXIgPSBpbk1lbW9yeVJvd0NvbnRyb2xsZXI7XHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgdGhpcy5jb2x1bW5Db250cm9sbGVyLmFkZExpc3RlbmVyKHtcclxuICAgICAgICBjb2x1bW5zQ2hhbmdlZDogdGhhdC5jb2x1bW5zQ2hhbmdlZC5iaW5kKHRoYXQpXHJcbiAgICB9KTtcclxufVxyXG5cclxuR3JvdXBTZWxlY3Rpb25QYW5lbC5wcm90b3R5cGUuY29sdW1uc0NoYW5nZWQgPSBmdW5jdGlvbihuZXdDb2x1bW5zLCBuZXdHcm91cGVkQ29sdW1ucykge1xyXG4gICAgdGhpcy5jQ29sdW1uTGlzdC5zZXRNb2RlbChuZXdHcm91cGVkQ29sdW1ucyk7XHJcbn07XHJcblxyXG5Hcm91cFNlbGVjdGlvblBhbmVsLnByb3RvdHlwZS5nZXRDb2x1bW5MaXN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jQ29sdW1uTGlzdDtcclxufTtcclxuXHJcbkdyb3VwU2VsZWN0aW9uUGFuZWwucHJvdG90eXBlLmNvbHVtbkNlbGxSZW5kZXJlciA9IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgdmFyIGNvbHVtbiA9IHBhcmFtcy52YWx1ZTtcclxuICAgIHZhciBjb2xEaXNwbGF5TmFtZSA9IHRoaXMuY29sdW1uQ29udHJvbGxlci5nZXREaXNwbGF5TmFtZUZvckNvbChjb2x1bW4pO1xyXG5cclxuICAgIHZhciBlUmVzdWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG5cclxuICAgIHZhciBlUmVtb3ZlID0gdXRpbHMuY3JlYXRlSWNvbignY29sdW1uUmVtb3ZlRnJvbUdyb3VwSWNvbicsIHRoaXMuZ3JpZE9wdGlvbnNXcmFwcGVyLCBjb2x1bW4sIHN2Z0ZhY3RvcnkuY3JlYXRlQXJyb3dVcFN2Zyk7XHJcbiAgICB1dGlscy5hZGRDc3NDbGFzcyhlUmVtb3ZlLCAnYWctdmlzaWJsZS1pY29ucycpO1xyXG4gICAgZVJlc3VsdC5hcHBlbmRDaGlsZChlUmVtb3ZlKTtcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICBlUmVtb3ZlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBtb2RlbCA9IHRoYXQuY0NvbHVtbkxpc3QuZ2V0TW9kZWwoKTtcclxuICAgICAgICBtb2RlbC5zcGxpY2UobW9kZWwuaW5kZXhPZihjb2x1bW4pLCAxKTtcclxuICAgICAgICB0aGF0LmNDb2x1bW5MaXN0LnNldE1vZGVsKG1vZGVsKTtcclxuICAgICAgICB0aGF0Lm9uR3JvdXBpbmdDaGFuZ2VkKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgZVZhbHVlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgZVZhbHVlLmlubmVySFRNTCA9IGNvbERpc3BsYXlOYW1lO1xyXG4gICAgZVJlc3VsdC5hcHBlbmRDaGlsZChlVmFsdWUpO1xyXG5cclxuICAgIHJldHVybiBlUmVzdWx0O1xyXG59O1xyXG5cclxuR3JvdXBTZWxlY3Rpb25QYW5lbC5wcm90b3R5cGUuc2V0dXBDb21wb25lbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbG9jYWxlVGV4dEZ1bmMgPSB0aGlzLmdyaWRPcHRpb25zV3JhcHBlci5nZXRMb2NhbGVUZXh0RnVuYygpO1xyXG4gICAgdmFyIGNvbHVtbnNMb2NhbFRleHQgPSBsb2NhbGVUZXh0RnVuYygncGl2b3RlZENvbHVtbnMnLCAnUGl2b3RlZCBDb2x1bW5zJyk7XHJcbiAgICB2YXIgcGl2b3RlZENvbHVtbnNFbXB0eU1lc3NhZ2UgPSBsb2NhbGVUZXh0RnVuYygncGl2b3RlZENvbHVtbnNFbXB0eU1lc3NhZ2UnLCAnRHJhZyBjb2x1bW5zIGRvd24gZnJvbSBhYm92ZSB0byBwaXZvdCBieSB0aG9zZSBjb2x1bW5zJyk7XHJcblxyXG4gICAgdGhpcy5jQ29sdW1uTGlzdCA9IG5ldyBDaGVja2JveFNlbGVjdGlvbigpO1xyXG4gICAgdGhpcy5jQ29sdW1uTGlzdC5zZXRDZWxsUmVuZGVyZXIodGhpcy5jb2x1bW5DZWxsUmVuZGVyZXIuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmNDb2x1bW5MaXN0LmFkZE1vZGVsQ2hhbmdlZExpc3RlbmVyKHRoaXMub25Hcm91cGluZ0NoYW5nZWQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmNDb2x1bW5MaXN0LnNldEVtcHR5TWVzc2FnZShwaXZvdGVkQ29sdW1uc0VtcHR5TWVzc2FnZSk7XHJcblxyXG4gICAgdmFyIGVOb3J0aFBhbmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBlTm9ydGhQYW5lbC5zdHlsZS5wYWRkaW5nVG9wID0gJzEwcHgnO1xyXG4gICAgZU5vcnRoUGFuZWwuaW5uZXJIVE1MID0gJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBjZW50ZXI7XCI+Jytjb2x1bW5zTG9jYWxUZXh0Kyc8L2Rpdj4nO1xyXG5cclxuICAgIHRoaXMubGF5b3V0ID0gbmV3IEJvcmRlckxheW91dCh7XHJcbiAgICAgICAgY2VudGVyOiB0aGlzLmNDb2x1bW5MaXN0LmdldEd1aSgpLFxyXG4gICAgICAgIG5vcnRoOiBlTm9ydGhQYW5lbFxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5Hcm91cFNlbGVjdGlvblBhbmVsLnByb3RvdHlwZS5vbkdyb3VwaW5nQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5pbk1lbW9yeVJvd0NvbnRyb2xsZXIuZG9Hcm91cGluZygpO1xyXG4gICAgdGhpcy5pbk1lbW9yeVJvd0NvbnRyb2xsZXIudXBkYXRlTW9kZWwoY29uc3RhbnRzLlNURVBfRVZFUllUSElORyk7XHJcbiAgICB0aGlzLmNvbHVtbkNvbnRyb2xsZXIub25Db2x1bW5TdGF0ZUNoYW5nZWQoKTtcclxufTtcclxuXHJcbkdyb3VwU2VsZWN0aW9uUGFuZWwucHJvdG90eXBlLmdldEd1aSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZVJvb3RQYW5lbC5nZXRHdWkoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR3JvdXBTZWxlY3Rpb25QYW5lbDsiLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xyXG52YXIgQ29sdW1uU2VsZWN0aW9uUGFuZWwgPSByZXF1aXJlKCcuL2NvbHVtblNlbGVjdGlvblBhbmVsJyk7XHJcbnZhciBHcm91cFNlbGVjdGlvblBhbmVsID0gcmVxdWlyZSgnLi9ncm91cFNlbGVjdGlvblBhbmVsJyk7XHJcbnZhciBWZXJ0aWNhbFN0YWNrID0gcmVxdWlyZSgnLi4vbGF5b3V0L3ZlcnRpY2FsU3RhY2snKTtcclxuXHJcbmZ1bmN0aW9uIFRvb2xQYW5lbCgpIHtcclxuICAgIHRoaXMubGF5b3V0ID0gbmV3IFZlcnRpY2FsU3RhY2soKTtcclxufVxyXG5cclxuVG9vbFBhbmVsLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oY29sdW1uQ29udHJvbGxlciwgaW5NZW1vcnlSb3dDb250cm9sbGVyLCBncmlkT3B0aW9uc1dyYXBwZXIpIHtcclxuXHJcbiAgICB2YXIgY29sdW1uU2VsZWN0aW9uUGFuZWwgPSBuZXcgQ29sdW1uU2VsZWN0aW9uUGFuZWwoY29sdW1uQ29udHJvbGxlciwgZ3JpZE9wdGlvbnNXcmFwcGVyKTtcclxuICAgIHRoaXMubGF5b3V0LmFkZFBhbmVsKGNvbHVtblNlbGVjdGlvblBhbmVsLmxheW91dCwgJzUwJScpO1xyXG4gICAgdmFyIGdyb3VwU2VsZWN0aW9uUGFuZWwgPSBuZXcgR3JvdXBTZWxlY3Rpb25QYW5lbChjb2x1bW5Db250cm9sbGVyLCBpbk1lbW9yeVJvd0NvbnRyb2xsZXIsIGdyaWRPcHRpb25zV3JhcHBlcik7XHJcbiAgICB0aGlzLmxheW91dC5hZGRQYW5lbChncm91cFNlbGVjdGlvblBhbmVsLmxheW91dCwgJzUwJScpO1xyXG5cclxuICAgIGdyb3VwU2VsZWN0aW9uUGFuZWwuZ2V0Q29sdW1uTGlzdCgpLmFkZERyYWdTb3VyY2UoY29sdW1uU2VsZWN0aW9uUGFuZWwuZ2V0Q29sdW1uTGlzdCgpLmdldFVuaXF1ZUlkKCkpO1xyXG5cclxuICAgIHZhciBlR3VpID0gdGhpcy5sYXlvdXQuZ2V0R3VpKCk7XHJcblxyXG4gICAgdXRpbHMuYWRkQ3NzQ2xhc3MoZUd1aSwgJ2FnLXRvb2wtcGFuZWwtY29udGFpbmVyJyk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRvb2xQYW5lbDtcclxuIiwiZnVuY3Rpb24gVXRpbHMoKSB7fVxyXG5cclxudmFyIEZVTkNUSU9OX1NUUklQX0NPTU1FTlRTID0gLygoXFwvXFwvLiokKXwoXFwvXFwqW1xcc1xcU10qP1xcKlxcLykpL21nO1xyXG52YXIgRlVOQ1RJT05fQVJHVU1FTlRfTkFNRVMgPSAvKFteXFxzLF0rKS9nO1xyXG5cclxuVXRpbHMucHJvdG90eXBlLml0ZXJhdGVPYmplY3QgPSBmdW5jdGlvbihvYmplY3QsIGNhbGxiYWNrKSB7XHJcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaTxrZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XHJcbiAgICAgICAgdmFyIHZhbHVlID0gb2JqZWN0W2tleV07XHJcbiAgICAgICAgY2FsbGJhY2soa2V5LCB2YWx1ZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24oYXJyYXksIGNhbGxiYWNrKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaTxhcnJheS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBpdGVtID0gYXJyYXlbaV07XHJcbiAgICAgICAgdmFyIG1hcHBlZEl0ZW0gPSBjYWxsYmFjayhpdGVtKTtcclxuICAgICAgICByZXN1bHQucHVzaChtYXBwZWRJdGVtKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUuZ2V0RnVuY3Rpb25QYXJhbWV0ZXJzID0gZnVuY3Rpb24oZnVuYykge1xyXG4gICAgdmFyIGZuU3RyID0gZnVuYy50b1N0cmluZygpLnJlcGxhY2UoRlVOQ1RJT05fU1RSSVBfQ09NTUVOVFMsICcnKTtcclxuICAgIHZhciByZXN1bHQgPSBmblN0ci5zbGljZShmblN0ci5pbmRleE9mKCcoJykrMSwgZm5TdHIuaW5kZXhPZignKScpKS5tYXRjaChGVU5DVElPTl9BUkdVTUVOVF9OQU1FUyk7XHJcbiAgICBpZiAocmVzdWx0ID09PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnRvU3RyaW5ncyA9IGZ1bmN0aW9uKGFycmF5KSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXAoYXJyYXksIGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgaWYgKGl0ZW0gPT09IHVuZGVmaW5lZCB8fCBpdGVtID09PSBudWxsIHx8ICFpdGVtLnRvU3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vKlxyXG5VdGlscy5wcm90b3R5cGUub2JqZWN0VmFsdWVzVG9BcnJheSA9IGZ1bmN0aW9uKG9iamVjdCkge1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpO1xyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGk8a2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IG9iamVjdFtrZXldO1xyXG4gICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcbiovXHJcblxyXG5VdGlscy5wcm90b3R5cGUuaXRlcmF0ZUFycmF5ID0gZnVuY3Rpb24oYXJyYXksIGNhbGxiYWNrKSB7XHJcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4PGFycmF5Lmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IGFycmF5W2luZGV4XTtcclxuICAgICAgICBjYWxsYmFjayh2YWx1ZSwgaW5kZXgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24oZXhwcmVzc2lvblNlcnZpY2UsIGRhdGEsIGNvbERlZiwgbm9kZSwgYXBpLCBjb250ZXh0KSB7XHJcblxyXG4gICAgdmFyIHZhbHVlR2V0dGVyID0gY29sRGVmLnZhbHVlR2V0dGVyO1xyXG4gICAgdmFyIGZpZWxkID0gY29sRGVmLmZpZWxkO1xyXG5cclxuICAgIC8vIGlmIHRoZXJlIGlzIGEgdmFsdWUgZ2V0dGVyLCB0aGlzIGdldHMgcHJlY2VkZW5jZSBvdmVyIGEgZmllbGRcclxuICAgIGlmICh2YWx1ZUdldHRlcikge1xyXG5cclxuICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICBjb2xEZWY6IGNvbERlZixcclxuICAgICAgICAgICAgYXBpOiBhcGksXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlR2V0dGVyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIC8vIHZhbHVlR2V0dGVyIGlzIGEgZnVuY3Rpb24sIHNvIGp1c3QgY2FsbCBpdFxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVHZXR0ZXIocGFyYW1zKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZUdldHRlciA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgLy8gdmFsdWVHZXR0ZXIgaXMgYW4gZXhwcmVzc2lvbiwgc28gZXhlY3V0ZSB0aGUgZXhwcmVzc2lvblxyXG4gICAgICAgICAgICByZXR1cm4gZXhwcmVzc2lvblNlcnZpY2UuZXZhbHVhdGUodmFsdWVHZXR0ZXIsIHBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSBpZiAoZmllbGQgJiYgZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBkYXRhW2ZpZWxkXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxufTtcclxuXHJcbi8vUmV0dXJucyB0cnVlIGlmIGl0IGlzIGEgRE9NIG5vZGVcclxuLy90YWtlbiBmcm9tOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM4NDI4Ni9qYXZhc2NyaXB0LWlzZG9tLWhvdy1kby15b3UtY2hlY2staWYtYS1qYXZhc2NyaXB0LW9iamVjdC1pcy1hLWRvbS1vYmplY3RcclxuVXRpbHMucHJvdG90eXBlLmlzTm9kZSA9IGZ1bmN0aW9uKG8pIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgdHlwZW9mIE5vZGUgPT09IFwib2JqZWN0XCIgPyBvIGluc3RhbmNlb2YgTm9kZSA6XHJcbiAgICAgICAgbyAmJiB0eXBlb2YgbyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2Ygby5ub2RlVHlwZSA9PT0gXCJudW1iZXJcIiAmJiB0eXBlb2Ygby5ub2RlTmFtZSA9PT0gXCJzdHJpbmdcIlxyXG4gICAgKTtcclxufTtcclxuXHJcbi8vUmV0dXJucyB0cnVlIGlmIGl0IGlzIGEgRE9NIGVsZW1lbnRcclxuLy90YWtlbiBmcm9tOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM4NDI4Ni9qYXZhc2NyaXB0LWlzZG9tLWhvdy1kby15b3UtY2hlY2staWYtYS1qYXZhc2NyaXB0LW9iamVjdC1pcy1hLWRvbS1vYmplY3RcclxuVXRpbHMucHJvdG90eXBlLmlzRWxlbWVudCA9IGZ1bmN0aW9uKG8pIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgdHlwZW9mIEhUTUxFbGVtZW50ID09PSBcIm9iamVjdFwiID8gbyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50IDogLy9ET00yXHJcbiAgICAgICAgbyAmJiB0eXBlb2YgbyA9PT0gXCJvYmplY3RcIiAmJiBvICE9PSBudWxsICYmIG8ubm9kZVR5cGUgPT09IDEgJiYgdHlwZW9mIG8ubm9kZU5hbWUgPT09IFwic3RyaW5nXCJcclxuICAgICk7XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUuaXNOb2RlT3JFbGVtZW50ID0gZnVuY3Rpb24obykge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNOb2RlKG8pIHx8IHRoaXMuaXNFbGVtZW50KG8pO1xyXG59O1xyXG5cclxuLy9hZGRzIGFsbCB0eXBlIG9mIGNoYW5nZSBsaXN0ZW5lcnMgdG8gYW4gZWxlbWVudCwgaW50ZW5kZWQgdG8gYmUgYSB0ZXh0IGZpZWxkXHJcblV0aWxzLnByb3RvdHlwZS5hZGRDaGFuZ2VMaXN0ZW5lciA9IGZ1bmN0aW9uKGVsZW1lbnQsIGxpc3RlbmVyKSB7XHJcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VkXCIsIGxpc3RlbmVyKTtcclxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInBhc3RlXCIsIGxpc3RlbmVyKTtcclxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIGxpc3RlbmVyKTtcclxufTtcclxuXHJcbi8vaWYgdmFsdWUgaXMgdW5kZWZpbmVkLCBudWxsIG9yIGJsYW5rLCByZXR1cm5zIG51bGwsIG90aGVyd2lzZSByZXR1cm5zIHRoZSB2YWx1ZVxyXG5VdGlscy5wcm90b3R5cGUubWFrZU51bGwgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IFwiXCIpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnJlbW92ZUFsbENoaWxkcmVuID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgaWYgKG5vZGUpIHtcclxuICAgICAgICB3aGlsZSAobm9kZS5oYXNDaGlsZE5vZGVzKCkpIHtcclxuICAgICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZChub2RlLmxhc3RDaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy9hZGRzIGFuIGVsZW1lbnQgdG8gYSBkaXYsIGJ1dCBhbHNvIGFkZHMgYSBiYWNrZ3JvdW5kIGNoZWNraW5nIGZvciBjbGlja3MsXHJcbi8vc28gdGhhdCB3aGVuIHRoZSBiYWNrZ3JvdW5kIGlzIGNsaWNrZWQsIHRoZSBjaGlsZCBpcyByZW1vdmVkIGFnYWluLCBnaXZpbmdcclxuLy9hIG1vZGVsIGxvb2sgdG8gcG9wdXBzLlxyXG5VdGlscy5wcm90b3R5cGUuYWRkQXNNb2RhbFBvcHVwID0gZnVuY3Rpb24oZVBhcmVudCwgZUNoaWxkKSB7XHJcbiAgICB2YXIgZUJhY2tkcm9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIGVCYWNrZHJvcC5jbGFzc05hbWUgPSBcImFnLXBvcHVwLWJhY2tkcm9wXCI7XHJcblxyXG4gICAgZUJhY2tkcm9wLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBlUGFyZW50LnJlbW92ZUNoaWxkKGVDaGlsZCk7XHJcbiAgICAgICAgZVBhcmVudC5yZW1vdmVDaGlsZChlQmFja2Ryb3ApO1xyXG4gICAgfTtcclxuXHJcbiAgICBlUGFyZW50LmFwcGVuZENoaWxkKGVCYWNrZHJvcCk7XHJcbiAgICBlUGFyZW50LmFwcGVuZENoaWxkKGVDaGlsZCk7XHJcbn07XHJcblxyXG4vL2xvYWRzIHRoZSB0ZW1wbGF0ZSBhbmQgcmV0dXJucyBpdCBhcyBhbiBlbGVtZW50LiBtYWtlcyB1cCBmb3Igbm8gc2ltcGxlIHdheSBpblxyXG4vL3RoZSBkb20gYXBpIHRvIGxvYWQgaHRtbCBkaXJlY3RseSwgZWcgd2UgY2Fubm90IGRvIHRoaXM6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGVtcGxhdGUpXHJcblV0aWxzLnByb3RvdHlwZS5sb2FkVGVtcGxhdGUgPSBmdW5jdGlvbih0ZW1wbGF0ZSkge1xyXG4gICAgdmFyIHRlbXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgdGVtcERpdi5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcclxuICAgIHJldHVybiB0ZW1wRGl2LmZpcnN0Q2hpbGQ7XHJcbn07XHJcblxyXG4vL2lmIHBhc3NlZCAnNDJweCcgdGhlbiByZXR1cm5zIHRoZSBudW1iZXIgNDJcclxuVXRpbHMucHJvdG90eXBlLnBpeGVsU3RyaW5nVG9OdW1iZXIgPSBmdW5jdGlvbih2YWwpIHtcclxuICAgIGlmICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgaWYgKHZhbC5pbmRleE9mKFwicHhcIikgPj0gMCkge1xyXG4gICAgICAgICAgICB2YWwucmVwbGFjZShcInB4XCIsIFwiXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQodmFsKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbDtcclxuICAgIH1cclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5xdWVyeVNlbGVjdG9yQWxsX2FkZENzc0NsYXNzID0gZnVuY3Rpb24oZVBhcmVudCwgc2VsZWN0b3IsIGNzc0NsYXNzKSB7XHJcbiAgICB2YXIgZVJvd3MgPSBlUGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBlUm93cy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgIHRoaXMuYWRkQ3NzQ2xhc3MoZVJvd3Nba10sIGNzc0NsYXNzKTtcclxuICAgIH1cclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5xdWVyeVNlbGVjdG9yQWxsX3JlbW92ZUNzc0NsYXNzID0gZnVuY3Rpb24oZVBhcmVudCwgc2VsZWN0b3IsIGNzc0NsYXNzKSB7XHJcbiAgICB2YXIgZVJvd3MgPSBlUGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBlUm93cy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlQ3NzQ2xhc3MoZVJvd3Nba10sIGNzc0NsYXNzKTtcclxuICAgIH1cclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5xdWVyeVNlbGVjdG9yQWxsX3JlcGxhY2VDc3NDbGFzcyA9IGZ1bmN0aW9uKGVQYXJlbnQsIHNlbGVjdG9yLCBjc3NDbGFzc1RvUmVtb3ZlLCBjc3NDbGFzc1RvQWRkKSB7XHJcbiAgICB2YXIgZVJvd3MgPSBlUGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBlUm93cy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlQ3NzQ2xhc3MoZVJvd3Nba10sIGNzc0NsYXNzVG9SZW1vdmUpO1xyXG4gICAgICAgIHRoaXMuYWRkQ3NzQ2xhc3MoZVJvd3Nba10sIGNzc0NsYXNzVG9BZGQpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLmFkZE9yUmVtb3ZlQ3NzQ2xhc3MgPSBmdW5jdGlvbihlbGVtZW50LCBjbGFzc05hbWUsIGFkZE9yUmVtb3ZlKSB7XHJcbiAgICBpZiAoYWRkT3JSZW1vdmUpIHtcclxuICAgICAgICB0aGlzLmFkZENzc0NsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlQ3NzQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lKTtcclxuICAgIH1cclxufTtcclxuXHJcblV0aWxzLnByb3RvdHlwZS5hZGRDc3NDbGFzcyA9IGZ1bmN0aW9uKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xyXG4gICAgaWYgKGVsZW1lbnQuY2xhc3NOYW1lICYmIGVsZW1lbnQuY2xhc3NOYW1lLmxlbmd0aCA+IDApIHtcclxuICAgICAgICB2YXIgY3NzQ2xhc3NlcyA9IGVsZW1lbnQuY2xhc3NOYW1lLnNwbGl0KCcgJyk7XHJcbiAgICAgICAgaWYgKGNzc0NsYXNzZXMuaW5kZXhPZihjbGFzc05hbWUpIDwgMCkge1xyXG4gICAgICAgICAgICBjc3NDbGFzc2VzLnB1c2goY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSBjc3NDbGFzc2VzLmpvaW4oJyAnKTtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLm9mZnNldEhlaWdodCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIHJldHVybiBlbGVtZW50ICYmIGVsZW1lbnQuY2xpZW50SGVpZ2h0ID8gZWxlbWVudC5jbGllbnRIZWlnaHQgOiAwO1xyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLm9mZnNldFdpZHRoID0gZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgcmV0dXJuIGVsZW1lbnQgJiYgZWxlbWVudC5jbGllbnRXaWR0aCA/IGVsZW1lbnQuY2xpZW50V2lkdGggOiAwO1xyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnJlbW92ZUNzc0NsYXNzID0gZnVuY3Rpb24oZWxlbWVudCwgY2xhc3NOYW1lKSB7XHJcbiAgICBpZiAoZWxlbWVudC5jbGFzc05hbWUgJiYgZWxlbWVudC5jbGFzc05hbWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHZhciBjc3NDbGFzc2VzID0gZWxlbWVudC5jbGFzc05hbWUuc3BsaXQoJyAnKTtcclxuICAgICAgICB2YXIgaW5kZXggPSBjc3NDbGFzc2VzLmluZGV4T2YoY2xhc3NOYW1lKTtcclxuICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xyXG4gICAgICAgICAgICBjc3NDbGFzc2VzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gY3NzQ2xhc3Nlcy5qb2luKCcgJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnJlbW92ZUZyb21BcnJheSA9IGZ1bmN0aW9uKGFycmF5LCBvYmplY3QpIHtcclxuICAgIGFycmF5LnNwbGljZShhcnJheS5pbmRleE9mKG9iamVjdCksIDEpO1xyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLmRlZmF1bHRDb21wYXJhdG9yID0gZnVuY3Rpb24odmFsdWVBLCB2YWx1ZUIpIHtcclxuICAgIHZhciB2YWx1ZUFNaXNzaW5nID0gdmFsdWVBID09PSBudWxsIHx8IHZhbHVlQSA9PT0gdW5kZWZpbmVkO1xyXG4gICAgdmFyIHZhbHVlQk1pc3NpbmcgPSB2YWx1ZUIgPT09IG51bGwgfHwgdmFsdWVCID09PSB1bmRlZmluZWQ7XHJcbiAgICBpZiAodmFsdWVBTWlzc2luZyAmJiB2YWx1ZUJNaXNzaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBpZiAodmFsdWVBTWlzc2luZykge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuICAgIGlmICh2YWx1ZUJNaXNzaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHZhbHVlQSA8IHZhbHVlQikge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH0gZWxzZSBpZiAodmFsdWVBID4gdmFsdWVCKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLmZvcm1hdFdpZHRoID0gZnVuY3Rpb24od2lkdGgpIHtcclxuICAgIGlmICh0eXBlb2Ygd2lkdGggPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICByZXR1cm4gd2lkdGggKyBcInB4XCI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB3aWR0aDtcclxuICAgIH1cclxufTtcclxuXHJcbi8vIHRyaWVzIHRvIHVzZSB0aGUgcHJvdmlkZWQgcmVuZGVyZXIuIGlmIGEgcmVuZGVyZXIgZm91bmQsIHJldHVybnMgdHJ1ZS5cclxuLy8gaWYgbm8gcmVuZGVyZXIsIHJldHVybnMgZmFsc2UuXHJcblV0aWxzLnByb3RvdHlwZS51c2VSZW5kZXJlciA9IGZ1bmN0aW9uKGVQYXJlbnQsIGVSZW5kZXJlciwgcGFyYW1zKSB7XHJcbiAgICB2YXIgcmVzdWx0RnJvbVJlbmRlcmVyID0gZVJlbmRlcmVyKHBhcmFtcyk7XHJcbiAgICBpZiAodGhpcy5pc05vZGUocmVzdWx0RnJvbVJlbmRlcmVyKSB8fCB0aGlzLmlzRWxlbWVudChyZXN1bHRGcm9tUmVuZGVyZXIpKSB7XHJcbiAgICAgICAgLy9hIGRvbSBub2RlIG9yIGVsZW1lbnQgd2FzIHJldHVybmVkLCBzbyBhZGQgY2hpbGRcclxuICAgICAgICBlUGFyZW50LmFwcGVuZENoaWxkKHJlc3VsdEZyb21SZW5kZXJlcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vb3RoZXJ3aXNlIGFzc3VtZSBpdCB3YXMgaHRtbCwgc28ganVzdCBpbnNlcnRcclxuICAgICAgICB2YXIgZVRleHRTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgIGVUZXh0U3Bhbi5pbm5lckhUTUwgPSByZXN1bHRGcm9tUmVuZGVyZXI7XHJcbiAgICAgICAgZVBhcmVudC5hcHBlbmRDaGlsZChlVGV4dFNwYW4pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuLy8gaWYgaWNvbiBwcm92aWRlZCwgdXNlIHRoaXMgKGVpdGhlciBhIHN0cmluZywgb3IgYSBmdW5jdGlvbiBjYWxsYmFjaykuXHJcbi8vIGlmIG5vdCwgdGhlbiB1c2UgdGhlIHNlY29uZCBwYXJhbWV0ZXIsIHdoaWNoIGlzIHRoZSBzdmdGYWN0b3J5IGZ1bmN0aW9uXHJcblV0aWxzLnByb3RvdHlwZS5jcmVhdGVJY29uID0gZnVuY3Rpb24oaWNvbk5hbWUsIGdyaWRPcHRpb25zV3JhcHBlciwgY29sRGVmV3JhcHBlciwgc3ZnRmFjdG9yeUZ1bmMpIHtcclxuICAgIHZhciBlUmVzdWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgdmFyIHVzZXJQcm92aWRlZEljb247XHJcbiAgICAvLyBjaGVjayBjb2wgZm9yIGljb24gZmlyc3RcclxuICAgIGlmIChjb2xEZWZXcmFwcGVyICYmIGNvbERlZldyYXBwZXIuY29sRGVmLmljb25zKSB7XHJcbiAgICAgICAgdXNlclByb3ZpZGVkSWNvbiA9IGNvbERlZldyYXBwZXIuY29sRGVmLmljb25zW2ljb25OYW1lXTtcclxuICAgIH1cclxuICAgIC8vIGl0IG5vdCBpbiBjb2wsIHRyeSBncmlkIG9wdGlvbnNcclxuICAgIGlmICghdXNlclByb3ZpZGVkSWNvbiAmJiBncmlkT3B0aW9uc1dyYXBwZXIuZ2V0SWNvbnMoKSkge1xyXG4gICAgICAgIHVzZXJQcm92aWRlZEljb24gPSBncmlkT3B0aW9uc1dyYXBwZXIuZ2V0SWNvbnMoKVtpY29uTmFtZV07XHJcbiAgICB9XHJcbiAgICAvLyBub3cgaWYgdXNlciBwcm92aWRlZCwgdXNlIGl0XHJcbiAgICBpZiAodXNlclByb3ZpZGVkSWNvbikge1xyXG4gICAgICAgIHZhciByZW5kZXJlclJlc3VsdDtcclxuICAgICAgICBpZiAodHlwZW9mIHVzZXJQcm92aWRlZEljb24gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgcmVuZGVyZXJSZXN1bHQgPSB1c2VyUHJvdmlkZWRJY29uKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdXNlclByb3ZpZGVkSWNvbiA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgcmVuZGVyZXJSZXN1bHQgPSB1c2VyUHJvdmlkZWRJY29uO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93ICdpY29uIGZyb20gZ3JpZCBvcHRpb25zIG5lZWRzIHRvIGJlIGEgc3RyaW5nIG9yIGEgZnVuY3Rpb24nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIHJlbmRlcmVyUmVzdWx0ID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBlUmVzdWx0LmlubmVySFRNTCA9IHJlbmRlcmVyUmVzdWx0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc05vZGVPckVsZW1lbnQocmVuZGVyZXJSZXN1bHQpKSB7XHJcbiAgICAgICAgICAgIGVSZXN1bHQuYXBwZW5kQ2hpbGQocmVuZGVyZXJSZXN1bHQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93ICdpY29uUmVuZGVyZXIgc2hvdWxkIHJldHVybiBiYWNrIGEgc3RyaW5nIG9yIGEgZG9tIG9iamVjdCc7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBvdGhlcndpc2Ugd2UgdXNlIHRoZSBidWlsdCBpbiBpY29uXHJcbiAgICAgICAgZVJlc3VsdC5hcHBlbmRDaGlsZChzdmdGYWN0b3J5RnVuYygpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBlUmVzdWx0O1xyXG59O1xyXG5cclxuXHJcblV0aWxzLnByb3RvdHlwZS5nZXRTY3JvbGxiYXJXaWR0aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBvdXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBvdXRlci5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcclxuICAgIG91dGVyLnN0eWxlLndpZHRoID0gXCIxMDBweFwiO1xyXG4gICAgb3V0ZXIuc3R5bGUubXNPdmVyZmxvd1N0eWxlID0gXCJzY3JvbGxiYXJcIjsgLy8gbmVlZGVkIGZvciBXaW5KUyBhcHBzXHJcblxyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdXRlcik7XHJcblxyXG4gICAgdmFyIHdpZHRoTm9TY3JvbGwgPSBvdXRlci5vZmZzZXRXaWR0aDtcclxuICAgIC8vIGZvcmNlIHNjcm9sbGJhcnNcclxuICAgIG91dGVyLnN0eWxlLm92ZXJmbG93ID0gXCJzY3JvbGxcIjtcclxuXHJcbiAgICAvLyBhZGQgaW5uZXJkaXZcclxuICAgIHZhciBpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBpbm5lci5zdHlsZS53aWR0aCA9IFwiMTAwJVwiO1xyXG4gICAgb3V0ZXIuYXBwZW5kQ2hpbGQoaW5uZXIpO1xyXG5cclxuICAgIHZhciB3aWR0aFdpdGhTY3JvbGwgPSBpbm5lci5vZmZzZXRXaWR0aDtcclxuXHJcbiAgICAvLyByZW1vdmUgZGl2c1xyXG4gICAgb3V0ZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChvdXRlcik7XHJcblxyXG4gICAgcmV0dXJuIHdpZHRoTm9TY3JvbGwgLSB3aWR0aFdpdGhTY3JvbGw7XHJcbn07XHJcblxyXG5VdGlscy5wcm90b3R5cGUuaXNLZXlQcmVzc2VkID0gZnVuY3Rpb24oZXZlbnQsIGtleVRvQ2hlY2spIHtcclxuICAgIHZhciBwcmVzc2VkS2V5ID0gZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZTtcclxuICAgIHJldHVybiBwcmVzc2VkS2V5ID09PSBrZXlUb0NoZWNrO1xyXG59O1xyXG5cclxuVXRpbHMucHJvdG90eXBlLnNldFZpc2libGUgPSBmdW5jdGlvbihlbGVtZW50LCB2aXNpYmxlKSB7XHJcbiAgICBpZiAodmlzaWJsZSkge1xyXG4gICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBVdGlscygpO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPGRpdiBjbGFzcz1hZy1saXN0LXNlbGVjdGlvbj48ZGl2PjxkaXYgYWctcmVwZWF0PjwvZGl2PjwvZGl2PjwvZGl2PlwiO1xuIiwidmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9jaGVja2JveFNlbGVjdGlvbi5odG1sJyk7XHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcbnZhciBkcmFnQW5kRHJvcFNlcnZpY2UgPSByZXF1aXJlKCcuLi9kcmFnQW5kRHJvcC9kcmFnQW5kRHJvcFNlcnZpY2UnKTtcclxuXHJcbnZhciBOT1RfRFJPUF9UQVJHRVQgPSAwO1xyXG52YXIgRFJPUF9UQVJHRVRfQUJPVkUgPSAxO1xyXG52YXIgRFJPUF9UQVJHRVRfQkVMT1cgPSAtMTE7XHJcblxyXG5mdW5jdGlvbiBDaGVja2JveFNlbGVjdGlvbigpIHtcclxuICAgIHRoaXMuc2V0dXBDb21wb25lbnRzKCk7XHJcbiAgICB0aGlzLnVuaXF1ZUlkID0gJ0NoZWNrYm94U2VsZWN0aW9uLScgKyBNYXRoLnJhbmRvbSgpO1xyXG4gICAgdGhpcy5tb2RlbENoYW5nZWRMaXN0ZW5lcnMgPSBbXTtcclxuICAgIHRoaXMuZHJhZ1NvdXJjZXMgPSBbXTtcclxuICAgIHRoaXMuc2V0dXBBc0Ryb3BUYXJnZXQoKTtcclxufVxyXG5cclxuQ2hlY2tib3hTZWxlY3Rpb24ucHJvdG90eXBlLnNldEVtcHR5TWVzc2FnZSA9IGZ1bmN0aW9uKGVtcHR5TWVzc2FnZSkge1xyXG4gICAgcmV0dXJuIHRoaXMuZW1wdHlNZXNzYWdlID0gZW1wdHlNZXNzYWdlO1xyXG4gICAgdGhpcy5yZWZyZXNoVmlldygpO1xyXG59O1xyXG5cclxuQ2hlY2tib3hTZWxlY3Rpb24ucHJvdG90eXBlLmdldFVuaXF1ZUlkID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy51bmlxdWVJZDtcclxufTtcclxuXHJcbkNoZWNrYm94U2VsZWN0aW9uLnByb3RvdHlwZS5hZGREcmFnU291cmNlID0gZnVuY3Rpb24oZHJhZ1NvdXJjZSkge1xyXG4gICAgdGhpcy5kcmFnU291cmNlcy5wdXNoKGRyYWdTb3VyY2UpO1xyXG59O1xyXG5cclxuQ2hlY2tib3hTZWxlY3Rpb24ucHJvdG90eXBlLmFkZE1vZGVsQ2hhbmdlZExpc3RlbmVyID0gZnVuY3Rpb24obGlzdGVuZXIpIHtcclxuICAgIHRoaXMubW9kZWxDaGFuZ2VkTGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xyXG59O1xyXG5cclxuQ2hlY2tib3hTZWxlY3Rpb24ucHJvdG90eXBlLmZpcmVNb2RlbENoYW5nZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpPHRoaXMubW9kZWxDaGFuZ2VkTGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbENoYW5nZWRMaXN0ZW5lcnNbaV0oKTtcclxuICAgIH1cclxufTtcclxuXHJcbkNoZWNrYm94U2VsZWN0aW9uLnByb3RvdHlwZS5zZXR1cENvbXBvbmVudHMgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB0aGlzLmVHdWkgPSB1dGlscy5sb2FkVGVtcGxhdGUodGVtcGxhdGUpO1xyXG4gICAgdGhpcy5lRmlsdGVyVmFsdWVUZW1wbGF0ZSA9IHRoaXMuZUd1aS5xdWVyeVNlbGVjdG9yKFwiW2FnLXJlcGVhdF1cIik7XHJcblxyXG4gICAgdGhpcy5lTGlzdFBhcmVudCA9IHRoaXMuZUZpbHRlclZhbHVlVGVtcGxhdGUucGFyZW50Tm9kZTtcclxuICAgIHV0aWxzLnJlbW92ZUFsbENoaWxkcmVuKHRoaXMuZUxpc3RQYXJlbnQpO1xyXG59O1xyXG5cclxuQ2hlY2tib3hTZWxlY3Rpb24ucHJvdG90eXBlLnNldE1vZGVsID0gZnVuY3Rpb24obW9kZWwpIHtcclxuICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuICAgIHRoaXMucmVmcmVzaFZpZXcoKTtcclxufTtcclxuXHJcbkNoZWNrYm94U2VsZWN0aW9uLnByb3RvdHlwZS5nZXRNb2RlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubW9kZWw7XHJcbn07XHJcblxyXG5DaGVja2JveFNlbGVjdGlvbi5wcm90b3R5cGUuc2V0Q2VsbFJlbmRlcmVyID0gZnVuY3Rpb24oY2VsbFJlbmRlcmVyKSB7XHJcbiAgICB0aGlzLmNlbGxSZW5kZXJlciA9IGNlbGxSZW5kZXJlcjtcclxufTtcclxuXHJcbkNoZWNrYm94U2VsZWN0aW9uLnByb3RvdHlwZS5yZWZyZXNoVmlldyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdXRpbHMucmVtb3ZlQWxsQ2hpbGRyZW4odGhpcy5lTGlzdFBhcmVudCk7XHJcblxyXG4gICAgaWYgKHRoaXMubW9kZWwgJiYgdGhpcy5tb2RlbC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdGhpcy5pbnNlcnRSb3dzKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuaW5zZXJ0QmxhbmtNZXNzYWdlKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGVja2JveFNlbGVjdGlvbi5wcm90b3R5cGUuaW5zZXJ0Um93cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGk8dGhpcy5tb2RlbC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5tb2RlbFtpXTtcclxuICAgICAgICAvL3ZhciB0ZXh0ID0gdGhpcy5nZXRUZXh0KGl0ZW0pO1xyXG4gICAgICAgIC8vdmFyIHNlbGVjdGVkID0gdGhpcy5pc1NlbGVjdGVkKGl0ZW0pO1xyXG4gICAgICAgIHZhciBlTGlzdEl0ZW0gPSB0aGlzLmVGaWx0ZXJWYWx1ZVRlbXBsYXRlLmNsb25lTm9kZSh0cnVlKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY2VsbFJlbmRlcmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSB7dmFsdWU6IGl0ZW19O1xyXG4gICAgICAgICAgICB1dGlscy51c2VSZW5kZXJlcihlTGlzdEl0ZW0sIHRoaXMuY2VsbFJlbmRlcmVyLCBwYXJhbXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVMaXN0SXRlbS5pbm5lckhUTUwgPSBpdGVtO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5hZGREcmFnQW5kRHJvcFRvTGlzdEl0ZW0oZUxpc3RJdGVtLCBpdGVtKTtcclxuICAgICAgICB0aGlzLmVMaXN0UGFyZW50LmFwcGVuZENoaWxkKGVMaXN0SXRlbSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5DaGVja2JveFNlbGVjdGlvbi5wcm90b3R5cGUuaW5zZXJ0QmxhbmtNZXNzYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5lbXB0eU1lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgZU1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBlTWVzc2FnZS5zdHlsZS5jb2xvciA9ICdncmV5JztcclxuICAgICAgICBlTWVzc2FnZS5zdHlsZS5wYWRkaW5nID0gJzIwcHgnO1xyXG4gICAgICAgIGVNZXNzYWdlLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgIGVNZXNzYWdlLmlubmVySFRNTCA9IHRoaXMuZW1wdHlNZXNzYWdlO1xyXG4gICAgICAgIHRoaXMuZUxpc3RQYXJlbnQuYXBwZW5kQ2hpbGQoZU1lc3NhZ2UpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQ2hlY2tib3hTZWxlY3Rpb24ucHJvdG90eXBlLmdldERyYWdJdGVtID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5kcmFnSXRlbTtcclxufTtcclxuXHJcbkNoZWNrYm94U2VsZWN0aW9uLnByb3RvdHlwZS5zZXR1cEFzRHJvcFRhcmdldCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGRyYWdBbmREcm9wU2VydmljZS5hZGREcm9wVGFyZ2V0KHRoaXMuZUd1aSwge1xyXG4gICAgICAgIGFjY2VwdERyYWc6IHRoaXMuZXh0ZXJuYWxBY2NlcHREcmFnLmJpbmQodGhpcyksXHJcbiAgICAgICAgZHJvcDogdGhpcy5leHRlcm5hbERyb3AuYmluZCh0aGlzKSxcclxuICAgICAgICBub0Ryb3A6IHRoaXMuZXh0ZXJuYWxOb0Ryb3AuYmluZCh0aGlzKVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5DaGVja2JveFNlbGVjdGlvbi5wcm90b3R5cGUuZXh0ZXJuYWxBY2NlcHREcmFnID0gZnVuY3Rpb24oZHJhZ0V2ZW50KSB7XHJcbiAgICB2YXIgYWxsb3dlZFNvdXJjZSA9IHRoaXMuZHJhZ1NvdXJjZXMuaW5kZXhPZihkcmFnRXZlbnQuY29udGFpbmVySWQpID49IDA7XHJcbiAgICBpZiAoIWFsbG93ZWRTb3VyY2UpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB2YXIgYWxyZWFkeUhhdmVDb2wgPSB0aGlzLm1vZGVsLmluZGV4T2YoZHJhZ0V2ZW50LmRhdGEpID49IDA7XHJcbiAgICBpZiAoYWxyZWFkeUhhdmVDb2wpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLmVHdWkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ2xpZ2h0Z3JlZW4nO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG5DaGVja2JveFNlbGVjdGlvbi5wcm90b3R5cGUuZXh0ZXJuYWxEcm9wID0gZnVuY3Rpb24oZHJhZ0V2ZW50KSB7XHJcbiAgICB0aGlzLmFkZEl0ZW1Ub0xpc3QoZHJhZ0V2ZW50LmRhdGEpO1xyXG4gICAgdGhpcy5lR3VpLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcnO1xyXG59O1xyXG5cclxuQ2hlY2tib3hTZWxlY3Rpb24ucHJvdG90eXBlLmV4dGVybmFsTm9Ecm9wID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVHdWkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyc7XHJcbn07XHJcblxyXG5DaGVja2JveFNlbGVjdGlvbi5wcm90b3R5cGUuYWRkSXRlbVRvTGlzdCA9IGZ1bmN0aW9uKG5ld0l0ZW0pIHtcclxuICAgIHRoaXMubW9kZWwucHVzaChuZXdJdGVtKTtcclxuICAgIHRoaXMucmVmcmVzaFZpZXcoKTtcclxuICAgIHRoaXMuZmlyZU1vZGVsQ2hhbmdlZCgpO1xyXG59O1xyXG5cclxuQ2hlY2tib3hTZWxlY3Rpb24ucHJvdG90eXBlLmFkZERyYWdBbmREcm9wVG9MaXN0SXRlbSA9IGZ1bmN0aW9uKGVMaXN0SXRlbSwgaXRlbSkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgZHJhZ0FuZERyb3BTZXJ2aWNlLmFkZERyYWdTb3VyY2UoZUxpc3RJdGVtLCB7XHJcbiAgICAgICAgZ2V0RGF0YTogZnVuY3Rpb24oKSB7IHJldHVybiBpdGVtOyB9LFxyXG4gICAgICAgIGdldENvbnRhaW5lcklkOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoYXQudW5pcXVlSWQ7IH1cclxuICAgIH0pO1xyXG4gICAgZHJhZ0FuZERyb3BTZXJ2aWNlLmFkZERyb3BUYXJnZXQoZUxpc3RJdGVtLCB7XHJcbiAgICAgICAgYWNjZXB0RHJhZzogZnVuY3Rpb24gKGRyYWdJdGVtKSB7IHJldHVybiB0aGF0LmludGVybmFsQWNjZXB0RHJhZyhpdGVtLCBkcmFnSXRlbSwgZUxpc3RJdGVtKTsgfSxcclxuICAgICAgICBkcm9wOiBmdW5jdGlvbiAoZHJhZ0l0ZW0pIHsgdGhhdC5pbnRlcm5hbERyb3AoaXRlbSwgZHJhZ0l0ZW0uZGF0YSk7IH0sXHJcbiAgICAgICAgbm9Ecm9wOiBmdW5jdGlvbiAoKSB7IHRoYXQuaW50ZXJuYWxOb0Ryb3AoZUxpc3RJdGVtKTsgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5DaGVja2JveFNlbGVjdGlvbi5wcm90b3R5cGUuaW50ZXJuYWxBY2NlcHREcmFnID0gZnVuY3Rpb24odGFyZ2V0Q29sdW1uLCBkcmFnSXRlbSwgZUxpc3RJdGVtKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gZHJhZ0l0ZW0uZGF0YSAhPT0gdGFyZ2V0Q29sdW1uICYmIGRyYWdJdGVtLmNvbnRhaW5lcklkID09PSB0aGlzLnVuaXF1ZUlkO1xyXG4gICAgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRyYWdBZnRlclRoaXNJdGVtKHRhcmdldENvbHVtbiwgZHJhZ0l0ZW0uZGF0YSkpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXREcm9wQ3NzQ2xhc3NlcyhlTGlzdEl0ZW0sIERST1BfVEFSR0VUX0FCT1ZFKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNldERyb3BDc3NDbGFzc2VzKGVMaXN0SXRlbSwgRFJPUF9UQVJHRVRfQkVMT1cpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5DaGVja2JveFNlbGVjdGlvbi5wcm90b3R5cGUuaW50ZXJuYWxEcm9wID0gZnVuY3Rpb24odGFyZ2V0Q29sdW1uLCBkcmFnZ2VkQ29sdW1uKSB7XHJcbiAgICB2YXIgb2xkSW5kZXggPSB0aGlzLm1vZGVsLmluZGV4T2YoZHJhZ2dlZENvbHVtbik7XHJcbiAgICB2YXIgbmV3SW5kZXggPSB0aGlzLm1vZGVsLmluZGV4T2YodGFyZ2V0Q29sdW1uKTtcclxuXHJcbiAgICB0aGlzLm1vZGVsLnNwbGljZShvbGRJbmRleCwgMSk7XHJcbiAgICB0aGlzLm1vZGVsLnNwbGljZShuZXdJbmRleCwgMCwgZHJhZ2dlZENvbHVtbik7XHJcblxyXG4gICAgdGhpcy5yZWZyZXNoVmlldygpO1xyXG4gICAgdGhpcy5maXJlTW9kZWxDaGFuZ2VkKCk7XHJcbn07XHJcblxyXG5DaGVja2JveFNlbGVjdGlvbi5wcm90b3R5cGUuaW50ZXJuYWxOb0Ryb3AgPSBmdW5jdGlvbihlTGlzdEl0ZW0pIHtcclxuICAgIHRoaXMuc2V0RHJvcENzc0NsYXNzZXMoZUxpc3RJdGVtLCBOT1RfRFJPUF9UQVJHRVQpO1xyXG59O1xyXG5cclxuQ2hlY2tib3hTZWxlY3Rpb24ucHJvdG90eXBlLmRyYWdBZnRlclRoaXNJdGVtID0gZnVuY3Rpb24odGFyZ2V0Q29sdW1uLCBkcmFnZ2VkQ29sdW1uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbC5pbmRleE9mKHRhcmdldENvbHVtbikgPCB0aGlzLm1vZGVsLmluZGV4T2YoZHJhZ2dlZENvbHVtbik7XHJcbn07XHJcblxyXG5DaGVja2JveFNlbGVjdGlvbi5wcm90b3R5cGUuc2V0RHJvcENzc0NsYXNzZXMgPSBmdW5jdGlvbihlTGlzdEl0ZW0sIHN0YXRlKSB7XHJcbiAgICB1dGlscy5hZGRPclJlbW92ZUNzc0NsYXNzKGVMaXN0SXRlbSwgJ2FnLW5vdC1kcm9wLXRhcmdldCcsIHN0YXRlID09PSBOT1RfRFJPUF9UQVJHRVQpO1xyXG4gICAgdXRpbHMuYWRkT3JSZW1vdmVDc3NDbGFzcyhlTGlzdEl0ZW0sICdhZy1kcm9wLXRhcmdldC1hYm92ZScsIHN0YXRlID09PSBEUk9QX1RBUkdFVF9BQk9WRSk7XHJcbiAgICB1dGlscy5hZGRPclJlbW92ZUNzc0NsYXNzKGVMaXN0SXRlbSwgJ2FnLWRyb3AtdGFyZ2V0LWJlbG93Jywgc3RhdGUgPT09IERST1BfVEFSR0VUX0JFTE9XKTtcclxufTtcclxuXHJcbkNoZWNrYm94U2VsZWN0aW9uLnByb3RvdHlwZS5nZXRHdWkgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmVHdWk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENoZWNrYm94U2VsZWN0aW9uO1xyXG4iXX0=
