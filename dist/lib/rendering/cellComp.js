/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v12.0.2
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
var expressionService_1 = require("../valueService/expressionService");
var rowRenderer_1 = require("./rowRenderer");
var templateService_1 = require("../templateService");
var columnController_1 = require("../columnController/columnController");
var valueService_1 = require("../valueService/valueService");
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
var stylingService_1 = require("../styling/stylingService");
var columnHoverService_1 = require("./columnHoverService");
var columnAnimationService_1 = require("./columnAnimationService");
var CellComp = (function (_super) {
    __extends(CellComp, _super);
    function CellComp(column, node, scope, renderedRow) {
        var _this = _super.call(this, '<div role="gridcell"/>') || this;
        // how many ranges this cell is in, depends what color to mark this cell
        _this.rangeCount = 0;
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
        _this.rowComp = renderedRow;
        return _this;
    }
    CellComp.prototype.createGridCell = function () {
        var gridCellDef = {
            rowIndex: this.node.rowIndex,
            floating: this.node.rowPinned,
            column: this.column
        };
        this.gridCell = new gridCell_1.GridCell(gridCellDef);
    };
    CellComp.prototype.addIndexChangeListener = function () {
        this.addDestroyableEventListener(this.node, rowNode_1.RowNode.EVENT_ROW_INDEX_CHANGED, this.onRowIndexChanged.bind(this));
    };
    CellComp.prototype.onRowIndexChanged = function () {
        // when index changes, this influences items that need the index, so we update the
        // grid cell so they are working off the new index.
        this.createGridCell();
        // when the index of the row changes, ie means the cell may have lost of gained focus
        this.checkCellFocused();
        // check range selection
        this.onRangeSelectionChanged();
    };
    CellComp.prototype.getGridCell = function () {
        return this.gridCell;
    };
    CellComp.prototype.setFocusInOnEditor = function () {
        if (this.editingCell && this.cellEditor && this.cellEditor.focusIn) {
            this.cellEditor.focusIn();
        }
    };
    CellComp.prototype.setFocusOutOnEditor = function () {
        if (this.editingCell && this.cellEditor && this.cellEditor.focusOut) {
            this.cellEditor.focusOut();
        }
    };
    CellComp.prototype.destroy = function () {
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
    CellComp.prototype.setPinnedClasses = function () {
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
    CellComp.prototype.getParentRow = function () {
        return this.eParentRow;
    };
    CellComp.prototype.setParentRow = function (eParentRow) {
        this.eParentRow = eParentRow;
    };
    CellComp.prototype.setupCheckboxSelection = function () {
        // if boolean set, then just use it
        var colDef = this.column.getColDef();
        // never allow selection on pinned rows
        if (this.node.rowPinned) {
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
    CellComp.prototype.getColumn = function () {
        return this.column;
    };
    CellComp.prototype.getValue = function () {
        var isOpenGroup = this.node.group && this.node.expanded && !this.node.footer;
        if (isOpenGroup && this.gridOptionsWrapper.isGroupIncludeFooter()) {
            // if doing grouping and footers, we don't want to include the agg value
            // in the header when the group is open
            return this.valueService.getValue(this.column, this.node, true);
        }
        else {
            return this.valueService.getValue(this.column, this.node);
        }
    };
    CellComp.prototype.addRangeSelectedListener = function () {
        if (!this.rangeController) {
            return;
        }
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_RANGE_SELECTION_CHANGED, this.onRangeSelectionChanged.bind(this));
        this.onRangeSelectionChanged();
    };
    CellComp.prototype.onRangeSelectionChanged = function () {
        var usingAgGridFree = !this.rangeController;
        if (usingAgGridFree) {
            return;
        }
        var newRangeCount = this.rangeController.getCellRangeCount(this.gridCell);
        if (this.rangeCount !== newRangeCount) {
            utils_1.Utils.addOrRemoveCssClass(this.eGridCell, 'ag-cell-range-selected', newRangeCount !== 0);
            utils_1.Utils.addOrRemoveCssClass(this.eGridCell, 'ag-cell-range-selected-1', newRangeCount === 1);
            utils_1.Utils.addOrRemoveCssClass(this.eGridCell, 'ag-cell-range-selected-2', newRangeCount === 2);
            utils_1.Utils.addOrRemoveCssClass(this.eGridCell, 'ag-cell-range-selected-3', newRangeCount === 3);
            utils_1.Utils.addOrRemoveCssClass(this.eGridCell, 'ag-cell-range-selected-4', newRangeCount >= 4);
            this.rangeCount = newRangeCount;
        }
    };
    CellComp.prototype.addHighlightListener = function () {
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
    CellComp.prototype.addChangeListener = function () {
        var _this = this;
        var cellChangeListener = function (event) {
            if (event.column === _this.column) {
                _this.refreshCell({});
            }
        };
        this.addDestroyableEventListener(this.node, rowNode_1.RowNode.EVENT_CELL_CHANGED, cellChangeListener);
    };
    CellComp.prototype.animateCellWithHighlight = function () {
        this.animateCell('highlight');
    };
    CellComp.prototype.animateCell = function (cssName) {
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
    CellComp.prototype.addCellFocusedListener = function () {
        var _this = this;
        var cellFocusedListener = this.checkCellFocused.bind(this);
        this.eventService.addEventListener(events_1.Events.EVENT_CELL_FOCUSED, cellFocusedListener);
        this.addDestroyFunc(function () {
            _this.eventService.removeEventListener(events_1.Events.EVENT_CELL_FOCUSED, cellFocusedListener);
        });
        cellFocusedListener();
    };
    CellComp.prototype.checkCellFocused = function (event) {
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
    CellComp.prototype.getCellWidth = function () {
        if (this.colsSpanning) {
            var result_1 = 0;
            this.colsSpanning.forEach(function (col) { return result_1 += col.getActualWidth(); });
            return result_1;
        }
        else {
            return this.column.getActualWidth();
        }
    };
    CellComp.prototype.setWidthOnCell = function () {
        var _this = this;
        var widthChangedListener = function () {
            _this.eGridCell.style.width = _this.getCellWidth() + "px";
        };
        this.column.addEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
        this.addDestroyFunc(function () {
            _this.column.removeEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
        });
        widthChangedListener();
    };
    CellComp.prototype.init = function () {
        this.value = this.getValue();
        this.setupColSpan();
        this.createGridCell();
        this.addIndexChangeListener();
        this.setupCheckboxSelection();
        this.setWidthOnCell();
        this.setPinnedClasses();
        this.addRangeSelectedListener();
        this.addHighlightListener();
        this.addChangeListener();
        this.addCellFocusedListener();
        this.addColumnHoverListener();
        this.addDomData();
        this.setLeftFeature = new setLeftFeature_1.SetLeftFeature(this.column, this.eGridCell, this.colsSpanning);
        this.addFeature(this.context, this.setLeftFeature);
        // this.addSuppressShortcutKeyListenersWhileEditing();
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
    CellComp.prototype.setupColSpan = function () {
        // if no cols span is active, then we don't set it up, as it would be wasteful of CPU
        if (utils_1.Utils.missing(this.column.getColDef().colSpan)) {
            return;
        }
        // because we are col spanning, a reorder of the cols can change what cols we are spanning over
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.checkColSpan.bind(this));
        // because we are spanning over multiple cols, we check for width any time any cols width changes.
        // this is expensive - really we should be explicitly checking only the cols we are spanning over
        // instead of every col, however it would be tricky code to track the cols we are spanning over, so
        // because hardly anyone will be using colSpan, am favoring this easier way for more maintainable code.
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.setWidthOnCell.bind(this));
        this.checkColSpan();
    };
    CellComp.prototype.checkColSpan = function () {
        var colSpan = this.column.getColSpan(this.node);
        var colsSpanning = [];
        // if just one col, the col span is just the column we are in
        if (colSpan === 1) {
            colsSpanning.push(this.column);
        }
        else {
            var pointer = this.column;
            var pinned = this.column.getPinned();
            for (var i = 0; i < colSpan; i++) {
                colsSpanning.push(pointer);
                pointer = this.columnController.getDisplayedColAfter(pointer);
                if (utils_1.Utils.missing(pointer)) {
                    break;
                }
                // we do not allow col spanning to span outside of pinned areas
                if (pinned !== pointer.getPinned()) {
                    break;
                }
            }
        }
        this.setColsSpanning(colsSpanning);
    };
    CellComp.prototype.setColsSpanning = function (colsSpanning) {
        if (!utils_1.Utils.compareArrays(this.colsSpanning, colsSpanning)) {
            this.colsSpanning = colsSpanning;
            this.setWidthOnCell();
            if (this.setLeftFeature) {
                this.setLeftFeature.setColsSpanning(colsSpanning);
            }
        }
    };
    CellComp.prototype.addColumnHoverListener = function () {
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_COLUMN_HOVER_CHANGED, this.onColumnHover.bind(this));
        this.onColumnHover();
    };
    CellComp.prototype.onColumnHover = function () {
        var isHovered = this.columnHoverService.isHovered(this.column);
        utils_1.Utils.addOrRemoveCssClass(this.getGui(), 'ag-column-hover', isHovered);
    };
    CellComp.prototype.addDomData = function () {
        var _this = this;
        this.gridOptionsWrapper.setDomData(this.eGridCell, CellComp.DOM_DATA_KEY_CELL_COMP, this);
        this.addDestroyFunc(function () {
            return _this.gridOptionsWrapper.setDomData(_this.eGridCell, CellComp.DOM_DATA_KEY_CELL_COMP, null);
        });
    };
    CellComp.prototype.onEnterKeyDown = function () {
        if (this.editingCell) {
            this.stopRowOrCellEdit();
            this.focusCell(true);
        }
        else {
            this.startRowOrCellEdit(constants_1.Constants.KEY_ENTER);
        }
    };
    CellComp.prototype.onF2KeyDown = function () {
        if (!this.editingCell) {
            this.startRowOrCellEdit(constants_1.Constants.KEY_F2);
        }
    };
    CellComp.prototype.onEscapeKeyDown = function () {
        if (this.editingCell) {
            this.stopRowOrCellEdit(true);
            this.focusCell(true);
        }
    };
    CellComp.prototype.onPopupEditorClosed = function () {
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
    CellComp.prototype.isEditing = function () {
        return this.editingCell;
    };
    CellComp.prototype.onTabKeyDown = function (event) {
        if (this.gridOptionsWrapper.isSuppressTabbing()) {
            return;
        }
        this.rowRenderer.onTabKeyDown(this, event);
    };
    CellComp.prototype.onBackspaceOrDeleteKeyPressed = function (key) {
        if (!this.editingCell) {
            this.startRowOrCellEdit(key);
        }
    };
    CellComp.prototype.onSpaceKeyPressed = function (event) {
        if (!this.editingCell && this.gridOptionsWrapper.isRowSelection()) {
            var selected = this.node.isSelected();
            this.node.setSelected(!selected);
        }
        // prevent default as space key, by default, moves browser scroll down
        event.preventDefault();
    };
    CellComp.prototype.onNavigationKeyPressed = function (event, key) {
        if (this.editingCell) {
            this.stopRowOrCellEdit();
        }
        this.rowRenderer.navigateToNextCell(event, key, this.gridCell.rowIndex, this.column, this.node.rowPinned);
        // if we don't prevent default, the grid will scroll with the navigation keys
        event.preventDefault();
    };
    CellComp.prototype.onKeyPress = function (event) {
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
                if (utils_1.Utils.isEventFromPrintableCharacter(event)) {
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
    CellComp.prototype.onKeyDown = function (event) {
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
    CellComp.prototype.createCellEditorParams = function (keyPress, charPress, cellStartedEdit) {
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
    CellComp.prototype.createCellEditor = function (keyPress, charPress, cellStartedEdit) {
        var params = this.createCellEditorParams(keyPress, charPress, cellStartedEdit);
        var cellEditor = this.cellEditorFactory.createCellEditor(this.column.getCellEditor(), params);
        return cellEditor;
    };
    // cell editors call this, when they want to stop for reasons other
    // than what we pick up on. eg selecting from a dropdown ends editing.
    CellComp.prototype.stopEditingAndFocus = function () {
        this.stopRowOrCellEdit();
        this.focusCell(true);
    };
    // called by rowRenderer when user navigates via tab key
    CellComp.prototype.startRowOrCellEdit = function (keyPress, charPress) {
        if (this.gridOptionsWrapper.isFullRowEdit()) {
            this.rowComp.startRowEditing(keyPress, charPress, this);
        }
        else {
            this.startEditingIfEnabled(keyPress, charPress, true);
        }
    };
    // either called internally if single cell editing, or called by rowRenderer if row editing
    CellComp.prototype.startEditingIfEnabled = function (keyPress, charPress, cellStartedEdit) {
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
        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_EDITING_STARTED, this.createParamsWithValue());
        return true;
    };
    CellComp.prototype.addInCellEditor = function () {
        utils_1.Utils.removeAllChildren(this.eGridCell);
        this.eGridCell.appendChild(this.cellEditor.getGui());
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            this.$compile(this.eGridCell)(this.scope);
        }
    };
    CellComp.prototype.addPopupCellEditor = function () {
        var _this = this;
        var ePopupGui = this.cellEditor.getGui();
        this.hideEditorPopup = this.popupService.addAsModalPopup(ePopupGui, true, 
        // callback for when popup disappears
        function () {
            _this.onPopupEditorClosed();
        });
        this.popupService.positionPopupOverComponent({
            column: this.column,
            rowNode: this.node,
            type: 'popupCellEditor',
            eventSource: this.eGridCell,
            ePopup: ePopupGui,
            keepWithinBounds: true
        });
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            this.$compile(ePopupGui)(this.scope);
        }
    };
    CellComp.prototype.focusCell = function (forceBrowserFocus) {
        if (forceBrowserFocus === void 0) { forceBrowserFocus = false; }
        this.focusedCellController.setFocusedCell(this.gridCell.rowIndex, this.column, this.node.rowPinned, forceBrowserFocus);
    };
    // pass in 'true' to cancel the editing.
    CellComp.prototype.stopRowOrCellEdit = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        if (this.gridOptionsWrapper.isFullRowEdit()) {
            this.rowComp.stopRowEditing(cancel);
        }
        else {
            this.stopEditing(cancel);
        }
    };
    CellComp.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        if (!this.editingCell) {
            return;
        }
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
        // it is important we set this after setValue() above, as otherwise the cell will flash
        // when editing stops. the 'refresh' method checks editing, and doesn't refresh editing cells.
        // thus it will skip the refresh on this cell until the end of this method where we call
        // refresh directly and we suppress the flash.
        this.editingCell = false;
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
        // we suppress the flash, as it is not correct to flash the cell the user has finished editing,
        // the user doesn't need to flash as they were the one who did the edit, the flash is pointless
        // (as the flash is meant to draw the user to a change that they didn't manually do themselves).
        this.refreshCell({ forceRefresh: true, suppressFlash: true });
        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_EDITING_STOPPED, this.createParamsWithValue());
    };
    CellComp.prototype.createParamsWithValue = function () {
        var params = {
            node: this.node,
            data: this.node.data,
            value: this.value,
            column: this.column,
            colDef: this.column.getColDef(),
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridApi,
            columnApi: this.columnApi
        };
        params.$scope = this.scope;
        return params;
    };
    CellComp.prototype.createEvent = function (event) {
        var agEvent = this.createParamsWithValue();
        agEvent.event = event;
        return agEvent;
    };
    CellComp.prototype.getRenderedRow = function () {
        return this.rowComp;
    };
    CellComp.prototype.isSuppressNavigable = function () {
        return this.column.isSuppressNavigable(this.node);
    };
    CellComp.prototype.isCellEditable = function () {
        return this.column.isCellEditable(this.node);
    };
    CellComp.prototype.onMouseEvent = function (eventName, mouseEvent) {
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
    CellComp.prototype.onMouseOut = function (mouseEvent) {
        var agEvent = this.createEvent(mouseEvent);
        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_MOUSE_OUT, agEvent);
    };
    CellComp.prototype.onMouseOver = function (mouseEvent) {
        var agEvent = this.createEvent(mouseEvent);
        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_MOUSE_OVER, agEvent);
    };
    CellComp.prototype.onContextMenu = function (mouseEvent) {
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
    CellComp.prototype.onCellDoubleClicked = function (mouseEvent) {
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
    CellComp.prototype.onMouseDown = function () {
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
    CellComp.prototype.onCellClicked = function (mouseEvent) {
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
    CellComp.prototype.doIeFocusHack = function () {
        if (utils_1.Utils.isBrowserIE() || utils_1.Utils.isBrowserEdge()) {
            if (utils_1.Utils.missing(document.activeElement) || document.activeElement === document.body) {
                // console.log('missing focus');
                this.getGui().focus();
            }
        }
    };
    // if we are editing inline, then we don't have the padding in the cell (set in the themes)
    // to allow the text editor full access to the entire cell
    CellComp.prototype.setInlineEditingClass = function () {
        var editingInline = this.editingCell && !this.cellEditorInPopup;
        utils_1.Utils.addOrRemoveCssClass(this.eGridCell, 'ag-cell-inline-editing', editingInline);
        utils_1.Utils.addOrRemoveCssClass(this.eGridCell, 'ag-cell-not-inline-editing', !editingInline);
    };
    CellComp.prototype.populateCell = function () {
        // populate
        this.putDataIntoCell();
        // style
        this.addStylesFromColDef();
        this.addClassesFromColDef();
        this.addClassesFromRules();
    };
    CellComp.prototype.addStylesFromColDef = function () {
        var colDef = this.column.getColDef();
        if (colDef.cellStyle) {
            var cssToUse = void 0;
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
    CellComp.prototype.addClassesFromColDef = function () {
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
    CellComp.prototype.createParentOfValue = function () {
        if (this.usingWrapper) {
            this.eCellWrapper = document.createElement('span');
            utils_1.Utils.addCssClass(this.eCellWrapper, 'ag-cell-wrapper');
            this.eGridCell.appendChild(this.eCellWrapper);
            var cbSelectionComponent_1 = new checkboxSelectionComponent_1.CheckboxSelectionComponent();
            this.context.wireBean(cbSelectionComponent_1);
            var visibleFunc = this.column.getColDef().checkboxSelection;
            visibleFunc = typeof visibleFunc === 'function' ? visibleFunc : null;
            cbSelectionComponent_1.init({ rowNode: this.node, column: this.column, visibleFunc: visibleFunc });
            this.addDestroyFunc(function () { return cbSelectionComponent_1.destroy(); });
            // eventually we call eSpanWithValue.innerHTML = xxx, so cannot include the checkbox (above) in this span
            this.eSpanWithValue = document.createElement('span');
            utils_1.Utils.addCssClass(this.eSpanWithValue, 'ag-cell-value');
            this.eCellWrapper.appendChild(cbSelectionComponent_1.getGui());
            this.eCellWrapper.appendChild(this.eSpanWithValue);
            this.eParentOfValue = this.eSpanWithValue;
        }
        else {
            utils_1.Utils.addCssClass(this.eGridCell, 'ag-cell-value');
            this.eParentOfValue = this.eGridCell;
        }
    };
    CellComp.prototype.isVolatile = function () {
        return this.column.getColDef().volatile;
    };
    CellComp.prototype.attemptCellRendererRefresh = function () {
        if (utils_1.Utils.missing(this.cellRenderer) || utils_1.Utils.missing(this.cellRenderer.refresh)) {
            return false;
        }
        // if the cell renderer has a refresh method, we call this instead of doing a refresh
        // note: should pass in params here instead of value?? so that client has formattedValue
        var valueFormatted = this.formatValue(this.value);
        var cellRendererParams = this.column.getColDef().cellRendererParams;
        var params = this.createRendererAndRefreshParams(valueFormatted, cellRendererParams);
        var result = this.cellRenderer.refresh(params);
        if (result === false) {
            // if result from renderer is false
            return false;
        }
        else {
            // if result from renderer is true OR undefined
            return true;
        }
        // NOTE on undefined: previous version of the cellRenderer.refresh() interface
        // returned nothing, if the method existed, we assumed it refreshed. so for
        // backwards compatibility, we assume if method exists and returns nothing,
        // that it was successful.
    };
    CellComp.prototype.valuesAreEqual = function (val1, val2) {
        // if the user provided an equals method, use that, otherwise do simple comparison
        var colDef = this.column.getColDef();
        var equalsMethod = colDef ? colDef.equals : null;
        if (equalsMethod) {
            return equalsMethod(val1, val2);
        }
        else {
            return val1 === val2;
        }
    };
    // + stop editing {dontSkipRefresh: true}
    // + event cellChanged {}
    // + cellRenderer.params.refresh() {} -> method passes 'as is' to the cellRenderer, so params could be anything
    // + rowComp: event dataChanged {animate: update, newData: !update}
    // + rowComp: api refreshCells() {animate: true/false}
    // + rowRenderer: api softRefreshView() {}
    CellComp.prototype.refreshCell = function (params) {
        if (this.editingCell) {
            return;
        }
        var newData = params && params.newData;
        var suppressFlash = params && params.suppressFlash;
        var volatile = params && params.volatile;
        var forceRefresh = params && params.forceRefresh;
        // if only refreshing volatile cells, then skip the refresh if we are not volatile
        if (volatile && !this.isVolatile()) {
            return;
        }
        var oldValue = this.value;
        this.value = this.getValue();
        // for simple values only (not pojo's), see if the value is the same, and if it is, skip the refresh.
        // when never allow skipping after an edit, as after editing, we need to put the GUI back to the way
        // if was before the edit.
        var skipRefresh = !forceRefresh && this.valuesAreEqual(oldValue, this.value);
        if (skipRefresh) {
            return;
        }
        var cellRendererRefreshed;
        // if it's 'new data', then we don't refresh the cellRenderer, even if refresh method is available.
        // this is because if the whole data is new (ie we are showing stock price 'BBA' now and not 'SSD')
        // then we are not showing a movement in the stock price, rather we are showing different stock.
        if (newData || suppressFlash) {
            cellRendererRefreshed = false;
        }
        else {
            cellRendererRefreshed = this.attemptCellRendererRefresh();
        }
        // we do the replace if not doing refresh, or if refresh was unsuccessful.
        // the refresh can be unsuccessful if we are using a framework (eg ng2 or react) and the framework
        // wrapper has the refresh method, but the underlying component doesn't
        if (!cellRendererRefreshed) {
            this.replaceCellContent();
        }
        if (!suppressFlash) {
            this.flashCell();
        }
        // need to check rules. note, we ignore colDef classes and styles, these are assumed to be static
        this.addClassesFromRules();
    };
    CellComp.prototype.flashCell = function () {
        if (this.gridOptionsWrapper.isEnableCellChangeFlash() || this.column.getColDef().enableCellChangeFlash) {
            this.animateCell('data-changed');
        }
    };
    CellComp.prototype.replaceCellContent = function () {
        // otherwise we rip out the cell and replace it
        utils_1.Utils.removeAllChildren(this.eParentOfValue);
        // remove old renderer component if it exists
        if (this.cellRenderer && this.cellRenderer.destroy) {
            this.cellRenderer.destroy();
        }
        this.cellRenderer = null;
        this.populateCell();
        // if angular compiling, then need to also compile the cell again (angular compiling sucks, please wait...)
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            this.$compile(this.eGridCell)(this.scope);
        }
    };
    CellComp.prototype.addClassesFromRules = function () {
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
    CellComp.prototype.putDataIntoCell = function () {
        // template gets preference, then cellRenderer, then do it ourselves
        var colDef = this.column.getColDef();
        var cellRenderer = this.column.getCellRenderer();
        var floatingCellRenderer = this.column.getFloatingCellRenderer();
        var valueFormatted = this.valueFormatterService.formatValue(this.column, this.node, this.scope, this.value);
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
        else if (floatingCellRenderer && this.node.rowPinned) {
            // if floating, then give preference to floating cell renderer
            this.useCellRenderer(floatingCellRenderer, colDef.pinnedRowCellRendererParams, valueFormatted);
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
            var data = this.node.data;
            if (utils_1.Utils.exists(data)) {
                var tooltip = utils_1.Utils.getValueUsingField(data, colDef.tooltipField, this.column.isTooltipFieldContainsDots());
                if (utils_1.Utils.exists(tooltip)) {
                    this.eParentOfValue.setAttribute('title', tooltip);
                }
            }
        }
    };
    CellComp.prototype.formatValue = function (value) {
        return this.valueFormatterService.formatValue(this.column, this.node, this.scope, value);
    };
    CellComp.prototype.createRendererAndRefreshParams = function (valueFormatted, cellRendererParams) {
        var _this = this;
        var that = this;
        var params = {
            value: this.value,
            valueFormatted: valueFormatted,
            getValue: this.getValue.bind(this),
            setValue: function (value) { _this.valueService.setValue(_this.node, _this.column, value); },
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
            // these bits are not documented anywhere, so we could drop them?
            // it was in the olden days to allow user to register for when rendered
            // row was removed (the row comp was removed), however now that the user
            // can provide components for cells, the destroy method gets call when this
            // happens so no longer need to fire event.
            addRowCompListener: this.rowComp.addEventListener.bind(this.rowComp),
            addRenderedRowListener: function (eventType, listener) {
                console.warn('ag-Grid: since ag-Grid .v11, params.addRenderedRowListener() is now params.addRowCompListener()');
                that.rowComp.addEventListener(eventType, listener);
            }
        };
        if (cellRendererParams) {
            utils_1.Utils.assign(params, cellRendererParams);
        }
        return params;
    };
    CellComp.prototype.useCellRenderer = function (cellRendererKey, cellRendererParams, valueFormatted) {
        var params = this.createRendererAndRefreshParams(valueFormatted, cellRendererParams);
        this.cellRenderer = this.cellRendererService.useCellRenderer(cellRendererKey, this.eParentOfValue, params);
    };
    CellComp.prototype.addClasses = function () {
        utils_1.Utils.addCssClass(this.eGridCell, 'ag-cell');
        this.eGridCell.setAttribute("colId", this.column.getColId());
        if (this.node.group && this.node.footer) {
            utils_1.Utils.addCssClass(this.eGridCell, 'ag-footer-cell');
        }
        if (this.node.group && !this.node.footer) {
            utils_1.Utils.addCssClass(this.eGridCell, 'ag-group-cell');
        }
    };
    CellComp.DOM_DATA_KEY_CELL_COMP = 'cellComp';
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], CellComp.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnController_1.ColumnApi)
    ], CellComp.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], CellComp.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], CellComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('expressionService'),
        __metadata("design:type", expressionService_1.ExpressionService)
    ], CellComp.prototype, "expressionService", void 0);
    __decorate([
        context_1.Autowired('rowRenderer'),
        __metadata("design:type", rowRenderer_1.RowRenderer)
    ], CellComp.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired('$compile'),
        __metadata("design:type", Object)
    ], CellComp.prototype, "$compile", void 0);
    __decorate([
        context_1.Autowired('templateService'),
        __metadata("design:type", templateService_1.TemplateService)
    ], CellComp.prototype, "templateService", void 0);
    __decorate([
        context_1.Autowired('valueService'),
        __metadata("design:type", valueService_1.ValueService)
    ], CellComp.prototype, "valueService", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], CellComp.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], CellComp.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('columnAnimationService'),
        __metadata("design:type", columnAnimationService_1.ColumnAnimationService)
    ], CellComp.prototype, "columnAnimationService", void 0);
    __decorate([
        context_1.Optional('rangeController'),
        __metadata("design:type", Object)
    ], CellComp.prototype, "rangeController", void 0);
    __decorate([
        context_1.Autowired('focusedCellController'),
        __metadata("design:type", focusedCellController_1.FocusedCellController)
    ], CellComp.prototype, "focusedCellController", void 0);
    __decorate([
        context_1.Optional('contextMenuFactory'),
        __metadata("design:type", Object)
    ], CellComp.prototype, "contextMenuFactory", void 0);
    __decorate([
        context_1.Autowired('focusService'),
        __metadata("design:type", focusService_1.FocusService)
    ], CellComp.prototype, "focusService", void 0);
    __decorate([
        context_1.Autowired('cellEditorFactory'),
        __metadata("design:type", cellEditorFactory_1.CellEditorFactory)
    ], CellComp.prototype, "cellEditorFactory", void 0);
    __decorate([
        context_1.Autowired('cellRendererFactory'),
        __metadata("design:type", cellRendererFactory_1.CellRendererFactory)
    ], CellComp.prototype, "cellRendererFactory", void 0);
    __decorate([
        context_1.Autowired('popupService'),
        __metadata("design:type", popupService_1.PopupService)
    ], CellComp.prototype, "popupService", void 0);
    __decorate([
        context_1.Autowired('cellRendererService'),
        __metadata("design:type", cellRendererService_1.CellRendererService)
    ], CellComp.prototype, "cellRendererService", void 0);
    __decorate([
        context_1.Autowired('valueFormatterService'),
        __metadata("design:type", valueFormatterService_1.ValueFormatterService)
    ], CellComp.prototype, "valueFormatterService", void 0);
    __decorate([
        context_1.Autowired('stylingService'),
        __metadata("design:type", stylingService_1.StylingService)
    ], CellComp.prototype, "stylingService", void 0);
    __decorate([
        context_1.Autowired('columnHoverService'),
        __metadata("design:type", columnHoverService_1.ColumnHoverService)
    ], CellComp.prototype, "columnHoverService", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], CellComp.prototype, "init", null);
    return CellComp;
}(component_1.Component));
exports.CellComp = CellComp;
