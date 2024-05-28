import { BeanStub } from '../context/beanStub';
import type { BeanName } from '../context/context';
import type { InternalColumn } from '../entities/column';
import type { ColumnHoverChangedEvent } from '../events';
import { Events } from '../events';
import type { WithoutGridCommon } from '../interfaces/iCommon';

export class ColumnHoverService extends BeanStub {
    beanName: BeanName = 'columnHoverService';

    private selectedColumns: InternalColumn[] | null;

    public setMouseOver(columns: InternalColumn[]): void {
        this.selectedColumns = columns;
        const event: WithoutGridCommon<ColumnHoverChangedEvent> = {
            type: Events.EVENT_COLUMN_HOVER_CHANGED,
        };
        this.eventService.dispatchEvent(event);
    }

    public clearMouseOver(): void {
        this.selectedColumns = null;
        const event: WithoutGridCommon<ColumnHoverChangedEvent> = {
            type: Events.EVENT_COLUMN_HOVER_CHANGED,
        };
        this.eventService.dispatchEvent(event);
    }

    public isHovered(column: InternalColumn): boolean {
        return !!this.selectedColumns && this.selectedColumns.indexOf(column) >= 0;
    }
}
