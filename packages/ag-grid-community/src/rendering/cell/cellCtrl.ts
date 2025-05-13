import { isColumnSelectionCol, isRowNumberCol } from '../../columns/columnUtils';
import { _getCellRendererDetails, _getLoadingCellRendererDetails } from '../../components/framework/userCompUtils';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { RowDragComp } from '../../dragAndDrop/rowDragComp';
import type { AgColumn } from '../../entities/agColumn';
import type { CellStyle, CheckboxSelectionCallback, ColDef } from '../../entities/colDef';
import type { RowNode } from '../../entities/rowNode';
import type { AgEventType } from '../../eventTypes';
import type { CellContextMenuEvent, CellEvent, CellFocusedEvent } from '../../events';
import type { GridOptionsService } from '../../gridOptionsService';
import {
    _addGridCommonParams,
    _getActiveDomElement,
    _getCheckboxLocation,
    _getCheckboxes,
    _isCellSelectionEnabled,
    _setDomData,
} from '../../gridOptionsUtils';
import { refreshFirstAndLastStyles } from '../../headerRendering/cells/cssClassApplier';
import type { BrandedType } from '../../interfaces/brandedType';
import type { ICellEditor } from '../../interfaces/iCellEditor';
import type { CellPosition } from '../../interfaces/iCellPosition';
import type { ICellRangeFeature } from '../../interfaces/iCellRangeFeature';
import type { CellChangedEvent } from '../../interfaces/iRowNode';
import type { RowPosition } from '../../interfaces/iRowPosition';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import type { IRowNumbersRowResizeFeature } from '../../interfaces/rowNumbers';
import { _isManualPinnedRow } from '../../pinnedRowModel/pinnedRowUtils';
import type { CheckboxSelectionComponent } from '../../selection/checkboxSelectionComponent';
import type { CellCustomStyleFeature } from '../../styling/cellCustomStyleFeature';
import type { TooltipFeature } from '../../tooltip/tooltipFeature';
import { _setAriaColIndex } from '../../utils/aria';
import { _addOrRemoveAttribute, _requestAnimationFrame } from '../../utils/dom';
import { _getCtrlForEventTarget } from '../../utils/event';
import { _findFocusableElements, _isCellFocusSuppressed } from '../../utils/focus';
import { _makeNull } from '../../utils/generic';
import type { ICellRenderer, ICellRendererParams } from '../cellRenderers/iCellRenderer';
import type { DndSourceComp } from '../dndSourceComp';
import type { RowCtrl } from '../row/rowCtrl';
import type { CellSpan } from '../spanning/rowSpanCache';
import { CellKeyboardListenerFeature } from './cellKeyboardListenerFeature';
import { CellMouseListenerFeature } from './cellMouseListenerFeature';
import { CellPositionFeature } from './cellPositionFeature';

const CSS_CELL = 'ag-cell';
const CSS_AUTO_HEIGHT = 'ag-cell-auto-height';
const CSS_NORMAL_HEIGHT = 'ag-cell-normal-height';
const CSS_CELL_FOCUS = 'ag-cell-focus';
const CSS_CELL_FIRST_RIGHT_PINNED = 'ag-cell-first-right-pinned';
const CSS_CELL_LAST_LEFT_PINNED = 'ag-cell-last-left-pinned';
const CSS_CELL_NOT_INLINE_EDITING = 'ag-cell-not-inline-editing';
const CSS_CELL_WRAP_TEXT = 'ag-cell-wrap-text';

export interface ICellComp {
    toggleCss(cssClassName: string, on: boolean): void;
    setUserStyles(styles: CellStyle): void;
    getFocusableElement(): HTMLElement;

    setIncludeSelection(include: boolean): void;
    setIncludeRowDrag(include: boolean): void;
    setIncludeDndSource(include: boolean): void;

    getCellEditor(): ICellEditor | null;
    getCellRenderer(): ICellRenderer | null;
    getParentOfValue(): HTMLElement | null;

    setRenderDetails(
        compDetails: UserCompDetails | undefined,
        valueToDisplay: any,
        forceNewCellRendererInstance: boolean
    ): void;
    setEditDetails(
        compDetails?: UserCompDetails,
        popup?: boolean,
        position?: 'over' | 'under',
        reactiveCustomComponents?: boolean
    ): void;
}

