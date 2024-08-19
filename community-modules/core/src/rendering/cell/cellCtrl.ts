import type { UserCompDetails } from '../../components/framework/userComponentFactory';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { CellPosition } from '../../entities/cellPositionUtils';
import type { CellStyle } from '../../entities/colDef';
import type { RowNode } from '../../entities/rowNode';
import type { RowPosition } from '../../entities/rowPositionUtils';
import type { AgEventType } from '../../eventTypes';
import type { CellContextMenuEvent, CellEvent, CellFocusedEvent, FlashCellsEvent } from '../../events';
import { _getDocument, _getRowHeightForNode, _isClientSideRowModel, _setDomData } from '../../gridOptionsUtils';
import { refreshFirstAndLastStyles } from '../../headerRendering/cells/cssClassApplier';
import type { BrandedType } from '../../interfaces/brandedType';
import type { ICellEditor } from '../../interfaces/iCellEditor';
import type { CellChangedEvent } from '../../interfaces/iRowNode';
import { _setAriaColIndex } from '../../utils/aria';
import { _addOrRemoveAttribute, _getElementSize } from '../../utils/dom';
import { _warnOnce } from '../../utils/function';
import { _exists, _makeNull } from '../../utils/generic';
import { _getValueUsingField } from '../../utils/object';
import { _escapeString } from '../../utils/string';
import type { ITooltipFeatureCtrl } from '../../widgets/tooltipFeature';
import { TooltipFeature } from '../../widgets/tooltipFeature';
import type { ICellRenderer, ICellRendererParams } from '../cellRenderers/iCellRenderer';
import { CheckboxSelectionComponent } from '../checkboxSelectionComponent';
import { DndSourceComp } from '../dndSourceComp';
import type { RowCtrl } from '../row/rowCtrl';
import { RowDragComp } from '../row/rowDragComp';
import type { FlashCellsParams } from '../rowRenderer';
import { CellCustomStyleFeature } from './cellCustomStyleFeature';
import { CellKeyboardListenerFeature } from './cellKeyboardListenerFeature';
import { CellMouseListenerFeature } from './cellMouseListenerFeature';
import { CellPositionFeature } from './cellPositionFeature';
import { CellRangeFeature } from './cellRangeFeature';

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

let instanceIdSequence = 0;
export type CellCtrlInstanceId = BrandedType<string, 'CellCtrlInstanceId'>;

export class CellCtrl extends BeanStub {
    public static DOM_DATA_KEY_CELL_CTRL = 'cellCtrl';

    private instanceId: CellCtrlInstanceId;

    private eGui: HTMLElement;
    private cellComp: ICellComp;
    private editCompDetails?: UserCompDetails;

    private focusEventToRestore: CellFocusedEvent | undefined;

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
    private colIdSanitised: string;
    private isAutoHeight: boolean;

    private suppressRefreshCell = false;

    // this comp used only for custom row drag handle (ie when user calls params.registerRowDragger)
    private customRowDragComp: RowDragComp;

    private onCellCompAttachedFuncs: (() => void)[] = [];

    constructor(
        private readonly column: AgColumn,
        private readonly rowNode: RowNode,
        private readonly beans: BeanCollection,
        private readonly rowCtrl: RowCtrl
    ) {
        super();

        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        this.instanceId = (column.getId() + '-' + instanceIdSequence++) as CellCtrlInstanceId;

        this.colIdSanitised = _escapeString(this.column.getId())!;

        this.createCellPosition();
        this.addFeatures();
        this.updateAndFormatValue(false);
    }

    public shouldRestoreFocus(): boolean {
        // Used in React to determine if the cell should restore focus after re-rendering
        return this.beans.focusService.shouldRestoreFocus(this.cellPosition);
    }

    public onFocusOut(): void {
        // Used in React
        this.beans.focusService.clearRestoreFocus();
    }

