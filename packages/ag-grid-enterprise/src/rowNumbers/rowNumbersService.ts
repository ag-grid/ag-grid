import {
    AgColumn,
    BeanStub,
    KeyCode,
    ROW_NUMBERS_COLUMN_ID,
    _addGridCommonParams,
    _applyColumnState,
    _areColIdsEqual,
    _convertColumnEventSourceType,
    _createElement,
    _debounce,
    _destroyColumnTree,
    _getRowNode,
    _selectAllCells,
    _setAriaLabel,
    _updateColsMap,
    isRowNumberCol,
} from 'ag-grid-community';
import type {
    BeanCollection,
    CellClassParams,
    CellCtrl,
    CellPosition,
    ColDef,
    IRowNumbersRowResizeFeature,
    IRowNumbersService,
    NamedBean,
    PropertyValueChangedEvent,
    RowNode,
    RowNumbersOptions,
    RowPosition,
    ValueFormatterParams,
    ValueGetterParams,
    _ColumnCollections,
    _HeaderComp,
} from 'ag-grid-community';

import { RowNumbersRowResizeFeature, _isRowNumbersResizerEnabled } from './rowNumbersRowResizeFeature';

export class RowNumbersService extends BeanStub implements NamedBean, IRowNumbersService {
    beanName = 'rowNumbersSvc' as const;

    public columns: _ColumnCollections | null;

    private isIntegratedWithSelection: boolean = false;
    private isSuppressCellSelectionIntegration: boolean;

    private rowNumberOverrides: RowNumbersOptions;

    public postConstruct(): void {
        const refreshCells_debounced = _debounce(this, this.refreshCells.bind(this, false, true), 10);
        this.addManagedEventListeners({
            modelUpdated: refreshCells_debounced,
            rangeSelectionChanged: () => this.refreshCells(true),
            pinnedRowsChanged: refreshCells_debounced,
        });

        this.addManagedPropertyListeners(['rowNumbers', 'cellSelection'], (e: PropertyValueChangedEvent<any>) => {
            this.refreshSelectionIntegration();
            this.updateColumns(e);
        });

        this.refreshSelectionIntegration();
    }

    public addColumns(cols: _ColumnCollections): void {
        if (this.columns == null) {
            return;
        }
        cols.list = this.columns.list.concat(cols.list);
        cols.tree = this.columns.tree.concat(cols.tree);
        _updateColsMap(cols);
    }

    public createColumns(
        cols: _ColumnCollections,
        updateOrders: (callback: (cols: AgColumn[] | null) => AgColumn[] | null) => void
    ): void {
        if (!this.gos.get('rowNumbers')) {
            return;
        }

        const destroyCollection = () => {
            _destroyColumnTree(this.beans, this.columns?.tree);
            this.columns = null;
        };

        const newTreeDepth = cols.treeDepth;
        const oldTreeDepth = this.columns?.treeDepth ?? -1;
        const treeDepthSame = oldTreeDepth == newTreeDepth;

        const list = this.generateRowNumberCols();
        const areSame = _areColIdsEqual(list, this.columns?.list ?? []);

        if (areSame && treeDepthSame) {
            return;
        }

        destroyCollection();
        const { colGroupSvc } = this.beans;
        const treeDepth = colGroupSvc?.findDepth(cols.tree) ?? 0;
        const tree = colGroupSvc?.balanceTreeForAutoCols(list, treeDepth) ?? [];
        this.columns = {
            list,
            tree,
            treeDepth,
            map: {},
        };

        const putRowNumbersColsFirstInList = (cols: AgColumn[] | null): AgColumn[] | null => {
            if (!cols) {
                return null;
            }
            // we use colId, and not instance, to remove old rowNumbersCols
            const colsFiltered = cols.filter((col) => !isRowNumberCol(col));
            return [...list, ...colsFiltered];
        };

        updateOrders(putRowNumbersColsFirstInList);
    }

    public handleMouseDownOnCell(cellPosition: CellPosition, mouseEvent: MouseEvent): boolean {
        if (
            !this.isIntegratedWithSelection ||
            (mouseEvent.target as HTMLElement).classList.contains('ag-row-numbers-resizer')
        ) {
            return false;
        }

        if (!mouseEvent.shiftKey) {
            setTimeout(() => {
                this.focusFirstRenderedCellAtRowPosition(cellPosition);
            });
        }

        return true;
    }

    public updateColumns(event: PropertyValueChangedEvent<any>): void {
        const source = _convertColumnEventSourceType(event.source);

        this.refreshSelectionIntegration();

        this.columns?.list.forEach((col) => {
            const newColDef = this.createRowNumbersColDef();
            col.setColDef(newColDef, null, source);
            _applyColumnState(this.beans, { state: [{ colId: col.getColId(), ...newColDef }] }, source);
        });
    }

    public getColumn(): AgColumn | null {
        return this.columns?.list.find(isRowNumberCol) ?? null;
    }

