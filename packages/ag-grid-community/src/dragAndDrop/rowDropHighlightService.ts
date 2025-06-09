import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { RowNode } from '../entities/rowNode';
import type { IRowDropHighlightService, RowDropHighlightPosition } from '../interfaces/IRowDropHighlightService';

export class RowDropHighlightService extends BeanStub implements NamedBean, IRowDropHighlightService {
    beanName = 'rowDropHighlightSvc' as const;

    public row: RowNode | null = null;
    public position: RowDropHighlightPosition = 'none';

    public postConstruct(): void {
        this.addManagedEventListeners({
            modelUpdated: this.onModelUpdated.bind(this),
        });
    }

    private onModelUpdated(): void {
        if (this.row?.rowIndex === null) {
            this.clear(); // Clear the highlight if the row was removed
        }
    }

    public override destroy(): void {
        this.clear();
        super.destroy();
    }

    public clear(): void {
        const last = this.row;
        if (last) {
            this.position = 'none';
            last.dispatchRowEvent('rowHighlightChanged');
            this.row = null;
        }
    }

    public set(row: RowNode, position: RowDropHighlightPosition): void {
        const nodeChanged = row !== this.row;
        const highlightChanged = position !== this.position;
        if (nodeChanged || highlightChanged) {
            if (nodeChanged) {
                this.clear();
            }
            this.position = position;
            this.row = row;
            row.dispatchRowEvent('rowHighlightChanged');
        }
    }
}