export const DOM_DATA_KEY_CELL_CTRL = 'cellCtrl';

export function _getCellCtrlForEventTarget(gos: GridOptionsService, eventTarget: EventTarget | null): CellCtrl | null {
    return _getCtrlForEventTarget(gos, eventTarget, DOM_DATA_KEY_CELL_CTRL);
}

let instanceIdSequence = 0;
export type CellCtrlInstanceId = BrandedType<string, 'CellCtrlInstanceId'>;

export class CellCtrl extends BeanStub {
    public readonly instanceId: CellCtrlInstanceId;

    public eGui: HTMLElement;

    public comp: ICellComp;
    public editCompDetails?: UserCompDetails;

    public printLayout: boolean;

    public value: any;
    public valueFormatted: any;

    private rangeFeature: ICellRangeFeature | undefined = undefined;
    private rowResizeFeature: IRowNumbersRowResizeFeature | undefined = undefined;
    private positionFeature: CellPositionFeature | undefined = undefined;
    private customStyleFeature: CellCustomStyleFeature | undefined = undefined;
    private tooltipFeature: TooltipFeature | undefined = undefined;
    private mouseListener: CellMouseListenerFeature | undefined = undefined;
    private keyboardListener: CellKeyboardListenerFeature | undefined = undefined;

    public cellPosition: CellPosition;
    public editing: boolean;

    private includeSelection: boolean;
    private includeDndSource: boolean;
    private includeRowDrag: boolean;
    public isAutoHeight: boolean;

    public suppressRefreshCell = false;

    // this comp used only for custom row drag handle (ie when user calls params.registerRowDragger)
    private customRowDragComp: RowDragComp;

    public onCompAttachedFuncs: (() => void)[] = [];
    public onEditorAttachedFuncs: (() => void)[] = [];

    private focusEventWhileNotReady: CellFocusedEvent | null = null;
    // if cell has been focused, check if it's focused when destroyed
    private hasBeenFocused = false;

    constructor(
        public readonly column: AgColumn,
        public readonly rowNode: RowNode,
        beans: BeanCollection,
        public readonly rowCtrl: RowCtrl
    ) {
        super();
        this.beans = beans;

        const { colId } = column;
        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        this.instanceId = (colId + '-' + instanceIdSequence++) as CellCtrlInstanceId;

        this.createCellPosition();
        this.updateAndFormatValue(false);
    }

    private addFeatures(): void {
        const { beans } = this;
        this.positionFeature = new CellPositionFeature(this, beans);
        this.customStyleFeature = beans.cellStyles?.createCellCustomStyleFeature(this, beans);
        this.mouseListener = new CellMouseListenerFeature(this, beans, this.column);

        this.keyboardListener = new CellKeyboardListenerFeature(this, beans, this.rowNode, this.rowCtrl);

        if (this.column.isTooltipEnabled()) {
            this.enableTooltipFeature();
        }

        const { rangeSvc } = beans;
        const cellSelectionEnabled = rangeSvc && _isCellSelectionEnabled(beans.gos);
        if (cellSelectionEnabled) {
            this.rangeFeature = rangeSvc!.createCellRangeFeature(beans, this);
        }

        if (isRowNumberCol(this.column)) {
            this.rowResizeFeature = this.beans.rowNumbersSvc!.createRowNumbersRowResizerFeature(beans, this);
        }
    }

    public isCellSpanning(): boolean {
        return false;
    }

    public getCellSpan(): CellSpan | undefined {
        return undefined;
    }

    private removeFeatures(): void {
        const context = this.beans.context;
        this.positionFeature = context.destroyBean(this.positionFeature);
        this.customStyleFeature = context.destroyBean(this.customStyleFeature);
        this.mouseListener = context.destroyBean(this.mouseListener);
        this.keyboardListener = context.destroyBean(this.keyboardListener);
        this.rangeFeature = context.destroyBean(this.rangeFeature);
        this.rowResizeFeature = context.destroyBean(this.rowResizeFeature);

        this.disableTooltipFeature();
    }

