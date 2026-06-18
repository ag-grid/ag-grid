import type { NamedBean } from '../context/bean';
import type { ColKind } from '../entities/agColumn';
import type { ColDef, SortComparatorFn } from '../entities/colDef';
import type { GridOptions } from '../entities/gridOptions';
import type { ColumnEventType } from '../events';
import type { PropertyValueChangedEvent } from '../gridOptionsService';
import { _getCheckboxLocation, _getCheckboxes, _getHeaderCheckbox, _isRowSelection } from '../gridOptionsUtils';
import { BaseSingleColService } from './baseSingleColService';
import { SELECTION_COLUMN_ID, _convertColumnEventSourceType } from './columnUtils';

export class SelectionColService extends BaseSingleColService implements NamedBean {
    beanName = 'selectionColSvc' as const;

    protected readonly colKind: ColKind = 'selection';

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

    public updateColumns(event: PropertyValueChangedEvent<'selectionColumnDef'>): void {
        this.refreshColDef(_convertColumnEventSourceType(event.source));
    }

    public isEnabled(): boolean {
        const { gos, beans } = this;
        const rowSelection = gos.get('rowSelection');
        if (typeof rowSelection !== 'object' || !_isRowSelection(gos)) {
            return false;
        }

        if (rowSelection.checkboxLocation === 'autoGroupColumn' && !!beans.autoColSvc?.columns.length) {
            return false;
        }

        const checkboxes = !!_getCheckboxes(rowSelection);
        const headerCheckbox = _getHeaderCheckbox(rowSelection);

        return checkboxes || headerCheckbox;
    }

    protected createColDef(): ColDef {
        const { gos } = this;
        const selectionColumnDef = gos.get('selectionColumnDef');
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
            comparator: selectionComparator,
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
}

const selectionComparator: SortComparatorFn = (_valueA, _valueB, nodeA, nodeB) => {
    const aSelected = nodeA.isSelected();
    const bSelected = nodeB.isSelected();
    return aSelected === bSelected ? 0 : aSelected ? 1 : -1;
};
