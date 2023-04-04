import { Beans } from "./../beans";
import { Column } from "../../entities/column";
import { CellStyle, NewValueParams } from "../../entities/colDef";
import { RowNode } from "../../entities/rowNode";
import { CellChangedEvent } from "../../interfaces/iRowNode";
import { CellPosition } from "../../entities/cellPositionUtils";
import {
    CellContextMenuEvent,
    CellEditingStartedEvent,
    CellEditingStoppedEvent,
    CellEvent,
    CellFocusedEvent,
    Events,
    FlashCellsEvent
} from "../../events";
import { CellRangeFeature } from "./cellRangeFeature";
import { exists, makeNull } from "../../utils/generic";
import { BeanStub } from "../../context/beanStub";
import { CellPositionFeature } from "./cellPositionFeature";
import { escapeString } from "../../utils/string";
import { CellCustomStyleFeature } from "./cellCustomStyleFeature";
import { TooltipFeature, ITooltipFeatureCtrl } from "../../widgets/tooltipFeature";
import { RowPosition } from "../../entities/rowPositionUtils";
import { RowCtrl } from "../row/rowCtrl";
import { CellMouseListenerFeature } from "./cellMouseListenerFeature";
import { CellKeyboardListenerFeature } from "./cellKeyboardListenerFeature";
import { ICellRenderer, ICellRendererParams } from "../cellRenderers/iCellRenderer";
import { ICellEditor, ICellEditorParams } from "../../interfaces/iCellEditor";
import { KeyCode } from "../../constants/keyCode";
import { UserCompDetails } from "../../components/framework/userComponentFactory";
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
const CSS_COLUMN_HOVER = 'ag-column-hover';
const CSS_CELL_WRAP_TEXT = 'ag-cell-wrap-text';

export interface ICellComp {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    setUserStyles(styles: CellStyle): void;
    getFocusableElement(): HTMLElement;

    setTabIndex(tabIndex: number): void;
    setRole(role: string): void;
    setColId(colId: string): void;
    setTitle(title: string | undefined): void;

    setIncludeSelection(include: boolean): void;
    setIncludeRowDrag(include: boolean): void;
    setIncludeDndSource(include: boolean): void;

    getCellEditor(): ICellEditor | null;
    getCellRenderer(): ICellRenderer | null;
    getParentOfValue(): HTMLElement | null;

    setRenderDetails(compDetails: UserCompDetails | undefined, valueToDisplay: any, forceNewCellRendererInstance: boolean): void;
    setEditDetails(compDetails?: UserCompDetails, popup?: boolean, position?: 'over' | 'under'): void;
}

let instanceIdSequence = 0;

export class CellCtrl extends BeanStub {

    public static DOM_DATA_KEY_CELL_CTRL = 'cellCtrl';

    private instanceId: string;

    private eGui: HTMLElement;
    private cellComp: ICellComp;
    private beans: Beans;
    private column: Column;
    private rowNode: RowNode;
    private rowCtrl: RowCtrl;

    private printLayout: boolean;

    private value: any;
    private valueFormatted: any;

    private cellRangeFeature: CellRangeFeature | null = null;
    private cellPositionFeature: CellPositionFeature | null = null;
    private cellCustomStyleFeature: CellCustomStyleFeature | null = null;
    private tooltipFeature: TooltipFeature | null = null;
    private cellMouseListenerFeature: CellMouseListenerFeature | null = null;
    private cellKeyboardListenerFeature: CellKeyboardListenerFeature | null = null;

    private cellPosition: CellPosition;

    private editing: boolean;

    private includeSelection: boolean;
    private includeDndSource: boolean;
    private includeRowDrag: boolean;

    private suppressRefreshCell = false;

    // this comp used only for custom row drag handle (ie when user calls params.registerRowDragger)
    private customRowDragComp: RowDragComp;

    private onCellCompAttachedFuncs: (() => void)[] = [];

