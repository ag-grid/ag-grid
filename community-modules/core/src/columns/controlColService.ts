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
        // enable only if selectionOptions.headerCheckbox or selectionOptions.checkboxSelection
        const colDef: ColDef = {
            colId: 'CONTROL_AUTO_COLUMN',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            suppressMovable: true,
            lockPosition: 'left',
            suppressHeaderMenuButton: true,
            sortable: false,
            width: 50,
            pinned: 'left',
            lockPinned: true,
        };
        const col = new AgColumn(colDef, null, colDef.colId!, false);
        this.createBean(col);
        return [col];
    }

    updateControlCols(autoGroupCols: AgColumn<any>[], source: ColumnEventType): void {}
}
