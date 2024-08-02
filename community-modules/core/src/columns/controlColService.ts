import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { ColumnEventType } from '../events';

export interface IControlColService {
    createControlCols(): AgColumn[];

    updateControlCols(autoGroupCols: AgColumn[], source: ColumnEventType): void;
}

export const CONTROL_COLUMN_ID_PREFIX = 'ag-Grid-ControlColumn' as const;

export class ControlColService extends BeanStub implements NamedBean, IControlColService {
    beanName = 'controlColService' as const;

    public createControlCols(): AgColumn[] {
        const so = this.gos.get('selectionOptions');
        const enableRTL = this.gos.get('enableRtl');

        if (!so) {
            return [];
        }

        if (so.mode === 'cell') {
            return [];
        }

        if (so.checkboxSelection || (so.mode === 'multiRow' && so.headerCheckbox)) {
            const colDef: ColDef = {
                colId: `${CONTROL_COLUMN_ID_PREFIX}`,
                suppressMovable: true,
                lockPosition: enableRTL ? 'right' : 'left',
                sortable: false,
                maxWidth: 90,
            };
            const col = new AgColumn(colDef, null, colDef.colId!, false);
            this.createBean(col);
            return [col];
        }

        return [];
    }

    updateControlCols(autoGroupCols: AgColumn<any>[], source: ColumnEventType): void {}
}
