import {
    AgColumn,
    BeanStub,
    ROW_HEADER_COLUMN_ID,
    _applyColumnState,
    _areColIdsEqual,
    _columnsMatch,
    _convertColumnEventSourceType,
    _debounce,
    _destroyColumnTree,
    _getColumnState,
    _isRowHeaderColumnEnabled,
    _updateColsMap,
    isRowHeaderCol,
} from 'ag-grid-community';
import type {
    AgColumnGroup,
    CellClassParams,
    ColDef,
    ColKey,
    ColumnEventType,
    IColumnCollectionService,
    NamedBean,
    PropertyValueChangedEvent,
    RowHeaderColumnDef,
    _ColumnCollections,
} from 'ag-grid-community';

export class RowHeaderColService extends BeanStub implements NamedBean, IColumnCollectionService {
    beanName = 'rowHeaderColSvc' as const;

    public columns: _ColumnCollections | null;

    public postConstruct(): void {
        const refreshCells_debounced = _debounce(this, this.refreshCells.bind(this), 10);
        this.addManagedEventListeners({
            modelUpdated: refreshCells_debounced,
            rangeSelectionChanged: () => this.refreshCells(true),
        });
        this.addManagedPropertyListener('rowHeaderColumnDef', this.updateColumns.bind(this));
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

        const list = this.generateRowHeaderCols();
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

        updateOrders(this.putRowHeaderColsFirstInList);
    }

    public updateColumns(event: PropertyValueChangedEvent<'rowHeaderColumnDef'>): void {
        const source = _convertColumnEventSourceType(event.source);
        const current = event.currentValue;

        this.columns?.list.forEach((col) => {
            const newColDef = this.createRowHeaderColDef(current);
            col.setColDef(newColDef, null, source);
            _applyColumnState(this.beans, { state: [{ colId: col.getColId(), ...newColDef }] }, source);
        });
    }

    public getColumn(key: ColKey): AgColumn | null {
        return this.columns?.list.find((col) => _columnsMatch(col, key)) ?? null;
    }

    public getColumns(): AgColumn[] | null {
        return this.columns?.list ?? null;
    }

    private refreshCells(force?: boolean): void {
        const column = this.getColumn(ROW_HEADER_COLUMN_ID);

        if (!column) {
            return;
        }

        this.beans.colAutosize?.autoSizeCols({
            colKeys: [ROW_HEADER_COLUMN_ID],
            skipHeader: true,
            skipHeaderGroups: true,
            silent: true,
            source: 'rowHeaderColService',
        });

        this.beans.rowRenderer.refreshCells({
            columns: [column],
            force,
        });
    }

    private putRowHeaderColsFirstInList(list: AgColumn[], cols?: AgColumn[] | null): AgColumn[] | null {
        if (!cols) {
            return null;
        }
        // we use colId, and not instance, to remove old rowHeaderCols
        const colsFiltered = cols.filter((col) => !isRowHeaderCol(col));
        return [...list, ...colsFiltered];
    }

    private createRowHeaderColDef(def?: RowHeaderColumnDef): ColDef {
        const { gos } = this.beans;
        const rowHeaderColumnDef = def ?? gos.get('rowHeaderColumnDef');
        const enableRTL = gos.get('enableRtl');
        return {
            // overridable properties
            minWidth: 60,
            width: 60,
            resizable: false,
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
            headerClass: 'ag-header-row-header',
            valueGetter: (p) => (p.node?.rowIndex || 0) + 1,
            cellClass: this.getCellClass.bind(this),
            cellAriaRole: 'rowheader',
            // overrides
            ...rowHeaderColumnDef,
            // non-overridable properties
            colId: ROW_HEADER_COLUMN_ID,
        };
    }

    private getCellClass(params: CellClassParams): string[] {
        const { node } = params;
        const { rangeSvc, gos } = this.beans;
        const cssClasses = ['ag-header-row-cell'];
        const cellSelection = gos.get('cellSelection');

        if (!rangeSvc || !cellSelection || typeof cellSelection !== 'object' || !cellSelection.highlightHeaders) {
            return cssClasses;
        }

        const ranges = rangeSvc.getCellRanges();

        if (!ranges.length) {
            return cssClasses;
        }

        for (const range of ranges) {
            if (rangeSvc.isRowInRange(node.rowIndex!, node.rowPinned, range)) {
                cssClasses.push('ag-header-row-range-highlight');
                break;
            }
        }

        return cssClasses;
    }

    private generateRowHeaderCols(): AgColumn[] {
        const { gos, beans } = this;
        if (!_isRowHeaderColumnEnabled(gos)) {
            return [];
        }

        const colDef = this.createRowHeaderColDef();
        const colId = colDef.colId!;
        beans.validation?.validateColDef(colDef, colId, true);
        const col = new AgColumn(colDef, null, colId, false);
        this.createBean(col);
        return [col];
    }

    public override destroy(): void {
        _destroyColumnTree(this.beans, this.columns?.tree);
        super.destroy();
    }

    public refreshVisibility(source: ColumnEventType): void {
        const { gos, beans } = this;
        if (!_isRowHeaderColumnEnabled(gos)) {
            return;
        }

        const visibleColumns = beans.visibleCols.getAllTrees() ?? [];

        if (visibleColumns.length === 0) {
            return;
        }

        // check first: one or more columns showing -- none are row header column
        if (!visibleColumns.some(isLeafRowHeaderColumn)) {
            const existingState = _getColumnState(beans).find((state) => isRowHeaderCol(state.colId));

            if (existingState) {
                _applyColumnState(
                    beans,
                    {
                        state: [{ colId: existingState.colId, hide: !existingState.hide }],
                    },
                    source
                );
            }
        }

        // lastly, check only one column showing -- row header column
        if (visibleColumns.length === 1) {
            const firstColumn = visibleColumns[0];
            const leafCol = getLeafRowHeaderColumn(firstColumn);

            if (!leafCol) {
                return;
            }

            _applyColumnState(beans, { state: [{ colId: leafCol.getColId(), hide: true }] }, source);
        }
    }
}

const isLeafRowHeaderColumn = (c: AgColumn | AgColumnGroup): boolean =>
    c.isColumn ? isRowHeaderCol(c) : c.getChildren()?.some(isLeafRowHeaderColumn) ?? false;

function getLeafRowHeaderColumn(c: AgColumn | AgColumnGroup): AgColumn | null {
    if (c.isColumn) {
        return isRowHeaderCol(c) ? c : null;
    }

    const children = c.getChildren() ?? [];

    for (const child of children) {
        const col = getLeafRowHeaderColumn(child);
        if (col) {
            return col;
        }
    }

    return null;
}
