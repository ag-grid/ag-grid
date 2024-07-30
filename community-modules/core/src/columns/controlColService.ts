import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { ColumnEventType } from '../events';

export interface IControlColService {
    createControlCols(): AgColumn[];

    updateControlCols(autoGroupCols: AgColumn[], source: ColumnEventType): void;
}

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
            const checkboxSelection =
                typeof so.checkboxSelection === 'boolean'
                    ? so.checkboxSelection
                    : so.checkboxSelection?.displayCheckbox;

            const headerCheckbox = so.mode === 'multiRow' && so.headerCheckbox ? so.headerCheckbox : undefined;

            const colDef: ColDef = {
                colId: 'CONTROL_AUTO_COLUMN',
                checkboxSelection,
                headerCheckboxSelection: headerCheckbox,
                suppressMovable: true,
                lockPosition: enableRTL ? 'right' : 'left',
                sortable: false,
                width: 50,
            };
            const col = new AgColumn(colDef, null, colDef.colId!, false);
            this.createBean(col);
            return [col];
        }

        return [];
    }

    updateControlCols(autoGroupCols: AgColumn<any>[], source: ColumnEventType): void {}
}
