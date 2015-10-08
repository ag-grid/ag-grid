/**
 * ag-grid - Advanced Javascript Datagrid. Supports raw Javascript, AngularJS 1.x, AngularJS 2.0 and Web Components
 * @version v2.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
/// <references path='events.ts'/>
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var ColumnChangeEvent = (function () {
            function ColumnChangeEvent(type) {
                this.type = type;
            }
            ColumnChangeEvent.prototype.toString = function () {
                var result = 'ColumnChangeEvent {type: ' + this.type;
                if (this.column) {
                    result += ', column: ' + this.column.colId;
                }
                if (this.columnGroup) {
                    result += ', columnGroup: ' + this.columnGroup.name;
                }
                if (this.fromIndex) {
                    result += ', fromIndex: ' + this.fromIndex;
                }
                if (this.toIndex) {
                    result += ', toIndex: ' + this.toIndex;
                }
                if (this.pinnedColumnCount) {
                    result += ', pinnedColumnCount: ' + this.pinnedColumnCount;
                }
                if (typeof this.finished == 'boolean') {
                    result += ', finished: ' + this.finished;
                }
                result += '}';
                return result;
            };
            ColumnChangeEvent.prototype.withColumn = function (column) {
                this.column = column;
                return this;
            };
            ColumnChangeEvent.prototype.withFinished = function (finished) {
                this.finished = finished;
                return this;
            };
            ColumnChangeEvent.prototype.withColumnGroup = function (columnGroup) {
                this.columnGroup = columnGroup;
                return this;
            };
            ColumnChangeEvent.prototype.withFromIndex = function (fromIndex) {
                this.fromIndex = fromIndex;
                return this;
            };
            ColumnChangeEvent.prototype.withPinnedColumnCount = function (pinnedColumnCount) {
                this.pinnedColumnCount = pinnedColumnCount;
                return this;
            };
            ColumnChangeEvent.prototype.withToIndex = function (toIndex) {
                this.toIndex = toIndex;
                return this;
            };
            ColumnChangeEvent.prototype.getFromIndex = function () {
                return this.fromIndex;
            };
            ColumnChangeEvent.prototype.getToIndex = function () {
                return this.toIndex;
            };
            ColumnChangeEvent.prototype.getPinnedColumnCount = function () {
                return this.pinnedColumnCount;
            };
            ColumnChangeEvent.prototype.getType = function () {
                return this.type;
            };
            ColumnChangeEvent.prototype.getColumn = function () {
                return this.column;
            };
            ColumnChangeEvent.prototype.getColumnGroup = function () {
                return this.columnGroup;
            };
            ColumnChangeEvent.prototype.isPivotChanged = function () {
                return this.type === grid.Events.EVENT_COLUMN_PIVOT_CHANGE || this.type === grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED;
            };
            ColumnChangeEvent.prototype.isValueChanged = function () {
                return this.type === grid.Events.EVENT_COLUMN_VALUE_CHANGE || this.type === grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED;
            };
            ColumnChangeEvent.prototype.isIndividualColumnResized = function () {
                return this.type === grid.Events.EVENT_COLUMN_RESIZED && this.column !== undefined && this.column !== null;
            };
            ColumnChangeEvent.prototype.isFinished = function () {
                return this.finished;
            };
            return ColumnChangeEvent;
        })();
        grid.ColumnChangeEvent = ColumnChangeEvent;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
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
            Utils.cloneObject = function (object) {
                var copy = {};
                var keys = Object.keys(object);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var value = object[key];
                    copy[key] = value;
                }
                return copy;
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
            Utils.filter = function (array, callback) {
                var result = [];
                array.forEach(function (item) {
                    if (callback(item)) {
                        result.push(item);
                    }
                });
                return result;
            };
            Utils.assign = function (object, source) {
                Utils.iterateObject(source, function (key, value) {
                    object[key] = value;
                });
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
            //Returns true if it is a DOM node
            //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
            Utils.isNode = function (o) {
                return (typeof Node === "object" ? o instanceof Node :
                    o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string");
            };
            //Returns true if it is a DOM element
            //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
            Utils.isElement = function (o) {
                return (typeof HTMLElement === "object" ? o instanceof HTMLElement :
                    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string");
            };
            Utils.isNodeOrElement = function (o) {
                return this.isNode(o) || this.isElement(o);
            };
            //adds all type of change listeners to an element, intended to be a text field
            Utils.addChangeListener = function (element, listener) {
                element.addEventListener("changed", listener);
                element.addEventListener("paste", listener);
                element.addEventListener("input", listener);
                // IE doesn't fire changed for special keys (eg delete, backspace), so need to
                // listen for this further ones
                element.addEventListener("keydown", listener);
                element.addEventListener("keyup", listener);
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
            Utils.removeElement = function (parent, cssSelector) {
                this.removeFromParent(parent.querySelector(cssSelector));
            };
            Utils.removeFromParent = function (node) {
                if (node && node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            };
            Utils.isVisible = function (element) {
                return (element.offsetParent !== null);
            };
            /**
             * loads the template and returns it as an element. makes up for no simple way in
             * the dom api to load html directly, eg we cannot do this: document.createElement(template)
             */
            Utils.loadTemplate = function (template) {
                var tempDiv = document.createElement("div");
                tempDiv.innerHTML = template;
                return tempDiv.firstChild;
            };
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
                if (array.indexOf(object) >= 0) {
                    array.splice(array.indexOf(object), 1);
                }
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
            /**
             * Tries to use the provided renderer.
             */
            Utils.useRenderer = function (eParent, eRenderer, params) {
                var resultFromRenderer = eRenderer(params);
                //TypeScript type inference magic
                if (typeof resultFromRenderer === 'string') {
                    var eTextSpan = document.createElement('span');
                    eTextSpan.innerHTML = resultFromRenderer;
                    eParent.appendChild(eTextSpan);
                }
                else if (this.isNodeOrElement(resultFromRenderer)) {
                    //a dom node or element was returned, so add child
                    eParent.appendChild(resultFromRenderer);
                }
            };
            /**
             * If icon provided, use this (either a string, or a function callback).
             * if not, then use the second parameter, which is the svgFactory function
             */
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
            Utils.isBrowserIE = function () {
                return this.isIE;
            };
            Utils.isBrowserSafari = function () {
                return this.isSafari;
            };
            // taken from:
            // http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
            Utils.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
            Utils.isIE = false || !!document.documentMode; // At least IE6
            return Utils;
        })();
        grid.Utils = Utils;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
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
            Constants.KEY_BACKSPACE = 8;
            Constants.KEY_DELETE = 46;
            Constants.KEY_ESCAPE = 27;
            Constants.KEY_SPACE = 32;
            Constants.KEY_DOWN = 40;
            Constants.KEY_UP = 38;
            Constants.KEY_LEFT = 37;
            Constants.KEY_RIGHT = 39;
            return Constants;
        })();
        grid.Constants = Constants;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../constants.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var constants = grid.Constants;
        var Column = (function () {
            function Column(colDef, actualWidth) {
                this.colDef = colDef;
                this.actualWidth = actualWidth;
                this.visible = !colDef.hide;
                this.sort = colDef.sort;
                this.sortedAt = colDef.sortedAt;
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
            Column.prototype.isGreaterThanMax = function (width) {
                if (this.colDef.maxWidth >= constants.MIN_COL_WIDTH) {
                    return width > this.colDef.maxWidth;
                }
                else {
                    return false;
                }
            };
            Column.prototype.getMinimumWidth = function () {
                if (this.colDef.minWidth > constants.MIN_COL_WIDTH) {
                    return this.colDef.minWidth;
                }
                else {
                    return constants.MIN_COL_WIDTH;
                }
            };
            Column.prototype.setMinimum = function () {
                this.actualWidth = this.getMinimumWidth();
            };
            Column.colIdSequence = 0;
            return Column;
        })();
        grid.Column = Column;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var ColumnGroup = (function () {
            function ColumnGroup(pinned, name) {
                this.allColumns = [];
                this.displayedColumns = [];
                this.expandable = false;
                this.expanded = false;
                this.pinned = pinned;
                this.name = name;
            }
            ColumnGroup.prototype.getMinimumWidth = function () {
                var result = 0;
                this.displayedColumns.forEach(function (column) {
                    result += column.getMinimumWidth();
                });
                return result;
            };
            ColumnGroup.prototype.addColumn = function (column) {
                this.allColumns.push(column);
            };
            // need to check that this group has at least one col showing when both expanded and contracted.
            // if not, then we don't allow expanding and contracting on this group
            ColumnGroup.prototype.calculateExpandable = function () {
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
            ColumnGroup.prototype.calculateActualWidth = function () {
                var actualWidth = 0;
                this.displayedColumns.forEach(function (column) {
                    actualWidth += column.actualWidth;
                });
                this.actualWidth = actualWidth;
            };
            ColumnGroup.prototype.calculateDisplayedColumns = function () {
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
            ColumnGroup.prototype.addToVisibleColumns = function (colsToAdd) {
                for (var i = 0; i < this.displayedColumns.length; i++) {
                    var column = this.displayedColumns[i];
                    colsToAdd.push(column);
                }
            };
            return ColumnGroup;
        })();
        grid.ColumnGroup = ColumnGroup;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="constants.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var DEFAULT_ROW_HEIGHT = 25;
        var constants = grid.Constants;
        function isTrue(value) {
            return value === true || value === 'true';
        }
        var GridOptionsWrapper = (function () {
            function GridOptionsWrapper() {
            }
            GridOptionsWrapper.prototype.init = function (gridOptions, eventService) {
                this.gridOptions = gridOptions;
                this.headerHeight = gridOptions.headerHeight;
                this.groupHeaders = gridOptions.groupHeaders;
                this.rowHeight = gridOptions.rowHeight;
                this.floatingTopRowData = gridOptions.floatingTopRowData;
                this.floatingBottomRowData = gridOptions.floatingBottomRowData;
                eventService.addGlobalListener(this.globalEventHandler.bind(this));
                // set defaults
                if (!this.rowHeight) {
                    this.rowHeight = DEFAULT_ROW_HEIGHT;
                }
                this.checkForDeprecated();
            };
            GridOptionsWrapper.prototype.isRowSelection = function () { return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple"; };
            GridOptionsWrapper.prototype.isRowDeselection = function () { return isTrue(this.gridOptions.rowDeselection); };
            GridOptionsWrapper.prototype.isRowSelectionMulti = function () { return this.gridOptions.rowSelection === 'multiple'; };
            GridOptionsWrapper.prototype.getContext = function () { return this.gridOptions.context; };
            GridOptionsWrapper.prototype.isVirtualPaging = function () { return isTrue(this.gridOptions.virtualPaging); };
            GridOptionsWrapper.prototype.isShowToolPanel = function () { return isTrue(this.gridOptions.showToolPanel); };
            GridOptionsWrapper.prototype.isToolPanelSuppressPivot = function () { return isTrue(this.gridOptions.toolPanelSuppressPivot); };
            GridOptionsWrapper.prototype.isToolPanelSuppressValues = function () { return isTrue(this.gridOptions.toolPanelSuppressValues); };
            GridOptionsWrapper.prototype.isRowsAlreadyGrouped = function () { return isTrue(this.gridOptions.rowsAlreadyGrouped); };
            GridOptionsWrapper.prototype.isGroupSelectsChildren = function () { return isTrue(this.gridOptions.groupSelectsChildren); };
            GridOptionsWrapper.prototype.isGroupHidePivotColumns = function () { return isTrue(this.gridOptions.groupHidePivotColumns); };
            GridOptionsWrapper.prototype.isGroupIncludeFooter = function () { return isTrue(this.gridOptions.groupIncludeFooter); };
            GridOptionsWrapper.prototype.isGroupSuppressBlankHeader = function () { return isTrue(this.gridOptions.groupSuppressBlankHeader); };
            GridOptionsWrapper.prototype.isSuppressRowClickSelection = function () { return isTrue(this.gridOptions.suppressRowClickSelection); };
            GridOptionsWrapper.prototype.isSuppressCellSelection = function () { return isTrue(this.gridOptions.suppressCellSelection); };
            GridOptionsWrapper.prototype.isSuppressMultiSort = function () { return isTrue(this.gridOptions.suppressMultiSort); };
            GridOptionsWrapper.prototype.isGroupSuppressAutoColumn = function () { return isTrue(this.gridOptions.groupSuppressAutoColumn); };
            GridOptionsWrapper.prototype.isForPrint = function () { return isTrue(this.gridOptions.forPrint); };
            GridOptionsWrapper.prototype.isSuppressHorizontalScroll = function () { return isTrue(this.gridOptions.suppressHorizontalScroll); };
            GridOptionsWrapper.prototype.isUnSortIcon = function () { return isTrue(this.gridOptions.unSortIcon); };
            GridOptionsWrapper.prototype.isSuppressMenuHide = function () { return isTrue(this.gridOptions.suppressMenuHide); };
            GridOptionsWrapper.prototype.getRowStyle = function () { return this.gridOptions.rowStyle; };
            GridOptionsWrapper.prototype.getRowClass = function () { return this.gridOptions.rowClass; };
            GridOptionsWrapper.prototype.getRowStyleFunc = function () { return this.gridOptions.getRowStyle; };
            GridOptionsWrapper.prototype.getRowClassFunc = function () { return this.gridOptions.getRowClass; };
            GridOptionsWrapper.prototype.getHeaderCellRenderer = function () { return this.gridOptions.headerCellRenderer; };
            GridOptionsWrapper.prototype.getApi = function () { return this.gridOptions.api; };
            GridOptionsWrapper.prototype.isEnableColResize = function () { return isTrue(this.gridOptions.enableColResize); };
            GridOptionsWrapper.prototype.isSingleClickEdit = function () { return isTrue(this.gridOptions.singleClickEdit); };
            GridOptionsWrapper.prototype.getGroupDefaultExpanded = function () { return this.gridOptions.groupDefaultExpanded; };
            GridOptionsWrapper.prototype.getGroupKeys = function () { return this.gridOptions.groupKeys; };
            GridOptionsWrapper.prototype.getGroupAggFunction = function () { return this.gridOptions.groupAggFunction; };
            GridOptionsWrapper.prototype.getGroupAggFields = function () { return this.gridOptions.groupAggFields; };
            GridOptionsWrapper.prototype.getRowData = function () { return this.gridOptions.rowData; };
            GridOptionsWrapper.prototype.isGroupUseEntireRow = function () { return isTrue(this.gridOptions.groupUseEntireRow); };
            GridOptionsWrapper.prototype.getGroupColumnDef = function () { return this.gridOptions.groupColumnDef; };
            GridOptionsWrapper.prototype.isGroupSuppressRow = function () { return isTrue(this.gridOptions.groupSuppressRow); };
            GridOptionsWrapper.prototype.isAngularCompileRows = function () { return isTrue(this.gridOptions.angularCompileRows); };
            GridOptionsWrapper.prototype.isAngularCompileFilters = function () { return isTrue(this.gridOptions.angularCompileFilters); };
            GridOptionsWrapper.prototype.isAngularCompileHeaders = function () { return isTrue(this.gridOptions.angularCompileHeaders); };
            GridOptionsWrapper.prototype.isDebug = function () { return isTrue(this.gridOptions.debug); };
            GridOptionsWrapper.prototype.getColumnDefs = function () { return this.gridOptions.columnDefs; };
            GridOptionsWrapper.prototype.getDatasource = function () { return this.gridOptions.datasource; };
            GridOptionsWrapper.prototype.getRowBuffer = function () { return this.gridOptions.rowBuffer; };
            GridOptionsWrapper.prototype.isEnableSorting = function () { return isTrue(this.gridOptions.enableSorting) || isTrue(this.gridOptions.enableServerSideSorting); };
            GridOptionsWrapper.prototype.isEnableCellExpressions = function () { return isTrue(this.gridOptions.enableCellExpressions); };
            GridOptionsWrapper.prototype.isEnableServerSideSorting = function () { return isTrue(this.gridOptions.enableServerSideSorting); };
            GridOptionsWrapper.prototype.isEnableFilter = function () { return isTrue(this.gridOptions.enableFilter) || isTrue(this.gridOptions.enableServerSideFilter); };
            GridOptionsWrapper.prototype.isEnableServerSideFilter = function () { return this.gridOptions.enableServerSideFilter; };
            GridOptionsWrapper.prototype.isSuppressScrollLag = function () { return isTrue(this.gridOptions.suppressScrollLag); };
            GridOptionsWrapper.prototype.getIcons = function () { return this.gridOptions.icons; };
            GridOptionsWrapper.prototype.getIsScrollLag = function () { return this.gridOptions.isScrollLag; };
            GridOptionsWrapper.prototype.getSortingOrder = function () { return this.gridOptions.sortingOrder; };
            GridOptionsWrapper.prototype.getSlaveGrids = function () { return this.gridOptions.slaveGrids; };
            GridOptionsWrapper.prototype.getGroupRowRenderer = function () { return this.gridOptions.groupRowRenderer; };
            GridOptionsWrapper.prototype.getRowHeight = function () { return this.rowHeight; };
            GridOptionsWrapper.prototype.getOverlayLoadingTemplate = function () { return this.gridOptions.overlayLoadingTemplate; };
            GridOptionsWrapper.prototype.getOverlayNoRowsTemplate = function () { return this.gridOptions.overlayNoRowsTemplate; };
            // properties
            GridOptionsWrapper.prototype.getHeaderHeight = function () {
                if (typeof this.headerHeight === 'number') {
                    return this.headerHeight;
                }
                else {
                    // otherwise return 25 if no grouping, 50 if grouping
                    if (this.groupHeaders) {
                        return 50;
                    }
                    else {
                        return 25;
                    }
                }
            };
            GridOptionsWrapper.prototype.setHeaderHeight = function (headerHeight) { this.headerHeight = headerHeight; };
            GridOptionsWrapper.prototype.isGroupHeaders = function () { return isTrue(this.groupHeaders); };
            GridOptionsWrapper.prototype.setGroupHeaders = function (groupHeaders) { this.groupHeaders = groupHeaders; };
            GridOptionsWrapper.prototype.getFloatingTopRowData = function () { return this.floatingTopRowData; };
            GridOptionsWrapper.prototype.setFloatingTopRowData = function (rows) { this.floatingTopRowData = rows; };
            GridOptionsWrapper.prototype.getFloatingBottomRowData = function () { return this.floatingBottomRowData; };
            GridOptionsWrapper.prototype.setFloatingBottomRowData = function (rows) { this.floatingBottomRowData = rows; };
            GridOptionsWrapper.prototype.isExternalFilterPresent = function () {
                if (typeof this.gridOptions.isExternalFilterPresent === 'function') {
                    return this.gridOptions.isExternalFilterPresent();
                }
                else {
                    return false;
                }
            };
            GridOptionsWrapper.prototype.doesExternalFilterPass = function (node) {
                if (typeof this.gridOptions.doesExternalFilterPass === 'function') {
                    return this.gridOptions.doesExternalFilterPass(node);
                }
                else {
                    return false;
                }
            };
            GridOptionsWrapper.prototype.getGroupRowInnerRenderer = function () {
                return this.gridOptions.groupRowInnerRenderer;
            };
            GridOptionsWrapper.prototype.getColWidth = function () {
                if (typeof this.gridOptions.colWidth !== 'number' || this.gridOptions.colWidth < constants.MIN_COL_WIDTH) {
                    return 200;
                }
                else {
                    return this.gridOptions.colWidth;
                }
            };
            GridOptionsWrapper.prototype.checkForDeprecated = function () {
                // casting to generic object, so typescript compiles even though
                // we are looking for attributes that don't exist
                var options = this.gridOptions;
                if (options.suppressUnSort) {
                    console.warn('ag-grid: as of v1.12.4 suppressUnSort is not used. Please use sortOrder instead.');
                }
                if (options.suppressDescSort) {
                    console.warn('ag-grid: as of v1.12.4 suppressDescSort is not used. Please use sortOrder instead.');
                }
            };
            GridOptionsWrapper.prototype.getPinnedColCount = function () {
                // if not using scrolls, then pinned columns doesn't make
                // sense, so always return 0
                if (this.isForPrint()) {
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
                if (this.gridOptions.localeTextFunc) {
                    return this.gridOptions.localeTextFunc;
                }
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
            // responsible for calling the onXXX functions on gridOptions
            GridOptionsWrapper.prototype.globalEventHandler = function (eventName, event) {
                var callbackMethodName = this.getCallbackForEvent(eventName);
                if (typeof this.gridOptions[callbackMethodName] === 'function') {
                    this.gridOptions[callbackMethodName](event);
                }
            };
            GridOptionsWrapper.prototype.getCallbackForEvent = function (eventName) {
                if (!eventName || eventName.length < 2) {
                    return eventName;
                }
                else {
                    return 'on' + eventName[0].toUpperCase() + eventName.substr(1);
                }
            };
            return GridOptionsWrapper;
        })();
        grid.GridOptionsWrapper = GridOptionsWrapper;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var LoggerFactory = (function () {
            function LoggerFactory() {
            }
            LoggerFactory.prototype.init = function (gridOptionsWrapper) {
                this.logging = gridOptionsWrapper.isDebug();
            };
            LoggerFactory.prototype.create = function (name) {
                return new Logger(name, this.logging);
            };
            return LoggerFactory;
        })();
        grid.LoggerFactory = LoggerFactory;
        var Logger = (function () {
            function Logger(name, logging) {
                this.name = name;
                this.logging = logging;
            }
            Logger.prototype.log = function (message) {
                if (this.logging) {
                    console.log('ag-Grid.' + this.name + ': ' + message);
                }
            };
            return Logger;
        })();
        grid.Logger = Logger;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var Events = (function () {
            function Events() {
            }
            /** A new set of columns has been entered, everything has potentially changed. */
            Events.EVENT_COLUMN_EVERYTHING_CHANGED = 'columnEverythingChanged';
            /** A pivot column was added, removed or order changed. */
            Events.EVENT_COLUMN_PIVOT_CHANGE = 'columnPivotChanged';
            /** A value column was added, removed or agg function was changed. */
            Events.EVENT_COLUMN_VALUE_CHANGE = 'columnValueChanged';
            /** A column was moved */
            Events.EVENT_COLUMN_MOVED = 'columnMoved';
            /** One or more columns was shown / hidden */
            Events.EVENT_COLUMN_VISIBLE = 'columnVisible';
            /** A column group was opened / closed */
            Events.EVENT_COLUMN_GROUP_OPENED = 'columnGroupOpened';
            /** One or more columns was resized. If just one, the column in the event is set. */
            Events.EVENT_COLUMN_RESIZED = 'columnResized';
            /** One or more columns was resized. If just one, the column in the event is set. */
            Events.EVENT_COLUMN_PINNED_COUNT_CHANGED = 'columnPinnedCountChanged';
            Events.EVENT_MODEL_UPDATED = 'modelUpdated';
            Events.EVENT_CELL_CLICKED = 'cellClicked';
            Events.EVENT_CELL_DOUBLE_CLICKED = 'cellDoubleClicked';
            Events.EVENT_CELL_CONTEXT_MENU = 'cellContextMenu';
            Events.EVENT_CELL_VALUE_CHANGED = 'cellValueChanged';
            Events.EVENT_CELL_FOCUSED = 'cellFocused';
            Events.EVENT_ROW_SELECTED = 'rowSelected';
            Events.EVENT_ROW_DESELECTED = 'rowDeselected';
            Events.EVENT_SELECTION_CHANGED = 'selectionChanged';
            Events.EVENT_BEFORE_FILTER_CHANGED = 'beforeFilterChanged';
            Events.EVENT_AFTER_FILTER_CHANGED = 'afterFilterChanged';
            Events.EVENT_FILTER_MODIFIED = 'filterModified';
            Events.EVENT_BEFORE_SORT_CHANGED = 'beforeSortChanged';
            Events.EVENT_AFTER_SORT_CHANGED = 'afterSortChanged';
            Events.EVENT_VIRTUAL_ROW_REMOVED = 'virtualRowRemoved';
            Events.EVENT_ROW_CLICKED = 'rowClicked';
            Events.EVENT_ROW_DOUBLE_CLICKED = 'rowDoubleClicked';
            Events.EVENT_READY = 'ready';
            return Events;
        })();
        grid.Events = Events;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="utils.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var EventService = (function () {
            function EventService() {
                this.allListeners = {};
                this.globalListeners = [];
            }
            EventService.prototype.init = function (loggerFactory) {
                this.logger = loggerFactory.create('EventService');
            };
            EventService.prototype.getListenerList = function (eventType) {
                var listenerList = this.allListeners[eventType];
                if (!listenerList) {
                    listenerList = [];
                    this.allListeners[eventType] = listenerList;
                }
                return listenerList;
            };
            EventService.prototype.addEventListener = function (eventType, listener) {
                var listenerList = this.getListenerList(eventType);
                if (listenerList.indexOf(listener) < 0) {
                    listenerList.push(listener);
                }
            };
            EventService.prototype.addGlobalListener = function (listener) {
                this.globalListeners.push(listener);
            };
            EventService.prototype.removeEventListener = function (eventType, listener) {
                var listenerList = this.getListenerList(eventType);
                _.removeFromArray(listenerList, listener);
            };
            EventService.prototype.removeGlobalListener = function (listener) {
                _.removeFromArray(this.globalListeners, listener);
            };
            EventService.prototype.dispatchEvent = function (eventType, event) {
                if (!event) {
                    event = {};
                }
                //this.logger.log('dispatching: ' + event);
                var listenerList = this.getListenerList(eventType);
                listenerList.forEach(function (listener) {
                    listener(event);
                });
                this.globalListeners.forEach(function (listener) {
                    listener(eventType, event);
                });
            };
            return EventService;
        })();
        grid.EventService = EventService;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="columnController.ts" />
/// <reference path="gridOptionsWrapper.ts" />
/// <reference path="logger.ts" />
/// <reference path="events.ts" />
/// <reference path="eventService.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var MasterSlaveService = (function () {
            function MasterSlaveService() {
                // flag to mark if we are consuming. to avoid cyclic events (ie slave firing back to master
                // while processing a master event) we mark this if consuming an event, and if we are, then
                // we don't fire back any events.
                this.consuming = false;
            }
            MasterSlaveService.prototype.init = function (gridOptionsWrapper, columnController, gridPanel, loggerFactory, eventService) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.columnController = columnController;
                this.gridPanel = gridPanel;
                this.eventService = eventService;
                this.logger = loggerFactory.create('MasterSlaveService');
                eventService.addEventListener(grid.Events.EVENT_COLUMN_MOVED, this.fireColumnEvent.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_VISIBLE, this.fireColumnEvent.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_GROUP_OPENED, this.fireColumnEvent.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_RESIZED, this.fireColumnEvent.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_PINNED_COUNT_CHANGED, this.fireColumnEvent.bind(this));
            };
            // common logic across all the fire methods
            MasterSlaveService.prototype.fireEvent = function (callback) {
                // if we are already consuming, then we are acting on an event from a master,
                // so we don't cause a cyclic firing of events
                if (this.consuming) {
                    return;
                }
                // iterate through the slave grids, and pass each slave service to the callback
                var slaveGrids = this.gridOptionsWrapper.getSlaveGrids();
                if (slaveGrids) {
                    slaveGrids.forEach(function (slaveGridOptions) {
                        if (slaveGridOptions.api) {
                            var slaveService = slaveGridOptions.api.__getMasterSlaveService();
                            callback(slaveService);
                        }
                    });
                }
            };
            // common logic across all consume methods. very little common logic, however extracting
            // guarantees consistency across the methods.
            MasterSlaveService.prototype.onEvent = function (callback) {
                this.consuming = true;
                callback();
                this.consuming = false;
            };
            MasterSlaveService.prototype.fireColumnEvent = function (event) {
                this.fireEvent(function (slaveService) {
                    slaveService.onColumnEvent(event);
                });
            };
            MasterSlaveService.prototype.fireHorizontalScrollEvent = function (horizontalScroll) {
                this.fireEvent(function (slaveService) {
                    slaveService.onScrollEvent(horizontalScroll);
                });
            };
            MasterSlaveService.prototype.onScrollEvent = function (horizontalScroll) {
                var _this = this;
                this.onEvent(function () {
                    _this.gridPanel.setHorizontalScrollPosition(horizontalScroll);
                });
            };
            MasterSlaveService.prototype.onColumnEvent = function (event) {
                var _this = this;
                this.onEvent(function () {
                    // the column in the even is from the master grid. need to
                    // look up the equivalent from this (slave) grid
                    var masterColumn = event.getColumn();
                    var slaveColumn;
                    if (masterColumn) {
                        slaveColumn = _this.columnController.getColumn(masterColumn.colId);
                    }
                    // if event was with respect to a master column, that is not present in this
                    // grid, then we ignore the event
                    if (masterColumn && !slaveColumn) {
                        return;
                    }
                    // likewise for column group
                    var masterColumnGroup = event.getColumnGroup();
                    var slaveColumnGroup;
                    if (masterColumnGroup) {
                        slaveColumnGroup = _this.columnController.getColumnGroup(masterColumnGroup.name);
                    }
                    if (masterColumnGroup && !slaveColumnGroup) {
                        return;
                    }
                    switch (event.getType()) {
                        case grid.Events.EVENT_COLUMN_MOVED:
                            _this.logger.log('onColumnEvent-> processing ' + event + ' fromIndex = ' + event.getFromIndex() + ', toIndex = ' + event.getToIndex());
                            _this.columnController.moveColumn(event.getFromIndex(), event.getToIndex());
                            break;
                        case grid.Events.EVENT_COLUMN_VISIBLE:
                            _this.logger.log('onColumnEvent-> processing ' + event + ' visible = ' + masterColumn.visible);
                            _this.columnController.setColumnVisible(slaveColumn, masterColumn.visible);
                            break;
                        case grid.Events.EVENT_COLUMN_GROUP_OPENED:
                            _this.logger.log('onColumnEvent-> processing ' + event + ' expanded = ' + masterColumnGroup.expanded);
                            _this.columnController.columnGroupOpened(slaveColumnGroup, masterColumnGroup.expanded);
                            break;
                        case grid.Events.EVENT_COLUMN_RESIZED:
                            _this.logger.log('onColumnEvent-> processing ' + event + ' actualWidth = ' + masterColumn.actualWidth);
                            _this.columnController.setColumnWidth(slaveColumn, masterColumn.actualWidth, event.isFinished());
                            break;
                        case grid.Events.EVENT_COLUMN_PINNED_COUNT_CHANGED:
                            _this.logger.log('onColumnEvent-> processing ' + event);
                            _this.columnController.setPinnedColumnCount(event.getPinnedColumnCount());
                            break;
                    }
                });
            };
            return MasterSlaveService;
        })();
        grid.MasterSlaveService = MasterSlaveService;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="utils.ts" />
/// <reference path="constants.ts" />
/// <reference path="entities/column.ts" />
/// <reference path="entities/columnGroup.ts" />
/// <reference path="columnChangeEvent.ts" />
/// <reference path="masterSlaveService.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var constants = grid.Constants;
        var ColumnApi = (function () {
            function ColumnApi(_columnController) {
                this._columnController = _columnController;
            }
            ColumnApi.prototype.sizeColumnsToFit = function (gridWidth) { this._columnController.sizeColumnsToFit(gridWidth); };
            ColumnApi.prototype.hideColumns = function (colIds, hide) { this._columnController.hideColumns(colIds, hide); };
            ColumnApi.prototype.columnGroupOpened = function (group, newValue) { this._columnController.columnGroupOpened(group, newValue); };
            ColumnApi.prototype.getColumnGroup = function (name) { return this._columnController.getColumnGroup(name); };
            ColumnApi.prototype.getDisplayNameForCol = function (column) { return this._columnController.getDisplayNameForCol(column); };
            ColumnApi.prototype.getColumn = function (key) { return this._columnController.getColumn(key); };
            ColumnApi.prototype.setState = function (columnState) { return this._columnController.setState(columnState); };
            ColumnApi.prototype.getState = function () { return this._columnController.getState(); };
            ColumnApi.prototype.isPinning = function () { return this._columnController.isPinning(); };
            ColumnApi.prototype.getVisibleColAfter = function (col) { return this._columnController.getVisibleColAfter(col); };
            ColumnApi.prototype.getVisibleColBefore = function (col) { return this._columnController.getVisibleColBefore(col); };
            ColumnApi.prototype.setColumnVisible = function (column, visible) { this._columnController.setColumnVisible(column, visible); };
            ColumnApi.prototype.getAllColumns = function () { return this._columnController.getAllColumns(); };
            ColumnApi.prototype.getDisplayedColumns = function () { return this._columnController.getDisplayedColumns(); };
            ColumnApi.prototype.getPivotedColumns = function () { return this._columnController.getPivotedColumns(); };
            ColumnApi.prototype.getValueColumns = function () { return this._columnController.getValueColumns(); };
            ColumnApi.prototype.moveColumn = function (fromIndex, toIndex) { this._columnController.moveColumn(fromIndex, toIndex); };
            ColumnApi.prototype.movePivotColumn = function (fromIndex, toIndex) { this._columnController.movePivotColumn(fromIndex, toIndex); };
            ColumnApi.prototype.setColumnAggFunction = function (column, aggFunc) { this._columnController.setColumnAggFunction(column, aggFunc); };
            ColumnApi.prototype.setColumnWidth = function (column, newWidth, finished) {
                if (finished === void 0) { finished = true; }
                this._columnController.setColumnWidth(column, newWidth, finished);
            };
            ColumnApi.prototype.removeValueColumn = function (column) { this._columnController.removeValueColumn(column); };
            ColumnApi.prototype.addValueColumn = function (column) { this._columnController.addValueColumn(column); };
            ColumnApi.prototype.removePivotColumn = function (column) { this._columnController.removePivotColumn(column); };
            ColumnApi.prototype.setPinnedColumnCount = function (count) { this._columnController.setPinnedColumnCount(count); };
            ColumnApi.prototype.addPivotColumn = function (column) { this._columnController.addPivotColumn(column); };
            ColumnApi.prototype.getHeaderGroups = function () { return this._columnController.getHeaderGroups(); };
            ColumnApi.prototype.hideColumn = function (colId, hide) { this._columnController.hideColumns([colId], hide); };
            return ColumnApi;
        })();
        grid.ColumnApi = ColumnApi;
        var ColumnController = (function () {
            function ColumnController() {
                this.setupComplete = false;
            }
            ColumnController.prototype.init = function (angularGrid, selectionRendererFactory, gridOptionsWrapper, expressionService, valueService, masterSlaveController, eventService) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.angularGrid = angularGrid;
                this.selectionRendererFactory = selectionRendererFactory;
                this.expressionService = expressionService;
                this.valueService = valueService;
                this.masterSlaveController = masterSlaveController;
                this.eventService = eventService;
                this.pinnedColumnCount = gridOptionsWrapper.getPinnedColCount();
                // check for negative or non-number values
                if (!(this.pinnedColumnCount > 0)) {
                    this.pinnedColumnCount = 0;
                }
            };
            ColumnController.prototype.getColumnApi = function () {
                return new ColumnApi(this);
            };
            ColumnController.prototype.isSetupComplete = function () {
                return this.setupComplete;
            };
            // used by:
            // + headerRenderer -> setting pinned body width
            ColumnController.prototype.getHeaderGroups = function () {
                return this.columnGroups;
            };
            // used by:
            // + angularGrid -> setting pinned body width
            ColumnController.prototype.getPinnedContainerWidth = function () {
                return this.getTotalColWidth(true);
            };
            ColumnController.prototype.addPivotColumn = function (column) {
                if (this.allColumns.indexOf(column) < 0) {
                    console.warn('not a valid column: ' + column);
                    return;
                }
                if (this.pivotColumns.indexOf(column) >= 0) {
                    console.warn('column is already a value column');
                    return;
                }
                this.pivotColumns.push(column);
                // because we could be taking out 'pivot' columns, the displayed
                // columns may differ, so need to work out all the columns again
                this.updateModel();
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_PIVOT_CHANGE);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_PIVOT_CHANGE, event);
            };
            ColumnController.prototype.setPinnedColumnCount = function (count) {
                if (!(typeof count === 'number')) {
                    console.warn('ag-Grid: setPinnedColumnCount: count must be a number');
                    return;
                }
                if (count < 0) {
                    console.warn('ag-Grid: setPinnedColumnCount: count must be zero or greater');
                    return;
                }
                this.pinnedColumnCount = count;
                this.updateModel();
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_PINNED_COUNT_CHANGED).withPinnedColumnCount(count);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_PINNED_COUNT_CHANGED, event);
            };
            ColumnController.prototype.removePivotColumn = function (column) {
                if (this.pivotColumns.indexOf(column) < 0) {
                    console.warn('column not a pivot');
                    return;
                }
                _.removeFromArray(this.pivotColumns, column);
                this.updateModel();
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_PIVOT_CHANGE);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_PIVOT_CHANGE, event);
            };
            ColumnController.prototype.addValueColumn = function (column) {
                if (this.allColumns.indexOf(column) < 0) {
                    console.warn('not a valid column: ' + column);
                    return;
                }
                if (this.valueColumns.indexOf(column) >= 0) {
                    console.warn('column is already a value column');
                    return;
                }
                if (!column.aggFunc) {
                    column.aggFunc = constants.SUM;
                }
                this.valueColumns.push(column);
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_VALUE_CHANGE);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_VALUE_CHANGE, event);
            };
            ColumnController.prototype.removeValueColumn = function (column) {
                if (this.valueColumns.indexOf(column) < 0) {
                    console.warn('column not a value');
                    return;
                }
                _.removeFromArray(this.valueColumns, column);
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_VALUE_CHANGE);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_VALUE_CHANGE, event);
            };
            // returns true if the col is either in all columns or visible columns.
            // we need to check visible columns because the grouping column could come
            // from the gridOptions, so that's a special case
            ColumnController.prototype.doesColumnExistInGrid = function (column) {
                var columnInAllColumns = this.allColumns.indexOf(column) >= 0;
                var columnInVisibleColumns = this.visibleColumns.indexOf(column) >= 0;
                return columnInAllColumns || columnInVisibleColumns;
            };
            ColumnController.prototype.setColumnWidth = function (column, newWidth, finished) {
                if (!this.doesColumnExistInGrid(column)) {
                    console.warn('column does not exist');
                    return;
                }
                if (newWidth < column.getMinimumWidth()) {
                    newWidth = column.getMinimumWidth();
                }
                if (column.isGreaterThanMax(newWidth)) {
                    newWidth = column.colDef.maxWidth;
                }
                // check for change first, to avoid unnecessary firing of events
                // however we always fire 'finished' events. this is important
                // when groups are resized, as if the group is changing slowly,
                // eg 1 pixel at a time, then each change will fire change events
                // in all the columns in the group, but only one with get the pixel.
                if (finished || column.actualWidth !== newWidth) {
                    column.actualWidth = newWidth;
                    // if part of a group, update the groups width
                    this.updateGroupWidthsAfterColumnResize(column);
                    var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_RESIZED).withColumn(column).withFinished(finished);
                    this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_RESIZED, event);
                }
            };
            ColumnController.prototype.updateGroupWidthsAfterColumnResize = function (column) {
                if (this.columnGroups) {
                    this.columnGroups.forEach(function (columnGroup) {
                        if (columnGroup.displayedColumns.indexOf(column) >= 0) {
                            columnGroup.calculateActualWidth();
                        }
                    });
                }
            };
            ColumnController.prototype.setColumnAggFunction = function (column, aggFunc) {
                column.aggFunc = aggFunc;
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_VALUE_CHANGE);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_VALUE_CHANGE, event);
            };
            ColumnController.prototype.movePivotColumn = function (fromIndex, toIndex) {
                var column = this.pivotColumns[fromIndex];
                this.pivotColumns.splice(fromIndex, 1);
                this.pivotColumns.splice(toIndex, 0, column);
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_PIVOT_CHANGE);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_PIVOT_CHANGE, event);
            };
            ColumnController.prototype.moveColumn = function (fromIndex, toIndex) {
                var column = this.allColumns[fromIndex];
                this.allColumns.splice(fromIndex, 1);
                this.allColumns.splice(toIndex, 0, column);
                this.updateModel();
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_MOVED)
                    .withFromIndex(fromIndex)
                    .withToIndex(toIndex);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_MOVED, event);
            };
            // used by:
            // + angularGrid -> for setting body width
            // + rowController -> setting main row widths (when inserting and resizing)
            ColumnController.prototype.getBodyContainerWidth = function () {
                return this.getTotalColWidth(false);
            };
            // + rowController
            ColumnController.prototype.getValueColumns = function () {
                return this.valueColumns;
            };
            // + toolPanel
            ColumnController.prototype.getPivotedColumns = function () {
                return this.pivotColumns;
            };
            // + rowController -> while inserting rows, and when tabbing through cells (need to change this)
            // need a newMethod - get next col index
            ColumnController.prototype.getDisplayedColumns = function () {
                return this.displayedColumns;
            };
            // used by:
            // + inMemoryRowController -> sorting, building quick filter text
            // + headerRenderer -> sorting (clearing icon)
            ColumnController.prototype.getAllColumns = function () {
                return this.allColumns;
            };
            ColumnController.prototype.setColumnVisible = function (column, visible) {
                column.visible = visible;
                this.updateModel();
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_VISIBLE).withColumn(column);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_VISIBLE, event);
            };
            ColumnController.prototype.getVisibleColBefore = function (col) {
                var oldIndex = this.visibleColumns.indexOf(col);
                if (oldIndex > 0) {
                    return this.visibleColumns[oldIndex - 1];
                }
                else {
                    return null;
                }
            };
            // used by:
            // + rowRenderer -> for navigation
            ColumnController.prototype.getVisibleColAfter = function (col) {
                var oldIndex = this.visibleColumns.indexOf(col);
                if (oldIndex < (this.visibleColumns.length - 1)) {
                    return this.visibleColumns[oldIndex + 1];
                }
                else {
                    return null;
                }
            };
            ColumnController.prototype.isPinning = function () {
                return this.visibleColumns && this.visibleColumns.length > 0 && this.visibleColumns[0].pinned;
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
                    return colA.pivotIndex - colB.pivotIndex;
                });
                this.updateModel();
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED, event);
            };
            ColumnController.prototype.getColumns = function (keys) {
                var _this = this;
                var foundColumns = [];
                if (keys) {
                    keys.forEach(function (key) {
                        var column = _this.getColumn(key);
                        if (column) {
                            foundColumns.push(column);
                        }
                    });
                }
                return foundColumns;
            };
            ColumnController.prototype.getColumn = function (key) {
                if (!key) {
                    return null;
                }
                // need both allColumns and visibleColumns, in case the
                // grouping column that came from the grid options
                var listsToCheck = [this.allColumns, this.visibleColumns];
                for (var j = 0; j < listsToCheck.length; j++) {
                    var list = listsToCheck[j];
                    if (!list) {
                        continue;
                    }
                    for (var i = 0; i < list.length; i++) {
                        var colDefMatches = list[i].colDef === key;
                        var idMatches = list[i].colId === key;
                        if (colDefMatches || idMatches) {
                            return list[i];
                        }
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
                    else {
                        console.warn('ag-grid: headerValueGetter must be a function or a string');
                    }
                }
                else if (colDef.displayName) {
                    console.warn("ag-grid: Found displayName " + colDef.displayName + ", please use headerName instead, displayName is deprecated.");
                    return colDef.displayName;
                }
                else {
                    return colDef.headerName;
                }
            };
            ColumnController.prototype.getColumnGroup = function (name) {
                if (!name) {
                    return null;
                }
                if (this.columnGroups) {
                    for (var i = 0; i < this.columnGroups.length; i++) {
                        if (this.columnGroups[i].name === name) {
                            return this.columnGroups[i];
                        }
                    }
                }
            };
            // called by angularGrid
            ColumnController.prototype.onColumnsChanged = function () {
                var columnDefs = this.gridOptionsWrapper.getColumnDefs();
                this.checkForDeprecatedItems(columnDefs);
                this.createColumns(columnDefs);
                this.createPivotColumns();
                this.createValueColumns();
                this.updateModel();
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED, event);
                this.setupComplete = true;
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
            ColumnController.prototype.columnGroupOpened = function (group, newValue) {
                group.expanded = newValue;
                this.updateGroups();
                this.updateDisplayedColumns();
                var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_GROUP_OPENED).withColumnGroup(group);
                this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_GROUP_OPENED, event);
            };
            // called from API
            ColumnController.prototype.hideColumns = function (colIds, hide) {
                var _this = this;
                var updatedCols = [];
                this.allColumns.forEach(function (column) {
                    var idThisCol = column.colId;
                    var hideThisCol = colIds.indexOf(idThisCol) >= 0;
                    var newVisible = !hide;
                    if (hideThisCol && column.visible !== newVisible) {
                        column.visible = newVisible;
                        updatedCols.push(column);
                    }
                });
                if (updatedCols.length > 0) {
                    this.updateModel();
                    updatedCols.forEach(function (column) {
                        var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_VISIBLE)
                            .withColumn(column);
                        _this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_VISIBLE, event);
                    });
                }
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
                    for (var i = 0; i < this.columnGroups.length; i++) {
                        var group = this.columnGroups[i];
                        group.addToVisibleColumns(this.displayedColumns);
                    }
                }
            };
            // called from api
            ColumnController.prototype.sizeColumnsToFit = function (gridWidth) {
                var _this = this;
                // avoid divide by zero
                if (gridWidth <= 0 || this.displayedColumns.length === 0) {
                    return;
                }
                var colsToNotSpread = _.filter(this.displayedColumns, function (column) {
                    return column.colDef.suppressSizeToFit === true;
                });
                var colsToSpread = _.filter(this.displayedColumns, function (column) {
                    return column.colDef.suppressSizeToFit !== true;
                });
                // make a copy of the cols that are going to be resized
                var colsToFireEventFor = colsToSpread.slice(0);
                var finishedResizing = false;
                while (!finishedResizing) {
                    finishedResizing = true;
                    var availablePixels = gridWidth - getTotalWidth(colsToNotSpread);
                    if (availablePixels <= 0) {
                        // no width, set everything to minimum
                        colsToSpread.forEach(function (column) {
                            column.setMinimum();
                            _this.updateGroupWidthsAfterColumnResize(column);
                        });
                    }
                    else {
                        var scale = availablePixels / getTotalWidth(colsToSpread);
                        // we set the pixels for the last col based on what's left, as otherwise
                        // we could be a pixel or two short or extra because of rounding errors.
                        var pixelsForLastCol = availablePixels;
                        // backwards through loop, as we are removing items as we go
                        for (var i = colsToSpread.length - 1; i >= 0; i--) {
                            var column = colsToSpread[i];
                            var newWidth = Math.round(column.actualWidth * scale);
                            if (newWidth < column.getMinimumWidth()) {
                                column.setMinimum();
                                moveToNotSpread(column);
                                finishedResizing = false;
                            }
                            else if (column.isGreaterThanMax(newWidth)) {
                                column.actualWidth = column.colDef.maxWidth;
                                moveToNotSpread(column);
                                finishedResizing = false;
                            }
                            else {
                                var onLastCol = i === 0;
                                if (onLastCol) {
                                    column.actualWidth = pixelsForLastCol;
                                }
                                else {
                                    pixelsForLastCol -= newWidth;
                                    column.actualWidth = newWidth;
                                }
                            }
                            this.updateGroupWidthsAfterColumnResize(column);
                        }
                    }
                }
                // widths set, refresh the gui
                colsToFireEventFor.forEach(function (column) {
                    var event = new grid.ColumnChangeEvent(grid.Events.EVENT_COLUMN_RESIZED).withColumn(column);
                    _this.eventService.dispatchEvent(grid.Events.EVENT_COLUMN_RESIZED, event);
                });
                function moveToNotSpread(column) {
                    _.removeFromArray(colsToSpread, column);
                    colsToNotSpread.push(column);
                }
                function getTotalWidth(columns) {
                    var result = 0;
                    for (var i = 0; i < columns.length; i++) {
                        result += columns[i].actualWidth;
                    }
                    return result;
                }
            };
            ColumnController.prototype.buildGroups = function () {
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
                        currentGroup = new grid.ColumnGroup(pinned, column.colDef.headerGroup);
                        that.columnGroups.push(currentGroup);
                    }
                    currentGroup.addColumn(column);
                });
            };
            ColumnController.prototype.updateGroups = function () {
                // if not grouping by headers, do nothing
                if (!this.gridOptionsWrapper.isGroupHeaders()) {
                    return;
                }
                for (var i = 0; i < this.columnGroups.length; i++) {
                    var group = this.columnGroups[i];
                    group.calculateExpandable();
                    group.calculateDisplayedColumns();
                    group.calculateActualWidth();
                }
            };
            ColumnController.prototype.updateVisibleColumns = function () {
                this.visibleColumns = [];
                // see if we need to insert the default grouping column
                var needAGroupColumn = this.pivotColumns.length > 0
                    && !this.gridOptionsWrapper.isGroupSuppressAutoColumn()
                    && !this.gridOptionsWrapper.isGroupUseEntireRow()
                    && !this.gridOptionsWrapper.isGroupSuppressRow();
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
                    var groupColumnWidth = this.calculateColInitialWidth(groupColDef);
                    var groupColumn = new grid.Column(groupColDef, groupColumnWidth);
                    this.visibleColumns.push(groupColumn);
                }
                for (var i = 0; i < this.allColumns.length; i++) {
                    var column = this.allColumns[i];
                    var hideBecauseOfPivot = this.pivotColumns.indexOf(column) >= 0
                        && this.gridOptionsWrapper.isGroupHidePivotColumns();
                    if (column.visible && !hideBecauseOfPivot) {
                        column.index = this.visibleColumns.length;
                        this.visibleColumns.push(this.allColumns[i]);
                    }
                }
            };
            ColumnController.prototype.updatePinnedColumns = function () {
                for (var i = 0; i < this.visibleColumns.length; i++) {
                    var pinned = i < this.pinnedColumnCount;
                    this.visibleColumns[i].pinned = pinned;
                }
            };
            ColumnController.prototype.createColumns = function (colDefs) {
                this.allColumns = [];
                if (colDefs) {
                    for (var i = 0; i < colDefs.length; i++) {
                        var colDef = colDefs[i];
                        var width = this.calculateColInitialWidth(colDef);
                        var column = new grid.Column(colDef, width);
                        this.allColumns.push(column);
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
                // override with columns that have the aggFunc specified explicitly
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
                var column = new grid.Column(colDef, width);
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid_1) {
        var LINE_SEPARATOR = '\r\n';
        var CsvCreator = (function () {
            function CsvCreator(rowController, columnController, grid, valueService) {
                this.rowController = rowController;
                this.columnController = columnController;
                this.grid = grid;
                this.valueService = valueService;
            }
            CsvCreator.prototype.exportDataAsCsv = function (params) {
                var csvString = this.getDataAsCsv(params);
                var fileNamePresent = params && params.fileName && params.fileName.length !== 0;
                var fileName = fileNamePresent ? params.fileName : 'export.csv';
                // Internet Explorer
                if (window.navigator.msSaveOrOpenBlob) {
                    var fileData = [csvString];
                    var blobObject = new Blob(fileData);
                    window.navigator.msSaveOrOpenBlob(blobObject, fileName);
                }
                else {
                    // Chrome
                    var url = "data:text/plain;charset=utf-8," + encodeURIComponent(csvString);
                    var downloadLink = document.createElement("a");
                    downloadLink.href = url;
                    downloadLink.download = fileName;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
            };
            CsvCreator.prototype.getDataAsCsv = function (params) {
                var _this = this;
                if (!this.grid.isUsingInMemoryModel()) {
                    console.log('ag-Grid: getDataAsCsv not available when doing virtual pagination');
                    return '';
                }
                var result = '';
                var skipGroups = params && params.skipGroups;
                var skipHeader = params && params.skipHeader;
                var skipFooters = params && params.skipFooters;
                var includeCustomHeader = params && params.customHeader;
                var includeCustomFooter = params && params.customFooter;
                var columnsToExport = this.columnController.getDisplayedColumns();
                if (!columnsToExport || columnsToExport.length === 0) {
                    return '';
                }
                if (includeCustomHeader) {
                    result += params.customHeader;
                }
                // first pass, put in the header names of the cols
                if (!skipHeader) {
                    columnsToExport.forEach(function (column, index) {
                        var nameForCol = _this.columnController.getDisplayNameForCol(column);
                        if (nameForCol === null || nameForCol === undefined) {
                            nameForCol = '';
                        }
                        if (index != 0) {
                            result += ',';
                        }
                        result += '"' + _this.escape(nameForCol) + '"';
                    });
                    result += LINE_SEPARATOR;
                }
                this.rowController.forEachNodeAfterFilterAndSort(function (node) {
                    if (skipGroups && node.group) {
                        return;
                    }
                    if (skipFooters && node.footer) {
                        return;
                    }
                    columnsToExport.forEach(function (column, index) {
                        var valueForCell;
                        if (node.group && index === 0) {
                            valueForCell = _this.createValueForGroupNode(node);
                        }
                        else {
                            valueForCell = _this.valueService.getValue(column.colDef, node.data, node);
                        }
                        if (valueForCell === null || valueForCell === undefined) {
                            valueForCell = '';
                        }
                        if (index != 0) {
                            result += ',';
                        }
                        result += '"' + _this.escape(valueForCell) + '"';
                    });
                    result += LINE_SEPARATOR;
                });
                if (includeCustomFooter) {
                    result += params.customFooter;
                }
                return result;
            };
            CsvCreator.prototype.createValueForGroupNode = function (node) {
                var keys = [node.key];
                while (node.parent) {
                    node = node.parent;
                    keys.push(node.key);
                }
                return keys.reverse().join(' -> ');
            };
            // replace each " with "" (ie two sets of double quotes is how to do double quotes in csv)
            CsvCreator.prototype.escape = function (value) {
                if (value === null || value === undefined) {
                    return '';
                }
                var stringValue;
                if (typeof value === 'string') {
                    stringValue = value;
                }
                else if (typeof value.toString === 'function') {
                    stringValue = value.toString();
                }
                else {
                    console.warn('known value type during csv conversio');
                    stringValue = '';
                }
                return stringValue.replace(/"/g, "\"\"");
            };
            return CsvCreator;
        })();
        grid_1.CsvCreator = CsvCreator;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var ExpressionService = (function () {
            function ExpressionService() {
                this.expressionToFunctionCache = {};
            }
            ExpressionService.prototype.init = function (loggerFactory) {
                this.logger = loggerFactory.create('ExpressionService');
            };
            ExpressionService.prototype.evaluate = function (expression, params) {
                try {
                    var javaScriptFunction = this.createExpressionFunction(expression);
                    var result = javaScriptFunction(params.value, params.context, params.node, params.data, params.colDef, params.rowIndex, params.api, params.getValue);
                    return result;
                }
                catch (e) {
                    // the expression failed, which can happen, as it's the client that
                    // provides the expression. so print a nice message
                    this.logger.log('Processing of the expression failed');
                    this.logger.log('Expression = ' + expression);
                    this.logger.log('Exception = ' + e);
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
                var theFunction = new Function('x, ctx, node, data, colDef, rowIndex, api, getValue', functionBody);
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="textAndNumberFilterParameters.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var template = '<div>' +
            '<div>' +
            '<select class="ag-filter-select" id="filterType">' +
            '<option value="1">[CONTAINS]</option>' +
            '<option value="2">[EQUALS]</option>' +
            '<option value="3">[STARTS WITH]</option>' +
            '<option value="4">[ENDS WITH]</option>' +
            '</select>' +
            '</div>' +
            '<div>' +
            '<input class="ag-filter-filter" id="filterText" type="text" placeholder="[FILTER...]"/>' +
            '</div>' +
            '<div class="ag-filter-apply-panel" id="applyPanel">' +
            '<button type="button" id="applyButton">[APPLY FILTER]</button>' +
            '</div>' +
            '</div>';
        var CONTAINS = 1;
        var EQUALS = 2;
        var STARTS_WITH = 3;
        var ENDS_WITH = 4;
        var TextFilter = (function () {
            function TextFilter() {
            }
            TextFilter.prototype.init = function (params) {
                this.filterParams = params.filterParams;
                this.applyActive = this.filterParams && this.filterParams.apply == true;
                this.filterChangedCallback = params.filterChangedCallback;
                this.filterModifiedCallback = params.filterModifiedCallback;
                this.localeTextFunc = params.localeTextFunc;
                this.valueGetter = params.valueGetter;
                this.createGui();
                this.filterText = null;
                this.filterType = CONTAINS;
                this.createApi();
            };
            TextFilter.prototype.onNewRowsLoaded = function () {
                var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
                if (!keepSelection) {
                    this.api.setType(CONTAINS);
                    this.api.setFilter(null);
                }
            };
            TextFilter.prototype.afterGuiAttached = function () {
                this.eFilterTextField.focus();
            };
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
            TextFilter.prototype.getGui = function () {
                return this.eGui;
            };
            TextFilter.prototype.isFilterActive = function () {
                return this.filterText !== null;
            };
            TextFilter.prototype.createTemplate = function () {
                return template
                    .replace('[FILTER...]', this.localeTextFunc('filterOoo', 'Filter...'))
                    .replace('[EQUALS]', this.localeTextFunc('equals', 'Equals'))
                    .replace('[CONTAINS]', this.localeTextFunc('contains', 'Contains'))
                    .replace('[STARTS WITH]', this.localeTextFunc('startsWith', 'Starts with'))
                    .replace('[ENDS WITH]', this.localeTextFunc('endsWith', 'Ends with'))
                    .replace('[APPLY FILTER]', this.localeTextFunc('applyFilter', 'Apply Filter'));
            };
            TextFilter.prototype.createGui = function () {
                this.eGui = utils.loadTemplate(this.createTemplate());
                this.eFilterTextField = this.eGui.querySelector("#filterText");
                this.eTypeSelect = this.eGui.querySelector("#filterType");
                utils.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
                this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));
                this.setupApply();
            };
            TextFilter.prototype.setupApply = function () {
                var _this = this;
                if (this.applyActive) {
                    this.eApplyButton = this.eGui.querySelector('#applyButton');
                    this.eApplyButton.addEventListener('click', function () {
                        _this.filterChangedCallback();
                    });
                }
                else {
                    utils.removeElement(this.eGui, '#applyPanel');
                }
            };
            TextFilter.prototype.onTypeChanged = function () {
                this.filterType = parseInt(this.eTypeSelect.value);
                this.filterChanged();
            };
            TextFilter.prototype.onFilterChanged = function () {
                var filterText = utils.makeNull(this.eFilterTextField.value);
                if (filterText && filterText.trim() === '') {
                    filterText = null;
                }
                var newFilterText;
                if (filterText !== null && filterText !== undefined) {
                    newFilterText = filterText.toLowerCase();
                }
                else {
                    newFilterText = null;
                }
                if (this.filterText !== newFilterText) {
                    this.filterText = newFilterText;
                    this.filterChanged();
                }
            };
            TextFilter.prototype.filterChanged = function () {
                this.filterModifiedCallback();
                if (!this.applyActive) {
                    this.filterChangedCallback();
                }
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="textAndNumberFilterParameters.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var template = '<div>' +
            '<div>' +
            '<select class="ag-filter-select" id="filterType">' +
            '<option value="1">[EQUALS]</option>' +
            '<option value="2">[LESS THAN]</option>' +
            '<option value="3">[GREATER THAN]</option>' +
            '</select>' +
            '</div>' +
            '<div>' +
            '<input class="ag-filter-filter" id="filterText" type="text" placeholder="[FILTER...]"/>' +
            '</div>' +
            '<div class="ag-filter-apply-panel" id="applyPanel">' +
            '<button type="button" id="applyButton">[APPLY FILTER]</button>' +
            '</div>' +
            '</div>';
        var EQUALS = 1;
        var LESS_THAN = 2;
        var GREATER_THAN = 3;
        var NumberFilter = (function () {
            function NumberFilter() {
            }
            NumberFilter.prototype.init = function (params) {
                this.filterParams = params.filterParams;
                this.applyActive = this.filterParams && this.filterParams.apply == true;
                this.filterChangedCallback = params.filterChangedCallback;
                this.filterModifiedCallback = params.filterModifiedCallback;
                this.localeTextFunc = params.localeTextFunc;
                this.valueGetter = params.valueGetter;
                this.createGui();
                this.filterNumber = null;
                this.filterType = EQUALS;
                this.createApi();
            };
            NumberFilter.prototype.onNewRowsLoaded = function () {
                var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
                if (!keepSelection) {
                    this.api.setType(EQUALS);
                    this.api.setFilter(null);
                }
            };
            NumberFilter.prototype.afterGuiAttached = function () {
                this.eFilterTextField.focus();
            };
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
                        return valueAsNumber < this.filterNumber;
                    case GREATER_THAN:
                        return valueAsNumber > this.filterNumber;
                    default:
                        // should never happen
                        console.warn('invalid filter type ' + this.filterType);
                        return false;
                }
            };
            NumberFilter.prototype.getGui = function () {
                return this.eGui;
            };
            NumberFilter.prototype.isFilterActive = function () {
                return this.filterNumber !== null;
            };
            NumberFilter.prototype.createTemplate = function () {
                return template
                    .replace('[FILTER...]', this.localeTextFunc('filterOoo', 'Filter...'))
                    .replace('[EQUALS]', this.localeTextFunc('equals', 'Equals'))
                    .replace('[LESS THAN]', this.localeTextFunc('lessThan', 'Less than'))
                    .replace('[GREATER THAN]', this.localeTextFunc('greaterThan', 'Greater than'))
                    .replace('[APPLY FILTER]', this.localeTextFunc('applyFilter', 'Apply Filter'));
            };
            NumberFilter.prototype.createGui = function () {
                this.eGui = utils.loadTemplate(this.createTemplate());
                this.eFilterTextField = this.eGui.querySelector("#filterText");
                this.eTypeSelect = this.eGui.querySelector("#filterType");
                utils.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
                this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));
                this.setupApply();
            };
            NumberFilter.prototype.setupApply = function () {
                var _this = this;
                if (this.applyActive) {
                    this.eApplyButton = this.eGui.querySelector('#applyButton');
                    this.eApplyButton.addEventListener('click', function () {
                        _this.filterChangedCallback();
                    });
                }
                else {
                    utils.removeElement(this.eGui, '#applyPanel');
                }
            };
            NumberFilter.prototype.onTypeChanged = function () {
                this.filterType = parseInt(this.eTypeSelect.value);
                this.filterChanged();
            };
            NumberFilter.prototype.filterChanged = function () {
                this.filterModifiedCallback();
                if (!this.applyActive) {
                    this.filterChangedCallback();
                }
            };
            NumberFilter.prototype.onFilterChanged = function () {
                var filterText = utils.makeNull(this.eFilterTextField.value);
                if (filterText && filterText.trim() === '') {
                    filterText = null;
                }
                var newFilter;
                if (filterText !== null && filterText !== undefined) {
                    newFilter = parseFloat(filterText);
                }
                else {
                    newFilter = null;
                }
                if (this.filterNumber !== newFilter) {
                    this.filterNumber = newFilter;
                    this.filterChanged();
                }
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="../entities/colDef.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var SetFilterModel = (function () {
            function SetFilterModel(colDef, rowModel, valueGetter, doesRowPassOtherFilters) {
                this.colDef = colDef;
                this.rowModel = rowModel;
                this.valueGetter = valueGetter;
                this.doesRowPassOtherFilters = doesRowPassOtherFilters;
                this.filterParams = this.colDef.filterParams;
                this.usingProvidedSet = this.filterParams && this.filterParams.values;
                this.showingAvailableOnly = this.filterParams && !this.filterParams.suppressRemoveEntries;
                this.createAllUniqueValues();
                this.createAvailableUniqueValues();
                // by default, no filter, so we display everything
                this.displayedValues = this.availableUniqueValues;
                this.miniFilter = null;
                // we use a map rather than an array for the selected values as the lookup
                // for a map is much faster than the lookup for an array, especially when
                // the length of the array is thousands of records long
                this.selectedValuesMap = {};
                this.selectEverything();
            }
            // if keepSelection not set will always select all filters
            // if keepSelection set will keep current state of selected filters
            //    unless selectAll chosen in which case will select all
            SetFilterModel.prototype.refreshAfterNewRowsLoaded = function (keepSelection, isSelectAll) {
                this.createAllUniqueValues();
                this.createAvailableUniqueValues();
                var oldModel = Object.keys(this.selectedValuesMap);
                this.selectedValuesMap = {};
                this.processMiniFilter();
                if (keepSelection) {
                    this.setModel(oldModel, isSelectAll);
                }
                else {
                    this.selectEverything();
                }
            };
            SetFilterModel.prototype.refreshAfterAnyFilterChanged = function () {
                if (this.showingAvailableOnly) {
                    this.createAvailableUniqueValues();
                    this.processMiniFilter();
                }
            };
            SetFilterModel.prototype.createAllUniqueValues = function () {
                if (this.usingProvidedSet) {
                    this.allUniqueValues = _.toStrings(this.filterParams.values);
                }
                else {
                    this.allUniqueValues = _.toStrings(this.getUniqueValues(false));
                }
                if (this.colDef.comparator) {
                    this.allUniqueValues.sort(this.colDef.comparator);
                }
                else {
                    this.allUniqueValues.sort(_.defaultComparator);
                }
            };
            SetFilterModel.prototype.createAvailableUniqueValues = function () {
                var dontCheckAvailableValues = !this.showingAvailableOnly || this.usingProvidedSet;
                if (dontCheckAvailableValues) {
                    this.availableUniqueValues = this.allUniqueValues;
                    return;
                }
                this.availableUniqueValues = _.toStrings(this.getUniqueValues(true));
                if (this.colDef.comparator) {
                    this.availableUniqueValues.sort(this.colDef.comparator);
                }
                else {
                    this.availableUniqueValues.sort(_.defaultComparator);
                }
            };
            SetFilterModel.prototype.getUniqueValues = function (filterOutNotAvailable) {
                var _this = this;
                var uniqueCheck = {};
                var result = [];
                this.rowModel.forEachNode(function (node) {
                    if (!node.group) {
                        var value = _this.valueGetter(node);
                        if (value === "" || value === undefined) {
                            value = null;
                        }
                        if (filterOutNotAvailable) {
                            if (!_this.doesRowPassOtherFilters(node)) {
                                return;
                            }
                        }
                        if (value != null && Array.isArray(value)) {
                            for (var j = 0; j < value.length; j++) {
                                addUniqueValueIfMissing(value[j]);
                            }
                        }
                        else {
                            addUniqueValueIfMissing(value);
                        }
                    }
                });
                function addUniqueValueIfMissing(value) {
                    if (!uniqueCheck.hasOwnProperty(value)) {
                        result.push(value);
                        uniqueCheck[value] = 1;
                    }
                }
                return result;
            };
            //sets mini filter. returns true if it changed from last value, otherwise false
            SetFilterModel.prototype.setMiniFilter = function (newMiniFilter) {
                newMiniFilter = _.makeNull(newMiniFilter);
                if (this.miniFilter === newMiniFilter) {
                    //do nothing if filter has not changed
                    return false;
                }
                this.miniFilter = newMiniFilter;
                this.processMiniFilter();
                return true;
            };
            SetFilterModel.prototype.getMiniFilter = function () {
                return this.miniFilter;
            };
            SetFilterModel.prototype.processMiniFilter = function () {
                // if no filter, just use the unique values
                if (this.miniFilter === null) {
                    this.displayedValues = this.availableUniqueValues;
                    return;
                }
                // if filter present, we filter down the list
                this.displayedValues = [];
                var miniFilterUpperCase = this.miniFilter.toUpperCase();
                for (var i = 0, l = this.availableUniqueValues.length; i < l; i++) {
                    var filteredValue = this.availableUniqueValues[i];
                    if (filteredValue !== null && filteredValue.toString().toUpperCase().indexOf(miniFilterUpperCase) >= 0) {
                        this.displayedValues.push(filteredValue);
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
                var count = this.allUniqueValues.length;
                for (var i = 0; i < count; i++) {
                    var value = this.allUniqueValues[i];
                    this.selectedValuesMap[value] = null;
                }
                this.selectedValuesCount = count;
            };
            SetFilterModel.prototype.isFilterActive = function () {
                return this.allUniqueValues.length !== this.selectedValuesCount;
            };
            SetFilterModel.prototype.selectNothing = function () {
                this.selectedValuesMap = {};
                this.selectedValuesCount = 0;
            };
            SetFilterModel.prototype.getUniqueValueCount = function () {
                return this.allUniqueValues.length;
            };
            SetFilterModel.prototype.getUniqueValue = function (index) {
                return this.allUniqueValues[index];
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
                return this.allUniqueValues.length === this.selectedValuesCount;
            };
            SetFilterModel.prototype.isNothingSelected = function () {
                return this.allUniqueValues.length === 0;
            };
            SetFilterModel.prototype.getModel = function () {
                if (!this.isFilterActive()) {
                    return null;
                }
                var selectedValues = [];
                _.iterateObject(this.selectedValuesMap, function (key) {
                    selectedValues.push(key);
                });
                return selectedValues;
            };
            SetFilterModel.prototype.setModel = function (model, isSelectAll) {
                if (model && !isSelectAll) {
                    this.selectNothing();
                    for (var i = 0; i < model.length; i++) {
                        var newValue = model[i];
                        if (this.allUniqueValues.indexOf(newValue) >= 0) {
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/** The filter parameters for set filter */
/// <reference path="../utils.ts" />
/// <reference path="setFilterModel.ts" />
/// <reference path="setFilterParameters.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var template = '<div>' +
            '<div class="ag-filter-header-container">' +
            '<input class="ag-filter-filter" type="text" placeholder="[SEARCH...]"/>' +
            '</div>' +
            '<div class="ag-filter-header-container">' +
            '<label>' +
            '<input id="selectAll" type="checkbox" class="ag-filter-checkbox"/>' +
            '([SELECT ALL])' +
            '</label>' +
            '</div>' +
            '<div class="ag-filter-list-viewport">' +
            '<div class="ag-filter-list-container">' +
            '<div id="itemForRepeat" class="ag-filter-item">' +
            '<label>' +
            '<input type="checkbox" class="ag-filter-checkbox" filter-checkbox="true"/>' +
            '<span class="ag-filter-value"></span>' +
            '</label>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="ag-filter-apply-panel" id="applyPanel">' +
            '<button type="button" id="applyButton">[APPLY FILTER]</button>' +
            '</div>' +
            '</div>';
        var DEFAULT_ROW_HEIGHT = 20;
        var SetFilter = (function () {
            function SetFilter() {
            }
            SetFilter.prototype.init = function (params) {
                this.filterParams = params.filterParams;
                this.rowHeight = (this.filterParams && this.filterParams.cellHeight) ? this.filterParams.cellHeight : DEFAULT_ROW_HEIGHT;
                this.applyActive = this.filterParams && this.filterParams.apply == true;
                this.model = new grid.SetFilterModel(params.colDef, params.rowModel, params.valueGetter, params.doesRowPassOtherFilter);
                this.filterChangedCallback = params.filterChangedCallback;
                this.filterModifiedCallback = params.filterModifiedCallback;
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
            };
            // we need to have the gui attached before we can draw the virtual rows, as the
            // virtual row logic needs info about the gui state
            SetFilter.prototype.afterGuiAttached = function () {
                this.drawVirtualRows();
            };
            SetFilter.prototype.isFilterActive = function () {
                return this.model.isFilterActive();
            };
            SetFilter.prototype.doesFilterPass = function (node) {
                // if no filter, always pass
                if (this.model.isEverythingSelected()) {
                    return true;
                }
                // if nothing selected in filter, always fail
                if (this.model.isNothingSelected()) {
                    return false;
                }
                var value = this.valueGetter(node);
                value = _.makeNull(value);
                if (Array.isArray(value)) {
                    for (var i = 0; i < value.length; i++) {
                        if (this.model.isValueSelected(value[i])) {
                            return true;
                        }
                    }
                    return false;
                }
                else {
                    return this.model.isValueSelected(value);
                }
            };
            SetFilter.prototype.getGui = function () {
                return this.eGui;
            };
            SetFilter.prototype.onNewRowsLoaded = function () {
                var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
                var isSelectAll = this.eSelectAll && this.eSelectAll.checked && !this.eSelectAll.indeterminate;
                // default is reset
                this.model.refreshAfterNewRowsLoaded(keepSelection, isSelectAll);
                this.setContainerHeight();
                this.refreshVirtualRows();
            };
            SetFilter.prototype.onAnyFilterChanged = function () {
                this.model.refreshAfterAnyFilterChanged();
                this.setContainerHeight();
                this.refreshVirtualRows();
            };
            SetFilter.prototype.createTemplate = function () {
                return template
                    .replace('[SELECT ALL]', this.localeTextFunc('selectAll', 'Select All'))
                    .replace('[SEARCH...]', this.localeTextFunc('searchOoo', 'Search...'))
                    .replace('[APPLY FILTER]', this.localeTextFunc('applyFilter', 'Apply Filter'));
            };
            SetFilter.prototype.createGui = function () {
                var _this = this;
                this.eGui = _.loadTemplate(this.createTemplate());
                this.eListContainer = this.eGui.querySelector(".ag-filter-list-container");
                this.eFilterValueTemplate = this.eGui.querySelector("#itemForRepeat");
                this.eSelectAll = this.eGui.querySelector("#selectAll");
                this.eListViewport = this.eGui.querySelector(".ag-filter-list-viewport");
                this.eMiniFilter = this.eGui.querySelector(".ag-filter-filter");
                this.eListContainer.style.height = (this.model.getUniqueValueCount() * this.rowHeight) + "px";
                this.setContainerHeight();
                this.eMiniFilter.value = this.model.getMiniFilter();
                _.addChangeListener(this.eMiniFilter, function () {
                    _this.onMiniFilterChanged();
                });
                _.removeAllChildren(this.eListContainer);
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
                this.setupApply();
            };
            SetFilter.prototype.setupApply = function () {
                var _this = this;
                if (this.applyActive) {
                    this.eApplyButton = this.eGui.querySelector('#applyButton');
                    this.eApplyButton.addEventListener('click', function () {
                        _this.filterChangedCallback();
                    });
                }
                else {
                    _.removeElement(this.eGui, '#applyPanel');
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
                    if (_.isNode(resultFromRenderer)) {
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
                this.filterChanged();
            };
            SetFilter.prototype.filterChanged = function () {
                this.filterModifiedCallback();
                if (!this.applyActive) {
                    this.filterChangedCallback();
                }
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
                this.filterChanged();
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
                        that.eSelectAll.indeterminate = false;
                        that.eSelectAll.checked = true;
                        // not sure if we need to call this, as checking the checkout above might
                        // fire events.
                        model.selectEverything();
                    },
                    isFilterActive: function () {
                        return model.isFilterActive();
                    },
                    selectNothing: function () {
                        that.eSelectAll.indeterminate = false;
                        that.eSelectAll.checked = false;
                        // not sure if we need to call this, as checking the checkout above might
                        // fire events.
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="../constants.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var PopupService = (function () {
            function PopupService() {
            }
            PopupService.prototype.init = function (ePopupParent) {
                this.ePopupParent = ePopupParent;
            };
            PopupService.prototype.positionPopup = function (eventSource, ePopup, keepWithinBounds) {
                var sourceRect = eventSource.getBoundingClientRect();
                var parentRect = this.ePopupParent.getBoundingClientRect();
                var x = sourceRect.left - parentRect.left;
                var y = sourceRect.top - parentRect.top + sourceRect.height;
                // if popup is overflowing to the right, move it left
                if (keepWithinBounds) {
                    var minWidth;
                    if (ePopup.clientWidth > 0) {
                        minWidth = ePopup.clientWidth;
                    }
                    else {
                        minWidth = 200;
                    }
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
            PopupService.prototype.addAsModalPopup = function (eChild, closeOnEsc) {
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
                var that = this;
                // if we add these listeners now, then the current mouse
                // click will be included, which we don't want
                setTimeout(function () {
                    if (closeOnEsc) {
                        eBody.addEventListener('keydown', hidePopupOnEsc);
                    }
                    eBody.addEventListener('click', hidePopup);
                    eChild.addEventListener('click', consumeClick);
                }, 0);
                var eventFromChild = null;
                function hidePopupOnEsc(event) {
                    var key = event.which || event.keyCode;
                    if (key === grid.Constants.KEY_ESCAPE) {
                        hidePopup(null);
                    }
                }
                function hidePopup(event) {
                    if (event && event === eventFromChild) {
                        return;
                    }
                    that.ePopupParent.removeChild(eChild);
                    eBody.removeEventListener('keydown', hidePopupOnEsc);
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="textFilter.ts" />
/// <reference path="numberFilter.ts" />
/// <reference path="setFilter.ts" />
/// <reference path="../widgets/agPopupService.ts" />
/// <reference path="../widgets/agPopupService.ts" />
/// <reference path="../grid.ts" />
/// <reference path="../entities/rowNode.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid_2) {
        var _ = grid_2.Utils;
        var FilterManager = (function () {
            function FilterManager() {
            }
            FilterManager.prototype.init = function (grid, gridOptionsWrapper, $compile, $scope, columnController, popupService, valueService) {
                this.$compile = $compile;
                this.$scope = $scope;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.grid = grid;
                this.allFilters = {};
                this.columnController = columnController;
                this.popupService = popupService;
                this.valueService = valueService;
                this.columnController = columnController;
                this.quickFilter = null;
            };
            FilterManager.prototype.setFilterModel = function (model) {
                var _this = this;
                if (model) {
                    // mark the filters as we set them, so any active filters left over we stop
                    var modelKeys = Object.keys(model);
                    _.iterateObject(this.allFilters, function (colId, filterWrapper) {
                        _.removeFromArray(modelKeys, colId);
                        var newModel = model[colId];
                        _this.setModelOnFilterWrapper(filterWrapper.filter, newModel);
                    });
                    // at this point, processedFields contains data for which we don't have a filter working yet
                    _.iterateArray(modelKeys, function (colId) {
                        var column = _this.columnController.getColumn(colId);
                        if (!column) {
                            console.warn('Warning ag-grid setFilterModel - no column found for colId ' + colId);
                            return;
                        }
                        var filterWrapper = _this.getOrCreateFilterWrapper(column);
                        _this.setModelOnFilterWrapper(filterWrapper.filter, model[colId]);
                    });
                }
                else {
                    _.iterateObject(this.allFilters, function (key, filterWrapper) {
                        _this.setModelOnFilterWrapper(filterWrapper.filter, null);
                    });
                }
                this.grid.onFilterChanged();
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
                _.iterateObject(this.allFilters, function (key, filterWrapper) {
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
                        result[key] = model;
                    }
                });
                return result;
            };
            FilterManager.prototype.setRowModel = function (rowModel) {
                this.rowModel = rowModel;
            };
            // returns true if any advanced filter (ie not quick filter) active
            FilterManager.prototype.isAdvancedFilterPresent = function () {
                var atLeastOneActive = false;
                _.iterateObject(this.allFilters, function (key, filterWrapper) {
                    if (!filterWrapper.filter.isFilterActive) {
                        console.error('Filter is missing method isFilterActive');
                    }
                    if (filterWrapper.filter.isFilterActive()) {
                        atLeastOneActive = true;
                    }
                });
                return atLeastOneActive;
            };
            // returns true if quickFilter or advancedFilter
            FilterManager.prototype.isAnyFilterPresent = function () {
                return this.isQuickFilterPresent() || this.advancedFilterPresent || this.externalFilterPresent;
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
            FilterManager.prototype.doesFilterPass = function (node, filterToSkip) {
                var data = node.data;
                var colKeys = Object.keys(this.allFilters);
                for (var i = 0, l = colKeys.length; i < l; i++) {
                    var colId = colKeys[i];
                    var filterWrapper = this.allFilters[colId];
                    // if no filter, always pass
                    if (filterWrapper === undefined) {
                        continue;
                    }
                    if (filterWrapper.filter === filterToSkip) {
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
            // returns true if it has changed (not just same value again)
            FilterManager.prototype.setQuickFilter = function (newFilter) {
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
                    return true;
                }
                else {
                    return false;
                }
            };
            FilterManager.prototype.onFilterChanged = function () {
                this.advancedFilterPresent = this.isAdvancedFilterPresent();
                this.externalFilterPresent = this.gridOptionsWrapper.isExternalFilterPresent();
                _.iterateObject(this.allFilters, function (key, filterWrapper) {
                    if (filterWrapper.filter.onAnyFilterChanged) {
                        filterWrapper.filter.onAnyFilterChanged();
                    }
                });
            };
            FilterManager.prototype.isQuickFilterPresent = function () {
                return this.quickFilter !== null;
            };
            FilterManager.prototype.doesRowPassOtherFilters = function (filterToSkip, node) {
                return this.doesRowPassFilter(node, filterToSkip);
            };
            FilterManager.prototype.doesRowPassFilter = function (node, filterToSkip) {
                //first up, check quick filter
                if (this.isQuickFilterPresent()) {
                    if (!node.quickFilterAggregateText) {
                        this.aggregateRowForQuickFilter(node);
                    }
                    if (node.quickFilterAggregateText.indexOf(this.quickFilter) < 0) {
                        //quick filter fails, so skip item
                        return false;
                    }
                }
                //secondly, give the client a chance to reject this row
                if (this.externalFilterPresent) {
                    if (!this.gridOptionsWrapper.doesExternalFilterPass(node)) {
                        return false;
                    }
                }
                //lastly, check our internal advanced filter
                if (this.advancedFilterPresent) {
                    if (!this.doesFilterPass(node, filterToSkip)) {
                        return false;
                    }
                }
                //got this far, all filters pass
                return true;
            };
            FilterManager.prototype.aggregateRowForQuickFilter = function (node) {
                var aggregatedText = '';
                var that = this;
                this.columnController.getAllColumns().forEach(function (column) {
                    var data = node.data;
                    var value = that.valueService.getValue(column.colDef, data, node);
                    if (value && value !== '') {
                        aggregatedText = aggregatedText + value.toString().toUpperCase() + "_";
                    }
                });
                node.quickFilterAggregateText = aggregatedText;
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
            FilterManager.prototype.createValueGetter = function (column) {
                var that = this;
                return function valueGetter(node) {
                    return that.valueService.getValue(column.colDef, node.data, node);
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
                if (typeof colDef.filter === 'function') {
                    // if user provided a filter, just use it
                    // first up, create child scope if needed
                    if (this.gridOptionsWrapper.isAngularCompileFilters()) {
                        filterWrapper.scope = this.$scope.$new();
                        ;
                    }
                    // now create filter (had to cast to any to get 'new' working)
                    this.assertMethodHasNoParameters(colDef.filter);
                    filterWrapper.filter = new colDef.filter();
                }
                else if (colDef.filter === 'text') {
                    filterWrapper.filter = new grid_2.TextFilter();
                }
                else if (colDef.filter === 'number') {
                    filterWrapper.filter = new grid_2.NumberFilter();
                }
                else {
                    filterWrapper.filter = new grid_2.SetFilter();
                }
                var filterChangedCallback = this.grid.onFilterChanged.bind(this.grid);
                var filterModifiedCallback = this.grid.onFilterModified.bind(this.grid);
                var doesRowPassOtherFilters = this.doesRowPassOtherFilters.bind(this, filterWrapper.filter);
                var filterParams = colDef.filterParams;
                var params = {
                    colDef: colDef,
                    rowModel: this.rowModel,
                    filterChangedCallback: filterChangedCallback,
                    filterModifiedCallback: filterModifiedCallback,
                    filterParams: filterParams,
                    localeTextFunc: this.gridOptionsWrapper.getLocaleTextFunc(),
                    valueGetter: this.createValueGetter(column),
                    doesRowPassOtherFilter: doesRowPassOtherFilters,
                    context: this.gridOptionsWrapper.getContext,
                    $scope: filterWrapper.scope
                };
                if (!filterWrapper.filter.init) {
                    throw 'Filter is missing method init';
                }
                filterWrapper.filter.init(params);
                if (!filterWrapper.filter.getGui) {
                    throw 'Filter is missing method getGui';
                }
                var eFilterGui = document.createElement('div');
                eFilterGui.className = 'ag-filter';
                var guiFromFilter = filterWrapper.filter.getGui();
                if (_.isNodeOrElement(guiFromFilter)) {
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
            FilterManager.prototype.assertMethodHasNoParameters = function (theMethod) {
                var getRowsParams = _.getFunctionParameters(theMethod);
                if (getRowsParams.length > 0) {
                    console.warn('ag-grid: It looks like your filter is of the old type and expecting parameters in the constructor.');
                    console.warn('ag-grid: From ag-grid 1.14, the constructor should take no parameters and init() used instead.');
                }
            };
            FilterManager.prototype.showFilter = function (column, eventSource) {
                var filterWrapper = this.getOrCreateFilterWrapper(column);
                // need to show filter before positioning, as only after filter
                // is visible can we find out what the width of it is
                var hidePopup = this.popupService.addAsModalPopup(filterWrapper.gui, true);
                this.popupService.positionPopup(eventSource, filterWrapper.gui, true);
                if (filterWrapper.filter.afterGuiAttached) {
                    var params = {
                        hidePopup: hidePopup,
                        eventSource: eventSource
                    };
                    filterWrapper.filter.afterGuiAttached(params);
                }
            };
            return FilterManager;
        })();
        grid_2.FilterManager = FilterManager;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var SelectionRendererFactory = (function () {
            function SelectionRendererFactory() {
            }
            SelectionRendererFactory.prototype.init = function (angularGrid, selectionController) {
                this.angularGrid = angularGrid;
                this.selectionController = selectionController;
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
var ag;
(function (ag) {
    var vdom;
    (function (vdom) {
        var _ = ag.grid.Utils;
        var VElement = (function () {
            function VElement() {
                this.id = VElement.idSequence++;
            }
            VElement.prototype.getId = function () {
                return this.id;
            };
            VElement.prototype.addElementAttachedListener = function (listener) {
                if (!this.elementAttachedListeners) {
                    this.elementAttachedListeners = [];
                }
                this.elementAttachedListeners.push(listener);
            };
            VElement.prototype.fireElementAttached = function (element) {
                if (!this.elementAttachedListeners) {
                    return;
                }
                for (var i = 0; i < this.elementAttachedListeners.length; i++) {
                    var listener = this.elementAttachedListeners[i];
                    listener(element);
                }
            };
            // abstract
            VElement.prototype.elementAttached = function (element) {
                this.fireElementAttached(element);
            };
            VElement.prototype.toHtmlString = function () { return null; };
            VElement.idSequence = 0;
            return VElement;
        })();
        vdom.VElement = VElement;
    })(vdom = ag.vdom || (ag.vdom = {}));
})(ag || (ag = {}));
/// <reference path="vElement.ts" />
/// <reference path="../utils.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ag;
(function (ag) {
    var vdom;
    (function (vdom) {
        var _ = ag.grid.Utils;
        var VHtmlElement = (function (_super) {
            __extends(VHtmlElement, _super);
            function VHtmlElement(type) {
                _super.call(this);
                this.style = {};
                this.type = type;
            }
            VHtmlElement.prototype.getElement = function () {
                return this.element;
            };
            VHtmlElement.prototype.setInnerHtml = function (innerHtml) {
                if (this.bound) {
                    this.element.innerHTML = innerHtml;
                }
                else {
                    this.innerHtml = innerHtml;
                }
            };
            VHtmlElement.prototype.addStyles = function (styles) {
                var _this = this;
                if (!styles) {
                    return;
                }
                if (!this.bound && !this.style) {
                    this.style = {};
                }
                _.iterateObject(styles, function (key, value) {
                    if (_this.bound) {
                        var style = _this.element.style;
                        style[key] = value;
                    }
                    else {
                        _this.style[key] = value;
                    }
                });
            };
            VHtmlElement.prototype.attachEventListeners = function (node) {
                if (!this.eventListeners) {
                    return;
                }
                for (var i = 0; i < this.eventListeners.length; i++) {
                    var listener = this.eventListeners[i];
                    node.addEventListener(listener.event, listener.listener);
                }
            };
            VHtmlElement.prototype.addClass = function (newClass) {
                if (this.bound) {
                    _.addCssClass(this.element, newClass);
                }
                else {
                    if (!this.classes) {
                        this.classes = [];
                    }
                    this.classes.push(newClass);
                }
            };
            VHtmlElement.prototype.removeClass = function (oldClass) {
                if (this.bound) {
                    _.removeCssClass(this.element, oldClass);
                }
                else {
                    if (!this.classes) {
                        return;
                    }
                    while (this.classes.indexOf(oldClass) >= 0) {
                        _.removeFromArray(this.classes, oldClass);
                    }
                }
            };
            VHtmlElement.prototype.addClasses = function (classes) {
                if (!classes || classes.length <= 0) {
                    return;
                }
                if (this.bound) {
                    for (var i = 0; i < classes.length; i++) {
                        _.addCssClass(this.element, classes[i]);
                    }
                }
                else {
                    if (!this.classes) {
                        this.classes = [];
                    }
                    for (var j = 0; j < classes.length; j++) {
                        this.classes.push(classes[j]);
                    }
                }
            };
            VHtmlElement.prototype.toHtmlString = function () {
                var buff = '';
                // opening element
                buff += '<' + this.type + ' v_element_id="' + this.getId() + '" ';
                buff += this.toHtmlStringClasses();
                buff += this.toHtmlStringAttributes();
                buff += this.toHtmlStringStyles();
                buff += '>';
                // contents
                if (this.innerHtml) {
                    buff += this.innerHtml;
                }
                buff += this.toHtmlStringChildren();
                // closing element
                buff += '</' + this.type + '>';
                return buff;
            };
            VHtmlElement.prototype.toHtmlStringChildren = function () {
                if (!this.children) {
                    return '';
                }
                var result = '';
                for (var i = 0; i < this.children.length; i++) {
                    result += this.children[i].toHtmlString();
                }
                return result;
            };
            VHtmlElement.prototype.toHtmlStringAttributes = function () {
                if (!this.attributes) {
                    return '';
                }
                var result = '';
                _.iterateObject(this.attributes, function (key, value) {
                    result += ' ' + key + '="' + value + '"';
                });
                return result;
            };
            VHtmlElement.prototype.toHtmlStringClasses = function () {
                if (!this.classes) {
                    return '';
                }
                return ' class="' + this.classes.join(' ') + '"';
            };
            VHtmlElement.prototype.toHtmlStringStyles = function () {
                var result = ' style="';
                var atLeastOne = false;
                _.iterateObject(this.style, function (key, value) {
                    result += ' ' + key + ': ' + value + ';';
                    atLeastOne = true;
                });
                result += '"';
                if (atLeastOne) {
                    return result;
                }
                else {
                    return '';
                }
            };
            VHtmlElement.prototype.appendChild = function (child) {
                if (this.bound) {
                    if (_.isNodeOrElement(child)) {
                        this.element.appendChild(child);
                    }
                    else {
                        console.error('cannot appendChild with virtual child to already bound VHTMLElement');
                    }
                }
                else {
                    if (!this.children) {
                        this.children = [];
                    }
                    if (_.isNodeOrElement(child)) {
                        this.children.push(new vdom.VWrapperElement(child));
                    }
                    else {
                        this.children.push(child);
                    }
                }
            };
            VHtmlElement.prototype.setAttribute = function (key, value) {
                if (this.bound) {
                    console.error('cannot setAttribute to already bound VHTMLElement');
                }
                if (!this.attributes) {
                    this.attributes = {};
                }
                this.attributes[key] = value;
            };
            VHtmlElement.prototype.addEventListener = function (event, listener) {
                if (this.bound) {
                    console.error('cannot addEventListener to already bound VHTMLElement');
                }
                if (!this.eventListeners) {
                    this.eventListeners = [];
                }
                var entry = new VEventListener(event, listener);
                this.eventListeners.push(entry);
            };
            VHtmlElement.prototype.elementAttached = function (element) {
                _super.prototype.elementAttached.call(this, element);
                this.element = element;
                this.attachEventListeners(element);
                this.fireElementAttachedToChildren(element);
                this.bound = true;
            };
            VHtmlElement.prototype.fireElementAttachedToChildren = function (element) {
                if (!this.children) {
                    return;
                }
                for (var i = 0; i < this.children.length; i++) {
                    var child = this.children[i];
                    var childElement = element.querySelector('[v_element_id="' + child.getId() + '"]');
                    child.elementAttached(childElement);
                }
            };
            return VHtmlElement;
        })(vdom.VElement);
        vdom.VHtmlElement = VHtmlElement;
        var VEventListener = (function () {
            function VEventListener(event, listener) {
                this.event = event;
                this.listener = listener;
            }
            return VEventListener;
        })();
    })(vdom = ag.vdom || (ag.vdom = {}));
})(ag || (ag = {}));
/// <reference path="vElement.ts" />
var ag;
(function (ag) {
    var vdom;
    (function (vdom) {
        var VWrapperElement = (function (_super) {
            __extends(VWrapperElement, _super);
            function VWrapperElement(wrappedElement) {
                _super.call(this);
                this.wrappedElement = wrappedElement;
            }
            VWrapperElement.prototype.toHtmlString = function () {
                return '<span v_element_id="' + this.getId() + '"></span>';
            };
            VWrapperElement.prototype.elementAttached = function (element) {
                var parent = element.parentNode;
                parent.insertBefore(this.wrappedElement, element);
                parent.removeChild(element);
            };
            return VWrapperElement;
        })(vdom.VElement);
        vdom.VWrapperElement = VWrapperElement;
    })(vdom = ag.vdom || (ag.vdom = {}));
})(ag || (ag = {}));
/// <reference path='../columnController.ts' />
/// <reference path='../utils.ts' />
/// <reference path="../gridOptionsWrapper.ts" />
/// <reference path="../expressionService.ts" />
/// <reference path="../selectionRendererFactory.ts" />
/// <reference path="rowRenderer.ts" />
/// <reference path="../selectionController.ts" />
/// <reference path="../templateService.ts" />
/// <reference path="../virtualDom/vHtmlElement.ts" />
/// <reference path="../virtualDom/vWrapperElement.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var RenderedCell = (function () {
            function RenderedCell(isFirstColumn, column, $compile, rowRenderer, gridOptionsWrapper, expressionService, selectionRendererFactory, selectionController, templateService, cellRendererMap, node, rowIndex, scope, columnController, valueService, eventService) {
                this.isFirstColumn = false;
                this.isFirstColumn = isFirstColumn;
                this.column = column;
                this.rowRenderer = rowRenderer;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.expressionService = expressionService;
                this.selectionRendererFactory = selectionRendererFactory;
                this.selectionController = selectionController;
                this.cellRendererMap = cellRendererMap;
                this.$compile = $compile;
                this.templateService = templateService;
                this.columnController = columnController;
                this.valueService = valueService;
                this.eventService = eventService;
                this.checkboxSelection = this.column.colDef.checkboxSelection && !node.floating;
                this.node = node;
                this.rowIndex = rowIndex;
                this.scope = scope;
                this.data = this.getDataForRow();
                this.value = this.getValue();
                this.setupComponents();
            }
            RenderedCell.prototype.getColumn = function () {
                return this.column;
            };
            RenderedCell.prototype.getValue = function () {
                return this.valueService.getValue(this.column.colDef, this.data, this.node);
            };
            RenderedCell.prototype.getVGridCell = function () {
                return this.vGridCell;
            };
            RenderedCell.prototype.getDataForRow = function () {
                if (this.node.footer) {
                    // if footer, we always show the data
                    return this.node.data;
                }
                else if (this.node.group) {
                    // if header and header is expanded, we show data in footer only
                    var footersEnabled = this.gridOptionsWrapper.isGroupIncludeFooter();
                    var suppressHideHeader = this.gridOptionsWrapper.isGroupSuppressBlankHeader();
                    if (this.node.expanded && footersEnabled && !suppressHideHeader) {
                        return undefined;
                    }
                    else {
                        return this.node.data;
                    }
                }
                else {
                    // otherwise it's a normal node, just return data as normal
                    return this.node.data;
                }
            };
            RenderedCell.prototype.setupComponents = function () {
                this.vGridCell = new ag.vdom.VHtmlElement("div");
                this.vGridCell.setAttribute("col", (this.column.index !== undefined && this.column.index !== null) ? this.column.index.toString() : '');
                this.vGridCell.setAttribute("colId", this.column.colId);
                // only set tab index if cell selection is enabled
                if (!this.gridOptionsWrapper.isSuppressCellSelection() && !this.node.floating) {
                    this.vGridCell.setAttribute("tabindex", "-1");
                }
                // these are the grid styles, don't change between soft refreshes
                this.addClasses();
                this.addCellClickedHandler();
                this.addCellDoubleClickedHandler();
                this.addCellContextMenuHandler();
                if (!this.node.floating) {
                    this.addCellNavigationHandler();
                }
                this.vGridCell.addStyles({ width: this.column.actualWidth + "px" });
                this.createParentOfValue();
                this.populateCell();
                if (this.eCheckbox) {
                    this.setSelected(this.selectionController.isNodeSelected(this.node));
                }
            };
            // called by rowRenderer when user navigates via tab key
            RenderedCell.prototype.startEditing = function (key) {
                var _this = this;
                var that = this;
                this.editingCell = true;
                _.removeAllChildren(this.vGridCell.getElement());
                var eInput = document.createElement('input');
                eInput.type = 'text';
                _.addCssClass(eInput, 'ag-cell-edit-input');
                var startWithOldValue = key !== grid.Constants.KEY_BACKSPACE && key !== grid.Constants.KEY_DELETE;
                var value = this.getValue();
                if (startWithOldValue && value !== null && value !== undefined) {
                    eInput.value = value;
                }
                eInput.style.width = (this.column.actualWidth - 14) + 'px';
                this.vGridCell.appendChild(eInput);
                eInput.focus();
                eInput.select();
                var blurListener = function () {
                    that.stopEditing(eInput, blurListener);
                };
                //stop entering if we loose focus
                eInput.addEventListener("blur", blurListener);
                //stop editing if enter pressed
                eInput.addEventListener('keypress', function (event) {
                    var key = event.which || event.keyCode;
                    if (key === grid.Constants.KEY_ENTER) {
                        _this.stopEditing(eInput, blurListener);
                        _this.focusCell(true);
                    }
                });
                //stop editing if enter pressed
                eInput.addEventListener('keydown', function (event) {
                    var key = event.which || event.keyCode;
                    if (key === grid.Constants.KEY_ESCAPE) {
                        _this.stopEditing(eInput, blurListener, true);
                        _this.focusCell(true);
                    }
                });
                // tab key doesn't generate keypress, so need keydown to listen for that
                eInput.addEventListener('keydown', function (event) {
                    var key = event.which || event.keyCode;
                    if (key == grid.Constants.KEY_TAB) {
                        that.stopEditing(eInput, blurListener);
                        that.rowRenderer.startEditingNextCell(that.rowIndex, that.column, event.shiftKey);
                        // we don't want the default tab action, so return false, this stops the event from bubbling
                        event.preventDefault();
                        return false;
                    }
                });
            };
            RenderedCell.prototype.focusCell = function (forceBrowserFocus) {
                this.rowRenderer.focusCell(this.vGridCell.getElement(), this.rowIndex, this.column.index, this.column.colDef, forceBrowserFocus);
            };
            RenderedCell.prototype.stopEditing = function (eInput, blurListener, reset) {
                if (reset === void 0) { reset = false; }
                this.editingCell = false;
                var newValue = eInput.value;
                var colDef = this.column.colDef;
                //If we don't remove the blur listener first, we get:
                //Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is no longer a child of this node. Perhaps it was moved in a 'blur' event handler?
                eInput.removeEventListener('blur', blurListener);
                if (!reset) {
                    var paramsForCallbacks = {
                        node: this.node,
                        data: this.node.data,
                        oldValue: this.node.data[colDef.field],
                        newValue: newValue,
                        rowIndex: this.rowIndex,
                        colDef: colDef,
                        api: this.gridOptionsWrapper.getApi(),
                        context: this.gridOptionsWrapper.getContext()
                    };
                    if (colDef.newValueHandler) {
                        colDef.newValueHandler(paramsForCallbacks);
                    }
                    else {
                        this.node.data[colDef.field] = newValue;
                    }
                    // at this point, the value has been updated
                    this.value = this.getValue();
                    paramsForCallbacks.newValue = this.value;
                    if (typeof colDef.onCellValueChanged === 'function') {
                        colDef.onCellValueChanged(paramsForCallbacks);
                    }
                    this.eventService.dispatchEvent(grid.Events.EVENT_CELL_VALUE_CHANGED, paramsForCallbacks);
                }
                _.removeAllChildren(this.vGridCell.getElement());
                if (this.checkboxSelection) {
                    this.vGridCell.appendChild(this.vCellWrapper.getElement());
                }
                this.refreshCell();
            };
            RenderedCell.prototype.createParams = function () {
                var params = {
                    node: this.node,
                    data: this.node.data,
                    value: this.value,
                    rowIndex: this.rowIndex,
                    colDef: this.column.colDef,
                    $scope: this.scope,
                    context: this.gridOptionsWrapper.getContext(),
                    api: this.gridOptionsWrapper.getApi()
                };
                return params;
            };
            RenderedCell.prototype.createEvent = function (event, eventSource) {
                var agEvent = this.createParams();
                agEvent.event = event;
                agEvent.eventSource = eventSource;
                return agEvent;
            };
            RenderedCell.prototype.addCellDoubleClickedHandler = function () {
                var that = this;
                var colDef = this.column.colDef;
                this.vGridCell.addEventListener('dblclick', function (event) {
                    // always dispatch event to eventService
                    var agEvent = that.createEvent(event, this);
                    that.eventService.dispatchEvent(grid.Events.EVENT_CELL_DOUBLE_CLICKED, agEvent);
                    // check if colDef also wants to handle event
                    if (typeof colDef.onCellDoubleClicked === 'function') {
                        colDef.onCellDoubleClicked(agEvent);
                    }
                    if (!that.gridOptionsWrapper.isSingleClickEdit() && that.isCellEditable()) {
                        that.startEditing();
                    }
                });
            };
            RenderedCell.prototype.addCellContextMenuHandler = function () {
                var that = this;
                var colDef = this.column.colDef;
                this.vGridCell.addEventListener('contextmenu', function (event) {
                    var agEvent = that.createEvent(event, this);
                    that.eventService.dispatchEvent(grid.Events.EVENT_CELL_CONTEXT_MENU, agEvent);
                    if (colDef.onCellContextMenu) {
                        colDef.onCellContextMenu(agEvent);
                    }
                });
            };
            RenderedCell.prototype.isCellEditable = function () {
                if (this.editingCell) {
                    return false;
                }
                // never allow editing of groups
                if (this.node.group) {
                    return false;
                }
                // if boolean set, then just use it
                var colDef = this.column.colDef;
                if (typeof colDef.editable === 'boolean') {
                    return colDef.editable;
                }
                // if function, then call the function to find out
                if (typeof colDef.editable === 'function') {
                    var params = this.createParams();
                    var editableFunc = colDef.editable;
                    return editableFunc(params);
                }
                return false;
            };
            RenderedCell.prototype.addCellClickedHandler = function () {
                var colDef = this.column.colDef;
                var that = this;
                this.vGridCell.addEventListener("click", function (event) {
                    // we pass false to focusCell, as we don't want the cell to focus
                    // also get the browser focus. if we did, then the cellRenderer could
                    // have a text field in it, for example, and as the user clicks on the
                    // text field, the text field, the focus doesn't get to the text
                    // field, instead to goes to the div behind, making it impossible to
                    // select the text field.
                    if (!that.node.floating) {
                        that.focusCell(false);
                    }
                    var agEvent = that.createEvent(event, this);
                    that.eventService.dispatchEvent(grid.Events.EVENT_CELL_CLICKED, agEvent);
                    if (colDef.onCellClicked) {
                        colDef.onCellClicked(agEvent);
                    }
                    if (that.gridOptionsWrapper.isSingleClickEdit() && that.isCellEditable()) {
                        that.startEditing();
                    }
                });
            };
            RenderedCell.prototype.populateCell = function () {
                // populate
                this.putDataIntoCell();
                // style
                this.addStylesFromCollDef();
                this.addClassesFromCollDef();
                this.addClassesFromRules();
            };
            RenderedCell.prototype.addStylesFromCollDef = function () {
                var colDef = this.column.colDef;
                if (colDef.cellStyle) {
                    var cssToUse;
                    if (typeof colDef.cellStyle === 'function') {
                        var cellStyleParams = {
                            value: this.value,
                            data: this.node.data,
                            node: this.node,
                            colDef: colDef,
                            column: this.column,
                            $scope: this.scope,
                            context: this.gridOptionsWrapper.getContext(),
                            api: this.gridOptionsWrapper.getApi()
                        };
                        var cellStyleFunc = colDef.cellStyle;
                        cssToUse = cellStyleFunc(cellStyleParams);
                    }
                    else {
                        cssToUse = colDef.cellStyle;
                    }
                    if (cssToUse) {
                        this.vGridCell.addStyles(cssToUse);
                    }
                }
            };
            RenderedCell.prototype.addClassesFromCollDef = function () {
                var _this = this;
                var colDef = this.column.colDef;
                if (colDef.cellClass) {
                    var classToUse;
                    if (typeof colDef.cellClass === 'function') {
                        var cellClassParams = {
                            value: this.value,
                            data: this.node.data,
                            node: this.node,
                            colDef: colDef,
                            $scope: this.scope,
                            context: this.gridOptionsWrapper.getContext(),
                            api: this.gridOptionsWrapper.getApi()
                        };
                        var cellClassFunc = colDef.cellClass;
                        classToUse = cellClassFunc(cellClassParams);
                    }
                    else {
                        classToUse = colDef.cellClass;
                    }
                    if (typeof classToUse === 'string') {
                        this.vGridCell.addClass(classToUse);
                    }
                    else if (Array.isArray(classToUse)) {
                        classToUse.forEach(function (cssClassItem) {
                            _this.vGridCell.addClass(cssClassItem);
                        });
                    }
                }
            };
            RenderedCell.prototype.addClassesFromRules = function () {
                var colDef = this.column.colDef;
                var classRules = colDef.cellClassRules;
                if (typeof classRules === 'object' && classRules !== null) {
                    var params = {
                        value: this.value,
                        data: this.node.data,
                        node: this.node,
                        colDef: colDef,
                        rowIndex: this.rowIndex,
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
                            this.vGridCell.addClass(className);
                        }
                        else {
                            this.vGridCell.removeClass(className);
                        }
                    }
                }
            };
            // rename this to 'add key event listener
            RenderedCell.prototype.addCellNavigationHandler = function () {
                var that = this;
                this.vGridCell.addEventListener('keydown', function (event) {
                    if (that.editingCell) {
                        return;
                    }
                    // only interested on key presses that are directly on this element, not any children elements. this
                    // stops navigation if the user is in, for example, a text field inside the cell, and user hits
                    // on of the keys we are looking for.
                    if (event.target !== that.vGridCell.getElement()) {
                        return;
                    }
                    var key = event.which || event.keyCode;
                    var startNavigation = key === grid.Constants.KEY_DOWN || key === grid.Constants.KEY_UP
                        || key === grid.Constants.KEY_LEFT || key === grid.Constants.KEY_RIGHT;
                    if (startNavigation) {
                        event.preventDefault();
                        that.rowRenderer.navigateToNextCell(key, that.rowIndex, that.column);
                        return;
                    }
                    var startEdit = that.isKeycodeForStartEditing(key);
                    if (startEdit && that.isCellEditable()) {
                        that.startEditing(key);
                        // if we don't prevent default, then the editor that get displayed also picks up the 'enter key'
                        // press, and stops editing immediately, hence giving he user experience that nothing happened
                        event.preventDefault();
                        return;
                    }
                    var selectRow = key === grid.Constants.KEY_SPACE;
                    if (selectRow && that.gridOptionsWrapper.isRowSelection()) {
                        var selected = that.selectionController.isNodeSelected(that.node);
                        if (selected) {
                            that.selectionController.deselectNode(that.node);
                        }
                        else {
                            that.selectionController.selectNode(that.node, true);
                        }
                        event.preventDefault();
                        return;
                    }
                });
            };
            RenderedCell.prototype.isKeycodeForStartEditing = function (key) {
                return key === grid.Constants.KEY_ENTER || key === grid.Constants.KEY_BACKSPACE || key === grid.Constants.KEY_DELETE;
            };
            RenderedCell.prototype.createSelectionCheckbox = function () {
                this.eCheckbox = document.createElement('input');
                this.eCheckbox.type = "checkbox";
                this.eCheckbox.name = "name";
                this.eCheckbox.className = 'ag-selection-checkbox';
                this.eCheckbox.addEventListener('click', function (event) {
                    event.stopPropagation();
                });
                var that = this;
                this.checkboxOnChangeListener = function () {
                    var newValue = that.eCheckbox.checked;
                    if (newValue) {
                        that.selectionController.selectIndex(that.rowIndex, true);
                    }
                    else {
                        that.selectionController.deselectIndex(that.rowIndex);
                    }
                };
                this.eCheckbox.onchange = this.checkboxOnChangeListener;
            };
            RenderedCell.prototype.setSelected = function (state) {
                if (!this.eCheckbox) {
                    return;
                }
                this.eCheckbox.onchange = null;
                if (typeof state === 'boolean') {
                    this.eCheckbox.checked = state;
                    this.eCheckbox.indeterminate = false;
                }
                else {
                    // isNodeSelected returns back undefined if it's a group and the children
                    // are a mix of selected and unselected
                    this.eCheckbox.indeterminate = true;
                }
                this.eCheckbox.onchange = this.checkboxOnChangeListener;
            };
            RenderedCell.prototype.createParentOfValue = function () {
                if (this.checkboxSelection) {
                    this.vCellWrapper = new ag.vdom.VHtmlElement('span');
                    this.vCellWrapper.addClass('ag-cell-wrapper');
                    this.vGridCell.appendChild(this.vCellWrapper);
                    this.createSelectionCheckbox();
                    this.vCellWrapper.appendChild(new ag.vdom.VWrapperElement(this.eCheckbox));
                    // eventually we call eSpanWithValue.innerHTML = xxx, so cannot include the checkbox (above) in this span
                    this.vSpanWithValue = new ag.vdom.VHtmlElement('span');
                    this.vSpanWithValue.addClass('ag-cell-value');
                    this.vCellWrapper.appendChild(this.vSpanWithValue);
                    this.vParentOfValue = this.vSpanWithValue;
                }
                else {
                    this.vGridCell.addClass('ag-cell-value');
                    this.vParentOfValue = this.vGridCell;
                }
            };
            RenderedCell.prototype.isVolatile = function () {
                return this.column.colDef.volatile;
            };
            RenderedCell.prototype.refreshCell = function () {
                _.removeAllChildren(this.vParentOfValue.getElement());
                this.value = this.getValue();
                this.populateCell();
                if (this.checkboxSelection) {
                    this.setSelected(this.selectionController.isNodeSelected(this.node));
                }
                // if angular compiling, then need to also compile the cell again (angular compiling sucks, please wait...)
                if (this.gridOptionsWrapper.isAngularCompileRows()) {
                    this.$compile(this.vGridCell.getElement())(this.scope);
                }
            };
            RenderedCell.prototype.putDataIntoCell = function () {
                // template gets preference, then cellRenderer, then do it ourselves
                var colDef = this.column.colDef;
                if (colDef.template) {
                    this.vParentOfValue.setInnerHtml(colDef.template);
                }
                else if (colDef.templateUrl) {
                    var template = this.templateService.getTemplate(colDef.templateUrl, this.refreshCell.bind(this, true));
                    if (template) {
                        this.vParentOfValue.setInnerHtml(template);
                    }
                }
                else if (colDef.floatingCellRenderer && this.node.floating) {
                    this.useCellRenderer(colDef.floatingCellRenderer);
                }
                else if (colDef.cellRenderer) {
                    this.useCellRenderer(colDef.cellRenderer);
                }
                else {
                    // if we insert undefined, then it displays as the string 'undefined', ugly!
                    if (this.value !== undefined && this.value !== null && this.value !== '') {
                        this.vParentOfValue.setInnerHtml(this.value.toString());
                    }
                }
            };
            RenderedCell.prototype.useCellRenderer = function (cellRenderer) {
                var colDef = this.column.colDef;
                var rendererParams = {
                    value: this.value,
                    valueGetter: this.getValue,
                    data: this.node.data,
                    node: this.node,
                    colDef: colDef,
                    column: this.column,
                    $scope: this.scope,
                    rowIndex: this.rowIndex,
                    api: this.gridOptionsWrapper.getApi(),
                    context: this.gridOptionsWrapper.getContext(),
                    refreshCell: this.refreshCell.bind(this),
                    eGridCell: this.vGridCell
                };
                var actualCellRenderer;
                if (typeof cellRenderer === 'object' && cellRenderer !== null) {
                    var cellRendererObj = cellRenderer;
                    actualCellRenderer = this.cellRendererMap[cellRendererObj.renderer];
                    if (!actualCellRenderer) {
                        throw 'Cell renderer ' + cellRenderer + ' not found, available are ' + Object.keys(this.cellRendererMap);
                    }
                }
                else if (typeof cellRenderer === 'function') {
                    actualCellRenderer = cellRenderer;
                }
                else {
                    throw 'Cell Renderer must be String or Function';
                }
                var resultFromRenderer = actualCellRenderer(rendererParams);
                if (_.isNodeOrElement(resultFromRenderer)) {
                    // a dom node or element was returned, so add child
                    this.vParentOfValue.appendChild(resultFromRenderer);
                }
                else {
                    // otherwise assume it was html, so just insert
                    this.vParentOfValue.setInnerHtml(resultFromRenderer);
                }
            };
            RenderedCell.prototype.addClasses = function () {
                this.vGridCell.addClass('ag-cell');
                this.vGridCell.addClass('ag-cell-no-focus');
                this.vGridCell.addClass('cell-col-' + this.column.index);
                if (this.node.group && this.node.footer) {
                    this.vGridCell.addClass('ag-footer-cell');
                }
                if (this.node.group && !this.node.footer) {
                    this.vGridCell.addClass('ag-group-cell');
                }
            };
            return RenderedCell;
        })();
        grid.RenderedCell = RenderedCell;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../gridOptionsWrapper.ts" />
/// <reference path="../grid.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../columnController.ts" />
/// <reference path="../expressionService.ts" />
/// <reference path="rowRenderer.ts" />
/// <reference path="../templateService.ts" />
/// <reference path="../selectionController.ts" />
/// <reference path="renderedCell.ts" />
/// <reference path="../virtualDom/vHtmlElement.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var RenderedRow = (function () {
            function RenderedRow(gridOptionsWrapper, valueService, parentScope, angularGrid, columnController, expressionService, cellRendererMap, selectionRendererFactory, $compile, templateService, selectionController, rowRenderer, eBodyContainer, ePinnedContainer, node, rowIndex, eventService) {
                this.renderedCells = {};
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.valueService = valueService;
                this.parentScope = parentScope;
                this.angularGrid = angularGrid;
                this.expressionService = expressionService;
                this.columnController = columnController;
                this.cellRendererMap = cellRendererMap;
                this.selectionRendererFactory = selectionRendererFactory;
                this.$compile = $compile;
                this.templateService = templateService;
                this.selectionController = selectionController;
                this.rowRenderer = rowRenderer;
                this.eBodyContainer = eBodyContainer;
                this.ePinnedContainer = ePinnedContainer;
                this.pinning = columnController.isPinning();
                this.eventService = eventService;
                var groupHeaderTakesEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow();
                var rowIsHeaderThatSpans = node.group && groupHeaderTakesEntireRow;
                this.vBodyRow = this.createRowContainer();
                if (this.pinning) {
                    this.vPinnedRow = this.createRowContainer();
                }
                this.rowIndex = rowIndex;
                this.node = node;
                this.scope = this.createChildScopeOrNull(node.data);
                if (!rowIsHeaderThatSpans) {
                    this.drawNormalRow();
                }
                this.addDynamicStyles();
                this.addDynamicClasses();
                var rowStr = this.rowIndex.toString();
                if (this.node.floatingBottom) {
                    rowStr = 'fb-' + rowStr;
                }
                else if (this.node.floatingTop) {
                    rowStr = 'ft-' + rowStr;
                }
                this.vBodyRow.setAttribute('row', rowStr);
                if (this.pinning) {
                    this.vPinnedRow.setAttribute('row', rowStr);
                }
                // if showing scrolls, position on the container
                if (!this.gridOptionsWrapper.isForPrint()) {
                    this.vBodyRow.style.top = (this.gridOptionsWrapper.getRowHeight() * this.rowIndex) + "px";
                    if (this.pinning) {
                        this.vPinnedRow.style.top = (this.gridOptionsWrapper.getRowHeight() * this.rowIndex) + "px";
                    }
                }
                this.vBodyRow.style.height = (this.gridOptionsWrapper.getRowHeight()) + "px";
                if (this.pinning) {
                    this.vPinnedRow.style.height = (this.gridOptionsWrapper.getRowHeight()) + "px";
                }
                // if group item, insert the first row
                if (rowIsHeaderThatSpans) {
                    this.createGroupRow();
                }
                this.bindVirtualElement(this.vBodyRow);
                if (this.pinning) {
                    this.bindVirtualElement(this.vPinnedRow);
                }
                if (this.scope) {
                    this.$compile(this.vBodyRow.getElement())(this.scope);
                    if (this.pinning) {
                        this.$compile(this.vPinnedRow.getElement())(this.scope);
                    }
                }
                this.eBodyContainer.appendChild(this.vBodyRow.getElement());
                if (this.pinning) {
                    this.ePinnedContainer.appendChild(this.vPinnedRow.getElement());
                }
            }
            RenderedRow.prototype.onRowSelected = function (selected) {
                _.iterateObject(this.renderedCells, function (key, renderedCell) {
                    renderedCell.setSelected(selected);
                });
            };
            RenderedRow.prototype.softRefresh = function () {
                _.iterateObject(this.renderedCells, function (key, renderedCell) {
                    if (renderedCell.isVolatile()) {
                        renderedCell.refreshCell();
                    }
                });
            };
            RenderedRow.prototype.getRenderedCellForColumn = function (column) {
                return this.renderedCells[column.index];
            };
            RenderedRow.prototype.getCellForCol = function (column) {
                var renderedCell = this.renderedCells[column.index];
                if (renderedCell) {
                    return renderedCell.getVGridCell().getElement();
                }
                else {
                    return null;
                }
            };
            RenderedRow.prototype.destroy = function () {
                this.destroyScope();
                if (this.pinning) {
                    this.ePinnedContainer.removeChild(this.vPinnedRow.getElement());
                }
                this.eBodyContainer.removeChild(this.vBodyRow.getElement());
            };
            RenderedRow.prototype.destroyScope = function () {
                if (this.scope) {
                    this.scope.$destroy();
                    this.scope = null;
                }
            };
            RenderedRow.prototype.isDataInList = function (rows) {
                return rows.indexOf(this.node.data) >= 0;
            };
            RenderedRow.prototype.isNodeInList = function (nodes) {
                return nodes.indexOf(this.node) >= 0;
            };
            RenderedRow.prototype.isGroup = function () {
                return this.node.group === true;
            };
            RenderedRow.prototype.drawNormalRow = function () {
                var columns = this.columnController.getDisplayedColumns();
                for (var i = 0; i < columns.length; i++) {
                    var column = columns[i];
                    var firstCol = i === 0;
                    var renderedCell = new grid.RenderedCell(firstCol, column, this.$compile, this.rowRenderer, this.gridOptionsWrapper, this.expressionService, this.selectionRendererFactory, this.selectionController, this.templateService, this.cellRendererMap, this.node, this.rowIndex, this.scope, this.columnController, this.valueService, this.eventService);
                    var vGridCell = renderedCell.getVGridCell();
                    if (column.pinned) {
                        this.vPinnedRow.appendChild(vGridCell);
                    }
                    else {
                        this.vBodyRow.appendChild(vGridCell);
                    }
                    this.renderedCells[column.index] = renderedCell;
                }
            };
            RenderedRow.prototype.bindVirtualElement = function (vElement) {
                var html = vElement.toHtmlString();
                var element = _.loadTemplate(html);
                vElement.elementAttached(element);
            };
            RenderedRow.prototype.createGroupRow = function () {
                var eGroupRow = this.createGroupSpanningEntireRowCell(false);
                if (this.pinning) {
                    this.vPinnedRow.appendChild(eGroupRow);
                    var eGroupRowPadding = this.createGroupSpanningEntireRowCell(true);
                    this.vBodyRow.appendChild(eGroupRowPadding);
                }
                else {
                    this.vBodyRow.appendChild(eGroupRow);
                }
            };
            RenderedRow.prototype.createGroupSpanningEntireRowCell = function (padding) {
                var eRow;
                // padding means we are on the right hand side of a pinned table, ie
                // in the main body.
                if (padding) {
                    eRow = document.createElement('span');
                }
                else {
                    var rowCellRenderer = this.gridOptionsWrapper.getGroupRowRenderer();
                    if (!rowCellRenderer) {
                        rowCellRenderer = {
                            renderer: 'group',
                            innerRenderer: this.gridOptionsWrapper.getGroupRowInnerRenderer()
                        };
                    }
                    var params = {
                        node: this.node,
                        data: this.node.data,
                        rowIndex: this.rowIndex,
                        api: this.gridOptionsWrapper.getApi(),
                        colDef: {
                            cellRenderer: rowCellRenderer
                        }
                    };
                    eRow = this.cellRendererMap['group'](params);
                }
                if (this.node.footer) {
                    _.addCssClass(eRow, 'ag-footer-cell-entire-row');
                }
                else {
                    _.addCssClass(eRow, 'ag-group-cell-entire-row');
                }
                return eRow;
            };
            RenderedRow.prototype.setMainRowWidth = function (width) {
                this.vBodyRow.addStyles({ width: width + "px" });
            };
            RenderedRow.prototype.createChildScopeOrNull = function (data) {
                if (this.gridOptionsWrapper.isAngularCompileRows()) {
                    var newChildScope = this.parentScope.$new();
                    newChildScope.data = data;
                    return newChildScope;
                }
                else {
                    return null;
                }
            };
            RenderedRow.prototype.addDynamicStyles = function () {
                var rowStyle = this.gridOptionsWrapper.getRowStyle();
                if (rowStyle) {
                    if (typeof rowStyle === 'function') {
                        console.log('ag-Grid: rowStyle should be a string or an array, not be a function, use getRowStyle() instead');
                    }
                    else {
                        this.vBodyRow.addStyles(rowStyle);
                        if (this.pinning) {
                            this.vPinnedRow.addStyles(rowStyle);
                        }
                    }
                }
                var rowStyleFunc = this.gridOptionsWrapper.getRowStyleFunc();
                if (rowStyleFunc) {
                    var params = {
                        data: this.node.data,
                        node: this.node,
                        api: this.gridOptionsWrapper.getApi(),
                        context: this.gridOptionsWrapper.getContext(),
                        $scope: this.scope
                    };
                    var cssToUseFromFunc = rowStyleFunc(params);
                    this.vBodyRow.addStyles(cssToUseFromFunc);
                    if (this.pinning) {
                        this.vPinnedRow.addStyles(cssToUseFromFunc);
                    }
                }
            };
            RenderedRow.prototype.createParams = function () {
                var params = {
                    node: this.node,
                    data: this.node.data,
                    rowIndex: this.rowIndex,
                    $scope: this.scope,
                    context: this.gridOptionsWrapper.getContext(),
                    api: this.gridOptionsWrapper.getApi()
                };
                return params;
            };
            RenderedRow.prototype.createEvent = function (event, eventSource) {
                var agEvent = this.createParams();
                agEvent.event = event;
                agEvent.eventSource = eventSource;
                return agEvent;
            };
            RenderedRow.prototype.createRowContainer = function () {
                var vRow = new ag.vdom.VHtmlElement('div');
                var that = this;
                vRow.addEventListener("click", function (event) {
                    var agEvent = that.createEvent(event, this);
                    that.eventService.dispatchEvent(grid.Events.EVENT_ROW_CLICKED, agEvent);
                    // ctrlKey for windows, metaKey for Apple
                    var multiSelectKeyPressed = event.ctrlKey || event.metaKey;
                    that.angularGrid.onRowClicked(multiSelectKeyPressed, that.rowIndex, that.node);
                });
                vRow.addEventListener("dblclick", function (event) {
                    var agEvent = that.createEvent(event, this);
                    that.eventService.dispatchEvent(grid.Events.EVENT_ROW_DOUBLE_CLICKED, agEvent);
                });
                return vRow;
            };
            RenderedRow.prototype.getRowNode = function () {
                return this.node;
            };
            RenderedRow.prototype.getRowIndex = function () {
                return this.rowIndex;
            };
            RenderedRow.prototype.refreshCells = function (colIds) {
                if (!colIds) {
                    return;
                }
                var columnsToRefresh = this.columnController.getColumns(colIds);
                _.iterateObject(this.renderedCells, function (key, renderedCell) {
                    var colForCel = renderedCell.getColumn();
                    if (columnsToRefresh.indexOf(colForCel) >= 0) {
                        renderedCell.refreshCell();
                    }
                });
            };
            RenderedRow.prototype.addDynamicClasses = function () {
                var classes = [];
                classes.push('ag-row');
                classes.push(this.rowIndex % 2 == 0 ? "ag-row-even" : "ag-row-odd");
                if (this.selectionController.isNodeSelected(this.node)) {
                    classes.push("ag-row-selected");
                }
                if (this.node.group) {
                    classes.push("ag-row-group");
                    // if a group, put the level of the group in
                    classes.push("ag-row-level-" + this.node.level);
                    if (!this.node.footer && this.node.expanded) {
                        classes.push("ag-row-group-expanded");
                    }
                    if (!this.node.footer && !this.node.expanded) {
                        // opposite of expanded is contracted according to the internet.
                        classes.push("ag-row-group-contracted");
                    }
                    if (this.node.footer) {
                        classes.push("ag-row-footer");
                    }
                }
                else {
                    // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
                    if (this.node.parent) {
                        classes.push("ag-row-level-" + (this.node.parent.level + 1));
                    }
                    else {
                        classes.push("ag-row-level-0");
                    }
                }
                // add in extra classes provided by the config
                var gridOptionsRowClass = this.gridOptionsWrapper.getRowClass();
                if (gridOptionsRowClass) {
                    if (typeof gridOptionsRowClass === 'function') {
                        console.warn('ag-Grid: rowClass should not be a function, please use getRowClass instead');
                    }
                    else {
                        if (typeof gridOptionsRowClass === 'string') {
                            classes.push(gridOptionsRowClass);
                        }
                        else if (Array.isArray(gridOptionsRowClass)) {
                            gridOptionsRowClass.forEach(function (classItem) {
                                classes.push(classItem);
                            });
                        }
                    }
                }
                var gridOptionsRowClassFunc = this.gridOptionsWrapper.getRowClassFunc();
                if (gridOptionsRowClassFunc) {
                    var params = {
                        node: this.node,
                        data: this.node.data,
                        rowIndex: this.rowIndex,
                        context: this.gridOptionsWrapper.getContext(),
                        api: this.gridOptionsWrapper.getApi()
                    };
                    var classToUseFromFunc = gridOptionsRowClassFunc(params);
                    if (classToUseFromFunc) {
                        if (typeof classToUseFromFunc === 'string') {
                            classes.push(classToUseFromFunc);
                        }
                        else if (Array.isArray(classToUseFromFunc)) {
                            classToUseFromFunc.forEach(function (classItem) {
                                classes.push(classItem);
                            });
                        }
                    }
                }
                this.vBodyRow.addClasses(classes);
                if (this.pinning) {
                    this.vPinnedRow.addClasses(classes);
                }
            };
            return RenderedRow;
        })();
        grid.RenderedRow = RenderedRow;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../svgFactory.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../constants.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var svgFactory = grid.SvgFactory.getInstance();
        var utils = grid.Utils;
        var constants = grid.Constants;
        function groupCellRendererFactory(gridOptionsWrapper, selectionRendererFactory, expressionService) {
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
                var suppressPadding = params.colDef && params.colDef.cellRenderer
                    && params.colDef.cellRenderer.suppressPadding;
                if (!suppressPadding && (node.footer || node.level > 0)) {
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
            function getRefreshFromIndex(params) {
                if (gridOptionsWrapper.isGroupIncludeFooter()) {
                    return params.rowIndex;
                }
                else {
                    return params.rowIndex + 1;
                }
            }
            function expandGroup(eExpandIcon, eContractIcon, params) {
                params.node.expanded = !params.node.expanded;
                var refreshIndex = getRefreshFromIndex(params);
                params.api.onGroupExpandedOrCollapsed(refreshIndex);
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
                var footerValue;
                var groupName = getGroupName(params);
                if (params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.footerValueGetter) {
                    var footerValueGetter = params.colDef.cellRenderer.footerValueGetter;
                    // params is same as we were given, except we set the value as the item to display
                    var paramsClone = utils.cloneObject(params);
                    paramsClone.value = groupName;
                    if (typeof footerValueGetter === 'function') {
                        footerValue = footerValueGetter(paramsClone);
                    }
                    else if (typeof footerValueGetter === 'string') {
                        footerValue = expressionService.evaluate(footerValueGetter, paramsClone);
                    }
                    else {
                        console.warn('ag-Grid: footerValueGetter should be either a function or a string (expression)');
                    }
                }
                else {
                    footerValue = 'Total ' + groupName;
                }
                var eText = document.createTextNode(footerValue);
                eGroupCell.appendChild(eText);
            }
            function getGroupName(params) {
                var cellRenderer = params.colDef.cellRenderer;
                if (cellRenderer && cellRenderer.keyMap
                    && typeof cellRenderer.keyMap === 'object' && params.colDef.cellRenderer !== null) {
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="../constants.ts" />
/// <reference path="renderedRow.ts" />
/// <reference path="../cellRenderers/groupCellRendererFactory.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var RowRenderer = (function () {
            function RowRenderer() {
                this.renderedTopFloatingRows = [];
                this.renderedBottomFloatingRows = [];
            }
            RowRenderer.prototype.init = function (columnModel, gridOptionsWrapper, gridPanel, angularGrid, selectionRendererFactory, $compile, $scope, selectionController, expressionService, templateService, valueService, eventService) {
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
                this.valueService = valueService;
                this.findAllElements(gridPanel);
                this.eventService = eventService;
                this.cellRendererMap = {
                    'group': grid.groupCellRendererFactory(gridOptionsWrapper, selectionRendererFactory, expressionService),
                    'default': function (params) {
                        return params.value;
                    }
                };
                // map of row ids to row objects. keeps track of which elements
                // are rendered for which rows in the dom.
                this.renderedRows = {};
            };
            RowRenderer.prototype.setRowModel = function (rowModel) {
                this.rowModel = rowModel;
            };
            RowRenderer.prototype.onIndividualColumnResized = function (column) {
                var newWidthPx = column.actualWidth + "px";
                var selectorForAllColsInCell = ".cell-col-" + column.index;
                this.eParentsOfRows.forEach(function (rowContainer) {
                    var cellsForThisCol = rowContainer.querySelectorAll(selectorForAllColsInCell);
                    for (var i = 0; i < cellsForThisCol.length; i++) {
                        var element = cellsForThisCol[i];
                        element.style.width = newWidthPx;
                    }
                });
            };
            RowRenderer.prototype.setMainRowWidths = function () {
                var mainRowWidth = this.columnModel.getBodyContainerWidth() + "px";
                this.eAllBodyContainers.forEach(function (container) {
                    var unpinnedRows = container.querySelectorAll(".ag-row");
                    for (var i = 0; i < unpinnedRows.length; i++) {
                        unpinnedRows[i].style.width = mainRowWidth;
                    }
                });
            };
            RowRenderer.prototype.findAllElements = function (gridPanel) {
                this.eBodyContainer = gridPanel.getBodyContainer();
                this.ePinnedColsContainer = gridPanel.getPinnedColsContainer();
                this.eFloatingTopContainer = gridPanel.getFloatingTopContainer();
                this.eFloatingTopPinnedContainer = gridPanel.getPinnedFloatingTop();
                this.eFloatingBottomContainer = gridPanel.getFloatingBottomContainer();
                this.eFloatingBottomPinnedContainer = gridPanel.getPinnedFloatingBottom();
                this.eBodyViewport = gridPanel.getBodyViewport();
                this.eParentsOfRows = gridPanel.getRowsParent();
                this.eAllBodyContainers = [this.eBodyContainer, this.eFloatingBottomContainer,
                    this.eFloatingTopContainer];
                this.eAllPinnedContainers = [this.ePinnedColsContainer, this.eFloatingBottomPinnedContainer,
                    this.eFloatingTopPinnedContainer];
            };
            RowRenderer.prototype.refreshAllFloatingRows = function () {
                this.refreshFloatingRows(this.renderedTopFloatingRows, this.gridOptionsWrapper.getFloatingTopRowData(), this.eFloatingTopPinnedContainer, this.eFloatingTopContainer, true);
                this.refreshFloatingRows(this.renderedBottomFloatingRows, this.gridOptionsWrapper.getFloatingBottomRowData(), this.eFloatingBottomPinnedContainer, this.eFloatingBottomContainer, false);
            };
            RowRenderer.prototype.refreshFloatingRows = function (renderedRows, rowData, pinnedContainer, bodyContainer, isTop) {
                var _this = this;
                renderedRows.forEach(function (row) {
                    row.destroy();
                });
                renderedRows.length = 0;
                // if no cols, don't draw row - can we get rid of this???
                var columns = this.columnModel.getDisplayedColumns();
                if (!columns || columns.length == 0) {
                    return;
                }
                // should we be storing this somewhere???
                var mainRowWidth = this.columnModel.getBodyContainerWidth();
                if (rowData) {
                    rowData.forEach(function (data, rowIndex) {
                        var node = {
                            data: data,
                            floating: true,
                            floatingTop: isTop,
                            floatingBottom: !isTop
                        };
                        var renderedRow = new grid.RenderedRow(_this.gridOptionsWrapper, _this.valueService, _this.$scope, _this.angularGrid, _this.columnModel, _this.expressionService, _this.cellRendererMap, _this.selectionRendererFactory, _this.$compile, _this.templateService, _this.selectionController, _this, bodyContainer, pinnedContainer, node, rowIndex, _this.eventService);
                        renderedRow.setMainRowWidth(mainRowWidth);
                        renderedRows.push(renderedRow);
                    });
                }
            };
            RowRenderer.prototype.refreshView = function (refreshFromIndex) {
                if (!this.gridOptionsWrapper.isForPrint()) {
                    var rowCount = this.rowModel.getVirtualRowCount();
                    var containerHeight = this.gridOptionsWrapper.getRowHeight() * rowCount;
                    this.eBodyContainer.style.height = containerHeight + "px";
                    this.ePinnedColsContainer.style.height = containerHeight + "px";
                }
                this.refreshAllVirtualRows(refreshFromIndex);
                this.refreshAllFloatingRows();
            };
            RowRenderer.prototype.softRefreshView = function () {
                _.iterateObject(this.renderedRows, function (key, renderedRow) {
                    renderedRow.softRefresh();
                });
            };
            RowRenderer.prototype.refreshRows = function (rowNodes) {
                if (!rowNodes || rowNodes.length == 0) {
                    return;
                }
                // we only need to be worried about rendered rows, as this method is
                // called to whats rendered. if the row isn't rendered, we don't care
                var indexesToRemove = [];
                _.iterateObject(this.renderedRows, function (key, renderedRow) {
                    var rowNode = renderedRow.getRowNode();
                    if (rowNodes.indexOf(rowNode) >= 0) {
                        indexesToRemove.push(key);
                    }
                });
                // remove the rows
                this.removeVirtualRow(indexesToRemove);
                // add draw them again
                this.drawVirtualRows();
            };
            RowRenderer.prototype.refreshCells = function (rowNodes, colIds) {
                if (!rowNodes || rowNodes.length == 0) {
                    return;
                }
                // we only need to be worried about rendered rows, as this method is
                // called to whats rendered. if the row isn't rendered, we don't care
                _.iterateObject(this.renderedRows, function (key, renderedRow) {
                    var rowNode = renderedRow.getRowNode();
                    if (rowNodes.indexOf(rowNode) >= 0) {
                        renderedRow.refreshCells(colIds);
                    }
                });
            };
            RowRenderer.prototype.rowDataChanged = function (rows) {
                // we only need to be worried about rendered rows, as this method is
                // called to whats rendered. if the row isn't rendered, we don't care
                var indexesToRemove = [];
                var renderedRows = this.renderedRows;
                Object.keys(renderedRows).forEach(function (key) {
                    var renderedRow = renderedRows[key];
                    // see if the rendered row is in the list of rows we have to update
                    if (renderedRow.isDataInList(rows)) {
                        indexesToRemove.push(key);
                    }
                });
                // remove the rows
                this.removeVirtualRow(indexesToRemove);
                // add draw them again
                this.drawVirtualRows();
            };
            RowRenderer.prototype.refreshAllVirtualRows = function (fromIndex) {
                // remove all current virtual rows, as they have old data
                var rowsToRemove = Object.keys(this.renderedRows);
                this.removeVirtualRow(rowsToRemove, fromIndex);
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
                    if (renderedRow.isGroup()) {
                        rowsToRemove.push(key);
                    }
                });
                // remove the rows
                this.removeVirtualRow(rowsToRemove);
                // and draw them back again
                this.ensureRowsRendered();
            };
            // takes array of row indexes
            RowRenderer.prototype.removeVirtualRow = function (rowsToRemove, fromIndex) {
                var that = this;
                // if no fromIndex then set to -1, which will refresh everything
                var realFromIndex = (typeof fromIndex === 'number') ? fromIndex : -1;
                rowsToRemove.forEach(function (indexToRemove) {
                    if (indexToRemove >= realFromIndex) {
                        that.unbindVirtualRow(indexToRemove);
                        // if the row was last to have focus, we remove the fact that it has focus
                        if (that.focusedCell && that.focusedCell.rowIndex == indexToRemove) {
                            that.focusedCell = null;
                        }
                    }
                });
            };
            RowRenderer.prototype.unbindVirtualRow = function (indexToRemove) {
                var renderedRow = this.renderedRows[indexToRemove];
                renderedRow.destroy();
                var event = { node: renderedRow.getRowNode(), rowIndex: indexToRemove };
                this.eventService.dispatchEvent(grid.Events.EVENT_VIRTUAL_ROW_REMOVED, event);
                this.angularGrid.onVirtualRowRemoved(indexToRemove);
                delete this.renderedRows[indexToRemove];
            };
            RowRenderer.prototype.drawVirtualRows = function () {
                var first;
                var last;
                var rowCount = this.rowModel.getVirtualRowCount();
                if (this.gridOptionsWrapper.isForPrint()) {
                    first = 0;
                    last = rowCount;
                }
                else {
                    var topPixel = this.eBodyViewport.scrollTop;
                    var bottomPixel = topPixel + this.eBodyViewport.offsetHeight;
                    first = Math.floor(topPixel / this.gridOptionsWrapper.getRowHeight());
                    last = Math.floor(bottomPixel / this.gridOptionsWrapper.getRowHeight());
                    //add in buffer
                    var buffer = this.gridOptionsWrapper.getRowBuffer() || grid.Constants.ROW_BUFFER_SIZE;
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
                //var start = new Date().getTime();
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
                this.removeVirtualRow(rowsToRemove);
                // if we are doing angular compiling, then do digest the scope here
                if (this.gridOptionsWrapper.isAngularCompileRows()) {
                    // we do it in a timeout, in case we are already in an apply
                    setTimeout(function () {
                        that.$scope.$apply();
                    }, 0);
                }
                //var end = new Date().getTime();
                //console.log(end-start);
            };
            RowRenderer.prototype.insertRow = function (node, rowIndex, mainRowWidth) {
                var columns = this.columnModel.getDisplayedColumns();
                // if no cols, don't draw row
                if (!columns || columns.length == 0) {
                    return;
                }
                var renderedRow = new grid.RenderedRow(this.gridOptionsWrapper, this.valueService, this.$scope, this.angularGrid, this.columnModel, this.expressionService, this.cellRendererMap, this.selectionRendererFactory, this.$compile, this.templateService, this.selectionController, this, this.eBodyContainer, this.ePinnedColsContainer, node, rowIndex, this.eventService);
                renderedRow.setMainRowWidth(mainRowWidth);
                this.renderedRows[rowIndex] = renderedRow;
            };
            RowRenderer.prototype.getRenderedNodes = function () {
                var renderedRows = this.renderedRows;
                return Object.keys(renderedRows).map(function (key) {
                    return renderedRows[key].getRowNode();
                });
            };
            RowRenderer.prototype.getIndexOfRenderedNode = function (node) {
                var renderedRows = this.renderedRows;
                var keys = Object.keys(renderedRows);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    if (renderedRows[key].getRowNode() === node) {
                        return renderedRows[key].getRowIndex();
                    }
                }
                return -1;
            };
            // we use index for rows, but column object for columns, as the next column (by index) might not
            // be visible (header grouping) so it's not reliable, so using the column object instead.
            RowRenderer.prototype.navigateToNextCell = function (key, rowIndex, column) {
                var cellToFocus = { rowIndex: rowIndex, column: column };
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
                    eCell = renderedRow.getCellForCol(cellToFocus.column);
                }
                // this scrolls the row into view
                this.gridPanel.ensureIndexVisible(renderedRow.getRowIndex());
                // this changes the css on the cell
                this.focusCell(eCell, cellToFocus.rowIndex, cellToFocus.column.index, cellToFocus.column.colDef, true);
            };
            RowRenderer.prototype.getNextCellToFocus = function (key, lastCellToFocus) {
                var lastRowIndex = lastCellToFocus.rowIndex;
                var lastColumn = lastCellToFocus.column;
                var nextRowToFocus;
                var nextColumnToFocus;
                switch (key) {
                    case grid.Constants.KEY_UP:
                        // if already on top row, do nothing
                        if (lastRowIndex === this.firstVirtualRenderedRow) {
                            return null;
                        }
                        nextRowToFocus = lastRowIndex - 1;
                        nextColumnToFocus = lastColumn;
                        break;
                    case grid.Constants.KEY_DOWN:
                        // if already on bottom, do nothing
                        if (lastRowIndex === this.lastVirtualRenderedRow) {
                            return null;
                        }
                        nextRowToFocus = lastRowIndex + 1;
                        nextColumnToFocus = lastColumn;
                        break;
                    case grid.Constants.KEY_RIGHT:
                        var colToRight = this.columnModel.getVisibleColAfter(lastColumn);
                        // if already on right, do nothing
                        if (!colToRight) {
                            return null;
                        }
                        nextRowToFocus = lastRowIndex;
                        nextColumnToFocus = colToRight;
                        break;
                    case grid.Constants.KEY_LEFT:
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
            RowRenderer.prototype.onRowSelected = function (rowIndex, selected) {
                if (this.renderedRows[rowIndex]) {
                    this.renderedRows[rowIndex].onRowSelected(selected);
                }
            };
            // called by the renderedRow
            RowRenderer.prototype.focusCell = function (eCell, rowIndex, colIndex, colDef, forceBrowserFocus) {
                // do nothing if cell selection is off
                if (this.gridOptionsWrapper.isSuppressCellSelection()) {
                    return;
                }
                this.eParentsOfRows.forEach(function (rowContainer) {
                    // remove any previous focus
                    _.querySelectorAll_replaceCssClass(rowContainer, '.ag-cell-focus', 'ag-cell-focus', 'ag-cell-no-focus');
                    var selectorForCell = '[row="' + rowIndex + '"] [col="' + colIndex + '"]';
                    _.querySelectorAll_replaceCssClass(rowContainer, selectorForCell, 'ag-cell-no-focus', 'ag-cell-focus');
                });
                this.focusedCell = { rowIndex: rowIndex, colIndex: colIndex, node: this.rowModel.getVirtualRow(rowIndex), colDef: colDef };
                // this puts the browser focus on the cell (so it gets key presses)
                if (forceBrowserFocus) {
                    eCell.focus();
                }
                this.eventService.dispatchEvent(grid.Events.EVENT_CELL_FOCUSED, this.focusedCell);
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
                    var eCell = renderedRow.getCellForCol(column);
                    this.focusCell(eCell, rowIndex, colIndex, column.colDef, true);
                }
            };
            // called by the cell, when tab is pressed while editing
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
                    var nextRenderedRow = this.renderedRows[currentRowIndex];
                    var nextRenderedCell = nextRenderedRow.getRenderedCellForColumn(currentCol);
                    if (nextRenderedCell.isCellEditable()) {
                        nextRenderedCell.startEditing();
                        nextRenderedCell.focusCell(false);
                        return;
                    }
                }
            };
            return RowRenderer;
        })();
        grid.RowRenderer = RowRenderer;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="utils.ts" />
/// <reference path="rendering/rowRenderer.ts" />
var ag;
(function (ag) {
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
            SelectionController.prototype.init = function (angularGrid, gridPanel, gridOptionsWrapper, $scope, rowRenderer, eventService) {
                this.eParentsOfRows = gridPanel.getRowsParent();
                this.angularGrid = angularGrid;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.$scope = $scope;
                this.rowRenderer = rowRenderer;
                this.eventService = eventService;
                this.initSelectedNodesById();
                this.selectedRows = [];
            };
            SelectionController.prototype.initSelectedNodesById = function () {
                this.selectedNodesById = {};
            };
            SelectionController.prototype.getSelectedNodesById = function () {
                return this.selectedNodesById;
            };
            SelectionController.prototype.getSelectedRows = function () {
                return this.selectedRows;
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
            // this clears the selection, but doesn't clear down the css - when it is called, the
            // caller then gets the grid to refresh.
            SelectionController.prototype.deselectAll = function () {
                this.initSelectedNodesById();
                //var keys = Object.keys(this.selectedNodesById);
                //for (var i = 0; i < keys.length; i++) {
                //    delete this.selectedNodesById[keys[i]];
                //}
                this.syncSelectedRowsAndCallListener();
            };
            // this selects everything, but doesn't clear down the css - when it is called, the
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
                    atLeastOneItemUnselected = this.doWorkOfDeselectAllNodes(null, suppressEvents);
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
            SelectionController.prototype.recursivelyDeselectAllChildren = function (node, suppressEvents) {
                if (node.children) {
                    for (var i = 0; i < node.children.length; i++) {
                        var child = node.children[i];
                        if (child.group) {
                            this.recursivelyDeselectAllChildren(child, suppressEvents);
                        }
                        else {
                            this.deselectRealNode(child, suppressEvents);
                        }
                    }
                }
            };
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
                if (!suppressEvents) {
                    var event = { node: node };
                    this.eventService.dispatchEvent(grid.Events.EVENT_ROW_SELECTED, event);
                }
                return true;
            };
            // 1 - selects a node
            // 2 - updates the UI
            // 3 - calls callbacks
            // wow - what a big name for a method, exception case, it's saying what the method does
            SelectionController.prototype.addCssClassForNode_andInformVirtualRowListener = function (node) {
                var virtualRenderedRowIndex = this.rowRenderer.getIndexOfRenderedNode(node);
                if (virtualRenderedRowIndex >= 0) {
                    this.eParentsOfRows.forEach(function (rowContainer) {
                        utils.querySelectorAll_addCssClass(rowContainer, '[row="' + virtualRenderedRowIndex + '"]', 'ag-row-selected');
                    });
                    // inform virtual row listener
                    this.angularGrid.onVirtualRowSelected(virtualRenderedRowIndex, true);
                }
            };
            // 1 - un-selects a node
            // 2 - updates the UI
            // 3 - calls callbacks
            SelectionController.prototype.doWorkOfDeselectAllNodes = function (nodeToKeepSelected, suppressEvents) {
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
                        this.deselectRealNode(nodeToDeselect, suppressEvents);
                        atLeastOneSelectionChange = true;
                    }
                }
                return atLeastOneSelectionChange;
            };
            SelectionController.prototype.deselectRealNode = function (node, suppressEvents) {
                // deselect the css
                this.removeCssClassForNode(node);
                // if node is a header, and if it has a sibling footer, deselect the footer also
                if (node.group && node.expanded && node.sibling) {
                    this.removeCssClassForNode(node.sibling);
                }
                // remove the row
                delete this.selectedNodesById[node.id];
                if (!suppressEvents) {
                    var event = { node: node };
                    this.eventService.dispatchEvent(grid.Events.EVENT_ROW_DESELECTED, event);
                }
            };
            SelectionController.prototype.removeCssClassForNode = function (node) {
                var virtualRenderedRowIndex = this.rowRenderer.getIndexOfRenderedNode(node);
                if (virtualRenderedRowIndex >= 0) {
                    this.eParentsOfRows.forEach(function (rowContainer) {
                        utils.querySelectorAll_removeCssClass(rowContainer, '[row="' + virtualRenderedRowIndex + '"]', 'ag-row-selected');
                    });
                    // inform virtual row listener
                    this.angularGrid.onVirtualRowSelected(virtualRenderedRowIndex, false);
                }
            };
            // used by selectionRendererFactory
            SelectionController.prototype.deselectIndex = function (rowIndex, suppressEvents) {
                if (suppressEvents === void 0) { suppressEvents = false; }
                var node = this.rowModel.getVirtualRow(rowIndex);
                this.deselectNode(node, suppressEvents);
            };
            // used by api
            SelectionController.prototype.deselectNode = function (node, suppressEvents) {
                if (suppressEvents === void 0) { suppressEvents = false; }
                if (node) {
                    if (this.gridOptionsWrapper.isGroupSelectsChildren() && node.group) {
                        // want to deselect children, not this node, so recursively deselect
                        this.recursivelyDeselectAllChildren(node, suppressEvents);
                    }
                    else {
                        this.deselectRealNode(node, suppressEvents);
                    }
                }
                this.syncSelectedRowsAndCallListener();
                this.updateGroupParentsIfNeeded();
            };
            // used by selectionRendererFactory & api
            SelectionController.prototype.selectIndex = function (index, tryMulti, suppressEvents) {
                if (suppressEvents === void 0) { suppressEvents = false; }
                var node = this.rowModel.getVirtualRow(index);
                this.selectNode(node, tryMulti, suppressEvents);
            };
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
                // this stop the event firing the very first the time grid is initialised. without this, the documentation
                // page had a popup in the 'selection' page as soon as the page was loaded!!
                var nothingChangedMustBeInitialising = oldCount === 0 && selectedRows.length === 0;
                if (!nothingChangedMustBeInitialising && !suppressEvents) {
                    var event = {
                        selectedNodesById: this.selectedNodesById,
                        selectedRows: this.selectedRows
                    };
                    this.eventService.dispatchEvent(grid.Events.EVENT_SELECTION_CHANGED, event);
                }
                var that = this;
                if (this.$scope) {
                    setTimeout(function () {
                        that.$scope.$apply();
                    }, 0);
                }
            };
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
            // used by selectionRendererFactory
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
                        this.eParentsOfRows.forEach(function (rowContainer) {
                            if (selected) {
                                utils.querySelectorAll_addCssClass(rowContainer, '[row="' + rowIndex + '"]', 'ag-row-selected');
                            }
                            else {
                                utils.querySelectorAll_removeCssClass(rowContainer, '[row="' + rowIndex + '"]', 'ag-row-selected');
                            }
                        });
                    }
                }
            };
            return SelectionController;
        })();
        grid.SelectionController = SelectionController;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var RenderedHeaderElement = (function () {
            function RenderedHeaderElement(eRoot) {
                this.eRoot = eRoot;
            }
            RenderedHeaderElement.prototype.getERoot = function () {
                return this.eRoot;
            };
            // methods implemented by the base classes
            RenderedHeaderElement.prototype.destroy = function () { };
            RenderedHeaderElement.prototype.refreshFilterIcon = function () { };
            RenderedHeaderElement.prototype.refreshSortIcon = function () { };
            RenderedHeaderElement.prototype.onDragStart = function () { };
            RenderedHeaderElement.prototype.onDragging = function (dragChange, finished) { };
            RenderedHeaderElement.prototype.onIndividualColumnResized = function (column) { };
            RenderedHeaderElement.prototype.addDragHandler = function (eDraggableElement) {
                var that = this;
                eDraggableElement.addEventListener('mousedown', function (downEvent) {
                    that.onDragStart();
                    that.eRoot.style.cursor = "col-resize";
                    that.dragStartX = downEvent.clientX;
                    var listenersToRemove = {};
                    var lastDelta = 0;
                    listenersToRemove.mousemove = function (moveEvent) {
                        var newX = moveEvent.clientX;
                        lastDelta = newX - that.dragStartX;
                        that.onDragging(lastDelta, false);
                    };
                    listenersToRemove.mouseup = function () {
                        that.stopDragging(listenersToRemove, lastDelta);
                    };
                    listenersToRemove.mouseleave = function () {
                        that.stopDragging(listenersToRemove, lastDelta);
                    };
                    that.eRoot.addEventListener('mousemove', listenersToRemove.mousemove);
                    that.eRoot.addEventListener('mouseup', listenersToRemove.mouseup);
                    that.eRoot.addEventListener('mouseleave', listenersToRemove.mouseleave);
                });
            };
            RenderedHeaderElement.prototype.stopDragging = function (listenersToRemove, dragChange) {
                this.eRoot.style.cursor = "";
                var that = this;
                _.iterateObject(listenersToRemove, function (key, listener) {
                    that.eRoot.removeEventListener(key, listener);
                });
                that.onDragging(dragChange, true);
            };
            return RenderedHeaderElement;
        })();
        grid.RenderedHeaderElement = RenderedHeaderElement;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path='../utils.ts' />
/// <reference path='../filter/filterManager.ts' />
/// <reference path='../gridOptionsWrapper.ts' />
/// <reference path='../columnController.ts' />
/// <reference path='renderedHeaderElement.ts' />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var constants = grid.Constants;
        var svgFactory = grid.SvgFactory.getInstance();
        var RenderedHeaderCell = (function (_super) {
            __extends(RenderedHeaderCell, _super);
            function RenderedHeaderCell(column, parentGroup, gridOptionsWrapper, parentScope, filterManager, columnController, $compile, angularGrid, eRoot) {
                _super.call(this, eRoot);
                this.column = column;
                this.parentGroup = parentGroup;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.parentScope = parentScope;
                this.filterManager = filterManager;
                this.columnController = columnController;
                this.$compile = $compile;
                this.angularGrid = angularGrid;
                this.setupComponents();
            }
            RenderedHeaderCell.prototype.getGui = function () {
                return this.eHeaderCell;
            };
            RenderedHeaderCell.prototype.destroy = function () {
                if (this.childScope) {
                    this.childScope.$destroy();
                }
            };
            RenderedHeaderCell.prototype.createScope = function () {
                if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
                    this.childScope = this.parentScope.$new();
                    this.childScope.colDef = this.column.colDef;
                    this.childScope.colIndex = this.column.index;
                    this.childScope.colDefWrapper = this.column;
                }
            };
            RenderedHeaderCell.prototype.addAttributes = function () {
                this.eHeaderCell.setAttribute("col", (this.column.index !== undefined && this.column.index !== null) ? this.column.index.toString() : '');
                this.eHeaderCell.setAttribute("colId", this.column.colId);
            };
            RenderedHeaderCell.prototype.addClasses = function () {
                _.addCssClass(this.eHeaderCell, 'ag-header-cell');
                if (this.gridOptionsWrapper.isGroupHeaders()) {
                    _.addCssClass(this.eHeaderCell, 'ag-header-cell-grouped'); // this takes 50% height
                }
                else {
                    _.addCssClass(this.eHeaderCell, 'ag-header-cell-not-grouped'); // this takes 100% height
                }
            };
            RenderedHeaderCell.prototype.addMenu = function () {
                var showMenu = this.gridOptionsWrapper.isEnableFilter() && !this.column.colDef.suppressMenu;
                if (!showMenu) {
                    return;
                }
                var eMenuButton = _.createIcon('menu', this.gridOptionsWrapper, this.column, svgFactory.createMenuSvg);
                _.addCssClass(eMenuButton, 'ag-header-icon');
                eMenuButton.setAttribute("class", "ag-header-cell-menu-button");
                var that = this;
                eMenuButton.onclick = function () {
                    that.filterManager.showFilter(that.column, this);
                };
                this.eHeaderCell.appendChild(eMenuButton);
                if (!this.gridOptionsWrapper.isSuppressMenuHide()) {
                    eMenuButton.style.opacity = '0';
                    this.eHeaderCell.onmouseenter = function () {
                        eMenuButton.style.opacity = '1';
                    };
                    this.eHeaderCell.onmouseleave = function () {
                        eMenuButton.style.opacity = '0';
                    };
                }
                eMenuButton.style['transition'] = 'opacity 0.5s, border 0.2s';
                var style = eMenuButton.style;
                style['-webkit-transition'] = 'opacity 0.5s, border 0.2s';
            };
            RenderedHeaderCell.prototype.addSortIcons = function (headerCellLabel) {
                var addSortIcons = this.gridOptionsWrapper.isEnableSorting() && !this.column.colDef.suppressSorting;
                if (!addSortIcons) {
                    return;
                }
                this.eSortAsc = _.createIcon('sortAscending', this.gridOptionsWrapper, this.column, svgFactory.createArrowUpSvg);
                this.eSortDesc = _.createIcon('sortDescending', this.gridOptionsWrapper, this.column, svgFactory.createArrowDownSvg);
                _.addCssClass(this.eSortAsc, 'ag-header-icon ag-sort-ascending-icon');
                _.addCssClass(this.eSortDesc, 'ag-header-icon ag-sort-descending-icon');
                headerCellLabel.appendChild(this.eSortAsc);
                headerCellLabel.appendChild(this.eSortDesc);
                // 'no sort' icon
                if (this.column.colDef.unSortIcon || this.gridOptionsWrapper.isUnSortIcon()) {
                    this.eSortNone = _.createIcon('sortUnSort', this.gridOptionsWrapper, this.column, svgFactory.createArrowUpDownSvg);
                    _.addCssClass(this.eSortNone, 'ag-header-icon ag-sort-none-icon');
                    headerCellLabel.appendChild(this.eSortNone);
                }
                this.eSortAsc.style.display = 'none';
                this.eSortDesc.style.display = 'none';
                this.addSortHandling(headerCellLabel);
            };
            RenderedHeaderCell.prototype.setupComponents = function () {
                this.eHeaderCell = document.createElement("div");
                this.createScope();
                this.addClasses();
                this.addAttributes();
                this.addHeaderClassesFromCollDef();
                // add tooltip if exists
                if (this.column.colDef.headerTooltip) {
                    this.eHeaderCell.title = this.column.colDef.headerTooltip;
                }
                if (this.gridOptionsWrapper.isEnableColResize() && !this.column.colDef.suppressResize) {
                    var headerCellResize = document.createElement("div");
                    headerCellResize.className = "ag-header-cell-resize";
                    this.eHeaderCell.appendChild(headerCellResize);
                    this.addDragHandler(headerCellResize);
                }
                this.addMenu();
                // label div
                var headerCellLabel = document.createElement("div");
                headerCellLabel.className = "ag-header-cell-label";
                // add in sort icons
                this.addSortIcons(headerCellLabel);
                // add in filter icon
                this.eFilterIcon = _.createIcon('filter', this.gridOptionsWrapper, this.column, svgFactory.createFilterSvg);
                _.addCssClass(this.eFilterIcon, 'ag-header-icon');
                headerCellLabel.appendChild(this.eFilterIcon);
                // render the cell, use a renderer if one is provided
                var headerCellRenderer;
                if (this.column.colDef.headerCellRenderer) {
                    headerCellRenderer = this.column.colDef.headerCellRenderer;
                }
                else if (this.gridOptionsWrapper.getHeaderCellRenderer()) {
                    headerCellRenderer = this.gridOptionsWrapper.getHeaderCellRenderer();
                }
                var headerNameValue = this.columnController.getDisplayNameForCol(this.column);
                if (headerCellRenderer) {
                    this.useRenderer(headerNameValue, headerCellRenderer, headerCellLabel);
                }
                else {
                    // no renderer, default text render
                    var eInnerText = document.createElement("span");
                    eInnerText.className = 'ag-header-cell-text';
                    eInnerText.innerHTML = headerNameValue;
                    headerCellLabel.appendChild(eInnerText);
                }
                this.eHeaderCell.appendChild(headerCellLabel);
                this.eHeaderCell.style.width = _.formatWidth(this.column.actualWidth);
                this.refreshFilterIcon();
                this.refreshSortIcon();
            };
            RenderedHeaderCell.prototype.useRenderer = function (headerNameValue, headerCellRenderer, headerCellLabel) {
                // renderer provided, use it
                var cellRendererParams = {
                    colDef: this.column.colDef,
                    $scope: this.childScope,
                    context: this.gridOptionsWrapper.getContext(),
                    value: headerNameValue,
                    api: this.gridOptionsWrapper.getApi(),
                    eHeaderCell: this.eHeaderCell
                };
                var cellRendererResult = headerCellRenderer(cellRendererParams);
                var childToAppend;
                if (_.isNodeOrElement(cellRendererResult)) {
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
                    var childToAppendCompiled = this.$compile(childToAppend)(this.childScope)[0];
                    headerCellLabel.appendChild(childToAppendCompiled);
                }
                else {
                    headerCellLabel.appendChild(childToAppend);
                }
            };
            RenderedHeaderCell.prototype.refreshFilterIcon = function () {
                if (this.eFilterIcon) {
                    var filterPresent = this.filterManager.isFilterPresentForCol(this.column.colId);
                    var displayStyle = filterPresent ? 'inline' : 'none';
                    this.eFilterIcon.style.display = displayStyle;
                }
            };
            RenderedHeaderCell.prototype.refreshSortIcon = function () {
                // update visibility of icons
                var sortAscending = this.column.sort === constants.ASC;
                var sortDescending = this.column.sort === constants.DESC;
                var unSort = this.column.sort !== constants.DESC && this.column.sort !== constants.ASC;
                if (this.eSortAsc) {
                    _.setVisible(this.eSortAsc, sortAscending);
                }
                if (this.eSortDesc) {
                    _.setVisible(this.eSortDesc, sortDescending);
                }
                if (this.eSortNone) {
                    _.setVisible(this.eSortNone, unSort);
                }
            };
            RenderedHeaderCell.prototype.getNextSortDirection = function () {
                var sortingOrder;
                if (this.column.colDef.sortingOrder) {
                    sortingOrder = this.column.colDef.sortingOrder;
                }
                else if (this.gridOptionsWrapper.getSortingOrder()) {
                    sortingOrder = this.gridOptionsWrapper.getSortingOrder();
                }
                else {
                    sortingOrder = RenderedHeaderCell.DEFAULT_SORTING_ORDER;
                }
                if (!Array.isArray(sortingOrder) || sortingOrder.length <= 0) {
                    console.warn('ag-grid: sortingOrder must be an array with at least one element, currently it\'s ' + sortingOrder);
                    return;
                }
                var currentIndex = sortingOrder.indexOf(this.column.sort);
                var notInArray = currentIndex < 0;
                var lastItemInArray = currentIndex == sortingOrder.length - 1;
                var result;
                if (notInArray || lastItemInArray) {
                    result = sortingOrder[0];
                }
                else {
                    result = sortingOrder[currentIndex + 1];
                }
                // verify the sort type exists, as the user could provide the sortOrder, need to make sure it's valid
                if (RenderedHeaderCell.DEFAULT_SORTING_ORDER.indexOf(result) < 0) {
                    console.warn('ag-grid: invalid sort type ' + result);
                    return null;
                }
                return result;
            };
            RenderedHeaderCell.prototype.addSortHandling = function (headerCellLabel) {
                var that = this;
                headerCellLabel.addEventListener("click", function (event) {
                    // update sort on current col
                    that.column.sort = that.getNextSortDirection();
                    // sortedAt used for knowing order of cols when multi-col sort
                    if (that.column.sort) {
                        that.column.sortedAt = new Date().valueOf();
                    }
                    else {
                        that.column.sortedAt = null;
                    }
                    var doingMultiSort = !that.gridOptionsWrapper.isSuppressMultiSort() && event.shiftKey;
                    // clear sort on all columns except this one, and update the icons
                    if (!doingMultiSort) {
                        that.columnController.getAllColumns().forEach(function (columnToClear) {
                            // Do not clear if either holding shift, or if column in question was clicked
                            if (!(columnToClear === that.column)) {
                                columnToClear.sort = null;
                            }
                        });
                    }
                    that.angularGrid.onSortingChanged();
                });
            };
            RenderedHeaderCell.prototype.onDragStart = function () {
                this.startWidth = this.column.actualWidth;
            };
            RenderedHeaderCell.prototype.onDragging = function (dragChange, finished) {
                var newWidth = this.startWidth + dragChange;
                this.columnController.setColumnWidth(this.column, newWidth, finished);
            };
            RenderedHeaderCell.prototype.onIndividualColumnResized = function (column) {
                if (this.column !== column) {
                    return;
                }
                var newWidthPx = column.actualWidth + "px";
                this.eHeaderCell.style.width = newWidthPx;
            };
            RenderedHeaderCell.prototype.addHeaderClassesFromCollDef = function () {
                if (this.column.colDef.headerClass) {
                    var classToUse;
                    if (typeof this.column.colDef.headerClass === 'function') {
                        var params = {
                            colDef: this.column.colDef,
                            $scope: this.childScope,
                            context: this.gridOptionsWrapper.getContext(),
                            api: this.gridOptionsWrapper.getApi()
                        };
                        var headerClassFunc = this.column.colDef.headerClass;
                        classToUse = headerClassFunc(params);
                    }
                    else {
                        classToUse = this.column.colDef.headerClass;
                    }
                    if (typeof classToUse === 'string') {
                        _.addCssClass(this.eHeaderCell, classToUse);
                    }
                    else if (Array.isArray(classToUse)) {
                        classToUse.forEach(function (cssClassItem) {
                            _.addCssClass(this.eHeaderCell, cssClassItem);
                        });
                    }
                }
            };
            RenderedHeaderCell.DEFAULT_SORTING_ORDER = [constants.ASC, constants.DESC, null];
            return RenderedHeaderCell;
        })(grid.RenderedHeaderElement);
        grid.RenderedHeaderCell = RenderedHeaderCell;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path='../utils.ts' />
/// <reference path='renderedHeaderCell.ts' />
/// <reference path='renderedHeaderElement.ts' />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var constants = grid.Constants;
        var svgFactory = grid.SvgFactory.getInstance();
        var RenderedHeaderGroupCell = (function (_super) {
            __extends(RenderedHeaderGroupCell, _super);
            function RenderedHeaderGroupCell(columnGroup, gridOptionsWrapper, columnController, eRoot, angularGrid, parentScope, filterManager, $compile) {
                _super.call(this, eRoot);
                this.children = [];
                this.columnController = columnController;
                this.columnGroup = columnGroup;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.parentScope = parentScope;
                this.filterManager = filterManager;
                this.$compile = $compile;
                this.angularGrid = angularGrid;
                this.setupComponents();
            }
            RenderedHeaderGroupCell.prototype.getGui = function () {
                return this.eHeaderGroup;
            };
            RenderedHeaderGroupCell.prototype.destroy = function () {
                this.children.forEach(function (childElement) {
                    childElement.destroy();
                });
            };
            RenderedHeaderGroupCell.prototype.refreshFilterIcon = function () {
                this.children.forEach(function (childElement) {
                    childElement.refreshFilterIcon();
                });
            };
            RenderedHeaderGroupCell.prototype.refreshSortIcon = function () {
                this.children.forEach(function (childElement) {
                    childElement.refreshSortIcon();
                });
            };
            RenderedHeaderGroupCell.prototype.onIndividualColumnResized = function (column) {
                if (!this.isColumnInOurDisplayedGroup(column)) {
                    return;
                }
                this.children.forEach(function (childElement) {
                    childElement.onIndividualColumnResized(column);
                });
                this.setWidthOfGroupHeaderCell();
            };
            RenderedHeaderGroupCell.prototype.setupComponents = function () {
                var _this = this;
                this.eHeaderGroup = document.createElement('div');
                this.eHeaderGroup.className = 'ag-header-group';
                this.eHeaderGroupCell = document.createElement('div');
                var classNames = ['ag-header-group-cell'];
                // having different classes below allows the style to not have a bottom border
                // on the group header, if no group is specified
                if (this.columnGroup.name) {
                    classNames.push('ag-header-group-cell-with-group');
                }
                else {
                    classNames.push('ag-header-group-cell-no-group');
                }
                this.eHeaderGroupCell.className = classNames.join(' ');
                if (this.gridOptionsWrapper.isEnableColResize()) {
                    this.eHeaderCellResize = document.createElement("div");
                    this.eHeaderCellResize.className = "ag-header-cell-resize";
                    this.eHeaderGroupCell.appendChild(this.eHeaderCellResize);
                    this.addDragHandler(this.eHeaderCellResize);
                }
                // no renderer, default text render
                var groupName = this.columnGroup.name;
                if (groupName && groupName !== '') {
                    var eGroupCellLabel = document.createElement("div");
                    eGroupCellLabel.className = 'ag-header-group-cell-label';
                    this.eHeaderGroupCell.appendChild(eGroupCellLabel);
                    var eInnerText = document.createElement("span");
                    eInnerText.className = 'ag-header-group-text';
                    eInnerText.innerHTML = groupName;
                    eGroupCellLabel.appendChild(eInnerText);
                    if (this.columnGroup.expandable) {
                        this.addGroupExpandIcon(eGroupCellLabel);
                    }
                }
                this.eHeaderGroup.appendChild(this.eHeaderGroupCell);
                this.columnGroup.displayedColumns.forEach(function (column) {
                    var renderedHeaderCell = new grid.RenderedHeaderCell(column, _this, _this.gridOptionsWrapper, _this.parentScope, _this.filterManager, _this.columnController, _this.$compile, _this.angularGrid, _this.getERoot());
                    _this.children.push(renderedHeaderCell);
                    _this.eHeaderGroup.appendChild(renderedHeaderCell.getGui());
                });
                this.setWidthOfGroupHeaderCell();
            };
            RenderedHeaderGroupCell.prototype.isColumnInOurDisplayedGroup = function (column) {
                return this.columnGroup.displayedColumns.indexOf(column) >= 0;
            };
            RenderedHeaderGroupCell.prototype.setWidthOfGroupHeaderCell = function () {
                this.eHeaderGroupCell.style.width = _.formatWidth(this.columnGroup.actualWidth);
            };
            RenderedHeaderGroupCell.prototype.addGroupExpandIcon = function (eGroupCellLabel) {
                var eGroupIcon;
                if (this.columnGroup.expanded) {
                    eGroupIcon = _.createIcon('headerGroupOpened', this.gridOptionsWrapper, null, svgFactory.createArrowLeftSvg);
                }
                else {
                    eGroupIcon = _.createIcon('headerGroupClosed', this.gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
                }
                eGroupIcon.className = 'ag-header-expand-icon';
                eGroupCellLabel.appendChild(eGroupIcon);
                var that = this;
                eGroupIcon.onclick = function () {
                    var newExpandedValue = !that.columnGroup.expanded;
                    that.columnController.columnGroupOpened(that.columnGroup, newExpandedValue);
                };
            };
            RenderedHeaderGroupCell.prototype.onDragStart = function () {
                var _this = this;
                this.groupWidthStart = this.columnGroup.actualWidth;
                this.childrenWidthStarts = [];
                this.columnGroup.displayedColumns.forEach(function (column) {
                    _this.childrenWidthStarts.push(column.actualWidth);
                });
                this.minWidth = this.columnGroup.getMinimumWidth();
            };
            RenderedHeaderGroupCell.prototype.onDragging = function (dragChange, finished) {
                var _this = this;
                var newWidth = this.groupWidthStart + dragChange;
                if (newWidth < this.minWidth) {
                    newWidth = this.minWidth;
                }
                // set the new width to the group header
                //var newWidthPx = newWidth + "px";
                //this.eHeaderGroupCell.style.width = newWidthPx;
                //this.columnGroup.actualWidth = newWidth;
                // distribute the new width to the child headers
                var changeRatio = newWidth / this.groupWidthStart;
                // keep track of pixels used, and last column gets the remaining,
                // to cater for rounding errors, and min width adjustments
                var pixelsToDistribute = newWidth;
                var displayedColumns = this.columnGroup.displayedColumns;
                displayedColumns.forEach(function (column, index) {
                    var notLastCol = index !== (displayedColumns.length - 1);
                    var newChildSize;
                    if (notLastCol) {
                        // if not the last col, calculate the column width as normal
                        var startChildSize = _this.childrenWidthStarts[index];
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
                    _this.columnController.setColumnWidth(column, newChildSize, finished);
                });
            };
            return RenderedHeaderGroupCell;
        })(grid.RenderedHeaderElement);
        grid.RenderedHeaderGroupCell = RenderedHeaderGroupCell;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="../constants.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../headerRendering/renderedHeaderElement.ts" />
/// <reference path="../headerRendering/renderedHeaderCell.ts" />
/// <reference path="../headerRendering/renderedHeaderGroupCell.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var HeaderRenderer = (function () {
            function HeaderRenderer() {
                this.headerElements = [];
            }
            HeaderRenderer.prototype.init = function (gridOptionsWrapper, columnController, gridPanel, angularGrid, filterManager, $scope, $compile) {
                this.gridOptionsWrapper = gridOptionsWrapper;
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
                this.eRoot = gridPanel.getRoot();
            };
            HeaderRenderer.prototype.refreshHeader = function () {
                utils.removeAllChildren(this.ePinnedHeader);
                utils.removeAllChildren(this.eHeaderContainer);
                this.headerElements.forEach(function (headerElement) {
                    headerElement.destroy();
                });
                this.headerElements = [];
                if (this.gridOptionsWrapper.isGroupHeaders()) {
                    this.insertHeadersWithGrouping();
                }
                else {
                    this.insertHeadersWithoutGrouping();
                }
            };
            HeaderRenderer.prototype.insertHeadersWithGrouping = function () {
                var _this = this;
                var groups = this.columnController.getHeaderGroups();
                groups.forEach(function (columnGroup) {
                    var renderedHeaderGroup = new grid.RenderedHeaderGroupCell(columnGroup, _this.gridOptionsWrapper, _this.columnController, _this.eRoot, _this.angularGrid, _this.$scope, _this.filterManager, _this.$compile);
                    _this.headerElements.push(renderedHeaderGroup);
                    var eContainerToAddTo = columnGroup.pinned ? _this.ePinnedHeader : _this.eHeaderContainer;
                    eContainerToAddTo.appendChild(renderedHeaderGroup.getGui());
                });
            };
            HeaderRenderer.prototype.insertHeadersWithoutGrouping = function () {
                var _this = this;
                this.columnController.getDisplayedColumns().forEach(function (column) {
                    // only include the first x cols
                    var renderedHeaderCell = new grid.RenderedHeaderCell(column, null, _this.gridOptionsWrapper, _this.$scope, _this.filterManager, _this.columnController, _this.$compile, _this.angularGrid, _this.eRoot);
                    _this.headerElements.push(renderedHeaderCell);
                    var eContainerToAddTo = column.pinned ? _this.ePinnedHeader : _this.eHeaderContainer;
                    eContainerToAddTo.appendChild(renderedHeaderCell.getGui());
                });
            };
            HeaderRenderer.prototype.updateSortIcons = function () {
                this.headerElements.forEach(function (headerElement) {
                    headerElement.refreshSortIcon();
                });
            };
            HeaderRenderer.prototype.updateFilterIcons = function () {
                this.headerElements.forEach(function (headerElement) {
                    headerElement.refreshFilterIcon();
                });
            };
            HeaderRenderer.prototype.onIndividualColumnResized = function (column) {
                this.headerElements.forEach(function (headerElement) {
                    headerElement.onIndividualColumnResized(column);
                });
            };
            return HeaderRenderer;
        })();
        grid.HeaderRenderer = HeaderRenderer;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var GroupCreator = (function () {
            function GroupCreator() {
            }
            GroupCreator.prototype.init = function (valueService) {
                this.valueService = valueService;
            };
            GroupCreator.prototype.group = function (rowNodes, groupedCols, expandByDefault) {
                var topMostGroup = {
                    level: -1,
                    children: [],
                    _childrenMap: {}
                };
                var allGroups = [];
                allGroups.push(topMostGroup);
                var levelToInsertChild = groupedCols.length - 1;
                var i;
                var currentLevel;
                var node;
                var data;
                var currentGroup;
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
                        var groupColumn = groupedCols[currentLevel];
                        groupKey = this.valueService.getValue(groupColumn.colDef, data, node);
                        if (currentLevel === 0) {
                            currentGroup = topMostGroup;
                        }
                        // if group doesn't exist yet, create it
                        nextGroup = currentGroup._childrenMap[groupKey];
                        if (!nextGroup) {
                            nextGroup = {
                                group: true,
                                field: groupColumn.colId,
                                id: index--,
                                key: groupKey,
                                expanded: this.isExpanded(expandByDefault, currentLevel),
                                children: [],
                                // for top most level, parent is null
                                parent: currentGroup === topMostGroup ? null : currentGroup,
                                allChildrenCount: 0,
                                level: currentGroup.level + 1,
                                _childrenMap: {} //this is a temporary map, we remove at the end of this method
                            };
                            currentGroup._childrenMap[groupKey] = nextGroup;
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
                "";
                //remove the temporary map
                for (i = 0; i < allGroups.length; i++) {
                    delete allGroups[i]._childrenMap;
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="../constants.ts" />
/// <reference path="../groupCreator.ts" />
/// <reference path="../entities/rowNode.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var constants = grid.Constants;
        var InMemoryRowController = (function () {
            function InMemoryRowController() {
                this.createModel();
            }
            InMemoryRowController.prototype.init = function (gridOptionsWrapper, columnController, angularGrid, filterManager, $scope, groupCreator, valueService, eventService) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.columnController = columnController;
                this.angularGrid = angularGrid;
                this.filterManager = filterManager;
                this.$scope = $scope;
                this.groupCreator = groupCreator;
                this.valueService = valueService;
                this.eventService = eventService;
                this.allRows = null;
                this.rowsAfterGroup = null;
                this.rowsAfterFilter = null;
                this.rowsAfterSort = null;
                this.rowsAfterMap = null;
            };
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
                    },
                    forEachNode: function (callback) {
                        that.forEachNode(callback);
                    },
                    forEachNodeAfterFilter: function (callback) {
                        that.forEachNodeAfterFilter(callback);
                    },
                    forEachNodeAfterFilterAndSort: function (callback) {
                        that.forEachNodeAfterFilterAndSort(callback);
                    }
                };
            };
            InMemoryRowController.prototype.getModel = function () {
                return this.model;
            };
            InMemoryRowController.prototype.forEachInMemory = function (callback) {
                console.warn('ag-Grid: please use forEachNode instead of forEachInMemory, method is same, I just renamed it, forEachInMemory is deprecated');
                this.forEachNode(callback);
            };
            InMemoryRowController.prototype.forEachNode = function (callback) {
                this.recursivelyWalkNodesAndCallback(this.rowsAfterGroup, callback);
            };
            InMemoryRowController.prototype.forEachNodeAfterFilter = function (callback) {
                this.recursivelyWalkNodesAndCallback(this.rowsAfterFilter, callback);
            };
            InMemoryRowController.prototype.forEachNodeAfterFilterAndSort = function (callback) {
                this.recursivelyWalkNodesAndCallback(this.rowsAfterSort, callback);
            };
            // iterates through each item in memory, and calls the callback function
            InMemoryRowController.prototype.recursivelyWalkNodesAndCallback = function (list, callback) {
                if (list) {
                    for (var i = 0; i < list.length; i++) {
                        var item = list[i];
                        callback(item);
                        if (item.group && item.children) {
                            this.recursivelyWalkNodesAndCallback(item.children, callback);
                        }
                    }
                }
            };
            InMemoryRowController.prototype.updateModel = function (step) {
                var _this = this;
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
                this.eventService.dispatchEvent(grid.Events.EVENT_MODEL_UPDATED);
                if (this.$scope) {
                    setTimeout(function () {
                        _this.$scope.$apply();
                    }, 0);
                }
            };
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
            // it's possible to recompute the aggregate without doing the other parts
            InMemoryRowController.prototype.doAggregate = function () {
                var groupAggFunction = this.gridOptionsWrapper.getGroupAggFunction();
                if (typeof groupAggFunction === 'function') {
                    this.recursivelyCreateAggData(this.rowsAfterFilter, groupAggFunction, 0);
                    return;
                }
                var valueColumns = this.columnController.getValueColumns();
                var valueKeys = this.gridOptionsWrapper.getGroupAggFields();
                if ((valueColumns && valueColumns.length > 0) || (valueKeys && valueKeys.length > 0)) {
                    var defaultAggFunction = this.defaultGroupAggFunctionFactory(valueColumns, valueKeys);
                    this.recursivelyCreateAggData(this.rowsAfterFilter, defaultAggFunction, 0);
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
            InMemoryRowController.prototype.expandOrCollapseAll = function (expand, rowNodes) {
                var _this = this;
                // if first call in recursion, we set list to parent list
                if (rowNodes === null) {
                    rowNodes = this.rowsAfterGroup;
                }
                if (!rowNodes) {
                    return;
                }
                rowNodes.forEach(function (node) {
                    if (node.group) {
                        node.expanded = expand;
                        _this.expandOrCollapseAll(expand, node.children);
                    }
                });
            };
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
            InMemoryRowController.prototype.recursivelyCreateAggData = function (nodes, groupAggFunction, level) {
                for (var i = 0, l = nodes.length; i < l; i++) {
                    var node = nodes[i];
                    if (node.group) {
                        // agg function needs to start at the bottom, so traverse first
                        this.recursivelyCreateAggData(node.childrenAfterFilter, groupAggFunction, level++);
                        // after traversal, we can now do the agg at this level
                        var data = groupAggFunction(node.childrenAfterFilter, level);
                        node.data = data;
                        // if we are grouping, then it's possible there is a sibling footer
                        // to the group, so update the data here also if there is one
                        if (node.sibling) {
                            node.sibling.data = data;
                        }
                    }
                }
            };
            InMemoryRowController.prototype.doSort = function () {
                var sorting;
                // if the sorting is already done by the server, then we should not do it here
                if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
                    sorting = false;
                }
                else {
                    //see if there is a col we are sorting by
                    var sortingOptions = [];
                    this.columnController.getAllColumns().forEach(function (column) {
                        if (column.sort) {
                            var ascending = column.sort === constants.ASC;
                            sortingOptions.push({
                                inverter: ascending ? 1 : -1,
                                sortedAt: column.sortedAt,
                                column: column
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
                this.updateChildIndexes(rowNodes);
            };
            InMemoryRowController.prototype.sortList = function (nodes, sortOptions) {
                // sort any groups recursively
                for (var i = 0, l = nodes.length; i < l; i++) {
                    var node = nodes[i];
                    if (node.group && node.children) {
                        node.childrenAfterSort = node.childrenAfterFilter.slice(0);
                        this.sortList(node.childrenAfterSort, sortOptions);
                    }
                }
                var that = this;
                function compare(nodeA, nodeB, column, isInverted) {
                    var valueA = that.valueService.getValue(column.colDef, nodeA.data, nodeA);
                    var valueB = that.valueService.getValue(column.colDef, nodeB.data, nodeB);
                    if (column.colDef.comparator) {
                        //if comparator provided, use it
                        return column.colDef.comparator(valueA, valueB, nodeA, nodeB, isInverted);
                    }
                    else {
                        //otherwise do our own comparison
                        return _.defaultComparator(valueA, valueB);
                    }
                }
                nodes.sort(function (nodeA, nodeB) {
                    // Iterate columns, return the first that doesn't match
                    for (var i = 0, len = sortOptions.length; i < len; i++) {
                        var sortOption = sortOptions[i];
                        var compared = compare(nodeA, nodeB, sortOption.column, sortOption.inverter === -1);
                        if (compared !== 0) {
                            return compared * sortOption.inverter;
                        }
                    }
                    // All matched, these are identical as far as the sort is concerned:
                    return 0;
                });
                this.updateChildIndexes(nodes);
            };
            InMemoryRowController.prototype.updateChildIndexes = function (nodes) {
                for (var j = 0; j < nodes.length; j++) {
                    var node = nodes[j];
                    node.firstChild = j === 0;
                    node.lastChild = j === nodes.length - 1;
                    node.childIndex = j;
                }
            };
            // called by grid when pivot cols change
            InMemoryRowController.prototype.onPivotChanged = function () {
                this.doPivoting();
                this.updateModel(constants.STEP_EVERYTHING);
            };
            InMemoryRowController.prototype.doPivoting = function () {
                var rowsAfterGroup;
                var groupedCols = this.columnController.getPivotedColumns();
                var rowsAlreadyGrouped = this.gridOptionsWrapper.isRowsAlreadyGrouped();
                var doingGrouping = !rowsAlreadyGrouped && groupedCols.length > 0;
                if (doingGrouping) {
                    var expandByDefault = this.gridOptionsWrapper.isGroupSuppressRow() || this.gridOptionsWrapper.getGroupDefaultExpanded();
                    rowsAfterGroup = this.groupCreator.group(this.allRows, groupedCols, expandByDefault);
                }
                else {
                    rowsAfterGroup = this.allRows;
                }
                this.rowsAfterGroup = rowsAfterGroup;
            };
            InMemoryRowController.prototype.doFilter = function () {
                var doingFilter;
                if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
                    doingFilter = false;
                }
                else {
                    doingFilter = this.filterManager.isAnyFilterPresent();
                }
                var rowsAfterFilter;
                if (doingFilter) {
                    rowsAfterFilter = this.filterItems(this.rowsAfterGroup);
                }
                else {
                    // do it here
                    rowsAfterFilter = this.rowsAfterGroup;
                    this.recursivelyResetFilter(this.rowsAfterGroup);
                }
                this.rowsAfterFilter = rowsAfterFilter;
            };
            InMemoryRowController.prototype.filterItems = function (rowNodes) {
                var result = [];
                for (var i = 0, l = rowNodes.length; i < l; i++) {
                    var node = rowNodes[i];
                    if (node.group) {
                        // deal with group
                        node.childrenAfterFilter = this.filterItems(node.children);
                        if (node.childrenAfterFilter.length > 0) {
                            node.allChildrenCount = this.getTotalChildCount(node.childrenAfterFilter);
                            result.push(node);
                        }
                    }
                    else {
                        if (this.filterManager.doesRowPassFilter(node)) {
                            result.push(node);
                        }
                    }
                }
                return result;
            };
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
                            var node = {};
                            node.data = rows[i];
                            nodes.push(node);
                        }
                    }
                }
                // if firstId provided, use it, otherwise start at 0
                var firstIdToUse = firstId ? firstId : 0;
                this.recursivelyAddIdToNodes(nodes, firstIdToUse);
                this.allRows = nodes;
                // pivot here, so filters have the agg data ready
                if (this.columnController.isSetupComplete()) {
                    this.doPivoting();
                }
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
            InMemoryRowController.prototype.doGroupMapping = function () {
                // even if not doing grouping, we do the mapping, as the client might
                // of passed in data that already has a grouping in it somewhere
                var rowsAfterMap = [];
                this.addToMap(rowsAfterMap, this.rowsAfterSort);
                this.rowsAfterMap = rowsAfterMap;
            };
            InMemoryRowController.prototype.addToMap = function (mappedData, originalNodes) {
                if (!originalNodes) {
                    return;
                }
                var groupSuppressRow = this.gridOptionsWrapper.isGroupSuppressRow();
                for (var i = 0; i < originalNodes.length; i++) {
                    var node = originalNodes[i];
                    if (!groupSuppressRow || (groupSuppressRow && !node.group)) {
                        mappedData.push(node);
                    }
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
            return InMemoryRowController;
        })();
        grid.InMemoryRowController = InMemoryRowController;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/*
 * This row controller is used for infinite scrolling only. For normal 'in memory' table,
 * or standard pagination, the inMemoryRowController is used.
 */
var ag;
(function (ag) {
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
            VirtualPageRowController.prototype.forEachNode = function (callback) {
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
                        that.forEachNode(callback);
                    },
                    forEachNode: function (callback) {
                        that.forEachNode(callback);
                    },
                    forEachNodeAfterFilter: function (callback) {
                        console.warn('forEachNodeAfterFilter - does not work with virtual pagination');
                    },
                    forEachNodeAfterFilterAndSort: function (callback) {
                        console.warn('forEachNodeAfterFilterAndSort - does not work with virtual pagination');
                    }
                };
            };
            return VirtualPageRowController;
        })();
        grid.VirtualPageRowController = VirtualPageRowController;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var template = '<div class="ag-paging-panel">' +
            '<span id="pageRowSummaryPanel" class="ag-paging-row-summary-panel">' +
            '<span id="firstRowOnPage"></span>' +
            ' [TO] ' +
            '<span id="lastRowOnPage"></span>' +
            ' [OF] ' +
            '<span id="recordCount"></span>' +
            '</span>' +
            '<span class="ag-paging-page-summary-panel">' +
            '<button type="button" class="ag-paging-button" id="btFirst">[FIRST]</button>' +
            '<button type="button" class="ag-paging-button" id="btPrevious">[PREVIOUS]</button>' +
            '[PAGE] ' +
            '<span id="current"></span>' +
            ' [OF] ' +
            '<span id="total"></span>' +
            '<button type="button" class="ag-paging-button" id="btNext">[NEXT]</button>' +
            '<button type="button" class="ag-paging-button" id="btLast">[LAST]</button>' +
            '</span>' +
            '</div>';
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
                this.angularGrid.setRowData(rows, firstId);
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
                this.ePageRowSummaryPanel.style.visibility = "";
            };
            PaginationController.prototype.loadPage = function () {
                this.enableOrDisableButtons();
                var startRow = this.currentPage * this.datasource.pageSize;
                var endRow = (this.currentPage + 1) * this.datasource.pageSize;
                this.lbCurrent.innerHTML = (this.currentPage + 1).toLocaleString();
                this.callVersion++;
                var callVersionCopy = this.callVersion;
                var that = this;
                this.angularGrid.showLoadingOverlay();
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
                    that.angularGrid.setRowData([]);
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var BorderLayout = (function () {
            function BorderLayout(params) {
                this.sizeChangeListeners = [];
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
                    }
                    else {
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
                }
                else {
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
                this.overlays = params.overlays;
                this.setupOverlays();
            }
            BorderLayout.prototype.addSizeChangeListener = function (listener) {
                this.sizeChangeListeners.push(listener);
            };
            BorderLayout.prototype.fireSizeChanged = function () {
                this.sizeChangeListeners.forEach(function (listener) {
                    listener();
                });
            };
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
                if (atLeastOneChanged) {
                    this.fireSizeChanged();
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
                    return this.layoutHeightFullHeight();
                }
                else {
                    return this.layoutHeightNormal();
                }
            };
            // full height never changes the height, because the center is always 100%,
            // however we do check for change, to inform the listeners
            BorderLayout.prototype.layoutHeightFullHeight = function () {
                var centerHeight = _.offsetHeight(this.eGui);
                if (centerHeight < 0) {
                    centerHeight = 0;
                }
                if (this.centerHeightLastTime !== centerHeight) {
                    this.centerHeightLastTime = centerHeight;
                    return true;
                }
                else {
                    return false;
                }
            };
            BorderLayout.prototype.layoutHeightNormal = function () {
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
            BorderLayout.prototype.getCentreHeight = function () {
                return this.centerHeightLastTime;
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
            BorderLayout.prototype.setupOverlays = function () {
                // if no overlays, just remove the panel
                if (!this.overlays) {
                    this.eOverlayWrapper.parentNode.removeChild(this.eOverlayWrapper);
                    return;
                }
                this.hideOverlay();
                //
                //this.setOverlayVisible(false);
            };
            BorderLayout.prototype.hideOverlay = function () {
                _.removeAllChildren(this.eOverlayWrapper);
                this.eOverlayWrapper.style.display = 'none';
            };
            BorderLayout.prototype.showOverlay = function (key) {
                var overlay = this.overlays ? this.overlays[key] : null;
                if (overlay) {
                    _.removeAllChildren(this.eOverlayWrapper);
                    this.eOverlayWrapper.style.display = '';
                    this.eOverlayWrapper.appendChild(overlay);
                }
                else {
                    console.log('ag-Grid: unknown overlay');
                    this.hideOverlay();
                }
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="../layout/borderLayout.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var gridHtml = "<div>\n                <!-- header -->\n                <div class=\"ag-header\">\n                    <div class=\"ag-pinned-header\"></div><div class=\"ag-header-viewport\"><div class=\"ag-header-container\"></div></div>\n                </div>\n                <!-- floating top -->\n                <div class=\"ag-floating-top\">\n                    <div class=\"ag-pinned-floating-top\"></div><div class=\"ag-floating-top-viewport\"><div class=\"ag-floating-top-container\"></div></div>\n                </div>\n                <!-- floating bottom -->\n                <div class=\"ag-floating-bottom\">\n                    <div class=\"ag-pinned-floating-bottom\"></div><div class=\"ag-floating-bottom-viewport\"><div class=\"ag-floating-bottom-container\"></div></div>\n                </div>\n                <!-- body -->\n                <div class=\"ag-body\">\n                    <div class=\"ag-pinned-cols-viewport\">\n                        <div class=\"ag-pinned-cols-container\"></div>\n                    </div>\n                    <div class=\"ag-body-viewport-wrapper\">\n                        <div class=\"ag-body-viewport\">\n                            <div class=\"ag-body-container\"></div>\n                        </div>\n                    </div>\n                </div>\n            </div>";
        var gridForPrintHtml = "<div>\n                <!-- header -->\n                <div class=\"ag-header-container\"></div>\n                <!-- floating top -->\n                <div class=\"ag-floating-top-container\"></div>\n                <!-- body -->\n                <div class=\"ag-body-container\"></div>\n                <!-- floating bottom -->\n                <div class=\"ag-floating-bottom-container\"></div>\n            </div>";
        // wrapping in outer div, and wrapper, is needed to center the loading icon
        // The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/
        var mainOverlayTemplate = '<div class="ag-overlay-panel">' +
            '<div class="ag-overlay-wrapper ag-overlay-[OVERLAY_NAME]-wrapper">[OVERLAY_TEMPLATE]</div>' +
            '</div>';
        var defaultLoadingOverlayTemplate = '<span class="ag-overlay-loading-center">[LOADING...]</span>';
        var defaultNoRowsOverlayTemplate = '<span class="ag-overlay-no-rows-center">[NO_ROWS_TO_SHOW]</span>';
        var _ = grid.Utils;
        var GridPanel = (function () {
            function GridPanel() {
                this.scrollLagCounter = 0;
            }
            GridPanel.prototype.init = function (gridOptionsWrapper, columnModel, rowRenderer, masterSlaveService) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                // makes code below more readable if we pull 'forPrint' out
                this.forPrint = this.gridOptionsWrapper.isForPrint();
                this.setupComponents();
                this.scrollWidth = _.getScrollbarWidth();
                this.columnModel = columnModel;
                this.rowRenderer = rowRenderer;
                this.masterSlaveService = masterSlaveService;
                this.sizeHeaderAndBody();
            };
            GridPanel.prototype.getLayout = function () {
                return this.layout;
            };
            GridPanel.prototype.setupComponents = function () {
                if (this.forPrint) {
                    this.eRoot = _.loadTemplate(gridForPrintHtml);
                    _.addCssClass(this.eRoot, 'ag-root ag-no-scrolls');
                }
                else {
                    this.eRoot = _.loadTemplate(gridHtml);
                    _.addCssClass(this.eRoot, 'ag-root ag-scrolls');
                }
                this.findElements();
                this.layout = new grid.BorderLayout({
                    overlays: {
                        loading: _.loadTemplate(this.createLoadingOverlayTemplate()),
                        noRows: _.loadTemplate(this.createNoRowsOverlayTemplate())
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
            GridPanel.prototype.getPinnedFloatingTop = function () {
                return this.ePinnedFloatingTop;
            };
            GridPanel.prototype.getFloatingTopContainer = function () {
                return this.eFloatingTopContainer;
            };
            GridPanel.prototype.getPinnedFloatingBottom = function () {
                return this.ePinnedFloatingBottom;
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
                }
                else if (viewportScrolledBeforeCol) {
                    // if viewport's right side is before col's right side, scroll left to pull col into viewport at right
                    var newScrollPosition = colRightPixel - viewportWidth;
                    this.eBodyViewport.scrollLeft = newScrollPosition;
                }
                // otherwise, col is already in view, so do nothing
            };
            GridPanel.prototype.showLoadingOverlay = function () {
                this.layout.showOverlay('loading');
            };
            GridPanel.prototype.showNoRowsOverlay = function () {
                this.layout.showOverlay('noRows');
            };
            GridPanel.prototype.hideOverlay = function () {
                this.layout.hideOverlay();
            };
            GridPanel.prototype.getWidthForSizeColsToFit = function () {
                var availableWidth = this.eBody.clientWidth;
                var scrollShowing = this.eBodyViewport.clientHeight < this.eBodyViewport.scrollHeight;
                if (scrollShowing) {
                    availableWidth -= this.scrollWidth;
                }
                return availableWidth;
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
            };
            GridPanel.prototype.mouseWheelListener = function (event) {
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
                this.eBodyViewport.scrollTop = newTopPosition;
                // if we don't prevent default, then the whole browser will scroll also as well as the grid
                event.preventDefault();
                return false;
            };
            GridPanel.prototype.setBodyContainerWidth = function () {
                var mainRowWidth = this.columnModel.getBodyContainerWidth() + 'px';
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
                var pinnedColWidth = this.columnModel.getPinnedContainerWidth() + 'px';
                this.ePinnedColsContainer.style.width = pinnedColWidth;
                this.ePinnedFloatingBottom.style.width = pinnedColWidth;
                this.ePinnedFloatingTop.style.width = pinnedColWidth;
                this.eBodyViewportWrapper.style.marginLeft = pinnedColWidth;
            };
            GridPanel.prototype.showPinnedColContainersIfNeeded = function () {
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
                }
                else {
                    this.ePinnedHeader.style.display = 'none';
                    this.ePinnedColsViewport.style.display = 'none';
                }
            };
            GridPanel.prototype.onBodyHeightChange = function () {
                this.sizeHeaderAndBody();
            };
            GridPanel.prototype.sizeHeaderAndBody = function () {
                if (this.forPrint) {
                    this.sizeHeaderAndBodyForPrint();
                }
                else {
                    this.sizeHeaderAndBodyNormal();
                }
            };
            GridPanel.prototype.sizeHeaderAndBodyNormal = function () {
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
            };
            GridPanel.prototype.sizeHeaderAndBodyForPrint = function () {
                var headerHeightPixels = this.gridOptionsWrapper.getHeaderHeight() + 'px';
                this.eHeaderContainer.style['height'] = headerHeightPixels;
            };
            GridPanel.prototype.setHorizontalScrollPosition = function (hScrollPosition) {
                this.eBodyViewport.scrollLeft = hScrollPosition;
            };
            GridPanel.prototype.addScrollListener = function () {
                var _this = this;
                // if printing, then no scrolling, so no point in listening for scroll events
                if (this.forPrint) {
                    return;
                }
                var lastLeftPosition = -1;
                var lastTopPosition = -1;
                this.eBodyViewport.addEventListener('scroll', function () {
                    var newLeftPosition = _this.eBodyViewport.scrollLeft;
                    var newTopPosition = _this.eBodyViewport.scrollTop;
                    if (newLeftPosition !== lastLeftPosition) {
                        lastLeftPosition = newLeftPosition;
                        _this.scrollHeader(newLeftPosition);
                    }
                    if (newTopPosition !== lastTopPosition) {
                        lastTopPosition = newTopPosition;
                        _this.scrollPinned(newTopPosition);
                        _this.requestDrawVirtualRows();
                    }
                    _this.masterSlaveService.fireHorizontalScrollEvent(newLeftPosition);
                });
                this.ePinnedColsViewport.addEventListener('scroll', function () {
                    // this means the pinned panel was moved, which can only
                    // happen when the user is navigating in the pinned container
                    // as the pinned col should never scroll. so we rollback
                    // the scroll on the pinned.
                    _this.ePinnedColsViewport.scrollTop = 0;
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
                    useScrollLag = _.isBrowserIE() || _.isBrowserSafari();
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
            GridPanel.prototype.scrollHeader = function (bodyLeftPosition) {
                // this.eHeaderContainer.style.transform = 'translate3d(' + -bodyLeftPosition + 'px,0,0)';
                this.eHeaderContainer.style.left = -bodyLeftPosition + 'px';
                this.eFloatingBottomContainer.style.left = -bodyLeftPosition + 'px';
                this.eFloatingTopContainer.style.left = -bodyLeftPosition + 'px';
            };
            GridPanel.prototype.scrollPinned = function (bodyTopPosition) {
                // this.ePinnedColsContainer.style.transform = 'translate3d(0,' + -bodyTopPosition + 'px,0)';
                this.ePinnedColsContainer.style.top = -bodyTopPosition + 'px';
            };
            return GridPanel;
        })();
        grid.GridPanel = GridPanel;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var DragAndDropService = (function () {
            function DragAndDropService() {
            }
            DragAndDropService.prototype.init = function (loggerFactory) {
                this.logger = loggerFactory.create('DragAndDropService');
                // need to clean this up, add to 'finished' logic in grid
                var that = this;
                this.mouseUpEventListener = function listener() {
                    that.stopDragging();
                };
                document.addEventListener('mouseup', this.mouseUpEventListener);
                this.logger.log('initialised');
            };
            DragAndDropService.prototype.destroy = function () {
                document.removeEventListener('mouseup', this.mouseUpEventListener);
                this.logger.log('destroyed');
            };
            DragAndDropService.prototype.stopDragging = function () {
                if (this.dragItem) {
                    this.setDragCssClasses(this.dragItem.eDragSource, false);
                    this.dragItem = null;
                }
            };
            DragAndDropService.prototype.setDragCssClasses = function (eListItem, dragging) {
                _.addOrRemoveCssClass(eListItem, 'ag-dragging', dragging);
                _.addOrRemoveCssClass(eListItem, 'ag-not-dragging', !dragging);
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="../dragAndDrop/dragAndDropService" />
/// <amd-dependency path="text!agList.html"/>
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var template = '<div class="ag-list-selection">' +
            '<div>' +
            '<div ag-repeat class="ag-list-item">' +
            '</div>' +
            '</div>' +
            '</div>';
        var DropTargetLocation;
        (function (DropTargetLocation) {
            DropTargetLocation[DropTargetLocation["NOT_DROP_TARGET"] = 0] = "NOT_DROP_TARGET";
            DropTargetLocation[DropTargetLocation["DROP_TARGET_ABOVE"] = 1] = "DROP_TARGET_ABOVE";
            DropTargetLocation[DropTargetLocation["DROP_TARGET_BELOW"] = 2] = "DROP_TARGET_BELOW";
        })(DropTargetLocation || (DropTargetLocation = {}));
        ;
        var AgList = (function () {
            function AgList(dragAndDropService) {
                this.readOnly = false;
                this.dragAndDropService = dragAndDropService;
                this.setupComponents();
                this.uniqueId = 'CheckboxSelection-' + Math.random();
                this.modelChangedListeners = [];
                this.itemSelectedListeners = [];
                this.itemMovedListeners = [];
                this.beforeDropListeners = [];
                this.dragSources = [];
                this.setupAsDropTarget();
            }
            AgList.prototype.setReadOnly = function (readOnly) {
                this.readOnly = readOnly;
            };
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
            AgList.prototype.addItemMovedListener = function (listener) {
                this.itemMovedListeners.push(listener);
            };
            AgList.prototype.addBeforeDropListener = function (listener) {
                this.beforeDropListeners.push(listener);
            };
            AgList.prototype.fireItemMoved = function (fromIndex, toIndex) {
                for (var i = 0; i < this.itemMovedListeners.length; i++) {
                    this.itemMovedListeners[i](fromIndex, toIndex);
                }
            };
            AgList.prototype.fireModelChanged = function () {
                for (var i = 0; i < this.modelChangedListeners.length; i++) {
                    this.modelChangedListeners[i](this.model);
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
                this.dragAndDropService.addDropTarget(this.eGui, {
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
                if (!this.readOnly) {
                    this.addItemToList(newListItem);
                }
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
                this.dragAndDropService.addDragSource(eListItem, {
                    getData: function () {
                        return item;
                    },
                    getContainerId: function () {
                        return that.uniqueId;
                    }
                });
                this.dragAndDropService.addDropTarget(eListItem, {
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
                        this.setDropCssClasses(eListItem, DropTargetLocation.DROP_TARGET_ABOVE);
                    }
                    else {
                        this.setDropCssClasses(eListItem, DropTargetLocation.DROP_TARGET_BELOW);
                    }
                }
                return result;
            };
            AgList.prototype.internalDrop = function (targetColumn, draggedColumn) {
                var oldIndex = this.model.indexOf(draggedColumn);
                var newIndex = this.model.indexOf(targetColumn);
                if (this.readOnly) {
                    this.fireItemMoved(oldIndex, newIndex);
                }
                else {
                    this.model.splice(oldIndex, 1);
                    this.model.splice(newIndex, 0, draggedColumn);
                    this.refreshView();
                    this.fireModelChanged();
                }
            };
            AgList.prototype.internalNoDrop = function (eListItem) {
                this.setDropCssClasses(eListItem, DropTargetLocation.NOT_DROP_TARGET);
            };
            AgList.prototype.dragAfterThisItem = function (targetColumn, draggedColumn) {
                return this.model.indexOf(targetColumn) < this.model.indexOf(draggedColumn);
            };
            AgList.prototype.setDropCssClasses = function (eListItem, state) {
                utils.addOrRemoveCssClass(eListItem, 'ag-not-drop-target', state === DropTargetLocation.NOT_DROP_TARGET);
                utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-above', state === DropTargetLocation.DROP_TARGET_ABOVE);
                utils.addOrRemoveCssClass(eListItem, 'ag-drop-target-below', state === DropTargetLocation.DROP_TARGET_BELOW);
            };
            AgList.prototype.getGui = function () {
                return this.eGui;
            };
            return AgList;
        })();
        grid.AgList = AgList;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../widgets/agList.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../constants.ts" />
/// <reference path="../layout/BorderLayout.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var svgFactory = grid.SvgFactory.getInstance();
        var ColumnSelectionPanel = (function () {
            function ColumnSelectionPanel(columnController, gridOptionsWrapper, eventService, dragAndDropService) {
                this.dragAndDropService = dragAndDropService;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.columnController = columnController;
                this.setupComponents();
                eventService.addEventListener(grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.columnsChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_MOVED, this.columnsChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_VISIBLE, this.columnsChanged.bind(this));
            }
            ColumnSelectionPanel.prototype.columnsChanged = function () {
                this.cColumnList.setModel(this.columnController.getAllColumns());
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
                    that.columnController.setColumnVisible(column, !column.visible);
                }
                return eResult;
            };
            ColumnSelectionPanel.prototype.setupComponents = function () {
                this.cColumnList = new grid.AgList(this.dragAndDropService);
                this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));
                this.cColumnList.addStyles({ height: '100%', overflow: 'auto' });
                this.cColumnList.addItemMovedListener(this.onItemMoved.bind(this));
                this.cColumnList.setReadOnly(true);
                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                var columnsLocalText = localeTextFunc('columns', 'Columns');
                var eNorthPanel = document.createElement('div');
                eNorthPanel.innerHTML = '<div style="text-align: center;">' + columnsLocalText + '</div>';
                this.layout = new grid.BorderLayout({
                    center: this.cColumnList.getGui(),
                    north: eNorthPanel
                });
            };
            ColumnSelectionPanel.prototype.onItemMoved = function (fromIndex, toIndex) {
                this.columnController.moveColumn(fromIndex, toIndex);
            };
            ColumnSelectionPanel.prototype.getGui = function () {
                return this.eRootPanel.getGui();
            };
            return ColumnSelectionPanel;
        })();
        grid.ColumnSelectionPanel = ColumnSelectionPanel;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../widgets/agList.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../layout/BorderLayout.ts" />
/// <reference path="../constants.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var _ = grid.Utils;
        var svgFactory = grid.SvgFactory.getInstance();
        var GroupSelectionPanel = (function () {
            function GroupSelectionPanel(columnController, inMemoryRowController, gridOptionsWrapper, eventService, dragAndDropService) {
                this.dragAndDropService = dragAndDropService;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.setupComponents();
                this.columnController = columnController;
                this.inMemoryRowController = inMemoryRowController;
                eventService.addEventListener(grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.columnsChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_PIVOT_CHANGE, this.columnsChanged.bind(this));
            }
            GroupSelectionPanel.prototype.columnsChanged = function () {
                this.cColumnList.setModel(this.columnController.getPivotedColumns());
            };
            GroupSelectionPanel.prototype.addDragSource = function (dragSource) {
                this.cColumnList.addDragSource(dragSource);
            };
            GroupSelectionPanel.prototype.columnCellRenderer = function (params) {
                var column = params.value;
                var colDisplayName = this.columnController.getDisplayNameForCol(column);
                var eResult = document.createElement('span');
                var eRemove = _.createIcon('columnRemoveFromGroup', this.gridOptionsWrapper, column, svgFactory.createArrowUpSvg);
                _.addCssClass(eRemove, 'ag-visible-icons');
                eResult.appendChild(eRemove);
                var that = this;
                eRemove.addEventListener('click', function () {
                    that.columnController.removePivotColumn(column);
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
                this.cColumnList = new grid.AgList(this.dragAndDropService);
                this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));
                this.cColumnList.addBeforeDropListener(this.onBeforeDrop.bind(this));
                this.cColumnList.addItemMovedListener(this.onItemMoved.bind(this));
                this.cColumnList.setEmptyMessage(pivotedColumnsEmptyMessage);
                this.cColumnList.addStyles({ height: '100%', overflow: 'auto' });
                this.cColumnList.setReadOnly(true);
                var eNorthPanel = document.createElement('div');
                eNorthPanel.style.paddingTop = '10px';
                eNorthPanel.innerHTML = '<div style="text-align: center;">' + columnsLocalText + '</div>';
                this.layout = new grid.BorderLayout({
                    center: this.cColumnList.getGui(),
                    north: eNorthPanel
                });
            };
            GroupSelectionPanel.prototype.onBeforeDrop = function (newItem) {
                this.columnController.addPivotColumn(newItem);
            };
            GroupSelectionPanel.prototype.onItemMoved = function (fromIndex, toIndex) {
                this.columnController.movePivotColumn(fromIndex, toIndex);
            };
            return GroupSelectionPanel;
        })();
        grid.GroupSelectionPanel = GroupSelectionPanel;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="./agList.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../widgets/agPopupService.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var svgFactory = grid.SvgFactory.getInstance();
        var AgDropdownList = (function () {
            function AgDropdownList(popupService, dragAndDropService) {
                this.popupService = popupService;
                this.setupComponents(dragAndDropService);
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
            AgDropdownList.prototype.setupComponents = function (dragAndDropService) {
                this.eGui = document.createElement('span');
                this.eValue = document.createElement('span');
                this.eGui.appendChild(this.eValue);
                this.agList = new grid.AgList(dragAndDropService);
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
                this.popupService.positionPopup(this.eGui, agListGui, false);
                this.hidePopupCallback = this.popupService.addAsModalPopup(agListGui, true);
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../widgets/agList.ts" />
/// <reference path="../constants.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../layout/borderLayout.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../widgets/agDropdownList.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var svgFactory = grid.SvgFactory.getInstance();
        var constants = grid.Constants;
        var utils = grid.Utils;
        var ValuesSelectionPanel = (function () {
            function ValuesSelectionPanel(columnController, gridOptionsWrapper, popupService, eventService, dragAndDropService) {
                this.dragAndDropService = dragAndDropService;
                this.popupService = popupService;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.setupComponents();
                this.columnController = columnController;
                eventService.addEventListener(grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.columnsChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_VALUE_CHANGE, this.columnsChanged.bind(this));
            }
            ValuesSelectionPanel.prototype.getLayout = function () {
                return this.layout;
            };
            ValuesSelectionPanel.prototype.columnsChanged = function () {
                this.cColumnList.setModel(this.columnController.getValueColumns());
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
                    that.columnController.removeValueColumn(column);
                });
                var agValueType = new grid.AgDropdownList(this.popupService, this.dragAndDropService);
                agValueType.setModel([constants.SUM, constants.MIN, constants.MAX]);
                agValueType.setSelected(column.aggFunc);
                agValueType.setWidth(45);
                agValueType.addItemSelectedListener(function (item) {
                    that.columnController.setColumnAggFunction(column, item);
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
                this.cColumnList = new grid.AgList(this.dragAndDropService);
                this.cColumnList.setCellRenderer(this.cellRenderer.bind(this));
                this.cColumnList.setEmptyMessage(emptyMessage);
                this.cColumnList.addStyles({ height: '100%', overflow: 'auto' });
                this.cColumnList.addBeforeDropListener(this.beforeDropListener.bind(this));
                this.cColumnList.setReadOnly(true);
                var eNorthPanel = document.createElement('div');
                eNorthPanel.style.paddingTop = '10px';
                eNorthPanel.innerHTML = '<div style="text-align: center;">' + columnsLocalText + '</div>';
                this.layout = new grid.BorderLayout({
                    center: this.cColumnList.getGui(),
                    north: eNorthPanel
                });
            };
            ValuesSelectionPanel.prototype.beforeDropListener = function (newItem) {
                this.columnController.addValueColumn(newItem);
            };
            return ValuesSelectionPanel;
        })();
        grid.ValuesSelectionPanel = ValuesSelectionPanel;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="../utils.ts" />
/// <reference path="./columnSelectionPanel.ts" />
/// <reference path="./groupSelectionPanel.ts" />
/// <reference path="./valuesSelectionPanel.ts" />
/// <reference path="../layout/verticalStack.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var utils = grid.Utils;
        var ToolPanel = (function () {
            function ToolPanel() {
                this.layout = new grid.VerticalStack();
            }
            ToolPanel.prototype.init = function (columnController, inMemoryRowController, gridOptionsWrapper, popupService, eventService, dragAndDropService) {
                var suppressPivotAndValues = gridOptionsWrapper.isToolPanelSuppressPivot();
                var suppressValues = gridOptionsWrapper.isToolPanelSuppressValues();
                var showPivot = !suppressPivotAndValues;
                var showValues = !suppressPivotAndValues && !suppressValues;
                // top list, column reorder and visibility
                var columnSelectionPanel = new grid.ColumnSelectionPanel(columnController, gridOptionsWrapper, eventService, dragAndDropService);
                var heightColumnSelection = suppressPivotAndValues ? '100%' : '50%';
                this.layout.addPanel(columnSelectionPanel.layout, heightColumnSelection);
                var dragSource = columnSelectionPanel.getDragSource();
                if (showValues) {
                    var valuesSelectionPanel = new grid.ValuesSelectionPanel(columnController, gridOptionsWrapper, popupService, eventService, dragAndDropService);
                    this.layout.addPanel(valuesSelectionPanel.getLayout(), '25%');
                    valuesSelectionPanel.addDragSource(dragSource);
                }
                if (showPivot) {
                    var groupSelectionPanel = new grid.GroupSelectionPanel(columnController, inMemoryRowController, gridOptionsWrapper, eventService, dragAndDropService);
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
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="colDef.ts" />
/// <reference path="grid.ts" />
/// <reference path="rendering/rowRenderer.ts" />
/// <reference path="headerRendering/headerRenderer.ts" />
/// <reference path="csvCreator.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid_3) {
        var GridApi = (function () {
            function GridApi(grid, rowRenderer, headerRenderer, filterManager, columnController, inMemoryRowController, selectionController, gridOptionsWrapper, gridPanel, valueService, masterSlaveService, eventService) {
                this.grid = grid;
                this.rowRenderer = rowRenderer;
                this.headerRenderer = headerRenderer;
                this.filterManager = filterManager;
                this.columnController = columnController;
                this.inMemoryRowController = inMemoryRowController;
                this.selectionController = selectionController;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.gridPanel = gridPanel;
                this.valueService = valueService;
                this.masterSlaveService = masterSlaveService;
                this.eventService = eventService;
                this.csvCreator = new grid_3.CsvCreator(this.inMemoryRowController, this.columnController, this.grid, this.valueService);
            }
            /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
            GridApi.prototype.__getMasterSlaveService = function () {
                return this.masterSlaveService;
            };
            GridApi.prototype.getDataAsCsv = function (params) {
                return this.csvCreator.getDataAsCsv(params);
            };
            GridApi.prototype.exportDataAsCsv = function (params) {
                this.csvCreator.exportDataAsCsv(params);
            };
            GridApi.prototype.setDatasource = function (datasource) {
                this.grid.setDatasource(datasource);
            };
            GridApi.prototype.onNewDatasource = function () {
                console.log('ag-Grid: onNewDatasource deprecated, please use setDatasource()');
                this.grid.setDatasource();
            };
            GridApi.prototype.setRowData = function (rowData) {
                this.grid.setRowData(rowData);
            };
            GridApi.prototype.setRows = function (rows) {
                console.log('ag-Grid: setRows deprecated, please use setRowData()');
                this.grid.setRowData(rows);
            };
            GridApi.prototype.onNewRows = function () {
                console.log('ag-Grid: onNewRows deprecated, please use setRowData()');
                this.grid.setRowData();
            };
            GridApi.prototype.setFloatingTopRowData = function (rows) {
                this.gridOptionsWrapper.setFloatingTopRowData(rows);
                this.gridPanel.onBodyHeightChange();
                this.refreshView();
            };
            GridApi.prototype.setFloatingBottomRowData = function (rows) {
                this.gridOptionsWrapper.setFloatingBottomRowData(rows);
                this.gridPanel.onBodyHeightChange();
                this.refreshView();
            };
            GridApi.prototype.onNewCols = function () {
                console.error("ag-Grid: deprecated, please call setColumnDefs instead providing a list of the defs");
                this.grid.setColumnDefs();
            };
            GridApi.prototype.setColumnDefs = function (colDefs) {
                this.grid.setColumnDefs(colDefs);
            };
            GridApi.prototype.unselectAll = function () {
                console.error("unselectAll deprecated, call deselectAll instead");
                this.deselectAll();
            };
            GridApi.prototype.refreshRows = function (rowNodes) {
                this.rowRenderer.refreshRows(rowNodes);
            };
            GridApi.prototype.refreshCells = function (rowNodes, colIds) {
                this.rowRenderer.refreshCells(rowNodes, colIds);
            };
            GridApi.prototype.rowDataChanged = function (rows) {
                this.rowRenderer.rowDataChanged(rows);
            };
            GridApi.prototype.refreshView = function () {
                this.rowRenderer.refreshView();
            };
            GridApi.prototype.softRefreshView = function () {
                this.rowRenderer.softRefreshView();
            };
            GridApi.prototype.refreshGroupRows = function () {
                this.rowRenderer.refreshGroupRows();
            };
            GridApi.prototype.refreshHeader = function () {
                // need to review this - the refreshHeader should also refresh all icons in the header
                this.headerRenderer.refreshHeader();
                this.headerRenderer.updateFilterIcons();
            };
            GridApi.prototype.isAnyFilterPresent = function () {
                return this.filterManager.isAnyFilterPresent();
            };
            GridApi.prototype.isAdvancedFilterPresent = function () {
                return this.filterManager.isAdvancedFilterPresent();
            };
            GridApi.prototype.isQuickFilterPresent = function () {
                return this.filterManager.isQuickFilterPresent();
            };
            GridApi.prototype.getModel = function () {
                return this.grid.getRowModel();
            };
            GridApi.prototype.onGroupExpandedOrCollapsed = function (refreshFromIndex) {
                this.grid.updateModelAndRefresh(grid_3.Constants.STEP_MAP, refreshFromIndex);
            };
            GridApi.prototype.expandAll = function () {
                this.inMemoryRowController.expandOrCollapseAll(true, null);
                this.grid.updateModelAndRefresh(grid_3.Constants.STEP_MAP);
            };
            GridApi.prototype.collapseAll = function () {
                this.inMemoryRowController.expandOrCollapseAll(false, null);
                this.grid.updateModelAndRefresh(grid_3.Constants.STEP_MAP);
            };
            GridApi.prototype.addVirtualRowListener = function (rowIndex, callback) {
                this.grid.addVirtualRowListener(rowIndex, callback);
            };
            GridApi.prototype.setQuickFilter = function (newFilter) {
                this.grid.onQuickFilterChanged(newFilter);
            };
            GridApi.prototype.selectIndex = function (index, tryMulti, suppressEvents) {
                this.selectionController.selectIndex(index, tryMulti, suppressEvents);
            };
            GridApi.prototype.deselectIndex = function (index, suppressEvents) {
                if (suppressEvents === void 0) { suppressEvents = false; }
                this.selectionController.deselectIndex(index, suppressEvents);
            };
            GridApi.prototype.selectNode = function (node, tryMulti, suppressEvents) {
                if (tryMulti === void 0) { tryMulti = false; }
                if (suppressEvents === void 0) { suppressEvents = false; }
                this.selectionController.selectNode(node, tryMulti, suppressEvents);
            };
            GridApi.prototype.deselectNode = function (node) {
                this.selectionController.deselectNode(node);
            };
            GridApi.prototype.selectAll = function () {
                this.selectionController.selectAll();
                this.rowRenderer.refreshView();
            };
            GridApi.prototype.deselectAll = function () {
                this.selectionController.deselectAll();
                this.rowRenderer.refreshView();
            };
            GridApi.prototype.recomputeAggregates = function () {
                this.inMemoryRowController.doAggregate();
                this.rowRenderer.refreshGroupRows();
            };
            GridApi.prototype.sizeColumnsToFit = function () {
                if (this.gridOptionsWrapper.isForPrint()) {
                    console.warn('ag-grid: sizeColumnsToFit does not work when forPrint=true');
                    return;
                }
                var availableWidth = this.gridPanel.getWidthForSizeColsToFit();
                this.columnController.sizeColumnsToFit(availableWidth);
            };
            GridApi.prototype.showLoadingOverlay = function () {
                this.grid.showLoadingOverlay();
            };
            GridApi.prototype.showNoRowsOverlay = function () {
                this.grid.showNoRowsOverlay();
            };
            GridApi.prototype.hideOverlay = function () {
                this.grid.hideOverlay();
            };
            GridApi.prototype.showLoading = function (show) {
                console.warn('ag-Grid: showLoading is deprecated, please use api.showLoadingOverlay() and api.hideOverlay() instead');
                if (show) {
                    this.grid.showLoadingOverlay();
                }
                else {
                    this.grid.hideOverlay();
                }
            };
            GridApi.prototype.isNodeSelected = function (node) {
                return this.selectionController.isNodeSelected(node);
            };
            GridApi.prototype.getSelectedNodesById = function () {
                return this.selectionController.getSelectedNodesById();
            };
            GridApi.prototype.getSelectedNodes = function () {
                return this.selectionController.getSelectedNodes();
            };
            GridApi.prototype.getSelectedRows = function () {
                return this.selectionController.getSelectedRows();
            };
            GridApi.prototype.getBestCostNodeSelection = function () {
                return this.selectionController.getBestCostNodeSelection();
            };
            GridApi.prototype.getRenderedNodes = function () {
                return this.rowRenderer.getRenderedNodes();
            };
            GridApi.prototype.ensureColIndexVisible = function (index) {
                this.gridPanel.ensureColIndexVisible(index);
            };
            GridApi.prototype.ensureIndexVisible = function (index) {
                this.gridPanel.ensureIndexVisible(index);
            };
            GridApi.prototype.ensureNodeVisible = function (comparator) {
                this.grid.ensureNodeVisible(comparator);
            };
            GridApi.prototype.forEachInMemory = function (callback) {
                console.warn('ag-Grid: please use forEachNode instead of forEachInMemory, method is same, I just renamed it, forEachInMemory is deprecated');
                this.forEachNode(callback);
            };
            GridApi.prototype.forEachNode = function (callback) {
                this.grid.getRowModel().forEachNode(callback);
            };
            GridApi.prototype.forEachNodeAfterFilter = function (callback) {
                this.grid.getRowModel().forEachNodeAfterFilter(callback);
            };
            GridApi.prototype.forEachNodeAfterFilterAndSort = function (callback) {
                this.grid.getRowModel().forEachNodeAfterFilterAndSort(callback);
            };
            GridApi.prototype.getFilterApiForColDef = function (colDef) {
                console.warn('ag-grid API method getFilterApiForColDef deprecated, use getFilterApi instead');
                return this.getFilterApi(colDef);
            };
            GridApi.prototype.getFilterApi = function (key) {
                var column = this.columnController.getColumn(key);
                return this.filterManager.getFilterApi(column);
            };
            GridApi.prototype.getColumnDef = function (key) {
                var column = this.columnController.getColumn(key);
                if (column) {
                    return column.colDef;
                }
                else {
                    return null;
                }
            };
            GridApi.prototype.onFilterChanged = function () {
                this.grid.onFilterChanged();
            };
            GridApi.prototype.setSortModel = function (sortModel) {
                this.grid.setSortModel(sortModel);
            };
            GridApi.prototype.getSortModel = function () {
                return this.grid.getSortModel();
            };
            GridApi.prototype.setFilterModel = function (model) {
                this.filterManager.setFilterModel(model);
            };
            GridApi.prototype.getFilterModel = function () {
                return this.grid.getFilterModel();
            };
            GridApi.prototype.getFocusedCell = function () {
                return this.rowRenderer.getFocusedCell();
            };
            GridApi.prototype.setFocusedCell = function (rowIndex, colIndex) {
                this.grid.setFocusedCell(rowIndex, colIndex);
            };
            GridApi.prototype.setHeaderHeight = function (headerHeight) {
                this.gridOptionsWrapper.setHeaderHeight(headerHeight);
                this.gridPanel.onBodyHeightChange();
            };
            GridApi.prototype.setGroupHeaders = function (groupHeaders) {
                this.gridOptionsWrapper.setGroupHeaders(groupHeaders);
                this.columnController.onColumnsChanged();
                // if using the default height, then this is impacted by the header count
                this.gridPanel.onBodyHeightChange();
            };
            GridApi.prototype.showToolPanel = function (show) {
                this.grid.showToolPanel(show);
            };
            GridApi.prototype.isToolPanelShowing = function () {
                return this.grid.isToolPanelShowing();
            };
            GridApi.prototype.hideColumn = function (colId, hide) {
                console.warn('ag-Grid: hideColumn deprecated - use hideColumn on columnApi instead eg api.columnApi.hideColumn()');
                this.columnController.hideColumns([colId], hide);
            };
            GridApi.prototype.hideColumns = function (colIds, hide) {
                console.warn('ag-Grid: hideColumns deprecated - use hideColumns on columnApi instead eg api.columnApi.hideColumns()');
                this.columnController.hideColumns(colIds, hide);
            };
            GridApi.prototype.getColumnState = function () {
                console.warn('ag-Grid: getColumnState deprecated - use getColumnState on columnApi instead eg api.columnApi.getState()');
                return this.columnController.getState();
            };
            GridApi.prototype.setColumnState = function (state) {
                console.warn('ag-Grid: setColumnState deprecated - use setColumnState on columnApi instead eg api.columnApi.setState()');
                this.columnController.setState(state);
            };
            GridApi.prototype.doLayout = function () {
                this.grid.doLayout();
            };
            GridApi.prototype.getValue = function (colDef, data, node) {
                return this.valueService.getValue(colDef, data, node);
            };
            GridApi.prototype.addEventListener = function (eventType, listener) {
                this.eventService.addEventListener(eventType, listener);
            };
            GridApi.prototype.addGlobalListener = function (listener) {
                this.eventService.addGlobalListener(listener);
            };
            GridApi.prototype.removeEventListener = function (eventType, listener) {
                this.eventService.removeEventListener(eventType, listener);
            };
            GridApi.prototype.removeGlobalListener = function (listener) {
                this.eventService.removeGlobalListener(listener);
            };
            GridApi.prototype.refreshPivot = function () {
                this.grid.refreshPivot();
            };
            GridApi.prototype.destroy = function () {
                this.grid.destroy();
            };
            return GridApi;
        })();
        grid_3.GridApi = GridApi;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="gridOptionsWrapper.ts" />
/// <reference path="expressionService.ts" />
/// <reference path="columnController.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var ValueService = (function () {
            function ValueService() {
            }
            ValueService.prototype.init = function (gridOptionsWrapper, expressionService, columnController) {
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.expressionService = expressionService;
                this.columnController = columnController;
            };
            ValueService.prototype.getValue = function (colDef, data, node) {
                var cellExpressions = this.gridOptionsWrapper.isEnableCellExpressions();
                var field = colDef.field;
                var result;
                // if there is a value getter, this gets precedence over a field
                if (colDef.valueGetter) {
                    result = this.executeValueGetter(colDef.valueGetter, data, colDef, node);
                }
                else if (field && data) {
                    result = data[field];
                }
                else {
                    result = undefined;
                }
                // the result could be an expression itself, if we are allowing cell values to be expressions
                if (cellExpressions && (typeof result === 'string') && result.indexOf('=') === 0) {
                    var cellValueGetter = result.substring(1);
                    result = this.executeValueGetter(cellValueGetter, data, colDef, node);
                }
                return result;
            };
            ValueService.prototype.executeValueGetter = function (valueGetter, data, colDef, node) {
                var context = this.gridOptionsWrapper.getContext();
                var api = this.gridOptionsWrapper.getApi();
                var params = {
                    data: data,
                    node: node,
                    colDef: colDef,
                    api: api,
                    context: context,
                    getValue: this.getValueCallback.bind(this, data, node)
                };
                if (typeof valueGetter === 'function') {
                    // valueGetter is a function, so just call it
                    return valueGetter(params);
                }
                else if (typeof valueGetter === 'string') {
                    // valueGetter is an expression, so execute the expression
                    return this.expressionService.evaluate(valueGetter, params);
                }
            };
            ValueService.prototype.getValueCallback = function (data, node, field) {
                var otherColumn = this.columnController.getColumn(field);
                if (otherColumn) {
                    return this.getValue(otherColumn.colDef, data, node);
                }
                else {
                    return null;
                }
            };
            return ValueService;
        })();
        grid.ValueService = ValueService;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="constants.ts" />
/// <reference path="gridOptionsWrapper.ts" />
/// <reference path="utils.ts" />
/// <reference path="filter/filterManager.ts" />
/// <reference path="columnController.ts" />
/// <reference path="selectionController.ts" />
/// <reference path="selectionRendererFactory.ts" />
/// <reference path="rendering/rowRenderer.ts" />
/// <reference path="headerRendering/headerRenderer.ts" />
/// <reference path="rowControllers/inMemoryRowController.ts" />
/// <reference path="rowControllers/virtualPageRowController.ts" />
/// <reference path="rowControllers/paginationController.ts" />
/// <reference path="expressionService.ts" />
/// <reference path="templateService.ts" />
/// <reference path="gridPanel/gridPanel.ts" />
/// <reference path="toolPanel/toolPanel.ts" />
/// <reference path="widgets/agPopupService.ts" />
/// <reference path="entities/gridOptions.ts" />
/// <reference path="gridApi.ts" />
/// <reference path="valueService.ts" />
/// <reference path="masterSlaveService.ts" />
/// <reference path="logger.ts" />
/// <reference path="eventService.ts" />
/// <reference path="dragAndDrop/dragAndDropService.ts" />
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var Grid = (function () {
            function Grid(eGridDiv, gridOptions, globalEventListener, $scope, $compile, quickFilterOnScope) {
                if (globalEventListener === void 0) { globalEventListener = null; }
                if ($scope === void 0) { $scope = null; }
                if ($compile === void 0) { $compile = null; }
                if (quickFilterOnScope === void 0) { quickFilterOnScope = null; }
                this.virtualRowCallbacks = {};
                this.gridOptions = gridOptions;
                this.setupComponents($scope, $compile, eGridDiv, globalEventListener);
                this.gridOptions.api = new grid.GridApi(this, this.rowRenderer, this.headerRenderer, this.filterManager, this.columnController, this.inMemoryRowController, this.selectionController, this.gridOptionsWrapper, this.gridPanel, this.valueService, this.masterSlaveService, this.eventService);
                this.gridOptions.columnApi = this.columnController.getColumnApi();
                var that = this;
                // if using angular, watch for quickFilter changes
                if ($scope) {
                    $scope.$watch(quickFilterOnScope, function (newFilter) {
                        that.onQuickFilterChanged(newFilter);
                    });
                }
                if (!this.gridOptionsWrapper.isForPrint()) {
                    this.addWindowResizeListener();
                }
                this.inMemoryRowController.setAllRows(this.gridOptionsWrapper.getRowData());
                this.setupColumns();
                this.updateModelAndRefresh(grid.Constants.STEP_EVERYTHING);
                // if no data provided initially, and not doing infinite scrolling, show the loading panel
                var showLoading = !this.gridOptionsWrapper.getRowData() && !this.gridOptionsWrapper.isVirtualPaging();
                if (showLoading) {
                    this.showLoadingOverlay();
                }
                // if datasource provided, use it
                if (this.gridOptionsWrapper.getDatasource()) {
                    this.setDatasource();
                }
                this.doLayout();
                this.finished = false;
                this.periodicallyDoLayout();
                // if ready function provided, use it
                var readyParams = { api: gridOptions.api };
                this.eventService.dispatchEvent(grid.Events.EVENT_READY, readyParams);
                this.logger.log('initialised');
            }
            Grid.prototype.addWindowResizeListener = function () {
                var that = this;
                // putting this into a function, so when we remove the function,
                // we are sure we are removing the exact same function (i'm not
                // sure what 'bind' does to the function reference, if it's safe
                // the result from 'bind').
                this.windowResizeListener = function resizeListener() {
                    that.doLayout();
                };
                window.addEventListener('resize', this.windowResizeListener);
            };
            Grid.prototype.getRowModel = function () {
                return this.rowModel;
            };
            Grid.prototype.periodicallyDoLayout = function () {
                if (!this.finished) {
                    var that = this;
                    setTimeout(function () {
                        that.doLayout();
                        that.periodicallyDoLayout();
                    }, 500);
                }
            };
            Grid.prototype.setupComponents = function ($scope, $compile, eUserProvidedDiv, globalEventListener) {
                this.eUserProvidedDiv = eUserProvidedDiv;
                // create all the beans
                var eventService = new grid.EventService();
                var gridOptionsWrapper = new grid.GridOptionsWrapper();
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
                var gridPanel = new grid.GridPanel();
                var popupService = new grid.PopupService();
                var valueService = new grid.ValueService();
                var groupCreator = new grid.GroupCreator();
                var masterSlaveService = new grid.MasterSlaveService();
                var loggerFactory = new grid.LoggerFactory();
                var dragAndDropService = new grid.DragAndDropService();
                // initialise all the beans
                gridOptionsWrapper.init(this.gridOptions, eventService);
                loggerFactory.init(gridOptionsWrapper);
                this.logger = loggerFactory.create('Grid');
                this.logger.log('initialising');
                dragAndDropService.init(loggerFactory);
                eventService.init(loggerFactory);
                gridPanel.init(gridOptionsWrapper, columnController, rowRenderer, masterSlaveService);
                templateService.init($scope);
                expressionService.init(loggerFactory);
                selectionController.init(this, gridPanel, gridOptionsWrapper, $scope, rowRenderer, eventService);
                filterManager.init(this, gridOptionsWrapper, $compile, $scope, columnController, popupService, valueService);
                selectionRendererFactory.init(this, selectionController);
                columnController.init(this, selectionRendererFactory, gridOptionsWrapper, expressionService, valueService, masterSlaveService, eventService);
                rowRenderer.init(columnController, gridOptionsWrapper, gridPanel, this, selectionRendererFactory, $compile, $scope, selectionController, expressionService, templateService, valueService, eventService);
                headerRenderer.init(gridOptionsWrapper, columnController, gridPanel, this, filterManager, $scope, $compile);
                inMemoryRowController.init(gridOptionsWrapper, columnController, this, filterManager, $scope, groupCreator, valueService, eventService);
                virtualPageRowController.init(rowRenderer, gridOptionsWrapper, this);
                valueService.init(gridOptionsWrapper, expressionService, columnController);
                groupCreator.init(valueService);
                masterSlaveService.init(gridOptionsWrapper, columnController, gridPanel, loggerFactory, eventService);
                if (globalEventListener) {
                    eventService.addGlobalListener(globalEventListener);
                }
                var toolPanelLayout = null;
                var toolPanel = null;
                if (!gridOptionsWrapper.isForPrint()) {
                    toolPanel = new grid.ToolPanel();
                    toolPanelLayout = toolPanel.layout;
                    toolPanel.init(columnController, inMemoryRowController, gridOptionsWrapper, popupService, eventService, dragAndDropService);
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
                if (!gridOptionsWrapper.isForPrint()) {
                    paginationController = new grid.PaginationController();
                    paginationController.init(this, gridOptionsWrapper);
                    paginationGui = paginationController.getGui();
                }
                this.rowModel = rowModel;
                this.usingInMemoryModel = true;
                this.selectionController = selectionController;
                this.columnController = columnController;
                this.inMemoryRowController = inMemoryRowController;
                this.virtualPageRowController = virtualPageRowController;
                this.rowRenderer = rowRenderer;
                this.headerRenderer = headerRenderer;
                this.paginationController = paginationController;
                this.filterManager = filterManager;
                this.toolPanel = toolPanel;
                this.gridPanel = gridPanel;
                this.valueService = valueService;
                this.masterSlaveService = masterSlaveService;
                this.eventService = eventService;
                this.gridOptionsWrapper = gridOptionsWrapper;
                this.dragAndDropService = dragAndDropService;
                this.eRootPanel = new grid.BorderLayout({
                    center: gridPanel.getLayout(),
                    east: toolPanelLayout,
                    south: paginationGui,
                    dontFill: gridOptionsWrapper.isForPrint(),
                    name: 'eRootPanel'
                });
                popupService.init(this.eRootPanel.getGui());
                // default is we don't show paging panel, this is set to true when datasource is set
                this.eRootPanel.setSouthVisible(false);
                // see what the grid options are for default of toolbar
                this.showToolPanel(gridOptionsWrapper.isShowToolPanel());
                eUserProvidedDiv.appendChild(this.eRootPanel.getGui());
                this.logger.log('grid DOM added');
                eventService.addEventListener(grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_GROUP_OPENED, this.onColumnChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_MOVED, this.onColumnChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_PINNED_COUNT_CHANGED, this.onColumnChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_PIVOT_CHANGE, this.onColumnChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_RESIZED, this.onColumnChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_VALUE_CHANGE, this.onColumnChanged.bind(this));
                eventService.addEventListener(grid.Events.EVENT_COLUMN_VISIBLE, this.onColumnChanged.bind(this));
            };
            Grid.prototype.onColumnChanged = function (event) {
                if (event.isPivotChanged()) {
                    this.inMemoryRowController.onPivotChanged();
                }
                if (event.isValueChanged()) {
                    this.inMemoryRowController.doAggregate();
                }
                if (event.isIndividualColumnResized()) {
                    this.onIndividualColumnResized(event.getColumn());
                }
                else {
                    this.refreshHeaderAndBody();
                }
                this.gridPanel.showPinnedColContainersIfNeeded();
            };
            Grid.prototype.refreshPivot = function () {
                this.inMemoryRowController.onPivotChanged();
                this.refreshHeaderAndBody();
            };
            Grid.prototype.getEventService = function () {
                return this.eventService;
            };
            Grid.prototype.onIndividualColumnResized = function (column) {
                this.headerRenderer.onIndividualColumnResized(column);
                this.rowRenderer.onIndividualColumnResized(column);
                if (column.pinned) {
                    this.updatePinnedColContainerWidthAfterColResize();
                }
                else {
                    this.updateBodyContainerWidthAfterColResize();
                }
            };
            Grid.prototype.showToolPanel = function (show) {
                if (!this.toolPanel) {
                    this.toolPanelShowing = false;
                    return;
                }
                this.toolPanelShowing = show;
                this.eRootPanel.setEastVisible(show);
            };
            Grid.prototype.isToolPanelShowing = function () {
                return this.toolPanelShowing;
            };
            Grid.prototype.isUsingInMemoryModel = function () {
                return this.usingInMemoryModel;
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
                    this.usingInMemoryModel = false;
                    showPagingPanel = false;
                }
                else if (this.doingPagination) {
                    this.paginationController.setDatasource(datasourceToUse);
                    this.virtualPageRowController.setDatasource(null);
                    this.rowModel = this.inMemoryRowController.getModel();
                    this.usingInMemoryModel = true;
                    showPagingPanel = true;
                }
                else {
                    this.paginationController.setDatasource(null);
                    this.virtualPageRowController.setDatasource(null);
                    this.rowModel = this.inMemoryRowController.getModel();
                    this.usingInMemoryModel = true;
                    showPagingPanel = false;
                }
                this.selectionController.setRowModel(this.rowModel);
                this.filterManager.setRowModel(this.rowModel);
                this.rowRenderer.setRowModel(this.rowModel);
                this.gridPanel.setRowModel(this.rowModel);
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
            Grid.prototype.destroy = function () {
                if (this.windowResizeListener) {
                    window.removeEventListener('resize', this.windowResizeListener);
                    this.logger.log('Removing windowResizeListener');
                }
                this.finished = true;
                this.dragAndDropService.destroy();
                this.eUserProvidedDiv.removeChild(this.eRootPanel.getGui());
                this.logger.log('Grid DOM removed');
            };
            Grid.prototype.onQuickFilterChanged = function (newFilter) {
                var actuallyChanged = this.filterManager.setQuickFilter(newFilter);
                if (actuallyChanged) {
                    this.onFilterChanged();
                }
            };
            Grid.prototype.onFilterModified = function () {
                this.eventService.dispatchEvent(grid.Events.EVENT_FILTER_MODIFIED);
            };
            Grid.prototype.onFilterChanged = function () {
                this.eventService.dispatchEvent(grid.Events.EVENT_BEFORE_FILTER_CHANGED);
                this.filterManager.onFilterChanged();
                this.headerRenderer.updateFilterIcons();
                if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
                    // if doing server side filtering, changing the sort has the impact
                    // of resetting the datasource
                    this.setDatasource();
                }
                else {
                    // if doing in memory filtering, we just update the in memory data
                    this.updateModelAndRefresh(grid.Constants.STEP_FILTER);
                }
                this.eventService.dispatchEvent(grid.Events.EVENT_AFTER_FILTER_CHANGED);
            };
            Grid.prototype.onRowClicked = function (multiSelectKeyPressed, rowIndex, node) {
                // we do not allow selecting groups by clicking (as the click here expands the group)
                // so return if it's a group row
                if (node.group) {
                    return;
                }
                // we also don't allow selection of floating rows
                if (node.floating) {
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
                var doDeselect = multiSelectKeyPressed
                    && selectionController.isNodeSelected(node)
                    && gridOptionsWrapper.isRowDeselection();
                if (doDeselect) {
                    selectionController.deselectNode(node);
                }
                else {
                    selectionController.selectNode(node, multiSelectKeyPressed);
                }
            };
            Grid.prototype.showLoadingOverlay = function () {
                this.gridPanel.showLoadingOverlay();
            };
            Grid.prototype.showNoRowsOverlay = function () {
                this.gridPanel.showNoRowsOverlay();
            };
            Grid.prototype.hideOverlay = function () {
                this.gridPanel.hideOverlay();
            };
            Grid.prototype.setupColumns = function () {
                this.columnController.onColumnsChanged();
                this.gridPanel.showPinnedColContainersIfNeeded();
            };
            // rowsToRefresh is at what index to start refreshing the rows. the assumption is
            // if we are expanding or collapsing a group, then only he rows below the group
            // need to be refresh. this allows the context (eg focus) of the other cells to
            // remain.
            Grid.prototype.updateModelAndRefresh = function (step, refreshFromIndex) {
                this.inMemoryRowController.updateModel(step);
                this.rowRenderer.refreshView(refreshFromIndex);
            };
            Grid.prototype.setRowData = function (rows, firstId) {
                if (rows) {
                    this.gridOptions.rowData = rows;
                }
                var rowData = this.gridOptionsWrapper.getRowData();
                this.inMemoryRowController.setAllRows(rowData, firstId);
                this.selectionController.deselectAll();
                this.filterManager.onNewRowsLoaded();
                this.updateModelAndRefresh(grid.Constants.STEP_EVERYTHING);
                this.headerRenderer.updateFilterIcons();
                if (rowData && rowData.length > 0) {
                    this.hideOverlay();
                }
                else {
                    this.showNoRowsOverlay();
                }
            };
            Grid.prototype.ensureNodeVisible = function (comparator) {
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
            Grid.prototype.setFocusedCell = function (rowIndex, colIndex) {
                this.gridPanel.ensureIndexVisible(rowIndex);
                this.gridPanel.ensureColIndexVisible(colIndex);
                var that = this;
                setTimeout(function () {
                    that.rowRenderer.setFocusedCell(rowIndex, colIndex);
                }, 10);
            };
            Grid.prototype.getSortModel = function () {
                var allColumns = this.columnController.getAllColumns();
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
                        colId: columnsWithSorting[i].colId,
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
                var allColumns = this.columnController.getAllColumns();
                for (var i = 0; i < allColumns.length; i++) {
                    var column = allColumns[i];
                    var sortForCol = null;
                    var sortedAt = -1;
                    if (sortModelProvided && !column.colDef.suppressSorting) {
                        for (var j = 0; j < sortModel.length; j++) {
                            var sortModelEntry = sortModel[j];
                            if (typeof sortModelEntry.colId === 'string'
                                && typeof column.colId === 'string'
                                && sortModelEntry.colId === column.colId) {
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
                this.eventService.dispatchEvent(grid.Events.EVENT_BEFORE_SORT_CHANGED);
                this.headerRenderer.updateSortIcons();
                if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
                    // if doing server side sorting, changing the sort has the impact
                    // of resetting the datasource
                    this.setDatasource();
                }
                else {
                    // if doing in memory sorting, we just update the in memory data
                    this.updateModelAndRefresh(grid.Constants.STEP_SORT);
                }
                this.eventService.dispatchEvent(grid.Events.EVENT_AFTER_SORT_CHANGED);
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
                        if (typeof callback.rowSelected === 'function') {
                            callback.rowSelected(selected);
                        }
                    });
                }
                this.rowRenderer.onRowSelected(rowIndex, selected);
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
            Grid.prototype.setColumnDefs = function (colDefs) {
                if (colDefs) {
                    this.gridOptions.columnDefs = colDefs;
                }
                this.setupColumns();
                this.updateModelAndRefresh(grid.Constants.STEP_EVERYTHING);
                // found that adding pinned column can upset the layout
                this.doLayout();
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
                }
            };
            return Grid;
        })();
        grid.Grid = Grid;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        var ComponentUtil = (function () {
            function ComponentUtil() {
            }
            ComponentUtil.copyAttributesToGridOptions = function (gridOptions, component) {
                // create empty grid options if none were passed
                if (typeof gridOptions !== 'object') {
                    gridOptions = {};
                }
                // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
                var pGridOptions = gridOptions;
                // add in all the simple properties
                ComponentUtil.SIMPLE_PROPERTIES.concat(ComponentUtil.WITH_IMPACT_OTHER_PROPERTIES).forEach(function (key) {
                    if (typeof (component)[key] !== 'undefined') {
                        pGridOptions[key] = component[key];
                    }
                });
                ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES.concat(ComponentUtil.WITH_IMPACT_BOOLEAN_PROPERTIES).forEach(function (key) {
                    if (typeof (component)[key] !== 'undefined') {
                        pGridOptions[key] = ComponentUtil.toBoolean(component[key]);
                    }
                });
                ComponentUtil.SIMPLE_NUMBER_PROPERTIES.concat(ComponentUtil.WITH_IMPACT_NUMBER_PROPERTIES).forEach(function (key) {
                    if (typeof (component)[key] !== 'undefined') {
                        pGridOptions[key] = ComponentUtil.toNumber(component[key]);
                    }
                });
                return gridOptions;
            };
            ComponentUtil.processOnChange = function (changes, gridOptions, component) {
                if (!component._initialised || !changes) {
                    return;
                }
                // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
                //var pThis = <any>this;
                var pGridOptions = gridOptions;
                // check if any change for the simple types, and if so, then just copy in the new value
                ComponentUtil.SIMPLE_PROPERTIES.forEach(function (key) {
                    if (changes[key]) {
                        pGridOptions[key] = changes[key].currentValue;
                    }
                });
                ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES.forEach(function (key) {
                    if (changes[key]) {
                        pGridOptions[key] = ComponentUtil.toBoolean(changes[key].currentValue);
                    }
                });
                ComponentUtil.SIMPLE_NUMBER_PROPERTIES.forEach(function (key) {
                    if (changes[key]) {
                        pGridOptions[key] = ComponentUtil.toNumber(changes[key].currentValue);
                    }
                });
                if (changes.showToolPanel) {
                    component.api.showToolPanel(component.showToolPanel);
                }
                if (changes.quickFilterText) {
                    component.api.setQuickFilter(component.quickFilterText);
                }
                if (changes.rowData) {
                    component.api.setRowData(component.rowData);
                }
                if (changes.floatingTopRowData) {
                    component.api.setFloatingTopRowData(component.floatingTopRowData);
                }
                if (changes.floatingBottomRowData) {
                    component.api.setFloatingBottomRowData(component.floatingBottomRowData);
                }
                if (changes.columnDefs) {
                    component.api.setColumnDefs(component.columnDefs);
                }
                if (changes.datasource) {
                    component.api.setDatasource(component.datasource);
                }
                if (changes.pinnedColumnCount) {
                    component.columnApi.setPinnedColumnCount(component.pinnedColumnCount);
                }
                if (changes.pinnedColumnCount) {
                    component.columnApi.setPinnedColumnCount(component.pinnedColumnCount);
                }
                if (changes.groupHeaders) {
                    component.api.setGroupHeaders(component.groupHeaders);
                }
                if (changes.headerHeight) {
                    component.api.setHeaderHeight(component.headerHeight);
                }
                // need to review these, they are not impacting anything, they should
                // call something on the API to update the grid
                if (changes.groupKeys) {
                    component.gridOptions.groupKeys = component.groupKeys;
                }
                if (changes.groupAggFunction) {
                    component.gridOptions.groupAggFunction = component.groupAggFunction;
                }
                if (changes.groupAggFields) {
                    component.gridOptions.groupAggFields = component.groupAggFields;
                }
            };
            ComponentUtil.toBoolean = function (value) {
                if (typeof value === 'boolean') {
                    return value;
                }
                else if (typeof value === 'string') {
                    // for boolean, compare to empty String to allow attributes appearing with
                    // not value to be treated as 'true'
                    return value.toUpperCase() === 'TRUE' || value == '';
                }
                else {
                    return false;
                }
            };
            ComponentUtil.toNumber = function (value) {
                if (typeof value === 'number') {
                    return value;
                }
                else if (typeof value === 'string') {
                    return Number(value);
                }
                else {
                    return undefined;
                }
            };
            ComponentUtil.SIMPLE_PROPERTIES = [
                'sortingOrder',
                'icons', 'localeText', 'localeTextFunc',
                'groupColumnDef', 'context', 'rowStyle', 'rowClass', 'headerCellRenderer',
                'groupDefaultExpanded', 'slaveGrids', 'rowSelection',
                'overlayLoadingTemplate', 'overlayNoRowsTemplate'
            ];
            ComponentUtil.SIMPLE_NUMBER_PROPERTIES = [
                'rowHeight', 'rowBuffer', 'colWidth'
            ];
            ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES = [
                'virtualPaging', 'toolPanelSuppressPivot', 'toolPanelSuppressValues', 'rowsAlreadyGrouped',
                'suppressRowClickSelection', 'suppressCellSelection', 'suppressHorizontalScroll', 'debug',
                'enableColResize', 'enableCellExpressions', 'enableSorting', 'enableServerSideSorting',
                'enableFilter', 'enableServerSideFilter', 'angularCompileRows', 'angularCompileFilters',
                'angularCompileHeaders', 'groupSuppressAutoColumn', 'groupSelectsChildren', 'groupHidePivotColumns',
                'groupIncludeFooter', 'groupUseEntireRow', 'groupSuppressRow', 'groupSuppressBlankHeader', 'forPrint',
                'suppressMenuHide', 'rowDeselection', 'unSortIcon', 'suppressMultiSort', 'suppressScrollLag',
                'singleClickEdit'
            ];
            ComponentUtil.WITH_IMPACT_NUMBER_PROPERTIES = ['pinnedColumnCount', 'headerHeight'];
            ComponentUtil.WITH_IMPACT_BOOLEAN_PROPERTIES = ['groupHeaders', 'showToolPanel'];
            ComponentUtil.WITH_IMPACT_OTHER_PROPERTIES = [
                'rowData', 'floatingTopRowData', 'floatingBottomRowData', 'groupKeys',
                'groupAggFields', 'columnDefs', 'datasource', 'quickFilterText'];
            ComponentUtil.CALLBACKS = ['groupRowInnerRenderer', 'groupRowRenderer', 'groupAggFunction',
                'isScrollLag', 'isExternalFilterPresent', 'doesExternalFilterPass', 'getRowClass', 'getRowStyle',
                'headerCellRenderer'];
            ComponentUtil.ALL_PROPERTIES = ComponentUtil.SIMPLE_PROPERTIES
                .concat(ComponentUtil.SIMPLE_NUMBER_PROPERTIES)
                .concat(ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES)
                .concat(ComponentUtil.WITH_IMPACT_NUMBER_PROPERTIES)
                .concat(ComponentUtil.WITH_IMPACT_BOOLEAN_PROPERTIES)
                .concat(ComponentUtil.WITH_IMPACT_OTHER_PROPERTIES);
            return ComponentUtil;
        })();
        grid.ComponentUtil = ComponentUtil;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path='componentUtil.ts'/>
// todo:
// + need to hook into destroy callback
// + how can we make this element extend div?
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        // lets load angular 2 if we can find it
        var _ng;
        // we are not using annotations on purpose, as if we do, then there is a runtime dependency
        // on the annotation, which would break this code if angular 2 was not included, which is bad,
        // as angular 2 is optional for ag-grid
        var AgGridNg2 = (function () {
            function AgGridNg2(elementDef) {
                this.elementDef = elementDef;
                this._initialised = false;
                // core grid events
                this.modelUpdated = new _ng.EventEmitter();
                this.cellClicked = new _ng.EventEmitter();
                this.cellDoubleClicked = new _ng.EventEmitter();
                this.cellContextMenu = new _ng.EventEmitter();
                this.cellValueChanged = new _ng.EventEmitter();
                this.cellFocused = new _ng.EventEmitter();
                this.rowSelected = new _ng.EventEmitter();
                this.selectionChanged = new _ng.EventEmitter();
                this.beforeFilterChanged = new _ng.EventEmitter();
                this.afterFilterChanged = new _ng.EventEmitter();
                this.filterModified = new _ng.EventEmitter();
                this.beforeSortChanged = new _ng.EventEmitter();
                this.afterSortChanged = new _ng.EventEmitter();
                this.virtualRowRemoved = new _ng.EventEmitter();
                this.rowClicked = new _ng.EventEmitter();
                this.rowDoubleClicked = new _ng.EventEmitter();
                this.ready = new _ng.EventEmitter();
                // column grid events
                this.columnEverythingChanged = new _ng.EventEmitter();
                this.columnPivotChanged = new _ng.EventEmitter();
                this.columnValueChanged = new _ng.EventEmitter();
                this.columnMoved = new _ng.EventEmitter();
                this.columnVisible = new _ng.EventEmitter();
                this.columnGroupOpened = new _ng.EventEmitter();
                this.columnResized = new _ng.EventEmitter();
                this.columnPinnedCountChanged = new _ng.EventEmitter();
            }
            // this gets called after the directive is initialised
            AgGridNg2.prototype.onInit = function () {
                this.gridOptions = grid.ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
                var nativeElement = this.elementDef.nativeElement;
                var globalEventLister = this.globalEventListener.bind(this);
                this._agGrid = new ag.grid.Grid(nativeElement, this.gridOptions, globalEventLister);
                this.api = this.gridOptions.api;
                this.columnApi = this.gridOptions.columnApi;
                this._initialised = true;
            };
            AgGridNg2.prototype.onChanges = function (changes) {
                grid.ComponentUtil.processOnChange(changes, this.gridOptions, this);
            };
            AgGridNg2.prototype.onDestroy = function () {
                this.api.destroy();
            };
            AgGridNg2.prototype.globalEventListener = function (eventType, event) {
                var emitter;
                switch (eventType) {
                    case grid.Events.EVENT_COLUMN_GROUP_OPENED:
                        emitter = this.columnGroupOpened;
                        break;
                    case grid.Events.EVENT_COLUMN_EVERYTHING_CHANGED:
                        emitter = this.columnEverythingChanged;
                        break;
                    case grid.Events.EVENT_COLUMN_MOVED:
                        emitter = this.columnMoved;
                        break;
                    case grid.Events.EVENT_COLUMN_PINNED_COUNT_CHANGED:
                        emitter = this.columnPinnedCountChanged;
                        break;
                    case grid.Events.EVENT_COLUMN_PIVOT_CHANGE:
                        emitter = this.columnPivotChanged;
                        break;
                    case grid.Events.EVENT_COLUMN_RESIZED:
                        emitter = this.columnResized;
                        break;
                    case grid.Events.EVENT_COLUMN_VALUE_CHANGE:
                        emitter = this.columnValueChanged;
                        break;
                    case grid.Events.EVENT_COLUMN_VISIBLE:
                        emitter = this.columnVisible;
                        break;
                    case grid.Events.EVENT_MODEL_UPDATED:
                        emitter = this.modelUpdated;
                        break;
                    case grid.Events.EVENT_CELL_CLICKED:
                        emitter = this.cellClicked;
                        break;
                    case grid.Events.EVENT_CELL_DOUBLE_CLICKED:
                        emitter = this.cellDoubleClicked;
                        break;
                    case grid.Events.EVENT_CELL_CONTEXT_MENU:
                        emitter = this.cellContextMenu;
                        break;
                    case grid.Events.EVENT_CELL_VALUE_CHANGED:
                        emitter = this.cellValueChanged;
                        break;
                    case grid.Events.EVENT_CELL_FOCUSED:
                        emitter = this.cellFocused;
                        break;
                    case grid.Events.EVENT_ROW_SELECTED:
                        emitter = this.rowSelected;
                        break;
                    case grid.Events.EVENT_SELECTION_CHANGED:
                        emitter = this.selectionChanged;
                        break;
                    case grid.Events.EVENT_BEFORE_FILTER_CHANGED:
                        emitter = this.beforeFilterChanged;
                        break;
                    case grid.Events.EVENT_AFTER_FILTER_CHANGED:
                        emitter = this.afterFilterChanged;
                        break;
                    case grid.Events.EVENT_AFTER_SORT_CHANGED:
                        emitter = this.afterSortChanged;
                        break;
                    case grid.Events.EVENT_BEFORE_SORT_CHANGED:
                        emitter = this.beforeSortChanged;
                        break;
                    case grid.Events.EVENT_FILTER_MODIFIED:
                        emitter = this.filterModified;
                        break;
                    case grid.Events.EVENT_VIRTUAL_ROW_REMOVED:
                        emitter = this.virtualRowRemoved;
                        break;
                    case grid.Events.EVENT_ROW_CLICKED:
                        emitter = this.rowClicked;
                        break;
                    case grid.Events.EVENT_ROW_DOUBLE_CLICKED:
                        emitter = this.rowDoubleClicked;
                        break;
                    case grid.Events.EVENT_READY:
                        emitter = this.ready;
                        break;
                    default:
                        console.log('ag-Grid: AgGridNg2 - unknown event type: ' + eventType);
                        return;
                }
                emitter.next(event);
            };
            return AgGridNg2;
        })();
        grid.AgGridNg2 = AgGridNg2;
        // check for angular and component, as if angular 1, we will find angular but the wrong version
        if (window.ng && window.ng.Component) {
            var ng = window.ng;
            initialiseAgGridWithAngular2(ng);
        }
        function initialiseAgGridWithAngular2(ng) {
            _ng = ng;
            AgGridNg2.annotations = [
                new _ng.Component({
                    selector: 'ag-grid-ng2',
                    events: [
                        // core grid events
                        'modelUpdated', 'cellClicked', 'cellDoubleClicked', 'cellContextMenu', 'cellValueChanged', 'cellFocused',
                        'rowSelected', 'selectionChanged', 'beforeFilterChanged', 'afterFilterChanged',
                        'filterModified', 'beforeSortChanged', 'afterSortChanged', 'virtualRowRemoved',
                        'rowClicked', 'rowDoubleClicked', 'ready',
                        // column events
                        'columnEverythingChanged', 'columnPivotChanged', 'columnValueChanged', 'columnMoved',
                        'columnVisible', 'columnGroupOpened', 'columnResized', 'columnPinnedCountChanged'],
                    properties: ['gridOptions']
                        .concat(grid.ComponentUtil.SIMPLE_PROPERTIES)
                        .concat(grid.ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES)
                        .concat(grid.ComponentUtil.SIMPLE_NUMBER_PROPERTIES)
                        .concat(grid.ComponentUtil.WITH_IMPACT_OTHER_PROPERTIES)
                        .concat(grid.ComponentUtil.WITH_IMPACT_BOOLEAN_PROPERTIES)
                        .concat(grid.ComponentUtil.WITH_IMPACT_NUMBER_PROPERTIES)
                        .concat(grid.ComponentUtil.CALLBACKS),
                    compileChildren: false // no angular on the inside thanks
                }),
                new _ng.View({
                    template: '',
                    // tell angular we don't want view encapsulation, we don't want a shadow root
                    encapsulation: _ng.ViewEncapsulation.None
                })
            ];
            AgGridNg2.parameters = [[_ng.ElementRef]];
        }
        grid.initialiseAgGridWithAngular2 = initialiseAgGridWithAngular2;
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path='componentUtil.ts'/>
var ag;
(function (ag) {
    var grid;
    (function (grid) {
        if (document.registerElement) {
            // i don't think this type of extension is possible in TypeScript, so back to
            // plain Javascript to create this object
            var AgileGridProto = Object.create(HTMLElement.prototype);
            // wrap each property with a get and set method, so we can track when changes are done
            grid.ComponentUtil.ALL_PROPERTIES.forEach(function (key) {
                Object.defineProperty(AgileGridProto, key, {
                    set: function (v) {
                        this.__agGridSetProperty(key, v);
                    },
                    get: function () {
                        return this.__agGridGetProperty(key);
                    }
                });
            });
            AgileGridProto.__agGridSetProperty = function (key, value) {
                if (!this.__attributes) {
                    this.__attributes = {};
                }
                this.__attributes[key] = value;
                // keeping this consistent with the ng2 onChange, so I can reuse the handling code
                var changeObject = {};
                changeObject[key] = { currentValue: value };
                this.onChange(changeObject);
            };
            AgileGridProto.onChange = function (changes) {
                grid.ComponentUtil.processOnChange(changes, this.gridOptions, this);
            };
            AgileGridProto.__agGridGetProperty = function (key) {
                if (!this.__attributes) {
                    this.__attributes = {};
                }
                return this.__attributes[key];
            };
            AgileGridProto.setGridOptions = function (options) {
                var globalEventListener = this.globalEventListener.bind(this);
                this._gridOptions = grid.ComponentUtil.copyAttributesToGridOptions(options, this);
                this._agGrid = new ag.grid.Grid(this, this._gridOptions, globalEventListener);
                this.api = options.api;
                this.columnApi = options.columnApi;
                this._initialised = true;
            };
            // copies all the attributes into this object
            AgileGridProto.createdCallback = function () {
                for (var i = 0; i < this.attributes.length; i++) {
                    var attribute = this.attributes[i];
                    this.setPropertyFromAttribute(attribute);
                }
            };
            AgileGridProto.setPropertyFromAttribute = function (attribute) {
                var name = toCamelCase(attribute.nodeName);
                var value = attribute.nodeValue;
                if (grid.ComponentUtil.ALL_PROPERTIES.indexOf(name) >= 0) {
                    this[name] = value;
                }
            };
            AgileGridProto.attachedCallback = function (params) { };
            AgileGridProto.detachedCallback = function (params) { };
            AgileGridProto.attributeChangedCallback = function (attributeName) {
                var attribute = this.attributes[attributeName];
                this.setPropertyFromAttribute(attribute);
            };
            AgileGridProto.globalEventListener = function (eventType, event) {
                var eventLowerCase = eventType.toLowerCase();
                var browserEvent = new Event(eventLowerCase);
                var browserEventNoType = browserEvent;
                browserEventNoType.agGridDetails = event;
                this.dispatchEvent(browserEvent);
                var callbackMethod = 'on' + eventLowerCase;
                if (typeof this[callbackMethod] === 'function') {
                    this[callbackMethod](browserEvent);
                }
            };
            // finally, register
            document.registerElement('ag-grid', { prototype: AgileGridProto });
        }
        function toCamelCase(myString) {
            if (typeof myString === 'string') {
                var result = myString.replace(/-([a-z])/g, function (g) {
                    return g[1].toUpperCase();
                });
                return result;
            }
            else {
                return myString;
            }
        }
    })(grid = ag.grid || (ag.grid = {}));
})(ag || (ag = {}));
/// <reference path="grid.ts" />
/// <reference path="components/agGridNg2.ts" />
/// <reference path="components/agGridWebComponent.ts" />
(function () {
    // Establish the root object, `window` or `exports`
    var root = this;
    // provide a reference to angular
    var angular = window.angular;
    // if angular is present, register the directive - checking for 'module' and 'directive' also to make
    // sure it's Angular 1 and not Angular 2
    if (typeof angular !== 'undefined' && typeof angular.module !== 'undefined' && angular.directive !== 'undefined') {
        var angularModule = angular.module("agGrid", []);
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
    root.agGridGlobalFunc = angularGridGlobalFunction;
    function AngularDirectiveController($element, $scope, $compile, $attrs) {
        var gridOptions;
        var quickFilterOnScope;
        var keyOfGridInScope = $attrs.agGrid;
        quickFilterOnScope = keyOfGridInScope + '.quickFilterText';
        gridOptions = $scope.$eval(keyOfGridInScope);
        if (!gridOptions) {
            console.warn("WARNING - grid options for ag-Grid not found. Please ensure the attribute ag-grid points to a valid object on the scope");
            return;
        }
        var eGridDiv = $element[0];
        var grid = new ag.grid.Grid(eGridDiv, gridOptions, null, $scope, $compile, quickFilterOnScope);
        $scope.$on("$destroy", function () {
            grid.destroy();
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
        new ag.grid.Grid(eGridDiv, gridOptions);
    }
}).call(window);