    private enableTooltipFeature(value?: string, shouldDisplayTooltip?: () => boolean): void {
        this.tooltipFeature = this.beans.tooltipSvc?.enableCellTooltipFeature(this, value, shouldDisplayTooltip);
    }

    private disableTooltipFeature() {
        this.tooltipFeature = this.beans.context.destroyBean(this.tooltipFeature);
    }

    public setComp(
        comp: ICellComp,
        eCell: HTMLElement,
        _eWrapper: HTMLElement | undefined,
        eCellWrapper: HTMLElement | undefined,
        printLayout: boolean,
        startEditing: boolean,
        compBean: BeanStub | undefined
    ): void {
        this.comp = comp;
        this.eGui = eCell;
        this.printLayout = printLayout;
        compBean ??= this;

        this.addDomData(compBean);
        this.addFeatures();
        compBean.addDestroyFunc(() => this.removeFeatures());

        this.onSuppressCellFocusChanged(this.beans.gos.get('suppressCellFocus'));

        this.setupFocus();
        this.applyStaticCssClasses();
        this.setWrapText();

        this.onFirstRightPinnedChanged();
        this.onLastLeftPinnedChanged();
        this.onColumnHover();
        this.setupControlComps();

        this.setupAutoHeight(eCellWrapper, compBean);

        this.refreshFirstAndLastStyles();
        this.refreshAriaColIndex();

        this.positionFeature?.init();
        this.customStyleFeature?.setComp(comp);
        this.tooltipFeature?.refreshTooltip();
        this.keyboardListener?.init();
        this.rangeFeature?.setComp(comp);
        this.rowResizeFeature?.refreshRowResizer();

        if (startEditing && this.isCellEditable()) {
            this.beans.editSvc?.startEditing(this);
        } else {
            // We can skip refreshing the range handle as this is done in this.rangeFeature.setComp above
            this.showValue(false, true);
        }

        if (this.onCompAttachedFuncs.length) {
            this.onCompAttachedFuncs.forEach((func) => func());
            this.onCompAttachedFuncs = [];
        }
    }

    private setupAutoHeight(eCellWrapper: HTMLElement | undefined, compBean: BeanStub): void {
        this.isAutoHeight = this.beans.rowAutoHeight?.setupCellAutoHeight(this, eCellWrapper, compBean) ?? false;
    }

    public getCellAriaRole(): string {
        return this.column.getColDef().cellAriaRole ?? 'gridcell';
    }

    public isCellRenderer(): boolean {
        const colDef = this.column.getColDef();
        return colDef.cellRenderer != null || colDef.cellRendererSelector != null;
    }
    public getValueToDisplay(): any {
        return this.valueFormatted ?? this.value;
    }

    private showValue(forceNewCellRendererInstance: boolean, skipRangeHandleRefresh: boolean): void {
        const { beans, column, rowNode, rangeFeature } = this;
        const { userCompFactory } = beans;
        const valueToDisplay = this.getValueToDisplay();
        let compDetails: UserCompDetails | undefined;

        // if node is stub, and no group data for this node (groupSelectsChildren can populate group data)
        const isSsrmLoading = rowNode.stub && rowNode.groupData?.[column.getId()] == null;
        const colDef = column.getColDef();

        if (isSsrmLoading || this.isCellRenderer()) {
            const params = this.createCellRendererParams();
            if (!isSsrmLoading || isRowNumberCol(column)) {
                compDetails = _getCellRendererDetails(userCompFactory, colDef, params);
            } else {
                compDetails = _getLoadingCellRendererDetails(userCompFactory, colDef, params);
            }
        }
        if (!compDetails && !isSsrmLoading && beans.findSvc?.isMatch(rowNode, column)) {
            const params = this.createCellRendererParams();
            compDetails = _getCellRendererDetails(
                userCompFactory,
                { ...column.getColDef(), cellRenderer: 'agFindCellRenderer' },
                params
            );
        }

        this.comp.setRenderDetails(compDetails, valueToDisplay, forceNewCellRendererInstance);

        // Don't call expensive _requestAnimationFrame if we don't have to
        if (!skipRangeHandleRefresh && rangeFeature) {
            _requestAnimationFrame(beans, () => rangeFeature?.refreshHandle());
        }

        this.rowResizeFeature?.refreshRowResizer();
    }

