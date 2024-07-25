import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';

export class ColumnHoverService extends BeanStub implements NamedBean {
    beanName = 'columnHoverService' as const;

    private selectedColumns: AgColumn[] | null;

    public setMouseOver(columns: AgColumn[]): void {
        this.updateState(columns);
    }

    public clearMouseOver(): void {
        this.updateState(null);
    }

    public isHovered(column: AgColumn): boolean {
        return !!this.selectedColumns && this.selectedColumns.indexOf(column) >= 0;
    }

    private updateState(columns: AgColumn[] | null): void {
        this.selectedColumns = columns;
        this.eventService.dispatchEvent<'columnHoverChanged'>({
            type: 'columnHoverChanged',
        });
    }
}