    public getColumns(): AgColumn[] | null {
        return this.columns?.list ?? null;
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

    public createRowNumbersRowResizerFeature(
        beans: BeanCollection,
        ctrl: CellCtrl
    ): IRowNumbersRowResizeFeature | undefined {
        if (!_isRowNumbersResizerEnabled(this.gos)) {
            return undefined;
        }

        return new RowNumbersRowResizeFeature(beans, ctrl);
    }

    private refreshSelectionIntegration(): void {
        const { beans } = this;
        const { gos, rangeSvc } = beans;
        const cellSelection = gos.get('cellSelection');
        this.refreshRowNumberOverrides();

        this.isIntegratedWithSelection = !!rangeSvc && !!cellSelection && !this.isSuppressCellSelectionIntegration;
    }

    private refreshRowNumberOverrides(): void {
        const rowNumbers = this.gos.get('rowNumbers');
        this.rowNumberOverrides = {};

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
            'tooltipField',
            'tooltipValueGetter',
            'tooltipComponent',
            'tooltipComponentParams',
            'valueGetter',
            'valueFormatter',
            'width',
            'maxWidth',
            'minWidth',
            'resizable',
        ];

        for (const prop of colDefValidProps) {
            if (rowNumbers[prop] != null) {
                this.rowNumberOverrides[prop] = rowNumbers[prop];
            }
        }
    }

    private onHeaderFocus(): void {
        this.beans.ariaAnnounce?.announceValue('Press Space to select all cells', 'ariaSelectAllCells');
    }

    private onHeaderKeyDown(e: KeyboardEvent): void {
        if (!this.isIntegratedWithSelection || e.key !== KeyCode.SPACE) {
            return;
        }
        _selectAllCells(this.beans);
    }

    private onHeaderClick(): void {
        if (!this.isIntegratedWithSelection) {
            return;
        }
        _selectAllCells(this.beans);
    }

    private refreshCells(force?: boolean, runAutoSize?: boolean): void {
        const column = this.getColumn();

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

        this.beans.rowRenderer.refreshCells({
            columns: [column],
            force,
        });
    }

    private createDummyElement(column: AgColumn): HTMLDivElement {
        const div = _createElement<HTMLDivElement>({ tag: 'div', cls: 'ag-cell-value ag-cell' });

        let value = String(this.beans.rowModel.getRowCount() + 1);

        if (typeof this.rowNumberOverrides.valueFormatter === 'function') {
            const valueFormatterParams: ValueFormatterParams = _addGridCommonParams(this.beans.gos, {
                data: undefined,
                value,
                node: null,
                column,
                colDef: column.colDef,
            });
            value = this.rowNumberOverrides.valueFormatter(valueFormatterParams);
        }

        div.textContent = value;

        return div;
    }

    private createRowNumbersColDef(): ColDef {
        const { gos, contextMenuSvc } = this.beans;
        const enableRTL = gos.get('enableRtl');

        return {
            // overridable properties
            minWidth: 60,
            width: 60,
            resizable: false,
            valueGetter: this.valueGetter,
            contextMenuItems: this.isIntegratedWithSelection || !contextMenuSvc ? undefined : () => [],
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
            suppressNavigable: true,
            headerClass: this.getHeaderClass(),
            cellClass: this.getCellClass.bind(this),
            cellAriaRole: 'rowheader',
        };
    }

    private valueGetter(params: ValueGetterParams): string {
        const node = params.node as RowNode | null;

        // Rows that are in the pinned container take the row numbers of their pinned sibling rows
        if (node?.rowPinned && node.pinnedSibling) {
            const { rowIndex } = node.pinnedSibling;
            return `${rowIndex == null ? '-' : rowIndex + 1}`;
        }

        return String((node?.rowIndex || 0) + 1);
    }

    private getHeaderClass(): string[] {
        const cssClass = ['ag-row-number-header'];

        if (this.isIntegratedWithSelection) {
            cssClass.push('ag-row-number-selection-enabled');
        }

        return cssClass;
    }

    private getCellClass(params: CellClassParams): string[] {
        const { beans } = this;
        const { rangeSvc, gos } = beans;
        const { node } = params;
        const cssClasses = ['ag-row-number-cell'];
        const cellSelection = gos.get('cellSelection');

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
        const allColsLen = this.beans.visibleCols.allCols.length - 1;
        const shouldHighlight = typeof cellSelection === 'object' && cellSelection.enableHeaderHighlight;

        for (const range of ranges) {
            if (rangeSvc.isRowInRange(node.rowIndex!, node.rowPinned, range)) {
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

    private generateRowNumberCols(): AgColumn[] {
        const { gos } = this;
        if (!gos.get('rowNumbers')) {
            return [];
        }

        const colDef = this.createRowNumbersColDef();
        const colId = colDef.colId!;
        gos.validateColDef(colDef, colId, true);
        const col = new AgColumn(colDef, null, colId, false);
        this.createBean(col);
        return [col];
    }

    // focus is disabled on the Row Numbers cells, when a click happens on it,
    // it should focus the first cell of that row.
    private focusFirstRenderedCellAtRowPosition(rowPosition: RowPosition) {
        const { beans, gos } = this;
        const { visibleCols, colViewport } = beans;
        const pinnedCols = gos.get('enableRtl') ? visibleCols.rightCols : visibleCols.leftCols;
        let columns: AgColumn[];

        if (pinnedCols.length == 1) {
            const rowNode = _getRowNode(beans, rowPosition);

            if (!rowNode) {
                return;
            }
            columns = colViewport.getColsWithinViewport(rowNode);
        } else {
            columns = pinnedCols;
        }

        const column = columns.find((col) => !isRowNumberCol(col));

        if (!column) {
            return;
        }

        const { rowPinned, rowIndex } = rowPosition;

        beans.focusSvc.setFocusedCell({
            rowIndex,
            rowPinned,
            column,
            forceBrowserFocus: true,
            preventScrollOnBrowserFocus: true,
        });
    }

    public override destroy(): void {
        _destroyColumnTree(this.beans, this.columns?.tree);
        (this.rowNumberOverrides as any) = null;
        super.destroy();
    }
}
