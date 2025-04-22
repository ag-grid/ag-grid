import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { GridOptions, SelectionColumnDef } from '../entities/gridOptions';
import type { ColumnEventType } from '../events';
import type { PropertyValueChangedEvent } from '../gridOptionsService';
import { _getCheckboxLocation, _getCheckboxes, _getHeaderCheckbox, _isRowSelection } from '../gridOptionsUtils';
import type { IColumnCollectionService } from '../interfaces/iColumnCollectionService';
import { _removeFromArray } from '../utils/array';
import type { ColKey, ColumnCollections } from './columnModel';
import { _applyColumnState } from './columnStateUtils';
import {
    ROW_NUMBERS_COLUMN_ID,
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

        this.columns?.list.forEach((col) => {
            const newColDef = this.createSelectionColDef(event.currentValue);
            col.setColDef(newColDef, null, source);
            _applyColumnState(this.beans, { state: [{ ...newColDef, colId: col.getColId() }] }, source);
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
            chartDataType: 'excluded',
        };
    }

    private generateSelectionCols(): AgColumn[] {
        if (!this.isSelectionColumnEnabled()) {
            return [];
        }

        const colDef = this.createSelectionColDef();
        const colId = colDef.colId!;
        this.gos.validateColDef(colDef, colId, true);
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

    /**
     * Refreshes visibility of the selection column based on which columns are currently visible.
     * Called by the VisibleColsService with the columns that are currently visible in left/center/right
     * containers. This method *MUTATES* those arrays directly.
     *
     * The selection column should be visible if all of the following are true
     * - The selection column is not disabled
     * - The number of visible columns excluding the selection column and row numbers column is greater than 0
     * @param leftCols Visible columns in the left-pinned container
     * @param centerCols Visible columns in the center viewport
     * @param rightCols Visible columns in the right-pinned container
     */
    public refreshVisibility(leftCols: AgColumn[], centerCols: AgColumn[], rightCols: AgColumn[]): void {
        // columns list will only be populated if selection column is enabled
        if (!this.columns?.list.length) {
            return;
        }

        const numVisibleCols = leftCols.length + centerCols.length + rightCols.length;
        if (numVisibleCols === 0) {
            return;
        }

        // There's only one selection column
        const column = this.columns.list[0]!;

        // If it's deliberately hidden, we needn't do anything
        if (!column.isVisible()) return;

        const hideSelectionCol = () => {
            let cols;
            switch (column.pinned) {
                case 'left':
                case true:
                    cols = leftCols;
                    break;
                case 'right':
                    cols = rightCols;
                    break;
                default:
                    cols = centerCols;
            }
            cols && _removeFromArray(cols, column);
        };

        const rowNumbersCol = this.beans.rowNumbersSvc?.getColumn(ROW_NUMBERS_COLUMN_ID);

        // two conditions for which we hide selection column:
        //   1. Only selection column and row numbers column are visible
        //   2. Only selection column is visible
        const expectedNumCols = rowNumbersCol ? 2 : 1;
        if (expectedNumCols === numVisibleCols) {
            hideSelectionCol();
        }
    }
}
