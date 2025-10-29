import { BeanStub } from '../../../context/beanStub';
import type { AgColumnGroup } from '../../../entities/agColumnGroup';
import { _getHeaderCellSelection } from '../../../gridOptionsUtils';

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
        const headerCellSelection = _getHeaderCellSelection(gos);

        if (headerCellSelection && (event.ctrlKey || event.metaKey)) {
            rangeSvc?.handleColumnSelection(this.column, event);
        }
    }
}
