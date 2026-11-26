import type { IAriaAnnouncementService } from 'ag-stack';
import { FAST_TEST_TIMINGS, _addManagedElementListeners, _debounce, _setAriaLabel } from 'ag-stack';

import {
    KeyCode,
    ROW_NUMBERS_COLUMN_ID,
    _BaseSingleColService,
    _addGridCommonParams,
    _createElement,
    _getFirstRow,
    _getRowNode,
    _interpretAsRightClick,
    _isRowNumbers,
    _selectAllCells,
    isRowNumberCol,
} from 'ag-grid-community';
import type {
    AgColumn,
    BeanCollection,
    CellClassParams,
    CellCtrl,
    CellFocusedEvent,
    CellPosition,
    CellRange,
    ColDef,
    ColKind,
    ColumnEventType,
    GridOptions,
    IRangeSelectionExtension,
    IRangeService,
    IRowNumbersRowResizeFeature,
    IRowNumbersService,
    NamedBean,
    RowNode,
    RowNumbersOptions,
    RowPosition,
    ValueFormatterParams,
    ValueGetterParams,
    VisibleColsService,
    _HeaderComp,
} from 'ag-grid-community';

import { RowNumbersRowResizeFeature, _isRowNumbersResizerEnabled } from './rowNumbersRowResizeFeature';

const ROWS_CHANGED_DEBOUNCE = FAST_TEST_TIMINGS ? 0 : 10;

