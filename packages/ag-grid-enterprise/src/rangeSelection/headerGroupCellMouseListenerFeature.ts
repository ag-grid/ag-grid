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
        const { gos, editSvc, rangeSvc } = this.beans;
        const suppressColumnSelection = _getSuppressColumnSelection(gos);
        const editingFormulas = gos.get('enableFormulas') && editSvc?.isEditing();
        const usingModifierKey = event.ctrlKey || event.metaKey;

        // When editing formulas, we don't require modifier keys to select columns (i.e. click selects the column)
        // Otherwise, we require CTRL/CMD-click
        const allowColumnSelection = !suppressColumnSelection && (editingFormulas || usingModifierKey);

        if (allowColumnSelection) {
            rangeSvc?.handleColumnSelection(this.column, event);
        }
    }
}
