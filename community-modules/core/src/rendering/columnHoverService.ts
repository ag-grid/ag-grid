import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { ColumnHoverChangedEvent } from '../events';
import type { WithoutGridCommon } from '../interfaces/iCommon';

export class ColumnHoverService extends BeanStub implements NamedBean {
    beanName = 'columnHoverService' as const;

    private selectedColumns: AgColumn[] | null;

    public setMouseOver(columns: AgColumn[]): void {
        this.selectedColumns = columns;
        const event: WithoutGridCommon<ColumnHoverChangedEvent> = {
            type: 'columnHoverChanged',
        };
        this.eventService.dispatchEvent(event);
    }

    public clearMouseOver(): void {
        this.selectedColumns = null;
        const event: WithoutGridCommon<ColumnHoverChangedEvent> = {
            type: 'columnHoverChanged',
        };
        this.eventService.dispatchEvent(event);
    }

    public isHovered(column: AgColumn): boolean {
        return !!this.selectedColumns && this.selectedColumns.indexOf(column) >= 0;
    }
}