    constructor(column: Column, rowNode: RowNode, beans: Beans, rowCtrl: RowCtrl) {
        super();
        this.column = column;
        this.rowNode = rowNode;
        this.beans = beans;
        this.rowCtrl = rowCtrl;

        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        this.instanceId = column.getId() + '-' + instanceIdSequence++;

        this.createCellPosition();
        this.addFeatures();
    }

    private addFeatures(): void {
        this.cellPositionFeature = new CellPositionFeature(this, this.beans);
        this.addDestroyFunc(() => { this.cellPositionFeature?.destroy(); this.cellPositionFeature = null; });

        this.cellCustomStyleFeature = new CellCustomStyleFeature(this, this.beans);
        this.addDestroyFunc(() => { this.cellCustomStyleFeature?.destroy(); this.cellCustomStyleFeature = null; });

        this.cellMouseListenerFeature = new CellMouseListenerFeature(this, this.beans, this.column);
        this.addDestroyFunc(() => { this.cellMouseListenerFeature?.destroy(); this.cellMouseListenerFeature = null; });

        this.cellKeyboardListenerFeature = new CellKeyboardListenerFeature(this, this.beans, this.column, this.rowNode, this.rowCtrl);
        this.addDestroyFunc(() => { this.cellKeyboardListenerFeature?.destroy(); this.cellKeyboardListenerFeature = null; });

        const rangeSelectionEnabled = this.beans.rangeService && this.beans.gridOptionsService.isEnableRangeSelection();
        if (rangeSelectionEnabled) {
            this.cellRangeFeature = new CellRangeFeature(this.beans, this);
            this.addDestroyFunc(() => { this.cellRangeFeature?.destroy(); this.cellRangeFeature = null; });
        }

        this.addTooltipFeature();
    }

