import { Events } from "../../events.mjs";
import { CellRangeFeature } from "./cellRangeFeature.mjs";
import { exists, makeNull } from "../../utils/generic.mjs";
import { BeanStub } from "../../context/beanStub.mjs";
import { CellPositionFeature } from "./cellPositionFeature.mjs";
import { escapeString } from "../../utils/string.mjs";
import { CellCustomStyleFeature } from "./cellCustomStyleFeature.mjs";
import { TooltipFeature } from "../../widgets/tooltipFeature.mjs";
import { CellMouseListenerFeature } from "./cellMouseListenerFeature.mjs";
import { CellKeyboardListenerFeature } from "./cellKeyboardListenerFeature.mjs";
import { KeyCode } from "../../constants/keyCode.mjs";
import { CheckboxSelectionComponent } from "../checkboxSelectionComponent.mjs";
import { DndSourceComp } from "../dndSourceComp.mjs";
import { warnOnce } from "../../utils/function.mjs";
import { RowDragComp } from "../row/rowDragComp.mjs";
import { getValueUsingField } from "../../utils/object.mjs";
import { getElementSize } from "../../utils/dom.mjs";
import { setAriaColIndex } from "../../utils/aria.mjs";
import { CssClassApplier } from "../../headerRendering/cells/cssClassApplier.mjs";
const CSS_CELL = 'ag-cell';
const CSS_AUTO_HEIGHT = 'ag-cell-auto-height';
const CSS_NORMAL_HEIGHT = 'ag-cell-normal-height';
const CSS_CELL_FOCUS = 'ag-cell-focus';
const CSS_CELL_FIRST_RIGHT_PINNED = 'ag-cell-first-right-pinned';
const CSS_CELL_LAST_LEFT_PINNED = 'ag-cell-last-left-pinned';
const CSS_CELL_NOT_INLINE_EDITING = 'ag-cell-not-inline-editing';
const CSS_COLUMN_HOVER = 'ag-column-hover';
const CSS_CELL_WRAP_TEXT = 'ag-cell-wrap-text';
let instanceIdSequence = 0;
export class CellCtrl extends BeanStub {
    constructor(column, rowNode, beans, rowCtrl) {
        super();
        this.cellRangeFeature = null;
        this.cellPositionFeature = null;
        this.cellCustomStyleFeature = null;
        this.tooltipFeature = null;
        this.cellMouseListenerFeature = null;
        this.cellKeyboardListenerFeature = null;
        this.suppressRefreshCell = false;
        this.onCellCompAttachedFuncs = [];
        this.column = column;
        this.rowNode = rowNode;
        this.beans = beans;
        this.rowCtrl = rowCtrl;
        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        this.instanceId = column.getId() + '-' + instanceIdSequence++;
        const colDef = this.column.getColDef();
        this.colIdSanitised = escapeString(this.column.getId());
        if (!this.beans.gridOptionsService.get('suppressCellFocus')) {
            this.tabIndex = -1;
        }
        this.isCellRenderer = colDef.cellRenderer != null || colDef.cellRendererSelector != null;
        this.createCellPosition();
        this.addFeatures();
        this.updateAndFormatValue(false);
    }
    shouldRestoreFocus() {
        return this.beans.focusService.shouldRestoreFocus(this.cellPosition);
    }
    addFeatures() {
        this.cellPositionFeature = new CellPositionFeature(this, this.beans);
        this.addDestroyFunc(() => { var _a; (_a = this.cellPositionFeature) === null || _a === void 0 ? void 0 : _a.destroy(); this.cellPositionFeature = null; });
        this.cellCustomStyleFeature = new CellCustomStyleFeature(this, this.beans);
        this.addDestroyFunc(() => { var _a; (_a = this.cellCustomStyleFeature) === null || _a === void 0 ? void 0 : _a.destroy(); this.cellCustomStyleFeature = null; });
        this.cellMouseListenerFeature = new CellMouseListenerFeature(this, this.beans, this.column);
        this.addDestroyFunc(() => { var _a; (_a = this.cellMouseListenerFeature) === null || _a === void 0 ? void 0 : _a.destroy(); this.cellMouseListenerFeature = null; });
        this.cellKeyboardListenerFeature = new CellKeyboardListenerFeature(this, this.beans, this.column, this.rowNode, this.rowCtrl);
        this.addDestroyFunc(() => { var _a; (_a = this.cellKeyboardListenerFeature) === null || _a === void 0 ? void 0 : _a.destroy(); this.cellKeyboardListenerFeature = null; });
        if (this.column.isTooltipEnabled()) {
            this.enableTooltipFeature();
            this.addDestroyFunc(() => { this.disableTooltipFeature(); });
        }
        const rangeSelectionEnabled = this.beans.rangeService && this.beans.gridOptionsService.get('enableRangeSelection');
        if (rangeSelectionEnabled) {
            this.cellRangeFeature = new CellRangeFeature(this.beans, this);
            this.addDestroyFunc(() => { var _a; (_a = this.cellRangeFeature) === null || _a === void 0 ? void 0 : _a.destroy(); this.cellRangeFeature = null; });
        }
    }
    enableTooltipFeature() {
        const getTooltipValue = () => {
            const colDef = this.column.getColDef();
            const data = this.rowNode.data;
            if (colDef.tooltipField && exists(data)) {
                return getValueUsingField(data, colDef.tooltipField, this.column.isTooltipFieldContainsDots());
            }
            const valueGetter = colDef.tooltipValueGetter;
            if (valueGetter) {
                return valueGetter({
                    location: 'cell',
                    api: this.beans.gridOptionsService.api,
                    columnApi: this.beans.gridOptionsService.columnApi,
                    context: this.beans.gridOptionsService.context,
                    colDef: this.column.getColDef(),
                    column: this.column,
                    rowIndex: this.cellPosition.rowIndex,
                    node: this.rowNode,
                    data: this.rowNode.data,
                    value: this.value,
                    valueFormatted: this.valueFormatted,
                });
            }
            return null;
        };
        const tooltipCtrl = {
            getColumn: () => this.column,
            getColDef: () => this.column.getColDef(),
            getRowIndex: () => this.cellPosition.rowIndex,
            getRowNode: () => this.rowNode,
            getGui: () => this.getGui(),
            getLocation: () => 'cell',
            getTooltipValue: getTooltipValue,
            // this makes no sense, why is the cell formatted value passed to the tooltip???
            getValueFormatted: () => this.valueFormatted
        };
        this.tooltipFeature = new TooltipFeature(tooltipCtrl, this.beans);
    }
    disableTooltipFeature() {
        if (!this.tooltipFeature) {
            return;
        }
        this.tooltipFeature.destroy();
        this.tooltipFeature = null;
    }
    setComp(comp, eGui, eCellWrapper, printLayout, startEditing) {
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
            this.onCellCompAttachedFuncs.forEach(func => func());
            this.onCellCompAttachedFuncs = [];
        }
    }
    setupAutoHeight(eCellWrapper) {
        this.isAutoHeight = this.column.isAutoHeight();
        if (!this.isAutoHeight || !eCellWrapper) {
            return;
        }
        const eParentCell = eCellWrapper.parentElement;
        // taking minRowHeight from getRowHeightForNode means the getRowHeight() callback is used,
        // thus allowing different min heights for different rows.
        const minRowHeight = this.beans.gridOptionsService.getRowHeightForNode(this.rowNode).height;
        const measureHeight = (timesCalled) => {
            if (this.editing) {
                return;
            }
            // because of the retry's below, it's possible the retry's go beyond
            // the rows life.
            if (!this.isAlive()) {
                return;
            }
            const { paddingTop, paddingBottom, borderBottomWidth, borderTopWidth } = getElementSize(eParentCell);
            const extraHeight = paddingTop + paddingBottom + borderBottomWidth + borderTopWidth;
            const wrapperHeight = eCellWrapper.offsetHeight;
            const autoHeight = wrapperHeight + extraHeight;
            if (timesCalled < 5) {
                // if not in doc yet, means framework not yet inserted, so wait for next VM turn,
                // maybe it will be ready next VM turn
                const doc = this.beans.gridOptionsService.getDocument();
                const notYetInDom = !doc || !doc.contains(eCellWrapper);
                // this happens in React, where React hasn't put any content in. we say 'possibly'
                // as a) may not be React and b) the cell could be empty anyway
                const possiblyNoContentYet = autoHeight == 0;
                if (notYetInDom || possiblyNoContentYet) {
                    this.beans.frameworkOverrides.setTimeout(() => measureHeight(timesCalled + 1), 0);
                    return;
                }
            }
            const newHeight = Math.max(autoHeight, minRowHeight);
            this.rowNode.setRowAutoHeight(newHeight, this.column);
        };
        const listener = () => measureHeight(0);
        // do once to set size in case size doesn't change, common when cell is blank
        listener();
        const destroyResizeObserver = this.beans.resizeObserverService.observeResize(eCellWrapper, listener);
        this.addDestroyFunc(() => {
            destroyResizeObserver();
            this.rowNode.setRowAutoHeight(undefined, this.column);
        });
    }
    getCellAriaRole() {
        var _a;
        return (_a = this.column.getColDef().cellAriaRole) !== null && _a !== void 0 ? _a : 'gridcell';
    }
    getInstanceId() {
        return this.instanceId;
    }
    getIncludeSelection() {
        return this.includeSelection;
    }
    getIncludeRowDrag() {
        return this.includeRowDrag;
    }
    getIncludeDndSource() {
        return this.includeDndSource;
    }
    getColumnIdSanitised() {
        return this.colIdSanitised;
    }
    getTabIndex() {
        return this.tabIndex;
    }
    getIsCellRenderer() {
        return this.isCellRenderer;
    }
    getValueToDisplay() {
        return this.valueFormatted != null ? this.valueFormatted : this.value;
    }
    showValue(forceNewCellRendererInstance = false) {
        const valueToDisplay = this.getValueToDisplay();
        let compDetails;
        if (this.isCellRenderer) {
            const params = this.createCellRendererParams();
            compDetails = this.beans.userComponentFactory.getCellRendererDetails(this.column.getColDef(), params);
        }
        this.cellComp.setRenderDetails(compDetails, valueToDisplay, forceNewCellRendererInstance);
        this.refreshHandle();
    }
    setupControlComps() {
        const colDef = this.column.getColDef();
        this.includeSelection = this.isIncludeControl(colDef.checkboxSelection);
        this.includeRowDrag = this.isIncludeControl(colDef.rowDrag);
        this.includeDndSource = this.isIncludeControl(colDef.dndSource);
        this.cellComp.setIncludeSelection(this.includeSelection);
        this.cellComp.setIncludeDndSource(this.includeDndSource);
        this.cellComp.setIncludeRowDrag(this.includeRowDrag);
    }
    isForceWrapper() {
        // text selection requires the value to be wrapped in another element
        const forceWrapper = this.beans.gridOptionsService.get('enableCellTextSelection') || this.column.isAutoHeight();
        return forceWrapper;
    }
    isIncludeControl(value) {
        const rowNodePinned = this.rowNode.rowPinned != null;
        const isFunc = typeof value === 'function';
        const res = rowNodePinned ? false : isFunc || value === true;
        return res;
    }
    refreshShouldDestroy() {
        const colDef = this.column.getColDef();
        const selectionChanged = this.includeSelection != this.isIncludeControl(colDef.checkboxSelection);
        const rowDragChanged = this.includeRowDrag != this.isIncludeControl(colDef.rowDrag);
        const dndSourceChanged = this.includeDndSource != this.isIncludeControl(colDef.dndSource);
        return selectionChanged || rowDragChanged || dndSourceChanged;
    }
    // either called internally if single cell editing, or called by rowRenderer if row editing
    startEditing(key = null, cellStartedEdit = false, event = null) {
        if (!this.isCellEditable() || this.editing) {
            return;
        }
        // because of async in React, the cellComp may not be set yet, if no cellComp then we are
        // yet to initialise the cell, so we re-schedule this operation for when celLComp is attached
        if (!this.cellComp) {
            this.onCellCompAttachedFuncs.push(() => { this.startEditing(key, cellStartedEdit, event); });
            return;
        }
        const editorParams = this.createCellEditorParams(key, cellStartedEdit);
        const colDef = this.column.getColDef();
        const compDetails = this.beans.userComponentFactory.getCellEditorDetails(colDef, editorParams);
        // if cellEditorSelector was used, we give preference to popup and popupPosition from the selector
        const popup = (compDetails === null || compDetails === void 0 ? void 0 : compDetails.popupFromSelector) != null ? compDetails.popupFromSelector : !!colDef.cellEditorPopup;
        const position = (compDetails === null || compDetails === void 0 ? void 0 : compDetails.popupPositionFromSelector) != null ? compDetails.popupPositionFromSelector : colDef.cellEditorPopupPosition;
        this.setEditing(true);
        this.cellComp.setEditDetails(compDetails, popup, position);
        const e = this.createEvent(event, Events.EVENT_CELL_EDITING_STARTED);
        this.beans.eventService.dispatchEvent(e);
    }
    setEditing(editing) {
        if (this.editing === editing) {
            return;
        }
        this.editing = editing;
        this.refreshHandle();
    }
    // pass in 'true' to cancel the editing.
    stopRowOrCellEdit(cancel = false) {
        if (this.beans.gridOptionsService.get('editType') === 'fullRow') {
            this.rowCtrl.stopRowEditing(cancel);
        }
        else {
            this.stopEditing(cancel);
        }
    }
    onPopupEditorClosed() {
        if (!this.isEditing()) {
            return;
        }
        // note: this happens because of a click outside of the grid or if the popupEditor
        // is closed with `Escape` key. if another cell was clicked, then the editing will
        // have already stopped and returned on the conditional above.
        this.stopEditingAndFocus();
    }
    takeValueFromCellEditor(cancel) {
        const noValueResult = { newValueExists: false };
        if (cancel) {
            return noValueResult;
        }
        const cellEditor = this.cellComp.getCellEditor();
        if (!cellEditor) {
            return noValueResult;
        }
        const userWantsToCancel = cellEditor.isCancelAfterEnd && cellEditor.isCancelAfterEnd();
        if (userWantsToCancel) {
            return noValueResult;
        }
        const newValue = cellEditor.getValue();
        return {
            newValue: newValue,
            newValueExists: true
        };
    }
    /**
     * @returns `True` if the value changes, otherwise `False`.
     */
    saveNewValue(oldValue, newValue) {
        if (newValue === oldValue) {
            return false;
        }
        // we suppressRefreshCell because the call to rowNode.setDataValue() results in change detection
        // getting triggered, which results in all cells getting refreshed. we do not want this refresh
        // to happen on this call as we want to call it explicitly below. otherwise refresh gets called twice.
        // if we only did this refresh (and not the one below) then the cell would flash and not be forced.
        this.suppressRefreshCell = true;
        const valueChanged = this.rowNode.setDataValue(this.column, newValue, 'edit');
        this.suppressRefreshCell = false;
        return valueChanged;
    }
    /**
     * Ends the Cell Editing
     * @param cancel `True` if the edit process is being canceled.
     * @returns `True` if the value of the `GridCell` has been updated, otherwise `False`.
     */
    stopEditing(cancel = false) {
        if (!this.editing) {
            return false;
        }
        const { newValue, newValueExists } = this.takeValueFromCellEditor(cancel);
        const oldValue = this.rowNode.getValueFromValueService(this.column);
        let valueChanged = false;
        if (newValueExists) {
            valueChanged = this.saveNewValue(oldValue, newValue);
        }
        this.setEditing(false);
        this.cellComp.setEditDetails(); // passing nothing stops editing
        this.updateAndFormatValue(false);
        this.refreshCell({ forceRefresh: true, suppressFlash: true });
        this.dispatchEditingStoppedEvent(oldValue, newValue, !cancel && !!valueChanged);
        return valueChanged;
    }
    dispatchEditingStoppedEvent(oldValue, newValue, valueChanged) {
        const editingStoppedEvent = Object.assign(Object.assign({}, this.createEvent(null, Events.EVENT_CELL_EDITING_STOPPED)), { oldValue,
            newValue,
            valueChanged });
        this.beans.eventService.dispatchEvent(editingStoppedEvent);
    }
    createCellEditorParams(key, cellStartedEdit) {
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
    }
    createCellRendererParams() {
        const res = {
            value: this.value,
            valueFormatted: this.valueFormatted,
            getValue: () => this.rowNode.getValueFromValueService(this.column),
            setValue: (value) => this.beans.valueService.setValue(this.rowNode, this.column, value),
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
            registerRowDragger: (rowDraggerElement, dragStartPixels, value, suppressVisibilityChange) => this.registerRowDragger(rowDraggerElement, dragStartPixels, suppressVisibilityChange),
        };
        return res;
    }
    parseValue(newValue) {
        return this.beans.valueParserService.parseValue(this.column, this.rowNode, newValue, this.getValue());
    }
    setFocusOutOnEditor() {
        if (!this.editing) {
            return;
        }
        const cellEditor = this.cellComp.getCellEditor();
        if (cellEditor && cellEditor.focusOut) {
            cellEditor.focusOut();
        }
    }
    setFocusInOnEditor() {
        if (!this.editing) {
            return;
        }
        const cellEditor = this.cellComp.getCellEditor();
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
    }
    onCellChanged(event) {
        const eventImpactsThisCell = event.column === this.column;
        if (eventImpactsThisCell) {
            this.refreshCell({});
        }
    }
    refreshOrDestroyCell(params) {
        var _a;
        if (this.refreshShouldDestroy()) {
            (_a = this.rowCtrl) === null || _a === void 0 ? void 0 : _a.refreshCell(this);
        }
        else {
            this.refreshCell(params);
        }
    }
    // + stop editing {forceRefresh: true, suppressFlash: true}
    // + event cellChanged {}
    // + cellRenderer.params.refresh() {} -> method passes 'as is' to the cellRenderer, so params could be anything
    // + rowCtrl: event dataChanged {suppressFlash: !update, newData: !update}
    // + rowCtrl: api refreshCells() {animate: true/false}
    // + rowRenderer: api softRefreshView() {}
    refreshCell(params) {
        var _a, _b, _c;
        // if we are in the middle of 'stopEditing', then we don't refresh here, as refresh gets called explicitly
        if (this.suppressRefreshCell || this.editing) {
            return;
        }
        const colDef = this.column.getColDef();
        const newData = params != null && !!params.newData;
        const suppressFlash = (params != null && !!params.suppressFlash) || !!colDef.suppressCellFlash;
        // we always refresh if cell has no value - this can happen when user provides Cell Renderer and the
        // cell renderer doesn't rely on a value, instead it could be looking directly at the data, or maybe
        // printing the current time (which would be silly)???. Generally speaking
        // non of {field, valueGetter, showRowGroup} is bad in the users application, however for this edge case, it's
        // best always refresh and take the performance hit rather than never refresh and users complaining in support
        // that cells are not updating.
        const noValueProvided = colDef.field == null && colDef.valueGetter == null && colDef.showRowGroup == null;
        const forceRefresh = (params && params.forceRefresh) || noValueProvided || newData;
        const isCellCompReady = !!this.cellComp;
        // Only worth comparing values if the cellComp is ready
        const valuesDifferent = this.updateAndFormatValue(isCellCompReady);
        const dataNeedsUpdating = forceRefresh || valuesDifferent;
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
            const processingFilterChange = this.beans.filterManager.isSuppressFlashingCellsBecauseFiltering();
            const flashCell = !suppressFlash && !processingFilterChange &&
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
    }
    // cell editors call this, when they want to stop for reasons other
    // than what we pick up on. eg selecting from a dropdown ends editing.
    stopEditingAndFocus(suppressNavigateAfterEdit = false, shiftKey = false) {
        this.stopRowOrCellEdit();
        this.focusCell(true);
        if (!suppressNavigateAfterEdit) {
            this.navigateAfterEdit(shiftKey);
        }
    }
    navigateAfterEdit(shiftKey) {
        const enterNavigatesVerticallyAfterEdit = this.beans.gridOptionsService.get('enterNavigatesVerticallyAfterEdit');
        if (enterNavigatesVerticallyAfterEdit) {
            const key = shiftKey ? KeyCode.UP : KeyCode.DOWN;
            this.beans.navigationService.navigateToNextCell(null, key, this.getCellPosition(), false);
        }
    }
    // user can also call this via API
    flashCell(delays) {
        const flashDelay = delays && delays.flashDelay;
        const fadeDelay = delays && delays.fadeDelay;
        this.animateCell('data-changed', flashDelay, fadeDelay);
    }
    animateCell(cssName, flashDelay, fadeDelay) {
        if (!this.cellComp) {
            return;
        }
        const fullName = `ag-cell-${cssName}`;
        const animationFullName = `ag-cell-${cssName}-animation`;
        const { gridOptionsService } = this.beans;
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
        window.setTimeout(() => {
            if (!this.isAlive()) {
                return;
            }
            this.cellComp.addOrRemoveCssClass(fullName, false);
            this.cellComp.addOrRemoveCssClass(animationFullName, true);
            this.eGui.style.transition = `background-color ${fadeDelay}ms`;
            window.setTimeout(() => {
                if (!this.isAlive()) {
                    return;
                }
                // and then to leave things as we got them, we remove the animation
                this.cellComp.addOrRemoveCssClass(animationFullName, false);
                this.eGui.style.transition = '';
            }, fadeDelay);
        }, flashDelay);
    }
    onFlashCells(event) {
        if (!this.cellComp) {
            return;
        }
        const cellId = this.beans.cellPositionUtils.createId(this.getCellPosition());
        const shouldFlash = event.cells[cellId];
        if (shouldFlash) {
            this.animateCell('highlight');
        }
    }
    isCellEditable() {
        return this.column.isCellEditable(this.rowNode);
    }
    isSuppressFillHandle() {
        return this.column.isSuppressFillHandle();
    }
    formatValue(value) {
        var _a;
        return (_a = this.callValueFormatter(value)) !== null && _a !== void 0 ? _a : value;
    }
    callValueFormatter(value) {
        return this.beans.valueFormatterService.formatValue(this.column, this.rowNode, value);
    }
    updateAndFormatValue(compareValues) {
        const oldValue = this.value;
        const oldValueFormatted = this.valueFormatted;
        this.value = this.rowNode.getValueFromValueService(this.column);
        this.valueFormatted = this.callValueFormatter(this.value);
        if (compareValues) {
            return !this.valuesAreEqual(oldValue, this.value) || this.valueFormatted != oldValueFormatted;
        }
        return true;
    }
    valuesAreEqual(val1, val2) {
        // if the user provided an equals method, use that, otherwise do simple comparison
        const colDef = this.column.getColDef();
        return colDef.equals ? colDef.equals(val1, val2) : val1 === val2;
    }
    getComp() {
        return this.cellComp;
    }
    getValue() {
        return this.value;
    }
    getValueFormatted() {
        return this.valueFormatted;
    }
    addDomData() {
        const element = this.getGui();
        this.beans.gridOptionsService.setDomData(element, CellCtrl.DOM_DATA_KEY_CELL_CTRL, this);
        this.addDestroyFunc(() => this.beans.gridOptionsService.setDomData(element, CellCtrl.DOM_DATA_KEY_CELL_CTRL, null));
    }
    createEvent(domEvent, eventType) {
        const event = {
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
    }
    processCharacter(event) {
        var _a;
        (_a = this.cellKeyboardListenerFeature) === null || _a === void 0 ? void 0 : _a.processCharacter(event);
    }
    onKeyDown(event) {
        var _a;
        (_a = this.cellKeyboardListenerFeature) === null || _a === void 0 ? void 0 : _a.onKeyDown(event);
    }
    onMouseEvent(eventName, mouseEvent) {
        var _a;
        (_a = this.cellMouseListenerFeature) === null || _a === void 0 ? void 0 : _a.onMouseEvent(eventName, mouseEvent);
    }
    getGui() {
        return this.eGui;
    }
    refreshToolTip() {
        var _a;
        (_a = this.tooltipFeature) === null || _a === void 0 ? void 0 : _a.refreshToolTip();
    }
    getColSpanningList() {
        return this.cellPositionFeature.getColSpanningList();
    }
    onLeftChanged() {
        var _a;
        if (!this.cellComp) {
            return;
        }
        (_a = this.cellPositionFeature) === null || _a === void 0 ? void 0 : _a.onLeftChanged();
    }
    onDisplayedColumnsChanged() {
        if (!this.eGui) {
            return;
        }
        this.refreshAriaColIndex();
        this.refreshFirstAndLastStyles();
    }
    refreshFirstAndLastStyles() {
        const { cellComp, column, beans } = this;
        CssClassApplier.refreshFirstAndLastStyles(cellComp, column, beans.columnModel);
    }
    refreshAriaColIndex() {
        const colIdx = this.beans.columnModel.getAriaColumnIndex(this.column);
        setAriaColIndex(this.getGui(), colIdx); // for react, we don't use JSX, as it slowed down column moving
    }
    isSuppressNavigable() {
        return this.column.isSuppressNavigable(this.rowNode);
    }
    onWidthChanged() {
        var _a;
        return (_a = this.cellPositionFeature) === null || _a === void 0 ? void 0 : _a.onWidthChanged();
    }
    getColumn() {
        return this.column;
    }
    getRowNode() {
        return this.rowNode;
    }
    getBeans() {
        return this.beans;
    }
    isPrintLayout() {
        return this.printLayout;
    }
    appendChild(htmlElement) {
        this.eGui.appendChild(htmlElement);
    }
    refreshHandle() {
        if (this.cellRangeFeature) {
            this.cellRangeFeature.refreshHandle();
        }
    }
    getCellPosition() {
        return this.cellPosition;
    }
    isEditing() {
        return this.editing;
    }
    // called by rowRenderer when user navigates via tab key
    startRowOrCellEdit(key, event = null) {
        if (!this.cellComp) {
            return;
        }
        if (this.beans.gridOptionsService.get('editType') === 'fullRow') {
            this.rowCtrl.startRowEditing(key, this);
        }
        else {
            this.startEditing(key, true, event);
        }
    }
    getRowCtrl() {
        return this.rowCtrl;
    }
    getRowPosition() {
        return {
            rowIndex: this.cellPosition.rowIndex,
            rowPinned: this.cellPosition.rowPinned
        };
    }
    updateRangeBordersIfRangeCount() {
        if (!this.cellComp) {
            return;
        }
        if (this.cellRangeFeature) {
            this.cellRangeFeature.updateRangeBordersIfRangeCount();
        }
    }
    onRangeSelectionChanged() {
        if (!this.cellComp) {
            return;
        }
        if (this.cellRangeFeature) {
            this.cellRangeFeature.onRangeSelectionChanged();
        }
    }
    isRangeSelectionEnabled() {
        return this.cellRangeFeature != null;
    }
    focusCell(forceBrowserFocus = false) {
        this.beans.focusService.setFocusedCell({
            rowIndex: this.getCellPosition().rowIndex,
            column: this.column,
            rowPinned: this.rowNode.rowPinned,
            forceBrowserFocus
        });
    }
    onRowIndexChanged() {
        // when index changes, this influences items that need the index, so we update the
        // grid cell so they are working off the new index.
        this.createCellPosition();
        // when the index of the row changes, ie means the cell may have lost or gained focus
        this.onCellFocused();
        // check range selection
        if (this.cellRangeFeature) {
            this.cellRangeFeature.onRangeSelectionChanged();
        }
    }
    onFirstRightPinnedChanged() {
        if (!this.cellComp) {
            return;
        }
        const firstRightPinned = this.column.isFirstRightPinned();
        this.cellComp.addOrRemoveCssClass(CSS_CELL_FIRST_RIGHT_PINNED, firstRightPinned);
    }
    onLastLeftPinnedChanged() {
        if (!this.cellComp) {
            return;
        }
        const lastLeftPinned = this.column.isLastLeftPinned();
        this.cellComp.addOrRemoveCssClass(CSS_CELL_LAST_LEFT_PINNED, lastLeftPinned);
    }
    onCellFocused(event) {
        if (this.beans.gridOptionsService.get('suppressCellFocus')) {
            return;
        }
        const cellFocused = this.beans.focusService.isCellFocused(this.cellPosition);
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
            const focusEl = this.cellComp.getFocusableElement();
            focusEl.focus({ preventScroll: !!event.preventScrollOnBrowserFocus });
        }
        // if another cell was focused, and we are editing, then stop editing
        const fullRowEdit = this.beans.gridOptionsService.get('editType') === 'fullRow';
        if (!cellFocused && !fullRowEdit && this.editing) {
            this.stopRowOrCellEdit();
        }
    }
    createCellPosition() {
        this.cellPosition = {
            rowIndex: this.rowNode.rowIndex,
            rowPinned: makeNull(this.rowNode.rowPinned),
            column: this.column
        };
    }
    // CSS Classes that only get applied once, they never change
    applyStaticCssClasses() {
        this.cellComp.addOrRemoveCssClass(CSS_CELL, true);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_NOT_INLINE_EDITING, true);
        // normal cells fill the height of the row. autoHeight cells have no height to let them
        // fit the height of content.
        const autoHeight = this.column.isAutoHeight() == true;
        this.cellComp.addOrRemoveCssClass(CSS_AUTO_HEIGHT, autoHeight);
        this.cellComp.addOrRemoveCssClass(CSS_NORMAL_HEIGHT, !autoHeight);
    }
    onColumnHover() {
        if (!this.cellComp) {
            return;
        }
        if (!this.beans.gridOptionsService.get('columnHoverHighlight')) {
            return;
        }
        const isHovered = this.beans.columnHoverService.isHovered(this.column);
        this.cellComp.addOrRemoveCssClass(CSS_COLUMN_HOVER, isHovered);
    }
    onColDefChanged() {
        var _a, _b;
        if (!this.cellComp) {
            return;
        }
        const isAutoHeight = this.column.isAutoHeight();
        if (isAutoHeight !== this.isAutoHeight) {
            // auto height uses wrappers, so need to destroy
            (_a = this.rowCtrl) === null || _a === void 0 ? void 0 : _a.refreshCell(this);
        }
        const isTooltipEnabled = this.column.isTooltipEnabled();
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
    }
    setWrapText() {
        const value = this.column.getColDef().wrapText == true;
        this.cellComp.addOrRemoveCssClass(CSS_CELL_WRAP_TEXT, value);
    }
    dispatchCellContextMenuEvent(event) {
        const colDef = this.column.getColDef();
        const cellContextMenuEvent = this.createEvent(event, Events.EVENT_CELL_CONTEXT_MENU);
        this.beans.eventService.dispatchEvent(cellContextMenuEvent);
        if (colDef.onCellContextMenu) {
            // to make the callback async, do in a timeout
            window.setTimeout(() => colDef.onCellContextMenu(cellContextMenuEvent), 0);
        }
    }
    getCellRenderer() {
        return this.cellComp ? this.cellComp.getCellRenderer() : null;
    }
    getCellEditor() {
        return this.cellComp ? this.cellComp.getCellEditor() : null;
    }
    destroy() {
        this.onCellCompAttachedFuncs = [];
        super.destroy();
    }
    createSelectionCheckbox() {
        const cbSelectionComponent = new CheckboxSelectionComponent();
        this.beans.context.createBean(cbSelectionComponent);
        cbSelectionComponent.init({ rowNode: this.rowNode, column: this.column });
        // put the checkbox in before the value
        return cbSelectionComponent;
    }
    createDndSource() {
        const dndSourceComp = new DndSourceComp(this.rowNode, this.column, this.eGui);
        this.beans.context.createBean(dndSourceComp);
        return dndSourceComp;
    }
    registerRowDragger(customElement, dragStartPixels, suppressVisibilityChange) {
        // if previously existed, then we are only updating
        if (this.customRowDragComp) {
            this.customRowDragComp.setDragElement(customElement, dragStartPixels);
            return;
        }
        const newComp = this.createRowDragComp(customElement, dragStartPixels, suppressVisibilityChange);
        if (newComp) {
            this.customRowDragComp = newComp;
            this.addDestroyFunc(() => { this.beans.context.destroyBean(newComp); this.customRowDragComp = null; });
        }
    }
    createRowDragComp(customElement, dragStartPixels, suppressVisibilityChange) {
        const pagination = this.beans.gridOptionsService.get('pagination');
        const rowDragManaged = this.beans.gridOptionsService.get('rowDragManaged');
        const clientSideRowModelActive = this.beans.gridOptionsService.isRowModelType('clientSide');
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
        const rowDragComp = new RowDragComp(() => this.value, this.rowNode, this.column, customElement, dragStartPixels, suppressVisibilityChange);
        this.beans.context.createBean(rowDragComp);
        return rowDragComp;
    }
}
CellCtrl.DOM_DATA_KEY_CELL_CTRL = 'cellCtrl';
