import { AgColumn, BeanStub, IRowNode } from 'ag-grid-community';

export class AdvancedFilterService extends BeanStub {
    constructor() {
        super();
    }

    public getColumnValue(column: AgColumn, row: IRowNode) {
        const val = this.beans.filterValueSvc?.getValue(column);
    }
}
