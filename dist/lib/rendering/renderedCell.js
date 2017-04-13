/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var column_1 = require("../entities/column");
var rowNode_1 = require("../entities/rowNode");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var expressionService_1 = require("../expressionService");
var rowRenderer_1 = require("./rowRenderer");
var templateService_1 = require("../templateService");
var columnController_1 = require("../columnController/columnController");
var valueService_1 = require("../valueService");
var eventService_1 = require("../eventService");
var constants_1 = require("../constants");
var events_1 = require("../events");
var context_1 = require("../context/context");
var gridApi_1 = require("../gridApi");
var focusedCellController_1 = require("../focusedCellController");
var gridCell_1 = require("../entities/gridCell");
var focusService_1 = require("../misc/focusService");
var cellEditorFactory_1 = require("./cellEditorFactory");
var component_1 = require("../widgets/component");
var popupService_1 = require("../widgets/popupService");
var cellRendererFactory_1 = require("./cellRendererFactory");
var cellRendererService_1 = require("./cellRendererService");
var valueFormatterService_1 = require("./valueFormatterService");
var checkboxSelectionComponent_1 = require("./checkboxSelectionComponent");
var setLeftFeature_1 = require("./features/setLeftFeature");
var methodNotImplementedException_1 = require("../misc/methodNotImplementedException");
var stylingService_1 = require("../styling/stylingService");
var columnHoverService_1 = require("./columnHoverService");
var columnAnimationService_1 = require("./columnAnimationService");
var RenderedCell = (function (_super) {
    __extends(RenderedCell, _super);
    function RenderedCell(column, node, scope, renderedRow) {
        var _this = _super.call(this, '<div/>') || this;
        // set to null, not false, as we need to set 'ag-cell-no-focus' first time around
        _this.cellFocused = null;
        _this.firstRightPinned = false;
        _this.lastLeftPinned = false;
        // because we reference eGridCell everywhere in this class,
        // we keep a local reference
        _this.eGridCell = _this.getGui();
        _this.column = column;
        _this.node = node;
        _this.scope = scope;
        _this.renderedRow = renderedRow;
        _this.setupGridCell();
        return _this;
    }
    RenderedCell.prototype.createGridCell = function () {
        var gridCellDef = {
            rowIndex: this.node.rowIndex,
            floating: this.node.floating,
            column: this.column
        };
        this.gridCell = new gridCell_1.GridCell(gridCellDef);
    };
    RenderedCell.prototype.setupGridCell = function () {
        var _this = this;
        var listener = function () {
            // when index changes, this influences items that need the index, so we update the
            // grid cell so they are working off the new index.
            _this.createGridCell();
            // when the index of the row changes, ie means the cell may have lost of gained focus
            _this.checkCellFocused();
        };
        this.addDestroyableEventListener(this.node, rowNode_1.RowNode.EVENT_ROW_INDEX_CHANGED, listener);
        this.createGridCell();
    };
    RenderedCell.prototype.getGridCell = function () {
        return this.gridCell;
    };
    RenderedCell.prototype.setFocusInOnEditor = function () {
        if (this.editingCell && this.cellEditor && this.cellEditor.focusIn) {
            this.cellEditor.focusIn();
        }
    };
    RenderedCell.prototype.setFocusOutOnEditor = function () {
        if (this.editingCell && this.cellEditor && this.cellEditor.focusOut) {
            this.cellEditor.focusOut();
        }
    };
    RenderedCell.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.eParentRow) {
            this.eParentRow.removeChild(this.getGui());
            this.eParentRow = null;
        }
        if (this.cellEditor && this.cellEditor.destroy) {
            this.cellEditor.destroy();
        }
        if (this.cellRenderer && this.cellRenderer.destroy) {
            this.cellRenderer.destroy();
        }
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
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_FIRST_RIGHT_PINNED_CHANGED, firstPinnedChangedListener);
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_LAST_LEFT_PINNED_CHANGED, firstPinnedChangedListener);
        firstPinnedChangedListener();
    };
    RenderedCell.prototype.getParentRow = function () {
        return this.eParentRow;
    };
    RenderedCell.prototype.setParentRow = function (eParentRow) {
        this.eParentRow = eParentRow;
    };
    RenderedCell.prototype.setupCheckboxSelection = function () {
        // if boolean set, then just use it
        var colDef = this.column.getColDef();
        // never allow selection on floating rows
        if (this.node.floating) {
            this.usingWrapper = false;
        }
        else if (typeof colDef.checkboxSelection === 'boolean') {
            this.usingWrapper = colDef.checkboxSelection;
        }
        else if (typeof colDef.checkboxSelection === 'function') {
            this.usingWrapper = true;
        }
        else {
            this.usingWrapper = false;
        }
    };
    RenderedCell.prototype.getColumn = function () {
        return this.column;
    };
    RenderedCell.prototype.getValue = function () {
        var data = this.getDataForRow();
        return this.valueService.getValueUsingSpecificData(this.column, data, this.node);
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
    RenderedCell.prototype.addRangeSelectedListener = function () {
        var _this = this;
        if (!this.rangeController) {
            return;
        }
        var rangeCountLastTime = 0;
        var rangeSelectedListener = function () {
            var rangeCount = _this.rangeController.getCellRangeCount(_this.gridCell);
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
        this.addDestroyFunc(function () {
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
            var cellId = _this.gridCell.createId();
            var shouldFlash = event.cells[cellId];
            if (shouldFlash) {
                _this.animateCellWithHighlight();
            }
        };
        this.eventService.addEventListener(events_1.Events.EVENT_FLASH_CELLS, clipboardListener);
        this.addDestroyFunc(function () {
            _this.eventService.removeEventListener(events_1.Events.EVENT_FLASH_CELLS, clipboardListener);
        });
    };
    RenderedCell.prototype.addChangeListener = function () {
        var _this = this;
        var cellChangeListener = function (event) {
            if (event.column === _this.column) {
                _this.refreshCell();
                _this.animateCellWithDataChanged();
            }
        };
        this.addDestroyableEventListener(this.node, rowNode_1.RowNode.EVENT_CELL_CHANGED, cellChangeListener);
    };
    RenderedCell.prototype.animateCellWithDataChanged = function () {
        if (this.gridOptionsWrapper.isEnableCellChangeFlash() || this.column.getColDef().enableCellChangeFlash) {
            this.animateCell('data-changed');
        }
    };
    RenderedCell.prototype.animateCellWithHighlight = function () {
        this.animateCell('highlight');
    };
    RenderedCell.prototype.animateCell = function (cssName) {
        var _this = this;
        var fullName = 'ag-cell-' + cssName;
        var animationFullName = 'ag-cell-' + cssName + '-animation';
        // we want to highlight the cells, without any animation
        utils_1.Utils.addCssClass(this.eGridCell, fullName);
        utils_1.Utils.removeCssClass(this.eGridCell, animationFullName);
        // then once that is applied, we remove the highlight with animation
        setTimeout(function () {
            utils_1.Utils.removeCssClass(_this.eGridCell, fullName);
            utils_1.Utils.addCssClass(_this.eGridCell, animationFullName);
            setTimeout(function () {
                // and then to leave things as we got them, we remove the animation
                utils_1.Utils.removeCssClass(_this.eGridCell, animationFullName);
            }, 1000);
        }, 500);
    };
    RenderedCell.prototype.addCellFocusedListener = function () {
        var _this = this;
        var cellFocusedListener = this.checkCellFocused.bind(this);
        this.eventService.addEventListener(events_1.Events.EVENT_CELL_FOCUSED, cellFocusedListener);
        this.addDestroyFunc(function () {
            _this.eventService.removeEventListener(events_1.Events.EVENT_CELL_FOCUSED, cellFocusedListener);
        });
        cellFocusedListener();
    };
    RenderedCell.prototype.checkCellFocused = function (event) {
        var cellFocused = this.focusedCellController.isCellFocused(this.gridCell);
        // see if we need to change the classes on this cell
        if (cellFocused !== this.cellFocused) {
            utils_1.Utils.addOrRemoveCssClass(this.eGridCell, 'ag-cell-focus', cellFocused);
            utils_1.Utils.addOrRemoveCssClass(this.eGridCell, 'ag-cell-no-focus', !cellFocused);
            this.cellFocused = cellFocused;
        }
        // if this cell was just focused, see if we need to force browser focus, his can
        // happen if focus is programmatically set.
        if (cellFocused && event && event.forceBrowserFocus) {
            this.eGridCell.focus();
        }
        // if another cell was focused, and we are editing, then stop editing
        var fullRowEdit = this.gridOptionsWrapper.isFullRowEdit();
        if (!cellFocused && !fullRowEdit && this.editingCell) {
            this.stopRowOrCellEdit();
        }
    };
    RenderedCell.prototype.setWidthOnCell = function () {
        var _this = this;
        var widthChangedListener = function () {
            _this.eGridCell.style.width = _this.column.getActualWidth() + "px";
        };
        this.column.addEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
        this.addDestroyFunc(function () {
            _this.column.removeEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
        });
        widthChangedListener();
    };
    RenderedCell.prototype.init = function () {
        this.value = this.getValue();
        this.setupCheckboxSelection();
        this.setWidthOnCell();
        this.setPinnedClasses();
        this.addRangeSelectedListener();
        this.addHighlightListener();
        this.addChangeListener();
        this.addCellFocusedListener();
        this.addColumnHoverListener();
        this.addDomData();
        // this.addSuppressShortcutKeyListenersWhileEditing();
        this.addFeature(this.context, new setLeftFeature_1.SetLeftFeature(this.column, this.eGridCell));
        // only set tab index if cell selection is enabled
        if (!this.gridOptionsWrapper.isSuppressCellSelection()) {
            this.eGridCell.setAttribute("tabindex", "-1");
        }
        // these are the grid styles, don't change between soft refreshes
        this.addClasses();
        this.setInlineEditingClass();
        this.createParentOfValue();
        this.populateCell();
    };
    RenderedCell.prototype.addColumnHoverListener = function () {
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_COLUMN_HOVER_CHANGED, this.onColumnHover.bind(this));
        this.onColumnHover();
    };
    RenderedCell.prototype.onColumnHover = function () {
        var isHovered = this.columnHoverService.isHovered(this.column);
        utils_1.Utils.addOrRemoveCssClass(this.getGui(), 'ag-column-hover', isHovered);
    };
    RenderedCell.prototype.addDomData = function () {
        var domDataKey = this.gridOptionsWrapper.getDomDataKey();
        var gridCellNoType = this.eGridCell;
        gridCellNoType[domDataKey] = {
            renderedCell: this
        };
        this.addDestroyFunc(function () { return gridCellNoType[domDataKey] = null; });
    };
    RenderedCell.prototype.onEnterKeyDown = function () {
        if (this.editingCell) {
            this.stopRowOrCellEdit();
            this.focusCell(true);
        }
        else {
            this.startRowOrCellEdit(constants_1.Constants.KEY_ENTER);
        }
    };
    RenderedCell.prototype.onF2KeyDown = function () {
        if (!this.editingCell) {
            this.startRowOrCellEdit(constants_1.Constants.KEY_F2);
        }
    };
    RenderedCell.prototype.onEscapeKeyDown = function () {
        if (this.editingCell) {
            this.stopRowOrCellEdit(true);
            this.focusCell(true);
        }
    };
    RenderedCell.prototype.onPopupEditorClosed = function () {
        // we only call stopEditing if we are editing, as
        // it's possible the popup called 'stop editing'
        // before this, eg if 'enter key' was pressed on
        // the editor.
        if (this.editingCell) {
            // note: this only happens when use clicks outside of the grid. if use clicks on another
            // cell, then the editing will have already stopped on this cell
            this.stopRowOrCellEdit();
            // we only focus cell again if this cell is still focused. it is possible
            // it is not focused if the user cancelled the edit by clicking on another
            // cell outside of this one
            if (this.focusedCellController.isCellFocused(this.gridCell)) {
                this.focusCell(true);
            }
        }
    };
    RenderedCell.prototype.isEditing = function () {
        return this.editingCell;
    };
    RenderedCell.prototype.onTabKeyDown = function (event) {
        if (this.gridOptionsWrapper.isSuppressTabbing()) {
            return;
        }
        this.rowRenderer.onTabKeyDown(this, event);
    };
    RenderedCell.prototype.onBackspaceOrDeleteKeyPressed = function (key) {
        if (!this.editingCell) {
            this.startRowOrCellEdit(key);
        }
    };
    RenderedCell.prototype.onSpaceKeyPressed = function (event) {
        if (!this.editingCell && this.gridOptionsWrapper.isRowSelection()) {
            var selected = this.node.isSelected();
            this.node.setSelected(!selected);
        }
        // prevent default as space key, by default, moves browser scroll down
        event.preventDefault();
    };
    RenderedCell.prototype.onNavigationKeyPressed = function (event, key) {
        if (this.editingCell) {
            this.stopRowOrCellEdit();
        }
        this.rowRenderer.navigateToNextCell(event, key, this.gridCell.rowIndex, this.column, this.node.floating);
        // if we don't prevent default, the grid will scroll with the navigation keys
        event.preventDefault();
    };
    RenderedCell.prototype.onKeyPress = function (event) {
        // check this, in case focus is on a (for example) a text field inside the cell,
        // in which cse we should not be listening for these key pressed
        var eventTarget = utils_1.Utils.getTarget(event);
        var eventOnChildComponent = eventTarget !== this.getGui();
        if (eventOnChildComponent) {
            return;
        }
        if (!this.editingCell) {
            var pressedChar = String.fromCharCode(event.charCode);
            if (pressedChar === ' ') {
                this.onSpaceKeyPressed(event);
            }
            else {
                if (RenderedCell.PRINTABLE_CHARACTERS.indexOf(pressedChar) >= 0) {
                    this.startRowOrCellEdit(null, pressedChar);
                    // if we don't prevent default, then the keypress also gets applied to the text field
                    // (at least when doing the default editor), but we need to allow the editor to decide
                    // what it wants to do. we only do this IF editing was started - otherwise it messes
                    // up when the use is not doing editing, but using rendering with text fields in cellRenderer
                    // (as it would block the the user from typing into text fields).
                    event.preventDefault();
                }
            }
        }
    };
    RenderedCell.prototype.onKeyDown = function (event) {
        var key = event.which || event.keyCode;
        switch (key) {
            case constants_1.Constants.KEY_ENTER:
                this.onEnterKeyDown();
                break;
            case constants_1.Constants.KEY_F2:
                this.onF2KeyDown();
                break;
            case constants_1.Constants.KEY_ESCAPE:
                this.onEscapeKeyDown();
                break;
            case constants_1.Constants.KEY_TAB:
                this.onTabKeyDown(event);
                break;
            case constants_1.Constants.KEY_BACKSPACE:
            case constants_1.Constants.KEY_DELETE:
                this.onBackspaceOrDeleteKeyPressed(key);
                break;
            case constants_1.Constants.KEY_DOWN:
            case constants_1.Constants.KEY_UP:
            case constants_1.Constants.KEY_RIGHT:
            case constants_1.Constants.KEY_LEFT:
                this.onNavigationKeyPressed(event, key);
                break;
        }
    };
    RenderedCell.prototype.createCellEditorParams = function (keyPress, charPress, cellStartedEdit) {
        var params = {
            value: this.getValue(),
            keyPress: keyPress,
            charPress: charPress,
            column: this.column,
            rowIndex: this.gridCell.rowIndex,
            node: this.node,
            api: this.gridOptionsWrapper.getApi(),
            cellStartedEdit: cellStartedEdit,
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext(),
            $scope: this.scope,
            onKeyDown: this.onKeyDown.bind(this),
            stopEditing: this.stopEditingAndFocus.bind(this),
            eGridCell: this.eGridCell
        };
        var colDef = this.column.getColDef();
        if (colDef.cellEditorParams) {
            utils_1.Utils.assign(params, colDef.cellEditorParams);
        }
        return params;
    };
    RenderedCell.prototype.createCellEditor = function (keyPress, charPress, cellStartedEdit) {
        var params = this.createCellEditorParams(keyPress, charPress, cellStartedEdit);
        var cellEditor = this.cellEditorFactory.createCellEditor(this.column.getCellEditor(), params);
        return cellEditor;
    };
    // cell editors call this, when they want to stop for reasons other
    // than what we pick up on. eg selecting from a dropdown ends editing.
    RenderedCell.prototype.stopEditingAndFocus = function () {
        this.stopRowOrCellEdit();
        this.focusCell(true);
    };
    // called by rowRenderer when user navigates via tab key
    RenderedCell.prototype.startRowOrCellEdit = function (keyPress, charPress) {
        if (this.gridOptionsWrapper.isFullRowEdit()) {
            this.renderedRow.startRowEditing(keyPress, charPress, this);
        }
        else {
            this.startEditingIfEnabled(keyPress, charPress, true);
        }
    };
    // either called internally if single cell editing, or called by rowRenderer if row editing
    RenderedCell.prototype.startEditingIfEnabled = function (keyPress, charPress, cellStartedEdit) {
        if (keyPress === void 0) { keyPress = null; }
        if (charPress === void 0) { charPress = null; }
        if (cellStartedEdit === void 0) { cellStartedEdit = false; }
        // don't do it if not editable
        if (!this.isCellEditable()) {
            return;
        }
        // don't do it if already editing
        if (this.editingCell) {
            return;
        }
        var cellEditor = this.createCellEditor(keyPress, charPress, cellStartedEdit);
        if (cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart()) {
            if (cellEditor.destroy) {
                cellEditor.destroy();
            }
            return false;
        }
        if (!cellEditor.getGui) {
            console.warn("ag-Grid: cellEditor for column " + this.column.getId() + " is missing getGui() method");
            // no getGui, for React guys, see if they attached a react component directly
            if (cellEditor.render) {
                console.warn("ag-Grid: we found 'render' on the component, are you trying to set a React renderer but added it as colDef.cellEditor instead of colDef.cellEditorFmk?");
            }
            return false;
        }
        this.cellEditor = cellEditor;
        this.editingCell = true;
        this.cellEditorInPopup = this.cellEditor.isPopup && this.cellEditor.isPopup();
        this.setInlineEditingClass();
        if (this.cellEditorInPopup) {
            this.addPopupCellEditor();
        }
        else {
            this.addInCellEditor();
        }
        if (cellEditor.afterGuiAttached) {
            cellEditor.afterGuiAttached();
        }
        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_EDITING_STARTED, this.createParams());
        return true;
    };
    RenderedCell.prototype.addInCellEditor = function () {
        utils_1.Utils.removeAllChildren(this.eGridCell);
        this.eGridCell.appendChild(this.cellEditor.getGui());
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            this.$compile(this.eGridCell)(this.scope);
        }
    };
    RenderedCell.prototype.addPopupCellEditor = function () {
        var _this = this;
        var ePopupGui = this.cellEditor.getGui();
        this.hideEditorPopup = this.popupService.addAsModalPopup(ePopupGui, true, 
        // callback for when popup disappears
        function () {
            _this.onPopupEditorClosed();
        });
        this.popupService.positionPopupOverComponent({
            eventSource: this.eGridCell,
            ePopup: ePopupGui,
            keepWithinBounds: true
        });
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            this.$compile(ePopupGui)(this.scope);
        }
    };
    RenderedCell.prototype.focusCell = function (forceBrowserFocus) {
        if (forceBrowserFocus === void 0) { forceBrowserFocus = false; }
        this.focusedCellController.setFocusedCell(this.gridCell.rowIndex, this.column, this.node.floating, forceBrowserFocus);
    };
    // pass in 'true' to cancel the editing.
    RenderedCell.prototype.stopRowOrCellEdit = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        if (this.gridOptionsWrapper.isFullRowEdit()) {
            this.renderedRow.stopRowEditing(cancel);
        }
        else {
            this.stopEditing(cancel);
        }
    };
    RenderedCell.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        if (!this.editingCell) {
            return;
        }
        this.editingCell = false;
        if (!cancel) {
            // also have another option here to cancel after editing, so for example user could have a popup editor and
            // it is closed by user clicking outside the editor. then the editor will close automatically (with false
            // passed above) and we need to see if the editor wants to accept the new value.
            var userWantsToCancel = this.cellEditor.isCancelAfterEnd && this.cellEditor.isCancelAfterEnd();
            if (!userWantsToCancel) {
                var newValue = this.cellEditor.getValue();
                this.valueService.setValue(this.node, this.column, newValue);
                this.value = this.getValue();
            }
        }
        if (this.cellEditor.destroy) {
            this.cellEditor.destroy();
        }
        if (this.cellEditorInPopup) {
            this.hideEditorPopup();
            this.hideEditorPopup = null;
        }
        else {
            utils_1.Utils.removeAllChildren(this.eGridCell);
            // put the cell back the way it was before editing
            if (this.usingWrapper) {
                // if wrapper, then put the wrapper back
                this.eGridCell.appendChild(this.eCellWrapper);
            }
            else {
                // if cellRenderer, then put the gui back in. if the renderer has
                // a refresh, it will be called. however if it doesn't, then later
                // the renderer will be destroyed and a new one will be created.
                if (this.cellRenderer) {
                    this.eGridCell.appendChild(this.cellRenderer.getGui());
                }
            }
        }
        this.setInlineEditingClass();
        this.refreshCell();
        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_EDITING_STOPPED, this.createParams());
    };
    RenderedCell.prototype.createParams = function () {
        var params = {
            node: this.node,
            data: this.node.data,
            value: this.value,
            rowIndex: this.gridCell.rowIndex,
            column: this.column,
            colDef: this.column.getColDef(),
            $scope: this.scope,
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridApi,
            columnApi: this.columnApi
        };
        return params;
    };
    RenderedCell.prototype.createEvent = function (event) {
        var agEvent = this.createParams();
        agEvent.event = event;
        return agEvent;
    };
    RenderedCell.prototype.getRenderedRow = function () {
        return this.renderedRow;
    };
    RenderedCell.prototype.isSuppressNavigable = function () {
        return this.column.isSuppressNavigable(this.node);
    };
    RenderedCell.prototype.isCellEditable = function () {
        // only allow editing of groups if the user has this option enabled
        if (this.node.group && !this.gridOptionsWrapper.isEnableGroupEdit()) {
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
                this.onCellDoubleClicked(mouseEvent);
                break;
            case 'contextmenu':
                this.onContextMenu(mouseEvent);
                break;
            case 'mouseout':
                this.onMouseOut(mouseEvent);
                break;
            case 'mouseover':
                this.onMouseOver(mouseEvent);
                break;
        }
    };
    RenderedCell.prototype.onMouseOut = function (mouseEvent) {
        var agEvent = this.createEvent(mouseEvent);
        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_MOUSE_OUT, agEvent);
    };
    RenderedCell.prototype.onMouseOver = function (mouseEvent) {
        var agEvent = this.createEvent(mouseEvent);
        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_MOUSE_OVER, agEvent);
    };
    RenderedCell.prototype.onContextMenu = function (mouseEvent) {
        // to allow us to debug in chrome, we ignore the event if ctrl is pressed.
        // not everyone wants this, so first 'if' below allows to turn this hack off.
        if (!this.gridOptionsWrapper.isAllowContextMenuWithControlKey()) {
            // then do the check
            if (mouseEvent.ctrlKey || mouseEvent.metaKey) {
                return;
            }
        }
        var colDef = this.column.getColDef();
        var agEvent = this.createEvent(mouseEvent);
        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_CONTEXT_MENU, agEvent);
        if (colDef.onCellContextMenu) {
            colDef.onCellContextMenu(agEvent);
        }
        if (this.contextMenuFactory && !this.gridOptionsWrapper.isSuppressContextMenu()) {
            this.contextMenuFactory.showMenu(this.node, this.column, this.value, mouseEvent);
            mouseEvent.preventDefault();
        }
    };
    RenderedCell.prototype.onCellDoubleClicked = function (mouseEvent) {
        var colDef = this.column.getColDef();
        // always dispatch event to eventService
        var agEvent = this.createEvent(mouseEvent);
        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_DOUBLE_CLICKED, agEvent);
        // check if colDef also wants to handle event
        if (typeof colDef.onCellDoubleClicked === 'function') {
            colDef.onCellDoubleClicked(agEvent);
        }
        var editOnDoubleClick = !this.gridOptionsWrapper.isSingleClickEdit()
            && !this.gridOptionsWrapper.isSuppressClickEdit();
        if (editOnDoubleClick) {
            this.startRowOrCellEdit();
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
            var thisCell = this.gridCell;
            var cellAlreadyInRange = this.rangeController.isCellInAnyRange(thisCell);
            if (!cellAlreadyInRange) {
                this.rangeController.setRangeToCell(thisCell);
            }
        }
    };
    RenderedCell.prototype.onCellClicked = function (mouseEvent) {
        var agEvent = this.createEvent(mouseEvent);
        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_CLICKED, agEvent);
        var colDef = this.column.getColDef();
        if (colDef.onCellClicked) {
            colDef.onCellClicked(agEvent);
        }
        var editOnSingleClick = this.gridOptionsWrapper.isSingleClickEdit()
            && !this.gridOptionsWrapper.isSuppressClickEdit();
        if (editOnSingleClick) {
            this.startRowOrCellEdit();
        }
        this.doIeFocusHack();
    };
    // https://ag-grid.com/forum/showthread.php?tid=4362
    // when in IE or Edge, when you are editing a cell, then click on another cell,
    // the other cell doesn't keep focus, so navigation keys, type to start edit etc
    // don't work. appears that when you update the dom in IE it looses focus
    RenderedCell.prototype.doIeFocusHack = function () {
        if (utils_1.Utils.isBrowserIE() || utils_1.Utils.isBrowserEdge()) {
            if (utils_1.Utils.missing(document.activeElement) || document.activeElement === document.body) {
                // console.log('missing focus');
                this.getGui().focus();
            }
        }
    };
    // if we are editing inline, then we don't have the padding in the cell (set in the themes)
    // to allow the text editor full access to the entire cell
    RenderedCell.prototype.setInlineEditingClass = function () {
        var editingInline = this.editingCell && !this.cellEditorInPopup;
        utils_1.Utils.addOrRemoveCssClass(this.eGridCell, 'ag-cell-inline-editing', editingInline);
        utils_1.Utils.addOrRemoveCssClass(this.eGridCell, 'ag-cell-not-inline-editing', !editingInline);
    };
    RenderedCell.prototype.populateCell = function () {
        // populate
        this.putDataIntoCell();
        // style
        this.addStylesFromColDef();
        this.addClassesFromColDef();
        this.addClassesFromRules();
    };
    RenderedCell.prototype.addStylesFromColDef = function () {
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
    RenderedCell.prototype.addClassesFromColDef = function () {
        var _this = this;
        this.stylingService.processStaticCellClasses(this.column.getColDef(), {
            value: this.value,
            data: this.node.data,
            node: this.node,
            colDef: this.column.getColDef(),
            rowIndex: this.gridCell.rowIndex,
            $scope: this.scope,
            api: this.gridOptionsWrapper.getApi(),
            context: this.gridOptionsWrapper.getContext()
        }, function (className) {
            utils_1.Utils.addCssClass(_this.eGridCell, className);
        });
    };
    RenderedCell.prototype.createParentOfValue = function () {
        if (this.usingWrapper) {
            this.eCellWrapper = document.createElement('span');
            utils_1.Utils.addCssClass(this.eCellWrapper, 'ag-cell-wrapper');
            this.eGridCell.appendChild(this.eCellWrapper);
            var cbSelectionComponent = new checkboxSelectionComponent_1.CheckboxSelectionComponent();
            this.context.wireBean(cbSelectionComponent);
            var visibleFunc = this.column.getColDef().checkboxSelection;
            visibleFunc = typeof visibleFunc === 'function' ? visibleFunc : null;
            cbSelectionComponent.init({ rowNode: this.node, column: this.column, visibleFunc: visibleFunc });
            this.addDestroyFunc(function () { return cbSelectionComponent.destroy(); });
            // eventually we call eSpanWithValue.innerHTML = xxx, so cannot include the checkbox (above) in this span
            this.eSpanWithValue = document.createElement('span');
            utils_1.Utils.addCssClass(this.eSpanWithValue, 'ag-cell-value');
            this.eCellWrapper.appendChild(cbSelectionComponent.getGui());
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
    RenderedCell.prototype.refreshCell = function (animate, newData) {
        if (animate === void 0) { animate = false; }
        if (newData === void 0) { newData = false; }
        this.value = this.getValue();
        var refreshFailed = false;
        var that = this;
        // if it's 'new data', then we don't refresh the cellRenderer, even if refresh method is available.
        // this is because if the whole data is new (ie we are showing stock price 'BBA' now and not 'SSD')
        // then we are not showing a movement in the stock price, rather we are showing different stock.
        var attemptRefresh = !newData && this.cellRenderer && this.cellRenderer.refresh;
        if (attemptRefresh) {
            try {
                doRefresh();
            }
            catch (e) {
                if (e instanceof methodNotImplementedException_1.MethodNotImplementedException) {
                    refreshFailed = true;
                }
                else {
                    throw e;
                }
            }
        }
        // we do the replace if not doing refresh, or if refresh was unsuccessful.
        // the refresh can be unsuccessful if we are using a framework (eg ng2 or react) and the framework
        // wrapper has the refresh method, but the underlying component doesn't
        if (!attemptRefresh || refreshFailed) {
            doReplace();
        }
        if (animate) {
            this.animateCellWithDataChanged();
        }
        // need to check rules. note, we ignore colDef classes and styles, these are assumed to be static
        this.addClassesFromRules();
        function doRefresh() {
            // if the cell renderer has a refresh method, we call this instead of doing a refresh
            // note: should pass in params here instead of value?? so that client has formattedValue
            var valueFormatted = that.formatValue(that.value);
            var cellRendererParams = that.column.getColDef().cellRendererParams;
            var params = that.createRendererAndRefreshParams(valueFormatted, cellRendererParams);
            that.cellRenderer.refresh(params);
        }
        function doReplace() {
            // otherwise we rip out the cell and replace it
            utils_1.Utils.removeAllChildren(that.eParentOfValue);
            // remove old renderer component if it exists
            if (that.cellRenderer && that.cellRenderer.destroy) {
                that.cellRenderer.destroy();
            }
            that.cellRenderer = null;
            that.populateCell();
            // if angular compiling, then need to also compile the cell again (angular compiling sucks, please wait...)
            if (that.gridOptionsWrapper.isAngularCompileRows()) {
                that.$compile(that.eGridCell)(that.scope);
            }
        }
    };
    RenderedCell.prototype.addClassesFromRules = function () {
        var _this = this;
        this.stylingService.processCellClassRules(this.column.getColDef(), {
            value: this.value,
            data: this.node.data,
            node: this.node,
            colDef: this.column.getColDef(),
            rowIndex: this.gridCell.rowIndex,
            api: this.gridOptionsWrapper.getApi(),
            context: this.gridOptionsWrapper.getContext()
        }, function (className) {
            utils_1.Utils.addCssClass(_this.eGridCell, className);
        }, function (className) {
            utils_1.Utils.removeCssClass(_this.eGridCell, className);
        });
    };
    RenderedCell.prototype.putDataIntoCell = function () {
        // template gets preference, then cellRenderer, then do it ourselves
        var colDef = this.column.getColDef();
        var cellRenderer = this.column.getCellRenderer();
        var floatingCellRenderer = this.column.getFloatingCellRenderer();
        var valueFormatted = this.valueFormatterService.formatValue(this.column, this.node, this.scope, this.gridCell.rowIndex, this.value);
        if (colDef.template) {
            // template is really only used for angular 1 - as people using ng1 are used to providing templates with
            // bindings in it. in ng2, people will hopefully want to provide components, not templates.
            this.eParentOfValue.innerHTML = colDef.template;
        }
        else if (colDef.templateUrl) {
            // likewise for templateUrl - it's for ng1 really - when we move away from ng1, we can take these out.
            // niall was pro angular 1 when writing template and templateUrl, if writing from scratch now, would
            // not do these, but would follow a pattern that was friendly towards components, not templates.
            var template = this.templateService.getTemplate(colDef.templateUrl, this.refreshCell.bind(this, true));
            if (template) {
                this.eParentOfValue.innerHTML = template;
            }
            // use cell renderer if it exists
        }
        else if (floatingCellRenderer && this.node.floating) {
            // if floating, then give preference to floating cell renderer
            this.useCellRenderer(floatingCellRenderer, colDef.floatingCellRendererParams, valueFormatted);
        }
        else if (cellRenderer) {
            // use normal cell renderer
            this.useCellRenderer(cellRenderer, colDef.cellRendererParams, valueFormatted);
        }
        else {
            // if we insert undefined, then it displays as the string 'undefined', ugly!
            var valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            var valueToRender = valueFormattedExits ? valueFormatted : this.value;
            if (utils_1.Utils.exists(valueToRender) && valueToRender !== '') {
                // not using innerHTML to prevent injection of HTML
                // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#Security_considerations
                this.eParentOfValue.textContent = valueToRender.toString();
            }
        }
        if (colDef.tooltipField) {
            var data = this.getDataForRow();
            if (utils_1.Utils.exists(data)) {
                var tooltip = utils_1.Utils.getValueUsingField(data, colDef.tooltipField, this.column.isTooltipFieldContainsDots());
                if (utils_1.Utils.exists(tooltip)) {
                    this.eParentOfValue.setAttribute('title', tooltip);
                }
            }
        }
    };
    RenderedCell.prototype.formatValue = function (value) {
        return this.valueFormatterService.formatValue(this.column, this.node, this.scope, this.gridCell.rowIndex, value);
    };
    RenderedCell.prototype.createRendererAndRefreshParams = function (valueFormatted, cellRendererParams) {
        var params = {
            value: this.value,
            valueFormatted: valueFormatted,
            valueGetter: this.getValue,
            formatValue: this.formatValue.bind(this),
            data: this.node.data,
            node: this.node,
            colDef: this.column.getColDef(),
            column: this.column,
            $scope: this.scope,
            rowIndex: this.gridCell.rowIndex,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext(),
            refreshCell: this.refreshCell.bind(this),
            eGridCell: this.eGridCell,
            eParentOfValue: this.eParentOfValue,
            addRenderedRowListener: this.renderedRow.addEventListener.bind(this.renderedRow)
        };
        if (cellRendererParams) {
            utils_1.Utils.assign(params, cellRendererParams);
        }
        return params;
    };
    RenderedCell.prototype.useCellRenderer = function (cellRendererKey, cellRendererParams, valueFormatted) {
        var params = this.createRendererAndRefreshParams(valueFormatted, cellRendererParams);
        this.cellRenderer = this.cellRendererService.useCellRenderer(cellRendererKey, this.eParentOfValue, params);
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
    return RenderedCell;
}(component_1.Component));
RenderedCell.PRINTABLE_CHARACTERS = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890!"£$%^&*()_+-=[];\'#,./\|<>?:@~{}';
__decorate([
    context_1.Autowired('context'),
    __metadata("design:type", context_1.Context)
], RenderedCell.prototype, "context", void 0);
__decorate([
    context_1.Autowired('columnApi'),
    __metadata("design:type", columnController_1.ColumnApi)
], RenderedCell.prototype, "columnApi", void 0);
__decorate([
    context_1.Autowired('gridApi'),
    __metadata("design:type", gridApi_1.GridApi)
], RenderedCell.prototype, "gridApi", void 0);
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], RenderedCell.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('expressionService'),
    __metadata("design:type", expressionService_1.ExpressionService)
], RenderedCell.prototype, "expressionService", void 0);
__decorate([
    context_1.Autowired('rowRenderer'),
    __metadata("design:type", rowRenderer_1.RowRenderer)
], RenderedCell.prototype, "rowRenderer", void 0);
__decorate([
    context_1.Autowired('$compile'),
    __metadata("design:type", Object)
], RenderedCell.prototype, "$compile", void 0);
__decorate([
    context_1.Autowired('templateService'),
    __metadata("design:type", templateService_1.TemplateService)
], RenderedCell.prototype, "templateService", void 0);
__decorate([
    context_1.Autowired('valueService'),
    __metadata("design:type", valueService_1.ValueService)
], RenderedCell.prototype, "valueService", void 0);
__decorate([
    context_1.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], RenderedCell.prototype, "eventService", void 0);