    private setupControlComps(): void {
        const colDef = this.column.getColDef();
        this.includeSelection = this.isIncludeControl(this.isCheckboxSelection(colDef), true);
        this.includeRowDrag = this.isIncludeControl(colDef.rowDrag);
        this.includeDndSource = this.isIncludeControl(colDef.dndSource);

        this.comp.setIncludeSelection(this.includeSelection);
        this.comp.setIncludeDndSource(this.includeDndSource);
        this.comp.setIncludeRowDrag(this.includeRowDrag);
    }

    public isForceWrapper(): boolean {
        // text selection requires the value to be wrapped in another element
        return this.beans.gos.get('enableCellTextSelection') || this.column.isAutoHeight();
    }

    /**
     * Wrapper providing general conditions under which control elements (e.g. checkboxes and drag handles)
     * are rendered for a particular cell.
     * @param value Whether to render the control in the specific context of the caller
     * @param allowManuallyPinned Whether manually pinned rows are permitted this form of control element
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    private isIncludeControl(value: boolean | Function | undefined, allowManuallyPinned = false): boolean {
        const rowUnpinned = this.rowNode.rowPinned == null;
        return (rowUnpinned || (allowManuallyPinned && _isManualPinnedRow(this.rowNode))) && !!value;
    }

    private isCheckboxSelection(colDef: ColDef): boolean | CheckboxSelectionCallback | undefined {
        const { rowSelection, groupDisplayType } = this.beans.gridOptions;
        const checkboxLocation = _getCheckboxLocation(rowSelection);
        const isSelectionColumn = isColumnSelectionCol(this.column);

        // Specific check for custom group display type here because we assume one of the non-selection
        // columns will have `showRowGroup != null` and so in this case we will be rendering the checkbox
        // in the group cell rather than here (the selection column)
        if (groupDisplayType === 'custom' && checkboxLocation !== 'selectionColumn' && isSelectionColumn) {
            return false;
        }

        return (
            colDef.checkboxSelection ||
            (isSelectionColumn && typeof rowSelection === 'object' && _getCheckboxes(rowSelection))
        );
    }

    private refreshShouldDestroy(): boolean {
        const colDef = this.column.getColDef();
        const selectionChanged = this.includeSelection != this.isIncludeControl(this.isCheckboxSelection(colDef), true);
        const rowDragChanged = this.includeRowDrag != this.isIncludeControl(colDef.rowDrag);
        const dndSourceChanged = this.includeDndSource != this.isIncludeControl(colDef.dndSource);
        // auto height uses wrappers, so need to destroy
        const autoHeightChanged = this.isAutoHeight != this.column.isAutoHeight();

        return selectionChanged || rowDragChanged || dndSourceChanged || autoHeightChanged;
    }

    public onPopupEditorClosed(): void {
        if (!this.editing) {
            return;
        }
        // note: this happens because of a click outside of the grid or if the popupEditor
        // is closed with `Escape` key. if another cell was clicked, then the editing will
        // have already stopped and returned on the conditional above.
        this.beans.editSvc?.stopRowOrCellEdit(this);
    }

    /**
     * Ends the Cell Editing
     * @param cancel `True` if the edit process is being canceled.
     * @returns `True` if the value of the `GridCell` has been updated, otherwise `False`.
     */
    public stopEditing(cancel = false): boolean {
        return this.beans.editSvc?.stopEditing(this, cancel) ?? false;
    }

