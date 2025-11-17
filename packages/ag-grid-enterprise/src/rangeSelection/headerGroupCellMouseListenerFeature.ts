import { BeanStub } from 'ag-grid-community';
import type { AgColumnGroup } from 'ag-grid-community';

export class HeaderGroupCellMouseListenerFeature extends BeanStub {
    constructor(
        private readonly column: AgColumnGroup,
        private readonly eGui: HTMLElement
    ) {
        super();
    }

    public postConstruct() {
        this.addManagedElementListeners(this.eGui, {
            click: (e) => e && this.onClick(e),
        });
    }

    private onClick(event: MouseEvent): void {
        const { rangeSvc } = this.beans;

        if (event.ctrlKey || event.metaKey) {
            rangeSvc?.handleColumnSelection(this.column, event);
        }
    }
}
