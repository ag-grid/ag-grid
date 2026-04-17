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
    ROW_NUMBERS_COLUMN_ID,
    SELECTION_COLUMN_ID,
    _areColIdsEqual,
    _convertColumnEventSourceType,
    _getColumnStateFromColDef,
} from './columnUtils';

export class SelectionColService extends BeanStub implements NamedBean {
    beanName = 'selectionColSvc' as const;

    public columns: AgColumn[] = [];

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

    public createColumns(): boolean {
        const list = this.generateSelectionCols();
        if (_areColIdsEqual(list, this.columns)) {
            return false;
        }

        this.beans.context.destroyBeans(this.columns);
        this.columns = list;
        return true;
    }

    public updateColumns(event: PropertyValueChangedEvent<'selectionColumnDef'>): void {
        const source = _convertColumnEventSourceType(event.source);
        const { beans } = this;
        for (const col of this.columns) {
            const colDef = this.createSelectionColDef(event.currentValue);
            col.setColDef(colDef, null, source);

            _applyColumnState(beans, { state: [_getColumnStateFromColDef(colDef, col.colId)] }, source);
        }
    }

    public isSelectionColumnEnabled(): boolean {
        const { gos, beans } = this;
        const rowSelection = gos.get('rowSelection');
        if (typeof rowSelection !== 'object' || !_isRowSelection(gos)) {
            return false;
        }

        const hasAutoCols = !!beans.autoColSvc?.columns.length;

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
        if (!this.columns.length) {
            return;
        }

        const numVisibleCols = leftCols.length + centerCols.length + rightCols.length;
        if (numVisibleCols === 0) {
            return;
        }

        // There's only one selection column
        const column = this.columns[0];

        // If it's deliberately hidden, we needn't do anything
        if (!column.isVisible()) {
            return;
        }

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
            if (cols) {
                _removeFromArray(cols, column);
            }
        };

        const rowNumbersCol = this.beans.colModel.getCol(ROW_NUMBERS_COLUMN_ID);

        // two conditions for which we hide selection column:
        //   1. Only selection column and row numbers column are visible
        //   2. Only selection column is visible
        const expectedNumCols = rowNumbersCol ? 2 : 1;
        if (expectedNumCols === numVisibleCols) {
            hideSelectionCol();
        }
    }
}
