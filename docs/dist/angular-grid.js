/**
 * angular-grid - High performance and feature rich data grid for AngularJS
 * @version v1.11.1
 * @link http://www.angulargrid.com/
 * @license MIT
 */
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var FUNCTION_STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        var FUNCTION_ARGUMENT_NAMES = /([^\s,]+)/g;
        var Utils = (function () {
            function Utils() {
            }
            Utils.iterateObject = function (object, callback) {
                var keys = Object.keys(object);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var value = object[key];
                    callback(key, value);
                }
            };
            Utils.map = function (array, callback) {
                var result = [];
                for (var i = 0; i < array.length; i++) {
                    var item = array[i];
                    var mappedItem = callback(item);
                    result.push(mappedItem);
                }
                return result;
            };
            Utils.forEach = function (array, callback) {
                if (!array) {
                    return;
                }
                for (var i = 0; i < array.length; i++) {
                    var value = array[i];
                    callback(value, i);
                }
            };
            Utils.getFunctionParameters = function (func) {
                var fnStr = func.toString().replace(FUNCTION_STRIP_COMMENTS, '');
                var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(FUNCTION_ARGUMENT_NAMES);
                if (result === null) {
                    return [];
                }
                else {
                    return result;
                }
            };
            Utils.find = function (collection, predicate, value) {
                if (collection === null || collection === undefined) {
                    return null;
                }
                for (var i = 0; i < collection.length; i++) {
                    if (collection[i][predicate] === value) {
                        return collection[i];
                    }
                }
                return null;
            };
            Utils.toStrings = function (array) {
                return this.map(array, function (item) {
                    if (item === undefined || item === null || !item.toString) {
                        return null;
                    }
                    else {
                        return item.toString();
                    }
                });
            };
            Utils.iterateArray = function (array, callback) {
                for (var index = 0; index < array.length; index++) {
                    var value = array[index];
                    callback(value, index);
                }
            };
            Utils.getValue = function (expressionService, data, colDef, node, api, context) {
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
                    }
                    else if (typeof valueGetter === 'string') {
                        // valueGetter is an expression, so execute the expression
                        return expressionService.evaluate(valueGetter, params);
                    }
                }
                else if (field && data) {
                    return data[field];
                }
                else {
                    return undefined;
                }
            };
            //Returns true if it is a DOM node
            //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
            Utils.isNode = function (o) {
                return (typeof Node === "object" ? o instanceof Node : o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string");
            };
            //Returns true if it is a DOM element
            //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
            Utils.isElement = function (o) {
                return (typeof HTMLElement === "object" ? o instanceof HTMLElement : o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string");
            };
            Utils.isNodeOrElement = function (o) {
                return this.isNode(o) || this.isElement(o);
            };
            //adds all type of change listeners to an element, intended to be a text field
            Utils.addChangeListener = function (element, listener) {
                element.addEventListener("changed", listener);
                element.addEventListener("paste", listener);
                element.addEventListener("input", listener);
            };
            //if value is undefined, null or blank, returns null, otherwise returns the value
            Utils.makeNull = function (value) {
                if (value === null || value === undefined || value === "") {
                    return null;
                }
                else {
                    return value;
                }
            };
            Utils.removeAllChildren = function (node) {
                if (node) {
                    while (node.hasChildNodes()) {
                        node.removeChild(node.lastChild);
                    }
                }
            };
            Utils.isVisible = function (element) {
                return (element.offsetParent !== null);
            };
            //loads the template and returns it as an element. makes up for no simple way in
            //the dom api to load html directly, eg we cannot do this: document.createElement(template)
            Utils.loadTemplate = function (template) {
                var tempDiv = document.createElement("div");
                tempDiv.innerHTML = template;
                return tempDiv.firstChild;
            };
            //if passed '42px' then returns the number 42
            //        pixelStringToNumber(val: any) {
            //            if (typeof val === "string") {
            //                if (val.indexOf("px") >= 0) {
            //                    val.replace("px", "");
            //                }
            //                return parseInt(val);
            //            } else {
            //                return val;
            //            }
            //        }
            Utils.querySelectorAll_addCssClass = function (eParent, selector, cssClass) {
                var eRows = eParent.querySelectorAll(selector);
                for (var k = 0; k < eRows.length; k++) {
                    this.addCssClass(eRows[k], cssClass);
                }
            };
            Utils.querySelectorAll_removeCssClass = function (eParent, selector, cssClass) {
                var eRows = eParent.querySelectorAll(selector);
                for (var k = 0; k < eRows.length; k++) {
                    this.removeCssClass(eRows[k], cssClass);
                }
            };
            Utils.querySelectorAll_replaceCssClass = function (eParent, selector, cssClassToRemove, cssClassToAdd) {
                var eRows = eParent.querySelectorAll(selector);
                for (var k = 0; k < eRows.length; k++) {
                    this.removeCssClass(eRows[k], cssClassToRemove);
                    this.addCssClass(eRows[k], cssClassToAdd);
                }
            };
            Utils.addOrRemoveCssClass = function (element, className, addOrRemove) {
                if (addOrRemove) {
                    this.addCssClass(element, className);
                }
                else {
                    this.removeCssClass(element, className);
                }
            };
            Utils.addCssClass = function (element, className) {
                if (element.className && element.className.length > 0) {
                    var cssClasses = element.className.split(' ');
                    if (cssClasses.indexOf(className) < 0) {
                        cssClasses.push(className);
                        element.className = cssClasses.join(' ');
                    }
                }
                else {
                    element.className = className;
                }
            };
            Utils.offsetHeight = function (element) {
                return element && element.clientHeight ? element.clientHeight : 0;
            };
            Utils.offsetWidth = function (element) {
                return element && element.clientWidth ? element.clientWidth : 0;
            };
            Utils.removeCssClass = function (element, className) {
                if (element.className && element.className.length > 0) {
                    var cssClasses = element.className.split(' ');
                    var index = cssClasses.indexOf(className);
                    if (index >= 0) {
                        cssClasses.splice(index, 1);
                        element.className = cssClasses.join(' ');
                    }
                }
            };
            Utils.removeFromArray = function (array, object) {
                array.splice(array.indexOf(object), 1);
            };
            Utils.defaultComparator = function (valueA, valueB) {
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
                }
                else if (valueA > valueB) {
                    return 1;
                }
                else {
                    return 0;
                }
            };
            Utils.formatWidth = function (width) {
                if (typeof width === "number") {
                    return width + "px";
                }
                else {
                    return width;
                }
            };
            // tries to use the provided renderer. if a renderer found, returns true.
            // if no renderer, returns false.
            Utils.useRenderer = function (eParent, eRenderer, params) {
                var resultFromRenderer = eRenderer(params);
                if (this.isNode(resultFromRenderer) || this.isElement(resultFromRenderer)) {
                    //a dom node or element was returned, so add child
                    eParent.appendChild(resultFromRenderer);
                }
                else {
                    //otherwise assume it was html, so just insert
                    var eTextSpan = document.createElement('span');
                    eTextSpan.innerHTML = resultFromRenderer;
                    eParent.appendChild(eTextSpan);
                }
            };
            // if icon provided, use this (either a string, or a function callback).
            // if not, then use the second parameter, which is the svgFactory function
            Utils.createIcon = function (iconName, gridOptionsWrapper, colDefWrapper, svgFactoryFunc) {
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
                    }
                    else if (typeof userProvidedIcon === 'string') {
                        rendererResult = userProvidedIcon;
                    }
                    else {
                        throw 'icon from grid options needs to be a string or a function';
                    }
                    if (typeof rendererResult === 'string') {
                        eResult.innerHTML = rendererResult;
                    }
                    else if (this.isNodeOrElement(rendererResult)) {
                        eResult.appendChild(rendererResult);
                    }
                    else {
                        throw 'iconRenderer should return back a string or a dom object';
                    }
                }
                else {
                    // otherwise we use the built in icon
                    eResult.appendChild(svgFactoryFunc());
                }
                return eResult;
            };
            Utils.addStylesToElement = function (eElement, styles) {
                Object.keys(styles).forEach(function (key) {
                    eElement.style[key] = styles[key];
                });
            };
            Utils.getScrollbarWidth = function () {
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
            Utils.isKeyPressed = function (event, keyToCheck) {
                var pressedKey = event.which || event.keyCode;
                return pressedKey === keyToCheck;
            };
            Utils.setVisible = function (element, visible) {
                if (visible) {
                    element.style.display = 'inline';
                }
                else {
                    element.style.display = 'none';
                }
            };
            return Utils;
        })();
        grid.Utils = Utils;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var Constants = (function () {
            function Constants() {
            }
            Constants.STEP_EVERYTHING = 0;
            Constants.STEP_FILTER = 1;
            Constants.STEP_SORT = 2;
            Constants.STEP_MAP = 3;
            Constants.ASC = "asc";
            Constants.DESC = "desc";
            Constants.ROW_BUFFER_SIZE = 20;
            Constants.MIN_COL_WIDTH = 10;
            Constants.SUM = 'sum';
            Constants.MIN = 'min';
            Constants.MAX = 'max';
            Constants.KEY_TAB = 9;
            Constants.KEY_ENTER = 13;
            Constants.KEY_SPACE = 32;
            Constants.KEY_DOWN = 40;
            Constants.KEY_UP = 38;
            Constants.KEY_LEFT = 37;
            Constants.KEY_RIGHT = 39;
            return Constants;
        })();
        grid.Constants = Constants;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="utils.ts" />