    private addFeatures(): void {
        this.cellPositionFeature = new CellPositionFeature(this, this.beans);
        this.cellCustomStyleFeature = new CellCustomStyleFeature(this, this.beans);
        this.cellMouseListenerFeature = new CellMouseListenerFeature(this, this.beans, this.column);

        this.cellKeyboardListenerFeature = new CellKeyboardListenerFeature(
            this,
            this.beans,
            this.column,
            this.rowNode,
            this.rowCtrl
        );

        if (this.column.isTooltipEnabled()) {
            this.enableTooltipFeature();
        }

        const rangeSelectionEnabled = this.beans.rangeService && this.beans.gos.get('enableRangeSelection');
        if (rangeSelectionEnabled) {
            this.cellRangeFeature = new CellRangeFeature(this.beans, this);
        }
    }
    private removeFeatures(): void {
        this.cellPositionFeature?.destroy();
        this.cellPositionFeature = null;

        this.cellCustomStyleFeature?.destroy();
        this.cellCustomStyleFeature = null;

        this.cellMouseListenerFeature?.destroy();
        this.cellMouseListenerFeature = null;
        this.cellKeyboardListenerFeature?.destroy();
        this.cellKeyboardListenerFeature = null;

        this.disableTooltipFeature();

        this.cellRangeFeature?.destroy();
        this.cellRangeFeature = null;
    }

    private enableTooltipFeature(value?: string, shouldDisplayTooltip?: () => boolean): void {
        const getTooltipValue = () => {
            const colDef = this.column.getColDef();
            const data = this.rowNode.data;

            if (colDef.tooltipField && _exists(data)) {
                return _getValueUsingField(data, colDef.tooltipField, this.column.isTooltipFieldContainsDots());
            }

            const valueGetter = colDef.tooltipValueGetter;

            if (valueGetter) {
                return valueGetter(
                    this.beans.gos.addGridCommonParams({
                        location: 'cell',
                        colDef: this.column.getColDef(),
                        column: this.column,
                        rowIndex: this.cellPosition.rowIndex,
                        node: this.rowNode,
                        data: this.rowNode.data,
                        value: this.value,
                        valueFormatted: this.valueFormatted,
                    })
                );
            }

            return null;
        };

        const isTooltipWhenTruncated = this.beans.gos.get('tooltipShowMode') === 'whenTruncated';

        if (!shouldDisplayTooltip && isTooltipWhenTruncated && !this.isCellRenderer()) {
            shouldDisplayTooltip = () => {
                const eGui = this.getGui();
                const textEl = eGui.children.length === 0 ? eGui : eGui.querySelector('.ag-cell-value');
                if (!textEl) {
                    return true;
                }

                return textEl.scrollWidth > textEl.clientWidth;
            };
        }

        const tooltipCtrl: ITooltipFeatureCtrl = {
            getColumn: () => this.column,
            getColDef: () => this.column.getColDef(),
            getRowIndex: () => this.cellPosition.rowIndex,
            getRowNode: () => this.rowNode,
            getGui: () => this.getGui(),
            getLocation: () => 'cell',
            getTooltipValue: value != null ? () => value : getTooltipValue,

            // this makes no sense, why is the cell formatted value passed to the tooltip???
            getValueFormatted: () => this.valueFormatted,
            shouldDisplayTooltip,
        };

        this.tooltipFeature = new TooltipFeature(tooltipCtrl, this.beans);
    }

    private disableTooltipFeature() {
        if (!this.tooltipFeature) {
            return;
        }

        this.tooltipFeature.destroy();
        this.tooltipFeature = null;
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

        this.addDomData();

        this.onSuppressCellFocusChanged(this.beans.gos.get('suppressCellFocus'));

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

        this.cellPositionFeature?.setComp(eGui);
        this.cellCustomStyleFeature?.setComp(comp);
        this.tooltipFeature?.refreshToolTip();
        this.cellKeyboardListenerFeature?.setComp(this.eGui);

        if (this.cellRangeFeature) {
            this.cellRangeFeature.setComp(comp, eGui);
        }

        if (startEditing && this.isCellEditable()) {
            this.startEditing();
        } else {
            this.showValue();
        }

        if (this.onCellCompAttachedFuncs.length) {
            this.onCellCompAttachedFuncs.forEach((func) => func());
            this.onCellCompAttachedFuncs = [];
        }
    }

