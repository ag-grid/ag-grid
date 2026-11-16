import { _addManagedElementListeners } from 'ag-stack';

import type { AgColumnGroup } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

export class HeaderGroupCellMouseListenerFeature extends BeanStub {
    constructor(
        private readonly column: AgColumnGroup,
        private readonly eGui: HTMLElement
    ) {
        super();
    }

    public postConstruct() {
        _addManagedElementListeners(this, this.eGui, {
            click: (e) => e && this.onClick(e),
        });
    }

    private onClick(event: MouseEvent): void {
        this.beans.rangeSvc?.handleColumnSelection(this.column, event);
    }
}
