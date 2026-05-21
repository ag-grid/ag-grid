import { _removeFromArray } from '../agStack/utils/array';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { GridOptions, SelectionColumnDef } from '../entities/gridOptions';
import type { ColumnEventType } from '../events';
import type { PropertyValueChangedEvent } from '../gridOptionsService';
import { _getCheckboxLocation, _getCheckboxes, _getHeaderCheckbox, _isRowSelection } from '../gridOptionsUtils';
import { _applyColumnState } from './columnStateUtils';
import {
    SELECTION_COLUMN_ID,
    _convertColumnEventSourceType,
    _destroyColIfAlive,
    _getColumnStateFromColDef,
} from './columnUtils';

export class SelectionColService extends BeanStub implements NamedBean {
    beanName = 'selectionColSvc' as const;

    /** The selection column, or null when selection is not enabled.
     *  Only ever 0 or 1 column — singular by design, no array allocation. */
    public column: AgColumn | null = null;

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

    /** Generate or destroy the selection column based on current options. */
    public refreshCols(): void {
        const want = this.isSelectionColumnEnabled();
        const have = !!this.column;
        if (want === have) {
            return;
        }
        if (want) {
            const colDef = this.createSelectionColDef();
            const colId = colDef.colId!;
            this.gos.validateColDef(colDef, colId, true);
            const col = new AgColumn(colDef, null, colId, false);
            this.createBean(col);
            this.column = col;
        } else {
            const existing = this.column;
            this.column = null;
            _destroyColIfAlive(existing);
        }
    }

    public updateColumns(event: PropertyValueChangedEvent<'selectionColumnDef'>): void {
        const col = this.column;
        if (!col) {
            return;
        }
        const source = _convertColumnEventSourceType(event.source);
        const colDef = this.createSelectionColDef(event.currentValue);
        col.setColDef(colDef, null, source);
        _applyColumnState(this.beans, { state: [_getColumnStateFromColDef(colDef, col.colId)] }, source);
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
        const { gos } = this;
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
            suppressAutoSize: true,
            pinned: null,
            // overrides
            ...filteredSelColDef,
            // non-overridable properties
            colId: SELECTION_COLUMN_ID,
            chartDataType: 'excluded',
        };
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
        const existing = this.column;
        this.column = null;
        _destroyColIfAlive(existing);
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
     */
    public refreshVisibility(leftCols: AgColumn[], centerCols: AgColumn[], rightCols: AgColumn[]): void {
        const column = this.column;
        if (!column) {
            return;
        }

        const numVisibleCols = leftCols.length + centerCols.length + rightCols.length;
        if (numVisibleCols === 0 || !column.visible) {
            return;
        }

        const rowNumbersCol = this.beans.rowNumbersSvc?.column;

        // two conditions for which we hide selection column:
        //   1. Only selection column and row numbers column are visible
        //   2. Only selection column is visible
        const expectedNumCols = rowNumbersCol ? 2 : 1;
        if (expectedNumCols !== numVisibleCols) {
            return;
        }

        let cols: AgColumn[];
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
        _removeFromArray(cols, column);
    }
}
