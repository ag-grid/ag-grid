/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
import { doOnce } from "../../utils/function";
import { RowDragComp } from "../row/rowDragComp";
import { getValueUsingField } from "../../utils/object";
import { getElementSize } from "../../utils/dom";
import { setAriaColIndex } from "../../utils/aria";
const CSS_CELL = 'ag-cell';
const CSS_AUTO_HEIGHT = 'ag-cell-auto-height';
const CSS_NORMAL_HEIGHT = 'ag-cell-normal-height';
const CSS_CELL_FOCUS = 'ag-cell-focus';
const CSS_CELL_FIRST_RIGHT_PINNED = 'ag-cell-first-right-pinned';
const CSS_CELL_LAST_LEFT_PINNED = 'ag-cell-last-left-pinned';
const CSS_CELL_NOT_INLINE_EDITING = 'ag-cell-not-inline-editing';
const CSS_CELL_INLINE_EDITING = 'ag-cell-inline-editing';
const CSS_CELL_POPUP_EDITING = 'ag-cell-popup-editing';
const CSS_COLUMN_HOVER = 'ag-column-hover';
const CSS_CELL_WRAP_TEXT = 'ag-cell-wrap-text';
let instanceIdSequence = 0;
export class CellCtrl extends BeanStub {
    constructor(column, rowNode, beans, rowCtrl) {
        super();
        this.suppressRefreshCell = false;
        this.onCellCompAttachedFuncs = [];
        this.column = column;
        this.rowNode = rowNode;
        this.beans = beans;
        this.rowCtrl = rowCtrl;
        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        this.instanceId = column.getId() + '-' + instanceIdSequence++;
        this.createCellPosition();
        this.addFeatures();
    }
    addFeatures() {
        this.cellPositionFeature = new CellPositionFeature(this, this.beans);
        this.addDestroyFunc(() => this.cellPositionFeature.destroy());
        this.cellCustomStyleFeature = new CellCustomStyleFeature(this, this.beans);
        this.addDestroyFunc(() => this.cellCustomStyleFeature.destroy());
        this.cellMouseListenerFeature = new CellMouseListenerFeature(this, this.beans, this.column);
        this.addDestroyFunc(() => this.cellMouseListenerFeature.destroy());
        this.cellKeyboardListenerFeature = new CellKeyboardListenerFeature(this, this.beans, this.column, this.rowNode, this.rowCtrl);
        this.addDestroyFunc(() => this.cellKeyboardListenerFeature.destroy());
        const rangeSelectionEnabled = this.beans.rangeService && this.beans.gridOptionsWrapper.isEnableRangeSelection();
        if (rangeSelectionEnabled) {
            this.cellRangeFeature = new CellRangeFeature(this.beans, this);
            this.addDestroyFunc(() => this.cellRangeFeature.destroy());
        }
        this.addTooltipFeature();
    }
    addTooltipFeature() {
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
                    api: this.beans.gridOptionsWrapper.getApi(),
                    columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
                    context: this.beans.gridOptionsWrapper.getContext(),
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
        this.addDestroyFunc(() => this.tooltipFeature.destroy());
    }
    setComp(comp, eGui, eCellWrapper, printLayout, startEditing) {
        this.cellComp = comp;
        this.gow = this.beans.gridOptionsWrapper;
        this.eGui = eGui;
        this.eCellWrapper = eCellWrapper;
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
        this.setupAutoHeight();
        this.setAriaColIndex();
        if (!this.gow.isSuppressCellFocus()) {
            this.cellComp.setTabIndex(-1);
        }
        const colIdSanitised = escapeString(this.column.getId());
        this.cellComp.setColId(colIdSanitised);
        this.cellComp.setRole('gridcell');
        this.cellPositionFeature.setComp(eGui);
        this.cellCustomStyleFeature.setComp(comp);
        this.tooltipFeature.setComp(comp);
        this.cellKeyboardListenerFeature.setComp(this.eGui);
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
    setupAutoHeight() {
        if (!this.column.isAutoHeight()) {
            return;
        }
        const eAutoHeightContainer = this.eCellWrapper;
        const eParentCell = eAutoHeightContainer.parentElement;
        // taking minRowHeight from getRowHeightForNode means the getRowHeight() callback is used,
        // thus allowing different min heights for different rows.
        const minRowHeight = this.beans.gridOptionsWrapper.getRowHeightForNode(this.rowNode).height;
        const measureHeight = (timesCalled) => {
            if (this.editing) {
                return;
            }
            // because of the retry's below, it's possible the retry's go beyond
            // the rows life.
            if (!this.isAlive()) {
                return;
            }
            const { paddingTop, paddingBottom } = getElementSize(eParentCell);
            const wrapperHeight = eAutoHeightContainer.offsetHeight;
            const autoHeight = wrapperHeight + paddingTop + paddingBottom;
            if (timesCalled < 5) {
                // if not in doc yet, means framework not yet inserted, so wait for next VM turn,
                // maybe it will be ready next VM turn
                const doc = this.beans.gridOptionsWrapper.getDocument();
                const notYetInDom = !doc || !doc.contains(eAutoHeightContainer);
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
        const destroyResizeObserver = this.beans.resizeObserverService.observeResize(eAutoHeightContainer, listener);
        this.addDestroyFunc(() => {
            destroyResizeObserver();
            this.rowNode.setRowAutoHeight(undefined, this.column);
        });
    }
    getInstanceId() {
        return this.instanceId;
    }
    showValue(forceNewCellRendererInstance = false) {
        const valueToDisplay = this.valueFormatted != null ? this.valueFormatted : this.value;
        const params = this.createCellRendererParams();
        const compDetails = this.beans.userComponentFactory.getCellRendererDetails(this.column.getColDef(), params);
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
        const forceWrapper = this.beans.gridOptionsWrapper.isEnableCellTextSelection() || this.column.isAutoHeight();
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
    startEditing(key = null, charPress = null, cellStartedEdit = false, event = null) {
        var _a, _b;
        if (!this.isCellEditable() || this.editing) {
            return;
        }
        // because of async in React, the cellComp may not be set yet, if no cellComp then we are
        // yet to initialise the cell, so we re-schedule this operation for when celLComp is attached
        if (!this.cellComp) {
            this.onCellCompAttachedFuncs.push(() => { this.startEditing(key, charPress, cellStartedEdit, event); });
            return;
        }
        const editorParams = this.createCellEditorParams(key, charPress, cellStartedEdit);
        const colDef = this.column.getColDef();
        const compDetails = this.beans.userComponentFactory.getCellEditorDetails(colDef, editorParams);
        // if cellEditorSelector was used, we give preference to popup and popupPosition from the selector
        const popup = ((_a = compDetails) === null || _a === void 0 ? void 0 : _a.popupFromSelector) != null ? compDetails.popupFromSelector : !!colDef.cellEditorPopup;
        const position = ((_b = compDetails) === null || _b === void 0 ? void 0 : _b.popupPositionFromSelector) != null ? compDetails.popupPositionFromSelector : colDef.cellEditorPopupPosition;
        this.setEditing(true, popup);
        this.cellComp.setEditDetails(compDetails, popup, position);
        const e = this.createEvent(event, Events.EVENT_CELL_EDITING_STARTED);
        this.beans.eventService.dispatchEvent(e);
    }
    setEditing(editing, inPopup = false) {
        if (this.editing === editing) {
            return;
        }
        this.editing = editing;
        this.editingInPopup = inPopup;
        this.setInlineEditingClass();
        this.refreshHandle();
    }
    // pass in 'true' to cancel the editing.
    stopRowOrCellEdit(cancel = false) {
        if (this.beans.gridOptionsWrapper.isFullRowEdit()) {
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
        if (this.beans.gridOptionsWrapper.isReadOnlyEdit()) {
            this.dispatchEventForSaveValueReadOnly(oldValue, newValue);
            return false;
        }
        // we suppressRefreshCell because the call to rowNode.setDataValue() results in change detection
        // getting triggered, which results in all cells getting refreshed. we do not want this refresh
        // to happen on this call as we want to call it explicitly below. otherwise refresh gets called twice.
        // if we only did this refresh (and not the one below) then the cell would flash and not be forced.
        this.suppressRefreshCell = true;
        const valueChanged = this.rowNode.setDataValue(this.column, newValue);
        this.suppressRefreshCell = false;
        return valueChanged;
    }
    dispatchEventForSaveValueReadOnly(oldValue, newValue) {
        const rowNode = this.rowNode;
        const event = {
            type: Events.EVENT_CELL_EDIT_REQUEST,
            event: null,
            rowIndex: rowNode.rowIndex,
            rowPinned: rowNode.rowPinned,
            column: this.column,
            api: this.beans.gridApi,
            columnApi: this.beans.columnApi,
            colDef: this.column.getColDef(),
            context: this.beans.gridOptionsWrapper.getContext(),
            data: rowNode.data,
            node: rowNode,
            oldValue,
            newValue,
            value: newValue,
            source: undefined
        };
        this.beans.eventService.dispatchEvent(event);
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
        const oldValue = this.getValueFromValueService();
        let valueChanged = false;
        if (newValueExists) {
            valueChanged = this.saveNewValue(oldValue, newValue);
        }
        this.setEditing(false);
        this.cellComp.setEditDetails(); // passing nothing stops editing
        this.updateAndFormatValue();
        this.refreshCell({ forceRefresh: true, suppressFlash: true });
        this.dispatchEditingStoppedEvent(oldValue, newValue);
        return valueChanged;
    }
    dispatchEditingStoppedEvent(oldValue, newValue) {
        const editingStoppedEvent = Object.assign(Object.assign({}, this.createEvent(null, Events.EVENT_CELL_EDITING_STOPPED)), { oldValue,
            newValue });
        this.beans.eventService.dispatchEvent(editingStoppedEvent);
    }
    // if we are editing inline, then we don't have the padding in the cell (set in the themes)
    // to allow the text editor full access to the entire cell
    setInlineEditingClass() {
        if (!this.isAlive()) {
            return;
        }
        // because of async in React, the cellComp may not be set yet, if no cellComp then we are
        // yet to initialise the cell, so we re-schedule this operation for when celLComp is attached
        if (!this.cellComp) {
            this.onCellCompAttachedFuncs.push(() => { this.setInlineEditingClass(); });
            return;
        }
        // ag-cell-inline-editing - appears when user is inline editing
        // ag-cell-not-inline-editing - appears when user is no inline editing
        // ag-cell-popup-editing - appears when user is editing cell in popup (appears on the cell, not on the popup)
        // note: one of {ag-cell-inline-editing, ag-cell-not-inline-editing} is always present, they toggle.
        //       however {ag-cell-popup-editing} shows when popup, so you have both {ag-cell-popup-editing}
        //       and {ag-cell-not-inline-editing} showing at the same time.
        const editingInline = this.editing && !this.editingInPopup;
        const popupEditorShowing = this.editing && this.editingInPopup;
        this.cellComp.addOrRemoveCssClass(CSS_CELL_INLINE_EDITING, editingInline);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_NOT_INLINE_EDITING, !editingInline);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_POPUP_EDITING, popupEditorShowing);
        this.rowCtrl.setInlineEditingCss(this.editing);
    }
    // this is needed as the JS CellComp still allows isPopup() on the CellEditor class, so
    // it's possible the editor is in a popup even though it's not configured via the colDef as so
    hackSayEditingInPopup() {
        if (this.editingInPopup) {
            return;
        }
        this.editingInPopup = true;
        this.setInlineEditingClass();
    }
    createCellEditorParams(key, charPress, cellStartedEdit) {
        const res = {
            value: this.getValueFromValueService(),
            key: key,
            eventKey: key,
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
        return res;
    }
    createCellRendererParams() {
        const addRowCompListener = (eventType, listener) => {
            console.warn('AG Grid: since AG Grid v26, params.addRowCompListener() is deprecated. If you need this functionality, please contact AG Grid support and advise why so that we can revert with an appropriate workaround, as we dont have any valid use cases for it. This method was originally provided as a work around to know when cells were destroyed in AG Grid before custom Cell Renderers could be provided.');
            this.rowCtrl.addEventListener(eventType, listener);
        };
        const res = {
            value: this.value,
            valueFormatted: this.valueFormatted,
            getValue: this.getValueFromValueService.bind(this),
            setValue: (value) => this.beans.valueService.setValue(this.rowNode, this.column, value),
            formatValue: this.formatValue.bind(this),
            data: this.rowNode.data,
            node: this.rowNode,
            pinned: this.column.getPinned(),
            colDef: this.column.getColDef(),
            column: this.column,
            rowIndex: this.getCellPosition().rowIndex,
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext(),
            refreshCell: this.refreshCell.bind(this),
            eGridCell: this.getGui(),
            eParentOfValue: this.cellComp.getParentOfValue(),
            registerRowDragger: (rowDraggerElement, dragStartPixels, value, suppressVisibilityChange) => this.registerRowDragger(rowDraggerElement, dragStartPixels, suppressVisibilityChange),
            // this function is not documented anywhere, so we could drop it
            // it was in the olden days to allow user to register for when rendered
            // row was removed (the row comp was removed), however now that the user
            // can provide components for cells, the destroy method gets call when this
            // happens so no longer need to fire event.
            addRowCompListener: addRowCompListener
        };
        return res;
    }
    parseValue(newValue) {
        const colDef = this.column.getColDef();
        const params = {
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
        const valueParser = colDef.valueParser;
        return exists(valueParser) ? this.beans.expressionService.evaluate(valueParser, params) : newValue;
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
        // because of async in React, the cellComp may not be set yet, if no cellComp then we are
        // yet to initialise the cell, so no need to refresh.
        if (!this.cellComp) {
            return;
        }
        const eventImpactsThisCell = event.column === this.column;
        if (eventImpactsThisCell) {
            this.refreshCell({});
        }
    }
    // + stop editing {forceRefresh: true, suppressFlash: true}
    // + event cellChanged {}
    // + cellRenderer.params.refresh() {} -> method passes 'as is' to the cellRenderer, so params could be anything
    // + rowCtrl: event dataChanged {suppressFlash: !update, newData: !update}
    // + rowCtrl: api refreshCells() {animate: true/false}
    // + rowRenderer: api softRefreshView() {}
    refreshCell(params) {
        // if we are in the middle of 'stopEditing', then we don't refresh here, as refresh gets called explicitly
        if (this.suppressRefreshCell || this.editing) {
            return;
        }
        // In React, due to async, it's possible a refresh was asked for before the CellComp
        // has been set. If this happens, we skip the refresh, as the cell is going to be
        // initialised anyway once the CellComp is set.
        if (!this.cellComp) {
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
        const valuesDifferent = this.updateAndFormatValue();
        const dataNeedsUpdating = forceRefresh || valuesDifferent;
        if (dataNeedsUpdating) {
            // if it's 'new data', then we don't refresh the cellRenderer, even if refresh method is available.
            // this is because if the whole data is new (ie we are showing stock price 'BBA' now and not 'SSD')
            // then we are not showing a movement in the stock price, rather we are showing different stock.
            this.showValue(newData);
            // we don't want to flash the cells when processing a filter change, as otherwise the UI would
            // be to busy. see comment in FilterManager with regards processingFilterChange
            const processingFilterChange = this.beans.filterManager.isSuppressFlashingCellsBecauseFiltering();
            const flashCell = !suppressFlash && !processingFilterChange &&
                (this.beans.gridOptionsWrapper.isEnableCellChangeFlash() || colDef.enableCellChangeFlash);
            if (flashCell) {
                this.flashCell();
            }
            this.cellCustomStyleFeature.applyUserStyles();
            this.cellCustomStyleFeature.applyClassesFromColDef();
        }
        this.refreshToolTip();
        // we do cellClassRules even if the value has not changed, so that users who have rules that
        // look at other parts of the row (where the other part of the row might of changed) will work.
        this.cellCustomStyleFeature.applyCellClassRules();
    }
    // cell editors call this, when they want to stop for reasons other
    // than what we pick up on. eg selecting from a dropdown ends editing.
    stopEditingAndFocus(suppressNavigateAfterEdit = false) {
        this.stopRowOrCellEdit();
        this.focusCell(true);
        if (!suppressNavigateAfterEdit) {
            this.navigateAfterEdit();
        }
    }
    navigateAfterEdit() {
        const fullRowEdit = this.beans.gridOptionsWrapper.isFullRowEdit();
        if (fullRowEdit) {
            return;
        }
        const enterMovesDownAfterEdit = this.beans.gridOptionsWrapper.isEnterMovesDownAfterEdit();
        if (enterMovesDownAfterEdit) {
            this.beans.navigationService.navigateToNextCell(null, KeyCode.DOWN, this.getCellPosition(), false);
        }
    }
    // user can also call this via API
    flashCell(delays) {
        const flashDelay = delays && delays.flashDelay;
        const fadeDelay = delays && delays.fadeDelay;
        this.animateCell('data-changed', flashDelay, fadeDelay);
    }
    animateCell(cssName, flashDelay, fadeDelay) {
        const fullName = `ag-cell-${cssName}`;
        const animationFullName = `ag-cell-${cssName}-animation`;
        const { gridOptionsWrapper } = this.beans;
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
        const res = this.callValueFormatter(value);
        return res != null ? res : value;
    }
    callValueFormatter(value) {
        return this.beans.valueFormatterService.formatValue(this.column, this.rowNode, value);
    }
    updateAndFormatValue(force = false) {
        const oldValue = this.value;
        const oldValueFormatted = this.valueFormatted;
        this.value = this.getValueFromValueService();
        this.valueFormatted = this.callValueFormatter(this.value);
        const valuesDifferent = force ? true :
            !this.valuesAreEqual(oldValue, this.value) || this.valueFormatted != oldValueFormatted;
        return valuesDifferent;
    }
    valuesAreEqual(val1, val2) {
        var _a, _b;
        // if the user provided an equals method, use that, otherwise do simple comparison
        const colDef = this.column.getColDef();
        return colDef.equals ? colDef.equals(val1, val2) : typeof val1 === typeof val2 && ((_a = val1) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = val2) === null || _b === void 0 ? void 0 : _b.toString());
    }
    getComp() {
        return this.cellComp;
    }
    getValueFromValueService() {
        // if we don't check this, then the grid will render leaf groups as open even if we are not
        // allowing the user to open leaf groups. confused? remember for pivot mode we don't allow
        // opening leaf groups, so we have to force leafGroups to be closed in case the user expanded
        // them via the API, or user user expanded them in the UI before turning on pivot mode
        const lockedClosedGroup = this.rowNode.leafGroup && this.beans.columnModel.isPivotMode();
        const isOpenGroup = this.rowNode.group && this.rowNode.expanded && !this.rowNode.footer && !lockedClosedGroup;
        // are we showing group footers
        const groupFootersEnabled = this.beans.gridOptionsWrapper.isGroupIncludeFooter();
        // if doing footers, we normally don't show agg data at group level when group is open
        const groupAlwaysShowAggData = this.beans.gridOptionsWrapper.isGroupSuppressBlankHeader();
        // if doing grouping and footers, we don't want to include the agg value
        // in the header when the group is open
        const ignoreAggData = (isOpenGroup && groupFootersEnabled) && !groupAlwaysShowAggData;
        const value = this.beans.valueService.getValue(this.column, this.rowNode, false, ignoreAggData);
        return value;
    }
    getValue() {
        return this.value;
    }
    getValueFormatted() {
        return this.valueFormatted;
    }
    addDomData() {
        const element = this.getGui();
        this.beans.gridOptionsWrapper.setDomData(element, CellCtrl.DOM_DATA_KEY_CELL_CTRL, this);
        this.addDestroyFunc(() => this.beans.gridOptionsWrapper.setDomData(element, CellCtrl.DOM_DATA_KEY_CELL_CTRL, null));
    }
    createEvent(domEvent, eventType) {
        const event = {
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
        return event;
    }
    onKeyPress(event) {
        this.cellKeyboardListenerFeature.onKeyPress(event);
    }
    onKeyDown(event) {
        this.cellKeyboardListenerFeature.onKeyDown(event);
    }
    onMouseEvent(eventName, mouseEvent) {
        this.cellMouseListenerFeature.onMouseEvent(eventName, mouseEvent);
    }
    getGui() {
        return this.eGui;
    }
    refreshToolTip() {
        this.tooltipFeature.refreshToolTip();
    }
    getColSpanningList() {
        return this.cellPositionFeature.getColSpanningList();
    }
    onLeftChanged() {
        if (!this.cellComp) {
            return;
        }
        this.cellPositionFeature.onLeftChanged();
    }
    onDisplayedColumnsChanged() {
        if (!this.eGui) {
            return;
        }
        this.setAriaColIndex();
    }
    setAriaColIndex() {
        const colIdx = this.beans.columnModel.getAriaColumnIndex(this.column);
        setAriaColIndex(this.getGui(), colIdx); // for react, we don't use JSX, as it slowed down column moving
    }
    isSuppressNavigable() {
        return this.column.isSuppressNavigable(this.rowNode);
    }
    onWidthChanged() {
        return this.cellPositionFeature.onWidthChanged();
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
    startRowOrCellEdit(key, charPress, event = null) {
        if (!this.cellComp) {
            return;
        }
        if (this.beans.gridOptionsWrapper.isFullRowEdit()) {
            this.rowCtrl.startRowEditing(key, charPress, this);
        }
        else {
            this.startEditing(key, charPress, true, event);
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
        if (!this.cellComp || this.gow.isSuppressCellFocus()) {
            return;
        }
        const cellFocused = this.beans.focusService.isCellFocused(this.cellPosition);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_FOCUS, cellFocused);
        // see if we need to force browser focus - this can happen if focus is programmatically set
        if (cellFocused && event && event.forceBrowserFocus) {
            const focusEl = this.cellComp.getFocusableElement();
            focusEl.focus({ preventScroll: !!event.preventScrollOnBrowserFocus });
        }
        // if another cell was focused, and we are editing, then stop editing
        const fullRowEdit = this.beans.gridOptionsWrapper.isFullRowEdit();
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
        if (!this.beans.gridOptionsWrapper.isColumnHoverHighlight()) {
            return;
        }
        const isHovered = this.beans.columnHoverService.isHovered(this.column);
        this.cellComp.addOrRemoveCssClass(CSS_COLUMN_HOVER, isHovered);
    }
    onColDefChanged() {
        if (!this.cellComp) {
            return;
        }
        this.setWrapText();
        if (!this.editing) {
            this.refreshCell({ forceRefresh: true, suppressFlash: true });
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
        const dndSourceComp = new DndSourceComp(this.rowNode, this.column, this.beans, this.eGui);
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
            this.addDestroyFunc(() => this.beans.context.destroyBean(newComp));
        }
    }
    createRowDragComp(customElement, dragStartPixels, suppressVisibilityChange) {
        const pagination = this.beans.gridOptionsWrapper.isPagination();
        const rowDragManaged = this.beans.gridOptionsWrapper.isRowDragManaged();
        const clientSideRowModelActive = this.beans.gridOptionsWrapper.isRowModelDefault();
        if (rowDragManaged) {
            // row dragging only available in default row model
            if (!clientSideRowModelActive) {
                doOnce(() => console.warn('AG Grid: managed row dragging is only allowed in the Client Side Row Model'), 'CellComp.addRowDragging');
                return;
            }
            if (pagination) {
                doOnce(() => console.warn('AG Grid: managed row dragging is not possible when doing pagination'), 'CellComp.addRowDragging');
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