    private createCellRendererParams(): ICellRendererParams {
        const {
            value,
            valueFormatted,
            column,
            rowNode,
            comp,
            eGui,
            beans: { valueSvc, gos },
        } = this;
        const res: ICellRendererParams = _addGridCommonParams(gos, {
            value: value,
            valueFormatted: valueFormatted,
            getValue: () => valueSvc.getValueForDisplay(column, rowNode).value,
            setValue: (value: any) => valueSvc.setValue(rowNode, column, value),
            formatValue: this.formatValue.bind(this),
            data: rowNode.data,
            node: rowNode,
            pinned: column.getPinned() as any,
            colDef: column.getColDef(),
            column,
            refreshCell: this.refreshCell.bind(this),
            eGridCell: eGui,
            eParentOfValue: comp.getParentOfValue()!,

            registerRowDragger: (
                rowDraggerElement: HTMLElement,
                dragStartPixels: number,
                value?: string,
                suppressVisibilityChange?: boolean
            ) => this.registerRowDragger(rowDraggerElement, dragStartPixels, suppressVisibilityChange),
            setTooltip: (value: string, shouldDisplayTooltip: () => boolean) => {
                gos.assertModuleRegistered('Tooltip', 3);
                if (this.tooltipFeature) {
                    this.disableTooltipFeature();
                }
                this.enableTooltipFeature(value, shouldDisplayTooltip);
                this.tooltipFeature?.refreshTooltip();
            },
        });

        return res;
    }

    public onCellChanged(event: CellChangedEvent): void {
        const eventImpactsThisCell = event.column === this.column;

        if (eventImpactsThisCell) {
            this.refreshCell({});
        }
    }

    public refreshOrDestroyCell(params?: { suppressFlash?: boolean; newData?: boolean; forceRefresh?: boolean }): void {
        if (this.refreshShouldDestroy()) {
            this.rowCtrl?.recreateCell(this);
        } else {
            this.refreshCell(params);
        }
    }

    // + stop editing {forceRefresh: true, suppressFlash: true}
    // + event cellChanged {}
    // + cellRenderer.params.refresh() {} -> method passes 'as is' to the cellRenderer, so params could be anything
    // + rowCtrl: event dataChanged {suppressFlash: !update, newData: !update}
    // + rowCtrl: api refreshCells() {animate: true/false}
    // + rowRenderer: api softRefreshView() {}
    public refreshCell(params?: { suppressFlash?: boolean; newData?: boolean; forceRefresh?: boolean }) {
        // if we are in the middle of 'stopEditing', then we don't refresh here, as refresh gets called explicitly
        if (this.suppressRefreshCell || this.editing) {
            return;
        }

        const colDef = this.column.getColDef();
        const newData = params != null && !!params.newData;
        const suppressFlash = params != null && !!params.suppressFlash;
        // we always refresh if cell has no value - this can happen when user provides Cell Renderer and the
        // cell renderer doesn't rely on a value, instead it could be looking directly at the data, or maybe
        // printing the current time (which would be silly)???. Generally speaking
        // non of {field, valueGetter, showRowGroup} is bad in the users application, however for this edge case, it's
        // best always refresh and take the performance hit rather than never refresh and users complaining in support
        // that cells are not updating.
        const noValueProvided = colDef.field == null && colDef.valueGetter == null && colDef.showRowGroup == null;
        const forceRefresh = (params && params.forceRefresh) || noValueProvided || newData;

        const isCellCompReady = !!this.comp;
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
            this.showValue(newData, false);

            // we don't want to flash the cells when processing a filter change, as otherwise the UI would
            // be to busy. see comment in FilterManager with regards processingFilterChange
            const processingFilterChange = this.beans.filterManager?.isSuppressFlashingCellsBecauseFiltering();

            const flashCell = !suppressFlash && !processingFilterChange && colDef.enableCellChangeFlash;

            if (flashCell) {
                this.beans.cellFlashSvc?.flashCell(this);
            }

            this.customStyleFeature?.applyUserStyles();
            this.customStyleFeature?.applyClassesFromColDef();
        }

        this.tooltipFeature?.refreshTooltip();

