import { BeanStub } from '../../../context/beanStub';
import type { AgColumn } from '../../../entities/agColumn';

export class HeaderCellMouseListenerFeature extends BeanStub {
    private lastMovingChanged = 0;

    constructor(
        private readonly column: AgColumn,
        private readonly eGui: HTMLElement
    ) {
        super();
    }

    public postConstruct() {
        this.addManagedElementListeners(this.eGui, {
            click: (e) => e && this.onClick(e),
        });

        this.addManagedListeners(this.column, {
            movingChanged: () => {
                this.lastMovingChanged = Date.now();
            },
        });
    }

    public onClick(event: MouseEvent): void {
        const { sortSvc, rangeSvc } = this.beans;

        if (event.ctrlKey || event.metaKey) {
            rangeSvc?.handleColumnSelection(this.column, event);
        } else if (this.column.isSortable()) {
            // sometimes when moving a column via dragging, this was also firing a clicked event.
            // here is issue raised by user: https://ag-grid.zendesk.com/agent/tickets/1076
            // this check stops sort if a) column is moving or b) column moved less than 200ms ago (so caters for race condition)
            const moving = this.column.isMoving();
            const nowTime = Date.now();
            // typically there is <2ms if moving flag was set recently, as it would be done in same VM turn
            const movedRecently = nowTime - this.lastMovingChanged < 50;
            const columnMoving = moving || movedRecently;

            if (!columnMoving) {
                sortSvc?.progressSortFromEvent(this.column, event);
            }
        }
    }
}
