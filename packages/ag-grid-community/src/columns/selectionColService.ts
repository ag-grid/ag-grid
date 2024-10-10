import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import { _getCheckboxes, _getHeaderCheckbox } from '../gridOptionsUtils';
import { isColumnSelectionCol } from './columnUtils';

export const CONTROLS_COLUMN_ID_PREFIX = 'ag-Grid-SelectionColumn' as const;

export class SelectionColService extends BeanStub implements NamedBean {
    beanName = 'selectionColService' as const;

    public createSelectionCols(): AgColumn[] {
        const { gos } = this;
        const so = gos.get('rowSelection');
        if (!so || typeof so !== 'object') {
            return [];
        }

        const checkboxes = _getCheckboxes(so);
        const headerCheckbox = _getHeaderCheckbox(so);

        if (checkboxes || headerCheckbox) {
            const selectionColumnDef = gos.get('selectionColumnDef');
            const enableRTL = gos.get('enableRtl');
            const colDef: ColDef = {
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
                    return aSelected && bSelected ? 0 : aSelected ? 1 : -1;
                },
                editable: false,
                suppressFillHandle: true,
                // overrides
                ...selectionColumnDef,
                // non-overridable properties
                colId: CONTROLS_COLUMN_ID_PREFIX,
            };
            const col = new AgColumn(colDef, null, colDef.colId!, false);
            this.createBean(col);
            return [col];
        }

        return [];
    }

    public putSelectionColsFirstInList(list: AgColumn[], cols?: AgColumn[] | null): AgColumn[] | null {
        if (!cols) {
            return null;
        }
        // we use colId, and not instance, to remove old selectionCols
        const colsFiltered = cols.filter((col) => !isColumnSelectionCol(col));
        return [...list, ...colsFiltered];
    }
}
