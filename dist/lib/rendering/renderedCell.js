/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var utils_1 = require('../utils');
var column_1 = require("../entities/column");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var expressionService_1 = require("../expressionService");
var selectionRendererFactory_1 = require("../selectionRendererFactory");
var rowRenderer_1 = require("./rowRenderer");
var templateService_1 = require("../templateService");
var columnController_1 = require("../columnController/columnController");
var valueService_1 = require("../valueService");
var eventService_1 = require("../eventService");
var constants_1 = require("../constants");
var events_1 = require("../events");
var context_1 = require("../context/context");
var columnController_2 = require("../columnController/columnController");
var gridApi_1 = require("../gridApi");
var context_2 = require("../context/context");
var focusedCellController_1 = require("../focusedCellController");
var context_3 = require("../context/context");
var gridCell_1 = require("../entities/gridCell");
var RenderedCell = (function () {
    function RenderedCell(column, cellRendererMap, node, rowIndex, scope, renderedRow) {
        this.destroyMethods = [];
        this.firstRightPinned = false;
        this.lastLeftPinned = false;
        this.column = column;
        this.cellRendererMap = cellRendererMap;
        this.node = node;
        this.rowIndex = rowIndex;
        this.scope = scope;
        this.renderedRow = renderedRow;
    }
    RenderedCell.prototype.checkPinnedClasses = function () {
    };
    RenderedCell.prototype.setPinnedClasses = function () {
        var _this = this;
        var firstPinnedChangedListener = function () {
            if (_this.firstRightPinned !== _this.column.isFirstRightPinned()) {
                _this.firstRightPinned = _this.column.isFirstRightPinned();
                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-first-right-pinned', _this.firstRightPinned);
            }
            if (_this.lastLeftPinned !== _this.column.isLastLeftPinned()) {
                _this.lastLeftPinned = _this.column.isLastLeftPinned();
                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-last-left-pinned', _this.lastLeftPinned);
            }
        };
        this.column.addEventListener(column_1.Column.EVENT_FIRST_RIGHT_PINNED_CHANGED, firstPinnedChangedListener);
        this.column.addEventListener(column_1.Column.EVENT_LAST_LEFT_PINNED_CHANGED, firstPinnedChangedListener);
        this.destroyMethods.push(function () {
            _this.column.removeEventListener(column_1.Column.EVENT_FIRST_RIGHT_PINNED_CHANGED, firstPinnedChangedListener);
            _this.column.removeEventListener(column_1.Column.EVENT_LAST_LEFT_PINNED_CHANGED, firstPinnedChangedListener);
        });
        firstPinnedChangedListener();
    };
    RenderedCell.prototype.getParentRow = function () {
        return this.eParentRow;
    };
    RenderedCell.prototype.setParentRow = function (eParentRow) {
        this.eParentRow = eParentRow;
    };
    RenderedCell.prototype.init = function () {
        this.data = this.getDataForRow();
        this.value = this.getValue();
        this.checkboxSelection = this.calculateCheckboxSelection();
        this.setupComponents();
    };
    RenderedCell.prototype.destroy = function () {
        this.destroyMethods.forEach(function (theFunction) {
            theFunction();
        });
    };
    RenderedCell.prototype.calculateCheckboxSelection = function () {
        // never allow selection on floating rows
        if (this.node.floating) {
            return false;
        }
        // if boolean set, then just use it
        var colDef = this.column.getColDef();
        if (typeof colDef.checkboxSelection === 'boolean') {
            return colDef.checkboxSelection;
        }
        // if function, then call the function to find out. we first check colDef for
        // a function, and if missing then check gridOptions, so colDef has precedence
        var selectionFunc;
        if (typeof colDef.checkboxSelection === 'function') {
            selectionFunc = colDef.checkboxSelection;
        }
        if (!selectionFunc && this.gridOptionsWrapper.getCheckboxSelection()) {
            selectionFunc = this.gridOptionsWrapper.getCheckboxSelection();
        }
        if (selectionFunc) {
            var params = this.createParams();
            return selectionFunc(params);
        }
        return false;
    };
    RenderedCell.prototype.getColumn = function () {
        return this.column;
    };
    RenderedCell.prototype.getValue = function () {
        return this.valueService.getValueUsingSpecificData(this.column, this.data, this.node);
    };
    RenderedCell.prototype.getGui = function () {
        return this.eGridCell;
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
    RenderedCell.prototype.setLeftOnCell = function () {
        var _this = this;
        var leftChangedListener = function () {
            var newLeft = _this.column.getLeft();
            if (utils_1.Utils.exists(newLeft)) {
                _this.eGridCell.style.left = _this.column.getLeft() + 'px';
            }
            else {
                _this.eGridCell.style.left = '';
            }
        };
        this.column.addEventListener(column_1.Column.EVENT_LEFT_CHANGED, leftChangedListener);
        this.destroyMethods.push(function () {
            _this.column.removeEventListener(column_1.Column.EVENT_LEFT_CHANGED, leftChangedListener);
        });
        leftChangedListener();
    };
    RenderedCell.prototype.addRangeSelectedListener = function () {
        var _this = this;
        if (!this.rangeController) {
            return;
        }
        var rangeCountLastTime = 0;
        var rangeSelectedListener = function () {
            var rangeCount = _this.rangeController.getCellRangeCount(new gridCell_1.GridCell(_this.rowIndex, _this.node.floating, _this.column));
            if (rangeCountLastTime !== rangeCount) {
                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-range-selected', rangeCount !== 0);
                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-range-selected-1', rangeCount === 1);
                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-range-selected-2', rangeCount === 2);
                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-range-selected-3', rangeCount === 3);
                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-range-selected-4', rangeCount >= 4);
                rangeCountLastTime = rangeCount;
            }
        };
        this.eventService.addEventListener(events_1.Events.EVENT_RANGE_SELECTION_CHANGED, rangeSelectedListener);
        this.destroyMethods.push(function () {
            _this.eventService.removeEventListener(events_1.Events.EVENT_RANGE_SELECTION_CHANGED, rangeSelectedListener);
        });
        rangeSelectedListener();
    };
    RenderedCell.prototype.addHighlightListener = function () {
        var _this = this;
        if (!this.rangeController) {
            return;
        }
        var clipboardListener = function (event) {
            utils_1.Utils.removeCssClass(_this.eGridCell, 'ag-cell-highlight');
            utils_1.Utils.removeCssClass(_this.eGridCell, 'ag-cell-highlight-animation');
            var cellId = new gridCell_1.GridCell(_this.rowIndex, _this.node.floating, _this.column).createId();
            var shouldFlash = event.cells[cellId];
            if (shouldFlash) {
                _this.flashCellForClipboardInteraction();
            }
        };
        this.eventService.addEventListener(events_1.Events.EVENT_FLASH_CELLS, clipboardListener);
        this.destroyMethods.push(function () {
            _this.eventService.removeEventListener(events_1.Events.EVENT_FLASH_CELLS, clipboardListener);
        });
    };
    RenderedCell.prototype.flashCellForClipboardInteraction = function () {
        var _this = this;
        // so tempted to not put a comment here!!!! but because i'm going to release and enterprise version,
        // i think maybe i should do....   first thing, we do this in a timeout, to make sure the previous
        // CSS is cleared, that's the css removal in addClipboardListener() method
        setTimeout(function () {
            // once css is cleared, we want to highlight the cells, without any animation
            utils_1.Utils.addCssClass(_this.eGridCell, 'ag-cell-highlight');
            setTimeout(function () {
                // then once that is applied, we remove the highlight with animation
                utils_1.Utils.removeCssClass(_this.eGridCell, 'ag-cell-highlight');
                utils_1.Utils.addCssClass(_this.eGridCell, 'ag-cell-highlight-animation');
                setTimeout(function () {
                    // and then to leave things as we got them, we remove the animation
                    utils_1.Utils.removeCssClass(_this.eGridCell, 'ag-cell-highlight-animation');
                }, 1000);
            }, 500);
        }, 0);
    };
    RenderedCell.prototype.addCellFocusedListener = function () {
        var _this = this;
        // set to null, not false, as we need to set 'ag-cell-no-focus' first time around
        var cellFocusedLastTime = null;
        var cellFocusedListener = function (event) {
            var cellFocused = _this.focusedCellController.isCellFocused(_this.rowIndex, _this.column, _this.node.floating);
            if (cellFocused !== cellFocusedLastTime) {
                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-focus', cellFocused);
                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-no-focus', !cellFocused);
                cellFocusedLastTime = cellFocused;
            }
            if (cellFocused && event && event.forceBrowserFocus) {
                _this.eGridCell.focus();
            }
        };
        this.eventService.addEventListener(events_1.Events.EVENT_CELL_FOCUSED, cellFocusedListener);
        this.destroyMethods.push(function () {
            _this.eventService.removeEventListener(events_1.Events.EVENT_CELL_FOCUSED, cellFocusedListener);
        });
        cellFocusedListener();
    };
    RenderedCell.prototype.setWidthOnCell = function () {
        var _this = this;
        var widthChangedListener = function () {
            _this.eGridCell.style.width = _this.column.getActualWidth() + "px";
        };
        this.column.addEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
        this.destroyMethods.push(function () {
            _this.column.removeEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
        });
        widthChangedListener();
    };
    RenderedCell.prototype.setupComponents = function () {
        this.eGridCell = document.createElement('div');
        this.setLeftOnCell();
        this.setWidthOnCell();
        this.setPinnedClasses();
        this.addRangeSelectedListener();
        this.addHighlightListener();
        this.addCellFocusedListener();
        // only set tab index if cell selection is enabled
        if (!this.gridOptionsWrapper.isSuppressCellSelection()) {
            this.eGridCell.setAttribute("tabindex", "-1");
        }
        // these are the grid styles, don't change between soft refreshes
        this.addClasses();
        this.addCellNavigationHandler();
        this.createParentOfValue();
        this.populateCell();
    };
    // called by rowRenderer when user navigates via tab key
    RenderedCell.prototype.startEditing = function (key) {
        var _this = this;
        var that = this;
        this.editingCell = true;
        utils_1.Utils.removeAllChildren(this.eGridCell);
        var eInput = document.createElement('input');
        eInput.type = 'text';
        utils_1.Utils.addCssClass(eInput, 'ag-cell-edit-input');
        var startWithOldValue = key !== constants_1.Constants.KEY_BACKSPACE && key !== constants_1.Constants.KEY_DELETE;
        var value = this.getValue();
        if (startWithOldValue && value !== null && value !== undefined) {
            eInput.value = value;
        }
        eInput.style.width = (this.column.getActualWidth() - 14) + 'px';
        this.eGridCell.appendChild(eInput);
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
            if (key === constants_1.Constants.KEY_ENTER) {
                _this.stopEditing(eInput, blurListener);
                _this.focusCell(true);
            }
        });
        //stop editing if enter pressed
        eInput.addEventListener('keydown', function (event) {
            var key = event.which || event.keyCode;
            if (key === constants_1.Constants.KEY_ESCAPE) {
                _this.stopEditing(eInput, blurListener, true);
                _this.focusCell(true);
            }
        });
        // tab key doesn't generate keypress, so need keydown to listen for that
        eInput.addEventListener('keydown', function (event) {
            var key = event.which || event.keyCode;
            if (key == constants_1.Constants.KEY_TAB) {
                that.stopEditing(eInput, blurListener);
                that.rowRenderer.startEditingNextCell(that.rowIndex, that.column, that.node.floating, event.shiftKey);
                // we don't want the default tab action, so return false, this stops the event from bubbling
                event.preventDefault();
                return false;
            }
        });
    };
    RenderedCell.prototype.focusCell = function (forceBrowserFocus) {
        this.focusedCellController.setFocusedCell(this.rowIndex, this.column, this.node.floating, forceBrowserFocus);
    };
    RenderedCell.prototype.stopEditing = function (eInput, blurListener, reset) {
        if (reset === void 0) { reset = false; }
        this.editingCell = false;
        var newValue = eInput.value;
        //If we don't remove the blur listener first, we get:
        //Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is no longer a child of this node. Perhaps it was moved in a 'blur' event handler?
        eInput.removeEventListener('blur', blurListener);
        if (!reset) {
            this.valueService.setValue(this.node, this.column, newValue);
            this.value = this.getValue();
        }
        utils_1.Utils.removeAllChildren(this.eGridCell);
        if (this.checkboxSelection) {
            this.eGridCell.appendChild(this.eCellWrapper);
        }
        this.refreshCell();
    };
    RenderedCell.prototype.createParams = function () {
        var params = {
            node: this.node,
            data: this.node.data,
            value: this.value,
            rowIndex: this.rowIndex,
            colDef: this.column.getColDef(),
            $scope: this.scope,
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridApi,
            columnApi: this.columnApi
        };
        return params;
    };
    RenderedCell.prototype.createEvent = function (event, eventSource) {
        var agEvent = this.createParams();
        agEvent.event = event;
        //agEvent.eventSource = eventSource;
        return agEvent;
    };
    RenderedCell.prototype.isCellEditable = function () {
        if (this.editingCell) {
            return false;
        }
        // never allow editing of groups
        if (this.node.group) {
            return false;
        }
        return this.column.isCellEditable(this.node);
    };
    RenderedCell.prototype.onMouseEvent = function (eventName, mouseEvent) {
        switch (eventName) {
            case 'click':
                this.onCellClicked(mouseEvent);
                break;
            case 'mousedown':
                this.onMouseDown();
                break;
            case 'dblclick':
                this.onCellDoubleClicked();
                break;
            case 'contextmenu':
                this.onContextMenu(mouseEvent);
                break;
        }
    };
    RenderedCell.prototype.onContextMenu = function (mouseEvent) {
        // to allow us to debug in chrome, we ignore the event if ctrl is pressed,
        // thus the normal menu is displayed
        if (mouseEvent.ctrlKey || mouseEvent.metaKey) {
            return;
        }
        var colDef = this.column.getColDef();
        var agEvent = this.createEvent(mouseEvent);
        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_CONTEXT_MENU, agEvent);
        if (colDef.onCellContextMenu) {
            colDef.onCellContextMenu(agEvent);
        }
        if (this.contextMenuFactory && !this.gridOptionsWrapper.isSuppressContextMenu()) {
            this.contextMenuFactory.showMenu(this.node, this.column, this.value, mouseEvent);
            event.preventDefault();
            return false;
        }
        else {
            return true;
        }
    };
    RenderedCell.prototype.onCellDoubleClicked = function () {
        var colDef = this.column.getColDef();
        // always dispatch event to eventService
        var agEvent = this.createEvent(event, this);
        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_DOUBLE_CLICKED, agEvent);
        // check if colDef also wants to handle event
        if (typeof colDef.onCellDoubleClicked === 'function') {
            colDef.onCellDoubleClicked(agEvent);
        }
        if (!this.gridOptionsWrapper.isSingleClickEdit() && this.isCellEditable()) {
            this.startEditing();
        }
    };
    RenderedCell.prototype.onMouseDown = function () {
        // we pass false to focusCell, as we don't want the cell to focus
        // also get the browser focus. if we did, then the cellRenderer could
        // have a text field in it, for example, and as the user clicks on the
        // text field, the text field, the focus doesn't get to the text
        // field, instead to goes to the div behind, making it impossible to
        // select the text field.
        this.focusCell(false);
        // if it's a right click, then if the cell is already in range,
        // don't change the range, however if the cell is not in a range,
        // we set a new range
        if (this.rangeController) {
            var thisCell = new gridCell_1.GridCell(this.rowIndex, this.node.floating, this.column);
            var cellAlreadyInRange = this.rangeController.isCellInAnyRange(thisCell);
            if (!cellAlreadyInRange) {
                this.rangeController.setRangeToCell(thisCell);
            }
        }
    };
    RenderedCell.prototype.onCellClicked = function (mouseEvent) {
        var agEvent = this.createEvent(mouseEvent, this);
        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_CLICKED, agEvent);
        var colDef = this.column.getColDef();
        if (colDef.onCellClicked) {
            colDef.onCellClicked(agEvent);
        }
        if (this.gridOptionsWrapper.isSingleClickEdit() && this.isCellEditable()) {
            this.startEditing();
        }
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
        var colDef = this.column.getColDef();
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
                utils_1.Utils.addStylesToElement(this.eGridCell, cssToUse);
            }
        }
    };
    RenderedCell.prototype.addClassesFromCollDef = function () {
        var _this = this;
        var colDef = this.column.getColDef();
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
                utils_1.Utils.addCssClass(this.eGridCell, classToUse);
            }
            else if (Array.isArray(classToUse)) {
                classToUse.forEach(function (cssClassItem) {
                    utils_1.Utils.addCssClass(_this.eGridCell, cssClassItem);
                });
            }
        }
    };
    RenderedCell.prototype.addClassesFromRules = function () {
        var colDef = this.column.getColDef();
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
                    utils_1.Utils.addCssClass(this.eGridCell, className);
                }
                else {
                    utils_1.Utils.removeCssClass(this.eGridCell, className);
                }
            }
        }
    };
    // rename this to 'add key event listener
    RenderedCell.prototype.addCellNavigationHandler = function () {
        var _this = this;
        this.eGridCell.addEventListener('keydown', function (event) {
            if (_this.editingCell) {
                return;
            }
            // only interested on key presses that are directly on this element, not any children elements. this
            // stops navigation if the user is in, for example, a text field inside the cell, and user hits
            // on of the keys we are looking for.
            if (event.target !== _this.eGridCell) {
                return;
            }
            var key = event.which || event.keyCode;
            var startNavigation = key === constants_1.Constants.KEY_DOWN || key === constants_1.Constants.KEY_UP
                || key === constants_1.Constants.KEY_LEFT || key === constants_1.Constants.KEY_RIGHT;
            if (startNavigation) {
                event.preventDefault();
                _this.rowRenderer.navigateToNextCell(key, _this.rowIndex, _this.column, _this.node.floating);
                return;
            }
            var startEdit = _this.isKeycodeForStartEditing(key);
            if (startEdit && _this.isCellEditable()) {
                _this.startEditing(key);
                // if we don't prevent default, then the editor that get displayed also picks up the 'enter key'
                // press, and stops editing immediately, hence giving he user experience that nothing happened
                event.preventDefault();
                return;
            }
            var selectRow = key === constants_1.Constants.KEY_SPACE;
            if (selectRow && _this.gridOptionsWrapper.isRowSelection()) {
                var selected = _this.node.isSelected();
                if (selected) {
                    _this.node.setSelected(false);
                }
                else {
                    _this.node.setSelected(true);
                }
                event.preventDefault();
                return;
            }
        });
    };
    RenderedCell.prototype.isKeycodeForStartEditing = function (key) {
        return key === constants_1.Constants.KEY_ENTER || key === constants_1.Constants.KEY_BACKSPACE || key === constants_1.Constants.KEY_DELETE;
    };
    RenderedCell.prototype.createParentOfValue = function () {
        if (this.checkboxSelection) {
            this.eCellWrapper = document.createElement('span');
            utils_1.Utils.addCssClass(this.eCellWrapper, 'ag-cell-wrapper');
            this.eGridCell.appendChild(this.eCellWrapper);
            //this.createSelectionCheckbox();
            this.eCheckbox = this.selectionRendererFactory.createSelectionCheckbox(this.node, this.rowIndex, this.renderedRow.addEventListener.bind(this.renderedRow));
            this.eCellWrapper.appendChild(this.eCheckbox);
            // eventually we call eSpanWithValue.innerHTML = xxx, so cannot include the checkbox (above) in this span
            this.eSpanWithValue = document.createElement('span');
            utils_1.Utils.addCssClass(this.eSpanWithValue, 'ag-cell-value');
            this.eCellWrapper.appendChild(this.eSpanWithValue);
            this.eParentOfValue = this.eSpanWithValue;
        }
        else {
            utils_1.Utils.addCssClass(this.eGridCell, 'ag-cell-value');
            this.eParentOfValue = this.eGridCell;
        }
    };
    RenderedCell.prototype.isVolatile = function () {
        return this.column.getColDef().volatile;
    };
    RenderedCell.prototype.refreshCell = function () {
        utils_1.Utils.removeAllChildren(this.eParentOfValue);
        this.value = this.getValue();
        this.populateCell();
        // if angular compiling, then need to also compile the cell again (angular compiling sucks, please wait...)
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            this.$compile(this.eGridCell)(this.scope);
        }
    };
    RenderedCell.prototype.putDataIntoCell = function () {
        // template gets preference, then cellRenderer, then do it ourselves
        var colDef = this.column.getColDef();
        if (colDef.template) {
            this.eParentOfValue.innerHTML = colDef.template;
        }
        else if (colDef.templateUrl) {
            var template = this.templateService.getTemplate(colDef.templateUrl, this.refreshCell.bind(this, true));
            if (template) {
                this.eParentOfValue.innerHTML = template;
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
                this.eParentOfValue.innerHTML = this.value.toString();
            }
        }
    };
    RenderedCell.prototype.useCellRenderer = function (cellRenderer) {
        var colDef = this.column.getColDef();
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
            eGridCell: this.eGridCell,
            eParentOfValue: this.eParentOfValue,
            addRenderedRowListener: this.renderedRow.addEventListener.bind(this.renderedRow)
        };
        // start duplicated code
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
        // end duplicated code
        if (resultFromRenderer === null || resultFromRenderer === '') {
            return;
        }
        if (utils_1.Utils.isNodeOrElement(resultFromRenderer)) {
            // a dom node or element was returned, so add child
            this.eParentOfValue.appendChild(resultFromRenderer);
        }
        else {
            // otherwise assume it was html, so just insert
            this.eParentOfValue.innerHTML = resultFromRenderer;
        }
    };
    RenderedCell.prototype.addClasses = function () {
        utils_1.Utils.addCssClass(this.eGridCell, 'ag-cell');
        this.eGridCell.setAttribute("colId", this.column.getColId());
        if (this.node.group && this.node.footer) {
            utils_1.Utils.addCssClass(this.eGridCell, 'ag-footer-cell');
        }
        if (this.node.group && !this.node.footer) {
            utils_1.Utils.addCssClass(this.eGridCell, 'ag-group-cell');
        }
    };
    __decorate([
        context_1.Autowired('columnApi'), 
        __metadata('design:type', columnController_2.ColumnApi)
    ], RenderedCell.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi'), 
        __metadata('design:type', gridApi_1.GridApi)
    ], RenderedCell.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], RenderedCell.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('expressionService'), 
        __metadata('design:type', expressionService_1.ExpressionService)
    ], RenderedCell.prototype, "expressionService", void 0);
    __decorate([
        context_1.Autowired('selectionRendererFactory'), 
        __metadata('design:type', selectionRendererFactory_1.SelectionRendererFactory)
    ], RenderedCell.prototype, "selectionRendererFactory", void 0);
    __decorate([
        context_1.Autowired('rowRenderer'), 
        __metadata('design:type', rowRenderer_1.RowRenderer)
    ], RenderedCell.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired('$compile'), 
        __metadata('design:type', Object)
    ], RenderedCell.prototype, "$compile", void 0);
    __decorate([
        context_1.Autowired('templateService'), 
        __metadata('design:type', templateService_1.TemplateService)
    ], RenderedCell.prototype, "templateService", void 0);
    __decorate([
        context_1.Autowired('valueService'), 
        __metadata('design:type', valueService_1.ValueService)
    ], RenderedCell.prototype, "valueService", void 0);
    __decorate([
        context_1.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], RenderedCell.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], RenderedCell.prototype, "columnController", void 0);
    __decorate([
        context_3.Optional('rangeController'), 
        __metadata('design:type', Object)
    ], RenderedCell.prototype, "rangeController", void 0);
    __decorate([
        context_1.Autowired('focusedCellController'), 
        __metadata('design:type', focusedCellController_1.FocusedCellController)
    ], RenderedCell.prototype, "focusedCellController", void 0);
    __decorate([
        context_3.Optional('contextMenuFactory'), 
        __metadata('design:type', Object)
    ], RenderedCell.prototype, "contextMenuFactory", void 0);
    __decorate([
        context_2.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], RenderedCell.prototype, "init", null);
    return RenderedCell;
})();
exports.RenderedCell = RenderedCell;
