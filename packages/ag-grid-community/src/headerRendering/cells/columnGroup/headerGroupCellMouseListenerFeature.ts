import { BeanStub } from '../../../context/beanStub';
import type { AgColumnGroup } from '../../../entities/agColumnGroup';
import { _getSuppressColumnSelection } from '../../../gridOptionsUtils';

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

    public onClick(event: MouseEvent): void {
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
