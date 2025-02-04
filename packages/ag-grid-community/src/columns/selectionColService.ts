import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { ColDef } from '../entities/colDef';
import type { GridOptions, SelectionColumnDef } from '../entities/gridOptions';
import type { ColumnEventType } from '../events';
import type { PropertyValueChangedEvent } from '../gridOptionsService';
import { _getCheckboxLocation, _getCheckboxes, _getHeaderCheckbox, _isRowSelection } from '../gridOptionsUtils';
import type { IColumnCollectionService } from '../interfaces/iColumnCollectionService';
import type { ColKey, ColumnCollections } from './columnModel';
import { _applyColumnState, _getColumnState } from './columnStateUtils';
import {
    SELECTION_COLUMN_ID,
    _areColIdsEqual,
    _columnsMatch,
    _convertColumnEventSourceType,
    _destroyColumnTree,
    _updateColsMap,
    isColumnSelectionCol,
} from './columnUtils';

export class SelectionColService extends BeanStub implements NamedBean, IColumnCollectionService {
    beanName = 'selectionColSvc' as const;

    public columns: ColumnCollections | null;

    public postConstruct(): void {
        this.addManagedPropertyListener('rowSelection', (event) => {
            this.onSelectionOptionsChanged(
                event.currentValue,
                event.previousValue,
                _convertColumnEventSourceType(event.source)
            );
        });

        this.addManagedPropertyListener('selectionColumnDef', this.updateColumns.bind(this));
    }

    public addColumns(cols: ColumnCollections): void {
        const selectionCols = this.columns;
        if (selectionCols == null) {
            return;
        }
        cols.list = selectionCols.list.concat(cols.list);
        cols.tree = selectionCols.tree.concat(cols.tree);
        _updateColsMap(cols);
    }

    public createColumns(
        cols: ColumnCollections,
        updateOrders: (callback: (cols: AgColumn[] | null) => AgColumn[] | null) => void
    ): void {
        const destroyCollection = () => {
            _destroyColumnTree(this.beans, this.columns?.tree);
            this.columns = null;
        };

        const newTreeDepth = cols.treeDepth;
        const oldTreeDepth = this.columns?.treeDepth ?? -1;
        const treeDepthSame = oldTreeDepth == newTreeDepth;

        const list = this.generateSelectionCols();
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

        const putSelectionColsFirstInList = (cols?: AgColumn[] | null): AgColumn[] | null => {
            if (!cols) {
                return null;
            }
            // we use colId, and not instance, to remove old selectionCols
            const colsFiltered = cols.filter((col) => !isColumnSelectionCol(col));
            return [...list, ...colsFiltered];
        };

        updateOrders(putSelectionColsFirstInList);
    }

