import { BeanStub } from '../context/beanStub';
import type { BeanName } from '../context/context';
import type { Column } from '../entities/column';
import type { ColumnHoverChangedEvent} from '../events';
import { Events } from '../events';
import type { WithoutGridCommon } from '../interfaces/iCommon';

export class ColumnHoverService extends BeanStub {
    static BeanName: BeanName = 'columnHoverService';

    private selectedColumns: Column[] | null;

    public setMouseOver(columns: Column[]): void {
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

    public isHovered(column: Column): boolean {
        return !!this.selectedColumns && this.selectedColumns.indexOf(column) >= 0;
    }
}
