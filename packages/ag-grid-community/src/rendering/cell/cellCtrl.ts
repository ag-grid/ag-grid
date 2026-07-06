import {
    AgPromise,
    KeyCode,
    _addOrRemoveAttribute,
    _findFocusableElements,
    _getActiveDomElement,
    _makeNull,
    _placeCaretAtEnd,
    _setAriaColIndex,
    _setAriaRowIndex,
} from 'ag-stack';

import { isColumnSelectionCol, isRowNumberCol } from '../../columns/columnUtils';
import { _getCellRendererDetails, _getLoadingCellRendererDetails } from '../../components/framework/userCompUtils';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { RowDragComp } from '../../dragAndDrop/rowDragComp';
import type { EditService } from '../../edit/editService';
import type { AgColumn } from '../../entities/agColumn';
import type { CellClassRules, CellStyle, CheckboxSelectionCallback, ColDef } from '../../entities/colDef';
import type { RowNode } from '../../entities/rowNode';
import type { AgEventType } from '../../eventTypes';
import type { CellContextMenuEvent, CellEvent, CellFocusedEvent } from '../../events';
import {
    _addGridCommonParams,
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
import type { RefreshCellsParams } from '../../interfaces/iCellsParams';
import type { CellChangedEvent } from '../../interfaces/iRowNode';
import type { RowPosition } from '../../interfaces/iRowPosition';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import type { INotesFeature } from '../../interfaces/notes';
import type { IRowNumbersRowResizeFeature } from '../../interfaces/rowNumbers';
import type { ILoadingCellRendererParams } from '../../main-umd-noStyles';
import { _isManualPinnedRow } from '../../pinnedRowModel/pinnedRowUtils';
import type { CheckboxSelectionComponent } from '../../selection/checkboxSelectionComponent';
import { CSS_CALCULATED_COLUMN, CSS_CALCULATED_COLUMN_HIGHLIGHTED } from '../../styling/calculatedColumnCss';
import type { TooltipFeature } from '../../tooltip/tooltipFeature';
import { _isCellFocusSuppressed } from '../../utils/gridFocus';
import type { ICellRenderer, ICellRendererParams } from '../cellRenderers/iCellRenderer';
import type { DndSourceComp } from '../dndSourceComp';
import { DOM_DATA_KEY_CELL_CTRL } from '../renderUtils';
import type { RowCtrl } from '../row/rowCtrl';
import type { CellSpan } from '../spanning/rowSpanCache';
import { _createCellEvent } from './cellEvent';
import { _onCellKeyDown, _processCellCharacter } from './cellKeyboardListenerFeature';
import { _onCellMouseEvent } from './cellMouseListenerFeature';
import {
    _getColSpanningList,
    _initCellPosition,
    _onCellLeftChanged,
    _onCellWidthChanged,
    _setupCellPosition,
} from './cellPositionFeature';

const CSS_CELL = 'ag-cell';
const CSS_AUTO_HEIGHT = 'ag-cell-auto-height';
const CSS_NORMAL_HEIGHT = 'ag-cell-normal-height';
const CSS_CELL_FOCUS = 'ag-cell-focus';
const CSS_CELL_FIRST_RIGHT_PINNED = 'ag-cell-first-right-pinned';
const CSS_CELL_LAST_LEFT_PINNED = 'ag-cell-last-left-pinned';
const CSS_CELL_NOT_INLINE_EDITING = 'ag-cell-not-inline-editing';
const CSS_CELL_WRAP_TEXT = 'ag-cell-wrap-text';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ICellComp {
    toggleCss(cssClassName: string, on: boolean): void;
    setUserStyles(styles: CellStyle): void;
    getFocusableElement(): HTMLElement;

    setIncludeSelection(include: boolean): void;
    setIncludeRowDrag(include: boolean): void;
    setIncludeDndSource(include: boolean): void;
    setRowResizerElement(element: HTMLElement | null): void;

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
    refreshEditStyles: (editing: boolean, isPopup: boolean) => void;
}

let instanceIdSequence = 0;
export type CellCtrlInstanceId = BrandedType<string, 'CellCtrlInstanceId'>;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class CellCtrl extends BeanStub {
    public readonly instanceId: CellCtrlInstanceId;

    public eGui: HTMLElement;

    public comp: ICellComp;
    public editCompDetails?: UserCompDetails;

    public printLayout: boolean;

    public value: any;
    public valueFormatted: any;

    // per-cell custom-style diffing state, owned by the cellStyles functions (styling/cellCustomStyleFeature)
    public customStyleStaticClasses?: string[];
    public customStyleClassRules?: CellClassRules;

    public lastIPadMouseClickEvent = 0;

    // per-cell positioning state, owned by the cell position functions (rendering/cell/cellPositionFeature)
    public colsSpanning?: AgColumn[];
    public rowSpan = 1;

    public rangeFeature: ICellRangeFeature | undefined = undefined;
    private rowResizeFeature: IRowNumbersRowResizeFeature | undefined = undefined;
    private notesFeature: INotesFeature | undefined = undefined;
    private calculatedColumnCssApplied = false;
    private calculatedColumnHighlightedCssApplied = false;
    private hasActiveRenderer = false;

    public cellPosition: CellPosition;

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

    private readonly editSvc?: EditService;
    private readonly hasEdit: boolean = false;

    public tooltipFeature: TooltipFeature | undefined = undefined;
    public editorTooltipFeature: TooltipFeature | undefined = undefined;

    constructor(
        public readonly column: AgColumn,
        public readonly rowNode: RowNode,
        beans: BeanCollection,
        public readonly rowCtrl: RowCtrl
    ) {
        super();
        this.beans = beans;
        this.gos = beans.gos;
        this.editSvc = beans.editSvc;
        this.hasEdit = !!beans.editSvc;

        const { colId } = column;
        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        this.instanceId = (colId + '-' + instanceIdSequence++) as CellCtrlInstanceId;

        this.createCellPosition();
        this.updateAndFormatValue(false);
        // must stay in the constructor, not setComp — see _setupCellPosition
        _setupCellPosition(beans, this);
    }

    private addFeatures(): void {
        const { beans } = this;

        this.enableTooltipFeature();

        const { rangeSvc } = beans;
        const cellSelectionEnabled = rangeSvc && _isCellSelectionEnabled(beans.gos);
        if (cellSelectionEnabled) {
            this.rangeFeature = rangeSvc.createCellRangeFeature(this);
        }

        if (isRowNumberCol(this.column)) {
            this.rowResizeFeature = this.beans.rowNumbersSvc!.createRowNumbersRowResizerFeature(this);
        }

        this.notesFeature = this.beans.notesSvc?.createNotesFeature(this);
    }

    public isCellSpanning(): boolean {
        return false;
    }

    public getCellSpan(): CellSpan | undefined {
        return undefined;
    }

    private removeFeatures(): void {
        const context = this.beans.context;
        this.editorTooltipFeature = context.destroyBean(this.editorTooltipFeature);
        this.rangeFeature = context.destroyBean(this.rangeFeature);
        this.rowResizeFeature = context.destroyBean(this.rowResizeFeature);
        this.notesFeature = context.destroyBean(this.notesFeature);

        this.disableTooltipFeature();
    }

    private enableTooltipFeature(value?: string, shouldDisplayTooltip?: () => boolean): void {
        this.tooltipFeature = this.beans.tooltipSvc?.enableCellTooltipFeature(this, value, shouldDisplayTooltip);
    }

    private disableTooltipFeature() {
        this.tooltipFeature = this.beans.context.destroyBean(this.tooltipFeature);
    }

    public resetCellRendererTooltip(): void {
        if (!this.isAlive()) {
            return;
        }

        this.disableTooltipFeature();
        this.enableTooltipFeature();
        this.tooltipFeature?.refreshTooltip();
    }

    public enableEditorTooltipFeature(editor: ICellEditor): void {
        if (this.editorTooltipFeature) {
            this.disableEditorTooltipFeature();
        }
        this.editorTooltipFeature = this.beans.tooltipSvc?.setupCellEditorTooltip(this, editor);

        this.editSvc?.populateModelValidationErrors();
    }

    public disableEditorTooltipFeature(): void {
        this.editorTooltipFeature = this.beans.context.destroyBean(this.editorTooltipFeature);
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
        this.checkFormulaError();
        this.refreshAriaRowIndex();
        this.refreshAriaColIndex();

        _initCellPosition(this.beans, this);
        this.beans.cellStyles?.setupCellCustomStyle(this);
        this.editSvc?.applyCellEditStyles(this);
        this.tooltipFeature?.refreshTooltip();
        this.rangeFeature?.setComp(comp);
        this.rowResizeFeature?.refreshRowResizer();

        const editable = startEditing ? this.isCellEditable() : undefined;
        const continuingEdit = !editable && this.hasEdit && this.editSvc?.isEditing(this, { withOpenEditor: true });

        if (editable || continuingEdit) {
            this.editSvc?.startEditing(this, {
                startedEdit: false,
                source: 'api',
                silent: true,
                continueEditing: true,
                editable,
            });
        } else {
            // We can skip refreshing the range handle as this is done in this.rangeFeature.setComp above
            this.showValue(false, true);
        }

        if (this.onCompAttachedFuncs.length) {
            for (const func of this.onCompAttachedFuncs) {
                func();
            }
            this.onCompAttachedFuncs = [];
        }
    }

    private checkFormulaError() {
        const formula = this.beans.formula;
        if (!formula || (!formula.active && !this.isCalculatedColumn())) {
            return;
        }
        this.eGui.classList.toggle('formula-error', this.hasFormulaError());
    }

    private hasFormulaError(): boolean {
        const formula = this.beans.formula;

        if (!formula || (!formula.active && !this.isCalculatedColumn())) {
            return false;
        }

        return !!formula.getFormulaError(this.column, this.rowNode);
    }

    private hasCellValidationError(): boolean {
        const { editModelSvc } = this.beans;

        if (!editModelSvc) {
            return false;
        }
        return editModelSvc.getCellValidationModel().hasCellValidation(this);
    }

    private setupAutoHeight(eCellWrapper: HTMLElement | undefined, compBean: BeanStub): void {
        this.isAutoHeight = this.beans.rowAutoHeight?.setupCellAutoHeight(this, eCellWrapper, compBean) ?? false;
    }

    public getCellAriaRole(): string {
        return this.column.colDef.cellAriaRole ?? 'gridcell';
    }

    public isCellRenderer(): boolean {
        const colDef = this.column.colDef;
        return colDef.cellRenderer != null || colDef.cellRendererSelector != null;
    }

    // Unlike config-based isCellRenderer(), this reflects whether the last render actually produced a
    // renderer: a cellRendererSelector returning undefined renders plain text yet isCellRenderer() is true.
    public hasActiveCellRenderer(): boolean {
        return this.hasActiveRenderer;
    }
    public getValueToDisplay(): any {
        return this.valueFormatted ?? this.value;
    }

    public getDeferLoadingCellRenderer(): {
        loadingComp: UserCompDetails | undefined;
        onReady: AgPromise<void>;
    } {
        const { beans, column } = this;
        const { userCompFactory, ctrlsSvc, eventSvc } = beans;

        const colDef = column.colDef;
        const params = this.createCellRendererParams() as ILoadingCellRendererParams;
        params.deferRender = true;

        const loadingDetails = _getLoadingCellRendererDetails(userCompFactory, colDef, params);

        if (ctrlsSvc.getGridBodyCtrl()?.scrollFeature?.isScrolling()) {
            // If the grid is scrolling return a promise that resolves when scrolling is finished
            // This prevents scroll being blocked by the rendering of a slow component
            let resolver: () => void;
            const onReady = new AgPromise<void>((resolve) => {
                resolver = resolve;
            });

            const [removeBodyScrollEnd] = this.addManagedListeners(eventSvc, {
                bodyScrollEnd: () => {
                    resolver();
                    removeBodyScrollEnd();
                },
            });
            return { loadingComp: loadingDetails, onReady };
        }

        // If not scrolling return a resolved promise immediately
        return { loadingComp: loadingDetails, onReady: AgPromise.resolve() };
    }

    private showValue(forceNewCellRendererInstance: boolean, skipRangeHandleRefresh: boolean): void {
        const { beans, column, rowNode, rangeFeature } = this;
        const { userCompFactory } = beans;
        let valueToDisplay = this.getValueToDisplay();
        let compDetails: UserCompDetails | undefined;

        // if node is stub, and no group data for this node (groupSelectsChildren can populate group data)
        const isSsrmLoading = rowNode.stub && rowNode.groupData?.[column.getId()] == null;
        const colDef = column.colDef;

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
                { ...column.colDef, cellRenderer: 'agFindCellRenderer' },
                params
            );
        }

        if (
            this.hasEdit &&
            this.editSvc!.isBatchEditing() &&
            this.editSvc!.isRowEditing(rowNode, { checkSiblings: true })
        ) {
            const result = this.editSvc!.prepDetailsDuringBatch(this, { compDetails, valueToDisplay });
            if (result) {
                if (result.compDetails) {
                    compDetails = result.compDetails;
                } else if (result.valueToDisplay) {
                    valueToDisplay = result.valueToDisplay;
                }
            }
        }

        this.hasActiveRenderer = compDetails != null;
        this.comp.setRenderDetails(compDetails, valueToDisplay, forceNewCellRendererInstance);

        this.customRowDragComp?.refreshVisibility();

        if (!skipRangeHandleRefresh && rangeFeature) {
            // Don't call expensive _requestAnimationFrame if we don't have to
            rangeFeature.scheduleRefreshRangeStyleAndHandle();
        }

        this.rowResizeFeature?.refreshRowResizer();
    }

    private setupControlComps(): void {
        const colDef = this.column.colDef;
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

    public getCellValueClass(): string {
        const prefix = 'ag-cell-value';
        const isCheckboxRenderer = this.column.colDef.cellRenderer === 'agCheckboxCellRenderer';
        let suffix = '';

        if (isCheckboxRenderer) {
            suffix = ' ag-allow-overflow';
        }

        return `${prefix}${suffix}`;
    }

    /**
     * Wrapper providing general conditions under which control elements (e.g. checkboxes and drag handles)
     * are rendered for a particular cell.
     * @param value Whether to render the control in the specific context of the caller
     * @param allowManuallyPinned Whether manually pinned rows are permitted this form of control element
     */
    private isIncludeControl(
        value: boolean | ((...args: any[]) => any) | undefined,
        allowManuallyPinned = false
    ): boolean {
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
        const colDef = this.column.colDef;
        const selectionChanged = this.includeSelection != this.isIncludeControl(this.isCheckboxSelection(colDef), true);
        const rowDragChanged = this.includeRowDrag != this.isIncludeControl(colDef.rowDrag);
        const dndSourceChanged = this.includeDndSource != this.isIncludeControl(colDef.dndSource);
        // auto height uses wrappers, so need to destroy
        const autoHeightChanged = this.isAutoHeight != this.column.isAutoHeight();

        return selectionChanged || rowDragChanged || dndSourceChanged || autoHeightChanged;
    }

    public onPopupEditorClosed(e?: MouseEvent | TouchEvent | KeyboardEvent): void {
        const { editSvc } = this.beans;
        if (!editSvc?.isEditing(this, { withOpenEditor: true })) {
            return;
        }

        const isKeyboardEvent = e instanceof KeyboardEvent;
        const isMouseEvent = e instanceof MouseEvent;

        const isEscape = isKeyboardEvent && e.key === KeyCode.ESCAPE;

        // note: this happens because of a click outside of the grid or if the popupEditor
        // is closed with `Escape` key. if another cell was clicked, then the editing will
        // have already stopped and returned on the conditional above.
        editSvc.stopEditing(this, {
            source: editSvc.isBatchEditing() ? 'ui' : 'api',
            cancel: isEscape,
            event: isKeyboardEvent || isMouseEvent ? e : undefined,
        });

        if (isEscape) {
            this.focusCell(true, e);
        }
    }

    /**
     * Ends the Cell Editing
     * @param cancel `True` if the edit process is being canceled.
     * @returns `True` if the value of the `GridCell` has been updated, otherwise `False`.
     */
    public stopEditing(cancel = false): boolean {
        const { editSvc } = this.beans;
        return editSvc?.stopEditing(this, { cancel, source: editSvc?.isBatchEditing() ? 'ui' : 'api' }) ?? false;
    }

    private createCellRendererParams(): ICellRendererParams {
        const {
            value,
            valueFormatted,
            column,
            rowNode,
            comp,
            eGui,
            beans: { valueSvc, gos, editSvc },
        } = this;
        const res: ICellRendererParams = _addGridCommonParams(gos, {
            value: value,
            valueFormatted: valueFormatted,
            getValue: () => valueSvc.getDisplayValue(column, rowNode, 'edit', this.shouldUseShowValuesAsValue()),
            setValue: (value: any) =>
                editSvc?.setDataValue({ rowNode, column }, value) || rowNode.setDataValue(column, value),
            formatValue: this.formatValue.bind(this),
            data: rowNode.data,
            node: rowNode,
            pinned: column.getPinned() as any,
            colDef: column.colDef,
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
            this.refreshCell();
        }
    }

    public refreshOrDestroyCell(params?: RefreshCellsParams): void {
        if (this.refreshShouldDestroy()) {
            this.rowCtrl?.recreateCell(this);
        } else {
            this.refreshCell(params);
        }

        if (this.hasEdit && this.editCompDetails) {
            const { editSvc, comp } = this;

            if (!comp?.getCellEditor() && editSvc!.isEditing(this, { withOpenEditor: true })) {
                // editor was cleaned up by virtualisation, needs to be re-created
                editSvc!.startEditing(this, { startedEdit: false, source: 'api', silent: true });
            }
        }
    }

    // + stop editing {force: true, suppressFlash: true}
    // + event cellChanged {}
    // + cellRenderer.params.refresh() {} -> method passes 'as is' to the cellRenderer, so params could be anything
    // + rowCtrl: event dataChanged {suppressFlash: !update, newData: !update}
    // + rowCtrl: api refreshCells() {animate: true/false}
    // + rowRenderer: api softRefreshView() {}
    public refreshCell(params?: RefreshCellsParams & { newData?: boolean }): void {
        const {
            beans: { cellFlashSvc, filterManager, cellStyles },
            column,
            comp,
            suppressRefreshCell,
        } = this;
        // if we are in the middle of 'stopEditing', then we don't refresh here, as refresh gets called explicitly
        if (suppressRefreshCell) {
            return;
        }

        const enableCellChangeFlash = column.enableCellChangeFlash;
        // we always refresh if cell has no value - this can happen when user provides Cell Renderer and the
        // cell renderer doesn't rely on a value, instead it could be looking directly at the data, or maybe
        // printing the current time (which would be silly)???. Generally speaking
        // non of {field, valueGetter, showRowGroup} is bad in the users application, however for this edge case, it's
        // best always refresh and take the performance hit rather than never refresh and users complaining in support
        // that cells are not updating.
        // a calculated column has no field/valueGetter/showRowGroup but DOES have a value (its
        // expression), so it must not count as value-less here — otherwise it force-refreshes every
        // pass and flashes on changes to unrelated columns instead of only when its value changes.
        const noValueProvided =
            column.field == null &&
            column.valueGetter == null &&
            column.showRowGroup == null &&
            !column.isCalculatedCol;

        const newData = params?.newData ?? false;
        const forceRefresh = noValueProvided || (params && (params.force || newData));

        const isCellCompReady = !!comp;
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
            this.showValue(!!newData, false);

            // we don't want to flash the cells when processing a filter change, as otherwise the UI would
            // be to busy. see comment in FilterManager with regards processingFilterChange
            const processingFilterChange = filterManager?.isSuppressFlashingCellsBecauseFiltering();

            const flashCell = !params?.suppressFlash && !processingFilterChange && enableCellChangeFlash;

            if (flashCell) {
                cellFlashSvc?.flashCell(this);
            }

            this.editSvc?.applyCellEditStyles(this);
            cellStyles?.applyCellUserStyles(this);
            cellStyles?.applyCellClassesFromColDef(this);
            this.editSvc?.applyRowEditStyles(this.rowCtrl);

            this.checkFormulaError();
        }

        this.tooltipFeature?.refreshTooltip();
        this.refreshNoteState();

        // we do cellClassRules even if the value has not changed, so that users who have rules that
        // look at other parts of the row (where the other part of the row might of changed) will work.
        cellStyles?.applyCellClassRules(this);
    }

    public showNote(focusEditor = false): void {
        this.notesFeature?.show({ focusEditor });
    }

    public refreshNoteState(): void {
        this.notesFeature?.refresh();
    }

    public isNoteHoverSuppressed(): boolean {
        return !!this.editSvc?.isEditing(this) || this.hasFormulaError() || this.hasCellValidationError();
    }

    public isCellEditable(): boolean {
        return this.column.isCellEditable(this.rowNode);
    }

    public formatValue(value: any): any {
        const valueSvc = this.beans.valueSvc;
        const column = this.column;
        const node = this.rowNode;
        // While a mode is active and there is no live editor, format with the mode's formatter; else the column's.
        // `showValuesAs` is null for every ordinary column, so it short-circuits before touching the edit service.
        if (this.shouldUseShowValuesAsValue()) {
            const transformed = valueSvc.formatTransformedValue(column, node, value);
            if (transformed !== undefined) {
                return transformed ?? value;
            }
        }
        return valueSvc.formatValue(column, node, value) ?? value;
    }

    public updateAndFormatValue(compareValues: boolean): boolean {
        const oldValue = this.value;
        const oldValueFormatted = this.valueFormatted;

        const { value, valueFormatted } = this.beans.valueSvc.getValueForDisplay({
            column: this.column,
            node: this.rowNode,
            includeValueFormatted: true,
            from: 'edit',
            transformValues: this.shouldUseShowValuesAsValue(),
        });
        this.value = value;
        this.valueFormatted = valueFormatted;

        if (compareValues) {
            return !this.valuesAreEqual(oldValue, this.value) || this.valueFormatted != oldValueFormatted;
        }
        return true;
    }

    private shouldUseShowValuesAsValue(): boolean {
        return this.column.showValuesAs != null && !this.editSvc?.isEditing(this, { withOpenEditor: true });
    }

    private valuesAreEqual(val1: any, val2: any): boolean {
        // if the user provided an equals method, use that, otherwise do simple comparison
        const colDef = this.column.colDef;
        return colDef.equals ? colDef.equals(val1, val2) : val1 === val2;
    }

    private addDomData(compBean: BeanStub): void {
        const element = this.eGui;

        _setDomData(this.beans.gos, element, DOM_DATA_KEY_CELL_CTRL, this);
        compBean.addDestroyFunc(() => _setDomData(this.beans.gos, element, DOM_DATA_KEY_CELL_CTRL, null));
    }

    public createEvent<T extends AgEventType>(domEvent: Event | null, eventType: T): CellEvent<T> {
        const { rowNode, column, value, beans } = this;

        return _createCellEvent<T>(beans, domEvent, eventType, { rowNode, column }, value);
    }

    public processCharacter(event: KeyboardEvent): void {
        _processCellCharacter(this.beans, this, event);
    }

    public onKeyDown(event: KeyboardEvent): void {
        _onCellKeyDown(this.beans, this, event);
    }

    public onMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        _onCellMouseEvent(this.beans, this, eventName, mouseEvent);
    }

    public getColSpanningList(): AgColumn[] {
        return _getColSpanningList(this.beans, this);
    }

    public onLeftChanged(): void {
        if (!this.comp) {
            return;
        }
        _onCellLeftChanged(this.beans, this);
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
        _setAriaColIndex(this.eGui, this.column.ariaColIndex); // for react, we don't use JSX, as it slowed down column moving
    }

    public onWidthChanged(): void {
        _onCellWidthChanged(this);
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

    public focusCell(forceBrowserFocus = false, sourceEvent?: Event): void {
        const allowedTarget = this.editSvc?.allowedFocusTargetOnValidation(this);
        // if allowedTarget is set, then edit mode is active (with potential validation failures) and we should check if we can service the focus request
        if (allowedTarget && allowedTarget !== this) {
            return;
        }

        this.beans.focusSvc.setFocusedCell({
            ...this.getFocusedCellPosition(),
            forceBrowserFocus,
            sourceEvent,
        });
    }

    /**
     * Restores focus to the cell, if it should have it
     * @param waitForRender if the cell has just setComp, it may not be rendered yet, so we wait for the next render
     */
    private restoreFocus(waitForRender = false): void {
        const {
            beans: { editSvc, focusSvc },
            comp,
        } = this;
        if (!comp || editSvc?.isEditing(this) || !this.isCellFocused() || !focusSvc.shouldTakeFocus()) {
            return;
        }

        const focus = () => {
            if (!this.isAlive()) {
                return;
            }
            const focusableElement = comp.getFocusableElement();
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
        this.refreshAriaRowIndex();
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

    private setupFocus() {
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
        const editing = beans.editSvc?.isEditing(this) ?? false;

        this.comp.toggleCss(CSS_CELL_FOCUS, cellFocused);

        // see if we need to force browser focus - this can happen if focus is programmatically set
        if (
            cellFocused &&
            (event?.forceBrowserFocus || (!this.hasBrowserFocus() && this.beans.focusSvc.shouldTakeFocus()))
        ) {
            let focusEl = this.comp.getFocusableElement();

            if (editing) {
                const focusableEls = _findFocusableElements(focusEl, null, true);
                if (focusableEls.length) {
                    focusEl = focusableEls[0];
                }
            }

            const preventScroll = event ? event.preventScrollOnBrowserFocus : true;
            focusEl.focus({ preventScroll });
            _placeCaretAtEnd(beans, focusEl);
        }

        if (cellFocused && this.focusEventWhileNotReady) {
            this.focusEventWhileNotReady = null;
        }

        // require event to announce so we only announce
        // a direct user interaction with the cell
        if (cellFocused && event) {
            this.rowCtrl.announceDescription(this);
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
        this.setCalculatedColumnCss();
    }

    public onColumnHover(): void {
        this.beans.colHover?.onCellColumnHover(this.column, this.comp);
    }

    public onColDefChanged(): void {
        if (!this.comp) {
            return;
        }

        this.disableTooltipFeature();
        if (this.column.isTooltipEnabled()) {
            this.enableTooltipFeature();
        }

        this.setWrapText();
        this.setCalculatedColumnCss();

        if (this.editSvc?.isEditing(this)) {
            this.editSvc?.handleColDefChanged(this);
        } else {
            this.refreshOrDestroyCell({ force: true, suppressFlash: true });
        }
    }

    private setWrapText(): void {
        const value = this.column.colDef.wrapText == true;

        this.comp.toggleCss(CSS_CELL_WRAP_TEXT, value);
    }

    private setCalculatedColumnCss(): void {
        const calculatedColsSvc = this.beans.calculatedColsSvc;
        const isCalculatedColumn = calculatedColsSvc != null && this.column.isCalculatedCol;

        if (isCalculatedColumn || this.calculatedColumnCssApplied) {
            this.comp.toggleCss(CSS_CALCULATED_COLUMN, isCalculatedColumn);
            this.calculatedColumnCssApplied = isCalculatedColumn;
        }

        const isHighlightedColumn =
            calculatedColsSvc != null && isCalculatedColumn && calculatedColsSvc.isHighlightedColumn(this.column);
        if (isHighlightedColumn || this.calculatedColumnHighlightedCssApplied) {
            this.comp.toggleCss(CSS_CALCULATED_COLUMN_HIGHLIGHTED, isHighlightedColumn);
            this.calculatedColumnHighlightedCssApplied = isHighlightedColumn;
        }
    }

    private isCalculatedColumn(): boolean {
        return this.column.isCalculatedCol;
    }

    public refreshCalculatedColumnCss(): void {
        this.setCalculatedColumnCss();
    }

    public dispatchCellContextMenuEvent(event: Event | null) {
        const colDef = this.column.colDef;
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

    public registerRowDragger(customElement: HTMLElement, dragStartPixels?: number, alwaysVisible?: boolean): void {
        // if previously existed, then we are only updating
        if (this.customRowDragComp) {
            this.customRowDragComp.setDragElement(customElement, dragStartPixels);
            return;
        }

        const newComp = this.createRowDragComp(customElement, dragStartPixels, alwaysVisible);

        if (newComp) {
            this.customRowDragComp = newComp;
            this.addDestroyFunc(() => {
                this.beans.context.destroyBean(newComp);
                (this.customRowDragComp as any) = null;
            });
            newComp.refreshVisibility();
        }
    }

    public createRowDragComp(
        customElement?: HTMLElement,
        dragStartPixels?: number,
        alwaysVisible?: boolean
    ): RowDragComp | undefined {
        const rowDragComp = this.beans.rowDragSvc?.createRowDragCompForCell(
            this.rowNode,
            this.column,
            () => this.value,
            customElement,
            dragStartPixels,
            alwaysVisible
        );
        if (!rowDragComp) {
            return undefined;
        }
        this.beans.context.createBean(rowDragComp);

        return rowDragComp;
    }

    public cellEditorAttached(): void {
        for (const func of this.onEditorAttachedFuncs) {
            func();
        }
        this.onEditorAttachedFuncs = [];
    }

    public setFocusedCellPosition(_cellPosition: CellPosition): void {
        // noop, used by spannedCellCtrl
    }

    public getFocusedCellPosition() {
        return this.cellPosition;
    }

    public refreshAriaRowIndex(): void {
        if (!isRowNumberCol(this.column) || !this.eGui) {
            return;
        }

        const { ariaRowIndex } = this.rowCtrl;

        if (ariaRowIndex != null) {
            _setAriaRowIndex(this.eGui, ariaRowIndex);
        }
    }

    /**
     * Returns the root element of the cell, could be a span container rather than the cell element.
     * @returns The root element of the cell.
     */
    public getRootElement(): HTMLElement {
        return this.eGui;
    }
}