    /** Called from the cellComp when it is being cleaned up.
     * This enables React to run against a destroyed CellCtrl instance and still get sensible values
     * before React destroys the CellComp. This stops flickering in the UI when React is updating lots of cells.
     */
    public unSetComp(): void {
        this.removeFeatures();
    }

    private setupAutoHeight(eCellWrapper?: HTMLElement): void {
        this.isAutoHeight = this.column.isAutoHeight();
        if (!this.isAutoHeight || !eCellWrapper) {
            return;
        }

        const eParentCell = eCellWrapper.parentElement!;
        // taking minRowHeight from getRowHeightForNode means the getRowHeight() callback is used,
        // thus allowing different min heights for different rows.
        const minRowHeight = _getRowHeightForNode(this.beans.gos, this.rowNode).height;

        const measureHeight = (timesCalled: number) => {
            if (this.editing) {
                return;
            }
            // because of the retry's below, it's possible the retry's go beyond
            // the rows life.
            if (!this.isAlive()) {
                return;
            }

            const { paddingTop, paddingBottom, borderBottomWidth, borderTopWidth } = _getElementSize(eParentCell);
            const extraHeight = paddingTop + paddingBottom + borderBottomWidth + borderTopWidth;

            const wrapperHeight = eCellWrapper!.offsetHeight;
            const autoHeight = wrapperHeight + extraHeight;

            if (timesCalled < 5) {
                // if not in doc yet, means framework not yet inserted, so wait for next VM turn,
                // maybe it will be ready next VM turn
                const doc = _getDocument(this.beans.gos);
                const notYetInDom = !doc || !doc.contains(eCellWrapper);

                // this happens in React, where React hasn't put any content in. we say 'possibly'
                // as a) may not be React and b) the cell could be empty anyway
                const possiblyNoContentYet = autoHeight == 0;

                if (notYetInDom || possiblyNoContentYet) {
                    window.setTimeout(() => measureHeight(timesCalled + 1), 0);
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

    public getCellAriaRole(): string {
        return this.column.getColDef().cellAriaRole ?? 'gridcell';
    }

    public getInstanceId(): CellCtrlInstanceId {
        return this.instanceId;
    }
    public getColumnIdSanitised(): string {
        return this.colIdSanitised;
    }
    public isCellRenderer(): boolean {
        const colDef = this.column.getColDef();
        return colDef.cellRenderer != null || colDef.cellRendererSelector != null;
    }
    public getValueToDisplay(): any {
        return this.valueFormatted ?? this.value;
    }

    private showValue(forceNewCellRendererInstance = false): void {
        const valueToDisplay = this.getValueToDisplay();
        let compDetails: UserCompDetails | undefined;

        // if node is stub, and no group data for this node (groupSelectsChildren can populate group data)
        const isSsrmLoading = this.rowNode.stub && this.rowNode.groupData?.[this.column.getId()] == null;
        if (isSsrmLoading) {
            const params = this.createCellRendererParams();
            compDetails = this.beans.userComponentFactory.getLoadingCellRendererDetails(
                this.column.getColDef(),
                params
            );
        } else if (this.isCellRenderer()) {
            const params = this.createCellRendererParams();
            compDetails = this.beans.userComponentFactory.getCellRendererDetails(this.column.getColDef(), params);
        }
        this.cellComp.setRenderDetails(compDetails, valueToDisplay, forceNewCellRendererInstance);
        this.cellRangeFeature?.refreshHandle();
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
        const forceWrapper = this.beans.gos.get('enableCellTextSelection') || this.column.isAutoHeight();
        return forceWrapper;
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    private isIncludeControl(value: boolean | Function | undefined): boolean {
        const rowNodePinned = this.rowNode.rowPinned != null;
        const isFunc = typeof value === 'function';
        const res = rowNodePinned ? false : isFunc || value === true;

        return res;
    }

    private refreshShouldDestroy(): boolean {
        const colDef = this.column.getColDef();
        const selectionChanged = this.includeSelection != this.isIncludeControl(colDef.checkboxSelection);
        const rowDragChanged = this.includeRowDrag != this.isIncludeControl(colDef.rowDrag);
        const dndSourceChanged = this.includeDndSource != this.isIncludeControl(colDef.dndSource);
        // auto height uses wrappers, so need to destroy
        const autoHeightChanged = this.isAutoHeight != this.column.isAutoHeight();

        return selectionChanged || rowDragChanged || dndSourceChanged || autoHeightChanged;
    }

    // either called internally if single cell editing, or called by rowRenderer if row editing
    public startEditing(
        key: string | null = null,
        cellStartedEdit = false,
        event: KeyboardEvent | MouseEvent | null = null
    ): void {
        const { editService } = this.beans;
        if (!this.isCellEditable() || this.editing || !editService) {
            return;
        }

        // because of async in React, the cellComp may not be set yet, if no cellComp then we are
        // yet to initialise the cell, so we re-schedule this operation for when celLComp is attached
        if (!this.cellComp) {
            this.onCellCompAttachedFuncs.push(() => {
                this.startEditing(key, cellStartedEdit, event);
            });
            return;
        }

        editService.startEditing(this, key, cellStartedEdit, event);
    }

    public setEditing(editing: boolean, compDetails: UserCompDetails | undefined): void {
        this.editCompDetails = compDetails;
        if (this.editing === editing) {
            return;
        }

        this.editing = editing;
        this.cellRangeFeature?.refreshHandle();
    }

    // pass in 'true' to cancel the editing.
    public stopRowOrCellEdit(cancel: boolean = false) {
        if (this.beans.gos.get('editType') === 'fullRow') {
            this.rowCtrl.stopEditing(cancel);
        } else {
            this.stopEditing(cancel);
        }
    }

    public onPopupEditorClosed(): void {
        if (!this.editing) {
            return;
        }
        // note: this happens because of a click outside of the grid or if the popupEditor
        // is closed with `Escape` key. if another cell was clicked, then the editing will
        // have already stopped and returned on the conditional above.
        this.stopEditingAndFocus();
    }

    /**
     * Ends the Cell Editing
     * @param cancel `True` if the edit process is being canceled.
     * @returns `True` if the value of the `GridCell` has been updated, otherwise `False`.
     */
    public stopEditing(cancel = false): boolean {
        const { editService } = this.beans;
        if (!this.editing || !editService) {
            return false;
        }

        return editService.stopEditing(this, cancel);
    }

    private createCellRendererParams(): ICellRendererParams {
        const res: ICellRendererParams = this.beans.gos.addGridCommonParams({
            value: this.value,
            valueFormatted: this.valueFormatted,
            getValue: () => this.beans.valueService.getValueForDisplay(this.column, this.rowNode),
            setValue: (value: any) => this.beans.valueService.setValue(this.rowNode, this.column, value),
            formatValue: this.formatValue.bind(this),
            data: this.rowNode.data,
            node: this.rowNode,
            pinned: this.column.getPinned() as any,
            colDef: this.column.getColDef(),
            column: this.column,
            refreshCell: this.refreshCell.bind(this),
            eGridCell: this.getGui(),
            eParentOfValue: this.cellComp.getParentOfValue()!,

            registerRowDragger: (
                rowDraggerElement: HTMLElement,
                dragStartPixels: number,
                value?: string,
                suppressVisibilityChange?: boolean
            ) => this.registerRowDragger(rowDraggerElement, dragStartPixels, suppressVisibilityChange),
            setTooltip: (value: string, shouldDisplayTooltip: () => boolean) => {
                if (this.tooltipFeature) {
                    this.disableTooltipFeature();
                }
                this.enableTooltipFeature(value, shouldDisplayTooltip);
                this.tooltipFeature?.refreshToolTip();
            },
        });

        return res;
    }

    public setFocusOutOnEditor(): void {
        if (!this.editing) {
            return;
        }
        this.beans.editService?.setFocusOutOnEditor(this);
    }

    public setFocusInOnEditor(): void {
        if (!this.editing) {
            return;
        }
        this.beans.editService?.setFocusInOnEditor(this);
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
            const processingFilterChange = this.beans.filterManager?.isSuppressFlashingCellsBecauseFiltering();

            const flashCell =
                !suppressFlash &&
                !processingFilterChange &&
                (this.beans.gos.get('enableCellChangeFlash') || colDef.enableCellChangeFlash);

            if (flashCell) {
                this.flashCell();
            }

            this.cellCustomStyleFeature?.applyUserStyles();
            this.cellCustomStyleFeature?.applyClassesFromColDef();
        }

        this.tooltipFeature?.refreshToolTip();

        // we do cellClassRules even if the value has not changed, so that users who have rules that
        // look at other parts of the row (where the other part of the row might of changed) will work.
        this.cellCustomStyleFeature?.applyCellClassRules();
    }

    // cell editors call this, when they want to stop for reasons other
    // than what we pick up on. eg selecting from a dropdown ends editing.
    public stopEditingAndFocus(suppressNavigateAfterEdit = false, shiftKey: boolean = false): void {
        this.beans.editService?.stopEditingAndFocus(this, suppressNavigateAfterEdit, shiftKey);
    }

    // user can also call this via API
    public flashCell(
        delays?: Pick<FlashCellsParams, 'fadeDelay' | 'flashDelay' | 'fadeDuration' | 'flashDuration'>
    ): void {
        const flashDuration = delays?.flashDuration ?? delays?.flashDelay;
        const fadeDuration = delays?.fadeDuration ?? delays?.fadeDelay;

        this.animateCell('data-changed', flashDuration, fadeDuration);
    }

    private animateCell(cssName: string, flashDuration?: number | null, fadeDuration?: number | null): void {
        if (!this.cellComp) {
            return;
        }
        const { gos } = this.beans;

        if (!flashDuration) {
            flashDuration = gos.get('cellFlashDuration');
        }

        if (flashDuration === 0) {
            return;
        }

        if (!_exists(fadeDuration)) {
            fadeDuration = gos.get('cellFadeDuration');
        }

        const fullName = `ag-cell-${cssName}`;
        const animationFullName = `ag-cell-${cssName}-animation`;

        // we want to highlight the cells, without any animation
        this.cellComp.addOrRemoveCssClass(fullName, true);
        this.cellComp.addOrRemoveCssClass(animationFullName, false);

        // then once that is applied, we remove the highlight with animation
        this.beans.frameworkOverrides.wrapIncoming(() => {
            window.setTimeout(() => {
                if (!this.isAlive()) {
                    return;
                }
                this.cellComp.addOrRemoveCssClass(fullName, false);
                this.cellComp.addOrRemoveCssClass(animationFullName, true);

                this.eGui.style.transition = `background-color ${fadeDuration}ms`;
                window.setTimeout(() => {
                    if (!this.isAlive()) {
                        return;
                    }
                    // and then to leave things as we got them, we remove the animation
                    this.cellComp.addOrRemoveCssClass(animationFullName, false);
                    this.eGui.style.transition = '';
                }, fadeDuration!);
            }, flashDuration!);
        });
    }

    public onFlashCells(event: FlashCellsEvent): void {
        if (!this.cellComp) {
            return;
        }
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

    public formatValue(value: any): any {
        return this.callValueFormatter(value) ?? value;
    }

    private callValueFormatter(value: any): string | null {
        return this.beans.valueService.formatValue(this.column, this.rowNode, value);
    }

    public updateAndFormatValue(compareValues: boolean): boolean {
        const oldValue = this.value;
        const oldValueFormatted = this.valueFormatted;

        this.value = this.beans.valueService.getValueForDisplay(this.column, this.rowNode);
        this.valueFormatted = this.callValueFormatter(this.value);

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

    public getComp(): ICellComp {
        return this.cellComp;
    }

    public getValue(): any {
        return this.value;
    }

    private addDomData(): void {
        const element = this.getGui();

        _setDomData(this.beans.gos, element, CellCtrl.DOM_DATA_KEY_CELL_CTRL, this);
        this.addDestroyFunc(() => _setDomData(this.beans.gos, element, CellCtrl.DOM_DATA_KEY_CELL_CTRL, null));
    }

    public createEvent<T extends AgEventType>(domEvent: Event | null, eventType: T): CellEvent<T> {
        const event: CellEvent<T> = this.beans.gos.addGridCommonParams({
            type: eventType,
            node: this.rowNode,
            data: this.rowNode.data,
            value: this.value,
            column: this.column,
            colDef: this.column.getColDef(),
            rowPinned: this.rowNode.rowPinned,
            event: domEvent,
            rowIndex: this.rowNode.rowIndex!,
        });

        return event;
    }

    public processCharacter(event: KeyboardEvent): void {
        this.cellKeyboardListenerFeature?.processCharacter(event);
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

    public getColSpanningList(): AgColumn[] {
        return this.cellPositionFeature!.getColSpanningList();
    }

    public onLeftChanged(): void {
        if (!this.cellComp) {
            return;
        }
        this.cellPositionFeature?.onLeftChanged();
    }

    public onDisplayedColumnsChanged(): void {
        if (!this.eGui) {
            return;
        }
        this.refreshAriaColIndex();
        this.refreshFirstAndLastStyles();
    }

    private refreshFirstAndLastStyles(): void {
        const { cellComp, column, beans } = this;
        refreshFirstAndLastStyles(cellComp, column, beans.visibleColsService);
    }

    private refreshAriaColIndex(): void {
        const colIdx = this.beans.visibleColsService.getAriaColIndex(this.column);
        _setAriaColIndex(this.getGui(), colIdx); // for react, we don't use JSX, as it slowed down column moving
    }

    public isSuppressNavigable(): boolean {
        return this.column.isSuppressNavigable(this.rowNode);
    }

    public onWidthChanged(): void {
        return this.cellPositionFeature?.onWidthChanged();
    }

    public getColumn(): AgColumn {
        return this.column;
    }

    public getRowNode(): RowNode {
        return this.rowNode;
    }

    public isPrintLayout(): boolean {
        return this.printLayout;
    }

    public getCellPosition(): CellPosition {
        return this.cellPosition;
    }

    public isEditing(): boolean {
        return this.editing;
    }

    // called by rowRenderer when user navigates via tab key
    public startRowOrCellEdit(key?: string | null, event: KeyboardEvent | MouseEvent | null = null): void {
        // because of async in React, the cellComp may not be set yet, if no cellComp then we are
        // yet to initialise the cell, so we re-schedule this operation for when celLComp is attached
        if (!this.cellComp) {
            this.onCellCompAttachedFuncs.push(() => {
                this.startRowOrCellEdit(key, event);
            });
            return;
        }

        if (this.beans.gos.get('editType') === 'fullRow') {
            this.rowCtrl.startRowEditing(key, this);
        } else {
            this.startEditing(key, true, event);
        }
    }

    public getRowCtrl(): RowCtrl {
        return this.rowCtrl;
    }

    public getRowPosition(): RowPosition {
        return {
            rowIndex: this.cellPosition.rowIndex,
            rowPinned: this.cellPosition.rowPinned,
        };
    }

    public updateRangeBordersIfRangeCount(): void {
        if (!this.cellComp) {
            return;
        }
        if (this.cellRangeFeature) {
            this.cellRangeFeature.updateRangeBordersIfRangeCount();
        }
    }

    public onRangeSelectionChanged(): void {
        if (!this.cellComp) {
            return;
        }
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
            forceBrowserFocus,
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

    public onSuppressCellFocusChanged(suppressCellFocus: boolean): void {
        if (!this.eGui) {
            return;
        }
        _addOrRemoveAttribute(this.eGui, 'tabindex', suppressCellFocus ? undefined : -1);
    }

    public onFirstRightPinnedChanged(): void {
        if (!this.cellComp) {
            return;
        }
        const firstRightPinned = this.column.isFirstRightPinned();
        this.cellComp.addOrRemoveCssClass(CSS_CELL_FIRST_RIGHT_PINNED, firstRightPinned);
    }

    public onLastLeftPinnedChanged(): void {
        if (!this.cellComp) {
            return;
        }
        const lastLeftPinned = this.column.isLastLeftPinned();
        this.cellComp.addOrRemoveCssClass(CSS_CELL_LAST_LEFT_PINNED, lastLeftPinned);
    }

    public onCellFocused(event?: CellFocusedEvent): void {
        if (this.beans.focusService.isCellFocusSuppressed()) {
            return;
        }
        const cellFocused = this.beans.focusService.isCellFocused(this.cellPosition);

        if (!this.cellComp) {
            if (cellFocused && event?.forceBrowserFocus) {
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
            let focusEl = this.cellComp.getFocusableElement();

            if (this.editing) {
                const focusableEls = this.beans.focusService.findFocusableElements(focusEl, null, true);
                if (focusableEls.length) {
                    focusEl = focusableEls[0];
                }
            }

            focusEl.focus({ preventScroll: !!event.preventScrollOnBrowserFocus });
        }

        // if another cell was focused, and we are editing, then stop editing
        const fullRowEdit = this.beans.gos.get('editType') === 'fullRow';

        if (!cellFocused && !fullRowEdit && this.editing) {
            this.stopRowOrCellEdit();
        }

        if (cellFocused) {
            this.rowCtrl.announceDescription();
        }
    }

    private createCellPosition(): void {
        this.cellPosition = {
            rowIndex: this.rowNode.rowIndex!,
            rowPinned: _makeNull(this.rowNode.rowPinned),
            column: this.column,
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
        if (!this.cellComp) {
            return;
        }
        if (!this.beans.gos.get('columnHoverHighlight')) {
            return;
        }

        const isHovered = this.beans.columnHoverService.isHovered(this.column);
        this.cellComp.addOrRemoveCssClass(CSS_COLUMN_HOVER, isHovered);
    }

    public onColDefChanged(): void {
        if (!this.cellComp) {
            return;
        }

        const isTooltipEnabled = this.column.isTooltipEnabled();
        if (isTooltipEnabled) {
            this.disableTooltipFeature();
            this.enableTooltipFeature();
        } else {
            this.disableTooltipFeature();
        }

        this.setWrapText();

        if (!this.editing) {
            this.refreshOrDestroyCell({ forceRefresh: true, suppressFlash: true });
        } else {
            this.beans.editService?.handleColDefChanged(this);
        }
    }

    private setWrapText(): void {
        const value = this.column.getColDef().wrapText == true;

        this.cellComp.addOrRemoveCssClass(CSS_CELL_WRAP_TEXT, value);
    }

    public dispatchCellContextMenuEvent(event: Event | null) {
        const colDef = this.column.getColDef();
        const cellContextMenuEvent: CellContextMenuEvent = this.createEvent(event, 'cellContextMenu');

        this.beans.eventService.dispatchEvent(cellContextMenuEvent);

        if (colDef.onCellContextMenu) {
            // to make the callback async, do in a timeout
            window.setTimeout(() => {
                this.beans.frameworkOverrides.wrapOutgoing(() => {
                    (colDef.onCellContextMenu as any)(cellContextMenuEvent);
                });
            }, 0);
        }
    }

    public getCellRenderer(): ICellRenderer | null {
        return this.cellComp ? this.cellComp.getCellRenderer() : null;
    }

    public getCellEditor(): ICellEditor | null {
        return this.cellComp ? this.cellComp.getCellEditor() : null;
    }

    public override destroy(): void {
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
        const dndSourceComp = new DndSourceComp(this.rowNode, this.column, this.eGui);
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
        const pagination = this.beans.gos.get('pagination');
        const rowDragManaged = this.beans.gos.get('rowDragManaged');
        const clientSideRowModelActive = _isClientSideRowModel(this.beans.gos);

        if (rowDragManaged) {
            // row dragging only available in default row model
            if (!clientSideRowModelActive) {
                _warnOnce('managed row dragging is only allowed in the Client Side Row Model');
                return;
            }

            if (pagination) {
                _warnOnce('managed row dragging is not possible when doing pagination');
                return;
            }
        }

        // otherwise (normal case) we are creating a RowDraggingComp for the first time
        const rowDragComp = new RowDragComp(
            () => this.value,
            this.rowNode,
            this.column,
            customElement,
            dragStartPixels,
            suppressVisibilityChange
        );
        this.beans.context.createBean(rowDragComp);

        return rowDragComp;
    }

    public setSuppressRefreshCell(suppressRefreshCell: boolean): void {
        this.suppressRefreshCell = suppressRefreshCell;
    }

    public getEditCompDetails(): UserCompDetails | undefined {
        return this.editCompDetails;
    }
}
