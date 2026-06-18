import type { IAriaAnnouncementService } from 'ag-stack';
import { _debounce, _setAriaLabel } from 'ag-stack';

import {
    KeyCode,
    ROW_NUMBERS_COLUMN_ID,
    _BaseSingleColService,
    _addGridCommonParams,
    _convertColumnEventSourceType,
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
    GetContextMenuItems,
    IRangeService,
    IRowNumbersRowResizeFeature,
    IRowNumbersService,
    NamedBean,
    PropertyValueChangedEvent,
    RowNode,
    RowNumbersOptions,
    RowPosition,
    ValueFormatterParams,
    ValueGetterParams,
    VisibleColsService,
    _HeaderComp,
} from 'ag-grid-community';

import type {
    RangeSelectionExtension,
    RangeSelectionExtensionRegistry,
} from '../rangeSelection/rangeSelectionExtensions';
import { RowNumbersRowResizeFeature, _isRowNumbersResizerEnabled } from './rowNumbersRowResizeFeature';

const emptyContextMenuItems: GetContextMenuItems = () => [];

export class RowNumbersService
    extends _BaseSingleColService
    implements NamedBean, IRowNumbersService, RangeSelectionExtension
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

    private readonly boundValueGetter = (params: ValueGetterParams): string => this.valueGetter(params);
    private readonly boundCellClass = (params: CellClassParams): string[] => this.getCellClass(params);

    public postConstruct(): void {
        const refreshCells_debounced = _debounce(this, this.refreshCells.bind(this), 10);
        this.addManagedEventListeners({
            columnResized: () => {
                this.lastColumnResized = Date.now();
            },
            cellFocused: this.onGridCellFocused.bind(this),
            modelUpdated: (params) => {
                refreshCells_debounced(false, !params.keepRenderedRows);
            },
            rangeSelectionChanged: () => this.refreshCells(true),
            pinnedRowsChanged: () => refreshCells_debounced(false, true),
        });

        this.addManagedPropertyListeners(['rowNumbers', 'cellSelection'], (e: PropertyValueChangedEvent<any>) => {
            this.updateColumns(e);
        });

        this.refreshSelectionIntegration();
        this.registerRangeSelectionExtension();
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

    private registerRangeSelectionExtension(): void {
        const rangeSvc = this.rangeSvc as RangeSelectionExtensionRegistry | undefined;
        if (!rangeSvc) {
            return;
        }
        rangeSvc.registerRangeSelectionExtension(this);
        this.addDestroyFunc(() => rangeSvc.unregisterRangeSelectionExtension?.(this));
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

    public updateColumns(event: PropertyValueChangedEvent<any>): void {
        const source = _convertColumnEventSourceType(event.source);
        this.refreshSelectionIntegration();
        const had = this.column !== null;
        if (this.refreshCols()) {
            this.refreshColDef(source);
        } else if (had) {
            this.beans.colModel.refreshAll(source);
        }
    }

    public override destroy(): void {
        this.rowNumberOverrides = null;
        super.destroy();
    }

    public setupForHeader(comp: _HeaderComp): void {
        const { column, eGridHeader } = comp.params;
        if (!isRowNumberCol(column)) {
            return;
        }
        _setAriaLabel(eGridHeader, 'Row Number');
        this.addManagedElementListeners(eGridHeader, {
            click: this.onHeaderClick.bind(this),
            keydown: this.onHeaderKeyDown.bind(this),
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

    private onHeaderKeyDown(e: KeyboardEvent): void {
        if (!this.isIntegratedWithSelection || (e.key !== KeyCode.SPACE && e.key !== KeyCode.ENTER)) {
            return;
        }
        e.preventDefault();
        this.selectAllCellsFromHeader();
    }

    private onHeaderClick(_e: MouseEvent): void {
        if (Date.now() - this.lastColumnResized < 100 || !this.isIntegratedWithSelection || this.column?.resizing) {
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

    private refreshCells(force?: boolean, runAutoSize?: boolean): void {
        const column = this.column;
        if (!column) {
            return;
        }
        if (runAutoSize) {
            const width = this.beans.autoWidthCalc?.getPreferredWidthForElements([this.createDummyElement(column)], 2);
            if (width != null) {
                this.beans.colResize?.setColumnWidths(
                    [{ key: column, newWidth: width }],
                    false,
                    true,
                    'rowNumbersService'
                );
            }
        }
        this.beans.rowRenderer.refreshCells({ columns: [column], force });
    }

    private createDummyElement(column: AgColumn): HTMLDivElement {
        const div = _createElement<HTMLDivElement>({ tag: 'div', cls: 'ag-cell-value ag-cell' });

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
            value = rowNumberOverrides.valueFormatter(valueFormatterParams);
        }

        div.textContent = value;

        return div;
    }

    protected createColDef(): ColDef {
        const contextMenuSvc = this.beans.contextMenuSvc;
        const enableRTL = this.gos.get('enableRtl');

        return {
            // overridable properties
            minWidth: 60,
            width: 60,
            resizable: false,
            valueGetter: this.boundValueGetter,
            contextMenuItems: this.isIntegratedWithSelection || !contextMenuSvc ? undefined : emptyContextMenuItems,
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
            columns = beans.colViewport.getColsWithinViewport(rowNode);
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