    public updateColumns(event: PropertyValueChangedEvent<'selectionColumnDef'>): void {
        const source = _convertColumnEventSourceType(event.source);
        const current = event.currentValue;

        this.columns?.list.forEach((col) => {
            const newColDef = this.createSelectionColDef(current);
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

    public isSelectionColumnEnabled(): boolean {
        const { gos, beans } = this;
        const rowSelection = gos.get('rowSelection');
        if (typeof rowSelection !== 'object' || !_isRowSelection(gos)) {
            return false;
        }

        const hasAutoCols = (beans.autoColSvc?.getColumns()?.length ?? 0) > 0;

        if (rowSelection.checkboxLocation === 'autoGroupColumn' && hasAutoCols) {
            return false;
        }

        const checkboxes = !!_getCheckboxes(rowSelection);
        const headerCheckbox = _getHeaderCheckbox(rowSelection);

        return checkboxes || headerCheckbox;
    }

    private createSelectionColDef(def?: SelectionColumnDef): ColDef {
        const { gos } = this.beans;
        const selectionColumnDef = def ?? gos.get('selectionColumnDef');
        const enableRTL = gos.get('enableRtl');

        // We don't support row spanning in the selection column
        const { rowSpan: _, spanRows: __, ...filteredSelColDef } = (selectionColumnDef ?? {}) as ColDef;

        return {
            // overridable properties
            width: 50,
            resizable: false,
            suppressHeaderMenuButton: true,
            sortable: false,
            suppressMovable: true,
            lockPosition: enableRTL ? 'right' : 'left',
            comparator(valueA, valueB, nodeA, nodeB) {
                const aSelected = nodeA.isSelected();
                const bSelected = nodeB.isSelected();
                return aSelected === bSelected ? 0 : aSelected ? 1 : -1;
            },
            editable: false,
            suppressFillHandle: true,
            pinned: null,
            // overrides
            ...filteredSelColDef,
            // non-overridable properties
            colId: SELECTION_COLUMN_ID,
        };
    }

    private generateSelectionCols(): AgColumn[] {
        if (!this.isSelectionColumnEnabled()) {
            return [];
        }

        const colDef = this.createSelectionColDef();
        const colId = colDef.colId!;
        this.beans.validation?.validateColDef(colDef, colId, true);
        const col = new AgColumn(colDef, null, colId, false);
        this.createBean(col);
        return [col];
    }

    private onSelectionOptionsChanged(
        current: GridOptions['rowSelection'],
        prev: GridOptions['rowSelection'],
        source: ColumnEventType
    ) {
        const prevCheckbox = prev && typeof prev !== 'string' ? _getCheckboxes(prev) : undefined;
        const currCheckbox = current && typeof current !== 'string' ? _getCheckboxes(current) : undefined;
        const checkboxHasChanged = prevCheckbox !== currCheckbox;

        const prevHeaderCheckbox = prev && typeof prev !== 'string' ? _getHeaderCheckbox(prev) : undefined;
        const currHeaderCheckbox = current && typeof current !== 'string' ? _getHeaderCheckbox(current) : undefined;
        const headerCheckboxHasChanged = prevHeaderCheckbox !== currHeaderCheckbox;

        const currLocation = _getCheckboxLocation(current);
        const prevLocation = _getCheckboxLocation(prev);
        const locationChanged = currLocation !== prevLocation;

        if (checkboxHasChanged || headerCheckboxHasChanged || locationChanged) {
            this.beans.colModel.refreshAll(source);
        }
    }

    public override destroy(): void {
        _destroyColumnTree(this.beans, this.columns?.tree);
        super.destroy();
    }

    public refreshVisibility(source: ColumnEventType): void {
        if (!this.isSelectionColumnEnabled()) {
            return;
        }

        const beans = this.beans;
        const visibleColumns = beans.visibleCols.getAllTrees() ?? [];

        if (visibleColumns.length === 0) {
            return;
        }

        // check first: one or more columns showing -- none are selection column
        if (!visibleColumns.some(isLeafColumnSelectionCol)) {
            const existingState = _getColumnState(beans).find((state) => isColumnSelectionCol(state.colId));

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

        // lastly, check only one column showing -- selection column
        if (visibleColumns.length === 1) {
            const firstColumn = visibleColumns[0];
            const leafSelectionCol = getLeafColumnSelectionCol(firstColumn);

            if (!leafSelectionCol) {
                return;
            }

            _applyColumnState(beans, { state: [{ colId: leafSelectionCol.getColId(), hide: true }] }, source);
        }
    }
}

const isLeafColumnSelectionCol = (c: AgColumn | AgColumnGroup): boolean =>
    c.isColumn ? isColumnSelectionCol(c) : c.getChildren()?.some(isLeafColumnSelectionCol) ?? false;

function getLeafColumnSelectionCol(c: AgColumn | AgColumnGroup): AgColumn | null {
    if (c.isColumn) {
        return isColumnSelectionCol(c) ? c : null;
    }

    const children = c.getChildren() ?? [];

    for (const child of children) {
        const selCol = getLeafColumnSelectionCol(child);
        if (selCol) {
            return selCol;
        }
    }

    return null;
}
