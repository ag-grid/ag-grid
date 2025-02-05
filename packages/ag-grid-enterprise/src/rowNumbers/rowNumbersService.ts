import {
    AgColumn,
    BeanStub,
    ROW_NUMBERS_COLUMN_ID,
    _applyColumnState,
    _areColIdsEqual,
    _convertColumnEventSourceType,
    _debounce,
    _destroyColumnTree,
    _getRowNode,
    _selectAllCells,
    _updateColsMap,
    isRowNumberCol,
} from 'ag-grid-community';
import type {
    CellClassParams,
    CellPosition,
    ColDef,
    IRowNumbersService,
    NamedBean,
    PropertyValueChangedEvent,
    RowNumbersOptions,
    RowPosition,
    _ColumnCollections,
    _HeaderComp,
} from 'ag-grid-community';

export class RowNumbersService extends BeanStub implements NamedBean, IRowNumbersService {
    beanName = 'rowNumbersSvc' as const;

    public columns: _ColumnCollections | null;
    private isIntegratedWithSelection: boolean = false;
    private rowNumberOverrides: RowNumbersOptions;

    public postConstruct(): void {
        const refreshCells_debounced = _debounce(this, this.refreshCells.bind(this, false, true), 10);
        this.addManagedEventListeners({
            modelUpdated: refreshCells_debounced,
            rangeSelectionChanged: () => this.refreshCells(true),
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

        updateOrders(this.putRowNumbersColsFirstInList);
    }

    public handleMouseDownOnCell(cellPosition: CellPosition, mouseEvent: MouseEvent): boolean {
        if (!this.isIntegratedWithSelection) {
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
        const { column } = comp.params;
        const eGui = comp.getGui();
        if (!isRowNumberCol(column)) {
            return;
        }

        this.addManagedElementListeners(eGui, {
            click: this.onHeaderClick.bind(this),
        });
    }

    private refreshSelectionIntegration(): void {
        const { beans } = this;

        this.refreshRowNumberOverrides();

        this.isIntegratedWithSelection = !!beans.rangeSvc && !this.rowNumberOverrides?.suppressCellSelectionIntegration;
    }

    private refreshRowNumberOverrides(): void {
        const rowNumbers = this.gos.get('rowNumbers');

        this.rowNumberOverrides = rowNumbers && typeof rowNumbers === 'object' ? rowNumbers : {};
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
            this.beans.colAutosize?.autoSizeCols({
                colKeys: [ROW_NUMBERS_COLUMN_ID],
                skipHeader: true,
                skipHeaderGroups: true,
                silent: true,
                source: 'rowNumbersService',
            });
        }

        this.beans.rowRenderer.refreshCells({
            columns: [column],
            force,
        });
    }

    private putRowNumbersColsFirstInList(list: AgColumn[], cols?: AgColumn[] | null): AgColumn[] | null {
        if (!cols) {
            return null;
        }
        // we use colId, and not instance, to remove old rowNumbersCols
        const colsFiltered = cols.filter((col) => !isRowNumberCol(col));
        return [...list, ...colsFiltered];
    }

    private createRowNumbersColDef(): ColDef {
        const { gos } = this.beans;
        const enableRTL = gos.get('enableRtl');
        return {
            // overridable properties
            minWidth: 60,
            width: 60,
            resizable: false,
            valueGetter: (p) => (p.node?.rowIndex || 0) + 1,
            // overrides
            ...this.rowNumberOverrides,
            // non-overridable properties
            colId: ROW_NUMBERS_COLUMN_ID,
            suppressHeaderMenuButton: true,
            sortable: false,
            suppressMovable: true,
            pinned: enableRTL ? 'right' : 'left',
            lockPosition: enableRTL ? 'right' : 'left',
            editable: false,
            suppressFillHandle: true,
            suppressAutoSize: true,
            suppressSizeToFit: true,
            suppressNavigable: true,
            headerClass: this.getHeaderClass(),
            cellClass: this.getCellClass.bind(this),
            cellAriaRole: 'rowheader',
        };
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
        const { gos, beans } = this;
        if (!gos.get('rowNumbers')) {
            return [];
        }

        const colDef = this.createRowNumbersColDef();
        const colId = colDef.colId!;
        beans.validation?.validateColDef(colDef, colId, true);
        const col = new AgColumn(colDef, null, colId, false);
        this.createBean(col);
        return [col];
    }

    // focus is disabled on the Row Numbers cells, when a click happens on it,
    // it should focus the first cell of that row.
    private focusFirstRenderedCellAtRowPosition(rowPosition: RowPosition) {
        const { beans } = this;
        const rowNode = _getRowNode(beans, rowPosition);

        if (!rowNode) {
            return;
        }

        const colsInViewport = beans.colViewport.getColsWithinViewport(rowNode);
        const column = colsInViewport.find(isRowNumberCol);

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