    private addTooltipFeature(): void {
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

        const tooltipCtrl: ITooltipFeatureCtrl = {
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
        this.addDestroyFunc(() => { this.tooltipFeature?.destroy(); this.tooltipFeature = null; });
    }

    public setComp(
        comp: ICellComp,
        eGui: HTMLElement,
        eCellWrapper: HTMLElement | undefined,
        printLayout: boolean,
        startEditing: boolean
    ): void {
        this.cellComp = comp;
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

        if (eCellWrapper) {
            this.setupAutoHeight(eCellWrapper);
        }

        this.setAriaColIndex();

        if (!this.beans.gridOptionsService.is('suppressCellFocus')) {
            this.cellComp.setTabIndex(-1);
        }

        const colIdSanitised = escapeString(this.column.getId());
        this.cellComp.setColId(colIdSanitised!);
        this.cellComp.setRole('gridcell');

        this.cellPositionFeature?.setComp(eGui);
        this.cellCustomStyleFeature?.setComp(comp);
        this.tooltipFeature?.setComp(comp);
        this.cellKeyboardListenerFeature?.setComp(this.eGui);

        if (this.cellRangeFeature) { this.cellRangeFeature.setComp(comp, eGui); }

        if (startEditing && this.isCellEditable()) {
            this.startEditing();
        } else {
            this.showValue();
        }

        if (this.onCellCompAttachedFuncs.length) {
            this.onCellCompAttachedFuncs.forEach(func => func());
            this.onCellCompAttachedFuncs = [];
        }
}

    private setupAutoHeight(eCellWrapper: HTMLElement): void {
        if (!this.column.isAutoHeight()) { return; }

        const eParentCell = eCellWrapper.parentElement!;
        // taking minRowHeight from getRowHeightForNode means the getRowHeight() callback is used,
        // thus allowing different min heights for different rows.
        const minRowHeight = this.beans.gridOptionsService.getRowHeightForNode(this.rowNode).height;

        const measureHeight = (timesCalled: number) => {
            if (this.editing) { return; }
            // because of the retry's below, it's possible the retry's go beyond
            // the rows life.
            if (!this.isAlive()) { return; }

            const { paddingTop, paddingBottom, borderBottomWidth, borderTopWidth } = getElementSize(eParentCell);
            const extraHeight = paddingTop + paddingBottom + borderBottomWidth + borderTopWidth;

            const wrapperHeight = eCellWrapper!.offsetHeight;
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

    public getInstanceId(): string {
        return this.instanceId;
    }

    private showValue(forceNewCellRendererInstance = false): void {
        const valueToDisplay = this.valueFormatted != null ? this.valueFormatted : this.value;
        const params = this.createCellRendererParams();
        const compDetails = this.beans.userComponentFactory.getCellRendererDetails(this.column.getColDef(), params);
        this.cellComp.setRenderDetails(compDetails, valueToDisplay, forceNewCellRendererInstance);
        this.refreshHandle();
    }

    private setupControlComps(): void {
        const colDef = this.column.getColDef();
        this.includeSelection = this.isIncludeControl(colDef.checkboxSelection);
        this.includeRowDrag = this.isIncludeControl(colDef.rowDrag);
        this.includeDndSource = this.isIncludeControl(colDef.dndSource);

        this.cellComp.setIncludeSelection(this.includeSelection);
        this.cellComp.setIncludeDndSource(this.includeDndSource);
        this.cellComp.setIncludeRowDrag(this.includeRowDrag);
    }

    public isForceWrapper(): boolean {
        // text selection requires the value to be wrapped in another element
        const forceWrapper = this.beans.gridOptionsService.is('enableCellTextSelection') || this.column.isAutoHeight();
        return forceWrapper;
    }

    private isIncludeControl(value: boolean | Function | undefined): boolean {
        const rowNodePinned = this.rowNode.rowPinned != null;
        const isFunc = typeof value === 'function';
        const res = rowNodePinned ? false : isFunc || value === true;

        return res;
    }

    public refreshShouldDestroy(): boolean {
        const colDef = this.column.getColDef();
        const selectionChanged = this.includeSelection != this.isIncludeControl(colDef.checkboxSelection);
        const rowDragChanged = this.includeRowDrag != this.isIncludeControl(colDef.rowDrag);
        const dndSourceChanged = this.includeDndSource != this.isIncludeControl(colDef.dndSource);

        return selectionChanged || rowDragChanged || dndSourceChanged;
    }

    // either called internally if single cell editing, or called by rowRenderer if row editing
    public startEditing(key: string | null = null, charPress: string | null = null, cellStartedEdit = false, event: KeyboardEvent | MouseEvent | null = null): void {
        if (!this.isCellEditable() || this.editing) { return; }

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
        const popup = compDetails?.popupFromSelector != null ? compDetails.popupFromSelector : !!colDef.cellEditorPopup ;
        const position: 'over' | 'under' | undefined = compDetails?.popupPositionFromSelector != null ? compDetails.popupPositionFromSelector : colDef.cellEditorPopupPosition;

        this.setEditing(true);
        this.cellComp.setEditDetails(compDetails, popup, position);

        const e: CellEditingStartedEvent = this.createEvent(event, Events.EVENT_CELL_EDITING_STARTED);
        this.beans.eventService.dispatchEvent(e);
    }

    private setEditing(editing: boolean): void {
        if (this.editing === editing) { return; }

        this.editing = editing;
        this.refreshHandle();
    }

    // pass in 'true' to cancel the editing.
    public stopRowOrCellEdit(cancel: boolean = false) {
        if (this.beans.gridOptionsService.get('editType') === 'fullRow') {
            this.rowCtrl.stopRowEditing(cancel);
        } else {
            this.stopEditing(cancel);
        }
    }

    public onPopupEditorClosed(): void {
        if (!this.isEditing()) { return; }
        // note: this happens because of a click outside of the grid or if the popupEditor
        // is closed with `Escape` key. if another cell was clicked, then the editing will
        // have already stopped and returned on the conditional above.
        this.stopEditingAndFocus();
    }

    private takeValueFromCellEditor(cancel: boolean): { newValue?: any, newValueExists: boolean } {
        const noValueResult = { newValueExists: false };

        if (cancel) { return noValueResult; }

        const cellEditor =  this.cellComp.getCellEditor();

        if (!cellEditor) { return noValueResult; }

        const userWantsToCancel = cellEditor.isCancelAfterEnd && cellEditor.isCancelAfterEnd();

        if (userWantsToCancel) { return noValueResult; }

        const newValue = cellEditor.getValue();

        return {
            newValue: newValue,
            newValueExists: true
        };
    }

    /**
     * @returns `True` if the value changes, otherwise `False`.
     */
    private saveNewValue(oldValue: any, newValue: any): boolean {
        if (newValue === oldValue) { return false; }

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
    public stopEditing(cancel = false): boolean {
        if (!this.editing) { return false; }

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
        this.dispatchEditingStoppedEvent(oldValue, newValue, !cancel && !!valueChanged);

        return valueChanged;
    }

    private dispatchEditingStoppedEvent(oldValue: any, newValue: any, valueChanged: boolean): void {
        const editingStoppedEvent: CellEditingStoppedEvent = {
            ...this.createEvent(null, Events.EVENT_CELL_EDITING_STOPPED),
            oldValue,
            newValue,
            valueChanged
        };

        this.beans.eventService.dispatchEvent(editingStoppedEvent);
    }

    private createCellEditorParams(key: string | null, charPress: string | null, cellStartedEdit: boolean): ICellEditorParams {
        return {
            value: this.getValueFromValueService(),
            eventKey: key,
            charPress: charPress,
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

    private createCellRendererParams(): ICellRendererParams {

        const res: ICellRendererParams = {
            value: this.value,
            valueFormatted: this.valueFormatted,
            getValue: this.getValueFromValueService.bind(this),
            setValue: (value:any) => this.beans.valueService.setValue(this.rowNode, this.column, value),
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

            registerRowDragger: (rowDraggerElement: HTMLElement, dragStartPixels: number, value?: string, suppressVisibilityChange?: boolean) => this.registerRowDragger(rowDraggerElement, dragStartPixels, suppressVisibilityChange),

        } as ICellRendererParams;

        return res;
    }

    private parseValue(newValue: any): any {
        const colDef = this.column.getColDef();
        const params: NewValueParams = {
            node: this.rowNode,
            data: this.rowNode.data,
            oldValue: this.getValue(),
            newValue: newValue,
            colDef: colDef,
            column: this.column,
            api: this.beans.gridOptionsService.api,
            columnApi: this.beans.gridOptionsService.columnApi,
            context: this.beans.gridOptionsService.context
        };

        const valueParser = colDef.valueParser;

        if (exists(valueParser)) {
            if (typeof valueParser === 'function') {
                return valueParser(params);
            }
            return this.beans.expressionService.evaluate(valueParser, params);
        }
        return newValue;
    }

    public setFocusOutOnEditor(): void {
        if (!this.editing) { return; }

        const cellEditor = this.cellComp.getCellEditor();

        if (cellEditor && cellEditor.focusOut) {
            cellEditor.focusOut();
        }
    }

    public setFocusInOnEditor(): void {
        if (!this.editing) { return; }

        const cellEditor = this.cellComp.getCellEditor();

        if (cellEditor && cellEditor.focusIn) {
            // if the editor is present, then we just focus it
            cellEditor.focusIn();
        } else {
            // if the editor is not present, it means async cell editor (eg React fibre)
            // and we are trying to set focus before the cell editor is present, so we
            // focus the cell instead
            this.focusCell(true);
        }
    }

    public onCellChanged(event: CellChangedEvent): void {
        // because of async in React, the cellComp may not be set yet, if no cellComp then we are
        // yet to initialise the cell, so no need to refresh.
        if (!this.cellComp) { return; }

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
    public refreshCell(params?: { suppressFlash?: boolean, newData?: boolean, forceRefresh?: boolean; }) {
        // if we are in the middle of 'stopEditing', then we don't refresh here, as refresh gets called explicitly
        if (this.suppressRefreshCell || this.editing) { return; }

        // In React, due to async, it's possible a refresh was asked for before the CellComp
        // has been set. If this happens, we skip the refresh, as the cell is going to be
        // initialised anyway once the CellComp is set.
        if (!this.cellComp) { return; }

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
                (this.beans.gridOptionsService.is('enableCellChangeFlash') || colDef.enableCellChangeFlash);

            if (flashCell) {
                this.flashCell();
            }

            this.cellCustomStyleFeature?.applyUserStyles();
            this.cellCustomStyleFeature?.applyClassesFromColDef();
        }

        this.refreshToolTip();

        // we do cellClassRules even if the value has not changed, so that users who have rules that
        // look at other parts of the row (where the other part of the row might of changed) will work.
        this.cellCustomStyleFeature?.applyCellClassRules();
    }

    // cell editors call this, when they want to stop for reasons other
    // than what we pick up on. eg selecting from a dropdown ends editing.
    public stopEditingAndFocus(suppressNavigateAfterEdit = false): void {
        this.stopRowOrCellEdit();
        this.focusCell(true);

        if (!suppressNavigateAfterEdit) {
            this.navigateAfterEdit();
        }
    }

    private navigateAfterEdit(): void {
        const fullRowEdit = this.beans.gridOptionsService.get('editType') === 'fullRow';

        if (fullRowEdit) { return; }

        const enterMovesDownAfterEdit = this.beans.gridOptionsService.is('enterMovesDownAfterEdit');

        if (enterMovesDownAfterEdit) {
            this.beans.navigationService.navigateToNextCell(null, KeyCode.DOWN, this.getCellPosition(), false);
        }
    }

    // user can also call this via API
    public flashCell(delays?: { flashDelay?: number | null; fadeDelay?: number | null; }): void {
        const flashDelay = delays && delays.flashDelay;
        const fadeDelay = delays && delays.fadeDelay;

        this.animateCell('data-changed', flashDelay, fadeDelay);
    }

    private animateCell(cssName: string, flashDelay?: number | null, fadeDelay?: number | null): void {
        const fullName = `ag-cell-${cssName}`;
        const animationFullName = `ag-cell-${cssName}-animation`;
        const { gridOptionsService } = this.beans;

        if (!flashDelay) {
            flashDelay = gridOptionsService.getNum('cellFlashDelay') ?? 500;
        }

        if (!exists(fadeDelay)) {
            fadeDelay = gridOptionsService.getNum('cellFadeDelay') ?? 1000;
        }

        // we want to highlight the cells, without any animation
        this.cellComp.addOrRemoveCssClass(fullName, true);
        this.cellComp.addOrRemoveCssClass(animationFullName, false);

        // then once that is applied, we remove the highlight with animation
        window.setTimeout(() => {
            if (!this.isAlive()) { return; }
            this.cellComp.addOrRemoveCssClass(fullName, false);
            this.cellComp.addOrRemoveCssClass(animationFullName, true);

            this.eGui.style.transition = `background-color ${fadeDelay}ms`;
            window.setTimeout(() => {
                if (!this.isAlive()) { return; }
                // and then to leave things as we got them, we remove the animation
                this.cellComp.addOrRemoveCssClass(animationFullName, false);
                this.eGui.style.transition = '';
            }, fadeDelay!);
        }, flashDelay);
    }

    public onFlashCells(event: FlashCellsEvent): void {
        if (!this.cellComp) { return; }
        const cellId = this.beans.cellPositionUtils.createId(this.getCellPosition());
        const shouldFlash = event.cells[cellId];
        if (shouldFlash) {
            this.animateCell('highlight');
        }
    }

    public isCellEditable(): boolean {
        return this.column.isCellEditable(this.rowNode);
    }

    public isSuppressFillHandle(): boolean {
        return this.column.isSuppressFillHandle();
    }

    private formatValue(value: any): any {
        const res = this.callValueFormatter(value);
        return res != null ? res : value;
    }

    private callValueFormatter(value: any): any {
        return this.beans.valueFormatterService.formatValue(this.column, this.rowNode, value);
    }

    private updateAndFormatValue(force = false): boolean {
        const oldValue = this.value;
        const oldValueFormatted = this.valueFormatted;

        this.value = this.getValueFromValueService();
        this.valueFormatted = this.callValueFormatter(this.value);

        const valuesDifferent = force ? true :
            !this.valuesAreEqual(oldValue, this.value) || this.valueFormatted != oldValueFormatted;

        return valuesDifferent;
    }

    private valuesAreEqual(val1: any, val2: any): boolean {
        // if the user provided an equals method, use that, otherwise do simple comparison
        const colDef = this.column.getColDef();
        return colDef.equals ? colDef.equals(val1, val2) : val1 === val2;
    }

    public getComp(): ICellComp {
        return this.cellComp;
    }

    public getValueFromValueService(): any {
        // if we don't check this, then the grid will render leaf groups as open even if we are not
        // allowing the user to open leaf groups. confused? remember for pivot mode we don't allow
        // opening leaf groups, so we have to force leafGroups to be closed in case the user expanded
        // them via the API, or user user expanded them in the UI before turning on pivot mode
        const lockedClosedGroup = this.rowNode.leafGroup && this.beans.columnModel.isPivotMode();

        const isOpenGroup = this.rowNode.group && this.rowNode.expanded && !this.rowNode.footer && !lockedClosedGroup;

        // are we showing group footers
        const groupFootersEnabled = this.beans.gridOptionsService.is('groupIncludeFooter');

        // if doing footers, we normally don't show agg data at group level when group is open
        const groupAlwaysShowAggData = this.beans.gridOptionsService.is('groupSuppressBlankHeader');

        // if doing grouping and footers, we don't want to include the agg value
        // in the header when the group is open
        const ignoreAggData = (isOpenGroup && groupFootersEnabled) && !groupAlwaysShowAggData;

        const value = this.beans.valueService.getValue(this.column, this.rowNode, false, ignoreAggData);

        return value;
    }

    public getValue(): any {
        return this.value;
    }

    public getValueFormatted(): string {
        return this.valueFormatted;
    }

    private addDomData(): void {
        const element = this.getGui();

        this.beans.gridOptionsService.setDomData(element, CellCtrl.DOM_DATA_KEY_CELL_CTRL, this);
        this.addDestroyFunc(() => this.beans.gridOptionsService.setDomData(element, CellCtrl.DOM_DATA_KEY_CELL_CTRL, null));
    }

    public createEvent(domEvent: Event | null, eventType: string): CellEvent {
        const event: CellEvent = {
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
            rowIndex: this.rowNode.rowIndex!
        };

        return event;
    }

    public onKeyPress(event: KeyboardEvent): void {
        this.cellKeyboardListenerFeature?.onKeyPress(event);
    }

    public onKeyDown(event: KeyboardEvent): void {
        this.cellKeyboardListenerFeature?.onKeyDown(event);
    }

    public onMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        this.cellMouseListenerFeature?.onMouseEvent(eventName, mouseEvent);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refreshToolTip(): void {
        this.tooltipFeature?.refreshToolTip();
    }

    public getColSpanningList(): Column[] {
        return this.cellPositionFeature!.getColSpanningList();
    }

    public onLeftChanged(): void {
        if (!this.cellComp) { return; }
        this.cellPositionFeature?.onLeftChanged();
    }

    public onDisplayedColumnsChanged(): void {
        if (!this.eGui) { return; }
        this.setAriaColIndex();
    }

    private setAriaColIndex(): void {
        const colIdx = this.beans.columnModel.getAriaColumnIndex(this.column);
        setAriaColIndex(this.getGui(), colIdx); // for react, we don't use JSX, as it slowed down column moving
    }

    public isSuppressNavigable(): boolean {
        return this.column.isSuppressNavigable(this.rowNode);
    }

    public onWidthChanged(): void {
        return this.cellPositionFeature?.onWidthChanged();
    }

    public getColumn(): Column {
        return this.column;
    }

    public getRowNode(): RowNode {
        return this.rowNode;
    }

    public getBeans(): Beans {
        return this.beans;
    }

    public isPrintLayout(): boolean {
        return this.printLayout;
    }

    public appendChild(htmlElement: HTMLElement): void {
        this.eGui.appendChild(htmlElement);
    }

    public refreshHandle(): void {
        if (this.cellRangeFeature) {
            this.cellRangeFeature.refreshHandle();
        }
    }

    public getCellPosition(): CellPosition {
        return this.cellPosition;
    }

    public isEditing(): boolean {
        return this.editing;
    }

    // called by rowRenderer when user navigates via tab key
    public startRowOrCellEdit(key?: string | null, charPress?: string | null, event: KeyboardEvent | MouseEvent | null = null): void {
        if (!this.cellComp) { return; }
        if (this.beans.gridOptionsService.get('editType') === 'fullRow') {
            this.rowCtrl.startRowEditing(key, charPress, this);
        } else {
            this.startEditing(key, charPress, true, event);
        }
    }

    public getRowCtrl(): RowCtrl {
        return this.rowCtrl;
    }

    public getRowPosition(): RowPosition {
        return {
            rowIndex: this.cellPosition.rowIndex,
            rowPinned: this.cellPosition.rowPinned
        };
    }

    public updateRangeBordersIfRangeCount(): void {
        if (!this.cellComp) { return; }
        if (this.cellRangeFeature) {
            this.cellRangeFeature.updateRangeBordersIfRangeCount();
        }
    }

    public onRangeSelectionChanged(): void {
        if (!this.cellComp) { return; }
        if (this.cellRangeFeature) {
            this.cellRangeFeature.onRangeSelectionChanged();
        }
    }

    public isRangeSelectionEnabled(): boolean {
        return this.cellRangeFeature != null;
    }

    public focusCell(forceBrowserFocus = false): void {
        this.beans.focusService.setFocusedCell({
            rowIndex: this.getCellPosition().rowIndex,
            column: this.column,
            rowPinned: this.rowNode.rowPinned,
            forceBrowserFocus
        });
    }

    public onRowIndexChanged(): void {
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

    public onFirstRightPinnedChanged(): void {
        if (!this.cellComp) { return; }
        const firstRightPinned = this.column.isFirstRightPinned();
        this.cellComp.addOrRemoveCssClass(CSS_CELL_FIRST_RIGHT_PINNED, firstRightPinned);
    }

    public onLastLeftPinnedChanged(): void {
        if (!this.cellComp) { return; }
        const lastLeftPinned = this.column.isLastLeftPinned();
        this.cellComp.addOrRemoveCssClass(CSS_CELL_LAST_LEFT_PINNED, lastLeftPinned);
    }

    public onCellFocused(event?: CellFocusedEvent): void {
        if (!this.cellComp || this.beans.gridOptionsService.is('suppressCellFocus')) { return; }

        const cellFocused = this.beans.focusService.isCellFocused(this.cellPosition);

        this.cellComp.addOrRemoveCssClass(CSS_CELL_FOCUS, cellFocused);

        // see if we need to force browser focus - this can happen if focus is programmatically set
        if (cellFocused && event && event.forceBrowserFocus) {
            const focusEl = this.cellComp.getFocusableElement();
            focusEl.focus({ preventScroll: !!event.preventScrollOnBrowserFocus});
        }

        // if another cell was focused, and we are editing, then stop editing
        const fullRowEdit = this.beans.gridOptionsService.get('editType') === 'fullRow';

        if (!cellFocused && !fullRowEdit && this.editing) {
            this.stopRowOrCellEdit();
        }
    }

    private createCellPosition(): void {
        this.cellPosition = {
            rowIndex: this.rowNode.rowIndex!,
            rowPinned: makeNull(this.rowNode.rowPinned),
            column: this.column
        };
    }

    // CSS Classes that only get applied once, they never change
    private applyStaticCssClasses(): void {
        this.cellComp.addOrRemoveCssClass(CSS_CELL, true);
        this.cellComp.addOrRemoveCssClass(CSS_CELL_NOT_INLINE_EDITING, true);

        // normal cells fill the height of the row. autoHeight cells have no height to let them
        // fit the height of content.

        const autoHeight = this.column.isAutoHeight() == true;
        this.cellComp.addOrRemoveCssClass(CSS_AUTO_HEIGHT, autoHeight);
        this.cellComp.addOrRemoveCssClass(CSS_NORMAL_HEIGHT, !autoHeight);
    }

    public onColumnHover(): void {
        if (!this.cellComp) { return; }
        if (!this.beans.gridOptionsService.is('columnHoverHighlight')) { return; }

        const isHovered = this.beans.columnHoverService.isHovered(this.column);
        this.cellComp.addOrRemoveCssClass(CSS_COLUMN_HOVER, isHovered);
    }

    public onColDefChanged(): void {
        if (!this.cellComp) { return; }

        this.setWrapText();

        if (!this.editing) {
            this.refreshCell({forceRefresh: true, suppressFlash: true});
        }
    }

    private setWrapText(): void {
        const value = this.column.getColDef().wrapText == true;

        this.cellComp.addOrRemoveCssClass(CSS_CELL_WRAP_TEXT, value);
    }

    public dispatchCellContextMenuEvent(event: Event | null) {
        const colDef = this.column.getColDef();
        const cellContextMenuEvent: CellContextMenuEvent = this.createEvent(event, Events.EVENT_CELL_CONTEXT_MENU);

        this.beans.eventService.dispatchEvent(cellContextMenuEvent);

        if (colDef.onCellContextMenu) {
            // to make the callback async, do in a timeout
            window.setTimeout(() => (colDef.onCellContextMenu as any)(cellContextMenuEvent), 0);
        }
    }

    public getCellRenderer(): ICellRenderer | null {
        return this.cellComp ? this.cellComp.getCellRenderer() : null;
    }

    public getCellEditor(): ICellEditor | null {
        return this.cellComp ? this.cellComp.getCellEditor() : null;
    }

    public destroy(): void {
        this.onCellCompAttachedFuncs = [];
        super.destroy();
    }

    public createSelectionCheckbox(): CheckboxSelectionComponent {
        const cbSelectionComponent = new CheckboxSelectionComponent();

        this.beans.context.createBean(cbSelectionComponent);
        cbSelectionComponent.init({ rowNode: this.rowNode, column: this.column });

        // put the checkbox in before the value
        return cbSelectionComponent;
    }

    public createDndSource(): DndSourceComp {
        const dndSourceComp = new DndSourceComp(this.rowNode, this.column, this.beans, this.eGui);
        this.beans.context.createBean(dndSourceComp);

        return dndSourceComp;
    }

    public registerRowDragger(
        customElement: HTMLElement,
        dragStartPixels?: number,
        suppressVisibilityChange?: boolean
    ): void {
        // if previously existed, then we are only updating
        if (this.customRowDragComp) {
            this.customRowDragComp.setDragElement(customElement, dragStartPixels);
            return;
        }

        const newComp = this.createRowDragComp(customElement, dragStartPixels, suppressVisibilityChange);

        if (newComp) {
            this.customRowDragComp = newComp;
            this.addDestroyFunc(() => { this.beans.context.destroyBean(newComp); (this.customRowDragComp as any) = null; });
        }
    }

    public createRowDragComp(
        customElement?: HTMLElement,
        dragStartPixels?: number,
        suppressVisibilityChange?: boolean
    ): RowDragComp | undefined {
        const pagination = this.beans.gridOptionsService.is('pagination');
        const rowDragManaged = this.beans.gridOptionsService.is('rowDragManaged');
        const clientSideRowModelActive = this.beans.gridOptionsService.isRowModelType('clientSide');

        if (rowDragManaged) {
            // row dragging only available in default row model
            if (!clientSideRowModelActive) {
                doOnce(() => console.warn('AG Grid: managed row dragging is only allowed in the Client Side Row Model'),
                    'CellComp.addRowDragging');

                return;
            }

            if (pagination) {
                doOnce(() => console.warn('AG Grid: managed row dragging is not possible when doing pagination'),
                    'CellComp.addRowDragging');

                return;
            }
        }

        // otherwise (normal case) we are creating a RowDraggingComp for the first time
        const rowDragComp = new RowDragComp(() => this.value, this.rowNode, this.column, customElement, dragStartPixels, suppressVisibilityChange);
        this.beans.context.createBean(rowDragComp);

        return rowDragComp;
    }
}
