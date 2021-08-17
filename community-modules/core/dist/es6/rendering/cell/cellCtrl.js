/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { RowNode } from "../../entities/rowNode";
import { Events } from "../../events";
import { CellRangeFeature } from "./cellRangeFeature";
import { exists } from "../../utils/generic";
import { BeanStub } from "../../context/beanStub";
import { CellPositionFeature } from "./cellPositionFeature";
import { escapeString } from "../../utils/string";
import { CellCustomStyleFeature } from "./cellCustomStyleFeature";
import { CellTooltipFeature } from "./cellTooltipFeature";
import { CellMouseListenerFeature } from "./cellMouseListenerFeature";
import { CellKeyboardListenerFeature } from "./cellKeyboardListenerFeature";
import { KeyCode } from "../../constants/keyCode";
import { CheckboxSelectionComponent } from "../checkboxSelectionComponent";
import { DndSourceComp } from "../dndSourceComp";
import { doOnce } from "../../utils/function";
import { RowDragComp } from "../row/rowDragComp";
var CSS_CELL = 'ag-cell';
var CSS_AUTO_HEIGHT = 'ag-cell-auto-height';
var CSS_NORMAL_HEIGHT = 'ag-cell-normal-height';
var CSS_CELL_FOCUS = 'ag-cell-focus';
var CSS_CELL_FIRST_RIGHT_PINNED = 'ag-cell-first-right-pinned';
var CSS_CELL_LAST_LEFT_PINNED = 'ag-cell-last-left-pinned';
var CSS_CELL_NOT_INLINE_EDITING = 'ag-cell-not-inline-editing';
var CSS_CELL_INLINE_EDITING = 'ag-cell-inline-editing';
var CSS_CELL_POPUP_EDITING = 'ag-cell-popup-editing';
var CSS_COLUMN_HOVER = 'ag-column-hover';
var CSS_CELL_WRAP_TEXT = 'ag-cell-wrap-text';
var instanceIdSequence = 0;
var CellCtrl = /** @class */ (function (_super) {
    __extends(CellCtrl, _super);
    function CellCtrl(column, rowNode, beans, rowCtrl) {
        var _this = _super.call(this) || this;
        _this.suppressRefreshCell = false;
        _this.column = column;
        _this.rowNode = rowNode;
        _this.beans = beans;
        _this.rowCtrl = rowCtrl;
        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        _this.instanceId = column.getId() + '-' + instanceIdSequence++;
        _this.createCellPosition();
        _this.addFeatures();
        return _this;
    }
    CellCtrl.prototype.addFeatures = function () {
        var _this = this;
        this.cellPositionFeature = new CellPositionFeature(this, this.beans);
        this.addDestroyFunc(function () { return _this.cellPositionFeature.destroy(); });
        this.cellCustomStyleFeature = new CellCustomStyleFeature(this, this.beans);
        this.addDestroyFunc(function () { return _this.cellCustomStyleFeature.destroy(); });
        this.cellTooltipFeature = new CellTooltipFeature(this, this.beans);
        this.addDestroyFunc(function () { return _this.cellTooltipFeature.destroy(); });
        this.cellMouseListenerFeature = new CellMouseListenerFeature(this, this.beans, this.column);
        this.addDestroyFunc(function () { return _this.cellMouseListenerFeature.destroy(); });
        this.cellKeyboardListenerFeature = new CellKeyboardListenerFeature(this, this.beans, this.column, this.rowNode, this.scope, this.rowCtrl);
        this.addDestroyFunc(function () { return _this.cellKeyboardListenerFeature.destroy(); });
        var rangeSelectionEnabled = this.beans.rangeService && this.beans.gridOptionsWrapper.isEnableRangeSelection();
        if (rangeSelectionEnabled) {
            this.cellRangeFeature = new CellRangeFeature(this.beans, this);
            this.addDestroyFunc(function () { return _this.cellRangeFeature.destroy(); });
        }
    };
    CellCtrl.prototype.setComp = function (comp, scope, eGui, printLayout, startEditing) {
        var _this = this;
        this.cellComp = comp;
        this.gow = this.beans.gridOptionsWrapper;
        this.scope = scope;
        this.eGui = eGui;
        this.printLayout = printLayout;
        // we force to make sure formatter gets called at least once,
        // even if value has not changed (is is undefined)
        this.updateAndFormatValue(true);
        this.addDomData();
        this.onCellFocused();
        this.applyStaticCssClasses();
        this.setWrapText();
        this.onFirstRightPinnedChanged();
        this.onLastLeftPinnedChanged();
        this.onColumnHover();
        this.setupControlComps();
        this.setupAriaExpanded();
        var colIdSanitised = escapeString(this.column.getId());
        var ariaColIndex = this.beans.columnModel.getAriaColumnIndex(this.column);
        this.cellComp.setTabIndex(-1);
        this.cellComp.setRole('gridcell');
        this.cellComp.setAriaColIndex(ariaColIndex);
        this.cellComp.setColId(colIdSanitised);
        this.cellComp.setUnselectable(!this.beans.gridOptionsWrapper.isEnableCellTextSelection() ? 'on' : null);
        this.cellPositionFeature.setComp(comp);
        this.cellCustomStyleFeature.setComp(comp, scope);
        this.cellTooltipFeature.setComp(comp);
        this.cellKeyboardListenerFeature.setComp(this.eGui);
        if (this.cellRangeFeature) {
            this.cellRangeFeature.setComp(comp);
        }
        if (startEditing && this.isCellEditable()) {
            this.startEditing();
        }
        else {
            this.showValue();
        }
        this.addDestroyFunc(function () {
            _this.destroyAutoHeight && _this.destroyAutoHeight();
        });
    };
    CellCtrl.prototype.setupAutoHeight = function (eParentOfValue) {
        var _this = this;
        if (!this.column.getColDef().autoHeight) {
            return;
        }
        if (this.autoHeightElement == eParentOfValue) {
            return;
        }
        if (this.destroyAutoHeight) {
            this.destroyAutoHeight();
        }
        this.autoHeightElement = eParentOfValue;
        if (!eParentOfValue) {
            return;
        }
        var listener = function () {
            var newHeight = eParentOfValue.offsetHeight;
            _this.rowNode.setRowAutoHeight(newHeight, _this.column);
        };
        // do once to set size in case size doesn't change, common when cell is blank
        listener();
        var destroyResizeObserver = this.beans.resizeObserverService.observeResize(eParentOfValue, listener);
        this.destroyAutoHeight = function () {
            destroyResizeObserver();
            _this.rowNode.setRowAutoHeight(undefined, _this.column);
        };
    };
    CellCtrl.prototype.getInstanceId = function () {
        return this.instanceId;
    };
    CellCtrl.prototype.showValue = function (forceNewCellRendererInstance) {
        if (forceNewCellRendererInstance === void 0) { forceNewCellRendererInstance = false; }
        var valueToDisplay = this.valueFormatted != null ? this.valueFormatted : this.value;
        var params = this.createCellRendererParams();
        var compDetails = this.beans.userComponentFactory.getCellRendererDetails(this.column.getColDef(), params);
        this.cellComp.setRenderDetails(compDetails, valueToDisplay, forceNewCellRendererInstance);
        this.refreshHandle();
    };
    CellCtrl.prototype.setupControlComps = function () {
        var colDef = this.column.getColDef();
        this.includeSelection = this.isIncludeControl(colDef.checkboxSelection);
        this.includeRowDrag = this.isIncludeControl(colDef.rowDrag);
        this.includeDndSource = this.isIncludeControl(colDef.dndSource);
        // text selection requires the value to be wrapped in another element
        var forceWrapper = this.beans.gridOptionsWrapper.isEnableCellTextSelection() || this.column.getColDef().autoHeight == true;
        this.cellComp.setIncludeSelection(this.includeSelection);
        this.cellComp.setIncludeDndSource(this.includeDndSource);
        this.cellComp.setIncludeRowDrag(this.includeRowDrag);
        this.cellComp.setForceWrapper(forceWrapper);
    };
    CellCtrl.prototype.isIncludeControl = function (value) {
        var rowNodePinned = this.rowNode.rowPinned != null;
        var isFunc = typeof value === 'function';
        var res = rowNodePinned ? false : isFunc || value === true;
        return res;
    };
    CellCtrl.prototype.setupAriaExpanded = function () {
        var _this = this;
        var colDef = this.column.getColDef();
        if (!this.rowNode.isExpandable()) {
            return;
        }
        var showRowGroup = colDef.showRowGroup;
        var rowGroupColumn = this.rowNode.rowGroupColumn;
        var showingAllGroups = showRowGroup === true;
        var showingThisGroup = rowGroupColumn && rowGroupColumn.getColId() === showRowGroup;
        var colMatches = showingAllGroups || showingThisGroup;
        if (!colMatches) {
            return;
        }
        var listener = function () {
            _this.cellComp.setAriaExpanded(!!_this.rowNode.expanded);
        };
        this.addManagedListener(this.rowNode, RowNode.EVENT_EXPANDED_CHANGED, listener);
        listener();
    };
    CellCtrl.prototype.refreshShouldDestroy = function () {
        var colDef = this.column.getColDef();
        var selectionChanged = this.includeSelection != this.isIncludeControl(colDef.checkboxSelection);
        var rowDragChanged = this.includeRowDrag != this.isIncludeControl(colDef.rowDrag);
        var dndSourceChanged = this.includeDndSource != this.isIncludeControl(colDef.dndSource);
        return selectionChanged || rowDragChanged || dndSourceChanged;
    };
    // either called internally if single cell editing, or called by rowRenderer if row editing
    CellCtrl.prototype.startEditing = function (keyPress, charPress, cellStartedEdit) {
        if (keyPress === void 0) { keyPress = null; }
        if (charPress === void 0) { charPress = null; }
        if (cellStartedEdit === void 0) { cellStartedEdit = false; }
        if (!this.isCellEditable() || this.editing) {
            return;
        }
        var editorParams = this.createCellEditorParams(keyPress, charPress, cellStartedEdit);
        var colDef = this.column.getColDef();
        var compDetails = this.beans.userComponentFactory.getCellEditorDetails(colDef, editorParams);
        var popup = !!colDef.cellEditorPopup;
        var position = colDef.cellEditorPopupPosition;
        this.setEditing(true, popup);
        this.cellComp.setEditDetails(compDetails, popup, position);
        var event = this.createEvent(null, Events.EVENT_CELL_EDITING_STARTED);
        this.beans.eventService.dispatchEvent(event);
    };
    CellCtrl.prototype.setEditing = function (editing, inPopup) {
        if (inPopup === void 0) { inPopup = false; }
        if (this.editing === editing) {
            return;
        }
        this.editing = editing;
        this.editingInPopup = inPopup;
        this.setInlineEditingClass();
        if (!editing) {
            this.cellComp.setEditDetails();
        }
    };
    // pass in 'true' to cancel the editing.
    CellCtrl.prototype.stopRowOrCellEdit = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        if (this.beans.gridOptionsWrapper.isFullRowEdit()) {
            this.rowCtrl.stopRowEditing(cancel);
        }
        else {
            this.stopEditing(cancel);
        }
    };
    CellCtrl.prototype.onPopupEditorClosed = function () {
        if (!this.isEditing()) {
            return;
        }
        // note: this happens because of a click outside of the grid or if the popupEditor
        // is closed with `Escape` key. if another cell was clicked, then the editing will 
        // have already stopped and returned on the conditional above.
        this.stopEditingAndFocus();
    };
    CellCtrl.prototype.takeValueFromCellEditor = function (cancel) {
        var noValueResult = { newValueExists: false };
        if (cancel) {
            return noValueResult;
        }
        var cellEditor = this.cellComp.getCellEditor();
        if (!cellEditor) {
            return noValueResult;
        }
        var userWantsToCancel = cellEditor.isCancelAfterEnd && cellEditor.isCancelAfterEnd();
        if (userWantsToCancel) {
            return noValueResult;
        }
        var newValue = cellEditor.getValue();
        return {
            newValue: newValue,
            newValueExists: true
        };
    };
    CellCtrl.prototype.saveNewValue = function (oldValue, newValue) {
        if (newValue !== oldValue) {
            // we suppressRefreshCell because the call to rowNode.setDataValue() results in change detection
            // getting triggered, which results in all cells getting refreshed. we do not want this refresh
            // to happen on this call as we want to call it explicitly below. otherwise refresh gets called twice.
            // if we only did this refresh (and not the one below) then the cell would flash and not be forced.
            this.suppressRefreshCell = true;
            this.rowNode.setDataValue(this.column, newValue);
            this.suppressRefreshCell = false;
        }
    };
    CellCtrl.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        if (!this.editing) {
            return;
        }
        var _a = this.takeValueFromCellEditor(cancel), newValue = _a.newValue, newValueExists = _a.newValueExists;
        var oldValue = this.getValueFromValueService();
        if (newValueExists) {
            this.saveNewValue(oldValue, newValue);
        }
        this.setEditing(false);
        this.updateAndFormatValue();
        this.refreshCell({ forceRefresh: true, suppressFlash: true });
        this.dispatchEditingStoppedEvent(oldValue, newValue);
    };
    CellCtrl.prototype.dispatchEditingStoppedEvent = function (oldValue, newValue) {
        var editingStoppedEvent = __assign(__assign({}, this.createEvent(null, Events.EVENT_CELL_EDITING_STOPPED)), { oldValue: oldValue,
            newValue: newValue });
        this.beans.eventService.dispatchEvent(editingStoppedEvent);
    };
    // if we are editing inline, then we don't have the padding in the cell (set in the themes)
    // to allow the text editor full access to the entire cell
    CellCtrl.prototype.setInlineEditingClass = function () {
        if (!this.isAlive()) {
            return;
        }
        // ag-cell-inline-editing - appears when user is inline editing
        // ag-cell-not-inline-editing - appears when user is no inline editing
        // ag-cell-popup-editing - appears when user is editing cell in popup (appears on the cell, not on the popup)
        // note: one of {ag-cell-inline-editing, ag-cell-not-inline-editing} is always present, they toggle.
        //       however {ag-cell-popup-editing} shows when popup, so you have both {ag-cell-popup-editing}
        //       and {ag-cell-not-inline-editing} showing at the same time.
        var editingInline = this.editing && !this.editingInPopup;
        var popupEditorShowing = this.editing && this.editingInPopup;
        this.cellComp.addOrRemoveCssClass(CSS_CELL_INLINE_EDITING, editingInline);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_NOT_INLINE_EDITING, !editingInline);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_POPUP_EDITING, popupEditorShowing);
        this.rowCtrl.setInlineEditingCss(this.editing);
    };
    // this is needed as the JS CellComp still allows isPopup() on the CellEditor class, so
    // it's possible the editor is in a popup even though it's not configured via the colDef as so
    CellCtrl.prototype.hackSayEditingInPopup = function () {
        if (this.editingInPopup) {
            return;
        }
        this.editingInPopup = true;
        this.setInlineEditingClass();
    };
    CellCtrl.prototype.createCellEditorParams = function (keyPress, charPress, cellStartedEdit) {
        var res = {
            value: this.getValueFromValueService(),
            keyPress: keyPress,
            charPress: charPress,
            column: this.column,
            colDef: this.column.getColDef(),
            rowIndex: this.getCellPosition().rowIndex,
            node: this.rowNode,
            data: this.rowNode.data,
            api: this.beans.gridOptionsWrapper.getApi(),
            cellStartedEdit: cellStartedEdit,
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext(),
            onKeyDown: this.onKeyDown.bind(this),
            stopEditing: this.stopEditingAndFocus.bind(this),
            eGridCell: this.getGui(),
            parseValue: this.parseValue.bind(this),
            formatValue: this.formatValue.bind(this)
        };
        if (this.scope) {
            res.$scope = this.scope;
        }
        return res;
    };
    CellCtrl.prototype.createCellRendererParams = function () {
        var _this = this;
        var addRowCompListener = function (eventType, listener) {
            console.warn('AG Grid: since AG Grid v26, params.addRowCompListener() is deprecated. If you need this functionality, please contact AG Grid support and advise why so that we can revert with an appropriate workaround, as we dont have any valid use cases for it. This method was originally provided as a work around to know when cells were destroyed in AG Grid before custom Cell Renderers could be provided.');
            _this.rowCtrl.addEventListener(eventType, listener);
        };
        var res = {
            value: this.value,
            valueFormatted: this.valueFormatted,
            getValue: this.getValueFromValueService.bind(this),
            setValue: function (value) { return _this.beans.valueService.setValue(_this.rowNode, _this.column, value); },
            formatValue: this.formatValue.bind(this),
            data: this.rowNode.data,
            node: this.rowNode,
            colDef: this.column.getColDef(),
            column: this.column,
            rowIndex: this.getCellPosition().rowIndex,
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext(),
            refreshCell: this.refreshCell.bind(this),
            eGridCell: this.getGui(),
            eParentOfValue: this.cellComp.getParentOfValue(),
            registerRowDragger: function (rowDraggerElement, dragStartPixels) { return _this.registerRowDragger(rowDraggerElement, dragStartPixels); },
            // this function is not documented anywhere, so we could drop it
            // it was in the olden days to allow user to register for when rendered
            // row was removed (the row comp was removed), however now that the user
            // can provide components for cells, the destroy method gets call when this
            // happens so no longer need to fire event.
            addRowCompListener: addRowCompListener
        };
        if (this.scope) {
            res.$scope = this.scope;
        }
        return res;
    };
    CellCtrl.prototype.parseValue = function (newValue) {
        var colDef = this.column.getColDef();
        var params = {
            node: this.rowNode,
            data: this.rowNode.data,
            oldValue: this.getValue(),
            newValue: newValue,
            colDef: colDef,
            column: this.column,
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext()
        };
        var valueParser = colDef.valueParser;
        return exists(valueParser) ? this.beans.expressionService.evaluate(valueParser, params) : newValue;
    };
    CellCtrl.prototype.setFocusOutOnEditor = function () {
        if (!this.editing) {
            return;
        }
        var cellEditor = this.cellComp.getCellEditor();
        if (cellEditor && cellEditor.focusOut) {
            cellEditor.focusOut();
        }
    };
    CellCtrl.prototype.setFocusInOnEditor = function () {
        if (!this.editing) {
            return;
        }
        var cellEditor = this.cellComp.getCellEditor();
        if (cellEditor && cellEditor.focusIn) {
            // if the editor is present, then we just focus it
            cellEditor.focusIn();
        }
        else {
            // if the editor is not present, it means async cell editor (eg React fibre)
            // and we are trying to set focus before the cell editor is present, so we
            // focus the cell instead
            this.focusCell(true);
        }
    };
    CellCtrl.prototype.onCellChanged = function (event) {
        var eventImpactsThisCell = event.column === this.column;
        if (eventImpactsThisCell) {
            this.refreshCell({});
        }
    };
    // + stop editing {forceRefresh: true, suppressFlash: true}
    // + event cellChanged {}
    // + cellRenderer.params.refresh() {} -> method passes 'as is' to the cellRenderer, so params could be anything
    // + rowCtrl: event dataChanged {suppressFlash: !update, newData: !update}
    // + rowCtrl: api refreshCells() {animate: true/false}
    // + rowRenderer: api softRefreshView() {}
    CellCtrl.prototype.refreshCell = function (params) {
        // if we are in the middle of 'stopEditing', then we don't refresh here, as refresh gets called explicitly
        if (this.suppressRefreshCell || this.editing) {
            return;
        }
        var colDef = this.column.getColDef();
        var newData = params != null && !!params.newData;
        var suppressFlash = (params != null && !!params.suppressFlash) || !!colDef.suppressCellFlash;
        // we always refresh if cell has no value - this can happen when user provides Cell Renderer and the
        // cell renderer doesn't rely on a value, instead it could be looking directly at the data, or maybe
        // printing the current time (which would be silly)???. Generally speaking
        // non of {field, valueGetter, showRowGroup} is bad in the users application, however for this edge case, it's
        // best always refresh and take the performance hit rather than never refresh and users complaining in support
        // that cells are not updating.
        var noValueProvided = colDef.field == null && colDef.valueGetter == null && colDef.showRowGroup == null;
        var forceRefresh = (params && params.forceRefresh) || noValueProvided || newData;
        var valuesDifferent = this.updateAndFormatValue();
        var dataNeedsUpdating = forceRefresh || valuesDifferent;
        if (dataNeedsUpdating) {
            // if it's 'new data', then we don't refresh the cellRenderer, even if refresh method is available.
            // this is because if the whole data is new (ie we are showing stock price 'BBA' now and not 'SSD')
            // then we are not showing a movement in the stock price, rather we are showing different stock.
            this.showValue(newData);
            // we don't want to flash the cells when processing a filter change, as otherwise the UI would
            // be to busy. see comment in FilterManager with regards processingFilterChange
            var processingFilterChange = this.beans.filterManager.isSuppressFlashingCellsBecauseFiltering();
            var flashCell = !suppressFlash && !processingFilterChange &&
                (this.beans.gridOptionsWrapper.isEnableCellChangeFlash() || colDef.enableCellChangeFlash);
            if (flashCell) {
                this.flashCell();
            }
            this.cellCustomStyleFeature.applyUserStyles();
            this.cellCustomStyleFeature.applyClassesFromColDef();
        }
        // we can't readily determine if the data in an angularjs template has changed, so here we just update
        // and recompile (if applicable)
        this.refreshToolTip();
        // we do cellClassRules even if the value has not changed, so that users who have rules that
        // look at other parts of the row (where the other part of the row might of changed) will work.
        this.cellCustomStyleFeature.applyCellClassRules();
    };
    // cell editors call this, when they want to stop for reasons other
    // than what we pick up on. eg selecting from a dropdown ends editing.
    CellCtrl.prototype.stopEditingAndFocus = function (suppressNavigateAfterEdit) {
        if (suppressNavigateAfterEdit === void 0) { suppressNavigateAfterEdit = false; }
        this.stopRowOrCellEdit();
        this.focusCell(true);
        if (!suppressNavigateAfterEdit) {
            this.navigateAfterEdit();
        }
    };
    CellCtrl.prototype.navigateAfterEdit = function () {
        var fullRowEdit = this.beans.gridOptionsWrapper.isFullRowEdit();
        if (fullRowEdit) {
            return;
        }
        var enterMovesDownAfterEdit = this.beans.gridOptionsWrapper.isEnterMovesDownAfterEdit();
        if (enterMovesDownAfterEdit) {
            this.beans.navigationService.navigateToNextCell(null, KeyCode.DOWN, this.getCellPosition(), false);
        }
    };
    // user can also call this via API
    CellCtrl.prototype.flashCell = function (delays) {
        var flashDelay = delays && delays.flashDelay;
        var fadeDelay = delays && delays.fadeDelay;
        this.animateCell('data-changed', flashDelay, fadeDelay);
    };
    CellCtrl.prototype.animateCell = function (cssName, flashDelay, fadeDelay) {
        var _this = this;
        var fullName = "ag-cell-" + cssName;
        var animationFullName = "ag-cell-" + cssName + "-animation";
        var gridOptionsWrapper = this.beans.gridOptionsWrapper;
        if (!flashDelay) {
            flashDelay = gridOptionsWrapper.getCellFlashDelay();
        }
        if (!exists(fadeDelay)) {
            fadeDelay = gridOptionsWrapper.getCellFadeDelay();
        }
        // we want to highlight the cells, without any animation
        this.cellComp.addOrRemoveCssClass(fullName, true);
        this.cellComp.addOrRemoveCssClass(animationFullName, false);
        // then once that is applied, we remove the highlight with animation
        window.setTimeout(function () {
            _this.cellComp.addOrRemoveCssClass(fullName, false);
            _this.cellComp.addOrRemoveCssClass(animationFullName, true);
            _this.cellComp.setTransition("background-color " + fadeDelay + "ms");
            window.setTimeout(function () {
                // and then to leave things as we got them, we remove the animation
                _this.cellComp.addOrRemoveCssClass(animationFullName, false);
                _this.cellComp.setTransition('transition');
            }, fadeDelay);
        }, flashDelay);
    };
    CellCtrl.prototype.onFlashCells = function (event) {
        var cellId = this.beans.cellPositionUtils.createId(this.getCellPosition());
        var shouldFlash = event.cells[cellId];
        if (shouldFlash) {
            this.animateCell('highlight');
        }
    };
    CellCtrl.prototype.isCellEditable = function () {
        return this.column.isCellEditable(this.rowNode);
    };
    CellCtrl.prototype.formatValue = function (value) {
        var res = this.callValueFormatter(value);
        return res != null ? res : value;
    };
    CellCtrl.prototype.callValueFormatter = function (value) {
        return this.beans.valueFormatterService.formatValue(this.column, this.rowNode, this.scope, value);
    };
    CellCtrl.prototype.updateAndFormatValue = function (force) {
        if (force === void 0) { force = false; }
        var oldValue = this.value;
        var oldValueFormatted = this.valueFormatted;
        this.value = this.getValueFromValueService();
        this.valueFormatted = this.callValueFormatter(this.value);
        var valuesDifferent = force ? true :
            !this.valuesAreEqual(oldValue, this.value) || this.valueFormatted != oldValueFormatted;
        return valuesDifferent;
    };
    CellCtrl.prototype.valuesAreEqual = function (val1, val2) {
        // if the user provided an equals method, use that, otherwise do simple comparison
        var colDef = this.column.getColDef();
        return colDef.equals ? colDef.equals(val1, val2) : val1 === val2;
    };
    CellCtrl.prototype.getComp = function () {
        return this.cellComp;
    };
    CellCtrl.prototype.getValueFromValueService = function () {
        // if we don't check this, then the grid will render leaf groups as open even if we are not
        // allowing the user to open leaf groups. confused? remember for pivot mode we don't allow
        // opening leaf groups, so we have to force leafGroups to be closed in case the user expanded
        // them via the API, or user user expanded them in the UI before turning on pivot mode
        var lockedClosedGroup = this.rowNode.leafGroup && this.beans.columnModel.isPivotMode();
        var isOpenGroup = this.rowNode.group && this.rowNode.expanded && !this.rowNode.footer && !lockedClosedGroup;
        // are we showing group footers
        var groupFootersEnabled = this.beans.gridOptionsWrapper.isGroupIncludeFooter();
        // if doing footers, we normally don't show agg data at group level when group is open
        var groupAlwaysShowAggData = this.beans.gridOptionsWrapper.isGroupSuppressBlankHeader();
        // if doing grouping and footers, we don't want to include the agg value
        // in the header when the group is open
        var ignoreAggData = (isOpenGroup && groupFootersEnabled) && !groupAlwaysShowAggData;
        var value = this.beans.valueService.getValue(this.column, this.rowNode, false, ignoreAggData);
        return value;
    };
    CellCtrl.prototype.getValue = function () {
        return this.value;
    };
    CellCtrl.prototype.getValueFormatted = function () {
        return this.valueFormatted;
    };
    CellCtrl.prototype.addDomData = function () {
        var _this = this;
        var element = this.getGui();
        this.beans.gridOptionsWrapper.setDomData(element, CellCtrl.DOM_DATA_KEY_CELL_CTRL, this);
        this.addDestroyFunc(function () { return _this.beans.gridOptionsWrapper.setDomData(element, CellCtrl.DOM_DATA_KEY_CELL_CTRL, null); });
    };
    CellCtrl.prototype.createEvent = function (domEvent, eventType) {
        var event = {
            type: eventType,
            node: this.rowNode,
            data: this.rowNode.data,
            value: this.value,
            column: this.column,
            colDef: this.column.getColDef(),
            context: this.beans.gridOptionsWrapper.getContext(),
            api: this.beans.gridApi,
            columnApi: this.beans.columnApi,
            rowPinned: this.rowNode.rowPinned,
            event: domEvent,
            rowIndex: this.rowNode.rowIndex
        };
        // because we are hacking in $scope for angular 1, we have to de-reference
        if (this.scope) {
            event.$scope = this.scope;
        }
        return event;
    };
    CellCtrl.prototype.onKeyPress = function (event) {
        this.cellKeyboardListenerFeature.onKeyPress(event);
    };
    CellCtrl.prototype.onKeyDown = function (event) {
        this.cellKeyboardListenerFeature.onKeyDown(event);
    };
    CellCtrl.prototype.onMouseEvent = function (eventName, mouseEvent) {
        this.cellMouseListenerFeature.onMouseEvent(eventName, mouseEvent);
    };
    CellCtrl.prototype.getGui = function () {
        return this.eGui;
    };
    CellCtrl.prototype.refreshToolTip = function () {
        this.cellTooltipFeature.refreshToolTip();
    };
    CellCtrl.prototype.getColSpanningList = function () {
        return this.cellPositionFeature.getColSpanningList();
    };
    CellCtrl.prototype.onLeftChanged = function () {
        this.cellPositionFeature.onLeftChanged();
        this.refreshAriaIndex(); // should change this to listen for when column order changes
    };
    CellCtrl.prototype.refreshAriaIndex = function () {
        var colIdx = this.beans.columnModel.getAriaColumnIndex(this.column);
        this.cellComp.setAriaColIndex(colIdx);
    };
    CellCtrl.prototype.isSuppressNavigable = function () {
        return this.column.isSuppressNavigable(this.rowNode);
    };
    CellCtrl.prototype.onWidthChanged = function () {
        return this.cellPositionFeature.onWidthChanged();
    };
    CellCtrl.prototype.getColumn = function () {
        return this.column;
    };
    CellCtrl.prototype.getRowNode = function () {
        return this.rowNode;
    };
    CellCtrl.prototype.getBeans = function () {
        return this.beans;
    };
    CellCtrl.prototype.isPrintLayout = function () {
        return this.printLayout;
    };
    CellCtrl.prototype.appendChild = function (htmlElement) {
        this.eGui.appendChild(htmlElement);
    };
    CellCtrl.prototype.refreshHandle = function () {
        if (this.editing) {
            return;
        }
        if (this.cellRangeFeature) {
            this.cellRangeFeature.refreshHandle();
        }
    };
    CellCtrl.prototype.getCellPosition = function () {
        return this.cellPosition;
    };
    CellCtrl.prototype.isEditing = function () {
        return this.editing;
    };
    // called by rowRenderer when user navigates via tab key
    CellCtrl.prototype.startRowOrCellEdit = function (keyPress, charPress) {
        if (this.beans.gridOptionsWrapper.isFullRowEdit()) {
            this.rowCtrl.startRowEditing(keyPress, charPress, this);
        }
        else {
            this.startEditing(keyPress, charPress, true);
        }
    };
    CellCtrl.prototype.getRowCtrl = function () {
        return this.rowCtrl;
    };
    CellCtrl.prototype.getRowPosition = function () {
        return {
            rowIndex: this.cellPosition.rowIndex,
            rowPinned: this.cellPosition.rowPinned
        };
    };
    CellCtrl.prototype.updateRangeBordersIfRangeCount = function () {
        if (this.cellRangeFeature) {
            this.cellRangeFeature.updateRangeBordersIfRangeCount();
        }
    };
    CellCtrl.prototype.onRangeSelectionChanged = function () {
        if (this.cellRangeFeature) {
            this.cellRangeFeature.onRangeSelectionChanged();
        }
    };
    CellCtrl.prototype.isRangeSelectionEnabled = function () {
        return this.cellRangeFeature != null;
    };
    CellCtrl.prototype.focusCell = function (forceBrowserFocus) {
        if (forceBrowserFocus === void 0) { forceBrowserFocus = false; }
        this.beans.focusService.setFocusedCell(this.getCellPosition().rowIndex, this.column, this.rowNode.rowPinned, forceBrowserFocus);
    };
    CellCtrl.prototype.onRowIndexChanged = function () {
        // when index changes, this influences items that need the index, so we update the
        // grid cell so they are working off the new index.
        this.createCellPosition();
        // when the index of the row changes, ie means the cell may have lost or gained focus
        this.onCellFocused();
        // check range selection
        if (this.cellRangeFeature) {
            this.cellRangeFeature.onRangeSelectionChanged();
        }
    };
    CellCtrl.prototype.onFirstRightPinnedChanged = function () {
        if (!this.cellComp) {
            return;
        }
        var firstRightPinned = this.column.isFirstRightPinned();
        this.cellComp.addOrRemoveCssClass(CSS_CELL_FIRST_RIGHT_PINNED, firstRightPinned);
    };
    CellCtrl.prototype.onLastLeftPinnedChanged = function () {
        if (!this.cellComp) {
            return;
        }
        var lastLeftPinned = this.column.isLastLeftPinned();
        this.cellComp.addOrRemoveCssClass(CSS_CELL_LAST_LEFT_PINNED, lastLeftPinned);
    };
    CellCtrl.prototype.onCellFocused = function (event) {
        if (!this.cellComp) {
            return;
        }
        var cellFocused = this.beans.focusService.isCellFocused(this.cellPosition);
        if (!this.gow.isSuppressCellSelection()) {
            this.cellComp.addOrRemoveCssClass(CSS_CELL_FOCUS, cellFocused);
        }
        // see if we need to force browser focus - this can happen if focus is programmatically set
        if (cellFocused && event && event.forceBrowserFocus) {
            var focusEl = this.cellComp.getFocusableElement();
            focusEl.focus();
            // Fix for AG-3465 "IE11 - After editing cell's content, selection doesn't go one cell below on enter"
            // IE can fail to focus the cell after the first call to focus(), and needs a second call
            if (!document.activeElement || document.activeElement === document.body) {
                focusEl.focus();
            }
        }
        // if another cell was focused, and we are editing, then stop editing
        var fullRowEdit = this.beans.gridOptionsWrapper.isFullRowEdit();
        if (!cellFocused && !fullRowEdit && this.editing) {
            this.stopRowOrCellEdit();
        }
    };
    CellCtrl.prototype.createCellPosition = function () {
        this.cellPosition = {
            rowIndex: this.rowNode.rowIndex,
            rowPinned: this.rowNode.rowPinned,
            column: this.column
        };
    };
    // CSS Classes that only get applied once, they never change
    CellCtrl.prototype.applyStaticCssClasses = function () {
        this.cellComp.addOrRemoveCssClass(CSS_CELL, true);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_NOT_INLINE_EDITING, true);
        // normal cells fill the height of the row. autoHeight cells have no height to let them
        // fit the height of content.
        // const autoHeight = this.column.getColDef().autoHeight == true;
        // this.cellComp.addOrRemoveCssClass(CSS_AUTO_HEIGHT, autoHeight);
        // this.cellComp.addOrRemoveCssClass(CSS_NORMAL_HEIGHT, !autoHeight);
        this.cellComp.addOrRemoveCssClass(CSS_NORMAL_HEIGHT, true);
    };
    CellCtrl.prototype.onColumnHover = function () {
        if (!this.cellComp) {
            return;
        }
        if (!this.beans.gridOptionsWrapper.isColumnHoverHighlight()) {
            return;
        }
        var isHovered = this.beans.columnHoverService.isHovered(this.column);
        this.cellComp.addOrRemoveCssClass(CSS_COLUMN_HOVER, isHovered);
    };
    CellCtrl.prototype.onNewColumnsLoaded = function () {
        if (!this.cellComp) {
            return;
        }
        this.setWrapText();
        if (!this.editing) {
            this.refreshCell({ forceRefresh: true });
        }
    };
    CellCtrl.prototype.setWrapText = function () {
        var value = this.column.getColDef().wrapText == true;
        this.cellComp.addOrRemoveCssClass(CSS_CELL_WRAP_TEXT, value);
    };
    CellCtrl.prototype.dispatchCellContextMenuEvent = function (event) {
        var colDef = this.column.getColDef();
        var cellContextMenuEvent = this.createEvent(event, Events.EVENT_CELL_CONTEXT_MENU);
        this.beans.eventService.dispatchEvent(cellContextMenuEvent);
        if (colDef.onCellContextMenu) {
            // to make the callback async, do in a timeout
            window.setTimeout(function () { return colDef.onCellContextMenu(cellContextMenuEvent); }, 0);
        }
    };
    CellCtrl.prototype.getCellRenderer = function () {
        return this.cellComp ? this.cellComp.getCellRenderer() : null;
    };
    CellCtrl.prototype.getCellEditor = function () {
        return this.cellComp ? this.cellComp.getCellEditor() : null;
    };
    CellCtrl.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    CellCtrl.prototype.createSelectionCheckbox = function () {
        var cbSelectionComponent = new CheckboxSelectionComponent();
        this.beans.context.createBean(cbSelectionComponent);
        cbSelectionComponent.init({ rowNode: this.rowNode, column: this.column });
        // put the checkbox in before the value
        return cbSelectionComponent;
    };
    CellCtrl.prototype.createDndSource = function () {
        var dndSourceComp = new DndSourceComp(this.rowNode, this.column, this.beans, this.eGui);
        this.beans.context.createBean(dndSourceComp);
        return dndSourceComp;
    };
    CellCtrl.prototype.registerRowDragger = function (customElement, dragStartPixels) {
        var _this = this;
        // if previously existed, then we are only updating
        if (this.customRowDragComp) {
            this.customRowDragComp.setDragElement(customElement, dragStartPixels);
            return;
        }
        var newComp = this.createRowDragComp(customElement, dragStartPixels);
        if (newComp) {
            this.customRowDragComp = newComp;
            this.addDestroyFunc(function () { return _this.beans.context.destroyBean(newComp); });
        }
    };
    CellCtrl.prototype.createRowDragComp = function (customElement, dragStartPixels) {
        var _this = this;
        var pagination = this.beans.gridOptionsWrapper.isPagination();
        var rowDragManaged = this.beans.gridOptionsWrapper.isRowDragManaged();
        var clientSideRowModelActive = this.beans.gridOptionsWrapper.isRowModelDefault();
        if (rowDragManaged) {
            // row dragging only available in default row model
            if (!clientSideRowModelActive) {
                doOnce(function () { return console.warn('AG Grid: managed row dragging is only allowed in the Client Side Row Model'); }, 'CellComp.addRowDragging');
                return;
            }
            if (pagination) {
                doOnce(function () { return console.warn('AG Grid: managed row dragging is not possible when doing pagination'); }, 'CellComp.addRowDragging');
                return;
            }
        }
        // otherwise (normal case) we are creating a RowDraggingComp for the first time
        var rowDragComp = new RowDragComp(function () { return _this.value; }, this.rowNode, this.column, customElement, dragStartPixels);
        this.beans.context.createBean(rowDragComp);
        return rowDragComp;
    };
    CellCtrl.DOM_DATA_KEY_CELL_CTRL = 'cellCtrl';
    return CellCtrl;
}(BeanStub));
export { CellCtrl };
