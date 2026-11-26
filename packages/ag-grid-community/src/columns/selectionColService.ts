import type { NamedBean } from '../context/bean';
import type { ColKind } from '../entities/agColumn';
import type { ColDef, SortComparatorFn } from '../entities/colDef';
import type { GridOptions } from '../entities/gridOptions';
import { _getCheckboxLocation, _getCheckboxes, _getHeaderCheckbox, _isRowSelection } from '../gridOptionsUtils';
import { BaseSingleColService } from './baseSingleColService';
import { SELECTION_COLUMN_ID } from './columnUtils';

export class SelectionColService extends BaseSingleColService implements NamedBean {
    beanName = 'selectionColSvc' as const;

    protected readonly colKind: ColKind = 'selection';

    /** The `rowSelection` the column was last derived from. */
    private appliedRowSelection: GridOptions['rowSelection'];

    public postConstruct(): void {
        this.appliedRowSelection = this.gos.get('rowSelection');
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
            initialWidth: 50,
            resizable: false,
            suppressHeaderMenuButton: true,
            sortable: false,
            suppressMovable: true,
            lockPosition: enableRTL ? 'right' : 'left',
            comparator: selectionComparator,
            editable: false,
            suppressFillHandle: true,
            suppressAutoSize: true,
            // sized statically, as its docs say
            suppressSizeToFit: true,
            // overrides
            ...filteredSelColDef,
            // non-overridable properties
            colId: SELECTION_COLUMN_ID,
            chartDataType: 'excluded',
        };
    }

    public addOptionKeysTo(keys: Set<keyof GridOptions>): void {
        keys.add('rowSelection');
    }

    /** Follows an options change, reading `rowSelection`; whether the selection column must be refreshed for it. */
    public applyOptions(changedProps: ReadonlySet<keyof GridOptions>): boolean {
        if (!changedProps.has('rowSelection')) {
            return false;
        }
        const prev = this.appliedRowSelection;
        const current = this.gos.get('rowSelection');
        this.appliedRowSelection = current;
        const prevCheckbox = prev && typeof prev !== 'string' ? _getCheckboxes(prev) : undefined;
        const currCheckbox = current && typeof current !== 'string' ? _getCheckboxes(current) : undefined;
        const checkboxHasChanged = prevCheckbox !== currCheckbox;

        const prevHeaderCheckbox = prev && typeof prev !== 'string' ? _getHeaderCheckbox(prev) : undefined;
        const currHeaderCheckbox = current && typeof current !== 'string' ? _getHeaderCheckbox(current) : undefined;
        const headerCheckboxHasChanged = prevHeaderCheckbox !== currHeaderCheckbox;

        const currLocation = _getCheckboxLocation(current);
        const prevLocation = _getCheckboxLocation(prev);
        const locationChanged = currLocation !== prevLocation;

        return checkboxHasChanged || headerCheckboxHasChanged || locationChanged;
    }
}

const selectionComparator: SortComparatorFn = (_valueA, _valueB, nodeA, nodeB) => {
    const aSelected = nodeA.isSelected();
    const bSelected = nodeB.isSelected();
    return aSelected === bSelected ? 0 : aSelected ? 1 : -1;
};
