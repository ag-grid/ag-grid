var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { Events } from "../../events";
import { CellRangeFeature } from "./cellRangeFeature";
import { exists, makeNull } from "../../utils/generic";
import { BeanStub } from "../../context/beanStub";
import { CellPositionFeature } from "./cellPositionFeature";
import { escapeString } from "../../utils/string";
import { CellCustomStyleFeature } from "./cellCustomStyleFeature";
import { TooltipFeature } from "../../widgets/tooltipFeature";
import { CellMouseListenerFeature } from "./cellMouseListenerFeature";
import { CellKeyboardListenerFeature } from "./cellKeyboardListenerFeature";
import { KeyCode } from "../../constants/keyCode";
import { CheckboxSelectionComponent } from "../checkboxSelectionComponent";
import { DndSourceComp } from "../dndSourceComp";
import { warnOnce } from "../../utils/function";
import { RowDragComp } from "../row/rowDragComp";
import { getValueUsingField } from "../../utils/object";
import { getElementSize } from "../../utils/dom";
import { setAriaColIndex } from "../../utils/aria";
import { CssClassApplier } from "../../headerRendering/cells/cssClassApplier";
var CSS_CELL = 'ag-cell';
var CSS_AUTO_HEIGHT = 'ag-cell-auto-height';
var CSS_NORMAL_HEIGHT = 'ag-cell-normal-height';
var CSS_CELL_FOCUS = 'ag-cell-focus';
var CSS_CELL_FIRST_RIGHT_PINNED = 'ag-cell-first-right-pinned';
var CSS_CELL_LAST_LEFT_PINNED = 'ag-cell-last-left-pinned';
var CSS_CELL_NOT_INLINE_EDITING = 'ag-cell-not-inline-editing';
var CSS_COLUMN_HOVER = 'ag-column-hover';
var CSS_CELL_WRAP_TEXT = 'ag-cell-wrap-text';
var instanceIdSequence = 0;
var CellCtrl = /** @class */ (function (_super) {
    __extends(CellCtrl, _super);
    function CellCtrl(column, rowNode, beans, rowCtrl) {
        var _this = _super.call(this) || this;
        _this.cellRangeFeature = null;
        _this.cellPositionFeature = null;
        _this.cellCustomStyleFeature = null;
        _this.tooltipFeature = null;
        _this.cellMouseListenerFeature = null;
        _this.cellKeyboardListenerFeature = null;
        _this.suppressRefreshCell = false;
        _this.onCellCompAttachedFuncs = [];
        _this.column = column;
        _this.rowNode = rowNode;
        _this.beans = beans;
        _this.rowCtrl = rowCtrl;
        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        _this.instanceId = column.getId() + '-' + instanceIdSequence++;
        var colDef = _this.column.getColDef();
        _this.colIdSanitised = escapeString(_this.column.getId());
        if (!_this.beans.gridOptionsService.get('suppressCellFocus')) {
            _this.tabIndex = -1;
        }
        _this.isCellRenderer = colDef.cellRenderer != null || colDef.cellRendererSelector != null;
        _this.createCellPosition();
        _this.addFeatures();
        _this.updateAndFormatValue(false);
        return _this;
    }
    CellCtrl.prototype.shouldRestoreFocus = function () {
        return this.beans.focusService.shouldRestoreFocus(this.cellPosition);
    };
    CellCtrl.prototype.addFeatures = function () {
        var _this = this;
        this.cellPositionFeature = new CellPositionFeature(this, this.beans);
        this.addDestroyFunc(function () { var _a; (_a = _this.cellPositionFeature) === null || _a === void 0 ? void 0 : _a.destroy(); _this.cellPositionFeature = null; });
        this.cellCustomStyleFeature = new CellCustomStyleFeature(this, this.beans);
        this.addDestroyFunc(function () { var _a; (_a = _this.cellCustomStyleFeature) === null || _a === void 0 ? void 0 : _a.destroy(); _this.cellCustomStyleFeature = null; });
        this.cellMouseListenerFeature = new CellMouseListenerFeature(this, this.beans, this.column);
        this.addDestroyFunc(function () { var _a; (_a = _this.cellMouseListenerFeature) === null || _a === void 0 ? void 0 : _a.destroy(); _this.cellMouseListenerFeature = null; });
        this.cellKeyboardListenerFeature = new CellKeyboardListenerFeature(this, this.beans, this.column, this.rowNode, this.rowCtrl);
        this.addDestroyFunc(function () { var _a; (_a = _this.cellKeyboardListenerFeature) === null || _a === void 0 ? void 0 : _a.destroy(); _this.cellKeyboardListenerFeature = null; });
        if (this.column.isTooltipEnabled()) {
            this.enableTooltipFeature();
            this.addDestroyFunc(function () { _this.disableTooltipFeature(); });
        }
        var rangeSelectionEnabled = this.beans.rangeService && this.beans.gridOptionsService.get('enableRangeSelection');
        if (rangeSelectionEnabled) {
            this.cellRangeFeature = new CellRangeFeature(this.beans, this);
            this.addDestroyFunc(function () { var _a; (_a = _this.cellRangeFeature) === null || _a === void 0 ? void 0 : _a.destroy(); _this.cellRangeFeature = null; });
        }
    };
    CellCtrl.prototype.enableTooltipFeature = function () {
        var _this = this;
        var getTooltipValue = function () {
            var colDef = _this.column.getColDef();
            var data = _this.rowNode.data;
            if (colDef.tooltipField && exists(data)) {
                return getValueUsingField(data, colDef.tooltipField, _this.column.isTooltipFieldContainsDots());
            }
            var valueGetter = colDef.tooltipValueGetter;
            if (valueGetter) {
                return valueGetter({
                    location: 'cell',
                    api: _this.beans.gridOptionsService.api,
                    columnApi: _this.beans.gridOptionsService.columnApi,
                    context: _this.beans.gridOptionsService.context,
                    colDef: _this.column.getColDef(),
                    column: _this.column,
                    rowIndex: _this.cellPosition.rowIndex,
                    node: _this.rowNode,
                    data: _this.rowNode.data,
                    value: _this.value,
                    valueFormatted: _this.valueFormatted,
                });
            }
            return null;
        };
        var tooltipCtrl = {
            getColumn: function () { return _this.column; },
            getColDef: function () { return _this.column.getColDef(); },
            getRowIndex: function () { return _this.cellPosition.rowIndex; },
            getRowNode: function () { return _this.rowNode; },
            getGui: function () { return _this.getGui(); },
            getLocation: function () { return 'cell'; },
            getTooltipValue: getTooltipValue,
            // this makes no sense, why is the cell formatted value passed to the tooltip???
            getValueFormatted: function () { return _this.valueFormatted; }
        };
        this.tooltipFeature = new TooltipFeature(tooltipCtrl, this.beans);
    };
    CellCtrl.prototype.disableTooltipFeature = function () {
        if (!this.tooltipFeature) {
            return;
        }
        this.tooltipFeature.destroy();
        this.tooltipFeature = null;
    };
    CellCtrl.prototype.setComp = function (comp, eGui, eCellWrapper, printLayout, startEditing) {
        var _a, _b, _c, _d;
        this.cellComp = comp;
        this.eGui = eGui;
        this.printLayout = printLayout;
        this.addDomData();
        this.onCellFocused(this.focusEventToRestore);
        this.applyStaticCssClasses();
        this.setWrapText();
        this.onFirstRightPinnedChanged();
        this.onLastLeftPinnedChanged();
        this.onColumnHover();
        this.setupControlComps();
        this.setupAutoHeight(eCellWrapper);
        this.refreshFirstAndLastStyles();
        this.refreshAriaColIndex();
        (_a = this.cellPositionFeature) === null || _a === void 0 ? void 0 : _a.setComp(eGui);
        (_b = this.cellCustomStyleFeature) === null || _b === void 0 ? void 0 : _b.setComp(comp);
        (_c = this.tooltipFeature) === null || _c === void 0 ? void 0 : _c.setComp(eGui);
        (_d = this.cellKeyboardListenerFeature) === null || _d === void 0 ? void 0 : _d.setComp(this.eGui);
        if (this.cellRangeFeature) {
            this.cellRangeFeature.setComp(comp, eGui);
        }
        if (startEditing && this.isCellEditable()) {
            this.startEditing();
        }
        else {
            this.showValue();
        }
        if (this.onCellCompAttachedFuncs.length) {
            this.onCellCompAttachedFuncs.forEach(function (func) { return func(); });
            this.onCellCompAttachedFuncs = [];
        }
    };
    CellCtrl.prototype.setupAutoHeight = function (eCellWrapper) {
        var _this = this;
        this.isAutoHeight = this.column.isAutoHeight();
        if (!this.isAutoHeight || !eCellWrapper) {
            return;
        }
        var eParentCell = eCellWrapper.parentElement;
        // taking minRowHeight from getRowHeightForNode means the getRowHeight() callback is used,
        // thus allowing different min heights for different rows.
        var minRowHeight = this.beans.gridOptionsService.getRowHeightForNode(this.rowNode).height;
        var measureHeight = function (timesCalled) {
            if (_this.editing) {
                return;
            }
            // because of the retry's below, it's possible the retry's go beyond
            // the rows life.
            if (!_this.isAlive()) {
                return;
            }
            var _a = getElementSize(eParentCell), paddingTop = _a.paddingTop, paddingBottom = _a.paddingBottom, borderBottomWidth = _a.borderBottomWidth, borderTopWidth = _a.borderTopWidth;
            var extraHeight = paddingTop + paddingBottom + borderBottomWidth + borderTopWidth;
            var wrapperHeight = eCellWrapper.offsetHeight;
            var autoHeight = wrapperHeight + extraHeight;
            if (timesCalled < 5) {
                // if not in doc yet, means framework not yet inserted, so wait for next VM turn,
                // maybe it will be ready next VM turn
                var doc = _this.beans.gridOptionsService.getDocument();
                var notYetInDom = !doc || !doc.contains(eCellWrapper);
                // this happens in React, where React hasn't put any content in. we say 'possibly'
                // as a) may not be React and b) the cell could be empty anyway
                var possiblyNoContentYet = autoHeight == 0;
                if (notYetInDom || possiblyNoContentYet) {
                    _this.beans.frameworkOverrides.setTimeout(function () { return measureHeight(timesCalled + 1); }, 0);
                    return;
                }
            }
            var newHeight = Math.max(autoHeight, minRowHeight);
            _this.rowNode.setRowAutoHeight(newHeight, _this.column);
        };
        var listener = function () { return measureHeight(0); };
        // do once to set size in case size doesn't change, common when cell is blank
        listener();
        var destroyResizeObserver = this.beans.resizeObserverService.observeResize(eCellWrapper, listener);
        this.addDestroyFunc(function () {
            destroyResizeObserver();
            _this.rowNode.setRowAutoHeight(undefined, _this.column);
        });
    };
    CellCtrl.prototype.getCellAriaRole = function () {
        var _a;
        return (_a = this.column.getColDef().cellAriaRole) !== null && _a !== void 0 ? _a : 'gridcell';
    };
    CellCtrl.prototype.getInstanceId = function () {
        return this.instanceId;
    };
    CellCtrl.prototype.getIncludeSelection = function () {
        return this.includeSelection;
    };
    CellCtrl.prototype.getIncludeRowDrag = function () {
        return this.includeRowDrag;
    };
    CellCtrl.prototype.getIncludeDndSource = function () {
        return this.includeDndSource;
    };
    CellCtrl.prototype.getColumnIdSanitised = function () {
        return this.colIdSanitised;
    };
    CellCtrl.prototype.getTabIndex = function () {
        return this.tabIndex;
    };
    CellCtrl.prototype.getIsCellRenderer = function () {
        return this.isCellRenderer;
    };
    CellCtrl.prototype.getValueToDisplay = function () {
        return this.valueFormatted != null ? this.valueFormatted : this.value;
    };
    CellCtrl.prototype.showValue = function (forceNewCellRendererInstance) {
        if (forceNewCellRendererInstance === void 0) { forceNewCellRendererInstance = false; }
        var valueToDisplay = this.getValueToDisplay();
        var compDetails;
        if (this.isCellRenderer) {
            var params = this.createCellRendererParams();
            compDetails = this.beans.userComponentFactory.getCellRendererDetails(this.column.getColDef(), params);
        }
        this.cellComp.setRenderDetails(compDetails, valueToDisplay, forceNewCellRendererInstance);
        this.refreshHandle();
    };
    CellCtrl.prototype.setupControlComps = function () {
        var colDef = this.column.getColDef();
        this.includeSelection = this.isIncludeControl(colDef.checkboxSelection);
        this.includeRowDrag = this.isIncludeControl(colDef.rowDrag);
        this.includeDndSource = this.isIncludeControl(colDef.dndSource);
        this.cellComp.setIncludeSelection(this.includeSelection);
        this.cellComp.setIncludeDndSource(this.includeDndSource);
        this.cellComp.setIncludeRowDrag(this.includeRowDrag);
    };
    CellCtrl.prototype.isForceWrapper = function () {
        // text selection requires the value to be wrapped in another element
        var forceWrapper = this.beans.gridOptionsService.get('enableCellTextSelection') || this.column.isAutoHeight();
        return forceWrapper;
    };
    CellCtrl.prototype.isIncludeControl = function (value) {
        var rowNodePinned = this.rowNode.rowPinned != null;
        var isFunc = typeof value === 'function';
        var res = rowNodePinned ? false : isFunc || value === true;
        return res;
    };
    CellCtrl.prototype.refreshShouldDestroy = function () {
        var colDef = this.column.getColDef();
        var selectionChanged = this.includeSelection != this.isIncludeControl(colDef.checkboxSelection);
        var rowDragChanged = this.includeRowDrag != this.isIncludeControl(colDef.rowDrag);
        var dndSourceChanged = this.includeDndSource != this.isIncludeControl(colDef.dndSource);
        return selectionChanged || rowDragChanged || dndSourceChanged;
    };
    // either called internally if single cell editing, or called by rowRenderer if row editing
    CellCtrl.prototype.startEditing = function (key, cellStartedEdit, event) {
        var _this = this;
        if (key === void 0) { key = null; }
        if (cellStartedEdit === void 0) { cellStartedEdit = false; }
        if (event === void 0) { event = null; }
        if (!this.isCellEditable() || this.editing) {
            return;
        }
        // because of async in React, the cellComp may not be set yet, if no cellComp then we are
        // yet to initialise the cell, so we re-schedule this operation for when celLComp is attached
        if (!this.cellComp) {
            this.onCellCompAttachedFuncs.push(function () { _this.startEditing(key, cellStartedEdit, event); });
            return;
        }
        var editorParams = this.createCellEditorParams(key, cellStartedEdit);
        var colDef = this.column.getColDef();
        var compDetails = this.beans.userComponentFactory.getCellEditorDetails(colDef, editorParams);
        // if cellEditorSelector was used, we give preference to popup and popupPosition from the selector
        var popup = (compDetails === null || compDetails === void 0 ? void 0 : compDetails.popupFromSelector) != null ? compDetails.popupFromSelector : !!colDef.cellEditorPopup;
        var position = (compDetails === null || compDetails === void 0 ? void 0 : compDetails.popupPositionFromSelector) != null ? compDetails.popupPositionFromSelector : colDef.cellEditorPopupPosition;
        this.setEditing(true);
        this.cellComp.setEditDetails(compDetails, popup, position);
        var e = this.createEvent(event, Events.EVENT_CELL_EDITING_STARTED);
        this.beans.eventService.dispatchEvent(e);
    };
    CellCtrl.prototype.setEditing = function (editing) {
        if (this.editing === editing) {
            return;
        }
        this.editing = editing;
        this.refreshHandle();
    };
    // pass in 'true' to cancel the editing.
    CellCtrl.prototype.stopRowOrCellEdit = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        if (this.beans.gridOptionsService.get('editType') === 'fullRow') {
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
    /**
     * @returns `True` if the value changes, otherwise `False`.
     */
    CellCtrl.prototype.saveNewValue = function (oldValue, newValue) {
        if (newValue === oldValue) {
            return false;
        }
        // we suppressRefreshCell because the call to rowNode.setDataValue() results in change detection
        // getting triggered, which results in all cells getting refreshed. we do not want this refresh
        // to happen on this call as we want to call it explicitly below. otherwise refresh gets called twice.
        // if we only did this refresh (and not the one below) then the cell would flash and not be forced.
        this.suppressRefreshCell = true;
        var valueChanged = this.rowNode.setDataValue(this.column, newValue, 'edit');
        this.suppressRefreshCell = false;
        return valueChanged;
    };
    /**
     * Ends the Cell Editing
     * @param cancel `True` if the edit process is being canceled.
     * @returns `True` if the value of the `GridCell` has been updated, otherwise `False`.
     */
    CellCtrl.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        if (!this.editing) {
            return false;
        }
        var _a = this.takeValueFromCellEditor(cancel), newValue = _a.newValue, newValueExists = _a.newValueExists;
        var oldValue = this.rowNode.getValueFromValueService(this.column);
        var valueChanged = false;
        if (newValueExists) {
            valueChanged = this.saveNewValue(oldValue, newValue);
        }
        this.setEditing(false);
        this.cellComp.setEditDetails(); // passing nothing stops editing
        this.updateAndFormatValue(false);
        this.refreshCell({ forceRefresh: true, suppressFlash: true });
        this.dispatchEditingStoppedEvent(oldValue, newValue, !cancel && !!valueChanged);
        return valueChanged;
    };
    CellCtrl.prototype.dispatchEditingStoppedEvent = function (oldValue, newValue, valueChanged) {
        var editingStoppedEvent = __assign(__assign({}, this.createEvent(null, Events.EVENT_CELL_EDITING_STOPPED)), { oldValue: oldValue, newValue: newValue, valueChanged: valueChanged });
        this.beans.eventService.dispatchEvent(editingStoppedEvent);
    };
    CellCtrl.prototype.createCellEditorParams = function (key, cellStartedEdit) {
        return {
            value: this.rowNode.getValueFromValueService(this.column),
            eventKey: key,
            column: this.column,
            colDef: this.column.getColDef(),
            rowIndex: this.getCellPosition().rowIndex,
            node: this.rowNode,
            data: this.rowNode.data,
            api: this.beans.gridOptionsService.api,
            cellStartedEdit: cellStartedEdit,
            columnApi: this.beans.gridOptionsService.columnApi,
            context: this.beans.gridOptionsService.context,
            onKeyDown: this.onKeyDown.bind(this),
            stopEditing: this.stopEditingAndFocus.bind(this),
            eGridCell: this.getGui(),
            parseValue: this.parseValue.bind(this),
            formatValue: this.formatValue.bind(this)
        };
    };
    CellCtrl.prototype.createCellRendererParams = function () {
        var _this = this;
        var res = {
            value: this.value,
            valueFormatted: this.valueFormatted,
            getValue: function () { return _this.rowNode.getValueFromValueService(_this.column); },
            setValue: function (value) { return _this.beans.valueService.setValue(_this.rowNode, _this.column, value); },
            formatValue: this.formatValue.bind(this),
            data: this.rowNode.data,
            node: this.rowNode,
            pinned: this.column.getPinned(),
            colDef: this.column.getColDef(),
            column: this.column,
            rowIndex: this.getCellPosition().rowIndex,
            api: this.beans.gridOptionsService.api,
            columnApi: this.beans.gridOptionsService.columnApi,
            context: this.beans.gridOptionsService.context,
            refreshCell: this.refreshCell.bind(this),
            eGridCell: this.getGui(),
            eParentOfValue: this.cellComp.getParentOfValue(),
            registerRowDragger: function (rowDraggerElement, dragStartPixels, value, suppressVisibilityChange) { return _this.registerRowDragger(rowDraggerElement, dragStartPixels, suppressVisibilityChange); },
        };
        return res;
    };
    CellCtrl.prototype.parseValue = function (newValue) {
        return this.beans.valueParserService.parseValue(this.column, this.rowNode, newValue, this.getValue());
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
    CellCtrl.prototype.refreshOrDestroyCell = function (params) {
        var _a;
        if (this.refreshShouldDestroy()) {
            (_a = this.rowCtrl) === null || _a === void 0 ? void 0 : _a.refreshCell(this);
        }
        else {
            this.refreshCell(params);
        }
    };
    // + stop editing {forceRefresh: true, suppressFlash: true}
    // + event cellChanged {}
    // + cellRenderer.params.refresh() {} -> method passes 'as is' to the cellRenderer, so params could be anything
    // + rowCtrl: event dataChanged {suppressFlash: !update, newData: !update}
    // + rowCtrl: api refreshCells() {animate: true/false}
    // + rowRenderer: api softRefreshView() {}
    CellCtrl.prototype.refreshCell = function (params) {
        var _a, _b, _c;
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
        var isCellCompReady = !!this.cellComp;
        // Only worth comparing values if the cellComp is ready
        var valuesDifferent = this.updateAndFormatValue(isCellCompReady);
        var dataNeedsUpdating = forceRefresh || valuesDifferent;
        // In React, due to async, it's possible a refresh was asked for before the CellComp was created and calls setComp()
        // So we do not run the cell comp refresh logic at this point in time.
        if (!isCellCompReady) {
            return;
        }
        if (dataNeedsUpdating) {
            // if it's 'new data', then we don't refresh the cellRenderer, even if refresh method is available.
            // this is because if the whole data is new (ie we are showing stock price 'BBA' now and not 'SSD')
            // then we are not showing a movement in the stock price, rather we are showing different stock.
            this.showValue(newData);
            // we don't want to flash the cells when processing a filter change, as otherwise the UI would
            // be to busy. see comment in FilterManager with regards processingFilterChange
            var processingFilterChange = this.beans.filterManager.isSuppressFlashingCellsBecauseFiltering();
            var flashCell = !suppressFlash && !processingFilterChange &&
                (this.beans.gridOptionsService.get('enableCellChangeFlash') || colDef.enableCellChangeFlash);
            if (flashCell) {
                this.flashCell();
            }
            (_a = this.cellCustomStyleFeature) === null || _a === void 0 ? void 0 : _a.applyUserStyles();
            (_b = this.cellCustomStyleFeature) === null || _b === void 0 ? void 0 : _b.applyClassesFromColDef();
        }
        this.refreshToolTip();
        // we do cellClassRules even if the value has not changed, so that users who have rules that
        // look at other parts of the row (where the other part of the row might of changed) will work.
        (_c = this.cellCustomStyleFeature) === null || _c === void 0 ? void 0 : _c.applyCellClassRules();
    };
    // cell editors call this, when they want to stop for reasons other
    // than what we pick up on. eg selecting from a dropdown ends editing.
    CellCtrl.prototype.stopEditingAndFocus = function (suppressNavigateAfterEdit, shiftKey) {
        if (suppressNavigateAfterEdit === void 0) { suppressNavigateAfterEdit = false; }
        if (shiftKey === void 0) { shiftKey = false; }
        this.stopRowOrCellEdit();
        this.focusCell(true);
        if (!suppressNavigateAfterEdit) {
            this.navigateAfterEdit(shiftKey);
        }
    };
    CellCtrl.prototype.navigateAfterEdit = function (shiftKey) {
        var enterNavigatesVerticallyAfterEdit = this.beans.gridOptionsService.get('enterNavigatesVerticallyAfterEdit');
        if (enterNavigatesVerticallyAfterEdit) {
            var key = shiftKey ? KeyCode.UP : KeyCode.DOWN;
            this.beans.navigationService.navigateToNextCell(null, key, this.getCellPosition(), false);
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
        if (!this.cellComp) {
            return;
        }
        var fullName = "ag-cell-".concat(cssName);
        var animationFullName = "ag-cell-".concat(cssName, "-animation");
        var gridOptionsService = this.beans.gridOptionsService;
        if (!flashDelay) {
            flashDelay = gridOptionsService.get('cellFlashDelay');
        }
        if (!exists(fadeDelay)) {
            fadeDelay = gridOptionsService.get('cellFadeDelay');
        }
        // we want to highlight the cells, without any animation
        this.cellComp.addOrRemoveCssClass(fullName, true);
        this.cellComp.addOrRemoveCssClass(animationFullName, false);
        // then once that is applied, we remove the highlight with animation
        window.setTimeout(function () {
            if (!_this.isAlive()) {
                return;
            }
            _this.cellComp.addOrRemoveCssClass(fullName, false);
            _this.cellComp.addOrRemoveCssClass(animationFullName, true);
            _this.eGui.style.transition = "background-color ".concat(fadeDelay, "ms");
            window.setTimeout(function () {
                if (!_this.isAlive()) {
                    return;
                }
                // and then to leave things as we got them, we remove the animation
                _this.cellComp.addOrRemoveCssClass(animationFullName, false);
                _this.eGui.style.transition = '';
            }, fadeDelay);
        }, flashDelay);
    };
    CellCtrl.prototype.onFlashCells = function (event) {
        if (!this.cellComp) {
            return;
        }
        var cellId = this.beans.cellPositionUtils.createId(this.getCellPosition());
        var shouldFlash = event.cells[cellId];
        if (shouldFlash) {
            this.animateCell('highlight');
        }
    };
    CellCtrl.prototype.isCellEditable = function () {
        return this.column.isCellEditable(this.rowNode);
    };
    CellCtrl.prototype.isSuppressFillHandle = function () {
        return this.column.isSuppressFillHandle();
    };
    CellCtrl.prototype.formatValue = function (value) {
        var _a;
        return (_a = this.callValueFormatter(value)) !== null && _a !== void 0 ? _a : value;
    };
    CellCtrl.prototype.callValueFormatter = function (value) {
        return this.beans.valueFormatterService.formatValue(this.column, this.rowNode, value);
    };
    CellCtrl.prototype.updateAndFormatValue = function (compareValues) {
        var oldValue = this.value;
        var oldValueFormatted = this.valueFormatted;
        this.value = this.rowNode.getValueFromValueService(this.column);
        this.valueFormatted = this.callValueFormatter(this.value);
        if (compareValues) {
            return !this.valuesAreEqual(oldValue, this.value) || this.valueFormatted != oldValueFormatted;
        }
        return true;
    };
    CellCtrl.prototype.valuesAreEqual = function (val1, val2) {
        // if the user provided an equals method, use that, otherwise do simple comparison
        var colDef = this.column.getColDef();
        return colDef.equals ? colDef.equals(val1, val2) : val1 === val2;
    };
    CellCtrl.prototype.getComp = function () {
        return this.cellComp;
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
        this.beans.gridOptionsService.setDomData(element, CellCtrl.DOM_DATA_KEY_CELL_CTRL, this);
        this.addDestroyFunc(function () { return _this.beans.gridOptionsService.setDomData(element, CellCtrl.DOM_DATA_KEY_CELL_CTRL, null); });
    };
    CellCtrl.prototype.createEvent = function (domEvent, eventType) {
        var event = {
            type: eventType,
            node: this.rowNode,
            data: this.rowNode.data,
            value: this.value,
            column: this.column,
            colDef: this.column.getColDef(),
            context: this.beans.gridOptionsService.context,
            api: this.beans.gridApi,
            columnApi: this.beans.columnApi,
            rowPinned: this.rowNode.rowPinned,
            event: domEvent,
            rowIndex: this.rowNode.rowIndex
        };
        return event;
    };
    CellCtrl.prototype.processCharacter = function (event) {
        var _a;
        (_a = this.cellKeyboardListenerFeature) === null || _a === void 0 ? void 0 : _a.processCharacter(event);
    };
    CellCtrl.prototype.onKeyDown = function (event) {
        var _a;
        (_a = this.cellKeyboardListenerFeature) === null || _a === void 0 ? void 0 : _a.onKeyDown(event);
    };
    CellCtrl.prototype.onMouseEvent = function (eventName, mouseEvent) {
        var _a;
        (_a = this.cellMouseListenerFeature) === null || _a === void 0 ? void 0 : _a.onMouseEvent(eventName, mouseEvent);
    };
    CellCtrl.prototype.getGui = function () {
        return this.eGui;
    };
    CellCtrl.prototype.refreshToolTip = function () {
        var _a;
        (_a = this.tooltipFeature) === null || _a === void 0 ? void 0 : _a.refreshToolTip();
    };
    CellCtrl.prototype.getColSpanningList = function () {
        return this.cellPositionFeature.getColSpanningList();
    };
    CellCtrl.prototype.onLeftChanged = function () {
        var _a;
        if (!this.cellComp) {
            return;
        }
        (_a = this.cellPositionFeature) === null || _a === void 0 ? void 0 : _a.onLeftChanged();
    };
    CellCtrl.prototype.onDisplayedColumnsChanged = function () {
        if (!this.eGui) {
            return;
        }
        this.refreshAriaColIndex();
        this.refreshFirstAndLastStyles();
    };
    CellCtrl.prototype.refreshFirstAndLastStyles = function () {
        var _a = this, cellComp = _a.cellComp, column = _a.column, beans = _a.beans;
        CssClassApplier.refreshFirstAndLastStyles(cellComp, column, beans.columnModel);
    };
    CellCtrl.prototype.refreshAriaColIndex = function () {
        var colIdx = this.beans.columnModel.getAriaColumnIndex(this.column);
        setAriaColIndex(this.getGui(), colIdx); // for react, we don't use JSX, as it slowed down column moving
    };
    CellCtrl.prototype.isSuppressNavigable = function () {
        return this.column.isSuppressNavigable(this.rowNode);
    };
    CellCtrl.prototype.onWidthChanged = function () {
        var _a;
        return (_a = this.cellPositionFeature) === null || _a === void 0 ? void 0 : _a.onWidthChanged();
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
    CellCtrl.prototype.startRowOrCellEdit = function (key, event) {
        if (event === void 0) { event = null; }
        if (!this.cellComp) {
            return;
        }
        if (this.beans.gridOptionsService.get('editType') === 'fullRow') {
            this.rowCtrl.startRowEditing(key, this);
        }
        else {
            this.startEditing(key, true, event);
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
        if (!this.cellComp) {
            return;
        }
        if (this.cellRangeFeature) {
            this.cellRangeFeature.updateRangeBordersIfRangeCount();
        }
    };
    CellCtrl.prototype.onRangeSelectionChanged = function () {
        if (!this.cellComp) {
            return;
        }
        if (this.cellRangeFeature) {
            this.cellRangeFeature.onRangeSelectionChanged();
        }
    };
    CellCtrl.prototype.isRangeSelectionEnabled = function () {
        return this.cellRangeFeature != null;
    };
    CellCtrl.prototype.focusCell = function (forceBrowserFocus) {
        if (forceBrowserFocus === void 0) { forceBrowserFocus = false; }
        this.beans.focusService.setFocusedCell({
            rowIndex: this.getCellPosition().rowIndex,
            column: this.column,
            rowPinned: this.rowNode.rowPinned,
            forceBrowserFocus: forceBrowserFocus
        });
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
        if (this.beans.gridOptionsService.get('suppressCellFocus')) {
            return;
        }
        var cellFocused = this.beans.focusService.isCellFocused(this.cellPosition);
        if (!this.cellComp) {
            if (cellFocused && (event === null || event === void 0 ? void 0 : event.forceBrowserFocus)) {
                // The cell comp has not been rendered yet, but the browser focus is being forced for this cell
                // so lets save the event to apply it when setComp is called in the next turn.
                this.focusEventToRestore = event;
            }
            return;
        }
        // Clear the saved focus event
        this.focusEventToRestore = undefined;
        this.cellComp.addOrRemoveCssClass(CSS_CELL_FOCUS, cellFocused);
        // see if we need to force browser focus - this can happen if focus is programmatically set
        if (cellFocused && event && event.forceBrowserFocus) {
            var focusEl = this.cellComp.getFocusableElement();
            focusEl.focus({ preventScroll: !!event.preventScrollOnBrowserFocus });
        }
        // if another cell was focused, and we are editing, then stop editing
        var fullRowEdit = this.beans.gridOptionsService.get('editType') === 'fullRow';
        if (!cellFocused && !fullRowEdit && this.editing) {
            this.stopRowOrCellEdit();
        }
    };
    CellCtrl.prototype.createCellPosition = function () {
        this.cellPosition = {
            rowIndex: this.rowNode.rowIndex,
            rowPinned: makeNull(this.rowNode.rowPinned),
            column: this.column
        };
    };
    // CSS Classes that only get applied once, they never change
    CellCtrl.prototype.applyStaticCssClasses = function () {
        this.cellComp.addOrRemoveCssClass(CSS_CELL, true);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_NOT_INLINE_EDITING, true);
        // normal cells fill the height of the row. autoHeight cells have no height to let them
        // fit the height of content.
        var autoHeight = this.column.isAutoHeight() == true;
        this.cellComp.addOrRemoveCssClass(CSS_AUTO_HEIGHT, autoHeight);
        this.cellComp.addOrRemoveCssClass(CSS_NORMAL_HEIGHT, !autoHeight);
    };
    CellCtrl.prototype.onColumnHover = function () {
        if (!this.cellComp) {
            return;
        }
        if (!this.beans.gridOptionsService.get('columnHoverHighlight')) {
            return;
        }
        var isHovered = this.beans.columnHoverService.isHovered(this.column);
        this.cellComp.addOrRemoveCssClass(CSS_COLUMN_HOVER, isHovered);
    };
    CellCtrl.prototype.onColDefChanged = function () {
        var _a, _b;
        if (!this.cellComp) {
            return;
        }
        var isAutoHeight = this.column.isAutoHeight();
        if (isAutoHeight !== this.isAutoHeight) {
            // auto height uses wrappers, so need to destroy
            (_a = this.rowCtrl) === null || _a === void 0 ? void 0 : _a.refreshCell(this);
        }
        var isTooltipEnabled = this.column.isTooltipEnabled();
        if (isTooltipEnabled) {
            this.disableTooltipFeature();
            this.enableTooltipFeature();
            (_b = this.tooltipFeature) === null || _b === void 0 ? void 0 : _b.setComp(this.eGui);
        }
        else {
            this.disableTooltipFeature();
        }
        this.setWrapText();
        if (!this.editing) {
            this.refreshOrDestroyCell({ forceRefresh: true, suppressFlash: true });
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
        this.onCellCompAttachedFuncs = [];
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
        var dndSourceComp = new DndSourceComp(this.rowNode, this.column, this.eGui);
        this.beans.context.createBean(dndSourceComp);
        return dndSourceComp;
    };
    CellCtrl.prototype.registerRowDragger = function (customElement, dragStartPixels, suppressVisibilityChange) {
        var _this = this;
        // if previously existed, then we are only updating
        if (this.customRowDragComp) {
            this.customRowDragComp.setDragElement(customElement, dragStartPixels);
            return;
        }
        var newComp = this.createRowDragComp(customElement, dragStartPixels, suppressVisibilityChange);
        if (newComp) {
            this.customRowDragComp = newComp;
            this.addDestroyFunc(function () { _this.beans.context.destroyBean(newComp); _this.customRowDragComp = null; });
        }
    };
    CellCtrl.prototype.createRowDragComp = function (customElement, dragStartPixels, suppressVisibilityChange) {
        var _this = this;
        var pagination = this.beans.gridOptionsService.get('pagination');
        var rowDragManaged = this.beans.gridOptionsService.get('rowDragManaged');
        var clientSideRowModelActive = this.beans.gridOptionsService.isRowModelType('clientSide');
        if (rowDragManaged) {
            // row dragging only available in default row model
            if (!clientSideRowModelActive) {
                warnOnce('managed row dragging is only allowed in the Client Side Row Model');
                return;
            }
            if (pagination) {
                warnOnce('managed row dragging is not possible when doing pagination');
                return;
            }
        }
        // otherwise (normal case) we are creating a RowDraggingComp for the first time
        var rowDragComp = new RowDragComp(function () { return _this.value; }, this.rowNode, this.column, customElement, dragStartPixels, suppressVisibilityChange);
        this.beans.context.createBean(rowDragComp);
        return rowDragComp;
    };
    CellCtrl.DOM_DATA_KEY_CELL_CTRL = 'cellCtrl';
    return CellCtrl;
}(BeanStub));
export { CellCtrl };
