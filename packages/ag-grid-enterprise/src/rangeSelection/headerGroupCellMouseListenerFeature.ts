import { BeanStub, _getSuppressColumnSelection } from 'ag-grid-community';
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
        const { gos, rangeSvc } = this.beans;
        const suppressColumnSelection = _getSuppressColumnSelection(gos);
        const usingModifierKey = event.ctrlKey || event.metaKey;
        const allowColumnSelection = !suppressColumnSelection && usingModifierKey;

        if (allowColumnSelection) {
            rangeSvc?.handleColumnSelection(this.column, event);
        }
    }
}