/// <reference path="constants.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var constants = grid.Constants;
        var ColumnController = (function () {
            function ColumnController() {
                this.listeners = [];
                this.createModel();
            }
            ColumnController.prototype.init = function (angularGrid, selectionRendererFactory, gridOptionsWrapper, expressionService) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.angularGrid = angularGrid;
                this.selectionRendererFactory = selectionRendererFactory;
                this.expressionService = expressionService;
            };
            ColumnController.prototype.createModel = function () {
                var that = this;
                this.model = {
                    // used by:
                    // + inMemoryRowController -> sorting, building quick filter text
                    // + headerRenderer -> sorting (clearing icon)
                    getAllColumns: function () {
                        return that.allColumns;
                    },
                    // + rowController -> while inserting rows, and when tabbing through cells (need to change this)
                    // need a newMethod - get next col index
                    getDisplayedColumns: function () {
                        return that.displayedColumns;
                    },
                    // + toolPanel
                    getGroupedColumns: function () {
                        return that.pivotColumns;
                    },
                    // + rowController
                    getValueColumns: function () {
                        return that.valueColumns;
                    },
                    // used by:
                    // + angularGrid -> for setting body width
                    // + rowController -> setting main row widths (when inserting and resizing)
                    getBodyContainerWidth: function () {
                        return that.getTotalColWidth(false);
                    },
                    // used by:
                    // + angularGrid -> setting pinned body width
                    getPinnedContainerWidth: function () {
                        return that.getTotalColWidth(true);
                    },
                    // used by:
                    // + headerRenderer -> setting pinned body width
                    getHeaderGroups: function () {
                        return that.headerGroups;
                    },
                    // used by:
                    // + api.getFilterModel() -> to map colDef to column, key can be colDef or field
                    getColumn: function (key) {
                        return that.getColumn(key);
                    },
                    // used by:
                    // + rowRenderer -> for navigation
                    getVisibleColBefore: function (col) {
                        var oldIndex = that.visibleColumns.indexOf(col);
                        if (oldIndex > 0) {
                            return that.visibleColumns[oldIndex - 1];
                        }
                        else {
                            return null;
                        }
                    },
                    // used by:
                    // + rowRenderer -> for navigation
                    getVisibleColAfter: function (col) {
                        var oldIndex = that.visibleColumns.indexOf(col);
                        if (oldIndex < (that.visibleColumns.length - 1)) {
                            return that.visibleColumns[oldIndex + 1];
                        }
                        else {
                            return null;
                        }
                    },
                    getDisplayNameForCol: function (column) {
                        return that.getDisplayNameForCol(column);
                    }
                };
            };
            ColumnController.prototype.getState = function () {
                if (!this.allColumns || this.allColumns.length < 0) {
                    return [];
                }
                var result = [];
                for (var i = 0; i < this.allColumns.length; i++) {
                    var column = this.allColumns[i];
                    var pivotIndex = this.pivotColumns.indexOf(column);
                    var resultItem = {
                        colId: column.colId,
                        hide: !column.visible,
                        aggFunc: column.aggFunc ? column.aggFunc : null,
                        width: column.actualWidth,
                        pivotIndex: pivotIndex >= 0 ? pivotIndex : null
                    };
                    result.push(resultItem);
                }
                return result;
            };
            ColumnController.prototype.setState = function (columnState) {
                var oldColumnList = this.allColumns;
                this.allColumns = [];
                this.pivotColumns = [];
                this.valueColumns = [];
                var that = this;
                _.forEach(columnState, function (stateItem) {
                    var oldColumn = _.find(oldColumnList, 'colId', stateItem.colId);
                    if (!oldColumn) {
                        console.warn('ag-grid: column ' + stateItem.colId + ' not found');
                        return;
                    }
                    // following ensures we are left with boolean true or false, eg converts (null, undefined, 0) all to true
                    oldColumn.visible = stateItem.hide ? false : true;
                    // if width provided and valid, use it, otherwise stick with the old width
                    oldColumn.actualWidth = stateItem.width >= constants.MIN_COL_WIDTH ? stateItem.width : oldColumn.actualWidth;
                    // accept agg func only if valid
                    var aggFuncValid = [constants.MIN, constants.MAX, constants.SUM].indexOf(stateItem.aggFunc) >= 0;
                    if (aggFuncValid) {
                        oldColumn.aggFunc = stateItem.aggFunc;
                        that.valueColumns.push(oldColumn);
                    }
                    else {
                        oldColumn.aggFunc = null;
                    }
                    // if pivot
                    if (typeof stateItem.pivotIndex === 'number' && stateItem.pivotIndex >= 0) {
                        that.pivotColumns.push(oldColumn);
                    }
                    that.allColumns.push(oldColumn);
                    oldColumnList.splice(oldColumnList.indexOf(oldColumn), 1);
                });
                // anything left over, we got no data for, so add in the column as non-value, non-pivot and hidden
                _.forEach(oldColumnList, function (oldColumn) {
                    oldColumn.visible = false;
                    oldColumn.aggFunc = null;
                    that.allColumns.push(oldColumn);
                });
                this.pivotColumns.sort(function (colA, colB) {
                    return colA.pivotIndex < colB.pivotIndex;
                });
                this.updateModel();
                this.fireColumnsChanged();
            };
            ColumnController.prototype.getColumn = function (key) {
                for (var i = 0; i < this.allColumns.length; i++) {
                    var colDefMatches = this.allColumns[i].colDef === key;
                    var fieldMatches = this.allColumns[i].colDef.field === key;
                    if (colDefMatches || fieldMatches) {
                        return this.allColumns[i];
                    }
                }
            };
            ColumnController.prototype.getDisplayNameForCol = function (column) {
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
                    }
                    else if (typeof headerValueGetter === 'string') {
                        // valueGetter is an expression, so execute the expression
                        return this.expressionService.evaluate(headerValueGetter, params);
                    }
                    return _.getValue(this.expressionService, undefined, colDef);
                }
                else if (colDef.displayName) {
                    console.warn("ag-grid: Found displayName " + colDef.displayName + ", please use headerName instead, displayName is deprecated.");
                    return colDef.displayName;
                }
                else {
                    return colDef.headerName;
                }
            };
            ColumnController.prototype.addListener = function (listener) {
                this.listeners.push(listener);
            };
            ColumnController.prototype.fireColumnsChanged = function () {
                for (var i = 0; i < this.listeners.length; i++) {
                    this.listeners[i].columnsChanged(this.allColumns, this.pivotColumns, this.valueColumns);
                }
            };
            ColumnController.prototype.getModel = function () {
                return this.model;
            };
            // called by angularGrid
            ColumnController.prototype.setColumns = function (columnDefs) {
                this.checkForDeprecatedItems(columnDefs);
                this.createColumns(columnDefs);
                this.createPivotColumns();
                this.createValueColumns();
                this.updateModel();
                this.fireColumnsChanged();
            };
            ColumnController.prototype.checkForDeprecatedItems = function (columnDefs) {
                if (columnDefs) {
                    for (var i = 0; i < columnDefs.length; i++) {
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
            ColumnController.prototype.headerGroupOpened = function (group) {
                group.expanded = !group.expanded;
                this.updateGroups();
                this.updateDisplayedColumns();
                this.angularGrid.refreshHeaderAndBody();
            };
            // called by toolPanel - when change in columns happens
            ColumnController.prototype.onColumnStateChanged = function () {
                this.updateModel();
                this.angularGrid.refreshHeaderAndBody();
            };
            // called from API
            ColumnController.prototype.hideColumns = function (colIds, hide) {
                for (var i = 0; i < this.allColumns.length; i++) {
                    var idThisCol = this.allColumns[i].colId;
                    var hideThisCol = colIds.indexOf(idThisCol) >= 0;
                    if (hideThisCol) {
                        this.allColumns[i].visible = !hide;
                    }
                }
                this.onColumnStateChanged();
                this.fireColumnsChanged(); // to tell toolbar
            };
            ColumnController.prototype.updateModel = function () {
                this.updateVisibleColumns();
                this.updatePinnedColumns();
                this.buildGroups();
                this.updateGroups();
                this.updateDisplayedColumns();
            };
            ColumnController.prototype.updateDisplayedColumns = function () {
                if (!this.gridOptionsWrapper.isGroupHeaders()) {
                    // if not grouping by headers, then pull visible cols
                    this.displayedColumns = this.visibleColumns;
                }
                else {
                    // if grouping, then only show col as per group rules
                    this.displayedColumns = [];
                    for (var i = 0; i < this.headerGroups.length; i++) {
                        var group = this.headerGroups[i];
                        group.addToVisibleColumns(this.displayedColumns);
                    }
                }
            };
            // public - called from api
            ColumnController.prototype.sizeColumnsToFit = function (gridWidth) {
                // avoid divide by zero
                if (gridWidth <= 0 || this.displayedColumns.length === 0) {
                    return;
                }
                var columnStartWidth = 0; // will contain the starting total width of the cols been spread
                var colsToSpread = []; // all visible cols, except those with avoidSizeToFit
                var widthForSpreading = gridWidth; // grid width minus the columns we are not resizing
                for (var j = 0; j < this.displayedColumns.length; j++) {
                    if (this.displayedColumns[j].colDef.suppressSizeToFit === true) {
                        // don't include col, and remove the width from teh available width
                        widthForSpreading -= this.displayedColumns[j].actualWidth;
                    }
                    else {
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
                for (var i = 0; i < (colsToSpread.length - 1); i++) {
                    var column = colsToSpread[i];
                    var newWidth = Math.round(column.actualWidth * scale);
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
            ColumnController.prototype.buildGroups = function () {
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
                this.visibleColumns.forEach(function (column) {
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
                        currentGroup = new HeaderGroup(pinned, column.colDef.headerGroup);
                        that.headerGroups.push(currentGroup);
                    }
                    currentGroup.addColumn(column);
                });
            };
            ColumnController.prototype.updateGroups = function () {
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
            ColumnController.prototype.updateVisibleColumns = function () {
                this.visibleColumns = [];
                // see if we need to insert the default grouping column
                var needAGroupColumn = this.pivotColumns.length > 0 && !this.gridOptionsWrapper.isGroupSuppressAutoColumn() && !this.gridOptionsWrapper.isGroupUseEntireRow();
                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                if (needAGroupColumn) {
                    // if one provided by user, use it, otherwise create one
                    var groupColDef = this.gridOptionsWrapper.getGroupColumnDef();
                    if (!groupColDef) {
                        groupColDef = {
                            headerName: localeTextFunc('group', 'Group'),
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
                    var hideBecauseOfPivot = this.pivotColumns.indexOf(column) >= 0 && this.gridOptionsWrapper.isGroupHidePivotColumns();
                    if (column.visible && !hideBecauseOfPivot) {
                        column.index = this.visibleColumns.length;
                        this.visibleColumns.push(this.allColumns[i]);
                    }
                }
            };
            ColumnController.prototype.updatePinnedColumns = function () {
                var pinnedColumnCount = this.gridOptionsWrapper.getPinnedColCount();
                for (var i = 0; i < this.visibleColumns.length; i++) {
                    var pinned = i < pinnedColumnCount;
                    this.visibleColumns[i].pinned = pinned;
                }
            };
            ColumnController.prototype.createColumns = function (columnDefs) {
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
            ColumnController.prototype.createPivotColumns = function () {
                this.pivotColumns = [];
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
                    this.pivotColumns.push(column);
                }
            };
            ColumnController.prototype.createValueColumns = function () {
                this.valueColumns = [];
                for (var i = 0; i < this.allColumns.length; i++) {
                    var column = this.allColumns[i];
                    if (column.colDef.aggFunc) {
                        column.aggFunc = column.colDef.aggFunc;
                        this.valueColumns.push(column);
                    }
                }
            };
            ColumnController.prototype.createDummyColumn = function (field) {
                var colDef = {
                    field: field,
                    headerName: field,
                    hide: false
                };
                var width = this.gridOptionsWrapper.getColWidth();
                var column = new Column(colDef, width);
                return column;
            };
            ColumnController.prototype.calculateColInitialWidth = function (colDef) {
                if (!colDef.width) {
                    // if no width defined in colDef, use default
                    return this.gridOptionsWrapper.getColWidth();
                }
                else if (colDef.width < constants.MIN_COL_WIDTH) {
                    // if width in col def to small, set to min width
                    return constants.MIN_COL_WIDTH;
                }
                else {
                    // otherwise use the provided width
                    return colDef.width;
                }
            };
            // private
            // call with true (pinned), false (not-pinned) or undefined (all columns)
            ColumnController.prototype.getTotalColWidth = function (includePinned) {
                var widthSoFar = 0;
                var pinedNotImportant = typeof includePinned !== 'boolean';
                this.displayedColumns.forEach(function (column) {
                    var includeThisCol = pinedNotImportant || column.pinned === includePinned;
                    if (includeThisCol) {
                        widthSoFar += column.actualWidth;
                    }
                });
                return widthSoFar;
            };
            return ColumnController;
        })();
        grid.ColumnController = ColumnController;
        var HeaderGroup = (function () {
            function HeaderGroup(pinned, name) {
                this.allColumns = [];
                this.displayedColumns = [];
                this.expandable = false;
                this.expanded = false;
                this.pinned = pinned;
                this.name = name;
            }
            HeaderGroup.prototype.addColumn = function (column) {
                this.allColumns.push(column);
            };
            // need to check that this group has at least one col showing when both expanded and contracted.
            // if not, then we don't allow expanding and contracting on this group
            HeaderGroup.prototype.calculateExpandable = function () {
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
                    }
                    else if (column.colDef.headerGroupShow === 'closed') {
                        atLeastOneShowingWhenClosed = true;
                        atLeastOneChangeable = true;
                    }
                    else {
                        atLeastOneShowingWhenOpen = true;
                        atLeastOneShowingWhenClosed = true;
                    }
                }
                this.expandable = atLeastOneShowingWhenOpen && atLeastOneShowingWhenClosed && atLeastOneChangeable;
            };
            HeaderGroup.prototype.calculateDisplayedColumns = function () {
                // clear out last time we calculated
                this.displayedColumns = [];
                // it not expandable, everything is visible
                if (!this.expandable) {
                    this.displayedColumns = this.allColumns;
                    return;
                }
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
            HeaderGroup.prototype.addToVisibleColumns = function (colsToAdd) {
                for (var i = 0; i < this.displayedColumns.length; i++) {
                    var column = this.displayedColumns[i];
                    colsToAdd.push(column);
                }
            };
            return HeaderGroup;
        })();
        var Column = (function () {
            function Column(colDef, actualWidth) {
                this.colDef = colDef;
                this.actualWidth = actualWidth;
                this.visible = !colDef.hide;
                // in the future, the colKey might be something other than the index
                if (colDef.colId) {
                    this.colId = colDef.colId;
                }
                else if (colDef.field) {
                    this.colId = colDef.field;
                }
                else {
                    this.colId = '' + Column.colIdSequence++;
                }
            }
            Column.colIdSequence = 0;
            return Column;
        })();
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var ExpressionService = (function () {
            function ExpressionService() {
                this.expressionToFunctionCache = {};
            }
            ExpressionService.prototype.evaluate = function (expression, params) {
                try {
                    var javaScriptFunction = this.createExpressionFunction(expression);
                    var result = javaScriptFunction(params.value, params.context, params.node, params.data, params.colDef, params.rowIndex, params.api);
                    return result;
                }
                catch (e) {
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
                }
                else {
                    return 'return ' + expression + ';';
                }
            };
            return ExpressionService;
        })();
        grid.ExpressionService = ExpressionService;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="constants.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var DEFAULT_ROW_HEIGHT = 30;
        var constants = grid.Constants;
        function isTrue(value) {
            return value === true || value === 'true';
        }
        var GridOptionsWrapper = (function () {
            function GridOptionsWrapper(gridOptions) {
                this.gridOptions = gridOptions;
                this.setupDefaults();
            }
            GridOptionsWrapper.prototype.isRowSelection = function () {
                return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple";
            };
            GridOptionsWrapper.prototype.isRowDeselection = function () {
                return isTrue(this.gridOptions.rowDeselection);
            };
            GridOptionsWrapper.prototype.isRowSelectionMulti = function () {
                return this.gridOptions.rowSelection === 'multiple';
            };
            GridOptionsWrapper.prototype.getContext = function () {
                return this.gridOptions.context;
            };
            GridOptionsWrapper.prototype.isVirtualPaging = function () {
                return isTrue(this.gridOptions.virtualPaging);
            };
            GridOptionsWrapper.prototype.isShowToolPanel = function () {
                return isTrue(this.gridOptions.showToolPanel);
            };
            GridOptionsWrapper.prototype.isToolPanelSuppressPivot = function () {
                return isTrue(this.gridOptions.toolPanelSuppressPivot);
            };
            GridOptionsWrapper.prototype.isToolPanelSuppressValues = function () {
                return isTrue(this.gridOptions.toolPanelSuppressValues);
            };
            GridOptionsWrapper.prototype.isRowsAlreadyGrouped = function () {
                return isTrue(this.gridOptions.rowsAlreadyGrouped);
            };
            GridOptionsWrapper.prototype.isGroupSelectsChildren = function () {
                return isTrue(this.gridOptions.groupSelectsChildren);
            };
            GridOptionsWrapper.prototype.isGroupHidePivotColumns = function () {
                return isTrue(this.gridOptions.groupHidePivotColumns);
            };
            GridOptionsWrapper.prototype.isGroupIncludeFooter = function () {
                return isTrue(this.gridOptions.groupIncludeFooter);
            };
            GridOptionsWrapper.prototype.isSuppressRowClickSelection = function () {
                return isTrue(this.gridOptions.suppressRowClickSelection);
            };
            GridOptionsWrapper.prototype.isSuppressCellSelection = function () {
                return isTrue(this.gridOptions.suppressCellSelection);
            };
            GridOptionsWrapper.prototype.isSuppressUnSort = function () {
                return isTrue(this.gridOptions.suppressUnSort);
            };
            GridOptionsWrapper.prototype.isSuppressMultiSort = function () {
                return isTrue(this.gridOptions.suppressMultiSort);
            };
            GridOptionsWrapper.prototype.isGroupSuppressAutoColumn = function () {
                return isTrue(this.gridOptions.groupSuppressAutoColumn);
            };
            GridOptionsWrapper.prototype.isGroupHeaders = function () {
                return isTrue(this.gridOptions.groupHeaders);
            };
            GridOptionsWrapper.prototype.isDontUseScrolls = function () {
                return isTrue(this.gridOptions.dontUseScrolls);
            };
            GridOptionsWrapper.prototype.isSuppressDescSort = function () {
                return isTrue(this.gridOptions.suppressDescSort);
            };
            GridOptionsWrapper.prototype.isUnSortIcon = function () {
                return isTrue(this.gridOptions.unSortIcon);
            };
            GridOptionsWrapper.prototype.getRowStyle = function () {
                return this.gridOptions.rowStyle;
            };
            GridOptionsWrapper.prototype.getRowClass = function () {
                return this.gridOptions.rowClass;
            };
            GridOptionsWrapper.prototype.getHeaderCellRenderer = function () {
                return this.gridOptions.headerCellRenderer;
            };
            GridOptionsWrapper.prototype.getApi = function () {
                return this.gridOptions.api;
            };
            GridOptionsWrapper.prototype.isEnableColResize = function () {
                return isTrue(this.gridOptions.enableColResize);
            };
            GridOptionsWrapper.prototype.getGroupDefaultExpanded = function () {
                return this.gridOptions.groupDefaultExpanded;
            };
            GridOptionsWrapper.prototype.getGroupKeys = function () {
                return this.gridOptions.groupKeys;
            };
            GridOptionsWrapper.prototype.getGroupAggFunction = function () {
                return this.gridOptions.groupAggFunction;
            };
            GridOptionsWrapper.prototype.getGroupAggFields = function () {
                return this.gridOptions.groupAggFields;
            };
            GridOptionsWrapper.prototype.getAllRows = function () {
                return this.gridOptions.rowData;
            };
            GridOptionsWrapper.prototype.isGroupUseEntireRow = function () {
                return isTrue(this.gridOptions.groupUseEntireRow);
            };
            GridOptionsWrapper.prototype.getGroupColumnDef = function () {
                return this.gridOptions.groupColumnDef;
            };
            GridOptionsWrapper.prototype.isAngularCompileRows = function () {
                return isTrue(this.gridOptions.angularCompileRows);
            };
            GridOptionsWrapper.prototype.isAngularCompileFilters = function () {
                return isTrue(this.gridOptions.angularCompileFilters);
            };
            GridOptionsWrapper.prototype.isAngularCompileHeaders = function () {
                return isTrue(this.gridOptions.angularCompileHeaders);
            };
            GridOptionsWrapper.prototype.getColumnDefs = function () {
                return this.gridOptions.columnDefs;
            };
            GridOptionsWrapper.prototype.getRowHeight = function () {
                return this.gridOptions.rowHeight;
            };
            GridOptionsWrapper.prototype.getModelUpdated = function () {
                return this.gridOptions.modelUpdated;
            };
            GridOptionsWrapper.prototype.getCellClicked = function () {
                return this.gridOptions.cellClicked;
            };
            GridOptionsWrapper.prototype.getCellDoubleClicked = function () {
                return this.gridOptions.cellDoubleClicked;
            };
            GridOptionsWrapper.prototype.getCellValueChanged = function () {
                return this.gridOptions.cellValueChanged;
            };
            GridOptionsWrapper.prototype.getCellFocused = function () {
                return this.gridOptions.cellFocused;
            };
            GridOptionsWrapper.prototype.getRowSelected = function () {
                return this.gridOptions.rowSelected;
            };
            GridOptionsWrapper.prototype.getSelectionChanged = function () {
                return this.gridOptions.selectionChanged;
            };
            GridOptionsWrapper.prototype.getVirtualRowRemoved = function () {
                return this.gridOptions.virtualRowRemoved;
            };
            GridOptionsWrapper.prototype.getDatasource = function () {
                return this.gridOptions.datasource;
            };
            GridOptionsWrapper.prototype.getReady = function () {
                return this.gridOptions.ready;
            };
            GridOptionsWrapper.prototype.getRowBuffer = function () {
                return this.gridOptions.rowBuffer;
            };
            GridOptionsWrapper.prototype.isEnableSorting = function () {
                return isTrue(this.gridOptions.enableSorting) || isTrue(this.gridOptions.enableServerSideSorting);
            };
            GridOptionsWrapper.prototype.isEnableServerSideSorting = function () {
                return isTrue(this.gridOptions.enableServerSideSorting);
            };
            GridOptionsWrapper.prototype.isEnableFilter = function () {
                return isTrue(this.gridOptions.enableFilter) || isTrue(this.gridOptions.enableServerSideFilter);
            };
            GridOptionsWrapper.prototype.isEnableServerSideFilter = function () {
                return this.gridOptions.enableServerSideFilter;
            };
            GridOptionsWrapper.prototype.setSelectedRows = function (newSelectedRows) {
                return this.gridOptions.selectedRows = newSelectedRows;
            };
            GridOptionsWrapper.prototype.setSelectedNodesById = function (newSelectedNodes) {
                return this.gridOptions.selectedNodesById = newSelectedNodes;
            };
            GridOptionsWrapper.prototype.getIcons = function () {
                return this.gridOptions.icons;
            };
            GridOptionsWrapper.prototype.getGroupRowInnerRenderer = function () {
                if (this.gridOptions.groupInnerRenderer) {
                    console.warn('ag-grid: as of v1.10.0 (21st Jun 2015) groupInnerRenderer is now called groupRowInnerRenderer. Please change you code as groupInnerRenderer is deprecated.');
                    return this.gridOptions.groupInnerRenderer;
                }
                else {
                    return this.gridOptions.groupRowInnerRenderer;
                }
            };
            GridOptionsWrapper.prototype.getColWidth = function () {
                if (typeof this.gridOptions.colWidth !== 'number' || this.gridOptions.colWidth < constants.MIN_COL_WIDTH) {
                    return 200;
                }
                else {
                    return this.gridOptions.colWidth;
                }
            };
            GridOptionsWrapper.prototype.getHeaderHeight = function () {
                if (typeof this.gridOptions.headerHeight === 'number') {
                    // if header height provided, used it
                    return this.gridOptions.headerHeight;
                }
                else {
                    // otherwise return 25 if no grouping, 50 if grouping
                    if (this.isGroupHeaders()) {
                        return 50;
                    }
                    else {
                        return 25;
                    }
                }
            };
            GridOptionsWrapper.prototype.setupDefaults = function () {
                if (!this.gridOptions.rowHeight) {
                    this.gridOptions.rowHeight = DEFAULT_ROW_HEIGHT;
                }
            };
            GridOptionsWrapper.prototype.getPinnedColCount = function () {
                // if not using scrolls, then pinned columns doesn't make
                // sense, so always return 0
                if (this.isDontUseScrolls()) {
                    return 0;
                }
                if (this.gridOptions.pinnedColumnCount) {
                    //in case user puts in a string, cast to number
                    return Number(this.gridOptions.pinnedColumnCount);
                }
                else {
                    return 0;
                }
            };
            GridOptionsWrapper.prototype.getLocaleTextFunc = function () {
                var that = this;
                return function (key, defaultValue) {
                    var localeText = that.gridOptions.localeText;
                    if (localeText && localeText[key]) {
                        return localeText[key];
                    }
                    else {
                        return defaultValue;
                    }
                };
            };
            return GridOptionsWrapper;
        })();
        grid.GridOptionsWrapper = GridOptionsWrapper;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../utils.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var template = '<div>' + '<div>' + '<select class="ag-filter-select" id="filterType">' + '<option value="1">[CONTAINS]</option>' + '<option value="2">[EQUALS]</option>' + '<option value="3">[STARTS WITH]</option>' + '<option value="4">[ENDS WITH]</option>' + '</select>' + '</div>' + '<div>' + '<input class="ag-filter-filter" id="filterText" type="text" placeholder="[FILTER...]"/>' + '</div>' + '</div>';
        var CONTAINS = 1;
        var EQUALS = 2;
        var STARTS_WITH = 3;
        var ENDS_WITH = 4;
        var TextFilter = (function () {
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
            TextFilter.prototype.onNewRowsLoaded = function () {
                var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
                if (!keepSelection) {
                    this.api.setType(CONTAINS);
                    this.api.setFilter(null);
                }
            };
            /* public */
            TextFilter.prototype.afterGuiAttached = function () {
                this.eFilterTextField.focus();
            };
            /* public */
            TextFilter.prototype.doesFilterPass = function (node) {
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
            TextFilter.prototype.getGui = function () {
                return this.eGui;
            };
            /* public */
            TextFilter.prototype.isFilterActive = function () {
                return this.filterText !== null;
            };
            TextFilter.prototype.createTemplate = function () {
                return template.replace('[FILTER...]', this.localeTextFunc('filterOoo', 'Filter...')).replace('[EQUALS]', this.localeTextFunc('equals', 'Equals')).replace('[CONTAINS]', this.localeTextFunc('contains', 'Contains')).replace('[STARTS WITH]', this.localeTextFunc('startsWith', 'Starts with')).replace('[ENDS WITH]', this.localeTextFunc('endsWith', 'Ends with'));
            };
            TextFilter.prototype.createGui = function () {
                this.eGui = utils.loadTemplate(this.createTemplate());
                this.eFilterTextField = this.eGui.querySelector("#filterText");
                this.eTypeSelect = this.eGui.querySelector("#filterType");
                utils.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
                this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));
            };
            TextFilter.prototype.onTypeChanged = function () {
                this.filterType = parseInt(this.eTypeSelect.value);
                this.filterChangedCallback();
            };
            TextFilter.prototype.onFilterChanged = function () {
                var filterText = utils.makeNull(this.eFilterTextField.value);
                if (filterText && filterText.trim() === '') {
                    filterText = null;
                }
                if (filterText) {
                    this.filterText = filterText.toLowerCase();
                }
                else {
                    this.filterText = null;
                }
                this.filterChangedCallback();
            };
            TextFilter.prototype.createApi = function () {
                var that = this;
                this.api = {
                    EQUALS: EQUALS,
                    CONTAINS: CONTAINS,
                    STARTS_WITH: STARTS_WITH,
                    ENDS_WITH: ENDS_WITH,
                    setType: function (type) {
                        that.filterType = type;
                        that.eTypeSelect.value = type;
                    },
                    setFilter: function (filter) {
                        filter = utils.makeNull(filter);
                        if (filter) {
                            that.filterText = filter.toLowerCase();
                            that.eFilterTextField.value = filter;
                        }
                        else {
                            that.filterText = null;
                            that.eFilterTextField.value = null;
                        }
                    },
                    getType: function () {
                        return that.filterType;
                    },
                    getFilter: function () {
                        return that.filterText;
                    },
                    getModel: function () {
                        if (that.isFilterActive()) {
                            return {
                                type: that.filterType,
                                filter: that.filterText
                            };
                        }
                        else {
                            return null;
                        }
                    },
                    setModel: function (dataModel) {
                        if (dataModel) {
                            this.setType(dataModel.type);
                            this.setFilter(dataModel.filter);
                        }
                        else {
                            this.setFilter(null);
                        }
                    }
                };
            };
            TextFilter.prototype.getApi = function () {
                return this.api;
            };
            return TextFilter;
        })();
        grid.TextFilter = TextFilter;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../utils.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var template = '<div>' + '<div>' + '<select class="ag-filter-select" id="filterType">' + '<option value="1">[EQUALS]</option>' + '<option value="2">[LESS THAN]</option>' + '<option value="3">[GREATER THAN]</option>' + '</select>' + '</div>' + '<div>' + '<input class="ag-filter-filter" id="filterText" type="text" placeholder="[FILTER...]"/>' + '</div>' + '</div>';
        var EQUALS = 1;
        var LESS_THAN = 2;
        var GREATER_THAN = 3;
        var NumberFilter = (function () {
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
            NumberFilter.prototype.onNewRowsLoaded = function () {
                var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
                if (!keepSelection) {
                    this.api.setType(EQUALS);
                    this.api.setFilter(null);
                }
            };
            /* public */
            NumberFilter.prototype.afterGuiAttached = function () {
                this.eFilterTextField.focus();
            };
            /* public */
            NumberFilter.prototype.doesFilterPass = function (node) {
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
                }
                else {
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
            NumberFilter.prototype.getGui = function () {
                return this.eGui;
            };
            /* public */
            NumberFilter.prototype.isFilterActive = function () {
                return this.filterNumber !== null;
            };
            NumberFilter.prototype.createTemplate = function () {
                return template.replace('[FILTER...]', this.localeTextFunc('filterOoo', 'Filter...')).replace('[EQUALS]', this.localeTextFunc('equals', 'Equals')).replace('[LESS THAN]', this.localeTextFunc('lessThan', 'Less than')).replace('[GREATER THAN]', this.localeTextFunc('greaterThan', 'Greater than'));
            };
            NumberFilter.prototype.createGui = function () {
                this.eGui = utils.loadTemplate(this.createTemplate());
                this.eFilterTextField = this.eGui.querySelector("#filterText");
                this.eTypeSelect = this.eGui.querySelector("#filterType");
                utils.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
                this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));
            };
            NumberFilter.prototype.onTypeChanged = function () {
                this.filterType = parseInt(this.eTypeSelect.value);
                this.filterChangedCallback();
            };
            NumberFilter.prototype.onFilterChanged = function () {
                var filterText = utils.makeNull(this.eFilterTextField.value);
                if (filterText && filterText.trim() === '') {
                    filterText = null;
                }
                if (filterText) {
                    this.filterNumber = parseFloat(filterText);
                }
                else {
                    this.filterNumber = null;
                }
                this.filterChangedCallback();
            };
            NumberFilter.prototype.createApi = function () {
                var that = this;
                this.api = {
                    EQUALS: EQUALS,
                    LESS_THAN: LESS_THAN,
                    GREATER_THAN: GREATER_THAN,
                    setType: function (type) {
                        that.filterType = type;
                        that.eTypeSelect.value = type;
                    },
                    setFilter: function (filter) {
                        filter = utils.makeNull(filter);
                        if (filter !== null && !(typeof filter === 'number')) {
                            filter = parseFloat(filter);
                        }
                        that.filterNumber = filter;
                        that.eFilterTextField.value = filter;
                    },
                    getType: function () {
                        return that.filterType;
                    },
                    getFilter: function () {
                        return that.filterNumber;
                    },
                    getModel: function () {
                        if (that.isFilterActive()) {
                            return {
                                type: that.filterType,
                                filter: that.filterNumber
                            };
                        }
                        else {
                            return null;
                        }
                    },
                    setModel: function (dataModel) {
                        if (dataModel) {
                            this.setType(dataModel.type);
                            this.setFilter(dataModel.filter);
                        }
                        else {
                            this.setFilter(null);
                        }
                    }
                };
            };
            NumberFilter.prototype.getApi = function () {
                return this.api;
            };
            return NumberFilter;
        })();
        grid.NumberFilter = NumberFilter;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../utils.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var SetFilterModel = (function () {
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
            SetFilterModel.prototype.refreshUniqueValues = function (keepSelection) {
                this.createUniqueValues();
                var oldModel = Object.keys(this.selectedValuesMap);
                this.selectedValuesMap = {};
                this.filterDisplayedValues();
                if (keepSelection) {
                    this.setModel(oldModel);
                }
                else {
                    this.selectEverything();
                }
            };
            SetFilterModel.prototype.createUniqueValues = function () {
                if (this.colDef.filterParams && this.colDef.filterParams.values) {
                    this.uniqueValues = utils.toStrings(this.colDef.filterParams.values);
                }
                else {
                    this.uniqueValues = utils.toStrings(this.iterateThroughNodesForValues());
                }
                if (this.colDef.comparator) {
                    this.uniqueValues.sort(this.colDef.comparator);
                }
                else {
                    this.uniqueValues.sort(utils.defaultComparator);
                }
            };
            SetFilterModel.prototype.iterateThroughNodesForValues = function () {
                var uniqueCheck = {};
                var result = [];
                var that = this;
                function recursivelyProcess(nodes) {
                    for (var i = 0; i < nodes.length; i++) {
                        var node = nodes[i];
                        if (node.group && !node.footer) {
                            // group node, so dig deeper
                            recursivelyProcess(node.children);
                        }
                        else {
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
            SetFilterModel.prototype.setMiniFilter = function (newMiniFilter) {
                newMiniFilter = utils.makeNull(newMiniFilter);
                if (this.miniFilter === newMiniFilter) {
                    //do nothing if filter has not changed
                    return false;
                }
                this.miniFilter = newMiniFilter;
                this.filterDisplayedValues();
                return true;
            };
            SetFilterModel.prototype.getMiniFilter = function () {
                return this.miniFilter;
            };
            SetFilterModel.prototype.filterDisplayedValues = function () {
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
            SetFilterModel.prototype.getDisplayedValueCount = function () {
                return this.displayedValues.length;
            };
            SetFilterModel.prototype.getDisplayedValue = function (index) {
                return this.displayedValues[index];
            };
            SetFilterModel.prototype.selectEverything = function () {
                var count = this.uniqueValues.length;
                for (var i = 0; i < count; i++) {
                    var value = this.uniqueValues[i];
                    this.selectedValuesMap[value] = null;
                }
                this.selectedValuesCount = count;
            };
            SetFilterModel.prototype.isFilterActive = function () {
                return this.uniqueValues.length !== this.selectedValuesCount;
            };
            SetFilterModel.prototype.selectNothing = function () {
                this.selectedValuesMap = {};
                this.selectedValuesCount = 0;
            };
            SetFilterModel.prototype.getUniqueValueCount = function () {
                return this.uniqueValues.length;
            };
            SetFilterModel.prototype.getUniqueValue = function (index) {
                return this.uniqueValues[index];
            };
            SetFilterModel.prototype.unselectValue = function (value) {
                if (this.selectedValuesMap[value] !== undefined) {
                    delete this.selectedValuesMap[value];
                    this.selectedValuesCount--;
                }
            };
            SetFilterModel.prototype.selectValue = function (value) {
                if (this.selectedValuesMap[value] === undefined) {
                    this.selectedValuesMap[value] = null;
                    this.selectedValuesCount++;
                }
            };
            SetFilterModel.prototype.isValueSelected = function (value) {
                return this.selectedValuesMap[value] !== undefined;
            };
            SetFilterModel.prototype.isEverythingSelected = function () {
                return this.uniqueValues.length === this.selectedValuesCount;
            };
            SetFilterModel.prototype.isNothingSelected = function () {
                return this.uniqueValues.length === 0;
            };
            SetFilterModel.prototype.getModel = function () {
                if (!this.isFilterActive()) {
                    return null;
                }
                var selectedValues = [];
                utils.iterateObject(this.selectedValuesMap, function (key) {
                    selectedValues.push(key);
                });
                return selectedValues;
            };
            SetFilterModel.prototype.setModel = function (model) {
                if (model) {
                    this.selectNothing();
                    for (var i = 0; i < model.length; i++) {
                        var newValue = model[i];
                        if (this.uniqueValues.indexOf(newValue) >= 0) {
                            this.selectValue(model[i]);
                        }
                        else {
                            console.warn('Value ' + newValue + ' is not a valid value for filter');
                        }
                    }
                }
                else {
                    this.selectEverything();
                }
            };
            return SetFilterModel;
        })();
        grid.SetFilterModel = SetFilterModel;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../utils.ts" />
/// <reference path="setFilterModel.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var template = '<div>' + '<div class="ag-filter-header-container">' + '<input class="ag-filter-filter" type="text" placeholder="[SEARCH...]"/>' + '</div>' + '<div class="ag-filter-header-container">' + '<label>' + '<input id="selectAll" type="checkbox" class="ag-filter-checkbox"/>' + '([SELECT ALL])' + '</label>' + '</div>' + '<div class="ag-filter-list-viewport">' + '<div class="ag-filter-list-container">' + '<div id="itemForRepeat" class="ag-filter-item">' + '<label>' + '<input type="checkbox" class="ag-filter-checkbox" filter-checkbox="true"/>' + '<span class="ag-filter-value"></span>' + '</label>' + '</div>' + '</div>' + '</div>' + '</div>';
        var DEFAULT_ROW_HEIGHT = 20;
        var SetFilter = (function () {
            function SetFilter(params) {
                this.filterParams = params.filterParams;
                this.rowHeight = (this.filterParams && this.filterParams.cellHeight) ? this.filterParams.cellHeight : DEFAULT_ROW_HEIGHT;
                this.model = new grid.SetFilterModel(params.colDef, params.rowModel, params.valueGetter);
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
            SetFilter.prototype.afterGuiAttached = function () {
                this.drawVirtualRows();
            };
            /* public */
            SetFilter.prototype.isFilterActive = function () {
                return this.model.isFilterActive();
            };
            /* public */
            SetFilter.prototype.doesFilterPass = function (node) {
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
            SetFilter.prototype.getGui = function () {
                return this.eGui;
            };
            /* public */
            SetFilter.prototype.onNewRowsLoaded = function () {
                var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
                // default is reset
                this.model.refreshUniqueValues(keepSelection);
                this.setContainerHeight();
                this.refreshVirtualRows();
            };
            SetFilter.prototype.createTemplate = function () {
                return template.replace('[SELECT ALL]', this.localeTextFunc('selectAll', 'Select All')).replace('[SEARCH...]', this.localeTextFunc('searchOoo', 'Search...'));
            };
            SetFilter.prototype.createGui = function () {
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
                utils.addChangeListener(this.eMiniFilter, function () {
                    _this.onMiniFilterChanged();
                });
                utils.removeAllChildren(this.eListContainer);
                this.eSelectAll.onclick = this.onSelectAll.bind(this);
                if (this.model.isEverythingSelected()) {
                    this.eSelectAll.indeterminate = false;
                    this.eSelectAll.checked = true;
                }
                else if (this.model.isNothingSelected()) {
                    this.eSelectAll.indeterminate = false;
                    this.eSelectAll.checked = false;
                }
                else {
                    this.eSelectAll.indeterminate = true;
                }
            };
            SetFilter.prototype.setContainerHeight = function () {
                this.eListContainer.style.height = (this.model.getDisplayedValueCount() * this.rowHeight) + "px";
            };
            SetFilter.prototype.drawVirtualRows = function () {
                var topPixel = this.eListViewport.scrollTop;
                var bottomPixel = topPixel + this.eListViewport.offsetHeight;
                var firstRow = Math.floor(topPixel / this.rowHeight);
                var lastRow = Math.floor(bottomPixel / this.rowHeight);
                this.ensureRowsRendered(firstRow, lastRow);
            };
            SetFilter.prototype.ensureRowsRendered = function (start, finish) {
                var _this = this;
                //at the end, this array will contain the items we need to remove
                var rowsToRemove = Object.keys(this.rowsInBodyContainer);
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
            SetFilter.prototype.removeVirtualRows = function (rowsToRemove) {
                var _this = this;
                rowsToRemove.forEach(function (indexToRemove) {
                    var eRowToRemove = _this.rowsInBodyContainer[indexToRemove];
                    _this.eListContainer.removeChild(eRowToRemove);
                    delete _this.rowsInBodyContainer[indexToRemove];
                });
            };
            SetFilter.prototype.insertRow = function (value, rowIndex) {
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
                    }
                    else {
                        //otherwise assume it was html, so just insert
                        valueElement.innerHTML = resultFromRenderer;
                    }
                }
                else {
                    //otherwise display as a string
                    var blanksText = '(' + this.localeTextFunc('blanks', 'Blanks') + ')';
                    var displayNameOfValue = value === null ? blanksText : value;
                    valueElement.innerHTML = displayNameOfValue;
                }
                var eCheckbox = eFilterValue.querySelector("input");
                eCheckbox.checked = this.model.isValueSelected(value);
                eCheckbox.onclick = function () {
                    _this.onCheckboxClicked(eCheckbox, value);
                };
                eFilterValue.style.top = (this.rowHeight * rowIndex) + "px";
                this.eListContainer.appendChild(eFilterValue);
                this.rowsInBodyContainer[rowIndex] = eFilterValue;
            };
            SetFilter.prototype.onCheckboxClicked = function (eCheckbox, value) {
                var checked = eCheckbox.checked;
                if (checked) {
                    this.model.selectValue(value);
                    if (this.model.isEverythingSelected()) {
                        this.eSelectAll.indeterminate = false;
                        this.eSelectAll.checked = true;
                    }
                    else {
                        this.eSelectAll.indeterminate = true;
                    }
                }
                else {
                    this.model.unselectValue(value);
                    //if set is empty, nothing is selected
                    if (this.model.isNothingSelected()) {
                        this.eSelectAll.indeterminate = false;
                        this.eSelectAll.checked = false;
                    }
                    else {
                        this.eSelectAll.indeterminate = true;
                    }
                }
                this.filterChangedCallback();
            };
            SetFilter.prototype.onMiniFilterChanged = function () {
                var miniFilterChanged = this.model.setMiniFilter(this.eMiniFilter.value);
                if (miniFilterChanged) {
                    this.setContainerHeight();
                    this.refreshVirtualRows();
                }
            };
            SetFilter.prototype.refreshVirtualRows = function () {
                this.clearVirtualRows();
                this.drawVirtualRows();
            };
            SetFilter.prototype.clearVirtualRows = function () {
                var rowsToRemove = Object.keys(this.rowsInBodyContainer);
                this.removeVirtualRows(rowsToRemove);
            };
            SetFilter.prototype.onSelectAll = function () {
                var checked = this.eSelectAll.checked;
                if (checked) {
                    this.model.selectEverything();
                }
                else {
                    this.model.selectNothing();
                }
                this.updateAllCheckboxes(checked);
                this.filterChangedCallback();
            };
            SetFilter.prototype.updateAllCheckboxes = function (checked) {
                var currentlyDisplayedCheckboxes = this.eListContainer.querySelectorAll("[filter-checkbox=true]");
                for (var i = 0, l = currentlyDisplayedCheckboxes.length; i < l; i++) {
                    currentlyDisplayedCheckboxes[i].checked = checked;
                }
            };
            SetFilter.prototype.addScrollListener = function () {
                var _this = this;
                this.eListViewport.addEventListener("scroll", function () {
                    _this.drawVirtualRows();
                });
            };
            SetFilter.prototype.getApi = function () {
                return this.api;
            };
            SetFilter.prototype.createApi = function () {
                var model = this.model;
                var that = this;
                this.api = {
                    setMiniFilter: function (newMiniFilter) {
                        model.setMiniFilter(newMiniFilter);
                    },
                    getMiniFilter: function () {
                        return model.getMiniFilter();
                    },
                    selectEverything: function () {
                        model.selectEverything();
                    },
                    isFilterActive: function () {
                        return model.isFilterActive();
                    },
                    selectNothing: function () {
                        model.selectNothing();
                    },
                    unselectValue: function (value) {
                        model.unselectValue(value);
                        that.refreshVirtualRows();
                    },
                    selectValue: function (value) {
                        model.selectValue(value);
                        that.refreshVirtualRows();
                    },
                    isValueSelected: function (value) {
                        return model.isValueSelected(value);
                    },
                    isEverythingSelected: function () {
                        return model.isEverythingSelected();
                    },
                    isNothingSelected: function () {
                        return model.isNothingSelected();
                    },
                    getUniqueValueCount: function () {
                        return model.getUniqueValueCount();
                    },
                    getUniqueValue: function (index) {
                        return model.getUniqueValue(index);
                    },
                    getModel: function () {
                        return model.getModel();
                    },
                    setModel: function (dataModel) {
                        model.setModel(dataModel);
                        that.refreshVirtualRows();
                    }
                };
            };
            return SetFilter;
        })();
        grid.SetFilter = SetFilter;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../utils.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var PopupService = (function () {
            function PopupService() {
            }
            PopupService.getInstance = function () {
                if (!this.theInstance) {
                    this.theInstance = new PopupService();
                }
                return this.theInstance;
            };
            PopupService.prototype.init = function (ePopupParent) {
                this.ePopupParent = ePopupParent;
            };
            PopupService.prototype.positionPopup = function (eventSource, ePopup, minWidth) {
                var sourceRect = eventSource.getBoundingClientRect();
                var parentRect = this.ePopupParent.getBoundingClientRect();
                var x = sourceRect.left - parentRect.left;
                var y = sourceRect.top - parentRect.top + sourceRect.height;
                // if popup is overflowing to the right, move it left
                if (minWidth > 0) {
                    var widthOfParent = parentRect.right - parentRect.left;
                    var maxX = widthOfParent - minWidth;
                    if (x > maxX) {
                        x = maxX;
                    }
                    if (x < 0) {
                        x = 0;
                    }
                }
                ePopup.style.left = x + "px";
                ePopup.style.top = y + "px";
            };
            //adds an element to a div, but also listens to background checking for clicks,
            //so that when the background is clicked, the child is removed again, giving
            //a model look to popups.
            PopupService.prototype.addAsModalPopup = function (eChild) {
                var eBody = document.body;
                if (!eBody) {
                    console.warn('ag-grid: could not find the body of the document, document.body is empty');
                    return;
                }
                var popupAlreadyShown = _.isVisible(eChild);
                if (popupAlreadyShown) {
                    return;
                }
                this.ePopupParent.appendChild(eChild);
                // if we add these listeners now, then the current mouse
                // click will be included, which we don't want
                setTimeout(function () {
                    eBody.addEventListener('click', hidePopup);
                    eChild.addEventListener('click', consumeClick);
                }, 0);
                var eventFromChild = null;
                var that = this;
                function hidePopup(event) {
                    if (event && event === eventFromChild) {
                        return;
                    }
                    that.ePopupParent.removeChild(eChild);
                    eBody.removeEventListener('click', hidePopup);
                    eChild.removeEventListener('click', consumeClick);
                }
                function consumeClick(event) {
                    eventFromChild = event;
                }
                return hidePopup;
            };
            return PopupService;
        })();
        grid.PopupService = PopupService;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../utils.ts" />
/// <reference path="textFilter.ts" />
/// <reference path="numberFilter.ts" />
/// <reference path="setFilter.ts" />
/// <reference path="../widgets/agPopupService.ts" />
var awk;
(function (awk) {
    var grid;
    (function (_grid) {
        var agPopupService = _grid.PopupService.getInstance();
        var utils = _grid.Utils;
        var FilterManager = (function () {
            function FilterManager() {
            }
            FilterManager.prototype.init = function (grid, gridOptionsWrapper, $compile, $scope, expressionService, columnModel) {
                this.$compile = $compile;
                this.$scope = $scope;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.grid = grid;
                this.allFilters = {};
                this.expressionService = expressionService;
                this.columnModel = columnModel;
            };
            FilterManager.prototype.setFilterModel = function (model) {
                var that = this;
                if (model) {
                    // mark the filters as we set them, so any active filters left over we stop
                    var processedFields = Object.keys(model);
                    utils.iterateObject(this.allFilters, function (key, filterWrapper) {
                        var field = filterWrapper.column.colDef.field;
                        utils.removeFromArray(processedFields, field);
                        if (field) {
                            var newModel = model[field];
                            that.setModelOnFilterWrapper(filterWrapper.filter, newModel);
                        }
                        else {
                            console.warn('Warning ag-grid - no field found for column while doing setFilterModel');
                        }
                    });
                    // at this point, processedFields contains data for which we don't have a filter working yet
                    utils.iterateArray(processedFields, function (field) {
                        var column = that.columnModel.getColumn(field);
                        if (!column) {
                            console.warn('Warning ag-grid - no column found for field ' + field);
                            return;
                        }
                        var filterWrapper = that.getOrCreateFilterWrapper(column);
                        that.setModelOnFilterWrapper(filterWrapper.filter, model[field]);
                    });
                }
                else {
                    utils.iterateObject(this.allFilters, function (key, filterWrapper) {
                        that.setModelOnFilterWrapper(filterWrapper.filter, null);
                    });
                }
            };
            FilterManager.prototype.setModelOnFilterWrapper = function (filter, newModel) {
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
            FilterManager.prototype.getFilterModel = function () {
                var result = {};
                utils.iterateObject(this.allFilters, function (key, filterWrapper) {
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
                        }
                        else {
                            result[field] = model;
                        }
                    }
                });
                return result;
            };
            FilterManager.prototype.setRowModel = function (rowModel) {
                this.rowModel = rowModel;
            };
            // returns true if at least one filter is active
            FilterManager.prototype.isFilterPresent = function () {
                var atLeastOneActive = false;
                var that = this;
                var keys = Object.keys(this.allFilters);
                keys.forEach(function (key) {
                    var filterWrapper = that.allFilters[key];
                    if (!filterWrapper.filter.isFilterActive) {
                        console.error('Filter is missing method isFilterActive');
                    }
                    if (filterWrapper.filter.isFilterActive()) {
                        atLeastOneActive = true;
                    }
                });
                return atLeastOneActive;
            };
            // returns true if given col has a filter active
            FilterManager.prototype.isFilterPresentForCol = function (colId) {
                var filterWrapper = this.allFilters[colId];
                if (!filterWrapper) {
                    return false;
                }
                if (!filterWrapper.filter.isFilterActive) {
                    console.error('Filter is missing method isFilterActive');
                }
                var filterPresent = filterWrapper.filter.isFilterActive();
                return filterPresent;
            };
            FilterManager.prototype.doesFilterPass = function (node) {
                var data = node.data;
                var colKeys = Object.keys(this.allFilters);
                for (var i = 0, l = colKeys.length; i < l; i++) {
                    var colId = colKeys[i];
                    var filterWrapper = this.allFilters[colId];
                    // if no filter, always pass
                    if (filterWrapper === undefined) {
                        continue;
                    }
                    if (!filterWrapper.filter.doesFilterPass) {
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
            FilterManager.prototype.onNewRowsLoaded = function () {
                var that = this;
                Object.keys(this.allFilters).forEach(function (field) {
                    var filter = that.allFilters[field].filter;
                    if (filter.onNewRowsLoaded) {
                        filter.onNewRowsLoaded();
                    }
                });
            };
            FilterManager.prototype.createValueGetter = function (colDef) {
                var that = this;
                return function valueGetter(node) {
                    var api = that.gridOptionsWrapper.getApi();
                    var context = that.gridOptionsWrapper.getContext();
                    return utils.getValue(that.expressionService, node.data, colDef, node, api, context);
                };
            };
            FilterManager.prototype.getFilterApi = function (column) {
                var filterWrapper = this.getOrCreateFilterWrapper(column);
                if (filterWrapper) {
                    if (typeof filterWrapper.filter.getApi === 'function') {
                        return filterWrapper.filter.getApi();
                    }
                }
            };
            FilterManager.prototype.getOrCreateFilterWrapper = function (column) {
                var filterWrapper = this.allFilters[column.colId];
                if (!filterWrapper) {
                    filterWrapper = this.createFilterWrapper(column);
                    this.allFilters[column.colId] = filterWrapper;
                }
                return filterWrapper;
            };
            FilterManager.prototype.createFilterWrapper = function (column) {
                var colDef = column.colDef;
                var filterWrapper = {
                    column: column,
                    filter: null,
                    scope: null,
                    gui: null
                };
                var filterChangedCallback = this.grid.onFilterChanged.bind(this.grid);
                var filterParams = colDef.filterParams;
                var params = {
                    colDef: colDef,
                    rowModel: this.rowModel,
                    filterChangedCallback: filterChangedCallback,
                    filterParams: filterParams,
                    localeTextFunc: this.gridOptionsWrapper.getLocaleTextFunc(),
                    valueGetter: this.createValueGetter(colDef),
                    $scope: null
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
                }
                else if (colDef.filter === 'text') {
                    filterWrapper.filter = new _grid.TextFilter(params);
                }
                else if (colDef.filter === 'number') {
                    filterWrapper.filter = new _grid.NumberFilter(params);
                }
                else {
                    filterWrapper.filter = new _grid.SetFilter(params);
                }
                if (!filterWrapper.filter.getGui) {
                    throw 'Filter is missing method getGui';
                }
                var eFilterGui = document.createElement('div');
                eFilterGui.className = 'ag-filter';
                var guiFromFilter = filterWrapper.filter.getGui();
                if (utils.isNodeOrElement(guiFromFilter)) {
                    //a dom node or element was returned, so add child
                    eFilterGui.appendChild(guiFromFilter);
                }
                else {
                    //otherwise assume it was html, so just insert
                    var eTextSpan = document.createElement('span');
                    eTextSpan.innerHTML = guiFromFilter;
                    eFilterGui.appendChild(eTextSpan);
                }
                if (filterWrapper.scope) {
                    filterWrapper.gui = this.$compile(eFilterGui)(filterWrapper.scope)[0];
                }
                else {
                    filterWrapper.gui = eFilterGui;
                }
                return filterWrapper;
            };
            FilterManager.prototype.showFilter = function (column, eventSource) {
                var filterWrapper = this.getOrCreateFilterWrapper(column);
                agPopupService.positionPopup(eventSource, filterWrapper.gui, 200);
                agPopupService.addAsModalPopup(filterWrapper.gui);
                if (filterWrapper.filter.afterGuiAttached) {
                    filterWrapper.filter.afterGuiAttached();
                }
            };
            return FilterManager;
        })();
        _grid.FilterManager = FilterManager;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="utils.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        // these constants are used for determining if groups should
        // be selected or deselected when selecting groups, and the group
        // then selects the children.
        var SELECTED = 0;
        var UNSELECTED = 1;
        var MIXED = 2;
        var DO_NOT_CARE = 3;
        var SelectionController = (function () {
            function SelectionController() {
            }
            SelectionController.prototype.init = function (angularGrid, gridPanel, gridOptionsWrapper, $scope, rowRenderer) {
                this.eRowsParent = gridPanel.getRowsParent();
                this.angularGrid = angularGrid;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.$scope = $scope;
                this.rowRenderer = rowRenderer;
                this.initSelectedNodesById();
                this.selectedRows = [];
                gridOptionsWrapper.setSelectedRows(this.selectedRows);
            };
            SelectionController.prototype.initSelectedNodesById = function () {
                this.selectedNodesById = {};
                this.gridOptionsWrapper.setSelectedNodesById(this.selectedNodesById);
            };
            SelectionController.prototype.getSelectedNodes = function () {
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
            SelectionController.prototype.getBestCostNodeSelection = function () {
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
                        }
                        else {
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
            SelectionController.prototype.setRowModel = function (rowModel) {
                this.rowModel = rowModel;
            };
            // public - this clears the selection, but doesn't clear down the css - when it is called, the
            // caller then gets the grid to refresh.
            SelectionController.prototype.deselectAll = function () {
                this.initSelectedNodesById();
                //var keys = Object.keys(this.selectedNodesById);
                //for (var i = 0; i < keys.length; i++) {
                //    delete this.selectedNodesById[keys[i]];
                //}
                this.syncSelectedRowsAndCallListener();
            };
            // public - this selects everything, but doesn't clear down the css - when it is called, the
            // caller then gets the grid to refresh.
            SelectionController.prototype.selectAll = function () {
                if (typeof this.rowModel.getTopLevelNodes !== 'function') {
                    throw 'selectAll not available when rows are on the server';
                }
                var selectedNodesById = this.selectedNodesById;
                // if the selection is "don't include groups", then we don't include them!
                var includeGroups = !this.gridOptionsWrapper.isGroupSelectsChildren();
                function recursivelySelect(nodes) {
                    if (nodes) {
                        for (var i = 0; i < nodes.length; i++) {
                            var node = nodes[i];
                            if (node.group) {
                                recursivelySelect(node.children);
                                if (includeGroups) {
                                    selectedNodesById[node.id] = node;
                                }
                            }
                            else {
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
            SelectionController.prototype.selectNode = function (node, tryMulti, suppressEvents) {
                var multiSelect = this.gridOptionsWrapper.isRowSelectionMulti() && tryMulti;
                // if the node is a group, then selecting this is the same as selecting the parent,
                // so to have only one flow through the below, we always select the header parent
                // (which then has the side effect of selecting the child).
                var nodeToSelect;
                if (node.footer) {
                    nodeToSelect = node.sibling;
                }
                else {
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
                }
                else {
                    // see if row needs to be selected
                    atLeastOneItemSelected = this.doWorkOfSelectNode(nodeToSelect, suppressEvents);
                }
                if (atLeastOneItemUnselected || atLeastOneItemSelected) {
                    this.syncSelectedRowsAndCallListener(suppressEvents);
                }
                this.updateGroupParentsIfNeeded();
            };
            SelectionController.prototype.recursivelySelectAllChildren = function (node, suppressEvents) {
                var atLeastOne = false;
                if (node.children) {
                    for (var i = 0; i < node.children.length; i++) {
                        var child = node.children[i];
                        if (child.group) {
                            if (this.recursivelySelectAllChildren(child)) {
                                atLeastOne = true;
                            }
                        }
                        else {
                            if (this.doWorkOfSelectNode(child, suppressEvents)) {
                                atLeastOne = true;
                            }
                        }
                    }
                }
                return atLeastOne;
            };
            SelectionController.prototype.recursivelyDeselectAllChildren = function (node) {
                if (node.children) {
                    for (var i = 0; i < node.children.length; i++) {
                        var child = node.children[i];
                        if (child.group) {
                            this.recursivelyDeselectAllChildren(child);
                        }
                        else {
                            this.deselectRealNode(child);
                        }
                    }
                }
            };
            // private
            // 1 - selects a node
            // 2 - updates the UI
            // 3 - calls callbacks
            SelectionController.prototype.doWorkOfSelectNode = function (node, suppressEvents) {
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
            SelectionController.prototype.addCssClassForNode_andInformVirtualRowListener = function (node) {
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
            SelectionController.prototype.doWorkOfDeselectAllNodes = function (nodeToKeepSelected) {
                // not doing multi-select, so deselect everything other than the 'just selected' row
                var atLeastOneSelectionChange;
                var selectedNodeKeys = Object.keys(this.selectedNodesById);
                for (var i = 0; i < selectedNodeKeys.length; i++) {
                    // skip the 'just selected' row
                    var key = selectedNodeKeys[i];
                    var nodeToDeselect = this.selectedNodesById[key];
                    if (nodeToDeselect === nodeToKeepSelected) {
                        continue;
                    }
                    else {
                        this.deselectRealNode(nodeToDeselect);
                        atLeastOneSelectionChange = true;
                    }
                }
                return atLeastOneSelectionChange;
            };
            // private
            SelectionController.prototype.deselectRealNode = function (node) {
                // deselect the css
                this.removeCssClassForNode(node);
                // if node is a header, and if it has a sibling footer, deselect the footer also
                if (node.group && node.expanded && node.sibling) {
                    this.removeCssClassForNode(node.sibling);
                }
                // remove the row
                delete this.selectedNodesById[node.id];
            };
            // private
            SelectionController.prototype.removeCssClassForNode = function (node) {
                var virtualRenderedRowIndex = this.rowRenderer.getIndexOfRenderedNode(node);
                if (virtualRenderedRowIndex >= 0) {
                    utils.querySelectorAll_removeCssClass(this.eRowsParent, '[row="' + virtualRenderedRowIndex + '"]', 'ag-row-selected');
                    // inform virtual row listener
                    this.angularGrid.onVirtualRowSelected(virtualRenderedRowIndex, false);
                }
            };
            // public (selectionRendererFactory)
            SelectionController.prototype.deselectIndex = function (rowIndex) {
                var node = this.rowModel.getVirtualRow(rowIndex);
                this.deselectNode(node);
            };
            // public (api)
            SelectionController.prototype.deselectNode = function (node) {
                if (node) {
                    if (this.gridOptionsWrapper.isGroupSelectsChildren() && node.group) {
                        // want to deselect children, not this node, so recursively deselect
                        this.recursivelyDeselectAllChildren(node);
                    }
                    else {
                        this.deselectRealNode(node);
                    }
                }
                this.syncSelectedRowsAndCallListener();
                this.updateGroupParentsIfNeeded();
            };
            // public (selectionRendererFactory & api)
            SelectionController.prototype.selectIndex = function (index, tryMulti, suppressEvents) {
                var node = this.rowModel.getVirtualRow(index);
                this.selectNode(node, tryMulti, suppressEvents);
            };
            // private
            // updates the selectedRows with the selectedNodes and calls selectionChanged listener
            SelectionController.prototype.syncSelectedRowsAndCallListener = function (suppressEvents) {
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
                    setTimeout(function () {
                        that.$scope.$apply();
                    }, 0);
                }
            };
            // private
            SelectionController.prototype.recursivelyCheckIfSelected = function (node) {
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
                            }
                        }
                        else {
                            if (this.isNodeSelected(child)) {
                                foundSelected = true;
                            }
                            else {
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
                }
                else if (foundUnselected) {
                    return UNSELECTED;
                }
                else {
                    return DO_NOT_CARE;
                }
            };
            // public (selectionRendererFactory)
            // returns:
            // true: if selected
            // false: if unselected
            // undefined: if it's a group and 'children selection' is used and 'children' are a mix of selected and unselected
            SelectionController.prototype.isNodeSelected = function (node) {
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
                }
                else {
                    return this.selectedNodesById[node.id] !== undefined;
                }
            };
            SelectionController.prototype.updateGroupParentsIfNeeded = function () {
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
                        }
                        else {
                            utils.querySelectorAll_removeCssClass(this.eRowsParent, '[row="' + rowIndex + '"]', 'ag-row-selected');
                        }
                    }
                }
            };
            return SelectionController;
        })();
        grid.SelectionController = SelectionController;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var SelectionRendererFactory = (function () {
            function SelectionRendererFactory() {
            }
            SelectionRendererFactory.prototype.init = function (angularGrid, selectionController) {
                this.angularGrid = angularGrid;
                this.selectionController = selectionController;
            };
            SelectionRendererFactory.prototype.createCheckboxColDef = function () {
                return {
                    width: 30,
                    suppressMenu: true,
                    suppressSorting: true,
                    headerCellRenderer: function () {
                        var eCheckbox = document.createElement('input');
                        eCheckbox.type = 'checkbox';
                        eCheckbox.name = 'name';
                        return eCheckbox;
                    },
                    cellRenderer: this.createCheckboxRenderer()
                };
            };
            SelectionRendererFactory.prototype.createCheckboxRenderer = function () {
                var that = this;
                return function (params) {
                    return that.createSelectionCheckbox(params.node, params.rowIndex);
                };
            };
            SelectionRendererFactory.prototype.createSelectionCheckbox = function (node, rowIndex) {
                var eCheckbox = document.createElement('input');
                eCheckbox.type = "checkbox";
                eCheckbox.name = "name";
                eCheckbox.className = 'ag-selection-checkbox';
                setCheckboxState(eCheckbox, this.selectionController.isNodeSelected(node));
                var that = this;
                eCheckbox.onclick = function (event) {
                    event.stopPropagation();
                };
                eCheckbox.onchange = function () {
                    var newValue = eCheckbox.checked;
                    if (newValue) {
                        that.selectionController.selectIndex(rowIndex, true);
                    }
                    else {
                        that.selectionController.deselectIndex(rowIndex);
                    }
                };
                this.angularGrid.addVirtualRowListener(rowIndex, {
                    rowSelected: function (selected) {
                        setCheckboxState(eCheckbox, selected);
                    },
                    rowRemoved: function () {
                    }
                });
                return eCheckbox;
            };
            return SelectionRendererFactory;
        })();
        grid.SelectionRendererFactory = SelectionRendererFactory;
        function setCheckboxState(eCheckbox, state) {
            if (typeof state === 'boolean') {
                eCheckbox.checked = state;
                eCheckbox.indeterminate = false;
            }
            else {
                // isNodeSelected returns back undefined if it's a group and the children
                // are a mix of selected and unselected
                eCheckbox.indeterminate = true;
            }
        }
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var SVG_NS = "http://www.w3.org/2000/svg";
        var SvgFactory = (function () {
            function SvgFactory() {
            }
            SvgFactory.getInstance = function () {
                if (!this.theInstance) {
                    this.theInstance = new SvgFactory();
                }
                return this.theInstance;
            };
            SvgFactory.prototype.createFilterSvg = function () {
                var eSvg = createIconSvg();
                var eFunnel = document.createElementNS(SVG_NS, "polygon");
                eFunnel.setAttribute("points", "0,0 4,4 4,10 6,10 6,4 10,0");
                eFunnel.setAttribute("class", "ag-header-icon");
                eSvg.appendChild(eFunnel);
                return eSvg;
            };
            SvgFactory.prototype.createColumnShowingSvg = function () {
                return createCircle(true);
            };
            SvgFactory.prototype.createColumnHiddenSvg = function () {
                return createCircle(false);
            };
            SvgFactory.prototype.createMenuSvg = function () {
                var eSvg = document.createElementNS(SVG_NS, "svg");
                var size = "12";
                eSvg.setAttribute("width", size);
                eSvg.setAttribute("height", size);
                ["0", "5", "10"].forEach(function (y) {
                    var eLine = document.createElementNS(SVG_NS, "rect");
                    eLine.setAttribute("y", y);
                    eLine.setAttribute("width", size);
                    eLine.setAttribute("height", "2");
                    eLine.setAttribute("class", "ag-header-icon");
                    eSvg.appendChild(eLine);
                });
                return eSvg;
            };
            SvgFactory.prototype.createArrowUpSvg = function () {
                return createPolygonSvg("0,10 5,0 10,10");
            };
            SvgFactory.prototype.createArrowLeftSvg = function () {
                return createPolygonSvg("10,0 0,5 10,10");
            };
            SvgFactory.prototype.createArrowDownSvg = function () {
                return createPolygonSvg("0,0 5,10 10,0");
            };
            SvgFactory.prototype.createArrowRightSvg = function () {
                return createPolygonSvg("0,0 10,5 0,10");
            };
            SvgFactory.prototype.createSmallArrowDownSvg = function () {
                return createPolygonSvg("0,0 3,6 6,0", 6);
            };
            // UnSort Icon SVG
            SvgFactory.prototype.createArrowUpDownSvg = function () {
                var svg = createIconSvg();
                var eAscIcon = document.createElementNS(SVG_NS, "polygon");
                eAscIcon.setAttribute("points", '0,4 5,0 10,4');
                svg.appendChild(eAscIcon);
                var eDescIcon = document.createElementNS(SVG_NS, "polygon");
                eDescIcon.setAttribute("points", '0,6 5,10 10,6');
                svg.appendChild(eDescIcon);
                return svg;
            };
            return SvgFactory;
        })();
        grid.SvgFactory = SvgFactory;
        function createPolygonSvg(points, width) {
            var eSvg = createIconSvg(width);
            var eDescIcon = document.createElementNS(SVG_NS, "polygon");
            eDescIcon.setAttribute("points", points);
            eSvg.appendChild(eDescIcon);
            return eSvg;
        }
        // util function for the above
        function createIconSvg(width) {
            var eSvg = document.createElementNS(SVG_NS, "svg");
            if (width > 0) {
                eSvg.setAttribute("width", width);
                eSvg.setAttribute("height", width);
            }
            else {
                eSvg.setAttribute("width", "10");
                eSvg.setAttribute("height", "10");
            }
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
            }
            else {
                eCircle.setAttribute("fill", "none");
            }
            eSvg.appendChild(eCircle);
            return eSvg;
        }
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../svgFactory.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../constants.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var svgFactory = grid.SvgFactory.getInstance();
        var utils = grid.Utils;
        var constants = grid.Constants;
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
                }
                else if (node.footer) {
                    createFooterCell(eGroupCell, params);
                }
                else if (node.group) {
                    createGroupCell(eGroupCell, params);
                }
                else {
                    createLeafCell(eGroupCell, params);
                }
                // only do this if an indent - as this overwrites the padding that
                // the theme set, which will make things look 'not aligned' for the
                // first group level.
                if (node.footer || node.level > 0) {
                    var paddingFactor;
                    if (params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.padding >= 0) {
                        paddingFactor = params.colDef.cellRenderer.padding;
                    }
                    else {
                        paddingFactor = 10;
                    }
                    var paddingPx = node.level * paddingFactor;
                    if (node.footer) {
                        paddingPx += 10;
                    }
                    else if (!node.group) {
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
                    params.eGridCell.addEventListener('keydown', function (event) {
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
                }
                else {
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
                if (cellRenderer && cellRenderer.keyMap && typeof cellRenderer.keyMap === 'object' && params.colDef.cellRenderer !== null) {
                    var valueFromMap = cellRenderer.keyMap[params.node.key];
                    if (valueFromMap) {
                        return valueFromMap;
                    }
                    else {
                        return params.node.key;
                    }
                }
                else {
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
                }
                else {
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
        grid.groupCellRendererFactory = groupCellRendererFactory;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="utils.ts" />
/// <reference path="constants.ts" />
/// <reference path="cellRenderers/groupCellRendererFactory.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var constants = grid.Constants;
        var RowRenderer = (function () {
            function RowRenderer() {
            }
            RowRenderer.prototype.init = function (gridOptions, columnModel, gridOptionsWrapper, gridPanel, angularGrid, selectionRendererFactory, $compile, $scope, selectionController, expressionService, templateService) {
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
                    'group': grid.groupCellRendererFactory(gridOptionsWrapper, selectionRendererFactory)
                };
                // map of row ids to row objects. keeps track of which elements
                // are rendered for which rows in the dom. each row object has:
                // [scope, bodyRow, pinnedRow, rowData]
                this.renderedRows = {};
                this.renderedRowStartEditingListeners = {};
                this.editingCell = false; //gets set to true when editing a cell
            };
            RowRenderer.prototype.setRowModel = function (rowModel) {
                this.rowModel = rowModel;
            };
            RowRenderer.prototype.setMainRowWidths = function () {
                var mainRowWidth = this.columnModel.getBodyContainerWidth() + "px";
                var unpinnedRows = this.eBodyContainer.querySelectorAll(".ag-row");
                for (var i = 0; i < unpinnedRows.length; i++) {
                    unpinnedRows[i].style.width = mainRowWidth;
                }
            };
            RowRenderer.prototype.findAllElements = function (gridPanel) {
                this.eBodyContainer = gridPanel.getBodyContainer();
                this.eBodyViewport = gridPanel.getBodyViewport();
                this.ePinnedColsContainer = gridPanel.getPinnedColsContainer();
                this.eParentOfRows = gridPanel.getRowsParent();
            };
            RowRenderer.prototype.refreshView = function (refreshFromIndex) {
                if (!this.gridOptionsWrapper.isDontUseScrolls()) {
                    var rowCount = this.rowModel.getVirtualRowCount();
                    var containerHeight = this.gridOptionsWrapper.getRowHeight() * rowCount;
                    this.eBodyContainer.style.height = containerHeight + "px";
                    this.ePinnedColsContainer.style.height = containerHeight + "px";
                }
                this.refreshAllVirtualRows(refreshFromIndex);
            };
            RowRenderer.prototype.softRefreshView = function () {
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
            RowRenderer.prototype.softRefreshCell = function (eGridCell, isFirstColumn, node, column, scope, rowIndex) {
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
            RowRenderer.prototype.rowDataChanged = function (rows) {
                // we only need to be worried about rendered rows, as this method is
                // called to whats rendered. if the row isn't rendered, we don't care
                var indexesToRemove = [];
                var renderedRows = this.renderedRows;
                Object.keys(renderedRows).forEach(function (key) {
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
            RowRenderer.prototype.refreshAllVirtualRows = function (fromIndex) {
                // remove all current virtual rows, as they have old data
                var rowsToRemove = Object.keys(this.renderedRows);
                this.removeVirtualRows(rowsToRemove, fromIndex);
                // add in new rows
                this.drawVirtualRows();
            };
            // public - removes the group rows and then redraws them again
            RowRenderer.prototype.refreshGroupRows = function () {
                // find all the group rows
                var rowsToRemove = [];
                var that = this;
                Object.keys(this.renderedRows).forEach(function (key) {
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
            RowRenderer.prototype.removeVirtualRows = function (rowsToRemove, fromIndex) {
                var that = this;
                // if no fromIndex then set to -1, which will refresh everything
                var realFromIndex = (typeof fromIndex === 'number') ? fromIndex : -1;
                rowsToRemove.forEach(function (indexToRemove) {
                    if (indexToRemove >= realFromIndex) {
                        that.removeVirtualRow(indexToRemove);
                        // if the row was last to have focus, we remove the fact that it has focus
                        if (that.focusedCell && that.focusedCell.rowIndex == indexToRemove) {
                            that.focusedCell = null;
                        }
                    }
                });
            };
            RowRenderer.prototype.removeVirtualRow = function (indexToRemove) {
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
            RowRenderer.prototype.drawVirtualRows = function () {
                var first;
                var last;
                var rowCount = this.rowModel.getVirtualRowCount();
                if (this.gridOptionsWrapper.isDontUseScrolls()) {
                    first = 0;
                    last = rowCount;
                }
                else {
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
            RowRenderer.prototype.getFirstVirtualRenderedRow = function () {
                return this.firstVirtualRenderedRow;
            };
            RowRenderer.prototype.getLastVirtualRenderedRow = function () {
                return this.lastVirtualRenderedRow;
            };
            RowRenderer.prototype.ensureRowsRendered = function () {
                var mainRowWidth = this.columnModel.getBodyContainerWidth();
                var that = this;
                // at the end, this array will contain the items we need to remove
                var rowsToRemove = Object.keys(this.renderedRows);
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
                    setTimeout(function () {
                        that.$scope.$apply();
                    }, 0);
                }
            };
            RowRenderer.prototype.insertRow = function (node, rowIndex, mainRowWidth) {
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
                    eVolatileCells: {},
                    pinnedElement: null,
                    bodyElement: null
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
                    }
                    else {
                        eMainRow.appendChild(eGroupRow);
                    }
                }
                else {
                    columns.forEach(function (column, index) {
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
            RowRenderer.prototype.getDataForNode = function (node) {
                if (node.footer) {
                    // if footer, we always show the data
                    return node.data;
                }
                else if (node.group) {
                    // if header and header is expanded, we show data in footer only
                    var footersEnabled = this.gridOptionsWrapper.isGroupIncludeFooter();
                    return (node.expanded && footersEnabled) ? undefined : node.data;
                }
                else {
                    // otherwise it's a normal node, just return data as normal
                    return node.data;
                }
            };
            RowRenderer.prototype.createValueGetter = function (data, colDef, node) {
                var that = this;
                return function () {
                    var api = that.gridOptionsWrapper.getApi();
                    var context = that.gridOptionsWrapper.getContext();
                    return utils.getValue(that.expressionService, data, colDef, node, api, context);
                };
            };
            RowRenderer.prototype.createChildScopeOrNull = function (data) {
                if (this.gridOptionsWrapper.isAngularCompileRows()) {
                    var newChildScope = this.$scope.$new();
                    newChildScope.data = data;
                    return newChildScope;
                }
                else {
                    return null;
                }
            };
            RowRenderer.prototype.compileAndAdd = function (container, rowIndex, element, scope) {
                if (scope) {
                    var eElementCompiled = this.$compile(element)(scope);
                    if (container) {
                        container.appendChild(eElementCompiled[0]);
                    }
                    return eElementCompiled[0];
                }
                else {
                    if (container) {
                        container.appendChild(element);
                    }
                    return element;
                }
            };
            RowRenderer.prototype.createCellFromColDef = function (isFirstColumn, column, valueGetter, node, rowIndex, eMainRow, ePinnedRow, $childScope, renderedRow) {
                var eGridCell = this.createCell(isFirstColumn, column, valueGetter, node, rowIndex, $childScope);
                if (column.colDef.volatile) {
                    renderedRow.eVolatileCells[column.colId] = eGridCell;
                }
                renderedRow.eCells[column.colId] = eGridCell;
                if (column.pinned) {
                    ePinnedRow.appendChild(eGridCell);
                }
                else {
                    eMainRow.appendChild(eGridCell);
                }
            };
            RowRenderer.prototype.addClassesToRow = function (rowIndex, node, eRow) {
                var classesList = ["ag-row"];
                classesList.push(rowIndex % 2 == 0 ? "ag-row-even" : "ag-row-odd");
                if (this.selectionController.isNodeSelected(node)) {
                    classesList.push("ag-row-selected");
                }
                if (node.group) {
                    // if a group, put the level of the group in
                    classesList.push("ag-row-level-" + node.level);
                }
                else {
                    // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
                    if (node.parent) {
                        classesList.push("ag-row-level-" + (node.parent.level + 1));
                    }
                    else {
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
                    var gridOptionsRowClass = this.gridOptionsWrapper.getRowClass();
                    var classToUse;
                    if (typeof gridOptionsRowClass === 'function') {
                        var params = {
                            node: node,
                            data: node.data,
                            rowIndex: rowIndex,
                            context: this.gridOptionsWrapper.getContext(),
                            api: this.gridOptionsWrapper.getApi()
                        };
                        classToUse = gridOptionsRowClass(params);
                    }
                    else {
                        classToUse = gridOptionsRowClass;
                    }
                    if (classToUse) {
                        if (typeof classToUse === 'string') {
                            classesList.push(classToUse);
                        }
                        else if (Array.isArray(classToUse)) {
                            classToUse.forEach(function (classItem) {
                                classesList.push(classItem);
                            });
                        }
                    }
                }
                var classes = classesList.join(" ");
                eRow.className = classes;
            };
            RowRenderer.prototype.createRowContainer = function (rowIndex, node, groupRow, $scope) {
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
                    }
                    else {
                        cssToUse = rowStyle;
                    }
                    if (cssToUse) {
                        Object.keys(cssToUse).forEach(function (key) {
                            eRow.style[key] = cssToUse[key];
                        });
                    }
                }
                var _this = this;
                eRow.addEventListener("click", function (event) {
                    _this.angularGrid.onRowClicked(event, Number(this.getAttribute("row")), node);
                });
                return eRow;
            };
            RowRenderer.prototype.getIndexOfRenderedNode = function (node) {
                var renderedRows = this.renderedRows;
                var keys = Object.keys(renderedRows);
                for (var i = 0; i < keys.length; i++) {
                    if (renderedRows[keys[i]].node === node) {
                        return renderedRows[keys[i]].rowIndex;
                    }
                }
                return -1;
            };
            RowRenderer.prototype.createGroupElement = function (node, rowIndex, padding) {
                var eRow;
                // padding means we are on the right hand side of a pinned table, ie
                // in the main body.
                if (padding) {
                    eRow = document.createElement('span');
                }
                else {
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
                }
                else {
                    utils.addCssClass(eRow, 'ag-group-cell-entire-row');
                }
                return eRow;
            };
            RowRenderer.prototype.putDataIntoCell = function (column, value, valueGetter, node, $childScope, eSpanWithValue, eGridCell, rowIndex, refreshCellFunction) {
                // template gets preference, then cellRenderer, then do it ourselves
                var colDef = column.colDef;
                if (colDef.template) {
                    eSpanWithValue.innerHTML = colDef.template;
                }
                else if (colDef.templateUrl) {
                    var template = this.templateService.getTemplate(colDef.templateUrl, refreshCellFunction);
                    if (template) {
                        eSpanWithValue.innerHTML = template;
                    }
                }
                else if (colDef.cellRenderer) {
                    this.useCellRenderer(column, value, node, $childScope, eSpanWithValue, rowIndex, refreshCellFunction, valueGetter, eGridCell);
                }
                else {
                    // if we insert undefined, then it displays as the string 'undefined', ugly!
                    if (value !== undefined && value !== null && value !== '') {
                        eSpanWithValue.innerHTML = value;
                    }
                }
            };
            RowRenderer.prototype.useCellRenderer = function (column, value, node, $childScope, eSpanWithValue, rowIndex, refreshCellFunction, valueGetter, eGridCell) {
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
                }
                else if (typeof colDef.cellRenderer === 'function') {
                    cellRenderer = colDef.cellRenderer;
                }
                else {
                    throw 'Cell Renderer must be String or Function';
                }
                var resultFromRenderer = cellRenderer(rendererParams);
                if (utils.isNodeOrElement(resultFromRenderer)) {
                    // a dom node or element was returned, so add child
                    eSpanWithValue.appendChild(resultFromRenderer);
                }
                else {
                    // otherwise assume it was html, so just insert
                    eSpanWithValue.innerHTML = resultFromRenderer;
                }
            };
            RowRenderer.prototype.addStylesFromCollDef = function (column, value, node, $childScope, eGridCell) {
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
                    }
                    else {
                        cssToUse = colDef.cellStyle;
                    }
                    if (cssToUse) {
                        utils.addStylesToElement(eGridCell, cssToUse);
                    }
                }
            };
            RowRenderer.prototype.addClassesFromCollDef = function (colDef, value, node, $childScope, eGridCell) {
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
                    }
                    else {
                        classToUse = colDef.cellClass;
                    }
                    if (typeof classToUse === 'string') {
                        utils.addCssClass(eGridCell, classToUse);
                    }
                    else if (Array.isArray(classToUse)) {
                        classToUse.forEach(function (cssClassItem) {
                            utils.addCssClass(eGridCell, cssClassItem);
                        });
                    }
                }
            };
            RowRenderer.prototype.addClassesToCell = function (column, node, eGridCell) {
                var classes = ['ag-cell', 'ag-cell-no-focus', 'cell-col-' + column.index];
                if (node.group) {
                    if (node.footer) {
                        classes.push('ag-footer-cell');
                    }
                    else {
                        classes.push('ag-group-cell');
                    }
                }
                eGridCell.className = classes.join(' ');
            };
            RowRenderer.prototype.addClassesFromRules = function (colDef, eGridCell, value, node, rowIndex) {
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
                        }
                        else if (typeof rule === 'function') {
                            resultOfRule = rule(params);
                        }
                        if (resultOfRule) {
                            utils.addCssClass(eGridCell, className);
                        }
                        else {
                            utils.removeCssClass(eGridCell, className);
                        }
                    }
                }
            };
            RowRenderer.prototype.createCell = function (isFirstColumn, column, valueGetter, node, rowIndex, $childScope) {
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
                this.renderedRowStartEditingListeners[rowIndex][column.colId] = function () {
                    if (that.isCellEditable(column.colDef, node)) {
                        that.startEditing(eGridCell, column, node, $childScope, rowIndex, isFirstColumn, valueGetter);
                        return true;
                    }
                    else {
                        return false;
                    }
                };
                return eGridCell;
            };
            RowRenderer.prototype.addCellNavigationHandler = function (eGridCell, rowIndex, column, node) {
                var that = this;
                eGridCell.addEventListener('keydown', function (event) {
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
                    var startNavigation = key === constants.KEY_DOWN || key === constants.KEY_UP || key === constants.KEY_LEFT || key === constants.KEY_RIGHT;
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
                        }
                        else {
                            that.selectionController.selectNode(node, true);
                        }
                        event.preventDefault();
                    }
                });
            };
            // we use index for rows, but column object for columns, as the next column (by index) might not
            // be visible (header grouping) so it's not reliable, so using the column object instead.
            RowRenderer.prototype.navigateToNextCell = function (key, rowIndex, column) {
                var cellToFocus = { rowIndex: rowIndex, column: column };
                var renderedRow;
                var eCell;
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
            RowRenderer.prototype.getNextCellToFocus = function (key, lastCellToFocus) {
                var lastRowIndex = lastCellToFocus.rowIndex;
                var lastColumn = lastCellToFocus.column;
                var nextRowToFocus;
                var nextColumnToFocus;
                switch (key) {
                    case constants.KEY_UP:
                        // if already on top row, do nothing
                        if (lastRowIndex === this.firstVirtualRenderedRow) {
                            return null;
                        }
                        nextRowToFocus = lastRowIndex - 1;
                        nextColumnToFocus = lastColumn;
                        break;
                    case constants.KEY_DOWN:
                        // if already on bottom, do nothing
                        if (lastRowIndex === this.lastVirtualRenderedRow) {
                            return null;
                        }
                        nextRowToFocus = lastRowIndex + 1;
                        nextColumnToFocus = lastColumn;
                        break;
                    case constants.KEY_RIGHT:
                        var colToRight = this.columnModel.getVisibleColAfter(lastColumn);
                        // if already on right, do nothing
                        if (!colToRight) {
                            return null;
                        }
                        nextRowToFocus = lastRowIndex;
                        nextColumnToFocus = colToRight;
                        break;
                    case constants.KEY_LEFT:
                        var colToLeft = this.columnModel.getVisibleColBefore(lastColumn);
                        // if already on left, do nothing
                        if (!colToLeft) {
                            return null;
                        }
                        nextRowToFocus = lastRowIndex;
                        nextColumnToFocus = colToLeft;
                        break;
                }
                return {
                    rowIndex: nextRowToFocus,
                    column: nextColumnToFocus
                };
            };
            // called internally
            RowRenderer.prototype.focusCell = function (eCell, rowIndex, colIndex, forceBrowserFocus) {
                // do nothing if cell selection is off
                if (this.gridOptionsWrapper.isSuppressCellSelection()) {
                    return;
                }
                // remove any previous focus
                utils.querySelectorAll_replaceCssClass(this.eParentOfRows, '.ag-cell-focus', 'ag-cell-focus', 'ag-cell-no-focus');
                var selectorForCell = '[row="' + rowIndex + '"] [col="' + colIndex + '"]';
                utils.querySelectorAll_replaceCssClass(this.eParentOfRows, selectorForCell, 'ag-cell-no-focus', 'ag-cell-focus');
                this.focusedCell = { rowIndex: rowIndex, colIndex: colIndex, node: this.rowModel.getVirtualRow(rowIndex) };
                // this puts the browser focus on the cell (so it gets key presses)
                if (forceBrowserFocus) {
                    eCell.focus();
                }
                if (typeof this.gridOptionsWrapper.getCellFocused() === 'function') {
                    this.gridOptionsWrapper.getCellFocused()(this.focusedCell);
                }
            };
            // for API
            RowRenderer.prototype.getFocusedCell = function () {
                return this.focusedCell;
            };
            // called via API
            RowRenderer.prototype.setFocusedCell = function (rowIndex, colIndex) {
                var renderedRow = this.renderedRows[rowIndex];
                var column = this.columnModel.getDisplayedColumns()[colIndex];
                if (renderedRow && column) {
                    var eCell = renderedRow.eCells[column.colId];
                    this.focusCell(eCell, rowIndex, colIndex, true);
                }
            };
            RowRenderer.prototype.populateAndStyleGridCell = function (valueGetter, value, eGridCell, isFirstColumn, node, column, rowIndex, $childScope) {
                var colDef = column.colDef;
                // populate
                this.populateGridCell(eGridCell, isFirstColumn, node, column, rowIndex, value, valueGetter, $childScope);
                // style
                this.addStylesFromCollDef(column, value, node, $childScope, eGridCell);
                this.addClassesFromCollDef(colDef, value, node, $childScope, eGridCell);
                this.addClassesFromRules(colDef, eGridCell, value, node, rowIndex);
            };
            RowRenderer.prototype.populateGridCell = function (eGridCell, isFirstColumn, node, column, rowIndex, value, valueGetter, $childScope) {
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
                var refreshCellFunction = function () {
                    that.softRefreshCell(eGridCell, isFirstColumn, node, column, $childScope, rowIndex);
                };
                this.putDataIntoCell(column, value, valueGetter, node, $childScope, eSpanWithValue, eGridCell, rowIndex, refreshCellFunction);
            };
            RowRenderer.prototype.addCellDoubleClickedHandler = function (eGridCell, node, column, value, rowIndex, $childScope, isFirstColumn, valueGetter) {
                var that = this;
                var colDef = column.colDef;
                eGridCell.addEventListener('dblclick', function (event) {
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
            RowRenderer.prototype.addCellClickedHandler = function (eGridCell, node, column, value, rowIndex) {
                var colDef = column.colDef;
                var that = this;
                eGridCell.addEventListener("click", function (event) {
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
            RowRenderer.prototype.isCellEditable = function (colDef, node) {
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
            RowRenderer.prototype.stopEditing = function (eGridCell, column, node, $childScope, eInput, blurListener, rowIndex, isFirstColumn, valueGetter) {
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
                }
                else {
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
            RowRenderer.prototype.startEditing = function (eGridCell, column, node, $childScope, rowIndex, isFirstColumn, valueGetter) {
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
                var blurListener = function () {
                    that.stopEditing(eGridCell, column, node, $childScope, eInput, blurListener, rowIndex, isFirstColumn, valueGetter);
                };
                //stop entering if we loose focus
                eInput.addEventListener("blur", blurListener);
                //stop editing if enter pressed
                eInput.addEventListener('keypress', function (event) {
                    var key = event.which || event.keyCode;
                    // 13 is enter
                    if (key == constants.KEY_ENTER) {
                        that.stopEditing(eGridCell, column, node, $childScope, eInput, blurListener, rowIndex, isFirstColumn, valueGetter);
                        that.focusCell(eGridCell, rowIndex, column.index, true);
                    }
                });
                // tab key doesn't generate keypress, so need keydown to listen for that
                eInput.addEventListener('keydown', function (event) {
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
            RowRenderer.prototype.startEditingNextCell = function (rowIndex, column, shiftKey) {
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
                    }
                    else {
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
            return RowRenderer;
        })();
        grid.RowRenderer = RowRenderer;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="utils.ts" />
/// <reference path="constants.ts" />
/// <reference path="svgFactory.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var constants = grid.Constants;
        var svgFactory = grid.SvgFactory.getInstance();
        var HeaderRenderer = (function () {
            function HeaderRenderer() {
            }
            HeaderRenderer.prototype.init = function (gridOptionsWrapper, columnController, columnModel, gridPanel, angularGrid, filterManager, $scope, $compile, expressionService) {
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
            HeaderRenderer.prototype.findAllElements = function (gridPanel) {
                this.ePinnedHeader = gridPanel.getPinnedHeader();
                this.eHeaderContainer = gridPanel.getHeaderContainer();
                this.eHeader = gridPanel.getHeader();
                this.eRoot = gridPanel.getRoot();
            };
            HeaderRenderer.prototype.refreshHeader = function () {
                utils.removeAllChildren(this.ePinnedHeader);
                utils.removeAllChildren(this.eHeaderContainer);
                if (this.childScopes) {
                    this.childScopes.forEach(function (childScope) {
                        childScope.$destroy();
                    });
                }
                this.childScopes = [];
                if (this.gridOptionsWrapper.isGroupHeaders()) {
                    this.insertHeadersWithGrouping();
                }
                else {
                    this.insertHeadersWithoutGrouping();
                }
            };
            HeaderRenderer.prototype.insertHeadersWithGrouping = function () {
                var groups = this.columnModel.getHeaderGroups();
                var that = this;
                groups.forEach(function (group) {
                    var eHeaderCell = that.createGroupedHeaderCell(group);
                    var eContainerToAddTo = group.pinned ? that.ePinnedHeader : that.eHeaderContainer;
                    eContainerToAddTo.appendChild(eHeaderCell);
                });
            };
            HeaderRenderer.prototype.createGroupedHeaderCell = function (group) {
                var eHeaderGroup = document.createElement('div');
                eHeaderGroup.className = 'ag-header-group';
                var eHeaderGroupCell = document.createElement('div');
                group.eHeaderGroupCell = eHeaderGroupCell;
                var classNames = ['ag-header-group-cell'];
                // having different classes below allows the style to not have a bottom border
                // on the group header, if no group is specified
                if (group.name) {
                    classNames.push('ag-header-group-cell-with-group');
                }
                else {
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
                group.displayedColumns.forEach(function (column) {
                    var eHeaderCell = that.createHeaderCell(column, true, group);
                    eHeaderGroup.appendChild(eHeaderCell);
                });
                that.setWidthOfGroupHeaderCell(group);
                return eHeaderGroup;
            };
            HeaderRenderer.prototype.addGroupExpandIcon = function (group, eHeaderGroup, expanded) {
                var eGroupIcon;
                if (expanded) {
                    eGroupIcon = utils.createIcon('headerGroupOpened', this.gridOptionsWrapper, null, svgFactory.createArrowLeftSvg);
                }
                else {
                    eGroupIcon = utils.createIcon('headerGroupClosed', this.gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
                }
                eGroupIcon.className = 'ag-header-expand-icon';
                eHeaderGroup.appendChild(eGroupIcon);
                var that = this;
                eGroupIcon.onclick = function () {
                    that.columnController.headerGroupOpened(group);
                };
            };
            HeaderRenderer.prototype.addDragHandler = function (eDraggableElement, dragCallback) {
                var that = this;
                eDraggableElement.addEventListener('mousedown', function (downEvent) {
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
            HeaderRenderer.prototype.setWidthOfGroupHeaderCell = function (headerGroup) {
                var totalWidth = 0;
                headerGroup.displayedColumns.forEach(function (column) {
                    totalWidth += column.actualWidth;
                });
                headerGroup.eHeaderGroupCell.style.width = utils.formatWidth(totalWidth);
                headerGroup.actualWidth = totalWidth;
            };
            HeaderRenderer.prototype.insertHeadersWithoutGrouping = function () {
                var ePinnedHeader = this.ePinnedHeader;
                var eHeaderContainer = this.eHeaderContainer;
                var that = this;
                this.columnModel.getDisplayedColumns().forEach(function (column) {
                    // only include the first x cols
                    var headerCell = that.createHeaderCell(column, false);
                    if (column.pinned) {
                        ePinnedHeader.appendChild(headerCell);
                    }
                    else {
                        eHeaderContainer.appendChild(headerCell);
                    }
                });
            };
            HeaderRenderer.prototype.createHeaderCell = function (column, grouped, headerGroup) {
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
                }
                else {
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
                    eMenuButton.onclick = function () {
                        that.filterManager.showFilter(column, this);
                    };
                    eHeaderCell.appendChild(eMenuButton);
                    eHeaderCell.onmouseenter = function () {
                        eMenuButton.style.opacity = '1';
                    };
                    eHeaderCell.onmouseleave = function () {
                        eMenuButton.style.opacity = '0';
                    };
                    eMenuButton.style.opacity = '0';
                    eMenuButton.style['transition'] = 'opacity 0.5s, border 0.2s';
                    var style = eMenuButton.style;
                    style['-webkit-transition'] = 'opacity 0.5s, border 0.2s';
                }
                // label div
                var headerCellLabel = document.createElement("div");
                headerCellLabel.className = "ag-header-cell-label";
                // add in sort icons
                if (this.gridOptionsWrapper.isEnableSorting() && !colDef.suppressSorting) {
                    column.eSortAsc = utils.createIcon('sortAscending', this.gridOptionsWrapper, column, svgFactory.createArrowUpSvg);
                    column.eSortDesc = utils.createIcon('sortDescending', this.gridOptionsWrapper, column, svgFactory.createArrowDownSvg);
                    utils.addCssClass(column.eSortAsc, 'ag-header-icon ag-sort-ascending-icon');
                    utils.addCssClass(column.eSortDesc, 'ag-header-icon ag-sort-descending-icon');
                    headerCellLabel.appendChild(column.eSortAsc);
                    headerCellLabel.appendChild(column.eSortDesc);
                    // 'no sort' icon
                    if (colDef.unSortIcon || this.gridOptionsWrapper.isUnSortIcon()) {
                        column.eSortNone = utils.createIcon('sortUnSort', this.gridOptionsWrapper, column, svgFactory.createArrowUpDownSvg);
                        utils.addCssClass(column.eSortNone, 'ag-header-icon ag-sort-none-icon');
                        headerCellLabel.appendChild(column.eSortNone);
                    }
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
                if (colDef.headerCellRenderer) {
                    headerCellRenderer = colDef.headerCellRenderer;
                }
                else if (this.gridOptionsWrapper.getHeaderCellRenderer()) {
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
                    }
                    else {
                        // otherwise assume it was html, so just insert
                        var eTextSpan = document.createElement("span");
                        eTextSpan.innerHTML = cellRendererResult;
                        childToAppend = eTextSpan;
                    }
                    // angular compile header if option is turned on
                    if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
                        var childToAppendCompiled = this.$compile(childToAppend)(newChildScope)[0];
                        headerCellLabel.appendChild(childToAppendCompiled);
                    }
                    else {
                        headerCellLabel.appendChild(childToAppend);
                    }
                }
                else {
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
            HeaderRenderer.prototype.addHeaderClassesFromCollDef = function (colDef, $childScope, eHeaderCell) {
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
                    }
                    else {
                        classToUse = colDef.headerClass;
                    }
                    if (typeof classToUse === 'string') {
                        utils.addCssClass(eHeaderCell, classToUse);
                    }
                    else if (Array.isArray(classToUse)) {
                        classToUse.forEach(function (cssClassItem) {
                            utils.addCssClass(eHeaderCell, cssClassItem);
                        });
                    }
                }
            };
            HeaderRenderer.prototype.getNextSortDirection = function (direction) {
                var suppressUnSort = this.gridOptionsWrapper.isSuppressUnSort();
                var suppressDescSort = this.gridOptionsWrapper.isSuppressDescSort();
                switch (direction) {
                    case constants.DESC:
                        if (suppressUnSort) {
                            return constants.ASC;
                        }
                        else {
                            return null;
                        }
                    case constants.ASC:
                        if (suppressUnSort && suppressDescSort) {
                            return constants.ASC;
                        }
                        else if (suppressDescSort) {
                            return null;
                        }
                        else {
                            return constants.DESC;
                        }
                    default:
                        return constants.ASC;
                }
            };
            HeaderRenderer.prototype.addSortHandling = function (headerCellLabel, column) {
                var that = this;
                headerCellLabel.addEventListener("click", function (e) {
                    // update sort on current col
                    column.sort = that.getNextSortDirection(column.sort);
                    // sortedAt used for knowing order of cols when multi-col sort
                    if (column.sort) {
                        column.sortedAt = new Date().valueOf();
                    }
                    else {
                        column.sortedAt = null;
                    }
                    var doingMultiSort = !that.gridOptionsWrapper.isSuppressMultiSort() && e.shiftKey;
                    // clear sort on all columns except this one, and update the icons
                    that.columnModel.getAllColumns().forEach(function (columnToClear) {
                        // Do not clear if either holding shift, or if column in question was clicked
                        if (!(doingMultiSort || columnToClear === column)) {
                            columnToClear.sort = null;
                        }
                    });
                    that.angularGrid.onSortingChanged();
                });
            };
            HeaderRenderer.prototype.updateSortIcons = function () {
                this.columnModel.getAllColumns().forEach(function (column) {
                    // update visibility of icons
                    var sortAscending = column.sort === constants.ASC;
                    var sortDescending = column.sort === constants.DESC;
                    var unSort = column.sort !== constants.DESC && column.sort !== constants.ASC;
                    if (column.eSortAsc) {
                        utils.setVisible(column.eSortAsc, sortAscending);
                    }
                    if (column.eSortDesc) {
                        utils.setVisible(column.eSortDesc, sortDescending);
                    }
                    // UnSort Icon
                    if (column.eSortNone) {
                        utils.setVisible(column.eSortNone, unSort);
                    }
                });
            };
            HeaderRenderer.prototype.groupDragCallbackFactory = function (currentGroup) {
                var parent = this;
                var displayedColumns = currentGroup.displayedColumns;
                return {
                    onDragStart: function () {
                        this.groupWidthStart = currentGroup.actualWidth;
                        this.childrenWidthStarts = [];
                        var that = this;
                        displayedColumns.forEach(function (colDefWrapper) {
                            that.childrenWidthStarts.push(colDefWrapper.actualWidth);
                        });
                        this.minWidth = displayedColumns.length * constants.MIN_COL_WIDTH;
                    },
                    onDragging: function (dragChange) {
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
                        currentGroup.displayedColumns.forEach(function (colDefWrapper, index) {
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
                            }
                            else {
                                // if last col, give it the remaining pixels
                                newChildSize = pixelsToDistribute;
                            }
                            var eHeaderCell = displayedColumns[index].eHeaderCell;
                            parent.adjustColumnWidth(newChildSize, colDefWrapper, eHeaderCell);
                        });
                        // should not be calling these here, should do something else
                        if (currentGroup.pinned) {
                            parent.angularGrid.updatePinnedColContainerWidthAfterColResize();
                        }
                        else {
                            parent.angularGrid.updateBodyContainerWidthAfterColResize();
                        }
                    }
                };
            };
            HeaderRenderer.prototype.adjustColumnWidth = function (newWidth, column, eHeaderCell) {
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
            HeaderRenderer.prototype.headerDragCallbackFactory = function (headerCell, column, headerGroup) {
                var parent = this;
                return {
                    onDragStart: function () {
                        this.startWidth = column.actualWidth;
                    },
                    onDragging: function (dragChange) {
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
                        }
                        else {
                            parent.angularGrid.updateBodyContainerWidthAfterColResize();
                        }
                    }
                };
            };
            HeaderRenderer.prototype.stopDragging = function (listenersToRemove) {
                this.eRoot.style.cursor = "";
                var that = this;
                utils.iterateObject(listenersToRemove, function (key, listener) {
                    that.eRoot.removeEventListener(key, listener);
                });
            };
            HeaderRenderer.prototype.updateFilterIcons = function () {
                var that = this;
                this.columnModel.getDisplayedColumns().forEach(function (column) {
                    // todo: need to change this, so only updates if column is visible
                    if (column.eFilterIcon) {
                        var filterPresent = that.filterManager.isFilterPresentForCol(column.colId);
                        var displayStyle = filterPresent ? 'inline' : 'none';
                        column.eFilterIcon.style.display = displayStyle;
                    }
                });
            };
            return HeaderRenderer;
        })();
        grid.HeaderRenderer = HeaderRenderer;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var GroupCreator = (function () {
            function GroupCreator() {
            }
            GroupCreator.getInstance = function () {
                if (!this.theInstance) {
                    this.theInstance = new GroupCreator();
                }
                return this.theInstance;
            };
            GroupCreator.prototype.group = function (rowNodes, groupedCols, expandByDefault) {
                var topMostGroup = {
                    level: -1,
                    children: [],
                    childrenMap: {}
                };
                var allGroups = [];
                allGroups.push(topMostGroup);
                var levelToInsertChild = groupedCols.length - 1;
                var i;
                var currentLevel;
                var node;
                var data;
                var currentGroup;
                var groupByField;
                var groupKey;
                var nextGroup;
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
                        }
                        else {
                            currentGroup = nextGroup;
                        }
                    }
                }
                for (i = 0; i < allGroups.length; i++) {
                    delete allGroups[i].childrenMap;
                }
                return topMostGroup.children;
            };
            GroupCreator.prototype.isExpanded = function (expandByDefault, level) {
                if (typeof expandByDefault === 'number') {
                    return level < expandByDefault;
                }
                else {
                    return expandByDefault === true || expandByDefault === 'true';
                }
            };
            return GroupCreator;
        })();
        grid.GroupCreator = GroupCreator;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../utils.ts" />
/// <reference path="../constants.ts" />
/// <reference path="../groupCreator.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var constants = grid.Constants;
        var groupCreator = grid.GroupCreator.getInstance();
        var InMemoryRowController = (function () {
            function InMemoryRowController() {
                this.createModel();
            }
            InMemoryRowController.prototype.init = function (gridOptionsWrapper, columnModel, angularGrid, filterManager, $scope, expressionService) {
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
            InMemoryRowController.prototype.createModel = function () {
                var that = this;
                this.model = {
                    // this method is implemented by the inMemory model only,
                    // it gives the top level of the selection. used by the selection
                    // controller, when it needs to do a full traversal
                    getTopLevelNodes: function () {
                        return that.rowsAfterGroup;
                    },
                    getVirtualRow: function (index) {
                        return that.rowsAfterMap[index];
                    },
                    getVirtualRowCount: function () {
                        if (that.rowsAfterMap) {
                            return that.rowsAfterMap.length;
                        }
                        else {
                            return 0;
                        }
                    },
                    forEachInMemory: function (callback) {
                        that.forEachInMemory(callback);
                    }
                };
            };
            // public
            InMemoryRowController.prototype.getModel = function () {
                return this.model;
            };
            // public
            InMemoryRowController.prototype.forEachInMemory = function (callback) {
                // iterates through each item in memory, and calls the callback function
                function doCallback(list) {
                    if (list) {
                        for (var i = 0; i < list.length; i++) {
                            var item = list[i];
                            callback(item);
                            if (item.group && item.group.children) {
                                doCallback(item.group.children);
                            }
                        }
                    }
                }
                doCallback(this.rowsAfterGroup);
            };
            // public
            InMemoryRowController.prototype.updateModel = function (step) {
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
                        setTimeout(function () {
                            $scope.$apply();
                        }, 0);
                    }
                }
            };
            // private
            InMemoryRowController.prototype.defaultGroupAggFunctionFactory = function (valueColumns, valueKeys) {
                return function groupAggFunction(rows) {
                    var result = {};
                    if (valueKeys) {
                        for (var i = 0; i < valueKeys.length; i++) {
                            var valueKey = valueKeys[i];
                            // at this point, if no values were numbers, the result is null (not zero)
                            result[valueKey] = aggregateColumn(rows, constants.SUM, valueKey);
                        }
                    }
                    if (valueColumns) {
                        for (var j = 0; j < valueColumns.length; j++) {
                            var valueColumn = valueColumns[j];
                            var colKey = valueColumn.colDef.field;
                            // at this point, if no values were numbers, the result is null (not zero)
                            result[colKey] = aggregateColumn(rows, valueColumn.aggFunc, colKey);
                        }
                    }
                    return result;
                };
                function aggregateColumn(rows, aggFunc, colKey) {
                    var resultForColumn = null;
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        var thisColumnValue = row.data[colKey];
                        // only include if the value is a number
                        if (typeof thisColumnValue === 'number') {
                            switch (aggFunc) {
                                case constants.SUM:
                                    resultForColumn += thisColumnValue;
                                    break;
                                case constants.MIN:
                                    if (resultForColumn === null) {
                                        resultForColumn = thisColumnValue;
                                    }
                                    else if (resultForColumn > thisColumnValue) {
                                        resultForColumn = thisColumnValue;
                                    }
                                    break;
                                case constants.MAX:
                                    if (resultForColumn === null) {
                                        resultForColumn = thisColumnValue;
                                    }
                                    else if (resultForColumn < thisColumnValue) {
                                        resultForColumn = thisColumnValue;
                                    }
                                    break;
                            }
                        }
                    }
                    return resultForColumn;
                }
            };
            // private
            InMemoryRowController.prototype.getValue = function (data, colDef, node) {
                var api = this.gridOptionsWrapper.getApi();
                var context = this.gridOptionsWrapper.getContext();
                return utils.getValue(this.expressionService, data, colDef, node, api, context);
            };
            // public - it's possible to recompute the aggregate without doing the other parts
            InMemoryRowController.prototype.doAggregate = function () {
                var groupAggFunction = this.gridOptionsWrapper.getGroupAggFunction();
                if (typeof groupAggFunction === 'function') {
                    this.recursivelyCreateAggData(this.rowsAfterFilter, groupAggFunction);
                    return;
                }
                var valueColumns = this.columnModel.getValueColumns();
                var valueKeys = this.gridOptionsWrapper.getGroupAggFields();
                if ((valueColumns && valueColumns.length > 0) || (valueKeys && valueKeys.length > 0)) {
                    var defaultAggFunction = this.defaultGroupAggFunctionFactory(valueColumns, valueKeys);
                    this.recursivelyCreateAggData(this.rowsAfterFilter, defaultAggFunction);
                }
                else {
                    // if no agg data, need to clear out any previous items, when can be left behind
                    // if use is creating / removing columns using the tool panel.
                    // one exception - don't do this if already grouped, as this breaks the File Explorer example!!
                    // to fix another day - how to we reset when the user provided the data??
                    if (!this.gridOptionsWrapper.isRowsAlreadyGrouped()) {
                        this.recursivelyClearAggData(this.rowsAfterFilter);
                    }
                }
            };
            // public
            InMemoryRowController.prototype.expandOrCollapseAll = function (expand, rowNodes) {
                // if first call in recursion, we set list to parent list
                if (rowNodes === null) {
                    rowNodes = this.rowsAfterGroup;
                }
                if (!rowNodes) {
                    return;
                }
                var _this = this;
                rowNodes.forEach(function (node) {
                    if (node.group) {
                        node.expanded = expand;
                        _this.expandOrCollapseAll(expand, node.children);
                    }
                });
            };
            // private
            InMemoryRowController.prototype.recursivelyClearAggData = function (nodes) {
                for (var i = 0, l = nodes.length; i < l; i++) {
                    var node = nodes[i];
                    if (node.group) {
                        // agg function needs to start at the bottom, so traverse first
                        this.recursivelyClearAggData(node.childrenAfterFilter);
                        node.data = null;
                    }
                }
            };
            // private
            InMemoryRowController.prototype.recursivelyCreateAggData = function (nodes, groupAggFunction) {
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
            InMemoryRowController.prototype.doSort = function () {
                var sorting;
                // if the sorting is already done by the server, then we should not do it here
                if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
                    sorting = false;
                }
                else {
                    //see if there is a col we are sorting by
                    var sortingOptions = [];
                    this.columnModel.getAllColumns().forEach(function (column) {
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
                    sortingOptions.sort(function (optionA, optionB) {
                        return optionA.sortedAt - optionB.sortedAt;
                    });
                    this.sortList(rowNodesReadyForSorting, sortingOptions);
                }
                else {
                    // if no sorting, set all group children after sort to the original list.
                    // note: it is important to do this, even if doing server side sorting,
                    // to allow the rows to pass to the next stage (ie set the node value
                    // childrenAfterSort)
                    this.recursivelyResetSort(rowNodesReadyForSorting);
                }
                this.rowsAfterSort = rowNodesReadyForSorting;
            };
            // private
            InMemoryRowController.prototype.recursivelyResetSort = function (rowNodes) {
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
            InMemoryRowController.prototype.sortList = function (nodes, sortOptions) {
                for (var i = 0, l = nodes.length; i < l; i++) {
                    var node = nodes[i];
                    if (node.group && node.children) {
                        node.childrenAfterSort = node.childrenAfterFilter.slice(0);
                        this.sortList(node.childrenAfterSort, sortOptions);
                    }
                }
                var that = this;
                function compare(objA, objB, colDef) {
                    var valueA = that.getValue(objA.data, colDef, objA);
                    var valueB = that.getValue(objB.data, colDef, objB);
                    if (colDef.comparator) {
                        //if comparator provided, use it
                        return colDef.comparator(valueA, valueB, objA, objB);
                    }
                    else {
                        //otherwise do our own comparison
                        return utils.defaultComparator(valueA, valueB);
                    }
                }
                nodes.sort(function (objA, objB) {
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
            InMemoryRowController.prototype.doGrouping = function () {
                var rowsAfterGroup;
                var groupedCols = this.columnModel.getGroupedColumns();
                var rowsAlreadyGrouped = this.gridOptionsWrapper.isRowsAlreadyGrouped();
                var doingGrouping = !rowsAlreadyGrouped && groupedCols.length > 0;
                if (doingGrouping) {
                    var expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
                    rowsAfterGroup = groupCreator.group(this.allRows, groupedCols, expandByDefault);
                }
                else {
                    rowsAfterGroup = this.allRows;
                }
                this.rowsAfterGroup = rowsAfterGroup;
            };
            // private
            InMemoryRowController.prototype.doFilter = function () {
                var doingFilter;
                if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
                    doingFilter = false;
                }
                else {
                    var quickFilterPresent = this.angularGrid.getQuickFilter() !== null;
                    var advancedFilterPresent = this.filterManager.isFilterPresent();
                    doingFilter = quickFilterPresent || advancedFilterPresent;
                }
                var rowsAfterFilter;
                if (doingFilter) {
                    rowsAfterFilter = this.filterItems(this.rowsAfterGroup, quickFilterPresent, advancedFilterPresent);
                }
                else {
                    // do it here
                    rowsAfterFilter = this.rowsAfterGroup;
                    this.recursivelyResetFilter(this.rowsAfterGroup);
                }
                this.rowsAfterFilter = rowsAfterFilter;
            };
            // private
            InMemoryRowController.prototype.filterItems = function (rowNodes, quickFilterPresent, advancedFilterPresent) {
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
                    }
                    else {
                        if (this.doesRowPassFilter(node, quickFilterPresent, advancedFilterPresent)) {
                            result.push(node);
                        }
                    }
                }
                return result;
            };
            // private
            InMemoryRowController.prototype.recursivelyResetFilter = function (nodes) {
                if (!nodes) {
                    return;
                }
                for (var i = 0, l = nodes.length; i < l; i++) {
                    var node = nodes[i];
                    if (node.group && node.children) {
                        node.childrenAfterFilter = node.children;
                        this.recursivelyResetFilter(node.children);
                        node.allChildrenCount = this.getTotalChildCount(node.childrenAfterFilter);
                    }
                }
            };
            // private
            // rows: the rows to put into the model
            // firstId: the first id to use, used for paging, where we are not on the first page
            InMemoryRowController.prototype.setAllRows = function (rows, firstId) {
                var nodes;
                if (this.gridOptionsWrapper.isRowsAlreadyGrouped()) {
                    nodes = rows;
                    this.recursivelyCheckUserProvidedNodes(nodes, null, 0);
                }
                else {
                    // place each row into a wrapper
                    var nodes = [];
                    if (rows) {
                        for (var i = 0; i < rows.length; i++) {
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
            InMemoryRowController.prototype.recursivelyAddIdToNodes = function (nodes, index) {
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
            InMemoryRowController.prototype.recursivelyCheckUserProvidedNodes = function (nodes, parent, level) {
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
            InMemoryRowController.prototype.getTotalChildCount = function (rowNodes) {
                var count = 0;
                for (var i = 0, l = rowNodes.length; i < l; i++) {
                    var item = rowNodes[i];
                    if (item.group) {
                        count += item.allChildrenCount;
                    }
                    else {
                        count++;
                    }
                }
                return count;
            };
            // private
            InMemoryRowController.prototype.doGroupMapping = function () {
                // even if not doing grouping, we do the mapping, as the client might
                // of passed in data that already has a grouping in it somewhere
                var rowsAfterMap = [];
                this.addToMap(rowsAfterMap, this.rowsAfterSort);
                this.rowsAfterMap = rowsAfterMap;
            };
            // private
            InMemoryRowController.prototype.addToMap = function (mappedData, originalNodes) {
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
            InMemoryRowController.prototype.createFooterNode = function (groupNode) {
                var footerNode = {};
                Object.keys(groupNode).forEach(function (key) {
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
            InMemoryRowController.prototype.doesRowPassFilter = function (node, quickFilterPresent, advancedFilterPresent) {
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
            InMemoryRowController.prototype.aggregateRowForQuickFilter = function (node) {
                var aggregatedText = '';
                this.columnModel.getAllColumns().forEach(function (colDefWrapper) {
                    var data = node.data;
                    var value = data ? data[colDefWrapper.colDef.field] : null;
                    if (value && value !== '') {
                        aggregatedText = aggregatedText + value.toString().toUpperCase() + "_";
                    }
                });
                node.quickFilterAggregateText = aggregatedText;
            };
            return InMemoryRowController;
        })();
        grid.InMemoryRowController = InMemoryRowController;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../utils.ts" />
/*
 * This row controller is used for infinite scrolling only. For normal 'in memory' table,
 * or standard pagination, the inMemoryRowController is used.
 */
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var logging = false;
        var VirtualPageRowController = (function () {
            function VirtualPageRowController() {
            }
            VirtualPageRowController.prototype.init = function (rowRenderer, gridOptionsWrapper, angularGrid) {
                this.rowRenderer = rowRenderer;
                this.datasourceVersion = 0;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.angularGrid = angularGrid;
            };
            VirtualPageRowController.prototype.setDatasource = function (datasource) {
                this.datasource = datasource;
                if (!datasource) {
                    // only continue if we have a valid datasource to working with
                    return;
                }
                this.reset();
            };
            VirtualPageRowController.prototype.reset = function () {
                // see if datasource knows how many rows there are
                if (typeof this.datasource.rowCount === 'number' && this.datasource.rowCount >= 0) {
                    this.virtualRowCount = this.datasource.rowCount;
                    this.foundMaxRow = true;
                }
                else {
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
                }
                else {
                    this.maxConcurrentDatasourceRequests = 2;
                }
                // the number of pages to keep in browser cache
                if (typeof this.datasource.maxPagesInCache === 'number' && this.datasource.maxPagesInCache > 0) {
                    this.maxPagesInCache = this.datasource.maxPagesInCache;
                }
                else {
                    // null is default, means don't  have any max size on the cache
                    this.maxPagesInCache = null;
                }
                this.pageSize = this.datasource.pageSize; // take a copy of page size, we don't want it changing
                this.overflowSize = this.datasource.overflowSize; // take a copy of page size, we don't want it changing
                this.doLoadOrQueue(0);
            };
            VirtualPageRowController.prototype.createNodesFromRows = function (pageNumber, rows) {
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
            VirtualPageRowController.prototype.removeFromLoading = function (pageNumber) {
                var index = this.pageLoadsInProgress.indexOf(pageNumber);
                this.pageLoadsInProgress.splice(index, 1);
            };
            VirtualPageRowController.prototype.pageLoadFailed = function (pageNumber) {
                this.removeFromLoading(pageNumber);
                this.checkQueueForNextLoad();
            };
            VirtualPageRowController.prototype.pageLoaded = function (pageNumber, rows, lastRow) {
                this.putPageIntoCacheAndPurge(pageNumber, rows);
                this.checkMaxRowAndInformRowRenderer(pageNumber, lastRow);
                this.removeFromLoading(pageNumber);
                this.checkQueueForNextLoad();
            };
            VirtualPageRowController.prototype.putPageIntoCacheAndPurge = function (pageNumber, rows) {
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
            VirtualPageRowController.prototype.checkMaxRowAndInformRowRenderer = function (pageNumber, lastRow) {
                if (!this.foundMaxRow) {
                    // if we know the last row, use if
                    if (typeof lastRow === 'number' && lastRow >= 0) {
                        this.virtualRowCount = lastRow;
                        this.foundMaxRow = true;
                    }
                    else {
                        // otherwise, see if we need to add some virtual rows
                        var thisPagePlusBuffer = ((pageNumber + 1) * this.pageSize) + this.overflowSize;
                        if (this.virtualRowCount < thisPagePlusBuffer) {
                            this.virtualRowCount = thisPagePlusBuffer;
                        }
                    }
                    // if rowCount changes, refreshView, otherwise just refreshAllVirtualRows
                    this.rowRenderer.refreshView();
                }
                else {
                    this.rowRenderer.refreshAllVirtualRows();
                }
            };
            VirtualPageRowController.prototype.isPageAlreadyLoading = function (pageNumber) {
                var result = this.pageLoadsInProgress.indexOf(pageNumber) >= 0 || this.pageLoadsQueued.indexOf(pageNumber) >= 0;
                return result;
            };
            VirtualPageRowController.prototype.doLoadOrQueue = function (pageNumber) {
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
                }
                else {
                    // otherwise, queue the request
                    this.addToQueueAndPurgeQueue(pageNumber);
                }
            };
            VirtualPageRowController.prototype.addToQueueAndPurgeQueue = function (pageNumber) {
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
            VirtualPageRowController.prototype.findLeastRecentlyAccessedPage = function (pageIndexes) {
                var youngestPageIndex = -1;
                var youngestPageAccessTime = Number.MAX_VALUE;
                var that = this;
                pageIndexes.forEach(function (pageIndex) {
                    var accessTimeThisPage = that.pageAccessTimes[pageIndex];
                    if (accessTimeThisPage < youngestPageAccessTime) {
                        youngestPageAccessTime = accessTimeThisPage;
                        youngestPageIndex = pageIndex;
                    }
                });
                return youngestPageIndex;
            };
            VirtualPageRowController.prototype.checkQueueForNextLoad = function () {
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
            VirtualPageRowController.prototype.loadPage = function (pageNumber) {
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
            VirtualPageRowController.prototype.requestIsDaemon = function (datasourceVersionCopy) {
                return this.datasourceVersion !== datasourceVersionCopy;
            };
            VirtualPageRowController.prototype.getVirtualRow = function (rowIndex) {
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
                }
                else {
                    var indexInThisPage = rowIndex % this.pageSize;
                    return page[indexInThisPage];
                }
            };
            VirtualPageRowController.prototype.forEachInMemory = function (callback) {
                var pageKeys = Object.keys(this.pageCache);
                for (var i = 0; i < pageKeys.length; i++) {
                    var pageKey = pageKeys[i];
                    var page = this.pageCache[pageKey];
                    for (var j = 0; j < page.length; j++) {
                        var node = page[j];
                        callback(node);
                    }
                }
            };
            VirtualPageRowController.prototype.getModel = function () {
                var that = this;
                return {
                    getVirtualRow: function (index) {
                        return that.getVirtualRow(index);
                    },
                    getVirtualRowCount: function () {
                        return that.virtualRowCount;
                    },
                    forEachInMemory: function (callback) {
                        that.forEachInMemory(callback);
                    }
                };
            };
            return VirtualPageRowController;
        })();
        grid.VirtualPageRowController = VirtualPageRowController;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../utils.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var template = '<div class="ag-paging-panel">' + '<span id="pageRowSummaryPanel" class="ag-paging-row-summary-panel">' + '<span id="firstRowOnPage"></span>' + ' [TO] ' + '<span id="lastRowOnPage"></span>' + ' [OF] ' + '<span id="recordCount"></span>' + '</span>' + '<span class="ag-paging-page-summary-panel">' + '<button class="ag-paging-button" id="btFirst">[FIRST]</button>' + '<button class="ag-paging-button" id="btPrevious">[PREVIOUS]</button>' + '[PAGE] ' + '<span id="current"></span>' + ' [OF] ' + '<span id="total"></span>' + '<button class="ag-paging-button" id="btNext">[NEXT]</button>' + '<button class="ag-paging-button" id="btLast">[LAST]</button>' + '</span>' + '</div>';
        var PaginationController = (function () {
            function PaginationController() {
            }
            PaginationController.prototype.init = function (angularGrid, gridOptionsWrapper) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.angularGrid = angularGrid;
                this.setupComponents();
                this.callVersion = 0;
            };
            PaginationController.prototype.setDatasource = function (datasource) {
                this.datasource = datasource;
                if (!datasource) {
                    // only continue if we have a valid datasource to work with
                    return;
                }
                this.reset();
            };
            PaginationController.prototype.reset = function () {
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
                }
                else {
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
            PaginationController.prototype.setTotalLabels = function () {
                if (this.foundMaxRow) {
                    this.lbTotal.innerHTML = this.totalPages.toLocaleString();
                    this.lbRecordCount.innerHTML = this.rowCount.toLocaleString();
                }
                else {
                    var moreText = this.gridOptionsWrapper.getLocaleTextFunc()('more', 'more');
                    this.lbTotal.innerHTML = moreText;
                    this.lbRecordCount.innerHTML = moreText;
                }
            };
            PaginationController.prototype.calculateTotalPages = function () {
                this.totalPages = Math.floor((this.rowCount - 1) / this.pageSize) + 1;
            };
            PaginationController.prototype.pageLoaded = function (rows, lastRowIndex) {
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
            PaginationController.prototype.updateRowLabels = function () {
                var startRow;
                var endRow;
                if (this.isZeroPagesToDisplay()) {
                    startRow = 0;
                    endRow = 0;
                }
                else {
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
            PaginationController.prototype.loadPage = function () {
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
            PaginationController.prototype.isCallDaemon = function (versionCopy) {
                return versionCopy !== this.callVersion;
            };
            PaginationController.prototype.onBtNext = function () {
                this.currentPage++;
                this.loadPage();
            };
            PaginationController.prototype.onBtPrevious = function () {
                this.currentPage--;
                this.loadPage();
            };
            PaginationController.prototype.onBtFirst = function () {
                this.currentPage = 0;
                this.loadPage();
            };
            PaginationController.prototype.onBtLast = function () {
                this.currentPage = this.totalPages - 1;
                this.loadPage();
            };
            PaginationController.prototype.isZeroPagesToDisplay = function () {
                return this.foundMaxRow && this.totalPages === 0;
            };
            PaginationController.prototype.enableOrDisableButtons = function () {
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
            PaginationController.prototype.createTemplate = function () {
                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                return template.replace('[PAGE]', localeTextFunc('page', 'Page')).replace('[TO]', localeTextFunc('to', 'to')).replace('[OF]', localeTextFunc('of', 'of')).replace('[OF]', localeTextFunc('of', 'of')).replace('[FIRST]', localeTextFunc('first', 'First')).replace('[PREVIOUS]', localeTextFunc('previous', 'Previous')).replace('[NEXT]', localeTextFunc('next', 'Next')).replace('[LAST]', localeTextFunc('last', 'Last'));
            };
            PaginationController.prototype.getGui = function () {
                return this.eGui;
            };
            PaginationController.prototype.setupComponents = function () {
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
                this.btNext.addEventListener('click', function () {
                    that.onBtNext();
                });
                this.btPrevious.addEventListener('click', function () {
                    that.onBtPrevious();
                });
                this.btFirst.addEventListener('click', function () {
                    that.onBtFirst();
                });
                this.btLast.addEventListener('click', function () {
                    that.onBtLast();
                });
            };
            return PaginationController;
        })();
        grid.PaginationController = PaginationController;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var TemplateService = (function () {
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
                    client.onload = function () {
                        that.handleHttpResult(this, url);
                    };
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
                    setTimeout(function () {
                        that.$scope.$apply();
                    }, 0);
                }
            };
            return TemplateService;
        })();
        grid.TemplateService = TemplateService;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../utils.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var BorderLayout = (function () {
            function BorderLayout(params) {
                this.isLayoutPanel = true;
                this.fullHeight = !params.north && !params.south;
                var template;
                if (!params.dontFill) {
                    if (this.fullHeight) {
                        template = '<div style="height: 100%; overflow: auto; position: relative;">' + '<div id="west" style="height: 100%; float: left;"></div>' + '<div id="east" style="height: 100%; float: right;"></div>' + '<div id="center" style="height: 100%;"></div>' + '<div id="overlay" style="position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' + '</div>';
                    }
                    else {
                        template = '<div style="height: 100%; position: relative;">' + '<div id="north"></div>' + '<div id="centerRow" style="height: 100%; overflow: hidden;">' + '<div id="west" style="height: 100%; float: left;"></div>' + '<div id="east" style="height: 100%; float: right;"></div>' + '<div id="center" style="height: 100%;"></div>' + '</div>' + '<div id="south"></div>' + '<div id="overlay" style="position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' + '</div>';
                    }
                    this.layoutActive = true;
                }
                else {
                    template = '<div style="position: relative;">' + '<div id="north"></div>' + '<div id="centerRow">' + '<div id="west"></div>' + '<div id="east"></div>' + '<div id="center"></div>' + '</div>' + '<div id="south"></div>' + '<div id="overlay" style="position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' + '</div>';
                    this.layoutActive = false;
                }
                this.eGui = _.loadTemplate(template);
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
            BorderLayout.prototype.setupPanels = function (params) {
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
            BorderLayout.prototype.setupPanel = function (content, ePanel) {
                if (!ePanel) {
                    return;
                }
                if (content) {
                    if (content.isLayoutPanel) {
                        this.childPanels.push(content);
                        ePanel.appendChild(content.getGui());
                        return content;
                    }
                    else {
                        ePanel.appendChild(content);
                        return null;
                    }
                }
                else {
                    ePanel.parentNode.removeChild(ePanel);
                    return null;
                }
            };
            BorderLayout.prototype.getGui = function () {
                return this.eGui;
            };
            // returns true if any item changed size, otherwise returns false
            BorderLayout.prototype.doLayout = function () {
                if (!_.isVisible(this.eGui)) {
                    return false;
                }
                var atLeastOneChanged = false;
                var childLayouts = [this.eNorthChildLayout, this.eSouthChildLayout, this.eEastChildLayout, this.eWestChildLayout];
                var that = this;
                _.forEach(childLayouts, function (childLayout) {
                    var childChangedSize = that.layoutChild(childLayout);
                    if (childChangedSize) {
                        atLeastOneChanged = true;
                    }
                });
                if (this.layoutActive) {
                    var ourHeightChanged = this.layoutHeight();
                    var ourWidthChanged = this.layoutWidth();
                    if (ourHeightChanged || ourWidthChanged) {
                        atLeastOneChanged = true;
                    }
                }
                var centerChanged = this.layoutChild(this.eCenterChildLayout);
                if (centerChanged) {
                    atLeastOneChanged = true;
                }
                return atLeastOneChanged;
            };
            BorderLayout.prototype.layoutChild = function (childPanel) {
                if (childPanel) {
                    return childPanel.doLayout();
                }
                else {
                    return false;
                }
            };
            BorderLayout.prototype.layoutHeight = function () {
                if (this.fullHeight) {
                    return false;
                }
                var totalHeight = _.offsetHeight(this.eGui);
                var northHeight = _.offsetHeight(this.eNorthWrapper);
                var southHeight = _.offsetHeight(this.eSouthWrapper);
                var centerHeight = totalHeight - northHeight - southHeight;
                if (centerHeight < 0) {
                    centerHeight = 0;
                }
                if (this.centerHeightLastTime !== centerHeight) {
                    this.eCenterRow.style.height = centerHeight + 'px';
                    this.centerHeightLastTime = centerHeight;
                    return true; // return true because there was a change
                }
                else {
                    return false;
                }
            };
            BorderLayout.prototype.layoutWidth = function () {
                var totalWidth = _.offsetWidth(this.eGui);
                var eastWidth = _.offsetWidth(this.eEastWrapper);
                var westWidth = _.offsetWidth(this.eWestWrapper);
                var centerWidth = totalWidth - eastWidth - westWidth;
                if (centerWidth < 0) {
                    centerWidth = 0;
                }
                this.eCenterWrapper.style.width = centerWidth + 'px';
            };
            BorderLayout.prototype.setEastVisible = function (visible) {
                if (this.eEastWrapper) {
                    this.eEastWrapper.style.display = visible ? '' : 'none';
                }
                this.doLayout();
            };
            BorderLayout.prototype.setOverlayVisible = function (visible) {
                if (this.eOverlayWrapper) {
                    this.eOverlayWrapper.style.display = visible ? '' : 'none';
                }
                this.doLayout();
            };
            BorderLayout.prototype.setSouthVisible = function (visible) {
                if (this.eSouthWrapper) {
                    this.eSouthWrapper.style.display = visible ? '' : 'none';
                }
                this.doLayout();
            };
            return BorderLayout;
        })();
        grid.BorderLayout = BorderLayout;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../utils.ts" />
/// <reference path="../layout/borderLayout.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var gridHtml = '<div>' + '<!-- header -->' + '<div class="ag-header">' + '<div class="ag-pinned-header"></div><div class="ag-header-viewport"><div class="ag-header-container"></div></div>' + '</div>' + '<!-- body -->' + '<div class="ag-body">' + '<div class="ag-pinned-cols-viewport">' + '<div class="ag-pinned-cols-container"></div>' + '</div>' + '<div class="ag-body-viewport-wrapper">' + '<div class="ag-body-viewport">' + '<div class="ag-body-container"></div>' + '</div>' + '</div>' + '</div>' + '</div>';
        var gridNoScrollsHtml = '<div>' + '<!-- header -->' + '<div class="ag-header-container"></div>' + '<!-- body -->' + '<div class="ag-body-container"></div>' + '</div>';
        // wrapping in outer div, and wrapper, is needed to center the loading icon
        // The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/
        var loadingHtml = '<div class="ag-loading-panel">' + '<div class="ag-loading-wrapper">' + '<span class="ag-loading-center">Loading...</span>' + '</div>' + '</div>';
        var utils = grid.Utils;
        var GridPanel = (function () {
            function GridPanel(gridOptionsWrapper) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                // makes code below more readable if we pull 'forPrint' out
                this.forPrint = this.gridOptionsWrapper.isDontUseScrolls();
                this.setupComponents();
                this.scrollWidth = utils.getScrollbarWidth();
            }
            GridPanel.prototype.setupComponents = function () {
                if (this.forPrint) {
                    this.eRoot = utils.loadTemplate(gridNoScrollsHtml);
                    utils.addCssClass(this.eRoot, 'ag-root ag-no-scrolls');
                }
                else {
                    this.eRoot = utils.loadTemplate(gridHtml);
                    utils.addCssClass(this.eRoot, 'ag-root ag-scrolls');
                }
                this.findElements();
                this.layout = new grid.BorderLayout({
                    overlay: utils.loadTemplate(loadingHtml),
                    center: this.eRoot,
                    dontFill: this.forPrint,
                    name: 'eGridPanel'
                });
                this.addScrollListener();
            };
            GridPanel.prototype.ensureIndexVisible = function (index) {
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
                }
                else if (viewportScrolledBeforeRow) {
                    // if row is below, scroll down with row at bottom
                    var newScrollPosition = rowBottomPixel - viewportHeight;
                    this.eBodyViewport.scrollTop = newScrollPosition;
                }
                // otherwise, row is already in view, so do nothing
            };
            GridPanel.prototype.ensureColIndexVisible = function (index) {
                if (typeof index !== 'number') {
                    console.warn('col index must be a number: ' + index);
                    return;
                }
                var columns = this.columnModel.getDisplayedColumns();
                if (typeof index !== 'number' || index < 0 || index >= columns.length) {
                    console.warn('invalid col index for ensureColIndexVisible: ' + index + ', should be between 0 and ' + (columns.length - 1));
                    return;
                }
                var column = columns[index];
                var pinnedColCount = this.gridOptionsWrapper.getPinnedColCount();
                if (index < pinnedColCount) {
                    console.warn('invalid col index for ensureColIndexVisible: ' + index + ', scrolling to a pinned col makes no sense');
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
                }
                else if (viewportScrolledBeforeCol) {
                    // if viewport's right side is before col's right side, scroll left to pull col into viewport at right
                    var newScrollPosition = colRightPixel - viewportWidth;
                    this.eBodyViewport.scrollLeft = newScrollPosition;
                }
                // otherwise, col is already in view, so do nothing
            };
            GridPanel.prototype.showLoading = function (loading) {
                this.layout.setOverlayVisible(loading);
            };
            GridPanel.prototype.getWidthForSizeColsToFit = function () {
                var availableWidth = this.eBody.clientWidth;
                var scrollShowing = this.eBodyViewport.clientHeight < this.eBodyViewport.scrollHeight;
                if (scrollShowing) {
                    availableWidth -= this.scrollWidth;
                }
                return availableWidth;
            };
            GridPanel.prototype.init = function (columnModel, rowRenderer) {
                this.columnModel = columnModel;
                this.rowRenderer = rowRenderer;
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
            GridPanel.prototype.getPinnedColsContainer = function () {
                return this.ePinnedColsContainer;
            };
            GridPanel.prototype.getHeaderContainer = function () {
                return this.eHeaderContainer;
            };
            GridPanel.prototype.getRoot = function () {
                return this.eRoot;
            };
            GridPanel.prototype.getPinnedHeader = function () {
                return this.ePinnedHeader;
            };
            GridPanel.prototype.getHeader = function () {
                return this.eHeader;
            };
            GridPanel.prototype.getRowsParent = function () {
                return this.eParentOfRows;
            };
            GridPanel.prototype.findElements = function () {
                if (this.forPrint) {
                    this.eHeaderContainer = this.eRoot.querySelector(".ag-header-container");
                    this.eBodyContainer = this.eRoot.querySelector(".ag-body-container");
                    // for no-scrolls, all rows live in the body container
                    this.eParentOfRows = this.eBodyContainer;
                }
                else {
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
            GridPanel.prototype.setBodyContainerWidth = function () {
                var mainRowWidth = this.columnModel.getBodyContainerWidth() + "px";
                this.eBodyContainer.style.width = mainRowWidth;
            };
            GridPanel.prototype.setPinnedColContainerWidth = function () {
                var pinnedColWidth = this.columnModel.getPinnedContainerWidth() + "px";
                this.ePinnedColsContainer.style.width = pinnedColWidth;
                this.eBodyViewportWrapper.style.marginLeft = pinnedColWidth;
            };
            GridPanel.prototype.showPinnedColContainersIfNeeded = function () {
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
                }
                else {
                    this.ePinnedHeader.style.display = 'none';
                    this.ePinnedColsViewport.style.display = 'none';
                }
            };
            GridPanel.prototype.setHeaderHeight = function () {
                var headerHeight = this.gridOptionsWrapper.getHeaderHeight();
                var headerHeightPixels = headerHeight + 'px';
                if (this.forPrint) {
                    this.eHeaderContainer.style['height'] = headerHeightPixels;
                }
                else {
                    this.eHeader.style['height'] = headerHeightPixels;
                    this.eBody.style['paddingTop'] = headerHeightPixels;
                }
            };
            // see if a grey box is needed at the bottom of the pinned col
            GridPanel.prototype.setPinnedColHeight = function () {
                if (!this.forPrint) {
                    var bodyHeight = this.eBodyViewport.offsetHeight;
                    this.ePinnedColsViewport.style.height = bodyHeight + "px";
                }
            };
            GridPanel.prototype.addScrollListener = function () {
                // if printing, then no scrolling, so no point in listening for scroll events
                if (this.forPrint) {
                    return;
                }
                var that = this;
                var lastLeftPosition = -1;
                var lastTopPosition = -1;
                this.eBodyViewport.addEventListener("scroll", function () {
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
                this.ePinnedColsViewport.addEventListener("scroll", function () {
                    // this means the pinned panel was moved, which can only
                    // happen when the user is navigating in the pinned container
                    // as the pinned col should never scroll. so we rollback
                    // the scroll on the pinned.
                    that.ePinnedColsViewport.scrollTop = 0;
                });
            };
            GridPanel.prototype.scrollHeader = function (bodyLeftPosition) {
                // this.eHeaderContainer.style.transform = 'translate3d(' + -bodyLeftPosition + "px,0,0)";
                this.eHeaderContainer.style.left = -bodyLeftPosition + "px";
            };
            GridPanel.prototype.scrollPinned = function (bodyTopPosition) {
                // this.ePinnedColsContainer.style.transform = 'translate3d(0,' + -bodyTopPosition + "px,0)";
                this.ePinnedColsContainer.style.top = -bodyTopPosition + "px";
            };
            return GridPanel;
        })();
        grid.GridPanel = GridPanel;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../utils.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var DragAndDropService = (function () {
            function DragAndDropService() {
                // need to clean this up, add to 'finished' logic in grid
                document.addEventListener('mouseup', this.stopDragging.bind(this));
            }
            DragAndDropService.getInstance = function () {
                if (!this.theInstance) {
                    this.theInstance = new DragAndDropService();
                }
                return this.theInstance;
            };
            DragAndDropService.prototype.stopDragging = function () {
                if (this.dragItem) {
                    this.setDragCssClasses(this.dragItem.eDragSource, false);
                    this.dragItem = null;
                }
            };
            DragAndDropService.prototype.setDragCssClasses = function (eListItem, dragging) {
                utils.addOrRemoveCssClass(eListItem, 'ag-dragging', dragging);
                utils.addOrRemoveCssClass(eListItem, 'ag-not-dragging', !dragging);
            };
            DragAndDropService.prototype.addDragSource = function (eDragSource, dragSourceCallback) {
                this.setDragCssClasses(eDragSource, false);
                eDragSource.addEventListener('mousedown', this.onMouseDownDragSource.bind(this, eDragSource, dragSourceCallback));
            };
            DragAndDropService.prototype.onMouseDownDragSource = function (eDragSource, dragSourceCallback) {
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
            DragAndDropService.prototype.addDropTarget = function (eDropTarget, dropTargetCallback) {
                var mouseIn = false;
                var acceptDrag = false;
                var that = this;
                eDropTarget.addEventListener('mouseover', function () {
                    if (!mouseIn) {
                        mouseIn = true;
                        if (that.dragItem) {
                            acceptDrag = dropTargetCallback.acceptDrag(that.dragItem);
                        }
                        else {
                            acceptDrag = false;
                        }
                    }
                });
                eDropTarget.addEventListener('mouseout', function () {
                    if (acceptDrag) {
                        dropTargetCallback.noDrop();
                    }
                    mouseIn = false;
                    acceptDrag = false;
                });
                eDropTarget.addEventListener('mouseup', function () {
                    // dragItem should never be null, checking just in case
                    if (acceptDrag && that.dragItem) {
                        dropTargetCallback.drop(that.dragItem);
                    }
                });
            };
            return DragAndDropService;
        })();
        grid.DragAndDropService = DragAndDropService;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../utils.ts" />
/// <reference path="../dragAndDrop/dragAndDropService" />
/// <amd-dependency path="text!agList.html"/>
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        //var template = require('./agList.html');
        var utils = grid.Utils;
        var dragAndDropService = grid.DragAndDropService.getInstance();
        var template = '<div class="ag-list-selection">' + '<div>' + '<div ag-repeat class="ag-list-item">' + '</div>' + '</div>' + '</div>';
        var NOT_DROP_TARGET = 0;
        var DROP_TARGET_ABOVE = 1;
        var DROP_TARGET_BELOW = -11;
        var AgList = (function () {
            function AgList() {
                this.setupComponents();
                this.uniqueId = 'CheckboxSelection-' + Math.random();
                this.modelChangedListeners = [];
                this.itemSelectedListeners = [];
                this.beforeDropListeners = [];
                this.dragSources = [];
                this.setupAsDropTarget();
            }
            AgList.prototype.setEmptyMessage = function (emptyMessage) {
                this.emptyMessage = emptyMessage;
                this.refreshView();
            };
            AgList.prototype.getUniqueId = function () {
                return this.uniqueId;
            };
            AgList.prototype.addStyles = function (styles) {
                utils.addStylesToElement(this.eGui, styles);
            };
            AgList.prototype.addCssClass = function (cssClass) {
                utils.addCssClass(this.eGui, cssClass);
            };
            AgList.prototype.addDragSource = function (dragSource) {
                this.dragSources.push(dragSource);
            };
            AgList.prototype.addModelChangedListener = function (listener) {
                this.modelChangedListeners.push(listener);
            };
            AgList.prototype.addItemSelectedListener = function (listener) {
                this.itemSelectedListeners.push(listener);
            };
            AgList.prototype.addBeforeDropListener = function (listener) {
                this.beforeDropListeners.push(listener);
            };
            AgList.prototype.fireModelChanged = function () {
                for (var i = 0; i < this.modelChangedListeners.length; i++) {
                    this.modelChangedListeners[i]();
                }
            };
            AgList.prototype.fireItemSelected = function (item) {
                for (var i = 0; i < this.itemSelectedListeners.length; i++) {
                    this.itemSelectedListeners[i](item);
                }
            };
            AgList.prototype.fireBeforeDrop = function (item) {
                for (var i = 0; i < this.beforeDropListeners.length; i++) {
                    this.beforeDropListeners[i](item);
                }
            };
            AgList.prototype.setupComponents = function () {
                this.eGui = utils.loadTemplate(template);
                this.eFilterValueTemplate = this.eGui.querySelector("[ag-repeat]");
                this.eListParent = this.eFilterValueTemplate.parentNode;
                utils.removeAllChildren(this.eListParent);
            };
            AgList.prototype.setModel = function (model) {
                this.model = model;
                this.refreshView();
            };
            AgList.prototype.getModel = function () {
                return this.model;
            };
            AgList.prototype.setCellRenderer = function (cellRenderer) {
                this.cellRenderer = cellRenderer;
            };
            AgList.prototype.refreshView = function () {
                utils.removeAllChildren(this.eListParent);
                if (this.model && this.model.length > 0) {
                    this.insertRows();
                }
                else {
                    this.insertBlankMessage();
                }
            };
            AgList.prototype.insertRows = function () {
                for (var i = 0; i < this.model.length; i++) {
                    var item = this.model[i];
                    //var text = this.getText(item);
                    //var selected = this.isSelected(item);
                    var eListItem = this.eFilterValueTemplate.cloneNode(true);
                    if (this.cellRenderer) {
                        var params = { value: item };
                        utils.useRenderer(eListItem, this.cellRenderer, params);
                    }
                    else {
                        eListItem.innerHTML = item;
                    }
                    eListItem.addEventListener('click', this.fireItemSelected.bind(this, item));
                    this.addDragAndDropToListItem(eListItem, item);
                    this.eListParent.appendChild(eListItem);
                }
            };
            AgList.prototype.insertBlankMessage = function () {
                if (this.emptyMessage) {
                    var eMessage = document.createElement('div');
                    eMessage.style.color = 'grey';
                    eMessage.style.padding = '4px';
                    eMessage.style.textAlign = 'center';
                    eMessage.innerHTML = this.emptyMessage;
                    this.eListParent.appendChild(eMessage);
                }
            };
            AgList.prototype.setupAsDropTarget = function () {
                dragAndDropService.addDropTarget(this.eGui, {
                    acceptDrag: this.externalAcceptDrag.bind(this),
                    drop: this.externalDrop.bind(this),
                    noDrop: this.externalNoDrop.bind(this)
                });
            };
            AgList.prototype.externalAcceptDrag = function (dragEvent) {
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
            AgList.prototype.externalDrop = function (dragEvent) {
                var newListItem = dragEvent.data;
                this.fireBeforeDrop(newListItem);
                this.addItemToList(newListItem);
                this.eGui.style.backgroundColor = '';
            };
            AgList.prototype.externalNoDrop = function () {
                this.eGui.style.backgroundColor = '';
            };
            AgList.prototype.addItemToList = function (newItem) {
                this.model.push(newItem);
                this.refreshView();
                this.fireModelChanged();
            };
            AgList.prototype.addDragAndDropToListItem = function (eListItem, item) {
                var that = this;
                dragAndDropService.addDragSource(eListItem, {
                    getData: function () {
                        return item;
                    },
                    getContainerId: function () {
                        return that.uniqueId;
                    }
                });
                dragAndDropService.addDropTarget(eListItem, {
                    acceptDrag: function (dragItem) {
                        return that.internalAcceptDrag(item, dragItem, eListItem);
                    },
                    drop: function (dragItem) {
                        that.internalDrop(item, dragItem.data);
                    },
                    noDrop: function () {
                        that.internalNoDrop(eListItem);
                    }
                });
            };
            AgList.prototype.internalAcceptDrag = function (targetColumn, dragItem, eListItem) {
                var result = dragItem.data !== targetColumn && dragItem.containerId === this.uniqueId;
                if (result) {
                    if (this.dragAfterThisItem(targetColumn, dragItem.data)) {
                        this.setDropCssClasses(eListItem, DROP_TARGET_ABOVE);
                    }
                    else {
                        this.setDropCssClasses(eListItem, DROP_TARGET_BELOW);
                    }
                }
                return result;
            };
            AgList.prototype.internalDrop = function (targetColumn, draggedColumn) {
                var oldIndex = this.model.indexOf(draggedColumn);
                var newIndex = this.model.indexOf(targetColumn);
                this.model.splice(oldIndex, 1);
                this.model.splice(newIndex, 0, draggedColumn);
                this.refreshView();
                this.fireModelChanged();
            };
            AgList.prototype.internalNoDrop = function (eListItem) {
                this.setDropCssClasses(eListItem, NOT_DROP_TARGET);
            };
            AgList.prototype.dragAfterThisItem = function (targetColumn, draggedColumn) {
                return this.model.indexOf(targetColumn) < this.model.indexOf(draggedColumn);
            };
            AgList.prototype.setDropCssClasses = function (eListItem, state) {
                utils.addOrRemoveCssClass(eListItem, 'ag-not-drop-target', state === NOT_DROP_TARGET);
                utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-above', state === DROP_TARGET_ABOVE);
                utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-below', state === DROP_TARGET_BELOW);
            };
            AgList.prototype.getGui = function () {
                return this.eGui;
            };
            return AgList;
        })();
        grid.AgList = AgList;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../widgets/agList.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../layout/BorderLayout.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var svgFactory = grid.SvgFactory.getInstance();
        var ColumnSelectionPanel = (function () {
            function ColumnSelectionPanel(columnController, gridOptionsWrapper) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.setupComponents();
                this.columnController = columnController;
                var that = this;
                this.columnController.addListener({
                    columnsChanged: that.columnsChanged.bind(that)
                });
            }
            ColumnSelectionPanel.prototype.columnsChanged = function (newColumns) {
                this.cColumnList.setModel(newColumns);
            };
            ColumnSelectionPanel.prototype.getDragSource = function () {
                return this.cColumnList.getUniqueId();
            };
            ColumnSelectionPanel.prototype.columnCellRenderer = function (params) {
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
            ColumnSelectionPanel.prototype.setupComponents = function () {
                this.cColumnList = new grid.AgList();
                this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));
                this.cColumnList.addStyles({ height: '100%', overflow: 'auto' });
                var that = this;
                this.cColumnList.addModelChangedListener(function () {
                    that.columnController.onColumnStateChanged();
                });
                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                var columnsLocalText = localeTextFunc('columns', 'Columns');
                var eNorthPanel = document.createElement('div');
                eNorthPanel.innerHTML = '<div style="text-align: center;">' + columnsLocalText + '</div>';
                this.layout = new grid.BorderLayout({
                    center: this.cColumnList.getGui(),
                    north: eNorthPanel
                });
            };
            // not sure if this is called anywhere
            ColumnSelectionPanel.prototype.setSelected = function (column, selected) {
                column.visible = selected;
                this.columnController.onColumnStateChanged();
            };
            ColumnSelectionPanel.prototype.getGui = function () {
                return this.eRootPanel.getGui();
            };
            return ColumnSelectionPanel;
        })();
        grid.ColumnSelectionPanel = ColumnSelectionPanel;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../widgets/agList.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../layout/BorderLayout.ts" />
/// <reference path="../constants.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var svgFactory = grid.SvgFactory.getInstance();
        var constants = grid.Constants;
        var GroupSelectionPanel = (function () {
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
            GroupSelectionPanel.prototype.columnsChanged = function (newColumns, newGroupedColumns) {
                this.cColumnList.setModel(newGroupedColumns);
            };
            GroupSelectionPanel.prototype.addDragSource = function (dragSource) {
                this.cColumnList.addDragSource(dragSource);
            };
            GroupSelectionPanel.prototype.columnCellRenderer = function (params) {
                var column = params.value;
                var colDisplayName = this.columnController.getDisplayNameForCol(column);
                var eResult = document.createElement('span');
                var eRemove = utils.createIcon('columnRemoveFromGroup', this.gridOptionsWrapper, column, svgFactory.createArrowUpSvg);
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
            GroupSelectionPanel.prototype.setupComponents = function () {
                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                var columnsLocalText = localeTextFunc('pivotedColumns', 'Pivoted Columns');
                var pivotedColumnsEmptyMessage = localeTextFunc('pivotedColumnsEmptyMessage', 'Drag columns from above to pivot');
                this.cColumnList = new grid.AgList();
                this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));
                this.cColumnList.addModelChangedListener(this.onGroupingChanged.bind(this));
                this.cColumnList.setEmptyMessage(pivotedColumnsEmptyMessage);
                this.cColumnList.addStyles({ height: '100%', overflow: 'auto' });
                var eNorthPanel = document.createElement('div');
                eNorthPanel.style.paddingTop = '10px';
                eNorthPanel.innerHTML = '<div style="text-align: center;">' + columnsLocalText + '</div>';
                this.layout = new grid.BorderLayout({
                    center: this.cColumnList.getGui(),
                    north: eNorthPanel
                });
            };
            GroupSelectionPanel.prototype.onGroupingChanged = function () {
                this.inMemoryRowController.doGrouping();
                this.inMemoryRowController.updateModel(constants.STEP_EVERYTHING);
                this.columnController.onColumnStateChanged();
            };
            return GroupSelectionPanel;
        })();
        grid.GroupSelectionPanel = GroupSelectionPanel;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../utils.ts" />
/// <reference path="./agList.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../widgets/agPopupService.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var svgFactory = grid.SvgFactory.getInstance();
        var agPopupService = grid.PopupService.getInstance();
        var AgDropdownList = (function () {
            function AgDropdownList() {
                this.setupComponents();
                this.itemSelectedListeners = [];
            }
            AgDropdownList.prototype.setWidth = function (width) {
                this.eValue.style.width = width + 'px';
                this.agList.addStyles({ width: width + 'px' });
            };
            AgDropdownList.prototype.addItemSelectedListener = function (listener) {
                this.itemSelectedListeners.push(listener);
            };
            AgDropdownList.prototype.fireItemSelected = function (item) {
                for (var i = 0; i < this.itemSelectedListeners.length; i++) {
                    this.itemSelectedListeners[i](item);
                }
            };
            AgDropdownList.prototype.setupComponents = function () {
                this.eGui = document.createElement('span');
                this.eValue = document.createElement('span');
                this.eGui.appendChild(this.eValue);
                this.agList = new grid.AgList();
                this.eValue.addEventListener('click', this.onClick.bind(this));
                this.agList.addItemSelectedListener(this.itemSelected.bind(this));
                this.agList.addCssClass('ag-popup-list');
                utils.addStylesToElement(this.eValue, {
                    border: '1px solid darkgrey',
                    display: 'inline-block',
                    paddingLeft: 2
                });
                utils.addStylesToElement(this.eGui, { position: 'relative' });
                this.agList.addStyles({
                    display: 'inline-block',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    backgroudColor: 'white'
                });
            };
            AgDropdownList.prototype.itemSelected = function (item) {
                this.setSelected(item);
                if (this.hidePopupCallback) {
                    this.hidePopupCallback();
                }
                this.fireItemSelected(item);
            };
            AgDropdownList.prototype.onClick = function () {
                var agListGui = this.agList.getGui();
                agPopupService.positionPopup(this.eGui, agListGui, -1);
                this.hidePopupCallback = agPopupService.addAsModalPopup(agListGui);
            };
            AgDropdownList.prototype.getGui = function () {
                return this.eGui;
            };
            AgDropdownList.prototype.setSelected = function (item) {
                this.selectedItem = item;
                this.refreshView();
            };
            AgDropdownList.prototype.setCellRenderer = function (cellRenderer) {
                this.agList.setCellRenderer(cellRenderer);
                this.cellRenderer = cellRenderer;
            };
            AgDropdownList.prototype.refreshView = function () {
                utils.removeAllChildren(this.eValue);
                if (this.selectedItem) {
                    if (this.cellRenderer) {
                        var params = { value: this.selectedItem };
                        utils.useRenderer(this.eValue, this.cellRenderer, params);
                    }
                    else {
                        this.eValue.appendChild(document.createTextNode(this.selectedItem));
                    }
                }
                var eDownIcon = svgFactory.createSmallArrowDownSvg();
                eDownIcon.style.float = 'right';
                eDownIcon.style.marginTop = '6';
                eDownIcon.style.marginRight = '2';
                this.eValue.appendChild(eDownIcon);
            };
            AgDropdownList.prototype.setModel = function (model) {
                this.agList.setModel(model);
            };
            return AgDropdownList;
        })();
        grid.AgDropdownList = AgDropdownList;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../widgets/agList.ts" />
/// <reference path="../constants.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../layout/borderLayout.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../widgets/agDropdownList.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var svgFactory = grid.SvgFactory.getInstance();
        var constants = grid.Constants;
        var utils = grid.Utils;
        var ValuesSelectionPanel = (function () {
            function ValuesSelectionPanel(columnController, gridOptionsWrapper, api) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.setupComponents();
                this.columnController = columnController;
                this.api = api;
                var that = this;
                this.columnController.addListener({
                    columnsChanged: that.columnsChanged.bind(that)
                });
            }
            ValuesSelectionPanel.prototype.columnsChanged = function (newColumns, newGroupedColumns, newValuesColumns) {
                this.cColumnList.setModel(newValuesColumns);
            };
            ValuesSelectionPanel.prototype.addDragSource = function (dragSource) {
                this.cColumnList.addDragSource(dragSource);
            };
            ValuesSelectionPanel.prototype.cellRenderer = function (params) {
                var column = params.value;
                var colDisplayName = this.columnController.getDisplayNameForCol(column);
                var eResult = document.createElement('span');
                var eRemove = utils.createIcon('columnRemoveFromGroup', this.gridOptionsWrapper, column, svgFactory.createArrowUpSvg);
                utils.addCssClass(eRemove, 'ag-visible-icons');
                eResult.appendChild(eRemove);
                var that = this;
                eRemove.addEventListener('click', function () {
                    var model = that.cColumnList.getModel();
                    model.splice(model.indexOf(column), 1);
                    that.cColumnList.setModel(model);
                    that.onValuesChanged();
                });
                var agValueType = new grid.AgDropdownList();
                agValueType.setModel([constants.SUM, constants.MIN, constants.MAX]);
                agValueType.setSelected(column.aggFunc);
                agValueType.setWidth(45);
                agValueType.addItemSelectedListener(function (item) {
                    column.aggFunc = item;
                    that.onValuesChanged();
                });
                eResult.appendChild(agValueType.getGui());
                var eValue = document.createElement('span');
                eValue.innerHTML = colDisplayName;
                eValue.style.paddingLeft = '2px';
                eResult.appendChild(eValue);
                return eResult;
            };
            ValuesSelectionPanel.prototype.setupComponents = function () {
                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                var columnsLocalText = localeTextFunc('valueColumns', 'Value Columns');
                var emptyMessage = localeTextFunc('valueColumnsEmptyMessage', 'Drag columns from above to create values');
                this.cColumnList = new grid.AgList();
                this.cColumnList.setCellRenderer(this.cellRenderer.bind(this));
                this.cColumnList.addModelChangedListener(this.onValuesChanged.bind(this));
                this.cColumnList.setEmptyMessage(emptyMessage);
                this.cColumnList.addStyles({ height: '100%', overflow: 'auto' });
                this.cColumnList.addBeforeDropListener(this.beforeDropListener.bind(this));
                var eNorthPanel = document.createElement('div');
                eNorthPanel.style.paddingTop = '10px';
                eNorthPanel.innerHTML = '<div style="text-align: center;">' + columnsLocalText + '</div>';
                this.layout = new grid.BorderLayout({
                    center: this.cColumnList.getGui(),
                    north: eNorthPanel
                });
            };
            ValuesSelectionPanel.prototype.beforeDropListener = function (newItem) {
                if (!newItem.aggFunc) {
                    newItem.aggFunc = constants.SUM;
                }
            };
            ValuesSelectionPanel.prototype.onValuesChanged = function () {
                this.api.recomputeAggregates();
            };
            return ValuesSelectionPanel;
        })();
        grid.ValuesSelectionPanel = ValuesSelectionPanel;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var VerticalStack = (function () {
            function VerticalStack() {
                this.isLayoutPanel = true;
                this.childPanels = [];
                this.eGui = document.createElement('div');
                this.eGui.style.height = '100%';
            }
            VerticalStack.prototype.addPanel = function (panel, height) {
                var component;
                if (panel.isLayoutPanel) {
                    this.childPanels.push(panel);
                    component = panel.getGui();
                }
                else {
                    component = panel;
                }
                if (height) {
                    component.style.height = height;
                }
                this.eGui.appendChild(component);
            };
            VerticalStack.prototype.getGui = function () {
                return this.eGui;
            };
            VerticalStack.prototype.doLayout = function () {
                for (var i = 0; i < this.childPanels.length; i++) {
                    this.childPanels[i].doLayout();
                }
            };
            return VerticalStack;
        })();
        grid.VerticalStack = VerticalStack;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="../utils.ts" />
/// <reference path="./columnSelectionPanel.ts" />
/// <reference path="./groupSelectionPanel.ts" />
/// <reference path="./valuesSelectionPanel.ts" />
/// <reference path="../layout/verticalStack.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var ToolPanel = (function () {
            function ToolPanel() {
                this.layout = new grid.VerticalStack();
            }
            ToolPanel.prototype.init = function (columnController, inMemoryRowController, gridOptionsWrapper, api) {
                var suppressPivotAndValues = gridOptionsWrapper.isToolPanelSuppressPivot();
                var suppressValues = gridOptionsWrapper.isToolPanelSuppressValues();
                var showPivot = !suppressPivotAndValues;
                var showValues = !suppressPivotAndValues && !suppressValues;
                // top list, column reorder and visibility
                var columnSelectionPanel = new grid.ColumnSelectionPanel(columnController, gridOptionsWrapper);
                var heightColumnSelection = suppressPivotAndValues ? '100%' : '50%';
                this.layout.addPanel(columnSelectionPanel.layout, heightColumnSelection);
                var dragSource = columnSelectionPanel.getDragSource();
                if (showValues) {
                    var valuesSelectionPanel = new grid.ValuesSelectionPanel(columnController, gridOptionsWrapper, api);
                    this.layout.addPanel(valuesSelectionPanel.layout, '25%');
                    valuesSelectionPanel.addDragSource(dragSource);
                }
                if (showPivot) {
                    var groupSelectionPanel = new grid.GroupSelectionPanel(columnController, inMemoryRowController, gridOptionsWrapper);
                    var heightPivotSelection = showValues ? '25%' : '50%';
                    this.layout.addPanel(groupSelectionPanel.layout, heightPivotSelection);
                    groupSelectionPanel.addDragSource(dragSource);
                }
                var eGui = this.layout.getGui();
                utils.addCssClass(eGui, 'ag-tool-panel-container');
            };
            return ToolPanel;
        })();
        grid.ToolPanel = ToolPanel;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="constants.ts" />
/// <reference path="gridOptionsWrapper.ts" />
/// <reference path="utils.ts" />
/// <reference path="filter/filterManager.ts" />
/// <reference path="columnController.ts" />
/// <reference path="selectionController.ts" />
/// <reference path="selectionRendererFactory.ts" />
/// <reference path="rowRenderer.ts" />
/// <reference path="headerRenderer.ts" />
/// <reference path="rowControllers/inMemoryRowController.ts" />
/// <reference path="rowControllers/virtualPageRowController.ts" />
/// <reference path="rowControllers/paginationController.ts" />
/// <reference path="expressionService.ts" />
/// <reference path="templateService.ts" />
/// <reference path="gridPanel/gridPanel.ts" />
/// <reference path="toolPanel/toolPanel.ts" />
/// <reference path="widgets/agPopupService.ts" />
/// <reference path="gridOptions.ts" />
var awk;
(function (awk) {
    var grid;
    (function (grid) {
        var constants = grid.Constants;
        var utils = grid.Utils;
        var agPopupService = grid.PopupService.getInstance();
        var Grid = (function () {
            function Grid(eGridDiv, gridOptions, $scope, $compile, quickFilterOnScope) {
                this.gridOptions = gridOptions;
                this.gridOptionsWrapper = new grid.GridOptionsWrapper(this.gridOptions);
                this.addApi();
                this.setupComponents($scope, $compile, eGridDiv);
                var that = this;
                this.quickFilter = null;
                // if using angular, watch for quickFilter changes
                if ($scope) {
                    $scope.$watch(quickFilterOnScope, function (newFilter) {
                        that.onQuickFilterChanged(newFilter);
                    });
                }
                this.virtualRowCallbacks = {};
                this.scrollWidth = utils.getScrollbarWidth();
                // done when cols change
                this.setupColumns();
                this.inMemoryRowController.setAllRows(this.gridOptionsWrapper.getAllRows());
                var forPrint = this.gridOptionsWrapper.isDontUseScrolls();
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
                this.finished = false;
                this.periodicallyDoLayout();
                // if ready function provided, use it
                if (typeof this.gridOptionsWrapper.getReady() == 'function') {
                    this.gridOptionsWrapper.getReady()(gridOptions.api);
                }
            }
            Grid.prototype.periodicallyDoLayout = function () {
                if (!this.finished) {
                    var that = this;
                    setTimeout(function () {
                        that.doLayout();
                        that.periodicallyDoLayout();
                    }, 500);
                }
            };
            Grid.prototype.setupComponents = function ($scope, $compile, eUserProvidedDiv) {
                // make local references, to make the below more human readable
                var gridOptionsWrapper = this.gridOptionsWrapper;
                var gridOptions = this.gridOptions;
                var forPrint = gridOptionsWrapper.isDontUseScrolls();
                // create all the beans
                var selectionController = new grid.SelectionController();
                var filterManager = new grid.FilterManager();
                var selectionRendererFactory = new grid.SelectionRendererFactory();
                var columnController = new grid.ColumnController();
                var rowRenderer = new grid.RowRenderer();
                var headerRenderer = new grid.HeaderRenderer();
                var inMemoryRowController = new grid.InMemoryRowController();
                var virtualPageRowController = new grid.VirtualPageRowController();
                var expressionService = new grid.ExpressionService();
                var templateService = new grid.TemplateService();
                var gridPanel = new grid.GridPanel(gridOptionsWrapper);
                var columnModel = columnController.getModel();
                // initialise all the beans
                templateService.init($scope);
                selectionController.init(this, gridPanel, gridOptionsWrapper, $scope, rowRenderer);
                filterManager.init(this, gridOptionsWrapper, $compile, $scope, expressionService, columnModel);
                selectionRendererFactory.init(this, selectionController);
                columnController.init(this, selectionRendererFactory, gridOptionsWrapper, expressionService);
                rowRenderer.init(gridOptions, columnModel, gridOptionsWrapper, gridPanel, this, selectionRendererFactory, $compile, $scope, selectionController, expressionService, templateService);
                headerRenderer.init(gridOptionsWrapper, columnController, columnModel, gridPanel, this, filterManager, $scope, $compile, expressionService);
                inMemoryRowController.init(gridOptionsWrapper, columnModel, this, filterManager, $scope, expressionService);
                virtualPageRowController.init(rowRenderer, gridOptionsWrapper, this);
                gridPanel.init(columnModel, rowRenderer);
                var toolPanelLayout = null;
                var eToolPanel = null;
                if (!forPrint) {
                    eToolPanel = new grid.ToolPanel();
                    toolPanelLayout = eToolPanel.layout;
                    eToolPanel.init(columnController, inMemoryRowController, gridOptionsWrapper, this.gridOptions.api);
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
                    paginationController = new grid.PaginationController();
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
                this.eRootPanel = new grid.BorderLayout({
                    center: gridPanel.layout,
                    east: toolPanelLayout,
                    south: paginationGui,
                    dontFill: forPrint,
                    name: 'eRootPanel'
                });
                agPopupService.init(this.eRootPanel.getGui());
                // default is we don't show paging panel, this is set to true when datasource is set
                this.eRootPanel.setSouthVisible(false);
                // see what the grid options are for default of toolbar
                this.showToolPanel(gridOptionsWrapper.isShowToolPanel());
                eUserProvidedDiv.appendChild(this.eRootPanel.getGui());
            };
            Grid.prototype.showToolPanel = function (show) {
                if (!this.eToolPanel) {
                    this.toolPanelShowing = false;
                    return;
                }
                this.toolPanelShowing = show;
                this.eRootPanel.setEastVisible(show);
            };
            Grid.prototype.isToolPanelShowing = function () {
                return this.toolPanelShowing;
            };
            Grid.prototype.setDatasource = function (datasource) {
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
                }
                else if (this.doingPagination) {
                    this.paginationController.setDatasource(datasourceToUse);
                    this.virtualPageRowController.setDatasource(null);
                    this.rowModel = this.inMemoryRowController.getModel();
                    showPagingPanel = true;
                }
                else {
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
            Grid.prototype.refreshHeaderAndBody = function () {
                this.headerRenderer.refreshHeader();
                this.headerRenderer.updateFilterIcons();
                this.headerRenderer.updateSortIcons();
                this.gridPanel.setBodyContainerWidth();
                this.gridPanel.setPinnedColContainerWidth();
                this.rowRenderer.refreshView();
            };
            Grid.prototype.setFinished = function () {
                window.removeEventListener('resize', this.doLayout);
                this.finished = true;
            };
            Grid.prototype.getQuickFilter = function () {
                return this.quickFilter;
            };
            Grid.prototype.onQuickFilterChanged = function (newFilter) {
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
            Grid.prototype.onFilterChanged = function () {
                this.headerRenderer.updateFilterIcons();
                if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
                    // if doing server side filtering, changing the sort has the impact
                    // of resetting the datasource
                    this.setDatasource();
                }
                else {
                    // if doing in memory filtering, we just update the in memory data
                    this.updateModelAndRefresh(constants.STEP_FILTER);
                }
            };
            Grid.prototype.onRowClicked = function (event, rowIndex, node) {
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
                var doDeselect = ctrlKeyPressed && selectionController.isNodeSelected(node) && gridOptionsWrapper.isRowDeselection();
                if (doDeselect) {
                    selectionController.deselectNode(node);
                }
                else {
                    var tryMulti = ctrlKeyPressed;
                    selectionController.selectNode(node, tryMulti);
                }
            };
            Grid.prototype.showLoadingPanel = function (show) {
                this.gridPanel.showLoading(show);
            };
            Grid.prototype.setupColumns = function () {
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
            Grid.prototype.updateModelAndRefresh = function (step, refreshFromIndex) {
                this.inMemoryRowController.updateModel(step);
                this.rowRenderer.refreshView(refreshFromIndex);
            };
            Grid.prototype.setRows = function (rows, firstId) {
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
            Grid.prototype.ensureNodeVisible = function (comparator) {
                if (this.doingVirtualPaging) {
                    throw 'Cannot use ensureNodeVisible when doing virtual paging, as we cannot check rows that are not in memory';
                }
                // look for the node index we want to display
                var rowCount = this.rowModel.getVirtualRowCount();
                var comparatorIsAFunction = typeof comparator === 'function';
                var indexToSelect = -1;
                for (var i = 0; i < rowCount; i++) {
                    var node = this.rowModel.getVirtualRow(i);
                    if (comparatorIsAFunction) {
                        if (comparator(node)) {
                            indexToSelect = i;
                            break;
                        }
                    }
                    else {
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
            Grid.prototype.getFilterModel = function () {
                return this.filterManager.getFilterModel();
            };
            Grid.prototype.addApi = function () {
                var that = this;
                var api = {
                    setDatasource: function (datasource) {
                        that.setDatasource(datasource);
                    },
                    onNewDatasource: function () {
                        that.setDatasource();
                    },
                    setRows: function (rows) {
                        that.setRows(rows);
                    },
                    onNewRows: function () {
                        that.setRows();
                    },
                    onNewCols: function () {
                        that.onNewCols();
                    },
                    unselectAll: function () {
                        console.error("unselectAll deprecated, call deselectAll instead");
                        this.deselectAll();
                    },
                    refreshView: function () {
                        that.rowRenderer.refreshView();
                    },
                    softRefreshView: function () {
                        that.rowRenderer.softRefreshView();
                    },
                    refreshGroupRows: function () {
                        that.rowRenderer.refreshGroupRows();
                    },
                    refreshHeader: function () {
                        // need to review this - the refreshHeader should also refresh all icons in the header
                        that.headerRenderer.refreshHeader();
                        that.headerRenderer.updateFilterIcons();
                    },
                    getModel: function () {
                        return that.rowModel;
                    },
                    onGroupExpandedOrCollapsed: function (refreshFromIndex) {
                        that.updateModelAndRefresh(constants.STEP_MAP, refreshFromIndex);
                    },
                    expandAll: function () {
                        that.inMemoryRowController.expandOrCollapseAll(true, null);
                        that.updateModelAndRefresh(constants.STEP_MAP);
                    },
                    collapseAll: function () {
                        that.inMemoryRowController.expandOrCollapseAll(false, null);
                        that.updateModelAndRefresh(constants.STEP_MAP);
                    },
                    addVirtualRowListener: function (rowIndex, callback) {
                        that.addVirtualRowListener(rowIndex, callback);
                    },
                    rowDataChanged: function (rows) {
                        that.rowRenderer.rowDataChanged(rows);
                    },
                    setQuickFilter: function (newFilter) {
                        that.onQuickFilterChanged(newFilter);
                    },
                    selectIndex: function (index, tryMulti, suppressEvents) {
                        that.selectionController.selectIndex(index, tryMulti, suppressEvents);
                    },
                    deselectIndex: function (index) {
                        that.selectionController.deselectIndex(index);
                    },
                    selectNode: function (node, tryMulti, suppressEvents) {
                        that.selectionController.selectNode(node, tryMulti, suppressEvents);
                    },
                    deselectNode: function (node) {
                        that.selectionController.deselectNode(node);
                    },
                    selectAll: function () {
                        that.selectionController.selectAll();
                        that.rowRenderer.refreshView();
                    },
                    deselectAll: function () {
                        that.selectionController.deselectAll();
                        that.rowRenderer.refreshView();
                    },
                    recomputeAggregates: function () {
                        that.inMemoryRowController.doAggregate();
                        that.rowRenderer.refreshGroupRows();
                    },
                    sizeColumnsToFit: function () {
                        if (that.gridOptionsWrapper.isDontUseScrolls()) {
                            console.warn('ag-grid: sizeColumnsToFit does not work when dontUseScrolls=true');
                            return;
                        }
                        var availableWidth = that.gridPanel.getWidthForSizeColsToFit();
                        that.columnController.sizeColumnsToFit(availableWidth);
                    },
                    showLoading: function (show) {
                        that.showLoadingPanel(show);
                    },
                    isNodeSelected: function (node) {
                        return that.selectionController.isNodeSelected(node);
                    },
                    getSelectedNodes: function () {
                        return that.selectionController.getSelectedNodes();
                    },
                    getBestCostNodeSelection: function () {
                        return that.selectionController.getBestCostNodeSelection();
                    },
                    ensureColIndexVisible: function (index) {
                        that.gridPanel.ensureColIndexVisible(index);
                    },
                    ensureIndexVisible: function (index) {
                        that.gridPanel.ensureIndexVisible(index);
                    },
                    ensureNodeVisible: function (comparator) {
                        that.ensureNodeVisible(comparator);
                    },
                    forEachInMemory: function (callback) {
                        that.rowModel.forEachInMemory(callback);
                    },
                    getFilterApiForColDef: function (colDef) {
                        console.warn('ag-grid API method getFilterApiForColDef deprecated, use getFilterApi instead');
                        return this.getFilterApi(colDef);
                    },
                    getFilterApi: function (key) {
                        var column = that.columnModel.getColumn(key);
                        return that.filterManager.getFilterApi(column);
                    },
                    getColumnDef: function (key) {
                        var column = that.columnModel.getColumn(key);
                        if (column) {
                            return column.colDef;
                        }
                        else {
                            return null;
                        }
                    },
                    onFilterChanged: function () {
                        that.onFilterChanged();
                    },
                    setSortModel: function (sortModel) {
                        that.setSortModel(sortModel);
                    },
                    getSortModel: function () {
                        return that.getSortModel();
                    },
                    setFilterModel: function (model) {
                        that.filterManager.setFilterModel(model);
                    },
                    getFilterModel: function () {
                        return that.getFilterModel();
                    },
                    getFocusedCell: function () {
                        return that.rowRenderer.getFocusedCell();
                    },
                    setFocusedCell: function (rowIndex, colIndex) {
                        that.setFocusedCell(rowIndex, colIndex);
                    },
                    showToolPanel: function (show) {
                        that.showToolPanel(show);
                    },
                    isToolPanelShowing: function () {
                        return that.isToolPanelShowing();
                    },
                    hideColumn: function (colId, hide) {
                        that.columnController.hideColumns([colId], hide);
                    },
                    hideColumns: function (colIds, hide) {
                        that.columnController.hideColumns(colIds, hide);
                    },
                    getColumnState: function () {
                        return that.columnController.getState();
                    },
                    setColumnState: function (state) {
                        that.columnController.setState(state);
                        that.inMemoryRowController.doGrouping();
                        that.inMemoryRowController.updateModel(constants.STEP_EVERYTHING);
                        that.refreshHeaderAndBody();
                    }
                };
                this.gridOptions.api = api;
            };
            Grid.prototype.setFocusedCell = function (rowIndex, colIndex) {
                this.gridPanel.ensureIndexVisible(rowIndex);
                this.gridPanel.ensureColIndexVisible(colIndex);
                var that = this;
                setTimeout(function () {
                    that.rowRenderer.setFocusedCell(rowIndex, colIndex);
                }, 10);
            };
            Grid.prototype.getSortModel = function () {
                var allColumns = this.columnModel.getAllColumns();
                var columnsWithSorting = [];
                var i;
                for (i = 0; i < allColumns.length; i++) {
                    if (allColumns[i].sort) {
                        columnsWithSorting.push(allColumns[i]);
                    }
                }
                columnsWithSorting.sort(function (a, b) {
                    return a.sortedAt - b.sortedAt;
                });
                var result = [];
                for (i = 0; i < columnsWithSorting.length; i++) {
                    var resultEntry = {
                        field: columnsWithSorting[i].colDef.field,
                        sort: columnsWithSorting[i].sort
                    };
                    result.push(resultEntry);
                }
                return result;
            };
            Grid.prototype.setSortModel = function (sortModel) {
                if (!this.gridOptionsWrapper.isEnableSorting()) {
                    console.warn('ag-grid: You are setting the sort model on a grid that does not have sorting enabled');
                    return;
                }
                // first up, clear any previous sort
                var sortModelProvided = sortModel !== null && sortModel !== undefined && sortModel.length > 0;
                var allColumns = this.columnModel.getAllColumns();
                for (var i = 0; i < allColumns.length; i++) {
                    var column = allColumns[i];
                    var sortForCol = null;
                    var sortedAt = -1;
                    if (sortModelProvided && !column.colDef.suppressSorting) {
                        for (var j = 0; j < sortModel.length; j++) {
                            var sortModelEntry = sortModel[j];
                            if (typeof sortModelEntry.field === 'string' && typeof column.colDef.field === 'string' && sortModelEntry.field === column.colDef.field) {
                                sortForCol = sortModelEntry.sort;
                                sortedAt = j;
                            }
                        }
                    }
                    if (sortForCol) {
                        column.sort = sortForCol;
                        column.sortedAt = sortedAt;
                    }
                    else {
                        column.sort = null;
                        column.sortedAt = null;
                    }
                }
                this.onSortingChanged();
            };
            Grid.prototype.onSortingChanged = function () {
                this.headerRenderer.updateSortIcons();
                if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
                    // if doing server side sorting, changing the sort has the impact
                    // of resetting the datasource
                    this.setDatasource();
                }
                else {
                    // if doing in memory sorting, we just update the in memory data
                    this.updateModelAndRefresh(constants.STEP_SORT);
                }
            };
            Grid.prototype.addVirtualRowListener = function (rowIndex, callback) {
                if (!this.virtualRowCallbacks[rowIndex]) {
                    this.virtualRowCallbacks[rowIndex] = [];
                }
                this.virtualRowCallbacks[rowIndex].push(callback);
            };
            Grid.prototype.onVirtualRowSelected = function (rowIndex, selected) {
                // inform the callbacks of the event
                if (this.virtualRowCallbacks[rowIndex]) {
                    this.virtualRowCallbacks[rowIndex].forEach(function (callback) {
                        if (typeof callback.rowRemoved === 'function') {
                            callback.rowSelected(selected);
                        }
                    });
                }
            };
            Grid.prototype.onVirtualRowRemoved = function (rowIndex) {
                // inform the callbacks of the event
                if (this.virtualRowCallbacks[rowIndex]) {
                    this.virtualRowCallbacks[rowIndex].forEach(function (callback) {
                        if (typeof callback.rowRemoved === 'function') {
                            callback.rowRemoved();
                        }
                    });
                }
                // remove the callbacks
                delete this.virtualRowCallbacks[rowIndex];
            };
            Grid.prototype.onNewCols = function () {
                this.setupColumns();
                this.updateModelAndRefresh(constants.STEP_EVERYTHING);
            };
            Grid.prototype.updateBodyContainerWidthAfterColResize = function () {
                this.rowRenderer.setMainRowWidths();
                this.gridPanel.setBodyContainerWidth();
            };
            Grid.prototype.updatePinnedColContainerWidthAfterColResize = function () {
                this.gridPanel.setPinnedColContainerWidth();
            };
            Grid.prototype.doLayout = function () {
                // need to do layout first, as drawVirtualRows and setPinnedColHeight
                // need to know the result of the resizing of the panels.
                var sizeChanged = this.eRootPanel.doLayout();
                // both of the two below should be done in gridPanel, the gridPanel should register 'resize' to the panel
                if (sizeChanged) {
                    this.rowRenderer.drawVirtualRows();
                    this.gridPanel.setPinnedColHeight();
                }
            };
            return Grid;
        })();
        grid.Grid = Grid;
    })(grid = awk.grid || (awk.grid = {}));
})(awk || (awk = {}));
/// <reference path="grid.ts" />
(function () {
    // Establish the root object, `window` or `exports`
    var root = this;
    // if angular is present, register the directive
    if (typeof angular !== 'undefined') {
        var angularModule = angular.module("angularGrid", []);
        angularModule.directive("angularGrid", function () {
            return {
                restrict: "A",
                controller: ['$element', '$scope', '$compile', AngularDirectiveController],
                scope: {
                    angularGrid: "="
                }
            };
        });
        angularModule.directive("agGrid", function () {
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
        }
        else {
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
        var grid = new awk.grid.Grid(eGridDiv, gridOptions, $scope, $compile, quickFilterOnScope);
        $scope.$on("$destroy", function () {
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
        }
        else {
            eGridDiv = element;
        }
        new awk.grid.Grid(eGridDiv, gridOptions, null, null, null);
    }
}).call(window);
