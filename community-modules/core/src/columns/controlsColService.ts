import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import { _getCheckboxes, _getHeaderCheckbox } from '../gridOptionsUtils';

export interface IControlsColService {
    createControlsCols(): AgColumn[];
}

export const CONTROLS_COLUMN_ID_PREFIX = 'ag-Grid-ControlsColumn' as const;

export class ControlsColService extends BeanStub implements NamedBean, IControlsColService {
    beanName = 'controlsColService' as const;

    public createControlsCols(): AgColumn[] {
        const so = this.gos.get('rowSelection');
        if (!so || typeof so === 'string') {
            return [];
        }

        const checkboxes = _getCheckboxes(so);
        const headerCheckbox = _getHeaderCheckbox(so);

        if (checkboxes || headerCheckbox) {
            const selectionColumnDef = this.gos.get('selectionColumnDef');
            const enableRTL = this.gos.get('enableRtl');
            const colDef: ColDef = {
                // overridable properties
                maxWidth: 50,
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
                colId: `${CONTROLS_COLUMN_ID_PREFIX}`,
            };
            const col = new AgColumn(colDef, null, colDef.colId!, false);
            this.createBean(col);
            return [col];
        }

        return [];
    }
}