__decorate([
    context_1.Autowired('columnController'),
    __metadata("design:type", columnController_1.ColumnController)
], RenderedCell.prototype, "columnController", void 0);
__decorate([
    context_1.Autowired('columnAnimationService'),
    __metadata("design:type", columnAnimationService_1.ColumnAnimationService)
], RenderedCell.prototype, "columnAnimationService", void 0);
__decorate([
    context_1.Optional('rangeController'),
    __metadata("design:type", Object)
], RenderedCell.prototype, "rangeController", void 0);
__decorate([
    context_1.Autowired('focusedCellController'),
    __metadata("design:type", focusedCellController_1.FocusedCellController)
], RenderedCell.prototype, "focusedCellController", void 0);
__decorate([
    context_1.Optional('contextMenuFactory'),
    __metadata("design:type", Object)
], RenderedCell.prototype, "contextMenuFactory", void 0);
__decorate([
    context_1.Autowired('focusService'),
    __metadata("design:type", focusService_1.FocusService)
], RenderedCell.prototype, "focusService", void 0);
__decorate([
    context_1.Autowired('cellEditorFactory'),
    __metadata("design:type", cellEditorFactory_1.CellEditorFactory)
], RenderedCell.prototype, "cellEditorFactory", void 0);
__decorate([
    context_1.Autowired('cellRendererFactory'),
    __metadata("design:type", cellRendererFactory_1.CellRendererFactory)
], RenderedCell.prototype, "cellRendererFactory", void 0);
__decorate([
    context_1.Autowired('popupService'),
    __metadata("design:type", popupService_1.PopupService)
], RenderedCell.prototype, "popupService", void 0);
__decorate([
    context_1.Autowired('cellRendererService'),
    __metadata("design:type", cellRendererService_1.CellRendererService)
], RenderedCell.prototype, "cellRendererService", void 0);
__decorate([
    context_1.Autowired('valueFormatterService'),
    __metadata("design:type", valueFormatterService_1.ValueFormatterService)
], RenderedCell.prototype, "valueFormatterService", void 0);
__decorate([
    context_1.Autowired('stylingService'),
    __metadata("design:type", stylingService_1.StylingService)
], RenderedCell.prototype, "stylingService", void 0);
__decorate([
    context_1.Autowired('columnHoverService'),
    __metadata("design:type", columnHoverService_1.ColumnHoverService)
], RenderedCell.prototype, "columnHoverService", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RenderedCell.prototype, "init", null);
exports.RenderedCell = RenderedCell;
