import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';

export interface IControlColService {
    createControlCols(): AgColumn[];
}

export const CONTROL_COLUMN_ID_PREFIX = 'ag-Grid-ControlColumn' as const;

export class ControlColService extends BeanStub implements NamedBean, IControlColService {
    beanName = 'controlColService' as const;

    public createControlCols(): AgColumn[] {
        const so = this.gos.get('selection');
        const controlColDef = this.gos.get('controlsColDef');
        const enableRTL = this.gos.get('enableRtl');

        if (!so) {
            return [];
        }

        if (so.mode === 'cell') {
            return [];
        }

        const checkboxes = so.checkboxes ?? true;
        const headerCheckbox = so.mode === 'multiRow' ? so.headerCheckbox ?? true : false;

        if (checkboxes || headerCheckbox) {
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
                suppressFillHandle: true,
                // overrides
                ...controlColDef,
                // non-overridable properties
                colId: `${CONTROL_COLUMN_ID_PREFIX}`,
            };
            const col = new AgColumn(colDef, null, colDef.colId!, false);
            this.createBean(col);
            return [col];
        }

        return [];
    }
}