export class RowNumbersService
    extends _BaseSingleColService
    implements NamedBean, IRowNumbersService, IRangeSelectionExtension
{
    beanName = 'rowNumbersSvc' as const;

    protected readonly colKind: ColKind = 'row-number';

    private rangeSvc?: IRangeService;
    private ariaAnnounce: IAriaAnnouncementService;
    private visibleCols: VisibleColsService;

    public wireBeans(beans: BeanCollection): void {
        this.rangeSvc = beans.rangeSvc;
        this.ariaAnnounce = beans.ariaAnnounce;
        this.visibleCols = beans.visibleCols;
    }

    private isIntegratedWithSelection: boolean = false;
    private isSuppressCellSelectionIntegration: boolean;

    private rowNumberOverrides: RowNumbersOptions | null = null;
    private lastColumnResized: number = 0;
    private autoSizedTextLength: number = 0;
    private fittedCol: AgColumn | null = null;

    private readonly boundValueGetter = (params: ValueGetterParams): string => this.valueGetter(params);
    private readonly boundCellClass = (params: CellClassParams): string[] => this.getCellClass(params);

    public postConstruct(): void {
        const onRowsChanged_debounced = _debounce(this, this.onRowsChanged.bind(this), ROWS_CHANGED_DEBOUNCE);
        this.addManagedEventListeners({
            columnResized: () => {
                this.lastColumnResized = Date.now();
            },
            cellFocused: this.onGridCellFocused.bind(this),
            modelUpdated: (params) => onRowsChanged_debounced(!params.keepRenderedRows),
            rangeSelectionChanged: () => this.refreshCells(true),
            pinnedRowsChanged: () => onRowsChanged_debounced(true),
        });

        this.refreshSelectionIntegration();
        this.rangeSvc?.registerRangeSelectionExtension(this);
    }

    public shouldSkipColumn(column: AgColumn): boolean {
        return _isRowNumbers(this.beans) && isRowNumberCol(column);
    }

    public isAllColumnsSelectionCell(cellPosition: CellPosition): boolean {
        return _isRowNumbers(this.beans) && isRowNumberCol(cellPosition.column);
    }

    public isAllColumnsRange(range: CellRange, allColumns: AgColumn[]): boolean {
        if (!_isRowNumbers(this.beans) || allColumns.length === 0) {
            return false;
        }
        return (
            range.columns.length === allColumns.length && allColumns.every((column) => range.columns.includes(column))
        );
    }

    public isEnabled(): boolean {
        return !!_isRowNumbers(this.beans);
    }

    public handleMouseDownOnCell(cellPosition: CellPosition, mouseEvent: MouseEvent): boolean {
        // if click interaction can't produce an outcome (i.e. no cell selection, no row-resizing), do nothing
        if (
            !this.isIntegratedWithSelection ||
            (mouseEvent.target as HTMLElement).classList.contains('ag-row-numbers-resizer')
        ) {
            if (this.rangeSvc) {
                mouseEvent.preventDefault();
            }
            mouseEvent.stopImmediatePropagation();
            return false;
        }

        // if we're not extending the range, focus the first cell
        if (!mouseEvent.shiftKey && !_interpretAsRightClick(this.beans, mouseEvent)) {
            this.focusFirstRenderedCellAtRowPosition(cellPosition);
        }

        return true;
    }

    public handleKeyDownOnCell(cellPosition: CellPosition, event: KeyboardEvent): boolean {
        if (!this.isIntegratedWithSelection) {
            return false;
        }

        if (event.key === KeyCode.ENTER) {
            this.selectRowCells(cellPosition, event);
            event.preventDefault();
            return true;
        }

        return false;
    }

    private selectRowCells(cellPosition: CellPosition, keyboardEvent: KeyboardEvent): void {
        const rangeSvc = this.rangeSvc;

        if (!rangeSvc) {
            return;
        }

        rangeSvc.handleCellKeyboardSelect(keyboardEvent, cellPosition);
    }

    public addOptionKeysTo(keys: Set<keyof GridOptions>): void {
        keys.add('rowNumbers').add('cellSelection');
    }

    public applyOptions(changedProps: ReadonlySet<keyof GridOptions>, source: ColumnEventType): boolean {
        if (!changedProps.has('rowNumbers') && !changedProps.has('cellSelection')) {
            return false;
        }
        const prevOverrides = this.rowNumberOverrides;
        this.refreshSelectionIntegration();
        const had = this.column !== null;
        const column = this.refreshCols();
        // a new column, or a change to what the fit reads, is fitted once laid out; others keep the widest width
        if (!column) {
            return had;
        }
        if (!had) {
            return true;
        }
        const { minWidth, maxWidth } = column;
        const redefined = this.refreshColDef(source);
        if (
            column.minWidth !== minWidth ||
            column.maxWidth !== maxWidth ||
            fitInputsChanged(prevOverrides, this.rowNumberOverrides)
        ) {
            this.fittedCol = null;
        }
        // the cells' range classes read `cellSelection`; a redefined column's cells the update redraws
        if (!redefined) {
            this.refreshCells(true);
        }
        return false;
    }

    /** `width` is the fit floor: re-sent, or below `minWidth`, it keeps the fitted or dragged width. */
    protected override keepsColDefWidth(col: AgColumn, width: number, prevWidth: number | undefined): boolean {
        return width === prevWidth || width < col.minWidth;
    }

    public resetColumnState(source: ColumnEventType): void {
        const column = this.column;
        if (!column) {
            return;
        }
        column.resetActualWidth(source);
        this.fittedCol = null;
    }

    public fitUnfittedColumn(): void {
        const column = this.column;
        if (!column || column === this.fittedCol) {
            return;
        }
        this.autoSize(column, true);
    }

    public override destroy(): void {
        this.rangeSvc?.unregisterRangeSelectionExtension(this);
        this.rowNumberOverrides = null;
        super.destroy();
    }

    public setupForHeader(comp: _HeaderComp): void {
        const { column, eGridHeader } = comp.params;
        if (!isRowNumberCol(column)) {
            return;
        }
        _setAriaLabel(eGridHeader, 'Row Number');
        // on the header comp, so a rebuilt header takes its listeners with it
        _addManagedElementListeners(comp, eGridHeader, {
            click: this.onHeaderClick.bind(this),
            focus: this.onHeaderFocus.bind(this),
        });
    }

    private onGridCellFocused(event: CellFocusedEvent): void {
        if (!this.isIntegratedWithSelection || event.rowIndex == null || !event.column) {
            return;
        }
        const column = this.beans.colModel.getCol(event.column);
        if (!column || !isRowNumberCol(column)) {
            return;
        }

        const translate = this.getLocaleTextFunc();
        const message = translate('ariaSelectAllRowCells', 'Press Enter to select all cells on this row');
        this.ariaAnnounce?.announceValue(message, 'ariaSelectAllRowCells');
    }

    public createRowNumbersRowResizerFeature(ctrl: CellCtrl): IRowNumbersRowResizeFeature | undefined {
        return _isRowNumbersResizerEnabled(this.beans) ? new RowNumbersRowResizeFeature(this.beans, ctrl) : undefined;
    }

    private refreshSelectionIntegration(): void {
        const cellSelection = this.gos.get('cellSelection');
        this.refreshRowNumberOverrides();
        this.isIntegratedWithSelection = !!this.rangeSvc && !!cellSelection && !this.isSuppressCellSelectionIntegration;
    }

    private refreshRowNumberOverrides(): void {
        const rowNumbers = _isRowNumbers(this.beans);
        this.rowNumberOverrides = {};
        this.isSuppressCellSelectionIntegration = false;
        if (!rowNumbers || typeof rowNumbers !== 'object') {
            return;
        }
        if (rowNumbers.suppressCellSelectionIntegration) {
            this.isSuppressCellSelectionIntegration = true;
        }
        const colDefValidProps: (keyof RowNumbersOptions)[] = [
            'contextMenuItems',
            'context',
            'onCellClicked',
            'onCellContextMenu',
            'onCellDoubleClicked',
            'headerTooltip',
            'headerStyle',
            'headerComponent',
            'headerComponentParams',
            'suppressHeaderKeyboardEvent',
            'suppressNavigable',
            'tooltip',
            'tooltipField',
            'tooltipValueGetter',
            'tooltipComponent',
            'tooltipComponentParams',
            'tooltipComponentSelector',
            'valueGetter',
            'valueFormatter',
            'width',
            'maxWidth',
            'minWidth',
            'resizable',
            'cellRenderer',
            'cellRendererSelector',
            'cellRendererParams',
        ];
        for (const prop of colDefValidProps) {
            if (rowNumbers[prop] != null) {
                this.rowNumberOverrides[prop] = rowNumbers[prop];
            }
        }
    }

    private onHeaderFocus(): void {
        if (!this.isIntegratedWithSelection) {
            return;
        }
        const translate = this.getLocaleTextFunc();
        const message = translate('ariaSelectAllCells', 'Press Space or Enter to select all cells');
        this.ariaAnnounce?.announceValue(message, 'ariaSelectAllCells');
    }

    public handleKeyDownOnHeader(column: AgColumn, e: KeyboardEvent): void {
        if (
            !this.isIntegratedWithSelection ||
            (e.key !== KeyCode.SPACE && e.key !== KeyCode.ENTER) ||
            !isRowNumberCol(column)
        ) {
            return;
        }
        e.preventDefault();
        this.selectAllCellsFromHeader();
    }

    private onHeaderClick(_e: MouseEvent): void {
        if (Date.now() - this.lastColumnResized < 100 || !this.isIntegratedWithSelection || this.column?.isResizing()) {
            return;
        }
        this.focusAllCellsFromHeaderClick();
    }

    private selectAllCellsFromHeader(): void {
        _selectAllCells(this.beans);
    }

    private focusAllCellsFromHeaderClick(): void {
        this.selectAllCellsFromHeader();
        this.focusFirstRenderedCellAtRowPosition();
    }

    private onRowsChanged(forceAutoSize: boolean): void {
        const column = this.column;
        if (!column) {
            return;
        }
        this.autoSize(column, forceAutoSize);
        this.refreshCells(false);
    }

    private refreshCells(force: boolean): void {
        const column = this.column;
        if (!column) {
            return;
        }
        this.beans.rowRenderer.refreshCells({ columns: [column], force });
    }

    private autoSize(column: AgColumn, force: boolean): void {
        // a width the user dragged to is theirs, even across new row data
        if (column.isUserSized()) {
            return;
        }
        const text = this.getLargestRowNumberText(column);
        // only grow between forced autosizes, so row counts hovering around a digit boundary don't cause width jank
        if (!force && text.length <= this.autoSizedTextLength) {
            return;
        }
        this.autoSizedTextLength = text.length;
        this.fittedCol = column;
        const measured = this.beans.autoWidthCalc?.getPreferredWidthForElements([this.createDummyElement(text)], 2);
        if (measured == null) {
            return;
        }
        // never narrower than a configured width; maxWidth wins over minWidth, as in `setActualWidth`
        const fitted = Math.max(measured, column.minWidth, this.rowNumberOverrides?.width ?? 0);
        const newWidth = Math.min(fitted, column.maxWidth);
        if (newWidth === column.actualWidth) {
            return;
        }
        const columns = [column];
        this.beans.colResize?.setClampedColumnWidths(columns, [newWidth], true, 'rowNumbersService', columns);
    }

    private getLargestRowNumberText(column: AgColumn): string {
        let value = String(this.beans.rowModel.getRowCount() + 1);
        const rowNumberOverrides = this.rowNumberOverrides;
        if (typeof rowNumberOverrides?.valueFormatter === 'function') {
            const valueFormatterParams: ValueFormatterParams = _addGridCommonParams(this.gos, {
                data: undefined,
                value,
                node: null,
                column,
                colDef: column.colDef,
            });
            // the measurement row has no data, so a formatter reading data may return nothing
            value = rowNumberOverrides.valueFormatter(valueFormatterParams) ?? '';
        }
        return value;
    }

    private createDummyElement(text: string): HTMLDivElement {
        // ag-row-number-cell gives the dummy the same font and tabular digits as the rendered cells
        const div = _createElement<HTMLDivElement>({ tag: 'div', cls: 'ag-cell-value ag-cell ag-row-number-cell' });
        div.textContent = text;
        return div;
    }

    protected createColDef(): ColDef {
        const enableRTL = this.gos.get('enableRtl');

        return {
            // overridable properties
            minWidth: 60,
            initialWidth: 60,
            resizable: false,
            valueGetter: this.boundValueGetter,
            // overrides
            ...this.rowNumberOverrides,
            // non-overridable properties
            colId: ROW_NUMBERS_COLUMN_ID,
            chartDataType: 'excluded',
            suppressHeaderMenuButton: true,
            sortable: false,
            suppressMovable: true,
            lockPinned: true,
            pinned: enableRTL ? 'right' : 'left',
            lockPosition: enableRTL ? 'right' : 'left',
            editable: false,
            suppressFillHandle: true,
            suppressAutoSize: true,
            suppressSizeToFit: true,
            suppressHeaderContextMenu: true,
            headerClass: this.getHeaderClass(),
            cellClass: this.boundCellClass,
            cellAriaRole: 'rowheader',
        };
    }

    private valueGetter(params: ValueGetterParams): string {
        const node = params.node as RowNode | null;
        const isFormulasActive = this.beans.formula?.active;

        // rows that are in the pinned container take the row numbers of their pinned sibling rows
        const pinnedSibling = node?.pinnedSibling;
        if (node?.rowPinned && pinnedSibling) {
            const rowIndex = isFormulasActive ? pinnedSibling.formulaRowIndex : pinnedSibling.rowIndex;
            return `${rowIndex == null ? '-' : rowIndex + 1}`;
        }

        return String(((isFormulasActive ? node?.formulaRowIndex : node?.rowIndex) || 0) + 1);
    }

    private getHeaderClass(): string[] {
        const cssClass = ['ag-row-number-header'];

        if (this.isIntegratedWithSelection) {
            cssClass.push('ag-row-number-selection-enabled');
        }

        return cssClass;
    }

    private getCellClass(params: CellClassParams): string[] {
        const rangeSvc = this.rangeSvc;
        const { node } = params;
        const cssClasses = ['ag-row-number-cell'];
        const cellSelection = this.gos.get('cellSelection');

        if (!rangeSvc || !cellSelection) {
            return cssClasses;
        }

        if (this.isIntegratedWithSelection) {
            cssClasses.push('ag-row-number-selection-enabled');
        }

        const ranges = rangeSvc.getCellRanges();

        if (!ranges.length) {
            return cssClasses;
        }

        // -1 here because we shouldn't include the column added by this service
        const allColsLen = this.visibleCols.allCols.length - 1;
        const shouldHighlight = typeof cellSelection === 'object' && cellSelection.enableHeaderHighlight;

        for (const range of ranges) {
            if (rangeSvc.isRowInRange({ rowIndex: node.rowIndex!, rowPinned: node.rowPinned }, range)) {
                if (shouldHighlight) {
                    cssClasses.push('ag-row-number-range-highlight');
                }

                if (range.columns.length === allColsLen) {
                    cssClasses.push('ag-row-number-range-selected');
                }
            }
        }

        return cssClasses;
    }

    private focusFirstRenderedCellAtRowPosition(rowPosition?: RowPosition | null) {
        const editSvc = this.beans.editSvc;

        if (editSvc?.isEditing() && editSvc.isRangeSelectionEnabledWhileEditing?.()) {
            // let the formula editor keep focus when range selection is enabled during editing.
            return;
        }

        if (!rowPosition) {
            rowPosition = _getFirstRow(this.beans);
            if (!rowPosition) {
                return;
            }
        }

        const beans = this.beans;
        const visibleCols = this.visibleCols;
        const pinnedCols = this.gos.get('enableRtl') ? visibleCols.rightCols : visibleCols.leftCols;
        let columns: AgColumn[];

        if (pinnedCols.length == 1) {
            const rowNode = _getRowNode(beans, rowPosition);

            if (!rowNode) {
                return;
            }
            columns = beans.colViewport.getColsWithinViewport(rowNode, null);
        } else {
            columns = pinnedCols;
        }

        const column = columns.find((col) => !isRowNumberCol(col));

        if (!column) {
            return;
        }

        const { rowPinned, rowIndex } = rowPosition;

        // to avoid conflict with setting the range, add a setTimeout here
        setTimeout(() => {
            if (this.isAlive()) {
                beans.focusSvc.setFocusedCell({
                    rowIndex,
                    rowPinned,
                    column,
                    forceBrowserFocus: true,
                    preventScrollOnBrowserFocus: true,
                });
            }
        });
    }
}

/** Whether the options the row number fit reads beside the column's bounds (its floor and formatter) changed. */
function fitInputsChanged(prev: RowNumbersOptions | null, next: RowNumbersOptions | null): boolean {
    return prev?.width !== next?.width || prev?.valueFormatter !== next?.valueFormatter;
}
