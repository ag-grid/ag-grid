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
        const { gos, rangeSvc } = this.beans;
        const suppressColumnSelection = _getSuppressColumnSelection(gos);

        if (!suppressColumnSelection && (event.ctrlKey || event.metaKey)) {
            rangeSvc?.handleColumnSelection(this.column, event);
        }
    }
}