        // we do cellClassRules even if the value has not changed, so that users who have rules that
        // look at other parts of the row (where the other part of the row might of changed) will work.
        this.customStyleFeature?.applyCellClassRules();
    }

    public isCellEditable(): boolean {
        return this.column.isCellEditable(this.rowNode);
    }

    public formatValue(value: any): any {
        return this.callValueFormatter(value) ?? value;
    }

    private callValueFormatter(value: any): string | null {
        return this.beans.valueSvc.formatValue(this.column, this.rowNode, value);
    }

    public updateAndFormatValue(compareValues: boolean): boolean {
        const oldValue = this.value;
        const oldValueFormatted = this.valueFormatted;

        const { value, valueFormatted } = this.beans.valueSvc.getValueForDisplay(this.column, this.rowNode, true);
        this.value = value;
        this.valueFormatted = valueFormatted;

        if (compareValues) {
            return !this.valuesAreEqual(oldValue, this.value) || this.valueFormatted != oldValueFormatted;
        }
        return true;
    }

    private valuesAreEqual(val1: any, val2: any): boolean {
        // if the user provided an equals method, use that, otherwise do simple comparison
        const colDef = this.column.getColDef();
        return colDef.equals ? colDef.equals(val1, val2) : val1 === val2;
    }

    private addDomData(compBean: BeanStub): void {
        const element = this.eGui;

        _setDomData(this.beans.gos, element, DOM_DATA_KEY_CELL_CTRL, this);
        compBean.addDestroyFunc(() => _setDomData(this.beans.gos, element, DOM_DATA_KEY_CELL_CTRL, null));
    }

    public createEvent<T extends AgEventType>(domEvent: Event | null, eventType: T): CellEvent<T> {
        const { rowNode, column, value, beans } = this;
        const event: CellEvent<T> = _addGridCommonParams(beans.gos, {
            type: eventType,
            node: rowNode,
            data: rowNode.data,
            value,
            column,
            colDef: column.getColDef(),
            rowPinned: rowNode.rowPinned,
            event: domEvent,
            rowIndex: rowNode.rowIndex!,
        });

        return event;
    }

    public processCharacter(event: KeyboardEvent): void {
        this.keyboardListener?.processCharacter(event);
    }

    public onKeyDown(event: KeyboardEvent): void {
        this.keyboardListener?.onKeyDown(event);
    }

    public onMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        this.mouseListener?.onMouseEvent(eventName, mouseEvent);
    }

    public getColSpanningList(): AgColumn[] {
        return this.positionFeature!.getColSpanningList();
    }

    public onLeftChanged(): void {
        if (!this.comp) {
            return;
        }
        this.positionFeature?.onLeftChanged();
    }

    public onDisplayedColumnsChanged(): void {
        if (!this.eGui) {
            return;
        }
        this.refreshAriaColIndex();
        this.refreshFirstAndLastStyles();
    }

    private refreshFirstAndLastStyles(): void {
        const { comp, column, beans } = this;
        refreshFirstAndLastStyles(comp, column, beans.visibleCols);
    }

    private refreshAriaColIndex(): void {
        const colIdx = this.beans.visibleCols.getAriaColIndex(this.column);
        _setAriaColIndex(this.eGui, colIdx); // for react, we don't use JSX, as it slowed down column moving
    }

    public onWidthChanged(): void {
        return this.positionFeature?.onWidthChanged();
    }

    public getRowPosition(): RowPosition {
        const { rowIndex, rowPinned } = this.cellPosition;
        return {
            rowIndex,
            rowPinned,
        };
    }

    public updateRangeBordersIfRangeCount(): void {
        if (!this.comp) {
            return;
        }
        this.rangeFeature?.updateRangeBordersIfRangeCount();
    }

    public onCellSelectionChanged(): void {
        if (!this.comp) {
            return;
        }
        this.rangeFeature?.onCellSelectionChanged();
    }

    public isRangeSelectionEnabled(): boolean {
        return this.rangeFeature != null;
    }

    public focusCell(forceBrowserFocus = false): void {
        this.beans.focusSvc.setFocusedCell({
            ...this.getFocusedCellPosition(),
            forceBrowserFocus,
        });
    }

    /**
     * Restores focus to the cell, if it should have it
     * @param waitForRender if the cell has just setComp, it may not be rendered yet, so we wait for the next render
     */
    private restoreFocus(waitForRender = false): void {
        if (!this.comp || this.editing || !this.isCellFocused() || !this.beans.focusSvc.shouldTakeFocus()) {
            return;
        }

        const focus = () => {
            if (!this.isAlive()) {
                return;
            }
            const focusableElement = this.comp.getFocusableElement();
            if (this.isCellFocused()) {
                focusableElement.focus({ preventScroll: true });
            }
        };

        // if first render; wait for the component to mount to dom
        if (waitForRender) {
            setTimeout(focus, 0);
            return;
        }

        focus();
    }

    public onRowIndexChanged(): void {
        // when index changes, this influences items that need the index, so we update the
        // grid cell so they are working off the new index.
        this.createCellPosition();
        // when the index of the row changes, ie means the cell may have lost or gained focus
        this.onCellFocused();

        // if row index changed, this cell may now need focus
        this.restoreFocus();

        // check range selection
        this.rangeFeature?.onCellSelectionChanged();

        this.rowResizeFeature?.refreshRowResizer();
    }

    public onSuppressCellFocusChanged(suppressCellFocus: boolean): void {
        const element = this.eGui;
        if (!element) {
            return;
        }
        if (isRowNumberCol(this.column)) {
            suppressCellFocus = true;
        }
        _addOrRemoveAttribute(element, 'tabindex', suppressCellFocus ? undefined : -1);
    }

    public onFirstRightPinnedChanged(): void {
        if (!this.comp) {
            return;
        }
        const firstRightPinned = this.column.isFirstRightPinned();
        this.comp.toggleCss(CSS_CELL_FIRST_RIGHT_PINNED, firstRightPinned);
    }

    public onLastLeftPinnedChanged(): void {
        if (!this.comp) {
            return;
        }
        const lastLeftPinned = this.column.isLastLeftPinned();
        this.comp.toggleCss(CSS_CELL_LAST_LEFT_PINNED, lastLeftPinned);
    }

    /**
     * Returns whether cell is focused by the focusSvc, overridden by spannedCellCtrl
     */
    protected checkCellFocused(): boolean {
        return this.beans.focusSvc.isCellFocused(this.cellPosition);
    }

    public isCellFocused(): boolean {
        const isFocused = this.checkCellFocused();
        this.hasBeenFocused ||= isFocused;
        return isFocused;
    }

    public setupFocus() {
        // when cell is created, if it should be focus the grid should take focus from the focused cell
        this.restoreFocus(true);
        this.onCellFocused(this.focusEventWhileNotReady ?? undefined);
    }

    public onCellFocused(event?: CellFocusedEvent): void {
        const { beans } = this;
        if (_isCellFocusSuppressed(beans)) {
            return;
        }

        if (!this.comp) {
            // scenario: focusing event on cell outside viewport causes cells to force render
            // preserve event for when cell renders.
            if (event) {
                this.focusEventWhileNotReady = event;
            }
            return;
        }

        const cellFocused = this.isCellFocused();

        this.comp.toggleCss(CSS_CELL_FOCUS, cellFocused);

        // see if we need to force browser focus - this can happen if focus is programmatically set
        if (cellFocused && event && event.forceBrowserFocus) {
            let focusEl = this.comp.getFocusableElement();

            if (this.editing) {
                const focusableEls = _findFocusableElements(focusEl, null, true);
                if (focusableEls.length) {
                    focusEl = focusableEls[0];
                }
            }

            focusEl.focus({ preventScroll: !!event.preventScrollOnBrowserFocus });
        }

        // if another cell was focused, and we are editing, then stop editing
        const fullRowEdit = beans.gos.get('editType') === 'fullRow';

        if (!cellFocused && !fullRowEdit && this.editing) {
            beans.editSvc?.stopRowOrCellEdit(this);
        }

        if (cellFocused) {
            this.rowCtrl.announceDescription();
        }
    }

    private createCellPosition(): void {
        const { rowIndex, rowPinned } = this.rowNode;
        this.cellPosition = {
            rowIndex: rowIndex!,
            rowPinned: _makeNull(rowPinned),
            column: this.column,
        };
    }

    public setInlineEditingCss(): void {
        this.beans.editSvc?.setInlineEditingCss(this.rowCtrl);
    }

    // CSS Classes that only get applied once, they never change
    protected applyStaticCssClasses(): void {
        const { comp } = this;
        comp.toggleCss(CSS_CELL, true);
        comp.toggleCss(CSS_CELL_NOT_INLINE_EDITING, true);

        // normal cells fill the height of the row. autoHeight cells have no height to let them
        // fit the height of content.

        const autoHeight = this.column.isAutoHeight() == true;
        comp.toggleCss(CSS_AUTO_HEIGHT, autoHeight);
        comp.toggleCss(CSS_NORMAL_HEIGHT, !autoHeight);
    }

    public onColumnHover(): void {
        this.beans.colHover?.onCellColumnHover(this.column, this.comp);
    }

    public onColDefChanged(): void {
        if (!this.comp) {
            return;
        }

        if (this.column.isTooltipEnabled()) {
            this.disableTooltipFeature();
            this.enableTooltipFeature();
        } else {
            this.disableTooltipFeature();
        }

        this.setWrapText();

        if (!this.editing) {
            this.refreshOrDestroyCell({ forceRefresh: true, suppressFlash: true });
        } else {
            this.beans.editSvc?.handleColDefChanged(this);
        }
    }

    private setWrapText(): void {
        const value = this.column.getColDef().wrapText == true;

        this.comp.toggleCss(CSS_CELL_WRAP_TEXT, value);
    }

    public dispatchCellContextMenuEvent(event: Event | null) {
        const colDef = this.column.getColDef();
        const cellContextMenuEvent: CellContextMenuEvent = this.createEvent(event, 'cellContextMenu');

        const { beans } = this;
        beans.eventSvc.dispatchEvent(cellContextMenuEvent);

        if (colDef.onCellContextMenu) {
            // to make the callback async, do in a timeout
            window.setTimeout(() => {
                beans.frameworkOverrides.wrapOutgoing(() => {
                    (colDef.onCellContextMenu as any)(cellContextMenuEvent);
                });
            }, 0);
        }
    }

    public getCellRenderer(): ICellRenderer | null {
        return this.comp?.getCellRenderer() ?? null;
    }

    public override destroy(): void {
        this.onCompAttachedFuncs = [];
        this.onEditorAttachedFuncs = [];

        // if this was focused; (e.g cell span status changes) then we need to restore focus
        if (this.isCellFocused() && this.hasBrowserFocus()) {
            this.beans.focusSvc.attemptToRecoverFocus();
        }

        super.destroy();
    }

    public hasBrowserFocus(): boolean {
        return this.eGui?.contains(_getActiveDomElement(this.beans)) ?? false;
    }

    public createSelectionCheckbox(): CheckboxSelectionComponent | undefined {
        const cbSelectionComponent = this.beans.selectionSvc?.createCheckboxSelectionComponent();
        if (!cbSelectionComponent) {
            return undefined;
        }

        this.beans.context.createBean(cbSelectionComponent);
        cbSelectionComponent.init({ rowNode: this.rowNode, column: this.column });

        // put the checkbox in before the value
        return cbSelectionComponent;
    }

    public createDndSource(): DndSourceComp | undefined {
        const dndSourceComp = this.beans.registry.createDynamicBean<DndSourceComp>(
            'dndSourceComp',
            false,
            this.rowNode,
            this.column,
            this.eGui
        );
        if (dndSourceComp) {
            this.beans.context.createBean(dndSourceComp);
        }

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
            this.addDestroyFunc(() => {
                this.beans.context.destroyBean(newComp);
                (this.customRowDragComp as any) = null;
            });
        }
    }

    public createRowDragComp(
        customElement?: HTMLElement,
        dragStartPixels?: number,
        suppressVisibilityChange?: boolean
    ): RowDragComp | undefined {
        const rowDragComp = this.beans.rowDragSvc?.createRowDragCompForCell(
            this.rowNode,
            this.column,
            () => this.value,
            customElement,
            dragStartPixels,
            suppressVisibilityChange
        );
        if (!rowDragComp) {
            return undefined;
        }
        this.beans.context.createBean(rowDragComp);

        return rowDragComp;
    }

    public cellEditorAttached(): void {
        this.onEditorAttachedFuncs.forEach((func) => func());
        this.onEditorAttachedFuncs = [];
    }

    public setFocusedCellPosition(_cellPosition: CellPosition): void {
        // noop, used by spannedCellCtrl
    }

    public getFocusedCellPosition() {
        return this.cellPosition;
    }

    // used by spannedCellCtrl
    public refreshAriaRowIndex(): void {}

    /**
     * Returns the root element of the cell, could be a span container rather than the cell element.
     * @returns The root element of the cell.
     */
    public getRootElement(): HTMLElement {
        return this.eGui;
    }
}
